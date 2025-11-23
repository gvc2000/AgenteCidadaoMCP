import axios, { AxiosInstance } from 'axios';
import pRetry from 'p-retry';
import http from 'http';
import https from 'https';
import { CONFIG } from '../config.js';
import { CamaraAPIError, isRetryableError, createInformativeAPIError } from '../core/errors.js';
import { simplifyParams } from '../core/validation-utils.js';
import { logger, logAPIRequest, logError } from '../core/logging.js';
import { circuitBreaker } from '../core/circuit-breaker.js';
import { rateLimiter } from '../core/rate-limiter.js';
import { requestQueue } from '../core/queue.js';
import { metricsCollector } from '../core/metrics.js';
import { cacheManager } from '../core/cache.js';

export class CamaraAPIClient {
  private client: AxiosInstance;
  private baseURL: string;
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor() {
    this.baseURL = CONFIG.api.baseUrl;

    // Configurar agentes com Keep-Alive para reutilizar conexões TCP
    const httpAgent = new http.Agent({ keepAlive: true });
    const httpsAgent = new https.Agent({ keepAlive: true });

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: CONFIG.api.timeout,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MCP-Camara-BR/1.0'
      },
      httpAgent,
      httpsAgent
    });

    // Interceptor de resposta para tratar erros
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new CamaraAPIError(
            `API Error: ${error.response.statusText}`,
            error.response.status,
            error.config?.url,
            error.response.data
          );
        } else if (error.request) {
          throw new CamaraAPIError(
            'No response received from API',
            undefined,
            error.config?.url,
            error.message
          );
        } else {
          throw new CamaraAPIError(
            `Request setup error: ${error.message}`,
            undefined,
            error.config?.url
          );
        }
      }
    );
  }

  private getRequestKey(endpoint: string, params?: Record<string, any>): string {
    return `${endpoint}:${JSON.stringify(params || {})}`;
  }

  private getCacheCategory(endpoint: string): string | undefined {
    // Casos específicos
    if (endpoint.endsWith('/despesas')) return 'despesas';
    if (endpoint.endsWith('/discursos')) return 'discursos'; // Se houver categoria discursos
    if (endpoint.endsWith('/eventos')) return 'eventos';
    if (endpoint.endsWith('/frentes')) return 'frentes';
    if (endpoint.endsWith('/orgaos')) return 'orgaos';
    if (endpoint.endsWith('/ocupacoes')) return 'deputados'; // Parte do perfil
    if (endpoint.endsWith('/profissoes')) return 'deputados'; // Parte do perfil

    // Casos gerais baseados no primeiro segmento
    const firstSegment = endpoint.split('/')[1]; // /deputados/123 -> deputados

    const validCategories = [
      'deputados', 'proposicoes', 'votacoes', 'eventos',
      'orgaos', 'frentes', 'partidos', 'blocos',
      'legislaturas', 'referencias', 'analises'
    ];

    if (validCategories.includes(firstSegment)) {
      return firstSegment;
    }

    return undefined;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const requestKey = this.getRequestKey(endpoint, params);

    // 1. Check Cache
    const category = this.getCacheCategory(endpoint);
    if (category) {
      const cached = cacheManager.get<T>(category, requestKey);
      if (cached) {
        // Injetar metadados de cache se for objeto
        if (typeof cached === 'object' && cached !== null) {
          return {
            ...cached,
            _metadata: {
              ...(cached as any)._metadata,
              cache: true,
              cacheTimestamp: Date.now() // Aproximado
            }
          };
        }
        return cached;
      }
    }

    // 2. Request Deduplication (Coalescing)
    if (this.pendingRequests.has(requestKey)) {
      logger.debug({ endpoint, params }, 'Reusing pending request (deduplication)');
      return this.pendingRequests.get(requestKey) as Promise<T>;
    }

    const requestPromise = (async () => {
      const startTime = Date.now();

      try {
        // Rate limiting
        await rateLimiter.acquire();

        // Queue management
        const result = await requestQueue.add(async () => {
          // Circuit breaker
          return await circuitBreaker.execute(endpoint, async () => {
            // Retry logic
            return await pRetry(
              async () => {
                const response = await this.client.get<T>(endpoint, { params });
                return response.data;
              },
              {
                retries: CONFIG.retry.maxRetries,
                onFailedAttempt: (error) => {
                  logger.warn({
                    type: 'retry',
                    endpoint,
                    attempt: error.attemptNumber,
                    retriesLeft: error.retriesLeft
                  }, `Retrying request to ${endpoint}`);
                },
                shouldRetry: (error) => isRetryableError(error),
                minTimeout: CONFIG.retry.delay,
                maxTimeout: CONFIG.retry.delay * 1.5,
                factor: 1.3,
                randomize: true
              }
            );
          });
        });

        const duration = Date.now() - startTime;

        // Métricas
        metricsCollector.incrementHttpRequest(endpoint);
        metricsCollector.recordLatency(endpoint, duration);
        metricsCollector.recordResponseSize(endpoint, JSON.stringify(result).length);

        logAPIRequest(endpoint, params, duration);

        // 3. Save to Cache
        if (category) {
          cacheManager.set(category, requestKey, result);
        }

        // Injetar metadados
        if (typeof result === 'object' && result !== null) {
          return {
            ...result,
            _metadata: {
              cache: false,
              latencyMs: duration,
              apiVersion: 'v2'
            }
          };
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        metricsCollector.incrementError(error instanceof Error ? error.name : 'UnknownError');
        logError(error as Error, { endpoint, params, duration });

        // Retry inteligente para erro 400
        if (error instanceof CamaraAPIError && error.statusCode === 400 && params) {
          const { params: simplified, removed } = simplifyParams(endpoint, params);

          if (removed.length > 0) {
            logger.info({
              type: 'smart_retry',
              endpoint,
              removedParams: removed
            }, `Tentando novamente sem: ${removed.join(', ')}`);

            try {
              // Nota: Recursão aqui pode ser perigosa se não cuidarmos do cache/dedup,
              // mas como params mudaram, requestKey muda.
              const retryResult = await this.get<T>(endpoint, simplified);
              return {
                ...retryResult,
                _warnings: [`Parâmetros removidos automaticamente para evitar erro: ${removed.join(', ')}`]
              } as T;
            } catch (retryError) {
              throw createInformativeAPIError(
                error.statusCode,
                endpoint,
                params,
                error.details
              );
            }
          }
        }

        if (error instanceof CamaraAPIError && error.statusCode && params) {
          // Log detalhado do erro da API para debug
          if (error.details) {
            console.error('API Error Details:', JSON.stringify(error.details, null, 2));
          }

          throw createInformativeAPIError(
            error.statusCode,
            endpoint,
            params,
            error.details
          );
        }

        throw error;
      }
    })();

    this.pendingRequests.set(requestKey, requestPromise);

    try {
      return await requestPromise;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  async getWithPagination<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<{
    dados: T[];
    links: Array<{ rel: string; href: string }>;
  }> {
    const response = await this.get<any>(endpoint, params);

    return {
      dados: response.dados || [],
      links: response.links || []
    };
  }

  getFullURL(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }
}

export const camaraAPI = new CamaraAPIClient();

import axios, { AxiosInstance } from 'axios';
import pRetry from 'p-retry';
import { CONFIG } from '../config.js';
import { CamaraAPIError, isRetryableError, createInformativeAPIError } from '../core/errors.js';
import { simplifyParams } from '../core/validation-utils.js';
import { logger, logAPIRequest, logError } from '../core/logging.js';
import { circuitBreaker } from '../core/circuit-breaker.js';
import { rateLimiter } from '../core/rate-limiter.js';
import { requestQueue } from '../core/queue.js';
import { metricsCollector } from '../core/metrics.js';

export class CamaraAPIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = CONFIG.api.baseUrl;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: CONFIG.api.timeout,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MCP-Camara-BR/1.0'
      }
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

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
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
              maxTimeout: CONFIG.retry.delay * 2,  // Reduzido de 4x para 2x
              factor: 1.5,  // Reduzido de 2 para 1.5
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
            const retryResult = await this.get<T>(endpoint, simplified);
            // Adicionar aviso sobre parâmetros removidos
            return {
              ...retryResult,
              _warnings: [`Parâmetros removidos automaticamente para evitar erro: ${removed.join(', ')}`]
            } as T;
          } catch (retryError) {
            // Se falhar novamente, lançar erro informativo original
            throw createInformativeAPIError(
              error.statusCode,
              endpoint,
              params,
              error.details
            );
          }
        }
      }

      // Enriquecer erros de API com contexto informativo
      if (error instanceof CamaraAPIError && error.statusCode && params) {
        throw createInformativeAPIError(
          error.statusCode,
          endpoint,
          params,
          error.details
        );
      }

      throw error;
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

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import pRetry from 'p-retry';
import { config } from '../config.js';
import { CamaraAPIError, TimeoutError } from '../core/errors.js';
import { createLogger } from '../core/logging.js';
import { rateLimiter } from '../core/rate-limiter.js';
import { circuitBreaker } from '../core/circuit-breaker.js';
import { apiQueue } from '../core/queue.js';

const logger = createLogger('api-client');

export class CamaraAPIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'mcp-camara-br/1.0.0',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug({ url: config.url, method: config.method }, 'API request');
        return config;
      },
      (error) => {
        logger.error({ error }, 'Request interceptor error');
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(
          {
            url: response.config.url,
            status: response.status,
            dataSize: JSON.stringify(response.data).length,
          },
          'API response'
        );
        return response;
      },
      (error) => {
        if (error.code === 'ECONNABORTED') {
          logger.error({ url: error.config?.url }, 'Request timeout');
          throw new TimeoutError();
        }

        const statusCode = error.response?.status;
        const endpoint = error.config?.url;

        logger.error(
          {
            endpoint,
            statusCode,
            message: error.message,
          },
          'API error'
        );

        throw new CamaraAPIError(
          error.response?.data?.message || error.message,
          statusCode,
          endpoint,
          error
        );
      }
    );
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const startTime = Date.now();

    try {
      // Apply rate limiting
      await rateLimiter.acquire();

      // Execute with circuit breaker and retry logic
      const result = await circuitBreaker.execute(async () => {
        return pRetry(
          async () => {
            return apiQueue.add(async () => {
              const response = await this.client.get<T>(endpoint, { params });
              return response.data;
            });
          },
          {
            retries: config.retry.maxRetries,
            minTimeout: config.retry.delay,
            onFailedAttempt: (error) => {
              logger.warn(
                {
                  endpoint,
                  attempt: error.attemptNumber,
                  retriesLeft: error.retriesLeft,
                },
                'Request retry'
              );
            },
          }
        );
      });

      const latency = Date.now() - startTime;
      logger.info({ endpoint, latency, params }, 'Request successful');

      return result as T;
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error({ endpoint, latency, error }, 'Request failed');
      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const startTime = Date.now();

    try {
      await rateLimiter.acquire();

      const result = await circuitBreaker.execute(async () => {
        return pRetry(
          async () => {
            return apiQueue.add(async () => {
              const response = await this.client.post<T>(endpoint, data, config);
              return response.data;
            });
          },
          {
            retries: config?.retry?.maxRetries || 3,
            minTimeout: config?.retry?.delay || 1000,
          }
        );
      });

      const latency = Date.now() - startTime;
      logger.info({ endpoint, latency }, 'POST request successful');

      return result as T;
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error({ endpoint, latency, error }, 'POST request failed');
      throw error;
    }
  }
}

// Singleton instance
export const apiClient = new CamaraAPIClient();

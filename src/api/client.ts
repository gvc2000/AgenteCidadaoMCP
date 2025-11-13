import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from '../config.js';
import { logger } from '../core/logger.js';
import { Cache } from '../core/cache.js';

export interface APIResponse<T> {
  dados: T;
  links?: Array<{
    rel: string;
    href: string;
  }>;
}

export interface PaginatedResponse<T> {
  dados: T[];
  links?: Array<{
    rel: string;
    href: string;
  }>;
}

export class CamaraAPIClient {
  private client: AxiosInstance;
  private cache: Cache;

  constructor(cache: Cache) {
    this.cache = cache;
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'mcp-camara-br/1.0.0',
      },
    });

    // Interceptor para logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('API Request', {
          method: config.method,
          url: config.url,
          params: config.params,
        });
        return config;
      },
      (error) => {
        logger.error('API Request Error', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API Response', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        logger.error('API Response Error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  async get<T>(endpoint: string, params?: any): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params);

    // Verificar cache
    const cached = this.cache.get<T>(cacheKey);
    if (cached) {
      logger.debug('Cache hit', { endpoint, params });
      return cached;
    }

    // Fazer requisição
    try {
      const response = await this.client.get<T>(endpoint, { params });

      // Salvar no cache
      this.cache.set(cacheKey, response.data);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API Error: ${error.response?.status} - ${error.message}`);
      }
      throw error;
    }
  }

  private getCacheKey(endpoint: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramsStr}`;
  }
}

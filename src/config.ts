import { config as loadEnv } from 'dotenv';

loadEnv();

export const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://dadosabertos.camara.leg.br/api/v2',
    timeout: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000', 10),
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10', 10),
  },
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    ttl: parseInt(process.env.CACHE_TTL_SECONDS || '600', 10),
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
  },
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    perMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '100', 10),
    burst: parseInt(process.env.RATE_LIMIT_BURST || '20', 10),
  },
  circuitBreaker: {
    enabled: process.env.CIRCUIT_BREAKER_ENABLED !== 'false',
    failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5', 10),
    resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS || '60000', 10),
  },
  retry: {
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    delay: parseInt(process.env.RETRY_DELAY_MS || '1000', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
  env: process.env.NODE_ENV || 'production',
  debug: process.env.DEBUG === 'true',
};

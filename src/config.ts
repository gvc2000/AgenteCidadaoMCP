import { config } from 'dotenv';

config();

export const CONFIG = {
  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://dadosabertos.camara.leg.br/api/v2',
    openApiUrl: process.env.OPENAPI_URL || 'https://dadosabertos.camara.leg.br/swagger/api.json',
    timeout: parseInt(process.env.REQUEST_TIMEOUT_MS || '15000', 10),  // Reduzido para 15s
  },

  // Cache Configuration
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',  // HABILITADO por padrão
    ttl: parseInt(process.env.CACHE_TTL_SECONDS || '600', 10),
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
    strategy: process.env.CACHE_STRATEGY || 'tiered',
    redisUrl: process.env.REDIS_URL,
  },

  // Rate Limiting
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    perMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '100', 10),
    burst: parseInt(process.env.RATE_LIMIT_BURST || '20', 10),
    backoff: process.env.RATE_LIMIT_BACKOFF || 'exponential',
  },

  // Circuit Breaker
  circuitBreaker: {
    enabled: process.env.CIRCUIT_BREAKER_ENABLED !== 'false',
    failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD || '5', 10),
    resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS || '60000', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    filePath: process.env.LOG_FILE_PATH,
  },

  // Metrics
  metrics: {
    enabled: process.env.METRICS_ENABLED !== 'false',
    port: parseInt(process.env.METRICS_PORT || '9090', 10),
    path: process.env.METRICS_PATH || '/metrics',
  },

  // Performance
  performance: {
    maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10', 10),
    queueMaxSize: parseInt(process.env.QUEUE_MAX_SIZE || '100', 10),
  },

  // Retry Policy
  retry: {
    maxRetries: parseInt(process.env.MAX_RETRIES || '2', 10),  // Reduzido de 3 para 2
    delay: parseInt(process.env.RETRY_DELAY_MS || '500', 10),  // Reduzido de 1000ms para 500ms
    jitter: parseInt(process.env.RETRY_JITTER_MS || '250', 10),  // Reduzido de 500ms para 250ms
  },

  // Development
  development: {
    nodeEnv: process.env.NODE_ENV || 'production',
    debug: process.env.DEBUG === 'true',
  },
} as const;

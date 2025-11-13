import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://dadosabertos.camara.leg.br/api/v2',
    timeout: parseInt(process.env.REQUEST_TIMEOUT_MS || '30000'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  },
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    ttl: parseInt(process.env.CACHE_TTL_SECONDS || '600'),
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;

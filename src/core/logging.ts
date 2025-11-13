import pino from 'pino';
import { CONFIG } from '../config.js';

// @ts-ignore - pino has complex types
export const logger = pino({
  level: CONFIG.logging.level
});

// Helper para logs estruturados
export function logToolCall(toolName: string, params: unknown, duration?: number) {
  logger.info({
    type: 'tool_call',
    tool: toolName,
    params,
    duration
  }, `Tool called: ${toolName}`);
}

export function logAPIRequest(endpoint: string, params: unknown, duration?: number) {
  logger.debug({
    type: 'api_request',
    endpoint,
    params,
    duration
  }, `API request: ${endpoint}`);
}

export function logCacheHit(key: string) {
  logger.debug({
    type: 'cache',
    event: 'hit',
    key
  }, `Cache hit: ${key}`);
}

export function logCacheMiss(key: string) {
  logger.debug({
    type: 'cache',
    event: 'miss',
    key
  }, `Cache miss: ${key}`);
}

export function logError(error: Error, context?: unknown) {
  logger.error({
    type: 'error',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context
  }, `Error: ${error.message}`);
}

export function logMetric(metric: string, value: number, tags?: Record<string, string>) {
  logger.info({
    type: 'metric',
    metric,
    value,
    tags
  }, `Metric: ${metric}=${value}`);
}

import pino from 'pino';
import { CONFIG } from '../config.js';

// @ts-ignore - pino has complex types
// IMPORTANTE: Logs devem ir para stderr, não stdout
// O stdout é reservado para mensagens JSON-RPC do protocolo MCP
export const logger = pino({
  level: CONFIG.logging.level
}, pino.destination({ dest: 2 })); // 2 = stderr

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

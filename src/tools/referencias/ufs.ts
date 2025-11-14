import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const UFsSchema = z.object({});
export type UFsParams = z.infer<typeof UFsSchema>;

export async function ufs(params: UFsParams = {}) {
  const startTime = Date.now();
  try {
    const validated = UFsSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('referencias', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.get<any>('/referencias/uf');
    const result = {
      ufs: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('referencias', cacheKey, result);
    metricsCollector.incrementToolCall('ufs');
    logToolCall('ufs', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('ufs');
    throw error;
  }
}

export const ufsTool = {
  name: 'ufs',
  description: 'Lista as Unidades Federativas (estados) do Brasil',
  inputSchema: { type: 'object', properties: {} },
  handler: ufs
};

import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const TiposOrgaoSchema = z.object({});
export type TiposOrgaoParams = z.infer<typeof TiposOrgaoSchema>;

export async function tiposOrgao(params: TiposOrgaoParams = {}) {
  const startTime = Date.now();
  try {
    const validated = TiposOrgaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('referencias', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.get<any>('/referencias/tiposOrgao');
    const result = {
      tipos: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('referencias', cacheKey, result);
    metricsCollector.incrementToolCall('tipos_orgao');
    logToolCall('tipos_orgao', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('tipos_orgao');
    throw error;
  }
}

export const tiposOrgaoTool = {
  name: 'tipos_orgao',
  description: 'Lista os tipos de órgãos da Câmara (comissões, mesas, etc)',
  inputSchema: { type: 'object', properties: {} },
  handler: tiposOrgao
};

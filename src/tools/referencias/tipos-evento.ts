import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const TiposEventoSchema = z.object({});
export type TiposEventoParams = z.infer<typeof TiposEventoSchema>;

export async function tiposEvento(params: TiposEventoParams = {}) {
  const startTime = Date.now();
  try {
    const validated = TiposEventoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('referencias', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.get<any>('/referencias/tiposEvento');
    const result = {
      tipos: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('referencias', cacheKey, result);
    metricsCollector.incrementToolCall('tipos_evento');
    logToolCall('tipos_evento', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('tipos_evento');
    throw error;
  }
}

export const tiposEventoTool = {
  name: 'tipos_evento',
  description: 'Lista os tipos de eventos da Câmara (reuniões, sessões, etc)',
  inputSchema: { type: 'object', properties: {} },
  handler: tiposEvento
};

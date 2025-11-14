import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const LideresPartidoSchema = z.object({ id: IdSchema });
export type LideresPartidoParams = z.infer<typeof LideresPartidoSchema>;

export async function lideresPartido(params: LideresPartidoParams) {
  const startTime = Date.now();
  try {
    const validated = LideresPartidoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('partidos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.get<any>(`/partidos/${validated.id}/lideres`);
    const result = {
      lideres: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('partidos', cacheKey, result);
    metricsCollector.incrementToolCall('lideres_partido');
    logToolCall('lideres_partido', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('lideres_partido');
    throw error;
  }
}

export const lideresPartidoTool = {
  name: 'lideres_partido',
  description: 'Lista os líderes de um partido na Câmara',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do partido' } },
    required: ['id']
  },
  handler: lideresPartido
};

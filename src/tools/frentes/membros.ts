import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const MembrosFrenteSchema = z.object({ id: IdSchema });
export type MembrosFrenteParams = z.infer<typeof MembrosFrenteSchema>;

export async function membrosFrente(params: MembrosFrenteParams) {
  const startTime = Date.now();
  try {
    const validated = MembrosFrenteSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('frentes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.get<any>(`/frentes/${validated.id}/membros`);
    const result = {
      membros: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('frentes', cacheKey, result);
    metricsCollector.incrementToolCall('membros_frente');
    logToolCall('membros_frente', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('membros_frente');
    throw error;
  }
}

export const membrosFrenteTool = {
  name: 'membros_frente',
  description: 'Lista os membros de uma frente parlamentar',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID da frente' } },
    required: ['id']
  },
  handler: membrosFrente
};

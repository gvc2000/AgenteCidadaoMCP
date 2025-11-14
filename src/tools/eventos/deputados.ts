import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const DeputadosEventoSchema = z.object({
  id: IdSchema
});

export type DeputadosEventoParams = z.infer<typeof DeputadosEventoSchema>;

export async function deputadosEvento(params: DeputadosEventoParams) {
  const startTime = Date.now();

  try {
    const validated = DeputadosEventoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('eventos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/eventos/${id}/deputados`);

    const result = {
      deputados: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('eventos', cacheKey, result);
    metricsCollector.incrementToolCall('deputados_evento');
    logToolCall('deputados_evento', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('deputados_evento');
    throw error;
  }
}

export const deputadosEventoTool = {
  name: 'deputados_evento',
  description: 'Lista os deputados presentes ou relacionados a um evento',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do evento' }
    },
    required: ['id']
  },
  handler: deputadosEvento
};

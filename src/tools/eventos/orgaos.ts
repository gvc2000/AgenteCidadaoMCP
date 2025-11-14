import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const OrgaosEventoSchema = z.object({
  id: IdSchema
});

export type OrgaosEventoParams = z.infer<typeof OrgaosEventoSchema>;

export async function orgaosEvento(params: OrgaosEventoParams) {
  const startTime = Date.now();

  try {
    const validated = OrgaosEventoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('eventos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/eventos/${id}/orgaos`);

    const result = {
      orgaos: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('eventos', cacheKey, result);
    metricsCollector.incrementToolCall('orgaos_evento');
    logToolCall('orgaos_evento', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('orgaos_evento');
    throw error;
  }
}

export const orgaosEventoTool = {
  name: 'orgaos_evento',
  description: 'Lista os órgãos relacionados a um evento',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do evento' }
    },
    required: ['id']
  },
  handler: orgaosEvento
};

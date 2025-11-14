import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const VotacoesEventoSchema = z.object({
  id: IdSchema
});

export type VotacoesEventoParams = z.infer<typeof VotacoesEventoSchema>;

export async function votacoesEvento(params: VotacoesEventoParams) {
  const startTime = Date.now();

  try {
    const validated = VotacoesEventoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('eventos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/eventos/${id}/votacoes`);

    const result = {
      votacoes: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('eventos', cacheKey, result);
    metricsCollector.incrementToolCall('votacoes_evento');
    logToolCall('votacoes_evento', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('votacoes_evento');
    throw error;
  }
}

export const votacoesEventoTool = {
  name: 'votacoes_evento',
  description: 'Lista as votações ocorridas em um evento',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do evento' }
    },
    required: ['id']
  },
  handler: votacoesEvento
};

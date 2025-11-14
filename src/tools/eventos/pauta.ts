import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const PautaEventoSchema = z.object({
  id: IdSchema
});

export type PautaEventoParams = z.infer<typeof PautaEventoSchema>;

export async function pautaEvento(params: PautaEventoParams) {
  const startTime = Date.now();

  try {
    const validated = PautaEventoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('eventos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/eventos/${id}/pauta`);

    const result = {
      pauta: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('eventos', cacheKey, result);
    metricsCollector.incrementToolCall('pauta_evento');
    logToolCall('pauta_evento', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('pauta_evento');
    throw error;
  }
}

export const pautaEventoTool = {
  name: 'pauta_evento',
  description: 'Obtém a pauta de um evento (proposições a serem discutidas/votadas)',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do evento' }
    },
    required: ['id']
  },
  handler: pautaEvento
};

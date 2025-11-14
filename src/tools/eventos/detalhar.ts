import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const DetalharEventoSchema = z.object({
  id: IdSchema
});

export type DetalharEventoParams = z.infer<typeof DetalharEventoSchema>;

export async function detalharEvento(params: DetalharEventoParams) {
  const startTime = Date.now();

  try {
    const validated = DetalharEventoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('eventos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/eventos/${id}`);

    const result = {
      evento: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('eventos', cacheKey, result);
    metricsCollector.incrementToolCall('detalhar_evento');
    logToolCall('detalhar_evento', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('detalhar_evento');
    throw error;
  }
}

export const detalharEventoTool = {
  name: 'detalhar_evento',
  description: 'Obtém detalhes de um evento específico da Câmara',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do evento' }
    },
    required: ['id']
  },
  handler: detalharEvento
};

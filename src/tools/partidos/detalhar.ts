import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const DetalharPartidoSchema = z.object({ id: IdSchema });
export type DetalharPartidoParams = z.infer<typeof DetalharPartidoSchema>;

export async function detalharPartido(params: DetalharPartidoParams) {
  const startTime = Date.now();
  try {
    const validated = DetalharPartidoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('partidos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.get<any>(`/partidos/${validated.id}`);
    const result = {
      partido: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('partidos', cacheKey, result);
    metricsCollector.incrementToolCall('detalhar_partido');
    logToolCall('detalhar_partido', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('detalhar_partido');
    throw error;
  }
}

export const detalharPartidoTool = {
  name: 'detalhar_partido',
  description: 'Obtém detalhes de um partido político específico',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do partido' } },
    required: ['id']
  },
  handler: detalharPartido
};

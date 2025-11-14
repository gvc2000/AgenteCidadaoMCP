import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const DetalharFrenteSchema = z.object({ id: IdSchema });
export type DetalharFrenteParams = z.infer<typeof DetalharFrenteSchema>;

export async function detalharFrente(params: DetalharFrenteParams) {
  const startTime = Date.now();
  try {
    const validated = DetalharFrenteSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('frentes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.get<any>(`/frentes/${validated.id}`);
    const result = {
      frente: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('frentes', cacheKey, result);
    metricsCollector.incrementToolCall('detalhar_frente');
    logToolCall('detalhar_frente', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('detalhar_frente');
    throw error;
  }
}

export const detalharFrenteTool = {
  name: 'detalhar_frente',
  description: 'Obtém detalhes de uma frente parlamentar específica',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID da frente' } },
    required: ['id']
  },
  handler: detalharFrente
};

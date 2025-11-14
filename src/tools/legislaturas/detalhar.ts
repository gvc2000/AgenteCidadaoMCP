import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const DetalharLegislaturaSchema = z.object({ id: IdSchema });
export type DetalharLegislaturaParams = z.infer<typeof DetalharLegislaturaSchema>;

export async function detalharLegislatura(params: DetalharLegislaturaParams) {
  const startTime = Date.now();
  try {
    const validated = DetalharLegislaturaSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('legislaturas', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.get<any>(`/legislaturas/${validated.id}`);
    const result = {
      legislatura: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('legislaturas', cacheKey, result);
    metricsCollector.incrementToolCall('detalhar_legislatura');
    logToolCall('detalhar_legislatura', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('detalhar_legislatura');
    throw error;
  }
}

export const detalharLegislaturaTool = {
  name: 'detalhar_legislatura',
  description: 'Obtém detalhes de uma legislatura específica',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID da legislatura' } },
    required: ['id']
  },
  handler: detalharLegislatura
};

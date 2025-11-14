import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const DetalharBlocoSchema = z.object({ id: IdSchema });
export type DetalharBlocoParams = z.infer<typeof DetalharBlocoSchema>;

export async function detalharBloco(params: DetalharBlocoParams) {
  const startTime = Date.now();
  try {
    const validated = DetalharBlocoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('blocos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.get<any>(`/blocos/${validated.id}`);
    const result = {
      bloco: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('blocos', cacheKey, result);
    metricsCollector.incrementToolCall('detalhar_bloco');
    logToolCall('detalhar_bloco', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('detalhar_bloco');
    throw error;
  }
}

export const detalharBlocoTool = {
  name: 'detalhar_bloco',
  description: 'Obtém detalhes de um bloco parlamentar específico',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do bloco' } },
    required: ['id']
  },
  handler: detalharBloco
};

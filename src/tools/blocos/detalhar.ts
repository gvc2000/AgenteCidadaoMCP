import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

// Blocos usam IDs que podem ser números ou strings (ex: "PP , REPUBLICANOS")
const BlocoIdSchema = z.union([
  z.number().int().positive(),
  z.string().min(1)
]);

const DetalharBlocoSchema = z.object({ id: BlocoIdSchema });
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
    properties: { id: { oneOf: [{ type: 'number' }, { type: 'string' }], description: 'ID do bloco (número ou string)' } },
    required: ['id']
  },
  handler: detalharBloco
};

import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const DetalharOrgaoSchema = z.object({
  id: IdSchema
});

export type DetalharOrgaoParams = z.infer<typeof DetalharOrgaoSchema>;

export async function detalharOrgao(params: DetalharOrgaoParams) {
  const startTime = Date.now();

  try {
    const validated = DetalharOrgaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('orgaos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/orgaos/${id}`);

    const result = {
      orgao: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('orgaos', cacheKey, result);
    metricsCollector.incrementToolCall('detalhar_orgao');
    logToolCall('detalhar_orgao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('detalhar_orgao');
    throw error;
  }
}

export const detalharOrgaoTool = {
  name: 'detalhar_orgao',
  description: 'Obtém detalhes de um órgão específico da Câmara',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do órgão' }
    },
    required: ['id']
  },
  handler: detalharOrgao
};

import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const DetalharProposicaoSchema = z.object({
  id: IdSchema
});

export type DetalharProposicaoParams = z.infer<typeof DetalharProposicaoSchema>;

export async function detalharProposicao(params: DetalharProposicaoParams) {
  const startTime = Date.now();

  try {
    const validated = DetalharProposicaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('proposicoes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const response = await camaraAPI.get<any>(`/proposicoes/${validated.id}`);
    const proposicao = DataNormalizer.normalizeProposicao(response.dados);

    const result = {
      proposicao,
      _metadata: {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2'
      }
    };

    cacheManager.set('proposicoes', cacheKey, result);
    metricsCollector.incrementToolCall('detalhar_proposicao');
    metricsCollector.recordLatency('detalhar_proposicao', Date.now() - startTime);
    logToolCall('detalhar_proposicao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('detalhar_proposicao');
    throw error;
  }
}

export const detalharProposicaoTool = {
  name: 'detalhar_proposicao',
  description: 'Obtém informações detalhadas de uma proposição legislativa',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID da proposição' }
    },
    required: ['id']
  },
  handler: detalharProposicao
};

import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const VotosVotacaoSchema = z.object({
  id: z.string()
});

export type VotosVotacaoParams = z.infer<typeof VotosVotacaoSchema>;

export async function votosVotacao(params: VotosVotacaoParams) {
  const startTime = Date.now();

  try {
    const validated = VotosVotacaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('votacoes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/votacoes/${id}/votos`);

    const result = {
      votos: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('votacoes', cacheKey, result);
    metricsCollector.incrementToolCall('votos_votacao');
    logToolCall('votos_votacao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('votos_votacao');
    throw error;
  }
}

export const votosVotacaoTool = {
  name: 'votos_votacao',
  description: 'Lista os votos de deputados em uma votação específica',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'ID da votação' }
    },
    required: ['id']
  },
  handler: votosVotacao
};

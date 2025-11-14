import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const VotacoesProposicaoSchema = z.object({
  id: IdSchema,
  ordem: z.enum(['ASC', 'DESC']).optional(),
  ordenarPor: z.string().optional()
});

export type VotacoesProposicaoParams = z.infer<typeof VotacoesProposicaoSchema>;

export async function votacoesProposicao(params: VotacoesProposicaoParams) {
  const startTime = Date.now();

  try {
    const validated = VotacoesProposicaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('votacoes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id, ...queryParams } = validated;
    const response = await camaraAPI.get<any>(`/proposicoes/${id}/votacoes`, queryParams);

    const result = {
      votacoes: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('votacoes', cacheKey, result);
    metricsCollector.incrementToolCall('votacoes_proposicao');
    logToolCall('votacoes_proposicao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('votacoes_proposicao');
    throw error;
  }
}

export const votacoesProposicaoTool = {
  name: 'votacoes_proposicao',
  description: 'Lista as votações relacionadas a uma proposição',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID da proposição' },
      ordem: { type: 'string', enum: ['ASC', 'DESC'], description: 'Ordem de listagem' },
      ordenarPor: { type: 'string', description: 'Campo para ordenação' }
    },
    required: ['id']
  },
  handler: votacoesProposicao
};

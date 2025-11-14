import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const OrientacoesVotacaoSchema = z.object({
  id: z.string()
});

export type OrientacoesVotacaoParams = z.infer<typeof OrientacoesVotacaoSchema>;

export async function orientacoesVotacao(params: OrientacoesVotacaoParams) {
  const startTime = Date.now();

  try {
    const validated = OrientacoesVotacaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('votacoes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/votacoes/${id}/orientacoes`);

    const result = {
      orientacoes: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('votacoes', cacheKey, result);
    metricsCollector.incrementToolCall('orientacoes_votacao');
    logToolCall('orientacoes_votacao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('orientacoes_votacao');
    throw error;
  }
}

export const orientacoesVotacaoTool = {
  name: 'orientacoes_votacao',
  description: 'Lista as orientações de bancada em uma votação específica',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'ID da votação' }
    },
    required: ['id']
  },
  handler: orientacoesVotacao
};

import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const TemasProposicaoSchema = z.object({
  id: IdSchema
});

export type TemasProposicaoParams = z.infer<typeof TemasProposicaoSchema>;

export async function temasProposicao(params: TemasProposicaoParams) {
  const startTime = Date.now();

  try {
    const validated = TemasProposicaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('proposicoes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/proposicoes/${id}/temas`);

    const result = {
      temas: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('proposicoes', cacheKey, result);
    metricsCollector.incrementToolCall('temas_proposicao');
    logToolCall('temas_proposicao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('temas_proposicao');
    throw error;
  }
}

export const temasProposicaoTool = {
  name: 'temas_proposicao',
  description: 'Lista os temas de uma proposição',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID da proposição' }
    },
    required: ['id']
  },
  handler: temasProposicao
};

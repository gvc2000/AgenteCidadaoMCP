import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const AutoresProposicaoSchema = z.object({
  id: IdSchema
});

export type AutoresProposicaoParams = z.infer<typeof AutoresProposicaoSchema>;

export async function autoresProposicao(params: AutoresProposicaoParams) {
  const startTime = Date.now();

  try {
    const validated = AutoresProposicaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('proposicoes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const response = await camaraAPI.getWithPagination(`/proposicoes/${validated.id}/autores`);

    const result = {
      autores: response.dados,
      _metadata: {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2'
      }
    };

    cacheManager.set('proposicoes', cacheKey, result);
    metricsCollector.incrementToolCall('autores_proposicao');
    logToolCall('autores_proposicao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('autores_proposicao');
    throw error;
  }
}

export const autoresProposicaoTool = {
  name: 'autores_proposicao',
  description: 'Lista os autores de uma proposição legislativa',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID da proposição' }
    },
    required: ['id']
  },
  handler: autoresProposicao
};

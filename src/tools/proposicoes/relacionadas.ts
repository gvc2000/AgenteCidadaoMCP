import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const RelacionadasProposicaoSchema = z.object({
  id: IdSchema
});

export type RelacionadasProposicaoParams = z.infer<typeof RelacionadasProposicaoSchema>;

export async function relacionadasProposicao(params: RelacionadasProposicaoParams) {
  const startTime = Date.now();

  try {
    const validated = RelacionadasProposicaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('proposicoes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/proposicoes/${id}/relacionadas`);

    const result = {
      relacionadas: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('proposicoes', cacheKey, result);
    metricsCollector.incrementToolCall('relacionadas_proposicao');
    logToolCall('relacionadas_proposicao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('relacionadas_proposicao');
    throw error;
  }
}

export const relacionadasProposicaoTool = {
  name: 'relacionadas_proposicao',
  description: 'Lista as proposições relacionadas a uma proposição',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID da proposição' }
    },
    required: ['id']
  },
  handler: relacionadasProposicao
};

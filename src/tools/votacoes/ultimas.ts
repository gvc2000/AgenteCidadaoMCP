import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const UltimasVotacoesSchema = z.object({
  ordem: z.enum(['ASC', 'DESC']).optional()
});

export type UltimasVotacoesParams = z.infer<typeof UltimasVotacoesSchema>;

export async function ultimasVotacoes(params: UltimasVotacoesParams = {}) {
  const startTime = Date.now();

  try {
    const validated = UltimasVotacoesSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('votacoes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const response = await camaraAPI.get<any>('/votacoes', validated);

    const result = {
      votacoes: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('votacoes', cacheKey, result);
    metricsCollector.incrementToolCall('ultimas_votacoes');
    logToolCall('ultimas_votacoes', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('ultimas_votacoes');
    throw error;
  }
}

export const ultimasVotacoesTool = {
  name: 'ultimas_votacoes',
  description: 'Lista as últimas votações realizadas na Câmara dos Deputados',
  inputSchema: {
    type: 'object',
    properties: {
      ordem: { type: 'string', enum: ['ASC', 'DESC'], description: 'Ordem de listagem' }
    }
  },
  handler: ultimasVotacoes
};

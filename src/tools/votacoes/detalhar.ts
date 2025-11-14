import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const DetalharVotacaoSchema = z.object({
  id: z.string()
});

export type DetalharVotacaoParams = z.infer<typeof DetalharVotacaoSchema>;

export async function detalharVotacao(params: DetalharVotacaoParams) {
  const startTime = Date.now();

  try {
    const validated = DetalharVotacaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('votacoes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/votacoes/${id}`);

    const result = {
      votacao: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('votacoes', cacheKey, result);
    metricsCollector.incrementToolCall('detalhar_votacao');
    logToolCall('detalhar_votacao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('detalhar_votacao');
    throw error;
  }
}

export const detalharVotacaoTool = {
  name: 'detalhar_votacao',
  description: 'Obtém detalhes de uma votação específica',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'ID da votação' }
    },
    required: ['id']
  },
  handler: detalharVotacao
};

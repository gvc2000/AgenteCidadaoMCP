import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const SituacoesProposicaoSchema = z.object({});
export type SituacoesProposicaoParams = z.infer<typeof SituacoesProposicaoSchema>;

export async function situacoesProposicao(params: SituacoesProposicaoParams = {}) {
  const startTime = Date.now();
  try {
    const validated = SituacoesProposicaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('referencias', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.get<any>('/referencias/situacoesProposicao');
    const result = {
      situacoes: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('referencias', cacheKey, result);
    metricsCollector.incrementToolCall('situacoes_proposicao');
    logToolCall('situacoes_proposicao', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('situacoes_proposicao');
    throw error;
  }
}

export const situacoesProposicaoTool = {
  name: 'situacoes_proposicao',
  description: 'Lista as situações possíveis de proposições legislativas (tramitando, arquivada, aprovada, etc). Use esta tool para obter o ID ou sigla de uma situação quando precisar filtrar proposições por status em buscar_proposicoes. Exemplos de uso: encontrar proposições em tramitação, listar PLs arquivados, buscar PECs aprovadas.',
  inputSchema: { type: 'object', properties: {} },
  handler: situacoesProposicao
};

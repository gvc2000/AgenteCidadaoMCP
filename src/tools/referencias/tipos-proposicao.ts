import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const TiposProposicaoSchema = z.object({});
export type TiposProposicaoParams = z.infer<typeof TiposProposicaoSchema>;

export async function tiposProposicao(params: TiposProposicaoParams = {}) {
  const startTime = Date.now();
  try {
    const validated = TiposProposicaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('referencias', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.get<any>('/referencias/tiposProposicao');
    const result = {
      tipos: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('referencias', cacheKey, result);
    metricsCollector.incrementToolCall('tipos_proposicao');
    logToolCall('tipos_proposicao', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('tipos_proposicao');
    throw error;
  }
}

export const tiposProposicaoTool = {
  name: 'tipos_proposicao',
  description: 'Lista todos os tipos de proposições legislativas com siglas e descrições. Tipos comuns: PL (Projeto de Lei), PEC (Emenda Constitucional), MPV (Medida Provisória), PDL (Decreto Legislativo), PLP (Lei Complementar). Use para descobrir a sigla correta ao buscar proposições com buscar_proposicoes.',
  inputSchema: { type: 'object', properties: {} },
  handler: tiposProposicao
};

import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const TramitacoesProposicaoSchema = z.object({
  id: IdSchema,
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional()
});

export type TramitacoesProposicaoParams = z.infer<typeof TramitacoesProposicaoSchema>;

export async function tramitacoesProposicao(params: TramitacoesProposicaoParams) {
  const startTime = Date.now();

  try {
    const validated = TramitacoesProposicaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('proposicoes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id, ...queryParams } = validated;
    const response = await camaraAPI.getWithPagination(`/proposicoes/${id}/tramitacoes`, queryParams);

    const result = {
      paginacao: createPaginacaoResposta(validated.pagina || 1, validated.itens || 25, response.dados.length),
      tramitacoes: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('proposicoes', cacheKey, result);
    metricsCollector.incrementToolCall('tramitacoes_proposicao');
    logToolCall('tramitacoes_proposicao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('tramitacoes_proposicao');
    throw error;
  }
}

export const tramitacoesProposicaoTool = {
  name: 'tramitacoes_proposicao',
  description: 'Lista o histórico de tramitações de uma proposição',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID da proposição' },
      dataInicio: { type: 'string', description: 'Data de início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data de fim (YYYY-MM-DD)' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página (1-100)' }
    },
    required: ['id']
  },
  handler: tramitacoesProposicao
};

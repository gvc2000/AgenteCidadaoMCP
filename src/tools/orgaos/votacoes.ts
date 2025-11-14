import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const VotacoesOrgaoSchema = z.object({
  id: IdSchema,
  idProposicao: IdSchema.optional(),
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional()
});

export type VotacoesOrgaoParams = z.infer<typeof VotacoesOrgaoSchema>;

export async function votacoesOrgao(params: VotacoesOrgaoParams) {
  const startTime = Date.now();

  try {
    const validated = VotacoesOrgaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('orgaos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id, ...queryParams } = validated;
    const response = await camaraAPI.getWithPagination(`/orgaos/${id}/votacoes`, queryParams);

    const result = {
      paginacao: createPaginacaoResposta(validated.pagina || 1, validated.itens || 25, response.dados.length),
      votacoes: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('orgaos', cacheKey, result);
    metricsCollector.incrementToolCall('votacoes_orgao');
    logToolCall('votacoes_orgao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('votacoes_orgao');
    throw error;
  }
}

export const votacoesOrgaoTool = {
  name: 'votacoes_orgao',
  description: 'Lista as votações de um órgão da Câmara',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do órgão' },
      idProposicao: { type: 'number', description: 'ID da proposição' },
      dataInicio: { type: 'string', description: 'Data de início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data de fim (YYYY-MM-DD)' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página (1-100)' }
    },
    required: ['id']
  },
  handler: votacoesOrgao
};

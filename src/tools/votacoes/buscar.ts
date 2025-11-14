import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const BuscarVotacoesSchema = z.object({
  idProposicao: IdSchema.optional(),
  idEvento: IdSchema.optional(),
  idOrgao: IdSchema.optional(),
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional(),
  ordem: z.enum(['ASC', 'DESC']).optional(),
  ordenarPor: z.enum(['dataHoraRegistro', 'id']).optional()
});

export type BuscarVotacoesParams = z.infer<typeof BuscarVotacoesSchema>;

export async function buscarVotacoes(params: BuscarVotacoesParams = {}) {
  const startTime = Date.now();

  try {
    const validated = BuscarVotacoesSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('votacoes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const response = await camaraAPI.getWithPagination('/votacoes', validated);

    const result = {
      paginacao: createPaginacaoResposta(validated.pagina || 1, validated.itens || 25, response.dados.length),
      votacoes: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('votacoes', cacheKey, result);
    metricsCollector.incrementToolCall('buscar_votacoes');
    logToolCall('buscar_votacoes', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('buscar_votacoes');
    throw error;
  }
}

export const buscarVotacoesTool = {
  name: 'buscar_votacoes',
  description: 'Busca votações realizadas na Câmara dos Deputados',
  inputSchema: {
    type: 'object',
    properties: {
      idProposicao: { type: 'number', description: 'ID da proposição' },
      idEvento: { type: 'number', description: 'ID do evento' },
      idOrgao: { type: 'number', description: 'ID do órgão' },
      dataInicio: { type: 'string', description: 'Data de início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data de fim (YYYY-MM-DD)' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página (1-100)' },
      ordem: { type: 'string', enum: ['ASC', 'DESC'], description: 'Ordem de listagem' },
      ordenarPor: { type: 'string', enum: ['dataHoraRegistro', 'id'], description: 'Campo para ordenação' }
    }
  },
  handler: buscarVotacoes
};

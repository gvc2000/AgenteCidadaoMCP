import { z, ZodError } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';
import { formatZodError } from '../../core/errors.js';

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
    let validated: BuscarVotacoesParams;
    try {
      validated = BuscarVotacoesSchema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        throw formatZodError(error);
      }
      throw error;
    }
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
  description: 'Busca votações realizadas na Câmara dos Deputados. DICA: Comece com dataInicio + dataFim para buscar votações em um período, ou use idProposicao para votações de uma proposição específica.',
  inputSchema: {
    type: 'object',
    properties: {
      idProposicao: {
        type: 'number',
        description: 'ID da proposição. Use buscar_proposicoes para obter o ID'
      },
      idEvento: {
        type: 'number',
        description: 'ID do evento/sessão. Use buscar_eventos para obter o ID'
      },
      idOrgao: {
        type: 'number',
        description: 'ID do órgão (comissão/plenário). Use buscar_orgaos para obter o ID'
      },
      dataInicio: {
        type: 'string',
        description: 'Data de início do período. Formato: YYYY-MM-DD',
        examples: ['2024-01-01', '2024-06-01']
      },
      dataFim: {
        type: 'string',
        description: 'Data de fim do período. Formato: YYYY-MM-DD',
        examples: ['2024-12-31', '2024-06-30']
      },
      pagina: {
        type: 'number',
        description: 'Número da página (padrão: 1)',
        default: 1
      },
      itens: {
        type: 'number',
        description: 'Itens por página. Mínimo: 1, Máximo: 100 (padrão: 25)',
        default: 25,
        minimum: 1,
        maximum: 100
      },
      ordem: {
        type: 'string',
        enum: ['ASC', 'DESC'],
        description: 'Ordem de classificação',
        default: 'DESC'
      },
      ordenarPor: {
        type: 'string',
        enum: ['dataHoraRegistro', 'id'],
        description: 'Campo para ordenação'
      }
    }
  },
  handler: buscarVotacoes
};

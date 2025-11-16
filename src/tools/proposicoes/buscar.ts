import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, UFEnum, OrdemEnum, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const BuscarProposicoesSchema = z.object({
  siglaTipo: z.string().optional(),
  numero: z.number().int().positive().optional(),
  ano: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  idDeputadoAutor: z.number().int().positive().optional(),
  siglaPartidoAutor: z.string().optional(),
  siglaUfAutor: UFEnum.optional(),
  keywords: z.string().optional(),
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  dataInicioApresentacao: DateSchema.optional(),
  dataFimApresentacao: DateSchema.optional(),
  idSituacao: z.number().int().optional(),
  siglaSituacao: z.string().optional(),
  codTema: z.number().int().optional(),
  tramitacaoSenado: z.boolean().optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional(),
  ordem: OrdemEnum.default('DESC').optional(),
  ordenarPor: z.enum(['id', 'ano', 'dataApresentacao']).optional()
});

export type BuscarProposicoesParams = z.infer<typeof BuscarProposicoesSchema>;

export async function buscarProposicoes(params: BuscarProposicoesParams) {
  const startTime = Date.now();

  try {
    const validated = BuscarProposicoesSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('proposicoes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const response = await camaraAPI.getWithPagination('/proposicoes', validated);

    const proposicoes = DataNormalizer.normalizeArray(
      response.dados,
      DataNormalizer.normalizeProposicao
    );

    const paginacao = createPaginacaoResposta(
      validated.pagina || 1,
      validated.itens || 25,
      proposicoes.length
    );

    const result = {
      paginacao,
      proposicoes,
      _metadata: {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2'
      }
    };

    cacheManager.set('proposicoes', cacheKey, result);
    metricsCollector.incrementToolCall('buscar_proposicoes');
    metricsCollector.recordLatency('buscar_proposicoes', Date.now() - startTime);
    logToolCall('buscar_proposicoes', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('buscar_proposicoes');
    throw error;
  }
}

export const buscarProposicoesTool = {
  name: 'buscar_proposicoes',
  description: 'Busca proposições legislativas (PLs, PECs, MPs, etc.) por diversos critérios, incluindo busca por autor específico (deputado)',
  inputSchema: {
    type: 'object',
    properties: {
      siglaTipo: { type: 'string', description: 'Sigla do tipo (PL, PEC, MPV, etc.)' },
      numero: { type: 'number', description: 'Número da proposição' },
      ano: { type: 'number', description: 'Ano da proposição' },
      idDeputadoAutor: { type: 'number', description: 'ID do deputado autor da proposição. Use buscar_deputados para obter o ID.' },
      siglaPartidoAutor: { type: 'string', description: 'Sigla do partido do autor' },
      siglaUfAutor: { type: 'string', description: 'UF do autor' },
      keywords: { type: 'string', description: 'Palavras-chave' },
      dataInicio: { type: 'string', description: 'Data de início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data de fim (YYYY-MM-DD)' },
      dataInicioApresentacao: { type: 'string', description: 'Data inicial de apresentação' },
      dataFimApresentacao: { type: 'string', description: 'Data final de apresentação' },
      idSituacao: { type: 'number', description: 'ID da situação' },
      siglaSituacao: { type: 'string', description: 'Sigla da situação' },
      codTema: { type: 'number', description: 'Código do tema' },
      tramitacaoSenado: { type: 'boolean', description: 'Em tramitação no Senado' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página' },
      ordem: { type: 'string', enum: ['ASC', 'DESC'], description: 'Ordem' },
      ordenarPor: { type: 'string', enum: ['id', 'ano', 'dataApresentacao'], description: 'Ordenar por' }
    }
  },
  handler: buscarProposicoes
};

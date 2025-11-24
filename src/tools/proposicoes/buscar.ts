import { z, ZodError } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, UFEnum, OrdemEnum, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';
import { formatZodError } from '../../core/errors.js';

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
    let validated: BuscarProposicoesParams;
    try {
      validated = BuscarProposicoesSchema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        throw formatZodError(error);
      }
      throw error;
    }
    // OTIMIZAÇÃO: Se tem keywords mas não tem data, limita aos últimos 4 anos
    // A busca textual completa na base histórica é muito lenta (>1min).
    if (validated.keywords && !validated.ano && !validated.dataInicioApresentacao && !validated.dataInicio) {
      const fourYearsAgo = new Date();
      fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);
      validated.dataInicioApresentacao = fourYearsAgo.toISOString().split('T')[0];
    }

    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('proposicoes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    // Mapear parâmetros do schema para a API
    const queryParams: any = { ...validated };
    if (validated.dataInicioApresentacao) {
      queryParams.dataApresentacaoInicio = validated.dataInicioApresentacao;
      delete queryParams.dataInicioApresentacao;
    }
    if (validated.dataFimApresentacao) {
      queryParams.dataApresentacaoFim = validated.dataFimApresentacao;
      delete queryParams.dataFimApresentacao;
    }

    const response = await camaraAPI.getWithPagination('/proposicoes', queryParams);

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
  description: 'Busca proposições legislativas (PLs, PECs, MPs, etc.) por diversos critérios. DICA: Comece com poucos parâmetros (ex: siglaTipo + ano, ou apenas keywords) e adicione filtros gradualmente.',
  inputSchema: {
    type: 'object',
    properties: {
      siglaTipo: {
        type: 'string',
        description: 'Sigla do tipo de proposição',
        examples: ['PL', 'PEC', 'MPV', 'PDL', 'PLP']
      },
      numero: {
        type: 'number',
        description: 'Número da proposição (ex: 1234)'
      },
      ano: {
        type: 'number',
        description: 'Ano da proposição (ex: 2024)'
      },
      idDeputadoAutor: {
        type: 'number',
        description: 'ID do deputado autor. Use buscar_deputados primeiro para obter o ID correto'
      },
      siglaPartidoAutor: {
        type: 'string',
        description: 'Sigla do partido do autor',
        examples: ['PT', 'PL', 'PSDB', 'MDB']
      },
      siglaUfAutor: {
        type: 'string',
        description: 'UF do autor',
        examples: ['SP', 'RJ', 'MG', 'BA']
      },
      keywords: {
        type: 'string',
        description: 'Palavras-chave para busca no texto. ATENÇÃO: Máximo 100 caracteres. Se combinado com outros filtros pode causar erro - use sozinho primeiro',
        examples: ['educação', 'saúde pública', 'reforma tributária']
      },
      dataInicio: {
        type: 'string',
        description: 'Data de início para filtro de tramitação. Formato: YYYY-MM-DD',
        examples: ['2024-01-01']
      },
      dataFim: {
        type: 'string',
        description: 'Data de fim para filtro de tramitação. Formato: YYYY-MM-DD',
        examples: ['2024-12-31']
      },
      dataInicioApresentacao: {
        type: 'string',
        description: 'Data inicial de apresentação. Formato: YYYY-MM-DD',
        examples: ['2024-01-01']
      },
      dataFimApresentacao: {
        type: 'string',
        description: 'Data final de apresentação. Formato: YYYY-MM-DD',
        examples: ['2024-12-31']
      },
      idSituacao: {
        type: 'number',
        description: 'ID da situação. Use listar_situacoes_proposicao para ver opções'
      },
      siglaSituacao: {
        type: 'string',
        description: 'Sigla da situação da proposição'
      },
      codTema: {
        type: 'number',
        description: 'Código do tema. Use listar_temas_proposicao para ver opções'
      },
      tramitacaoSenado: {
        type: 'boolean',
        description: 'Se true, busca proposições em tramitação no Senado'
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
        description: 'Ordem de classificação. CUIDADO: Pode causar erro em combinação com alguns filtros. Use apenas se necessário',
        default: 'DESC'
      },
      ordenarPor: {
        type: 'string',
        enum: ['id', 'ano', 'dataApresentacao'],
        description: 'Campo para ordenação. CUIDADO: Pode causar erro em alguns endpoints. Omita se não for essencial'
      }
    }
  },
  handler: buscarProposicoes
};

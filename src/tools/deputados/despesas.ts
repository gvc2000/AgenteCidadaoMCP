import { z, ZodError } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, AnoSchema, MesSchema, OrdemEnum } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';
import { formatZodError } from '../../core/errors.js';

const DespesasDeputadoSchema = z.object({
  id: IdSchema,
  ano: AnoSchema.optional(),
  mes: MesSchema.optional(),
  tipoDespesa: z.string().optional(),
  fornecedor: z.string().optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional(),
  ordem: OrdemEnum.default('DESC').optional(),
  ordenarPor: z.enum(['ano', 'mes', 'dataDocumento', 'valorDocumento', 'valorLiquido']).optional()
});

export type DespesasDeputadoParams = z.infer<typeof DespesasDeputadoSchema>;

export async function despesasDeputado(params: DespesasDeputadoParams) {
  const startTime = Date.now();

  try {
    // Validação
    let validated: DespesasDeputadoParams;
    try {
      validated = DespesasDeputadoSchema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        throw formatZodError(error);
      }
      throw error;
    }

    // Cache check
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('despesas', cacheKey);
    if (cached) {
      return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    }

    // Preparar parâmetros
    const { id, ...queryParams } = validated;

    // API call
    const response = await camaraAPI.getWithPagination(
      `/deputados/${id}/despesas`,
      queryParams
    );

    // Normalização
    const despesas = DataNormalizer.normalizeArray(
      response.dados,
      DataNormalizer.normalizeDespesa
    );

    // Calcular totais
    const totalGasto = despesas.reduce((sum, d) => sum + d.valorLiquido, 0);
    const totalDocumentos = despesas.length;

    // Paginação
    const paginacao = createPaginacaoResposta(
      validated.pagina || 1,
      validated.itens || 25,
      totalDocumentos
    );

    const result = {
      paginacao,
      despesas,
      resumo: {
        totalGasto,
        totalDocumentos,
        periodo: validated.ano && validated.mes
          ? `${validated.mes}/${validated.ano}`
          : validated.ano
          ? `${validated.ano}`
          : 'Todos os períodos'
      },
      _metadata: {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2'
      }
    };

    // Cache set
    cacheManager.set('despesas', cacheKey, result);

    // Métricas
    metricsCollector.incrementToolCall('despesas_deputado');
    metricsCollector.recordLatency('despesas_deputado', Date.now() - startTime);

    logToolCall('despesas_deputado', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('despesas_deputado');
    throw error;
  }
}

export const despesasDeputadoTool = {
  name: 'despesas_deputado',
  description: 'Lista as despesas de um deputado da cota parlamentar. Use buscar_deputados primeiro para obter o ID do deputado.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'ID do deputado. OBRIGATÓRIO. Use buscar_deputados para obter o ID'
      },
      ano: {
        type: 'number',
        description: 'Ano das despesas (2008 até ano atual)',
        examples: [2024, 2023, 2022]
      },
      mes: {
        type: 'number',
        description: 'Mês das despesas (1-12). Use junto com ano para filtrar um mês específico',
        examples: [1, 6, 12],
        minimum: 1,
        maximum: 12
      },
      tipoDespesa: {
        type: 'string',
        description: 'Tipo de despesa. Ex: "PASSAGEM AÉREA", "COMBUSTÍVEIS", "DIVULGAÇÃO DA ATIVIDADE PARLAMENTAR"',
        examples: ['PASSAGEM AÉREA', 'COMBUSTÍVEIS', 'ALIMENTAÇÃO']
      },
      fornecedor: {
        type: 'string',
        description: 'Nome do fornecedor (busca parcial)'
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
        description: 'Ordem de classificação',
        enum: ['ASC', 'DESC'],
        default: 'DESC'
      },
      ordenarPor: {
        type: 'string',
        description: 'Campo para ordenação. Use "valorLiquido" para ver maiores/menores gastos',
        enum: ['ano', 'mes', 'dataDocumento', 'valorDocumento', 'valorLiquido']
      }
    },
    required: ['id']
  },
  handler: despesasDeputado
};

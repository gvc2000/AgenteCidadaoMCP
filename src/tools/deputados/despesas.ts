import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, AnoSchema, MesSchema, OrdemEnum } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

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
    const validated = DespesasDeputadoSchema.parse(params);

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
  description: 'Lista as despesas de um deputado (cota parlamentar)',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'ID do deputado'
      },
      ano: {
        type: 'number',
        description: 'Ano das despesas (2008 até ano atual)'
      },
      mes: {
        type: 'number',
        description: 'Mês das despesas (1-12)'
      },
      tipoDespesa: {
        type: 'string',
        description: 'Tipo de despesa'
      },
      fornecedor: {
        type: 'string',
        description: 'Nome do fornecedor'
      },
      pagina: {
        type: 'number',
        description: 'Número da página (padrão: 1)'
      },
      itens: {
        type: 'number',
        description: 'Itens por página (1-100, padrão: 25)'
      },
      ordem: {
        type: 'string',
        description: 'Ordem de ordenação',
        enum: ['ASC', 'DESC']
      },
      ordenarPor: {
        type: 'string',
        description: 'Campo para ordenação',
        enum: ['ano', 'mes', 'dataDocumento', 'valorDocumento', 'valorLiquido']
      }
    },
    required: ['id']
  },
  handler: despesasDeputado
};

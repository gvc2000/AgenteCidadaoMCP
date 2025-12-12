import { z, ZodError } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema, AnoSchema, MesSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';
import { formatZodError } from '../../core/errors.js';
import { formatCurrency } from '../../utils/currency.js';

const ResumoDespesasSchema = z.object({
  id: IdSchema,
  ano: AnoSchema.optional(),
  mes: MesSchema.optional(),
  tipoDespesa: z.string().optional()
});

export type ResumoDespesasParams = z.infer<typeof ResumoDespesasSchema>;

interface DespesaResumida {
  tipoDespesa: string;
  quantidade: number;
  valorTotal: number;
  valorTotalFormatado: string;
  maiorGasto: number;
  maiorGastoFormatado: string;
}

export async function resumoDespesasDeputado(params: ResumoDespesasParams) {
  const startTime = Date.now();

  try {
    // Validação
    let validated: ResumoDespesasParams;
    try {
      validated = ResumoDespesasSchema.parse(params);
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

    // Preparar parâmetros - buscar TODAS as despesas do período
    const { id, ...queryParams } = validated;

    // API call - pegar todas as despesas (itens=100 é o máximo permitido)
    const response = await camaraAPI.getWithPagination(
      `/deputados/${id}/despesas`,
      { ...queryParams, itens: 100 }
    );

    const despesas = response.dados || [];

    // Agregação por tipo de despesa
    const agregacao = new Map<string, {
      quantidade: number;
      valorTotal: number;
      valores: number[];
    }>();

    for (const despesa of despesas) {
      const tipo = (despesa as any).tipoDespesa || 'NÃO ESPECIFICADO';
      const valor = (despesa as any).valorLiquido || 0;

      if (!agregacao.has(tipo)) {
        agregacao.set(tipo, { quantidade: 0, valorTotal: 0, valores: [] });
      }

      const agg = agregacao.get(tipo)!;
      agg.quantidade++;
      agg.valorTotal += valor;
      agg.valores.push(valor);
    }

    // Transformar em array e ordenar por valor total
    const porTipo: DespesaResumida[] = Array.from(agregacao.entries())
      .map(([tipo, agg]) => ({
        tipoDespesa: tipo,
        quantidade: agg.quantidade,
        valorTotal: agg.valorTotal,
        valorTotalFormatado: formatCurrency(agg.valorTotal),
        maiorGasto: Math.max(...agg.valores),
        maiorGastoFormatado: formatCurrency(Math.max(...agg.valores))
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal);

    // Calcular totais gerais
    const totalGeral = despesas.reduce((sum: number, d: any) => sum + (d.valorLiquido || 0), 0);
    const totalDocumentos = despesas.length;

    // Top 10 maiores gastos individuais (sem todos os detalhes)
    const maioresGastos = despesas
      .sort((a: any, b: any) => (b.valorLiquido || 0) - (a.valorLiquido || 0))
      .slice(0, 10)
      .map((d: any) => ({
        data: d.dataDocumento,
        tipoDespesa: d.tipoDespesa,
        fornecedor: d.nomeFornecedor,
        valor: d.valorLiquido,
        valorFormatado: formatCurrency(d.valorLiquido)
      }));

    const result = {
      resumo: {
        totalGeral,
        totalGeralFormatado: formatCurrency(totalGeral),
        totalDocumentos,
        mediaGasto: totalDocumentos > 0 ? totalGeral / totalDocumentos : 0,
        mediaGastoFormatado: formatCurrency(totalDocumentos > 0 ? totalGeral / totalDocumentos : 0),
        periodo: validated.ano && validated.mes
          ? `${validated.mes}/${validated.ano}`
          : validated.ano
          ? `${validated.ano}`
          : 'Todos os períodos disponíveis'
      },
      porTipo,
      maioresGastos,
      _metadata: {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2',
        totalRegistrosAnalisados: totalDocumentos,
        observacao: 'Resumo otimizado para agentes - retorna agregações ao invés de lista completa'
      }
    };

    // Cache set
    cacheManager.set('despesas', cacheKey, result);

    // Métricas
    metricsCollector.incrementToolCall('resumo_despesas_deputado');
    metricsCollector.recordLatency('resumo_despesas_deputado', Date.now() - startTime);

    logToolCall('resumo_despesas_deputado', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('resumo_despesas_deputado');
    throw error;
  }
}

export const resumoDespesasDeputadoTool = {
  name: 'resumo_despesas_deputado',
  description: `Retorna um RESUMO OTIMIZADO das despesas de um deputado, ideal para agentes com limitações de contexto.

  Ao invés de retornar centenas de documentos fiscais individuais, retorna:
  - Total gasto agregado por TIPO de despesa (ex: passagens, combustíveis, etc.)
  - Top 10 maiores gastos individuais
  - Estatísticas (total, média, quantidade de documentos)

  Use esta ferramenta preferencialmente ao invés de 'despesas_deputado' quando precisar de visão geral.
  Use 'despesas_deputado' apenas se precisar ver TODOS os documentos detalhados.`,
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'ID do deputado. OBRIGATÓRIO. Use buscar_deputados para obter o ID'
      },
      ano: {
        type: 'number',
        description: 'Ano das despesas (2008 até ano atual). Recomendado: sempre especifique o ano para reduzir volume de dados',
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
        description: 'Filtrar por tipo específico de despesa',
        examples: ['PASSAGEM AÉREA', 'COMBUSTÍVEIS', 'ALIMENTAÇÃO']
      }
    },
    required: ['id']
  },
  handler: resumoDespesasDeputado
};

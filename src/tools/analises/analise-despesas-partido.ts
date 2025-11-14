import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { AnoSchema, MesSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const AnaliseDespesasPartidoSchema = z.object({
  siglaPartido: z.string().min(2).max(10),
  ano: AnoSchema,
  mes: MesSchema.optional(),
  tipoAgregacao: z.enum(['total', 'media', 'categoria']).default('total')
});

export type AnaliseDespesasPartidoParams = z.infer<typeof AnaliseDespesasPartidoSchema>;

export async function analiseDespesasPartido(params: AnaliseDespesasPartidoParams) {
  const startTime = Date.now();

  try {
    const validated = AnaliseDespesasPartidoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('analises', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { siglaPartido, ano, mes, tipoAgregacao } = validated;

    // Buscar membros do partido
    const partidoResponse = await camaraAPI.get<any>('/partidos', {
      sigla: siglaPartido,
      itens: 1
    });

    if (!partidoResponse.dados || partidoResponse.dados.length === 0) {
      throw new Error(`Partido ${siglaPartido} não encontrado`);
    }

    const partido = partidoResponse.dados[0];
    const idPartido = partido.id;

    // Buscar membros do partido
    const membrosResponse = await camaraAPI.get<any>(`/partidos/${idPartido}/membros`);
    const membros = membrosResponse.dados || [];

    // Buscar despesas de cada membro
    let totalGeral = 0;
    const despesasPorDeputado: Array<{
      deputado: string;
      id: number;
      total: number;
      quantidadeDespesas: number;
    }> = [];

    const despesasPorCategoria: Record<string, number> = {};

    // Limitar a amostra para não sobrecarregar a API
    const amostra = membros.slice(0, 20);

    for (const membro of amostra) {
      try {
        const queryParams: any = { ano, itens: 100 };
        if (mes) queryParams.mes = mes;

        const despesasResponse = await camaraAPI.get<any>(
          `/deputados/${membro.id}/despesas`,
          queryParams
        );

        const despesas = despesasResponse.dados || [];
        let totalDeputado = 0;

        despesas.forEach((desp: any) => {
          const valor = desp.valorDocumento || 0;
          totalDeputado += valor;
          totalGeral += valor;

          // Agregar por categoria
          const categoria = desp.tipoDespesa || 'Não especificado';
          despesasPorCategoria[categoria] = (despesasPorCategoria[categoria] || 0) + valor;
        });

        despesasPorDeputado.push({
          deputado: membro.nome || 'Desconhecido',
          id: membro.id,
          total: totalDeputado,
          quantidadeDespesas: despesas.length
        });
      } catch (error) {
        // Continuar mesmo se falhar para um deputado
        console.error(`Erro ao buscar despesas do deputado ${membro.id}:`, error);
      }
    }

    // Ordenar deputados por gasto
    despesasPorDeputado.sort((a, b) => b.total - a.total);

    // Preparar categorias ordenadas
    const categorias = Object.entries(despesasPorCategoria)
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor);

    const media = despesasPorDeputado.length > 0
      ? totalGeral / despesasPorDeputado.length
      : 0;

    let resultadoPrincipal: any;

    switch (tipoAgregacao) {
      case 'total':
        resultadoPrincipal = {
          totalGeral,
          quantidadeDeputados: despesasPorDeputado.length,
          maioresGastadores: despesasPorDeputado.slice(0, 10)
        };
        break;
      case 'media':
        resultadoPrincipal = {
          mediaGeral: media,
          totalGeral,
          quantidadeDeputados: despesasPorDeputado.length,
          acimaDaMedia: despesasPorDeputado.filter(d => d.total > media).length,
          abaixoDaMedia: despesasPorDeputado.filter(d => d.total <= media).length
        };
        break;
      case 'categoria':
        resultadoPrincipal = {
          totalPorCategoria: categorias,
          categoriaComMaiorGasto: categorias[0],
          totalGeral,
          quantidadeCategorias: categorias.length
        };
        break;
    }

    const result = {
      partido: {
        sigla: siglaPartido,
        id: idPartido,
        nome: partido.nome
      },
      parametros: {
        ano,
        mes: mes || 'Todos os meses',
        tipoAgregacao
      },
      resumo: resultadoPrincipal,
      detalhamento: {
        deputados: despesasPorDeputado,
        categorias: categorias.slice(0, 10)
      },
      _metadata: {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2',
        analiseGeradaEm: new Date().toISOString(),
        observacao: `Análise baseada em amostra de ${amostra.length} deputados de ${membros.length} membros do partido`
      }
    };

    cacheManager.set('analises', cacheKey, result);
    metricsCollector.incrementToolCall('analise_despesas_partido');
    logToolCall('analise_despesas_partido', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('analise_despesas_partido');
    throw error;
  }
}

export const analiseDespesasPartidoTool = {
  name: 'analise_despesas_partido',
  description: 'Analisa e agrega despesas dos deputados de um partido em um período, com totais, médias ou por categoria',
  inputSchema: {
    type: 'object',
    properties: {
      siglaPartido: {
        type: 'string',
        description: 'Sigla do partido (ex: PT, PSDB, PL)'
      },
      ano: {
        type: 'number',
        description: 'Ano para análise'
      },
      mes: {
        type: 'number',
        description: 'Mês específico (1-12, opcional)'
      },
      tipoAgregacao: {
        type: 'string',
        enum: ['total', 'media', 'categoria'],
        description: 'Tipo de agregação: total (soma), media (média por deputado) ou categoria (por tipo de despesa)'
      }
    },
    required: ['siglaPartido', 'ano']
  },
  handler: analiseDespesasPartido
};

import { z, ZodError } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';
import { formatZodError } from '../../core/errors.js';
import {
  resumirTexto,
  extrairPalavrasChave,
  agruparPorTema
} from '../../utils/text-summarizer.js';

const ResumoDiscursosSchema = z.object({
  id: IdSchema,
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  keywords: z.string().optional()
});

export type ResumoDiscursosParams = z.infer<typeof ResumoDiscursosSchema>;

interface DiscursoResumido {
  data: string;
  tipoDiscurso: string;
  resumo: string;
  palavrasChave: string[];
  faseEvento?: string;
}

interface TemaDiscurso {
  tema: string;
  quantidade: number;
  percentual: number;
}

export async function resumoDiscursosDeputado(params: ResumoDiscursosParams) {
  const startTime = Date.now();

  try {
    // Validação
    let validated: ResumoDiscursosParams;
    try {
      validated = ResumoDiscursosSchema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        throw formatZodError(error);
      }
      throw error;
    }

    // Cache check
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('deputados', cacheKey);
    if (cached) {
      return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    }

    // Preparar parâmetros - buscar TODOS os discursos do período
    // IMPORTANTE: API não aceita 'keywords', apenas dataInicio/dataFim
    const { id, keywords, ...queryParams } = validated;

    // API call - pegar todos os discursos (itens=100 é o máximo permitido)
    const response = await camaraAPI.getWithPagination(
      `/deputados/${id}/discursos`,
      { ...queryParams, itens: 100 }
    );

    const discursos = response.dados || [];

    if (discursos.length === 0) {
      return {
        resumo: {
          totalDiscursos: 0,
          periodo: validated.dataInicio && validated.dataFim
            ? `${validated.dataInicio} a ${validated.dataFim}`
            : 'Período consultado',
          mensagem: 'Nenhum discurso encontrado para o período especificado'
        },
        porTema: [],
        discursosDestaque: [],
        _metadata: {
          cache: false,
          latencyMs: Date.now() - startTime,
          apiVersion: 'v2',
          totalDiscursosAnalisados: 0,
          observacao: 'Nenhum discurso encontrado'
        }
      };
    }

    // Extrair textos dos discursos
    const textosCompletos = discursos.map((d: any) => d.transcricao || d.sumario || '');

    // Identificar temas principais (usados para validação interna)
    // const temasPrincipais = identificarTemasprincipais(textosCompletos, 10);

    // Preparar dados para agrupamento
    const discursosComId = discursos.map((d: any, idx: number) => ({
      id: idx,
      texto: d.transcricao || d.sumario || '',
      data: d.dataHoraInicio,
      tipo: d.tipoDiscurso,
      fase: d.faseEvento,
      urlTexto: d.urlTexto
    }));

    // Agrupar por tema
    const gruposPorTema = agruparPorTema(discursosComId, 5);

    // Transformar em formato de saída
    const porTema: TemaDiscurso[] = Array.from(gruposPorTema.entries()).map(([tema, items]) => ({
      tema,
      quantidade: items.length,
      percentual: Math.round((items.length / discursos.length) * 100)
    }));

    // Selecionar discursos-destaque
    let discursosParaDestacar = discursos;

    // Se keywords fornecidas, filtrar por relevância
    if (keywords) {
      const keywordsLower = keywords.toLowerCase();
      discursosParaDestacar = discursos.filter((d: any) => {
        const texto = (d.transcricao || d.sumario || '').toLowerCase();
        return texto.includes(keywordsLower);
      });
    }

    // Ordenar por data (mais recentes primeiro) e pegar top 10
    const top10 = discursosParaDestacar
      .sort((a: any, b: any) => {
        const dateA = new Date(a.dataHoraInicio || 0).getTime();
        const dateB = new Date(b.dataHoraInicio || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 10);

    // Resumir cada discurso-destaque
    const discursosDestaque: DiscursoResumido[] = top10.map((d: any) => {
      const textoCompleto = d.transcricao || d.sumario || '';
      const resumo = resumirTexto({ textoCompleto, maxPalavras: 150, preservarInicio: true });
      const palavrasChave = extrairPalavrasChave(textoCompleto, 5);

      return {
        data: d.dataHoraInicio || 'Data não disponível',
        tipoDiscurso: d.tipoDiscurso || 'Não especificado',
        resumo,
        palavrasChave,
        faseEvento: d.faseEvento
      };
    });

    // Estatísticas por tipo de discurso
    const tiposDiscurso = new Map<string, number>();
    for (const d of discursos) {
      const tipo = (d as any).tipoDiscurso || 'Não especificado';
      tiposDiscurso.set(tipo, (tiposDiscurso.get(tipo) || 0) + 1);
    }

    const porTipoDiscurso = Array.from(tiposDiscurso.entries())
      .map(([tipo, quantidade]) => ({
        tipo,
        quantidade,
        percentual: Math.round((quantidade / discursos.length) * 100)
      }))
      .sort((a, b) => b.quantidade - a.quantidade);

    // Palavras-chave gerais
    const todosTextos = textosCompletos.join(' ');
    const palavrasChaveGerais = extrairPalavrasChave(todosTextos, 15);

    const result = {
      resumo: {
        totalDiscursos: discursos.length,
        periodo: validated.dataInicio && validated.dataFim
          ? `${validated.dataInicio} a ${validated.dataFim}`
          : 'Todos os períodos disponíveis',
        palavrasChaveMaisFrequentes: palavrasChaveGerais,
        primeiroDiscurso: discursos.length > 0
          ? (discursos[discursos.length - 1] as any).dataHoraInicio
          : null,
        ultimoDiscurso: discursos.length > 0
          ? (discursos[0] as any).dataHoraInicio
          : null
      },
      porTema,
      porTipoDiscurso,
      discursosDestaque,
      _metadata: {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2',
        totalDiscursosAnalisados: discursos.length,
        discursosRetornados: discursosDestaque.length,
        observacao: keywords
          ? `Filtrado por palavras-chave: "${keywords}". Total antes do filtro: ${discursos.length}`
          : 'Resumo otimizado - retorna agregações e top 10 discursos resumidos. Use discursos_deputado com filtros para textos completos.'
      }
    };

    // Cache set
    cacheManager.set('deputados', cacheKey, result);

    // Métricas
    metricsCollector.incrementToolCall('resumo_discursos_deputado');
    metricsCollector.recordLatency('resumo_discursos_deputado', Date.now() - startTime);

    logToolCall('resumo_discursos_deputado', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('resumo_discursos_deputado');
    throw error;
  }
}

export const resumoDiscursosDeputadoTool = {
  name: 'resumo_discursos_deputado',
  description: `Retorna um RESUMO OTIMIZADO dos discursos de um deputado, ideal para agentes com limitações de contexto.

  Ao invés de retornar o texto completo de dezenas/centenas de discursos (que pode exceder 500KB), retorna:
  - Estatísticas gerais (total, distribuição por tema e tipo)
  - Palavras-chave mais frequentes nos discursos
  - Top 10 discursos mais recentes/relevantes RESUMIDOS (~150 palavras cada)
  - Agrupamento por tema detectado automaticamente

  Use esta ferramenta preferencialmente ao invés de 'discursos_deputado' quando precisar de visão geral.
  Use 'discursos_deputado' apenas se precisar ler textos completos de discursos específicos.`,
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'ID do deputado. OBRIGATÓRIO. Use buscar_deputados para obter o ID'
      },
      dataInicio: {
        type: 'string',
        description: 'Data de início no formato YYYY-MM-DD. Use para períodos específicos',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        examples: ['2024-01-01', '2024-06-01']
      },
      dataFim: {
        type: 'string',
        description: 'Data de fim no formato YYYY-MM-DD. Use junto com dataInicio',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        examples: ['2024-12-31', '2024-06-30']
      },
      keywords: {
        type: 'string',
        description: 'Palavras-chave para filtrar discursos mais relevantes. Os discursos-destaque priorizarão os que contêm essas palavras',
        examples: ['educação', 'saúde', 'segurança pública', 'meio ambiente']
      }
    },
    required: ['id']
  },
  handler: resumoDiscursosDeputado
};

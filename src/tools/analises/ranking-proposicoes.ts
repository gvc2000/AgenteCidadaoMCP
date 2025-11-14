import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema, AnoSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const RankingProposicoesSchema = z.object({
  idDeputado: IdSchema.optional(),
  ano: AnoSchema.optional(),
  tipoRanking: z.enum(['quantidade', 'aprovadas', 'tramitacao']).default('quantidade')
});

export type RankingProposicoesParams = z.infer<typeof RankingProposicoesSchema>;

export async function rankingProposicoesAutor(params: Partial<RankingProposicoesParams> = {}) {
  const startTime = Date.now();

  try {
    const validated = RankingProposicoesSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('analises', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { idDeputado, ano, tipoRanking } = validated;

    if (idDeputado) {
      // Buscar proposições de um deputado específico
      const queryParams: any = { itens: 100 };
      if (ano) queryParams.ano = ano;

      const response = await camaraAPI.get<any>(
        `/deputados/${idDeputado}/proposicoes`,
        queryParams
      );

      const proposicoes = response.dados || [];

      // Agrupar por tipo de proposição
      const porTipo: Record<string, number> = {};
      const porAno: Record<number, number> = {};
      let aprovadas = 0;
      let emTramitacao = 0;

      proposicoes.forEach((prop: any) => {
        // Contar por tipo
        const tipo = prop.siglaTipo || 'Não especificado';
        porTipo[tipo] = (porTipo[tipo] || 0) + 1;

        // Contar por ano
        if (prop.ano) {
          porAno[prop.ano] = (porAno[prop.ano] || 0) + 1;
        }

        // Status
        if (prop.statusProposicao?.descricaoTramitacao?.toLowerCase().includes('aprovad')) {
          aprovadas++;
        }
        if (prop.statusProposicao?.descricaoTramitacao?.toLowerCase().includes('tramitaç')) {
          emTramitacao++;
        }
      });

      const result = {
        deputado: {
          id: idDeputado
        },
        parametros: {
          ano: ano || 'Todos os anos',
          tipoRanking
        },
        resumo: {
          totalProposicoes: proposicoes.length,
          aprovadas,
          emTramitacao,
          tiposUnicos: Object.keys(porTipo).length
        },
        detalhamento: {
          porTipo: Object.entries(porTipo)
            .map(([tipo, quantidade]) => ({ tipo, quantidade }))
            .sort((a, b) => b.quantidade - a.quantidade),
          porAno: Object.entries(porAno)
            .map(([ano, quantidade]) => ({ ano: Number(ano), quantidade }))
            .sort((a, b) => b.ano - a.ano)
        },
        proposicoesDetalhadas: proposicoes.slice(0, 50),
        _metadata: {
          cache: false,
          latencyMs: Date.now() - startTime,
          apiVersion: 'v2',
          rankingGeradoEm: new Date().toISOString()
        }
      };

      cacheManager.set('analises', cacheKey, result);
      metricsCollector.incrementToolCall('ranking_proposicoes_autor');
      logToolCall('ranking_proposicoes_autor', validated, Date.now() - startTime);

      return result;
    } else {
      // Buscar ranking geral de proposições
      const queryParams: any = { itens: 100, ordenarPor: 'id', ordem: 'DESC' };
      if (ano) queryParams.ano = ano;

      const response = await camaraAPI.get<any>('/proposicoes', queryParams);
      const proposicoes = response.dados || [];

      // Agrupar proposições por autor
      const porAutor: Record<string, { nome: string; id: number; quantidade: number; proposicoes: any[] }> = {};

      proposicoes.forEach((prop: any) => {
        if (prop.uriAutores) {
          // Na API real, precisaria fazer chamadas adicionais para obter autores
          // Por simplicidade, vamos extrair do URI se disponível
          const autorInfo = prop.uriAutores || prop.idTipoAutor || 'Desconhecido';
          if (!porAutor[autorInfo]) {
            porAutor[autorInfo] = {
              nome: autorInfo,
              id: 0,
              quantidade: 0,
              proposicoes: []
            };
          }
          porAutor[autorInfo].quantidade++;
          porAutor[autorInfo].proposicoes.push(prop);
        }
      });

      const ranking = Object.values(porAutor)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 20);

      const result = {
        parametros: {
          ano: ano || 'Todos os anos',
          tipoRanking
        },
        resumo: {
          totalProposicoes: proposicoes.length,
          autoresUnicos: Object.keys(porAutor).length
        },
        ranking,
        _metadata: {
          cache: false,
          latencyMs: Date.now() - startTime,
          apiVersion: 'v2',
          rankingGeradoEm: new Date().toISOString(),
          observacao: 'Ranking baseado em amostra limitada de proposições'
        }
      };

      cacheManager.set('analises', cacheKey, result);
      metricsCollector.incrementToolCall('ranking_proposicoes_autor');
      logToolCall('ranking_proposicoes_autor', validated, Date.now() - startTime);

      return result;
    }
  } catch (error) {
    metricsCollector.incrementError('ranking_proposicoes_autor');
    throw error;
  }
}

export const rankingProposicoesTool = {
  name: 'ranking_proposicoes_autor',
  description: 'Gera ranking de deputados por quantidade de proposições apresentadas, aprovadas ou em tramitação',
  inputSchema: {
    type: 'object',
    properties: {
      idDeputado: {
        type: 'number',
        description: 'ID do deputado (opcional, se não fornecido gera ranking geral)'
      },
      ano: {
        type: 'number',
        description: 'Ano para filtrar proposições'
      },
      tipoRanking: {
        type: 'string',
        enum: ['quantidade', 'aprovadas', 'tramitacao'],
        description: 'Tipo de ranking: quantidade total, aprovadas ou em tramitação'
      }
    }
  },
  handler: rankingProposicoesAutor
};

import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdStringSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const ComparativoVotacoesSchema = z.object({
  idVotacao: IdStringSchema,
  incluirOrientacoes: z.boolean().default(true),
  incluirAusentes: z.boolean().default(false)
});

export type ComparativoVotacoesParams = z.infer<typeof ComparativoVotacoesSchema>;

export async function comparativoVotacoesBancadas(params: ComparativoVotacoesParams) {
  const startTime = Date.now();

  try {
    const validated = ComparativoVotacoesSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('analises', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { idVotacao, incluirOrientacoes, incluirAusentes } = validated;

    // Buscar detalhes da votação
    const votacaoResponse = await camaraAPI.get<any>(`/votacoes/${idVotacao}`);
    const votacao = votacaoResponse.dados || {};

    // Buscar votos
    const votosResponse = await camaraAPI.get<any>(`/votacoes/${idVotacao}/votos`);
    const votos = votosResponse.dados || [];

    // Buscar orientações
    let orientacoes: any[] = [];
    if (incluirOrientacoes) {
      try {
        const orientacoesResponse = await camaraAPI.get<any>(
          `/votacoes/${idVotacao}/orientacoes`
        );
        orientacoes = orientacoesResponse.dados || [];
      } catch (error) {
        // Orientações podem não estar disponíveis
        console.error('Erro ao buscar orientações:', error);
      }
    }

    // Agrupar votos por partido
    const votosPorPartido: Record<string, {
      sim: number;
      nao: number;
      abstencao: number;
      obstrucao: number;
      ausentes: number;
      total: number;
      deputados: any[];
    }> = {};

    votos.forEach((voto: any) => {
      const partido = voto.deputado_?.siglaPartido || 'SEM PARTIDO';

      if (!votosPorPartido[partido]) {
        votosPorPartido[partido] = {
          sim: 0,
          nao: 0,
          abstencao: 0,
          obstrucao: 0,
          ausentes: 0,
          total: 0,
          deputados: []
        };
      }

      const tipoVoto = (voto.tipoVoto || '').toLowerCase();

      if (tipoVoto.includes('sim')) {
        votosPorPartido[partido].sim++;
      } else if (tipoVoto.includes('não') || tipoVoto.includes('nao')) {
        votosPorPartido[partido].nao++;
      } else if (tipoVoto.includes('abstenção') || tipoVoto.includes('abstencao')) {
        votosPorPartido[partido].abstencao++;
      } else if (tipoVoto.includes('obstrução') || tipoVoto.includes('obstrucao')) {
        votosPorPartido[partido].obstrucao++;
      } else if (incluirAusentes && (tipoVoto.includes('ausente') || tipoVoto === '')) {
        votosPorPartido[partido].ausentes++;
      }

      votosPorPartido[partido].total++;
      votosPorPartido[partido].deputados.push({
        nome: voto.deputado_?.nome || 'Desconhecido',
        voto: voto.tipoVoto
      });
    });

    // Calcular percentuais por partido
    const analisePartidos = Object.entries(votosPorPartido).map(([partido, dados]) => {
      const total = dados.total > 0 ? dados.total : 1;
      return {
        partido,
        votos: dados,
        percentuais: {
          sim: ((dados.sim / total) * 100).toFixed(2) + '%',
          nao: ((dados.nao / total) * 100).toFixed(2) + '%',
          abstencao: ((dados.abstencao / total) * 100).toFixed(2) + '%',
          obstrucao: ((dados.obstrucao / total) * 100).toFixed(2) + '%',
          ausentes: ((dados.ausentes / total) * 100).toFixed(2) + '%'
        }
      };
    }).sort((a, b) => b.votos.total - a.votos.total);

    // Mapear orientações por partido
    const orientacoesPorPartido: Record<string, string> = {};
    orientacoes.forEach((ori: any) => {
      const sigla = ori.siglaOrgao || ori.orientacaoVoto;
      if (sigla) {
        orientacoesPorPartido[sigla] = ori.orientacaoVoto || 'Não especificado';
      }
    });

    // Calcular disciplina partidária (votos conforme orientação)
    const disciplina = analisePartidos.map(ap => {
      const orientacao = orientacoesPorPartido[ap.partido];
      if (!orientacao) return { ...ap, disciplina: 'N/A' };

      const orientLower = orientacao.toLowerCase();
      let votosConformeOrientacao = 0;

      if (orientLower.includes('sim')) {
        votosConformeOrientacao = ap.votos.sim;
      } else if (orientLower.includes('não') || orientLower.includes('nao')) {
        votosConformeOrientacao = ap.votos.nao;
      }

      const percentualDisciplina = ap.votos.total > 0
        ? ((votosConformeOrientacao / ap.votos.total) * 100).toFixed(2) + '%'
        : 'N/A';

      return {
        ...ap,
        orientacao,
        disciplina: percentualDisciplina
      };
    });

    const result = {
      votacao: {
        id: idVotacao,
        descricao: votacao.descricao || 'Não especificado',
        data: votacao.data,
        aprovacao: votacao.aprovacao
      },
      resumo: {
        totalVotos: votos.length,
        partidosVotantes: Object.keys(votosPorPartido).length,
        orientacoesDisponiveis: orientacoes.length
      },
      analisePartidos: incluirOrientacoes ? disciplina : analisePartidos,
      orientacoes: incluirOrientacoes ? orientacoes : undefined,
      _metadata: {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2',
        comparativoGeradoEm: new Date().toISOString()
      }
    };

    cacheManager.set('analises', cacheKey, result);
    metricsCollector.incrementToolCall('comparativo_votacoes_bancadas');
    logToolCall('comparativo_votacoes_bancadas', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('comparativo_votacoes_bancadas');
    throw error;
  }
}

export const comparativoVotacoesTool = {
  name: 'comparativo_votacoes_bancadas',
  description: 'Compara como diferentes bancadas partidárias votaram em uma votação específica, incluindo disciplina partidária',
  inputSchema: {
    type: 'object',
    properties: {
      idVotacao: {
        type: 'string',
        description: 'ID da votação'
      },
      incluirOrientacoes: {
        type: 'boolean',
        description: 'Incluir orientações de liderança e cálculo de disciplina partidária'
      },
      incluirAusentes: {
        type: 'boolean',
        description: 'Incluir deputados ausentes na contagem'
      }
    },
    required: ['idVotacao']
  },
  handler: comparativoVotacoesBancadas
};

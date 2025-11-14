import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const TimelineTramitacaoSchema = z.object({
  idProposicao: IdSchema,
  formato: z.enum(['resumido', 'completo']).default('resumido')
});

export type TimelineTramitacaoParams = z.infer<typeof TimelineTramitacaoSchema>;

export async function timelineTramitacao(params: TimelineTramitacaoParams) {
  const startTime = Date.now();

  try {
    const validated = TimelineTramitacaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('analises', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { idProposicao, formato } = validated;

    // Buscar detalhes da proposição
    const proposicaoResponse = await camaraAPI.get<any>(`/proposicoes/${idProposicao}`);
    const proposicao = proposicaoResponse.dados || {};

    // Buscar tramitações
    const tramitacoesResponse = await camaraAPI.get<any>(
      `/proposicoes/${idProposicao}/tramitacoes`,
      { itens: 100, ordem: 'ASC', ordenarPor: 'dataHora' }
    );
    const tramitacoes = tramitacoesResponse.dados || [];

    // Processar timeline
    const eventos = tramitacoes.map((tram: any, index: number) => {
      const evento: any = {
        sequencia: index + 1,
        data: tram.dataHora || 'Data não especificada',
        descricao: tram.descricaoTramitacao || 'Sem descrição',
        orgao: tram.siglaOrgao || 'Não especificado'
      };

      if (formato === 'completo') {
        evento.despacho = tram.despacho;
        evento.regime = tram.regime;
        evento.url = tram.url;
        evento.detalhes = {
          codTipoTramitacao: tram.codTipoTramitacao,
          uriOrgao: tram.uriOrgao,
          uriUltimoRelator: tram.uriUltimoRelator
        };
      }

      return evento;
    });

    // Identificar marcos importantes
    const marcos = eventos.filter((evt: any) => {
      const desc = (evt.descricao || '').toLowerCase();
      return (
        desc.includes('aprovad') ||
        desc.includes('rejeitad') ||
        desc.includes('arquivad') ||
        desc.includes('apresentaç') ||
        desc.includes('sanção') ||
        desc.includes('veto') ||
        desc.includes('promulgaç')
      );
    });

    // Calcular estatísticas
    const primeiroEvento = eventos[0];
    const ultimoEvento = eventos[eventos.length - 1];

    let diasTramitacao = 0;
    if (primeiroEvento && ultimoEvento) {
      const dataInicio = new Date(primeiroEvento.data);
      const dataFim = new Date(ultimoEvento.data);
      diasTramitacao = Math.floor((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Agrupar por órgão
    const porOrgao: Record<string, number> = {};
    eventos.forEach((evt: any) => {
      const orgao = evt.orgao;
      porOrgao[orgao] = (porOrgao[orgao] || 0) + 1;
    });

    const orgaosMaisAtivos = Object.entries(porOrgao)
      .map(([orgao, quantidade]) => ({ orgao, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    const result = {
      proposicao: {
        id: idProposicao,
        siglaTipo: proposicao.siglaTipo,
        numero: proposicao.numero,
        ano: proposicao.ano,
        ementa: formato === 'completo' ? proposicao.ementa : undefined,
        statusAtual: proposicao.statusProposicao?.descricaoTramitacao
      },
      resumo: {
        totalEventos: eventos.length,
        marcosImportantes: marcos.length,
        diasEmTramitacao: diasTramitacao,
        orgaosEnvolvidos: Object.keys(porOrgao).length,
        primeiroEvento: primeiroEvento?.data,
        ultimoEvento: ultimoEvento?.data
      },
      marcos,
      timeline: formato === 'resumido' ? eventos.slice(0, 20) : eventos,
      estatisticas: {
        orgaosMaisAtivos,
        mediaEventosPorOrgao: Object.keys(porOrgao).length > 0
          ? (eventos.length / Object.keys(porOrgao).length).toFixed(2)
          : '0'
      },
      _metadata: {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2',
        timelineGeradaEm: new Date().toISOString(),
        formato
      }
    };

    cacheManager.set('analises', cacheKey, result);
    metricsCollector.incrementToolCall('timeline_tramitacao');
    logToolCall('timeline_tramitacao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('timeline_tramitacao');
    throw error;
  }
}

export const timelineTramitacaoTool = {
  name: 'timeline_tramitacao',
  description: 'Gera uma linha do tempo visual da tramitação de uma proposição com marcos importantes e estatísticas',
  inputSchema: {
    type: 'object',
    properties: {
      idProposicao: {
        type: 'number',
        description: 'ID da proposição'
      },
      formato: {
        type: 'string',
        enum: ['resumido', 'completo'],
        description: 'Formato da timeline: resumido (principais eventos) ou completo (todos os detalhes)'
      }
    },
    required: ['idProposicao']
  },
  handler: timelineTramitacao
};

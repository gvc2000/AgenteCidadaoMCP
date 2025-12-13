import { z, ZodError } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';
import { formatZodError } from '../../core/errors.js';

const ResumoTramitacaoSchema = z.object({
  id: IdSchema,
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional()
});

export type ResumoTramitacaoParams = z.infer<typeof ResumoTramitacaoSchema>;

interface EventoChave {
  data: string;
  tipo: string;
  descricao: string;
  orgao?: string;
  regime?: string;
}

interface ComissaoTramitacao {
  sigla: string;
  nome: string;
  status: string;
  dataEntrada?: string;
  dataSaida?: string;
  tempoTramitacao?: string;
}

/**
 * Detecta tipo de evento-chave baseado na descrição da tramitação
 */
function detectarTipoEvento(descricao: string, _orgao: string): string {
  const descLower = descricao.toLowerCase();

  // Eventos de apresentação
  if (descLower.includes('apresenta')) {
    return 'Apresentação';
  }

  // Eventos de aprovação/rejeição
  if (descLower.includes('aprovad')) {
    return 'Aprovação';
  }
  if (descLower.includes('rejeitad')) {
    return 'Rejeição';
  }

  // Eventos de designação
  if (descLower.includes('designad') && descLower.includes('relator')) {
    return 'Designação de Relator';
  }

  // Eventos de parecer
  if (descLower.includes('parecer')) {
    return 'Parecer';
  }

  // Eventos de votação
  if (descLower.includes('votaç') || descLower.includes('plenário')) {
    return 'Votação';
  }

  // Eventos de inclusão em pauta
  if (descLower.includes('pauta') || descLower.includes('incluí')) {
    return 'Inclusão em Pauta';
  }

  // Eventos de sanção/veto
  if (descLower.includes('sanç')) {
    return 'Sanção';
  }
  if (descLower.includes('veto')) {
    return 'Veto';
  }

  // Eventos de promulgação
  if (descLower.includes('promulg')) {
    return 'Promulgação';
  }

  // Eventos de publicação
  if (descLower.includes('public')) {
    return 'Publicação';
  }

  // Eventos de arquivamento
  if (descLower.includes('arquiv')) {
    return 'Arquivamento';
  }

  // Eventos de retirada
  if (descLower.includes('retirad')) {
    return 'Retirada';
  }

  // Despachos e movimentações administrativas (menos importantes)
  if (descLower.includes('despacho')) {
    return 'Despacho';
  }

  if (descLower.includes('encaminh') || descLower.includes('distribu')) {
    return 'Encaminhamento';
  }

  // Default
  return 'Tramitação';
}

/**
 * Verifica se um evento é considerado "chave" (importante)
 */
function isEventoChave(tipo: string): boolean {
  const tiposChave = [
    'Apresentação',
    'Aprovação',
    'Rejeição',
    'Designação de Relator',
    'Parecer',
    'Votação',
    'Inclusão em Pauta',
    'Sanção',
    'Veto',
    'Promulgação',
    'Publicação',
    'Arquivamento',
    'Retirada'
  ];

  return tiposChave.includes(tipo);
}

/**
 * Calcula tempo de tramitação entre duas datas
 */
function calcularTempo(dataInicio: string, dataFim: string): string {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);

  const diffMs = fim.getTime() - inicio.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} dias`;
  }

  const months = Math.floor(diffDays / 30);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years > 0) {
    return remainingMonths > 0
      ? `${years} ${years === 1 ? 'ano' : 'anos'}, ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`
      : `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }

  return `${months} ${months === 1 ? 'mês' : 'meses'}`;
}

export async function resumoTramitacaoProposicao(params: ResumoTramitacaoParams) {
  const startTime = Date.now();

  try {
    // Validação
    let validated: ResumoTramitacaoParams;
    try {
      validated = ResumoTramitacaoSchema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        throw formatZodError(error);
      }
      throw error;
    }

    // Cache check
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('proposicoes', cacheKey);
    if (cached) {
      return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    }

    // Preparar parâmetros - buscar TODAS as tramitações
    const { id, ...queryParams } = validated;

    // API call - pegar todas as tramitações (itens=100 é o máximo)
    const response = await camaraAPI.getWithPagination(
      `/proposicoes/${id}/tramitacoes`,
      { ...queryParams, itens: 100, ordem: 'ASC', ordenarPor: 'dataHora' } // Ordem cronológica
    );

    const tramitacoes = response.dados || [];

    if (tramitacoes.length === 0) {
      return {
        resumo: {
          totalTramitacoes: 0,
          mensagem: 'Nenhuma tramitação encontrada para o período especificado'
        },
        eventosChave: [],
        comissoes: [],
        _metadata: {
          cache: false,
          latencyMs: Date.now() - startTime,
          apiVersion: 'v2',
          totalTramitacoesAnalisadas: 0,
          observacao: 'Nenhuma tramitação encontrada'
        }
      };
    }

    // Identificar eventos-chave
    const eventosChave: EventoChave[] = [];
    const comissoesMap = new Map<string, { nome: string; tramitacoes: any[] }>();

    for (const tram of tramitacoes) {
      const tipo = detectarTipoEvento(
        (tram as any).descricaoTramitacao || '',
        (tram as any).siglaOrgao || ''
      );

      // Se é evento-chave, adicionar
      if (isEventoChave(tipo)) {
        eventosChave.push({
          data: (tram as any).dataHora || 'Data não disponível',
          tipo,
          descricao: (tram as any).despacho || (tram as any).descricaoTramitacao || 'Sem descrição',
          orgao: (tram as any).siglaOrgao,
          regime: (tram as any).regime
        });
      }

      // Rastrear tramitação por comissões
      const siglaOrgao = (tram as any).siglaOrgao;
      if (siglaOrgao && siglaOrgao !== 'PLEN' && siglaOrgao !== 'MESA') {
        if (!comissoesMap.has(siglaOrgao)) {
          comissoesMap.set(siglaOrgao, {
            nome: (tram as any).nomeOrgao || siglaOrgao,
            tramitacoes: []
          });
        }
        comissoesMap.get(siglaOrgao)!.tramitacoes.push(tram);
      }
    }

    // Limitar a no máximo 20 eventos-chave mais importantes
    // Se tiver muitos, priorizar os que não são "Despacho" ou "Encaminhamento"
    let eventosFiltrados = eventosChave;
    if (eventosChave.length > 20) {
      const eventosPrioritarios = eventosChave.filter(
        e => e.tipo !== 'Despacho' && e.tipo !== 'Encaminhamento' && e.tipo !== 'Tramitação'
      );

      eventosFiltrados = eventosPrioritarios.length > 20
        ? eventosPrioritarios.slice(0, 20)
        : [...eventosPrioritarios, ...eventosChave.slice(0, 20 - eventosPrioritarios.length)];
    }

    // Processar comissões
    const comissoes: ComissaoTramitacao[] = Array.from(comissoesMap.entries()).map(
      ([sigla, info]) => {
        const tramsDaComissao = info.tramitacoes;
        const dataEntrada = tramsDaComissao.length > 0
          ? (tramsDaComissao[0] as any).dataHora
          : undefined;
        const dataSaida = tramsDaComissao.length > 0
          ? (tramsDaComissao[tramsDaComissao.length - 1] as any).dataHora
          : undefined;

        // Detectar status baseado nas tramitações
        let status = 'Em análise';
        const ultimaTram = tramsDaComissao[tramsDaComissao.length - 1];
        const descUltima = ((ultimaTram as any).descricaoTramitacao || '').toLowerCase();

        if (descUltima.includes('aprovad')) {
          status = 'Aprovado';
        } else if (descUltima.includes('rejeitad')) {
          status = 'Rejeitado';
        } else if (descUltima.includes('arquiv')) {
          status = 'Arquivado';
        }

        const tempoTramitacao = dataEntrada && dataSaida
          ? calcularTempo(dataEntrada, dataSaida)
          : undefined;

        return {
          sigla,
          nome: info.nome,
          status,
          dataEntrada,
          dataSaida,
          tempoTramitacao
        };
      }
    );

    // Calcular estatísticas gerais
    const primeiraTramitacao = tramitacoes.length > 0 ? (tramitacoes[0] as any).dataHora : null;
    const ultimaTramitacao = tramitacoes.length > 0
      ? (tramitacoes[tramitacoes.length - 1] as any).dataHora
      : null;

    const tempoTotalTramitacao = primeiraTramitacao && ultimaTramitacao
      ? calcularTempo(primeiraTramitacao, ultimaTramitacao)
      : 'Não calculado';

    // Status atual baseado na última tramitação
    const statusAtual = tramitacoes.length > 0
      ? (tramitacoes[tramitacoes.length - 1] as any).despacho ||
        (tramitacoes[tramitacoes.length - 1] as any).descricaoTramitacao ||
        'Sem informação'
      : 'Sem tramitações';

    const result = {
      resumo: {
        totalTramitacoes: tramitacoes.length,
        totalEventosChave: eventosFiltrados.length,
        dataApresentacao: primeiraTramitacao,
        ultimaMovimentacao: ultimaTramitacao,
        tempoTramitacao: tempoTotalTramitacao,
        statusAtual: statusAtual.length > 200 ? statusAtual.substring(0, 200) + '...' : statusAtual
      },
      eventosChave: eventosFiltrados,
      comissoes: comissoes.sort((a, b) => {
        // Ordenar por data de entrada (mais antiga primeiro)
        if (!a.dataEntrada) return 1;
        if (!b.dataEntrada) return -1;
        return new Date(a.dataEntrada).getTime() - new Date(b.dataEntrada).getTime();
      }),
      _metadata: {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2',
        totalTramitacoesAnalisadas: tramitacoes.length,
        eventosChaveRetornados: eventosFiltrados.length,
        observacao:
          tramitacoes.length > 100
            ? `Atenção: Proposição tem mais de 100 tramitações. Retornando eventos-chave resumidos. Use tramitacoes_proposicao com dataInicio/dataFim para ver detalhes de período específico.`
            : 'Resumo otimizado - retorna apenas eventos-chave. Use tramitacoes_proposicao para lista completa com todos os despachos.'
      }
    };

    // Cache set
    cacheManager.set('proposicoes', cacheKey, result);

    // Métricas
    metricsCollector.incrementToolCall('resumo_tramitacao_proposicao');
    metricsCollector.recordLatency('resumo_tramitacao_proposicao', Date.now() - startTime);

    logToolCall('resumo_tramitacao_proposicao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('resumo_tramitacao_proposicao');
    throw error;
  }
}

export const resumoTramitacaoProposicaoTool = {
  name: 'resumo_tramitacao_proposicao',
  description: `Retorna um RESUMO OTIMIZADO do histórico de tramitação de uma proposição, ideal para agentes com limitações de contexto.

  Ao invés de retornar todas as centenas de tramitações (muitas repetitivas), retorna:
  - Estatísticas gerais (total de tramitações, tempo de tramitação, status atual)
  - Apenas EVENTOS-CHAVE: apresentação, designações, aprovações, votações, sanções (máximo 20)
  - Lista de comissões por onde passou, com status e tempo de tramitação
  - Timeline resumida focada nos marcos importantes

  Use esta ferramenta preferencialmente ao invés de 'tramitacoes_proposicao' quando precisar de visão geral.
  Use 'tramitacoes_proposicao' apenas se precisar ver TODOS os despachos e movimentações detalhadas de um período específico.`,
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'ID da proposição. OBRIGATÓRIO. Use buscar_proposicoes para obter o ID'
      },
      dataInicio: {
        type: 'string',
        description: 'Data de início no formato YYYY-MM-DD. Use para filtrar tramitações de período específico',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        examples: ['2024-01-01', '2023-06-01']
      },
      dataFim: {
        type: 'string',
        description: 'Data de fim no formato YYYY-MM-DD. Use junto com dataInicio',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        examples: ['2024-12-31', '2023-12-31']
      }
    },
    required: ['id']
  },
  handler: resumoTramitacaoProposicao
};

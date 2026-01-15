import { z, ZodError } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';
import { formatZodError } from '../../core/errors.js';

const HistoricoVotosSchema = z.object({
    idDeputado: IdSchema,
    dataInicio: DateSchema.optional(),
    dataFim: DateSchema.optional(),
    itens: z.number().int().min(1).max(100).default(30).optional()
});

export type HistoricoVotosParams = z.infer<typeof HistoricoVotosSchema>;

interface VotoDeputado {
    votacaoId: string;
    data: string;
    proposicao: string;
    descricaoVotacao: string;
    votoDeputado: string;
    orientacaoGoverno: string | null;
    orientacaoPartido: string | null;
    resultado: string | null;
    tema: string | null;
}

interface AlinhamentoOrientacao {
    alinhado: number;
    desalinhado: number;
    semOrientacao: number;
    percentualAlinhamento: string;
}

interface TemaMaisVotado {
    tema: string;
    aFavor: number;
    contra: number;
    abstencao: number;
    total: number;
}

export async function historicoVotosDeputado(params: HistoricoVotosParams) {
    const startTime = Date.now();

    try {
        // Validação
        let validated: HistoricoVotosParams;
        try {
            validated = HistoricoVotosSchema.parse(params);
        } catch (error) {
            if (error instanceof ZodError) {
                throw formatZodError(error);
            }
            throw error;
        }

        // Cache check
        const cacheKey = createCacheKey({ ...validated, tool: 'historico_votos_deputado' });
        const cached = cacheManager.get<any>('votacoes', cacheKey);
        if (cached) {
            return { ...cached, _metadata: { ...cached._metadata, cache: true } };
        }

        const { idDeputado, dataInicio, dataFim, itens = 30 } = validated;

        // Primeiro, buscar dados do deputado
        const deputadoResponse = await camaraAPI.get<any>(`/deputados/${idDeputado}`);
        const deputado = deputadoResponse.dados || {};
        const partidoDeputado = deputado.ultimoStatus?.siglaPartido || '';

        // Buscar últimas votações
        const votacoesParams: any = {
            ordem: 'DESC',
            ordenarPor: 'dataHoraRegistro',
            itens: Math.min(itens, 100)
        };
        if (dataInicio) votacoesParams.dataInicio = dataInicio;
        if (dataFim) votacoesParams.dataFim = dataFim;

        const votacoesResponse = await camaraAPI.get<any>('/votacoes', votacoesParams);
        const votacoes = votacoesResponse.dados || [];

        // Para cada votação, buscar votos e orientações
        const votosDeputado: VotoDeputado[] = [];
        const alinhamentoGoverno: AlinhamentoOrientacao = { alinhado: 0, desalinhado: 0, semOrientacao: 0, percentualAlinhamento: '0%' };
        const alinhamentoPartido: AlinhamentoOrientacao = { alinhado: 0, desalinhado: 0, semOrientacao: 0, percentualAlinhamento: '0%' };
        const temaContagem: Map<string, { aFavor: number; contra: number; abstencao: number }> = new Map();

        let totalSim = 0;
        let totalNao = 0;
        let totalAbstencao = 0;
        let totalObstrucao = 0;
        let votacoesEncontradas = 0;

        // Processar votações em paralelo (máximo 10 de cada vez para não sobrecarregar)
        const batchSize = 10;
        for (let i = 0; i < votacoes.length; i += batchSize) {
            const batch = votacoes.slice(i, i + batchSize);

            const batchResults = await Promise.all(
                batch.map(async (votacao: any) => {
                    try {
                        // Buscar votos da votação
                        const votosResponse = await camaraAPI.get<any>(`/votacoes/${votacao.id}/votos`);
                        const votos = votosResponse.dados || [];

                        // Encontrar o voto do deputado
                        const votoDeputado = votos.find((v: any) =>
                            v.deputado_?.id === idDeputado || v.deputado_?.uri?.includes(`/${idDeputado}`)
                        );

                        if (!votoDeputado) return null;

                        // Buscar orientações
                        let orientacaoGoverno: string | null = null;
                        let orientacaoPartido: string | null = null;
                        try {
                            const orientacoesResponse = await camaraAPI.get<any>(`/votacoes/${votacao.id}/orientacoes`);
                            const orientacoes = orientacoesResponse.dados || [];

                            // Encontrar orientação do Governo
                            const oriGov = orientacoes.find((o: any) =>
                                o.siglaOrgao === 'GOV.' || o.siglaOrgao === 'Governo' ||
                                o.siglaOrgao?.toLowerCase().includes('gov')
                            );
                            if (oriGov) orientacaoGoverno = oriGov.orientacaoVoto;

                            // Encontrar orientação do partido do deputado
                            const oriPartido = orientacoes.find((o: any) =>
                                o.siglaOrgao === partidoDeputado
                            );
                            if (oriPartido) orientacaoPartido = oriPartido.orientacaoVoto;
                        } catch {
                            // Orientações podem não estar disponíveis
                        }

                        // Extrair tema da proposição (se disponível)
                        let tema: string | null = null;
                        if (votacao.proposicaoObjeto) {
                            // Tentar extrair tema do título/ementa
                            const ementa = votacao.proposicaoObjeto.toLowerCase();
                            if (ementa.includes('tribut') || ementa.includes('imposto') || ementa.includes('fiscal')) {
                                tema = 'Tributação';
                            } else if (ementa.includes('saúde') || ementa.includes('saude') || ementa.includes('sus')) {
                                tema = 'Saúde';
                            } else if (ementa.includes('educa') || ementa.includes('escola') || ementa.includes('ensino')) {
                                tema = 'Educação';
                            } else if (ementa.includes('segurança') || ementa.includes('seguranca') || ementa.includes('polícia')) {
                                tema = 'Segurança';
                            } else if (ementa.includes('meio ambiente') || ementa.includes('ambiental') || ementa.includes('clima')) {
                                tema = 'Meio Ambiente';
                            } else if (ementa.includes('econom') || ementa.includes('financeir')) {
                                tema = 'Economia';
                            } else if (ementa.includes('trabalh') || ementa.includes('emprego')) {
                                tema = 'Trabalho';
                            } else if (ementa.includes('orçament') || ementa.includes('orcament') || ementa.includes('loa') || ementa.includes('ldo')) {
                                tema = 'Orçamento';
                            } else if (ementa.includes('previdên') || ementa.includes('previden') || ementa.includes('aposentad')) {
                                tema = 'Previdência';
                            } else {
                                tema = 'Outros';
                            }
                        }

                        const tipoVoto = (votoDeputado.tipoVoto || '').toLowerCase();

                        return {
                            votacao,
                            votoDeputado,
                            tipoVoto,
                            orientacaoGoverno,
                            orientacaoPartido,
                            tema
                        };
                    } catch {
                        return null;
                    }
                })
            );

            // Processar resultados do batch
            for (const result of batchResults) {
                if (!result) continue;

                const { votacao, votoDeputado, tipoVoto, orientacaoGoverno, orientacaoPartido, tema } = result;
                votacoesEncontradas++;

                // Contar tipos de voto
                if (tipoVoto.includes('sim')) {
                    totalSim++;
                } else if (tipoVoto.includes('não') || tipoVoto.includes('nao')) {
                    totalNao++;
                } else if (tipoVoto.includes('abstenção') || tipoVoto.includes('abstencao')) {
                    totalAbstencao++;
                } else if (tipoVoto.includes('obstrução') || tipoVoto.includes('obstrucao')) {
                    totalObstrucao++;
                }

                // Calcular alinhamento com Governo
                if (orientacaoGoverno) {
                    const oriGovLower = orientacaoGoverno.toLowerCase();
                    if (oriGovLower.includes('sim') && tipoVoto.includes('sim')) {
                        alinhamentoGoverno.alinhado++;
                    } else if ((oriGovLower.includes('não') || oriGovLower.includes('nao')) &&
                        (tipoVoto.includes('não') || tipoVoto.includes('nao'))) {
                        alinhamentoGoverno.alinhado++;
                    } else if (!oriGovLower.includes('liber')) {
                        alinhamentoGoverno.desalinhado++;
                    }
                } else {
                    alinhamentoGoverno.semOrientacao++;
                }

                // Calcular alinhamento com Partido
                if (orientacaoPartido) {
                    const oriPartidoLower = orientacaoPartido.toLowerCase();
                    if (oriPartidoLower.includes('sim') && tipoVoto.includes('sim')) {
                        alinhamentoPartido.alinhado++;
                    } else if ((oriPartidoLower.includes('não') || oriPartidoLower.includes('nao')) &&
                        (tipoVoto.includes('não') || tipoVoto.includes('nao'))) {
                        alinhamentoPartido.alinhado++;
                    } else if (!oriPartidoLower.includes('liber')) {
                        alinhamentoPartido.desalinhado++;
                    }
                } else {
                    alinhamentoPartido.semOrientacao++;
                }

                // Contagem por tema
                if (tema) {
                    if (!temaContagem.has(tema)) {
                        temaContagem.set(tema, { aFavor: 0, contra: 0, abstencao: 0 });
                    }
                    const contagem = temaContagem.get(tema)!;
                    if (tipoVoto.includes('sim')) {
                        contagem.aFavor++;
                    } else if (tipoVoto.includes('não') || tipoVoto.includes('nao')) {
                        contagem.contra++;
                    } else {
                        contagem.abstencao++;
                    }
                }

                // Adicionar à lista de votos
                votosDeputado.push({
                    votacaoId: votacao.id,
                    data: votacao.dataHoraRegistro?.split('T')[0] || votacao.data || '',
                    proposicao: votacao.proposicaoObjeto || votacao.descricao || 'Não especificada',
                    descricaoVotacao: votacao.descricao || '',
                    votoDeputado: votoDeputado.tipoVoto || 'Não registrado',
                    orientacaoGoverno,
                    orientacaoPartido,
                    resultado: votacao.aprovacao !== undefined
                        ? (votacao.aprovacao ? 'Aprovado' : 'Rejeitado')
                        : null,
                    tema
                });
            }
        }

        // Calcular percentuais de alinhamento
        const totalComOrientacaoGov = alinhamentoGoverno.alinhado + alinhamentoGoverno.desalinhado;
        if (totalComOrientacaoGov > 0) {
            alinhamentoGoverno.percentualAlinhamento =
                ((alinhamentoGoverno.alinhado / totalComOrientacaoGov) * 100).toFixed(1) + '%';
        }

        const totalComOrientacaoPartido = alinhamentoPartido.alinhado + alinhamentoPartido.desalinhado;
        if (totalComOrientacaoPartido > 0) {
            alinhamentoPartido.percentualAlinhamento =
                ((alinhamentoPartido.alinhado / totalComOrientacaoPartido) * 100).toFixed(1) + '%';
        }

        // Converter temas para array ordenado
        const temasMaisVotados: TemaMaisVotado[] = Array.from(temaContagem.entries())
            .map(([tema, contagem]) => ({
                tema,
                aFavor: contagem.aFavor,
                contra: contagem.contra,
                abstencao: contagem.abstencao,
                total: contagem.aFavor + contagem.contra + contagem.abstencao
            }))
            .sort((a, b) => b.total - a.total);

        const result = {
            deputado: {
                id: idDeputado,
                nome: deputado.ultimoStatus?.nome || deputado.nomeCivil || 'Não encontrado',
                partido: partidoDeputado,
                uf: deputado.ultimoStatus?.siglaUf || ''
            },
            periodo: {
                inicio: dataInicio || 'Não especificado',
                fim: dataFim || 'Não especificado',
                votacoesAnalisadas: votacoes.length,
                votacoesComParticipacao: votacoesEncontradas
            },
            resumo: {
                totalVotacoes: votacoesEncontradas,
                votosAFavor: totalSim,
                votosContra: totalNao,
                abstencoes: totalAbstencao,
                obstrucoes: totalObstrucao
            },
            alinhamentoOrientacoes: {
                Governo: alinhamentoGoverno,
                [partidoDeputado || 'Partido']: alinhamentoPartido
            },
            temasMaisVotados: temasMaisVotados.slice(0, 10),
            votacoes: votosDeputado.slice(0, 20), // Limitar para não estourar contexto
            _metadata: {
                cache: false,
                latencyMs: Date.now() - startTime,
                apiVersion: 'v2',
                observacao: 'Histórico de votos com análise de alinhamento e temas'
            }
        };

        // Cache set (TTL menor para votações que mudam frequentemente)
        cacheManager.set('votacoes', cacheKey, result);

        // Métricas
        metricsCollector.incrementToolCall('historico_votos_deputado');
        metricsCollector.recordLatency('historico_votos_deputado', Date.now() - startTime);

        logToolCall('historico_votos_deputado', validated, Date.now() - startTime);

        return result;
    } catch (error) {
        metricsCollector.incrementError('historico_votos_deputado');
        throw error;
    }
}

export const historicoVotosDeputadoTool = {
    name: 'historico_votos_deputado',
    description: `Retorna o histórico de votos de um deputado específico com análise completa.

  Responde perguntas como:
  - "Como o deputado X votou nas últimas sessões?"
  - "Em quais temas o deputado X vota a favor?"
  - "O deputado X vota alinhado com o governo?"
  - "O deputado X segue a orientação do partido?"

  Retorna:
  - Lista das últimas votações com o voto do deputado
  - Resumo (total a favor, contra, abstenções)
  - Alinhamento com orientações do Governo e do Partido
  - Análise por temas (tributação, saúde, educação, etc.)
  
  Use buscar_deputados primeiro para obter o ID do deputado.`,
    inputSchema: {
        type: 'object',
        properties: {
            idDeputado: {
                type: 'number',
                description: 'ID do deputado. OBRIGATÓRIO. Use buscar_deputados para obter o ID'
            },
            dataInicio: {
                type: 'string',
                description: 'Data inicial para filtrar votações (formato: YYYY-MM-DD)',
                examples: ['2024-01-01', '2024-06-01']
            },
            dataFim: {
                type: 'string',
                description: 'Data final para filtrar votações (formato: YYYY-MM-DD)',
                examples: ['2024-12-31', '2024-06-30']
            },
            itens: {
                type: 'number',
                description: 'Quantidade de votações a analisar (padrão: 30, máximo: 100)',
                default: 30,
                minimum: 1,
                maximum: 100
            }
        },
        required: ['idDeputado']
    },
    handler: historicoVotosDeputado
};

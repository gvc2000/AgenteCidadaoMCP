import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const RankingPartidosTamanhoSchema = z.object({
    idLegislatura: z.number().int().positive().default(57).optional(),
    limite: z.number().int().min(1).max(30).default(15).optional()
});

export type RankingPartidosTamanhoParams = z.infer<typeof RankingPartidosTamanhoSchema>;

interface PartidoRanking {
    posicao: number;
    sigla: string;
    nome: string;
    id: number;
    totalMembros: number;
    totalPosse: number;
    lider: {
        nome: string;
        partido: string;
        uf: string;
    } | null;
}

export async function rankingPartidosTamanho(params: RankingPartidosTamanhoParams = {}) {
    const startTime = Date.now();

    try {
        const validated = RankingPartidosTamanhoSchema.parse(params);
        const cacheKey = createCacheKey({ tool: 'ranking_partidos_tamanho', ...validated });
        const cached = cacheManager.get<any>('analises', cacheKey);
        if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

        const idLegislatura = validated.idLegislatura || 57;
        const limite = validated.limite || 15;

        // Buscar todos os partidos da legislatura atual
        const partidosResponse = await camaraAPI.get<any>('/partidos', {
            idLegislatura,
            itens: 100,
            ordem: 'ASC',
            ordenarPor: 'sigla'
        });

        const partidos = partidosResponse.dados || [];

        // Buscar detalhes de cada partido para obter totalMembros
        const partidosComDetalhes: PartidoRanking[] = [];

        for (const partido of partidos) {
            try {
                const detalheResponse = await camaraAPI.get<any>(`/partidos/${partido.id}`);
                const detalhe = detalheResponse.dados;

                if (detalhe && detalhe.status) {
                    partidosComDetalhes.push({
                        posicao: 0, // será preenchido após ordenar
                        sigla: detalhe.sigla,
                        nome: detalhe.nome,
                        id: detalhe.id,
                        totalMembros: parseInt(detalhe.status.totalMembros) || 0,
                        totalPosse: parseInt(detalhe.status.totalPosse) || 0,
                        lider: detalhe.status.lider ? {
                            nome: detalhe.status.lider.nome,
                            partido: detalhe.status.lider.siglaPartido,
                            uf: detalhe.status.lider.uf
                        } : null
                    });
                }
            } catch (error) {
                // Log e continua para próximo partido
                console.error(`Erro ao buscar detalhes do partido ${partido.sigla}:`, error);
            }
        }

        // Ordenar por número de membros (decrescente)
        partidosComDetalhes.sort((a, b) => b.totalMembros - a.totalMembros);

        // Adicionar posição no ranking
        partidosComDetalhes.forEach((p, idx) => {
            p.posicao = idx + 1;
        });

        // Limitar resultados
        const ranking = partidosComDetalhes.slice(0, limite);

        // Calcular totais
        const totalDeputados = partidosComDetalhes.reduce((acc, p) => acc + p.totalMembros, 0);
        const totalPartidos = partidosComDetalhes.length;

        const result = {
            ranking,
            estatisticas: {
                totalPartidos,
                totalDeputados,
                legislatura: idLegislatura,
                partidoMaior: ranking[0]?.sigla || null,
                partidoMenor: partidosComDetalhes[partidosComDetalhes.length - 1]?.sigla || null
            },
            _metadata: {
                cache: false,
                latencyMs: Date.now() - startTime,
                apiVersion: 'v2',
                geradoEm: new Date().toISOString()
            }
        };

        cacheManager.set('analises', cacheKey, result);
        metricsCollector.incrementToolCall('ranking_partidos_tamanho');
        logToolCall('ranking_partidos_tamanho', validated, Date.now() - startTime);

        return result;
    } catch (error) {
        metricsCollector.incrementError('ranking_partidos_tamanho');
        throw error;
    }
}

export const rankingPartidosTamanhoTool = {
    name: 'ranking_partidos_tamanho',
    description: 'Retorna o ranking dos maiores partidos na Câmara por número de deputados. Ideal para perguntas como "Quais os maiores partidos?", "Qual o maior partido?", "Quantos deputados tem cada partido?"',
    inputSchema: {
        type: 'object',
        properties: {
            idLegislatura: {
                type: 'number',
                description: 'ID da legislatura (padrão: 57 = 2023-2027)'
            },
            limite: {
                type: 'number',
                description: 'Quantidade de partidos a retornar (padrão: 15, máx: 30)'
            }
        }
    },
    handler: rankingPartidosTamanho
};

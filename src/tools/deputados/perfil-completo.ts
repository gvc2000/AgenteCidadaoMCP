import { z } from 'zod';
import { detalharDeputado } from './detalhar.js';
import { despesasDeputado } from './despesas.js';
import { discursosDeputado } from './discursos.js';
import { frentesDeputado } from './frentes.js';
import { orgaosDeputado } from './orgaos.js';
import { ocupacoesDeputado } from './ocupacoes.js';
import { profissoesDeputado } from './profissoes.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const ObterPerfilCompletoSchema = z.object({
    id: IdSchema
});

export type ObterPerfilCompletoParams = z.infer<typeof ObterPerfilCompletoSchema>;

export async function obterPerfilCompleto(params: ObterPerfilCompletoParams) {
    const startTime = Date.now();
    const { id } = params;

    try {
        // Executar chamadas em paralelo
        const [
            detalhes,
            despesas,
            discursos,
            frentes,
            orgaos,
            ocupacoes,
            profissoes
        ] = await Promise.all([
            detalharDeputado({ id }),
            despesasDeputado({ id, itens: 10, ordenarPor: 'dataDocumento', ordem: 'DESC' }), // Últimas 10 despesas
            discursosDeputado({ id, itens: 5 }), // Últimos 5 discursos
            frentesDeputado({ id }),
            orgaosDeputado({ id }),
            ocupacoesDeputado({ id }),
            profissoesDeputado({ id })
        ]);

        const result = {
            ...detalhes.deputado,
            ultimasDespesas: despesas.despesas,
            ultimosDiscursos: discursos.discursos,
            frentes: frentes.frentes,
            orgaos: orgaos.orgaos,
            ocupacoes: ocupacoes.ocupacoes,
            profissoes: profissoes.profissoes,
            _metadata: {
                latencyMs: Date.now() - startTime,
                aggregated: true
            }
        };

        logToolCall('obter_perfil_completo_deputado', params, Date.now() - startTime);
        metricsCollector.incrementToolCall('obter_perfil_completo_deputado');
        metricsCollector.recordLatency('obter_perfil_completo_deputado', Date.now() - startTime);

        return result;
    } catch (error) {
        metricsCollector.incrementError('obter_perfil_completo_deputado');
        throw error;
    }
}

export const obterPerfilCompletoTool = {
    name: 'obter_perfil_completo_deputado',
    description: 'Obtém TODOS os dados de um deputado (detalhes, despesas recentes, discursos, frentes, órgãos, etc) em uma única chamada paralela. Use isso preferencialmente para responder perguntas gerais sobre um parlamentar.',
    inputSchema: {
        type: 'object',
        properties: {
            id: {
                type: 'number',
                description: 'ID do deputado'
            }
        },
        required: ['id']
    },
    handler: obterPerfilCompleto
};

import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const AnalisePresencaSchema = z.object({
  idDeputado: IdSchema,
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional()
});

export type AnalisePresencaParams = z.infer<typeof AnalisePresencaSchema>;

export async function analisePresencaDeputado(params: AnalisePresencaParams) {
  const startTime = Date.now();

  try {
    const validated = AnalisePresencaSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('analises', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { idDeputado, dataInicio, dataFim } = validated;

    // Buscar eventos do deputado no período
    const queryParams: any = {};
    if (dataInicio) queryParams.dataInicio = dataInicio;
    if (dataFim) queryParams.dataFim = dataFim;

    const eventosResponse = await camaraAPI.get<any>(
      `/deputados/${idDeputado}/eventos`,
      queryParams
    );

    const eventos = eventosResponse.dados || [];

    // Calcular estatísticas de presença
    const totalEventos = eventos.length;

    // Agrupar por tipo de evento
    const porTipo: Record<string, number> = {};
    const porOrgao: Record<string, number> = {};

    eventos.forEach((evento: any) => {
      // Contar por tipo
      const tipo = evento.descricaoTipo || 'Não especificado';
      porTipo[tipo] = (porTipo[tipo] || 0) + 1;

      // Contar por órgão
      const orgao = evento.siglaOrgao || 'Não especificado';
      porOrgao[orgao] = (porOrgao[orgao] || 0) + 1;
    });

    // Ordenar por quantidade
    const tiposMaisFrequentes = Object.entries(porTipo)
      .map(([tipo, quantidade]) => ({ tipo, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    const orgaosMaisFrequentes = Object.entries(porOrgao)
      .map(([orgao, quantidade]) => ({ orgao, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 10);

    const result = {
      deputado: {
        id: idDeputado
      },
      periodo: {
        inicio: dataInicio || 'Sem limite',
        fim: dataFim || 'Sem limite'
      },
      resumo: {
        totalEventos,
        tiposUnicos: Object.keys(porTipo).length,
        orgaosUnicos: Object.keys(porOrgao).length
      },
      detalhamento: {
        porTipo: tiposMaisFrequentes,
        porOrgao: orgaosMaisFrequentes
      },
      eventosDetalhados: eventos.slice(0, 50), // Limitar a 50 para não sobrecarregar
      _metadata: {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2',
        analiseGeradaEm: new Date().toISOString()
      }
    };

    cacheManager.set('analises', cacheKey, result);
    metricsCollector.incrementToolCall('analise_presenca_deputado');
    logToolCall('analise_presenca_deputado', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('analise_presenca_deputado');
    throw error;
  }
}

export const analisePresencaTool = {
  name: 'analise_presenca_deputado',
  description: 'Analisa a presença e participação de um deputado em eventos (reuniões, sessões, audiências) em um período específico',
  inputSchema: {
    type: 'object',
    properties: {
      idDeputado: {
        type: 'number',
        description: 'ID do deputado'
      },
      dataInicio: {
        type: 'string',
        description: 'Data de início do período (YYYY-MM-DD)'
      },
      dataFim: {
        type: 'string',
        description: 'Data de fim do período (YYYY-MM-DD)'
      }
    },
    required: ['idDeputado']
  },
  handler: analisePresencaDeputado
};

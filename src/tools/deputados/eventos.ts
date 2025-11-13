import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const EventosDeputadoSchema = z.object({
  id: IdSchema,
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional()
});

export type EventosDeputadoParams = z.infer<typeof EventosDeputadoSchema>;

export async function eventosDeputado(params: EventosDeputadoParams) {
  const startTime = Date.now();

  try {
    const validated = EventosDeputadoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('eventos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id, ...queryParams } = validated;
    const response = await camaraAPI.getWithPagination(`/deputados/${id}/eventos`, queryParams);

    const result = {
      paginacao: createPaginacaoResposta(validated.pagina || 1, validated.itens || 25, response.dados.length),
      eventos: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('eventos', cacheKey, result);
    metricsCollector.incrementToolCall('eventos_deputado');
    logToolCall('eventos_deputado', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('eventos_deputado');
    throw error;
  }
}

export const eventosDeputadoTool = {
  name: 'eventos_deputado',
  description: 'Lista os eventos de que um deputado participou',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do deputado' },
      dataInicio: { type: 'string', description: 'Data de início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data de fim (YYYY-MM-DD)' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página' }
    },
    required: ['id']
  },
  handler: eventosDeputado
};

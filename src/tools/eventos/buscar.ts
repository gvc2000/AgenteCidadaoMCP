import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, DateSchema, HoraSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const BuscarEventosSchema = z.object({
  idTipoEvento: IdSchema.optional(),
  idSituacao: IdSchema.optional(),
  idOrgao: IdSchema.optional(),
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  horaInicio: HoraSchema.optional(),
  horaFim: HoraSchema.optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional(),
  ordem: z.enum(['ASC', 'DESC']).optional(),
  ordenarPor: z.enum(['dataHoraInicio', 'id']).optional()
});

export type BuscarEventosParams = z.infer<typeof BuscarEventosSchema>;

export async function buscarEventos(params: BuscarEventosParams = {}) {
  const startTime = Date.now();

  try {
    const validated = BuscarEventosSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('eventos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const response = await camaraAPI.getWithPagination('/eventos', validated);

    const result = {
      paginacao: createPaginacaoResposta(validated.pagina || 1, validated.itens || 25, response.dados.length),
      eventos: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('eventos', cacheKey, result);
    metricsCollector.incrementToolCall('buscar_eventos');
    logToolCall('buscar_eventos', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('buscar_eventos');
    throw error;
  }
}

export const buscarEventosTool = {
  name: 'buscar_eventos',
  description: 'Busca eventos da Câmara dos Deputados (reuniões, sessões, audiências, etc)',
  inputSchema: {
    type: 'object',
    properties: {
      idTipoEvento: { type: 'number', description: 'ID do tipo de evento' },
      idSituacao: { type: 'number', description: 'ID da situação do evento' },
      idOrgao: { type: 'number', description: 'ID do órgão' },
      dataInicio: { type: 'string', description: 'Data de início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data de fim (YYYY-MM-DD)' },
      horaInicio: { type: 'string', description: 'Hora de início (HH:MM)' },
      horaFim: { type: 'string', description: 'Hora de fim (HH:MM)' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página (1-100)' },
      ordem: { type: 'string', enum: ['ASC', 'DESC'], description: 'Ordem de listagem' },
      ordenarPor: { type: 'string', enum: ['dataHoraInicio', 'id'], description: 'Campo para ordenação' }
    }
  },
  handler: buscarEventos
};

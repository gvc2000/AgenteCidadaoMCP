import { z } from 'zod';
import { apiClient } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, CacheTTL } from '../../core/cache.js';
import { IdSchema, DateSchema, PaginationSchema } from '../../core/schemas.js';

export const EventosDeputadoParamsSchema = z
  .object({
    id: IdSchema,
    dataInicio: DateSchema.optional(),
    dataFim: DateSchema.optional(),
  })
  .merge(PaginationSchema);

export type EventosDeputadoParams = z.infer<typeof EventosDeputadoParamsSchema>;

export async function eventosDeputado(params: EventosDeputadoParams) {
  const validatedParams = EventosDeputadoParamsSchema.parse(params);
  const { id, ...queryParams } = validatedParams;

  const cacheKey = `eventos-deputado-${id}-${JSON.stringify(queryParams)}`;
  const cached = cacheManager.get('eventos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/deputados/${id}/eventos`, queryParams);
  const eventos = response.dados.map((e: any) => DataNormalizer.normalizeEvento(e));
  const paginacao = DataNormalizer.normalizePagination(response.links);

  const result = { paginacao, eventos };
  cacheManager.set('eventos', cacheKey, result, CacheTTL.eventos);

  return DataNormalizer.addMetadata(result, false);
}

export const eventosDeputadoTool = {
  name: 'eventos_deputado',
  description: 'Busca eventos em que um deputado participou ou está agendado para participar',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do deputado' },
      dataInicio: { type: 'string', description: 'Data início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data fim (YYYY-MM-DD)' },
      pagina: { type: 'number', default: 1 },
      itens: { type: 'number', default: 25 },
    },
    required: ['id'],
  },
};

import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const MembrosPartidoSchema = z.object({
  id: IdSchema,
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  idLegislatura: IdSchema.optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional()
});
export type MembrosPartidoParams = z.infer<typeof MembrosPartidoSchema>;

export async function membrosPartido(params: MembrosPartidoParams) {
  const startTime = Date.now();
  try {
    const validated = MembrosPartidoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('partidos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const { id, ...queryParams } = validated;
    const response = await camaraAPI.getWithPagination(`/partidos/${id}/membros`, queryParams);
    const result = {
      paginacao: createPaginacaoResposta(validated.pagina || 1, validated.itens || 25, response.dados.length),
      membros: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('partidos', cacheKey, result);
    metricsCollector.incrementToolCall('membros_partido');
    logToolCall('membros_partido', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('membros_partido');
    throw error;
  }
}

export const membrosPartidoTool = {
  name: 'membros_partido',
  description: 'Lista os membros (deputados) de um partido',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do partido' },
      dataInicio: { type: 'string', description: 'Data de início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data de fim (YYYY-MM-DD)' },
      idLegislatura: { type: 'number', description: 'ID da legislatura' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página (1-100)' }
    },
    required: ['id']
  },
  handler: membrosPartido
};

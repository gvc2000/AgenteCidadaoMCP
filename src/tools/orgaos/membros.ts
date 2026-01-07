import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const MembrosOrgaoSchema = z.object({
  id: IdSchema,
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(100).optional()  // Default 100 to get all members
});

export type MembrosOrgaoParams = z.infer<typeof MembrosOrgaoSchema>;

export async function membrosOrgao(params: MembrosOrgaoParams) {
  const startTime = Date.now();

  try {
    const validated = MembrosOrgaoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('orgaos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id, ...queryParams } = validated;
    // SEMPRE enviar itens=100 para garantir que todos os membros sejam retornados
    const response = await camaraAPI.getWithPagination(`/orgaos/${id}/membros`, { ...queryParams, itens: 100 });

    const result = {
      paginacao: createPaginacaoResposta(validated.pagina || 1, validated.itens || 100, response.dados.length),
      membros: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('orgaos', cacheKey, result);
    metricsCollector.incrementToolCall('membros_orgao');
    logToolCall('membros_orgao', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('membros_orgao');
    throw error;
  }
}

export const membrosOrgaoTool = {
  name: 'membros_orgao',
  description: 'Lista os membros de um órgão da Câmara',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do órgão' },
      dataInicio: { type: 'string', description: 'Data de início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data de fim (YYYY-MM-DD)' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página (1-100)' }
    },
    required: ['id']
  },
  handler: membrosOrgao
};

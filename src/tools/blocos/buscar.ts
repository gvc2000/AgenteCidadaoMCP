import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const BuscarBlocosSchema = z.object({
  idLegislatura: IdSchema.optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional()
});
export type BuscarBlocosParams = z.infer<typeof BuscarBlocosSchema>;

export async function buscarBlocos(params: BuscarBlocosParams = {}) {
  const startTime = Date.now();
  try {
    const validated = BuscarBlocosSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('blocos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.getWithPagination('/blocos', validated);
    const result = {
      paginacao: createPaginacaoResposta(validated.pagina || 1, validated.itens || 25, response.dados.length),
      blocos: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('blocos', cacheKey, result);
    metricsCollector.incrementToolCall('buscar_blocos');
    logToolCall('buscar_blocos', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('buscar_blocos');
    throw error;
  }
}

export const buscarBlocosTool = {
  name: 'buscar_blocos',
  description: 'Busca blocos parlamentares da Câmara dos Deputados',
  inputSchema: {
    type: 'object',
    properties: {
      idLegislatura: { type: 'number', description: 'ID da legislatura' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página (1-100)' }
    }
  },
  handler: buscarBlocos
};

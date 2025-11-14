import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const BuscarFrentesSchema = z.object({
  idLegislatura: IdSchema.optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional()
});
export type BuscarFrentesParams = z.infer<typeof BuscarFrentesSchema>;

export async function buscarFrentes(params: BuscarFrentesParams = {}) {
  const startTime = Date.now();
  try {
    const validated = BuscarFrentesSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('frentes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.getWithPagination('/frentes', validated);
    const result = {
      paginacao: createPaginacaoResposta(validated.pagina || 1, validated.itens || 25, response.dados.length),
      frentes: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('frentes', cacheKey, result);
    metricsCollector.incrementToolCall('buscar_frentes');
    logToolCall('buscar_frentes', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('buscar_frentes');
    throw error;
  }
}

export const buscarFrentesTool = {
  name: 'buscar_frentes',
  description: 'Busca frentes parlamentares da Câmara dos Deputados',
  inputSchema: {
    type: 'object',
    properties: {
      idLegislatura: { type: 'number', description: 'ID da legislatura' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página (1-100)' }
    }
  },
  handler: buscarFrentes
};

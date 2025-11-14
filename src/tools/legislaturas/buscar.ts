import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const BuscarLegislaturasSchema = z.object({
  data: DateSchema.optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional(),
  ordem: z.enum(['ASC', 'DESC']).optional(),
  ordenarPor: z.enum(['id']).optional()
});
export type BuscarLegislaturasParams = z.infer<typeof BuscarLegislaturasSchema>;

export async function buscarLegislaturas(params: BuscarLegislaturasParams = {}) {
  const startTime = Date.now();
  try {
    const validated = BuscarLegislaturasSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('legislaturas', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const response = await camaraAPI.getWithPagination('/legislaturas', validated);
    const result = {
      paginacao: createPaginacaoResposta(validated.pagina || 1, validated.itens || 25, response.dados.length),
      legislaturas: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('legislaturas', cacheKey, result);
    metricsCollector.incrementToolCall('buscar_legislaturas');
    logToolCall('buscar_legislaturas', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('buscar_legislaturas');
    throw error;
  }
}

export const buscarLegislaturasTool = {
  name: 'buscar_legislaturas',
  description: 'Busca legislaturas da Câmara dos Deputados',
  inputSchema: {
    type: 'object',
    properties: {
      data: { type: 'string', description: 'Busca por data (YYYY-MM-DD)' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página (1-100)' },
      ordem: { type: 'string', enum: ['ASC', 'DESC'], description: 'Ordem de listagem' },
      ordenarPor: { type: 'string', enum: ['id'], description: 'Campo para ordenação' }
    }
  },
  handler: buscarLegislaturas
};

import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const DiscursosDeputadoSchema = z.object({
  id: IdSchema,
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  keywords: z.string().optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional()
});

export type DiscursosDeputadoParams = z.infer<typeof DiscursosDeputadoSchema>;

export async function discursosDeputado(params: DiscursosDeputadoParams) {
  const startTime = Date.now();

  try {
    const validated = DiscursosDeputadoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('deputados', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id, ...queryParams } = validated;
    const response = await camaraAPI.getWithPagination(`/deputados/${id}/discursos`, queryParams);

    const result = {
      paginacao: createPaginacaoResposta(validated.pagina || 1, validated.itens || 25, response.dados.length),
      discursos: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('deputados', cacheKey, result);
    metricsCollector.incrementToolCall('discursos_deputado');
    logToolCall('discursos_deputado', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('discursos_deputado');
    throw error;
  }
}

export const discursosDeputadoTool = {
  name: 'discursos_deputado',
  description: 'Lista os discursos de um deputado',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do deputado' },
      dataInicio: { type: 'string', description: 'Data de início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data de fim (YYYY-MM-DD)' },
      keywords: { type: 'string', description: 'Palavras-chave para busca' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página' }
    },
    required: ['id']
  },
  handler: discursosDeputado
};

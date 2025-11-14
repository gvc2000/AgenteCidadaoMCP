import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const BuscarPartidosSchema = z.object({
  sigla: z.string().optional(),
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  idLegislatura: IdSchema.optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional(),
  ordem: z.enum(['ASC', 'DESC']).optional(),
  ordenarPor: z.enum(['id', 'sigla', 'nome']).optional()
});

export type BuscarPartidosParams = z.infer<typeof BuscarPartidosSchema>;

export async function buscarPartidos(params: BuscarPartidosParams = {}) {
  const startTime = Date.now();
  try {
    const validated = BuscarPartidosSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('partidos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    
    const response = await camaraAPI.getWithPagination('/partidos', validated);
    const result = {
      paginacao: createPaginacaoResposta(validated.pagina || 1, validated.itens || 25, response.dados.length),
      partidos: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('partidos', cacheKey, result);
    metricsCollector.incrementToolCall('buscar_partidos');
    logToolCall('buscar_partidos', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('buscar_partidos');
    throw error;
  }
}

export const buscarPartidosTool = {
  name: 'buscar_partidos',
  description: 'Busca partidos políticos representados na Câmara dos Deputados',
  inputSchema: {
    type: 'object',
    properties: {
      sigla: { type: 'string', description: 'Sigla do partido' },
      dataInicio: { type: 'string', description: 'Data de início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data de fim (YYYY-MM-DD)' },
      idLegislatura: { type: 'number', description: 'ID da legislatura' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página (1-100)' },
      ordem: { type: 'string', enum: ['ASC', 'DESC'], description: 'Ordem de listagem' },
      ordenarPor: { type: 'string', enum: ['id', 'sigla', 'nome'], description: 'Campo para ordenação' }
    }
  },
  handler: buscarPartidos
};

import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const BuscarOrgaosSchema = z.object({
  sigla: z.string().optional(),
  nome: z.string().optional(),
  idTipoOrgao: IdSchema.optional(),
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional(),
  ordem: z.enum(['ASC', 'DESC']).optional(),
  ordenarPor: z.enum(['id', 'sigla', 'nome']).optional()
});

export type BuscarOrgaosParams = z.infer<typeof BuscarOrgaosSchema>;

export async function buscarOrgaos(params: BuscarOrgaosParams = {}) {
  const startTime = Date.now();

  try {
    const validated = BuscarOrgaosSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('orgaos', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const response = await camaraAPI.getWithPagination('/orgaos', validated);

    const result = {
      paginacao: createPaginacaoResposta(validated.pagina || 1, validated.itens || 25, response.dados.length),
      orgaos: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('orgaos', cacheKey, result);
    metricsCollector.incrementToolCall('buscar_orgaos');
    logToolCall('buscar_orgaos', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('buscar_orgaos');
    throw error;
  }
}

export const buscarOrgaosTool = {
  name: 'buscar_orgaos',
  description: 'Busca órgãos da Câmara (comissões, mesas, conselhos, etc)',
  inputSchema: {
    type: 'object',
    properties: {
      sigla: { type: 'string', description: 'Sigla do órgão' },
      nome: { type: 'string', description: 'Nome do órgão' },
      idTipoOrgao: { type: 'number', description: 'ID do tipo de órgão' },
      dataInicio: { type: 'string', description: 'Data de início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data de fim (YYYY-MM-DD)' },
      pagina: { type: 'number', description: 'Número da página' },
      itens: { type: 'number', description: 'Itens por página (1-100)' },
      ordem: { type: 'string', enum: ['ASC', 'DESC'], description: 'Ordem de listagem' },
      ordenarPor: { type: 'string', enum: ['id', 'sigla', 'nome'], description: 'Campo para ordenação' }
    }
  },
  handler: buscarOrgaos
};

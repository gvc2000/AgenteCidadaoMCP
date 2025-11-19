import { z, ZodError } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, IdSchema, DateSchema, HoraSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';
import { formatZodError } from '../../core/errors.js';

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
    let validated: BuscarEventosParams;
    try {
      validated = BuscarEventosSchema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        throw formatZodError(error);
      }
      throw error;
    }
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
  description: 'Busca eventos da Câmara dos Deputados (reuniões, sessões, audiências). DICA: Use dataInicio + dataFim para buscar eventos em um período específico.',
  inputSchema: {
    type: 'object',
    properties: {
      idTipoEvento: {
        type: 'number',
        description: 'ID do tipo de evento. Use listar_tipos_evento para ver opções'
      },
      idSituacao: {
        type: 'number',
        description: 'ID da situação do evento (ex: realizado, cancelado)'
      },
      idOrgao: {
        type: 'number',
        description: 'ID do órgão. Use buscar_orgaos para obter o ID'
      },
      dataInicio: {
        type: 'string',
        description: 'Data de início do período. Formato: YYYY-MM-DD',
        examples: ['2024-01-01', '2024-11-01']
      },
      dataFim: {
        type: 'string',
        description: 'Data de fim do período. Formato: YYYY-MM-DD',
        examples: ['2024-12-31', '2024-11-30']
      },
      horaInicio: {
        type: 'string',
        description: 'Hora de início. Formato: HH:MM',
        examples: ['09:00', '14:00']
      },
      horaFim: {
        type: 'string',
        description: 'Hora de fim. Formato: HH:MM',
        examples: ['12:00', '18:00']
      },
      pagina: {
        type: 'number',
        description: 'Número da página (padrão: 1)',
        default: 1
      },
      itens: {
        type: 'number',
        description: 'Itens por página. Mínimo: 1, Máximo: 100 (padrão: 25)',
        default: 25,
        minimum: 1,
        maximum: 100
      },
      ordem: {
        type: 'string',
        enum: ['ASC', 'DESC'],
        description: 'Ordem de classificação',
        default: 'DESC'
      },
      ordenarPor: {
        type: 'string',
        enum: ['dataHoraInicio', 'id'],
        description: 'Campo para ordenação'
      }
    }
  },
  handler: buscarEventos
};

import { z } from 'zod';
import { apiClient } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, CacheTTL } from '../../core/cache.js';
import { IdSchema, DateSchema, PaginationSchema, KeywordsSchema } from '../../core/schemas.js';

export const DiscursosDeputadoParamsSchema = z
  .object({
    id: IdSchema,
    dataInicio: DateSchema.optional(),
    dataFim: DateSchema.optional(),
    palavraChave: KeywordsSchema.optional(),
  })
  .merge(PaginationSchema);

export type DiscursosDeputadoParams = z.infer<typeof DiscursosDeputadoParamsSchema>;

export interface DiscursosDeputadoResponse {
  paginacao: any;
  discursos: Array<{
    dataHoraInicio: string;
    dataHoraFim: string;
    urlTexto: string;
    urlAudio: string;
    urlVideo: string;
    keywords: string;
    sumario: string;
    transcricao: string;
    uriEvento: string;
    faseEvento: {
      titulo: string;
      dataHoraInicio: string;
      dataHoraFim: string;
    };
  }>;
  _metadata?: any;
}

export async function discursosDeputado(
  params: DiscursosDeputadoParams
): Promise<DiscursosDeputadoResponse> {
  const startTime = Date.now();

  const validatedParams = DiscursosDeputadoParamsSchema.parse(params);
  const { id, ...queryParams } = validatedParams;

  const cacheKey = `discursos-${id}-${JSON.stringify(queryParams)}`;

  const cached = cacheManager.get<DiscursosDeputadoResponse>('deputados', cacheKey);
  if (cached) {
    return DataNormalizer.addMetadata(cached, true, Date.now() - startTime);
  }

  const response = await apiClient.get<any>(`/deputados/${id}/discursos`, queryParams);

  const discursos = response.dados;
  const paginacao = DataNormalizer.normalizePagination(response.links);

  const result: DiscursosDeputadoResponse = {
    paginacao,
    discursos,
  };

  cacheManager.set('deputados', cacheKey, result, CacheTTL.deputados);

  return DataNormalizer.addMetadata(result, false, Date.now() - startTime);
}

export const discursosDeputadoTool = {
  name: 'discursos_deputado',
  description: `Busca discursos proferidos por um deputado em eventos da Câmara.

Retorna transcrições, áudios, vídeos e sumários dos discursos. Permite filtrar por período e palavras-chave.

Útil para análise de atuação parlamentar e posicionamentos do deputado.`,
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'ID do deputado',
      },
      dataInicio: {
        type: 'string',
        description: 'Data de início (YYYY-MM-DD)',
      },
      dataFim: {
        type: 'string',
        description: 'Data de fim (YYYY-MM-DD)',
      },
      palavraChave: {
        type: 'string',
        description: 'Palavras-chave para buscar nos discursos',
      },
      pagina: {
        type: 'number',
        default: 1,
      },
      itens: {
        type: 'number',
        default: 25,
      },
    },
    required: ['id'],
  },
};

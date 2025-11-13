import { z } from 'zod';
import { apiClient } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, CacheTTL } from '../../core/cache.js';
import {
  UFEnum,
  SexoEnum,
  OrdemEnum,
  PaginationSchema,
  LegislaturaSchema,
  DateSchema,
  SafeTextSchema,
} from '../../core/schemas.js';

// Schema de parâmetros
export const BuscarDeputadosParamsSchema = z
  .object({
    nome: SafeTextSchema.optional(),
    uf: UFEnum.optional(),
    partido: z.string().min(2).max(20).toUpperCase().optional(),
    sexo: SexoEnum.optional(),
    idLegislatura: LegislaturaSchema.optional(),
    dataInicio: DateSchema.optional(),
    dataFim: DateSchema.optional(),
    ordem: OrdemEnum.optional(),
    ordenarPor: z.enum(['id', 'idLegislatura', 'nome']).optional(),
  })
  .merge(PaginationSchema);

export type BuscarDeputadosParams = z.infer<typeof BuscarDeputadosParamsSchema>;

export interface BuscarDeputadosResponse {
  paginacao: {
    pagina: number;
    itens: number;
    total: number;
    totalPaginas: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  deputados: Array<{
    id: number;
    uri: string;
    nome: string;
    siglaPartido: string;
    uriPartido: string;
    siglaUf: string;
    idLegislatura: number;
    urlFoto: string;
    email: string;
  }>;
  _metadata?: {
    cache: boolean;
    latencyMs?: number;
    apiVersion: string;
    fetchedAt: string;
  };
}

export async function buscarDeputados(
  params: BuscarDeputadosParams
): Promise<BuscarDeputadosResponse> {
  const startTime = Date.now();

  // Validar parâmetros
  const validatedParams = BuscarDeputadosParamsSchema.parse(params);

  // Gerar chave de cache
  const cacheKey = JSON.stringify(validatedParams);

  // Verificar cache
  const cached = cacheManager.get<BuscarDeputadosResponse>('deputados', cacheKey);
  if (cached) {
    return DataNormalizer.addMetadata(cached, true, Date.now() - startTime);
  }

  // Fazer requisição
  const response = await apiClient.get<any>('/deputados', validatedParams);

  // Normalizar dados
  const deputados = response.dados.map((d: any) => DataNormalizer.normalizeDeputado(d));
  const paginacao = DataNormalizer.normalizePagination(response.links);

  const result: BuscarDeputadosResponse = {
    paginacao,
    deputados,
  };

  // Salvar no cache
  cacheManager.set('deputados', cacheKey, result, CacheTTL.deputados);

  return DataNormalizer.addMetadata(result, false, Date.now() - startTime);
}

export const buscarDeputadosTool = {
  name: 'buscar_deputados',
  description: `Busca deputados da Câmara dos Deputados do Brasil com filtros avançados.

Permite buscar deputados por nome, UF, partido, sexo, legislatura e período. Retorna informações básicas como nome, partido, UF, foto e contato.

Exemplos de uso:
- Buscar deputados de São Paulo do PT
- Listar deputadas mulheres
- Encontrar deputados de uma legislatura específica`,
  inputSchema: {
    type: 'object',
    properties: {
      nome: {
        type: 'string',
        description: 'Nome do deputado (mínimo 3 caracteres)',
      },
      uf: {
        type: 'string',
        enum: UFEnum.options,
        description: 'Unidade Federativa (sigla do estado)',
      },
      partido: {
        type: 'string',
        description: 'Sigla do partido',
      },
      sexo: {
        type: 'string',
        enum: ['M', 'F'],
        description: 'Sexo do deputado',
      },
      idLegislatura: {
        type: 'number',
        description: 'ID da legislatura (1-57)',
      },
      dataInicio: {
        type: 'string',
        description: 'Data de início do mandato (YYYY-MM-DD)',
      },
      dataFim: {
        type: 'string',
        description: 'Data de fim do mandato (YYYY-MM-DD)',
      },
      pagina: {
        type: 'number',
        description: 'Número da página (padrão: 1)',
        default: 1,
      },
      itens: {
        type: 'number',
        description: 'Itens por página (1-100, padrão: 25)',
        default: 25,
      },
      ordem: {
        type: 'string',
        enum: ['ASC', 'DESC'],
        description: 'Ordem de classificação',
      },
      ordenarPor: {
        type: 'string',
        enum: ['id', 'idLegislatura', 'nome'],
        description: 'Campo para ordenação',
      },
    },
  },
};

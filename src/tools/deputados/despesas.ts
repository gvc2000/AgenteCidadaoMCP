import { z } from 'zod';
import { apiClient } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, CacheTTL } from '../../core/cache.js';
import { IdSchema, AnoSchema, MesSchema, PaginationSchema, OrdemEnum } from '../../core/schemas.js';

export const DespesasDeputadoParamsSchema = z
  .object({
    id: IdSchema,
    ano: AnoSchema.optional(),
    mes: MesSchema.optional(),
    cnpjCpfFornecedor: z.string().optional(),
    pagina: z.number().int().positive().optional(),
    itens: z.number().int().min(1).max(100).optional(),
    ordem: OrdemEnum.optional(),
    ordenarPor: z.enum(['ano', 'mes', 'valor']).optional(),
  })
  .merge(PaginationSchema);

export type DespesasDeputadoParams = z.infer<typeof DespesasDeputadoParamsSchema>;

export interface DespesasDeputadoResponse {
  paginacao: {
    pagina: number;
    itens: number;
    total: number;
    totalPaginas: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  despesas: Array<{
    ano: number;
    mes: number;
    tipoDespesa: string;
    codDocumento: number;
    tipoDocumento: string;
    codTipoDocumento: number;
    dataDocumento: string;
    numDocumento: string;
    valorDocumento: number;
    urlDocumento: string;
    nomeFornecedor: string;
    cnpjCpfFornecedor: string;
    valorLiquido: number;
    valorGlosa: number;
    numRessarcimento: string;
    codLote: number;
    parcela: number;
  }>;
  _metadata?: any;
}

export async function despesasDeputado(
  params: DespesasDeputadoParams
): Promise<DespesasDeputadoResponse> {
  const startTime = Date.now();

  const validatedParams = DespesasDeputadoParamsSchema.parse(params);
  const { id, ...queryParams } = validatedParams;

  const cacheKey = `despesas-${id}-${JSON.stringify(queryParams)}`;

  const cached = cacheManager.get<DespesasDeputadoResponse>('despesas', cacheKey);
  if (cached) {
    return DataNormalizer.addMetadata(cached, true, Date.now() - startTime);
  }

  const response = await apiClient.get<any>(`/deputados/${id}/despesas`, queryParams);

  const despesas = response.dados;
  const paginacao = DataNormalizer.normalizePagination(response.links);

  const result: DespesasDeputadoResponse = {
    paginacao,
    despesas,
  };

  cacheManager.set('despesas', cacheKey, result, CacheTTL.despesas);

  return DataNormalizer.addMetadata(result, false, Date.now() - startTime);
}

export const despesasDeputadoTool = {
  name: 'despesas_deputado',
  description: `Busca despesas de um deputado com a Cota Parlamentar (CEAP).

A Cota para Exercício da Atividade Parlamentar (CEAP) é usada por deputados para custear despesas do mandato como passagens aéreas, combustível, alimentação, hospedagem, etc.

Permite filtrar por ano, mês, fornecedor e tipo de despesa. Retorna detalhes completos incluindo valores, documentos e fornecedores.`,
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'ID do deputado',
      },
      ano: {
        type: 'number',
        description: 'Ano da despesa (2008-atual)',
      },
      mes: {
        type: 'number',
        description: 'Mês da despesa (1-12)',
      },
      cnpjCpfFornecedor: {
        type: 'string',
        description: 'CNPJ ou CPF do fornecedor',
      },
      pagina: {
        type: 'number',
        default: 1,
      },
      itens: {
        type: 'number',
        default: 25,
      },
      ordem: {
        type: 'string',
        enum: ['ASC', 'DESC'],
      },
      ordenarPor: {
        type: 'string',
        enum: ['ano', 'mes', 'valor'],
      },
    },
    required: ['id'],
  },
};

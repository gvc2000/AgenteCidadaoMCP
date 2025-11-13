import { z } from 'zod';
import { CamaraAPIClient, PaginatedResponse } from '../../api/client.js';
import { DespesasDeputadoSchema } from '../../core/schemas.js';
import { logger } from '../../core/logger.js';

export interface Despesa {
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
  nomePassageiro: string;
  trecho: string;
  parcela: number;
}

export type DespesasDeputadoParams = z.infer<typeof DespesasDeputadoSchema>;

export async function despesasDeputado(
  client: CamaraAPIClient,
  params: DespesasDeputadoParams
): Promise<{ despesas: Despesa[]; total: number; totalValor: number }> {
  logger.info('Buscando despesas de deputado', params);

  // Validar parâmetros
  const validParams = DespesasDeputadoSchema.parse(params);

  // Construir query params
  const queryParams: any = {
    pagina: validParams.pagina,
    itens: validParams.itens,
  };

  if (validParams.ano) queryParams.ano = validParams.ano;
  if (validParams.mes) queryParams.mes = validParams.mes;
  if (validParams.tipoDespesa) queryParams.idTipoDespesa = validParams.tipoDespesa;
  if (validParams.fornecedor) queryParams.cnpjCpfFornecedor = validParams.fornecedor;
  if (validParams.ordem) queryParams.ordem = validParams.ordem;
  if (validParams.ordenarPor) queryParams.ordenarPor = validParams.ordenarPor;

  // Fazer requisição
  const response = await client.get<PaginatedResponse<Despesa>>(
    `/deputados/${validParams.id}/despesas`,
    queryParams
  );

  // Calcular total
  const totalValor = response.dados.reduce((sum, d) => sum + d.valorDocumento, 0);

  return {
    despesas: response.dados,
    total: response.dados.length,
    totalValor,
  };
}

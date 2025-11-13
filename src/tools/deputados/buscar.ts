import { z } from 'zod';
import { CamaraAPIClient, PaginatedResponse } from '../../api/client.js';
import { BuscarDeputadosSchema } from '../../core/schemas.js';
import { logger } from '../../core/logger.js';

export interface Deputado {
  id: number;
  uri: string;
  nome: string;
  siglaPartido: string;
  uriPartido: string;
  siglaUf: string;
  idLegislatura: number;
  urlFoto: string;
  email?: string;
}

export type BuscarDeputadosParams = z.infer<typeof BuscarDeputadosSchema>;

export async function buscarDeputados(
  client: CamaraAPIClient,
  params: BuscarDeputadosParams
): Promise<{ deputados: Deputado[]; total: number; pagina: number }> {
  logger.info('Buscando deputados', params);

  // Validar parâmetros
  const validParams = BuscarDeputadosSchema.parse(params);

  // Construir query params
  const queryParams: any = {};

  if (validParams.nome) queryParams.nome = validParams.nome;
  if (validParams.uf) queryParams.siglaUf = validParams.uf;
  if (validParams.partido) queryParams.siglaPartido = validParams.partido;
  if (validParams.sexo) queryParams.siglaSexo = validParams.sexo;
  if (validParams.idLegislatura) queryParams.idLegislatura = validParams.idLegislatura;
  if (validParams.dataInicio) queryParams.dataInicio = validParams.dataInicio;
  if (validParams.dataFim) queryParams.dataFim = validParams.dataFim;
  if (validParams.ordem) queryParams.ordem = validParams.ordem;
  if (validParams.ordenarPor) queryParams.ordenarPor = validParams.ordenarPor;

  queryParams.pagina = validParams.pagina;
  queryParams.itens = validParams.itens;

  // Fazer requisição
  const response = await client.get<PaginatedResponse<Deputado>>('/deputados', queryParams);

  return {
    deputados: response.dados,
    total: response.dados.length,
    pagina: validParams.pagina,
  };
}

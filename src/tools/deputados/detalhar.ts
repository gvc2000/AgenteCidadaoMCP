import { z } from 'zod';
import { CamaraAPIClient, APIResponse } from '../../api/client.js';
import { DetalharDeputadoSchema } from '../../core/schemas.js';
import { logger } from '../../core/logger.js';

export interface DeputadoDetalhado {
  id: number;
  uri: string;
  nomeCivil: string;
  ultimoStatus: {
    id: number;
    uri: string;
    nome: string;
    siglaPartido: string;
    uriPartido: string;
    siglaUf: string;
    idLegislatura: number;
    urlFoto: string;
    email: string;
    data: string;
    nomeEleitoral: string;
    gabinete: {
      nome: string;
      predio: string;
      sala: string;
      andar: string;
      telefone: string;
      email: string;
    };
    situacao: string;
    condicaoEleitoral: string;
    descricaoStatus: string;
  };
  cpf: string;
  sexo: string;
  urlWebsite: string;
  redeSocial: string[];
  dataNascimento: string;
  dataFalecimento: string | null;
  ufNascimento: string;
  municipioNascimento: string;
  escolaridade: string;
}

export type DetalharDeputadoParams = z.infer<typeof DetalharDeputadoSchema>;

export async function detalharDeputado(
  client: CamaraAPIClient,
  params: DetalharDeputadoParams
): Promise<DeputadoDetalhado> {
  logger.info('Detalhando deputado', params);

  // Validar parâmetros
  const validParams = DetalharDeputadoSchema.parse(params);

  // Fazer requisição
  const response = await client.get<APIResponse<DeputadoDetalhado>>(
    `/deputados/${validParams.id}`
  );

  return response.dados;
}

import { z } from 'zod';
import { CamaraAPIClient, APIResponse } from '../../api/client.js';
import { DetalharProposicaoSchema } from '../../core/schemas.js';
import { logger } from '../../core/logger.js';

export interface ProposicaoDetalhada {
  id: number;
  uri: string;
  siglaTipo: string;
  codTipo: number;
  numero: number;
  ano: number;
  ementa: string;
  dataApresentacao: string;
  uriOrgaoNumerador: string;
  statusProposicao: {
    dataHora: string;
    sequencia: number;
    siglaOrgao: string;
    uriOrgao: string;
    uriUltimoRelator: string;
    regime: string;
    descricaoTramitacao: string;
    codTipoTramitacao: string;
    descricaoSituacao: string;
    codSituacao: number;
    despacho: string;
    url: string;
    ambito: string;
  };
  uriAutores: string;
  descricaoTipo: string;
  ementaDetalhada: string;
  keywords: string;
  uriPropPrincipal: string;
  uriPropAnterior: string;
  uriPropPosterior: string;
  urlInteiroTeor: string;
  urnFinal: string;
  texto: string;
  justificativa: string;
}

export type DetalharProposicaoParams = z.infer<typeof DetalharProposicaoSchema>;

export async function detalharProposicao(
  client: CamaraAPIClient,
  params: DetalharProposicaoParams
): Promise<ProposicaoDetalhada> {
  logger.info('Detalhando proposição', params);

  // Validar parâmetros
  const validParams = DetalharProposicaoSchema.parse(params);

  // Fazer requisição
  const response = await client.get<APIResponse<ProposicaoDetalhada>>(
    `/proposicoes/${validParams.id}`
  );

  return response.dados;
}

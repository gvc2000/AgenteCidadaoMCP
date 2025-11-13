import { z } from 'zod';
import { CamaraAPIClient, PaginatedResponse } from '../../api/client.js';
import { TramitacoesProposicaoSchema } from '../../core/schemas.js';
import { logger } from '../../core/logger.js';

export interface Tramitacao {
  dataHora: string;
  sequencia: number;
  siglaOrgao: string;
  uriOrgao: string;
  regime: string;
  descricaoTramitacao: string;
  codTipoTramitacao: string;
  descricaoSituacao: string;
  codSituacao: number;
  despacho: string;
  url: string;
  ambito: string;
}

export type TramitacoesProposicaoParams = z.infer<typeof TramitacoesProposicaoSchema>;

export async function tramitacoesProposicao(
  client: CamaraAPIClient,
  params: TramitacoesProposicaoParams
): Promise<{ tramitacoes: Tramitacao[]; total: number }> {
  logger.info('Buscando tramitações de proposição', params);

  // Validar parâmetros
  const validParams = TramitacoesProposicaoSchema.parse(params);

  // Construir query params
  const queryParams: any = {
    pagina: validParams.pagina,
    itens: validParams.itens,
  };

  if (validParams.dataInicio) queryParams.dataInicio = validParams.dataInicio;
  if (validParams.dataFim) queryParams.dataFim = validParams.dataFim;

  // Fazer requisição
  const response = await client.get<PaginatedResponse<Tramitacao>>(
    `/proposicoes/${validParams.id}/tramitacoes`,
    queryParams
  );

  return {
    tramitacoes: response.dados,
    total: response.dados.length,
  };
}

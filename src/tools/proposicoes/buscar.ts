import { z } from 'zod';
import { CamaraAPIClient, PaginatedResponse } from '../../api/client.js';
import { BuscarProposicoesSchema } from '../../core/schemas.js';
import { logger } from '../../core/logger.js';

export interface Proposicao {
  id: number;
  uri: string;
  siglaTipo: string;
  codTipo: number;
  numero: number;
  ano: number;
  ementa: string;
}

export type BuscarProposicoesParams = z.infer<typeof BuscarProposicoesSchema>;

export async function buscarProposicoes(
  client: CamaraAPIClient,
  params: BuscarProposicoesParams
): Promise<{ proposicoes: Proposicao[]; total: number; pagina: number }> {
  logger.info('Buscando proposições', params);

  // Validar parâmetros
  const validParams = BuscarProposicoesSchema.parse(params);

  // Construir query params
  const queryParams: any = {
    pagina: validParams.pagina,
    itens: validParams.itens,
  };

  if (validParams.siglaTipo) queryParams.siglaTipo = validParams.siglaTipo;
  if (validParams.numero) queryParams.numero = validParams.numero;
  if (validParams.ano) queryParams.ano = validParams.ano;
  if (validParams.idAutor) queryParams.idDeputadoAutor = validParams.idAutor;
  if (validParams.nomeAutor) queryParams.autor = validParams.nomeAutor;
  if (validParams.siglaPartidoAutor) queryParams.siglaPartidoAutor = validParams.siglaPartidoAutor;
  if (validParams.siglaUfAutor) queryParams.siglaUfAutor = validParams.siglaUfAutor;
  if (validParams.keywords) queryParams.keywords = validParams.keywords;
  if (validParams.dataInicio) queryParams.dataInicio = validParams.dataInicio;
  if (validParams.dataFim) queryParams.dataFim = validParams.dataFim;
  if (validParams.dataInicioApresentacao) queryParams.dataApresentacaoInicio = validParams.dataInicioApresentacao;
  if (validParams.dataFimApresentacao) queryParams.dataApresentacaoFim = validParams.dataFimApresentacao;
  if (validParams.idSituacao) queryParams.idSituacao = validParams.idSituacao;
  if (validParams.codTema) queryParams.codTema = validParams.codTema;
  if (validParams.tramitacaoSenado !== undefined) queryParams.tramitacaoSenado = validParams.tramitacaoSenado;
  if (validParams.ordem) queryParams.ordem = validParams.ordem;
  if (validParams.ordenarPor) queryParams.ordenarPor = validParams.ordenarPor;

  // Fazer requisição
  const response = await client.get<PaginatedResponse<Proposicao>>('/proposicoes', queryParams);

  return {
    proposicoes: response.dados,
    total: response.dados.length,
    pagina: validParams.pagina,
  };
}

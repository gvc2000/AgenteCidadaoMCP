import { z } from 'zod';
import { CamaraAPIClient, PaginatedResponse } from '../../api/client.js';
import { AutoresProposicaoSchema } from '../../core/schemas.js';
import { logger } from '../../core/logger.js';

export interface Autor {
  uri: string;
  nome: string;
  codTipo: number;
  tipo: string;
  ordemAssinatura: number;
  proponente: number;
}

export type AutoresProposicaoParams = z.infer<typeof AutoresProposicaoSchema>;

export async function autoresProposicao(
  client: CamaraAPIClient,
  params: AutoresProposicaoParams
): Promise<{ autores: Autor[]; total: number }> {
  logger.info('Buscando autores de proposição', params);

  // Validar parâmetros
  const validParams = AutoresProposicaoSchema.parse(params);

  // Fazer requisição
  const response = await client.get<PaginatedResponse<Autor>>(
    `/proposicoes/${validParams.id}/autores`
  );

  return {
    autores: response.dados,
    total: response.dados.length,
  };
}

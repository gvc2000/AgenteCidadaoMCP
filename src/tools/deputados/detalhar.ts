import { z } from 'zod';
import { apiClient } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, CacheTTL } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';

export const DetalharDeputadoParamsSchema = z.object({
  id: IdSchema,
});

export type DetalharDeputadoParams = z.infer<typeof DetalharDeputadoParamsSchema>;

export interface DetalharDeputadoResponse {
  id: number;
  uri: string;
  nomeCivil: string;
  nome: string;
  cpf?: string;
  sexo: string;
  dataNascimento: string;
  dataFalecimento?: string;
  ufNascimento: string;
  municipioNascimento: string;
  escolaridade: string;
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
  redeSocial: Array<string>;
  _metadata?: any;
}

export async function detalharDeputado(
  params: DetalharDeputadoParams
): Promise<DetalharDeputadoResponse> {
  const startTime = Date.now();

  const validatedParams = DetalharDeputadoParamsSchema.parse(params);
  const cacheKey = `deputado-${validatedParams.id}`;

  const cached = cacheManager.get<DetalharDeputadoResponse>('deputados', cacheKey);
  if (cached) {
    return DataNormalizer.addMetadata(cached, true, Date.now() - startTime);
  }

  const response = await apiClient.get<any>(`/deputados/${validatedParams.id}`);
  const deputado = DataNormalizer.normalizeDeputadoDetalhado(response.dados);

  cacheManager.set('deputados', cacheKey, deputado, CacheTTL.deputados);

  return DataNormalizer.addMetadata(deputado, false, Date.now() - startTime);
}

export const detalharDeputadoTool = {
  name: 'detalhar_deputado',
  description: `Obtém informações detalhadas de um deputado específico pelo ID.

Retorna dados completos incluindo informações pessoais, status atual, gabinete, contatos e redes sociais.

Use esta tool quando precisar de informações completas sobre um deputado específico.`,
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'ID do deputado',
      },
    },
    required: ['id'],
  },
};

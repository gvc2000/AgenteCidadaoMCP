import { z } from 'zod';
import { apiClient } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, CacheTTL } from '../../core/cache.js';
import { IdSchema, DateSchema, PaginationSchema, OrdemEnum, SafeTextSchema } from '../../core/schemas.js';

// Buscar Órgãos
export const BuscarOrgaosParamsSchema = z
  .object({
    sigla: z.string().optional(),
    nome: SafeTextSchema.optional(),
    idTipoOrgao: IdSchema.optional(),
    dataInicio: DateSchema.optional(),
    dataFim: DateSchema.optional(),
    ordem: OrdemEnum.optional(),
    ordenarPor: z.enum(['id', 'sigla', 'nome']).optional(),
  })
  .merge(PaginationSchema);

export async function buscarOrgaos(params: z.infer<typeof BuscarOrgaosParamsSchema>) {
  const validatedParams = BuscarOrgaosParamsSchema.parse(params);
  const cacheKey = JSON.stringify(validatedParams);

  const cached = cacheManager.get('orgaos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/orgaos', validatedParams);
  const orgaos = response.dados.map((o: any) => DataNormalizer.normalizeOrgao(o));
  const paginacao = DataNormalizer.normalizePagination(response.links);

  const result = { paginacao, orgaos };
  cacheManager.set('orgaos', cacheKey, result, CacheTTL.orgaos);
  return DataNormalizer.addMetadata(result, false);
}

export const buscarOrgaosTool = {
  name: 'buscar_orgaos',
  description:
    'Busca órgãos da Câmara (comissões permanentes, temporárias, Plenário, Mesa Diretora, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      sigla: { type: 'string', description: 'Sigla do órgão (ex: CCJC, CFT)' },
      nome: { type: 'string', description: 'Nome do órgão' },
      idTipoOrgao: { type: 'number', description: 'Tipo do órgão' },
      dataInicio: { type: 'string', description: 'Data início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data fim (YYYY-MM-DD)' },
      pagina: { type: 'number', default: 1 },
      itens: { type: 'number', default: 25 },
    },
  },
};

// Detalhar Órgão
export async function detalharOrgao(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `orgao-${id}`;

  const cached = cacheManager.get('orgaos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/orgaos/${id}`);
  const orgao = DataNormalizer.normalizeOrgao(response.dados);

  cacheManager.set('orgaos', cacheKey, orgao, CacheTTL.orgaos);
  return DataNormalizer.addMetadata(orgao, false);
}

export const detalharOrgaoTool = {
  name: 'detalhar_orgao',
  description: 'Obtém informações detalhadas de um órgão específico',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do órgão' } },
    required: ['id'],
  },
};

// Membros do Órgão
export async function membrosOrgao(params: { id: number; dataInicio?: string; dataFim?: string }) {
  const validatedParams = z
    .object({
      id: IdSchema,
      dataInicio: DateSchema.optional(),
      dataFim: DateSchema.optional(),
    })
    .parse(params);

  const { id, ...queryParams } = validatedParams;
  const cacheKey = `membros-orgao-${id}-${JSON.stringify(queryParams)}`;

  const cached = cacheManager.get('orgaos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/orgaos/${id}/membros`, queryParams);
  const membros = response.dados;

  cacheManager.set('orgaos', cacheKey, membros, CacheTTL.orgaos);
  return DataNormalizer.addMetadata({ membros }, false);
}

export const membrosOrgaoTool = {
  name: 'membros_orgao',
  description: 'Lista membros (deputados) de um órgão com seus cargos (presidente, vice, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do órgão' },
      dataInicio: { type: 'string', description: 'Data início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data fim (YYYY-MM-DD)' },
    },
    required: ['id'],
  },
};

// Eventos do Órgão
export async function eventosOrgao(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `eventos-orgao-${id}`;

  const cached = cacheManager.get('eventos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/orgaos/${id}/eventos`);
  const eventos = response.dados.map((e: any) => DataNormalizer.normalizeEvento(e));

  cacheManager.set('eventos', cacheKey, eventos, CacheTTL.eventos);
  return DataNormalizer.addMetadata({ eventos }, false);
}

export const eventosOrgaoTool = {
  name: 'eventos_orgao',
  description: 'Lista eventos (reuniões, audiências) realizados por um órgão',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do órgão' } },
    required: ['id'],
  },
};

// Votações do Órgão
export async function votacoesOrgao(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `votacoes-orgao-${id}`;

  const cached = cacheManager.get('votacoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/orgaos/${id}/votacoes`);
  const votacoes = response.dados.map((v: any) => DataNormalizer.normalizeVotacao(v));

  cacheManager.set('votacoes', cacheKey, votacoes, CacheTTL.votacoes);
  return DataNormalizer.addMetadata({ votacoes }, false);
}

export const votacoesOrgaoTool = {
  name: 'votacoes_orgao',
  description: 'Lista votações realizadas em um órgão',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do órgão' } },
    required: ['id'],
  },
};

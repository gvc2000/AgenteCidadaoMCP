import { z } from 'zod';
import { apiClient } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, CacheTTL } from '../../core/cache.js';
import { IdSchema, IdStringSchema, DateSchema, PaginationSchema, OrdemEnum } from '../../core/schemas.js';

// Buscar Votações
export const BuscarVotacoesParamsSchema = z
  .object({
    idProposicao: IdSchema.optional(),
    idEvento: IdSchema.optional(),
    idOrgao: IdSchema.optional(),
    dataInicio: DateSchema.optional(),
    dataFim: DateSchema.optional(),
    ordem: OrdemEnum.optional(),
    ordenarPor: z.enum(['dataHoraRegistro', 'id']).optional(),
  })
  .merge(PaginationSchema);

export async function buscarVotacoes(params: z.infer<typeof BuscarVotacoesParamsSchema>) {
  const validatedParams = BuscarVotacoesParamsSchema.parse(params);
  const cacheKey = JSON.stringify(validatedParams);

  const cached = cacheManager.get('votacoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/votacoes', validatedParams);
  const votacoes = response.dados.map((v: any) => DataNormalizer.normalizeVotacao(v));
  const paginacao = DataNormalizer.normalizePagination(response.links);

  const result = { paginacao, votacoes };
  cacheManager.set('votacoes', cacheKey, result, CacheTTL.votacoes);
  return DataNormalizer.addMetadata(result, false);
}

export const buscarVotacoesTool = {
  name: 'buscar_votacoes',
  description:
    'Busca votações nominais em Plenário e comissões. Permite filtrar por proposição, evento, órgão e período.',
  inputSchema: {
    type: 'object',
    properties: {
      idProposicao: { type: 'number', description: 'ID da proposição votada' },
      idEvento: { type: 'number', description: 'ID do evento onde ocorreu a votação' },
      idOrgao: { type: 'number', description: 'ID do órgão (Plenário ou comissão)' },
      dataInicio: { type: 'string', description: 'Data início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data fim (YYYY-MM-DD)' },
      pagina: { type: 'number', default: 1 },
      itens: { type: 'number', default: 25 },
      ordem: { type: 'string', enum: ['ASC', 'DESC'] },
      ordenarPor: { type: 'string', enum: ['dataHoraRegistro', 'id'] },
    },
  },
};

// Detalhar Votação
export async function detalharVotacao(params: { id: string }) {
  const { id } = z.object({ id: IdStringSchema }).parse(params);
  const cacheKey = `votacao-${id}`;

  const cached = cacheManager.get('votacoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/votacoes/${id}`);
  const votacao = DataNormalizer.normalizeVotacao(response.dados);

  cacheManager.set('votacoes', cacheKey, votacao, CacheTTL.votacoes);
  return DataNormalizer.addMetadata(votacao, false);
}

export const detalharVotacaoTool = {
  name: 'detalhar_votacao',
  description: 'Obtém informações detalhadas de uma votação específica',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'ID da votação' } },
    required: ['id'],
  },
};

// Votos da Votação
export async function votosVotacao(params: { id: string }) {
  const { id } = z.object({ id: IdStringSchema }).parse(params);
  const cacheKey = `votos-votacao-${id}`;

  const cached = cacheManager.get('votacoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/votacoes/${id}/votos`);
  const votos = response.dados;

  cacheManager.set('votacoes', cacheKey, votos, CacheTTL.votacoes);
  return DataNormalizer.addMetadata({ votos }, false);
}

export const votosVotacaoTool = {
  name: 'votos_votacao',
  description: 'Lista como cada deputado votou em uma votação (Sim, Não, Abstenção, Obstrução)',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'ID da votação' } },
    required: ['id'],
  },
};

// Orientações da Votação
export async function orientacoesVotacao(params: { id: string }) {
  const { id } = z.object({ id: IdStringSchema }).parse(params);
  const cacheKey = `orientacoes-votacao-${id}`;

  const cached = cacheManager.get('votacoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/votacoes/${id}/orientacoes`);
  const orientacoes = response.dados;

  cacheManager.set('votacoes', cacheKey, orientacoes, CacheTTL.votacoes);
  return DataNormalizer.addMetadata({ orientacoes }, false);
}

export const orientacoesVotacaoTool = {
  name: 'orientacoes_votacao',
  description: 'Lista as orientações de bancada (como cada partido orientou seus deputados)',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'string', description: 'ID da votação' } },
    required: ['id'],
  },
};

// Últimas Votações
export async function ultimasVotacoes(params?: { ordem?: 'ASC' | 'DESC' }) {
  const cacheKey = `ultimas-votacoes-${params?.ordem || 'DESC'}`;

  const cached = cacheManager.get('votacoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/votacoes', {
    ordem: params?.ordem || 'DESC',
    ordenarPor: 'dataHoraRegistro',
    itens: 15,
  });

  const votacoes = response.dados.map((v: any) => DataNormalizer.normalizeVotacao(v));

  cacheManager.set('votacoes', cacheKey, votacoes, CacheTTL.votacoes);
  return DataNormalizer.addMetadata({ votacoes }, false);
}

export const ultimasVotacoesTool = {
  name: 'ultimas_votacoes',
  description: 'Lista as 15 votações mais recentes da Câmara',
  inputSchema: {
    type: 'object',
    properties: {
      ordem: { type: 'string', enum: ['ASC', 'DESC'], default: 'DESC' },
    },
  },
};

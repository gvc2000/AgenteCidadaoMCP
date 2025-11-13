import { z } from 'zod';
import { apiClient } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, CacheTTL } from '../../core/cache.js';
import {
  IdSchema,
  UFEnum,
  PaginationSchema,
  DateSchema,
  OrdemEnum,
  SafeTextSchema,
  KeywordsSchema,
  AnoSchema,
} from '../../core/schemas.js';

// ============================================================================
// Buscar Proposições
// ============================================================================

export const BuscarProposicoesParamsSchema = z
  .object({
    siglaTipo: z.string().optional(),
    numero: z.number().int().positive().optional(),
    ano: AnoSchema.optional(),
    idAutor: IdSchema.optional(),
    autor: SafeTextSchema.optional(),
    siglaPartidoAutor: z.string().optional(),
    siglaUfAutor: UFEnum.optional(),
    keywords: KeywordsSchema.optional(),
    dataInicio: DateSchema.optional(),
    dataFim: DateSchema.optional(),
    dataApresentacaoInicio: DateSchema.optional(),
    dataApresentacaoFim: DateSchema.optional(),
    ordem: OrdemEnum.optional(),
    ordenarPor: z.enum(['id', 'ano', 'dataApresentacao']).optional(),
  })
  .merge(PaginationSchema);

export type BuscarProposicoesParams = z.infer<typeof BuscarProposicoesParamsSchema>;

export async function buscarProposicoes(params: BuscarProposicoesParams) {
  const validatedParams = BuscarProposicoesParamsSchema.parse(params);
  const cacheKey = JSON.stringify(validatedParams);

  const cached = cacheManager.get('proposicoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/proposicoes', validatedParams);
  const proposicoes = response.dados.map((p: any) => DataNormalizer.normalizeProposicao(p));
  const paginacao = DataNormalizer.normalizePagination(response.links);

  const result = { paginacao, proposicoes };
  cacheManager.set('proposicoes', cacheKey, result, CacheTTL.proposicoes);

  return DataNormalizer.addMetadata(result, false);
}

export const buscarProposicoesTool = {
  name: 'buscar_proposicoes',
  description: `Busca proposições legislativas (PLs, PECs, MPs, etc.) com filtros avançados.

Permite buscar por tipo, número, ano, autor, partido, UF, palavras-chave e período.
Retorna informações sobre as proposições encontradas incluindo ementa, status e autores.`,
  inputSchema: {
    type: 'object',
    properties: {
      siglaTipo: {
        type: 'string',
        description: 'Tipo de proposição (PL, PEC, MPV, PLP, etc.)',
      },
      numero: { type: 'number', description: 'Número da proposição' },
      ano: { type: 'number', description: 'Ano da proposição' },
      idAutor: { type: 'number', description: 'ID do autor (deputado)' },
      autor: { type: 'string', description: 'Nome do autor' },
      siglaPartidoAutor: { type: 'string', description: 'Partido do autor' },
      siglaUfAutor: { type: 'string', description: 'UF do autor' },
      keywords: { type: 'string', description: 'Palavras-chave na ementa' },
      dataInicio: { type: 'string', description: 'Data início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data fim (YYYY-MM-DD)' },
      dataApresentacaoInicio: {
        type: 'string',
        description: 'Data apresentação início (YYYY-MM-DD)',
      },
      dataApresentacaoFim: { type: 'string', description: 'Data apresentação fim (YYYY-MM-DD)' },
      pagina: { type: 'number', default: 1 },
      itens: { type: 'number', default: 25 },
      ordem: { type: 'string', enum: ['ASC', 'DESC'] },
      ordenarPor: { type: 'string', enum: ['id', 'ano', 'dataApresentacao'] },
    },
  },
};

// ============================================================================
// Detalhar Proposição
// ============================================================================

export const DetalharProposicaoParamsSchema = z.object({ id: IdSchema });

export async function detalharProposicao(params: { id: number }) {
  const { id } = DetalharProposicaoParamsSchema.parse(params);
  const cacheKey = `proposicao-${id}`;

  const cached = cacheManager.get('proposicoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/proposicoes/${id}`);
  const proposicao = DataNormalizer.normalizeProposicao(response.dados);

  cacheManager.set('proposicoes', cacheKey, proposicao, CacheTTL.proposicoes);
  return DataNormalizer.addMetadata(proposicao, false);
}

export const detalharProposicaoTool = {
  name: 'detalhar_proposicao',
  description: 'Obtém informações detalhadas de uma proposição específica pelo ID',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID da proposição' } },
    required: ['id'],
  },
};

// ============================================================================
// Autores da Proposição
// ============================================================================

export async function autoresProposicao(params: { id: number }) {
  const { id } = DetalharProposicaoParamsSchema.parse(params);
  const cacheKey = `autores-proposicao-${id}`;

  const cached = cacheManager.get('proposicoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/proposicoes/${id}/autores`);
  const autores = response.dados;

  cacheManager.set('proposicoes', cacheKey, autores, CacheTTL.proposicoes);
  return DataNormalizer.addMetadata({ autores }, false);
}

export const autoresProposicaoTool = {
  name: 'autores_proposicao',
  description: 'Lista os autores de uma proposição',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID da proposição' } },
    required: ['id'],
  },
};

// ============================================================================
// Tramitações da Proposição
// ============================================================================

export async function tramitacoesProposicao(params: { id: number }) {
  const { id } = DetalharProposicaoParamsSchema.parse(params);
  const cacheKey = `tramitacoes-proposicao-${id}`;

  const cached = cacheManager.get('proposicoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/proposicoes/${id}/tramitacoes`);
  const tramitacoes = response.dados;

  cacheManager.set('proposicoes', cacheKey, tramitacoes, CacheTTL.proposicoes);
  return DataNormalizer.addMetadata({ tramitacoes }, false);
}

export const tramitacoesProposicaoTool = {
  name: 'tramitacoes_proposicao',
  description:
    'Lista o histórico de tramitação de uma proposição (despachos, pareceres, votações)',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID da proposição' } },
    required: ['id'],
  },
};

// ============================================================================
// Votações da Proposição
// ============================================================================

export async function votacoesProposicao(params: { id: number }) {
  const { id } = DetalharProposicaoParamsSchema.parse(params);
  const cacheKey = `votacoes-proposicao-${id}`;

  const cached = cacheManager.get('votacoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/proposicoes/${id}/votacoes`);
  const votacoes = response.dados.map((v: any) => DataNormalizer.normalizeVotacao(v));

  cacheManager.set('votacoes', cacheKey, votacoes, CacheTTL.votacoes);
  return DataNormalizer.addMetadata({ votacoes }, false);
}

export const votacoesProposicaoTool = {
  name: 'votacoes_proposicao',
  description: 'Lista todas as votações de uma proposição',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID da proposição' } },
    required: ['id'],
  },
};

// ============================================================================
// Proposições Relacionadas
// ============================================================================

export async function relacionadasProposicao(params: { id: number }) {
  const { id } = DetalharProposicaoParamsSchema.parse(params);
  const cacheKey = `relacionadas-proposicao-${id}`;

  const cached = cacheManager.get('proposicoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/proposicoes/${id}/relacionadas`);
  const relacionadas = response.dados.map((p: any) => DataNormalizer.normalizeProposicao(p));

  cacheManager.set('proposicoes', cacheKey, relacionadas, CacheTTL.proposicoes);
  return DataNormalizer.addMetadata({ relacionadas }, false);
}

export const relacionadasProposicaoTool = {
  name: 'relacionadas_proposicao',
  description:
    'Lista proposições relacionadas (apensadas, emendas, substitutivos, pareceres, etc.)',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID da proposição' } },
    required: ['id'],
  },
};

// ============================================================================
// Temas da Proposição
// ============================================================================

export async function temasProposicao(params: { id: number }) {
  const { id } = DetalharProposicaoParamsSchema.parse(params);
  const cacheKey = `temas-proposicao-${id}`;

  const cached = cacheManager.get('proposicoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/proposicoes/${id}/temas`);
  const temas = response.dados;

  cacheManager.set('proposicoes', cacheKey, temas, CacheTTL.proposicoes);
  return DataNormalizer.addMetadata({ temas }, false);
}

export const temasProposicaoTool = {
  name: 'temas_proposicao',
  description: 'Lista os temas/assuntos de uma proposição',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID da proposição' } },
    required: ['id'],
  },
};

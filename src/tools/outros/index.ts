import { z } from 'zod';
import { apiClient } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, CacheTTL } from '../../core/cache.js';
import {
  IdSchema,
  PaginationSchema,
  DateSchema,
  LegislaturaSchema,
  SafeTextSchema,
} from '../../core/schemas.js';

// ============================================================================
// FRENTES PARLAMENTARES
// ============================================================================

// Buscar Frentes
export async function buscarFrentes(params?: { idLegislatura?: number; pagina?: number; itens?: number }) {
  const validatedParams = z
    .object({
      idLegislatura: LegislaturaSchema.optional(),
    })
    .merge(PaginationSchema)
    .parse(params || {});

  const cacheKey = JSON.stringify(validatedParams);
  const cached = cacheManager.get('frentes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/frentes', validatedParams);
  const frentes = response.dados;
  const paginacao = DataNormalizer.normalizePagination(response.links);

  const result = { paginacao, frentes };
  cacheManager.set('frentes', cacheKey, result, CacheTTL.frentes);
  return DataNormalizer.addMetadata(result, false);
}

export const buscarFrentesTool = {
  name: 'buscar_frentes',
  description: 'Busca frentes parlamentares (grupos temáticos de deputados)',
  inputSchema: {
    type: 'object',
    properties: {
      idLegislatura: { type: 'number', description: 'ID da legislatura' },
      pagina: { type: 'number', default: 1 },
      itens: { type: 'number', default: 25 },
    },
  },
};

// Detalhar Frente
export async function detalharFrente(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `frente-${id}`;

  const cached = cacheManager.get('frentes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/frentes/${id}`);
  const frente = response.dados;

  cacheManager.set('frentes', cacheKey, frente, CacheTTL.frentes);
  return DataNormalizer.addMetadata(frente, false);
}

export const detalharFrenteTool = {
  name: 'detalhar_frente',
  description: 'Obtém informações detalhadas de uma frente parlamentar',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID da frente' } },
    required: ['id'],
  },
};

// Membros da Frente
export async function membrosFrente(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `membros-frente-${id}`;

  const cached = cacheManager.get('frentes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/frentes/${id}/membros`);
  const membros = response.dados;

  cacheManager.set('frentes', cacheKey, membros, CacheTTL.frentes);
  return DataNormalizer.addMetadata({ membros }, false);
}

export const membrosFrenteTool = {
  name: 'membros_frente',
  description: 'Lista deputados membros de uma frente parlamentar',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID da frente' } },
    required: ['id'],
  },
};

// ============================================================================
// BLOCOS PARLAMENTARES
// ============================================================================

// Buscar Blocos
export async function buscarBlocos(params?: { idLegislatura?: number }) {
  const validatedParams = z
    .object({ idLegislatura: LegislaturaSchema.optional() })
    .merge(PaginationSchema)
    .parse(params || {});

  const cacheKey = JSON.stringify(validatedParams);
  const cached = cacheManager.get('blocos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/blocos', validatedParams);
  const blocos = response.dados;
  const paginacao = DataNormalizer.normalizePagination(response.links);

  const result = { paginacao, blocos };
  cacheManager.set('blocos', cacheKey, result, CacheTTL.blocos);
  return DataNormalizer.addMetadata(result, false);
}

export const buscarBlocosTool = {
  name: 'buscar_blocos',
  description: 'Busca blocos parlamentares (associações de partidos)',
  inputSchema: {
    type: 'object',
    properties: {
      idLegislatura: { type: 'number', description: 'ID da legislatura' },
      pagina: { type: 'number', default: 1 },
      itens: { type: 'number', default: 25 },
    },
  },
};

// Detalhar Bloco
export async function detalharBloco(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `bloco-${id}`;

  const cached = cacheManager.get('blocos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/blocos/${id}`);
  const bloco = response.dados;

  cacheManager.set('blocos', cacheKey, bloco, CacheTTL.blocos);
  return DataNormalizer.addMetadata(bloco, false);
}

export const detalharBlocoTool = {
  name: 'detalhar_bloco',
  description: 'Obtém informações detalhadas de um bloco parlamentar',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do bloco' } },
    required: ['id'],
  },
};

// ============================================================================
// PARTIDOS
// ============================================================================

// Buscar Partidos
export async function buscarPartidos(params?: {
  sigla?: string;
  dataInicio?: string;
  dataFim?: string;
  idLegislatura?: number;
}) {
  const validatedParams = z
    .object({
      sigla: z.string().optional(),
      dataInicio: DateSchema.optional(),
      dataFim: DateSchema.optional(),
      idLegislatura: LegislaturaSchema.optional(),
    })
    .merge(PaginationSchema)
    .parse(params || {});

  const cacheKey = JSON.stringify(validatedParams);
  const cached = cacheManager.get('partidos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/partidos', validatedParams);
  const partidos = response.dados.map((p: any) => DataNormalizer.normalizePartido(p));
  const paginacao = DataNormalizer.normalizePagination(response.links);

  const result = { paginacao, partidos };
  cacheManager.set('partidos', cacheKey, result, CacheTTL.partidos);
  return DataNormalizer.addMetadata(result, false);
}

export const buscarPartidosTool = {
  name: 'buscar_partidos',
  description: 'Busca partidos políticos com representação na Câmara',
  inputSchema: {
    type: 'object',
    properties: {
      sigla: { type: 'string', description: 'Sigla do partido' },
      dataInicio: { type: 'string', description: 'Data início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data fim (YYYY-MM-DD)' },
      idLegislatura: { type: 'number', description: 'ID da legislatura' },
      pagina: { type: 'number', default: 1 },
      itens: { type: 'number', default: 25 },
    },
  },
};

// Detalhar Partido
export async function detalharPartido(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `partido-${id}`;

  const cached = cacheManager.get('partidos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/partidos/${id}`);
  const partido = DataNormalizer.normalizePartido(response.dados);

  cacheManager.set('partidos', cacheKey, partido, CacheTTL.partidos);
  return DataNormalizer.addMetadata(partido, false);
}

export const detalharPartidoTool = {
  name: 'detalhar_partido',
  description: 'Obtém informações detalhadas de um partido',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do partido' } },
    required: ['id'],
  },
};

// Membros do Partido
export async function membrosPartido(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `membros-partido-${id}`;

  const cached = cacheManager.get('partidos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/partidos/${id}/membros`);
  const membros = response.dados.map((d: any) => DataNormalizer.normalizeDeputado(d));

  cacheManager.set('partidos', cacheKey, membros, CacheTTL.partidos);
  return DataNormalizer.addMetadata({ membros }, false);
}

export const membrosPartidoTool = {
  name: 'membros_partido',
  description: 'Lista deputados filiados a um partido',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do partido' } },
    required: ['id'],
  },
};

// Líderes do Partido
export async function lideresPartido(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `lideres-partido-${id}`;

  const cached = cacheManager.get('partidos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/partidos/${id}/lideres`);
  const lideres = response.dados;

  cacheManager.set('partidos', cacheKey, lideres, CacheTTL.partidos);
  return DataNormalizer.addMetadata({ lideres }, false);
}

export const lideresPartidoTool = {
  name: 'lideres_partido',
  description: 'Lista líderes de um partido na Câmara',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do partido' } },
    required: ['id'],
  },
};

// ============================================================================
// LEGISLATURAS
// ============================================================================

// Buscar Legislaturas
export async function buscarLegislaturas(params?: { data?: string }) {
  const validatedParams = z
    .object({ data: DateSchema.optional() })
    .merge(PaginationSchema)
    .parse(params || {});

  const cacheKey = JSON.stringify(validatedParams);
  const cached = cacheManager.get('legislaturas', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/legislaturas', validatedParams);
  const legislaturas = response.dados;
  const paginacao = DataNormalizer.normalizePagination(response.links);

  const result = { paginacao, legislaturas };
  cacheManager.set('legislaturas', cacheKey, result, CacheTTL.legislaturas);
  return DataNormalizer.addMetadata(result, false);
}

export const buscarLegislaturasTool = {
  name: 'buscar_legislaturas',
  description: 'Busca legislaturas (períodos de mandato de 4 anos)',
  inputSchema: {
    type: 'object',
    properties: {
      data: { type: 'string', description: 'Buscar legislatura vigente em uma data (YYYY-MM-DD)' },
      pagina: { type: 'number', default: 1 },
      itens: { type: 'number', default: 25 },
    },
  },
};

// Detalhar Legislatura
export async function detalharLegislatura(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `legislatura-${id}`;

  const cached = cacheManager.get('legislaturas', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/legislaturas/${id}`);
  const legislatura = response.dados;

  cacheManager.set('legislaturas', cacheKey, legislatura, CacheTTL.legislaturas);
  return DataNormalizer.addMetadata(legislatura, false);
}

export const detalharLegislaturaTool = {
  name: 'detalhar_legislatura',
  description: 'Obtém informações detalhadas de uma legislatura',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID da legislatura' } },
    required: ['id'],
  },
};

// Mesa da Legislatura
export async function mesaLegislatura(params: { id: number; dataInicio?: string; dataFim?: string }) {
  const validatedParams = z
    .object({
      id: LegislaturaSchema,
      dataInicio: DateSchema.optional(),
      dataFim: DateSchema.optional(),
    })
    .parse(params);

  const { id, ...queryParams } = validatedParams;
  const cacheKey = `mesa-legislatura-${id}-${JSON.stringify(queryParams)}`;

  const cached = cacheManager.get('legislaturas', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/legislaturas/${id}/mesa`, queryParams);
  const mesa = response.dados;

  cacheManager.set('legislaturas', cacheKey, mesa, CacheTTL.legislaturas);
  return DataNormalizer.addMetadata({ mesa }, false);
}

export const mesaLegislaturaTool = {
  name: 'mesa_legislatura',
  description: 'Lista membros da Mesa Diretora de uma legislatura (presidente, vices, secretários)',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID da legislatura' },
      dataInicio: { type: 'string', description: 'Data início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data fim (YYYY-MM-DD)' },
    },
    required: ['id'],
  },
};

// ============================================================================
// REFERÊNCIAS
// ============================================================================

// Situações de Proposição
export async function situacoesProposicao() {
  const cacheKey = 'situacoes-proposicao';
  const cached = cacheManager.get('referencias', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/referencias/situacoesProposicao');
  const situacoes = response.dados;

  cacheManager.set('referencias', cacheKey, situacoes, CacheTTL.referencias);
  return DataNormalizer.addMetadata({ situacoes }, false);
}

export const situacoesProposicaoTool = {
  name: 'situacoes_proposicao',
  description: 'Lista todas as possíveis situações/status de tramitação de proposições',
  inputSchema: { type: 'object', properties: {} },
};

// Temas de Proposição
export async function temasReferencia() {
  const cacheKey = 'temas-referencia';
  const cached = cacheManager.get('referencias', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/referencias/proposicoes/codTema');
  const temas = response.dados;

  cacheManager.set('referencias', cacheKey, temas, CacheTTL.referencias);
  return DataNormalizer.addMetadata({ temas }, false);
}

export const temasReferenciaTool = {
  name: 'temas_referencia',
  description: 'Lista todos os temas/áreas temáticas para classificação de proposições',
  inputSchema: { type: 'object', properties: {} },
};

// Tipos de Proposição
export async function tiposProposicao() {
  const cacheKey = 'tipos-proposicao';
  const cached = cacheManager.get('referencias', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/referencias/proposicoes/siglaTipo');
  const tipos = response.dados;

  cacheManager.set('referencias', cacheKey, tipos, CacheTTL.referencias);
  return DataNormalizer.addMetadata({ tipos }, false);
}

export const tiposProposicaoTool = {
  name: 'tipos_proposicao',
  description: 'Lista todos os tipos de proposições (PL, PEC, MPV, PLP, etc.)',
  inputSchema: { type: 'object', properties: {} },
};

// Tipos de Órgão
export async function tiposOrgao() {
  const cacheKey = 'tipos-orgao';
  const cached = cacheManager.get('referencias', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/referencias/tiposOrgao');
  const tipos = response.dados;

  cacheManager.set('referencias', cacheKey, tipos, CacheTTL.referencias);
  return DataNormalizer.addMetadata({ tipos }, false);
}

export const tiposOrgaoTool = {
  name: 'tipos_orgao',
  description: 'Lista todos os tipos de órgãos da Câmara',
  inputSchema: { type: 'object', properties: {} },
};

// Tipos de Evento
export async function tiposEvento() {
  const cacheKey = 'tipos-evento';
  const cached = cacheManager.get('referencias', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/referencias/tiposEvento');
  const tipos = response.dados;

  cacheManager.set('referencias', cacheKey, tipos, CacheTTL.referencias);
  return DataNormalizer.addMetadata({ tipos }, false);
}

export const tiposEventoTool = {
  name: 'tipos_evento',
  description: 'Lista todos os tipos de eventos (sessões, reuniões, audiências, etc.)',
  inputSchema: { type: 'object', properties: {} },
};

// UFs
export async function listarUFs() {
  const cacheKey = 'ufs';
  const cached = cacheManager.get('referencias', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/referencias/uf');
  const ufs = response.dados;

  cacheManager.set('referencias', cacheKey, ufs, CacheTTL.referencias);
  return DataNormalizer.addMetadata({ ufs }, false);
}

export const listarUFsTool = {
  name: 'listar_ufs',
  description: 'Lista todas as Unidades Federativas (estados) do Brasil',
  inputSchema: { type: 'object', properties: {} },
};

import { z } from 'zod';
import { apiClient } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, CacheTTL } from '../../core/cache.js';
import { IdSchema, DateSchema, TimeSchema, PaginationSchema, OrdemEnum } from '../../core/schemas.js';

// Buscar Eventos
export const BuscarEventosParamsSchema = z
  .object({
    idTipoEvento: IdSchema.optional(),
    idOrgao: IdSchema.optional(),
    dataInicio: DateSchema.optional(),
    dataFim: DateSchema.optional(),
    horaInicio: TimeSchema.optional(),
    horaFim: TimeSchema.optional(),
    ordem: OrdemEnum.optional(),
    ordenarPor: z.enum(['dataHoraInicio', 'id']).optional(),
  })
  .merge(PaginationSchema);

export async function buscarEventos(params: z.infer<typeof BuscarEventosParamsSchema>) {
  const validatedParams = BuscarEventosParamsSchema.parse(params);
  const cacheKey = JSON.stringify(validatedParams);

  const cached = cacheManager.get('eventos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>('/eventos', validatedParams);
  const eventos = response.dados.map((e: any) => DataNormalizer.normalizeEvento(e));
  const paginacao = DataNormalizer.normalizePagination(response.links);

  const result = { paginacao, eventos };
  cacheManager.set('eventos', cacheKey, result, CacheTTL.eventos);
  return DataNormalizer.addMetadata(result, false);
}

export const buscarEventosTool = {
  name: 'buscar_eventos',
  description:
    'Busca eventos legislativos (sessões, reuniões de comissões, audiências públicas, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      idTipoEvento: { type: 'number', description: 'Tipo do evento' },
      idOrgao: { type: 'number', description: 'Órgão responsável' },
      dataInicio: { type: 'string', description: 'Data início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data fim (YYYY-MM-DD)' },
      horaInicio: { type: 'string', description: 'Hora início (HH:MM)' },
      horaFim: { type: 'string', description: 'Hora fim (HH:MM)' },
      pagina: { type: 'number', default: 1 },
      itens: { type: 'number', default: 25 },
    },
  },
};

// Detalhar Evento
export async function detalharEvento(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `evento-${id}`;

  const cached = cacheManager.get('eventos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/eventos/${id}`);
  const evento = DataNormalizer.normalizeEvento(response.dados);

  cacheManager.set('eventos', cacheKey, evento, CacheTTL.eventos);
  return DataNormalizer.addMetadata(evento, false);
}

export const detalharEventoTool = {
  name: 'detalhar_evento',
  description: 'Obtém informações detalhadas de um evento específico',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do evento' } },
    required: ['id'],
  },
};

// Deputados do Evento
export async function deputadosEvento(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `deputados-evento-${id}`;

  const cached = cacheManager.get('eventos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/eventos/${id}/deputados`);
  const deputados = response.dados.map((d: any) => DataNormalizer.normalizeDeputado(d));

  cacheManager.set('eventos', cacheKey, deputados, CacheTTL.eventos);
  return DataNormalizer.addMetadata({ deputados }, false);
}

export const deputadosEventoTool = {
  name: 'deputados_evento',
  description: 'Lista deputados presentes ou convocados para um evento',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do evento' } },
    required: ['id'],
  },
};

// Pauta do Evento
export async function pautaEvento(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `pauta-evento-${id}`;

  const cached = cacheManager.get('eventos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/eventos/${id}/pauta`);
  const pauta = response.dados;

  cacheManager.set('eventos', cacheKey, pauta, CacheTTL.eventos);
  return DataNormalizer.addMetadata({ pauta }, false);
}

export const pautaEventoTool = {
  name: 'pauta_evento',
  description: 'Lista a pauta de proposições que serão discutidas/votadas em um evento',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do evento' } },
    required: ['id'],
  },
};

// Votações do Evento
export async function votacoesEvento(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `votacoes-evento-${id}`;

  const cached = cacheManager.get('votacoes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/eventos/${id}/votacoes`);
  const votacoes = response.dados.map((v: any) => DataNormalizer.normalizeVotacao(v));

  cacheManager.set('votacoes', cacheKey, votacoes, CacheTTL.votacoes);
  return DataNormalizer.addMetadata({ votacoes }, false);
}

export const votacoesEventoTool = {
  name: 'votacoes_evento',
  description: 'Lista todas as votações que ocorreram em um evento',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do evento' } },
    required: ['id'],
  },
};

// Órgãos do Evento
export async function orgaosEvento(params: { id: number }) {
  const { id } = z.object({ id: IdSchema }).parse(params);
  const cacheKey = `orgaos-evento-${id}`;

  const cached = cacheManager.get('orgaos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/eventos/${id}/orgaos`);
  const orgaos = response.dados.map((o: any) => DataNormalizer.normalizeOrgao(o));

  cacheManager.set('orgaos', cacheKey, orgaos, CacheTTL.orgaos);
  return DataNormalizer.addMetadata({ orgaos }, false);
}

export const orgaosEventoTool = {
  name: 'orgaos_evento',
  description: 'Lista órgãos responsáveis por um evento',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do evento' } },
    required: ['id'],
  },
};

export * from './buscar.js';
export * from './detalhar.js';
export * from './despesas.js';
export * from './discursos.js';
export * from './eventos.js';

// Outras tools simplificadas
import { z } from 'zod';
import { apiClient } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, CacheTTL } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';

const BaseIdParamsSchema = z.object({ id: IdSchema });

// Frentes parlamentares do deputado
export async function frentesDeputado(params: { id: number }) {
  const { id } = BaseIdParamsSchema.parse(params);
  const cacheKey = `frentes-deputado-${id}`;

  const cached = cacheManager.get('frentes', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/deputados/${id}/frentes`);
  const frentes = response.dados;

  cacheManager.set('frentes', cacheKey, frentes, CacheTTL.frentes);
  return DataNormalizer.addMetadata({ frentes }, false);
}

export const frentesDeputadoTool = {
  name: 'frentes_deputado',
  description: 'Lista frentes parlamentares das quais um deputado é membro',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do deputado' } },
    required: ['id'],
  },
};

// Ocupações do deputado
export async function ocupacoesDeputado(params: { id: number }) {
  const { id } = BaseIdParamsSchema.parse(params);
  const cacheKey = `ocupacoes-deputado-${id}`;

  const cached = cacheManager.get('deputados', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/deputados/${id}/ocupacoes`);
  const ocupacoes = response.dados;

  cacheManager.set('deputados', cacheKey, ocupacoes, CacheTTL.deputados);
  return DataNormalizer.addMetadata({ ocupacoes }, false);
}

export const ocupacoesDeputadoTool = {
  name: 'ocupacoes_deputado',
  description: 'Lista cargos e funções ocupados pelo deputado em órgãos da Câmara',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do deputado' } },
    required: ['id'],
  },
};

// Órgãos do deputado
export async function orgaosDeputado(params: { id: number }) {
  const { id } = BaseIdParamsSchema.parse(params);
  const cacheKey = `orgaos-deputado-${id}`;

  const cached = cacheManager.get('orgaos', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/deputados/${id}/orgaos`);
  const orgaos = response.dados.map((o: any) => DataNormalizer.normalizeOrgao(o));

  cacheManager.set('orgaos', cacheKey, orgaos, CacheTTL.orgaos);
  return DataNormalizer.addMetadata({ orgaos }, false);
}

export const orgaosDeputadoTool = {
  name: 'orgaos_deputado',
  description: 'Lista órgãos dos quais um deputado é ou foi membro',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do deputado' } },
    required: ['id'],
  },
};

// Profissões do deputado
export async function profissoesDeputado(params: { id: number }) {
  const { id } = BaseIdParamsSchema.parse(params);
  const cacheKey = `profissoes-deputado-${id}`;

  const cached = cacheManager.get('deputados', cacheKey);
  if (cached) return DataNormalizer.addMetadata(cached, true);

  const response = await apiClient.get<any>(`/deputados/${id}/profissoes`);
  const profissoes = response.dados;

  cacheManager.set('deputados', cacheKey, profissoes, CacheTTL.deputados);
  return DataNormalizer.addMetadata({ profissoes }, false);
}

export const profissoesDeputadoTool = {
  name: 'profissoes_deputado',
  description: 'Lista profissões declaradas pelo deputado',
  inputSchema: {
    type: 'object',
    properties: { id: { type: 'number', description: 'ID do deputado' } },
    required: ['id'],
  },
};

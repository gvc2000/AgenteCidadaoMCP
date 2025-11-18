import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { createPaginacaoResposta, UFEnum, SexoEnum, OrdemEnum } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const BuscarDeputadosSchema = z.object({
  nome: z.string().min(3).optional(),
  uf: UFEnum.optional(),
  partido: z.string().optional(),
  sexo: SexoEnum.optional(),
  idLegislatura: z.number().int().min(1).max(57).optional(),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  pagina: z.number().int().positive().default(1).optional(),
  itens: z.number().int().min(1).max(100).default(25).optional(),
  ordem: OrdemEnum.default('ASC').optional(),
  ordenarPor: z.enum(['id', 'idLegislatura', 'nome']).optional()
});

export type BuscarDeputadosParams = z.infer<typeof BuscarDeputadosSchema>;

export async function buscarDeputados(params: BuscarDeputadosParams) {
  const startTime = Date.now();

  try {
    // Validação
    const validated = BuscarDeputadosSchema.parse(params);

    // Cache check
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('deputados', cacheKey);
    if (cached) {
      return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    }

    // Mapear parâmetros para o formato da API
    const apiParams: Record<string, any> = {};

    // Mapear apenas os parâmetros fornecidos
    if (validated.nome) apiParams.nome = validated.nome;
    if (validated.uf) apiParams.siglaUf = validated.uf;
    if (validated.partido) apiParams.siglaPartido = validated.partido;
    if (validated.sexo) apiParams.siglaSexo = validated.sexo;
    if (validated.idLegislatura) apiParams.idLegislatura = validated.idLegislatura;
    if (validated.dataInicio) apiParams.dataInicio = validated.dataInicio;
    if (validated.dataFim) apiParams.dataFim = validated.dataFim;
    if (validated.pagina) apiParams.pagina = validated.pagina;
    if (validated.itens) apiParams.itens = validated.itens;
    if (validated.ordem) apiParams.ordem = validated.ordem;
    if (validated.ordenarPor) apiParams.ordenarPor = validated.ordenarPor;

    // API call
    const response = await camaraAPI.getWithPagination('/deputados', apiParams);

    // Normalização
    const deputados = DataNormalizer.normalizeArray(
      response.dados,
      DataNormalizer.normalizeDeputado
    );

    // Paginação
    const paginacao = createPaginacaoResposta(
      validated.pagina || 1,
      validated.itens || 25,
      deputados.length
    );

    const result = {
      paginacao,
      deputados,
      _metadata: {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2'
      }
    };

    // Cache set
    cacheManager.set('deputados', cacheKey, result);

    // Métricas
    metricsCollector.incrementToolCall('buscar_deputados');
    metricsCollector.recordLatency('buscar_deputados', Date.now() - startTime);

    logToolCall('buscar_deputados', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('buscar_deputados');
    throw error;
  }
}

export const buscarDeputadosTool = {
  name: 'buscar_deputados',
  description: 'Busca deputados por diversos critérios: nome, UF, partido, sexo, legislatura, etc.',
  inputSchema: {
    type: 'object',
    properties: {
      nome: {
        type: 'string',
        description: 'Nome do deputado (mínimo 3 caracteres)'
      },
      uf: {
        type: 'string',
        description: 'Sigla da UF (ex: SP, RJ, MG)',
        enum: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
               'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
               'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
      },
      partido: {
        type: 'string',
        description: 'Sigla do partido (ex: PT, PSDB, MDB)'
      },
      sexo: {
        type: 'string',
        description: 'Sexo do deputado',
        enum: ['M', 'F']
      },
      idLegislatura: {
        type: 'number',
        description: 'ID da legislatura (1-57)'
      },
      dataInicio: {
        type: 'string',
        description: 'Data de início do mandato (formato: YYYY-MM-DD)'
      },
      dataFim: {
        type: 'string',
        description: 'Data de fim do mandato (formato: YYYY-MM-DD)'
      },
      pagina: {
        type: 'number',
        description: 'Número da página (padrão: 1)'
      },
      itens: {
        type: 'number',
        description: 'Itens por página (1-100, padrão: 25)'
      },
      ordem: {
        type: 'string',
        description: 'Ordem de ordenação',
        enum: ['ASC', 'DESC']
      },
      ordenarPor: {
        type: 'string',
        description: 'Campo para ordenação',
        enum: ['id', 'idLegislatura', 'nome']
      }
    }
  },
  handler: buscarDeputados
};

import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const ProfissoesDeputadoSchema = z.object({
  id: IdSchema
});

export type ProfissoesDeputadoParams = z.infer<typeof ProfissoesDeputadoSchema>;

export async function profissoesDeputado(params: ProfissoesDeputadoParams) {
  const startTime = Date.now();

  try {
    const validated = ProfissoesDeputadoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('deputados', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/deputados/${id}/profissoes`);

    const result = {
      profissoes: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('deputados', cacheKey, result);
    metricsCollector.incrementToolCall('profissoes_deputado');
    logToolCall('profissoes_deputado', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('profissoes_deputado');
    throw error;
  }
}

export const profissoesDeputadoTool = {
  name: 'profissoes_deputado',
  description: 'Lista as profissões registradas de um deputado',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do deputado' }
    },
    required: ['id']
  },
  handler: profissoesDeputado
};

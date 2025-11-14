import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const FrentesDeputadoSchema = z.object({
  id: IdSchema
});

export type FrentesDeputadoParams = z.infer<typeof FrentesDeputadoSchema>;

export async function frentesDeputado(params: FrentesDeputadoParams) {
  const startTime = Date.now();

  try {
    const validated = FrentesDeputadoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('frentes', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/deputados/${id}/frentes`);

    const result = {
      frentes: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('frentes', cacheKey, result);
    metricsCollector.incrementToolCall('frentes_deputado');
    logToolCall('frentes_deputado', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('frentes_deputado');
    throw error;
  }
}

export const frentesDeputadoTool = {
  name: 'frentes_deputado',
  description: 'Lista as frentes parlamentares das quais um deputado é membro',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do deputado' }
    },
    required: ['id']
  },
  handler: frentesDeputado
};

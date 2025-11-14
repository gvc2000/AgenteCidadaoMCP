import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const OcupacoesDeputadoSchema = z.object({
  id: IdSchema
});

export type OcupacoesDeputadoParams = z.infer<typeof OcupacoesDeputadoSchema>;

export async function ocupacoesDeputado(params: OcupacoesDeputadoParams) {
  const startTime = Date.now();

  try {
    const validated = OcupacoesDeputadoSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('deputados', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const { id } = validated;
    const response = await camaraAPI.get<any>(`/deputados/${id}/ocupacoes`);

    const result = {
      ocupacoes: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };

    cacheManager.set('deputados', cacheKey, result);
    metricsCollector.incrementToolCall('ocupacoes_deputado');
    logToolCall('ocupacoes_deputado', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('ocupacoes_deputado');
    throw error;
  }
}

export const ocupacoesDeputadoTool = {
  name: 'ocupacoes_deputado',
  description: 'Lista as ocupações registradas de um deputado',
  inputSchema: {
    type: 'object',
    properties: {
      id: { type: 'number', description: 'ID do deputado' }
    },
    required: ['id']
  },
  handler: ocupacoesDeputado
};

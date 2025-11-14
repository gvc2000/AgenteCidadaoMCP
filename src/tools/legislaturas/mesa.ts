import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { IdSchema, DateSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const MesaLegislaturaSchema = z.object({
  idLegislatura: IdSchema,
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional()
});
export type MesaLegislaturaParams = z.infer<typeof MesaLegislaturaSchema>;

export async function mesaLegislatura(params: MesaLegislaturaParams) {
  const startTime = Date.now();
  try {
    const validated = MesaLegislaturaSchema.parse(params);
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('legislaturas', cacheKey);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    const { idLegislatura, ...queryParams } = validated;
    const response = await camaraAPI.get<any>(`/legislaturas/${idLegislatura}/mesa`, queryParams);
    const result = {
      mesa: response.dados,
      _metadata: { cache: false, latencyMs: Date.now() - startTime, apiVersion: 'v2' }
    };
    cacheManager.set('legislaturas', cacheKey, result);
    metricsCollector.incrementToolCall('mesa_legislatura');
    logToolCall('mesa_legislatura', validated, Date.now() - startTime);
    return result;
  } catch (error) {
    metricsCollector.incrementError('mesa_legislatura');
    throw error;
  }
}

export const mesaLegislaturaTool = {
  name: 'mesa_legislatura',
  description: 'Obtém a composição da mesa diretora de uma legislatura',
  inputSchema: {
    type: 'object',
    properties: {
      idLegislatura: { type: 'number', description: 'ID da legislatura' },
      dataInicio: { type: 'string', description: 'Data de início (YYYY-MM-DD)' },
      dataFim: { type: 'string', description: 'Data de fim (YYYY-MM-DD)' }
    },
    required: ['idLegislatura']
  },
  handler: mesaLegislatura
};

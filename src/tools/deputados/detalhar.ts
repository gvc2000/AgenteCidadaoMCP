import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { DataNormalizer } from '../../api/normalizers.js';
import { IdSchema } from '../../core/schemas.js';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const DetalharDeputadoSchema = z.object({
  id: IdSchema
});

export type DetalharDeputadoParams = z.infer<typeof DetalharDeputadoSchema>;

export async function detalharDeputado(params: DetalharDeputadoParams) {
  const startTime = Date.now();

  try {
    // Validação
    const validated = DetalharDeputadoSchema.parse(params);

    // API call
    const response = await camaraAPI.get<any>(`/deputados/${validated.id}`);

    // Normalização
    const deputado = DataNormalizer.normalizeDeputado(response.dados);

    const result = {
      deputado,
      _metadata: {
        cache: false, // Será sobrescrito pelo cliente se houver cache
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2'
      }
    };

    // Métricas
    metricsCollector.incrementToolCall('detalhar_deputado');
    metricsCollector.recordLatency('detalhar_deputado', Date.now() - startTime);

    logToolCall('detalhar_deputado', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('detalhar_deputado');
    throw error;
  }
}

export const detalharDeputadoTool = {
  name: 'detalhar_deputado',
  description: 'Obtém informações detalhadas de um deputado específico',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'ID do deputado'
      }
    },
    required: ['id']
  },
  handler: detalharDeputado
};

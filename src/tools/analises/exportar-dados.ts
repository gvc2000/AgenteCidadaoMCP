import { z } from 'zod';
import { logToolCall } from '../../core/logging.js';
import { metricsCollector } from '../../core/metrics.js';

const ExportarDadosSchema = z.object({
  tool: z.string().min(1),
  params: z.any(),
  formato: z.enum(['json', 'csv', 'markdown']).default('json'),
  incluirMetadados: z.boolean().default(true)
});

export type ExportarDadosParams = z.infer<typeof ExportarDadosSchema>;

// Helper para converter JSON para CSV
function jsonToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      // Escape vírgulas e aspas
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Helper para converter JSON para Markdown
function jsonToMarkdown(data: any, title?: string): string {
  let md = '';

  if (title) {
    md += `# ${title}\n\n`;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return md + '_Sem dados_\n';

    // Tabela
    const headers = Object.keys(data[0]);
    md += '| ' + headers.join(' | ') + ' |\n';
    md += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
      });
      md += '| ' + values.join(' | ') + ' |\n';
    });
  } else if (typeof data === 'object') {
    // Objeto simples
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        md += `\n## ${key}\n\n`;
        md += jsonToMarkdown(value);
      } else if (typeof value === 'object' && value !== null) {
        md += `\n## ${key}\n\n`;
        md += jsonToMarkdown(value);
      } else {
        md += `**${key}**: ${value}\n\n`;
      }
    });
  } else {
    md += String(data) + '\n';
  }

  return md;
}

export async function exportarDados(params: ExportarDadosParams) {
  const startTime = Date.now();

  try {
    const validated = ExportarDadosSchema.parse(params);
    const { tool, params: toolParams, formato, incluirMetadados } = validated;

    // Nota: Esta ferramenta é um wrapper que formata dados de outras ferramentas
    // Em uma implementação real, seria necessário chamar dinamicamente a ferramenta especificada
    // Por simplicidade, vamos retornar instruções de uso

    const result: any = {
      status: 'info',
      mensagem: 'Esta ferramenta formata dados de outras ferramentas MCP',
      instrucoes: [
        '1. Primeiro, chame a ferramenta desejada (ex: buscar_deputados)',
        '2. Copie os dados retornados',
        '3. Use esta ferramenta passando os dados no parâmetro "params"',
        '4. Especifique o formato desejado: json, csv ou markdown'
      ],
      exemplo: {
        tool: 'buscar_deputados',
        params: { uf: 'SP', pagina: 1, itens: 10 },
        formato: 'csv'
      }
    };

    // Se params contém dados, processar
    if (toolParams && typeof toolParams === 'object') {
      const dados = toolParams.dados || toolParams.data || toolParams;

      let conteudoExportado: string;

      switch (formato) {
        case 'csv':
          if (Array.isArray(dados)) {
            conteudoExportado = jsonToCSV(dados);
          } else {
            conteudoExportado = 'Erro: dados devem ser um array para exportação CSV';
          }
          break;

        case 'markdown':
          conteudoExportado = jsonToMarkdown(dados, tool);
          break;

        case 'json':
        default:
          conteudoExportado = JSON.stringify(
            incluirMetadados ? toolParams : dados,
            null,
            2
          );
          break;
      }

      result.exportacao = {
        formato,
        ferramenta: tool,
        tamanho: conteudoExportado.length,
        conteudo: conteudoExportado
      };

      result.status = 'sucesso';
      result.mensagem = `Dados exportados com sucesso em formato ${formato}`;
      delete result.instrucoes;
      delete result.exemplo;
    }

    if (incluirMetadados) {
      result._metadata = {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2',
        exportadoEm: new Date().toISOString()
      };
    }

    metricsCollector.incrementToolCall('exportar_dados');
    logToolCall('exportar_dados', validated, Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('exportar_dados');
    throw error;
  }
}

export const exportarDadosTool = {
  name: 'exportar_dados',
  description: 'Exporta dados de outras ferramentas em diferentes formatos (JSON, CSV, Markdown)',
  inputSchema: {
    type: 'object',
    properties: {
      tool: {
        type: 'string',
        description: 'Nome da ferramenta de origem dos dados'
      },
      params: {
        type: 'object',
        description: 'Dados a serem exportados (resultado de outra ferramenta)'
      },
      formato: {
        type: 'string',
        enum: ['json', 'csv', 'markdown'],
        description: 'Formato de exportação desejado'
      },
      incluirMetadados: {
        type: 'boolean',
        description: 'Incluir metadados na exportação'
      }
    },
    required: ['tool', 'params']
  },
  handler: exportarDados
};

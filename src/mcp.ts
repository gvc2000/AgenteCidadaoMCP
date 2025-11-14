import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { logger } from './core/logging.js';
import { metricsCollector } from './core/metrics.js';

// Import tools
import { deputadosTools } from './tools/deputados/index.js';
import { proposicoesTools } from './tools/proposicoes/index.js';
import { votacoesTools } from './tools/votacoes/index.js';
import { eventosTools } from './tools/eventos/index.js';
import { orgaosTools } from './tools/orgaos/index.js';
import { partidosTools } from './tools/partidos/index.js';
import { frentesTools } from './tools/frentes/index.js';
import { blocosTools } from './tools/blocos/index.js';
import { legislaturasTools } from './tools/legislaturas/index.js';
import { referenciasTools } from './tools/referencias/index.js';

// Combine all tools
const allTools = [
  ...deputadosTools,
  ...proposicoesTools,
  ...votacoesTools,
  ...eventosTools,
  ...orgaosTools,
  ...partidosTools,
  ...frentesTools,
  ...blocosTools,
  ...legislaturasTools,
  ...referenciasTools
];

export class CamaraMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'mcp-camara-br',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.info('Listing available tools');

      return {
        tools: allTools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const startTime = Date.now();
      const { name, arguments: args } = request.params;

      logger.info({ tool: name, args }, `Tool called: ${name}`);

      try {
        // Find the tool
        const tool = allTools.find(t => t.name === name);

        if (!tool) {
          throw new Error(`Tool not found: ${name}`);
        }

        // Execute the tool
        const result = await tool.handler(args as any || {});

        // Metrics
        const duration = Date.now() - startTime;
        metricsCollector.incrementToolCall(name);
        metricsCollector.recordLatency(name, duration);

        logger.info(
          { tool: name, duration },
          `Tool completed: ${name} in ${duration}ms`
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error({ tool: name, error }, `Tool error: ${name}`);
        metricsCollector.incrementError(name);

        // Retornar erro formatado
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: true,
                message: errorMessage,
                tool: name
              }, null, 2)
            }
          ],
          isError: true
        };
      }
    });
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      logger.error({ error }, 'Server error');
      metricsCollector.incrementError('server');
    };

    process.on('SIGINT', async () => {
      logger.info('Shutting down server...');
      await this.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Shutting down server...');
      await this.close();
      process.exit(0);
    });

    process.on('uncaughtException', (error) => {
      logger.error({ error }, 'Uncaught exception');
      metricsCollector.incrementError('uncaught_exception');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason, promise }, 'Unhandled rejection');
      metricsCollector.incrementError('unhandled_rejection');
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    logger.info({
      server: 'mcp-camara-br',
      version: '1.0.0',
      tools: allTools.length
    }, 'MCP Server started successfully');

    logger.info(`Registered ${allTools.length} tools:`);
    allTools.forEach(tool => {
      logger.info(`  - ${tool.name}: ${tool.description}`);
    });
  }

  async close() {
    await this.server.close();
    logger.info('Server closed');
  }

  getMetrics() {
    return metricsCollector.getMetrics();
  }

  exportMetrics() {
    return metricsCollector.exportPrometheus();
  }
}

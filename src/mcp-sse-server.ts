#!/usr/bin/env node

import express, { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from './core/logging.js';
import { metricsCollector } from './core/metrics.js';
import { CONFIG } from './config.js';

// Import all tools
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
import { analisesTools } from './tools/analises/index.js';

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
  ...referenciasTools,
  ...analisesTools
];

// Helper function to check if a message is an initialize request
function isInitializeRequest(body: any): boolean {
  return body && body.method === 'initialize';
}

// Create an MCP server instance
function createMCPServer(): Server {
  const server = new Server(
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

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.info('Listing available tools via SSE');

    return {
      tools: allTools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const startTime = Date.now();
    const { name, arguments: args } = request.params;

    logger.info({ tool: name, args }, `Tool called via SSE: ${name}`);

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
        `Tool completed via SSE: ${name} in ${duration}ms`
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
      const duration = Date.now() - startTime;
      logger.error({ tool: name, error, duration }, `Tool error via SSE: ${name}`);
      metricsCollector.incrementError(name);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'Tool execution failed',
              tool: name,
              message: errorMessage
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  });

  return server;
}

// Map to store transports by session ID
const transports: Record<string, StreamableHTTPServerTransport> = {};

async function main() {
  const port = parseInt(process.env.PORT || String(CONFIG.metrics.port || 9090), 10);
  const app = express();

  app.use(express.json());

  // Enable CORS for all origins, expose MCP session header
  app.use(cors({
    origin: '*',
    exposedHeaders: ['Mcp-Session-Id']
  }));

  logger.info('Starting MCP Câmara BR SSE Server...');
  logger.info({
    nodeEnv: CONFIG.development.nodeEnv,
    port,
    cacheEnabled: CONFIG.cache.enabled,
    rateLimitEnabled: CONFIG.rateLimit.enabled,
    circuitBreakerEnabled: CONFIG.circuitBreaker.enabled,
    metricsEnabled: CONFIG.metrics.enabled,
    toolsCount: allTools.length
  }, 'Configuration loaded');

  // Root endpoint - information about the server
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'MCP Câmara BR - SSE Server',
      version: '1.0.0',
      description: 'Servidor MCP com suporte a SSE para integração com n8n',
      protocol: 'Model Context Protocol (MCP)',
      transport: 'Streamable HTTP with SSE',
      endpoints: {
        mcp: 'POST/GET/DELETE /mcp - Endpoint MCP principal',
        health: 'GET /health - Health check',
        metrics: 'GET /metrics - Métricas Prometheus',
        metricsJson: 'GET /metrics/json - Métricas em JSON'
      },
      features: {
        tools: allTools.length,
        sse: 'Server-Sent Events para streaming',
        resumability: 'Suporte a reconexão e retomada de sessão',
        sessionManagement: 'Gerenciamento de sessões MCP'
      },
      usage: {
        n8n: 'Configure o MCP client do n8n para apontar para POST /mcp',
        sessionHeader: 'Use o header Mcp-Session-Id para requests subsequentes'
      },
      documentation: 'https://github.com/gvc2000/AgenteCidadaoMCP'
    });
  });

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      activeSessions: Object.keys(transports).length,
      toolsAvailable: allTools.length
    });
  });

  // Prometheus metrics endpoint
  app.get('/metrics', (_req: Request, res: Response) => {
    res.set('Content-Type', 'text/plain');
    res.send(metricsCollector.exportPrometheus());
  });

  // JSON metrics endpoint
  app.get('/metrics/json', (_req: Request, res: Response) => {
    res.json({
      ...metricsCollector.getMetrics(),
      activeSessions: Object.keys(transports).length
    });
  });

  // MCP POST endpoint - handle JSON-RPC messages
  app.post('/mcp', async (req: Request, res: Response): Promise<void> => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (sessionId) {
      logger.info({ sessionId }, `Received MCP request for session: ${sessionId}`);
    } else {
      logger.info('Received new MCP request (no session ID)');
    }

    try {
      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        // Reuse existing transport
        transport = transports[sessionId];
        logger.debug({ sessionId }, 'Reusing existing transport');
      } else if (!sessionId && isInitializeRequest(req.body)) {
        // New initialization request - create new transport and server
        logger.info('Creating new MCP session...');

        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sid: string) => {
            logger.info({ sessionId: sid }, `Session initialized: ${sid}`);
            transports[sid] = transport;
          },
          onsessionclosed: (sid: string) => {
            logger.info({ sessionId: sid }, `Session closed: ${sid}`);
            if (transports[sid]) {
              delete transports[sid];
            }
          }
        });

        // Set up onclose handler
        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && transports[sid]) {
            logger.info({ sessionId: sid }, `Transport closed for session ${sid}`);
            delete transports[sid];
          }
        };

        // Create a new MCP server instance and connect the transport
        const mcpServer = createMCPServer();
        await mcpServer.connect(transport);

        logger.info('MCP server connected to new transport');

        // Handle the initialize request
        await transport.handleRequest(req as any, res as any, req.body);
        return;
      } else {
        // Invalid request - no session ID or not initialization request
        logger.warn('Invalid MCP request: no valid session ID or not initialization');
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided or not an initialization request'
          },
          id: null
        });
        return;
      }

      // Handle the request with existing transport
      await transport.handleRequest(req as any, res as any, req.body);
    } catch (error) {
      logger.error({ error }, 'Error handling MCP POST request');
      metricsCollector.incrementError('mcp_post');

      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
            data: error instanceof Error ? error.message : 'Unknown error'
          },
          id: null
        });
      }
    }
  });

  // MCP GET endpoint - handle SSE streams
  app.get('/mcp', async (req: Request, res: Response): Promise<void> => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (!sessionId || !transports[sessionId]) {
      logger.warn({ sessionId }, 'Invalid SSE request: missing or invalid session ID');
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    const lastEventId = req.headers['last-event-id'] as string | undefined;
    if (lastEventId) {
      logger.info({ sessionId, lastEventId }, `Client reconnecting with Last-Event-ID`);
    } else {
      logger.info({ sessionId }, `Establishing new SSE stream for session`);
    }

    try {
      const transport = transports[sessionId];
      await transport.handleRequest(req as any, res as any);
    } catch (error) {
      logger.error({ sessionId, error }, 'Error handling MCP GET request (SSE)');
      metricsCollector.incrementError('mcp_get');

      if (!res.headersSent) {
        res.status(500).send('Error establishing SSE connection');
      }
    }
  });

  // MCP DELETE endpoint - handle session termination
  app.delete('/mcp', async (req: Request, res: Response): Promise<void> => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (!sessionId || !transports[sessionId]) {
      logger.warn({ sessionId }, 'Invalid DELETE request: missing or invalid session ID');
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    logger.info({ sessionId }, `Received session termination request`);

    try {
      const transport = transports[sessionId];
      await transport.handleRequest(req as any, res as any);
    } catch (error) {
      logger.error({ sessionId, error }, 'Error handling session termination');
      metricsCollector.incrementError('mcp_delete');

      if (!res.headersSent) {
        res.status(500).send('Error processing session termination');
      }
    }
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not found',
      message: `Endpoint ${req.method} ${req.path} not found`,
      availableEndpoints: {
        root: 'GET /',
        mcp: 'POST/GET/DELETE /mcp',
        health: 'GET /health',
        metrics: 'GET /metrics',
        metricsJson: 'GET /metrics/json'
      }
    });
  });

  // Start server
  app.listen(port, '0.0.0.0', () => {
    logger.info(`🚀 MCP SSE Server listening on port ${port}`);
    logger.info(`📊 Tools available: ${allTools.length}`);
    logger.info(`🔗 MCP Endpoint: http://0.0.0.0:${port}/mcp`);
    logger.info(`❤️  Health check: http://0.0.0.0:${port}/health`);
    logger.info(`📈 Metrics: http://0.0.0.0:${port}/metrics`);

    logger.info('\nRegistered tools:');
    allTools.forEach(tool => {
      logger.info(`  - ${tool.name}: ${tool.description}`);
    });

    logger.info('\n✨ Server ready for n8n MCP client connections!');
    logger.info('Configure n8n to connect to: POST http://0.0.0.0:${port}/mcp');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down MCP SSE server...');

    // Close all active transports
    for (const sessionId in transports) {
      try {
        logger.info({ sessionId }, `Closing transport for session`);
        await transports[sessionId].close();
        delete transports[sessionId];
      } catch (error) {
        logger.error({ sessionId, error }, 'Error closing transport');
      }
    }

    logger.info('Server shutdown complete');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Shutting down MCP SSE server...');

    // Close all active transports
    for (const sessionId in transports) {
      try {
        logger.info({ sessionId }, `Closing transport for session`);
        await transports[sessionId].close();
        delete transports[sessionId];
      } catch (error) {
        logger.error({ sessionId, error }, 'Error closing transport');
      }
    }

    logger.info('Server shutdown complete');
    process.exit(0);
  });
}

main().catch(error => {
  logger.error({ error }, 'Failed to start MCP SSE server');
  process.exit(1);
});

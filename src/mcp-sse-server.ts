#!/usr/bin/env node

import express, { Request, Response } from 'express';
import { randomUUID } from 'crypto';
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

// Store active sessions
const activeSessions = new Map<string, { server: Server; transport: StreamableHTTPServerTransport }>();

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next): void => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-ID, Last-Event-ID');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration
    }, `${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
});

// Setup MCP Server handlers
function setupMCPServer(server: Server): void {
  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
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
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
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

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'MCP Câmara BR - Streamable HTTP Server',
    version: '1.0.0',
    description: 'Servidor MCP com suporte a HTTP/SSE para n8n e outras integrações',
    protocol: 'MCP (Model Context Protocol)',
    transport: 'Streamable HTTP (SSE)',
    endpoints: {
      mcp: 'POST/GET/DELETE /mcp - Endpoint principal MCP (suporta SSE streaming)',
      health: 'GET /health - Health check',
      metrics: 'GET /metrics - Métricas Prometheus',
      metricsJson: 'GET /metrics/json - Métricas em JSON',
      sessions: 'GET /sessions - Listar sessões ativas'
    },
    usage: {
      n8n: 'Configure n8n MCP client com URL: https://seu-dominio.com/mcp e protocolo: HTTP Streamable',
      curl: 'curl -X POST https://seu-dominio.com/mcp -H "Content-Type: application/json" -d \'{"jsonrpc":"2.0","id":1,"method":"tools/list"}\''
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
    activeSessions: activeSessions.size,
    toolsAvailable: allTools.length
  });
});

// List active sessions
app.get('/sessions', (_req: Request, res: Response) => {
  res.json({
    activeSessions: activeSessions.size,
    sessions: Array.from(activeSessions.keys())
  });
});

// Main MCP endpoint - handles GET (SSE), POST (messages), and DELETE (close session)
app.all('/mcp', async (req: Request, res: Response): Promise<void> => {
  try {
    // Create a new MCP server and transport for this request
    const mcpServer = new Server(
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

    // Setup handlers
    setupMCPServer(mcpServer);

    // Create transport with session management
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: async (sessionId: string) => {
        logger.info({ sessionId }, 'MCP session initialized');
        activeSessions.set(sessionId, { server: mcpServer, transport });
      },
      onsessionclosed: async (sessionId: string) => {
        logger.info({ sessionId }, 'MCP session closed');
        activeSessions.delete(sessionId);
      },
    });

    // Connect the server to the transport
    await mcpServer.connect(transport);

    // Handle the request
    await transport.handleRequest(req, res, req.body);

  } catch (error) {
    logger.error({ error }, 'Error handling MCP request');

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }
});

// Prometheus metrics endpoint
app.get('/metrics', (_req: Request, res: Response) => {
  res.set('Content-Type', 'text/plain');
  res.send(metricsCollector.exportPrometheus());
});

// JSON metrics endpoint
app.get('/metrics/json', (_req: Request, res: Response) => {
  res.json(metricsCollector.getMetrics());
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} not found`,
    availableEndpoints: {
      root: 'GET /',
      mcp: 'POST/GET/DELETE /mcp',
      health: 'GET /health',
      sessions: 'GET /sessions',
      metrics: 'GET /metrics',
      metricsJson: 'GET /metrics/json'
    }
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: any) => {
  logger.error({ error: err, path: req.path }, 'HTTP server error');
  metricsCollector.incrementError('http_server');

  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: err.message,
      ...(CONFIG.development.nodeEnv === 'development' && { stack: err.stack })
    });
  }
});

// Start server
async function main() {
  try {
    const port = process.env.PORT || CONFIG.metrics.port || 9090;

    logger.info('Starting MCP Câmara BR Streamable HTTP Server...');
    logger.info({
      nodeEnv: CONFIG.development.nodeEnv,
      port,
      cacheEnabled: CONFIG.cache.enabled,
      rateLimitEnabled: CONFIG.rateLimit.enabled,
      circuitBreakerEnabled: CONFIG.circuitBreaker.enabled,
      metricsEnabled: CONFIG.metrics.enabled,
      toolsCount: allTools.length
    }, 'Configuration loaded');

    app.listen(port, () => {
      logger.info(`🚀 MCP Streamable HTTP Server listening on port ${port}`);
      logger.info(`📊 Tools available: ${allTools.length}`);
      logger.info(`🔗 Base URL: http://localhost:${port}`);
      logger.info(`❤️  Health check: http://localhost:${port}/health`);
      logger.info(`🔌 MCP endpoint: http://localhost:${port}/mcp`);
      logger.info(`📈 Metrics: http://localhost:${port}/metrics`);
      logger.info('');
      logger.info('📝 n8n Configuration:');
      logger.info(`   URL: http://localhost:${port}/mcp`);
      logger.info(`   Protocol: HTTP Streamable`);
      logger.info('');
      logger.info(`Registered ${allTools.length} tools:`);
      allTools.forEach(tool => {
        logger.info(`  - ${tool.name}: ${tool.description}`);
      });
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Shutting down MCP server...');
      // Close all active sessions
      activeSessions.forEach((session, sessionId) => {
        logger.info({ sessionId }, 'Closing session');
        session.server.close();
      });
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('Shutting down MCP server...');
      activeSessions.forEach((session, sessionId) => {
        logger.info({ sessionId }, 'Closing session');
        session.server.close();
      });
      process.exit(0);
    });

  } catch (error) {
    logger.error({ error }, 'Failed to start MCP server');
    process.exit(1);
  }
}

main();

#!/usr/bin/env node

import express, { Request, Response } from 'express';
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

// Create Express app
const app = express();

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next): void => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

// SSE Helper Functions
interface SSEMessage {
  event?: string;
  data: any;
  id?: string;
  retry?: number;
}

function sendSSE(res: Response, message: SSEMessage): void {
  if (message.event) {
    res.write(`event: ${message.event}\n`);
  }
  if (message.id) {
    res.write(`id: ${message.id}\n`);
  }
  if (message.retry) {
    res.write(`retry: ${message.retry}\n`);
  }

  const data = typeof message.data === 'string' ? message.data : JSON.stringify(message.data);
  res.write(`data: ${data}\n\n`);
}

function initSSE(res: Response): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no' // Disable nginx buffering
  });

  // Send initial comment to establish connection
  res.write(': connected\n\n');
}

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'MCP Câmara BR - HTTP API',
    version: '1.0.0',
    description: 'API HTTP para dados da Câmara dos Deputados do Brasil com suporte a streaming',
    endpoints: {
      tools: 'GET /api/tools - Lista todas as ferramentas disponíveis',
      call: 'POST /api/tools/:toolName - Executa uma ferramenta específica (resposta completa)',
      stream: 'POST /api/tools/:toolName/stream - Executa uma ferramenta com streaming (SSE)',
      health: 'GET /health - Health check',
      metrics: 'GET /metrics - Métricas Prometheus',
      metricsJson: 'GET /metrics/json - Métricas em JSON'
    },
    features: {
      streaming: 'Suporte a Server-Sent Events (SSE) para respostas em streaming',
      caching: 'Cache multinível com TTLs diferenciados',
      rateLimit: 'Rate limiting com algoritmo token bucket',
      metrics: 'Métricas Prometheus para monitoramento'
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
    memory: process.memoryUsage()
  });
});

// List all available tools
app.get('/api/tools', (_req: Request, res: Response) => {
  try {
    const toolsList = allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));

    res.json({
      success: true,
      count: toolsList.length,
      tools: toolsList
    });
  } catch (error) {
    logger.error({ error }, 'Error listing tools');
    res.status(500).json({
      success: false,
      error: 'Failed to list tools',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Execute a specific tool
app.post('/api/tools/:toolName', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { toolName } = req.params;
  const args = req.body || {};

  logger.info({ tool: toolName, args }, `Tool called via HTTP: ${toolName}`);

  try {
    // Find the tool
    const tool = allTools.find(t => t.name === toolName);

    if (!tool) {
      res.status(404).json({
        success: false,
        error: 'Tool not found',
        message: `Tool '${toolName}' does not exist`,
        availableTools: allTools.map(t => t.name)
      });
      return;
    }

    // Execute the tool
    const result = await tool.handler(args);

    // Metrics
    const duration = Date.now() - startTime;
    metricsCollector.incrementToolCall(toolName);
    metricsCollector.recordLatency(toolName, duration);

    logger.info(
      { tool: toolName, duration },
      `Tool completed via HTTP: ${toolName} in ${duration}ms`
    );

    res.json({
      success: true,
      tool: toolName,
      result,
      metadata: {
        executionTime: duration,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error({ tool: toolName, error, duration }, `Tool error via HTTP: ${toolName}`);
    metricsCollector.incrementError(toolName);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    res.status(500).json({
      success: false,
      error: 'Tool execution failed',
      tool: toolName,
      message: errorMessage,
      ...(CONFIG.development.nodeEnv === 'development' && { stack: errorStack }),
      metadata: {
        executionTime: duration,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Execute a specific tool with streaming (SSE)
app.post('/api/tools/:toolName/stream', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { toolName } = req.params;
  const args = req.body || {};

  logger.info({ tool: toolName, args }, `Tool called via HTTP streaming: ${toolName}`);

  // Initialize SSE connection
  initSSE(res);

  // Handle client disconnect
  req.on('close', () => {
    logger.info({ tool: toolName }, 'Client disconnected from stream');
  });

  try {
    // Send start event
    sendSSE(res, {
      event: 'start',
      data: {
        tool: toolName,
        timestamp: new Date().toISOString()
      }
    });

    // Find the tool
    const tool = allTools.find(t => t.name === toolName);

    if (!tool) {
      sendSSE(res, {
        event: 'error',
        data: {
          success: false,
          error: 'Tool not found',
          message: `Tool '${toolName}' does not exist`,
          availableTools: allTools.map(t => t.name)
        }
      });
      res.end();
      return;
    }

    // Send progress event
    sendSSE(res, {
      event: 'progress',
      data: {
        message: 'Executing tool...',
        progress: 0.5
      }
    });

    // Execute the tool
    const result = await tool.handler(args);

    // Metrics
    const duration = Date.now() - startTime;
    metricsCollector.incrementToolCall(toolName);
    metricsCollector.recordLatency(toolName, duration);

    logger.info(
      { tool: toolName, duration },
      `Tool completed via HTTP streaming: ${toolName} in ${duration}ms`
    );

    // Send result in chunks for large data
    const resultStr = JSON.stringify(result);
    const chunkSize = 1024 * 10; // 10KB chunks

    if (resultStr.length > chunkSize) {
      // Send large result in chunks
      const chunks = Math.ceil(resultStr.length / chunkSize);

      for (let i = 0; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, resultStr.length);
        const chunk = resultStr.slice(start, end);
        const isLast = i === chunks - 1;

        sendSSE(res, {
          event: 'chunk',
          data: {
            chunk,
            index: i,
            total: chunks,
            isLast
          }
        });
      }
    } else {
      // Send small result directly
      sendSSE(res, {
        event: 'data',
        data: result
      });
    }

    // Send completion event
    sendSSE(res, {
      event: 'complete',
      data: {
        success: true,
        tool: toolName,
        metadata: {
          executionTime: duration,
          timestamp: new Date().toISOString()
        }
      }
    });

    res.end();
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error({ tool: toolName, error, duration }, `Tool error via HTTP streaming: ${toolName}`);
    metricsCollector.incrementError(toolName);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    sendSSE(res, {
      event: 'error',
      data: {
        success: false,
        error: 'Tool execution failed',
        tool: toolName,
        message: errorMessage,
        ...(CONFIG.development.nodeEnv === 'development' && { stack: errorStack }),
        metadata: {
          executionTime: duration,
          timestamp: new Date().toISOString()
        }
      }
    });

    res.end();
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
      tools: 'GET /api/tools',
      call: 'POST /api/tools/:toolName',
      stream: 'POST /api/tools/:toolName/stream',
      health: 'GET /health',
      metrics: 'GET /metrics',
      metricsJson: 'GET /metrics/json'
    }
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: any) => {
  logger.error({ error: err, path: req.path }, 'HTTP server error');
  metricsCollector.incrementError('http_server');

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
    ...(CONFIG.development.nodeEnv === 'development' && { stack: err.stack })
  });
});

// Start server
async function main() {
  try {
    const port = parseInt(process.env.PORT || String(CONFIG.metrics.port || 9090), 10);

    logger.info('Starting MCP Câmara BR HTTP Server...');
    logger.info({
      nodeEnv: CONFIG.development.nodeEnv,
      port,
      cacheEnabled: CONFIG.cache.enabled,
      rateLimitEnabled: CONFIG.rateLimit.enabled,
      circuitBreakerEnabled: CONFIG.circuitBreaker.enabled,
      metricsEnabled: CONFIG.metrics.enabled,
      toolsCount: allTools.length
    }, 'Configuration loaded');

    app.listen(port, '0.0.0.0', () => {
      logger.info(`🚀 HTTP Server listening on port ${port}`);
      logger.info(`📊 Tools available: ${allTools.length}`);
      logger.info(`🔗 Base URL: http://0.0.0.0:${port}`);
      logger.info(`❤️  Health check: http://0.0.0.0:${port}/health`);
      logger.info(`📋 Tools list: http://0.0.0.0:${port}/api/tools`);
      logger.info(`📈 Metrics: http://0.0.0.0:${port}/metrics`);

      logger.info('\nRegistered tools:');
      allTools.forEach(tool => {
        logger.info(`  - ${tool.name}: ${tool.description}`);
      });
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Shutting down HTTP server...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('Shutting down HTTP server...');
      process.exit(0);
    });

  } catch (error) {
    logger.error({ error }, 'Failed to start HTTP server');
    process.exit(1);
  }
}

main();

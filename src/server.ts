#!/usr/bin/env node

import { CamaraMCPServer } from './mcp.js';
import { logger } from './core/logging.js';
import { CONFIG } from './config.js';

async function main() {
  try {
    logger.info('Starting MCP Camara BR Server...');
    logger.info({
      nodeEnv: CONFIG.development.nodeEnv,
      cacheEnabled: CONFIG.cache.enabled,
      rateLimitEnabled: CONFIG.rateLimit.enabled,
      circuitBreakerEnabled: CONFIG.circuitBreaker.enabled,
      metricsEnabled: CONFIG.metrics.enabled
    }, 'Configuration loaded');

    const server = new CamaraMCPServer();
    await server.start();

    // Endpoint de métricas (se habilitado)
    if (CONFIG.metrics.enabled) {
      const http = await import('http');
      const metricsServer = http.createServer((req, res) => {
        if (req.url === CONFIG.metrics.path) {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(server.exportMetrics());
        } else if (req.url === '/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
        } else if (req.url === '/metrics/json') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(server.getMetrics(), null, 2));
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      });

      metricsServer.listen(CONFIG.metrics.port, () => {
        logger.info(`Metrics server listening on port ${CONFIG.metrics.port}`);
        logger.info(`  - Prometheus metrics: http://localhost:${CONFIG.metrics.port}${CONFIG.metrics.path}`);
        logger.info(`  - JSON metrics: http://localhost:${CONFIG.metrics.port}/metrics/json`);
        logger.info(`  - Health check: http://localhost:${CONFIG.metrics.port}/health`);
      });
    }

  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

main();

#!/usr/bin/env node

import { CamaraBRMCPServer } from './mcp.js';
import { createLogger } from './core/logging.js';

const logger = createLogger('main');

async function main() {
  try {
    logger.info('Starting MCP Camara BR Server...');

    const server = new CamaraBRMCPServer();
    await server.start();

    logger.info('Server running successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

main();

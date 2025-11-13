import pino from 'pino';
import { config } from '../config.js';

export const logger = pino({
  level: config.logging.level,
  transport:
    config.logging.format === 'pretty'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export function createLogger(context: string) {
  return logger.child({ context });
}

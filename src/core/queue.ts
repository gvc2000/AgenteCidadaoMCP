import PQueue from 'p-queue';
import { config } from '../config.js';

export const apiQueue = new PQueue({
  concurrency: config.api.maxConcurrentRequests,
  timeout: config.api.timeout,
  throwOnTimeout: true,
});

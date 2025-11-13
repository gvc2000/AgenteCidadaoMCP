import PQueue from 'p-queue';
import { CONFIG } from '../config.js';
import { metricsCollector } from './metrics.js';

class RequestQueue {
  private queue: PQueue;

  constructor() {
    this.queue = new PQueue({
      concurrency: CONFIG.performance.maxConcurrentRequests,
      timeout: CONFIG.api.timeout,
      throwOnTimeout: true
    });

    // Atualizar métricas quando a fila mudar
    this.queue.on('active', () => {
      metricsCollector.setQueueSize(this.queue.size);
      metricsCollector.setActiveConnections(this.queue.pending);
    });

    this.queue.on('idle', () => {
      metricsCollector.setQueueSize(0);
      metricsCollector.setActiveConnections(0);
    });
  }

  async add<T>(operation: () => Promise<T>, priority?: number): Promise<T> {
    return this.queue.add(operation, { priority }) as Promise<T>;
  }

  getStatus() {
    return {
      size: this.queue.size,
      pending: this.queue.pending,
      isPaused: this.queue.isPaused
    };
  }

  pause() {
    this.queue.pause();
  }

  resume() {
    this.queue.start();
  }

  clear() {
    this.queue.clear();
  }
}

export const requestQueue = new RequestQueue();

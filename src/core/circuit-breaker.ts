import { config } from '../config.js';
import { CircuitBreakerError } from './errors.js';
import { createLogger } from './logging.js';

const logger = createLogger('circuit-breaker');

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime?: number;
  private successCount = 0;

  constructor(
    private readonly failureThreshold = config.circuitBreaker.failureThreshold,
    private readonly resetTimeout = config.circuitBreaker.resetTimeout
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!config.circuitBreaker.enabled) {
      return fn();
    }

    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        logger.info('Circuit breaker entering HALF_OPEN state');
      } else {
        throw new CircuitBreakerError();
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        logger.info('Circuit breaker CLOSED after successful recovery');
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.successCount = 0;
      logger.error(
        { failureCount: this.failureCount, threshold: this.failureThreshold },
        'Circuit breaker OPEN'
      );
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) {
      return false;
    }

    return Date.now() - this.lastFailureTime >= this.resetTimeout;
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    logger.info('Circuit breaker manually reset');
  }
}

// Singleton instance
export const circuitBreaker = new CircuitBreaker();

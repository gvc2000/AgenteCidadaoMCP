import { CONFIG } from '../config.js';
import { CircuitBreakerOpenError } from './errors.js';
import { logger } from './logging.js';

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

interface CircuitStats {
  failures: number;
  successes: number;
  halfOpenAttempts: number; // Contador de tentativas em half-open
  lastFailureTime?: number;
  stateChangedAt: number;
}

class CircuitBreaker {
  private enabled: boolean;
  private failureThreshold: number;
  private resetTimeout: number;
  private halfOpenMaxAttempts: number;
  private endpoints: Map<string, { state: CircuitState; stats: CircuitStats }>;

  constructor() {
    this.enabled = CONFIG.circuitBreaker.enabled;
    this.failureThreshold = CONFIG.circuitBreaker.failureThreshold;
    this.resetTimeout = CONFIG.circuitBreaker.resetTimeout;
    this.halfOpenMaxAttempts = CONFIG.circuitBreaker.halfOpenMaxAttempts ?? 3;
    this.endpoints = new Map();
  }

  async execute<T>(
    endpoint: string,
    operation: () => Promise<T>
  ): Promise<T> {
    if (!this.enabled) {
      return operation();
    }

    const endpointState = this.getEndpointState(endpoint);

    if (endpointState.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset(endpointState)) {
        this.setEndpointState(endpoint, CircuitState.HALF_OPEN);
      } else {
        throw new CircuitBreakerOpenError(
          `Circuit breaker is OPEN for ${endpoint}`,
          endpoint
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess(endpoint);
      return result;
    } catch (error) {
      this.onFailure(endpoint);
      throw error;
    }
  }

  private getEndpointState(endpoint: string) {
    if (!this.endpoints.has(endpoint)) {
      this.endpoints.set(endpoint, {
        state: CircuitState.CLOSED,
        stats: {
          failures: 0,
          successes: 0,
          halfOpenAttempts: 0,
          stateChangedAt: Date.now()
        }
      });
    }
    return this.endpoints.get(endpoint)!;
  }

  private setEndpointState(endpoint: string, state: CircuitState) {
    const endpointState = this.getEndpointState(endpoint);
    endpointState.state = state;
    endpointState.stats.stateChangedAt = Date.now();

    logger.info({
      type: 'circuit_breaker',
      endpoint,
      state,
      stats: endpointState.stats
    }, `Circuit breaker state changed to ${state} for ${endpoint}`);
  }

  private shouldAttemptReset(endpointState: { state: CircuitState; stats: CircuitStats }): boolean {
    const timeSinceOpen = Date.now() - endpointState.stats.stateChangedAt;
    return timeSinceOpen >= this.resetTimeout;
  }

  private onSuccess(endpoint: string) {
    const endpointState = this.getEndpointState(endpoint);
    endpointState.stats.successes++;
    endpointState.stats.failures = 0;
    endpointState.stats.halfOpenAttempts = 0;

    if (endpointState.state === CircuitState.HALF_OPEN) {
      logger.info({
        type: 'circuit_breaker',
        endpoint
      }, `Circuit recovered for ${endpoint}, closing circuit`);
      this.setEndpointState(endpoint, CircuitState.CLOSED);
    }
  }

  private onFailure(endpoint: string) {
    const endpointState = this.getEndpointState(endpoint);
    endpointState.stats.failures++;
    endpointState.stats.lastFailureTime = Date.now();

    if (endpointState.state === CircuitState.HALF_OPEN) {
      endpointState.stats.halfOpenAttempts++;

      // Só volta para OPEN se exceder o máximo de tentativas em half-open
      if (endpointState.stats.halfOpenAttempts >= this.halfOpenMaxAttempts) {
        logger.warn({
          type: 'circuit_breaker',
          endpoint,
          halfOpenAttempts: endpointState.stats.halfOpenAttempts
        }, `Half-open attempts exhausted for ${endpoint}, returning to OPEN`);
        this.setEndpointState(endpoint, CircuitState.OPEN);
        endpointState.stats.halfOpenAttempts = 0;
      }
    } else if (endpointState.stats.failures >= this.failureThreshold) {
      this.setEndpointState(endpoint, CircuitState.OPEN);
    }
  }

  getStatus(endpoint?: string) {
    if (endpoint) {
      const endpointState = this.getEndpointState(endpoint);
      return {
        endpoint,
        state: endpointState.state,
        failures: endpointState.stats.failures,
        successes: endpointState.stats.successes,
        lastFailureTime: endpointState.stats.lastFailureTime
      };
    }

    // Retorna status de todos os endpoints
    const statuses: any[] = [];
    for (const [ep, state] of this.endpoints.entries()) {
      statuses.push({
        endpoint: ep,
        state: state.state,
        failures: state.stats.failures,
        successes: state.stats.successes,
        lastFailureTime: state.stats.lastFailureTime
      });
    }
    return statuses;
  }

  reset(endpoint?: string) {
    if (endpoint) {
      const endpointState = this.getEndpointState(endpoint);
      endpointState.state = CircuitState.CLOSED;
      endpointState.stats = {
        failures: 0,
        successes: 0,
        halfOpenAttempts: 0,
        stateChangedAt: Date.now()
      };
      logger.info({
        type: 'circuit_breaker',
        endpoint
      }, `Circuit breaker manually reset for ${endpoint}`);
    } else {
      this.endpoints.clear();
      logger.info({
        type: 'circuit_breaker'
      }, 'All circuit breakers reset');
    }
  }
}

export const circuitBreaker = new CircuitBreaker();

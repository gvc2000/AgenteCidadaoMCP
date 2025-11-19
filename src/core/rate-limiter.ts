import { CONFIG } from '../config.js';
import { RateLimitError } from './errors.js';
import { logger } from './logging.js';

interface RateLimitState {
  tokens: number;
  lastRefill: number;
}

class RateLimiter {
  private enabled: boolean;
  private maxTokens: number;
  private refillRate: number; // tokens por ms
  private state: RateLimitState;

  constructor() {
    this.enabled = CONFIG.rateLimit.enabled;
    this.maxTokens = CONFIG.rateLimit.perMinute;
    this.refillRate = CONFIG.rateLimit.perMinute / 60000; // tokens por ms

    this.state = {
      tokens: this.maxTokens,
      lastRefill: Date.now()
    };
  }

  async acquire(tokens: number = 1): Promise<void> {
    if (!this.enabled) return;

    this.refillTokens();

    if (this.state.tokens >= tokens) {
      this.state.tokens -= tokens;
      return;
    }

    // Não há tokens suficientes - esperar automaticamente
    const waitTime = this.calculateWaitTime(tokens);

    // Se o tempo de espera for muito longo (>10s), lançar exceção
    if (waitTime > 10000) {
      logger.warn({
        type: 'rate_limit',
        tokens: this.state.tokens,
        required: tokens,
        waitTime
      }, 'Rate limit exceeded - wait time too long');

      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)}s`,
        waitTime
      );
    }

    // Esperar automaticamente para tempos curtos
    logger.debug({
      type: 'rate_limit_wait',
      waitTime
    }, `Aguardando ${Math.ceil(waitTime)}ms para rate limit`);

    await new Promise(resolve => setTimeout(resolve, waitTime));

    // Após esperar, refill e consumir tokens
    this.refillTokens();
    this.state.tokens -= tokens;
  }

  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.state.lastRefill;
    const newTokens = elapsed * this.refillRate;

    this.state.tokens = Math.min(
      this.maxTokens,
      this.state.tokens + newTokens
    );
    this.state.lastRefill = now;
  }

  private calculateWaitTime(tokens: number): number {
    const tokensNeeded = tokens - this.state.tokens;
    return tokensNeeded / this.refillRate;
  }

  getStatus() {
    this.refillTokens();
    return {
      tokens: Math.floor(this.state.tokens),
      maxTokens: this.maxTokens,
      percentage: (this.state.tokens / this.maxTokens) * 100
    };
  }

  reset(): void {
    this.state = {
      tokens: this.maxTokens,
      lastRefill: Date.now()
    };
  }
}

export const rateLimiter = new RateLimiter();

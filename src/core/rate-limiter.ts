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

    // Não há tokens suficientes
    const waitTime = this.calculateWaitTime(tokens);

    logger.warn({
      type: 'rate_limit',
      tokens: this.state.tokens,
      required: tokens,
      waitTime
    }, 'Rate limit reached');

    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)}s`,
      waitTime
    );
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

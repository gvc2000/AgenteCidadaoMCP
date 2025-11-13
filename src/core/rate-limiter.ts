import { config } from '../config.js';
import { RateLimitError } from './errors.js';
import { createLogger } from './logging.js';

const logger = createLogger('rate-limiter');

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second

  constructor() {
    this.maxTokens = config.rateLimit.burst;
    this.refillRate = config.rateLimit.perMinute / 60; // Convert per minute to per second
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  async acquire(): Promise<void> {
    if (!config.rateLimit.enabled) {
      return;
    }

    this.refill();

    if (this.tokens < 1) {
      const waitTime = ((1 - this.tokens) / this.refillRate) * 1000;
      logger.warn({ waitTime, tokens: this.tokens }, 'Rate limit reached, waiting');

      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.refill();
    }

    if (this.tokens < 1) {
      throw new RateLimitError();
    }

    this.tokens -= 1;
    logger.debug({ tokensRemaining: this.tokens }, 'Token acquired');
  }

  getStats() {
    this.refill();
    return {
      availableTokens: Math.floor(this.tokens),
      maxTokens: this.maxTokens,
      refillRate: this.refillRate,
    };
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

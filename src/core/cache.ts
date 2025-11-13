import { LRUCache } from 'lru-cache';
import { config } from '../config.js';
import { createLogger } from './logging.js';

const logger = createLogger('cache');

interface CacheOptions {
  ttl?: number;
  maxSize?: number;
}

export class CacheManager {
  private caches: Map<string, LRUCache<string, any>>;

  constructor() {
    this.caches = new Map();
  }

  private getOrCreateCache(category: string, options?: CacheOptions): LRUCache<string, any> {
    if (!this.caches.has(category)) {
      const cache = new LRUCache<string, any>({
        max: options?.maxSize || config.cache.maxSize,
        ttl: (options?.ttl || config.cache.ttl) * 1000, // Convert to milliseconds
        updateAgeOnGet: true,
        updateAgeOnHas: false,
      });

      this.caches.set(category, cache);
      logger.debug({ category, options }, 'Cache created');
    }

    return this.caches.get(category)!;
  }

  get<T>(category: string, key: string): T | undefined {
    if (!config.cache.enabled) {
      return undefined;
    }

    const cache = this.getOrCreateCache(category);
    const value = cache.get(key);

    if (value !== undefined) {
      logger.debug({ category, key }, 'Cache hit');
    }

    return value;
  }

  set<T>(category: string, key: string, value: T, ttl?: number): void {
    if (!config.cache.enabled) {
      return;
    }

    const cache = this.getOrCreateCache(category, { ttl });
    cache.set(key, value);
    logger.debug({ category, key, ttl }, 'Cache set');
  }

  delete(category: string, key: string): void {
    const cache = this.caches.get(category);
    if (cache) {
      cache.delete(key);
      logger.debug({ category, key }, 'Cache deleted');
    }
  }

  clear(category?: string): void {
    if (category) {
      const cache = this.caches.get(category);
      if (cache) {
        cache.clear();
        logger.info({ category }, 'Cache cleared');
      }
    } else {
      this.caches.forEach((cache, cat) => {
        cache.clear();
        logger.info({ category: cat }, 'Cache cleared');
      });
    }
  }

  getStats(category: string) {
    const cache = this.caches.get(category);
    if (!cache) {
      return null;
    }

    return {
      size: cache.size,
      maxSize: cache.max,
    };
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// TTL strategies by category (in seconds)
export const CacheTTL = {
  deputados: 3600, // 1h
  proposicoes: 1800, // 30min
  votacoes: 300, // 5min
  eventos: 600, // 10min
  orgaos: 7200, // 2h
  frentes: 86400, // 24h
  blocos: 86400, // 24h
  partidos: 3600, // 1h
  legislaturas: 86400, // 24h
  referencias: 604800, // 7 days
  despesas: 86400, // 24h
};

import { LRUCache } from 'lru-cache';
import { CONFIG } from '../config.js';
import { logCacheHit, logCacheMiss } from './logging.js';

interface CacheStrategy {
  ttl: number;
  maxSize: number;
}

const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  deputados: { ttl: 3600, maxSize: 1500 },      // 1h, aumentado maxSize
  proposicoes: { ttl: 3600, maxSize: 800 },     // 1h (aumentado de 30min), aumentado maxSize
  votacoes: { ttl: 1800, maxSize: 400 },        // 30min (aumentado de 5min), aumentado maxSize
  eventos: { ttl: 1800, maxSize: 500 },         // 30min (aumentado de 10min), aumentado maxSize
  orgaos: { ttl: 7200, maxSize: 200 },          // 2h, aumentado maxSize
  frentes: { ttl: 86400, maxSize: 100 },        // 24h, aumentado maxSize
  partidos: { ttl: 7200, maxSize: 100 },        // 2h (aumentado de 1h), aumentado maxSize
  blocos: { ttl: 7200, maxSize: 100 },          // 2h (aumentado de 1h), aumentado maxSize
  legislaturas: { ttl: 86400, maxSize: 200 },   // 24h, aumentado maxSize
  referencias: { ttl: 604800, maxSize: 200 },   // 7 dias, aumentado maxSize
  despesas: { ttl: 86400, maxSize: 1000 },      // 24h, aumentado maxSize
  analises: { ttl: 3600, maxSize: 400 }         // 1h (aumentado de 30min), aumentado maxSize
};

class CacheManager {
  private caches: Map<string, LRUCache<string, any>>;
  private enabled: boolean;

  constructor() {
    this.enabled = CONFIG.cache.enabled;
    this.caches = new Map();

    if (this.enabled) {
      this.initializeCaches();
    }
  }

  private initializeCaches() {
    for (const [category, strategy] of Object.entries(CACHE_STRATEGIES)) {
      this.caches.set(
        category,
        new LRUCache({
          max: strategy.maxSize,
          ttl: strategy.ttl * 1000, // Converte para ms
          allowStale: false,
          updateAgeOnGet: false,  // Otimizado: não atualiza idade em cada get
          updateAgeOnHas: false
        })
      );
    }
  }

  get<T>(category: string, key: string): T | undefined {
    if (!this.enabled) return undefined;

    const cache = this.caches.get(category);
    if (!cache) return undefined;

    const value = cache.get(key);
    if (value !== undefined) {
      logCacheHit(`${category}:${key}`);
      return value as T;
    }

    logCacheMiss(`${category}:${key}`);
    return undefined;
  }

  set<T>(category: string, key: string, value: T): void {
    if (!this.enabled) return;

    const cache = this.caches.get(category);
    if (!cache) return;

    cache.set(key, value);
  }

  delete(category: string, key: string): void {
    if (!this.enabled) return;

    const cache = this.caches.get(category);
    if (!cache) return;

    cache.delete(key);
  }

  clear(category?: string): void {
    if (!this.enabled) return;

    if (category) {
      const cache = this.caches.get(category);
      if (cache) cache.clear();
    } else {
      for (const cache of this.caches.values()) {
        cache.clear();
      }
    }
  }

  getStats(category: string) {
    const cache = this.caches.get(category);
    if (!cache) return null;

    return {
      size: cache.size,
      maxSize: cache.max,
      calculatedSize: cache.calculatedSize
    };
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [category, cache] of this.caches.entries()) {
      stats[category] = {
        size: cache.size,
        maxSize: cache.max,
        calculatedSize: cache.calculatedSize
      };
    }
    return stats;
  }
}

export const cacheManager = new CacheManager();

// Helper para criar chave de cache
export function createCacheKey(params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  return JSON.stringify(sortedParams);
}

// Decorator para cachear resultados de funções
export function cached(category: string) {
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = createCacheKey({ method: propertyKey, args });

      const cachedResult = cacheManager.get(category, cacheKey);
      if (cachedResult !== undefined) {
        return cachedResult;
      }

      const result = await originalMethod.apply(this, args);
      cacheManager.set(category, cacheKey, result);

      return result;
    };

    return descriptor;
  };
}

import { LRUCache } from 'lru-cache';
import { config } from '../config.js';

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
}

export class Cache {
  private cache: LRUCache<string, any>;

  constructor(options?: CacheOptions) {
    this.cache = new LRUCache({
      max: options?.maxSize || config.cache.maxSize,
      ttl: (options?.ttl || config.cache.ttl) * 1000, // Converter para ms
      allowStale: false,
      updateAgeOnGet: true,
      updateAgeOnHas: false,
    });
  }

  get<T>(key: string): T | undefined {
    if (!config.cache.enabled) return undefined;
    return this.cache.get(key) as T | undefined;
  }

  set<T>(key: string, value: T): void {
    if (!config.cache.enabled) return;
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    if (!config.cache.enabled) return false;
    return this.cache.has(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Cache global com diferentes TTLs por categoria
export const caches = {
  deputados: new Cache({ ttl: 3600, maxSize: 1000 }),      // 1h
  proposicoes: new Cache({ ttl: 1800, maxSize: 500 }),     // 30min
  votacoes: new Cache({ ttl: 300, maxSize: 200 }),         // 5min
  eventos: new Cache({ ttl: 600, maxSize: 300 }),          // 10min
  orgaos: new Cache({ ttl: 7200, maxSize: 100 }),          // 2h
  referencias: new Cache({ ttl: 604800, maxSize: 100 }),   // 7 dias
};

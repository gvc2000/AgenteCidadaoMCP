import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { cacheManager, createCacheKey } from '../src/core/cache.js';
import { camaraAPI } from '../src/api/client.js';
import { rateLimiter } from '../src/core/rate-limiter.js';
import { circuitBreaker } from '../src/core/circuit-breaker.js';

const API_BASE = 'https://dadosabertos.camara.leg.br';

describe('Core Services', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Cache Manager', () => {
    it('deve criar chave de cache corretamente', () => {
      const params = { id: 123, ano: 2024 };
      const key = createCacheKey(params);

      expect(key).toBeDefined();
      expect(typeof key).toBe('string');
    });

    it('deve gerar chaves diferentes para parâmetros diferentes', () => {
      const key1 = createCacheKey({ id: 123 });
      const key2 = createCacheKey({ id: 456 });

      expect(key1).not.toBe(key2);
    });

    it('deve armazenar e recuperar dados do cache', () => {
      const testData = { test: 'data', value: 123 };
      const key = 'test-key';

      cacheManager.set('deputados', key, testData);
      const cached = cacheManager.get<typeof testData>('deputados', key);

      expect(cached).toEqual(testData);
    });

    it('deve retornar undefined para chave inexistente', () => {
      const result = cacheManager.get('deputados', 'non-existent-key');
      expect(result).toBeUndefined();
    });

    it('deve limpar cache por categoria', () => {
      const key = 'test-clear';
      cacheManager.set('deputados', key, { data: 'test' });

      cacheManager.clear('deputados');

      const result = cacheManager.get('deputados', key);
      expect(result).toBeUndefined();
    });
  });

  describe('API Client', () => {
    it('deve fazer requisição GET corretamente', async () => {
      const mockData = {
        dados: [{ id: 1, nome: 'Test' }],
        links: []
      };

      nock(API_BASE)
        .get('/api/v2/test')
        .reply(200, mockData);

      const result = await camaraAPI.get('/test');

      expect(result).toEqual(mockData);
    });

    it('deve passar parâmetros de query', async () => {
      const mockData = { dados: [], links: [] };

      nock(API_BASE)
        .get('/api/v2/test')
        .query({ param1: 'value1', param2: 123 })
        .reply(200, mockData);

      const result = await camaraAPI.get('/test', { param1: 'value1', param2: 123 });

      expect(result).toBeDefined();
    });

    it('deve tratar erro 404', async () => {
      nock(API_BASE)
        .get('/api/v2/not-found')
        .reply(404, { error: 'Not Found' });

      await expect(
        camaraAPI.get('/not-found')
      ).rejects.toThrow();
    });

    it('deve tratar erro 500', async () => {
      nock(API_BASE)
        .get('/api/v2/error')
        .reply(500, { error: 'Internal Server Error' });

      await expect(
        camaraAPI.get('/error')
      ).rejects.toThrow();
    });

    it('deve construir URL completa corretamente', () => {
      const fullUrl = camaraAPI.getFullURL('/test/123');

      expect(fullUrl).toBe('https://dadosabertos.camara.leg.br/api/v2/test/123');
    });

    it('deve usar getWithPagination', async () => {
      const mockData = {
        dados: [{ id: 1 }, { id: 2 }],
        links: [{ rel: 'next', href: 'https://example.com/next' }]
      };

      nock(API_BASE)
        .get('/api/v2/paginated')
        .query(true)
        .reply(200, mockData);

      const result = await camaraAPI.getWithPagination('/paginated');

      expect(result.dados).toHaveLength(2);
      expect(result.links).toHaveLength(1);
    });
  });

  describe('Rate Limiter', () => {
    it('deve permitir requisições dentro do limite', async () => {
      // O rate limiter deve permitir requisições normais
      await expect(rateLimiter.acquire()).resolves.not.toThrow();
    });
  });

  describe('Circuit Breaker', () => {
    it('deve executar função normalmente quando circuito está fechado', async () => {
      const result = await circuitBreaker.execute('test', async () => {
        return 'success';
      });

      expect(result).toBe('success');
    });

    it('deve propagar erros da função executada', async () => {
      await expect(
        circuitBreaker.execute('test-error', async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
    });
  });
});

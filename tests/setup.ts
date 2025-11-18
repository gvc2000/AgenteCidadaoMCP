import { beforeAll, afterAll } from 'vitest';
import nock from 'nock';

// Configurar nock para interceptar todas as requisições HTTP
beforeAll(() => {
  // Desabilitar requisições reais por padrão
  nock.disableNetConnect();
  // Permitir conexões localhost para testes locais se necessário
  nock.enableNetConnect('127.0.0.1');
});

afterAll(() => {
  // Limpar todos os mocks
  nock.cleanAll();
  // Reabilitar conexões
  nock.enableNetConnect();
});

// Silenciar logs durante os testes
process.env.LOG_LEVEL = 'silent';
process.env.CACHE_ENABLED = 'true';
process.env.RATE_LIMIT_ENABLED = 'false';
process.env.CIRCUIT_BREAKER_ENABLED = 'false';

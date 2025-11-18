# CLAUDE.md - MCP Câmara BR

Servidor MCP para API da Câmara dos Deputados. TypeScript, Node.js >= 20.

## Quick Reference

```bash
npm run build          # Compilar
npm run dev            # Desenvolvimento
npm test               # Testes
npm run lint           # Lint
```

## Arquitetura

```
MCP Layer (mcp.ts) → Tools (tools/*) → Core (core/*) → API Client (api/client.ts) → External API
```

### Entry Points
- `src/server.ts` - MCP stdio (principal)
- `src/mcp-sse-server.ts` - SSE para n8n
- `src/http-server.ts` - REST API

## Estrutura src/

```
├── api/client.ts, normalizers.ts     # HTTP client, normalização
├── core/                              # Cache, rate-limiter, circuit-breaker, metrics, logging, errors, schemas
├── tools/                             # 55 tools em 11 categorias
│   ├── deputados/      (9)           # buscar, detalhar, despesas, discursos, eventos, frentes, ocupacoes, orgaos, profissoes
│   ├── proposicoes/    (7)           # buscar, detalhar, autores, tramitacoes, votacoes, relacionadas, temas
│   ├── votacoes/       (5)           # buscar, detalhar, votos, orientacoes, ultimas
│   ├── eventos/        (6)           # buscar, detalhar, deputados, pauta, votacoes, orgaos
│   ├── orgaos/         (5)           # buscar, detalhar, membros, eventos, votacoes
│   ├── partidos/       (4)           # buscar, detalhar, membros, lideres
│   ├── frentes/        (3)           # buscar, detalhar, membros
│   ├── blocos/         (2)           # buscar, detalhar
│   ├── legislaturas/   (3)           # buscar, detalhar, mesa
│   ├── referencias/    (5)           # situacoes, tipos_proposicao, tipos_orgao, tipos_evento, ufs
│   └── analises/       (6)           # presenca, ranking, despesas_partido, comparativo, timeline, exportar
└── utils/                             # aggregators, currency, date, sanitizers
```

## Convenções

### Naming
- Files: `kebab-case.ts`
- Functions: `camelCase`
- Types: `PascalCase`
- MCP Tools: `snake_case`

### Imports - SEMPRE usar .js
```typescript
import { logger } from './core/logging.js';
```

## Padrão de Tool

```typescript
import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { metricsCollector } from '../../core/metrics.js';

const Schema = z.object({ id: z.number().int().positive() });
export type Params = z.infer<typeof Schema>;

export async function handler(params: Params) {
  const start = Date.now();
  try {
    const validated = Schema.parse(params);
    const key = createCacheKey(validated);
    const cached = cacheManager.get<any>('category', key);
    if (cached) return { ...cached, _metadata: { ...cached._metadata, cache: true } };

    const response = await camaraAPI.get('/endpoint', validated);
    const result = { data: response.dados, _metadata: { cache: false, latencyMs: Date.now() - start } };

    cacheManager.set('category', key, result);
    metricsCollector.incrementToolCall('tool_name');
    metricsCollector.recordLatency('tool_name', Date.now() - start);
    return result;
  } catch (error) {
    metricsCollector.incrementError('tool_name');
    throw error;
  }
}

export const definition = {
  name: 'tool_name',
  description: 'Descrição clara',
  inputSchema: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'] },
  handler
};
```

## Core Services

| Service | Arquivo | Singleton | Função |
|---------|---------|-----------|--------|
| Cache | `cache.ts` | `cacheManager` | LRU com TTLs por categoria |
| Rate Limiter | `rate-limiter.ts` | `rateLimiter` | Token bucket (100/min) |
| Circuit Breaker | `circuit-breaker.ts` | `circuitBreaker` | 5 falhas → abre 60s |
| Metrics | `metrics.ts` | `metricsCollector` | Prometheus/JSON |
| Logger | `logging.ts` | `logger` | Pino (stderr) |
| Queue | `queue.ts` | `requestQueue` | p-queue (10 concurrent) |

### Cache TTLs
deputados: 1h, proposicoes: 30m, votacoes: 5m, eventos: 10m, orgaos: 2h, frentes: 24h, partidos: 1h, blocos: 1h, legislaturas: 24h, referencias: 7d, despesas: 24h, analises: 30m

### Errors (core/errors.ts)
`CamaraAPIError`, `ValidationError`, `RateLimitError`, `CircuitBreakerOpenError`, `TimeoutError`

## Adicionar Nova Tool

1. Criar `src/tools/<categoria>/<nome>.ts` seguindo o padrão
2. Adicionar export em `src/tools/<categoria>/index.ts`
3. Tool é registrada automaticamente via `allTools` em `mcp.ts`
4. Testar: `npm run build && echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"nova_tool","arguments":{}}}' | node dist/server.js`

## Config (.env)

```bash
# API
API_BASE_URL=https://dadosabertos.camara.leg.br/api/v2

# Core (defaults)
CACHE_ENABLED=true              RATE_LIMIT_PER_MINUTE=100
LOG_LEVEL=info                  METRICS_PORT=9090
MAX_CONCURRENT_REQUESTS=10      MAX_RETRIES=3
```

Acesso: `import { CONFIG } from './config.js'`

## Checklist para Modificações

- [ ] Ler arquivo antes de editar
- [ ] Usar `.js` nos imports
- [ ] Validar com Zod
- [ ] Incrementar metrics
- [ ] Usar cache quando apropriado
- [ ] Tratar erros com classes customizadas
- [ ] Não usar `any`
- [ ] Testar com `npm run build && npm test`

## Troubleshooting

| Erro | Solução |
|------|---------|
| `Cannot find module '*.js'` | Usar `.js` nos imports |
| `Rate limit exceeded` | Aguardar ou ajustar `RATE_LIMIT_PER_MINUTE` |
| `Circuit breaker open` | API externa indisponível, aguardar 60s |

## API Externa

**Base**: https://dadosabertos.camara.leg.br/api/v2
**Docs**: https://dadosabertos.camara.leg.br/swagger/api.html
**Auth**: Não requerida (API pública)

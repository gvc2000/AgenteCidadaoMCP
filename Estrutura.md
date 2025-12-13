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
├── tools/                             # 57 tools em 11 categorias
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
│   └── analises/       (8)           # presenca, ranking, despesas_partido, comparativo, timeline, exportar, sugerir, diagnosticar
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

## Guia Rápido: Quando Usar Cada Tool

### Tools de Ajuda (use primeiro!)
- `sugerir_ferramentas` - Não sabe qual tool usar? Descreva o que quer e receba sugestões
- `diagnosticar_consulta` - Receba um fluxo completo de tools para sua consulta

### Fluxos Comuns

**Buscar informações de deputado:**
1. `buscar_deputados` (pelo nome) → obter ID
2. `detalhar_deputado` (com ID) → dados completos
3. `despesas_deputado` / `discursos_deputado` / `orgaos_deputado` → dados específicos

**Acompanhar proposição:**
1. `buscar_proposicoes` (por tipo/ano/keywords) → obter ID
2. `detalhar_proposicao` → dados completos
3. `tramitacoes_proposicao` → histórico de andamento
4. `votacoes_proposicao` → resultado das votações

**Analisar votações:**
1. `buscar_votacoes` (por período) ou `ultimas_votacoes`
2. `detalhar_votacao` → resultado geral
3. `votos_votacao` → voto de cada deputado
4. `orientacoes_votacao` → orientação dos partidos

### Tabela Completa de Tools (57)

| Categoria | Tool | Quando Usar |
|-----------|------|-------------|
| **Deputados** | `buscar_deputados` | Encontrar deputados por nome/UF/partido |
| | `detalhar_deputado` | Dados completos (requer ID) |
| | `despesas_deputado` | Gastos da cota parlamentar |
| | `discursos_deputado` | Pronunciamentos em plenário |
| | `eventos_deputado` | Eventos que participou |
| | `frentes_deputado` | Frentes parlamentares que integra |
| | `ocupacoes_deputado` | Histórico de ocupações |
| | `orgaos_deputado` | Comissões que participa |
| | `profissoes_deputado` | Profissões declaradas |
| **Proposições** | `buscar_proposicoes` | Buscar PLs, PECs, MPs por filtros |
| | `detalhar_proposicao` | Dados completos (requer ID) |
| | `autores_proposicao` | Quem apresentou |
| | `tramitacoes_proposicao` | Histórico de tramitação |
| | `votacoes_proposicao` | Votações da proposição |
| | `relacionadas_proposicao` | Proposições relacionadas |
| | `temas_proposicao` | Temas/assuntos |
| **Votações** | `buscar_votacoes` | Buscar votações por período |
| | `detalhar_votacao` | Resultado geral |
| | `votos_votacao` | Voto individual de cada deputado |
| | `orientacoes_votacao` | Orientação dos partidos |
| | `ultimas_votacoes` | Votações mais recentes |
| **Eventos** | `buscar_eventos` | Buscar reuniões/sessões |
| | `detalhar_evento` | Dados do evento |
| | `deputados_evento` | Deputados presentes |
| | `pauta_evento` | O que será discutido |
| | `votacoes_evento` | Votações do evento |
| | `orgaos_evento` | Órgãos participantes |
| **Órgãos** | `buscar_orgaos` | Buscar comissões |
| | `detalhar_orgao` | Dados do órgão |
| | `membros_orgao` | Composição atual |
| | `eventos_orgao` | Eventos do órgão |
| | `votacoes_orgao` | Votações do órgão |
| **Partidos** | `buscar_partidos` | Listar partidos |
| | `detalhar_partido` | Dados do partido |
| | `membros_partido` | Deputados do partido |
| | `lideres_partido` | Liderança |
| **Frentes** | `buscar_frentes` | Buscar frentes parlamentares |
| | `detalhar_frente` | Dados da frente |
| | `membros_frente` | Membros da frente |
| **Blocos** | `buscar_blocos` | Buscar blocos partidários |
| | `detalhar_bloco` | Dados do bloco |
| **Legislaturas** | `buscar_legislaturas` | Listar legislaturas |
| | `detalhar_legislatura` | Dados da legislatura |
| | `mesa_legislatura` | Mesa Diretora |
| **Referências** | `situacoes_proposicao` | IDs de situações (para filtrar) |
| | `tipos_proposicao` | Siglas de tipos (PL, PEC, etc) |
| | `tipos_orgao` | Tipos de órgãos |
| | `tipos_evento` | Tipos de eventos |
| | `ufs` | Lista de estados |
| **Análises** | `analise_presenca` | Taxa de presença de deputados |
| | `ranking_proposicoes` | Ranking de proposições |
| | `analise_despesas_partido` | Despesas agregadas por partido |
| | `comparativo_votacoes` | Comparar votações |
| | `timeline_tramitacao` | Timeline visual de tramitação |
| | `exportar_dados` | Exportar para CSV/JSON |
| | `sugerir_ferramentas` | Sugere tools para sua consulta |
| | `diagnosticar_consulta` | Fluxo completo recomendado |

## API Externa

**Base**: https://dadosabertos.camara.leg.br/api/v2
**Docs**: https://dadosabertos.camara.leg.br/swagger/api.html
**Auth**: Não requerida (API pública)

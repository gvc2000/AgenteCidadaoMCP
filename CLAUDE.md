# CLAUDE.md - AI Assistant Guide for MCP Câmara BR

This document provides comprehensive guidance for AI assistants (like Claude) working on the **mcp-camara-br** codebase. It explains the architecture, conventions, workflows, and best practices to follow.

## Project Overview

**mcp-camara-br** is a Model Context Protocol (MCP) server that provides a complete, production-ready interface to the Brazilian Chamber of Deputies (Câmara dos Deputados) Open Data API. It exposes legislative data through typed, validated, and optimized tools designed for use with Large Language Models.

### Key Information
- **Name**: mcp-camara-br
- **Version**: 1.0.0
- **Language**: TypeScript (100%)
- **Runtime**: Node.js >= 20.0.0
- **License**: MIT
- **Build System**: TypeScript Compiler (tsc)
- **Package Manager**: npm

### Core Features
- ✅ Complete coverage of main Câmara API endpoints
- ✅ Strict input validation using Zod schemas
- ✅ Multi-tiered caching system with differentiated TTLs
- ✅ Rate limiting with token bucket algorithm
- ✅ Circuit breaker pattern for resilience
- ✅ Prometheus-compatible metrics
- ✅ Structured logging with Pino
- ✅ Docker-ready with multi-stage builds

## Architecture Overview

### Design Patterns

1. **MCP Tool Pattern**: Each functionality is exposed as an MCP tool with:
   - Name (snake_case)
   - Description (clear, LLM-friendly)
   - Input schema (JSON Schema)
   - Handler function (async)

2. **Layered Architecture**:
   ```
   MCP Layer (mcp.ts)
   ↓
   Tools Layer (tools/*)
   ↓
   Core Services (core/*)
   ↓
   API Client (api/client.ts)
   ↓
   External API
   ```

3. **Separation of Concerns**:
   - **Tools**: Business logic and orchestration
   - **Core**: Cross-cutting concerns (cache, rate limiting, metrics)
   - **API**: HTTP communication and data normalization
   - **Utils**: Pure utility functions

### Core Systems

#### 1. Cache System (`src/core/cache.ts`)
- Uses LRU (Least Recently Used) cache strategy
- Different TTLs per data category:
  - Deputados: 1 hour
  - Proposições: 30 minutes
  - Votações: 5 minutes
  - Eventos: 10 minutes
  - Legislaturas: 24 hours
  - Referências: 7 days
- Key generation based on sorted params for consistency
- Cache-aside pattern (check cache → miss → fetch → store)

#### 2. Rate Limiter (`src/core/rate-limiter.ts`)
- Token bucket algorithm
- Configurable per-minute limit (default: 100)
- Burst capacity (default: 20)
- Exponential backoff on rate limit hits

#### 3. Circuit Breaker (`src/core/circuit-breaker.ts`)
- Three states: CLOSED, OPEN, HALF_OPEN
- Failure threshold (default: 5 consecutive failures)
- Reset timeout (default: 60 seconds)
- Prevents cascading failures

#### 4. Metrics Collector (`src/core/metrics.ts`)
- Tool call counters
- Error counters
- Latency histograms
- Prometheus text format export
- JSON export for debugging
- HTTP endpoint on port 9090

#### 5. Logging (`src/core/logging.ts`)
- Structured JSON logging (Pino)
- Log levels: trace, debug, info, warn, error, fatal
- Logs to stderr for MCP compatibility
- Pretty format available for development

## Directory Structure

```
AgenteCidadaoMCP/
├── src/
│   ├── server.ts              # Entry point, bootstraps MCP server
│   ├── mcp.ts                 # MCP server setup, tool registration
│   ├── config.ts              # Configuration management (env vars)
│   │
│   ├── api/
│   │   ├── client.ts          # HTTP client with retry logic
│   │   └── normalizers.ts     # API response normalization
│   │
│   ├── core/
│   │   ├── cache.ts           # LRU cache manager
│   │   ├── circuit-breaker.ts # Circuit breaker implementation
│   │   ├── errors.ts          # Custom error classes
│   │   ├── logging.ts         # Pino logger setup
│   │   ├── metrics.ts         # Metrics collection
│   │   ├── queue.ts           # Request queue management
│   │   ├── rate-limiter.ts    # Token bucket rate limiter
│   │   └── schemas.ts         # Shared Zod schemas
│   │
│   ├── tools/
│   │   ├── deputados/         # Deputy-related tools
│   │   │   ├── index.ts       # Exports all deputy tools
│   │   │   ├── buscar.ts      # Search deputies
│   │   │   ├── detalhar.ts    # Get deputy details
│   │   │   ├── despesas.ts    # Deputy expenses
│   │   │   ├── discursos.ts   # Deputy speeches
│   │   │   ├── eventos.ts     # Deputy events
│   │   │   └── orgaos.ts      # Deputy organizations
│   │   │
│   │   └── proposicoes/       # Proposition-related tools
│   │       ├── index.ts       # Exports all proposition tools
│   │       ├── buscar.ts      # Search propositions
│   │       ├── detalhar.ts    # Get proposition details
│   │       └── autores.ts     # Proposition authors
│   │
│   └── utils/
│       ├── aggregators.ts     # Data aggregation functions
│       ├── currency.ts        # Currency formatting
│       ├── date.ts            # Date utilities
│       └── sanitizers.ts      # Input sanitization
│
├── dist/                      # Compiled JavaScript (generated)
├── node_modules/              # Dependencies (generated)
│
├── .env.example               # Environment variables template
├── .eslintrc.json             # ESLint configuration
├── .gitignore                 # Git ignore rules
├── .prettierrc                # Prettier configuration
├── tsconfig.json              # TypeScript compiler config
│
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Docker Compose setup
├── package.json               # npm package configuration
│
├── README.md                  # Main documentation
├── GUIA_INSTALACAO_USO.md     # Complete installation guide
├── INICIO_RAPIDO.md           # Quick start (5 minutes)
├── EXEMPLOS_PRATICOS.md       # Practical examples with LLMs
└── mcp-camara-br-especificacao-completa.md  # Technical specification
```

## Code Conventions

### TypeScript Conventions

1. **Strict Mode**: All strict TypeScript flags enabled
   - `strict: true`
   - `noUnusedLocals: true`
   - `noUnusedParameters: true`
   - `noImplicitReturns: true`
   - `noFallthroughCasesInSwitch: true`

2. **Module System**: ES Modules (Node16)
   - Always use `.js` extensions in imports (TypeScript quirk)
   - Example: `import { logger } from './core/logging.js';`

3. **Naming Conventions**:
   - **Files**: kebab-case (`buscar-deputados.ts`)
   - **Functions**: camelCase (`buscarDeputados`)
   - **Types/Interfaces**: PascalCase (`BuscarDeputadosParams`)
   - **Constants**: UPPER_SNAKE_CASE (`CONFIG`, `CACHE_STRATEGIES`)
   - **MCP Tools**: snake_case (`buscar_deputados`)

4. **Type Safety**:
   - No `any` unless absolutely necessary
   - Use Zod schemas for runtime validation
   - Export types derived from Zod: `type X = z.infer<typeof XSchema>`

### Tool Implementation Pattern

Every tool follows this consistent pattern:

```typescript
import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { cacheManager, createCacheKey } from '../../core/cache.js';
import { metricsCollector } from '../../core/metrics.js';

// 1. Define Zod schema for input validation
const MyToolSchema = z.object({
  param1: z.string().optional(),
  param2: z.number().int().positive().optional(),
  // ... more params
});

export type MyToolParams = z.infer<typeof MyToolSchema>;

// 2. Implement handler function
export async function myToolHandler(params: MyToolParams) {
  const startTime = Date.now();

  try {
    // Validate input
    const validated = MyToolSchema.parse(params);

    // Check cache
    const cacheKey = createCacheKey(validated);
    const cached = cacheManager.get<any>('category', cacheKey);
    if (cached) {
      return { ...cached, _metadata: { ...cached._metadata, cache: true } };
    }

    // Call API
    const response = await camaraAPI.get('/endpoint', validated);

    // Normalize data
    const normalized = DataNormalizer.normalize(response.dados);

    // Build result
    const result = {
      data: normalized,
      _metadata: {
        cache: false,
        latencyMs: Date.now() - startTime,
        apiVersion: 'v2'
      }
    };

    // Store in cache
    cacheManager.set('category', cacheKey, result);

    // Record metrics
    metricsCollector.incrementToolCall('my_tool');
    metricsCollector.recordLatency('my_tool', Date.now() - startTime);

    return result;
  } catch (error) {
    metricsCollector.incrementError('my_tool');
    throw error;
  }
}

// 3. Export tool definition
export const myToolDefinition = {
  name: 'my_tool',
  description: 'Clear, concise description for LLM',
  inputSchema: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'What this parameter does'
      },
      param2: {
        type: 'number',
        description: 'What this parameter does'
      }
    }
  },
  handler: myToolHandler
};
```

### Error Handling

1. **Custom Error Classes** (`src/core/errors.ts`):
   - `APIError`: External API errors
   - `ValidationError`: Input validation failures
   - `RateLimitError`: Rate limit exceeded
   - `CircuitBreakerError`: Circuit breaker open

2. **Error Propagation**:
   - Always increment error metrics
   - Log errors with context
   - Return structured error responses to MCP

3. **Retry Logic**:
   - Automatic retry for transient errors (network, 5xx)
   - Exponential backoff with jitter
   - Max retries configurable (default: 3)

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd AgenteCidadaoMCP

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Build project
npm run build
```

### Available Scripts

```bash
# Development
npm run dev              # Watch mode with tsx
npm run build            # Compile TypeScript
npm run build:unix       # Build + make executable
npm start                # Run compiled server

# Quality
npm run lint             # ESLint
npm run format           # Prettier
npm run type-check       # TypeScript without emit

# Testing
npm test                 # Run tests with Vitest
npm run test:coverage    # Test coverage report

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run with docker-compose
```

### Development Mode

```bash
# Start in watch mode
npm run dev

# In another terminal, test the MCP server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/server.js
```

### Testing MCP Server

The server communicates via JSON-RPC over stdio. To test:

```bash
# List available tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/server.js

# Call a tool
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"buscar_deputados","arguments":{"uf":"SP","pagina":1,"itens":5}}}' | node dist/server.js
```

### Integrating with Claude Desktop

1. Build the project: `npm run build`
2. Edit Claude Desktop config:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

3. Add server configuration:
```json
{
  "mcpServers": {
    "camara-br": {
      "command": "node",
      "args": ["/absolute/path/to/AgenteCidadaoMCP/dist/server.js"]
    }
  }
}
```

4. Restart Claude Desktop

### Git Workflow

**Current Branch**: `claude/claude-md-mhyo1s6r31zkic27-011LmGHETM4ChLKqHXwVeiZJ`

#### Branch Strategy
- Feature branches follow pattern: `claude/*`
- Always develop on feature branches
- Never push directly to main

#### Committing Changes

```bash
# Stage changes
git add <files>

# Commit with descriptive message
git commit -m "type: brief description

Detailed explanation of changes, reasoning, and any breaking changes"

# Push to remote
git push -u origin <branch-name>
```

**Commit Message Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build/tooling changes
- `perf`: Performance improvements

#### Creating Pull Requests

```bash
# Ensure branch is up to date
git fetch origin
git rebase origin/main

# Push changes
git push -u origin <branch-name>

# Create PR (manually on GitHub or via gh CLI)
```

## Configuration Management

### Environment Variables

All configuration is in `.env` (see `.env.example`):

```bash
# API
API_BASE_URL=https://dadosabertos.camara.leg.br/api/v2
OPENAPI_URL=https://dadosabertos.camara.leg.br/swagger/api.json

# Cache
CACHE_ENABLED=true
CACHE_TTL_SECONDS=600
CACHE_MAX_SIZE=1000

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_BURST=20

# Circuit Breaker
CIRCUIT_BREAKER_ENABLED=true
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_RESET_TIMEOUT_MS=60000

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Metrics
METRICS_ENABLED=true
METRICS_PORT=9090
METRICS_PATH=/metrics

# Performance
REQUEST_TIMEOUT_MS=30000
MAX_CONCURRENT_REQUESTS=10
QUEUE_MAX_SIZE=100

# Retry
MAX_RETRIES=3
RETRY_DELAY_MS=1000
RETRY_JITTER_MS=500

# Development
NODE_ENV=production
DEBUG=false
```

### Config Access

Configuration is centralized in `src/config.ts`:

```typescript
import { CONFIG } from './config.js';

// Access config
const baseUrl = CONFIG.api.baseUrl;
const cacheEnabled = CONFIG.cache.enabled;
```

## Adding New Functionality

### Adding a New Tool

1. **Create tool file** in appropriate directory:
   ```
   src/tools/<category>/<tool-name>.ts
   ```

2. **Implement tool** following the pattern:
   - Define Zod schema
   - Implement handler function
   - Export tool definition
   - Add to index.ts exports

3. **Update index.ts** in category:
   ```typescript
   import { myNewTool, myNewToolDefinition } from './my-new-tool.js';

   export { myNewTool, myNewToolDefinition };

   export const categoryTools = [
     // ... existing tools
     myNewToolDefinition
   ];
   ```

4. **Test the tool**:
   ```bash
   npm run build
   # Test with echo or Claude Desktop
   ```

### Adding a New Data Category

1. **Add cache strategy** in `src/core/cache.ts`:
   ```typescript
   const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
     // ... existing
     myCategory: { ttl: 3600, maxSize: 500 },
   };
   ```

2. **Add normalization** in `src/api/normalizers.ts`:
   ```typescript
   static normalizeMyCategory(data: any): MyCategory {
     // Normalization logic
   }
   ```

3. **Create tools directory**:
   ```
   src/tools/my-category/
   ```

4. **Import in mcp.ts**:
   ```typescript
   import { myCategoryTools } from './tools/my-category/index.js';

   const allTools = [
     ...existingTools,
     ...myCategoryTools
   ];
   ```

## Monitoring and Debugging

### Metrics Endpoints

When `METRICS_ENABLED=true` and server is running:

```bash
# Prometheus metrics (for Grafana, etc.)
curl http://localhost:9090/metrics

# JSON metrics (human-readable)
curl http://localhost:9090/metrics/json

# Health check
curl http://localhost:9090/health
```

### Log Levels

Control verbosity with `LOG_LEVEL`:
- `trace`: Very detailed (method entry/exit)
- `debug`: Debugging information
- `info`: General information (default)
- `warn`: Warning messages
- `error`: Error messages
- `fatal`: Fatal errors

### Pretty Logs for Development

```bash
LOG_FORMAT=pretty npm run dev
```

### Common Debugging Tasks

**Check if cache is working**:
```bash
# Look for cache: true in responses
LOG_LEVEL=debug npm run dev
```

**Check rate limiting**:
```bash
# Monitor rate limiter logs
RATE_LIMIT_ENABLED=true LOG_LEVEL=debug npm run dev
```

**Disable circuit breaker for testing**:
```bash
CIRCUIT_BREAKER_ENABLED=false npm run dev
```

## Docker Deployment

### Build and Run

```bash
# Build image
docker build -t mcp-camara-br .

# Run container
docker run -p 9090:9090 mcp-camara-br

# Or use docker-compose
docker-compose up -d
```

### Docker Architecture

- **Multi-stage build**: Separate builder and runtime stages
- **Alpine Linux**: Minimal image size
- **Tini**: Proper signal handling for graceful shutdown
- **Production dependencies only**: Smaller image
- **Exposed port**: 9090 for metrics

## Best Practices for AI Assistants

### When Modifying Code

1. **Always read before writing**: Use Read tool on files before Edit/Write
2. **Follow existing patterns**: Maintain consistency with existing code
3. **Update documentation**: If changing behavior, update relevant .md files
4. **Test changes**: Build and test before committing
5. **Use TypeScript**: Ensure type safety, no `any` types
6. **Validate inputs**: Always use Zod schemas for validation
7. **Add metrics**: Increment counters and record latencies
8. **Cache appropriately**: Use cache for expensive operations
9. **Log important events**: Use structured logging
10. **Handle errors gracefully**: Use custom error classes

### When Adding Features

1. **Check existing tools**: Don't duplicate functionality
2. **Follow MCP patterns**: Use standard tool definition format
3. **Add to appropriate category**: Deputados, Proposições, or new category
4. **Document the tool**: Clear description in inputSchema
5. **Add examples**: Update EXEMPLOS_PRATICOS.md
6. **Consider performance**: Will this need caching? Rate limiting?
7. **Test thoroughly**: Verify with different inputs
8. **Update README**: Add to tools list if public-facing

### When Fixing Bugs

1. **Reproduce first**: Understand the bug before fixing
2. **Check logs**: Look for error messages and context
3. **Add tests**: Prevent regression
4. **Update error handling**: Improve error messages if unclear
5. **Document root cause**: Add comments explaining the fix
6. **Verify metrics**: Ensure error counters are correct

### Common Pitfalls to Avoid

1. **Don't skip validation**: Always validate with Zod schemas
2. **Don't ignore errors**: Always handle and log errors
3. **Don't forget metrics**: Increment counters and record latencies
4. **Don't bypass cache**: Use cache for expensive operations
5. **Don't use .ts in imports**: Use `.js` for ES modules
6. **Don't commit .env**: Only commit .env.example
7. **Don't push to main**: Always use feature branches
8. **Don't skip types**: Maintain type safety

## API Reference

### External API

**Base URL**: https://dadosabertos.camara.leg.br/api/v2

**Documentation**: https://dadosabertos.camara.leg.br/swagger/api.html

**Rate Limits**: Not officially documented, but be respectful

**Authentication**: None required (public API)

### Available Tools

#### Deputados (Deputies)
- `buscar_deputados`: Search deputies by name, UF, party, etc.
- `detalhar_deputado`: Get detailed deputy information
- `despesas_deputado`: Get deputy expenses (parliamentary quota)
- `discursos_deputado`: Get deputy speeches
- `eventos_deputado`: Get events deputy participated in
- `orgaos_deputado`: Get organizations deputy is member of

#### Proposições (Propositions)
- `buscar_proposicoes`: Search legislative propositions (bills, amendments, etc.)
- `detalhar_proposicao`: Get detailed proposition information
- `autores_proposicao`: Get proposition authors

## Performance Considerations

### Optimization Strategies

1. **Tiered Caching**: Different TTLs based on data volatility
2. **Request Coalescing**: Prevent duplicate concurrent requests
3. **Lazy Loading**: Only load data when needed
4. **Pagination**: Use pagination for large result sets
5. **Normalization**: Remove redundant data from API responses

### Performance Metrics

Monitor these metrics for optimization:
- `tool_calls_total`: Tool usage patterns
- `tool_latency_ms`: Tool performance
- `api_errors_total`: API reliability
- `cache_hit_ratio`: Cache effectiveness

### Scaling Considerations

- **Horizontal**: Run multiple instances behind load balancer
- **Vertical**: Increase cache size and concurrent requests
- **External Cache**: Use Redis for distributed caching
- **API Quotas**: Implement user-level rate limiting if needed

## Security Considerations

### Input Validation
- All inputs validated with Zod schemas
- SQL injection not applicable (REST API)
- No user-controlled code execution

### Dependencies
- Regularly update dependencies: `npm audit`
- Use `npm ci` for reproducible builds
- Pin major versions in package.json

### Environment Variables
- Never commit `.env` file
- Use secrets management in production
- Validate all environment variables on startup

### API Access
- No authentication required (public API)
- Respect rate limits to avoid IP blocking
- Circuit breaker prevents abuse

## Troubleshooting

### Common Issues

**Issue**: `Cannot find module './core/logging.js'`
**Solution**: Imports must use `.js` extension even for `.ts` files (ES modules)

**Issue**: `Port 9090 already in use`
**Solution**: Change `METRICS_PORT` in `.env` or kill process using port

**Issue**: `Rate limit exceeded`
**Solution**: Adjust `RATE_LIMIT_PER_MINUTE` in `.env` or wait for token refresh

**Issue**: `Circuit breaker open`
**Solution**: External API is down, wait for `CIRCUIT_BREAKER_RESET_TIMEOUT_MS`

**Issue**: `Cache not working`
**Solution**: Verify `CACHE_ENABLED=true` in `.env`

### Getting Help

1. Check existing documentation in `/docs` folder
2. Review similar implementations in `src/tools/`
3. Check logs with `LOG_LEVEL=debug`
4. Review metrics at `http://localhost:9090/metrics/json`

## Conclusion

This repository follows strict conventions and patterns to ensure maintainability, performance, and reliability. When working on this codebase:

- **Follow the patterns**: Consistency is key
- **Test thoroughly**: Prevent regressions
- **Document changes**: Help future contributors
- **Monitor metrics**: Ensure performance
- **Handle errors**: Provide great user experience

The codebase is designed to be easy to extend while maintaining high quality standards. When in doubt, look at existing implementations and follow the same patterns.

---

**Last Updated**: 2025-11-14
**Version**: 1.0.0

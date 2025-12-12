# 📋 Especificação Completa: Servidor MCP "camara-br"

## 🎯 Objetivo

Criar um **servidor MCP** (Model Context Protocol) completo chamado **`mcp-camara-br`** que mapeia **TODOS os endpoints** da API da Câmara dos Deputados do Brasil, expondo **tools** tipadas, validadas e otimizadas para consultas via LLM sobre deputados, proposições, votações, eventos, órgãos, despesas e todo o ecossistema legislativo.

## 🚀 Visão Geral

- **Nome**: `mcp-camara-br`
- **Versão**: 1.0.0
- **API Base**: https://dadosabertos.camara.leg.br/api/v2
- **OpenAPI**: https://dadosabertos.camara.leg.br/swagger/api.json
- **Linguagem**: TypeScript + Node.js
- **Protocol**: Model Context Protocol (MCP)

## 📦 Stack Técnica

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "openapi-client-axios": "^7.5.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "lru-cache": "^10.0.0",
    "pino": "^8.16.0",
    "dotenv": "^16.3.0",
    "p-retry": "^6.0.0",
    "p-queue": "^7.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.2.0",
    "vitest": "^1.0.0",
    "nock": "^13.4.0",
    "eslint": "^8.52.0",
    "prettier": "^3.0.0"
  }
}
```

## 🏗️ Estrutura do Projeto

```
mcp-camara-br/
├── src/
│   ├── server.ts                 # Entry point do servidor MCP
│   ├── mcp.ts                    # Bootstrap e registro de tools
│   ├── api/
│   │   ├── client.ts             # OpenAPI client configurado
│   │   ├── normalizers.ts        # Normalizadores de dados
│   │   └── validators.ts         # Validadores customizados
│   ├── tools/
│   │   ├── deputados/            # Tools de deputados
│   │   │   ├── buscar.ts
│   │   │   ├── detalhar.ts
│   │   │   ├── despesas.ts
│   │   │   ├── discursos.ts
│   │   │   ├── eventos.ts
│   │   │   ├── frentes.ts
│   │   │   ├── ocupacoes.ts
│   │   │   └── orgaos.ts
│   │   ├── proposicoes/          # Tools de proposições
│   │   │   ├── buscar.ts
│   │   │   ├── detalhar.ts
│   │   │   ├── autores.ts
│   │   │   ├── tramitacoes.ts
│   │   │   ├── votacoes.ts
│   │   │   └── relacionadas.ts
│   │   ├── votacoes/             # Tools de votações
│   │   │   ├── buscar.ts
│   │   │   ├── detalhar.ts
│   │   │   ├── votos.ts
│   │   │   └── orientacoes.ts
│   │   ├── eventos/              # Tools de eventos
│   │   │   ├── buscar.ts
│   │   │   ├── detalhar.ts
│   │   │   ├── deputados.ts
│   │   │   ├── pauta.ts
│   │   │   └── votacoes.ts
│   │   ├── orgaos/               # Tools de órgãos
│   │   │   ├── buscar.ts
│   │   │   ├── detalhar.ts
│   │   │   ├── membros.ts
│   │   │   ├── eventos.ts
│   │   │   └── votacoes.ts
│   │   ├── frentes/              # Tools de frentes
│   │   │   ├── buscar.ts
│   │   │   ├── detalhar.ts
│   │   │   └── membros.ts
│   │   ├── blocos/               # Tools de blocos
│   │   │   ├── buscar.ts
│   │   │   └── detalhar.ts
│   │   ├── partidos/             # Tools de partidos
│   │   │   ├── buscar.ts
│   │   │   ├── detalhar.ts
│   │   │   ├── membros.ts
│   │   │   └── lideres.ts
│   │   ├── legislaturas/         # Tools de legislaturas
│   │   │   ├── buscar.ts
│   │   │   ├── detalhar.ts
│   │   │   └── mesa.ts
│   │   └── referencias/          # Tools de referências
│   │       ├── situacoes.ts
│   │       ├── temas.ts
│   │       ├── tipos.ts
│   │       └── ufs.ts
│   ├── core/
│   │   ├── cache.ts              # Sistema de cache em camadas
│   │   ├── errors.ts             # Tratamento de erros
│   │   ├── logging.ts            # Sistema de logs
│   │   ├── metrics.ts            # Métricas e observabilidade
│   │   ├── rate-limiter.ts       # Rate limiting
│   │   ├── circuit-breaker.ts   # Circuit breaker
│   │   ├── queue.ts              # Fila de requisições
│   │   └── schemas.ts            # Schemas Zod compartilhados
│   ├── utils/
│   │   ├── date.ts               # Utilitários de data
│   │   ├── currency.ts           # Formatação monetária
│   │   ├── sanitizers.ts         # Sanitização de inputs
│   │   └── aggregators.ts        # Agregações de dados
│   └── config.ts                 # Configurações centralizadas
├── tests/
│   ├── unit/                     # Testes unitários
│   ├── integration/              # Testes de integração
│   └── fixtures/                 # Fixtures e mocks
├── docs/
│   ├── TOOLS.md                  # Documentação das tools
│   ├── EXAMPLES.md               # Exemplos de uso
│   └── API_MAPPING.md            # Mapeamento API → Tools
├── scripts/
│   ├── generate-types.ts         # Gera tipos do OpenAPI
│   └── update-cache.ts           # Atualiza cache de referências
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── LICENSE
```

## 🔧 Mapeamento Completo de Tools MCP

### 1. **Categoria: Deputados** 

#### 1.1 `buscar_deputados`
```typescript
interface BuscarDeputadosParams {
  nome?: string;              // min 3 chars
  uf?: UF;                    // enum de UFs
  partido?: string;           // sigla do partido
  sexo?: 'M' | 'F';
  idLegislatura?: number;     // 1-57
  dataInicio?: string;        // YYYY-MM-DD
  dataFim?: string;           // YYYY-MM-DD
  pagina?: number;            // >= 1
  itens?: number;             // 1-100
  ordem?: 'ASC' | 'DESC';
  ordenarPor?: 'id' | 'idLegislatura' | 'nome';
}
```

#### 1.2 `detalhar_deputado`
```typescript
interface DetalharDeputadoParams {
  id: number;                 // ID do deputado
}
```

#### 1.3 `despesas_deputado`
```typescript
interface DespesasDeputadoParams {
  id: number;
  ano?: number;               // 2008-atual
  mes?: number;               // 1-12
  tipoDespesa?: TipoDespesa;  // enum
  fornecedor?: string;
  pagina?: number;
  itens?: number;
  ordem?: 'ASC' | 'DESC';
  ordenarPor?: 'ano' | 'mes' | 'valor';
}
```

#### 1.4 `discursos_deputado`
```typescript
interface DiscursosDeputadoParams {
  id: number;
  dataInicio?: string;
  dataFim?: string;
  keywords?: string;
  tipoDiscurso?: TipoDiscurso;
  pagina?: number;
  itens?: number;
}
```

#### 1.5 `eventos_deputado`
```typescript
interface EventosDeputadoParams {
  id: number;
  dataInicio?: string;
  dataFim?: string;
  tipoEvento?: TipoEvento;
  pagina?: number;
  itens?: number;
}
```

#### 1.6 `frentes_deputado`
```typescript
interface FrentesDeputadoParams {
  id: number;
}
```

#### 1.7 `ocupacoes_deputado`
```typescript
interface OcupacoesDeputadoParams {
  id: number;
}
```

#### 1.8 `orgaos_deputado`
```typescript
interface OrgaosDeputadoParams {
  id: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  itens?: number;
}
```

#### 1.9 `profissoes_deputado`
```typescript
interface ProfissoesDeputadoParams {
  id: number;
}
```

### 2. **Categoria: Proposições**

#### 2.1 `buscar_proposicoes`
```typescript
interface BuscarProposicoesParams {
  siglaTipo?: string;         // PL, PEC, MPV, etc
  numero?: number;
  ano?: number;
  idAutor?: number;
  nomeAutor?: string;
  siglaPartidoAutor?: string;
  siglaUfAutor?: UF;
  keywords?: string;
  dataInicio?: string;
  dataFim?: string;
  dataInicioApresentacao?: string;
  dataFimApresentacao?: string;
  idSituacao?: number;
  siglaSituacao?: string;
  codTema?: number;
  tramitacaoSenado?: boolean;
  pagina?: number;
  itens?: number;
  ordem?: 'ASC' | 'DESC';
  ordenarPor?: 'id' | 'ano' | 'dataApresentacao';
}
```

#### 2.2 `detalhar_proposicao`
```typescript
interface DetalharProposicaoParams {
  id: number;
}
```

#### 2.3 `autores_proposicao`
```typescript
interface AutoresProposicaoParams {
  id: number;
}
```

#### 2.4 `tramitacoes_proposicao`
```typescript
interface TramitacoesProposicaoParams {
  id: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  itens?: number;
}
```

#### 2.5 `votacoes_proposicao`
```typescript
interface VotacoesProposicaoParams {
  id: number;
  ordem?: 'ASC' | 'DESC';
  ordenarPor?: 'dataHoraRegistro';
}
```

#### 2.6 `relacionadas_proposicao`
```typescript
interface RelacionadasProposicaoParams {
  id: number;
}
```

#### 2.7 `temas_proposicao`
```typescript
interface TemasProposicaoParams {
  id: number;
}
```

### 3. **Categoria: Votações**

#### 3.1 `buscar_votacoes`
```typescript
interface BuscarVotacoesParams {
  idProposicao?: number;
  idEvento?: number;
  idOrgao?: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  itens?: number;
  ordem?: 'ASC' | 'DESC';
  ordenarPor?: 'dataHoraRegistro' | 'id';
}
```

#### 3.2 `detalhar_votacao`
```typescript
interface DetalharVotacaoParams {
  id: string;                 // ID da votação
}
```

#### 3.3 `votos_votacao`
```typescript
interface VotosVotacaoParams {
  id: string;
}
```

#### 3.4 `orientacoes_votacao`
```typescript
interface OrientacoesVotacaoParams {
  id: string;
}
```

#### 3.5 `ultimas_votacoes`
```typescript
interface UltimasVotacoesParams {
  ordem?: 'ASC' | 'DESC';
}
```

### 4. **Categoria: Eventos**

#### 4.1 `buscar_eventos`
```typescript
interface BuscarEventosParams {
  idTipoEvento?: number;
  idSituacao?: number;
  idOrgao?: number;
  dataInicio?: string;
  dataFim?: string;
  horaInicio?: string;        // HH:MM
  horaFim?: string;           // HH:MM
  pagina?: number;
  itens?: number;
  ordem?: 'ASC' | 'DESC';
  ordenarPor?: 'dataHoraInicio' | 'id';
}
```

#### 4.2 `detalhar_evento`
```typescript
interface DetalharEventoParams {
  id: number;
}
```

#### 4.3 `deputados_evento`
```typescript
interface DeputadosEventoParams {
  id: number;
}
```

#### 4.4 `pauta_evento`
```typescript
interface PautaEventoParams {
  id: number;
}
```

#### 4.5 `votacoes_evento`
```typescript
interface VotacoesEventoParams {
  id: number;
}
```

#### 4.6 `orgaos_evento`
```typescript
interface OrgaosEventoParams {
  id: number;
}
```

### 5. **Categoria: Órgãos**

#### 5.1 `buscar_orgaos`
```typescript
interface BuscarOrgaosParams {
  sigla?: string;
  nome?: string;
  idTipoOrgao?: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  itens?: number;
  ordem?: 'ASC' | 'DESC';
  ordenarPor?: 'id' | 'sigla' | 'nome';
}
```

#### 5.2 `detalhar_orgao`
```typescript
interface DetalharOrgaoParams {
  id: number;
}
```

#### 5.3 `membros_orgao`
```typescript
interface MembrosOrgaoParams {
  id: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  itens?: number;
}
```

#### 5.4 `eventos_orgao`
```typescript
interface EventosOrgaoParams {
  id: number;
  idTipoEvento?: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  itens?: number;
}
```

#### 5.5 `votacoes_orgao`
```typescript
interface VotacoesOrgaoParams {
  id: number;
  idProposicao?: number;
  dataInicio?: string;
  dataFim?: string;
  pagina?: number;
  itens?: number;
}
```

### 6. **Categoria: Frentes Parlamentares**

#### 6.1 `buscar_frentes`
```typescript
interface BuscarFrentesParams {
  idLegislatura?: number;
  pagina?: number;
  itens?: number;
}
```

#### 6.2 `detalhar_frente`
```typescript
interface DetalharFrenteParams {
  id: number;
}
```

#### 6.3 `membros_frente`
```typescript
interface MembrosFrenteParams {
  id: number;
}
```

### 7. **Categoria: Blocos Parlamentares**

#### 7.1 `buscar_blocos`
```typescript
interface BuscarBlocosParams {
  idLegislatura?: number;
  pagina?: number;
  itens?: number;
}
```

#### 7.2 `detalhar_bloco`
```typescript
interface DetalharBlocoParams {
  id: number;
}
```

### 8. **Categoria: Partidos**

#### 8.1 `buscar_partidos`
```typescript
interface BuscarPartidosParams {
  sigla?: string;
  dataInicio?: string;
  dataFim?: string;
  idLegislatura?: number;
  pagina?: number;
  itens?: number;
  ordem?: 'ASC' | 'DESC';
  ordenarPor?: 'id' | 'sigla' | 'nome';
}
```

#### 8.2 `detalhar_partido`
```typescript
interface DetalharPartidoParams {
  id: number;
}
```

#### 8.3 `membros_partido`
```typescript
interface MembrosPartidoParams {
  id: number;
  dataInicio?: string;
  dataFim?: string;
  idLegislatura?: number;
  pagina?: number;
  itens?: number;
}
```

#### 8.4 `lideres_partido`
```typescript
interface LideresPartidoParams {
  id: number;
}
```

### 9. **Categoria: Legislaturas**

#### 9.1 `buscar_legislaturas`
```typescript
interface BuscarLegislaturasParams {
  data?: string;              // Busca por data
  pagina?: number;
  itens?: number;
  ordem?: 'ASC' | 'DESC';
  ordenarPor?: 'id';
}
```

#### 9.2 `detalhar_legislatura`
```typescript
interface DetalharLegislaturaParams {
  id: number;
}
```

#### 9.3 `mesa_legislatura`
```typescript
interface MesaLegislaturaParams {
  idLegislatura: number;
  dataInicio?: string;
  dataFim?: string;
}
```

### 10. **Categoria: Referências**

#### 10.1 `situacoes_proposicao`
```typescript
interface SituacoesProposicaoParams {}
```

#### 10.2 `temas_proposicao`
```typescript
interface TemasProposicaoParams {}
```

#### 10.3 `tipos_proposicao`
```typescript
interface TiposProposicaoParams {}
```

#### 10.4 `tipos_orgao`
```typescript
interface TiposOrgaoParams {}
```

#### 10.5 `tipos_evento`
```typescript
interface TiposEventoParams {}
```

#### 10.6 `ufs`
```typescript
interface UFsParams {}
```

### 11. **Categoria: Análises e Agregações** (Compostas)

#### 11.1 `analise_presenca_deputado`
```typescript
interface AnalisePresencaParams {
  idDeputado: number;
  dataInicio?: string;
  dataFim?: string;
}
```

#### 11.2 `ranking_proposicoes_autor`
```typescript
interface RankingProposicoesParams {
  idDeputado?: number;
  ano?: number;
  tipoRanking: 'quantidade' | 'aprovadas' | 'tramitacao';
}
```

#### 11.3 `analise_despesas_partido`
```typescript
interface AnaliseDespesasPartidoParams {
  siglaPartido: string;
  ano: number;
  mes?: number;
  tipoAgregacao: 'total' | 'media' | 'categoria';
}
```

#### 11.4 `comparativo_votacoes_bancadas`
```typescript
interface ComparativoVotacoesParams {
  idVotacao: string;
  incluirOrientacoes?: boolean;
  incluirAusentes?: boolean;
}
```

#### 11.5 `timeline_tramitacao`
```typescript
interface TimelineTramitacaoParams {
  idProposicao: number;
  formato: 'resumido' | 'completo';
}
```

#### 11.6 `exportar_dados`
```typescript
interface ExportarDadosParams {
  tool: string;
  params: any;
  formato: 'json' | 'csv' | 'markdown';
  incluirMetadados?: boolean;
}
```

## 🛡️ Sistema de Validação e Segurança

### Schemas Zod Compartilhados

```typescript
// src/core/schemas.ts

// Enums validados
export const UFEnum = z.enum([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]);

export const TipoProposicaoEnum = z.enum([
  'PL', 'PLP', 'PLC', 'PLN', 'PLS', 'PEC', 'PFC', 'PRC',
  'PDC', 'PDL', 'PDN', 'PDS', 'REC', 'REP', 'REQ', 'RIC',
  'RCP', 'MSC', 'INC', 'IND', 'PET', 'RDF', 'REC', 'MPV'
]);

// Validadores de data
export const DateSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Data deve estar no formato YYYY-MM-DD'
);

export const DateRangeSchema = z.object({
  dataInicio: DateSchema,
  dataFim: DateSchema
}).refine(
  data => new Date(data.dataInicio) <= new Date(data.dataFim),
  'dataInicio deve ser anterior ou igual a dataFim'
);

// Paginação
export const PaginationSchema = z.object({
  pagina: z.number().int().positive().default(1),
  itens: z.number().int().min(1).max(100).default(25)
});

// Sanitização de texto
export const SafeTextSchema = z.string()
  .min(2)
  .max(100)
  .transform(text => text
    .replace(/[^\w\s\u00C0-\u00FF-]/g, '') // Remove caracteres especiais
    .trim()
  );

// Validador de CPF/CNPJ
export const DocumentSchema = z.string().refine(
  val => validateCPF(val) || validateCNPJ(val),
  'Documento inválido'
);
```

## 🚦 Sistema de Cache em Camadas

```typescript
// src/core/cache.ts

interface CacheStrategy {
  deputados: { ttl: 3600, maxSize: 1000 },       // 1h
  proposicoes: { ttl: 1800, maxSize: 500 },      // 30min
  votacoes: { ttl: 300, maxSize: 200 },          // 5min
  eventos: { ttl: 600, maxSize: 300 },           // 10min
  orgaos: { ttl: 7200, maxSize: 100 },           // 2h
  frentes: { ttl: 86400, maxSize: 50 },          // 24h
  partidos: { ttl: 3600, maxSize: 50 },          // 1h
  referencias: { ttl: 604800, maxSize: 100 },    // 7 dias
  despesas: { ttl: 86400, maxSize: 500 }         // 24h
}
```

## 🔄 Rate Limiting e Circuit Breaker

```typescript
// src/core/rate-limiter.ts

interface RateLimiterConfig {
  maxRequestsPerMinute: 100,
  maxBurst: 20,
  backoffStrategy: 'exponential',
  retryDelays: [1000, 2000, 4000, 8000],
  jitterMs: 500
}

// src/core/circuit-breaker.ts

interface CircuitBreakerConfig {
  failureThreshold: 5,
  resetTimeout: 60000,      // 1 minuto
  halfOpenRequests: 3,
  monitoringPeriod: 120000  // 2 minutos
}
```

## 📊 Sistema de Métricas e Observabilidade

```typescript
// src/core/metrics.ts

interface MetricsCollector {
  // Contadores
  toolCallCount: Map<string, number>,
  httpRequestCount: Map<string, number>,
  errorCount: Map<string, number>,
  
  // Histogramas
  latencyHistogram: Map<string, number[]>,
  responseSizeHistogram: Map<string, number[]>,
  
  // Gauges
  cacheHitRate: number,
  activeConnections: number,
  queueSize: number,
  
  // Agregações
  avgLatencyByTool: Map<string, number>,
  p95LatencyByTool: Map<string, number>,
  errorRateByEndpoint: Map<string, number>
}
```

## 🔧 Configurações via .env

```bash
# API Configuration
API_BASE_URL=https://dadosabertos.camara.leg.br/api/v2
OPENAPI_URL=https://dadosabertos.camara.leg.br/swagger/api.json

# Cache Configuration
CACHE_ENABLED=true
CACHE_TTL_SECONDS=600
CACHE_MAX_SIZE=1000
CACHE_STRATEGY=tiered  # simple | tiered | redis
REDIS_URL=redis://localhost:6379  # Se usar Redis

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_BURST=20
RATE_LIMIT_BACKOFF=exponential  # linear | exponential

# Circuit Breaker
CIRCUIT_BREAKER_ENABLED=true
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_RESET_TIMEOUT_MS=60000

# Logging
LOG_LEVEL=info  # debug | info | warn | error
LOG_FORMAT=json  # json | pretty
LOG_FILE_PATH=/var/log/mcp-camara-br.log

# Metrics & Monitoring
METRICS_ENABLED=true
METRICS_PORT=9090
METRICS_PATH=/metrics

# Performance
REQUEST_TIMEOUT_MS=30000
MAX_CONCURRENT_REQUESTS=10
QUEUE_MAX_SIZE=100

# Retry Policy
MAX_RETRIES=3
RETRY_DELAY_MS=1000
RETRY_JITTER_MS=500

# Development
NODE_ENV=production  # development | production
DEBUG=false
```

## 📝 Normalização de Dados

```typescript
// src/api/normalizers.ts

export class DataNormalizer {
  // Normalização de campos
  static normalizeDeputado(raw: any) {
    return {
      id: raw.id,
      nome: raw.ultimoStatus?.nome || raw.nome,
      nomeCompleto: raw.nomeCivil,
      partido: raw.ultimoStatus?.siglaPartido || raw.siglaPartido,
      uf: raw.ultimoStatus?.siglaUf || raw.siglaUf,
      email: raw.ultimoStatus?.email,
      telefone: raw.ultimoStatus?.gabinete?.telefone,
      foto: raw.ultimoStatus?.urlFoto,
      situacao: raw.ultimoStatus?.situacao,
      condicaoEleitoral: raw.ultimoStatus?.condicaoEleitoral,
      gabinete: {
        numero: raw.ultimoStatus?.gabinete?.sala,
        predio: raw.ultimoStatus?.gabinete?.predio,
        andar: raw.ultimoStatus?.gabinete?.andar
      },
      source: raw.uri,
      fetchedAt: new Date().toISOString(),
      _metadata: {
        version: 'v2',
        normalized: true
      }
    };
  }

  // Formatação monetária
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Normalização de datas
  static normalizeDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  // Mapeamento de siglas antigas
  static normalizePartido(sigla: string): string {
    const map: Record<string, string> = {
      'DEM': 'UNIÃO',
      'PSL': 'UNIÃO',
      'PODE': 'PODEMOS',
      'PR': 'PL',
      'PRB': 'REPUBLICANOS'
    };
    return map[sigla] || sigla;
  }
}
```

## 🧪 Testes

### Estrutura de Testes

```typescript
// tests/integration/flow.test.ts

describe('Fluxo Completo: Deputado → Proposições → Votações', () => {
  it('deve buscar deputado, suas proposições e votações', async () => {
    // 1. Buscar deputado
    const deps = await tools.buscarDeputados({
      nome: 'Silva',
      uf: 'SP',
      pagina: 1,
      itens: 1
    });
    
    expect(deps.deputados).toHaveLength(1);
    const deputado = deps.deputados[0];
    
    // 2. Buscar proposições do deputado
    const props = await tools.buscarProposicoes({
      idAutor: deputado.id,
      pagina: 1,
      itens: 5
    });
    
    expect(props.proposicoes).toBeDefined();
    
    // 3. Buscar votações de uma proposição
    if (props.proposicoes.length > 0) {
      const votacoes = await tools.votacoesProposicao({
        id: props.proposicoes[0].id
      });
      
      expect(votacoes).toBeDefined();
      
      // 4. Buscar orientações de bancada
      if (votacoes.length > 0) {
        const orientacoes = await tools.orientacoesVotacao({
          id: votacoes[0].id
        });
        
        expect(orientacoes).toBeDefined();
      }
    }
  });
});
```

## 🐳 Docker Support

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache tini
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY .env.example .env

EXPOSE 9090
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  mcp-camara-br:
    build: .
    ports:
      - "9090:9090"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    volumes:
      - ./logs:/var/log
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9090/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

## 📚 Documentação de Uso

### Exemplo de Chamada via MCP

```json
{
  "tool": "buscar_deputados",
  "arguments": {
    "uf": "SP",
    "partido": "PT",
    "pagina": 1,
    "itens": 10
  }
}
```

### Resposta Normalizada

```json
{
  "paginacao": {
    "pagina": 1,
    "itens": 10,
    "total": 45,
    "totalPaginas": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "deputados": [
    {
      "id": 204554,
      "nome": "Fulano de Tal",
      "nomeCompleto": "Fulano Silva de Tal",
      "partido": "PT",
      "uf": "SP",
      "email": "dep.fulano@camara.leg.br",
      "telefone": "(61) 3215-1234",
      "foto": "https://www.camara.leg.br/internet/deputado/bandep/204554.jpg",
      "situacao": "Exercício",
      "gabinete": {
        "numero": "234",
        "predio": "4",
        "andar": "2º"
      },
      "source": "https://dadosabertos.camara.leg.br/api/v2/deputados/204554",
      "fetchedAt": "2025-01-20T14:30:00Z"
    }
  ],
  "_metadata": {
    "cache": false,
    "latencyMs": 145,
    "apiVersion": "v2"
  }
}
```

## 🚀 Scripts NPM

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write 'src/**/*.ts'",
    "type-check": "tsc --noEmit",
    "generate:types": "tsx scripts/generate-types.ts",
    "update:cache": "tsx scripts/update-cache.ts",
    "docker:build": "docker build -t mcp-camara-br .",
    "docker:run": "docker-compose up"
  }
}
```

## ✅ Critérios de Aceitação

- ✅ **Cobertura Completa**: TODOS os endpoints da API mapeados
- ✅ **Validação Rigorosa**: Inputs validados com Zod
- ✅ **Normalização Consistente**: Dados padronizados em camelCase
- ✅ **Cache Inteligente**: TTL diferenciado por tipo de dado
- ✅ **Rate Limiting**: Proteção contra sobrecarga
- ✅ **Circuit Breaker**: Resiliência a falhas
- ✅ **Métricas**: Observabilidade completa
- ✅ **Paginação**: Suporte completo com metadados
- ✅ **Agregações**: Tools compostas para análises
- ✅ **Testes**: Cobertura > 80%
- ✅ **Docker**: Pronto para deploy
- ✅ **Documentação**: Completa e com exemplos

## 🏆 Diferenciais

1. **100% dos endpoints mapeados** - Cobertura total da API
2. **Cache em camadas** - Otimização por tipo de dado
3. **Agregações inteligentes** - Análises prontas para uso
4. **Observabilidade completa** - Métricas Prometheus-ready
5. **Resiliência** - Circuit breaker + retry + queue
6. **Export multi-formato** - JSON, CSV, Markdown
7. **Docker-ready** - Deploy em minutos
8. **Type-safe** - 100% TypeScript com validação

## 📞 Contato e Suporte

- **Repositório**: github.com/gvc2000/AgenteCidadaoMCP
- **Issues**: github.com/gvc2000/AgenteCidadaoMCP/issues
- **Docs**: mcp-camara-br.readthedocs.io
- **API Original**: dadosabertos.camara.leg.br

---

*Este servidor MCP oferece acesso completo e otimizado aos dados abertos da Câmara dos Deputados do Brasil, permitindo que LLMs acessem informações legislativas de forma estruturada, validada e eficiente.*

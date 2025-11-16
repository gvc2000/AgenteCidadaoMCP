# 🏛️ MCP Câmara BR

Servidor MCP (Model Context Protocol) completo para a API de Dados Abertos da Câmara dos Deputados do Brasil.

## Visão Geral

O **mcp-camara-br** é um servidor MCP que expõe todas as funcionalidades da API de Dados Abertos da Câmara dos Deputados através de tools tipadas, validadas e otimizadas para uso com Large Language Models (LLMs).

### Características

- ✅ **Cobertura Completa** - Mapeia os principais endpoints da API da Câmara
- ✅ **Validação Rigorosa** - Inputs validados com Zod
- ✅ **Cache Inteligente** - Sistema de cache em camadas com TTL diferenciado
- ✅ **Rate Limiting** - Proteção contra sobrecarga da API
- ✅ **Circuit Breaker** - Resiliência a falhas
- ✅ **Métricas** - Observabilidade completa (Prometheus-ready)
- ✅ **Type-Safe** - 100% TypeScript
- ✅ **Docker Ready** - Containerizado e pronto para deploy

## 🚀 Início Rápido (5 minutos)

### 1. Instalar dependências

```bash
npm install
```

### 2. Compilar

```bash
npm run build
```

### 3. Configurar no Claude Desktop

Edite o arquivo de configuração:

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

Adicione a configuração:

**macOS/Linux:**
```json
{
  "mcpServers": {
    "camara-br": {
      "command": "node",
      "args": ["/caminho/completo/para/AgenteCidadaoMCP/dist/server.js"]
    }
  }
}
```

**Windows (use barras duplas `\\`):**
```json
{
  "mcpServers": {
    "camara-br": {
      "command": "node",
      "args": ["C:\\Users\\SeuUsuario\\AgenteCidadaoMCP\\dist\\server.js"]
    }
  }
}
```

> **⚠️ Importante para Windows:** Use **barras duplas (`\\`)** nos caminhos. Veja o [Guia Windows](./GUIA_INSTALACAO_WINDOWS.md) para mais detalhes.

### 4. Reiniciar Claude Desktop

Feche e abra o Claude Desktop novamente.

## Requisitos

- Node.js >= 20.0.0
- npm ou yarn

## 📖 Guias de Instalação Detalhados

Escolha o guia apropriado para seu sistema operacional:

- **Windows 11/10**: Veja o [Guia de Instalação para Windows](./GUIA_INSTALACAO_WINDOWS.md)
- **macOS/Linux**: Continue com as instruções abaixo ou veja o [Guia de Instalação Completo](./GUIA_INSTALACAO_USO.md)
- **Início Rápido**: Para desenvolvedores experientes, veja [Início Rápido](./INICIO_RAPIDO.md)

## Instalação Completa

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/mcp-camara-br.git
cd mcp-camara-br

# Instalar dependências
npm install

# Copiar arquivo de configuração
cp .env.example .env

# Build
npm run build

# Executar
npm start
```

## Uso com Docker

```bash
# Build da imagem
docker-compose build

# Executar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

## Uso via HTTP (API REST)

O servidor também pode ser executado em modo HTTP, expondo uma API REST:

```bash
# Executar servidor HTTP
npm run start:http

# Ou em desenvolvimento com hot-reload
npm run dev:http
```

### Endpoints HTTP

- `GET /` - Informações da API
- `GET /api/tools` - Lista todas as ferramentas disponíveis
- `POST /api/tools/:toolName` - Executa uma ferramenta
- `GET /health` - Health check
- `GET /metrics` - Métricas Prometheus
- `GET /metrics/json` - Métricas em JSON

### Exemplo de Uso HTTP

```bash
# Buscar deputados
curl -X POST http://localhost:9090/api/tools/buscar_deputados \
  -H "Content-Type: application/json" \
  -d '{"uf":"SP","pagina":1,"itens":10}'
```

## Configuração

Edite o arquivo `.env` para personalizar as configurações:

```bash
# API Configuration
API_BASE_URL=https://dadosabertos.camara.leg.br/api/v2

# Cache
CACHE_ENABLED=true
CACHE_TTL_SECONDS=600

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=100

# Metrics
METRICS_ENABLED=true
METRICS_PORT=9090
```

## 🛠️ Tools Disponíveis

### Deputados

- `buscar_deputados` - Busca deputados por nome, UF, partido, etc.
- `detalhar_deputado` - Informações detalhadas de um deputado
- `despesas_deputado` - Despesas da cota parlamentar
- `discursos_deputado` - Discursos proferidos
- `eventos_deputado` - Eventos que participou
- `frentes_deputado` - Frentes parlamentares das quais é membro
- `orgaos_deputado` - Órgãos dos quais é membro

### Proposições

- `buscar_proposicoes` - Busca proposições legislativas (PLs, PECs, MPs, etc.)
- `detalhar_proposicao` - Informações detalhadas de uma proposição
- `autores_proposicao` - Lista os autores de uma proposição

## 💬 Exemplos de Uso

### Buscar Deputados de SP do PT

```
Liste deputados do estado de São Paulo no partido PT
```

Ou via JSON:

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

### Buscar Proposições sobre Educação

```
Busque projetos de lei sobre educação apresentados em 2024
```

Ou via JSON:

```json
{
  "tool": "buscar_proposicoes",
  "arguments": {
    "keywords": "educação",
    "ano": 2024,
    "pagina": 1,
    "itens": 20
  }
}
```

### Frentes Parlamentares de um Deputado

```
Quais frentes parlamentares o deputado Guilherme Boulos participa?
```

### Análise Completa de um Deputado

```
Me conte sobre a deputada Tabata Amaral:
- Suas frentes parlamentares
- Despesas de janeiro de 2024
- Discursos recentes sobre educação
```

### Despesas de um Deputado

```
Mostre as despesas do deputado Guilherme Boulos em janeiro de 2024
```

Ou via JSON (usando ID):

```json
{
  "tool": "despesas_deputado",
  "arguments": {
    "id": 220000,
    "ano": 2024,
    "mes": 1
  }
}
```

## Monitoramento

### Métricas

O servidor expõe métricas no formato Prometheus:

```bash
# Métricas Prometheus
curl http://localhost:9090/metrics

# Métricas JSON
curl http://localhost:9090/metrics/json

# Health check
curl http://localhost:9090/health
```

### Logs

Os logs são estruturados em JSON (padrão) ou formato pretty para desenvolvimento:

```bash
# Ativar logs pretty
LOG_FORMAT=pretty npm start
```

## 📁 Estrutura do Projeto

```
AgenteCidadaoMCP/
├── src/                          # Código-fonte do MCP Server
│   ├── server.ts                 # Entry point
│   ├── mcp.ts                    # MCP server setup
│   ├── config.ts                 # Configurações
│   │
│   ├── api/                      # Cliente HTTP e comunicação
│   │   ├── client.ts             # Cliente HTTP com retry
│   │   └── normalizers.ts        # Normalização de dados
│   │
│   ├── core/                     # Sistemas core
│   │   ├── cache.ts              # Sistema de cache LRU
│   │   ├── errors.ts             # Classes de erro customizadas
│   │   ├── logging.ts            # Logs estruturados (Pino)
│   │   ├── metrics.ts            # Métricas Prometheus
│   │   ├── rate-limiter.ts       # Rate limiting (token bucket)
│   │   ├── circuit-breaker.ts    # Circuit breaker pattern
│   │   ├── queue.ts              # Fila de requisições
│   │   └── schemas.ts            # Schemas Zod compartilhados
│   │
│   ├── tools/                    # MCP Tools organizados por categoria
│   │   ├── deputados/            # 10 tools sobre deputados
│   │   ├── proposicoes/          # 8 tools sobre proposições
│   │   ├── votacoes/             # 5 tools sobre votações
│   │   ├── orgaos/               # 6 tools sobre órgãos
│   │   ├── eventos/              # 7 tools sobre eventos
│   │   ├── partidos/             # 5 tools sobre partidos
│   │   ├── legislaturas/         # 4 tools sobre legislaturas
│   │   ├── frentes/              # 4 tools sobre frentes
│   │   ├── blocos/               # 3 tools sobre blocos
│   │   ├── referencias/          # 6 tools de referência
│   │   └── analises/             # 7 tools de análise e export
│   │
│   └── utils/                    # Utilitários
│       ├── aggregators.ts        # Agregação de dados
│       ├── currency.ts           # Formatação de moeda
│       ├── date.ts               # Utilitários de data
│       └── sanitizers.ts         # Sanitização de inputs
│
├── frontend/                     # Interface Web
│   ├── current/                  # Versão atual (v4)
│   │   ├── index.html           # Interface principal
│   │   ├── admin-agente-cidadao.html
│   │   ├── demo-agente-cidadao.html
│   │   └── login-agente-cidadao.html
│   ├── archive/                  # Versões anteriores
│   └── README.md                 # Documentação do frontend
│
├── docs/                         # Documentação organizada
│   ├── guides/                   # Guias de instalação e uso
│   │   ├── GUIA_INSTALACAO_USO.md
│   │   └── INICIO_RAPIDO.md
│   ├── examples/                 # Exemplos práticos
│   │   ├── EXEMPLOS_PRATICOS.md
│   │   └── EXEMPLOS_TESTES.md
│   ├── testing/                  # Planos e relatórios de testes
│   ├── process/                  # Artefatos de processo
│   ├── specs/                    # Especificações técnicas
│   │   └── mcp-camara-br-especificacao-completa.md
│   └── README.md                 # Índice da documentação
│
├── scripts/                      # Scripts utilitários
│   └── healthcheck.sh           # Health check para deploy
│
├── .github/                      # GitHub Actions
│   └── workflows/
│       ├── ci.yml               # CI/CD pipeline
│       └── release.yml          # Release automation
│
├── dist/                         # Código compilado (gerado)
│
├── .env.example                  # Template de variáveis de ambiente
├── .dockerignore                 # Arquivos ignorados no Docker build
├── .npmignore                    # Arquivos ignorados no npm publish
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Docker Compose config
├── package.json                  # Configuração npm
├── tsconfig.json                 # Configuração TypeScript
│
├── README.md                     # Este arquivo
├── CONTRIBUTING.md               # Guia de contribuição
├── CLAUDE.md                     # Guia para assistentes de IA
└── LICENSE                       # Licença MIT
```

## Desenvolvimento

```bash
# Modo desenvolvimento com watch
npm run dev

# Testes
npm test

# Cobertura de testes
npm run test:coverage

# Linting
npm run lint

# Formatação
npm run format

# Type checking
npm run type-check
```

## ⚡ Performance

O servidor implementa várias otimizações:

- **Cache em Camadas**: Diferentes TTLs por tipo de dado
- **Rate Limiting**: Token bucket algorithm
- **Circuit Breaker**: Previne cascata de falhas
- **Request Queue**: Controla concorrência
- **Retry Logic**: Exponential backoff com jitter

## 🔄 CI/CD

O projeto possui workflows automatizados do GitHub Actions:

### CI (Integração Contínua)
- ✅ Type checking (TypeScript)
- ✅ Linting (ESLint)
- ✅ Formatação (Prettier)
- ✅ Testes automatizados
- ✅ Build em Node.js 20.x e 21.x
- ✅ Build Docker

### Release (Publicação)
- 🚀 Criação automática de releases no GitHub
- 🚀 Build de imagens Docker em tags
- 📦 Preparado para publicação no npm (requer configuração)

**Configuração:**
Os workflows estão em `.github/workflows/`:
- `ci.yml` - Executado em push/PR para main/develop
- `release.yml` - Executado ao criar tags (v*)

## 📚 Documentação Completa

### Guias
- [Início Rápido](./docs/guides/INICIO_RAPIDO.md) - Comece em 5 minutos
- [Guia de Instalação e Uso](./docs/guides/GUIA_INSTALACAO_USO.md) - Instalação e configuração completas

### Exemplos e Testes
- [Exemplos Práticos](./docs/examples/EXEMPLOS_PRATICOS.md) - Casos de uso com LLMs
- [Exemplos de Testes](./docs/examples/EXEMPLOS_TESTES.md) - Validação e testes

### Especificações
- [Especificação Técnica Completa](./docs/specs/mcp-camara-br-especificacao-completa.md) - Documentação técnica detalhada

### Para Desenvolvedores
- [Guia de Contribuição](./CONTRIBUTING.md) - Como contribuir com o projeto
- [Guia para IA (CLAUDE.md)](./CLAUDE.md) - Instruções para assistentes de IA

### Índice Completo
- [Documentação Organizada](./docs/README.md) - Índice completo de toda documentação

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Este projeto segue boas práticas de desenvolvimento e possui diretrizes claras para contribuidores.

**Antes de contribuir, leia:**
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guia completo de contribuição com padrões de código, workflow e boas práticas

**Resumo rápido:**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Siga os padrões de código (TypeScript strict, ESLint, Prettier)
4. Escreva testes para novas funcionalidades
5. Commit usando [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, etc.)
6. Push para a branch (`git push origin feature/MinhaFeature`)
7. Abra um Pull Request com descrição detalhada

**Scripts úteis para desenvolvimento:**
```bash
npm run validate    # Executa type-check + lint + format-check + tests
npm run lint:fix    # Corrige problemas de lint automaticamente
npm run format      # Formata o código com Prettier
```

## Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🔗 Links

- [API Dados Abertos da Câmara](https://dadosabertos.camara.leg.br/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Documentação da API](https://dadosabertos.camara.leg.br/swagger/api.html)

## Suporte

Para reportar bugs ou solicitar features, abra uma [issue](https://github.com/seu-usuario/mcp-camara-br/issues).

---

Desenvolvido com ❤️ para democratização de dados públicos

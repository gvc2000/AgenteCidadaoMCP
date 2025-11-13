# 🏛️ MCP Câmara BR

**Servidor MCP completo para a API de Dados Abertos da Câmara dos Deputados do Brasil**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Visão Geral

O `mcp-camara-br` é um servidor MCP (Model Context Protocol) que mapeia **TODOS os endpoints** da API de Dados Abertos da Câmara dos Deputados, permitindo que LLMs (Large Language Models) acessem informações legislativas de forma estruturada, validada e eficiente.

### ✨ Características

- ✅ **50+ tools** cobrindo toda a API v2 da Câmara
- ✅ **Validação Zod** para todos os parâmetros
- ✅ **Cache inteligente** em camadas com TTL diferenciado
- ✅ **Rate limiting** e circuit breaker para resiliência
- ✅ **Retry automático** com backoff exponencial
- ✅ **Fila de requisições** para controle de concorrência
- ✅ **Logging estruturado** com Pino
- ✅ **TypeScript** 100% tipado
- ✅ **Docker ready** para deploy fácil

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mcp-camara-br.git
cd mcp-camara-br

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Build do projeto
npm run build

# Inicie o servidor
npm start
```

### Desenvolvimento

```bash
# Modo desenvolvimento com hot reload
npm run dev

# Executar testes
npm test

# Verificar tipos
npm run type-check

# Lint do código
npm run lint
```

## 📦 Categorias de Tools

### 1. **Deputados** (9 tools)
- `buscar_deputados` - Busca deputados com filtros
- `detalhar_deputado` - Informações detalhadas de um deputado
- `despesas_deputado` - Despesas com CEAP
- `discursos_deputado` - Discursos proferidos
- `eventos_deputado` - Eventos que participou
- `frentes_deputado` - Frentes parlamentares
- `ocupacoes_deputado` - Cargos ocupados
- `orgaos_deputado` - Órgãos dos quais é membro
- `profissoes_deputado` - Profissões declaradas

### 2. **Proposições** (7 tools)
- `buscar_proposicoes` - Busca proposições legislativas
- `detalhar_proposicao` - Detalhes de uma proposição
- `autores_proposicao` - Autores da proposição
- `tramitacoes_proposicao` - Histórico de tramitação
- `votacoes_proposicao` - Votações da proposição
- `relacionadas_proposicao` - Proposições relacionadas
- `temas_proposicao` - Temas/assuntos

### 3. **Votações** (5 tools)
- `buscar_votacoes` - Busca votações
- `detalhar_votacao` - Detalhes de uma votação
- `votos_votacao` - Como cada deputado votou
- `orientacoes_votacao` - Orientações de bancada
- `ultimas_votacoes` - 15 votações mais recentes

### 4. **Eventos** (6 tools)
- `buscar_eventos` - Busca eventos legislativos
- `detalhar_evento` - Detalhes de um evento
- `deputados_evento` - Deputados presentes
- `pauta_evento` - Pauta do evento
- `votacoes_evento` - Votações do evento
- `orgaos_evento` - Órgãos responsáveis

### 5. **Órgãos** (5 tools)
- `buscar_orgaos` - Busca órgãos da Câmara
- `detalhar_orgao` - Detalhes de um órgão
- `membros_orgao` - Membros do órgão
- `eventos_orgao` - Eventos do órgão
- `votacoes_orgao` - Votações do órgão

### 6. **Frentes, Blocos, Partidos, Legislaturas** (12 tools)
- `buscar_frentes`, `detalhar_frente`, `membros_frente`
- `buscar_blocos`, `detalhar_bloco`
- `buscar_partidos`, `detalhar_partido`, `membros_partido`, `lideres_partido`
- `buscar_legislaturas`, `detalhar_legislatura`, `mesa_legislatura`

### 7. **Referências** (6 tools)
- `situacoes_proposicao` - Situações de tramitação
- `temas_referencia` - Temas de proposições
- `tipos_proposicao` - Tipos de proposições
- `tipos_orgao` - Tipos de órgãos
- `tipos_evento` - Tipos de eventos
- `listar_ufs` - Estados do Brasil

## 💡 Exemplos de Uso

### Buscar deputados de São Paulo do PT

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

### Buscar proposições sobre educação

```json
{
  "tool": "buscar_proposicoes",
  "arguments": {
    "keywords": "educação",
    "ano": 2024,
    "siglaTipo": "PL"
  }
}
```

### Obter últimas votações

```json
{
  "tool": "ultimas_votacoes",
  "arguments": {
    "ordem": "DESC"
  }
}
```

## 🔧 Configuração

O servidor é configurado via variáveis de ambiente. Copie `.env.example` para `.env` e ajuste conforme necessário:

```bash
# API Configuration
API_BASE_URL=https://dadosabertos.camara.leg.br/api/v2

# Cache Configuration
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

# Performance
REQUEST_TIMEOUT_MS=30000
MAX_CONCURRENT_REQUESTS=10
```

## 🐳 Deploy com Docker

### Build da imagem

```bash
docker build -t mcp-camara-br .
```

### Executar com Docker Compose

```bash
docker-compose up -d
```

### Configurações Docker

O `docker-compose.yml` inclui:
- Servidor MCP principal
- Redis para cache (opcional)
- Health checks
- Volumes para logs

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com cobertura
npm run test:coverage

# Testes de integração
npm run test:integration
```

## 📊 Arquitetura

```
mcp-camara-br/
├── src/
│   ├── server.ts              # Entry point
│   ├── mcp.ts                 # MCP server setup
│   ├── config.ts              # Configurações
│   ├── core/                  # Infraestrutura
│   │   ├── cache.ts
│   │   ├── rate-limiter.ts
│   │   ├── circuit-breaker.ts
│   │   ├── logging.ts
│   │   ├── errors.ts
│   │   ├── queue.ts
│   │   └── schemas.ts
│   ├── api/                   # Cliente API
│   │   ├── client.ts
│   │   └── normalizers.ts
│   └── tools/                 # Tools MCP
│       ├── deputados/
│       ├── proposicoes/
│       ├── votacoes/
│       ├── eventos/
│       ├── orgaos/
│       └── outros/
├── tests/                     # Testes
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🔐 Segurança

- ✅ Validação rigorosa de inputs com Zod
- ✅ Rate limiting para proteção contra abuso
- ✅ Circuit breaker para resiliência
- ✅ Timeout em todas as requisições
- ✅ Sanitização de parâmetros
- ✅ Logs estruturados para auditoria

## 📈 Performance

- **Cache em camadas** com TTL diferenciado por tipo de dado
- **Fila de requisições** para controle de concorrência
- **Retry automático** com backoff exponencial
- **Connection pooling** via axios
- **Compressão** de respostas

### TTL de Cache por Categoria

| Categoria    | TTL      |
|--------------|----------|
| Deputados    | 1 hora   |
| Proposições  | 30 min   |
| Votações     | 5 min    |
| Eventos      | 10 min   |
| Órgãos       | 2 horas  |
| Frentes      | 24 horas |
| Blocos       | 24 horas |
| Partidos     | 1 hora   |
| Legislaturas | 24 horas |
| Referências  | 7 dias   |
| Despesas     | 24 horas |

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🔗 Links Úteis

- [API de Dados Abertos da Câmara](https://dadosabertos.camara.leg.br/)
- [Documentação da API](https://dadosabertos.camara.leg.br/swagger/api.html)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Repositório Oficial da Câmara](https://github.com/CamaraDosDeputados/dados-abertos)

## 📧 Suporte

Para dúvidas, problemas ou sugestões:
- Abra uma [issue](https://github.com/seu-usuario/mcp-camara-br/issues)
- Consulte o repositório oficial da Câmara

---

**Desenvolvido com ❤️ para democratizar o acesso a dados legislativos brasileiros**

# MCP Câmara BR

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

## Requisitos

- Node.js >= 20.0.0
- npm ou yarn

## Instalação

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

## Tools Disponíveis

### Deputados

- `buscar_deputados` - Busca deputados por nome, UF, partido, etc.
- `detalhar_deputado` - Informações detalhadas de um deputado
- `despesas_deputado` - Despesas da cota parlamentar
- `discursos_deputado` - Discursos proferidos
- `eventos_deputado` - Eventos que participou
- `orgaos_deputado` - Órgãos dos quais é membro

### Proposições

- `buscar_proposicoes` - Busca proposições legislativas (PLs, PECs, MPs, etc.)
- `detalhar_proposicao` - Informações detalhadas de uma proposição
- `autores_proposicao` - Lista os autores de uma proposição

## Exemplos de Uso

### Buscar Deputados de SP do PT

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

### Despesas de um Deputado

```json
{
  "tool": "despesas_deputado",
  "arguments": {
    "id": 204554,
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

## Arquitetura

```
mcp-camara-br/
├── src/
│   ├── server.ts                 # Entry point
│   ├── mcp.ts                    # MCP server setup
│   ├── config.ts                 # Configurações
│   ├── api/
│   │   ├── client.ts             # Cliente HTTP
│   │   └── normalizers.ts        # Normalização de dados
│   ├── core/
│   │   ├── cache.ts              # Sistema de cache
│   │   ├── errors.ts             # Tratamento de erros
│   │   ├── logging.ts            # Sistema de logs
│   │   ├── metrics.ts            # Métricas
│   │   ├── rate-limiter.ts       # Rate limiting
│   │   ├── circuit-breaker.ts    # Circuit breaker
│   │   ├── queue.ts              # Fila de requisições
│   │   └── schemas.ts            # Schemas Zod
│   ├── tools/
│   │   ├── deputados/            # Tools de deputados
│   │   └── proposicoes/          # Tools de proposições
│   └── utils/                    # Utilitários
├── tests/                        # Testes
├── docs/                         # Documentação
└── scripts/                      # Scripts utilitários
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

## Performance

O servidor implementa várias otimizações:

- **Cache em Camadas**: Diferentes TTLs por tipo de dado
- **Rate Limiting**: Token bucket algorithm
- **Circuit Breaker**: Previne cascata de falhas
- **Request Queue**: Controla concorrência
- **Retry Logic**: Exponential backoff com jitter

## Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Links

- [API Dados Abertos da Câmara](https://dadosabertos.camara.leg.br/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Documentação da API](https://dadosabertos.camara.leg.br/swagger/api.html)

## Suporte

Para reportar bugs ou solicitar features, abra uma [issue](https://github.com/seu-usuario/mcp-camara-br/issues).

---

Desenvolvido com ❤️ para democratização de dados públicos

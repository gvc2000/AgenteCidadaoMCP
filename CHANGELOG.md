# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2025-12-12

### Adicionado
- CHANGELOG.md para documentar histórico de versões
- Correção de links na documentação

### Corrigido
- Links quebrados no README.md

## [1.0.0] - 2025-12-09

### Adicionado
- **57 MCP Tools** organizadas em 11 categorias:
  - Deputados (9): buscar, detalhar, despesas, discursos, eventos, frentes, ocupações, órgãos, profissões
  - Proposições (7): buscar, detalhar, autores, tramitações, votações, relacionadas, temas
  - Votações (5): buscar, detalhar, votos, orientações, últimas
  - Eventos (6): buscar, detalhar, deputados, pauta, votações, órgãos
  - Órgãos (5): buscar, detalhar, membros, eventos, votações
  - Partidos (4): buscar, detalhar, membros, líderes
  - Frentes (3): buscar, detalhar, membros
  - Blocos (2): buscar, detalhar
  - Legislaturas (3): buscar, detalhar, mesa
  - Referências (5): situações, tipos_proposição, tipos_órgão, tipos_evento, UFs
  - Análises (8): presença, ranking, despesas_partido, comparativo, timeline, exportar, sugerir, diagnosticar
- **Sistema de cache inteligente** com TTLs diferenciados por categoria
- **Rate limiting** com token bucket algorithm (100 req/min)
- **Circuit breaker** para resiliência a falhas (5 falhas → abre 60s)
- **Métricas Prometheus** para observabilidade
- **Logging estruturado** com Pino
- **Validação rigorosa** com Zod schemas
- **Servidor HTTP REST** para integração direta
- **Servidor SSE** para integração com n8n
- **Docker support** com multi-stage build
- **CI/CD** com GitHub Actions
- Ferramenta `sugerir_ferramentas` para ajudar usuários a encontrar a tool correta
- Ferramenta `diagnosticar_consulta` para fluxos completos de consulta
- Compatibilidade com Windows 11
- Guia de deploy no Railway
- Documentação completa em português

### Corrigido
- Compatibilidade com n8n Agent Node (isError: false)
- Resiliência do circuit breaker para respostas lentas da API
- Parâmetros da API da Câmara dos Deputados
- Busca por autor em proposições
- Scripts de build cross-platform (Windows/Unix)

### Melhorado
- Performance com cache global e keep-alive
- Parallel fetching para reduzir latência
- Descrições das tools para melhor compreensão por LLMs
- Tratamento de erros com mensagens mais claras

## [0.9.0] - 2025-11-18

### Adicionado
- Script de testes abrangente para validar todas as tools
- Sistema de prompts MCP
- Referência de tools em `.claude/TOOLS_REFERENCE.md`

### Corrigido
- Bugs identificados nos testes automatizados
- IDs dinâmicos no script de testes

## [0.8.0] - 2025-11-16

### Adicionado
- Servidor MCP com suporte a HTTP streaming (SSE)
- Integração com Railway para deploy
- Suporte a n8n via SSE
- Guia de troubleshooting para deploy

### Corrigido
- Configuração de servidor para Railway (0.0.0.0)
- Package-lock.json para builds determinísticos

## [0.7.0] - 2025-11-15

### Adicionado
- Estrutura organizada do projeto
- PR template para contribuições
- Guias de instalação detalhados

### Alterado
- Organização dos arquivos frontend em diretório dedicado
- Scripts de build compatíveis com Windows

## [0.6.0] - 2025-11-15

### Adicionado
- Interface web Agente Cidadão (protótipo v4)
- Sistema de acesso restrito com login
- Interface administrativa

## [0.5.0] - 2025-11-14

### Adicionado
- Especificação completa do MCP Câmara BR
- Documentação técnica detalhada
- Exemplos práticos de uso

## [0.4.0] - 2025-11-13

### Adicionado
- Tools de análise avançada
- Exportação de dados (CSV/JSON)
- Timeline de tramitação

## [0.3.0] - 2025-11-12

### Adicionado
- Circuit breaker pattern
- Request queue com p-queue
- Retry logic com exponential backoff

## [0.2.0] - 2025-11-11

### Adicionado
- Sistema de cache LRU
- Rate limiter
- Métricas básicas

## [0.1.0] - 2025-11-10

### Adicionado
- Estrutura inicial do projeto
- Cliente HTTP para API da Câmara
- Tools básicas de deputados e proposições
- Configuração TypeScript e ESLint

---

## Links

- [API Dados Abertos da Câmara](https://dadosabertos.camara.leg.br/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Repositório](https://github.com/gvc2000/AgenteCidadaoMCP)

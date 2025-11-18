# Tools Reference - MCP Câmara BR

Referência completa das 55 tools do servidor MCP.

## Deputados (9 tools)

| Tool | Arquivo | Descrição | Params principais |
|------|---------|-----------|-------------------|
| `buscar_deputados` | buscar.ts | Busca deputados | nome?, uf?, partido?, legislatura?, pagina, itens |
| `detalhar_deputado` | detalhar.ts | Detalhes do deputado | id (required) |
| `despesas_deputado` | despesas.ts | Despesas parlamentares | id, ano?, mes?, tipo?, pagina, itens |
| `discursos_deputado` | discursos.ts | Discursos do deputado | id, dataInicio?, dataFim?, pagina, itens |
| `eventos_deputado` | eventos.ts | Eventos participados | id, dataInicio?, dataFim?, pagina, itens |
| `frentes_deputado` | frentes.ts | Frentes do deputado | id |
| `ocupacoes_deputado` | ocupacoes.ts | Ocupações anteriores | id |
| `orgaos_deputado` | orgaos.ts | Órgãos do deputado | id, dataInicio?, dataFim? |
| `profissoes_deputado` | profissoes.ts | Profissões do deputado | id |

## Proposições (7 tools)

| Tool | Arquivo | Descrição | Params principais |
|------|---------|-----------|-------------------|
| `buscar_proposicoes` | buscar.ts | Busca proposições | tipo?, numero?, ano?, autor?, tema?, pagina, itens |
| `detalhar_proposicao` | detalhar.ts | Detalhes da proposição | id (required) |
| `autores_proposicao` | autores.ts | Autores da proposição | id |
| `tramitacoes_proposicao` | tramitacoes.ts | Tramitações | id, dataInicio?, dataFim? |
| `votacoes_proposicao` | votacoes.ts | Votações da proposição | id |
| `relacionadas_proposicao` | relacionadas.ts | Proposições relacionadas | id |
| `temas_proposicao` | temas.ts | Temas da proposição | id |

## Votações (5 tools)

| Tool | Arquivo | Descrição | Params principais |
|------|---------|-----------|-------------------|
| `buscar_votacoes` | buscar.ts | Busca votações | dataInicio?, dataFim?, proposicaoId?, pagina, itens |
| `detalhar_votacao` | detalhar.ts | Detalhes da votação | id (required) |
| `votos_votacao` | votos.ts | Votos individuais | id |
| `orientacoes_votacao` | orientacoes.ts | Orientações de bancada | id |
| `ultimas_votacoes` | ultimas.ts | Últimas votações | quantidade? |

## Eventos (6 tools)

| Tool | Arquivo | Descrição | Params principais |
|------|---------|-----------|-------------------|
| `buscar_eventos` | buscar.ts | Busca eventos | dataInicio?, dataFim?, tipo?, orgaoId?, pagina, itens |
| `detalhar_evento` | detalhar.ts | Detalhes do evento | id (required) |
| `deputados_evento` | deputados.ts | Deputados no evento | id |
| `pauta_evento` | pauta.ts | Pauta do evento | id |
| `votacoes_evento` | votacoes.ts | Votações do evento | id |
| `orgaos_evento` | orgaos.ts | Órgãos do evento | id |

## Órgãos (5 tools)

| Tool | Arquivo | Descrição | Params principais |
|------|---------|-----------|-------------------|
| `buscar_orgaos` | buscar.ts | Busca órgãos | sigla?, tipo?, pagina, itens |
| `detalhar_orgao` | detalhar.ts | Detalhes do órgão | id (required) |
| `membros_orgao` | membros.ts | Membros do órgão | id, dataInicio?, dataFim? |
| `eventos_orgao` | eventos.ts | Eventos do órgão | id, dataInicio?, dataFim?, pagina, itens |
| `votacoes_orgao` | votacoes.ts | Votações do órgão | id, dataInicio?, dataFim?, pagina, itens |

## Partidos (4 tools)

| Tool | Arquivo | Descrição | Params principais |
|------|---------|-----------|-------------------|
| `buscar_partidos` | buscar.ts | Busca partidos | sigla?, pagina, itens |
| `detalhar_partido` | detalhar.ts | Detalhes do partido | id (required) |
| `membros_partido` | membros.ts | Membros do partido | id, dataInicio?, dataFim?, pagina, itens |
| `lideres_partido` | lideres.ts | Líderes do partido | id |

## Frentes (3 tools)

| Tool | Arquivo | Descrição | Params principais |
|------|---------|-----------|-------------------|
| `buscar_frentes` | buscar.ts | Busca frentes | legislatura?, pagina, itens |
| `detalhar_frente` | detalhar.ts | Detalhes da frente | id (required) |
| `membros_frente` | membros.ts | Membros da frente | id |

## Blocos (2 tools)

| Tool | Arquivo | Descrição | Params principais |
|------|---------|-----------|-------------------|
| `buscar_blocos` | buscar.ts | Busca blocos | legislatura?, pagina, itens |
| `detalhar_bloco` | detalhar.ts | Detalhes do bloco | id (required) |

## Legislaturas (3 tools)

| Tool | Arquivo | Descrição | Params principais |
|------|---------|-----------|-------------------|
| `buscar_legislaturas` | buscar.ts | Lista legislaturas | pagina, itens |
| `detalhar_legislatura` | detalhar.ts | Detalhes da legislatura | id (required) |
| `mesa_legislatura` | mesa.ts | Mesa diretora | id |

## Referências (5 tools)

| Tool | Arquivo | Descrição | Params principais |
|------|---------|-----------|-------------------|
| `situacoes_proposicao` | situacoes.ts | Situações de proposição | - |
| `tipos_proposicao` | tipos-proposicao.ts | Tipos de proposição | - |
| `tipos_orgao` | tipos-orgao.ts | Tipos de órgão | - |
| `tipos_evento` | tipos-evento.ts | Tipos de evento | - |
| `ufs` | ufs.ts | Unidades federativas | - |

## Análises (6 tools)

| Tool | Arquivo | Descrição | Params principais |
|------|---------|-----------|-------------------|
| `analise_presenca_deputado` | analise-presenca.ts | Análise de presença | id, dataInicio?, dataFim? |
| `ranking_proposicoes_autor` | ranking-proposicoes.ts | Ranking de proposições | legislatura?, tipo?, limite? |
| `analise_despesas_partido` | analise-despesas-partido.ts | Despesas por partido | ano?, mes? |
| `comparativo_votacoes_bancadas` | comparativo-votacoes.ts | Comparativo de votações | votacaoId |
| `timeline_tramitacao` | timeline-tramitacao.ts | Timeline de tramitação | proposicaoId |
| `exportar_dados` | exportar-dados.ts | Exportar dados | tipo, formato, filtros? |

## Schemas Comuns (core/schemas.ts)

```typescript
// Validadores reutilizáveis
UFEnum           // AC, AL, AM, ..., TO
DateSchema       // YYYY-MM-DD
PaginationSchema // { pagina: number, itens: number }
IdSchema         // number > 0
SafeTextSchema   // string sanitizada
```

## Endpoints API

Base: `https://dadosabertos.camara.leg.br/api/v2`

```
/deputados, /deputados/{id}, /deputados/{id}/despesas, /deputados/{id}/discursos
/proposicoes, /proposicoes/{id}, /proposicoes/{id}/autores, /proposicoes/{id}/tramitacoes
/votacoes, /votacoes/{id}, /votacoes/{id}/votos, /votacoes/{id}/orientacoes
/eventos, /eventos/{id}, /eventos/{id}/deputados, /eventos/{id}/pauta
/orgaos, /orgaos/{id}, /orgaos/{id}/membros
/partidos, /partidos/{id}, /partidos/{id}/membros
/frentes, /frentes/{id}, /frentes/{id}/membros
/blocos, /blocos/{id}
/legislaturas, /legislaturas/{id}, /legislaturas/{id}/mesa
/referencias/...
```

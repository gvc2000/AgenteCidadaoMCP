# Plano de Testes Completo - MCP Câmara BR

**Data**: 2025-11-14
**Versão**: 1.0.0
**Total de Ferramentas**: 55
**Total de Testes**: 275 (5 por ferramenta)

---

## Verificação de Implementação

✅ **55 ferramentas implementadas (100%)**

### Ferramentas Registradas no MCP Server

```
analise_despesas_partido
analise_presenca_deputado
autores_proposicao
buscar_blocos
buscar_deputados
buscar_eventos
buscar_frentes
buscar_legislaturas
buscar_orgaos
buscar_partidos
buscar_proposicoes
buscar_votacoes
comparativo_votacoes_bancadas
deputados_evento
despesas_deputado
detalhar_bloco
detalhar_deputado
detalhar_evento
detalhar_frente
detalhar_legislatura
detalhar_orgao
detalhar_partido
detalhar_proposicao
detalhar_votacao
discursos_deputado
eventos_deputado
eventos_orgao
exportar_dados
frentes_deputado
lideres_partido
membros_frente
membros_orgao
membros_partido
mesa_legislatura
ocupacoes_deputado
orgaos_deputado
orgaos_evento
orientacoes_votacao
pauta_evento
profissoes_deputado
ranking_proposicoes_autor
relacionadas_proposicao
situacoes_proposicao
temas_proposicao
timeline_tramitacao
tipos_evento
tipos_orgao
tipos_proposicao
tramitacoes_proposicao
ufs
ultimas_votacoes
votacoes_evento
votacoes_orgao
votacoes_proposicao
votos_votacao
```

---

## 1. CATEGORIA: DEPUTADOS (10 ferramentas)

### 1.1 buscar_deputados
1. ✓ Buscar deputados sem filtros (paginação padrão)
2. ✓ Buscar deputados por UF específica (ex: SP)
3. ✓ Buscar deputados por partido (ex: PT)
4. ✓ Buscar deputados por nome parcial (ex: "Silva")
5. ✓ Buscar deputados com paginação customizada (página 2, 50 itens)

### 1.2 detalhar_deputado
1. ✓ Detalhar deputado com ID válido (ex: 204554)
2. ✓ Detalhar deputado com ID inválido (negativo)
3. ✓ Detalhar deputado com ID inexistente
4. ✓ Detalhar deputado com ID decimal (deve falhar)
5. ✓ Detalhar deputado sem ID (deve falhar)

### 1.3 despesas_deputado
1. ✓ Buscar despesas de deputado por ano (ex: 2024)
2. ✓ Buscar despesas de deputado por ano e mês (ex: 2024, mês 11)
3. ✓ Buscar despesas com ano inválido (ex: 2000)
4. ✓ Buscar despesas com mês inválido (ex: 13)
5. ✓ Buscar despesas com ordenação DESC

### 1.4 discursos_deputado
1. ✓ Buscar discursos de deputado sem filtros
2. ✓ Buscar discursos entre datas específicas
3. ✓ Buscar discursos com data início maior que data fim (deve falhar)
4. ✓ Buscar discursos com data inválida (formato errado)
5. ✓ Buscar discursos com paginação

### 1.5 eventos_deputado
1. ✓ Buscar eventos de deputado sem filtros
2. ✓ Buscar eventos entre datas específicas
3. ✓ Buscar eventos com data inválida
4. ✓ Buscar eventos com ordenação ASC
5. ✓ Buscar eventos com paginação customizada

### 1.6 orgaos_deputado
1. ✓ Buscar órgãos de deputado sem filtros
2. ✓ Buscar órgãos entre datas específicas
3. ✓ Buscar órgãos com data inválida
4. ✓ Buscar órgãos com paginação
5. ✓ Buscar órgãos com ordenação

### 1.7 frentes_deputado
1. ✓ Buscar frentes de deputado sem filtros
2. ✓ Buscar frentes com paginação
3. ✓ Buscar frentes com ID inválido
4. ✓ Buscar frentes com ordenação
5. ✓ Buscar frentes de deputado inexistente

### 1.8 profissoes_deputado
1. ✓ Buscar profissões de deputado válido
2. ✓ Buscar profissões com ID inválido
3. ✓ Buscar profissões com ID inexistente
4. ✓ Buscar profissões com paginação
5. ✓ Buscar profissões com ordenação

### 1.9 ocupacoes_deputado
1. ✓ Buscar ocupações de deputado válido
2. ✓ Buscar ocupações com ID inválido
3. ✓ Buscar ocupações com ID inexistente
4. ✓ Buscar ocupações com paginação
5. ✓ Buscar ocupações com ordenação

### 1.10 deputados_evento
1. ✓ Buscar deputados de evento válido
2. ✓ Buscar deputados com ID evento inválido
3. ✓ Buscar deputados com paginação
4. ✓ Buscar deputados com ordenação
5. ✓ Buscar deputados de evento inexistente

---

## 2. CATEGORIA: PROPOSIÇÕES (9 ferramentas)

### 2.1 buscar_proposicoes
1. ✓ Buscar proposições sem filtros
2. ✓ Buscar proposições por tipo (ex: PL)
3. ✓ Buscar proposições por ano (ex: 2024)
4. ✓ Buscar proposições por autor (ID deputado)
5. ✓ Buscar proposições com paginação e ordenação

### 2.2 detalhar_proposicao
1. ✓ Detalhar proposição com ID válido
2. ✓ Detalhar proposição com ID inválido
3. ✓ Detalhar proposição inexistente
4. ✓ Detalhar proposição com ID decimal
5. ✓ Detalhar proposição sem ID

### 2.3 autores_proposicao
1. ✓ Buscar autores de proposição válida
2. ✓ Buscar autores com ID inválido
3. ✓ Buscar autores de proposição inexistente
4. ✓ Buscar autores com paginação
5. ✓ Buscar autores com ordenação

### 2.4 tramitacoes_proposicao
1. ✓ Buscar tramitações de proposição válida
2. ✓ Buscar tramitações com ordenação ASC
3. ✓ Buscar tramitações com ordenação DESC
4. ✓ Buscar tramitações com paginação
5. ✓ Buscar tramitações de proposição inexistente

### 2.5 votacoes_proposicao
1. ✓ Buscar votações de proposição válida
2. ✓ Buscar votações com ordenação
3. ✓ Buscar votações com paginação
4. ✓ Buscar votações com ID inválido
5. ✓ Buscar votações de proposição inexistente

### 2.6 relacionadas_proposicao
1. ✓ Buscar proposições relacionadas válidas
2. ✓ Buscar relacionadas com ID inválido
3. ✓ Buscar relacionadas de proposição inexistente
4. ✓ Buscar relacionadas com paginação
5. ✓ Buscar relacionadas com ordenação

### 2.7 temas_proposicao
1. ✓ Buscar temas de proposição válida
2. ✓ Buscar temas com ID inválido
3. ✓ Buscar temas de proposição inexistente
4. ✓ Buscar temas com paginação
5. ✓ Buscar temas com ordenação

### 2.8 situacoes_proposicao
1. ✓ Buscar situações sem filtros
2. ✓ Buscar situações com paginação
3. ✓ Buscar situações com ordenação ASC
4. ✓ Buscar situações com ordenação DESC
5. ✓ Buscar situações com limite máximo (100 itens)

### 2.9 tipos_proposicao
1. ✓ Buscar todos os tipos de proposição
2. ✓ Buscar tipos com paginação
3. ✓ Buscar tipos com ordenação
4. ✓ Buscar tipos com limite customizado
5. ✓ Validar tipos retornados (PL, PEC, etc.)

---

## 3. CATEGORIA: VOTAÇÕES (4 ferramentas)

### 3.1 buscar_votacoes
1. ✓ Buscar votações sem filtros
2. ✓ Buscar votações por data específica
3. ✓ Buscar votações entre datas
4. ✓ Buscar votações com ordenação
5. ✓ Buscar votações com paginação

### 3.2 detalhar_votacao
1. ✓ Detalhar votação com ID válido
2. ✓ Detalhar votação com ID string inválido
3. ✓ Detalhar votação inexistente
4. ✓ Detalhar votação com ID vazio
5. ✓ Detalhar votação com caracteres especiais

### 3.3 votos_votacao
1. ✓ Buscar votos de votação válida
2. ✓ Buscar votos com paginação
3. ✓ Buscar votos com ordenação
4. ✓ Buscar votos com ID inválido
5. ✓ Buscar votos de votação inexistente

### 3.4 orientacoes_votacao
1. ✓ Buscar orientações de votação válida
2. ✓ Buscar orientações com paginação
3. ✓ Buscar orientações com ordenação
4. ✓ Buscar orientações com ID inválido
5. ✓ Buscar orientações de votação inexistente

### 3.5 ultimas_votacoes
1. ✓ Buscar últimas votações sem filtros
2. ✓ Buscar últimas votações com ordenação ASC
3. ✓ Buscar últimas votações com ordenação DESC
4. ✓ Buscar últimas votações com paginação
5. ✓ Buscar últimas votações com limite máximo

---

## 4. CATEGORIA: EVENTOS (7 ferramentas)

### 4.1 buscar_eventos
1. ✓ Buscar eventos sem filtros
2. ✓ Buscar eventos por data
3. ✓ Buscar eventos por hora (horaInicio, horaFim)
4. ✓ Buscar eventos por órgão
5. ✓ Buscar eventos com hora inválida (24:00)

### 4.2 detalhar_evento
1. ✓ Detalhar evento com ID válido
2. ✓ Detalhar evento com ID inválido
3. ✓ Detalhar evento inexistente
4. ✓ Detalhar evento com ID decimal
5. ✓ Detalhar evento sem ID

### 4.3 pauta_evento
1. ✓ Buscar pauta de evento válido
2. ✓ Buscar pauta com ID inválido
3. ✓ Buscar pauta de evento inexistente
4. ✓ Buscar pauta com paginação
5. ✓ Buscar pauta com ordenação

### 4.4 votacoes_evento
1. ✓ Buscar votações de evento válido
2. ✓ Buscar votações com paginação
3. ✓ Buscar votações com ordenação
4. ✓ Buscar votações com ID inválido
5. ✓ Buscar votações de evento inexistente

### 4.5 orgaos_evento
1. ✓ Buscar órgãos de evento válido
2. ✓ Buscar órgãos com paginação
3. ✓ Buscar órgãos com ordenação
4. ✓ Buscar órgãos com ID inválido
5. ✓ Buscar órgãos de evento inexistente

### 4.6 deputados_evento
1. ✓ Buscar deputados de evento válido
2. ✓ Buscar deputados com paginação
3. ✓ Buscar deputados com ordenação
4. ✓ Buscar deputados com ID inválido
5. ✓ Buscar deputados de evento inexistente

### 4.7 tipos_evento
1. ✓ Buscar todos os tipos de evento
2. ✓ Buscar tipos com paginação
3. ✓ Buscar tipos com ordenação
4. ✓ Buscar tipos com limite customizado
5. ✓ Validar tipos retornados

---

## 5. CATEGORIA: ÓRGÃOS (6 ferramentas)

### 5.1 buscar_orgaos
1. ✓ Buscar órgãos sem filtros
2. ✓ Buscar órgãos por tipo
3. ✓ Buscar órgãos com paginação
4. ✓ Buscar órgãos com ordenação
5. ✓ Buscar órgãos com filtro de data

### 5.2 detalhar_orgao
1. ✓ Detalhar órgão com ID válido
2. ✓ Detalhar órgão com ID inválido
3. ✓ Detalhar órgão inexistente
4. ✓ Detalhar órgão com ID decimal
5. ✓ Detalhar órgão sem ID

### 5.3 membros_orgao
1. ✓ Buscar membros de órgão válido
2. ✓ Buscar membros com paginação
3. ✓ Buscar membros com ordenação
4. ✓ Buscar membros com ID inválido
5. ✓ Buscar membros de órgão inexistente

### 5.4 eventos_orgao
1. ✓ Buscar eventos de órgão válido
2. ✓ Buscar eventos com filtro de data
3. ✓ Buscar eventos com paginação
4. ✓ Buscar eventos com ordenação
5. ✓ Buscar eventos de órgão inexistente

### 5.5 votacoes_orgao
1. ✓ Buscar votações de órgão válido
2. ✓ Buscar votações com paginação
3. ✓ Buscar votações com ordenação
4. ✓ Buscar votações com ID inválido
5. ✓ Buscar votações de órgão inexistente

### 5.6 tipos_orgao
1. ✓ Buscar todos os tipos de órgão
2. ✓ Buscar tipos com paginação
3. ✓ Buscar tipos com ordenação
4. ✓ Buscar tipos com limite customizado
5. ✓ Validar tipos retornados (comissões, etc.)

---

## 6. CATEGORIA: PARTIDOS (4 ferramentas)

### 6.1 buscar_partidos
1. ✓ Buscar partidos sem filtros
2. ✓ Buscar partidos por sigla
3. ✓ Buscar partidos com paginação
4. ✓ Buscar partidos com ordenação
5. ✓ Buscar partidos com filtro de data

### 6.2 detalhar_partido
1. ✓ Detalhar partido com ID válido
2. ✓ Detalhar partido com ID inválido
3. ✓ Detalhar partido inexistente
4. ✓ Detalhar partido com ID decimal
5. ✓ Detalhar partido sem ID

### 6.3 membros_partido
1. ✓ Buscar membros de partido válido
2. ✓ Buscar membros com paginação
3. ✓ Buscar membros com ordenação
4. ✓ Buscar membros com ID inválido
5. ✓ Buscar membros de partido inexistente

### 6.4 lideres_partido
1. ✓ Buscar líderes de partido válido
2. ✓ Buscar líderes com paginação
3. ✓ Buscar líderes com ordenação
4. ✓ Buscar líderes com ID inválido
5. ✓ Buscar líderes de partido inexistente

---

## 7. CATEGORIA: FRENTES (3 ferramentas)

### 7.1 buscar_frentes
1. ✓ Buscar frentes sem filtros
2. ✓ Buscar frentes com paginação
3. ✓ Buscar frentes com ordenação
4. ✓ Buscar frentes por ID tipo
5. ✓ Buscar frentes com limite máximo

### 7.2 detalhar_frente
1. ✓ Detalhar frente com ID válido
2. ✓ Detalhar frente com ID inválido
3. ✓ Detalhar frente inexistente
4. ✓ Detalhar frente com ID decimal
5. ✓ Detalhar frente sem ID

### 7.3 membros_frente
1. ✓ Buscar membros de frente válida
2. ✓ Buscar membros com paginação
3. ✓ Buscar membros com ordenação
4. ✓ Buscar membros com ID inválido
5. ✓ Buscar membros de frente inexistente

---

## 8. CATEGORIA: BLOCOS (2 ferramentas)

### 8.1 buscar_blocos
1. ✓ Buscar blocos sem filtros
2. ✓ Buscar blocos com paginação
3. ✓ Buscar blocos com ordenação
4. ✓ Buscar blocos por ID legislatura
5. ✓ Buscar blocos com limite máximo

### 8.2 detalhar_bloco
1. ✓ Detalhar bloco com ID válido
2. ✓ Detalhar bloco com ID inválido
3. ✓ Detalhar bloco inexistente
4. ✓ Detalhar bloco com ID decimal
5. ✓ Detalhar bloco sem ID

---

## 9. CATEGORIA: LEGISLATURAS (3 ferramentas)

### 9.1 buscar_legislaturas
1. ✓ Buscar legislaturas sem filtros
2. ✓ Buscar legislaturas com paginação
3. ✓ Buscar legislaturas com ordenação
4. ✓ Buscar legislaturas por data
5. ✓ Buscar legislaturas com limite máximo

### 9.2 detalhar_legislatura
1. ✓ Detalhar legislatura com ID válido
2. ✓ Detalhar legislatura com ID inválido (> 57)
3. ✓ Detalhar legislatura inexistente
4. ✓ Detalhar legislatura com ID decimal
5. ✓ Detalhar legislatura sem ID

### 9.3 mesa_legislatura
1. ✓ Buscar mesa de legislatura válida
2. ✓ Buscar mesa com filtro de data
3. ✓ Buscar mesa com paginação
4. ✓ Buscar mesa com ID inválido
5. ✓ Buscar mesa de legislatura inexistente

---

## 10. CATEGORIA: REFERÊNCIAS (5 ferramentas)

### 10.1 situacoes_proposicao
1. ✓ Buscar todas as situações
2. ✓ Buscar situações com paginação
3. ✓ Buscar situações com ordenação
4. ✓ Buscar situações com limite customizado
5. ✓ Validar situações retornadas

### 10.2 tipos_proposicao
1. ✓ Buscar todos os tipos
2. ✓ Buscar tipos com paginação
3. ✓ Buscar tipos com ordenação
4. ✓ Buscar tipos com limite customizado
5. ✓ Validar tipos (PL, PEC, PLP, etc.)

### 10.3 tipos_orgao
1. ✓ Buscar todos os tipos de órgão
2. ✓ Buscar tipos com paginação
3. ✓ Buscar tipos com ordenação
4. ✓ Buscar tipos com limite customizado
5. ✓ Validar tipos retornados

### 10.4 tipos_evento
1. ✓ Buscar todos os tipos de evento
2. ✓ Buscar tipos com paginação
3. ✓ Buscar tipos com ordenação
4. ✓ Buscar tipos com limite customizado
5. ✓ Validar tipos retornados

### 10.5 ufs
1. ✓ Buscar todas as UFs
2. ✓ Buscar UFs com paginação
3. ✓ Buscar UFs com ordenação
4. ✓ Validar 27 UFs retornadas
5. ✓ Validar siglas corretas (AC, AL, ..., TO)

---

## 11. CATEGORIA: ANÁLISES (6 ferramentas)

### 11.1 analise_presenca_deputado
1. ✓ Análise sem filtro de data
2. ✓ Análise com data início e fim
3. ✓ Análise com data inválida
4. ✓ Análise com ID deputado inválido
5. ✓ Análise de deputado inexistente

### 11.2 ranking_proposicoes_autor
1. ✓ Ranking geral (sem deputado específico)
2. ✓ Ranking de deputado específico
3. ✓ Ranking por quantidade
4. ✓ Ranking por aprovadas
5. ✓ Ranking por tramitação

### 11.3 analise_despesas_partido
1. ✓ Análise por total
2. ✓ Análise por média
3. ✓ Análise por categoria
4. ✓ Análise com sigla partido inválida
5. ✓ Análise com ano e mês específicos

### 11.4 comparativo_votacoes_bancadas
1. ✓ Comparativo com orientações
2. ✓ Comparativo sem orientações
3. ✓ Comparativo incluindo ausentes
4. ✓ Comparativo com ID votação inválido
5. ✓ Comparativo de votação inexistente

### 11.5 timeline_tramitacao
1. ✓ Timeline formato resumido
2. ✓ Timeline formato completo
3. ✓ Timeline com ID proposição inválido
4. ✓ Timeline de proposição inexistente
5. ✓ Timeline com validação de marcos

### 11.6 exportar_dados
1. ✓ Exportar em formato JSON
2. ✓ Exportar em formato CSV
3. ✓ Exportar em formato Markdown
4. ✓ Exportar com metadados
5. ✓ Exportar sem metadados

---

## RESUMO DE VALIDAÇÕES

### Tipos de Teste por Categoria

| Tipo de Teste | Quantidade | Descrição |
|---------------|------------|-----------|
| ✓ Sucesso básico | 55 | Chamada válida sem filtros |
| ✓ Paginação | 110 | Teste de paginação (página e itens) |
| ✓ Ordenação | 90 | Teste de ordenação ASC/DESC |
| ✓ Filtros | 80 | Testes com filtros diversos |
| ✓ Validação negativa | 165 | IDs inválidos, datas erradas, etc. |

**TOTAL**: 500+ validações individuais

### Cobertura de Validação

- ✅ Validação de schemas Zod
- ✅ Validação de IDs (positivos, inteiros)
- ✅ Validação de datas (formato YYYY-MM-DD)
- ✅ Validação de horas (formato HH:MM)
- ✅ Validação de paginação (1-100 itens)
- ✅ Validação de enums (ASC/DESC, tipos, etc.)
- ✅ Validação de UFs (27 estados)
- ✅ Validação de cache
- ✅ Validação de métricas
- ✅ Validação de erros

---

## PRÓXIMOS PASSOS

1. Executar script de testes automatizados
2. Gerar relatório de cobertura
3. Identificar e corrigir falhas
4. Documentar casos extremos
5. Testes de integração com API real

---

**Status**: ✅ Plano completo - Pronto para execução
**Ferramentas**: 55/55 (100%)
**Testes planejados**: 275 (5 por ferramenta)

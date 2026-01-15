# Limitações Conhecidas da API da Câmara dos Deputados

**Última atualização:** 15/01/2026

---

## Votos Individuais em Votações

### Problema

O endpoint `/votacoes/{id}/votos` da API da Câmara **não retorna dados para votações recentes**.

### Período Afetado

| Período | Status |
|---------|--------|
| Após maio de 2024 | ❌ Retorna array vazio `[]` |
| Antes de maio de 2024 | ✅ Dados disponíveis |

### Ferramentas Afetadas

- `votos_votacao` - Retorna 0 votos para votações recentes
- `historico_votos_deputado` - Não consegue encontrar participação do deputado em votações recentes

### Exemplo de Resposta da API

```json
// GET /votacoes/2589598-15/votos
{
  "dados": [],
  "links": [{
    "rel": "self",
    "href": "https://dadosabertos.camara.leg.br/api/v2/votacoes/2589598-15/votos"
  }]
}
```

### Comportamento Esperado

Quando a ferramenta `historico_votos_deputado` não encontrar votos:
- A resposta terá `periodo.votacoesComParticipacao: 0`
- O campo `votacoes` estará vazio
- Os campos de alinhamento mostrarão `0%`

### Recomendação para o Agente

Quando o resultado indicar 0 participações em votações recentes, o agente deve informar:

> "Os votos individuais das votações mais recentes ainda não estão disponíveis na API da Câmara dos Deputados. Isso é uma limitação temporária da fonte de dados. Posso buscar votações de períodos anteriores (até maio de 2024) se desejar."

### Verificação

Testado em 15/01/2026:
- Votação `2418084-8` (fev/2024): ✅ 412 votos disponíveis
- Votação `2589598-15` (jan/2025): ❌ 0 votos

---

## Outras Limitações Conhecidas

### Rate Limiting

A API da Câmara pode retornar erro 429 se muitas requisições forem feitas em sequência.
- **Mitigação:** O MCP usa cache e batching para reduzir chamadas.

### Dados de Tramitação

Algumas tramitações antigas podem não ter todos os campos preenchidos.
- **Mitigação:** Usar `resumo_tramitacao_proposicao` que lida com campos ausentes.

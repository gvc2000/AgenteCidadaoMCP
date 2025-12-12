# Otimização do Agente Fiscal - Redução de Payload

## 🎯 Problema Identificado

O **Agente Fiscal** no n8n estava recebendo erros de overflow de contexto ao consultar despesas parlamentares devido ao **volume excessivo de dados** retornados pela tool `despesas_deputado`.

### Causa Raiz
- Cada despesa possui **18+ campos** (incluindo URLs, CPF/CNPJ, códigos, valores formatados duplicados, etc.)
- Com `itens=100`, retornava **~2000+ campos** no JSON
- Causava erro `"Cannot read properties of undefined (reading 'nodeName')"` no n8n

---

## ✅ Soluções Implementadas

### 1. **Nova Tool: `resumo_despesas_deputado`** ⭐ RECOMENDADA

**Arquivo:** `src/tools/deputados/resumo-despesas.ts`

**O que faz:**
- Retorna **agregações** ao invés de lista completa de documentos
- Agrupa despesas por **tipo** (Passagens, Combustíveis, etc.)
- Mostra **Top 10 maiores gastos**
- Calcula **totais e médias**

**Exemplo de uso:**
```typescript
resumo_despesas_deputado({
  id: 204534,
  ano: 2024
})
```

**Resposta:**
```json
{
  "resumo": {
    "totalGeral": 250000.50,
    "totalGeralFormatado": "R$ 250.000,50",
    "totalDocumentos": 156,
    "mediaGasto": 1602.56,
    "periodo": "2024"
  },
  "porTipo": [
    {
      "tipoDespesa": "PASSAGEM AÉREA",
      "quantidade": 45,
      "valorTotal": 120000.00,
      "maiorGasto": 5000.00
    },
    // ... outros tipos ordenados por valor
  ],
  "maioresGastos": [
    {
      "data": "2024-11-15",
      "tipoDespesa": "PASSAGEM AÉREA",
      "fornecedor": "GOL LINHAS AÉREAS",
      "valor": 5000.00
    },
    // ... top 10
  ]
}
```

**Redução de payload:** ~90% comparado com `despesas_deputado(itens=100)`

---

### 2. **Modo Resumido em `despesas_deputado`**

**Parâmetro adicionado:** `formato: 'resumido' | 'completo'`

**Uso:**
```typescript
despesas_deputado({
  id: 204534,
  ano: 2024,
  itens: 50,
  formato: 'resumido'  // 👈 NOVO
})
```

**Campos retornados no modo resumido (6 campos):**
- `ano`
- `mes`
- `tipoDespesa`
- `dataDocumento`
- `valorLiquido`
- `nomeFornecedor`

**Redução de payload:** ~70% comparado com modo `completo`

---

## 📊 Comparativo de Payload

| Tool | Itens | Modo | Campos Totais | Tamanho Estimado |
|------|-------|------|---------------|------------------|
| `despesas_deputado` | 100 | completo | ~1800 | ~200 KB |
| `despesas_deputado` | 100 | resumido | ~600 | ~60 KB |
| `despesas_deputado` | 25 | resumido | ~150 | ~15 KB |
| `resumo_despesas_deputado` | N/A | N/A | ~50 | ~5 KB |

---

## 🔧 Recomendações para o Workflow n8n

### ✅ Atualizar MCP Client2 (Agente Fiscal)

**Antes:**
```json
"includeTools": [
  "buscar_deputados",
  "despesas_deputado",
  "detalhar_deputado",
  "analise_despesas_partido"
]
```

**Depois (RECOMENDADO):**
```json
"includeTools": [
  "buscar_deputados",
  "resumo_despesas_deputado",  // 👈 TROCAR por esta
  "detalhar_deputado",
  "analise_despesas_partido"
]
```

### ✅ Atualizar System Prompt do Agente Fiscal

**Adicionar ao prompt:**
```
## FERRAMENTAS DISPONÍVEIS

- buscar_deputados: Busca deputados por nome (sempre use primeiro)
- resumo_despesas_deputado: RESUMO OTIMIZADO de despesas (USE ESTA!)
  - Retorna agregações por tipo, top 10 maiores gastos, totais
  - Muito mais leve que despesas_deputado
- despesas_deputado: Lista detalhada (evite, pode causar overflow)
  - Use apenas se precisar de TODOS os documentos
  - Se usar, especifique formato='resumido' e itens <= 25
- analise_despesas_partido: Análise por partido

## PROTOCOLO

1. Use buscar_deputados(nome="Nome") para obter ID
2. Use resumo_despesas_deputado(id=ID, ano=2024) para visão geral
3. Se precisar de detalhes específicos, use despesas_deputado com:
   - formato='resumido'
   - itens <= 25
   - Filtros específicos (mes, tipoDespesa)
```

---

## 🧪 Testes

### Testar nova tool:

```bash
# Build
npm run build

# Testar via MCP
echo '{
  "jsonrpc":"2.0",
  "id":1,
  "method":"tools/call",
  "params":{
    "name":"resumo_despesas_deputado",
    "arguments":{
      "id": 204534,
      "ano": 2024
    }
  }
}' | node dist/server.js
```

### Testar modo resumido:

```bash
echo '{
  "jsonrpc":"2.0",
  "id":1,
  "method":"tools/call",
  "params":{
    "name":"despesas_deputado",
    "arguments":{
      "id": 204534,
      "ano": 2024,
      "itens": 25,
      "formato": "resumido"
    }
  }
}' | node dist/server.js
```

---

## 📝 Checklist de Deploy

- [x] Criar `resumo_despesas_deputado`
- [x] Adicionar parâmetro `formato` em `despesas_deputado`
- [x] Atualizar exports em `deputados/index.ts`
- [x] Atualizar contagem de tools em `CLAUDE.md`
- [x] Testar compilação (`npm run build`)
- [ ] Deploy no Railway
- [ ] Atualizar workflow n8n:
  - [ ] Atualizar lista de tools do MCP Client2
  - [ ] Atualizar system prompt do Agente Fiscal
- [ ] Testar com pergunta real que causava erro

---

## 🎯 Resultado Esperado

Com estas otimizações, o **Agente Fiscal** deve:

1. ✅ Responder perguntas sobre despesas SEM overflow
2. ✅ Retornar informações úteis e agregadas
3. ✅ Processar mais rápido (menos dados = menos latência)
4. ✅ Custar menos tokens no LLM

### Exemplo de Pergunta que antes causava erro:

**Pergunta:** "Quanto Nikolas Ferreira gastou em 2024?"

**Antes:** ❌ Erro de overflow (tentava carregar 100+ documentos completos)

**Depois:** ✅ Resposta rápida com resumo:
```
Total gasto em 2024: R$ 285.432,10
Principais categorias:
- Passagens Aéreas: R$ 120.540,00 (45 documentos)
- Combustíveis: R$ 48.230,50 (38 documentos)
- Divulgação: R$ 65.000,00 (22 documentos)
...
```

---

## 🔄 Próximos Passos (Futuro)

Se o problema persistir mesmo com `resumo_despesas_deputado`, considere:

1. **Streaming de respostas** no n8n (processar dados em chunks)
2. **Limitar período padrão** (ex: últimos 3 meses ao invés de ano todo)
3. **Cache adicional** no lado do n8n
4. **Usar modelo com contexto maior** (ex: Claude Opus ao invés de Sonnet)

---

**Data:** 2025-12-12
**Versão MCP:** 1.0.0
**Status:** ✅ Implementado, aguardando deploy

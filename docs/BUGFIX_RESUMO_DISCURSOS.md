# 🐛 Bugfix: resumo_discursos_deputado

**Data:** 2025-12-13
**Versão:** 1.1.0
**Commits:** 98a367a, 1c7fb14

---

## Problema Identificado

Ao testar a ferramenta `resumo_discursos_deputado` recém-implementada, foram encontrados erros de **400 Bad Request** da API da Câmara dos Deputados.

### Erro 1: Parâmetro `ano` não suportado

```
API Error: Bad Request
Parâmetro(s) inválido(s): ano
```

**Causa:** A API do endpoint `/deputados/{id}/discursos` não aceita o parâmetro `ano`, apenas `dataInicio` e `dataFim`.

### Erro 2: Parâmetro `keywords` enviado para API

```
API Error: Bad Request
Parâmetro(s) inválido(s): keywords
```

**Causa:** O parâmetro `keywords` estava sendo enviado para a API, mas ela não suporta busca por palavras-chave. Esse parâmetro deve ser usado apenas para **filtro local** dos resultados.

---

## Solução Implementada

### 1. Removido parâmetro `ano` do schema

**Arquivo:** `src/tools/deputados/resumo-discursos.ts`

```typescript
// ❌ ANTES
const ResumoDiscursosSchema = z.object({
  id: IdSchema,
  ano: AnoSchema.optional(),  // ← Parâmetro inválido
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  keywords: z.string().optional()
});

// ✅ DEPOIS
const ResumoDiscursosSchema = z.object({
  id: IdSchema,
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  keywords: z.string().optional()
});
```

### 2. Keywords usado apenas para filtro local

```typescript
// Extrair keywords ANTES de enviar para API
const { id, keywords, ...queryParams } = validated;

// API call - keywords NÃO enviado
const response = await camaraAPI.getWithPagination(
  `/deputados/${id}/discursos`,
  { ...queryParams, itens: 100 }  // Apenas dataInicio, dataFim
);

// Filtro local DEPOIS de receber dados
if (keywords) {
  const keywordsLower = keywords.toLowerCase();
  discursosParaDestacar = discursos.filter((d: any) => {
    const texto = (d.transcricao || d.sumario || '').toLowerCase();
    return texto.includes(keywordsLower);
  });
}
```

### 3. Atualizado PROMPT_AGENTE_POLITICO_V2.md

Todas as referências a `ano` foram substituídas por `dataInicio/dataFim`:

```markdown
# ❌ ANTES
resumo_discursos_deputado(id=ID, ano=2024)

# ✅ DEPOIS
resumo_discursos_deputado(id=ID, dataInicio="2024-01-01", dataFim="2024-12-31")
```

---

## Testes Realizados

### ✅ Teste 1: Período específico
```javascript
resumoDiscursosDeputado({
  id: 220593,
  dataInicio: '2024-01-01',
  dataFim: '2024-12-31'
})
// ✅ Retorna 25 discursos
// ✅ Período: "2024-01-01 a 2024-12-31"
```

### ✅ Teste 2: Com filtro por keywords (local)
```javascript
resumoDiscursosDeputado({
  id: 220593,
  dataInicio: '2024-01-01',
  dataFim: '2024-12-31',
  keywords: 'eleição'
})
// ✅ Analisa 25 discursos
// ✅ Filtra e retorna apenas 1 discurso sobre "eleição"
// ✅ Metadata mostra: "Filtrado por palavras-chave: 'eleição'. Total antes do filtro: 25"
```

### ✅ Teste 3: Sem período
```javascript
resumoDiscursosDeputado({ id: 220593 })
// ✅ Retorna 0 discursos (sem filtro de período, pode não haver dados antigos)
// ✅ Período: "Período consultado"
```

---

## Arquivos Modificados

1. `src/tools/deputados/resumo-discursos.ts`
   - Removido `AnoSchema` do import
   - Removido `ano` do schema
   - Adicionado extração de `keywords` antes de query params
   - Atualizado referências de `validated.keywords` para `keywords`
   - Atualizado lógica de formatação do período

2. `docs/n8n/PROMPT_AGENTE_POLITICO_V2.md`
   - Substituído todas as referências de `ano` por `dataInicio/dataFim`
   - Atualizado exemplos de uso
   - Atualizado tabela de parâmetros

---

## Lições Aprendidas

### 1. Sempre verificar documentação da API
A API Dados Abertos da Câmara tem **parâmetros específicos** por endpoint. Nem todos os endpoints aceitam os mesmos filtros.

### 2. Diferenciar parâmetros de API vs. parâmetros de filtro local
- **Parâmetros de API:** Enviados na query string, validados pelo servidor
- **Parâmetros de filtro local:** Usados após receber dados, processados no servidor MCP

### 3. Testar com API real antes do deploy
Testes com curl/Postman ajudam a validar parâmetros aceitos pela API antes de implementar.

---

## Endpoint Correto da API

```
GET /deputados/{id}/discursos

Parâmetros aceitos:
✅ dataInicio (YYYY-MM-DD)
✅ dataFim (YYYY-MM-DD)
✅ ordenarPor (dataHoraInicio)
✅ ordem (ASC | DESC)
✅ pagina (número)
✅ itens (1-100)

❌ ano (NÃO suportado)
❌ keywords (NÃO suportado)
```

**Documentação oficial:**
https://dadosabertos.camara.leg.br/swagger/api.html#api-Deputados-deputadosIdDiscursosGet

---

**Status:** ✅ Corrigido e testado
**Commits:**
- `98a367a` - Removido parâmetro 'ano' não suportado pela API
- `1c7fb14` - Corrigir tratamento do parâmetro keywords

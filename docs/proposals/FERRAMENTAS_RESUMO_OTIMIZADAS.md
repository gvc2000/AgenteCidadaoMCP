# 📊 Proposta: Ferramentas de Resumo Otimizadas

## Problema Identificado

Várias tools retornam **grandes volumes de dados** que podem causar:
- ⚠️ **Overflow de contexto** em agentes LLM
- ⚠️ **Lentidão** no processamento
- ⚠️ **Custos elevados** de tokens
- ⚠️ **Respostas incompletas** ou truncadas

## Análise de Tools com Alto Volume de Dados

### 1. 🎤 **Discursos de Deputado** (ALTA PRIORIDADE)

**Situação Atual:**
```typescript
// discursos_deputado
// Retorna até 100 discursos completos por página
// Cada discurso pode ter milhares de caracteres
```

**Problemas:**
- Discursos podem ter textos muito longos (10.000+ caracteres cada)
- Volume total pode facilmente exceder 100.000+ caracteres
- Dificulta análise por agentes LLM

**Solução Proposta:** `resumo_discursos_deputado`

**Retornaria:**
```json
{
  "resumo": {
    "totalDiscursos": 45,
    "periodo": "2024",
    "palavrasChave": ["educação", "saúde", "economia"]
  },
  "porTema": [
    {
      "tema": "Educação",
      "quantidade": 12,
      "primeiraData": "2024-01-15",
      "ultimaData": "2024-11-20"
    }
  ],
  "discursosDestaque": [
    {
      "data": "2024-11-20",
      "resumo": "Defesa do FUNDEB (150 palavras)",
      "palavrasChave": ["FUNDEB", "educação básica"],
      "tipoDiscurso": "Grande Expediente"
    }
  ],
  "_metadata": {
    "observacao": "Use discursos_deputado com filtros específicos para ver textos completos"
  }
}
```

---

### 2. 📜 **Tramitações de Proposição** (MÉDIA PRIORIDADE)

**Situação Atual:**
```typescript
// tramitacoes_proposicao
// Retorna todas as tramitações de uma proposição
// Proposições antigas podem ter 100+ tramitações
```

**Problemas:**
- Proposições com anos de tramitação têm centenas de registros
- Informações repetitivas (muitos "despachos" similares)
- Dificulta identificar os eventos-chave

**Solução Proposta:** `resumo_tramitacao_proposicao`

**Retornaria:**
```json
{
  "resumo": {
    "totalTramitacoes": 127,
    "dataApresentacao": "2020-03-15",
    "ultimaMovimentacao": "2024-11-28",
    "tempoTramitacao": "4 anos, 8 meses",
    "statusAtual": "Aguardando votação em plenário"
  },
  "eventosChave": [
    {
      "data": "2020-03-15",
      "tipo": "Apresentação",
      "descricao": "PL apresentado na Câmara",
      "orgao": "Mesa Diretora"
    },
    {
      "data": "2021-05-10",
      "tipo": "Aprovação em Comissão",
      "descricao": "Aprovado na CCJ",
      "orgao": "CCJ"
    },
    {
      "data": "2024-11-28",
      "tipo": "Inclusão em Pauta",
      "descricao": "Incluído na pauta do plenário",
      "orgao": "Plenário"
    }
  ],
  "comissoes": [
    { "sigla": "CCJ", "status": "Aprovado", "data": "2021-05-10" },
    { "sigla": "CFT", "status": "Aprovado", "data": "2022-08-15" }
  ],
  "_metadata": {
    "observacao": "Use tramitacoes_proposicao com dataInicio/dataFim para detalhes de período específico"
  }
}
```

---

### 3. 📅 **Eventos de Deputado** (BAIXA PRIORIDADE)

**Situação Atual:**
```typescript
// eventos_deputado
// Retorna até 100 eventos por página
```

**Menos Crítico:**
- Volume moderado
- Eventos não têm textos muito longos
- Já tem paginação eficaz

**Solução Alternativa:** Melhorar descrição da tool existente para recomendar filtros de data.

---

### 4. 🗳️ **Votos em Votação** (BAIXA PRIORIDADE)

**Situação Atual:**
```typescript
// votos_votacao
// Retorna 513 deputados com seus votos
```

**Menos Crítico:**
- Volume fixo (513 deputados)
- Dados compactos (apenas nome + voto)
- Útil ter lista completa para análises

**Solução:** Manter como está.

---

## Prioridade de Implementação

### 🔴 Alta Prioridade (Implementar JÁ)

1. **`resumo_discursos_deputado`**
   - **Razão:** Discursos são textos muito longos
   - **Impacto:** Resolve overflow crítico no Agente Político
   - **Esforço:** Médio (similar a `resumo_despesas_deputado`)

### 🟡 Média Prioridade (Próxima Sprint)

2. **`resumo_tramitacao_proposicao`**
   - **Razão:** Tramitações longas causam overflow
   - **Impacto:** Melhora experiência no Agente Legislativo
   - **Esforço:** Médio

### 🟢 Baixa Prioridade (Backlog)

3. **Melhorar docs das tools existentes**
   - Adicionar exemplos de uso otimizado
   - Recomendar filtros de data/período

---

## Implementação Recomendada

### 1. `resumo_discursos_deputado`

**Arquivo:** `src/tools/deputados/resumo-discursos.ts`

**Schema de Entrada:**
```typescript
const ResumoDiscursosSchema = z.object({
  id: IdSchema,
  ano: AnoSchema.optional(),
  dataInicio: DateSchema.optional(),
  dataFim: DateSchema.optional(),
  keywords: z.string().optional()
});
```

**Lógica de Agregação:**

1. **Buscar todos os discursos** do período (itens=100, paginação automática se necessário)
2. **Categorizar por tema** (análise de palavras-chave no texto)
3. **Extrair estatísticas:**
   - Total de discursos
   - Distribuição por tipo (Grande Expediente, Pequeno Expediente, etc.)
   - Temas mais frequentes
4. **Selecionar discursos-destaque:**
   - 5-10 discursos mais relevantes (se keywords fornecidas)
   - Resumir cada um em ~150 palavras
   - Incluir metadados (data, tipo, tema)

**Benefícios:**
- ✅ Reduz volume de ~500KB para ~50KB
- ✅ Mantém informação relevante
- ✅ Permite análise eficiente por agentes

---

### 2. `resumo_tramitacao_proposicao`

**Arquivo:** `src/tools/proposicoes/resumo-tramitacao.ts`

**Lógica de Agregação:**

1. **Buscar todas as tramitações**
2. **Identificar eventos-chave:**
   - Apresentação
   - Designação de relatores
   - Aprovações/Rejeições em comissões
   - Inclusão em pauta
   - Votações
   - Sanções/Vetos
3. **Criar timeline resumida:**
   - Máximo 10-15 eventos mais importantes
   - Descartar movimentações administrativas repetitivas
4. **Estatísticas:**
   - Tempo em cada comissão
   - Status atual
   - Tempo total de tramitação

**Benefícios:**
- ✅ Reduz volume de ~200 tramitações para ~15 eventos-chave
- ✅ Facilita compreensão do histórico
- ✅ Identifica gargalos e marcos importantes

---

## Estrutura de Código Compartilhada

### Utilitário de Resumo de Texto

**Arquivo:** `src/utils/text-summarizer.ts`

```typescript
export interface ResumoTextoOptions {
  textoCompleto: string;
  maxPalavras: number;
  preservarInicio?: boolean; // Manter início do texto
}

export function resumirTexto(options: ResumoTextoOptions): string {
  // Lógica de resumo:
  // 1. Se texto cabe no limite, retornar completo
  // 2. Caso contrário, truncar de forma inteligente:
  //    - Preservar frases completas
  //    - Adicionar "..." ao final
  //    - Se preservarInicio=true, manter primeiro parágrafo
}

export function extrairPalavrasChave(texto: string, limite = 10): string[] {
  // Análise de frequência (TF-IDF simplificado)
  // Remover stopwords
  // Retornar palavras mais relevantes
}

export function categorizarPorTema(textos: string[]): Map<string, number> {
  // Agrupar textos por tema detectado
  // Retornar distribuição
}
```

---

## Padrão de Nomenclatura

Seguir o padrão já estabelecido:

- ✅ **Tool original:** `discursos_deputado` → retorna lista completa
- ✅ **Tool otimizada:** `resumo_discursos_deputado` → retorna agregações

**Descrição clara na tool:**
```typescript
description: `Retorna um RESUMO OTIMIZADO dos discursos de um deputado.

Ao invés de retornar o texto completo de todos os discursos (que pode exceder 100.000 caracteres),
retorna:
- Estatísticas (total, distribuição por tema)
- 5-10 discursos-destaque resumidos
- Palavras-chave mais frequentes

Use esta ferramenta preferencialmente para visão geral.
Use 'discursos_deputado' apenas se precisar ler textos completos.`
```

---

## Atualização da Documentação

### Atualizar CLAUDE.md

Adicionar na tabela de tools:

```markdown
| **Deputados** | `resumo_discursos_deputado` | ⭐ Resumo otimizado de discursos (evita overflow) |
```

### Atualizar Prompts dos Agentes n8n

**Agente Político:**
```markdown
### Ferramentas de Discursos:
- `resumo_discursos_deputado` - ⭐ PREFERENCIAL para visão geral
- `discursos_deputado` - Apenas se precisar textos completos
```

**Agente Legislativo:**
```markdown
### Ferramentas de Tramitação:
- `resumo_tramitacao_proposicao` - ⭐ PREFERENCIAL para histórico resumido
- `tramitacoes_proposicao` - Apenas para análise detalhada de período específico
```

---

## Testes Necessários

### 1. Teste de Volume
```typescript
// Teste com deputado muito ativo (ex: Nikolas Ferreira)
// Verificar que resumo cabe em ~50KB
const resumo = await resumoDespesasDeputado({ id: 204534, ano: 2024 });
expect(JSON.stringify(resumo).length).toBeLessThan(50_000);
```

### 2. Teste de Relevância
```typescript
// Teste com keywords específicas
// Verificar que discursos destacados contêm as palavras-chave
const resumo = await resumoDiscursosDeputado({
  id: 204534,
  ano: 2024,
  keywords: 'educação'
});
expect(resumo.discursosDestaque.some(d => d.palavrasChave.includes('educação'))).toBe(true);
```

### 3. Teste de Performance
```typescript
// Tempo de resposta deve ser < 5s
const inicio = Date.now();
await resumoDiscursosDeputado({ id: 204534, ano: 2024 });
expect(Date.now() - inicio).toBeLessThan(5000);
```

---

## Outras Ferramentas de Resumo (Futuro)

### Possibilidades Adicionais:

1. **`resumo_proposicoes_tema`** - Agregação de proposições por tema
2. **`resumo_atuacao_comissao`** - Resumo de atuação em comissão específica
3. **`resumo_votacoes_deputado`** - Padrão de votação de um deputado
4. **`resumo_legislatura`** - Visão geral de uma legislatura completa

---

## Próximos Passos

### Fase 1: Implementação Core (1-2 dias)
- [ ] Implementar `resumo_discursos_deputado`
- [ ] Criar utilitários de resumo de texto (`text-summarizer.ts`)
- [ ] Testes unitários

### Fase 2: Integração n8n (0.5 dia)
- [ ] Adicionar tool ao Agente Político
- [ ] Atualizar prompt do Agente Político
- [ ] Testar workflow completo

### Fase 3: Segunda Tool (1-2 dias)
- [ ] Implementar `resumo_tramitacao_proposicao`
- [ ] Adicionar ao Agente Legislativo
- [ ] Atualizar documentação

### Fase 4: Documentação (0.5 dia)
- [ ] Atualizar CLAUDE.md
- [ ] Atualizar SISTEMA_MULTI_AGENTES.md
- [ ] Exemplos práticos

---

## Conclusão

A criação de ferramentas de resumo otimizadas é **ESSENCIAL** para o bom funcionamento do sistema multi-agente, especialmente para:

1. ✅ **Discursos** - Volume muito alto de texto
2. ✅ **Tramitações** - Históricos longos e repetitivos

O padrão já estabelecido com `resumo_despesas_deputado` funciona muito bem e deve ser replicado.

**Recomendação:** Começar com `resumo_discursos_deputado` imediatamente, pois resolve o problema mais crítico do Agente Político.

---

**Autor:** Claude Code
**Data:** 2025-12-13
**Status:** Proposta para Implementação

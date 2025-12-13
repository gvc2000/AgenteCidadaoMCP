# 💰 Otimização de Custos: Apenas Claude (Anthropic)

**Data:** 2025-12-13
**Objetivo:** Reduzir custos usando apenas modelos Claude

---

## 📊 Família Claude - Preços (Dezembro 2025)

| Modelo | Input ($/1M) | Output ($/1M) | Total* | Velocidade | Contexto |
|--------|-------------|---------------|--------|------------|----------|
| **Claude Opus 4.5** | $15.00 | $75.00 | $90.00 | Lenta | 200K |
| **Claude Sonnet 4.5** | $3.00 | $15.00 | $18.00 | Média | 200K |
| **Claude Haiku 3.5** | $1.00 | $5.00 | $6.00 | Rápida | 200K |

\* Estimativa para 1M input + 1M output

**Fonte:** [Anthropic Pricing](https://www.anthropic.com/pricing)

---

## 🎯 Estratégia: Use Haiku para TUDO (exceto casos especiais)

### Por que Haiku funciona para seus agentes:

1. ✅ **Ferramentas MCP fazem o trabalho pesado**
   - Dados já vêm estruturados e filtrados
   - Agentes fazem principalmente formatação
   - Não precisam de raciocínio profundo

2. ✅ **Haiku é subestimado**
   - Excelente para tool calling
   - Rápido e preciso em tarefas estruturadas
   - Janela de contexto de 200K (mesmo que Sonnet)

3. ✅ **Economia significativa**
   - **67% mais barato** que Sonnet
   - **93% mais barato** que Opus

---

## 🎯 Recomendações por Agente (Somente Claude)

### 1. **Orquestrador** - Classificação e Roteamento

**Atual:** GPT-4o mini ($0.75) ✅
**Recomendação Claude:** **Claude Haiku 3.5** ($6.00)

⚠️ **ATENÇÃO:** Haiku é **8x mais caro** que GPT-4o mini!

**Decisão sugerida:**
- Se **só quer Claude**: use Haiku
- Se **aceita OpenAI**: mantenha GPT-4o mini (muito mais econômico)

```json
{
  "model": "claude-3-5-haiku-20241022",
  "max_tokens": 500,
  "temperature": 0.1
}
```

---

### 2. **Agente Legislativo** - Buscar e listar proposições

**Atual:** Claude Sonnet 4.5 ($18.00) ⚠️
**Recomendação:** **Claude Haiku 3.5** ($6.00)

**Justificativa:**
- ✅ Tarefa estruturada (buscar → formatar listas)
- ✅ MCP tools retornam dados prontos
- ✅ Não precisa de análise profunda
- ✅ **Economia: 67%** (de $18 para $6)

**Configuração:**
```json
{
  "model": "claude-3-5-haiku-20241022",
  "max_tokens": 4000,
  "temperature": 0.3
}
```

**Por que NÃO precisa de Sonnet:**
- Proposições vêm da API com ementa, autor, status
- Agente só organiza em lista/tabela
- Formatação é previsível

---

### 3. **Agente Político** - Perfil e atuação parlamentar

**Atual:** Claude Sonnet 4.5 ($18.00) ⚠️
**Recomendação:** **Claude Haiku 3.5** ($6.00)

**Justificativa:**
- ✅ Dados estruturados das tools MCP
- ✅ Apresentação de perfil (não análise subjetiva)
- ✅ Listas de comissões, frentes, discursos
- ✅ **Economia: 67%** (de $18 para $6)

**Configuração:**
```json
{
  "model": "claude-3-5-haiku-20241022",
  "max_tokens": 3500,
  "temperature": 0.4
}
```

**Quando considerar Sonnet:**
- Se precisar análise de tom/personalidade do deputado
- Se precisar comparações subjetivas entre deputados
- **Para seu caso: Haiku é suficiente**

---

### 4. **Agente Fiscal** - Análise de despesas

**Atual:** Claude Sonnet 4.5 ($18.00) ⚠️
**Recomendação:** **Claude Haiku 3.5** ($6.00)

**Justificativa:**
- ✅ Tool `resumo_despesas_deputado` já agrega dados
- ✅ Cálculos simples (totais, percentuais)
- ✅ Formatação de tabelas
- ✅ **Economia: 67%** (de $18 para $6)

**Configuração:**
```json
{
  "model": "claude-3-5-haiku-20241022",
  "max_tokens": 3000,
  "temperature": 0.3
}
```

**Haiku é ótimo para:**
- Aritmética básica
- Comparações numéricas
- Formatação de dados financeiros

---

### 5. **Sintetizador** - Consolidação final

**Atual:** Gemini Flash ($0.75) ✅
**Recomendação Claude:** **Claude Haiku 3.5** ($6.00)

⚠️ **ATENÇÃO:** Haiku é **8x mais caro** que Gemini Flash!

**Decisão sugerida:**
- Se **só quer Claude**: use Haiku
- Se **aceita Google**: mantenha Gemini Flash (muito mais econômico)

```json
{
  "model": "claude-3-5-haiku-20241022",
  "max_tokens": 4000,
  "temperature": 0.5
}
```

---

## 📈 Comparação de Custos

### Cenário 1: Atual (Mix)
| Agente | Modelo Atual | Custo/1M |
|--------|-------------|----------|
| Orquestrador | GPT-4o mini | $0.75 |
| Legislativo | Claude Sonnet | $18.00 |
| Político | Claude Sonnet | $18.00 |
| Fiscal | Claude Sonnet | $18.00 |
| Sintetizador | Gemini Flash | $0.75 |
| **TOTAL** | - | **$55.50** |

### Cenário 2: TUDO Claude Haiku
| Agente | Modelo | Custo/1M | Mudança |
|--------|--------|----------|---------|
| Orquestrador | **Claude Haiku** | $6.00 | +$5.25 ⚠️ |
| Legislativo | **Claude Haiku** | $6.00 | **-$12.00** ✅ |
| Político | **Claude Haiku** | $6.00 | **-$12.00** ✅ |
| Fiscal | **Claude Haiku** | $6.00 | **-$12.00** ✅ |
| Sintetizador | **Claude Haiku** | $6.00 | +$5.25 ⚠️ |
| **TOTAL** | - | **$30.00** | **-46%** |

**Economia: 46%** (de $55.50 para $30.00)

### Cenário 3: HÍBRIDO (Recomendado)
Haiku nos 3 agentes principais + mantém modelos econômicos onde já estão

| Agente | Modelo | Custo/1M | Mudança |
|--------|--------|----------|---------|
| Orquestrador | GPT-4o mini | $0.75 | - |
| Legislativo | **Claude Haiku** | $6.00 | **-$12.00** ✅ |
| Político | **Claude Haiku** | $6.00 | **-$12.00** ✅ |
| Fiscal | **Claude Haiku** | $6.00 | **-$12.00** ✅ |
| Sintetizador | Gemini Flash | $0.75 | - |
| **TOTAL** | - | **$19.50** | **-65%** |

**Economia: 65%** (de $55.50 para $19.50)

---

## 💡 Recomendação Final

### Se ABSOLUTAMENTE só quer Claude:

✅ **Use Claude Haiku 3.5 nos 3 agentes principais:**
- Agente Legislativo
- Agente Político
- Agente Fiscal

✅ **Mantenha modelos econômicos onde já estão:**
- Orquestrador: GPT-4o mini (8x mais barato)
- Sintetizador: Gemini Flash (8x mais barato)

**Resultado:**
- **Economia de 65%** (de $55.50 para $19.50)
- Mantém qualidade nos agentes principais
- Compatibilidade total com Claude

---

## 🔧 Implementação no n8n

### Para cada agente que vai usar Haiku:

**Node: AI Agent**

**Antes (Sonnet):**
```
Model: claude-sonnet-4-5-20250929
Max Tokens: 4096
Temperature: 0.7
```

**Depois (Haiku):**
```
Model: claude-3-5-haiku-20241022
Max Tokens: 3000-4000 (ajustar por agente)
Temperature: 0.3-0.5 (ajustar por agente)
```

### Configurações específicas:

**Agente Legislativo:**
```json
{
  "model": "claude-3-5-haiku-20241022",
  "max_tokens": 4000,
  "temperature": 0.3,
  "system": "PROMPT_AGENTE_LEGISLATIVO_V2"
}
```

**Agente Político:**
```json
{
  "model": "claude-3-5-haiku-20241022",
  "max_tokens": 3500,
  "temperature": 0.4,
  "system": "PROMPT_AGENTE_POLITICO_V2"
}
```

**Agente Fiscal:**
```json
{
  "model": "claude-3-5-haiku-20241022",
  "max_tokens": 3000,
  "temperature": 0.3,
  "system": "PROMPT_AGENTE_FISCAL"
}
```

---

## 🚀 Plano de Ação Faseado

### Fase 1: Teste Agente Fiscal (1 semana)
1. Trocar apenas **Agente Fiscal** para Haiku
2. Testar 50-100 requisições
3. Validar:
   - ✅ Cálculos corretos
   - ✅ Formatação de valores
   - ✅ Comparações de despesas
   - ✅ Tool calling funcionando

**Critérios de sucesso:**
- Respostas precisas (matemática)
- Formato consistente
- Sem erros de tool calling

### Fase 2: Agente Legislativo (1 semana)
1. Se Fase 1 OK → Trocar **Agente Legislativo**
2. Testar 50-100 requisições
3. Validar:
   - ✅ Listas completas de proposições
   - ✅ Formatação de tabelas
   - ✅ Informações corretas (número, ementa, autor)

**Critérios de sucesso:**
- Listas não truncadas
- Todas as proposições retornadas
- Formatação clara

### Fase 3: Agente Político (1 semana)
1. Se Fase 2 OK → Trocar **Agente Político**
2. Testar 50-100 requisições
3. Validar:
   - ✅ Perfis completos
   - ✅ Listas de comissões/frentes
   - ✅ Resumos de discursos

**Critérios de sucesso:**
- Perfis bem formatados
- Informações completas
- Estrutura consistente

### Fase 4: Consolidação
1. Monitorar custos (comparar com mês anterior)
2. Documentar economia real
3. Ajustar temperatures se necessário

---

## 🎯 Quando MANTER Sonnet

Considere manter Claude Sonnet 4.5 se:

❌ **Haiku falhar consistentemente em:**
- Tool calling complexo (múltiplas tools em sequência)
- Formatação de estruturas complexas
- Seguir instruções detalhadas do prompt

❌ **Precisar de:**
- Análise subjetiva (tom, sentimento)
- Comparações qualitativas
- Síntese criativa

**Para seu sistema:**
- ✅ Tool calling é **simples** (1-2 tools por vez)
- ✅ Formatação é **estruturada** (listas, tabelas)
- ✅ Prompts são **claros** e específicos
- **→ Haiku deve funcionar perfeitamente**

---

## 📊 Estimativa de Economia Real

**Exemplo prático:**

Se você processa **10 milhões de tokens/mês**:

**Cenário Atual:**
- 3 agentes × Sonnet ($18) = $54 × 10 = **$540/mês**
- 2 agentes × modelos econômicos = $7.50
- **Total: ~$547/mês**

**Com Haiku (híbrido recomendado):**
- 3 agentes × Haiku ($6) = $18 × 10 = **$180/mês**
- 2 agentes × modelos econômicos = $7.50
- **Total: ~$188/mês**

**Economia: $359/mês (65%)**

---

## 🔍 Comparação: Haiku vs. Alternativas

| Critério | Claude Haiku | GPT-4o mini | Gemini Flash |
|----------|-------------|-------------|--------------|
| **Custo/1M tokens** | $6.00 | $0.75 | $0.75 |
| **Velocidade** | Rápido | Muito rápido | Muito rápido |
| **Tool calling** | Excelente | Muito bom | Muito bom |
| **Contexto** | 200K | 128K | 1M |
| **Família** | Claude ✅ | OpenAI | Google |

**Conclusão:**
- Se **só Claude**: Haiku é a escolha certa
- Se **aceita outras**: GPT-4o mini/Gemini Flash economizam **8x mais**

---

## ✅ Checklist de Implementação

### Preparação:
- [ ] Backup configuração n8n atual
- [ ] Documentar custos atuais (baseline)
- [ ] Definir métricas de qualidade

### Fase 1 - Agente Fiscal:
- [ ] Atualizar node para Haiku
- [ ] Testar 10 requisições manualmente
- [ ] Validar cálculos e formatação
- [ ] Monitorar 100 requisições em produção
- [ ] Comparar custos

### Fase 2 - Agente Legislativo:
- [ ] Se Fase 1 OK → Atualizar para Haiku
- [ ] Testar listas de proposições
- [ ] Validar formatação de tabelas
- [ ] Monitorar 100 requisições

### Fase 3 - Agente Político:
- [ ] Se Fase 2 OK → Atualizar para Haiku
- [ ] Testar perfis de deputados
- [ ] Validar listas de comissões
- [ ] Monitorar 100 requisições

### Consolidação:
- [ ] Calcular economia real (mês completo)
- [ ] Documentar configuração final
- [ ] Ajustar temperatures se necessário
- [ ] Estabelecer monitoramento contínuo

---

## 🎉 Resumo Executivo

**Se você quer usar APENAS Claude:**

✅ **Troque os 3 agentes principais para Claude Haiku 3.5**
- Legislativo: Sonnet → Haiku
- Político: Sonnet → Haiku
- Fiscal: Sonnet → Haiku

✅ **Mantenha modelos econômicos onde já estão**
- Orquestrador: GPT-4o mini (ou troque para Haiku se obrigatório)
- Sintetizador: Gemini Flash (ou troque para Haiku se obrigatório)

**Resultado:**
- **Economia de 65%** (configuração híbrida)
- **Economia de 46%** (100% Claude)
- Qualidade mantida
- Velocidade melhorada (Haiku é mais rápido)

**Tempo de implementação:** 3 semanas
**Risco:** Baixo (rollback fácil se necessário)
**ROI:** Imediato

---

**Última atualização:** 2025-12-13
**Revisão:** Mensal

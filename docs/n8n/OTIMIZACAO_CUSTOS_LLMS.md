# 💰 Otimização de Custos: Seleção de LLMs por Agente

**Data:** 2025-12-13
**Objetivo:** Reduzir custos mantendo qualidade nas respostas

---

## 📊 Comparação de Preços (Dezembro 2025)

| Modelo | Input ($/1M tokens) | Output ($/1M tokens) | Total Típico* |
|--------|---------------------|----------------------|---------------|
| **GPT-4o mini** | $0.15 | $0.60 | $0.75 |
| **Gemini 2.0 Flash** | $0.15 | $0.60 | $0.75 |
| **Claude Haiku 3.5** | $1.00 | $5.00 | $6.00 |
| **Claude Sonnet 4.5** | $3.00 | $15.00 | $18.00 |
| **GPT-4o** | $2.50 | $10.00 | $12.50 |

\* Estimativa para 1M input + 1M output

**Fontes de preços:**
- [LLM API Pricing Comparison 2025](https://intuitionlabs.ai/articles/llm-api-pricing-comparison-2025)
- [Claude Haiku vs GPT-4o mini vs Gemini Flash](https://skywork.ai/blog/claude-haiku-4-5-vs-gpt4o-mini-vs-gemini-flash-vs-mistral-small-vs-llama-comparison/)
- [OpenAI Pricing](https://openai.com/api/pricing/)

---

## 🎯 Recomendações por Agente

### 1. **Orquestrador** - Tarefa: Classificação e Roteamento

**Atual:** GPT-4o mini ✅
**Recomendação:** **MANTER GPT-4o mini**

**Justificativa:**
- ✅ Tarefa simples (classificação de texto)
- ✅ Baixíssimo custo ($0.15 input / $0.60 output)
- ✅ Latência baixa
- ✅ Output pequeno (apenas decisão de roteamento)

**Alternativa:** Gemini 2.0 Flash (mesmo custo, similar performance)

**Economia potencial:** Já otimizado ✅

---

### 2. **Agente Legislativo** - Tarefa: Buscar e listar proposições

**Atual:** Claude Sonnet 4.5 ($3/$15) ⚠️
**Recomendação:** **TROCAR para Gemini 2.0 Flash**

**Justificativa:**
- ✅ Tarefa estruturada (buscar + formatar listas)
- ✅ Não requer raciocínio complexo
- ✅ Output grande (listas de proposições) → custo de output importa
- ✅ Gemini Flash tem 1M tokens de contexto
- ✅ **Redução de custo: 96% (de $18 para $0.75)**

**Configuração recomendada:**
```json
{
  "model": "gemini-2.0-flash-exp",
  "temperature": 0.3,
  "max_tokens": 4000
}
```

**Ganho estimado:**
- **96% de economia** em relação a Sonnet
- De ~$18/1M tokens para ~$0.75/1M tokens

---

### 3. **Agente Político** - Tarefa: Perfil e atuação parlamentar

**Atual:** Claude Sonnet 4.5 ($3/$15) ⚠️
**Recomendação:** **TROCAR para Gemini 2.0 Flash**

**Justificativa:**
- ✅ Tarefa de formatação e apresentação de dados
- ✅ Ferramentas MCP retornam dados estruturados
- ✅ Não requer análise profunda, apenas organização
- ✅ Output médio-grande (perfis, listas)
- ✅ **Redução de custo: 96% (de $18 para $0.75)**

**Configuração recomendada:**
```json
{
  "model": "gemini-2.0-flash-exp",
  "temperature": 0.4,
  "max_tokens": 3000
}
```

**Ganho estimado:**
- **96% de economia** em relação a Sonnet

---

### 4. **Agente Fiscal** - Tarefa: Análise de despesas

**Atual:** Claude Sonnet 4.5 ($3/$15) ⚠️
**Recomendação:** **TROCAR para GPT-4o mini OU Gemini 2.0 Flash**

**Justificativa:**
- ✅ Ferramenta `resumo_despesas_deputado` já faz agregações
- ✅ Agente precisa apenas formatar e apresentar
- ✅ Cálculos simples (percentuais, comparações)
- ✅ **Redução de custo: 96% (de $18 para $0.75)**

**Primeira opção: GPT-4o mini**
```json
{
  "model": "gpt-4o-mini",
  "temperature": 0.3,
  "max_tokens": 2500
}
```
- Excelente para matemática e formatação
- Consistência alta

**Segunda opção: Gemini 2.0 Flash**
```json
{
  "model": "gemini-2.0-flash-exp",
  "temperature": 0.3,
  "max_tokens": 2500
}
```
- Mesmo custo que GPT-4o mini
- Contexto maior (1M tokens)

**Ganho estimado:**
- **96% de economia** em relação a Sonnet

---

### 5. **Sintetizador** - Tarefa: Consolidação final

**Atual:** Gemini 2.5 Flash ✅
**Recomendação:** **MANTER Gemini 2.0/2.5 Flash**

**Justificativa:**
- ✅ Tarefa de síntese e formatação
- ✅ Pode receber output de múltiplos agentes (contexto grande)
- ✅ Já usa modelo econômico
- ✅ Output grande (resposta final completa)

**Configuração recomendada:**
```json
{
  "model": "gemini-2.0-flash-exp",
  "temperature": 0.5,
  "max_tokens": 4000
}
```

**Economia potencial:** Já otimizado ✅

---

## 📈 Resumo de Economia

### Configuração Atual
| Agente | Modelo Atual | Custo/1M tokens |
|--------|-------------|-----------------|
| Orquestrador | GPT-4o mini | $0.75 ✅ |
| Legislativo | Claude Sonnet 4.5 | $18.00 ⚠️ |
| Político | Claude Sonnet 4.5 | $18.00 ⚠️ |
| Fiscal | Claude Sonnet 4.5 | $18.00 ⚠️ |
| Sintetizador | Gemini Flash | $0.75 ✅ |
| **TOTAL** | - | **$55.50** |

### Configuração Recomendada
| Agente | Modelo Recomendado | Custo/1M tokens | Economia |
|--------|-------------------|-----------------|----------|
| Orquestrador | GPT-4o mini | $0.75 | - |
| Legislativo | **Gemini 2.0 Flash** | $0.75 | **-96%** |
| Político | **Gemini 2.0 Flash** | $0.75 | **-96%** |
| Fiscal | **GPT-4o mini** | $0.75 | **-96%** |
| Sintetizador | Gemini Flash | $0.75 | - |
| **TOTAL** | - | **$3.75** | **-93%** 🎉 |

### 💰 Economia Total: **93% de redução de custos**

**Exemplo prático:**
- Se você gasta R$ 1.000/mês atualmente
- Com as mudanças: **R$ 70/mês** (economia de R$ 930)

---

## 🔧 Implementação no n8n

### Passo 1: Atualizar nodes dos Agentes

Para cada **AI Agent** no n8n:

1. **Agente Legislativo**
   - Trocar de "Anthropic Chat Model" para "Google Gemini Chat Model"
   - Model: `gemini-2.0-flash-exp`
   - Temperature: `0.3`
   - Max Tokens: `4000`

2. **Agente Político**
   - Trocar de "Anthropic Chat Model" para "Google Gemini Chat Model"
   - Model: `gemini-2.0-flash-exp`
   - Temperature: `0.4`
   - Max Tokens: `3000`

3. **Agente Fiscal**
   - Trocar de "Anthropic Chat Model" para "OpenAI Chat Model"
   - Model: `gpt-4o-mini`
   - Temperature: `0.3`
   - Max Tokens: `2500`

### Passo 2: Testar gradualmente

**Estratégia conservadora:**
1. Começar com **Agente Fiscal** (mais previsível)
2. Depois **Agente Legislativo** (tarefa mais simples)
3. Por último **Agente Político**

**Monitorar:**
- Qualidade das respostas
- Erros de formatação
- Tool calling funcionando corretamente

### Passo 3: Rollback se necessário

Se algum agente perder qualidade:
- **Opção intermediária:** Claude Haiku 3.5 ($1/$5)
  - Custo: $6/1M tokens (67% mais barato que Sonnet)
  - Mantém capacidades do Claude
  - Ainda 8x mais caro que Gemini/GPT-4o mini

---

## 🎯 Quando NÃO trocar o modelo

### Mantenha Claude Sonnet 4.5 SE:
- ❌ Respostas precisarem de raciocínio complexo multi-step
- ❌ Análises subjetivas ou nuances linguísticas importantes
- ❌ Tool calling falhar com outros modelos
- ❌ Formatação consistente for crítica

### Para este sistema, PODE TROCAR porque:
- ✅ Ferramentas MCP retornam dados **estruturados**
- ✅ Agentes fazem **formatação**, não análise profunda
- ✅ Prompts são **claros e específicos**
- ✅ Outputs são **previsíveis** (listas, tabelas)

---

## 📊 Métricas para Monitorar

Após implementar as mudanças, acompanhe:

1. **Custo por requisição**
   - Antes vs. Depois
   - Por agente

2. **Qualidade das respostas**
   - Formatação correta?
   - Informações completas?
   - Tool calling funcionando?

3. **Latência**
   - Gemini Flash: geralmente mais rápido
   - GPT-4o mini: muito rápido

4. **Taxa de erro**
   - Tool calling failures
   - Parsing errors
   - Timeouts

---

## 🚀 Plano de Ação Recomendado

### Fase 1: Teste Controlado (1 semana)
1. Trocar **apenas Agente Fiscal** para GPT-4o mini
2. Monitorar 100 requisições
3. Validar qualidade das respostas

### Fase 2: Expansão (1 semana)
1. Se Fase 1 OK → Trocar **Agente Legislativo** para Gemini Flash
2. Monitorar mais 100 requisições
3. Comparar custos acumulados

### Fase 3: Otimização Total (1 semana)
1. Se Fase 2 OK → Trocar **Agente Político** para Gemini Flash
2. Monitorar produção completa
3. Ajustar temperatures se necessário

### Fase 4: Consolidação
1. Documentar configuração final
2. Estabelecer baseline de custos
3. Monitoramento contínuo

---

## 🔍 Alternativa Conservadora

Se preferir reduzir riscos, use **Claude Haiku 3.5** nos agentes:

| Agente | Modelo | Custo/1M | Economia vs Sonnet |
|--------|--------|----------|-------------------|
| Legislativo | Claude Haiku | $6.00 | **-67%** |
| Político | Claude Haiku | $6.00 | **-67%** |
| Fiscal | Claude Haiku | $6.00 | **-67%** |
| **TOTAL** | - | **$19.50** | **-65%** |

**Vantagens:**
- ✅ Mantém família Claude (comportamento similar)
- ✅ Tool calling consistente
- ✅ Ainda economiza 65%

**Desvantagens:**
- ⚠️ Ainda 8x mais caro que Gemini/GPT-4o mini
- ⚠️ Economia menor

---

## 📝 Checklist de Implementação

- [ ] Backup da configuração atual do n8n
- [ ] Criar credenciais Google Cloud (se usar Gemini)
- [ ] Testar Agente Fiscal com GPT-4o mini
- [ ] Validar formatação e qualidade
- [ ] Testar Agente Legislativo com Gemini Flash
- [ ] Testar Agente Político com Gemini Flash
- [ ] Comparar custos antes/depois (1 semana de dados)
- [ ] Ajustar temperatures se necessário
- [ ] Documentar configuração final
- [ ] Estabelecer monitoramento de custos

---

## 💡 Conclusão

**Recomendação principal: TROCAR os 3 agentes Claude Sonnet por modelos econômicos**

**Economia esperada:**
- **93% de redução** de custos totais
- De ~$55/1M tokens para ~$3.75/1M tokens
- **Sem perda significativa de qualidade** para estas tarefas

**Modelos recomendados:**
1. **Agente Fiscal:** GPT-4o mini (matemática + formatação)
2. **Agente Legislativo:** Gemini 2.0 Flash (listas + contexto grande)
3. **Agente Político:** Gemini 2.0 Flash (perfis + flexibilidade)

**ROI estimado:**
- Mudanças implementadas em **3 semanas**
- Economia mensal de **90%+** em custos de LLM
- Qualidade mantida para **tarefas estruturadas**

---

**Última atualização:** 2025-12-13
**Revisão recomendada:** Mensal (preços de API mudam)

# 🤖 Sistema Multi-Agentes - Agente Cidadão

## Visão Geral

O **Agente Cidadão** é um sistema de orquestração multi-agente implementado no n8n que utiliza o servidor MCP Câmara BR para fornecer respostas inteligentes e especializadas sobre a Câmara dos Deputados do Brasil.

### Arquitetura

```
Webhook → Orquestrador → Router → [Legislativo, Político, Fiscal] → Sintetizador → Resposta
```

## 🎯 Agentes Especializados

### 1. Orquestrador (GPT-4o-mini)
**Função:** Analisar a pergunta do usuário e decidir quais agentes especialistas acionar.

**Decisões:**
- Perguntas sobre **leis/proposições** → Agente Legislativo
- Perguntas sobre **deputados/partidos** → Agente Político
- Perguntas sobre **gastos/despesas** → Agente Fiscal
- Perguntas mistas → Múltiplos agentes

**Output:** JSON com lista de agentes a serem acionados
```json
{
  "agentes": ["legislativo", "fiscal"]
}
```

---

### 2. Agente Legislativo (Claude 3.5 Sonnet)
**Especialidade:** Proposições, projetos de lei, tramitações e votações.

**Ferramentas MCP:**
- `buscar_proposicoes` - Busca PLs, PECs, MPs
- `detalhar_proposicao` - Detalhes completos
- `tramitacoes_proposicao` - Histórico de tramitação
- `votacoes_proposicao` - Votações
- `buscar_votacoes` / `detalhar_votacao` / `votos_votacao` / `orientacoes_votacao`
- `ultimas_votacoes`
- `comparativo_votacoes_bancadas`
- `timeline_tramitacao`
- `ranking_proposicoes_autor`
- `sugerir_ferramentas` / `diagnosticar_consulta`
- `tipos_proposicao`
- `buscar_deputados` / `buscar_orgaos` (para contexto)

**Instruções Principais:**
- Lista **TODAS** as proposições encontradas (sem resumir)
- Formato de tabela ou lista numerada clara
- Informações: Número/Tipo, Ementa, Autor, Situação

**Exemplo de Resposta:**
```markdown
## 📋 Proposições sobre Educação em 2024

Encontrei 5 proposições:

1. **PL 1234/2024** - Dispõe sobre... (Dep. Fulano) - *Em tramitação*
2. **PL 5678/2024** - Altera a lei... (Dep. Ciclano) - *Arquivado*
```

---

### 3. Agente Político (Claude 3.5 Sonnet)
**Especialidade:** Perfil, biografia e atuação parlamentar.

**Ferramentas MCP:**
- `buscar_deputados` - Busca por nome/UF/partido
- `detalhar_deputado` - Perfil completo
- `profissoes_deputado` / `ocupacoes_deputado`
- `discursos_deputado` - Pronunciamentos
- `orgaos_deputado` - Comissões
- `frentes_deputado` - Frentes parlamentares
- `eventos_deputado` / `analise_presenca_deputado`
- `buscar_partidos` / `detalhar_partido` / `membros_partido` / `lideres_partido`
- `buscar_orgaos` / `membros_orgao`
- `mesa_legislatura` - Mesa Diretora
- `buscar_frentes` / `membros_frente`
- `ufs` / `tipos_orgao`

**Escopo:**
✅ Quem é o deputado (perfil, biografia, contato)
✅ De onde veio (UF, partido, profissão)
✅ O que fala (discursos)
✅ Onde participa (comissões, frentes)
❌ Gastos → Redireciona para Agente Fiscal
❌ Proposições → Redireciona para Agente Legislativo

**Protocolo:**
1. `buscar_deputados` → obter ID
2. `detalhar_deputado` / ferramentas específicas
3. Apresentar dados completos (não resumir listas)

---

### 4. Agente Fiscal (Claude 3.5 Sonnet)
**Especialidade:** Despesas parlamentares (CEAP - Cota para Exercício da Atividade Parlamentar).

**Ferramentas MCP:**
- `buscar_deputados` - **SEMPRE PRIMEIRO** (obter ID)
- `resumo_despesas_deputado` - ⭐ **FERRAMENTA PRINCIPAL** (otimizada contra overflow)
- `analise_despesas_partido` - Gastos agregados
- `detalhar_deputado` - Dados básicos (se necessário)
- `despesas_deputado` - ⚠️ Usar com cuidado (pode causar overflow)

**Ferramenta Destaque: `resumo_despesas_deputado`**
```json
{
  "id": 204534,
  "ano": 2024,
  "mes": 11
}
```
**Retorna:**
- ✅ Total gasto no período
- ✅ Agregação por tipo de despesa
- ✅ Top 10 maiores gastos
- ✅ Estatísticas (média, total de documentos)

**Protocolo:**
1. `buscar_deputados(nome)` → obter ID
2. `resumo_despesas_deputado(id, ano)` → visão geral otimizada
3. Apresentar com contexto (comparações quando possível)

**⚠️ Evitar Overflow:**
- **Preferir** `resumo_despesas_deputado` ao invés de `despesas_deputado`
- Se usar `despesas_deputado`: sempre com `formato='resumido'` e `itens <= 25`

**Escopo:**
✅ Despesas parlamentares (CEAP)
✅ Categorias de gastos
✅ Análises comparativas
✅ Gastos por partido
❌ Perfil do deputado → Agente Político
❌ Proposições → Agente Legislativo

---

### 5. Sintetizador (Gemini 2.5 Flash)
**Função:** Consolidar as análises dos agentes em uma resposta final unificada.

**Ferramentas:** Acesso a todas as tools MCP (para consultas adicionais se necessário)

**Responsabilidades:**
- Receber outputs de todos os agentes acionados
- Consolidar em formato Markdown bem estruturado
- Aplicar formatação consistente
- Garantir clareza e legibilidade

**Formatação Obrigatória:**
- Uso de `##` para títulos principais
- Uso de `###` para seções
- Separação visual com `---`
- Emojis apropriados
- **Fonte:** Câmara dos Deputados ao final

**Exemplo de Template:**
```markdown
## 📊 Atuação de [Nome do Deputado] em 2024

### 📜 Proposições sobre [Tema]

Encontrei **[N] proposições**:

#### PL [Número]/[Ano] - [Título]
- **Ementa:** [Texto]
- **Status:** [Status]

---

### 💰 Despesas em [Período]

**Total Gasto:** R$ [valor]

**Principais Categorias:**
1. [Categoria]: R$ [valor]
2. [Categoria]: R$ [valor]

---

**Fonte:** Câmara dos Deputados
```

---

## 🔄 Fluxo de Execução

### 1. Recebimento da Requisição
```
Webhook Chat (POST /chat)
  ↓
Orquestrador Log (Supabase)
  ↓
Orquestrador (GPT-4o-mini)
```

### 2. Roteamento
```
Code in JavaScript (parse JSON de agentes)
  ↓
Router (Switch)
  ├─→ Output 0: Agente Legislativo
  ├─→ Output 1: Agente Político
  └─→ Output 2: Agente Fiscal
```

### 3. Processamento Paralelo
```
┌─────────────────────┐
│ Agente Legislativo  │ (Claude 3.5 Sonnet + MCP Tools)
│ Log: Leg Start      │
└─────────────────────┘
          ↓
┌─────────────────────┐
│ Agente Político     │ (Claude 3.5 Sonnet + MCP Tools)
│ Log: Pol Start      │
└─────────────────────┘
          ↓
┌─────────────────────┐
│ Agente Fiscal       │ (Claude 3.5 Sonnet + MCP Tools)
│ Log: Fis Start      │
└─────────────────────┘
```

### 4. Consolidação
```
Merge (3 inputs)
  ↓
Supabase: Consolidador Log
  ↓
Sintetizador (Gemini 2.5 Flash)
  ↓
Supabase: Final Update
  ↓
Respond to Webhook
```

---

## 🗄️ Integração com Supabase

### Tabela: `agent_logs`
**Campos:**
- `request_id` - ID único da requisição
- `agent_name` - Nome do agente (Orquestrador, Legislativo, Político, Fiscal, Sintetizador)
- `message` - Mensagem de log
- `status` - Status (working, completed, info)

**Logs Registrados:**
1. Orquestrador: "Analisando sua solicitação..."
2. Agentes: "Iniciando análise..." (Legislativo/Político/Fiscal)
3. Sintetizador: "Elaborando a resposta final..."

### Tabela: `requests`
**Campos:**
- `id` - ID da requisição
- `status` - Status final (completed)
- `final_response` - Resposta consolidada

---

## 🌐 Endpoints e Configuração

### Servidor MCP
**URL:** `https://agentecidadaomcp-production.up.railway.app/mcp`

### Webhook
**URL:** `n8n-agentecidadaoagentico-production.up.railway.app/webhook/chat`

**Payload:**
```json
{
  "record": {
    "id": "uuid",
    "content": "Pergunta do usuário"
  }
}
```

---

## 🧠 Modelos de IA Utilizados

| Agente | Modelo | Provedor | Função |
|--------|--------|----------|--------|
| Orquestrador | `gpt-4o-mini` | OpenAI (via OpenRouter) | Roteamento rápido e eficiente |
| Legislativo | `claude-3.5-sonnet` | Anthropic (via OpenRouter) | Análise de proposições |
| Político | `claude-3.5-sonnet` | Anthropic (via OpenRouter) | Análise de perfis |
| Fiscal | `claude-3.5-sonnet` | Anthropic (via OpenRouter) | Análise de despesas |
| Sintetizador | `gemini-2.5-flash` | Google (via OpenRouter) | Consolidação final |

**Razões da Escolha:**
- **GPT-4o-mini** no Orquestrador: Rápido e eficiente para classificação
- **Claude 3.5 Sonnet** nos agentes: Alta capacidade de raciocínio e uso de tools
- **Gemini 2.5 Flash** no Sintetizador: Rápido para consolidação de texto

---

## 📊 Ferramentas MCP por Agente

### Legislativo (21 tools)
```
buscar_proposicoes, detalhar_proposicao, autores_proposicao,
tramitacoes_proposicao, votacoes_proposicao, relacionadas_proposicao,
temas_proposicao, buscar_votacoes, detalhar_votacao, votos_votacao,
orientacoes_votacao, ultimas_votacoes, comparativo_votacoes_bancadas,
timeline_tramitacao, ranking_proposicoes_autor, sugerir_ferramentas,
diagnosticar_consulta, tipos_proposicao, buscar_deputados, buscar_orgaos
```

### Político (23 tools)
```
buscar_deputados, detalhar_deputado, despesas_deputado, discursos_deputado,
eventos_deputado, frentes_deputado, ocupacoes_deputado, orgaos_deputado,
profissoes_deputado, analise_presenca_deputado, buscar_partidos,
detalhar_partido, membros_partido, lideres_partido, buscar_orgaos,
membros_orgao, buscar_frentes, ufs, tipos_orgao, membros_frente,
mesa_legislatura, sugerir_ferramentas
```

### Fiscal (7 tools)
```
buscar_deputados, detalhar_deputado, analise_despesas_partido,
buscar_proposicoes, analise_presenca_deputado, discursos_deputado,
resumo_despesas_deputado
```

### Sintetizador (Todas as tools)
Acesso completo ao servidor MCP para consultas adicionais se necessário.

---

## 💡 Exemplos de Uso

### Exemplo 1: Pergunta Simples (1 agente)
**Usuário:** "Quem é Nikolas Ferreira?"

**Orquestrador decide:** `["politico"]`

**Fluxo:**
1. Agente Político → `buscar_deputados("Nikolas Ferreira")` → ID: 204534
2. Agente Político → `detalhar_deputado(204534)`
3. Sintetizador → Formata resposta final

---

### Exemplo 2: Pergunta Composta (2 agentes)
**Usuário:** "Quais proposições sobre saúde o deputado Nikolas Ferreira apresentou em 2024 e quanto ele gastou nesse período?"

**Orquestrador decide:** `["legislativo", "fiscal"]`

**Fluxo:**
1. Agente Legislativo:
   - `buscar_deputados("Nikolas Ferreira")` → ID: 204534
   - `buscar_proposicoes(idDeputadoAutor=204534, keywords="saúde", ano=2024)`

2. Agente Fiscal:
   - `buscar_deputados("Nikolas Ferreira")` → ID: 204534
   - `resumo_despesas_deputado(id=204534, ano=2024)`

3. Sintetizador:
   - Recebe ambas as análises
   - Consolida em resposta única formatada

---

### Exemplo 3: Pergunta Complexa (3 agentes)
**Usuário:** "Analise a atuação completa de Tabata Amaral em 2024: proposições, participação em comissões e gastos."

**Orquestrador decide:** `["legislativo", "politico", "fiscal"]`

**Fluxo:** Todos os 3 agentes trabalham em paralelo, cada um com seu escopo.

---

## 🔧 Configuração no n8n

### Credenciais Necessárias

1. **OpenRouter API** (`KfPQKoHTCcxjyL8z`)
   - Usado por todos os agentes de IA

2. **Supabase API** (`5y5XCrIlACcF46pQ`)
   - Usado para logging e rastreamento

### Variáveis de Ambiente

- **MCP Server URL:** `https://agentecidadaomcp-production.up.railway.app/mcp`
- **Webhook URL:** Configurado no n8n (`webhook/chat`)

---

## 📈 Melhorias Implementadas

### v1.0 → v2.0 (Atual)

1. **Nova Ferramenta `resumo_despesas_deputado`**
   - Evita overflow ao consultar despesas
   - Retorna agregações otimizadas
   - Adicionada ao Agente Fiscal

2. **Prompts Otimizados**
   - Agente Fiscal com instruções detalhadas sobre evitar overflow
   - Agente Legislativo com formatação aprimorada
   - Sintetizador com templates de resposta claros

3. **Logging Aprimorado**
   - Rastreamento completo no Supabase
   - Status por agente

---

## 🚀 Como Usar

### 1. Via Frontend (Recomendado)
Acesse a interface web que envia requisições para o webhook do n8n.

### 2. Via API Direta
```bash
curl -X POST https://n8n-agentecidadaoagentico-production.up.railway.app/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{
    "record": {
      "id": "uuid-gerado",
      "content": "Quanto Nikolas Ferreira gastou em 2024?"
    }
  }'
```

### 3. Via n8n Interface
Importar o arquivo `Agente Cidadao - Multi-Agentes.json` no n8n.

---

## 🔍 Troubleshooting

### Problema: Agente retorna overflow
**Solução:** Agente Fiscal foi atualizado para usar `resumo_despesas_deputado` por padrão.

### Problema: Resposta incompleta
**Solução:** Verificar logs no Supabase (`agent_logs`) para identificar qual agente falhou.

### Problema: Timeout
**Solução:** Ferramentas MCP têm timeout de 60s configurado. Considere otimizar consultas.

---

## 📝 Manutenção

### Atualizar Prompts
Os prompts dos agentes estão nos nós do n8n:
- `Orquestador` → systemMessage
- `Agente Legislativo` → systemMessage
- `Agente Político` → systemMessage
- `Agente Fiscal` → systemMessage
- `Sintetizador` → systemMessage

### Adicionar Nova Tool
1. Adicionar tool ao servidor MCP
2. Incluir na lista `includeTools` do agente apropriado (nó MCP Client)
3. Atualizar prompt do agente com instruções de uso

### Monitorar Performance
- Logs do Supabase (`agent_logs`)
- Métricas do servidor MCP (`/metrics`)

---

## 📚 Referências

- [README Principal](../../README.md)
- [CLAUDE.md](../../CLAUDE.md) - Guia do servidor MCP
- [Servidor MCP - Código Fonte](../../src/)
- [Documentação n8n](https://docs.n8n.io/)

---

**Versão do Workflow:** f91f6676-96e4-4d62-8585-06026445ebe5
**Última Atualização:** 2025-12-13

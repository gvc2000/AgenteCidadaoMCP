# 🤖 Integração n8n - Agente Cidadão

## Visão Geral

Esta pasta contém a documentação da integração do servidor MCP Câmara BR com o n8n para criar um sistema de orquestração multi-agente.

## 📚 Documentação Disponível

### [Sistema Multi-Agentes](./SISTEMA_MULTI_AGENTES.md)
Documentação completa da arquitetura multi-agente implementada no n8n.

**Conteúdo:**
- Arquitetura geral do sistema
- Descrição detalhada de cada agente (Orquestrador, Legislativo, Político, Fiscal, Sintetizador)
- Fluxo de execução passo a passo
- Integração com Supabase para logging
- Configuração de ferramentas MCP por agente
- Modelos de IA utilizados
- Exemplos de uso
- Troubleshooting

---

## 🎯 Sistema de Agentes Especializados

O Agente Cidadão utiliza **5 agentes especializados** que trabalham em conjunto:

| Agente | Modelo | Função |
|--------|--------|--------|
| **Orquestrador** | GPT-4o-mini | Analisa pergunta e roteia para agentes apropriados |
| **Legislativo** | Claude 3.5 Sonnet | Especialista em proposições, PLs, PECs, tramitações |
| **Político** | Claude 3.5 Sonnet | Especialista em perfil e atuação parlamentar |
| **Fiscal** | Claude 3.5 Sonnet | Especialista em despesas parlamentares (CEAP) |
| **Sintetizador** | Gemini 2.5 Flash | Consolida respostas em formato unificado |

---

## 🚀 Características

- ✅ **Especialização**: Cada agente domina seu domínio específico
- ✅ **Paralelização**: Múltiplos agentes podem trabalhar simultaneamente
- ✅ **Otimização**: Ferramentas MCP específicas por agente
- ✅ **Rastreamento**: Logging completo no Supabase
- ✅ **Qualidade**: Sintetização final garante resposta bem formatada

---

## 📦 Arquivo do Workflow

O workflow completo está disponível em:
- **Caminho:** `/Agente Cidadao - Multi-Agentes.json`
- **Versão:** f91f6676-96e4-4d62-8585-06026445ebe5

Para importar no n8n:
1. Abra o n8n
2. Vá em **Workflows** → **Import from File**
3. Selecione o arquivo `Agente Cidadao - Multi-Agentes.json`

---

## 🔧 Requisitos

### Servidor MCP
- Servidor MCP Câmara BR rodando
- URL: `https://agentecidadaomcp-production.up.railway.app/mcp`

### Credenciais n8n
1. **OpenRouter API** - Para os modelos de IA
2. **Supabase API** - Para logging e rastreamento

### Tabelas Supabase
- `agent_logs` - Logs de execução dos agentes
- `requests` - Requisições e respostas finais

---

## 💡 Exemplos de Uso

### Pergunta Simples (1 agente)
```
"Quem é Nikolas Ferreira?"
→ Agente Político
```

### Pergunta Composta (2 agentes)
```
"Quais proposições sobre saúde Nikolas Ferreira apresentou e quanto gastou em 2024?"
→ Agente Legislativo + Agente Fiscal
```

### Pergunta Complexa (3 agentes)
```
"Análise completa de Tabata Amaral: proposições, comissões e gastos em 2024"
→ Agente Legislativo + Agente Político + Agente Fiscal
```

---

## 🔗 Links Relacionados

- [README Principal](../../README.md)
- [CLAUDE.md](../../CLAUDE.md) - Guia do servidor MCP
- [Servidor MCP - Código Fonte](../../src/)
- [Documentação n8n](https://docs.n8n.io/)

---

**Última Atualização:** 2025-12-13

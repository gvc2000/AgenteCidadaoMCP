# 🔄 Guia de Atualização n8n - Ferramentas de Resumo

**Data:** 2025-12-13
**Versão:** 2.0
**Novas Ferramentas:** `resumo_discursos_deputado`, `resumo_tramitacao_proposicao`

---

## 📋 Resumo das Mudanças

### Novas Ferramentas Disponíveis

1. **`resumo_discursos_deputado`** - Resumo otimizado de discursos (evita overflow)
2. **`resumo_tramitacao_proposicao`** - Resumo otimizado de tramitações (eventos-chave)

### Total de Tools
- **Antes:** 58 tools
- **Depois:** 60 tools

---

## 🎯 Agentes Afetados

### ✅ Agente Político
**Adicionar:** `resumo_discursos_deputado`
**Motivo:** Discursos podem causar overflow de contexto

### ✅ Agente Legislativo
**Adicionar:** `resumo_tramitacao_proposicao`
**Motivo:** Tramitações longas causam overflow

---

## 🛠️ Passo a Passo - Atualização no n8n

### PASSO 1: Abrir o Workflow

1. Acesse seu n8n
2. Abra o workflow **"Agente Cidadao - Multi-Agentes"**
3. Certifique-se de que está em modo de edição

---

### PASSO 2: Atualizar MCP Client do Agente Político

#### 2.1. Localizar o Nó
- Encontre o nó **"MCP Client1"** (conectado ao Agente Político)

#### 2.2. Editar Ferramentas Incluídas
Clique no nó e na seção **"Tools to Include"**, adicione:

```
resumo_discursos_deputado
```

#### 2.3. Lista Completa Atualizada
A lista `includeTools` do Agente Político deve ficar:

```json
[
  "buscar_deputados",
  "detalhar_deputado",
  "despesas_deputado",
  "discursos_deputado",
  "resumo_discursos_deputado",    ← NOVA
  "eventos_deputado",
  "frentes_deputado",
  "ocupacoes_deputado",
  "orgaos_deputado",
  "profissoes_deputado",
  "analise_presenca_deputado",
  "buscar_partidos",
  "detalhar_partido",
  "membros_partido",
  "lideres_partido",
  "buscar_orgaos",
  "membros_orgao",
  "buscar_frentes",
  "ufs",
  "tipos_orgao",
  "membros_frente",
  "mesa_legislatura",
  "sugerir_ferramentas"
]
```

---

### PASSO 3: Atualizar Prompt do Agente Político

#### 3.1. Localizar o Nó
- Encontre o nó **"Agente Político"**

#### 3.2. Atualizar System Message

Localize a seção de ferramentas de discursos e substitua por:

```markdown
### Ferramentas de Discursos:

| Ferramenta | Quando Usar | Observações |
|------------|-------------|-------------|
| `resumo_discursos_deputado` | **PREFERENCIAL** - Visão geral | ⭐ Otimizado para evitar overflow |
| `discursos_deputado` | Textos completos específicos | ⚠️ Usar com filtros (ano, keywords) |

**IMPORTANTE:**
- **SEMPRE use `resumo_discursos_deputado` primeiro** para visão geral
- Só use `discursos_deputado` se o usuário pedir textos completos de discursos específicos
```

#### 3.3. Adicionar na Tabela de Ferramentas

Localize a tabela de ferramentas e atualize:

```markdown
| Ferramenta | Descrição | Parâmetros |
|------------|-----------|------------|
| `discursos_deputado` | Discursos completos | id, dataInicio, dataFim, keywords ⚠️ |
| `resumo_discursos_deputado` | ⭐ Resumo otimizado | id, ano, dataInicio, dataFim, keywords |
```

---

### PASSO 4: Atualizar MCP Client do Agente Legislativo

#### 4.1. Localizar o Nó
- Encontre o nó **"MCP Client3"** (conectado ao Agente Legislativo)

#### 4.2. Editar Ferramentas Incluídas
Adicione:

```
resumo_tramitacao_proposicao
```

#### 4.3. Lista Completa Atualizada
A lista `includeTools` do Agente Legislativo deve ficar:

```json
[
  "buscar_proposicoes",
  "detalhar_proposicao",
  "autores_proposicao",
  "tramitacoes_proposicao",
  "resumo_tramitacao_proposicao",   ← NOVA
  "votacoes_proposicao",
  "relacionadas_proposicao",
  "temas_proposicao",
  "buscar_votacoes",
  "votos_votacao",
  "detalhar_votacao",
  "orientacoes_votacao",
  "ultimas_votacoes",
  "comparativo_votacoes_bancadas",
  "timeline_tramitacao",
  "ranking_proposicoes_autor",
  "sugerir_ferramentas",
  "diagnosticar_consulta",
  "tipos_proposicao",
  "buscar_deputados",
  "buscar_orgaos"
]
```

---

### PASSO 5: Atualizar Prompt do Agente Legislativo

#### 5.1. Localizar o Nó
- Encontre o nó **"Agente Legislativo"**

#### 5.2. Atualizar System Message

Adicione/substitua a seção de ferramentas de tramitação:

```markdown
### Ferramentas de Tramitação:

| Ferramenta | Quando Usar | Observações |
|------------|-------------|-------------|
| `resumo_tramitacao_proposicao` | **PREFERENCIAL** - Visão geral | ⭐ Retorna eventos-chave |
| `tramitacoes_proposicao` | Detalhes de período específico | ⚠️ Usar com dataInicio/dataFim |

**IMPORTANTE:**
- **SEMPRE use `resumo_tramitacao_proposicao` primeiro** para histórico geral
- Retorna apenas eventos importantes: apresentação, aprovações, votações, sanções
- Só use `tramitacoes_proposicao` para análise detalhada de período específico
```

#### 5.3. Adicionar na Tabela de Ferramentas

```markdown
| Ferramenta | Descrição | Parâmetros |
|------------|-----------|------------|
| `tramitacoes_proposicao` | Histórico completo | id, dataInicio, dataFim ⚠️ |
| `resumo_tramitacao_proposicao` | ⭐ Eventos-chave | id, dataInicio, dataFim |
```

---

### PASSO 6: Salvar e Testar

#### 6.1. Salvar Workflow
- Clique em **"Save"** no n8n

#### 6.2. Testar com Casos de Uso

**Teste 1 - Discursos:**
```
Pergunta: "Quais os principais temas que Nikolas Ferreira falou em 2024?"
Esperado: Agente Político usa resumo_discursos_deputado
```

**Teste 2 - Tramitações:**
```
Pergunta: "Qual o histórico de tramitação do PL 1234/2024?"
Esperado: Agente Legislativo usa resumo_tramitacao_proposicao
```

**Teste 3 - Overflow Resolvido:**
```
Pergunta: "Discursos de Eduardo Bolsonaro em 2024 e quanto gastou"
Antes: Overflow no agente
Depois: Resposta completa com resumo
```

---

## 📝 Prompts Completos Atualizados

### Prompt do Agente Político (Completo)

Ver arquivo: [PROMPT_AGENTE_POLITICO_V2.md](./PROMPT_AGENTE_POLITICO_V2.md)

**Principais mudanças:**
- Adicionar `resumo_discursos_deputado` na lista de ferramentas
- Atualizar protocolo de uso de discursos
- Adicionar exemplo de uso da nova ferramenta

---

### Prompt do Agente Legislativo (Completo)

Ver arquivo: [PROMPT_AGENTE_LEGISLATIVO_V2.md](./PROMPT_AGENTE_LEGISLATIVO_V2.md)

**Principais mudanças:**
- Adicionar `resumo_tramitacao_proposicao` na lista de ferramentas
- Atualizar protocolo de tramitações
- Adicionar exemplo de uso da nova ferramenta

---

## ⚙️ Configurações Técnicas

### Timeout Recomendado
As novas ferramentas são mais rápidas que as originais:

```json
{
  "options": {
    "timeout": 30000  // 30s é suficiente
  }
}
```

### Cache
As ferramentas de resumo usam o mesmo sistema de cache:
- TTL: 30 minutos (categoria: deputados/proposicoes)

---

## 🔍 Troubleshooting

### Problema: "Ferramenta não encontrada"

**Solução:**
1. Verificar se o servidor MCP foi atualizado no Railway
2. Rebuild do servidor: `npm run build`
3. Restart do servidor MCP

### Problema: "Ainda há overflow"

**Solução:**
1. Verificar se o agente está realmente usando a ferramenta de resumo
2. Checar logs do n8n para ver qual ferramenta foi chamada
3. Ajustar prompt para enfatizar uso preferencial das ferramentas de resumo

### Problema: "Resposta incompleta"

**Solução:**
1. As ferramentas de resumo retornam dados agregados, não listas completas
2. Isso é intencional para evitar overflow
3. Se usuário precisa de todos os dados, use a ferramenta original com filtros

---

## 📊 Comparação Antes x Depois

### Discursos de Deputado

**Antes (`discursos_deputado`):**
- Volume: ~500KB de texto
- Resultado: Overflow frequente
- Tempo: ~10-15s

**Depois (`resumo_discursos_deputado`):**
- Volume: ~50KB
- Resultado: Sem overflow
- Tempo: ~5-8s
- Info: Top 10 resumidos + estatísticas

### Tramitações de Proposição

**Antes (`tramitacoes_proposicao`):**
- Volume: ~200 tramitações
- Resultado: Overflow em proposições antigas
- Tempo: ~8-12s

**Depois (`resumo_tramitacao_proposicao`):**
- Volume: ~15-20 eventos-chave
- Resultado: Sem overflow
- Info: Eventos importantes + comissões

---

## ✅ Checklist de Atualização

- [ ] Servidor MCP atualizado no Railway
- [ ] MCP Client1 (Político) com `resumo_discursos_deputado`
- [ ] MCP Client3 (Legislativo) com `resumo_tramitacao_proposicao`
- [ ] Prompt do Agente Político atualizado
- [ ] Prompt do Agente Legislativo atualizado
- [ ] Workflow salvo
- [ ] Testes realizados com sucesso
- [ ] Monitoramento de logs para verificar uso correto

---

## 🚀 Deploy do Servidor MCP

Se você usa Railway ou outro serviço:

```bash
# No repositório local
git pull origin main
npm install
npm run build

# Railway faz deploy automático ao detectar push no main
# Ou manualmente:
railway up
```

---

**Dúvidas?** Consulte:
- [Sistema Multi-Agentes](./SISTEMA_MULTI_AGENTES.md)
- [Proposta de Ferramentas de Resumo](../proposals/FERRAMENTAS_RESUMO_OTIMIZADAS.md)
- [CLAUDE.md](../../CLAUDE.md)

---

**Versão do Guia:** 1.0
**Última Atualização:** 2025-12-13

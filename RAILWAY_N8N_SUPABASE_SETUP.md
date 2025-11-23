# 🚀 Guia Completo: Railway + n8n + Supabase + MCP Câmara BR

Este guia mostra como configurar um ambiente completo no Railway.com com n8n integrado ao Supabase e conectado ao MCP Câmara BR.

## 📋 O que vamos criar

```
┌─────────────────────────────────────────────────────────┐
│                    RAILWAY.COM                          │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────┐ │
│  │   n8n        │◄───┤ MCP Câmara   │    │ Supabase │ │
│  │ (Workflows)  │    │   BR Server  │    │ (Postgres│ │
│  │              │───►│              │    │  + API)  │ │
│  └──────────────┘    └──────────────┘    └──────────┘ │
│         │                    │                  │      │
│         └────────────────────┴──────────────────┘      │
│                  (Integração completa)                 │
└─────────────────────────────────────────────────────────┘
```

**Você terá:**
- ✅ n8n rodando com interface visual
- ✅ Banco Supabase (Postgres) para armazenar dados
- ✅ MCP Câmara BR com 57 ferramentas da Câmara dos Deputados
- ✅ Workflows automatizados para processar dados políticos

---

## 📝 Pré-requisitos

- [ ] Conta no [Railway.com](https://railway.app) (gratuita)
- [ ] Conta no [GitHub](https://github.com) (para fazer deploy do MCP)
- [ ] Conta no [Supabase](https://supabase.com) (gratuita) **OU** usar Postgres no Railway

---

## 🎯 PARTE 1: Configurar Supabase

### Opção A: Usar Supabase Cloud (Recomendado - Mais Fácil)

#### Passo 1.1: Criar Projeto no Supabase

1. **Acesse** [supabase.com](https://supabase.com)
2. **Faça login** ou crie uma conta
3. **Clique** em "New Project"
4. **Preencha:**
   - **Name:** `mcp-camara-dados`
   - **Database Password:** Crie uma senha forte (anote!)
   - **Region:** South America (São Paulo) - para melhor latência
   - **Pricing Plan:** Free (suficiente para começar)
5. **Clique** em "Create new project"
6. **Aguarde** ~2 minutos enquanto o projeto é criado

#### Passo 1.2: Obter Credenciais do Supabase

1. No painel do projeto Supabase, **clique** em "Settings" (⚙️ no menu lateral)
2. **Clique** em "Database"
3. **Encontre e anote:**
   ```
   Host: db.xxxxxxxxxxxx.supabase.co
   Database name: postgres
   Port: 5432
   User: postgres
   Password: [a senha que você criou]
   ```

4. **Volte** para "Settings" → "API"
5. **Anote também:**
   ```
   Project URL: https://xxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGc...
   service_role key: eyJhbGc... (mantenha secreto!)
   ```

#### Passo 1.3: Criar Tabelas Iniciais (Opcional)

1. No painel Supabase, **clique** em "SQL Editor"
2. **Cole** o seguinte SQL:

```sql
-- Tabela para armazenar deputados
CREATE TABLE IF NOT EXISTS deputados (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL,
  sigla_partido TEXT,
  sigla_uf TEXT,
  email TEXT,
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  dados_completos JSONB
);

-- Tabela para armazenar proposições monitoradas
CREATE TABLE IF NOT EXISTS proposicoes (
  id INTEGER PRIMARY KEY,
  tipo TEXT,
  numero INTEGER,
  ano INTEGER,
  ementa TEXT,
  status TEXT,
  data_apresentacao DATE,
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  dados_completos JSONB
);

-- Tabela para armazenar votações
CREATE TABLE IF NOT EXISTS votacoes (
  id TEXT PRIMARY KEY,
  data TIMESTAMP,
  proposicao_id INTEGER,
  descricao TEXT,
  aprovada BOOLEAN,
  votos_sim INTEGER,
  votos_nao INTEGER,
  votos_outros INTEGER,
  data_atualizacao TIMESTAMP DEFAULT NOW(),
  dados_completos JSONB,
  FOREIGN KEY (proposicao_id) REFERENCES proposicoes(id)
);

-- Tabela para logs de workflows do n8n
CREATE TABLE IF NOT EXISTS workflow_logs (
  id SERIAL PRIMARY KEY,
  workflow_name TEXT NOT NULL,
  execution_id TEXT,
  status TEXT,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_deputados_partido ON deputados(sigla_partido);
CREATE INDEX idx_deputados_uf ON deputados(sigla_uf);
CREATE INDEX idx_proposicoes_tipo ON proposicoes(tipo);
CREATE INDEX idx_proposicoes_ano ON proposicoes(ano);
CREATE INDEX idx_votacoes_data ON votacoes(data);
CREATE INDEX idx_workflow_logs_workflow ON workflow_logs(workflow_name);
```

3. **Clique** em "Run" para executar

---

### Opção B: Usar Postgres no Railway (Alternativa)

Se preferir tudo no Railway:

1. No Railway, **clique** em "New" → "Database" → "Add PostgreSQL"
2. Railway criará automaticamente um banco Postgres
3. **Clique** no serviço Postgres → "Variables" para ver as credenciais
4. **Anote** as variáveis: `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, etc.

---

## 🎯 PARTE 2: Configurar MCP Câmara BR no Railway

### Passo 2.1: Fazer Fork do Repositório (se ainda não fez)

1. **Acesse** [github.com/gvc2000/AgenteCidadaoMCP](https://github.com/gvc2000/AgenteCidadaoMCP)
2. **Clique** em "Fork" no canto superior direito
3. Aguarde a criação do fork na sua conta

### Passo 2.2: Deploy no Railway

1. **Acesse** [railway.app](https://railway.app)
2. **Faça login** com GitHub
3. **Clique** em "New Project"
4. **Selecione** "Deploy from GitHub repo"
5. **Escolha** o repositório `AgenteCidadaoMCP` (seu fork)
6. Railway detectará automaticamente o projeto Node.js

### Passo 2.3: Configurar Variáveis de Ambiente do MCP

1. **Clique** no serviço criado
2. **Vá** em "Variables"
3. **Adicione** as seguintes variáveis:

```bash
# Node
NODE_ENV=production

# Servidor
PORT=${{PORT}}
LOG_LEVEL=info

# Features
CACHE_ENABLED=true
METRICS_ENABLED=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=100

# API Câmara (já configurada, mas pode customizar)
API_BASE_URL=https://dadosabertos.camara.leg.br/api/v2
MAX_RETRIES=3
REQUEST_TIMEOUT=30000
```

### Passo 2.4: Deploy e Verificação

1. Railway fará o deploy automaticamente
2. **Aguarde** a conclusão (~2-3 minutos)
3. **Clique** em "Settings" → "Generate Domain" para criar URL pública
4. **Anote a URL** gerada, algo como: `https://agentecidadaomcp-production.up.railway.app`

5. **Teste o serviço:**
```bash
curl https://agentecidadaomcp-production.up.railway.app/health
```

Deve retornar:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-23T...",
  "toolsAvailable": 57
}
```

---

## 🎯 PARTE 3: Configurar n8n no Railway

### Passo 3.1: Adicionar n8n ao Projeto

1. No mesmo projeto Railway, **clique** em "New"
2. **Selecione** "Deploy from Template" ou "Empty Service"
3. Se usar template:
   - Busque por "n8n" nos templates
   - **Clique** em "Deploy"
4. Se usar empty service:
   - **Nome:** `n8n`
   - **Clique** em "Deploy"

### Passo 3.2: Configurar Imagem Docker do n8n

Se criou um "Empty Service":

1. **Clique** no serviço n8n
2. **Vá** em "Settings"
3. Em "Source", **selecione** "Docker Image"
4. **Digite:** `n8nio/n8n:latest`
5. **Salve**

### Passo 3.3: Configurar Variáveis de Ambiente do n8n

**IMPORTANTE:** Configure estas variáveis no serviço n8n:

```bash
# === BÁSICAS ===
N8N_PORT=${{PORT}}
N8N_PROTOCOL=https
N8N_HOST=${{RAILWAY_PUBLIC_DOMAIN}}

# === WEBHOOK ===
WEBHOOK_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}

# === BANCO DE DADOS (usando Supabase) ===
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=db.xxxxxxxxxxxx.supabase.co
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=SUA_SENHA_SUPABASE
DB_POSTGRESDB_SCHEMA=n8n

# === EXECUTÕES ===
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true

# === TIMEZONE ===
GENERIC_TIMEZONE=America/Sao_Paulo
TZ=America/Sao_Paulo

# === SEGURANÇA ===
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=SuaSenhaForte123!

# === LOGS ===
N8N_LOG_LEVEL=info
N8N_LOG_OUTPUT=console

# === ENCRYPTION ===
N8N_ENCRYPTION_KEY=SuaChaveDeEncryptacaoAleatoria32Chars!
```

**⚠️ IMPORTANTE:**
- Substitua `db.xxxxxxxxxxxx.supabase.co` pelo host real do Supabase
- Substitua `SUA_SENHA_SUPABASE` pela senha do Supabase
- Crie uma senha forte para `N8N_BASIC_AUTH_PASSWORD`
- Gere uma chave aleatória para `N8N_ENCRYPTION_KEY` (32+ caracteres)

### Passo 3.4: Gerar Domínio Público

1. No serviço n8n, **vá** em "Settings"
2. **Clique** em "Generate Domain"
3. **Anote a URL**, algo como: `https://n8n-production.up.railway.app`

### Passo 3.5: Primeiro Acesso ao n8n

1. **Abra** a URL do n8n no navegador
2. **Login:**
   - User: `admin` (ou o que você configurou)
   - Password: a senha que você configurou
3. **Pronto!** O n8n está funcionando

---

## 🎯 PARTE 4: Integrar n8n + MCP + Supabase

### Passo 4.1: Criar Credencial do Supabase no n8n

1. No n8n, **clique** em "Credentials" (menu lateral)
2. **Clique** em "Add Credential"
3. **Busque** por "Supabase"
4. **Preencha:**
   - **Host:** `https://xxxxxxxxxxxx.supabase.co`
   - **Service Role Secret:** cole a `service_role key` do Supabase
5. **Salve**

### Passo 4.2: Testar Conexão com MCP

1. **Crie** um novo workflow
2. **Adicione** um nó "HTTP Request"
3. **Configure:**
   ```
   Method: GET
   URL: https://agentecidadaomcp-production.up.railway.app/health
   ```
4. **Execute** o nó
5. **Verifique** se retornou `{"status": "healthy"}`

### Passo 4.3: Criar Workflow de Exemplo

Vou criar um workflow que:
1. Busca deputados de SP via MCP
2. Salva no Supabase
3. Roda diariamente

**Adicione os seguintes nós:**

#### Nó 1: Schedule Trigger
```
Type: Schedule Trigger
Interval: Every Day
Hour: 9:00
Timezone: America/Sao_Paulo
```

#### Nó 2: HTTP Request - Buscar Deputados
```
Method: POST
URL: https://agentecidadaomcp-production.up.railway.app/api/tools/buscar_deputados
Headers:
  Content-Type: application/json
Body (JSON):
{
  "uf": "SP",
  "itens": 100,
  "pagina": 1
}
```

#### Nó 3: Function - Processar Dados
```javascript
// Extrair dados dos deputados
const deputados = $input.item.json.result.data;

return deputados.map(dep => ({
  json: {
    id: dep.id,
    nome: dep.nome,
    sigla_partido: dep.siglaPartido,
    sigla_uf: dep.siglaUf,
    email: dep.email || null,
    dados_completos: dep
  }
}));
```

#### Nó 4: Supabase - Inserir/Atualizar
```
Operation: Insert
Table: deputados
Options:
  - On Conflict: id
  - Do Update
```

**Conecte** os nós: Schedule → HTTP Request → Function → Supabase

**Salve** o workflow e **execute** manualmente para testar!

---

## 📊 PARTE 5: Exemplos de Workflows Prontos

### Exemplo 1: Monitorar Votações e Notificar

```
Schedule (10 em 10 min)
  ↓
HTTP Request: buscar_votacoes (últimas 24h)
  ↓
IF: Tem novas votações?
  ↓ SIM
Supabase: Inserir votações
  ↓
Function: Formatar mensagem
  ↓
Webhook/Slack/Email: Notificar
```

### Exemplo 2: Dashboard de Proposições

```
Webhook: GET /proposicoes/:tipo
  ↓
HTTP Request MCP: buscar_proposicoes
  ↓
Function: Enriquecer dados
  ↓
Supabase: Cache temporário (30 min)
  ↓
Response: JSON formatado
```

### Exemplo 3: Análise de Despesas Mensal

```
Schedule (1º dia do mês, 6h)
  ↓
HTTP Request MCP: buscar_deputados (todos)
  ↓
Loop: Para cada deputado
  │
  ├─► HTTP Request: despesas_deputado (mês anterior)
  │
  └─► Supabase: Inserir despesas
  ↓
Function: Calcular estatísticas
  ↓
HTTP Request MCP: analise_despesas_partido
  ↓
Supabase: Salvar relatório mensal
  ↓
Email: Enviar relatório
```

---

## 🔧 PARTE 6: Configurações Avançadas

### 6.1: Adicionar Redis para Cache (Opcional)

1. No Railway, **adicione** "Redis"
2. No serviço MCP, adicione variável:
```bash
REDIS_URL=${{Redis.REDIS_URL}}
```

### 6.2: Configurar Domínio Customizado

1. No Railway, **vá** em Settings do serviço
2. **Clique** em "Custom Domain"
3. **Adicione** seu domínio (ex: `api.meusite.com`)
4. **Configure** DNS conforme instruções

### 6.3: Monitoramento com Logs

**Ver logs do MCP:**
1. Railway → Serviço MCP → "Deployments"
2. **Clique** no deployment ativo → "View Logs"

**Ver logs do n8n:**
1. Railway → Serviço n8n → "Deployments"
2. **Clique** no deployment ativo → "View Logs"

### 6.4: Backup Automático do Supabase

No Supabase:
1. **Vá** em "Settings" → "Backups"
2. Os backups diários são automáticos no plano gratuito
3. Para restaurar, use o painel de backups

---

## 📱 PARTE 7: Workflows Sugeridos para Começar

### 1. **Sync Diário de Deputados**
- **Frequência:** Diário às 6h
- **Ações:** Busca todos os deputados → Atualiza Supabase
- **Benefício:** Base sempre atualizada

### 2. **Monitor de Proposições Importantes**
- **Frequência:** A cada hora
- **Ações:** Busca PECs e PLs novos → Salva → Notifica
- **Benefício:** Não perde proposições importantes

### 3. **Análise de Presença Mensal**
- **Frequência:** 1º dia do mês
- **Ações:** Analisa presença de deputados → Gera relatório → Email
- **Benefício:** Acompanhamento de assiduidade

### 4. **API Pública de Consultas**
- **Frequência:** Webhook permanente
- **Ações:** Recebe consultas → Busca no MCP/Supabase → Retorna JSON
- **Benefício:** API própria para aplicações

---

## ✅ Checklist Final

Verifique se tudo está funcionando:

- [ ] ✅ Supabase criado e tabelas criadas
- [ ] ✅ MCP deployado no Railway e respondendo em `/health`
- [ ] ✅ n8n deployado e acessível via browser
- [ ] ✅ Credencial do Supabase configurada no n8n
- [ ] ✅ Workflow de teste executado com sucesso
- [ ] ✅ Dados salvos no Supabase visíveis no painel

---

## 🆘 Troubleshooting

### Problema: n8n não inicia

**Solução:**
1. Verifique se `DB_POSTGRESDB_PASSWORD` está correta
2. Teste conexão com Supabase:
```bash
psql "postgresql://postgres:SENHA@db.xxx.supabase.co:5432/postgres"
```
3. Verifique logs no Railway

### Problema: MCP retorna erro 500

**Solução:**
1. Verifique logs do serviço MCP
2. Teste endpoint diretamente:
```bash
curl https://seu-mcp.up.railway.app/api/tools
```
3. Confirme que `PORT` está configurado

### Problema: Supabase retorna "too many connections"

**Solução:**
1. No Supabase, vá em Settings → Database → Connection Pooling
2. Use a "Connection pooling URL" ao invés da direta
3. Configure no n8n:
```
DB_POSTGRESDB_HOST=aws-0-sa-east-1.pooler.supabase.com
```

### Problema: Workflow do n8n não salva no Supabase

**Solução:**
1. Verifique se a credencial do Supabase está ativa
2. Teste a tabela manualmente no SQL Editor do Supabase
3. Verifique se o schema `public` está acessível

---

## 📚 Recursos Úteis

### Documentação
- [Railway Docs](https://docs.railway.app)
- [n8n Docs](https://docs.n8n.io)
- [Supabase Docs](https://supabase.com/docs)
- [API Câmara](https://dadosabertos.camara.leg.br/swagger/api.html)

### Ferramentas MCP Disponíveis (57 total)
- Ver arquivo `CLAUDE.md` na raiz do projeto
- Endpoint: `GET /api/tools` para lista completa

### Exemplos de Workflows
- Ver pasta `docs/examples/` no repositório
- Importar JSON direto no n8n

---

## 💡 Próximos Passos

1. **Crie dashboards** usando Supabase + Retool/Metabase
2. **Configure alertas** via Telegram/Slack/Discord
3. **Automatize relatórios** mensais/semanais
4. **Crie API pública** usando n8n webhooks
5. **Integre com IA** (Claude, GPT) para análises

---

## 📞 Suporte

- **Issues GitHub:** https://github.com/gvc2000/AgenteCidadaoMCP/issues
- **Comunidade Railway:** https://discord.gg/railway
- **Comunidade n8n:** https://community.n8n.io
- **Comunidade Supabase:** https://discord.supabase.com

---

**🎉 Parabéns!** Você tem agora um ambiente completo de automação política com n8n, Supabase e MCP Câmara BR!

**Última atualização:** 2025-11-23
**Versão:** 1.0.0

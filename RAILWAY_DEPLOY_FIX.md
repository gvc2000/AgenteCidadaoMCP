# Como Corrigir o Deploy no Railway e n8n

## Problema Atual

1. ❌ Railway retornando 403 "Access denied" em todas as requisições
2. ❌ Servidor MCP SSE ainda não está deployado (commit pendente)
3. ❌ n8n não consegue conectar

## Solução Passo a Passo

### PASSO 1: Resolver o 403 no Railway

O Railway está configurado como **privado**. Você precisa torná-lo **público**:

1. **Acesse o Railway Dashboard**:
   - Vá para: https://railway.app/dashboard
   - Encontre o projeto: `agentecidadaomcp-production`

2. **Configure Networking**:
   - Clique no serviço (deployment)
   - Vá para a aba **"Settings"**
   - Role até **"Networking"** ou **"Public Networking"**
   - **Habilite "Public Networking"** se estiver desabilitado
   - **Remova qualquer IP Allowlist** se houver
   - **Desabilite autenticação** se houver (ou configure se necessário)

3. **Verifique Deploy Settings**:
   - Ainda em Settings, verifique:
     - **Branch**: Deve estar usando `main`
     - **Root Directory**: `/` (raiz do projeto)
     - **Build Command**: `npm install && npm run build` (ou deixe em branco para usar railway.json)
     - **Start Command**: `node dist/mcp-sse-server.js`

4. **Variáveis de Ambiente** (opcional mas recomendado):
   ```
   NODE_ENV=production
   PORT=$PORT (Railway injeta automaticamente)
   LOG_LEVEL=info
   CACHE_ENABLED=true
   ```

### PASSO 2: Mergear o Servidor MCP SSE

O código do servidor MCP SSE existe mas não está na `main` ainda. Faça isso:

#### Opção A: Via GitHub (Recomendado)

1. **Acesse o link do Pull Request**:
   ```
   https://github.com/gvc2000/AgenteCidadaoMCP/compare/main...claude/verify-main-branch-015x4PduY7Vmgj8h174FwTgj
   ```

2. **Crie o Pull Request**:
   - Clique em **"Create pull request"**
   - Título: `feat: Adicionar servidor MCP SSE para n8n`
   - Descrição: (use a sugerida abaixo)
   - Clique em **"Create pull request"**

3. **Merge o Pull Request**:
   - Revise as mudanças (2 arquivos modificados)
   - Clique em **"Merge pull request"**
   - Clique em **"Confirm merge"**

**Descrição sugerida para o PR:**
```markdown
## Adiciona Servidor MCP com Streamable HTTP/SSE

### Mudanças
- ✅ Novo arquivo: `src/mcp-sse-server.ts` (358 linhas)
- ✅ Atualizado: `Dockerfile` (usa mcp-sse-server.js)

### Funcionalidades
- Protocolo MCP via HTTP/SSE (compatível com n8n)
- 55 ferramentas disponíveis
- Gerenciamento de sessões automático
- Endpoints: `/mcp`, `/health`, `/sessions`, `/metrics`

### Configuração n8n
- URL: `https://agentecidadaomcp-production.up.railway.app/mcp`
- Protocol: `HTTP Streamable`
```

#### Opção B: Via Linha de Comando

Se você tem acesso admin:
```bash
# No terminal
git fetch origin main
git checkout main
git pull origin main
git merge claude/verify-main-branch-015x4PduY7Vmgj8h174FwTgj --no-ff
# Vai abrir editor para mensagem do merge, salve e feche
# ATENÇÃO: Não vai conseguir fazer push direto por causa da proteção
# Use o GitHub mesmo (Opção A)
```

### PASSO 3: Verificar o Deploy

Após o merge, o Railway fará redeploy automático (leva 2-5 minutos).

**Teste se funcionou:**

1. **Health Check**:
   ```bash
   curl https://agentecidadaomcp-production.up.railway.app/health
   ```

   Deve retornar:
   ```json
   {
     "status": "healthy",
     "timestamp": "...",
     "uptime": ...,
     "activeSessions": 0,
     "toolsAvailable": 55
   }
   ```

2. **Root Endpoint**:
   ```bash
   curl https://agentecidadaomcp-production.up.railway.app/
   ```

   Deve retornar JSON com informações do servidor MCP.

3. **MCP Endpoint**:
   ```bash
   curl -X POST https://agentecidadaomcp-production.up.railway.app/mcp \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'
   ```

   Deve retornar SSE stream com:
   ```
   event: message
   data: {"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{}},"serverInfo":{"name":"mcp-camara-br","version":"1.0.0"}},"jsonrpc":"2.0","id":1}
   ```

### PASSO 4: Configurar n8n

Após verificar que o servidor está funcionando:

1. **No n8n, adicione um MCP Client node**

2. **Configure**:
   - **URL**: `https://agentecidadaomcp-production.up.railway.app/mcp`
   - **Protocol**: `HTTP Streamable` (ou `Streamable HTTP`)
   - **API Key**: Deixe em branco (não necessário)
   - **Custom Headers**: Deixe em branco

3. **Teste a conexão**:
   - Clique em **"Test Connection"** ou **"Connect"**
   - Deve conectar com sucesso
   - Você verá 55 ferramentas disponíveis

## Troubleshooting

### Ainda recebe 403 após configurar Railway?

1. Verifique se salvou as configurações no Railway
2. Force um redeploy (Settings → Redeploy)
3. Verifique os logs do Railway (Deployments → View Logs)
4. Certifique-se de que não há IP allowlist configurado

### n8n ainda não conecta após o deploy?

1. Verifique se o merge foi feito corretamente
2. Verifique se o Railway fez o redeploy (veja o timestamp do deploy)
3. Teste o endpoint /mcp manualmente (curl acima)
4. Verifique os logs do Railway para ver se há erros
5. Certifique-se de que está usando a URL correta (com `/mcp` no final)

### Servidor não inicia após o deploy?

Verifique os logs do Railway. Erros comuns:
- Porta errada (use a variável `$PORT` do Railway)
- Dependências faltando (verifique package.json)
- TypeScript não compilado (verifique se `npm run build` funciona)

### Como ver os logs do Railway?

1. Acesse: https://railway.app/dashboard
2. Clique no projeto
3. Clique no serviço/deployment
4. Clique na aba **"Deployments"**
5. Clique no deployment ativo
6. Clique em **"View Logs"**

## Resumo Rápido

```bash
# 1. Railway Dashboard → Settings → Public Networking → Enable
# 2. GitHub → Create PR → Merge
# 3. Aguardar redeploy (2-5 min)
# 4. Testar: curl https://agentecidadaomcp-production.up.railway.app/health
# 5. n8n → URL: https://...railway.app/mcp → Protocol: HTTP Streamable
```

---

**Última atualização**: 2025-11-16

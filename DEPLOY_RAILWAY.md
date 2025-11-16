# Deploy no Railway.com e Integração com n8n

Este guia explica como fazer o deploy do MCP Câmara BR no Railway.com e integrá-lo com o n8n.

## 📋 Pré-requisitos

- Conta no [Railway.com](https://railway.app)
- Conta no [GitHub](https://github.com)
- Repositório do projeto no GitHub

## 🚀 Deploy no Railway

### Opção 1: Deploy via GitHub (Recomendado)

1. **Acesse o Railway**
   - Vá para [railway.app](https://railway.app)
   - Faça login com sua conta GitHub

2. **Crie um novo projeto**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha o repositório `AgenteCidadaoMCP`

3. **Configuração automática**
   - O Railway detectará automaticamente o `railway.json`
   - O build será configurado automaticamente

4. **Configure as variáveis de ambiente** (opcional)
   - Clique em "Variables"
   - Adicione as variáveis conforme necessário:
   ```
   NODE_ENV=production
   PORT=9090
   CACHE_ENABLED=true
   RATE_LIMIT_ENABLED=true
   LOG_LEVEL=info
   ```

5. **Deploy**
   - O Railway fará o deploy automaticamente
   - Aguarde a conclusão do build
   - Anote a URL gerada (ex: `https://seu-projeto.up.railway.app`)

### Opção 2: Deploy via Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Deploy
railway up
```

## 🔗 URL do Serviço

Após o deploy, você terá uma URL pública como:
```
https://seu-projeto.up.railway.app
```

## 📡 Endpoints Disponíveis

### 1. Health Check
```
GET https://seu-projeto.up.railway.app/health
```

**Resposta:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-16T10:30:00.000Z",
  "uptime": 123.456,
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 15728640
  }
}
```

### 2. Listar Ferramentas
```
GET https://seu-projeto.up.railway.app/api/tools
```

**Resposta:**
```json
{
  "success": true,
  "count": 30,
  "tools": [
    {
      "name": "buscar_deputados",
      "description": "Busca deputados por diversos critérios",
      "inputSchema": { ... }
    },
    ...
  ]
}
```

### 3. Executar Ferramenta
```
POST https://seu-projeto.up.railway.app/api/tools/{toolName}
Content-Type: application/json

{
  "param1": "value1",
  "param2": "value2"
}
```

**Exemplo - Buscar Deputados:**
```
POST https://seu-projeto.up.railway.app/api/tools/buscar_deputados
Content-Type: application/json

{
  "uf": "SP",
  "nome": "Silva",
  "pagina": 1,
  "itens": 10
}
```

**Resposta:**
```json
{
  "success": true,
  "tool": "buscar_deputados",
  "result": {
    "data": [...],
    "_metadata": {
      "cache": false,
      "latencyMs": 234,
      "apiVersion": "v2"
    }
  },
  "metadata": {
    "executionTime": 234,
    "timestamp": "2025-11-16T10:30:00.000Z"
  }
}
```

### 4. Métricas Prometheus
```
GET https://seu-projeto.up.railway.app/metrics
```

### 5. Métricas JSON
```
GET https://seu-projeto.up.railway.app/metrics/json
```

## 🔄 Integração com n8n

### 1. Instalar n8n

Se ainda não tem o n8n instalado:

```bash
# Via npm
npm install -g n8n

# Via Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  n8nio/n8n
```

### 2. Configurar HTTP Request no n8n

1. **Criar um novo workflow**
   - Abra o n8n em `http://localhost:5678`
   - Crie um novo workflow

2. **Adicionar nó HTTP Request**
   - Clique em "+" para adicionar um nó
   - Busque por "HTTP Request"
   - Adicione o nó ao workflow

3. **Configurar o nó HTTP Request**

**Para listar ferramentas:**
```
Method: GET
URL: https://seu-projeto.up.railway.app/api/tools
Authentication: None
```

**Para executar uma ferramenta:**
```
Method: POST
URL: https://seu-projeto.up.railway.app/api/tools/buscar_deputados
Authentication: None
Headers:
  Content-Type: application/json
Body:
  {
    "uf": "SP",
    "pagina": 1,
    "itens": 10
  }
```

### 3. Exemplos de Workflows n8n

#### Exemplo 1: Buscar Deputados e Enviar por Email

```
1. Schedule Trigger (diariamente às 9h)
   ↓
2. HTTP Request (buscar_deputados)
   Method: POST
   URL: .../api/tools/buscar_deputados
   Body: { "uf": "SP", "itens": 50 }
   ↓
3. Function (processar dados)
   ↓
4. Send Email (enviar relatório)
```

#### Exemplo 2: Webhook → Buscar Proposição → Responder

```
1. Webhook (recebe ID da proposição)
   ↓
2. HTTP Request (detalhar_proposicao)
   Method: POST
   URL: .../api/tools/detalhar_proposicao
   Body: { "id": "{{$json.proposicaoId}}" }
   ↓
3. Respond to Webhook (retornar dados)
```

#### Exemplo 3: Monitorar Votações

```
1. Cron (a cada 10 minutos)
   ↓
2. HTTP Request (buscar_votacoes)
   Method: POST
   URL: .../api/tools/buscar_votacoes
   Body: {
     "dataInicio": "{{$now.minus({days: 1}).toISODate()}}",
     "dataFim": "{{$now.toISODate()}}",
     "itens": 100
   }
   ↓
3. IF (novas votações?)
   ↓
4. Slack/Discord/Telegram (notificar)
```

### 4. Template de Workflow n8n (JSON)

```json
{
  "name": "Buscar Deputados SP",
  "nodes": [
    {
      "parameters": {},
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://seu-projeto.up.railway.app/api/tools/buscar_deputados",
        "options": {},
        "bodyParametersJson": "{\n  \"uf\": \"SP\",\n  \"pagina\": 1,\n  \"itens\": 10\n}"
      },
      "name": "Buscar Deputados",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [450, 300]
    }
  ],
  "connections": {
    "Start": {
      "main": [[{"node": "Buscar Deputados", "type": "main", "index": 0}]]
    }
  }
}
```

## 🛠️ Ferramentas Disponíveis

### Deputados
- `buscar_deputados` - Buscar deputados
- `detalhar_deputado` - Detalhes de um deputado
- `despesas_deputado` - Despesas de um deputado
- `discursos_deputado` - Discursos de um deputado
- `eventos_deputado` - Eventos de um deputado
- `orgaos_deputado` - Órgãos de um deputado

### Proposições
- `buscar_proposicoes` - Buscar proposições
- `detalhar_proposicao` - Detalhes de uma proposição
- `autores_proposicao` - Autores de uma proposição
- `tramitacoes_proposicao` - Tramitações de uma proposição
- `votacoes_proposicao` - Votações de uma proposição

### Votações
- `buscar_votacoes` - Buscar votações
- `detalhar_votacao` - Detalhes de uma votação
- `votos_votacao` - Votos de uma votação
- `orientacoes_votacao` - Orientações de bancada

### Eventos
- `buscar_eventos` - Buscar eventos
- `detalhar_evento` - Detalhes de um evento
- `pauta_evento` - Pauta de um evento

### Outros
- `buscar_orgaos` - Buscar órgãos
- `buscar_partidos` - Buscar partidos
- `buscar_frentes` - Buscar frentes parlamentares
- `buscar_blocos` - Buscar blocos partidários
- `buscar_legislaturas` - Buscar legislaturas

## 📊 Monitoramento

### Verificar Logs no Railway

1. Acesse seu projeto no Railway
2. Clique na aba "Deployments"
3. Selecione o deployment ativo
4. Clique em "View Logs"

### Métricas Disponíveis

```bash
# Prometheus (para Grafana, etc.)
curl https://seu-projeto.up.railway.app/metrics

# JSON (humano-legível)
curl https://seu-projeto.up.railway.app/metrics/json
```

## 🔒 Segurança

### Adicionar Autenticação (Opcional)

Para adicionar autenticação básica, configure no Railway:

```
AUTH_TOKEN=seu-token-secreto
```

E no n8n, configure o Header:
```
Authorization: Bearer seu-token-secreto
```

## 🐛 Troubleshooting

### Erro: "Application failed to respond"

1. Verifique os logs no Railway
2. Confirme que a variável `PORT` está configurada (Railway usa porta dinâmica)
3. Verifique se o build foi concluído com sucesso

### Erro: "Tool not found"

1. Verifique o nome da ferramenta em `GET /api/tools`
2. Use exatamente o nome retornado (case-sensitive)
3. Exemplo: `buscar_deputados` (não `buscarDeputados`)

### Timeout no n8n

1. Aumente o timeout do nó HTTP Request (Settings → Timeout)
2. Valor recomendado: 30000 ms (30 segundos)

### Cache não está funcionando

1. Verifique as variáveis de ambiente:
   ```
   CACHE_ENABLED=true
   ```
2. Consulte os metadados da resposta:
   ```json
   "_metadata": {
     "cache": true,  // indica hit de cache
     "latencyMs": 2  // latência baixa = cache
   }
   ```

## 📞 Suporte

- **Issues**: https://github.com/gvc2000/AgenteCidadaoMCP/issues
- **Documentação Railway**: https://docs.railway.app
- **Documentação n8n**: https://docs.n8n.io

## 🚀 Próximos Passos

1. Configure domínio customizado no Railway (opcional)
2. Configure SSL/TLS (Railway já fornece por padrão)
3. Configure monitoramento com Grafana + Prometheus
4. Explore workflows avançados no n8n
5. Crie alertas para eventos importantes

---

**Última Atualização**: 2025-11-16
**Versão**: 1.0.0

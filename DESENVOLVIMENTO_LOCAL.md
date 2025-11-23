# 💻 Desenvolvimento Local - n8n + MCP + Postgres

Guia completo para rodar o ambiente completo localmente com Docker Compose.

## 🎯 O que você terá

Após seguir este guia, você terá rodando localmente:

```
┌─────────────────────────────────────────┐
│         SEU COMPUTADOR (Docker)         │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐│
│  │   n8n    │  │   MCP    │  │Postgres││
│  │  :5678   │←→│  :9090   │  │ :5432 ││
│  └──────────┘  └──────────┘  └───────┘│
│                                         │
│  ┌──────────┐                          │
│  │  Redis   │  (opcional)               │
│  │  :6379   │                          │
│  └──────────┘                          │
└─────────────────────────────────────────┘
```

**URLs de Acesso:**
- 🌐 **n8n:** http://localhost:5678
- 🔌 **MCP API:** http://localhost:9090
- 🗄️ **Postgres:** localhost:5432
- 📦 **Redis:** localhost:6379

---

## 📋 Pré-requisitos

### 1. Instalar Docker

**Windows:**
- Baixe o [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Instale e reinicie o computador
- Abra o Docker Desktop

**macOS:**
- Baixe o [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Instale e abra o Docker Desktop

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
```

### 2. Verificar Instalação

```bash
docker --version
# Deve retornar: Docker version 20.x.x ou superior

docker-compose --version
# Deve retornar: docker-compose version 1.29.x ou superior
```

---

## 🚀 Início Rápido (5 minutos)

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/gvc2000/AgenteCidadaoMCP.git
cd AgenteCidadaoMCP
```

### Passo 2: Buildar e Iniciar

```bash
# Buildar as imagens
docker-compose build

# Iniciar todos os serviços
docker-compose up -d
```

### Passo 3: Aguardar Inicialização

```bash
# Acompanhar os logs
docker-compose logs -f

# Aguarde até ver:
# ✅ mcp-postgres  | database system is ready to accept connections
# ✅ mcp-camara-br | Server listening on port 9090
# ✅ mcp-n8n       | Editor is now accessible via: http://localhost:5678
```

Pressione `Ctrl+C` para sair dos logs.

### Passo 4: Acessar o n8n

1. **Abra o navegador** em http://localhost:5678
2. **Primeira vez?** Crie um usuário:
   - Email: seu email
   - Password: escolha uma senha
3. **Login com credenciais configuradas:**
   - User: `admin`
   - Password: `admin`

### Passo 5: Testar o MCP

```bash
# Health check
curl http://localhost:9090/health

# Listar ferramentas
curl http://localhost:9090/api/tools | jq

# Buscar deputados
curl -X POST http://localhost:9090/api/tools/buscar_deputados \
  -H "Content-Type: application/json" \
  -d '{"uf": "SP", "itens": 10}'
```

---

## 🎯 Configuração Detalhada

### Estrutura de Diretórios

```
AgenteCidadaoMCP/
├── docker-compose.yml          # Orquestração dos serviços
├── scripts/
│   └── init-db.sql            # Inicialização do banco
├── n8n-workflows/             # Workflows prontos
│   ├── 1-sync-deputados-diario.json
│   ├── 2-monitor-votacoes.json
│   └── README.md
├── logs/                      # Logs do MCP (criado automaticamente)
└── volumes/ (Docker)          # Dados persistentes
    ├── postgres_data/         # Banco de dados
    ├── n8n_data/             # Workflows e credenciais do n8n
    └── redis_data/           # Cache do Redis
```

### Serviços Docker

#### 1. PostgreSQL (Banco de Dados)
```yaml
Container: mcp-postgres
Porta: 5432
Database: mcp_camara
User: postgres
Password: postgres
```

**Conectar via CLI:**
```bash
docker exec -it mcp-postgres psql -U postgres -d mcp_camara
```

**Ver tabelas:**
```sql
\dt
-- Deve listar: deputados, proposicoes, votacoes, despesas, etc.
```

#### 2. MCP Câmara BR (API)
```yaml
Container: mcp-camara-br
Porta: 9090
Logs: ./logs/
```

**Ver logs:**
```bash
docker logs -f mcp-camara-br
```

**Restart:**
```bash
docker restart mcp-camara-br
```

#### 3. n8n (Automação)
```yaml
Container: mcp-n8n
Porta: 5678
User: admin
Password: admin
```

**⚠️ IMPORTANTE:** Altere a senha em produção!

**Dados persistentes:**
```bash
# Workflows ficam em:
docker volume inspect agentecidadaomcp_n8n_data
```

#### 4. Redis (Cache - Opcional)
```yaml
Container: mcp-redis
Porta: 6379
```

**Testar:**
```bash
docker exec -it mcp-redis redis-cli ping
# Deve retornar: PONG
```

---

## 🔧 Configurar n8n

### 1. Criar Credencial do Postgres

1. No n8n, **clique** em "Credentials" (⚙️ menu lateral)
2. **Clique** em "Add Credential"
3. **Busque** por "Postgres"
4. **Preencha:**

```
Credential Name: Postgres Local
Host: postgres
Port: 5432
Database: mcp_camara
User: postgres
Password: postgres
SSL Mode: disable
```

5. **Teste** a conexão → "Test"
6. **Salve** → "Save"

### 2. Importar Workflows Prontos

1. **Clique** em "Workflows" → "Add Workflow"
2. **Menu (···)** → "Import from File"
3. **Selecione** `n8n-workflows/1-sync-deputados-diario.json`
4. **Selecione** a credencial "Postgres Local" nos nós Postgres
5. **Salve** → "Save workflow"
6. **Ative** → Toggle "Active" no topo

Repita para os outros workflows!

### 3. Testar Workflow Manualmente

1. **Abra** o workflow importado
2. **Clique** em "Execute Workflow" (canto superior direito)
3. **Acompanhe** a execução nó por nó
4. **Verifique** os dados no banco:

```bash
docker exec -it mcp-postgres psql -U postgres -d mcp_camara -c "SELECT COUNT(*) FROM deputados;"
```

---

## 📊 Verificar Dados no Banco

### Via psql (Terminal)

```bash
# Conectar
docker exec -it mcp-postgres psql -U postgres -d mcp_camara

# Contar deputados
SELECT COUNT(*) FROM deputados;

# Ver últimos 5 deputados
SELECT id, nome, sigla_partido, sigla_uf FROM deputados ORDER BY nome LIMIT 5;

# Ver proposições recentes
SELECT * FROM proposicoes_recentes LIMIT 10;

# Ver votações
SELECT * FROM votacoes_recentes LIMIT 10;

# Estatísticas
SELECT sigla_partido, COUNT(*) as total
FROM deputados
WHERE sigla_partido IS NOT NULL
GROUP BY sigla_partido
ORDER BY total DESC;

# Sair
\q
```

### Via Ferramenta GUI (Recomendado)

**Opção 1: DBeaver (Multiplataforma)**
- Download: https://dbeaver.io/download/
- Host: `localhost`
- Port: `5432`
- Database: `mcp_camara`
- User/Password: `postgres`/`postgres`

**Opção 2: pgAdmin**
- Download: https://www.pgadmin.org/download/
- Mesmas credenciais acima

**Opção 3: TablePlus (Mac/Windows)**
- Download: https://tableplus.com/
- Mesmas credenciais acima

---

## 🛠️ Comandos Úteis

### Docker Compose

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver status
docker-compose ps

# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f mcp-camara-br
docker-compose logs -f n8n
docker-compose logs -f postgres

# Reiniciar um serviço
docker-compose restart mcp-camara-br

# Rebuild após mudanças no código
docker-compose build
docker-compose up -d

# Parar e remover tudo (CUIDADO: apaga volumes!)
docker-compose down -v
```

### Limpeza e Manutenção

```bash
# Remover containers parados
docker container prune

# Remover imagens não usadas
docker image prune

# Remover volumes não usados (CUIDADO!)
docker volume prune

# Ver espaço usado
docker system df

# Limpeza completa (CUIDADO: apaga TUDO!)
docker system prune -a --volumes
```

---

## 🐛 Troubleshooting

### Problema: Porta já em uso

**Erro:** `Bind for 0.0.0.0:5678 failed: port is already allocated`

**Solução:**
```bash
# Descobrir o que está usando a porta
# Windows:
netstat -ano | findstr :5678

# macOS/Linux:
lsof -i :5678

# Matar o processo OU alterar a porta no docker-compose.yml:
ports:
  - "5679:5678"  # Usar 5679 no host
```

### Problema: Banco não inicializa

**Erro:** Tabelas não existem

**Solução:**
```bash
# Verificar se init-db.sql foi executado
docker-compose logs postgres | grep "init"

# Re-executar manualmente:
docker exec -i mcp-postgres psql -U postgres -d mcp_camara < scripts/init-db.sql
```

### Problema: MCP não conecta

**Erro:** `Connection refused` ao chamar MCP

**Solução:**
```bash
# 1. Verificar se está rodando
docker ps | grep mcp-camara-br

# 2. Ver logs
docker logs mcp-camara-br

# 3. Rebuild se necessário
docker-compose build mcp-camara-br
docker-compose up -d mcp-camara-br

# 4. Testar health
curl http://localhost:9090/health
```

### Problema: n8n não salva workflows

**Erro:** Erro ao salvar workflow

**Solução:**
```bash
# Verificar conexão com banco
docker exec -it mcp-n8n /bin/sh
# Dentro do container:
env | grep DB_POSTGRES

# Verificar se schema n8n existe
docker exec -it mcp-postgres psql -U postgres -d mcp_camara -c "\dn"
# Deve listar: public, n8n
```

### Problema: Memória insuficiente

**Erro:** Docker fica lento ou trava

**Solução:**
1. **Docker Desktop** → Settings → Resources
2. Aumente **Memory** para pelo menos **4 GB**
3. Aumente **CPU** para pelo menos **2 cores**
4. **Apply & Restart**

---

## 🔐 Segurança (IMPORTANTE!)

### ⚠️ Apenas para Desenvolvimento Local

As credenciais padrão são **INSEGURAS** e só devem ser usadas localmente!

**NUNCA use em produção:**
- User: `admin` / Password: `admin`
- Postgres password: `postgres`
- Encryption key genérica

### Para Produção (Railway/Supabase)

Ver guia: `RAILWAY_N8N_SUPABASE_SETUP.md`

Use senhas fortes e únicas!

---

## 📚 Próximos Passos

1. ✅ **Explore os workflows prontos** em `n8n-workflows/`
2. ✅ **Crie seus próprios workflows** no n8n
3. ✅ **Teste as 57 ferramentas** do MCP (ver `CLAUDE.md`)
4. ✅ **Configure notificações** (Slack, Discord, Email)
5. ✅ **Faça deploy no Railway** quando estiver pronto

---

## 📞 Suporte

**Problemas?**
- Abra uma [Issue no GitHub](https://github.com/gvc2000/AgenteCidadaoMCP/issues)
- Veja a [documentação completa](./README.md)
- Consulte `RAILWAY_N8N_SUPABASE_SETUP.md` para produção

**Recursos Úteis:**
- [Docker Docs](https://docs.docker.com/)
- [n8n Docs](https://docs.n8n.io/)
- [Postgres Docs](https://www.postgresql.org/docs/)

---

**🎉 Parabéns!** Você agora tem um ambiente completo de desenvolvimento para automação política!

**Última atualização:** 2025-11-23
**Versão:** 1.0.0

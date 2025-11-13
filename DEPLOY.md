# 🚀 Guia de Deploy - MCP Câmara BR

Este guia completo cobre todos os passos para fazer deploy do servidor MCP Câmara BR.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Deploy Local](#deploy-local)
- [Deploy com Docker](#deploy-com-docker)
- [Deploy em Produção](#deploy-em-produção)
- [Configuração Avançada](#configuração-avançada)
- [Monitoramento](#monitoramento)
- [Troubleshooting](#troubleshooting)

## Pré-requisitos

### Software Necessário

- **Node.js 20+** - [Download](https://nodejs.org/)
- **npm 9+** ou **yarn 1.22+**
- **Git** - Para clonar o repositório
- **Docker & Docker Compose** (opcional) - Para deploy containerizado

### Verificar Instalação

```bash
node --version  # deve ser >= 20.0.0
npm --version   # deve ser >= 9.0.0
git --version
docker --version  # opcional
```

## Deploy Local

### 1. Clone o Repositório

```bash
git clone https://github.com/gvc2000/AgenteCidadaoMCP.git
cd AgenteCidadaoMCP
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure o Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
nano .env  # ou use seu editor preferido
```

**Configurações mínimas:**

```bash
API_BASE_URL=https://dadosabertos.camara.leg.br/api/v2
LOG_LEVEL=info
NODE_ENV=production
```

### 4. Build do Projeto

```bash
npm run build
```

Isso irá:
- Compilar o TypeScript para JavaScript
- Gerar os arquivos na pasta `dist/`
- Criar sourcemaps para debugging

### 5. Inicie o Servidor

```bash
npm start
```

O servidor MCP estará rodando e pronto para receber conexões via stdio.

### 6. Verificar o Funcionamento

Em outro terminal, você pode testar:

```bash
npm test
```

## Deploy com Docker

### 1. Build da Imagem

```bash
docker build -t mcp-camara-br:latest .
```

### 2. Executar o Container

**Opção 1: Docker run**

```bash
docker run -d \
  --name mcp-camara-br \
  -e NODE_ENV=production \
  -e LOG_LEVEL=info \
  -v $(pwd)/logs:/var/log \
  mcp-camara-br:latest
```

**Opção 2: Docker Compose (Recomendado)**

```bash
# Inicie todos os serviços
docker-compose up -d

# Veja os logs
docker-compose logs -f mcp-camara-br

# Pare os serviços
docker-compose down
```

### 3. Verificar Status

```bash
# Status dos containers
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Health check
docker exec mcp-camara-br node -e "process.exit(0)"
```

## Deploy em Produção

### Opção 1: VPS/Servidor Dedicado

#### 1. Preparar o Servidor

```bash
# Atualizar o sistema (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar build essentials
sudo apt-get install -y build-essential

# Instalar PM2 globalmente
sudo npm install -g pm2
```

#### 2. Deploy do Aplicativo

```bash
# Clone o repositório
git clone https://github.com/gvc2000/AgenteCidadaoMCP.git
cd AgenteCidadaoMCP

# Instale dependências
npm ci --only=production

# Build
npm run build

# Configure variáveis de ambiente
cp .env.example .env
nano .env
```

#### 3. Configurar PM2

Crie um arquivo `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'mcp-camara-br',
    script: './dist/server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

#### 4. Iniciar com PM2

```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar auto-start no boot
pm2 startup
# Execute o comando que o PM2 mostrar

# Comandos úteis
pm2 status         # Ver status
pm2 logs           # Ver logs
pm2 restart all    # Reiniciar
pm2 stop all       # Parar
pm2 delete all     # Remover
```

### Opção 2: Deploy com Docker em Produção

#### 1. Preparar o Servidor

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
# Logout e login novamente
```

#### 2. Deploy

```bash
# Clone o repositório
git clone https://github.com/gvc2000/AgenteCidadaoMCP.git
cd AgenteCidadaoMCP

# Configure ambiente
cp .env.example .env
nano .env

# Build e iniciar
docker-compose up -d --build

# Ver logs
docker-compose logs -f
```

#### 3. Atualizar a Aplicação

```bash
# Pull das mudanças
git pull origin main

# Rebuild e restart
docker-compose up -d --build

# Limpar imagens antigas
docker image prune -a
```

## Configuração Avançada

### Configuração de Cache com Redis

Se você quiser usar Redis para cache distribuído:

1. **Edite o `.env`:**

```bash
CACHE_STRATEGY=redis
REDIS_URL=redis://localhost:6379
```

2. **Certifique-se de que o Redis está rodando:**

```bash
# Com Docker Compose (já incluído)
docker-compose up -d redis

# Ou instalado localmente
sudo systemctl start redis
```

### Configuração de Logs

**Logs em arquivo:**

```bash
# .env
LOG_FORMAT=json
LOG_FILE_PATH=/var/log/mcp-camara-br/app.log
```

**Rotação de logs com logrotate:**

```bash
# /etc/logrotate.d/mcp-camara-br
/var/log/mcp-camara-br/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 nodejs nodejs
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Reverse Proxy com Nginx (Opcional)

Se você precisar expor algum endpoint HTTP:

```nginx
# /etc/nginx/sites-available/mcp-camara-br
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoramento

### Logs

**PM2:**
```bash
pm2 logs mcp-camara-br
pm2 monit  # Dashboard interativo
```

**Docker:**
```bash
docker-compose logs -f mcp-camara-br
docker stats mcp-camara-br
```

### Métricas

O servidor expõe métricas internas que podem ser acessadas via logs estruturados:

- Taxa de cache hit/miss
- Latência por tool
- Contadores de erro
- Status do circuit breaker
- Tokens disponíveis no rate limiter

### Alertas

Configure alertas com base nos logs:

```bash
# Monitorar erros
tail -f logs/error.log | grep "ERROR"

# Monitorar circuit breaker
tail -f logs/app.log | grep "Circuit breaker OPEN"
```

## Troubleshooting

### Problema: Servidor não inicia

**Sintomas:** Erro ao executar `npm start`

**Soluções:**
```bash
# Verificar dependências
npm install

# Rebuild
npm run build

# Verificar variáveis de ambiente
cat .env

# Verificar logs
pm2 logs mcp-camara-br
```

### Problema: Rate limit excedido

**Sintomas:** Muitos erros de rate limit nos logs

**Soluções:**
```bash
# Aumentar limite no .env
RATE_LIMIT_PER_MINUTE=200
RATE_LIMIT_BURST=40

# Restart
pm2 restart mcp-camara-br
```

### Problema: Circuit breaker abrindo

**Sintomas:** Logs mostram "Circuit breaker OPEN"

**Soluções:**
```bash
# Verificar conectividade com API
curl -I https://dadosabertos.camara.leg.br/api/v2

# Aumentar threshold
CIRCUIT_BREAKER_FAILURE_THRESHOLD=10

# Restart
pm2 restart mcp-camara-br
```

### Problema: Memória alta

**Sintomas:** Container/processo consumindo muita memória

**Soluções:**
```bash
# Reduzir tamanho do cache
CACHE_MAX_SIZE=500

# Limitar requisições concorrentes
MAX_CONCURRENT_REQUESTS=5

# Restart
pm2 restart mcp-camara-br --update-env
```

### Problema: Timeout em requisições

**Sintomas:** Erros de timeout

**Soluções:**
```bash
# Aumentar timeout
REQUEST_TIMEOUT_MS=60000

# Aumentar retries
MAX_RETRIES=5

# Restart
pm2 restart mcp-camara-br --update-env
```

## Backup e Restauração

### Backup

```bash
# Backup do código
tar -czf mcp-camara-br-backup.tar.gz AgenteCidadaoMCP/

# Backup dos logs
tar -czf logs-backup.tar.gz logs/

# Backup do .env
cp .env .env.backup
```

### Restauração

```bash
# Restaurar código
tar -xzf mcp-camara-br-backup.tar.gz

# Restaurar .env
cp .env.backup .env

# Reinstalar e rebuild
cd AgenteCidadaoMCP
npm install
npm run build
pm2 restart all
```

## Checklist de Deploy

- [ ] Node.js 20+ instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` configurado
- [ ] Build executado (`npm run build`)
- [ ] Testes passando (`npm test`)
- [ ] Servidor iniciado
- [ ] Logs sendo gerados corretamente
- [ ] PM2 configurado (produção)
- [ ] Auto-start configurado (produção)
- [ ] Backups configurados
- [ ] Monitoramento ativo

## Suporte

Para problemas não cobertos neste guia:
- Consulte os [logs do servidor](#logs)
- Abra uma [issue](https://github.com/gvc2000/AgenteCidadaoMCP/issues)
- Consulte a [documentação da API oficial](https://dadosabertos.camara.leg.br/)

---

**Última atualização:** 2025-01-20

# 📊 Workflows n8n - MCP Câmara BR

Esta pasta contém workflows prontos para usar no n8n, integrando o MCP Câmara BR com Supabase/Postgres.

## 🚀 Como Importar

### No n8n (Local ou Railway)

1. **Abra o n8n** (http://localhost:5678 ou sua URL do Railway)
2. **Clique** em "Workflows" no menu lateral
3. **Clique** em "Add Workflow" → "Import from File"
4. **Selecione** um dos arquivos JSON desta pasta
5. **Configure** as credenciais do Postgres (veja abaixo)
6. **Salve** e **ative** o workflow

---

## 📋 Workflows Disponíveis

### 1. Sync Diário de Deputados
**Arquivo:** `1-sync-deputados-diario.json`

**O que faz:**
- Busca todos os deputados via MCP
- Salva/atualiza no banco Postgres
- Roda diariamente às 6h da manhã
- Registra logs de execução

**Configuração:**
- Nenhuma configuração adicional necessária
- Apenas configure a credencial do Postgres

**Tabelas usadas:** `deputados`, `workflow_logs`

---

### 2. Monitor de Votações
**Arquivo:** `2-monitor-votacoes.json`

**O que faz:**
- Busca votações das últimas 24h a cada 10 minutos
- Salva no banco Postgres
- Se encontrar votações novas, envia notificação
- Suporta Slack, Discord, Telegram, Email

**Configuração:**
1. Configure a credencial do Postgres
2. Configure o nó de notificação final (Slack/Discord/etc)
   - Pode remover se não quiser notificações
   - Ou substituir por Email, Webhook, etc.

**Tabelas usadas:** `votacoes`

---

### 3. API Webhook de Consultas
**Arquivo:** `3-api-webhook-consultas.json` *(em breve)*

**O que faz:**
- Cria um endpoint público para consultas
- Recebe parâmetros via POST
- Busca dados no MCP ou Postgres
- Retorna JSON formatado

---

### 4. Análise Mensal de Despesas
**Arquivo:** `4-analise-despesas-mensal.json` *(em breve)*

**O que faz:**
- Busca despesas de todos os deputados
- Calcula estatísticas por partido
- Gera relatório mensal
- Envia por email

---

## 🔧 Configuração de Credenciais

### Postgres (Desenvolvimento Local)

Ao importar os workflows, você precisará configurar a credencial do Postgres:

1. No n8n, **vá** em "Credentials" (menu lateral)
2. **Clique** em "Add Credential"
3. **Busque** por "Postgres"
4. **Preencha:**

```
Name: Postgres Local
Host: postgres
Port: 5432
Database: mcp_camara
User: postgres
Password: postgres
SSL: Disabled (para local)
```

5. **Teste** a conexão
6. **Salve**

### Postgres (Railway/Supabase)

Para usar com Supabase ou Railway:

```
Name: Postgres Production
Host: db.xxxxxxxxxxxx.supabase.co  (ou seu host do Railway)
Port: 5432
Database: postgres  (ou seu database)
User: postgres
Password: [sua senha]
SSL: Enabled
```

---

## 📝 Customizações Comuns

### Alterar Horário do Schedule

Nos nós "Schedule Trigger", você pode alterar:

- **Cron Expression:** Para horários customizados
  - Exemplo diário às 9h: `0 9 * * *`
  - Exemplo a cada 2 horas: `0 */2 * * *`
  - Exemplo toda segunda às 8h: `0 8 * * 1`

### Filtrar Dados

Nos nós "Function", você pode adicionar filtros:

```javascript
// Exemplo: filtrar apenas deputados de SP
return deputados
  .filter(dep => dep.sigla_uf === 'SP')
  .map(dep => ({ json: { ...dep } }));
```

### Adicionar Campos ao Banco

Edite o SQL no nó "Postgres: Execute Query":

```sql
INSERT INTO deputados (id, nome, ..., NOVO_CAMPO)
VALUES ($1, $2, ..., $N)
```

---

## 🎯 Workflows Sugeridos para Criar

Ideias de workflows úteis:

1. **Monitor de Proposições Importantes**
   - Busca PECs e PLs por keywords
   - Filtra por temas relevantes
   - Notifica quando há novidades

2. **Dashboard de Presença**
   - Busca eventos e participações
   - Calcula taxa de presença por deputado
   - Atualiza dashboard diário

3. **Rastreador de Despesas Suspeitas**
   - Busca despesas acima de threshold
   - Identifica padrões anormais
   - Envia alertas

4. **Sincronizador de Proposições**
   - Monitora proposições específicas
   - Atualiza status de tramitação
   - Mantém histórico completo

5. **API Pública de Consultas**
   - Webhook para consultas externas
   - Cache inteligente
   - Rate limiting

---

## 🐛 Troubleshooting

### Erro: "Connection to postgres failed"

**Solução:**
1. Verifique se o container postgres está rodando: `docker ps`
2. Teste conexão manual:
   ```bash
   docker exec -it mcp-postgres psql -U postgres -d mcp_camara
   ```
3. Verifique as credenciais no n8n

### Erro: "MCP endpoint not found"

**Solução:**
1. Verifique se o MCP está rodando: `curl http://localhost:9090/health`
2. No Docker, use `http://mcp-camara-br:9090` (nome do serviço)
3. No Railway, use a URL pública completa

### Workflow não executa no horário

**Solução:**
1. Verifique se o workflow está **Ativo** (toggle no topo)
2. Verifique o timezone no n8n (deve ser America/Sao_Paulo)
3. Execute manualmente uma vez para testar

### Dados duplicados no banco

**Solução:**
1. Os workflows usam `ON CONFLICT ... DO UPDATE`
2. Se ainda houver duplicatas, verifique a constraint `PRIMARY KEY`
3. Rode limpeza:
   ```sql
   DELETE FROM deputados a USING deputados b
   WHERE a.id = b.id AND a.ctid < b.ctid;
   ```

---

## 📚 Recursos Úteis

- **n8n Docs:** https://docs.n8n.io
- **MCP Tools:** Ver `CLAUDE.md` na raiz do projeto
- **Postgres Docs:** https://www.postgresql.org/docs/
- **Exemplos SQL:** Ver `scripts/init-db.sql`

---

## 💡 Contribuindo

Criou um workflow útil? Compartilhe!

1. Exporte o workflow do n8n (JSON)
2. Adicione à pasta `n8n-workflows/`
3. Documente no README
4. Abra um PR!

---

**Última atualização:** 2025-11-23
**Versão:** 1.0.0

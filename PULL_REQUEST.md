# Pull Request: HTTP Streaming com Server-Sent Events (SSE)

## Descrição

Adiciona suporte completo a HTTP streaming usando Server-Sent Events (SSE), permitindo que clientes recebam dados em tempo real conforme são processados pelo servidor MCP.

## Mudanças Principais

### Novo Endpoint de Streaming
- ✅ `POST /api/tools/:toolName/stream` - Execução com streaming SSE
- ✅ Mantido endpoint tradicional `POST /api/tools/:toolName` para compatibilidade

### Funcionalidades Técnicas
- ✅ Funções auxiliares `sendSSE()` e `initSSE()` para comunicação SSE
- ✅ Chunking automático para respostas grandes (>10KB)
- ✅ Headers corretos para evitar buffering (nginx, CDN)
- ✅ Detecção de desconexão do cliente
- ✅ Métricas mantidas para chamadas streaming

### Eventos SSE Implementados
- `start` - Início da execução da ferramenta
- `progress` - Atualizações de progresso durante processamento
- `chunk` - Dados em chunks para respostas grandes
- `data` - Dados completos para respostas pequenas
- `complete` - Conclusão com sucesso
- `error` - Erros durante execução

### Documentação e Exemplos
- ✅ `STREAMING.md` - Documentação completa sobre streaming
- ✅ `examples/streaming-client.html` - Cliente interativo HTML/JavaScript
- ✅ Atualização do `README.md` com informações de streaming
- ✅ Exemplos de uso em JavaScript, Python e cURL

## Arquivos Modificados

```
modified:   README.md (seção HTTP API adicionada)
modified:   src/http-server.ts (endpoint streaming + funções SSE)
created:    STREAMING.md (documentação completa)
created:    examples/streaming-client.html (cliente de teste)
```

## Benefícios

### Para Usuários
- 📊 **Feedback em tempo real** - Veja o progresso durante execução
- 🚀 **Grandes volumes de dados** - Sem timeout em operações longas
- 💡 **Melhor UX** - Interface mais responsiva e interativa
- 🔄 **Streaming incremental** - Processe dados conforme chegam

### Para Integrações
- 🌐 **APIs externas** - Fácil integração via HTTP REST
- 🔗 **n8n, Zapier, Make** - Webhooks com streaming
- 📱 **Web Apps** - JavaScript/TypeScript nativo
- 🐍 **Python, Ruby, etc** - Qualquer linguagem com HTTP

### Para Deploy
- ☁️ **Railway, Render, Heroku** - Funciona out-of-the-box
- 🐳 **Docker** - Container já configurado
- 🌍 **CDN/Proxy** - Headers para evitar buffering
- 📈 **Escalável** - Suporte a múltiplas conexões simultâneas

## Compatibilidade

### ✅ Retrocompatibilidade Completa
- **Servidor MCP original** (`server.js`) não foi modificado
- **Claude Desktop** continua funcionando normalmente (stdio)
- **Modo HTTP** é opcional e adicional
- **Endpoints tradicionais** mantidos e funcionando

### ✅ Plataformas Testadas
- Node.js >= 20.0.0
- Express 4.18+
- TypeScript 5.2+
- Compilação bem-sucedida
- 55 ferramentas disponíveis

## Como Testar

### 1. Build e Start
```bash
npm run build
npm run start:http
```

### 2. Testar via cURL
```bash
# Streaming
curl -X POST http://localhost:9090/api/tools/buscar_deputados/stream \
  -H "Content-Type: application/json" \
  -d '{"uf":"SP","pagina":1,"itens":10}' \
  --no-buffer

# Tradicional (sem streaming)
curl -X POST http://localhost:9090/api/tools/buscar_deputados \
  -H "Content-Type: application/json" \
  -d '{"uf":"SP","pagina":1,"itens":10}'
```

### 3. Cliente HTML Interativo
1. Inicie o servidor: `npm run start:http`
2. Abra `examples/streaming-client.html` em um navegador
3. Configure e teste diferentes ferramentas
4. Veja eventos SSE em tempo real

## Screenshots / Demo

O cliente HTML mostra:
- ✅ Eventos SSE coloridos e formatados
- ✅ Métricas em tempo real (eventos, chunks, tempo, dados)
- ✅ Interface moderna e responsiva
- ✅ Visualização de progresso

## Checklist

- [x] Código compila sem erros
- [x] Testes manuais realizados
- [x] Documentação criada (STREAMING.md)
- [x] README atualizado
- [x] Exemplos funcionais incluídos
- [x] Retrocompatibilidade mantida
- [x] TypeScript strict mode
- [x] Logs estruturados adicionados
- [x] Métricas mantidas

## Breaking Changes

**Nenhuma!** Todas as mudanças são aditivas:
- Servidor MCP original intacto
- Novos endpoints não quebram os existentes
- Modo HTTP é opcional

## Notas Adicionais

### Performance
- Chunking automático evita memory issues
- Streaming usa keep-alive para eficiência
- Sem impacto em endpoints tradicionais

### Segurança
- CORS configurado (ajustar em produção)
- Validação de inputs mantida (Zod)
- Rate limiting aplicado normalmente
- Logs de todas as requisições

### Próximos Passos (Futuro)
- [ ] WebSocket support para comunicação bidirecional
- [ ] Compressão de streaming (gzip)
- [ ] Retomada de streaming interrompido
- [ ] Streaming incremental de arrays

## Merge Checklist

- [x] Branch atualizada com main
- [x] Sem conflitos
- [x] Build passa
- [x] Código revisado
- [x] Documentação completa

---

**Branch:** `claude/mcp-http-streaming-01T57LS7qk5veTcv38sxF43V`
**Base:** `main`
**Commits:** 1 commit (fddc3f2)
**Files Changed:** 4 files (+1255 lines, -2 lines)

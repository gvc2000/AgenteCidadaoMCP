# ⚡ Início Rápido - 5 Minutos

Guia super rápido para testar o servidor MCP em 5 minutos!

## 🚀 Passos Rápidos

### 1. Instalar Dependências (30 segundos)

```bash
cd /caminho/para/AgenteCidadaoMCP
npm install
```

### 2. Compilar (10 segundos)

```bash
npm run build
```

### 3. Configurar Claude Desktop (1 minuto)

**macOS:**
```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
nano ~/.config/Claude/claude_desktop_config.json
```

**Cole esta configuração** (ajuste o caminho):

```json
{
  "mcpServers": {
    "camara-br": {
      "command": "node",
      "args": ["/CAMINHO/COMPLETO/AgenteCidadaoMCP/dist/server.js"]
    }
  }
}
```

> **Dica:** Use `pwd` no terminal para ver o caminho completo do diretório

### 4. Reiniciar Claude Desktop (10 segundos)

- Feche o Claude Desktop completamente
- Abra novamente

### 5. Testar! (3 minutos)

Abra o Claude Desktop e faça estas perguntas:

```
1. Liste 5 deputados de São Paulo

2. Mostre as despesas do deputado ID 204554 em 2024

3. Busque projetos de lei sobre educação apresentados em 2024
```

## ✅ Funcionou?

Você deve ver:
- ✅ Claude busca dados reais da API da Câmara
- ✅ Mostra nomes, partidos, despesas, etc
- ✅ Responde baseado em dados reais

## ❌ Não funcionou?

### Problema: "Tool não encontrada"

**Solução:**
1. Verifique se o caminho no config está correto (absoluto, não relativo)
2. Verifique se executou `npm run build`
3. Reinicie o Claude Desktop completamente

### Problema: "Erro ao executar servidor"

**Solução:**
```bash
# Teste o servidor manualmente
node dist/server.js

# Deve mostrar: "🚀 Servidor MCP Câmara BR iniciado"
# Se aparecer erro, rode:
npm install
npm run build
```

### Problema: "Arquivo de config não existe"

**Solução:**
```bash
# Crie o arquivo manualmente
# macOS:
mkdir -p ~/Library/Application\ Support/Claude
touch ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Linux:
mkdir -p ~/.config/Claude
touch ~/.config/Claude/claude_desktop_config.json
```

## 📚 Próximos Passos

Agora que está funcionando:

1. **Leia:** [GUIA_INSTALACAO_USO.md](./GUIA_INSTALACAO_USO.md) - Documentação completa
2. **Explore:** [EXEMPLOS_PRATICOS.md](./EXEMPLOS_PRATICOS.md) - Casos de uso avançados
3. **Especificação:** [mcp-camara-br-especificacao-completa.md](./mcp-camara-br-especificacao-completa.md) - Todas as 60+ tools planejadas

## 💡 Dicas Rápidas

### Boas Perguntas

✅ "Liste deputados do PT em São Paulo"
✅ "Mostre as despesas do deputado 204554 em janeiro de 2024"
✅ "Busque PECs sobre educação"

### Evite

❌ "Me fale sobre deputados" (muito vago)
❌ "Mostre todos os deputados" (muitos resultados)

## 🎯 Comandos Úteis

```bash
# Desenvolvimento (recompila automaticamente)
npm run dev

# Compilar para produção
npm run build

# Testar o servidor manualmente
node dist/server.js
```

## 🔗 Links Úteis

- **Claude Desktop:** https://claude.ai/download
- **Docs MCP:** https://modelcontextprotocol.io
- **API Câmara:** https://dadosabertos.camara.leg.br

---

**Tempo total:** 5 minutos ⏱️

**Dificuldade:** ⭐ Fácil

Pronto! Agora você tem um LLM conectado aos dados da Câmara dos Deputados! 🎉

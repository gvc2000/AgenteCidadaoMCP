# 🏛️ MCP Câmara BR

Servidor MCP (Model Context Protocol) para acesso aos dados abertos da Câmara dos Deputados do Brasil.

## 🚀 Quick Start

### 1. Instalar dependências

```bash
npm install
```

### 2. Compilar

```bash
npm run build
```

### 3. Configurar no Claude Desktop

Edite o arquivo de configuração:

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

Adicione:

```json
{
  "mcpServers": {
    "camara-br": {
      "command": "node",
      "args": ["/caminho/completo/para/AgenteCidadaoMCP/dist/server.js"]
    }
  }
}
```

### 4. Reiniciar Claude Desktop

Feche e abra o Claude Desktop novamente.

## 💬 Exemplos de Uso

### Buscar Deputados

```
Liste deputados do estado de São Paulo no partido PT
```

### Ver Despesas

```
Mostre as despesas do deputado ID 204554 em janeiro de 2024
```

### Buscar Proposições

```
Busque projetos de lei sobre educação apresentados em 2024
```

## 🛠️ Tools Disponíveis

- `buscar_deputados` - Busca deputados por filtros
- `detalhar_deputado` - Informações completas de um deputado
- `despesas_deputado` - Despesas da cota parlamentar
- `buscar_proposicoes` - Busca proposições (PL, PEC, etc)
- `detalhar_proposicao` - Detalhes de uma proposição
- `votacoes_proposicao` - Votações de uma proposição

## 📚 Documentação

Veja o [GUIA_INSTALACAO_USO.md](./GUIA_INSTALACAO_USO.md) para documentação completa.

## 🔗 Links

- **API Câmara:** https://dadosabertos.camara.leg.br
- **MCP Docs:** https://modelcontextprotocol.io
- **Especificação:** [mcp-camara-br-especificacao-completa.md](./mcp-camara-br-especificacao-completa.md)

## 📄 Licença

MIT

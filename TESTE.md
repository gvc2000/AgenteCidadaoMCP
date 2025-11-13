# 🧪 Guia Rápido de Teste

## Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Compilar
npm run build
```

## Testando no Claude Desktop

### Passo 1: Encontrar o caminho completo do projeto

```bash
pwd
```

Exemplo de saída: `/home/user/AgenteCidadaoMCP`

### Passo 2: Editar configuração do Claude Desktop

**macOS/Linux**:
```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows**:
```bash
code %APPDATA%\Claude\claude_desktop_config.json
```

### Passo 3: Adicionar esta configuração

```json
{
  "mcpServers": {
    "camara-br": {
      "command": "node",
      "args": ["/home/user/AgenteCidadaoMCP/dist/server.js"]
    }
  }
}
```

⚠️ **IMPORTANTE**: Substitua `/home/user/AgenteCidadaoMCP` pelo caminho que você obteve no Passo 1.

### Passo 4: Reiniciar Claude Desktop

Feche completamente e abra novamente o Claude Desktop.

### Passo 5: Testar com perguntas

Experimente estas perguntas no Claude Desktop:

1. **"Busque deputados de São Paulo"**
   - Deve retornar uma lista de deputados de SP

2. **"Quem são os deputados do PT?"**
   - Deve retornar deputados do partido PT

3. **"Busque projetos de lei sobre educação de 2024"**
   - Deve retornar proposições relacionadas

4. **"Mostre as despesas do deputado 204554 em 2024"**
   - Deve retornar as despesas do deputado

## Verificando se está funcionando

### Teste 1: Servidor compila?

```bash
npm run build
```

✅ Se não houver erros, está OK!

### Teste 2: Servidor inicia?

```bash
node dist/server.js
```

O servidor deve ficar rodando sem erros. Pressione Ctrl+C para parar.

### Teste 3: Teste manual via stdio

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/server.js
```

Deve retornar a lista de ferramentas disponíveis.

## Problemas Comuns

### Erro: "Cannot find module"

**Solução**: Execute `npm install` novamente

### Erro: "tsc: command not found"

**Solução**: Execute `npm install` para instalar o TypeScript

### Erro no Claude Desktop: "Server failed to start"

**Solução**:
1. Verifique se o caminho em `args` está correto
2. Verifique se executou `npm run build`
3. Teste manualmente: `node dist/server.js`

### Claude não mostra as ferramentas

**Solução**:
1. Reinicie completamente o Claude Desktop
2. Verifique o arquivo de configuração
3. Verifique os logs do Claude Desktop

## Ferramentas Disponíveis

Depois de configurado, você terá acesso a:

- ✅ `buscar_deputados` - Buscar deputados
- ✅ `detalhar_deputado` - Detalhes de um deputado
- ✅ `despesas_deputado` - Despesas de um deputado
- ✅ `buscar_proposicoes` - Buscar proposições
- ✅ `detalhar_proposicao` - Detalhes de uma proposição
- ✅ `autores_proposicao` - Autores de uma proposição
- ✅ `tramitacoes_proposicao` - Tramitação de uma proposição

## Próximos Passos

Após configurar e testar:

1. Experimente diferentes perguntas no Claude
2. Combine múltiplas ferramentas em uma conversa
3. Explore os dados da Câmara dos Deputados
4. Contribua com melhorias no GitHub

---

**Dúvidas?** Consulte o README.md ou abra uma issue no GitHub.

# Guia de Instalação - Windows 11

Este guia fornece instruções detalhadas para instalar e configurar o **mcp-camara-br** no Windows 11 com Claude Desktop.

## Pré-requisitos

### 1. Node.js (Versão 20 ou superior)

**Download e Instalação:**
1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (Long Term Support)
3. Execute o instalador (`.msi`)
4. Durante a instalação, marque a opção "**Automatically install the necessary tools**"
5. Reinicie o computador após a instalação

**Verificar instalação:**
```cmd
node --version
npm --version
```

Você deve ver versões como:
- Node: `v20.x.x` ou superior
- npm: `v10.x.x` ou superior

### 2. Git (Opcional, mas recomendado)

**Download:**
1. Acesse: https://git-scm.com/download/win
2. Baixe e instale o Git para Windows
3. Use as configurações padrão durante a instalação

### 3. Editor de Código (Opcional)

Recomendamos o **Visual Studio Code**: https://code.visualstudio.com/

## Instalação do MCP Camara BR

### Opção 1: Download do Repositório (ZIP)

1. **Baixar o código:**
   - Acesse o repositório: https://github.com/gvc2000/AgenteCidadaoMCP
   - Clique em **Code** → **Download ZIP**
   - Extraia o arquivo em uma pasta de sua preferência
   - Exemplo: `C:\Users\SeuUsuario\mcp-camara-br`

2. **Abrir o PowerShell ou CMD:**
   - Pressione `Win + R`
   - Digite `powershell` ou `cmd`
   - Navegue até a pasta do projeto:
   ```cmd
   cd C:\Users\SeuUsuario\mcp-camara-br
   ```

3. **Instalar dependências:**
   ```cmd
   npm install
   ```

4. **Compilar o projeto:**
   ```cmd
   npm run build
   ```

   Ou use o script específico para Windows:
   ```cmd
   npm run build:windows
   ```

### Opção 2: Clonar com Git

1. **Abrir o PowerShell ou CMD:**
   ```cmd
   cd C:\Users\SeuUsuario
   git clone https://github.com/gvc2000/AgenteCidadaoMCP.git
   cd AgenteCidadaoMCP
   ```

2. **Instalar dependências:**
   ```cmd
   npm install
   ```

3. **Compilar o projeto:**
   ```cmd
   npm run build
   ```

## Configuração

### 1. Criar arquivo de configuração

Copie o arquivo de exemplo:
```cmd
copy .env.example .env
```

### 2. Editar configurações (opcional)

Abra o arquivo `.env` com o Bloco de Notas ou seu editor preferido:
```cmd
notepad .env
```

As configurações padrão funcionam bem para a maioria dos casos. Você pode ajustar:
- `LOG_LEVEL`: Nível de detalhamento dos logs (`info`, `debug`, `error`)
- `METRICS_ENABLED`: Habilitar/desabilitar métricas (`true`/`false`)
- `CACHE_ENABLED`: Habilitar/desabilitar cache (`true`/`false`)

## Integração com Claude Desktop

### 1. Localizar o arquivo de configuração do Claude Desktop

O arquivo está em:
```
%APPDATA%\Claude\claude_desktop_config.json
```

Caminho completo típico:
```
C:\Users\SeuUsuario\AppData\Roaming\Claude\claude_desktop_config.json
```

### 2. Abrir o arquivo de configuração

**Opção A - Pelo menu do Claude Desktop:**
- Abra o Claude Desktop
- Clique no ícone de configurações (⚙️)
- Selecione "Settings" → "Developer" → "Edit Config"

**Opção B - Manualmente:**
- Pressione `Win + R`
- Cole: `%APPDATA%\Claude`
- Pressione Enter
- Abra `claude_desktop_config.json` com o Bloco de Notas

### 3. Adicionar a configuração do MCP

**IMPORTANTE:** No Windows, você deve usar **barras duplas (`\\`)** nos caminhos.

Edite o arquivo `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "camara-br": {
      "command": "node",
      "args": [
        "C:\\Users\\SeuUsuario\\mcp-camara-br\\dist\\server.js"
      ]
    }
  }
}
```

**Substitua `SeuUsuario` pelo seu nome de usuário do Windows!**

**Exemplo real:**
```json
{
  "mcpServers": {
    "camara-br": {
      "command": "node",
      "args": [
        "C:\\Users\\Maria\\mcp-camara-br\\dist\\server.js"
      ]
    }
  }
}
```

### 4. Salvar e reiniciar

1. Salve o arquivo (`Ctrl + S`)
2. **Feche completamente o Claude Desktop** (não apenas minimize)
3. Abra o Claude Desktop novamente

## Verificação da Instalação

### 1. Testar o servidor MCP localmente

No PowerShell ou CMD, na pasta do projeto:

```cmd
node dist\server.js
```

O servidor deve iniciar e mostrar logs indicando que está funcionando.

Pressione `Ctrl + C` para parar o servidor.

### 2. Verificar no Claude Desktop

Após reiniciar o Claude Desktop:

1. Abra uma nova conversa
2. Procure por um ícone de **martelo** (🔨) ou **ferramentas** no canto inferior direito
3. Você deve ver "camara-br" listado entre as ferramentas disponíveis

### 3. Testar uma consulta

Experimente perguntar ao Claude:

```
Liste os deputados de São Paulo (SP) usando a ferramenta camara-br
```

Se funcionar, você verá uma lista de deputados!

## Solução de Problemas Comuns

### Erro: "Cannot find module"

**Causa:** Dependências não foram instaladas corretamente.

**Solução:**
```cmd
npm install
npm run build
```

### Erro: "node is not recognized"

**Causa:** Node.js não está instalado ou não está no PATH.

**Solução:**
1. Reinstale o Node.js: https://nodejs.org/
2. Reinicie o computador
3. Verifique: `node --version`

### Erro: "Permission denied"

**Causa:** Falta de permissões administrativas.

**Solução:**
1. Abra o PowerShell ou CMD como **Administrador**
2. Execute os comandos novamente

### Claude Desktop não reconhece o servidor

**Verificações:**

1. **Caminho correto?**
   - Verifique se o caminho em `claude_desktop_config.json` está correto
   - Use barras duplas: `C:\\Users\\...`
   - Não use barras simples: `C:/Users/...` (pode não funcionar)

2. **Arquivo compilado existe?**
   ```cmd
   dir dist\server.js
   ```

   Se não existir, compile novamente:
   ```cmd
   npm run build
   ```

3. **Claude Desktop foi reiniciado?**
   - Feche completamente o Claude Desktop (não apenas minimize)
   - Abra novamente

4. **Teste manualmente:**
   ```cmd
   node dist\server.js
   ```

   Deve iniciar sem erros.

### Erro de JSON no arquivo de configuração

**Sintoma:** Claude Desktop não inicia ou mostra erro de configuração.

**Causa:** JSON inválido no `claude_desktop_config.json`.

**Solução:**
1. Verifique se há vírgulas, chaves e colchetes corretos
2. Use um validador JSON online: https://jsonlint.com/
3. Exemplo de configuração correta:

```json
{
  "mcpServers": {
    "camara-br": {
      "command": "node",
      "args": [
        "C:\\Users\\SeuUsuario\\mcp-camara-br\\dist\\server.js"
      ]
    }
  }
}
```

### Logs e Depuração

Para ver logs detalhados, edite o arquivo `.env`:

```env
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

Depois recompile:
```cmd
npm run build
```

## Comandos Úteis

### Desenvolvimento

```cmd
# Modo de desenvolvimento (auto-reload)
npm run dev

# Compilar o projeto
npm run build

# Limpar e compilar
npm run build:clean

# Executar o servidor
npm start
```

### Manutenção

```cmd
# Atualizar dependências
npm update

# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades
npm audit fix

# Limpar cache do npm
npm cache clean --force
```

### Testes

```cmd
# Executar testes
npm test

# Executar testes com cobertura
npm run test:coverage

# Verificar tipos TypeScript
npm run type-check

# Executar linter
npm run lint
```

## Atualizações

Para atualizar o projeto para a versão mais recente:

### Com Git:

```cmd
cd C:\Users\SeuUsuario\mcp-camara-br
git pull origin main
npm install
npm run build
```

### Sem Git:

1. Baixe a versão mais recente (ZIP)
2. Substitua os arquivos (exceto `.env`)
3. Execute:
   ```cmd
   npm install
   npm run build
   ```

## Desinstalação

Para remover o MCP Camara BR:

1. **Remover do Claude Desktop:**
   - Edite `%APPDATA%\Claude\claude_desktop_config.json`
   - Remova a seção `"camara-br"`
   - Salve e reinicie o Claude Desktop

2. **Remover os arquivos:**
   - Delete a pasta do projeto: `C:\Users\SeuUsuario\mcp-camara-br`

## Suporte

### Documentação Adicional

- **README principal:** `README.md`
- **Guia de instalação geral:** `GUIA_INSTALACAO_USO.md`
- **Início rápido:** `INICIO_RAPIDO.md`
- **Exemplos práticos:** `EXEMPLOS_PRATICOS.md`

### Problemas e Sugestões

Se encontrar problemas ou tiver sugestões:
- **Issues:** https://github.com/gvc2000/AgenteCidadaoMCP/issues
- **Discussões:** https://github.com/gvc2000/AgenteCidadaoMCP/discussions

## Próximos Passos

Depois de instalar com sucesso:

1. **Explore os exemplos:** Leia `EXEMPLOS_PRATICOS.md`
2. **Teste diferentes consultas:** Experimente buscar deputados, proposições, votações
3. **Configure as preferências:** Ajuste `.env` conforme necessário
4. **Contribua:** Reporte bugs ou sugira melhorias!

---

**Versão do Guia:** 1.0.0
**Última Atualização:** 2025-11-16
**Sistema:** Windows 11 (compatível com Windows 10)

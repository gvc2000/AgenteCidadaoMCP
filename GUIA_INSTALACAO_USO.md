# 🚀 Guia Completo: Instalação e Uso do MCP com LLM

## 📋 Índice
1. [O que é MCP?](#o-que-é-mcp)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação do Cliente (Claude Desktop)](#instalação-do-cliente)
4. [Implementação do Servidor MCP](#implementação-do-servidor)
5. [Configuração e Conexão](#configuração-e-conexão)
6. [Testando o Servidor](#testando-o-servidor)
7. [Exemplos de Perguntas](#exemplos-de-perguntas)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 O que é MCP?

**MCP (Model Context Protocol)** é um protocolo aberto que permite que LLMs (como Claude) acessem dados externos através de "tools" (ferramentas). No nosso caso, o servidor MCP vai conectar o LLM à API da Câmara dos Deputados.

### Como funciona:
```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│   Claude    │ ◄─────► │ Servidor MCP │ ◄─────► │  API Câmara BR  │
│  (Desktop)  │   MCP   │  (Node.js)   │  HTTP   │  (dados.gov.br) │
└─────────────┘         └──────────────┘         └─────────────────┘
```

---

## 📦 Pré-requisitos

### 1. Node.js e npm
```bash
# Verificar se já tem instalado
node --version  # Deve ser >= 18.x
npm --version   # Deve ser >= 9.x

# Se não tiver, instalar:
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (com Homebrew):
brew install node

# Windows:
# Baixar de: https://nodejs.org/
```

### 2. Git
```bash
# Verificar
git --version

# Instalar se necessário:
# Ubuntu/Debian:
sudo apt-get install git

# macOS:
brew install git

# Windows:
# Baixar de: https://git-scm.com/
```

---

## 💻 Instalação do Cliente

### Opção 1: Claude Desktop (Recomendado)

1. **Download do Claude Desktop:**
   - Acesse: https://claude.ai/download
   - Baixe para seu sistema operacional
   - Instale normalmente

2. **Localize o arquivo de configuração:**

```bash
# macOS:
~/Library/Application Support/Claude/claude_desktop_config.json

# Windows:
%APPDATA%\Claude\claude_desktop_config.json

# Linux:
~/.config/Claude/claude_desktop_config.json
```

### Opção 2: Outros clientes compatíveis

Você também pode usar:
- **Continue.dev** (VSCode extension)
- **Cline** (VSCode extension)
- **Zed** (Editor com suporte MCP nativo)

---

## 🛠️ Implementação do Servidor MCP

### Passo 1: Inicializar o Projeto

```bash
# No diretório do projeto
cd /home/user/AgenteCidadaoMCP

# Criar estrutura básica
mkdir -p src/tools/deputados
mkdir -p src/core
mkdir -p src/api

# Inicializar package.json
npm init -y
```

### Passo 2: Instalar Dependências

```bash
# Dependências principais
npm install @modelcontextprotocol/sdk axios zod dotenv

# Dependências de desenvolvimento
npm install -D typescript @types/node tsx

# Configurar TypeScript
npx tsc --init
```

### Passo 3: Criar Servidor MCP Básico

Crie o arquivo `src/server.ts`:

```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const API_BASE = 'https://dadosabertos.camara.leg.br/api/v2';

// Criar servidor
const server = new Server(
  {
    name: 'mcp-camara-br',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Listar tools disponíveis
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'buscar_deputados',
        description: 'Busca deputados por nome, UF, partido ou outros filtros',
        inputSchema: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              description: 'Nome do deputado (mínimo 3 caracteres)',
            },
            uf: {
              type: 'string',
              description: 'Sigla do estado (ex: SP, RJ, MG)',
              pattern: '^[A-Z]{2}$',
            },
            partido: {
              type: 'string',
              description: 'Sigla do partido (ex: PT, PSDB, MDB)',
            },
            pagina: {
              type: 'number',
              description: 'Número da página (padrão: 1)',
              default: 1,
            },
            itens: {
              type: 'number',
              description: 'Itens por página (1-100, padrão: 15)',
              default: 15,
            },
          },
        },
      },
      {
        name: 'detalhar_deputado',
        description: 'Obtém informações detalhadas de um deputado específico',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'ID do deputado',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'despesas_deputado',
        description: 'Lista as despesas de um deputado (cota parlamentar)',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'ID do deputado',
            },
            ano: {
              type: 'number',
              description: 'Ano das despesas (ex: 2024)',
            },
            mes: {
              type: 'number',
              description: 'Mês das despesas (1-12)',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'buscar_proposicoes',
        description: 'Busca proposições (PL, PEC, etc) por diversos filtros',
        inputSchema: {
          type: 'object',
          properties: {
            siglaTipo: {
              type: 'string',
              description: 'Tipo da proposição (PL, PEC, MPV, etc)',
            },
            numero: {
              type: 'number',
              description: 'Número da proposição',
            },
            ano: {
              type: 'number',
              description: 'Ano da proposição',
            },
            keywords: {
              type: 'string',
              description: 'Palavras-chave para buscar no texto',
            },
          },
        },
      },
    ],
  };
});

// Executar tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'buscar_deputados': {
        const params = new URLSearchParams();
        if (args.nome) params.append('nome', args.nome);
        if (args.uf) params.append('siglaUf', args.uf);
        if (args.partido) params.append('siglaPartido', args.partido);
        params.append('pagina', String(args.pagina || 1));
        params.append('itens', String(args.itens || 15));

        const response = await axios.get(
          `${API_BASE}/deputados?${params.toString()}`
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'detalhar_deputado': {
        const response = await axios.get(`${API_BASE}/deputados/${args.id}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'despesas_deputado': {
        const params = new URLSearchParams();
        if (args.ano) params.append('ano', String(args.ano));
        if (args.mes) params.append('mes', String(args.mes));
        params.append('itens', '100');

        const response = await axios.get(
          `${API_BASE}/deputados/${args.id}/despesas?${params.toString()}`
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'buscar_proposicoes': {
        const params = new URLSearchParams();
        if (args.siglaTipo) params.append('siglaTipo', args.siglaTipo);
        if (args.numero) params.append('numero', String(args.numero));
        if (args.ano) params.append('ano', String(args.ano));
        if (args.keywords) params.append('keywords', args.keywords);
        params.append('itens', '15');

        const response = await axios.get(
          `${API_BASE}/proposicoes?${params.toString()}`
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Tool desconhecida: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Erro ao executar ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Servidor MCP Câmara BR iniciado');
}

main();
```

### Passo 4: Configurar package.json

Edite o `package.json`:

```json
{
  "name": "mcp-camara-br",
  "version": "1.0.0",
  "description": "Servidor MCP para dados da Câmara dos Deputados",
  "type": "module",
  "bin": {
    "mcp-camara-br": "./dist/server.js"
  },
  "scripts": {
    "build": "tsc && chmod +x dist/server.js",
    "dev": "tsx src/server.ts",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "axios": "^1.6.0",
    "dotenv": "^16.3.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
```

### Passo 5: Compilar

```bash
npm run build
```

---

## ⚙️ Configuração e Conexão

### Opção 1: Configuração Local (Desenvolvimento)

Edite o arquivo de configuração do Claude Desktop:

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

### Opção 2: Publicar no npm (Produção)

```bash
# Publicar no npm
npm publish

# Depois, configurar no Claude Desktop:
{
  "mcpServers": {
    "camara-br": {
      "command": "npx",
      "args": ["-y", "mcp-camara-br"]
    }
  }
}
```

### Reiniciar o Claude Desktop

Depois de editar a configuração:
1. Feche completamente o Claude Desktop
2. Abra novamente
3. O servidor MCP deve conectar automaticamente

---

## 🧪 Testando o Servidor

### Teste 1: Verificar Conexão

Abra o Claude Desktop e pergunte:

```
Quais tools do MCP você tem disponíveis?
```

**Resposta esperada:** Claude deve listar as tools do servidor camara-br.

### Teste 2: Buscar Deputados

```
Busque deputados do estado de São Paulo no partido PT
```

**O que acontece:**
1. Claude identifica a necessidade de usar a tool `buscar_deputados`
2. Chama a tool com parâmetros `{uf: "SP", partido: "PT"}`
3. Recebe os dados da API
4. Apresenta os resultados formatados

### Teste 3: Verificar Logs

Para debug, você pode ver os logs do servidor:

```bash
# macOS/Linux
tail -f ~/Library/Logs/Claude/mcp*.log

# Windows
# Abrir o Visualizador de Eventos
```

---

## 💬 Exemplos de Perguntas

### Perguntas Simples

```
1. "Liste 5 deputados de Minas Gerais"

2. "Mostre informações sobre o deputado ID 204554"

3. "Quais foram as despesas do deputado ID 204554 em janeiro de 2024?"

4. "Busque proposições do tipo PL sobre educação"
```

### Perguntas Complexas

```
1. "Encontre deputados do PSDB em São Paulo e me mostre as despesas
    do deputado com mais gastos em 2024"

2. "Liste as proposições do tipo PEC apresentadas em 2024 e
    mostre os detalhes da mais recente"

3. "Compare os gastos dos deputados do PT e PSDB em São Paulo
    no último trimestre"

4. "Mostre um ranking dos 5 deputados que mais gastaram com
    passagens aéreas em 2024"
```

### Perguntas Analíticas

```
1. "Analise o padrão de despesas dos deputados de São Paulo
    e identifique outliers"

2. "Crie um resumo das proposições sobre meio ambiente
    apresentadas nos últimos 6 meses"

3. "Qual partido tem mais deputados ativos? Mostre uma
    distribuição por estado"

4. "Identifique os deputados mais ativos em termos de
    proposições apresentadas"
```

---

## 🔧 Troubleshooting

### Problema 1: Servidor não conecta

**Sintomas:** Claude não mostra as tools

**Soluções:**
```bash
# 1. Verificar se o servidor compila
npm run build

# 2. Testar o servidor manualmente
node dist/server.js
# Deve imprimir: "Servidor MCP Câmara BR iniciado"

# 3. Verificar o caminho no config
# Deve ser o caminho ABSOLUTO para server.js

# 4. Ver logs do Claude Desktop
# macOS:
~/Library/Logs/Claude/

# Windows:
%APPDATA%\Claude\Logs\
```

### Problema 2: Erro ao chamar API

**Sintomas:** Tool retorna erro de rede

**Soluções:**
```bash
# 1. Testar a API diretamente
curl "https://dadosabertos.camara.leg.br/api/v2/deputados?itens=1"

# 2. Verificar se precisa de proxy
# Adicionar no código se necessário:
import { HttpsProxyAgent } from 'https-proxy-agent';

const agent = new HttpsProxyAgent('http://seu-proxy:porta');
axios.defaults.httpsAgent = agent;

# 3. Aumentar timeout
axios.defaults.timeout = 30000;
```

### Problema 3: Claude não entende como usar as tools

**Sintomas:** Claude pergunta em vez de usar a tool

**Solução:** Seja mais explícito:
```
❌ "Me fale sobre deputados de SP"
✅ "Use a tool buscar_deputados para listar deputados de SP"
```

### Problema 4: Dados muito grandes

**Sintomas:** Resposta truncada ou erro de memória

**Solução:** Adicionar paginação e limites:
```typescript
// Limitar itens retornados
params.append('itens', '15');

// Resumir dados antes de retornar
const resumo = response.data.dados.map(d => ({
  id: d.id,
  nome: d.nome,
  partido: d.siglaPartido,
  uf: d.siglaUf
}));
```

---

## 📚 Próximos Passos

### 1. Adicionar mais tools

Implemente as outras 60+ tools da especificação:
- Votações
- Eventos
- Órgãos
- Proposições detalhadas

### 2. Adicionar cache

```bash
npm install lru-cache

# Em src/core/cache.ts
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({ max: 500, ttl: 1000 * 60 * 5 });
```

### 3. Adicionar validação

```typescript
import { z } from 'zod';

const BuscarDeputadosSchema = z.object({
  nome: z.string().min(3).optional(),
  uf: z.string().length(2).optional(),
  partido: z.string().optional(),
});
```

### 4. Adicionar testes

```bash
npm install -D vitest

# Criar tests/server.test.ts
```

---

## 🎓 Recursos Adicionais

### Documentação Oficial

- **MCP Docs:** https://modelcontextprotocol.io
- **MCP SDK:** https://github.com/modelcontextprotocol/typescript-sdk
- **API Câmara:** https://dadosabertos.camara.leg.br/swagger/api.html

### Exemplos de Servidores MCP

- **Filesystem:** https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem
- **GitHub:** https://github.com/modelcontextprotocol/servers/tree/main/src/github
- **PostgreSQL:** https://github.com/modelcontextprotocol/servers/tree/main/src/postgres

### Comunidade

- **Discord MCP:** https://discord.gg/modelcontextprotocol
- **GitHub Discussions:** https://github.com/modelcontextprotocol/typescript-sdk/discussions

---

## ✅ Checklist de Validação

Após seguir o guia, você deve conseguir:

- [ ] Compilar o servidor sem erros
- [ ] Ver o servidor listado no Claude Desktop
- [ ] Fazer perguntas e o Claude usar as tools
- [ ] Ver os dados da API nos resultados
- [ ] Entender os logs e debugar problemas

---

## 🎉 Conclusão

Você agora tem um servidor MCP funcional conectando o Claude à API da Câmara dos Deputados!

**Próximos desafios:**
1. Implementar as outras 60 tools da especificação completa
2. Adicionar cache, validação e tratamento de erros robusto
3. Criar tools de agregação e análise
4. Publicar no npm para outros usarem

**Dúvidas?** Abra uma issue no GitHub ou consulte a documentação oficial do MCP.

---

**Criado em:** 2025-01-13
**Versão:** 1.0
**Licença:** MIT

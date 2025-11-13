# 🏛️ MCP Câmara BR

Servidor MCP (Model Context Protocol) para acesso aos dados abertos da Câmara dos Deputados do Brasil.

## 📋 Descrição

Este servidor MCP permite que LLMs (como Claude) acessem informações da Câmara dos Deputados através de ferramentas estruturadas e validadas, incluindo:

- 👥 **Deputados**: Buscar, detalhar e consultar despesas
- 📜 **Proposições**: Buscar projetos de lei, PECs, MPs e acompanhar tramitação
- 🗳️ **Autores e tramitações**: Histórico completo de proposições
- 🔍 **Filtros avançados**: Por nome, UF, partido, período, tipo, tema e mais

## 🚀 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Compilar o projeto

```bash
npm run build
```

## 🧪 Como Testar

### Opção 1: Testar via Claude Desktop

1. **Editar o arquivo de configuração do Claude Desktop**:

No macOS/Linux:
```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

No Windows:
```bash
code %APPDATA%\Claude\claude_desktop_config.json
```

2. **Adicionar o servidor MCP**:

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

**IMPORTANTE**: Substitua `/caminho/completo/para/AgenteCidadaoMCP` pelo caminho real do seu projeto.

3. **Reiniciar o Claude Desktop**

4. **Testar as ferramentas** fazendo perguntas como:
   - "Busque deputados de São Paulo do PT"
   - "Quais são as despesas do deputado ID 204554 em 2024?"
   - "Busque proposições sobre educação de 2023"

### Opção 2: Testar via Claude Code (MCP Inspector)

Se você estiver usando Claude Code, pode testar diretamente:

```bash
npm run dev
```

Então use o MCP Inspector para testar as ferramentas disponíveis.

### Opção 3: Testar manualmente com stdio

```bash
npm run build
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/server.js
```

## 🛠️ Ferramentas Disponíveis

### Deputados

#### `buscar_deputados`
Busca deputados com filtros opcionais.

**Parâmetros**:
- `nome` (opcional): Nome do deputado (mín. 3 caracteres)
- `uf` (opcional): Sigla da UF (SP, RJ, MG, etc.)
- `partido` (opcional): Sigla do partido
- `sexo` (opcional): M ou F
- `idLegislatura` (opcional): ID da legislatura (1-57)
- `pagina` (opcional): Número da página (padrão: 1)
- `itens` (opcional): Itens por página (padrão: 25, máx: 100)

**Exemplo**:
```json
{
  "nome": "Silva",
  "uf": "SP",
  "partido": "PT",
  "pagina": 1,
  "itens": 10
}
```

#### `detalhar_deputado`
Obtém informações detalhadas de um deputado.

**Parâmetros**:
- `id` (obrigatório): ID do deputado

**Exemplo**:
```json
{
  "id": 204554
}
```

#### `despesas_deputado`
Lista despesas de um deputado.

**Parâmetros**:
- `id` (obrigatório): ID do deputado
- `ano` (opcional): Ano da despesa (2008-atual)
- `mes` (opcional): Mês (1-12)
- `pagina` (opcional): Número da página
- `itens` (opcional): Itens por página

**Exemplo**:
```json
{
  "id": 204554,
  "ano": 2024,
  "mes": 1,
  "itens": 50
}
```

### Proposições

#### `buscar_proposicoes`
Busca proposições legislativas.

**Parâmetros**:
- `siglaTipo` (opcional): Tipo (PL, PEC, MPV, etc.)
- `numero` (opcional): Número da proposição
- `ano` (opcional): Ano
- `idAutor` (opcional): ID do autor
- `keywords` (opcional): Palavras-chave
- `dataInicio` (opcional): Data início (YYYY-MM-DD)
- `dataFim` (opcional): Data fim (YYYY-MM-DD)
- `pagina` (opcional): Número da página
- `itens` (opcional): Itens por página

**Exemplo**:
```json
{
  "siglaTipo": "PL",
  "ano": 2024,
  "keywords": "educação",
  "itens": 20
}
```

#### `detalhar_proposicao`
Detalhes de uma proposição.

**Parâmetros**:
- `id` (obrigatório): ID da proposição

#### `autores_proposicao`
Lista autores de uma proposição.

**Parâmetros**:
- `id` (obrigatório): ID da proposição

#### `tramitacoes_proposicao`
Histórico de tramitação.

**Parâmetros**:
- `id` (obrigatório): ID da proposição
- `dataInicio` (opcional): Data início
- `dataFim` (opcional): Data fim
- `pagina` (opcional): Número da página
- `itens` (opcional): Itens por página

## 📝 Exemplos de Uso

### No Claude Desktop

Depois de configurar o servidor, você pode fazer perguntas naturais:

1. **Buscar deputados**:
   - "Liste os deputados de São Paulo"
   - "Quem são os deputados do PT?"
   - "Busque deputados com o nome João"

2. **Consultar despesas**:
   - "Quais foram as despesas do deputado 204554 em janeiro de 2024?"
   - "Mostre as despesas mais altas do deputado X"

3. **Buscar proposições**:
   - "Quais projetos de lei sobre saúde foram apresentados em 2024?"
   - "Busque PECs de 2023"
   - "Mostre proposições do deputado ID 123456"

4. **Acompanhar tramitação**:
   - "Como está a tramitação do PL 1234/2024?"
   - "Quem são os autores da proposição 2345678?"

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
mcp-camara-br/
├── src/
│   ├── server.ts              # Servidor MCP principal
│   ├── config.ts              # Configurações
│   ├── api/
│   │   └── client.ts          # Cliente HTTP
│   ├── core/
│   │   ├── cache.ts           # Sistema de cache
│   │   ├── logger.ts          # Sistema de logs
│   │   └── schemas.ts         # Validação Zod
│   └── tools/
│       ├── deputados/         # Tools de deputados
│       └── proposicoes/       # Tools de proposições
├── dist/                      # Código compilado
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts Disponíveis

- `npm run dev` - Modo desenvolvimento com hot reload
- `npm run build` - Compilar TypeScript
- `npm start` - Executar servidor compilado
- `npm run type-check` - Verificar tipos

## 🌐 API Base

Os dados vêm da API oficial da Câmara dos Deputados:
- **Base URL**: https://dadosabertos.camara.leg.br/api/v2
- **Documentação**: https://dadosabertos.camara.leg.br/swagger/api.html

## 📄 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique se o servidor está compilado (`npm run build`)
2. Verifique os logs em caso de erro
3. Consulte a documentação da API oficial da Câmara

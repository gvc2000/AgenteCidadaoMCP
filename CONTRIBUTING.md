# Guia de Contribuição - Agente Cidadão MCP

Obrigado por considerar contribuir com o **Agente Cidadão MCP**! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Workflow de Desenvolvimento](#workflow-de-desenvolvimento)
- [Testes](#testes)
- [Commits e Pull Requests](#commits-e-pull-requests)

## 🤝 Código de Conduta

Este projeto segue um código de conduta. Ao participar, espera-se que você:

- Use linguagem acolhedora e inclusiva
- Respeite pontos de vista e experiências diferentes
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Demonstre empatia com outros membros

## 🚀 Como Contribuir

### Reportando Bugs

Ao reportar bugs, inclua:

- **Descrição clara**: O que aconteceu vs. o que era esperado
- **Passos para reproduzir**: Lista numerada de ações
- **Ambiente**: Versão do Node.js, SO, etc.
- **Logs/Screenshots**: Se aplicável

### Sugerindo Melhorias

Para sugerir novas funcionalidades:

- **Contexto**: Por que essa funcionalidade seria útil?
- **Casos de uso**: Como seria usada?
- **Exemplos**: Se possível, forneça exemplos

### Contribuindo com Código

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie uma branch** para sua contribuição
4. **Faça suas alterações**
5. **Teste** suas alterações
6. **Commit** seguindo nossos padrões
7. **Push** para seu fork
8. **Abra um Pull Request**

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- **Node.js** >= 20.0.0
- **npm** >= 9.0.0
- **Git**

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/AgenteCidadaoMCP.git
cd AgenteCidadaoMCP

# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env

# Compile o projeto
npm run build

# Execute em modo de desenvolvimento
npm run dev
```

### Verificação

```bash
# Verifique a tipagem
npm run type-check

# Execute o linter
npm run lint

# Formate o código
npm run format

# Execute os testes
npm test
```

## 📝 Padrões de Código

### TypeScript

- **Strict Mode**: Sempre ativado
- **No `any`**: Evite usar `any`, use tipos específicos ou `unknown`
- **Tipos exportados**: Derive de schemas Zod quando possível

```typescript
// ✅ Bom
const MySchema = z.object({ name: z.string() });
export type MyType = z.infer<typeof MySchema>;

// ❌ Evite
export type MyType = any;
```

### Nomenclatura

- **Arquivos**: `kebab-case.ts` (ex: `buscar-deputados.ts`)
- **Funções**: `camelCase` (ex: `buscarDeputados`)
- **Classes/Tipos**: `PascalCase` (ex: `BuscarDeputadosParams`)
- **Constantes**: `UPPER_SNAKE_CASE` (ex: `CONFIG`, `MAX_RETRIES`)
- **MCP Tools**: `snake_case` (ex: `buscar_deputados`)

### Imports

- **Use extensão .js**: Mesmo para arquivos .ts (quirk do Node.js ESM)
- **Ordem**: externos → internos → relativos

```typescript
// ✅ Correto
import { z } from 'zod';
import { camaraAPI } from '../../api/client.js';
import { CONFIG } from './config.js';

// ❌ Incorreto
import { camaraAPI } from '../../api/client';  // Falta .js
```

### Estrutura de Tools

Siga o padrão estabelecido:

```typescript
// 1. Schema Zod
const MyToolSchema = z.object({
  param: z.string()
});

export type MyToolParams = z.infer<typeof MyToolSchema>;

// 2. Handler
export async function myToolHandler(params: MyToolParams) {
  const startTime = Date.now();
  try {
    const validated = MyToolSchema.parse(params);
    // ... lógica
    metricsCollector.incrementToolCall('my_tool');
    return result;
  } catch (error) {
    metricsCollector.incrementError('my_tool');
    throw error;
  }
}

// 3. Definição
export const myToolDefinition = {
  name: 'my_tool',
  description: 'Descrição clara para LLM',
  inputSchema: { /* ... */ },
  handler: myToolHandler
};
```

### ESLint e Prettier

- **ESLint**: Para qualidade de código
- **Prettier**: Para formatação consistente

```bash
# Executar ESLint
npm run lint

# Formatar código
npm run format
```

## 🔄 Workflow de Desenvolvimento

### Branches

- **main**: Código de produção
- **develop**: Branch de desenvolvimento (se existir)
- **feature/**: Novas funcionalidades (`feature/add-votacoes-tool`)
- **fix/**: Correções de bugs (`fix/cache-invalidation`)
- **docs/**: Atualizações de documentação (`docs/update-readme`)

### Criando uma Branch

```bash
# Atualize main
git checkout main
git pull origin main

# Crie sua branch
git checkout -b feature/minha-funcionalidade

# Trabalhe e commite
git add .
git commit -m "feat: adiciona nova funcionalidade"

# Push para seu fork
git push origin feature/minha-funcionalidade
```

## 🧪 Testes

### Executando Testes

```bash
# Todos os testes
npm test

# Com coverage
npm run test:coverage

# Modo watch
npm run test:watch
```

### Escrevendo Testes

- **Cobertura**: Novos códigos devem ter testes
- **Nomenclatura**: `*.test.ts` ou `*.spec.ts`
- **Framework**: Vitest

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-function.js';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

## 📤 Commits e Pull Requests

### Mensagens de Commit

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(escopo): descrição curta

Descrição mais detalhada, se necessário.

BREAKING CHANGE: descreva mudanças que quebram compatibilidade
```

**Tipos**:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não afeta código)
- `refactor`: Refatoração (não altera comportamento)
- `test`: Adição/alteração de testes
- `chore`: Tarefas de build, dependências, etc.
- `perf`: Melhoria de performance

**Exemplos**:

```bash
# Nova funcionalidade
git commit -m "feat(tools): adiciona ferramenta buscar_votacoes"

# Correção de bug
git commit -m "fix(cache): corrige invalidação de cache em deputados"

# Documentação
git commit -m "docs(readme): atualiza instruções de instalação"

# Breaking change
git commit -m "refactor(api): altera estrutura de resposta da API

BREAKING CHANGE: campo 'dados' renomeado para 'data'"
```

### Pull Requests

#### Template de PR

```markdown
## Descrição

Breve descrição das alterações.

## Motivação e Contexto

Por que essas mudanças são necessárias? Qual problema resolvem?

## Tipo de Mudança

- [ ] Bug fix (mudança que corrige um issue)
- [ ] Nova funcionalidade (mudança que adiciona funcionalidade)
- [ ] Breaking change (correção ou funcionalidade que quebra compatibilidade)
- [ ] Documentação

## Como Foi Testado?

Descreva os testes realizados.

## Checklist

- [ ] Código segue os padrões do projeto
- [ ] Comentei código complexo
- [ ] Atualizei a documentação
- [ ] Mudanças não geram novos warnings
- [ ] Adicionei testes
- [ ] Todos os testes passam localmente
- [ ] Executei lint e format
```

#### Processo de Review

1. **Auto-review**: Revise suas próprias alterações primeiro
2. **CI/CD**: Aguarde os checks automatizados passarem
3. **Feedback**: Responda aos comentários construtivamente
4. **Ajustes**: Faça alterações solicitadas
5. **Merge**: Após aprovação, será feito merge

## 📚 Recursos Adicionais

### Documentação

- [README.md](./README.md) - Visão geral do projeto
- [CLAUDE.md](./CLAUDE.md) - Guia para assistentes de IA
- [docs/](./docs/) - Documentação completa

### Ferramentas Úteis

- **VS Code Extensions**:
  - ESLint
  - Prettier
  - TypeScript
  - GitLens

- **Links Úteis**:
  - [TypeScript Handbook](https://www.typescriptlang.org/docs/)
  - [Zod Documentation](https://zod.dev/)
  - [Model Context Protocol](https://modelcontextprotocol.io/)

## ❓ Dúvidas

Se tiver dúvidas:

1. Verifique a [documentação](./docs/)
2. Procure em issues existentes
3. Abra uma nova issue com a tag `question`

## 🎉 Agradecimentos

Toda contribuição é valorizada, seja código, documentação, testes ou feedback!

---

**Última atualização**: 2025-11-15

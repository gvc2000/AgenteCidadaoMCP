# Especificação Front-End: Agente Cidadão

## 1. Visão Geral

### 1.1 Propósito
O **Agente Cidadão** é uma interface conversacional moderna que permite aos cidadãos brasileiros consultarem dados públicos através de linguagem natural. O sistema conecta usuários aos Dados Abertos da Câmara dos Deputados (e futuramente outros órgãos públicos) através de um assistente inteligente baseado em LLM e MCP.

### 1.2 Filosofia
- **Transparência**: Facilitar o acesso aos dados públicos
- **Simplicidade**: Interface intuitiva, sem necessidade de conhecimento técnico
- **Cidadania Ativa**: Empoderar cidadãos com informação legislativa
- **Acessibilidade**: Design inclusivo e responsivo

### 1.3 Fluxo de Dados
```
Usuário (Pergunta em linguagem natural)
    ↓
Front-End (Interface de Chat)
    ↓
LLM (Claude/GPT - Processamento de linguagem natural)
    ↓
MCP Server (mcp-camara-br)
    ↓
API Dados Abertos da Câmara
    ↓
← Resposta estruturada e contextualizada
```

---

## 2. Identidade Visual

### 2.1 Paleta de Cores

#### Cores Primárias (Verde Câmara)
```css
--verde-camara-primary: #00693D;     /* Verde principal da Câmara */
--verde-camara-dark: #004D2C;        /* Verde escuro (hover, ênfase) */
--verde-camara-light: #008B4D;       /* Verde claro (destaque) */
--verde-camara-pale: #E8F5F0;        /* Verde muito claro (backgrounds) */
--verde-camara-accent: #00A854;      /* Verde accent (CTAs, links) */
```

#### Cores Secundárias
```css
--amarelo-bandeira: #FFDF00;         /* Amarelo da bandeira (highlights) */
--azul-bandeira: #002776;            /* Azul da bandeira (informações) */
--branco: #FFFFFF;                   /* Background principal */
--cinza-100: #F7F9FA;                /* Background alternativo */
--cinza-200: #E5E9EB;                /* Borders, dividers */
--cinza-400: #9BA5AD;                /* Texto secundário */
--cinza-700: #3D4852;                /* Texto principal */
--cinza-900: #1A1F24;                /* Texto forte */
```

#### Cores de Estado
```css
--success: #10B981;                  /* Sucesso, confirmação */
--warning: #F59E0B;                  /* Avisos, atenção */
--error: #EF4444;                    /* Erros, problemas */
--info: #3B82F6;                     /* Informações, dicas */
```

### 2.2 Tipografia

#### Famílias de Fonte
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Poppins', 'Inter', sans-serif;  /* Títulos e headers */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;  /* Código, dados técnicos */
```

#### Escalas de Tamanho
```css
--text-xs: 0.75rem;      /* 12px - Legendas, labels pequenos */
--text-sm: 0.875rem;     /* 14px - Texto secundário */
--text-base: 1rem;       /* 16px - Texto principal */
--text-lg: 1.125rem;     /* 18px - Texto destacado */
--text-xl: 1.25rem;      /* 20px - Subtítulos */
--text-2xl: 1.5rem;      /* 24px - Títulos seção */
--text-3xl: 1.875rem;    /* 30px - Títulos página */
--text-4xl: 2.25rem;     /* 36px - Títulos principais */
```

### 2.3 Espaçamento e Layout
```css
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-5: 1.25rem;    /* 20px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-10: 2.5rem;    /* 40px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */

--border-radius-sm: 0.375rem;   /* 6px - Botões, tags */
--border-radius-md: 0.5rem;     /* 8px - Cards, inputs */
--border-radius-lg: 0.75rem;    /* 12px - Modais, containers */
--border-radius-xl: 1rem;       /* 16px - Seções destacadas */
```

---

## 3. Componentes da Interface

### 3.1 Layout Principal

#### 3.1.1 Header (Cabeçalho)
```
┌─────────────────────────────────────────────────────────┐
│  [Logo] Agente Cidadão              [Info] [Config] [?] │
│  Seu assistente de dados públicos                       │
└─────────────────────────────────────────────────────────┘
```

**Características**:
- Background: `--verde-camara-primary`
- Cor do texto: `--branco`
- Altura: 80px (desktop), 64px (mobile)
- Fixo no topo (sticky header)
- Sombra suave ao fazer scroll

**Elementos**:
- Logo + Nome do projeto (esquerda)
- Tagline descritivo
- Ícones de ação (direita):
  - **Info**: Sobre o projeto
  - **Config**: Preferências do usuário
  - **Ajuda**: Tutorial e documentação

#### 3.1.2 Chat Container (Área Principal)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Mensagem do Assistente]                        │   │
│  │ Olá! Sou o Agente Cidadão...                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                      ┌───────────────────────────────┐ │
│                      │ [Mensagem do Usuário]         │ │
│                      │ Quem é o deputado X?          │ │
│                      └───────────────────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Resposta do Assistente]                        │   │
│  │ [Card com dados estruturados]                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Características**:
- Background: `--cinza-100` ou gradiente suave
- Scroll automático para última mensagem
- Altura dinâmica (calc(100vh - header - input))
- Padding: `--spacing-6`

#### 3.1.3 Input Area (Área de Entrada)
```
┌─────────────────────────────────────────────────────────┐
│ [🔍] Digite sua pergunta sobre a Câmara...      [Enviar]│
│                                                         │
│ [Exemplos: "Deputados de SP" | "Proposições sobre..."] │
└─────────────────────────────────────────────────────────┘
```

**Características**:
- Fixo no bottom da tela
- Background: `--branco`
- Sombra superior
- Auto-resize do textarea
- Altura mínima: 60px
- Altura máxima: 200px

**Estados**:
- Default: Border `--cinza-200`
- Focus: Border `--verde-camara-primary` (2px)
- Disabled: Background `--cinza-100`, texto `--cinza-400`

### 3.2 Mensagens

#### 3.2.1 Mensagem do Usuário
```
                      ┌───────────────────────────────┐
                      │ Quais deputados são de SP?    │
                      │                         10:45 │
                      └───────────────────────────────┘
```

**Estilos**:
- Background: `--verde-camara-primary`
- Cor texto: `--branco`
- Alinhamento: direita
- Max-width: 70%
- Border-radius: `--border-radius-lg`
- Padding: `--spacing-4`
- Margin-bottom: `--spacing-4`

#### 3.2.2 Mensagem do Assistente
```
┌─────────────────────────────────────────────────┐
│ [🤖] Agente Cidadão                             │
│                                                 │
│ Encontrei 70 deputados de São Paulo. Aqui      │
│ estão os principais:                            │
│                                                 │
│ [Card Deputado 1]                               │
│ [Card Deputado 2]                               │
│ [Card Deputado 3]                               │
│                                                 │
│ [Ver todos os resultados]                10:45 │
└─────────────────────────────────────────────────┘
```

**Estilos**:
- Background: `--branco`
- Borda: 1px solid `--cinza-200`
- Alinhamento: esquerda
- Max-width: 80%
- Border-radius: `--border-radius-lg`
- Padding: `--spacing-4`
- Margin-bottom: `--spacing-4`
- Sombra suave: `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)`

#### 3.2.3 Mensagem de Loading
```
┌─────────────────────────────────────────────────┐
│ [⏳] Consultando dados da Câmara...             │
│ ● ● ●                                           │
└─────────────────────────────────────────────────┘
```

**Animação**:
- Skeleton screens para cards
- Dots animados ou spinner
- Cor: `--verde-camara-light`

### 3.3 Cards de Dados

#### 3.3.1 Card Deputado
```
┌─────────────────────────────────────────────────┐
│ [Foto]  NOME DO DEPUTADO                        │
│ 150x150 Partido - UF                            │
│         Situação: [Exercício]                   │
│                                                 │
│         📧 email@camara.leg.br                  │
│         🔗 Site oficial                         │
│                                                 │
│         [Ver Despesas] [Ver Proposições]        │
└─────────────────────────────────────────────────┘
```

**Estilos**:
- Background: `--cinza-100`
- Border-radius: `--border-radius-md`
- Padding: `--spacing-4`
- Hover: Scale 1.02, sombra aumentada
- Transition: 200ms ease

#### 3.3.2 Card Proposição
```
┌─────────────────────────────────────────────────┐
│ [Tipo] PL 1234/2024                             │
│                                                 │
│ Ementa da proposição limitada a 2-3 linhas...  │
│                                                 │
│ 👤 Autor: Deputado X                            │
│ 📅 Apresentação: 01/01/2024                     │
│ 📊 Situação: [Em tramitação]                    │
│                                                 │
│ [Ver Detalhes] [Ver Autores] [Ver Tramitação]  │
└─────────────────────────────────────────────────┘
```

#### 3.3.3 Card Despesa
```
┌─────────────────────────────────────────────────┐
│ 💰 Despesas - Mês/Ano                           │
│                                                 │
│ Total: R$ 45.678,90                             │
│                                                 │
│ ┌─ Tipo de Despesa ─────────────── Valor ───┐  │
│ │ Combustível              R$ 5.000,00       │  │
│ │ Divulgação Parlamentar   R$ 12.345,67      │  │
│ │ Passagens Aéreas         R$ 8.900,00       │  │
│ └────────────────────────────────────────────┘  │
│                                                 │
│ [Ver Detalhes] [Exportar]                       │
└─────────────────────────────────────────────────┘
```

### 3.4 Componentes Interativos

#### 3.4.1 Botões

**Primário (CTA)**:
```css
.btn-primary {
  background: var(--verde-camara-primary);
  color: var(--branco);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  transition: all 200ms ease;
}

.btn-primary:hover {
  background: var(--verde-camara-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 105, 61, 0.3);
}
```

**Secundário**:
```css
.btn-secondary {
  background: transparent;
  color: var(--verde-camara-primary);
  border: 2px solid var(--verde-camara-primary);
  /* ... resto similar */
}
```

**Terciário (Ghost)**:
```css
.btn-ghost {
  background: transparent;
  color: var(--cinza-700);
  /* Sem borda */
}
```

#### 3.4.2 Tags/Badges
```html
<span class="badge badge-success">Exercício</span>
<span class="badge badge-info">Em tramitação</span>
<span class="badge badge-warning">Aguardando</span>
```

**Estilos**:
- Padding: `--spacing-1` `--spacing-3`
- Border-radius: `--border-radius-sm`
- Font-size: `--text-xs`
- Font-weight: 600
- Text-transform: uppercase

#### 3.4.3 Sugestões Rápidas (Quick Actions)
```
┌─────────────────────────────────────────────────────────┐
│ Experimente perguntar:                                  │
│                                                         │
│ [💼 Deputados de SP] [📋 Proposições recentes]          │
│ [💰 Maiores despesas] [🗣️ Discursos sobre saúde]       │
└─────────────────────────────────────────────────────────┘
```

**Características**:
- Exibido quando não há mensagens (tela inicial)
- Cards clicáveis que preenchem o input
- Animação ao hover
- 4-6 sugestões contextuais

### 3.5 Estados Especiais

#### 3.5.1 Empty State (Primeira Visita)
```
           ┌─────────────────────────────────┐
           │         [Ilustração SVG]        │
           │      Agente Cidadão 🇧🇷         │
           │                                 │
           │ Bem-vindo ao seu assistente de  │
           │ dados públicos!                 │
           │                                 │
           │ Faça perguntas sobre:           │
           │ • Deputados e seus trabalhos    │
           │ • Proposições legislativas      │
           │ • Despesas parlamentares        │
           │ • Votações e discursos          │
           │                                 │
           │ [Começar]                       │
           └─────────────────────────────────┘
```

#### 3.5.2 Error State
```
┌─────────────────────────────────────────────────┐
│ [⚠️] Ops! Algo deu errado                       │
│                                                 │
│ Não conseguimos buscar os dados no momento.     │
│ Por favor, tente novamente.                     │
│                                                 │
│ [Tentar Novamente] [Reportar Problema]          │
└─────────────────────────────────────────────────┘
```

#### 3.5.3 No Results State
```
┌─────────────────────────────────────────────────┐
│ [🔍] Nenhum resultado encontrado                │
│                                                 │
│ Não encontramos dados para sua busca.           │
│ Tente reformular a pergunta ou usar termos      │
│ diferentes.                                     │
│                                                 │
│ [Dicas de Busca]                                │
└─────────────────────────────────────────────────┘
```

---

## 4. Responsividade

### 4.1 Breakpoints
```css
--mobile: 320px;      /* Smartphones pequenos */
--mobile-lg: 480px;   /* Smartphones grandes */
--tablet: 768px;      /* Tablets */
--desktop: 1024px;    /* Desktop pequeno */
--desktop-lg: 1280px; /* Desktop médio */
--desktop-xl: 1536px; /* Desktop grande */
```

### 4.2 Adaptações por Dispositivo

#### Mobile (< 768px)
- Header compacto (64px)
- Menu hamburger para configurações
- Cards em coluna única
- Input fixo no bottom com 100% width
- Mensagens ocupam 90% da largura
- Font-sizes reduzidos em 10%
- Padding reduzido para `--spacing-4`

#### Tablet (768px - 1024px)
- Layout intermediário
- Cards podem ter 2 colunas em landscape
- Sidebar opcional para filtros
- Mensagens ocupam 70-80% da largura

#### Desktop (> 1024px)
- Sidebar fixa opcional (histórico de conversas)
- Cards em grid responsivo (2-3 colunas)
- Mensagens com max-width definido
- Espaçamento generoso

### 4.3 Touch e Acessibilidade
- Áreas de toque mínimas: 44x44px
- Contraste WCAG AA mínimo (4.5:1)
- Navegação por teclado completa
- ARIA labels em todos os interativos
- Focus visible em todos os elementos
- Suporte a dark mode (futuro)

---

## 5. Interações e Animações

### 5.1 Transições
```css
/* Transições padrão */
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

/* Hover em cards */
transition: transform 200ms ease, box-shadow 200ms ease;

/* Entrada de mensagens */
animation: slideInUp 300ms ease-out;

/* Loading states */
animation: pulse 1.5s infinite;
```

### 5.2 Micro-interações
- **Botão enviar**: Pulsa ao hover
- **Cards**: Scale 1.02 e sombra ao hover
- **Input focus**: Border cresce suavemente
- **Mensagens**: Fade in + slide up
- **Typing indicator**: Dots animados
- **Success feedback**: Checkmark animado
- **Error shake**: Mensagem treme levemente

### 5.3 Feedback Visual
- **Envio de mensagem**: Blur + fade out do input
- **Carregamento**: Skeleton screens + spinner
- **Sucesso**: Verde suave flash
- **Erro**: Vermelho suave flash + shake
- **Scroll automático**: Smooth scroll

---

## 6. Arquitetura Técnica

### 6.1 Stack Tecnológico Recomendado

#### Front-End Framework
**Opção 1: React + TypeScript** (Recomendado)
```
- React 18+
- TypeScript 5+
- Vite (build tool)
```

**Opção 2: Next.js** (Se precisar SSR)
```
- Next.js 14+
- TypeScript
- App Router
```

#### Gerenciamento de Estado
```
- Zustand (leve e simples)
- ou React Context + useReducer
- TanStack Query (para cache e sincronização)
```

#### UI e Estilização
```
- Tailwind CSS 3+ (utility-first)
- Headless UI ou Radix UI (componentes acessíveis)
- Framer Motion (animações)
- Lucide React (ícones)
```

#### Comunicação
```
- Axios ou Fetch API
- Socket.io ou Server-Sent Events (para streaming)
- WebSocket (se necessário real-time)
```

#### Testes
```
- Vitest (testes unitários)
- Testing Library (testes de componentes)
- Playwright (testes E2E)
```

### 6.2 Estrutura de Pastas
```
frontend/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── og-image.png
│
├── src/
│   ├── app/                    # Next.js App Router (se usar Next)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/             # Componentes React
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── Message.tsx
│   │   │   ├── UserMessage.tsx
│   │   │   ├── AssistantMessage.tsx
│   │   │   ├── LoadingMessage.tsx
│   │   │   └── InputArea.tsx
│   │   │
│   │   ├── cards/
│   │   │   ├── DeputadoCard.tsx
│   │   │   ├── ProposicaoCard.tsx
│   │   │   ├── DespesaCard.tsx
│   │   │   └── EventoCard.tsx
│   │   │
│   │   ├── ui/                 # Componentes base reutilizáveis
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   └── features/
│   │       ├── QuickActions.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       └── NoResults.tsx
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useChat.ts
│   │   ├── useMCP.ts
│   │   ├── useDeputados.ts
│   │   ├── useProposicoes.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── lib/                    # Bibliotecas e utilidades
│   │   ├── mcp-client.ts      # Cliente MCP
│   │   ├── llm-client.ts      # Cliente LLM (OpenAI/Anthropic)
│   │   ├── api.ts             # API wrapper
│   │   ├── formatting.ts      # Formatação de dados
│   │   └── constants.ts       # Constantes
│   │
│   ├── store/                  # Gerenciamento de estado
│   │   ├── chat-store.ts
│   │   ├── user-store.ts
│   │   └── config-store.ts
│   │
│   ├── types/                  # TypeScript types
│   │   ├── chat.ts
│   │   ├── deputado.ts
│   │   ├── proposicao.ts
│   │   ├── mcp.ts
│   │   └── api.ts
│   │
│   ├── styles/                 # Estilos globais
│   │   ├── globals.css
│   │   ├── variables.css      # CSS variables
│   │   └── animations.css
│   │
│   └── utils/                  # Funções utilitárias
│       ├── cn.ts              # Class name merger
│       ├── format-date.ts
│       ├── format-currency.ts
│       └── validators.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .env.local
├── .eslintrc.json
├── .prettierrc
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts             # ou next.config.js
├── package.json
└── README.md
```

### 6.3 Fluxo de Dados Detalhado

```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│                                                          │
│  User Input → Chat Store → LLM Client                   │
│                                   ↓                      │
│                            Send to LLM API               │
│                            (Claude/GPT)                  │
│                                   ↓                      │
│                       LLM decides to use                 │
│                       MCP tools                          │
│                                   ↓                      │
│                            MCP Client → MCP Server       │
│                                          ↓               │
│                                   API Câmara             │
│                                          ↓               │
│  Display ← Format ← Parse ← Response ← Data             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 6.4 Configuração do Cliente MCP

```typescript
// lib/mcp-client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class MCPClient {
  private client: Client;
  private transport: StdioClientTransport;

  constructor() {
    this.transport = new StdioClientTransport({
      command: 'node',
      args: ['/path/to/mcp-camara-br/dist/server.js']
    });

    this.client = new Client({
      name: 'agente-cidadao-frontend',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    });
  }

  async connect() {
    await this.client.connect(this.transport);
  }

  async listTools() {
    return await this.client.listTools();
  }

  async callTool(name: string, params: Record<string, any>) {
    return await this.client.callTool({
      name,
      arguments: params
    });
  }
}
```

### 6.5 Integração com LLM

```typescript
// lib/llm-client.ts
import Anthropic from '@anthropic-ai/sdk';
import { MCPClient } from './mcp-client';

export class LLMClient {
  private anthropic: Anthropic;
  private mcpClient: MCPClient;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
    this.mcpClient = new MCPClient();
  }

  async sendMessage(message: string, history: Message[]) {
    // Get available MCP tools
    const tools = await this.mcpClient.listTools();

    // Send to Claude with tools
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      tools: tools.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema
      })),
      messages: [
        ...history,
        { role: 'user', content: message }
      ]
    });

    // Handle tool calls
    if (response.stop_reason === 'tool_use') {
      const toolResults = await this.handleToolCalls(response.content);
      // Continue conversation with tool results...
    }

    return response;
  }

  private async handleToolCalls(content: any[]) {
    const results = [];
    for (const block of content) {
      if (block.type === 'tool_use') {
        const result = await this.mcpClient.callTool(
          block.name,
          block.input
        );
        results.push(result);
      }
    }
    return results;
  }
}
```

---

## 7. Funcionalidades Principais

### 7.1 Chat Conversacional

#### Recursos
- **Histórico de conversas**: Salvar/carregar conversas anteriores
- **Editar mensagens**: Reenviar pergunta editada
- **Copiar respostas**: Botão de copiar em cada mensagem
- **Compartilhar**: URL curta para compartilhar conversa
- **Exportar**: PDF ou JSON da conversa

#### Comportamentos
- Auto-scroll para última mensagem
- Indicador de "digitando..." quando LLM está processando
- Retry automático em caso de erro de rede
- Timeout de 30 segundos com mensagem clara

### 7.2 Busca e Filtros

#### Busca Semântica
- Perguntas em linguagem natural
- Sugestões de autocomplete baseadas em perguntas comuns
- Correção de erros de digitação (fuzzy search)

#### Filtros Avançados (Sidebar opcional)
```
┌─────────────────────────────┐
│ Filtros                     │
├─────────────────────────────┤
│ 📅 Período                  │
│ [  ] Última semana          │
│ [  ] Último mês             │
│ [✓] Último ano              │
│ [  ] Personalizado          │
│                             │
│ 🏛️ Tipo de Dado             │
│ [✓] Deputados               │
│ [✓] Proposições             │
│ [✓] Despesas                │
│ [ ] Votações                │
│                             │
│ 📍 Estado (UF)              │
│ [Dropdown com todos UFs]    │
│                             │
│ [Aplicar] [Limpar]          │
└─────────────────────────────┘
```

### 7.3 Visualizações de Dados

#### Gráficos (Opcionais)
- **Despesas por mês**: Gráfico de linha
- **Deputados por UF**: Gráfico de barras
- **Proposições por tipo**: Gráfico de pizza
- **Timeline de votações**: Linha do tempo

**Bibliotecas sugeridas**:
- Recharts (React charts)
- Chart.js
- D3.js (para visualizações complexas)

### 7.4 Ações Contextuais

#### Em Cards de Deputado
- Ver perfil completo
- Ver despesas
- Ver proposições
- Ver discursos
- Ver histórico de votações
- Adicionar aos favoritos
- Compartilhar perfil

#### Em Cards de Proposição
- Ver texto completo
- Ver autores
- Ver tramitação
- Ver emendas
- Ver votações
- Adicionar aos favoritos
- Receber alertas

### 7.5 Recursos de Usuário

#### Favoritos
- Salvar deputados favoritos
- Salvar proposições de interesse
- Organizar em listas personalizadas

#### Alertas (Futuro)
- Notificar sobre nova proposição de deputado favorito
- Notificar sobre votação importante
- Notificar sobre novas despesas

#### Preferências
- Tema (claro/escuro)
- Densidade de informação (compacta/confortável)
- Idioma (PT-BR por padrão)
- Notificações (email/push)

---

## 8. Requisitos Não-Funcionais

### 8.1 Performance

#### Métricas Alvo
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

#### Otimizações
- Code splitting por rota
- Lazy loading de componentes pesados
- Image optimization (WebP, lazy loading)
- Virtual scrolling para listas grandes
- Debounce em inputs (300ms)
- Cache de requisições (TanStack Query)
- Service Worker para cache offline

### 8.2 Acessibilidade (WCAG 2.1 AA)

#### Requisitos
- ✅ Contraste mínimo 4.5:1 para texto
- ✅ Contraste mínimo 3:1 para componentes UI
- ✅ Navegação completa por teclado (Tab, Enter, Esc)
- ✅ Focus visible em todos os elementos interativos
- ✅ ARIA labels e roles corretos
- ✅ Headings hierárquicos (h1 → h2 → h3)
- ✅ Alt text em todas as imagens
- ✅ Suporte a leitores de tela (NVDA, JAWS, VoiceOver)
- ✅ Zoom até 200% sem quebrar layout
- ✅ Texto redimensionável

### 8.3 SEO

#### Meta Tags
```html
<title>Agente Cidadão - Dados Públicos da Câmara dos Deputados</title>
<meta name="description" content="Consulte dados públicos da Câmara dos Deputados de forma simples através de perguntas em linguagem natural.">
<meta name="keywords" content="câmara, deputados, proposições, dados abertos, transparência, brasil">

<!-- Open Graph -->
<meta property="og:title" content="Agente Cidadão">
<meta property="og:description" content="Seu assistente de dados públicos">
<meta property="og:image" content="/og-image.png">
<meta property="og:type" content="website">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Agente Cidadão">
<meta name="twitter:description" content="Consulte dados públicos da Câmara">
```

#### Schema.org
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Agente Cidadão",
  "description": "Assistente de dados públicos brasileiros",
  "url": "https://agentecidadao.gov.br",
  "applicationCategory": "GovernmentApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "BRL"
  }
}
```

### 8.4 Segurança

#### Proteções
- ✅ HTTPS obrigatório
- ✅ Content Security Policy (CSP)
- ✅ Sanitização de inputs
- ✅ Proteção contra XSS
- ✅ Rate limiting no frontend (prevenir spam)
- ✅ Validação de dados do MCP/LLM
- ✅ Não expor API keys no frontend
- ✅ Secure cookies (HttpOnly, Secure, SameSite)

#### Variáveis de Ambiente
```bash
# .env.example
VITE_API_URL=http://localhost:3000
VITE_MCP_PATH=/path/to/mcp-server
VITE_LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-xxx (server-side only!)
```

### 8.5 Monitoramento

#### Analytics
- **Google Analytics 4** ou **Plausible** (privacy-friendly)
- Eventos customizados:
  - `chat_message_sent`
  - `tool_called`
  - `card_clicked`
  - `export_data`
  - `share_conversation`

#### Error Tracking
- **Sentry** para tracking de erros
- Logs estruturados enviados ao backend
- Alertas para erros críticos

#### Performance Monitoring
- **Web Vitals** tracking
- **Lighthouse CI** em cada deploy
- Monitoramento de tempo de resposta da API

---

## 9. Roadmap de Desenvolvimento

### 9.1 Fase 1: MVP (4-6 semanas)

#### Semana 1-2: Setup e Estrutura
- [ ] Setup do projeto (React + TypeScript + Vite)
- [ ] Configuração Tailwind CSS + design system
- [ ] Estrutura de pastas e arquitetura
- [ ] Componentes UI base (Button, Card, Input, etc.)
- [ ] Sistema de cores e tipografia
- [ ] Configuração ESLint + Prettier + Husky

#### Semana 3-4: Funcionalidades Core
- [ ] Chat container e mensagens
- [ ] Input area com auto-resize
- [ ] Integração com MCP client
- [ ] Integração com LLM (Claude)
- [ ] Cards de Deputado e Proposição
- [ ] Loading states e error handling
- [ ] Responsividade mobile/tablet/desktop

#### Semana 5-6: Polimento e Testes
- [ ] Animações e transições
- [ ] Empty states e error states
- [ ] Histórico de conversas (localStorage)
- [ ] Testes unitários (componentes principais)
- [ ] Testes E2E (fluxos principais)
- [ ] Otimização de performance
- [ ] Documentação técnica

### 9.2 Fase 2: Funcionalidades Avançadas (4-6 semanas)

- [ ] Sidebar com filtros avançados
- [ ] Favoritos e listas personalizadas
- [ ] Exportação de dados (PDF, CSV, JSON)
- [ ] Compartilhamento de conversas
- [ ] Visualizações com gráficos
- [ ] Dark mode
- [ ] Configurações de usuário
- [ ] PWA (Progressive Web App)

### 9.3 Fase 3: Expansão (Futuro)

- [ ] Integração com outros órgãos públicos (Senado, TCU, etc.)
- [ ] Sistema de alertas e notificações
- [ ] Análises e relatórios personalizados
- [ ] Comparações entre deputados
- [ ] API pública do Agente Cidadão
- [ ] Versão mobile nativa (React Native)
- [ ] Multilíngua (EN, ES)

---

## 10. Guia de Implementação Rápida

### 10.1 Quick Start

```bash
# 1. Criar projeto
npm create vite@latest agente-cidadao-frontend -- --template react-ts
cd agente-cidadao-frontend

# 2. Instalar dependências essenciais
npm install tailwindcss postcss autoprefixer
npm install @anthropic-ai/sdk
npm install @modelcontextprotocol/sdk
npm install zustand @tanstack/react-query
npm install lucide-react framer-motion
npm install clsx tailwind-merge

# 3. Instalar dependências de dev
npm install -D @types/node
npm install -D eslint prettier
npm install -D vitest @testing-library/react

# 4. Configurar Tailwind
npx tailwindcss init -p

# 5. Rodar projeto
npm run dev
```

### 10.2 Exemplo Mínimo de Componente Chat

```typescript
// src/components/chat/ChatContainer.tsx
import { useState } from 'react';
import { LLMClient } from '@/lib/llm-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const llmClient = new LLMClient(import.meta.env.VITE_ANTHROPIC_KEY);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await llmClient.sendMessage(input, messages);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content[0].text
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-cinza-100">
      {/* Header */}
      <header className="bg-verde-camara-primary text-white p-4">
        <h1 className="text-2xl font-bold">Agente Cidadão</h1>
        <p className="text-sm opacity-90">Seu assistente de dados públicos</p>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-verde-camara-primary text-white'
                  : 'bg-white border border-cinza-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-center">Pensando...</div>}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-cinza-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Digite sua pergunta..."
            className="flex-1 p-3 border border-cinza-200 rounded-lg focus:border-verde-camara-primary focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-6 py-3 bg-verde-camara-primary text-white rounded-lg hover:bg-verde-camara-dark disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 10.3 Configuração Tailwind com Cores Customizadas

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'verde-camara': {
          primary: '#00693D',
          dark: '#004D2C',
          light: '#008B4D',
          pale: '#E8F5F0',
          accent: '#00A854',
        },
        'amarelo-bandeira': '#FFDF00',
        'azul-bandeira': '#002776',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

---

## 11. Checklist de Qualidade

### 11.1 Antes de Cada Deploy

- [ ] Build sem erros ou warnings
- [ ] Todos os testes passando
- [ ] Lighthouse score > 90 (Performance, Accessibility)
- [ ] Testes manuais em Chrome, Firefox, Safari
- [ ] Testes em mobile (iOS e Android)
- [ ] Validação de acessibilidade (axe DevTools)
- [ ] Verificação de contraste de cores
- [ ] Review de código (se em equipe)
- [ ] Atualização de CHANGELOG.md
- [ ] Variáveis de ambiente configuradas

### 11.2 Code Review Checklist

- [ ] Código segue convenções do projeto
- [ ] Componentes são reutilizáveis
- [ ] Sem código duplicado
- [ ] Tratamento de erros adequado
- [ ] Loading states implementados
- [ ] Responsividade verificada
- [ ] Acessibilidade verificada
- [ ] Performance verificada (sem re-renders desnecessários)
- [ ] TypeScript types corretos (sem any)
- [ ] Comentários em código complexo

---

## 12. Recursos e Referências

### 12.1 Design Inspiration
- **Câmara dos Deputados**: https://www.camara.leg.br
- **ChatGPT Interface**: https://chat.openai.com
- **Claude Interface**: https://claude.ai
- **Perplexity AI**: https://www.perplexity.ai
- **Gov.br Design System**: https://www.gov.br/ds

### 12.2 Bibliotecas Recomendadas

#### UI Components
- **Shadcn/ui**: https://ui.shadcn.com (componentes acessíveis)
- **Radix UI**: https://www.radix-ui.com (primitivos headless)
- **Headless UI**: https://headlessui.com (Tailwind integration)

#### Icons
- **Lucide React**: https://lucide.dev
- **Heroicons**: https://heroicons.com
- **Phosphor Icons**: https://phosphoricons.com

#### Charts
- **Recharts**: https://recharts.org
- **Chart.js**: https://www.chartjs.org
- **Victory**: https://formidable.com/open-source/victory

#### Animations
- **Framer Motion**: https://www.framer.com/motion
- **Auto Animate**: https://auto-animate.formkit.com
- **React Spring**: https://www.react-spring.dev

#### Forms
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev (validação)
- **Conform**: https://conform.guide

### 12.3 Documentação Técnica
- **MCP SDK**: https://modelcontextprotocol.io/docs
- **Anthropic API**: https://docs.anthropic.com
- **Dados Abertos Câmara**: https://dadosabertos.camara.leg.br/swagger/api.html
- **React Docs**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 13. Glossário

- **LLM**: Large Language Model (Claude, GPT, etc.)
- **MCP**: Model Context Protocol
- **SSR**: Server-Side Rendering
- **CSR**: Client-Side Rendering
- **PWA**: Progressive Web App
- **WCAG**: Web Content Accessibility Guidelines
- **ARIA**: Accessible Rich Internet Applications
- **TTI**: Time to Interactive
- **FCP**: First Contentful Paint
- **LCP**: Largest Contentful Paint
- **CLS**: Cumulative Layout Shift
- **Câmara**: Câmara dos Deputados do Brasil
- **Proposição**: Projeto de lei, emenda, ou outro documento legislativo
- **Deputado**: Membro eleito da Câmara dos Deputados

---

## 14. Contato e Suporte

### Para Desenvolvedores
- **Repositório**: [Link do GitHub]
- **Issues**: [Link para Issues]
- **Discussões**: [Link para Discussions]
- **Wiki**: [Link para Wiki]

### Para Usuários
- **Email**: contato@agentecidadao.gov.br (exemplo)
- **FAQ**: [Link para FAQ]
- **Tutorial**: [Link para Tutorial]

---

**Versão**: 1.0.0
**Data**: 2025-11-14
**Autor**: Especificação criada para o projeto Agente Cidadão
**Status**: Draft para aprovação

---

## Próximos Passos

1. **Revisar esta especificação** com stakeholders
2. **Aprovar design system** (cores, tipografia, componentes)
3. **Criar protótipo navegável** (Figma/Adobe XD)
4. **Validar com usuários** (testes de usabilidade)
5. **Iniciar desenvolvimento** seguindo o roadmap
6. **Iterar baseado em feedback**

Esta especificação é um documento vivo e deve ser atualizada conforme o projeto evolui.

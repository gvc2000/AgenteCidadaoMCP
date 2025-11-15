# Especificação Front-End: Agente Cidadão

---

## 1. Visão geral do produto

**Nome:** Agente Cidadão
**Função principal:** Interface tipo chat onde qualquer pessoa pode digitar perguntas em linguagem natural sobre o trabalho legislativo e receber respostas baseadas em dados oficiais (inicialmente, Dados Abertos da Câmara dos Deputados).

**Flow técnico (resumido):**

1. Cidadão digita pergunta no front-end.
2. Front chama uma API de orquestração (`/api/consulta`).
3. Backend usa LLM → MCP → APIs de dados abertos (inicialmente Câmara).
4. Resposta estruturada volta para o front com:
   * Texto em linguagem natural.
   * Referências às fontes (links e metadados).
   * Opcionalmente tabelas / estatísticas em JSON.

---

## 2. Referências de design

* **Tonalidade visual base:**
  Usar a identidade da Câmara dos Deputados:
  * Verde institucional: `#00AA4D` ([Brandfetch](https://brandfetch.com/camara.leg.br))
  * Um verde mais escuro derivado para cabeçalhos: algo como `#006636`.
  * Cor de apoio (dourado claro): `#E3AD6D`. ([Brandfetch](https://brandfetch.com/camara.leg.br))

* **Estilo geral:**
  Inspirar-se no **portal de Dados Abertos da Câmara** (estrutura clara, bastante branco, texto legível e blocos de informação) ([dadosabertos.camara.leg.br](https://dadosabertos.camara.leg.br))
  e em interfaces cidadãs limpas como:
  * **Portal da Transparência** (card-based, muita área branca, foco em busca e filtros). ([Portal da Transparência](https://portaldatransparencia.gov.br))
  * **Portal Acesso à Informação / LAI**, que mostra números e indicadores em destaque, com layout bem simples e direto. ([Serviços e Informações do Brasil](https://www.gov.br/acessoainformacao/pt-br))

A ideia é: **look institucional, mas moderno**, com menos "portalzão pesado" e mais "app de chat".

---

## 3. Identidade visual do front-end

### 3.1 Paleta de cores

* **Primária:**
  * `#00AA4D` – Verde Câmara (botões principais, barras, links importantes).
* **Primária escura (hover/barras):**
  * `#006636`
* **Secundária / Destaque:**
  * `#E3AD6D` – para badges de fonte, pequenos destaques.
* **Plano de fundo:**
  * `#F5F7FA` – background geral.
  * `#FFFFFF` – caixas de conteúdo / cartões / mensagens.
* **Texto:**
  * Primário: `#1F2933`
  * Secundário: `#6B7280` (legendas, metadados).
* **Estados:**
  * Sucesso: `#16A34A`
  * Alerta: `#F59E0B`
  * Erro: `#DC2626`

### 3.2 Tipografia

* Fonte sans-serif moderna, com boa legibilidade:
  * Preferência: **Inter** ou **Roboto**.
* Hierarquia:
  * Títulos (h1): 26–32px, bold.
  * Subtítulos (h2/h3): 18–22px, semibold.
  * Texto corpo: 14–16px, regular.
  * Metadados / labels: 12–13px, uppercase ou semibold.

### 3.3 Estilo de componentes

* **Cards** com cantos levemente arredondados (8–12px).
* Sombra suave apenas em elementos clicáveis (card de resultado, caixa de chat).
* Ícones minimalistas (por ex. Heroicons/Lucide), uma cor só (outline).
* Evitar muita borda: usar sombras e contraste de fundo pra separar seções.

---

## 4. Estrutura de páginas

Pensando já na expansão futura (outros órgãos):

1. **/ (Home – Chat do Agente Cidadão)**
   * Principal ponto de entrada.
   * Hero pequeno explicando o que é.
   * Componente de chat ocupando a maior parte da tela.

2. **/fontes**
   * Lista de fontes de dados conectadas:
     * Câmara dos Deputados (ativo).
     * Futuro: Senado, Portal da Transparência, dados.gov.br, etc. ([dados.gov.br](https://dados.gov.br))
   * Cada fonte com:
     * Nome, logotipo/ícone.
     * Descrição do tipo de dados disponíveis.
     * Link para documentação oficial.

3. **/como-funciona**
   * Explicação simplificada do pipeline:
     * Pergunta → LLM → MCP → APIs de dados abertos.
   * Diagrama visual simples.
   * Seção de privacidade / limitações.

4. **/sobre**
   * Filosofia do projeto: cidadania, transparência, LAI.
   * Links para LAI, Dados Abertos, etc. ([Serviços e Informações do Brasil](https://www.gov.br/acessoainformacao/pt-br))

---

## 5. Layout da página principal (chat)

### 5.1 Versão desktop (≥ 1024px)

**Layout em 3 zonas:**

1. **Header fixo (topo):**
   * Esquerda: logotipo "Agente Cidadão" + pequeno subtítulo:
     * "Seu assistente para consultar dados públicos".
   * Direita:
     * Botões: "Fontes de dados", "Como funciona", "Sobre".
     * Ícone de modo claro/escuro (opcional).

2. **Conteúdo principal em duas colunas:**
   * **Coluna esquerda (25–30%) – Contexto / filtros:**
     * Bloco "O que posso perguntar?" com exemplos:
       * "Como votou meu deputado na PEC X?"
       * "Quais foram os gastos de gabinete do deputado Y em 2023?"
     * Seção "Fontes ativas" com chips:
       * [✓] Câmara dos Deputados
       * [ ] Outras (em breve)
   * **Coluna direita (70–75%) – Chat:**
     * Caixa de chat central:
       * Cabeçalho pequeno: "Converse com o Agente Cidadão".
       * Lista de mensagens (bubble-style):
         * Mensagens do usuário alinhadas à direita.
         * Mensagens do agente alinhadas à esquerda.
       * Em cada mensagem do agente:
         * Texto principal da resposta.
         * Lista de fontes (chips):
           Exemplo: **Câmara dos Deputados – Dados Abertos** (link) ([dadosabertos.camara.leg.br](https://dadosabertos.camara.leg.br))
         * Botão "Ver dados brutos" para abrir um painel lateral com tabelas/JSON.

3. **Input fixo no rodapé da área de chat:**
   * Campo de texto multi-linha:
     * Placeholder: "Faça uma pergunta sobre o trabalho legislativo ou dados públicos…"
   * Botão principal (verde): "Perguntar".
   * Opcional: botão de atalho "Sugestões" com perguntas prontas.

### 5.2 Versão mobile (≤ 768px)

* **Header compacto** com logo + menu hambúrguer.
* **Chat ocupa 100% da largura**, rolagem vertical.
* Input fixo na parte de baixo (tipo WhatsApp/Telegram).
* Seção de exemplos e fontes em:
  * Um **drawer** ("O que posso perguntar?") aberto ao toque em um botão no topo do chat, ou
  * Abaixo das primeiras mensagens, antes da primeira pergunta.

---

## 6. Componentes principais (especificação funcional)

### 6.1 `<ChatLayout>`

* Responsável pelo layout da área de chat.
* Props principais:
  * `messages: Message[]`
  * `onSend(message: string): void`
  * `isLoading: boolean`

### 6.2 `Message`

```ts
type MessageRole = 'user' | 'assistant' | 'system';

type SourceTag = {
  orgao: 'Camara dos Deputados' | 'Senado' | 'Portal da Transparencia' | string;
  url: string;
  tipoDado: string; // ex.: 'votação', 'proposição', 'gastos de gabinete'
};

type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  sources?: SourceTag[];
  rawDataId?: string; // identificador para puxar dados brutos em outro painel
};
```

### 6.3 `<MessageBubble>`

* Diferente estilo para `user` e `assistant`.
* Para mensagens do `assistant`:
  * Texto com possibilidade de markdown básico.
  * Lista de `SourceTag` como chips clicáveis.
  * Link "Ver dados brutos" se `rawDataId` presente.

### 6.4 `<ChatInput>`

* Campo de texto com:
  * `Enter` envia.
  * `Shift+Enter` quebra linha.
* Botão enviar com estado:
  * Normal / carregando / desabilitado (quando string vazia).

### 6.5 `<SourceBadge>`

* Chip pequeno com:
  * Nome do órgão.
  * Cor secundária (`#E3AD6D`) com texto verde escuro.
  * Ao clicar, abre nova aba com a documentação ou página da fonte.

### 6.6 Estados e feedback

* **Carregando:**
  * Skeleton de mensagem do agente.
  * Indicador "Consultando dados oficiais…" + animação sutil de pontos.
* **Erro:**
  * Toast fixo no topo do chat:
    * "Não foi possível obter resposta agora. Tente novamente em alguns instantes."
  * Detalhes técnicos escondidos atrás de um botão "Detalhes técnicos" (útil para devs).

---

## 7. Arquitetura sugerida do front-end

### 7.1 Stack (sugestão)

* **Framework:** React + Next.js (SSR/SSG para páginas estáticas e melhor SEO).
* **Estilo:** Tailwind CSS ou CSS-in-JS (Chakra, por exemplo) para rapidez de prototipação.
* **Gerenciamento de estado:** Zustand/Redux ou apenas React Query + estado local.

### 7.2 Camadas lógicas

1. **Camada de UI (componentes):**
   * Botões, cards, chat, badges, toasts.

2. **Camada de containers / páginas:**
   * `pages/index.tsx` → página de chat.
   * `pages/fontes.tsx` → fontes.
   * `pages/como-funciona.tsx`
   * `pages/sobre.tsx`

3. **Camada de serviços (API client):**
   * `/services/api.ts` com funções:
     ```ts
     async function enviarPergunta(payload: {
       pergunta: string;
       contexto?: any;
     }): Promise<RespostaLLM> { ... }
     ```
   * Suporte a streaming via SSE ou WebSocket (ideal pra experiência "LLM").

4. **Modelo de dados compartilhado:**
   * Tipos TypeScript para `Message`, `SourceTag`, `RespostaLLM`, etc., reaproveitados na API e no front.

### 7.3 Fluxo de interação (front)

1. Usuário digita pergunta no `<ChatInput>`.
2. Front adiciona a mensagem do usuário à lista local de `messages`.
3. Front chama `enviarPergunta` (POST /api/consulta).
4. Enquanto a resposta vem:
   * `isLoading = true`, mostra skeleton.
5. Assim que o backend retorna:
   * Adiciona `Message` do tipo `assistant` com `content` + `sources`.
   * Atualiza estado → re-renderiza o chat.

---

## 8. Preparação para múltiplas fontes de dados

Mesmo que no início só exista a **Câmara dos Deputados**, vale já definir padrão:

* Cada resposta do backend traz um array de fontes, por exemplo:

```json
{
  "answer": "... texto em linguagem natural ...",
  "sources": [
    {
      "orgao": "Camara dos Deputados",
      "url": "https://dadosabertos.camara.leg.br/api/v2/votacoes/...",
      "tipoDado": "votacao"
    }
  ]
}
```

No futuro, ao conectar:

* **Senado Federal** (dados abertos). ([Senado Legislação](https://legis.senado.leg.br/dadosabertos/api-docs/swagger-ui/index.html))
* **Portal da Transparência** para gastos. ([Portal da Transparência](https://portaldatransparencia.gov.br))
* **Portal Brasileiro de Dados Abertos** para outros temas. ([dados.gov.br](https://dados.gov.br))

basta o front exibir mais `SourceBadge` diferentes para a mesma resposta.

---

## Próximos Passos

Este documento pode ser expandido para:

* **Documento técnico (spec)** com requisitos funcionais/não-funcionais detalhados
* **Layout em HTML/CSS/React** com implementação do design especificado

---

**Última atualização:** 2025-11-15
**Versão:** 2.0.0

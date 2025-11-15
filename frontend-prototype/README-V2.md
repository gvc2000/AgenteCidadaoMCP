# Protótipo Front-End Agente Cidadão v2.0

## 📋 Visão Geral

Este é o **protótipo interativo v2.0** da interface do **Agente Cidadão**, uma aplicação web tipo chat que permite aos cidadãos consultarem dados legislativos públicos em linguagem natural.

O protótipo foi desenvolvido com base na especificação completa em `FRONTEND_SPEC.md` e implementa todas as diretrizes de design e funcionalidade especificadas.

## 🎨 Design Implementado

### Paleta de Cores
- **Verde Câmara**: `#00AA4D` (botões, links, elementos principais)
- **Verde Escuro**: `#006636` (hover, cabeçalhos)
- **Dourado**: `#E3AD6D` (badges de fonte, destaques)
- **Background Geral**: `#F5F7FA`
- **Background Branco**: `#FFFFFF` (cards, mensagens)
- **Texto Primário**: `#1F2933`
- **Texto Secundário**: `#6B7280`

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Títulos**: 26-32px, bold
- **Subtítulos**: 18-22px, semibold
- **Texto corpo**: 14-16px, regular
- **Metadados**: 12-13px, semibold

## 📂 Arquivo do Protótipo

**Arquivo principal**: `agente-cidadao-v2.html`

Este é um arquivo HTML autocontido (standalone) que inclui:
- ✅ HTML estrutural
- ✅ CSS inline completo
- ✅ JavaScript interativo
- ✅ Nenhuma dependência externa (exceto fonte Google Fonts)

## 🚀 Como Visualizar

### Opção 1: Abrir Diretamente no Navegador

```bash
# Navegue até a pasta do protótipo
cd frontend-prototype

# Abra o arquivo no navegador padrão
# macOS:
open agente-cidadao-v2.html

# Linux:
xdg-open agente-cidadao-v2.html

# Windows:
start agente-cidadao-v2.html
```

### Opção 2: Usar um Servidor HTTP Local

```bash
# Com Python 3
python3 -m http.server 8000

# Com Node.js (npx)
npx http-server -p 8000

# Depois acesse:
# http://localhost:8000/agente-cidadao-v2.html
```

### Opção 3: Usar o VS Code Live Server

1. Instale a extensão "Live Server" no VS Code
2. Clique com o botão direito em `agente-cidadao-v2.html`
3. Selecione "Open with Live Server"

## ✨ Funcionalidades Implementadas

### 1. Layout em 3 Zonas (Desktop)

#### Header Fixo
- Logotipo "Agente Cidadão" com gradiente verde
- Subtítulo descritivo
- Botões de navegação: "Fontes de dados", "Como funciona", "Sobre"

#### Sidebar Esquerda (25-30%)
- **Seção "O que posso perguntar?"**
  - 4 exemplos de perguntas clicáveis
  - Ao clicar, a pergunta é inserida no chat

- **Seção "Fontes ativas"**
  - Chip "Câmara dos Deputados" (ativo)
  - Chip "Outras (em breve)" (inativo)

#### Área de Chat (70-75%)
- **Mensagem de boas-vindas** inicial
- **Lista de mensagens** em estilo bubble:
  - Mensagens do usuário (direita, verde)
  - Mensagens do assistente (esquerda, cinza claro)
- **Badges de fonte** clicáveis (dourado)
- **Botão "Ver dados brutos"** para respostas que incluem dados estruturados

### 2. Chat Interativo

- **Input de texto** com auto-resize
- **Botão "Perguntar"** com estados:
  - Normal: verde
  - Hover: verde escuro com elevação
  - Disabled: opacidade reduzida
- **Atalhos de teclado**:
  - `Enter`: envia mensagem
  - `Shift+Enter`: quebra linha

### 3. Estados e Feedback

#### Estado de Carregamento
- Skeleton com texto "Consultando dados oficiais..."
- Animação de 3 pontos pulsantes

#### Mensagens do Assistente
- Texto da resposta
- Lista de fontes com badges clicáveis
- Timestamps
- Botão para visualizar dados brutos (quando aplicável)

#### Toast de Erro
- Toast fixo no topo (vermelho)
- Mensagem de erro configurável
- Auto-dismiss após 5 segundos

### 4. Responsividade Mobile

Para telas ≤ 768px:
- Header compacto (sem subtítulo)
- Sidebar oculta
- Chat em largura total
- Input em coluna (botão abaixo do textarea)
- Mensagens com largura 95%

### 5. Simulação de Backend

O protótipo inclui uma **simulação de API** que:
- Detecta palavras-chave na pergunta do usuário
- Retorna respostas mock apropriadas
- Inclui fontes de dados mockadas
- Simula delay de 2 segundos (loading)

**Padrões de detecção**:
- `"vot"`, `"pec"` → Resposta sobre votações
- `"gasto"`, `"despesa"` → Resposta sobre gastos
- `"proposição"`, `"meio ambiente"` → Resposta sobre proposições
- Outros → Resposta genérica

## 🎯 Componentes Principais

### MessageBubble
- Estilo diferenciado para usuário vs assistente
- Suporte a markdown básico (pode ser expandido)
- Badges de fonte com links externos
- Botão para dados brutos

### SourceBadge
- Cor dourada (`#E3AD6D`)
- Texto verde escuro
- Ícone de documento
- Link clicável que abre em nova aba
- Efeito hover com elevação

### ChatInput
- Auto-resize baseado no conteúdo
- Máximo de 120px de altura
- Border focus com cor verde Câmara
- Placeholder descritivo

### LoadingIndicator
- Skeleton com texto descritivo
- 3 dots animados
- Animação suave de pulsação

## 📊 Dados Mock Utilizados

### Exemplo de Resposta sobre Votação
```json
{
  "content": "Encontrei informações sobre a votação solicitada...",
  "sources": [{
    "orgao": "Câmara dos Deputados – Votações",
    "url": "https://dadosabertos.camara.leg.br",
    "tipoDado": "votacao"
  }],
  "rawDataId": "votacao-123"
}
```

### Exemplo de Resposta sobre Gastos
```json
{
  "content": "Os gastos de gabinete do deputado em 2023...",
  "sources": [{
    "orgao": "Câmara dos Deputados – Despesas",
    "url": "https://dadosabertos.camara.leg.br",
    "tipoDado": "despesas"
  }],
  "rawDataId": "despesas-456"
}
```

## 🔄 Fluxo de Interação

1. **Usuário digita pergunta** no input
2. **Clica "Perguntar"** ou pressiona `Enter`
3. **Mensagem do usuário** aparece à direita (verde)
4. **Loading indicator** aparece
5. **Simulação de API** processa (2s)
6. **Resposta do assistente** aparece à esquerda com:
   - Texto da resposta
   - Badges de fonte
   - Botão de dados brutos (se aplicável)
7. **Scroll automático** para a última mensagem

## 🎨 Personalização de Estilos

### Variáveis CSS
Todas as cores, espaçamentos e tamanhos são definidos como variáveis CSS no `:root`:

```css
:root {
  --verde-camara: #00AA4D;
  --verde-escuro: #006636;
  --dourado: #E3AD6D;
  --bg-geral: #F5F7FA;
  --bg-branco: #FFFFFF;
  /* ... */
}
```

Para personalizar, basta alterar os valores dessas variáveis.

### Sombras e Bordas
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

--border-radius-sm: 6px;
--border-radius-md: 8px;
--border-radius-lg: 12px;
```

## 📱 Responsividade

### Breakpoints
- **Desktop**: ≥ 1024px (layout em 3 colunas)
- **Tablet**: 769px - 1023px (layout adaptado)
- **Mobile**: ≤ 768px (layout em coluna única)

### Ajustes Mobile
- Header compacto
- Sidebar oculta
- Chat 100% largura
- Input em coluna
- Mensagens mais estreitas (95%)

## 🚧 Próximos Passos (Implementação Real)

Para transformar este protótipo em aplicação real:

### 1. Migrar para React + Next.js
```bash
npx create-next-app@latest agente-cidadao --typescript --tailwind
```

### 2. Criar Componentes Reutilizáveis
- `<ChatLayout>`
- `<MessageBubble>`
- `<SourceBadge>`
- `<ChatInput>`
- `<LoadingIndicator>`

### 3. Integrar com API Real
```typescript
// services/api.ts
async function enviarPergunta(payload: {
  pergunta: string;
  contexto?: any;
}): Promise<RespostaLLM> {
  const response = await fetch('/api/consulta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return response.json();
}
```

### 4. Adicionar Funcionalidades Avançadas
- Streaming de respostas (Server-Sent Events)
- Histórico de conversas (localStorage ou backend)
- Autenticação de usuários
- Favoritar perguntas
- Exportar resultados
- Modo escuro

### 5. Otimizações de Performance
- Lazy loading de mensagens antigas
- Virtualização para muitas mensagens
- Debounce no input
- Cache de respostas

## 🧪 Testes Recomendados

### Testes de Usabilidade
- [ ] Testar em diferentes tamanhos de tela
- [ ] Validar responsividade mobile
- [ ] Testar com leitores de tela (acessibilidade)
- [ ] Verificar contraste de cores (WCAG)

### Testes Funcionais
- [ ] Envio de mensagens
- [ ] Scroll automático
- [ ] Auto-resize do textarea
- [ ] Loading states
- [ ] Error handling
- [ ] Links externos em nova aba

### Testes de Performance
- [ ] Tempo de carregamento inicial
- [ ] Performance com muitas mensagens
- [ ] Uso de memória
- [ ] Responsividade da UI

## 📚 Referências

- **Especificação completa**: `../FRONTEND_SPEC.md`
- **Design System Câmara**: [Brandfetch](https://brandfetch.com/camara.leg.br)
- **Portal Dados Abertos**: [dadosabertos.camara.leg.br](https://dadosabertos.camara.leg.br)
- **Tipografia**: [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)

## 🤝 Contribuindo

Para sugerir melhorias no protótipo:

1. Teste o protótipo em diferentes contextos
2. Documente problemas encontrados
3. Sugira melhorias de UX/UI
4. Proponha novas funcionalidades

## 📝 Changelog

### v2.0.0 (2025-11-15)
- ✨ Redesign completo baseado na nova especificação
- ✨ Layout em 3 zonas (header, sidebar, chat)
- ✨ Nova paleta de cores institucional
- ✨ Simulação de API com respostas mock
- ✨ Estados de loading e erro
- ✨ Responsividade mobile completa
- ✨ Badges de fonte clicáveis
- ✨ Mensagem de boas-vindas
- ✨ Sugestões de perguntas

---

**Desenvolvido para**: Agente Cidadão - Dados Públicos Legislativos
**Versão**: 2.0.0
**Data**: 2025-11-15

# 🎨 Design Clean - Agente Cidadão

## Visão Geral

Nova versão do protótipo com design **minimalista e institucional**, inspirado em interfaces governamentais modernas e no design system Gov.br.

---

## 🆚 Comparação: Original vs Clean

| Aspecto | Versão Original | Versão Clean |
|---------|----------------|--------------|
| **Paleta** | Verde dominante (#00693D) | Verde sutil como accent (#00652E) |
| **Background** | Cinza claro (#F7F9FA) | Off-white (#FAFAFA) |
| **Mensagens** | Bolhas arredondadas (1rem) | Blocos com bordas sutis (4px) |
| **Sombras** | Múltiplas sombras, efeitos | Sombras mínimas ou nenhuma |
| **Espaçamento** | Compacto | Mais whitespace |
| **Tipografia** | Inter com vários pesos | Open Sans (profissional) |
| **Header** | Verde sólido, 80px | Branco com borda, 60px |
| **Cards** | Sombras grandes, hover 3D | Bordas simples, hover sutil |
| **Bordas** | Muito arredondadas (12-16px) | Sutis (4px) |
| **Botões** | Hover com lift | Hover com cores |
| **Avatar bot** | Círculo colorido com emoji | Sem avatar visual |
| **Layout** | Chat-first | Grid estruturado |

---

## 🎨 Paleta de Cores Clean

### Verde Institucional (Accent)
```css
--verde-institucional: #00652E   /* Primário - botões, bordas accent */
--verde-accent: #00884B          /* Links, hover */
--verde-hover: #005A28           /* Hover em botões */
--verde-light: #E8F4EF           /* Backgrounds sutis */
--verde-border: #C8E6D7          /* Bordas de badges */
```

### Neutros (Base)
```css
--branco: #FFFFFF                /* Cards, inputs */
--off-white: #FAFAFA             /* Background principal */
--cinza-50: #F8F9FA              /* Backgrounds secundários */
--cinza-100: #F1F3F5             /* Input backgrounds */
--cinza-200: #E9ECEF             /* Bordas principais */
--cinza-300: #DEE2E6             /* Bordas secundárias */
--cinza-400: #CED4DA             /* Bordas hover */
--cinza-500: #ADB5BD             /* Texto secundário */
--cinza-600: #6C757D             /* Texto terciário */
--cinza-700: #495057             /* Texto principal */
--cinza-800: #343A40             /* Texto enfatizado */
--cinza-900: #212529             /* Títulos */
```

### Azul (Links)
```css
--azul-link: #0066CC             /* Links padrão */
--azul-link-hover: #004C99       /* Links hover */
```

---

## 📐 Princípios de Design

### 1. Minimalismo
- **Menos é mais**: Remover elementos desnecessários
- **Whitespace**: Mais espaço entre elementos
- **Hierarquia clara**: Tipografia estruturada
- **Sem decoração**: Cores funcionais, não decorativas

### 2. Institucional
- **Profissional**: Cores neutras dominantes
- **Confiável**: Layout estruturado e previsível
- **Acessível**: Alto contraste, foco visível
- **Governamental**: Inspirado em Gov.br

### 3. Funcional
- **Clareza**: Informação organizada
- **Usabilidade**: Interações óbvias
- **Performance**: Transições rápidas (150ms)
- **Responsivo**: Mobile-first

---

## 🧩 Componentes Redesenhados

### Header
**Antes:**
- Background verde sólido (#00693D)
- 80px altura
- Sombra pronunciada
- Logo emoji grande (2.5rem)

**Depois:**
- Background branco
- Borda inferior sutil (#E9ECEF)
- 60px altura (mais compacto)
- Logo discreto em quadrado (40x40px)
- Tipografia mais sóbria

```css
.header {
    background: var(--branco);
    border-bottom: 1px solid var(--cinza-200);
    padding: 1rem 0;
}
```

### Mensagens
**Antes:**
- Bolhas com bordas muito arredondadas
- Avatar circular colorido
- Sombras grandes
- Cores vibrantes

**Depois:**
- Blocos com borda lateral de 3px
- Label superior discreto (uppercase, 0.75rem)
- Sem sombras
- Background sutil

**Usuário:**
```css
.message.user .message-content {
    background: var(--verde-light);
    border-left: 3px solid var(--verde-institucional);
}
```

**Assistente:**
```css
.message.assistant .message-content {
    background: var(--cinza-50);
    border-left: 3px solid var(--cinza-300);
}
```

### Cards de Dados
**Antes:**
- Sombras grandes
- Bordas arredondadas (12px)
- Hover com elevação 3D
- Background colorido

**Depois:**
- Bordas simples (1px solid)
- Border-radius mínimo (4px)
- Hover apenas com mudança de cor
- Background branco limpo
- Separadores internos (border-top)

```css
.data-card {
    background: var(--branco);
    border: 1px solid var(--cinza-300);
    border-radius: 4px;
    padding: 1.5rem;
}
```

### Botões
**Antes:**
- Hover com lift (-2px)
- Sombras grandes
- Bordas muito arredondadas

**Depois:**
- Hover apenas com cores
- Transições rápidas (150ms)
- Bordas sutis (4px)
- Dois estilos: Primary (verde sólido) e Outline (borda)

**Primary:**
```css
.btn-primary {
    background: var(--verde-institucional);
    color: white;
    border: none;
}
```

**Outline:**
```css
.btn-outline {
    color: var(--verde-institucional);
    border: 1px solid var(--cinza-400);
    background: transparent;
}
```

### Input Area
**Antes:**
- Background branco
- Sombra superior grande
- Quick actions com ícones

**Depois:**
- Background cinza claro (#F1F3F5)
- Borda superior sutil
- Sugestões em grid limpo
- Label uppercase discreta

```css
.input-area {
    border-top: 1px solid var(--cinza-200);
    background: var(--cinza-50);
}
```

### Loading State
**Antes:**
- Dots pulsando (3 círculos)
- Animação bounce

**Depois:**
- Spinner circular simples
- Rotação suave (0.8s)
- Texto ao lado

```css
.loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--cinza-300);
    border-top-color: var(--verde-institucional);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}
```

### Empty State
**Antes:**
- Ilustração grande
- Emoji 4rem
- Lista com bullets

**Depois:**
- Ícone em quadrado discreto (80x80px)
- Grid de features organizadas
- Cards informativos estruturados

---

## 🎯 Tipografia

### Fonte: Open Sans
Substituição profissional para Rawline (Gov.br):
- **Regular (400)**: Texto corpo
- **Semibold (600)**: Labels, botões
- **Bold (700)**: Títulos

### Hierarquia
```css
.header-title: 1.125rem (18px) bold
.card-name: 1rem (16px) bold
.message-content: 0.9375rem (15px) regular
.card-detail: 0.875rem (14px) regular
.message-label: 0.75rem (12px) semibold uppercase
```

### Letter-spacing
Labels uppercase têm tracking de 0.5px para melhor legibilidade.

---

## 📏 Espaçamento

### Padding/Margin Base
```
0.5rem (8px) - Espaçamento mínimo
0.75rem (12px) - Elementos pequenos
1rem (16px) - Padrão
1.5rem (24px) - Seções
2rem (32px) - Blocos grandes
```

### Grid Gaps
```
Suggestions grid: 0.5rem (8px)
Features grid: 1rem (16px)
Card actions: 0.5rem (8px)
```

---

## 🎭 Animações

### Filosofia
- **Rápidas**: 150ms (interações), 300ms (entrada)
- **Sutis**: Apenas fade/slide, sem bounce
- **Funcionais**: Indicam estado, não decoram

### Implementadas
```css
/* Fade in para mensagens */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Spinner de loading */
@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Transições padrão */
transition: all 150ms ease;
```

---

## 📱 Responsividade

### Breakpoint: 768px

**Mobile (<768px):**
- Header subtitle escondido
- Mensagens ocupam 100% largura
- Input em coluna (textarea acima, botão abaixo)
- Suggestions grid em 1 coluna
- Padding reduzido (1rem)

**Desktop (>768px):**
- Layout amplo (max-width: 1140px)
- Grid de 2-4 colunas
- Padding generoso (1.5-2rem)
- Mensagens com max-width definido

---

## ✨ Melhorias de UX

### 1. Foco Visível
Inputs com focus shadow verde:
```css
.text-input:focus {
    border-color: var(--verde-institucional);
    box-shadow: 0 0 0 3px var(--verde-light);
}
```

### 2. Estados Desabilitados
Botões desabilitados com cor neutra:
```css
.send-button:disabled {
    background: var(--cinza-300);
    cursor: not-allowed;
}
```

### 3. Hierarquia de Informação
- Labels uppercase em cinza escuro
- Informação principal em preto
- Metadados em cinza médio
- Timestamps em cinza claro

### 4. Separadores Sutis
Bordas horizontais para dividir seções nos cards:
```css
border-top: 1px solid var(--cinza-200);
```

---

## 📂 Arquivos

### Novos Arquivos Clean
```
frontend-prototype/
├── index-clean.html         # Versão interativa clean
└── DESIGN-CLEAN.md          # Esta documentação
```

### Arquivos Originais (Mantidos)
```
frontend-prototype/
├── index.html               # Versão original interativa
├── demo.html                # Versão original demo
└── ...
```

---

## 🚀 Como Visualizar

### Versão Clean
```bash
cd frontend-prototype
open index-clean.html        # Mac
xdg-open index-clean.html    # Linux
start index-clean.html       # Windows
```

Ou **duplo clique** no arquivo.

### Comparar Versões
Abra ambas em abas diferentes:
1. `index.html` - Original (colorido, moderno)
2. `index-clean.html` - Clean (minimalista, institucional)

---

## 🎯 Quando Usar Cada Versão

### Use a Versão Original Quando:
- ✅ Precisa de interface moderna e friendly
- ✅ Público jovem ou menos formal
- ✅ Quer destacar a marca visualmente
- ✅ Prioriza engajamento emocional

### Use a Versão Clean Quando:
- ✅ Precisa de credibilidade institucional
- ✅ Público técnico ou profissional
- ✅ Alinhamento com design governamental
- ✅ Prioriza clareza sobre personalidade

---

## 📊 Comparação de Performance

### Versão Original
- Cores vibrantes: Mais chamativa
- Animações: Mais elaboradas (bounce, scale)
- Sombras: Múltiplas camadas
- Load visual: Alto (mais elementos decorativos)

### Versão Clean
- Cores neutras: Mais sóbria
- Animações: Sutis e rápidas
- Sombras: Mínimas
- Load visual: Baixo (foco em conteúdo)

---

## 🔧 Customização

### Trocar a Cor Institucional
Edite apenas estas variáveis:
```css
--verde-institucional: #00652E;  /* Sua cor primária */
--verde-light: #E8F4EF;          /* Versão 10% de opacidade */
--verde-border: #C8E6D7;         /* Versão 30% de opacidade */
```

### Ajustar Whitespace
Modifique os paddings principais:
```css
.messages-area { padding: 2rem; }       /* Espaço interno do chat */
.main-container { margin: 2rem auto; }  /* Margem externa */
.data-card { padding: 1.5rem; }         /* Padding dos cards */
```

---

## ✅ Checklist de Mudanças

- [x] Paleta de cores neutra com verde accent
- [x] Header branco com borda sutil
- [x] Mensagens com borda lateral em vez de bolhas
- [x] Cards sem sombras, apenas bordas
- [x] Botões com hover simples
- [x] Input area com background cinza claro
- [x] Loading com spinner em vez de dots
- [x] Tipografia profissional (Open Sans)
- [x] Mais whitespace em todos elementos
- [x] Bordas sutis (4px) em vez de arredondadas
- [x] Animações rápidas (150ms-300ms)
- [x] Grid estruturado em vez de flexbox livre
- [x] Labels uppercase para hierarquia
- [x] Separadores internos nos cards

---

## 💡 Feedback

Esta versão foi criada baseada em princípios de design institucional e governamental brasileiro. Se precisar ajustar ainda mais, considere:

1. **Mais minimalista**: Remover backgrounds coloridos por completo
2. **Mais colorida**: Aumentar uso do verde em alguns elementos
3. **Mais espaçosa**: Aumentar padding/margin em 25-50%
4. **Mais compacta**: Reduzir espaçamentos para caber mais conteúdo

---

**Versão**: 1.0.0
**Data**: 2025-11-14
**Design**: Clean & Institutional

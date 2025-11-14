# Protótipo Agente Cidadão - Frontend Interativo

Este é um protótipo funcional da interface do **Agente Cidadão**, demonstrando o design e as interações propostas na especificação.

## 🚀 Como Visualizar

### Método 1: Abrir Diretamente no Navegador
```bash
# A partir da raiz do projeto
open frontend-prototype/index.html

# Ou no Linux
xdg-open frontend-prototype/index.html

# Ou no Windows
start frontend-prototype/index.html
```

### Método 2: Servidor HTTP Local
```bash
cd frontend-prototype
python3 -m http.server 8000
# Abra: http://localhost:8000
```

## 🎨 Recursos Implementados

### ✅ Interface Completa
- [x] **Header verde Câmara** com logo e ações
- [x] **Chat container** responsivo
- [x] **Mensagens do usuário** (verde, alinhadas à direita)
- [x] **Mensagens do assistente** (branco, alinhadas à esquerda)
- [x] **Área de input** com textarea expansível
- [x] **Botão enviar** com estados (normal, hover, disabled)

### ✅ Componentes de Dados
- [x] **Card Deputado** com foto, informações e ações
- [x] **Card Proposição** com detalhes legislativos
- [x] **Badges de status** (Exercício, Em tramitação, etc.)
- [x] **Botões de ação** (Ver Despesas, Ver Proposições, etc.)

### ✅ Funcionalidades Interativas
- [x] **Empty State** inicial com boas-vindas
- [x] **Quick Actions** (sugestões de perguntas)
- [x] **Loading state** com animação de dots
- [x] **Respostas simuladas** baseadas em palavras-chave
- [x] **Scroll automático** para última mensagem
- [x] **Enter para enviar** (Shift+Enter para nova linha)

### ✅ Design Responsivo
- [x] Layout adaptável (mobile, tablet, desktop)
- [x] Cores da Câmara dos Deputados (#00693D)
- [x] Animações e transições suaves
- [x] Hover effects em todos os elementos interativos

## 🧪 Como Testar

### 1. Perguntas de Exemplo
Digite estas perguntas para ver diferentes tipos de resposta:

**Para ver Card de Deputado:**
- "Quem é o deputado Guilherme Boulos?"
- "Mostre deputados de SP"
- "Informações sobre deputados"

**Para ver Card de Proposição:**
- "Mostre proposições recentes"
- "Quais são os projetos de lei sobre saúde?"
- "Informações sobre PL 1234/2024"

**Para resposta textual:**
- "Como funciona a Câmara?"
- "O que você pode fazer?"

### 2. Testar Quick Actions
Clique nos botões de sugestão na tela inicial:
- 💼 Deputados de SP
- 📋 Proposições recentes
- 💰 Maiores despesas
- 🗣️ Discursos sobre saúde

### 3. Testar Responsividade
Redimensione a janela do navegador para ver:
- Layout mobile (< 768px)
- Layout tablet (768px - 1024px)
- Layout desktop (> 1024px)

## 🎯 Comparação com Especificação

| Recurso | Especificação | Protótipo |
|---------|--------------|-----------|
| Paleta de cores Câmara | ✅ | ✅ |
| Chat conversacional | ✅ | ✅ |
| Cards de dados | ✅ | ✅ |
| Loading states | ✅ | ✅ |
| Empty state | ✅ | ✅ |
| Quick actions | ✅ | ✅ |
| Responsividade | ✅ | ✅ |
| Animações | ✅ | ✅ |
| Integração MCP | 📋 Planejado | 🔄 Simulado |
| Integração LLM | 📋 Planejado | 🔄 Simulado |

## 🔧 Tecnologias Utilizadas

- **React 18** (via CDN, sem build)
- **Babel Standalone** (JSX transform)
- **CSS3** (variáveis, flexbox, grid, animations)
- **Vanilla JavaScript** (simulação de API)

## 📋 Próximos Passos

### Para Desenvolvimento Completo:
1. **Setup com Vite/Next.js**
   - Migrar para ambiente de desenvolvimento real
   - Configurar TypeScript
   - Instalar dependências (Tailwind, etc.)

2. **Integração Backend**
   - Conectar com MCP Server
   - Integrar LLM (Claude/GPT)
   - Implementar chamadas reais à API da Câmara

3. **Funcionalidades Avançadas**
   - Histórico de conversas (localStorage)
   - Exportação de dados
   - Favoritos
   - Dark mode

4. **Otimizações**
   - Code splitting
   - Lazy loading
   - Service Worker (PWA)
   - Performance optimization

## 🎨 Variações de Cor Disponíveis

O protótipo usa as cores definidas na especificação:

```css
--verde-camara-primary: #00693D  /* Verde principal */
--verde-camara-dark: #004D2C     /* Hover, ênfase */
--verde-camara-light: #008B4D    /* Destaque */
--verde-camara-pale: #E8F5F0     /* Backgrounds */
--verde-camara-accent: #00A854   /* CTAs */
```

## 📱 Screenshots Esperados

### Desktop
- Header verde com logo Agente Cidadão
- Chat container centralizado (max-width: 1200px)
- Mensagens do usuário à direita (verde)
- Mensagens do assistente à esquerda (branco)
- Cards de dados com hover effects

### Mobile
- Header compacto
- Mensagens ocupando 90% da largura
- Input área em coluna (textarea acima, botão abaixo)
- Quick actions em coluna única

## 🐛 Limitações do Protótipo

1. **Dados simulados**: Usa dados estáticos de exemplo
2. **Sem persistência**: Conversas não são salvas
3. **Respostas por palavra-chave**: Não usa LLM real
4. **Sem autenticação**: Não há sistema de usuários
5. **Sem analytics**: Não rastreia eventos

## 📝 Notas de Implementação

### Por que usar React via CDN?
- ✅ **Simplicidade**: Não requer build tools
- ✅ **Portabilidade**: Abre direto no navegador
- ✅ **Demonstração**: Foco no design e UX
- ❌ **Não para produção**: Use Vite/Next.js para produção

### Como o protótipo simula a integração?
```javascript
// Simula chamada ao LLM + MCP
const simulateResponse = (query) => {
  // Analisa palavras-chave na pergunta
  // Retorna dados mockados apropriados
  // Em produção: chama LLM → MCP → API Câmara
};
```

## 🤝 Contribuindo

Para melhorar este protótipo:

1. **Design**: Ajustar cores, espaçamentos, animações
2. **Componentes**: Adicionar novos cards (Despesas, Eventos, etc.)
3. **Interações**: Melhorar simulação de respostas
4. **Responsividade**: Testar em mais dispositivos

## 📚 Referências

- [Especificação Completa](../FRONTEND_SPEC.md)
- [Câmara dos Deputados](https://www.camara.leg.br)
- [Dados Abertos Câmara](https://dadosabertos.camara.leg.br)
- [React Docs](https://react.dev)

---

**Versão**: 1.0.0 (Protótipo)
**Data**: 2025-11-14
**Status**: Demo funcional

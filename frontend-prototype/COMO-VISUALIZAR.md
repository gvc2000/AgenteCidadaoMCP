# 🌐 Como Visualizar o Protótipo do Agente Cidadão

## ✨ Boa Notícia!

Os arquivos HTML **não precisam de servidor** - podem ser abertos diretamente no seu navegador!

---

## 📍 Localização dos Arquivos

Os protótipos estão em:
```
/home/user/AgenteCidadaoMCP/frontend-prototype/
```

### Arquivos disponíveis:
- **demo.html** - Demo automática (conversas aparecem sozinhas)
- **index.html** - Versão interativa (você digita)

---

## 🚀 Como Abrir (3 Métodos)

### Método 1: Duplo Clique (Mais Fácil)
1. Navegue até a pasta `frontend-prototype`
2. Dê **duplo clique** em `demo.html` ou `index.html`
3. O arquivo abrirá no seu navegador padrão

---

### Método 2: Pelo Terminal
```bash
# Entre na pasta
cd /home/user/AgenteCidadaoMCP/frontend-prototype

# Mac
open demo.html

# Linux
xdg-open demo.html

# Windows
start demo.html
```

---

### Método 3: Arrastar para o Navegador
1. Abra seu navegador (Chrome, Firefox, Safari, Edge)
2. Arraste o arquivo `demo.html` ou `index.html` para a janela do navegador
3. Pronto!

---

### Método 4: Abrir pelo Menu do Navegador
1. Abra seu navegador
2. Menu → Arquivo → Abrir Arquivo (ou Ctrl+O / Cmd+O)
3. Navegue até `/home/user/AgenteCidadaoMCP/frontend-prototype/`
4. Selecione `demo.html` ou `index.html`

---

## 🎯 Qual Arquivo Abrir Primeiro?

### 🎬 `demo.html` - RECOMENDADO PARA PRIMEIRA VISUALIZAÇÃO
✅ Conversas aparecem automaticamente (animadas)
✅ Mostra todo o fluxo de interação
✅ Veja cards de deputado e proposição
✅ Melhor para entender o conceito

### 💬 `index.html` - PARA TESTAR INTERATIVAMENTE
✅ Você digita as perguntas
✅ Clique nos quick actions
✅ Teste o comportamento real
✅ Experimente diferentes queries

---

## 🧪 O Que Testar na Versão Interativa (index.html)

Digite estas perguntas:

1. **"Quem é o deputado Guilherme Boulos?"**
   → Mostra card com foto e informações

2. **"Mostre proposições recentes"**
   → Mostra card de proposição legislativa

3. **"Deputados de São Paulo"**
   → Exemplo de deputado de SP

4. **"Projetos sobre alimentação"**
   → Proposição específica

---

## 📱 Testar Responsividade

1. Abra o arquivo no navegador
2. Pressione **F12** para abrir DevTools
3. Clique no **ícone de dispositivos** (📱) ou pressione **Ctrl+Shift+M**
4. Teste em diferentes tamanhos:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1024px+)

Ou simplesmente **redimensione a janela** do navegador!

---

## 🎨 O Que Você Vai Ver

### Design
- ✅ Header verde Câmara (#00693D)
- ✅ Logo 🇧🇷 Agente Cidadão
- ✅ Interface estilo ChatGPT/Claude
- ✅ Cores oficiais da Câmara dos Deputados

### Funcionalidades
- ✅ Chat com mensagens do usuário (verde) e assistente (branco)
- ✅ Cards de Deputado (foto, partido, email, ações)
- ✅ Cards de Proposição (tipo, ementa, status)
- ✅ Quick actions (sugestões clicáveis)
- ✅ Loading animado com dots
- ✅ Animações suaves (slide in, hover)
- ✅ Scroll automático

---

## ❓ Problemas?

### "O arquivo não abre"
- Certifique-se de ter um navegador instalado (Chrome, Firefox, Safari, Edge)
- Tente arrastar o arquivo para dentro do navegador aberto

### "Vejo apenas texto/código"
- O arquivo pode ter aberto em um editor de texto
- Clique com botão direito → Abrir com → Navegador

### "Não funciona nada"
- Verifique se está conectado à internet (React é carregado via CDN)
- Tente outro navegador
- Abra o Console (F12) e veja se há erros

---

## ✅ Caminho Completo dos Arquivos

```
Demo automática:
/home/user/AgenteCidadaoMCP/frontend-prototype/demo.html

Versão interativa:
/home/user/AgenteCidadaoMCP/frontend-prototype/index.html
```

---

## 🎬 Fluxo Recomendado

1. **Primeiro**: Abra `demo.html` para ver a demo animada
2. **Depois**: Abra `index.html` e teste você mesmo
3. **Teste responsividade**: Redimensione a janela
4. **Experimente**: Clique nos botões e quick actions

---

## 💡 Dica

Os arquivos HTML são **standalone** e funcionam 100% offline depois da primeira carga (que baixa React e Babel via CDN). Você pode até copiar os arquivos para um pendrive e abrir em qualquer computador!

---

**Aproveite o protótipo do Agente Cidadão!** 🇧🇷

# 🔀 Como Fazer o Merge para Visualizar o Protótipo

A branch principal (`main`) tem proteção contra push direto, então você precisa fazer o merge através da interface web do GitHub. É simples!

---

## 🚀 Opção 1: Criar Pull Request no GitHub (Recomendado)

### Passo a Passo:

1. **Acesse o repositório no GitHub:**
   ```
   https://github.com/gvc2000/AgenteCidadaoMCP
   ```

2. **Você verá um banner amarelo dizendo:**
   ```
   "claude/citizen-agent-frontend-spec-01KbvtDgoGfj48zjPct8fJp5 had recent pushes"
   [Compare & pull request]
   ```

3. **Clique no botão verde "Compare & pull request"**

4. **Preencha o Pull Request:**
   - **Título**: `feat: Complete Frontend Specification and Interactive Prototype`
   - **Descrição**: (copie o conteúdo abaixo)

5. **Clique em "Create pull request"**

6. **Revise e clique em "Merge pull request"**

7. **Confirme o merge clicando em "Confirm merge"**

✅ **Pronto! As mudanças estarão na branch main!**

---

## 📝 Descrição Sugerida para o Pull Request:

```markdown
## 🇧🇷 Agente Cidadão - Especificação e Protótipo Frontend

Este PR adiciona especificação completa e protótipo interativo do frontend.

### 📦 O Que Está Incluído

1. **FRONTEND_SPEC.md** - Especificação completa com 14 seções
2. **frontend-prototype/** - Protótipo funcional HTML/React

### ✨ Recursos do Protótipo

- ✅ Interface de chat completa (estilo ChatGPT/Claude)
- ✅ Cores oficiais da Câmara dos Deputados (#00693D)
- ✅ Cards de Deputado e Proposição
- ✅ Totalmente responsivo (mobile/tablet/desktop)
- ✅ Animações suaves
- ✅ Não precisa de servidor - abre direto no navegador!

### 🚀 Como Visualizar

Após o merge, abra no navegador:
```bash
frontend-prototype/demo.html        # Demo automática
frontend-prototype/index.html       # Versão interativa
```

Basta dar duplo-clique no arquivo ou arrastar para o navegador!

### 📊 Estatísticas

- 8 arquivos novos
- 3.511 linhas adicionadas
- 100% documentado

---

**Status**: ✅ Pronto para merge
```

---

## 🚀 Opção 2: Criar Pull Request via URL Direta

Clique neste link (substitua se necessário):

```
https://github.com/gvc2000/AgenteCidadaoMCP/compare/main...claude/citizen-agent-frontend-spec-01KbvtDgoGfj48zjPct8fJp5
```

Depois siga os passos 4-7 da Opção 1.

---

## 🔄 Opção 3: Merge Local (Se você tiver permissão de admin)

Se você é administrador do repositório:

```bash
# 1. Vá para a branch main
git checkout main

# 2. Puxe as últimas mudanças
git pull origin main

# 3. Faça o merge
git merge claude/citizen-agent-frontend-spec-01KbvtDgoGfj48zjPct8fJp5

# 4. Faça push (pode pedir senha ou token)
git push origin main
```

---

## ⚡ Depois do Merge - Como Visualizar

1. **Atualize seu repositório local:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Navegue até a pasta do protótipo:**
   ```bash
   cd frontend-prototype
   ```

3. **Abra no navegador:**

   **Opção A - Duplo clique:**
   - Dê duplo clique em `demo.html` ou `index.html`

   **Opção B - Terminal:**
   ```bash
   open demo.html        # Mac
   xdg-open demo.html    # Linux
   start demo.html       # Windows
   ```

   **Opção C - Arrastar:**
   - Arraste o arquivo para dentro do navegador

---

## 📂 Arquivos que Serão Adicionados

```
AgenteCidadaoMCP/
├── FRONTEND_SPEC.md                    (Especificação completa)
└── frontend-prototype/
    ├── index.html                      (Versão interativa)
    ├── demo.html                       (Demo automática)
    ├── view-prototype.sh               (Script auxiliar)
    ├── README.md                       (Documentação)
    ├── PREVIEW.txt                     (Preview ASCII)
    ├── ACESSO.txt                      (Instruções rápidas)
    └── COMO-VISUALIZAR.md              (Guia completo)
```

---

## ❓ Problemas?

### "Não vejo o banner amarelo no GitHub"
- Vá direto para: `https://github.com/gvc2000/AgenteCidadaoMCP/pulls`
- Clique em "New pull request"
- Selecione: `base: main` ← `compare: claude/citizen-agent-frontend-spec...`

### "Não consigo fazer merge"
- Você pode precisar de permissões de write no repositório
- Peça a outro colaborador com permissão para fazer o merge
- Ou ajuste as configurações de proteção da branch main

### "O arquivo não abre depois do merge"
- Certifique-se de ter dado `git pull origin main` antes
- Verifique se está na pasta correta: `frontend-prototype/`
- Tente abrir diretamente pelo File Explorer com duplo clique

---

## 🎯 Resumo Rápido

1. Acesse: https://github.com/gvc2000/AgenteCidadaoMCP
2. Clique em "Compare & pull request" (banner amarelo)
3. Crie o Pull Request
4. Clique em "Merge pull request"
5. Confirme o merge
6. Faça `git pull origin main` no seu computador
7. Abra `frontend-prototype/demo.html` no navegador

**Pronto! Você poderá ver o protótipo funcionando!** 🎉

---

**Dúvidas?** Me avise que te ajudo! 😊

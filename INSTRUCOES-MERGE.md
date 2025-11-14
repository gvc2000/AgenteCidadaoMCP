# 🔀 Instruções para Fazer Merge - Agente Cidadão

## ✅ Passo a Passo Simples

### **1. Acesse o Repositório no GitHub**

Abra este link no navegador:
```
https://github.com/gvc2000/AgenteCidadaoMCP
```

---

### **2. Procure o Banner Amarelo**

Você verá algo assim no topo da página:

```
⚠️  claude/citizen-agent-frontend-spec-01KbvtDgoGfj48zjPct8fJp5 had recent pushes
    [Compare & pull request]  ← CLIQUE NESTE BOTÃO VERDE
```

---

### **3. Preencha o Pull Request**

**Título** (copie e cole):
```
feat: Frontend Specification and Prototype (Original + Clean Design)
```

**Descrição** (copie e cole):
```markdown
## 🇧🇷 Agente Cidadão - Especificação e Protótipos Frontend

Este PR adiciona especificação técnica completa e **dois protótipos funcionais** do frontend do Agente Cidadão.

---

## 📦 O Que Está Incluído

### 1. Especificação Técnica (`FRONTEND_SPEC.md`)
- Design system completo com cores da Câmara dos Deputados
- Arquitetura técnica (React + TypeScript + Tailwind)
- Componentes detalhados e guias de implementação
- Roadmap de desenvolvimento (4-6 semanas para MVP)
- **1.328 linhas** de documentação

### 2. Protótipo Original (`frontend-prototype/`)
**Design moderno e colorido:**
- ✅ Interface estilo ChatGPT/Claude
- ✅ Verde Câmara dominante (#00693D)
- ✅ Bolhas de mensagem arredondadas
- ✅ Animações suaves e interativas
- ✅ Avatar do bot, quick actions
- ✅ Ideal para público geral

**Arquivos:**
- `index.html` - Versão interativa
- `demo.html` - Demo automática

### 3. Protótipo Clean (`frontend-prototype/`)
**Design minimalista e institucional:**
- ✅ Cores neutras com verde accent sutil (#00652E)
- ✅ Layout estruturado tipo gov.br
- ✅ Mais whitespace e profissional
- ✅ Bordas simples, sem sombras excessivas
- ✅ Ideal para contexto governamental

**Arquivos:**
- `index-clean.html` - Versão clean interativa
- `DESIGN-CLEAN.md` - Documentação comparativa

---

## 🚀 Como Visualizar (Após o Merge)

**NÃO PRECISA DE SERVIDOR!** Os protótipos abrem direto no navegador.

### 1. Atualize seu repositório local:
```bash
git checkout main
git pull origin main
cd frontend-prototype
```

### 2. Abra os arquivos (duplo clique):

**Protótipo Original (Moderno):**
- `demo.html` - Demo automática com conversas animadas
- `index.html` - Versão interativa para testar

**Protótipo Clean (Institucional):**
- `index-clean.html` - Versão minimalista e profissional

### 3. Ou arraste para o navegador:
Chrome, Firefox, Safari ou Edge - todos funcionam!

---

## 🎨 Comparação dos Designs

| Característica | Original | Clean |
|----------------|----------|-------|
| **Estilo** | Moderno, friendly | Institucional, profissional |
| **Cores** | Verde dominante | Neutro com verde accent |
| **Mensagens** | Bolhas arredondadas | Blocos com borda lateral |
| **Header** | Verde sólido | Branco com borda |
| **Sombras** | Múltiplas, 3D | Mínimas ou nenhuma |
| **Público** | Geral | Governamental/Técnico |
| **Inspiração** | ChatGPT/Claude | Gov.br |

---

## 🧪 Teste Estas Perguntas

Em qualquer versão interativa, digite:

1. **"Quem é o deputado Guilherme Boulos?"**
   → Mostra card com foto e informações

2. **"Mostre proposições recentes"**
   → Exibe card de proposição legislativa

3. **"Deputados de São Paulo"**
   → Retorna exemplo de deputado de SP

4. **"Projetos sobre saúde"**
   → Card de proposição específica

---

## 📊 Estatísticas do PR

```
Commits: 7
Arquivos novos: 10
Linhas adicionadas: ~5.000
Documentação: 100% completa
Designs: 2 versões funcionais
Servidor necessário: ❌ Nenhum!
```

### Arquivos Principais
- `FRONTEND_SPEC.md` (1.328 linhas)
- `index.html` (886 linhas) - Original
- `demo.html` (572 linhas) - Demo original
- `index-clean.html` (800+ linhas) - Clean
- `README.md`, `DESIGN-CLEAN.md`, guias diversos

---

## 📱 Responsividade

Ambos os protótipos são 100% responsivos:
- ✅ Desktop (>1024px)
- ✅ Tablet (768-1024px)
- ✅ Mobile (<768px)

Teste redimensionando a janela ou usando DevTools (F12 → Device Toolbar)

---

## 🎯 Próximos Passos

1. **Visualizar** ambos os protótipos
2. **Escolher** qual design seguir (ou mesclar elementos)
3. **Coletar** feedback da equipe
4. **Iniciar** desenvolvimento de produção (Vite + TypeScript)
5. **Integrar** com MCP Server e LLM real

---

## ✅ Checklist de Review

Antes de aprovar, por favor:

- [ ] Abri `demo.html` e vi a demo automática
- [ ] Abri `index.html` e testei interativamente
- [ ] Abri `index-clean.html` e comparei o design
- [ ] Li a especificação (`FRONTEND_SPEC.md`)
- [ ] Li a comparação de designs (`DESIGN-CLEAN.md`)
- [ ] Testei em mobile (redimensionei a janela)
- [ ] Os arquivos abrem sem erros no navegador

---

## 🎨 Filosofia

> **"Democratizar o acesso aos dados legislativos através de conversas em linguagem natural, com design que inspira confiança e facilita o entendimento."**

Dois designs, uma missão: tornar a Câmara dos Deputados mais acessível aos cidadãos brasileiros. 🇧🇷

---

**Status**: ✅ Pronto para merge
**Recomendação**: Teste ambas as versões antes de decidir qual seguir para produção!
```

---

### **4. Clique em "Create Pull Request"**

Botão verde no final da página.

---

### **5. Faça o Merge**

Depois de criar o PR:

1. Clique no botão verde **"Merge pull request"**
2. Clique em **"Confirm merge"**
3. **Pronto!** ✅

---

## 📥 Depois do Merge - Ver os Protótipos

### **1. Atualize sua cópia local:**
```bash
git checkout main
git pull origin main
```

### **2. Vá para a pasta:**
```bash
cd frontend-prototype
```

### **3. Abra os protótipos:**

**Duplo clique** em:
- `demo.html` - Demo original automática ⭐ **COMECE POR AQUI!**
- `index.html` - Original interativo (colorido)
- `index-clean.html` - Clean interativo (minimalista)

**Ou arraste** para o navegador!

---

## 🎨 Qual Protótipo Ver Primeiro?

### Sequência Recomendada:

1. **`demo.html`** ← Comece aqui!
   - Demo automática com conversas
   - Mostra todo o fluxo
   - Não precisa digitar nada

2. **`index.html`**
   - Versão colorida interativa
   - Digite suas perguntas
   - Design moderno

3. **`index-clean.html`**
   - Versão minimalista
   - Compare com a original
   - Design institucional

---

## 📊 O Que Será Adicionado ao Main

```
AgenteCidadaoMCP/
├── FRONTEND_SPEC.md                    (Especificação completa)
├── COMO-FAZER-MERGE.md                 (Guia de merge)
├── PULL-REQUEST-TEMPLATE.md            (Template de PR)
└── frontend-prototype/
    ├── index.html                      (Original interativo)
    ├── demo.html                       (Original demo)
    ├── index-clean.html                (Clean interativo) ⭐ NOVO!
    ├── view-prototype.sh               (Script auxiliar)
    ├── README.md                       (Documentação técnica)
    ├── PREVIEW.txt                     (Preview ASCII)
    ├── ACESSO.txt                      (Instruções rápidas)
    ├── COMO-VISUALIZAR.md              (Guia de visualização)
    └── DESIGN-CLEAN.md                 (Comparação designs) ⭐ NOVO!
```

---

## ❓ Problemas?

### "Não vejo o banner amarelo"
1. Vá para: https://github.com/gvc2000/AgenteCidadaoMCP/pulls
2. Clique em **"New pull request"**
3. Selecione:
   - **base:** `main`
   - **compare:** `claude/citizen-agent-frontend-spec-01KbvtDgoGfj48zjPct8fJp5`
4. Clique em **"Create pull request"**

### "Não consigo fazer merge"
- Você pode precisar de permissões de escrita
- Peça a outro colaborador para fazer o merge
- Ou ajuste as proteções da branch main nas configurações

---

## 🎯 Resumo Ultra-Rápido

1. Abra: https://github.com/gvc2000/AgenteCidadaoMCP
2. Clique: "Compare & pull request" (banner amarelo)
3. Cole: Título e descrição acima
4. Clique: "Create pull request"
5. Clique: "Merge pull request" → "Confirm merge"
6. No terminal: `git checkout main && git pull origin main`
7. Abra: `frontend-prototype/demo.html` no navegador

**Vai funcionar perfeitamente!** 🎉

---

## 📝 Commits Incluídos (7 no total)

1. `docs: Add complete frontend specification`
2. `feat: Add interactive frontend prototype`
3. `docs: Add quick access instructions`
4. `docs: Add comprehensive guide for viewing`
5. `docs: Add comprehensive merge guide`
6. `docs: Add comprehensive Pull Request template`
7. `feat: Add clean minimal design version` ⭐ NOVO!

---

Precisa de ajuda em algum passo? Me avise! 😊

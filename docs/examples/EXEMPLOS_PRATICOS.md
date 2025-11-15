# 💡 Exemplos Práticos de Uso

Este documento contém exemplos práticos de perguntas que você pode fazer ao LLM usando o servidor MCP Câmara BR.

## 🎯 Exemplos Básicos

### 1. Buscar Deputados por Estado

**Pergunta:**
```
Mostre 5 deputados do Rio de Janeiro
```

**O que acontece:**
- Claude usa a tool `buscar_deputados` com `{uf: "RJ", itens: 5}`
- Retorna lista com nome, partido, email e foto

**Resultado esperado:**
```
Encontrei 5 deputados do Rio de Janeiro:

1. Fulano Silva (PT-RJ)
   Email: dep.fulano@camara.leg.br

2. Ciclana Santos (PSDB-RJ)
   Email: dep.ciclana@camara.leg.br

...
```

---

### 2. Buscar por Partido

**Pergunta:**
```
Liste deputados do partido PSOL
```

**O que acontece:**
- Claude usa `buscar_deputados` com `{partido: "PSOL"}`
- Mostra todos os deputados do partido

---

### 3. Combinar Filtros

**Pergunta:**
```
Quem são os deputados do PT em São Paulo?
```

**O que acontece:**
- Claude usa `buscar_deputados` com `{partido: "PT", uf: "SP"}`
- Retorna apenas deputados que atendem ambos os critérios

---

## 📊 Exemplos de Despesas

### 4. Ver Despesas de um Deputado

**Pergunta:**
```
Mostre as despesas do deputado ID 204554 em 2024
```

**O que acontece:**
- Claude primeiro pode usar `detalhar_deputado` para confirmar quem é
- Depois usa `despesas_deputado` com `{id: 204554, ano: 2024}`
- Mostra total gasto e principais despesas

**Resultado esperado:**
```
Despesas do Deputado Fulano Silva em 2024:

Total gasto: R$ 125.450,80

Principais despesas:
1. Passagens aéreas: R$ 45.300,00
2. Divulgação de atividade parlamentar: R$ 32.150,00
3. Combustíveis: R$ 18.000,00
...
```

---

### 5. Despesas de um Mês Específico

**Pergunta:**
```
Quanto o deputado 204554 gastou em janeiro de 2024?
```

**O que acontece:**
- Claude usa `despesas_deputado` com `{id: 204554, ano: 2024, mes: 1}`
- Retorna despesas apenas de janeiro

---

### 6. Comparar Despesas

**Pergunta:**
```
Compare as despesas dos deputados 204554 e 220500 em 2024
```

**O que acontece:**
- Claude faz duas chamadas paralelas de `despesas_deputado`
- Compara os totais e categorias
- Apresenta análise comparativa

---

## 🏛️ Exemplos de Proposições

### 7. Buscar Projetos de Lei

**Pergunta:**
```
Quais projetos de lei sobre meio ambiente foram apresentados em 2024?
```

**O que acontece:**
- Claude usa `buscar_proposicoes` com `{siglaTipo: "PL", keywords: "meio ambiente", ano: 2024}`
- Lista as proposições encontradas

---

### 8. Detalhes de uma Proposição

**Pergunta:**
```
Me fale sobre a proposição PL 1234/2024
```

**O que acontece:**
- Claude primeiro busca a proposição
- Depois usa `detalhar_proposicao` para obter informações completas
- Mostra ementa, autor, situação atual

---

### 9. Ver Votações

**Pergunta:**
```
A proposição 2342091 já foi votada? Como foi?
```

**O que acontece:**
- Claude usa `votacoes_proposicao` com `{id: 2342091}`
- Mostra histórico de votações
- Indica se foi aprovada ou rejeitada

---

## 🔥 Exemplos Avançados

### 10. Análise Multi-Step

**Pergunta:**
```
Encontre o deputado do PT em SP que mais gastou em 2024 e
mostre os detalhes dele e suas principais despesas
```

**O que acontece:**
1. Busca deputados: `buscar_deputados({partido: "PT", uf: "SP"})`
2. Para cada um, busca despesas: `despesas_deputado({id: X, ano: 2024})`
3. Identifica o que mais gastou
4. Mostra detalhes: `detalhar_deputado({id: X})`
5. Lista despesas detalhadas

---

### 11. Ranking de Gastos

**Pergunta:**
```
Crie um ranking dos 5 deputados que mais gastaram com
passagens aéreas em 2024
```

**O que acontece:**
1. Busca deputados ativos
2. Busca despesas de cada um
3. Filtra por tipo "passagens aéreas"
4. Ordena por valor total
5. Apresenta top 5

---

### 12. Análise de Proposições por Autor

**Pergunta:**
```
Quantas proposições o deputado 204554 apresentou em 2024?
Liste as 3 mais recentes
```

**O que acontece:**
1. Busca proposições: `buscar_proposicoes({idAutor: 204554, ano: 2024})`
2. Conta o total
3. Lista as 3 primeiras (mais recentes)
4. Para cada uma, mostra detalhes básicos

---

### 13. Comparativo de Partidos

**Pergunta:**
```
Compare a atividade legislativa do PT e PSDB:
quantas proposições cada um apresentou em 2024?
```

**O que acontece:**
1. Busca deputados de cada partido
2. Para cada deputado, busca proposições de 2024
3. Agrega os totais por partido
4. Apresenta comparação

---

## 🎨 Exemplos de Formatação

### 14. Solicitar Formato Específico

**Pergunta:**
```
Liste deputados de MG em formato de tabela
```

**Resultado esperado:**
```
| Nome              | Partido | Email                    |
|-------------------|---------|--------------------------|
| João Silva        | PT      | dep.joao@camara.leg.br   |
| Maria Santos      | PSDB    | dep.maria@camara.leg.br  |
...
```

---

### 15. Resumo Executivo

**Pergunta:**
```
Faça um resumo executivo das despesas do deputado 204554
no primeiro trimestre de 2024
```

**O que acontece:**
- Claude busca despesas de jan, fev, mar
- Calcula totais e médias
- Identifica principais categorias
- Apresenta análise em formato executivo

---

## 🔍 Exemplos de Pesquisa

### 16. Busca por Nome Parcial

**Pergunta:**
```
Encontre deputados com "Silva" no nome
```

**O que acontece:**
- Claude usa `buscar_deputados({nome: "Silva"})`
- Lista todos os deputados encontrados

---

### 17. Pesquisa por Palavras-Chave

**Pergunta:**
```
Busque proposições sobre educação e tecnologia
```

**O que acontece:**
- Claude usa `buscar_proposicoes({keywords: "educação tecnologia"})`
- API busca no texto das ementas
- Retorna proposições relevantes

---

## 🎓 Dicas de Uso

### ✅ Faça

- Seja específico: "deputados do PT em SP" é melhor que "deputados do PT"
- Use IDs quando souber: "deputado 204554" é mais rápido que buscar por nome
- Peça análises: Claude pode processar e comparar os dados
- Solicite formatos: tabelas, listas, resumos

### ❌ Evite

- Perguntas muito vagas: "me fale sobre deputados" (muitos resultados)
- Pedir dados que não existem: "salário dos deputados" (não está na API)
- Múltiplas perguntas diferentes ao mesmo tempo

---

## 🚀 Casos de Uso Reais

### Jornalismo de Dados

```
Identifique deputados com gastos atípicos em 2024
comparado com a média da bancada do estado
```

### Pesquisa Acadêmica

```
Analise a produção legislativa sobre meio ambiente
nos últimos 2 anos e identifique tendências
```

### Monitoramento Cívico

```
Liste todas as proposições sobre saúde pública
apresentadas este ano e seu status atual
```

### Fact-Checking

```
Verifique se o deputado X realmente apresentou
a proposição Y como ele afirma
```

---

## 🐛 Quando Algo Dá Errado

### Erro: "Deputado não encontrado"

```
# Errado:
Mostre o deputado João Silva

# Certo:
Busque deputados com nome João Silva e mostre o primeiro
```

### Erro: "Muitos resultados"

```
# Errado:
Liste todos os deputados

# Certo:
Liste os primeiros 10 deputados de São Paulo
```

### Erro: "Parâmetro inválido"

```
# Errado:
Mostre deputados do estado São Paulo

# Certo:
Mostre deputados do estado SP
(use a sigla)
```

---

## 📞 Próximos Passos

Depois de dominar estes exemplos, você pode:

1. **Combinar múltiplas tools** para análises complexas
2. **Criar dashboards** com os dados obtidos
3. **Automatizar monitoramento** de temas específicos
4. **Contribuir** com novas tools no projeto

---

**Dica Final:** Experimente! Claude é inteligente e vai entender variações destas perguntas. Quanto mais você usar, melhor entenderá as capacidades do sistema.

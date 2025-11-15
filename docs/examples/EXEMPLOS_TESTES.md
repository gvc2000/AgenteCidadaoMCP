# 🧪 Exemplos de Testes - MCP Câmara BR

## Testes com a Ferramenta `frentes_deputado`

### Exemplos de Perguntas Naturais no Claude Desktop

#### 1. Buscar Frentes de um Deputado Específico

```
Quais frentes parlamentares o deputado Guilherme Boulos participa?
```

**O que acontece nos bastidores:**
1. Claude usa `buscar_deputados` com `{"nome": "Guilherme Boulos"}`
2. Obtém o ID do deputado (ex: 220000)
3. Usa `frentes_deputado` com `{"id": 220000}`
4. Apresenta as frentes de forma legível

#### 2. Comparar Frentes de Vários Deputados

```
Compare as frentes parlamentares dos deputados Tarcísio Motta e Erika Hilton
```

#### 3. Buscar por Partido e Verificar Frentes

```
Liste 3 deputados do PSOL e me mostre de quais frentes cada um participa
```

#### 4. Buscar por Estado e Verificar Frentes

```
Mostre deputados de SP do PT e suas respectivas frentes parlamentares
```

---

## Teste Manual via JSON-RPC

### Exemplo Completo: Encontrar Deputado e Ver Suas Frentes

**Passo 1: Buscar por nome**
```bash
echo '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "buscar_deputados",
    "arguments": {
      "nome": "Tabata Amaral",
      "itens": 1
    }
  }
}' | node dist/server.js
```

**Resultado esperado:**
```json
{
  "deputados": [
    {
      "id": 204521,
      "nome": "Tabata Amaral",
      "siglaPartido": "PSB",
      "siglaUf": "SP",
      ...
    }
  ]
}
```

**Passo 2: Usar o ID para buscar frentes**
```bash
echo '{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "frentes_deputado",
    "arguments": {
      "id": 204521
    }
  }
}' | node dist/server.js
```

**Resultado esperado:**
```json
{
  "frentes": [
    {
      "id": 53933,
      "titulo": "Frente Parlamentar pela Educação",
      "idLegislatura": 57
    },
    {
      "id": 54123,
      "titulo": "Frente Parlamentar da Juventude",
      "idLegislatura": 57
    }
  ]
}
```

---

## Casos de Uso Reais

### 1. Análise Política
```
"Quais frentes parlamentares os deputados do PT de SP têm em comum?"
```

### 2. Pesquisa Temática
```
"Liste deputados que participam de frentes relacionadas à educação"
```

### 3. Perfil Legislativo
```
"Me conte sobre o deputado Kim Kataguiri:
- Suas despesas recentes
- Discursos sobre educação
- Frentes parlamentares que participa"
```

### 4. Comparação Regional
```
"Compare as frentes parlamentares dos deputados de SP vs RJ"
```

---

## Integração com Outras Ferramentas

### Fluxo Completo de Análise

1. **Buscar Deputado**: `buscar_deputados`
2. **Ver Detalhes**: `detalhar_deputado`
3. **Verificar Frentes**: `frentes_deputado`
4. **Ver Órgãos**: `orgaos_deputado`
5. **Analisar Despesas**: `despesas_deputado`

**Exemplo de pergunta que usa múltiplas ferramentas:**
```
"Me dê um perfil completo do deputado Guilherme Boulos:
- Dados pessoais
- Frentes parlamentares
- Órgãos que participa
- Despesas de janeiro de 2024"
```

---

## Dicas de Teste

### ✅ Boas Práticas

- Use nomes completos ou parciais de deputados conhecidos
- Combine critérios (UF + partido + nome)
- Faça perguntas contextuais e naturais
- Explore múltiplas ferramentas em sequência

### ❌ Evite

- Usar IDs aleatórios sem contexto
- Perguntas muito genéricas ("liste tudo")
- Buscar sem critérios (pode retornar muitos resultados)

### 💡 Deputados Conhecidos para Teste

- Guilherme Boulos (PSOL-SP)
- Tabata Amaral (PSB-SP)
- Kim Kataguiri (UNIÃO-SP)
- Erika Hilton (PSOL-SP)
- Tarcísio Motta (PSOL-RJ)
- Glauber Braga (PSOL-RJ)

---

## Troubleshooting

### Erro 403 (Forbidden)
- **Causa**: Rate limiting da API ou ambiente sem acesso à internet
- **Solução**: Testar em ambiente com acesso à API real ou via Claude Desktop

### Cache está funcionando?
- Rode a mesma query 2x e veja `"cache": true` no metadata

### Ferramenta não aparece?
- Verifique se compilou: `npm run build`
- Liste as ferramentas: `tools/list`
- Reinicie o Claude Desktop

---

**Última atualização**: 2025-11-14

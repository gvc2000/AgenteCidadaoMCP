#!/bin/bash

# Script de testes do MCP Server - Câmara dos Deputados
# Executa consultas JSON-RPC para testar as diversas ferramentas

set -e

MCP_SERVER="node dist/server.js"

# Função para executar consulta MCP
test_tool() {
    local test_name="$1"
    local tool_name="$2"
    local args="$3"

    echo ""
    echo "=========================================="
    echo "TESTE: $test_name"
    echo "Tool: $tool_name"
    echo "=========================================="

    local request="{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"$tool_name\",\"arguments\":$args}}"

    local result=$(echo "$request" | timeout 30 $MCP_SERVER 2>/dev/null | grep -v '^\[' | head -100)

    if [ -z "$result" ]; then
        echo "❌ FALHA: Sem resposta"
        return 1
    fi

    # Verificar se há erro
    if echo "$result" | grep -q '"error":true'; then
        echo "❌ ERRO:"
        echo "$result" | jq -r '.result.content[0].text' 2>/dev/null | jq '.' 2>/dev/null || echo "$result"
        return 1
    fi

    # Extrair e mostrar resultado
    local content=$(echo "$result" | jq -r '.result.content[0].text' 2>/dev/null)

    if [ -n "$content" ] && [ "$content" != "null" ]; then
        echo "✅ SUCESSO"
        echo "$content" | jq '.' 2>/dev/null | head -50
        return 0
    else
        echo "⚠️ Resposta inesperada:"
        echo "$result" | head -50
        return 1
    fi
}

echo "============================================================"
echo "   SUITE DE TESTES - MCP Câmara dos Deputados"
echo "============================================================"
echo ""

# Contadores
PASSED=0
FAILED=0

# Função para rodar teste e contar
run_test() {
    if test_tool "$1" "$2" "$3"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
}

# ============================================
# 1. REFERÊNCIAS (dados estáticos)
# ============================================
echo ""
echo ">>> CATEGORIA: REFERÊNCIAS"
run_test "Listar UFs" "ufs" "{}"
run_test "Listar tipos de proposição" "tipos_proposicao" "{}"
run_test "Listar tipos de órgão" "tipos_orgao" "{}"
run_test "Listar tipos de evento" "tipos_evento" "{}"
run_test "Situações de proposição" "situacoes_proposicao" "{}"

# ============================================
# 2. LEGISLATURAS
# ============================================
echo ""
echo ">>> CATEGORIA: LEGISLATURAS"
run_test "Buscar legislaturas" "buscar_legislaturas" "{}"
run_test "Detalhar legislatura atual (57)" "detalhar_legislatura" "{\"id\":57}"
run_test "Mesa diretora legislatura 57" "mesa_legislatura" "{\"id\":57}"

# ============================================
# 3. DEPUTADOS
# ============================================
echo ""
echo ">>> CATEGORIA: DEPUTADOS"
run_test "Buscar deputados de SP" "buscar_deputados" "{\"uf\":\"SP\",\"itens\":5}"
run_test "Buscar deputados do PT" "buscar_deputados" "{\"partido\":\"PT\",\"itens\":5}"
run_test "Buscar deputado por nome" "buscar_deputados" "{\"nome\":\"Marina\",\"itens\":5}"
run_test "Detalhar deputado (ID 204554)" "detalhar_deputado" "{\"id\":204554}"
run_test "Despesas deputado 204554 (2024)" "despesas_deputado" "{\"id\":204554,\"ano\":2024,\"itens\":5}"
run_test "Discursos deputado 204554" "discursos_deputado" "{\"id\":204554,\"itens\":5}"
run_test "Órgãos do deputado 204554" "orgaos_deputado" "{\"id\":204554}"
run_test "Frentes do deputado 204554" "frentes_deputado" "{\"id\":204554}"
run_test "Eventos do deputado 204554" "eventos_deputado" "{\"id\":204554,\"itens\":5}"

# ============================================
# 4. PROPOSIÇÕES
# ============================================
echo ""
echo ">>> CATEGORIA: PROPOSIÇÕES"
run_test "Buscar PLs de 2024" "buscar_proposicoes" "{\"siglaTipo\":\"PL\",\"ano\":2024,\"itens\":5}"
run_test "Buscar PECs" "buscar_proposicoes" "{\"siglaTipo\":\"PEC\",\"itens\":5}"
run_test "Detalhar proposição" "detalhar_proposicao" "{\"id\":2440539}"
run_test "Tramitações de proposição" "tramitacoes_proposicao" "{\"id\":2440539}"
run_test "Autores de proposição" "autores_proposicao" "{\"id\":2440539}"
run_test "Temas de proposição" "temas_proposicao" "{\"id\":2440539}"
run_test "Votações de proposição" "votacoes_proposicao" "{\"id\":2440539}"

# ============================================
# 5. VOTAÇÕES
# ============================================
echo ""
echo ">>> CATEGORIA: VOTAÇÕES"
run_test "Buscar votações" "buscar_votacoes" "{\"itens\":5}"
run_test "Últimas votações" "ultimas_votacoes" "{\"itens\":5}"

# ============================================
# 6. EVENTOS
# ============================================
echo ""
echo ">>> CATEGORIA: EVENTOS"
run_test "Buscar eventos" "buscar_eventos" "{\"itens\":5}"

# ============================================
# 7. ÓRGÃOS
# ============================================
echo ""
echo ">>> CATEGORIA: ÓRGÃOS"
run_test "Buscar órgãos" "buscar_orgaos" "{\"itens\":5}"
run_test "Detalhar CCJC (ID 2003)" "detalhar_orgao" "{\"id\":2003}"
run_test "Membros de órgão" "membros_orgao" "{\"id\":2003}"

# ============================================
# 8. PARTIDOS
# ============================================
echo ""
echo ">>> CATEGORIA: PARTIDOS"
run_test "Buscar partidos" "buscar_partidos" "{}"
run_test "Detalhar PT (ID 36844)" "detalhar_partido" "{\"id\":36844}"
run_test "Membros do PT" "membros_partido" "{\"id\":36844,\"itens\":5}"
run_test "Líderes do PT" "lideres_partido" "{\"id\":36844}"

# ============================================
# 9. FRENTES
# ============================================
echo ""
echo ">>> CATEGORIA: FRENTES"
run_test "Buscar frentes parlamentares" "buscar_frentes" "{\"itens\":5}"

# ============================================
# 10. BLOCOS
# ============================================
echo ""
echo ">>> CATEGORIA: BLOCOS"
run_test "Buscar blocos parlamentares" "buscar_blocos" "{}"

# ============================================
# 11. ANÁLISES
# ============================================
echo ""
echo ">>> CATEGORIA: ANÁLISES"
run_test "Análise de despesas por partido" "analise_despesas_partido" "{\"ano\":2024,\"itens\":5}"

# ============================================
# RESUMO
# ============================================
echo ""
echo "============================================================"
echo "   RESUMO DOS TESTES"
echo "============================================================"
echo ""
echo "✅ Testes passaram: $PASSED"
echo "❌ Testes falharam: $FAILED"
echo "📊 Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 TODOS OS TESTES PASSARAM!"
    exit 0
else
    echo "⚠️ Alguns testes falharam. Verifique os erros acima."
    exit 1
fi

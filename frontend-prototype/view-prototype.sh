#!/bin/bash

# Script para visualizar o protótipo do Agente Cidadão

echo "🇧🇷 Agente Cidadão - Visualizador de Protótipo"
echo "=============================================="
echo ""
echo "Escolha uma opção:"
echo ""
echo "1) Demo automática (conversas pré-carregadas)"
echo "2) Versão interativa (você pode digitar)"
echo "3) Iniciar servidor HTTP local"
echo ""
read -p "Opção [1-3]: " option

case $option in
    1)
        echo "Abrindo demo automática..."
        if command -v xdg-open &> /dev/null; then
            xdg-open demo.html
        elif command -v open &> /dev/null; then
            open demo.html
        elif command -v start &> /dev/null; then
            start demo.html
        else
            echo "Por favor, abra manualmente: $(pwd)/demo.html"
        fi
        ;;
    2)
        echo "Abrindo versão interativa..."
        if command -v xdg-open &> /dev/null; then
            xdg-open index.html
        elif command -v open &> /dev/null; then
            open index.html
        elif command -v start &> /dev/null; then
            start index.html
        else
            echo "Por favor, abra manualmente: $(pwd)/index.html"
        fi
        ;;
    3)
        echo "Iniciando servidor HTTP na porta 8000..."
        echo "Acesse: http://localhost:8000"
        echo ""
        echo "Demo automática: http://localhost:8000/demo.html"
        echo "Versão interativa: http://localhost:8000/index.html"
        echo ""
        echo "Pressione Ctrl+C para parar o servidor"
        echo ""

        if command -v python3 &> /dev/null; then
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            python -m SimpleHTTPServer 8000
        else
            echo "Python não encontrado. Por favor, instale Python para usar servidor HTTP."
        fi
        ;;
    *)
        echo "Opção inválida!"
        exit 1
        ;;
esac

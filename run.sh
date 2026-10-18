#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "   ⚖️  FATOS CRUZADOS — Notícias Imparciais Multi-Fonte"
echo "=========================================================="

if [ ! -d ".venv" ]; then
    echo "📦 Criando ambiente virtual Python..."
    python3 -m venv .venv
    source .venv/bin/activate
    echo "⬇️ Instalando dependências..."
    pip install -q --upgrade pip
    pip install -q -r requirements.txt
else
    source .venv/bin/activate
fi

# Initial collection if database doesn't exist yet
if [ ! -f "data/fatos.db" ]; then
    echo "🌐 Executando coleta inicial de fontes..."
    python3 -m backend.ingestion.collector
    python3 -c "from backend.analysis.clustering import run_clustering; run_clustering()"
fi

echo "🚀 Iniciando servidor em http://localhost:8000"
echo "Pressione Ctrl+C para encerrar."
python3 -m backend.main

#!/usr/bin/env python3
"""
PRISMA — Script de Atualização e Publicação Automatizada (GitHub Actions / Local)
Coleta notícias dos 62 feeds RSS, realiza clustering por similaridade semântica,
extrai sínteses e fatos consensuais, e exporta os dados estáticos para docs/ e frontend/.
"""

import os
import sys
import json
import asyncio
import subprocess
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.database import init_db, get_stories, get_database_stats
from backend.ingestion.collector import run_collector
from backend.analysis.clustering import run_clustering


async def main():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Iniciando ciclo de atualização do PRISMA...")

    # 1. Inicializa o banco SQLite
    init_db()

    # 2. Executa a coleta multi-fonte concorrente dos 62 canais
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Coletando feeds RSS...")
    collector_res = await run_collector()
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Coleta finalizada: {collector_res.get('total_saved', 0)} novos artigos salvos de {collector_res.get('sources_processed', 0)} fontes.")

    # 3. Executa o agrupamento de matérias (clustering) e síntese de consenso
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Agrupando pautas e analisando espectro...")
    cluster_res = run_clustering()
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Agrupamento finalizado: {cluster_res.get('total_stories', 0)} pautas identificadas.")

    # 4. Obtém as pautas consolidadas
    stories = get_stories(limit=60, min_sources=1)
    stats = get_database_stats()
    now_utc = datetime.now(timezone.utc)

    payload = {
        "version": "1.0",
        "updated_at": now_utc.isoformat(),
        "updated_at_formatted": now_utc.strftime("%d/%m/%Y às %H:%M UTC"),
        "count": len(stories),
        "stories": stories,
        "stats": stats
    }

    # 5. Salva o feed leve data/latest.json em docs/, frontend/ e client/public/
    for out_dir in [
        BASE_DIR / "docs" / "data",
        BASE_DIR / "frontend" / "data",
        BASE_DIR / "client" / "public" / "data",
    ]:
        out_dir.mkdir(parents=True, exist_ok=True)
        json_path = out_dir / "latest.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Exportado: {json_path} ({len(stories)} histórias)")

    # 6. Reconstrói o frontend estático para docs/
    client_dir = BASE_DIR / "client"
    if client_dir.exists():
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Compilando frontend para docs/index.html...")
        cmd = ["npm", "run", "build"]
        build_proc = subprocess.run(cmd, cwd=str(client_dir), capture_output=True, text=True)
        if build_proc.returncode != 0:
            print("[ERRO BUILD]", build_proc.stderr)
            sys.exit(1)
        else:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Build do frontend concluído com sucesso!")

    print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ Ciclo de atualização concluído com sucesso!")


if __name__ == "__main__":
    asyncio.run(main())

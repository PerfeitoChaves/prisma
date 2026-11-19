#!/usr/bin/env python3
"""
PRISMA — Script de Atualização e Publicação Automatizada (GitHub Actions / Local)
Coleta notícias dos 62 feeds RSS, realiza clustering por similaridade semântica,
extrai sínteses e fatos consensuais, e exporta os dados estáticos para docs/ e frontend/.
"""

import os
import sys
import json
import hashlib
import asyncio
import subprocess
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.database import init_db, get_stories, get_database_stats, generate_rss_feed
from backend.ingestion.collector import run_collector
from backend.analysis.clustering import run_clustering
from backend.ingestion.youtube_live import resolve_live_channels
from backend.api.routes import build_trends_catalog


def _parse_words(v):
    if isinstance(v, list):
        return v
    try:
        p = json.loads((v or "[]").replace("'", '"'))
        return p if isinstance(p, list) else []
    except ValueError:
        return []


def build_ingest(payload: dict) -> dict:
    """Prepara o lote para POST /prisma/api/ingest (Worker + D1).

    O SQLite do Action é recriado a cada run, então o id numérico da pauta muda.
    Chave estável: o artigo mais antigo do cluster (artigos novos entram depois dele).
    Todo o trabalho pesado fica aqui para o Worker caber nos 10 ms de CPU do plano grátis.
    """
    stories, articles = [], []
    for s in payload.get("stories", []):
        arts = s.get("articles") or []
        pubs = sorted((a.get("published_at") or a.get("created_at") or "", a["id"]) for a in arts if a.get("id"))
        key = pubs[0][1] if pubs else f"s{s['id']}"
        latest = max((p for p, _ in pubs), default="") or s.get("updated_at") or payload.get("updated_at")
        data = {**s, "id": key}
        # created_at/updated_at mudam a cada run; ficam fora do hash
        stable = {**data, "created_at": None, "updated_at": None,
                  "articles": [{**a, "created_at": None} for a in arts]}
        stories.append({
            "key": key,
            "category": s.get("category"),
            "latest_pub": latest,
            "hash": hashlib.sha1(json.dumps(stable, sort_keys=True, ensure_ascii=False).encode()).hexdigest(),
            "data": json.dumps(data, ensure_ascii=False),
        })
        for a in arts:
            if not (a.get("id") and a.get("source_id")):
                continue
            articles.append({
                "id": a["id"],
                "story_key": key,
                "source_id": a["source_id"],
                "source_name": a.get("source_name") or a["source_id"],
                "spectrum": a.get("spectrum"),
                "category": a.get("category") or s.get("category"),
                "published_at": a.get("published_at") or a.get("created_at"),
                "subjectivity": float(a.get("subjectivity_score") or 0),
                "sentiment": a.get("sentiment_label") or "neutral",
                "loaded_words": json.dumps(_parse_words(a.get("loaded_words")), ensure_ascii=False),
            })
    raw_stats = payload.get("stats")
    light_stats = (
        {
            k: raw_stats[k]
            for k in ("total_articles", "total_stories", "articles_by_category", "articles_by_spectrum", "top_sources")
            if k in raw_stats
        }
        if isinstance(raw_stats, dict)
        else raw_stats
    )
    meta = {
        "stats": light_stats,
        "live_channels": payload.get("live_channels"),
        "trends": payload.get("trends"),
        "updated_at": payload.get("updated_at"),
    }
    return {
        "stories": stories,
        "articles": json.dumps(articles, ensure_ascii=False),
        "meta": json.dumps(meta, ensure_ascii=False),
    }


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

    # 4. Obtém as pautas consolidadas e canais ao vivo
    # Com D1 (Action) envia bem mais pautas; o latest.json local continua leve
    stories = get_stories(limit=150 if os.environ.get("PRISMA_INGEST_TOKEN") else 60, min_sources=1)
    stats = get_database_stats()
    now_utc = datetime.now(timezone.utc)

    print(f"[{datetime.now().strftime('%H:%M:%S')}] Resolvendo IDs de transmissões ao vivo do YouTube...")
    live_channels = await resolve_live_channels(force_refresh=True)
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {len(live_channels)} canais de TV ao vivo verificados.")

    print(f"[{datetime.now().strftime('%H:%M:%S')}] Coletando tendências do Radar X...")
    trends = await build_trends_catalog()
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {len(trends)} tendências coletadas.")

    payload = {
        "version": "1.0",
        "updated_at": now_utc.isoformat(),
        "updated_at_formatted": now_utc.strftime("%d/%m/%Y às %H:%M UTC"),
        "count": len(stories),
        "stories": stories,
        "stats": stats,
        "live_channels": live_channels,
        "trends": trends,
    }

    # 5a. No GitHub Actions: envia as pautas para o D1 via Worker e encerra (sem commit, sem rebuild)
    ingest_token = os.environ.get("PRISMA_INGEST_TOKEN")
    if ingest_token:
        failed = 0
        # Lotes de 50 pautas: um POST de ~1 MB cabe nos 10 ms de CPU do Worker grátis
        for i in range(0, max(len(stories), 1), 50):
            req = urllib.request.Request(
                os.environ.get("PRISMA_INGEST_URL", "https://pchaves.org/prisma/api/ingest"),
                data=json.dumps(build_ingest({**payload, "stories": stories[i:i + 50]}), ensure_ascii=False).encode("utf-8"),
                headers={"Authorization": f"Bearer {ingest_token}", "Content-Type": "application/json", "User-Agent": "prisma-ingest/1.0"},
                method="POST",
            )
            try:
                with urllib.request.urlopen(req, timeout=60) as res:
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ Enviado ao D1 (lote {i // 50 + 1}): {res.read().decode()}")
            except urllib.error.HTTPError as e:
                failed += 1
                print(f"[ERRO D1] lote {i // 50 + 1}: HTTP {e.code} {e.read().decode()[:500]}")
        if failed:
            sys.exit(1)
        return

    # 5b. Local: salva o feed leve data/latest.json e feed.xml em docs/, frontend/ e client/public/
    rss_xml = generate_rss_feed(stories, now_utc)
    for root_dir in [
        BASE_DIR / "docs",
        BASE_DIR / "frontend",
        BASE_DIR / "client" / "public",
    ]:
        data_dir = root_dir / "data"
        data_dir.mkdir(parents=True, exist_ok=True)
        json_path = data_dir / "latest.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        rss_path = root_dir / "feed.xml"
        with open(rss_path, "w", encoding="utf-8") as f:
            f.write(rss_xml)
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Exportado: {json_path} e {rss_path} ({len(stories)} histórias)")

    # 6. Reconstrói o frontend estático para docs/
    client_dir = BASE_DIR / "client"
    if client_dir.exists():
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Compilando frontend para docs/index.html...")
        cmd = ["npm.cmd" if os.name == "nt" else "npm", "run", "build"]
        build_proc = subprocess.run(cmd, cwd=str(client_dir), capture_output=True, text=True)
        if build_proc.returncode != 0:
            print("[ERRO BUILD]", build_proc.stderr)
            sys.exit(1)
        else:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Build do frontend concluído com sucesso!")

    print(f"[{datetime.now().strftime('%H:%M:%S')}] ✅ Ciclo de atualização concluído com sucesso!")


if __name__ == "__main__":
    asyncio.run(main())

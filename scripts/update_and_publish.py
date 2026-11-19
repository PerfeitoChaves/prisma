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
import httpx

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


def _fmt_br(val: float, decimals: int = 2) -> str:
    return f"{val:,.{decimals}f}".replace(",", "X").replace(".", ",").replace("X", ".")


def _dir_from_delta(delta: float, eps: float = 0.01) -> str:
    if delta > eps:
        return "up"
    if delta < -eps:
        return "down"
    return "flat"


async def fetch_market_ticker() -> list:
    """Coleta cotações reais em APIs públicas 100% gratuitas sem chave (AwesomeAPI, BCB SGS, Yahoo Finance)."""
    items = []
    seen = set()
    usd_brl = None
    headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) prisma-ticker/1.0"}

    async def _yahoo_quote(client: httpx.AsyncClient, symbol: str):
        r = await client.get(f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=2d")
        if r.status_code != 200:
            return None
        meta_y = r.json().get("chart", {}).get("result", [{}])[0].get("meta", {})
        price = meta_y.get("regularMarketPrice")
        if price is None:
            return None
        prev = meta_y.get("chartPreviousClose") or meta_y.get("previousClose") or price
        return float(price), float(prev)

    async with httpx.AsyncClient(timeout=8.0, headers=headers, follow_redirects=True) as client:
        # 1. Dólar, Euro e Bitcoin via AwesomeAPI (gratuita, sem chave)
        try:
            r = await client.get("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL")
            if r.status_code == 200:
                data = r.json()
                if "USDBRL" in data:
                    bid = float(data["USDBRL"]["bid"])
                    usd_brl = bid
                    pct = float(data["USDBRL"].get("pctChange", 0))
                    items.append({"label": "DÓLAR", "value": f"R$ {_fmt_br(bid, 2)}", "dir": _dir_from_delta(pct, 0.05)})
                    seen.add("DÓLAR")
                if "EURBRL" in data:
                    bid = float(data["EURBRL"]["bid"])
                    pct = float(data["EURBRL"].get("pctChange", 0))
                    items.append({"label": "EURO", "value": f"R$ {_fmt_br(bid, 2)}", "dir": _dir_from_delta(pct, 0.05)})
                    seen.add("EURO")
                if "BTCBRL" in data:
                    bid = float(data["BTCBRL"]["bid"])
                    pct = float(data["BTCBRL"].get("pctChange", 0))
                    val_str = f"R$ {_fmt_br(bid / 1000.0, 0)} mil" if bid >= 10000 else f"R$ {_fmt_br(bid, 0)}"
                    items.append({"label": "BTC", "value": val_str, "dir": _dir_from_delta(pct, 0.2)})
                    seen.add("BTC")
        except Exception as e:
            print(f"[Ticker] AwesomeAPI indisponível: {e}")

        # 1b. Fallback via Yahoo Finance para DÓLAR, EURO e BTC (resiliente em IPs de datacenter do GitHub Actions)
        if "DÓLAR" not in seen:
            try:
                q = await _yahoo_quote(client, "BRL%3DX")
                if q:
                    price, prev = q
                    usd_brl = price
                    items.append({"label": "DÓLAR", "value": f"R$ {_fmt_br(price, 2)}", "dir": _dir_from_delta(price - prev, 0.005)})
                    seen.add("DÓLAR")
            except Exception as e:
                print(f"[Ticker] Yahoo DÓLAR indisponível: {e}")

        if "EURO" not in seen:
            try:
                q = await _yahoo_quote(client, "EURBRL%3DX")
                if q:
                    price, prev = q
                    items.append({"label": "EURO", "value": f"R$ {_fmt_br(price, 2)}", "dir": _dir_from_delta(price - prev, 0.005)})
                    seen.add("EURO")
            except Exception as e:
                print(f"[Ticker] Yahoo EURO indisponível: {e}")

        if "BTC" not in seen:
            try:
                q = await _yahoo_quote(client, "BTC-USD")
                if q:
                    price, prev = q
                    if usd_brl:
                        brl = price * usd_brl
                        val_str = f"R$ {_fmt_br(brl / 1000.0, 0)} mil"
                    else:
                        val_str = f"US$ {_fmt_br(price / 1000.0, 1)} mil"
                    items.append({"label": "BTC", "value": val_str, "dir": _dir_from_delta(price - prev, 50.0)})
                    seen.add("BTC")
            except Exception as e:
                print(f"[Ticker] Yahoo BTC indisponível: {e}")

        # 2. Selic Meta (série 432) e IPCA mensal (série 433) via Banco Central do Brasil (oficial, gratuita)
        for series_id, label, suffix in [(432, "SELIC", "% a.a."), (433, "IPCA", "%")]:
            try:
                r = await client.get(f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{series_id}/dados/ultimos/2?formato=json")
                if r.status_code == 200:
                    rows = r.json()
                    if isinstance(rows, list) and rows:
                        last_val = float(str(rows[-1]["valor"]).replace(",", "."))
                        prev_val = float(str(rows[-2]["valor"]).replace(",", ".")) if len(rows) >= 2 else last_val
                        items.append({
                            "label": label,
                            "value": f"{_fmt_br(last_val, 2)}{suffix}",
                            "dir": _dir_from_delta(last_val - prev_val, 0.001),
                        })
            except Exception as e:
                print(f"[Ticker] BCB série {series_id} indisponível: {e}")

        # 3. Ibovespa (^BVSP) e Petróleo WTI (CL=F) via Yahoo Finance JSON público
        for symbol, label, prefix, dec in [("%5EBVSP", "IBOV", "", 0), ("CL%3DF", "WTI", "US$ ", 2)]:
            try:
                q = await _yahoo_quote(client, symbol)
                if q:
                    price, prev = q
                    items.append({
                        "label": label,
                        "value": f"{prefix}{_fmt_br(price, dec)}",
                        "dir": _dir_from_delta(price - prev, 0.01),
                    })
            except Exception as e:
                print(f"[Ticker] Yahoo {label} indisponível: {e}")

    return items


def build_source_health(collector_res: dict, now_utc: datetime) -> dict:
    """Resume saúde das fontes RSS coletadas no ciclo atual."""
    details = collector_res.get("details") or {}
    ok_count = 0
    failed_list = []
    for name, info in details.items():
        if isinstance(info, dict) and info.get("collected", 0) > 0:
            ok_count += 1
        else:
            reason = info.get("error") if isinstance(info, dict) and info.get("error") else "0 artigos"
            failed_list.append({"name": name, "reason": str(reason)[:80]})
    total = collector_res.get("sources_processed") or len(details)
    return {
        "total": total,
        "ok": ok_count,
        "failing": len(failed_list),
        "failed_list": failed_list[:20],
        "checked_at": now_utc.isoformat(),
    }


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
        "ticker": payload.get("ticker"),
        "source_health": payload.get("source_health"),
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

    print(f"[{datetime.now().strftime('%H:%M:%S')}] Coletando cotações de mercado (APIs gratuitas)...")
    ticker = await fetch_market_ticker()
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {len(ticker)} indicadores de mercado atualizados.")

    source_health = build_source_health(collector_res, now_utc)

    payload = {
        "version": "1.0",
        "updated_at": now_utc.isoformat(),
        "updated_at_formatted": now_utc.strftime("%d/%m/%Y às %H:%M UTC"),
        "count": len(stories),
        "stories": stories,
        "stats": stats,
        "live_channels": live_channels,
        "trends": trends,
        "ticker": ticker,
        "source_health": source_health,
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

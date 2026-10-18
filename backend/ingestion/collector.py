import json
import hashlib
import re
import html
import asyncio
from typing import List, Dict, Any
from datetime import datetime, timezone
import dateutil.parser
import httpx
import feedparser

from backend.config import SOURCES_FILE, REQUEST_TIMEOUT, MAX_ARTICLES_PER_SOURCE
from backend.database import save_article
from backend.analysis.bias_detector import analyze_text_bias
from backend.ingestion.translator import translate_to_pt

SPECTRUM_TO_POLITICAL = {
    "esquerda": "left",
    "centro-esquerda": "center-left",
    "centro": "center",
    "centro-direita": "center-right",
    "direita": "right",
    "independentes": "center",
    "agências internacionais": "center",
    "agencias_internacionais": "center",
    "left": "left",
    "center-left": "center-left",
    "center": "center",
    "center-right": "center-right",
    "right": "right",
}

def clean_html(raw_html: str) -> str:
    if not raw_html:
        return ""
    # Remove HTML tags
    clean = re.sub(r'<[^>]+>', ' ', raw_html)
    # Unescape entities like &amp;, &quot;, &nbsp;
    clean = html.unescape(clean)
    # Normalize whitespaces
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean

def load_sources() -> List[Dict[str, Any]]:
    with open(SOURCES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def parse_date(entry: Any) -> str:
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            return datetime(*entry.published_parsed[:6]).isoformat()
        except Exception:
            pass
    if hasattr(entry, "published") and entry.published:
        try:
            return dateutil.parser.parse(entry.published).isoformat()
        except Exception:
            pass
    if hasattr(entry, "updated_parsed") and entry.updated_parsed:
        try:
            return datetime(*entry.updated_parsed[:6]).isoformat()
        except Exception:
            pass
    return datetime.now(timezone.utc).isoformat()

async def fetch_feed(client: httpx.AsyncClient, source: Dict[str, Any]) -> List[Dict[str, Any]]:
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
    }
    articles = []
    feed_url = source.get("rss") or source.get("url")
    try:
        timeout = httpx.Timeout(22.0, connect=10.0)
        resp = await client.get(feed_url, headers=headers, timeout=timeout, follow_redirects=True)
        if resp.status_code != 200:
            print(f"[Collector] Fonte {source['name']} retornou status {resp.status_code}")
            return articles
            
        feed = feedparser.parse(resp.content)
        if not feed.entries:
            print(f"[Collector] Fonte {source['name']} não retornou artigos válidos")
            return articles
            
        for entry in feed.entries[:MAX_ARTICLES_PER_SOURCE]:
            link = getattr(entry, "link", "")
            if not link:
                continue
                
            title = clean_html(getattr(entry, "title", ""))
            if not title or len(title) < 5:
                continue
                
            summary = clean_html(getattr(entry, "summary", "") or getattr(entry, "description", ""))
            pub_date = parse_date(entry)
            
            # Stable unique ID
            article_id = hashlib.md5(link.encode("utf-8")).hexdigest()
            
            lang = source.get("language", "pt")
            bias_metrics = analyze_text_bias(title, summary, lang)
            
            title_original = title
            summary_original = summary
            if lang != "pt":
                title = await asyncio.to_thread(translate_to_pt, title, lang)
                if summary:
                    summary = await asyncio.to_thread(translate_to_pt, summary[:500], lang)
            
            # Map editorial spectrum to political spectrum bucket for clustering & bias scoring
            spec_raw = source.get("spectrum", "center")
            spec_code = source.get("spectrum_code") or SPECTRUM_TO_POLITICAL.get(
                spec_raw.lower() if isinstance(spec_raw, str) else spec_raw, "center"
            )
            
            article_data = {
                "id": article_id,
                "source_id": source["id"],
                "source_name": source["name"],
                "title": title,
                "title_original": title_original,
                "link": link,
                "summary": summary,
                "summary_original": summary_original,
                "published_at": pub_date,
                "category": source.get("category", "geral"),
                "spectrum": spec_code,
                "language": lang,
                "loaded_words": bias_metrics["loaded_words"],
                "subjectivity_score": bias_metrics["subjectivity_score"],
                "sentiment_label": bias_metrics["sentiment_label"]
            }
            articles.append(article_data)
            
    except Exception as e:
        print(f"[Collector] Erro ao coletar {source['name']}: {type(e).__name__} {e}")
        
    return articles

async def run_collector() -> Dict[str, Any]:
    sources = load_sources()
    total_collected = 0
    total_saved = 0
    results_by_source = {}
    
    # Throttle concurrency to 6 parallel requests to avoid timeouts/rate limiting
    sem = asyncio.Semaphore(6)
    
    async def fetch_with_sem(client: httpx.AsyncClient, src: Dict[str, Any]):
        async with sem:
            return await fetch_feed(client, src)
            
    async with httpx.AsyncClient() as client:
        tasks = [fetch_with_sem(client, s) for s in sources]
        feed_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for source, res in zip(sources, feed_results):
            if isinstance(res, list):
                saved_count = 0
                for art in res:
                    if save_article(art):
                        saved_count += 1
                total_collected += len(res)
                total_saved += saved_count
                results_by_source[source["name"]] = {"collected": len(res), "saved": saved_count}
            else:
                results_by_source[source["name"]] = {"error": str(res)}
                
    return {
        "status": "success",
        "total_collected": total_collected,
        "total_saved": total_saved,
        "sources_processed": len(sources),
        "details": results_by_source
    }

if __name__ == "__main__":
    from backend.database import init_db
    init_db()
    res = asyncio.run(run_collector())
    print(f"Coleta concluída: {res['total_saved']} artigos salvos de {res['sources_processed']} fontes.")

from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import Optional, List, Dict, Any
import asyncio
import re
import hashlib
import urllib.parse
import time
from datetime import datetime, timezone
import httpx
import feedparser
from bs4 import BeautifulSoup

from backend.models import TrendItem, TrendsResponse

from backend.database import (
    get_stories,
    get_story_by_id,
    get_database_stats,
    search_stories_db,
    save_article,
    save_story_cluster,
    save_story_analysis,
)
from backend.ingestion.collector import run_collector, load_sources
from backend.analysis.clustering import run_clustering
from backend.analysis.reader import get_article_reading_view
from backend.analysis.story_compiler import compile_story_summary
from backend.analysis.bias_detector import calculate_spectrum_and_blindspots
from backend.analysis.neutral_synthesizer import generate_story_synthesis
from backend.ingestion.youtube_live import resolve_live_channels

router = APIRouter(prefix="/api")

def fetch_and_cluster_topic(query: str) -> Optional[int]:
    """Busca em tempo real notícias sobre o tema em múltiplos veículos via Google News RSS,
    ingesta no SQLite e gera o cluster com síntese imparcial e divergências."""
    try:
        url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419"
        headers = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
        with httpx.Client(timeout=8.0, follow_redirects=True, headers=headers) as client:
            resp = client.get(url)
            if resp.status_code != 200:
                return None
            feed = feedparser.parse(resp.content)

        articles = []
        now = datetime.now(timezone.utc).isoformat()

        def guess_spectrum(source_name: str) -> str:
            sn = source_name.lower()
            if any(k in sn for k in ["brasil de fato", "carta capital", "brasil 247", "intercept", "opera mundi"]):
                return "left"
            if any(k in sn for k in ["folha", "uol", "elpais", "el país"]):
                return "center-left"
            if any(k in sn for k in ["estadao", "estadão", "veja", "cnn brasil", "o globo", "valor"]):
                return "center-right"
            if any(k in sn for k in ["jovem pan", "antagonista", "gazeta do povo", "oeste"]):
                return "right"
            return "center"

        for entry in feed.entries[:25]:
            link = getattr(entry, "link", "")
            if not link:
                continue
            title = getattr(entry, "title", "").strip()
            source_name = getattr(entry, "source", {}).get("title", "Veículo").strip()
            raw_summary = getattr(entry, "summary", "") or title
            clean_summary = re.sub(r"<[^>]+>", " ", raw_summary)
            clean_summary = re.sub(r"&[a-z0-9#]+;", " ", clean_summary)
            clean_summary = re.sub(r"\s+", " ", clean_summary).strip()
            summary = clean_summary if len(clean_summary) > 20 else title
            source_id = re.sub(r"[^a-zA-Z0-9_]", "", source_name.lower().replace(" ", "_"))[:20] or "fonte"
            aid = hashlib.md5(link.encode("utf-8")).hexdigest()
            spec = guess_spectrum(source_name)

            art_data = {
                "id": aid,
                "source_id": source_id,
                "source_name": source_name,
                "title": title,
                "link": link,
                "summary": summary,
                "published_at": now,
                "category": "geral",
                "spectrum": spec,
                "language": "pt",
                "loaded_words": [],
                "subjectivity_score": 0.0,
                "sentiment_label": "neutral",
                "title_original": title,
                "summary_original": summary,
            }
            if save_article(art_data):
                articles.append(art_data)

        if articles:
            spectrum_dist, blindspot = calculate_spectrum_and_blindspots(articles)
            rep_title = articles[0]["title"]
            cluster_title = f"{query.capitalize()}: {rep_title}"
            story_id = save_story_cluster(
                title=cluster_title,
                category="geral",
                article_ids=[a["id"] for a in articles],
                spectrum_distribution=spectrum_dist,
                blindspot_warning=blindspot,
            )
            synthesis = generate_story_synthesis(cluster_title, articles)
            save_story_analysis(
                story_id=story_id,
                neutral_summary=synthesis["neutral_summary"],
                consensus_facts=synthesis["consensus_facts"],
                divergent_points=synthesis["divergent_points"],
                framing_contrast=synthesis["framing_contrast"],
            )
            return story_id
    except Exception as e:
        print(f"[Search] Erro ao buscar '{query}': {e}")
    return None


@router.get("/stories/{story_id}/read")
async def read_story_compiled(story_id: int):
    story = get_story_by_id(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Pauta não encontrada")
    
    articles = story.get("articles", [])
    compiled = compile_story_summary(story, articles)
    
    return {
        "id": story["id"],
        "story_id": story["id"],
        "title": story["title"],
        "category": story["category"],
        "topic": story.get("topic", "Geral"),
        "topic_icon": story.get("topic_icon", "📰"),
        "source_count": story["source_count"],
        "article_count": story["article_count"],
        "spectrum_distribution": story.get("spectrum_distribution", {}),
        "blindspot_warning": story.get("blindspot_warning"),
        "compiled_summary": compiled,
        "articles": [
            {
                "id": a["id"],
                "source_id": a.get("source_id"),
                "source_name": a["source_name"],
                "spectrum": a.get("spectrum", "center"),
                "title": a["title"],
                "title_original": a.get("title_original"),
                "link": a["link"],
                "published_at": a.get("published_at"),
                "is_translated": a.get("language") != "pt",
                "original_language": a.get("language", "pt")
            }
            for a in articles
        ]
    }

@router.get("/articles/{article_id}/read")
async def read_article(article_id: str):
    view = get_article_reading_view(article_id)
    if not view:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    return view


@router.get("/stories")
async def list_stories(
    category: Optional[str] = Query(None, description="brasil, mundo ou todas"),
    min_sources: int = Query(1, ge=1, le=10),
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100)
):
    if search and search.strip():
        stories = search_stories_db(search, limit=limit)
        # Se encontrou poucas histórias, busca novas matérias em tempo real
        if len(stories) < 2:
            await asyncio.to_thread(fetch_and_cluster_topic, search)
            stories = search_stories_db(search, limit=limit)
    else:
        stories = get_stories(category=category, limit=limit, min_sources=min_sources)
    return {
        "count": len(stories),
        "stories": stories
    }

@router.get("/search")
async def search_topics(
    q: str = Query(..., min_length=2, description="Termo de pesquisa (ex: python, stf, ia)"),
    live: bool = Query(True, description="Buscar novas matérias ao vivo se houver poucas no acervo")
):
    clean_q = q.strip()
    stories = search_stories_db(clean_q, limit=30)
    
    if len(stories) < 2 and live:
        await asyncio.to_thread(fetch_and_cluster_topic, clean_q)
        stories = search_stories_db(clean_q, limit=30)
        
    return {
        "query": clean_q,
        "count": len(stories),
        "stories": stories
    }

@router.get("/stories/{story_id}")
async def story_detail(story_id: int):
    story = get_story_by_id(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Pauta não encontrada")
    return story

@router.get("/sources")
async def list_sources():
    sources = load_sources()
    return {
        "count": len(sources),
        "sources": sources
    }

# In-memory cache for /api/trends (15 minutes TTL)
_TRENDS_CACHE: Dict[str, Any] = {
    "timestamp": 0.0,
    "data": None
}
TRENDS_CACHE_TTL = 900  # 15 minutes in seconds

FALLBACK_TRENDS: List[Dict[str, Any]] = [
    {
        "id": "trend_stf",
        "topic": "#STF",
        "volume": "185 mil posts",
        "volume_numeric": 185000,
        "status": "alta",
        "traction": "em_alta",
        "category": "politica",
        "context": "Julgamentos e decisões recentes no Supremo Tribunal Federal com repercussão nacional.",
        "url": "https://x.com/search?q=%23STF",
        "relatedKeywords": ["stf", "supremo", "moraes", "julgamento", "tribunal"]
    },
    {
        "id": "trend_taxaselic",
        "topic": "#TaxaSelic",
        "volume": "142 mil posts",
        "volume_numeric": 142000,
        "status": "alta",
        "traction": "em_alta",
        "category": "economia",
        "context": "Decisão do Copom e expectativas do mercado sobre a taxa básica de juros e controle da inflação.",
        "url": "https://x.com/search?q=%23TaxaSelic",
        "relatedKeywords": ["selic", "copom", "juros", "banco central", "inflacao"]
    },
    {
        "id": "trend_dolar",
        "topic": "#Dolar",
        "volume": "210 mil posts",
        "volume_numeric": 210000,
        "status": "explodindo",
        "traction": "urgente",
        "category": "economia",
        "context": "Oscilações cambiais influenciadas pelo cenário fiscal doméstico e taxas internacionais.",
        "url": "https://x.com/search?q=%23Dolar",
        "relatedKeywords": ["dolar", "cambio", "moeda", "cotacao", "fiscal"]
    },
    {
        "id": "trend_reformatributaria",
        "topic": "#ReformaTributaria",
        "volume": "98 mil posts",
        "volume_numeric": 98000,
        "status": "estavel",
        "traction": "estavel",
        "category": "politica",
        "context": "Debates e regulamentação das leis complementares da reforma tributária no Congresso Nacional.",
        "url": "https://x.com/search?q=%23ReformaTributaria",
        "relatedKeywords": ["reforma", "tributaria", "impostos", "congresso", "tributos"]
    },
    {
        "id": "trend_ia",
        "topic": "#InteligenciaArtificial",
        "volume": "320 mil posts",
        "volume_numeric": 320000,
        "status": "explodindo",
        "traction": "pico",
        "category": "tecnologia",
        "context": "Avanços em novos modelos generativos, semicondutores e discussões sobre regulação ética.",
        "url": "https://x.com/search?q=%23InteligenciaArtificial",
        "relatedKeywords": ["ia", "inteligencia artificial", "openai", "nvidia", "deep learning"]
    },
    {
        "id": "trend_copom",
        "topic": "#Copom",
        "volume": "75 mil posts",
        "volume_numeric": 75000,
        "status": "estavel",
        "traction": "estavel",
        "category": "economia",
        "context": "Reunião de política monetária do Banco Central e projeções inflacionárias do Boletim Focus.",
        "url": "https://x.com/search?q=%23Copom",
        "relatedKeywords": ["copom", "banco central", "focus", "meta inflacao"]
    },
    {
        "id": "trend_congresso",
        "topic": "#CongressoNacional",
        "volume": "115 mil posts",
        "volume_numeric": 115000,
        "status": "alta",
        "traction": "em_alta",
        "category": "politica",
        "context": "Articulações partidárias e votações de projetos estratégicos na Câmara e no Senado.",
        "url": "https://x.com/search?q=%23CongressoNacional",
        "relatedKeywords": ["congresso", "senado", "camara", "deputados", "parlamento"]
    },
    {
        "id": "trend_inflacao",
        "topic": "#Inflacao",
        "volume": "88 mil posts",
        "volume_numeric": 88000,
        "status": "estavel",
        "traction": "estavel",
        "category": "economia",
        "context": "Divulgação dos índices IPCA e impacto nos preços de alimentos, combustíveis e serviços.",
        "url": "https://x.com/search?q=%23Inflacao",
        "relatedKeywords": ["inflacao", "ipca", "precos", "alimentos", "consumo"]
    },
    {
        "id": "trend_eleicoeseua",
        "topic": "#EleicoesEUA",
        "volume": "450 mil posts",
        "volume_numeric": 450000,
        "status": "explodindo",
        "traction": "urgente",
        "category": "mundo",
        "context": "Disputas políticas nos Estados Unidos e impactos nas relações internacionais e comércio exterior.",
        "url": "https://x.com/search?q=%23EleicoesEUA",
        "relatedKeywords": ["eleicoes", "eua", "trump", "biden", "geopolitica"]
    },
    {
        "id": "trend_clima",
        "topic": "#ClimaEAmazônia",
        "volume": "64 mil posts",
        "volume_numeric": 64000,
        "status": "estavel",
        "traction": "estavel",
        "category": "brasil",
        "context": "Ações de combate ao desmatamento, transição energética e cúpulas ambientais globais.",
        "url": "https://x.com/search?q=%23ClimaEAmaz%C3%B4nia",
        "relatedKeywords": ["clima", "amazonia", "meio ambiente", "sustentabilidade", "energia"]
    },
    {
        "id": "trend_seguranca",
        "topic": "#SegurançaPublica",
        "volume": "82 mil posts",
        "volume_numeric": 82000,
        "status": "alta",
        "traction": "em_alta",
        "category": "brasil",
        "context": "Operações integradas de segurança e debates sobre políticas penais nos estados.",
        "url": "https://x.com/search?q=%23Seguran%C3%A7aPublica",
        "relatedKeywords": ["seguranca", "policia", "combate ao crime", "justica"]
    },
    {
        "id": "trend_bigtech",
        "topic": "#BigTech",
        "volume": "130 mil posts",
        "volume_numeric": 130000,
        "status": "alta",
        "traction": "em_alta",
        "category": "tecnologia",
        "context": "Investigações antitruste e novidades nos serviços das maiores corporações de tecnologia.",
        "url": "https://x.com/search?q=%23BigTech",
        "relatedKeywords": ["big tech", "google", "apple", "microsoft", "meta"]
    }
]

def parse_volume_to_num(vol_str: str) -> int:
    if not vol_str:
        return 50000
    cleaned = str(vol_str).strip().upper().replace("+", "").replace(",", ".")
    try:
        # Evaluate "MIL" before "M" to prevent Portuguese "mil" (thousands) from triggering millions multiplier
        if "MIL" in cleaned:
            val = float(re.sub(r"[^\d.]", "", cleaned.replace("MIL", "")))
            return int(val * 1_000)
        if "K" in cleaned:
            val = float(re.sub(r"[^\d.]", "", cleaned.replace("K", "")))
            return int(val * 1_000)
        if "M" in cleaned:
            val = float(re.sub(r"[^\d.]", "", cleaned.replace("M", "")))
            return int(val * 1_000_000)
        digits = re.sub(r"[^\d]", "", cleaned)
        if digits:
            return int(digits)
    except Exception:
        pass
    return 50000

def infer_trend_category(topic: str) -> str:
    if not topic:
        return "brasil"
    t = topic.lower()

    # Tokenize words splitting CamelCase and delimiters to avoid substring collisions
    cleaned = re.sub(r"^#", "", topic)
    s = re.sub(r"([A-ZÀ-ÖØ-ß]+)([A-ZÀ-ÖØ-ß][a-zà-öø-ÿ])", r"\1 \2", cleaned)
    s = re.sub(r"([a-zà-öø-ÿ\d])([A-ZÀ-ÖØ-ß])", r"\1 \2", s)
    tokens = set(re.findall(r"[A-Za-zÀ-ÖØ-öø-ÿ\d]+", s.lower()))

    # 1. Geopolítica & Mundo (prioritize international conflicts over generic keywords)
    mundo_substrings = [
        "guerra", "ucrania", "ucrânia", "russia", "rússia", "israel",
        "palestin", "hezbollah", "líbano", "libano", "taiwan", "otan",
        "biden", "trump", "china", "kremlin", "venezuela"
    ]
    mundo_tokens = {"eua", "otan", "onu", "hamas", "gaza", "europa", "mundo"}
    if any(k in t for k in mundo_substrings) or bool(tokens & mundo_tokens):
        return "mundo"

    # 2. Economia (macroeconomia, câmbio, tributos)
    economia_substrings = [
        "dolar", "dólar", "selic", "copom", "inflacao", "inflação", "pib",
        "ibovespa", "juros", "fiscal", "banco central", "tribut"
    ]
    economia_tokens = {"economia", "cambio", "câmbio", "ipca", "mercado", "banco", "taxa"}
    if any(k in t for k in economia_substrings) or bool(tokens & economia_tokens):
        return "economia"

    # 3. Tecnologia (use distinctive stems and anchor short acronyms like IA/AI)
    tech_substrings = [
        "tech", "tecnologia", "apple", "google", "nvidia", "openai", "chatgpt",
        "deepmind", "playstation", "nintendo", "cyber", "software", "hardware",
        "smartphone", "iphone", "algoritmo", "inteligencia artificial", "inteligência artificial"
    ]
    tech_tokens = {"ia", "ai", "game", "games", "xbox", "app", "dev", "meta", "ps5", "gpu"}
    if any(k in t for k in tech_substrings) or bool(tokens & tech_tokens):
        return "tecnologia"

    # 4. Política (anchor party acronyms like PT/PL to standalone tokens)
    politica_substrings = [
        "lula", "bolsonaro", "moraes", "congresso", "senado", "governo",
        "camara", "câmara", "janones", "politica", "política", "reforma",
        "stf", "stj", "tse", "planalto", "parlamentar", "deputad", "senador"
    ]
    politica_tokens = {"pt", "pl", "psol", "mdb", "psd", "pdt", "partido", "pec", "eleicao", "eleição", "voto"}
    if any(k in t for k in politica_substrings) or bool(tokens & politica_tokens):
        return "politica"

    return "brasil"

def extract_related_keywords(topic: str) -> List[str]:
    cleaned = re.sub(r"^#", "", topic)
    # Include Latin-1 supplement ranges (À-Ö, Ø-ß, à-ö, ø-ÿ) to prevent fracturing Portuguese accented words
    upper_chars = r"[A-ZÀ-ÖØ-ß]"
    lower_chars = r"[a-zà-öø-ÿ]"
    pattern = rf"{upper_chars}?{lower_chars}+|{upper_chars}+(?={upper_chars}{lower_chars}|\d|\W|$)|(?:\d+)"
    words = re.findall(pattern, cleaned)
    keywords = [w.lower() for w in words if len(w) >= 3]
    if not keywords:
        keywords = [cleaned.lower()]
    return list(dict.fromkeys(keywords))

async def fetch_trends_from_scrapers() -> List[Dict[str, Any]]:
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
    extracted: List[Dict[str, Any]] = []
    seen_topics = set()

    async with httpx.AsyncClient(timeout=8.0, headers=headers) as client:
        # 1. Scrape Trends24 BR
        try:
            resp = await client.get("https://trends24.in/brazil/", follow_redirects=True)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.content, "html.parser")
                cards = soup.select(".trend-card__list li")
                for li in cards:
                    a = li.find("a")
                    if not a:
                        continue
                    topic = a.text.strip()
                    if not topic or topic in seen_topics:
                        continue
                    seen_topics.add(topic)

                    tc = li.select_one(".tweet-count")
                    vol_text = tc.text.strip() if tc else ""
                    vol_numeric = parse_volume_to_num(vol_text)
                    vol_display = vol_text if vol_text else f"{vol_numeric // 1000} mil posts"

                    extracted.append({
                        "topic": topic,
                        "volume": vol_display,
                        "volume_numeric": vol_numeric,
                        "source": "trends24"
                    })
                    if len(extracted) >= 20:
                        break
        except Exception as e:
            print(f"[Trends] Erro ao consultar Trends24: {e}")

        # 2. Scrape Google Trends RSS BR
        try:
            resp_g = await client.get("https://trends.google.com/trending/rss?geo=BR", follow_redirects=True)
            if resp_g.status_code == 200:
                feed = feedparser.parse(resp_g.content)
                for entry in feed.entries:
                    title = getattr(entry, "title", "").strip()
                    if not title or title in seen_topics:
                        continue
                    seen_topics.add(title)

                    traffic = getattr(entry, "ht_approx_traffic", "")
                    vol_numeric = parse_volume_to_num(traffic)
                    vol_display = f"{traffic} buscas" if traffic else f"{vol_numeric // 1000} mil buscas"

                    extracted.append({
                        "topic": title,
                        "volume": vol_display,
                        "volume_numeric": vol_numeric,
                        "source": "google_trends"
                    })
                    if len(extracted) >= 30:
                        break
        except Exception as e:
            print(f"[Trends] Erro ao consultar Google Trends: {e}")

    return extracted

async def build_trends_catalog() -> List[Dict[str, Any]]:
    scraped = await fetch_trends_from_scrapers()

    trends_list: List[Dict[str, Any]] = []
    seen = set()

    for idx, item in enumerate(scraped):
        topic = item["topic"]
        if topic in seen:
            continue
        seen.add(topic)

        tid = "trend_" + hashlib.md5(topic.encode("utf-8")).hexdigest()[:10]
        cat = infer_trend_category(topic)
        vol_num = item["volume_numeric"]
        vol_str = item["volume"]

        if vol_num >= 200000 or idx < 3:
            status = "explodindo"
            traction = "urgente"
        elif vol_num >= 80000 or idx < 8:
            status = "alta"
            traction = "em_alta"
        else:
            status = "estavel"
            traction = "estavel"

        hashtag = topic if topic.startswith("#") else f"#{re.sub(r'[^a-zA-Z0-9_]', '', topic)}"
        x_url = f"https://x.com/search?q={urllib.parse.quote(topic)}"
        keywords = extract_related_keywords(topic)
        context = f"Assunto em destaque no X (Brasil) com ampla repercussão em {cat} e debates na comunidade."

        matched_count = 0
        try:
            matches = search_stories_db(topic.replace("#", ""), limit=5)
            matched_count = len(matches)
        except Exception:
            pass

        trends_list.append({
            "id": tid,
            "topic": topic,
            "volume": vol_str,
            "volume_numeric": vol_num,
            "rawVolume": vol_num,
            "estimatedVolume": vol_str,
            "status": status,
            "traction": traction,
            "category": cat,
            "context": context,
            "url": x_url,
            "xUrl": x_url,
            "hashtag": hashtag,
            "relatedKeywords": keywords,
            "matchedStoriesCount": matched_count
        })

    # Supplement with fallback trends if fewer than 10 trends scraped
    if len(trends_list) < 10:
        for fb in FALLBACK_TRENDS:
            if fb["topic"] not in seen:
                seen.add(fb["topic"])
                x_url = f"https://x.com/search?q={urllib.parse.quote(fb['topic'])}"
                trends_list.append({
                    "id": fb["id"],
                    "topic": fb["topic"],
                    "volume": fb["volume"],
                    "volume_numeric": fb["volume_numeric"],
                    "rawVolume": fb["volume_numeric"],
                    "estimatedVolume": fb["volume"],
                    "status": fb["status"],
                    "traction": fb["traction"],
                    "category": fb["category"],
                    "context": fb["context"],
                    "url": x_url,
                    "xUrl": x_url,
                    "hashtag": fb["topic"],
                    "relatedKeywords": fb["relatedKeywords"],
                    "matchedStoriesCount": 0
                })
            if len(trends_list) >= 15:
                break

    return trends_list

@router.get("/trends", response_model=TrendsResponse)
async def list_trends(refresh: bool = Query(False, description="Forçar atualização dos dados")):
    now = time.time()
    if not refresh and _TRENDS_CACHE["data"] and (now - _TRENDS_CACHE["timestamp"] < TRENDS_CACHE_TTL):
        return _TRENDS_CACHE["data"]

    trends = await build_trends_catalog()
    response_data = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "trends": trends
    }
    _TRENDS_CACHE["timestamp"] = now
    _TRENDS_CACHE["data"] = response_data
    return response_data

@router.get("/live/channels")
async def get_live_channels(refresh: bool = Query(False, description="Forçar resolução das transmissões ao vivo")):
    """Retorna a grade de canais de TV ao vivo com seus IDs de vídeo do YouTube em tempo real."""
    channels = await resolve_live_channels(force_refresh=refresh)
    return {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "channels": channels
    }

@router.get("/stats")
async def system_stats():
    return get_database_stats()

@router.post("/refresh")
async def trigger_refresh():
    collect_res = await run_collector()
    cluster_res = run_clustering()
    stats = get_database_stats()
    return {
        "status": "success",
        "collected": collect_res,
        "clustered": cluster_res,
        "current_stats": stats
    }

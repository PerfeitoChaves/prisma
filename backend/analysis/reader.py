import re
import json
from typing import Dict, Any, Optional, List
import trafilatura
from bs4 import BeautifulSoup
import httpx

from backend.database import get_article_by_id, update_article_reading_content
from backend.analysis.translator import translate_to_pt
from backend.analysis.llm_client import generate_ai_summary

def calculate_reading_time(text: str) -> int:
    words = len(text.split())
    # Average reading speed: 200 words per minute
    minutes = max(1, round(words / 200))
    return minutes

def generate_extractive_summary(title: str, text: str, max_points: int = 4) -> List[str]:
    paragraphs = [p.strip() for p in text.split("\n") if len(p.strip()) > 35]
    if not paragraphs:
        return [f"🎯 Fato Central: {title}"]

    raw_points = []
    # Point 1: Opening context / main fact
    raw_points.append(("🎯 Fato Central", paragraphs[0]))
    
    # Point 2: Look for numbers, percentages, voting counts, values ($/R$)
    number_pattern = re.compile(r'(\d+[\.,]?\d*|\bR\$|\bvotos?\b|\baprovad[oa]\b|\bcontra\b|\bpor cento\b|%)', re.IGNORECASE)
    for p in paragraphs[1:]:
        if number_pattern.search(p) and len(p) < 260:
            raw_points.append(("📊 Dados & Placar", p))
            break
            
    # Point 3: Look for positions, quotes or statements
    quote_pattern = re.compile(r'(\"|afirmou|disse|declarou|defendeu|segundo|criticou|alega)', re.IGNORECASE)
    for p in paragraphs[1:]:
        if not any(p == r[1] for r in raw_points) and quote_pattern.search(p) and len(p) < 260:
            raw_points.append(("💬 Posicionamento & Declarações", p))
            break

    # Point 4: Closing / consequence / next steps
    for p in reversed(paragraphs[-3:]):
        if not any(p == r[1] for r in raw_points) and len(p) < 260:
            raw_points.append(("🔮 Desdobramentos & Próximos Passos", p))
            break

    # Fallback if points is too short
    while len(raw_points) < min(3, len(paragraphs)):
        for p in paragraphs:
            if not any(p == r[1] for r in raw_points) and len(p) < 240:
                raw_points.append(("📌 Contexto Adicional", p))
                break

    return [f"<strong>{label}:</strong> {content}" for label, content in raw_points[:max_points]]


def fetch_and_extract_article_content(url: str) -> str:
    # 1. Try Trafilatura
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            extracted = trafilatura.extract(
                downloaded,
                include_comments=False,
                include_tables=True,
                favor_recall=True,
                output_format="txt"
            )
            if extracted and len(extracted.strip()) > 100:
                return extracted.strip()
    except Exception as e:
        print(f"[Reader] Trafilatura falhou para {url}: {e}")

    # 2. Fallback to httpx + BeautifulSoup
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        with httpx.Client(follow_redirects=True, timeout=10.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                # Remove scripts, styles, nav, header, footer
                for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
                    tag.decompose()
                paragraphs = [p.get_text().strip() for p in soup.find_all("p") if len(p.get_text().strip()) > 30]
                if paragraphs:
                    return "\n\n".join(paragraphs)
    except Exception as e:
        print(f"[Reader] Fallback BeautifulSoup falhou para {url}: {e}")

    return ""

def get_article_reading_view(article_id: str) -> Optional[Dict[str, Any]]:
    article = get_article_by_id(article_id)
    if not article:
        return None

    full_text = article.get("full_text")
    executive_summary_json = article.get("executive_summary")

    lang = article.get("language", "pt")
    is_foreign = (lang != "pt")

    # If already cached in DB
    if full_text and executive_summary_json:
        try:
            summary_points = json.loads(executive_summary_json)
        except Exception:
            summary_points = [executive_summary_json]
            
        full_text_orig = article.get("full_text_original") or full_text
        paragraphs_orig = [p.strip() for p in full_text_orig.split("\n") if p.strip()]
        paragraphs_pt = [p.strip() for p in full_text.split("\n") if p.strip()]
        
        return {
            "id": article["id"],
            "title": article["title"],
            "title_original": article.get("title_original") or article["title"],
            "source_name": article["source_name"],
            "source_id": article["source_id"],
            "spectrum": article["spectrum"],
            "published_at": article["published_at"],
            "link": article["link"],
            "is_translated": is_foreign,
            "original_language": lang,
            "full_text": full_text,
            "full_text_original": full_text_orig,
            "paragraphs": paragraphs_pt,
            "paragraphs_original": paragraphs_orig,
            "executive_summary": summary_points,
            "reading_time_minutes": calculate_reading_time(full_text),
            "loaded_words": article.get("loaded_words", [])
        }

    # Extract full text from web
    raw_text = fetch_and_extract_article_content(article["link"])
    if not raw_text:
        raw_text = article.get("summary_original") or article.get("summary") or "O conteúdo completo não pôde ser extraído diretamente da fonte. Acesse o link oficial para conferir a íntegra."

    full_text_orig = raw_text
    paragraphs_orig = [p.strip() for p in full_text_orig.split("\n") if p.strip()]

    # If foreign language, translate to Brazilian Portuguese
    if is_foreign:
        paragraphs_pt = [translate_to_pt(p, lang) for p in paragraphs_orig]
        full_text_pt = "\n\n".join(paragraphs_pt)
    else:
        paragraphs_pt = paragraphs_orig
        full_text_pt = full_text_orig

    # Generate Executive Summary in Portuguese
    summary_points = generate_ai_summary(article["title"], full_text_pt)
    if not summary_points:
        summary_points = generate_extractive_summary(article["title"], full_text_pt)

    # Save to SQLite cache
    update_article_reading_content(
        article_id=article["id"],
        full_text=full_text_pt,
        executive_summary=json.dumps(summary_points, ensure_ascii=False),
        full_text_original=full_text_orig,
        executive_summary_original=json.dumps(generate_extractive_summary(article.get("title_original", article["title"]), full_text_orig), ensure_ascii=False)
    )

    return {
        "id": article["id"],
        "title": article["title"],
        "title_original": article.get("title_original") or article["title"],
        "source_name": article["source_name"],
        "source_id": article["source_id"],
        "spectrum": article["spectrum"],
        "published_at": article["published_at"],
        "link": article["link"],
        "is_translated": is_foreign,
        "original_language": lang,
        "full_text": full_text_pt,
        "full_text_original": full_text_orig,
        "paragraphs": paragraphs_pt,
        "paragraphs_original": paragraphs_orig,
        "executive_summary": summary_points,
        "reading_time_minutes": calculate_reading_time(full_text_pt),
        "loaded_words": article.get("loaded_words", [])
    }

import urllib.parse
import urllib.request
import json
import html
import re
from typing import Dict, List, Optional, Any

# In-memory translation cache to avoid duplicate HTTP calls
_TRANSLATION_CACHE: Dict[str, str] = {}


def clean_text_for_translation(text: str) -> str:
    if not text:
        return ""
    clean = re.sub(r"<[^>]+>", " ", text)
    clean = html.unescape(clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def translate_to_pt(text: str, source_lang: Optional[str] = None) -> str:
    """Translates text from source_lang to Brazilian Portuguese with in-memory caching."""
    if not text or not text.strip():
        return ""

    # If already Portuguese or not specified as foreign, return as is
    if source_lang == "pt":
        return text

    clean_text = clean_text_for_translation(text)
    if not clean_text:
        return ""

    cache_key = clean_text
    if cache_key in _TRANSLATION_CACHE:
        return _TRANSLATION_CACHE[cache_key]

    try:
        encoded = urllib.parse.quote(cache_key)
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q={encoded}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
            },
        )
        with urllib.request.urlopen(req, timeout=6.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            translated = "".join([part[0] for part in data[0] if part and part[0]])
            if translated:
                _TRANSLATION_CACHE[cache_key] = translated
                return translated
            return clean_text
    except Exception:
        # Fallback to original text if offline or timeout
        return clean_text


def translate_paragraphs(paragraphs: List[str], source_lang: Optional[str] = None) -> List[str]:
    """Translates a list of paragraphs to Portuguese."""
    if source_lang == "pt" or not paragraphs:
        return paragraphs

    translated_list = []
    for p in paragraphs:
        if len(p.strip()) > 0:
            translated_list.append(translate_to_pt(p, source_lang))
    return translated_list

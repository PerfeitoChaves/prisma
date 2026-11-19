import urllib.parse
import urllib.request
import json
import html
import re
from collections import OrderedDict
from typing import Dict, List, Optional
import httpx

# Bounded in-memory translation cache to avoid duplicate HTTP calls
_MAX_CACHE_SIZE = 5000
_TRANSLATION_CACHE: "OrderedDict[str, str]" = OrderedDict()

_DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
}


def _cache_get(key: str) -> Optional[str]:
    if key in _TRANSLATION_CACHE:
        _TRANSLATION_CACHE.move_to_end(key)
        return _TRANSLATION_CACHE[key]
    return None


def _cache_set(key: str, value: str) -> None:
    _TRANSLATION_CACHE[key] = value
    _TRANSLATION_CACHE.move_to_end(key)
    while len(_TRANSLATION_CACHE) > _MAX_CACHE_SIZE:
        _TRANSLATION_CACHE.popitem(last=False)


def clean_text_for_translation(text: str) -> str:
    if not text:
        return ""
    clean = re.sub(r"<[^>]+>", " ", text)
    clean = html.unescape(clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def _build_translate_url(clean_text: str) -> str:
    encoded = urllib.parse.quote(clean_text)
    return f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q={encoded}"


def _extract_translated_text(data: object) -> str:
    if not isinstance(data, list) or not data or not isinstance(data[0], list):
        return ""
    return "".join(part[0] for part in data[0] if isinstance(part, list) and part and part[0])


def translate_to_pt(text: str, source_lang: Optional[str] = None) -> str:
    """Translates text from source_lang to Brazilian Portuguese with bounded in-memory caching."""
    if not text or not text.strip():
        return ""

    if source_lang == "pt":
        return text

    clean_text = clean_text_for_translation(text)
    if not clean_text:
        return ""

    cached = _cache_get(clean_text)
    if cached is not None:
        return cached

    try:
        req = urllib.request.Request(_build_translate_url(clean_text), headers=_DEFAULT_HEADERS)
        with urllib.request.urlopen(req, timeout=6.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            translated = _extract_translated_text(data)
            if translated:
                _cache_set(clean_text, translated)
                return translated
            return clean_text
    except Exception:
        return clean_text


async def translate_to_pt_async(
    client: httpx.AsyncClient, text: str, source_lang: Optional[str] = None
) -> str:
    """Async translation reusing an open httpx.AsyncClient without spawning threads."""
    if not text or not text.strip():
        return ""

    if source_lang == "pt":
        return text

    clean_text = clean_text_for_translation(text)
    if not clean_text:
        return ""

    cached = _cache_get(clean_text)
    if cached is not None:
        return cached

    try:
        resp = await client.get(_build_translate_url(clean_text), headers=_DEFAULT_HEADERS, timeout=6.0)
        if resp.status_code == 200:
            translated = _extract_translated_text(resp.json())
            if translated:
                _cache_set(clean_text, translated)
                return translated
        return clean_text
    except Exception:
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

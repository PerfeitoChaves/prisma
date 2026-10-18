import urllib.parse
import urllib.request
import json
from typing import Dict, List, Optional

# In-memory translation cache to avoid duplicate HTTP calls
_TRANSLATION_CACHE: Dict[str, str] = {}

def translate_to_pt(text: str, source_lang: Optional[str] = None) -> str:
    if not text or not text.strip():
        return ""
    
    # If already Portuguese, return as is
    if source_lang == "pt":
        return text

    # Check cache
    cache_key = text.strip()
    if cache_key in _TRANSLATION_CACHE:
        return _TRANSLATION_CACHE[cache_key]

    try:
        encoded = urllib.parse.quote(cache_key)
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q={encoded}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        )
        with urllib.request.urlopen(req, timeout=4.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            translated = "".join([part[0] for part in data[0] if part[0]])
            _TRANSLATION_CACHE[cache_key] = translated
            return translated
    except Exception as e:
        # Fallback to original text if offline or timeout
        return text

def translate_paragraphs(paragraphs: List[str], source_lang: Optional[str] = None) -> List[str]:
    if source_lang == "pt" or not paragraphs:
        return paragraphs

    translated_list = []
    for p in paragraphs:
        if len(p.strip()) > 0:
            translated_list.append(translate_to_pt(p, source_lang))
    return translated_list

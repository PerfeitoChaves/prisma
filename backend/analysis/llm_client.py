import json
import logging
import time
from typing import List, Optional, Dict, Any
import httpx

from backend.config import GEMINI_API_KEY, GROQ_API_KEY, OLLAMA_BASE_URL, OLLAMA_MODEL, USE_OLLAMA

logger = logging.getLogger(__name__)

_GEMINI_FREE_MODELS = ("gemini-2.5-flash", "gemini-2.0-flash")
_OLLAMA_CACHE: Dict[str, Any] = {"checked_at": 0.0, "available": False}


def check_ollama_available() -> bool:
    if USE_OLLAMA.lower() == "false":
        return False
    now = time.monotonic()
    if now - _OLLAMA_CACHE["checked_at"] < 60.0:
        return bool(_OLLAMA_CACHE["available"])
    available = False
    try:
        resp = httpx.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=0.8)
        available = resp.status_code == 200
    except Exception:
        available = False
    _OLLAMA_CACHE["checked_at"] = now
    _OLLAMA_CACHE["available"] = available
    return available


def is_free_ai_configured() -> bool:
    """Returns True if any free AI provider (Gemini free, Groq free, or Ollama) is available."""
    return bool(GEMINI_API_KEY or GROQ_API_KEY or check_ollama_available())


def _parse_json_response(raw_text: str) -> Optional[Dict[str, Any]]:
    if not raw_text:
        return None
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()
    parsed = json.loads(cleaned)
    return parsed if isinstance(parsed, dict) else None


def call_free_llm_json(
    prompt_text: str,
    system_prompt: str = "Responda apenas em JSON válido.",
    timeout: float = 10.0,
) -> Optional[Dict[str, Any]]:
    """
    Calls free-tier LLM providers in order and returns parsed JSON dict:
    1. Google Gemini Free Tier (gemini-2.5-flash, fallback gemini-2.0-flash)
    2. Groq Free Tier (llama-3.3-70b-versatile)
    3. Local Ollama (when reachable)
    """
    # 1. Google Gemini Free Tier
    if GEMINI_API_KEY:
        full_prompt = f"{system_prompt}\n\n{prompt_text}" if system_prompt else prompt_text
        for model in _GEMINI_FREE_MODELS:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": full_prompt}]}],
                    "generationConfig": {
                        "temperature": 0.2,
                        "responseMimeType": "application/json",
                    },
                }
                with httpx.Client(timeout=timeout) as client:
                    res = client.post(url, json=payload)
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            raw_json = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            parsed = _parse_json_response(raw_json)
                            if parsed is not None:
                                return parsed
                    elif res.status_code in (404, 400):
                        continue
                    else:
                        logger.warning(f"[LLM] Gemini ({model}) retornou status {res.status_code}")
                        break
            except Exception as e:
                logger.warning(f"[LLM] Erro na API Gemini ({model}): {e}")

    # 2. Groq Free Tier
    if GROQ_API_KEY:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt_text},
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2,
            }
            with httpx.Client(timeout=timeout) as client:
                res = client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = _parse_json_response(content)
                    if parsed is not None:
                        return parsed
                else:
                    logger.warning(f"[LLM] Groq retornou status {res.status_code}")
        except Exception as e:
            logger.warning(f"[LLM] Erro na API Groq: {e}")

    # 3. Local Ollama
    if check_ollama_available():
        try:
            url = f"{OLLAMA_BASE_URL}/api/generate"
            payload = {
                "model": OLLAMA_MODEL,
                "system": system_prompt,
                "prompt": prompt_text,
                "format": "json",
                "stream": False,
            }
            with httpx.Client(timeout=max(timeout, 15.0)) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    parsed = _parse_json_response(data.get("response", ""))
                    if parsed is not None:
                        return parsed
        except Exception as e:
            logger.warning(f"[LLM] Erro ao chamar Ollama: {e}")

    return None


def generate_ai_summary(title: str, text: str) -> Optional[List[str]]:
    """
    Attempts to generate structured executive bullet points using free-tier LLMs
    (Gemini Free, Groq Free, or local Ollama).
    Returns None if none are configured or available (falls back to local extractive NLP).
    """
    prompt_text = (
        "Você é um editor sênior de jornalismo estritamente factual e neutro.\n"
        "Com base no texto da reportagem abaixo, extraia exatamente 4 tópicos objetivos no formato JSON:\n"
        "{\n"
        '  "summary_points": [\n'
        '    "🎯 Fato Central: O que aconteceu/decisão tomada de forma direta",\n'
        '    "📊 Dados & Placar: Números, placares, valores monetários ou prazos citados",\n'
        '    "💬 Posicionamento: O que foi declarado oficialmente pelas partes envolvidas",\n'
        '    "🔮 Desdobramentos: Próximos passos e consequências práticas"\n'
        "  ]\n"
        "}\n\n"
        f"Título: {title}\n"
        f"Texto da reportagem:\n{text[:3500]}"
    )

    parsed = call_free_llm_json(prompt_text, timeout=8.0)
    if parsed:
        points = parsed.get("summary_points", [])
        if points and isinstance(points, list):
            return points

    return None

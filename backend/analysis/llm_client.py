import json
import logging
from typing import List, Optional, Dict, Any
import httpx

from backend.config import GEMINI_API_KEY, GROQ_API_KEY, OLLAMA_BASE_URL, OLLAMA_MODEL, USE_OLLAMA

logger = logging.getLogger(__name__)

def is_free_ai_configured() -> bool:
    """Returns True if any AI provider (Gemini free, Groq free, or Ollama) is configured."""
    return bool(GEMINI_API_KEY or GROQ_API_KEY)

def generate_ai_summary(title: str, text: str) -> Optional[List[str]]:
    """
    Attempts to generate structured executive bullet points using:
    1. Google Gemini Flash (100% free tier at aistudio.google.com)
    2. Groq Free Tier (Llama 3.3 70B at console.groq.com)
    3. Ollama local
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

    # 1. Google Gemini Free Tier
    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt_text}]}],
                "generationConfig": {
                    "temperature": 0.2,
                    "responseMimeType": "application/json"
                }
            }
            with httpx.Client(timeout=8.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        raw_json = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        parsed = json.loads(raw_json)
                        points = parsed.get("summary_points", [])
                        if points and isinstance(points, list):
                            return points
        except Exception as e:
            logger.warning(f"[LLM] Erro na API Gemini: {e}")

    # 2. Groq Free Tier
    if GROQ_API_KEY:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": "Responda apenas em JSON válido."},
                    {"role": "user", "content": prompt_text}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2
            }
            with httpx.Client(timeout=8.0) as client:
                res = client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content)
                    points = parsed.get("summary_points", [])
                    if points and isinstance(points, list):
                        return points
        except Exception as e:
            logger.warning(f"[LLM] Erro na API Groq: {e}")

    # 3. Local Ollama
    if USE_OLLAMA != "false":
        try:
            url = f"{OLLAMA_BASE_URL}/api/generate"
            payload = {
                "model": OLLAMA_MODEL,
                "prompt": prompt_text,
                "format": "json",
                "stream": False
            }
            with httpx.Client(timeout=5.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    parsed = json.loads(data.get("response", "{}"))
                    points = parsed.get("summary_points", [])
                    if points and isinstance(points, list):
                        return points
        except Exception:
            pass

    return None

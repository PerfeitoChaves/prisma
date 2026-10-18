import re
import json
from typing import List, Dict, Any, Optional
import httpx

from backend.config import OLLAMA_BASE_URL, OLLAMA_MODEL, USE_OLLAMA

def check_ollama_available() -> bool:
    if USE_OLLAMA.lower() == "false":
        return False
    try:
        resp = httpx.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=1.0)
        return resp.status_code == 200
    except Exception:
        return False

def call_ollama_synthesis(title: str, articles: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    sources_text = ""
    for idx, a in enumerate(articles, 1):
        sources_text += f"Fonte {idx}: {a['source_name']} (Espectro: {a.get('spectrum', 'centro')})\n"
        sources_text += f"Manchete: {a['title']}\n"
        if a.get('summary'):
            sources_text += f"Resumo: {a['summary']}\n"
        sources_text += "\n"

    system_prompt = (
        "Você é um analista de notícias estritamente factual e neutro no padrão Reuters. "
        "Seu objetivo é analisar as diferentes coberturas de um mesmo acontecimento, remover adjetivos tendenciosos "
        "e expor o consenso factual de forma equilibrada.\n"
        "Retorne APENAS um JSON válido no seguinte formato:\n"
        "{\n"
        '  "neutral_summary": "Resumo em 2 a 3 frases estritamente factuais e sem qualquer adjetivo carregado",\n'
        '  "consensus_facts": ["Fato confirmado 1", "Fato confirmado 2"],\n'
        '  "divergent_points": ["Ponto divergente ou alegação unilateral se houver"]\n'
        "}"
    )

    user_prompt = f"Pauta: {title}\n\nFontes e Cobertura:\n{sources_text}"

    try:
        resp = httpx.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "system": system_prompt,
                "prompt": user_prompt,
                "format": "json",
                "stream": False
            },
            timeout=25.0
        )
        if resp.status_code == 200:
            data = resp.json()
            raw_response = data.get("response", "")
            parsed = json.loads(raw_response)
            return {
                "neutral_summary": parsed.get("neutral_summary", ""),
                "consensus_facts": parsed.get("consensus_facts", []),
                "divergent_points": parsed.get("divergent_points", []),
                "is_ai_generated": True
            }
    except Exception as e:
        print(f"[Synthesizer] Erro ao chamar Ollama: {e}")
        
    return None

def strip_sensationalism(text: str, loaded_words: List[str]) -> str:
    cleaned = text
    for w in loaded_words:
        cleaned = re.sub(rf'\b{re.escape(w)}\b', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def generate_story_synthesis(title: str, articles: List[Dict[str, Any]]) -> Dict[str, Any]:
    # 1. Build framing contrast for each source
    framing_contrast = []
    all_loaded_words = []
    
    for a in articles:
        loaded = a.get("loaded_words", [])
        all_loaded_words.extend(loaded)
        
        # Describe framing angle
        subj = a.get("subjectivity_score", 0.0)
        spec = a.get("spectrum", "center")
        
        if len(loaded) > 0:
            angle_desc = f"Uso de termos de impacto emocional ({', '.join(loaded[:3])})"
        elif subj > 0.3:
            angle_desc = "Enquadramento opinativo / adjetivado"
        elif spec == "center":
            angle_desc = "Tom descritivo / institucional"
        else:
            angle_desc = "Enquadramento padrão com ênfase factual"
            
        framing_contrast.append({
            "source_name": a["source_name"],
            "spectrum": spec,
            "headline": a["title"],
            "link": a["link"],
            "published_at": a.get("published_at", ""),
            "loaded_words": loaded,
            "subjectivity_score": subj,
            "angle_description": angle_desc,
            "summary": a.get("summary", "")
        })

    # 2. Try Ollama if enabled
    if check_ollama_available():
        ai_res = call_ollama_synthesis(title, articles)
        if ai_res and ai_res.get("neutral_summary"):
            ai_res["framing_contrast"] = framing_contrast
            return ai_res

    # 3. Deterministic Consensus and Neutral Synthesis (Native Fallback)
    consensus_facts = []
    divergent_points = []
    
    # Core fact from the neutral headline
    clean_title = strip_sensationalism(title, all_loaded_words)
    consensus_facts.append(f"Acontecimento central: {clean_title}")
    
    # Collect information snippets across sources
    summaries = [a.get("summary", "") for a in articles if a.get("summary") and len(a.get("summary", "")) > 20]
    
    if len(articles) > 1:
        consensus_facts.append(
            f"Fato reportado e verificado por {len(articles)} veículos de comunicação com múltiplos ângulos de cobertura."
        )
        
        # Compare headlines for divergent framing
        headlines = [a["title"] for a in articles]
        sensational_arts = [a for a in articles if a.get("loaded_words")]
        neutral_arts = [a for a in articles if not a.get("loaded_words")]
        
        if sensational_arts and neutral_arts:
            divergent_points.append(
                f"Divergência de tom: Enquanto {neutral_arts[0]['source_name']} optou por relato factual, {sensational_arts[0]['source_name']} utilizou linguagem valorativa ({', '.join(sensational_arts[0]['loaded_words'])})."
            )
            
        # Left vs Right contrast if present
        left_arts = [a for a in articles if "left" in a.get("spectrum", "")]
        right_arts = [a for a in articles if "right" in a.get("spectrum", "")]
        
        if left_arts and right_arts:
            divergent_points.append(
                f"Contraste de perspectiva: Foco editorial variado entre veículos conservadores ({right_arts[0]['source_name']}) e progressistas ({left_arts[0]['source_name']})."
            )
    else:
        consensus_facts.append("Pauta registrada inicialmente por fonte única. Aguardando repercussão de outros veículos.")

    # Neutral summary construction
    best_summary = ""
    # Find cleanest snippet
    for s in summaries:
        if len(s) > 30 and not any(lw in s.lower() for lw in all_loaded_words):
            best_summary = s
            break
    if not best_summary and summaries:
        best_summary = strip_sensationalism(summaries[0], all_loaded_words)
        
    neutral_summary = best_summary if best_summary else f"Relato factual sobre: {clean_title}."

    return {
        "neutral_summary": neutral_summary,
        "consensus_facts": consensus_facts,
        "divergent_points": divergent_points,
        "framing_contrast": framing_contrast,
        "is_ai_generated": False
    }

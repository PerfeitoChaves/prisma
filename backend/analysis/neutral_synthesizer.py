import re
from typing import List, Dict, Any, Optional

from backend.analysis.llm_client import (
    call_free_llm_json,
    check_ollama_available,
    is_free_ai_configured,
)
from backend.analysis.story_compiler import clean_html, extract_numbers_and_data

# Limite seguro por ciclo de clustering para permanecer dentro da cota gratuita (Gemini 15 RPM / Groq 30 RPM)
_SYNTHESIS_BUDGET = {"remaining": 12}


def reset_synthesis_budget(max_calls: int = 12) -> None:
    """Reinicia o orçamento de chamadas gratuitas de IA para um ciclo de clustering."""
    _SYNTHESIS_BUDGET["remaining"] = max(0, max_calls)


def call_ai_synthesis(title: str, articles: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Sintetiza cobertura multi-fonte usando o cliente gratuito de LLM (Gemini / Groq / Ollama)."""
    sources_text = ""
    for idx, a in enumerate(articles[:10], 1):
        sources_text += f"Fonte {idx}: {a['source_name']} (Espectro: {a.get('spectrum', 'centro')})\n"
        sources_text += f"Manchete: {a['title']}\n"
        if a.get("summary"):
            sources_text += f"Resumo: {a['summary'][:400]}\n"
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

    parsed = call_free_llm_json(user_prompt, system_prompt=system_prompt, timeout=12.0)
    if parsed and parsed.get("neutral_summary"):
        consensus = parsed.get("consensus_facts", [])
        divergent = parsed.get("divergent_points", [])
        return {
            "neutral_summary": str(parsed.get("neutral_summary", "")).strip(),
            "consensus_facts": [str(x) for x in consensus] if isinstance(consensus, list) else [],
            "divergent_points": [str(x) for x in divergent] if isinstance(divergent, list) else [],
            "is_ai_generated": True,
        }
    return None


def strip_sensationalism(text: str, loaded_words: List[str]) -> str:
    cleaned = text
    for w in loaded_words:
        cleaned = re.sub(rf"\b{re.escape(w)}\b", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def _extract_consensus_numeric_facts(articles: List[Dict[str, Any]], all_loaded_words: List[str]) -> List[str]:
    """Extrai frases com dados concretos (percentuais, valores, placares) sem termos sensacionalistas."""
    facts: List[str] = []
    seen_num_keys = set()
    for a in articles:
        snippet = f"{a.get('title', '')}. {a.get('summary', '')}"
        for sent in extract_numbers_and_data(snippet):
            cleaned = strip_sensationalism(clean_html(sent), all_loaded_words)
            if len(cleaned) < 25:
                continue
            nums = re.findall(r"\d+", cleaned)
            key = "-".join(nums) if nums else cleaned[:30].lower()
            if key not in seen_num_keys:
                seen_num_keys.add(key)
                facts.append(cleaned)
                if len(facts) >= 2:
                    return facts
    return facts


def generate_story_synthesis(title: str, articles: List[Dict[str, Any]], allow_ai: bool = True) -> Dict[str, Any]:
    # 1. Build framing contrast for each source
    framing_contrast = []
    all_loaded_words: List[str] = []

    for a in articles:
        loaded = a.get("loaded_words", [])
        all_loaded_words.extend(loaded)

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
            "summary": a.get("summary", ""),
        })

    # 2. Try free-tier AI synthesis for multi-source clusters within cycle budget
    distinct_sources = {a.get("source_id") or a.get("source_name") for a in articles}
    if allow_ai and len(distinct_sources) >= 3 and _SYNTHESIS_BUDGET["remaining"] > 0 and is_free_ai_configured():
        _SYNTHESIS_BUDGET["remaining"] -= 1
        ai_res = call_ai_synthesis(title, articles)
        if ai_res and ai_res.get("neutral_summary"):
            ai_res["framing_contrast"] = framing_contrast
            return ai_res

    # 3. Deterministic Consensus and Neutral Synthesis (100% Free Native Fallback)
    consensus_facts: List[str] = []
    divergent_points: List[str] = []

    clean_title = strip_sensationalism(title, all_loaded_words)
    consensus_facts.append(f"Acontecimento central: {clean_title}")

    summaries = [a.get("summary", "") for a in articles if a.get("summary") and len(a.get("summary", "")) > 20]

    if len(articles) > 1:
        consensus_facts.append(
            f"Fato reportado e verificado por {len(distinct_sources)} veículos de comunicação com múltiplos ângulos de cobertura."
        )
        consensus_facts.extend(_extract_consensus_numeric_facts(articles, all_loaded_words))

        sensational_arts = [a for a in articles if a.get("loaded_words")]
        neutral_arts = [a for a in articles if not a.get("loaded_words")]

        if sensational_arts and neutral_arts:
            divergent_points.append(
                f"Divergência de tom: Enquanto {neutral_arts[0]['source_name']} optou por relato factual, "
                f"{sensational_arts[0]['source_name']} utilizou linguagem valorativa ({', '.join(sensational_arts[0]['loaded_words'])})."
            )

        left_arts = [a for a in articles if "left" in a.get("spectrum", "")]
        right_arts = [a for a in articles if "right" in a.get("spectrum", "")]
        center_arts = [a for a in articles if a.get("spectrum", "") == "center"]

        if left_arts and right_arts:
            divergent_points.append(
                f"Contraste de perspectiva: {left_arts[0]['source_name']} destacou “{left_arts[0]['title']}”, "
                f"enquanto {right_arts[0]['source_name']} enfatizou “{right_arts[0]['title']}”."
            )
        elif center_arts and (left_arts or right_arts):
            side_art = left_arts[0] if left_arts else right_arts[0]
            if side_art["source_name"] != center_arts[0]["source_name"]:
                divergent_points.append(
                    f"Diferença de ênfase: {center_arts[0]['source_name']} trouxe “{center_arts[0]['title']}”, "
                    f"já {side_art['source_name']} destacou “{side_art['title']}”."
                )
        elif len(distinct_sources) >= 2:
            unique_headlines = []
            seen_srcs = set()
            for a in articles:
                sname = a["source_name"]
                if sname not in seen_srcs:
                    seen_srcs.add(sname)
                    unique_headlines.append(a)
                if len(unique_headlines) >= 2:
                    break
            if len(unique_headlines) == 2 and unique_headlines[0]["title"] != unique_headlines[1]["title"]:
                divergent_points.append(
                    f"Recortes editoriais: {unique_headlines[0]['source_name']} priorizou “{unique_headlines[0]['title']}”, "
                    f"enquanto {unique_headlines[1]['source_name']} titulou “{unique_headlines[1]['title']}”."
                )
    else:
        consensus_facts.append("Pauta registrada inicialmente por fonte única. Aguardando repercussão de outros veículos.")

    # Neutral summary construction
    best_summary = ""
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
        "is_ai_generated": False,
    }

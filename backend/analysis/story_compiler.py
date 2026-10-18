import re
import json
from typing import Dict, Any, List, Optional
import httpx

from backend.config import GEMINI_API_KEY, GROQ_API_KEY, OLLAMA_BASE_URL, OLLAMA_MODEL, USE_OLLAMA


def clean_html(text: str) -> str:
    if not text:
        return ""
    cleaned = re.sub(r'<[^>]*>?', '', text)
    cleaned = re.sub(r'[\r\n\t]+', ' ', cleaned)
    # Remove common RSS noise like "leia mais", "leia também", "veja mais"
    cleaned = re.sub(r'([-\.]?\s*(leia mais|leia também|veja mais|saiba mais):.*)', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s{2,}', ' ', cleaned).strip()
    return cleaned

def extract_numbers_and_data(text: str) -> List[str]:
    """Finds sentences containing numbers, percentages, voting counts, dates, or currency."""
    cleaned_full = clean_html(text)
    sentences = re.split(r'(?<=[.!?])\s+', cleaned_full)
    data_sentences = []
    
    number_pattern = re.compile(
        r'(\d+[\.,]?\d*|\bR\$|\bUS\$|\bvotos?\b|\baprovad[oa]\b|\bcontra\b|\bpor cento\b|%|\bano[s]?\b|\bdia[s]?\b|\bmeses\b|\bbilh[õo]es?\b|\bmilh[õo]es?\b)',
        re.IGNORECASE
    )
    
    for s in sentences:
        s_clean = s.strip()
        if 20 <= len(s_clean) <= 220 and number_pattern.search(s_clean):
            if not any(s_clean in existing for existing in data_sentences):
                data_sentences.append(s_clean)
                
    return data_sentences[:3]


def generate_ai_compiled_summary(story_title: str, articles: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Uses Google Gemini Free Tier, Groq Free Tier, or Ollama to generate a compiled multi-source synthesis."""
    if not (GEMINI_API_KEY or GROQ_API_KEY or (USE_OLLAMA != "false")):
        return None

    sources_summary = []
    for a in articles:
        name = a.get("source_name", "Desconhecido")
        spec = a.get("spectrum", "centro")
        title = a.get("title", "")
        summary = a.get("summary") or (a.get("full_text") or "")[:400]
        sources_summary.append(f"Veículo: {name} (Linha Editorial: {spec})\nManchete: {title}\nConteúdo reportado: {summary}\n")


    articles_text = "\n---\n".join(sources_summary)

    prompt = (
        "Você é um editor sênior de jornalismo comparado e factual.\n"
        f"Abaixo estão os relatos de {len(articles)} veículos de comunicação cobrindo a mesma pauta.\n"
        "Sua tarefa é compilar essas reportagens em uma SÍNTESE MULTI-FONTE neutra, objetiva e completa.\n\n"
        f"Pauta: {story_title}\n\n"
        f"Reportagens das fontes:\n{articles_text}\n\n"
        "Retorne APENAS um JSON no seguinte formato estrito:\n"
        "{\n"
        '  "core_fact": "O fato comum confirmado por todos os veículos em 1 a 2 frases diretas",\n'
        '  "consensus_points": ["Fato confirmado 1", "Fato confirmado 2"],\n'
        '  "compiled_data_points": ["Dados numéricos, placares, prazos e quantias citadas"],\n'
        '  "source_perspectives": [\n'
        '    {"source_name": "Nome", "spectrum": "centro/left/right", "key_angle": "O que este veículo em específico destacou"}\n'
        '  ],\n'
        '  "divergent_points": ["Divergências de versão ou conflito de alegações, se houver"],\n'
        '  "next_steps": ["Próximos passos e desdobramentos esperados"]\n'
        "}"
    )

    # 1. Gemini Free Tier
    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text_resp = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        return json.loads(text_resp)
        except Exception as e:
            print(f"[Compiler] Gemini compilation error: {e}")

    # 2. Groq Free Tier
    if GROQ_API_KEY:
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": "Responda apenas em JSON válido."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.2
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    return json.loads(content)
        except Exception as e:
            print(f"[Compiler] Groq compilation error: {e}")

    return None

def compile_story_summary(story: Dict[str, Any], articles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compiles news from ALL articles in a story cluster into a unified, cross-checked summary.
    Prioritizes AI synthesis if free API key is configured, else falls back to robust local deterministic compiler.
    """
    if not articles:
        return {
            "core_fact": story.get("title", "Acontecimentos em apuração"),
            "consensus_points": ["Informações preliminares em processamento."],
            "compiled_data_points": [],
            "source_perspectives": [],
            "divergent_points": [],
            "next_steps": []
        }

    # 1. Try AI-generated compiled summary if free tier configured
    ai_compiled = generate_ai_compiled_summary(story.get("title", ""), articles)
    if ai_compiled and ai_compiled.get("core_fact"):
        ai_compiled["is_ai_generated"] = True
        return ai_compiled

    # 2. Local Deterministic Cross-Source Compiler (100% Free, Local & Instant)
    source_count = len(articles)
    
    # 2.1 Core fact: Build from representative neutral title and clean leads
    core_fact = story.get("title", articles[0]["title"])
    
    consensus_points = []
    if source_count >= 2:
        consensus_points.append(
            f"Fato reportado em concordância por {source_count} veículos jornalísticos em diferentes linhas editoriais."
        )
    else:
        consensus_points.append("Pauta registrada inicialmente por fonte única. Demais veículos ainda não repercutiram o acontecimento.")

    # 2.2 Collect and deduplicate numerical data across all articles
    all_data_points = []
    seen_data = set()
    for a in articles:
        text_source = f"{a.get('title', '')}. {a.get('summary', '')}"
        data_sents = extract_numbers_and_data(text_source)
        for ds in data_sents:
            cleaned_ds = clean_html(ds)
            # Simple deduplication by key numbers found
            nums = re.findall(r'\d+', cleaned_ds)
            num_key = "-".join(nums) if nums else cleaned_ds[:25]
            if num_key not in seen_data:
                seen_data.add(num_key)
                all_data_points.append(f"{a['source_name']}: “{cleaned_ds}”")
                if len(all_data_points) >= 4:
                    break
        if len(all_data_points) >= 4:
            break

    # 2.3 Individual Source Perspectives (What each newspaper highlighted)
    source_perspectives = []
    for a in articles:
        loaded = a.get("loaded_words", [])
        if isinstance(loaded, str):
            try:
                loaded = json.loads(loaded)
            except Exception:
                loaded = []

        summary_text = clean_html(a.get("summary", ""))
        first_sent = summary_text.split(".")[0].strip() if summary_text else ""
        if not first_sent or len(first_sent) < 15:
            first_sent = a.get("title", "")

        key_angle = first_sent
        if loaded:
            key_angle += f" (ênfase com termos: {', '.join(loaded[:2])})"

        source_perspectives.append({
            "article_id": a["id"],
            "source_name": a["source_name"],
            "spectrum": a.get("spectrum", "center"),
            "headline": a["title"],
            "headline_original": a.get("title_original"),
            "is_foreign": a.get("language") != "pt",
            "key_angle": key_angle,
            "loaded_words": loaded
        })

    # 2.4 Divergent points and next steps
    divergent_points = []
    left_sources = [a["source_name"] for a in articles if "left" in (a.get("spectrum") or "")]
    right_sources = [a["source_name"] for a in articles if "right" in (a.get("spectrum") or "")]
    
    if left_sources and right_sources:
        divergent_points.append(
            f"Variação de enquadramento: Fontes progressistas ({', '.join(left_sources[:2])}) e conservadoras ({', '.join(right_sources[:2])}) enfatizam ângulos distintos desta matéria."
        )

    # Detect sensational words divergence
    loaded_sources = [a["source_name"] for a in articles if a.get("loaded_words")]
    if loaded_sources and len(loaded_sources) < len(articles):
        neutral_sources = [a["source_name"] for a in articles if not a.get("loaded_words")]
        divergent_points.append(
            f"Contraste de tom: Enquanto {', '.join(neutral_sources[:2])} adotaram relato estritamente descritivo, {', '.join(loaded_sources[:2])} recorreram a termos de maior impacto emocional."
        )

    # Next steps / consequences from closing sentences
    next_steps = []
    next_step_pattern = re.compile(r'(próxim|seguinte|aguard|deverá|previst|encaminh|recurso|sessão|votação|alta)', re.IGNORECASE)
    for a in articles:
        summary_text = clean_html(a.get("summary", ""))
        for sent in summary_text.split("."):
            sent_clean = sent.strip()
            if 25 <= len(sent_clean) <= 180 and next_step_pattern.search(sent_clean):
                if not any(sent_clean in ns for ns in next_steps):
                    next_steps.append(sent_clean)
                    break
        if len(next_steps) >= 2:
            break

    if not next_steps:
        next_steps.append("Os desdobramentos dependem de novas manifestações oficiais e atualizações das equipes de apuração.")

    return {
        "core_fact": core_fact,
        "consensus_points": consensus_points,
        "compiled_data_points": all_data_points,
        "source_perspectives": source_perspectives,
        "divergent_points": divergent_points,
        "next_steps": next_steps,
        "is_ai_generated": False
    }

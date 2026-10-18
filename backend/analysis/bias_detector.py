import re
from typing import List, Dict, Any, Tuple, Optional

# Lexicon of loaded, sensational or value-judgment words in Portuguese and English
LOADED_WORDS_PT = {
    # Extreme drama / Sensationalism
    "escândalo", "escândalos", "humilhação", "humilha", "humilhado", "desastre", "desastroso",
    "fiasco", "fiascos", "vexame", "vexatório", "catástrofe", "catastrófico", "pesadelo",
    "bomba", "bombástico", "detona", "detonou", "arrasa", "arrasou", "destrói", "destruiu",
    "massacra", "massacrou", "massacre", "surra", "derrete", "derreteu", "sucumbe", "sucumbiu",
    "atropela", "atropelou", "fúria", "furioso", "revolta", "revoltante", "chocante",
    # Polarizing political / Moralistic labels
    "golpe", "golpista", "traição", "traidor", "farsa", "farsante", "covarde", "covardia",
    "criminoso", "crime", "genocida", "ditador", "ditadura", "fascista", "comunista",
    "extremista", "radical", "fanático", "aberração", "vergonha", "vergonhoso", "inaceitável",
    "repugnante", "descarado", "arrogante", "arrogância", "autoritário", "tirania",
    # Euphoric / Propaganda words
    "heroico", "herói", "salvação", "salvador", "milagre", "triunfo", "triunfal",
    "estrondoso", "impecável", "genial", "esmagador", "esmagadora", "glorioso"
}

LOADED_WORDS_EN = {
    # Sensational drama / Clickbait aggression
    "scandal", "scandals", "humiliation", "humiliating", "humiliated", "disaster", "disastrous",
    "fiasco", "catastrophe", "catastrophic", "nightmare", "bombshell", "blasts", "blasted",
    "slams", "slammed", "destroys", "destroyed", "crushes", "crushed", "meltdown", "rages",
    "fury", "outrage", "shocking", "chaos", "bloodbath", "panic", "hysteria",
    # Polarized political / Moralistic labels
    "betrayal", "traitor", "sham", "coward", "cowardly", "criminal", "dictator", "fascist",
    "communist", "extremist", "radical", "disgrace", "disgraceful", "shameful", "unacceptable",
    "repugnant", "tyrant", "tyranny", "authoritarian", "insanity", "deranged",
    # Euphoric labels
    "heroic", "hero", "savior", "miracle", "triumph", "triumphant", "flawless", "crushing victory"
}

def analyze_text_bias(title: str, summary: str = "", language: str = "pt") -> Dict[str, Any]:
    combined_text = f"{title} {summary}".lower()
    
    # Tokenize words
    words = re.findall(r'\b[a-záàâãéèêíïóôõöúçñ]+\b', combined_text)
    
    lexicon = LOADED_WORDS_PT if language == "pt" else LOADED_WORDS_EN
    
    found_loaded = []
    for w in words:
        if w in lexicon and w not in found_loaded:
            found_loaded.append(w)
            
    # Calculate subjectivity score
    total_words = max(len(words), 1)
    # Scaled metric: 1 loaded word is notable, 2+ is distinctly sensational
    raw_ratio = len(found_loaded) / min(total_words, 30)
    subjectivity_score = round(min(raw_ratio * 4.0, 1.0), 2)
    
    sentiment_label = "neutral"
    if subjectivity_score >= 0.25:
        # Check negative vs positive slant
        positive_cues = {"heroico", "herói", "salvação", "milagre", "triunfo", "heroic", "savior", "miracle", "triumph"}
        pos_matches = sum(1 for w in found_loaded if w in positive_cues)
        if pos_matches > len(found_loaded) / 2:
            sentiment_label = "sensational_positive"
        else:
            sentiment_label = "sensational_negative"
            
    return {
        "loaded_words": found_loaded,
        "subjectivity_score": subjectivity_score,
        "sentiment_label": sentiment_label
    }

def calculate_spectrum_and_blindspots(articles: List[Dict[str, Any]]) -> Tuple[Dict[str, int], Optional[str]]:
    distribution: Dict[str, int] = {
        "left": 0,
        "center-left": 0,
        "center": 0,
        "center-right": 0,
        "right": 0
    }
    
    for a in articles:
        spec = a.get("spectrum", "center")
        if spec in distribution:
            distribution[spec] += 1
        else:
            distribution["center"] += 1
            
    total = len(articles)
    if total == 0:
        return distribution, None
        
    left_side = distribution["left"] + distribution["center-left"]
    right_side = distribution["right"] + distribution["center-right"]
    center = distribution["center"]
    
    blindspot_warning = None
    if total >= 2:
        if left_side > 0 and right_side == 0 and center == 0:
            blindspot_warning = "⚠️ Ponto Cego: Cobertura exclusiva de veículos de esquerda / centro-esquerda. Veículos de direita e agências de centro não noticiaram."
        elif right_side > 0 and left_side == 0 and center == 0:
            blindspot_warning = "⚠️ Ponto Cego: Cobertura exclusiva de veículos de direita / centro-direita. Veículos de esquerda e agências de centro não noticiaram."
        elif left_side >= 2 and right_side == 0:
            blindspot_warning = "ℹ️ Desbalanceamento: Predominância de veículos progressistas/esquerda. Pouca ou nenhuma repercussão na direita."
        elif right_side >= 2 and left_side == 0:
            blindspot_warning = "ℹ️ Desbalanceamento: Predominância de veículos conservadores/direita. Pouca ou nenhuma repercussão na esquerda."
        elif left_side > 0 and right_side > 0:
            blindspot_warning = "✅ Cobertura Plural: Pauta repercutida em veículos de ambos os polos políticos."
            
    return distribution, blindspot_warning

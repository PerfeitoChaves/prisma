import re
import unicodedata
from collections import Counter, defaultdict
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.cluster import AgglomerativeClustering
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from backend.config import CLUSTERING_SIMILARITY_THRESHOLD, CLUSTERING_TIME_WINDOW_HOURS
from backend.database import (
    detect_topic,
    get_articles_for_clustering,
    save_story_cluster,
    save_story_analysis,
)
from backend.analysis.bias_detector import calculate_spectrum_and_blindspots
from backend.analysis.neutral_synthesizer import generate_story_synthesis, reset_synthesis_budget


# Common Portuguese and English stopwords for clean clustering
STOPWORDS_PT = {
    "a", "o", "os", "as", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das",
    "em", "no", "na", "nos", "nas", "por", "pelo", "pela", "pelos", "pelas", "para", "pra",
    "com", "sem", "sobre", "entre", "sob", "ate", "desde", "apos", "durante",
    "e", "ou", "mas", "porem", "contudo", "todavia", "entretanto", "portanto",
    "que", "se", "como", "quando", "onde", "porque", "por que", "qual", "quais",
    "eu", "tu", "ele", "ela", "nos", "vos", "eles", "elas", "me", "te", "se", "nos",
    "este", "esta", "estes", "estas", "esse", "essa", "esses", "essas", "aquele", "aquela",
    "isso", "isto", "aquilo", "seu", "sua", "seus", "suas", "meu", "minha",
    "ser", "estar", "ter", "haver", "fazer", "dizer", "ir", "ver", "dar", "foi", "e",
    "sao", "era", "eram", "sera", "serao", "tem", "tinha", "ha", "havia", "disse",
    "diz", "afirma", "segundo", "apontam", "mostra", "novo", "nova", "novos", "novas",
    "ano", "anos", "dia", "dias", "mes", "meses", "hoje", "ontem", "nesta", "neste",
    "mais", "menos", "muito", "pouco", "ja", "ainda", "agora", "sempre", "nunca",
    "nao", "tambem", "contra", "pode", "podem", "voce", "todos", "todas", "feito",
    "noticia", "noticias", "jornal", "g1", "folha", "uol", "cnn", "estadao"
}

STOPWORDS_EN = {
    "a", "an", "the", "and", "or", "but", "if", "because", "as", "what", "which",
    "this", "that", "these", "those", "then", "just", "so", "than", "such",
    "both", "through", "about", "for", "is", "of", "while", "during", "to",
    "from", "in", "out", "on", "off", "over", "under", "again", "further",
    "at", "by", "with", "about", "against", "between", "into", "through",
    "he", "she", "it", "they", "we", "i", "you", "his", "her", "its", "their",
    "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "shall", "should", "can", "could", "may", "might", "must",
    "says", "said", "saying", "report", "reports", "news", "today", "yesterday", "new"
}

COMBINED_STOPWORDS = list(STOPWORDS_PT.union(STOPWORDS_EN))

def preprocess_text(text: str) -> str:
    text = text.lower()
    # Remove urls and accents (ensures Portuguese accented words match unaccented STOPWORDS_PT)
    text = re.sub(r'https?://\S+', '', text)
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def pick_representative_headline(articles: List[Dict[str, Any]]) -> str:
    # Prefer headline with lowest subjectivity score and from a center/agency outlet
    def score_article(a):
        subj = a.get("subjectivity_score", 0.5)
        spec = a.get("spectrum", "center")
        pref = 0
        if spec == "center":
            pref = -0.3
        elif "center" in spec:
            pref = -0.1
        return subj + pref
        
    sorted_arts = sorted(articles, key=score_article)
    return sorted_arts[0]["title"]

_VALID_STORY_CATEGORIES = {
    "brasil",
    "mundo",
    "politica",
    "economia",
    "tecnologia",
    "jogos",
    "guerra",
    "ciencia",
}


def _resolve_cluster_category(
    title: str, neutral_summary: str, cluster_articles: List[Dict[str, Any]], default_category: Optional[str]
) -> str:
    if default_category and default_category != "todas":
        return default_category
    cat_counts = Counter((a.get("category") or "brasil") for a in cluster_articles)
    majority_cat = cat_counts.most_common(1)[0][0]
    if majority_cat == "ciencia":
        return "ciencia"
    topic_slug = detect_topic(title, neutral_summary, majority_cat).get("slug", "geral")
    if topic_slug in _VALID_STORY_CATEGORIES:
        return topic_slug
    return majority_cat if majority_cat in _VALID_STORY_CATEGORIES else "brasil"


def cluster_articles(
    articles: List[Dict[str, Any]], default_category: Optional[str] = None
) -> Dict[str, int]:
    """Agrupa artigos via AgglomerativeClustering (average linkage) sobre distância cosseno."""
    if not articles:
        return {"total_stories": 0}

    # Peso 2x para o título em relação ao resumo melhora precisão do agrupamento
    corpus = [f"{a['title']} {a['title']} {a.get('summary', '')}" for a in articles]
    cleaned_corpus = [preprocess_text(text) for text in corpus]

    n = len(articles)
    if n == 1:
        clusters: List[List[int]] = [[0]]
    else:
        vectorizer = TfidfVectorizer(
            stop_words=COMBINED_STOPWORDS,
            ngram_range=(1, 2),
            min_df=1,
            max_features=4000,
        )
        try:
            tfidf_matrix = vectorizer.fit_transform(cleaned_corpus)
        except ValueError:
            return {"total_stories": 0}

        similarity_matrix = cosine_similarity(tfidf_matrix)
        distance_matrix = np.clip(1.0 - similarity_matrix, 0.0, 1.0)
        np.fill_diagonal(distance_matrix, 0.0)
        distance_matrix = (distance_matrix + distance_matrix.T) / 2.0

        model = AgglomerativeClustering(
            n_clusters=None,
            metric="precomputed",
            linkage="average",
            distance_threshold=1.0 - CLUSTERING_SIMILARITY_THRESHOLD,
        )
        labels = model.fit_predict(distance_matrix)
        grouped: Dict[int, List[int]] = defaultdict(list)
        for idx, label in enumerate(labels):
            grouped[int(label)].append(idx)
        clusters = list(grouped.values())

    # Process multi-source / larger clusters first so top stories receive AI synthesis budget
    sorted_clusters = sorted(
        clusters,
        key=lambda c: (len({articles[i].get("source_id") for i in c}), len(c)),
        reverse=True,
    )

    counts_by_cat: Dict[str, int] = defaultdict(int)
    total_stories = 0

    for cluster_indices in sorted_clusters:
        cluster_arts = [articles[idx] for idx in cluster_indices]
        article_ids = [a["id"] for a in cluster_arts]

        spectrum_dist, blindspot = calculate_spectrum_and_blindspots(cluster_arts)
        title = pick_representative_headline(cluster_arts)
        synthesis = generate_story_synthesis(title, cluster_arts)
        story_category = _resolve_cluster_category(
            title, synthesis.get("neutral_summary", ""), cluster_arts, default_category
        )

        story_id = save_story_cluster(
            title=title,
            category=story_category,
            article_ids=article_ids,
            spectrum_distribution=spectrum_dist,
            blindspot_warning=blindspot,
        )
        save_story_analysis(
            story_id=story_id,
            neutral_summary=synthesis["neutral_summary"],
            consensus_facts=synthesis["consensus_facts"],
            divergent_points=synthesis["divergent_points"],
            framing_contrast=synthesis["framing_contrast"],
            is_ai_generated=synthesis.get("is_ai_generated", False),
        )
        counts_by_cat[f"{story_category}_stories"] += 1
        total_stories += 1

    counts_by_cat["total_stories"] = total_stories
    return dict(counts_by_cat)


def cluster_articles_for_category(category: Optional[str] = None) -> int:
    articles = get_articles_for_clustering(category, hours=CLUSTERING_TIME_WINDOW_HOURS)
    if not articles:
        return 0
    res = cluster_articles(articles, default_category=category)
    return res.get("total_stories", 0)


def run_clustering() -> Dict[str, int]:
    """Executa clustering cross-category para notícias (48h) e separado para ciência (7d), respeitando o orçamento gratuito de IA."""
    reset_synthesis_budget(12)
    results: Dict[str, int] = {}
    total = 0

    news_articles = get_articles_for_clustering(
        category=None,
        hours=CLUSTERING_TIME_WINDOW_HOURS,
        exclude_category="ciencia",
    )
    if news_articles:
        news_res = cluster_articles(news_articles, default_category=None)
        for k, v in news_res.items():
            if k != "total_stories":
                results[k] = results.get(k, 0) + v
        total += news_res.get("total_stories", 0)

    science_articles = get_articles_for_clustering(category="ciencia", hours=168)
    if science_articles:
        sci_res = cluster_articles(science_articles, default_category="ciencia")
        for k, v in sci_res.items():
            if k != "total_stories":
                results[k] = results.get(k, 0) + v
        total += sci_res.get("total_stories", 0)

    results["total_stories"] = total
    return results

if __name__ == "__main__":
    res = run_clustering()
    print("Clustering concluído:", res)


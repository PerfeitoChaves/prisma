import re
from typing import List, Dict, Any, Set
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from backend.config import CLUSTERING_SIMILARITY_THRESHOLD, CLUSTERING_TIME_WINDOW_HOURS
from backend.database import get_articles_for_clustering, save_story_cluster, save_story_analysis, get_distinct_categories
from backend.analysis.bias_detector import calculate_spectrum_and_blindspots
from backend.analysis.neutral_synthesizer import generate_story_synthesis


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
    # Remove urls and special chars
    text = re.sub(r'https?://\S+', '', text)
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

def cluster_articles_for_category(category: str) -> int:
    articles = get_articles_for_clustering(category, hours=CLUSTERING_TIME_WINDOW_HOURS)
    if not articles:
        return 0
        
    corpus = [f"{a['title']} {a.get('summary', '')}" for a in articles]
    cleaned_corpus = [preprocess_text(text) for text in corpus]
    
    # TF-IDF Vectorization
    vectorizer = TfidfVectorizer(
        stop_words=COMBINED_STOPWORDS,
        ngram_range=(1, 2),
        min_df=1,
        max_features=4000
    )
    
    try:
        tfidf_matrix = vectorizer.fit_transform(cleaned_corpus)
    except ValueError:
        return 0
        
    similarity_matrix = cosine_similarity(tfidf_matrix)
    n = len(articles)
    
    # Graph-based clustering: find connected components where sim >= threshold
    visited: Set[int] = set()
    clusters: List[List[int]] = []
    
    for i in range(n):
        if i in visited:
            continue
        cluster = [i]
        visited.add(i)
        
        # Check all other articles
        for j in range(i + 1, n):
            if j in visited:
                continue
            # Calculate match with current cluster members
            sims = [similarity_matrix[m][j] for m in cluster]
            # If max similarity exceeds threshold, add to cluster
            if max(sims) >= CLUSTERING_SIMILARITY_THRESHOLD:
                cluster.append(j)
                visited.add(j)
                
        clusters.append(cluster)
        
    # Save clusters
    saved_stories_count = 0
    # Process multi-article clusters first, then single-article ones
    sorted_clusters = sorted(clusters, key=lambda c: len(c), reverse=True)
    
    for cluster_indices in sorted_clusters:
        cluster_articles = [articles[idx] for idx in cluster_indices]
        article_ids = [a["id"] for a in cluster_articles]
        
        # Calculate spectrum & blindspots
        spectrum_dist, blindspot = calculate_spectrum_and_blindspots(cluster_articles)
        title = pick_representative_headline(cluster_articles)
        
        # Save story cluster to DB
        story_id = save_story_cluster(
            title=title,
            category=category,
            article_ids=article_ids,
            spectrum_distribution=spectrum_dist,
            blindspot_warning=blindspot
        )
        
        # Generate neutral synthesis and framing contrast
        synthesis = generate_story_synthesis(title, cluster_articles)
        save_story_analysis(
            story_id=story_id,
            neutral_summary=synthesis["neutral_summary"],
            consensus_facts=synthesis["consensus_facts"],
            divergent_points=synthesis["divergent_points"],
            framing_contrast=synthesis["framing_contrast"],
            is_ai_generated=synthesis.get("is_ai_generated", False)
        )
        saved_stories_count += 1
        
    return saved_stories_count

def run_clustering() -> Dict[str, int]:
    categories = get_distinct_categories()
    if not categories:
        categories = ["brasil", "mundo", "tecnologia", "jogos", "economia", "guerra", "politica"]
    results = {}
    total = 0
    for cat in categories:
        count = cluster_articles_for_category(cat)
        results[f"{cat}_stories"] = count
        total += count
    results["total_stories"] = total
    return results

if __name__ == "__main__":
    res = run_clustering()
    print("Clustering concluído:", res)


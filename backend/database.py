import sqlite3
import json
from contextlib import contextmanager
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.config import DB_PATH

def init_db():
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # Articles table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS articles (
                id TEXT PRIMARY KEY,
                source_id TEXT NOT NULL,
                source_name TEXT NOT NULL,
                title TEXT NOT NULL,
                link TEXT NOT NULL UNIQUE,
                summary TEXT,
                published_at TEXT,
                category TEXT NOT NULL,
                spectrum TEXT NOT NULL,
                language TEXT NOT NULL,
                loaded_words TEXT DEFAULT '[]',
                subjectivity_score REAL DEFAULT 0.0,
                sentiment_label TEXT DEFAULT 'neutral',
                full_text TEXT,
                executive_summary TEXT,
                created_at TEXT NOT NULL
            );
        """)

        # Migration helper for existing databases
        for col in ["full_text", "executive_summary", "title_original", "summary_original", "full_text_original", "executive_summary_original"]:
            try:
                cursor.execute(f"ALTER TABLE articles ADD COLUMN {col} TEXT;")
            except Exception:
                pass
        
        # Stories (clusters) table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS stories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                article_count INTEGER DEFAULT 0,
                source_count INTEGER DEFAULT 0,
                spectrum_distribution TEXT DEFAULT '{}',
                blindspot_warning TEXT
            );
        """)
        
        # Story-Articles relation table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS story_articles (
                story_id INTEGER NOT NULL,
                article_id TEXT NOT NULL,
                PRIMARY KEY (story_id, article_id),
                FOREIGN KEY (story_id) REFERENCES stories (id) ON DELETE CASCADE,
                FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE
            );
        """)
        
        # Story analysis table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS story_analysis (
                story_id INTEGER PRIMARY KEY,
                neutral_summary TEXT,
                consensus_facts TEXT DEFAULT '[]',
                divergent_points TEXT DEFAULT '[]',
                framing_contrast TEXT DEFAULT '[]',
                is_ai_generated INTEGER DEFAULT 0,
                FOREIGN KEY (story_id) REFERENCES stories (id) ON DELETE CASCADE
            );
        """)
        
        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_articles_pubdate ON articles(published_at);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_stories_updated ON stories(updated_at);")
        
        conn.commit()

@contextmanager
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def save_article(article_data: Dict[str, Any]) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()
        try:
            cursor.execute("""
                INSERT INTO articles (
                    id, source_id, source_name, title, link, summary,
                    published_at, category, spectrum, language,
                    loaded_words, subjectivity_score, sentiment_label,
                    title_original, summary_original, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(link) DO UPDATE SET
                    title=excluded.title,
                    summary=excluded.summary,
                    title_original=excluded.title_original,
                    summary_original=excluded.summary_original,
                    loaded_words=excluded.loaded_words,
                    subjectivity_score=excluded.subjectivity_score,
                    sentiment_label=excluded.sentiment_label
            """, (
                article_data["id"],
                article_data["source_id"],
                article_data["source_name"],
                article_data["title"],
                article_data["link"],
                article_data.get("summary", ""),
                article_data.get("published_at", now),
                article_data["category"],
                article_data["spectrum"],
                article_data.get("language", "pt"),
                json.dumps(article_data.get("loaded_words", []), ensure_ascii=False),
                article_data.get("subjectivity_score", 0.0),
                article_data.get("sentiment_label", "neutral"),
                article_data.get("title_original", article_data["title"]),
                article_data.get("summary_original", article_data.get("summary", "")),
                now
            ))
            conn.commit()
            return True
        except Exception as e:
            print(f"[DB] Error saving article {article_data.get('link')}: {e}")
            return False

def get_articles_for_clustering(category: str, hours: int = 48) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM articles
            WHERE category = ?
            ORDER BY published_at DESC
            LIMIT 300
        """, (category,))
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["loaded_words"] = json.loads(d.get("loaded_words") or "[]")
            result.append(d)
        return result

def save_story_cluster(
    title: str,
    category: str,
    article_ids: List[str],
    spectrum_distribution: Dict[str, int],
    blindspot_warning: Optional[str] = None
) -> int:
    with get_connection() as conn:
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()
        
        # Check if story containing these articles already exists
        placeholders = ",".join(["?"] * len(article_ids))
        cursor.execute(f"""
            SELECT story_id, COUNT(*) as matches 
            FROM story_articles 
            WHERE article_id IN ({placeholders})
            GROUP BY story_id
            ORDER BY matches DESC
            LIMIT 1
        """, article_ids)
        row = cursor.fetchone()
        
        story_id = None
        if row and row["matches"] >= 2:
            story_id = row["story_id"]
            cursor.execute("""
                UPDATE stories SET
                    title = ?,
                    updated_at = ?,
                    article_count = ?,
                    source_count = ?,
                    spectrum_distribution = ?,
                    blindspot_warning = ?
                WHERE id = ?
            """, (
                title,
                now,
                len(article_ids),
                len(set(spectrum_distribution.keys())),
                json.dumps(spectrum_distribution, ensure_ascii=False),
                blindspot_warning,
                story_id
            ))
        else:
            cursor.execute("""
                INSERT INTO stories (
                    title, category, created_at, updated_at,
                    article_count, source_count, spectrum_distribution, blindspot_warning
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                title,
                category,
                now,
                now,
                len(article_ids),
                len(set(spectrum_distribution.keys())),
                json.dumps(spectrum_distribution, ensure_ascii=False),
                blindspot_warning
            ))
            story_id = cursor.lastrowid
            
        # Re-link articles
        cursor.execute("DELETE FROM story_articles WHERE story_id = ?", (story_id,))
        for aid in article_ids:
            cursor.execute("INSERT OR IGNORE INTO story_articles (story_id, article_id) VALUES (?, ?)", (story_id, aid))
            
        conn.commit()
        return story_id

def save_story_analysis(
    story_id: int,
    neutral_summary: str,
    consensus_facts: List[str],
    divergent_points: List[str],
    framing_contrast: List[Dict[str, Any]],
    is_ai_generated: bool = False
):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO story_analysis (
                story_id, neutral_summary, consensus_facts, divergent_points, framing_contrast, is_ai_generated
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(story_id) DO UPDATE SET
                neutral_summary = excluded.neutral_summary,
                consensus_facts = excluded.consensus_facts,
                divergent_points = excluded.divergent_points,
                framing_contrast = excluded.framing_contrast,
                is_ai_generated = excluded.is_ai_generated
        """, (
            story_id,
            neutral_summary,
            json.dumps(consensus_facts, ensure_ascii=False),
            json.dumps(divergent_points, ensure_ascii=False),
            json.dumps(framing_contrast, ensure_ascii=False),
            1 if is_ai_generated else 0
        ))
        conn.commit()

def get_distinct_categories() -> List[str]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT category FROM articles WHERE category IS NOT NULL AND category != '';")
        return [r[0] for r in cursor.fetchall() if r[0]]

def detect_topic(title: str, summary: str = "", category: str = "brasil") -> Dict[str, str]:
    cat = (category or "").lower()
    text = f"{title} {summary}".lower()

    # 1. Games / Jogos
    if cat == "jogos" or any(k in text for k in ["game", "games", "jogo", "jogos", "playstation", "ps5", "ps4", "xbox", "nintendo", "switch", "steam", "gamer", "rpg", "gta", "fortnite", "zelda", "esports", "gameplay", "remake"]):
        return {"name": "GAMES & CULTURA", "slug": "jogos", "icon": ""}

    # 2. Tecnologia & IA
    if cat == "tecnologia" or any(k in text for k in ["inteligência artificial", "openai", "chatgpt", "deepmind", "google", "apple", "microsoft", "smartphone", "iphone", "celular", "aplicativo", "software", "algoritmo", "chip", "nvidia", "meta", "whatsapp", "redes sociais", "ciberataque", "hacker"]):
        return {"name": "TECNOLOGIA & IA", "slug": "tecnologia", "icon": ""}

    # 3. Guerra & Conflitos
    if cat == "guerra" or any(k in text for k in ["guerra", "míssil", "mísseis", "ataque aéreo", "bombardeio", "tropas", "exército", "ucrânia", "rússia", "israel", "gaza", "palestin", "hamas", "hezbollah", "líbano", "otan", "cessar-fogo", "combatente", "drone militar", "defesa aérea", "colonos"]):
        return {"name": "GUERRA & CONFLITOS", "slug": "guerra", "icon": ""}

    # 4. Economia & Mercado
    if cat == "economia" or any(k in text for k in ["inflação", "juros", "selic", "banco central", "pib", "bolsa de valores", "ibovespa", "dólar", "mercado financeiro", "fazenda", "haddad", "gasto público", "orçamento", "receita federal", "imposto", "tribut", "ações", "dividendos", "investimento", "lucro"]):
        return {"name": "ECONOMIA & MERCADO", "slug": "economia", "icon": ""}

    # 5. Justiça & Lei
    if any(k in text for k in ["stf", "supremo", "tribunal", "juiz", "ministro", "moraes", "julgamento", "pf", "polícia federal", "preso", "prisão", "crime", "investigação", "mpt", "inquérito", "processo", "diplomata", "condenação", "habeas corpus"]):
        return {"name": "JUSTIÇA & LEI", "slug": "justica", "icon": ""}

    # 6. Política & Poder
    if cat == "politica" or any(k in text for k in ["câmara", "senado", "congresso", "deputad", "senador", "pec", "lula", "bolsonaro", "governo", "oposição", "eleição", "votação", "partido", "mandato", "planalto", "parlamentar"]):
        return {"name": "POLÍTICA & PODER", "slug": "politica", "icon": ""}

    # 7. Geopolítica & Mundo
    if cat == "mundo" or any(k in text for k in ["eua", "biden", "trump", "china", "europa", "vaticano", "papa", "onu", "oriente médio", "ocidente", "frança", "alemanha", "reino unido", "eleições americanas"]):
        return {"name": "GEOPOLÍTICA & MUNDO", "slug": "mundo", "icon": ""}

    # 8. Saúde & Ciência
    if any(k in text for k in ["saúde", "hospital", "vacina", "médic", "câncer", "doença", "clima", "ambiente", "queimada", "amazônia", "cirurgia", "pulmão", "vírus", "epidemia"]):
        return {"name": "SAÚDE & CIÊNCIA", "slug": "saude", "icon": ""}

    return {"name": "BRASIL & SOCIEDADE" if cat == "brasil" else "NOTÍCIAS GERAIS", "slug": "geral", "icon": ""}


def get_stories(category: Optional[str] = None, limit: int = 40, min_sources: int = 1) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        query = """
            SELECT s.*, sa.neutral_summary, sa.consensus_facts, sa.divergent_points, sa.framing_contrast, sa.is_ai_generated
            FROM stories s
            LEFT JOIN story_analysis sa ON s.id = sa.story_id
            WHERE 1=1
        """
        params = []
        if category and category != "todas":
            query += " AND s.category = ?"
            params.append(category)
        if min_sources > 1:
            query += " AND s.source_count >= ?"
            params.append(min_sources)
            
        query += " ORDER BY s.article_count DESC, s.updated_at DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        stories_rows = cursor.fetchall()
        
        result = []
        for s in stories_rows:
            story = dict(s)
            topic_info = detect_topic(story["title"], story.get("neutral_summary") or "", story.get("category", "brasil"))
            story["topic"] = topic_info["name"]
            story["topic_slug"] = topic_info["slug"]
            story["topic_icon"] = topic_info["icon"]
            story["spectrum_distribution"] = json.loads(story.get("spectrum_distribution") or "{}")
            story["consensus_facts"] = json.loads(story.get("consensus_facts") or "[]")
            story["divergent_points"] = json.loads(story.get("divergent_points") or "[]")
            story["framing_contrast"] = json.loads(story.get("framing_contrast") or "[]")
            
            # Fetch articles for this story
            cursor.execute("""
                SELECT a.* FROM articles a
                JOIN story_articles sa ON a.id = sa.article_id
                WHERE sa.story_id = ?
                ORDER BY a.published_at DESC
            """, (story["id"],))
            articles = []
            for a in cursor.fetchall():
                art = dict(a)
                art["loaded_words"] = json.loads(art.get("loaded_words") or "[]")
                articles.append(art)
            story["articles"] = articles
            result.append(story)
            
        return result

def search_stories_db(query: str, limit: int = 50) -> List[Dict[str, Any]]:
    clean_q = f"%{query.strip()}%"
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DISTINCT s.*, sa.neutral_summary, sa.consensus_facts, sa.divergent_points, sa.framing_contrast, sa.is_ai_generated,
                   CASE WHEN s.title LIKE ? THEN 1 ELSE 2 END as relevance
            FROM stories s
            LEFT JOIN story_analysis sa ON s.id = sa.story_id
            LEFT JOIN story_articles sa_rel ON s.id = sa_rel.story_id
            LEFT JOIN articles a ON sa_rel.article_id = a.id
            WHERE s.title LIKE ? OR sa.neutral_summary LIKE ? OR a.title LIKE ? OR a.summary LIKE ?
            ORDER BY relevance ASC, s.article_count DESC, s.updated_at DESC
            LIMIT ?
        """, (clean_q, clean_q, clean_q, clean_q, clean_q, limit))
        stories_rows = cursor.fetchall()
        
        result = []
        for s in stories_rows:
            story = dict(s)
            topic_info = detect_topic(story["title"], story.get("neutral_summary") or "", story.get("category", "brasil"))
            story["topic"] = topic_info["name"]
            story["topic_slug"] = topic_info["slug"]
            story["topic_icon"] = topic_info["icon"]
            story["spectrum_distribution"] = json.loads(story.get("spectrum_distribution") or "{}")
            story["consensus_facts"] = json.loads(story.get("consensus_facts") or "[]")
            story["divergent_points"] = json.loads(story.get("divergent_points") or "[]")
            story["framing_contrast"] = json.loads(story.get("framing_contrast") or "[]")
            
            cursor.execute("""
                SELECT a.* FROM articles a
                JOIN story_articles sa ON a.id = sa.article_id
                WHERE sa.story_id = ?
                ORDER BY a.published_at DESC
            """, (story["id"],))
            articles = []
            for a in cursor.fetchall():
                art = dict(a)
                art["loaded_words"] = json.loads(art.get("loaded_words") or "[]")
                articles.append(art)
            story["articles"] = articles
            result.append(story)
            
        return result


def get_story_by_id(story_id: int) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.*, sa.neutral_summary, sa.consensus_facts, sa.divergent_points, sa.framing_contrast, sa.is_ai_generated
            FROM stories s
            LEFT JOIN story_analysis sa ON s.id = sa.story_id
            WHERE s.id = ?
        """, (story_id,))
        row = cursor.fetchone()
        if not row:
            return None
        story = dict(row)
        topic_info = detect_topic(story["title"], story.get("neutral_summary") or "", story.get("category", "brasil"))
        story["topic"] = topic_info["name"]
        story["topic_slug"] = topic_info["slug"]
        story["topic_icon"] = topic_info["icon"]
        story["spectrum_distribution"] = json.loads(story.get("spectrum_distribution") or "{}")
        story["consensus_facts"] = json.loads(story.get("consensus_facts") or "[]")
        story["divergent_points"] = json.loads(story.get("divergent_points") or "[]")
        story["framing_contrast"] = json.loads(story.get("framing_contrast") or "[]")
        
        cursor.execute("""
            SELECT a.* FROM articles a
            JOIN story_articles sa ON a.id = sa.article_id
            WHERE sa.story_id = ?
            ORDER BY a.published_at DESC
        """, (story_id,))
        articles = []
        for a in cursor.fetchall():
            art = dict(a)
            art["loaded_words"] = json.loads(art.get("loaded_words") or "[]")
            articles.append(art)
        story["articles"] = articles
        return story

def get_database_stats() -> Dict[str, Any]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM articles")
        total_articles = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM stories")
        total_stories = cursor.fetchone()[0]
        
        cursor.execute("SELECT category, COUNT(*) FROM articles GROUP BY category")
        articles_by_cat = dict(cursor.fetchall())
        
        cursor.execute("SELECT spectrum, COUNT(*) FROM articles GROUP BY spectrum")
        articles_by_spectrum = dict(cursor.fetchall())
        
        cursor.execute("SELECT source_name, COUNT(*) FROM articles GROUP BY source_name ORDER BY COUNT(*) DESC LIMIT 10")
        top_sources = dict(cursor.fetchall())
        
        return {
            "total_articles": total_articles,
            "total_stories": total_stories,
            "articles_by_category": articles_by_cat,
            "articles_by_spectrum": articles_by_spectrum,
            "top_sources": top_sources
        }

def get_article_by_id(article_id: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM articles WHERE id = ?", (article_id,))
        row = cursor.fetchone()
        if not row:
            return None
        art = dict(row)
        art["loaded_words"] = json.loads(art.get("loaded_words") or "[]")
        return art

def update_article_reading_content(
    article_id: str,
    full_text: str,
    executive_summary: str,
    full_text_original: Optional[str] = None,
    executive_summary_original: Optional[str] = None
):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE articles 
            SET full_text = ?, executive_summary = ?,
                full_text_original = COALESCE(?, full_text_original),
                executive_summary_original = COALESCE(?, executive_summary_original)
            WHERE id = ?
        """, (
            full_text,
            executive_summary,
            full_text_original,
            executive_summary_original,
            article_id
        ))
        conn.commit()

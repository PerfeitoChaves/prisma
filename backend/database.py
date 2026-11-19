import sqlite3
import json
from collections import Counter, defaultdict
from contextlib import contextmanager
from email.utils import format_datetime
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from xml.sax.saxutils import escape
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

def get_articles_for_clustering(
    category: Optional[str] = None,
    hours: int = 48,
    exclude_category: Optional[str] = None,
) -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        use_cat = bool(category and category != "todas")
        limit = 300 if use_cat else 1800

        base_filters: List[str] = []
        base_params: List[Any] = []
        if use_cat:
            base_filters.append("category = ?")
            base_params.append(category)
        if exclude_category:
            base_filters.append("category != ?")
            base_params.append(exclude_category)

        rows = []
        if hours and hours > 0:
            cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).replace(tzinfo=None).isoformat()
            where_sql = " AND ".join([*base_filters, "published_at >= ?"])
            cursor.execute(
                f"SELECT * FROM articles WHERE {where_sql} ORDER BY published_at DESC LIMIT ?",
                (*base_params, cutoff, limit),
            )
            rows = cursor.fetchall()

        # Fallback if DB only contains older articles (e.g. historical test fixtures)
        if len(rows) < 5:
            where_clause = f"WHERE {' AND '.join(base_filters)}" if base_filters else ""
            cursor.execute(
                f"SELECT * FROM articles {where_clause} ORDER BY published_at DESC LIMIT ?",
                (*base_params, limit),
            )
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
            SELECT COUNT(DISTINCT source_id) AS src_cnt
            FROM articles
            WHERE id IN ({placeholders})
        """, article_ids)
        src_row = cursor.fetchone()
        distinct_sources = src_row["src_cnt"] if src_row and src_row["src_cnt"] else len(article_ids)

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
                    category = ?,
                    updated_at = ?,
                    article_count = ?,
                    source_count = ?,
                    spectrum_distribution = ?,
                    blindspot_warning = ?
                WHERE id = ?
            """, (
                title,
                category,
                now,
                len(article_ids),
                distinct_sources,
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
                distinct_sources,
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

    # 0. Ciência & Papers (preserva periódicos e preprints fora do espectro político)
    if cat == "ciencia":
        return {"name": "CIÊNCIA & PAPERS", "slug": "ciencia", "icon": ""}

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

_SPECTRUM_SCALE = {
    "left": -2,
    "center-left": -1,
    "center": 0,
    "center-right": 1,
    "right": 2,
}


def get_database_stats() -> Dict[str, Any]:
    computed_at = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT COUNT(*), COUNT(DISTINCT source_id), MIN(published_at), MAX(published_at) FROM articles"
        )
        art_row = cursor.fetchone()
        total_articles = art_row[0] or 0
        total_sources = art_row[1] or 0
        first_pub = art_row[2] or computed_at
        last_pub = art_row[3] or computed_at

        cursor.execute("SELECT COUNT(*) FROM stories")
        total_stories = cursor.fetchone()[0] or 0

        cursor.execute("SELECT category, COUNT(*) FROM articles GROUP BY category")
        articles_by_cat = dict(cursor.fetchall())

        cursor.execute("SELECT spectrum, COUNT(*) FROM articles GROUP BY spectrum")
        articles_by_spectrum = dict(cursor.fetchall())

        cursor.execute("SELECT source_name, COUNT(*) FROM articles GROUP BY source_name ORDER BY COUNT(*) DESC LIMIT 10")
        top_sources = dict(cursor.fetchall())

        # Full analytics payload compatible with StatsView.tsx (Worker parity)
        cursor.execute("""
            SELECT a.id, a.source_id, a.source_name, a.spectrum, a.category,
                   a.subjectivity_score, a.sentiment_label, a.loaded_words, sa.story_id
            FROM articles a
            LEFT JOIN story_articles sa ON sa.article_id = a.id
        """)
        rows = cursor.fetchall()

    # Aggregate in a single clean pass over joined rows
    global_cats: Counter = Counter()
    per_source_cats: Dict[str, Counter] = defaultdict(Counter)
    spec_data: Dict[str, Dict[str, Any]] = {}
    source_data: Dict[str, Dict[str, Any]] = {}
    story_sources: Dict[int, Dict[str, int]] = defaultdict(dict)
    story_all_sources: Dict[int, set] = defaultdict(set)
    word_counts: Counter = Counter()
    seen_article_ids = set()

    for r in rows:
        aid = r["id"]
        sid = r["source_id"]
        sname = r["source_name"] or sid
        spec = r["spectrum"] or "center"
        cat = r["category"] or "outros"
        subj = float(r["subjectivity_score"] or 0.0)
        sentiment = r["sentiment_label"] or "neutral"
        story_id = r["story_id"]
        is_political = cat != "ciencia"

        if story_id is not None:
            story_all_sources[story_id].add(sid)
            if is_political and spec in _SPECTRUM_SCALE:
                story_sources[story_id][sid] = _SPECTRUM_SCALE[spec]

        if aid in seen_article_ids:
            # Handle articles linked to multiple stories for story-level sets without double-counting article metrics
            if story_id is not None:
                source_data[sid]["stories"].add(story_id)
                if is_political and spec in spec_data:
                    spec_data[spec]["stories"].add(story_id)
            continue
        seen_article_ids.add(aid)

        global_cats[cat] += 1
        per_source_cats[sid][cat] += 1

        if sid not in source_data:
            source_data[sid] = {
                "source_id": sid,
                "source_name": sname,
                "spectrum": spec,
                "articles": 0,
                "stories": set(),
                "subj_sum": 0.0,
                "loaded_cnt": 0,
                "sens_cnt": 0,
            }
        sd = source_data[sid]
        sd["articles"] += 1
        sd["subj_sum"] += subj
        if subj > 0:
            sd["loaded_cnt"] += 1
        if sentiment != "neutral":
            sd["sens_cnt"] += 1
        if story_id is not None:
            sd["stories"].add(story_id)

        if is_political and spec in _SPECTRUM_SCALE:
            if spec not in spec_data:
                spec_data[spec] = {
                    "spectrum": spec,
                    "articles": 0,
                    "stories": set(),
                    "subj_sum": 0.0,
                    "loaded_cnt": 0,
                    "sens_cnt": 0,
                }
            sp = spec_data[spec]
            sp["articles"] += 1
            sp["subj_sum"] += subj
            if subj > 0:
                sp["loaded_cnt"] += 1
            if sentiment != "neutral":
                sp["sens_cnt"] += 1
            if story_id is not None:
                sp["stories"].add(story_id)

            if subj > 0:
                sv = _SPECTRUM_SCALE[spec]
                side = "esquerda" if sv < 0 else ("direita" if sv > 0 else "centro")
                try:
                    words = json.loads(r["loaded_words"] or "[]")
                except Exception:
                    words = []
                for w in words:
                    if isinstance(w, str) and w.strip():
                        word_counts[(side, w.strip().lower())] += 1

    by_spectrum = [
        {
            "spectrum": sp["spectrum"],
            "articles": sp["articles"],
            "stories": len(sp["stories"]),
            "subjectivity": sp["subj_sum"] / (sp["articles"] or 1),
            "loaded_rate": sp["loaded_cnt"] / (sp["articles"] or 1),
            "sensational_rate": sp["sens_cnt"] / (sp["articles"] or 1),
        }
        for sp in spec_data.values()
    ]

    coverage_counts: Counter = Counter()
    source_lean_vals: Dict[str, List[float]] = defaultdict(list)
    for st_id, src_map in story_sources.items():
        n = len(src_map)
        vals = list(src_map.values())
        lo, hi = min(vals), max(vals)
        if n == 1:
            coverage_counts["single"] += 1
        elif hi < 0:
            coverage_counts["left_only"] += 1
        elif lo > 0:
            coverage_counts["right_only"] += 1
        elif lo < 0 and hi > 0:
            coverage_counts["both_sides"] += 1
        else:
            coverage_counts["center_mixed"] += 1

        if n > 1:
            total_sv = sum(vals)
            for sid, v in src_map.items():
                source_lean_vals[sid].append((total_sv - v) / (n - 1))

    coverage = [{"kind": k, "stories": v} for k, v in coverage_counts.items()]

    g_total = sum(global_cats.values()) or 1
    all_cat_keys = set(global_cats.keys())
    sources_list = []
    for sid, sd in source_data.items():
        n_art = sd["articles"] or 1
        n_st = len(sd["stories"]) or 1
        excl = sum(1 for st_id in sd["stories"] if len(story_all_sources.get(st_id, ())) == 1)
        cats = dict(per_source_cats[sid])
        s_total = sum(cats.values()) or 1
        tv = sum(abs(cats.get(k, 0) / s_total - global_cats.get(k, 0) / g_total) for k in all_cat_keys)
        lean_vals = source_lean_vals.get(sid)
        entry: Dict[str, Any] = {
            "source_id": sid,
            "source_name": sd["source_name"],
            "spectrum": sd["spectrum"],
            "articles": sd["articles"],
            "stories": len(sd["stories"]),
            "subjectivity": sd["subj_sum"] / n_art,
            "loaded_rate": sd["loaded_cnt"] / n_art,
            "sensational_rate": sd["sens_cnt"] / n_art,
            "exclusive_rate": excl / n_st,
            "agenda_divergence": tv / 2.0,
            "categories": cats,
        }
        if lean_vals:
            entry["agenda_lean"] = sum(lean_vals) / len(lean_vals)
            entry["shared_stories"] = len(lean_vals)
        sources_list.append(entry)

    loaded_words = [
        {"side": side, "word": word, "n": count}
        for (side, word), count in word_counts.most_common(120)
    ]

    return {
        "total_articles": total_articles,
        "total_stories": total_stories,
        "articles_by_category": articles_by_cat,
        "articles_by_spectrum": articles_by_spectrum,
        "top_sources": top_sources,
        "computed_at": computed_at,
        "totals": {
            "articles": total_articles,
            "stories": total_stories,
            "sources": total_sources,
            "first": first_pub,
            "last": last_pub,
        },
        "by_spectrum": by_spectrum,
        "coverage": coverage,
        "categories": dict(global_cats),
        "sources": sources_list,
        "loaded_words": loaded_words,
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


def _parse_rfc822_date(value: Optional[str], fallback: datetime) -> str:
    if value:
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return format_datetime(dt)
        except ValueError:
            pass
    return format_datetime(fallback)


def _as_str_list(val: Any) -> List[str]:
    if isinstance(val, list):
        return [str(x).strip() for x in val if str(x).strip()]
    if isinstance(val, str) and val.strip():
        try:
            parsed = json.loads(val)
            if isinstance(parsed, list):
                return [str(x).strip() for x in parsed if str(x).strip()]
        except ValueError:
            return [val.strip()]
    return []


def generate_rss_feed(stories: List[Dict[str, Any]], updated_at: Optional[datetime] = None) -> str:
    """Gera XML RSS 2.0 válido com até 40 pautas consolidadas e seus consensos factuais."""
    ref = updated_at or datetime.now(timezone.utc)
    if ref.tzinfo is None:
        ref = ref.replace(tzinfo=timezone.utc)

    items_xml: List[str] = []
    for s in stories[:40]:
        arts = s.get("articles") or []
        pubs = sorted((a.get("published_at") or a.get("created_at") or "", a["id"]) for a in arts if a.get("id"))
        story_key = pubs[0][1] if pubs else str(s.get("id", ""))
        latest_pub = max((p for p, _ in pubs), default="") or s.get("updated_at") or s.get("created_at")

        title = str(s.get("title") or "Pauta PRISMA").strip()
        category = str(s.get("category") or "brasil")
        link = f"https://pchaves.org/prisma/#comparador?storyId={story_key}"
        src_count = s.get("source_count") or len({a.get("source_id") for a in arts if a.get("source_id")}) or len(arts) or 1

        desc_parts: List[str] = []
        summary = str(s.get("neutral_summary") or title).strip()
        if summary:
            desc_parts.append(summary)
        desc_parts.append(f"Cobertura: {src_count} veículo(s) confirmam o fato.")
        consensus = _as_str_list(s.get("consensus_facts"))[:3]
        if consensus:
            desc_parts.append("Consenso: " + " | ".join(consensus))
        blindspot = str(s.get("blindspot_warning") or "").strip()
        if blindspot:
            desc_parts.append(blindspot)

        items_xml.append(
            "    <item>\n"
            f"      <title>{escape(title)}</title>\n"
            f"      <link>{escape(link)}</link>\n"
            f"      <guid isPermaLink=\"false\">{escape(f'prisma-{story_key}')}</guid>\n"
            f"      <category>{escape(category)}</category>\n"
            f"      <pubDate>{_parse_rfc822_date(latest_pub, ref)}</pubDate>\n"
            f"      <description>{escape(' — '.join(desc_parts))}</description>\n"
            "    </item>"
        )

    items_block = "\n".join(items_xml)
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0">\n'
        "  <channel>\n"
        "    <title>PRISMA — A Mesma História, Todos os Ângulos</title>\n"
        "    <link>https://pchaves.org/prisma/</link>\n"
        "    <description>Agregador jornalístico multi-fonte, síntese neutra, consenso factual e comparação de enquadramentos.</description>\n"
        "    <language>pt-BR</language>\n"
        f"    <lastBuildDate>{format_datetime(ref)}</lastBuildDate>\n"
        f"{items_block}\n"
        "  </channel>\n"
        "</rss>\n"
    )

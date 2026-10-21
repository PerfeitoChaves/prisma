-- Banco D1 "prisma": npx wrangler d1 execute prisma --remote --file worker/schema.sql
CREATE TABLE IF NOT EXISTS stories (key TEXT PRIMARY KEY, category TEXT, latest_pub TEXT NOT NULL, hash TEXT NOT NULL, data TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS stories_pub ON stories (latest_pub DESC);
CREATE INDEX IF NOT EXISTS stories_cat_pub ON stories (category, latest_pub DESC);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY, story_key TEXT NOT NULL, source_id TEXT NOT NULL, source_name TEXT, spectrum TEXT, category TEXT, published_at TEXT, subjectivity REAL, sentiment TEXT, loaded_words TEXT);
CREATE INDEX IF NOT EXISTS articles_source ON articles (source_id);
CREATE INDEX IF NOT EXISTS articles_story ON articles (story_key);

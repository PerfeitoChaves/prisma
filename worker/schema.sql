-- Banco D1 "prisma": npx wrangler d1 execute prisma --remote --file worker/schema.sql
CREATE TABLE IF NOT EXISTS stories (key TEXT PRIMARY KEY, category TEXT, latest_pub TEXT NOT NULL, hash TEXT NOT NULL, data TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS stories_pub ON stories (latest_pub DESC);
CREATE INDEX IF NOT EXISTS stories_cat_pub ON stories (category, latest_pub DESC);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

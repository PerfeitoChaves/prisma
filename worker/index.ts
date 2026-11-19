import sources from "../backend/ingestion/sources.json";

interface Env {
  STATE: KVNamespace;
  DB: D1Database;
  GITHUB_TOKEN: string;
  INGEST_TOKEN: string;
}

const ORIGIN = "https://perfeitochaves.github.io";
const REPO = "PerfeitoChaves/prisma";
const WORKFLOW = "update-news.yml";
const SLICES = 3; // ~29 feeds por minuto, cada feed é verificado a cada 3 min (limite de 50 subrequests no plano grátis)
const MIN_GAP_MS = 20 * 60_000; // intervalo mínimo entre disparos do workflow (cota de 100k escritas/dia do D1 grátis)

type State = { heads: Record<string, string>; lastDispatch: number };

// Lê só o começo do feed e devolve o id do primeiro item
async function head(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "prisma-watch/1.0" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok || !res.body) return null;
    const reader = res.body.getReader();
    const { value } = await reader.read();
    await reader.cancel();
    const text = new TextDecoder().decode(value);
    const item = text.split(/<item[\s>]|<entry[\s>]/)[1] ?? "";
    return (/<guid[^>]*>([^<]+)/.exec(item) ?? /<link[^>]*>([^<]+)/.exec(item) ?? /<id>([^<]+)/.exec(item) ?? /<link[^>]*href="([^"]+)"/.exec(item))?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

async function watch(env: Env, now: number): Promise<void> {
  const state: State = (await env.STATE.get("state", "json")) ?? { heads: {}, lastDispatch: 0 };
  const slice = Math.floor(now / 60_000) % SLICES;
  const feeds = (sources as { id: string; rss: string }[]).filter((_, i) => i % SLICES === slice);

  const seen = await Promise.all(feeds.map(async (f) => [f.id, await head(f.rss)] as const));
  const changed = seen.filter(([id, h]) => h && h !== state.heads[id]);
  if (!changed.length || now - state.lastDispatch < MIN_GAP_MS) return;

  // Primeira execução: só registra a linha de base, sem disparar
  const first = Object.keys(state.heads).length === 0;
  for (const [id, h] of seen) if (h) state.heads[id] = h;
  if (!first) {
    const res = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "prisma-watch/1.0",
      },
      body: JSON.stringify({ ref: "main" }),
    });
    if (!res.ok) return console.log(`[PRISMA] dispatch falhou: ${res.status} ${await res.text()}`);
    state.lastDispatch = now;
    console.log(`[PRISMA] novidade em ${changed.map(([id]) => id).join(", ")} -> workflow disparado`);
  }
  await env.STATE.put("state", JSON.stringify(state));
}

// Formato montado por scripts/update_and_publish.py (build_ingest): chave, hash e linhas de matéria
// já vêm prontos e `data`/`articles` chegam como strings, para o Worker caber nos 10 ms de CPU do plano grátis.
type IngestBody = {
  stories: { key: string; category: string | null; latest_pub: string; hash: string; data: string }[];
  articles: string;
  meta: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=30" },
  });

// POST /prisma/api/ingest — chamado pelo GitHub Action com as pautas do ciclo
async function ingest(request: Request, env: Env): Promise<Response> {
  if (request.headers.get("Authorization") !== `Bearer ${env.INGEST_TOKEN}`) return json({ error: "unauthorized" }, 401);
  const body = (await request.json()) as IngestBody;

  // Só regrava a pauta se o conteúdo mudou (economiza escritas do plano grátis)
  const upsert = env.DB.prepare(
    `INSERT INTO stories (key, category, latest_pub, hash, data) VALUES (?1, ?2, ?3, ?4, ?5)
     ON CONFLICT(key) DO UPDATE SET category = excluded.category, latest_pub = excluded.latest_pub, hash = excluded.hash, data = excluded.data
     WHERE stories.hash != excluded.hash`
  );
  const stmts = body.stories.map((s) => upsert.bind(s.key, s.category, s.latest_pub, s.hash, s.data));
  // Matérias num único INSERT via json_each, para não estourar o limite de queries por invocação
  stmts.push(
    env.DB.prepare(
      `INSERT INTO articles (id, story_key, source_id, source_name, spectrum, category, published_at, subjectivity, sentiment, loaded_words)
       SELECT j.value ->> 'id', j.value ->> 'story_key', j.value ->> 'source_id', j.value ->> 'source_name', j.value ->> 'spectrum',
              j.value ->> 'category', j.value ->> 'published_at', j.value ->> 'subjectivity', j.value ->> 'sentiment', j.value ->> 'loaded_words'
       FROM json_each(?1) j WHERE true
       ON CONFLICT(id) DO UPDATE SET story_key = excluded.story_key WHERE articles.story_key != excluded.story_key`
    ).bind(body.articles)
  );
  stmts.push(env.DB.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('feed', ?1)").bind(body.meta));

  const res = await env.DB.batch(stmts);
  const n = body.stories.length;
  const written = res.slice(0, n).reduce((acc, r) => acc + (r.meta.changes ?? 0), 0);
  return json({ received: n, written, articles: res[n].meta.changes ?? 0 });
}

// Espectro editorial (rótulo do veículo) em escala numérica: -2 esquerda … +2 direita
const SV = `CASE spectrum WHEN 'left' THEN -2 WHEN 'center-left' THEN -1 WHEN 'center' THEN 0 WHEN 'center-right' THEN 1 WHEN 'right' THEN 2 END`;
// Fontes científicas não têm espectro político: ficam fora das métricas por espectro
const POLITICAL = `category IS NOT 'ciencia'`;
const STATS_TTL_MS = 3 * 3600_000; // agregações varrem a tabela toda: recalcula no máx. a cada 3h (cota de leituras do D1 grátis)

async function computeStats(env: Env) {
  const q = <T>(sql: string) => env.DB.prepare(sql).all<T>().then((r) => r.results);
  const [totals, bySpectrum, bySource, lean, sourceCats, coverage, words] = await Promise.all([
    q<Record<string, number | string>>(
      `SELECT COUNT(*) articles, COUNT(DISTINCT story_key) stories, COUNT(DISTINCT source_id) sources, MIN(published_at) first, MAX(published_at) last FROM articles`
    ),
    q(
      `SELECT spectrum, COUNT(*) articles, COUNT(DISTINCT story_key) stories, AVG(subjectivity) subjectivity,
              AVG(subjectivity > 0) loaded_rate, AVG(sentiment != 'neutral') sensational_rate
       FROM articles WHERE spectrum IS NOT NULL AND ${POLITICAL} GROUP BY spectrum`
    ),
    // exclusive_rate: fração das pautas do veículo que nenhum outro veículo cobriu
    q(
      `WITH st AS (SELECT story_key, COUNT(DISTINCT source_id) n FROM articles GROUP BY story_key)
       SELECT a.source_id, MAX(a.source_name) source_name, MAX(a.spectrum) spectrum, COUNT(*) articles,
              COUNT(DISTINCT a.story_key) stories, AVG(a.subjectivity) subjectivity, AVG(a.subjectivity > 0) loaded_rate,
              AVG(a.sentiment != 'neutral') sensational_rate,
              COUNT(DISTINCT CASE WHEN st.n = 1 THEN a.story_key END) * 1.0 / COUNT(DISTINCT a.story_key) exclusive_rate
       FROM articles a JOIN st USING (story_key) GROUP BY a.source_id`
    ),
    // Viés de agenda medido: espectro médio dos OUTROS veículos que cobrem as mesmas pautas
    q(
      `WITH ss AS (SELECT DISTINCT story_key, source_id, ${SV} v FROM articles WHERE spectrum IS NOT NULL AND ${POLITICAL}),
            st AS (SELECT story_key, SUM(v) s, COUNT(*) n FROM ss GROUP BY story_key)
       SELECT ss.source_id, AVG((st.s - ss.v) * 1.0 / (st.n - 1)) agenda_lean, COUNT(*) shared_stories
       FROM ss JOIN st USING (story_key) WHERE st.n > 1 GROUP BY ss.source_id`
    ),
    q<{ source_id: string; category: string; n: number }>(
      `SELECT source_id, category, COUNT(*) n FROM articles GROUP BY source_id, category`
    ),
    // Pontos cegos: pautas cobertas só por um lado do espectro
    q(
      `WITH st AS (SELECT story_key, MIN(${SV}) lo, MAX(${SV}) hi, COUNT(DISTINCT source_id) n FROM articles WHERE ${POLITICAL} GROUP BY story_key)
       SELECT CASE WHEN n = 1 THEN 'single' WHEN hi < 0 THEN 'left_only' WHEN lo > 0 THEN 'right_only'
                   WHEN lo < 0 AND hi > 0 THEN 'both_sides' ELSE 'center_mixed' END kind, COUNT(*) stories
       FROM st GROUP BY kind`
    ),
    q(
      `SELECT CASE WHEN ${SV} < 0 THEN 'esquerda' WHEN ${SV} > 0 THEN 'direita' ELSE 'centro' END side, w.value word, COUNT(*) n
       FROM articles, json_each(articles.loaded_words) w
       WHERE articles.subjectivity > 0 AND ${POLITICAL} GROUP BY side, word ORDER BY n DESC LIMIT 120`
    ),
  ]);

  // Divergência de pauta: distância (variação total, 0–1) entre o mix de editorias do veículo e o da mídia como um todo
  const global: Record<string, number> = {};
  const perSource: Record<string, Record<string, number>> = {};
  for (const r of sourceCats) {
    const c = r.category ?? "outros";
    global[c] = (global[c] ?? 0) + r.n;
    (perSource[r.source_id] ??= {})[c] = r.n;
  }
  const gTotal = Object.values(global).reduce((a, b) => a + b, 0) || 1;
  const leanBy = Object.fromEntries((lean as { source_id: string }[]).map((r) => [r.source_id, r]));
  const sources = (bySource as Record<string, any>[]).map((s) => {
    const cats = perSource[s.source_id] ?? {};
    const sTotal = Object.values(cats).reduce((a, b) => a + b, 0) || 1;
    const keys = new Set([...Object.keys(global), ...Object.keys(cats)]);
    let tv = 0;
    for (const k of keys) tv += Math.abs((cats[k] ?? 0) / sTotal - (global[k] ?? 0) / gTotal);
    return { ...s, ...leanBy[s.source_id], agenda_divergence: tv / 2, categories: cats };
  });

  return {
    computed_at: new Date().toISOString(),
    totals: totals[0],
    by_spectrum: bySpectrum,
    coverage,
    categories: global,
    sources,
    loaded_words: words,
  };
}

// GET /prisma/api/stats — estatísticas agregadas de todo o acervo (cache de 3h no meta)
async function stats(env: Env): Promise<Response> {
  const cached = await env.DB.prepare("SELECT value FROM meta WHERE key = 'stats'").first<string>("value");
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - Date.parse(parsed.computed_at) < STATS_TTL_MS) return json(parsed);
  }
  const fresh = await computeStats(env);
  await env.DB.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('stats', ?1)").bind(JSON.stringify(fresh)).run();
  return json(fresh);
}

const CAT_COUNTS_TTL_MS = 30 * 60_000; // evita full scan de stories em cada abertura da capa (cota de 5M leituras/dia do D1 grátis)

// GET /prisma/api/stories?limit=60&before=<latest_pub>&category=<cat>
async function listStories(url: URL, env: Env): Promise<Response> {
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 60, 1), 200);
  const before = url.searchParams.get("before");
  const category = url.searchParams.get("category");
  const { results } = await env.DB.prepare(
    `SELECT latest_pub, data FROM stories
     WHERE (?1 IS NULL OR latest_pub < ?1) AND (?2 IS NULL OR category = ?2)
     ORDER BY latest_pub DESC LIMIT ?3`
  )
    .bind(before, category, limit)
    .all<{ latest_pub: string; data: string }>();

  // Monta o JSON por concatenação: `data` já é JSON, e parsear ~1 MB estoura a CPU do plano grátis
  const next_before = results.length === limit ? results[results.length - 1].latest_pub : null;
  let meta: string | null = null;
  let total_stories: number | undefined;
  let category_counts: Record<string, number> | undefined;

  if (!before) {
    const { results: metaRows } = await env.DB.prepare(
      "SELECT key, value FROM meta WHERE key IN ('feed', 'cat_counts')"
    ).all<{ key: string; value: string }>();
    const byKey = Object.fromEntries(metaRows.map((r) => [r.key, r.value]));
    meta = byKey.feed ?? null;

    let cachedCounts: { computed_at: number; total_stories: number; category_counts: Record<string, number> } | null = null;
    if (byKey.cat_counts) {
      try {
        const parsed = JSON.parse(byKey.cat_counts);
        if (parsed && Date.now() - Number(parsed.computed_at) < CAT_COUNTS_TTL_MS) {
          cachedCounts = parsed;
        }
      } catch {
        cachedCounts = null;
      }
    }

    if (cachedCounts) {
      total_stories = cachedCounts.total_stories;
      category_counts = cachedCounts.category_counts;
    } else {
      const { results: cats } = await env.DB.prepare("SELECT category, COUNT(*) n FROM stories GROUP BY category").all<{ category: string | null; n: number }>();
      category_counts = Object.fromEntries(cats.map((c) => [c.category ?? "brasil", c.n]));
      total_stories = cats.reduce((acc, c) => acc + c.n, 0);
      await env.DB.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('cat_counts', ?1)")
        .bind(JSON.stringify({ computed_at: Date.now(), total_stories, category_counts }))
        .run();
    }
  }
  const head = JSON.stringify({ count: results.length, next_before, total_stories, category_counts, sources_count: sources.length }).slice(0, -1);
  const tail = meta && meta.startsWith("{") && meta.length > 2 ? `,${meta.slice(1, -1)}` : "";
  const body = `${head},"stories":[${results.map((r) => r.data).join(",")}]${tail}}`;
  return new Response(body, {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=30" },
  });
}

// GET /prisma/api/search?q=<termo> — limita varredura às 1.000 pautas mais recentes (usa índice stories_pub e protege cota do D1 grátis)
async function searchStories(url: URL, env: Env): Promise<Response> {
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return json({ query: q, count: 0, stories: [] });
  const pattern = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  const { results } = await env.DB.prepare(
    `SELECT data FROM (
       SELECT latest_pub, data FROM stories ORDER BY latest_pub DESC LIMIT 1000
     ) WHERE data LIKE ?1 ESCAPE '\\' ORDER BY latest_pub DESC LIMIT 30`
  )
    .bind(pattern)
    .all<{ data: string }>();
  const head = JSON.stringify({ query: q, count: results.length }).slice(0, -1);
  const body = `${head},"stories":[${results.map((r) => r.data).join(",")}]}`;
  return new Response(body, {
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60" },
  });
}

// GET /prisma/api/trends & /prisma/api/live/channels (lidos do cache 'feed' no meta)
async function metaFeedSlice(
  env: Env,
  field: "trends" | "live_channels",
  outKey: "trends" | "channels"
): Promise<Response> {
  const raw = await env.DB.prepare("SELECT value FROM meta WHERE key = 'feed'").first<string>("value");
  if (!raw) return json({ updated_at: new Date().toISOString(), [outKey]: [] });
  const parsed = JSON.parse(raw) as { updated_at?: string; trends?: unknown[]; live_channels?: unknown[] };
  return new Response(
    JSON.stringify({
      updated_at: parsed.updated_at ?? new Date().toISOString(),
      [outKey]: parsed[field] ?? [],
    }),
    {
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=300" },
    }
  );
}

function xmlEsc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(iso: string | null | undefined): string {
  const ms = iso ? Date.parse(iso) : NaN;
  return Number.isFinite(ms) ? new Date(ms).toUTCString() : new Date().toUTCString();
}

// GET /prisma/feed.xml & /prisma/api/rss — RSS 2.0 das 30 pautas mais recentes no D1
async function rssFeed(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    `SELECT key, latest_pub, data FROM stories ORDER BY latest_pub DESC LIMIT 30`
  ).all<{ key: string; latest_pub: string; data: string }>();

  const items: string[] = [];
  for (const row of results) {
    try {
      const s = JSON.parse(row.data) as {
        id?: string;
        title?: string;
        category?: string;
        neutral_summary?: string;
        consensus_facts?: string[];
        blindspot_warning?: string;
        source_count?: number;
        articles?: unknown[];
      };
      const key = s.id || row.key;
      const title = s.title || "Pauta PRISMA";
      const link = `https://pchaves.org/prisma/#comparador?storyId=${key}`;
      const srcCount = s.source_count ?? s.articles?.length ?? 1;
      const parts = [s.neutral_summary || title, `Cobertura: ${srcCount} veículo(s) confirmam o fato.`];
      if (Array.isArray(s.consensus_facts) && s.consensus_facts.length > 0) {
        parts.push(`Consenso: ${s.consensus_facts.slice(0, 3).join(" | ")}`);
      }
      if (s.blindspot_warning) parts.push(s.blindspot_warning);

      items.push(
        `    <item>\n` +
          `      <title>${xmlEsc(title)}</title>\n` +
          `      <link>${xmlEsc(link)}</link>\n` +
          `      <guid isPermaLink="false">${xmlEsc(`prisma-${key}`)}</guid>\n` +
          `      <category>${xmlEsc(s.category || "brasil")}</category>\n` +
          `      <pubDate>${toRfc822(row.latest_pub)}</pubDate>\n` +
          `      <description>${xmlEsc(parts.join(" — "))}</description>\n` +
          `    </item>`
      );
    } catch {
      // ignora registro malformado
    }
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0">\n` +
    `  <channel>\n` +
    `    <title>PRISMA — A Mesma História, Todos os Ângulos</title>\n` +
    `    <link>https://pchaves.org/prisma/</link>\n` +
    `    <description>Agregador jornalístico multi-fonte, síntese neutra, consenso factual e comparação de enquadramentos.</description>\n` +
    `    <language>pt-BR</language>\n` +
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n` +
    `${items.join("\n")}\n` +
    `  </channel>\n` +
    `</rss>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(watch(env, Date.now()));
  },

  // Proxy do GitHub Pages: pchaves.org/prisma/* -> perfeitochaves.github.io/prisma/*
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/prisma") return Response.redirect(`${url.origin}/prisma/`, 301);
    if (url.pathname === "/prisma/api/ingest" && request.method === "POST")
      return ingest(request, env).catch((e) => json({ error: String(e) }, 500));
    if (url.pathname === "/prisma/api/stories") return listStories(url, env);
    if (url.pathname === "/prisma/api/search") return searchStories(url, env);
    if (url.pathname === "/prisma/api/trends") return metaFeedSlice(env, "trends", "trends");
    if (url.pathname === "/prisma/api/live/channels") return metaFeedSlice(env, "live_channels", "channels");
    if (url.pathname === "/prisma/api/stats") return stats(env);
    if (url.pathname === "/prisma/feed.xml" || url.pathname === "/prisma/api/rss") return rssFeed(env);
    const path = url.pathname.startsWith("/prisma/") ? url.pathname : `/prisma${url.pathname}`;
    return fetch(ORIGIN + path + url.search, {
      method: request.method,
      headers: request.headers,
      cf: { cacheEverything: true, cacheTtl: 60 },
    });
  },
};

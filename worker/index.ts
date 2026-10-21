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
const MIN_GAP_MS = 5 * 60_000; // intervalo mínimo entre disparos do workflow

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

type Article = { id: string; published_at?: string | null; created_at?: string | null };
type ApiStory = { id: number | string; category?: string; updated_at?: string; articles?: Article[] };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=30" },
  });

async function sha1(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// O SQLite do Action é recriado a cada run, então o id numérico da pauta muda.
// Chave estável: o artigo mais antigo do cluster (artigos novos entram depois dele).
function storyKeys(s: ApiStory) {
  const arts = (s.articles ?? []).map((a) => ({ id: a.id, pub: a.published_at || a.created_at || "" }));
  arts.sort((a, b) => a.pub.localeCompare(b.pub) || a.id.localeCompare(b.id));
  const key = arts[0]?.id ?? `s${s.id}`;
  const latest = arts.reduce((m, a) => (a.pub > m ? a.pub : m), "") || s.updated_at || new Date().toISOString();
  return { key, latest };
}

// POST /prisma/api/ingest — chamado pelo GitHub Action com as pautas do ciclo
async function ingest(request: Request, env: Env): Promise<Response> {
  if (request.headers.get("Authorization") !== `Bearer ${env.INGEST_TOKEN}`) return json({ error: "unauthorized" }, 401);
  const body = (await request.json()) as { stories: ApiStory[]; stats?: unknown; live_channels?: unknown; updated_at?: string };

  const stmts: D1PreparedStatement[] = [];
  for (const s of body.stories ?? []) {
    const { key, latest } = storyKeys(s);
    const data = JSON.stringify({ ...s, id: key });
    // Só regrava a linha se o conteúdo mudou (economiza escritas do plano grátis)
    stmts.push(
      env.DB.prepare(
        `INSERT INTO stories (key, category, latest_pub, hash, data) VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(key) DO UPDATE SET category = excluded.category, latest_pub = excluded.latest_pub, hash = excluded.hash, data = excluded.data
         WHERE stories.hash != excluded.hash`
      ).bind(key, s.category ?? null, latest, await sha1(data), data)
    );
  }
  const meta = { stats: body.stats ?? {}, live_channels: body.live_channels ?? [], updated_at: body.updated_at ?? new Date().toISOString() };
  stmts.push(env.DB.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('feed', ?1)").bind(JSON.stringify(meta)));

  const res = await env.DB.batch(stmts);
  const written = res.slice(0, -1).reduce((n, r) => n + (r.meta.changes ?? 0), 0);
  return json({ received: stmts.length - 1, written });
}

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

  const stories = results.map((r) => JSON.parse(r.data));
  const next_before = results.length === limit ? results[results.length - 1].latest_pub : null;
  const page: Record<string, unknown> = { count: stories.length, stories, next_before };
  if (!before) {
    const meta = await env.DB.prepare("SELECT value FROM meta WHERE key = 'feed'").first<string>("value");
    Object.assign(page, meta ? JSON.parse(meta) : {});
  }
  return json(page);
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(watch(env, Date.now()));
  },

  // Proxy do GitHub Pages: pchaves.org/prisma/* -> perfeitochaves.github.io/prisma/*
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/prisma") return Response.redirect(`${url.origin}/prisma/`, 301);
    if (url.pathname === "/prisma/api/ingest" && request.method === "POST") return ingest(request, env);
    if (url.pathname === "/prisma/api/stories") return listStories(url, env);
    const path = url.pathname.startsWith("/prisma/") ? url.pathname : `/prisma${url.pathname}`;
    return fetch(ORIGIN + path + url.search, {
      method: request.method,
      headers: request.headers,
      cf: { cacheEverything: true, cacheTtl: 60 },
    });
  },
};

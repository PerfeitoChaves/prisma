import sources from "../backend/ingestion/sources.json";

interface Env {
  STATE: KVNamespace;
  GITHUB_TOKEN: string;
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

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(watch(env, Date.now()));
  },

  // Proxy do GitHub Pages: pchaves.org/prisma/* -> perfeitochaves.github.io/prisma/*
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/prisma") return Response.redirect(`${url.origin}/prisma/`, 301);
    const path = url.pathname.startsWith("/prisma/") ? url.pathname : `/prisma${url.pathname}`;
    return fetch(ORIGIN + path + url.search, {
      method: request.method,
      headers: request.headers,
      cf: { cacheEverything: true, cacheTtl: 60 },
    });
  },
};

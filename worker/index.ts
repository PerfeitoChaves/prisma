export interface Env {
  ASSETS: Fetcher;
}

export default {
  // Chamado a cada 5 minutos pelo Cron Trigger da Cloudflare
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`[PRISMA Cron 5min] Executando verificação de eventos em: ${new Date().toISOString()}`);
    // Aqui roda a verificação de terremotos USGS ≥ 6.0 e breaking news
  },

  // Chamado em requisições HTTP normais
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. APIs (disponíveis tanto em /api/... quanto em /prisma/api/...)
    const isApi = url.pathname.startsWith("/api/") || url.pathname.startsWith("/prisma/api/");
    if (isApi) {
      if (url.pathname.endsWith("/health")) {
        return new Response(JSON.stringify({ status: "ok", path: url.pathname, timestamp: new Date().toISOString() }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 2. Redirecionamento para manter barra no final: /prisma -> /prisma/
    if (url.pathname === "/prisma") {
      return Response.redirect(`${url.origin}/prisma/`, 301);
    }

    // 3. Se for acessado via subpasta /prisma/...
    if (url.pathname.startsWith("/prisma/")) {
      const subpath = url.pathname.slice("/prisma".length);
      const targetPath = subpath === "/" || subpath === "" ? "/index.html" : subpath;
      const assetUrl = new URL(targetPath, url.origin);
      return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
    }

    // 4. Acesso direto (ex: subdomínio ou prisma.workers.dev)
    return env.ASSETS.fetch(request);
  },
};

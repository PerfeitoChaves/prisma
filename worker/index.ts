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

    // Rotas de API
    if (url.pathname === "/api/health") {
      return new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Se não for rota da API, entrega os arquivos estáticos do PRISMA (docs/)
    return env.ASSETS.fetch(request);
  },
};

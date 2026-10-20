// Proxy do GitHub Pages: pchaves.org/prisma/* -> perfeitochaves.github.io/prisma/*
const ORIGIN = "https://perfeitochaves.github.io";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/prisma") {
      return Response.redirect(`${url.origin}/prisma/`, 301);
    }

    // Rota fora de /prisma (ex.: prisma.<conta>.workers.dev/): serve a raiz do app
    const path = url.pathname.startsWith("/prisma/") ? url.pathname : `/prisma${url.pathname}`;
    return fetch(ORIGIN + path + url.search, {
      method: request.method,
      headers: request.headers,
      cf: { cacheEverything: true, cacheTtl: 60 },
    });
  },
};

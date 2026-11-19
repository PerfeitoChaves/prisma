# 📐 PRISMA — A Mesma História, Todos os Ângulos

O **PRISMA** (antigo *Fatos Cruzados*) é uma plataforma jornalística pessoal, sem anúncios, sem assinaturas e **100% operada em planos gratuitos** (GitHub Actions + Cloudflare Workers & D1 + GitHub Pages). O sistema agrega notícias em tempo real de **101 veículos do Brasil e do Mundo** (incluindo 15 periódicos científicos e servidores de preprints), agrupa matérias sobre o mesmo acontecimento (*cross-category clustering* com `AgglomerativeClustering`), analisa enquadramentos editoriais e expõe o consenso factual lado a lado.

---

## ✨ Funcionalidades Principais

1. **⚡ Giro Ultra-Rápido em 2 Linhas & Modo Noturno**:
   - Resumos objetivos focados em fatos centrais, percentuais e placares, com ordenação cronológica real e alternância entre tema **Papel Claro** e **Jornal Noturno**.
   - Fita de cotações reais no topo (**Dólar, Euro, Bitcoin, Selic, Ibovespa e Petróleo WTI**) coletadas em APIs públicas gratuitas.

2. **🔍 Comparador Editorial & Síntese Multi-Fonte**:
   - Agrupamento *cross-category* (unindo matérias de diferentes editorias sobre o mesmo fato) e clustering dedicado para **Ciência & Papers**.
   - Síntese neutra com suporte opcional a **Gemini Free Tier (`gemini-2.5-flash`)**, **Groq Free Tier (`llama-3.3-70b-versatile`)** ou **Ollama local**, com fallback determinístico gratuito.
   - Botão de compartilhamento direto por link (`#comparador?storyId=...`) e Web Share API no celular.

3. **📊 Observatório de Viés & Saúde dos Feeds**:
   - Estatísticas históricas sobre todo o acervo no D1: subjetividade, sensacionalismo, pontos cegos por espectro, *viés de agenda medido* e *divergência de pauta*.
   - Monitoramento em tempo real da saúde das 101 fontes RSS no último ciclo de coleta.

4. **📺 Central Multimídia Ao Vivo (Lives & Rádios)**:
   - 6 canais de TV de notícias (BandNews, CNN Brasil, Record News, Jovem Pan News, TV Brasil, SBT News) com resolução dinâmica de lives do YouTube.
   - 7 rádios all-news (CBN SP/RJ, BandNews FM, Jovem Pan FM, Rádio Gaúcha, Bandeirantes, Eldorado).
   - **Mini-Player Flutuante Persistente (PiP)** contínuo durante a navegação.

5. **⚡ Radar de Tendências do X & Mapa de Tensões Geopolíticas**:
   - Tendências brasileiras coletadas automaticamente e cruzadas com o acervo editorial via busca direta no D1 (`/prisma/api/search`).
   - Visualização geopolítica interativa com blocos de cobertura (`west`, `east`, `global_south`).

6. **📰 101 Veículos Monitorados (8 Espectros) & Feed RSS Próprio**:
   - 86 veículos jornalísticos nacionais e internacionais (com tradução assíncrona gratuita para português) + 15 fontes de **Ciência & Papers** (Nature, Scientific American, Quanta, NASA, arXiv, bioRxiv, medRxiv, Pesquisa FAPESP, Jornal da USP, etc.).
   - Feed RSS 2.0 próprio disponível em `/prisma/feed.xml` e `/prisma/api/rss`.

7. **📱 PWA Mobile-First com Suporte Offline**:
   - Bundle `index.html` otimizado (~925 KB / ~257 KB gzip) com Service Worker v3 cacheando navegação e respostas da API (`/prisma/api/*`) para leitura offline.

---

## 🏗️ Arquitetura 100% Gratuita

| Camada | Tecnologia | Papel |
| :--- | :--- | :--- |
| **Coleta & NLP** | GitHub Actions (`update-news.yml`) | Roda testes (`backend/tests`), coleta 101 RSS, agrupa via TF-IDF + `AgglomerativeClustering`, sintetiza e envia em lotes para o D1. |
| **API & Edge** | Cloudflare Workers + KV + D1 (`worker/index.ts`) | Monitora novidades nos feeds RSS, dispara o workflow sob demanda, serve `/api/stories`, `/api/search`, `/api/stats`, `/api/trends`, `/api/live/channels`, `/feed.xml` e faz retenção automática (120 dias). |
| **Frontend** | React 19 + Tailwind 4 + Vite (`client/` → `docs/`) | Interface estática hospedada gratuitamente no GitHub Pages e servida sob `pchaves.org/prisma/`. |

---

## 🚀 Como Executar Localmente

### Forma Rápida (Linux / macOS)
```bash
./run.sh
```

### Execução Manual
```bash
cd /caminho/para/prisma
python3 -m venv .venv
source .venv/bin/activate  # no Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Coletar notícias e agrupar
python3 -m backend.ingestion.collector
python3 -c "from backend.analysis.clustering import run_clustering; run_clustering()"

# Iniciar o servidor FastAPI em http://localhost:8000
python3 -m backend.main
```

### Build do Frontend & Deploy do Worker
```bash
# Compilar frontend (gera frontend/ e copia para docs/)
npm --prefix client ci
npm --prefix client run build

# Publicar Cloudflare Worker (requer login gratuito)
npx -y wrangler login
npx -y wrangler deploy
```

---

## ⚙️ Personalização de Fontes

Edite `backend/ingestion/sources.json` para adicionar ou atualizar veículos. Exemplo:

```json
{
  "id": "meu_jornal",
  "name": "Nome do Jornal",
  "url": "https://url-do-feed-rss.xml",
  "rss": "https://url-do-feed-rss.xml",
  "category": "brasil",
  "spectrum": "centro",
  "spectrum_label": "Centro / Factual",
  "spectrum_code": "center",
  "country": "BR",
  "language": "pt",
  "geopolitical_bloc": "global_south",
  "geopolitical_bloc_label": "Sul Global & Neutros"
}
```

---

## 🧪 Testes Automatizados

```bash
PYTHONPATH=. python3 -m unittest discover -s backend/tests -v
```
Os testes também são executados automaticamente no GitHub Actions antes de cada ciclo de atualização.

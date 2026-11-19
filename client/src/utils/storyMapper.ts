import {
  type Coverage,
  type Divergence,
  type Story,
  type ThemeId,
  outletById,
} from "../data/news";

export interface ApiArticle {
  id: string;
  source_id: string;
  source_name: string;
  title: string;
  title_original?: string;
  link: string;
  summary?: string;
  published_at?: string;
  category?: string;
  spectrum?: string;
  loaded_words?: string[] | string;
  subjectivity_score?: number;
  sentiment_label?: string;
}

export interface ApiStory {
  id: number | string;
  title: string;
  category?: string;
  topic?: string;
  topic_slug?: string;
  created_at?: string;
  updated_at?: string;
  article_count: number;
  source_count: number;
  spectrum_distribution?: Record<string, number>;
  blindspot_warning?: string;
  neutral_summary?: string;
  consensus_facts?: string[] | string;
  divergent_points?: any;
  framing_contrast?: any;
  is_ai_generated?: number | boolean;
  articles?: ApiArticle[];
}

function cleanText(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/\ufffd/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/\(Leia mais[^)]*\)/gi, "")
    .replace(/Leia mais:?.*$/gi, "")
    .replace(/^VÍDEOS:\s*/i, "")
    .trim();
}

function parseIsoMs(isoString?: string): number {
  if (!isoString) return 0;
  // Normaliza ISO sem fuso (salvo em UTC pelo backend) adicionando Z
  const hasTz = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(isoString);
  const ms = Date.parse(hasTz ? isoString : `${isoString}Z`);
  return Number.isFinite(ms) ? ms : 0;
}

function formatTime(isoString?: string): string {
  const ms = parseIsoMs(isoString);
  if (!ms) return "hoje";
  try {
    const d = new Date(ms);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - ms) / 60_000);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    const hhmm = `${h}:${m}`;

    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) {
      if (diffMin >= 1 && diffMin < 60) return `há ${diffMin} min`;
      return hhmm;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate();
    if (isYesterday) return `ontem · ${hhmm}`;

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm} · ${hhmm}`;
  } catch {
    return "hoje";
  }
}

export function mapCategoryToTheme(cat?: string, slug?: string): ThemeId {
  const c = (cat || slug || "").toLowerCase();
  if (c.includes("polit") || c.includes("eleic") || c.includes("poder")) return "politica";
  if (c.includes("econ") || c.includes("merc") || c.includes("finan")) return "economia";
  if (c.includes("guer") || c.includes("conflito") || c.includes("defes")) return "guerra";
  if (c.includes("cienc") || c.includes("paper")) return "ciencia";
  if (c.includes("tec") || c.includes("ia")) return "tecnologia";
  if (c.includes("jog") || c.includes("game") || c.includes("esport")) return "jogos";
  if (c.includes("mund") || c.includes("internac") || c.includes("global")) return "mundo";
  return "brasil";
}

/**
 * Cria o resumo ultra-rápido de no máximo 2 linhas,
 * focado em fatos centrais, percentuais, métricas e placares.
 * Exemplo do usuário: "Votação Datafolha — Lula 47%, Flávio 53%"
 */
function buildTwoLineBrief(
  title: string,
  consensus: string[],
  neutralSummary?: string,
  articles?: ApiArticle[]
): string {
  const cleanTitle = cleanText(title);

  // Procura por fato consensual com dados numéricos
  const numberRegex = /(\d+[\.,]?\d*%|\bR\$|\bUS\$|\bvotos?\b|\bcontra\b|\baprovad[oa]\b|\bempate\b|\blidera\b)/i;
  
  if (consensus && consensus.length > 0) {
    const dataFact = consensus.find((c) => numberRegex.test(c));
    if (dataFact) {
      const cleanFact = cleanText(dataFact);
      if (cleanFact.length <= 150) {
        return cleanFact;
      }
    }
  }

  // Tenta extrair a primeira frase do resumo neutro se tiver dados
  if (neutralSummary) {
    const firstSentence = cleanText(neutralSummary.split(/[.!?]\s+/)[0]);
    if (firstSentence && firstSentence.length <= 150 && numberRegex.test(firstSentence)) {
      return firstSentence;
    }
  }

  // Se o título já tiver números/dados concretos
  if (numberRegex.test(cleanTitle)) {
    return cleanTitle;
  }

  // Tenta o primeiro artigo com dados numéricos no resumo ou título
  if (articles && articles.length > 0) {
    for (const a of articles) {
      const artSumm = cleanText(a.summary);
      if (artSumm && numberRegex.test(artSumm)) {
        const first = artSumm.split(/[.!?]\s+/)[0];
        if (first && first.length >= 25 && first.length <= 150) {
          return `${cleanTitle}: ${first}`;
        }
      }
    }
  }

  // Fallback compacto direto ao ponto
  if (neutralSummary) {
    const s = cleanText(neutralSummary.split(/[.!?]\s+/)[0]);
    if (s.length > 10 && s.length <= 140) return s;
  }

  return cleanTitle;
}

export function mapApiStoryToStory(apiStory: ApiStory): Story {
  const id = String(apiStory.id);
  const articles = apiStory.articles || [];
  const theme = mapCategoryToTheme(apiStory.category, apiStory.topic_slug);
  const title = cleanText(apiStory.title);

  // Consenso
  let consensus: string[] = [];
  if (Array.isArray(apiStory.consensus_facts)) {
    consensus = apiStory.consensus_facts.map(cleanText).filter(Boolean);
  } else if (typeof apiStory.consensus_facts === "string") {
    try {
      const parsed = JSON.parse(apiStory.consensus_facts);
      if (Array.isArray(parsed)) consensus = parsed.map(cleanText).filter(Boolean);
    } catch {
      consensus = [cleanText(apiStory.consensus_facts)].filter(Boolean);
    }
  }

  if (consensus.length === 0) {
    if (articles.length >= 2) {
      consensus.push(
        `Fato convergente confirmado por ${articles.length} redações distintas sem contestação do núcleo do acontecimento.`
      );
    }
    const lead = cleanText(articles[0]?.summary);
    if (lead) {
      const first = lead.split(/[.!?]\s+/)[0];
      if (first) consensus.push(first);
    }
  }

  // Resumo principal e Resumo Ultra-Rápido de 2 linhas
  const summary =
    cleanText(apiStory.neutral_summary) ||
    cleanText(articles[0]?.summary) ||
    title;

  const briefSummary = buildTwoLineBrief(
    title,
    consensus,
    apiStory.neutral_summary,
    articles
  );

  // Cobertura por veículo
  const coverage: Coverage[] = articles.map((a) => {
    // garante registro da fonte no cache do outletById
    const o = outletById(a.source_id, a.source_name);
    let loaded: string[] = [];
    if (Array.isArray(a.loaded_words)) {
      loaded = a.loaded_words;
    } else if (typeof a.loaded_words === "string") {
      try {
        loaded = JSON.parse(a.loaded_words);
      } catch {
        loaded = [];
      }
    }

    return {
      outletId: o.id,
      framing: a.sentiment_label || a.spectrum || "factual",
      headline: cleanText(a.title),
      quote: cleanText(a.summary) || cleanText(a.title),
      emphasized: loaded,
      omitted: [],
      url: a.link,
      published: formatTime(a.published_at),
    };
  });

  // Divergências
  const divergences: Divergence[] = [];
  if (Array.isArray(apiStory.divergent_points)) {
    for (const dp of apiStory.divergent_points) {
      if (typeof dp === "object" && dp !== null && dp.point) {
        divergences.push(dp as Divergence);
      } else if (typeof dp === "string" && dp.trim()) {
        divergences.push({
          point: cleanText(dp),
          positions: coverage.slice(0, 3).map((c) => ({
            outletId: c.outletId,
            take: c.headline,
          })),
        });
      }
    }
  }

  // Se não houver divergências explícitas salvas, monta contraste entre os ângulos das redações
  if (divergences.length === 0 && coverage.length >= 2) {
    divergences.push({
      point: "Ângulos de destaque nas manchetes",
      positions: coverage.slice(0, 3).map((c) => ({
        outletId: c.outletId,
        take: `“${c.headline}”`,
      })),
    });
  }

  const kicker = `${apiStory.topic || (theme.charAt(0).toUpperCase() + theme.slice(1))} · ${articles.length || 1} fontes`;
  const stamp = `${apiStory.source_count || articles.length || 1} veículos confirmam o fato`;

  const latestIso =
    articles.reduce<string | undefined>((best, a) => {
      if (!a.published_at) return best;
      if (!best) return a.published_at;
      return parseIsoMs(a.published_at) > parseIsoMs(best) ? a.published_at : best;
    }, undefined) ||
    apiStory.updated_at ||
    apiStory.created_at;

  const publishedAtMs = parseIsoMs(latestIso);

  return {
    id,
    theme,
    kicker,
    title,
    summary,
    briefSummary,
    readTime: Math.max(3, Math.min(10, Math.round((articles.length * 2) + 2))),
    time: formatTime(latestIso),
    publishedAtMs: publishedAtMs || undefined,
    isAiGenerated: Boolean(apiStory.is_ai_generated),
    stamp,
    consensus,
    divergences,
    blindSpot:
      cleanText(apiStory.blindspot_warning) ||
      "Nenhuma divergência grave de dados oficiais encontrada entre as redações monitoradas.",
    coverage,
  };
}

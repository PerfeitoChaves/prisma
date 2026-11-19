import type { Story } from "../data/news";

export function normalizeForMatch(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export interface HotspotSearchRule {
  /** Termo principal enviado a ./api/search?q=... no D1 */
  searchQuery: string;
  /** Palavras-chave normalizadas (sem acentos) para correlacionar matérias reais */
  keywords: string[];
}

export const HOTSPOT_RULES: Record<string, HotspotSearchRule> = {
  ormuz: {
    searchQuery: "ira",
    keywords: [
      "ormuz",
      "hormuz",
      "ira",
      "iran",
      "iraniano",
      "iraniana",
      "teera",
      "tehran",
      "golfo persico",
      "petroleiro",
      "opep",
    ],
  },
  ucrania: {
    searchQuery: "ucrania",
    keywords: [
      "ucrania",
      "ukraine",
      "ucranian",
      "russia",
      "russo",
      "russa",
      "putin",
      "zelensky",
      "kyiv",
      "kiev",
      "moscou",
      "kremlin",
      "otan",
      "nato",
      "donetsk",
      "crimeia",
    ],
  },
  taiwan: {
    searchQuery: "taiwan",
    keywords: [
      "taiwan",
      "taipe",
      "taipei",
      "tsmc",
      "mar da china",
      "xi jinping",
      "estreito de taiwan",
      "pequim",
    ],
  },
  mar_vermelho: {
    searchQuery: "iemen",
    keywords: [
      "mar vermelho",
      "red sea",
      "houthi",
      "houtis",
      "iemen",
      "yemen",
      "canal de suez",
      "suez",
      "bab el-mandeb",
    ],
  },
  gaza: {
    searchQuery: "israel",
    keywords: [
      "gaza",
      "israel",
      "israelense",
      "palestin",
      "hamas",
      "hezbollah",
      "libano",
      "beirute",
      "netanyahu",
      "cisjordania",
      "rafah",
      "oriente medio",
    ],
  },
  coreia: {
    searchQuery: "coreia",
    keywords: [
      "coreia do norte",
      "north korea",
      "pyongyang",
      "kim jong",
      "coreia do sul",
      "seul",
      "peninsula coreana",
    ],
  },
  sahel: {
    searchQuery: "sudao",
    keywords: [
      "sahel",
      "sudao",
      "sudan",
      "niger",
      "mali",
      "burkina",
      "chade",
      "cartum",
      "darfur",
    ],
  },
  essequibo: {
    searchQuery: "venezuela",
    keywords: [
      "essequibo",
      "guiana",
      "guyana",
      "maduro",
      "venezuela",
      "venezuelan",
      "caracas",
    ],
  },
};

function matchesKeyword(normalizedText: string, kw: string): boolean {
  if (kw.length <= 4 && !kw.includes(" ")) {
    // Fronteira de palavra para termos curtos (evita "ira" casar com "primeira" ou "feira")
    const re = new RegExp(`(?:^|[^a-z0-9])${kw}(?:$|[^a-z0-9])`);
    return re.test(normalizedText);
  }
  return normalizedText.includes(kw);
}

export function matchStoriesForHotspot(
  hotspotId: string,
  stories: Story[],
  relatedIds?: string[]
): Story[] {
  const rule = HOTSPOT_RULES[hotspotId];
  const targetIds = new Set((relatedIds || []).map((id) => id.toLowerCase().trim()));

  const matches = stories.filter((story) => {
    if (targetIds.has(story.id.toLowerCase())) return true;
    if (!rule) return false;
    const text = normalizeForMatch(
      `${story.title} ${story.summary} ${story.kicker || ""} ${(story.tags || []).join(" ")}`
    );
    return rule.keywords.some((kw) => matchesKeyword(text, kw));
  });

  return matches.sort((a, b) => (b.publishedAtMs ?? 0) - (a.publishedAtMs ?? 0));
}

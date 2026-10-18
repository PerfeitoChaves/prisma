import { outletById, type Story } from "../data/news";

export const BIAS_LABELS: Record<number, string> = {
  [-2]: "Esquerda",
  [-1]: "Centro-esquerda",
  0: "Centro",
  1: "Centro-direita",
  2: "Direita",
};

export const BIAS_COLORS: Record<number, string> = {
  [-2]: "#C1272D",
  [-1]: "#DE7A4F",
  0: "#8E887C",
  1: "#6C8EBF",
  2: "#2B50AA",
};

export const BIAS_ORDER = [-2, -1, 0, 1, 2] as const;

export type BiasSlice = { bias: number; count: number; pct: number };

export function outletToBias(outletId: string): number {
  const o = outletById(outletId);
  const s = o.spectrum;
  if (s < 28) return -2;
  if (s < 45) return -1;
  if (s <= 58) return 0;
  if (s < 78) return 1;
  return 2;
}

export function storyDistribution(story: Story): BiasSlice[] {
  const counts: Record<number, number> = {
    [-2]: 0,
    [-1]: 0,
    0: 0,
    1: 0,
    2: 0,
  };

  for (const c of story.coverage) {
    const b = outletToBias(c.outletId);
    counts[b] = (counts[b] ?? 0) + 1;
  }

  const total = Math.max(1, story.coverage.length);
  return BIAS_ORDER.map((bias) => ({
    bias,
    count: counts[bias] ?? 0,
    pct: Math.round(((counts[bias] ?? 0) / total) * 100),
  }));
}

export function computeBalanceScore(left: number, center: number, right: number): number {
  const total = left + center + right;
  if (total === 0) return 0;
  if (total === 1) return 18;

  const probs = [left / total, center / total, right / total].filter((p) => p > 0);
  const entropy = -probs.reduce((acc, p) => acc + p * Math.log2(p), 0);
  const maxEntropy = Math.log2(3);
  const entropyScore = Math.round((entropy / maxEntropy) * 100);

  const diversityBonus =
    left > 0 && right > 0 && center > 0 ? 15 : (left > 0 && right > 0) || (center > 0 && (left > 0 || right > 0)) ? 8 : 0;
  return Math.min(100, Math.max(0, Math.round(entropyScore * 0.85 + diversityBonus)));
}

export type CoverageVerdict = {
  label: string;
  detail: string;
  tone: "balanced" | "left" | "right" | "single" | "partial";
  balanceScore: number;
  readingTip: string;
};

export function coverageVerdict(story: Story): CoverageVerdict {
  const slices = storyDistribution(story);
  const left = (slices.find((s) => s.bias === -2)?.count ?? 0) + (slices.find((s) => s.bias === -1)?.count ?? 0);
  const center = slices.find((s) => s.bias === 0)?.count ?? 0;
  const right = (slices.find((s) => s.bias === 1)?.count ?? 0) + (slices.find((s) => s.bias === 2)?.count ?? 0);
  const total = Math.max(1, story.coverage.length);

  const balanceScore = computeBalanceScore(left, center, right);

  if (story.coverage.length <= 1) {
    return {
      label: "Fonte única",
      detail: "Por enquanto, apenas um veículo publicou sobre este fato.",
      tone: "single",
      balanceScore,
      readingTip: "Aguarde confirmação cruzada por outros veículos.",
    };
  }

  if (left >= 2 && right === 0 && center <= 1) {
    return {
      label: "Ponto cego da direita",
      detail: "A esquerda está cobrindo com ênfase, enquanto veículos de direita ignoram o tema.",
      tone: "left",
      balanceScore,
      readingTip: "Pergunte-se: o fato é menos relevante para esse público ou foi omitido?",
    };
  }

  if (right >= 2 && left === 0 && center <= 1) {
    return {
      label: "Ponto cego da esquerda",
      detail: "A direita está cobrindo com ênfase, enquanto veículos de esquerda ignoram o tema.",
      tone: "right",
      balanceScore,
      readingTip: "Observe se veículos do centro repercutiram os mesmos dados.",
    };
  }

  if (left > 0 && right > 0 && center > 0) {
    return {
      label: "Cobertura ampla",
      detail: "Esquerda, centro e direita cobrindo simultaneamente — ideal para comparar versões.",
      tone: "balanced",
      balanceScore,
      readingTip: "Compare as manchetes para checar quais termos e adjetivos cada lado escolheu.",
    };
  }

  const dominant = left / total > 0.6 ? "esquerda" : right / total > 0.6 ? "direita" : null;
  if (dominant) {
    return {
      label: `Predomínio de ${dominant}`,
      detail: `Maior volume de matérias vem de veículos de ${dominant}.`,
      tone: dominant === "esquerda" ? "left" : "right",
      balanceScore,
      readingTip: "Dê atenção aos relatos do lado minoritário para encontrar contrapontos.",
    };
  }

  return {
    label: "Cobertura parcial",
    detail: "Parte do espectro ainda não repercutiu o acontecimento.",
    tone: "partial",
    balanceScore,
    readingTip: "A cobertura pode evoluir nas próximas horas.",
  };
}

export function balanceLabel(score: number): string {
  if (score >= 80) return "Ampla e plural";
  if (score >= 60) return "Razoavelmente equilibrada";
  if (score >= 40) return "Parcial / inclinada";
  if (score >= 20) return "Fortemente unilateral";
  return "Fonte isolada";
}

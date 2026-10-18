export interface TrendItem {
  id: string;
  topic: string;
  volume: string;
  volume_numeric: number;
  status: "alta" | "estavel" | "explodindo";
  category: "politica" | "economia" | "brasil" | "mundo" | "tecnologia";
  context: string;
  url: string;
  traction?: "urgente" | "em_alta" | "pico" | "estavel" | string;
  rawVolume?: number;
  estimatedVolume?: string;
  xUrl?: string;
  hashtag?: string;
  relatedKeywords?: string[];
  matchedStoriesCount?: number;
}

export const DEFAULT_TRENDS: TrendItem[] = [
  {
    id: "trend_stf",
    topic: "#STF",
    volume: "185 mil posts",
    volume_numeric: 185000,
    status: "alta",
    traction: "em_alta",
    category: "politica",
    context: "Julgamentos e decisões recentes no Supremo Tribunal Federal com repercussão nacional.",
    url: "https://x.com/search?q=%23STF",
    relatedKeywords: ["stf", "supremo", "moraes", "julgamento", "tribunal", "decisão", "ministro"],
  },
  {
    id: "trend_reformatributaria",
    topic: "#ReformaTributária",
    volume: "98 mil posts",
    volume_numeric: 98000,
    status: "estavel",
    traction: "estavel",
    category: "politica",
    context: "Debates e regulamentação das leis complementares da reforma tributária no Congresso Nacional.",
    url: "https://x.com/search?q=%23ReformaTribut%C3%A1ria",
    relatedKeywords: ["reforma", "tributária", "tributaria", "impostos", "iva", "congresso", "tributos"],
  },
  {
    id: "trend_dolar",
    topic: "#Dólar",
    volume: "210 mil posts",
    volume_numeric: 210000,
    status: "explodindo",
    traction: "urgente",
    category: "economia",
    context: "Oscilações cambiais influenciadas pelo cenário fiscal doméstico e taxas internacionais.",
    url: "https://x.com/search?q=%23D%C3%B3lar",
    relatedKeywords: ["dólar", "dolar", "câmbio", "cambio", "moeda", "cotação", "fiscal", "real"],
  },
  {
    id: "trend_taxaselic",
    topic: "#TaxaSelic",
    volume: "142 mil posts",
    volume_numeric: 142000,
    status: "alta",
    traction: "em_alta",
    category: "economia",
    context: "Decisão do Copom e expectativas do mercado sobre a taxa básica de juros e controle da inflação.",
    url: "https://x.com/search?q=%23TaxaSelic",
    relatedKeywords: ["selic", "copom", "juros", "banco central", "bc", "inflação", "mercado"],
  },
  {
    id: "trend_copom",
    topic: "#Copom",
    volume: "75 mil posts",
    volume_numeric: 75000,
    status: "estavel",
    traction: "estavel",
    category: "economia",
    context: "Reunião de política monetária do Banco Central e projeções inflacionárias do Boletim Focus.",
    url: "https://x.com/search?q=%23Copom",
    relatedKeywords: ["copom", "banco central", "focus", "meta de inflação", "diretoria"],
  },
  {
    id: "trend_inteligenciaartificial",
    topic: "#InteligenciaArtificial",
    volume: "320 mil posts",
    volume_numeric: 320000,
    status: "explodindo",
    traction: "pico",
    category: "tecnologia",
    context: "Avanços em novos modelos generativos, semicondutores e discussões sobre regulação ética.",
    url: "https://x.com/search?q=%23InteligenciaArtificial",
    relatedKeywords: ["ia", "inteligência artificial", "openai", "nvidia", "tecnologia", "deep learning"],
  },
  {
    id: "trend_guerranoorientemedio",
    topic: "#GuerraNoOrienteMedio",
    volume: "410 mil posts",
    volume_numeric: 410000,
    status: "explodindo",
    traction: "urgente",
    category: "mundo",
    context: "Escalada de tensões geopolíticas, negociações diplomáticas e impactos na segurança internacional.",
    url: "https://x.com/search?q=%23GuerraNoOrienteMedio",
    relatedKeywords: ["guerra", "oriente médio", "israel", "gaza", "beirute", "onu", "cessar-fogo"],
  },
  {
    id: "trend_eleicoeseua",
    topic: "#EleicoesEUA",
    volume: "450 mil posts",
    volume_numeric: 450000,
    status: "explodindo",
    traction: "urgente",
    category: "mundo",
    context: "Disputas políticas nos Estados Unidos e impactos nas relações internacionais e comércio exterior.",
    url: "https://x.com/search?q=%23EleicoesEUA",
    relatedKeywords: ["eleições", "eua", "trump", "biden", "democratas", "republicanos", "geopolítica"],
  },
  {
    id: "trend_congressonacional",
    topic: "#CongressoNacional",
    volume: "115 mil posts",
    volume_numeric: 115000,
    status: "alta",
    traction: "em_alta",
    category: "politica",
    context: "Articulações partidárias e votações de projetos estratégicos na Câmara e no Senado.",
    url: "https://x.com/search?q=%23CongressoNacional",
    relatedKeywords: ["congresso", "senado", "câmara", "deputados", "parlamento", "votação", "planalto"],
  },
  {
    id: "trend_inflacao",
    topic: "#Inflacao",
    volume: "88 mil posts",
    volume_numeric: 88000,
    status: "estavel",
    traction: "estavel",
    category: "economia",
    context: "Divulgação dos índices IPCA e impacto nos preços de alimentos, combustíveis e serviços.",
    url: "https://x.com/search?q=%23Inflacao",
    relatedKeywords: ["inflação", "inflacao", "ipca", "preços", "alimentos", "consumo", "carestia"],
  },
  {
    id: "trend_petrobras",
    topic: "#Petrobras",
    volume: "160 mil posts",
    volume_numeric: 160000,
    status: "alta",
    traction: "em_alta",
    category: "economia",
    context: "Políticas de dividendos, plano de investimentos estratégicos e cotações do petróleo no mercado internacional.",
    url: "https://x.com/search?q=%23Petrobras",
    relatedKeywords: ["petrobras", "petróleo", "combustível", "estatais", "brent", "dividendos"],
  },
  {
    id: "trend_bolsadevalores",
    topic: "#BolsaDeValores",
    volume: "92 mil posts",
    volume_numeric: 92000,
    status: "estavel",
    traction: "estavel",
    category: "economia",
    context: "Comportamento do Ibovespa frente ao cenário fiscal brasileiro e movimentações de investidores globais.",
    url: "https://x.com/search?q=%23BolsaDeValores",
    relatedKeywords: ["bolsa", "ibovespa", "b3", "ações", "mercado financeiro", "investimentos"],
  },
  {
    id: "trend_amazonia",
    topic: "#Amazônia",
    volume: "105 mil posts",
    volume_numeric: 105000,
    status: "alta",
    traction: "em_alta",
    category: "brasil",
    context: "Ações de preservação ambiental, combate ao desmatamento e investimentos no Fundo Amazônia.",
    url: "https://x.com/search?q=%23Amaz%C3%B4nia",
    relatedKeywords: ["amazônia", "amazonia", "meio ambiente", "clima", "desmatamento", "fundo amazônia"],
  },
  {
    id: "trend_segurancapublica",
    topic: "#SegurançaPublica",
    volume: "82 mil posts",
    volume_numeric: 82000,
    status: "alta",
    traction: "em_alta",
    category: "brasil",
    context: "Operações integradas de segurança e debates sobre políticas penais nos estados.",
    url: "https://x.com/search?q=%23Seguran%C3%A7aPublica",
    relatedKeywords: ["segurança", "polícia", "combate ao crime", "justiça", "penal"],
  },
  {
    id: "trend_bigtech",
    topic: "#BigTech",
    volume: "130 mil posts",
    volume_numeric: 130000,
    status: "alta",
    traction: "em_alta",
    category: "tecnologia",
    context: "Investigações antitruste e novidades nos serviços das maiores corporações de tecnologia.",
    url: "https://x.com/search?q=%23BigTech",
    relatedKeywords: ["big tech", "google", "apple", "microsoft", "meta", "antitruste", "regulação"],
  },
];

export function formatTrendVolume(num: number): string {
  if (num <= 0) return "0 posts";
  if (num < 1_000) return `${num} posts`;
  if (num < 1_000_000) return `${Math.round(num / 1000)} mil posts`;
  return `${(num / 1_000_000).toFixed(1)} mi posts`.replace(".0", "");
}

import imgSelic from "../assets/img/cover-selic.jpg";
import imgCongress from "../assets/img/congress.jpg";
import imgChip from "../assets/img/chip.jpg";
import imgStadium from "../assets/img/stadium.jpg";

/* ============================================================
   FATOS CRUZADOS — acervo pessoal de cobertura comparada
   8 redações · 7 fatos · trechos verbatim + enquadramentos
   ============================================================ */

export type ThemeId =
  | "politica"
  | "economia"
  | "guerra"
  | "tecnologia"
  | "jogos"
  | "mundo"
  | "brasil"
  | "ciencia";

export interface Theme {
  id: ThemeId;
  label: string;
}

export const THEMES: Theme[] = [
  { id: "politica", label: "Política" },
  { id: "economia", label: "Economia" },
  { id: "guerra", label: "Guerra" },
  { id: "tecnologia", label: "Tecnologia" },
  { id: "jogos", label: "Jogos" },
  { id: "mundo", label: "Mundo" },
  { id: "brasil", label: "Brasil" },
  { id: "ciencia", label: "Ciência" },
];

export const themeLabel = (id: ThemeId): string =>
  THEMES.find((t) => t.id === id)?.label ?? id;

export type SpectrumCategory =
  | "esquerda"
  | "centro-esquerda"
  | "centro"
  | "centro-direita"
  | "direita"
  | "independentes"
  | "agências internacionais";

import type { GeopoliticalBloc } from "../types/geopolitics";
export type { GeopoliticalBloc };

export interface Outlet {
  id: string;
  name: string;
  short: string;
  /** 0 (esquerda) a 100 (direita) — posicionamento editorial médio */
  spectrum: number;
  color: string;
  site: string;
  spectrumCategory?: SpectrumCategory;
  spectrumLabel?: string;
  country?: string;
  flag?: string;
  geopoliticalBloc?: GeopoliticalBloc;
  geopolitical_bloc?: GeopoliticalBloc;
  geopoliticalBlocLabel?: string;
}

export const OUTLETS: Outlet[] = [
  /* ── ESQUERDA (8 fontes) ── */
  { id: "cartacapital", name: "CartaCapital", short: "CCA", spectrum: 22, color: "#c62828", site: "cartacapital.com.br", spectrumCategory: "esquerda", spectrumLabel: "Esquerda / Análise e Opinião", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "brasildefato", name: "Brasil de Fato", short: "BDF", spectrum: 18, color: "#b71c1c", site: "brasildefato.com.br", spectrumCategory: "esquerda", spectrumLabel: "Esquerda / Popular", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "brasil247", name: "Brasil 247", short: "247", spectrum: 16, color: "#b71c1c", site: "brasil247.com", spectrumCategory: "esquerda", spectrumLabel: "Esquerda / Política", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "intercept_br", name: "The Intercept Brasil", short: "INT", spectrum: 20, color: "#111111", site: "theintercept.com", spectrumCategory: "esquerda", spectrumLabel: "Esquerda / Investigativo", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "apublica", name: "Agência Pública", short: "PUB", spectrum: 24, color: "#2e7d32", site: "apublica.org", spectrumCategory: "esquerda", spectrumLabel: "Esquerda / Investigativo Independente", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "operamundi", name: "Opera Mundi", short: "OPM", spectrum: 19, color: "#c2185b", site: "operamundi.uol.com.br", spectrumCategory: "esquerda", spectrumLabel: "Esquerda / Internacional", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "revistaforum", name: "Revista Fórum", short: "FOR", spectrum: 17, color: "#d32f2f", site: "revistaforum.com.br", spectrumCategory: "esquerda", spectrumLabel: "Esquerda / Noticiário e Opinião", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "reporterbrasil", name: "Repórter Brasil", short: "REP", spectrum: 22, color: "#388e3c", site: "reporterbrasil.org.br", spectrumCategory: "esquerda", spectrumLabel: "Esquerda / Direitos Humanos e Clima", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  /* ── CENTRO-ESQUERDA (7 fontes) ── */
  { id: "folha", name: "Folha de S.Paulo", short: "FOL", spectrum: 34, color: "#8a2431", site: "folha.uol.com.br", spectrumCategory: "centro-esquerda", spectrumLabel: "Centro-Esquerda / Mainstream", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "uol", name: "UOL Notícias", short: "UOL", spectrum: 32, color: "#4a6fa5", site: "uol.com.br", spectrumCategory: "centro-esquerda", spectrumLabel: "Centro-Esquerda / Portal Geral", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "nexojornal", name: "Nexo Jornal", short: "NEX", spectrum: 36, color: "#2b580c", site: "nexojornal.com.br", spectrumCategory: "centro-esquerda", spectrumLabel: "Centro-Esquerda / Contexto e Gráficos", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "theguardian", name: "The Guardian", short: "GUA", spectrum: 32, color: "#005689", site: "theguardian.com", spectrumCategory: "centro-esquerda", spectrumLabel: "Centro-Esquerda / Internacional", country: "GB", flag: "🇬🇧", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "piaui", name: "Revista Piauí", short: "PIAU", spectrum: 35, color: "#6a1b9a", site: "piaui.folha.uol.com.br", spectrumCategory: "centro-esquerda", spectrumLabel: "Centro-Esquerda / Grande Reportagem", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "wired", name: "WIRED", short: "WIR", spectrum: 38, color: "#111111", site: "wired.com", spectrumCategory: "centro-esquerda", spectrumLabel: "Centro-Esquerda / Cultura Digital & Tech", country: "US", flag: "🇺🇸", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "theverge", name: "The Verge", short: "VRG", spectrum: 38, color: "#e1127a", site: "theverge.com", spectrumCategory: "centro-esquerda", spectrumLabel: "Centro-Esquerda / Tech & Sociedade", country: "US", flag: "🇺🇸", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  /* ── CENTRO (15 fontes) ── */
  { id: "g1", name: "G1 (Globo)", short: "G1", spectrum: 48, color: "#c2571b", site: "g1.globo.com", spectrumCategory: "centro", spectrumLabel: "Centro / Noticiário Geral", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "cnn_brasil", name: "CNN Brasil", short: "CNN", spectrum: 52, color: "#7d1f2d", site: "cnnbrasil.com.br", spectrumCategory: "centro", spectrumLabel: "Centro / Hard News", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "poder360", name: "Poder360", short: "P36", spectrum: 50, color: "#0277bd", site: "poder360.com.br", spectrumCategory: "centro", spectrumLabel: "Centro / Factual & Bastidores", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "metropoles", name: "Metrópoles", short: "MET", spectrum: 48, color: "#e65100", site: "metropoles.com", spectrumCategory: "centro", spectrumLabel: "Centro / Factual e Exclusivas", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "agenciabrasil", name: "Agência Brasil (EBC)", short: "EBC", spectrum: 50, color: "#2e7d32", site: "agenciabrasil.ebc.com.br", spectrumCategory: "centro", spectrumLabel: "Centro / Agência Pública Nacional", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "jota", name: "JOTA", short: "JOT", spectrum: 50, color: "#37474f", site: "jota.info", spectrumCategory: "centro", spectrumLabel: "Centro / Jurídico & Regulação STF", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "congressoemfoco", name: "Congresso em Foco", short: "CEF", spectrum: 50, color: "#ff6f00", site: "congressoemfoco.uol.com.br", spectrumCategory: "centro", spectrumLabel: "Centro / Parlamento & Leis", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "aosfatos", name: "Aos Fatos", short: "AOS", spectrum: 50, color: "#1565c0", site: "aosfatos.org", spectrumCategory: "centro", spectrumLabel: "Centro / Fact-checking e Checagem", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "lupa", name: "Agência Lupa", short: "LUP", spectrum: 50, color: "#ad1457", site: "lupa.news", spectrumCategory: "centro", spectrumLabel: "Centro / Checagem de Fatos", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "opovo", name: "O Povo (Ceará)", short: "OPV", spectrum: 50, color: "#00838f", site: "opovo.com.br", spectrumCategory: "centro", spectrumLabel: "Centro / Regional Nordeste", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "gzh", name: "GZH / Zero Hora (RS)", short: "GZH", spectrum: 50, color: "#00695c", site: "gauchazh.clicrbs.com.br", spectrumCategory: "centro", spectrumLabel: "Centro / Regional Sul", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "correiobraziliense", name: "Correio Braziliense", short: "CB", spectrum: 50, color: "#4527a0", site: "correiobraziliense.com.br", spectrumCategory: "centro", spectrumLabel: "Centro / Capital Federal", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "otempo", name: "O Tempo (MG)", short: "OTM", spectrum: 50, color: "#283593", site: "otempo.com.br", spectrumCategory: "centro", spectrumLabel: "Centro / Regional Sudeste", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "tribunadonorte", name: "Tribuna do Norte (RN)", short: "TDN", spectrum: 50, color: "#00695c", site: "tribunadonorte.com.br", spectrumCategory: "centro", spectrumLabel: "Centro / Regional Nordeste", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "conjur", name: "Consultor Jurídico (ConJur)", short: "CON", spectrum: 50, color: "#4e342e", site: "conjur.com.br", spectrumCategory: "centro", spectrumLabel: "Centro / Judiciário", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  /* ── CENTRO-DIREITA (9 fontes) ── */
  { id: "estadao", name: "Estadão", short: "EST", spectrum: 64, color: "#1d4e89", site: "estadao.com.br", spectrumCategory: "centro-direita", spectrumLabel: "Centro-Direita / Mainstream Tradicional", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "veja", name: "Veja", short: "VEJ", spectrum: 66, color: "#bf360c", site: "veja.abril.com.br", spectrumCategory: "centro-direita", spectrumLabel: "Centro-Direita / Política Geral", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "valor_globo", name: "Valor Econômico", short: "VAL", spectrum: 60, color: "#0e7a4d", site: "valor.globo.com", spectrumCategory: "centro-direita", spectrumLabel: "Centro-Direita / Finanças & Macroeconômica", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "infomoney", name: "InfoMoney", short: "IFM", spectrum: 64, color: "#004d40", site: "infomoney.com.br", spectrumCategory: "centro-direita", spectrumLabel: "Centro-Direita / Investimentos", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "exame", name: "Exame", short: "EXM", spectrum: 64, color: "#bf360c", site: "exame.com", spectrumCategory: "centro-direita", spectrumLabel: "Centro-Direita / Negócios & Empresas", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "neofeed", name: "NeoFeed", short: "NEO", spectrum: 62, color: "#00838f", site: "neofeed.com.br", spectrumCategory: "centro-direita", spectrumLabel: "Centro-Direita / Inovação & Startups", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "bloomberglinea", name: "Bloomberg Línea Brasil", short: "BLM", spectrum: 62, color: "#1a237e", site: "bloomberglinea.com.br", spectrumCategory: "centro-direita", spectrumLabel: "Centro-Direita / Finanças", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "timesofisrael", name: "The Times of Israel", short: "TOI", spectrum: 65, color: "#0d47a1", site: "timesofisrael.com", spectrumCategory: "centro-direita", spectrumLabel: "Centro-Direita / Internacional Oriente Médio", country: "IL", flag: "🇮🇱", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "defensenews", name: "Defense News", short: "DEF", spectrum: 66, color: "#263238", site: "defensenews.com", spectrumCategory: "centro-direita", spectrumLabel: "Centro-Direita / Defesa & Indústria Militar", country: "US", flag: "🇺🇸", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  /* ── DIREITA (7 fontes) ── */
  { id: "gazetadopovo", name: "Gazeta do Povo", short: "GAZ", spectrum: 82, color: "#004d40", site: "gazetadopovo.com.br", spectrumCategory: "direita", spectrumLabel: "Direita / Conservador Liberal", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "jovempan", name: "Jovem Pan News", short: "JPN", spectrum: 86, color: "#a4252b", site: "jovempan.com.br", spectrumCategory: "direita", spectrumLabel: "Direita / Opinião & Hard News", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "oantagonista", name: "O Antagonista", short: "ANT", spectrum: 80, color: "#212121", site: "oantagonista.com.br", spectrumCategory: "direita", spectrumLabel: "Direita / Liberal-Conservador", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "revistaoeste", name: "Revista Oeste", short: "OES", spectrum: 86, color: "#827717", site: "revistaoeste.com", spectrumCategory: "direita", spectrumLabel: "Direita / Conservador & Agro", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "plenonews", name: "Pleno.News", short: "PLE", spectrum: 85, color: "#e65100", site: "pleno.news", spectrumCategory: "direita", spectrumLabel: "Direita / Conservador & Valores", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "fox_news", name: "Fox News World", short: "FOX", spectrum: 86, color: "#003366", site: "foxnews.com", spectrumCategory: "direita", spectrumLabel: "Direita / Conservador US", country: "US", flag: "🇺🇸", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "diariodopoder", name: "Diário do Poder", short: "DDP", spectrum: 84, color: "#3e2723", site: "diariodopoder.com.br", spectrumCategory: "direita", spectrumLabel: "Direita / Bastidores de Brasília", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  /* ── INDEPENDENTES (8 fontes) ── */
  { id: "canaltech", name: "Canaltech", short: "CT", spectrum: 50, color: "#0088cc", site: "canaltech.com.br", spectrumCategory: "independentes", spectrumLabel: "Independentes / Tecnologia & Gadgets", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "tecmundo", name: "TecMundo", short: "TM", spectrum: 50, color: "#00a8ff", site: "tecmundo.com.br", spectrumCategory: "independentes", spectrumLabel: "Independentes / Tech & Ciência", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "olhardigital", name: "Olhar Digital", short: "OD", spectrum: 50, color: "#ff6f00", site: "olhardigital.com.br", spectrumCategory: "independentes", spectrumLabel: "Independentes / Inovação", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "techcrunch", name: "TechCrunch", short: "TC", spectrum: 50, color: "#00a562", site: "techcrunch.com", spectrumCategory: "independentes", spectrumLabel: "Independentes / Startups & IA", country: "US", flag: "🇺🇸", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "arstechnica", name: "Ars Technica", short: "ARS", spectrum: 50, color: "#ff4500", site: "arstechnica.com", spectrumCategory: "independentes", spectrumLabel: "Independentes / Deep Tech & Ciência", country: "US", flag: "🇺🇸", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "ign_br", name: "IGN Brasil", short: "IGN", spectrum: 50, color: "#bf1313", site: "br.ign.com", spectrumCategory: "independentes", spectrumLabel: "Independentes / Games & Cultura Pop", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "eurogamer_pt", name: "Eurogamer Portugal", short: "EUG", spectrum: 50, color: "#0090ea", site: "eurogamer.pt", spectrumCategory: "independentes", spectrumLabel: "Independentes / Games & Reviews", country: "PT", flag: "🇵🇹", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "pcgamer", name: "PC Gamer", short: "PCG", spectrum: 50, color: "#e61b24", site: "pcgamer.com", spectrumCategory: "independentes", spectrumLabel: "Independentes / PC Gaming & Hardware", country: "US", flag: "🇺🇸", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  /* ── AGÊNCIAS INTERNACIONAIS (8 fontes) ── */
  { id: "reuters", name: "Reuters", short: "RTR", spectrum: 52, color: "#d97a00", site: "reuters.com", spectrumCategory: "agências internacionais", spectrumLabel: "Agências Internacionais / Agência Global", country: "GB", flag: "🇬🇧", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "ap", name: "Associated Press", short: "AP", spectrum: 50, color: "#333333", site: "apnews.com", spectrumCategory: "agências internacionais", spectrumLabel: "Agências Internacionais / Agência Global", country: "US", flag: "🇺🇸", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "dw_brasil", name: "Deutsche Welle Brasil", short: "DW", spectrum: 50, color: "#0064d2", site: "dw.com", spectrumCategory: "agências internacionais", spectrumLabel: "Agências Internacionais / Pública Internacional", country: "DE", flag: "🇩🇪", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "bbc_brasil", name: "BBC News Brasil", short: "BBC", spectrum: 50, color: "#262626", site: "bbc.com/portuguese", spectrumCategory: "agências internacionais", spectrumLabel: "Agências Internacionais / Pública Britânica", country: "GB", flag: "🇬🇧", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "bbc_world", name: "BBC News World", short: "BBC", spectrum: 50, color: "#262626", site: "bbc.com", spectrumCategory: "agências internacionais", spectrumLabel: "Agências Internacionais / Global News", country: "GB", flag: "🇬🇧", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "euronews_pt", name: "Euronews em Português", short: "EUR", spectrum: 50, color: "#003399", site: "pt.euronews.com", spectrumCategory: "agências internacionais", spectrumLabel: "Agências Internacionais / Europa", country: "EU", flag: "🇪🇺", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "aljazeera", name: "Al Jazeera English", short: "ALJ", spectrum: 48, color: "#d35400", site: "aljazeera.com", spectrumCategory: "agências internacionais", spectrumLabel: "Agências Internacionais / Global South", country: "QA", flag: "🇶🇦", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "npr_world", name: "NPR World", short: "NPR", spectrum: 48, color: "#2c4d6f", site: "npr.org", spectrumCategory: "agências internacionais", spectrumLabel: "Agências Internacionais / Rádio Pública US", country: "US", flag: "🇺🇸", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },

  /* ── INTERNACIONAIS: CHINA (3 fontes) ── */
  { id: "xinhua", name: "Xinhua News", short: "XIN", spectrum: 48, color: "#d32f2f", site: "xinhuanet.com", spectrumCategory: "agências internacionais", spectrumLabel: "China / Agência Estatal Oficial", country: "CN", flag: "🇨🇳", geopoliticalBloc: "east", geopolitical_bloc: "east", geopoliticalBlocLabel: "Bloco Eurasiático / Oriental" },
  { id: "scmp", name: "South China Morning Post", short: "SCMP", spectrum: 50, color: "#003366", site: "scmp.com", spectrumCategory: "centro", spectrumLabel: "Hong Kong / Geopolítica Asiática", country: "HK", flag: "🇭🇰", geopoliticalBloc: "east", geopolitical_bloc: "east", geopoliticalBlocLabel: "Bloco Eurasiático / Oriental" },
  { id: "global_times", name: "Global Times", short: "GT", spectrum: 25, color: "#c62828", site: "globaltimes.cn", spectrumCategory: "esquerda", spectrumLabel: "China / Visão Internacional de Pequim", country: "CN", flag: "🇨🇳", geopoliticalBloc: "east", geopolitical_bloc: "east", geopoliticalBlocLabel: "Bloco Eurasiático / Oriental" },

  /* ── INTERNACIONAIS: RÚSSIA (3 fontes) ── */
  { id: "tass", name: "TASS", short: "TASS", spectrum: 65, color: "#003399", site: "tass.com", spectrumCategory: "agências internacionais", spectrumLabel: "Rússia / Agência Estatal Oficial", country: "RU", flag: "🇷🇺", geopoliticalBloc: "east", geopolitical_bloc: "east", geopoliticalBlocLabel: "Bloco Eurasiático / Oriental" },
  { id: "the_moscow_times", name: "The Moscow Times", short: "TMT", spectrum: 48, color: "#111111", site: "themoscowtimes.com", spectrumCategory: "independentes", spectrumLabel: "Rússia / Independente no Exílio", country: "RU", flag: "🇷🇺", geopoliticalBloc: "east", geopolitical_bloc: "east", geopoliticalBlocLabel: "Bloco Eurasiático / Oriental" },
  { id: "sputnik_globe", name: "Sputnik News", short: "SPU", spectrum: 75, color: "#e65100", site: "sputnikglobe.com", spectrumCategory: "agências internacionais", spectrumLabel: "Rússia / Mídia Internacional Estatal", country: "RU", flag: "🇷🇺", geopoliticalBloc: "east", geopolitical_bloc: "east", geopoliticalBlocLabel: "Bloco Eurasiático / Oriental" },

  /* ── INTERNACIONAIS: JAPÃO (3 fontes) ── */
  { id: "nhk_world", name: "NHK World", short: "NHK", spectrum: 50, color: "#00838f", site: "nhk.or.jp", spectrumCategory: "agências internacionais", spectrumLabel: "Japão / Emissora Pública Internacional", country: "JP", flag: "🇯🇵", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "the_japan_times", name: "The Japan Times", short: "TJT", spectrum: 50, color: "#1d4e89", site: "japantimes.co.jp", spectrumCategory: "centro", spectrumLabel: "Japão / Referência Internacional em Inglês", country: "JP", flag: "🇯🇵", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "nikkei_asia", name: "Nikkei Asia", short: "NKA", spectrum: 62, color: "#004d40", site: "asia.nikkei.com", spectrumCategory: "centro-direita", spectrumLabel: "Japão / Economia e Geopolítica Asiática", country: "JP", flag: "🇯🇵", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },

  /* ── INTERNACIONAIS: TAILÂNDIA (2 fontes) ── */
  { id: "bangkok_post", name: "Bangkok Post", short: "BKP", spectrum: 50, color: "#005689", site: "bangkokpost.com", spectrumCategory: "centro", spectrumLabel: "Tailândia / Decano do Sudeste Asiático", country: "TH", flag: "🇹🇭", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "the_nation_th", name: "The Nation", short: "NAT", spectrum: 50, color: "#1a237e", site: "nationthailand.com", spectrumCategory: "centro", spectrumLabel: "Tailândia / Relações Internacionais ASEAN", country: "TH", flag: "🇹🇭", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },

  /* ── INTERNACIONAIS: EUA (3 fontes) ── */
  { id: "nytimes_world", name: "The New York Times", short: "NYT", spectrum: 36, color: "#111111", site: "nytimes.com", spectrumCategory: "centro-esquerda", spectrumLabel: "EUA / Referência Internacional Liberal", country: "US", flag: "🇺🇸", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "washington_post", name: "The Washington Post", short: "WP", spectrum: 38, color: "#212121", site: "washingtonpost.com", spectrumCategory: "centro-esquerda", spectrumLabel: "EUA / Política Externa & Defesa", country: "US", flag: "🇺🇸", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "wsj_world", name: "The Wall Street Journal", short: "WSJ", spectrum: 65, color: "#0e7a4d", site: "wsj.com", spectrumCategory: "centro-direita", spectrumLabel: "EUA / Finanças Globais & Geopolítica", country: "US", flag: "🇺🇸", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },

  /* ── INTERNACIONAIS: ARGENTINA (4 fontes) ── */
  { id: "clarin_mundo", name: "Clarín", short: "CLA", spectrum: 65, color: "#c62828", site: "clarin.com", spectrumCategory: "centro-direita", spectrumLabel: "Argentina / Maior Circulação da América do Sul", country: "AR", flag: "🇦🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "lanacion_mundo", name: "La Nación", short: "LN", spectrum: 72, color: "#0d47a1", site: "lanacion.com.ar", spectrumCategory: "direita", spectrumLabel: "Argentina / Conservador Tradicional", country: "AR", flag: "🇦🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "infobae_america", name: "Infobae", short: "INFO", spectrum: 62, color: "#ff6f00", site: "infobae.com", spectrumCategory: "centro-direita", spectrumLabel: "América Latina / Hard News Digital", country: "AR", flag: "🇦🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "pagina12_mundo", name: "Página/12", short: "P12", spectrum: 20, color: "#b71c1c", site: "pagina12.com.ar", spectrumCategory: "esquerda", spectrumLabel: "Argentina / Esquerda e Direitos Humanos", country: "AR", flag: "🇦🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },

  /* ── INTERNACIONAIS: MUNDO ÁRABE & ORIENTE MÉDIO (3 fontes) ── */
  { id: "al_arabiya_en", name: "Al Arabiya", short: "ARB", spectrum: 65, color: "#6a1b9a", site: "alarabiya.net", spectrumCategory: "centro-direita", spectrumLabel: "Arábia Saudita & Golfo / Diplomacia Árabe", country: "SA", flag: "🇸🇦", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "the_national_uae", name: "The National UAE", short: "TN", spectrum: 50, color: "#00695c", site: "thenationalnews.com", spectrumCategory: "centro", spectrumLabel: "Emirados Árabes / Rotas Marítimas & Golfo", country: "AE", flag: "🇦🇪", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "irna_iran", name: "IRNA (Irã)", short: "IRNA", spectrum: 50, color: "#1b5e20", site: "irna.ir", spectrumCategory: "agências internacionais", spectrumLabel: "Irã / Agência Oficial da República Islâmica", country: "IR", flag: "🇮🇷", geopoliticalBloc: "east", geopolitical_bloc: "east", geopoliticalBlocLabel: "Bloco Eurasiático / Oriental" },

  /* ── INTERNACIONAIS: UCRÂNIA (3 fontes) ── */
  { id: "kyiv_independent", name: "The Kyiv Independent", short: "TKI", spectrum: 48, color: "#fbc02d", site: "kyivindependent.com", spectrumCategory: "independentes", spectrumLabel: "Ucrânia / Cobertura Independente de Guerra", country: "UA", flag: "🇺🇦", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "ukrayinska_pravda", name: "Ukrayinska Pravda", short: "UP", spectrum: 50, color: "#b71c1c", site: "pravda.com.ua", spectrumCategory: "centro", spectrumLabel: "Ucrânia / Jornalismo Investigativo & Fronte", country: "UA", flag: "🇺🇦", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "kyiv_post", name: "Kyiv Post", short: "KP", spectrum: 60, color: "#0277bd", site: "kyivpost.com", spectrumCategory: "centro-direita", spectrumLabel: "Ucrânia / Diplomacia & Conflito Internacional", country: "UA", flag: "🇺🇦", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },

  /* ── COMPATIBILIDADE / ALIASES ── */
  { id: "cnn", name: "CNN Brasil", short: "CNN", spectrum: 52, color: "#7d1f2d", site: "cnnbrasil.com.br", spectrumCategory: "centro", spectrumLabel: "Centro / Hard News", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "bbc", name: "BBC News Brasil", short: "BBC", spectrum: 50, color: "#262626", site: "bbc.com/portuguese", spectrumCategory: "agências internacionais", spectrumLabel: "Agências Internacionais / Pública Britânica", country: "GB", flag: "🇬🇧", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
  { id: "valor", name: "Valor Econômico", short: "VAL", spectrum: 60, color: "#0e7a4d", site: "valor.globo.com", spectrumCategory: "centro-direita", spectrumLabel: "Centro-Direita / Finanças", country: "BR", flag: "🇧🇷", geopoliticalBloc: "global_south", geopolitical_bloc: "global_south", geopoliticalBlocLabel: "Sul Global & Neutros" },
  { id: "guardian", name: "The Guardian", short: "GUA", spectrum: 32, color: "#005689", site: "theguardian.com", spectrumCategory: "centro-esquerda", spectrumLabel: "Centro-Esquerda / Internacional", country: "GB", flag: "🇬🇧", geopoliticalBloc: "west", geopolitical_bloc: "west", geopoliticalBlocLabel: "Bloco Ocidental" },
];

const DYNAMIC_OUTLETS = new Map<string, Outlet>();

export const outletById = (id: string, nameHint?: string): Outlet => {
  const normId = (id || "").toLowerCase().trim();
  const resolvedId =
    normId === "cnn" ? "cnn_brasil" :
    normId === "bbc" ? "bbc_brasil" :
    normId === "valor" ? "valor_globo" :
    normId === "guardian" ? "theguardian" : normId;

  const found = OUTLETS.find(
    (o) => o.id === resolvedId || o.id === normId || o.name.toLowerCase() === normId || o.short.toLowerCase() === normId
  );
  if (found) return found;

  if (DYNAMIC_OUTLETS.has(normId)) {
    return DYNAMIC_OUTLETS.get(normId)!;
  }

  const cleanName = nameHint || id || "Fonte";
  const words = cleanName.split(/\s+/).filter(Boolean);
  let short = "";
  if (words.length >= 2) {
    short = (words[0][0] + words[1][0]).toUpperCase();
  } else {
    short = cleanName.slice(0, 3).toUpperCase();
  }

  // Hash para cor estável
  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = ["#8a2431", "#1d4e89", "#0e7a4d", "#c2571b", "#4a6fa5", "#7d1f2d", "#d97a00", "#455a64", "#5c6bc0", "#2e7d32"];
  const color = palette[Math.abs(hash) % palette.length];

  const dyn: Outlet = {
    id: normId,
    name: cleanName,
    short,
    spectrum: 50,
    color,
    site: "",
  };
  DYNAMIC_OUTLETS.set(normId, dyn);
  return dyn;
};

export interface SpectrumZone {
  label: string;
  color: string;
}

export const SPECTRUM_ZONES: SpectrumZone[] = [
  { label: "Esquerda", color: "#2456a6" },
  { label: "Centro-esquerda", color: "#4a7ab5" },
  { label: "Centro factual", color: "#7d766c" },
  { label: "Centro-direita", color: "#b25b2e" },
  { label: "Direita", color: "#a4252b" },
];

export function spectrumInfo(value: number) {
  if (value < 30) return { label: "Esquerda", zone: 0 };
  if (value < 45) return { label: "Centro-esquerda", zone: 1 };
  if (value <= 60) return { label: "Centro factual", zone: 2 };
  if (value < 80) return { label: "Centro-direita", zone: 3 };
  return { label: "Direita", zone: 4 };
}

export interface Coverage {
  outletId: string;
  /** rotulo do enquadramento editorial */
  framing: string;
  headline: string;
  /** trecho literal publicado (lide/citação direta) */
  quote: string;
  emphasized: string[];
  omitted: string[];
  url: string;
  published: string;
}

export interface Divergence {
  point: string;
  positions: { outletId: string; take: string }[];
}

export interface Story {
  id: string;
  theme: ThemeId;
  kicker: string;
  tags?: string[];
  title: string;
  summary: string;
  /** Resumo ultra-rápido de no máximo 2 linhas para feed mobile-first */
  briefSummary?: string;
  readTime: number;
  time: string;
  /** selo de verificação da manchete consensual */
  stamp: string;
  image?: string;
  caption?: string;
  cover?: boolean;
  consensus: string[];
  divergences: Divergence[];
  blindSpot: string;
  coverage: Coverage[];
}

export function getStoryTags(story: Story): string[] {
  if (story.tags && story.tags.length > 0) return story.tags;
  const tags: string[] = [];
  const text = (story.title + " " + story.kicker + " " + story.summary).toLowerCase();
  if (text.includes("ormuz") || text.includes("hormuz") || text.includes("pérsico") || text.includes("petroleiro")) tags.push("#EstreitoDeOrmuz");
  if (text.includes("ucrânia") || text.includes("ucrania") || text.includes("kyiv") || text.includes("zelensky")) tags.push("#Ucrânia");
  if (text.includes("rússia") || text.includes("russia") || text.includes("moscou") || text.includes("putin")) tags.push("#Rússia");
  if (text.includes("china") || text.includes("pequim") || text.includes("xi jinping") || text.includes("taiwan")) tags.push("#China");
  if (text.includes("oriente médio") || text.includes("gaza") || text.includes("israel") || text.includes("irã") || text.includes("ira")) tags.push("#OrienteMédio");
  if (text.includes("guerra") || text.includes("militar") || text.includes("otan") || text.includes("mísseis") || text.includes("drones")) tags.push("#Guerra");
  if (text.includes("eua") || text.includes("estados unidos") || text.includes("biden") || text.includes("trump") || text.includes("washington")) tags.push("#EUA");
  if (text.includes("argentina") || text.includes("milei") || text.includes("buenos aires")) tags.push("#Argentina");
  if (text.includes("japão") || text.includes("japao") || text.includes("tóquio")) tags.push("#Japão");
  if (text.includes("petróleo") || text.includes("petroleo") || text.includes("opep") || text.includes("barril")) tags.push("#Petróleo");
  if (text.includes("stf") || text.includes("supremo")) tags.push("#STF");
  if (text.includes("dólar") || text.includes("dolar") || text.includes("câmbio")) tags.push("#Dólar");
  if (text.includes("copom")) tags.push("#Copom");
  if (text.includes("selic") || text.includes("juros")) tags.push("#Selic");
  if (text.includes("ia") || text.includes("inteligência artificial") || text.includes("tech")) tags.push("#IA");
  if (text.includes("governo") || text.includes("lula") || text.includes("planalto")) tags.push("#Governo");
  if (text.includes("congresso") || text.includes("câmara") || text.includes("senado")) tags.push("#Congresso");
  if (text.includes("mercado") || text.includes("bolsa") || text.includes("ibovespa") || text.includes("fiscal")) tags.push("#Mercado");
  if (tags.length === 0) {
    tags.push("#" + story.theme.charAt(0).toUpperCase() + story.theme.slice(1));
  }
  return tags;
}

export const STORIES: Story[] = [
  /* ────────────────────────── 1 · CAPA · ECONOMIA ────────────────────────── */
  {
    id: "selic",
    theme: "economia",
    kicker: "Economia · Copom",
    tags: ["#Selic", "#Copom", "#BancoCentral", "#Dólar", "#Mercado", "#Inflação"],
    title: "Banco Central corta a Selic para 14% e sinaliza pausa na trajetória",
    summary:
      "O Copom reduziu a taxa em 0,5 ponto, em decisão unânime, e projetou inflação em 4,4% em 2026 — dentro da meta. O mercado precificava corte de 0,75 ponto; o DI reprecificou com viés de cautela ao fim do comunicado.",
    readTime: 8,
    time: "17:42",
    stamp: "6 veículos confirmam o mesmo número",
    image: imgSelic,
    caption: "Sede do Banco Central, em Brasília — a quarta queda consecutiva do ciclo restritivo.",
    cover: true,
    consensus: [
      "O Copom cortou a Selic em 0,5 ponto percentual, de 14,5% para 14,0% ao ano, em decisão unânime (12 votos a 0).",
      "A inflação acumulada em 12 meses saiu de 4,9% para 4,5% no IPCA de agosto, de volta ao intervalo da meta de 3%.",
      "O comunicado projetou inflação em 4,4% no fim de 2026 e 3,5% no fim de 2027, e manteve a taxa em “patamar neutro ou restritivo”.",
      "O dólar fechou em R$ 5,42, variação de 0,3% no dia da decisão; o Ibovespa recuou 0,6% ao fim do pregão.",
    ],
    divergences: [
      {
        point: "O tamanho do corte: acerto ou decepção?",
        positions: [
          { outletId: "valor", take: "“Corte morno”: 0,75 ponto era a mediana esperada; o comunicado “tirou o pânico, mas não a pressa” do mercado." },
          { outletId: "folha", take: "“Corte na medida”: o mercado superdimensionou o ritmo; a pausa é acerto técnico, não recuo." },
          { outletId: "estadao", take: "“Restrição dura mais tempo”: o texto “deixa a porta aberta para alta se o câmbio perder o controle”." },
        ],
      },
      {
        point: "Quem está errando: o Banco Central ou o mercado?",
        positions: [
          { outletId: "cnn", take: "Defende que o BC “atrasou a mão”: o custo de capital brasileiro segue o mais alto do G20." },
          { outletId: "g1", take: "Repassa a leitura de consenso: para os economistas ouvidos ao vivo, a decisão “acertou a dose”." },
          { outletId: "reuters", take: "Sem adjetivos: “o banco disse que a decisão equilibra riscos de inflação acima e abaixo da meta”." },
        ],
      },
      {
        point: "Quem se beneficia em ano eleitoral",
        positions: [
          { outletId: "uol", take: "Manda para o título: “parcela do financiamento cai R$ 412 por mês” — efeito direto no bolso do eleitor." },
          { outletId: "folha", take: "Menciona o impacto nas campanhas de 2026, mas apenas em nota de fechamento da matéria." },
        ],
      },
    ],
    blindSpot:
      "Nenhuma redação investigou a origem dos depósitos de pessoas jurídicas que sustentaram o superávit primário do 2º trimestre — a base exata do “fôlego fiscal” que o próprio comunicado usa para justificar a queda.",
    coverage: [
      {
        outletId: "folha",
        framing: "Acerto técnico",
        headline: "BC corta juros para 14%, mas sinaliza que o ciclo só recomeça em 2027",
        quote:
          "O Copom reduziu a Selic em 0,5 ponto percentual para 14,0% ao ano e voltou a dizer que “o ajuste gradual da política monetária prosseguirá no ritmo necessário para assegurar a convergência da inflação à meta” — trecho que, para analistas, indica pausa nos três comitês restantes do ano.",
        emphasized: ["Unanimidade do voto e o tom técnico do comunicado", "Caiem R$ 412/mês nas parcelas de imóveis financiados"],
        omitted: ["Efeito dos juros no custo das campanhas de 2026", "Depósitos atípicos de empresas no superávit primário"],
        url: "https://www1.folha.uol.com.br/economia/copom-corta-selic-14-2026",
        published: "há 2 h",
      },
      {
        outletId: "estadao",
        framing: "Restrição dura",
        headline: "Selic cai para 14%, mas BC avisa que a trava só sai se o câmbio cooperar",
        quote:
          "Em nota, o comitê manteve a taxa em “patamar neutro ou restritivo” e alertou que “uma desvalorização adicional do real poderia exigir reposição de restrição” — leitura, segundo o banco, de que o ciclo de cortes está pausado, e não encerrado.",
        emphasized: ["Risco cambiel como trava para novos cortes", "Projeção de 3,5% em 2027, ainda acima do centro da meta"],
        omitted: ["Crédito pessoal e bens de consumo favorecidos pela queda", "O debate eleitoral sobre o nível dos juros"],
        url: "https://www.estadao.com.br/economia/selic-corte-cambio-2026",
        published: "há 2 h",
      },
      {
        outletId: "g1",
        framing: "Reação do mercado",
        headline: "Copom corta juros para 14% e mercado reage bem ao comunicado",
        quote:
          "A decisão unânime veio acima da mediana de 0,75 ponto esperada no Term Bôus; após o comunicado, o contrato de DI 2028 passou a precificar dois cortes até o fim do ano — movimento que analistas chamaram, ao vivo, de “alívio sem euforia”.",
        emphasized: ["Reação em tempo real do DI, do dólar e do Ibovespa", "Entrevistas ao vivo com dois economistas"],
        omitted: ["Transcrição completa da ata", "Pergunta sobre depósitos de pessoa jurídica"],
        url: "https://g1.globo.com/economia/noticia/2026/06/copom-corta-juros-14.ghtml",
        published: "há 1 h",
      },
      {
        outletId: "bbc",
        framing: "Visão global",
        headline: "Brasil reduz taxa básica de juros e aposta em inflação sob controle",
        quote:
          "O Banco Central do Brasil cortou sua taxa básica para 14% ao ano, citando “desinflação mais rápida que a projetada” — a quarta queda consecutiva, que encerra a maior fase restritiva da política monetária em duas décadas.",
        emphasized: ["Contexto histórico: a fase mais restritiva em 20 anos", "Comparação com os demais bancos centrais do G20"],
        omitted: ["Detalhamento técnico das projeções da meta", "Impacto do corte no ciclo eleitoral brasileiro"],
        url: "https://www.bbc.com/portuguese/articles/brasil-selic-corte-2026",
        published: "há 3 h",
      },
      {
        outletId: "reuters",
        framing: "Fatos e números",
        headline: "BC corta Selic em 0,5 ponto para 14% e vê IPCA em 4,4% em 2026, diz comunicado",
        quote:
          "O banco central reduziu a taxa básica em 50 pontos-base, abaixo da mediana de 0,75 ponto esperada por analistas ouvidos pela Reuters, e projetou inflação em 4,4% em dezembro de 2026 e 3,5% em dezembro de 2027.",
        emphasized: ["Números puros: corte, projeções e meta", "Mediana do Term Bôus (0,75) vs. decisão (0,50)"],
        omitted: ["Avaliação editorial sobre o rumo do ciclo", "Qualquer menção à política fiscal ou ao eleitorado"],
        url: "https://www.reuters.com/business/finance/brasil-selic-14-2026",
        published: "há 2 h",
      },
      {
        outletId: "valor",
        framing: "Corte morno",
        headline: "Corte de 0,50: o BC pisa no freio do que o mercado queria",
        quote:
          "O comitê entregou um recuo menor que o esperado — 0,50 ponto contra a mediana de 0,75 — e um comunicado que, na prática, “tirou o pânico, mas não a pressa”: para o mercado, o próximo corte só chega com IPCA mais baixo na mão.",
        emphasized: ["Reprecificação do DI pós-comunicado, tick a tick", "Comunicado mais restritivo que o do ciclo anterior"],
        omitted: ["Efeito no consumidor final (parcelas, crédito)", "O tabuleiro eleitoral de 2026"],
        url: "https://valor.globo.com/economia/noticia/2026/06/copom-corte-morno.ghtml",
        published: "há 1 h",
      },
    ],
  },

  /* ────────────────────────── 2 · POLÍTICA ────────────────────────── */
  {
    id: "arcabouco",
    theme: "politica",
    kicker: "Política · Congresso",
    tags: ["#Congresso", "#Senado", "#Governo", "#Fiscal", "#STF", "#Economia"],
    title: "Senado aprova mudança no arcabouço fiscal em votação de 58 a 24",
    summary:
      "A nova regra vincula a despesa primária à inflação com teto de crescimento de 0,5% a.a. acima do IPCA e rebaixa a meta de 2026 para déficit de R$ 0,36 bi. A Câmara vota em urgência até sexta; vetos pontuais já são esperados.",
    readTime: 7,
    time: "14:10",
    stamp: "5 veículos confirmam o mesmo placar",
    image: imgCongress,
    caption: "Plenário do Senado — o substitutivo passou em duas votações, sem emendas.",
    consensus: [
      "O Senado aprovou o substitutivo por 58 votos a 24, em duas votações, sem acolher nenhuma emenda de comissão.",
      "A nova fórmula limita o crescimento da despesa primária a IPCA + 0,5% ao ano e rebaixa a meta de 2026 para déficit de R$ 0,36 bilhão.",
      "A Câmara deve votar em regime de urgência até sexta-feira, com expectativa de vetos presidenciais a dois pontos do texto.",
      "O projeto segue para sanção no prazo constitucional de 45 dias úteis.",
    ],
    divergences: [
      {
        point: "Quem paga a conta",
        positions: [
          { outletId: "estadao", take: "“Vitória do Tesouro”: o título celebra o alívio para os bondholders e o spread brasileiro." },
          { outletId: "folha", take: "“Regra nova trava o gasto social por 10 anos”: usa estudo do Ipea sobre o corte em programas." },
          { outletId: "uol", take: "Foco no benefício: “menor repasse a programas sociais”, com levantamento próprio de R$ 12 bi/ano." },
        ],
      },
      {
        point: "O que motiva o governo",
        positions: [
          { outletId: "cnn", take: "Aponta “manobra para segurar apoio no Centrão” e detalha as articulações nas últimas horas da votação." },
          { outletId: "g1", take: "Transmite a versão oficial: “a meta é previsibilidade fiscal”, cita o porta-voz sem contestar." },
        ],
      },
    ],
    blindSpot:
      "Nenhuma redação conferiu se o déficit projetado de R$ 0,36 bi cobre o passivo de precatórios do INSS — número que o tribunal ainda não havia divulgado até a publicação das matérias.",
    coverage: [
      {
        outletId: "estadao",
        framing: "Alívio para o mercado",
        headline: "Novo arcabouço é vitória do Tesouro e alívio para os bondholders",
        quote:
          "Ao vincetar o crescimento da despesa a IPCA + 0,5%, o Senado entregou ao mercado a âncora que investidores pediam desde a reabertura do teto: o spread da dívida brasileira caiu 4 pontos-base ainda no anúncio do placar.",
        emphasized: ["Reação da dívida e do swap cambial", "Negociação técnica com o Tesouro nos bastidores"],
        omitted: ["Corte estimado em programas sociais", "Posição de partidos de oposição no Senado"],
        url: "https://www.estadao.com.br/politica/novo-arcabouco-fiscal-senado",
        published: "há 4 h",
      },
      {
        outletId: "folha",
        framing: "Gasto social travado",
        headline: "Regra nova limita o gasto social por 10 anos, aponta estudo",
        quote:
          "Com o teto de IPCA + 0,5%, os programas sociais passam a crescer menos que a inflação acumulada do período: segundo modelo do Ipea, o conjunto de transferências perde R$ 12 bilhões por ano em capacidade de expansão a partir de 2028.",
        emphasized: ["Modelagem do Ipea e o impacto em programas sociais", "Histórico de brechas no arcabouço anterior"],
        omitted: ["Reação imediata dos investidores", "Articulação do Centrão na votação"],
        url: "https://www1.folha.uol.com.br/politica/arcabouco-fiscal-senado-2026",
        published: "há 4 h",
      },
      {
        outletId: "g1",
        framing: "Versão oficial",
        headline: "Senado aprova novo arcabouço fiscal; Câmara vota em urgência",
        quote:
          "Aprovado por 58 votos a 24, o substitutivo segue para a Câmara em regime de urgência. “A meta é previsibilidade fiscal”, resumiu o porta-voz do governo, que descartou a ideia de novos impostos no curto prazo.",
        emphasized: ["Agenda de votações na Câmara até sexta", "Declarações oficiais do porta-voz do governo"],
        omitted: ["Estudos de impacto social (Ipea)", "Estratégia de vetos do Planalto"],
        url: "https://g1.globo.com/politica/noticia/2026/06/senado-arcabouco-fiscal.ghtml",
        published: "há 3 h",
      },
      {
        outletId: "cnn",
        framing: "Manobra política",
        headline: "Votação do arcabouço esconde acordo para o segundo turno",
        quote:
          "Nos últimos 40 minutos de votação, líderes do Centrão negociaram três cargos em autarquias em troca de votos decisivos — a contagem do bloco passou de 49 para 58 votos, exatamente o placar que fechou a primeira votação.",
        emphasized: ["Bastidores: troca de cargos por votos no Centrão", "Linha do tempo minuto a minuto da votação"],
        omitted: ["Conteúdo técnico da nova regra de gasto", "Estudos macroeconômicos de impacto"],
        url: "https://www.cnnbrasil.com.br/nacional/politica/arcabouco-centrao/",
        published: "há 5 h",
      },
      {
        outletId: "uol",
        framing: "Efeito no benefício",
        headline: "Novo arcabouço corta R$ 12 bi/ano de programas sociais, diz levantamento",
        quote:
          "O UOL cruzou a projeção de despesas do novo teto com o orçamento programático de 2026: os ministérios da Saúde, da Educação e do Desenvolvimento Social juntos deixam de ter R$ 12,1 bilhões a mais por ano para expandir serviços.",
        emphasized: ["Levantamento próprio com o orçamento programático", "Ministérios mais afetados, item por item"],
        omitted: ["Reação dos mercados", "Articulação de vetos na sanção"],
        url: "https://www.uol.com.br/politica/ultimas-noticias/2026/06/arcabouco-sociais.htm",
        published: "há 3 h",
      },
    ],
  },

  /* ────────────────────────── 3 · GUERRA ────────────────────────── */
  {
    id: "ucrania",
    theme: "guerra",
    kicker: "Guerra · Ucrânia",
    tags: ["#Guerra", "#Rússia", "#Ucrânia", "#Geopolítica", "#Paz", "#Mundo"],
    title: "Ucrânia e Rússia mantêm primeiro contato direto em 3 anos em Istambul",
    summary:
      "Reunião de 3h20 entre os chefes de inteligência, mediada por Turquia e Arábia Saudita, terminou sem acordo — mas com confirmação de troca de 120 prisioneiros em 15 dias, a primeira desde 2022.",
    readTime: 9,
    time: "09:26",
    stamp: "5 veículos confirmam a mesma agenda",
    consensus: [
      "A reunião ocorreu no Palácio Dolmabahçe, em Istambul, durou 3h20 e terminou sem coletiva conjunta.",
      "As partes confirmaram a troca de 120 prisioneiros em até 15 dias, intermediada pelo Crescente Vermelho, a primeira desde 2022.",
      "A Turquia classificou o encontro como “primeiro passo”; Washington e Bruxelas pediram “etapas verificáveis” antes de qualquer cessar-fogo.",
      "Moscou manteve como pré-condição a retirada de tropas de quatro regiões; Kiev recusou publicamente a condição.",
    ],
    divergences: [
      {
        point: "Há chance real de cessar-fogo?",
        positions: [
          { outletId: "bbc", take: "Pragmática: “um canal aberto vale mais do que nenhum canal”, cita ex-diplomata em Ankara." },
          { outletId: "cnn", take: "Cética: “gesto de imagem para o Ocidente” — o front, lembra, segue congelado desde abril." },
          { outletId: "estadao", take: "Cautelosa: “nada se resolve sem garantias de segurança por escrito”, recado direto a Kiev." },
        ],
      },
      {
        point: "Quem pressiona quem",
        positions: [
          { outletId: "reuters", take: "“Estados Unidos sinalizaram disposição de conversar, segundo duas fontes” — sem citar quem falou.”" },
          { outletId: "folha", take: "Aponta o relógio eleitoral de Washington como o principal impulsionador da rodada." },
        ],
      },
    ],
    blindSpot:
      "Nenhuma redação consultou o estado dos campos de minas nas zonas de fronteira por onde passarão os comboios da troca — fator logístico que, por si só, limita o tamanho do primeiro lote de 120.",
    coverage: [
      {
        outletId: "bbc",
        framing: "Canal aberto",
        headline: "Ucrânia e Rússia voltam à mesa: o que o encontro em Istambul muda",
        quote:
          "Três anos após a última negociação direta, chefes de inteligência dos dois países conversaram por mais de três horas em Istambul. Não houve acordo — mas “um canal aberto vale mais do que nenhum canal”, lembra ex-diplomata em Ankara.",
        emphasized: ["Contexto histórico das negociações de 2022", "Papel mediatador da Turquia e da Arábia Saudita"],
        omitted: ["Logística das minas nas zonas de troca", "Pré-condição russa sobre as quatro regiões"],
        url: "https://www.bbc.com/portuguese/articles/ucrania-russia-istambul-2026",
        published: "há 5 h",
      },
      {
        outletId: "reuters",
        framing: "Fatos e fontes",
        headline: "Ukraine, Russia hold first talks in three years; 120-prisoner swap agreed",
        quote:
          "Os dois lados concluíram a primeira reunião de nível de inteligência em três anos em Istambul e concordaram com a troca de 120 prisioneiros em até 15 dias, segundo autoridades de ambos os lados citadas pela Reuters.",
        emphasized: ["Confirmação bilateral da troca de prisioneiros", "Cronologia do encontro (chegada, duração, saída)"],
        omitted: ["Avaliação de cenários de cessar-fogo", "Reação pública de Moscou e Kiev, lado a lado"],
        url: "https://www.reuters.com/world/europe/ukraine-russia-istambul-talks-2026",
        published: "há 6 h",
      },
      {
        outletId: "cnn",
        framing: "Gesto de imagem",
        headline: "Reunião em Istambul é teatro para o Ocidente, avaliam generais",
        quote:
          "Para generais ucranianos ouvidos pela CNN, o encontro “não mudou um único metro de fronteira”: a troca de prisioneiros, argumentam, atende a uma demanda interna russa mais do que a uma estratégia militar.",
        emphasized: ["Fontes militares ucranianas pessimistas", "Mapa da frente congelada desde abril"],
        omitted: ["A mediação saudita e os termos logísticos", "Declarações oficiais de Ancara"],
        url: "https://www.cnnbrasil.com.br/mundo/ucrania-russia-istambul/",
        published: "há 4 h",
      },
      {
        outletId: "estadao",
        framing: "Garantias por escrito",
        headline: "Kiev aceita negociar, mas só com garantias assinadas, diz assessoria",
        quote:
          "A assessoria do presidente ucraniano classificou a rodada como “exploratória e sem compromisso”: segundo a nota, “nada se resolve sem garantias de segurança por escrito — e por escrito significa tratado, não minuta”.",
        emphasized: ["Nota oficial de Kiev, integral", "Histórico de minutas rompidas desde 2023"],
        omitted: ["Fontes militares de campo", "Detalhes da troca de prisioneiros"],
        url: "https://www.estadao.com.br/mundo/ucrania-negociacao-istambul",
        published: "há 5 h",
      },
      {
        outletId: "g1",
        framing: "Resumo visual",
        headline: "Veja em 6 pontos o que já se sabe sobre a reunião em Istambul",
        quote:
          "Do encontro no Palácio Dolmabahçe à lista de 120 prisioneiros, reunimos tudo o que foi confirmado por ambos os lados após três horas e vinte minutos de negociação mediada pela Turquia.",
        emphasized: ["Infográfico com a cronologia do dia", "Lista pública de nomes do primeiro lote"],
        omitted: ["Análise de especialistas", "Cenários de curto prazo para a guerra"],
        url: "https://g1.globo.com/mundo/noticia/2026/06/istambul-reuniao-6-pontos.ghtml",
        published: "há 3 h",
      },
    ],
  },

  /* ────────────────────────── 4 · TECNOLOGIA ────────────────────────── */
  {
    id: "lei-ia",
    theme: "tecnologia",
    kicker: "Tecnologia · Regulação",
    tags: ["#IA", "#Tecnologia", "#Câmara", "#Congresso", "#Regulação", "#Inovação"],
    title: "Câmara aprova em comissão o texto-base da Lei de IA; plenário em setembro",
    summary:
      "O substitutivo segue a linha europeia com ajustes locais: risco alto só em saúde e crédito, e chatbots de órgãos públicos obrigados a se identificar. Big techs reagiram em nota; plenário vota na semana de 7 de setembro, com 41 emendas pendentes.",
    readTime: 6,
    time: "11:03",
    stamp: "4 veículos confirmam o mesmo texto aprovado",
    image: imgChip,
    caption: "Um chip de processamento — a lei classifica uso de IA em saúde e crédito como “risco alto”.",
    consensus: [
      "A comissão aprovou o substitutivo por 18 votos a 6; o texto-base segue para o plenário na semana de 7 de setembro.",
      "Chatbots de órgãos públicos passam a ser de “risco alto” e exigem identificação obrigatória da automação.",
      "São 41 emendas pendentes, das quais 9 alteram o artigo de classificação de risco.",
      "Em nota conjunta, três big techs chamaram o texto de “equilibrado”; a Abstartups defendeu isenção para empresas com até 100 funcionários.",
    ],
    divergences: [
      {
        point: "O tamanho do ajuste às big techs",
        positions: [
          { outletId: "g1", take: "O editorial chama o texto de “papa-moedas” e detalha o lobby das grandes plataformas em Brasília." },
          { outletId: "bbc", take: "“Regulação proporcional”: especialistas de São Paulo e Lisboa avaliam o texto como moderado no padrão global." },
          { outletId: "folha", take: "Neutra: acompanha o rito no Congresso e destaca as 9 emendas que mexem no artigo de risco." },
        ],
      },
      {
        point: "Quem paga a conformidade",
        positions: [
          { outletId: "estadao", take: "Custa caro: “R$ 2 a 8 milhões por produto”, diz levantamento com escritórios de advocacia especializados." },
        ],
      },
    ],
    blindSpot:
      "Nenhuma redação verificou se os órgãos públicos já cumprem hoje a transparência sobre IA que a própria Lei de Acesso à Informação exige — o ponto de partida real para medir se a nova lei avança algo.",
    coverage: [
      {
        outletId: "g1",
        framing: "Papa-moedas",
        headline: "Texto da Lei de IA é “papa-moedas” das big techs, diz editorial",
        quote:
          "O substitutivo aprovado na comissão repete a arquitetura europeia com três recortes pedidos pelas grandes plataformas: auditoria externa só para sistemas “críticos”, grace period de 18 meses e isenção automática para modelos open-source acima de um bilhão de parâmetros.",
        emphasized: ["Lobby das big techs em Brasília", "As três exclusões que beneficiam as grandes"],
        omitted: ["Posição das startups nacionais", "Prazo real de fiscalização no texto"],
        url: "https://g1.globo.com/tec/noticia/2026/06/lei-de-ia-comissao.ghtml",
        published: "há 7 h",
      },
      {
        outletId: "bbc",
        framing: "Padrão global",
        headline: "Brasil aprova em comissão marco legal para inteligência artificial",
        quote:
          "O texto aprovado segue a linha da lei europeia, mas com recortes locais: só uso de IA em saúde e crédito entra na categoria de risco alto, e chatbots de órgãos públicos passam a ter de se identificar como máquinas.",
        emphasized: ["Comparação com a lei europeia e a da China", "Entrevista com especialistas em SP e Lisboa"],
        omitted: ["Bastidores da votação na comissão", "Custos de conformidade para empresas"],
        url: "https://www.bbc.com/portuguese/articles/brasil-lei-ia-comissao",
        published: "há 8 h",
      },
      {
        outletId: "folha",
        framing: "Rito legislativo",
        headline: "Lei de IA segue para o plenário com 41 emendas; 9 alteram regra de risco",
        quote:
          "Aprovado por 18 votos a 6, o substitutivo entra na ordem do dia da semana de 7 de setembro. Nove das 41 emendas pendentes mexem diretamente no artigo de classificação de risco — o coração do texto.",
        emphasized: ["Mapa das 41 emendas, assinadas por bancada", "Calendário de votações no plenário"],
        omitted: ["Avaliação editorial do conteúdo", "Impacto econômico da regulação"],
        url: "https://www1.folha.uol.com.br/tecnologia/lei-ia-plenário-2026",
        published: "há 6 h",
      },
      {
        outletId: "estadao",
        framing: "Custo de conformidade",
        headline: "Nova lei de IA pode custar R$ 8 mi por produto às empresas, dizem escritórios",
        quote:
          "Consultados pelo Estado, três escritórios especializados estimam em R$ 2 a 8 milhões o custo de conformidade por produto com uso de IA “de risco alto” — valor que, alertam, “empurra startups para fora do mercado brasileiro”.",
        emphasized: ["Estimativas financeiras por tamanho de empresa", "Cenário de saída de startups para o exterior"],
        omitted: ["Discussão sobre risco em serviços públicos", "O rito de votação no plenário"],
        url: "https://www.estadao.com.br/tecnologia/custo-lei-ia-2026",
        published: "há 7 h",
      },
    ],
  },

  /* ────────────────────────── 5 · JOGOS ────────────────────────── */
  {
    id: "selecao",
    theme: "jogos",
    kicker: "Jogos · Seleção",
    tags: ["#Seleção", "#Futebol", "#Brasil", "#Argentina", "#Esportes"],
    title: "Brasil vence Argentina por 3 a 1 em amistoso na Flórida; estreia a nova dupla de meias",
    summary:
      "Gols de Endrick (2) e Raphinha; o gol de honra argentino saiu de pênalti aos 84 min. A AFA chamou o resultado de “ruído estatístico”; a CBF, de “resposta”. A escalação vazou 40 minutos antes do apito inicial.",
    readTime: 5,
    time: "05:48",
    stamp: "4 veículos confirmam o mesmo placar",
    image: imgStadium,
    caption: "Hard Rock Stadium, em Miami — 61 mil torcedores no último teste antes da Copa.",
    consensus: [
      "O Brasil venceu por 3 a 1 no Hard Rock Stadium, em Miami, diante de 61.400 torcedores.",
      "Endrick marcou aos 23 e aos 58 minutos; Raphinha aos 77; o gol argentino saiu de pênalti aos 84.",
      "A escalação oficial da CBF foi publicada 40 minutos após o vazamento — a diretoria confirmou a versão em nota.",
      "Próximo jogo: 5 de setembro, contra a Espanha, em Chicago, último amistoso antes da Copa do Mundo.",
    ],
    divergences: [
      {
        point: "Como ler o teste",
        positions: [
          { outletId: "g1", take: "“Brasil dominou de ponta a ponta” — dá nota 9 ao técnico e destaca a posse de 68%." },
          { outletId: "cnn", take: "“Vitória confortável com time misto”: 7 titulares do último ciclo nem entraram em campo." },
          { outletId: "uol", take: "“A briga no ataque está ganha”: Endrick, eleito o melhor do mundo em 2026, fechou com dois gols." },
        ],
      },
    ],
    blindSpot:
      "Nenhuma redação perguntou ao corpo médico sobre o protocolo de calor aplicado no intervalo — o jogo foi disputado a 34 °C e 78% de umidade, dentro do limite que os próprios jogadores reclamam.",
    coverage: [
      {
        outletId: "g1",
        framing: "Domínio total",
        headline: "Brasil domina Argentina de ponta a ponta e vence amistoso na Flórida",
        quote:
          "Com posse de 68% e 19 finalizações — metade no alvo —, a seleção controlou o amistoso diante da Argentina: Endrick abriu e fechou a participação dele, e Raphinha ampliou no segundo tempo diante de 61 mil torcedores.",
        emphasized: ["Estatísticas completas de posse e finalização", "Avaliação individual: nota 9 ao técnico"],
        omitted: ["O vazamento da escalação", "Declarações da AFA após o jogo"],
        url: "https://g1.globo.com/esporte/futebol/selecao/brasil-3-1-argentina.ghtml",
        published: "há 12 h",
      },
      {
        outletId: "cnn",
        framing: "Time misto",
        headline: "Vitória fácil, mas com sete titulares fora: o que o amistoso não mostra",
        quote:
          "Sete dos onze que encerraram o último ciclo não entraram em campo em Miami; entre eles, os dois zagueiros de origem e o lateral direito titular. A vitória por 3 a 1, por isso, mede menos o time da Copa do que o banco dele.",
        emphasized: ["Comparativo da escalação com a última Copa", "Desempenho individual dos reservas"],
        omitted: ["Estatísticas de posse e finalização", "Reação da torcida no estádio"],
        url: "https://www.cnnbrasil.com.br/esportes/futebol/amistoso-brasil-argentina/",
        published: "há 11 h",
      },
      {
        outletId: "uol",
        framing: "Endrick, o melhor",
        headline: "Endrick faz dois e encerra a briga no ataque da seleção, diz UOL",
        quote:
          "Autor de dois gols contra a Argentina, Endrick chegou a 14 gols em 21 jogos com a camisa da seleção e, para a redação do UOL, “a concorrência na ponta esquerda deixou de existir” para a Copa do Mundo.",
        emphasized: ["Números de Endrick na seleção, jogo a jogo", "Enquete com leitores sobre o onze da Copa"],
        omitted: ["Estrutura tática da nova dupla de meias", "Clima do vestiário argentino"],
        url: "https://www.uol.com.br/esporte/futebol/ultimas-noticias/2026/06/brasil-argentina-endrick.htm",
        published: "há 12 h",
      },
      {
        outletId: "bbc",
        framing: "Ruído estatístico",
        headline: "Brasil vence, mas amistoso é ruído antes da Copa, diz AFA",
        quote:
          "A Associação do Futebol Argentino classificou o resultado como “ruído estatístico de um calendário pré-Copa” e ressaltou que “o amistoso não altera a hierarquia entre as duas seleções” — frase recebida como provocação pela torcida brasileira.",
        emphasized: ["Nota oficial da AFA, integral e em tradução", "Repercussão da frase na torcida brasileira"],
        omitted: ["Análise tática do jogo", "Escalação vazada 40 minutos antes"],
        url: "https://www.bbc.com/portuguese/articles/amistoso-brasil-argentina-copa",
        published: "há 10 h",
      },
    ],
  },

  /* ────────────────────────── 6 · MUNDO ────────────────────────── */
  {
    id: "tarifas",
    theme: "mundo",
    kicker: "Mundo · Comércio",
    tags: ["#Mundo", "#EUA", "#China", "#Tarifas", "#Comércio", "#Dólar", "#Mercado"],
    title: "EUA e China anunciam corte de tarifas em 34 produtos estratégicos após Genebra",
    summary:
      "Semicondutores, lítio e aeronaves entram no primeiro bloco de desescalonamento, com redução média de 18 pontos. O acordo cria canal direto entre ministérios — mas a tarifa-chave de 30% sobre aço segue intacta.",
    readTime: 8,
    time: "07:15",
    stamp: "5 veículos confirmam a mesma lista",
    consensus: [
      "O comunicado conjunto cita 34 produtos com redução média de 18 pontos percentuais de tarifa.",
      "A revisão será semestral, em Genebra, com o próximo encontro previsto para fevereiro de 2027.",
      "A tarifa-chave sobre aço (30%) e sobre lítio (25%) permanece inalterada no texto final.",
      "Washington e Pequim criaram um canal direto entre os ministérios do Comércio, inédito desde 2019.",
    ],
    divergences: [
      {
        point: "Quem cedeu mais",
        positions: [
          { outletId: "reuters", take: "Item a item: “o desescalonamento é simétrico em 22 dos 34 produtos” — e assimétrico nos 12 restantes." },
          { outletId: "bbc", take: "Cita analistas: “Pequim ganhou o que queria em semicondutores; Washington, em agricultura”." },
        ],
      },
      {
        point: "O efeito no Brasil",
        positions: [
          { outletId: "valor", take: "“A janela abre para aeronaves regionais”: o corte nos aviões favorece o jato brasileiro em construção." },
          { outletId: "estadao", take: "Foco no aço: “a tarifa-chave segue blindando o mercado americano” — e o Brasil segue de fora." },
        ],
      },
    ],
    blindSpot:
      "Nenhuma redação levantou o destino dos créditos de importadores americanos beneficiados pelo corte — títulos que, segundo operadores, já são negociados em mercado secundário na Ásia a 72 centavos por dólar.",
    coverage: [
      {
        outletId: "reuters",
        framing: "Item a item",
        headline: "US, China agree to cut tariffs on 34 strategic goods in first Geneva phase",
        quote:
          "As tarifas sobre 34 produtos caíram em média 18 pontos percentuais na primeira fase acordada em Genebra; a lista inclui semicondutores, lítio e aeronaves, mas preserva os 30% sobre aço e 25% sobre lítio refinado.",
        emphasized: ["A lista completa dos 34 produtos, com percentuais", "Simetria do desescalonamento item a item"],
        omitted: ["Impacto setorial no Brasil", "Negociações paralelas da OMC"],
        url: "https://www.reuters.com/business/us-china-tariffs-geneva-2026",
        published: "há 9 h",
      },
      {
        outletId: "bbc",
        framing: "Quem ganhou",
        headline: "Quem saiu ganhando no acordo comercial entre EUA e China",
        quote:
          "Analistas ouvidos pela BBC leem o acordo em duas colunas: Pequim garantiu alívio em semicondutores — sua prioridade declarada — enquanto Washington obteve concessões agrícolas que “os estados do centro-Oeste vão comemorar”.",
        emphasized: ["Leitura comparada de dois analistas", "O mapa dos setores favorecidos de cada lado"],
        omitted: ["Os créditos de importadores em circulação", "Detalhamento da lista de 34 itens"],
        url: "https://www.bbc.com/portuguese/articles/eua-china-acordo-comercial",
        published: "há 8 h",
      },
      {
        outletId: "valor",
        framing: "Janela para o jato",
        headline: "Corte de tarifas abre janela para jato regional brasileiro nos EUA",
        quote:
          "Com a tarifa sobre aeronaves caindo de 14% para 4% no pacote de Genebra, o jato regional em finalização de produção no Brasil passa a ser competitivo no mercado americano — “a janela que o setor perseguia há três governos”.",
        emphasized: ["Cálculo de competitividade do jato regional", "Histórico de tentativas de acesso ao mercado americano"],
        omitted: ["A tarifa-chave de aço (30%) intacta", "O canal direto entre ministérios"],
        url: "https://valor.globo.com/mercados/noticia/2026/06/tarifas-eua-china-aeronaves.ghtml",
        published: "há 7 h",
      },
      {
        outletId: "estadao",
        framing: "Aço segue blindado",
        headline: "Acordo EUA-China preserva tarifa-chave de 30% sobre o aço",
        quote:
          "O que não entrou no pacote de Genebra importa mais do que o que entrou: a tarifa de 30% sobre aço e a de 25% sobre lítio refinado seguem intactas, o que mantém o mercado americano blindado — e a siderurgia brasileira sem o acesso que pedia desde 2024.",
        emphasized: ["O que ficou de fora da lista, com números", "A pauta da siderurgia brasileira no assunto"],
        omitted: ["Aeronaves e a janela para o jato regional", "A revisão semestral e o canal direto"],
        url: "https://www.estadao.com.br/economia/acordo-eua-china-acoc",
        published: "há 9 h",
      },
      {
        outletId: "g1",
        framing: "Resumo do dia",
        headline: "EUA e China reduzem tarifas: veja o que muda e o que fica",
        quote:
          "Do semicondutor ao lítio, a rodada de Genebra corta tarifas em 34 produtos e cria um canal direto entre os ministérios do Comércio — mas mantém as tarifas-chave sobre aço e lítio refinado, as mais sensíveis para o Brasil.",
        emphasized: ["Quadro “o que muda e o que fica”", "Reações de chanceleres, em nota"],
        omitted: ["Impacto detalhado por setor brasileiro", "Os créditos de importadores negociados na Ásia"],
        url: "https://g1.globo.com/economia/noticia/2026/06/eua-china-tarifas-genebra.ghtml",
        published: "há 6 h",
      },
    ],
  },

  /* ────────────────────────── 7 · BRASIL ────────────────────────── */
  {
    id: "salario-minimo",
    theme: "brasil",
    kicker: "Brasil · Trabalho",
    tags: ["#Governo", "#SalárioMínimo", "#Economia", "#Trabalho", "#Fiscal", "#Mercado"],
    title: "Salário mínimo sobe 4,7% em 2026 e fica em R$ 1.630; custo fiscal é de R$ 14,3 bi",
    summary:
      "O reajuste, atrelado à inflação oficial de 4,5% em 12 meses, vale desde 1º de janeiro e equivale a R$ 65,20 por dia — o maior patamar real desde 1994. O MEF projeta impacto de R$ 14,3 bilhões no ano, com 610 mil novos beneficiários do BPC.",
    readTime: 5,
    time: "08:30",
    stamp: "4 veículos confirmam o mesmo valor",
    consensus: [
      "O salário mínimo subiu de R$ 1.557 para R$ 1.630 — reajuste de 4,7%, conforme o INPC de 12 meses fechado em 4,5%.",
      "O custo fiscal direto é de R$ 14,3 bilhões no ano, com impacto em 610 mil novos benefícios do BPC e na tabela do IRPF.",
      "O decreto com a nova tabela do IRPF foi publicado no DOU de 28 de dezembro de 2025.",
      "O valor equivale a R$ 65,20 por dia, o maior patamar real registrado desde 1994.",
    ],
    divergences: [
      {
        point: "O aumento valeu pelo que custou?",
        positions: [
          { outletId: "uol", take: "“Ganho real é ilusão”: a cesta básica subiu 6,1% no ano, aponta levantamento próprio da redação." },
          { outletId: "g1", take: "“Maior nível real desde 1994”: publica a série histórica corrigida desde 1994, mês a mês." },
        ],
      },
    ],
    blindSpot:
      "Nenhuma redação cruzou o reajuste com a renda da massa trabalhadora informal — que, por definição, não recebe o mínimo, mas o usa como referência de preço em todo o comércio de base.",
    coverage: [
      {
        outletId: "uol",
        framing: "Ganho ilusório",
        headline: "Salário mínimo sobe 4,7%, mas cesta básica corroeu o ganho, aponta UOL",
        quote:
          "O reajuste de 4,7% ficou abaixo da inflação da cesta básica monitorada pelo UOL (6,1% no ano): na comparação, o salário mínimo perdeu 1,5 ponto de poder de compra — “o ganho real é ilusão”, conclui a redação.",
        emphasized: ["Cesta básica da redação, com 24 capitais", "Perda de 1,5 ponto de poder de compra"],
        omitted: ["A série histórica real desde 1994", "O decreto da tabela do IRPF no DOU"],
        url: "https://www.uol.com.br/economia/ultimas-noticias/2026/01/salario-minimo-2026.htm",
        published: "há 15 h",
      },
      {
        outletId: "g1",
        framing: "Série histórica",
        headline: "Salário mínimo atinge o maior nível real desde 1994, mostra série",
        quote:
          "Corrigido pela inflação oficial, o salário de R$ 1.630 corresponde ao maior patamar real da série desde o Plano Real: o gráfico do G1 mostra 12 de os 15 maiores valores históricos na última década.",
        emphasized: ["Série histórica completa, mês a mês desde 1994", "O cruzamento com o INPC dos últimos 10 anos"],
        omitted: ["Variação da cesta básica", "Impacto no orçamento do BPC"],
        url: "https://g1.globo.com/economia/noticia/2026/01/salario-minimo-1630-serie.ghtml",
        published: "há 14 h",
      },
      {
        outletId: "folha",
        framing: "Arquivo oficial",
        headline: "Decreta: salário mínimo 2026 fica em R$ 1.630; MEF estima custo de R$ 14,3 bi",
        quote:
          "Publicado no Diário Oficial de 28 de dezembro, o decreto fixa o salário mínimo em R$ 1.630 a partir de 1º de janeiro; a nota técnica do MEF estima custo de R$ 14,3 bilhões, majoritariamente via BPC e tabela do IRPF.",
        emphasized: ["Texto integral do decreto e da nota técnica do MEF", "Razão do cálculo: INPC de 12 meses em 4,5%"],
        omitted: ["Debate sobre poder de compra", "Série histórica comparada"],
        url: "https://www1.folha.uol.com.br/economia/salario-minimo-2026-decreto",
        published: "há 16 h",
      },
      {
        outletId: "reuters",
        framing: "Números puros",
        headline: "Brazil raises minimum wage 4.7% to 1,630 reais for 2026, decree says",
        quote:
          "O salário mínimo brasileiro passou de R$ 1.557 para R$ 1.630 a partir de janeiro, reajuste de 4,7% que segue o INPC de 12 meses; o governo estima o impacto fiscal em R$ 14,3 bilhões, segundo decreto publicado no diário oficial.",
        emphasized: ["Os três números: valor, percentual e custo fiscal", "Fonte primária: o decreto no diário oficial"],
        omitted: ["Avaliações de especialistas", "Contexto comparado com a cesta básica"],
        url: "https://www.reuters.com/business/brazil-minimum-wage-2026",
        published: "há 17 h",
      },
    ],
  },
];

export const COVER_STORY = STORIES.find((s) => s.cover) ?? STORIES[0];

/** fita de cotações da capa */
export const TICKER: { label: string; value: string; dir: "up" | "down" | "flat" }[] = [
  { label: "SELEC", value: "14,00% a.a.", dir: "down" },
  { label: "IPCA AGO", value: "0,21%", dir: "flat" },
  { label: "DÓLAR", value: "R$ 5,42", dir: "up" },
  { label: "IBOV", value: "132.480", dir: "down" },
  { label: "EUROS 5A", value: "R$ 5,98", dir: "up" },
  { label: "WTI", value: "US$ 63,10", dir: "up" },
  { label: "BTC", value: "R$ 352 mil", dir: "up" },
  { label: "SWAP 2029", value: "12,90%", dir: "down" },
  { label: "BCH 2030", value: "128,4 pts", dir: "flat" },
];

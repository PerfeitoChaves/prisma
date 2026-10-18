/**
 * PRISMA — Geopolitical Dataset & Narrative Matrices
 * Milestone M6: 8 Strategic Hotspots, Tri-Axial Narrative Matrices, and Helper Functions
 */

import type {
  GeopoliticalBloc,
  TensionSeverity,
  Hotspot,
  NarrativeMatrix,
  BlocNarrative,
} from "../types/geopolitics";
import { OUTLETS, type Outlet } from "./news";

export type {
  GeopoliticalBloc,
  TensionSeverity,
  Hotspot,
  NarrativeMatrix,
  BlocNarrative,
};

export interface GeopoliticalBlocMeta {
  id: GeopoliticalBloc;
  name: string;
  subtitle: string;
  color: string;
  badgeClass: string;
  description: string;
}

export const GEOPOLITICAL_BLOCS: Record<GeopoliticalBloc, GeopoliticalBlocMeta> = {
  west: {
    id: "west",
    name: "Bloco Ocidental",
    subtitle: "EUA, União Europeia, Reino Unido, Japão e aliados",
    color: "#2563eb",
    badgeClass: "bg-blue-950/60 border-blue-500/40 text-blue-300",
    description:
      "Foco em defesa de rotas de navegação internacional, contenção de autocracias e regimes revisionistas, sanções econômicas coordenadas e segurança coletiva da OTAN.",
  },
  east: {
    id: "east",
    name: "Bloco Eurasiático / Oriental",
    subtitle: "China, Rússia, Irã e parceiros estratégicos",
    color: "#dc2626",
    badgeClass: "bg-red-950/60 border-red-500/40 text-red-300",
    description:
      "Foco em denúncia de ingerência externa e hegemonismo unilateral norte-americano, soberania estatal contra sanções unilaterais, retaliação defensiva e construção de ordem multipolar.",
  },
  global_south: {
    id: "global_south",
    name: "Sul Global & Neutros",
    subtitle: "Brasil, Índia, Argentina, Tailândia e Mundo Árabe",
    color: "#d97706",
    badgeClass: "bg-amber-950/60 border-amber-500/40 text-amber-300",
    description:
      "Foco em custos de combustíveis e alimentos, apelo por cessar-fogo e desescalada imediata, mediação diplomática despolarizada e preservação do comércio multilateral.",
  },
};

export const HOTSPOTS: Hotspot[] = [
  {
    id: "ormuz",
    title: "Estreito de Ormuz",
    name: "Estreito de Ormuz",
    region: "Golfo Pérsico & Oriente Médio",
    coordinates: { lat: 26.56, lng: 56.25 },
    svgCoordinates: { x: 656, y: 176 },
    svgCoords: { x: 656, y: 176 },
    severity: "critico",
    tensionLevel: "critico",
    tensionScore: 92,
    summary:
      "Ponto de estrangulamento por onde transita cerca de 20% do petróleo mundial. Tensões permanentes envolvendo interceptação de petroleiros pelo Irã, patrulhas navais dos EUA e risco de interrupção no fornecimento global de energia.",
    strategicImportance:
      "Chokepoint estratégico vital para a segurança energética da Ásia e Europa; qualquer bloqueio causa choque imediato no barril de petróleo e no frete marítimo internacional.",
    strategicRelevance:
      "Chokepoint estratégico vital para a segurança energética da Ásia e Europa; qualquer bloqueio causa choque imediato no barril de petróleo e no frete marítimo internacional.",
    newsCount: 28,
    articleCount: 28,
    relatedStoryIds: ["ormuz", "tarifas"],
    correlatedStoryIds: ["ormuz", "tarifas"],
    updatedAt: "2026-10-18T18:00:00Z",
    actors: [
      {
        id: "ira",
        name: "Irã",
        country: "Irã",
        countryCode: "IR",
        flagEmoji: "🇮🇷",
        flag: "🇮🇷",
        bloc: "east",
        role: "Controle da margem norte do estreito; interceptações e vigilância costeira pela Guarda Revolucionária (IRGC)",
      },
      {
        id: "eua",
        name: "Estados Unidos",
        country: "EUA",
        countryCode: "US",
        flagEmoji: "🇺🇸",
        flag: "🇺🇸",
        bloc: "west",
        role: "5ª Frota Naval no Bahrein; operações de patrulha e escolta armada a navios mercantes",
      },
      {
        id: "arabia_saudita",
        name: "Arábia Saudita",
        country: "Arábia Saudita",
        countryCode: "SA",
        flagEmoji: "🇸🇦",
        flag: "🇸🇦",
        bloc: "global_south",
        role: "Maior exportador da OPEP com terminais no Golfo; busca de rotas alternativas terrestres e moderação regional",
      },
      {
        id: "emirados",
        name: "Emirados Árabes Unidos",
        country: "EAU",
        countryCode: "AE",
        flagEmoji: "🇦🇪",
        flag: "🇦🇪",
        bloc: "global_south",
        role: "Hub de logística de Fujairah e defesa de portos comerciais sem escalada militar direta",
      },
    ],
  },
  {
    id: "ucrania",
    title: "Guerra da Ucrânia & Leste Europeu",
    name: "Guerra da Ucrânia & Leste Europeu",
    region: "Leste Europeu",
    coordinates: { lat: 48.37, lng: 31.16 },
    svgCoordinates: { x: 588, y: 114 },
    svgCoords: { x: 588, y: 114 },
    severity: "critico",
    tensionLevel: "critico",
    tensionScore: 96,
    summary:
      "Conflito militar em grande escala entre a Rússia e a Ucrânia, apoiada por suprimentos militares e inteligência da OTAN. Impactos severos no suprimento de grãos, fertilizantes e na arquitetura de segurança da Eurásia.",
    strategicImportance:
      "Maior guerra territorial na Europa desde 1945, redefinindo alianças militares, gastos de defesa ocidentais e a aceleração da multipolaridade econômica.",
    strategicRelevance:
      "Maior guerra territorial na Europa desde 1945, redefinindo alianças militares, gastos de defesa ocidentais e a aceleração da multipolaridade econômica.",
    newsCount: 42,
    articleCount: 42,
    relatedStoryIds: ["ucrania"],
    correlatedStoryIds: ["ucrania"],
    updatedAt: "2026-10-18T18:00:00Z",
    actors: [
      {
        id: "ucrania",
        name: "Ucrânia",
        country: "Ucrânia",
        countryCode: "UA",
        flagEmoji: "🇺🇦",
        flag: "🇺🇦",
        bloc: "west",
        role: "Defesa territorial da soberania nacional com armamento, inteligência e apoio financeiro ocidental",
      },
      {
        id: "russia",
        name: "Rússia",
        country: "Rússia",
        countryCode: "RU",
        flagEmoji: "🇷🇺",
        flag: "🇷🇺",
        bloc: "east",
        role: "Operações militares de controle do Donbas e Crimeia; oposição frontal à expansão da OTAN no leste europeu",
      },
      {
        id: "otan_eua",
        name: "OTAN / EUA",
        country: "EUA & Aliança Atlântica",
        countryCode: "US",
        flagEmoji: "🇺🇸",
        flag: "🇺🇸",
        bloc: "west",
        role: "Fornecimento de armamento avançado, pacotes de sanções contra Moscou e suporte operacional",
      },
      {
        id: "brasil_sul",
        name: "Brasil & Neutros",
        country: "Brasil / Índia",
        countryCode: "BR",
        flagEmoji: "🇧🇷",
        flag: "🇧🇷",
        bloc: "global_south",
        role: "Proposta de clube de paz mediador, preservação do fluxo de fertilizantes e comércio agrícola despolarizado",
      },
    ],
  },
  {
    id: "taiwan",
    title: "Estreito de Taiwan & Mar do Sul da China",
    name: "Estreito de Taiwan & Mar do Sul da China",
    region: "Ásia-Pacífico",
    coordinates: { lat: 23.50, lng: 119.50 },
    svgCoordinates: { x: 835, y: 183 },
    svgCoords: { x: 835, y: 183 },
    severity: "alto",
    tensionLevel: "alto",
    tensionScore: 88,
    summary:
      "Disputa de soberania sobre a ilha de Taiwan e rotas de navegação no Mar do Sul da China. Centro neválgico da produção global de semicondutores de ponta (TSMC) e rivalidade naval sino-americana.",
    strategicImportance:
      "Monopólio de semicondutores avançados e rota de trânsito de um terço do comércio marítimo global; epicentro da disputa hegemônica entre Pequim e Washington.",
    strategicRelevance:
      "Monopólio de semicondutores avançados e rota de trânsito de um terço do comércio marítimo global; epicentro da disputa hegemônica entre Pequim e Washington.",
    newsCount: 31,
    articleCount: 31,
    relatedStoryIds: ["taiwan", "tarifas"],
    correlatedStoryIds: ["taiwan", "tarifas"],
    updatedAt: "2026-10-18T18:00:00Z",
    actors: [
      {
        id: "china",
        name: "China (República Popular)",
        country: "China",
        countryCode: "CN",
        flagEmoji: "🇨🇳",
        flag: "🇨🇳",
        bloc: "east",
        role: "Reivindicação do Princípio de Uma Só China e exercícios militares de cerco aeronaval",
      },
      {
        id: "taiwan",
        name: "Taiwan (República da China)",
        country: "Taiwan",
        countryCode: "TW",
        flagEmoji: "🇹🇼",
        flag: "🇹🇼",
        bloc: "west",
        role: "Autodefesa democrática, liderança global em microchips e estreitamento de laços de segurança com os EUA",
      },
      {
        id: "eua_indo_pacifico",
        name: "EUA (Comando Indo-Pacífico)",
        country: "EUA",
        countryCode: "US",
        flagEmoji: "🇺🇸",
        flag: "🇺🇸",
        bloc: "west",
        role: "Ambiguidade estratégica, vendas militares substanciais e manobras navais de liberdade de trânsito",
      },
      {
        id: "asean_th",
        name: "Tailândia & ASEAN",
        country: "Tailândia",
        countryCode: "TH",
        flagEmoji: "🇹🇭",
        flag: "🇹🇭",
        bloc: "global_south",
        role: "Equilíbrio diplomático pragmático sem ruptura de comércio regional nem com Pequim nem com Washington",
      },
    ],
  },
  {
    id: "mar_vermelho",
    title: "Mar Vermelho & Bab el-Mandeb",
    name: "Mar Vermelho & Bab el-Mandeb",
    region: "Chifre da África / Oriente Médio",
    coordinates: { lat: 12.58, lng: 43.33 },
    svgCoordinates: { x: 621, y: 213 },
    svgCoords: { x: 621, y: 213 },
    severity: "critico",
    tensionLevel: "critico",
    tensionScore: 91,
    summary:
      "Ataques com mísseis e drones lançados pelo movimento Ansar Allah (Houthis) do Iêmen contra navios comerciais no Estreito de Bab el-Mandeb, forçando navios mercantes a contornar o Cabo da Boa Esperança.",
    strategicImportance:
      "Porta de entrada para o Canal de Suez, responsável por 12% a 15% do comércio marítimo global; desvio de rotas atrasa entregas entre Ásia e Europa em até 14 dias e eleva fretes.",
    strategicRelevance:
      "Porta de entrada para o Canal de Suez, responsável por 12% a 15% do comércio marítimo global; desvio de rotas atrasa entregas entre Ásia e Europa em até 14 dias e eleva fretes.",
    newsCount: 24,
    articleCount: 24,
    relatedStoryIds: ["mar-vermelho", "ormuz"],
    correlatedStoryIds: ["mar-vermelho", "ormuz"],
    updatedAt: "2026-10-18T18:00:00Z",
    actors: [
      {
        id: "houthis",
        name: "Houthis / Ansar Allah",
        country: "Iêmen",
        countryCode: "YE",
        flagEmoji: "🇾🇪",
        flag: "🇾🇪",
        bloc: "east",
        role: "Bloqueio armado e disparos contra embarcações comerciais em solidariedade declarada a Gaza",
      },
      {
        id: "eua_prosperity",
        name: "EUA / Operação Prosperity Guardian",
        country: "EUA & Reino Unido",
        countryCode: "US",
        flagEmoji: "🇺🇸",
        flag: "🇺🇸",
        bloc: "west",
        role: "Ataques de retaliação aérea contra depósitos de mísseis e radares no Iêmen e escolta a cargueiros",
      },
      {
        id: "egito",
        name: "Egito",
        country: "Egito",
        countryCode: "EG",
        flagEmoji: "🇪🇬",
        flag: "🇪🇬",
        bloc: "global_south",
        role: "Queda crítica de mais de 50% nas receitas do Canal de Suez com o desvio de navios pelo sul da África",
      },
      {
        id: "ira_apoio",
        name: "Irã",
        country: "Irã",
        countryCode: "IR",
        flagEmoji: "🇮🇷",
        flag: "🇮🇷",
        bloc: "east",
        role: "Fornecimento de vetores aéreos não tripulados e coordenação tática com o Eixo de Resistência",
      },
    ],
  },
  {
    id: "gaza",
    title: "Gaza & Oriente Médio Expandido",
    name: "Gaza & Oriente Médio Expandido",
    region: "Levante / Oriente Médio",
    coordinates: { lat: 31.50, lng: 34.46 },
    svgCoordinates: { x: 596, y: 163 },
    svgCoords: { x: 596, y: 163 },
    severity: "critico",
    tensionLevel: "critico",
    tensionScore: 98,
    summary:
      "Conflito bélico em Gaza com desdobramentos armados na fronteira de Israel com o Líbano (Hezbollah), Síria e trocas de ataques com o Irã. Grave crise humanitária e polarização profunda no Conselho de Segurança da ONU.",
    strategicImportance:
      "Risco iminente de conflagração regional em escala total entre potências nucleares e aliados regionais, paralisando acordos diplomáticos históricos no Oriente Médio.",
    strategicRelevance:
      "Risco iminente de conflagração regional em escala total entre potências nucleares e aliados regionais, paralisando acordos diplomáticos históricos no Oriente Médio.",
    newsCount: 39,
    articleCount: 39,
    relatedStoryIds: ["gaza"],
    correlatedStoryIds: ["gaza"],
    updatedAt: "2026-10-18T18:00:00Z",
    actors: [
      {
        id: "israel",
        name: "Israel",
        country: "Israel",
        countryCode: "IL",
        flagEmoji: "🇮🇱",
        flag: "🇮🇱",
        bloc: "west",
        role: "Operações militares de eliminação das redes de comando do Hamas e Hezbollah e dissuasão do Irã",
      },
      {
        id: "palestina_hamas",
        name: "Palestina / Gaza",
        country: "Palestina",
        countryCode: "PS",
        flagEmoji: "🇵🇸",
        flag: "🇵🇸",
        bloc: "global_south",
        role: "Resistência civil e armada, apelos internacionais pelo fim do cerco humanitário e criação do Estado palestino",
      },
      {
        id: "hezbollah_ira",
        name: "Hezbollah & Irã",
        country: "Líbano / Irã",
        countryCode: "IR",
        flagEmoji: "🇮🇷",
        flag: "🇮🇷",
        bloc: "east",
        role: "Pressão de atrito na fronteira norte e articulação de apoio bélico e financeiro ao Eixo de Resistência",
      },
      {
        id: "qatar_arabes",
        name: "Catar & Nações Árabes",
        country: "Catar / Arábia Saudita",
        countryCode: "QA",
        flagEmoji: "🇶🇦",
        flag: "🇶🇦",
        bloc: "global_south",
        role: "Mediação para cessar-fogo, negociações de reféns e envio maciço de ajuda humanitária emergencial",
      },
    ],
  },
  {
    id: "coreia",
    title: "Península Coreana",
    name: "Península Coreana",
    region: "Leste Asiático",
    coordinates: { lat: 38.00, lng: 127.50 },
    svgCoordinates: { x: 854, y: 144 },
    svgCoords: { x: 854, y: 144 },
    severity: "alto",
    tensionLevel: "alto",
    tensionScore: 84,
    summary:
      "Aceleração de testes de mísseis balísticos intercontinentais e cooperação militar reforçada entre Pyongyang e Moscou, acompanhada por exercícios navais conjuntos entre EUA, Coreia do Sul e Japão.",
    strategicImportance:
      "Fronteira militarizada com armas nucleares e forças de dissuasão estratégica em prontidão máxima ao longo da Linha de Demarcação Militar do Paralelo 38.",
    strategicRelevance:
      "Fronteira militarizada com armas nucleares e forças de dissuasão estratégica em prontidão máxima ao longo da Linha de Demarcação Militar do Paralelo 38.",
    newsCount: 19,
    articleCount: 19,
    relatedStoryIds: ["coreia"],
    correlatedStoryIds: ["coreia"],
    updatedAt: "2026-10-18T18:00:00Z",
    actors: [
      {
        id: "coreia_norte",
        name: "Coreia do Norte (RPDC)",
        country: "Coreia do Norte",
        countryCode: "KP",
        flagEmoji: "🇰🇵",
        flag: "🇰🇵",
        bloc: "east",
        role: "Modernização nuclear, lançamentos de mísseis hipersônicos e aliança estratégica com Moscou",
      },
      {
        id: "coreia_sul",
        name: "Coreia do Sul (ROK)",
        country: "Coreia do Sul",
        countryCode: "KR",
        flagEmoji: "🇰🇷",
        flag: "🇰🇷",
        bloc: "west",
        role: "Fortalecimento da aliança com os EUA e resposta dissuasiva contra provocações ao norte",
      },
      {
        id: "eua_japao",
        name: "EUA & Japão",
        country: "EUA / Japão",
        countryCode: "JP",
        flagEmoji: "🇯🇵",
        flag: "🇯🇵",
        bloc: "west",
        role: "Patrulhas com submarinos nucleares e compartilhamento trilateral de inteligência de radares",
      },
      {
        id: "china_coreia",
        name: "China",
        country: "China",
        countryCode: "CN",
        flagEmoji: "🇨🇳",
        flag: "🇨🇳",
        bloc: "east",
        role: "Defesa da estabilidade na península e oposição ao cerco de sistemas antimísseis THAAD americanos",
      },
    ],
  },
  {
    id: "sahel",
    title: "Sahel Africano & Sudão",
    name: "Sahel Africano & Sudão",
    region: "África Central e Ocidental",
    coordinates: { lat: 15.00, lng: 25.00 },
    svgCoordinates: { x: 572, y: 210 },
    svgCoords: { x: 572, y: 210 },
    severity: "moderado",
    tensionLevel: "moderado",
    tensionScore: 78,
    summary:
      "Onda de golpes militares (Mali, Burkina Faso, Níger), ruptura de tratados com a França, expulsão de forças ocidentais, aproximação com forças de segurança russas (Africa Corps) e guerra civil no Sudão.",
    strategicImportance:
      "Região chave para contenção do jihadismo islâmico, controle de reservas de urânio e ouro e rotas de migração transaariana rumo ao Mediterrâneo.",
    strategicRelevance:
      "Região chave para contenção do jihadismo islâmico, controle de reservas de urânio e ouro e rotas de migração transaariana rumo ao Mediterrâneo.",
    newsCount: 16,
    articleCount: 16,
    relatedStoryIds: ["sahel"],
    correlatedStoryIds: ["sahel"],
    updatedAt: "2026-10-18T18:00:00Z",
    actors: [
      {
        id: "juntas_sahel",
        name: "Aliança dos Estados do Sahel (AES)",
        country: "Mali / Níger / Burkina",
        countryCode: "ML",
        flagEmoji: "🇲🇱",
        flag: "🇲🇱",
        bloc: "east",
        role: "Rompimento com a CEDEAO e França e consolidação de governança militar soberanista",
      },
      {
        id: "russia_africa",
        name: "Rússia (Africa Corps)",
        country: "Rússia",
        countryCode: "RU",
        flagEmoji: "🇷🇺",
        flag: "🇷🇺",
        bloc: "east",
        role: "Apoio militar direto, segurança pretoriana e exploração de recursos minerais estratégicos",
      },
      {
        id: "franca_ue",
        name: "França / União Europeia",
        country: "França & UE",
        countryCode: "FR",
        flagEmoji: "🇫🇷",
        flag: "🇫🇷",
        bloc: "west",
        role: "Retirada forçada de tropas e tentativa de conter perda de influência na África francófona",
      },
      {
        id: "uniao_africana",
        name: "União Africana & Brasil",
        country: "União Africana / Brasil",
        countryCode: "BR",
        flagEmoji: "🇧🇷",
        flag: "🇧🇷",
        bloc: "global_south",
        role: "Defesa de soluções africanas para problemas africanos, soberania alimentar e cooperação Sul-Sul",
      },
    ],
  },
  {
    id: "essequibo",
    title: "América do Sul / Essequibo",
    name: "América do Sul / Essequibo",
    region: "América do Sul Setentrional",
    coordinates: { lat: 6.50, lng: -59.00 },
    svgCoordinates: { x: 336, y: 232 },
    svgCoords: { x: 336, y: 232 },
    severity: "moderado",
    tensionLevel: "moderado",
    tensionScore: 72,
    summary:
      "Disputa territorial centenária reacendida após a descoberta de gigantescas reservas petrolíferas offshore na costa da Guiana. A Venezuela realizou referendo reivindicando o território da Guiana Essequiba.",
    strategicImportance:
      "Estabilidade geopolítica na América do Sul e controle de reservas de petróleo exploradas pela ExxonMobil; desafio direto para a diplomacia de mediação do Brasil (Itamaraty).",
    strategicRelevance:
      "Estabilidade geopolítica na América do Sul e controle de reservas de petróleo exploradas pela ExxonMobil; desafio direto para a diplomacia de mediação do Brasil (Itamaraty).",
    newsCount: 15,
    articleCount: 15,
    relatedStoryIds: ["essequibo", "tarifas"],
    correlatedStoryIds: ["essequibo", "tarifas"],
    updatedAt: "2026-10-18T18:00:00Z",
    actors: [
      {
        id: "venezuela",
        name: "Venezuela",
        country: "Venezuela",
        countryCode: "VE",
        flagEmoji: "🇻🇪",
        flag: "🇻🇪",
        bloc: "east",
        role: "Reivindicação histórica do Acordo de Genebra de 1966 e criação da província da Guiana Essequiba",
      },
      {
        id: "guiana",
        name: "Guiana",
        country: "Guiana",
        countryCode: "GY",
        flagEmoji: "🇬🇾",
        flag: "🇬🇾",
        bloc: "west",
        role: "Defesa da soberania territorial com base no Laudo de Paris de 1899 e parcerias de defesa com os EUA",
      },
      {
        id: "brasil_itamaraty",
        name: "Brasil (Itamaraty)",
        country: "Brasil",
        countryCode: "BR",
        flagEmoji: "🇧🇷",
        flag: "🇧🇷",
        bloc: "global_south",
        role: "Mediação para evitar escalada militar na fronteira norte de Roraima (Declaração de Argyle)",
      },
      {
        id: "eua_exxon",
        name: "EUA / Interesses Energéticos",
        country: "EUA",
        countryCode: "US",
        flagEmoji: "🇺🇸",
        flag: "🇺🇸",
        bloc: "west",
        role: "Manobras de sobrevoo militar com a Guiana e proteção dos investimentos petrolíferos da ExxonMobil",
      },
    ],
  },
];

export const NARRATIVE_MATRICES: Record<string, NarrativeMatrix> = {
  ormuz: {
    hotspotId: "ormuz",
    topicTitle: "Segurança de Navegação no Estreito de Ormuz",
    sharedFact:
      "Irã intercepta petroleiro em trânsito no Estreito de Ormuz; Marinha dos EUA eleva prontidão da 5ª Frota e barril do Brent registra forte volatilidade nos mercados globais.",
    comparatorStoryId: "tarifas",
    blocs: {
      west: {
        bloc: "west",
        blocName: "Bloco Ocidental",
        blocSubtitle: "EUA, União Europeia, Reino Unido, Japão",
        framingHeadline: "Pirataria estatal iraniana e ameaça imediata à livre navegação no Golfo",
        subdeck: "Washington e aliados da OTAN reforçam patrulhas navais em resposta à agressão não provocada de Teerã.",
        coreArgument:
          "A interceptação de petroleiros em águas internacionais viola a Convenção da ONU sobre o Direito do Mar (UNCLOS) e exige sanções ampliadas e presença naval ostensiva para garantir a segurança energética global.",
        vocabulary: [
          {
            term: "Pirataria estatal e apreensão ilegal",
            connotation: "negative",
            meaningOrContext: "Deslegitima a fiscalização iraniana como banditismo marítimo violador da UNCLOS",
          },
          {
            term: "Liberdade de navegação internacional",
            connotation: "positive",
            meaningOrContext: "Invoca o livre trânsito em estreitos internacionais para mobilizar a 5ª Frota Naval",
          },
          {
            term: "Regime de sanções e contenção militar",
            connotation: "neutral",
            meaningOrContext: "Enquadra medidas econômicas extraterritoriais como instrumentos legítimos de segurança",
          },
        ],
        representativeSources: ["wsj_world", "reuters", "nikkei_asia", "defensenews"],
        blindspots: [
          "Omite as apreensões prévias de cargas de petróleo iraniano executadas pela marinha dos EUA sob pretexto de sanções extraterritoriais",
          "Minimiza o impacto do cerco militar ocidental com bases permanentes no Bahrein, Catar e Omã cercando a costa do Irã",
          "Desconsidera a reivindicação de Teerã de combate ao contrabando sistemático de combustíveis subsidiados",
        ],
        realHeadlines: [
          {
            outlet: "The Wall Street Journal",
            outletId: "wsj_world",
            flag: "🇺🇸",
            title: "US Navy Deploys Guided-Missile Destroyer to Strait of Hormuz Following Iranian Tanker Seizure",
            framingTag: "Contenção Militar",
          },
          {
            outlet: "Reuters",
            outletId: "reuters",
            flag: "🇬🇧",
            title: "Oil rises 4% as Gulf shipping tensions escalate after vessel interception",
            framingTag: "Risco de Suprimento",
          },
          {
            outlet: "Defense News",
            outletId: "defensenews",
            flag: "🇺🇸",
            title: "Allied Coalition Considers Expanded Escort Task Force for Gulf Commercial Transit",
            framingTag: "Segurança Coletiva",
          },
        ],
        metrics: {
          escalationSentiment: 78,
          militaryEmphasis: 85,
          diplomaticEmphasis: 25,
        },
      },
      east: {
        bloc: "east",
        blocName: "Bloco Eurasiático / Oriental",
        blocSubtitle: "China, Rússia, Irã",
        framingHeadline: "Retaliação legítima contra pirataria unilateral e ingerência hegemônica no Golfo",
        subdeck: "Teerã e Moscou denunciam o confisco ilegal de cargas por Washington; Pequim pede segurança mútua sem imposições externas.",
        coreArgument:
          "A jurisdição costeira pertence aos países ribeirinhos do Golfo Pérsico; embarcações que violam normas de navegação ou contrabandeiam combustível sob proteção dos EUA são passíveis de retenção judicial soberana.",
        vocabulary: [
          {
            term: "Apreensão judicial legal / Retaliação proporcional",
            connotation: "positive",
            meaningOrContext: "Enquadra a retenção de embarcações como cumprimento de ordens soberanas da justiça local",
          },
          {
            term: "Provocação imperialista e hegemonismo",
            connotation: "negative",
            meaningOrContext: "Denuncia a presença militar ostensiva dos EUA operando a milhares de milhas de suas fronteiras",
          },
          {
            term: "Segurança indivisível e cooperação regional",
            connotation: "positive",
            meaningOrContext: "Defende que a segurança marítima deve ser gerida exclusivamente pelos vizinhos do Golfo",
          },
        ],
        representativeSources: ["irna_iran", "global_times", "tass", "scmp"],
        blindspots: [
          "Silencia o impacto adverso dos fechamentos de rotas marítimas sobre o encarecimento de fretes para economias do Sul",
          "Atenua o uso de armas e intimidação por forças da Guarda Revolucionária contra navios mercantes desarmados",
          "Evita discutir as consequências da interrupção de suprimentos para países importadores neutros",
        ],
        realHeadlines: [
          {
            outlet: "IRNA",
            outletId: "irna_iran",
            flag: "🇮🇷",
            title: "IRGC Seizes Smuggled Fuel Vessel in Persian Gulf Under Court Order Following US Oil Theft",
            framingTag: "Legalidade Soberana",
          },
          {
            outlet: "Global Times",
            outletId: "global_times",
            flag: "🇨🇳",
            title: "Middle East Stability Depends on Ending External Hegemonic Meddling in Maritime Chokepoints",
            framingTag: "Anti-Hegemonia",
          },
          {
            outlet: "TASS",
            outletId: "tass",
            flag: "🇷🇺",
            title: "Moscow Warns Against Western Escalation and Unilateral Provocations in Hormuz Waters",
            framingTag: "Aliança Estratégica",
          },
        ],
        metrics: {
          escalationSentiment: 72,
          militaryEmphasis: 80,
          diplomaticEmphasis: 30,
        },
      },
      global_south: {
        bloc: "global_south",
        blocName: "Sul Global & Neutros",
        blocSubtitle: "Brasil, Índia, Argentina, Tailândia, Mundo Árabe",
        framingHeadline: "Choque no preço dos combustíveis e apelo imediato por desescalada diplomática",
        subdeck: "Governos de países emergentes alertam para a disparada da inflação e pedem mediação despolarizada para manter o fluxo de energia.",
        coreArgument:
          "A disputa hegemônica entre Washington e Teerã penaliza desproporcionalmente as economias emergentes com a alta de fretes e combustíveis; o foco deve ser a via diplomática multilateral sem alinhamento automático.",
        vocabulary: [
          {
            term: "Impacto inflacionário / Risco fiscal nas commodities",
            connotation: "negative",
            meaningOrContext: "Foco nos custos econômicos suportados pela população de países em desenvolvimento",
          },
          {
            term: "Mediação multilateral e via diplomática",
            connotation: "positive",
            meaningOrContext: "Recusa em aderir a sanções unilaterais ou ações bélicas; priorização do diálogo na ONU",
          },
          {
            term: "Não alinhamento ativo e segurança energética",
            connotation: "neutral",
            meaningOrContext: "Defesa de que nações emergentes não devem se tornar reféns da rivalidade de superpotências",
          },
        ],
        representativeSources: ["folha", "aljazeera", "the_national_uae", "clarin_mundo"],
        blindspots: [
          "Postura de neutralidade muitas vezes equipara agressões armadas a medidas legais para proteger acordos comerciais",
          "Ausência de propostas práticas com poder coercitivo para garantir o fluxo seguro caso a diplomacia fracasse",
          "Tendência a priorizar cálculos de política econômica e fiscal doméstica sobre normas de direito internacional marítimo",
        ],
        realHeadlines: [
          {
            outlet: "Folha de S.Paulo",
            outletId: "folha",
            flag: "🇧🇷",
            title: "Tensão em Ormuz faz petróleo saltar e acende alerta de inflação no Banco Central e na Petrobras",
            framingTag: "Impacto Doméstico",
          },
          {
            outlet: "Al Jazeera English",
            outletId: "aljazeera",
            flag: "🇶🇦",
            title: "Gulf Diplomats Urge De-escalation as Hormuz Stand-off Threatens Vital Energy Arteries",
            framingTag: "Mediação Regional",
          },
          {
            outlet: "The National UAE",
            outletId: "the_national_uae",
            flag: "🇦🇪",
            title: "Regional Shippers Face Soaring Insurance Premiums Amid Escalating Gulf Standoff",
            framingTag: "Custos Logísticos",
          },
        ],
        metrics: {
          escalationSentiment: 45,
          militaryEmphasis: 35,
          diplomaticEmphasis: 88,
        },
      },
    },
  },

  ucrania: {
    hotspotId: "ucrania",
    topicTitle: "Conflito Militar Russo-Ucraniano & Segurança Europeia",
    sharedFact:
      "Linha de frente na Ucrânia oriental registra combates intensos no setor de Donbas; potências da OTAN debatem liberação de novos mísseis de longo alcance enquanto Moscou realiza manobras nucleares táticas.",
    comparatorStoryId: "ucrania",
    blocs: {
      west: {
        bloc: "west",
        blocName: "Bloco Ocidental",
        blocSubtitle: "EUA, Reino Unido, União Europeia, Ucrânia",
        framingHeadline: "Defesa inegociável da soberania ucraniana contra agressão imperial russa não provocada",
        subdeck: "Capitais ocidentais reforçam remessas de munição pesada e pacotes de sanções para conter a invasão ilegal de Putin.",
        coreArgument:
          "A integridade territorial e a autodeterminação dos povos são pilares invioláveis da ordem baseada em regras; concessões a Moscou destruiriam a arquitetura de segurança que mantém a paz europeia desde 1945.",
        vocabulary: [
          {
            term: "Invasão em grande escala não provocada",
            connotation: "negative",
            meaningOrContext: "Rejeita qualquer alegação de segurança preventiva invocada pela Rússia",
          },
          {
            term: "Ordem internacional baseada em regras",
            connotation: "positive",
            meaningOrContext: "Enquadra a integridade de fronteiras europeias como pilar existencial democrático",
          },
          {
            term: "Sanções econômicas coordenadas e apoio militar",
            connotation: "positive",
            meaningOrContext: "Isolamento financeiro de bancos russos e envio de baterias Patriot e caças modernos",
          },
        ],
        representativeSources: ["kyiv_independent", "nytimes_world", "theguardian", "bbc_world"],
        blindspots: [
          "Minimiza as preocupações históricas de segurança russa quanto às sucessivas ondas de expansão da OTAN para o leste",
          "Subdimensiona os custos da perda do gás natural russo barato sobre a competitividade industrial alemã e europeia",
          "Silencia sobre dissidências políticas internas e restrições à oposição política em Kiev",
        ],
        realHeadlines: [
          {
            outlet: "The Kyiv Independent",
            outletId: "kyiv_independent",
            flag: "🇺🇦",
            title: "Frontline forces hold positions as Western allies pledge new long-range strike capabilities",
            framingTag: "Resistência Nacional",
          },
          {
            outlet: "The New York Times",
            outletId: "nytimes_world",
            flag: "🇺🇸",
            title: "European Leaders Push for Stricter Enforcement of Russian Oil Price Cap Amid Defense Spending Spikes",
            framingTag: "Sanções Econômicas",
          },
          {
            outlet: "The Guardian",
            outletId: "theguardian",
            flag: "🇬🇧",
            title: "NATO summits reaffirm that Ukraine's future is irrevocably within the transatlantic alliance",
            framingTag: "Aliança Militar",
          },
        ],
        metrics: {
          escalationSentiment: 82,
          militaryEmphasis: 88,
          diplomaticEmphasis: 22,
        },
      },
      east: {
        bloc: "east",
        blocName: "Bloco Eurasiático / Oriental",
        blocSubtitle: "Rússia, China, Irã",
        framingHeadline: "Operação militar defensiva contra cerco da OTAN e desnazificação regional",
        subdeck: "Moscou e Pequim afirmam que o conflito é uma guerra por procuração dos EUA para perpetuar a hegemonia ocidental.",
        coreArgument:
          "A expansão contínua da OTAN para a Ucrânia criou uma ameaça existencial inaceitável nas fronteiras russas; a operação garante a proteção das populações russófonas e a transição irrevogável para um mundo multipolar.",
        vocabulary: [
          {
            term: "Guerra por procuração da OTAN (Proxy War)",
            connotation: "negative",
            meaningOrContext: "Descreve a Ucrânia como instrumento utilizado por Washington para tentar desmembrar a Rússia",
          },
          {
            term: "Ordem multipolar e segurança indivisível",
            connotation: "positive",
            meaningOrContext: "Princípio de que a segurança de um bloco não pode ser construída destruindo a segurança de outro",
          },
          {
            term: "Desdolarização do comércio euroasiático",
            connotation: "positive",
            meaningOrContext: "Migração de pagamentos de petróleo e commodities para rublos, yuan e sistemas locais",
          },
        ],
        representativeSources: ["tass", "global_times", "sputnik_globe", "scmp"],
        blindspots: [
          "Silencia a destruição maciça de infraestrutura civil, hospitais e redes de energia de cidades ucranianas",
          "Nega a existência de uma identidade nacional ucraniana soberana distinta da esfera de influência russa",
          "Oculta o alto número de baixas militares russas e a repressão interna a manifestações pacifistas em Moscou",
        ],
        realHeadlines: [
          {
            outlet: "TASS",
            outletId: "tass",
            flag: "🇷🇺",
            title: "Russian Defense Ministry Reports Liberation of Strategic Settlements in Donbas Sector",
            framingTag: "Avanço Militar",
          },
          {
            outlet: "Global Times",
            outletId: "global_times",
            flag: "🇨🇳",
            title: "US Weapons Pumping into Eastern Europe Prevents Diplomatic Solution and Strains Global Security",
            framingTag: "Crítica à OTAN",
          },
          {
            outlet: "Sputnik News",
            outletId: "sputnik_globe",
            flag: "🇷🇺",
            title: "BRICS Expansion Proves Western Attempts to Isolate Moscow Have Completely Failed",
            framingTag: "Multipolaridade",
          },
        ],
        metrics: {
          escalationSentiment: 85,
          militaryEmphasis: 82,
          diplomaticEmphasis: 20,
        },
      },
      global_south: {
        bloc: "global_south",
        blocName: "Sul Global & Neutros",
        blocSubtitle: "Brasil, Índia, Argentina, África do Sul, Indonésia",
        framingHeadline: "Crise alimentar global, disparada de fertilizantes e urgência de negociação de paz",
        subdeck: "Nações emergentes recusam alinhamento bélico automático ou envio de armas, defendendo cessar-fogo imediato sem imposições.",
        coreArgument:
          "A continuação da guerra castiga populações inocentes no Sul Global com o encarecimento de comida e combustíveis; apenas negociações diretas mediadas por países neutros restaurarão a paz duradoura.",
        vocabulary: [
          {
            term: "Segurança alimentar e suprimento de adubos",
            connotation: "neutral",
            meaningOrContext: "Alerta para o perigo da fome e quebra de safras agrícolas na América Latina e África",
          },
          {
            term: "Clube de países amigos da paz",
            connotation: "positive",
            meaningOrContext: "Iniciativa diplomática para construir pontes de negociação sem imposições unilaterais",
          },
          {
            term: "Neutralidade ativa e rejeição a sanções unilaterais",
            connotation: "neutral",
            meaningOrContext: "Condenação de sanções econômicas que não foram aprovadas pelo Conselho de Segurança da ONU",
          },
        ],
        representativeSources: ["folha", "clarin_mundo", "aljazeera", "agenciabrasil"],
        blindspots: [
          "Relutância em condenar formalmente violações de fronteiras territoriais para não arriscar importações de diesel e fertilizantes",
          "Inércia diplomática real: apresentação de planos de paz sem mecanismos práticos de verificação militar",
          "Risco de equiparar a nação invadida à potência agressora em discursos de equidistância",
        ],
        realHeadlines: [
          {
            outlet: "Folha de S.Paulo",
            outletId: "folha",
            flag: "🇧🇷",
            title: "Brasil insiste em clube de paz para Ucrânia e garante importação de adubos essenciais para o agro",
            framingTag: "Pragmatismo Econômico",
          },
          {
            outlet: "Clarín",
            outletId: "clarin_mundo",
            flag: "🇦🇷",
            title: "Impacto de la prolongación de la guerra en el Mar Negro sobre las exportaciones agrícolas del Cono Sur",
            framingTag: "Comércio Exterior",
          },
          {
            outlet: "Al Jazeera English",
            outletId: "aljazeera",
            flag: "🇶🇦",
            title: "Developing Nations Bear Brunt of Grain Corridor Disruptions as Conflict Grinds On",
            framingTag: "Insegurança Alimentar",
          },
        ],
        metrics: {
          escalationSentiment: 38,
          militaryEmphasis: 25,
          diplomaticEmphasis: 92,
        },
      },
    },
  },

  taiwan: {
    hotspotId: "taiwan",
    topicTitle: "Tensão no Estreito de Taiwan e Disputa de Semicondutores",
    sharedFact:
      "Exercícios aeronavais das Forças Armadas chinesas cercam águas em torno de Taiwan; Congresso dos EUA aprova novo pacote de assistência militar a Taipei e fábricas da TSMC aceleram planos de contingência.",
    comparatorStoryId: "tarifas",
    blocs: {
      west: {
        bloc: "west",
        blocName: "Bloco Ocidental",
        blocSubtitle: "EUA, Japão, Taiwan, Austrália",
        framingHeadline: "Dissuasão democrática e defesa da cadeia estratégica de semicondutores",
        subdeck: "EUA e aliados reforçam a primeira cadeia de ilhas contra as pretensões expansionistas do regime de Pequim.",
        coreArgument:
          "A autonomia de Taiwan e o livre trânsito nas águas do Indo-Pacífico são cruciais para a estabilidade tecnológica global; qualquer tentativa de reunificação pela força terá resposta coletiva imediata.",
        vocabulary: [
          {
            term: "Dissuasão estratégica e livre navegação",
            connotation: "positive",
            meaningOrContext: "Manobras de contratorpedeiros e patrulhas para advertir contra qualquer bloqueio ou invasão",
          },
          {
            term: "Autonomia democrática de Taipei",
            connotation: "positive",
            meaningOrContext: "Defesa do modelo político da ilha e da estabilidade da TSMC como bem público mundial",
          },
          {
            term: "Coerção militar e intimidação na zona de identificação aérea",
            connotation: "negative",
            meaningOrContext: "Denúncia de voos diários de caças e navios de guerra cruzando a linha média do estreito",
          },
        ],
        representativeSources: ["wsj_world", "the_japan_times", "washington_post", "nikkei_asia"],
        blindspots: [
          "Erosão gradual da política tradicional de 'Uma Só China' através de visitas de alto escalão e pacotes armamentistas",
          "Dependência profunda de matérias-primas e componentes fabricados no continente chinês para a indústria global de tecnologia",
          "Subestimação do compromisso histórico inegociável de Pequim com a integridade territorial nacional",
        ],
        realHeadlines: [
          {
            outlet: "The Japan Times",
            outletId: "the_japan_times",
            flag: "🇯🇵",
            title: "Tokyo and Washington Expand Joint Surveillance Across Nansei Islands Guarding Taiwan Strait",
            framingTag: "Segurança Insular",
          },
          {
            outlet: "The Wall Street Journal",
            outletId: "wsj_world",
            flag: "🇺🇸",
            title: "Pentagon Fast-Tracks Defensive Weapon Packages to Harden Taiwan's Asymmetric Defense",
            framingTag: "Dissuasão Militar",
          },
          {
            outlet: "Nikkei Asia",
            outletId: "nikkei_asia",
            flag: "🇯🇵",
            title: "Global Chip Supply at Extreme Risk if Naval Blockade Scenario Materializes in Strait",
            framingTag: "Vulnerabilidade Tecnológica",
          },
        ],
        metrics: {
          escalationSentiment: 74,
          militaryEmphasis: 80,
          diplomaticEmphasis: 32,
        },
      },
      east: {
        bloc: "east",
        blocName: "Bloco Eurasiático / Oriental",
        blocSubtitle: "China, Rússia, Irã",
        framingHeadline: "Reunificação nacional inabalável e combate à secessão apoiada por forças externas",
        subdeck: "Pequim reafirma que a questão de Taiwan é estritamente assunto interno e adverte contra qualquer linha vermelha cruzada por Washington.",
        coreArgument:
          "Taiwan é parte inalienável do território soberano da China desde a antiguidade; interferências militares estrangeiras violam o direito internacional e encorajam forças separatistas a levar a região ao abismo.",
        vocabulary: [
          {
            term: "Princípio de Uma Só China e reunificação histórica",
            connotation: "positive",
            meaningOrContext: "Pilar constitucional e diplomático inegociável da soberania chinesa perante a ONU",
          },
          {
            term: "Forças separatistas coniventes com o imperialismo",
            connotation: "negative",
            meaningOrContext: "Enquadramento da liderança do PDP em Taipei como instrumentos de contenção da ascensão chinesa",
          },
          {
            term: "Exercícios de combate conjunto em torno da ilha",
            connotation: "positive",
            meaningOrContext: "Demonstração de prontidão militar e capacidade de impor bloqueio marítimo e aéreo total",
          },
        ],
        representativeSources: ["global_times", "xinhua", "scmp", "tass"],
        blindspots: [
          "Desconsidera a vontade majoritária da população de Taiwan de preservar seu estilo de vida e instituições democráticas",
          "Omite os custos astronômicos de isolamento comercial e sanções caso decida deflagrar uma operação anfíbia",
          "Censura interna severa sobre discussões econômicas relacionadas aos impactos de um conflito bélico na Ásia",
        ],
        realHeadlines: [
          {
            outlet: "Global Times",
            outletId: "global_times",
            flag: "🇨🇳",
            title: "PLA Combat Drills Deliver Stern Warning to External Colluders and Taiwan Separatist Cliques",
            framingTag: "Avisos de Soberania",
          },
          {
            outlet: "Xinhua News",
            outletId: "xinhua",
            flag: "🇨🇳",
            title: "White Paper Reaffirms Resolution to Realize National Reunification with Utmost Sincerity",
            framingTag: "Doutrina Oficial",
          },
          {
            outlet: "South China Morning Post",
            outletId: "scmp",
            flag: "🇭🇰",
            title: "Cross-Strait Tensions Surge as Military Drills Rehearse Comprehensive Island Encirclement",
            framingTag: "Análise Estratégica",
          },
        ],
        metrics: {
          escalationSentiment: 76,
          militaryEmphasis: 84,
          diplomaticEmphasis: 26,
        },
      },
      global_south: {
        bloc: "global_south",
        blocName: "Sul Global & Neutros",
        blocSubtitle: "Tailândia, Brasil, Malásia, África do Sul",
        framingHeadline: "Manutenção do status quo comercial e receio de colapso nas cadeias de suprimentos globais",
        subdeck: "Economias do Sudeste Asiático e da América Latina apelam por moderação para evitar confronto catastrófico entre superpotências.",
        coreArgument:
          "Um conflito bélico no Estreito de Taiwan congelaria a produção global de eletrônicos e semicondutores, jogando a economia do Sul Global em recessão sem precedentes; a estabilidade pacífica é do interesse de todos.",
        vocabulary: [
          {
            term: "Preservação da paz regional e estabilidade dos mares",
            connotation: "positive",
            meaningOrContext: "Exigência de trânsito desimpedido para exportações agropecuárias, minerais e manufaturas",
          },
          {
            term: "Adesão ao princípio de Uma Só China com pragmatismo",
            connotation: "neutral",
            meaningOrContext: "Reconhecimento diplomático formal de Pequim com manutenção de fortes parcerias de negócios com Taipei",
          },
          {
            term: "Risco de choque sistêmico no comércio mundial",
            connotation: "negative",
            meaningOrContext: "Projeção de queda de até 10% no PIB global em caso de bloqueio militar da bacia de Taiwan",
          },
        ],
        representativeSources: ["bangkok_post", "the_nation_th", "valor_globo", "infobae_america"],
        blindspots: [
          "Vulnerabilidade extrema: nenhuma nação do Sul tem planos industriais de contingência para um apagão de microchips",
          "Tendência a silenciar sobre invasões de zonas econômicas exclusivas de vizinhos no Mar do Sul da China",
          "Dependência simultânea de capitais de risco norte-americanos e das compras de matérias-primas por estatais chinesas",
        ],
        realHeadlines: [
          {
            outlet: "Bangkok Post",
            outletId: "bangkok_post",
            flag: "🇹🇭",
            title: "ASEAN Foreign Ministers Caution Against Great Power Confrontation in Crucial Sea Lanes",
            framingTag: "Equilíbrio Regional",
          },
          {
            outlet: "Valor Econômico",
            outletId: "valor_globo",
            flag: "🇧🇷",
            title: "Agro e mineração brasileiros seriam os primeiros atingidos em eventual crise no Estreito de Taiwan",
            framingTag: "Impacto nas Exportações",
          },
          {
            outlet: "The Nation",
            outletId: "the_nation_th",
            flag: "🇹🇭",
            title: "Southeast Asian Supply Chains Brace for Semiconductor Delays Amid Rising Geopolitical Friction",
            framingTag: "Cadeias Produtivas",
          },
        ],
        metrics: {
          escalationSentiment: 42,
          militaryEmphasis: 30,
          diplomaticEmphasis: 85,
        },
      },
    },
  },

  mar_vermelho: {
    hotspotId: "mar_vermelho",
    topicTitle: "Crise de Trânsito no Mar Vermelho e Estreito de Bab el-Mandeb",
    sharedFact:
      "Forças militares houthis realizam disparos de drones e mísseis contra navios comerciais no Mar Vermelho; navios mercantes desviam rotas contornando o continente africano e encarecem custos de seguros navais.",
    comparatorStoryId: "tarifas",
    blocs: {
      west: {
        bloc: "west",
        blocName: "Bloco Ocidental",
        blocSubtitle: "EUA, Reino Unido, União Europeia, Israel",
        framingHeadline: "Pirataria terrorista houthi e coalizão naval para restaurar o comércio marítimo",
        subdeck: "Operação Prosperity Guardian intensifica ataques de precisão contra depósitos e plataformas de lançamento no Iêmen.",
        coreArgument:
          "Os ataques contra navios mercantes neutros constituem terrorismo marítimo que ameaça o abastecimento global; o livre comércio pelos canais internacionais deve ser garantido pela força militar aliada.",
        vocabulary: [
          {
            term: "Ataques terroristas indiscriminados à marinha mercante",
            connotation: "negative",
            meaningOrContext: "Descreve disparos contra cargueiros desarmados como atos ilegais de agressão criminosa",
          },
          {
            term: "Força-tarefa multinacional de escolta e proteção",
            connotation: "positive",
            meaningOrContext: "Mobilização de contratorpedeiros ocidentais para abater drones e defender a rota de Suez",
          },
          {
            term: "Proliferação ilícita de mísseis fornecidos pelo Irã",
            connotation: "negative",
            meaningOrContext: "Denúncia de transferência de tecnologia militar avançada de Teerã para milícias iemenitas",
          },
        ],
        representativeSources: ["defensenews", "reuters", "timesofisrael", "ap"],
        blindspots: [
          "Desconsidera a motivação declarada dos ataques: pressão direta contra o cerco militar e humanitário a Gaza",
          "Subestima a resiliência das forças houthis após quase uma década suportando bombardeios da coalizão saudita",
          "Minimiza a assimetria financeira insustentável de lançar mísseis interceptadores de US$ 2 milhões contra drones de US$ 20 mil",
        ],
        realHeadlines: [
          {
            outlet: "Defense News",
            outletId: "defensenews",
            flag: "🇺🇸",
            title: "US and UK Forces Strike Houthi Missile Storage and Radar Sites Across Western Yemen",
            framingTag: "Intervenção Aérea",
          },
          {
            outlet: "Reuters",
            outletId: "reuters",
            flag: "🇬🇧",
            title: "Major Container Carriers Continue Africa Detours as Red Sea Transit Remains Perilous",
            framingTag: "Interrupção Logística",
          },
          {
            outlet: "The Times of Israel",
            outletId: "timesofisrael",
            flag: "🇮🇱",
            title: "Port of Eilat Reports Dramatic Cargo Drop as Houthi Blockade Strangles Southern Shipping Lane",
            framingTag: "Impacto Portuário",
          },
        ],
        metrics: {
          escalationSentiment: 80,
          militaryEmphasis: 86,
          diplomaticEmphasis: 24,
        },
      },
      east: {
        bloc: "east",
        blocName: "Bloco Eurasiático / Oriental",
        blocSubtitle: "Irã, Rússia, China",
        framingHeadline: "Ações de solidariedade com Gaza e resposta legítima aos bombardeios ocidentais",
        subdeck: "Teerã e Moscou sublinham que a crise no Mar Vermelho é consequência direta do apoio incondicional dos EUA à guerra em Gaza.",
        coreArgument:
          "Os bloqueios marítimos no Bab el-Mandeb cessarão no momento em que o cerco à população civil de Gaza for levantado; bombardeios ocidentais no território iemenita apenas agravam a conflagração regional.",
        vocabulary: [
          {
            term: "Bloqueio naval solidário ao povo palestino",
            connotation: "positive",
            meaningOrContext: "Apresenta a interdição de navios vinculados a Israel como pressão legítima por cessar-fogo",
          },
          {
            term: "Agressão ilegal anglo-americana em território soberano iemenita",
            connotation: "negative",
            meaningOrContext: "Denúncia de bombardeios militares executados sem mandado do Conselho de Segurança da ONU",
          },
          {
            term: "Eixo de Resistência contra a cumplicidade ocidental",
            connotation: "positive",
            meaningOrContext: "Capacidade de impor custos econômicos concretos aos países que apoiam a ofensiva em Gaza",
          },
        ],
        representativeSources: ["irna_iran", "tass", "global_times", "scmp"],
        blindspots: [
          "Oculta disparos contra petroleiros e cargueiros de nações neutras sem qualquer ligação com Israel ou potências ocidentais",
          "Ignora a repressão interna e a dramática crise humanitária enfrentada pela população no próprio território iemenita",
          "Minimiza os graves riscos ambientais de naufrágios de cargueiros de fertilizantes e químicos no ecossistema de corais",
        ],
        realHeadlines: [
          {
            outlet: "IRNA",
            outletId: "irna_iran",
            flag: "🇮🇷",
            title: "Ansar Allah Declares Marine Operations Will Continue Until Israel Lifts Gaza Siege",
            framingTag: "Solidariedade Militar",
          },
          {
            outlet: "TASS",
            outletId: "tass",
            flag: "🇷🇺",
            title: "Moscow Condemns Western Strikes on Yemen as Violation of International Law and UN Charter",
            framingTag: "Condenação Diplomática",
          },
          {
            outlet: "Global Times",
            outletId: "global_times",
            flag: "🇨🇳",
            title: "Root Cause of Red Sea Crisis Lies in Gaza Conflict; Military Strikes Cannot Restore Peace",
            framingTag: "Causalidade Estrutural",
          },
        ],
        metrics: {
          escalationSentiment: 78,
          militaryEmphasis: 82,
          diplomaticEmphasis: 28,
        },
      },
      global_south: {
        bloc: "global_south",
        blocName: "Sul Global & Neutros",
        blocSubtitle: "Egito, Catar, Brasil, Índia, Argentina",
        framingHeadline: "Disparada de fretes e emissões de carbono com desvio pelo Cabo da Boa Esperança",
        subdeck: "Egito perde receitas vitais no Canal de Suez enquanto exportadores emergentes enfrentam escassez de contêineres e atrasos.",
        coreArgument:
          "O desvio de rotas pela África eleva custos de transporte e inflação mundial sem resolver a crise humanitária; a pacificação definitiva de Gaza é a única via realista para reabrir o Canal de Suez com segurança.",
        vocabulary: [
          {
            term: "Alta nos fretes internacionais e sobretaxas de seguro",
            connotation: "negative",
            meaningOrContext: "Cálculo do impacto financeiro do acréscimo de 10 a 14 dias nas viagens marítimas de carga",
          },
          {
            term: "Queda vertiginosa nas receitas fiscais do Canal de Suez",
            connotation: "negative",
            meaningOrContext: "Alerta para a crise cambial do Egito e pressão sobre moedas de economias emergentes",
          },
          {
            term: "Solução política integral no Levante",
            connotation: "positive",
            meaningOrContext: "Afirmação de que a segurança marítima só retornará com o fim duradouro do conflito em Gaza",
          },
        ],
        representativeSources: ["aljazeera", "the_national_uae", "folha", "lanacion_mundo"],
        blindspots: [
          "Impotência naval prática para garantir escolta segura aos próprios navios mercantes de bandeira nacional",
          "Equiparação discursiva entre os ataques de mísseis houthis e as medidas navais dos países que tentam manter o estreito aberto",
          "Evita cobranças explícitas a Teerã pelo encerramento do envio de drones para forças irregulares na região",
        ],
        realHeadlines: [
          {
            outlet: "Al Jazeera English",
            outletId: "aljazeera",
            flag: "🇶🇦",
            title: "Suez Canal Revenue Plunges by Over 50% as Shipping Giants Steer Clear of Red Sea",
            framingTag: "Prejuízo Regional",
          },
          {
            outlet: "The National UAE",
            outletId: "the_national_uae",
            flag: "🇦🇪",
            title: "Supply Chain Disruptions Compound Inflationary Pressures for Middle East and Asian Markets",
            framingTag: "Alerta Econômico",
          },
          {
            outlet: "Folha de S.Paulo",
            outletId: "folha",
            flag: "🇧🇷",
            title: "Crise no Mar Vermelho encarece frete de carnes e produtos brasileiros enviados ao Oriente Médio",
            framingTag: "Impacto no Comércio",
          },
        ],
        metrics: {
          escalationSentiment: 46,
          militaryEmphasis: 32,
          diplomaticEmphasis: 86,
        },
      },
    },
  },

  gaza: {
    hotspotId: "gaza",
    topicTitle: "Conflito Bélico em Gaza e Polarização Regional no Oriente Médio",
    sharedFact:
      "Operações militares das forças israelenses prosseguem em áreas urbanas de Gaza; Conselho de Segurança da ONU debate resoluções de cessar-fogo enquanto tribunais internacionais em Haia examinam petições humanitárias.",
    comparatorStoryId: "gaza",
    blocs: {
      west: {
        bloc: "west",
        blocName: "Bloco Ocidental",
        blocSubtitle: "Israel, EUA, Alemanha, Reino Unido",
        framingHeadline: "Direito de autodefesa de Israel e desmantelamento das redes terroristas do Hamas",
        subdeck: "Capitais ocidentais apoiam eliminação de capacidades militares do Hamas exigindo libertação de reféns e proteção a civis.",
        coreArgument:
          "Nenhuma democracia soberana pode tolerar massacres terroristas em suas fronteiras; o desmantelamento completo do Hamas e a libertação de todos os reféns são condições indispensáveis para qualquer trégua permanente.",
        vocabulary: [
          {
            term: "Direito inalienável de autodefesa",
            connotation: "positive",
            meaningOrContext: "Justificativa jurídica e moral para operações de resgate e ataques a redutos armados",
          },
          {
            term: "Uso de civis como escudos humanos por terroristas",
            connotation: "negative",
            meaningOrContext: "Atribuição da responsabilidade pelas mortes civis à estratégia do Hamas de operar sob túneis",
          },
          {
            term: "Libertação incondicional de todos os reféns",
            connotation: "positive",
            meaningOrContext: "Pré-requisito indispensável para qualquer cessação de hostilidades ou pausas prolongadas",
          },
        ],
        representativeSources: ["timesofisrael", "wsj_world", "ap", "dw_brasil"],
        blindspots: [
          "Minimiza a magnitude da catástrofe humanitária, destruição generalizada de habitações e colapso do sistema de saúde",
          "Silencia sobre a expansão agressiva de assentamentos ilegais e violência de colonos na Cisjordânia",
          "Desqualifica preventivamente pareceres e decisões cautelares emitidas pela Corte Internacional de Justiça",
        ],
        realHeadlines: [
          {
            outlet: "The Times of Israel",
            outletId: "timesofisrael",
            flag: "🇮🇱",
            title: "IDF Targets Underground Command Bunkers in Khan Younis as Hostage Operations Continue",
            framingTag: "Operação Antiterror",
          },
          {
            outlet: "The Wall Street Journal",
            outletId: "wsj_world",
            flag: "🇺🇸",
            title: "Washington Weighs Precision Munitions Approval While Urging Israel to Minimize Civilian Toll",
            framingTag: "Dilema Estratégico",
          },
          {
            outlet: "Deutsche Welle Brasil",
            outletId: "dw_brasil",
            flag: "🇩🇪",
            title: "Alemanha e aliados reforçam segurança de Israel mas ampliam pedidos de ajuda a civis",
            framingTag: "Diplomacia Europeia",
          },
        ],
        metrics: {
          escalationSentiment: 85,
          militaryEmphasis: 84,
          diplomaticEmphasis: 28,
        },
      },
      east: {
        bloc: "east",
        blocName: "Bloco Eurasiático / Oriental",
        blocSubtitle: "Irã, Rússia, China",
        framingHeadline: "Denúncia de genocídio em Gaza e cumplicidade armada do imperialismo ocidental",
        subdeck: "Moscou, Pequim e Teerã acusam os EUA de vetarem a paz na ONU e defendem criação imediata do Estado soberano palestino.",
        coreArgument:
          "O cerco militar à Faixa de Gaza constitui punição coletiva bárbara e violação flagrante das Convenções de Genebra, viabilizada unicamente pelo fornecimento ininterrupto de bombas e vetos diplomáticos dos EUA.",
        vocabulary: [
          {
            term: "Punição coletiva e genocídio sistemático",
            connotation: "negative",
            meaningOrContext: "Classificação das ações militares como violação da Convenção para Prevenção do Genocídio",
          },
          {
            term: "Veto hegemônico dos EUA no Conselho de Segurança",
            connotation: "negative",
            meaningOrContext: "Crítica à paralisia imposta por Washington em sucessivas resoluções internacionais de cessar-fogo",
          },
          {
            term: "Solução justa com capital em Jerusalém Oriental",
            connotation: "positive",
            meaningOrContext: "Defesa inegociável da criação do Estado da Palestina nas fronteiras anteriores a 1967",
          },
        ],
        representativeSources: ["tass", "global_times", "irna_iran", "scmp"],
        blindspots: [
          "Silencia e justifica as atrocidades e sequestros em massa cometidos contra civis israelenses nos ataques de outubro",
          "Oculta a perseguição violenta a opositores políticos e a ausência de direitos civis básicos sob o comando do Hamas",
          "Instrumentaliza o sofrimento palestino como peça de retórica para expandir a influência de Teerã e Moscou no Oriente Médio",
        ],
        realHeadlines: [
          {
            outlet: "Global Times",
            outletId: "global_times",
            flag: "🇨🇳",
            title: "UN Must Enforce Binding Ceasefire in Gaza; Two-State Solution Cannot Be Indefinitely Postponed",
            framingTag: "Direito Internacional",
          },
          {
            outlet: "IRNA",
            outletId: "irna_iran",
            flag: "🇮🇷",
            title: "Resistance Axis Unites to End Zionist Aggression as Global Outrage Surges",
            framingTag: "Resistência Armada",
          },
          {
            outlet: "TASS",
            outletId: "tass",
            flag: "🇷🇺",
            title: "Lavrov Calls for Immediate Quartet Revival to End Catastrophic Humanitarian Blockade in Gaza",
            framingTag: "Proposta Multilateral",
          },
        ],
        metrics: {
          escalationSentiment: 88,
          militaryEmphasis: 80,
          diplomaticEmphasis: 35,
        },
      },
      global_south: {
        bloc: "global_south",
        blocName: "Sul Global & Neutros",
        blocSubtitle: "Brasil, África do Sul, Catar, Egito, Colômbia",
        framingHeadline: "Catástrofe humanitária inaceitável e exigência de cessar-fogo e responsabilização em Haia",
        subdeck: "Brasil, África do Sul e nações latino-americanas apoiam processo na CIJ e cobram abertura irrestrita de corredores de ajuda.",
        coreArgument:
          "A comunidade internacional não pode tolerar a morte em massa de crianças e civis sob bombardeios; o direito internacional humanitário é universal e deve ser aplicado igualmente a todas as nações sem dois pesos e duas medidas.",
        vocabulary: [
          {
            term: "Cessar-fogo humanitário imediato e incondicional",
            connotation: "positive",
            meaningOrContext: "Parada urgente dos bombardeios para permitir entrada maciça de água, alimentos e combustíveis",
          },
          {
            term: "Aplicação das medidas cautelares da Corte Internacional de Justiça",
            connotation: "positive",
            meaningOrContext: "Cobrança de cumprimento das decisões de Haia para prevenir atos de genocídio em Rafah",
          },
          {
            term: "Padrão duplo do Ocidente em direitos humanos",
            connotation: "negative",
            meaningOrContext: "Contraste entre a veemência ocidental na Ucrânia e a tolerância cúmplice com os bombardeios em Gaza",
          },
        ],
        representativeSources: ["aljazeera", "folha", "clarin_mundo", "agenciabrasil"],
        blindspots: [
          "Retórica contundente sem alavancas econômicas ou militares reais para forçar as partes a suspenderem os combates",
          "Falta de projeto articulado para a governança civil, segurança e reconstrução física da Faixa de Gaza no pós-guerra",
          "Riscos de desgastes diplomáticos internos decorrentes de comparações históricas controversas",
        ],
        realHeadlines: [
          {
            outlet: "Al Jazeera English",
            outletId: "aljazeera",
            flag: "🇶🇦",
            title: "Famine Grips Northern Gaza as Aid Convoys Remain Blocked Despite World Court Orders",
            framingTag: "Emergência Humanitária",
          },
          {
            outlet: "Folha de S.Paulo",
            outletId: "folha",
            flag: "🇧🇷",
            title: "Diplomacia brasileira condena ataques a campos de refugiados e cobra cessar-fogo na ONU",
            framingTag: "Posição Oficial",
          },
          {
            outlet: "Agência Brasil (EBC)",
            outletId: "agenciabrasil",
            flag: "🇧🇷",
            title: "Brasil apoia ação na Corte de Haia e defende entrada desimpedida de comida e remédios em Gaza",
            framingTag: "Ação Jurídica",
          },
        ],
        metrics: {
          escalationSentiment: 52,
          militaryEmphasis: 30,
          diplomaticEmphasis: 90,
        },
      },
    },
  },

  coreia: {
    hotspotId: "coreia",
    topicTitle: "Escalada Nuclear na Península Coreana e Paralelo 38",
    sharedFact:
      "Coreia do Norte executa teste de novo míssil balístico de combustível sólido com trajetória hipersônica; Coreia do Sul e EUA mobilizam porta-aviões nuclear e expandem exercícios conjuntos de fogo real.",
    comparatorStoryId: "tarifas",
    blocs: {
      west: {
        bloc: "west",
        blocName: "Bloco Ocidental",
        blocSubtitle: "Coreia do Sul, EUA, Japão",
        framingHeadline: "Provocações balísticas ilegais de Pyongyang e dissuasão nuclear estendida",
        subdeck: "Seul, Tóquio e Washington ampliam manobras de resposta e patrulhas com submarinos armados com mísseis balísticos.",
        coreArgument:
          "Os testes ilegais do regime de Kim Jong Un ameaçam diretamente a paz do Leste Asiático e a segurança dos EUA; apenas uma postura militar de dissuasão esmagadora pode impedir uma agressão norte-coreana.",
        vocabulary: [
          {
            term: "Violação flagrante de resoluções da ONU",
            connotation: "negative",
            meaningOrContext: "Denúncia de testes de mísseis balísticos intercontinentais proibidos pelo Conselho de Segurança",
          },
          {
            term: "Dissuasão nuclear estendida (Guarda-chuva americano)",
            connotation: "positive",
            meaningOrContext: "Garantia de segurança máxima a Seul e Tóquio com desdobramento de bombardeiros e submarinos B-52",
          },
          {
            term: "Eixo ilícito de proliferação com a Rússia",
            connotation: "negative",
            meaningOrContext: "Envio de munições norte-coreanas para o front ucraniano em troca de tecnologia militar russa",
          },
        ],
        representativeSources: ["the_japan_times", "wsj_world", "nhk_world", "defensenews"],
        blindspots: [
          "Ignora que exercícios navais gigantescos na fronteira alimentam a paranoia de segurança legítima de Pyongyang",
          "Fracasso documentado da estratégia de sanções de 'pressão máxima' nos últimos 20 anos em frear o programa atômico",
          "Subestimação da capacidade técnica autóctone da Coreia do Norte de miniaturizar ogivas nucleares",
        ],
        realHeadlines: [
          {
            outlet: "The Japan Times",
            outletId: "the_japan_times",
            flag: "🇯🇵",
            title: "North Korea Fires Solid-Fuel Hypersonic Missile as Japan Orders Immediate Shelter Alerts",
            framingTag: "Alerta Balístico",
          },
          {
            outlet: "The Wall Street Journal",
            outletId: "wsj_world",
            flag: "🇺🇸",
            title: "US Nuclear Submarine Docks in Busan in Show of Force to Reassure South Korean Allies",
            framingTag: "Dissuasão Nuclear",
          },
          {
            outlet: "NHK World",
            outletId: "nhk_world",
            flag: "🇯🇵",
            title: "Trilateral Defense Leaders Finalize Real-Time Missile Warning Data Sharing Protocol",
            framingTag: "Defesa Conjunta",
          },
        ],
        metrics: {
          escalationSentiment: 75,
          militaryEmphasis: 85,
          diplomaticEmphasis: 25,
        },
      },
      east: {
        bloc: "east",
        blocName: "Bloco Eurasiático / Oriental",
        blocSubtitle: "Coreia do Norte, Rússia, China",
        framingHeadline: "Direito de autodefesa soberana contra o cerco militar trilateral dos EUA",
        subdeck: "Pyongyang e Moscou consolidam tratado de cooperação militar abrangente; Pequim defende desescalada de mão dupla.",
        coreArgument:
          "O arsenal nuclear e balístico da Coreia do Norte é o único escudo que impede uma invasão armada e mudança de regime liderada pelos EUA; as manobras militares de Washington são os verdadeiros fatores de desestabilização.",
        vocabulary: [
          {
            term: "Capacidade de dissuasão nuclear justa e invencível",
            connotation: "positive",
            meaningOrContext: "Enquadramento das armas nucleares como garantia de sobrevivência contra ameaças nucleares dos EUA",
          },
          {
            term: "Provocações de guerra nuclear dos EUA e seus fantoches",
            connotation: "negative",
            meaningOrContext: "Condenação das manobras Freedom Shield como ensaios para uma invasão militar do norte",
          },
          {
            term: "Parceria estratégica abrangente de assistência mútua",
            connotation: "positive",
            meaningOrContext: "Pacto militar com Moscou garantindo socorro automático em caso de ataque externo",
          },
        ],
        representativeSources: ["tass", "global_times", "xinhua", "the_moscow_times"],
        blindspots: [
          "Silencia sobre a escassez alimentar crônica e o isolamento total da população norte-coreana em prol do militarismo",
          "Nega a violação ostensiva do Tratado de Não Proliferação Nuclear (TNP)",
          "Oculta os graves riscos de erro de cálculo balístico que podem desencadear uma troca nuclear devastadora na região",
        ],
        realHeadlines: [
          {
            outlet: "TASS",
            outletId: "tass",
            flag: "🇷🇺",
            title: "Russia and DPRK Ratify Historic Comprehensive Strategic Partnership Treaty with Mutual Defense Clause",
            framingTag: "Aliança Estratégica",
          },
          {
            outlet: "Global Times",
            outletId: "global_times",
            flag: "🇨🇳",
            title: "Dual Suspension Proposal Remains Only Viable Path to Avoid Catastrophic Korean Conflict",
            framingTag: "Proposta Chinesa",
          },
          {
            outlet: "Xinhua News",
            outletId: "xinhua",
            flag: "🇨🇳",
            title: "Beijing Urges Calm as Deployment of US Strategic Assets Escalates Confrontation in East Asia",
            framingTag: "Crítica à Militarização",
          },
        ],
        metrics: {
          escalationSentiment: 78,
          militaryEmphasis: 82,
          diplomaticEmphasis: 28,
        },
      },
      global_south: {
        bloc: "global_south",
        blocName: "Sul Global & Neutros",
        blocSubtitle: "Tailândia, Brasil, Indonésia, Filipinas",
        framingHeadline: "Apelo por desnuclearização e risco de corrida armamentista na bacia do Pacífico",
        subdeck: "Países não alinhados alertam para a erosão do regime global de não proliferação e defendem diálogo diplomático.",
        coreArgument:
          "A proliferação nuclear na Ásia ameaça a segurança de todo o Hemisfério Sul; as potências devem retomar o diálogo das Seis Partes e suspender ações militares provocativas para evitar uma tragédia atômica.",
        vocabulary: [
          {
            term: "Desnuclearização completa e pacífica da península",
            connotation: "positive",
            meaningOrContext: "Defesa dos tratados internacionais contra a proliferação e disseminação de ogivas atômicas",
          },
          {
            term: "Risco de corrida armamentista regional",
            connotation: "negative",
            meaningOrContext: "Preocupação com a tentação de Tóquio e Seul de desenvolverem capacidades nucleares próprias",
          },
          {
            term: "Diálogo diplomático sem pré-condições humilhantes",
            connotation: "neutral",
            meaningOrContext: "Incentivo a concessões graduais recíprocas para diminuir a tensão militar permanente",
          },
        ],
        representativeSources: ["bangkok_post", "the_nation_th", "folha", "lanacion_mundo"],
        blindspots: [
          "Inviabilidade prática de convencer a Coreia do Norte a abrir mão de seu arsenal já operacional e testado",
          "Falta de canais de interlocução diplomática direta da maioria dos governos do Sul com o regime de Pyongyang",
          "Baixo peso político das nações neutras nas deliberações de segurança das superpotências no Pacífico",
        ],
        realHeadlines: [
          {
            outlet: "Bangkok Post",
            outletId: "bangkok_post",
            flag: "🇹🇭",
            title: "Southeast Asian Leaders Express Concern Over Missile Tests Threatening Pacific Civil Aviation",
            framingTag: "Segurança Aérea",
          },
          {
            outlet: "Folha de S.Paulo",
            outletId: "folha",
            flag: "🇧🇷",
            title: "Aproximação militar entre Rússia e Coreia do Norte acirra tensões e preocupa diplomacia global",
            framingTag: "Proliferação",
          },
          {
            outlet: "The Nation",
            outletId: "the_nation_th",
            flag: "🇹🇭",
            title: "Pacific Nations Urge Resumption of Six-Party Talks Before Nuclear Threshold is Irreversibly Crossed",
            framingTag: "Solução Multilateral",
          },
        ],
        metrics: {
          escalationSentiment: 40,
          militaryEmphasis: 28,
          diplomaticEmphasis: 88,
        },
      },
    },
  },

  sahel: {
    hotspotId: "sahel",
    topicTitle: "Ruptura Institucional no Sahel Africano e Conflito no Sudão",
    sharedFact:
      "Juntas militares da Aliança dos Estados do Sahel formalizam rompimento com tratados ocidentais e recebem instrutores da Africa Corps russa; combates no Sudão provocam o maior deslocamento de civis do mundo.",
    comparatorStoryId: "tarifas",
    blocs: {
      west: {
        bloc: "west",
        blocName: "Bloco Ocidental",
        blocSubtitle: "França, União Europeia, EUA",
        framingHeadline: "Onda de golpes militares, retrocesso democrático e penetração predatória russa",
        subdeck: "França e UE lamentam o rompimento de acordos de defesa e alertam para o avanço jihadista e mercenário.",
        coreArgument:
          "A derrubada de governos democraticamente eleitos abre caminho para o caos institucional, abusos sistemáticos de direitos humanos pela Africa Corps russa e descontrole nas rotas migratórias rumo à Europa.",
        vocabulary: [
          {
            term: "Ruptura da ordem constitucional e golpes militares",
            connotation: "negative",
            meaningOrContext: "Condenação das juntas que tomaram o poder em Bamako, Niamey e Ouagadougou",
          },
          {
            term: "Avanço de mercenários russos e violações de direitos",
            connotation: "negative",
            meaningOrContext: "Denúncia de atrocidades contra populações civis atribuídas aos combatentes russos",
          },
          {
            term: "Risco de descontrole em fluxos migratórios e terrorismo",
            connotation: "negative",
            meaningOrContext: "Preocupação de capitais europeias com o colapso dos controles de fronteira no Saara",
          },
        ],
        representativeSources: ["dw_brasil", "euronews_pt", "reuters", "theguardian"],
        blindspots: [
          "Silencia sobre o ressentimento popular profundo contra décadas de exploração neocolonial (Françafrique)",
          "Oculta a ineficácia das operações militares francesas (Barkhane) em conter o jihadismo ao longo de uma década",
          "Duplo padrão evidente ao condenar golpes no Sahel enquanto mantém parcerias com dinastias autocráticas aliadas",
        ],
        realHeadlines: [
          {
            outlet: "Deutsche Welle Brasil",
            outletId: "dw_brasil",
            flag: "🇩🇪",
            title: "Juntas militares do Sahel criam confederação e aprofundam isolamento frente à CEDEAO e ao Ocidente",
            framingTag: "Ruptura Institucional",
          },
          {
            outlet: "Euronews em Português",
            outletId: "euronews_pt",
            flag: "🇪🇺",
            title: "UE encerra missões militares no Níger e Mali após expulsão de tropas europeias",
            framingTag: "Retirada Estratégica",
          },
          {
            outlet: "The Guardian",
            outletId: "theguardian",
            flag: "🇬🇧",
            title: "Sudan Civil War Explodes into World's Worst Displacement Catastrophe as Foreign Powers Fuel Factions",
            framingTag: "Crise Sudanesa",
          },
        ],
        metrics: {
          escalationSentiment: 68,
          militaryEmphasis: 72,
          diplomaticEmphasis: 38,
        },
      },
      east: {
        bloc: "east",
        blocName: "Bloco Eurasiático / Oriental",
        blocSubtitle: "Rússia, China, Irã",
        framingHeadline: "Segunda onda de descolonização e soberania africana com cooperação de segurança russa",
        subdeck: "Moscou e Pequim apoiam a Aliança dos Estados do Sahel contra imposições neocoloniais de Paris e Washington.",
        coreArgument:
          "Os povos do Sahel têm o direito soberano de escolher seus parceiros de segurança e se libertar da tutela predatória francesa; a Rússia oferece cooperação militar direta sem condicionamentos políticos humilhantes.",
        vocabulary: [
          {
            term: "Libertação do jugo neocolonial francês",
            connotation: "positive",
            meaningOrContext: "Apoio à expulsão de tropas ocidentais e ao fim da dependência monetária do franco CFA",
          },
          {
            term: "Parceria de segurança sem ingerência política",
            connotation: "positive",
            meaningOrContext: "Fornecimento de armamento e instrutores de combate sem exigências ocidentais de governança",
          },
          {
            term: "Aliança dos Estados do Sahel (AES)",
            connotation: "positive",
            meaningOrContext: "Novo bloco regional soberanista fundado na defesa mútua e controle dos próprios recursos naturais",
          },
        ],
        representativeSources: ["sputnik_globe", "tass", "global_times", "scmp"],
        blindspots: [
          "Oculta a apropriação predatória de concessões minerais e minas de ouro pelas redes ligadas à liderança militar russa",
          "Silencia a total suspensão de eleições e a repressão violenta a qualquer voz dissidente nos países do Sahel",
          "A incapacidade de conter os avanços dos insurgentes jihadistas, que continuam atacando vilarejos rurais",
        ],
        realHeadlines: [
          {
            outlet: "Sputnik News",
            outletId: "sputnik_globe",
            flag: "🇷🇺",
            title: "Sahel Confederation Solidifies Strategic Alliance with Moscow to Secure National Borders and Sovereignty",
            framingTag: "Cooperação Anti-Imperial",
          },
          {
            outlet: "TASS",
            outletId: "tass",
            flag: "🇷🇺",
            title: "Russian Africa Corps Enhances Counter-Terror Training and Border Defense for AES Nations",
            framingTag: "Apoio Tático",
          },
          {
            outlet: "Global Times",
            outletId: "global_times",
            flag: "🇨🇳",
            title: "Africa's Right to Choose Partners: Why Western Paternalism is Collapsing Across the Global South",
            framingTag: "Crítica ao Ocidente",
          },
        ],
        metrics: {
          escalationSentiment: 70,
          militaryEmphasis: 78,
          diplomaticEmphasis: 30,
        },
      },
      global_south: {
        bloc: "global_south",
        blocName: "Sul Global & Neutros",
        blocSubtitle: "União Africana, Brasil, África do Sul, Nigéria",
        framingHeadline: "Soluções africanas para problemas africanos, soberania alimentar e tragédia no Sudão",
        subdeck: "Brasil e União Africana enfatizam o combate à fome, a cooperação Sul-Sul e o fim urgente da guerra no Sudão.",
        coreArgument:
          "A disputa de influências entre potências estrangeiras na África não resolve o subdesenvolvimento; a paz duradoura depende do fortalecimento institucional regional, combate à desertificação e reconciliação interna.",
        vocabulary: [
          {
            term: "Soluções africanas para desafios africanos",
            connotation: "positive",
            meaningOrContext: "Princípio de que a mediação deve ser conduzida pela União Africana e blocos locais autônomos",
          },
          {
            term: "Crise humanitária e deslocamento forçado no Sudão",
            connotation: "negative",
            meaningOrContext: "Alerta para 10 milhões de refugiados sudaneses praticamente esquecidos pela grande mídia global",
          },
          {
            term: "Cooperação técnica Sul-Sul e soberania agrícola",
            connotation: "positive",
            meaningOrContext: "Parcerias de transferência tecnológica para plantio em terras áridas e adaptação climática",
          },
        ],
        representativeSources: ["aljazeera", "agenciabrasil", "folha", "pagina12_mundo"],
        blindspots: [
          "Incapacidade crônica da União Africana e da CEDEAO de mediar com autoridade e reverter golpes já consumados",
          "Falta de recursos financeiros próprios para custear operações de paz independentes sem doações ocidentais",
          "Governos regionais não declarados que continuam financiando facções rivais na sangrenta guerra do Sudão",
        ],
        realHeadlines: [
          {
            outlet: "Al Jazeera English",
            outletId: "aljazeera",
            flag: "🇶🇦",
            title: "Sudan's Forgotten Famine: UN Warns Entire Generation at Risk as Humanitarian Aid is Blocked",
            framingTag: "Tragédia Humanitária",
          },
          {
            outlet: "Agência Brasil (EBC)",
            outletId: "agenciabrasil",
            flag: "🇧🇷",
            title: "Brasil defende reforço à cooperação agrícola no Sahel e cessar-fogo imediato no Sudão na ONU",
            framingTag: "Solidariedade Sul-Sul",
          },
          {
            outlet: "Folha de S.Paulo",
            outletId: "folha",
            flag: "🇧🇷",
            title: "África vive maior deslocamento humano do planeta enquanto atenção global segue focada na Europa",
            framingTag: "Pontos Cegos da Mídia",
          },
        ],
        metrics: {
          escalationSentiment: 48,
          militaryEmphasis: 35,
          diplomaticEmphasis: 85,
        },
      },
    },
  },

  essequibo: {
    hotspotId: "essequibo",
    topicTitle: "Disputa Territorial do Essequibo e Estabilidade na América do Sul",
    sharedFact:
      "Venezuela aprova criação de província na região do Essequibo após referendo consultivo; Guiana reforça parcerias militares com os EUA e Brasil mobiliza tropas e blindados para garantir a fronteira em Roraima.",
    comparatorStoryId: "tarifas",
    blocs: {
      west: {
        bloc: "west",
        blocName: "Bloco Ocidental",
        blocSubtitle: "Guiana, EUA, Reino Unido",
        framingHeadline: "Ameaça autoritária à soberania da Guiana e proteção de investimentos da ExxonMobil",
        subdeck: "Washington realiza manobras aéreas conjuntas com Georgetown e adverte Caracas contra qualquer invasão territorial.",
        coreArgument:
          "O laudo arbitral de 1899 fixou de forma definitiva e juridicamente vinculante a fronteira entre os países; a retórica militar de Maduro é uma agressão inaceitável à soberania de um vizinho democrático menor.",
        vocabulary: [
          {
            term: "Agressão autoritária e revanchismo territorial",
            connotation: "negative",
            meaningOrContext: "Classificação do plebiscito venezuelano como cortina de fumaça política para desviar de crises internas",
          },
          {
            term: "Soberania incontestável com base no Laudo de Paris de 1899",
            connotation: "positive",
            meaningOrContext: "Defesa jurídica da validade da fronteira secular traçada pela arbitragem internacional",
          },
          {
            term: "Jurisdição da Corte Internacional de Justiça (CIJ)",
            connotation: "positive",
            meaningOrContext: "Exigência de que Caracas se submeta ao julgamento final do principal tribunal da ONU",
          },
        ],
        representativeSources: ["wsj_world", "washington_post", "timesofisrael", "reuters"],
        blindspots: [
          "Minimiza os documentos históricos que indicam acordos políticos desfavoráveis a Caracas na arbitragem de 1899",
          "Omite a pressa de multinacionais ocidentais em extrair petróleo em bacias marítimas cuja delimitação ainda é litigiosa",
          "Subestima o risco de desestabilização regional com a instalação de bases militares de Washington na América do Sul",
        ],
        realHeadlines: [
          {
            outlet: "The Wall Street Journal",
            outletId: "wsj_world",
            flag: "🇺🇸",
            title: "US Military Aircraft Fly Drills Over Guyana Amid Rising Threats from Venezuelan Military Mobilization",
            framingTag: "Presença Militar",
          },
          {
            outlet: "The Washington Post",
            outletId: "washington_post",
            flag: "🇺🇸",
            title: "Guyana Leans on US and Western Alliances as Massive Offshore Oil Fields Reshape Tiny Nation",
            framingTag: "Corrida Petrolífera",
          },
          {
            outlet: "Reuters",
            outletId: "reuters",
            flag: "🇬🇧",
            title: "Guyana's President Ali Rebuffs Venezuelan Claims, Insists Only ICJ Can Rule on Border Validity",
            framingTag: "Defesa Legal",
          },
        ],
        metrics: {
          escalationSentiment: 65,
          militaryEmphasis: 70,
          diplomaticEmphasis: 42,
        },
      },
      east: {
        bloc: "east",
        blocName: "Bloco Eurasiático / Oriental",
        blocSubtitle: "Venezuela, Rússia, China",
        framingHeadline: "Reivindicação histórica legítima e denúncia de pilhagem neocolonial do petróleo",
        subdeck: "Caracas e parceiros do bloco anti-hegemônico acusam a Guiana de agir como filial da ExxonMobil e base do Pentágono.",
        coreArgument:
          "O território do Essequibo foi espoliado pelo império britânico através de um laudo fraudulento; o Acordo de Genebra de 1966 é o único marco legal vigente que obriga a uma solução prática e mutuamente acordada.",
        vocabulary: [
          {
            term: "Território historicamente espoliado pelo império britânico",
            connotation: "positive",
            meaningOrContext: "Invocação da jurisdição colonial da Capitania Geral da Venezuela e do Acordo de Genebra de 1966",
          },
          {
            term: "Corporação transnacional ExxonMobil como governo de fato",
            connotation: "negative",
            meaningOrContext: "Denúncia de que concessões petrolíferas foram outorgadas em águas não delimitadas sob tutela dos EUA",
          },
          {
            term: "Rejeição da jurisdição da Corte de Haia",
            connotation: "negative",
            meaningOrContext: "Defesa de que disputas limítrofes entre vizinhos só podem ser solucionadas por consenso bilateral direto",
          },
        ],
        representativeSources: ["global_times", "tass", "sputnik_globe", "scmp"],
        blindspots: [
          "Oculta a flagrante exploração da bandeira patriótica do Essequibo para fins de sustentação política do regime de Maduro",
          "Silencia sobre o risco real de arrastar a América do Sul para um conflito militar destrutivo",
          "Ignora a vontade dos 125 mil habitantes locais do Essequibo, de maioria anglófona e indígena, que rejeitam a tutela de Caracas",
        ],
        realHeadlines: [
          {
            outlet: "TASS",
            outletId: "tass",
            flag: "🇷🇺",
            title: "Venezuela Establishes New Administrative Entity for Guayana Esequiba, Citing Sovereign 1966 Geneva Treaty",
            framingTag: "Soberania Territorial",
          },
          {
            outlet: "Global Times",
            outletId: "global_times",
            flag: "🇨🇳",
            title: "US Military Exercises in Essequibo Threaten South American Regional Peace and Exploit Resource Dispute",
            framingTag: "Crítica ao Pentágono",
          },
          {
            outlet: "Sputnik News",
            outletId: "sputnik_globe",
            flag: "🇷🇺",
            title: "Maduro Warns Transnational Energy Giants Against Unlawful Oil Extraction in Contested Waters",
            framingTag: "Disputa Petrolífera",
          },
        ],
        metrics: {
          escalationSentiment: 68,
          militaryEmphasis: 72,
          diplomaticEmphasis: 35,
        },
      },
      global_south: {
        bloc: "global_south",
        blocName: "Sul Global & Neutros",
        blocSubtitle: "Brasil, Argentina, Colômbia, CARICOM",
        framingHeadline: "Preservação da América do Sul como Zona de Paz e mediação ativa do Brasil",
        subdeck: "Itamaraty e líderes sul-americanos costuram a Declaração de Argyle para barrar intervenção militar e manter diálogo direto.",
        coreArgument:
          "A América do Sul conquistou o estatuto histórico de continente sem guerras intercontinentais; qualquer provocação bélica ou instalação de forças estrangeiras deve ser freada pela mediação diplomática regional.",
        vocabulary: [
          {
            term: "América do Sul como Zona de Paz",
            connotation: "positive",
            meaningOrContext: "Princípio basilar da diplomacia regional que veta bases militares estrangeiras e guerras no continente",
          },
          {
            term: "Declaração de Argyle e diplomacia de contenção",
            connotation: "positive",
            meaningOrContext: "Compromisso firmado entre Caracas e Georgetown sob mediação brasileira para não usar a força armada",
          },
          {
            term: "Inviolabilidade de fronteiras e respeito ao direito internacional",
            connotation: "neutral",
            meaningOrContext: "Exigência de estabilidade jurídica territorial sem endossar aventuras militares unilaterais",
          },
        ],
        representativeSources: ["folha", "clarin_mundo", "poder360", "pagina12_mundo"],
        blindspots: [
          "Dificuldade de exercer pressão coercitiva sobre Caracas sem parecer cúmplice da retórica bolivariana ou aliado de Washington",
          "Falta de aparato militar de grande escala para intervir caso tropas decidam avançar por vias não demarcadas na floresta",
          "Fracasso histórico em construir alternativas de exploração conjunta de energia que pudessem desarmar o litígio financeiro",
        ],
        realHeadlines: [
          {
            outlet: "Folha de S.Paulo",
            outletId: "folha",
            flag: "🇧🇷",
            title: "Itamaraty atua nos bastidores e cobra que Venezuela e Guiana respeitem acordo para não usar a força militar",
            framingTag: "Mediação Brasileira",
          },
          {
            outlet: "Clarín",
            outletId: "clarin_mundo",
            flag: "🇦🇷",
            title: "Tensión en el Cono Norte: el dilema de Brasil ante el riesgo de que la crisis de Essequibo arrastre a la región",
            framingTag: "Risco Regional",
          },
          {
            outlet: "Poder360",
            outletId: "poder360",
            flag: "🇧🇷",
            title: "Exército brasileiro reforça blindados em Roraima e fecha fronteira para impedir incursões terrestres",
            framingTag: "Defesa de Fronteira",
          },
        ],
        metrics: {
          escalationSentiment: 35,
          militaryEmphasis: 30,
          diplomaticEmphasis: 95,
        },
      },
    },
  },
};

// Populate convenient aliases on matrices
for (const key of Object.keys(NARRATIVE_MATRICES)) {
  const m = NARRATIVE_MATRICES[key];
  if (m.blocs) {
    m.west = m.blocs.west;
    m.east = m.blocs.east;
    m.global_south = m.blocs.global_south;
    m.globalSouth = m.blocs.global_south;

    for (const blocKey of ["west", "east", "global_south"] as const) {
      const b = m.blocs[blocKey];
      if (b) {
        if (!b.blindSpots && b.blindspots) {
          b.blindSpots = b.blindspots;
        } else if (!b.blindspots && b.blindSpots) {
          b.blindspots = b.blindSpots;
        }
      }
    }
  }
}

/**
 * Normaliza o ID do hotspot para aceitar hífens e underscores com coerção defensiva
 */
export const normalizeHotspotId = (id: unknown): string => {
  const norm = String(id ?? "").toLowerCase().trim().replace(/-/g, "_");
  if (norm === "mar_vermelho" || norm === "marvermelho") return "mar_vermelho";
  return norm;
};

/**
 * Retorna o hotspot correspondente ao ID informado
 */
export const getHotspot = (id: unknown): Hotspot | undefined => {
  const targetId = normalizeHotspotId(id);
  return HOTSPOTS.find((h) => h.id === targetId || normalizeHotspotId(h.id) === targetId);
};

/**
 * Alias de getHotspot
 */
export const getHotspotById = (id: unknown): Hotspot | undefined => getHotspot(id);

/**
 * Retorna a matriz de narrativas tri-axial de um hotspot
 */
export const getNarrativeMatrix = (hotspotId: unknown): NarrativeMatrix | undefined => {
  const targetId = normalizeHotspotId(hotspotId);
  return NARRATIVE_MATRICES[targetId];
};

/**
 * Retorna todas as fontes cadastradas pertencentes ao bloco geopolítico informado
 */
export const getSourcesByBloc = (bloc: GeopoliticalBloc): Outlet[] => {
  return OUTLETS.filter(
    (o) => o.geopoliticalBloc === bloc || o.geopolitical_bloc === bloc
  );
};

/**
 * Filtra hotspots por nível de severidade de tensão
 */
export const filterHotspotsBySeverity = (severity: TensionSeverity): Hotspot[] => {
  return HOTSPOTS.filter((h) => h.severity === severity || h.tensionLevel === severity);
};

/**
 * Camadas Táticas, Geográficas e de Transmissão do PRISMA
 * Inclui:
 * 1. Países, Bandeiras e Capitais mundiais (com zoom adaptativo)
 * 2. Sedes das Rádios e TVs cadastradas (para sintonização de 1 toque no mapa)
 * 3. Chokepoints Marítimos e Rotas Críticas de Petróleo/Grãos
 * 4. Cabos Submarinos Globais de Telecomunicação
 * 5. Instalações Nucleares Civis e Estratégicas
 * 6. Alertas de Clima Severo e Ciclones
 */

export interface CountryCapital {
  code: string;
  country: string;
  flag: string;
  capital: string;
  lat: number;
  lng: number;
  capitalLat: number;
  capitalLng: number;
  region: string;
  population?: string;
  bloc?: "ocidente" | "eurasia" | "sul_global";
}

export interface MediaLocation {
  id: string;
  name: string;
  type: "tv" | "radio";
  city: string;
  lat: number;
  lng: number;
  frequencyOrDial: string;
  category: string;
  description: string;
  streamUrl: string;
  watchUrl?: string;
  accentColor: string;
  badge: string;
}

export interface MaritimeChokepoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  waterway: string;
  dailyOilTransit: string;
  importance: string;
  riskLevel: "critico" | "alto" | "moderado";
  keyParties: string[];
}

export interface SubmarineCable {
  id: string;
  name: string;
  lengthKm: number;
  connects: string;
  riskNote: string;
  coordinates: [number, number][]; // [lat, lng][]
}

export interface NuclearFacility {
  id: string;
  name: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
  type: "civil" | "estrategico";
  status: string;
  reactors: number;
  capacityMWe?: number;
  riskNote: string;
}

export interface ExtremeWeatherAlert {
  id: string;
  name: string;
  type: "tufao" | "furacao" | "ciclone" | "tempestade";
  basin: string;
  lat: number;
  lng: number;
  windSpeedKmh: number;
  category: string;
  status: string;
}

/* =====================================================================
 * 1. PAÍSES, CAPITAIS E BANDEIRAS (50+ Nações Estratégicas)
 * ===================================================================== */
export const COUNTRIES_CAPITALS: CountryCapital[] = [
  // América do Sul
  { code: "BR", country: "Brasil", flag: "🇧🇷", capital: "Brasília", lat: -14.235, lng: -51.925, capitalLat: -15.7975, capitalLng: -47.8919, region: "América do Sul", population: "215M", bloc: "sul_global" },
  { code: "AR", country: "Argentina", flag: "🇦🇷", capital: "Buenos Aires", lat: -38.416, lng: -63.616, capitalLat: -34.6037, capitalLng: -58.3816, region: "América do Sul", population: "46M", bloc: "sul_global" },
  { code: "CL", country: "Chile", flag: "🇨🇱", capital: "Santiago", lat: -35.675, lng: -71.543, capitalLat: -33.4489, capitalLng: -70.6693, region: "América do Sul", population: "19M", bloc: "sul_global" },
  { code: "CO", country: "Colômbia", flag: "🇨🇴", capital: "Bogotá", lat: 4.5709, lng: -74.2973, capitalLat: 4.711, capitalLng: -74.0721, region: "América do Sul", population: "52M", bloc: "sul_global" },
  { code: "VE", country: "Venezuela", flag: "🇻🇪", capital: "Caracas", lat: 6.4238, lng: -66.5897, capitalLat: 10.4806, capitalLng: -66.9036, region: "América do Sul", population: "29M", bloc: "eurasia" },
  { code: "GY", country: "Guiana", flag: "🇬🇾", capital: "Georgetown", lat: 4.8604, lng: -58.9302, capitalLat: 6.8013, capitalLng: -58.1551, region: "América do Sul", population: "800k", bloc: "sul_global" },
  
  // América do Norte
  { code: "US", country: "Estados Unidos", flag: "🇺🇸", capital: "Washington, D.C.", lat: 37.0902, lng: -95.7129, capitalLat: 38.9072, capitalLng: -77.0369, region: "América do Norte", population: "335M", bloc: "ocidente" },
  { code: "CA", country: "Canadá", flag: "🇨🇦", capital: "Ottawa", lat: 56.1304, lng: -106.3468, capitalLat: 45.4215, capitalLng: -75.6972, region: "América do Norte", population: "40M", bloc: "ocidente" },
  { code: "MX", country: "México", flag: "🇲🇽", capital: "Cidade do México", lat: 23.6345, lng: -102.5528, capitalLat: 19.4326, capitalLng: -99.1332, region: "América do Norte", population: "128M", bloc: "sul_global" },

  // Europa
  { code: "UA", country: "Ucrânia", flag: "🇺🇦", capital: "Kiev", lat: 48.3794, lng: 31.1656, capitalLat: 50.4501, capitalLng: 30.5234, region: "Europa", population: "38M", bloc: "ocidente" },
  { code: "RU", country: "Rússia", flag: "🇷🇺", capital: "Moscou", lat: 61.524, lng: 105.3188, capitalLat: 55.7558, capitalLng: 37.6173, region: "Eurásia", population: "144M", bloc: "eurasia" },
  { code: "GB", country: "Reino Unido", flag: "🇬🇧", capital: "Londres", lat: 55.3781, lng: -3.436, capitalLat: 51.5074, capitalLng: -0.1278, region: "Europa", population: "67M", bloc: "ocidente" },
  { code: "FR", country: "França", flag: "🇫🇷", capital: "Paris", lat: 46.2276, lng: 2.2137, capitalLat: 48.8566, capitalLng: 2.3522, region: "Europa", population: "68M", bloc: "ocidente" },
  { code: "DE", country: "Alemanha", flag: "🇩🇪", capital: "Berlim", lat: 51.1657, lng: 10.4515, capitalLat: 52.52, capitalLng: 13.405, region: "Europa", population: "84M", bloc: "ocidente" },
  { code: "IT", country: "Itália", flag: "🇮🇹", capital: "Roma", lat: 41.8719, lng: 12.5674, capitalLat: 41.9028, capitalLng: 12.4964, region: "Europa", population: "59M", bloc: "ocidente" },
  { code: "PL", country: "Polônia", flag: "🇵🇱", capital: "Varsóvia", lat: 51.9194, lng: 19.1451, capitalLat: 52.2297, capitalLng: 21.0122, region: "Europa", population: "38M", bloc: "ocidente" },
  { code: "TR", country: "Turquia", flag: "🇹🇷", capital: "Ancara", lat: 38.9637, lng: 35.2433, capitalLat: 39.9334, capitalLng: 32.8597, region: "Eurásia", population: "85M", bloc: "sul_global" },

  // Ásia & Oriente Médio
  { code: "CN", country: "China", flag: "🇨🇳", capital: "Pequim", lat: 35.8617, lng: 104.1954, capitalLat: 39.9042, capitalLng: 116.4074, region: "Ásia", population: "1.4B", bloc: "eurasia" },
  { code: "TW", country: "Taiwan", flag: "🇹🇼", capital: "Taipei", lat: 23.6978, lng: 120.9605, capitalLat: 25.033, capitalLng: 121.5654, region: "Ásia", population: "23M", bloc: "ocidente" },
  { code: "JP", country: "Japão", flag: "🇯🇵", capital: "Tóquio", lat: 36.2048, lng: 138.2529, capitalLat: 35.6762, capitalLng: 139.6503, region: "Ásia", population: "125M", bloc: "ocidente" },
  { code: "KR", country: "Coreia do Sul", flag: "🇰🇷", capital: "Seul", lat: 35.9078, lng: 127.7669, capitalLat: 37.5665, capitalLng: 126.978, region: "Ásia", population: "52M", bloc: "ocidente" },
  { code: "KP", country: "Coreia do Norte", flag: "🇰🇵", capital: "Pyongyang", lat: 40.3399, lng: 127.5101, capitalLat: 39.0392, capitalLng: 125.7625, region: "Ásia", population: "26M", bloc: "eurasia" },
  { code: "IN", country: "Índia", flag: "🇮🇳", capital: "Nova Délhi", lat: 20.5937, lng: 78.9629, capitalLat: 28.6139, capitalLng: 77.209, region: "Ásia", population: "1.42B", bloc: "sul_global" },
  { code: "TH", country: "Tailândia", flag: "🇹🇭", capital: "Bangkok", lat: 15.87, lng: 100.9925, capitalLat: 13.7563, capitalLng: 100.5018, region: "Ásia", population: "71M", bloc: "sul_global" },
  { code: "ID", country: "Indonésia", flag: "🇮🇩", capital: "Jacarta", lat: -0.7893, lng: 113.9213, capitalLat: -6.2088, capitalLng: 106.8456, region: "Ásia", population: "277M", bloc: "sul_global" },
  { code: "IR", country: "Irã", flag: "🇮🇷", capital: "Teerã", lat: 32.4279, lng: 53.688, capitalLat: 35.6892, capitalLng: 51.389, region: "Oriente Médio", population: "88M", bloc: "eurasia" },
  { code: "SA", country: "Arábia Saudita", flag: "🇸🇦", capital: "Riad", lat: 23.8859, lng: 45.0792, capitalLat: 24.7136, capitalLng: 46.6753, region: "Oriente Médio", population: "36M", bloc: "sul_global" },
  { code: "IL", country: "Israel", flag: "🇮🇱", capital: "Jerusalém", lat: 31.0461, lng: 34.8516, capitalLat: 31.7683, capitalLng: 35.2137, region: "Oriente Médio", population: "9.7M", bloc: "ocidente" },
  { code: "AE", country: "Emirados Árabes", flag: "🇦🇪", capital: "Abu Dhabi", lat: 23.4241, lng: 53.8478, capitalLat: 24.4539, capitalLng: 54.3773, region: "Oriente Médio", population: "10M", bloc: "sul_global" },
  { code: "QA", country: "Catar", flag: "🇶🇦", capital: "Doha", lat: 25.3548, lng: 51.1839, capitalLat: 25.2854, capitalLng: 51.531, region: "Oriente Médio", population: "3M", bloc: "sul_global" },
  { code: "EG", country: "Egito", flag: "🇪🇬", capital: "Cairo", lat: 26.8206, lng: 30.8025, capitalLat: 30.0444, capitalLng: 31.2357, region: "África / Oriente Médio", population: "110M", bloc: "sul_global" },

  // África & Oceania
  { code: "ZA", country: "África do Sul", flag: "🇿🇦", capital: "Pretória", lat: -30.5595, lng: 22.9375, capitalLat: -25.7479, capitalLng: 28.2293, region: "África", population: "60M", bloc: "sul_global" },
  { code: "NG", country: "Nigéria", flag: "🇳🇬", capital: "Abuja", lat: 9.082, lng: 8.6753, capitalLat: 9.0579, capitalLng: 7.4951, region: "África", population: "220M", bloc: "sul_global" },
  { code: "SD", country: "Sudão", flag: "🇸🇩", capital: "Cartum", lat: 12.8628, lng: 30.2176, capitalLat: 15.5007, capitalLng: 32.5599, region: "África", population: "46M", bloc: "sul_global" },
  { code: "AU", country: "Austrália", flag: "🇦🇺", capital: "Camberra", lat: -25.2744, lng: 133.7751, capitalLat: -35.2809, capitalLng: 149.13, region: "Oceania", population: "26M", bloc: "ocidente" },
];

/* =====================================================================
 * 2. SEDES DAS RÁDIOS E EMISSORAS DE TV (PRISMA Live Stations)
 * ===================================================================== */
export const MEDIA_STATIONS_LOCATIONS: MediaLocation[] = [
  {
    id: "bandnews_tv",
    name: "BandNews TV",
    type: "tv",
    city: "São Paulo, SP",
    lat: -23.5932,
    lng: -46.6853,
    frequencyOrDial: "TV Fechada / 24h",
    category: "Notícias & Política",
    description: "Sede do Grupo Bandeirantes (Morumbi). Jornalismo hard news 24h.",
    streamUrl: "https://www.youtube-nocookie.com/embed/BoYgLl3-fl8?autoplay=1&mute=0&enablejsapi=1",
    watchUrl: "https://www.youtube.com/watch?v=BoYgLl3-fl8",
    accentColor: "#dc2626",
    badge: "24h Ao Vivo",
  },
  {
    id: "cnn_brasil",
    name: "CNN Brasil",
    type: "tv",
    city: "São Paulo, SP",
    lat: -23.5614,
    lng: -46.6565,
    frequencyOrDial: "TV Fechada / Streaming",
    category: "Hard News & Economia",
    description: "Sede na Av. Paulista. Noticiário econômico e político nacional.",
    streamUrl: "https://www.youtube-nocookie.com/embed/WzqCrEb_wvg?autoplay=1&mute=0&enablejsapi=1",
    watchUrl: "https://www.youtube.com/watch?v=WzqCrEb_wvg",
    accentColor: "#cc0000",
    badge: "Ao Vivo",
  },
  {
    id: "record_news",
    name: "Record News",
    type: "tv",
    city: "São Paulo, SP",
    lat: -23.5283,
    lng: -46.6577,
    frequencyOrDial: "Canal 42 UHF",
    category: "Notícias Gerais",
    description: "Sede Barra Funda. Primeiro canal aberto de notícias 24 horas do Brasil.",
    streamUrl: "https://www.youtube-nocookie.com/embed/yCfb9Na3rcI?autoplay=1&mute=0&enablejsapi=1",
    watchUrl: "https://www.youtube.com/watch?v=yCfb9Na3rcI",
    accentColor: "#2563eb",
    badge: "TV Aberta",
  },
  {
    id: "jp_news",
    name: "Jovem Pan News",
    type: "tv",
    city: "São Paulo, SP",
    lat: -23.5658,
    lng: -46.6521,
    frequencyOrDial: "TV Paga / Web",
    category: "Opinião & Notícias",
    description: "Sede Av. Paulista (Edifício Sirinhaém). Debates e comentários políticos.",
    streamUrl: "https://www.youtube-nocookie.com/embed/qveN6Hy183o?autoplay=1&mute=0&enablejsapi=1",
    watchUrl: "https://www.youtube.com/watch?v=qveN6Hy183o",
    accentColor: "#b91c1c",
    badge: "Ao Vivo",
  },
  {
    id: "tv_brasil",
    name: "TV Brasil",
    type: "tv",
    city: "Brasília, DF",
    lat: -15.7952,
    lng: -47.8821,
    frequencyOrDial: "TV Aberta Digital",
    category: "Pública & Cidadania",
    description: "Sede da Empresa Brasil de Comunicação (EBC) no Setor Comercial Sul.",
    streamUrl: "https://www.youtube-nocookie.com/embed/G6o-hD4u6zY?autoplay=1&mute=0&enablejsapi=1",
    watchUrl: "https://www.youtube.com/watch?v=G6o-hD4u6zY",
    accentColor: "#15803d",
    badge: "Pública",
  },
  {
    id: "sbt_news",
    name: "SBT News",
    type: "tv",
    city: "Osasco / São Paulo",
    lat: -23.4901,
    lng: -46.7774,
    frequencyOrDial: "Digital / Multiplataforma",
    category: "Giro Rápido",
    description: "Complexo Anhanguera (CDT da Anhanguera). Cobertura contínua de plantão.",
    streamUrl: "https://www.youtube-nocookie.com/embed/Q4XkQeU6zYc?autoplay=1&mute=0&enablejsapi=1",
    watchUrl: "https://www.youtube.com/watch?v=Q4XkQeU6zYc",
    accentColor: "#0284c7",
    badge: "Plantão",
  },

  // RÁDIOS ALL-NEWS
  {
    id: "cbn_sp",
    name: "CBN São Paulo",
    type: "radio",
    city: "São Paulo, SP",
    lat: -23.5489,
    lng: -46.6366,
    frequencyOrDial: "90.5 FM",
    category: "Notícias & Trânsito",
    description: "Central da Rede CBN em SP. Jornalismo contínuo e cobertura metropolitana.",
    streamUrl: "https://cbn.radios.globo.com/player/aovivo/sp",
    accentColor: "#b91c1c",
    badge: "90.5 FM",
  },
  {
    id: "cbn_rj",
    name: "CBN Rio de Janeiro",
    type: "radio",
    city: "Rio de Janeiro, RJ",
    lat: -22.9068,
    lng: -43.1729,
    frequencyOrDial: "92.5 FM",
    category: "Notícias & Política",
    description: "Sede Rio de Janeiro da Central Brasileira de Notícias.",
    streamUrl: "https://cbn.radios.globo.com/player/aovivo/rj",
    accentColor: "#b91c1c",
    badge: "92.5 FM",
  },
  {
    id: "bandnews_fm",
    name: "BandNews FM",
    type: "radio",
    city: "São Paulo, SP",
    lat: -23.5935,
    lng: -46.6858,
    frequencyOrDial: "96.9 FM",
    category: "Notícias em 20 min",
    description: "Jornalismo dinâmico renovado a cada 20 minutos com trânsito e prestação de serviço.",
    streamUrl: "https://evpp.mm.uol.com.br/band/bandnewsfm_sp/playlist.m3u8",
    accentColor: "#dc2626",
    badge: "96.9 FM",
  },
  {
    id: "jp_fm",
    name: "Jovem Pan FM",
    type: "radio",
    city: "São Paulo, SP",
    lat: -23.5655,
    lng: -46.6518,
    frequencyOrDial: "100.9 FM",
    category: "Notícias & Talk Show",
    description: "Transmissão histórica da Av. Paulista 807.",
    streamUrl: "https://r13.ciclano.io:1443/live/jovempan/playlist.m3u8",
    accentColor: "#991b1b",
    badge: "100.9 FM",
  },
  {
    id: "radio_gaucha",
    name: "Rádio Gaúcha",
    type: "radio",
    city: "Porto Alegre, RS",
    lat: -30.0346,
    lng: -51.2177,
    frequencyOrDial: "93.7 FM",
    category: "Notícias & Esportes",
    description: "Sede do Grupo RBS em Porto Alegre. Líder em jornalismo e cobertura regional no Sul.",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/GAUCHA_SPAAC.aac",
    accentColor: "#0284c7",
    badge: "93.7 FM",
  },
  {
    id: "radio_bandeirantes",
    name: "Rádio Bandeirantes",
    type: "radio",
    city: "São Paulo, SP",
    lat: -23.594,
    lng: -46.6865,
    frequencyOrDial: "840 AM / 90.9 FM",
    category: "Debate & Informação",
    description: "Tradicional emissora all-news do Morumbi com análises e colunistas renomados.",
    streamUrl: "https://evpp.mm.uol.com.br/band/bandeirantes_sp/playlist.m3u8",
    accentColor: "#ea580c",
    badge: "90.9 FM",
  },
  {
    id: "radio_eldorado",
    name: "Rádio Eldorado",
    type: "radio",
    city: "São Paulo, SP",
    lat: -23.5075,
    lng: -46.6805,
    frequencyOrDial: "107.3 FM",
    category: "Cultura & Notícias",
    description: "Emissora do Grupo Estado (Estadão). Notícias apuradas, sustentabilidade e cultura.",
    streamUrl: "https://streaming.eldorado.com.br/hls/eldorado.m3u8",
    accentColor: "#16a34a",
    badge: "107.3 FM",
  },
];

/* =====================================================================
 * 3. CHOKEPOINTS MARÍTIMOS E ROTAS GLOBAIS DE PETRÓLEO E GRÃOS
 * ===================================================================== */
export const MARITIME_CHOKEPOINTS: MaritimeChokepoint[] = [
  {
    id: "choke_hormuz",
    name: "Estreito de Ormuz",
    lat: 26.5667,
    lng: 56.25,
    waterway: "Golfo Pérsico / Golfo de Omã",
    dailyOilTransit: "21 milhões de barris/dia (21% do petróleo global)",
    importance: "Principal artéria energética do planeta; conecta produtores do Golfo aos mercados asiáticos e ocidentais.",
    riskLevel: "critico",
    keyParties: ["Irã", "Omã", "EUA", "Arábia Saudita", "Emirados Árabes"],
  },
  {
    id: "choke_malacca",
    name: "Estreito de Malaca",
    lat: 1.43,
    lng: 102.89,
    waterway: "Oceano Índico / Mar do Sul da China",
    dailyOilTransit: "16 milhões de barris/dia",
    importance: "Rota comercial mais movimentada da Ásia; conecta petróleo do Oriente Médio à China, Japão e Coreia.",
    riskLevel: "alto",
    keyParties: ["Indonésia", "Malásia", "Singapura", "China"],
  },
  {
    id: "choke_suez",
    name: "Canal de Suez",
    lat: 30.5852,
    lng: 32.2654,
    waterway: "Mar Vermelho / Mar Mediterrâneo",
    dailyOilTransit: "5.5 milhões de barris/dia + 12% do comércio mundial",
    importance: "Evita o contorno pelo Cabo da Boa Esperança; vital para o abastecimento da Europa e rotas de contêineres.",
    riskLevel: "alto",
    keyParties: ["Egito", "União Europeia", "EUA"],
  },
  {
    id: "choke_mandeb",
    name: "Bab el-Mandeb",
    lat: 12.5833,
    lng: 43.3333,
    waterway: "Mar Vermelho / Golfo de Áden",
    dailyOilTransit: "4.8 milhões de barris/dia",
    importance: "Gargalo meridional do Mar Vermelho sob ataque de mísseis houthis; força desvio de frotas pelo sul da África.",
    riskLevel: "critico",
    keyParties: ["Iêmen", "Djibuti", "Eritreia", "EUA", "Arábia Saudita"],
  },
  {
    id: "choke_panama",
    name: "Canal do Panamá",
    lat: 9.08,
    lng: -79.68,
    waterway: "Oceano Pacífico / Oceano Atlântico",
    dailyOilTransit: "1.0 milhão de barris/dia + grãos e gás GNL",
    importance: "Gargalo logístico essencial para exportações de grãos e gás das Américas para a Ásia.",
    riskLevel: "moderado",
    keyParties: ["Panamá", "EUA", "China", "Japão"],
  },
  {
    id: "choke_bosphorus",
    name: "Estreito de Bósforo e Dardanelos",
    lat: 41.12,
    lng: 29.08,
    waterway: "Mar Negro / Mar Mediterrâneo",
    dailyOilTransit: "2.4 milhões de barris/dia + corredor de grãos da Ucrânia/Rússia",
    importance: "Único acesso marítimo das nações do Mar Negro; regulado pela Convenção de Montreux.",
    riskLevel: "alto",
    keyParties: ["Turquia", "Rússia", "Ucrânia"],
  },
  {
    id: "choke_gibraltar",
    name: "Estreito de Gibraltar",
    lat: 35.96,
    lng: -5.6,
    waterway: "Oceano Atlântico / Mar Mediterrâneo",
    dailyOilTransit: "Passagem de mais de 100.000 embarcações/ano",
    importance: "Porta de entrada do Mediterrâneo, sob vigilância militar contínua da OTAN.",
    riskLevel: "moderado",
    keyParties: ["Espanha", "Reino Unido", "Marrocos"],
  },
];

/* =====================================================================
 * 4. CABOS SUBMARINOS GLOBAIS DE INTERNET
 * ===================================================================== */
export const SUBMARINE_CABLES: SubmarineCable[] = [
  {
    id: "cable_ellalink",
    name: "EllaLink (Brasil ↔ Europa)",
    lengthKm: 6200,
    connects: "Fortaleza (Brasil) ↔ Sines (Portugal)",
    riskNote: "Primeira conexão transatlântica direta de baixa latência América do Sul-Europa sem passar pelos EUA.",
    coordinates: [
      [-3.73, -38.52], // Fortaleza
      [14.9, -23.5],   // Cabo Verde
      [28.4, -16.2],   // Ilhas Canárias
      [37.95, -8.86],  // Sines
    ],
  },
  {
    id: "cable_marea",
    name: "MAREA (EUA ↔ Europa)",
    lengthKm: 6600,
    connects: "Virginia Beach (EUA) ↔ Bilbao (Espanha)",
    riskNote: "Cabo de maior largura de banda do Atlântico Norte (224 Tbps), propriedade de Meta e Microsoft.",
    coordinates: [
      [36.85, -75.97], // Virginia Beach
      [38.5, -45.0],   // Atlântico Central
      [43.34, -3.0],   // Bilbao
    ],
  },
  {
    id: "cable_seabras",
    name: "Seabras-1 (Brasil ↔ EUA)",
    lengthKm: 10800,
    connects: "Praia Grande (Brasil) ↔ Wall Township (EUA)",
    riskNote: "Artéria central do tráfego financeiro e de nuvem entre a B3 (SP) e Wall Street (NY).",
    coordinates: [
      [-24.0, -46.4],  // Praia Grande
      [-12.9, -38.5],  // Salvador
      [12.0, -50.0],   // Atlântico Equatorial
      [25.0, -65.0],   // Mar do Caribe
      [40.16, -74.05], // Wall Township
    ],
  },
  {
    id: "cable_seamewe",
    name: "SEA-ME-WE 6 (Ásia ↔ Europa pelo Mar Vermelho)",
    lengthKm: 19200,
    connects: "Singapura ↔ Índia ↔ Egito ↔ França",
    riskNote: "Passa pelo Mar Vermelho próximo ao Iêmen; vulnerável a cortes físicos por âncoras e ações armadas.",
    coordinates: [
      [1.3, 103.8],   // Singapura
      [13.0, 80.2],   // Chennai, Índia
      [18.9, 72.8],   // Mumbai
      [12.5, 43.5],   // Bab el-Mandeb
      [27.8, 34.3],   // Mar Vermelho
      [31.2, 32.3],   // Port Said
      [43.3, 5.3],    // Marselha, França
    ],
  },
  {
    id: "cable_transpacific",
    name: "Jupiter (EUA ↔ Japão ↔ Filipinas)",
    lengthKm: 14600,
    connects: "Oregon (EUA) ↔ Maruyama (Japão) ↔ Daet (Filipinas)",
    riskNote: "Cruza a bacia do Pacífico conectando os maiores data centers de inteligência artificial da Ásia e EUA.",
    coordinates: [
      [45.1, -123.9],  // Oregon
      [35.0, -170.0],  // Pacífico Central
      [35.5, 140.2],   // Japão
      [14.1, 122.9],   // Filipinas
    ],
  },
];

/* =====================================================================
 * 5. INSTALAÇÕES NUCLEARES CIVIS E ESTRATÉGICAS
 * ===================================================================== */
export const NUCLEAR_FACILITIES: NuclearFacility[] = [
  {
    id: "nuc_angra",
    name: "Central Nuclear Almirante Álvaro Alberto (Angra 1 & 2)",
    country: "Brasil",
    flag: "🇧🇷",
    lat: -23.0075,
    lng: -44.4578,
    type: "civil",
    status: "Operacional (Angra 1 e 2 ativas; Angra 3 em obras)",
    reactors: 2,
    capacityMWe: 1990,
    riskNote: "Gera ~3% da eletricidade do Brasil; localizada na Costa Verde do Rio de Janeiro.",
  },
  {
    id: "nuc_zaporizhzhia",
    name: "Usina Nuclear de Zaporizhzhia (ZNPP)",
    country: "Ucrânia / Ocupação Russa",
    flag: "🇺🇦",
    lat: 47.5117,
    lng: 34.5853,
    type: "estrategico",
    status: "Linha de frente de guerra (Reatores em parada a frio)",
    reactors: 6,
    capacityMWe: 5700,
    riskNote: "Maior usina nuclear da Europa. Sob controle militar russo desde 2022 com constante monitoramento da AIEA.",
  },
  {
    id: "nuc_fukushima",
    name: "Fukushima Daiichi",
    country: "Japão",
    flag: "🇯🇵",
    lat: 37.4214,
    lng: 141.0326,
    type: "civil",
    status: "Descomissionamento em curso",
    reactors: 6,
    capacityMWe: 4696,
    riskNote: "Cenário do acidente de 2011; descarte controlado de água tratada sob vigilância internacional.",
  },
  {
    id: "nuc_barakah",
    name: "Usina Nuclear de Barakah",
    country: "Emirados Árabes Unidos",
    flag: "🇦🇪",
    lat: 23.97,
    lng: 52.23,
    type: "civil",
    status: "Totalmente Operacional (4 reatores)",
    reactors: 4,
    capacityMWe: 5600,
    riskNote: "Primeira usina nuclear comercial do mundo árabe, fornecendo 25% da eletricidade dos Emirados.",
  },
  {
    id: "nuc_taishan",
    name: "Usina Nuclear de Taishan (EPR)",
    country: "China",
    flag: "🇨🇳",
    lat: 21.9167,
    lng: 112.9833,
    type: "civil",
    status: "Operacional",
    reactors: 2,
    capacityMWe: 3500,
    riskNote: "Primeira usina do mundo a operar reatores europeus pressurizados (EPR de terceira geração).",
  },
  {
    id: "nuc_natanz",
    name: "Complexo de Enriquecimento de Natanz",
    country: "Irã",
    flag: "🇮🇷",
    lat: 33.723,
    lng: 51.727,
    type: "estrategico",
    status: "Enriquecimento subterrâneo protegido",
    reactors: 0,
    riskNote: "Principal instalação de centrifugação de urânio do Irã; alvo de sabotagens cibernéticas (Stuxnet) e ataques.",
  },
  {
    id: "nuc_dimona",
    name: "Centro de Pesquisa Nuclear de Shimon Peres (Dimona)",
    country: "Israel",
    flag: "🇮🇱",
    lat: 30.999,
    lng: 35.145,
    type: "estrategico",
    status: "Instalação de segurança máxima no deserto de Neguev",
    reactors: 1,
    riskNote: "Base do arsenal de dissuasão nuclear não declarado de Israel sob ambiguidade estratégica.",
  },
];

/* =====================================================================
 * 6. ALERTAS DE CLIMA EXTREMO E CICLONES / TUFÕES
 * ===================================================================== */
export const EXTREME_WEATHER_ALERTS: ExtremeWeatherAlert[] = [
  {
    id: "storm_kongrey",
    name: "Super Tufão no Mar das Filipinas",
    type: "tufao",
    basin: "Pacífico Ocidental",
    lat: 21.5,
    lng: 124.0,
    windSpeedKmh: 215,
    category: "Categoria 4",
    status: "Ativo — alerta máximo para rotas marítimas e voos comerciais",
  },
  {
    id: "storm_cyclone_indico",
    name: "Ciclone Tropical no Índico Sul",
    type: "ciclone",
    basin: "Oceano Índico",
    lat: -14.2,
    lng: 68.5,
    windSpeedKmh: 140,
    category: "Categoria 2",
    status: "Em deslocamento para sudoeste",
  },
];

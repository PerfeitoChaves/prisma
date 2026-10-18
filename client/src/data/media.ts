/**
 * PRISMA (Fatos Cruzados) — Central Multimídia Ao Vivo
 * Curated catalog of 6 TV channels and 6 Brazilian all-news radio stations.
 * Verified stream URLs and YouTube embed links from Spec Miner 3 analysis.
 */

export interface LiveMediaItem {
  id: string;
  name: string;
  type: "tv" | "radio";
  category: string;
  streamUrl: string; // Direct audio URL, HLS m3u8, or YouTube embed URL
  embedType: "audio" | "youtube" | "hls";
  logoUrl?: string;
  city?: string;
  description?: string;
  badge?: string;
  frequencyOrDial?: string;
  handle?: string;
  channelId?: string;
  youtubeId?: string;
  videoId?: string;
  watchUrl?: string;
  directLiveUrl?: string;
  fallbackUrl?: string;
  accentColor?: string;
  isLive?: boolean;
}

export const TV_CHANNELS: LiveMediaItem[] = [
  {
    id: "bandnews_tv",
    name: "BandNews TV",
    type: "tv",
    category: "Notícias & Política",
    embedType: "youtube",
    handle: "@BandJornalismo",
    channelId: "UCoa-D_VfMkFrCYodrOC9-mA",
    youtubeId: "BoYgLl3-fl8",
    videoId: "BoYgLl3-fl8",
    streamUrl: "https://www.youtube-nocookie.com/embed/BoYgLl3-fl8?autoplay=1&mute=0&enablejsapi=1",
    watchUrl: "https://www.youtube.com/watch?v=BoYgLl3-fl8",
    directLiveUrl: "https://www.youtube.com/@BandJornalismo/live",
    city: "São Paulo, SP",
    description: "Jornalismo 24 horas do Grupo Bandeirantes com hard news e cobertura política em tempo real.",
    badge: "24h Ao Vivo",
    accentColor: "#dc2626",
  },
  {
    id: "cnn_brasil",
    name: "CNN Brasil",
    type: "tv",
    category: "Hard News & Economia",
    embedType: "youtube",
    handle: "@CNNBrasil",
    channelId: "UCvdwhh_fDyWccR42-rReZLw",
    youtubeId: "WzqCrEb_wvg",
    videoId: "WzqCrEb_wvg",
    streamUrl: "https://www.youtube-nocookie.com/embed/WzqCrEb_wvg?autoplay=1&mute=0&enablejsapi=1",
    watchUrl: "https://www.youtube.com/watch?v=WzqCrEb_wvg",
    directLiveUrl: "https://www.youtube.com/@CNNBrasil/live",
    city: "São Paulo, SP",
    description: "Cobertura ao vivo dos principais fatos do Brasil e do mundo, economia, análise e bastidores de Brasília.",
    badge: "Ao Vivo",
    accentColor: "#cc0000",
  },
  {
    id: "record_news",
    name: "Record News",
    type: "tv",
    category: "Notícias Gerais",
    embedType: "youtube",
    handle: "@RecordNews",
    channelId: "UC-QtjiJJdwBiOKgkf9hIVSQ",
    youtubeId: "yCfb9Na3rcI",
    videoId: "yCfb9Na3rcI",
    streamUrl: "https://www.youtube-nocookie.com/embed/yCfb9Na3rcI?autoplay=1&mute=0&enablejsapi=1",
    watchUrl: "https://www.youtube.com/watch?v=yCfb9Na3rcI",
    directLiveUrl: "https://www.youtube.com/@RecordNews/live",
    city: "São Paulo, SP",
    description: "Primeiro canal aberto de notícias 24 horas da televisão brasileira com foco em fatos e utilidade pública.",
    badge: "TV Aberta",
    accentColor: "#2563eb",
  },
  {
    id: "jp_news",
    name: "Jovem Pan News",
    type: "tv",
    category: "Opinião & Notícias",
    embedType: "youtube",
    handle: "@jovempannews",
    channelId: "UCP391YRAjSOdM_bwievgaZA",
    youtubeId: "qveN6Hy183o",
    videoId: "qveN6Hy183o",
    streamUrl: "https://www.youtube-nocookie.com/embed/qveN6Hy183o?autoplay=1&mute=0&enablejsapi=1",
    watchUrl: "https://www.youtube.com/watch?v=qveN6Hy183o",
    directLiveUrl: "https://www.youtube.com/@jovempannews/live",
    city: "São Paulo, SP",
    description: "Transmissão contínua com debates, comentários políticos e cobertura de plantão.",
    badge: "Ao Vivo",
    accentColor: "#ea580c",
  },
  {
    id: "tv_brasil",
    name: "TV Brasil",
    type: "tv",
    category: "Pública & Cidadania",
    embedType: "youtube",
    handle: "@tvbrasil",
    channelId: "UCSv9d0kQegylHWpP83jWSQg",
    youtubeId: "PgW00_-a8RM",
    videoId: "PgW00_-a8RM",
    streamUrl: "https://www.youtube-nocookie.com/embed/PgW00_-a8RM?autoplay=1&mute=0&enablejsapi=1",
    watchUrl: "https://www.youtube.com/watch?v=PgW00_-a8RM",
    directLiveUrl: "https://www.youtube.com/@tvbrasil/live",
    fallbackUrl: "https://tvbrasil-stream.ebc.com.br/index.m3u8",
    city: "Brasília, DF",
    description: "Emissora pública da EBC com transmissões institucionais, cultura, cidadania e cobertura ministerial.",
    badge: "EBC Aberta",
    accentColor: "#16a34a",
  },
  {
    id: "sbt_news",
    name: "SBT News",
    type: "tv",
    category: "Plantão & Fatos",
    embedType: "youtube",
    handle: "@sbtnews",
    channelId: "UCQD_Fq8NZXbHz9LI8Fa1Q9A",
    youtubeId: "81kfSjJkAAs",
    videoId: "81kfSjJkAAs",
    streamUrl: "https://www.youtube-nocookie.com/embed/81kfSjJkAAs?autoplay=1&mute=0&enablejsapi=1",
    watchUrl: "https://www.youtube.com/watch?v=81kfSjJkAAs",
    directLiveUrl: "https://www.youtube.com/@sbtnews/live",
    city: "São Paulo, SP",
    description: "Transmissão digital contínua 24h com plantões, entrevistas e notícias ao vivo do SBT.",
    badge: "Digital 24h",
    accentColor: "#0284c7",
  },
];



export const RADIO_STATIONS: LiveMediaItem[] = [
  {
    id: "cbn_sp",
    name: "CBN São Paulo",
    type: "radio",
    category: "All-News & Análise",
    embedType: "audio",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/CBN_SPAAC.aac",
    frequencyOrDial: "90.5 FM · SP",
    city: "São Paulo, SP",
    description: "A rádio que toca notícia. Rede all-news pioneira do Sistema Globo de Rádio com colunistas renomados.",
    badge: "90.5 FM",
    accentColor: "#b91c1c",
  },
  {
    id: "bandnews_fm",
    name: "BandNews FM",
    type: "radio",
    category: "Hard News a cada 20 min",
    embedType: "audio",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/BANDNEWSFM_SPAAC_SC",
    frequencyOrDial: "96.9 FM · SP",
    city: "São Paulo, SP",
    description: "Em 20 minutos tudo pode mudar. Rede de jornalismo ágil e dinâmico do Grupo Bandeirantes.",
    badge: "96.9 FM",
    accentColor: "#ef4444",
  },
  {
    id: "jp_fm",
    name: "Jovem Pan FM",
    type: "radio",
    category: "Notícias & Debates",
    embedType: "audio",
    streamUrl: "https://8062.brasilstream.com.br/mp3",
    frequencyOrDial: "100.9 FM · SP",
    city: "São Paulo, SP",
    description: "Jornal da Manhã, debates e cobertura política 24 horas por dia em transmissão ao vivo.",
    badge: "100.9 FM",
    accentColor: "#f97316",
  },
  {
    id: "gaucha",
    name: "Rádio Gaúcha",
    type: "radio",
    category: "Geral, Sul & Esporte",
    embedType: "audio",
    streamUrl: "https://1132747t.ha.azioncdn.net/primary/gaucha_rbs.sdp/playlist.m3u8",
    fallbackUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/GAUCHA_SPAAC.aac",
    frequencyOrDial: "93.7 FM · POA",
    city: "Porto Alegre, RS",
    description: "Líder de audiência no Sul do Brasil com jornalismo aprofundado, prestação de serviços e esporte.",
    badge: "93.7 FM",
    accentColor: "#059669",
  },
  {
    id: "bandeirantes",
    name: "Rádio Bandeirantes",
    type: "radio",
    category: "Tradição & Opinião",
    embedType: "audio",
    streamUrl: "https://stm23.xcast.com.br:11284/stream",
    fallbackUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/RADIO_BANDEIRANTESAAC.aac",
    frequencyOrDial: "90.9 FM · SP",
    city: "São Paulo, SP",
    description: "A voz de São Paulo e do Brasil. Tradição em jornalismo investigativo, colunismo e debates éticos.",
    badge: "90.9 FM",
    accentColor: "#2563eb",
  },
  {
    id: "eldorado",
    name: "Rádio Eldorado",
    type: "radio",
    category: "Jornalismo Qualificado & Cultura",
    embedType: "audio",
    streamUrl: "https://cast4.audiostream.com.br:2652/mp3",
    fallbackUrl: "https://eldoradolive01.akamaized.net/hls/live/2041487/eldorado/master.m3u8",
    frequencyOrDial: "107.3 FM · SP",
    city: "São Paulo, SP",
    description: "A rádio dos melhores ouvintes. Noticiário editorial do Estadão com curadoria musical e cultural refinada.",
    badge: "107.3 FM",
    accentColor: "#d97706",
  },
  {
    id: "cbn_rj",
    name: "CBN Rio de Janeiro",
    type: "radio",
    category: "All-News & Plantão",
    embedType: "audio",
    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/CBN_RJAAC.aac",
    frequencyOrDial: "92.5 FM · RJ",
    city: "Rio de Janeiro, RJ",
    description: "Cobertura ao vivo do Rio de Janeiro e do Brasil com a credibilidade do Sistema Globo de Rádio.",
    badge: "92.5 FM",
    accentColor: "#b91c1c",
  },
];

export const ALL_MEDIA_ITEMS: LiveMediaItem[] = [...TV_CHANNELS, ...RADIO_STATIONS];

export const DEFAULT_MEDIA_ITEM: LiveMediaItem = RADIO_STATIONS[1]; // BandNews FM default

"""
PRISMA — Módulo de Resolução Dinâmica de Transmissões Ao Vivo do YouTube
Resolve em tempo real os IDs de vídeo das lives 24h dos canais de televisão
(BandNews TV, CNN Brasil, Record News, JP News, TV Brasil, SBT News)
evitando telas de erro de vídeos inválidos ou streams agendados/descontinuados.
"""

import asyncio
import re
import time
from typing import List, Dict, Any, Optional
import httpx

# Catálogo mestre dos canais de TV com Handles oficiais e IDs de vídeo ativos verificados
LIVE_CHANNELS_CONFIG = [
    {
        "id": "bandnews_tv",
        "name": "BandNews TV",
        "type": "tv",
        "category": "Notícias & Política",
        "embedType": "youtube",
        "handle": "@BandJornalismo",
        "channelId": "UCoa-D_VfMkFrCYodrOC9-mA",
        "defaultVideoId": "BoYgLl3-fl8",
        "city": "São Paulo, SP",
        "description": "Jornalismo 24 horas do Grupo Bandeirantes com hard news e cobertura política em tempo real.",
        "badge": "24h Ao Vivo",
        "accentColor": "#dc2626",
    },
    {
        "id": "cnn_brasil",
        "name": "CNN Brasil",
        "type": "tv",
        "category": "Hard News & Economia",
        "embedType": "youtube",
        "handle": "@CNNBrasil",
        "channelId": "UCvdwhh_fDyWccR42-rReZLw",
        "defaultVideoId": "WzqCrEb_wvg",
        "city": "São Paulo, SP",
        "description": "Cobertura ao vivo dos principais fatos do Brasil e do mundo, economia, análise e bastidores de Brasília.",
        "badge": "Ao Vivo",
        "accentColor": "#cc0000",
    },
    {
        "id": "record_news",
        "name": "Record News",
        "type": "tv",
        "category": "Notícias Gerais",
        "embedType": "youtube",
        "handle": "@RecordNews",
        "channelId": "UC-QtjiJJdwBiOKgkf9hIVSQ",
        "defaultVideoId": "yCfb9Na3rcI",
        "city": "São Paulo, SP",
        "description": "Primeiro canal aberto de notícias 24 horas da televisão brasileira com foco em fatos e utilidade pública.",
        "badge": "TV Aberta",
        "accentColor": "#2563eb",
    },
    {
        "id": "jp_news",
        "name": "Jovem Pan News",
        "type": "tv",
        "category": "Opinião & Notícias",
        "embedType": "youtube",
        "handle": "@jovempannews",
        "channelId": "UCP391YRAjSOdM_bwievgaZA",
        "defaultVideoId": "qveN6Hy183o",
        "city": "São Paulo, SP",
        "description": "Transmissão contínua com debates, comentários políticos e cobertura de plantão.",
        "badge": "Ao Vivo",
        "accentColor": "#ea580c",
    },
    {
        "id": "tv_brasil",
        "name": "TV Brasil",
        "type": "tv",
        "category": "Pública & Cidadania",
        "embedType": "youtube",
        "handle": "@tvbrasil",
        "channelId": "UCSv9d0kQegylHWpP83jWSQg",
        "defaultVideoId": "PgW00_-a8RM",
        "fallbackUrl": "https://tvbrasil-stream.ebc.com.br/index.m3u8",
        "city": "Brasília, DF",
        "description": "Emissora pública da EBC com transmissões institucionais, cultura, cidadania e cobertura ministerial.",
        "badge": "EBC Aberta",
        "accentColor": "#16a34a",
    },
    {
        "id": "sbt_news",
        "name": "SBT News",
        "type": "tv",
        "category": "Plantão & Fatos",
        "embedType": "youtube",
        "handle": "@sbtnews",
        "channelId": "UCQD_Fq8NZXbHz9LI8Fa1Q9A",
        "defaultVideoId": "81kfSjJkAAs",
        "city": "São Paulo, SP",
        "description": "Transmissão digital contínua 24h com plantões, entrevistas e notícias ao vivo do SBT.",
        "badge": "Digital 24h",
        "accentColor": "#0284c7",
    },
]

# Cache em memória para o backend FastAPI (TTL de 15 minutos)
_LIVE_CHANNELS_CACHE = {
    "timestamp": 0.0,
    "data": []
}
LIVE_CACHE_TTL = 900  # 15 minutos em segundos

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
}


async def resolve_single_channel(client: httpx.AsyncClient, ch: Dict[str, Any]) -> Dict[str, Any]:
    """Tenta obter o ID do vídeo ao vivo atual a partir de https://www.youtube.com/{handle}/live."""
    handle = ch.get("handle")
    chid = ch.get("channelId")
    def_vid = ch["defaultVideoId"]
    
    url = f"https://www.youtube.com/{handle}/live" if handle else f"https://www.youtube.com/channel/{chid}/live"

    vid = def_vid
    try:
        r = await client.get(url, follow_redirects=True, timeout=8.0)
        if r.status_code == 200:
            m = re.search(r'<link rel="canonical" href="https://www\.youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})"', r.text)
            if not m:
                m = re.search(r'"videoId":"([a-zA-Z0-9_-]{11})"', r.text)
            if m:
                extracted = m.group(1)
                # Verifica se é uma live agendada futura (Upcoming) em vez de ao vivo agora
                is_upcoming = "upcomingEventData" in r.text or ("Live in " in r.text and '"isLive":true' not in r.text)
                if not is_upcoming and len(extracted) == 11 and re.match(r'^[a-zA-Z0-9_-]{11}$', extracted):
                    vid = extracted
    except Exception as e:
        vid = def_vid

    stream_url = f"https://www.youtube-nocookie.com/embed/{vid}?autoplay=1&mute=0&enablejsapi=1"
    watch_url = f"https://www.youtube.com/watch?v={vid}"
    direct_live_url = f"https://www.youtube.com/{handle}/live" if handle else f"https://www.youtube.com/channel/{chid}/live"

    item = {
        "id": ch["id"],
        "name": ch["name"],
        "type": ch["type"],
        "category": ch["category"],
        "embedType": ch["embedType"],
        "handle": handle,
        "channelId": chid,
        "youtubeId": vid,
        "videoId": vid,
        "streamUrl": stream_url,
        "watchUrl": watch_url,
        "directLiveUrl": direct_live_url,
        "city": ch.get("city", "Brasil"),
        "description": ch.get("description", ""),
        "badge": ch.get("badge", "Ao Vivo"),
        "accentColor": ch.get("accentColor", "#dc2626"),
        "isLive": True,
        "resolvedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    if ch.get("fallbackUrl"):
        item["fallbackUrl"] = ch["fallbackUrl"]

    return item


async def resolve_live_channels(force_refresh: bool = False) -> List[Dict[str, Any]]:
    """Resolve todos os canais concorrentemente com cache de 15 minutos."""
    now = time.time()
    if not force_refresh and _LIVE_CHANNELS_CACHE["data"] and (now - _LIVE_CHANNELS_CACHE["timestamp"] < LIVE_CACHE_TTL):
        return _LIVE_CHANNELS_CACHE["data"]

    async with httpx.AsyncClient(headers=HEADERS) as client:
        results = await asyncio.gather(*(resolve_single_channel(client, ch) for ch in LIVE_CHANNELS_CONFIG))

    _LIVE_CHANNELS_CACHE["timestamp"] = now
    _LIVE_CHANNELS_CACHE["data"] = list(results)
    return _LIVE_CHANNELS_CACHE["data"]


def resolve_live_channels_sync(force_refresh: bool = False) -> List[Dict[str, Any]]:
    """Versão síncrona para chamadas de scripts de deploy/export."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                return executor.submit(lambda: asyncio.run(resolve_live_channels(force_refresh))).result()
        return loop.run_until_complete(resolve_live_channels(force_refresh))
    except RuntimeError:
        return asyncio.run(resolve_live_channels(force_refresh))

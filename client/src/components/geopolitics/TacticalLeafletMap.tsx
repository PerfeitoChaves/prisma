import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { Hotspot } from "../../types/geopolitics";
import type { Story } from "../../data/news";
import {
  COUNTRIES_CAPITALS,
  MEDIA_STATIONS_LOCATIONS,
  MARITIME_CHOKEPOINTS,
  SUBMARINE_CABLES,
  NUCLEAR_FACILITIES,
  EXTREME_WEATHER_ALERTS,
  getCountryDetails,
  type CountryCapital,
  type MediaLocation,
} from "../../data/tacticalLayers";
import { fetchUSGSEarthquakes, type EarthquakeEvent } from "../../utils/earthquakeService";
import { TV_CHANNELS, RADIO_STATIONS, type LiveMediaItem } from "../../data/media";
import {
  Tv,
  AlertTriangle,
  Layers,
  Crosshair,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Flame,
  Wind,
  Anchor,
  Globe2,
  Shield,
  X,
  MousePointerClick,
} from "lucide-react";

interface TacticalLeafletMapProps {
  hotspots: Hotspot[];
  selectedHotspotId?: string;
  selectionTrigger?: number;
  storiesByHotspot?: Record<string, Story[]>;
  onSelectHotspot: (id: string) => void;
  onSelectMedia?: (media: LiveMediaItem) => void;
  onCompare?: (storyId?: string, outlet?: string) => void;
  onScrollToDossier?: () => void;
}

function escapeHtml(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const TacticalLeafletMap: React.FC<TacticalLeafletMapProps> = ({
  hotspots,
  selectedHotspotId,
  selectionTrigger = 0,
  storiesByHotspot = {},
  onSelectHotspot,
  onSelectMedia,
  onCompare,
  onScrollToDossier,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const lastHoveredLayerRef = useRef<L.Path | null>(null);

  // Refs estáveis para evitar recriar marcadores ou disparar flyTo indevido quando props mudam
  const onSelectHotspotRef = useRef(onSelectHotspot);
  const onCompareRef = useRef(onCompare);
  const onScrollToDossierRef = useRef(onScrollToDossier);
  const hotspotsRef = useRef(hotspots);
  const hotspotMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  useEffect(() => {
    onSelectHotspotRef.current = onSelectHotspot;
    onCompareRef.current = onCompare;
    onScrollToDossierRef.current = onScrollToDossier;
    hotspotsRef.current = hotspots;
  }, [onSelectHotspot, onCompare, onScrollToDossier, hotspots]);

  // Layer Groups
  const layerGroupsRef = useRef<{
    boundaries: L.LayerGroup;
    hotspots: L.LayerGroup;
    countries: L.LayerGroup;
    capitals: L.LayerGroup;
    media: L.LayerGroup;
    earthquakes: L.LayerGroup;
    chokepoints: L.LayerGroup;
    cables: L.LayerGroup;
    nuclear: L.LayerGroup;
    weather: L.LayerGroup;
  }>({
    boundaries: L.layerGroup(),
    hotspots: L.layerGroup(),
    countries: L.layerGroup(),
    capitals: L.layerGroup(),
    media: L.layerGroup(),
    earthquakes: L.layerGroup(),
    chokepoints: L.layerGroup(),
    cables: L.layerGroup(),
    nuclear: L.layerGroup(),
    weather: L.layerGroup(),
  });

  // Hover leve (pílula 1 linha) vs País fixado por clique (card expandido)
  const [hoveredCountry, setHoveredCountry] = useState<CountryCapital | null>(null);
  const [pinnedCountry, setPinnedCountry] = useState<CountryCapital | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  // Camadas limpas por padrão: foco total nos conflitos reais, chokepoints, terremotos e fronteiras
  const [activeLayers, setActiveLayers] = useState({
    hotspots: true,
    media: false,
    earthquakes: true,
    chokepoints: true,
    cables: false,
    nuclear: false,
    weather: false,
    countries: true,
  });

  const [layersMenuOpen, setLayersMenuOpen] = useState(false);
  const [scrollZoomEnabled, setScrollZoomEnabled] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(2);

  // Earthquakes state
  const [earthquakes, setEarthquakes] = useState<EarthquakeEvent[]>([]);
  const [criticalQuakes, setCriticalQuakes] = useState<EarthquakeEvent[]>([]);

  // Sintonizar mídia selecionada
  const handleTuneMedia = useCallback(
    (loc: MediaLocation) => {
      if (!onSelectMedia) return;
      const allStations = [...TV_CHANNELS, ...RADIO_STATIONS];
      const match = allStations.find((s) => s.id === loc.id) || {
        id: loc.id,
        name: loc.name,
        type: loc.type,
        category: loc.category,
        streamUrl: loc.streamUrl,
        embedType: loc.type === "tv" ? "youtube" : "audio",
        city: loc.city,
        description: loc.description,
        badge: loc.badge,
        accentColor: loc.accentColor,
        watchUrl: loc.watchUrl,
      };
      onSelectMedia(match as LiveMediaItem);
    },
    [onSelectMedia]
  );

  // Carrega feed de terremotos da USGS
  useEffect(() => {
    let mounted = true;
    async function loadQuakes() {
      const res = await fetchUSGSEarthquakes();
      if (mounted) {
        setCriticalQuakes(res.criticalLast5h);
        setEarthquakes(res.allRecent);
      }
    }
    loadQuakes();
    const interval = setInterval(loadQuakes, 5 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Inicializa mapa Leaflet com limites globais, ResizeObserver e scroll seguro
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    const initialZoom = window.innerWidth < 640 ? 2 : 2.5;
    const map = L.map(container, {
      center: [22, 18],
      zoom: initialZoom,
      minZoom: 2,
      maxZoom: 14,
      zoomSnap: 0.5,
      zoomControl: false,
      scrollWheelZoom: false, // Evita sequestrar rolagem vertical da página
      dragging: true,
      worldCopyJump: true,
      maxBounds: [
        [-85, -185],
        [85, 185],
      ],
      maxBoundsViscosity: 0.85,
      attributionControl: false,
    });

    // Tiles públicos do CARTO não exigem key. Nunca hardcode key aqui: o bundle vai pro GitHub Pages.
    const cartoKey = (
      (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_CARTO_API_KEY || ""
    ).trim();
    const tileUrl =
      `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` +
      (cartoKey ? `?key=${encodeURIComponent(cartoKey)}` : "");

    L.tileLayer(tileUrl, {
      subdomains: "abcd",
      maxZoom: 18,
      noWrap: false,
    }).addTo(map);

    Object.values(layerGroupsRef.current).forEach((group) => {
      group.addTo(map);
    });

    map.on("zoomend", () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;
    setCurrentZoom(initialZoom);

    // Garante recalcular tiles quando a aba fica visível ou a tela redimensiona
    const ro = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    ro.observe(container);
    const t = setTimeout(() => map.invalidateSize({ animate: false }), 150);

    return () => {
      clearTimeout(t);
      ro.disconnect();
      hotspotMarkersRef.current.clear();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Alterna scroll wheel zoom sob demanda
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (scrollZoomEnabled) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();
  }, [scrollZoomEnabled]);

  // Carrega polígonos de fronteiras GeoJSON sem travar CPU (sem mousemove nem drop-shadow)
  useEffect(() => {
    let mounted = true;

    async function loadBoundaries() {
      const candidateUrls: string[] = ["./data/countries.geojson"];
      try {
        const loc = window.location;
        const segments = loc.pathname.split("/").filter(Boolean);
        if (segments.length > 0) {
          candidateUrls.unshift(`${loc.origin}/${segments[0]}/data/countries.geojson`);
        }
        candidateUrls.push("/prisma/data/countries.geojson", "/data/countries.geojson");
      } catch {
        /* ignore */
      }

      let data: GeoJSON.GeoJsonObject | null = null;
      for (const url of Array.from(new Set(candidateUrls))) {
        try {
          const res = await fetch(url);
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch {
          /* tenta próximo */
        }
      }

      if (!data || !mounted) return;

      const group = layerGroupsRef.current.boundaries;
      group.clearLayers();

      const geojson = L.geoJSON(data, {
        style: () => ({
          stroke: true,
          color: "#334155",
          weight: 0.9,
          opacity: 0.55,
          fillColor: "#1e293b",
          fillOpacity: 0.08,
        }),
        onEachFeature: (feature, layer) => {
          const details = getCountryDetails(feature);

          layer.on({
            mouseover: (e) => {
              const target = e.target as L.Path;
              if (lastHoveredLayerRef.current && lastHoveredLayerRef.current !== target) {
                geoJsonLayerRef.current?.resetStyle(lastHoveredLayerRef.current);
              }
              target.setStyle({
                weight: 2,
                color: details.flagColor,
                opacity: 0.95,
                fillColor: details.flagColor,
                fillOpacity: 0.22,
              });
              lastHoveredLayerRef.current = target;
              setHoveredCountry(details);
            },
            mouseout: (e) => {
              const target = e.target as L.Path;
              geoJsonLayerRef.current?.resetStyle(target);
              if (lastHoveredLayerRef.current === target) {
                lastHoveredLayerRef.current = null;
              }
              setHoveredCountry((prev) => (prev?.code === details.code ? null : prev));
            },
            click: () => {
              // Apenas fixa o card tático sem dar zoom brusco/involuntário no mapa
              setPinnedCountry(details);
            },
          });
        },
      });

      geoJsonLayerRef.current = geojson;
      if (activeLayers.countries) {
        group.addLayer(geojson);
      }
    }

    loadBoundaries();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza visibilidade das fronteiras com activeLayers.countries
  useEffect(() => {
    const group = layerGroupsRef.current.boundaries;
    if (activeLayers.countries) {
      if (geoJsonLayerRef.current && !group.hasLayer(geoJsonLayerRef.current)) {
        group.addLayer(geoJsonLayerRef.current);
      }
    } else {
      group.clearLayers();
    }
  }, [activeLayers.countries]);

  // Atualiza Marcadores de Hotspots in-place (preserva popup aberto ao selecionar ou receber notícias do D1)
  useEffect(() => {
    const group = layerGroupsRef.current.hotspots;
    const markersMap = hotspotMarkersRef.current;

    if (!activeLayers.hotspots) {
      group.clearLayers();
      markersMap.clear();
      return;
    }

    const activeIds = new Set(hotspots.map((h) => h.id));
    for (const [id, marker] of markersMap.entries()) {
      if (!activeIds.has(id)) {
        group.removeLayer(marker);
        markersMap.delete(id);
      }
    }

    hotspots.forEach((h) => {
      const isSelected = h.id === selectedHotspotId;
      const sev = h.severity || h.tensionLevel || "moderado";
      const ringColor =
        sev === "critico" ? "#ef4444" : sev === "alto" ? "#f97316" : "#eab308";
      const matched = storiesByHotspot[h.id] || [];
      const liveCount = matched.length;
      const topStory = matched[0];

      const badgeHtml =
        liveCount > 0
          ? `<span class="absolute -top-1 -right-1 z-20 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-500 px-1 font-mono text-[9px] font-black text-slate-950 shadow">${liveCount}</span>`
          : "";

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 40px; height: 40px;">
          <div class="absolute inset-0 rounded-full animate-ping opacity-55" style="background-color: ${ringColor}; animation-duration: 2.2s;"></div>
          <div class="absolute inset-1 rounded-full border-2 ${isSelected ? "scale-115 shadow-[0_0_14px_rgba(34,211,238,0.8)]" : ""}" style="border-color: ${isSelected ? "#22d3ee" : ringColor}; background: rgba(15, 23, 42, 0.9);"></div>
          <div class="relative z-10 flex h-4.5 w-4.5 rounded-full items-center justify-center text-[10px] font-black font-mono text-white" style="background-color: ${ringColor};">
            !
          </div>
          ${badgeHtml}
          <div class="absolute -bottom-5 whitespace-nowrap rounded px-1.5 py-0.5 text-[9.5px] font-bold font-mono tracking-wider border shadow-lg pointer-events-none ${
            isSelected
              ? "bg-cyan-950 text-cyan-200 border-cyan-400"
              : "bg-slate-950/90 text-slate-200 border-slate-700/80"
          }">
            ${escapeHtml(h.title)}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-hotspot-pin",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const buildPopupEl = (markerRef: L.Marker) => {
        const popupEl = document.createElement("div");
        popupEl.className = "p-1 font-sans text-slate-100 min-w-[235px] max-w-[270px]";
        const sevLabel = sev === "critico" ? "CRÍTICO" : sev === "alto" ? "ALTO" : "MODERADO";
        const latestBlock = topStory
          ? `<div class="mb-2.5 rounded-lg border border-slate-800 bg-slate-900/90 p-2">
               <div class="font-mono text-[9px] font-bold uppercase text-cyan-400 mb-0.5">Última notícia no acervo · ${escapeHtml(topStory.time)}</div>
               <div class="text-[11px] font-semibold text-white leading-snug line-clamp-2">${escapeHtml(topStory.title)}</div>
             </div>`
          : "";

        popupEl.innerHTML = `
          <div class="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1.5 mb-2">
            <div>
              <div class="font-mono text-[9px] uppercase tracking-wider text-slate-400">${escapeHtml(h.region)}</div>
              <strong class="font-display text-sm text-white">${escapeHtml(h.title)}</strong>
            </div>
            <span class="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-black uppercase" style="background: ${ringColor}28; color: ${ringColor}; border: 1px solid ${ringColor}66;">
              ${sevLabel}
            </span>
          </div>
          <p class="text-[11px] text-slate-300 leading-snug mb-2 line-clamp-3">${escapeHtml(h.summary)}</p>
          ${latestBlock}
          <div class="flex items-center gap-1.5">
            <button type="button" data-action="dossier" class="flex-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono text-[10.5px] font-bold py-1.5 px-2 transition-colors cursor-pointer">
              Ver Dossiê ↓
            </button>
            ${
              topStory
                ? `<button type="button" data-action="compare" class="flex-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-[10.5px] font-black py-1.5 px-2 transition-colors cursor-pointer">
                     Comparar (${liveCount})
                   </button>`
                : ""
            }
          </div>
        `;

        const dossierBtn = popupEl.querySelector<HTMLButtonElement>('[data-action="dossier"]');
        if (dossierBtn) {
          dossierBtn.onclick = () => {
            markerRef.closePopup();
            onScrollToDossierRef.current?.();
          };
        }
        const compareBtn = popupEl.querySelector<HTMLButtonElement>('[data-action="compare"]');
        if (compareBtn && topStory) {
          compareBtn.onclick = () => {
            markerRef.closePopup();
            onCompareRef.current?.(topStory.id);
          };
        }
        return popupEl;
      };

      const existing = markersMap.get(h.id);
      if (existing) {
        existing.setIcon(customIcon);
        existing.setZIndexOffset(isSelected ? 1000 : 500);
        existing.setPopupContent(buildPopupEl(existing));
      } else {
        const marker = L.marker([h.coordinates.lat, h.coordinates.lng], {
          icon: customIcon,
          zIndexOffset: isSelected ? 1000 : 500,
        });
        marker.bindPopup(buildPopupEl(marker), {
          className: "custom-tactical-popup",
          closeButton: true,
          offset: [0, -14],
        });
        marker.on("click", () => {
          onSelectHotspotRef.current(h.id);
        });
        group.addLayer(marker);
        markersMap.set(h.id, marker);
      }
    });
  }, [hotspots, selectedHotspotId, activeLayers.hotspots, storiesByHotspot]);

  // Voa suavemente até o hotspot e abre seu popup SOMENTE quando o usuário seleciona explicitamente (selectionTrigger > 0)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedHotspotId || selectionTrigger === 0) return;
    const h = hotspotsRef.current.find((item) => item.id === selectedHotspotId);
    if (h && h.coordinates) {
      map.flyTo(
        [h.coordinates.lat, h.coordinates.lng],
        Math.max(map.getZoom(), 4.5),
        { duration: 0.85 }
      );
      const marker = hotspotMarkersRef.current.get(selectedHotspotId);
      if (marker && !marker.isPopupOpen()) {
        marker.openPopup();
      }
    }
  }, [selectedHotspotId, selectionTrigger]);

  // Atualiza Marcadores de TVs e Rádios (desligado por padrão para evitar poluição em SP/RJ)
  useEffect(() => {
    const group = layerGroupsRef.current.media;
    group.clearLayers();
    if (!activeLayers.media) return;

    MEDIA_STATIONS_LOCATIONS.forEach((loc) => {
      const isTv = loc.type === "tv";
      const badgeColor = isTv ? "#ef4444" : "#0284c7";

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 30px; height: 30px;">
          <div class="absolute inset-0.5 rounded-full border border-slate-600 bg-slate-950/90 shadow-md flex items-center justify-center text-xs">
            ${isTv ? "📺" : "📻"}
          </div>
          <span class="absolute -top-0.5 -right-0.5 flex h-2 w-2 rounded-full" style="background: ${badgeColor};"></span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-media-pin",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
      const popupContent = document.createElement("div");
      popupContent.className = "p-1 font-sans text-slate-100 min-w-[210px]";
      popupContent.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2">
          <div class="flex items-center gap-1.5">
            <span class="text-base">${isTv ? "📺" : "📻"}</span>
            <strong class="font-display text-sm text-white">${escapeHtml(loc.name)}</strong>
          </div>
          <span class="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase" style="background: ${loc.accentColor}33; color: ${loc.accentColor}; border: 1px solid ${loc.accentColor}66;">
            ${escapeHtml(loc.badge)}
          </span>
        </div>
        <div class="text-[11px] text-slate-300 mb-1"><strong>Sede:</strong> ${escapeHtml(loc.city)}</div>
        <div class="text-[11px] text-slate-300 mb-2"><strong>Frequência:</strong> <span class="font-mono text-cyan-300">${escapeHtml(loc.frequencyOrDial)}</span></div>
        <p class="text-[10.5px] text-slate-400 mb-3 leading-snug">${escapeHtml(loc.description)}</p>
        <button data-tune="1" class="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold py-1.5 px-3 transition-colors shadow cursor-pointer">
          <span>▶ Sintonizar no Mini-Player</span>
        </button>
      `;

      marker.bindPopup(popupContent, { className: "custom-tactical-popup", closeButton: true });
      marker.on("popupopen", () => {
        const btn = popupContent.querySelector<HTMLButtonElement>('[data-tune="1"]');
        if (btn) {
          btn.onclick = () => {
            handleTuneMedia(loc);
            marker.closePopup();
          };
        }
      });

      group.addLayer(marker);
    });
  }, [activeLayers.media, handleTuneMedia]);

  // Atualiza Marcadores de Terremotos (USGS Real-Time Feed)
  useEffect(() => {
    const group = layerGroupsRef.current.earthquakes;
    group.clearLayers();
    if (!activeLayers.earthquakes) return;

    earthquakes.slice(0, 15).forEach((eq) => {
      const isCrit = eq.isRecentCritical;
      const color = isCrit ? "#ef4444" : eq.mag >= 6.5 ? "#f97316" : "#eab308";
      const size = Math.max(28, Math.min(44, eq.mag * 5.5));

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer" style="width: ${size}px; height: ${size}px;">
          ${isCrit ? `<div class="absolute inset-0 rounded-full animate-ping opacity-65" style="background: ${color}; animation-duration: 1.8s;"></div>` : ""}
          <div class="absolute inset-1 rounded-full border border-dashed opacity-55" style="border-color: ${color}; background: ${color}1f;"></div>
          <div class="relative z-10 rounded-full flex items-center justify-center font-mono font-black text-white text-[9.5px] px-1 py-0.5 shadow border border-white/20" style="background: ${color};">
            M${eq.mag}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-quake-pin",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([eq.lat, eq.lng], { icon: customIcon });
      marker.bindPopup(
        `
        <div class="p-1 font-sans text-slate-100 min-w-[220px]">
          <div class="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2">
            <span class="font-mono text-xs font-black" style="color: ${color};">⚠️ TERREMOTO M ${eq.mag}</span>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded ${
              isCrit ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-slate-800 text-slate-300"
            }">
              ${isCrit ? "Últimas 5h" : "Recente"}
            </span>
          </div>
          <div class="font-bold text-xs text-white mb-1.5">${escapeHtml(eq.place)}</div>
          <div class="text-[11px] text-slate-300 space-y-0.5 font-mono mb-2">
            <div>Profundidade: <strong class="text-cyan-300">${eq.depthKm} km</strong></div>
            <div>Ocorrido: <strong class="text-slate-200">${escapeHtml(eq.timeAgo)}</strong></div>
            ${eq.tsunamiAlert ? '<div class="text-red-400 font-bold">ALERTA DE TSUNAMI EMITIDO</div>' : ""}
          </div>
          <a href="${escapeHtml(eq.url)}" target="_blank" rel="noopener noreferrer" class="block text-center rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10.5px] font-mono font-bold py-1 transition-colors">
            Ver Relatório Sísmico USGS ↗
          </a>
        </div>
      `,
        { className: "custom-tactical-popup" }
      );
      group.addLayer(marker);
    });
  }, [earthquakes, activeLayers.earthquakes]);

  // Bandeiras e Capitais somente em zoom mais próximo (>= 4) para não poluir a visão global
  useEffect(() => {
    const countriesGroup = layerGroupsRef.current.countries;
    const capitalsGroup = layerGroupsRef.current.capitals;
    countriesGroup.clearLayers();
    capitalsGroup.clearLayers();

    if (!activeLayers.countries) return;

    if (currentZoom >= 4 && currentZoom < 6) {
      COUNTRIES_CAPITALS.forEach((c) => {
        const iconHtml = `
          <div class="flex items-center gap-1 bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 rounded-full px-1.5 py-0.5 shadow cursor-pointer">
            <span class="text-xs leading-none">${c.flag}</span>
            <span class="text-[9.5px] font-mono font-bold text-slate-300 hidden sm:inline whitespace-nowrap">${escapeHtml(c.country)}</span>
          </div>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: "custom-country-pin",
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });
        const marker = L.marker([c.lat, c.lng], { icon });
        marker.on("click", () => setPinnedCountry(c));
        countriesGroup.addLayer(marker);
      });
    }

    if (currentZoom >= 5.5) {
      COUNTRIES_CAPITALS.forEach((c) => {
        const iconHtml = `
          <div class="flex items-center gap-1 bg-amber-950/85 border border-amber-500/60 rounded-full px-2 py-0.5 shadow cursor-pointer">
            <span class="text-amber-400 text-[10px]">★</span>
            <span class="text-[10px] font-mono font-bold text-amber-200 whitespace-nowrap">${escapeHtml(c.capital)}</span>
          </div>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: "custom-capital-pin",
          iconSize: [90, 20],
          iconAnchor: [45, 10],
        });
        const marker = L.marker([c.capitalLat, c.capitalLng], { icon });
        marker.on("click", () => setPinnedCountry(c));
        capitalsGroup.addLayer(marker);
      });
    }
  }, [currentZoom, activeLayers.countries]);

  // Chokepoints Marítimos
  useEffect(() => {
    const group = layerGroupsRef.current.chokepoints;
    group.clearLayers();
    if (!activeLayers.chokepoints) return;

    MARITIME_CHOKEPOINTS.forEach((chk) => {
      const iconHtml = `
        <div class="flex items-center justify-center rounded-lg bg-cyan-950/85 border border-cyan-400/60 p-1 text-cyan-300 shadow cursor-pointer hover:scale-110 transition-transform">
          <span class="text-[11px]">⚓</span>
        </div>
      `;
      const icon = L.divIcon({
        html: iconHtml,
        className: "custom-choke-pin",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const marker = L.marker([chk.lat, chk.lng], { icon });
      marker.bindPopup(
        `
        <div class="p-1 font-sans text-slate-100 min-w-[220px]">
          <div class="text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-0.5">CHOKEPOINT MARÍTIMO</div>
          <div class="font-display text-sm font-bold text-white mb-1">${escapeHtml(chk.name)}</div>
          <div class="text-[11px] text-slate-300 mb-1"><strong>Via:</strong> ${escapeHtml(chk.waterway)}</div>
          <div class="text-[11px] text-amber-300 mb-1"><strong>Fluxo:</strong> ${escapeHtml(chk.dailyOilTransit)}</div>
          <p class="text-[10px] text-slate-300 leading-relaxed mb-2">${escapeHtml(chk.importance)}</p>
          <div class="text-[9px] font-mono text-slate-400">Partes-Chave: ${escapeHtml(chk.keyParties.join(", "))}</div>
        </div>
      `,
        { className: "custom-tactical-popup" }
      );
      group.addLayer(marker);
    });
  }, [activeLayers.chokepoints]);

  // Cabos Submarinos
  useEffect(() => {
    const group = layerGroupsRef.current.cables;
    group.clearLayers();
    if (!activeLayers.cables) return;

    SUBMARINE_CABLES.forEach((cab) => {
      const line = L.polyline(cab.coordinates, {
        color: "#06b6d4",
        weight: 1.8,
        opacity: 0.65,
        dashArray: "6, 8",
      });
      line.bindPopup(
        `
        <div class="p-1 font-sans text-slate-100 min-w-[210px]">
          <div class="text-cyan-400 font-mono text-[10px] font-bold uppercase mb-0.5">CABO SUBMARINO DE FIBRA</div>
          <div class="font-display text-sm font-bold text-white mb-1">${escapeHtml(cab.name)}</div>
          <div class="text-[11px] text-slate-300 mb-1 font-mono">Extensão: <strong>${cab.lengthKm.toLocaleString("pt-BR")} km</strong></div>
          <div class="text-[10.5px] text-slate-300 mb-1.5">${escapeHtml(cab.connects)}</div>
          <p class="text-[10px] text-slate-400 leading-snug">${escapeHtml(cab.riskNote)}</p>
        </div>
      `,
        { className: "custom-tactical-popup" }
      );
      group.addLayer(line);
    });
  }, [activeLayers.cables]);

  // Instalações Nucleares
  useEffect(() => {
    const group = layerGroupsRef.current.nuclear;
    group.clearLayers();
    if (!activeLayers.nuclear) return;

    NUCLEAR_FACILITIES.forEach((nuc) => {
      const icon = L.divIcon({
        html: `<div class="flex items-center justify-center rounded-full bg-amber-950/90 border border-amber-400/80 p-0.5 text-xs shadow cursor-pointer">☢️</div>`,
        className: "custom-nuc-pin",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const marker = L.marker([nuc.lat, nuc.lng], { icon });
      marker.bindPopup(
        `
        <div class="p-1 font-sans text-slate-100 min-w-[210px]">
          <div class="text-amber-400 font-mono text-[10px] font-bold uppercase mb-0.5">INSTALAÇÃO NUCLEAR</div>
          <div class="font-display text-sm font-bold text-white mb-1">${escapeHtml(nuc.name)} ${nuc.flag}</div>
          <div class="text-[11px] text-slate-300 mb-1 font-mono">Status: <strong>${escapeHtml(nuc.status)}</strong></div>
          <div class="text-[11px] text-slate-300 mb-1 font-mono">Reatores: <strong>${nuc.reactors}</strong> (${nuc.capacityMWe || 0} MWe)</div>
          <p class="text-[10px] text-slate-400 leading-snug">${escapeHtml(nuc.riskNote)}</p>
        </div>
      `,
        { className: "custom-tactical-popup" }
      );
      group.addLayer(marker);
    });
  }, [activeLayers.nuclear]);

  // Clima Extremo (referência)
  useEffect(() => {
    const group = layerGroupsRef.current.weather;
    group.clearLayers();
    if (!activeLayers.weather) return;

    EXTREME_WEATHER_ALERTS.forEach((storm) => {
      const icon = L.divIcon({
        html: `<div class="flex items-center justify-center rounded-full bg-blue-950/90 border border-blue-400 p-1 text-xs text-blue-200">🌀</div>`,
        className: "custom-storm-pin",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const marker = L.marker([storm.lat, storm.lng], { icon });
      marker.bindPopup(
        `
        <div class="p-1 font-sans text-slate-100 min-w-[200px]">
          <div class="text-blue-400 font-mono text-[10px] font-bold uppercase mb-0.5">TEMPESTADE DE REFERÊNCIA</div>
          <div class="font-display text-sm font-bold text-white mb-1">${escapeHtml(storm.name)}</div>
          <div class="text-[11px] text-slate-300 mb-1 font-mono">Ventos: <strong class="text-cyan-300">${storm.windSpeedKmh} km/h (${escapeHtml(storm.category)})</strong></div>
          <p class="text-[10px] text-slate-400 leading-snug">${escapeHtml(storm.status)}</p>
        </div>
      `,
        { className: "custom-tactical-popup" }
      );
      group.addLayer(marker);
    });
  }, [activeLayers.weather]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    const baseZoom = window.innerWidth < 640 ? 2 : 2.5;
    mapInstanceRef.current?.flyTo([22, 18], baseZoom, { duration: 0.8 });
  };

  const handleCenterOnQuake = (quake: EarthquakeEvent) => {
    mapInstanceRef.current?.flyTo([quake.lat, quake.lng], 5.5, { duration: 1.0 });
  };

  const handleCenterOnCountry = (c: CountryCapital) => {
    if (!mapInstanceRef.current) return;
    const lat = c.capitalLat || c.lat;
    const lng = c.capitalLng || c.lng;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      mapInstanceRef.current.flyTo([lat, lng], 4.5, { duration: 0.9 });
    }
  };

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const topCriticalQuake = criticalQuakes[0];

  return (
    <div className="relative isolate z-0 w-full rounded-2xl border border-slate-800 bg-[#070b13] overflow-hidden shadow-2xl">
      {/* Barra Superior Sísmica + Camadas */}
      <div className="border-b border-slate-800/80 bg-slate-950/90 px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-20 relative">
        <div className="flex items-center gap-2.5">
          {topCriticalQuake ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="font-mono text-xs font-black uppercase text-red-400 tracking-wider">
                USGS CRÍTICO: M {topCriticalQuake.mag}
              </span>
              <span className="hidden md:inline text-xs text-slate-300 font-sans">
                — {topCriticalQuake.place} ({topCriticalQuake.timeAgo})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-xs font-bold text-slate-300">
                Sismicidade Normal (USGS)
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
                — {earthquakes.length} eventos recentes
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {topCriticalQuake && (
            <button
              type="button"
              onClick={() => handleCenterOnQuake(topCriticalQuake)}
              className="flex items-center gap-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/50 px-2.5 py-1 font-mono text-[11px] font-bold transition-all cursor-pointer"
            >
              <Crosshair className="h-3.5 w-3.5" />
              <span>Epicentro</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setScrollZoomEnabled((v) => !v)}
            className={`hidden sm:flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold transition-all cursor-pointer ${
              scrollZoomEnabled
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
            title="Habilitar ou travar zoom pela roda do mouse para não atrapalhar a rolagem da página"
          >
            <MousePointerClick className="h-3.5 w-3.5" />
            <span>{scrollZoomEnabled ? "Scroll: Zoom" : "Scroll: Página"}</span>
          </button>

          <button
            type="button"
            onClick={() => setLayersMenuOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold transition-all cursor-pointer ${
              layersMenuOpen
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Camadas ({Object.values(activeLayers).filter(Boolean).length}/8)</span>
          </button>
        </div>
      </div>

      {/* Área do Mapa Interativo */}
      <div className="relative w-full overflow-hidden">
        <div
          ref={mapContainerRef}
          className="w-full h-[460px] sm:h-[560px] lg:h-[620px] bg-[#090d16] outline-none"
        />

        {/* HUD Compacto de Inspeção Territorial (Canto Superior Esquerdo) */}
        <div className="absolute left-3 top-3 z-[1000] max-w-[290px] sm:max-w-[330px] pointer-events-auto">
          {pinnedCountry ? (
            <div
              className="rounded-xl border bg-slate-950/95 backdrop-blur-md p-3 shadow-2xl"
              style={{ borderColor: `${pinnedCountry.flagColor}66` }}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-lg leading-none">{pinnedCountry.flag}</span>
                  <h3 className="font-display text-sm font-bold text-white truncate">
                    {pinnedCountry.country}
                  </h3>
                  <span className="font-mono text-[9.5px] text-slate-400">({pinnedCountry.code})</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCenterOnCountry(pinnedCountry)}
                    className="text-cyan-400 hover:text-cyan-300 rounded p-1 text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-slate-900 cursor-pointer"
                    title="Aproximar país no mapa"
                  >
                    <Crosshair className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPinnedCountry(null)}
                    className="text-slate-400 hover:text-white rounded p-1 cursor-pointer"
                    title="Fechar inspeção"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10.5px] mb-2">
                <div className="rounded bg-slate-900/80 border border-slate-800/80 px-2 py-1">
                  <div className="text-[8.5px] font-mono text-slate-400 uppercase">Capital</div>
                  <div className="font-bold text-slate-100 truncate">{pinnedCountry.capital}</div>
                </div>
                <div className="rounded bg-slate-900/80 border border-slate-800/80 px-2 py-1">
                  <div className="text-[8.5px] font-mono text-slate-400 uppercase">População</div>
                  <div className="font-mono font-bold text-cyan-300">{pinnedCountry.population || "N/D"}</div>
                </div>
              </div>

              {pinnedCountry.alliance && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                  <Shield className="h-3 w-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{pinnedCountry.alliance}</span>
                </div>
              )}
            </div>
          ) : hoveredCountry ? (
            <div className="pointer-events-none flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-950/90 px-2.5 py-1.5 text-xs shadow-lg backdrop-blur-md">
              <span className="text-sm leading-none">{hoveredCountry.flag}</span>
              <span className="font-bold text-white">{hoveredCountry.country}</span>
              <span className="font-mono text-[10px] text-slate-400">· {hoveredCountry.capital}</span>
            </div>
          ) : (
            <div className="pointer-events-none flex items-center gap-2 rounded-lg border border-slate-800/90 bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 text-[10.5px] font-mono text-slate-300 shadow">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Toque em um conflito (!) para abrir notícias ao vivo</span>
            </div>
          )}
        </div>

        {/* Menu Flutuante de Camadas */}
        {layersMenuOpen && (
          <div className="absolute right-3 top-3 z-[1000] w-72 rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 font-mono text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <span>Camadas & Filtros Táticos</span>
              <button type="button" onClick={() => setLayersMenuOpen(false)} className="hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="flex items-center gap-2 text-slate-200">
                  <Flame className="h-4 w-4 text-red-400" /> Focos de Conflito (Hotspots)
                </span>
                <input type="checkbox" checked={activeLayers.hotspots} onChange={() => toggleLayer("hotspots")} className="rounded accent-cyan-500" />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="flex items-center gap-2 text-slate-200">
                  <Anchor className="h-4 w-4 text-emerald-400" /> Chokepoints Marítimos
                </span>
                <input type="checkbox" checked={activeLayers.chokepoints} onChange={() => toggleLayer("chokepoints")} className="rounded accent-cyan-500" />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="flex items-center gap-2 text-slate-200">
                  <AlertTriangle className="h-4 w-4 text-amber-400" /> Terremotos USGS (ao vivo)
                </span>
                <input type="checkbox" checked={activeLayers.earthquakes} onChange={() => toggleLayer("earthquakes")} className="rounded accent-cyan-500" />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="flex items-center gap-2 text-slate-200">
                  🌐 Fronteiras, Países & Capitais
                </span>
                <input type="checkbox" checked={activeLayers.countries} onChange={() => toggleLayer("countries")} className="rounded accent-cyan-500" />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="flex items-center gap-2 text-slate-200">
                  <Tv className="h-4 w-4 text-cyan-400" /> Sedes de TV & Rádio
                </span>
                <input type="checkbox" checked={activeLayers.media} onChange={() => toggleLayer("media")} className="rounded accent-cyan-500" />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="flex items-center gap-2 text-slate-200">
                  <Globe2 className="h-4 w-4 text-sky-400" /> Cabos Submarinos
                </span>
                <input type="checkbox" checked={activeLayers.cables} onChange={() => toggleLayer("cables")} className="rounded accent-cyan-500" />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="flex items-center gap-2 text-slate-200">
                  ☢️ Centrais Nucleares
                </span>
                <input type="checkbox" checked={activeLayers.nuclear} onChange={() => toggleLayer("nuclear")} className="rounded accent-cyan-500" />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
                <span className="flex items-center gap-2 text-slate-200">
                  <Wind className="h-4 w-4 text-blue-400" /> Zonas de Ciclones (ref.)
                </span>
                <input type="checkbox" checked={activeLayers.weather} onChange={() => toggleLayer("weather")} className="rounded accent-cyan-500" />
              </label>
            </div>
          </div>
        )}

        {/* Controles Flutuantes de Zoom e Reset */}
        <div className="absolute left-3 bottom-3 z-[1000] flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-lg cursor-pointer"
            aria-label="Aumentar Zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-lg cursor-pointer"
            aria-label="Diminuir Zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-lg cursor-pointer"
            aria-label="Visão Global"
            title="Resetar Visão Global"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Rodapé discreto */}
        <div className="absolute right-3 bottom-3 z-[1000] hidden sm:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-400 pointer-events-none">
          <span>Arraste para navegar</span>
          <span>•</span>
          <span>Use + / − ou ative Scroll</span>
          <span>•</span>
          <span className="text-cyan-400">CartoDB Dark Matter</span>
        </div>
      </div>
    </div>
  );
};

export default TacticalLeafletMap;

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { Hotspot } from "../../types/geopolitics";
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
} from "lucide-react";

interface TacticalLeafletMapProps {
  hotspots: Hotspot[];
  selectedHotspotId?: string;
  onSelectHotspot: (id: string) => void;
  onSelectMedia?: (media: LiveMediaItem) => void;
}

export const TacticalLeafletMap: React.FC<TacticalLeafletMapProps> = ({
  hotspots,
  selectedHotspotId,
  onSelectHotspot,
  onSelectMedia,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer Groups (com boundaries na camada base de vetores)
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

  // Estado de país inspecionado no HUD superior esquerdo
  const [hoveredCountry, setHoveredCountry] = useState<CountryCapital | null>(null);
  const [isHoveringCountry, setIsHoveringCountry] = useState(false);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  // Layer toggles
  const [activeLayers, setActiveLayers] = useState({
    hotspots: true,
    media: true,
    earthquakes: true,
    chokepoints: true,
    cables: true,
    nuclear: true,
    weather: true,
    countries: true,
  });

  const [layersMenuOpen, setLayersMenuOpen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(3);

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
    const interval = setInterval(loadQuakes, 5 * 60 * 1000); // atualiza a cada 5m
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Inicializa mapa Leaflet com CartoDB Dark Matter
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Evita re-inicialização duplicada

    const map = L.map(mapContainerRef.current, {
      center: [22, 18],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false, // Usamos controles táticos customizados
      scrollWheelZoom: true,
      dragging: true,
      attributionControl: false,
    });

    // CARTO Basemaps Key oficial (remove a marca d'água 'API KEY REQUIRED')
    const cartoKey = ((import.meta as any).env?.VITE_CARTO_API_KEY || "cb1_4oep_1_6476c53772ced180ddb8926a").trim();
    const tileUrl = `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoKey)}`;

    L.tileLayer(tileUrl, {
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Adiciona todos os grupos de camadas ao mapa
    Object.values(layerGroupsRef.current).forEach((group) => {
      group.addTo(map);
    });

    // Listener de zoom para adaptação de rótulos e capitais
    map.on("zoomend", () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Carrega e inicializa polígonos de fronteiras GeoJSON (Iluminação dinâmica ao passar o mouse)
  useEffect(() => {
    let mounted = true;

    async function loadBoundaries() {
      try {
        const res = await fetch("./data/countries.geojson");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;

        const group = layerGroupsRef.current.boundaries;
        group.clearLayers();

        const geojson = L.geoJSON(data, {
          style: () => ({
            stroke: true,
            color: "#334155",
            weight: 0.9,
            opacity: 0.45,
            fillColor: "#0f172a",
            fillOpacity: 0.04,
          }),
          onEachFeature: (feature, layer) => {
            const details = getCountryDetails(feature);

            layer.on({
              mouseover: (e) => {
                const target = e.target;
                target.setStyle({
                  weight: 3,
                  color: details.flagColor,
                  opacity: 1,
                  fillColor: details.flagColor,
                  fillOpacity: 0.22,
                });
                if (target._path) {
                  target._path.style.filter = `drop-shadow(0 0 7px ${details.flagColor})`;
                  target._path.style.transition = "all 0.15s ease-out";
                }
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                  target.bringToFront();
                }
                setHoveredCountry(details);
                setIsHoveringCountry(true);
              },
              mouseout: (e) => {
                const target = e.target;
                if (geoJsonLayerRef.current) {
                  geoJsonLayerRef.current.resetStyle(target);
                }
                if (target._path) {
                  target._path.style.filter = "none";
                }
                setIsHoveringCountry(false);
              },
              click: (e) => {
                setHoveredCountry(details);
                setIsHoveringCountry(true);
                const map = mapInstanceRef.current;
                if (map && e.target.getBounds) {
                  map.fitBounds(e.target.getBounds(), { padding: [50, 50], maxZoom: 6 });
                }
              },
            });
          },
        });

        geoJsonLayerRef.current = geojson;
        if (activeLayers.countries) {
          group.addLayer(geojson);
        }
      } catch (err) {
        console.warn("Aviso: Falha ao carregar boundaries GeoJSON", err);
      }
    }

    loadBoundaries();

    return () => {
      mounted = false;
    };
  }, []);

  // Sincroniza visibilidade da camada de boundaries com o toggle activeLayers.countries
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

  // Centraliza em hotspot selecionado se mudar externamente
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedHotspotId) return;
    const h = hotspots.find((item) => item.id === selectedHotspotId);
    if (h && h.coordinates) {
      mapInstanceRef.current.flyTo(
        [h.coordinates.lat, h.coordinates.lng],
        Math.max(mapInstanceRef.current.getZoom(), 4.5),
        { duration: 1.2 }
      );
    }
  }, [selectedHotspotId, hotspots]);

  // Atualiza Marcadores de Hotspots de Conflito
  useEffect(() => {
    const group = layerGroupsRef.current.hotspots;
    group.clearLayers();
    if (!activeLayers.hotspots) return;

    hotspots.forEach((h) => {
      const isSelected = h.id === selectedHotspotId;
      const sev = h.severity || h.tensionLevel || "moderado";
      const ringColor =
        sev === "critico"
          ? "#ef4444"
          : sev === "alto"
          ? "#f97316"
          : "#eab308";

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 38px; height: 38px;">
          <div class="absolute inset-0 rounded-full animate-ping opacity-60" style="background-color: ${ringColor}; animation-duration: 2s;"></div>
          <div class="absolute inset-1 rounded-full border-2 ${isSelected ? "border-cyan-400 scale-125" : "border-slate-300/80"}" style="border-color: ${ringColor}; background: rgba(15, 23, 42, 0.85);"></div>
          <div class="relative z-10 flex h-4 w-4 rounded-full items-center justify-center text-[9px] font-black font-mono text-white" style="background-color: ${ringColor};">
            !
          </div>
          <div class="absolute -bottom-5 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-bold font-mono tracking-wider text-slate-200 border border-slate-700/80 shadow-lg pointer-events-none ${
            isSelected ? "bg-cyan-950 text-cyan-300 border-cyan-500 scale-105" : "bg-slate-900/90"
          }">
            ${h.title}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-hotspot-pin",
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([h.coordinates.lat, h.coordinates.lng], {
        icon: customIcon,
      });

      marker.on("click", () => {
        onSelectHotspot(h.id);
      });

      group.addLayer(marker);
    });
  }, [hotspots, selectedHotspotId, activeLayers.hotspots, onSelectHotspot]);

  // Atualiza Marcadores de TVs e Rádios (PRISMA Live Stations)
  useEffect(() => {
    const group = layerGroupsRef.current.media;
    group.clearLayers();
    if (!activeLayers.media) return;

    MEDIA_STATIONS_LOCATIONS.forEach((loc) => {
      const isTv = loc.type === "tv";
      const badgeColor = isTv ? "#ef4444" : "#0284c7";

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
          <div class="absolute inset-0.5 rounded-full border border-slate-600 bg-slate-950/90 shadow-md flex items-center justify-center text-xs">
            ${isTv ? "📺" : "📻"}
          </div>
          <span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background: ${badgeColor};"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5" style="background: ${badgeColor};"></span>
          </span>
          <div class="absolute -bottom-4 hidden group-hover:block whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-bold font-mono bg-slate-900 text-slate-200 border border-slate-700 shadow-xl z-30">
            ${loc.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-media-pin",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });

      // Popup tático com botão de 1 toque para sintonizar
      const popupContent = document.createElement("div");
      popupContent.className = "p-1 font-sans text-slate-100 min-w-[210px]";
      popupContent.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2">
          <div class="flex items-center gap-1.5">
            <span class="text-base">${isTv ? "📺" : "📻"}</span>
            <strong class="font-display text-sm text-white">${loc.name}</strong>
          </div>
          <span class="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase" style="background: ${loc.accentColor}33; color: ${loc.accentColor}; border: 1px solid ${loc.accentColor}66;">
            ${loc.badge}
          </span>
        </div>
        <div class="text-[11px] text-slate-300 mb-1">
          <strong>Sede:</strong> ${loc.city}
        </div>
        <div class="text-[11px] text-slate-300 mb-2">
          <strong>Frequência:</strong> <span class="font-mono text-cyan-300">${loc.frequencyOrDial}</span>
        </div>
        <p class="text-[10.5px] text-slate-400 mb-3 leading-snug">${loc.description}</p>
        <button id="tune-btn-${loc.id}" class="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold py-1.5 px-3 transition-colors shadow">
          <span>▶ Sintonizar no Mini-Player</span>
        </button>
      `;

      marker.bindPopup(popupContent, {
        className: "custom-tactical-popup",
        closeButton: true,
      });

      marker.on("popupopen", () => {
        const btn = document.getElementById(`tune-btn-${loc.id}`);
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

    earthquakes.forEach((eq) => {
      const isCrit = eq.isRecentCritical;
      const color = isCrit ? "#ef4444" : eq.mag >= 6.5 ? "#f97316" : "#eab308";
      const size = Math.max(34, Math.min(60, eq.mag * 7));

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer" style="width: ${size}px; height: ${size}px;">
          ${
            isCrit
              ? `<div class="absolute inset-0 rounded-full animate-ping opacity-75" style="background: ${color}; animation-duration: 1.5s;"></div>`
              : ""
          }
          <div class="absolute inset-1 rounded-full border border-dashed opacity-60" style="border-color: ${color}; background: ${color}22;"></div>
          <div class="relative z-10 rounded-full flex items-center justify-center font-mono font-black text-white text-[10px] px-1 py-0.5 shadow-lg border border-white/20" style="background: ${color};">
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
            <span class="flex items-center gap-1 font-mono text-xs font-black" style="color: ${color};">
              ⚠️ TERREMOTO M ${eq.mag}
            </span>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded ${
              isCrit ? "bg-red-500/20 text-red-300 border border-red-500/40" : "bg-slate-800 text-slate-300"
            }">
              ${isCrit ? "Últimas 5h" : "Recente"}
            </span>
          </div>
          <div class="font-bold text-xs text-white mb-1.5">${eq.place}</div>
          <div class="text-[11px] text-slate-300 space-y-0.5 font-mono mb-2">
            <div>Profundidade: <strong class="text-cyan-300">${eq.depthKm} km</strong></div>
            <div>Ocorrido: <strong class="text-slate-200">${eq.timeAgo}</strong></div>
            ${eq.tsunamiAlert ? '<div class="text-red-400 font-bold">ALERTA DE TSUNAMI EMITIDO</div>' : ""}
          </div>
          <a href="${eq.url}" target="_blank" rel="noopener noreferrer" class="block text-center rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10.5px] font-mono font-bold py-1 transition-colors">
            Ver Relatório Sísmico USGS ↗
          </a>
        </div>
      `,
        { className: "custom-tactical-popup" }
      );

      group.addLayer(marker);
    });
  }, [earthquakes, activeLayers.earthquakes]);

  // Atualiza Marcadores de Países, Capitais e Bandeiras (Zoom Adaptativo)
  useEffect(() => {
    const countriesGroup = layerGroupsRef.current.countries;
    const capitalsGroup = layerGroupsRef.current.capitals;
    countriesGroup.clearLayers();
    capitalsGroup.clearLayers();

    if (!activeLayers.countries) return;

    // Em zoom amplo (< 5): mostra bandeiras dos países
    if (currentZoom < 6) {
      COUNTRIES_CAPITALS.forEach((c) => {
        const iconHtml = `
          <div class="flex items-center gap-1 bg-slate-950/80 hover:bg-slate-900 border border-slate-800/80 rounded-full px-1.5 py-0.5 shadow-md cursor-pointer transition-transform hover:scale-110">
            <span class="text-xs leading-none">${c.flag}</span>
            <span class="text-[9.5px] font-mono font-bold text-slate-300 hidden sm:inline whitespace-nowrap">${c.country}</span>
          </div>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: "custom-country-pin",
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });
        const marker = L.marker([c.lat, c.lng], { icon });
        marker.on("mouseover", () => {
          setHoveredCountry(c);
          setIsHoveringCountry(true);
        });
        marker.on("mouseout", () => {
          setIsHoveringCountry(false);
        });
        marker.on("click", () => {
          setHoveredCountry(c);
          setIsHoveringCountry(true);
        });

        marker.bindPopup(
          `
          <div class="p-1 font-sans text-slate-100 min-w-[180px]">
            <div class="flex items-center gap-2 border-b border-slate-800 pb-1 mb-1.5">
              <span class="text-xl">${c.flag}</span>
              <div>
                <strong class="text-sm font-display text-white">${c.country}</strong>
                <div class="text-[10px] text-slate-400 font-mono">${c.region}</div>
              </div>
            </div>
            <div class="text-xs space-y-0.5 font-mono text-slate-300">
              <div>Capital: <strong class="text-cyan-300">${c.capital}</strong></div>
              <div>População: <span class="text-slate-200">${c.population || "N/D"}</span></div>
            </div>
          </div>
        `,
          { className: "custom-tactical-popup" }
        );
        countriesGroup.addLayer(marker);
      });
    }

    // Em zoom aproximado (>= 5): revela Capitais com ícone de estrela dourada
    if (currentZoom >= 5) {
      COUNTRIES_CAPITALS.forEach((c) => {
        const iconHtml = `
          <div class="flex items-center gap-1 bg-amber-950/80 border border-amber-500/60 rounded-full px-2 py-0.5 shadow-lg cursor-pointer">
            <span class="text-amber-400 text-xs">⭐</span>
            <span class="text-[10px] font-mono font-bold text-amber-200 whitespace-nowrap">${c.capital}</span>
            <span class="text-[9px] text-amber-400/80 font-mono">(${c.flag})</span>
          </div>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: "custom-capital-pin",
          iconSize: [90, 20],
          iconAnchor: [45, 10],
        });
        const marker = L.marker([c.capitalLat, c.capitalLng], { icon });
        marker.on("mouseover", () => {
          setHoveredCountry(c);
          setIsHoveringCountry(true);
        });
        marker.on("mouseout", () => {
          setIsHoveringCountry(false);
        });
        marker.on("click", () => {
          setHoveredCountry(c);
          setIsHoveringCountry(true);
        });

        marker.bindPopup(
          `
          <div class="p-1 font-sans text-slate-100 min-w-[180px]">
            <div class="text-amber-400 font-mono text-xs font-bold mb-1">⭐ CAPITAL NACIONAL</div>
            <div class="text-sm font-display font-bold text-white">${c.capital}, ${c.country} ${c.flag}</div>
            <div class="text-[10.5px] font-mono text-slate-400 mt-1">Sede do governo e poder central.</div>
          </div>
        `,
          { className: "custom-tactical-popup" }
        );
        capitalsGroup.addLayer(marker);
      });
    }
  }, [currentZoom, activeLayers.countries]);

  // Atualiza Marcadores de Chokepoints Marítimos
  useEffect(() => {
    const group = layerGroupsRef.current.chokepoints;
    group.clearLayers();
    if (!activeLayers.chokepoints) return;

    MARITIME_CHOKEPOINTS.forEach((chk) => {
      const iconHtml = `
        <div class="flex items-center justify-center rounded-lg bg-cyan-950/90 border border-cyan-400/70 p-1 text-cyan-300 shadow-md cursor-pointer hover:scale-110 transition-transform">
          <span class="text-xs">⚓</span>
        </div>
      `;
      const icon = L.divIcon({
        html: iconHtml,
        className: "custom-choke-pin",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const marker = L.marker([chk.lat, chk.lng], { icon });
      marker.bindPopup(
        `
        <div class="p-1 font-sans text-slate-100 min-w-[220px]">
          <div class="text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-wider mb-0.5">CHOKEPOINT MARÍTIMO</div>
          <div class="font-display text-sm font-bold text-white mb-1">${chk.name}</div>
          <div class="text-[11px] text-slate-300 mb-1"><strong>Via:</strong> ${chk.waterway}</div>
          <div class="text-[11px] text-amber-300 mb-1"><strong>Fluxo:</strong> ${chk.dailyOilTransit}</div>
          <p class="text-[10px] text-slate-300 leading-relaxed mb-2">${chk.importance}</p>
          <div class="text-[9px] font-mono text-slate-400">Partes-Chave: ${chk.keyParties.join(", ")}</div>
        </div>
      `,
        { className: "custom-tactical-popup" }
      );
      group.addLayer(marker);
    });
  }, [activeLayers.chokepoints]);

  // Atualiza Cabos Submarinos de Internet
  useEffect(() => {
    const group = layerGroupsRef.current.cables;
    group.clearLayers();
    if (!activeLayers.cables) return;

    SUBMARINE_CABLES.forEach((cab) => {
      const line = L.polyline(cab.coordinates, {
        color: "#06b6d4",
        weight: 2,
        opacity: 0.75,
        dashArray: "6, 8",
      });
      line.bindPopup(
        `
        <div class="p-1 font-sans text-slate-100 min-w-[210px]">
          <div class="text-cyan-400 font-mono text-[10px] font-bold uppercase mb-0.5">CABO SUBMARINO DE FIBRA</div>
          <div class="font-display text-sm font-bold text-white mb-1">${cab.name}</div>
          <div class="text-[11px] text-slate-300 mb-1 font-mono">Extensão: <strong>${cab.lengthKm.toLocaleString()} km</strong></div>
          <div class="text-[10.5px] text-slate-300 mb-1.5">${cab.connects}</div>
          <p class="text-[10px] text-slate-400 leading-snug">${cab.riskNote}</p>
        </div>
      `,
        { className: "custom-tactical-popup" }
      );
      group.addLayer(line);
    });
  }, [activeLayers.cables]);

  // Atualiza Instalações Nucleares
  useEffect(() => {
    const group = layerGroupsRef.current.nuclear;
    group.clearLayers();
    if (!activeLayers.nuclear) return;

    NUCLEAR_FACILITIES.forEach((nuc) => {
      const iconHtml = `
        <div class="flex items-center justify-center rounded-full bg-amber-950/90 border border-amber-400/80 p-0.5 text-xs text-amber-300 shadow cursor-pointer hover:scale-110">
          ☢️
        </div>
      `;
      const icon = L.divIcon({
        html: iconHtml,
        className: "custom-nuc-pin",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const marker = L.marker([nuc.lat, nuc.lng], { icon });
      marker.bindPopup(
        `
        <div class="p-1 font-sans text-slate-100 min-w-[210px]">
          <div class="text-amber-400 font-mono text-[10px] font-bold uppercase mb-0.5">INSTALAÇÃO NUCLEAR</div>
          <div class="font-display text-sm font-bold text-white mb-1">${nuc.name} ${nuc.flag}</div>
          <div class="text-[11px] text-slate-300 mb-1 font-mono">Status: <strong>${nuc.status}</strong></div>
          <div class="text-[11px] text-slate-300 mb-1 font-mono">Reatores: <strong>${nuc.reactors}</strong> (${nuc.capacityMWe || 0} MWe)</div>
          <p class="text-[10px] text-slate-400 leading-snug">${nuc.riskNote}</p>
        </div>
      `,
        { className: "custom-tactical-popup" }
      );
      group.addLayer(marker);
    });
  }, [activeLayers.nuclear]);

  // Atualiza Clima Extremo
  useEffect(() => {
    const group = layerGroupsRef.current.weather;
    group.clearLayers();
    if (!activeLayers.weather) return;

    EXTREME_WEATHER_ALERTS.forEach((storm) => {
      const iconHtml = `
        <div class="flex items-center justify-center rounded-full bg-blue-950/90 border border-blue-400 p-1 text-xs text-blue-200 animate-spin" style="animation-duration: 8s;">
          🌀
        </div>
      `;
      const icon = L.divIcon({
        html: iconHtml,
        className: "custom-storm-pin",
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      const marker = L.marker([storm.lat, storm.lng], { icon });
      marker.bindPopup(
        `
        <div class="p-1 font-sans text-slate-100 min-w-[200px]">
          <div class="text-blue-400 font-mono text-[10px] font-bold uppercase mb-0.5">TEMPESTADE EXTREMA</div>
          <div class="font-display text-sm font-bold text-white mb-1">${storm.name}</div>
          <div class="text-[11px] text-slate-300 mb-1 font-mono">Ventos: <strong class="text-cyan-300">${storm.windSpeedKmh} km/h (${storm.category})</strong></div>
          <p class="text-[10px] text-slate-400 leading-snug">${storm.status}</p>
        </div>
      `,
        { className: "custom-tactical-popup" }
      );
      group.addLayer(marker);
    });
  }, [activeLayers.weather]);

  // Ações de Zoom e Reset
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };
  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };
  const handleResetView = () => {
    mapInstanceRef.current?.flyTo([22, 18], 3, { duration: 1.0 });
  };

  const handleCenterOnQuake = (quake: EarthquakeEvent) => {
    mapInstanceRef.current?.flyTo([quake.lat, quake.lng], 6, {
      duration: 1.5,
    });
  };

  const handleCenterOnCountry = (c: CountryCapital) => {
    if (!mapInstanceRef.current) return;
    if (c.capitalLat && c.capitalLng) {
      mapInstanceRef.current.flyTo([c.capitalLat, c.capitalLng], 5, { duration: 1.2 });
    } else if (c.lat && c.lng) {
      mapInstanceRef.current.flyTo([c.lat, c.lng], 4.5, { duration: 1.2 });
    }
  };

  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const topCriticalQuake = criticalQuakes[0];

  return (
    <div className="relative w-full rounded-2xl border border-slate-800 bg-[#070b13] overflow-hidden shadow-2xl">
      {/* Banner de Alerta Sísmico de Emergência (USGS >= 6.0 nas últimas 5h) */}
      <div className="border-b border-slate-800/80 bg-slate-950/90 px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-20 relative">
        <div className="flex items-center gap-2.5">
          {topCriticalQuake ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="font-mono text-xs font-black uppercase text-red-400 tracking-wider">
                ALERTA SÍSMICO USGS CRÍTICO: M {topCriticalQuake.mag}
              </span>
              <span className="hidden md:inline text-xs text-slate-300 font-sans">
                — {topCriticalQuake.place} ({topCriticalQuake.timeAgo})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="font-mono text-xs font-bold text-slate-300">
                Sismicidade Normal (0 sismos ≥ 6.0 nas últimas 5h)
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">
                — {earthquakes.length} eventos globais monitorados
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {topCriticalQuake && (
            <button
              onClick={() => handleCenterOnQuake(topCriticalQuake)}
              className="flex items-center gap-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/50 px-2.5 py-1 font-mono text-[11px] font-bold transition-all shadow-sm"
            >
              <Crosshair className="h-3.5 w-3.5" />
              <span>Centralizar no Epicentro</span>
            </button>
          )}

          {/* Botão de Menu de Camadas Táticas */}
          <button
            onClick={() => setLayersMenuOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold transition-all ${
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

      {/* HUD Widget Tático de Inspeção Territorial (Canto Superior Esquerdo) */}
      <div className="absolute left-3 top-13 sm:top-14 z-20 max-w-[310px] sm:max-w-[360px] pointer-events-auto transition-all duration-300">
        {hoveredCountry ? (
          <div
            className="rounded-2xl border bg-slate-950/95 backdrop-blur-md p-3 sm:p-3.5 shadow-2xl transition-all duration-200"
            style={{
              borderColor: `${hoveredCountry.flagColor}55`,
              boxShadow: `0 8px 30px rgba(0,0,0,0.65), 0 0 16px ${hoveredCountry.flagColor}33`,
            }}
          >
            {/* Barra de Status Tático Superior */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full inline-block animate-pulse"
                  style={{
                    backgroundColor: hoveredCountry.flagColor,
                    boxShadow: `0 0 8px ${hoveredCountry.flagColor}`,
                  }}
                />
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-300">
                  {isHoveringCountry ? "Monitoramento Ao Vivo" : "Território em Foco"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCenterOnCountry(hoveredCountry)}
                  className="text-cyan-400 hover:text-cyan-300 rounded p-1 text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-slate-900 transition-colors"
                  title="Aproximar país no mapa"
                >
                  <Crosshair className="h-3 w-3" />
                  <span className="hidden sm:inline">Focar</span>
                </button>
                <button
                  onClick={() => {
                    setHoveredCountry(null);
                    setIsHoveringCountry(false);
                  }}
                  className="text-slate-400 hover:text-white transition-colors rounded p-1 leading-none"
                  title="Fechar inspeção"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Cabeçalho da Nação: Bandeira, Nome e Badges */}
            <div className="flex items-center gap-2.5 mb-2.5">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl border"
                style={{
                  borderColor: `${hoveredCountry.flagColor}66`,
                  backgroundColor: `${hoveredCountry.flagColor}18`,
                  boxShadow: `0 0 12px ${hoveredCountry.flagColor}25`,
                }}
              >
                {hoveredCountry.flag}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-display text-sm sm:text-base font-bold text-white truncate">
                    {hoveredCountry.country}
                  </h3>
                  <span
                    className="font-mono text-[9.5px] px-1.5 py-0.2 rounded font-black border"
                    style={{
                      color: hoveredCountry.flagColor,
                      borderColor: `${hoveredCountry.flagColor}50`,
                      backgroundColor: `${hoveredCountry.flagColor}15`,
                    }}
                  >
                    {hoveredCountry.code}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {hoveredCountry.bloc === "ocidente" && (
                    <span className="rounded bg-blue-500/15 border border-blue-500/40 text-blue-300 text-[9.5px] font-mono font-bold px-1.5 py-0.2">
                      Bloco Ocidental
                    </span>
                  )}
                  {hoveredCountry.bloc === "eurasia" && (
                    <span className="rounded bg-red-500/15 border border-red-500/40 text-red-300 text-[9.5px] font-mono font-bold px-1.5 py-0.2">
                      Bloco Eurasiático
                    </span>
                  )}
                  {hoveredCountry.bloc === "sul_global" && (
                    <span className="rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[9.5px] font-mono font-bold px-1.5 py-0.2">
                      Sul Global & Neutros
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Grade de Parâmetros Geopolíticos Básicos */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-2">
              <div className="rounded-lg bg-slate-900/80 border border-slate-800/80 p-1.5">
                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Capital</div>
                <div className="font-bold text-slate-100 truncate">{hoveredCountry.capital}</div>
              </div>
              <div className="rounded-lg bg-slate-900/80 border border-slate-800/80 p-1.5">
                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Região</div>
                <div className="font-bold text-slate-100 truncate">{hoveredCountry.region}</div>
              </div>
              <div className="rounded-lg bg-slate-900/80 border border-slate-800/80 p-1.5">
                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">População</div>
                <div className="font-mono font-bold text-cyan-300">{hoveredCountry.population || "N/D"}</div>
              </div>
              <div className="rounded-lg bg-slate-900/80 border border-slate-800/80 p-1.5">
                <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">PIB Estimado</div>
                <div className="font-mono font-bold text-emerald-300">{hoveredCountry.gdp || "N/D"}</div>
              </div>
            </div>

            {/* Aliança Estratégica */}
            {hoveredCountry.alliance && (
              <div className="rounded-lg bg-slate-900/90 border border-slate-800/90 px-2 py-1.5 mb-2">
                <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-0.5">
                  <Shield className="h-3 w-3 text-cyan-400" /> Alianças / Tratados
                </div>
                <div className="text-[10.5px] font-semibold text-slate-200">
                  {hoveredCountry.alliance}
                </div>
              </div>
            )}

            {/* Indicador de Fronteira Iluminada */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5 text-[9.5px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span
                  className="h-2 w-2 rounded-full inline-block"
                  style={{ backgroundColor: hoveredCountry.flagColor, boxShadow: `0 0 6px ${hoveredCountry.flagColor}` }}
                />
                <span>Fronteira Iluminada:</span>
              </div>
              <span className="font-bold text-slate-300 uppercase">{hoveredCountry.flagColor}</span>
            </div>
          </div>
        ) : (
          /* Standby Radar HUD */
          <div className="flex items-center gap-2 rounded-xl border border-slate-800/90 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 text-xs shadow-lg transition-all">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <div className="text-[10.5px] font-mono text-slate-300">
              <strong className="text-cyan-400">Radar Geopolítico:</strong>{" "}
              <span className="text-slate-400 hidden sm:inline">Passe o cursor sobre os países para iluminar fronteiras</span>
              <span className="text-slate-400 sm:hidden">Toque em um país para inspecionar</span>
            </div>
          </div>
        )}
      </div>

      {/* Popover / Menu Flutuante de Seleção de Camadas */}
      {layersMenuOpen && (
        <div className="absolute right-3 top-14 z-30 w-72 rounded-xl border border-slate-700 bg-slate-900/95 p-3 text-xs shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 font-mono text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <span>Camadas & Filtros Táticos</span>
            <button
              onClick={() => setLayersMenuOpen(false)}
              className="hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5 font-sans">
            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-200">
                <Flame className="h-4 w-4 text-red-400" /> Focos de Conflito (Hotspots)
              </span>
              <input
                type="checkbox"
                checked={activeLayers.hotspots}
                onChange={() => toggleLayer("hotspots")}
                className="rounded accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-200">
                <Tv className="h-4 w-4 text-cyan-400" /> Sedes de TV & Rádio (PRISMA)
              </span>
              <input
                type="checkbox"
                checked={activeLayers.media}
                onChange={() => toggleLayer("media")}
                className="rounded accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-200">
                <AlertTriangle className="h-4 w-4 text-amber-400" /> Terremotos USGS (≥6.0 e Recentes)
              </span>
              <input
                type="checkbox"
                checked={activeLayers.earthquakes}
                onChange={() => toggleLayer("earthquakes")}
                className="rounded accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-200">
                <Anchor className="h-4 w-4 text-emerald-400" /> Chokepoints e Rotas Marítimas
              </span>
              <input
                type="checkbox"
                checked={activeLayers.chokepoints}
                onChange={() => toggleLayer("chokepoints")}
                className="rounded accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-200">
                <Globe2 className="h-4 w-4 text-sky-400" /> Cabos Submarinos de Internet
              </span>
              <input
                type="checkbox"
                checked={activeLayers.cables}
                onChange={() => toggleLayer("cables")}
                className="rounded accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-200">
                ☢️ Centrais Nucleares Estratégicas
              </span>
              <input
                type="checkbox"
                checked={activeLayers.nuclear}
                onChange={() => toggleLayer("nuclear")}
                className="rounded accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-200">
                <Wind className="h-4 w-4 text-blue-400" /> Alertas de Tempestades / Ciclones
              </span>
              <input
                type="checkbox"
                checked={activeLayers.weather}
                onChange={() => toggleLayer("weather")}
                className="rounded accent-cyan-500"
              />
            </label>

            <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800/80 cursor-pointer">
              <span className="flex items-center gap-2 text-slate-200">
                🇧🇷 Bandeiras, Países & Capitais
              </span>
              <input
                type="checkbox"
                checked={activeLayers.countries}
                onChange={() => toggleLayer("countries")}
                className="rounded accent-cyan-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* Container do Mapa Leaflet com altura ajustada */}
      <div
        ref={mapContainerRef}
        className="w-full h-[520px] sm:h-[620px] lg:h-[680px] bg-[#090d16] outline-none"
        style={{ zIndex: 10 }}
      />

      {/* Controles Flutuantes Táteis de Zoom e Reset */}
      <div className="absolute left-3 bottom-3 z-20 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-lg"
          aria-label="Aumentar Zoom"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-lg"
          aria-label="Diminuir Zoom"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleResetView}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-all shadow-lg"
          aria-label="Visão Global"
          title="Resetar Visão Global"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Dica de Navegação e Rodapé Tático */}
      <div className="absolute right-3 bottom-3 z-20 hidden sm:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-400 pointer-events-none">
        <span>Scroll do mouse: Zoom</span>
        <span>•</span>
        <span>Botão esquerdo: Arrastar</span>
        <span>•</span>
        <span className="text-cyan-400">CartoDB Dark Matter / OSM</span>
      </div>
    </div>
  );
};

export default TacticalLeafletMap;

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import type { Story } from "../../data/news";
import { HOTSPOTS, getHotspot, normalizeHotspotId } from "../../data/geopolitics";
import { HOTSPOT_RULES, matchStoriesForHotspot } from "../../utils/hotspotMatcher";
import { mapApiStoryToStory, type ApiStory } from "../../utils/storyMapper";
import TacticalWorldMap from "./TacticalWorldMap";
import TacticalLeafletMap from "./TacticalLeafletMap";
import HotspotsFeed from "./HotspotsFeed";
import HotspotIntelligencePanel from "./HotspotIntelligencePanel";
import NarrativeMatrix from "./NarrativeMatrix";
import type { LiveMediaItem } from "../../data/media";
import {
  Globe,
  LayoutGrid,
  ShieldAlert,
  Flame,
  Radio,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";

interface TensionsViewProps {
  stories: Story[];
  selectedHotspotId?: string;
  onSelectHotspot: (id: string) => void;
  onCompare: (storyId?: string, outlet?: string) => void;
  onRead: (storyId: string) => void;
  onSelectMedia?: (media: LiveMediaItem) => void;
  onAddStories?: (newStories: Story[]) => void;
  className?: string;
}

export const TensionsView: React.FC<TensionsViewProps> = ({
  stories,
  selectedHotspotId = "ormuz",
  onSelectHotspot,
  onCompare,
  onRead,
  onSelectMedia,
  onAddStories,
  className = "",
}) => {
  // Mobile / Desktop View Mode: 'mapa' (Leaflet) vs 'svg' (SVG esquemático) vs 'feed' (Cards)
  const [viewMode, setViewMode] = useState<"mapa" | "svg" | "feed">("mapa");

  // Expandable Narrative Matrix toggle
  const [matrixExpanded, setMatrixExpanded] = useState<boolean>(true);

  // Incrementado apenas quando o usuário escolhe explicitamente um foco (evita zoom brusco na abertura)
  const [selectionTrigger, setSelectionTrigger] = useState<number>(0);

  // Acervo extra de guerra/mundo e busca sob demanda no D1
  const [geoStories, setGeoStories] = useState<Story[]>([]);
  const [geoFeedsLoaded, setGeoFeedsLoaded] = useState<boolean>(false);
  const [loadingHotspotStories, setLoadingHotspotStories] = useState<boolean>(false);
  const searchedHotspotsRef = useRef<Set<string>>(new Set());

  const mergeIncoming = useCallback(
    (incoming: Story[]) => {
      if (incoming.length === 0) return;
      setGeoStories((prev) => {
        const ids = new Set(prev.map((s) => s.id));
        const fresh = incoming.filter((s) => !ids.has(s.id));
        return fresh.length > 0 ? [...prev, ...fresh] : prev;
      });
      onAddStories?.(incoming);
    },
    [onAddStories]
  );

  // Ao abrir Tensões, puxa matérias reais de 'guerra' e 'mundo' do D1 (custo zero)
  useEffect(() => {
    let active = true;
    async function loadGeoFeeds() {
      try {
        const [warRes, worldRes] = await Promise.allSettled([
          fetch("./api/stories?category=guerra&limit=40"),
          fetch("./api/stories?category=mundo&limit=40"),
        ]);
        const collected: Story[] = [];
        for (const res of [warRes, worldRes]) {
          if (res.status === "fulfilled" && res.value.ok) {
            const data = await res.value.json();
            if (Array.isArray(data?.stories)) {
              collected.push(...data.stories.map((s: ApiStory) => mapApiStoryToStory(s)));
            }
          }
        }
        if (active && collected.length > 0) {
          mergeIncoming(collected);
        }
      } catch {
        /* ambiente estático */
      } finally {
        if (active) setGeoFeedsLoaded(true);
      }
    }
    loadGeoFeeds();
    return () => {
      active = false;
    };
  }, [mergeIncoming]);

  // Pool combinado (capa + guerra/mundo + buscas D1), sem duplicatas
  const allStoriesPool = useMemo(() => {
    const map = new Map<string, Story>();
    for (const s of stories) map.set(s.id, s);
    for (const s of geoStories) if (!map.has(s.id)) map.set(s.id, s);
    return Array.from(map.values());
  }, [stories, geoStories]);

  // Normalized active hotspot
  const activeHotspotId = useMemo(() => {
    const norm = normalizeHotspotId(selectedHotspotId);
    const found = getHotspot(norm);
    return found ? found.id : "ormuz";
  }, [selectedHotspotId]);

  const activeHotspot = useMemo(() => {
    return getHotspot(activeHotspotId) || HOTSPOTS[0];
  }, [activeHotspotId]);

  // Correlação real de matérias para todos os 8 hotspots
  const storiesByHotspot = useMemo(() => {
    const out: Record<string, Story[]> = {};
    for (const h of HOTSPOTS) {
      const related = [...(h.relatedStoryIds || []), ...(h.correlatedStoryIds || [])];
      out[h.id] = matchStoriesForHotspot(h.id, allStoriesPool, related);
    }
    return out;
  }, [allStoriesPool]);

  const storiesByHotspotRef = useRef(storiesByHotspot);
  storiesByHotspotRef.current = storiesByHotspot;

  // Após carregar guerra/mundo, se o foco ativo ainda tiver < 3 matérias, busca no D1 (1x por foco)
  useEffect(() => {
    if (!geoFeedsLoaded) return;
    const rule = HOTSPOT_RULES[activeHotspotId];
    if (!rule || searchedHotspotsRef.current.has(activeHotspotId)) {
      setLoadingHotspotStories(false);
      return;
    }
    if ((storiesByHotspotRef.current[activeHotspotId]?.length ?? 0) >= 3) {
      setLoadingHotspotStories(false);
      return;
    }

    searchedHotspotsRef.current.add(activeHotspotId);
    let active = true;
    setLoadingHotspotStories(true);

    fetch(`./api/search?q=${encodeURIComponent(rule.searchQuery)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !Array.isArray(data?.stories)) return;
        const mapped = data.stories.map((s: ApiStory) => mapApiStoryToStory(s));
        mergeIncoming(mapped);
      })
      .catch(() => {
        /* offline */
      })
      .finally(() => {
        if (active) setLoadingHotspotStories(false);
      });

    return () => {
      active = false;
      setLoadingHotspotStories(false);
    };
  }, [activeHotspotId, geoFeedsLoaded, mergeIncoming]);

  const handleSelectHotspotInteractive = useCallback(
    (id: string) => {
      onSelectHotspot(id);
      setSelectionTrigger((n) => n + 1);
    },
    [onSelectHotspot]
  );

  const handleScrollToDossier = useCallback(() => {
    document.getElementById("hotspot-dossier")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Garante que qualquer clique em "Comparar" abra uma pauta REAL existente no acervo (nunca um slug legado quebrado)
  const handleSafeCompare = useCallback(
    (storyId?: string, outlet?: string) => {
      const exists = storyId && allStoriesPool.some((s) => s.id === storyId);
      if (exists) {
        onCompare(storyId, outlet);
        return;
      }
      const fallbackReal = storiesByHotspot[activeHotspotId]?.[0]?.id ?? allStoriesPool[0]?.id;
      onCompare(fallbackReal, outlet);
    },
    [allStoriesPool, storiesByHotspot, activeHotspotId, onCompare]
  );

  const activeCorrelated = storiesByHotspot[activeHotspotId] || [];
  const hotspotsWithLiveCounts = useMemo(
    () =>
      HOTSPOTS.map((h) => ({
        ...h,
        newsCount: storiesByHotspot[h.id]?.length ?? 0,
        articleCount: storiesByHotspot[h.id]?.length ?? 0,
      })),
    [storiesByHotspot]
  );

  return (
    <div className={`mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 pb-28 md:pb-12 ${className}`}>
      {/* Geopolitical Operations Banner */}
      <section className="mb-5 sm:mb-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0c1322] via-[#090d17] to-[#06080e] p-4 sm:p-6 text-slate-100 shadow-2xl relative overflow-hidden">
        {/* Subtle background radar circles */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-cyan-500/10 pointer-events-none" />
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border border-cyan-500/15 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">
                SALA DE OPERAÇÕES GEOPOLÍTICAS // PRISMA GLOBAL
              </span>
            </div>

            <h1 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
              Mapa de Tensões Globais & Focos de Crise
            </h1>

            <p className="mt-1.5 max-w-3xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Monitoramento tático em tempo real dos 8 principais pontos de atrito geopolítico do planeta,
              cruzando o enquadramento de 101 veículos de imprensa e pesquisa classificados em três blocos estratégicos:
              <strong className="text-blue-300"> Bloco Ocidental</strong>,
              <strong className="text-red-300"> Bloco Eurasiático</strong> e
              <strong className="text-amber-300"> Sul Global & Neutros</strong>.
            </p>
          </div>

          {/* Operational Metrics Badges */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Focos Mapeados</div>
                <div className="font-bold text-slate-100">8 Hotspots</div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
              <Radio className="h-4 w-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Fontes Ativas</div>
                <div className="font-bold text-slate-100">101 Veículos</div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
              <ShieldAlert className="h-4 w-4 text-red-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Status Crítico</div>
                <div className="font-bold text-red-400">4 Zonas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Hotspot Jump Bar (1-touch pills) */}
        <div className="mt-4 sm:mt-5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-thin">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 whitespace-nowrap">
            Focos Rápidos:
          </span>
          {HOTSPOTS.map((h) => {
            const isSelected = h.id === activeHotspotId;
            const sev = h.severity || h.tensionLevel || "moderado";
            const dotColor =
              sev === "critico"
                ? "bg-red-400"
                : sev === "alto"
                ? "bg-orange-400"
                : "bg-yellow-400";

            const liveCount = storiesByHotspot[h.id]?.length ?? 0;

            return (
              <button
                key={h.id}
                onClick={() => handleSelectHotspotInteractive(h.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : "bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                <span>{h.title}</span>
                {liveCount > 0 && (
                  <span className="rounded bg-slate-800/90 px-1 text-[9.5px] font-bold text-cyan-300">
                    {liveCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main View Mode Switcher (Segmented Button for Mobile & Desktop) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl border border-slate-800 bg-slate-950/80 p-1 font-mono text-xs shadow-inner">
          <button
            onClick={() => setViewMode("mapa")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition-all ${
              viewMode === "mapa"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Mapa Tático (Leaflet)</span>
          </button>

          <button
            onClick={() => setViewMode("svg")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition-all ${
              viewMode === "svg"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Mapa Vetorial SVG</span>
          </button>

          <button
            onClick={() => setViewMode("feed")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition-all ${
              viewMode === "feed"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Feed de Focos de Crise</span>
          </button>
        </div>

        {/* Active Hotspot Headline Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>Foco ativo:</span>
          <span className="font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {activeHotspot.title}
          </span>
        </div>
      </div>

      {/* Conditional View: Mapa Leaflet vs SVG vs Feed */}
      {viewMode === "mapa" ? (
        <div className="flex flex-col gap-6">
          {/* Tactical Leaflet Map otimizado: sem lag no hover, popups de notícias reais e scroll seguro */}
          <TacticalLeafletMap
            hotspots={hotspotsWithLiveCounts}
            selectedHotspotId={activeHotspotId}
            selectionTrigger={selectionTrigger}
            storiesByHotspot={storiesByHotspot}
            onSelectHotspot={handleSelectHotspotInteractive}
            onSelectMedia={onSelectMedia}
            onCompare={handleSafeCompare}
            onScrollToDossier={handleScrollToDossier}
          />

          {/* Hotspot Intelligence Dossier */}
          <HotspotIntelligencePanel
            hotspot={activeHotspot}
            allStories={allStoriesPool}
            correlatedStoriesOverride={activeCorrelated}
            loadingStories={loadingHotspotStories}
            onCompare={handleSafeCompare}
            onRead={onRead}
          />
        </div>
      ) : viewMode === "svg" ? (
        <div className="flex flex-col gap-6">
          {/* Tactical SVG Map */}
          <TacticalWorldMap
            hotspots={hotspotsWithLiveCounts}
            selectedHotspotId={activeHotspotId}
            onSelectHotspot={handleSelectHotspotInteractive}
          />

          {/* Hotspot Intelligence Dossier */}
          <HotspotIntelligencePanel
            hotspot={activeHotspot}
            allStories={allStoriesPool}
            correlatedStoriesOverride={activeCorrelated}
            loadingStories={loadingHotspotStories}
            onCompare={handleSafeCompare}
            onRead={onRead}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Crisis Feed of Cards */}
          <HotspotsFeed
            hotspots={hotspotsWithLiveCounts}
            selectedHotspotId={activeHotspotId}
            onSelectHotspot={handleSelectHotspotInteractive}
            onSwitchToMap={(id) => {
              handleSelectHotspotInteractive(id);
              setViewMode("mapa");
            }}
            onOpenComparator={handleSafeCompare}
          />

          {/* Hotspot Intelligence Dossier */}
          <HotspotIntelligencePanel
            hotspot={activeHotspot}
            allStories={allStoriesPool}
            correlatedStoriesOverride={activeCorrelated}
            loadingStories={loadingHotspotStories}
            onCompare={handleSafeCompare}
            onRead={onRead}
          />
        </div>
      )}

      {/* Matriz Tri-Axial de Narrativas Geopolíticas (R3) */}
      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6 backdrop-blur-sm shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">
                GUERRA NARRATIVA // MATRIZ TRI-AXIAL COMPARATIVA (R3)
              </span>
            </div>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-black text-white">
              Enquadramento Tri-Axial de Narrativas
            </h2>
            <p className="mt-1 text-xs text-slate-300 max-w-3xl font-sans leading-relaxed">
              Contraste sistemático dos enquadramentos editoriais entre o{" "}
              <strong className="text-sky-300">Bloco Ocidental</strong>, o{" "}
              <strong className="text-red-300">Bloco Eurasiático</strong> e o{" "}
              <strong className="text-emerald-300">Sul Global & Neutros</strong> para o foco ativo:{" "}
              <strong className="text-cyan-300">{activeHotspot.title}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setMatrixExpanded((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 font-mono text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-sm"
              data-testid="toggle-narrative-matrix"
            >
              <span>{matrixExpanded ? "Recolher Matriz" : "Expandir Matriz Tri-Axial"}</span>
              {matrixExpanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-cyan-400" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-cyan-400" />
              )}
            </button>
          </div>
        </div>

        {matrixExpanded && (
          <NarrativeMatrix
            hotspotId={activeHotspotId}
            onCompare={(storyId) => handleSafeCompare(storyId)}
            onReadStory={onRead}
          />
        )}
      </section>

      {/* Bottom Cross-Reference Call to Action */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <Globe className="h-4 w-4 text-cyan-400" />
          <span>
            Deseja cruzar coberturas jornalísticas completas sobre estes eventos?
          </span>
        </div>
        <button
          type="button"
          onClick={() => handleSafeCompare(activeCorrelated[0]?.id)}
          className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/60 px-4 py-2 font-bold text-cyan-300 hover:bg-cyan-900/60 transition-colors whitespace-nowrap cursor-pointer"
        >
          <span>Abrir no Comparador de Manchetes</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default TensionsView;

import React, { useState } from "react";
import type { Hotspot, TensionSeverity } from "../../types/geopolitics";
import {
  ShieldAlert,
  Flame,
  Globe2,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface HotspotsFeedProps {
  hotspots: Hotspot[];
  selectedHotspotId: string | null;
  onSelectHotspot: (id: string) => void;
  onSwitchToMap?: (id: string) => void;
  onOpenComparator?: (storyId: string) => void;
  className?: string;
}

type SortOption = "severity" | "news" | "region";

function getSeverityBadge(sev: TensionSeverity) {
  switch (sev) {
    case "critico":
      return {
        label: "Crítico",
        bg: "bg-red-950/80 border-red-500/50 text-red-300",
        barBg: "bg-red-500",
        pulseBg: "bg-red-500",
      };
    case "alto":
      return {
        label: "Alto",
        bg: "bg-orange-950/80 border-orange-500/50 text-orange-300",
        barBg: "bg-orange-500",
        pulseBg: "bg-orange-500",
      };
    case "moderado":
    default:
      return {
        label: "Moderado",
        bg: "bg-amber-950/80 border-amber-500/50 text-amber-300",
        barBg: "bg-yellow-500",
        pulseBg: "bg-yellow-500",
      };
  }
}

export const HotspotsFeed: React.FC<HotspotsFeedProps> = ({
  hotspots,
  selectedHotspotId,
  onSelectHotspot,
  onSwitchToMap,
  onOpenComparator,
  className = "",
}) => {
  const [sortBy, setSortBy] = useState<SortOption>("severity");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const sortedHotspots = [...hotspots]
    .filter((h) => {
      if (filterSeverity === "all") return true;
      return h.severity === filterSeverity || h.tensionLevel === filterSeverity;
    })
    .sort((a, b) => {
      if (sortBy === "severity") {
        const scoreA = a.tensionScore ?? (a.severity === "critico" ? 90 : a.severity === "alto" ? 75 : 60);
        const scoreB = b.tensionScore ?? (b.severity === "critico" ? 90 : b.severity === "alto" ? 75 : 60);
        return scoreB - scoreA;
      }
      if (sortBy === "news") {
        const countA = a.newsCount ?? a.articleCount ?? 0;
        const countB = b.newsCount ?? b.articleCount ?? 0;
        return countB - countA;
      }
      return a.region.localeCompare(b.region);
    });

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-orange-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider">
            Focos Ativos de Crise ({sortedHotspots.length})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">Filtrar:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-200 outline-none focus:border-cyan-500"
            >
              <option value="all">Todas ({hotspots.length})</option>
              <option value="critico">Crítico (4)</option>
              <option value="alto">Alto (2)</option>
              <option value="moderado">Moderado (2)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-200 outline-none focus:border-cyan-500"
            >
              <option value="severity">Maior Tensão</option>
              <option value="news">Mais Notícias</option>
              <option value="region">Região</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-2">
        {sortedHotspots.map((hotspot) => {
          const isSelected = hotspot.id === selectedHotspotId;
          const sev = hotspot.severity || hotspot.tensionLevel || "moderado";
          const badge = getSeverityBadge(sev);
          const score = hotspot.tensionScore ?? (sev === "critico" ? 92 : sev === "alto" ? 78 : 62);
          const newsNum = hotspot.newsCount ?? hotspot.articleCount ?? 15;
          const firstStoryId = hotspot.relatedStoryIds?.[0] || hotspot.correlatedStoryIds?.[0];

          return (
            <div
              key={hotspot.id}
              onClick={() => onSelectHotspot(hotspot.id)}
              className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-cyan-500/70 bg-slate-900/90 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              {/* Header: Region + Severity Badge + Pulse */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe2 className="h-3 w-3 text-cyan-400" />
                  {hotspot.region}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase ${badge.bg}`}>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${badge.pulseBg}`} />
                      <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${badge.pulseBg}`} />
                    </span>
                    <ShieldAlert className="h-3 w-3" />
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Title & Tension Score Meter */}
              <div className="mt-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-base font-black tracking-wide text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {hotspot.title}
                  </h3>
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {score}%
                  </span>
                </div>

                {/* Tension Progress Bar */}
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${badge.barBg}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              {/* Strategic Importance Brief */}
              <p className="mt-2.5 text-xs text-slate-300 leading-relaxed line-clamp-2">
                {hotspot.strategicImportance || hotspot.strategicRelevance || hotspot.summary}
              </p>

              {/* Key Actors with Flags */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1 mr-0.5">
                  <Users className="h-2.5 w-2.5" />
                  Atores:
                </span>
                {hotspot.actors.slice(0, 4).map((actor) => (
                  <span
                    key={actor.id}
                    title={`${actor.name} (${actor.country}) — ${actor.role}`}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-950/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-200"
                  >
                    <span>{actor.flagEmoji || actor.flag || "🌐"}</span>
                    <span className="truncate max-w-[85px]">{actor.name}</span>
                  </span>
                ))}
              </div>

              {/* Card Footer: News Count & Actions */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5 font-mono text-[11px]">
                <span className="flex items-center gap-1 text-[10.5px] text-slate-400">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  <strong className="text-slate-200">{newsNum}</strong> matérias apuradas
                </span>

                <div className="flex items-center gap-1.5">
                  {onSwitchToMap && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectHotspot(hotspot.id);
                        onSwitchToMap(hotspot.id);
                      }}
                      className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[10.5px] font-semibold text-slate-200 hover:border-cyan-500 hover:text-cyan-300 transition-colors"
                    >
                      <Compass className="h-3 w-3" />
                      <span>Ver no Mapa</span>
                    </button>
                  )}

                  {onOpenComparator && firstStoryId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenComparator(firstStoryId);
                      }}
                      className="flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-950/50 px-2 py-1 text-[10.5px] font-bold text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                      title="Comparar coberturas no Comparador PRISMA"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="hidden xs:inline">Comparar</span>
                    </button>
                  )}

                  <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotspotsFeed;

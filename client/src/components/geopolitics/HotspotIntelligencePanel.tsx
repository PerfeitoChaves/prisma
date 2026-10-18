import React, { useMemo } from "react";
import type { Hotspot, Actor } from "../../types/geopolitics";
import { OUTLETS, type Story } from "../../data/news";
import { GEOPOLITICAL_BLOCS } from "../../data/geopolitics";
import {
  ShieldAlert,
  FileText,
  Users,
  Compass,
  ExternalLink,
  BookOpen,
  X,
  Target,
  Sparkles,
  Info,
} from "lucide-react";

interface HotspotIntelligencePanelProps {
  hotspot: Hotspot | null;
  allStories?: Story[];
  onClose?: () => void;
  onCompare?: (storyId?: string, outlet?: string) => void;
  onRead?: (storyId: string) => void;
  className?: string;
}

export const HotspotIntelligencePanel: React.FC<HotspotIntelligencePanelProps> = ({
  hotspot,
  allStories = [],
  onClose,
  onCompare,
  onRead,
  className = "",
}) => {
  // Find correlated stories matching the hotspot's relatedStoryIds or topic keywords
  const correlatedStories = useMemo(() => {
    if (!hotspot) return [];
    const targetIds = new Set(
      [...(hotspot.relatedStoryIds || []), ...(hotspot.correlatedStoryIds || [])].map((id) =>
        id.toLowerCase().trim()
      )
    );

    const matches = allStories.filter((story) => {
      // 1. Direct ID match
      if (targetIds.has(story.id.toLowerCase())) return true;
      // 2. Keyword match in title or summary
      const text = `${story.title} ${story.summary} ${story.kicker || ""} ${story.theme || ""}`.toLowerCase();
      if (hotspot.id === "ormuz" && (text.includes("ormuz") || text.includes("petróleo") || text.includes("golfo pérsico") || text.includes("irã"))) return true;
      if (hotspot.id === "ucrania" && (text.includes("ucrânia") || text.includes("rússia") || text.includes("otan") || text.includes("zelensky"))) return true;
      if (hotspot.id === "taiwan" && (text.includes("taiwan") || text.includes("semicondutores") || text.includes("pequim") || text.includes("tsmc"))) return true;
      if (hotspot.id === "mar_vermelho" && (text.includes("vermelho") || text.includes("houthi") || text.includes("bab el-mandeb") || text.includes("iêmen"))) return true;
      if (hotspot.id === "gaza" && (text.includes("gaza") || text.includes("israel") || text.includes("palestina") || text.includes("líbano"))) return true;
      if (hotspot.id === "coreia" && (text.includes("coreia") || text.includes("pyongyang") || text.includes("nuclear") || text.includes("kim jong"))) return true;
      if (hotspot.id === "sahel" && (text.includes("sahel") || text.includes("sudão") || text.includes("níger") || text.includes("áfrica"))) return true;
      if (hotspot.id === "essequibo" && (text.includes("essequibo") || text.includes("guiana") || text.includes("maduro") || text.includes("venezuela"))) return true;
      return false;
    });

    // If no direct matches, return first 2 general stories as fallback context
    return matches.length > 0 ? matches.slice(0, 4) : allStories.slice(0, 2);
  }, [hotspot, allStories]);

  if (!hotspot) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/70 p-8 text-center backdrop-blur-md ${className}`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400">
          <Target className="h-6 w-6 text-cyan-400" />
        </div>
        <h4 className="mt-3 font-mono text-sm font-bold text-slate-200 uppercase tracking-wider">
          Nenhum Foco de Tensão Selecionado
        </h4>
        <p className="mt-1 max-w-sm text-xs text-slate-400">
          Selecione um dos 8 hotspots táticos no mapa global ou na lista de focos para carregar o dossiê geoestratégico completo.
        </p>
      </div>
    );
  }

  const sev = hotspot.severity || hotspot.tensionLevel || "moderado";
  const score = hotspot.tensionScore ?? (sev === "critico" ? 92 : sev === "alto" ? 78 : 62);
  const newsNum = hotspot.newsCount ?? hotspot.articleCount ?? 24;

  return (
    <div className={`flex flex-col rounded-2xl border border-slate-800 bg-slate-950/90 text-slate-100 shadow-2xl backdrop-blur-md overflow-hidden ${className}`}>
      {/* Dossier Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800/80 bg-slate-900/60 p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5" />
              DOSSIÊ GEOESTRATÉGICO // {hotspot.region}
            </span>
          </div>

          <h3 className="mt-1 font-display text-xl sm:text-2xl font-black tracking-wide text-white">
            {hotspot.title}
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-400">
            <span>LAT {hotspot.coordinates.lat}° // LNG {hotspot.coordinates.lng}°</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-cyan-300">
              <Sparkles className="h-3 w-3" />
              {newsNum} matérias apuradas no acervo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Severity & Tension Score Pill */}
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-bold uppercase shadow-sm ${
              sev === "critico"
                ? "border-red-500/50 bg-red-950/80 text-red-300"
                : sev === "alto"
                ? "border-orange-500/50 bg-orange-950/80 text-orange-300"
                : "border-amber-500/50 bg-amber-950/80 text-amber-300"
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>{sev}</span>
            <span className="text-[10px] opacity-75 font-normal">({score}%)</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              title="Fechar Dossiê"
              aria-label="Fechar Dossiê"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dossier Body */}
      <div className="flex flex-col gap-5 p-4 sm:p-5">
        {/* Strategic Relevance Box */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
            <Info className="h-3.5 w-3.5" />
            Relevância Estratégica Global
          </div>
          <p className="mt-2 text-xs sm:text-[13px] text-slate-200 leading-relaxed font-sans">
            {hotspot.strategicImportance || hotspot.strategicRelevance || hotspot.summary}
          </p>
        </div>

        {/* Strategic Summary */}
        <div>
          <h4 className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            Síntese Operacional da Crise
          </h4>
          <p className="mt-2 text-xs sm:text-[13px] text-slate-300 leading-relaxed">
            {hotspot.summary}
          </p>
        </div>

        {/* Actors & Geopolitical Blocs */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h4 className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              Atores Centrais Envolvidos ({hotspot.actors.length})
            </h4>
          </div>

          <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {hotspot.actors.map((actor: Actor) => {
              const blocMeta = GEOPOLITICAL_BLOCS[actor.bloc];
              return (
                <div
                  key={actor.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs transition-colors hover:border-slate-700 hover:bg-slate-900/80"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" role="img" aria-label={actor.country}>
                        {actor.flagEmoji || actor.flag || "🌐"}
                      </span>
                      <div>
                        <strong className="text-slate-100 font-semibold">{actor.name}</strong>
                        <span className="ml-1 text-[10px] text-slate-400 font-mono">
                          ({actor.country})
                        </span>
                      </div>
                    </div>

                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${
                        blocMeta?.badgeClass || "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {blocMeta?.name.split(" ")[1] || actor.bloc}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-400 leading-relaxed font-sans">
                    {actor.role}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Correlated News Stories */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h4 className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
              <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
              Matérias Recentes Correlacionadas ({correlatedStories.length})
            </h4>

            {onCompare && correlatedStories.length > 0 && (
              <button
                type="button"
                onClick={() => onCompare(correlatedStories[0].id)}
                className="flex items-center gap-1 font-mono text-[11px] font-bold text-cyan-300 hover:text-cyan-200 transition-colors"
              >
                <span>Comparar no PRISMA</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="mt-2.5 flex flex-col gap-2">
            {correlatedStories.map((story) => (
              <div
                key={story.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-3 transition-colors hover:border-slate-700 hover:bg-slate-900/80"
              >
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 uppercase font-semibold text-slate-300">
                      {story.theme}
                    </span>
                    <span>•</span>
                    <span>{story.time}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{story.coverage.length} fontes</span>
                  </div>

                  <h5 className="mt-1 font-display text-sm font-bold text-slate-100 leading-snug">
                    {story.title}
                  </h5>

                  {/* Outlets preview pills */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {story.coverage.slice(0, 4).map((cov) => {
                      const outlet = OUTLETS.find((o) => o.id === cov.outletId);
                      return (
                        <span
                          key={cov.outletId}
                          className="inline-flex items-center gap-1 rounded border border-slate-800 bg-slate-950 px-1.5 py-0.5 text-[9.5px] font-mono text-slate-300"
                        >
                          <span>{outlet?.flag || "📰"}</span>
                          <span>{outlet?.name || cov.outletId}</span>
                        </span>
                      );
                    })}
                    {story.coverage.length > 4 && (
                      <span className="text-[9.5px] font-mono text-slate-400">
                        +{story.coverage.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Story Action Buttons */}
                <div className="flex items-center gap-2">
                  {onRead && (
                    <button
                      type="button"
                      onClick={() => onRead(story.id)}
                      className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-slate-200 hover:border-slate-600 hover:text-white transition-colors"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>Ler</span>
                    </button>
                  )}

                  {onCompare && (
                    <button
                      type="button"
                      onClick={() => onCompare(story.id)}
                      className="flex items-center gap-1 rounded-lg border border-cyan-500/40 bg-cyan-950/60 px-3 py-1.5 font-mono text-[11px] font-bold text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Comparar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotspotIntelligencePanel;

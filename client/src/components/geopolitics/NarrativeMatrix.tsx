import React, { useState, useMemo } from "react";
import type {
  NarrativeMatrix as NarrativeMatrixType,
  BlocNarrative,
  GeopoliticalBloc,
  VocabularyTerm,
  RealHeadline,
} from "../../types/geopolitics";
import {
  getNarrativeMatrix,
  normalizeHotspotId,
  HOTSPOTS,
} from "../../data/geopolitics";
import { OUTLETS } from "../../data/news";
import {
  Scale,
  EyeOff,
  GitCompare,
  Swords,
  Radio,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldAlert,
  Flame,
  Globe2,
  Info,
} from "lucide-react";

export interface NarrativeMatrixProps {
  hotspotId?: string;
  matrix?: NarrativeMatrixType;
  onCompare?: (storyId?: string, hotspotId?: string) => void;
  onReadStory?: (storyId: string) => void;
  className?: string;
}

type TabSelection = "all" | GeopoliticalBloc;

interface BlocThemeConfig {
  bloc: GeopoliticalBloc;
  defaultTitle: string;
  defaultSubtitle: string;
  flags: string;
  cardBorder: string;
  cardBg: string;
  headerBadge: string;
  accentText: string;
  topBorder: string;
  glow: string;
  pillBorder: string;
  pillBg: string;
  buttonClass: string;
}

const BLOC_THEMES: Record<GeopoliticalBloc, BlocThemeConfig> = {
  west: {
    bloc: "west",
    defaultTitle: "Bloco Ocidental",
    defaultSubtitle: "EUA, União Europeia, OTAN, Japão",
    flags: "🇺🇸 🇪🇺 🇯🇵 🇬🇧",
    cardBorder: "border-sky-500/30",
    cardBg: "bg-gradient-to-b from-sky-950/20 via-slate-950/60 to-slate-950/90",
    headerBadge: "bg-sky-950/70 text-sky-300 border-sky-500/40",
    accentText: "text-sky-400",
    topBorder: "border-t-2 border-t-sky-400",
    glow: "shadow-[0_0_20px_rgba(14,165,233,0.08)]",
    pillBorder: "border-sky-500/30",
    pillBg: "bg-sky-950/30",
    buttonClass:
      "border-sky-500/40 bg-sky-950/50 text-sky-200 hover:bg-sky-900/60 hover:border-sky-400",
  },
  east: {
    bloc: "east",
    defaultTitle: "Bloco Eurasiático / Oriental",
    defaultSubtitle: "China, Rússia, Irã e aliados",
    flags: "🇨🇳 🇷🇺 🇮🇷",
    cardBorder: "border-red-500/30",
    cardBg: "bg-gradient-to-b from-red-950/20 via-slate-950/60 to-slate-950/90",
    headerBadge: "bg-red-950/70 text-red-300 border-red-500/40",
    accentText: "text-red-400",
    topBorder: "border-t-2 border-t-red-500",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.08)]",
    pillBorder: "border-red-500/30",
    pillBg: "bg-red-950/30",
    buttonClass:
      "border-red-500/40 bg-red-950/50 text-red-200 hover:bg-red-900/60 hover:border-red-400",
  },
  global_south: {
    bloc: "global_south",
    defaultTitle: "Sul Global & Neutros",
    defaultSubtitle: "Brasil, Índia, África do Sul, Mundo Árabe",
    flags: "🇧🇷 🇮🇳 🇿🇦 🇦🇪",
    cardBorder: "border-emerald-500/30",
    cardBg: "bg-gradient-to-b from-emerald-950/20 via-slate-950/60 to-slate-950/90",
    headerBadge: "bg-emerald-950/70 text-emerald-300 border-emerald-500/40",
    accentText: "text-emerald-400",
    topBorder: "border-t-2 border-t-emerald-500",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.08)]",
    pillBorder: "border-emerald-500/30",
    pillBg: "bg-emerald-950/30",
    buttonClass:
      "border-emerald-500/40 bg-emerald-950/50 text-emerald-200 hover:bg-emerald-900/60 hover:border-emerald-400",
  },
};

/**
 * Normaliza valores de métricas para escala percentual de 0 a 100
 */
const normalizeMetric = (val?: number): number => {
  if (val == null || isNaN(val)) return 50;
  if (val <= 1 && val > 0) return Math.round(val * 100);
  return Math.min(100, Math.max(0, Math.round(val)));
};

/**
 * Resolve o badge da fonte com nome, país e bandeira
 */
const resolveOutletBadge = (srcId: string) => {
  const normId = srcId.toLowerCase().trim();
  const o = OUTLETS.find(
    (out) =>
      out.id.toLowerCase() === normId ||
      out.name.toLowerCase() === normId ||
      out.short.toLowerCase() === normId
  );

  if (o) {
    return {
      id: o.id,
      name: o.name,
      short: o.short || o.name,
      flag: o.flag || "🌐",
      country: o.country || "INT",
    };
  }

  // Verifica se o ID já contém código de país no formato "Nome [XX]"
  const match = srcId.match(/^(.*?)\s*\[([A-Z]{2})\]$/);
  if (match) {
    return {
      id: srcId,
      name: match[1].trim(),
      short: match[1].trim(),
      flag: "🌐",
      country: match[2],
    };
  }

  // Fallback amigável substituindo underscores
  const cleanName = srcId
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: srcId,
    name: cleanName,
    short: cleanName,
    flag: "🌐",
    country: "INT",
  };
};

export const NarrativeMatrix: React.FC<NarrativeMatrixProps> = ({
  hotspotId = "ormuz",
  matrix,
  onCompare,
  onReadStory,
  className = "",
}) => {
  // Mobile segmented tab: 'all' | 'west' | 'east' | 'global_south'
  const [activeTab, setActiveTab] = useState<TabSelection>("all");

  // Interactive term pill click-to-expand
  const [expandedTermKey, setExpandedTermKey] = useState<string | null>(null);

  // Retrieve narrative data with safe fallback to 'ormuz'
  const activeMatrix: NarrativeMatrixType = useMemo(() => {
    if (matrix && matrix.blocs) return matrix;
    const norm = normalizeHotspotId(hotspotId);
    const found = getNarrativeMatrix(norm);
    if (found) return found;
    // Fallback defensively
    return getNarrativeMatrix("ormuz") || {
      hotspotId: "ormuz",
      topicTitle: "Matriz Geopolítica de Narrativas",
      sharedFact: "Acontecimentos geopolíticos monitorados em tempo real.",
      comparatorStoryId: "tarifas",
      blocs: {
        west: {
          bloc: "west",
          blocName: "Bloco Ocidental",
          framingHeadline: "Defesa da ordem internacional e rotas marítimas",
          vocabulary: [],
          representativeSources: [],
          blindspots: [],
          realHeadlines: [],
          metrics: { escalationSentiment: 75, militaryEmphasis: 80, diplomaticEmphasis: 25 },
        },
        east: {
          bloc: "east",
          blocName: "Bloco Eurasiático / Oriental",
          framingHeadline: "Soberania e resistência ao hegemonismo unilateral",
          vocabulary: [],
          representativeSources: [],
          blindspots: [],
          realHeadlines: [],
          metrics: { escalationSentiment: 70, militaryEmphasis: 75, diplomaticEmphasis: 30 },
        },
        global_south: {
          bloc: "global_south",
          blocName: "Sul Global & Neutros",
          framingHeadline: "Desescalada diplomática e impacto nas commodities",
          vocabulary: [],
          representativeSources: [],
          blindspots: [],
          realHeadlines: [],
          metrics: { escalationSentiment: 45, militaryEmphasis: 35, diplomaticEmphasis: 85 },
        },
      },
    };
  }, [matrix, hotspotId]);

  // Safe bloc extractors
  const westBloc = activeMatrix.blocs?.west || activeMatrix.west;
  const eastBloc = activeMatrix.blocs?.east || activeMatrix.east;
  const southBloc =
    activeMatrix.blocs?.global_south ||
    activeMatrix.global_south ||
    activeMatrix.globalSouth;

  const currentHotspotMeta = useMemo(() => {
    const id = activeMatrix.hotspotId || hotspotId;
    return HOTSPOTS.find((h) => h.id === normalizeHotspotId(id));
  }, [activeMatrix.hotspotId, hotspotId]);

  const comparatorStory =
    activeMatrix.comparatorStoryId || currentHotspotMeta?.relatedStoryIds?.[0] || "tarifas";

  const handleCompareClick = (targetStoryId?: string) => {
    if (onCompare) {
      onCompare(targetStoryId || comparatorStory, activeMatrix.hotspotId);
    }
  };

  const toggleTerm = (key: string) => {
    setExpandedTermKey((prev) => (prev === key ? null : key));
  };

  // Render individual bloc column
  const renderBlocColumn = (
    blocData: BlocNarrative | undefined,
    theme: BlocThemeConfig
  ) => {
    if (!blocData) return null;

    const title = blocData.blocName || theme.defaultTitle;
    const subtitle = blocData.blocSubtitle || theme.defaultSubtitle;
    const framingHeadline = blocData.framingHeadline || "Sem enquadramento registrado";
    const coreArgument = blocData.coreArgument || blocData.subdeck || "";
    const subdeck = blocData.subdeck && blocData.subdeck !== coreArgument ? blocData.subdeck : null;
    const vocabulary: VocabularyTerm[] = blocData.vocabulary || [];
    const representativeSources: string[] = blocData.representativeSources || [];
    const blindspots: string[] = blocData.blindspots || blocData.blindSpots || [];
    const realHeadlines: RealHeadline[] = blocData.realHeadlines || [];
    const metrics = blocData.metrics || {
      escalationSentiment: 50,
      militaryEmphasis: 50,
      diplomaticEmphasis: 50,
    };

    const escalation = normalizeMetric(metrics.escalationSentiment);
    const military = normalizeMetric(metrics.militaryEmphasis);
    const diplomatic = normalizeMetric(metrics.diplomaticEmphasis);

    return (
      <div
        key={theme.bloc}
        className={`flex flex-col rounded-2xl border ${theme.cardBorder} ${theme.cardBg} ${theme.topBorder} ${theme.glow} p-4 sm:p-5 text-slate-100 transition-all duration-300 relative overflow-hidden`}
        data-testid={`narrative-column-${theme.bloc}`}
      >
        {/* Column Header */}
        <div className="flex flex-col gap-2 pb-4 border-b border-slate-800/80">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider border ${theme.headerBadge}`}
            >
              <Globe2 className="h-3 w-3" />
              <span>{title}</span>
            </span>

            {/* National Flags */}
            <span className="text-base tracking-widest select-none" title={subtitle}>
              {theme.flags}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono leading-relaxed line-clamp-2">
            {subtitle}
          </p>
        </div>

        {/* Framing Headline (Bold Editorial Quote) */}
        <div className="my-4 rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 relative">
          <span className="absolute -top-3 left-3 px-1.5 py-0.2 bg-slate-900 border border-slate-800 rounded font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Tese Dominante // Framing
          </span>
          <blockquote className="mt-1 font-display text-base sm:text-lg font-bold italic leading-snug text-white">
            “{framingHeadline}”
          </blockquote>
          {subdeck && (
            <p className="mt-2 text-xs text-slate-300 leading-relaxed font-sans border-t border-slate-800/60 pt-2">
              {subdeck}
            </p>
          )}
        </div>

        {/* Core Argument / Underlying Worldview */}
        {coreArgument && (
          <div className="mb-4">
            <h5 className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center gap-1">
              <Layers className="h-3 w-3 text-cyan-400" />
              Argumento Estratégico & Cosmovisão
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
              {coreArgument}
            </p>
          </div>
        )}

        {/* Indicadores de Viés & Sentimento (Gauges / Mini Progress Bars) */}
        <div className="mb-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-400" />
              Indicadores Editoriais
            </span>
            <span className="font-mono text-[10px] text-slate-500">Métricas</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Escalação Militar */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-0.5">
                <span>Escalação Militar</span>
                <span className="font-bold text-red-400">{escalation}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-500"
                  style={{ width: `${escalation}%` }}
                />
              </div>
            </div>

            {/* Enfoque Bélico */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-0.5">
                <span>Enfoque Bélico</span>
                <span className="font-bold text-amber-400">{military}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-500"
                  style={{ width: `${military}%` }}
                />
              </div>
            </div>

            {/* Enfoque Diplomático */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-0.5">
                <span>Enfoque Diplomático</span>
                <span className="font-bold text-emerald-400">{diplomatic}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-500"
                  style={{ width: `${diplomatic}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vocabulário de Guerra Narrativa (Interactive Tag Pills) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1">
              <Swords className="h-3 w-3 text-cyan-400" />
              Vocabulário de Guerra Narrativa
            </h5>
            <span className="font-mono text-[9px] text-slate-500">toque p/ contexto</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {vocabulary.length > 0 ? (
              vocabulary.map((v, i) => {
                const termKey = `${theme.bloc}-term-${i}`;
                const isExpanded = expandedTermKey === termKey;

                const connotationBadge =
                  v.connotation === "positive"
                    ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
                    : v.connotation === "negative"
                    ? "border-rose-500/40 bg-rose-950/60 text-rose-300"
                    : "border-slate-700 bg-slate-900/80 text-slate-300";

                const connotationLabel =
                  v.connotation === "positive"
                    ? "+"
                    : v.connotation === "negative"
                    ? "−"
                    : "•";

                return (
                  <div key={termKey} className="w-full">
                    <button
                      type="button"
                      onClick={() => toggleTerm(termKey)}
                      className={`w-full flex items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-all ${
                        isExpanded
                          ? "border-cyan-500/60 bg-cyan-950/40 shadow-sm"
                          : `${theme.pillBorder} ${theme.pillBg} hover:bg-slate-800/60`
                      }`}
                    >
                      <span className="font-semibold text-slate-200">{v.term}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-mono font-bold border ${connotationBadge}`}
                          title={`Conotação: ${v.connotation}`}
                        >
                          {connotationLabel}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3 text-cyan-400" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-slate-500" />
                        )}
                      </div>
                    </button>

                    {isExpanded && v.meaningOrContext && (
                      <div className="mt-1 rounded-lg border border-cyan-500/30 bg-slate-950/90 p-2.5 text-[11px] text-slate-300 shadow-inner font-mono">
                        <span className="font-bold text-cyan-300">Enquadramento Semântico: </span>
                        {v.meaningOrContext}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <span className="text-xs text-slate-500 italic">Nenhum termo catalogado.</span>
            )}
          </div>
        </div>

        {/* Fontes Representativas com Código de País */}
        <div className="mb-4">
          <h5 className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <Radio className="h-3 w-3 text-cyan-400" />
            Fontes Representativas do Bloco
          </h5>

          <div className="flex flex-wrap gap-1.5">
            {representativeSources.map((src, i) => {
              const info = resolveOutletBadge(src);
              return (
                <span
                  key={`${src}-${i}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1 font-mono text-[11px] text-slate-200"
                  title={`${info.name} [${info.country}]`}
                >
                  <span className="select-none">{info.flag}</span>
                  <span className="font-medium text-slate-100">{info.short}</span>
                  <span className="rounded bg-slate-800 px-1 py-0.2 text-[9px] font-bold text-slate-400">
                    {info.country}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Pontos Cegos & Omissões Estratégicas (Distinct Callout) */}
        <div className="mb-4 rounded-xl border border-dashed border-amber-500/40 bg-amber-950/15 p-3.5 relative">
          <div className="flex items-center gap-1.5 mb-2 font-mono text-[11px] font-bold text-amber-300 uppercase tracking-wide">
            <EyeOff className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Pontos Cegos & Omissões Estratégicas</span>
          </div>

          <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
            {blindspots.length > 0 ? (
              blindspots.map((blind, i) => (
                <li key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-amber-400/80 mt-0.5 select-none font-bold">›</span>
                  <span>{blind}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic">Nenhum ponto cego catalogado.</li>
            )}
          </ul>
        </div>

        {/* Exemplos Reais de Manchetes */}
        <div className="mb-4 flex-1">
          <h5 className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3 text-cyan-400" />
            Exemplos Reais de Manchetes Coletadas
          </h5>

          <div className="space-y-2">
            {realHeadlines.length > 0 ? (
              realHeadlines.map((h, i) => (
                <div
                  key={i}
                  className="group rounded-xl border border-slate-800/80 bg-slate-950/80 p-2.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                      <span>{h.flag}</span>
                      <span className="font-semibold text-slate-200 truncate max-w-[140px]">
                        {h.outlet}
                      </span>
                    </div>

                    {h.framingTag && (
                      <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 font-mono text-[9px] font-bold text-cyan-300 shrink-0">
                        {h.framingTag}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-serif italic text-slate-200 leading-snug group-hover:text-white">
                    “{h.title}”
                  </p>

                  <div className="mt-2 flex items-center justify-end gap-2">
                    {onReadStory && h.storyId && (
                      <button
                        type="button"
                        onClick={() => onReadStory(h.storyId!)}
                        className="text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
                      >
                        Ler
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCompareClick(h.storyId || comparatorStory)}
                      className="text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <span>Cruzar</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">Sem manchetes registradas.</span>
            )}
          </div>
        </div>

        {/* 1-Touch Action: Cruzar no Comparador per Column */}
        <div className="mt-auto pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => handleCompareClick(comparatorStory)}
            className={`w-full flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 font-mono text-xs font-bold transition-all shadow-sm ${theme.buttonClass}`}
            data-testid={`btn-compare-${theme.bloc}`}
          >
            <GitCompare className="h-3.5 w-3.5" />
            <span>Cruzar {title} no Comparador</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col gap-5 ${className}`}
      data-testid="narrative-matrix-container"
    >
      {/* Shared Fact Banner (Baseline Factual Objetivo) */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0b1728] via-[#09111e] to-[#050912] p-4 sm:p-6 text-slate-100 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
              <Scale className="h-4 w-4 text-cyan-400" />
              <span>Base Factual Compartilhada // Baseline Objetivo</span>
            </div>

            <h3 className="mt-1 font-display text-lg sm:text-xl md:text-2xl font-black text-white">
              {activeMatrix.topicTitle || "Matriz Tri-Axial de Enquadramentos Geopolíticos"}
            </h3>

            {activeMatrix.sharedFact && (
              <div className="mt-2 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 sm:p-3.5 text-xs sm:text-sm text-cyan-100 leading-relaxed font-sans">
                <span className="font-mono font-bold text-cyan-300 uppercase mr-1.5 text-[10px] bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                  Fato Comprovado
                </span>
                {activeMatrix.sharedFact}
              </div>
            )}
          </div>

          {/* 1-Touch Action Header: Cruzar no Comparador */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:self-center shrink-0">
            <button
              type="button"
              onClick={() => handleCompareClick(comparatorStory)}
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/50 bg-cyan-500/20 hover:bg-cyan-500/30 px-4 py-2.5 font-mono text-xs font-bold text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all whitespace-nowrap"
              data-testid="btn-compare-header"
            >
              <GitCompare className="h-4 w-4 text-cyan-400" />
              <span>Cruzar no Comparador</span>
            </button>
          </div>
        </div>

        {/* Informative Subdeck */}
        <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2.5">
          <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>
            Abaixo, observe como o mesmo acontecimento fatual é enquadrado de formas radicalmente
            distintas pelos 3 blocos mundiais.
          </span>
        </div>
      </div>

      {/* Mobile Segmented Tab Controls (Active Tab Selector) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex rounded-xl border border-slate-800 bg-slate-950/90 p-1 font-mono text-xs shadow-inner overflow-x-auto max-w-full scrollbar-thin">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all whitespace-nowrap ${
              activeTab === "all"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
            data-testid="tab-all"
          >
            <span>Todos os Blocos (3 Colunas)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("west")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all whitespace-nowrap ${
              activeTab === "west"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
            data-testid="tab-west"
          >
            <span>Ocidental 🇺🇸</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("east")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all whitespace-nowrap ${
              activeTab === "east"
                ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
            data-testid="tab-east"
          >
            <span>Eurasiático 🇨🇳</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("global_south")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-all whitespace-nowrap ${
              activeTab === "global_south"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
            data-testid="tab-global-south"
          >
            <span>Sul Global 🇧🇷</span>
          </button>
        </div>

        {/* Hotspot indicator badge */}
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
          <span>Matriz vinculada:</span>
          <span className="font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            {currentHotspotMeta?.title || activeMatrix.hotspotId}
          </span>
        </div>
      </div>

      {/* Tri-Axial Comparison Grid: 3 Columns on Desktop, Segmented or Stacked on Mobile */}
      <div
        className={`grid gap-4 sm:gap-5 ${
          activeTab === "all"
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 max-w-2xl mx-auto w-full"
        }`}
        data-testid="narrative-columns-grid"
      >
        {(activeTab === "all" || activeTab === "west") &&
          renderBlocColumn(westBloc, BLOC_THEMES.west)}

        {(activeTab === "all" || activeTab === "east") &&
          renderBlocColumn(eastBloc, BLOC_THEMES.east)}

        {(activeTab === "all" || activeTab === "global_south") &&
          renderBlocColumn(southBloc, BLOC_THEMES.global_south)}
      </div>
    </div>
  );
};

export default NarrativeMatrix;

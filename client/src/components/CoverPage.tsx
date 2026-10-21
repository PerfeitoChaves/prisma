import { useState, useMemo } from "react";
import { cn } from "../utils/cn";
import {
  STORIES,
  THEMES,
  outletById,
  getStoryTags,
  type Story,
  type ThemeId,
} from "../data/news";
import { coverageVerdict, outletToBias } from "../utils/prismaCoverage";
import {
  PrismaLogo,
  BiasBar,
  VerdictChip,
  SpectrumLegend,
} from "./PrismaComponents";
import { Ticker, todayLong } from "./Chrome";
import {
  IBookmark,
  IClock,
  ICompare,
  INewspaper,
  IReader,
  ISearch,
} from "./icons";
import {
  Kicker,
  Mark,
  Reveal,
  RevealWords,
  VerifiedStamp,
  markNumbers,
} from "./ui";
import EditorialFilterBar, {
  type SortOption,
  type BlindspotFilter,
} from "./EditorialFilterBar";

function parseTimeValue(s: Story): number {
  const t = s.time || "";
  const parts = t.split(":");
  if (parts.length === 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m)) {
      return h * 60 + m;
    }
  }
  return 0;
}

function getDivergenceScore(s: Story): number {
  const divCount = s.divergences ? s.divergences.length : 0;
  let positionsCount = 0;
  if (s.divergences) {
    for (const d of s.divergences) {
      positionsCount += d.positions ? d.positions.length : 0;
    }
  }
  const coverageCount = s.coverage ? s.coverage.length : 0;
  return divCount * 100 + positionsCount * 10 + coverageCount;
}

function getConsensusScore(s: Story): number {
  const consensusCount = s.consensus ? s.consensus.length : 0;
  const divCount = s.divergences ? s.divergences.length : 0;
  const v = coverageVerdict(s);
  return consensusCount * 30 + v.balanceScore - divCount * 15;
}

function sortStories(list: Story[], sortOption: SortOption): Story[] {
  const shallow = [...list];
  switch (sortOption) {
    case "recentes":
      return shallow.sort((a, b) => {
        const scoreA = parseTimeValue(a);
        const scoreB = parseTimeValue(b);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return (b.time || "").localeCompare(a.time || "");
      });
    case "divergencia":
      return shallow.sort((a, b) => getDivergenceScore(b) - getDivergenceScore(a));
    case "repercutidas":
      return shallow.sort(
        (a, b) => (b.coverage?.length ?? 0) - (a.coverage?.length ?? 0)
      );
    case "consensuais":
      return shallow.sort((a, b) => getConsensusScore(b) - getConsensusScore(a));
    default:
      return shallow;
  }
}

function filterByBlindspot(list: Story[], filter: BlindspotFilter): Story[] {
  if (filter === "todos") return list;

  return list.filter((s) => {
    const verdict = coverageVerdict(s);
    if (filter === "equilibrada") {
      return (
        verdict.tone === "balanced" ||
        verdict.balanceScore >= 60 ||
        verdict.label.toLowerCase().includes("ampla") ||
        verdict.label.toLowerCase().includes("equilibrada") ||
        verdict.label.toLowerCase().includes("plural")
      );
    }
    if (filter === "ponto_cego_direita") {
      return (
        verdict.tone === "left" ||
        verdict.label.toLowerCase().includes("ponto cego da direita") ||
        verdict.label.toLowerCase().includes("predomínio de esquerda")
      );
    }
    if (filter === "ponto_cego_esquerda") {
      return (
        verdict.tone === "right" ||
        verdict.label.toLowerCase().includes("ponto cego da esquerda") ||
        verdict.label.toLowerCase().includes("predomínio de direita")
      );
    }
    return true;
  });
}

function filterByTag(list: Story[], tag: string | null): Story[] {
  if (!tag) return list;
  const cleanTarget = tag.replace(/^#/, "").toLowerCase().trim();

  return list.filter((s) => {
    const storyTags = getStoryTags(s);
    return storyTags.some(
      (t) => t.replace(/^#/, "").toLowerCase().trim() === cleanTarget
    );
  });
}

export default function CoverPage({
  stories = STORIES,
  loading = false,
  totalStories,
  sourcesCount,
  onLoadMore,
  loadingMore = false,
  onCompare,
  onRead,
  saved,
  onToggleSave,
  onSearchClick,
}: {
  stories?: Story[];
  loading?: boolean;
  totalStories?: number;
  sourcesCount?: number;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  onCompare: (id: string) => void;
  onRead: (id: string) => void;
  saved: string[];
  onToggleSave: (id: string) => void;
  onSearchClick?: () => void;
}) {
  const [theme, setTheme] = useState<ThemeId | "todas">("todas");
  // Modo inicial: "resumo" (ultra-rápido de no máximo 2 linhas)
  const [viewMode, setViewMode] = useState<"resumo" | "grade">("resumo");
  const [sortOption, setSortOption] = useState<SortOption>("recentes");
  const [blindspotFilter, setBlindspotFilter] = useState<BlindspotFilter>("todos");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const currentStories = stories.length > 0 ? stories : STORIES;
  // Total real do acervo (API do D1); sem API, cai no que está carregado
  const storyTotal = Math.max(totalStories ?? 0, currentStories.length);

  const themeFiltered = useMemo(() => {
    if (theme === "todas") return currentStories;
    return currentStories.filter((s) => s.theme === theme);
  }, [currentStories, theme]);

  const blindspotFiltered = useMemo(() => {
    return filterByBlindspot(themeFiltered, blindspotFilter);
  }, [themeFiltered, blindspotFilter]);

  const tagFiltered = useMemo(() => {
    return filterByTag(blindspotFiltered, activeTag);
  }, [blindspotFiltered, activeTag]);

  const sortedStories = useMemo(() => {
    return sortStories(tagFiltered, sortOption);
  }, [tagFiltered, sortOption]);

  const featured = sortedStories[0];

  const gridStories = useMemo(() => {
    return sortedStories.filter((s) => s.id !== featured?.id);
  }, [sortedStories, featured]);

  /* Distribuição geral no espectro editorial para o Termômetro */
  const distCounts = useMemo(() => {
    const counts: Record<number, number> = { [-2]: 0, [-1]: 0, 0: 0, 1: 0, 2: 0 };
    for (const s of currentStories) {
      for (const c of s.coverage) {
        const b = outletToBias(c.outletId);
        counts[b] = (counts[b] ?? 0) + 1;
      }
    }
    return counts;
  }, [currentStories]);

  const handleTagClick = (tag: string) => {
    const cleanCurrent = activeTag?.replace(/^#/, "").toLowerCase();
    const cleanNew = tag.replace(/^#/, "").toLowerCase();
    if (cleanCurrent === cleanNew) {
      setActiveTag(null);
    } else {
      setActiveTag(tag);
    }
  };

  const handleResetFilters = () => {
    setActiveTag(null);
    setBlindspotFilter("todos");
    setTheme("todas");
    setSortOption("recentes");
  };

  const featuredTags = featured ? getStoryTags(featured) : [];

  return (
    <div className="pb-28 md:pb-16">
      {/* ── Maqueteira clássica PRISMA ── */}
      <header className="mx-auto max-w-6xl px-3 pt-4 sm:px-4 md:pt-6">
        <div className="flex items-center justify-between border-b-2 border-ink pb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-ink3 sm:text-[10px]">
          <span>Edição pessoal · sem anúncios</span>
          <span className="hidden truncate px-2 sm:block">{todayLong()}</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="animate-pulse-soft h-1.5 w-1.5 rounded-full bg-signal" />
            {sourcesCount ?? 62} fontes monitoradas · {storyTotal.toLocaleString("pt-BR")} pautas
          </span>
        </div>

        <div className="pt-4 text-center sm:pt-6 md:pt-7">
          <div className="flex items-center justify-center gap-3">
            <PrismaLogo size={48} />
            <h1 className="font-display text-[clamp(40px,9.5vw,84px)] font-black leading-none tracking-[0.07em] text-ink">
              PRISMA
            </h1>
          </div>
          <p className="mt-2 font-display text-[13.5px] italic text-ink2 sm:text-[15px]">
            “A mesma história, todos os ângulos.”
          </p>
          <div className="rule-double mx-auto mt-4 max-w-2xl" />

          {/* Seletor de Modo: Resumo 2 Linhas vs Grade Completa */}
          <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-1 rounded-lg border border-rule bg-paper2 p-1 shadow-xs">
            <button
              onClick={() => setViewMode("resumo")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-all cursor-pointer",
                viewMode === "resumo"
                  ? "bg-ink text-paper2 shadow-xs"
                  : "text-ink3 hover:text-ink"
              )}
            >
              <span>⚡ Resumo 2 Linhas</span>
              <span
                className={cn(
                  "rounded px-1.5 py-0.2 text-[9.5px]",
                  viewMode === "resumo" ? "bg-signal text-paper2" : "bg-rule/40 text-ink2"
                )}
              >
                Rápido
              </span>
            </button>
            <button
              onClick={() => setViewMode("grade")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-all cursor-pointer",
                viewMode === "grade"
                  ? "bg-ink text-paper2 shadow-xs"
                  : "text-ink3 hover:text-ink"
              )}
            >
              <INewspaper className="h-3.5 w-3.5" />
              <span>Jornal Completo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Fita de cotações e manchetes */}
      <div className="mt-4 md:mt-5">
        <Ticker />
      </div>

      {/* ── Termômetro do Espectro Editorial (PRISMA) ── */}
      <div className="mx-auto mt-4 max-w-6xl px-3 sm:px-4">
        <SpectrumLegend counts={distCounts} />
      </div>

      {/* ── Filtro de temas (horizontal scroll móvel) ── */}
      <div className="sticky top-14 z-30 mt-4 border-y border-rule bg-paper/90 backdrop-blur-md md:mt-6">
        <div className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-3 py-2 sm:px-4">
          <ThemePill
            label="Todas"
            count={currentStories.length}
            active={theme === "todas"}
            onClick={() => setTheme("todas")}
          />
          {THEMES.map((t) => {
            const count = currentStories.filter((s) => s.theme === t.id).length;
            if (count === 0 && theme !== t.id) return null;
            return (
              <ThemePill
                key={t.id}
                label={t.label}
                count={count}
                active={theme === t.id}
                onClick={() => setTheme(t.id)}
              />
            );
          })}
        </div>
      </div>

      {/* ── Barra de busca sob demanda ── */}
      <div className="mx-auto mt-3 max-w-4xl px-3 sm:px-4">
        <button
          type="button"
          onClick={onSearchClick}
          className="flex w-full items-center justify-between rounded-lg border border-rule bg-paper2/95 px-3.5 py-2.5 text-left text-[13px] text-ink2 shadow-xs transition-all hover:border-signal/40 hover:bg-paper2 active:scale-[0.99] cursor-pointer"
        >
          <span className="flex items-center gap-2.5">
            <ISearch className="h-4 w-4 text-ink3" />
            <span className="text-ink3 text-[12.5px] sm:text-[13px]">
              Pesquisar tema <span className="text-ink font-serif italic">(ex: STF, dólar, copom, juros, inflação…)</span>
            </span>
          </span>
          <span className="shrink-0 rounded border border-signal/20 bg-signal/10 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-signal">
            Ao Vivo
          </span>
        </button>
      </div>

      {/* ── BARRA DE ORDENAÇÃO RÁPIDA & FILTRO DE PONTO CEGO / ESPECTRO ── */}
      <EditorialFilterBar
        sortOption={sortOption}
        onSortChange={setSortOption}
        blindspotFilter={blindspotFilter}
        onBlindspotChange={setBlindspotFilter}
        activeTag={activeTag}
        onClearTag={() => setActiveTag(null)}
        totalStories={themeFiltered.length}
        filteredCount={sortedStories.length}
      />

      {loading && (
        <div className="mx-auto max-w-6xl px-4 py-8 text-center font-mono text-[13px] text-ink3">
          Sincronizando últimas apurações das redações...
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODO 1: RESUMO ULTRA-RÁPIDO EM NO MÁXIMO 2 LINHAS
          Mobile-first, direto aos fatos, números em destaque
         ══════════════════════════════════════════════════════════ */}
      {viewMode === "resumo" && (
        <section className="mx-auto max-w-4xl px-3 pt-4 sm:px-4 md:pt-6">
          <div className="mb-3 flex items-center justify-between border-b border-rule pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink3">
            <span>
              {sortedStories.length} {sortedStories.length === 1 ? "fato apurado" : "fatos apurados"} em síntese direta
            </span>
            <span>Toque para comparar ou ler</span>
          </div>

          {sortedStories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-rule bg-paper2/50 py-12 text-center">
              <p className="font-display text-[17px] font-bold text-ink">
                Nenhum fato encontrado com os filtros selecionados
              </p>
              <p className="mt-1.5 text-xs text-ink3">
                Tente alterar a ordenação, trocar o veredito de espectro ou limpar a tag ativa.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-1.5 font-mono text-[11px] font-bold text-paper2 hover:bg-signal transition-colors cursor-pointer"
              >
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            <div className="divide-y divide-rule/70">
              {sortedStories.map((s, idx) => (
                <Reveal key={s.id} delay={Math.min(idx, 6) * 40}>
                  <BriefCard
                    story={s}
                    isSaved={saved.includes(s.id)}
                    onToggleSave={() => onToggleSave(s.id)}
                    onCompare={() => onCompare(s.id)}
                    onRead={() => onRead(s.id)}
                    activeTag={activeTag}
                    onTagClick={handleTagClick}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODO 2: FOLHA COMPLETA / GRADE CLÁSSICA DE JORNAL
         ══════════════════════════════════════════════════════════ */}
      {viewMode === "grade" && (
        <>
          {sortedStories.length === 0 ? (
            <div className="mx-auto max-w-4xl px-3 pt-6 sm:px-4">
              <div className="rounded-xl border border-dashed border-rule bg-paper2/50 py-12 text-center">
                <p className="font-display text-[17px] font-bold text-ink">
                  Nenhuma pauta encontrada com os filtros selecionados
                </p>
                <p className="mt-1.5 text-xs text-ink3">
                  Tente alterar a ordenação, trocar o veredito de espectro ou limpar a tag ativa.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-1.5 font-mono text-[11px] font-bold text-paper2 hover:bg-signal transition-colors cursor-pointer"
                >
                  Limpar todos os filtros
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Manchete Consensual Lead */}
              {featured && (
                <section className="mx-auto max-w-6xl px-3 pt-3 sm:px-4 md:pt-5">
                  <article className="grid gap-6 border-y-2 border-ink py-5 md:grid-cols-[1.1fr_0.9fr] md:gap-10 md:py-8">
                    <div className="flex flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-signal px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-paper2">
                          Manchete consensual
                        </span>
                        <VerdictChip story={featured} />
                        <VerifiedStamp text={featured.stamp} />
                        <span className="font-mono text-[10px] font-semibold text-ink3">
                          {featured.time}
                        </span>
                      </div>

                      <h2 className="mt-3 font-display text-[clamp(24px,5.8vw,44px)] font-black leading-[1.08] tracking-[-0.015em]">
                        <RevealWords
                          text={featured.title}
                          baseDelay={200}
                          step={50}
                          renderWord={(w) => (/\d/.test(w) ? <Mark>{w}</Mark> : w)}
                        />
                      </h2>

                      {/* Tags temáticas dinâmicas e clicáveis da manchete principal */}
                      {featuredTags.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          {featuredTags.map((tag) => {
                            const isActive =
                              activeTag?.replace(/^#/, "").toLowerCase() ===
                              tag.replace(/^#/, "").toLowerCase();
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleTagClick(tag)}
                                className={cn(
                                  "inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] font-semibold transition-all cursor-pointer",
                                  isActive
                                    ? "bg-signal text-paper2 font-bold shadow-xs ring-1 ring-signal"
                                    : "bg-paper2 border border-rule text-ink2 hover:border-signal/50 hover:text-signal"
                                )}
                                title={`Filtrar feed por ${tag}`}
                              >
                                {tag.startsWith("#") ? tag : `#${tag}`}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-3">
                        <BiasBar story={featured} size="md" showLabels />
                      </div>

                      <p className="mt-3 max-w-prose text-[14.5px] leading-relaxed text-ink2 sm:text-[15.5px]">
                        {featured.summary}
                      </p>

                      {/* Consenso rápido */}
                      {featured.consensus.length > 0 && (
                        <div className="mt-3.5 rounded-md border-l-2 border-signal bg-paper2/70 p-3 text-[12.5px] leading-snug text-ink">
                          <span className="font-bold text-signal">Fato confirmado: </span>
                          {featured.consensus[0]}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-1.5">
                        {featured.coverage.map((c) => {
                          const o = outletById(c.outletId);
                          return (
                            <span
                              key={c.outletId}
                              title={o.name}
                              className="flex h-[20px] min-w-[28px] items-center justify-center rounded-[3px] px-1.5 text-[9px] font-bold tracking-wide text-paper2"
                              style={{ background: o.color }}
                            >
                              {o.short}
                            </span>
                          );
                        })}
                        <span className="ml-1 font-mono text-[11px] text-ink3">
                          {featured.coverage.length} veículos reportaram
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
                        <button
                          onClick={() => onCompare(featured.id)}
                          className="flex h-11 min-w-[160px] flex-1 items-center justify-center gap-2 rounded-md bg-ink px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-paper2 transition-colors hover:bg-signal sm:flex-none cursor-pointer"
                        >
                          <ICompare className="h-4 w-4" /> Comparar enquadramentos
                        </button>
                        <button
                          onClick={() => onRead(featured.id)}
                          className="flex h-11 min-w-[120px] flex-1 items-center justify-center gap-2 rounded-md border border-ink/30 px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink hover:bg-ink/5 sm:flex-none cursor-pointer"
                        >
                          <IReader className="h-4 w-4" /> Ler síntese
                        </button>
                        <button
                          onClick={() => onToggleSave(featured.id)}
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition-colors cursor-pointer",
                            saved.includes(featured.id)
                              ? "border-ink bg-ink text-paper2"
                              : "border-ink/25 text-ink2 hover:border-ink"
                          )}
                          aria-label={saved.includes(featured.id) ? "Remover dos salvos" : "Salvar para depois"}
                        >
                          <IBookmark className="h-4.5 w-4.5" filled={saved.includes(featured.id)} />
                        </button>
                      </div>
                    </div>

                    {featured.image && (
                      <figure className="min-w-0">
                        <div className="overflow-hidden border border-rule">
                          <img
                            src={featured.image}
                            alt={featured.caption ?? featured.title}
                            className="photo h-52 w-full object-cover sm:h-64 md:h-full md:max-h-[380px]"
                          />
                        </div>
                        {featured.caption && (
                          <figcaption className="mt-1.5 text-[11px] leading-snug text-ink3">
                            {featured.caption}
                          </figcaption>
                        )}
                      </figure>
                    )}
                  </article>
                </section>
              )}

              {/* Grade de matérias secundárias */}
              {gridStories.length > 0 && (
                <section className="mx-auto max-w-6xl px-3 pb-8 pt-6 sm:px-4">
                  <div className="mb-5 flex items-end justify-between gap-3 border-b border-rule pb-2">
                    <h3 className="font-display text-[20px] font-black sm:text-[22px]">
                      Pautas em Destaque{" "}
                      <span className="font-serif text-[14px] font-normal italic text-ink3">
                        — {gridStories.length} {gridStories.length === 1 ? "fato" : "fatos"}
                      </span>
                    </h3>
                  </div>

                  <div className="grid gap-x-8 gap-y-8 md:grid-cols-2">
                    {gridStories.map((s, i) => (
                      <Reveal key={s.id} delay={Math.min(i, 4) * 50}>
                        <GridCard
                          s={s}
                          isSaved={saved.includes(s.id)}
                          onToggleSave={() => onToggleSave(s.id)}
                          onCompare={() => onCompare(s.id)}
                          onRead={() => onRead(s.id)}
                          activeTag={activeTag}
                          onTagClick={handleTagClick}
                        />
                      </Reveal>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}

      {onLoadMore && (
        <div className="mx-auto flex max-w-6xl justify-center px-4 pt-6">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="border border-ink px-5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] hover:bg-ink hover:text-paper disabled:opacity-50"
          >
            {loadingMore ? "Carregando…" : "Carregar pautas anteriores"}
          </button>
        </div>
      )}

      {/* Colofão limpo */}
      <footer className="mx-auto max-w-6xl px-4 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/40 pt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-ink3">
          <span>PRISMA · Painel pessoal de leitura</span>
          <span>{storyTotal.toLocaleString("pt-BR")} pautas compiladas sem ruído editorial</span>
        </div>
      </footer>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   CARD DE RESUMO ULTRA-RÁPIDO (MÁXIMO 2 LINHAS)
   Mobile-First: toque rápido, leitura ágil, números destacados
   ──────────────────────────────────────────────────────────── */
function BriefCard({
  story,
  isSaved,
  onToggleSave,
  onCompare,
  onRead,
  activeTag,
  onTagClick,
}: {
  story: Story;
  isSaved: boolean;
  onToggleSave: () => void;
  onCompare: () => void;
  onRead: () => void;
  activeTag?: string | null;
  onTagClick?: (tag: string) => void;
}) {
  const briefText = story.briefSummary || story.title;
  const tags = getStoryTags(story);

  return (
    <article className="group py-4 transition-colors hover:bg-cream/50">
      {/* Linha 1: Assunto/Kicker, VerdictChip e horário */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="shrink-0 bg-ink px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-paper2">
            {story.theme}
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-signal">
            {story.kicker}
          </span>
          <VerdictChip story={story} />
        </div>
        <span className="font-mono text-[9.5px] font-medium text-ink3">
          {story.time}
        </span>
      </div>

      {/* Linha 2 & 3: O FATO CENTRAL EM ATÉ 2 LINHAS (com números grifados) */}
      <h3 className="mt-2 font-display text-[16px] sm:text-[17.5px] font-bold leading-[1.3] tracking-[-0.01em] text-ink transition-colors group-hover:text-signal">
        <button
          onClick={onRead}
          className="text-left w-full line-clamp-2 focus:outline-none cursor-pointer"
          title="Toque para abrir a síntese completa"
        >
          {markNumbers(briefText)}
        </button>
      </h3>

      {/* Tags temáticas dinâmicas e clicáveis */}
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {tags.map((tag) => {
            const isActive =
              activeTag?.replace(/^#/, "").toLowerCase() ===
              tag.replace(/^#/, "").toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className={cn(
                  "inline-flex items-center rounded px-2 py-0.5 font-mono text-[9.5px] font-semibold transition-all cursor-pointer",
                  isActive
                    ? "bg-signal text-paper2 font-bold shadow-xs ring-1 ring-signal"
                    : "bg-paper border border-rule/70 text-ink2 hover:border-signal/50 hover:text-signal hover:bg-paper2"
                )}
                title={`Filtrar feed por ${tag}`}
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </button>
            );
          })}
        </div>
      )}

      {/* Barra de viés segmentada (BiasBar) */}
      <div className="mt-2 max-w-sm">
        <BiasBar story={story} size="sm" />
      </div>

      {/* Linha de contexto complementar curta */}
      {story.consensus.length > 0 && story.consensus[0] !== briefText && (
        <p className="mt-1.5 line-clamp-1 text-[12px] text-ink2">
          <span className="font-semibold text-ink3">Convergência: </span>
          {story.consensus[0]}
        </p>
      )}

      {/* Rodapé: Fontes e Botões táteis no polegar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-rule/60 pt-2.5">
        {/* Badges dos veículos */}
        <div className="flex flex-wrap items-center gap-1">
          {story.coverage.slice(0, 6).map((c) => {
            const o = outletById(c.outletId);
            return (
              <span
                key={c.outletId}
                title={o.name}
                className="flex h-[18px] min-w-[24px] items-center justify-center rounded-[2px] px-1 text-[8.5px] font-bold tracking-tight text-paper2"
                style={{ background: o.color }}
              >
                {o.short}
              </span>
            );
          })}
          <span className="ml-1 font-mono text-[10px] text-ink3">
            {story.coverage.length} {story.coverage.length === 1 ? "fonte" : "fontes"}
          </span>
        </div>

        {/* Botões de Ação rápida */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onCompare}
            className="flex h-9 items-center gap-1 rounded border border-rule px-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink2 transition-colors hover:border-ink hover:text-ink active:bg-ink active:text-paper2 cursor-pointer"
            title="Comparar versões de cada veículo"
          >
            <ICompare className="h-3.5 w-3.5 text-signal" />
            <span>Comparar</span>
          </button>
          <button
            onClick={onRead}
            className="flex h-9 items-center gap-1 rounded bg-ink/5 px-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper2 active:bg-signal cursor-pointer"
            title="Abrir em modo leitor limpo"
          >
            <IReader className="h-3.5 w-3.5" />
            <span>Leitor</span>
          </button>
          <button
            onClick={onToggleSave}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded border transition-colors cursor-pointer",
              isSaved
                ? "border-ink bg-ink text-paper2"
                : "border-rule text-ink3 hover:border-ink hover:text-ink"
            )}
            aria-label={isSaved ? "Remover dos salvos" : "Salvar para depois"}
          >
            <IBookmark className="h-4 w-4" filled={isSaved} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────
   CARD DE GRADE CLÁSSICA DE JORNAL
   ──────────────────────────────────────────────────────────── */
function GridCard({
  s,
  isSaved,
  onToggleSave,
  onCompare,
  onRead,
  activeTag,
  onTagClick,
}: {
  s: Story;
  isSaved: boolean;
  onToggleSave: () => void;
  onCompare: () => void;
  onRead: () => void;
  activeTag?: string | null;
  onTagClick?: (tag: string) => void;
}) {
  const tags = getStoryTags(s);

  return (
    <article className="group border-t-2 border-ink pt-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Kicker>{s.kicker}</Kicker>
          <VerdictChip story={s} />
        </div>
        <span className="shrink-0 font-mono text-[10px] font-semibold text-ink3">
          {s.time}
        </span>
      </div>

      <h4 className="mt-2 font-display text-[18px] font-bold leading-snug tracking-[-0.01em] transition-colors group-hover:text-signal sm:text-[19px]">
        <button onClick={onRead} className="text-left w-full headline-link cursor-pointer">
          {markNumbers(s.title)}
        </button>
      </h4>

      {/* Tags temáticas dinâmicas e clicáveis */}
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {tags.map((tag) => {
            const isActive =
              activeTag?.replace(/^#/, "").toLowerCase() ===
              tag.replace(/^#/, "").toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className={cn(
                  "inline-flex items-center rounded px-2 py-0.5 font-mono text-[9.5px] font-semibold transition-all cursor-pointer",
                  isActive
                    ? "bg-signal text-paper2 font-bold shadow-xs ring-1 ring-signal"
                    : "bg-paper border border-rule/70 text-ink2 hover:border-signal/50 hover:text-signal hover:bg-paper2"
                )}
                title={`Filtrar feed por ${tag}`}
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </button>
            );
          })}
        </div>
      )}

      {s.image && (
        <div className="mt-3 overflow-hidden border border-rule">
          <img
            src={s.image}
            alt={s.caption ?? s.title}
            loading="lazy"
            className="photo h-36 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:h-40"
          />
        </div>
      )}

      <div className="mt-2.5">
        <BiasBar story={s} size="sm" />
      </div>

      <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-ink2">
        {s.summary}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {s.coverage.slice(0, 5).map((c) => {
          const o = outletById(c.outletId);
          return (
            <span
              key={c.outletId}
              title={o.name}
              className="flex h-[18px] min-w-[24px] items-center justify-center rounded-[2px] px-1 text-[8.5px] font-bold tracking-tight text-paper2"
              style={{ background: o.color }}
            >
              {o.short}
            </span>
          );
        })}
        <span className="ml-1 font-mono text-[10.5px] text-ink3">
          {s.coverage.length} veículos
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-medium text-ink3">
          <IClock className="h-3 w-3" /> {s.readTime} min
        </span>
      </div>

      <div className="mt-3.5 grid grid-cols-[1fr_1fr_40px] gap-2 border-t border-rule pt-2.5">
        <button
          onClick={onCompare}
          className="flex h-10 items-center justify-center gap-1.5 rounded-md border border-rule text-[10px] font-bold uppercase tracking-[0.1em] text-ink2 transition-colors hover:border-ink hover:text-ink cursor-pointer"
        >
          <ICompare className="h-3.5 w-3.5 text-signal" /> Comparar
        </button>
        <button
          onClick={onRead}
          className="flex h-10 items-center justify-center gap-1.5 rounded-md border border-rule text-[10px] font-bold uppercase tracking-[0.1em] text-ink2 transition-colors hover:border-ink hover:text-ink cursor-pointer"
        >
          <IReader className="h-3.5 w-3.5" /> Leitor
        </button>
        <button
          onClick={onToggleSave}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md border transition-colors cursor-pointer",
            isSaved ? "border-ink bg-ink text-paper2" : "border-rule text-ink3 hover:border-ink hover:text-ink"
          )}
          aria-label={isSaved ? "Remover dos salvos" : "Salvar para depois"}
        >
          <IBookmark className="h-4 w-4" filled={isSaved} />
        </button>
      </div>
    </article>
  );
}

function ThemePill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer",
        active
          ? "border-ink bg-ink text-paper2"
          : "border-rule bg-paper2 text-ink2 hover:border-ink/50 hover:text-ink"
      )}
      aria-pressed={active}
    >
      {label}
      <span className={cn("text-[9.5px] font-bold", active ? "text-highlight" : "text-ink3")}>
        {count}
      </span>
    </button>
  );
}

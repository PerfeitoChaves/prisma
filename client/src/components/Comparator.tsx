import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import {
  STORIES,
  SPECTRUM_ZONES,
  outletById,
  spectrumInfo,
  themeLabel,
  type Coverage,
  type Outlet,
  type Story,
} from "../data/news";
import {
  ICheck,
  IExternal,
  IQuote,
  IReader,
  ISlash,
  ITarget,
} from "./icons";
import { Kicker, OutletTag, SpectrumBadge, markNumbers, prefersReducedMotion } from "./ui";
import { FactSheet, VerdictChip, BiasBar } from "./PrismaComponents";

export default function Comparator({
  storyId,
  stories,
  onSelect,
  initialOutlet,
  onRead,
}: {
  storyId: string;
  stories?: Story[];
  onSelect: (id: string) => void;
  initialOutlet: string | null;
  onRead: (id: string) => void;
}) {
  const allStories = stories && stories.length > 0 ? stories : STORIES;
  const story = allStories.find((s) => s.id === storyId) ?? allStories[0];
  const [selected, setSelected] = useState<string | null>(initialOutlet);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const cards = story.coverage
    .map((c) => ({ c, o: outletById(c.outletId) }))
    .sort((a, b) => a.o.spectrum - b.o.spectrum);

  /* ao selecionar na bússola (mobile): desliza o carrossel até o cartão */
  useEffect(() => {
    if (!selected) return;
    const el = cardRefs.current[selected];
    if (!el) return;
    if (window.matchMedia("(min-width: 768px)").matches) return;
    el.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selected]);

  return (
    <div className="pb-28 md:pb-16">
      <section className="mx-auto max-w-6xl px-4 pt-6 md:pt-10">
        <Kicker>Comparador de enquadramentos</Kicker>
        <h2 className="mt-2 font-serif text-[clamp(26px,6vw,42px)] font-bold leading-[1.08] tracking-[-0.015em]">
          Onde cada redação <span className="italic text-press">encaixa</span> o mesmo fato
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink2">
          Escolha o fato, veja na régua onde cada redação se posiciona no espectro e compare
          manchetes, trechos literais e o que ficou de fora.
        </p>
      </section>

      {/* seletor de fato */}
      <div className="no-scrollbar mx-auto mt-6 flex max-w-6xl gap-2 overflow-x-auto px-4">
        {allStories.slice(0, 15).map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={cn(
              "flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 text-[12px] font-semibold transition-colors",
              s.id === story.id
                ? "border-ink bg-ink text-paper2"
                : "border-rule bg-paper2 text-ink2 hover:border-ink/50 hover:text-ink"
            )}
            aria-pressed={s.id === story.id}
          >
            <span
              className={cn(
                "font-serif italic",
                s.id === story.id ? "text-marker" : "text-ink3"
              )}
            >
              {themeLabel(s.theme)}
            </span>
            <span className="max-w-[220px] truncate">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Ficha de Apuração e Cabeçalho da Pauta */}
      <section className="mx-auto mt-6 max-w-6xl px-4">
        <div className="border border-line bg-cream p-4 sm:p-6 shadow-[6px_6px_0_0_rgba(23,20,16,0.9)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-signal">
              {themeLabel(story.theme)}
            </span>
            <VerdictChip story={story} />
            <span className="ml-auto font-mono text-[9.5px] uppercase tracking-wider text-ink3">
              {story.time} · {story.coverage.length} veículos apurados
            </span>
          </div>

          <h3 className="mt-3 font-display text-[22px] sm:text-[28px] font-black leading-snug text-ink">
            {markNumbers(story.title)}
          </h3>

          <p className="mt-2 text-[14px] leading-relaxed text-ink2">
            {story.summary}
          </p>

          <div className="mt-4">
            <BiasBar story={story} size="md" showLabels />
          </div>

          <div className="mt-5 border-t border-dashed border-rule pt-4">
            <FactSheet story={story} />
          </div>
        </div>
      </section>

      {/* bússola */}
      <section className="mx-auto mt-6 max-w-6xl px-4">
        <div className="rounded-lg border border-rule bg-paper2 p-4 md:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink2">
              Bússola de espectro editorial
            </p>
            <p className="hidden text-[10.5px] text-ink3 sm:block">
              posicionamento médio da redação nesta pauta
            </p>
          </div>

          <div className="relative mb-1 mt-9 h-[74px] select-none md:mt-8">
            {/* régua de zonas */}
            <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full opacity-90">
              <div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(90deg,#2456a6 0%,#4a7ab5 25%,#7d766c 50%,#b25b2e 75%,#a4252b 100%)",
                }}
              />
            </div>
            <div className="absolute left-1/2 top-1/2 h-7 w-px -translate-x-1/2 -translate-y-1/2 bg-ink/50" />

            {cards.map(({ o }, i) => {
              const sel = selected === o.id;
              const topRow = i % 2 === 0;
              return (
                <button
                  key={o.id}
                  onClick={() => setSelected(sel ? null : o.id)}
                  className="pointer-events-none absolute top-0 flex h-full w-11 -translate-x-1/2 flex-col items-center justify-center md:pointer-events-auto"
                  style={{ left: `${o.spectrum}%` }}
                  aria-label={`${o.name} — ${spectrumInfo(o.spectrum).label}`}
                  aria-pressed={sel}
                  title={`${o.name} · ${spectrumInfo(o.spectrum).label}`}
                >
                  {/* etiqueta (desktop) */}
                  <span
                    className={cn(
                      "absolute hidden items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-[9px] font-bold tracking-wide transition-colors md:flex",
                      topRow ? "top-0" : "bottom-0",
                      sel
                        ? "border-ink bg-ink text-paper2"
                        : "border-rule bg-paper2 text-ink2"
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: o.color }} />
                    {o.short}
                  </span>
                  {/* ponto */}
                  <span
                    className={cn(
                      "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-transform duration-300",
                      sel && "scale-150"
                    )}
                    style={{
                      background: o.color,
                      boxShadow: sel
                        ? "0 0 0 3px #fbfbfd, 0 0 0 5px #1d1a16"
                        : "0 0 0 3px #fbfbfd",
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* rótulos das zonas */}
          <div className="grid grid-cols-5">
            {SPECTRUM_ZONES.map((z, i) => (
              <div
                key={z.label}
                className={cn(
                  "border-t border-rule pt-1.5 text-[8.5px] font-semibold uppercase tracking-[0.08em] text-ink3 md:text-[9.5px]",
                  i === 0 ? "text-left" : i === 4 ? "text-right" : "text-center"
                )}
              >
                {z.label}
              </div>
            ))}
          </div>

          {/* seletor de toque (mobile) — alvos de 44px, na ordem do espectro */}
          <div className="mt-3 md:hidden">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.16em] text-ink3">
              <span>← esquerda</span>
              <span className="h-px flex-1 bg-rule" />
              <span>direita →</span>
            </div>
            <div className="no-scrollbar -mx-1 mt-2 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
              {cards.map(({ o }) => (
                <button
                  key={o.id}
                  onClick={() => setSelected(selected === o.id ? null : o.id)}
                  className={cn(
                    "flex min-h-[44px] shrink-0 snap-start items-center gap-2 rounded-full border px-4 text-[12px] font-bold transition-colors",
                    selected === o.id
                      ? "border-ink bg-ink text-paper2"
                      : "border-rule bg-paper2 text-ink2"
                  )}
                  aria-pressed={selected === o.id}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: o.color }} />
                  {o.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-rule pt-3 text-[11.5px]">
            <span className="font-medium text-ink2">
              {cards.length} redações cobriram este fato
            </span>
            {selected ? (
              <span className="font-bold text-ink">
                {outletById(selected).name} ·{" "}
                <span className="text-press">{spectrumInfo(outletById(selected).spectrum).label}</span>
              </span>
            ) : (
              <span className="text-ink3">
                <span className="md:hidden">toque em um veículo para localizar</span>
                <span className="hidden md:inline">toque em um ponto da régua para localizar a cobertura</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* cartões de comparação: carrossel no celular, grade no desktop */}
      <section className="mx-auto mt-6 max-w-6xl px-4">
        <div className="mb-2 flex items-center justify-between md:hidden">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink3">
            arraste para comparar
          </p>
          <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink3">
            {cards.length} redações
            <span className="text-press">›</span>
          </p>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 no-scrollbar md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0">
          {cards.map(({ c, o }) => (
            <div
              key={o.id}
              ref={(el) => {
                cardRefs.current[o.id] = el;
              }}
              className={cn("w-[86%] shrink-0 snap-center md:w-auto", "animate-fade-up")}
            >
              <CoverageCard c={c} o={o} highlighted={selected === o.id} onRead={() => onRead(story.id)} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA do modo leitor */}
      <section className="mx-auto mt-2 max-w-6xl px-4">
        <div className="flex flex-col items-start gap-3 border-t-2 border-ink pt-5 sm:flex-row sm:items-center">
          <button
            onClick={() => onRead(story.id)}
            className="flex h-12 items-center gap-2 rounded-md bg-press px-5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-paper2 transition-colors hover:bg-ink"
          >
            <ITarget className="h-4.5 w-4.5" /> Abrir modo leitor imparcial
          </button>
          <p className="text-[12.5px] leading-relaxed text-ink2">
            Consenso factual, choque de narrativas e o ponto cego comum —{" "}
            <MarkInline>{markNumbers(`a análise completa em ${story.readTime} min`)}</MarkInline>
          </p>
        </div>
      </section>
    </div>
  );
}

function MarkInline({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-ink">{children}</span>;
}

/* ---------- cartão de cobertura (compartilhado com o Modo Leitor) ---------- */
export function CoverageCard({
  c,
  o,
  highlighted,
  onRead,
}: {
  c: Coverage;
  o: Outlet;
  highlighted?: boolean;
  onRead?: () => void;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-lg border bg-paper2 p-4 transition-all duration-300 md:p-5",
        highlighted
          ? "-translate-y-1 border-ink shadow-[0_20px_44px_-24px_rgba(29,26,22,0.5)]"
          : "border-rule"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 min-w-[34px] shrink-0 items-center justify-center rounded-[4px] px-1.5 text-[11px] font-bold text-paper2"
              style={{ background: o.color }}
            >
              {o.short}
            </span>
            <span className="truncate font-serif text-[17px] font-bold leading-none">{o.name}</span>
            {o.flag && (
              <span className="text-base select-none shrink-0" title={`Origem: ${o.country || ""}`}>
                {o.flag}
              </span>
            )}
          </div>
          <div className="mt-2 h-[3px] w-9 rounded-full" style={{ background: o.color }} />
        </div>
        <SpectrumBadge value={o.spectrum} />
      </div>

      <p className="mt-3.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-ink3">
        Enquadramento ·{" "}
        <span className="font-serif text-[14px] font-medium normal-case italic text-ink2">
          “{c.framing}”
        </span>
      </p>

      <blockquote className="mt-3 font-serif text-[18px] font-semibold leading-snug tracking-[-0.005em] md:text-[19px]">
        <span className="text-press">“</span>
        {c.headline}
        <span className="text-press">”</span>
      </blockquote>

      <div
        className="mt-4 rounded-md border-l-[3px] bg-cream p-3.5"
        style={{ borderLeftColor: o.color }}
      >
        <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-ink3">
          <IQuote className="h-3 w-3" /> Trecho literal da matéria
        </p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink2">{c.quote}</p>
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-leaf">
            O que destacou
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {c.emphasized.map((e) => (
              <li key={e} className="flex gap-2 text-[13.5px] leading-snug text-ink2">
                <ICheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-leaf" />
                {e}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-press">
            O que ficou de fora
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {c.omitted.map((e) => (
              <li key={e} className="flex gap-2 text-[13.5px] leading-snug text-ink2">
                <ISlash className="mt-0.5 h-3.5 w-3.5 shrink-0 text-press" />
                {e}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-rule pt-4">
        <a
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md bg-ink text-[10.5px] font-bold uppercase tracking-[0.1em] text-paper2 transition-colors hover:bg-press"
        >
          Abrir matéria <IExternal className="h-3.5 w-3.5" />
        </a>
        {onRead && (
          <button
            onClick={onRead}
            className="flex h-11 items-center justify-center gap-1.5 rounded-md border border-rule px-3.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink2 transition-colors hover:border-ink hover:text-ink"
          >
            <IReader className="h-4 w-4" />
          </button>
        )}
        <span className="shrink-0 text-[10px] font-medium text-ink3">{c.published}</span>
      </div>

      <p className="sr-only">
        <OutletTag o={o} showName />
      </p>
    </article>
  );
}

export { Comparator };


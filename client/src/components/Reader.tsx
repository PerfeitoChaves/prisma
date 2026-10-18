import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { SPECTRUM_ZONES, outletById, spectrumInfo, themeLabel, type Story } from "../data/news";
import { CoverageCard } from "./Comparator";
import { IArrowLeft, IBolt, IBookmark, ICompare, IEye, ITarget } from "./icons";
import { markNumbers, prefersReducedMotion } from "./ui";

const SCALES = [0.95, 1.05, 1.15, 1.25];

export default function Reader({
  story,
  onClose,
  fontStep,
  onFontStep,
  onCompare,
  isSaved,
  onToggleSave,
}: {
  story: Story;
  onClose: () => void;
  fontStep: number;
  onFontStep: (step: number) => void;
  onCompare: (id: string) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const scale = SCALES[Math.min(fontStep, SCALES.length - 1)];

  useEffect(() => {
    const el = scrollRef.current;
    el?.scrollTo({ top: 0 });
    setProgress(0);
  }, [story.id]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-paper" role="dialog" aria-modal="true" aria-label={`Modo leitor — ${story.kicker}`}>
      {/* progresso de leitura */}
      <div className="absolute inset-x-0 top-0 z-20 h-[3px] bg-rule">
        <div
          className="h-full bg-press transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* cabeçalho do modo leitor */}
      <header className="glass z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-rule px-2 md:px-4">
        <button
          onClick={onClose}
          className="flex h-11 items-center gap-1.5 rounded-lg pl-2 pr-3 text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink2 transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <IArrowLeft className="h-4 w-4" /> Voltar
        </button>

        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden shrink-0 text-[9.5px] font-bold uppercase tracking-[0.2em] text-press sm:block">
            Modo leitor
          </span>
          <span className="truncate font-serif text-[14px] font-semibold text-ink2">
            {story.kicker}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onFontStep(Math.max(0, fontStep - 1))}
            disabled={fontStep === 0}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink2 transition-colors hover:bg-ink/5 disabled:opacity-30"
            aria-label="Diminuir tamanho da fonte"
          >
            <span className="font-serif text-[13px] font-bold">A</span>
            <span className="ml-0.5 text-[11px] font-bold">−</span>
          </button>
          <span className="w-10 text-center text-[10.5px] font-semibold tabular-nums text-ink3">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => onFontStep(Math.min(SCALES.length - 1, fontStep + 1))}
            disabled={fontStep === SCALES.length - 1}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink2 transition-colors hover:bg-ink/5 disabled:opacity-30"
            aria-label="Aumentar tamanho da fonte"
          >
            <span className="font-serif text-[15px] font-bold">A</span>
            <span className="ml-0.5 text-[11px] font-bold">+</span>
          </button>
          <span className="mx-1 h-6 w-px bg-rule" />
          <button
            onClick={() => onToggleSave(story.id)}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-ink/5",
              isSaved ? "text-ink" : "text-ink3"
            )}
            aria-label={isSaved ? "Remover dos salvos" : "Salvar para depois"}
          >
            <IBookmark className="h-5 w-5" filled={isSaved} />
          </button>
        </div>
      </header>

      {/* conteúdo rolagem */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto overscroll-contain">
        <article className="mx-auto max-w-[760px] px-5 py-8 md:py-10" style={{ fontSize: `${16 * scale}px` }}>
          <p className="text-[0.66em] font-bold uppercase tracking-[0.22em] text-press">
            Análise imparcial · {themeLabel(story.theme)}
          </p>

          <h1 className="mt-3 font-serif text-[1.52em] font-bold leading-[1.14] tracking-[-0.01em] sm:text-[1.72em]">
            {markNumbers(story.title)}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.82em] font-medium text-ink3">
            <span>hoje · {story.time}</span>
            <span>{story.readTime} min de leitura</span>
            <span>
              {story.coverage.length} veículos · {story.coverage.length} trechos verbatim
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y-2 border-ink py-3">
            <span className="inline-flex items-center gap-2 text-[0.7em] font-bold uppercase tracking-[0.16em]">
              <span className="animate-pulse-soft h-2 w-2 rounded-full bg-marker" />
              {story.stamp}
            </span>
            <span className="text-[0.7em] font-semibold uppercase tracking-[0.16em] text-ink3">
              leitura guiada em 3 blocos
            </span>
          </div>

          {story.image && (
            <figure className="mt-6">
              <img
                src={story.image}
                alt={story.caption ?? story.title}
                className="photo h-auto w-full border border-rule object-cover"
              />
              {story.caption && (
                <figcaption className="mt-2 text-[0.72em] leading-snug text-ink3">
                  <span className="font-bold uppercase tracking-[0.14em] text-ink2">Foto</span>{" "}
                  {story.caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* ── bloco 1 · consenso ── */}
          <section className="mt-11">
            <SectionHead
              icon={<ITarget className="h-5 w-5" />}
              title="Consenso factual"
              sub="o que todas as redações confirmam"
            />
            <ol className="mt-5">
              {story.consensus.map((t, i) => (
                <li key={i} className="flex gap-4 border-b border-rule py-4">
                  <span className="font-serif text-[1.02em] font-bold italic leading-none text-press">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[0.95em] leading-relaxed text-ink">{markNumbers(t)}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* ── bloco 2 · divergências ── */}
          <section className="mt-11">
            <SectionHead
              icon={<IBolt className="h-5 w-5" />}
              title="Onde as versões divergem"
              sub="choque de narrativas editoriais"
            />
            <div className="mt-4 space-y-7">
              {story.divergences.map((d, i) => (
                <div key={i}>
                  <h3 className="font-serif text-[1.05em] font-semibold italic leading-snug">
                    Divergência {String(i + 1).padStart(2, "0")}{" "}
                    <span className="not-italic text-ink3">—</span> {d.point}
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {d.positions.map((p) => {
                      const o = outletById(p.outletId);
                      const z = spectrumInfo(o.spectrum);
                      return (
                        <div key={p.outletId} className="rounded-md border border-rule bg-paper2 p-3.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="flex h-[18px] min-w-[28px] items-center justify-center rounded-[3px] px-1 text-[0.55em] font-bold text-paper2"
                              style={{ background: o.color }}
                            >
                              {o.short}
                            </span>
                            <span className="text-[0.7em] font-semibold text-ink2">{o.name}</span>
                            <span
                              className="ml-auto text-[0.6em] font-bold uppercase tracking-[0.1em]"
                              style={{ color: SPECTRUM_ZONES[z.zone].color }}
                            >
                              {z.label}
                            </span>
                          </div>
                          <p className="mt-2 text-[0.85em] leading-relaxed text-ink2">{p.take}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── bloco 3 · ponto cego ── */}
          <section className="mt-11">
            <SectionHead
              icon={<IEye className="h-5 w-5" />}
              title="Ponto cego comum"
              sub="o que nenhuma redação apurou"
            />
            <div className="mt-5 rounded-md border-l-4 border-inkblue bg-[#edf1f8] p-5">
              <p className="text-[0.95em] leading-relaxed text-ink">{story.blindSpot}</p>
              <p className="mt-3.5 text-[0.66em] font-bold uppercase tracking-[0.18em] text-inkblue">
                0 de {story.coverage.length} veículos trataram desse ponto
              </p>
            </div>
          </section>

          {/* ── redação por redação ── */}
          <section className="mt-12">
            <h3 className="font-serif text-[1.3em] font-bold leading-tight">
              Redação por redação
            </h3>
            <p className="mt-1.5 text-[0.8em] leading-relaxed text-ink2">
              Manchetes originais, trechos literais publicados e o que ficou de fora em cada
              cobertura.
            </p>
            <div className="mt-5 space-y-4">
              {story.coverage.map((c) => (
                <CoverageCard key={c.outletId} c={c} o={outletById(c.outletId)} />
              ))}
            </div>
          </section>

          {/* ── encerramento ── */}
          <div className="mt-14 border-t-2 border-ink pb-8 pt-6 text-center">
            <p className="text-[0.66em] font-bold uppercase tracking-[0.2em] text-ink3">
              ■ fim da análise — {story.coverage.length} veículos ·{" "}
              {story.coverage.length} trechos verificados
            </p>
            <button
              onClick={() => onCompare(story.id)}
              className="mt-5 inline-flex h-12 items-center gap-2 border border-ink px-5 text-[0.7em] font-bold uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-paper2"
            >
              <ICompare className="h-4 w-4" /> Ver lado a lado no comparador
            </button>
            <div className="mt-4">
              <button
                onClick={() =>
                  scrollRef.current?.scrollTo({
                    top: 0,
                    behavior: prefersReducedMotion() ? "auto" : "smooth",
                  })
                }
                className="text-[0.7em] font-semibold uppercase tracking-[0.14em] text-ink3 underline underline-offset-4 hover:text-ink"
              >
                ↑ voltar ao topo
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function SectionHead({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink text-marker">
        {icon}
      </span>
      <div>
        <h2 className="font-serif text-[1.28em] font-bold leading-tight">{title}</h2>
        <p className="mt-0.5 text-[0.68em] font-semibold uppercase tracking-[0.14em] text-ink3">
          {sub}
        </p>
      </div>
    </div>
  );
}

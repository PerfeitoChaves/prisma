import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { SPECTRUM_ZONES, outletById, spectrumInfo, type Outlet } from "../data/news";

/* ---------- persistência local ---------- */
export function loadLS<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------- revelação ao entrar na viewport ---------- */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setVis(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVis(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, vis };
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, vis } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn("reveal", vis && "on", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* ---------- marca-texto orgânico ---------- */
export function Mark({
  children,
  tone = "yellow",
  on = true,
  className,
}: {
  children: ReactNode;
  tone?: "yellow" | "blue";
  on?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "marker",
        tone === "blue" && "marker-blue",
        on && "on",
        "px-[0.12em]",
        className
      )}
    >
      {children}
    </span>
  );
}

const NUM_RE =
  /\b(R\$\s?\d[\d.,]*|\d+(?:[.,]\d+)?\s?(?:%|a\.a\.|p\.p\.|pts|mil|bi|min|h)?|\d{1,2}\s+a\s+\d{1,2})\b/g;

/** destaca números-chave com o marcador amarelo */
export function markNumbers(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  NUM_RE.lastIndex = 0;
  while ((m = NUM_RE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    out.push(<Mark key={k++}>{tok}</Mark>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/* ---------- revelação de manchete, palavra a palavra (máscara de linha) ---------- */
export function RevealWords({
  text,
  className,
  baseDelay = 0,
  step = 55,
  renderWord,
}: {
  text: string;
  className?: string;
  baseDelay?: number;
  step?: number;
  renderWord?: (w: string, i: number) => ReactNode;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="word-mask">
            <span className="word-rise" style={{ animationDelay: `${baseDelay + i * step}ms` }}>
              {renderWord ? renderWord(w, i) : w}
            </span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

/* ---------- título com efeito scramble/decodificação ---------- */
export function Scramble({
  text,
  className,
  delay = 0,
  duration = 950,
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setOut(text);
      return;
    }
    const chars = "§#%&/\\ABCDEFGHIKLMNOPRSTUVXZ";
    let raf = 0;
    const t0 = performance.now() + delay;
    const tick = (now: number) => {
      if (now < t0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, (now - t0) / duration);
      const fixed = Math.floor(p * text.length);
      let s = text.slice(0, fixed);
      for (let i = fixed; i < text.length; i++) {
        s += chars[(i * 7 + Math.floor(now / 40) * 3) % chars.length];
      }
      setOut(p < 1 ? s : text);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, delay, duration]);
  return (
    <span className={className} aria-label={text}>
      {out}
    </span>
  );
}

/* ---------- etiquetas de veículo e espectro ---------- */
export function OutletTag({
  o,
  showName = false,
  className,
}: {
  o: Outlet;
  showName?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="flex h-[18px] min-w-[27px] items-center justify-center rounded-[3px] px-1 font-sans text-[9px] font-bold tracking-wide text-paper2"
        style={{ background: o.color }}
      >
        {o.short}
      </span>
      {showName && <span className="text-[11px] font-medium text-ink2">{o.name}</span>}
    </span>
  );
}

export function SpectrumBadge({ value, className }: { value: number; className?: string }) {
  const { label, zone } = spectrumInfo(value);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rule bg-paper px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink2",
        className
      )}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: SPECTRUM_ZONES[zone].color }} />
      {label}
    </span>
  );
}

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-[10.5px] font-bold uppercase tracking-[0.18em] text-press",
        className
      )}
    >
      {children}
    </p>
  );
}

export function VerifiedStamp({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-paper2",
        className
      )}
    >
      <span className="animate-pulse-soft h-1.5 w-1.5 rounded-full bg-marker" />
      {text}
    </span>
  );
}

export const isMac =
  typeof navigator !== "undefined" && /mac/i.test(navigator.platform || navigator.userAgent);

export const kbdKey = isMac ? "⌘K" : "Ctrl K";

export const outletOf = outletById;

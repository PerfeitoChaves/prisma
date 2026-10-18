import { Scale, Eye, EyeOff, Newspaper, Layers, Gauge, Hourglass, FileText, CalendarClock } from "lucide-react";
import {
  BIAS_COLORS,
  BIAS_LABELS,
  BIAS_ORDER,
  coverageVerdict,
  storyDistribution,
  computeBalanceScore,
  balanceLabel,
  type BiasSlice,
} from "../utils/prismaCoverage";
import type { Story } from "../data/news";

/* ── Logotipo do PRISMA (feixe de luz refratando nas cores do espectro) ── */
export function PrismaLogo({ size = 42 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.72}
      viewBox="0 0 72 52"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      {/* feixe de luz que entra */}
      <line x1="0" y1="28" x2="18" y2="28" stroke="currentColor" strokeWidth="3" />
      {/* prisma */}
      <path
        d="M30 6 L48 44 L12 44 Z"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* espectro que sai */}
      <line x1="38" y1="26" x2="71" y2="10" stroke="#C1272D" strokeWidth="3.5" />
      <line x1="39" y1="30" x2="71" y2="26" stroke="#8E887C" strokeWidth="3.5" />
      <line x1="40" y1="34" x2="71" y2="42" stroke="#2B50AA" strokeWidth="3.5" />
    </svg>
  );
}

/* ── Ponto do espectro ── */
export function BiasDot({ bias, size = 8 }: { bias: number; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full ring-1 ring-ink/20"
      style={{ width: size, height: size, backgroundColor: BIAS_COLORS[bias] }}
    />
  );
}

/* ── Barra segmentada de espectro da história ── */
export function BiasBar({
  story,
  slices,
  size = "md",
  showLabels = false,
}: {
  story?: Story;
  slices?: BiasSlice[];
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}) {
  const data: BiasSlice[] =
    slices ??
    (story
      ? storyDistribution(story)
      : BIAS_ORDER.map((bias) => ({ bias, count: 0, pct: 0 })));

  const total = data.reduce((acc, s) => acc + s.count, 0);
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" } as const;

  return (
    <div>
      <div
        className={`flex w-full overflow-hidden rounded-[2px] bg-paper-deep ring-1 ring-ink/10 ${heights[size]}`}
        role="img"
        aria-label={data.map((s) => `${BIAS_LABELS[s.bias]}: ${s.pct}%`).join(", ")}
      >
        {total === 0 ? (
          <div className="w-full bg-paper-deep" />
        ) : (
          data.map((s) =>
            s.count > 0 ? (
              <div
                key={s.bias}
                style={{
                  flexGrow: s.count,
                  flexBasis: 0,
                  backgroundColor: BIAS_COLORS[s.bias],
                }}
                title={`${BIAS_LABELS[s.bias]} — ${s.count} matéria(s) · ${s.pct}%`}
                className="h-full transition-all duration-300"
              />
            ) : null
          )
        )}
      </div>
      {showLabels && (
        <div className="mt-1 flex w-full font-mono text-[9px] uppercase tracking-wider text-ink3">
          {data.map((s) =>
            s.count > 0 ? (
              <div
                key={s.bias}
                style={{ flexGrow: s.count, flexBasis: 0 }}
                className="text-center first:text-left last:text-right"
              >
                <span style={{ color: BIAS_COLORS[s.bias] }} className="font-bold">
                  {s.pct}%
                </span>{" "}
                <span className="hidden sm:inline">{BIAS_LABELS[s.bias]}</span>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

/* ── Selo de veredicto editorial (VerdictChip) ── */
export function VerdictChip({ story }: { story: Story }) {
  const v = coverageVerdict(story);
  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider";
  const tones: Record<string, string> = {
    balanced: "bg-emerald-800 text-emerald-50",
    left: "bg-signal text-white",
    right: "bg-[#2B50AA] text-white",
    single: "border border-dashed border-ink3 text-ink2",
    partial: "bg-paper-deep text-ink2 border border-rule",
  };
  const Icon =
    v.tone === "balanced" ? Scale : v.tone === "single" ? Eye : EyeOff;

  return (
    <span className={`${base} ${tones[v.tone]}`} title={`${v.detail} ${v.readingTip}`}>
      <Icon className="h-3 w-3" />
      {v.label}
    </span>
  );
}

/* ── Termômetro das 24h (SpectrumLegend) ── */
export function SpectrumLegend({ counts }: { counts?: Record<number, number> }) {
  const total = counts
    ? Math.max(1, BIAS_ORDER.reduce<number>((acc, b) => acc + (counts[b] ?? 0), 0))
    : 0;

  return (
    <div className="rounded-md border border-rule bg-paper2 p-3">
      <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-ink">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-signal animate-pulse-soft" />
          Termômetro do Espectro Editorial (24h)
        </span>
        <span className="font-mono text-ink3">{total} matérias no acervo</span>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-[2px] ring-1 ring-ink/15">
        {BIAS_ORDER.map((bias) => (
          <div
            key={bias}
            style={{
              backgroundColor: BIAS_COLORS[bias],
              flexGrow: counts ? Math.max(0.4, counts[bias] ?? 0) : 1,
              flexBasis: 0,
            }}
            title={`${BIAS_LABELS[bias]}${counts ? ` — ${counts[bias] ?? 0} matérias` : ""}`}
          />
        ))}
      </div>

      <div className="mt-1.5 flex w-full font-mono text-[9px] uppercase tracking-wider text-ink3 sm:text-[10px]">
        {BIAS_ORDER.map((bias) => {
          const count = counts ? counts[bias] ?? 0 : 0;
          const pct = counts ? Math.round((count / total) * 100) : 0;
          return (
            <div
              key={bias}
              style={{
                flexGrow: counts ? Math.max(0.4, count) : 1,
                flexBasis: 0,
              }}
              className="text-center first:text-left last:text-right"
            >
              <span className="hidden sm:inline">{BIAS_LABELS[bias]}</span>
              <span className="sm:hidden">
                {bias === -2 ? "Esq." : bias === -1 ? "C-esq." : bias === 0 ? "Centro" : bias === 1 ? "C-dir." : "Dir."}
              </span>
              {counts && (
                <span className="block font-bold text-ink sm:inline sm:pl-1">
                  {pct}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Ficha de apuração da história (FactSheet) ── */
export function FactSheet({ story }: { story: Story }) {
  const slices = storyDistribution(story);
  const left = (slices.find((s) => s.bias === -2)?.count ?? 0) + (slices.find((s) => s.bias === -1)?.count ?? 0);
  const center = slices.find((s) => s.bias === 0)?.count ?? 0;
  const right = (slices.find((s) => s.bias === 1)?.count ?? 0) + (slices.find((s) => s.bias === 2)?.count ?? 0);
  const score = computeBalanceScore(left, center, right);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard
        icon={Newspaper}
        label="Matérias"
        value={String(story.coverage.length)}
        hint="veículos cruzados"
      />
      <StatCard
        icon={Layers}
        label="Fontes distintas"
        value={String(story.coverage.length)}
        hint={`${slices.filter((d) => d.count > 0).length} de 5 faixas`}
      />
      <StatCard
        icon={Gauge}
        label="Equilíbrio"
        value={`${score}/100`}
        hint={balanceLabel(score)}
      />
      <StatCard
        icon={Hourglass}
        label="Tempo de leitura"
        value={`${story.readTime} min`}
        hint="síntese direta"
      />
      <StatCard
        icon={FileText}
        label="Com consenso"
        value={story.consensus.length > 0 ? "Sim" : "Em aberto"}
        hint={`${story.consensus.length} pontos convergentes`}
      />
      <StatCard
        icon={CalendarClock}
        label="Atualizada"
        value={story.time}
        hint="edição de hoje"
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border border-line bg-cream p-3 sm:p-4">
      <p className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-ink3">
        <Icon className="h-3.5 w-3.5 text-signal" />
        {label}
      </p>
      <p className="mt-1.5 font-display text-xl sm:text-2xl font-black leading-none text-ink">{value}</p>
      {hint && <p className="mt-1 text-[10.5px] leading-snug text-ink3">{hint}</p>}
    </div>
  );
}

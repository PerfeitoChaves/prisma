import { useEffect, useMemo, useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";

/* Observatório de viés: estatísticas de todo o acervo coletado (GET ./api/stats, Worker + D1) */

type Spectrum = "left" | "center-left" | "center" | "center-right" | "right";

type SourceStat = {
  source_id: string;
  source_name: string;
  spectrum: Spectrum;
  articles: number;
  stories: number;
  subjectivity: number;
  loaded_rate: number;
  sensational_rate: number;
  exclusive_rate: number;
  agenda_lean?: number;
  shared_stories?: number;
  agenda_divergence: number;
};

type StatsPayload = {
  computed_at: string;
  totals: { articles: number; stories: number; sources: number; first: string; last: string };
  by_spectrum: { spectrum: Spectrum; articles: number; stories: number; subjectivity: number; loaded_rate: number; sensational_rate: number }[];
  coverage: { kind: string; stories: number }[];
  sources: SourceStat[];
  loaded_words: { side: "esquerda" | "centro" | "direita"; word: string; n: number }[];
};

const SPECTRA: { id: Spectrum; label: string; color: string; value: number }[] = [
  { id: "left", label: "Esquerda", color: "var(--color-bias-el)", value: -2 },
  { id: "center-left", label: "Centro-esq.", color: "var(--color-bias-cl)", value: -1 },
  { id: "center", label: "Centro", color: "var(--color-bias-c)", value: 0 },
  { id: "center-right", label: "Centro-dir.", color: "var(--color-bias-cr)", value: 1 },
  { id: "right", label: "Direita", color: "var(--color-bias-r)", value: 2 },
];
const SPEC = Object.fromEntries(SPECTRA.map((s) => [s.id, s]));

const COVERAGE_LABELS: Record<string, string> = {
  both_sides: "Cobertas pelos dois lados",
  left_only: "Só esquerda / centro-esq.",
  right_only: "Só direita / centro-dir.",
  center_mixed: "Centro + um dos lados",
  single: "Um único veículo",
};

const MIN_ARTICLES = 20; // amostra mínima para entrar nos rankings

const pct = (v: number) => `${Math.round((v ?? 0) * 100)}%`;
const fmt = (v: number, d = 2) => (v ?? 0).toFixed(d).replace(".", ",");
const int = (v: number) => (v ?? 0).toLocaleString("pt-BR");

function zscores(values: number[]) {
  const m = values.reduce((a, b) => a + b, 0) / (values.length || 1);
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - m) ** 2, 0) / (values.length || 1)) || 1;
  return values.map((v) => (v - m) / sd);
}

function leanLabel(v: number) {
  if (v <= -0.6) return "puxa à esquerda";
  if (v <= -0.2) return "levemente à esquerda";
  if (v < 0.2) return "equilibrado";
  if (v < 0.6) return "levemente à direita";
  return "puxa à direita";
}

function SectionTitle({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4 border-b border-rule pb-2">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-press">{kicker}</div>
      <h2 className="font-display text-[20px] font-black sm:text-[22px]">{title}</h2>
      {children && <p className="mt-1 max-w-3xl text-[13px] text-ink2">{children}</p>}
    </div>
  );
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-2.5 w-full bg-paper-deep">
      <div className="h-full" style={{ width: `${Math.min(100, (value / (max || 1)) * 100)}%`, background: color }} />
    </div>
  );
}

/* Barra divergente: -2 (esquerda) … 0 … +2 (direita) */
function LeanBar({ value }: { value: number }) {
  const w = Math.min(50, (Math.abs(value) / 2) * 50);
  const color = value < 0 ? "var(--color-bias-el)" : "var(--color-bias-r)";
  return (
    <div className="relative h-2.5 w-full bg-paper-deep">
      <div className="absolute inset-y-0 left-1/2 w-px bg-ink3" />
      <div className="absolute inset-y-0" style={{ width: `${w}%`, background: color, left: value < 0 ? `${50 - w}%` : "50%" }} />
    </div>
  );
}

type SortKey = "articles" | "subjectivity" | "sensational_rate" | "exclusive_rate" | "agenda_lean" | "agenda_divergence";

export default function StatsView() {
  const [data, setData] = useState<StatsPayload | null>(null);
  const [error, setError] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("articles");

  useEffect(() => {
    fetch("./api/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const eligible = useMemo(() => (data?.sources ?? []).filter((s) => s.articles >= MIN_ARTICLES), [data]);

  /* "Destoa": média dos z-scores positivos de subjetividade, exclusividade e divergência de pauta */
  const outliers = useMemo(() => {
    const metrics = [
      { key: "subjectivity" as const, label: "linguagem carregada" },
      { key: "exclusive_rate" as const, label: "pautas que ninguém mais cobre" },
      { key: "agenda_divergence" as const, label: "mix de editorias atípico" },
    ];
    const z = metrics.map((m) => zscores(eligible.map((s) => s[m.key] ?? 0)));
    return eligible
      .map((s, i) => {
        const parts = metrics.map((m, j) => ({ label: m.label, z: z[j][i] }));
        const score = parts.reduce((a, p) => a + Math.max(0, p.z), 0) / parts.length;
        const top = [...parts].sort((a, b) => b.z - a.z)[0];
        return { s, score, reason: top.label, z: top.z };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [eligible]);

  const byLean = useMemo(
    () => eligible.filter((s) => (s.shared_stories ?? 0) >= 10).sort((a, b) => (a.agenda_lean ?? 0) - (b.agenda_lean ?? 0)),
    [eligible]
  );

  const sorted = useMemo(
    () => [...(data?.sources ?? [])].sort((a, b) => ((b[sortKey] ?? 0) as number) - ((a[sortKey] ?? 0) as number)),
    [data, sortKey]
  );

  if (error)
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center font-serif italic text-ink3">
        Estatísticas indisponíveis fora de pchaves.org/prisma.
      </div>
    );
  if (!data)
    return (
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-16 font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
        <RefreshCw className="h-4 w-4 animate-spin" /> Calculando acervo…
      </div>
    );

  const specRows = SPECTRA.map((sp) => ({ sp, row: data.by_spectrum.find((r) => r.spectrum === sp.id) }));
  const totalArticles = data.totals.articles || 1;
  const maxSubj = Math.max(...data.by_spectrum.map((r) => r.subjectivity), 0.0001);
  const maxSens = Math.max(...data.by_spectrum.map((r) => r.sensational_rate), 0.0001);
  const coverageTotal = data.coverage.reduce((a, c) => a + c.stories, 0) || 1;
  const words = (side: string) => data.loaded_words.filter((w) => w.side === side).slice(0, 14);
  const mostLoadedSide = [...data.by_spectrum].sort((a, b) => b.subjectivity - a.subjectivity)[0];

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 md:px-4 md:py-8">
      <div className="mb-8 border-b border-rule pb-5">
        <span className="inline-flex h-6 items-center gap-1.5 rounded bg-press/10 px-2 font-mono text-[11px] font-bold uppercase tracking-wider text-press">
          <BarChart3 className="h-3.5 w-3.5" /> Acervo completo
        </span>
        <h1 className="mt-1.5 font-display text-2xl font-black tracking-tight md:text-3xl">Observatório de Viés</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink2">
          {int(data.totals.articles)} matérias de {data.totals.sources} veículos, agrupadas em {int(data.totals.stories)} pautas,
          desde {new Date(data.totals.first).toLocaleDateString("pt-BR")}. Recalculado em{" "}
          {new Date(data.computed_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.
        </p>
      </div>

      {/* 1. Panorama por espectro */}
      <section className="mb-10">
        <SectionTitle kicker="Panorama" title="Quanto cada lado publica e com que tom">
          Subjetividade = densidade de palavras carregadas no título/resumo (0 a 1). O lado com linguagem mais carregada hoje é{" "}
          <strong>{SPEC[mostLoadedSide?.spectrum]?.label ?? "—"}</strong>.
        </SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13px]">
            <thead className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink3">
              <tr className="text-left">
                <th className="py-2 pr-3">Espectro</th>
                <th className="py-2 pr-3">Fatia das matérias</th>
                <th className="py-2 pr-3">Subjetividade média</th>
                <th className="py-2">Sensacionalismo</th>
              </tr>
            </thead>
            <tbody>
              {specRows.map(({ sp, row }) => (
                <tr key={sp.id} className="border-t border-rule">
                  <td className="py-2.5 pr-3 font-bold">
                    <span className="mr-2 inline-block h-2.5 w-2.5" style={{ background: sp.color }} />
                    {sp.label}
                  </td>
                  <td className="py-2.5 pr-3">
                    <Bar value={row?.articles ?? 0} max={totalArticles} color={sp.color} />
                    <span className="font-mono text-[11px] text-ink3">
                      {pct((row?.articles ?? 0) / totalArticles)} · {int(row?.articles ?? 0)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <Bar value={row?.subjectivity ?? 0} max={maxSubj} color={sp.color} />
                    <span className="font-mono text-[11px] text-ink3">
                      {fmt(row?.subjectivity ?? 0, 3)} · {pct(row?.loaded_rate ?? 0)} c/ palavra carregada
                    </span>
                  </td>
                  <td className="py-2.5">
                    <Bar value={row?.sensational_rate ?? 0} max={maxSens} color={sp.color} />
                    <span className="font-mono text-[11px] text-ink3">{pct(row?.sensational_rate ?? 0)} das matérias</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Pontos cegos */}
      <section className="mb-10">
        <SectionTitle kicker="Pontos cegos" title="Quem cobre cada pauta">
          Pautas noticiadas só por um lado do espectro são pontos cegos do outro lado.
        </SectionTitle>
        <div className="flex h-7 w-full overflow-hidden">
          {["left_only", "center_mixed", "both_sides", "right_only", "single"].map((k) => {
            const n = data.coverage.find((c) => c.kind === k)?.stories ?? 0;
            const bg = { left_only: "var(--color-bias-el)", right_only: "var(--color-bias-r)", both_sides: "var(--color-ink)", center_mixed: "var(--color-bias-c)", single: "var(--color-paper-deep)" }[k];
            return n ? <div key={k} title={COVERAGE_LABELS[k]} style={{ width: `${(n / coverageTotal) * 100}%`, background: bg }} /> : null;
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {["left_only", "center_mixed", "both_sides", "right_only", "single"].map((k) => {
            const n = data.coverage.find((c) => c.kind === k)?.stories ?? 0;
            return (
              <div key={k} className="border-t border-rule pt-2">
                <div className="font-display text-[22px] font-black">{pct(n / coverageTotal)}</div>
                <div className="text-[12px] text-ink2">{COVERAGE_LABELS[k]}</div>
                <div className="font-mono text-[10px] text-ink3">{int(n)} pautas</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Viés de agenda medido */}
      <section className="mb-10">
        <SectionTitle kicker="Viés de agenda" title="Para que lado cada veículo é puxado">
          Medido, não declarado: para cada pauta que o veículo cobre, a média do espectro dos <em>outros</em> veículos que também a
          cobriram (−2 esquerda … +2 direita). Quem cobre o que a direita cobre, pende à direita, seja qual for o rótulo.
        </SectionTitle>
        <div className="gap-x-8 md:columns-2">
          {byLean.map((s) => (
            <div key={s.source_id} className="mb-1.5 grid break-inside-avoid grid-cols-[minmax(0,9rem)_1fr_3.5rem] items-center gap-2 text-[12.5px]">
              <span className="truncate" title={s.source_name}>
                <span className="mr-1.5 inline-block h-2 w-2" style={{ background: SPEC[s.spectrum]?.color }} />
                {s.source_name}
              </span>
              <LeanBar value={s.agenda_lean ?? 0} />
              <span className="text-right font-mono text-[11px] text-ink3">{fmt(s.agenda_lean ?? 0)}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 font-mono text-[10px] text-ink3">Quadrado = rótulo editorial do veículo. Mínimo de {MIN_ARTICLES} matérias e 10 pautas compartilhadas.</p>
      </section>

      {/* 4. Quem mais destoa */}
      <section className="mb-10">
        <SectionTitle kicker="Fora da curva" title="Veículos que mais destoam do resto">
          Combina três desvios em relação à média dos veículos: linguagem carregada, pautas exclusivas e mix de editorias.
        </SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outliers.map(({ s, score, reason }, i) => (
            <div key={s.source_id} className="border-t-2 border-ink pt-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-[17px] font-black">
                  {i + 1}. {s.source_name}
                </span>
                <span className="font-mono text-[11px] text-ink3">índice {fmt(score)}</span>
              </div>
              <div className="text-[12px] text-ink2">
                {SPEC[s.spectrum]?.label} · principal desvio: <strong>{reason}</strong>
              </div>
              <div className="mt-1 font-mono text-[10.5px] text-ink3">
                subj. {fmt(s.subjectivity, 3)} · exclusivas {pct(s.exclusive_rate)} · divergência {pct(s.agenda_divergence)} · agenda{" "}
                {leanLabel(s.agenda_lean ?? 0)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Palavras carregadas */}
      <section className="mb-10">
        <SectionTitle kicker="Vocabulário" title="Palavras carregadas mais usadas por lado" />
        <div className="grid gap-6 md:grid-cols-3">
          {(["esquerda", "centro", "direita"] as const).map((side) => (
            <div key={side}>
              <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink3">{side}</div>
              <div className="flex flex-wrap gap-1.5">
                {words(side).map((w) => (
                  <span key={w.word} className="border border-rule px-2 py-0.5 text-[12px]">
                    {w.word} <span className="font-mono text-[10px] text-ink3">{w.n}</span>
                  </span>
                ))}
                {words(side).length === 0 && <span className="text-[12px] italic text-ink3">sem ocorrências</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Tabela completa */}
      <section>
        <SectionTitle kicker="Todos os veículos" title="Tabela completa">
          Clique no cabeçalho para ordenar.
        </SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-[12.5px]">
            <thead className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink3">
              <tr className="text-left">
                <th className="py-2 pr-3">Veículo</th>
                {(
                  [
                    ["articles", "Matérias"],
                    ["subjectivity", "Subjetiv."],
                    ["sensational_rate", "Sensac."],
                    ["exclusive_rate", "Exclusivas"],
                    ["agenda_divergence", "Diverg. pauta"],
                    ["agenda_lean", "Agenda"],
                  ] as [SortKey, string][]
                ).map(([k, label]) => (
                  <th key={k} className="py-2 pr-3">
                    <button type="button" onClick={() => setSortKey(k)} className={sortKey === k ? "text-ink underline" : "hover:text-ink"}>
                      {label}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr key={s.source_id} className={`border-t border-rule ${s.articles < MIN_ARTICLES ? "text-ink3" : ""}`}>
                  <td className="py-1.5 pr-3">
                    <span className="mr-1.5 inline-block h-2 w-2" style={{ background: SPEC[s.spectrum]?.color }} />
                    {s.source_name}
                  </td>
                  <td className="py-1.5 pr-3 font-mono">{int(s.articles)}</td>
                  <td className="py-1.5 pr-3 font-mono">{fmt(s.subjectivity, 3)}</td>
                  <td className="py-1.5 pr-3 font-mono">{pct(s.sensational_rate)}</td>
                  <td className="py-1.5 pr-3 font-mono">{pct(s.exclusive_rate)}</td>
                  <td className="py-1.5 pr-3 font-mono">{pct(s.agenda_divergence)}</td>
                  <td className="py-1.5 pr-3 font-mono">{s.agenda_lean == null ? "—" : fmt(s.agenda_lean)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 font-mono text-[10px] text-ink3">Em cinza: menos de {MIN_ARTICLES} matérias (amostra pequena, fora dos rankings).</p>
      </section>
    </div>
  );
}

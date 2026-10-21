import { BarChart3, Globe, Radio, TrendingUp } from "lucide-react";
import { cn } from "../utils/cn";
import { TICKER } from "../data/news";
import { IBookmark, ICompare, INewspaper, ISearch } from "./icons";

export function todayLong(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type NavView = "capa" | "comparador" | "tensoes" | "radar" | "aovivo" | (string & {});

/* ---------- barra superior PRISMA ---------- */
export function TopBar({
  view,
  onNav,
  onSearch,
  onSaved,
  savedCount,
}: {
  view: NavView;
  onNav: (v: NavView) => void;
  onSearch: () => void;
  onSaved: () => void;
  savedCount: number;
}) {
  return (
    <header className="glass sticky top-0 z-40 border-b border-rule">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 md:px-4">
        <button
          onClick={() => onNav("capa")}
          className="flex min-h-[44px] shrink-0 items-center font-display text-[19px] font-black leading-none tracking-[0.06em] text-ink"
          aria-label="PRISMA — voltar à capa"
        >
          PRISMA
        </button>

        <nav className="hidden h-full min-w-0 flex-1 items-center justify-center gap-1 md:flex lg:gap-2" aria-label="Seções">
          {(
            [
              ["capa", "Capa"],
              ["comparador", "Comparador"],
              ["tensoes", "Tensões"],
              ["radar", "Radar X"],
              ["aovivo", "Ao Vivo"],
              ["estatisticas", "Estatísticas"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => onNav(id)}
              className={cn(
                "flex h-14 items-center gap-1.5 whitespace-nowrap border-b-2 px-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors lg:px-3",
                view === id
                  ? "border-ink text-ink"
                  : "border-transparent text-ink3 hover:text-ink"
              )}
            >
              {id === "aovivo" && (
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-press opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-press" />
                </span>
              )}
              {label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            onClick={onSearch}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink2 transition-colors hover:bg-ink/5 hover:text-ink"
            aria-label="Buscar no acervo (atalho ⌘K)"
          >
            <ISearch className="h-5 w-5" />
          </button>
          <button
            onClick={onSaved}
            className="relative flex h-11 w-11 items-center justify-center rounded-lg text-ink2 transition-colors hover:bg-ink/5 hover:text-ink"
            aria-label={`Notícias salvas (${savedCount})`}
          >
            <IBookmark className="h-5 w-5" filled={savedCount > 0} />
            {savedCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-press px-1 text-[9px] font-bold text-paper2">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------- dock flutuante (mobile) ---------- */
export function Dock({ view, onNav }: { view: NavView; onNav: (v: NavView) => void }) {
  const items = [
    {
      id: "capa" as const,
      label: "Capa",
      icon: INewspaper,
      active: view === "capa",
      action: () => onNav("capa"),
    },
    {
      id: "comparador" as const,
      label: "Comparar",
      icon: ICompare,
      active: view === "comparador",
      action: () => onNav("comparador"),
    },
    {
      id: "tensoes" as const,
      label: "Tensões",
      icon: Globe,
      active: view === "tensoes",
      action: () => onNav("tensoes"),
    },
    {
      id: "radar" as const,
      label: "Radar X",
      icon: TrendingUp,
      active: view === "radar",
      action: () => onNav("radar"),
    },
    {
      id: "aovivo" as const,
      label: "Ao Vivo",
      icon: Radio,
      active: view === "aovivo",
      action: () => onNav("aovivo"),
      liveDot: true,
    },
    {
      id: "estatisticas" as const,
      label: "Dados",
      icon: BarChart3,
      active: view === "estatisticas",
      action: () => onNav("estatisticas"),
    },
  ];
  return (
    <nav
      className="fixed inset-x-2 sm:inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 md:hidden"
      aria-label="Navegação principal"
    >
      <div className="glass grid grid-cols-6 overflow-hidden rounded-xl border border-rule shadow-[0_14px_36px_-14px_rgba(29,26,22,0.4)]">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={it.action}
            className={cn(
              "relative flex min-h-[58px] sm:min-h-[60px] flex-col items-center justify-center gap-0.5 sm:gap-1 transition-colors px-0.5",
              it.active ? "text-ink" : "text-ink3 hover:text-ink"
            )}
            aria-label={it.label}
            aria-current={it.active ? "page" : undefined}
          >
            <span
              className={cn(
                "flex h-7 w-8 sm:h-8 sm:w-10 items-center justify-center rounded-full transition-all duration-300",
                it.active ? "bg-ink text-paper2" : "bg-transparent"
              )}
            >
              <it.icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <span className="text-[7.5px] sm:text-[9px] font-bold uppercase tracking-[0.04em] sm:tracking-[0.08em] truncate max-w-full">
              {it.label}
            </span>
            {it.liveDot && !it.active && (
              <span className="absolute right-[calc(50%-14px)] sm:right-[calc(50%-18px)] top-1.5 sm:top-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-press opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-press" />
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ---------- fita de cotações ---------- */
export function Ticker() {
  return (
    <div className="relative overflow-hidden border-b border-rule bg-paper2/70">
      <div className="animate-marquee flex w-max items-center whitespace-nowrap py-2">
        {[...TICKER, ...TICKER].map((t, i) => (
          <span key={i} className="mx-4.5 flex items-baseline gap-1.5 text-[11px]">
            <span className="font-bold tracking-[0.14em] text-ink3">{t.label}</span>
            <span className="font-semibold text-ink">{t.value}</span>
            <span
              className={
                t.dir === "up" ? "text-leaf" : t.dir === "down" ? "text-press" : "text-ink3"
              }
            >
              {t.dir === "up" ? "▲" : t.dir === "down" ? "▼" : "•"}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

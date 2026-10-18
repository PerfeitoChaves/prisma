import { cn } from "../utils/cn";
import {
  Clock,
  Zap,
  Flame,
  Scale,
  Eye,
  X,
  SlidersHorizontal,
} from "lucide-react";

export type SortOption =
  | "recentes"
  | "divergencia"
  | "repercutidas"
  | "consensuais";

export type BlindspotFilter =
  | "todos"
  | "equilibrada"
  | "ponto_cego_direita"
  | "ponto_cego_esquerda";

interface EditorialFilterBarProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  blindspotFilter: BlindspotFilter;
  onBlindspotChange: (filter: BlindspotFilter) => void;
  activeTag: string | null;
  onClearTag: () => void;
  totalStories: number;
  filteredCount: number;
}

const SORT_OPTIONS: { id: SortOption; label: string; icon: typeof Clock; description: string }[] = [
  {
    id: "recentes",
    label: "Mais Recentes",
    icon: Clock,
    description: "Ordem cronológica estrita por publicação",
  },
  {
    id: "divergencia",
    label: "Maior Divergência",
    icon: Zap,
    description: "Pautas com maior contraste e atrito entre redações",
  },
  {
    id: "repercutidas",
    label: "Mais Repercutidas",
    icon: Flame,
    description: "Cobertas pelo maior número de redações",
  },
  {
    id: "consensuais",
    label: "Consensuais",
    icon: Scale,
    description: "Fatos pacificados com alta convergência",
  },
];

const BLINDSPOT_OPTIONS: { id: BlindspotFilter; label: string; badge?: string }[] = [
  { id: "todos", label: "Todos os Vereditos" },
  { id: "equilibrada", label: "⚖️ Cobertura Equilibrada", badge: "Equilíbrio" },
  { id: "ponto_cego_direita", label: "👁️ Ponto Cego da Direita", badge: "Esquerda cobre" },
  { id: "ponto_cego_esquerda", label: "👁️ Ponto Cego da Esquerda", badge: "Direita cobre" },
];

export default function EditorialFilterBar({
  sortOption,
  onSortChange,
  blindspotFilter,
  onBlindspotChange,
  activeTag,
  onClearTag,
  totalStories,
  filteredCount,
}: EditorialFilterBarProps) {
  return (
    <div className="mx-auto max-w-4xl px-3 pt-3 sm:px-4">
      <div className="rounded-xl border border-rule bg-paper2/90 p-3 shadow-xs backdrop-blur-xs md:p-3.5">
        {/* ── BARRA DE ORDENAÇÃO RÁPIDA (QUICK SORT BAR) ── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em] text-ink3">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3 w-3 text-signal" />
              <span>Ordenação Rápida</span>
            </span>
            <span className="font-mono text-[9.5px] text-ink3">
              {filteredCount} {filteredCount === 1 ? "matéria exibida" : "matérias exibidas"}
              {filteredCount !== totalStories && ` (de ${totalStories})`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {SORT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = sortOption === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSortChange(opt.id)}
                  title={opt.description}
                  className={cn(
                    "flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold tracking-tight transition-all cursor-pointer",
                    isActive
                      ? "border-ink bg-ink text-paper2 shadow-xs"
                      : "border-rule/80 bg-paper text-ink2 hover:border-ink/40 hover:bg-paper2 hover:text-ink active:scale-[0.98]"
                  )}
                  aria-pressed={isActive}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-colors",
                      isActive ? "text-signal" : "text-ink3"
                    )}
                  />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── FILTRO POR ESPECTRO & PONTO CEGO ── */}
        <div className="mt-3 border-t border-dashed border-rule/70 pt-2.5">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink3">
              <Eye className="h-3 w-3 text-ink2" />
              <span>Espectro & Veredito:</span>
            </div>

            {/* Seletor Segmentado / Dropdown */}
            <div className="no-scrollbar flex items-center gap-1 overflow-x-auto py-0.5">
              {BLINDSPOT_OPTIONS.map((b) => {
                const isActive = blindspotFilter === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onBlindspotChange(b.id)}
                    className={cn(
                      "shrink-0 rounded-md border px-2.5 py-1 text-[10.5px] font-semibold transition-all cursor-pointer",
                      isActive
                        ? "border-signal bg-signal/10 text-signal font-bold shadow-xs"
                        : "border-rule/60 bg-paper/60 text-ink2 hover:border-ink/30 hover:text-ink"
                    )}
                    aria-pressed={isActive}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── CHIP DE TAG TEMÁTICA ATIVA ── */}
        {activeTag && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-signal/30 bg-signal/5 px-3 py-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-signal">
                Filtrando por tópico:
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-signal/15 px-2 py-0.5 font-mono text-xs font-bold text-signal border border-signal/25">
                {activeTag.startsWith("#") ? activeTag : `#${activeTag}`}
              </span>
              <span className="text-[11px] text-ink3">
                ({filteredCount} {filteredCount === 1 ? "matéria encontrada" : "matérias encontradas"})
              </span>
            </div>
            <button
              type="button"
              onClick={onClearTag}
              className="inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-[11px] font-bold text-signal transition-colors hover:bg-signal/15 hover:text-ink cursor-pointer"
              aria-label="Limpar filtro de tag"
            >
              <span>Limpar filtro</span>
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

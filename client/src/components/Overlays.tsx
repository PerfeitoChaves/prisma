import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { STORIES, outletById, type Story } from "../data/news";
import { mapApiStoryToStory, type ApiStory } from "../utils/storyMapper";
import {
  IBookmark,
  IClose,
  ICompare,
  IDoc,
  IQuote,
  IReader,
  ISearch,
  ITrash,
} from "./icons";
import { kbdKey } from "./ui";

/* ============================================================
   BUSCA INSTANTÂNEA E SOB DEMANDA (⌘K)
   ============================================================ */
interface Hit {
  kind: "story" | "cov";
  storyId: string;
  outletId?: string;
  title: string;
  sub: string;
}

export function SearchModal({
  open,
  stories = STORIES,
  onClose,
  onOpenStory,
  onAddStories,
}: {
  open: boolean;
  stories?: Story[];
  onClose: () => void;
  onOpenStory: (storyId: string, mode: "reader" | "comparador", outletId?: string) => void;
  onAddStories?: (newStories: Story[]) => void;
}) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const [searchingLive, setSearchingLive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLiveSearch = async (termToSearch?: string) => {
    const term = (termToSearch ?? q).trim();
    if (!term || searchingLive) return;
    setSearchingLive(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&live=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.stories && Array.isArray(data.stories) && data.stories.length > 0) {
          const mapped = (data.stories as ApiStory[]).map(mapApiStoryToStory);
          if (onAddStories) {
            onAddStories(mapped);
          }
        }
      }
    } catch (err) {
      console.warn("Live search error:", err);
    } finally {
      setSearchingLive(false);
    }
  };

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
  }, [open]);

  const hits = useMemo<Hit[]>(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) {
      return stories.slice(0, 4).map((s) => ({
        kind: "story" as const,
        storyId: s.id,
        title: s.title,
        sub: `fato · ${s.kicker}`,
      }));
    }
    const out: Hit[] = [];
    for (const s of stories) {
      const inTitle = s.title.toLowerCase().includes(query);
      const inMeta =
        s.kicker.toLowerCase().includes(query) || s.summary.toLowerCase().includes(query);
      if (inTitle || inMeta) {
        out.push({ kind: "story", storyId: s.id, title: s.title, sub: `fato · ${s.kicker}` });
      }
      for (const c of s.coverage) {
        const o = outletById(c.outletId);
        const inCov =
          c.headline.toLowerCase().includes(query) ||
          c.quote.toLowerCase().includes(query) ||
          c.framing.toLowerCase().includes(query) ||
          o.name.toLowerCase().includes(query);
        if (inCov) {
          out.push({
            kind: "cov",
            storyId: s.id,
            outletId: c.outletId,
            title: c.headline,
            sub: `${o.name} · ${s.kicker}`,
          });
        }
      }
    }
    return out.slice(0, 10);
  }, [q, stories]);

  useEffect(() => {
    setIdx(0);
  }, [q]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setIdx((i) => Math.min(i + 1, hits.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (hits[idx]) {
          const hIt = hits[idx];
          onOpenStory(hIt.storyId, hIt.kind === "story" ? "reader" : "comparador", hIt.outletId);
          onClose();
        } else if (q.trim().length >= 2) {
          handleLiveSearch(q);
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, hits, idx, onClose, onOpenStory, q, searchingLive]);

  if (!open) return null;

  const choose = (h: Hit) => {
    onOpenStory(h.storyId, h.kind === "story" ? "reader" : "comparador", h.outletId);
    onClose();
  };

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[80] flex items-start justify-center bg-ink/45 p-3 pt-[9vh] backdrop-blur-[3px] md:pt-[12vh]"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Buscar no acervo"
    >
      <div
        className="animate-pop-in w-full max-w-xl overflow-hidden rounded-lg border border-rule bg-paper2 shadow-[0_34px_90px_-24px_rgba(29,26,22,0.55)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-rule px-4">
          <ISearch className="h-[18px] w-[18px] shrink-0 text-ink3" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar fatos, manchetes, trechos, veículos…"
            className="h-14 min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink3 md:text-[15px]"
            aria-label="Termo de busca"
          />
          <span className="kbd shrink-0">ESC</span>
        </div>

        <div className="max-h-[46vh] overflow-y-auto p-2">
          {hits.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-[13.5px] text-ink2">
                Nada no acervo local para <span className="font-semibold text-ink">“{q}”</span>.
              </p>
              {q.trim().length >= 2 && (
                <div className="mt-4 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleLiveSearch()}
                    disabled={searchingLive}
                    className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-paper2 shadow transition-all hover:bg-signal active:scale-95 disabled:opacity-50"
                  >
                    {searchingLive ? (
                      <>
                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-paper2 border-t-transparent" />
                        Buscando na imprensa agora…
                      </>
                    ) : (
                      <>
                        <ISearch className="h-3.5 w-3.5" />
                        Buscar “{q.trim()}” ao vivo na imprensa
                      </>
                    )}
                  </button>
                  <p className="mt-2.5 max-w-sm text-[11px] text-ink3">
                    Consulta os canais de notícias em tempo real, agrupa diferentes veículos e gera a análise de espectro.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-3 pb-1 pt-2 text-[9.5px] font-bold uppercase tracking-[0.18em] text-ink3">
                <span>
                  {q.trim().length >= 2
                    ? `${hits.length} ${hits.length === 1 ? "resultado" : "resultados"} no acervo`
                    : "Em destaque hoje"}
                </span>
                {q.trim().length >= 2 && (
                  <button
                    type="button"
                    onClick={() => handleLiveSearch()}
                    disabled={searchingLive}
                    className="text-signal hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    {searchingLive ? "Buscando ao vivo…" : "+ Buscar novidades ao vivo"}
                  </button>
                )}
              </div>
              {hits.map((h, i) => (
                <button
                  key={`${h.kind}-${h.storyId}-${h.outletId ?? "s"}`}
                  onClick={() => choose(h)}
                  onMouseEnter={() => setIdx(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                    i === idx && "bg-cream"
                  )}
                >
                  {h.kind === "story" ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ink text-paper2">
                      <IDoc className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-rule text-ink3">
                      <IQuote className="h-4 w-4" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-[14.5px] font-semibold leading-tight text-ink">
                      {hi(h.title, q)}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-ink3">
                      {hi(h.sub, q)}
                    </span>
                  </span>
                  <span className="shrink-0 text-[9.5px] font-bold uppercase tracking-[0.12em] text-ink3">
                    {h.kind === "story" ? "abre leitor" : "comparar"}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-rule bg-paper px-4 py-2.5 text-[10.5px] font-medium text-ink3">
          <span className="flex items-center gap-1.5">
            <span className="kbd">↑↓</span> navegar
          </span>
          <span className="flex items-center gap-1.5">
            <span className="kbd">↵</span> abrir
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="kbd">{kbdKey}</span> acervo completo
          </span>
        </div>
      </div>
    </div>
  );
}

function hi(text: string, q: string): ReactNode {
  const query = q.trim();
  const i = query.length >= 2 ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[2px] bg-marker/70 px-0.5 text-ink">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

/* ============================================================
   GAVETA DE SALVOS
   ============================================================ */
export function SavedDrawer({
  open,
  stories: allStories = STORIES,
  onClose,
  savedIds,
  onRead,
  onCompare,
  onRemove,
}: {
  open: boolean;
  stories?: Story[];
  onClose: () => void;
  savedIds: string[];
  onRead: (id: string) => void;
  onCompare: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const stories = allStories.filter((s) => savedIds.includes(s.id));

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[75]" role="dialog" aria-modal="true" aria-label="Notícias salvas">
      <div className="animate-fade-in absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="animate-slide-in-r absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col border-l border-rule bg-paper shadow-2xl">
        <header className="flex h-[72px] shrink-0 items-center justify-between gap-3 border-b-2 border-ink px-5">
          <div className="min-w-0">
            <h2 className="font-serif text-[20px] font-bold leading-none">Salvos para depois</h2>
            <p className="mt-1.5 truncate text-[10px] font-bold uppercase tracking-[0.16em] text-ink3">
              {stories.length} {stories.length === 1 ? "matéria" : "matérias"} no acervo pessoal
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink2 transition-colors hover:bg-ink/5 hover:text-ink"
            aria-label="Fechar salvos"
          >
            <IClose className="h-5 w-5" />
          </button>
        </header>

        {stories.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-rule text-ink3">
              <IBookmark className="h-6 w-6" />
            </span>
            <p className="font-serif text-[17px] font-semibold italic text-ink">
              Nada por aqui ainda.
            </p>
            <p className="text-[12.5px] leading-relaxed text-ink2">
              Toque no marcador de qualquer matéria na capa ou no comparador para guardar e ler
              depois.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {stories.map((s) => (
              <article key={s.id} className="border-b border-rule px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-press">
                    {s.kicker}
                  </span>
                  <span className="shrink-0 text-[10.5px] font-medium text-ink3">
                    hoje · {s.time}
                  </span>
                </div>
                <h3 className="mt-2 font-serif text-[16.5px] font-bold leading-snug">{s.title}</h3>
                <p className="mt-1.5 text-[11.5px] text-ink3">
                  {s.coverage.length} fontes cruzadas · {s.readTime} min
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      onRead(s.id);
                      onClose();
                    }}
                    className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md bg-ink text-[10.5px] font-bold uppercase tracking-[0.1em] text-paper2 transition-colors hover:bg-press"
                  >
                    <IReader className="h-4 w-4" /> Leitor
                  </button>
                  <button
                    onClick={() => {
                      onCompare(s.id);
                      onClose();
                    }}
                    className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-rule text-[10.5px] font-bold uppercase tracking-[0.1em] text-ink2 transition-colors hover:border-ink hover:text-ink"
                  >
                    <ICompare className="h-4 w-4" /> Comparar
                  </button>
                  <button
                    onClick={() => onRemove(s.id)}
                    className="flex h-11 w-11 items-center justify-center rounded-md border border-rule text-ink3 transition-colors hover:border-press hover:text-press"
                    aria-label={`Remover “${s.title}” dos salvos`}
                  >
                    <ITrash className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <footer className="shrink-0 border-t border-rule px-5 py-3 text-[10.5px] leading-relaxed text-ink3">
          Fica salvo apenas neste navegador — leitura estritamente pessoal.
        </footer>
      </aside>
    </div>
  );
}

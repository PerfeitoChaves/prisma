import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Flame,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Globe,
  Cpu,
  Landmark,
  DollarSign,
  Flag,
  Search,
  Newspaper,
  X,
  GitCompare,
  BookOpen,
  Activity,
} from "lucide-react";
import { type Story } from "../data/news";
import { DEFAULT_TRENDS, type TrendItem } from "../data/trends";
import { mapApiStoryToStory, type ApiStory } from "../utils/storyMapper";
import { cn } from "../utils/cn";

export interface RadarViewProps {
  stories: Story[];
  onCompare: (storyId: string) => void;
  onRead: (storyId: string) => void;
  onAddStories?: (newStories: Story[]) => void;
}

type CategoryFilter = "todos" | "politica" | "economia" | "tecnologia" | "mundo" | "brasil";

export default function RadarView({
  stories,
  onCompare,
  onRead,
  onAddStories,
}: RadarViewProps) {
  const [trends, setTrends] = useState<TrendItem[]>(DEFAULT_TRENDS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<CategoryFilter>("todos");
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedTrend, setSelectedTrend] = useState<TrendItem | null>(null);
  const [crossSearching, setCrossSearching] = useState(false);
  const [crossStatus, setCrossStatus] = useState<string | null>(null);

  /* Carrega tendências do endpoint /api/trends com fallback para DEFAULT_TRENDS */
  const fetchTrends = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const url = isManualRefresh ? "/api/trends?refresh=true" : "/api/trends";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.trends && Array.isArray(data.trends) && data.trends.length > 0) {
          setTrends(data.trends);
        }
      }
    } catch (err) {
      console.warn("[RadarView] Falha ao consultar /api/trends, usando acervo local:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTrends(false);
  }, [fetchTrends]);

  /* Cruzamento de Notícias: localiza matérias correspondentes no acervo local e online */
  const matchStoriesForTrend = useCallback(
    (trend: TrendItem): Story[] => {
      const topicClean = trend.topic.replace(/^#/, "").toLowerCase().trim();
      const keywords = new Set<string>();

      if (topicClean.length >= 3) keywords.add(topicClean);

      // Divide CamelCase: ReformaTributaria -> reforma, tributaria
      const camelTokens = trend.topic
        .replace(/^#/, "")
        .replace(/([A-ZÀ-ÖØ-ß]+)([A-ZÀ-ÖØ-ß][a-zà-öø-ÿ])/g, "$1 $2")
        .replace(/([a-zà-öø-ÿ\d])([A-ZÀ-ÖØ-ß])/g, "$1 $2")
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length >= 3);
      camelTokens.forEach((w) => keywords.add(w));

      if (trend.relatedKeywords) {
        trend.relatedKeywords.forEach((kw) => {
          const cl = kw.toLowerCase().trim();
          if (cl.length >= 3) keywords.add(cl);
        });
      }

      const kwList = Array.from(keywords);

      return stories.filter((story) => {
        const textToSearch = [
          story.title,
          story.kicker,
          story.summary,
          story.briefSummary || "",
          ...(story.tags || []),
          ...story.coverage.map((c) => `${c.headline} ${c.framing} ${c.quote}`),
        ]
          .join(" ")
          .toLowerCase();

        return kwList.some((kw) => textToSearch.includes(kw));
      });
    },
    [stories]
  );

  /* Aciona 1-touch 'Cruzar com Notícias' */
  const handleCrossReference = useCallback(
    async (trend: TrendItem) => {
      setSelectedTrend(trend);
      setCrossStatus(null);

      const topicClean = trend.topic.replace(/^#/, "").trim();
      if (!topicClean) return;

      // Chama busca em tempo real se online
      setCrossSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(topicClean)}&live=true`);
        if (res.ok) {
          const data = await res.json();
          if (data.stories && Array.isArray(data.stories) && data.stories.length > 0) {
            const mapped: Story[] = data.stories.map((s: ApiStory) => mapApiStoryToStory(s));
            if (onAddStories) {
              onAddStories(mapped);
            }
            setCrossStatus(`Encontradas ${mapped.length} matérias adicionais via Google News RSS.`);
          }
        }
      } catch (err) {
        console.warn("[RadarView] Busca em tempo real indisponível:", err);
      } finally {
        setCrossSearching(false);
      }
    },
    [onAddStories]
  );

  /* Filtro de categorias e busca por texto */
  const filteredTrends = useMemo(() => {
    return trends.filter((t) => {
      const matchCat = category === "todos" || t.category === category;
      if (!matchCat) return false;
      if (!filterQuery.trim()) return true;
      const q = filterQuery.toLowerCase().trim();
      return (
        t.topic.toLowerCase().includes(q) ||
        t.context.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    });
  }, [trends, category, filterQuery]);

  /* Matérias cruzadas com a tendência selecionada */
  const activeMatchedStories = useMemo(() => {
    if (!selectedTrend) return [];
    return matchStoriesForTrend(selectedTrend);
  }, [selectedTrend, matchStoriesForTrend]);

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 md:px-4 md:py-8">
      {/* Cabeçalho da Seção */}
      <div className="mb-6 border-b border-rule pb-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 items-center gap-1.5 rounded bg-press/10 px-2 font-mono text-[11px] font-bold uppercase tracking-wider text-press">
                <Flame className="h-3.5 w-3.5" />
                Tempo Real
              </span>
              <span className="font-mono text-[11px] text-ink3">
                {trends.length} pautas monitoradas
              </span>
            </div>
            <h1 className="mt-1.5 font-display text-2xl font-black tracking-tight text-ink md:text-3xl">
              Radar de Tendências do X
            </h1>
            <p className="mt-1 text-sm text-ink2 max-w-2xl">
              Pautas em ebulição no debate público brasileiro sem chaves pagas, cruzadas
              instantaneamente com o acervo editorial do PRISMA e redações jornalísticas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTrends(true)}
              disabled={refreshing || loading}
              className={cn(
                "flex items-center gap-2 rounded-lg border border-rule bg-paper2 px-3 py-2 text-xs font-semibold text-ink2 transition-all hover:border-ink hover:text-ink active:scale-95 disabled:opacity-50",
                refreshing && "cursor-wait"
              )}
              title="Atualizar tendências"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin text-press")} />
              <span>{refreshing ? "Atualizando..." : "Atualizar"}</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Categorias de tendências">
            {(
              [
                ["todos", "Todos"],
                ["politica", "Política"],
                ["economia", "Economia"],
                ["tecnologia", "Tecnologia"],
                ["mundo", "Mundo"],
                ["brasil", "Brasil"],
              ] as const
            ).map(([catId, label]) => (
              <button
                key={catId}
                onClick={() => setCategory(catId)}
                role="tab"
                aria-selected={category === catId}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  category === catId
                    ? "bg-ink text-paper2 shadow-sm"
                    : "bg-ink/5 text-ink2 hover:bg-ink/10 hover:text-ink"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px] sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-ink3" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filtrar hashtag ou tema..."
              className="w-full rounded-lg border border-rule bg-paper2 py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink3 focus:border-ink focus:outline-none"
            />
            {filterQuery && (
              <button
                onClick={() => setFilterQuery("")}
                className="absolute right-2.5 top-2 text-ink3 hover:text-ink"
                aria-label="Limpar filtro"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drawer / Painel Interativo de Cruzamento de Notícias */}
      {selectedTrend && (
        <section
          aria-labelledby="cross-ref-heading"
          className="mb-8 overflow-hidden rounded-xl border-2 border-press/30 bg-paper2 shadow-lg transition-all"
        >
          <div className="flex items-center justify-between border-b border-rule bg-press/5 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-press text-paper2">
                <GitCompare className="h-4 w-4" />
              </span>
              <div>
                <h2 id="cross-ref-heading" className="text-sm font-bold text-ink">
                  Cruzamento Editorial: <span className="text-press">{selectedTrend.topic}</span>
                </h2>
                <p className="text-[11px] text-ink3">
                  {crossSearching
                    ? "Pesquisando cobertura em tempo real..."
                    : `${activeMatchedStories.length} matéria(s) correlacionada(s) no PRISMA`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedTrend(null)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink3 transition-colors hover:bg-ink/5 hover:text-ink"
              aria-label="Fechar painel de notícias cruzadas"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            {crossStatus && (
              <div className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                {crossStatus}
              </div>
            )}

            {crossSearching && activeMatchedStories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <RefreshCw className="h-6 w-6 animate-spin text-press" />
                <p className="mt-2 text-xs font-semibold text-ink">
                  Consultando veículos jornalísticos sobre "{selectedTrend.topic}"...
                </p>
              </div>
            ) : activeMatchedStories.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {activeMatchedStories.map((story) => (
                  <div
                    key={story.id}
                    className="flex flex-col justify-between rounded-lg border border-rule bg-paper p-3.5 transition-all hover:border-ink/40 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-press">
                          {story.kicker}
                        </span>
                        <span className="font-mono text-[10px] text-ink3">
                          {story.coverage.length} redações
                        </span>
                      </div>
                      <h3 className="mt-1 font-display text-sm font-bold leading-snug text-ink line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="mt-1 text-xs text-ink2 line-clamp-2 leading-relaxed">
                        {story.summary}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-rule/50 pt-2.5">
                      <span className="text-[11px] font-medium text-ink3">
                        {story.blindSpot ? story.blindSpot.slice(0, 24) : "Cobertura Plural"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onRead(story.id)}
                          className="flex items-center gap-1 rounded bg-ink/5 px-2.5 py-1 text-xs font-semibold text-ink transition-colors hover:bg-ink hover:text-paper2"
                        >
                          <BookOpen className="h-3 w-3" />
                          <span>Ler</span>
                        </button>
                        <button
                          onClick={() => onCompare(story.id)}
                          className="flex items-center gap-1 rounded bg-press px-2.5 py-1 text-xs font-bold text-paper2 shadow-xs transition-transform active:scale-95"
                        >
                          <GitCompare className="h-3 w-3" />
                          <span>Comparar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-rule py-6 text-center">
                <Newspaper className="mx-auto h-6 w-6 text-ink3" />
                <p className="mt-1 text-xs font-semibold text-ink">
                  Nenhuma matéria no acervo local correlacionada com {selectedTrend.topic}.
                </p>
                <p className="mt-0.5 text-[11px] text-ink3">
                  Toque no link abaixo para conferir as postagens originais na rede X.
                </p>
                <div className="mt-3">
                  <a
                    href={selectedTrend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rule bg-paper px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-ink"
                  >
                    <span>Ver feed de {selectedTrend.topic} no X</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Grade de Tendências */}
      {filteredTrends.length === 0 ? (
        <div className="rounded-xl border border-dashed border-rule p-12 text-center">
          <p className="text-sm font-semibold text-ink">Nenhuma tendência encontrada</p>
          <p className="mt-1 text-xs text-ink3">
            Tente selecionar outra categoria ou limpar a busca.
          </p>
          <button
            onClick={() => {
              setCategory("todos");
              setFilterQuery("");
            }}
            className="mt-3 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-paper2"
          >
            Ver todas as tendências
          </button>
        </div>
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrends.map((trend) => {
            const matchedCount = matchStoriesForTrend(trend).length;
            const categoryData = getCategoryVisual(trend.category);
            const tractionData = getTractionVisual(trend.status, trend.traction);

            return (
              <article
                key={trend.id}
                className={cn(
                  "group relative flex flex-col justify-between rounded-xl border bg-paper p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                  selectedTrend?.id === trend.id
                    ? "border-press ring-2 ring-press/20"
                    : "border-rule hover:border-ink/30"
                )}
              >
                <div>
                  {/* Topo do Card: Categoria, Volume e Status de Tração */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider",
                        categoryData.badgeClass
                      )}
                    >
                      <categoryData.icon className="h-3 w-3" />
                      {categoryData.label}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Badge de Volume */}
                      <span className="rounded bg-ink/5 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-ink2">
                        {trend.volume}
                      </span>

                      {/* Badge de Status / Tração */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                          tractionData.badgeClass
                        )}
                        title={`Status: ${tractionData.label}`}
                      >
                        <tractionData.icon className="h-3 w-3" />
                        {tractionData.label}
                      </span>
                    </div>
                  </div>

                  {/* Título do Tópico */}
                  <h2 className="mt-2.5 font-display text-lg font-black tracking-tight text-ink group-hover:text-press transition-colors">
                    {trend.topic}
                  </h2>

                  {/* Contexto Resumido */}
                  <p className="mt-1.5 text-xs text-ink2 leading-relaxed">
                    {trend.context}
                  </p>
                </div>

                {/* Rodapé do Card: Ações Táteis */}
                <div className="mt-4 border-t border-rule/60 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    {/* Botão de 1 Toque: Cruzar com Notícias */}
                    <button
                      onClick={() => handleCrossReference(trend)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95",
                        matchedCount > 0
                          ? "bg-press text-paper2 shadow-xs hover:bg-press/90"
                          : "bg-ink/5 text-ink hover:bg-ink hover:text-paper2"
                      )}
                      aria-label={`Cruzar tendência ${trend.topic} com notícias`}
                    >
                      <GitCompare className="h-3.5 w-3.5" />
                      <span>Cruzar Notícias</span>
                      {matchedCount > 0 && (
                        <span className="rounded-full bg-paper2/20 px-1.5 py-0.2 text-[10px] font-black">
                          {matchedCount}
                        </span>
                      )}
                    </button>

                    {/* Link Externo Seguro para o X */}
                    <a
                      href={trend.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-ink3 transition-colors hover:text-ink"
                      aria-label={`Abrir assunto ${trend.topic} no X em nova aba`}
                    >
                      <span>Ver no X</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Helpers visuais de Categoria e Tração */
function getCategoryVisual(category: string) {
  switch (category) {
    case "politica":
      return {
        label: "Política",
        icon: Landmark,
        badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
      };
    case "economia":
      return {
        label: "Economia",
        icon: DollarSign,
        badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
      };
    case "tecnologia":
      return {
        label: "Tecnologia",
        icon: Cpu,
        badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20",
      };
    case "mundo":
      return {
        label: "Mundo",
        icon: Globe,
        badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20",
      };
    case "brasil":
    default:
      return {
        label: "Brasil",
        icon: Flag,
        badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
      };
  }
}

function getTractionVisual(status: string, traction?: string) {
  const isExploding = status === "explodindo" || traction === "urgente" || traction === "pico";
  if (isExploding) {
    return {
      label: "Explodindo",
      icon: Flame,
      badgeClass: "bg-press text-paper2 animate-pulse",
    };
  }

  const isHigh = status === "alta" || traction === "em_alta";
  if (isHigh) {
    return {
      label: "Em Alta",
      icon: TrendingUp,
      badgeClass: "bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold",
    };
  }

  return {
    label: "Estável",
    icon: Activity,
    badgeClass: "bg-ink/5 text-ink3 font-medium",
  };
}

import { useState } from "react";
import {
  ExternalLink,
  Pause,
  Play,
  Radio,
  Tv,
  Volume2,
} from "lucide-react";
import {
  RADIO_STATIONS,
  TV_CHANNELS,
  type LiveMediaItem,
} from "../data/media";
import { cn } from "../utils/cn";

export interface LiveMediaViewProps {
  activeItem: LiveMediaItem | null;
  isPlaying: boolean;
  tvChannels?: LiveMediaItem[];
  onSelectChannel: (item: LiveMediaItem) => void;
  onTogglePlay: () => void;
}

export default function LiveMediaView({
  activeItem,
  isPlaying,
  tvChannels,
  onSelectChannel,
  onTogglePlay,
}: LiveMediaViewProps) {
  const [filterType, setFilterType] = useState<"all" | "tv" | "radio">("all");

  const tvList = tvChannels && tvChannels.length > 0 ? tvChannels : TV_CHANNELS;
  const displayedTv = filterType === "radio" ? [] : tvList;
  const displayedRadio = filterType === "tv" ? [] : RADIO_STATIONS;

  const handleCardClick = (item: LiveMediaItem) => {
    if (activeItem?.id === item.id) {
      onTogglePlay();
    } else {
      onSelectChannel(item);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 md:px-4 md:py-8 space-y-8 animate-fade-in">
      {/* Header Editorial da Central Ao Vivo */}
      <header className="border-b border-rule pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-press opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-press" />
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-press">
                CENTRAL MULTIMÍDIA AO VIVO · JORNALISMO EM TEMPO REAL
              </span>
            </div>
            <h1 className="mt-1.5 font-display text-2xl font-black text-ink md:text-3xl">
              Transmissões Ao Vivo de TV e Rádios All-News
            </h1>
            <p className="mt-1 max-w-3xl font-serif text-sm text-ink2 md:text-base leading-relaxed">
              Acompanhe transmissões contínuas 24 horas das principais redações de televisão e
              estações de rádio jornalísticas do país. O reprodutor flutuante permanece ativo e
              audível enquanto você navega pelas matérias e compara enquadramentos.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-rule bg-paper2 p-1">
            <button
              onClick={() => setFilterType("all")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                filterType === "all"
                  ? "bg-ink text-paper2 shadow"
                  : "text-ink3 hover:text-ink"
              )}
            >
              Todos ({tvList.length + RADIO_STATIONS.length})
            </button>
            <button
              onClick={() => setFilterType("tv")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                filterType === "tv"
                  ? "bg-ink text-paper2 shadow"
                  : "text-ink3 hover:text-ink"
              )}
            >
              <Tv className="h-3.5 w-3.5" />
              <span>TV ({tvList.length})</span>
            </button>
            <button
              onClick={() => setFilterType("radio")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                filterType === "radio"
                  ? "bg-ink text-paper2 shadow"
                  : "text-ink3 hover:text-ink"
              )}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Rádios ({RADIO_STATIONS.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Grade de Televisão Ao Vivo */}
      {displayedTv.length > 0 && (
        <section aria-labelledby="tv-section-heading">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Tv className="h-4 w-4 text-ink2" />
              <h2 id="tv-section-heading" className="font-display text-lg font-bold text-ink">
                Canais de Notícias da Televisão (24 Horas)
              </h2>
            </div>
            <span className="font-mono text-xs text-ink3">{tvList.length} Canais Disponíveis</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedTv.map((tv) => {
              const isSelected = activeItem?.id === tv.id;
              const isCurrentlyPlaying = isSelected && isPlaying;

              return (
                <div
                  key={tv.id}
                  onClick={() => handleCardClick(tv)}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-press bg-paper2 shadow-lg ring-1 ring-press/30"
                      : "border-rule bg-paper2/60 hover:border-ink/30 hover:bg-paper2 hover:shadow-md"
                  )}
                >
                  <div>
                    {/* Top row: badge & live dot */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-press/15 px-2.5 py-0.5 font-mono text-[9px] font-bold text-press uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-press animate-ping" />
                        <span>NO AR</span>
                      </span>

                      <span className="font-mono text-[10px] text-ink3 uppercase tracking-wider">
                        {tv.badge || "TV AO VIVO"}
                      </span>
                    </div>

                    {/* Channel Name & Category */}
                    <h3 className="mt-3 font-display text-lg font-black text-ink group-hover:text-press transition-colors">
                      {tv.name}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink3 font-medium">
                      <span>{tv.category}</span>
                      <span>•</span>
                      <span>{tv.city}</span>
                    </div>

                    {/* Description */}
                    <p className="mt-2 font-serif text-xs text-ink2 leading-relaxed line-clamp-2">
                      {tv.description}
                    </p>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="mt-4 flex items-center justify-between border-t border-rule/50 pt-3">
                    <div className="flex items-center gap-1.5">
                      {isCurrentlyPlaying ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-press">
                          <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                          <span>Transmitindo</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-ink3 group-hover:text-ink">
                          Toque para sintonizar
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {tv.watchUrl && (
                        <a
                          href={tv.watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-8 items-center gap-1 rounded-xl border border-rule bg-paper px-2.5 text-xs font-bold text-ink2 transition-all hover:border-press hover:text-press hover:bg-press/5 shadow-sm active:scale-95"
                          title="Abrir diretamente no YouTube (App ou Web)"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>YouTube</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(tv);
                        }}
                        className={cn(
                          "flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-bold shadow-sm transition-all",
                          isCurrentlyPlaying
                            ? "bg-press text-paper2 hover:bg-press/90"
                            : "bg-ink text-paper2 hover:bg-ink/80 group-hover:scale-105"
                        )}
                        aria-label={`${isCurrentlyPlaying ? "Pausar" : "Assistir"} ${tv.name}`}
                      >
                        {isCurrentlyPlaying ? (
                          <>
                            <Pause className="h-3 w-3 fill-current" />
                            <span>Pausar</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 fill-current" />
                            <span>Assistir</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Grade de Rádios All-News Brasileiras */}
      {displayedRadio.length > 0 && (
        <section aria-labelledby="radio-section-heading">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-ink2" />
              <h2 id="radio-section-heading" className="font-display text-lg font-bold text-ink">
                Redes de Rádio All-News Brasileiras (Áudio Contínuo)
              </h2>
            </div>
            <span className="font-mono text-xs text-ink3">
              {RADIO_STATIONS.length} Estações no Dial
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedRadio.map((radio) => {
              const isSelected = activeItem?.id === radio.id;
              const isCurrentlyPlaying = isSelected && isPlaying;

              return (
                <div
                  key={radio.id}
                  onClick={() => handleCardClick(radio)}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-press bg-paper2 shadow-lg ring-1 ring-press/30"
                      : "border-rule bg-paper2/60 hover:border-ink/30 hover:bg-paper2 hover:shadow-md"
                  )}
                >
                  <div>
                    {/* Top row: frequency pill & live dot */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-ink px-2 py-0.5 rounded-lg bg-ink/5 border border-rule/50">
                        {radio.frequencyOrDial || radio.badge}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-press/15 px-2 py-0.5 font-mono text-[9px] font-bold text-press uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-press animate-ping" />
                        <span>AO VIVO</span>
                      </span>
                    </div>

                    {/* Station Name & City */}
                    <h3 className="mt-3 font-display text-lg font-black text-ink group-hover:text-press transition-colors">
                      {radio.name}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink3 font-medium">
                      <span>{radio.category}</span>
                      <span>•</span>
                      <span>{radio.city}</span>
                    </div>

                    {/* Description */}
                    <p className="mt-2 font-serif text-xs text-ink2 leading-relaxed line-clamp-2">
                      {radio.description}
                    </p>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="mt-4 flex items-center justify-between border-t border-rule/50 pt-3">
                    {/* Soundwave animation if active */}
                    <div className="flex items-center gap-1.5">
                      {isCurrentlyPlaying ? (
                        <div className="flex items-end gap-0.5 h-4" aria-hidden="true">
                          {[0.4, 0.9, 0.6, 1, 0.5].map((s, idx) => (
                            <span
                              key={idx}
                              className="w-1 rounded-full bg-press animate-pulse"
                              style={{
                                height: `${s * 100}%`,
                                animationDelay: `${idx * 150}ms`,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-ink3 group-hover:text-ink">
                          Toque para ouvir
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(radio);
                      }}
                      className={cn(
                        "flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-bold shadow-sm transition-all",
                        isCurrentlyPlaying
                          ? "bg-press text-paper2 hover:bg-press/90"
                          : "bg-ink text-paper2 hover:bg-ink/80 group-hover:scale-105"
                      )}
                      aria-label={`${isCurrentlyPlaying ? "Pausar" : "Ouvir"} ${radio.name}`}
                    >
                      {isCurrentlyPlaying ? (
                        <>
                          <Pause className="h-3 w-3 fill-current" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 fill-current" />
                          <span>Ouvir</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

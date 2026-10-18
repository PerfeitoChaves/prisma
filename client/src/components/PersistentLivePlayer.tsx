import { useEffect, useRef, useState } from "react";
import {
  ListMusic,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Radio,
  SkipBack,
  SkipForward,
  Tv,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { ALL_MEDIA_ITEMS, type LiveMediaItem } from "../data/media";
import { cn } from "../utils/cn";

export interface PersistentLivePlayerProps {
  item: LiveMediaItem | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
  onSelectChannel: (item: LiveMediaItem) => void;
  onClose: () => void;
  onOpenAoVivoView?: () => void;
}

export default function PersistentLivePlayer({
  item,
  isPlaying,
  isMuted,
  volume,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onSelectChannel,
  onClose,
  onOpenAoVivoView,
}: PersistentLivePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showChannelList, setShowChannelList] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  // Determine current channel index in catalog for skip next/prev
  const currentIndex = item ? ALL_MEDIA_ITEMS.findIndex((m) => m.id === item.id) : -1;

  const handlePrevChannel = () => {
    if (ALL_MEDIA_ITEMS.length === 0) return;
    const prevIdx = (currentIndex - 1 + ALL_MEDIA_ITEMS.length) % ALL_MEDIA_ITEMS.length;
    onSelectChannel(ALL_MEDIA_ITEMS[prevIdx]);
  };

  const handleNextChannel = () => {
    if (ALL_MEDIA_ITEMS.length === 0) return;
    const nextIdx = (currentIndex + 1) % ALL_MEDIA_ITEMS.length;
    onSelectChannel(ALL_MEDIA_ITEMS[nextIdx]);
  };

  // Synchronize audio stream and playback state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!item || item.type !== "radio") {
      audio.pause();
      return;
    }

    setStreamError(false);
    setUsingFallback(false);
    const targetUrl = item.streamUrl;

    if (audio.src !== targetUrl) {
      audio.src = targetUrl;
      audio.load();
    }

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("[PersistentLivePlayer] Audio play interrupted or awaiting gesture:", err);
        });
      }
    } else {
      audio.pause();
    }
  }, [item, isPlaying]);

  // Synchronize volume and mute properties
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.muted = isMuted;
  }, [volume, isMuted]);

  // Handle radio stream errors with automatic fallback
  const handleAudioError = () => {
    const audio = audioRef.current;
    if (!audio || !item) return;

    if (item.fallbackUrl && !usingFallback) {
      console.warn(`[PersistentLivePlayer] Stream error on ${item.name}, switching to fallback.`);
      setUsingFallback(true);
      audio.src = item.fallbackUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch((e) => console.warn("[PersistentLivePlayer] Fallback play error:", e));
      }
    } else {
      console.warn(`[PersistentLivePlayer] Stream error on ${item.name}`);
      setStreamError(true);
    }
  };

  if (!item) {
    return (
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
        onError={handleAudioError}
      />
    );
  }

  // Active video embed source (primary or fallback if HLS)
  const videoSrc =
    item.type === "tv"
      ? item.embedType === "hls" && item.fallbackUrl
        ? item.fallbackUrl
        : item.streamUrl
      : null;

  return (
    <>
      {/* Hidden audio element always mounted for continuous audio */}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
        onError={handleAudioError}
      />

      {/* Persistent floating container with mobile dock collision avoidance */}
      <aside
        role="region"
        aria-label="Reprodutor Multimídia Ao Vivo Persistente"
        className={cn(
          "fixed z-40 rounded-2xl border border-rule bg-paper2/95 shadow-[0_18px_45px_-12px_rgba(29,26,22,0.45)] backdrop-blur-md transition-all duration-300",
          // Mobile: floating above bottom dock navigation
          "inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))]",
          // Desktop: floating bottom-right widget
          "md:inset-x-auto md:bottom-6 md:right-6",
          isMinimized
            ? "md:w-80 p-2.5"
            : item.type === "tv"
            ? "md:w-[380px] p-3"
            : "md:w-96 p-3.5"
        )}
      >
        {/* Header Bar: Status, Name, Quick Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Pulsating No Ar Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider",
                isPlaying
                  ? "bg-press/15 text-press animate-pulse-soft"
                  : "bg-ink/10 text-ink3"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isPlaying ? "bg-press animate-ping" : "bg-ink3"
                )}
              />
              <span>{isPlaying ? "NO AR" : "PAUSADO"}</span>
            </div>

            {/* Media Type Icon & Station Name */}
            <button
              onClick={() => onOpenAoVivoView?.()}
              className="flex items-center gap-1.5 truncate text-left hover:underline"
              title="Abrir Central Ao Vivo"
            >
              {item.type === "tv" ? (
                <Tv className="h-3.5 w-3.5 shrink-0 text-ink2" />
              ) : (
                <Radio className="h-3.5 w-3.5 shrink-0 text-ink2" />
              )}
              <span className="truncate text-xs font-bold text-ink leading-tight">
                {item.name}
              </span>
            </button>
          </div>

          {/* Quick Header Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowChannelList((prev) => !prev)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg text-ink3 transition-colors hover:bg-ink/5 hover:text-ink",
                showChannelList && "bg-ink/10 text-ink"
              )}
              title="Lista de Canais Ao Vivo"
              aria-label="Abrir seletor rápido de canais"
            >
              <ListMusic className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsMinimized((prev) => !prev)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink3 transition-colors hover:bg-ink/5 hover:text-ink"
              title={isMinimized ? "Expandir player" : "Minimizar player"}
              aria-label={isMinimized ? "Expandir reprodutor" : "Minimizar reprodutor"}
            >
              {isMinimized ? (
                <Maximize2 className="h-3.5 w-3.5" />
              ) : (
                <Minimize2 className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink3 transition-colors hover:bg-press/15 hover:text-press"
              title="Fechar reprodutor"
              aria-label="Fechar reprodutor de transmissão"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Video Screen (Only when TV and not minimized) */}
        {!isMinimized && item.type === "tv" && videoSrc && (
          <div className="mt-2.5 overflow-hidden rounded-xl border border-rule bg-black shadow-inner aspect-video relative">
            <iframe
              src={videoSrc}
              title={`Transmissão ao vivo: ${item.name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>
        )}

        {/* Radio Waveform Visualizer & Info (Only when Radio and not minimized) */}
        {!isMinimized && item.type === "radio" && (
          <div className="mt-2.5 flex items-center justify-between rounded-xl border border-rule bg-paper px-3 py-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] font-bold text-press uppercase tracking-wider">
                  {item.frequencyOrDial || item.badge || "Ao Vivo"}
                </span>
                <span className="text-[10px] text-ink3">•</span>
                <span className="truncate text-[10.5px] text-ink2">{item.city}</span>
              </div>
              <p className="truncate text-xs font-serif text-ink italic mt-0.5">
                {streamError
                  ? "Tentando reconectar fluxo de áudio..."
                  : item.description || item.category}
              </p>
            </div>

            {/* Animated Sound Wave bars when playing */}
            <div className="ml-2 flex items-end gap-0.5 h-5 shrink-0" aria-hidden="true">
              {[0.4, 0.8, 0.5, 1, 0.6].map((scale, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1 rounded-full transition-all duration-300",
                    isPlaying ? "bg-press animate-pulse" : "bg-ink3/40"
                  )}
                  style={{
                    height: isPlaying ? `${scale * 100}%` : "30%",
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tactile Controls: Previous, Play/Pause, Next, Mute, Volume */}
        <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-rule/60">
          <div className="flex items-center gap-1">
            {/* Prev Channel */}
            <button
              onClick={handlePrevChannel}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink3 hover:bg-ink/5 hover:text-ink transition-colors"
              title="Canal anterior"
              aria-label="Mudar para canal anterior"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-paper2 shadow hover:bg-ink/90 active:scale-95 transition-all"
              title={isPlaying ? "Pausar transmissão" : "Reproduzir ao vivo"}
              aria-label={isPlaying ? "Pausar transmissão" : "Reproduzir ao vivo"}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Channel */}
            <button
              onClick={handleNextChannel}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink3 hover:bg-ink/5 hover:text-ink transition-colors"
              title="Próximo canal"
              aria-label="Mudar para próximo canal"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Volume and Mute Controls */}
          <div className="flex items-center gap-1.5 flex-1 max-w-[150px] justify-end">
            <button
              onClick={onToggleMute}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink2 hover:bg-ink/5 hover:text-ink transition-colors"
              title={isMuted ? "Ativar som" : "Desativar som"}
              aria-label={isMuted ? "Ativar som" : "Desativar som"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-press" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              aria-label="Volume da transmissão"
              className="h-1.5 w-full cursor-pointer accent-ink bg-rule rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Quick Channel Selection Drawer / Popover */}
        {showChannelList && (
          <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-rule bg-paper p-1.5 space-y-1 shadow-inner">
            <div className="px-2 py-1 flex items-center justify-between border-b border-rule/50">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink3">
                Canais Disponíveis (1 Touch)
              </span>
              <button
                onClick={() => onOpenAoVivoView?.()}
                className="text-[9.5px] font-bold text-press hover:underline"
              >
                Ver grade completa →
              </button>
            </div>
            {ALL_MEDIA_ITEMS.map((m) => {
              const isCurrent = m.id === item.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectChannel(m);
                    setShowChannelList(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                    isCurrent
                      ? "bg-ink text-paper2 font-bold"
                      : "text-ink hover:bg-ink/5"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {m.type === "tv" ? (
                      <Tv className="h-3 w-3 shrink-0" />
                    ) : (
                      <Radio className="h-3 w-3 shrink-0" />
                    )}
                    <span className="truncate">{m.name}</span>
                  </div>
                  <span
                    className={cn(
                      "font-mono text-[9px] shrink-0",
                      isCurrent ? "text-paper2/80" : "text-ink3"
                    )}
                  >
                    {m.frequencyOrDial || (m.type === "tv" ? "TV" : "WEB")}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </aside>
    </>
  );
}

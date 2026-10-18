import { useCallback, useEffect, useState } from "react";
import { COVER_STORY, STORIES, type Story } from "./data/news";
import { DEFAULT_MEDIA_ITEM, type LiveMediaItem } from "./data/media";
import { mapApiStoryToStory, type ApiStory } from "./utils/storyMapper";
import { Dock, TopBar } from "./components/Chrome";
import CoverPage from "./components/CoverPage";
import Comparator from "./components/Comparator";
import LiveMediaView from "./components/LiveMediaView";
import PersistentLivePlayer from "./components/PersistentLivePlayer";
import RadarView from "./components/RadarView";
import Reader from "./components/Reader";
import { SavedDrawer, SearchModal } from "./components/Overlays";
import { loadLS } from "./components/ui";

export type View = "capa" | "comparador" | "radar" | "aovivo" | (string & {});

export default function App() {
  const [stories, setStories] = useState<Story[]>(STORIES);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("capa");
  const [compareId, setCompareId] = useState(COVER_STORY.id);
  const [focusOutlet, setFocusOutlet] = useState<string | null>(null);
  const [readerId, setReaderId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [saved, setSaved] = useState<string[]>(() => loadLS<string[]>("fc-saved", []));
  const [fontStep, setFontStep] = useState<number>(() => loadLS<number>("fc-font", 1));

  /* Estado persistente da Central Multimídia Ao Vivo */
  const [activeMedia, setActiveMedia] = useState<LiveMediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [previousVolume, setPreviousVolume] = useState(0.85);

  /* Carrega notícias reais do banco FastAPI (/api/stories) */
  useEffect(() => {
    let mounted = true;
    async function loadApiStories() {
      try {
        const res = await fetch("/api/stories?limit=60&min_sources=1");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.stories && Array.isArray(data.stories) && data.stories.length > 0) {
          const mapped: Story[] = data.stories.map((s: ApiStory) => mapApiStoryToStory(s));
          if (mounted) {
            setStories(mapped);
            setCompareId(mapped[0].id);
            setLoading(false);
          }
        } else {
          if (mounted) setLoading(false);
        }
      } catch (err) {
        console.warn("[App] Usando acervo editorial local:", err);
        if (mounted) setLoading(false);
      }
    }
    loadApiStories();
    return () => {
      mounted = false;
    };
  }, []);

  /* persistência pessoal */
  useEffect(() => {
    try {
      localStorage.setItem("fc-saved", JSON.stringify(saved));
    } catch {
      /* ambiente sem storage */
    }
  }, [saved]);
  useEffect(() => {
    try {
      localStorage.setItem("fc-font", JSON.stringify(fontStep));
    } catch {
      /* ambiente sem storage */
    }
  }, [fontStep]);

  /* atalho global ⌘K / Ctrl K */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  /* trava o scroll da página com overlays abertos */
  const lock = readerId !== null || searchOpen || savedOpen;
  useEffect(() => {
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lock]);

  const openCapa = () => {
    setView("capa");
    window.scrollTo({ top: 0 });
  };

  const openComparador = useCallback((id?: string, outlet?: string) => {
    if (id) setCompareId(id);
    setFocusOutlet(outlet ?? null);
    setView("comparador");
    window.scrollTo({ top: 0 });
  }, []);

  const openAoVivo = useCallback(() => {
    setView("aovivo");
    window.scrollTo({ top: 0 });
  }, []);

  const openRadar = useCallback(() => {
    setView("radar");
    window.scrollTo({ top: 0 });
  }, []);

  const handleNav = useCallback((v: View) => {
    if (v === "capa") openCapa();
    else if (v === "comparador") openComparador();
    else if (v === "radar") openRadar();
    else if (v === "aovivo") openAoVivo();
    else {
      setView(v);
      window.scrollTo({ top: 0 });
    }
  }, [openComparador, openRadar, openAoVivo]);

  /* Controles táteis da Central Ao Vivo e Mini-Player */
  const handleTogglePlay = useCallback(() => {
    if (!activeMedia) {
      setActiveMedia(DEFAULT_MEDIA_ITEM);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => !prev);
  }, [activeMedia]);

  const handleToggleMute = useCallback(() => {
    if (!isMuted) {
      setPreviousVolume(volume > 0 ? volume : 0.85);
      setVolume(0);
      setIsMuted(true);
    } else {
      const restored = previousVolume > 0 ? previousVolume : 0.85;
      setVolume(restored);
      setIsMuted(false);
    }
  }, [isMuted, volume, previousVolume]);

  const handleVolumeChange = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    setIsMuted(clamped === 0);
  }, []);

  const handleSelectChannel = useCallback((item: LiveMediaItem) => {
    setActiveMedia(item);
    setIsPlaying(true);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setIsPlaying(false);
    setActiveMedia(null);
  }, []);

  const handleAddStories = useCallback((newStories: Story[]) => {
    setStories((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const fresh = newStories.filter((s) => !existingIds.has(s.id));
      if (fresh.length === 0) return prev;
      return [...fresh, ...prev];
    });
  }, []);

  const openFromSearch = (storyId: string, mode: "reader" | "comparador", outlet?: string) => {
    if (mode === "reader") setReaderId(storyId);
    else openComparador(storyId, outlet);
  };

  const toggleSave = (id: string) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const readerStory = readerId ? stories.find((s) => s.id === readerId) ?? null : null;

  return (
    <div className="noise min-h-screen">
      <TopBar
        view={view}
        onNav={handleNav}
        onSearch={() => setSearchOpen(true)}
        onSaved={() => setSavedOpen(true)}
        savedCount={saved.length}
      />

      <main>
        {view === "capa" ? (
          <CoverPage
            stories={stories}
            loading={loading}
            onCompare={openComparador}
            onRead={setReaderId}
            saved={saved}
            onToggleSave={toggleSave}
            onSearchClick={() => setSearchOpen(true)}
          />
        ) : view === "comparador" ? (
          <Comparator
            key={`${compareId}:${focusOutlet ?? "-"}`}
            storyId={compareId}
            stories={stories}
            onSelect={setCompareId}
            initialOutlet={focusOutlet}
            onRead={setReaderId}
          />
        ) : view === "radar" ? (
          <RadarView
            stories={stories}
            onCompare={openComparador}
            onRead={setReaderId}
            onAddStories={handleAddStories}
          />
        ) : view === "aovivo" ? (
          <LiveMediaView
            activeItem={activeMedia}
            isPlaying={isPlaying}
            onSelectChannel={handleSelectChannel}
            onTogglePlay={handleTogglePlay}
          />
        ) : null}
      </main>

      {/* Floating persistent mini-player mounted outside view switcher */}
      <PersistentLivePlayer
        item={activeMedia}
        isPlaying={isPlaying}
        isMuted={isMuted}
        volume={volume}
        onTogglePlay={handleTogglePlay}
        onToggleMute={handleToggleMute}
        onVolumeChange={handleVolumeChange}
        onSelectChannel={handleSelectChannel}
        onClose={handleClosePlayer}
        onOpenAoVivoView={openAoVivo}
      />

      <Dock
        view={view}
        onNav={handleNav}
        onSearch={() => setSearchOpen(true)}
        onSaved={() => setSavedOpen(true)}
        savedCount={saved.length}
      />

      {readerStory && (
        <Reader
          story={readerStory}
          onClose={() => setReaderId(null)}
          fontStep={fontStep}
          onFontStep={setFontStep}
          onCompare={(id) => {
            setReaderId(null);
            openComparador(id);
          }}
          isSaved={saved.includes(readerStory.id)}
          onToggleSave={toggleSave}
        />
      )}

      <SavedDrawer
        open={savedOpen}
        stories={stories}
        onClose={() => setSavedOpen(false)}
        savedIds={saved}
        onRead={setReaderId}
        onCompare={openComparador}
        onRemove={(id) => setSaved((s) => s.filter((x) => x !== id))}
      />

      <SearchModal
        open={searchOpen}
        stories={stories}
        onClose={() => setSearchOpen(false)}
        onOpenStory={openFromSearch}
        onAddStories={handleAddStories}
      />
    </div>
  );
}

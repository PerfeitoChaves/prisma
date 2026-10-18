import React, { useMemo, useState } from "react";
import type { Hotspot, TensionSeverity } from "../../types/geopolitics";
import { CONTINENTS, CHOKEPOINT_CORRIDORS } from "./worldMapPaths";
import { Crosshair, ZoomIn, ZoomOut, RotateCcw, ShieldAlert, Radio } from "lucide-react";

interface TacticalWorldMapProps {
  hotspots: Hotspot[];
  selectedHotspotId: string | null;
  onSelectHotspot: (id: string) => void;
  className?: string;
}

type TheaterFilter = "all" | "middle_east" | "europe" | "asia" | "americas_africa";

const THEATER_OPTIONS: { id: TheaterFilter; label: string; count: number }[] = [
  { id: "all", label: "Global (8)", count: 8 },
  { id: "middle_east", label: "Oriente Médio (3)", count: 3 },
  { id: "europe", label: "Europa (1)", count: 1 },
  { id: "asia", label: "Ásia-Pacífico (2)", count: 2 },
  { id: "americas_africa", label: "África & Américas (2)", count: 2 },
];

function getSeverityColor(sev: TensionSeverity): { fill: string; stroke: string; glow: string; text: string } {
  switch (sev) {
    case "critico":
      return { fill: "#ef4444", stroke: "#f87171", glow: "rgba(239, 68, 68, 0.45)", text: "text-red-400" };
    case "alto":
      return { fill: "#f97316", stroke: "#fb923c", glow: "rgba(249, 115, 22, 0.40)", text: "text-orange-400" };
    case "moderado":
    default:
      return { fill: "#eab308", stroke: "#fde047", glow: "rgba(234, 179, 8, 0.35)", text: "text-amber-400" };
  }
}

function matchesTheater(hotspotId: string, theater: TheaterFilter): boolean {
  if (theater === "all") return true;
  if (theater === "middle_east") {
    return hotspotId === "ormuz" || hotspotId === "gaza" || hotspotId === "mar_vermelho";
  }
  if (theater === "europe") {
    return hotspotId === "ucrania";
  }
  if (theater === "asia") {
    return hotspotId === "taiwan" || hotspotId === "coreia";
  }
  if (theater === "americas_africa") {
    return hotspotId === "sahel" || hotspotId === "essequibo";
  }
  return true;
}

export const TacticalWorldMap: React.FC<TacticalWorldMapProps> = ({
  hotspots,
  selectedHotspotId,
  onSelectHotspot,
  className = "",
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [activeTheater, setActiveTheater] = useState<TheaterFilter>("all");
  const [radarActive, setRadarActive] = useState<boolean>(true);

  // Selected hotspot object
  const activeHotspot = useMemo(() => {
    return hotspots.find((h) => h.id === selectedHotspotId) || null;
  }, [hotspots, selectedHotspotId]);

  // Center coordinates for zoom
  const viewBox = useMemo(() => {
    const baseW = 1000;
    const baseH = 500;
    if (zoomLevel === 1 || !activeHotspot) {
      return "0 0 1000 500";
    }
    const currentW = baseW / zoomLevel;
    const currentH = baseH / zoomLevel;
    const targetX = activeHotspot.svgCoordinates.x;
    const targetY = activeHotspot.svgCoordinates.y;

    const minX = Math.max(0, Math.min(baseW - currentW, targetX - currentW / 2));
    const minY = Math.max(0, Math.min(baseH - currentH, targetY - currentH / 2));

    return `${minX.toFixed(1)} ${minY.toFixed(1)} ${currentW.toFixed(1)} ${currentH.toFixed(1)}`;
  }, [zoomLevel, activeHotspot]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(2.5, Number((prev + 0.5).toFixed(1))));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(1, Number((prev - 0.5).toFixed(1))));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setActiveTheater("all");
  };

  const handleTheaterChange = (theater: TheaterFilter) => {
    setActiveTheater(theater);
    // Find first hotspot in this theater and select it
    const firstInTheater = hotspots.find((h) => matchesTheater(h.id, theater));
    if (firstInTheater && theater !== "all") {
      onSelectHotspot(firstInTheater.id);
      setZoomLevel(1.5);
    } else if (theater === "all") {
      setZoomLevel(1);
    }
  };

  return (
    <div className={`relative flex flex-col rounded-2xl border border-slate-800 bg-[#090d14] text-slate-100 shadow-2xl overflow-hidden ${className}`}>
      {/* Top Tactical Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/70 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-black tracking-widest text-cyan-400 uppercase">
              PRISMA TACTICAL RADAR
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-slate-400">
              WGS-84 // GRID 30°x20° // CYLINDRICAL
            </span>
          </div>
        </div>

        {/* Theater Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-xs font-mono">
          {THEATER_OPTIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTheaterChange(t.id)}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activeTheater === t.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tactical Map Controls */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setRadarActive((prev) => !prev)}
            title={radarActive ? "Desativar Varredura de Radar" : "Ativar Varredura de Radar"}
            aria-label="Alternar Varredura de Radar"
            className={`flex h-7 items-center gap-1 rounded border px-2 text-[10px] uppercase font-bold transition-colors ${
              radarActive
                ? "border-cyan-500/50 bg-cyan-950/40 text-cyan-300"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Radio className="h-3 w-3" />
            <span className="hidden sm:inline">Radar</span>
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2.5}
            title="Aproximar Mapa (Zoom In)"
            aria-label="Aproximar Mapa"
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 disabled:opacity-40"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            title="Afastar Mapa (Zoom Out)"
            aria-label="Afastar Mapa"
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 disabled:opacity-40"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Restaurar Visão Global"
            aria-label="Restaurar Visão Global"
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full aspect-[2/1] select-none bg-[#070b12] overflow-hidden">
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full transition-all duration-500 ease-out"
          style={{ willChange: "transform" }}
        >
          <defs>
            {/* Dark Ocean Tactical Radial Gradient */}
            <radialGradient id="tacticalOceanGlow" cx="60%" cy="40%" r="75%">
              <stop offset="0%" stopColor="#0d1726" />
              <stop offset="60%" stopColor="#070b12" />
              <stop offset="100%" stopColor="#04060a" />
            </radialGradient>

            {/* Radar Sweep Gradient */}
            <linearGradient id="radarSweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.28)" />
              <stop offset="70%" stopColor="rgba(6, 182, 212, 0.05)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0)" />
            </linearGradient>

            {/* Pulse Filters for High Contrast */}
            <filter id="tacticalGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* In-SVG Keyframe Animations for Standalone Singlefile Execution */}
            <style>
              {`
                @keyframes tacticalSweep {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes pulseRing {
                  0% { r: 5; opacity: 0.9; stroke-width: 1.5; }
                  70% { r: 18; opacity: 0.1; stroke-width: 0.8; }
                  100% { r: 24; opacity: 0; stroke-width: 0; }
                }
                @keyframes pulseRingFast {
                  0% { r: 6; opacity: 1; stroke-width: 2; }
                  50% { r: 22; opacity: 0.15; stroke-width: 1; }
                  100% { r: 30; opacity: 0; stroke-width: 0; }
                }
                @keyframes targetBlink {
                  0%, 100% { opacity: 0.9; }
                  50% { opacity: 0.3; }
                }
                .anim-sweep {
                  transform-origin: 650px 180px;
                  animation: tacticalSweep 9s linear infinite;
                }
                .anim-pulse-critical {
                  animation: pulseRingFast 1.8s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
                }
                .anim-pulse-high {
                  animation: pulseRing 2.4s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
                }
                .anim-target-lock {
                  animation: targetBlink 1.4s ease-in-out infinite;
                }
              `}
            </style>
          </defs>

          {/* Layer 0: Background Ocean */}
          <rect x="0" y="0" width="1000" height="500" fill="url(#tacticalOceanGlow)" />

          {/* Layer 1: Tactical Coordinate Grid (Parallels & Meridians) */}
          <g className="tactical-grid opacity-35" stroke="#1e293b" strokeWidth="0.6" strokeDasharray="3 4">
            {/* Parallels (Latitudes: 80°N to 80°S, step 20° = 55.5px) */}
            {[55, 111, 166, 222, 277, 333, 388, 444].map((y) => (
              <line key={`lat-${y}`} x1="0" y1={y} x2="1000" y2={y} />
            ))}
            {/* Meridians (Longitudes: -150° to +150°, step 30° = 83.3px) */}
            {[83, 166, 250, 333, 416, 500, 583, 666, 750, 833, 916].map((x) => (
              <line key={`lon-${x}`} x1={x} y1="0" x2={x} y2="500" />
            ))}
          </g>

          {/* Equator & Prime Meridian Highlights */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.35" strokeDasharray="6 3" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.35" strokeDasharray="6 3" />

          {/* Layer 2: Continental Landmasses */}
          <g className="tactical-continents">
            {CONTINENTS.map((continent) => (
              <path
                key={continent.id}
                d={continent.d}
                fill="#162032"
                stroke="#334155"
                strokeWidth="0.9"
                className="transition-colors hover:fill-[#1a273d]"
              >
                <title>{continent.name}</title>
              </path>
            ))}
          </g>

          {/* Layer 3: Strategic Maritime Chokepoint Corridors */}
          <g className="chokepoint-corridors" opacity="0.6">
            {CHOKEPOINT_CORRIDORS.map((corridor) => (
              <path
                key={corridor.id}
                d={corridor.path}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                className="transition-opacity hover:opacity-100"
              >
                <title>{corridor.name}</title>
              </path>
            ))}
          </g>

          {/* Layer 4: Rotating Radar Sweep (Operational Theater Center: Eurasian/Mideast Node 650, 180) */}
          {radarActive && (
            <g className="anim-sweep pointer-events-none" opacity="0.8">
              {/* Radar circular sector cone */}
              <path
                d="M 650 180 L 890 60 A 280 280 0 0 1 930 180 Z"
                fill="url(#radarSweepGradient)"
              />
              <line x1="650" y1="180" x2="930" y2="180" stroke="#06b6d4" strokeWidth="1.2" opacity="0.7" />
            </g>
          )}

          {/* Layer 5: Target Crosshair Lines (when a hotspot is selected) */}
          {activeHotspot && (
            <g className="tactical-crosshairs pointer-events-none" opacity="0.55">
              <line
                x1="0"
                y1={activeHotspot.svgCoordinates.y}
                x2="1000"
                y2={activeHotspot.svgCoordinates.y}
                stroke="#06b6d4"
                strokeWidth="0.75"
                strokeDasharray="4 4"
              />
              <line
                x1={activeHotspot.svgCoordinates.x}
                y1="0"
                x2={activeHotspot.svgCoordinates.x}
                y2="500"
                stroke="#06b6d4"
                strokeWidth="0.75"
                strokeDasharray="4 4"
              />
            </g>
          )}

          {/* Layer 6: 8 Strategic Hotspot Pins with Pulsing Severity Rings */}
          <g className="tactical-hotspots">
            {hotspots.map((hotspot) => {
              const isSelected = hotspot.id === selectedHotspotId;
              const isHovered = hotspot.id === hoveredHotspotId;
              const inTheater = matchesTheater(hotspot.id, activeTheater);
              const { x, y } = hotspot.svgCoordinates;
              const sev = hotspot.severity || hotspot.tensionLevel || "moderado";
              const colors = getSeverityColor(sev);

              // Dim hotspots outside current theater
              const opacityClass = inTheater ? "opacity-100" : "opacity-35";

              return (
                <g
                  key={hotspot.id}
                  className={`cursor-pointer transition-all duration-200 ${opacityClass}`}
                  onClick={() => onSelectHotspot(hotspot.id)}
                  onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                  onMouseLeave={() => setHoveredHotspotId(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${hotspot.title} (${sev})`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectHotspot(hotspot.id);
                    }
                  }}
                >
                  {/* Outer Pulsing Wave Ring */}
                  {sev === "critico" && (
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill="none"
                      stroke={colors.stroke}
                      className="anim-pulse-critical pointer-events-none"
                    />
                  )}
                  {sev === "alto" && (
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="none"
                      stroke={colors.stroke}
                      className="anim-pulse-high pointer-events-none"
                    />
                  )}

                  {/* Halo Glow Ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 10 : isHovered ? 8 : 6}
                    fill={colors.glow}
                    stroke={colors.stroke}
                    strokeWidth={isSelected ? 1.8 : 1.2}
                    filter="url(#tacticalGlow)"
                  />

                  {/* Core Solid Pin */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 4.5 : 3.5}
                    fill={colors.fill}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />

                  {/* Tactical Target Lock Reticle (when selected or hovered) */}
                  {(isSelected || isHovered) && (
                    <g className="anim-target-lock pointer-events-none">
                      {/* Reticle brackets around pin */}
                      <path
                        d={`
                          M ${x - 12} ${y - 6} L ${x - 12} ${y - 12} L ${x - 6} ${y - 12}
                          M ${x + 6} ${y - 12} L ${x + 12} ${y - 12} L ${x + 12} ${y - 6}
                          M ${x + 12} ${y + 6} L ${x + 12} ${y + 12} L ${x + 6} ${y + 12}
                          M ${x - 6} ${y + 12} L ${x - 12} ${y + 12} L ${x - 12} ${y + 6}
                        `}
                        fill="none"
                        stroke={isSelected ? "#06b6d4" : colors.stroke}
                        strokeWidth="1.2"
                      />
                      {/* Center Crosshair ticks */}
                      <line x1={x - 4} y1={y} x2={x + 4} y2={y} stroke="#06b6d4" strokeWidth="0.8" />
                      <line x1={x} y1={y - 4} x2={x} y2={y + 4} stroke="#06b6d4" strokeWidth="0.8" />
                    </g>
                  )}

                  {/* Tactical Label Pill above/below pin */}
                  <g
                    transform={`translate(${x}, ${y > 400 ? y - 18 : y + 16})`}
                    className="pointer-events-none"
                  >
                    <rect
                      x={-42}
                      y={-9}
                      width={84}
                      height={18}
                      rx={3}
                      fill="rgba(9, 13, 20, 0.88)"
                      stroke={isSelected ? "#06b6d4" : isHovered ? colors.stroke : "#334155"}
                      strokeWidth={isSelected ? 1.4 : 0.8}
                    />
                    <text
                      x={0}
                      y={3.5}
                      textAnchor="middle"
                      fill={isSelected ? "#38bdf8" : "#f1f5f9"}
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                      letterSpacing="0.05em"
                    >
                      {hotspot.title.length > 13 ? `${hotspot.title.slice(0, 12)}…` : hotspot.title}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Layer 7: Corner Military-Spec Tactical Telemetry Brackets */}
          <g className="tactical-corners pointer-events-none" stroke="#0ea5e9" strokeWidth="1.2" opacity="0.6">
            {/* Top-Left */}
            <path d="M 8 28 L 8 8 L 28 8" fill="none" />
            <text x="32" y="18" fill="#0ea5e9" fontSize="8" fontFamily="monospace" fontWeight="bold">
              SYS::PRISMA_GLOBAL_MAP
            </text>

            {/* Top-Right */}
            <path d="M 972 8 L 992 8 L 992 28" fill="none" />
            <text x="965" y="18" textAnchor="end" fill="#0ea5e9" fontSize="8" fontFamily="monospace">
              STATUS::ONLINE [8/8 HOTSPOTS ACTIVE]
            </text>

            {/* Bottom-Left */}
            <path d="M 8 472 L 8 492 L 28 492" fill="none" />
            <text x="32" y="488" fill="#64748b" fontSize="7.5" fontFamily="monospace">
              COORDS::PLATE_CARREE_1000x500 // WGS84
            </text>

            {/* Bottom-Right */}
            <path d="M 972 492 L 992 492 L 992 472" fill="none" />
            <text x="965" y="488" textAnchor="end" fill="#64748b" fontSize="7.5" fontFamily="monospace">
              ZOOM::{zoomLevel.toFixed(1)}x // THEATER::{activeTheater.toUpperCase()}
            </text>
          </g>
        </svg>

        {/* Selected Hotspot Bottom HUD Bar */}
        {activeHotspot && (
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-500/30 bg-slate-950/85 px-3.5 py-2 backdrop-blur-md font-mono text-xs">
            <div className="flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
              <div>
                <span className="font-bold text-slate-100">{activeHotspot.title}</span>
                <span className="ml-2 text-[10px] text-slate-400">
                  [{activeHotspot.region}] • LAT {activeHotspot.coordinates.lat}° // LNG {activeHotspot.coordinates.lng}°
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  activeHotspot.severity === "critico"
                    ? "bg-red-950/80 text-red-300 border border-red-500/40"
                    : activeHotspot.severity === "alto"
                    ? "bg-orange-950/80 text-orange-300 border border-orange-500/40"
                    : "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                }`}
              >
                <ShieldAlert className="h-3 w-3" />
                {activeHotspot.severity}
              </span>
              <span className="text-[10px] text-cyan-300 font-semibold">
                Score: {activeHotspot.tensionScore ?? 85}/100
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 bg-slate-950/60 px-4 py-2 font-mono text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-semibold text-slate-300 uppercase">Severidade:</span>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 ring-2 ring-red-500/40" />
            <span className="text-slate-300">Crítico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-500 ring-2 ring-orange-500/40" />
            <span className="text-slate-300">Alto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 ring-2 ring-yellow-500/40" />
            <span className="text-slate-300">Moderado</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 bg-cyan-400" />
            <span>Corredores Estratégicos</span>
          </span>
          <span className="text-slate-400">Toque em qualquer pin para abrir inteligência</span>
        </div>
      </div>
    </div>
  );
};

export default TacticalWorldMap;

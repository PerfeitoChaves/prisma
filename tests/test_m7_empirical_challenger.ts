/**
 * Adversarial & Empirical Test Suite for Milestone M7:
 * Responsive Tactical SVG Global Map, Hotspot Pins, Severity Pulses, Coordinates & Mobile Toggle
 *
 * Executed via: npx tsx tests/test_m7_empirical_challenger.ts
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import ReactDOMServer from "react-dom/server";

// Mock image extensions for Node/tsx loader
// @ts-ignore
require.extensions[".jpg"] = () => "";
// @ts-ignore
require.extensions[".png"] = () => "";
// @ts-ignore
require.extensions[".svg"] = () => "";

const {
  HOTSPOTS,
  getHotspot,
  getHotspotById,
  normalizeHotspotId,
  filterHotspotsBySeverity,
} = require("../client/src/data/geopolitics");

const {
  CONTINENTS,
  CHOKEPOINT_CORRIDORS,
} = require("../client/src/components/geopolitics/worldMapPaths");

const { TacticalWorldMap } = require("../client/src/components/geopolitics/TacticalWorldMap");
const { HotspotsFeed } = require("../client/src/components/geopolitics/HotspotsFeed");
const { HotspotIntelligencePanel } = require("../client/src/components/geopolitics/HotspotIntelligencePanel");
const { TensionsView } = require("../client/src/components/geopolitics/TensionsView");
const { TopBar, Dock } = require("../client/src/components/Chrome");

console.log("================================================================================");
console.log("CHALLENGER 1: ADVERSARIAL EMPIRICAL VERIFICATION — MILESTONE M7");
console.log("================================================================================\n");

let passedCount = 0;
let totalCount = 0;
const failureList: string[] = [];

function challenge(title: string, fn: () => void) {
  totalCount++;
  try {
    fn();
    console.log(`  ✅ PASS: ${title}`);
    passedCount++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${title}`);
    console.error(`     Reason: ${err?.message || err}`);
    failureList.push(`${title} -> ${err?.message || err}`);
  }
}

// ============================================================================
// SUITE 1: SVG CANVAS, COORDINATE BOUNDS & PROJECTION ACCURACY
// ============================================================================
console.log("--- Suite 1: SVG Coordinate Bounds & Equirectangular Projection ---");

challenge("Canvas dimension bounds: all 8 hotspots reside strictly inside [0, 1000] x [0, 500]", () => {
  assert.strictEqual(HOTSPOTS.length, 8, "Exactly 8 hotspots defined");
  for (const h of HOTSPOTS) {
    assert(h.svgCoordinates.x >= 20 && h.svgCoordinates.x <= 980, `${h.id} X ${h.svgCoordinates.x} within [20, 980] margins`);
    assert(h.svgCoordinates.y >= 20 && h.svgCoordinates.y <= 480, `${h.id} Y ${h.svgCoordinates.y} within [20, 480] margins`);
  }
});

challenge("Hotspot minimum separation distance (collision avoidance >= 25px)", () => {
  for (let i = 0; i < HOTSPOTS.length; i++) {
    for (let j = i + 1; j < HOTSPOTS.length; j++) {
      const h1 = HOTSPOTS[i];
      const h2 = HOTSPOTS[j];
      const dx = h1.svgCoordinates.x - h2.svgCoordinates.x;
      const dy = h1.svgCoordinates.y - h2.svgCoordinates.y;
      const dist = Math.hypot(dx, dy);
      assert(dist >= 25, `Distance between ${h1.id} and ${h2.id} must be >= 25px (actual: ${dist.toFixed(1)}px)`);
    }
  }
});

challenge("Plate Carrée projection math matches coordinates within 5px tolerance", () => {
  for (const h of HOTSPOTS) {
    const expectedX = ((h.coordinates.lng + 180) / 360) * 1000;
    const expectedY = ((90 - h.coordinates.lat) / 180) * 500;
    const diffX = Math.abs(h.svgCoordinates.x - expectedX);
    const diffY = Math.abs(h.svgCoordinates.y - expectedY);
    assert(diffX <= 5, `${h.id} X projection diff <= 5px (diff: ${diffX.toFixed(2)})`);
    assert(diffY <= 5, `${h.id} Y projection diff <= 5px (diff: ${diffY.toFixed(2)})`);
  }
});

challenge("Reticle brackets and label pills stay within canvas bounding box", () => {
  for (const h of HOTSPOTS) {
    const { x, y } = h.svgCoordinates;
    // Reticle brackets extend ±12px
    assert(x - 12 >= 0 && x + 12 <= 1000, `${h.id} reticle x bounds`);
    assert(y - 12 >= 0 && y + 12 <= 500, `${h.id} reticle y bounds`);
    // Label pill width is 84px (±42px)
    assert(x - 42 >= 0 && x + 42 <= 1000, `${h.id} label pill horizontal bounds`);
  }
});

// ============================================================================
// SUITE 2: CONTINENTAL LANDMASSES & CHOKEPOINT CORRIDORS
// ============================================================================
console.log("\n--- Suite 2: Continental Landmasses & Maritime Corridors ---");

challenge("All continent paths parse as valid closed SVG polylines within canvas [1000x500]", () => {
  assert(CONTINENTS.length >= 7, `CONTINENTS array has ${CONTINENTS.length} entries`);
  for (const c of CONTINENTS) {
    assert(typeof c.id === "string" && c.id.length > 0);
    assert(typeof c.name === "string" && c.name.length > 0);
    assert(c.d.startsWith("M"), `Continent ${c.id} path begins with M`);
    assert(c.d.includes("Z"), `Continent ${c.id} path closes with Z`);

    // Extract all numbers in path string
    const numbers = c.d.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
    assert(numbers.length >= 6, `Continent ${c.id} has sufficient vertices`);
    for (let k = 0; k < numbers.length; k += 2) {
      const px = numbers[k];
      const py = numbers[k + 1];
      if (py !== undefined) {
        assert(px >= 0 && px <= 1000, `Continent ${c.id} X vertex ${px} in [0, 1000]`);
        assert(py >= 0 && py <= 500, `Continent ${c.id} Y vertex ${py} in [0, 500]`);
      }
    }
  }
});

challenge("All strategic chokepoint corridors are valid SVG paths and connect near hotspot pins", () => {
  assert.strictEqual(CHOKEPOINT_CORRIDORS.length, 4, "CHOKEPOINT_CORRIDORS has exactly 4 strategic corridors");
  const corridorMap = new Map(CHOKEPOINT_CORRIDORS.map((cp: any) => [cp.id, cp]));

  const west = corridorMap.get("energy_corridor_west");
  assert(west, "energy_corridor_west exists");
  assert(west.path.includes("656 176"), "West energy corridor connects to Ormuz (656, 176)");
  assert(west.path.includes("621 213"), "West energy corridor connects to Mar Vermelho (621, 213)");
  assert(west.path.includes("596 163"), "West energy corridor connects to Gaza/Suez (596, 163)");

  const east = corridorMap.get("energy_corridor_east");
  assert(east, "energy_corridor_east exists");
  assert(east.path.includes("656 176"), "East energy corridor starts at Ormuz (656, 176)");
  assert(east.path.includes("835 183"), "East energy corridor connects to Taiwan (835, 183)");
  assert(east.path.includes("854 144"), "East energy corridor connects to Coreia (854, 144)");

  const essequibo = corridorMap.get("atlantic_essequibo_corridor");
  assert(essequibo, "atlantic_essequibo_corridor exists");
  assert(essequibo.path.includes("572 210"), "Atlantic corridor connects Sahel (572, 210)");
  assert(essequibo.path.includes("336 232"), "Atlantic corridor connects Essequibo (336, 232)");

  const blackSea = corridorMap.get("black_sea_corridor");
  assert(blackSea, "black_sea_corridor exists");
  assert(blackSea.path.includes("588 114"), "Black sea corridor starts at Ucrânia (588, 114)");
  assert(blackSea.path.includes("596 163"), "Black sea corridor connects to Eastern Mediterranean (596, 163)");
});

// ============================================================================
// SUITE 3: SEVERITY PULSE EFFECTS & TENSION MAPPINGS
// ============================================================================
console.log("\n--- Suite 3: Severity Pulses & Keyframe Animations ---");

challenge("Exact severity distribution (4 critico, 2 alto, 2 moderado)", () => {
  const criticos = HOTSPOTS.filter((h: any) => h.severity === "critico");
  const altos = HOTSPOTS.filter((h: any) => h.severity === "alto");
  const moderados = HOTSPOTS.filter((h: any) => h.severity === "moderado");

  assert.strictEqual(criticos.length, 4);
  assert.strictEqual(altos.length, 2);
  assert.strictEqual(moderados.length, 2);

  const criticoIds = new Set(criticos.map((h: any) => h.id));
  assert(criticoIds.has("ormuz"));
  assert(criticoIds.has("ucrania"));
  assert(criticoIds.has("mar_vermelho"));
  assert(criticoIds.has("gaza"));

  const altoIds = new Set(altos.map((h: any) => h.id));
  assert(altoIds.has("taiwan"));
  assert(altoIds.has("coreia"));

  const moderadoIds = new Set(moderados.map((h: any) => h.id));
  assert(moderadoIds.has("sahel"));
  assert(moderadoIds.has("essequibo"));
});

challenge("Embedded SVG styles define tacticalSweep, pulseRing, pulseRingFast, and targetBlink", () => {
  const mapCode = fs.readFileSync(
    path.resolve(__dirname, "../client/src/components/geopolitics/TacticalWorldMap.tsx"),
    "utf-8"
  );
  assert(mapCode.includes("@keyframes tacticalSweep"), "Contains tacticalSweep keyframes");
  assert(mapCode.includes("@keyframes pulseRing"), "Contains pulseRing keyframes");
  assert(mapCode.includes("@keyframes pulseRingFast"), "Contains pulseRingFast keyframes");
  assert(mapCode.includes("@keyframes targetBlink"), "Contains targetBlink keyframes");
  assert(mapCode.includes("anim-pulse-critical"), "Contains anim-pulse-critical class");
  assert(mapCode.includes("anim-pulse-high"), "Contains anim-pulse-high class");
});

// ============================================================================
// SUITE 4: DYNAMIC VIEWBOX ZOOM CALCULATIONS & CLAMPING
// ============================================================================
console.log("\n--- Suite 4: Dynamic Zoom & ViewBox Bounds Clamping ---");

function calculateViewBox(
  zoomLevel: number,
  targetHotspot: { svgCoordinates: { x: number; y: number } } | null
): string {
  const baseW = 1000;
  const baseH = 500;
  if (zoomLevel === 1 || !targetHotspot) {
    return "0 0 1000 500";
  }
  const currentW = baseW / zoomLevel;
  const currentH = baseH / zoomLevel;
  const targetX = targetHotspot.svgCoordinates.x;
  const targetY = targetHotspot.svgCoordinates.y;

  const minX = Math.max(0, Math.min(baseW - currentW, targetX - currentW / 2));
  const minY = Math.max(0, Math.min(baseH - currentH, targetY - currentH / 2));

  return `${minX.toFixed(1)} ${minY.toFixed(1)} ${currentW.toFixed(1)} ${currentH.toFixed(1)}`;
}

challenge("ViewBox calculation clamps cleanly across all 8 hotspots at zoom levels [1.0, 1.5, 2.0, 2.5]", () => {
  const zoomLevels = [1.0, 1.5, 2.0, 2.5];

  for (const zoom of zoomLevels) {
    for (const h of HOTSPOTS) {
      const vb = calculateViewBox(zoom, h);
      const parts = vb.split(" ").map(Number);
      assert.strictEqual(parts.length, 4, `ViewBox ${vb} has 4 components`);
      const [minX, minY, currentW, currentH] = parts;

      if (zoom === 1.0) {
        assert.deepStrictEqual(parts, [0, 0, 1000, 500], `At zoom 1.0, viewBox is full canvas`);
      } else {
        assert(minX >= 0, `minX >= 0 (actual: ${minX})`);
        assert(minY >= 0, `minY >= 0 (actual: ${minY})`);
        assert(minX + currentW <= 1000.01, `minX + currentW <= 1000 (actual: ${minX + currentW})`);
        assert(minY + currentH <= 500.01, `minY + currentH <= 500 (actual: ${minY + currentH})`);
        assert(Math.abs(currentW - 1000 / zoom) < 0.2, `currentW matches baseW/zoom`);
        assert(Math.abs(currentH - 500 / zoom) < 0.2, `currentH matches baseH/zoom`);
      }
    }
  }
});

challenge("ViewBox calculation handles extreme coordinates gracefully without NaN or negative values", () => {
  const extremeCoords = [
    { svgCoordinates: { x: 0, y: 0 } },
    { svgCoordinates: { x: 1000, y: 500 } },
    { svgCoordinates: { x: 500, y: 250 } },
    { svgCoordinates: { x: -100, y: -50 } }, // out of bounds
    { svgCoordinates: { x: 1200, y: 700 } }, // out of bounds
  ];

  for (const target of extremeCoords) {
    const vb = calculateViewBox(2.0, target);
    const [minX, minY, currentW, currentH] = vb.split(" ").map(Number);
    assert(!isNaN(minX) && !isNaN(minY) && !isNaN(currentW) && !isNaN(currentH), "No NaNs in viewBox");
    assert(minX >= 0 && minX <= 500, `minX clamped in [0, 500], actual: ${minX}`);
    assert(minY >= 0 && minY <= 250, `minY clamped in [0, 250], actual: ${minY}`);
  }
});

// ============================================================================
// SUITE 5: THEATER FILTERING & THEATER PARTITION
// ============================================================================
console.log("\n--- Suite 5: Operational Theaters & Hotspots Partition ---");

function matchesTheater(hotspotId: string, theater: string): boolean {
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

challenge("Theaters form a complete and mutually exclusive partition of all 8 hotspots", () => {
  const specificTheaters = ["middle_east", "europe", "asia", "americas_africa"];
  const counts: Record<string, number> = {};

  for (const t of specificTheaters) {
    counts[t] = HOTSPOTS.filter((h: any) => matchesTheater(h.id, t)).length;
  }

  assert.strictEqual(counts["middle_east"], 3, "Middle East has 3 hotspots");
  assert.strictEqual(counts["europe"], 1, "Europe has 1 hotspot");
  assert.strictEqual(counts["asia"], 2, "Asia has 2 hotspots");
  assert.strictEqual(counts["americas_africa"], 2, "Americas & Africa has 2 hotspots");

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  assert.strictEqual(total, 8, "Total across specific theaters equals exactly 8");

  // Check mutual exclusivity: each hotspot matches exactly 1 specific theater
  for (const h of HOTSPOTS) {
    const matchingTheaters = specificTheaters.filter((t) => matchesTheater(h.id, t));
    assert.strictEqual(matchingTheaters.length, 1, `Hotspot ${h.id} belongs to exactly 1 theater (${matchingTheaters.join(",")})`);
  }
});

// ============================================================================
// SUITE 6: MOBILE TOGGLE & DUAL-VIEW INTEGRATION
// ============================================================================
console.log("\n--- Suite 6: Mobile Toggle & Dual View Mode Logic ---");

challenge("TensionsView contains segmented toggle for 'Mapa Vetorial' and 'Feed de Focos'", () => {
  const code = fs.readFileSync(
    path.resolve(__dirname, "../client/src/components/geopolitics/TensionsView.tsx"),
    "utf-8"
  );
  assert(code.includes("Mapa Vetorial SVG"), "Contains 'Mapa Vetorial SVG' button label");
  assert(code.includes("Feed de Focos de Crise"), "Contains 'Feed de Focos de Crise' button label");
  assert(code.includes('setViewMode("mapa")'), "Has setViewMode('mapa') handler");
  assert(code.includes('setViewMode("feed")'), "Has setViewMode('feed') handler");
  assert(code.includes("HotspotsFeed"), "Mounts HotspotsFeed component");
  assert(code.includes("TacticalWorldMap"), "Mounts TacticalWorldMap component");
  assert(code.includes("HotspotIntelligencePanel"), "Mounts HotspotIntelligencePanel in both views");
});

challenge("HotspotsFeed provides 'Ver no Mapa' switch callback and severity filters", () => {
  const code = fs.readFileSync(
    path.resolve(__dirname, "../client/src/components/geopolitics/HotspotsFeed.tsx"),
    "utf-8"
  );
  assert(code.includes("onSwitchToMap"), "HotspotsFeed supports onSwitchToMap prop");
  assert(code.includes("Ver no Mapa"), "Contains 'Ver no Mapa' button");
  assert(code.includes("setFilterSeverity"), "HotspotsFeed has severity filtering");
  assert(code.includes("setSortBy"), "HotspotsFeed has sorting support");
});

challenge("Chrome.tsx TopBar and Dock include 'tensoes' tab and 7-column layout", () => {
  const code = fs.readFileSync(
    path.resolve(__dirname, "../client/src/components/Chrome.tsx"),
    "utf-8"
  );
  assert(code.includes('["tensoes", "Tensões"]'), "TopBar has Tensões item");
  assert(code.includes("grid-cols-7"), "Dock uses grid-cols-7");
  assert(code.includes('id: "tensoes"'), "Dock defines tensoes item");
  assert(code.includes("Globe"), "Dock uses Globe icon");
});

challenge("App.tsx implements openTensoes dispatcher and URL hash deep-linking (#tensoes?hotspot=...)", () => {
  const code = fs.readFileSync(
    path.resolve(__dirname, "../client/src/App.tsx"),
    "utf-8"
  );
  assert(code.includes("openTensoes"), "App.tsx defines openTensoes");
  assert(code.includes("history.replaceState"), "App.tsx updates window history with hash");
  assert(code.includes('#tensoes?hotspot='), "App.tsx formats #tensoes?hotspot= hash");
  assert(code.includes('hash.startsWith("#tensoes")'), "App.tsx listens to #tensoes hashchange");
  assert(code.includes("normalizeHotspotId"), "App.tsx sanitizes hotspot hash parameter defensively");
});

// ============================================================================
// SUITE 7: REACT SSR / HEADLESS DOM RENDERING TESTS
// ============================================================================
console.log("\n--- Suite 7: React SSR / Headless DOM Rendering Verification ---");

challenge("TacticalWorldMap renders to pure SVG string with all 8 hotspots and radar sweep", () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(TacticalWorldMap, {
      hotspots: HOTSPOTS,
      selectedHotspotId: "ormuz",
      onSelectHotspot: () => {},
    })
  );

  assert(html.includes("<svg"), "HTML contains <svg>");
  assert(html.includes('viewBox="0 0 1000 500"'), "HTML contains base viewBox");
  assert(html.includes("PRISMA TACTICAL RADAR"), "HTML contains radar header");
  assert(html.includes("anim-sweep"), "HTML contains rotating radar sweep element");
  assert(html.includes("anim-pulse-critical"), "HTML contains critical pulse elements");

  // Check all 8 hotspot titles rendered in SVG (accounting for HTML entity escaping of &)
  for (const h of HOTSPOTS) {
    const truncated = h.title.length > 13 ? h.title.slice(0, 12) : h.title;
    const escaped = truncated.replace(/&/g, "&amp;");
    assert(html.includes(escaped), `SVG rendered text for ${h.id} (${escaped})`);
  }
});

challenge("TacticalWorldMap renders cleanly when selectedHotspotId is null or invalid", () => {
  const htmlNull = ReactDOMServer.renderToString(
    React.createElement(TacticalWorldMap, {
      hotspots: HOTSPOTS,
      selectedHotspotId: null,
      onSelectHotspot: () => {},
    })
  );
  assert(htmlNull.includes("<svg"), "Rendered cleanly with null selection");

  const htmlInvalid = ReactDOMServer.renderToString(
    React.createElement(TacticalWorldMap, {
      hotspots: HOTSPOTS,
      selectedHotspotId: "non-existent-hotspot",
      onSelectHotspot: () => {},
    })
  );
  assert(htmlInvalid.includes("<svg"), "Rendered cleanly with invalid selection");
});

challenge("HotspotsFeed renders mobile cards with tension bars and actor flags", () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(HotspotsFeed, {
      hotspots: HOTSPOTS,
      selectedHotspotId: "taiwan",
      onSelectHotspot: () => {},
      onSwitchToMap: () => {},
      onOpenComparator: () => {},
    })
  );

  // Clean React 19 SSR comment delimiters <!-- -->
  const cleanHtml = html.replace(/<!--.*?-->/g, "");
  assert(cleanHtml.includes("Focos Ativos de Crise (8)"), "Feed rendered header count");
  assert(cleanHtml.includes("Estreito de Taiwan"), "Feed rendered Taiwan card");
  assert(cleanHtml.includes("Estreito de Ormuz"), "Feed rendered Ormuz card");
  assert(cleanHtml.includes("Ver no Mapa"), "Feed rendered 'Ver no Mapa' button");
  assert(cleanHtml.includes("Comparar"), "Feed rendered 'Comparar' button");
});

challenge("HotspotIntelligencePanel renders dossier with actors and handles null gracefully", () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(HotspotIntelligencePanel, {
      hotspot: HOTSPOTS[0],
      allStories: [],
    })
  );
  assert(html.includes("DOSSIÊ GEOESTRATÉGICO"), "Panel rendered dossier header");
  assert(html.includes(HOTSPOTS[0].title), "Panel rendered active hotspot title");
  assert(html.includes("Atores Centrais Envolvidos"), "Panel rendered actors section");

  // Null hotspot test
  const htmlNull = ReactDOMServer.renderToString(
    React.createElement(HotspotIntelligencePanel, {
      hotspot: null,
      allStories: [],
    })
  );
  assert(htmlNull.includes("Nenhum Foco de Tensão Selecionado"), "Null hotspot displays graceful empty state");
});

challenge("TensionsView mounts full view orchestrator with quick selector pills", () => {
  const html = ReactDOMServer.renderToString(
    React.createElement(TensionsView, {
      stories: [],
      selectedHotspotId: "mar_vermelho",
      onSelectHotspot: () => {},
      onCompare: () => {},
      onRead: () => {},
    })
  );

  assert(html.includes("SALA DE OPERAÇÕES GEOPOLÍTICAS"), "Rendered operations banner");
  assert(html.includes("Focos Rápidos:"), "Rendered quick jump pills bar");
  assert(html.includes("Mapa Vetorial SVG"), "Rendered map toggle");
  assert(html.includes("Feed de Focos de Crise"), "Rendered feed toggle");
  assert(html.includes("Mar Vermelho &amp; Bab el-Mandeb") || html.includes("Mar Vermelho"), "Rendered active hotspot title");
});

// ============================================================================
// SUMMARY & EXIT
// ============================================================================
console.log("\n================================================================================");
console.log(`CHALLENGER 1 RESULTS: ${passedCount} / ${totalCount} TESTS PASSED`);
if (failureList.length > 0) {
  console.log("FAILURES OCCURRED:");
  for (const f of failureList) {
    console.error(`  - ${f}`);
  }
}
console.log("================================================================================\n");

process.exit(failureList.length > 0 ? 1 : 0);

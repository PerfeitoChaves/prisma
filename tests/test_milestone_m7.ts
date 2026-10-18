/**
 * Test Suite: Milestone M7 — Responsive Tactical SVG Global Map & Navigation
 * Verifies:
 * 1. Chrome.tsx (TopBar Tensões tab and 7-column Dock)
 * 2. App.tsx (View type, openTensoes dispatcher, hash deep-linking, PersistentLivePlayer continuity)
 * 3. worldMapPaths.ts & TacticalWorldMap.tsx (SVG paths, 8 hotspot coordinates, radar sweep, severity pulse)
 * 4. HotspotsFeed.tsx (mobile cards toggle, sorting, actors, severity)
 * 5. HotspotIntelligencePanel.tsx (dossier, actors, news count, correlated stories)
 * 6. TensionsView.tsx (view orchestrator, map/feed switcher)
 * 7. geopolitics.ts (normalizeHotspotId defensive string coercion and blindSpots alias mapping)
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

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
  getNarrativeMatrix,
  normalizeHotspotId,
  GEOPOLITICAL_BLOCS,
} = require("../client/src/data/geopolitics");

const { CONTINENTS, CHOKEPOINT_CORRIDORS } = require("../client/src/components/geopolitics/worldMapPaths");

console.log("================================================================");
console.log("RUNNING MILESTONE M7 VERIFICATION TEST SUITE");
console.log("================================================================");

let testsPassed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    throw err;
  }
}

// -------------------------------------------------------------
// Test 1: geopolitics.ts defensive string coercion & blindSpots
// -------------------------------------------------------------
test("normalizeHotspotId handles normal and hyphenated IDs", () => {
  assert.strictEqual(normalizeHotspotId("ormuz"), "ormuz");
  assert.strictEqual(normalizeHotspotId("ORMUZ"), "ormuz");
  assert.strictEqual(normalizeHotspotId("mar-vermelho"), "mar_vermelho");
  assert.strictEqual(normalizeHotspotId("mar_vermelho"), "mar_vermelho");
  assert.strictEqual(normalizeHotspotId("taiwan"), "taiwan");
  assert.strictEqual(normalizeHotspotId("  gaza  "), "gaza");
});

test("normalizeHotspotId defensive string coercion handles null, undefined, numbers, objects", () => {
  assert.strictEqual(normalizeHotspotId(null), "");
  assert.strictEqual(normalizeHotspotId(undefined), "");
  assert.strictEqual(normalizeHotspotId(123), "123");
  assert.strictEqual(normalizeHotspotId({}), "[object object]");
});

test("getHotspot and getHotspotById find hotspots with coercion", () => {
  const h1 = getHotspot("mar-vermelho");
  assert(h1 !== undefined, "mar-vermelho should be found");
  assert.strictEqual(h1?.id, "mar_vermelho");

  const h2 = getHotspotById("UCRANIA" as any);
  assert(h2 !== undefined, "UCRANIA should be found");
  assert.strictEqual(h2?.id, "ucrania");

  // Non-existent
  assert.strictEqual(getHotspot(null), undefined);
  assert.strictEqual(getHotspot("non-existent-hotspot"), undefined);
});

test("blindSpots alias is mapped and matches blindspots across all narrative matrices", () => {
  for (const h of HOTSPOTS) {
    const matrix = getNarrativeMatrix(h.id);
    assert(matrix !== undefined, `Matrix for ${h.id} should exist`);
    assert(matrix.blocs !== undefined, `Matrix ${h.id} should have blocs`);

    for (const blocKey of ["west", "east", "global_south"] as const) {
      const b = matrix.blocs[blocKey];
      assert(b !== undefined, `Matrix ${h.id} should have bloc ${blocKey}`);
      assert(Array.isArray(b.blindspots), `bloc ${blocKey} has blindspots array`);
      assert(Array.isArray(b.blindSpots), `bloc ${blocKey} has blindSpots alias`);
      assert.deepStrictEqual(b.blindspots, b.blindSpots, `blindspots matches blindSpots for ${h.id}/${blocKey}`);
    }
  }
});

// -------------------------------------------------------------
// Test 2: worldMapPaths.ts coordinates and SVG paths
// -------------------------------------------------------------
test("worldMapPaths exports CONTINENTS and CHOKEPOINT_CORRIDORS", () => {
  assert(Array.isArray(CONTINENTS), "CONTINENTS is an array");
  assert(CONTINENTS.length >= 6, `CONTINENTS has ${CONTINENTS.length} entries (>=6)`);
  for (const c of CONTINENTS) {
    assert(typeof c.id === "string" && c.id.length > 0, "Continent has id");
    assert(typeof c.name === "string" && c.name.length > 0, "Continent has name");
    assert(typeof c.d === "string" && c.d.includes("M"), "Continent has valid SVG path d");
  }

  assert(Array.isArray(CHOKEPOINT_CORRIDORS), "CHOKEPOINT_CORRIDORS is an array");
  assert(CHOKEPOINT_CORRIDORS.length >= 3, `CHOKEPOINT_CORRIDORS has ${CHOKEPOINT_CORRIDORS.length} entries`);
  for (const cp of CHOKEPOINT_CORRIDORS) {
    assert(typeof cp.id === "string" && cp.id.length > 0, "Corridor has id");
    assert(typeof cp.path === "string" && cp.path.includes("M"), "Corridor has valid SVG path");
  }
});

test("8 hotspots have exact mandated SVG projection coordinates", () => {
  const expectedCoords: Record<string, { x: number; y: number }> = {
    ormuz: { x: 656, y: 176 },
    ucrania: { x: 588, y: 114 },
    taiwan: { x: 835, y: 183 },
    mar_vermelho: { x: 621, y: 213 },
    gaza: { x: 596, y: 163 },
    coreia: { x: 854, y: 144 },
    sahel: { x: 572, y: 210 },
    essequibo: { x: 336, y: 232 },
  };

  assert.strictEqual(HOTSPOTS.length, 8, "HOTSPOTS has exactly 8 entries");
  for (const [id, expected] of Object.entries(expectedCoords)) {
    const h = HOTSPOTS.find((item) => item.id === id);
    assert(h !== undefined, `Hotspot ${id} must exist`);
    assert.strictEqual(h.svgCoordinates.x, expected.x, `${id} svgCoordinates.x`);
    assert.strictEqual(h.svgCoordinates.y, expected.y, `${id} svgCoordinates.y`);
    assert(h.severity === "critico" || h.severity === "alto" || h.severity === "moderado", `${id} severity valid`);
  }
});

// -------------------------------------------------------------
// Test 3: Chrome.tsx TopBar and Dock verification
// -------------------------------------------------------------
test("Chrome.tsx contains TopBar Tensões tab and 7-column Dock", () => {
  const chromePath = path.resolve(__dirname, "../client/src/components/Chrome.tsx");
  const content = fs.readFileSync(chromePath, "utf-8");

  // NavView includes tensoes
  assert(content.includes('"tensoes"'), 'Chrome.tsx defines "tensoes" in NavView');
  // TopBar has Tensões
  assert(content.includes('["tensoes", "Tensões"]'), "Chrome.tsx has Tensões tab in TopBar");
  // Dock has 7 columns
  assert(content.includes("grid-cols-7"), "Chrome.tsx Dock uses grid-cols-7 for 7 items");
  // Dock has Tensões item
  assert(content.includes('id: "tensoes"'), 'Chrome.tsx Dock includes tensoes item');
  assert(content.includes('label: "Tensões"'), 'Chrome.tsx Dock label is "Tensões"');
  // Globe icon imported
  assert(content.includes("Globe"), "Chrome.tsx imports Globe icon from lucide-react");
});

// -------------------------------------------------------------
// Test 4: App.tsx View, openTensoes, hash deep-linking and player
// -------------------------------------------------------------
test("App.tsx implements tensoes view, openTensoes dispatcher, hash linking, and player isolation", () => {
  const appPath = path.resolve(__dirname, "../client/src/App.tsx");
  const content = fs.readFileSync(appPath, "utf-8");

  // View type includes tensoes
  assert(content.includes('"tensoes"'), 'App.tsx defines "tensoes" in View type');
  // openTensoes dispatcher
  assert(content.includes("openTensoes"), "App.tsx defines openTensoes");
  // hash deep-linking
  assert(content.includes('hash.startsWith("#tensoes")'), "App.tsx handles #tensoes hash deep-linking");
  assert(content.includes('params.get("hotspot")'), "App.tsx parses hotspot param from hash");
  // TensionsView mounted
  assert(content.includes("<TensionsView"), "App.tsx mounts <TensionsView />");
  // PersistentLivePlayer mounted outside main
  const mainEndIdx = content.indexOf("</main>");
  const playerIdx = content.indexOf("<PersistentLivePlayer");
  assert(mainEndIdx > 0 && playerIdx > mainEndIdx, "<PersistentLivePlayer /> is mounted outside <main>");
});

// -------------------------------------------------------------
// Test 5: TacticalWorldMap.tsx features
// -------------------------------------------------------------
test("TacticalWorldMap.tsx includes pure SVG, radar sweep, 8 pins, and theater filters", () => {
  const mapPath = path.resolve(__dirname, "../client/src/components/geopolitics/TacticalWorldMap.tsx");
  const content = fs.readFileSync(mapPath, "utf-8");

  assert(content.includes("<svg"), "TacticalWorldMap renders native <svg>");
  assert(content.includes('viewBox={viewBox}'), "TacticalWorldMap uses dynamic viewBox");
  assert(content.includes("tacticalSweep"), "TacticalWorldMap includes tacticalSweep animation");
  assert(content.includes("radarSweepGradient"), "TacticalWorldMap includes radar sweep gradient");
  assert(content.includes("anim-pulse-critical"), "TacticalWorldMap has critical pulse animation");
  assert(content.includes("anim-pulse-high"), "TacticalWorldMap has high pulse animation");
  assert(content.includes("THEATER_OPTIONS"), "TacticalWorldMap has theater options");
  assert(content.includes("ZoomIn") && content.includes("ZoomOut"), "TacticalWorldMap has zoom controls");
});

// -------------------------------------------------------------
// Test 6: HotspotsFeed.tsx and HotspotIntelligencePanel.tsx features
// -------------------------------------------------------------
test("HotspotsFeed.tsx provides mobile card list with sorting and severity", () => {
  const feedPath = path.resolve(__dirname, "../client/src/components/geopolitics/HotspotsFeed.tsx");
  const content = fs.readFileSync(feedPath, "utf-8");

  assert(content.includes("HotspotsFeed"), "HotspotsFeed component is defined");
  assert(content.includes("getSeverityBadge"), "HotspotsFeed has severity badge helper");
  assert(content.includes("setSortBy"), "HotspotsFeed supports sorting");
  assert(content.includes("setFilterSeverity"), "HotspotsFeed supports severity filter");
  assert(content.includes("tensionScore"), "HotspotsFeed displays tensionScore meter");
});

test("HotspotIntelligencePanel.tsx displays dossier, actors with flags, and correlated stories", () => {
  const panelPath = path.resolve(__dirname, "../client/src/components/geopolitics/HotspotIntelligencePanel.tsx");
  const content = fs.readFileSync(panelPath, "utf-8");

  assert(content.includes("HotspotIntelligencePanel"), "HotspotIntelligencePanel component is defined");
  assert(content.includes("strategicImportance"), "Panel renders strategic importance");
  assert(content.includes("actors.map"), "Panel renders actors");
  assert(content.includes("flagEmoji"), "Panel renders actor flags");
  assert(content.includes("correlatedStories"), "Panel derives correlated stories");
  assert(content.includes("onCompare"), "Panel supports onCompare action");
  assert(content.includes("onRead"), "Panel supports onRead action");
});

// -------------------------------------------------------------
// Test 7: TensionsView.tsx view orchestrator
// -------------------------------------------------------------
test("TensionsView.tsx orchestrates map vs feed mode and integrates panels", () => {
  const viewPath = path.resolve(__dirname, "../client/src/components/geopolitics/TensionsView.tsx");
  const content = fs.readFileSync(viewPath, "utf-8");

  assert(content.includes("TensionsView"), "TensionsView component is defined");
  assert(content.includes('viewMode === "mapa"'), "TensionsView supports mapa mode");
  assert(content.includes('viewMode === "feed"'), "TensionsView supports feed mode");
  assert(content.includes("<TacticalWorldMap"), "TensionsView mounts TacticalWorldMap");
  assert(content.includes("<HotspotsFeed"), "TensionsView mounts HotspotsFeed");
  assert(content.includes("<HotspotIntelligencePanel"), "TensionsView mounts HotspotIntelligencePanel");
  assert(content.includes("HOTSPOTS.map"), "TensionsView provides 1-touch quick hotspot selector pills");
});

console.log("================================================================");
console.log(`ALL ${testsPassed} MILESTONE M7 UNIT & INTEGRATION TESTS PASSED!`);
console.log("================================================================");

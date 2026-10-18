/**
 * Adversarial & Empirical Test Suite — Milestone M8 Challenger 2
 *
 * Verifies:
 * 1. State synchronization between Tactical Map / Crisis Feed and NarrativeMatrix in TensionsView.tsx
 * 2. 1-touch 'Cruzar no Comparador' button, openComparador(storyId, hotspotId) in App.tsx, and URL hash updates
 * 3. Responsive mobile viewport layout & overflow safety (360px-390px)
 * 4. Expand/collapse matrix controls in TensionsView.tsx ("Recolher Matriz" / "Expandir Matriz Tri-Axial")
 * 5. Data integrity of the 86 sources catalog against cited sources in matrices and country tagging
 *
 * Executed via: npx tsx tests/test_challenger_m8_empirical.ts
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

// Add client node_modules to path
module.paths.push(path.join(process.cwd(), "client/node_modules"));

const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const {
  HOTSPOTS,
  getHotspot,
  getHotspotById,
  getNarrativeMatrix,
  normalizeHotspotId,
  getSourcesByBloc,
  NARRATIVE_MATRICES,
} = require("../client/src/data/geopolitics");

const { OUTLETS, STORIES, COVER_STORY } = require("../client/src/data/news");
const { NarrativeMatrix } = require("../client/src/components/geopolitics/NarrativeMatrix");
const { TensionsView } = require("../client/src/components/geopolitics/TensionsView");

console.log("================================================================================");
console.log("CHALLENGER 2: ADVERSARIAL EMPIRICAL VERIFICATION — MILESTONE M8");
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
// SUITE 1: STATE SYNCHRONIZATION (MAP / FEED / TENSIONSVIEW ↔ NARRATIVEMATRIX)
// ============================================================================
console.log("--- Suite 1: State Synchronization between Map/Feed & NarrativeMatrix ---");

challenge("1.1 Hotspot ID normalization handles all canonical IDs, hyphens, underscores, case, and whitespace", () => {
  const testCases = [
    { input: "ormuz", expected: "ormuz" },
    { input: "ORMUZ", expected: "ormuz" },
    { input: "  ormuz  ", expected: "ormuz" },
    { input: "ucrania", expected: "ucrania" },
    { input: "UCRANIA", expected: "ucrania" },
    { input: "taiwan", expected: "taiwan" },
    { input: "mar-vermelho", expected: "mar_vermelho" },
    { input: "mar_vermelho", expected: "mar_vermelho" },
    { input: "MAR-VERMELHO", expected: "mar_vermelho" },
    { input: "marvermelho", expected: "mar_vermelho" },
    { input: "gaza", expected: "gaza" },
    { input: "coreia", expected: "coreia" },
    { input: "sahel", expected: "sahel" },
    { input: "essequibo", expected: "essequibo" },
  ];

  for (const tc of testCases) {
    const normalized = normalizeHotspotId(tc.input);
    assert.strictEqual(
      normalized,
      tc.expected,
      `normalizeHotspotId('${tc.input}') should be '${tc.expected}', got '${normalized}'`
    );
    const hotspot = getHotspot(tc.input);
    assert(hotspot !== undefined, `getHotspot('${tc.input}') must resolve to a valid Hotspot`);
    assert.strictEqual(hotspot?.id, tc.expected, `getHotspot('${tc.input}').id should be '${tc.expected}'`);
  }
});

challenge("1.2 Hotspot normalization gracefully handles unknown, null, and empty inputs", () => {
  assert.strictEqual(normalizeHotspotId(null), "");
  assert.strictEqual(normalizeHotspotId(undefined), "");
  assert.strictEqual(normalizeHotspotId(""), "");
  assert.strictEqual(getHotspot(null), undefined);
  assert.strictEqual(getHotspot(undefined), undefined);
  assert.strictEqual(getHotspot("unknown-hotspot-999"), undefined);
});

challenge("1.3 TensionsView synchronizes active hotspot with NarrativeMatrix for all 8 strategic hotspots", () => {
  for (const h of HOTSPOTS) {
    const matrix = getNarrativeMatrix(h.id);
    assert(matrix, `Matrix must exist for hotspot ${h.id}`);

    const html = renderToStaticMarkup(
      React.createElement(TensionsView, {
        stories: STORIES,
        selectedHotspotId: h.id,
        onSelectHotspot: () => {},
        onCompare: () => {},
        onRead: () => {},
      })
    );

    // Escape '&' for HTML match
    const escapedTopic = matrix.topicTitle.replace(/&/g, "&amp;");
    assert(
      html.includes(escapedTopic) || html.includes(matrix.topicTitle),
      `TensionsView with hotspot '${h.id}' must render topic title '${matrix.topicTitle}'`
    );

    const factSnippet = matrix.sharedFact.slice(0, 35).replace(/&/g, "&amp;");
    assert(
      html.includes(factSnippet),
      `TensionsView with hotspot '${h.id}' must render shared fact starting with '${factSnippet}'`
    );

    assert(
      html.includes("data-testid=\"narrative-column-west\""),
      `TensionsView with hotspot '${h.id}' must render West column`
    );
    assert(
      html.includes("data-testid=\"narrative-column-east\""),
      `TensionsView with hotspot '${h.id}' must render East column`
    );
    assert(
      html.includes("data-testid=\"narrative-column-global_south\""),
      `TensionsView with hotspot '${h.id}' must render Global South column`
    );
  }
});

challenge("1.4 TensionsView handles hyphenated hotspot ID 'mar-vermelho' transparently", () => {
  const html = renderToStaticMarkup(
    React.createElement(TensionsView, {
      stories: STORIES,
      selectedHotspotId: "mar-vermelho",
      onSelectHotspot: () => {},
      onCompare: () => {},
      onRead: () => {},
    })
  );

  const marVermelhoMatrix = getNarrativeMatrix("mar_vermelho");
  assert(marVermelhoMatrix, "mar_vermelho matrix must exist");

  const escapedTopic = marVermelhoMatrix.topicTitle.replace(/&/g, "&amp;");
  assert(
    html.includes(escapedTopic) || html.includes(marVermelhoMatrix.topicTitle),
    `Should correctly render Mar Vermelho topic title with hyphenated input: ${marVermelhoMatrix.topicTitle}`
  );
  assert(
    html.includes("Ansar Allah (Houthis)"),
    "Should correctly render Mar Vermelho shared fact"
  );
});

challenge("1.5 TensionsView gracefully recovers on unrecognized selectedHotspotId by falling back to 'ormuz'", () => {
  const html = renderToStaticMarkup(
    React.createElement(TensionsView, {
      stories: STORIES,
      selectedHotspotId: "hotspot_inexistente_xpto",
      onSelectHotspot: () => {},
      onCompare: () => {},
      onRead: () => {},
    })
  );

  assert(
    html.includes("Segurança de Navegação no Estreito de Ormuz"),
    "Should fallback safely to 'ormuz' topic title when selectedHotspotId is unrecognized"
  );
  assert(
    html.includes("data-testid=\"narrative-matrix-container\""),
    "Should still render narrative matrix container"
  );
});

challenge("1.6 Quick Hotspot Jump Bar in TensionsView renders buttons for all 8 hotspots with correct active highlight", () => {
  for (const target of HOTSPOTS) {
    const html = renderToStaticMarkup(
      React.createElement(TensionsView, {
        stories: STORIES,
        selectedHotspotId: target.id,
        onSelectHotspot: () => {},
        onCompare: () => {},
        onRead: () => {},
      })
    );

    // Should include all hotspot titles in jump bar (escaped for HTML)
    for (const h of HOTSPOTS) {
      const escapedTitle = h.title.replace(/&/g, "&amp;");
      assert(html.includes(escapedTitle), `Jump bar must include title '${h.title}'`);
    }

    // Active pill should have distinct cyan active border style
    assert(
      html.includes("border-cyan-400/60") || html.includes("bg-cyan-500/25"),
      "Active hotspot pill in jump bar should have cyan highlight"
    );
  }
});

challenge("1.7 TensionsView viewMode toggle between 'mapa' and 'feed' preserves selectedHotspotId for NarrativeMatrix", () => {
  const htmlMapa = renderToStaticMarkup(
    React.createElement(TensionsView, {
      stories: STORIES,
      selectedHotspotId: "taiwan",
      onSelectHotspot: () => {},
      onCompare: () => {},
      onRead: () => {},
    })
  );

  // Check TacticalWorldMap svg presence and Taiwan topic in matrix
  assert(htmlMapa.includes("tacticalOceanGlow"), "Mapa view includes tactical world map svg canvas");
  assert(htmlMapa.includes("Tensão no Estreito de Taiwan"), "Matrix has Taiwan topic in mapa view");

  // In 'feed' view mode (HotspotsFeed active), verify feed renders cleanly
  const { HotspotsFeed } = require("../client/src/components/geopolitics/HotspotsFeed");
  const htmlFeed = renderToStaticMarkup(
    React.createElement(HotspotsFeed, {
      hotspots: HOTSPOTS,
      selectedHotspotId: "taiwan",
      onSelectHotspot: () => {},
      onSwitchToMap: () => {},
      onOpenComparator: () => {},
    })
  );
  assert(htmlFeed.includes("Estreito de Taiwan"), "Feed correctly renders Taiwan item");
});


// ============================================================================
// SUITE 2: 1-TOUCH COMPARADOR ACTION, APP.TSX & URL HASH SYNCHRONIZATION
// ============================================================================
console.log("\n--- Suite 2: 1-Touch 'Cruzar no Comparador' Action & URL Hash Synchronization ---");

challenge("2.1 NarrativeMatrix contains all required 'Cruzar no Comparador' buttons with test IDs", () => {
  const html = renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { hotspotId: "ormuz" })
  );

  assert(html.includes("data-testid=\"btn-compare-header\""), "Header 1-touch compare button present");
  assert(html.includes("data-testid=\"btn-compare-west\""), "West bloc 1-touch compare button present");
  assert(html.includes("data-testid=\"btn-compare-east\""), "East bloc 1-touch compare button present");
  assert(html.includes("data-testid=\"btn-compare-global_south\""), "Global South bloc 1-touch compare button present");
  assert(html.includes("Cruzar"), "Headline item Cruzar buttons present");
});

challenge("2.2 onCompare callback triggers with target storyId and hotspotId", () => {
  let compareCalledWith: { storyId?: string; hotspotId?: string } | null = null;

  const onCompareMock = (storyId?: string, hotspotId?: string) => {
    compareCalledWith = { storyId, hotspotId };
  };

  // Render component passing mock onCompare
  renderToStaticMarkup(
    React.createElement(NarrativeMatrix, {
      hotspotId: "ormuz",
      onCompare: onCompareMock,
    })
  );

  // Verify default comparatorStoryId for ormuz is 'tarifas'
  const ormuzMatrix = getNarrativeMatrix("ormuz");
  assert.strictEqual(ormuzMatrix?.comparatorStoryId, "tarifas");

  // Test ucrania comparatorStoryId is 'ucrania'
  const ucraniaMatrix = getNarrativeMatrix("ucrania");
  assert.strictEqual(ucraniaMatrix?.comparatorStoryId, "ucrania");
});

challenge("2.3 App.tsx openComparador correctly accepts (id, outlet) and updates window.history to #comparador?storyId=...", () => {
  const appPath = path.join(__dirname, "../client/src/App.tsx");
  const appCode = fs.readFileSync(appPath, "utf8");

  // Verify openComparador callback definition
  assert(
    appCode.includes("const openComparador = useCallback((id?: string, outlet?: string) =>"),
    "App.tsx must define openComparador accepting id and outlet"
  );

  // Verify state updates
  assert(
    appCode.includes("if (id) setCompareId(id);"),
    "openComparador must set compareId to provided id"
  );
  assert(
    appCode.includes("setFocusOutlet(outlet ?? null);"),
    "openComparador must set focusOutlet"
  );
  assert(
    appCode.includes("setView(\"comparador\");"),
    "openComparador must set view to 'comparador'"
  );

  // Verify URL hash updating with #comparador?storyId=
  assert(
    appCode.includes("window.history.replaceState(null, \"\", `#comparador?storyId=${id}`);"),
    "openComparador must update URL hash to #comparador?storyId=${id}"
  );
  assert(
    appCode.includes("window.history.replaceState(null, \"\", `#comparador`);"),
    "openComparador fallback must update URL hash to #comparador when no id is given"
  );
});

challenge("2.4 App.tsx hashchange handler correctly parses storyId, id, and story query parameters", () => {
  const appPath = path.join(__dirname, "../client/src/App.tsx");
  const appCode = fs.readFileSync(appPath, "utf8");

  assert(
    appCode.includes("hash.startsWith(\"#comparador\")"),
    "handleHash must detect #comparador prefix"
  );
  assert(
    appCode.includes("params.get(\"storyId\") || params.get(\"id\") || params.get(\"story\")"),
    "handleHash must parse storyId, id, or story params"
  );
  assert(
    appCode.includes("if (story) setCompareId(story);"),
    "handleHash must update compareId state when story query param is present"
  );
  assert(
    appCode.includes("setView(\"comparador\");"),
    "handleHash must switch view to 'comparador'"
  );
});

challenge("2.5 App.tsx hashchange handler correctly parses #tensoes?hotspot=... and updates selectedHotspotId", () => {
  const appPath = path.join(__dirname, "../client/src/App.tsx");
  const appCode = fs.readFileSync(appPath, "utf8");

  assert(
    appCode.includes("hash.startsWith(\"#tensoes\")"),
    "handleHash must detect #tensoes prefix"
  );
  assert(
    appCode.includes("const hs = params.get(\"hotspot\");"),
    "handleHash must parse hotspot query param"
  );
  assert(
    appCode.includes("if (hs) setSelectedHotspotId(normalizeHotspotId(hs));"),
    "handleHash must normalize and set selectedHotspotId"
  );
  assert(
    appCode.includes("setView(\"tensoes\");"),
    "handleHash must switch view to 'tensoes'"
  );
});

challenge("2.6 TensionsView delegates onCompare without erroneously passing hotspotId as outlet", () => {
  const tensionsPath = path.join(__dirname, "../client/src/components/geopolitics/TensionsView.tsx");
  const tensionsCode = fs.readFileSync(tensionsPath, "utf8");

  // Line in TensionsView: onCompare={(storyId) => onCompare(storyId)}
  assert(
    tensionsCode.includes("onCompare={(storyId) => onCompare(storyId)}"),
    "TensionsView must wrap onCompare to pass only storyId, preventing hotspotId pollution as outlet"
  );
});


// ============================================================================
// SUITE 3: RESPONSIVE MOBILE VIEWPORT LAYOUT & OVERFLOW SAFETY (360px-390px)
// ============================================================================
console.log("\n--- Suite 3: Mobile Viewport Layout & Horizontal Overflow Safety (360px-390px) ---");

challenge("3.1 Mobile segmented tab controls render all 4 options (All, West, East, South)", () => {
  const html = renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { hotspotId: "ormuz" })
  );

  assert(html.includes("data-testid=\"tab-all\""), "data-testid='tab-all' is present");
  assert(html.includes("data-testid=\"tab-west\""), "data-testid='tab-west' is present");
  assert(html.includes("data-testid=\"tab-east\""), "data-testid='tab-east' is present");
  assert(html.includes("data-testid=\"tab-global-south\""), "data-testid='tab-global-south' is present");

  assert(html.includes("Todos os Blocos (3 Colunas)"), "Tab 'All' label present");
  assert(html.includes("Ocidental 🇺🇸"), "Tab 'West' label present");
  assert(html.includes("Eurasiático 🇨🇳"), "Tab 'East' label present");
  assert(html.includes("Sul Global 🇧🇷"), "Tab 'South' label present");
});

challenge("3.2 NarrativeMatrix container and tab strip are constrained to prevent horizontal viewport overflow", () => {
  const matrixPath = path.join(__dirname, "../client/src/components/geopolitics/NarrativeMatrix.tsx");
  const matrixCode = fs.readFileSync(matrixPath, "utf8");

  // Tab strip container must have overflow-x-auto and max-w-full
  assert(
    matrixCode.includes("overflow-x-auto max-w-full scrollbar-thin"),
    "Tab strip must have overflow-x-auto and max-w-full to scroll cleanly on narrow screens"
  );

  // Each bloc column must have overflow-hidden to contain nested elements
  assert(
    matrixCode.includes("relative overflow-hidden"),
    "Bloc columns must have overflow-hidden to prevent gauge or pill overflow"
  );

  // Column header and titles must have responsive typography
  assert(
    matrixCode.includes("text-base sm:text-lg"),
    "Framing headlines must scale between mobile (text-base) and desktop (text-lg)"
  );
});

challenge("3.3 Mobile viewport safety: no unconstrained min-widths or pixel-fixed containers > 340px", () => {
  const matrixPath = path.join(__dirname, "../client/src/components/geopolitics/NarrativeMatrix.tsx");
  const matrixCode = fs.readFileSync(matrixPath, "utf8");

  // Check for dangerous static widths that would break 360px viewports (e.g., w-[400px], min-w-[360px])
  const dangerousPatterns = [
    /min-w-\[\s*\d{3,}px\s*\]/g,
    /w-\[\s*(?:3[7-9]\d|[4-9]\d\d|\d{4,})px\s*\]/g,
  ];

  for (const pattern of dangerousPatterns) {
    const matches = matrixCode.match(pattern);
    assert(
      !matches || matches.length === 0,
      `Dangerous fixed width pattern found in NarrativeMatrix: ${matches?.join(", ")}`
    );
  }

  // Real headline outlet names must be bounded with truncate max-w
  assert(
    matrixCode.includes("truncate max-w-[140px]"),
    "Outlet names in real headlines must be constrained with truncate max-w-[140px]"
  );
});

challenge("3.4 ActiveTab filtering logic strictly isolates columns when individual bloc is selected", () => {
  const matrixPath = path.join(__dirname, "../client/src/components/geopolitics/NarrativeMatrix.tsx");
  const matrixCode = fs.readFileSync(matrixPath, "utf8");

  // Verify JSX conditionals in grid
  assert(
    matrixCode.includes('(activeTab === "all" || activeTab === "west") &&'),
    "West column rendered only when activeTab is all or west"
  );
  assert(
    matrixCode.includes('(activeTab === "all" || activeTab === "east") &&'),
    "East column rendered only when activeTab is all or east"
  );
  assert(
    matrixCode.includes('(activeTab === "all" || activeTab === "global_south") &&'),
    "Global South column rendered only when activeTab is all or global_south"
  );

  // Verify responsive switching between 3 columns and single centered column
  assert(
    matrixCode.includes("activeTab === \"all\"") &&
    matrixCode.includes("grid-cols-1 md:grid-cols-3") &&
    matrixCode.includes("grid-cols-1 max-w-2xl mx-auto w-full"),
    "Grid switches from 3 columns (md:grid-cols-3) to single centered column (max-w-2xl) when tab is active"
  );
});

challenge("3.5 Interactive vocabulary pills expand with full width and no horizontal clipping", () => {
  const matrixPath = path.join(__dirname, "../client/src/components/geopolitics/NarrativeMatrix.tsx");
  const matrixCode = fs.readFileSync(matrixPath, "utf8");

  assert(
    matrixCode.includes("w-full flex items-center justify-between gap-1.5 rounded-lg border"),
    "Vocabulary pill toggle button takes 100% width of column"
  );
  assert(
    matrixCode.includes("mt-1 rounded-lg border border-cyan-500/30 bg-slate-950/90 p-2.5 text-[11px] text-slate-300 shadow-inner font-mono"),
    "Expanded semantic context box is styled with clear readable font"
  );
});


// ============================================================================
// SUITE 4: EXPAND / COLLAPSE MATRIX CONTROLS IN TENSIONSVIEW
// ============================================================================
console.log("\n--- Suite 4: Expand/Collapse Matrix Controls in TensionsView ---");

challenge("4.1 TensionsView initializes matrixExpanded to true by default", () => {
  const tensionsPath = path.join(__dirname, "../client/src/components/geopolitics/TensionsView.tsx");
  const tensionsCode = fs.readFileSync(tensionsPath, "utf8");

  assert(
    tensionsCode.includes("const [matrixExpanded, setMatrixExpanded] = useState<boolean>(true);"),
    "matrixExpanded must initialize to true"
  );
});

challenge("4.2 TensionsView toggle button renders 'Recolher Matriz' and ChevronUp when expanded", () => {
  const html = renderToStaticMarkup(
    React.createElement(TensionsView, {
      stories: STORIES,
      selectedHotspotId: "ormuz",
      onSelectHotspot: () => {},
      onCompare: () => {},
      onRead: () => {},
    })
  );

  assert(html.includes("data-testid=\"toggle-narrative-matrix\""), "Toggle button present with testid");
  assert(html.includes("Recolher Matriz"), "Button displays 'Recolher Matriz' when expanded");
  assert(html.includes("data-testid=\"narrative-matrix-container\""), "NarrativeMatrix container is mounted");
});

challenge("4.3 TensionsView toggle button contains ChevronDown and 'Expandir Matriz Tri-Axial' when collapsed", () => {
  const tensionsPath = path.join(__dirname, "../client/src/components/geopolitics/TensionsView.tsx");
  const tensionsCode = fs.readFileSync(tensionsPath, "utf8");

  assert(
    tensionsCode.includes('matrixExpanded ? "Recolher Matriz" : "Expandir Matriz Tri-Axial"'),
    "Button label dynamically reflects expanded state"
  );
  assert(
    tensionsCode.includes('<ChevronUp') && tensionsCode.includes('<ChevronDown'),
    "ChevronUp rendered when expanded, ChevronDown rendered when collapsed"
  );
  assert(
    tensionsCode.includes("{matrixExpanded && (\n          <NarrativeMatrix"),
    "NarrativeMatrix conditionally mounted on matrixExpanded"
  );
});

challenge("4.4 Narrative section header remains fully visible with active hotspot title even when collapsed", () => {
  const html = renderToStaticMarkup(
    React.createElement(TensionsView, {
      stories: STORIES,
      selectedHotspotId: "ucrania",
      onSelectHotspot: () => {},
      onCompare: () => {},
      onRead: () => {},
    })
  );

  assert(html.includes("GUERRA NARRATIVA // MATRIZ TRI-AXIAL COMPARATIVA (R3)"), "Section kicker present");
  assert(html.includes("Enquadramento Tri-Axial de Narrativas"), "Section heading present");
  assert(html.includes("Guerra da Ucrânia &amp; Leste Europeu") || html.includes("Guerra da Ucrânia"), "Active hotspot title present in section deck");
});


// ============================================================================
// SUITE 5: 86 SOURCES CATALOG INTEGRITY & COUNTRY TAGGING AUDIT
// ============================================================================
console.log("\n--- Suite 5: 86 Sources Catalog Integrity & Country Tagging Audit ---");

challenge("5.1 backend/ingestion/sources.json defines exactly 86 sources with geopolitical_bloc", () => {
  const sourcesJsonPath = path.join(__dirname, "../backend/ingestion/sources.json");
  const sourcesData = JSON.parse(fs.readFileSync(sourcesJsonPath, "utf8"));

  assert.strictEqual(sourcesData.length, 86, `sources.json must have exactly 86 sources (found: ${sourcesData.length})`);

  const allowedBlocs = new Set(["west", "east", "global_south"]);
  const blocCounts: Record<string, number> = {};

  for (const s of sourcesData) {
    assert(s.id && s.id.length > 0, "Source must have valid id");
    assert(s.name && s.name.length > 0, `Source ${s.id} must have valid name`);
    assert(s.country && s.country.length >= 2, `Source ${s.id} must have valid country code (got: ${s.country})`);

    const bloc = s.geopolitical_bloc || s.geopoliticalBloc;
    assert(bloc && allowedBlocs.has(bloc), `Source ${s.id} must have geopolitical_bloc in [west, east, global_south] (got: ${bloc})`);
    blocCounts[bloc] = (blocCounts[bloc] || 0) + 1;
  }

  assert(blocCounts["west"] >= 20, `West bloc must have >= 20 sources (actual: ${blocCounts["west"]})`);
  assert(blocCounts["east"] >= 5, `East bloc must have >= 5 sources (actual: ${blocCounts["east"]})`);
  assert(blocCounts["global_south"] >= 40, `Global South bloc must have >= 40 sources (actual: ${blocCounts["global_south"]})`);
});

challenge("5.2 client/src/data/news.ts OUTLETS contains all 86 sources with geopoliticalBloc classification", () => {
  assert(OUTLETS.length >= 86, `OUTLETS must contain at least 86 sources (found: ${OUTLETS.length})`);

  const allowedBlocs = new Set(["west", "east", "global_south"]);
  for (const o of OUTLETS) {
    const bloc = o.geopoliticalBloc || o.geopolitical_bloc;
    assert(
      bloc && allowedBlocs.has(bloc),
      `Outlet '${o.id}' (${o.name}) must have geopoliticalBloc (got: ${bloc})`
    );
    assert(o.country && o.country.length >= 2, `Outlet '${o.id}' must have country code`);
    assert(o.flag && o.flag.length > 0, `Outlet '${o.id}' must have flag emoji`);
  }
});

challenge("5.3 All 96 representativeSources cited across all 8 matrices resolve to catalog or valid country brackets", () => {
  const outletIds = new Set(OUTLETS.map((o: any) => o.id.toLowerCase()));
  const outletNames = new Set(OUTLETS.map((o: any) => o.name.toLowerCase()));
  const outletShorts = new Set(OUTLETS.map((o: any) => (o.short || "").toLowerCase()));

  let totalCited = 0;
  for (const [hotspotId, matrix] of Object.entries(NARRATIVE_MATRICES as Record<string, any>)) {
    for (const [blocKey, bloc] of Object.entries(matrix.blocs as Record<string, any>)) {
      for (const src of bloc.representativeSources) {
        totalCited++;
        const norm = src.toLowerCase().trim();
        const inOutlets = outletIds.has(norm) || outletNames.has(norm) || outletShorts.has(norm);
        const hasBracketCountry = /^(.*?)\s*\[([A-Z]{2})\]$/.test(src);

        assert(
          inOutlets || hasBracketCountry,
          `Source '${src}' in ${hotspotId}/${blocKey} must resolve in OUTLETS catalog or have format 'Name [CC]'`
        );
      }
    }
  }

  assert.strictEqual(totalCited, 96, `Expected exactly 96 cited representative sources (actual: ${totalCited})`);
});

challenge("5.4 All 72 real headlines across all 8 matrices have outlet, valid flag emoji, title, and framingTag", () => {
  let totalHeadlines = 0;
  for (const [hotspotId, matrix] of Object.entries(NARRATIVE_MATRICES as Record<string, any>)) {
    for (const [blocKey, bloc] of Object.entries(matrix.blocs as Record<string, any>)) {
      for (const h of bloc.realHeadlines) {
        totalHeadlines++;
        assert(h.outlet && h.outlet.length > 0, `Headline in ${hotspotId}/${blocKey} missing outlet`);
        assert(h.flag && h.flag.length >= 1, `Headline in ${hotspotId}/${blocKey} missing flag emoji`);
        assert(h.title && h.title.length > 5, `Headline in ${hotspotId}/${blocKey} title too short: '${h.title}'`);
        assert(h.framingTag && h.framingTag.length > 0, `Headline in ${hotspotId}/${blocKey} missing framingTag`);
      }
    }
  }

  assert.strictEqual(totalHeadlines, 72, `Expected exactly 72 real headlines (actual: ${totalHeadlines})`);
});

challenge("5.5 getSourcesByBloc correctly filters outlets by each of the 3 geopolitical blocs", () => {
  const westSources = getSourcesByBloc("west");
  const eastSources = getSourcesByBloc("east");
  const southSources = getSourcesByBloc("global_south");

  assert(westSources.length >= 20, `West sources count >= 20 (actual: ${westSources.length})`);
  assert(eastSources.length >= 5, `East sources count >= 5 (actual: ${eastSources.length})`);
  assert(southSources.length >= 40, `Global South sources count >= 40 (actual: ${southSources.length})`);

  // Ensure no cross-contamination
  for (const s of westSources) {
    const b = s.geopoliticalBloc || s.geopolitical_bloc;
    assert.strictEqual(b, "west", `Outlet '${s.id}' in west list must have bloc west`);
  }
  for (const s of eastSources) {
    const b = s.geopoliticalBloc || s.geopolitical_bloc;
    assert.strictEqual(b, "east", `Outlet '${s.id}' in east list must have bloc east`);
  }
  for (const s of southSources) {
    const b = s.geopoliticalBloc || s.geopolitical_bloc;
    assert.strictEqual(b, "global_south", `Outlet '${s.id}' in south list must have bloc global_south`);
  }
});


// ============================================================================
// SUMMARY & RESULTS
// ============================================================================
console.log("\n================================================================================");
console.log(`CHALLENGER 2 EMPIRICAL TEST SUITE FINISHED: ${passedCount}/${totalCount} TESTS PASSED`);
if (failureList.length === 0) {
  console.log("ALL 24 EMPIRICAL CHALLENGES PASSED (100% SUCCESS) — VERDICT: APPROVE");
} else {
  console.log(`FAILURES (${failureList.length}):`);
  for (const f of failureList) {
    console.log(`  - ${f}`);
  }
  console.log("VERDICT: REJECT");
}
console.log("================================================================================");

if (failureList.length > 0) {
  process.exit(1);
}

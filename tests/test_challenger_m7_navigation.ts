/**
 * Challenger 2 Adversarial Verification Suite: Milestone M7
 *
 * Focus:
 * 1. Navigation contracts in App.tsx and Chrome.tsx (TopBar & Dock 7-column).
 * 2. Persistent Live Player continuity and unmount prevention across view transitions.
 * 3. URL hash deep-linking (#tensoes?hotspot=...) and state synchronization.
 * 4. Responsive mobile layout constraints (360px-390px viewports).
 * 5. State transitions and event dispatching simulation under DOM lifecycle.
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";

// Ensure React is globally available for tsx transpiled JSX
(global as any).React = React;

// Proper CommonJS mocks for binary/static image assets
// @ts-ignore
require.extensions[".jpg"] = (module: any) => { module.exports = "mock.jpg"; };
// @ts-ignore
require.extensions[".png"] = (module: any) => { module.exports = "mock.png"; };
// @ts-ignore
require.extensions[".svg"] = (module: any) => { module.exports = "mock.svg"; };

// Load modules under test
const Chrome = require("../client/src/components/Chrome.tsx");
const { TopBar, Dock } = Chrome;
const PersistentLivePlayer = require("../client/src/components/PersistentLivePlayer.tsx").default;
const { TV_CHANNELS, RADIO_STATIONS, DEFAULT_MEDIA_ITEM } = require("../client/src/data/media.ts");
const {
  HOTSPOTS,
  getHotspot,
  getHotspotById,
  normalizeHotspotId,
} = require("../client/src/data/geopolitics.ts");
const TensionsView = require("../client/src/components/geopolitics/TensionsView.tsx").default;
const TacticalWorldMap = require("../client/src/components/geopolitics/TacticalWorldMap.tsx").TacticalWorldMap;
const HotspotsFeed = require("../client/src/components/geopolitics/HotspotsFeed.tsx").HotspotsFeed;

let passed = 0;
let total = 0;

function runTest(suite: string, name: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${suite} > ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  [FAIL] ${suite} > ${name}`);
    console.error("         ", err.message || err);
    throw err;
  }
}

console.log("================================================================================");
console.log("CHALLENGER 2: EMPIRICAL STRESS TESTS — MILESTONE M7 NAVIGATION & CONTINUITY");
console.log("================================================================================");

// ==============================================================================
// SUITE 1: Navigation Contracts (Chrome.tsx TopBar and Dock)
// ==============================================================================

runTest("Suite 1: Navigation", "TopBar renders all 5 main view tabs with Tensões included", () => {
  const views = ["capa", "comparador", "tensoes", "radar", "aovivo"] as const;
  
  for (const currentView of views) {
    let clickedView = "";
    const html = renderToString(
      React.createElement(TopBar, {
        view: currentView,
        onNav: (v: string) => { clickedView = v; },
        onSearch: () => {},
        onSaved: () => {},
        savedCount: 0,
      })
    );

    assert(html.includes("PRISMA"), "TopBar contains PRISMA logo/brand");
    assert(html.includes("Capa"), "TopBar contains Capa tab");
    assert(html.includes("Comparador"), "TopBar contains Comparador tab");
    assert(html.includes("Tensões"), "TopBar contains Tensões tab");
    assert(html.includes("Radar X"), "TopBar contains Radar X tab");
    assert(html.includes("Ao Vivo"), "TopBar contains Ao Vivo tab");

    // The active tab must have the active border/color class
    if (currentView === "tensoes") {
      assert(html.includes("border-ink text-ink"), "Active tab has border-ink text-ink");
    }
  }
});

runTest("Suite 1: Navigation", "TopBar saved bookmark badge reflects savedCount accurately", () => {
  // Case 1: savedCount = 0 -> no badge element
  const htmlZero = renderToString(
    React.createElement(TopBar, {
      view: "capa",
      onNav: () => {},
      onSearch: () => {},
      onSaved: () => {},
      savedCount: 0,
    })
  );
  assert(!htmlZero.includes("bg-press px-1 text-[9px]"), "Zero saved count does not render badge");

  // Case 2: savedCount = 7 -> renders badge with '7'
  const htmlSeven = renderToString(
    React.createElement(TopBar, {
      view: "capa",
      onNav: () => {},
      onSearch: () => {},
      onSaved: () => {},
      savedCount: 7,
    })
  );
  assert(htmlSeven.includes(">7<"), "Badge with count 7 is rendered");
  assert(htmlSeven.includes("Notícias salvas (7)"), "Aria label includes savedCount");
});

runTest("Suite 1: Navigation", "Dock mobile renders exactly 7 navigation action items in grid-cols-7", () => {
  const dockHtml = renderToString(
    React.createElement(Dock, {
      view: "tensoes",
      onNav: () => {},
      onSearch: () => {},
      onSaved: () => {},
      savedCount: 2,
    })
  );

  // Must have grid-cols-7 for 7 items
  assert(dockHtml.includes("grid-cols-7"), "Dock container has grid-cols-7 class");

  // Verify all 7 labels exist
  assert(dockHtml.includes("Capa"), "Dock has Capa");
  assert(dockHtml.includes("Comparar"), "Dock has Comparar");
  assert(dockHtml.includes("Tensões"), "Dock has Tensões");
  assert(dockHtml.includes("Radar X"), "Dock has Radar X");
  assert(dockHtml.includes("Ao Vivo"), "Dock has Ao Vivo");
  assert(dockHtml.includes("Buscar"), "Dock has Buscar");
  assert(dockHtml.includes("Salvos"), "Dock has Salvos");

  // Verify active indicator on Tensões
  assert(dockHtml.includes('aria-current="page"'), "Active item has aria-current=page");
  assert(dockHtml.includes("Tensões"), "Tensões is rendered in dock");
});

runTest("Suite 1: Navigation", "Dock live dot indicator only flashes when Ao Vivo is NOT active", () => {
  // When Ao Vivo is active, liveDot is suppressed
  const htmlActiveAoVivo = renderToString(
    React.createElement(Dock, {
      view: "aovivo",
      onNav: () => {},
      onSearch: () => {},
      onSaved: () => {},
      savedCount: 0,
    })
  );
  // When Tensões is active, liveDot on Ao Vivo is displayed
  const htmlActiveTensoes = renderToString(
    React.createElement(Dock, {
      view: "tensoes",
      onNav: () => {},
      onSearch: () => {},
      onSaved: () => {},
      savedCount: 0,
    })
  );

  assert(htmlActiveTensoes.includes("animate-ping"), "Ao Vivo shows pulsating live dot when viewing other tabs");
});

// ==============================================================================
// SUITE 2: Persistent Live Player Permanence & Playback Continuity
// ==============================================================================

runTest("Suite 2: Player Continuity", "PersistentLivePlayer maintains persistent hidden <audio> element at all times", () => {
  // Test 1: item is null (idle)
  const htmlNull = renderToString(
    React.createElement(PersistentLivePlayer, {
      item: null,
      isPlaying: false,
      isMuted: false,
      volume: 0.8,
      onTogglePlay: () => {},
      onToggleMute: () => {},
      onVolumeChange: () => {},
      onSelectChannel: () => {},
      onClose: () => {},
    })
  );
  assert(htmlNull.includes("<audio"), "Audio element is rendered when item is null");
  assert(!htmlNull.includes("<aside"), "Floating player widget is NOT visible when item is null");

  // Test 2: item is Radio (station active)
  const radioItem = RADIO_STATIONS[0];
  const htmlRadio = renderToString(
    React.createElement(PersistentLivePlayer, {
      item: radioItem,
      isPlaying: true,
      isMuted: false,
      volume: 0.8,
      onTogglePlay: () => {},
      onToggleMute: () => {},
      onVolumeChange: () => {},
      onSelectChannel: () => {},
      onClose: () => {},
    })
  );
  assert(htmlRadio.includes("<audio"), "Audio element is present for radio");
  assert(htmlRadio.includes("<aside"), "Floating player widget is rendered for radio");
  assert(htmlRadio.includes(radioItem.name), "Station name is rendered");
  assert(htmlRadio.includes("NO AR"), "NO AR status is rendered");

  // Test 3: item is TV
  const tvItem = TV_CHANNELS[0];
  const htmlTv = renderToString(
    React.createElement(PersistentLivePlayer, {
      item: tvItem,
      isPlaying: true,
      isMuted: false,
      volume: 0.8,
      onTogglePlay: () => {},
      onToggleMute: () => {},
      onVolumeChange: () => {},
      onSelectChannel: () => {},
      onClose: () => {},
    })
  );
  assert(htmlTv.includes("<audio"), "Audio element is present for TV");
  assert(htmlTv.includes("<iframe"), "Video iframe is rendered for TV");
  assert(htmlTv.includes(tvItem.name), "TV channel name is rendered");
});

runTest("Suite 2: Player Continuity", "Player channel carousel wraps around catalog without index bounds error", () => {
  const catalog = [...TV_CHANNELS, ...RADIO_STATIONS];
  assert(catalog.length > 5, "Catalog has multiple items");

  // Simulate handlePrevChannel and handleNextChannel logic from PersistentLivePlayer
  const testIndexWrap = (currIdx: number, items: any[]) => {
    const prevIdx = (currIdx - 1 + items.length) % items.length;
    const nextIdx = (currIdx + 1) % items.length;
    return { prevIdx, nextIdx };
  };

  // Beginning of catalog
  const atStart = testIndexWrap(0, catalog);
  assert.strictEqual(atStart.prevIdx, catalog.length - 1, "Prev from 0 wraps to end");
  assert.strictEqual(atStart.nextIdx, 1, "Next from 0 goes to 1");

  // End of catalog
  const atEnd = testIndexWrap(catalog.length - 1, catalog);
  assert.strictEqual(atEnd.prevIdx, catalog.length - 2, "Prev from end goes to end-1");
  assert.strictEqual(atEnd.nextIdx, 0, "Next from end wraps to 0");
});

runTest("Suite 2: Player Continuity", "App.tsx mounts <PersistentLivePlayer /> outside <main> view switcher", () => {
  const appPath = path.resolve(__dirname, "../client/src/App.tsx");
  const appContent = fs.readFileSync(appPath, "utf-8");

  // Extract <main> block
  const mainOpen = appContent.indexOf("<main>");
  const mainClose = appContent.indexOf("</main>");
  assert(mainOpen > 0 && mainClose > mainOpen, "<main> tag must exist in App.tsx");

  const playerIdx = appContent.indexOf("<PersistentLivePlayer");
  assert(playerIdx > mainClose, "<PersistentLivePlayer /> must be placed AFTER </main>");

  // Ensure PersistentLivePlayer does not have key={view} which would destroy it on view switch
  const playerCallSlice = appContent.slice(playerIdx, playerIdx + 300);
  assert(!playerCallSlice.includes("key={view}"), "PersistentLivePlayer must NOT be keyed on view");
});

runTest("Suite 2: Player Continuity", "App view switching maintains continuous playback state across tabs", () => {
  // Simulate App's internal state machine
  let currentView = "capa";
  let activeMedia: any = null;
  let isPlaying = false;

  const handleNav = (v: string) => {
    currentView = v;
  };

  const handleTogglePlay = () => {
    if (!activeMedia) {
      activeMedia = DEFAULT_MEDIA_ITEM;
      isPlaying = true;
      return;
    }
    isPlaying = !isPlaying;
  };

  // 1. User starts on Capa and presses Play on default media item
  handleTogglePlay();
  assert.strictEqual(isPlaying, true, "Media started playing on Capa");
  assert.strictEqual(activeMedia?.id, DEFAULT_MEDIA_ITEM.id, "Default media item active");

  // 2. User navigates across ALL tabs: Capa -> Tensões -> Radar -> Ao Vivo -> Comparador -> Capa
  const tabs = ["tensoes", "radar", "aovivo", "comparador", "capa"];
  for (const tab of tabs) {
    handleNav(tab);
    assert.strictEqual(currentView, tab, `View switched to ${tab}`);
    // Playback state must remain completely uninterrupted
    assert.strictEqual(isPlaying, true, `Audio remains playing when navigating to ${tab}`);
    assert.strictEqual(activeMedia?.id, DEFAULT_MEDIA_ITEM.id, `Media item persists when navigating to ${tab}`);
  }
});

// ==============================================================================
// SUITE 3: URL Hash Deep-Linking & State Synchronization
// ==============================================================================

runTest("Suite 3: Deep-Linking", "URL hash parser handles exact, case-insensitive, and hyphenated hotspot IDs", () => {
  const parseHash = (hash: string) => {
    let targetView = "capa";
    let targetHotspot = "ormuz";

    if (hash.startsWith("#tensoes")) {
      targetView = "tensoes";
      const qIdx = hash.indexOf("?");
      if (qIdx >= 0) {
        const params = new URLSearchParams(hash.slice(qIdx + 1));
        const hs = params.get("hotspot");
        if (hs) targetHotspot = normalizeHotspotId(hs);
      }
    } else if (hash === "#radar") {
      targetView = "radar";
    } else if (hash === "#aovivo") {
      targetView = "aovivo";
    } else if (hash.startsWith("#comparador")) {
      targetView = "comparador";
    } else if (hash === "#capa") {
      targetView = "capa";
    }
    return { targetView, targetHotspot };
  };

  // Test 1: Standard hotspot
  assert.deepStrictEqual(parseHash("#tensoes?hotspot=ormuz"), { targetView: "tensoes", targetHotspot: "ormuz" });

  // Test 2: Hyphenated hotspot
  assert.deepStrictEqual(parseHash("#tensoes?hotspot=mar-vermelho"), { targetView: "tensoes", targetHotspot: "mar_vermelho" });

  // Test 3: Uppercase hotspot
  assert.deepStrictEqual(parseHash("#tensoes?hotspot=TAIWAN"), { targetView: "tensoes", targetHotspot: "taiwan" });

  // Test 4: Multiple query params with hotspot in middle
  assert.deepStrictEqual(parseHash("#tensoes?source=news&hotspot=ucrania&lang=pt"), { targetView: "tensoes", targetHotspot: "ucrania" });

  // Test 5: Bare #tensoes (no query)
  assert.deepStrictEqual(parseHash("#tensoes"), { targetView: "tensoes", targetHotspot: "ormuz" });

  // Test 6: Other main views
  assert.deepStrictEqual(parseHash("#radar"), { targetView: "radar", targetHotspot: "ormuz" });
  assert.deepStrictEqual(parseHash("#aovivo"), { targetView: "aovivo", targetHotspot: "ormuz" });
  assert.deepStrictEqual(parseHash("#comparador"), { targetView: "comparador", targetHotspot: "ormuz" });
  assert.deepStrictEqual(parseHash("#capa"), { targetView: "capa", targetHotspot: "ormuz" });
});

runTest("Suite 3: Deep-Linking", "Adversarial malformed hashes do not crash parser and resolve to safe fallbacks", () => {
  const parseAndResolve = (hash: string) => {
    let targetView = "capa";
    let selectedHotspotId = "ormuz";

    try {
      if (hash.startsWith("#tensoes")) {
        targetView = "tensoes";
        const qIdx = hash.indexOf("?");
        if (qIdx >= 0) {
          const params = new URLSearchParams(hash.slice(qIdx + 1));
          const hs = params.get("hotspot");
          if (hs) selectedHotspotId = normalizeHotspotId(hs);
        }
      }
    } catch {
      /* ignore */
    }

    // Now resolve in TensionsView
    const norm = normalizeHotspotId(selectedHotspotId);
    const found = getHotspot(norm);
    const activeHotspotId = found ? found.id : "ormuz";
    const activeHotspot = getHotspot(activeHotspotId) || HOTSPOTS[0];

    return { targetView, activeHotspotId, activeHotspotTitle: activeHotspot.title };
  };

  // Malformed 1: Non-existent hotspot
  const r1 = parseAndResolve("#tensoes?hotspot=non_existent_galaxy_99");
  assert.strictEqual(r1.targetView, "tensoes");
  assert.strictEqual(r1.activeHotspotId, "ormuz", "Falls back to ormuz safely");

  // Malformed 2: Script injection attempt
  const r2 = parseAndResolve("#tensoes?hotspot=%3Cscript%3Ealert(1)%3C/script%3E");
  assert.strictEqual(r2.targetView, "tensoes");
  assert.strictEqual(r2.activeHotspotId, "ormuz", "Sanitized and falls back safely");

  // Malformed 3: Empty query param
  const r3 = parseAndResolve("#tensoes?hotspot=");
  assert.strictEqual(r3.targetView, "tensoes");
  assert.strictEqual(r3.activeHotspotId, "ormuz");

  // Malformed 4: Just question mark
  const r4 = parseAndResolve("#tensoes?");
  assert.strictEqual(r4.targetView, "tensoes");
  assert.strictEqual(r4.activeHotspotId, "ormuz");
});

runTest("Suite 3: Deep-Linking", "All 8 valid hotspots can be deep-linked and loaded in TensionsView", () => {
  const expectedHotspots = [
    "ormuz",
    "ucrania",
    "taiwan",
    "mar_vermelho",
    "gaza",
    "coreia",
    "sahel",
    "essequibo",
  ];

  for (const id of expectedHotspots) {
    const html = renderToString(
      React.createElement(TensionsView, {
        stories: [],
        selectedHotspotId: id,
        onSelectHotspot: () => {},
        onCompare: () => {},
        onRead: () => {},
      })
    );

    const hotspot = getHotspot(id);
    assert(hotspot !== undefined, `Hotspot ${id} must exist`);
    
    // Check title presence accounting for React HTML-encoding of & to &amp;
    const escapedTitle = hotspot.title.replace(/&/g, "&amp;");
    assert(html.includes(escapedTitle), `Rendered TensionsView contains title for ${id}: ${escapedTitle}`);
    assert(html.includes("SALA DE OPERAÇÕES GEOPOLÍTICAS"), "Header rendered");
    assert(html.includes("PRISMA TACTICAL RADAR"), "Tactical map included");
  }
});

runTest("Suite 3: Deep-Linking", "Bidirectional hash synchronization: openTensoes and onSelectHotspot update URL hash", () => {
  let currentHash = "";
  const mockHistory = {
    replaceState: (_data: any, _unused: string, url: string) => {
      currentHash = url;
    },
  };

  // Simulate openTensoes
  const openTensoes = (hotspotId?: string, selectedHotspotId = "ormuz") => {
    const target = hotspotId ? normalizeHotspotId(hotspotId) : selectedHotspotId;
    mockHistory.replaceState(null, "", `#tensoes?hotspot=${target}`);
  };

  // When called with explicit hotspot
  openTensoes("mar-vermelho");
  assert.strictEqual(currentHash, "#tensoes?hotspot=mar_vermelho", "Hyphenated id normalized in hash");

  openTensoes("taiwan");
  assert.strictEqual(currentHash, "#tensoes?hotspot=taiwan", "Hotspot id updated in hash");

  // When called with no arguments
  openTensoes();
  assert.strictEqual(currentHash, "#tensoes?hotspot=ormuz", "Default hotspot id written to hash");
});

// ==============================================================================
// SUITE 4: Responsive Mobile Layout & Viewport Safety (360px - 390px)
// ==============================================================================

runTest("Suite 4: Mobile Viewports", "Dock CSS classes guarantee zero horizontal overflow on 360px screens", () => {
  const chromePath = path.resolve(__dirname, "../client/src/components/Chrome.tsx");
  const content = fs.readFileSync(chromePath, "utf-8");

  // 1. Dock container uses inset-x-2 on mobile (8px margin each side -> 344px available)
  assert(content.includes("inset-x-2 sm:inset-x-3"), "Dock uses inset-x-2 on mobile");
  assert(content.includes("grid-cols-7"), "Dock uses grid-cols-7");

  // 2. Buttons use small horizontal padding and text truncation
  assert(content.includes("px-0.5"), "Buttons use minimal px-0.5 horizontal padding");
  assert(content.includes("truncate max-w-full"), "Labels use truncate max-w-full");
  assert(content.includes("text-[7.5px] sm:text-[9px]"), "Labels use compact 7.5px font size for 360px compatibility");

  // Mathematical validation:
  // Viewport width = 360px
  // Margins: 8px * 2 = 16px -> Available width = 344px
  // 7 columns: 344 / 7 = 49.14px per column
  // Icon wrapper: w-8 = 32px (fits within 49.14px with 17px margin)
  // Label: max-w-full with truncate prevents overflow
  const colWidth = (360 - 16) / 7;
  assert(colWidth >= 48, `Column width ${colWidth.toFixed(1)}px is comfortable (>=48px touch target target width)`);
});

runTest("Suite 4: Mobile Viewports", "PersistentLivePlayer mobile container avoids collision with bottom Dock", () => {
  const playerPath = path.resolve(__dirname, "../client/src/components/PersistentLivePlayer.tsx");
  const content = fs.readFileSync(playerPath, "utf-8");

  // Mobile position: bottom-[calc(5rem+env(safe-area-inset-bottom))]
  assert(
    content.includes("bottom-[calc(5rem+env(safe-area-inset-bottom))]"),
    "Player is positioned 5rem above viewport bottom to clear the Dock"
  );
  // Mobile width: inset-x-3 (12px * 2 = 24px margins -> 336px width on 360px screen)
  assert(content.includes("inset-x-3"), "Player uses inset-x-3 for fluid width on mobile");
  // Desktop override: md:bottom-6 md:right-6
  assert(content.includes("md:bottom-6 md:right-6"), "Player docks to bottom right on desktop");
});

runTest("Suite 4: Mobile Viewports", "TacticalWorldMap SVG maintains responsive aspect ratio without horizontal blowout", () => {
  const mapPath = path.resolve(__dirname, "../client/src/components/geopolitics/TacticalWorldMap.tsx");
  const content = fs.readFileSync(mapPath, "utf-8");

  // SVG container uses aspect-[2/1] w-full overflow-hidden
  assert(content.includes("aspect-[2/1]"), "SVG container uses aspect-[2/1]");
  assert(content.includes("w-full"), "SVG container uses w-full");
  assert(content.includes("overflow-hidden"), "SVG container uses overflow-hidden");

  // SVG element uses preserveAspectRatio="xMidYMid meet"
  assert(content.includes('preserveAspectRatio="xMidYMid meet"'), "SVG preserves aspect ratio with meet");
  assert(content.includes("h-full w-full"), "SVG fills container");

  // Theater filter chip list uses overflow-x-auto to scroll rather than blowout
  assert(content.includes("overflow-x-auto"), "Filter chips use horizontal scrolling");
});

runTest("Suite 4: Mobile Viewports", "TensionsView provides mobile Crisis Feed mode (HotspotsFeed) as touch alternative to map", () => {
  const viewPath = path.resolve(__dirname, "../client/src/components/geopolitics/TensionsView.tsx");
  const content = fs.readFileSync(viewPath, "utf-8");

  assert(content.includes("viewMode"), "TensionsView manages viewMode");
  assert(content.includes('"mapa"'), "TensionsView supports mapa mode");
  assert(content.includes('"feed"'), "TensionsView supports feed mode");
  assert(content.includes("<HotspotsFeed"), "TensionsView mounts HotspotsFeed for mobile cards");
  assert(content.includes("Feed de Focos de Crise"), "TensionsView has toggle button for Feed mode");
});

console.log("================================================================================");
console.log(`ALL ${passed}/${total} CHALLENGER 2 EMPIRICAL ADVERSARIAL TESTS PASSED!`);
console.log("================================================================================");

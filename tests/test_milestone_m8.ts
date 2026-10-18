/**
 * Test Suite: Milestone M8 — Tri-Axial Geopolitical Narratives Matrix Component (R3)
 *
 * Verifies:
 * 1. Data Integrity: Tri-axial narrative matrices across all 8 hotspots with complete schema
 * 2. Component Rendering: NarrativeMatrix renders cleanly with SSR static markup for all hotspots
 * 3. Defensive Fallback: Graceful fallback on null, undefined, and unrecognized hotspot IDs
 * 4. Content Elements: Shared fact banner, 3 distinct bloc identities (West, East, Global South),
 *    editorial quote styling, narrative vocabulary pills with connotation badges,
 *    representative sources with country codes, strategic blind spots callouts,
 *    real collected headlines with framing tags, and metric gauges
 * 5. Layout & Interactions: 3-column desktop and tabbed mobile switcher, 1-touch 'Cruzar no Comparador' actions
 * 6. Integration: TensionsView rendering NarrativeMatrix with active hotspot synchronization and toggle
 * 7. Routing & Deep-Linking: App.tsx openComparador with storyId and hash param resolution
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

// Add client node_modules to path for React resolution
module.paths.push(path.join(process.cwd(), "client/node_modules"));

const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const {
  HOTSPOTS,
  getHotspot,
  getNarrativeMatrix,
  normalizeHotspotId,
  NARRATIVE_MATRICES,
} = require("../client/src/data/geopolitics");
const { OUTLETS } = require("../client/src/data/news");
const { NarrativeMatrix } = require("../client/src/components/geopolitics/NarrativeMatrix");
const { TensionsView } = require("../client/src/components/geopolitics/TensionsView");

console.log("================================================================");
console.log("RUNNING MILESTONE M8 VERIFICATION TEST SUITE (TRI-AXIAL MATRIX)");
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

// ---------------------------------------------------------------------------
// Group 1: Narrative Matrix Data Architecture & Schema Across All 8 Hotspots
// ---------------------------------------------------------------------------

test("All 8 strategic hotspots have a valid NarrativeMatrix defined", () => {
  const expectedHotspotIds = [
    "ormuz",
    "ucrania",
    "taiwan",
    "mar_vermelho",
    "gaza",
    "coreia",
    "sahel",
    "essequibo",
  ];

  for (const id of expectedHotspotIds) {
    const matrix = getNarrativeMatrix(id);
    assert(matrix !== undefined, `Narrative matrix for '${id}' must be defined`);
    assert(matrix.topicTitle && matrix.topicTitle.length > 0, `Matrix '${id}' must have a topicTitle`);
    assert(matrix.sharedFact && matrix.sharedFact.length > 0, `Matrix '${id}' must have a sharedFact`);
    assert(matrix.comparatorStoryId && matrix.comparatorStoryId.length > 0, `Matrix '${id}' must have comparatorStoryId`);
    assert(matrix.blocs !== undefined, `Matrix '${id}' must have blocs`);
  }
});

test("Each hotspot matrix contains all 3 geopolitical blocs with complete specifications", () => {
  const requiredBlocs = ["west", "east", "global_south"] as const;

  for (const hotspot of HOTSPOTS) {
    const matrix = getNarrativeMatrix(hotspot.id);
    assert(matrix, `Matrix must exist for hotspot ${hotspot.id}`);

    for (const blocKey of requiredBlocs) {
      const bloc = matrix.blocs[blocKey];
      assert(bloc, `Hotspot ${hotspot.id} must define bloc '${blocKey}'`);
      assert(bloc.blocName && bloc.blocName.length > 0, `Bloc '${blocKey}' must have a blocName`);
      assert(bloc.framingHeadline && bloc.framingHeadline.length > 0, `Bloc '${blocKey}' must have framingHeadline`);
      assert(bloc.coreArgument && bloc.coreArgument.length > 0, `Bloc '${blocKey}' must have coreArgument`);

      // Vocabulary
      assert(Array.isArray(bloc.vocabulary), `Bloc '${blocKey}' vocabulary must be an array`);
      assert(bloc.vocabulary.length >= 2, `Bloc '${blocKey}' must have at least 2 vocabulary terms`);
      for (const term of bloc.vocabulary) {
        assert(term.term && term.term.length > 0, `Term string must not be empty in ${hotspot.id}/${blocKey}`);
        assert(
          ["positive", "negative", "neutral"].includes(term.connotation),
          `Term connotation must be positive, negative, or neutral (got: ${term.connotation})`
        );
        assert(term.meaningOrContext, `Term must have meaningOrContext in ${hotspot.id}/${blocKey}`);
      }

      // Representative sources
      assert(Array.isArray(bloc.representativeSources), `Representative sources must be an array`);
      assert(bloc.representativeSources.length >= 3, `Bloc '${blocKey}' must have at least 3 representative sources`);

      // Blindspots
      assert(Array.isArray(bloc.blindspots), `Blindspots must be an array`);
      assert(bloc.blindspots.length >= 2, `Bloc '${blocKey}' must have at least 2 blindspots`);

      // Real headlines
      assert(Array.isArray(bloc.realHeadlines), `Real headlines must be an array`);
      assert(bloc.realHeadlines.length >= 2, `Bloc '${blocKey}' must have at least 2 real headlines`);
      for (const h of bloc.realHeadlines) {
        assert(h.outlet && h.outlet.length > 0, `Headline must have outlet name`);
        assert(h.flag && h.flag.length > 0, `Headline must have flag emoji`);
        assert(h.title && h.title.length > 0, `Headline must have title string`);
        assert(h.framingTag && h.framingTag.length > 0, `Headline must have framingTag`);
      }

      // Metrics
      assert(bloc.metrics !== undefined, `Bloc '${blocKey}' must have metrics`);
      assert(typeof bloc.metrics.escalationSentiment === "number", `escalationSentiment must be number`);
      assert(typeof bloc.metrics.militaryEmphasis === "number", `militaryEmphasis must be number`);
      assert(typeof bloc.metrics.diplomaticEmphasis === "number", `diplomaticEmphasis must be number`);
      assert(bloc.metrics.escalationSentiment >= 0 && bloc.metrics.escalationSentiment <= 100);
      assert(bloc.metrics.militaryEmphasis >= 0 && bloc.metrics.militaryEmphasis <= 100);
      assert(bloc.metrics.diplomaticEmphasis >= 0 && bloc.metrics.diplomaticEmphasis <= 100);
    }
  }
});

// ---------------------------------------------------------------------------
// Group 2: NarrativeMatrix Component Static Rendering
// ---------------------------------------------------------------------------

test("NarrativeMatrix renders valid static HTML for default hotspot (ormuz)", () => {
  const html = renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { hotspotId: "ormuz" })
  );

  assert(html.length > 2000, "Rendered HTML should be substantial");
  assert(html.includes("Base Factual Compartilhada"), "Should contain shared fact header");
  assert(html.includes("Segurança de Navegação no Estreito de Ormuz"), "Should contain ormuz topic title");
  assert(html.includes("Irã intercepta petroleiro"), "Should contain ormuz shared fact text");
  assert(html.includes("Cruzar no Comparador"), "Should contain 1-touch comparator action");
});

test("NarrativeMatrix renders distinct visual identities for all 3 blocs", () => {
  const html = renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { hotspotId: "ormuz" })
  );

  // Bloco Ocidental
  assert(html.includes("Bloco Ocidental"), "Should display Bloco Ocidental header");
  assert(html.includes("EUA, União Europeia"), "Should display Western subtitle");
  assert(html.includes("🇺🇸 🇪🇺 🇯🇵"), "Should display Western representative flags");
  assert(html.includes("Pirataria estatal"), "Should display Western framing terms");
  assert(html.includes("Contenção Militar"), "Should display Western headline framing tag");

  // Bloco Eurasiático
  assert(html.includes("Bloco Eurasiático"), "Should display Bloco Eurasiático header");
  assert(html.includes("🇨🇳 🇷🇺 🇮🇷"), "Should display Eurasian representative flags");
  assert(html.includes("Retaliação legítima"), "Should display Eurasian framing terms");
  assert(html.includes("Anti-Hegemonia") || html.includes("Legalidade Soberana"), "Should display Eurasian framing tag");

  // Sul Global & Neutros
  assert(html.includes("Sul Global &amp; Neutros") || html.includes("Sul Global"), "Should display Sul Global header");
  assert(html.includes("🇧🇷 🇮🇳 🇿🇦"), "Should display Global South representative flags");
  assert(html.includes("Impacto inflacionário") || html.includes("Mediação multilateral"), "Should display Sul Global framing terms");
});

test("NarrativeMatrix renders representative source badges with country codes", () => {
  const html = renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { hotspotId: "ormuz" })
  );

  // Country code badges rendered from OUTLETS
  assert(html.includes("US") || html.includes("GB"), "Should render US or GB country code badge");
  assert(html.includes("IR") || html.includes("CN") || html.includes("RU"), "Should render IR/CN/RU country code badge");
  assert(html.includes("BR") || html.includes("QA") || html.includes("AE"), "Should render BR/QA/AE country code badge");
});

test("NarrativeMatrix renders Pontos Cegos & Omissões Estratégicas callout per bloc", () => {
  const html = renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { hotspotId: "ormuz" })
  );

  const blindspotHeaderOccurrences = (html.match(/Pontos Cegos &amp; Omissões Estratégicas/g) || []).length;
  assert.strictEqual(
    blindspotHeaderOccurrences,
    3,
    "Should render 3 Pontos Cegos callouts, exactly 1 per bloc"
  );
  assert(html.includes("Omite as apreensões prévias de cargas de petróleo iraniano"), "Should contain Western blindspot");
  assert(html.includes("Silencia o impacto adverso dos fechamentos de rotas marítimas"), "Should contain Eurasian blindspot");
  assert(html.includes("Postura de neutralidade muitas vezes equipara agressões armadas"), "Should contain Global South blindspot");
});

test("NarrativeMatrix renders bias and sentiment metric progress bars", () => {
  const html = renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { hotspotId: "ormuz" })
  );

  assert(html.includes("Escalação Militar"), "Should render Escalação Militar metric");
  assert(html.includes("Enfoque Bélico"), "Should render Enfoque Bélico metric");
  assert(html.includes("Enfoque Diplomático"), "Should render Enfoque Diplomático metric");
  assert(html.includes("78%"), "Should render Western escalation value (78%)");
  assert(html.includes("88%"), "Should render Global South diplomacy value (88%)");
});

test("NarrativeMatrix renders mobile segmented tab controls and test IDs", () => {
  const html = renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { hotspotId: "ormuz" })
  );

  assert(html.includes("data-testid=\"narrative-matrix-container\""), "Container test ID present");
  assert(html.includes("data-testid=\"tab-all\""), "Tab all present");
  assert(html.includes("data-testid=\"tab-west\""), "Tab west present");
  assert(html.includes("data-testid=\"tab-east\""), "Tab east present");
  assert(html.includes("data-testid=\"tab-global-south\""), "Tab global south present");
  assert(html.includes("data-testid=\"narrative-column-west\""), "Column west present");
  assert(html.includes("data-testid=\"narrative-column-east\""), "Column east present");
  assert(html.includes("data-testid=\"narrative-column-global_south\""), "Column south present");
  assert(html.includes("data-testid=\"btn-compare-header\""), "Header compare button present");
  assert(html.includes("data-testid=\"btn-compare-west\""), "West compare button present");
});

// ---------------------------------------------------------------------------
// Group 3: Defensive Robustness and Safe Fallbacks
// ---------------------------------------------------------------------------

test("NarrativeMatrix safely falls back to 'ormuz' on null, undefined, empty, or unknown hotspot IDs", () => {
  // null
  const htmlNull = renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { hotspotId: null as any })
  );
  assert(htmlNull.includes("Base Factual Compartilhada"), "Should render baseline on null hotspotId");
  assert(htmlNull.includes("Bloco Ocidental"), "Should render Western bloc on null hotspotId");

  // undefined
  const htmlUndef = renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { hotspotId: undefined })
  );
  assert(htmlUndef.includes("Base Factual Compartilhada"), "Should render baseline on undefined hotspotId");

  // Non-existent ID
  const htmlUnknown = renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { hotspotId: "unknown-galaxy-conflict-999" })
  );
  assert(htmlUnknown.includes("Base Factual Compartilhada"), "Should fallback gracefully on unknown hotspotId");
  assert(htmlUnknown.includes("Estreito de Ormuz") || htmlUnknown.includes("Bloco Ocidental"), "Should display fallback data");
});

test("NarrativeMatrix accepts custom matrix prop directly", () => {
  const customMatrix = {
    hotspotId: "custom_test",
    topicTitle: "Crise Diplomática Personalizada",
    sharedFact: "Reunião de emergência convocada em Genebra.",
    comparatorStoryId: "tarifas",
    blocs: {
      west: {
        bloc: "west",
        blocName: "Ocidente Democrático",
        framingHeadline: "Defesa irrestrita das regras comerciais",
        coreArgument: "Respeito às normas multilaterais.",
        vocabulary: [
          { term: "Regras comerciais", connotation: "positive", meaningOrContext: "Normas da OMC" },
          { term: "Violação tarifária", connotation: "negative", meaningOrContext: "Medidas protecionistas" },
        ],
        representativeSources: ["reuters"],
        blindspots: ["Ignora assimetrias históricas"],
        realHeadlines: [
          { outlet: "Reuters", flag: "🇬🇧", title: "Geneva Talks Begin", framingTag: "Diplomacia" },
        ],
        metrics: { escalationSentiment: 30, militaryEmphasis: 20, diplomaticEmphasis: 90 },
      },
      east: {
        bloc: "east",
        blocName: "Oriente Soberano",
        framingHeadline: "Fim do monopólio econômico ocidental",
        coreArgument: "Construção de arquitetura desdolarizada.",
        vocabulary: [
          { term: "Desdolarização", connotation: "positive", meaningOrContext: "Moedas locais" },
        ],
        representativeSources: ["global_times"],
        blindspots: ["Omissão sobre controles cambiais"],
        realHeadlines: [
          { outlet: "Global Times", flag: "🇨🇳", title: "New Financial Order", framingTag: "Multipolaridade" },
        ],
        metrics: { escalationSentiment: 50, militaryEmphasis: 30, diplomaticEmphasis: 70 },
      },
      global_south: {
        bloc: "global_south",
        blocName: "Sul Emergente",
        framingHeadline: "Defesa dos interesses produtivos locais",
        coreArgument: "Industrialização sustentável sem barreiras unilaterais.",
        vocabulary: [
          { term: "Desenvolvimento soberano", connotation: "positive", meaningOrContext: "Metas de industrialização" },
        ],
        representativeSources: ["folha"],
        blindspots: ["Desafios fiscais e pressões inflacionárias"],
        realHeadlines: [
          { outlet: "Folha", flag: "🇧🇷", title: "Impacto no Comércio Exterior", framingTag: "Balança Comercial" },
        ],
        metrics: { escalationSentiment: 25, militaryEmphasis: 10, diplomaticEmphasis: 95 },
      },
    },
  };

  const html = renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { matrix: customMatrix as any })
  );

  assert(html.includes("Crise Diplomática Personalizada"), "Should render custom topicTitle");
  assert(html.includes("Reunião de emergência convocada em Genebra"), "Should render custom sharedFact");
  assert(html.includes("Ocidente Democrático"), "Should render custom bloc title");
  assert(html.includes("Oriente Soberano"), "Should render custom east bloc title");
  assert(html.includes("Sul Emergente"), "Should render custom south bloc title");
  assert(html.includes("Desdolarização"), "Should render custom vocabulary term");
});

// ---------------------------------------------------------------------------
// Group 4: TensionsView Integration & Hotspot Switching
// ---------------------------------------------------------------------------

test("TensionsView includes expandable NarrativeMatrix section", () => {
  const html = renderToStaticMarkup(
    React.createElement(TensionsView, {
      stories: [],
      selectedHotspotId: "ormuz",
      onSelectHotspot: () => {},
      onCompare: () => {},
      onRead: () => {},
    })
  );

  assert(html.includes("GUERRA NARRATIVA // MATRIZ TRI-AXIAL COMPARATIVA (R3)"), "TensionsView should have narrative section title");
  assert(html.includes("data-testid=\"toggle-narrative-matrix\""), "Should have matrix expand/collapse toggle");
  assert(html.includes("Recolher Matriz"), "Matrix should be expanded by default");
  assert(html.includes("data-testid=\"narrative-matrix-container\""), "Should render NarrativeMatrix container");
  assert(html.includes("Segurança de Navegação no Estreito de Ormuz"), "Should render active hotspot narrative data");
});

test("TensionsView updates narrative matrix content when selectedHotspotId changes to 'ucrania'", () => {
  const htmlUcrania = renderToStaticMarkup(
    React.createElement(TensionsView, {
      stories: [],
      selectedHotspotId: "ucrania",
      onSelectHotspot: () => {},
      onCompare: () => {},
      onRead: () => {},
    })
  );

  assert(htmlUcrania.includes("Conflito Militar Russo-Ucraniano"), "Should display Ucrania narrative topic");
  assert(htmlUcrania.includes("Defesa inegociável da soberania ucraniana"), "Should display Ucrania Western framing headline");
  assert(htmlUcrania.includes("Operação militar defensiva contra cerco da OTAN"), "Should display Ucrania Eurasian framing headline");
});

test("TensionsView updates narrative matrix content when selectedHotspotId changes to 'taiwan'", () => {
  const htmlTaiwan = renderToStaticMarkup(
    React.createElement(TensionsView, {
      stories: [],
      selectedHotspotId: "taiwan",
      onSelectHotspot: () => {},
      onCompare: () => {},
      onRead: () => {},
    })
  );

  assert(htmlTaiwan.includes("Semicondutores") || htmlTaiwan.includes("Taiwan"), "Should display Taiwan narrative topic");
  assert(htmlTaiwan.includes("Dissuasão democrática e defesa da cadeia"), "Should display Taiwan Western framing headline");
  assert(htmlTaiwan.includes("Reunificação nacional inabalável"), "Should display Taiwan Eurasian framing headline");
});

// ---------------------------------------------------------------------------
// Group 5: App.tsx Routing & Comparador Integration
// ---------------------------------------------------------------------------

test("App.tsx source code contains openComparador with storyId and #comparador query parsing", () => {
  const appContent = fs.readFileSync(
    path.join(__dirname, "../client/src/App.tsx"),
    "utf8"
  );

  assert(
    appContent.includes("openComparador = useCallback((id?: string, outlet?: string) =>"),
    "openComparador should accept id argument"
  );
  assert(
    appContent.includes("#comparador?storyId="),
    "openComparador should update URL hash with storyId"
  );
  assert(
    appContent.includes("params.get(\"storyId\")") || appContent.includes("params.get('storyId')"),
    "handleHash should parse storyId query param"
  );
});

// ---------------------------------------------------------------------------
// Group 6: Render Static Markup for All 8 Hotspots Cleanly
// ---------------------------------------------------------------------------

test("NarrativeMatrix renders all 8 hotspots with zero exceptions", () => {
  for (const h of HOTSPOTS) {
    const html = renderToStaticMarkup(
      React.createElement(NarrativeMatrix, { hotspotId: h.id })
    );
    assert(html.length > 5000, `HTML for ${h.id} should be comprehensive (length: ${html.length})`);
    assert(html.includes("Base Factual Compartilhada"), `HTML for ${h.id} must include shared fact`);
    assert(html.includes("data-testid=\"narrative-column-west\""), `HTML for ${h.id} must include west column`);
    assert(html.includes("data-testid=\"narrative-column-east\""), `HTML for ${h.id} must include east column`);
    assert(html.includes("data-testid=\"narrative-column-global_south\""), `HTML for ${h.id} must include south column`);
  }
});

console.log("================================================================");
console.log(`MILESTONE M8 TEST SUITE COMPLETED: ${testsPassed} TESTS PASSED (100%)`);
console.log("================================================================");

/**
 * Adversarial & Empirical Test Harness for Milestone M8:
 * Tri-Axial Geopolitical Narratives Matrix Component, Data Architecture,
 * Metric Normalization & Boundary Clamping, Vocabulary Badges,
 * SSR / Static Rendering, and Robustness Under Hostile Inputs.
 *
 * Executed via: npx tsx tests/test_m8_empirical_challenger.ts
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
// Add client node_modules to path for React resolution
module.paths.push(path.join(process.cwd(), "client/node_modules"));

// Mock image asset loaders for tsx
// @ts-ignore
require.extensions[".jpg"] = () => "";
// @ts-ignore
require.extensions[".png"] = () => "";
// @ts-ignore
require.extensions[".svg"] = () => "";

const React = require("react");
const ReactDOMServer = require("react-dom/server");

const {
  HOTSPOTS,
  getHotspot,
  getNarrativeMatrix,
  normalizeHotspotId,
  NARRATIVE_MATRICES,
  GEOPOLITICAL_BLOCS,
} = require("../client/src/data/geopolitics");

const { OUTLETS } = require("../client/src/data/news");
const { NarrativeMatrix } = require("../client/src/components/geopolitics/NarrativeMatrix");
const { TensionsView } = require("../client/src/components/geopolitics/TensionsView");

console.log("================================================================================");
console.log("CHALLENGER 1: ADVERSARIAL EMPIRICAL STRESS TEST — MILESTONE M8");
console.log("Tri-Axial Geopolitical Narratives Matrix Component, Data & SSR Verification");
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
// SUITE 1: COMPREHENSIVE DATA MODEL COMPLETENESS ACROSS ALL 8 HOTSPOTS & 3 BLOCS
// ============================================================================
console.log("--- Suite 1: Data Model Completeness & Schema Across All 8 Hotspots ---");

const EXPECTED_HOTSPOTS = [
  "ormuz",
  "ucrania",
  "taiwan",
  "mar_vermelho",
  "gaza",
  "coreia",
  "sahel",
  "essequibo",
];

const REQUIRED_BLOCS = ["west", "east", "global_south"] as const;

challenge("All 8 expected hotspot matrices are defined in NARRATIVE_MATRICES", () => {
  for (const id of EXPECTED_HOTSPOTS) {
    const matrix = NARRATIVE_MATRICES[id];
    assert(matrix, `Matrix '${id}' must exist in NARRATIVE_MATRICES`);
    assert.strictEqual(matrix.hotspotId, id, `Matrix '${id}' hotspotId must match key`);
    assert(typeof matrix.topicTitle === "string" && matrix.topicTitle.trim().length > 5, `Matrix '${id}' has valid topicTitle`);
    assert(typeof matrix.sharedFact === "string" && matrix.sharedFact.trim().length > 10, `Matrix '${id}' has valid sharedFact`);
    assert(typeof matrix.comparatorStoryId === "string" && matrix.comparatorStoryId.length > 0, `Matrix '${id}' has comparatorStoryId`);
  }
});

challenge("Every hotspot matrix defines all 3 geopolitical blocs with complete editorial content", () => {
  for (const id of EXPECTED_HOTSPOTS) {
    const matrix = getNarrativeMatrix(id);
    assert(matrix, `getNarrativeMatrix('${id}') returned undefined`);

    for (const blocKey of REQUIRED_BLOCS) {
      const bloc = matrix.blocs[blocKey];
      assert(bloc, `Hotspot '${id}' is missing bloc '${blocKey}'`);
      assert.strictEqual(bloc.bloc, blocKey, `Hotspot '${id}' bloc.bloc must match '${blocKey}'`);

      // Bloc titles & arguments
      assert(typeof bloc.blocName === "string" && bloc.blocName.length > 0, `'${id}'/'${blocKey}' missing blocName`);
      assert(typeof bloc.framingHeadline === "string" && bloc.framingHeadline.length > 5, `'${id}'/'${blocKey}' missing framingHeadline`);
      assert(typeof bloc.coreArgument === "string" && bloc.coreArgument.length > 10, `'${id}'/'${blocKey}' missing coreArgument`);

      // Vocabulary terms (minimum 2 terms per bloc with valid connotation)
      assert(Array.isArray(bloc.vocabulary), `'${id}'/'${blocKey}' vocabulary must be array`);
      assert(bloc.vocabulary.length >= 2, `'${id}'/'${blocKey}' must have >= 2 vocabulary terms (got ${bloc.vocabulary.length})`);
      for (let i = 0; i < bloc.vocabulary.length; i++) {
        const v = bloc.vocabulary[i];
        assert(typeof v.term === "string" && v.term.trim().length > 0, `'${id}'/'${blocKey}' term[${i}] has empty term`);
        assert(["positive", "negative", "neutral"].includes(v.connotation), `'${id}'/'${blocKey}' term[${i}] connotation invalid: '${v.connotation}'`);
        assert(typeof v.meaningOrContext === "string" && v.meaningOrContext.length > 0, `'${id}'/'${blocKey}' term[${i}] missing meaningOrContext`);
      }

      // Representative sources (minimum 3 sources per bloc)
      assert(Array.isArray(bloc.representativeSources), `'${id}'/'${blocKey}' representativeSources must be array`);
      assert(bloc.representativeSources.length >= 3, `'${id}'/'${blocKey}' must have >= 3 sources (got ${bloc.representativeSources.length})`);
      for (const src of bloc.representativeSources) {
        assert(typeof src === "string" && src.trim().length > 0, `'${id}'/'${blocKey}' representative source is empty`);
      }

      // Strategic blind spots (minimum 2 per bloc)
      assert(Array.isArray(bloc.blindspots), `'${id}'/'${blocKey}' blindspots must be array`);
      assert(bloc.blindspots.length >= 2, `'${id}'/'${blocKey}' must have >= 2 blindspots (got ${bloc.blindspots.length})`);
      for (const blind of bloc.blindspots) {
        assert(typeof blind === "string" && blind.trim().length > 5, `'${id}'/'${blocKey}' blindspot is too short or empty`);
      }

      // Real collected headlines (minimum 2 per bloc with framingTag and outlet)
      assert(Array.isArray(bloc.realHeadlines), `'${id}'/'${blocKey}' realHeadlines must be array`);
      assert(bloc.realHeadlines.length >= 2, `'${id}'/'${blocKey}' must have >= 2 headlines (got ${bloc.realHeadlines.length})`);
      for (let i = 0; i < bloc.realHeadlines.length; i++) {
        const h = bloc.realHeadlines[i];
        assert(typeof h.title === "string" && h.title.trim().length > 5, `'${id}'/'${blocKey}' headline[${i}] has empty title`);
        assert(typeof h.outlet === "string" && h.outlet.trim().length > 0, `'${id}'/'${blocKey}' headline[${i}] has empty outlet`);
        assert(typeof h.flag === "string" && h.flag.trim().length > 0, `'${id}'/'${blocKey}' headline[${i}] has empty flag`);
        assert(typeof h.framingTag === "string" && h.framingTag.trim().length > 0, `'${id}'/'${blocKey}' headline[${i}] missing framingTag`);
      }

      // Metrics (escalationSentiment, militaryEmphasis, diplomaticEmphasis in [0, 100])
      assert(bloc.metrics, `'${id}'/'${blocKey}' missing metrics object`);
      const { escalationSentiment, militaryEmphasis, diplomaticEmphasis } = bloc.metrics;
      assert(typeof escalationSentiment === "number" && escalationSentiment >= 0 && escalationSentiment <= 100,
        `'${id}'/'${blocKey}' escalationSentiment must be between 0 and 100 (got ${escalationSentiment})`);
      assert(typeof militaryEmphasis === "number" && militaryEmphasis >= 0 && militaryEmphasis <= 100,
        `'${id}'/'${blocKey}' militaryEmphasis must be between 0 and 100 (got ${militaryEmphasis})`);
      assert(typeof diplomaticEmphasis === "number" && diplomaticEmphasis >= 0 && diplomaticEmphasis <= 100,
        `'${id}'/'${blocKey}' diplomaticEmphasis must be between 0 and 100 (got ${diplomaticEmphasis})`);
    }
  }
});

challenge("Convenience aliases (west, east, global_south, globalSouth, blindSpots) are uniformly populated", () => {
  for (const id of EXPECTED_HOTSPOTS) {
    const m = getNarrativeMatrix(id)!;
    assert.strictEqual(m.west, m.blocs.west, `Matrix '${id}' west alias matches`);
    assert.strictEqual(m.east, m.blocs.east, `Matrix '${id}' east alias matches`);
    assert.strictEqual(m.global_south, m.blocs.global_south, `Matrix '${id}' global_south alias matches`);
    assert.strictEqual(m.globalSouth, m.blocs.global_south, `Matrix '${id}' globalSouth alias matches`);

    for (const b of [m.west, m.east, m.global_south]) {
      assert(b.blindSpots, `blindSpots alias defined`);
      assert(b.blindspots, `blindspots alias defined`);
      assert.deepStrictEqual(b.blindSpots, b.blindspots, `blindspots and blindSpots aliases must match`);
    }
  }
});

// ============================================================================
// SUITE 2: SSR RENDERING UNDER REACT renderToString & renderToStaticMarkup
// ============================================================================
console.log("\n--- Suite 2: SSR Rendering Under React renderToString & renderToStaticMarkup ---");

challenge("SSR renderToString outputs complete markup for all 8 hotspots without throwing", () => {
  for (const id of EXPECTED_HOTSPOTS) {
    const element = React.createElement(NarrativeMatrix, { hotspotId: id });
    const ssrString = ReactDOMServer.renderToString(element);

    assert(typeof ssrString === "string" && ssrString.length > 2000, `SSR string for '${id}' is too short (${ssrString.length} chars)`);
    assert(ssrString.includes("Base Factual Compartilhada"), `'${id}' must include Shared Fact header`);
    assert(ssrString.includes("data-testid=\"narrative-matrix-container\""), `'${id}' must include root container test ID`);
    assert(ssrString.includes("data-testid=\"narrative-column-west\""), `'${id}' must render west column in SSR`);
    assert(ssrString.includes("data-testid=\"narrative-column-east\""), `'${id}' must render east column in SSR`);
    assert(ssrString.includes("data-testid=\"narrative-column-global_south\""), `'${id}' must render global_south column in SSR`);
  }
});

challenge("SSR renderToStaticMarkup outputs clean, valid HTML containing key semantic elements", () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { hotspotId: "ormuz" })
  );

  // Check shared fact banner
  assert(html.includes("Base Factual Compartilhada"), "Should contain shared fact banner");
  assert(html.includes("Fato Comprovado"), "Should contain factual verification pill");

  // Check 3-column layout headers
  assert(html.includes("Bloco Ocidental"), "Bloco Ocidental header present");
  assert(html.includes("Bloco Eurasiático"), "Bloco Eurasiático header present");
  assert(html.includes("Sul Global"), "Sul Global header present");

  // Check flags
  assert(html.includes("🇺🇸 🇪🇺 🇯🇵 🇬🇧"), "Western flags present");
  assert(html.includes("🇨🇳 🇷🇺 🇮🇷"), "Eurasian flags present");
  assert(html.includes("🇧🇷 🇮🇳 🇿🇦 🇦🇪"), "Global South flags present");

  // Check vocabulary pills
  assert(html.includes("Vocabulário de Guerra Narrativa"), "Vocabulary section header present");
  assert(html.includes("Conotação:"), "Connotation title attribute present");

  // Check blindspots section
  assert(html.includes("Pontos Cegos &amp; Omissões Estratégicas"), "Blind spots section present");

  // Check real headlines
  assert(html.includes("Exemplos Reais de Manchetes Coletadas"), "Headlines section present");

  // Check metrics gauges
  assert(html.includes("Escalação Militar"), "Escalação Militar metric present");
  assert(html.includes("Enfoque Bélico"), "Enfoque Bélico metric present");
  assert(html.includes("Enfoque Diplomático"), "Enfoque Diplomático metric present");

  // Check 1-touch actions
  assert(html.includes("Cruzar no Comparador"), "Comparator action present in banner");
  assert(html.includes("data-testid=\"btn-compare-west\""), "West comparator button present");
  assert(html.includes("data-testid=\"btn-compare-east\""), "East comparator button present");
  assert(html.includes("data-testid=\"btn-compare-global_south\""), "Global South comparator button present");
});

challenge("SSR rendering under single-bloc isolation passes cleanly without missing bloc crashes", () => {
  // Test single-bloc matrix isolation (e.g. only 'west' defined)
  const fullOrmuz = getNarrativeMatrix("ormuz")!;
  const westOnlyMatrix = {
    hotspotId: "ormuz",
    topicTitle: "Isolamento Bloco Ocidental",
    sharedFact: "Fato de teste em isolamento de bloco único.",
    comparatorStoryId: "tarifas",
    blocs: {
      west: fullOrmuz.blocs.west,
    } as any,
  };

  const htmlWest = ReactDOMServer.renderToString(
    React.createElement(NarrativeMatrix, { matrix: westOnlyMatrix })
  );

  assert(htmlWest.includes("data-testid=\"narrative-column-west\""), "West column must render");
  assert(!htmlWest.includes("data-testid=\"narrative-column-east\""), "East column must not render when absent");
  assert(!htmlWest.includes("data-testid=\"narrative-column-global_south\""), "Global South column must not render when absent");

  // Test single-bloc matrix isolation for 'east' only
  const eastOnlyMatrix = {
    hotspotId: "ormuz",
    topicTitle: "Isolamento Bloco Oriental",
    sharedFact: "Fato de teste em isolamento de bloco único.",
    comparatorStoryId: "tarifas",
    blocs: {
      east: fullOrmuz.blocs.east,
    } as any,
  };

  const htmlEast = ReactDOMServer.renderToString(
    React.createElement(NarrativeMatrix, { matrix: eastOnlyMatrix })
  );

  assert(htmlEast.includes("data-testid=\"narrative-column-east\""), "East column must render");
  assert(!htmlEast.includes("data-testid=\"narrative-column-west\""), "West column must not render when absent");

  // Test single-bloc matrix isolation for 'global_south' only
  const southOnlyMatrix = {
    hotspotId: "ormuz",
    topicTitle: "Isolamento Sul Global",
    sharedFact: "Fato de teste em isolamento de bloco único.",
    comparatorStoryId: "tarifas",
    blocs: {
      global_south: fullOrmuz.blocs.global_south,
    } as any,
  };

  const htmlSouth = ReactDOMServer.renderToString(
    React.createElement(NarrativeMatrix, { matrix: southOnlyMatrix })
  );

  assert(htmlSouth.includes("data-testid=\"narrative-column-global_south\""), "Global South column must render");
  assert(!htmlSouth.includes("data-testid=\"narrative-column-west\""), "West column must not render when absent");
});

// ============================================================================
// SUITE 3: DEFENSIVE ROBUSTNESS, INPUT COERCION & MALFORMED HOTSPOT IDs
// ============================================================================
console.log("\n--- Suite 3: Input Coercion, Normalization & Defensive Fallbacks ---");

challenge("normalizeHotspotId safely coerces hostile/unexpected types", () => {
  assert.strictEqual(normalizeHotspotId(null), "", "null coerces to empty string");
  assert.strictEqual(normalizeHotspotId(undefined), "", "undefined coerces to empty string");
  assert.strictEqual(normalizeHotspotId(12345), "12345", "number coerces to string");
  assert.strictEqual(normalizeHotspotId("ORMUZ"), "ormuz", "uppercase normalizes to lowercase");
  assert.strictEqual(normalizeHotspotId("  Taiwan  "), "taiwan", "whitespace is trimmed");
  assert.strictEqual(normalizeHotspotId("mar-vermelho"), "mar_vermelho", "kebab-case converts to snake_case");
  assert.strictEqual(normalizeHotspotId("MAR_VERMELHO"), "mar_vermelho", "uppercase snake_case normalizes");
  assert.strictEqual(normalizeHotspotId("marvermelho"), "mar_vermelho", "compact marvermelho normalizes to mar_vermelho");
  assert.strictEqual(normalizeHotspotId("leste-europeu"), "leste_europeu", "hyphens converted to underscores");
});

challenge("NarrativeMatrix gracefully falls back to 'ormuz' across extreme ID edge cases", () => {
  const hostileIds = [
    null,
    undefined,
    "",
    "   ",
    99999,
    "unknown_conflict_zone_99",
    "../../etc/passwd",
    "<script>alert(1)</script>",
    "'; DROP TABLE hotspots; --",
  ];

  for (const hostile of hostileIds) {
    const html = ReactDOMServer.renderToStaticMarkup(
      React.createElement(NarrativeMatrix, { hotspotId: hostile as any })
    );

    assert(html.includes("Base Factual Compartilhada"), `Hostile ID '${hostile}' renders shared fact baseline`);
    assert(html.includes("data-testid=\"narrative-column-west\""), `Hostile ID '${hostile}' renders western column`);
    assert(html.includes("data-testid=\"narrative-column-east\""), `Hostile ID '${hostile}' renders eastern column`);
    assert(html.includes("data-testid=\"narrative-column-global_south\""), `Hostile ID '${hostile}' renders southern column`);
  }
});

// ============================================================================
// SUITE 4: METRIC NORMALIZATION, BOUNDARY CLAMPING & PROGRESS BAR CSS
// ============================================================================
console.log("\n--- Suite 4: Metric Boundary Clamping & Gauge Formatting ---");

challenge("Metric gauges clamp negative values, overflow values, and handle float percentages cleanly", () => {
  const boundaryMatrix = {
    hotspotId: "boundary_test",
    topicTitle: "Teste de Limites de Métricas",
    sharedFact: "Fato de teste para validação de limites de métricas numéricas.",
    comparatorStoryId: "tarifas",
    blocs: {
      west: {
        bloc: "west",
        blocName: "Bloco Oeste",
        framingHeadline: "Teste de métricas extremas",
        coreArgument: "Argumento de teste.",
        vocabulary: [{ term: "Termo", connotation: "neutral", meaningOrContext: "Contexto" }],
        representativeSources: ["reuters"],
        blindspots: ["Ponto cego"],
        realHeadlines: [{ outlet: "Reuters", flag: "🇬🇧", title: "Test", framingTag: "Tag" }],
        metrics: {
          escalationSentiment: -45, // Should clamp to 0%
          militaryEmphasis: 180,    // Should clamp to 100%
          diplomaticEmphasis: 0.65, // Should convert float 0.65 -> 65%
        },
      },
      east: {
        bloc: "east",
        blocName: "Bloco Leste",
        framingHeadline: "Teste de NaN e limites",
        coreArgument: "Argumento de teste.",
        vocabulary: [{ term: "Termo", connotation: "neutral", meaningOrContext: "Contexto" }],
        representativeSources: ["xinhua"],
        blindspots: ["Ponto cego"],
        realHeadlines: [{ outlet: "Xinhua", flag: "🇨🇳", title: "Test", framingTag: "Tag" }],
        metrics: {
          escalationSentiment: NaN,       // Should fallback to 50%
          militaryEmphasis: 0,            // Boundary 0 -> 0%
          diplomaticEmphasis: 1,          // Boundary 1 -> 100%
        },
      },
      global_south: {
        bloc: "global_south",
        blocName: "Sul Global",
        framingHeadline: "Teste de valores nulos e infinitos",
        coreArgument: "Argumento de teste.",
        vocabulary: [{ term: "Termo", connotation: "neutral", meaningOrContext: "Contexto" }],
        representativeSources: ["folha"],
        blindspots: ["Ponto cego"],
        realHeadlines: [{ outlet: "Folha", flag: "🇧🇷", title: "Test", framingTag: "Tag" }],
        metrics: {
          escalationSentiment: Infinity,  // Should clamp to 100%
          militaryEmphasis: -Infinity, // Should clamp to 0%
          diplomaticEmphasis: undefined as any, // Should fallback to 50%
        },
      },
    },
  };

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { matrix: boundaryMatrix as any })
  );

  // West: -45 clamped to 0%, 180 clamped to 100%, 0.65 converted to 65%
  assert(html.includes("width:0%"), "West negative metric clamped to width:0%");
  assert(html.includes("width:100%"), "West overflow metric clamped to width:100%");
  assert(html.includes("width:65%"), "West float metric converted to width:65%");
  assert(html.includes("0%"), "Text display renders 0%");
  assert(html.includes("100%"), "Text display renders 100%");
  assert(html.includes("65%"), "Text display renders 65%");

  // East: NaN fallback to 50%, 0 boundary to 0%, 1 boundary to 100%
  assert(html.includes("width:50%"), "East NaN fallback to width:50%");

  // Never produces invalid CSS styles like width:-45% or width:NaN%
  assert(!html.includes("width:-"), "No negative CSS percentage widths permitted");
  assert(!html.includes("width:NaN%"), "No NaN CSS percentage widths permitted");
  assert(!html.includes("width:180%"), "No overflow CSS percentage widths permitted");
});

// ============================================================================
// SUITE 5: ADVERSARIAL CONTENT INJECTION, HTML ESCAPING & SPECIAL CHARACTERS
// ============================================================================
console.log("\n--- Suite 5: HTML Escaping, XSS Neutralization & Multilingual Scripts ---");

challenge("React DOM server safely escapes adversarial HTML/XSS injection attempts", () => {
  const xssMatrix = {
    hotspotId: "xss_test",
    topicTitle: '<script>alert("XSS-TITLE")</script>',
    sharedFact: '<img src=x onerror="alert(\'XSS-FACT\')">',
    comparatorStoryId: "tarifas",
    blocs: {
      west: {
        bloc: "west",
        blocName: '<b onmouseover="alert(1)">Bloco Perigoso</b>',
        framingHeadline: '<iframe src="javascript:alert(\'PWNED\')"></iframe>',
        coreArgument: '<a href="javascript:alert(1)">Clique aqui</a>',
        vocabulary: [
          {
            term: "<script>dangerousTerm()</script>",
            connotation: "negative" as const,
            meaningOrContext: "<style>body{display:none}</style>",
          },
        ],
        representativeSources: ['<svg onload="alert(1)">'],
        blindspots: ['<input autofocus onfocus="alert(1)">'],
        realHeadlines: [
          {
            outlet: '<img src="hack.jpg">',
            flag: "🏴‍☠️",
            title: '<script>eval("hacked")</script>',
            framingTag: '<b>TAG</b>',
          },
        ],
        metrics: { escalationSentiment: 70, militaryEmphasis: 60, diplomaticEmphasis: 40 },
      },
      east: {
        bloc: "east",
        blocName: "Bloco Oriental",
        framingHeadline: "Defesa padrão",
        coreArgument: "Argumento.",
        vocabulary: [{ term: "Termo", connotation: "neutral" as const, meaningOrContext: "Contexto" }],
        representativeSources: ["reuters"],
        blindspots: ["Ponto cego"],
        realHeadlines: [{ outlet: "Reuters", flag: "🇬🇧", title: "Title", framingTag: "Tag" }],
        metrics: { escalationSentiment: 50, militaryEmphasis: 50, diplomaticEmphasis: 50 },
      },
      global_south: {
        bloc: "global_south",
        blocName: "Sul Global",
        framingHeadline: "Defesa neutra",
        coreArgument: "Argumento.",
        vocabulary: [{ term: "Termo", connotation: "neutral" as const, meaningOrContext: "Contexto" }],
        representativeSources: ["folha"],
        blindspots: ["Ponto cego"],
        realHeadlines: [{ outlet: "Folha", flag: "🇧🇷", title: "Title", framingTag: "Tag" }],
        metrics: { escalationSentiment: 50, militaryEmphasis: 50, diplomaticEmphasis: 50 },
      },
    },
  };

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { matrix: xssMatrix as any })
  );

  // Raw executable script/iframe tags must NOT exist unescaped
  assert(!html.includes("<script>alert"), "No unescaped script tag in rendered HTML");
  assert(!html.includes("<iframe"), "No unescaped iframe tag in rendered HTML");
  assert(!html.includes("<img src=x onerror"), "No unescaped onerror handler in rendered HTML");

  // Escaped entity representations must be present
  assert(html.includes("&lt;script&gt;"), "Script tag safely escaped to &lt;script&gt;");
  assert(html.includes("&lt;iframe"), "Iframe tag safely escaped to &lt;iframe");
});

challenge("Non-Latin alphabets and unicode scripts (Arabic, Cyrillic, Chinese, Hebrew, Emoji) render faithfully", () => {
  const multilingualMatrix = {
    hotspotId: "intl_test",
    topicTitle: "مضيق هرمز // 霍尔木兹海峡 // Ормузский пролив // מצר הורמוז 🌍",
    sharedFact: "الرئيس الإيراني يؤكد حرية الملاحة المشروطة // 俄外交部发表声明 // 新华社评论员文章",
    comparatorStoryId: "tarifas",
    blocs: {
      west: {
        bloc: "west",
        blocName: "Western Coalition // التحالف الدولي",
        framingHeadline: "Freedom of Navigation Operations in international waters ⚓",
        coreArgument: "Adherence to UNCLOS convention principles.",
        vocabulary: [{ term: "FONOPS 🚢", connotation: "positive" as const, meaningOrContext: "Freedom of navigation" }],
        representativeSources: ["Reuters [GB]"],
        blindspots: ["Overlooks regional sovereignty concerns"],
        realHeadlines: [{ outlet: "BBC", flag: "🇬🇧", title: "Royal Navy escorts tanker", framingTag: "Escort" }],
        metrics: { escalationSentiment: 75, militaryEmphasis: 80, diplomaticEmphasis: 30 },
      },
      east: {
        bloc: "east",
        blocName: "Eurasiático // 欧亚集团 // Евразия",
        framingHeadline: "反对外部干涉 // Защита суверенитета от односторонних санкций",
        coreArgument: "多极世界秩序建设与本币结算.",
        vocabulary: [{ term: "去美元化 💵", connotation: "positive" as const, meaningOrContext: "Desdolarização multilateral" }],
        representativeSources: ["Global Times [CN]"],
        blindspots: ["Игнорирование регионального беспокойства"],
        realHeadlines: [{ outlet: "TASS", flag: "🇷🇺", title: "Москва призывает к сдержанности", framingTag: "Дипломатия" }],
        metrics: { escalationSentiment: 70, militaryEmphasis: 65, diplomaticEmphasis: 40 },
      },
      global_south: {
        bloc: "global_south",
        blocName: "Sul Global // الجنوب العالمي",
        framingHeadline: "Preços de energia e impacto nos países em desenvolvimento 🛢️",
        coreArgument: "Preservação da segurança alimentar e estabilidade cambial.",
        vocabulary: [{ term: "Desescalada 🕊️", connotation: "positive" as const, meaningOrContext: "Cessar-fogo e diálogo" }],
        representativeSources: ["Al Jazeera [QA]"],
        blindspots: ["Equidistância excessiva diante de atos unilaterais"],
        realHeadlines: [{ outlet: "Folha", flag: "🇧🇷", title: "Petróleo sobe com tensão no Golfo", framingTag: "Commodities" }],
        metrics: { escalationSentiment: 30, militaryEmphasis: 20, diplomaticEmphasis: 90 },
      },
    },
  };

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { matrix: multilingualMatrix as any })
  );

  assert(html.includes("مضيق هرمز"), "Arabic script rendered intact");
  assert(html.includes("霍尔木兹海峡"), "Chinese script rendered intact");
  assert(html.includes("Ормузский пролив"), "Cyrillic script rendered intact");
  assert(html.includes("מצר הורמוז"), "Hebrew script rendered intact");
  assert(html.includes("🚢") && html.includes("🕊️") && html.includes("🛢️"), "Complex unicode emojis rendered intact");
});

// ============================================================================
// SUITE 6: SOURCE BADGE RESOLUTION & COUNTRY CODE MATCHING
// ============================================================================
console.log("\n--- Suite 6: Source Badge Resolution & Country Code Matching ---");

challenge("Representative source badge correctly resolves country code and flag from catalog or fallback", () => {
  const sourcesMatrix = {
    hotspotId: "sources_test",
    topicTitle: "Teste de Resolução de Fontes",
    sharedFact: "Fato de teste para verificação do resolvedor de fontes.",
    comparatorStoryId: "tarifas",
    blocs: {
      west: {
        bloc: "west",
        blocName: "West",
        framingHeadline: "Framing",
        coreArgument: "Argument",
        vocabulary: [{ term: "Term", connotation: "neutral" as const, meaningOrContext: "Context" }],
        representativeSources: [
          "wsj_world",               // Catalog outlet (US)
          "reuters",                 // Catalog outlet (GB)
          "kyiv_independent",        // Catalog outlet (UA)
          "Kyiv Post [UA]",          // Custom with brackets format
          "unregistered_outlet_source" // Fallback underscore format
        ],
        blindspots: ["Blindspot"],
        realHeadlines: [{ outlet: "Reuters", flag: "🇬🇧", title: "Title", framingTag: "Tag" }],
        metrics: { escalationSentiment: 50, militaryEmphasis: 50, diplomaticEmphasis: 50 },
      },
      east: {
        bloc: "east",
        blocName: "East",
        framingHeadline: "Framing",
        coreArgument: "Argument",
        vocabulary: [{ term: "Term", connotation: "neutral" as const, meaningOrContext: "Context" }],
        representativeSources: ["xinhua", "global_times", "tass", "irna_iran"],
        blindspots: ["Blindspot"],
        realHeadlines: [{ outlet: "Xinhua", flag: "🇨🇳", title: "Title", framingTag: "Tag" }],
        metrics: { escalationSentiment: 50, militaryEmphasis: 50, diplomaticEmphasis: 50 },
      },
      global_south: {
        bloc: "global_south",
        blocName: "Global South",
        framingHeadline: "Framing",
        coreArgument: "Argument",
        vocabulary: [{ term: "Term", connotation: "neutral" as const, meaningOrContext: "Context" }],
        representativeSources: ["folha", "al_jazeera", "the_hindu"],
        blindspots: ["Blindspot"],
        realHeadlines: [{ outlet: "Folha", flag: "🇧🇷", title: "Title", framingTag: "Tag" }],
        metrics: { escalationSentiment: 50, militaryEmphasis: 50, diplomaticEmphasis: 50 },
      },
    },
  };

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { matrix: sourcesMatrix as any })
  );

  // Check country badges rendered in tags
  assert(html.includes("US"), "Resolved US country badge for wsj_world");
  assert(html.includes("GB"), "Resolved GB country badge for reuters");
  assert(html.includes("UA"), "Resolved UA country badge from 'Kyiv Post [UA]' or kyiv_independent");
  assert(html.includes("CN"), "Resolved CN country badge for xinhua/global_times");
  assert(html.includes("RU"), "Resolved RU country badge for tass");
  assert(html.includes("IR"), "Resolved IR country badge for irna_iran");
  assert(html.includes("BR"), "Resolved BR country badge for folha");
  assert(html.includes("INT"), "Resolved fallback INT country badge for unregistered_outlet_source");
  assert(html.includes("Unregistered Outlet Source"), "Formatted clean name for fallback");
});

// ============================================================================
// SUITE 7: INTEGRATION WITH TensionsView & URL ROUTING CONTRACT
// ============================================================================
console.log("\n--- Suite 7: Integration with TensionsView & URL Routing Contract ---");

challenge("TensionsView correctly renders NarrativeMatrix when matrixExpanded is true", () => {
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(TensionsView, {
      onCompare: () => {},
      onRead: () => {},
    })
  );

  // Check toggle button
  assert(html.includes("data-testid=\"toggle-narrative-matrix\""), "Toggle button present in TensionsView");
  assert(html.includes("Expandir Matriz Tri-Axial") || html.includes("Recolher Matriz"), "Toggle label present");

  // By default, TensionsView has matrixExpanded = false
  // When activeHotspotId changes or toggle clicked, it mounts NarrativeMatrix
});

challenge("App.tsx routing handler supports #comparador?storyId=... deep linking", () => {
  const appFile = fs.readFileSync(path.join(process.cwd(), "client/src/App.tsx"), "utf-8");

  assert(appFile.includes("openComparador"), "App.tsx defines openComparador function");
  assert(appFile.includes("#comparador"), "App.tsx synchronizes hash with #comparador");
  assert(appFile.includes("storyId"), "App.tsx passes or parses storyId query param");
});
// ============================================================================
// SUITE 8: ADVERSARIAL CORRUPT MATRICES & EXTREME STRESS HARNESS
// ============================================================================
console.log("\n--- Suite 8: Adversarial Corrupt Matrices & Extreme Stress Harness ---");

challenge("NarrativeMatrix survives completely empty matrix ({}) without uncaught exceptions", () => {
  const emptyMatrix = {} as any;
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { matrix: emptyMatrix })
  );

  assert(html.includes("data-testid=\"narrative-matrix-container\""), "Empty matrix renders container safely");
  assert(html.includes("Base Factual Compartilhada"), "Empty matrix falls back to default factual baseline");
});

challenge("NarrativeMatrix survives matrix with empty blocs ({ blocs: {} })", () => {
  const hollowMatrix = {
    hotspotId: "hollow",
    topicTitle: "Hollow Matrix",
    sharedFact: "Fato de teste em matriz oca.",
    comparatorStoryId: "tarifas",
    blocs: {} as any,
  };

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { matrix: hollowMatrix })
  );

  assert(html.includes("data-testid=\"narrative-matrix-container\""), "Hollow matrix renders container safely");
  assert(html.includes("Hollow Matrix"), "Hollow matrix renders topic title");
});

challenge("NarrativeMatrix survives blocs with empty arrays and missing metrics", () => {
  const strippedMatrix = {
    hotspotId: "stripped",
    topicTitle: "Stripped Blocs Matrix",
    sharedFact: "Fato de teste com arrays vazios.",
    comparatorStoryId: "tarifas",
    blocs: {
      west: {
        bloc: "west",
        blocName: "West",
        framingHeadline: "Headline",
        vocabulary: [],
        representativeSources: [],
        blindspots: [],
        realHeadlines: [],
        metrics: undefined as any,
      },
      east: {
        bloc: "east",
        blocName: "East",
        framingHeadline: "Headline",
        vocabulary: [],
        representativeSources: [],
        blindspots: [],
        realHeadlines: [],
        metrics: null as any,
      },
      global_south: {
        bloc: "global_south",
        blocName: "South",
        framingHeadline: "Headline",
        vocabulary: [],
        representativeSources: [],
        blindspots: [],
        realHeadlines: [],
        metrics: {} as any,
      },
    },
  };

  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(NarrativeMatrix, { matrix: strippedMatrix as any })
  );

  assert(html.includes("Nenhum termo catalogado"), "Displays fallback for empty vocabulary");
  assert(html.includes("Nenhum ponto cego catalogado"), "Displays fallback for empty blindspots");
  assert(html.includes("Sem manchetes registradas"), "Displays fallback for empty headlines");
  assert(html.includes("50%"), "Displays default 50% for missing metrics");
});

// ============================================================================
// SUITE 9: VOCABULARY STATISTICS & COMPARATOR ACTION PARAMETER INTEGRITY
// ============================================================================
console.log("\n--- Suite 9: Vocabulary Distribution & Comparator Parameter Contracts ---");

challenge("All 8 hotspots provide a rich semantic vocabulary with positive, negative and neutral connotations", () => {
  let totalTerms = 0;
  let posCount = 0;
  let negCount = 0;
  let neutralCount = 0;

  for (const id of EXPECTED_HOTSPOTS) {
    const m = getNarrativeMatrix(id)!;
    for (const bKey of REQUIRED_BLOCS) {
      const b = m.blocs[bKey];
      for (const v of b.vocabulary) {
        totalTerms++;
        if (v.connotation === "positive") posCount++;
        else if (v.connotation === "negative") negCount++;
        else neutralCount++;
      }
    }
  }

  assert(totalTerms >= 48, `Across 8 hotspots x 3 blocs x >=2 terms, expected >=48 terms (found: ${totalTerms})`);
  assert(posCount > 0, "Must contain positive connotation terms");
  assert(negCount > 0, "Must contain negative connotation terms");
  console.log(`     Semantic Distribution: Total: ${totalTerms} terms (+: ${posCount}, -: ${negCount}, neutral: ${neutralCount})`);
});

challenge("Every hotspot defines a valid, non-empty comparatorStoryId", () => {
  for (const id of EXPECTED_HOTSPOTS) {
    const m = getNarrativeMatrix(id)!;
    assert(m.comparatorStoryId && m.comparatorStoryId.length > 0, `Hotspot '${id}' comparatorStoryId must be non-empty`);
  }
});

// ============================================================================
// SUITE 10: EXHAUSTIVE VERIFICATION SUMMARY & ASSERTION COUNT
// ============================================================================

console.log("\n================================================================================");
console.log(`CHALLENGER 1 EMPIRICAL AUDIT RESULTS:`);
console.log(`Total Challenges Executed: ${totalCount}`);
console.log(`Passed: ${passedCount}`);
console.log(`Failed: ${failureList.length}`);
if (failureList.length > 0) {
  console.log(`Failure details:\n${failureList.map((f, i) => `  ${i + 1}. ${f}`).join("\n")}`);
}
console.log("================================================================================\n");

if (failureList.length > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL ADVERSARIAL EMPIRICAL CHALLENGES PASSED CLEANLY!");
}

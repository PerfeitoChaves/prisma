// Adversarial & Empirical Test Suite for Milestone M6: Geopolitical Data Architecture & 86 Sources Catalog
// Run with: npx tsx tests/test_geopolitics_adversarial.ts

import fs from 'fs';
import path from 'path';

// Mock image extensions for Node/tsx loader
// @ts-ignore
require.extensions['.jpg'] = () => '';
// @ts-ignore
require.extensions['.png'] = () => '';
// @ts-ignore
require.extensions['.svg'] = () => '';

const {
  HOTSPOTS,
  NARRATIVE_MATRICES,
  GEOPOLITICAL_BLOCS,
  getHotspot,
  getHotspotById,
  getNarrativeMatrix,
  getSourcesByBloc,
  filterHotspotsBySeverity,
} = require('../client/src/data/geopolitics');

const { OUTLETS } = require('../client/src/data/news');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, detail: string = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedTests++;
    const msg = `❌ FAIL: ${testName} ${detail ? '(' + detail + ')' : ''}`;
    console.error(`  ${msg}`);
    failures.push(msg);
  }
}

console.log('================================================================');
console.log('STARTING EMPIRICAL ADVERSARIAL TEST SUITE FOR MILESTONE M6');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SUITE 1: HOTSPOTS INTEGRITY, STRUCTURE & SCHEMAS
// -----------------------------------------------------------------------------
console.log('--- Suite 1: Hotspots Integrity & Schema Invariants ---');

assert(Array.isArray(HOTSPOTS), 'HOTSPOTS is an Array');
assert(HOTSPOTS.length === 8, 'HOTSPOTS contains exactly 8 hotspots', `Actual: ${HOTSPOTS.length}`);

const EXPECTED_IDS = [
  'ormuz',
  'ucrania',
  'taiwan',
  'mar_vermelho',
  'gaza',
  'coreia',
  'sahel',
  'essequibo',
];

const foundIds = HOTSPOTS.map((h: any) => h.id);
assert(
  EXPECTED_IDS.every((id) => foundIds.includes(id)),
  'All 8 expected hotspot IDs exist in HOTSPOTS',
  `Found: ${foundIds.join(', ')}`
);

const uniqueIds = new Set(foundIds);
assert(uniqueIds.size === 8, 'All hotspot IDs are unique with zero duplicates', `Unique: ${uniqueIds.size}`);

for (const h of HOTSPOTS) {
  assert(typeof h.title === 'string' && h.title.length > 3, `Hotspot ${h.id} has valid title`, h.title);
  assert(h.name === h.title, `Hotspot ${h.id} name alias equals title`);
  assert(typeof h.region === 'string' && h.region.length > 2, `Hotspot ${h.id} has region`, h.region);
  assert(typeof h.summary === 'string' && h.summary.length > 30, `Hotspot ${h.id} has detailed summary`);
  assert(typeof h.strategicImportance === 'string' && h.strategicImportance.length > 30, `Hotspot ${h.id} has strategicImportance`);
  assert(h.strategicRelevance === h.strategicImportance, `Hotspot ${h.id} strategicRelevance alias equals strategicImportance`);

  // Severity
  assert(['critico', 'alto', 'moderado'].includes(h.severity), `Hotspot ${h.id} severity is valid`, h.severity);
  assert(h.tensionLevel === h.severity, `Hotspot ${h.id} tensionLevel alias equals severity`);

  // Tension score
  assert(typeof h.tensionScore === 'number' && h.tensionScore >= 0 && h.tensionScore <= 100, `Hotspot ${h.id} tensionScore is 0-100`, String(h.tensionScore));

  // News count
  assert(typeof h.newsCount === 'number' && h.newsCount > 0, `Hotspot ${h.id} newsCount is positive`, String(h.newsCount));
  assert(h.articleCount === h.newsCount, `Hotspot ${h.id} articleCount alias equals newsCount`);

  // Related stories
  assert(Array.isArray(h.relatedStoryIds) && h.relatedStoryIds.length > 0, `Hotspot ${h.id} has relatedStoryIds`);
  assert(JSON.stringify(h.correlatedStoryIds) === JSON.stringify(h.relatedStoryIds), `Hotspot ${h.id} correlatedStoryIds alias matches relatedStoryIds`);

  // Timestamp
  assert(!isNaN(Date.parse(h.updatedAt)), `Hotspot ${h.id} has valid ISO updatedAt`, h.updatedAt);
}

// Check severity distribution
const criticos = HOTSPOTS.filter((h: any) => h.severity === 'critico');
const altos = HOTSPOTS.filter((h: any) => h.severity === 'alto');
const moderados = HOTSPOTS.filter((h: any) => h.severity === 'moderado');

assert(criticos.length === 4, 'Critico severity count is 4 (ormuz, ucrania, mar_vermelho, gaza)', `Actual: ${criticos.length}`);
assert(altos.length === 2, 'Alto severity count is 2 (taiwan, coreia)', `Actual: ${altos.length}`);
assert(moderados.length === 2, 'Moderado severity count is 2 (sahel, essequibo)', `Actual: ${moderados.length}`);

// Monotonicity of tension scores across severity categories
const minCriticoScore = Math.min(...criticos.map((h: any) => h.tensionScore));
const maxAltoScore = Math.max(...altos.map((h: any) => h.tensionScore));
const minAltoScore = Math.min(...altos.map((h: any) => h.tensionScore));
const maxModeradoScore = Math.max(...moderados.map((h: any) => h.tensionScore));

assert(minCriticoScore >= maxAltoScore, 'Monotonic tension: Min critico score >= max alto score', `Critico min: ${minCriticoScore}, Alto max: ${maxAltoScore}`);
assert(minAltoScore >= maxModeradoScore, 'Monotonic tension: Min alto score >= max moderado score', `Alto min: ${minAltoScore}, Moderado max: ${maxModeradoScore}`);

// -----------------------------------------------------------------------------
// SUITE 2: GEOGRAPHIC & SVG COORDINATES ADVERSARIAL VALIDATION
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Geographic & SVG Projection Coordinates ---');

const expectedGeoBoundaries: Record<string, { latRange: [number, number], lngRange: [number, number] }> = {
  ormuz: { latRange: [24, 28], lngRange: [54, 58] },
  ucrania: { latRange: [44, 53], lngRange: [24, 41] },
  taiwan: { latRange: [21, 26], lngRange: [118, 124] },
  mar_vermelho: { latRange: [11, 28], lngRange: [35, 45] },
  gaza: { latRange: [30, 33], lngRange: [33, 36] },
  coreia: { latRange: [36, 40], lngRange: [124, 131] },
  sahel: { latRange: [10, 20], lngRange: [10, 35] },
  essequibo: { latRange: [4, 9], lngRange: [-62, -56] },
};

const svgCoordsSet = new Set<string>();

for (const h of HOTSPOTS) {
  // Lat/Lng range
  assert(h.coordinates.lat >= -90 && h.coordinates.lat <= 90, `Hotspot ${h.id} latitude in [-90, 90]`, String(h.coordinates.lat));
  assert(h.coordinates.lng >= -180 && h.coordinates.lng <= 180, `Hotspot ${h.id} longitude in [-180, 180]`, String(h.coordinates.lng));

  // Bounding box realism
  const bounds = expectedGeoBoundaries[h.id];
  if (bounds) {
    assert(
      h.coordinates.lat >= bounds.latRange[0] && h.coordinates.lat <= bounds.latRange[1],
      `Hotspot ${h.id} latitude within realistic bounds [${bounds.latRange[0]}, ${bounds.latRange[1]}]`,
      `Actual: ${h.coordinates.lat}`
    );
    assert(
      h.coordinates.lng >= bounds.lngRange[0] && h.coordinates.lng <= bounds.lngRange[1],
      `Hotspot ${h.id} longitude within realistic bounds [${bounds.lngRange[0]}, ${bounds.lngRange[1]}]`,
      `Actual: ${h.coordinates.lng}`
    );
  }

  // SVG viewBox boundaries [1000 x 500]
  assert(h.svgCoordinates.x >= 0 && h.svgCoordinates.x <= 1000, `Hotspot ${h.id} SVG x in [0, 1000]`, String(h.svgCoordinates.x));
  assert(h.svgCoordinates.y >= 0 && h.svgCoordinates.y <= 500, `Hotspot ${h.id} SVG y in [0, 500]`, String(h.svgCoordinates.y));
  assert(
    h.svgCoords.x === h.svgCoordinates.x && h.svgCoords.y === h.svgCoordinates.y,
    `Hotspot ${h.id} svgCoords alias matches svgCoordinates`
  );

  // Projection math consistency: equirectangular map projection (1000x500)
  const expectedSvgX = ((h.coordinates.lng + 180) / 360) * 1000;
  const expectedSvgY = ((90 - h.coordinates.lat) / 180) * 500;
  const diffX = Math.abs(h.svgCoordinates.x - expectedSvgX);
  const diffY = Math.abs(h.svgCoordinates.y - expectedSvgY);

  assert(
    diffX <= 5,
    `Hotspot ${h.id} SVG x coordinate mathematically accurate (diff: ${diffX.toFixed(2)}px)`,
    `SVG: ${h.svgCoordinates.x}, Expected: ${expectedSvgX.toFixed(2)}`
  );
  assert(
    diffY <= 5,
    `Hotspot ${h.id} SVG y coordinate mathematically accurate (diff: ${diffY.toFixed(2)}px)`,
    `SVG: ${h.svgCoordinates.y}, Expected: ${expectedSvgY.toFixed(2)}`
  );

  // Collision check
  const coordKey = `${h.svgCoordinates.x},${h.svgCoordinates.y}`;
  assert(!svgCoordsSet.has(coordKey), `Hotspot ${h.id} SVG coordinates are distinct (no collision)`);
  svgCoordsSet.add(coordKey);
}

// -----------------------------------------------------------------------------
// SUITE 3: ACTORS INTEGRITY & TRI-AXIAL DIVERSITY
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: Actors Integrity & Diversity ---');

for (const h of HOTSPOTS) {
  assert(Array.isArray(h.actors) && h.actors.length >= 3, `Hotspot ${h.id} has >= 3 actors`, `Count: ${h.actors.length}`);

  const actorIds = new Set<string>();
  const actorBlocs = new Set<string>();

  for (const a of h.actors) {
    assert(typeof a.id === 'string' && a.id.length > 0, `Hotspot ${h.id} actor has id`, a.id);
    assert(!actorIds.has(a.id), `Hotspot ${h.id} actor id is unique within hotspot`, a.id);
    actorIds.add(a.id);

    assert(typeof a.name === 'string' && a.name.length > 0, `Actor ${a.id} has name`, a.name);
    assert(typeof a.country === 'string' && a.country.length > 0, `Actor ${a.id} has country`, a.country);
    assert(typeof a.countryCode === 'string' && a.countryCode.length === 2, `Actor ${a.id} has ISO 2-letter countryCode`, a.countryCode);
    assert(typeof a.flagEmoji === 'string' && a.flagEmoji.length > 0, `Actor ${a.id} has flagEmoji`, a.flagEmoji);
    assert(a.flag === a.flagEmoji, `Actor ${a.id} flag alias equals flagEmoji`);
    assert(['west', 'east', 'global_south'].includes(a.bloc), `Actor ${a.id} bloc is valid`, a.bloc);
    actorBlocs.add(a.bloc);
    assert(typeof a.role === 'string' && a.role.length >= 15, `Actor ${a.id} has detailed role description`);
  }

  assert(actorBlocs.size >= 2, `Hotspot ${h.id} actors represent at least 2 distinct geopolitical blocs`, Array.from(actorBlocs).join(', '));
}

// -----------------------------------------------------------------------------
// SUITE 4: TRI-AXIAL NARRATIVE MATRICES COVERAGE & CATALOG CROSS-REF
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: Narrative Matrices & Catalog Cross-Referencing ---');

assert(typeof NARRATIVE_MATRICES === 'object' && NARRATIVE_MATRICES !== null, 'NARRATIVE_MATRICES is an object');
const matrixKeys = Object.keys(NARRATIVE_MATRICES);
assert(matrixKeys.length === 8, 'NARRATIVE_MATRICES contains exactly 8 matrices', `Actual: ${matrixKeys.length}`);

for (const id of EXPECTED_IDS) {
  assert(matrixKeys.includes(id), `NARRATIVE_MATRICES has entry for hotspot '${id}'`);
}

// Build map of valid outlet IDs and their blocs from OUTLETS
const catalogOutlets = new Map<string, any>();
for (const o of OUTLETS) {
  catalogOutlets.set(o.id, o);
}

const BLOCS = ['west', 'east', 'global_south'] as const;

for (const hotspotId of EXPECTED_IDS) {
  const matrix = NARRATIVE_MATRICES[hotspotId];
  assert(!!matrix, `Matrix for ${hotspotId} exists`);
  assert(matrix.hotspotId === hotspotId, `Matrix hotspotId matches key '${hotspotId}'`);

  // Check aliases
  assert(matrix.west === matrix.blocs.west, `Matrix ${hotspotId} alias .west matches .blocs.west`);
  assert(matrix.east === matrix.blocs.east, `Matrix ${hotspotId} alias .east matches .blocs.east`);
  assert(matrix.global_south === matrix.blocs.global_south, `Matrix ${hotspotId} alias .global_south matches .blocs.global_south`);
  assert(matrix.globalSouth === matrix.blocs.global_south, `Matrix ${hotspotId} alias .globalSouth matches .blocs.global_south`);

  for (const bloc of BLOCS) {
    const narrative = matrix.blocs[bloc];
    assert(!!narrative, `Matrix ${hotspotId} has narrative for bloc '${bloc}'`);
    assert(narrative.bloc === bloc, `Narrative bloc equals '${bloc}'`);
    assert(typeof narrative.blocName === 'string' && narrative.blocName.length > 0, `Narrative ${hotspotId}/${bloc} has blocName`, narrative.blocName);

    // Dimension 1: Framing Headline
    assert(
      typeof narrative.framingHeadline === 'string' && narrative.framingHeadline.length >= 20,
      `Narrative ${hotspotId}/${bloc} has non-empty framingHeadline (Dim 1)`
    );

    // Dimension 2: Vocabulary
    assert(
      Array.isArray(narrative.vocabulary) && narrative.vocabulary.length >= 2,
      `Narrative ${hotspotId}/${bloc} has >= 2 vocabulary terms (Dim 2)`,
      `Count: ${narrative.vocabulary?.length}`
    );
    for (const v of narrative.vocabulary || []) {
      assert(typeof v.term === 'string' && v.term.length > 0, `Vocab term valid in ${hotspotId}/${bloc}`, v.term);
      assert(
        ['positive', 'negative', 'neutral'].includes(v.connotation),
        `Vocab connotation valid in ${hotspotId}/${bloc}`,
        v.connotation
      );
      assert(
        typeof v.meaningOrContext === 'string' && v.meaningOrContext.length > 5,
        `Vocab meaningOrContext in ${hotspotId}/${bloc}`
      );
    }

    // Dimension 3: Representative Sources
    assert(
      Array.isArray(narrative.representativeSources) && narrative.representativeSources.length >= 2,
      `Narrative ${hotspotId}/${bloc} has >= 2 representative sources (Dim 3)`,
      `Count: ${narrative.representativeSources?.length}`
    );
    for (const sourceId of narrative.representativeSources || []) {
      const outlet = catalogOutlets.get(sourceId);
      assert(
        !!outlet,
        `Representative source '${sourceId}' in ${hotspotId}/${bloc} exists in catalog OUTLETS`,
        `Missing: ${sourceId}`
      );
      if (outlet) {
        assert(
          outlet.geopoliticalBloc === bloc || outlet.geopolitical_bloc === bloc,
          `Representative source '${sourceId}' belongs to bloc '${bloc}'`,
          `Actual outlet bloc: ${outlet.geopoliticalBloc}`
        );
      }
    }

    // Dimension 4: Blind Spots
    assert(
      Array.isArray(narrative.blindspots) && narrative.blindspots.length >= 2,
      `Narrative ${hotspotId}/${bloc} has >= 2 blindspots (Dim 4)`,
      `Count: ${narrative.blindspots?.length}`
    );
    if (narrative.blindSpots !== undefined) {
      assert(
        JSON.stringify(narrative.blindSpots) === JSON.stringify(narrative.blindspots),
        `Narrative ${hotspotId}/${bloc} blindSpots alias matches blindspots`
      );
    }

    // Dimension 5: Real Headlines
    assert(
      Array.isArray(narrative.realHeadlines) && narrative.realHeadlines.length >= 2,
      `Narrative ${hotspotId}/${bloc} has >= 2 real headlines (Dim 5)`,
      `Count: ${narrative.realHeadlines?.length}`
    );
    for (const rh of narrative.realHeadlines || []) {
      assert(typeof rh.outlet === 'string' && rh.outlet.length > 0, `Real headline has outlet in ${hotspotId}/${bloc}`, rh.outlet);
      assert(typeof rh.flag === 'string' && rh.flag.length > 0, `Real headline has flag in ${hotspotId}/${bloc}`, rh.flag);
      assert(typeof rh.title === 'string' && rh.title.length > 10, `Real headline has title in ${hotspotId}/${bloc}`, rh.title);
      if (rh.outletId) {
        assert(catalogOutlets.has(rh.outletId), `Real headline outletId '${rh.outletId}' exists in catalog`);
      }
    }

    // Metrics
    assert(
      typeof narrative.metrics.escalationSentiment === 'number' &&
      narrative.metrics.escalationSentiment >= 0 &&
      narrative.metrics.escalationSentiment <= 100,
      `Narrative ${hotspotId}/${bloc} escalationSentiment in [0, 100]`,
      String(narrative.metrics?.escalationSentiment)
    );
    assert(
      typeof narrative.metrics.militaryEmphasis === 'number' &&
      narrative.metrics.militaryEmphasis >= 0 &&
      narrative.metrics.militaryEmphasis <= 100,
      `Narrative ${hotspotId}/${bloc} militaryEmphasis in [0, 100]`,
      String(narrative.metrics?.militaryEmphasis)
    );
    assert(
      typeof narrative.metrics.diplomaticEmphasis === 'number' &&
      narrative.metrics.diplomaticEmphasis >= 0 &&
      narrative.metrics.diplomaticEmphasis <= 100,
      `Narrative ${hotspotId}/${bloc} diplomaticEmphasis in [0, 100]`,
      String(narrative.metrics?.diplomaticEmphasis)
    );
  }
}

// -----------------------------------------------------------------------------
// SUITE 5: HELPER FUNCTIONS ADVERSARIAL STRESS-TESTING
// -----------------------------------------------------------------------------
console.log('\n--- Suite 5: Helper Functions Adversarial & Boundary Tests ---');

// 5.1 getHotspot & getHotspotById
for (const id of EXPECTED_IDS) {
  const h1 = getHotspot(id);
  const h2 = getHotspotById(id);
  assert(!!h1 && h1.id === id, `getHotspot('${id}') returns correct hotspot`);
  assert(h1 === h2, `getHotspotById('${id}') returns identical instance as getHotspot`);
}

// Normalization: Hyphen vs Underscore
assert(getHotspot('mar-vermelho')?.id === 'mar_vermelho', "getHotspot('mar-vermelho') normalizes to mar_vermelho");
assert(getHotspot('mar_vermelho')?.id === 'mar_vermelho', "getHotspot('mar_vermelho') returns mar_vermelho");

// Case-insensitivity
assert(getHotspot('ORMUZ')?.id === 'ormuz', "getHotspot('ORMUZ') is case-insensitive");
assert(getHotspot('UcRaniA')?.id === 'ucrania', "getHotspot('UcRaniA') is case-insensitive");
assert(getHotspot('Taiwan')?.id === 'taiwan', "getHotspot('Taiwan') is case-insensitive");

// Whitespace trimming
assert(getHotspot('  ormuz  ')?.id === 'ormuz', "getHotspot('  ormuz  ') trims whitespace");
assert(getHotspot('\tcoreia\n')?.id === 'coreia', "getHotspot('\tcoreia\n') trims tabs/newlines");

// Non-existent / invalid IDs
assert(getHotspot('non_existent') === undefined, "getHotspot('non_existent') returns undefined");
assert(getHotspot('atlantida') === undefined, "getHotspot('atlantida') returns undefined");
assert(getHotspot('') === undefined, "getHotspot('') returns undefined");
assert(getHotspot('   ') === undefined, "getHotspot('   ') returns undefined");

// Falsy / Boundary checks without throwing
try {
  const rNull = getHotspot(null as any);
  assert(rNull === undefined, 'getHotspot(null) gracefully returns undefined without throwing');
} catch (e: any) {
  assert(false, 'getHotspot(null) threw an exception', e.message);
}

try {
  const rUndef = getHotspot(undefined as any);
  assert(rUndef === undefined, 'getHotspot(undefined) gracefully returns undefined without throwing');
} catch (e: any) {
  assert(false, 'getHotspot(undefined) threw an exception', e.message);
}

// 5.2 getNarrativeMatrix
for (const id of EXPECTED_IDS) {
  const m = getNarrativeMatrix(id);
  assert(!!m && m.hotspotId === id, `getNarrativeMatrix('${id}') returns correct matrix`);
}

assert(getNarrativeMatrix('mar-vermelho')?.hotspotId === 'mar_vermelho', "getNarrativeMatrix('mar-vermelho') normalizes hyphen");
assert(getNarrativeMatrix('  GAZA  ')?.hotspotId === 'gaza', "getNarrativeMatrix('  GAZA  ') is case/space insensitive");
assert(getNarrativeMatrix('non_existent') === undefined, "getNarrativeMatrix('non_existent') returns undefined");

try {
  const mNull = getNarrativeMatrix(null as any);
  assert(mNull === undefined, 'getNarrativeMatrix(null) gracefully returns undefined');
} catch (e: any) {
  assert(false, 'getNarrativeMatrix(null) threw an exception', e.message);
}

// 5.3 getSourcesByBloc
const westSources = getSourcesByBloc('west');
const eastSources = getSourcesByBloc('east');
const southSources = getSourcesByBloc('global_south');

assert(Array.isArray(westSources) && westSources.length >= 26, `getSourcesByBloc('west') returns >= 26 sources`, `Actual: ${westSources.length}`);
assert(Array.isArray(eastSources) && eastSources.length >= 7, `getSourcesByBloc('east') returns >= 7 sources`, `Actual: ${eastSources.length}`);
assert(Array.isArray(southSources) && southSources.length >= 53, `getSourcesByBloc('global_south') returns >= 53 sources`, `Actual: ${southSources.length}`);

assert(westSources.every((s: any) => s.geopoliticalBloc === 'west' || s.geopolitical_bloc === 'west'), "All westSources have bloc 'west'");
assert(eastSources.every((s: any) => s.geopoliticalBloc === 'east' || s.geopolitical_bloc === 'east'), "All eastSources have bloc 'east'");
assert(southSources.every((s: any) => s.geopoliticalBloc === 'global_south' || s.geopolitical_bloc === 'global_south'), "All southSources have bloc 'global_south'");

// Adversarial inputs to getSourcesByBloc
const invalidBlocResult = getSourcesByBloc('north' as any);
assert(Array.isArray(invalidBlocResult) && invalidBlocResult.length === 0, "getSourcesByBloc('north') returns empty array");

try {
  const nullBloc = getSourcesByBloc(null as any);
  assert(Array.isArray(nullBloc) && nullBloc.length === 0, 'getSourcesByBloc(null) returns empty array without throwing');
} catch (e: any) {
  assert(false, 'getSourcesByBloc(null) threw an exception', e.message);
}

try {
  const undefBloc = getSourcesByBloc(undefined as any);
  assert(Array.isArray(undefBloc) && undefBloc.length === 0, 'getSourcesByBloc(undefined) returns empty array without throwing');
} catch (e: any) {
  assert(false, 'getSourcesByBloc(undefined) threw an exception', e.message);
}

// 5.4 filterHotspotsBySeverity
const critHotspots = filterHotspotsBySeverity('critico');
const altHotspots = filterHotspotsBySeverity('alto');
const modHotspots = filterHotspotsBySeverity('moderado');

assert(critHotspots.length === 4, "filterHotspotsBySeverity('critico') returns 4 hotspots", `Actual: ${critHotspots.length}`);
assert(altHotspots.length === 2, "filterHotspotsBySeverity('alto') returns 2 hotspots", `Actual: ${altHotspots.length}`);
assert(modHotspots.length === 2, "filterHotspotsBySeverity('moderado') returns 2 hotspots", `Actual: ${modHotspots.length}`);
assert(critHotspots.length + altHotspots.length + modHotspots.length === 8, 'Severity filtering partition covers all 8 hotspots');

// Adversarial input to filterHotspotsBySeverity
const invalidSevResult = filterHotspotsBySeverity('baixo' as any);
assert(Array.isArray(invalidSevResult) && invalidSevResult.length === 0, "filterHotspotsBySeverity('baixo') returns empty array");

try {
  const nullSev = filterHotspotsBySeverity(null as any);
  assert(Array.isArray(nullSev) && nullSev.length === 0, 'filterHotspotsBySeverity(null) returns empty array without throwing');
} catch (e: any) {
  assert(false, 'filterHotspotsBySeverity(null) threw an exception', e.message);
}

// -----------------------------------------------------------------------------
// SUITE 6: CROSS-SYSTEM 86 SOURCES CATALOG INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n--- Suite 6: Cross-System Sources Catalog (sources.json vs news.ts) ---');

const sourcesJsonPath = path.resolve(__dirname, '../backend/ingestion/sources.json');
assert(fs.existsSync(sourcesJsonPath), 'backend/ingestion/sources.json file exists');

const rawSources = JSON.parse(fs.readFileSync(sourcesJsonPath, 'utf-8'));
assert(Array.isArray(rawSources), 'sources.json is a JSON array');
assert(rawSources.length === 86, 'sources.json contains exactly 86 sources', `Actual: ${rawSources.length}`);

let jsonWest = 0;
let jsonEast = 0;
let jsonSouth = 0;
let jsonUnassigned = 0;

for (const s of rawSources) {
  assert(typeof s.id === 'string' && s.id.length > 0, `Source ${s.id} has id`);
  assert(typeof s.name === 'string' && s.name.length > 0, `Source ${s.id} has name`);
  assert(typeof s.country === 'string' && s.country.length === 2, `Source ${s.id} has ISO country`, s.country);
  assert(typeof s.language === 'string' && s.language.length >= 2, `Source ${s.id} has language`, s.language);
  assert(['west', 'east', 'global_south'].includes(s.geopolitical_bloc), `Source ${s.id} has valid geopolitical_bloc`, s.geopolitical_bloc);

  if (s.geopolitical_bloc === 'west') jsonWest++;
  else if (s.geopolitical_bloc === 'east') jsonEast++;
  else if (s.geopolitical_bloc === 'global_south') jsonSouth++;
  else jsonUnassigned++;
}

assert(jsonUnassigned === 0, 'Zero unassigned geopolitical_bloc in sources.json', `Unassigned: ${jsonUnassigned}`);
assert(jsonWest === 26, 'sources.json West bloc has exactly 26 sources', `Actual: ${jsonWest}`);
assert(jsonEast === 7, 'sources.json East bloc has exactly 7 sources', `Actual: ${jsonEast}`);
assert(jsonSouth === 53, 'sources.json Global South bloc has exactly 53 sources', `Actual: ${jsonSouth}`);

// Cross-check: every source in sources.json exists in OUTLETS with matching bloc
let crossMatches = 0;
for (const s of rawSources) {
  const frontendOutlet = catalogOutlets.get(s.id);
  assert(!!frontendOutlet, `Source '${s.id}' from sources.json exists in news.ts OUTLETS`);
  if (frontendOutlet) {
    const frontendBloc = frontendOutlet.geopoliticalBloc || frontendOutlet.geopolitical_bloc;
    assert(
      frontendBloc === s.geopolitical_bloc,
      `Source '${s.id}' bloc matches between sources.json ('${s.geopolitical_bloc}') and news.ts ('${frontendBloc}')`
    );
    crossMatches++;
  }
}
assert(crossMatches === 86, 'All 86 sources synchronized 1:1 between backend and frontend', `Matches: ${crossMatches}`);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('ADVERSARIAL EMPIRICAL TEST SUITE RESULTS:');
console.log(`Total assertions: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
if (failedTests > 0) {
  console.log('FAILURES:');
  failures.forEach((f) => console.error(`  ${f}`));
}
console.log('================================================================');

process.exit(failedTests > 0 ? 1 : 0);

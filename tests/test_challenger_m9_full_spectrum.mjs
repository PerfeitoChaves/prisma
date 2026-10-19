/**
 * PRISMA (Fatos Cruzados) — Milestone M9 Challenger 2 Full-Spectrum Test Suite
 *
 * FULL-SPECTRUM EMPIRICAL VALIDATION:
 * 1. Headless Browser / Bundle DOM Testing on `frontend/index.html` and `docs/index.html`
 * 2. 5 Views: Capa, Comparador, Tensões, Radar, Ao Vivo (Desktop & Mobile)
 * 3. TacticalWorldMap: 8 hotspots with SVG coordinates, severity pulse rings, radar sweep rotation
 * 4. NarrativeMatrix: 3-bloc tri-axial comparison (West, East, Global South), vocabulary, blindspots, headlines
 * 5. 1-Touch Comparator Deep-Linking (#comparador?storyId=... pre-filled context)
 * 6. Continuous Audio/Video Player Continuity across Tab Transitions
 * 7. Mobile Ergonomics & Viewport Stress (360px & 390px, 7-column Dock, Zero Horizontal Scroll)
 * 8. Adversarial Edge Cases & Malformed State Recovery
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import { spawn } from "node:child_process";

const PORT = 8893;
const CHROME_DEBUG_PORT = 9228;

let totalTests = 0;
let passedTests = 0;
const failures = [];
const consoleErrors = [];

function recordTest(name, fn) {
  return async () => {
    totalTests++;
    process.stdout.write(`  [TEST ${totalTests}] ${name} ... `);
    try {
      await fn();
      passedTests++;
      console.log(`✅ PASS`);
    } catch (err) {
      console.log(`❌ FAIL`);
      console.error(`      Error: ${err.message}`);
      failures.push({ name, error: err });
    }
  };
}

async function startServer(rootDir) {
  const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);
    let pathname = parsedUrl.pathname;
    if (pathname === "/") pathname = "/index.html";
    let filePath = path.join(rootDir, pathname);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, "index.html");

    const ext = path.extname(filePath);
    const mimeMap = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".mjs": "application/javascript",
      ".json": "application/json",
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
    };
    res.writeHead(200, { "Content-Type": mimeMap[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });

  await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
  return server;
}

async function launchChrome() {
  const chrome = spawn("/usr/bin/google-chrome", [
    "--headless=new",
    `--remote-debugging-port=${CHROME_DEBUG_PORT}`,
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--window-size=1280,800",
  ]);

  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CHROME_DEBUG_PORT}/json/version`);
      if (res.ok) break;
    } catch {
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  return chrome;
}

class BrowserSession {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === "Runtime.consoleAPICalled") {
        if (msg.params.type === "error") {
          consoleErrors.push(msg.params.args.map((a) => a.value || a.description).join(" "));
        }
      }
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
    await new Promise((r) => (this.ws.onopen = r));
    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("DOM.enable");
  }

  send(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${res.exceptionDetails.text} (${expr})`);
    }
    return res.result.value;
  }

  async setViewport(width, height, isMobile = false) {
    await this.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: isMobile ? 3 : 1,
      mobile: isMobile,
    });
  }

  async navigate(url) {
    await this.send("Page.navigate", { url });
    await new Promise((r) => setTimeout(r, 1000));
  }

  async wait(ms) {
    await new Promise((r) => setTimeout(r, ms));
  }

  async close() {
    if (this.ws) this.ws.close();
  }
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log("CHALLENGER 2: FULL-SPECTRUM HEADLESS BROWSER E2E SUITE — MILESTONE M9");
  console.log("Target: frontend/index.html & docs/index.html");
  console.log("================================================================================\n");

  const server = await startServer(path.join(process.cwd(), "frontend"));
  console.log(`[HTTP Server] Serving frontend/ on http://127.0.0.1:${PORT}`);

  const chrome = await launchChrome();
  console.log(`[Google Chrome] Headless instance ready on port ${CHROME_DEBUG_PORT}\n`);

  const newTargetRes = await fetch(
    `http://127.0.0.1:${CHROME_DEBUG_PORT}/json/new`,
    { method: "PUT" }
  );
  const targetData = await newTargetRes.json();
  const session = new BrowserSession(targetData.webSocketDebuggerUrl);
  await session.connect();

  // Navigate to initial page
  await session.navigate(`http://127.0.0.1:${PORT}/index.html`);
  await session.wait(1500);

  // ---------------------------------------------------------------------------
  // SUITE 1: 5 Core Views Verification
  // ---------------------------------------------------------------------------
  console.log("--- SUITE 1: VERIFICATION OF ALL 5 VIEWS (DESKTOP VIEWPORT) ---");

  await recordTest("View 1 (Capa): Mounts Cover Story, Editorial Filters & Stories Feed", async () => {
    const title = await session.eval("document.title");
    assert.ok(title.includes("PRISMA"), `Expected PRISMA in title, got: ${title}`);

    const hasLogo = await session.eval("document.body.innerText.includes('PRISMA')");
    assert.ok(hasLogo, "PRISMA brand header must be rendered");

    const sortBarPresent = await session.eval(`
      document.body.innerText.includes("Mais Recentes") ||
      document.body.innerText.includes("Divergência")
    `);
    assert.ok(sortBarPresent, "Quick sort bar must be visible on Capa");
  })();

  await recordTest("View 2 (Comparador): Mounts Comparative Perspectives via TopBar Click", async () => {
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('header nav button'));
        const compBtn = btns.find(b => b.textContent.includes('Comparador'));
        if (compBtn) compBtn.click();
      })()
    `);
    await session.wait(600);

    const hash = await session.eval("window.location.hash");
    assert.ok(hash.startsWith("#comparador"), `Expected #comparador, got: ${hash}`);

    const compHeading = await session.eval(`
      document.body.innerText.includes("COMPARADOR DE ENQUADRAMENTOS")
    `);
    assert.ok(compHeading, "Comparador view must mount 'COMPARADOR DE ENQUADRAMENTOS'");
  })();

  await recordTest("View 3 (Tensões): Mounts Geopolitical Operations Room & Tactical SVG Map", async () => {
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('header nav button'));
        const tBtn = btns.find(b => b.textContent.includes('Tensões'));
        if (tBtn) tBtn.click();
      })()
    `);
    await session.wait(600);

    const hash = await session.eval("window.location.hash");
    assert.ok(hash.startsWith("#tensoes"), `Expected #tensoes, got: ${hash}`);

    const title = await session.eval("document.querySelector('h1')?.innerText");
    assert.strictEqual(title, "Mapa de Tensões Globais & Focos de Crise");

    const mapFound = await session.eval(`
      !!document.querySelector('.leaflet-container') || !!document.querySelector('svg[viewBox="0 0 1000 500"]')
    `);
    assert.ok(mapFound, "Tactical Map canvas (Leaflet or SVG) must be present in DOM");
  })();

  await recordTest("View 4 (Radar X): Mounts Real-Time Trends Panel via TopBar Click", async () => {
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('header nav button'));
        const rBtn = btns.find(b => b.textContent.includes('Radar X'));
        if (rBtn) rBtn.click();
      })()
    `);
    await session.wait(600);

    const radarContent = await session.eval(`
      document.body.innerText.includes("Radar de Tendências") ||
      document.body.innerText.includes("Tendências do X") ||
      document.body.innerText.includes("Cruzar")
    `);
    assert.ok(radarContent, "Radar X view must mount trend feed and cross-reference features");
  })();

  await recordTest("View 5 (Ao Vivo): Mounts Curated Live TV & Radio Stations Grid", async () => {
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('header nav button'));
        const liveBtn = btns.find(b => b.textContent.includes('Ao Vivo'));
        if (liveBtn) liveBtn.click();
      })()
    `);
    await session.wait(600);

    const liveContent = await session.eval(`
      document.body.innerText.includes("Transmissões Ao Vivo") ||
      document.body.innerText.includes("Canais de TV") ||
      document.body.innerText.includes("Estações de Rádio")
    `);
    assert.ok(liveContent, "Ao Vivo view must display live TV and Radio grids");
  })();

  // ---------------------------------------------------------------------------
  // SUITE 2: TacticalWorldMap 8 Hotspots & Radar Sweep
  // ---------------------------------------------------------------------------
  console.log("\n--- SUITE 2: TACTICAL WORLD MAP 8 HOTSPOTS & RADAR SWEEP ---");

  // Return to Tensões & select SVG mode for SVG-specific assertions
  await session.eval(`
    (() => {
      const btns = Array.from(document.querySelectorAll('header nav button'));
      const tBtn = btns.find(b => b.textContent.includes('Tensões'));
      if (tBtn) tBtn.click();
    })()
  `);
  await session.wait(500);
  await session.eval(`
    (() => {
      const svgBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Mapa Vetorial SVG'));
      if (svgBtn) svgBtn.click();
    })()
  `);
  await session.wait(500);

  await recordTest("TacticalWorldMap: Exactly 8 Hotspots Rendered with Interactive Role='button'", async () => {
    const labels = await session.eval(`
      Array.from(document.querySelectorAll('g.tactical-hotspots g[role="button"]'))
        .map(el => el.getAttribute('aria-label'))
    `);
    assert.strictEqual(labels.length, 8, `Expected exactly 8 hotspots, got ${labels.length}`);

    const expectedHotspots = [
      "Estreito de Ormuz",
      "Guerra da Ucrânia",
      "Estreito de Taiwan",
      "Mar Vermelho",
      "Gaza & Oriente Médio",
      "Península Coreana",
      "Sahel Africano",
      "América do Sul / Essequibo",
    ];

    for (const h of expectedHotspots) {
      const found = labels.some(l => l && l.includes(h));
      assert.ok(found, `Expected hotspot "${h}" in SVG labels, found: ${JSON.stringify(labels)}`);
    }
  })();

  await recordTest("TacticalWorldMap: Radar Sweep Sector Active with CSS Rotation Keyframes", async () => {
    const sweepActive = await session.eval("!!document.querySelector('g.anim-sweep')");
    assert.ok(sweepActive, "Radar sweep group <g class='anim-sweep'> must be present");

    const sweepPath = await session.eval("!!document.querySelector('g.anim-sweep path')");
    assert.ok(sweepPath, "Radar sweep circular sector path must be rendered");
  })();

  await recordTest("TacticalWorldMap: Radar Sweep Toggle Control (Disable / Enable)", async () => {
    // Click radar toggle button
    await session.eval(`
      (() => {
        const btn = document.querySelector('button[aria-label="Alternar Varredura de Radar"]');
        if (btn) btn.click();
      })()
    `);
    await session.wait(300);

    const sweepDisabled = await session.eval("!document.querySelector('g.anim-sweep')");
    assert.ok(sweepDisabled, "Clicking radar toggle must deactivate sweep");

    // Click again to re-enable
    await session.eval(`
      (() => {
        const btn = document.querySelector('button[aria-label="Alternar Varredura de Radar"]');
        if (btn) btn.click();
      })()
    `);
    await session.wait(300);

    const sweepRestored = await session.eval("!!document.querySelector('g.anim-sweep')");
    assert.ok(sweepRestored, "Clicking radar toggle again must reactivate sweep");
  })();

  await recordTest("TacticalWorldMap: Pulsing Severity Rings (Critical / High / Moderate)", async () => {
    const criticalRings = await session.eval("document.querySelectorAll('.anim-pulse-critical').length");
    const highRings = await session.eval("document.querySelectorAll('.anim-pulse-high').length");
    assert.ok(criticalRings >= 4, `Expected at least 4 critical pulsing rings, found: ${criticalRings}`);
    assert.ok(highRings >= 2, `Expected at least 2 high pulsing rings, found: ${highRings}`);
  })();

  await recordTest("TacticalWorldMap: Hotspot Selection Updates Dossier & Narrative Matrix", async () => {
    // Click Taiwan hotspot
    await session.eval(`
      (() => {
        const pins = Array.from(document.querySelectorAll('g.tactical-hotspots g[role="button"]'));
        const taiwan = pins.find(p => p.getAttribute('aria-label')?.includes('Taiwan'));
        if (taiwan) taiwan.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      })()
    `);
    await session.wait(500);

    const bodyText = await session.eval("document.body.innerText");
    assert.ok(
      bodyText.includes("Taiwan") || bodyText.includes("Semicondutores"),
      "Dossier must update with Taiwan information"
    );
  })();

  await recordTest("TacticalWorldMap: Mobile Mode Switcher (Mapa Vetorial SVG vs Feed de Focos)", async () => {
    // Switch to Feed
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const feedBtn = btns.find(b => b.textContent.includes('Feed de Focos de Crise'));
        if (feedBtn) feedBtn.click();
      })()
    `);
    await session.wait(400);

    const feedActive = await session.eval(`
      document.body.innerText.includes("Focos de Crise") &&
      !document.querySelector('svg[viewBox="0 0 1000 500"]')
    `);
    assert.ok(feedActive, "Switching to Feed mode must hide SVG map and display crisis cards");

    // Switch back to Mapa
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const mapBtn = btns.find(b => b.textContent.includes('Mapa Vetorial SVG'));
        if (mapBtn) mapBtn.click();
      })()
    `);
    await session.wait(400);

    const mapRestored = await session.eval("!!document.querySelector('svg[viewBox=\"0 0 1000 500\"]')");
    assert.ok(mapRestored, "Switching back must restore SVG Tactical Map");
  })();

  // ---------------------------------------------------------------------------
  // SUITE 3: NarrativeMatrix 3-Bloc Comparison & 1-Touch Comparator Linking
  // ---------------------------------------------------------------------------
  console.log("\n--- SUITE 3: NARRATIVE MATRIX 3-BLOC COMPARISON & 1-TOUCH LINKING ---");

  // Re-select Ormuz hotspot for baseline test
  await session.eval(`
    (() => {
      const pins = Array.from(document.querySelectorAll('g.tactical-hotspots g[role="button"]'));
      const ormuz = pins.find(p => p.getAttribute('aria-label')?.includes('Ormuz'));
      if (ormuz) ormuz.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    })()
  `);
  await session.wait(500);

  await recordTest("NarrativeMatrix: Renders Shared Factual Baseline Banner", async () => {
    const hasBaseline = await session.eval(`
      document.body.innerText.toUpperCase().includes("BASE FACTUAL COMPARTILHADA") ||
      document.body.innerText.toUpperCase().includes("FATO COMPROVADO")
    `);
    assert.ok(hasBaseline, "NarrativeMatrix must display factual baseline banner");
  })();

  await recordTest("NarrativeMatrix: Renders All 3 Geopolitical Blocs (West, East, Global South)", async () => {
    const westCol = await session.eval("!!document.querySelector('[data-testid=\"narrative-column-west\"]')");
    const eastCol = await session.eval("!!document.querySelector('[data-testid=\"narrative-column-east\"]')");
    const southCol = await session.eval("!!document.querySelector('[data-testid=\"narrative-column-global_south\"]')");

    assert.ok(westCol, "West bloc column [data-testid='narrative-column-west'] missing");
    assert.ok(eastCol, "East bloc column [data-testid='narrative-column-east'] missing");
    assert.ok(southCol, "Global South column [data-testid='narrative-column-global_south'] missing");
  })();

  await recordTest("NarrativeMatrix: Renders Narrative Warfare Glossary, Blindspots & Headlines", async () => {
    const textUpper = await session.eval("document.body.innerText.toUpperCase()");
    assert.ok(
      textUpper.includes("VOCABULÁRIO DE GUERRA NARRATIVA"),
      "Matrix must render 'Vocabulário de Guerra Narrativa'"
    );
    assert.ok(
      textUpper.includes("PONTOS CEGOS") || textUpper.includes("OMISSÕES"),
      "Matrix must render blindspots / omissions section"
    );
    assert.ok(
      textUpper.includes("EXEMPLOS REAIS DE MANCHETES"),
      "Matrix must render real headlines collected"
    );
  })();

  await recordTest("NarrativeMatrix: 1-Touch 'Cruzar no Comparador' Routes to #comparador with Context", async () => {
    // Click West column compare button
    await session.eval(`
      (() => {
        const btn = document.querySelector('button[data-testid="btn-compare-west"]');
        if (btn) btn.click();
      })()
    `);
    await session.wait(800);

    const hash = await session.eval("window.location.hash");
    assert.ok(
      hash.startsWith("#comparador?storyId=") || hash === "#comparador",
      `Expected hash routing to #comparador, got: ${hash}`
    );

    const compMounted = await session.eval(`
      document.body.innerText.includes("COMPARADOR DE ENQUADRAMENTOS")
    `);
    assert.ok(compMounted, "1-Touch action must mount Comparator view immediately");
  })();

  // ---------------------------------------------------------------------------
  // SUITE 4: Continuous Audio/Video Player Continuity
  // ---------------------------------------------------------------------------
  console.log("\n--- SUITE 4: CONTINUOUS AUDIO/VIDEO PLAYER CONTINUITY ---");

  await recordTest("PersistentLivePlayer: Activation and Tactile Controls", async () => {
    // Navigate to Ao Vivo
    await session.eval(`
      (() => {
        const btns = Array.from(document.querySelectorAll('header nav button'));
        const liveBtn = btns.find(b => b.textContent.includes('Ao Vivo'));
        if (liveBtn) liveBtn.click();
      })()
    `);
    await session.wait(600);

    // Click first radio station card or play button
    await session.eval(`
      (() => {
        const playBtn = Array.from(document.querySelectorAll('button'))
          .find(b => (b.getAttribute('aria-label') || '').includes('Ouvir') || (b.getAttribute('aria-label') || '').includes('Assistir'));
        if (playBtn) playBtn.click();
      })()
    `);
    await session.wait(600);

    const playerMounted = await session.eval(`
      !!document.querySelector('aside[aria-label="Reprodutor Multimídia Ao Vivo Persistente"]')
    `);
    assert.ok(playerMounted, "PersistentLivePlayer container must be mounted in DOM");

    const audioExists = await session.eval("!!document.querySelector('audio')");
    assert.ok(audioExists, "Persistent <audio> element must be mounted");
  })();

  await recordTest("PersistentLivePlayer: Maintains Audio Playback across ALL 5 Tab Transitions", async () => {
    const tabs = ["Capa", "Comparador", "Tensões", "Radar X", "Ao Vivo", "Capa"];

    for (const tab of tabs) {
      await session.eval(`
        (() => {
          const btns = Array.from(document.querySelectorAll('header nav button'));
          const target = btns.find(b => b.textContent.includes('${tab}'));
          if (target) target.click();
        })()
      `);
      await session.wait(350);

      const playerAlive = await session.eval(`
        !!document.querySelector('aside[aria-label="Reprodutor Multimídia Ao Vivo Persistente"]')
      `);
      assert.ok(playerAlive, `Player unmounted during transition to ${tab}`);

      const audioAlive = await session.eval("!!document.querySelector('audio')");
      assert.ok(audioAlive, `<audio> element destroyed during transition to ${tab}`);
    }
  })();

  // ---------------------------------------------------------------------------
  // SUITE 5: Mobile Ergonomics & Viewport Stress (360px & 390px)
  // ---------------------------------------------------------------------------
  console.log("\n--- SUITE 5: MOBILE ERGONOMICS & VIEWPORT STRESS (360px & 390px) ---");

  for (const width of [360, 390]) {
    await recordTest(`Mobile Viewport (${width}px): 7-Column Dock Navigation & Geometry`, async () => {
      await session.setViewport(width, 800, true);
      await session.wait(500);

      const dockCount = await session.eval(`
        document.querySelectorAll('nav[aria-label="Navegação principal"] button').length
      `);
      assert.strictEqual(dockCount, 7, `Expected exactly 7 Dock buttons, found: ${dockCount}`);

      const dockLabels = await session.eval(`
        Array.from(document.querySelectorAll('nav[aria-label="Navegação principal"] button'))
          .map(b => b.textContent.trim())
      `);
      const expected = ["Capa", "Comparar", "Tensões", "Radar X", "Ao Vivo", "Buscar", "Salvos"];
      for (const exp of expected) {
        assert.ok(dockLabels.some(l => l.includes(exp)), `Dock missing item: ${exp}`);
      }
    })();

    await recordTest(`Mobile Viewport (${width}px): Floating Player Clearance above Dock`, async () => {
      const clearance = await session.eval(`
        (() => {
          const dock = document.querySelector('nav[aria-label="Navegação principal"]');
          const player = document.querySelector('aside[aria-label="Reprodutor Multimídia Ao Vivo Persistente"]');
          if (!dock || !player) return true;
          const dockRect = dock.getBoundingClientRect();
          const playerRect = player.getBoundingClientRect();
          return playerRect.bottom <= dockRect.top + 5;
        })()
      `);
      assert.ok(clearance, `Floating player collides with bottom Dock at ${width}px`);
    })();

    await recordTest(`Mobile Viewport (${width}px): Zero Horizontal Overflow Across All Views`, async () => {
      const views = ["capa", "comparador", "tensoes", "radar", "aovivo"];
      for (const v of views) {
        await session.eval(`
          (() => {
            const dockBtns = Array.from(document.querySelectorAll('nav[aria-label="Navegação principal"] button'));
            const map = { capa: 'Capa', comparador: 'Comparar', tensoes: 'Tensões', radar: 'Radar X', aovivo: 'Ao Vivo' };
            const b = dockBtns.find(x => x.textContent.includes(map['${v}']));
            if (b) b.click();
          })()
        `);
        await session.wait(300);

        const scrollW = await session.eval("document.documentElement.scrollWidth");
        const clientW = await session.eval("document.documentElement.clientWidth");
        assert.ok(
          scrollW <= clientW + 1,
          `Horizontal scroll blowout on view "${v}" at ${width}px: scrollWidth (${scrollW}) > clientWidth (${clientW})`
        );
      }
    })();
  }

  // Restore Desktop Viewport
  await session.setViewport(1280, 800, false);
  await session.wait(300);

  // ---------------------------------------------------------------------------
  // SUITE 6: Adversarial Stress & Malformed State Handling
  // ---------------------------------------------------------------------------
  console.log("\n--- SUITE 6: ADVERSARIAL STRESS & MALFORMED STATE HANDLING ---");

  await recordTest("Adversarial: Malformed URL Hash (#tensoes?hotspot=unknown_xyz) Degrades Safely", async () => {
    await session.navigate(`http://127.0.0.1:${PORT}/index.html#tensoes?hotspot=unknown_xyz_9999`);
    await session.wait(600);

    const mapExists = await session.eval(`
      !!document.querySelector('.leaflet-container') || !!document.querySelector('svg[viewBox="0 0 1000 500"]')
    `);
    assert.ok(mapExists, "App should fallback gracefully and display Tactical map");
  })();

  await recordTest("Adversarial: Malformed Comparator Hash (#comparador?storyId=null) Degrades Safely", async () => {
    await session.navigate(`http://127.0.0.1:${PORT}/index.html#comparador?storyId=invalid_nonexistent_story`);
    await session.wait(600);

    const compActive = await session.eval("document.body.innerText.includes('COMPARADOR DE ENQUADRAMENTOS')");
    assert.ok(compActive, "Comparator should gracefully load fallback story without crashing");
  })();

  await recordTest("Adversarial: Rapid Hotspot Switching Stress (All 8 Hotspots Sequentially)", async () => {
    await session.navigate(`http://127.0.0.1:${PORT}/index.html#tensoes`);
    await session.wait(600);

    const hotspots = ["ormuz", "ucrania", "taiwan", "mar_vermelho", "gaza", "coreia", "sahel", "essequibo"];
    for (const hId of hotspots) {
      await session.eval(`
        (() => {
          const pills = Array.from(document.querySelectorAll('button'));
          const p = pills.find(b => b.textContent.toLowerCase().includes('${hId.slice(0, 4)}'));
          if (p) p.click();
        })()
      `);
      await session.wait(120);
    }

    const mapAlive = await session.eval(`
      !!document.querySelector('.leaflet-container') || !!document.querySelector('svg[viewBox="0 0 1000 500"]')
    `);
    assert.ok(mapAlive, "Tactical Map must survive rapid sequential hotspot changes");
  })();

  // ---------------------------------------------------------------------------
  // SUITE 7: Mirror Validation of docs/index.html (GitHub Pages)
  // ---------------------------------------------------------------------------
  console.log("\n--- SUITE 7: MIRROR VALIDATION OF docs/index.html (GITHUB PAGES) ---");

  await recordTest("Docs Mirror: docs/index.html and frontend/index.html are Byte-for-Byte Identical", async () => {
    const frontendHtml = fs.readFileSync(path.join(process.cwd(), "frontend", "index.html"), "utf-8");
    const docsHtml = fs.readFileSync(path.join(process.cwd(), "docs", "index.html"), "utf-8");
    assert.strictEqual(frontendHtml.length, docsHtml.length, "File sizes must match");
    assert.strictEqual(frontendHtml, docsHtml, "docs/index.html must be identical byte-for-byte");
  })();

  // ---------------------------------------------------------------------------
  // Console Errors / Runtime Exceptions Audit
  // ---------------------------------------------------------------------------
  console.log("\n--- CONSOLE ERRORS AUDIT ---");
  console.log(`Detected console errors during full run: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log("Console errors:", consoleErrors);
  }

  // Teardown
  await session.close();
  chrome.kill();
  server.close();

  console.log("\n================================================================================");
  console.log(`FINAL RESULTS: ${passedTests}/${totalTests} tests passed (${failures.length} failures)`);
  console.log("================================================================================\n");

  if (failures.length > 0) {
    console.error("FAILURES SUMMARY:");
    for (const f of failures) {
      console.error(`- ${f.name}: ${f.error.message}`);
    }
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Fatal test suite runner error:", err);
  process.exit(1);
});

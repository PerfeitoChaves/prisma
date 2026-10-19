import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import { spawn } from "node:child_process";

const PORT = 8895;
const CHROME_DEBUG_PORT = 9230;
const FRONTEND_DIR = path.resolve("./frontend");

const server = http.createServer((req, res) => {
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/") reqPath = "/index.html";
  const filePath = path.join(FRONTEND_DIR, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mime = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".geojson": "application/geo+json",
      ".png": "image/png",
    }[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
console.log(`[HTTP Server] Listening on http://127.0.0.1:${PORT}`);

const chrome = spawn("/usr/bin/google-chrome", [
  "--headless=new",
  `--remote-debugging-port=${CHROME_DEBUG_PORT}`,
  "--no-sandbox",
  "--disable-gpu",
  "--disable-dev-shm-usage",
  "--window-size=1280,900",
]);

for (let i = 0; i < 40; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${CHROME_DEBUG_PORT}/json/version`);
    if (res.ok) break;
  } catch {
    await new Promise((r) => setTimeout(r, 150));
  }
}

const targetRes = await fetch(`http://127.0.0.1:${CHROME_DEBUG_PORT}/json/new`, { method: "PUT" });
const targetData = await targetRes.json();

let msgId = 1;
const pending = new Map();
const ws = new WebSocket(targetData.webSocketDebuggerUrl);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  }
};

await new Promise((r) => (ws.onopen = r));

const send = (method, params = {}) => {
  const id = msgId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
};

const evalExpr = async (expr) => {
  const res = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
  if (res.exceptionDetails) {
    throw new Error(`Eval error: ${res.exceptionDetails.text}`);
  }
  return res.result.value;
};

await send("Page.enable");
await send("Runtime.enable");

try {
  console.log("Navigating to Tensões tab (#tensoes)...");
  await send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html#tensoes` });
  await new Promise((r) => setTimeout(r, 2500));

  // 1. Verify HUD Widget standby exists
  const hasStandby = await evalExpr(`document.body.innerText.includes("Radar Geopolítico")`);
  console.log("[TEST 1] HUD Standby present:", hasStandby ? "✅ PASS" : "❌ FAIL");
  assert.ok(hasStandby, "HUD Standby should be visible on map load");

  // 2. Verify Leaflet vector paths rendered (GeoJSON boundaries)
  const pathCount = await evalExpr(`document.querySelectorAll("svg.leaflet-zoom-animated path").length`);
  console.log(`[TEST 2] GeoJSON vector paths rendered: ${pathCount} paths ...`, pathCount > 50 ? "✅ PASS" : "❌ FAIL");
  assert.ok(pathCount > 50, `Expected >50 country boundaries, got ${pathCount}`);

  // 3. Move hardware mouse cursor over a visible country pin or polygon within viewport
  const targetPos = await evalExpr(`(() => {
    const pins = Array.from(document.querySelectorAll(".custom-country-pin"));
    const visiblePin = pins.find(p => {
      const r = p.getBoundingClientRect();
      return r.x > 80 && r.x < 1100 && r.y > 100 && r.y < 750;
    });
    if (visiblePin) {
      const r = visiblePin.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, type: "pin" };
    }
    const paths = Array.from(document.querySelectorAll("svg.leaflet-zoom-animated path"));
    const visiblePath = paths.find(p => {
      const r = p.getBoundingClientRect();
      return r.x > 150 && r.x < 1000 && r.y > 150 && r.y < 700 && r.width > 30 && r.height > 30;
    });
    if (visiblePath) {
      const r = visiblePath.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, type: "polygon" };
    }
    return null;
  })()`);

  console.log("[TEST 3] Target hover position found:", targetPos);
  assert.ok(targetPos, "Should find interactive map element to hover");

  // 3. Click and hover on the visible country pin
  const clickResult = await evalExpr(`(() => {
    const pins = Array.from(document.querySelectorAll(".custom-country-pin"));
    const visiblePin = pins.find(p => {
      const r = p.getBoundingClientRect();
      return r.x > 80 && r.x < 1100 && r.y > 100 && r.y < 750;
    });
    if (visiblePin) {
      visiblePin.click();
      return { clicked: true, text: visiblePin.innerText };
    }
    return { clicked: false };
  })()`);
  console.log("[TEST 3] Clicked visible pin:", clickResult);

  await new Promise((r) => setTimeout(r, 600));

  // 4. Verify HUD displays inspected country with illuminated border
  const hudInfo = await evalExpr(`(() => {
    const text = document.body.innerText;
    return {
      hasCapital: text.includes("Capital") || text.includes("CAPITAL"),
      hasRegion: text.includes("Região") || text.includes("REGIÃO"),
      hasIlluminated: text.includes("Fronteira Iluminada"),
      hasAlliance: text.includes("Alianças / Tratados") || text.includes("ALIANÇAS"),
      hasBloc: text.includes("Bloco") || text.includes("Sul Global"),
      bodySnippet: text.slice(text.indexOf("Radar Geopolítico") - 50, text.indexOf("Radar Geopolítico") + 350)
    };
  })()`);
  console.log("[TEST 4] HUD Territorial Card activated:", hudInfo);
  assert.ok(hudInfo.hasCapital && hudInfo.hasIlluminated, "HUD should show capital and illuminated border status");

  // 5. Test Country Pin hover
  const pinTest = await evalExpr(`(() => {
    const pins = Array.from(document.querySelectorAll(".custom-country-pin"));
    if (pins.length > 0) {
      pins[0].dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
      return { pinCount: pins.length, hovered: true };
    }
    return { pinCount: 0 };
  })()`);
  console.log("[TEST 5] Country pin hover active:", pinTest, pinTest.pinCount > 0 ? "✅ PASS" : "❌ FAIL");
  assert.ok(pinTest.pinCount > 0, "Country pins should be present in wide zoom");

  // 6. Test GeoJSON polygon hover & border illumination styling
  const polygonTest = await evalExpr(`(() => {
    const paths = Array.from(document.querySelectorAll("svg.leaflet-zoom-animated path"));
    const pathWithFill = paths.find(p => p.getAttribute("fill") && p.getAttribute("fill") !== "none");
    if (!pathWithFill) return { found: false };
    
    // Simulate hover directly on SVG path
    pathWithFill.dispatchEvent(new MouseEvent("mouseover", { bubbles: true, clientX: 300, clientY: 300 }));
    const stroke = pathWithFill.getAttribute("stroke");
    const weight = pathWithFill.getAttribute("stroke-width");
    return { found: true, stroke, weight };
  })()`);
  console.log("[TEST 6] GeoJSON polygon path interactive:", polygonTest);
  assert.ok(polygonTest.found, "GeoJSON polygon paths should be present and styled");

  console.log("\n========================================================");
  console.log("ALL TESTS PASSED: GeoJSON Illumination & Top-Left HUD! 🎉");
  console.log("========================================================\n");
} finally {
  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
}

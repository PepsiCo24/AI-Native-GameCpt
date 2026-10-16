// UA-0011 — Entry-4 capture driver (L12–L15 block, ADR-design-0003 §8 item 6).
// Replicates the Entry-3 pattern (qa-capture/capture-entry3-desktop.cjs / -mobile.cjs):
// trusted Playwright keyboard input, settled static frames, capture log with per-shot HUD
// reads and a session-terminal pageErrors record. Routes come ONLY from plan-entry4.json
// (solver-enumerated via tests/e2e/helpers/levels.ts) — no move is hand-typed here.
// Env knobs: PS_E2E_PORT (server port, default 5223 — this lane's port; QA-006 owns 5222),
// UA0011_PLAN (plan JSON), UA0011_OUT (output dir), UA0011_LEVEL (level id).
const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PS_E2E_PORT || "5223";
const BASE = `http://127.0.0.1:${PORT}`;
const PLAN_PATH = process.env.UA0011_PLAN;
const OUT = process.env.UA0011_OUT;
const LEVEL = Number(process.env.UA0011_LEVEL);
const WT = "/Users/Admin/.local/share/opencode/worktree/f9a5d9/ua-0011-capture";
if (!PLAN_PATH || !OUT || !LEVEL) {
  console.error("need UA0011_PLAN, UA0011_OUT, UA0011_LEVEL");
  process.exit(2);
}
const PLAN = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));
const L = PLAN.levels.find((x) => x.id === LEVEL);
if (!L) { console.error("level not in plan:", LEVEL); process.exit(2); }

const hudOf = (txt) => ({
  lvl: (txt.match(/L\s*(\d+)/) || [])[1],
  moves: (txt.match(/moves\s+(\d+)/) || [])[1],
  phase: (txt.match(/(白昼|夜晚)/) || [])[1],
  won: /win|victory|下一关|next level|cleared/i.test(txt),
});
const phaseLetter = (cn) => (cn === "夜晚" ? "B" : "A");

// ── in-page measurement (the frame record governs, item-60 pitch discipline) ──
// Plate-derivation class of Entry-3 capture-log-mobile-pitch pass 2: scan the presented
// canvas for the plate extent against the page-bg corner colour; cellSize = span / longest.
const GEOM_FN = (longest) => {
  const canvas = document.querySelector("canvas");
  const copy = document.createElement("canvas");
  copy.width = canvas.width; copy.height = canvas.height;
  const cx = copy.getContext("2d", { willReadFrequently: true });
  cx.drawImage(canvas, 0, 0);
  const W = copy.width, H = copy.height;
  const data = cx.getImageData(0, 0, W, H).data;
  const at = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
  const dist = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
  const bg = at(1, 1);
  const midY = Math.floor(H / 2); let x0 = -1, x1 = -1;
  for (let x = 0; x < W; x += 1) { if (dist(at(x, midY), bg) > 12) { if (x0 < 0) x0 = x; x1 = x; } }
  const midX = Math.floor(W / 2); let y0 = -1, y1 = -1;
  for (let y = 0; y < H; y += 1) { if (dist(at(midX, y), bg) > 12) { if (y0 < 0) y0 = y; y1 = y; } }
  const spanX = x1 - x0 + 1, spanY = y1 - y0 + 1;
  const cellSize = Math.floor(Math.min(spanX, spanY) / longest);
  const gridSide = cellSize * longest;
  const gridX = x0 + Math.floor((spanX - gridSide) / 2);
  const gridY = y0 + Math.floor((spanY - gridSide) / 2);
  return { canvasW: W, canvasH: H, plate: { x0, y0, x1, y1, spanX, spanY }, cellSize, gridX, gridY, longest };
};

// Tile probe: per-tile ground (modal colour of the inset interior), ink coverage at two
// thresholds (>=24 "ink", >=48 "deep ink" — method stated in the log), and the deep-ink
// mask (string of 0/1) for ground-normalised diffs (Entry-3 pair-identity / residual class).
const PROBE_FN = (args) => {
  const { geom, tiles } = args;
  const canvas = document.querySelector("canvas");
  const copy = document.createElement("canvas");
  copy.width = canvas.width; copy.height = canvas.height;
  const cx = copy.getContext("2d", { willReadFrequently: true });
  cx.drawImage(canvas, 0, 0);
  const W = copy.width;
  const data = cx.getImageData(0, 0, W, copy.height).data;
  const at = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
  const dist = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
  const out = [];
  for (const t of tiles) {
    const inset = Math.round(geom.cellSize * 0.15);
    const rx = geom.gridX + t[0] * geom.cellSize + inset;
    const ry = geom.gridY + t[1] * geom.cellSize + inset;
    const side = geom.cellSize - 2 * inset;
    // modal ground colour
    const hist = new Map();
    for (let y = ry; y < ry + side; y += 1) for (let x = rx; x < rx + side; x += 1) {
      const c = at(x, y); const k = (c[0] << 16) | (c[1] << 8) | c[2];
      hist.set(k, (hist.get(k) || 0) + 1);
    }
    let groundKey = 0, groundN = -1;
    for (const [k, n] of hist) if (n > groundN) { groundN = n; groundKey = k; }
    const ground = [(groundKey >> 16) & 255, (groundKey >> 8) & 255, groundKey & 255];
    let ink = 0, deep = 0, total = 0; const mask = [];
    for (let y = ry; y < ry + side; y += 1) for (let x = rx; x < rx + side; x += 1) {
      const d = dist(at(x, y), ground);
      total += 1;
      if (d >= 24) ink += 1;
      const isDeep = d >= 48;
      if (isDeep) deep += 1;
      mask.push(isDeep ? "1" : "0");
    }
    out.push({
      role: t[2] || "tile", x: t[0], y: t[1], ground,
      inkPct: Math.round((ink / total) * 1000) / 10,
      deepInkPct: Math.round((deep / total) * 1000) / 10,
      side, mask: mask.join(""),
    });
  }
  return out;
};

const mismatch = (a, b) => {
  if (!a || !b || a.length !== b.length) return null;
  let n = 0;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) n += 1;
  return { mismatches: n, pixels: a.length };
};

// Actor-residual probe (the VALID entry-tile residual metric when the crossing frame
// sits in a different phase than the initial frame — a mask diff across the flip would
// be confounded by the portal's own legitimate active↔muted state change). Self-
// calibrating, Entry-3 actor-blob class: the actor's colour is sampled from the centre
// of the tile it landed on, then counted inside the entry tile's inset interior.
const ACTOR_RESIDUAL_FN = (args) => {
  const { geom, farTile, entryTile } = args;
  const canvas = document.querySelector("canvas");
  const copy = document.createElement("canvas");
  copy.width = canvas.width; copy.height = canvas.height;
  const cx = copy.getContext("2d", { willReadFrequently: true });
  cx.drawImage(canvas, 0, 0);
  const W = copy.width;
  const data = cx.getImageData(0, 0, W, copy.height).data;
  const at = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
  const dist = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
  const centre = (t) => at(geom.gridX + t[0] * geom.cellSize + Math.floor(geom.cellSize / 2), geom.gridY + t[1] * geom.cellSize + Math.floor(geom.cellSize / 2));
  const actor = centre(farTile);
  const inset = Math.round(geom.cellSize * 0.15);
  const count = (t) => {
    const rx = geom.gridX + t[0] * geom.cellSize + inset;
    const ry = geom.gridY + t[1] * geom.cellSize + inset;
    const side = geom.cellSize - 2 * inset;
    let n = 0;
    for (let y = ry; y < ry + side; y += 1) for (let x = rx; x < rx + side; x += 1) if (dist(at(x, y), actor) <= 8) n += 1;
    return { n, total: side * side };
  };
  const entry = count(entryTile);
  const far = count(farTile);
  return { actorColor: actor, entryActorPx: entry.n, entryTotalPx: entry.total, farActorPx: far.n, farTotalPx: far.total };
};

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const log = [];
  const browser = await chromium.launch();
  const chromiumVersion = browser.version();
  const errors = [];
  const watch = (page, tag) => {
    page.on("pageerror", (e) => errors.push(`${tag}: ${String(e).slice(0, 200)}`));
    page.on("console", (m) => { if (m.type() === "error") errors.push(`${tag}: console: ${m.text().slice(0, 160)}`); });
  };

  async function runSession(viewport, deviceScaleFactor, shots, tag) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor });
    const page = await ctx.newPage();
    watch(page, tag);
    await page.addInitScript(() => {
      try { window.localStorage.clear(); window.sessionStorage.clear(); } catch {}
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (contextId, options) {
        if (contextId === "webgl" || contextId === "webgl2" || contextId === "experimental-webgl") {
          return original.call(this, contextId, Object.assign({}, options, { preserveDrawingBuffer: true }));
        }
        return original.call(this, contextId, options);
      };
    });
    const hud = async () => hudOf(await page.innerText("body"));
    let geom = null;
    const masks = {}; // stored deep-ink masks: `${role}@${x},${y}` -> mask string
    const settle = async () => { await page.waitForTimeout(450); await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); };
    const press = async (k) => { await page.keyboard.press(k); await page.waitForTimeout(90); };

    await page.goto(`${BASE}/?level=${LEVEL}`, { waitUntil: "networkidle" });
    await page.waitForSelector("canvas", { timeout: 15000 });
    await page.waitForTimeout(800);
    geom = await page.evaluate(GEOM_FN, Math.max(L.width, L.height));
    const pitch = {
      viewport: `${viewport.width}x${viewport.height} CSS @${deviceScaleFactor}`,
      canvas: [geom.canvasW, geom.canvasH],
      plateSpanDevice: [geom.plate.spanX, geom.plate.spanY],
      cellSizeDevice: geom.cellSize,
      pitchCSS: Math.round((geom.cellSize / deviceScaleFactor) * 10) / 10,
      method: "plate-edge derivation (Entry-3 pass-2 class): plate extent vs page-bg corner, cellSize = floor(span/longestSide)",
    };
    log.push({ where: `${tag} geometry`, ...pitch });

    const shotOrder = [...shots].sort((a, b) => a.atLeg - b.atLeg);
    let pressed = 0;
    for (const shot of shotOrder) {
      while (pressed < shot.atLeg) {
        const leg = L.legs[pressed];
        await press(leg.key);
        pressed += 1;
      }
      await settle();
      if (shot.kind === "win") await page.waitForTimeout(700);
      const h = await hud();
      const leg = shot.atLeg > 0 ? L.legs[shot.atLeg - 1] : null;
      const legMatch = leg
        ? Number(h.moves) === leg.n && phaseLetter(h.phase) === leg.phase && String(h.lvl) === String(L.id)
        : Number(h.moves) === 0 && phaseLetter(h.phase) === L.startPhase && String(h.lvl) === String(L.id);
      const rec = {
        shot: shot.name, kind: shot.kind, atLeg: shot.atLeg, viewport: tag, h, legMatch,
        expect: leg ? { moves: leg.n, phase: leg.phase, player: leg.player } : { moves: 0, phase: L.startPhase },
      };
      // probes
      const tiles = [];
      const want = (role, t) => { if (t) tiles.push([t[0], t[1], role]); };
      if (shot.kind !== "win") {
        if (["initial", "seam", "latch", "postlatch"].includes(shot.kind) || tag === "mobile") {
          want("portalNear", L.probeTiles.portalNear);
          want("portalFar", L.probeTiles.portalFar);
        }
        if (shot.kind !== "crossing" || tag === "mobile") want("door", L.probeTiles.door);
        if (shot.kind === "crossing") { want("door", L.probeTiles.door); want("portalFarLanded", L.probeTiles.portalFar); want("entryEnd", L.probeTiles.portalNear); }
        if (shot.kind === "postlatch") want("switch", L.probeTiles.switch);
        if (shot.kind === "initial" || shot.kind === "seam") want("switch", L.probeTiles.switch);
        if (shot.kind === "initial") want("goal", L.probeTiles.goal);
        for (const c of L.probeTiles.channel) want("channel", c);
      }
      if (tiles.length > 0) {
        const probe = await page.evaluate(PROBE_FN, { geom, tiles });
        rec.probes = probe.map((p) => ({ role: p.role, tile: [p.x, p.y], ground: p.ground, inkPct: p.inkPct, deepInkPct: p.deepInkPct }));
        for (const p of probe) masks[`${tag}:${p.role === "entryEnd" ? "portalNear" : p.role}@${p.x},${p.y}`] = p.mask;
        // keep role-agnostic per-tile masks for residual diffs
        for (const p of probe) masks[`${tag}:tile@${p.x},${p.y}`] = p.mask;
        if (shot.pairDiff) {
          rec.pairDiff = mismatch(masks[`${tag}:tile@${L.probeTiles.portalNear.join(",")}`], masks[`${tag}:tile@${L.probeTiles.portalFar.join(",")}`]);
        }
        if (shot.entryResidual) {
          rec.entryResidual = mismatch(masks[`${tag}:initial-entry@${L.probeTiles.portalNear.join(",")}`], masks[`${tag}:tile@${L.probeTiles.portalNear.join(",")}`]);
        }
        if (shot.kind === "crossing") {
          rec.actorResidual = await page.evaluate(ACTOR_RESIDUAL_FN, {
            geom,
            farTile: L.facts.exitEnd,
            entryTile: L.facts.entryEnd,
          });
          const crossingPhase = leg ? leg.phase : null;
          rec.entryResidualNote =
            crossingPhase === L.startPhase
              ? "crossing frame is in the SAME phase as the initial frame — the mask delta is a valid like-for-like residual metric"
              : "crossing frame is in the OTHER phase — the mask delta includes the portal's legitimate active<->muted state change and is NOT a residual by itself; actorResidual (actor-colour px inside the entry tile, sampled from the landed tile) is the valid residual metric";
        }
      }
      if (shot.kind === "initial") {
        masks[`${tag}:initial-entry@${L.probeTiles.portalNear.join(",")}`] = masks[`${tag}:tile@${L.probeTiles.portalNear.join(",")}`];
      }
      if (shot.kind === "win") {
        rec.winPanelInnerText = (await page.innerText("body")).replace(/\s+/g, " ").slice(0, 220);
      }
      const p = path.join(OUT, `${shot.name}.png`);
      await page.screenshot({ path: p });
      rec.bytes = fs.statSync(p).size;
      log.push(rec);
    }
    await ctx.close();
  }

  await runSession({ width: 1000, height: 620 }, 2, L.shots.desktop, "desktop");
  await runSession({ width: 390, height: 844 }, 2, L.shots.mobile, "mobile");

  // dev-channel probe (R-P7 badge + R-P5 strip) once for the block, on L15 desktop
  if (LEVEL === 15) {
    const ctx = await browser.newContext({ viewport: { width: 1000, height: 620 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    watch(page, "devprobe");
    await page.goto(`${BASE}/?level=15&placeholders=1`, { waitUntil: "networkidle" });
    await page.waitForSelector("canvas", { timeout: 15000 });
    await page.waitForTimeout(700);
    const strip = await page.evaluate(() => {
      const s = document.querySelector(".ps-devstrip");
      const b = document.querySelector(".ps-devbadge");
      return { stripText: s ? s.textContent : null, badgeVisible: b ? getComputedStyle(b).display !== "none" : false };
    });
    const rec = { where: "L15 ?placeholders=1 dev channel", ...strip, portalMentioned: /portal/i.test(strip.stripText || "") };
    const p = path.join(OUT, "l015_dev_channel.png");
    await page.screenshot({ path: p });
    rec.shot = "l015_dev_channel";
    rec.bytes = fs.statSync(p).size;
    rec.h = hudOf(await page.innerText("body"));
    log.push(rec);
    await ctx.close();
  }

  log.push({
    pageErrors: errors,
    level: LEVEL,
    tree: PLAN.tree,
    treeShort: PLAN.tree.slice(0, 7),
    worktree: WT,
    serverPort: Number(PORT),
    chromium: chromiumVersion,
    playwright: require("@playwright/test/package.json").version,
    date: new Date().toISOString(),
    routeEnumeratedFrom: "plan-entry4.json (solver via tests/e2e/helpers/levels.ts — no hand-typed moves)",
    probeMethod: "tile ink coverage vs per-tile modal ground; thresholds: ink >=24, deep ink >=48 (max-channel distance); masks ground-normalised per tile",
  });
  fs.writeFileSync(path.join(OUT, `capture-log-l${String(LEVEL).padStart(3, "0")}.json`), JSON.stringify(log, null, 2));
  const shots = log.filter((x) => x.shot);
  console.log(JSON.stringify({
    level: LEVEL,
    shots: shots.length,
    legMatches: shots.filter((s) => s.legMatch === false).length === 0 ? "ALL TRUE" : shots.filter((s) => !s.legMatch).map((s) => s.shot),
    pairDiffs: shots.filter((s) => s.pairDiff).map((s) => ({ shot: s.shot, ...s.pairDiff })),
    entryResiduals: shots.filter((s) => s.entryResidual).map((s) => ({ shot: s.shot, ...s.entryResidual })),
    pageErrors: errors.length,
  }, null, 1));
  await browser.close();
}

main().catch((e) => { console.error("CAPTURE_FATAL", e); process.exit(1); });

/**
 * `scripts/p1-l020-reland.ts` — **P-1**, the readout folded into R-003d from PA-003 (item 94)
 * and asked for by PL-3: *does any of L20's par routes re-land through the landing portal into
 * phase A?* — i.e. is the re-landing beat a **live row** the playtest protocol must watch, or a
 * **structural guard** that cannot happen?
 *
 * Definition, stated once so the number cannot drift: a route **re-lands** when it enters an
 * ACTIVE portal end a **second** time. `p1` is `(2,5) ⇄ (5,1)` with `activePhase "A"`, so
 * entering either end while the pre-move phase is `A` teleports unconditionally
 * (`src/core/rules/applyMove.ts`); the *landing* is the end the player is delivered to, the
 * *near* end is where they started. A second entry is reachable ON FOOT only from inside the
 * pocket — the mechanism's `leave` beat.
 *
 *   npx tsx scripts/p1-l020-reland.ts
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { coordKey, LevelSchema, type Level } from "@/core/level";
import { analyse, explore, forEachParRoute, tileKey, type ArrivalRecord } from "@/core/solver/bfs";
import { step } from "@/core/state/move";
import type { Phase } from "@/core/state/phase";

const path = fileURLToPath(new URL("../src/levels/l020.json", import.meta.url));
const level = LevelSchema.parse(JSON.parse(readFileSync(path, "utf8"))) as Level;
const graph = explore(level);
const result = analyse(level, graph);
const par = result.shortestSolution;
if (par === null) {
  console.log("l020 is UNSOLVABLE — the readout is void");
  process.exit(1);
}
const activePhaseByEnd = new Map<string, Phase>();
for (const portalDef of level.portals) {
  for (const end of portalDef.pair) activePhaseByEnd.set(coordKey(end), portalDef.activePhase);
}
const first = level.portals[0];
const landingKey = first === undefined ? "-" : coordKey(first.pair[1]);
const nearKey = first === undefined ? "-" : coordKey(first.pair[0]);

let routes = 0;
let entries = 0;
let reLand = 0;
let onLanding = 0;
let onNear = 0;
let firstOnLanding = 0;
let secondOnNear = 0;
const hist = new Map<number, number>();
forEachParRoute(level, par, (route) => {
  routes += 1;
  let n = 0;
  for (let i = 0; i < route.length; i += 1) {
    const arrival = route[i] as ArrivalRecord;
    const before = i === 0 ? graph.nodes[0] : route[i - 1]?.state;
    if (before === undefined) continue;
    const key = tileKey(step(before.player, arrival.direction));
    if (activePhaseByEnd.get(key) !== before.phase) continue;
    n += 1;
    entries += 1;
    if (key === landingKey) {
      onLanding += 1;
      if (n === 1) firstOnLanding += 1;
    }
    if (key === nearKey) {
      onNear += 1;
      if (n === 2) secondOnNear += 1;
    }
  }
  hist.set(n, (hist.get(n) ?? 0) + 1);
  if (n >= 2) reLand += 1;
});
const spread = [...hist.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(([k, v]) => String(k) + " entry(ies) -> " + String(v) + " route(s)")
  .join(" · ");
console.log("P-1 — l020 re-landing readout (par routes through the landing portal p1)");
console.log("  par " + String(par) + " · par routes " + String(routes) + " · ends: near [" + nearKey + "] · landing [" + landingKey + "] · activePhase \"" + String(first?.activePhase ?? "-") + "\"");
console.log("  active-end entries over all routes: " + String(entries) + " · on the LANDING end " + String(onLanding) + " · on the NEAR end " + String(onNear));
console.log("  routes by entry count: " + spread);
console.log("  RE-LANDING routes (>= 2 entries = the land -> press -> leave beat): " + String(reLand) + "/" + String(routes));
console.log("  ... first entry on the LANDING end (phase A): " + String(firstOnLanding) + " · second entry on the NEAR end (the leave beat, taken in phase A): " + String(secondOnNear));
console.log("  ANSWER for PL-3: " + (reLand === 0 ? "STRUCTURAL GUARD — no par route re-lands" : "LIVE ROW — " + String(reLand) + "/" + String(routes) + " par routes re-land, so the beat is reachable in play and must be watched"));

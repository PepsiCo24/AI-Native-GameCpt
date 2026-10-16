/**
 * `scripts/audit-block-l1620-controls.ts` — **R-003d**: the L16–L20 block law's negative
 * controls, run against the SHIPPED readers (`auditLevel` → `blockL1619Gates`).
 *
 * Why a script and not a test: `tests/**` is off-lane (QA-014 owns the pin migration), so the
 * R-003c pattern (one control per gate, B7–B12 in `policy-negative-controls.test.ts`) is
 * reproduced here on the registered bytes. Every control names the policy code that MUST fire
 * and the whole fired list is printed beside the verdict — a control that fires nothing, or
 * fires something else, is a MISS.
 *
 *   npx tsx scripts/audit-block-l1620-controls.ts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { LevelSchema, type Level } from "@/core/level";
import { auditLevel } from "@/core/solver/policy";

const LEVELS_DIR = fileURLToPath(new URL("../src/levels/", import.meta.url));
const read = (id: number): Level =>
  LevelSchema.parse(
    JSON.parse(readFileSync(join(LEVELS_DIR, `l${String(id).padStart(3, "0")}.json`), "utf8")),
  ) as Level;
const codesOf = (level: Level): readonly string[] =>
  auditLevel(level).violations.map((v) => v.code).sort();

const sealedRow = Array.from({ length: 7 }, (_, x) => [x, 6] as [number, number]);
const l020 = read(20);
const controls: readonly { name: string; board: Level; expect: readonly string[] }[] = [
  { name: "[C1] -rung at 20 (the registered bytes with par mis-stamped 19)", board: { ...l020, par: 19 }, expect: ["gate-block-l1619-rung"] },
  { name: "[C2] -tail-ceiling (the interior member l018 wearing rung 20)", board: { ...read(18), id: 20 }, expect: ["gate-block-l1619-tail-ceiling", "gate-block-l1619-rung"] },
  { name: "[C3] -b-band with l016-as-20 (F-L16-2's B=1.7000 under an unnamed rung)", board: { ...read(16), id: 20 }, expect: ["gate-block-l1619-b-band", "gate-block-l1619-rung"] },
  { name: "[C4] -grid-coverage (registered bytes on 7 x 7, the added row sealed in both phases)", board: { ...l020, height: 7, phaseAWalls: [...l020.phaseAWalls, ...sealedRow], phaseBWalls: [...l020.phaseBWalls, ...sealedRow] }, expect: ["gate-block-l1619-grid-coverage"] },
  { name: "[C5] -device-existence (the goal's seal doors and their switches dropped, AND one wall removed from the sealed x=3 column at EACH phase (l020's far region is portal-only, so existence cannot break any other way); d1+s1 stay, so the latch lesson still stands)", board: { ...l020, doors: l020.doors.filter((d) => d.id === "d1"), switches: l020.switches.filter((s) => s.id === "s1"), phaseAWalls: l020.phaseAWalls.filter((w) => !(w[0] === 3 && w[1] === 0)), phaseBWalls: l020.phaseBWalls.filter((w) => !(w[0] === 3 && w[1] === 1)) }, expect: ["gate-block-l1619-device-existence"] },
  { name: "[C6] -escalation-cut (R-003c B10's construction on l016: a phase-B portal whose landing is an A-walled dead pocket -> T=21, R=0.016129, the par + 3.B identity breaks)", board: { ...read(16), portals: [...read(16).portals, { id: "p2", pair: [[0, 5], [1, 0]] as const, activePhase: "B" as const }], phaseAWalls: [...read(16).phaseAWalls, [1, 5], [0, 4]] as [number, number][] }, expect: ["gate-block-l1619-escalation-cut"] },
];
console.log("audit-block-l1620-controls — the L16-L20 block law, control by control");
let caught = 0;
for (const c of controls) {
  const codes = codesOf(c.board);
  const hit = c.expect.some((e) => codes.includes(e));
  if (hit) caught += 1;
  console.log(`  ${hit ? "CAUGHT" : "MISSED"}  ${c.name}`);
  console.log(`            fired: [${codes.join(" ")}]  (required one of: ${c.expect.join(", ")})`);
}
console.log(`  discrimination side: l020 fires [${codesOf(l020).join(" ")}] — the law ACCEPTs the registered bytes`);
console.log(`controls: ${String(caught)}/${String(controls.length)} caught by name`);
console.log(`RESULT: ${caught === controls.length ? "CONTROLS-OK" : "MISSED"}`);
process.exit(caught === controls.length ? 0 : 1);

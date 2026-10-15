/**
 * LV-006 candidate generator — the **reproducible, seeded authoring record** for
 * the doors+switch teaching unit (L6–L10, `src/levels/l006.json` … `l010.json`).
 *
 * ── WHAT THIS SCRIPT IS (and is not) ─────────────────────────────────────────
 * `docs/ai-native-pipeline.md` §1: **LLM creates. Solver proves. Human decides.**
 * This file is the *program* half of that contract, and it is the artifact that
 * makes the half that is not program provable:
 *
 *   - the **templates / candidate families** below are the recorded proposal side
 *     (the design-reasoning role proposed the template axes: which tile may hold
 *     the switch, which colour the door takes, where the funnel walls go). They
 *     are hypotheses, they are written here as data, and they are *not* trusted;
 *   - every candidate then goes through the **program** gates in this order:
 *     `LevelSchema` (zod) → `validateLevel` (rules) → BFS (`explore`/`analyse`) →
 *     `par` taken from the solver, never from the proposal → the level policy and
 *     the documented-lesson obligations (`@/core/solver/policy`) → accept/reject;
 *   - a rejection is **never repaired** here (ADR-0004): the candidate is printed
 *     with the machine-readable reason and dropped. There is no "fix it up" path,
 *     because a repaired candidate would no longer be the thing that was proven.
 *
 * Determinism: fixed seed (`SEED`), no clock, no network, no filesystem writes.
 * Re-running prints byte-identical output, so the acceptance/rejection histogram
 * in `docs/ai-native-pipeline.md` §9 can be re-derived by anyone.
 *
 * ── WHAT "ACCEPT" MEANS HERE ─────────────────────────────────────────────────
 * A candidate is accepted iff ALL of:
 *   1. `LevelSchema` + `validateLevel` accept it (reject = schema/rules);
 *   2. it is solvable, has 0 dead states, and the goal is reachable from every
 *      reachable state (`docs/level-design.md` §4);
 *   3. `par` == the solver's shortest solution (the file's `par` is *set* from the
 *      solver here — that is the point: the proposal never states a par);
 *   4. `auditLevel` reports **zero** policy violations, which includes
 *      "M1 never ships alone" (door ⇄ live switch), the documented-lesson
 *      obligations, and — for `l008` — the named Aha #1 gates of
 *      `docs/level-design.md` §3.
 *
 * Accepted candidates are then compared against the shipped level file for that
 * id: `shipped=l006 MATCH` means the shipped JSON **is** the accepted output (the
 * level was not hand-edited after proof). Only the level's canonical field set is
 * compared; ordering of wall lists is normalised.
 *
 * Usage: `node_modules/.bin/tsx scripts/author-lv006-candidates.ts`
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import type { Coord, DoorDef, Level, Phase } from "@/core/level";
import { LevelSchema, coordKey, validateLevel } from "@/core/level";
import { analyse, explore } from "@/core/solver/bfs";
import { auditLevel } from "@/core/solver/policy";

/** Fixed seed — recorded in `docs/ai-native-pipeline.md` §9 with the histogram. */
const SEED = 20261015;

/** Deterministic PRNG (mulberry32): same seed ⇒ same candidate order, forever. */
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LEVELS_DIR = fileURLToPath(new URL("../src/levels/", import.meta.url));

interface Candidate {
  /** Draft shape: the proposal never states `par` — the solver supplies it. */
  readonly level: Lead;
  /** The proposal axes this candidate came from (printed on accept). */
  readonly axes: string;
}

function coord(x: number, y: number): Coord {
  return [x, y];
}

/** The phase present on the move that arrives at `tile` — the ADR-0009 entry phase. */
function entryPhaseOf(startPhase: Phase, player: Coord, tile: Coord): Phase {
  const d = Math.abs(tile[0] - player[0]) + Math.abs(tile[1] - player[1]);
  const odd = d % 2 === 1;
  // `src/levels/README.md` §3 F1 + F2: with startPhase A the move that enters a
  // tile at odd distance is itself played in phase A, and entry parity is
  // route-independent.
  if (startPhase === "A") return odd ? "A" : "B";
  return odd ? "B" : "A";
}

/** Draft shape (no `par` yet — the solver supplies it). */
type Lead = Omit<Level, "par">;

function doorDef(id: string, color: DoorDef["color"], tiles: Coord[]): DoorDef {
  return { id, color, tiles };
}

/**
 * Decoration walls for the seeded variant axis: only tiles on which the wall is
 * *permanently* solid (a phase wall whose solid phase equals the tile's fixed
 * entry phase, `src/levels/README.md` §3 F2), so a variant adds geometry without
 * adding validator warnings. Player / goal / door / switch tiles are excluded.
 */
function seededDecoration(
  lead: Lead,
  rng: () => number,
  count: number,
): { phaseAWalls: Coord[]; phaseBWalls: Coord[] } {
  const taken = new Set<string>([
    coordKey(lead.player),
    coordKey(lead.goal),
    ...lead.doors.flatMap((d) => d.tiles.map(coordKey)),
    ...lead.switches.map((s) => coordKey(s.tile)),
    ...lead.portals.flatMap((p) => p.pair.map(coordKey)),
    ...lead.phaseAWalls.map(coordKey),
    ...lead.phaseBWalls.map(coordKey),
  ]);
  const phaseAWalls = [...lead.phaseAWalls];
  const phaseBWalls = [...lead.phaseBWalls];
  const cells: Coord[] = [];
  for (let x = 0; x < lead.width; x += 1) {
    for (let y = 0; y < lead.height; y += 1) cells.push(coord(x, y));
  }
  let placed = 0;
  let guard = 0;
  while (placed < count && guard < 500) {
    guard += 1;
    const tile = cells[Math.floor(rng() * cells.length)] as Coord;
    const key = coordKey(tile);
    if (taken.has(key)) continue;
    const phase = entryPhaseOf(lead.startPhase, lead.player, tile);
    (phase === "A" ? phaseAWalls : phaseBWalls).push(tile);
    taken.add(key);
    placed += 1;
  }
  return { phaseAWalls, phaseBWalls };
}

// ─────────────────────────────────────────────────────────────────────────────
// The candidate families (the recorded proposal side)
// ─────────────────────────────────────────────────────────────────────────────

function* familyL6(): Generator<Candidate> {
  const switchTiles: Coord[] = [coord(1, 1), coord(2, 0), coord(0, 0)];
  const doorTiles: Coord[] = [coord(3, 1), coord(2, 1)];
  const colors: Array<DoorDef["color"]> = ["blue", "red"];
  for (const sw of switchTiles) {
    for (const dt of doorTiles) {
      for (const color of colors) {
        yield {
          axes: `switch=${coordKey(sw)} door=${coordKey(dt)}/${color}`,
          level: {
            id: 6,
            width: 5,
            height: 3,
            startPhase: "A",
            player: coord(0, 1),
            goal: coord(4, 1),
            phaseAWalls: [],
            phaseBWalls: [],
            doors: [doorDef("d1", color, [dt])],
            switches: [
              { id: "s1", tile: sw, activePhase: "A", targets: ["d1"] },
            ],
            portals: [],
          },
        };
      }
    }
  }
}

function* familyL7(): Generator<Candidate> {
  const switchTiles: Coord[] = [coord(0, 0), coord(0, 2), coord(1, 0)];
  for (const sw of switchTiles) {
    yield {
      axes: `switch=${coordKey(sw)} door=(1,1)/blue`,
      level: {
        id: 7,
        width: 3,
        height: 3,
        startPhase: "A",
        player: coord(0, 1),
        goal: coord(2, 1),
        phaseAWalls: [coord(2, 0), coord(2, 2)],
        phaseBWalls: [],
        doors: [doorDef("d1", "blue", [coord(1, 1)])],
        switches: [{ id: "s1", tile: sw, activePhase: "A", targets: ["d1"] }],
        portals: [],
      },
    };
  }
}

function* familyL8(): Generator<Candidate> {
  const switchTiles: Coord[] = [coord(2, 0), coord(2, 2), coord(1, 0)];
  for (const sw of switchTiles) {
    yield {
      axes: `switch=${coordKey(sw)} door=(3,1)/blue funnel=(4,0)+(4,2)`,
      level: {
        id: 8,
        width: 5,
        height: 4,
        startPhase: "A",
        player: coord(0, 1),
        goal: coord(4, 1),
        phaseAWalls: [coord(4, 0), coord(4, 2)],
        phaseBWalls: [],
        doors: [doorDef("d1", "blue", [coord(3, 1)])],
        switches: [{ id: "s1", tile: sw, activePhase: "A", targets: ["d1"] }],
        portals: [],
      },
    };
  }
}

function* familyL9(): Generator<Candidate> {
  const s2Tiles: Coord[] = [coord(3, 1), coord(3, 3)];
  const door2Tiles: Array<[Coord, Coord]> = [
    [coord(4, 1), coord(4, 0)],
    [coord(4, 3), coord(4, 0)],
  ];
  for (const s2 of s2Tiles) {
    for (const [d2Tile, goalTile] of door2Tiles) {
      yield {
        axes: `s2=${coordKey(s2)} door2=${coordKey(d2Tile)} goal=${coordKey(goalTile)}`,
        level: {
          id: 9,
          width: 5,
          height: 5,
          startPhase: "A",
          player: coord(0, 2),
          goal: goalTile,
          phaseAWalls: [coord(2, 1), coord(2, 3), coord(3, 0)],
          phaseBWalls: [coord(2, 0), coord(2, 4)],
          doors: [
            doorDef("d1", "red", [coord(2, 2)]),
            doorDef("d2", "blue", [d2Tile]),
          ],
          switches: [
            { id: "s1", tile: coord(0, 1), activePhase: "A", targets: ["d1"] },
            { id: "s2", tile: s2, activePhase: "B", targets: ["d2"] },
          ],
          portals: [],
        },
      };
    }
  }
}

function* familyL10(): Generator<Candidate> {
  const switchTiles: Coord[] = [coord(2, 3), coord(1, 3), coord(2, 1)];
  const echoes: Coord[][] = [[coord(1, 2)], []];
  for (const sw of switchTiles) {
    for (const echo of echoes) {
      yield {
        axes: `switch=${coordKey(sw)} echo=${echo.length === 0 ? "none" : coordKey(echo[0] as Coord)}`,
        level: {
          id: 10,
          width: 6,
          height: 4,
          startPhase: "A",
          player: coord(0, 1),
          goal: coord(5, 1),
          phaseAWalls: echo,
          phaseBWalls: [coord(5, 0), coord(5, 2)],
          doors: [doorDef("d1", "red", [coord(4, 1)])],
          switches: [
            {
              id: "s1",
              tile: sw,
              activePhase: entryPhaseOf("A", coord(0, 1), sw),
              targets: ["d1"],
            },
          ],
          portals: [],
        },
      };
    }
  }
}

const FAMILIES: Array<{
  id: number;
  label: string;
  build: () => Generator<Candidate>;
}> = [
  { id: 6, label: "latch on the natural path (5x3)", build: familyL6 },
  { id: 7, label: "detour to the switch (3x3)", build: familyL7 },
  { id: 8, label: "Aha #1 latch, door guards the goal (5x4)", build: familyL8 },
  {
    id: 9,
    label: "two doors + two switches, ordered plan (5x5)",
    build: familyL9,
  },
  {
    id: 10,
    label: "mastery: M0 geometry + echo + latch (6x4)",
    build: familyL10,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// The program gate
// ─────────────────────────────────────────────────────────────────────────────

interface Outcome {
  readonly accepted: boolean;
  readonly reason: string;
  /**
   * The machine-readable policy codes, when the rejection came from
   * `@/core/solver/policy` (the probes read these, never the prose of `reason`,
   * so a probe can require *every* code it claims — LV-007A).
   */
  readonly codes?: readonly string[];
}

/** Run every program gate on one candidate. The solver — never the proposal — sets `par`. */
function judge(lead: Lead): { outcome: Outcome; level: Level | null } {
  const draft = { ...lead, par: 1 };
  const parsed = LevelSchema.safeParse(draft);
  if (!parsed.success) {
    return {
      outcome: {
        accepted: false,
        reason: `schema:${parsed.error.issues[0]?.message ?? "?"}`,
      },
      level: null,
    };
  }
  const verdict = validateLevel(parsed.data);
  if (!verdict.ok) {
    return {
      outcome: { accepted: false, reason: `rules:${verdict.errors[0] ?? "?"}` },
      level: null,
    };
  }

  const level = parsed.data as Level;
  const graph = explore(level);
  const result = analyse(level, graph);
  if (!result.solvable)
    return { outcome: { accepted: false, reason: "unsolvable" }, level: null };
  if (result.deadStates > 0) {
    return {
      outcome: { accepted: false, reason: `dead-states:${result.deadStates}` },
      level: null,
    };
  }
  if (!result.noUnrecoverableOk) {
    return {
      outcome: {
        accepted: false,
        reason: `unrecoverable:${result.unrecoverableStates}`,
      },
      level: null,
    };
  }

  // `par` comes from the solver: the proposal is never trusted with the number.
  const proven: Level = { ...level, par: result.shortestSolution as number };
  const audit = auditLevel(proven, graph);
  if (audit.violations.length > 0) {
    const first = audit.violations[0];
    return {
      outcome: {
        accepted: false,
        reason: `policy:${first?.code ?? "?"}${audit.violations.length > 1 ? `(+${audit.violations.length - 1})` : ""}`,
        codes: audit.violations.map((violation) => `policy:${violation.code}`),
      },
      level: null,
    };
  }
  return {
    outcome: {
      accepted: true,
      reason: `par=${String(result.shortestSolution)}`,
    },
    level: proven,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Canonical comparison against the shipped file
// ─────────────────────────────────────────────────────────────────────────────

function canonical(raw: unknown): string {
  const level = raw as Level;
  const sortPairs = (pairs: readonly Coord[]): string[] =>
    pairs.map(coordKey).sort();
  return JSON.stringify({
    id: level.id,
    width: level.width,
    height: level.height,
    startPhase: level.startPhase,
    player: coordKey(level.player),
    goal: coordKey(level.goal),
    phaseAWalls: sortPairs(level.phaseAWalls),
    phaseBWalls: sortPairs(level.phaseBWalls),
    doors: level.doors
      .map((d) => `${d.id}:${d.color}:${sortPairs(d.tiles).join("|")}`)
      .sort(),
    switches: level.switches
      .map(
        (s) =>
          `${s.id}:${coordKey(s.tile)}:${s.activePhase}:${[...s.targets].sort().join("|")}`,
      )
      .sort(),
    portals: level.portals
      .map((p) => `${p.id}:${coordKey(p.pair[0])}>${coordKey(p.pair[1])}`)
      .sort(),
    par: level.par,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────────────

console.log(
  "Phase Shift: Echo Grid — LV-006 candidate generator (L6-L10 doors + switches)",
);
console.log(
  `seed=${SEED} · gate: zod → validateLevel → BFS(explore+analyse) → par=solver → policy/lesson gates → accept/reject`,
);
console.log(
  "rejection is never repaired (ADR-0004): the candidate is named and dropped",
);
console.log("");

const rejectHistogram = new Map<string, number>();
const shippedById = new Map<number, string>();

for (const family of FAMILIES) {
  const shippedRaw = JSON.parse(
    readFileSync(
      join(LEVELS_DIR, `l${String(family.id).padStart(3, "0")}.json`),
      "utf8",
    ),
  ) as unknown;
  const shippedCanon = canonical(shippedRaw);
  const rng = makeRng(SEED + family.id);
  let accepted = 0;
  let total = 0;
  let shippedMatched = false;

  for (const candidate of family.build()) {
    total += 1;
    const { outcome, level } = judge(candidate.level);
    if (!outcome.accepted || level === null) {
      const bucket = outcome.reason.split(":")[0] ?? outcome.reason;
      rejectHistogram.set(bucket, (rejectHistogram.get(bucket) ?? 0) + 1);
      console.log(
        `  REJECT l${String(family.id).padStart(3, "0")}  ${candidate.axes.padEnd(44)} ${outcome.reason}`,
      );
      continue;
    }
    accepted += 1;
    const matches = canonical(level) === shippedCanon;
    if (matches) shippedMatched = true;
    console.log(
      `  ACCEPT l${String(family.id).padStart(3, "0")}  ${candidate.axes.padEnd(44)} ${outcome.reason} · ` +
        `${level.width}x${level.height} shipped=${matches ? "MATCH" : "variant"}`,
    );
  }

  // Seeded decoration axis: permanent walls only, so a variant adds geometry and
  // no validator warning. Some variants seal a route — those must be reported as
  // rejects, not silently skipped.
  const base = [...family.build()][0] as Candidate;
  for (let i = 0; i < 3; i += 1) {
    total += 1;
    const walls = seededDecoration(base.level, rng, 1 + i);
    const { outcome, level } = judge({ ...base.level, ...walls });
    if (!outcome.accepted || level === null) {
      const bucket = outcome.reason.split(":")[0] ?? outcome.reason;
      rejectHistogram.set(bucket, (rejectHistogram.get(bucket) ?? 0) + 1);
      console.log(
        `  REJECT l${String(family.id).padStart(3, "0")}  ${`seeded+${String(1 + i)} permanent wall(s)`.padEnd(44)} ${outcome.reason}`,
      );
      continue;
    }
    accepted += 1;
    const matches = canonical(level) === shippedCanon;
    console.log(
      `  ACCEPT l${String(family.id).padStart(3, "0")}  ${`seeded+${String(1 + i)} permanent wall(s)`.padEnd(44)} ${outcome.reason} · ` +
        `${level.width}x${level.height} shipped=${matches ? "MATCH" : "variant"}`,
    );
  }

  console.log(
    `  — ${family.label}: ${accepted}/${total} accepted · shipped file re-derived by the program: ${shippedMatched ? "YES" : "NO"}`,
  );
  console.log("");
  if (!shippedMatched) {
    throw new Error(
      `l${String(family.id).padStart(3, "0")}.json is not an accepted candidate of the recorded family — ` +
        `the shipped level was hand-edited after proof, which this pipeline must never allow`,
    );
  }
  shippedById.set(family.id, "MATCH");
}

const acceptedTotal = [...shippedById.keys()].length;
console.log("rejection histogram (machine-readable reasons):");
for (const [bucket, count] of [...rejectHistogram.entries()].sort(
  (a, b) => b[1] - a[1],
)) {
  console.log(`  ${bucket}: ${count}`);
}
console.log("");

// ─────────────────────────────────────────────────────────────────────────────
// Negative probes — each MUST be rejected, by name
//
// The mirror image of `scripts/validate-levels.ts`'s negative self-tests: an
// accept-only generator proves nothing about its gate, so these three candidates
// are *designed* to be bad and the script fails loudly if any of them is
// accepted. Every one of them is a plausible authoring mistake, not a strawman:
//
//   1. a switch that can never fire (its `activePhase` can never be current on
//      its own tile — the tile is entered in exactly one phase, F2);
//   2. the Aha #1 board with the goal funnel removed: the door still refuses, the
//      switch still fires, the dynamism metric still reports — and the goal is
//      reachable without ever pressing it, so the Aha is gone;
//   3. a door no switch targets (M1 alone — the mechanic ADR-0009 measured as
//      static).
//
// A probe may claim **several** codes (LV-007A): probe 2 now trips two, because
// removing the funnel removes the only reason to press the switch — the same
// board also breaks the `switchRequired` obligation (`lesson-switch-required`)
// that binds L7–L10. The coupling is a finding about the board, so it is stated
// and asserted; the gate (i) code must still be among them.
// ─────────────────────────────────────────────────────────────────────────────

const PROBES: Array<{
  id: number;
  label: string;
  /** Every policy code the rejection must name (all of them, not just the first). */
  expect: readonly string[];
  level: Lead;
}> = [
  {
    id: 900,
    label: "probe: inert switch (activePhase can never be current)",
    expect: ["policy:switch-never-fires"],
    // The door sits on a side tile (decorative: the goal is reachable along the
    // row), so the level stays *solvable* and the inert switch is the only defect
    // — which is exactly the point: the policy has to catch what the BFS cannot.
    level: {
      id: 900,
      width: 5,
      height: 3,
      startPhase: "A",
      player: coord(0, 1),
      goal: coord(4, 1),
      phaseAWalls: [],
      phaseBWalls: [],
      doors: [doorDef("d1", "blue", [coord(3, 0)])],
      switches: [
        { id: "s1", tile: coord(1, 1), activePhase: "B", targets: ["d1"] },
      ],
      portals: [],
    },
  },
  {
    id: 8,
    label: "probe: Aha board without the funnel (switch becomes optional)",
    expect: [
      "policy:gate-no-solution-with-switches-off",
      "policy:lesson-switch-required",
    ],
    level: {
      id: 8,
      width: 5,
      height: 4,
      startPhase: "A",
      player: coord(0, 1),
      goal: coord(4, 1),
      phaseAWalls: [],
      phaseBWalls: [],
      doors: [doorDef("d1", "blue", [coord(3, 1)])],
      switches: [
        { id: "s1", tile: coord(2, 0), activePhase: "A", targets: ["d1"] },
      ],
      portals: [],
    },
  },
  {
    id: 6,
    label: "probe: door targeted by no switch (M1 alone)",
    expect: ["policy:door-without-switch"],
    level: {
      id: 6,
      width: 5,
      height: 3,
      startPhase: "A",
      player: coord(0, 1),
      goal: coord(4, 1),
      phaseAWalls: [],
      phaseBWalls: [],
      doors: [doorDef("d1", "blue", [coord(3, 1)])],
      switches: [],
      portals: [],
    },
  },
];

console.log("negative probes (must all be REJECTED by name, never repaired):");
let probesRejected = 0;
for (const probe of PROBES) {
  const { outcome } = judge(probe.level);
  const codes = outcome.codes ?? [outcome.reason];
  const ok =
    !outcome.accepted && probe.expect.every((code) => codes.includes(code));
  if (ok) probesRejected += 1;
  console.log(
    `  ${ok ? "OK  " : "FAIL"} ${probe.label.padEnd(52)} expected=${probe.expect.join(" + ")} got=${codes.join(" ")}`,
  );
}
if (probesRejected !== PROBES.length) {
  throw new Error(
    `only ${probesRejected}/${PROBES.length} negative probes were rejected by name — the level policy is not ` +
      `enforcing what it claims, so every "accept" above is worthless evidence`,
  );
}
console.log("");
console.log(
  `summary: l006–l010 each re-derived from the recorded template families (seed ${SEED}); ` +
    `${acceptedTotal}/5 shipped files MATCH an accepted candidate; ${probesRejected}/${PROBES.length} negative probes rejected by name; ` +
    `rejections are named, never repaired.`,
);

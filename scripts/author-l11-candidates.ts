/**
 * LV-008 candidate generator — the **reproducible, seeded authoring record** for the
 * M2 (portal) mechanic debut, `src/levels/l011.json`.
 *
 * ── WHAT THIS SCRIPT IS (and is not) ─────────────────────────────────────────
 * `docs/ai-native-pipeline.md` §1: **LLM creates. Solver proves. Human decides.**
 * This file is the *program* half of that contract, and it is the artifact that
 * makes the half that is not program-provable:
 *
 *   - the **templates / candidate families** below are the recorded proposal side.
 *     The design-reasoning role proposed the template axes for the portal debut:
 *     the board is the wall-free "north-jump" 7 × 3 skeleton of the L6 debut
 *     template, the goal is on the far north-east corner, the new channel sits on
 *     the natural row, and the M1+M3 unit stays on the only route. Which tile holds
 *     the switch, which colour the door takes, where the two ends of the pair are
 *     and which phase the channel is alive in are **hypotheses**: they are written
 *     here as data and they are *not* trusted;
 *   - every candidate then goes through the **program** gates in this order:
 *     `LevelSchema` (zod) → `validateLevel` (rules) → BFS (`explore`/`analyse`) →
 *     `par` taken from the solver, never from the proposal → the level policy and
 *     the documented-lesson obligations (`@/core/solver/policy`, which for
 *     `id: 11` means the whole `portal-aha-2` gate suite of §3.4 + the
 *     pre-registered seam law) → accept/reject;
 *   - a rejection is **never repaired** here (ADR-0004): the candidate is printed
 *     with the machine-readable reason and dropped. There is no "fix it up" path,
 *     because a repaired candidate would no longer be the thing that was proven.
 *
 * Determinism: fixed seed (`SEED`), no clock, no network, no filesystem writes.
 * Re-running prints byte-identical output, so the acceptance/rejection histogram in
 * `docs/ai-native-pipeline.md` §8.8 can be re-derived by anyone.
 *
 * ── WHAT "ACCEPT" MEANS HERE ─────────────────────────────────────────────────
 * A candidate is accepted iff ALL of:
 *   1. `LevelSchema` + `validateLevel` accept it (reject = schema/rules — this is
 *      where a **same-colour** pair dies, see probe 1: it is inert by the
 *      checkerboard invariant and the level layer hard-rejects it);
 *   2. it is solvable, has 0 dead states, and the goal is reachable from every
 *      reachable state (`docs/level-design.md` §4);
 *   3. `par` == the solver's shortest solution (the file's `par` is *set* from the
 *      solver here — that is the point: the proposal never states a par);
 *   4. `auditLevel` reports **zero** policy violations, which for `id: 11` includes
 *      the whole `portal-aha-2` suite: gate (iv), the shared M1+M3 unit gate, the
 *      ordered refusal beat, "exactly one opposite-colour pair", "every par route
 *      teleports", `par ≤ 4`, "below OFFERED", and `D_exec < 13.64`.
 *
 * Accepted candidates are then compared against the shipped level file:
 * `shipped=l011 MATCH` means the shipped JSON **is** an accepted output of this
 * family (the level was not hand-edited after proof). Only the level's canonical
 * field set is compared; wall lists are normalised.
 *
 * Usage: `node_modules/.bin/tsx scripts/author-l11-candidates.ts`
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import type { Coord, DoorDef, Level, Phase } from "@/core/level";
import { LevelSchema, coordKey, validateLevel } from "@/core/level";
import { analyse, explore } from "@/core/solver/bfs";
import { PORTAL_DEBUT_EXEC_BUDGET, auditLevel } from "@/core/solver/policy";

/** Fixed seed — recorded in `docs/ai-native-pipeline.md` §8.8 with the histogram. */
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
  if (startPhase === "A") return odd ? "A" : "B";
  return odd ? "B" : "A";
}

/** Draft shape (no `par` yet — the solver supplies it). */
type Lead = Omit<Level, "par">;

function doorDef(id: string, color: DoorDef["color"], tiles: Coord[]): DoorDef {
  return { id, color, tiles };
}

// ─────────────────────────────────────────────────────────────────────────────
// The candidate family (the recorded proposal side)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The recorded axes of the M2 debut template. Every value below is a *proposal*
 * by the design-reasoning role, not a finding:
 *
 * - **skeleton** — 7 × 3, wall-free, `startPhase A`, player `(0,1)`, goal `(6,0)`:
 *   the L6 debut template's shape (`docs/level-difficulty.md` §3.4 asks a debut to
 *   be short and single-concept). Wall-free is deliberate: the only obstruction in
 *   the level is then a *rule* object, so the portal's effect cannot be masked by
 *   geometry — and the board carries no parity-dead-wall warning.
 * - **switch tile** — an odd-Manhattan tile on the natural row, so its
 *   `activePhase` can be `A` and it really fires (ADR-0009 decision 1 + F2): the
 *   latch has to be live, and it has to sit *on the route*, not beside it.
 * - **door tile + colour** — the door is where the latch earns its keep: it must
 *   stand in the goal approach in a phase that is *closed* for its colour until the
 *   switch has fired, otherwise M1 is decoration and the policy rejects it.
 * - **pair + channel phase** — the two ends must be on opposite checkerboard
 *   colours (ADR-0009 decision 5: a same-colour pair is inert and the validator
 *   hard-rejects it — probe 1), must not overlap the door/switch/goal tiles, and
 *   the channel must be alive in the phase that the par route actually enters it
 *   in. Which of the two phases that is, is *measured*, not guessed: the whole
 *   point of the family is that the solver decides.
 */
const SKELETON = {
  width: 7,
  height: 3,
  startPhase: "A" as Phase,
  player: coord(0, 1),
  goal: coord(6, 0),
};

const SWITCH_TILES: readonly Coord[] = [coord(1, 1), coord(2, 2)];
const DOOR_TILES: readonly Coord[] = [coord(5, 0), coord(6, 1)];
const DOOR_COLORS: readonly DoorDef["color"][] = ["blue", "red"];
const PAIRS: ReadonlyArray<readonly [Coord, Coord]> = [
  [coord(2, 1), coord(4, 0)],
  [coord(2, 1), coord(6, 0)],
  [coord(3, 2), coord(4, 0)],
];
const CHANNEL_PHASES: readonly Phase[] = ["B", "A"];

function* familyL11(): Generator<Candidate> {
  for (const sw of SWITCH_TILES) {
    for (const dt of DOOR_TILES) {
      for (const color of DOOR_COLORS) {
        for (const pair of PAIRS) {
          for (const phase of CHANNEL_PHASES) {
            yield {
              axes: `switch=${coordKey(sw)} door=${coordKey(dt)}/${color} p=${coordKey(pair[0])}<>${coordKey(pair[1])}/${phase}`,
              level: {
                id: 11,
                ...SKELETON,
                phaseAWalls: [],
                phaseBWalls: [],
                doors: [doorDef("d1", color, [dt])],
                switches: [
                  {
                    id: "s1",
                    tile: sw,
                    activePhase: entryPhaseOf(
                      SKELETON.startPhase,
                      SKELETON.player,
                      sw,
                    ),
                    targets: ["d1"],
                  },
                ],
                portals: [{ id: "p1", pair, activePhase: phase }],
              },
            };
          }
        }
      }
    }
  }
}

/**
 * The **seeded axis**: the pair drawn from the recorded placement lattice instead of
 * the product above. Both axes are the same *shape* of proposal ("put the channel on
 * the row, between the switch and the door"), so drawing from the lattice is a
 * variant of the recorded family rather than a different family — and the draw is
 * seeded, so the record is reproducible.
 */
const PAIR_LATTICE: readonly Coord[] = [
  coord(2, 1),
  coord(2, 0),
  coord(3, 0),
  coord(3, 2),
  coord(4, 0),
  coord(4, 2),
];
const PAIR_PARTNERS: readonly Coord[] = [
  coord(4, 0),
  coord(6, 0),
  coord(6, 2),
  coord(4, 2),
];

function seededPair(rng: () => number): readonly [Coord, Coord] {
  // Only lattice points that *have* an opposite-colour partner can host one end: the
  // lattice is the recorded placement axis and the pairing rule is the validator's own
  // (ADR-0009 decision 5), so a draw that could not be validated is not a candidate.
  const hosts = PAIR_LATTICE.filter((a) =>
    PAIR_PARTNERS.some((b) => (a[0] + a[1]) % 2 !== (b[0] + b[1]) % 2),
  );
  const a = hosts[Math.floor(rng() * hosts.length)] as Coord;
  const candidates = PAIR_PARTNERS.filter(
    (b) => (a[0] + a[1]) % 2 !== (b[0] + b[1]) % 2, // opposite colour only
  );
  const b = candidates[Math.floor(rng() * candidates.length)] as Coord;
  return [a, b];
}

const SEEDED_VARIANTS = 6;

// ─────────────────────────────────────────────────────────────────────────────
// The program gate
// ─────────────────────────────────────────────────────────────────────────────

interface Outcome {
  readonly accepted: boolean;
  readonly reason: string;
  /**
   * The machine-readable policy codes, when the rejection came from
   * `@/core/solver/policy` (the probes read these, never the prose of `reason`).
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
  // The seam law is reported *on accept*, so the shipped number is visible in the
  // record and not only in the tests. It is **not** re-checked here: the bound lives in
  // `@/core/solver/policy` (`portal-seam-law-execution-axis`, on
  // {@link PORTAL_DEBUT_EXEC_BUDGET}) and one condition must have one implementation —
  // a second copy in this script would be a second truth source. This script reports.
  const dexec = audit.difficulty.Dexec;
  return {
    outcome: {
      accepted: true,
      reason: `par=${String(result.shortestSolution)} Dexec=${dexec === null ? "n/a" : dexec.toFixed(4)}`,
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
      .map((p) => `${p.id}:${coordKey(p.pair[0])}>${coordKey(p.pair[1])}:${p.activePhase}`)
      .sort(),
    par: level.par,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────────────

const SHIPPED_PATH = join(LEVELS_DIR, "l011.json");
const shippedCanon = canonical(JSON.parse(readFileSync(SHIPPED_PATH, "utf8")));

console.log(
  "Phase Shift: Echo Grid — LV-008 candidate generator (l011, the M2 portal debut)",
);
console.log(
  `seed=${SEED} · gate: zod → validateLevel → BFS(explore+analyse) → par=solver → policy/lesson gates (portal-aha-2) → seam law → accept/reject`,
);
console.log(
  "rejection is never repaired (ADR-0004): the candidate is named and dropped",
);
console.log("");

const rejectHistogram = new Map<string, number>();
let accepted = 0;
let total = 0;
let shippedMatched = false;

function report(candidate: Candidate, level: Level | null, outcome: Outcome): void {
  total += 1;
  if (!outcome.accepted || level === null) {
    // Bucket on the *specific* machine-readable reason (`policy:gate-portal-par-cap`,
    // `rules`, `schema`, `dead-states`, …) rather than on the family prefix, so the
    // histogram says which check did the filtering.
    const bucket = (outcome.reason.split(":")[0] === "policy"
      ? outcome.codes?.[0]
      : outcome.reason) ?? outcome.reason;
    rejectHistogram.set(bucket, (rejectHistogram.get(bucket) ?? 0) + 1);
    console.log(
      `  REJECT l011  ${candidate.axes.padEnd(52)} ${outcome.reason}`,
    );
    return;
  }
  accepted += 1;
  const matches = canonical(level) === shippedCanon;
  if (matches) shippedMatched = true;
  console.log(
    `  ACCEPT l011  ${candidate.axes.padEnd(52)} ${outcome.reason} · ` +
      `${level.width}x${level.height} shipped=${matches ? "MATCH" : "variant"}`,
  );
}

for (const candidate of familyL11()) {
  const { outcome, level } = judge(candidate.level);
  report(candidate, level, outcome);
}

// The seeded axis: same template, the pair drawn from the recorded lattice. It is
// expected to be much noisier than the product above (a random pair is usually in the
// wrong place for the route) — that is the point of recording it: it shows the accept
// rate is a property of the *designed* placement, not of the template shape.
const rng = makeRng(SEED + 11);
for (let i = 0; i < SEEDED_VARIANTS; i += 1) {
  const pair = seededPair(rng);
  const candidate: Candidate = {
    axes: `seeded#${String(i + 1)} p=${coordKey(pair[0])}<>${coordKey(pair[1])}/B`,
    level: {
      id: 11,
      ...SKELETON,
      phaseAWalls: [],
      phaseBWalls: [],
      doors: [doorDef("d1", "blue", [coord(5, 0)])],
      switches: [
        { id: "s1", tile: coord(1, 1), activePhase: "A", targets: ["d1"] },
      ],
      portals: [{ id: "p1", pair, activePhase: "B" }],
    },
  };
  const { outcome, level } = judge(candidate.level);
  report(candidate, level, outcome);
}

console.log("");
console.log(
  `  — M2 debut family (wall-free 7x3 north-jump skeleton + the M1+M3 unit on the route): ` +
    `${accepted}/${total} accepted · shipped file re-derived by the program: ${shippedMatched ? "YES" : "NO"}`,
);
console.log("");
if (!shippedMatched) {
  throw new Error(
    "l011.json is not an accepted candidate of the recorded family — the shipped level was " +
      "hand-edited after proof, which this pipeline must never allow",
  );
}

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
// accept-only generator proves nothing about its gate, so these candidates are
// *designed* to be bad and the script fails loudly if any of them is accepted.
// Both are plausible authoring mistakes for a portal debut, not strawmen:
//
//   1. a **same-colour** pair — `(6,2)` and `(0,2)` have the same `(x + y)` parity (8 and 2,
//      both even), so the pair
//      can never move the player between phase classes: it is M2 drawn on the board
//      and mechanically nothing (ADR-0009 decision 5). The rejection belongs to the
//      level layer (a hard *error*, not a warning), which is why this probe asserts
//      on `validateLevel` and not on a policy code;
//   2. a **bypassable** portal — the channel re-declared in the phase the par route
//      never stands in, so every shortest route walks the whole way and the level
//      teaches a mechanic it does not use. This is the "no false routes" half of the
//      debut's construction floor, and it is a *policy* rejection.
// ─────────────────────────────────────────────────────────────────────────────

const SAME_COLOUR_PROBE: Level = {
  id: 11,
  ...SKELETON,
  phaseAWalls: [],
  phaseBWalls: [],
  doors: [doorDef("d1", "blue", [coord(5, 0)])],
  switches: [{ id: "s1", tile: coord(1, 1), activePhase: "A", targets: ["d1"] }],
  portals: [{ id: "p1", pair: [coord(6, 2), coord(0, 2)], activePhase: "B" }],
  par: 1, // never trusted: `judge` re-derives it from the solver
};

const BYPASS_PROBE: Level = {
  id: 11,
  ...SKELETON,
  goal: coord(4, 1),
  phaseAWalls: [],
  phaseBWalls: [],
  doors: [doorDef("d1", "blue", [coord(5, 0)])],
  switches: [{ id: "s1", tile: coord(1, 1), activePhase: "A", targets: ["d1"] }],
  portals: [{ id: "p1", pair: [coord(2, 1), coord(4, 0)], activePhase: "A" }],
  par: 1,
};

console.log("negative probes (must all be REJECTED by name, never repaired):");

const sameColour = judge(SAME_COLOUR_PROBE);
const sameColourVerdict = validateLevel(SAME_COLOUR_PROBE as unknown);
const sameColourOk =
  !sameColour.outcome.accepted &&
  !sameColourVerdict.ok &&
  sameColourVerdict.errors.some((error) => /parity|colour|color|inert/i.test(error));
console.log(
  `  ${sameColourOk ? "OK  " : "FAIL"} probe: same-colour pair (inert M2)              expected=rules:…parity… got=${sameColour.outcome.reason}`,
);

const bypass = judge(BYPASS_PROBE);
const bypassCodes = bypass.outcome.codes ?? [bypass.outcome.reason];
const bypassOk =
  !bypass.outcome.accepted &&
  bypassCodes.includes("policy:gate-portal-crossing-on-every-par-route");
console.log(
  `  ${bypassOk ? "OK  " : "FAIL"} probe: bypassable portal (channel dead on par)     expected=policy:gate-portal-crossing-on-every-par-route got=${bypassCodes.join(" ")}`,
);

const probes = [
  { ok: sameColourOk, label: "same-colour pair" },
  { ok: bypassOk, label: "bypassable portal" },
];
const rejected = probes.filter((probe) => probe.ok).length;
if (rejected !== probes.length) {
  throw new Error(
    `only ${rejected}/${probes.length} negative probes were rejected by name — the level gates are not ` +
      `enforcing what they claim, so every "accept" above is worthless evidence`,
  );
}
console.log("");
console.log(
  `summary: l011 re-derived from the recorded M2 debut family (seed ${SEED}, ${total} candidates); ` +
    `shipped file MATCH an accepted candidate; ${rejected}/${probes.length} negative probes rejected by name; ` +
    `rejections are named, never repaired. The seam law budget used here (${PORTAL_DEBUT_EXEC_BUDGET}) is the ` +
    `pre-registered one, read from the shipped l010 board — not a constant chosen after the fact.`,
);
/**
 * LV-005 — "one tile is both a door and a phase wall" must be a HARD ERROR.
 *
 * Why this exists (evidence, not taste): `docs/ui-ux.md` §3.1 enumerates every
 * cell as **exactly one** class (empty / wall / door / portal / switch / goal),
 * a wall tile is drawn in **both** phases (solid in its own phase, hollow echo
 * in the other — §3.1a R-E3), and a door's open/closed state is a **second,
 * independent** state (§3.1b R-D1). The shipped renderer draws the wall and no
 * door object yet (`src/game/renderer/**`). So on an overlap tile the wall
 * speaks for the door: while the wall echoes, the cell reads **hollow**
 * ("passable now" under the §3.2 fill rule R-C2) although a door closed in that
 * phase still refuses entry — a tile that promises a legal move and answers
 * "illegal". Adjudication: reject at the data layer, never "the door swallows
 * the wall" (`docs/ai-native-pipeline.md` §3b); appearance precedence stays
 * `docs/ui-ux.md`'s call.
 *
 * Four parts:
 *  1. **counterexamples** — door ∩ A-wall, door ∩ B-wall, door ∩ both-phase
 *     wall, and a multi-tile door with only one tile on a wall: all rejected,
 *     each message naming the door path and the coordinate, none auto-repaired;
 *  2. **the overlap class, measured with the real BFS** — a tile's click phase is
 *     pinned by the checkerboard invariant (ADR-0009), so per tile exactly one of
 *     the four (wall phase × door colour) overlaps reproduces the lie; the table
 *     is measured, never asserted from prose;
 *  3. **positive controls** — door on an empty tile, switch on an empty tile, an
 *     opposite-parity portal pair, a door merely *adjacent* to a wall, a
 *     wall-free latch: still accepted (no friendly fire);
 *  4. **the shipped level set** is not falsely rejected.
 *
 * `tests/**` never imports the renderer: the "hollow" claim is asserted on core
 * data only (entry refused while the tile is **not** a solid wall in the current
 * phase, i.e. the wall object there is in its echo state). The wall-vs-door
 * drawing facts are cited, not re-tested here.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import type { Coord, Level } from "@/core/level";
import { validateLevel } from "@/core/level";
import { isWallSolidAt, resolveDoorsOpen, solidAt } from "@/core/rules";
import type { Direction } from "@/core/state/move";
import { DIRECTIONS, step } from "@/core/state/move";
import type { Phase } from "@/core/state/phase";
import { explore, movePath } from "@/core/solver/bfs";

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures — local and explicit, so this suite does not depend on other files
// ─────────────────────────────────────────────────────────────────────────────

/** A raw (pre-parse) candidate at the validator boundary, like an LLM proposal. */
function rawLevel(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: 91,
    width: 5,
    height: 3,
    startPhase: "A",
    player: [0, 1],
    goal: [4, 1],
    phaseAWalls: [],
    phaseBWalls: [],
    doors: [],
    switches: [],
    portals: [],
    par: 4,
    ...overrides,
  };
}

/** Typed board used for the BFS measurement (5 × 3, player (0,1) → goal (4,1)). */
function board(overrides: Partial<Level> = {}): Level {
  return {
    id: 91,
    width: 5,
    height: 3,
    startPhase: "A",
    player: [0, 1] as Coord,
    goal: [4, 1] as Coord,
    phaseAWalls: [],
    phaseBWalls: [],
    doors: [],
    switches: [],
    portals: [],
    par: 4,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Counterexamples — all rejected, by name, never repaired
// ─────────────────────────────────────────────────────────────────────────────

interface OverlapCase {
  name: string;
  /** A rejection message must match this (path + coordinate + the wall list). */
  expect: RegExp;
  level: Record<string, unknown>;
}

const OVERLAP_CASES: OverlapCase[] = [
  {
    name: "door-on-phase-a-wall",
    expect:
      /doors\[0\] "d1"\.tiles\[0\] \(3, 1\) is also listed in phaseAWalls/,
    level: rawLevel({
      phaseAWalls: [[3, 1]],
      doors: [{ id: "d1", color: "red", tiles: [[3, 1]] }],
    }),
  },
  {
    name: "door-on-phase-b-wall",
    expect:
      /doors\[0\] "d1"\.tiles\[0\] \(3, 1\) is also listed in phaseBWalls/,
    level: rawLevel({
      phaseBWalls: [[3, 1]],
      doors: [{ id: "d1", color: "blue", tiles: [[3, 1]] }],
    }),
  },
  {
    name: "door-on-both-phase-walls",
    expect:
      /doors\[0\] "d1"\.tiles\[0\] \(2, 0\) is also listed in phaseAWalls and phaseBWalls/,
    level: rawLevel({
      phaseAWalls: [[2, 0]],
      phaseBWalls: [[2, 0]],
      doors: [{ id: "d1", color: "red", tiles: [[2, 0]] }],
    }),
  },
  {
    name: "multi-tile-door-one-tile-on-a-wall",
    expect:
      /doors\[0\] "d1"\.tiles\[1\] \(3, 1\) is also listed in phaseBWalls/,
    level: rawLevel({
      phaseBWalls: [[3, 1]],
      doors: [
        {
          id: "d1",
          color: "blue",
          tiles: [
            [1, 0],
            [3, 1],
          ],
        },
      ],
    }),
  },
];

describe("LV-005 — a door tile that is also a phase wall is REJECTED", () => {
  for (const testCase of OVERLAP_CASES) {
    it(`${testCase.name} — rejected by name, coordinate included, unmodified`, () => {
      const before = JSON.stringify(testCase.level);
      const result = validateLevel(testCase.level);

      expect(result.ok, `${testCase.name} must be rejected`).toBe(false);
      const named = result.errors.filter((error) =>
        testCase.expect.test(error),
      );
      expect(
        named,
        `${testCase.name} must name ${String(testCase.expect)}; got:\n${result.errors.join("\n")}`,
      ).not.toEqual([]);
      // ADR-0004 — a verdict, not a repair.
      expect(JSON.stringify(testCase.level)).toBe(before);
    });
  }

  it("names the lie (hollow-but-refusing) and the adjudication in the message", () => {
    const result = validateLevel(OVERLAP_CASES[0]?.level ?? rawLevel());
    const message = result.errors.find((error) =>
      /is also listed in phaseAWalls/.test(error),
    );
    expect(message, JSON.stringify(result.errors)).toBeDefined();
    expect(message).toMatch(/hollow/);
    expect(message).toMatch(/refuses entry/);
    expect(message).toMatch(/docs\/ui-ux\.md §3\.2/);
    expect(message).toMatch(/docs\/ai-native-pipeline\.md §3b/);
    // The appearance-precedence ruling is explicitly NOT invented in the validator.
    expect(message).toMatch(/NOT an appearance-precedence rule/);
  });

  it("does not flag the clean tiles of a partially-overlapping door", () => {
    const result = validateLevel(OVERLAP_CASES[3]?.level ?? rawLevel());
    const overlapErrors = result.errors.filter((error) =>
      /is also listed in phase/.test(error),
    );
    expect(overlapErrors).toHaveLength(1);
    expect(overlapErrors[0]).toMatch(/tiles\[1\] \(3, 1\)/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. The overlap class, measured with the real BFS
// ─────────────────────────────────────────────────────────────────────────────

/** One reachable state in which `tile` is clicked and refused although no solid wall is on it. */
interface LieObservation {
  readonly phase: Phase;
  readonly moves: readonly Direction[];
  readonly doorsOpen: Readonly<Record<string, boolean>>;
}

interface ClickObservation {
  readonly reachableStates: number;
  readonly clicks: number;
  readonly refused: number;
  readonly lies: readonly LieObservation[];
}

/**
 * Every reachable state whose *click* targets `tile`, split by outcome.
 *
 * A "lie" is a refused click in a state where `isWallSolidAt(tile)` is false:
 * the wall object on that tile is in its echo state — rendered **hollow**, i.e.
 * "passable now" under `docs/ui-ux.md` §3.2 R-C2 — while the shipped rules still
 * refuse the entry. The refusal cause is cross-checked against `solidAt`, so the
 * claim rests on the real rules engine, not on this comment.
 */
function observeClicks(level: Level, tile: Coord): ClickObservation {
  const graph = explore(level);
  const lies: LieObservation[] = [];
  let clicks = 0;
  let refused = 0;

  for (const [i, state] of graph.nodes.entries()) {
    const mask = graph.legalMask[i] ?? 0;
    for (let d = 0; d < DIRECTIONS.length; d += 1) {
      const clicked = step(state.player, DIRECTIONS[d] as Direction);
      if (clicked.x !== tile[0] || clicked.y !== tile[1]) continue;
      clicks += 1;
      if ((mask & (1 << d)) !== 0) continue; // legal move — the board read is honest
      refused += 1;
      if (isWallSolidAt(level, state.phase, clicked)) continue; // rendered solid: honest refusal
      const doorsOpen = resolveDoorsOpen(level, state.phase, state.switchesOn);
      expect(solidAt(level, state.phase, doorsOpen, clicked)).toBe(true);
      lies.push({ phase: state.phase, moves: movePath(graph, i), doorsOpen });
    }
  }

  return { reachableStates: graph.nodes.length, clicks, refused, lies };
}

describe("LV-005 — the measured lie: a hollow tile that refuses entry", () => {
  /**
   * `(3,1)` is at Manhattan distance 3 from the start and `(2,1)` at distance 2,
   * so by the checkerboard invariant (ADR-0009) every click onto `(3,1)` happens
   * in phase A and every click onto `(2,1)` in phase B. Per tile, only ONE of the
   * four (wall phase × door colour) overlaps can lie — and it lies on *every*
   * move count, which is exactly why this is a data-layer verdict and not a
   * per-state one. The expectations below are measured by the BFS in this suite.
   */
  const ENTRY_PHASE_A: Coord = [3, 1];
  const ENTRY_PHASE_B: Coord = [2, 1];

  const table: ReadonlyArray<
    readonly [
      what: string,
      tile: Coord,
      wallPhase: Phase,
      color: "red" | "blue",
      expectLie: boolean,
    ]
  > = [
    ["entry-A tile · A-wall · red door", ENTRY_PHASE_A, "A", "red", false],
    ["entry-A tile · A-wall · blue door", ENTRY_PHASE_A, "A", "blue", false],
    ["entry-A tile · B-wall · red door", ENTRY_PHASE_A, "B", "red", false],
    ["entry-A tile · B-wall · blue door", ENTRY_PHASE_A, "B", "blue", true],
    ["entry-B tile · A-wall · red door", ENTRY_PHASE_B, "A", "red", true],
    ["entry-B tile · A-wall · blue door", ENTRY_PHASE_B, "A", "blue", false],
    ["entry-B tile · B-wall · red door", ENTRY_PHASE_B, "B", "red", false],
    ["entry-B tile · B-wall · blue door", ENTRY_PHASE_B, "B", "blue", false],
  ];

  for (const [what, tile, wallPhase, color, expectLie] of table) {
    it(`${what} — lie ${expectLie ? "REPRODUCED" : "not possible"}`, () => {
      const level = board({
        phaseAWalls: wallPhase === "A" ? [tile] : [],
        phaseBWalls: wallPhase === "B" ? [tile] : [],
        doors: [{ id: "d1", color, tiles: [tile] }],
      });
      // The board is content-rejected (LV-005) — that is the point; it stays
      // explorable, which is how the failure it is rejected for is measured.
      expect(validateLevel(level).ok).toBe(false);

      const observed = observeClicks(level, tile);
      console.log(
        `[LV-005] ${what}: reachableStates=${observed.reachableStates} clicks-on-tile=${observed.clicks} refused=${observed.refused} hollow-but-refusing=${observed.lies.length}`,
      );

      expect(
        observed.clicks,
        "the tile must be clickable from a reachable state",
      ).toBeGreaterThan(0);
      if (!expectLie) {
        expect(observed.lies, what).toEqual([]);
        return;
      }

      expect(observed.lies.length, what).toBeGreaterThan(0);
      // Every lying click happens in the tile's own parity-pinned click phase.
      const phases = new Set(observed.lies.map((lie) => lie.phase));
      expect([...phases]).toEqual([wallPhase === "A" ? "B" : "A"]);
      for (const lie of observed.lies) {
        console.log(
          `[LV-005]   lie: moves=[${lie.moves.join(" ") || "<start>"}] phase=${lie.phase} doorsOpen=${JSON.stringify(lie.doorsOpen)} → tile (${tile[0]}, ${tile[1]}) reads HOLLOW (wall echo; no door object is drawn there) and REFUSES entry`,
        );
      }
    });
  }

  it("a latch board can lie from only SOME of its reachable states", () => {
    // An M1+M3 latch makes door openness history-dependent, so the same tile is
    // refused in one reachable state and accepted in another. The overlap is
    // rejected anyway: no schema can express "misleading only in some states".
    const level = board({
      phaseBWalls: [[3, 1] as Coord],
      doors: [{ id: "d1", color: "blue", tiles: [[3, 1] as Coord] }],
      // (1,1) is at odd Manhattan distance ⇒ stepped on in phase A, so the switch
      // fires (blue door at (3,1): closed in A, opened by the latch).
      switches: [
        { id: "s1", tile: [1, 1] as Coord, activePhase: "A", targets: ["d1"] },
      ],
    });
    expect(validateLevel(level).ok).toBe(false); // door ∩ B-wall ⇒ rejected

    const observed = observeClicks(level, [3, 1]);
    console.log(
      `[LV-005] latch board: reachableStates=${observed.reachableStates} clicks-on-(3,1)=${observed.clicks} refused=${observed.refused} hollow-but-refusing=${observed.lies.length}`,
    );

    expect(observed.clicks).toBeGreaterThan(0);
    expect(observed.refused).toBeGreaterThan(0); // switch off ⇒ hollow and refused
    expect(observed.refused).toBeLessThan(observed.clicks); // switch on ⇒ passable
    expect(observed.lies.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3 + 4. Positive controls — no friendly fire
// ─────────────────────────────────────────────────────────────────────────────

describe("LV-005 — positive controls stay accepted", () => {
  const accepted: ReadonlyArray<
    readonly [name: string, level: Record<string, unknown>]
  > = [
    [
      "door on an empty tile",
      rawLevel({ doors: [{ id: "d1", color: "red", tiles: [[2, 0]] }] }),
    ],
    [
      "switch on an empty tile (door elsewhere)",
      rawLevel({
        doors: [{ id: "d1", color: "red", tiles: [[3, 1]] }],
        switches: [
          { id: "s1", tile: [1, 0], activePhase: "A", targets: ["d1"] },
        ],
      }),
    ],
    [
      "opposite-(x+y)-parity portal pair, door elsewhere",
      rawLevel({
        doors: [{ id: "d1", color: "blue", tiles: [[0, 0]] }],
        portals: [
          {
            id: "p1",
            pair: [
              [1, 0],
              [2, 2],
            ],
            activePhase: "A",
          },
        ],
      }),
    ],
    [
      "door merely ADJACENT to a wall (not on it)",
      rawLevel({
        phaseAWalls: [[3, 1]],
        phaseBWalls: [[3, 0]],
        doors: [
          {
            id: "d1",
            color: "blue",
            tiles: [
              [2, 1],
              [3, 2],
            ],
          },
        ],
      }),
    ],
    [
      "door + wall-free switch latch",
      rawLevel({
        phaseAWalls: [[4, 0]],
        doors: [{ id: "d1", color: "red", tiles: [[3, 1]] }],
        switches: [
          { id: "s1", tile: [2, 0], activePhase: "A", targets: ["d1"] },
        ],
      }),
    ],
  ];

  for (const [name, level] of accepted) {
    it(`${name} — accepted`, () => {
      const result = validateLevel(level);
      expect(
        result.ok,
        `${name} must stay accepted; errors:\n${result.errors.join("\n")}`,
      ).toBe(true);
      expect(result.errors).toEqual([]);
    });
  }
});

describe("LV-005 — the shipped level set is not falsely rejected", () => {
  const levelsDir = fileURLToPath(
    new URL("../../src/levels/", import.meta.url),
  );
  const files = readdirSync(levelsDir)
    .filter((name) => name.endsWith(".json"))
    .sort();

  it(`all ${String(files.length)} shipped levels still validate`, () => {
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const raw = JSON.parse(
        readFileSync(join(levelsDir, file), "utf8"),
      ) as unknown;
      const result = validateLevel(raw);
      expect(
        result.ok,
        `${file} must validate; errors:\n${result.errors.join("\n")}`,
      ).toBe(true);
      expect(result.errors).toEqual([]);
    }
  });
});

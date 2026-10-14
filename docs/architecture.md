# Architecture — Phase Shift: Echo Grid

> Owner: **Agent 2 — Technical Architect**
> Version: **V0.4**
> Date: 2026-10-14
> Status: **LOCKED for prototype**

---

## 1. Goals & constraints

1. Runs directly in a browser (no install), desktop + mobile.
2. Game rules are **pure TypeScript** and run with zero Phaser dependency, so the Solver can reuse the exact same rules engine.
3. Levels are **data-driven** and schema-validated.
4. Level generation / solvability / difficulty must be scriptable (AI pipeline writes and reads JSON).
5. Keep it small: this is a competition prototype, not an engine.

## 2. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Language | **TypeScript** | type safety for level schema + rules |
| Renderer | **Phaser 3** | mature 2D, known performance on mobile web |
| Build/dev | **Vite** | fast HMR, tiny config, static output |
| Unit/solver tests | **Vitest** | fast, TS-native |
| E2E / mobile tests | **Playwright** | real browser + device viewport emulation |
| Schema validation | **zod** | single source of truth for Level schema + runtime validation |

## 3. Repository structure

```
src/
  core/                     # PURE LOGIC — no Phaser imports allowed
    state/                  # GameState, reducers, transitions
    rules/                  # movement, collision, phase resolution
    level/                  # schema, loader, validation
    solver/                 # BFS solver only until profiled (A* deferred, §13), difficulty metrics
  game/                     # Phaser layer
    scenes/                 # Boot, Level, HUD
    systems/                # input, animation, audio
    entities/               # player view, wall view, door view, portal view
    renderer/               # grid <-> world coordinate mapping, phase visuals
    input/                  # tap / swipe -> MOVE(direction)
  ui/                       # overlay, level select, buttons
  levels/                   # generated level JSON (data, not code)
  assets/                   # user-supplied art (ASSET GATE)

tests/
  unit/                     # rules, state, schema
  solver/                   # BFS correctness, known-solvable/unsolvable fixtures
  integration/              # rules + loader + solver
  e2e/                      # Playwright: load, move, win, restart, mobile viewport

scripts/
  generate-levels/          # LLM candidate -> validate -> solve -> difficulty -> accept/reject
  validate-levels/          # schema + rule validation over the whole level set
  difficulty/               # recompute difficulty curve, emit report

docs/
  ...                       # this documentation set
```

## 4. Dependency direction (hard rule)

```
        Renderer (Phaser scenes / entities)
                 ↑
             Gameplay (input, animation, view binding)
                 ↑
        Core Logic (state / rules / level)   ←──  Solver
                 ↑                                 │
            Level JSON  ───────────────────────────┘
```

- **Core must not import Phaser.** Enforced by the automated import-boundary test specified in §12.1 (a hard CI gate, not a convention).
- **Solver only depends on Core.** `Solver → Phaser Scene` is forbidden (same test, extended to `src/core/solver/**`).
- Game logic must be runnable **without any Sprite existing** — this is what makes automated verification possible.

## 5. Core state model

```ts
type Phase = "A" | "B";
type Vec = { x: number; y: number };

// All tile coordinates are [x, y], 0-indexed from the top-left corner.
interface LevelDef {
  id: number;                       // int ≥ 1
  width: number;
  height: number;
  startPhase: Phase;
  player: [x: number, y: number];
  goal: [x: number, y: number];
  phaseAWalls: [x: number, y: number][];
  phaseBWalls: [x: number, y: number][];
  doors: DoorDef[];
  switches: SwitchDef[];
  portals: PortalDef[];
  par: number;                      // REQUIRED, int ≥ 1 — carried by the level file;
                                    // "perfect clear" target stamped from the Solver's
                                    // shortestSolution; display-only, never a fail
                                    // condition (docs/level-design.md §1)
}

interface GameState {
  levelId: number;
  playerPosition: Vec;
  phase: Phase;
  levelState: {
    doorsOpen: Record<string, boolean>;   // ABSOLUTE post-resolution openness:
                                          // recomputed from (door.color, current phase,
                                          // switchesOn) at every phase resolution
                                          // (applyMove step 5) — never carried
                                          // incrementally between moves
    switchesOn: Record<string, boolean>;  // latched toggle state: flips only when the
                                          // player ENTERS the switch tile while its
                                          // activePhase is current (applyMove step 3)
  };
  objects: {           // derived, phase-resolved occupancy cache
    walls: Vec[];
    portals: PortalDef[];
  };
  moveCount: number;
  history: Snapshot[]; // for Undo
  status: "playing" | "won";
}
```

> `DoorDef` / `SwitchDef` / `PortalDef` shapes are deliberately **not** duplicated here — they are defined field-by-field in `docs/level-design.md` §1 and owned by the zod schema (§7). This file owns only the core type skeleton.

Design intent: `GameState` is **serializable and diff-able**, so it can be hashed for BFS visited-sets and replayed deterministically.

## 6. Rules engine (pure functions)

```ts
type Move = { dir: "up" | "down" | "left" | "right" };

// minimum searchable state for the solver
interface SearchState {
  player: Vec;
  phase: Phase;
  doorsOpen: Record<string, boolean>;
  switchesOn: Record<string, boolean>;
}

function isLegalMove(level: LevelDef, s: SearchState, m: Move): boolean;
function applyMove(level: LevelDef, s: SearchState, m: Move): SearchState;
function isGoal(level: LevelDef, s: SearchState): boolean;
function hashState(s: SearchState): string;
```

### 6.1 Illegal-move semantics (LOCKED — GATE C human decision, Option B, 2026-10-14; supersedes ADR-0006 condition 3)

Legality depends **only on the current phase**. A move `m` from state `s` is **illegal** if either of the following holds:

1. **Out of bounds** — the target cell is outside the grid.
2. **Blocked in current phase** — the target cell is solid in the **current** phase: a wall active in the current phase, or a door closed in the current phase. Doors and walls share one solidity semantics.

There is **no post-flip legality check**. After a legal move resolves and the phase flips, the player may be standing inside a cell that is solid in the new phase. That is a **legal, stable state**: the player is not crushed, not pushed, not randomly relocated — the board simply has a solid cell at the player's position until the next move.

An illegal move returns the **same state**: no movement, no interaction side effects, and **no phase flip**. The flip is a consequence of a legal move only — an illegal move never consumes it. Callers may rely on structural equality (`applyMove` result deep-equals the input); implementations may return the identical object reference.

A player standing inside a solid-in-current-phase cell **may move out**: the destination is judged by the same rule — it must be in-bounds and non-solid in the current phase. Being inside a solid cell never blocks the player's own moves; only the destination is checked.

> Supersession chain: the V0.1 rule "the player is never covered / incoming walls are suppressed on the player's tile" was replaced by ADR-0006's post-flip standing check (V0.2–V0.3); **GATE C / Option B (2026-10-14) removes that check**. Walls are still never suppressed, and the player is still never crushed, pushed, or randomly relocated — what changed is that standing inside a solid cell is a legal outcome rather than grounds for refusing the causing move.

### 6.2 `applyMove` step order (single truth source)

`applyMove` executes these steps **in this exact order**. Gameplay and the Solver both call this one function — neither may re-implement or reorder it:

```
1. Validate Move          — target in-bounds and non-solid in the CURRENT phase
                            (no wall active in the current phase, no door closed
                            in the current phase; §6.1)?
                            → illegal: return s unchanged (no movement, no flip)
2. Move Player            — set player position to the target cell
3. Resolve Interaction    — switches toggled / portals teleported, in the
                            CURRENT phase, post-move, on entering the tile only
                            (no chains, no re-trigger while standing)
4. Flip Phase             — A→B or B→A
5. Resolve Phase Effects  — recompute which walls / doors / portals are active
                            in the NEW phase; recompute doorsOpen absolutely from
                            (door.color, new phase, switchesOn).
                            NO retrospective rollback: if the player is now
                            standing inside a cell solid in the new phase, that
                            state is legal and kept (§6.1)
6. Check Win              — the level is WON iff the player stands on the goal
                            tile in this fully-resolved post-move state,
                            REGARDLESS of phase. isGoal = position equality with
                            no phase term (the goal is one tile, active in both
                            phases). Evaluated only after steps 1–5 complete
                            (game-design.md §3.1)
```

Implementation contract: the only illegal condition is at step 1; once validation passes, steps 2–6 always complete — there is no later failure path and no rollback machinery. `isLegalMove(level, s, m)` is defined as the predicate "applyMove completes without hitting an illegal condition," which under Option B reduces to the §6.1 current-phase check. An allocation-free pre-check implementation is allowed, but a property test MUST pin `isLegalMove(s, m) ⟺ applyMove(s, m) ≢ s` over generated states — including states where the player stands inside a current-phase-solid cell — so the two can never diverge.

Interaction semantics pinned by step 3 / step 5 (normative — one definition, shared by Gameplay and Solver):

- **Switch** — entering a switch tile while its `activePhase` is the current phase toggles `switchesOn[id]`. Leaving the tile, or standing on it in the other phase, does nothing.
- **Portal** — a portal teleports **only on the entering move**: when a step lands on a portal end while the portal's `activePhase` is current, the player is moved to the paired end. The landing tile must pass the same current-phase solidity checks as a normal move; the far end does NOT chain-trigger (no portal-to-portal chains within one move). Standing on a portal tile later — including when the flip activates the portal under the player — never teleports.
- **Door openness** — `doorsOpen[d]` is an absolute derived value recomputed at step 5 from `(door.color, current phase, switchesOn)` per the door rules of `docs/level-design.md` §1; it is never an incremental carryover from the previous state.

### 6.3 State hash (BFS visited-set)

`hashState` covers **exactly**:

| Field | Canonicalization |
|---|---|
| `player` position | `(x, y)` grid coordinates |
| `phase` | `"A" \| "B"` |
| `doorsOpen` | keys sorted before serialization |
| `switchesOn` | keys sorted before serialization |

Deliberately **excluded**: `moveCount`, `history`, `status` — gameplay bookkeeping, not puzzle state. Including them would break transposition detection and make the visited-set useless.

**Canonical by construction.** Both records are canonical: `switchesOn` changes only at applyMove step 3, and `doorsOpen` is fully recomputed at step 5 (never incremental). Equal logical states therefore always serialize identically — the visited-set can neither split equivalent states nor merge distinct ones, which is what makes BFS over the hashed graph correct.

**Finiteness & determinism (re-argued for Option B).** The reachable state space is bounded by `width × height × 2 × 2^|doors| × 2^|switches|` (portals are static per level and contribute no state bits; every reachable player position is an in-bounds cell, so the bound still holds). Under Option B the legal-move set of a state depends only on data inside `SearchState` — the current phase, the level's static walls, and `doorsOpen` / `switchesOn` for doors — and removing the post-flip check removes a conditional rather than adding one, so `applyMove` remains a pure, deterministic function of `(level, state, move)`. An illegal move contributes **no edge** to the search graph, never a self-loop with a flipped phase.

**Standing inside a solid cell is a normal reachable state** and does not break BFS: such a state has a well-defined, finite set of out-edges (moves to adjacent cells that are in-bounds and non-solid in the current phase), expanded by exactly the same rule as any other state. It is neither terminal by default (if no legal move exists, that is an ordinary dead end, which the difficulty metrics already track) nor special-cased in the hash. The BFS graph is therefore finite and every edge deterministic, so BFS over hashed states terminates and yields the true shortest solution.

## 7. Level schema & validation

- `zod` schema mirrors `LevelDef` — **including the required `par`** (int ≥ 1, stamped by the generator from the Solver's `shortestSolution`; display-only "perfect clear" target, never a fail condition — `docs/level-design.md` §1).
- `scripts/validate-levels` runs over the full set: schema → rule sanity (bounds, start not on wall, goal reachable in *some* phase, no duplicate ids) → solver.
- Generator output that fails = **reject** (never auto-repair into the official set).

## 8. Solver & difficulty (Agent 4)

- **BFS only until profiled** (uniform cost, shortest solution + full solvability). No other search algorithm ships in the prototype.
- **A\* is not designed** (§13): revisit only if profiling shows BFS blowing the budget on shipped level sizes; candidate heuristic = Manhattan distance to goal + phase parity term, to be validated at that time.
- Per-level metrics emitted as JSON:

```json
{
  "id": 27,
  "solvable": true,
  "shortestSolution": 11,
  "numSolutions": 3,
  "averageBranchingFactor": 2.4,
  "deadEndRatio": 0.31,
  "maxSearchDepth": 4,
  "forcedMoveRatio": 0.18,
  "difficultyScore": 46.2
}
```

- `par` (LevelDef, §5) is stamped from `shortestSolution` by the generator pipeline — the level file carries it; the Solver only reports the metric.
- **Option B consequence (GATE C, 2026-10-14):** the V0.2–V0.3 **union property no longer holds** — a phase-wall tile is enterable from the opposite phase, and the flip may leave the player standing inside a wall. Route availability therefore depends on move **parity** (which phase a cell is reached in), and plain phase walls can open and close routes by themselves. Difficulty analysis must not treat phase walls as static obstacles; `deadEndRatio` and lookahead-style signals (e.g. how often the only legal moves flip into a worse board) now carry real meaning and should be weighted accordingly in `difficultyScore`.
- Solver runs in Node (Vitest / script), **never** in the browser game loop during play.

## 9. Rendering & adaptation

- One logical grid → two visual skins (Phase A / Phase B) driven by a **theme token map**, not duplicated scene code.
- Responsive strategy: fixed logical grid, scale-to-fit board container; UI in a separate DOM/HUD layer (HTML overlay) so text stays crisp and accessible on mobile.
- Phase transition: short, cheap cross-fade / color shift. **Must not obscure cell state** (see design readability rule).
- Target: 60fps on mid mobile; no heavy particle systems.

## 10. Event bus

- Light typed event bus between Core and Phaser layer (`move`, `phaseChanged`, `levelWon`, `undo`, `restart`).
- Core emits semantic events; Phaser subscribes. Core never knows how things are drawn.

## 11. Input system

- Single logical action: `MOVE(direction)`.
- Tap on adjacent tile → resolve direction. Swipe → resolve direction.
- One interaction model only. Input maps to `Move`, nothing else.

## 12. Testing strategy

| Layer | Tool | Focus |
|---|---|---|
| Unit | Vitest | rules, phase flip, collision, illegal-move rule (no movement, **no flip consumed**, state structurally unchanged) |
| Boundary | Vitest | import-boundary test (§12.1) — hard CI gate |
| Solver | Vitest | known solvable/unsolvable fixtures, BFS optimality |
| Integration | Vitest | loader + validation + solver together |
| E2E | Playwright | load → move → win → next; restart; undo; mobile viewport |
| Regression | Vitest+Playwright | bug → reproduce → root cause → fix → regression test |

Every bug record: `Reproduce → Root Cause → Fix → Regression Test`.

### 12.1 Import-boundary test (required, automated)

A Vitest suite MUST statically verify the dependency direction and fail the build on violation:

- Scan every source file under `src/core/**` (which includes `src/core/solver/**`); the test fails if any file contains an import of `'phaser'` — matching `from "phaser"`, `import "phaser"`, `require("phaser")`, and `import(...)` dynamic forms.
- The test is **static source analysis** (read files, regex/AST match): no module execution, no browser, no Phaser install needed in the solver environment.
- Suggested location: `tests/unit/import-boundary.test.ts` (owned by QA; the rule itself is owned here).

This test is the enforcement mechanism for ADR-0003. A lint rule may be added later for editor feedback, but the Vitest gate is the source of truth.

## 13. Anti-overengineering (deliberately NOT designed)

This is a competition prototype, not an engine. The following are **intentionally unspecified** — designing them now is scope creep:

| Item | Status | Trigger to revisit |
|---|---|---|
| **A\* solver** | Not designed; **BFS only** until profiling shows a real state-space wall | A level class exceeds BFS budget in `scripts/validate-levels` (measured, not predicted) |
| **Event bus** | Minimal typed emitter only (`move`, `phaseChanged`, `levelWon`, `undo`, `restart`) | A concrete feature needs a new event; no middleware, no wildcard topics, no replayable event log |
| **Animation state machine** | None. Tweened transitions driven directly by events | Only if transitions visibly conflict during playtest |
| **Undo** | Snapshot stack of serialized `GameState` — no command pattern, no inverse-operation algebra | Only if memory profiling on target mobile devices proves snapshots too heavy |
| **Rendering abstractions** | No entity-component system, no plugin architecture; Phaser scenes + plain classes | Never, for this project |
| **Tooling** | No monorepo, no custom build steps beyond Vite defaults | Never, for this project |

If a proposed design introduces a concept not in §3–§12, the burden of proof is on the proposal: name the measured problem it solves.

## 14. Risks

| Risk | Mitigation |
|---|---|
| State-space explosion at large levels | Level size caps + bounded search; A\* only after profiling (§13) |
| Phaser coupling creeping into rules | Import-boundary test in CI (§12.1) |
| Readability loss on mobile | screenshot review + fixed contrast tokens |
| LLM produces invalid levels | zod + rules + solver gate; reject, don't repair |
| `isLegalMove` / `applyMove` drift | property test pinning their equivalence (§6.2) |

## 15. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial architecture: stack, structure, dependency rules, state model, solver boundary | Agent 2 / Orchestrator |
| 2026-10-14 | V0.2 | Aligned §6 with locked illegal-move semantics (GD-001): explicit `isLegalMove` definition, 7-step `applyMove` order (revert-without-flip on player-on-wall), state-hash contract + finiteness proof; added import-boundary test requirement (§12.1); added anti-overengineering section (§13); supersedes V0.1 "wall suppression / never covered" rule | Agent 2 (Architect) |
| 2026-10-14 | V0.3 | RV-001 reconciliation: added required `par` (int ≥ 1) to `LevelDef`, carried by the level file, with §7/§8 consistency notes; post-flip legality check now covers walls **and** closed doors — one rule for both phases (§6.1 c3 / §6.2 step 6); win condition made explicit and phase-independent (§6.2 step 7); `doorsOpen` / `switchesOn` / portal-trigger semantics pinned as canonical-by-construction for `hashState` (§5 / §6.2 / §6.3, ADR-architecture-0001 addendum); `[x, y]` coordinate labels + DoorDef/SwitchDef/PortalDef cross-reference to level-design.md §1 (§5); A* wording unified to "BFS only until profiled" (§3 / §8) | Agent 2 (Architect) |
| 2026-10-14 | V0.4 | GATE C human decision — core rule changed to **Option B**: deleted the post-flip "solid under player" legality check (ADR-0006 condition 3 superseded; see ADR-architecture-0001 addendum 2026-10-14). `isLegalMove` now consults current-phase occupancy only (§6.1); `applyMove` reduced to 6 steps with no retrospective rollback (§6.2); standing inside a solid-in-current-phase cell is a legal, stable state and moving out of it is judged by the same current-phase destination rule (§6.1); §6.3 finiteness/determinism re-argued (hash contract unchanged; solid-standing states are normal BFS nodes); union property gone, routing is parity-dependent, `deadEndRatio`/lookahead metrics gain meaning (§8). Retained invariants: illegal move = identity (no movement, no flip); walls never suppressed; the player is never crushed, pushed, or randomly relocated | Agent 2 (Architect) |
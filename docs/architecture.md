# Architecture — Phase Shift: Echo Grid

> Owner: **Agent 2 — Technical Architect**
> Version: **V1.0**
> Date: 2026-10-20
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
  author-lv006-candidates.ts  # per-block candidate authoring: seeded generation → validate → solve → difficulty → accept/reject (never repair); one author script per content block (the L11 block's lands with LV-008)
  validate-levels.ts          # schema + rule validation over the whole level set (+ negative cases)
  solve-levels.ts             # solver pass over the shipped set: per-level metrics + policy gates (--audit = the ADR-0009 anomaly qualification; --report = the accepted-set metrics sidecar, §8 — specified 2026-10-15, ADR-architecture-0003 Ruling 3)

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
- **The arrow holds inside `src/game/**` too** (ADR-architecture-0003 Ruling 4): `systems/**` never imports state semantics from `renderer/**`. A predicate about the `GameState` (e.g. "the player stands inside a current-phase-solid tile", §6.1) lives in `src/core/rules/**` — implemented via `solidAt`, the one solidity truth — and the renderer receives such verdicts as **function inputs** (the `wallRenderState(level, gs, tile, playerEmbedded)` seam), never re-deriving them. A scene composing its view (`level-scene` → `BoardView`) is ordinary composition, not a semantics import.

## 5. Core state model

```ts
type Phase = "A" | "B";
type Vec = { x: number; y: number };

// All tile coordinates are [x, y], 0-indexed from the top-left corner.
interface Level {
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
  status: "playing" | "won";  // WIN LATCH (§6.2): once "won", the GameState
                              // reducer returns the identical state for ANY
                              // further move — gameplay bookkeeping, not a
                              // movement rule; the SearchState functions stay
                              // status-unaware
}
```

> `DoorDef` / `SwitchDef` / `PortalDef` shapes are deliberately **not** duplicated here — they are defined field-by-field in `docs/level-design.md` §1 and owned by the zod schema (§7). This file owns only the core type skeleton.
>
> Naming is **frozen** (2026-10-14, RV-002 M-2): the level type is **`Level`** — the code contract in `src/core/level`, already imported by GAME-001. Earlier drafts of this document called it `LevelDef`; the rename is complete and the name must not change again.

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

function isLegalMove(level: Level, s: SearchState, m: Move): boolean;
function applyMove(level: Level, s: SearchState, m: Move): SearchState;
function isGoal(level: Level, s: SearchState): boolean;
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

**Layer precision (RV-002 M-4):** the equivalence above is a **`SearchState`-layer** property of the pure rule functions only. The `GameState` reducer (`applyMoveToGameState`, §5) adds a second identity case — the **win latch**: once `status === "won"` it returns the identical state for every further move, legal or not, so `applyMove ≢ s`-style reasoning does NOT hold at the `GameState` layer. The latch is bookkeeping (it keeps `moveCount` and `history` honest after completion; locking post-win input remains Gameplay's job), not a movement rule. QA property tests — including any refusal/identity assertions — MUST target the `SearchState` functions.

Interaction semantics pinned by step 3 / step 5 (normative — one definition, shared by Gameplay and Solver):

- **Switch** — entering a switch tile while its `activePhase` is the current phase toggles `switchesOn[id]`. Leaving the tile, or standing on it in the other phase, does nothing.
- **Portal** — a portal teleports **only on the entering move**: when a step lands on a portal end while the portal's `activePhase` is current, the player is moved to the paired end. **The teleport is unconditional once the entering move is legal** (RV-002 H-2, ruling (a), 2026-10-14): step 1 has already judged the stepped-onto tile, and steps 2–6 contain no failure path — so the far end is NOT re-checked. If the far end is solid in the current phase, the result is an ordinary embedded state (§6.1, ADR-0008 clause 3): legal, stable, and escapable by the same entry rule. The landing tile never coincides with the stepped-on end (level validation requires the two ends to differ) and never chain-triggers — the landing tile fires nothing else in this move. Standing on a portal tile later — including when the flip activates the portal under the player — never teleports. The ambiguity's real fix sits in the **data layer**, not the rule: §7 hard-requires both portal ends to be non-wall in BOTH phases and off every door tile, so a validated level never produces a portal-embedded landing anyway. **Rejected alternative (b):** re-judging the far end inside step 1 would give one object (the portal) two rule paths — its legality decided at two different tiles — exactly the hybrid failure mode ADR-0008's Alternatives section bans. Rejected.
- **Door openness** — `doorsOpen[d]` is an absolute derived value recomputed at step 5 from `(door.color, current phase, switchesOn)` per the door rules of `docs/level-design.md` §1; it is never an incremental carryover from the previous state.

### 6.3 State hash (BFS visited-set)

`hashState` covers **exactly**:

| Field | Canonicalization |
|---|---|
| `player` position | `(x, y)` grid coordinates |
| `phase` | `"A" \| "B"` — redundant with `player` under the board-parity invariant (§8); becomes payload once opposite-parity portals exist. **Kept.** |
| `doorsOpen` | keys sorted; falsy entries omitted; keys length-prefixed (rules below) |
| `switchesOn` | keys sorted; falsy entries omitted; keys length-prefixed (rules below) |

Deliberately **excluded**: `moveCount`, `history`, `status` — gameplay bookkeeping, not puzzle state. Including them would break transposition detection and make the visited-set useless.

**Canonicalization rules (normative — RV-002 M-3; QA property-test targets, §12).** Record serialization applies three rules, in order:

1. **Sorted keys** — insertion/iteration order never affects the hash.
2. **Falsy omission** — entries whose value is not literally `true` are dropped, so `{ d1: false }` and `{}` hash identically. Sound because a missing key always reads closed/off (the fail-closed reading rule); this is what lets one producer materialize every key (`initialState`) while another emits only the true ones, without splitting the visited-set.
3. **Length prefix** — each surviving entry is emitted as `<key.length>:<key>=1,`, so the encoding is injective even for ids that contain the separators.

**Canonical by construction.** Both records are canonical: `switchesOn` changes only at applyMove step 3, and `doorsOpen` is fully recomputed at step 5 (never incremental). Equal logical states therefore always serialize identically — the visited-set can neither split equivalent states nor merge distinct ones, which is what makes BFS over the hashed graph correct.

**Finiteness & determinism (re-argued for Option B).** The reachable state space is bounded by `width × height × 2 × 2^|doors| × 2^|switches|` (portals are static per level and contribute no state bits; every reachable player position is an in-bounds cell, so the bound still holds). Under Option B the legal-move set of a state depends only on data inside `SearchState` — the current phase, the level's static walls, and `doorsOpen` / `switchesOn` for doors — and removing the post-flip check removes a conditional rather than adding one, so `applyMove` remains a pure, deterministic function of `(level, state, move)`. An illegal move contributes **no edge** to the search graph, never a self-loop with a flipped phase.

**Standing inside a solid cell is a normal reachable state** and does not break BFS: such a state has a well-defined, finite set of out-edges (moves to adjacent cells that are in-bounds and non-solid in the current phase), expanded by exactly the same rule as any other state. It is neither terminal by default (if no legal move exists, that is an ordinary dead end, which the difficulty metrics already track) nor special-cased in the hash. The BFS graph is therefore finite and every edge deterministic, so BFS over hashed states terminates and yields the true shortest solution.

## 7. Level schema & validation

- `zod` schema mirrors `Level` — **including the required `par`** (int ≥ 1, stamped by the generator from the Solver's `shortestSolution`; display-only "perfect clear" target, never a fail condition — `docs/level-design.md` §1).
- `scripts/validate-levels` runs over the full set: schema → rule sanity (bounds, start not on wall, goal reachable in *some* phase, no duplicate ids) → solver.
- **Portal ends (RV-002 H-2, hard error):** both ends of every portal must be non-wall in **BOTH** phases and must not be covered by any door tile — the static, decidable form of "never a closed-door tile in either phase" (door openness depends on `switchesOn`, and every door is closed in at least one reachable phase-state, so door tiles are excluded outright). This mirrors the ADR-0008 rule-7 goal rule and removes the H-2 landing ambiguity at the data layer (§6.2 step 3). It strengthens the current validator check (wall in the portal's own `activePhase` only) — implementation handoff to Level AI + Solver.
- Generator output that fails = **reject** (never auto-repair into the official set).
- **Two verdict strengths, two layers** (ADR-architecture-0003 Ruling 5): statically decidable data smells are validator **warnings** — the parity-dead wall, the inert switch (`src/core/level/index.ts`), a door targeted by more than one switch (the L6–L35 authoring rule, `docs/level-design.md` §1). Hard rejections that need solver evidence are `src/core/solver/policy.ts` **codes**, one negative control per code (`docs/ai-native-pipeline.md` §8.3). The same shape may live in both layers when both verdicts exist for it (the n-13 precedent: `switch-without-targets` warns *and* rejects); a shape with no consuming gate gets no code (YAGNI).

## 8. Solver & difficulty (Agent 4)

- **BFS only until profiled** (uniform cost, shortest solution + full solvability). No other search algorithm ships in the prototype.
- **A\* is not designed** (§13): revisit only if profiling shows BFS blowing the budget on shipped level sizes; candidate heuristic = Manhattan distance to goal + phase parity term, to be validated at that time.
- Per-level metrics — the names below are the **shipped** field names: `analyse` (`SolveResult`, `src/core/solver/bfs.ts`) carries `solvable`, `shortestSolution`, `reachableStates`, `dualPhaseTiles` (+list), `refusedThenEnteredTiles` (+list), `refusedBeforeEnteredTiles` (+list — the ordered companion, §8.1), `deadStates` (+list), `maxDepth`; `analyseDifficulty` (`DifficultyBreakdown`, `src/core/solver/difficulty.ts`) adds the terms `L B T R M` and the two scores `D` / `Dexec`, each with its weight vector. `scripts/solve-levels.ts` prints the per-level table plus the policy-gate verdicts.
- **Accepted-set metrics persist as a generated sidecar, never in the level file** (ADR-architecture-0003 Ruling 3 — **landed 2026-10-15: `88ea653` (LV-007E); artifact `docs/level-difficulty.report.json`, freshness pin `tests/solver/metrics-sidecar.test.ts`**): `scripts/solve-levels.ts --report` writes `docs/level-difficulty.report.json` (one record per shipped level: the fields above + `par` as cross-check + the weight vector as header), and a `tests/solver/**` freshness pin asserts committed ≡ freshly computed, so the artifact cannot drift from the levels. Derived metrics stay out of the zod schema on purpose — the only derived field a level file carries is `par` (§5), because gameplay displays it.

- `par` (Level, §5) is stamped from `shortestSolution` by the generator pipeline — the level file carries it; the Solver only reports the metric.
- **Board-parity invariant (2026-10-14, RV-002 — replaces a false V0.4 premise).** Every legal move changes `x + y` by exactly ±1 and flips the phase, so `phase = startPhase ⊕ parity((x + y) − (sx + sy))` is an **invariant**: the phase in which any cell can be entered is a function of the cell (and the start), never of the path or the move count. Proven by exhaustion: 0 dual-phase reachable cells over 400 random boards; 0 counterexamples over 880,640 enumerated configurations. Consequence: on M0-only boards the legal-move set of a reachable position depends **only on the position**. Option B's parity routing stands (a B-wall is still enterable only on A-steps — a real timing gate), but the V0.4 claim that M0 routing varies with move count — and that `deadEndRatio` / lookahead signals therefore gain meaning from it — was **wrong**: an M0 board is mechanically static, per cell.
- **What actually creates dynamics:** only two constructions break position-only statics — **latched state** (M3 switches → doors) and **non-±1 displacement** (M2 portals whose ends sit on opposite checkerboard colors: the teleport shifts `x + y` parity relative to the move count and the invariant breaks). Measured over 200 generated boards per mechanism class: doors+switches produced refused-then-entered tiles in **74/200**; opposite-parity portals in **80/200**, always accompanied by dual-phase tiles; same-parity portals **0/200** — pure connectivity, no new timing structure, a dead difficulty mechanic the generator should not spend portal budget on.
- **Required decidable metrics.** The per-level report MUST include `dualPhaseTiles` (cells visited in BOTH phases over the BFS) and `refusedThenEnteredTiles` (cells whose entry click was refused in some reachable state and accepted in another — the full definition contract is §8.1); both are computable directly from BFS visitation records. **`dualPhaseTiles = 0` marks a mechanically static level** (a pure timing-gate maze) and must flag it for difficulty review; `refusedThenEnteredTiles` measures history-dependence inside the static-parity envelope and is the pre-L11 dynamism carrier (ADR-0009 decision 4; `docs/ai-native-pipeline.md` §8.5).
- **Hash note.** Under the invariant, `phase` in `hashState` is today redundant — it is a function of `player`. It becomes payload the moment opposite-parity portals ship, so it **stays** in the hash (§6.3): one byte of forward compatibility, no re-keying of the visited-set later.
- Solver runs in Node (Vitest / script), **never** in the browser game loop during play.

### 8.1 Metric #7 `refusedThenEnteredTiles`: definition contract & order semantics — **RULING** (2026-10-15, ADR-architecture-0002)

**依据 (evidence).** (i) `dualPhaseTiles ≥ 1` is provably unsatisfiable on portal-free boards (checkerboard invariant, ADR-0009 decision 1, pinned by `tests/solver/dynamism-metrics.test.ts`), so the pre-L11 acceptance law (`docs/ai-native-pipeline.md` §8.5) rests on #7 alone — downgrading it would leave the acceptance system without its named dynamism metric. (ii) The shipped implementation (`src/core/solver/bfs.ts`) computes #7 from the **complete reachable `SearchState` graph**: per (node × direction) the clicked tile is classified by `legalMask`, which **is** `isLegalMove` — no second legality path. (iii) Measured on `develop` `b65e465`: L1–L10 read 0/0/0/0/0/**1/1/1/2/1**; the ordered variant (refusal strictly earlier than acceptance on one legal trace) yields **identical tile lists on all ten levels**; a 2,000-board seeded scan (1 door + 1 switch) shows the forms genuinely diverge in the wild — 568 boards fire both, **18 (≈ 0.9 %) fire unordered only** (trapped-refusal pockets). *(Corrigendum, ADR-architecture-0003 Ruling 1, 2026-10-15: the 18/2000 figure is a **historical, non-reproducible** measurement — out-of-repo mulberry32 harness at `b65e465`, generator never committed. The canonical pinned number is **46/2000 (2.3 %)**, `tests/solver/ordered-companion.test.ts` §5 (44 self-closing-latch, 2 unexplained — seeds 187, 1228); different generators, different board populations, no contradiction. Every live citation uses the pinned number.)*

**裁决 (ruling).**

1. **#7 stays canonical with its shipped semantics.** The order-dependence of the *experienced* beat is **mechanical semantics, not a measurement defect**: the latch is memory, so whether one playthrough contains refuse→enter depends on the player's move order (a player who presses the switch first never sees the refusal — that is L6's shipped lesson). The metric never claimed to measure a playthrough; it is a board-level property of the reachable state set and is **already order-free** (a traversal-order-invariant fixpoint). The ticket's `down,right,up` vs `right,down,left` observation conflates the trace layer with the state-space layer.
2. **Rejected options:** downgrade-to-diagnostic (removes the only pre-L11 dynamism carrier — see 依据 i); order-free redefinition (moot — already order-free); advisory status (contradicts the shipped hard gates: `policy:lesson-latch-dynamism`, Aha gate (iii), each with negative controls).
3. **Definition contract (normative; written from the shipped code — a future disagreement between code and this text is a failing-test alarm, never a licence to re-read the code):**
   - *Universe:* every `SearchState` reachable from `initialState(level)` under the shipped `applyMove` (goal states expanded; no win latch at this layer, §6.2 M-4). **No path set is selected** — not shortest routes, not greedy lines, not sampled playthroughs.
   - *Observation unit:* per (reachable state × direction), the **clicked tile** `player + dirDelta` — the tile `applyMove` step 1 judges. A portal's *landing* tile is not credited by the teleport; it counts only when itself clicked from an adjacent state.
   - *Verdicts:* `refused` = `isLegalMove` false (no movement, no flip; includes out-of-bounds clicks, which can never be accepted and therefore never enter the metric); `accepted` = legal move.
   - *Set rule:* a tile belongs to `refusedThenEnteredTiles` iff `refused` at ≥ 1 reachable state **and** `accepted` at ≥ 1 reachable state — an **unordered** conjunction over the state space. The report list is sorted `"x,y"` keys; the count is its length.
   - *Determinism:* a pure function of `(level, startState)`; BFS discovery order cannot affect it. A harness starting from a state the game cannot reach measures a different game (ADR-0009 Context item 5's lesson).
4. **Companion metric adopted (spec; implementation by Level AI + Solver): `refusedBeforeEnteredTiles`** — a clicked tile `T` counts iff ∃ reachable states `r` (click on `T` refused) and `a` (click on `T` accepted) with `a` reachable from `r` in the reachable graph. Since refusal is identity (§6.1), this is exactly "∃ one legal play trace on which a refusal of `T` strictly precedes an acceptance of `T`" — the ordered beat the Aha words promise, and the form immune by construction to the harness-artifact class. **Jobs are split:** #7 (unordered) = history-dependence of entry legality = the pre-L11 dynamism/acceptance carrier (its M0/M1-alone ≡ 0 theorem base was proved for this form; a trapped refusal still proves history-dependence and must not read as "static"); the companion (ordered) = beat-witnessability, the semantically correct reading of Aha gate (iii). **Trigger (YAGNI guard):** the companion MUST land before the first L11+ portal candidate is accepted, and SHOULD land on the first divergent candidate (`refusedThenEnteredTiles > 0` ∧ `refusedBeforeEnteredTiles = 0`). **Ship status (2026-10-15): SHIPPED — the trigger is consumed for its gate purpose, ahead of the first L11+ candidate.** The companion is implemented as `refusedBeforeEnteredTiles` in `src/core/solver/bfs.ts` and carried by `SolveResult` (LV-007B, `600c5d4`); gate (iii)'s code reader switched to the ordered form (LV-007C, `9dd92ce`) — verdict-identical on the shipped ten, with the trapped-refusal pocket as its divergent negative control (`tests/solver/ordered-companion.test.ts`). **The two legs are deliberately NOT stitched** (ADR-architecture-0002 Appendix A3; Orchestrator ruling, project-status item 39): gate (iii) reads the **ordered** form; `lesson-latch-dynamism`, gate (ii)'s refusal half and `docs/ai-native-pipeline.md` §8.5's pre-L11 acceptance law keep reading the **unordered** form — re-stitching would re-define an acceptance criterion, which requires an ADR amendment, not a reader edit.
5. **ADR-0009 / level-design §3 wording suggestions** for the Game Designer (original → proposed): ADR-architecture-0002 **Appendix A**. GD owns the target text.

**影响面 (blast radius).** Level AI + Solver: implements the companion at the trigger (one reverse-reachability pass per candidate tile over the existing `ReachableGraph`; report field + negative controls per the `POLICY_VIOLATION_CODES` discipline); pipeline §8.5 stays on the unordered form deliberately. Game Designer: ADR-0009 Context-item-5 deferral + level-design §3 (iii) wording (Appendix A drafts). QA: pins contract clause 3 (universe/keying/verdicts/set-rule) when the companion lands. Gameplay/UI: none. **Status 2026-10-15: all landed** — companion + report fields LV-007B (`600c5d4`); gate-(iii) code reader LV-007C (`9dd92ce`); GD wording GD-008 (`c68afac`; level-design V0.6 §3 (iii), ADR-0009 Context-5 closure line); QA pins `tests/solver/ordered-companion.test.ts` (contract clauses, the §2b verdict-identity sweep, the 46/2000 divergence pin).

**后续票 (follow-up tickets).** ~~`LV`: companion metric + report field~~ — **landed (LV-007B)**. ~~`GD`: wording pass per Appendix A~~ — **landed (GD-008)**. ~~`QA`: contract pins + companion negative controls~~ — **landed (LV-007C suite)**. Remaining from §8.1: none.

## 9. Rendering & adaptation

- One logical grid → two visual skins (Phase A / Phase B) driven by a **theme token map**, not duplicated scene code.
- Responsive strategy: fixed logical grid, scale-to-fit board container; UI in a separate DOM/HUD layer (HTML overlay) so text stays crisp and accessible on mobile.
- Phase transition: short, cheap cross-fade / color shift. **Must not obscure cell state** (see design readability rule).
- Target: 60fps on mid mobile; no heavy particle systems.

### 9.1 Theme-token canonical chain — **RULING** (2026-10-15, ADR-architecture-0002)

**Status: RULING.** Ends the doc↔code split over where the token map lives and who is authoritative (the split that produced the `docs/ui-ux.md` V0.6 S-1 path correction and the `FLIP_TIMING` shape correction — docs chasing code after the fact).

**依据 (evidence).** `docs/ui-ux.md` §5.4 names itself spec authority and (V0.6) the shipped location `src/game/theme/tokens.ts`, written/owned by the Gameplay Engineer (AGENTS.md §4; no `src/ui/**` tree exists). Verified on `develop` `b65e465`, reproducible: **R-C11 holds in code** — no `#RRGGBB` literal under `src/game/**` outside the token module (the single grep hit is a comment in `renderer/objects/actor.ts`); **value parity is exact** — every §4.3 base value matches, all six derived tokens re-executed in plain Node match the published values (A `#BBB09B #AFA491 #D4928B #8CA8D4 #4C8B91` ring `#3A3226`; B `#585786 #6B64A4 #9C5E64 #5E7EAE #6CB5B5` ring `#EAF0FF`), `ringVisible` = A on / B off per R-C9, `FLIP_TIMING`/`LAYOUT` match §6.2/§2.2. **…and none of it is pinned:** the §5.4-recommended no-hex/no-branch scan is not implemented (§12.1 scans only `src/core/**`), and no test pins `THEME` values or the derived formulas against §4.3. Parity today is review-enforced only.

**裁决 (ruling).**

1. **Canonical chain (normative):** *spec* — `docs/ui-ux.md` §4.3 (values, blend rules, measured evidence) and §5.4 (skin contract, R-C11/R-C12) are the **value and meaning authority** (owner: UI / Art Director). *injection* — `src/game/theme/tokens.ts` is the **only** module where colour/timing/layout constants enter code (owner: Gameplay Engineer writes it; `theme(phase)` is the only lookup; no `phase ===` colour branch, no hex literal elsewhere). *pins* — `tests/**` hold the two against each other (owner: QA). If a standalone `src/ui/**` tree ever appears, it imports the same module — the map is never forked.
2. **Derived tokens:** the **formulas** are law (60/40 `wallEchoFill`; 55/45 `wallOccupied`/`doorRedOccupied`/`doorBlueOccupied`; 80/20 `portalEcho`; the boot-time minimax for `fx.phaseRing` — R-C12). Docs publish the measured outputs; code computes them. A base re-tune without the derived re-computation — in either direction — fails the pin.
3. **Change flow:** any token change = spec row (value + derivation + re-measured evidence) **and** code **and** the parity pin, in one change; a docs-only or code-only move goes red. Interface additions (new token groups, new tables) are legal only when the spec names them — spec-first; the export surface follows §5.4's declared shape.
4. **Enforcement (the "whoever drifts goes red" mechanism):** two new §12 test rows — a static scan (no `#RRGGBB`, no `phase === "A"` colour branch under `src/game/**` outside the token module) and a token-parity test (base values + derived outputs + `ringVisible` against the published §4.3 map). Both land green on the current tree (依据 above); their purpose is to make the *next* drift red at commit time.

**影响面 (blast radius).** QA: two new tests (§12 rows), same static-analysis family as §12.1. UI / Art Director: keeps spec authority; spec edits now require the same-commit pin update. Gameplay Engineer: keeps file ownership; code edits now require the same-commit spec row. Docs + GitHub: no more catch-up passes for token drift — the pins replace them. Core/Solver/levels: untouched.

**后续票 (follow-up tickets).** `QA`: theme-law scan test + token-parity test (both specified green-by-construction). `UI/Art` + `Gameplay` (standing rule, not a ticket): the §9.1 change flow applies from the next token edit onward.

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
| Property | Vitest | `isLegalMove(s,m) ⟺ applyMove(s,m) ≢ s` at the **SearchState layer only** — the `GameState` win latch is a second identity case and is excluded (§6.2); hash canonicalization: sorted keys, falsy omission, length prefix (§6.3) |
| Boundary | Vitest | import-boundary test (§12.1) — hard CI gate |
| Theme law | Vitest | static scan: no `#RRGGBB` literal and no `phase === "A"` colour branch under `src/game/**` outside `src/game/theme/tokens.ts` (§9.1, R-C11 enforcement — **specified 2026-10-15, not yet implemented**) |
| Token parity | Vitest | `THEME` A/B base values + derived-formula outputs + `ringVisible` boot rule pinned against the published `docs/ui-ux.md` §4.3 map (§9.1 — **specified 2026-10-15, not yet implemented**; lands green by construction) |
| Solver report freshness | Vitest | committed `docs/level-difficulty.report.json` ≡ fresh `analyse` + `analyseDifficulty` run over the shipped levels (ADR-architecture-0003 Ruling 3 — **landed 2026-10-15: `88ea653`, `tests/solver/metrics-sidecar.test.ts`**) |
| Solver | Vitest | known solvable/unsolvable fixtures, BFS optimality; per-level report carries `dualPhaseTiles` / `refusedThenEnteredTiles` (§8) |
| Integration | Vitest | loader + validation + solver together |
| E2E | Playwright | load → move → win → next; restart; undo; mobile viewport |
| Regression | Vitest+Playwright | bug → reproduce → root cause → fix → regression test |

Every bug record: `Reproduce → Root Cause → Fix → Regression Test`.

> **Known gaps (updated 2026-10-15, AR-0005b).** The RV-002 H-5 gap is **closed**: the §12.1 import-boundary test ships as `tests/unit/import-boundary.test.ts` and the §6.2 property test as `tests/unit/rules-properties.test.ts` (SearchState/GameState layers asserted separately, per the M-4 discipline). The open enforcement gaps are now the two §9.1 theme pins (table rows above): the no-hex/no-`phase`-branch scan and the token-parity test — specified, not yet implemented; QA tickets named in §9.1.

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
| `isLegalMove` / `applyMove` drift | property test pinning their equivalence at the SearchState layer (§6.2) |

## 15. Census infrastructure — far-region lattice, mirror law, census-cost ruling — **RULING** (2026-10-17, ADR-architecture-0004)

Trigger: the F-L20-3 stage-P `--pocketsize=10` census (`scripts/author-l20.ts --stage=p`; transcript `scripts/author-l20-p10.transcript.md` §6a, `a897d27`) reported a "mirrored-column identity" — `x=4` and `x=6` landing slices enumerating to identical `tested` counts on all six rows — while the parity verdicts between them are total and opposite (`x=4` 0 single-phase / 0 leak-free; `x=6` all single-phase / 15 113 leak-free, `a897d27`). It was handed over as an open question (project-status item 116, RV-011). This section answers it and rules on cost. **It changes no core rule, no state, no schema, no level, no `par` / `B` / `D_exec` and no gate.**

### 15.1 The frame the census enumerates

- 7×6 board, sealed column `x = CX` (default 3); `LEFT_TILES = x ∈ [0, CX)` (near ends), `FAR_TILES = x ∈ [CX+1, W−1]` — the **far region**, a `(W−1−CX) × H` rectangle `Γ_F` (`author-l20.ts:208–217`).
- `pocketCandidates` (`:326`) enumerates connected tile sets of size 2..`--pocketsize` containing the landing, drawn **only from `FAR_TILES`**; `boundaryOf` (`:308`) excludes `x ≤ CX`, so a pocket's boundary is far-region-only. Enumeration walks **growth sequences**, not tile sets (transcript §3a/§8).
- Per landing the census loops the near ends of the **opposite checkerboard parity** (`:904–906`); the near end supplies a phase frame only and never changes the pocket space. Hence `tested(landing) = N(parity(landing)) × K(landing)` with `K` = yielded candidates and `N` = admissible near ends (`N(even (x+y)) = 9`, `N(odd) = 8` — `LEFT_TILES` has 9 of each and `(0,0)` is even).

### 15.2 LAW — enumeration size is an orbit invariant of the far rectangle

`Γ_F` is a rectangle, so its grid-automorphism group is `D2 = {id, σ_x : x ↦ CX + W − x, σ_y : y ↦ H − 1 − y}`. Both reflections are automorphisms of `Γ_F` **and of the boundary operator** (`x ≤ CX` maps onto `x ≥ W`; both are boundary-excluded), so **`K` is constant on each `D2` orbit**. `tested` inherits that constancy only under the **parity-preserving** half `σ_x` (for `CX=3, W=7`, `σ_x`: `4↔6`, `5` fixed); `σ_y` flips checkerboard parity and therefore swaps `N = 9 ↔ 8`.

Measured evidence — the committed 18-row ≤10 table factorises **exactly**, row by row, with no exception:

| column | rows {0,5} | rows {1,4} | rows {2,3} | `N` per row |
|---|---|---|---|---|
| `x=4` (= `x=6`) `K` | 354 129 | 2 347 134 | 5 028 103 | 9 if even, 8 if odd |
| `x=5` `K` | 1 338 255 | 8 262 157 | 17 541 071 | 9 if even, 8 if odd |

So the observed identity is the **parity-preserving half of a full orbit law**, and the parity-flipping half is visible in the same table as equal *per-near* `K` with unequal totals (`4,2` 45 252 927 = 9 × 5 028 103 vs `4,3` 40 224 824 = 8 × 5 028 103; `5,2` 140 328 568 = 8 × 17 541 071 vs `5,3` 157 869 639 = 9 × 17 541 071). Twelve exact matches across a table whose rows span 10⁷ are a **proven lattice law, not chance**.

### 15.3 Why the RESULTS are not symmetric — the accept screens are anchored outside `Γ_F`

`pocketLeaks` (`:797`) is the accept screen and evaluates **every in-bounds neighbour** of a pocket tile — including neighbours left of `Γ_F` (the sealed column), whose mirror image is the board edge (`x ≥ W`, skipped). Left of the far region is not the mirror of its right: it is a **phase-indexed walkable column** derived from the start-space anchor (`COLUMN`, `:226–235`). The mirror is an automorphism of the *enumeration graph*, not of the *environment*.

**LAW (first-column dead, one line).** For a first-column landing `(CX+1, y)` the admissible near ends satisfy `parity(near) = parity(CX+y)`, so `entryPhase(near)` **equals** the solid phase of the column tile `(CX, y)`; the far frame stands at the landing in `arrivalPhase = flip(nearPhase)`. The column tile is therefore never solid in the landing's own stand phase, its left neighbour is a free leak, and the door cannot cover it (`boundaryOf` excludes `x ≤ CX`). ⇒ **no pocket grown from a first-column landing can ever be leak-free, in any frame (any `CX`, `W`, `H`, any pocket size)**. In the L20 frame that is exactly the measured `x=4 → 0 leak-free`; in the G frame (`--cx=2`, far region `x ∈ {3..6}`) the same law is what the batch's `column-leak` refusals are counting.

### 15.4 FINDING — `single-phase boundary` is a tautology and its totals are gate-suppressed (census reporting defect)

- **(a) The screen screens nothing.** `sealedPocket` (`:268`) rejects a pocket iff a boundary tile is adjacent to pocket tiles of both BFS-distance parities. On a bipartite grid every neighbour of a boundary tile shares one `(x+y)` parity, and for a connected pocket `dist(t) mod 2 ≡ parity(t) ⊕ parity(landing)` — the test can never fire. Measured agreement: `single-phase == tested` on **all twelve** class-bearing landings at ≤10, and per near end at ≤8 (`5,0` 36 829 / 36 829; `6,0` 11 608 / 11 608).
- **(b) The counter is gated.** `single`/`sealed` are accumulated **inside** `if (hereSealed > 0)` (`:925–932`), so every `(landing, near)` with no leak-free pocket silently loses its single-phase mass. At ≤10 that is exactly the `x=4` group: `724 203 655 − 592 804 433 = 131 399 222` = its `tested` sum, digit for digit; at ≤8, `16 431 095 − 13 163 780 = 3 267 315` = the same group's sum. The published "`x=4` → 0 single-phase" is a **suppressed counter, not a measurement**, and the ≤8 cross-check that "licenses the `x=4` reading" is a tautology (a sum over printed lines must equal the counter by construction).
- **(c) Blast radius: zero on accepts.** Leak-free totals are unaffected (`x=4` loses nothing — §15.3 — and every class-bearing near had ≥1 leak-free), so `2 788`, `17 476` and the whole size histogram stand. Only the `single-phase` column and the missing `x=4` near lines are wrong; the true value of that column is `tested`.

### 15.5 RULING — census-cost law: **exploit-with-proof for sizes, never for accepts**

1. **Allowed (sizes).** Within one frame (fixed `CX`, `W`, `H`, `--pocketsize`), an enumeration size may be **predicted** from an orbit mate, with the orbit map exhibited as an automorphism of `Γ_F` + the boundary operator for the parameters in force. Bound: at most **one landing per `D2` orbit** is walked; every other `tested` is `N(its own parity) × K(orbit mate)` with `N` **recomputed per landing** (never inherited across `σ_y`).
2. **Condition for inheriting RESULTS (per gate, never by default).** A gate predicate `g` may have its verdicts inherited under an orbit map `σ` **iff** equivariance is established for that `g` in that frame: `g(σ(P)) = g(P)` for every enumerated `P`, by proof or by an exhaustive orbit-pair walk at the smallest cap that exhibits `g`. `g_leak` **fails** (measured 0 vs 15 113 in one frame; cause §15.3); `g_single` holds but is information-free (§15.4a).
3. **Forbidden.** Inheriting or emitting leak-free acceptance for a landing that was not walked — with exactly one exception: the **first far column**, where leak-free ≡ 0 is a **law** (§15.3) and must be labelled a law, never a measurement. No inheritance across frames, pocket caps or instruments (a distinct-set enumerator re-baselines: the ≤8-vs-≤10 relation is not a mirror relation). Predicted figures are labelled **PREDICTED**; `NOT MEASURED` never becomes zero by prediction.
4. **Rejected alternatives.** *Observe-only* — wastes a proven 3×-per-column economy on exactly the multi-pocket G censuses it exists for. *Forbidden entirely* — the size economy is proof-carrying and cheap. *Auto-orbit / symmetry-engine tooling* — §13: the orbit map is three lines of arithmetic; the burden is the proof, not the machinery.

### 15.6 Follow-up tickets (named, not taken)

- **Level AI + Solver** (owner of `scripts/**` and the census transcripts): (1) fix or retire the print gate so the `single-phase` counter is honest, and publish a corrigendum on its two totals in the 46/2000 style — the histogram, the leak-free counts and every shipped number are untouched; (2) run the **falsifiable probe** (cheap, minutes at `--pocketsize=4`): walk one full orbit pair `(4,y)`/`(6,y)` with the gate removed, assert tile-wise σ-equality of the leak-free sets (expected: all six `x=4` sets **empty** against the `x=6` members — equivariance fails exactly as §15.3 proves) and assert `single-phase(4,y) == tested(4,y)`; (3) retro-test the ≤8 prediction derived here — the ≤8 deficit decomposes as `9·11 608 + 8·11 608 + 8·63 000 + 9·63 000 + 17·v` ⇒ `v = 117 587` per near for `(4,2)`/`(4,3)` (equivalently `(6,2)`/`(6,3)` at ≤8); two ≤8 slices settle it, and any other integer refutes the orbit law.
- **QA** (only if a pin is wanted): assert the `D2` orbit automorphism on `Γ_F` for the current parameters, so a future frame change cannot silently invalidate a predicted figure.

## 16. Playthrough chain-row envelope — general law, re-measurement cadence, and the 100-rung split — **RULING** (2026-10-20, ADR-architecture-0005)

Trigger: the e2e unlock chain is **one serial row** that walks every shipped rung in dataset order, entering at L1 and moving on only through the win dialog's own `Next` (`tests/e2e/playthrough.spec.ts:403`–`:419`, tail assertion `:422`–`:427`). Its harness budget is a hand-derived constant in the row (`:395`), re-derived once per registration era. **Five** constants have shipped and each was falsified on the rung count it was derived for (`:342`–`:357`): `639_000` @25 (`:254`), the pre-registered `856_000` same-family face (`:256`), `1_213_000` @35 (`:291`), `1_397_000` @40 (`:303`), and the live **`1_617_000`** @45 (`:338`). The level lane books a pre-alert before each era (`src/levels/README.md` §7d `:1450` / §7e `:1649` / §7f `:1792`; `docs/ai-native-pipeline.md` §8.22 `:1413`, §8.25 `:1478`, §8.27 `:1512`), and the **100-rung formulation** has been booked to this office since `docs/project-status.md` item 143 (`:1873`), confirmed overdue at items 154 (`:1895`) / 159 (`:1905`) and dispatched at item 160 (`:1907`); the design lane booked the same question at `docs/level-design.md` §7.10 (`:1191`–`:1194`). This section publishes the **law**, the **cadence**, and the **split ruling**. **It changes no core rule, no state, no schema, no level, no `par`, no band, no gate, no workflow, and no `tests/**` byte** — the shipped constant stays `1_617_000` until QA lands a measured 50-rung datum.

### 16.1 LAW — the envelope general form, and the constant is always the measurement

```
M(N)           = par(1) + … + par(N)                       ← the dataset's own prefix sum (sidecar `levels[].par`)
LOCAL_TOTAL(N) = c_move · M(N) + c_rung · N                 [s]        ← local bench, worse-sample anchored
envelope(N)    = ceil( SAFETY × CLOUD_RATE × LOCAL_TOTAL(N) ) × 1000          [ms]  ← point face (forecast)
trigger(N)     = ceil( SAFETY × CLOUD_RATE × (1 + ρ) × LOCAL_TOTAL(N) ) × 1000 [ms]  ← alarm face
```

Both faces are **forecasts off the fit**. The number that *ships* is a third thing and is never a fit output: `ceil(SAFETY × CLOUD_RATE × measured_local(N)) × 1000`, where `measured_local(N)` is the era's own two-run carried worse sample.

- `SAFETY = 1.5` — the standing item-77(d) leg (`tests/e2e/playthrough.spec.ts:333`).
- `CLOUD_RATE = 4.40` — the **certified cloud datum** from QA-024 round `39031050727` ("≤ 360 / 81.783 = 4.40 × local", `:241`–`:242`; re-quoted `:332`), a cloud run-rate and not a throttle rate, per item 131/146 ("walk-class envelopes derive from CLOUD datums; a throttled-local green is necessary, not sufficient", `:278`–`:283`).
- `c_move = 0.296754 s/move`, `c_rung = 0.909297 s/rung` — **fit outputs over the last four carried observations** (25/35/40/45 rungs → `M = 269/479/587/705`, carried locals 96.715 / 183.718 / 211.602 / 244.875 s at `:248` / `:290` / `:302` / `:331`). A fifth observation drops the first and re-solves `(c_move, c_rung)`; **the pair is never hand-edited**, and the shipped constant is **never** the fit face.
- `ρ = 0.08` — the residue allowance, **on the trigger face only**.

**The law's one job is to alarm, never to edit.** A `trigger(N)` above the live constant is a **STOP-and-measure** order: the era owes a two-run local measurement at its tip (the carried worse sample), a re-derivation by the form above from *that* datum, and a named constant in `tests/**`. No agent raises a shipped number from `envelope()` or `trigger()` output. The form encodes the measured cause of the lane's forecast error: at 40 rungs the move-linear forecast read `1_486_000` against a measured `1_397_000` (**+6.40 %**, `docs/ai-native-pipeline.md:1489`) and at 45 rungs `1_678_000` against `1_617_000` (**+3.78 %**, `tests/e2e/playthrough.spec.ts:363`–`:366`) because a move-ratio scale ignores the **per-rung fixed cost** (open, first HUD read, dialog round trip — `:369`–`:371`), which is exactly `c_rung·N`.

### 16.2 Validation — the five published constants are five instances of the same form

`ceil(SAFETY × RATE × local)` reproduces every shipped number exactly, each from its own era's measured local total:

| # | datum | N | local (s) | form face | shipped | source |
|---|---|---|---|---|---|---|
| 1 | QA-024 `39031050727` | 25 | 96.715 | `ceil(638.319)` = 639 | **639_000** | `:248`, `:254` |
| 2 | same round, ×5.9 same-family | 25 | 96.715 | `ceil(855.928)` = 856 | **856_000** | `:256` |
| 3 | R-005c | 35 | 183.718 | `ceil(1_212.539)` = 1 213 | **1_213_000** | `:291` |
| 4 | R-006c | 40 | 211.602 | `ceil(1_396.573)` = 1 397 | **1_397_000** | `:303` |
| 5 | R-007c | 45 | 244.875 | `ceil(1_616.175)` = 1 617 | **1_617_000** | `:338` |

Fit quality (against §16.1's constants, each era's own measurement): **+6.04 %** @25, **−5.31 %** @35, **−0.49 %** @40, **+2.15 %** @45 — all measured on `docs/level-difficulty.report.json`. Leave-one-out: **−0.70 %** @40, **+6.06 %** @45, **−7.28 %** @35, **+27.36 %** @25; `ρ = 0.08` is the largest in-domain (|LOO| at 35 rungs) residue rounded up. **The law's domain is `N ≥ 35`** — on 25-rung/20-rung eras the per-move cost is not constant across the chain, so the two-parameter split has no purchase (the +27.36 % LOO miss is the domain edge, not noise). It is a **trend and alarm** instrument: it never predicts the next constant, and it does not replace the throttle arm (`:388`–`:394`).

### 16.3 RULING — anchor re-measurement cadence (CAD-1 … CAD-5)

1. **CAD-1 (arm, unconditional).** `trigger(N)` is recomputed at **every** registration era that lengthens the chain, from the era's `M(N)`. Recomputation is sidecar arithmetic and costs nothing.
2. **CAD-2 (anchor).** The anchor is **two plain local runs at the era tip, carried as the worse sample** (`:316`–`:326`) — the only datum any envelope may be derived from.
3. **CAD-3 (measurement cadence may relax; the alarm may not).** Since the last two carried observations both sit inside `ρ` on leave-one-out (40 → −0.70 %, 45 → +6.06 %), the measurement cadence relaxes from every-era to **every other registration era (rungs a multiple of 10) plus every era that opens a new act** — so at most one unanchored era can ever be carried.
4. **CAD-4 (reversion is automatic).** Back to **every era** on any red chain run, any LOO residue beyond `ρ`, or any era opening a new act; re-earning the relaxed cadence takes two more in-`ρ` observations.
5. **CAD-5 (no cadence thins the walk).** Entry only at a row's own first rung, every transition through the dialog's own `Next`, no `?level=` mid-chain hop, no skipped rung (`:422`–`:427`). Reducing measurement frequency is legitimate; reducing **coverage** is a semantics change and needs the core-loop triad, not this section.

### 16.4 RULING — the 100-rung question: keep the single row to the threshold, then split by era; the split lands at the **L86–L90** era

**Threshold `X = 5_040_000 ms` = 84 min = the worst e2e job clock ever observed** ("an 84 m e2e job — the worst of this era's three 1.4 h-class days", `tests/e2e/playthrough.spec.ts:221`; the three days are 52.2 / 59.8 / 84 min at `docs/project-status.md:1841`; the fast end is 42.0 min, item 142 `:1871`, and a 1.1 h round, item 149 `:1885`). `X` is a **demonstrated-class** line, not a platform line: the e2e job carries no `timeout-minutes` (measured 0 occurrences in `.github/workflows/ci.yml`, job at `:51`), so the platform default is 360 min — but a row whose own envelope exceeds every job clock ever observed asserts a capability with **no observation behind it**. Past `X` the honest remedy is the **design** one (split), not a bigger number.

**Work faces on disk vs the law.** The lane's published `×100/45` work face reads `ceil(1.5 × 4.40 × 244.875 × 100/45) = 3_592_000 ms` (59.9 min, `:382`); the dispatch's "≈63 min at 100 rungs" is `2 × 1_901_000 = 3_802_000 ms` (63.4 min, the 50-rung forecast at `docs/project-status.md:1905` doubled). Both are move/rung-linear and **under-price the law by 1.27×–1.53×**, for the §16.1 per-rung reason.

**Band faces at 100 rungs** (`M(40) = 587` from the sidecar; Acts III/IV/V are 20 rungs each at bands 20–28 / 24–32 / 28–36, `docs/level-design.md:547`–`:549`; every unregistered rung held at its band floor / mid / ceiling):

| face | pars III/IV/V | `M(100)` | `LOCAL_TOTAL(100)` (s) | `envelope(100)` (ms) | min | vs 3_592_000 | crosses `X` |
|---|---|---|---|---|---|---|---|
| band-min | 20 / 24 / 28 | 2 027 | 692.450 | **4_571_000** | 76.2 | 1.27× | never |
| band-mid | 24 / 28 / 32 | 2 267 | 763.671 | **5_041_000** | 84.0 | 1.40× | at N = 100 (1 000 ms over) |
| band-max | 28 / 32 / 36 | 2 507 | 834.892 | **5_511_000** | 91.8 | 1.53× | at N = 94 |

Operative (worst-admissible) face, era tips: L81–L85 `4_363_000` (72.7 min, under) · **L86–L90 `4_746_000` (79.1 min, under — the last single-row era)** · L91–L95 `5_128_000` (85.5 min, **over**) · L96–L100 `5_511_000` (91.8 min, over).

1. **Keep the single row while its forecast stays under `X`** — at today's bands, **L1 → L90**.
2. **Split by era, as contiguous era segments** (one row per era from the boundary; on the 100-rung dataset **L1–L90, L91–L95, L96–L100**). Each row **enters at its own first rung** (`?level=<era first>` — the same entry the row uses at L1 today, `:403`), walks its era in order through the dialog's own `Next` with the existing per-transition assertions (`:412`–`:419`), and **ends by asserting the `Next` handover out of its era into the next era's first rung** (label + `moves 0` + start phase) — so every `Next` transition in the chain is exercised **exactly once per round** and **no rung is unwalked**. Entry is an era *entry*; there is no mid-chain hop inside a row.
3. **Rejected — era-chain rows plus one rarely-run full-chain smoke row.** It leaves every act-boundary transition unexercised on the per-push rounds and duplicates era walks inside the smoke row, inverting cost per coverage; the milestone-only full chain already exists at `docs/level-design.md:881`–`:883` (`§7.6(e)`) and `docs/decisions/design-0005-move-depth-stars-and-100-level-acts.md:240`.
4. **Not a CI speed-up.** `workers: 1` / `fullyParallel: false` (`playwright.config.ts:67`–`:68`) makes the rows telescope — `LOCAL_TOTAL(90) + Δ(91–95) + Δ(96–100) = LOCAL_TOTAL(100)` — so the model buys **no wall-clock relief at all**, and the extra row boots make it, strictly, marginally worse. The relief is per-row **risk**, and the wall-clock lever stays `§7.6(c)`'s seeded stratification (QA's).
5. **Not frozen at L90.** `M(N)` reads the sidecar, so each era re-prices automatically; the boundary is "the last era whose **real** tip stays under `X`" and may move later (band-mid alone crosses only at the final rung; band-min never crosses). L90 is the **pre-registered worst-case** boundary, never a new typed threshold.

### 16.5 Seam-neutrality check — the law is act-blind, and the ruling lands inside §7.10's freedom

`docs/level-design.md` §7.10 declares itself **"seam-walk-neutral"** ("no clause here reads a cross-act walk and every batch proves on its own **bytes** (§7.5), so a later choice between per-act seam walks and one `L1→L100` chain lands without re-opening Act III", `:1192`–`:1194`; restated for §7.10.6–7 at `:1338`). Checked clause by clause:

- **Inputs are act-blind.** The law's only dataset input is `M(N) = Σ par(1..N)` — a prefix sum over committed level bytes that carry no act label; every constant (`SAFETY`, `CLOUD_RATE`, `c_move`, `c_rung`, `ρ`) is a global scalar. **No term is keyed on act, seam, era or boundary**, so a seam-crossing rung is priced identically to an interior rung. That avoids the F-L41-3 / F-L41-4 trap ("an act-blind LABEL with act-aware VALUE", `docs/ai-native-pipeline.md:1492`) by construction — the law has no act-aware value to mislabel.
- **The act band constants are not inputs.** `ACT_II_PAR_BAND` (`src/core/solver/policy.ts`, declarator `export const ACT_II_PAR_BAND`; symbol-anchored — no line number, `policy.ts` lines move every era) and `ACT_III_PAR_BAND` (`src/core/solver/policy.ts`, declarator `export const ACT_III_PAR_BAND`) appear in §16.4 only as the source of the band faces (a projection of unregistered rungs), never as law inputs.
- **The split choice is the branch §7.10 left open**, exercised without re-opening Act III: segments are contiguous and every batch still proves on its own bytes.
- **Corollary:** an act-opening era gets **no** special envelope term; its protection is CAD-3's "plus every era that opens a new act" measurement rule, i.e. a cadence obligation, not a pricing exception.

### 16.6 CI-budget risk, stated

- **This ruling costs zero.** Docs-only; no `tests/**`, `src/**` or workflow byte moves. The shipped constant stays `1_617_000`.
- **The next era will alarm before it is measured.** `trigger(50) = ceil(1.5 × 4.40 × 1.08 × 291.474) = 2_078_000 ms` against the live `1_617_000` (**1.29×**; point face `1_924_000`, 1.19×) — above the standing 600 s orchestrator-decision line that stopped QA-024 (`:257`–`:260`). The L46–L50 shelf pars are 22/24/26/26/26 (`src/levels/candidates/l046.json`…`l050.json`, matching `ACT_III_B2_PAR_MULTISET` at `src/core/solver/policy.ts`, declarator `export const ACT_III_B2_PAR_MULTISET`) ⇒ `M(50) = 829`. **R-008c owes the STOP-and-measure**, not a bigger number; the lane's own forecast is `1_901_000` (`docs/project-status.md:1905`), 1.2 % under the law's point face.
- **A red chain row is not cheap.** `retries: 0` (`playwright.config.ts:70`) and the cloud retry policy v2 that **removed** retries (`.github/workflows/ci.yml:67`–`:70`) mean one red row costs a named red ticket **plus a full job re-run**; the split trades one large envelope for three smaller ones and therefore **three independent red opportunities** — a real cost that only pays if the envelopes are honest (which is the argument for `ρ` on the trigger face rather than a hand-set margin).
- **The dominant row after the split is the first segment:** L1–L90 reads `4_746_000 ms` (79.1 min) on the band-max face — inside the demonstrated 84 min class with little room; the two tail segments are ~`383_000 ms` each. The 100-rung era's first duty is to **measure L1–L90**, and to treat a reading near `X` as another STOP, not a rounding opportunity.

### 16.7 Follow-up tickets (named, not taken)

- **QA** (owner of `tests/**`): the law changes no byte today; R-008c owes the CAD-2 anchor measurement at the 50-rung tip and a re-derivation by §16.1's form. The 100-rung split is **pre-registered, not scheduled** — it executes in the era whose real-par forecast crosses `X`. When it is implemented, each segment row keeps the existing per-transition assertions and adds the tip handover assertion (label + `moves 0` + start phase), so "every `Next` transition exercised exactly once per round" is a **test property**, not a claim.
- **Level AI + Solver** (owner of `scripts/**`, the sidecar and the pre-alerts): an era's envelope pre-alert may cite this section instead of re-deriving the form; the pre-alert arithmetic itself does not change.
- **Citation pointers recorded while ruling (both measured, so nobody chases them):** `docs/ai-native-pipeline.md` has **no §7d/§7e** — the pin dossiers are `src/levels/README.md` §7d `:1450` / §7e `:1649` / §7f `:1792`; and that file's **§8.29 does not exist** (highest is §8.28 `:1534`), so the 50-rung era's pre-alert has no numbering home yet — the level lane's to allocate.
- **Nothing else moves:** no core rule, no `GameState`, no schema, no level, no `par`, no band, no gate, no registry, no PINS, no sidecar cell, no workflow, no shipped constant.

## 17. XOR multi-switch doors — representation, the reader contract, and the registered-instance constant form — **RULING** (2026-10-20, ADR-architecture-0006)

Answers the device-contract question LV-018 handed to **Game Designer + Architect** (`docs/project-status.md`
items 154/159) as published in `docs/level-design.md` §7.10.8–§7.10.10 / **ADR-design-0010**. **Docs-only:
no byte of `src/**`, `scripts/**`, `tests/**` moves** (`git numstat` 0). Every number below is a
measurement on the shipped core or the shipped dataset, or a read of a cited `file:line`.

### 17.1 Representation — the XOR door is `targets` multiplicity on the **shipped** predicate

- An XOR door is a `Door` with **≥ 2 switches** listing its id in `targets`. The composition is
  **already shipped** in `doorIsOpen` (`src/core/rules/solid.ts:93–106`): `open = baseDoorOpen(color, phase) ⊕ (#ON
  targeting switches mod 2)`, `baseDoorOpen` at `solid.ts:73–75` (`red` open in A, `blue` open in B).
- **No schema field, no validator rule, no core predicate, no policy code.** The schema already admits it
  (`src/core/level/index.ts:176`), and the validator's `[multi-switch-door]` **stays a warning**
  (`src/core/level/index.ts:622`, home ruled in ADR-architecture-0003 R5): never a rejection, never a
  repair, never a Solver gate. Measured on the reference XOR board: `errors=0 warnings=1` (code
  `multi-switch-door`).
- **Boundary clarification (law):** the parity carrier is the count of **distinct switches**. Duplicate
  ids inside **one** switch's `targets` are **inert** — `sw.targets.includes(door.id)` is a boolean test
  (`solid.ts:102`), the validator counts distinct switch ids (`index.ts:607`) and warns not at all, and the
  two boards' walks are measured **identical**. **No schema tightening** (YAGNI: it would change the schema
  for zero capability and risk rejecting shipped bytes). One switch is never an XOR link.

### 17.2 No second derivation — the covering rule is targets-blind

`scripts/room-derivation.ts` — the single truth source both `author-l21.ts` and `prove-candidate.ts`
consume — contains **no read of `targets` at all** (`grep -n "targets" scripts/room-derivation.ts` → no
match, 132-line file; `derivedWalkSealedRooms` `:69`, `doorsCoveringTwoRooms` `:124`). A door tile blocks
in **every** phase and **every** switch state, so no switch write can move a region boundary. Measured as
a mutation experiment over **all 50 shipped levels** (45 with ≥ 1 switch): the covering list and the derived
room `doorIds` **moved in 0/50**. ⇒ **no second derivation is owed**; §6.2.3 clause 3 is structural, clause 4
is measured on the shared `applyMove` state graph where the XOR truth table already lives.

### 17.3 `G2-X` — a `scripts/**`-only reader over state that the records already carry

- The two shipped press-then-cross readers test **`targets` membership** and read **no** door openness
  (`scripts/author-l21.ts:1964/:1987`, `scripts/prove-candidate.ts:275/:293`). Membership is sound for a
  single-switch door and **unsound under XOR**: it is satisfied by a press that did the **opposite** of
  opening the door (measured: the reference board credits `{i:1, s1 → cross:4}` while the door is **closed**
  at that press).
- **No new core surface is needed** (the item's refusal condition does **not** fire): `ArrivalRecord`
  (`src/core/solver/bfs.ts:647–660`) already carries `state` (`SearchState` = `player, phase, doorsOpen,
  switchesOn`, `src/core/state/types.ts:58–63`), `toggledOn`/`toggledOff`, and `direction`. **Blast radius:
  `scripts/**` only.** No AGENTS §2 triad — an XOR door changes a **state**, never a position.
- **Corrigendum to the published encoding form (normative; §7.10.8.2 C2's literal text is refused).** Two of
  C2's sub-clauses are unusable as written:
  - **C2.2** ("the resolved openness **changes** at that arrival") is **unsatisfiable at any arrival that
    toggles a targeting switch**: the colour base strictly alternates with the phase, every legal move
    flips the phase, and at most one switch toggles per move (`switchAt` returns one switch; a portal's
    landing tile triggers nothing) ⇒ base-flip and parity-flip **cancel**. Measured over **4 025** par routes
    on the 45 door-bearing shipped boards: **17 732** toggling arrivals — the toggled switch's own door
    changed **0**; **70 048** non-toggling arrivals — changed **70 048/70 048**.
  - **C2.3** is off by one index: legality is judged on the **pre-move** state and openness is recomputed
    **after** the flip, so a player legally standing on a door tile has the door **closed** in the new phase.
    Measured: **30 847** door-tile crossings — `door[j].state.doorsOpen[d] === true` at the crossing
    **arrival: 0**; at the crossing **entry state: 30 847**.
  - **Also a wrong field path:** `route[i].state.levelState.doorsOpen[d]` — `ArrivalRecord.state` is a
    `SearchState`; `levelState` exists only on `GameState` (`src/core/state/types.ts:107`). Correct:
    **`route[i].state.doorsOpen[d]`**.
- **What LV-020 may encode (`G2-X`, normative).** For **every** par route, for every crossed door `d` with
  **≥ 2** targeting switches: (1) the crossing's **entry state** has `route[j−1].state.doorsOpen[d] === true`
  (read on the replay below, where it is not a tautology); **and** (2) an **effective press** exists at some
  `i < j` — a toggled id whose `targets` list `d` — proven by **counterfactual replay**: from the state at
  `i`, restore that switch's pre-arrival value, recompute `doorsOpen` with the exported
  **`resolveDoorsOpen`** (`solid.ts:113`), replay `i+1…j` with the shipped **`applyMove`** using the
  records' own `direction`, and require the crossing to **fail**. Both legs use exported core functions and
  the records' own data only — no new search, no second derivation, O(par) per witness. The parity reading
  (`doorsOpen[d]` vs `baseDoorOpen(d.color, phase)`) is **printed beside** the verdict, never deciding it
  (GD-008 shape). One negative control per reader, named from the lane's **measured** refusal
  (membership-pass / corrected-fail).
- **Order + STOP-AND-ROUTE (standing rule).** `G2-X` encodes **before** the census (a gate repaired after a
  census owes the identical command re-run — the LV-019 `F-L46-1` precedent), and the membership-vs-`G2-X`
  divergence is **printed**. **If any future census finds `divergence = 0` on an XOR class, the
  STOP-AND-ROUTE fires to the Game Designer — never to tool-patching.** Under the **literal** C2 the first
  census must read `divergence = 100 %` (0/17 732 measured); that is an **instrument defect** answered by the
  corrigendum, not by moving a threshold.

### 17.4 Registered-instance constants — the form law (`F-GD014-1`)

**A registered instance's left side is a published number and may not move after registration.**

- The shipped typing confirms the form: registered **values** are **literals**
  (`ACT_III_REGISTERED_TAIL_LEVEL_ID = 45` / `ACT_III_REGISTERED_TAIL_EXEC = 30.455319`,
  `src/core/solver/policy.ts:2312/:2315`; `ACT_III_B2_BATCH_PEAK_EXEC = 30.417021`, `:2619/:2620`), while a
  **pre-ticket standard** is an **alias** (`ACT_III_PRE_R008_REGISTERED_TAIL_*` `:2584/:2587`).
- **Instance 6 violates the form:** `ACT_III_B2_SEAM_RELIEF_PREVIOUS_LEVEL_ID/_EXEC` alias
  `ACT_III_REGISTERED_TAIL_*` (`policy.ts:2515/:2518`), so when the released `par 28` class moves the act
  maximum off `L45` (by construction `≥ 31.7500 > 30.455319`) the published `−4.212830`
  (`26.242489 − 30.455319`, recomputed ✓) is **silently restamped by a constant**.
- **Approved remedy shape (text spec; `src/core/solver/**` is the level lane's, applied with this sign-off):
  pin, derive from the pin, assert the frozen pair.** (1) add
  `ACT_III_B2_SEAM_RELIEF_PREVIOUS_EXEC_AT_REGISTRATION = 30.455319` (literal; level id `45` likewise, each
  documented as *as published at registration*); (2) make `ACT_III_B2_SEAM_RELIEF_DELTA` derive from the
  **pin**, not the moving alias; (3) replace the deleted alias with a `near(...)`-style assertion
  (`near` idiom at `policy.ts:3140`) of the **published pair** (exec − pinned previous == published delta),
  message naming `F-GD014-1`. **Do not assert against the live `ACT_III_REGISTERED_TAIL_EXEC`** — the tail
  moving is lawful and expected; that fact is **printed as a reading** (cf. `actIIIWidened`,
  `policy.ts:3503–3505`), never raised as a violation.
- **Alias admissibility (law).** An alias is admissible **only** when its referent is **frozen by
  construction** — a literal, or a measurement over a **closed, already-registered** id set (e.g. a batch
  peak). It is **not** admissible for a value defined over a set that still **grows** (the act's registered
  ids, `policy.ts:2573–2576`). Two second instances of the class are disclosed for the lane:
  `ACT_III_PRE_R008_REGISTERED_TAIL_*` (`:2584/:2587`) aliases the growing-set tail — the ticket that moves
  the tail **re-pins the standard to the literal it published**; and `ACT_III_B2_TAIL_ZERO_MOVE`
  (`:2631–2632`) is **self-cancelling by construction** (both operands are one constant) ⇒ it reads
  `0.000000` for any tail, is a **label not a measurement**, and **must never be cited as evidence that the
  act maximum did not move**.

### 17.5 Boundary and follow-ups

- **`Renderer → Gameplay → Core ← Solver` unharmed.** No module, dependency, field or predicate is added;
  the XOR device is a state rule already inside `doorIsOpen`, and `G2-X` is a reader over `SearchState`
  records core already produces (the corrected replay *calls* `applyMove`/`resolveDoorsOpen` — reusing the
  one truth source is the point). `Solver → Phaser` stays forbidden (§12.1). The locked core loop is
  untouched (**no AGENTS §2 triad**): entry-only solidity, illegal move = no move and no flip, embedded
  states legal and safe, deterministic only; the closing-door trap class is already refused by the shipped
  `deadStates 0` / `T ≡ R ≡ 0` invariant.
- **Hand-offs, by name.** (a) **Game Designer**: two corrigenda owed to `docs/level-design.md` §7.10.8.2 C2 —
  the field path and clauses 2/3 (GD owns that text; the Architect does not edit it). (b) **Level AI +
  Solver (`scripts/**`)**: encode the §17.3 corrected reader before the `H`-both-pair census, one measured
  negative control per implementation, divergence printed. (c) **QA (`tests/**`)**: a pin that a registered
  instance's published pair cannot be re-pointed by a later registration is the natural home if a test is
  wanted — the shipped `attest-*` instruments already encode the pre-ticket-standard shape and are the
  precedent to follow.
- **Deliberately NOT designed (YAGNI):** no `xor` field, no validator rule, no policy code, no new search,
  no second covering derivation, no orbit/tooling generalisation, no schema tightening for duplicate
  targets. The device needs none of them.

## 18. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial architecture: stack, structure, dependency rules, state model, solver boundary | Agent 2 / Orchestrator |
| 2026-10-14 | V0.2 | Aligned §6 with locked illegal-move semantics (GD-001): explicit `isLegalMove` definition, 7-step `applyMove` order (revert-without-flip on player-on-wall), state-hash contract + finiteness proof; added import-boundary test requirement (§12.1); added anti-overengineering section (§13); supersedes V0.1 "wall suppression / never covered" rule | Agent 2 (Architect) |
| 2026-10-14 | V0.3 | RV-001 reconciliation: added required `par` (int ≥ 1) to `LevelDef`, carried by the level file, with §7/§8 consistency notes; post-flip legality check now covers walls **and** closed doors — one rule for both phases (§6.1 c3 / §6.2 step 6); win condition made explicit and phase-independent (§6.2 step 7); `doorsOpen` / `switchesOn` / portal-trigger semantics pinned as canonical-by-construction for `hashState` (§5 / §6.2 / §6.3, ADR-architecture-0001 addendum); `[x, y]` coordinate labels + DoorDef/SwitchDef/PortalDef cross-reference to level-design.md §1 (§5); A* wording unified to "BFS only until profiled" (§3 / §8) | Agent 2 (Architect) |
| 2026-10-14 | V0.4 | GATE C human decision — core rule changed to **Option B**: deleted the post-flip "solid under player" legality check (ADR-0006 condition 3 superseded; see ADR-architecture-0001 addendum 2026-10-14). `isLegalMove` now consults current-phase occupancy only (§6.1); `applyMove` reduced to 6 steps with no retrospective rollback (§6.2); standing inside a solid-in-current-phase cell is a legal, stable state and moving out of it is judged by the same current-phase destination rule (§6.1); §6.3 finiteness/determinism re-argued (hash contract unchanged; solid-standing states are normal BFS nodes); union property gone, routing is parity-dependent, `deadEndRatio`/lookahead metrics gain meaning (§8). Retained invariants: illegal move = identity (no movement, no flip); walls never suppressed; the player is never crushed, pushed, or randomly relocated | Agent 2 (Architect) |
| 2026-10-14 | V0.5 | RV-002 reconciliation (AR-0004; core rule unchanged, GATE D = D3 mechanism-forward). **H-2** portal landing: ruling **(a)** adopted — teleport unconditional once entry is legal; far-end-solid ⇒ ordinary embedded state (§6.1 / ADR-0008 c3); landing never coincides with source, never chains; ambiguity moved to data-layer hard validation (both ends non-wall in BOTH phases + off every door tile, §7); alternative **(b)** (far-end check inside step 1) explicitly REJECTED — two rule paths for one object, the failure mode ADR-0008 Alternatives bans. **M-4** win latch written into §5/§6.2: `applyMoveToGameState` returns identity for ANY move once `status==="won"`; the `isLegalMove ⟺ applyMove ≢ s` property holds at the **SearchState layer only**. **M-2** `LevelDef` → `Level` everywhere; naming frozen to the code contract. **M-3** hash canonicalization completed: sorted keys + **falsy omission** (`{d1:false}` ≡ `{}`) + **length-prefixed keys** (§6.3, QA test targets). **§8 premise correction:** 4-dir grid + flip-per-move ⇒ `phase = startPhase ⊕ (x+y)` parity invariant (proven: 0 dual-phase cells / 400 random boards; 0 counterexamples / 880,640 configs) ⇒ M0 legal moves depend on position only; true dynamics = latched switch state + non-±1 opposite-parity portal displacement (measured 74/200, 80/200, same-parity 0/200); new required solver metrics `dualPhaseTiles` + `refusedThenEnteredTiles`; `phase` kept in hash (redundant today, payload once opposite-parity portals ship). §12: property-test layer pinned to SearchState; RV-002 H-5 known gap recorded (import-boundary + property tests specified, not yet implemented — QA same round) | Agent 2 (Architect) |
| 2026-10-15 | V0.6 | AR-0005b rulings (ADR-architecture-0002; closes ADR-0009's deferred metric question). **Ruling 1 (§8.1):** metric #7 `refusedThenEnteredTiles` stays **canonical** with its shipped unordered state-set semantics — the experienced beat's order-dependence is mechanical semantics (the latch is memory), not a measurement defect; the metric itself is already order-free (reachable-set fixpoint). 5-clause definition contract pinned from the shipped code (universe = complete reachable SearchState graph; clicked-tile keying; `legalMask`-is-`isLegalMove` verdicts; unordered refused∧accepted set rule; determinism). Ordered companion **`refusedBeforeEnteredTiles`** adopted by spec with a named trigger (MUST land before first L11+ portal candidate acceptance; SHOULD land on first divergence) — measured: identical tile lists on L1–L10, genuine wild divergence 18/2000 on random latch boards (trapped-refusal pockets). Rejected: downgrade-to-diagnostic (kills the only pre-L11 dynamism carrier), advisory (contradicts shipped hard gates), order-free redefinition (moot). ADR-0009/level-design §3 wording suggestions for GD in ADR-architecture-0002 Appendix A. **Ruling 2 (§9.1):** theme-token canonical chain — `docs/ui-ux.md` §4.3/§5.4 = value & meaning authority, `src/game/theme/tokens.ts` = sole injection point, `tests/**` = parity pins (whoever drifts goes red); derived-token formulas are law (R-C12); token change = spec + code + pin in one commit. Two enforcement gaps measured (no hex/branch scan, no value-parity pin — parity itself verified exact by re-execution) ⇒ two new §12 test rows (specified, land green). §12 known-gap note corrected: H-5 closed (import-boundary + property tests both shipped) | Agent 2 (Architect) |
| 2026-10-15 | V0.7 | AR-0006 sweep (ADR-architecture-0003, five rulings; docs-only). **R1:** divergence-rate citations unified on the test-pinned **46/2000 (2.3 %)** (`ordered-companion.test.ts` §5); 18/2000 / 0.9 % demoted to labeled historical (out-of-repo harness, generator never committed — second corrigendum of that class after the 9/200 residue); corrigendum annotations at §8.1 依据 (iii) and on ADR-architecture-0002; LV-007D execution wording issued to LV/GD. **R2:** `graphics2d.ts` keeps interface + compile-time probe co-located (terminal — `verbatimModuleSyntax` + all-`import type` consumers ⇒ zero runtime footprint; split rejected as churn, no ticket). **R3:** accepted-set metrics persist as generated sidecar `docs/level-difficulty.report.json` + `tests/solver/**` freshness pin (specified; **LV-007E**) — recompute-only rejected (drift class), level-schema fields rejected (derived data out of the authoring source; `par` stays the sole exception); §8 metric block rewritten to shipped field names, §12 gains the freshness row. **R4:** `isPlayerEmbedded` is rule semantics ⇒ home is `src/core/rules` via `solidAt` (R-queue micro-ticket; fixes the `systems → renderer` reverse edge RV-005 n-6 and deletes a second solidity truth); §4 gains the within-`src/game` arrow clause. **R5:** multi-switch-target flag homed at the validator-warning layer; no policy code until GD quantifies the L36+ allowance (one-code-one-control discipline; n-13 precedent); §7 gains the two-verdicts-two-layers rule. **Docs debts:** §3 scripts tree rewritten to the three real scripts (`author-lv006-candidates.ts` / `validate-levels.ts` / `solve-levels.ts` — `generate-levels` never existed); §8.1 ship facts moved to present tense (companion shipped LV-007B, gate-(iii) reader LV-007C, all follow-ups landed) with the two legs declared deliberately unstitched (A3; item 39) | Agent 2 (Architect) |
| 2026-10-17 | V0.8 | AR-007 / ARCH-001 (ADR-architecture-0004; docs-only, no code). New **§15 census infrastructure** answers the F-L20-3 handed-over question (item 116, RV-011) and rules census cost. **(1) Symmetry law:** the `x=4`/`x=6` `tested` identity is the parity-preserving half of a `D2` orbit law of the far rectangle `Γ_F` — `tested = N(parity) × K(orbit)`, `N(even)=9 / N(odd)=8`; the committed 18-row ≤10 table factorises exactly on every row (outer columns `K` 354 129 / 2 347 134 / 5 028 103; centre 1 338 255 / 8 262 157 / 17 541 071), and the `σ_y` half appears as equal per-near `K` with 9-vs-8 totals (`4,2` 9 × 5 028 103 vs `4,3` 8 × 5 028 103). **(2) Results are not symmetric:** the mirror is an automorphism of the enumeration graph, not of the environment — `pocketLeaks` sees the phase-indexed sealed column on the left and the board edge on the right. **LAW (first-column dead):** a landing at `x = CX+1` always satisfies `entryPhase(near) = solidPhase(CX, y)`, so `arrivalPhase` is never solid there and **no pocket from a first-column landing can ever be leak-free, in any frame** — the measured `x=4 → 0` is a law, and the G frame's `column-leak` refusals are the same law. **(3) Census reporting defect (finding, level lane's ticket):** `sealedPocket` can never reject a connected pocket (bipartite dist-parity argument: `single-phase == tested` on all twelve class-bearing landings), and the `single`/`sealed` counters sit **inside** the `if (hereSealed > 0)` print gate, so the `x=4` "0 single-phase" is a suppressed counter, not a measurement — `724 203 655 − 592 804 433 = 131 399 222` and `16 431 095 − 13 163 780 = 3 267 315` are exactly the `x=4` `tested` sums, and the ≤8 "licensing arithmetic" is a tautology. **Blast radius zero on accepts**: leak-free totals, the histogram and every shipped number stand. **(4) Ruling — exploit-with-proof for sizes, never for accepts:** ≤ 1 walked landing per `D2` orbit, predicted `tested = N(own parity) × K(orbit mate)`, results inherited only per-gate under an established equivariance condition `g(σ(P)) = g(P)` (`g_leak` fails, `g_single` is information-free), first-column leak-free ≡ 0 usable as a law, no cross-frame/cap/instrument inheritance. Observe-only, blanket-forbid and auto-orbit tooling all rejected (§13). Probes named for the level lane (gate-removed orbit pair; ≤8 retro-test predicts `K(6,2) = 117 587` per near) | Agent 2 (Architect) |
| 2026-10-20 | V0.9 | ARCH-005 (ADR-architecture-0005; docs-only, no code, no test byte). New **§16 chain-row envelope law + cadence + 100-rung split ruling** answers the formulation booked at `docs/project-status.md` items 143 (`:1873`) / 154 (`:1895`) / 159 (`:1905`) / 160 (`:1907`) and at `docs/level-design.md` §7.10 (`:1191`–`:1194`). **(1) LAW (form):** `M(N) = Σ par(1..N)`; `LOCAL_TOTAL(N) = c_move·M(N) + c_rung·N`; `envelope(N) = ceil(SAFETY × CLOUD_RATE × LOCAL_TOTAL(N)) × 1000`; `trigger(N) = ceil(SAFETY × CLOUD_RATE × (1+ρ) × LOCAL_TOTAL(N)) × 1000`. `SAFETY = 1.5` (item-77(d), `tests/e2e/playthrough.spec.ts:333`); `CLOUD_RATE = 4.40` (certified QA-024 datum, round `39031050727`, `:241`–`:242`); `c_move = 0.296754 s/move`, `c_rung = 0.909297 s/rung` — **fit outputs over the last four carried observations** (25/35/40/45 rungs → `M` 269/479/587/705, carried locals 96.715/183.718/211.602/244.875 s), never hand-edited; `ρ = 0.08` on the **trigger face only**. **The law alarms, it never edits:** a crossing `trigger(N)` is a STOP-and-measure order (fresh two-run tip measurement + re-derivation by this form; the shipped constant is always the measurement). The form encodes the measured forecast defect: the lane's move-linear forecasts over-read by **+6.40 %** @40 and **+3.78 %** @45 (`docs/ai-native-pipeline.md:1489`; `:363`–`:366`) because they carry no per-rung fixed term (`:369`–`:371`). **(2) Validation:** all five published constants are instances of the same form — `639_000` @25, `856_000` (×5.9 family) @25, `1_213_000` @35, `1_397_000` @40, `1_617_000` @45 — each reproduced exactly; fit residues **+6.04 / −5.31 / −0.49 / +2.15 %**; LOO **−0.70 %** @40, **+6.06 %** @45, **−7.28 %** @35, **+27.36 %** @25 ⇒ `ρ = 0.08` and **domain `N ≥ 35`** (short routes make per-move cost non-constant). **(3) Cadence CAD-1…CAD-5:** trigger recomputed every era; anchor = two tip runs, worse sample carried; measurement cadence relaxes to every-other-era (rungs a multiple of 10) **plus every act-opening era** (twice-test earned on the 40/45 LOO residuals); automatic reversion on any red run, any residue > `ρ`, or a new act; **no cadence may thin the walk** (entry at a row's own first rung, dialog-own-`Next` only, no mid-chain hop, no skipped rung). **(4) 100-rung RULING:** threshold `X = 5_040_000 ms` = 84 min = **the worst e2e job clock ever observed** (`tests/e2e/playthrough.spec.ts:221`; `docs/project-status.md:1841` three 1.4 h-class days 52.2/59.8/84 min) — a **demonstrated-class** line, not a platform line (the e2e job sets no `timeout-minutes`, measured 0 occurrences in `.github/workflows/ci.yml`). Band faces at 100 rungs (Acts III/IV/V at band floor/mid/ceiling): **band-min 4_571_000 ms (76.2 min, never crosses) · band-mid 5_041_000 ms (84.0 min, crosses at N = 100) · band-max 5_511_000 ms (91.8 min, crosses at N = 94)** — all **1.27×–1.53×** above the lane's published `×100/45` work face (3_592_000 ms, `:382`) and the dispatch's ≈63 min (`2 × 1_901_000`). Operative band-max era tips: L86–L90 `4_746_000 ms` (79.1 min, **under — last single-row era**) → L91–L95 `5_128_000 ms` (85.5 min, over) ⇒ **keep the single row to L90, split at the L86–L90 era**; split form = **contiguous era segments** (L1–L90 / L91–L95 / L96–L100), each row entering at its own first rung and asserting the **`Next` handover out of its era** at the tip, so every transition is exercised exactly once per round and no rung is unwalked; option (ii) (era rows + rare full-chain smoke) **rejected** — it leaves act-boundary transitions unexercised per push and duplicates walks; `§7.6(e)` keeps the milestone-only full chain (`docs/level-design.md:881`–`:883`). Not a CI speed-up (`workers: 1` ⇒ the segments telescope to the same total), and not frozen at L90 (the boundary re-prices off the real sidecar every era). **(5) Seam-neutrality check:** the law is **act-blind** — its only dataset input is a prefix sum over act-label-free level bytes and every constant is global, so a seam-crossing rung prices as an interior one (avoids F-L41-3/4's "act-blind LABEL with act-aware VALUE", `docs/ai-native-pipeline.md:1492`); the act band constants (`src/core/solver/policy.ts:1566`, `:2146`) are **not** law inputs; the split choice is the branch §7.10 declared open (`:1192`–`:1194`), so Act III is not re-opened. **(6) CI-budget risk stated:** the ticket costs zero; the next era **alarms before it is measured** (`trigger(50) = 2_078_000 ms` vs live `1_617_000` = 1.29×, point face 1_924_000 = 1.19×, `M(50) = 829` from the L46–L50 shelf pars 22/24/26/26/26 = `ACT_III_B2_PAR_MULTISET`, `policy.ts:2438`) ⇒ **R-008c owes STOP-and-measure**; with `retries: 0` (`playwright.config.ts:70`) and cloud retry policy v2 (`.github/workflows/ci.yml:67`–`:70`) a red row costs a named ticket **plus a full job re-run**, and the split trades one envelope for three independent red opportunities. Shipped constant untouched at `1_617_000` (`tests/e2e/playthrough.spec.ts:395`). Two citation pointers recorded (both measured): `docs/ai-native-pipeline.md` has **no §7d/§7e** (they are `src/levels/README.md` §7d `:1450` / §7e `:1649` / §7f `:1792`) and **no §8.29** (highest §8.28 `:1534`). **No core rule, no state, no schema, no level, no `par`, no band, no gate, no registry, no PINS, no sidecar cell, no workflow, no shipped constant moved** | Agent 2 (Architect) |
| 2026-10-20 | V1.0 | ARCH-006 (ADR-architecture-0006; docs-only, no code, no test byte, `git numstat` 0 on `src/**` `scripts/**` `tests/**`). New **§17 XOR multi-switch door ruling** answers the device-contract question LV-018 handed to Game Designer + Architect (ADR-design-0010 / `docs/level-design.md` §7.10.8–§7.10.10), verified from disk and by executing the shipped core rather than by reading the claim. **(1) Representation ACCEPTED:** XOR = `targets` multiplicity (**≥ 2 distinct switches**) over the **shipped** `doorIsOpen` (`src/core/rules/solid.ts:93–106`; `baseDoorOpen` `:73–75`) ⇒ no schema field (`src/core/level/index.ts:176`), no validator rule, no core predicate, no policy code; `[multi-switch-door]` **stays a warning** (`:622`, ADR-architecture-0003 R5); measured `errors=0 warnings=1` on the reference board. **Boundary clarification added:** duplicate ids inside **one** switch's `targets` are **inert** (`includes` is boolean, `:102`; validator counts distinct switch ids, `:601`) — measured identical walks, zero warnings — and **no schema tightening** is owed. **(2) No second derivation ACCEPTED:** `scripts/room-derivation.ts` reads **no** `targets` at all (`grep` → no match in 132 lines; `derivedWalkSealedRooms` `:69`, `doorsCoveringTwoRooms` `:124`), and the mutation experiment over **all 50 shipped levels** moves the covering list **0/50** ⇒ the invariance claim is measured, not argued. **(3) `G2-X` capability ACCEPTED, published encoding REFUSED, corrected form normative:** both membership readers are targets-only (`scripts/author-l21.ts:1964/:1987`, `scripts/prove-candidate.ts:275/:293`) and the records already carry what is needed (`ArrivalRecord` = `state` (`SearchState`: `player, phase, doorsOpen, switchesOn`), `toggledOn`/`toggledOff`, `direction` — `src/core/solver/bfs.ts:647–660`, `src/core/state/types.ts:58–63`) ⇒ **zero `src/**` change, no AGENTS §2 triad**. Two measured corrigenda to `docs/level-design.md` §7.10.8.2 C2: **C2.2 is unsatisfiable** (base strictly alternates with the phase, every legal move flips it, ≤ 1 toggle per move ⇒ base-flip cancels parity-flip; measured **17 732** toggling arrivals with **0** changed own-target doors and **70 048/70 048** non-toggling arrivals changed, over **4 025** par routes on 45 door-bearing boards) and **C2.3 is off by one index** (legality reads the **entry** state, openness is recomputed after the flip: **30 847** crossings, crossing-arrival open **0**, entry-state open **30 847**); plus a **wrong field path** (`route[i].state.levelState.doorsOpen[d]` — `levelState` is `GameState`-only, `src/core/state/types.ts:107`; correct is `route[i].state.doorsOpen[d]`). Normative reader: entry-state openness at `j−1` **plus** a **counterfactual replay** using the exported `resolveDoorsOpen` (`solid.ts:113`) and the shipped `applyMove` with the press suppressed — no new search, no second derivation, O(par) per witness; parity reading printed beside the verdict (GD-008 shape); one negative control from a measured refusal. **Standing STOP-AND-ROUTE restated:** `G2-X` encodes **before** the census (LV-019 `F-L46-1` precedent), divergence printed, and **if any future census finds `divergence = 0` on an XOR class the STOP fires to the Game Designer — never to tool-patching**; under the literal C2 the first census must read `divergence = 100 %` (0/17 732), which is an **instrument defect**, not a missing class. **(4) `F-GD014-1` constant form ACCEPTED, remedy shape approved as a text spec:** registered **values** are **literals** (`policy.ts:2312/:2315`, `:2606/:2607`), pre-ticket **standards** are **aliases** (`:2584/:2587`), and instance 6's published left side is aliased through the wrong channel (`:2515/:2518`, published `−4.212830 = 26.242489 − 30.455319` recomputed ✓) ⇒ remedy = **pin** (`_PREVIOUS_EXEC_AT_REGISTRATION = 30.455319`, level id `45` literal), **derive** the delta from the pin, **assert the frozen pair** with the `near` idiom (`:3140`) — never against the live tail (moving is lawful; that fact is a printed **reading**, cf. `actIIIWidened` `:3504–3505`). **New law: alias admissibility** — admissible only for a referent **frozen by construction** (a literal, or a measurement over a closed registered id set such as a batch peak), **not** for a value defined over a **growing** set (the act's registered ids, `:2572–2576`). Two second instances disclosed: `ACT_III_PRE_R008_REGISTERED_TAIL_*` (`:2584/:2587`) and the self-cancelling `ACT_III_B2_TAIL_ZERO_MOVE` (`:2631–2632`, a **label not a measurement**). **Boundary:** `Renderer → Gameplay → Core ← Solver` unharmed — no module, dependency, field or predicate added; the XOR device is a state rule already inside `doorIsOpen`; `G2-X` is a `scripts/**` reader over core-produced records; `Solver → Phaser` stays forbidden (§12.1); **no core-loop change, no AGENTS §2 triad**. **Hand-offs:** Game Designer owes the C2 corrigenda (GD owns that text); the level lane encodes §17.3 before the `H`-both-pair census; QA may pin the published pair. **Untouched:** every gate, band, `par`, weight, registered row, level byte, and all of `src/**` / `scripts/**` / `tests/**` | Agent 2 (Architect) |
| 2026-10-20 | V1.1 | **ARCH-006b — line-cite ERRATUM on ARCH-006 (`docs/decisions/architecture-0006-*.md` §5/§4 + this file §17; docs-only, no byte of `src/**` `scripts/**` `tests/**`, `git numstat` 2 paths).** **Trigger:** the design lane's independent re-verification (GD-014b, `docs/project-status.md` item 168) came out **CONCORDANT ON EVERY VALUE AND VERDICT** and caught **four drifted pointers**; the Architect then re-measured the **whole cite surface of that review** in one sitting and found **three more of its own** (two off-by-one, one imprecision) — **cite-as-label drift**, the class §17.4's alias law is about, arriving through pointers instead of constants. **Corrected (`wrong` → `measured`), all read from disk at base `816e8af`:** `policy.ts:2546` → **`:2550`** (`ACT_III_B2_SEAM_RELIEF_EXEC`, was landing on the fill-in doc-comment); `:2547–2548` → **`:2551–2552`** (`_DELTA`); `:2606/:2607` → **`:2619/:2620`** (`ACT_III_B2_BATCH_PEAK_*` — **the old pointer landed on `ACT_III_B2_LADDER` rows `L46`/`L47`**, the mis-read the erratum exists to stop); `:2611–2617` → **declared `:2605`, rows `:2606–2610`** (the ladder, whose old cite landed on the closing `];` and the peak's doc-comment); `:2572–2576` → **`:2573–2576`** (`ACT_III_REGISTERED_IDS`; `:2572` is its doc-comment); `src/core/level/index.ts:601` → **`:607`** (`alreadyCounted` — the old cite landed inside the counting-rule comment); `scripts/room-derivation.ts:110` → **`:109`** (`switchIds` from `sw.tile`; `:110` is `hasGoal`); `policy.ts:3504–3505` → **`:3503–3505`** ("the live `actIIIWidened` reading" incl. its `const`; assigned at `:4232`). **Every value, threshold, verdict, ruling and normative sentence stands exactly as published** — §4.2/§4.3/§4.4 of the ADR carry **no re-pin at all** (refused C2 quotation, corrected two-leg contract and STOP-AND-ROUTE text byte-identical), and this file's §17.1–§17.5 differ **only in the eight pointer tokens above**; the rest of the surface (`solid.ts:93–106`/`:73–75`/`:102`/`:113`/`:220–226`, `applyMove.ts:114–119`/`:136–151`/`:154–155`/`:154–162`, `level/index.ts:176`/`:292`/`:622`, `room-derivation.ts` **no `targets` match in 132 lines** `:69–116`/`:73`/`:124–132`, `author-l21.ts:1964`/`:1968–1991`/`:1987`, `prove-candidate.ts:275`/`:279–297`/`:293`, `bfs.ts:647–660`/`:650`, `types.ts:58–63`/`:107`, `cell-state.ts:171`, `policy.ts:2312`/`:2315`/`:2515`/`:2518`/`:2584`/`:2587`/`:2631–2632`/`:3140`) was **re-measured and is exact**. **Record:** the single dated erratum section, with the publish-landed-on column — **ADR-architecture-0006 §10**. **Residue named, not edited (single-writer):** the same `:2572–2576` copy sits in the design lane's `docs/level-design.md:1767`/`:1822`, and this V1.0 row above is **kept verbatim** as the published record and superseded by name here. | Agent 2 (Architect) |
| 2026-10-20 | V1.2 | **ARCH-006c — durable cite form: symbol-anchored pointers into era-decaying files (RV-014's two cite-decay sites; docs-only, no byte of `src/**` `scripts/**` `tests/**`, `git numstat` 3 paths).** **Trigger:** RV-014's read-only audit of LV-020 — the pass that cleared GO with **zero number mismatches** — caught that ARCH-005's three `src/core/solver/policy.ts` pointers (`ACT_II_PAR_BAND`, `ACT_III_PAR_BAND`, `ACT_III_B2_PAR_MULTISET`, cited `:1566`–`:1568` / `:2146`–`:2148` / `:2438`, exact at their own base `470c145`) had decayed under R-008's insertions above them. Re-measured from disk at **this** base (`develop` `4f1ddde`): the declarators sit at **`:1613` / `:2193` / `:2485`** — Δ **+45 / +45 / +47**, so the find's uniform "+45" is **wrong for the third symbol** (measured, not remembered; the fixer owes the same standard as the auditor) — and the stale integers now land on a validator block's closing `}`, three continuation lines of a policy **message string**, and a bare `//` line: **no band, no multiset, no declarator**. **Form chosen — SYMBOL-anchored, integer dropped (hybrid, not wholesale):** a cite into an **era-decaying** file anchors by **symbol**; where the referent is a **named top-level declaration** the cite is **path + declarator** and carries **no integer**, while a line number survives **only** for referents with **no name to cite** (a bare expression, a table row, an indented block) and any such cite is **era-stamped** ("measured at base `<sha>`"). **Derivation:** the symbol is already the name printed in the same sentence, so the integer adds no disambiguation, while its upkeep recurs every era **by construction** — +45/+45/+47 inside one era here, and GD-015 re-pinned a `policy.ts` pointer by hand the same day; the integer is the whack-a-mole, the name is not. **Applied:** §16.5's "act band constants are not inputs" bullet and §16.6 (base `:486` / `:493`) plus ADR-architecture-0005's References line and its two restatements (base `:6` / `:116` / `:123`) — **five lines, nine cite-tokens, cite-token-only**, every changed hunk inside a citation parenthesis. **No value, threshold, verdict, ruling or normative sentence moves:** `M(50) = 829`, `trigger(50) = 2_078_000`, the 1.29× / 1.19× faces, `SAFETY` / `CLOUD_RATE` / `c_move` / `c_rung` / `ρ`, `X = 5_040_000`, the three band faces and CAD-1…CAD-5 are byte-identical. **Kept verbatim, superseded by name (ARCH-006b precedent):** this table's **V0.9** (ARCH-005) row still carries the stale trio as *that era's published record* — a dated change-log row is a measurement at its own base, never a live pointer — and the old→new mapping resolves in **ADR-architecture-0006 §10 (`ARCH-006c`)**. **Cite duty for later lanes:** LV-020's re-pins and R-009's registration owe **no** `policy.ts` line re-pin for a named declaration — they owe the **symbol** form; the form **removes** a duty and adds none. | Agent 2 (Architect) |

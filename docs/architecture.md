# Architecture — Phase Shift: Echo Grid

> Owner: **Agent 2 — Technical Architect**
> Version: **V0.7**
> Date: 2026-10-15
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
- **Accepted-set metrics persist as a generated sidecar, never in the level file** (ADR-architecture-0003 Ruling 3 — **specified 2026-10-15, not yet implemented; LV-007E**): `scripts/solve-levels.ts --report` writes `docs/level-difficulty.report.json` (one record per shipped level: the fields above + `par` as cross-check + the weight vector as header), and a `tests/solver/**` freshness pin asserts committed ≡ freshly computed, so the artifact cannot drift from the levels. Derived metrics stay out of the zod schema on purpose — the only derived field a level file carries is `par` (§5), because gameplay displays it.

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
| Solver report freshness | Vitest | committed `docs/level-difficulty.report.json` ≡ fresh `analyse` + `analyseDifficulty` run over the shipped levels (ADR-architecture-0003 Ruling 3 — **specified 2026-10-15, not yet implemented**; lands with LV-007E) |
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

## 15. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial architecture: stack, structure, dependency rules, state model, solver boundary | Agent 2 / Orchestrator |
| 2026-10-14 | V0.2 | Aligned §6 with locked illegal-move semantics (GD-001): explicit `isLegalMove` definition, 7-step `applyMove` order (revert-without-flip on player-on-wall), state-hash contract + finiteness proof; added import-boundary test requirement (§12.1); added anti-overengineering section (§13); supersedes V0.1 "wall suppression / never covered" rule | Agent 2 (Architect) |
| 2026-10-14 | V0.3 | RV-001 reconciliation: added required `par` (int ≥ 1) to `LevelDef`, carried by the level file, with §7/§8 consistency notes; post-flip legality check now covers walls **and** closed doors — one rule for both phases (§6.1 c3 / §6.2 step 6); win condition made explicit and phase-independent (§6.2 step 7); `doorsOpen` / `switchesOn` / portal-trigger semantics pinned as canonical-by-construction for `hashState` (§5 / §6.2 / §6.3, ADR-architecture-0001 addendum); `[x, y]` coordinate labels + DoorDef/SwitchDef/PortalDef cross-reference to level-design.md §1 (§5); A* wording unified to "BFS only until profiled" (§3 / §8) | Agent 2 (Architect) |
| 2026-10-14 | V0.4 | GATE C human decision — core rule changed to **Option B**: deleted the post-flip "solid under player" legality check (ADR-0006 condition 3 superseded; see ADR-architecture-0001 addendum 2026-10-14). `isLegalMove` now consults current-phase occupancy only (§6.1); `applyMove` reduced to 6 steps with no retrospective rollback (§6.2); standing inside a solid-in-current-phase cell is a legal, stable state and moving out of it is judged by the same current-phase destination rule (§6.1); §6.3 finiteness/determinism re-argued (hash contract unchanged; solid-standing states are normal BFS nodes); union property gone, routing is parity-dependent, `deadEndRatio`/lookahead metrics gain meaning (§8). Retained invariants: illegal move = identity (no movement, no flip); walls never suppressed; the player is never crushed, pushed, or randomly relocated | Agent 2 (Architect) |
| 2026-10-14 | V0.5 | RV-002 reconciliation (AR-0004; core rule unchanged, GATE D = D3 mechanism-forward). **H-2** portal landing: ruling **(a)** adopted — teleport unconditional once entry is legal; far-end-solid ⇒ ordinary embedded state (§6.1 / ADR-0008 c3); landing never coincides with source, never chains; ambiguity moved to data-layer hard validation (both ends non-wall in BOTH phases + off every door tile, §7); alternative **(b)** (far-end check inside step 1) explicitly REJECTED — two rule paths for one object, the failure mode ADR-0008 Alternatives bans. **M-4** win latch written into §5/§6.2: `applyMoveToGameState` returns identity for ANY move once `status==="won"`; the `isLegalMove ⟺ applyMove ≢ s` property holds at the **SearchState layer only**. **M-2** `LevelDef` → `Level` everywhere; naming frozen to the code contract. **M-3** hash canonicalization completed: sorted keys + **falsy omission** (`{d1:false}` ≡ `{}`) + **length-prefixed keys** (§6.3, QA test targets). **§8 premise correction:** 4-dir grid + flip-per-move ⇒ `phase = startPhase ⊕ (x+y)` parity invariant (proven: 0 dual-phase cells / 400 random boards; 0 counterexamples / 880,640 configs) ⇒ M0 legal moves depend on position only; true dynamics = latched switch state + non-±1 opposite-parity portal displacement (measured 74/200, 80/200, same-parity 0/200); new required solver metrics `dualPhaseTiles` + `refusedThenEnteredTiles`; `phase` kept in hash (redundant today, payload once opposite-parity portals ship). §12: property-test layer pinned to SearchState; RV-002 H-5 known gap recorded (import-boundary + property tests specified, not yet implemented — QA same round) | Agent 2 (Architect) |
| 2026-10-15 | V0.6 | AR-0005b rulings (ADR-architecture-0002; closes ADR-0009's deferred metric question). **Ruling 1 (§8.1):** metric #7 `refusedThenEnteredTiles` stays **canonical** with its shipped unordered state-set semantics — the experienced beat's order-dependence is mechanical semantics (the latch is memory), not a measurement defect; the metric itself is already order-free (reachable-set fixpoint). 5-clause definition contract pinned from the shipped code (universe = complete reachable SearchState graph; clicked-tile keying; `legalMask`-is-`isLegalMove` verdicts; unordered refused∧accepted set rule; determinism). Ordered companion **`refusedBeforeEnteredTiles`** adopted by spec with a named trigger (MUST land before first L11+ portal candidate acceptance; SHOULD land on first divergence) — measured: identical tile lists on L1–L10, genuine wild divergence 18/2000 on random latch boards (trapped-refusal pockets). Rejected: downgrade-to-diagnostic (kills the only pre-L11 dynamism carrier), advisory (contradicts shipped hard gates), order-free redefinition (moot). ADR-0009/level-design §3 wording suggestions for GD in ADR-architecture-0002 Appendix A. **Ruling 2 (§9.1):** theme-token canonical chain — `docs/ui-ux.md` §4.3/§5.4 = value & meaning authority, `src/game/theme/tokens.ts` = sole injection point, `tests/**` = parity pins (whoever drifts goes red); derived-token formulas are law (R-C12); token change = spec + code + pin in one commit. Two enforcement gaps measured (no hex/branch scan, no value-parity pin — parity itself verified exact by re-execution) ⇒ two new §12 test rows (specified, land green). §12 known-gap note corrected: H-5 closed (import-boundary + property tests both shipped) | Agent 2 (Architect) |
| 2026-10-15 | V0.7 | AR-0006 sweep (ADR-architecture-0003, five rulings; docs-only). **R1:** divergence-rate citations unified on the test-pinned **46/2000 (2.3 %)** (`ordered-companion.test.ts` §5); 18/2000 / 0.9 % demoted to labeled historical (out-of-repo harness, generator never committed — second corrigendum of that class after the 9/200 residue); corrigendum annotations at §8.1 依据 (iii) and on ADR-architecture-0002; LV-007D execution wording issued to LV/GD. **R2:** `graphics2d.ts` keeps interface + compile-time probe co-located (terminal — `verbatimModuleSyntax` + all-`import type` consumers ⇒ zero runtime footprint; split rejected as churn, no ticket). **R3:** accepted-set metrics persist as generated sidecar `docs/level-difficulty.report.json` + `tests/solver/**` freshness pin (specified; **LV-007E**) — recompute-only rejected (drift class), level-schema fields rejected (derived data out of the authoring source; `par` stays the sole exception); §8 metric block rewritten to shipped field names, §12 gains the freshness row. **R4:** `isPlayerEmbedded` is rule semantics ⇒ home is `src/core/rules` via `solidAt` (R-queue micro-ticket; fixes the `systems → renderer` reverse edge RV-005 n-6 and deletes a second solidity truth); §4 gains the within-`src/game` arrow clause. **R5:** multi-switch-target flag homed at the validator-warning layer; no policy code until GD quantifies the L36+ allowance (one-code-one-control discipline; n-13 precedent); §7 gains the two-verdicts-two-layers rule. **Docs debts:** §3 scripts tree rewritten to the three real scripts (`author-lv006-candidates.ts` / `validate-levels.ts` / `solve-levels.ts` — `generate-levels` never existed); §8.1 ship facts moved to present tense (companion shipped LV-007B, gate-(iii) reader LV-007C, all follow-ups landed) with the two legs declared deliberately unstitched (A3; item 39) | Agent 2 (Architect) |
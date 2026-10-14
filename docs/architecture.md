# Architecture — Phase Shift: Echo Grid

> Owner: **Agent 2 — Technical Architect**
> Version: **V0.1**
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
    solver/                 # BFS/A* solver, difficulty metrics
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

- **Core must not import Phaser.** Enforced by lint rule / import boundary test.
- **Solver only depends on Core.** `Solver → Phaser Scene` is forbidden.
- Game logic must be runnable **without any Sprite existing** — this is what makes automated verification possible.

## 5. Core state model

```ts
type Phase = "A" | "B";
type Vec = { x: number; y: number };

interface LevelDef {
  id: number;
  width: number;
  height: number;
  startPhase: Phase;
  player: [number, number];
  goal: [number, number];
  phaseAWalls: [number, number][];
  phaseBWalls: [number, number][];
  doors: DoorDef[];
  switches: SwitchDef[];
  portals: PortalDef[];
}

interface GameState {
  levelId: number;
  playerPosition: Vec;
  phase: Phase;
  levelState: {
    doorsOpen: Record<string, boolean>;
    switchesOn: Record<string, boolean>;
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
function applyMove(level: LevelDef, s: SearchState, m: Move): SearchState; // move + resolve + flip
function isGoal(level: LevelDef, s: SearchState): boolean;
function hashState(s: SearchState): string;
```

- `applyMove` encapsulates the atomic rule: resolve in current phase → **flip phase** → resolve new phase (walls/doors/portals).
- Player is never covered by an incoming wall (§3.1 of design doc). This is enforced here, once, for both game and solver.
- Every rule lives in exactly one place and is reused by gameplay + solver.

## 7. Level schema & validation

- `zod` schema mirrors `LevelDef`.
- `scripts/validate-levels` runs over the full set: schema → rule sanity (bounds, start not on wall, goal reachable in *some* phase, no duplicate ids) → solver.
- Generator output that fails = **reject** (never auto-repair into the official set).

## 8. Solver & difficulty (Agent 4)

- **BFS first** (uniform cost, shortest solution + full solvability).
- Switch to **A\*** when the state space grows (heuristic = Manhattan distance to goal + phase parity term, to be validated).
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
| Unit | Vitest | rules, phase flip, collision, no-cover rule |
| Solver | Vitest | known solvable/unsolvable fixtures, BFS optimality |
| Integration | Vitest | loader + validation + solver together |
| E2E | Playwright | load → move → win → next; restart; undo; mobile viewport |
| Regression | Vitest+Playwright | bug → reproduce → root cause → fix → regression test |

Every bug record: `Reproduce → Root Cause → Fix → Regression Test`.

## 13. Risks

| Risk | Mitigation |
|---|---|
| State-space explosion at large levels | A* + bounded search + level size caps |
| Phaser coupling creeping into rules | import-boundary test in CI |
| Readability loss on mobile | screenshot review + fixed contrast tokens |
| LLM produces invalid levels | zod + rules + solver gate; reject, don't repair |

## 14. Change log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-10-14 | V0.1 | Initial architecture: stack, structure, dependency rules, state model, solver boundary | Agent 2 / Orchestrator |
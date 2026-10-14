# `src/levels/` — level data set (M0 teaching ladder L1–L5)

> Owner: **Level AI + Solver** (AGENTS.md §4). Design intent: **Game Designer** (`docs/level-design.md` §1–§3).
> Status: **hand-authored candidates, schema-validated, NOT solver-proven.**
> Board cap: **≤ 7 × 7** (`docs/ui-ux.md` R-L2). All five levels are **M0 only** (`doors`/`switches`/`portals` = `[]`).

## 0. What is in here, and what is *not* proven

| File | id | grid | walls (A / B) | `par` (manual hypothesis) |
|---|---|---|---|---|
| `l001.json` | 1 | 5 × 3 | — / — | 4 |
| `l002.json` | 2 | 4 × 4 | — / — | 5 |
| `l003.json` | 3 | 5 × 3 | `(3,1)` / — | 6 |
| `l004.json` | 4 | 5 × 4 | `(3,1)` / `(2,0)` | 6 |
| `l005.json` | 5 | 5 × 4 | `(3,1)`, `(4,0)` / `(4,2)` | 6 |

- **Validation is proven** for all five: `node scripts/validate-levels.ts` → `5/5 level files ok`, exit code 0.
- **Solvability and `par` are NOT proven.** Every `par` above is a **manual derivation** (documented step by step in §2) and is a **hypothesis pending SOLVER-001** (BFS under ADR-0008). Nothing here may be called "verified" before that.
- Supplementary, *informal* evidence (kept deliberately **out of the repo**, it is not the solver deliverable): a throwaway BFS over the ADR-0008 Option B rules agreed with all five `par` values (4 / 5 / 6 / 6 / 6), found the goal reachable and found no dead end in any of the five. Treat it as a sanity check on the hand work, not as proof.

## 1. Running the gate

```bash
node scripts/validate-levels.ts                 # Node ≥ 22.6 type-stripping; no build step
node --experimental-strip-types scripts/validate-levels.ts
node scripts/validate-levels.ts <other-levels-dir>   # or LEVELS_DIR=…
```

There is **no `tsx`** in this workspace's dependency tree, and this role must not install one; `scripts/validate-levels.ts` therefore runs under Node's native type stripping. Exit code is **non-zero** if any level fails, if a negative self-test is wrongly accepted, or if two level files share an `id`. Failing levels are **rejected, never auto-repaired** (ADR-0004).

## 2. Per-level manual derivation (hypothesis, for SOLVER-001 to falsify)

Rules used below (ADR-0008, Option B): a move is legal iff the destination is in bounds and non-solid **in the current phase at entry**; an illegal move changes nothing (no movement, **no flip**); after a legal move the phase flips; the goal is won on arrival regardless of phase.

Two derived facts I use throughout (proved in §3):

- **F1 — arrival parity.** With `startPhase = "A"`, move *n* is played in phase **A if n is odd, B if n is even**.
- **F2 — enterability is route-independent.** Arrival at tile `c` always happens on a move number `n ≡ d(c) (mod 2)`, where `d(c)` is the Manhattan distance from `player`. Therefore a `phaseAWalls` tile is enterable **iff `d` is even**, a `phaseBWalls` tile **iff `d` is odd** — and a tile can never be "refused first, then entered later".

### L1 — `l001.json` · tap → move, the world flashes (5 × 3, no walls)

| step | tile entered | phase during the move | after the move |
|---|---|---|---|
| 1 | `(1,1)` | A | B |
| 2 | `(2,1)` | B | A |
| 3 | `(3,1)` | A | B |
| 4 | `(4,1)` **goal** | B | A → win |

- Enterable windows: every tile is non-wall in both phases, so every tile is enterable on every parity. The goal is enterable on both parities by design (ADR-0008 rule 7).
- `par = 4` = `d(goal)`; the row is the only 4-move route, so 4 is the floor.
- **If a tile here were made solid in BOTH phases:** `(1,1)`, `(2,1)` or `(3,1)` each cut the only 4-route, and the goal stays reachable via row 0/2 at **6** moves, so `par` would become 6 (verified by brute force: all three single-tile dual variants give exactly 6). The level would stop being "the flip is harmless", which is the point of L1 — a dual wall must not be added here.

### L2 — `l002.json` · "the flip happens because *I* moved" (4 × 4, no walls)

| step | tile entered | phase during the move | after the move |
|---|---|---|---|
| 1 | `(1,0)` | A | B |
| 2 | `(2,0)` | B | A |
| 3 | `(3,0)` | A | B |
| 4 | `(3,1)` | B | A |
| 5 | `(3,2)` **goal** | A | B → win |

- `par = 5` = `d(goal)`; the board is open, so the player has many 5-move routes and the world alternates in lockstep with their taps.
- **If a tile here were made solid in BOTH phases:** a single dual tile never changes this `par` — e.g. `(3,1)` dual still leaves the 5-move route `(1,0)→(2,0)→(2,1)→(2,2)→(3,2)`. Brute force over all 14 non-endpoint tiles confirms it: **no** single dual tile changes `par = 5`. That is exactly why L2 must stay empty: a dual wall here would silently teach "walls", not "causality".

### L3 — `l003.json` · the first "no": a **current-phase** wall refuses the tap (5 × 3, `phaseAWalls = [(3,1)]`)

`d(3,1) = 3` (odd). By F2 a `phaseAWalls` tile needs an **even** arrival, so `(3,1)` is **never enterable** — it is a permanent obstacle that only *looks* like a parity gate.

| step | tile entered / attempted | phase during the move | outcome |
|---|---|---|---|
| 1 | `(1,1)` | A | legal → phase B |
| 2 | `(2,1)` | B | legal → phase A |
| 3 | `(3,1)` **attempted** | A | **REFUSED** — `(3,1)` is solid in A: no movement, **no flip**, still phase A |
| 3′ | `(2,0)` (the detour) | A | legal → phase B |
| 4 | `(3,0)` | B | legal → phase A |
| 5 | `(4,0)` | A | legal → phase B |
| 6 | `(4,1)` **goal** | B | legal → win |

- Enterable windows: `(3,1)` — **never** (see above). Its *ghost* state (phase B) is visible but unreachable: any arrival there is an odd move, i.e. a phase-A move.
- `par = 6`: the 4-move straight line is cut, and the only other routes go through row 0 or row 2 (both 6).
- **If `(3,1)` were made solid in BOTH phases: nothing changes at all** — the level is byte-for-byte equivalent in behaviour, because a parity-mismatched phase wall already is a dual wall. This is the load-bearing observation of §3.

### L4 — `l004.json` · the other face of a wall: a tile that is solid in phase B is *passable while it is A* (5 × 4, `phaseAWalls = [(3,1)]`, `phaseBWalls = [(2,0)]`)

`d(3,1) = 3` → never enterable (as in L3). `d(2,0) = 3` (odd) → a `phaseBWalls` tile needs an **odd** arrival, so `(2,0)` **is** enterable — on odd moves, while the current phase is A, where it renders as a passable echo.

| step | tile entered / attempted | phase during the move | outcome |
|---|---|---|---|
| 1 | `(1,1)` | A | legal → phase B |
| 2 | `(2,1)` | B | legal → phase A |
| 3 | `(3,1)` **attempted** | A | **REFUSED** — solid in A; no movement, no flip |
| 3′ | `(2,0)` (row 0 detour) | A | legal — the tile is **solid in B only**, so it is *passable now*; after the flip to B the player stands **inside** a solid tile (legal and safe, ADR-0008 rule 3) |
| 4 | `(3,0)` | B | legal → phase A |
| 5 | `(4,0)` | A | legal → phase B |
| 6 | `(4,1)` **goal** | B | legal → win |

The alternative 6-move detour `(0,2)→(1,2)→(2,2)→(3,2)→(4,2)→(4,1)` avoids `(2,0)` entirely, so the ghost crossing is offered, not forced.

- Enterable windows: `(3,1)` — never. `(2,0)` — odd moves (3, 5, 7 …) while phase A is current; in this level the first reachable entry is move 3.
- `par = 6`: 4 moves is impossible (the straight line is cut at `(3,1)`, and every 4-move route *is* the straight line); 6 is achieved.
- **If `(2,0)` were made solid in BOTH phases:** the row-0 corridor is severed at `(2,0)` — the "walk through a wall" beat disappears — but the row-2 route still solves in 6, so `par` is unchanged and the level stays solvable. The *teaching* content of L4 is what is lost, not the solution.
- **If `(3,1)` were made solid in BOTH phases:** no change (as in L3).
- ⚠ **Blocked intent (see §4):** `docs/level-design.md` §2 asks this tile to be "the wall that said no, gone after I move". Under ADR-0008 that is unreachable — L4 as specified has no legal implementation in M0.

### L5 — `l005.json` · the goal line is reached only **through** a wall that is a ghost right now (5 × 4, `phaseAWalls = [(3,1), (4,0)]`, `phaseBWalls = [(4,2)]`)

`d(3,1) = 3`, `d(4,0) = 5`, `d(4,2) = 5` — all odd. `(3,1)` and `(4,0)` are `phaseAWalls` (need even arrivals) → **never enterable**. `(4,2)` is `phaseBWalls` (needs odd arrivals) → **enterable on odd moves**, i.e. while phase A is current, where it renders as an echo.

| step | tile entered / attempted | phase during the move | outcome |
|---|---|---|---|
| 1 | `(1,1)` | A | legal → phase B |
| 2 | `(2,1)` | B | legal → phase A |
| 3 | `(3,1)` **attempted** | A | **REFUSED** — solid in A; no movement, no flip (the greedy straight line dies here, one tile before the goal column) |
| 3′ | `(2,2)` (the side step) | A | legal → phase B |
| 4 | `(3,2)` | B | legal → phase A |
| 5 | `(4,2)` | A | legal — solid in **B** only, so it is passable *now*; after the flip the player stands inside it (embedded, legal) |
| 6 | `(4,1)` **goal** | B | legal → win |

- Enterable windows: `(3,1)`, `(4,0)` — never. `(4,2)` — odd moves (3, 5, 7 …); earliest reachable entry is move 5.
- The goal's neighbours are `(3,1)`, `(4,0)` and `(4,2)` only; the first two are never enterable, so **every** solution must enter through the echo `(4,2)`.
- `par = 6`: 4 is impossible (the straight line is refused at `(3,1)`, and the goal cannot be reached from `(3,1)` or `(4,0)` in any case); 6 is achieved.
- **If `(4,2)` were made solid in BOTH phases: the level becomes UNSOLVABLE** — all three goal approaches are then permanently solid. This is the clearest evidence in the set that a parity-matched wall is load-bearing content, not decoration.
- **If `(3,1)` or `(4,0)` were made solid in BOTH phases:** no change (both are already permanently solid).
- ⚠ **Blocked intent (see §4):** the design asks for "a side step changes the parity, and the wall that refused me becomes my route". The side step here changes **nothing about `(3,1)`** — it routes around it and lets the player walk through a *different* wall, `(4,2)`.

## 3. The parity structure, and why M0-only content is a *static* maze

Both facts used above are short proofs, not opinions.

**F1.** `startPhase = "A"`, and every legal move flips. After `n` legal moves the phase is `A` if `n` is even, `B` if `n` is odd. Move *n* is played in the phase of the state after `n−1` moves → **A for odd n, B for even n**.

**F2.** Each legal move changes the player's position by one step, so its `x + y` parity flips every move: after `L` moves, `L ≡ (x + y) − (x₀ + y₀) ≡ d(x, y) (mod 2)`. So **arrival at tile `c` is always an `n` with `n ≡ d(c) (mod 2)` — no route can change that**, because a detour adds 2 moves, never 1. Combining with F1: the phase present when the player arrives at `c` is a function of `c` alone. Hence

- a `phaseAWalls` tile is enterable **iff `d(c)` is even**;
- a `phaseBWalls` tile is enterable **iff `d(c)` is odd**;
- a parity-mismatched phase wall is **permanently impassable** → behaviourally identical to a wall listed in *both* phases (the warning in `validateLevel`);
- no tile inside a level can ever be *refused first and entered later* — **the flip never "opens" a tile for you; your own route cannot re-time your arrival.**

Empirical backing (throwaway probes kept out of the repo, 4000 random levels each, ADR-0008 rules): M0-only walls → 0 levels with a tile reachable in both phases, 0 tiles refused-then-entered, 0 phase-formula violations. The same holds for **M1 doors without switches** (door solidity is then a function of the phase alone). Dynamism appears only when the phase stops being a function of the tile: **M3 switches** (231/500 random skeletons produced refused-then-entered door tiles) and **M2 portals** (233/500 broke the position→phase function, because a teleport changes position without consuming an extra move).

**Consequence for the pipeline:** the claim in `ADR-0008` clause 8 that parity-dependent entry "genuinely rewires feasible routes from L1 onward" and resolves OQ-1 does **not** hold for M0-only content. M0 walls are real gates *perceptually* (a wall is solid while its phase is current) but the legal-move graph they produce is **static**: which tiles are enterable is fixed at authoring time by the distance parity from `player`.

## 4. Blocked design intents (escalation needed — do not silently "fix")

| Where | Spec | Status |
|---|---|---|
| `docs/level-design.md` §2 L4 | "the solid wall becomes a passable echo … the route crosses the very tile that refused earlier" | **UNREACHABLE in M0** by F2. `l004.json` ships a substitute beat (a *different* tile that is solid in the other phase is crossed while it is an echo) and is flagged, not presented as the specified lesson. |
| `docs/level-design.md` §2–§3 L5 (Aha #1) | "greedy straight line refused at the last jump; a visible side step changes the parity; the refusing wall itself becomes the route" | **UNREACHABLE in M0** by F2. `l005.json` keeps the refusal + side-step + `par ≤ 6` shape and makes the goal reachable *only* through an echo tile, but the refusing tile `(3,1)` is still never enterable. The ladder's stated Aha is not delivered. |
| `docs/level-design.md` §1 example | `par: 6` for `player [0,1] / goal [4,1] / phaseAWalls [[2,0]] / phaseBWalls [[3,1]]` | **inconsistent with its own prose**: the prose (and F1/F2) give `R,R,R,R` = **4** moves (the echo `(3,1)` is entered on move 3, a phase-A step). `par` must be re-derived by SOLVER-001. The example also contains `(2,0)`, which is `d = 3` (odd) in a `phaseAWalls` list → never enterable decoration. |

Cheapest mechanical fixes for the design team to consider (**none of them mine to decide** — ADR-0008 is human-approved core rule; M1/M2 scope belongs to the Game Designer):

1. Bring a **portal pair (M2)** into the early teaching block — a teleport is the only mechanic in the locked rule set that decouples the phase from the step parity, and it needs no rule change.
2. Or bring **M1 doors + M3 switch** forward (doors *alone* stay static, so M3 must ship with them).
3. Or add a legal, no-move flip (a "wait"/self-flip action) — this **is** a core-rule change and needs the Game Designer + Playtest Analyst + Orchestrator route and a new ADR.

## 5. Validator self-tests (negative cases)

`scripts/validate-levels.ts` carries 10 negative cases and requires each to be rejected **by an error message that names the invariant** (`ok === false`, message matched, input object unchanged → no auto-repair): goal-is-wall (both phases), out-of-bounds, duplicate coordinate, spawn-inside-wall, dangling door reference, portal degenerate pair, portal end on its own `activePhase` wall, unknown field (strict schema), missing `par`, grid over the R-L2 cap (8 × 8 without Orchestrator approval). Current status: **10/10 rejected by name**; the suite also proves the *non-zero exit* path (a deliberately broken copy of `l003.json` in a temp dir → `RESULT: FAIL`, exit code 1).

## 6. Interface contract (frozen — GAME-001 imports from `@/core/level`)

Exported by `src/core/level/index.ts`: `Coord`, `DoorDef`, `SwitchDef`, `PortalDef`, `Level`, `LevelSchema`, `validateLevel`, plus `Phase`, `LevelInput`, `LevelSchemaOutput`, the sub-schemas and the small helpers `coordKey` / `sameCoord` / `formatCoord`. Coordinate representation: **`Coord` tuples `[x, y]` in JSON and in this module**; the runtime state layer uses `Vec = { x, y }`; conversion happens **once**, in the loader / `initialState`. The level layer is a single module on purpose (see its header comment): the frozen `tsconfig.json` has no `allowImportingTsExtensions`, and Node's type stripping needs explicit `.ts` specifiers, so a single-file module with only `zod` as an external import satisfies the compiler *and* a no-build `node scripts/…` run.

## 7. Next handoff

- **SOLVER-001 (Level AI + Solver):** BFS over `applyMove` from `@/core/rules` — shortest solution + `par` verification + reachability from every reachable state (embedded states included) for these five levels, then difficulty metrics.
- **Game Designer / Orchestrator:** §3–§4 — the M0 parity question and the L4/L5 Aha, plus the `par` inconsistency in `docs/level-design.md` §1.
- **Then:** the LLM candidate pipeline (`docs/ai-native-pipeline.md`) can consume `validateLevel` unchanged: schema → rules → BFS → metrics → accept/reject, with rejection (never repair) at every gate.
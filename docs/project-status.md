# Project Status — Phase Shift: Echo Grid

> Owner: **Orchestrator (Agent 0)** · Updated: **2026-10-14**
> Read this first when resuming a session; it is the recovery entry point.

---

## ⛔ CRITICAL FINDING — GATE D (2026-10-14, proven three times independently)

**ADR-0008 clause 8 ("parity genuinely rewires feasible routes from L1 onward") is FALSE for M0-only content.
OQ-1 is therefore REOPENED.** Option B is a legal, deterministic rule — but it does not deliver the dynamism
it was chosen for.

The theorem (bipartite grid + flip-on-every-move ⇒ arrival move count for a tile is fixed by the tile):
every path from `S` to `T` on a 4-connected grid has the same length **parity**, and a refusal costs no move,
so **the phase in which a tile is entered is a function of the tile alone**. A detour adds 2 moves, never 1.
Consequences, all verified: a wall whose solid phase equals its tile's entry phase is a **permanent obstacle**;
a wall whose solid phase is the other phase is **permanently passable decoration**; and **no tile can ever be
"refused first, then entered later"** — which is exactly what L4/L5 and ADR-0008 clause 8 require.

Evidence (three independent derivations, no shared code):
1. **GAME-001** — analytic proof + 200-board / 3782-state sweep: 0 reachable tiles with 2 phases.
2. **LV-001R** — same proof, independently derived + 4000 random levels × 4 mechanic mixes:
   M0 walls → 0 dynamism; **M1 doors alone → 0 dynamism**; M3 switch+door → 231/500; M2 portal → 233/500.
3. **Orchestrator** — my own BFS harness driving the shipped `applyMove` (outside the repo):
   **400 random M0 boards → 0 dual-phase tiles, 0 parity-theorem violations.**

New authoring law discovered while verifying (Orchestrator TEST 2): **a portal breaks the position→phase
function only if its two ends sit on opposite checkerboard colours.** Same-colour ends leave the board
static (measured: 0/15 vs 15/15 dual-phase tiles). This must become a validator rule + a level-design law.

Effect on the five shipped prototype levels (measured, `par` itself is correct — my BFS shortest = 4/5/6/6/6):

| Level | dual-phase tiles | real walls | decoration walls | verdict |
|---|---|---|---|---|
| l001 | 0 | 0 | 0 | fine (teaches tap→flip only) |
| l002 | 0 | 0 | 0 | fine (teaches cause→effect) |
| l003 | 0 | 1 | 0 | refusal works, but it is a **permanent** refusal, not a parity gate |
| l004 | 0 | 1 | 1 | **cannot deliver its lesson** ("the wall that said no is now walkable") |
| l005 | 0 | 2 | 1 | **Aha #1 does not exist** on M0; one wall is pure decoration |

All five are solvable with **0 dead states** (level-design §4 invariant holds). `docs/level-design.md` §1's
example is additionally internally inconsistent (`par: 6` vs its own 4-move `R,R,R,R` trace, and its
`phaseAWalls [[2,0]]` is decoration).

**What is NOT in question:** the locked invariants (no manual switch, illegal = identity, never crushed,
one shared `applyMove`, determinism) all survive; GAME-001's engine passes 69 self-checks and my harness
drives it without a single contradiction. The failure is in the **justification and the level plan**, not in
the code's conformance.

**Human decision required (GATE D)** — options are analysed in the escalation message; no agent may pick one.

**GATE D RESOLVED (2026-10-14, human chose D3 — mechanics forward, core rule unchanged).** Recorded as
**ADR-0009**; `game-design.md` V0.5 + `level-design.md` V0.4 propagated (`e189145`). M3 promoted OPTIONAL→CORE,
M1 never ships alone, door+switch unit at L6–L10 with **Aha #1 (latch) at L8**, M2 portals at L11 under the
**opposite-colour law**.

**Verified design law (found + then refuted by measurement, both useful).** I hypothesised that a permanently
unenterable wall would render as a **hollow "passable" ghost** while still refusing the tap — reproducing the
exact "reads as broken input" failure ADR-0007 exists to prevent. **Refuted by program**: 5 shipped levels →
0 such tiles; 400 random boards with **1,581** permanently-unenterable wall tiles → **0** lying tiles. Cause: the
phase current while the player stands on any neighbour of `T` **is** `entryPhase(T)`, so a parity-dead wall is
only ever seen solid at the moment it can be tapped. **Consequence: `ui-ux.md`'s filled-blocks / hollow-passes
axis can never be violated by level data — an executable guarantee, and a QA test to pin.**
Terminology corrected: a wall solid in the tile's *other* phase is not "decoration", it **is** the phantom-walk
vehicle (enter → solidify underfoot → walk out). Parity-dead walls are ordinary permanent geometry.

**Corollary found by LV-002A (sharp, and it collapses an old assumption).** In Option B, under the invariant,
**any single-phase wall that ever refuses a tap is necessarily a permanent obstacle** — a wall blocks only in its
own phase, and the entry phase of a fixed tile is forced, so "it refused me" and "I can never enter it" are the
*same event*. Therefore **refusal never means "wrong timing"** anywhere in M0: the L3 "refusal is a free tutorial"
lesson is a tutorial about *permanent* geometry, and the phantom walk (L4–L5) is the only wall-related beat that
can ever surprise a player. Validator severity was corrected accordingly (parity-dead wall = **warning** for all
ids, never an error; portal data violations stay hard errors) — the original error-level instruction was an
Orchestrator dispatch mistake, caught by the agent refusing to soften a check that contradicted the engine.
**Open design ruling (matters when L11 is authored, not before):** should a *same-colour* portal pair be a hard
error? It is provably inert for parity but is a legitimate shortcut. Owner: Game Designer + Architect.


---

## Current milestone

**Stage 0 (Design Lock) + Stage 1 (Asset Requirements) — COMPLETE.**
**GATE C is decided and documented: the core rule is now Option B (ADR-0008). Docs baseline is V0.4.**
**Stage 2 (5-level Prototype) — STARTED, in flight.**

The key correction made this session: **Stage 2 code is NOT blocked on art.** Walls, ghosts,
phase feedback and the player's in-wall state are all **program-drawn vector tokens**
(`docs/ui-ux.md` §9.1), so core rules, the Solver and level data can be built now. Only the
**final visual polish and the §3.3 screenshot readability review** still wait on GATE A.

## Completed

- **Recovery:** working tree had every tracked doc deleted; restored non-destructively from `HEAD`. Nothing lost.
- **Model routing:** 5-model smoke test + vision probe → `docs/ai-model-matrix.md` (only `qwen3.8-max` takes image input).
- **Multi-agent studio:** `AGENTS.md`, `opencode.json`, `.opencode/agents/` (10 roles). Verified loaded live.
- **GATE C / Option B rule change (the big one):** 8 locked clauses in **ADR-0008**, propagated to
  `game-design.md` **V0.4**, `level-design.md` **V0.3**, `architecture.md` **V0.4**, `ui-ux.md` **V0.4**,
  plus supersession/revision banners on **ADR-0006 / ADR-0007** and an addendum on `architecture-0001`.
  **OQ-1 is RESOLVED**: parity-dependent entry makes M0 walls real gates, so L1–L20 stop being static mazes.
- **Toolchain scaffold (Orchestrator-owned, single writer):** Vite + TypeScript + Vitest + zod, `@/*` alias,
  mobile-first `index.html`, `.gitignore` that blocks `.env`/credentials. Evidence: `typecheck` clean,
  `vite build` succeeds, `vitest` runs (no test files yet).
- **Codex art prompts:** `docs/assets/codex-generation-brief.md` (per-task) + `docs/assets/codex-master-prompt.md`
  (single paste block) — 11 files with paths, sizes, alpha, negatives, acceptance criteria.
- **Review:** RV-001 (1 BLOCKER / 5 HIGH / 8 MEDIUM) + reconciliation → V0.3 baseline.
- **Docs:** `iteration-log.md` ITER-0001…0004, `submission/*`, `ai-usage-log.md`.

## In progress (background agents)

| Task | Role | Scope | Files owned |
|---|---|---|---|
| **LV-001** | Level AI + Solver | zod `Level` contract + validator invariants + `l001–l005.json` + `scripts/validate-levels.ts` | `src/core/level/**`, `src/levels/**`, `scripts/**` |
| **GAME-001** | Gameplay Engineer | pure-TS `src/core/state/**` + `src/core/rules/**` (`solidAt` / `isLegalMove` / 6-step `applyMove`, Option B) | `src/core/state/**`, `src/core/rules/**` |

Seam rule enforced by dispatch: **Level type lives in `src/core/level` (Level AI owns it); GAME-001 must
not create, mock or fork it** — it imports it or reports BLOCKED.

## Blocked

| Blocked work | Blocked by |
|---|---|
| ~~All gameplay/solver/UI coding~~ | **UNBLOCKED** — core/solver/levels are code-only (see milestone note) |
| Final art integration, §3.3 readability + screenshot review, in-app token re-verify | **GATE A** — P0 assets (`echo_spirit_a/b`, `bg_phase_a/b`, `goal`) |
| SOLVER-001 (BFS + difficulty + `par` backfill) | needs `src/core/rules` + `src/core/level` to exist |
| QA-001 (rule unit tests, import-boundary test) | needs GAME-001's exported API surface |
| RENDER-001 (Phaser board scene) | needs core rules + `ui-ux.md` V0.4 tokens (V0.4 is now done) |
| Any level beyond L10 | must be Solver-proved first; L1–L5 must pass the prototype gate |

## Human gates

- **GATE A — Initial visual assets:** **`GENERATING` via the user's own Codex channel.**
  ASSET GATE compliance: final art is **not** generated by any Studio Agent; the human authorised and
  operates the generation channel personally. Agents only supply prompts, then validate / rename / register.
  Minimum unblocking set = **T04, T05, T06, T07, T08**.
- **GATE C — Core-mechanic decision (OQ-1):** **RESOLVED — Option B chosen by the human (2026-10-14)**,
  recorded as ADR-0008, propagated across all four design docs.
  **Its verification obligations are still open:** Stage 2 playtest must confirm (a) players discover
  parity-entry without text by L3–L5, (b) the embedded state reads as safe not buggy, (c) parity planning
  reads as depth not chaos. Plus **every level must be re-Solver-verified — all pre-ADR-0008 results are void.**

## Frozen facts (do not re-derive)

- Dependency pins: **phaser 3.90.0 · zod 4.6.7 · typescript 5.9.3 · vite 7.3.7 · vitest 5.0.4 · jsdom 26 · node 24**.
  ⚠ `phaser`'s npm `latest` tag is **4.2.1** — the stack is locked to Phaser 3, so it must stay pinned `^3.90.0`.
- Board size hard cap **7×7** (`ui-ux.md` R-L2, 44 px touch floor at 320 px). 8×8 requires explicit
  Orchestrator approval; agents may not widen it themselves.
- `src/core/**` never imports Phaser. Gameplay and Solver call the **same** `applyMove`. One truth source.

## Relevant commits / branches

- Branch model: `main` (stable) ← `develop` (integration) ← `agent/<role>/<task>`. Only the Orchestrator merges/pushes.
- `develop` (pushed): `e69d1bf` docs(ui) V0.4 · `c2f878c` docs(architecture) V0.4 · `e9b9e9d` docs(design) ADR-0008 ·
  `41999be` + `5551bae` toolchain scaffold · `6976506` + `06ac909` Codex prompts · `4212100` stage-0 V0.3 baseline.
- `main` = tag `stage0-baseline` (`3a94d4c`, V0.3). **Held** until the Option B doc set passes review RV-002,
  then merged + tagged `stage0-v0.4-gate-c`.
- Pre-recovery local `main`: `0345c52` (7 commits, never pushed) — historical only.

## Next tasks (in order)

1. **LV-001 + GAME-001 return** → Orchestrator verifies typecheck + validator evidence, commits `feat(core)` / `feat(level)`.
2. **RV-002:** read-only Reviewer over the changed rule set (docs) and the new core code.
3. **SOLVER-001** (BFS: solvability, shortest solution, `par` backfill, difficulty metrics) + **QA-001** (unit + property + import-boundary tests).
4. **RENDER-001** (Phaser shell, token vectors, dev placeholder art — no final art).
5. **GATE A intake:** Agent 5 validates the delivered images → register `DELIVERED` → `feat(assets)`.
6. **DG-004:** `ITER-0005` + fix `submission/design-thinking.md` and `submission/iteration-optimization.md`,
   both of which still state the withdrawn **union property** as current truth (found by grep this session:
   `design-thinking.md:125`, `iteration-optimization.md:29`).
7. **Prototype playtest gate:** ≥ 5 non-developers; ≥ 4/5 understand without explanation; ≥ 3/5 want level 6.
8. **LV-003 (queued, Level AI + Solver):** two small doc-in-code corrections found by QA-001 — `src/levels/README.md` §3 attributes the position→phase break to M3
   switches (a switch never relocates the player, so `dualPhaseTiles` stays 0; M3 breaks *door enterability*, i.e. `refusedThenEnteredTiles`), and the headers of
   `src/core/level/index.ts` + `scripts/validate-levels.ts` still claim "no `tsx` / no build step" now that `npm run levels` uses tsx.
9. **RENDER-001 cleanup:** `src/core/rules/applyMove.ts:140-150`'s NOTE comment predates AR-0004's portal ruling — the code is correct, the prose is stale.
10. **LV-003 (severity correction, must apply after LV-002A lands):** I dispatched LV-002A to make a parity-dead wall an **error** for `id ≤ 20`. That instruction is now
    **known wrong** — a parity-dead wall is honest, permanent geometry (measured: 0 lying tiles in 400 boards), so erroring on it would reject legitimate levels
    including the re-labelled L4/L5. Correct policy: **warning** "this tile can never be entered on any move count — permanent geometry, fine, but never sell it as
    a mechanic"; **hard errors only for provably inert or illegal data** (same-colour portal pair; portal end on a wall tile or door tile per `architecture.md` V0.5 §7).
    Add the complementary positive check instead: for a level whose documented lesson is the phantom walk, the **shortest solution must cross at least one
    other-phase wall tile** (BFS-decidable), and for the latch levels the ADR-0009 formula "no solution with all switches off + shortest solution presses the switch
    and passes the door that refused the greedy approach\". Also pin the new guarantee as a test: **a wall is never rendered as a hollow ghost while refusing entry.**
    → **LANDED** (`776e387`, gate green again: 5/5 ok, l003/l004/l005 carry 1–2 warnings, exit 0).
11. **chore(format) sweep (defer to the RENDER-001 boundary):** `.prettierrc` (`printWidth: 80`) is not satisfied by pre-existing `src/core/rules/solid.ts`,
    `src/core/rules/applyMove.ts`, `src/core/state/types.ts` — LV-002A conformed its own new lines and deliberately did not reformat outside its scope.
    Run `prettier --write` over `src tests scripts` only (docs are ignored; README/submission must not be swept while DG-005 edits them), as one isolated commit.
12. **LV-004 (queued, Level AI + Solver — unblocks playtest hypothesis b):** no shipped level **forces** the phantom-walk embed. `l004`/`l005` *permit* walking
    through a ghost tile but an embed-free route of equal `par` exists, so PA's protocol must record **b = `NOT TESTABLE`** on this build. Author one L4/L5-shaped
    level whose **shortest solution must cross a tile that is a wall in the arrival phase** (BFS-decidable: the walking-only subgraph has no embed-free par route),
    and add that as a positive Solver check for any level documented as teaching the phantom walk. Without it, Option B's only genuinely new *perceptible* beat
    cannot be tested at all — the stage-2 gate would go in blind on exactly the thing GATE D kept the rule for.
13. **PA-003 (dispatched):** §9's hypothesis alphabet collides with ADR-0009 (V0.3 used a1/a2/c; ADR-0009 mandates a′/b/c′/d′ after the human decision) and
    still described GATE D as undecided. Two metric provenances were also mixed (LV-001R's 231/500 board-share vs the 74/200 decision-tile count) — different
    quantities, same sentence.
14. **LV-005 (queued, Level AI + Solver):** hard-error **door ∩ wall overlap on the same tile**. This is the *only* lying-tile construction I can build (see the
    legibility law below): an A-wall that also carries a red door refuses entry in phase B (door closed) while the wall visual says hollow = "passable now".
    Measured: 3 reachable states on a 5×5 probe. Doors already provide full solidity on their own, so banning the overlap costs no puzzle value and deletes the hazard.
    Shipped content has zero doors, so nothing currently fails — this must land **before L6 authoring**, not after.
15. **UA-0005 (queued, UI/Art Director):** `ui-ux.md` must state the **per-tile visual precedence** when a tile carries more than one obstacle source
    (closed door > ghost wall > floor). Today the spec defines each object's appearance but not the arbitration, which is what lets case E above read as a lie.
    Fold into the V0.5 pass; no dependency on RENDER-001 (shipped levels have no doors).
16. **GD-007 (tiny, batched with the L6 authoring pass):** `docs/level-design.md` §1 lines ~43/46 still cite the withdrawn "0/200" figure and describe the
    same-colour-portal rejection as a "validator rule to be added" — that rule has since **landed** (`npm run levels` rejects every same-colour pair, 0/400 legal).
    GD-006 correctly stayed out of scope and flagged it instead of widening the edit.

**The 9/200 residue — CLOSED, and the fault was mine.** LV-002B proved doors-only content cannot produce a refused-then-entered tile at all (exhaustive
1,048,576-board sweep, 0 exceptions; 2,000-board randomized scan, 0/2000; plus a latch positive control showing the metric is genuinely live). I then found the
root cause in **my own** out-of-repo harness: it fabricated the initial state as `{ doorsOpen: {} }` instead of calling `initialState(level)`. Door openness is
**derived** from `(color, currentPhase, switchesOn)` (`baseDoorOpen`: **red open in A, blue open in B**), so the harness believed a red door was closed at move 0
when the game has it open — the first click of every such board was refused by a state that does not exist in the game. Re-running my generator against the
shipped solver: **15 boards, my metric fires on 15, the shipped metric on 0.**

Re-measured on the program of record (`src/core/solver/bfs.ts`, valid generator, 400 boards/class — sent to GD-006 to replace the cited table):
M0 walls 0/374 · **M1 doors alone 0/370** (9/200 withdrawn) · **M1+M3 142/369 ≈ 38 %** (74/200 was right in magnitude) ·
**M2 opposite-colour 200/203 solvable boards with a decision tile and 203/203 with dual-phase tiles** — my earlier 80/200 *understated* portals because invalid
boards diluted the rate · M2 same-colour **0/400 boards even pass validation** (LV-002A's check makes ADR-0009's opposite-colour law machine-enforced).

**Sharper mechanism statement (this is better than the number):** a door is *already* phase-conditional solidity — it is not inert without a switch. It is static
alone because derived solidity meets fixed entry parity. **M3's contribution is turning a tile's solidity from a function of the phase into a function of history.**
That is the real reason doors must ship paired with switches, and it does not depend on any scan.

**Legibility law, scoped by measurement (answers DG-005's open question (a)).** `filled = blocks / hollow = passes` is never violated by: pure M0 boards
(0/400), or **portal-bearing** boards — an opposite-colour portal does not create lies, it *removes* deadness: the tile that was permanently unenterable becomes
enterable from a portal-arrived phase-B state, which is exactly Aha #2's construction. The guarantee therefore holds for everything the player can meet today, and
breaks **only** for door ∩ wall overlap (item 14/15).

## Guardrails

- Never edit `src/core/**` from a Phaser-importing file; the Solver never depends on Phaser.
- One writer per file. Agents never `git push`; only the Orchestrator merges.
- Never place final art without an `asset-request-*.md` and a human-authorised generation channel.
- LLM opinion never replaces the program Solver. "Should work" is not evidence.
- Two agents may not touch `GameState`, the level schema, core rules, `package.json`, `opencode.json` or `AGENTS.md` at once.

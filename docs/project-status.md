# Project Status — Phase Shift: Echo Grid

> Owner: **Orchestrator (Agent 0)** · Updated: **2026-10-15** (ART-INTAKE close-out, item 25)
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

**Stage 0 / Stage 1 — COMPLETE. GATE C = Option B (ADR-0008). GATE D = D3 (ADR-0009).**
**Stage 2 — PLAYABLE AND FEEL-PASSED (L1–L5 shipped).** `develop` = integration round **`0a88d0c`**
(2026-10-15: UA-0006 ui-ux **V0.7** + PA-005 + LV-006 L6–L10 *authored, proved, not yet registered* +
art-validation record) — tsc 0, vitest **13 files / 176 passed / 3 skipped**, solver **10/10**, build ok.

The game runs in a browser: L1–L5, keyboard + tap + swipe + HUD buttons, undo, restart, win
dialog, level advance, `?level=<n>` deep link. The feel pass (R-001b) landed the flip
cross-fade, the §6.5 refusal nudge and the R-C13 occupied-resolution beat, and §3.1d's
intra-L4 stack is now data instead of an accident.

**What is still true about the 5 shipped levels:** they carry **no mechanical Aha by design**
(ADR-0009 D3) — the first decision tile arrives at L6 (doors + switch, shipped only as a pair).
Retention for L1–L5 rests on cadence and is measured by hypothesis `d′`, which is runnable today.

### Orchestrator-verified in a real browser (2026-10-15, `127.0.0.1:5173`)

| Check | Result |
|---|---|
| `?level=` deep link | `?level=1/3/4/5` → L01/L03/L04/L05; `99` / `abc` / `0` → L01 (entry-only, no unlock) |
| Refusal = identity (ADR-0008 cl.1) | out-of-bounds press → `moves` unchanged **and** phase chip unchanged; 12 file-level checks + browser agree |
| Phantom walk | L4 `↑,→,→` → embedded at `(2,0)`, `moves 3`, phase 夜晚; walking out and undo behave |
| Fast input | 10 presses in 1374 ms → `moves 10`; counter never exceeds presses; no drift after 2.5 s idle |
| Tap-to-move | a **trusted** (CDP) click at the canvas centre moved the player and flipped the phase; the layout model from `grid-mapping.computeLayout` (cellSize 205 device, grid (33,162) at that viewport) predicted the hit cell exactly |
| Real-render pixel audit of the embedded tile | centre band **100 % actor body**; mid band 51 % `wallOccupied` + 47 % actor; edge band 12.6 % `wallEdge`. Contrast `wallOccupied` vs `wallEchoFill` = **1.28:1** (matches the offline arithmetic) — the "that tile changed" beat is carried by the edge stroke (3.65:1) and by the player sitting on top (4.62:1), **not** by the fill |

⚠ **Measurement caveat (recorded, not explained away):** `synthetic` `PointerEvent`/`TouchEvent`
dispatch in this embedded browser is unreliable — one run showed 12 moves appearing while every
per-step HUD read said 0, and one readout reported the wrong level id after concurrent agent edits
(HMR). Trusted input and clean reloads behave exactly as specified. **Any future input evidence must
come from CDP/Playwright events, never from dispatched synthetic events.**

## Completed

- **Stage-2 build-out (this is the part the sections above predate):** pure core (`src/core/state/**` + `rules/**`, one
  `applyMove` shared by Gameplay and Solver), level contract + validator (parity-dead wall = warning, portal-end-on-wall and
  same-colour pair = hard errors, door∩wall = hard error), `src/core/solver/bfs.ts` as the **program of record** with
  `scripts/solve-levels.ts --audit` gating all five levels (par machine-verified 4/5/6/6/6, 0 dead states), QA suites
  (`tests/**`, 12 files / 137 passed / 3 named-debt skips) including the solver positive and negative controls, and the playable
  Phaser slice `src/game/**` (L1–L5 in a real browser, feel-passed). Docs baseline now: `game-design` V0.5, `level-design` V0.4,
  `architecture` V0.5, **`ui-ux` V0.6**, `playtest-log` V0.4, ADR-0008 + ADR-0009.
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

**R-002** (Gameplay Engineer, background) — door/switch/portal painters + L6–L10 registry unlock, isolated worktree
`~/.local/share/opencode/worktree/f9a5d9/r-002-painters` (base `5624558`, branch `agent/gameplay/r-002-painters`).
Visual acceptance is NOT his call: Orchestrator smoke + UA vision review + §6 iteration-log entry gate before merge.

**LV-007A** (Level AI + Solver, background) — enforcement & pinning batch (m-2 negative controls, m-5 UNSATISFIABLE
guard+whitelist, n-14 named gates (v)(vi), n-18 pin hardening, switchRequired obligation L7–L10 per OQ4 ruling),
isolated worktree `~/.local/share/opencode/worktree/f9a5d9/lv-007a-enforcement` (base `99e3f90`). **LV-007B** (metrics:
B/T/R→`D`, n-11 route pruning + `maxRouteVisits`, m-8/9/10 doc lines, first real `D`-dip verification at L5→L6 /
L10→L11 seams) queued for the next free slot. Deferred design question from GD-007: whether "below OFFERED" becomes a
named teaching grade (kept descriptive for now).

**QA-004** (QA Engineer, background) — independent second-implementation reproduction of the ART-INTAKE audit
numbers (`audit.json`) + suite regression, read-only, no commits. It can now only trigger a **corrigendum** to
`docs/assets/art-acceptance-2026-10-15.md`, not reopen a ruling. Everything else has returned; the art intake docs are
now **committed (`0a88d0c`)** — only `assets/` (candidate PNGs) stays untracked pending the storage ruling. Reliability note: a batch of
five concurrent dispatches produced four transport timeouts; the survivors were judged **by disk
evidence**, not by their silence — `tests/helpers/search.ts` + `tests/solver/**` had landed (QA-002),
while `docs/ui-ux.md` / `docs/playtest-analysis/**` / `docs/architecture.md` were untouched (re-dispatched
afterwards). A scratch `tests/_probe.test.ts` marked "TEMPORARY probe — deleted before delivery" was
removed by the Orchestrator before commit. Rule kept: **one writer per file, one deliverable per dispatch,
and a path must be quiescent before dispatch.**

## Blocked

| Blocked work | Blocked by |
|---|---|
| ~~SOLVER-001 / QA-001 / RENDER-001~~ | **DONE** — solver, suites and the playable slice are on `develop` |
| Final art integration, §3.3 readability + screenshot review, in-app token re-verify | **GATE A revision cycle** — intake ran 2026-10-15: `goal` PASSED; P0 blockers now = redelivered **req-08 (spirit pair) + req-11 (background pair)**; integration also waits on commit authorisation (item 25) |
| Scoring playtest sessions | §9.1 **BUT table must be filled with a committed SHA** first (PA-004 Risk 1: the build was uncommitted when the sheet was written — it is committed now, `9c4b5a1`) |
| Hypotheses `a′` (latch) and `c′` (portal) | need L6–L11 content + Solver proof (ADR-0009 D3 schedule) — **not testable on this build**, recorded as `NOT TESTABLE ON THIS BUILD` |
| Stage-2 sessions (any hypothesis) | **10 non-developers** (5 Cohort P + 5 disjoint Cohort V). With only 5, `ui-ux.md` §3.3 is recorded `NOT RUN — no fresh cohort` |
| L6+ door/switch **shipping** (not authoring) | `R-002`: doors and switches have level-data rules and validator bans but **no renderer yet** — an invisible door is a lying tile |
| Any level beyond L10 | must be Solver-proved first; L1–L5 must pass the prototype gate |

## Human gates

- **GATE A — Initial visual assets:** **`WAITING_FOR_USER_ASSETS` (revision cycle, 2026-10-15).**
  First batch (11 PNGs) formally intaken — **3 PASS (`cover_hero`, `logo_mark`, `goal`) / 8 REJECTED / 0 PENDING**;
  rulings + evidence in `docs/assets/art-acceptance-2026-10-15.md`, status in `asset-manifest.md` V0.5.1, machine-
  retestable revision gates in `asset-request-08..12-*.md`. ASSET GATE compliance held: generation stays the human's
  own Codex channel, agents only prompt / validate / register; no PNG overwritten (sha256 11/11 at close-out).
  Minimum unblocking set now = **req-08 + req-11**; req-09/10/12 follow.
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
- `develop` (pushed, newest first): **`HEAD`** docs(status) integration round · **`0a88d0c`** docs(assets) art-validation
  record · **`aa520ae`** merge LV-006 · **`efa6be6`** merge PA-005 · **`993bc4c`** merge UA-0006 V0.7 · **`41d5a4b`** docs(status) playable + feel-passed (LV-005/UA-0005/PA-004 landed, suite 12 files / 137 passed / 3 skipped, solver 5/5, CI green) · **`9c4b5a1`** merge R-001b + PA-004 · `db730bc` feat(game) flip cross-fade /
  occupied beat / §3.1d stack · `1c1a540` feat(game) `?level=` entry selector · `9db9938` docs(playtest) field
  sheet · **`a4a1fb7`** merge UA-0005 (`a5cf280` ui-ux **V0.6**: §3.1d R-Z1…R-Z6 precedence, R-P3 rewrite,
  §5.4/§7.4 corrections) · **`0f53076`** merge LV-005 + QA-002 (`5f9e5f7` door∩wall hard error,
  `a5ca3e2` solver suite) · `040ff46` merge RENDER-001 first playable · `4a7f3ed` LV-002A+LV-003 ·
  `b3dbfcc` PA-002 · `f05248b` LV-002B · `777911c` DG-005 · `d7a50fb` GD-006.
  Agent branches kept for provenance: `agent/gameplay/r-001b-feel`, `agent/playtest/pa-004-notes-sheet`,
  `agent/ui/ua-0005-precedence`, `agent/qa/qa-002-solver-tests`, `agent/level/lv-005-door-wall-overlap`.
- **Integration round 2026-10-15 LANDED (pushed):** `agent/ui/ua-0006-rulings` (`544e4a5`, ui-ux **V0.7**) → merge `993bc4c` ·
  `agent/playtest/pa-005-unblock` (`c5aa157`, PA-005) → merge `efa6be6` · `agent/level/lv-006-doors-switch-l6-l10`
  (`0775621..63f6b69`, 8 commits; RV-004 merge-after-correction, all five corrections re-verified by Orchestrator) → merge `aa520ae` ·
  art-validation record (acceptance + requests 08–12 + manifest V0.5.1 + delivery) → `0a88d0c`. The three branches are kept
  for provenance alongside the list above. **Working tree now carries only `assets/`** (11 candidate PNGs, sha256-pinned,
  read-only) — held **untracked pending the user's storage ruling** (into Git vs `.gitignore`). L6–L10 stay solver-side data:
  playable registry remains L1–L5 until R-002 lands the door/switch/portal painters (invisible latch = lying tile).
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
12. **LV-004 (re-scoped, Level AI + Solver — the blocking premise was WRONG, mine not PA's):** I had queued this as "author a level that forces the phantom-walk
    embed, because nothing shipped forces it". **Measured: `l005` already forces it.** Enumerating *every* `par`-length solution of every shipped level and testing
    arrival solidity (`solidAt(level, newPhase, doorsOpen, arrival)`):
    `l001` 1 route / 0 embed · `l002` 10 / 0 · **`l003` 6 / 0** (its only wall is parity-dead = permanent obstacle, never entered — the honest L3 lesson) ·
    **`l004` 6 routes, 3 embed and 3 embed-free** (offered, not forced) · **`l005` 3 routes, 3 embed — FORCED on every shortest solution.**
    So the ladder already reads *permanent refusal → optional phantom walk → forced phantom walk*, which is exactly what ADR-0009 and `level-design` V0.4 claim, and
    **playtest hypothesis (b) is runnable on the current build**. LV-004 shrinks to hygiene: expose `embedRoutes / parRoutes / embedForced` from the solver, print it in
    `scripts/solve-levels.ts`, and assert that any level documented as teaching the phantom walk **forces** it (l005 passes today; l004 must be documented as *offering*).
    Do **not** re-author l003–l005 — a false premise nearly produced that work.
12b. **PA-004 (tiny, queued):** `docs/playtest-analysis/stage2-adr0008-gated-protocol-notes.md` still uses the withdrawn (a1)/(a2)/(c) labels — outside PA-003's file
    grant. Reconcile it against the §9.1 mapping table so the field sheets and the protocol cannot disagree mid-session.
    → **LANDED** (`9db9938`): new printable `stage2-field-sheet.md` (V0.1, 4 pages: per-level grid R1–R12 with every column
    defined, probe card, OBS-1…OBS-10 runnable today, build facts + honest limits); the old notes file got a dated correction
    banner instead of a rewrite; `Confusion: D1? D2? D3?` **deleted** (D2/D3 are defined nowhere; D1 is a post-L5 probe, now on
    the probe card), `Continue?`/`Next level wanted?` replaced by the canonical CI-beh/CI-self pair, and the hypothesis columns
    removed entirely (hypotheses are verdict-level, never a field entry). **PA-004 also corrected two errors in MY dispatch
    brief, with the shipped program:** the **forced** phantom walk is `l005`, not `l004` (l004 offers it: 3 of 6 par routes), and
    `levelWon` carries **no** `restartCount` (restarts come from the `restart` event). Briefs must cite the record, not memory.
13. **PA-003 (dispatched):** §9's hypothesis alphabet collides with ADR-0009 (V0.3 used a1/a2/c; ADR-0009 mandates a′/b/c′/d′ after the human decision) and
    still described GATE D as undecided. Two metric provenances were also mixed (LV-001R's 231/500 board-share vs the 74/200 decision-tile count) — different
    quantities, same sentence.
14. **LV-005 (queued, Level AI + Solver):** hard-error **door ∩ wall overlap on the same tile**. This is the *only* lying-tile construction I can build (see the
    legibility law below): an A-wall that also carries a red door refuses entry in phase B (door closed) while the wall visual says hollow = "passable now".
    Measured: 3 reachable states on a 5×5 probe. Doors already provide full solidity on their own, so banning the overlap costs no puzzle value and deletes the hazard.
    Shipped content has zero doors, so nothing currently fails — this must land **before L6 authoring**, not after.
    → **LANDED** (`5f9e5f7`): `validateLevel` hard-errors on a door tile that is also a phase wall (coordinates in the message,
    existing hard-error format), `scripts/solve-levels.ts` now runs the rule gate *before* BFS, adjudication recorded in
    `docs/ai-native-pipeline.md` §3b ("door ∩ wall = illegal data, never *the door swallows the wall*"). Counterexamples
    (door∩A, door∩B, door∩both) rejected; opposite-colour portal pair and door/switch on empty tiles still pass; 5/5 gate PASS.
15. **UA-0005 (queued, UI/Art Director):** `ui-ux.md` must state the **per-tile visual precedence** when a tile carries more than one obstacle source
    (closed door > ghost wall > floor). Today the spec defines each object's appearance but not the arbitration, which is what lets case E above read as a lie.
    Fold into the V0.5 pass; no dependency on RENDER-001 (shipped levels have no doors).
    → **LANDED** (`a5cf280`, ui-ux **V0.6**): new **§3.1d** with one fixed total order —
    **player > door > wall > goal > switch > portal > ground** (R-Z1…R-Z6). UA *deviated* from my suggested starting point by
    inserting **goal between wall and switch** and justified it on measurement (`obj.goal` vs door token 1.50:1 / 1.13:1 — a ring
    over a closed door promises a win the rules refuse) plus the validator dependency (goal∩wall is unreachable, ADR-0008 rule 7).
    R-Z5 states the precedence **legalises nothing**; R-Z6 flags **switch ∩ phase-wall** as unreadable in *both* stackings
    (1.18 / 2.58 / 1.14 / 2.97:1, all &lt; 3:1) and gates any M3 "integrated" claim on it (→ **OQ6**, belongs to Level AI +
    Game Designer). R-P3's unsatisfiable on-board label was rewritten to the shipped DOM strip; §5.4/§7.4 corrected to reality
    (`src/game/theme/tokens.ts`, scoped `touch-action`). §3.1d's *Implementation mapping* is what sent R-001b back in for a fix:
    the shipped renderer drew the **goal above walls**, and the new depth assertion would have cemented that inversion.
17. **R-002 (next gameplay ticket, Gameplay Engineer): paint doors, switches and portals.** The data layer bans the illegal
    combinations (LV-005, LV-002A) and the validator is green, but the renderer has **no door/switch/portal painter**, so L6–L11
    cannot ship yet: an invisible blocker is exactly the lying tile the legibility law forbids. Take the §3.1d slots (door on top
    of L4, `portal < switch < goal < wall < door < actor`) and the V0.5 door/portal contracts (§3.1b doors on the fill axis,
    §3.1c portals *off* it). Authoring of L6–L10 may run in parallel (it is proven by the Solver, not by the renderer), but the
    registry must keep L6+ **out of the playable slice** until R-002 lands — otherwise the build shows invisible doors to a playtester.
18. **UA-0006 (queued, UI/Art Director) — three rulings that only this role may make, all from measurements:**
    (a) **R-001b OQ-7**: §3.1d/§5.2 file the one-shot `fx.phaseRing` under **L6 `cellFeedback`** (above the actor), but
    `scaleFrom = 0.7` makes the ring exactly as wide as the body, so on the *only* tile where it fires — the embedded tile — an
    L6 ring would cover the player, which §6.3 and R-C13.1 forbid. The engineer kept it inside the actor container *below* the body
    and needs a ruling (reclassify, or move the geometry to `scaleFrom > 1`).
    (b) **R-001b OQ-8**: an out-of-bounds press is the core's illegal move (identity), so it also triggers the §6.5 nudge — but
    §6.5's cause list only names "a tile solid in the current phase", and out-of-bounds has no tile. Decide whether the nudge is
    correct there; note it is the **only** way a refusal tint is visible in phase B on shipped data (R-C9 turns the identity ring off).
    (c) **the embedded read** (my measurement + PA-004's independent recompute agree): `wallOccupied` vs `wallEchoFill` =
    **1.28:1** (A 1.15:1), so the fill axis does *not* carry "this tile solidified under you"; the real render shows the centre band
    **100 % actor body**, separation only from the 2 px edge (3.65:1) and the player on top (4.62:1). This pair is **not published**
    in §4.5/§4.6. Publish it, and rule whether the occupied state should move on the fill axis after all — this is the single biggest
    threat to hypothesis `b` (a player who never sees the tile change cannot call it a mechanic; they will call it nothing).
    Do **not** let anyone answer it by re-hueing or by a bigger nudge (§6.5 / §3.3a P-5).
19. **PA-005 (queued, Playtest Analyst) — unblock the sessions, don't add protocol.** Three concrete things: fill the §9.1 **BUT
    table** with the now-committed SHA (`9c4b5a1`, par 4/5/6/6/6, forced-embed = **l005**, key ghost `(2,0)` offered on l004);
    decide whether OBS-6's one-sentence recall probe becomes a **scored** (b) cell — that edit must land in §9.5 **before** the BUT
    table is committed, because T6 freezes it afterwards; and **freeze a Chinese verbatim script into Table C** (the canonical
    probes are English only; improvising a translation mid-session is a script deviation on a scored item, T7, and our cohort is
    Chinese-speaking). Also record `a′`/`c′` = `NOT TESTABLE ON THIS BUILD` in Table F rather than leaving them blank.
20. **QA-002B (queued, QA Engineer) — the part of QA-002 that died in a transport timeout.** Parts A and B landed and are green
    (`search.ts` is now a projection of `@/core/solver/bfs`, no second loop; `tests/solver/**` pins optimality-by-brute-force,
    unsolvable/dead states, `dualPhaseTiles` positive **and** negative controls, `refusedThenEnteredTiles` positive controls,
    same-colour portal rejection, `solve === analyse ∘ explore`). **Part C is missing**: the pure-logic legibility invariant over
    all reachable states, with the door∩wall board as the named `it.skip` counterexample, plus the seam tests R-001b asked for
    (`mixTheme` t≤0/t≥1 identity, `lerpActorLook` ring-alpha 1↔0 with no boolean flip, `requestedLevel` /
    `startIndexForLevel` / `startIndex` clamp, `assertLayerOrder` throws on the inversion). Then **QA-003**: Playwright E2E with
    *trusted* input only (`?level=` makes per-level E2E possible at last) — synthetic `PointerEvent` dispatch is banned as evidence
    per the caveat above.
21. **AR-0005 (queued, Architect — re-dispatch, its first attempt timed out having written nothing):** rule on Solver metric #7
    `refusedThenEnteredTiles` (measured **order-sensitive**: `down,right,up` fires it, `right,down,left` does not, on the same
    board) — advisory, re-defined order-free, or demoted to a diagnostic since `dualPhaseTiles` is already the order-free state-set
    metric and Aha #1's primary; and rule on the tokens-location split (§5.4 spec authority vs `src/game/theme/`) so the docs stop
    drift-chasing. State explicitly whether ADR-0009's Aha criteria, which currently cite #3 *and* #7, need editing — if so the
    ADR text change is Game Designer's to make on Architect's recommendation.
22. **LV-004 hygiene (still open):** print `embedRoutes / parRoutes / embedForced` in `scripts/solve-levels.ts` and assert that any
    level documented as *teaching* the phantom walk **forces** one (l005 does; **l004 must stay documented as offering**). The
    numbers PA-004 re-derived match item 12's record exactly, so this is plumbing, not research.
23. **GD-007** (stale §1 "0/200" + "validator rule to be added"), **LV-006** (author L6–L10 doors+switch as the paired teaching unit
    per D3, gated by the ADR-0009 latch criteria), **R-001c** (HUD touch geometry R-T1/R-T3/R-T5, bundle split at 1.35 MB / 377 kB
    gzip) and the `chore(format)` sweep stay queued behind 17–20.
24. **Human gates still owed by the user:** the art **revision batch** (ASSET GATE — intake done, item 25: P0 =
    **req-08 spirit pair + req-11 bg pair** redelivery), the **10-person cohort** answer (5 Cohort P + 5
    disjoint Cohort V), and a look at the served build — the embedded-state screenshot is in the Review pane because **aesthetics is
    not mine to judge**: I cannot see images, so "does the phantom walk read as a mechanic rather than a disconnect" is a human call.
25. **ART-INTAKE-2026-10-15 — CLOSED with verdict `WAITING_FOR_USER_ASSETS`.** Triple independent evidence: Orchestrator
   Pillow/numpy audit (every delivery-record claim reproduced exactly — spirit IoU **0.8584**, portal **0.9672**, logo
   margins 6.15/5.86 %, centre contrast 1.0937/1.3517 (min/max method confirmed); new findings: bg structural correlation
   **−0.0712** ⇒ cross-dissolve jumps, spirit_a bbox-fill 48 % off-band, ui_kit = 24 components ≠ claimed 13) + UA-0007
   vision acceptance against the per-request rubrics + RV-003 read-only review (**adopt-after-corrigendum**; all
   MAJOR/MINOR fixes landed, **0 rulings changed**). Result: **3 PASS** (`cover_hero`, `logo_mark`, `goal`) **/ 8 REJECTED /
   0 PENDING**; nothing APPROVED/DELIVERED/integrated; PNGs byte-identical (sha256 11/11 re-run at close-out; census
   geometry 24 components ↔ 13 elements cross-checked). Policy adjudicated by Orchestrator: generator upscaling = §11
   **flag, not reject**; nativeness becomes a forward re-acceptance gate. Revision batch filed — **req-08** spirit pair
   (B = recolour of A's alpha mask; IoU ≥ 0.99, bbox-fill 65–80 %, native 512), **req-11** bg pair (one composition lit
   twice; blurred structural correlation ≥ 0.9; native 1920×1080), **req-09** portals (IoU ≥ 0.99, trio framing 79 %±1,
   hue gates), **req-10** logo_primary (≥ 8 % margins, native 2048), **req-12** ui_kit (13 elements incl. back chevron,
   native 2048). Docs pending commit authorisation: acceptance record (Corrigendum RV-003 + final-verification residuals),
   manifest V0.5.1, req-08..12, this file. QA-004 second implementation in flight — corrigendum path only. Toolchain
   anomaly (RV-003 n-18): an external agent URL was injected into one tool-output stream; repo bytes verified clean
   (grep 0, `git diff` empty), not fetched — recorded, watching.
26. **LV-006 — MERGED (`aa520ae`).** First attempt died silently after one branch command
   (disk-judged, re-dispatched with small-commit discipline); second run delivered L6–L10 doors+switch unit
   (program-proved, `refusedThenEntered>0` on all five — the first genuinely dynamic M1+M3 content), LV-004 embed
   plumbing, a **policy layer in `src/core/solver/policy.ts`** (schema untouched: doors pair with provably-firing
   switches; documented lessons must be program-true), and a seeded generator that re-derives the shipped files.
   **Orchestrator adjudication of its escalation:** my dispatch gate (iv) `dualPhaseTiles ≥ 1` was **wrong for
   portal-free boards** (checkerboard invariant, ADR-0009 decision 1 — proven three times); corrected law: M1+M3
   blocks require `refusedThenEnteredTiles ≥ 1` (ADR-0009 decision 4), `dualPhase ≥ 1` activates from **L11 portals**.
   L8 passes (i)(ii)(iii) with printed proofs → acceptance stands. Follow-ups filed: **GD-007** grows a re-word of
   L9's pre-L11-unconstructible "switch timing" lesson (F3 finding) + confirm L6's documented dip (never scored
   as forced); new **LV-007**: expose B/T/R → difficulty `D` (currently honestly un-computable), and make
   `switchRequired` a policy obligation for L7–L10 (all five measure true today; L6 exempt by documentation).
   Registry stays at L1–L5 until R-002 (invisible door = lying tile).
   **RV-004 verdict: merge-after-correction (no BLOCKER).** Single MAJOR was `docs/ai-native-pipeline.md` §8.2
   histogram (claimed 46/42; program-true 43/39) — fixed in `63f6b69` with the summary pasted verbatim, together with
   m-3 (lesson-row test now enumerates `src/levels/*.json`; counterfactual proof: temp l011 without a row turns the
   suite RED — the promise is real now), m-4 (gate (ii) route-count relabelled away from `refusedThenEnteredTiles=`,
   pinned both sides), m-6 ("pure timing-gate maze" headline deleted — contradicted ADR-0009), m-7 (`par=4 · 5x3`).
   RV independently confirmed the load-bearing truths: bfs +221 reuses `applyMove`/`solidAt`/`initialState` with **no
   fabricated `doorsOpen`** (the 9/200 accident class is absent; its own probe recomputed l008 all-OFF = 16/34),
   ESCALATION and FAIL channels structurally separated (UNSATISFIABLE has exactly one guarded producer; every real
   FAIL exits 1), L6's dip not scored forced in three mechanisms, schema/rules/game/package byte-clean, registry
   isolation holds. **LV-007 backlog (RV):** m-2 negative controls for the 5 unpinned policy codes (esp.
   `lesson-latch-dynamism` — mutating `=== 0` kept 176 tests green), m-5 tighten UNSATISFIABLE guard to
   `portals.length === 0 && dualPhaseTiles === 0` + whitelist pin, m-8/m-9/m-10 doc lines, n-11 route-enumeration
   pruning + independent `maxRouteVisits` budget (needed before 7×7 / long-par L11+ boards), n-13
   `switch-without-targets` policy code (empty `targets` currently slips through), n-14 implement §3 Aha bullets
   1 & 5 (one-door-one-switch funnel, par ≤ 8), n-18 pin strengthening (`toEqual(["3,1"])`; assert 16/34), B/T/R →
   difficulty `D`, `switchRequired` obligation L7–L10. **Law observation (n-19): until M2 lands the game contains
   no genuine timing-gate wall — phase walls exist only as permanent obstacle / permanent decoration / echo.**
   Worktree hygiene note: `?? node_modules` in the worktree = ignore pattern `node_modules/` (trailing slash) does
   not match the symlink; harmless with explicit-path staging, fix before worktrees are reused.
16. **GD-007 — CLOSED & MERGED (`99e3f90`).** Disk-verified: single file `docs/level-design.md` V0.4→V0.5 (+26/−16);
    both acceptance hard-points clean — bare withdrawn "0/200" gone (kept only as labeled historical notes alongside the
    true figures 142/369 · 0/400 · 200/203 · 203/203), "validator rule to be added" exists now only inside the changelog
    row describing its removal; L9 shipped wording uses full metric names; gate ids (i)(ii)(iii) match the CLI verbatim.
    Earlier scope gap I flagged (item 16 pre-merge text) turned out already fixed by GD in §1. Follow-ups it defers are
    tracked in LV-007A/B. Historical detail kept below for provenance:
    `docs/level-design.md` §1 lines ~43/46 still cite the withdrawn "0/200" figure and describe the
    same-colour-portal rejection as a "validator rule to be added" — that rule has since **landed** (`npm run levels` rejects every same-colour pair, 0/400 legal).
    GD-006 correctly stayed out of scope and flagged it instead of widening the edit.
27. **AUTONOMOUS OPERATION MODE (user ruling 2026-10-15: 后续全部工作均由你自主决策执行 — full self-delegation to the
    Orchestrator).** Git/merge/push/verification decisions now execute under AGENTS.md §4/§6 without per-step confirmation;
    integration flow keeps its evidence gates (review → merge → verify → push). Rulings taken under it: (i) `assets/`
    storage — **all 11 candidate PNGs (9.2 MB, sha256-pinned) + quantitative evidence (`audit.json`, `audit_flat.txt`,
    `baseline.sha256`, `art-audit.py` re-acceptance program) committed** → develop `cd2054e` (revision batch lands as a
    forward correction; batch-1 pinning + re-runnable audit program = the chain, not a claim); (ii) QA-004 timeout policy —
    live until R-002 returns, then closed unilaterally as LOST-on-disk (no second implementation = its corrigendum power
    lapses; `art-audit.py` in Git keeps reproduction possible later); (iii) GD-007 dispatched (item 16); (iv) LV-007 queue
    holds at ≤3 concurrent. What delegation cannot remove: **the Asset Gate generator itself** (image generation lives in
    the user's Codex channel — req-08/11 P0 remains user-side) and **the 10 non-developer playtest cohort** (BUT/PA
    protocol forbids agent-as-player substitution). Everything else is moving on my judgment.

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

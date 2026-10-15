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

**RV-005 — RETURNED** (verdict: merge-after-correction, NO BLOCKER; numbers preserved in item 31). Its fix batch
went back to the R-002 session as **R-002b — RETURNED & DISK-VERIFIED** (9 commits `d69ed41..db00556`: M-1 fixed on
the tokens row with derived-coverage theme-mix pins; m-3/5/6/7/8/1/9 all closed, m-5 re-scoped reporting BOTH corner
families; tokens.ts byte-clean). My own re-run: tsc 0 · vitest **18 files / 273 / 3** · solver 10/10 · build ✓.
**R-002 merge gate now = UA-0008c's R7 ruling, nothing else.**

**UA-0008 — CLOSED & MERGED (`36a3b06`)**: ui-ux V0.8 + manifest V0.5.2, all four rulings landed (see item 30).

**UA-0008b — CLOSED & MERGED (`e744834`)**: ui-ux V0.8.1, §3.3b Entry 2 landed (see item 33).

**UA-0008c — CLOSED & MERGED (`1baf751`)**: ui-ux V0.8.2 — R7/R-Z6 M3-integration gate **closed by documented
exemption** (values frozen, five cited grounds with ±0.01 sanity-gated independent recomputation, binding
observation + same-cell content clauses, pre-specified §9.1-rule-3 re-tune path, zero engineer tickets) + m-10
count 7→10 + retained-ink def-A pin + pre-D3 L21 sweep. Both open items I ruled: OQ① mobile cell pitch — ground
truth `grid-mapping.ts:71` `floor(boardSide / max(width,height))` → l008 5×4=**78**, l009 5×5=**78**, l010 6×4=65
(item-6's "65 for l9" is the capture-script's column-count label, WRONG; header math right) — routed to
**UA-0008d**; OQ③ content-clause binds SAME-CELL only, adjacency under observation — **approved** (an
adjacency-binding would void the already-shipping passing l009 at birth).

**LV-007A — MERGED (`1225b35`) & disk-verified** (tsc 0, vitest 14 files / 211 passed / 3 skipped, solver 10/10,
validate 10/10+10, generator 5/5+3/3, zero id-exemption hardcodes). **LV-007B** (B/T/R to D, n-11 route pruning +
maxRouteVisits, n-13 switch-without-targets, m-8/9/10 doc lines, first real D-dip verification at L5-L6 /
L10-L11 seams + the AR-0005b ordered companion `refusedBeforeEnteredTiles` with its L11 trigger folded in)
**CLOSED & MERGED (`600c5d4`)** — 5 items, disk-verified (17 files/303/3 re-run; pruned≡exhaustive pinned; companion
ships report-only, gates still read unordered). Ruling satisfied: LV-007B landed BEFORE L11-L20 authoring; LV-008
unblocked modulo GD-008's gate-(iii) reader decision. Headline escalation: L5→L6 `D` seam measured **+8.53** vs the
−2..−3 dip law — **GD-008 — CLOSED & MERGED (`c68afac`)**: three rulings landed, every published number
re-derived by me from live solver output (both derivations, 10/10 identical; see item 36). **LV-007C — CLOSED & MERGED (`9dd92ce`)**, disk-verified (17 files/311/3 re-run; both iron proofs landed:
L1–L10 byte-identical, trapped-refusal pocket flips PASS→violation). Its OQ1 ruled: the **narrow reading is
correct** — only gate (iii) switches; `lesson-latch-dynamism`/gate (ii)-refusal-half/§8.5 stay unordered per
A3 (no ADR amendment). OQ2 (double V0.4 rows) accepted per the level-design V0.6 precedent. **RV-006 — RETURNED: NO BLOCKER / NO MAJOR** (my death-on-restart autopsy was a FALSE ALARM — the
audit runs mutations in `/private/rv006-mut`, leaving the worktree pristine; lesson: read-only agents
are judged by report, not footprint). Verdict: LV-007B merge stands; 12/12 mutations KILLED + independent
1,284-board/3,852-check naive-oracle equivalence (pruned≡exhaustive≡ground-truth, 0 mismatches); GD-008 anchors
all recomputed exact. Findings routed: **MINOR-2** (stale bfs.ts gate-(iii) comment) **already closed on disk** by
LV-007C's own rewrite (verified on develop); **MINOR-1** (46/2000 vs 0.9% vs 18/2000 divergence numbers cited
across docs without generator labels) → **LV-007D micro + AR-0006** (OQ1: in-repo harness vs unify citations);
 NOTE-1..5 → QA archive (`rv006-mut/` logs) + backlog. Worktree removed. Since then: **UA-0008d — CLOSED & MERGED
 (`4d9dde9`)**, **DG-002 — CLOSED & MERGED (`9bae42c`)**, **DG-002b — CLOSED & MERGED (`9bcbf91`)**,
 **AR-0006 — CLOSED & MERGED (`39a96fc`)** (item 44) and **GD-009 — CLOSED & MERGED (`5972031`)** (item 45).
 Live now: **LV-008** (L11 first-portal
 authoring against the frozen pre-registered law — `D_exec<13.64`, par≤4, one opposite-color pair, no false
 routes; ≥20 candidates, program proves, accept/reject never repair), **QA-005** (permanent Playwright
 e2e: trusted-input l1→l10 walks + refusal-freeze triples + the transient-frame physics adjudication with a written
 terminal verdict either way; own server :5198, CI-green ruling, vitest 22/408/3 only-up), **DG-003** (facade
 canonization: README's stale "not yet playable"/"rendering not yet" cleared against the merged reality +
 submission-docs D-pending→measured with the pre-registration narrative + a submission-gap inventory listed-not-fixed).
 The hard prerequisites for 7x7 long-par boards (n-11) and for gate-(iv)
firing on portal boards are now in. **QA-005 re-scoped**: Playwright now
**installed** (devDep + chromium v1248, installed by the Orchestrator as sole package.json writer) and all dynamic
frames already captured (see item 28). Remaining QA-005 = the permanent spec only: `playwright.config` +
`tests/e2e/**` trusted-input walks pinning L8 refuse/press/cross + par-4/6 solves + victory, and the CI decision
(browser download job vs explicit skip). Deferred GD question: 'below OFFERED' as a named teaching grade stays descriptive.

**QA-004 — CLOSED per item-27 timeout policy** (silent past R-002's return, zero disk footprint — expected shape
for a read-only task; corrigendum power lapsed, committed `art-audit.py` keeps reproduction open to anyone).
Original brief: independent second-implementation reproduction of the ART-INTAKE audit
numbers (`audit.json`) + suite regression, read-only, no commits. It can now only trigger a **corrigendum** to
`docs/assets/art-acceptance-2026-10-15.md`, not reopen a ruling. Everything else has returned; the art intake docs
and **all 11 candidate PNGs + audit evidence are committed** (`0a88d0c`, `cd2054e` — storage ruling executed under
item 27). Reliability note: a batch of
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
28. **Dynamic frames captured — Playwright infra landed (2026-10-15).** AGENTS.md's declared stack always included
    Playwright but it had never been installed; the OpenCode webview's keydown failure was environmental, not a game
    defect. Installed `@playwright/test` + chromium v1248 (main tree, sole-writer package.json), then walked
    L6/L8/L10 with **trusted input** (`qa-capture/capture.cjs` → `…/orch-smoke-2026-10-15/dyn/`, 12 PNG +
    `capture-log.json`, manifest ADDENDUM). Headline evidence: **refusal frame** (third R on L8 held — moves stayed 2,
    phase 白昼 unchanged, arc mid-animation: the locked illegal-move contract proven in pixels), press beat on `s1`,
    **standing on the latched-open door** (R-Z7 occupancy state, moves 5), par-6 win + victory dialog, L6 dip solved
    par-4 on the natural path, L10 mid-route. This **supersedes UA-0008's static-set constraint** — a fresh-session
    **UA-0008b vision addendum** will judge the dynamic vocabulary after UA-0008 returns (new-session lesson holds).
    QA-004 formally closed (above). Concurrency: RV-005 + UA-0008 + AR-0005b live; LV-007B queued for first return.
29. **AR-0005b — CLOSED & MERGED (`95bd2c7`): architecture V0.6 + ADR-architecture-0002, disk-verified (exactly 2
    owned files).** Ruling 1: metric #7 `refusedThenEnteredTiles` stays **canonical** with its shipped unordered
    state-set semantics — definition contract pinned from `bfs.ts` code, not memory (reachable-set fixpoint ⇒ already
    order-free; the original "order-sensitive" ticket conflated trace layer with state space); downgrade/advisory/
    redefine all rejected on evidence; **ordered companion `refusedBeforeEnteredTiles` adopted by spec** (∃ refuse-state
    → accept-state reachability; identical on L1–L10, wild divergence 18/2000 = trapped-refusal pockets), trigger =
    before first L11+ acceptance — folded into LV-007B. Gate (iii) and pipeline §8.5 keep reading unordered until
    GD-008 applies Appendix-A wording (**GD-008 queued**: ADR-0009 Context-5 deferral closure + level-design §3 (iii)
    re-point; drafts supplied). Ruling 2: theme-token canonical chain — docs §4.3/§5.4 = value & meaning authority,
    `src/game/theme/tokens.ts` = sole injection, tests = parity pins; two §12 test rows specified green-by-construction
    → **folded into QA-005 scope** (theme-law scan + token-parity pin); H-5 known-gap note corrected (both tests shipped).
30. **UA-0008 — CLOSED & MERGED (`36a3b06`): ui-ux V0.8 + manifest V0.5.2. Four rulings, zero code touched.**
    K-1 visual acceptance = **CONDITIONAL PASS** (conditions are evidence additions, explicitly not merge-blockers for
    R-002; §3.3b Entry 1 records closed/open door reads, switch-vs-medallion glyph families non-colliding, phase
    inversion, red=A/blue=B both-phase verified, plus a real-render confirmation of R-C13 occupied-wall carriers on L4).
    K-2 (Q1) = **option (a)**: the V0.5 §4.3 script measured a construction that never shipped (ghost-box counterfactual
    1.744/1.613 reproduces the old published 45.0 % almost exactly); republished from shipped geometry — **R-D2 is now
    a two-tier band: ≥1.6 @56 nominal (measured 1.706) / ≥1.55 @40 floor guard (measured 1.589)**; geometry untouched,
    no engineer ticket; re-opener pre-specified = RV-005 pure-math recheck diverging > ±0.01 (still live, merge-gating
    for that row only). This resolves R-002's sole metric escalation. K-3 (Q2) = both switch extensions **codified**
    (owning-`activePhase` glyph, box `max(7, round(0.18·c))`, never size-gated ≥40; press beat sin(πp) 2→3 px,
    object-anchored, latch-moving step only) — no revert ticket. K-4 (Q3) = **portals vector-by-design**: §3.1c frozen
    vector construction (numbers match the shipped painter), §9.1/A-06 rewritten, req-09 raster portal demoted to
    optional Stage-5 polish, **no new asset-request**. Structural finding I am acting on: (i) the portal painter ships
    with **zero registry content able to render it** — first L11 board is now also a visual-evidence gate, raising
    LV-008 priority immediately after LV-007B; (ii) UA left stale "M2 (L36)" portal-milestone refs (§3.1c/§9.1) that
    contradict ADR-0009 D3 (portals L11) — wording fix dispatched to **UA-0008b** together with §3.3b Entry 2 on the
    now-existing dyn/ frames (OQ-UA8-2 satisfied ahead of QA-005; portal-frame + §3.1d-picture + any remaining 40 px
    conditions stay open with named fixtures).
31. **RV-005 landed: MERGE-AFTER-CORRECTION, no BLOCKER.** Method: 21 real source mutations on a byte-identical
    copy, a fully independent rasterizer cross-check of R-002's sweep, Phaser 3.90 d.ts + Graphics.js semantics
    audit, WCAG/Lab math. Q1–Q7 all answered; the seam, the cell-state divergence (renderer draws definitions, core
    judges legality — §3 single truth intact, M12 proves no second implementation), the three acceptance-list wirings
    (R-Z7 ring / deny cause-(i) / hover open-doors-only) and the unlock/rollback chain all PASS inspection.
    **MAJORs**: M-1 = `theme-mix.ts` interpolates only `obj.goal` → door/switch/portal hard-pop every flip
    (ΔL* 26–38 vs declared step floor 12; goal, same magnitude, IS faded — asymmetric regression introduced by this
    slice; fix routed to R-002b, tests were blind (M21 survived)); M-2 = unlocking L6–L10 **fires the R7/R-Z6 M3-
    integration precondition** (obj.switch vs obj.wall 1.18:1 A / 1.14:1 B < 3:1; spec: "re-tune before integration —
    tracked so it cannot be forgotten"; every shipped door-board carries switches). Mitigations RV verified: shape
    axes separate them (88 % solid vs 40 % hollow + new phase glyph = non-color channel), and `switch∩wall = ∅` on
    all five boards (R-Z6's same-cell failure mode cannot occur in shipped content). **Routing: UA-0008c** (continue
    after Entry 2) rules re-tune vs documented-exemption; my authority note: merge holds for that ruling, no
    unilateral exemption — the gate exists precisely to stop this being waved through.
    **Adjudications I made on the spot**: (a) UA's ±0.01 re-opener on the republished 1.589 — RV's independent
    rasterizer read 1.5987, delta 0.0097 **within tolerance, row holds**; (b) RV's worse-untested corners
    (blue-door@40 css1 = 1.5813, dpr2 = 1.5874) still clear the V0.8 two-tier floor ≥1.55 — m-5 re-measurement (all
    corners, engineer-run) will feed UA-0008c's appendix; the retained-ink definition UA republished (= RV's
    "def A": frame in, glyph knockout out) is hereby pinned explicitly; (c) m-4 (switch extensions "unratified") and
    Q6 (definition) were already resolved by UA-0008's V0.8 before RV's request — no extra round; (d) RV's
    procedural note on the test asserting ≥1.55 was pre-"threshold weakening" — retroactively ratified by the spec-
    owner re-band, numbers honestly disclosed in-test; closed finding.
    **Follow-up routing**: m-2 (board-view jsdom/headless smoke guarding M4/M5/M19 — rule-tested, wiring-untested)
    → **QA-005 scope**; m-10's `ui-ux.md:303` graphics-count 7→10 → UA-0008c; iteration-log + status milestone entry
    → Docs+GitHub at merge; backlog n-1..n-6 → QA-005/GD absorb round, **n-6** (`isPlayerEmbedded` imported gameplay←renderer,
    direction reversed, semantics changed by R-002) → **AR-0006 queue** (Architect: lift to core/neutral module);
    m-3/m-5/m-6/m-7/m-8/m-1/m-9 → R-002b (in flight). Merge gate now = R-002b green + UA-0008c M-2 ruling.
32. **UA-0008b first dispatch — DIED-ON-ARRIVAL (provider rate limit, not work failure).** Autopsy: branch
    `agent/ui/ua-0008b-entry2` was created at base `36a3b06` but zero commits, zero uncommitted edits — it hit the
    per-minute token cap launching right behind RV-005's huge report plus two live agents sharing the account.
    Re-dispatched into the SAME worktree/branch with a token-peak discipline (read capture-log first, images in
    batches of ≤4, Entry 2 composed once, single atomic commit). Watcher note for future dispatches: after any
    multi-hundred-KB context turn, cool the quota window before launching a vision-heavy batch. **CI spot-check
    (all green through `79c83aa`): the @playwright/test devDep did not break the CI install/test path.**
33. **UA-0008b — RETURNED & MERGED (`e744834`): ui-ux V0.8.1, §3.3b Entry 2 on the dyn/ frames.** Eight-item table:
    stacking order **PASS as a picture** (player>door + player>switch seen, not just asserted — no new fixture
    commissioned), night vocabulary **PASS**, victory dialog **PASS**, 390px mobile door vocabulary **PASS** (78/65px
    CSS cells) — and two honest CONDITIONALs that REFUSED to gold-plate my own captures: (i) refusal arc — the locked
    contract is fully readable at state level (moves frozen, phase unchanged, cause at full emphasis) but a pixel
    probe proved the 90 ms arc is byte-absent from my +120 ms sample (my capture window missed it; QA-005 protocol
    named: +30/+60 ms re-samples + pixel-diff assertion); (ii) press beat — at a settled sample the 0.70 body covers
    the 0.40 outline, so the 2→3 px widening is structurally invisible (protocol: multi-sample 40–100 ms mid-step).
    Portal **DEFERRED structurally**, bound to first L11 board (LV-008, Entry 3) — evidence gap not spec gap; the
    40px picture condition **re-scoped out as vacuous on cssScale-2 hardware** (numeric floor guard 1.589≥1.55 stays),
    killing a permanently-dangling fake condition. L36→L11 wording synced (×7 live refs; historical quotes kept).
    Its OQ flags routed: "from L21 on" door-schedule staleness + Entry-2 board-size typo → UA-0008c (dispatched, wording fixes bundled);
    QA-005 scope now also carries: arc re-sampling protocol, beat multi-sample, 320px viewport
    run, flip mid-swap note, 42–44 CSS standing note. **Merge-gate math**: R-002 = R-002b (M-1 fix, in flight) +
    UA-0008c R7 ruling; nothing else outstanding.
34. **R-002b — RETURNED & DISK-VERIFIED (9 commits `d69ed41..db00556`, gate green on my own re-run: tsc 0 ·
    vitest 18 files / 273 / 3 · solver 10/10 PASS one pre-existing escalation · build ✓ · `theme/tokens.ts` and
    `docs/**` byte-clean vs base).** M-1 fixed exactly at RV's named location (tokens row, not the staggered
    `objectMix`) covering all 8 canvas-read `obj.*` tokens; new theme-mix suite **derives its coverage set from the
    shipped token maps** (a future per-phase token read by any painter goes red automatically) — M21 mutation now
    dies naming `goal at t=0.1 still equals the B value`; m-3 mid-progress wiring pins kill M14/M9/M10; m-8 clone
    probe un-swallows the hover test's last step (proved: `expected 4 to be 1` pre-fix); m-1 probe now really fails
    tsc (reproduces both directions); m-6/m-7/m-9 clean. **m-5 corner grid (feeds UA-0008c/c)**: all 8 in-contract
    corners pass both bands; worst = 40 px/cssScale-2/blue **1.5797** (margin 0.0297 — a tripwire test forbids any
    corner within 0.01 of a band); crescent worse than sun and cs2 worse than cs1 in every pair; below-floor family
    measured as the R-T5 argument (open door = 95 % of closed mass at device-40). **Cross-fade pixel-trajectory
    probe (mine)**: CDP screenshot round-trip ≈670 ms regardless of clip AND `toDataURL` is all-black on the WebGL
    buffer → the 60–200 ms window is uncatchable from the outside; burst (20 frames) DID prove end-state exactness —
    every token lands on its precise phase-B endpoint, zero A residue, door ink 13684→7366 matches bar contraction,
    `pageErrors: []`. Mid-frame trajectory formally handed to QA-005 with both hard numbers (`xfade2/` + manifest
    ADDENDUM). R-002b's DESIGN_IMPACT wording asks (§6.2 row-membership, R-C10 "same token not same value" sentence,
    R-T5 floor citation) + its OQ1/OQ2 (cssScale reading, worst-corner naming) → **UA-0008c addendum batch after its
    R7 ruling**; OQ3 (renderer-* absorption) already inside QA-005; OQ4 (`graphics2d.ts` type-only module vs runtime
    probe export) → **AR-0006 queue** with n-6. **R-002 merge gate = UA-0008c only.**
35. **LV-007B — RETURNED, DISK-VERIFIED & MERGED (`600c5d4`).** Boundary: exactly 11 files, all inside solver/doc/
    test ownership; my re-run: tsc 0 · vitest **17 files / 303 / 3** · solver PASS + 1 escalation · validate 10/10 +
    negatives by name · generator 5/5 MATCH byte-identical. n-11: exact finishability pruning (memoized lookahead,
    portal-safe) + own `maxRouteVisits` budget that **raises** `RouteEnumerationError` instead of silently truncating
    (the real bug was the walk reading the state-cap key); pruned ≡ exhaustive pinned on all ten levels + synthetics;
    a 7×7 par-20 board that died at the old default now enumerates. Companion `refusedBeforeEnteredTiles` ships
    REPORT-ONLY (gates (iii)/§8.5 still read unordered — LV-007A's typed inventory untouched); trapped-refusal control
    measures unordered 1 / ordered 0 as AR predicted; sweep says 46/2000 diverge. n-13 `switch-without-targets` joined
    the inventory with a control proving it is not `switch-never-fires` (the switch really fires). **Difficulty module
    measured**: L1–L10 `D` = 14.00/15.06/15.29/15.58/15.33/23.86/22.75/25.50/27.14/28.64 (weights 1,3,4,2,5 provisional);
    inside §4's acceptance region `T≡0∧R≡0 ⇒ D = L+3B+5M` (w3/w4 inert); `B < B_raw` everywhere (~⅓ of apparent
    branching dominated). **The headline design escalation: L5→L6 seam is +8.53 where the dip law demands −2..−3,
    and unreachable by construction under current weights (introducing a mechanic eats +5·ΔM).** LV refused to tune
    or reword to hide it — published in §5.2, and the decision (normalized-D / re-axis / retire / principled
    re-weight) is dispatched to **GD-008** together with the gate-(iii) reader choice and ADR-0009 Context-5 closure.
    Queued from its OQs: **AR-0006** (architecture §55 cites the never-existing `scripts/generate-levels`; §8 should
    record the companion as shipped; validator-vs-policy home for n-13; persist-accepted-metrics decision),
    **Docs+GitHub** (submission docs' "D pending" rows → measured-with-provisional-weights), **RV-006** read-only audit
    of the pruning+difficulty diffs (post-merge pattern of RV-004 — next free slot). L6–L10 registry unlock stays with
    the R-002 merge exactly as GD sequencing expects.
36. **GD-008 — RETURNED, INDEPENDENTLY RE-DERIVED & MERGED (`c68afac`).** Three rulings, docs-only, boundary exactly
    4 GD-owned files. Ruling 1 (the headline): the −2..−3 `D`-dip clause is **falsified by its own measurement** and
    proven unreachable-by-construction, so GD withdrew it **unfitted** (no weight tuned to chase a target — AGENTS §7
    culture held) and re-anchored the valley on the execution axis `D_exec = D − w5·M` (`= L + 3B` inside the §4
    region): seam law (debut strictly below previous block's `D_exec` peak; budget form `ΔD < w5·ΔM`), sawtooth on
    `D_exec`, felt-half explicitly a labelled hypothesis for playtest. **My verification**: recomputed all ten
    `D_exec` values BOTH ways (D−5M and L+3B) from live `solve-levels` output at `67f69dc` — 10/10 exact
    (9.00/10.06/10.29/10.58/10.33/8.86/7.75/10.50/12.14/13.64); L5→L6 seam −1.47 reproduced; L11 falsifiable
    prediction pre-registered BEFORE any candidate exists (`D_exec(L11) < 13.64` ⇔ `D < 33.64`, par ≤ 4, one
    opposite-color portal pair) — GD-008's hardest anti-gaming move, now frozen into LV-008's generator law.
    Ruling 2: gate (iii) spec reader **switched to ordered** `refusedBeforeEnteredTiles ≥ 1` today (harmless on
    L1–L10 — measured identical both ways — but closes the trapped-refusal class before portals make divergence
    likelier); code reader swap dispatched as **LV-007C** with the flip-control requirement; pipeline §8.5 leg
    deliberately stays unordered (architecture-0002 A3, no re-merge). Ruling 3: ADR-0009 Context-5 deferral closed
    by dated closure line from the ADR author. Standing queues from it: PA Stage-2 brief must add the first-show
    friction clause with the threshold frozen BEFORE the cohort (T6); `level-difficulty.md` §3's pre-D3 table
    (Phase Door L21 / Portal L36) reconciled by LV-007C. Convention note (mine, ruling-by-action): role-local ADRs
    use `architecture-*` / `design-*` families; the plain `NNNN-*.md` run stays reserved for the locked core-rule
    sequence 0001–0009. Post-merge soundness: dispatched RV-006 to audit LV-007B fix-forward.
37. **UA-0008c — RETURNED & MERGED (`1baf751`): ui-ux V0.8.2, the R-002 last gate CLOSED by documented exemption.**
    R7/R-Z6 M3-integration ruling (b): `obj.switch` stays A `#7A5AA0`/B `#C79BE8` — no re-tune, no engineer ticket,
    zero frozen-value moves; five cited grounds (structure axis; V0.8 glyph non-color channel; switch∩wall=∅ on all
    five boards per-level; Entry 1/2 frames pass both phases; **no legal landing zone** — exact band algebra: every
    reachable CR band is occupied by pinned load-bearing tokens), all numbers sanity-gated at ±0.01 against published
    rows before use. Two BINDING clauses: observation (Stage-2 confusion triggers re-open via the pre-specified
    §9.1-rule-3 spec+code+pin same-batch path) + content (any SAME-CELL switch∩wall voids the exemption for that
    board — adjacency stays legal/observed). Cleanup bundle: m-10 graphics-count 7→10 (retired three historical "7"s
    marked pre-R-002), retained-ink def-A pin + the 1.5987 re-opener closure line, "from L21" → L6 pre-D3 sweep
    (×6 live refs + two stale "optional M3" premises corrected to CORE). My rulings on its OQs: **① mobile pitch —
    ground truth is the shipped renderer** `grid-mapping.ts:71` `cellSize = floor(boardSide / max(width,height))`
    (longest side, NOT column count): l008 5×4→**78**, l009 5×5→**78**, l010 6×4→**65** — Entry-2 item-6's "65 for
    l9" traces to my capture script's column-count label (the PNGs are fine; header math "390/maxDim" was right);
    routed to UA-0008d with the assets L36 sweep. **③ content-clause binds same-cell only — APPROVED** (binding on
    adjacency would void the already-shipping, frame-passing l009 at birth).
38. **R-002+R-002b — MERGED (`c6af636`): L6–L10 UNLOCKED IN THE PLAYABLE REGISTRY. The biggest gameplay-visible
    merge of this project.** Door/switch/portal painters on the registry L4 containers (graphics-count now 10),
    phantom-walk L4–L5 → doors+switch paired unit L6–L10 per ADR-0009 D3, Aha #1 now actually reachable by players;
    M-1 fixed (8 canvas-read `obj.*` tokens on the 60–200 ms cross-fade row + derived-coverage suite); RV-005 batch
    m-1/3/5/6/7/8/9 closed (worst in-contract corner 1.5797, ±0.01 tripwire). Boundary pre-merge: 15 commits,
    20 files, all `src/game/** + tests/**`. **Merged-tree battery (main tree, full integration — never run together
    before): tsc 0 · vitest 22 files / 408 passed / 3 skipped · solver 10/10 PASS (one pre-registered escalation) ·
    validate 10/10 + negatives by name · vite build ✓**; CI green through `9dd92ce`. **Trusted-input recapture on
    merged develop** (`dyn-merged/`, 15 frames + log, `pageErrors: []`): the R-002b registry/cell-state refactor
    is now proven in pixels, not just unit-tested — refusal frozen at moves 2, press-beat + open-door occupancy +
    L6 par-4 dip win + L8 par-6 win + L10 mid-route + mobile 390 trio. Known label wart: the mobile script's
    `cellPx` prints the column-count assumption (65 for l9) — superseded by item 37①'s renderer ground truth.
39. **LV-007C — RETURNED, VERIFIED & MERGED (`9dd92ce`).** Disk re-run: tsc 0 · 17 files/311/3 · solver PASS +
    exactly 1 escalation · validate/generator green. Both iron proofs landed: L1–L10 byte-identical (only gate
    (iii)'s own label/detail line changed + pure additions) and the trapped-refusal pocket flips PASS→violation
    (the switch has teeth; one-control-per-code inventory intact as a typed Record + source scan). Its OQ1 I ruled
    as the **correct narrow reading**: gate (iii) alone switches; `lesson-latch-dynamism`, gate (ii)'s refusal half
    and §8.5's generation leg deliberately stay unordered (A3, two legs not re-stitched) — if GD later wants the
    lesson reader switched it needs an ADR amendment, not a reader edit. OQ2 (double V0.4 changelog rows) accepted
    per the level-design V0.6 precedent. §3 stale rows (Phase Door L21 / Portal L36 / pre-measurement absolute D
    bands) withdrawn BY NAME with the measured record alongside — the difficulty doc no longer contradicts ADR-0009.
    New visible handoff from its OQ4: "door targeted by more than one switch ⇒ review flag" is still unimplemented
    (no warning, no policy code) → queued.
40. **RV-006 — RETURNED: LV-007B audit CLEAN (0 BLOCKER / 0 MAJOR, merge stands).** Independent evidence, not
    their pins: naive ground-truth enumerator driven through the frozen rule layer over **1,284 boards / 3,852
    par-checks** (4×4 exhaustive latch space + 400 seeded boards incl. opposite-color portals and mixed latches):
    pruned ≡ exhaustive ≡ naive, **0 mismatches**; memo key proven injective and covers every field the rules read;
    refusal-is-identity is reference-level (portal only fires after step 1) so lookahead's reuse is sound;
    `RouteEnumerationError` deterministic across processes, zero env leakage in messages. 12/12 mutations KILLED
    (incl. memo-key downgrade, off-by-one horizon, budget-not-charging-lookahead, silent-truncation, B:=bRaw,
    T-swap, ordered:=unordered, direction inversion, n-13 removal, UNSATISFIABLE guard dilution, refusal-as-wait-
    edge ×2). GD-008's published anchors recomputed exact from live output (9.000000/13.642857/−1.471264/+8.528736;
    `D−5M ≟ L+3B` holds 10/10 to <1e-12 with T≡R≡0 strictly). Two process lessons for the studio: NOTE-4 (relative
    equivalence tests MUST coexist with absolute route-count pins — under M11 both walks are consistently wrong and
    the equivalence pin stays green) and NOTE-3 (cost read-outs marked "never a gate" are load-bearing — the only
    thing killing M12). MINOR-2 already fixed on disk by LV-007C (verified); MINOR-1 (divergence numbers 46/2000
    vs 0.9% vs 18/2000 cited without generator labels across pipeline/design/ADR docs) → **LV-007D micro folded
    into AR-0006 queue** with RV's OQ1 (bring the harness in-repo vs unify citations — Architect+LV countersign).
41. **UA-0008d — RETURNED & MERGED (`4d9dde9`): ui-ux V0.8.3 + assets V0.5.3.** Item-6 l9 pitch attribution corrected
    to 78 px CSS per the maxDim law (the V0.8.3 changelog line doubles as the UA-0008c OQ① closure record); whole-
    file sweep confirmed item 6 was the ONLY live mis-attribution. Asset-side: four pre-D3 "portal at L36" live refs
    (req-06 ×2, req-09, manifest, first-batch) all synced to L11 with "(pre-D3: L36)" annotations — schedule wording
    only, zero spec/prompt/acceptance movement, UA-0008 Q3 optional-polish ruling reaffirmed not altered. Boundary:
    exactly the 5 owned doc files, tree clean. **AR-0006 dispatched** (Architect, worktree `…/ar-0006-arch-sweep`):
    three rulings (RV-006 OQ1 divergence-number single source of truth — harness in-repo vs unify to 46/2000;
    R-002b OQ4 `graphics2d.ts` type-purity; metrics-persistence per LV-007B OQ5/RV OQ3 with YAGNI vs §7 tension
    spelled out) + four doc debts (stale §55 `generate-levels` citation to be replaced with the REAL script family,
    §8 future-tense → shipped + two-legs-unchained declaration, n-6 `isPlayerEmbedded` dependency direction with
    code moves pre-specified as engineer micro-tickets, LV-007C OQ4 multi-switch-door flag home ruling). Rulings
    route onward to LV-007D / GD / gameplay micro-tickets; no code touched by AR.
42. **DG-002 — RETURNED & MERGED (`9bae42c`): iteration-log ITER-0008..0011 landed — the AGENTS §6 compliance
    record for the L6–L10 gameplay merge.** Four entries (GD-008 / UA-0008c / R-002+R-002b headline / LV-007C),
    boundary exactly `docs/iteration-log.md`, +68 lines PURE ADDITIONS, all cited SHAs verified alive on my disk
    (4/4), CI green through `9bae42c`. Their OQ caught a REAL structural defect I confirmed before ruling:
    **ITER-0007 (the RENDER-001 vertical-slice milestone — the first time the game ran in a browser) was entombed
    inside the `<!-- Template for future entries` comment** (line 219 inside a comment opening at 217) — invisible
    in rendered markdown AND chronologically misplaced (belongs between ITER-0006 and ITER-0008). Ruling: approved
    as a verbatim relocation, zero content change — and DG's restraint (asked instead of touching it, then
    escalating precisely) is the ownership discipline working as designed. **DG-002b dispatched** (worktree
    `…/dg-iter0007-rescue`, branch off `9bae42c`): byte-identical lift to the ITER-0006/0008 seam, template comment
    must remain legally paired after the move, self-check = heading count invariant + monotonic ordering + diff
    shows pure relocation; one commit. Three live: **LV-008** (L11 authoring against the frozen pre-registered law)
    · **AR-0006** (three rulings + four doc debts) · **DG-002b**. Vite :5199 stays up on the merged tree — the
    Entry-3 portal pair-frames fire the moment LV-008's board passes and R-003 unlocks it in the registry.
43. **DG-002b — RETURNED & MERGED (`9bcbf91`): ITER-0007 freed from the template comment — verbatim relocation,
    independently re-verified on my disk before merging** (their claims were not taken on trust): relocated block
    byte-identical to the entombed original, template body untouched (`## ITER-XXXX` tail equality asserted), 11
    entity headings now monotonic ITER-0001→0011 with 0007 sitting in its chronological seam, comment span shrunk
    to a template-only pair (62177–62348) with zero swallowed `##`, and the single visible added line is the
    disclosed `---` stitch (their +49/−47 diffstat reproduced exactly). Process note: the first merge attempt died
    mid-chain with the harness interruption — re-checked for half-merge state (no MERGE_HEAD, branch unmerged)
    before cleanly re-running; no residue. **QA-005 dispatched** (third live, ceiling full): permanent Playwright
    e2e on `playwright.config + tests/e2e/**` — trusted-keyboard l1→l10 walks pinning par-route wins + the
    refusal-freeze triple (moves/phase/position unchanged) + latched-door occupancy + phase-label flip per legal
    step; graphics-count expectation **10**; its core deliverable is the **transient-frame physics adjudication in
    writing** — with the two proven channel facts (≈670 ms CDP screenshot round-trip regardless of clip; all-black
    `toDataURL` on WebGL) it must land either a GREEN re-sampling channel (UA Entry-2's two CONDITIONALs →
    measured), an engineer micro-ticket spec (`preserveDrawingBuffer`/snapshot/time-scale — QA itself never touches
    `src/**`), or a documented physically-unreachable terminal case; no含糊 exit. Plus CI-shape ruling (vitest-only
    default stays green) and the `rv006-mut/` battery-log archival with NOTE-3/NOTE-4 lessons for maintainers. Runs
    on its own vite instance (:5198) — my :5199 merged-tree server stays reserved for the Entry-3 capture.
44. **AR-0006 — RETURNED & MERGED (`39a96fc`): ADR-architecture-0003 five rulings + architecture V0.7 — the whole
    architectural backlog cleared in one sweep.** Disk-verified before merge: 4 commits, boundary exactly the 3
    Architect-owned files; A2's premise checked on disk (`verbatimModuleSyntax: true`, tsconfig.json:16); the scripts
    tree rewritten to the three REAL files (verified `ls scripts/`); R1–R5 all present as proper `## Ruling` sections
    (my first grep pattern was wrong, the re-check was right). The rulings: **R1** divergence-rate now has exactly one
    citable number — the test-pinned **46/2000 (2.3 %)**; 18/2000/0.9 % demoted to labeled historical (out-of-repo
    harness never committed — *the second corrigendum of the 9/200 class, and this time caught by our own audit
    chain, not by me after the fact*); **R2** `graphics2d.ts` interface+probe stay co-located, **terminal, zero
    tickets**; **R3** metrics persistence = generated sidecar `docs/level-difficulty.report.json` + freshness pin
    (**LV-007E**; recompute-only rejected — prose transcription has drifted twice; schema fields rejected — derived
    data out of the authoring source, `par` stays the sole exception); **R4** `isPlayerEmbedded` is rule semantics →
    home `src/core/rules` via `solidAt`, renderer keeps the flag seam, the systems→renderer reverse edge dies —
    six-step engineer micro-ticket pre-specified in the ADR; **R5** multi-switch-door flag = validator-warning layer
    NOW, policy code only when GD quantifies the L36+ quota (one-code-one-control; n-13 precedent). My countersignature
    on their risk (ii), recorded in the merge message: **the sidecar's ownership follows its authoring sibling** —
    `level-difficulty.report.json` belongs to Level AI + Solver (they own `level-difficulty.md` per the AGENTS §4
    table), and the Docs catch-all explicitly excludes generated artefacts. Routing: **GD-009 dispatched** (R1 GD half
    + approved ADR-0009 Context-5 parenthesis + R5 no-op check); **LV-007D parked until LV-008 merges** (same-file
    collision on pipeline §8.5) with ENLARGED scope: generator labels on the sweep numbers, the §7 self-description
    ("OPEN_QUESTION to Architect") rest to landed, and the architecture §3 scripts row re-synced when the l11 generator
    ships; **R-004** (name reserved) = ADR-0003 R4 six-step ticket, queued behind QA-005 (its test repoints must not
    race QA's in-flight tests/** work). Three live: LV-008 · QA-005 · GD-009.
45. **GD-009 — RETURNED & MERGED (`5972031`): citation canonization GD-half, verified line-by-line before merge.**
    level-design V0.7 §3 gate-(iii) live sentence now cites the single citable **46/2000 (2.3 %) with its pin
    reference** (`ordered-companion.test.ts` §5, issued wording verbatim); ADR-0009 Context-5's closure line carries
    the approved in-place `historical` parenthesis for 18/2000 (b65e465 harness, generator never committed; the
    double-parenthesis awkwardness is the price of the zero-surrounding-change constraint I imposed — accepted);
    ticket 3 = **confirmed no-op** (§1 already matches R5 verbatim, no edit manufactured). My verification caught a
    grep-trap of my own (`grep -c` returning 0 broke my `&&` chain — re-probed with `;`); my verification ALSO
    surfaced a NEW staleness: §3 line-115's tail "Until the policy-code reader lands … enforcement keeps reading
    unordered" is a GD-008-era sentence **overtaken by LV-007C's landing** — the mirror image of RV-006's MINOR-2
    (docs out-staled by later code, not code by docs). Routing decision: do NOT dispatch a one-line ticket — the
    L11 block ruling (A3 ordered/unordered, lands at L11 acceptance) edits this exact sentence anyway; folded into
    that GD ticket's scope, recorded here so it cannot be lost. Also my ruling on their risk ②: `iteration-log.md:208`
    is a dated log entry — R1's changelog carve-out applies by class; **no edit**, question closed (passed into DG-003's
    brief as a do-not-re-raise). **DG-003 dispatched** into the open slot — README/submission facade: line 25 still
    claims "browser rendering (RENDER-001) not yet" and line 29 "not yet playable" (both falsified by `1cafe21` and
    `c6af636` + 22/408/3 + dyn-merged pixels), the "still open" paragraph must separate TRUE opens (human cohort never
    run, weights provisional, par-HUD OQ1, L11 pre-registration under test, revision art) from dead ones (9/200 closed,
    SOLVER-001 absorbed into the standing pipeline, RENDER-001 shipped); plus submission-docs D-pending→measured with
    the **pre-registration narrative** as the flagship AI-native proof, and a submission-gap inventory listed not fixed.
    Three live: LV-008 · QA-005 · DG-003.
46. **Orchestrator pre-work landed between returns** (no agents involved): ① Stage-2 frozen-material provenance —
    sha256 of all 31 frames (`dyn-merged/` 16 entries first = the trusted core set; pre-refactor `dyn/` rows kept below
    marked as superseded history) + `stage2-freeze-note.md` in the evidence dir: the L11 pair-frames append ONLY after
    LV-008 accept + R-003 unlock + Entry-3 capture, thresholds freeze before first tester (GD-008 clause carried into
    the PA-006 brief draft). ② Level addressing verified: `?level=N` URL query (capture.cjs:40) — Entry-3 for L11 has
    no structural blocker, only the unlock. ③ R-003 shape pre-verified against the shipped registry: explicit imports
    by design (`level-registry.ts:10-30` comment: no Vite glob, tsconfig has no `vite/client` types) → the ticket is
    two data lines (`import l011` + entry) + the unlock test's registry-contents re-pin; deliberately held until the
    accepted `l011.json` exists.
47. **DEFINITION OF DONE — Orchestrator's completion checklist (standing order: drive autonomously until
    finished).** Competition-ready = ALL of: **[G1] Gameplay** L1–L11 shipped and proven (L11 under the frozen
    pre-registered law; LV-008 in flight), L12–L15 authored if the loop sustains. **[G2] Rules/quality machine**
    permanent e2e (QA-005 in flight) + per-level solver proofs + sidecar report LV-007E + validator multi-switch
    warning (R5-half) + R-004 predicate relocation + LV-007D citation labels — all queued behind current trio.
    **[G3] Visual vocabulary** Entry-3 portal pair-frames on the accepted L11 (capture after R-003; :5199 + `?level=`
    ready) + UA ruling; revision-art INTEGRATION is USER-BLOCKED (Codex channel: req-08 spirit pair, req-11
    background P0) — shipping with disclosed placeholder state is the accepted fallback, Asset Gate unchanged.
    **[G4] Playtest evidence** Stage-2 protocol frozen BEFORE cohort (thresholds + GD-008 first-show friction clause
    + R7 tri-signal coding; frozen-frame provenance landed in item 46); a cohort of 10 non-developers is USER-BLOCKED
    (recruitment); the deliverable without humans = frozen protocol + disclosure. **[G5] Facade/materials** README +
    submission canonized (DG-003 in flight) + iteration-log current + ADR chain clean. **[G6] Release** develop→main
    milestone merge with CI green at tip, tag, submission pack (repo + hosted URL only if the user provides a hosting
    target — deploy choice is a USER decision, no accounts touched by agents). Loop discipline: return → disk-verify
    → merge → next queued ticket, ceiling 3 live, no per-step confirmation, every claim carries an artifact.
48. **G6 HOSTING — USER DECISION LANDED + LIVE.** User ruled: public GitHub Pages on
    `https://github.com/PepsiCo24/AI-Native-GameCpt`. The first deploy attempt FAILED with an honest on-disk root
    cause, not a guess: the repo was PRIVATE (free plan ⇒ no Pages; the REST enable said "plan does not support",
    the deploy action said "ensure Pages enabled"). Three options put to the user with facts; user chose public.
    Pre-flip gate run live in view before any exposure: tracked-file scan (no `.env`/credentials/keys ever
    committed), credential-literal grep over the whole tracked tree (zero hits; sole match = AGENTS §9's own policy
    sentence). Flip executed under that explicit choice; Pages enabled (`build_type: workflow`); rerun deployed.
    **Live verification is a real browser walk, not a curl**: `?level=8` rendered (canvas 1), trusted keys R,R,R —
    moves froze at 2, phase unchanged (the refusal triple holds on the public internet), zero page errors, zero
    failed requests; homepage metadata set. Mechanics: `main` = the shipped artifact (the 162-commit lag closed by
    release merge `3601935`, CI green on main); `deploy-pages.yml` builds the subpath-safe `dist/` (vite
    `base: './'`, headless-simulated under a `/AI-Native-GameCpt/` path BEFORE shipping) on every main push —
    future milestone merges auto-publish. The public build SHIPS WITH PLACEHOLDER ART DISCLOSED in-game (banner)
    and in the workflow header comment — Asset Gate honored; revision art remains the user's lane; URL ≠ G6 done
    (final release = milestone re-merge when G1–G5 land).
49. **DG-003 MERGED — facade canonized to disk-truth (`dde5a3d`+`d358e15` → merge `5cabdd2`).** Verification judged the
    disk, not the report: all 7 cited SHAs exist (`git cat-file`); "M1-alone 0/370" is the canonical figure of this
    file, not invented; "nothing DELIVERED" matches manifest V0.5 verbatim; secret/banned-word scans over added lines
    clean; 46/2000 is the only divergence figure cited (1×README, 2×design-thinking, 5×iteration). Their self-check
    caught three own overclaims before commit — consistent with what landed. **My finding they could not have:
    dangling evidence pointers** — README/submission cite `dyn-merged/` (15 trusted-input frames + manifest) that
    live in the Orchestrator smoke dir, NOT in the repo (`git ls-files` 0 hits). A public repo may not cite
    unverifiable artefacts → **DG-004 queued with pre-milestone force**: copy evidence into `docs/evidence/`,
    re-point every citation, add the live-URL line (Pages went public after their base — they could not know it).
    Until DG-004 lands, no further main merge (current public main is pre-DG text — stale but not wrong-citing).
    Gap inventory routed: #1→PA-006(item 51) · #2→LV-008(live) · #3→QA-005(item 50) · #4→user art lane ·
    #5→GD post-cohort · #6/#8→GD ticket queued · #7→LV queue · #9 URL half discharged by item 48, video remains ·
    #10 folds into PA-006's BUT-table re-freeze.
50. **QA-005 MERGED — standing browser regression permanent (`6b5bf71` → merge `616789e`).** Disk-verified: 12 files
    exactly their owned set (`playwright.config.ts`+`tests/**`), 3,217 insertions; `--list` count matched 75/7;
    **the authoritative run was on merged develop, not their worktree**: Playwright **75 passed / exit 0 / 3.4 min** +
    tsc 0 + vitest 408/3 + levels 10/10 + build ✓ (all re-run by me at `5cabdd2`/`b96f3f8`). Suite is production-data
    driven (par routes solved at runtime — future levels flow without spec edits). **Two REAL production defects
    confirmed verbatim at source and pinned, not patched**: ① frame-window keyboard replay — two down/up pairs in one
    frame ⇒ 5 moves (`input-map.ts:130` onKeyDown); ② stale mid-run win copy prints "L1–L5 cleared" while the game
    ships L10 (`hud.ts:348`). Both are live on the public URL now — fix ticket dispatched (item 51); pins are the
    un-pin contract (unexpected-PASS flags removal). **Transient-frame physics got its terminal verdict** (the
    Entry-2 not-capturable hole): refusal arc P1 measurable (109 ms window in the 220 ms budget, peak 2488 px, actor
    centroid 2 px off ROI centre); press-beat P2 **occluded by construction** — actor disc 0.70 cell strictly contains
    the 0.40 cell switch footprint, so no production change is wanted or needed while occupied; ui-ux wording
    follow-up = UA-0009 queued micro. **CI ruling (their OQ2): e2e job REQUIRED after `verify`** (`b96f3f8`) —
    chromium-only, workers 1, NO retries (flake surfaces stay visible), report artifact on failure. Their hygiene
    risk accepted+fixed: `node_modules/`→`node_modules` so worktree symlinks can never be staged.
51. **DISPATCHED — live agents 3/3 ceiling.** **R-004b → Gameplay Engineer** (branch `agent/gameplay/r-004b-input-hud-embed`,
    base `b96f3f8`): fix both pinned defects (src + the granted two-line e2e un-pin + new `tests/unit` regressions)
    AND land R-004 (`isPlayerEmbedded` → `src/core/rules` via the `solidAt` one-truth, six-step order,
    architecture-0003 R4). **PA-006 → Playtest Analyst** (branch `agent/playtest/pa-006-stage2-refreeze`, base
    `b96f3f8`): Stage-2 instrument **re-freeze V0.6** — the `41d5a4b` freeze covers L1–L5 only, pre-unlock, so a
    cohort would test a prototype that no longer exists; scope = L1–L10 per-level metrics (understand-time,
    first-win, refuses/restarts/undos, confusion markers, continue-intent at the L5→L6 d′ seam and L6→L8 a′ probe),
    explicit c′-deferral ruling (portals wait for accepted `l011.json`), friction clause + R7 tri-signal coding,
    sha256 provenance manifest, user-facing 10-cohort runbook. Cohort itself stays the user's lane; this ticket is
    the human-free half of G4. **Queue**: DG-004 (PRE-MILESTONE GATE), UA-0009, GD ticket (level-design:115 +
    par-HUD OQ1 + L11 block-ruling after LV-008), R-003 → after LV-008, LV-007D/E → after LV-008, demo video (user/DG).
52. **LV-008 MERGED — L11 ACCEPTED, clause-by-clause against the frozen law (`5127600` → merge `aaab35d`).** Law
    immobility verified on disk first: exactly one commit touched `level-design.md` since `c68afac` (GD-009 citation
    corrigendum) and the §6 pre-registered clause (line 184) shows **zero diff** — the acceptance numbers predate
    every candidate and never moved. Clauses, all machine-checked: `D_exec 8.5732 < 13.64` (the bound itself is the
    2-dp published form of L10's 13.642857 — strictly harder than "beat L10"); `par 4` holds the cap; exactly ONE
    opposite-colour pair — validator-enforced, `errors=0`; `T=0` false routes; below-OFFERED debut grade with
    `switchRequired:"exempt"` recorded on the L6 precedent. **Filtered, never fitted**: 54 seeded candidates
    (`SEED 20261015`, committed `author-l11-candidates.ts`) → 1 accept = shipped `MATCH`; histogram 49×
    gate-shortest / 4× par-cap; both "差一点" probes rejected by name (same-colour pair = hard validator error;
    bypassable portal = gate (ii) trip). L1–L10 numbers unmovable and unmoved: solver dump blocks 10/10
    byte-identical, difficulty rows byte-identical, `l001–l010.json` untouched. Gate (iv) satisfiable for the FIRST
    time (`dualPhaseTiles 21`) — this RESOLVES the standing escalation without weakening it (whitelist still exactly
    one gate, still only l008). The §8.5 ordered/unordered promotion trigger was tested at the first L11+ candidate
    and **did not fire** (`[5,0]` equal on both readers) → block ruling needed no movement. Merged-tree battery, my
    own re-run: tsc 0 · vitest **23 files / 448 passed / 3 skipped** (only-up) · solver **11/11 + exactly 1
    escalation** · validator **11/11 + 10/10 negatives by name** · build ✓ · CI pending. Honest risks accepted
    (seam control is boundary-not-surgical, documented; pair-count control coupling recorded in test comment).
    **Still invisible in-game**: registry pins `l001–l010` — R-003 dispatched (item 53).
53. **R-003 DISPATCHED + QUEUE REALIGNED (live 3/3).** **R-003 → Gameplay Engineer** (branch
    `agent/gameplay/r-003-l11-unlock`): the two registry data lines + `renderer-level-unlock.test.ts` re-pin — the
    minimal, auditable unlock path (LV-008 was right to refuse this edit itself; author ≠ unlocker). No e2e
    expectation edits allowed (new count/failures are data-driven signals to report, not to smooth). Landing L11 in
    the playable registry opens the **Entry-3 portal-pair capture** on `:5199` (my lane) → UA Entry-3 review — the
    visual-evidence gate for the portal painter. **Unblocked by acceptance**: GD ticket (level-design:115 stale tail
    + par-HUD OQ1 + a BLOCK-RULGING RECORD that §8.5 promotion trigger was tested 2026-10-15 and did not fire);
    LV-007D/E (pipeline §8.5 remainder now that l011's generator is shipped; metrics sidecar incl. L11 row; R5
    multi-switch-door validator warning); **DG-004 scope grows**: evidence-in-repo + live-URL lines + ITER-0012
    mirror (LV-008's AGENTS §6 obligation is Docs' pen) + the demo-video gap note; QA-005b portal e2e after R-003;
    **LV-009 L12–L15** per G1 stretch — OQ2 first (per-level seeded script vs bulk generator). LV-008 worktree
    pruned post-merge (the clause-by-clause record above is the review).
54. **R-003 VERIFIED + HELD AS CHAIN-BASE (unmerged on purpose) — and the e2e gate caught ME red-handed.**
    R-003 (`f484e23`) disk-proved: board blob `b09a77bc…` byte-identical to develop at GIT-OBJECT level (author ≠
    unlocker, not merely claimed); registry = the two data lines in the L6–L10 pattern; branch battery my own run:
    tsc 0 · vitest 23 files / **452** / 3 (only-up) · validator 11/11 · real-browser `?level=11` smoke green (HUD
    flip cadence, 0 errors). Its tip's suite fails exactly 4 — all from ONE QA-owned constant, and R-003 correctly
    refused to touch it. **But the first cloud CI run of the required e2e job (`7f941b5`) failed 13/80 — and 7 of
    them are MY miss at the LV-008 merge**: the suite iterates the DATASET (11 files on disk) while the constant
    says 10; I trusted the cloud gate instead of re-running Playwright locally after that merge, and the gate
    recorded it faithfully. Fault mine, recorded not smoothed. Classification of the 13: **(a) 7 count/dataset**
    — die with the chain merge (registry 11 + `EXPECTED_LEVEL_COUNT` re-pin; QA-005b's acceptance already requires
    the full suite zero-red-except-pins at its tip); **(b) 6 timing-class** (transient P1+P2, mobile swipe, refusal
    L3/L4/L9) — the contended-runner surface QA-005 warned about (13.4 min cloud vs 3.4 min local = ~4× slower,
    self-calibrating budgets `gridMs < 60` plausibly blown). Discriminating experiment fired: full re-run of the
    FAILED JOB ONLY on the same commit — same six ⇒ deterministic cloud shape (needs QA-005c runner-tolerance
    ticket or recorded cloud-skip rationale), different ⇒ flakes. **Until that evidence lands, the e2e job stays
    required** (a gate is not demoted because it worked). **QA-005b dispatched as CHAIN branch based directly on
    `f484e23`**: one merge lands both atomic commits together, no red window for the registry-class failures; hard
    conflict boundary enforced (R-004b live-owns the two pin files + all `src/**`; playthrough header prose = KNOWN
    DEFER). DG-004 scope grows: iteration-log mirror now carries the R-003 line too.
55. **R-004b VERIFIED + HELD FOR CHAIN-REBASE — the landmine they honestly flagged.** Disk-verified at their tip
    (`3a607ca`+`318e518`, base `b96f3f8`): WeakSet object-identity handler as a Phaser-free rule module; end-panel
    body now built from a REQUIRED `shippedLadder()` hook derived in the composition root (the stale-literal class
    of bug is structurally impossible again); `isPlayerEmbedded` lives in `src/core/rules/solid.ts` via `solidAt`
    with the systems→renderer edge now TEST-ENFORCED (0 specifiers on disk — I counted). My own run: tsc 0 · vitest
    25 files/441/3 (only-up against their base — the 441-vs-develop-448 gap is the BASE gap, not a regression).
    Sharpest evidence in the ticket: the control runs the PRE-FIX handler through the same harness and reproduces
    the browser's exact 5. **Serialization decision**: their tests were written against the 10-level registry —
    merged as-is into the 11-level world their end-panel/unlock-chain/`:147` assertions would go red. So NOTHING
    merges until QA-005b lands; then **R-004b resumes → rebases onto the final chain → adapts its own
    registry-sensitive assertions → full battery re-run → ONE green merge**. RV-007 (read-only) dispatched now over
    all three held commits, asked to enumerate the exact landmine assertions and stress-test this ordering.
    Accepted, not re-litigated: OS key-repeat deliberately unsuppressed (distinct objects ⇒ legit moves — locked
    rule preserved, "one keydown ⇒ one move" ≠ "hold key = one move"); `ladderLabelOf([])` branch kept for
    `noUncheckedIndexedAccess`, YAGNI call handed to RV-007; stale QA prose is correct ownership discipline →
    **QA-005c micro queued** (narration refresh + the REAL config flaw: `reuseExistingServer: true` means a busy
    :5198 silently tests another tree — must fail loudly); end-panel string awaits UA sign-off (folds into UA-0009);
    AGENTS §6 mirrors (input dedupe + copy source + architecture §4 test-enforced-arrow note) grow DG-004.
56. **PA-006 MERGED (`df353a0` → `b6a702b`) — G4's human-free half is DONE.** Verification: layered §11 over a
    byte-untouched V0.5 (sole deletion = the version line itself, T6 honored); my own `shasum -c` re-check 5/5 OK;
    freeze id `df353a0` (RF-1). The instrument is genuinely stricter than asked: BUT rule bound to the DEPLOYED main
    commit read off Actions (a mid-round deploy stops the round), defect-neutral BD-1/BD-2 contamination clauses so
    cohort validity does not depend on R-004b's timing, SEAM-1/SEAM-2 pre-registered thresholds with PP-A
    hand-verified against shipped `l008`, c′ deferred with three repo-fact grounds — deferred loudly, never silently.
    **Orchestrator rulings on its three OQs:** (1) YES R-004b lands before cohort v2 — but not because the protocol
    requires it (it is neutral): it lands as the chain's single green merge anyway, and BD-1 is the round's worst
    threat; (2) no extra P-standby beyond the 3-replacement cap until replacements actually fire — YAGNI; (3) runbook
    §2.4 frame-capture execution = **Orchestrator lane** (`:5199` reserved), scheduled right after the chain merge
    (that IS the Entry-3 portal-capture window — one setup serves both). **GD-010 dispatched** into the free slot
    (L11 law OUTCOME annotation with byte-preservation proof, line-115 tail fix, A3 non-firing record `[5,0]`, OQ1
    par-HUD ruling — decision by GD, landing in ui-ux deferred to UA). Live: QA-005b, RV-007, GD-010 = 3/3. PA-006
    worktree + branch pruned; iteration-log RF-1 entry = DG-004.
57. **GD-010 MERGED + CI discriminating experiment READS: mixed cloud shape — two rulings.** GD-010 (`43f1d84` →
    merge `081b9cc`): frozen §6 clause **byte-preserved under the OUTCOME annotation** — proof not taken on trust: I
    re-hashed the paragraph at `b6a702b` vs tip (`ea72befc…` identical); line-115 tail now names the landed ordered
    reader (substance of the old bullet verified intact on the + side: 46/2000, LV-007C, §8.5-unordered doctrine all
    present); **ADR-design-0002** records the promotion trigger's measured non-firing (triple-sourced `[5,0]`,
    pre-specified re-opener, no-vibes clause) — approved here per AGENTS §4; **GD-OQ1 par-in-HUD REFUSED** from locked
    doctrine (§9 show-don't-tell, board-is-the-teacher, §12 no-punishment, §0.5 no-new-screens) with an
    evidence-only re-entry; `ui-ux.md` untouched (filing = UA's pen → UA-0009 dispatched: OQ1 closure, end-panel
    string shape sign-off, transient-observability wording now that QA-005 gave the arcs a terminal verdict, SW/R7
    observation note). **The cloud e2e re-run (same commit) finished: 9 failed vs 13 first time — the sets differ.**
    Decomposition: the 7 count/dataset failures persist (registry-10-vs-dataset-11 — die with the chain merge, as
    planned); `transient.spec.ts:116/:257` failed BOTH runs ⇒ deterministic cloud shape (software GL ~4× slower:
    self-calibrating budgets like `gridMs < 60` observed at 31 ms locally simply go bankrupt there — the
    calibration fails its own guard); refusal/mobile-swipe membership drifted run-to-run ⇒ intermittent tail. Two
    rulings: **(1)** `--retries=1` in the CI job ONLY — a case that passes on retry reports FLAKY (Playwright's
    distinct state) and every FLAKY must be named in a follow-up ticket; local stays zero-retry per QA-005's
    discipline. No more silent-red blocking a required gate, and no more hiding either. **(2)** QA-005c ticket
    grows: transient-class runner tolerance (calibrate-or-annotate, decision by evidence from BOTH cloud runs now on
    file) + the narration refresh + `reuseExistingServer:false`. Gate stays REQUIRED — two rulings, one
    experiment, zero demotions. Next main milestone = R-003 + R-004b + DG-004 landed (DG-004 is a
    PRE-MILESTONE gate: public README may not cite out-of-repo evidence).

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

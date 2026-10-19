# `tests/e2e` — the standing browser suite (QA-005)

Owner: **QA Engineer** (`playwright.config.*` + `tests/**`, AGENTS.md §4). This
file is the QA note for the suite: what it pins, how to run it, what it found, and
what it deliberately does **not** claim.

The only question that matters is still §0's, and a browser suite cannot answer it
— but it can answer the *mechanical* questions that would otherwise be answered by
opinion: does a level finish, does a refusal freeze, does the door obey the latch,
does touch work, and can a sub-100 ms animation be *measured* at all.

---

## 1. Run it

```bash
npx playwright test                       # both projects, its own vite on :5198
npx playwright test --project=desktop     # keyboard / layout / transient protocol
npx playwright test --project=mobile      # Pixel 5: touch, gestures, layout
PS_E2E_BASE_URL=http://localhost:6000 npx playwright test   # use a server you started
```

The suite **never reuses another session's dev server**. It starts its own vite on
`PS_E2E_PORT` (default **5198** — not the `5173` default, not the Orchestrator's
`5199`) with `--strictPort`, so a collision is a loud failure instead of a silent
run against somebody else's tree. Setting `PS_E2E_BASE_URL` disables the managed
server and points the suite at your instance (that is the parameterised `baseURL`).

`workers: 1` / `fullyParallel: false` are deliberate: `transient.spec.ts` samples
real animation frames, and a second worker stealing CPU would make the frame grid a
lottery. The whole suite is ~3.3 minutes locally (16.9 min on the 2-core CI runner, §5).

### It is not part of `npm test` — and that is verified, not hoped

`vite.config.ts` collects `tests/**/*.test.ts`. This suite is `tests/e2e/**/*.spec.ts`
— a different directory **and** a different extension — so `npm run test` stays
vitest-only and a missing browser can never break the unit gate.

Evidence (QA-005 run):

| check | result |
|---|---|
| `vitest run` before this branch | 22 files · 408 passed · 3 skipped |
| `vitest run` after this branch | **22 files · 408 passed · 3 skipped** (unchanged) |
| files vitest collects | 22 — of which under `tests/e2e`: **0**, ending `.spec.ts`: **0** |
| `npm run levels` | `10/10 level files ok · 10/10 negative cases rejected` → **PASS** |
| `tsc --noEmit` | clean |

### The deployed-artifact lane — `tests/e2e-live` (QA-005h): on demand, never in CI

Everything above runs against a vite this repo just built from the working tree.
Nothing above runs against **the artifact the world can load** — the GitHub Pages
build of `main`. `tests/e2e-live/` is that lane, and it is one command:

```bash
npx playwright test --config=playwright.live.config.ts   # root config, its own testDir
```

For every shipped level it opens the *deployed* bundle with `?level=<n>` and drives
the **solver's** par route (`loadReferenceLevels()` — the same helper the standing
suite uses, so no move count is typed into the lane), then requires the deployed HUD
to agree: a fresh session at move 0 with no dialog, `moves === route.length`, the win
dialog up, the session still naming the level, and both error channels
(`console.error` + `pageerror`) empty. Plus one `?level=99` fallback row and one row
pinning the lane's own targeting rule (below).

Measured 2026-10-16 against `main` = `5b058ff`, deployed bundle
`assets/index-CCs6qr4w.js` — **17 passed (43.8 s)**, per-row 2.2–3.7 s, fallback row
1.3 s (the Orchestrator's throwaway reference run: 16/16 in 31.8 s; this lane adds one
cheap row, below). **Isolation, measured:** `npx playwright test --list` still reports
**107 tests in 8 files** and `npx vitest run` still reports **32 files · 648 passed ·
3 skipped** — the lane's directory is invisible to both rosters, in both directions.

**It is deliberately NOT in CI.** The CI e2e job is a zero-retry **correctness** gate;
a spec that loads a CDN-backed production URL would make a Pages/DNS/propagation
incident indistinguishable from a code regression, and would put an external
dependency inside the gate that answers "did this commit break the game". Two files
make the separation structural, not conventional: this lane is a *separate config*
(`playwright.live.config.ts` — Playwright only auto-loads the exact name
`playwright.config.ts`, so a bare `npx playwright test` can never pick it up) with a
*separate `testDir`* and **no `webServer` at all** (nothing is built or served here, so
a mis-set base URL cannot silently re-point the lane at a local dev server).

**Finding 1 — `PS_E2E_BASE_URL` cannot target this deployment (measured).** The
standing suite's `levelUrl()` answers a **root-absolute** `/?level=<n>`; resolved
against the Pages *project* root the URL API replaces the whole path, so
`new URL("/?level=1", "https://pepsico24.github.io/AI-Native-GameCpt/").href` is
`https://pepsico24.github.io/?level=1` — the user-pages root, one level above the
project, not the game. The sub-path root is therefore spelled out in the lane's own
file (`tests/e2e-live/live-target.ts` → `LIVE_ROOT` + `liveLevelUrl()`), and that
resolution is **pinned as a test row** so the limitation cannot rot: if `levelUrl()`
ever becomes deployment-safe the row goes red and the lane can drop its own builder.

**Finding 2 — the win dialog is raised *after* the arrival beat (measured).** Reading
the HUD with a single `hud()` call immediately after the last press sees
`won === false` while `moves` is already the correct count: the flip/hop beat lands
first, the overlay is raised after it. Re-measured on the deployed build before this
lane was written: the immediate read was `won === false` on **12/15** rows (L11, L12
and L15 happened to have made it already — the read is a **race**, which is exactly why
it must not be trusted). The lane therefore reads the dialog with the auto-retrying
locator (`await expect(page.locator(".ps-overlay")).toBeVisible()`), **never** a sleep:
a sleep would hide a genuine slow-boot regression behind wall-clock padding, while the
retrying assertion waits exactly as long as the app takes and fails loudly if the
dialog never appears.

### QA-005b — the registry re-pin (10 → 11), and the two literals it cannot reach

R-003 (`f484e23`) unlocked **L11** in the playable registry (11 level files, frozen
board). The standing suite was written against the 10-level registry, and at
`f484e23` it ran **76 passed / 4 failed** (own vite, `--strictPort`):

| failing expectation | expected | received | resolved by |
|---|---|---|---|
| `playthrough.spec.ts:47` | `[1..10]` | `[1,2,3,4,5,6,7,8,9,10,11]` | ❌ **hard-typed literal** — no constant can reach it |
| `playthrough.spec.ts:97` | `"原型结束 / Prototype over"` | `"L 10 cleared"` | ✅ `EXPECTED_LEVEL_COUNT` (L10 is no longer last) |
| `playthrough.spec.ts:118` | `"L 11"` | `"L 10"` | ✅ `EXPECTED_LEVEL_COUNT` (the chain now advances L10 → L11) |
| `latch-door.spec.ts:60` | `[6..10]` | `[6,7,8,9,10,11]` | ❌ **hard-typed literal** — no constant can reach it |

`EXPECTED_LEVEL_COUNT` was re-pinned **10 → 11** (`helpers/levels.ts`, + prose), which
aligns the two *derived* failures. The other two compare a **hand-typed dataset
inventory** against the discovered set, so the number alone cannot move them — and
they are the only two failures left at this tip:

```
84 passed · 2 failed   (own vite on :5213, PS_E2E_BASE_URL, exit 1)
  latch-door.spec.ts:59 › … the dataset's latch levels are exactly the levels that ship doors
  playthrough.spec.ts:46 › … the shipped dataset is 11 levels and every one is solvable
```

The one-line fix for each — deliberately **not** applied here: `playthrough.spec.ts`
sat inside another agent's live edit boundary (R-004b), and neither literal was in
this task's granted file list, so the dispatch's rule ("if any cannot [be resolved
through the constant], STOP and report instead of touching the file") was followed for
both. See the QA-005b return contract, BLOCKER-1.

```diff
-    expect(REFS.map((ref) => ref.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
+    expect(REFS.map((ref) => ref.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
-    expect(DOOR_LEVELS.map((ref) => ref.id)).toEqual([6, 7, 8, 9, 10]);
+    expect(DOOR_LEVELS.map((ref) => ref.id)).toEqual([6, 7, 8, 9, 10, 11]);
```

**Known gap this exposed — CLOSED by QA-005c (§1.3).** These two assertions were
typed lists, so the README's own promise that "adding a level needs no test edit" was
not true for them — the count *and* the two inventories had to be re-pinned by hand.
QA-005c derived both inventories from the discovered dataset and left exactly one
hand-typed pin (`EXPECTED_LEVEL_COUNT`), with a mutation probe that proves the alarm
still fires when a level file is added, removed or renumbered.

Evidence (QA-005b run, worktree `qa-005b-portal-e2e` @ `f484e23` + this branch):

| check | result |
|---|---|
| `tsc --noEmit` | 0 errors |
| `vitest run` | **23 files · 452 passed · 3 skipped** (455) — prose-only edit, registry-layers stayed green |
| `npm run levels` | `11/11 level files ok · 10/10 negative cases rejected by name` → **PASS** |
| `playwright test --list` | **86 tests in 8 files** (was 80 in 7) |
| `playwright test` (own vite :5213) | **84 passed · 2 failed** — the two literals above, nothing else |
| `test.fail()` pins | both ride as expected failures (green semantics): `input-replay.spec.ts:97`, `playthrough.spec.ts:147` |

**KNOWN DEFER — CLOSED by QA-005c.** `playthrough.spec.ts`'s header used to describe
itself as "**the L1–L10 par-route playthrough**" while the registry shipped eleven
levels; its line-133 comment said "Reaching L10's win … is the whole unlock claim".
Both are re-worded now — the header names `L{EXPECTED_LEVEL_COUNT}` and the comment
names the last shipped level — and the unlock-chain test title derives
`L1 → L{EXPECTED_LEVEL_COUNT}` from the pin, so the prose cannot drift from the
registry again. Recorded here as the closed half of the QA-005b defer.

### 1.3 QA-005c — the flake's root cause, the derived inventories, the CI envelope

R-004b's merge turned the two dataset literals into the *only* remaining reds, and
the QA-005c tip was **86 / 0 × 3 consecutive runs, zero retries** once they landed.
This subsection is the evidence trail for that run.

**The flake (this was a measurement defect, not a rule defect).** The named sites
were `latch-door.spec.ts` (L6/L10) and `refusal.spec.ts` (L3), failing as
`actor tile should be … found []`. Root cause: `actorCell` reads the player's tile
from **one presented frame at one instant**, and a legal move is not instant —
§6.1's `hop` tween carries the disc from one cell centre to the next over 130 ms, and
between the two centres the body covers **neither**, so a single-instant probe
legitimately returns `cells: []`. Measured frame-by-frame after a press (QA-005c):
desktop L1 → empty at frame 0, settled at frame 1; **mobile → empty frames 0–3**.
`pressDirection` only waits two frames, so an assertion issued right after it could
land inside that window.

The fix is in `expectActorAt` (`helpers/game.ts`): it now **polls bounded** (2 s, one
probe per frame) until the probe reads **exactly one** cell **and it is `expected`**,
then fails honestly with the last probe and the elapsed time. `[]`, `[oldCell]` and
two matches all keep polling and all fail if they persist, and the settled case costs
one probe, so no sleep padding was added at any call site and a real timing
regression cannot hide behind the window. The refusal nudge (90 ms) has the same
shape and is covered by the same change.

The flake's *other* presence was the touch path: `mobile.mobile.spec.ts` R-T4
(`a ≥ 24 px swipe is a move`, `Expected: 1, Received: 0`). A pointer gesture is
consumed by the game's input update on a later frame, so the post-gesture HUD read is
now a bounded poll (`expectMoves`, 2 s, `toBe` — the counter must still reach the
value) rather than a single read after a fixed `settle`; `swipeTouch` also keeps one
cached CDP session per page instead of creating and detaching one per gesture, and
waits a frame after `touchEnd` so the sequence is consumed before the caller reads.
The gesture deliberately stays a single-frame burst: R-T4's own precondition is
`swipeMaxMs = 500` of game time, and pacing one event per frame would put a slow
runner over the limit and turn the rule into a lottery.

**The inventories are derived; one pin is left.** `REFS.map(…id)` /
`DOOR_LEVELS.map(…id)` typed literals are gone. `helpers/levels.ts` now exposes
`discoveredFileIds()` (fs scan), `datasetIds()` / `doorLevelIds()` (from the parsed
refs) and `inventoryViolation(ids, expected)` — the gate the specs assert. The one
hand-typed number is `EXPECTED_LEVEL_COUNT`; the mutation probe
(`tests/unit/level-inventory-derivation.test.ts`) clones the shipped `src/levels/`
into a tmpdir and drives the **real loader** over it: pristine clone → no alarm,
`+1` file → alarm (count), `−1` file → alarm (count), and a level whose own `id` is
wrong (`l005.json` saying `id: 50`) → alarm (contiguity) even though the count is
still the pinned one. The latch inventory keeps the design rule the old `[6..11]`
literal carried, restated without a typed number: the latch levels are the dataset's
**contiguous tail**.

**MINOR-2 (RV-007).** The end-panel test now asserts
`dialogBody` **contains** `` `L1–L${EXPECTED_LEVEL_COUNT}` `` (U+2013, the character
`ladderLabelOf` emits) instead of only rejecting `L1–L5`, so the composition-root
chain — registry → `ladderLabelOf` → panel copy — is closed end-to-end and derived
from the one pin.

**MINOR-3 (RV-007).** The layer-home scan in
`tests/unit/player-embedded-home.test.ts` is now **recursive** (a one-level
`readdirSync` stopped covering a layer the moment it grew a subdirectory) and its
specifier reader knows the **bare/side-effect** form (`import "…";`) that a boundary
violation would actually use, plus `require(…)`. A non-vacuity test proves both: the
walk reaches `src/game/renderer/objects/`, and every pattern reads a
`@/game/renderer/…` specifier in all five shapes.

**`reuseExistingServer: false` (`playwright.config.ts`).** Playwright's local default
is `true`, which silently tests whatever is already on the port — defeating
`--strictPort` and letting a config run exercise *another worktree's* code with a
green report. `false` is now explicit (with the reasoning in the config), so a busy
port fails loudly; the deliberate "use the server I started" path stays
`PS_E2E_BASE_URL`, which removes the managed server entirely. QA-005c ran its own
vite on `PS_E2E_PORT=5214`.

**The CI envelope (cloud sobering).** The pushed tip on the 2-core software-GL
runner measured **7 failed / 79 passed (16.9 min)** with `--retries=1`:

| CI failure | class | QA-005c answer |
|---|---|---|
| `playthrough.spec.ts:113` unlock chain, 30.9 s × 2 | **wall clock**, not an assertion | the walk now carries a documented 120 s CI budget (`test.setTimeout`) |
| `refusal.spec.ts:48` L3/L4/L9, 30.8 s | **wall clock**, not an assertion | per-level walk carries a documented 90 s CI budget |
| `latch-door.spec.ts:134` L15 UI walk, 30.9 s (run 38845237536, release-build contention; 21.2 s quiet in run 38843718456) | **wall clock**, not an assertion | QA-005g: the per-level UI walk carries a documented 90 s CI budget |
| `portal.spec.ts:265` L11 portal walk, 30.8 s (run 38857692208, art bundle live; 20.7 s pre-art in run 38849186852) | **wall clock**, not an assertion | QA-005i: the row carries a documented 90 s CI budget |
| `playthrough.spec.ts:135` unlock chain L1→L15, 2.1 m = 126 s (run 38857692208, art bundle live; 96 s pre-art in run 38849186852) | **wall clock**, not an assertion | QA-005i: the row's QA-005c budget was re-derived from 120 s to 360 s |
| `refusal.spec.ts:48` (all params, on loaded machines) | the `cells: []` single-instant probe | the bounded poll above |
| `transient.spec.ts:116` / `:257` (`frames > 15`, `gridMs < 60`) | local-calibrated constants | runner-aware: the idle frame grid is **measured first**, the recorder window is sized from it, and the `gridMs` ceiling is `max(60, 2 × idle)` |
| `mobile.mobile.spec.ts:207` R-T4, `Expected: 1, Received: 0` | gesture commit vs HUD read | cached CDP session + a frame after `touchEnd` + the bounded `expectMoves` poll |
| `controls.spec.ts:111`, `latch-door.spec.ts:134` L6/L10, `playthrough.spec.ts:79` L5, `portal.spec.ts:199` — runs `38863193343` / `38863790675`, `Expected 1, Received 0` and a depth-4 route counted **3** | **a press LOST at the input-attach window** — *not* a HUD-read race: the counter/phase are written **synchronously inside the DOM `keydown`'s own task** (§1.9 verification probe: an in-event read sees `moves 1` on a listening board and `moves 0` — still `0` three seconds later — when only the art loader is slowed) | `openLevel` waits for the delivered-art loader (`768e93e`, §1.9). The five rows A/B under `+1200 ms`/png: **5 failed → 5 passed**. The read path is deliberately **not** changed: a retrying read cannot recover a press that was never handled — the 2 s `expectMoves` poll on `mobile.mobile.spec.ts:331` failed exactly that way under the same cause |
| `latch-door.spec.ts:217` L8 door walk, **29.2 s** (pre-gate slow round `38862977845`) / 28.9 s (`38869874603`) | **wall clock**, not an assertion — **97 %** of the 30 s default | QA-005j: documented 90 s CI budget (~3× worst, the QA-005g rule) |
| `playthrough.spec.ts:79` L1→L15 par walk, worst **26.4 s** (`38862977845`) / 26.2 s (`38869874603`) | **wall clock**, not an assertion — **88 %** of the 30 s default | QA-005j: documented 90 s CI budget |
| `portal.spec.ts:199` L11 UI walk, **23.7 s** (`38862977845`) / 24.4 s (`38867895111`) | **wall clock**, not an assertion — **81 %** of the 30 s default | QA-005j: documented 90 s CI budget (its sibling `:265` already had one, QA-005i) |

**Both crossed rows crossed twice (QA-009).** The two QA-005i rows above went red *again* in
run **38860398944** (`d9a83dd`), on the same messages and zero assertion flips —
`Test timeout of 30000ms exceeded.` / `Test timeout of 120000ms exceeded.` — while run
**38861480689** (`e469e72`, **byte-identical test tree**) went **107 passed / 0 failed (20.3 m)**.
Class: contention on top of **runner variance** — wall clock, never an assertion. The same-code
control (identical tree, 31.4 m against 20.3 m) withdrew the art-inflation attribution per
project-status item 84; local interleaved controls confirm the art state costs no more per frame,
per boot, or per harness path. The budgets above are ceilings for the ENVIRONMENT wall clock
(QA-005g class), sized by the budget-when-crossed law (item 77(d)) at ≥2.5× observed.

**QA-005j — the ceiling re-scan (from the logs, not by eye).** Every one of the **107** row times
in the two green rounds that carried the readiness gate (`38867895111`, `38869874603`) was parsed
from the job log and compared against *that row's own* ceiling (30 s default; 90 s / 120 s /
360 s where set). Exactly **three** rows sat at ≥ 75 % of the default; none other is above 66 %
of its budget. All three were already there *before* the gate — 29.2 s / 26.4 s / 23.7 s in the
pre-gate slow round `38862977845`, and 18.0 s / 12.5 s / 17.0 s in the fast round `38861480689` —
so this is the pre-existing wall-clock exposure, not the gate's cost; and they are the *same
three families* the fast rounds lost presses on. The two risk regimes are therefore
**complementary**: fast ⇒ a press lost at the input-attach window (fixed by the gate, §1.9);
slow ⇒ wall clock against the ceiling (paid by these envelopes, wall clock only, `expect(`-diff 0).

The `frames > 15` tooth survives by construction: the window is `max(700 ms,
24 × idle grid)`, so it spans ≥ ~24 of the *runner's own* frames on any machine
(local: 700 ms; a 125 ms runner: 3 s). The `gridMs` guard's semantic stays "the
recorder kept its own machine's frame grid", which is what makes the channel a rAF
grid and not a 670 ms screenshot round trip — with `idle < 335 ms` as the separate
"this machine renders frames at all" check, so a runner that only screenshots is
still failed.

Evidence (QA-005c, own vite on :5214):

| check | result |
|---|---|
| `tsc --noEmit` | 0 errors |
| `vitest run` | **29 files · 543 passed · 3 skipped** — the one new file is the mutation probe; nothing else changed |
| `npm run levels` | `11/11 level files ok · 0 errors · 15 warnings(0 multi-switch-door) · 11/11 negative cases` → **PASS** |
| `npx playwright test --list` | **86 tests in 8 files** (unchanged) |
| `npx playwright test` | **86 passed · 0 failed, zero retries**, × 3 consecutive runs (`3.3 / 3.1 / 3.2 min`), plus a 4th on the committed bytes (3.2 min) |
| targeted repeats | `latch-door` L6/L10 × 10 and `refusal` L3 × 10 on the reworked `expectActorAt`/`expectMoves` — **60/60 and 10/10** |
| `npm run build` | ✓ built (chunk-size warning only) |

### 1.4 What QA-005c did **not** do

CI could not be re-run from this lane (no push authority). The cloud-shaped fixes
above are built from the measured CI roster (wall-clock timeouts, the `cells: []`
mechanism, local-calibrated constants, gesture commit) and proved locally; the next
CI run on `develop` is the confirmation, and the orchestrator's item 66 roster is the
baseline to compare against.

### 1.5 QA-005d — the two cloud-only survivors: measured root causes, and the branches that name themselves

The QA-005c tip was 86 / 0 three times locally and the merged tip still carried
**two deterministic CI reds** on the 2-core software-GL runner (`ci.yml` runs
`npx playwright test --retries=1`):

| survivor | CI symptom | class |
|---|---|---|
| `transient.spec.ts` **P1** — the §6.5 refusal arc | `onset: null` on the runner, an onset on every local run; it *passed on retry #1* | the runner's frame grid **cannot present a 90 ms transient** — a measurement limit, not a rule failure |
| `mobile.mobile.spec.ts` **R-T4** — the ≥ 24 px swipe | `Expected: 1, Received: 0`, 4/4 deterministic | the CDP touch burst spanned 15 of the runner's frames, so the *game clock* read it as > 500 ms and degraded it to a tap — a **driver pacing** defect |

Both root causes were established by measurement before anything was changed, and
neither required a `src/**` edit. The measuring instrument is one new in-page
observer (`helpers/probe.ts`): **every `requestAnimationFrame` stamp** (Phaser
steps the scene once per frame and stamps that step with the rAF timestamp, so
these *are* the game's own frame times) plus **every delivered DOM input event**,
on the same `performance.now()` clock, recorded as delivered — order and
coordinates included, so a "fix" that assumes events arrived cannot hide behind
it. The arithmetic they feed is one pure module (`helpers/frame-model.ts`, no
Playwright / Phaser / `src/**` import) whose classification is unit-proved with
synthetic grids (`tests/unit/frame-model.test.ts`), which is how the coarse-runner
branch runs on **any** machine, including a fast 60 Hz laptop.

**P1 — the root cause, at source level.** `LevelScene.tryMove` records the denial
with `denyFeedback(dir, this.time.now)` **synchronously on the DOM keydown**, i.e.
*between* two animation steps, where `scene.time.now` still holds the previous
step's stamp `Tₙ`. The next step runs with `Tₙ₊₁` and `BoardView.update` clears the
deny at `time >= startAt + deny.dur` (90 ms). The arc is therefore painted **iff**

```
Tₙ₊₁ − Tₙ < 90 ms   —  the interval between the two frames bracketing the trigger
```

On a 60 Hz laptop that interval is ~17 ms and the beat is owed; the CI runner's
interval *straddles* 90 ms, which is exactly why the same commit reported
`onset: null` and then passed on a retry. The walk **measures** the interval from
the page's own frame stamps and the delivered keydown instead of assuming either
machine.

> **Superseded by QA-005e (§1.6).** QA-005d went one step too far: it used the
> *pre-measured mean* grid to choose which of the two observations to **require**,
> and on run `38784574025` the mean and the observation contradicted each other in
> both directions. The interval is still measured, but the branch is now chosen
> **post hoc** from the recording's own log (`arcWindow` → `arcImplication` →
> `arcHandling`). Read §1.6, and §1.7 for the attribution fix, before touching this
> arm.

- **`resolvable` — the pixel teeth are unchanged.** Fresh local evidence:
  `frames=41 gridMs=17.1 gapMs=16.7 verdict=resolvable onset=105.4 settled=213.3
  peakPrevChanged=1944`. The 1944 changed pixels at the first step inside the
  window are the `deny` ring tint at `ringAlpha = 0.5` plus the nudge — detection
  does not depend on the nudge offset being non-zero (the unit file asserts the
  geometry agrees with the verdict anyway).
- **`unresolvable-at-grid` — a named outcome, never a dropped assertion.** It is
  only legitimate in the direction that makes the limit real (`gap >= 90 ms`, and
  the recorder reports **no** onset), and it still asserts everything deterministic
  the refusal owes: no move · no flip (state channel); the player **still on their
  own tile**, read from the pixels; the canvas read-back healthy (`distinct > 4`,
  not the black-WebGL trap); and a **positive control through the same channel on
  the same runner** (`pressDirection("right")` → `moves 1`, `phase B`). It emits a
  greppable `[QA-005d] RESOLVE-LIMIT …` log line, a `RESOLVE-LIMIT` test
  annotation and a JSON attachment — so a green CI run can never be `onset: null`
  *silently*.
- **P1b — the fallback is proved, not left to a slow runner's mercy.** The 140 ms
  `installFrameStretcher` (`helpers/frame-stretch.ts`) burns a fixed budget once
  per animation frame from the test side (`addInitScript`; `src/**` untouched), so
  a ~150 ms grid makes the classification a *prediction* the runner must obey.
  Fresh local evidence: `frames=24 gridMs=156.0 gapMs=150.0
  verdict=unresolvable-at-grid onset=null settled=155.8 peakPrevChanged=0`. Without
  P1b the fallback would only ever execute on a slow machine and could rot
  unnoticed until a runner happened to straddle 90 ms.

**R-T4 — the root cause (reproduced, then fixed tests-side).** Each awaited CDP
`Input.dispatchTouchEvent` is gated by the renderer's next animation frame, and
the game clock is quantised to the frame grid (`onPointerUp` computes
`elapsed = scene.time.now − start.time`, and `scene.time.now` only moves once per
frame). The old helper sent `start`, four interpolated `move`s and `end` **one
awaited send at a time**, so the burst's game-clock duration was
`frames_spanned × grid`, never its wall-clock span. Measured with the observer:

| grid | old burst (6 awaited sends) | game-clock elapsed | R-T4 verdict |
|---|---|---|---|
| 16.7 ms (local 60 Hz) | 13 frames | 217 ms | swipe ✓ — **no local run could ever fail** |
| 66.7 ms | 15 frames | 1001 ms | over 500 → tap |
| 133.3 ms | 15 frames | 1999 ms | over 500 → tap |

Past the window the gesture falls to the tap branch, the travel ends inside the
player's own cell, `adjacentDirection(player, player)` is `null` and the counter
stays at 0 — the cloud `Received: 0`. **Fix (driver only):** issue start, move and
end in **one tick** via `Promise.all` (array order = wire order), so the burst
costs **zero game frames at any grid**. Re-measured: `span 0 / game 0 ms at 16.7,
66.7 and 133.3 ms grids, 12/12 runs`; the four interpolated `touchMove`s went with
the `await`s that made them necessary (`onPointerUp` reads only the final
position). Causality was proved by temporarily restoring the old helper: the
coarse pin then failed with exactly the CI shape (`span 15 × 150.0 ms = 2250 ms`)
while the natural-grid swipes still passed.

**Every "it moved" / "nothing happened" claim now asserts delivery first.**
`expectGestureDelivered` requires exactly one `touchstart`, ≥ 1 `touchmove`,
exactly one `touchend`, in gesture order (`/^start(?:,move)*,end$/`) and at the
coordinates the driver aimed at (± 1 CSS px — Chromium rounds `52.5` to `53`), and
`expectSwipeDelivered` then requires the gesture to fit R-T4's own
`swipeMaxMs = 500` **on this runner's grid** (`span × grid`). A red `moves`
counter can therefore only be a *rule* verdict; a delivery regression fails by
name. Fresh local evidence: `gridMs=16.7 span=0 gameElapsedMs=0 maxMs=500
delivered=touchstart@(53,284) → touchmove@(53,248) → touchend@(53,248)`; on the
fabricated 150 ms grid, `gridMs=150.0 span=0 gameElapsedMs=0`. The dominant-axis
test is instrumented too: on a 72 CSS px cell its endpoint would *also* resolve to
`right` through the tap path, so without the evidence that assertion could have
passed without R-T4's swipe branch ever running.

**Two new tests are wall-clock heavy on purpose, and carry explicit budgets** (the
2-core runner must not blow the default 30 s): P1b measured ~18 s locally
(`test.setTimeout(120_000)`) and the mobile coarse pin ~12 s
(`test.setTimeout(90_000)`). Both budgets are wall clock only — no assertion is
relaxed — and both tests assert their own fabrication (the stretcher really
produced a grid ≥ the arc / ≥ `SWIPE_STRETCH_MS`) rather than trusting it.

**Known gap (deliberately not widened here).** The R-T5 fallback test
(`mobile.mobile.spec.ts` ~:462) still relies on the tap path resolving its 40 px
travel to `right`, so it does **not** prove the swipe branch; only R-T4 (:270), the
dominant-axis test (:327) and the coarse pin (:371) carry delivery evidence now.
Recorded as an OPEN_QUESTION rather than silently instrumented.

Evidence (QA-005d; the two changed sites were re-run against a QA-owned vite on
`:5216`, the full battery on the managed server):

| check | result |
|---|---|
| `tsc --noEmit` | 0 errors |
| `vitest run` | **30 files · 553 passed · 3 skipped** — +1 file / +10 tests, the unit proof of the frame model |
| `npm run levels` | `11/11 level files ok · 0 errors · 15 warnings · 11/11 negative cases` → **PASS** |
| `npm run build` | ✓ built (chunk-size warning only) |
| `npx playwright test --list` | **88 tests in 8 files** (was 86: +1 `transient` P1b, +1 mobile coarse pin) |
| targeted re-runs | P1 + P1b (2 passed, 21.2 s) and the six R-T4 mobile cases (6 passed, 17.5 s), delivery evidence in the log |
| `npx playwright test` | **88 passed · 0 failed, zero retries**, × 3 consecutive runs |
| targeted repeats | `--repeat-each=10` at both changed sites |

---

### 1.6 QA-005e — the natural arm states an implication, not a prediction

> **Superseded in one respect by QA-005f (§1.7).** The implication table below is
> unchanged and still correct; what QA-005f replaced is **how the window's trigger
> is found**. This section reads it by comparing the keydown's wall time against
> frame *stamps*, which is wrong on a loaded runner (a stamp is a frame's *scheduled*
> time): on the cloud it produced the false `BEAT-REQUIRED-ABSENT` this section's own
> "Known risk" paragraph predicted as possible. The **contract** below stands; the
> **attribution** is now the observer's execution order. Read §1.7 before touching
> this arm.

**The failure.** Run `38784574025` (the docs-only sibling of the green PR #1 run
`38781672236`) went red on the P1 *natural* arm **twice, in opposite directions**:

| attempt | pre-measured mean grid | bracketing gap | recorder reported | that mean *required* | result |
|---|---|---|---|---|---|
| 1 | 91.6 ms | 100.0 ms | `onset 643.4` | `onset === null` | red — the `RESOLVE-LIMIT` assertion at `transient.spec.ts:396` |
| retry #1 | 91.9 ms | 83.4 ms | `onset null` | an onset | red — `expectArcOnTheGrid` at `transient.spec.ts:301` |

Same test bytes, same tree, both attempts red, opposite directions — while the
identical commit had produced 88/0 on PR #1. That is not a flake to retry away and
not a runner to blame: it is the **assertion design** being wrong.

**Root cause (assertion, not physics).** `LevelScene.tryMove` records the denial
with `denyFeedback(dir, this.time.now)` **on the DOM keydown**, i.e. *between* two
animation steps, where `scene.time.now` still holds the previous step's stamp `Tₙ`;
`BoardView.update` clears the deny at `time >= startAt + 90`. The arc is therefore
painted **iff a frame stamp falls strictly inside `(Tₙ, Tₙ + 90)`** — the interval
between the two frames bracketing the trigger. QA-005d measured the runner's **mean**
grid over a calibration window, used that mean to choose which observation to
*require*, and asserted it. Mean and bracket are two draws from the same noisy
distribution, and on a runner whose intervals **jitter across 90 ms they can
contradict each other**: a 91.6 ms mean came with a 100.0 ms bracket, a 91.9 ms mean
with an 83.4 ms one. No assertion built on the mean can survive that — the
observation alone can.

**The redesign: three pure functions, one total map.** The question "could the arc
have been presented at all?" is decidable **only after the recording**, from that
recording's own stamps, so `helpers/frame-model.ts` now derives it post hoc:

- **`arcWindow(frames, triggerT, 90)`** — `startAt = Tₙ` (the stamp
  `scene.time.now` held during the keydown), `endAt = Tₙ + 90` **exclusive**
  (`BoardView.update` clears at `>=`), `inside` = the recorded stamps strictly
  inside, `frameInWindow = inside.length > 0`. `null` when the trigger could not be
  bracketed — "not measured" is never "no frame inside", and the walk refuses to
  classify without the bracket. (QA-005f: the trigger is now the *recorded*
  `triggerIndex`, so the signature reads `arcWindow(frames, triggerIndex, 90)` —
  see §1.7.)
- **`arcImplication(window, beatObserved)`** — four exhaustive classes.
- **`arcHandling(implication)`** — three handlings. This is the **single** place the
  mapping lives; no arm branches on anything else.

| a frame fell strictly inside `(startAt, startAt + 90)`? | beat observed (`onset !== null`)? | implication | handling | consequence |
|---|---|---|---|---|
| yes | yes | `beat-required-observed` | `assert-shape` | the full pixel claim: bounded, centred in the player's cell, settles, ≤ 220 ms + frame quantisation |
| yes | **no** | `beat-required-absent` | **`fail-loudly`** | a presented step ran `paintActor` with `deny` set, so the beat was owed: a **real failure**, named, with the stamps attached — never a silent `Received: null` |
| no | no | `limit-justified-absent` | `resolve-limit` | the named `RESOLVE-LIMIT` (annotation + JSON attachment + greppable log) plus every deterministic claim the refusal still owes |
| no | yes | `beat-observed-beyond-window` | `assert-shape` | a beat the bracket arithmetic does **not** attribute to the arc, but which is still an observed transient of the player's own cell — it owes exactly the same shape clauses |

The equivalence behind the first column (`frameInWindow ⟺ gap < arc`) is not a
heuristic: the interval is exact for the gap it is handed, and
`tests/unit/frame-model.test.ts` proves it by sweeping a synthetic grid. The
recorder's own `onset` is used here as **one bit only** (a beat or not) — its
absolute value lives on the recorder's clock and is deliberately not mixed into the
bracket arithmetic, which is measured on the probe's.

**What the prediction kept — and where it is exact.** P1b (`P1_STRETCH_MS = 140`)
still **requires** `onset === null`, and the natural arm may not borrow it:
`installFrameStretcher` burns a fixed budget **once per frame**, so *every* interval
on that fabric is longer than the arc. There the prediction is a property of the
construction, not of one noisy measurement — which is precisely why QA-005e removes
it from the natural arm and keeps it here. The pin now also *measures* its own
fabrication on the recording's stamps and prints the census
(`frameInWindow === false` asserted, `0/95 recorded intervals shorter than 90 ms`)
instead of trusting the stretcher.

**The coupling audit — every consumer of the verdict.** A grep for
`arcVerdict` / `unresolvable-at-grid` across `tests/**` returns exactly four sites:
`frame-model.ts` (the definition), `frame-model.test.ts` (its unit cases),
`transient.spec.ts` P1b (fabrication arbiter — legitimate, see above) and the
natural arm (the defect, removed). `mobile.mobile.spec.ts`'s `expectSwipeDelivered`
makes a *runner-dependent* claim of a different kind — `span × grid ≤ swipeMaxMs` —
but its `span` is deterministic **by construction** since the R-T4 fix (start/move/
end issued in one tick ⇒ `span = 0` at any grid) and is *asserted* on the recording
along with the delivery order and coordinates. It is a measurement, not a
pre-judgement, and was left untouched.

**The 60 Hz teeth are preserved by construction, not by negotiation.** On a local
grid the window always holds frames — measured `stampsInsideWindow = 5` on **15/15**
runs at `gapMs 16.6–16.7` — so an absent beat there lands in `beat-required-absent`
and **fails loudly**. The redesign does not make a fast machine more forgiving; it
makes the *slow* machine's legal outcome depend on its own stamps instead of on a
mean that the next draw can contradict.

**The unit proof (`tests/unit/frame-model.test.ts`, 27 cases — +17 here).** Five new
describes drive the model on synthetic grids:

- **the two cloud draws of `38784574025`** are reproduced as unit *inputs* with
  their own numbers — attempt 1 (`grid 91.6`, `gap 100.0`, beat observed) →
  `beat-observed-beyond-window` → `assert-shape`, retry #1 (`grid 91.9`,
  `gap 83.4`, `onset null`) → `beat-required-absent` → `fail-loudly` — and a third
  case asserts the thing that matters: the two draws differ by **under a
  millisecond** of mean grid while the old arbiter **flipped** and the two
  implications differ;
- **jitter tables (i)–(iv)** — a ≥ 90 ms *mean* with one 45 ms interval bundling the
  trigger ⇒ the beat is **required** (absent ⇒ `fail-loudly`); a ≥ 90 ms mean whose
  every stamp is outside the window ⇒ absent is **justified**; a 60 Hz grid ⇒ absent
  is a **real failure** (the local teeth); a 60 Hz grid with one stalled interval at
  the trigger ⇒ absent is justified **post hoc** (the same oscillation in the other
  direction, hidden by the mean); the coarse fabric ⇒ the prediction is exact at
  every trigger position;
- **the window itself** — the trigger frame is excluded, a stamp at exactly
  `startAt + 90` paints nothing, an unbracketed trigger is `null`, and
  `frameInWindow ⟺ gap < arc` holds at every gap of a sweep;
- **the four-class table** — every (frame in window × beat) pair maps to exactly one
  handling, and the handling never changes when only the *mean grid* changes;
- **the census** — every interval is binned, `intervalsBelow` counts the ones shorter
  than the arc, and both degrade cleanly on an empty recording.

The P1b budget (`P1_STRETCH_MS = 140`) is pinned by name in the same file, so the
e2e pin and the table cannot drift apart.

**Provenance (Orchestrator salvage-port):** the sections from this header through
the `Reconciled with...` paragraph are the verbatim README content of commit
`88b37ba` - QA-005e's detached follow-on run, which committed them to branch
`agent/qa/qa-005e-p1-oscillation` AFTER the mechanical closeout (`9eaf7fb`) had
already been pushed as PR #2's head. The branch prune at the QA-005f merge
orphaned `88b37ba`; this office ported its README diff byte-for-byte
(`git show 88b37ba -- tests/e2e/README.md | patch -p1`, zero edits) because it
carries the strongest local battery of the round (x2 CONSECUTIVE shipped-config
greens with five foreign playwrights live, only `--output` isolated) and the
two-factor reconciliation of the ENOENT class. Its `(S7 census)` pointer refers
to the Orchestrator full-round census at the foot of this section. Protocol
lesson (recorded in project-status item 73): confirm detached census loops are
DEAD before pruning a worktree/branch.

**Evidence (QA-005e; full batteries against a QA-owned vite on `:5217`).**

| check | result |
|---|---|
| `tsc --noEmit` | 0 errors |
| `vitest run` | **30 files · 570 passed · 3 skipped (573)** — +17 unit cases over QA-005d's 553, the implication table and the two cloud observations |
| `npm run build` | ✓ built (chunk-size warning only) |
| `npx playwright test --list` | **88 tests in 8 files** — the e2e inventory is unchanged (this ticket adds unit cases only) |
| targeted `transient.spec.ts` | **7 passed**, zero retries; natural arm `implication=beat-required-observed handling=assert-shape … bracketingGapMs=16.7 stampsInsideWindow=5`; P1b `implication=limit-justified-absent handling=resolve-limit … gapMs=150.0 stampsInsideWindow=0` |
| `transient.spec.ts --repeat-each=15 --retries=0` | **105 passed (7.0 m), zero retries** — census: natural `beat-required-observed → assert-shape` **15/15** (`gridMs 16.8–17.1`, `gapMs 16.6–16.7`, `stampsInsideWindow=5`, `onset` 38.4–122.6 ms); fabricated `limit-justified-absent → resolve-limit` **15/15** (`gapMs 149.9–166.7`, `stampsInsideWindow=0`, histogram `0-30:0 30-60:0 60-90:0 90-120:0 120-180:92 180-300:3 300-inf:0`) |
| `npx playwright test --retries=0` | **88 passed · 0 failed, zero retries, × 2 consecutive** (`03:31:18 → 03:40:19`, one process, `--output` isolated — see below) |

**Local-evidence hygiene: why those two runs used `--output`, and what was not
changed.** The same command *without* an isolated output dir produced, in the same
90-minute window, two runs of 85/3 and two aborts of 12/76 — and **not one of those
reds was an assertion**. They were two distinct infrastructure events, both
diagnosed from the log rather than papered over:

- `net::ERR_CONNECTION_REFUSED at http://localhost:5217` with the server's log
  ending cleanly at its ready banner: the QA-owned long-lived vite process was
  killed externally (twice) between and during runs. Fixed by letting Playwright
  own the server (`PS_E2E_PORT=5217`, no `PS_E2E_BASE_URL`), so its lifetime is the
  run's.
- `browserContext.close: ENOENT … test-results/.playwright-artifacts-0/traces/…`:
  a **second process ran this suite concurrently in this same worktree** (observed
  directly in `ps`: another `npx playwright test --retries=0` with this worktree as
  its cwd), and a Playwright run deletes its `outputDir` at start — so it removed
  the artifact directory out from under the test that happened to be closing its
  context at that instant. One mechanism, cross-validated: the duplicate instance's
  own logs showed the **identical** signature (3 failed, 6 `ENOENT`s, same
  `.playwright-artifacts-0/traces/…` path) in two of its runs, and its other run was
  88/0. It hit `controls.spec.ts` and `refusal.spec.ts` — files this ticket never
  touched — so it is not attributable to QA-005e, and no test's own assertions were
  involved.

The decisive experiment was the fixing run: the two consecutive greens above were
executed **while five foreign playwright processes were live**, with only
`--output=/tmp/qa005e-out-{A,B}` changed. Same tree, same machine, same contention
— green ×2. That isolates the cause to the shared artifact directory and falsifies
the alternative (a defect in the change).

**Reconciled with the Orchestrator's `--trace=off` control (§7 census).** That
control removes the *victim* files and is green; this one removes the *shared
directory* and is green with the traces still on. The two agree rather than
compete: the class needs **both** a foreign process operating on the same
`outputDir` **and** live trace staging inside `.playwright-artifacts-N`, and
removing either factor makes it disappear. Neither factor is a property of this
ticket — which is also why **`playwright.config.ts` was deliberately left
untouched**: editing it after these batteries would invalidate the bytes that were
verified, and `--output` is a per-invocation isolation the config does not need to
know about. A permanent guard (an env-overridable `outputDir`, or simply lanes not
sharing a worktree) is recorded as a follow-up for the Orchestrator, since the root
cause is *coordination*, not configuration.

**What a red now says.** Both non-shape handlings print a greppable line and attach
JSON before asserting: `[QA-005e] RESOLVE-LIMIT transient.spec.ts P1 arm=… — no
presented frame can fall inside the §6.5 deny window (…, …) ms … [justified|predicted]`
plus a `justification:` line carrying the window's stamps, the bracketing gap, the
`shortIntervals/intervalCount` census and the full histogram; and
`[QA-005e] BEAT-REQUIRED-ABSENT …` with `qa005e-p1-beat-required-absent.json`.
Attachments were renamed `qa005d-*` → `qa005e-*`; the annotation types are
`RESOLVE-LIMIT` and `BEAT-REQUIRED-ABSENT`.

**Known risk, stated not hidden.** A cloud draw that produces `gap < 90 ms` **and**
`onset === null` now fails **by design** (`beat-required-absent`) — that is the
ruling, and it is the honest reading of the physics. Conversely, attempt 1's beat
(`gap 100.0 ms`, `onset 643.4`) is **not** attributable to the arc through the
bracket arithmetic; under this design it classifies as
`beat-observed-beyond-window` and is held to the shape clauses — the arc claim is
*withheld* there rather than faked. Retries stay at 1 in CI and no case was skipped
to obtain any of these numbers.

**Deferred, recorded rather than smuggled in (OPEN_QUESTION).** The
`beat-required-absent` branch names the contradiction but cannot yet say *where* the
beat was lost. A would-be tightening exists, and it is cheap: `createKeyActionHandler`
(`src/game/input/key-handler.ts`) calls `event.preventDefault()` for every **mapped**
key as its first act, while Phaser's own `KeyboardManager` only does so for keys in
its `captures` list and `src/**` never calls `addKey`/`addCapture`. So a
`defaultPrevented` read deferred to a microtask after dispatch would be `true`
**iff the game's own rule consumed that keydown** — a delivery-to-rule proof the
`beat-required-absent` diagnosis currently lacks. It is not applied here: changing
`helpers/probe.ts` mid-battery would invalidate the repeat-15 evidence above, and the
honest place for it is its own ticket with its own run.

**Known gap (recorded, not papered over).** Of the four implication classes, three
are pinned on a running browser: `beat-required-observed` by the local natural arm
(15/15), `limit-justified-absent` by P1b on the fabricated fabric (15/15) and by the
natural arm on any runner whose stamps put no frame inside the window, and
`beat-required-absent` by construction on any 60 Hz machine the moment a beat fails
to appear. The fourth, `beat-observed-beyond-window`, needs a runner whose *jitter*
produced a beat the bracket arithmetic does not attribute to the arc — attempt 1 of
`38784574025` is the only one ever recorded — so it has **no e2e pin**: it is
unit-proved, and its e2e handling is the same `assert-shape` function the natural arm
already calls on every observed beat. Fabricating it would mean injecting a spurious
ROI change, i.e. weakening the channel that this suite exists to keep honest.

**CI status: PENDING-CI.** These are local numbers on this machine's grid. The
claim this ticket makes about the *cloud* — that the natural arm can no longer fail
in both directions on one commit — is settled only by the post-merge run; the
Orchestrator owns the push, the PR and that verdict. Nothing here is asserted about
a run that has not happened.

---

### 1.7 QA-005f — the trigger step is an execution fact, not a stamp comparison

**The failure (cloud, PR #2 — tip `9eaf7fb`).** The P1 *natural* arm went red on
**both** attempts with `BEAT-REQUIRED-ABSENT`, i.e. with §1.6's "known risk"
materialised: the arm concluded a presented step had painted the arc while the
recorder saw no beat at all.

| attempt | recorder `gridMs` | value-bracket window | stamps inside | `onset` | interval histogram |
|---|---|---|---|---|---|
| 1 | 85.4 | (4767.7, 4857.7) | 1 | `null` | `0-30:11 30-60:0 60-90:74 90-120:6 120-180:2 180-300:1` |
| 2 | 85.1 | (4927.8, 5017.8) | 1 | `null` | `0-30:15 30-60:0 60-90:72 90-120:9 120-180:1 180-300:2` |

A by-design red is a legitimate outcome of a correct design, so the next question
was **"is the game wrong, or is the measurement?"** It was the measurement — named,
reproduced and measured locally, not excused.

**Reproduce (local, deterministic).** A fabricated grid that *straddles* 90 ms
(stretcher 74 ms → 69–70 intervals in the 60–90 band and 30–31 in 90–120, the cloud's
own shape) reproduces the red on this laptop. Printing the same recording both ways
— the model's answer and the stamp arithmetic's — is the whole defect on one line:

```
[QA-005f CENSUS] stretch=74 gridMs=90.2 trueGapMs=100.0 stampsInsideWindow=0 onset=null
                 implication=limit-justified-absent handling=resolve-limit
                 valueBracketGapMs=83.3 valueWouldDemandBeat=true
[QA-005f CENSUS] stretch=74 gridMs=90.2 trueGapMs=83.4  stampsInsideWindow=1 onset=631.4
                 implication=beat-required-observed handling=assert-shape
                 valueBracketGapMs=83.3 valueWouldDemandBeat=true
[QA-005f CENSUS] stretch=86 gridMs=102.2 trueGapMs=100.0 valueBracketGapMs=116.6 valueWouldDemandBeat=false
```

Same grid, same machine, both branches: the recorder's beat is present exactly when
the trigger's **own** interval is short (83.4 ms), and absent when it is 100.0 ms —
while the stamp arithmetic read *83.3 ms* for a recording whose bracketing interval
was 100.0. Over the census the invariant *a step inside the log's window ⟺ the game
painted* held **8/8**; the old attribution would have demanded a beat on the
`onset null` draws. That is the cloud red, reproduced from the same numbers.

**Root cause (measurement; chain read from Phaser 3.90 and then measured).**

1. `TimeStep.step(time)` hands the raw `requestAnimationFrame` **timestamp** to the
   scene callback and `Clock.update` sets `now = time`. So `scene.time.now` is the
   stamp of the **last frame whose callbacks have already run**.
2. An `requestAnimationFrame` stamp is the frame's **scheduled** time (its vsync
   instant), not the wall time its callbacks run at. On a loaded runner — and by a
   few ms even on a 60 Hz laptop — the callback batch is late: Chromium dispatches
   pending input before the frame's callbacks, so a keydown can be handled *after* a
   frame's stamp while that frame's step has not run yet.
3. The observer's log captures this exactly: `frames.length - 1` at the event **is**
   that last-run frame. Proven on the game instance itself in the temporary forensic
   harness (`window.Phaser` interception plus a wrapper on the scene's `view.update`),
   across grids 74/82/86: `scene.time.now` equalled the probe's last pushed stamp
   every time (5/5, e.g. `scene.time.now = 6486.7` = last pushed `6486.7` while the
   keydown's wall clock was 6585.3, and that recording's next nominal stamp 6570.1
   only ran its callbacks at wall 6660.4 — 75 ms **after** the keydown).
4. `bracketFrames` compared the event's wall `performance.now()` against those
   *nominal* stamps, so it picked the not-yet-run frame and measured the **following**
   interval: 83.3 ms where the truth was 100.0 ms. On a grid whose intervals straddle
   the arc's own 90 ms length that flips the verdict — and a correctly-behaving game
   was failed, twice, on the same commit that passed a sibling run.

This is **not** a cloud-only artefact: the lag is measurable at 60 Hz locally
(`keydownWallMs=1339.8` against `startAt=1319.9`, `nextFrameAt=1336.6`). It only
*changes* a verdict when the grid straddles the transient's length, which is why
seven prior local batteries (and the first cloud round) never saw it.

**The fix (tests-side only; no `src/**` byte changed).**

- **`helpers/probe.ts`** records, per frame, the wall time its callbacks actually ran
  (`ranAt`, parallel to `frames`) and, per event, `frameIndex` — the last frame that
  had run, `__psProbe.frames.length - 1`. Both are observations; nothing is inferred.
- **`helpers/frame-model.ts`** states the model in **indices**: `arcWindow(frames,
  triggerIndex, 90)` → `startAt = frames[k]`, `nextAt = frames[k+1]`, window
  `(startAt, startAt + 90)` exclusive, `inside` = the stamps after `k` inside it;
  `framesSpanned(startIndex, endIndex)` and `gestureGameMs(startIndex, endIndex, grid)`
  are index differences. `null` still means *not measured* (no frame had run, or the
  log ends at the trigger).
- **`attributionHolds(ranAt, t, k)`** ⟺ `ranAt[k] <= t < ranAt[k+1]` — the self-check
  that the index really is the step the handler saw. The P1 walk asserts it for the
  keydown, `gestureEvidence` for both ends of every gesture (`attribution=ok` in the
  log), so a runner where the channel does not hold produces a named attribution
  failure instead of a quietly mis-read window.
- **Unchanged on purpose:** `arcVerdict`, `arcImplication`, `arcHandling` and the whole
  §1.6 table; P1b's exact `onset === null` prediction; the observed-beat shape
  clauses; the 60 Hz teeth (a fine grid still puts steps inside the window, so an
  absent beat there still fails loudly). `bracketFrames` is kept — and pinned as the
  **wrong** answer — so the defect has a regression case rather than a memory.

**What was deliberately not done.** No assertion was weakened: the natural arm still
fails loudly on `beat-required-absent`, no tolerance, retry or skip was added, and
the `RESOLVE-LIMIT` branch still carries every deterministic claim the refusal owes.

**The regression pins (unit).** `tests/unit/frame-model.test.ts` 27 → **31** cases:
the defect in **both directions** (nominal 83.3 → a false "required" where the truth
is 100.0, and nominal "limit" where the truth is 83.3 → required); the **measured
sharp trace** as a named legal input (keydown 6585.3, clock 6486.7, next stamp
6570.1 running at 6660.4 → `beat-required-observed`); `attributionHolds`
holds/fails-closed (integer, range, boundary, empty log); and the swipe arithmetic
carried on indices.

**Evidence (local, this worktree, against a QA-owned vite on `:5218`).**

| check | result |
|---|---|
| `tsc --noEmit` | 0 errors |
| `vitest run` | **30 files · 574 passed · 3 skipped** — +4 over QA-005e's 570 |
| `npx playwright test --list` | **88 tests in 8 files** — inventory unchanged |
| targeted `transient.spec.ts` | **7 passed**; natural `triggerFrameIndex=67 keydownWallMs=1339.8 startAt=1319.9 nextFrameAt=1336.6 gap=16.7 stampsInsideWindow=5 → beat-required-observed/assert-shape`; P1b `gap=150.0 stampsInsideWindow=0 → limit-justified-absent/resolve-limit` |
| targeted `mobile.mobile.spec.ts` | **12 passed**; every gesture `attribution=ok`, `span=0`, `gridMs` 16.7 / 50.0 / 150.0 |
| `transient.spec.ts --repeat-each=15 --retries=0` | **105 passed (7.0 m), zero retries** — natural **15/15** `beat-required-observed → assert-shape` (`gridMs 16.8–17.1`, `gap 16.6–16.7`, `stampsInsideWindow` 4–5, `onset` 38.1–126.4, `peakPrevChanged` 1711–2223); fabricated **15/15** `limit-justified-absent → resolve-limit` (`gap 149.9–166.7`, `stampsInsideWindow=0`, `0/95` intervals below 90 ms) |
| straddling-grid census (temporary harness, deleted before commit) | **8/8** on the invariant *step inside the window ⟺ beat painted*; both branches reached at stretch 74; the sibling `valueWouldDemandBeat=true` line reproduced |
| full suite | **88 passed, zero retries (3.7 m)** |
| `npm run levels` / `npm run build` | `RESULT: PASS` 11/11 · build ✓ |

**What the next cloud round must show (the discriminating lines).** The natural
arm's line now prints the attribution and the window's actual stamps:

```
[QA-005e] transient.spec.ts P1 arm=natural-grid triggerFrameIndex=… keydownWallMs=… startAt=…
          nextFrameAt=… window=(…,…) bracketingGapMs=… stampsInsideWindow=…
          implication=… handling=… shortIntervals=…/… histogram=…
```

- a **limit** draw (the cloud's likely case, the histogram bands being what they are)
  must now print `stampsInsideWindow=0` with `bracketingGapMs >= 90` →
  `limit-justified-absent` → `resolve-limit`, i.e. **green with the same histogram**
  that made the two red rounds red;
- a **fast** draw must print `stampsInsideWindow>=1` **and** a real onset →
  `beat-required-observed` → `assert-shape`;
- `handling=fail-loudly` on the cloud would be a **genuine game finding** — the
  attribution assertion (`ranAt[k] <= t < ranAt[k+1]`, with both numbers in its
  message) is what makes that reading trustworthy rather than another artefact.

**CI status: PENDING-CI.** These are local numbers on this machine. The claim about
the *cloud* — that the natural arm can no longer be failed by the mis-attribution —
is settled only by the post-merge round; the Orchestrator owns the push, the PR and
that verdict. No run that has not happened is asserted here.

### 1.8 QA-007a — the L15 latch-row red: the *selection* branch is closed, not merely unobserved

Run **38845237536** (push `bed2cb9`, e2e job 116794357318) went **106 passed / 1 failed
(21.6 m)** with `latch-door.spec.ts:134:5` →
`L15 — the UI blocks the closed door and strands the player on a closed one`, verbatim:

```
Test timeout of 30000ms exceeded.
```

That is a **fifth class**, distinct from QA-005f's four shapes (attribution /
`BEAT-REQUIRED-ABSENT` / recorder / `resolve-limit`): a **wall-clock budget
exhaustion** whose message carries **no assertion body at all**. The same code row was
green in ~8 prior full rounds (QA-006 local 107/0 6.8 m; merge-tip local 107/0 5.7 m;
cloud `ff0a8f8` 107/0 16.0 m; cloud main `5b058ff` 107/0 12.9 m), and the red commit
`bed2cb9` was **docs-only** ahead of `ff0a8f8`.

**The red is not a fixture/selection defect** — the branch QA-005g's measurement left
implicit. QA-007a interrogated `cheapestDoorFixtures()` browser-free (`tsx` over
`tests/e2e/helpers/levels.ts`; the throwaway scan was deleted before commit; the
standing audit is `scripts/latch-pair-audit.ts`):

| level | occupancy route | refusal route | distinct welded occupancies at min depth |
|---|---:|---:|---:|
| L6 | 3 | 4 | 1 (unique) |
| L7 | 3 | 0 | 1 (unique) |
| L8 | 5 | 2 | 1 (unique) |
| L9 | 4 | 1 | 1 (unique) |
| L10 | 8 | 3 | 1 (unique) |
| L11 | 3 | 4 | 1 (unique) |
| L12 | 3 | 4 | 1 (unique) |
| L13 | 5 | 6 | 1 (unique) |
| L14 | 7 | 8 | 1 (unique) |
| L15 | **9** | **10** | 1 (unique) |

Every door level's weld pins **exactly one** occupancy at the minimal depth (L9/L11/L12
carry several welded *pairs*, but a single welded *occupancy*), `explore()`'s node order
is identical across repeated calls, and `cheapestDoorFixtures(ref)` is a **pure function
of one level ref** — permuting the dataset array reproduces every signature
byte-for-byte, so dataset load order cannot enter the choice. L15's row therefore drives
the one world the scan names (refusal 10 + occupancy 9 = **19 trusted presses**, two
level opens) — the same work size QA-005g measured from the cloud.

**Why it crossed the line.** The row's cost is frame-quantised (`pressDirection` = 2
rendered frames each, `helpers/game.ts`) while the per-test budget is a fixed 30 s
(`playwright.config.ts`). Local rounds on QA-007a's own vite (`PS_E2E_PORT=5236`, base
`0f08c95`):

| local round | census | L15 row |
|---|---|---|
| recon, `latch-door.spec.ts` alone | 22 passed (1.5 m) | 7.1 s |
| full suite round 1 | **107 passed (6.6 m)** | 8.2 s |
| full suite round 2 | **107 passed (10.0 m)** | **17.9 s** |
| full suite round 3 | **107 passed (5.4 m)** | 7.4 s |

Three clean full rounds, `latch-door.spec.ts:134` never the failing row: the row swung
8.2 → 17.9 → 7.4 s on *identical code* while every assertion stayed green — the machine,
not the board, moved it. At the cloud's red round it reached 30.9 s and crossed the
fixed budget.

**Disposition — named transient, remediated by QA-005g.** QA-005g (`cd3af77`, merged
`091c483`) diagnosed the same run and gave the walk `test.setTimeout(90_000)` inside the
derived `DOOR_LEVELS` loop (the `refusal.spec.ts:56` precedent), with no assertion change
and no retry. QA-007a lands **no spec change**: duplicating the budget would be a second
writer on the same range. Its contribution is the independent proof above — the failure
cannot be a selection or game defect, only a wall clock — so the merged 90 s budget is
the right class of remedy.

**CI status: CLOSED — remedy landed, three consecutive green cloud rounds measured under
zero retries (2026-10-16, QA-005h).** The remedy is QA-005g (`cd3af77` — the derived
`DOOR_LEVELS` walk carries `test.setTimeout(90_000)`; merged `091c483`), with no assertion
change and no retry. Since then the tip has run **three consecutive green cloud rounds
under zero retries**, all pushes to `develop`, each verified against its own log
(`gh run view <id> --log`):

| run | tip | runner's test line | e2e job wall clock | L15 row (`latch-door.spec.ts:134:5`) |
|---|---|---|---|---|
| `38849186852` | `091c483` | `107 passed (21.3m)` | 22m2s | 29.4 s |
| `38851254805` | `3592134` | `107 passed (21.0m)` | 21m32s | 29.6 s |
| `38853247944` | `4d4e61d` | `107 passed (21.2m)` | 21m47s | 29.7 s |

The row that crossed the fixed 30 s budget at 30.9 s in `38845237536` now lands
29.4–29.7 s in all three rounds: still the suite's heaviest row, now ~3× inside the
merged 90 s budget — headroom on a wall clock, not a hidden retry (the job runs bare
`npx playwright test`, `retries: 0`). **Written as measured, not as dispatched:** the
dispatch quoted the first round as `21m3m`; the runner's own line is `107 passed (21.3m)`
and that job's wall clock was 22m2s. The other two figures (21m32s / 21m47s) are job wall
clocks and match. Nothing about the verdict depends on which clock is quoted.

### 1.9 QA-010 — the readiness gate was a frame count: silent first-input loss, and the loader arm

**The red.** Two cloud rounds on `develop` failed with a signature this suite had never
produced, while two others passed on byte-identical specs:

| run | tip | runner's line | what failed |
|---|---|---|---|
| `38861480689` | `e469e72` | `107 passed (20.3m)` | — |
| `38863193343` | `411bd12` | `4 failed / 103 passed (14.1m)` | latch L12/L8, playthrough L4, the L1→L15 unlock chain (10.1 s — a *move count*, not a timeout) |
| `38863790675` | `ebc8790` | `10 failed / 97 passed (15.0m)` | controls `:121`, latch L6/L10, playthrough L5, portal L11 ×2, transient P2, mobile ×3 |
| `38862977845` | `9d4c212` | `107 passed (31.8m)` | — |

Every failure was **the same claim**: a press the page received that produced **no move** —
`Expected: 1, Received: 0` on the first press of a route, a solver route of depth 4 counted
as **3**, a swipe whose *delivery was asserted by the probe* yet never counted, `.ps-overlay`
never appearing. All four `input-replay.spec.ts` rows passed, including "one press/release
cycle inside one frame window is exactly one move" — so the game was not dropping presses it
received. `src/**` and `playwright.config.ts` were **identical** across the red and green
rounds below (`git diff` empty); the only test-side delta was two `test.setTimeout` budgets,
which cannot drop input. The failing rounds were the **fast** ones.

**Root cause (measured, not inferred).** `LevelScene` is `preload() → loader → create()`, and
`create()` is where `attachInput` runs (`src/game/scenes/level-scene.ts:137`). `preload()`
queues the five delivered-art textures as **real image fetches** (`theme/art.ts`
`queueDeliveredArt`), so the board does not listen until an **I/O** condition is met —
while `openLevel` stopped at `.ps-shell` + `<canvas>` + **3 animation frames**, on the stated
premise that `create()` "runs on the first game step after the canvas exists". On a fast
runner 3 frames are ~25–50 ms of wall clock; on a slow one they are ~100–300 ms. The gap is
silent: no console error, no feedback, and the HUD already looks alive.

| arm (`?level=1`, `ArrowRight` immediately after the frame gate) | first press lands | after a second press |
|---|---|---|
| no delay (art fast) | **10/10** | 10/10 = 2 moves |
| art delayed 1200 ms | **0/10** | 0/10 = still 0 moves |
| art delayed 1200 ms, then wait 1500 ms | 6/6 | 6/6 = 2 moves |

**Through the real rows** (an external proxy adding 1200 ms to every `*.png`, suite pointed
at it with `PS_E2E_BASE_URL`, so the helper under test is the only variable):

| helper | rows: controls `:111`, playthrough L5/L11, portal L11 ×3 | verdict |
|---|---|---|
| before (frame gate only) | `waiting for locator('.ps-overlay')` → hidden; move counts 1 short | **6 failed / 2 passed** — the CI signature verbatim |
| after (loader gate) | — | **8 passed** |

**The fix.** `openLevel` now waits for the loader itself: request listeners attached **before
`goto`** (a watch installed after it can miss its own condition), then
`seen > 0 && inFlight.size === 0` where a delivered-art image is `\.png$`. It is not a sleep —
the poll returns on the loader's own completion event — and a hung loader now fails **at that
wait** ("the delivered-art loader never settled") instead of silently two assertions later.

Two honest notes on the first cut. **(1) `\.png$`, not `\.png\?`:** the app's module graph
also fetches each sprite as a `?url` module (`…/echo_spirit_a.png?import&url`) during `goto`,
and counting that as delivered art let the poll return *before* `preload` even queued the
images — the same early-return race this gate exists to remove. It surfaced under the proxy as
an intermittent **blank-board** probe failure (`actor tile … found [] after 2014 ms; body
anchors: vector body #F6DE9E` — no sprite entry yet, so the vector anchor was the only one, on
a board that then drew the sprite), 2/4 on `portal.spec.ts:199`. With `\.png$`: that row
**8/8** under the same proxy, and a diagnostic that prints `actorBodyAnchors` carries the
delivered-spirit anchor (`rgb(244,202,108)`) in **8/8** trials. **(2)** The instrument is an
opt-in switch, in the same spirit as the QA-007 degrade route:

```bash
PS_E2E_ART_DELAY_MS=1200 npx playwright test        # same art, served late — the window, on demand
```

**Cost, and what stays untouched.** The wait adds the loader's own time to each row's critical
path (it was previously overlapped: the row raced ahead of it). Locally that is tens of ms per
open; no budget moved, and the QA-005g envelopes (`90 s` / `360 s`) keep ≥ 30 % headroom on the
worst runner observed (§1.3), so the only-up law is not engaged.

**Recorded, not fixed here — a player-facing question.** The HUD and frame look alive *before*
the board exists, and input in that window is silently ignored. The harness now waits; the
product's behaviour is unchanged, and on a slow connection that window is real (the same
1200 ms that reproduced this). Whether the game should show a loading affordance or queue the
input belongs to the Game Designer / UI-Art lanes — it is logged as an open question in
`docs/project-status.md`, item 86.

**Independent verification of the class claim (QA-010-midwalk-race dispatch, 2026-10-16).**
A second dispatch filed QA-010 with a rival class — "the harness samples the HUD between the
press and the arrival beat and reads a stale or doubled value", remedy "route the racing reads
through a beat-aware/auto-retrying path". Its premise is true and its conclusion does not
follow, and that gap is now measured rather than argued.

*Classification (read-only).* All five cloud row-families read the HUD through the **same
single-`page.evaluate` snapshot** (`hud()`, `helpers/game.ts:307`) — so the dispatch's premise
holds as stated:

| cloud row (test id) | failing assertion | read | file:line |
|---|---|---|---|
| `latch-door.spec.ts:134:5` L6/L10 | `"the searched route is a legal route of exactly that depth"` | one snapshot | `latch-door.spec.ts:170` → `:171` |
| `latch-door.spec.ts:217:3` L8 | `"latched: the same direction now lands"` | one snapshot | `latch-door.spec.ts:249` → `:250` |
| `playthrough.spec.ts:79:5` L5/L1 | `` `moves after ${leg.key} (move ${leg.moveCount})` `` | one snapshot | `playthrough.spec.ts:97` → `:98` |
| `portal.spec.ts:199:3` L11 | `` `moves after ${leg.key} (teleport leg)` `` | one snapshot | `portal.spec.ts:224` → `:229` |
| `controls.spec.ts:111:3` | `(await hud(page)).moves` | one snapshot | `controls.spec.ts:120` → `:121` |

*Why the premise does not imply the class.* The HUD write is **synchronous with the input**:
`host.move` → `scene.tryMove` (`level-scene.ts:197`) → `session.move`, the core reducer
(`session.ts:135`) → `events.emit("move")` (`session.ts:158`) → the HUD's own subscription
`renderCounters` (`hud.ts:333`), which writes `movesLabel.textContent` (`hud.ts:320`) — all in
the call stack of the DOM `keydown` that Phaser re-emits synchronously (`input-map.ts:129`; the
queue re-walk is documented in `key-handler.ts`). A snapshot therefore cannot read a value
"short by one" on a listening board; only a retrying read of an *in-flight* write could — and
`pressDirection` already waits two rendered frames after the press resolves.

*The probe that separates loss from staleness.* Three reads per trial, 8 trials per arm, same
bytes, `?level=5`, one `ArrowDown` straight after `openLevel`: (i) the suite's own snapshot read;
(ii) a `keydown` listener registered **after boot** (so it runs after Phaser's), reading
`.ps-moves` synchronously **inside the DOM event's task**; (iii) the same snapshot **3 s later**.

| arm (identical `src/**`; only art delivery differs) | (i) after press | (ii) in-event, same task | (iii) after 3 s |
|---|---|---|---|
| pre-fix base `db49823`, fast art | `moves=1 phase=B` (8/8) | **`moves 1`** (8/8) | `1 / B` |
| pre-fix base `db49823`, art `+1200 ms` | `moves=0 phase=A` (8/8) | **`moves 0`** (8/8) | **`0 / A` — still lost** |
| post-fix (`768e93e`), art `+1200 ms` | `moves=1 phase=B` (8/8) | `moves 1` (8/8) | `1 / B` |

Read (ii) closes the staleness hypothesis for good: on a listening board the counter is already
`1` **before the keydown task ends**, so no later read — snapshot or poll — can lag it. Read
(iii) shows the failed press never commits, in a slow-loader window of over three seconds. The
reds are a **loss function of the input-attach window**, not a **read function of scheduling**;
"(ii)=1 must hold or the press was lost" is the invariant the class needs and does not have.

*The real rows, A/B, same instrument (`--workers=2`, zero retries).* The five families under
`+1200 ms`/png through an external proxy on the pre-fix base: **5 failed** (the CI signature
verbatim). Post-fix with the in-tree `PS_E2E_ART_DELAY_MS=1200`: **5 passed**.

*The forcing condition, honestly.* One dev server (`:5233`), `--workers=6`, zero retries:
pre-fix round 1 **55 passed / 0 failed (3.5 m)**; post-fix rounds 1–3 **55 / 0** (3.2 m / 3.5 m /
3.5 m). **Contention alone does not reproduce this class locally** — consistent with §1.9's
cloud observation that the *fast* rounds were the red ones: the window needs the loader slow,
not the CPU busy. No fabricated repro is claimed: the reproduction is the delayed-art arm, and
it is a positive control (it fails before the gate and passes after it, on the same rows).

**The full census round at that same forcing condition — and the one red it produced, classified
apart.** `npx playwright test --workers=6` (both projects, zero retries, one `:5233` server):
**106 passed / 1 failed (6.3 m)**. The red is `portal.spec.ts:199` — one of the five families
above — and its error is **`Test timeout of 30000ms exceeded`**, stack
`waitForFrames (helpers/game.ts:49) ← pressDirection (game.ts:423) ← portal.spec.ts:223`: the
row ran **31.7 s** against the global 30 s default, i.e. it *timed out mid-walk*; **no assertion
flipped** (`Expected 1 / Received 0` does not appear, and every one of the five rows was green
in the three targeted `--workers=6` rounds). This is the **wall-clock class** of §1.3, not a
residual instance of the read class: the 6-worker protocol made the machine's own frame grid
**244.4 ms** (≈4× off 60 Hz; recorded `gridMs` values 83.3 / 116.7 / 139.0 / 199.9 / 244.4).
**Not budgeted here, deliberately** — the shipped CI configuration is `workers: 1` (the config's
own choice, for the transient frame protocol), so the condition that crossed this row is this
ticket's non-shipped forcing protocol, not the product; portal rows crossing in-budget is
already what §1.3's watch rows track (item 77(d)'s budget-when-crossed law), and no `expect(`
line was touched.

*Standing rule — corrected, not restated.* The dispatch's proposed rule
("mid-walk state reads must settle the beat before asserting") is **refused as false for
this path**: there is no beat to settle between a keydown and `.ps-moves`. The law is
**"a short walk counter is a LOST press, never a stale read: check the input-attach window
(`openLevel`'s loader gate is the source of truth), and do not answer it with a retry"** —
a retry converts a loud lost-input red into a silent delay and hides the class. The
counter-example is already on the record: the mobile row failed *inside* a bounded 2 s
`expectMoves` poll (`38863790675`), which is precisely the remedy that was proposed.

*Disposition.* The dispatch's remedy has **no target**; nothing in `tests/e2e/**` was changed by
this ticket beyond this ledger (assertion count, messages and the 107 census untouched), and
`db49823 → develop` changes **no `src/**` byte**, so the A/B isolates the loader gate exactly.
The probe is a ~40-line throwaway spec (run as `tests/e2e/zz-qa010-probe.spec.ts` in the
dispatch worktree, **deleted before the census round** so the inventory stays at 107) — the
three reads above are its whole content, so it rebuilds from this paragraph alone.

---

### 1.10 QA-014 — the 20-row pin migration, and the shelf guard it had to keep live

The migration itself is one number (`EXPECTED_LEVEL_COUNT` 19 → 20) plus every derived
row that moved with it; §2 is the present-tense inventory. Two things in it are worth
their own record, because both are *liveness* claims rather than counts.

**The shelf's booked set is now empty, and empty is compared, not counted.**
`tests/solver/l16-l20-candidates.test.ts` asserted its candidate shelf against a
**booked** list (`["l020.json"]`) while that rung sat above the registered root max.
R-003d registered the rung, so the booking is `[]` — but the assertion stayed **set
equality** (`expect(shelf).toEqual([...BOOKED_CANDIDATE_IDS_IN_SHELF])`) precisely so
the empty case cannot go vacuous. Proved live, on this branch, by dropping files in and
watching the guard fire by name (each `cp` followed by an `rm`, `src/**` left
byte-identical — the worktree is clean afterwards):

```
$ cp src/levels/l020.json src/levels/candidates/l020.json
  × the shelf holds only the booked pre-registration candidates (now none), all above the census ceiling
    AssertionError: expected [ 'l020.json' ] to deeply equal []      # a re-appearing registered rung
$ cp src/levels/l012.json src/levels/candidates/l012.json
    AssertionError: expected [ 'l012.json' ] to deeply equal []      # a root row hiding outside the census (BELOW rootMax)
$ cp src/levels/l020.json src/levels/candidates/l021.json
    AssertionError: expected [ 'l021.json' ] to deeply equal []      # an UNREGISTERED extra (ABOVE rootMax)
```

The second half of the law — every shelf rung must strictly exceed the registered root
max — is kept as written and is now **live for the next booking** (`rootMax` itself is
asserted against the shared dataset pin, so the ceiling still cannot be justified by a
dataset that moved without the pin moving). With the booking empty its loop is
unreachable today; that is stated rather than hidden, and the emptiness is what the
set-equality tooth above actually guards.

**The latch-removed control was re-pointed, not inherited or deleted.** QA-012's drift
note (F-L20-2) booked the semantics: the *switch-gated-door* reading of "remove the
latch" (bare board still SOLVABLE, refusal named `door-without-switch`) is **by
construction false** for a sealed-landing board, because there the latch carries
*existence*. `base` is `BLOCK_MIN` = l016, so the original control was kept **verbatim**
(its class is real and still shipped) and the landing rung got the **named `unsolvable`
reading as its own control**, measured on the registered bytes:

```
$ # l020 with its switches dropped, via the shipped readers
naked.solvable            = false          # the reading that does NOT transfer from l016's class
naked.violations          ⊇ door-without-switch  # the collapse is attributable, not a mystery
naked.allOffShortest      = null           # and null BEFORE the mutation too
```

The `allOffStaysDefined` clause got the same treatment: on this class the sanctioned
measurement is `null` before *and* after the mutation, so it is replaced by the equality
`null === null` — the honest form of the same emptiness — instead of the weaker
`not.toBeNull()` that only holds on l016's class.

**A third row moved by rule, not by edit: L20's exhaustive-leg branch.** `route-budget`'s
n-11 row attempts the unpruned walk and, when the production cap refuses it, asserts the
refusal; QA-011 derived that at 19 rungs and the admitting set was L1–L16. The new rung
takes the **refusal leg** — measured here with a throwaway probe on the registered bytes:
`l020` raises `RouteEnumerationError` at `cap = 2,000,000`, `visits = 2,000,001`,
`par = 20`, while `l15` (76,132 visits) and `l16` (1,363,684) still fit, i.e. the
admitting set is unchanged and **no test edit was needed for the branch**; only the
comment that recorded the QA-011 measurement gained the continuation row (776 / 844 /
881 / **1,157 ms** for l017–l020 under a concurrent e2e round, all far inside the row's
30 s guard).

**No production byte was touched.** `git status --porcelain` on the dispatch worktree
lists `tests/**` only.

---

### 1.11 QA-017 — GAME-003's art+motion acceptance surface (A-1…A-10), and the four things the spec's own wording cannot reach

GAME-003 mounted the signed A-06 portal pair **swapped** (`portalSlotFor("A") ⇒
portal_b`, `"B" ⇒ portal_a`) and added the §6.6 beats B6/B7/B10/B12/B13 as per-frame
scalars. QA-017 is the acceptance battery for `docs/ui-ux.md` §3.1e R-PM5/A-1…A-10,
split by *what can be measured where*:

| tier | file | cases | what it decides |
|---|---|---:|---|
| unit | `tests/unit/portal-mount-acceptance.test.ts` | 22 | the mapping/box/turn/ceiling/deny-list claims as **draw calls and data** (no pixels, no canvas) |
| e2e | `tests/e2e/portal-mount.spec.ts` | 10 | everything that must come off the **running page**: the bytes its loader fetched, the pixels it presented, the styles it applied |
| e2e | `tests/e2e/portal-mount.mobile.spec.ts` | 2 | A-2's painted core and A-8's stillness at the R-L6 mobile pitch |
| helpers | `tests/e2e/helpers/frames.ts`, `helpers/art.ts` | — | in-page frame census/diff (`cellCensus` with a luma-only disc, `profileDelta`) and served-PNG decode + WCAG maths |

**The measured numbers, all from the shipped build.** Every figure below was read in
this round and reproduces `docs/assets/evidence-2026-10-17-portal-mount/portal_probe.py`
where the two overlap; nothing in either tier is typed from the probe.

```
A-1  manifest: 7 resolved rows, portal_a/portal_b under A-06; both rasters 512×512, ink 74 713 px
     pair agreement  phase A live/far ink 384/384 inner 0/0   |  phase B 1885/1888 inner 87/88
A-2  swapped  A 6.51/5.54  B 6.24/5.48   (as-named A 2.25/1.91  B 2.16/1.89 → all < 3: the swap is load-bearing)
     mobile pitch (cellCss 51.5, renderScale 2): painted core 68,184,207 vs served 69,186,209; ink 2403, inner 90
A-3  B value backup (live raster vs obj.portalEcho) = 1.03:1; luma census dormant ink 384 / inner 0 → live 1885 / inner 87 (ratio 4.91)
A-5  far-end ROI frames 28, grid 26.1 ms, frozenUntil 116.5, onset 138.9, duration 183.2 ≤ 200 + grid
     exit-end ink live 1885 / far 1888, inner 87 / 88
A-7  B12 samples 47, grid 23.7 ms, rampSamples 4, rampSpan [70.7, 118.6] ms, declared 90 ms
     transition's own record: elapsedTime = 90 ms, event wall span 141.5 ms
     curve x:scale = 0.185:0.9914 0.556:0.9777 0.740:0.9730 0.926:0.9703   (model within 0.0002)
     crossing 32.26 ms (analytic 30.82, linear 45); scale@45ms measured 0.9777 / analytic 0.9795; settled 0.9700
     B13 panelDelay 260.9 ms (declared 220), opacity at unhide 0, hit-test at the Next centre = Next, disabled false,
     entrance running at currentTime 0 → raw pointer click advanced the level with moves 0
A-8  desktop idle 2 s: changed 348 / 988 160 px, maxDelta 158, union bbox 882,83,941,142 ⊂ goal cell 867,67,91,91
     mobile  idle 2 s: changed 1150, maxDelta 184, bbox 666,254,736,325 ⊂ goal cell 650,238,103,103
A-9  reduced idle changed 0 / maxDelta 0; press scales {1.000}; panel ps-panel-in / 0.16 s / translateY 0; legibility identical
A-10 entry 1554 px and Undo 1627 px of diff both ⊆ the goal cell; DOM snapshot byte-equal over 2 s; runningAnimations []
```

**A-1's dev-strip sentence is unreachable by construction, and is proved at the level
the strip reads from.** A-1 asks the dev strip to list `A-06 portal_a` / `portal_b`.
The strip's whole purpose is to name **unresolved** slots (R-P3/R-P6); since
R-005b/UA-0013 every one of the seven `PLACEHOLDER_SLOTS` rows is `resolved: true`, so
`activePlaceholderSlots()` is `[]`, `unmountedResolvedSlots()` is `[]` and the strip
renders `hidden`. Printing it to satisfy the sentence would be theatre. The claim the
sentence carries — *the pair is mounted under A-06* — is asserted on the same table
(R-P5's single source) in both tiers, and the wording conflict is recorded **here**
rather than edited into the spec. Related: A-1's second clause ("both ends
pixel-identical in every frame") is measured as **figure agreement**, not byte equality:
the pair's two ends sit on opposite `(x+y)` chequerboard parity, so they are drawn on
*different ground tokens* by R-C4 and can never be byte-identical. The measured
substitute — ink mass within 8 %, bbox size within 2 px, radial-profile bin share
< 0.1, swirl presence equal — is what actually catches a per-end marker or a second
graphic at the exit end (E3-3), and it is the same shape A-5 uses for "zero new ink at
the exit end".

**A-2's pass shape binds one ground, not two.** The row's named bar is "≥ 6.2:1 on the
mount order's own ground" and its parenthetical quotes two numbers per phase
(6.50 / 5.53 A, 6.25 / 5.49 B). Only the **first** is ≥ 6.2; the second is the
*alternate* ground (`isAltCell`), and it is below the named bar. The measured pair
above (6.51 / 5.54 · 6.24 / 5.48) therefore binds `.cell` at the named 6.2 and `.cellAlt`
at the pre-registered **5.4** — the parenthetical's own value, quoted as the row's
second ground rather than re-specified. The falsifier is on the same bytes: the
**as-named** (suffix-convention) mapping measures 2.25 / 1.91 · 2.16 / 1.89, i.e. under
3:1 on both grounds of both phases, so a renderer regression to the suffix convention
turns this row red on the *files*, not on a screenshot.

**A-6 — the testability finding (reported, never patched around).** B7's attract is
`≤ +2 %` additive on the R-C8 envelope (`±6 %`, 2.4 s) and B10's hysteresis is a state
rule with no motion. Neither is observable from the presented pixels at this pitch: a
+2 % attract on a ±6 % pulse that is itself composited over a cross-fade is inside the
noise of the first beat's own alpha. The constants (`GOAL_ATTRACT_MS`,
`GOAL_ATTRACT_PEAK` at `src/game/renderer/board-view.ts:132-133`), the predicate
(`isInGoalNeighbourhood`, `:136`), its two call sites — the per-state re-read (`:578-580`)
and the `false → true` firing gate (`:619-624`) — and the scalar channel
(`attractAt` `:335`, `attractValue` `:755-766`) are **private** with no page hook,
and `src/**` is DO_NOT_TOUCH for QA. So the *contract* is proven in the unit tier
(additive ceiling exactly `1 + 6 % + 2 % = 8 %`; the channel absent == 0; a settled board
carries no attract) and the observability gap is filed here, with file and line, as a
**finding** — not worked around by inferring a private number from a screenshot.

**A-7's "computed transform at 45 ms = 0.97" is unreachable inside its own window.**
The press is `transform: scale(var(--ps-press-scale))` with `transition: transform
90 ms ease-out` on `:active` (hud-styles.ts:160-169), and `ease-out` is
`cubic-bezier(0, 0, 0.58, 1)` — not linear. At `x = 0.5` (45 ms of 90) the curve is at
`y ≈ 0.686`, so the transform is `1 + 0.686 · (0.97 - 1) = 0.9794`, and it reaches
0.97 only at the window's **end**. Measured on the running page: the press crosses
mid-scale (`0.985`) at **32.26 ms**, the value nearest the 45 ms mark is 0.9777
(analytic 0.9795), and the settled hold is 0.9700 — three readouts where the spec has
one that cannot be true. The instrument is anchored on the **transition's own clock**
(`CSSTransition.currentTime`), which is why the curve points above agree with the
declared easing to ≈0.0002 and can separate `ease-out` from a linear ramp (the check
requires each mid-window point to be twice as close to the model as to a linear read).
Two instrument facts are recorded because they bound every number in the row: the
sampling grid is the **frame** grid (~24 ms here — a running transition's computed value
is recomputed once per frame), and the in-page `setTimeout(…, 4)` grid that was the
first design is *worse* on this stack (~52 ms under a SwiftShader WebGL renderer at
load), so the timer grid was dropped rather than quoted.

**The K-4 supersession is a record, not a deletion — and these are the files that
carry it.** §3.1e R-PM5 supersedes §3.3b **Entry-3's K-4 negative** (`portalMentioned:
false`, the `l11_dev_channel` / `l5_no_portal_strip` rows). Nothing from that probe was
deleted; the re-pointing is pinned positively in
`tests/unit/portal-mount-acceptance.test.ts` ("K-4 supersession, recorded as its
positive" → `PLACEHOLDER_TO_ASSET["portal_a" | "portal_b"] === "A-06"`, plus the
derivation that the two rows can only exist because the manifest rows do) and in
`tests/e2e/portal-mount.spec.ts`'s manifest row (same two entries, plus
`unresolvedAssetIds() === []` and `assertNoPlaceholders()` not throwing). A search for
the old negative's literal flag in `tests/**` finds only those two positive
counterparts.

**No production byte was touched.** `git status --porcelain` on this dispatch's worktree
lists `tests/**` only.

---

### 1.12 QA-018 — the shelf re-booking to Act II batch 1, and the ceiling-wording scrub

LV-012 landed five **proven but unregistered** candidates (`src/levels/candidates/l021.json
… l025.json`) and left exactly one red behind *by design*: the booked-shelf pin
(`tests/solver/l16-l20-candidates.test.ts:163`) still asserted QA-014's empty booking.
QA-018 re-books it and scrubs the label. This is a **pin migration in the QA-011/QA-014
lineage**, not a rule change: no `src/**` byte moved.

**The booking moves `[]` → the five LV-012 ids**, and it stays *set equality* so neither
an unregistered extra nor a vanished member can pass. All three directions were measured
on these very bytes (each mutation reverted, `git status --short src/` empty after):

```
$ cp src/levels/candidates/l021.json src/levels/candidates/l026.json   # an UNREGISTERED extra
  × AssertionError: expected [ 'l021.json', 'l022.json', …(4) ] to deeply equal [ …(3) ]
$ mv src/levels/candidates/l025.json <tmp>                             # a VANISHED booked member
  × AssertionError: expected [ 'l021.json', 'l022.json', …(2) ] to deeply equal [ …(3) ]
```

The re-booked list is non-empty, so the **second half of the law is now reachable again**
(QA-014 recorded it as unreachable-by-construction while the booking was `[]`): with a
temporary probe booking that *named* a below-rootMax row, clause (b) fired on its own
channel with its own message — `l012.json sits at or below the registered root max 20:
expected 12 to be greater than 20` — which is how "the derived relation is live" is a
measurement rather than an argument.

**The label scrub (item 114's no-ceiling law binds test prose).** The pin's own name said
"…(now none), all above the census ceiling", and QA-014's terminal-rung comment called
`BLOCK_L1619_TAIL_EXEC_CEILING` "the device's census ceiling". Both are ceiling claims
about a device whose pocket census is **unmeasured at ≥ 11** (`docs/project-status.md`
item 114: no ceiling either direction, so no doc *or test label* may say "9 is the
largest" or "20 is the ceiling"). Renamed to the derived form — **"the shelf holds only
the booked pre-registration candidates (l021–l025, LV-012 batch 1), every rung derived
strictly above the registered root max"** — and the second test's "above an EMPTY shelf"
and the terminal rung's "the dataset's tail" were re-stated the same way ("above a shelf
booked by set equality"; "the registered dataset's tail, and no row above it is
documented or shipped"). The remaining occurrences of the word in the file are the
*named law's own prohibition*, not claims. No assertion changed count and no row was
deleted: the file still reports **52 cases** (8 per-member rows × 5 members + block-level
and negative-control rows) and the suite tally is unchanged.

### 1.13 QA-019 — the post-win star field (A-11/A-12), and the sub-pixel measurement the spec's wording forces

GAME-004 added one grid row to the frozen win panel: `starsFor(moves, par)` (a quoted
ruling: `3★ ≤ par + 2⌈par/10⌉`, `2★ ≤ par + 4⌈par/10⌉`, `1★ any finish`), a win-only
monotone store at `ps.echoGrid/stars@1` that records **moves**, and one additive
`.ps-stars` row of three `data-state` slots with a 120 ms fill-in riding B13. QA-019 is
its acceptance battery: **12 desktop rows** (`star-field.spec.ts`, A-11's five "never"s
+ the painted census per phase + the motion + reduced form + SF-1's DOM claim),
**2 mobile rows** (`star-field.mobile.spec.ts`, the same field at the Pixel-5 DPR-2.75
raster, including a real touch tap on `Next`), and **23 unit rows** over
`tests/unit/stars-rating.test.ts` (8, `node` — the hand-typed ruling table) and
`tests/unit/stars-persistence.test.ts` (15, `jsdom` — the monotone write contract).

**Nothing is typed. Both halves are forced.** The (run, best) pairs a ruler needs are not
seeded *into the rules* — a level is won after `2·d` extra moves by padding the par route
with a **reversible detour pair** found through `isLegalMove`/`applyMove` at its
pre-final state (the pair returns to the same tile in the same phase, ADR-0009's
checkerboard quantum), so the run lands exactly on `par + k1` (3★), `par + k2` (2★) or
above (1★) and the HUD's own move counter is asserted against that arithmetic. The
levels themselves are *selected* (`pickEndPhase`: cheapest rung ending in the phase,
no door, no portal, a reversible pair) rather than named. The stored record is seeded
with one `localStorage.setItem` of the module's own payload shape **after `openLevel`**
(which clears storage at navigation) and **before** the winning press; the key, schema
and slot count all come from `src/game/systems/stars.ts`. Two shared helpers carry it
(`helpers/star-field.ts`) and the pixel census (`helpers/star-pixels.ts` — a screenshot
of the 76 px row ± 8 px of the card's own plate, decoded in-page via
`createImageBitmap`/`OffscreenCanvas`, so no node-side image dependency).

**The finding that changed the arithmetic: a 20 px star's ring is sub-pixel, so a
nearest-reference ink count is phase-noise.** A-11's hollow form is the filled silhouette
knocked out at 0.8 — a wall that is **2 px at the points and 0.76 px between them**, i.e.
below the sampling limit of a 1× raster. Counting pixels as "nearer `obj.goal` than
`ground.plate`" therefore rounds the ring's rim into noise, and the *same geometry*
measured **0.35 (phase A) vs 0.26 (phase B)** for the declared 31–41 % hollow share — a
phase-dependent number that is not a property of the design. The corrected channel is the
**sub-pixel coverage** (each pixel's projection onto the `ground → ink` segment), which
reads **0.37 / 0.36** — the analytic `1 − 0.8² = 36.0 %` in both phases. Every area claim
in both specs is now stated on that channel (the hard mask survives only as a coarse
"a figure with a knocked-out middle, not two blobs" sanity check), and the analytic
comparisons are computed from the shipped constants (`STAR_OUTER_RATIO`,
`STAR_INNER_RATIO`, `STAR_POINTS`, `STAR_KNOCKOUT_SCALE`, `STAR_DOT_PX`) rather than typed.

**A-11 measured, per profile and phase** (all from painted pixels; `plate` cross-checked
against `theme(phase).ground.plate`, ink against `obj.goal`/`text.secondary`):

| profile | phase | plate (painted = token) | gold / dot | hollow | ratio (spec ≈ 2.78:1) | dot Ø | contrast gold/plate · dot/plate |
|---|---|---|---|---|---:|---:|---|
| desktop 1× | A | `247,241,227` = `#F7F1E3` | `168,117,42` · `110,96,71` | 0.37 | 2.73 | 5.00 px | **3.56 · 5.44** |
| desktop 1× | B | `27,31,59` = `#1B1F3B` | `233,200,122` · `169,178,216` | 0.36 | 2.75 | 5.00 px | **9.96 · 7.69** |
| mobile 2.75× | A | same tokens | same ink | 0.36 | 2.75 | 4.91 px | **3.56 · 5.44** |
| mobile 2.75× | B | same tokens | same ink | 0.36 | 2.78 | 4.91 px | **9.96 · 7.69** |

The desk-row numbers reproduce §5.5's own published A `3.556 / 5.441` and B `9.962 /
7.694` to the printed precision, and the phone rows are the same law on a 2.75× raster of
a 20 CSS px box (the dot reads 4.91 because its bbox is measured on that raster, not
because it changed size: the row's box is **76.00 × 20.00 CSS px at dpr 2.75**, every slot
20.00 × 20.00).

**A-12 measured.** The fill-in is pinned as *data* (`--ps-star-ms` = `120ms`,
`--ps-star-scale-from` = `0.86`), as the computed animation (`ps-star-in`, `0.12s`,
delay `0s`, `finished`, `currentTime` 120), as three **identical** document-timeline start
times (no stagger), and as the observer's own clock: `fillMs ≥ 120` and ≤ 3 frames of
`this` machine's grid after it, `fillMs < panelMs`, with `panelMs` the declared 160 ms
entrance within the same frame band (measured `fillMs 152–173` / `panelMs 190–210` at
`gridMs 19.9–23.4`; the earlier `120 + 2 frames` bound was **0.2 ms too tight** at 19.9 ms
and is recorded here rather than quietly widened). `Next` is hit-tested **on the unhide
frame** (`elementFromPoint` at its centre = `BUTTON.ps-btn-primary`, not disabled) and a
raw click there advances the level — the standing B13 gate is unchanged and re-run green.
Idle: **0 changed of 1520 device px over 2 s** (desktop) and **0 of 11495** (mobile), with
0 running animations anywhere on the field. Reduced motion: `--ps-star-scale-from` flips
to `1` while the keyframes stay attached and the slot stays a 20 px box (`display` not
`none`), the first frame is already at scale 1.00, and the census survives.

**Liveness, both tiers, each mutation reverted (`git status --short src/` empty).** In the
unit tier, `{moves: 7, par: 4, stars: 3}` in the ruling table → `1 failed | 22 passed`,
failing by name: `7 moves at par 4: the first row above par + k1 = 6 is 2★, not 3★`. In
the browser tier, flipping the worse-run expectation to `["earned","earned","earned"]` →
`1 failed` on `a worse run against a stored 3★ record draws the hollow mark and extends
the live line` at `star-field.spec.ts:365`, `Expected`/`Received` differing in exactly
that slot.

**One pre-existing red found in a standing row — reported, not patched.** §1.11's A-8
idle row (`portal-mount.spec.ts:1269`, "two frames 2 s apart differ only inside the
goal's own cell") is **flaky on the frozen bytes of this branch**, with `src/**` and that
file byte-identical to `develop` (`git status --porcelain` = the new `tests/**` files and
this file's own §1.13/§2 edit — `git diff --stat HEAD -- src tests/e2e/portal-mount.spec.ts`
empty):

```
$ PS_E2E_PORT=5251 npx playwright test tests/e2e/portal-mount.spec.ts --retries=0   # ×5 (build + rebase)
  [QA-017] A-8 idle diff changed=0 total=988160 maxDelta=0 bbox=null goalCell=867,67,91,91
  ✘  two frames 2 s apart differ only inside the goal's own cell   →  expect(diff.changed).toBeGreaterThan(0)
  … the other four runs: 10 passed (changed=126…774, bbox inside the cell every time)

$ PS_E2E_PORT=5251 npx playwright test tests/e2e/portal-mount.spec.ts \
    -g "two frames 2 s apart" --retries=0          # the SAME row, run alone
  [QA-017] A-8 idle diff changed=513 total=988160 maxDelta=163 bbox=882,83,942,142 goalCell=867,67,91,91 elapsedMs=2057.3
  1 passed (5.2s)
```

The pair is the discriminating observation: **zero reds on the row itself, one red on the
same bytes inside its own file** — so the variable is load, not the row's semantics.

**Root cause** (from the renderer, read-only): the goal's idle pulse is *wall-clock* (R-C8:
"the slow 2.4 s breathing must not restart on every move" — `board-view.ts:973`). Sampling
a 2.4 s period at exactly 2000 ms does not reveal it — the alias amplitude is
`A·cos(θ + 150°)`, which **passes through zero** for two pulse phases, at which point the
two captures are pixel-identical and the row's `changed > 0` assertion (correctly) fails.
Which phase the page is in when the second frame lands is load-dependent, so the row is
green on a quiet machine and red under the CPU pressure of a full-file run. **Fix
direction for a follow-up QA ticket** (not this one: it is a §1.11 row's semantics, not
QA-019's acceptance): sample at `T/2` (1.2 s — the anti-alias worst case, guaranteeing a
non-zero delta), or keep `≥ 0` and assert the pulse's presence as a *range* over ≥ 3
samples. **No `src/**` byte was touched, and nothing in QA-019's own 14 rows depends on
it** (the star field's stillness rows are a DOM row, not the canvas pulse).

> **Fix note (QA-020, 2026-10-17):** the flake above is closed — not by QA-019's
> first-listed option, which the measurement in §1.14 shows keeps its own null phase
> (`sin(θ+π) = −sin θ`), but by the three-sample form: a trio 800 ms apart with the
> assertion on the **peak** and a *derived* floor as the positive control. §1.13's
> `changed=0` reproduce line is left as it stands (historical snapshot); the row it
> describes no longer exists in that shape.

**What this ticket does not claim.** (a) The "never during play" clause is asserted on the
**DOM** (no `.ps-stars`, no `data-state`, nothing in `.ps-top`, and the frozen strings
carry no star glyph) — the canvas is not scanned for a star-shaped ink cloud, so a
renderer that *drew* one would not fail these rows; named as a gap. **That gap's colour
half was closed by QA-020 (§1.14): A-11's row now also reads the board canvas under the
field's own box and measures the closest pixel to the mark's ink, with the goal's own gold
as the detector's live positive control — the *shape* half remains a reported gap.**
(b) No verdict on how
the field *looks* (Asset Gate + UI/Art authority), and no claim that stars make the game
more fun. (c) No full-suite round was taken for this ticket — the dispatch asked for
targeted runs; the 14 new rows ran green in **1.0 m / 0 retries** (`PS_E2E_PORT=5251
npx playwright test tests/e2e/star-field.spec.ts tests/e2e/star-field.mobile.spec.ts
--retries=0` → `14 passed`).

---

### 1.14 QA-020 — A-8's idle row was phase-dependent, and the canvas star gap it closed

**Reproduce.** The booked symptom (QA-019, §1.13): `portal-mount.spec.ts`'s A-8 row read
`changed=0` in one schedule and `513…909` in another. It was reproduced on the frozen
bytes by a phase-indexed probe — the capture's pulse phase is tracked as the residue of
the page's own `performance.now()`, and the diff was swept across the cycle:

```
S=2000 (the row as shipped)   changed 1037 1052 816 542 1024 1011 348 [0] 277 985 1050 644 706 914
   …aimed walk through the null: residue 687→127, 716→[0] maxDelta=0 bbox=null, 754→135, 806→309, 851→560
S=1200 (QA-019's option (a))  changed 1521 950 1641 1637 1208 1165 1521 1757 481 1796 1326 706 716 1255
   …aimed walk: 2302→102 maxDelta=80, 2315→88 maxDelta=40   (two orders below the row's own ~1600)
trio 800+800+800, 12 phases    peaks 1554 1668 1688 1641 1684 1673 1670 1611 1541 1481 1457 1673
   …individual samples DO reach 0 (`1688/1347/0`, `1400/126/1457`); every bbox inside the goal cell (36/36)
```

**Root cause — arithmetic, not a rendering accident.** The pulse is
`1 + A·sin(2πt/2400)` (`src/game/renderer/objects/goal.ts:32-33,59-61`), fed the wall
clock at `board-view.ts:973`, so two samples a spacing `S` apart differ by
`A·|sin(θ+2πS/P) − sin θ| = A·2|cos(θ + πS/P)|·|sin(πS/P)|`: an **amplitude that is a
cosine of the capture phase θ**, which the runner picks, not the test. At `S = 2000`
that is `A·|cos(θ+150°)|` — exactly the form the ticket booked — and it is 0 at
θ = −60°/120°: the two frames are then pixel-identical (`maxDelta=0`). The premise behind
option (a) does not hold either: half a period returns the sine to its **negative**
(`sin(θ+π) = −sin θ`), so `S = 1200` keeps its own null phase (measured 88 above).
*No* two-sample schedule not a whole multiple of the period escapes this.

**Fix form: (b), the trio — chosen by measurement, not by preference.** Three samples
`800 ms` apart span one whole period (real steps 827–866 ms because the wait is
`setTimeout` + one rAF + read-back, so the span is 2495–2545 ms ≥ 2400, never less) and
over any θ the best of three phases 120° apart has `max|cos| ≥ 0.866` — computed in
`minOfMaxAbsCos`, not typed. The assertion moves to that **peak**, and the positive
control is a **derived floor**: the analytic moved band `2πR·ΔR` (ΔR guaranteed ≥ 8.3 % of
R at the real step), derated 4×, with `R` read from the page's own goal census. The
census is also the pulse's own receipt: `outer` walked 28.50…32.00 device px over the
cycle against the law's predicted 28.44…32.07 — the 6 % amplitude and the 2.4 s period
measured from the board, not quoted.

**Three consecutive rounds, zero retries, on the frozen bytes of this branch**
(`PS_E2E_PORT=5249 npx playwright test tests/e2e/portal-mount.spec.ts
tests/e2e/portal-mount.mobile.spec.ts --retries=0`, `12 passed` each, 47.8 / 48.0 /
48.0 s). Counts are per-file; the *numbers differ* run-to-run exactly as the ticket asked
them to — the assertion never does:

| round | desktop A-8 samples (peak / floor) | mobile A-8 samples (peak / floor) |
|---|---|---|
| 1 | 1704 / 1457 / **126** → peak **1704** / 115 | 1982 / 1110 / 1502 → peak **1982** / 145 |
| 2 | 1687 / 1501 / 429 → peak **1687** / 115 | 1982 / 1110 / 1521 → peak **1982** / 145 |
| 3 | 1673 / 1638 / 965 → peak **1673** / 115 | 1982 / 1168 / 1418 → peak **1982** / 145 |

Round 1 is the point: the third sample reads **126** — 7 % of the peak, the phase window
where the *old* row's single difference is exactly 0 (the sweep above reads a literal
`changed=0` two residues away) — while the peak stays at ~15× the floor. The margin is the
phase-invariance, visible in the data.

**Meaning: preserved, and enlarged.** The row still fails if any rogue idle animation
exists — a portal breathing, a grid line shimmering, an echo fading or a HUD beat on the
canvas leaves the goal cell and the union bbox of that sample fails `bboxWithin` — and it
now does so on **three** samples covering 2400 ms of wall clock (≈120° of pulse phase per
step) instead of one pair covering 300°, so the deny-list's coverage is *larger*, not
smaller. What replaced `changed > 0` is a *derived* floor with a live **positive
control**: the goal's own census radius must be > 0 (or the floor is 0 and the row would
be a tautology), and the peak must clear the band. A suppressed or halved pulse now fails,
where `changed > 0` would have passed a halved one.

**The named gap, half-closed (second commit).** "Stars never appear during play" was
DOM-only. The canvas now gets a channel (`canvasInkProximity` in `helpers/star-pixels.ts`)
inside A-11's existing row, mid-level, at the **panel's own box**, on the mark's own
reference (`--ps-goal` = `theme(phase).obj.goal`, exactly the token the DOM clip-path
fills with):

```
[QA-020] A-11 canvas channel phase=A ink=168,117,42 goalCell=832,194,128,128
         goalMinDistance=0.00 tolerance=24 controlNear=181
         field=480,363,320,175 fieldNear=0 fieldMinDistance=132.88 fieldPx=56000
```

`controlNear=181` is the **positive control** (the goal figure is painted in the same gold
family, so "the reference is reachable on this canvas" is measured, not assumed);
`fieldNear=0` with the closest pixel at 132.88 px — 5.5× the tolerance — is the claim.
Two self-inflicted defects were caught by that control while building it, both recorded
rather than hidden: the channel initially read a **cleared** buffer (this row never armed
`installPixelReadback`, and every pixel then sat an exact 208.99 away from black — the
control's own complaint), and the first threshold formula was unbounded (`1.5 × 209` = 313
made *every* pixel "near"), so it is clamped to `[24, 48]`. **Still not covered:** the
knock-out *shape* (its colour is `ground.plate`, which legitimately covers board areas, so
"no knock-out colour" is not a falsifier) and the 5-fold silhouette test — a detector whose
specificity against the board's own gold annulus is unverified would be an instrument that
can never fire, which is worse than an honest colour channel. That residual needs either
the star's clip-path geometry re-derived in the test (a second truth source) or a
`src/**` hook exposing the painted star boxes — the DOM row already owns that claim, so it
stays a **reported gap**, not a weakened row.

**Gates.** `npx vitest run` → **809 passed | 3 skipped (812)** against QA-019's `803 | 3`:
**+6 only-up**, exactly the new `tests/unit/idle-pulse-schedule.test.ts` (the schedule law
— the two-sample null phases, the trio's 0.866, the floor's monotonicity and `bboxWithin`'s
own negative controls — proven where it is exactly provable, so the browser row only has to
measure). `npx tsc --noEmit` → **0**. Targeted rounds: the two portal-mount files **3 × 12
passed / 0 failed / 0 flaky**, and both star-field files **14 passed** on the changed A-11
row. No `src/**` byte was touched, no test deleted, no assertion relaxed, no retry, no
budget re-derived.

**What this ticket does not claim.** (a) It does not prove the *knock-out shape* is absent
from the canvas (above). (b) It does not re-derive the pulse's own constants in the e2e
tier — `objects/goal.ts` cannot be imported there (its `theme/art.ts` `?url` PNG imports
are not transformed by Playwright's loader), so the numbers are quoted with the unit tier's
pin and *re-measured* from the painted radius; the amplitude/period agreement is evidence,
not a substitute for that pin. (c) No full-suite round: the dispatch asked for targeted
runs, and the A-8 pair plus the changed A-11 row are the rows whose bytes moved.

---

### 1.15 R-004c — the 25-row pin migration, the cap-binding row it named, and the chain re-measure

**Scope.** `tests/**` only — `git diff 178d9d8 -- src` is **empty** on this branch (verified
again after the measurement below). R-004a registered the Act II batch 1 (`l021`–`l025`) at
the dataset root, which moved the dataset **20 → 25** while every count-, dataset- and
`PINS`-derived pin still read 20. The dossier (`src/levels/README.md` §7c) enumerated the
**41 red vitest rows + 1 `tsc` red**; this ticket clears them. One lever moved six rows by
itself: `EXPECTED_LEVEL_COUNT` **20 → 25** in `tests/e2e/helpers/levels.ts` (the one
deliberately hand-typed dataset pin, §1 of that file).

**41F → 0, per file, against the baseline run** (same tree, `vitest run`, 10 red files):

| file | rows | what moved |
|---|---:|---|
| `tests/solver/difficulty.test.ts` | 8 | `PINS` + the five l021–l025 rows (`L`/`B`/`T`/`R`/`M`/`D`/`dexec`/`bRaw`/`forced`/`lookahead`/`states`) and the published `D_exec` 2-dp list appended `21.58 · 22.58 · 24.62 · 25.60 · 27.60` |
| `tests/solver/route-budget.test.ts` | 7 | `PINS` + the five rows **and** the aggregate `dualPhaseTiles` typed list (the red found it; §7c did not name it — appended five `12`s) |
| `tests/solver/metrics-sidecar.test.ts` | 4 | the mirror checks follow the pin; the sidecar's 25 records are already the law |
| `tests/solver/ordered-companion.test.ts` | 5 | `ORDERED_PINS` + the five measured ordered lists (17 tiles, `ordered ≡ unordered` on 5/5) |
| `tests/solver/l16-l20-candidates.test.ts` | 2 | the shelf booking returns to `[]` (R-004a landed the five) **and** the "L20 is the terminal rung" row was **re-worded, never re-stamped**: `BLOCK_IDS.at(-1) === 20` and `maxShipped === EXPECTED_LEVEL_COUNT === 25` are now two facts, with the absence clause re-pointed at `l026.json` |
| `tests/solver/policy-negative-controls.test.ts` | 6 (+1 `tsc`) | the six `gate-act2-*` codes lifted from R-004a's proven attest table, **plus** the shared `gate-shortest-solution-presses-switch-and-crosses-door` reader's Act II control (the attest table's seventh member); the one non-surgical member (`gate-act2-exec-band`, a *table* mutation the `Record<code → Level[]>` cannot carry) uses the board-side dual and says so on its own definition |
| `tests/solver/multi-switch-door-warning.test.ts` | 1 | derived count; the pin alone |
| `tests/unit/level-inventory-derivation.test.ts` | 4 | the pin + its three mutation probes (ADD/REMOVE/RENUMBER) |
| `tests/unit/player-embedded-home.test.ts` | 1 | **R-004b registry dependency** (registry length vs the shared pin) |
| `tests/unit/renderer-level-unlock.test.ts` | 2 | **R-004b registry dependency** (registry rows vs the independent fs scan) |
| `tests/unit/hud-end-panel-copy.test.ts` | 1 | **R-004b registry dependency** (the registry's last id vs the shared pin) |

**The pin is not the registry — the three (four-row) dependency, stated by name.** The
registry rows for L21–L25 are **R-004b** (`agent/gameplay/r-004b-serve25`, `1f72420`) and are
*not* part of this branch (this branch carries `tests/**` only). So on this branch alone the
battery reads **4 failed / 851 passed / 3 skipped (858)** — `renderer-level-unlock.test.ts:87`
and `:96`, `player-embedded-home.test.ts:101`, `hud-end-panel-copy.test.ts:138` — and all
four are that single unstacked dependency. With R-004b's own one-file patch applied in the
worktree **uncommitted, for measurement only**, the identical tree reads **0 failed /
860 passed / 3 skipped (863)** across **37 of 37 files** and `npx tsc --noEmit` → **0**,
i.e. **41F → 0** plus the five per-level rows the longer registry derives. The patch was
reverted before the commit: `git diff 178d9d8 -- src` is empty again, and the four reds
return with it. That is the honest split — a *stacking order*, not a failing pin.

**The cap-binding row, written out rather than silently clamped (special order 1).** Act II
takes the refusal family to **par 23** (L25), and par 23 is the first rung whose *uncapped*
envelope exceeds `refusalRouteEnvelopeMs`'s 240 s cap. It is registered as a **named
cap-binding row** inside the envelope's own docstring with the formula evaluated there:
`5.9 × (1.17 × 23 − 1.28 + 3.0) = 5.9 × 28.63 = 168.917 s` ⇒
`ceil(1.5 × 168.917) × 1000 = ceil(253.3755) × 1000 = 254_000 ms` ⇒
`min(240_000, max(90_000, 254_000)) = 240_000 ms`, exceedance **+14_000 ms (+5.8 %)**. The
same cap already bound at par 22 (`ceil(1.5 × 162.014) = ceil(243.021) = 244_000 ms`), so
**no number, no constant and no budget moved** for this migration — the row exists so the cap
cannot be widened later without a named re-derivation.

**The chain re-measure (special order 2).** The `L1→L25` unlock chain
(`playthrough.spec.ts:163`) was walked **twice** in a real browser on this branch's test bytes
plus R-004b's registry patch, one worker, `--retries=0`:

| round | port | row time | budget | used |
|---|---|---:|---:|---:|
| round 1 | `PS_E2E_PORT=5250` | **1.8 m ≈ 108 s** | 360 s | 30.0 % |
| round 2 | `PS_E2E_PORT=5251` | **1.6 m ≈ 96 s** | 360 s | 26.7 % |

Both figures are Playwright's own row clock (`1.6m` / `1.8m` on the list reporter), so the
row spans **96–108 s** — and that is quoted as measured: QA-014's 20-row observation was
**57.1 s**, so the five extra rungs cost **≈ +39–51 s**, which is the route-length delta
(route moves 170 → 258, +52 %) and nothing else. Reporting it at ~57 s would be a fiction.
The row is nowhere near the 70 % hold line (252 s) and it **did not cross**. QA-014's two
*cloud* projection models still disagree by 2.5×, so the constant stays **held at 360 s**
(item 77(d) doctrine: disagreeing projections = hold and watch, no fiction-raise, no silent
widening).

**The surrounding file, same window.** `playthrough.spec.ts` ran **29 passed / 0 failed in
4.3 m** — all **25** per-level par rows (L21 8.8 s, L22 9.1 s, L23 9.8 s, L24 10.2 s,
L25 11.2 s, each inside its 90 s class), the chain row above, the out-of-range `?level` row
and the end-panel row (**7.4 s of its 90 s**, and its `L1–L25` string now comes from the
registry's own list rather than a literal).

**Inventory (special order 3).** `npx playwright test --list` → **183 tests in 12 files**
(167 desktop + 16 mobile) on this branch's bytes, and the *same* 183 on the stacked tree —
the ladder rows are derived from the **dataset on disk** (`REFS`), so they were already
extended to L21–L25 by the R-004a registration and only their *verdict* waited on the
registry. Per-file: playthrough 29, latch-door 42, refusal 49, portal 6, controls 8,
input-replay 4, transient 7, star-field 12, portal-mount 10, portal-mount.mobile 2, mobile 12,
star-field.mobile 2 — the par-route rows come from the sidecar-backed solver, never hand-typed.

**No weakened assertion.** Every row that moved is a count, a dataset census or a `PINS`
value; no rule, no gate, no route and no wall-clock budget was relaxed, and the one
deliberately-handed re-word (the L20-terminal row) gained assertions rather than losing them.

---

### 1.16 R-004d — the Act II refusal **classes**, the census the browser lane could not see, and the off-phase portal press that is not a refusal

**What was missing.** R-004c took the pins to 25 and booked this ticket: the generic
refusal rows above already walked every Act II par route and froze on every refused
direction, so *"an illegal move is identity"* was **already asserted in-browser on
L21–L25** (re-measured here: the five generic rows pass at 23.5 / 23.3 / 29.9 / 27.9 /
30.1 s). What the suite could not see is *which kind of blocker* refuses, on the
dataset's first **multi-pocket sealed landings** — boards where §8.16's device law puts
two different blocker kinds side by side by construction.

**Two new rows per rung family — one census row, five browser rows.** The census row is
solver-side and has no page (`portal.spec.ts:89`'s precedent); the browser rows drive
`cheapestRefusalFixtures()` — the classes are *found* in the level's own reachable set
(`explore()` + `isLegalMove`), never typed:

| rung | par | published `refusedThenEnteredTiles` | `out-of-bounds` | `phase-wall` | `door-without-switch` | `door-latch-on` | refused at a portal end |
|---|---:|---:|---:|---:|---:|---:|---:|
| L21 | 17 | **17** (`T ≡ R ≡ 0`) | 188 | 48 | 52 | **0** | **0** |
| L22 | 18 | **17** (`T ≡ R ≡ 0`) | 188 | 48 | 50 | **0** | **0** |
| L23 | 20 | **17** (`T ≡ R ≡ 0`) | 188 | 48 | 50 | **0** | **0** |
| L24 | 21 | **17** (`T ≡ R ≡ 0`) | 188 | 48 | 52 | **0** | **0** |
| L25 | 23 | **17** (`T ≡ R ≡ 0`) | 188 | 48 | 52 | **0** | **0** |

The **17** and the ordered-equals-unordered reading are the level lane's published
numbers (§8.16's ladder, §8.18's root re-measure, `prove-candidate-l2125.transcript.md`'s
`refused-beat` line on every rung, `attest-r004a-act2.transcript.md`); the tile lists stay
pinned **once**, in `tests/solver/ordered-companion.test.ts`'s `ORDERED_PINS`. The **class
partition is this ticket's own measurement** and is asserted as a *partition*: the four
classes cover every refused press on the board (`refusedPresses === Σ byClass`, 288 on
L21/L24/L25 and 286 on L22/L23), so no refusal is uncounted. `door-latch-on = 0` is the
measured form of §8.16's device law — every seal door is met **closed, before** its switch.

**The ticket's third surface does not exist, and the row says so instead of inventing it.**
The dispatch expected an *off-phase press at a portal* to freeze the triple state. Measured
on the landed bytes, the honest answer is **zero**: `refusedAtPortalEnds = 0` on 5/5, and
the reason is the locked rule rather than a data gap — legality reads the destination in the
**current** phase only (`src/core/rules/applyMove.ts:63-68`: in bounds + solid now) and
`portalAt` filters on `activePhase` (`src/core/rules/solid.ts:204`), so clicking an *inactive*
end is an ordinary **legal** step. The row therefore drives the press the other way and
asserts the true claim in both lanes: the same click that crosses in one phase (the
discriminating `pair`, whose active arrival is the non-adjacent far end) is a **single step
with one flip** in the other, landing on the tile that was stepped onto. Writing "no move, no
flip" here would have been a test asserting something false about the shipped core, so it was
**not written** — a ticket premise contradicted by measurement, reported rather than patched
into the suite.

**Wall clock (both rounds, `--retries=0`, one worker, `PS_E2E_PORT` 5252–5255).**

| row | round 1 | round 2 | envelope (par-derived) | used |
|---|---:|---:|---:|---:|
| census row (no browser) | 9 ms | 9 ms | — | — |
| L21 (par 17) | 17.0 s | **17.2 s** | 192 s | 9.0 % |
| L22 (par 18) | 16.8 s | **18.5 s** | 202 s | 9.2 % |
| L23 (par 20) | 17.1 s | **19.0 s** | 223 s | 8.5 % |
| L24 (par 21) | 17.3 s | **17.1 s** | 233 s | 7.4 % |
| L25 (par 23) | 18.4 s | **18.1 s** | **240 s (capped)** | 7.5 % |

Every new row rides the **same** `refusalRouteEnvelopeMs(par)` as the family (never a
re-derived or widened constant): `192_000 / 202_000 / 223_000 / 233_000 / 240_000` ms.

**The cap-binding watch — the second data point family.** Par 23 (L25) is the first rung whose
*uncapped* envelope (254 s) exceeds the cap, so the family's par-23 row is the row the watch
is about, and the **full-route** rows measured this round bind the cap by 12.5 % of budget,
not by 100 %:

| refusals row (whole par route) | par | measured (this round) | envelope | used |
|---|---:|---:|---:|---:|
| L21 | 17 | 23.5 s | 192 s | 12.2 % |
| L22 | 18 | 23.3 s | 202 s | 11.5 % |
| L23 | 20 | 29.9 s | 223 s | 13.4 % |
| L24 | 21 | 27.9 s | 233 s | 12.0 % |
| **L25** | **23** | **30.1 s** | **240 s (cap)** | **12.5 %** |

So the five Act II rungs land in the **same 12–13.5 % band** as QA-014's par-20 observation
(28.1 s of 223 s = 12.6 %), and the *derived* envelope absorbed five new rungs with **zero
re-migration**. On QA-013's conservative cloud factor (5.9×) the par-23 row projects to
**≈178 s inside the 240 s cap** — while the formula's own worst-case uncapped reading (254 s)
says the cap *will* bind: that disagreement is exactly the watch, and it is **quoted, not
resolved** (no constant moved; the named re-derivation stays R-004c's row with the Orchestrator).

**File-level evidence.** The whole `refusal.spec.ts` ran **55 passed / 0 failed in 8.5 m**
(`--retries=0`, one worker), the suite's slowest file by design. No `src/**` byte was touched:
`git status --porcelain` lists `tests/**` only.

---

### 1.17 R-005c — the 25 → 35 pin migration: one lever, forty-seven restatements, a chain envelope re-derived from measured walks, and the shelf booking (`[]` at its tip → the five measured names at R-005c-b)

**Scope.** R-005a landed the dataset at **35** (`src/levels/README.md` §7 row 7 / §7d)
and R-005b served the registry at 35; R-005c is the **test-side** migration on top of
the merged tip (`db4af50`, `src/**` + `docs/**` + `scripts/**` **0 bytes** — the
diff law holds, `git status --porcelain` lists `tests/**` only). Endstates measured on
the same bytes:

| endstate | before (at the tip) | after (R-005c) |
|---|---|---|
| `npx tsc --noEmit` | **0** | **0** |
| `npx vitest run` | **48 failed / 903 passed / 3 skipped (954)**, 9 failed files | **951 passed / 3 skipped (954)**, 37/37 files, exit 0 |
| `npm run levels` | — | `35/35 level files ok · 0 errors · 148 warnings (0 multi-switch-door) · 11/11 negative cases`, **RESULT: PASS** |
| `npx playwright test --list` | — | **239 tests in 12 files** |

**The one lever, and the forty-seven restatements.** `EXPECTED_LEVEL_COUNT`
(`tests/e2e/helpers/levels.ts`) `25 → 35` is the migration's only *decision* — every
other inventory in the suite is derived from the directory (QA-005c OQ2), so an unlock
costs one pin and the rest is arithmetic on it. The 48 red rows fell per file as:

| file | red rows | what the re-pin actually was |
|---|---:|---|
| `tests/solver/difficulty.test.ts` | 13 | PINS rows **26–35** (+11, `L/B/T/R/M/D/dexec/bRaw/forced/lookahead/states`), `l026`–`l035` §2 breakdowns, the `D_exec` 2-dp published list, the L5→L6 seam row |
| `tests/solver/route-budget.test.ts` | 12 | PINS rows **26–35** (`cost` = visits / lookaheadVisits / prunedChildren, `allOffReachableStates` 15 for batch 2 and 9 for batch 3) + the CLI aggregate line (10 static → 25 latched tail, still **0 dead / 0 unrecoverable**) |
| `tests/solver/ordered-companion.test.ts` | 10 | ORDERED_PINS rows **26–35** — four tile-list groups, ordered ≡ unordered (ADR-0002's coincidence) |
| `tests/solver/metrics-sidecar.test.ts` | 4 | one record per shipped level **in file order**; "the pin table was really parsed"; report ↔ PINS agreement; the published `D_exec` column incl. L11 = 8.57 |
| `tests/unit/level-inventory-derivation.test.ts` | 4 | the derived-count row **plus its three mutation probes** (ADD / REMOVE / RENUMBER) — the pin doing the alarming, both directions |
| `tests/solver/l16-l20-candidates.test.ts` | 2 | the shelf booking → **`[]`** (below); the "two tails" row's dataset tail 25 → **35** |
| `tests/unit/multi-switch-door-warning.test.ts` | 1 | "reads the shipped dataset (**35** boards, the pinned count)" |
| `tests/unit/hud-end-panel-copy.test.ts` | 1 | `ladderLabelOf` names the shipped ladder **L1–L35** (registry-derived, never `/L1–L25/`) |
| `tests/unit/player-embedded-home.test.ts` | 1 | the `solidAt` sweep is over the **shipped** registry |
| **total** | **48** | **0** |

Every new value is **read** off `docs/level-difficulty.report.json` records 26–35 (the
sidecar is the law; the pins are its witness, never a second opinion) and lands exactly
on `src/levels/README.md` §7d's handed-over table. The values were taken with a
**throwaway probe** in the worktree, which is **not** part of the commit: `git status`
before the commit lists `tests/**` only, and no `src/**`/`docs/**`/`scripts/**` byte
was needed for any of the 48 rows — the booked act-2-batch-2/3 `policy.ts` family was
**not** required (no STOP fired).

**Chain envelope: one row, semantics intact, re-derived off the measured walk.** The
envelope is a **single row** (`playthrough.spec.ts`'s unlock chain) and its semantics
are **unchanged**: the dialog's own `Next` walks L1 → L35 for real — no `?level=`
shortcut, no thinning, no direct navigation. Par total `269 + 210 = 479` moves
(+78.1 % on the 25-rung chain the old constant priced). Plain walks of that row,
`--retries=0`, one worker, final bytes, this bench:

| run | mode / reporter | local total |
|---|---|---:|
| A | whole file, list reporter (coarse `m`) | ≈ 162 s |
| B | row alone, JSON | **166.564 s** |
| C | row alone, JSON (**final bytes**) | **183.718 s** |
| D | whole file, JSON (**final bytes**) | **151.709 s** |

The envelope covers the **worst plain observation in either run mode** (the row's
timeout applies when it runs standalone *and* inside the file), so the derivation reads
**C = 183.718 s**, the slowest of the four — B and C are the same command on the same
route and differ by **+10.3 %**, which is the reason to derive off the spread and not
off a flattering sample:

```
cloudFullChainS(35) = 4.40 × 183.718   = 808.359 s   (4.40× = QA-024's BOOKED cloud datum, item 131)
envelopeMs          = ceil(1.5 × 808.359) × 1000 = 1_213_000 ms
```

**Falsifications, as arithmetic:** the live **639_000 ms** is falsified by
`1_213_000 / 639_000 =` **1.90×** and the pre-registered **856_000 ms** remedy by
**1.42×** (`ceil(1.5 × 5.9 × 183.718) = 1_626_000 ms` is its 35-rung re-reading) —
so neither old number may be re-used (§7d's pre-alert, item 143's pre-ruling). The
row's own comment carries the derivation, both falsifications and the
**pre-registered next bounds** (`1_626_000 ms` same-family face; `3_465_000 ms` on the
×100/35 work face) written *before* they are needed.

**Throttle arm (necessary, never sufficient).** The same row on the same bytes with
`PS_E2E_CPU_THROTTLE=20`: **429.841 s**, green — **2.34×** its plain walk and 35.4 % of
the 1_213_000 ms envelope. That proves the row is not scheduler-fragile; it does **not**
prove the envelope fits a starvation day, because the cloud ran at **4.40×** and rate 20
only reaches ~2.3–2.6× locally.

**Refusal envelopes: the third cap-binding row, and the one that lands inside.**
`refusalRouteEnvelopeMs` is a function of **par alone**, so the new rungs are absorbed
with **zero code change** — the docstring and the spec comment carry the verified
arithmetic instead (`5.9 × (1.17·par − 1.28 + 3.0)` seconds, `ceil(1.5 × …)`, cap 240 s):

| rung | par | cloud-upper | uncapped envelope | in force | reading |
|---|---:|---:|---:|---:|---|
| L31 | 19 | 141.305 s | 212_000 ms | **212_000 ms** | **inside the formula** — no cap registration needed |
| L33 | 22 | 162.014 s | 244_000 ms | **240_000 ms** | cap binds (par 22's row, inherited from R-004c) |
| L32 | 22 | 162.014 s | 244_000 ms | **240_000 ms** | same par, same cap row |
| L34 / L35 | **24** | 175.820 s | 264_000 ms | **240_000 ms** | **NEW named cap-binding row** — exceedance **+24_000 ms (+10.0 %)** |

`refusal.spec.ts` ran **plain, whole file: 75 passed / 0 failed in 13.8 m** — no
timeout fired anywhere, and the cap rows specifically did not: the four opening-refusal
rows of the new rungs read **3.5 / 3.3 / 3.3 / 3.4 s** (read-fresh JSON, targeted run),
and the whole-route rows for L31–L35 (the ones *riding* the envelopes) read
**27.8 / 27.9 / 30.5 / 34.0 / 34.4 s** — 13.1 % of par 19's 212 s, and **11.6 / 12.7 /
14.2 / 14.3 %** of the three cap-bound 240 s rows, i.e. the same 12–14 % band the
family has held since QA-014/R-004d (the cap is *binding by construction*, not by
measurement). The cap now stops the derived form on **four consecutive par values
(22 → 24)**; that standing signal is quoted, not resolved — the family's own
re-derivation is a cloud-datum question and no 35-level cloud round exists yet.

**Inventory arithmetic (why the count moved 189 → 239 without a new row being typed).**
The new rows are **generated off the dataset**, so the dataset's growth is the count's
growth: `playthrough 39 + refusal 75 + latch-door 62 + mobile 12 + star-field 12 +
portal-mount 10 + controls 8 + transient 7 + portal 6 + input-replay 4 +
portal-mount.mobile 2 + star-field.mobile 2 = 239` cases in **12** files (`--list`,
verbatim). The registry/unlock rows **auto-grew** the same way in the unit lane
(37 → 47 at R-005b).

**The booking, twice: `[]` at R-005c's base, and the five measured names at R-005c-b.**
R-005a's `git mv` emptied the shelf, so at R-005c's tip the booking literal was `[]` (its
fourth reading: QA-014 `[]` → QA-018 `l021–l025` → QA-026 `l026–l035` → R-005c `[]`) and
its successor reference was `l036.json` — the same rung was *both* the first unbooked shelf
name *and* the root's successor, because the shelf was empty and the root stopped at 35.
The row was **re-worded**, not re-stamped: the title dropped the now-false parenthetical, the
tail row reads **35** from `ACT_II_REGISTERED_IDS.at(-1)` /
`ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID` instead of a typed number, and the root **absence
clause** stayed derived from the live set. The tail row also asserts the lesson row's
**honestly null** `obligation` (R-005a2 recorded null because the `act-2-batch-2/3`
dispatchers are booked) — not vacuous: a tail that gained a fabricated obligation, or lost
its row, fails there by name.

**R-005c-b — the shelf moved underneath the pin in the next merge, and the pin caught it
by name.** LV-017 landed the Act II *closing* batch `l036`–`l040` as **proven shelf
candidates** *after* R-005c's base, so at the merged tip the suite read **950P / 1F / 3S
(954)** with the single red exactly here —
`l16-l20-candidates.test.ts:201:19`, `AssertionError: expected [ 'l036.json', 'l037.json',
…(3) ] to deeply equal []`. That is the guard working as designed (set equality, never a
count), not a defect: the literal is now the **five names read off the directory** (never
typed), and the **successor references moved to `l041.json`** — absent from the shelf *and*
the root, `documentedLesson(41)` null (verified) — while the **root** absence clause is
untouched: `l036.json` is still absent from `src/levels/` and `documentedLesson(36)` is null.
One id, two subjects, held apart on purpose (QA-025's scoping). Post-fix: file **52/52**,
suite **951P / 3S (954), zero red**, and the shelf-scoped relation (every booked rung
strictly above the registered root max 35) holds for all five.

**Non-vacuity, both directions, re-proved on the five-name reading** (probes run live on
this tree, removed again immediately): the **ADD** direction puts an **unbooked extra** on
the shelf — `cp src/levels/l035.json src/levels/candidates/l041.json` → the booking row
reddens at `:226:19` with `expected [ 'l036.json', 'l037.json', …(4) ] to deeply equal
[ 'l036.json', 'l037.json', …(3) ]`, `1 failed | 51 passed`; the **REMOVE** direction takes
a **booked member** away — `mv src/levels/candidates/l040.json` aside → the same row reddens
at the same line with `expected [ 'l036.json', 'l037.json', …(2) ] to deeply equal
[ 'l036.json', 'l037.json', …(3) ]`, `1 failed | 51 passed`. Both restored → `52 passed`;
the shelf holds `README.md` + `l036`–`l040` and `git status` lists `tests/**` only. (R-005c
had proved the paired *root* direction under its `[]` booking — a root `l036.json` reddened
the absence-clause row; at this tip `l036.json` is a **booked shelf candidate** instead, so
the shelf-scoped ADD probe is the live measurement and the root clause stays untouched.)

**Candidate files are invisible to the browser lane — verified, not assumed.** The e2e
listing is **unchanged at 239 cases in 12 files** with five new `.json` files on disk
because `tests/e2e/helpers/levels.ts` discovers the **root** directory only
(`src/levels/*.json`) and the registry serves registered rows, so a shelf candidate
generates **no** `playthrough`/`refusal`/`latch-door` row. That is the same derivation that
made the count grow 189 → 239 when the *dataset* grew — and the reason a shelf landing is
invisible in the count while it is loud in the booking pin.

**Source law, stated once.** `git diff develop -- src docs scripts` is **empty**;
`git status --porcelain` lists `tests/**` only; the throwaway measurement probe was
deleted before the commit. `tests/solver/**` and `tests/e2e/**` style: the six files
carried **pre-existing** Prettier debt at the develop blob (measured: each is
unformatted there too, `printWidth` 80 vs the files' existing wide tables) — R-005c
matches the surrounding style and **names** the debt instead of chasing it, so the
commit stays atomic (R-005b precedent).

---

### 1.18 R-006c — the 35 → 40 pin migration: the same one lever, the chain envelope re-derived at 40 rungs (1_213_000 ms falsified by measurement), and the shelf booking that stayed `[]` with the `l041` absence clause

**Scope.** R-006a registered Act II's closing batch (`l036`–`l040`) at the dataset root
(`src/levels/README.md` §7e) and R-006b grew the playable registry to 40; R-006c is the
**test-side** migration on top of that tip (`657be5036`, R-006b's registry commit).
`git diff 657be50 -- src docs scripts` is **empty**, and `git status --porcelain` lists
`tests/**` only — the diff law holds. Endstates measured on the same bytes:

| endstate | before (at the tip) | after (R-006c) |
|---|---|---|
| `npx tsc --noEmit` | **0** | **0** |
| `npx vitest run` | **33 failed / 963 passed / 3 skipped (999)**, 9 failed files | **996 passed / 3 skipped (999)**, 37/37 files, exit 0 |
| `npm run levels` | — | `40/40 level files ok · 0 errors · 183 warnings (0 multi-switch-door)`, **RESULT: PASS** |
| `npx playwright test --list` | — | **264 tests in 12 files** |

R-006a's §7e handed over the authoring detail on its own tree (`647845d`: **34 failed /
957 passed / 3 skipped (994)**); this ticket's base is one train later and reads
**33 / 963 / 3 (999)** — measured at both points, never inherited, and the per-file
attribution below is *this* tip's.

**The one lever, and the thirty-three restatements.** `EXPECTED_LEVEL_COUNT`
(`tests/e2e/helpers/levels.ts`) `35 → 40` is the migration's only *decision* — every other
inventory in the suite derives from the directory (QA-005c OQ2), so an unlock costs one pin
and the rest is arithmetic on it. The 33 red rows fell per file as:

| file | red rows | what the re-pin actually was |
|---|---:|---|
| `tests/solver/difficulty.test.ts` | 8 | PINS rows **36–40** (+5), the five `l036`–`l040` §2 breakdowns, the published `D_exec` 2-dp list, and the `lookahead ≡ L − 1` saturation row |
| `tests/solver/route-budget.test.ts` | 7 | PINS rows **36–40** (`cost` = visits / lookaheadVisits / prunedChildren, `allOffReachableStates` 11) + the `dualPhaseTiles` column (+7 each) |
| `tests/solver/ordered-companion.test.ts` | 5 | ORDERED_PINS rows **36–40** — ordered ≡ unordered (ADR-0002's coincidence) |
| `tests/solver/metrics-sidecar.test.ts` | 4 | one record per shipped level in file order, "the pin table was really parsed", report ↔ PINS agreement, and the published `D_exec` column |
| `tests/unit/level-inventory-derivation.test.ts` | 4 | the derived-count row **plus its three mutation probes** (ADD / REMOVE / RENUMBER) — the pin doing the alarming, both directions |
| `tests/solver/l16-l20-candidates.test.ts` | 2 | the shelf booking → **`[]`** (below); the "two tails" row's dataset tail 35 → **40** |
| `tests/unit/multi-switch-door-warning.test.ts` | 1 | "reads the shipped dataset (**40** boards, the pinned count)" |
| `tests/unit/hud-end-panel-copy.test.ts` | 1 | `ladderLabelOf` names the shipped ladder **L1–L40** (registry-derived, never `/L1–L35/`) |
| `tests/unit/player-embedded-home.test.ts` | 1 | the `solidAt` sweep is over the **shipped** registry |
| **total** | **33** | **0** |

Every new value is **read** off `docs/level-difficulty.report.json` records 36–40 (the
sidecar is the law) and lands cell-for-cell on §7e's handed-over table; the route-budget
rows are the CLI's own `routeWalk` read-out (quoted in
`scripts/attest-r006a-reg40.transcript.md`, `subgraph 11/N` ×5). The values were taken with a
**throwaway probe** in the worktree, which is **not** part of the commit. **Independent
re-reading (this ticket, throwaway script, not committed):** all **40** difficulty `PINS` rows
and all **35** route-budget `PINS` rows were re-parsed and re-compared against the report and
the transcript → **0 mismatches**, and on the five new rows the worst rounding deviation is
**0.4359 of one last-digit unit** (L40 `bRaw` = 2.7319 vs 2.7319148936170214), i.e. every pin
is the source's own number at the file's own precision. The `forced`/`bRaw` columns were taken
at full report precision because the 2-dp rounding would sit inside the pin's tolerance there.

**Chain envelope: one row, semantics intact, re-derived off a 40-rung walk.** The envelope is
a **single row** (`playthrough.spec.ts`'s unlock chain, `:164`) and its semantics are
**unchanged**: the dialog's own `Next` walks L1 → L40 for real — no `?level=` shortcut, no
direct navigation, no thinning. The chain is now **587 par moves**
(`par(1…35) = 479` + `par(36…40) = 18+20+22+24+24 = 108`), **+22.55 %** on the 35-rung chain
the live constant was derived from. Two fresh plain runs of that row at this tip
(`--retries=0`, one worker, JSON reporter, ports 5222 / 5223), **both green**:

| run | mode | local total |
|---|---|---:|
| A | row alone, JSON | **191 060 ms = 191.060 s** |
| B | row alone, JSON | **211 602 ms = 211.602 s** |

The spread is **+10.8 %** on a 3½-minute wall clock — the same tenth-of-a-run leverage R-005c
measured — so the derivation reads the **worse** sample:

```
cloudFullChainS(40) = 4.40 × 211.602   = 931.0488 s   (4.40× = QA-024's BOOKED cloud datum, item 131)
envelopeMs          = ceil(1.5 × 931.0488) × 1000 = ceil(1_396.5732) × 1000 = 1_397_000 ms
```

**Falsifications, as arithmetic:** the live **1_213_000 ms is falsified at 40 rungs** by
`1_397_000 / 1_213_000 =` **1.1517×**, and the two historical legs of the same chain are
falsified harder — **639_000 ms** by **2.19×** and the pre-registered **856_000 ms** by
**1.63×** — so none of the three may be re-used (item 143's pre-ruling). R-006a pre-registered
a **forecast** of **1_486_000 ms** for this row; the measurement lands **below** it:
`1_397_000 / 1_486_000 =` **0.9401×**, i.e. **5.99 % under** — and the raw local total is under
the forecast's own local total by the same factor (`211.602 / 225.1408 =` **0.9400×**), so the
STOP order's condition (a measured total wilder than 1.6× the 1_486_000 ms forecast) did not
fire on either reading. The gap is the forecast's move-linear model error (the per-rung fixed
cost does not scale with move count). The row's own
comment carries all of the above plus the **pre-registered next bounds**, written before they
are needed: **1_873_000 ms** (same-family `ceil(1.5 × 5.9 × 211.602)`, R-006a forecast
1_993_000) and **3_492_000 ms** (`×100/40` work face, R-006a forecast 3_715_000).

**This ticket's whole-file round, and where the chain row landed.** Running the whole file
plain once on the shipped bytes (`PS_E2E_PORT=5224`, `--retries=0`, list reporter) →
**44 passed / 0 failed in 9.9 m**, `EXIT=0`. The chain row inside it read **3.3 m** (the list
reporter's 0.1-minute rounding ⇒ 195–201 s), i.e. **14.0–14.4 %** of its 1_397_000 ms
envelope — the same band the row has held since R-004c. The heaviest per-level row in that
round was **L25 at 15.4 s** of its 90 s budget (**17.1 %**) — a batch-1/2-era rung, not a new
one — and the new rungs' own rows read **12.0–13.9 s** (L36 12.0, L37 12.7, L40 13.0,
L38 13.5, L39 13.9 = **13.3–15.4 %** of 90 s), so the /40 tail is not the slow end of the
ladder.

**Throttle arm (necessary, never sufficient).** The same row on the same bytes with
`PS_E2E_CPU_THROTTLE=20` → **1 passed in 8.1 m**, the row itself reading **8.0 m** (≈ 480 s) —
**2.42×** its own plain walk and **34.4 %** of the 1_397_000 ms envelope, against R-005c's
35-rung arm at **429.841 s / 2.34× / 35.4 %**. A green there proves the row is not
scheduler-fragile; it does **not** prove the envelope fits a starvation day, because the cloud
ran at **4.40×** and rate 20 only reaches ~2.3–2.6× locally — the same necessary-not-sufficient
law the constant's own comment states.

**Refusal envelopes: the batch adds no cap row.** `refusalRouteEnvelopeMs` is a function of
**par alone**, so the new rungs are absorbed with **zero code change** — the docstring now
carries the verified arithmetic (`5.9 × (1.17·par − 1.28 + 3.0)` seconds, `ceil(1.5 × …)`,
cap 240 s). Batch 4 walks the family to par **18 / 20 / 22 / 24 / 24**, i.e. **two new par
values (18, 20) and two re-used ones (22, 24, already cap-bound)**:

| rung | par | cloud-upper | uncapped envelope | in force | reading |
|---|---:|---:|---:|---:|---|
| L36 | 18 | 134.402 s | 202_000 ms | **202_000 ms** | **inside the formula** — no cap registration |
| L37 | 20 | 148.208 s | 223_000 ms | **223_000 ms** | **inside the formula** — no cap registration |
| L38 | 22 | 162.014 s | 244_000 ms | **240_000 ms** | re-uses the standing par-22 cap row |
| L39 / L40 | **24** | 175.820 s | 264_000 ms | **240_000 ms** | re-uses the par-24 cap row named at R-005c (§1.17) |

The cap therefore still stops the derived form on **three consecutive par values (22 → 24)** —
the same standing signal, neither widened nor silenced, and **no new cap row** arrives from
this batch.

**Refusal round, and where the new rungs landed.** `refusal.spec.ts` ran plain, whole file once
on the shipped bytes (`PS_E2E_PORT=5226`, `--retries=0`, list reporter) → **85 passed / 0 failed
in 16.9 m**, `EXIT=0` — **no timeout fired anywhere**, and the cap-bound rows specifically did
not. The batch's whole-route rows (the ones *riding* the envelopes) read **23.7 / 28.7 / 30.4 /
36.0 / 30.9 s** for L36–L40 = **11.7 / 12.9 / 12.7 / 15.0 / 12.9 %** of their
202 000 / 223 000 / 240 000 / 240 000 / 240 000 ms budgets — the same 12–14 % band the family has
held since QA-014/R-004d, bracketed by L36's 11.7 % and L39's 15.0 % and still an order of
magnitude inside the cap. Their opening-refusal siblings read **3.5–3.7 s** (R-005c's are
3.3–3.5 s), i.e. the rung is cheap to refuse and the walk is what the envelope prices.

**Inventory arithmetic (why the count moved 239 → 264 without a new row being typed).** The
new rows are **generated off the dataset**, so the dataset's growth is the count's growth:
`playthrough 44 + refusal 85 + latch-door 72 + mobile 12 + star-field 12 + portal-mount 10 +
controls 8 + transient 7 + portal 6 + input-replay 4 + portal-mount.mobile 2 +
star-field.mobile 2 = 264` cases in **12** files (`--list`, verbatim: **248 desktop + 16
mobile**). The growth is arithmetic, not edit count: playthrough 39 → **44** (+5 per-level
rows), refusal 75 → **85**
(+5 per-level freeze rows **and** +5 ladder refused-then-entered rows), latch-door 62 → **72**
(+10 = two rows per new latch level, the dataset's derived contiguous tail L6–**L40** now
**thirty-five** latch levels, not thirty). Not one ladder row was added by hand.

**The booking, a sixth time: `[]`, and this time the two subjects coincide again.**
R-006a's byte-parity `git mv` emptied the LV-017 shelf, so at this tip
`src/levels/candidates/` holds its `README.md` and nothing else and the literal is the **empty
set** (the pin's sixth reading: QA-014 `[]` → QA-018 `l021–l025` → QA-026 `l026–l035` →
R-005c `[]` → R-005c-b `l036–l040` → **R-006c `[]`**), re-taken by the directory scan itself
rather than asserted from memory. The successor is **`l041.json`** — absent from the shelf
*and* from the root, `documentedLesson(41)` null — and the root's own absence clause stops at
**maxShipped + 1**, so the two subjects R-005c-b had to hold apart **coincide again**, and no
scoping words were needed or removed. The tail row is deliberately not re-stamped: the frozen
**R-005a standard stays 35** (`ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID`) while the R-006a
constant and `ACT_II_REGISTERED_IDS.at(-1)` carry **40** — a move that re-stamped the
pre-registration standard would fail by name right there. The tail lesson's `obligation` is
still asserted **honestly null** (R-005a2's recorded null; the `act-2-batch-2/3` dispatchers
remain booked).

**Non-vacuity, both directions, re-proved on this 40-rung `[]` reading** (live probes on this
tree, removed again immediately — `git status` after them lists `tests/**` only): the **extra**
direction puts an unbooked file on the shelf — `cp src/levels/l040.json
src/levels/candidates/l041.json` → the booking row reddens **by name** at
`l16-l20-candidates.test.ts:236:19` with `expected [ 'l041.json' ] to deeply equal []`,
`1 failed | 51 passed`; the **absent** direction — which for an empty booking is the *root*
clause rather than a removed member — puts a file at the root's successor —
`cp src/levels/l040.json src/levels/l041.json` → the absence clause reddens at `:322:7` with
`no registered l041.json: the registered dataset stops at the pinned count: expected true to be
false`, `1 failed | 51 passed`. Both restored → **52 passed**, the shelf holding `README.md`
only and the root stopping at `l040.json`. So neither half of the pin is decorative: the shelf
assertion catches an extra file, and the clause catches the dataset moving without the pin.

**Source law, stated once.** `git diff 657be50 -- src docs scripts` is **empty**;
`git status --porcelain` lists `tests/**` only; the throwaway measurement probe was deleted
before the commit. One production string is deliberately **not** re-pointed and is named
rather than touched: the `multi-switch-door` warning's `L6–L35` is
`src/core/level/index.ts`'s own *quantified allowance* clause (it says the L36+ allowance is
not quantified yet) — a `src/**` byte, off QA's lane, and its assertion stays verbatim.
`tests/solver/**` and `tests/e2e/**` style: the touched files carry **pre-existing** Prettier
debt at the base blob (unformatted there too), so R-006c matches the surrounding style and
**names** the debt instead of chasing it — the commit stays atomic (R-005b/R-005c precedent).

---

### 1.19 R-007c — the 40 → 45 pin migration: the one lever again, the chain envelope re-derived at 45 rungs (1_397_000 ms falsified by measurement, and the measurement landed 3.64 % **under** the level lane's forecast), the act-tail rows re-pointed at Act III **by act-boundary reason**, and an independent pin audit over the whole dossier

**Scope.** R-007 registered Act III's opener (`l041`–`l045`) at the dataset root
(`src/levels/README.md` §2i) and R-007b grew the playable registry to 45 (`4442d46`); R-007c is
the **test-side** migration on top of that tip. `git diff 4442d46 -- src docs scripts` is
**empty**, and `git status --porcelain` lists `tests/**` only — the diff law holds. Endstates
measured on the same bytes:

| endstate | before (at the tip) | after (R-007c) |
|---|---|---|
| `npx tsc --noEmit` | **0** | **0** |
| `npx vitest run` | **33 failed / 1008 passed / 3 skipped (1044)**, 9 failed files | **1041 passed / 3 skipped (1044)**, 37/37 files, exit 0 |
| `npm run levels` | — | `45/45 level files ok · 0 errors · 218 warnings (0 multi-switch-door)`, **RESULT: PASS** |
| `npx playwright test --list` | — | **289 tests in 12 files** |

R-007's §7f handed over the authoring detail on its own tree (`34 failed / 1002 passed / 3
skipped (1039)`); this ticket's base is one train later (R-007b's registry row had landed) and
reads **33 / 1008 / 3 (1044)** — measured at the base, never inherited, and the per-file
attribution below is *this* tip's. The total row count is **unchanged at 1044**: every migrated
pin carries data into an existing row rather than adding one, so the only moving number is
`passed` (1008 → 1041) as the 33 reds turn green.

**The one lever, and the thirty-three restatements.** `EXPECTED_LEVEL_COUNT`
(`tests/e2e/helpers/levels.ts:147`) `40 → 45` is the migration's only *decision* — every other
inventory in the suite derives from the directory (QA-005c OQ2), so an unlock costs one pin and
the rest is arithmetic on it. The 33 red rows fell per file as:

| file | red rows | what the re-pin actually was |
|---|---:|---|
| `tests/solver/difficulty.test.ts` | 8 | PINS rows **41–45** (+5), the five `l041`–`l045` §2 breakdowns, the published `D_exec` 2-dp list, and the `lookahead ≡ L − 1` saturation row |
| `tests/solver/route-budget.test.ts` | 7 | PINS rows **41–45** (`cost` = visits / lookaheadVisits / prunedChildren, `allOffReachableStates` 11) + the `dualPhaseTiles` column (+5 rows each reading 7) |
| `tests/solver/ordered-companion.test.ts` | 5 | ORDERED_PINS rows **41–45** — ordered ≡ unordered (ADR-0002's coincidence) |
| `tests/solver/metrics-sidecar.test.ts` | 4 | one record per shipped level in file order, "the pin table was really parsed", report ↔ PINS agreement, and the published `D_exec` column |
| `tests/unit/level-inventory-derivation.test.ts` | 4 | the derived-count row **plus its three mutation probes** (ADD / REMOVE / RENUMBER) — the pin doing the alarming, both directions |
| `tests/solver/l16-l20-candidates.test.ts` | 2 | the shelf booking → **`[]`** (below); the "two tails" row's dataset tail 40 → **45**, re-pointed at **Act III** (below) |
| `tests/unit/multi-switch-door-warning.test.ts` | 1 | "reads the shipped dataset (**45** boards, the pinned count)" |
| `tests/unit/hud-end-panel-copy.test.ts` | 1 | `ladderLabelOf` names the shipped ladder **L1–L45** (registry-derived, never `/L1–L40/`) |
| `tests/unit/player-embedded-home.test.ts` | 1 | the `solidAt` sweep is over the **shipped** registry |
| **total** | **33** | **0** |

Every new value is **read** off `docs/level-difficulty.report.json` records 41–45 (the sidecar is
the law) and lands cell-for-cell on §2i's handed-over table; the route-budget rows are the
transcript's own read-out. The values were taken with a **throwaway probe** in the worktree,
which is **not** part of the commit. `bRaw`/`forced` for the new rows are stored at 4 dp
(matching the neighbouring batch-4 rows), `B` at 4 dp and `D`/`D_exec` at 6 dp.

**Independent pin audit (throwaway script, not committed).** Beyond the migration itself, the
**whole dossier** was re-read against its two sources — `docs/level-difficulty.report.json` and
`scripts/attest-r007-reg45.transcript.md`:

- all **45** difficulty `PINS` rows → **0** outside tolerance; the worst last-digit deviation is
  **0.4930** of one last-digit unit (a batch-era row, L19's `bRaw`), and on the five new rows
  **0.4828** (L44's `D`);
- all **45** route-budget `PINS` rows → **0** mismatches (the `cost` triple is the CLI's own
  `routeWalk` read-out);
- all **45** ordered-companion pins → **0** mismatches;
- the attest transcript's `l041`–`l045` `par` / `D_exec` / `B` cells → **MATCH** on all three
  columns, 5/5 rungs.

So every pin is the source's own number at the file's own precision, and the audit is
source-anchored in **two** places, not one.

**The two act-tail rows: re-pointed at Act III by act-boundary reason, never re-stamped.**
`l16-l20-candidates.test.ts`'s "two tails, two facts" row (`:271`) used to read the dataset tail
as an anonymous value comparison; at the 40-rung pin it passed **for the wrong reason** — the pin
happened to equal *Act II's* tail. At 45 rungs that is no longer true, so the row now reads the
**live Act III** constant (`ACT_III_REGISTERED_TAIL_LEVEL_ID` = 45, `ACT_III_REGISTERED_TAIL_EXEC`
= 30.455319, both from `src/core/solver/policy.ts`, never typed here), while each earlier act's
tail **keeps its own frozen datum**: `ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID` stays **40**,
`ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID` stays **35**, and the pre-R-007 standard
(`ACT_III_PRE_R007_REGISTERED_TAIL_LEVEL_ID`) is *alias-typed* to R-006a's 40. **Non-vacuity is
asserted, not intended**: `ACT_III_REGISTERED_TAIL_LEVEL_ID.not.toBe(ACT_III_PRE_R007_REGISTERED_TAIL_LEVEL_ID)`
(`:318`) is the tooth a *wrong act's tail* cannot satisfy, and the **value** axis pins the pair
(level id, `D_exec`) — `tailDiff.Dexec.toBeCloseTo(ACT_III_REGISTERED_TAIL_EXEC, 6)` (`:343`) with
`ACT_III_REGISTERED_TAIL_EXEC.not.toBe(ACT_III_PRE_R007_REGISTERED_TAIL_EXEC)` (`:344`), so a
re-point back at Act II's 28.455319 reddens on either half. The absence clause was re-pointed one
rung up rather than deleted: `l046.json` must have **no registered file**, no lesson row and no
obligation (`:372`–`:379`), re-derived as `maxShipped + 1`.

**Chain envelope: one row, semantics intact, re-derived off a 45-rung walk.** The envelope is a
**single row** (`playthrough.spec.ts`'s unlock chain, `:164`) and its semantics are **unchanged**:
the dialog's own `Next` walks L1 → L45 for real — no `?level=` shortcut, no direct navigation, no
thinning. The chain is now **705 par moves**
(`par(1…35) = 479` + `par(36…40) = 108` + `par(41…45) = 20+22+24+26+26 = 118`), **+20.10 %** on
the 40-rung chain the live constant was derived from (587 → 705), i.e. 45 par routes, 45 HUD
reads and 44 `Next` clicks. Two fresh plain runs of that row at this tip (`--retries=0`, one
worker, JSON reporter, ports 5255 / 5256), **both green**:

| run | mode | local total |
|---|---|---:|
| A | row alone, JSON | **232 144 ms = 232.144 s** |
| B | row alone, JSON | **244 875 ms = 244.875 s** |

The spread is **+5.48 %** on a four-minute wall clock — the same tenth-of-a-run leverage R-005c
and R-006c measured — so the derivation reads the **worse** sample:

```
cloudFullChainS(45) = 4.40 × 244.875                     = 1_077.45 s   (4.40× = QA-024's BOOKED cloud datum, item 131)
envelopeMs          = ceil(1.5 × 1_077.45) × 1000        = ceil(1_616.175) × 1000 = 1_617_000 ms
```

**Falsifications, as arithmetic rather than opinion:** the live **1_397_000 ms is falsified at 45
rungs** by `1_617_000 / 1_397_000 =` **1.1575×** (it prices 587 moves where the row now walks
705); the historical legs of the same chain are falsified harder — **1_213_000 ms** at 40 rungs by
**1.1517×**, and both the **639_000 ms** constant and its pre-registered **856_000 ms** remedy at
35 rungs by **1.90×** and **1.42×**. None may be re-used: each is falsified on the rung count it
was derived for (item 143's pre-ruling). **The level lane's forecast and where this measurement
landed.** R-007 pre-registered **1_678_000 ms** (it scaled the 40-rung local total by the move
ratio, `211.602 × 705/587 = 254.1387 s`, §7f item 10); the measurement lands **below** it — `1_617_000 / 1_678_000 =` **0.9636×**, i.e. **3.64 % under**,
and the raw local total is under the forecast's own local total by the same factor
(`244.875 / 254.1387 =` **0.9635×**) — so the STOP order's condition (a measured total wilder
than **1.6×** the forecast, i.e. > 2_684_800 ms) **did not fire** on either reading. The gap is the
forecast's move-linear model error (the per-rung fixed cost does not scale with move count). The
row's own comment carries the full chain plus the **pre-registered next bounds**, written before
they are needed: **2_168_000 ms** (same-family `ceil(1.5 × 5.9 × 244.875)`, R-007 forecast
2_250_000 — 3.64 % above) and **3_592_000 ms** (`×100/45` work face, R-007 forecast 3_728_000 —
3.65 % above).

**Refusal envelopes: the batch adds a FOURTH cap row (par 26).** `refusalRouteEnvelopeMs` is a
function of **par alone**, so the new rungs are absorbed with **zero code change** — the docstring
now carries the verified arithmetic (`5.9 × (1.17·par − 1.28 + 3.0)` seconds, `ceil(1.5 × …)`,
cap 240 s). The opener walks the family to par **20 / 22 / 24 / 26 / 26** — **three standing
values plus one new one (26)**:

| rung | par | cloud-upper | uncapped envelope | in force | reading |
|---|---:|---:|---:|---:|---|
| L41 | 20 | 148.208 s | 223_000 ms | **223_000 ms** | **inside the formula** — no cap registration |
| L42 | 22 | 162.014 s | 244_000 ms | **240_000 ms** | re-uses the standing par-22 cap row |
| L43 | 24 | 175.820 s | 264_000 ms | **240_000 ms** | re-uses the par-24 cap row named at R-005c (§1.17) |
| L44 / L45 | **26** | 189.626 s | 285_000 ms | **240_000 ms** | **NEW cap-binding row** — `285_000 − 240_000 = +45_000 ms` (**+18.75 %**) |

So the cap now stops the derived form on **four** distinct par values (22, 23, 24, **26**), and it
is *strengthened* rather than silenced: the two most recent exceedances are 15 s (par 24) and 45 s
(par 26). The par-24 row **keeps its name** and gains a successor above it. The envelope's own
re-derivation (its cloud factor, or the cap) stays a **cloud-datum question** — no fresh cloud
round exists at 45 levels — so R-007c **registers the par-26 row and leaves both the cap and the
formula standing**. Every assertion in `refusal.spec.ts` is untouched (wall clock only).

**This ticket's whole-file round, and where the chain row landed.** Running
`playthrough.spec.ts` whole, plain, once on the shipped bytes
(`PS_E2E_PORT=5258`, `--retries=0`, list reporter) → **49 passed / 0 failed in 10.2 m**,
`EXIT=0`. The chain row inside it read **3.8 m** (the list reporter's 0.1-minute rounding ⇒
**225–231 s**), i.e. **13.9–14.3 %** of its 1_617_000 ms envelope — the same band the row has
held since R-004c (R-006c's round read 3.3 m / 195–201 s on the 40-rung walk). The heaviest
per-level rows in that round are the new tail's own — **L43 / L44 / L45 at 12.9 s of 90 s**
(**14.3 %**), with L41 **10.8 s** and L42 **11.9 s** (12.0 % / 13.2 %) — just above the batch-era
**L39 12.6 s** and **L40 12.5 s**, so the /45 tail is the slow end of the ladder by a hair, not by
a step change.

**Throttle arm (necessary, never sufficient).** The same row on the same bytes with
`PS_E2E_CPU_THROTTLE=20` → **1 passed in 563 143 ms = 563.143 s**, i.e. **2.30×** its own plain
walk (`563.143 / 244.875`) and **34.8 %** of the 1_617_000 ms envelope — against R-006c's 40-rung
arm at **≈ 480 s / 2.42× / 34.4 %**. A green there proves the row is not scheduler-fragile; it does
**not** prove the envelope fits a starvation day, because QA-024 measured the cloud at **4.40×**
while rate 20 only reaches ~2.3× locally — the same necessary-not-sufficient law the constant's
own comment states.

**Refusal round, and where the new rungs landed.** `refusal.spec.ts` ran plain, whole file once
on the shipped bytes (`PS_E2E_PORT=5259`, `--retries=0`, list reporter) → **95 passed / 0 failed
in 18.0 m**, `EXIT=0` — **no timeout fired anywhere**, and the cap-bound rows specifically did not. Each rung's
own wall-clock budget is the par-derived `refusalRouteEnvelopeMs(ref.par)`, so L41 lands at
**223 s**, L42 at **240 s**, L43 at **240 s** and L44 / L45 at **240 s**: three of the five rows
ride standing envelopes and the par-26 pair rides the **new** fourth cap row with an order of
magnitude inside the cap. Unlike a dataset growth, **no refusal row was added by hand** — the
per-level freeze rows and the ladder refused-then-entered rows derive from the dataset on disk.

**Inventory arithmetic (why the count moved 264 → 289 without a new row being typed).** The new
rows are **generated off the dataset**, so the dataset's growth is the count's growth:
`playthrough 49 + refusal 95 + latch-door 82 + mobile 12 + star-field 12 + portal-mount 10 +
controls 8 + transient 7 + portal 6 + input-replay 4 + portal-mount.mobile 2 + star-field.mobile 2
= 289` cases in **12** files (`--list`, verbatim: **273 desktop + 16 mobile**). The growth is
arithmetic, not edit count: playthrough 44 → **49** (+5 per-level rows), refusal 85 → **95**
(+5 per-level freeze rows **and** +5 ladder refused-then-entered rows), latch-door 72 → **82**
(+10 = two rows per new latch level, the dataset's derived contiguous tail L6–**L45** now **forty**
latch levels, not thirty-five).

**The booking, a seventh time: `[]`, and this time the two subjects coincide again.** R-007's
byte-parity `git mv` emptied the LV-018 shelf, so at this tip `src/levels/candidates/` holds its
`README.md` and nothing else and the literal is the **empty set** (the pin's seventh reading:
QA-014 `[]` → QA-018 `l021–l025` → QA-026 `l026–l035` → R-005c `[]` → R-005c-b `l036–l040` →
R-006c `[]` → **R-007c `[]`**), re-taken by the directory scan itself rather than asserted from
memory. The successor is **`l046.json`** — absent from the shelf *and* from the root,
`documentedLesson(46)` null — and the root's own absence clause stops at **maxShipped + 1**, so the
two subjects R-005c-b had to hold apart **coincide again**, and no scoping words were needed or
removed. The tail row is deliberately not re-stamped: the frozen **R-005a standard stays 35**
while the R-006a constant and `ACT_II_REGISTERED_IDS.at(-1)` carry **40**, and the Act III
constant carries **45** — a move that re-stamped the pre-registration standard would fail by name
right there.

**Non-vacuity, both directions, re-proved on this 45-rung `[]` reading** (live probes on this
tree, removed again immediately — `git status` after them lists `tests/**` only): the **extra**
direction puts an unbooked file on the shelf — `cp src/levels/l045.json
src/levels/candidates/l046.json` → the booking row reddens **by name** at
`l16-l20-candidates.test.ts:252:19` with `expected [ 'l046.json' ] to deeply equal []`,
`1 failed | 51 passed`; the **absent**
direction — which for an empty booking is the *root* clause rather than a removed member — puts a
file at the root's successor — `cp src/levels/l045.json src/levels/l046.json` → the absence clause
reddens at `:375:7` with `no registered l046.json: the registered dataset stops at the pinned
count`, `1 failed | 51 passed`. Both restored → **52 passed**, the shelf holding `README.md` only
and the root stopping at `l045.json`. So neither half of the pin is decorative: the shelf assertion catches an extra file,
and the clause catches the dataset moving without the pin.

**Source law, stated once.** `git diff 4442d46 -- src docs scripts` is **empty**;
`git status --porcelain` lists `tests/**` only; the throwaway measurement probe and the audit
script were both deleted before the commit. One production string is deliberately **not**
re-pointed and is named rather than touched: the `multi-switch-door` warning's own `L6–L35`
allowance clause is a `src/**` byte, off QA's lane. `tests/solver/**` and `tests/e2e/**` style:
the touched files carry **pre-existing** Prettier debt at the base blob, so R-007c matches the
surrounding style and **names** the debt instead of chasing it (R-005b/R-005c/R-006c precedent).

---

## 2. Inventory — 289 cases in 12 files (measured)

**Dated note (2026-10-16, QA-005h).** The per-ticket blocks in §1 are **historical
snapshots**: the `88/0` rounds, the `88 tests in 8 files` `--list` lines and the per-file
case counts in §1.3–§1.8 were true when those blocks were written and are deliberately
left as they stand. **This section is the only present-tense inventory in this file.**

**Update (2026-10-16, QA-014 — the 20-row migration, and the FIRST browser walk of
L20 ever).** GAME-002 registered LV-011's sealed landing at the dataset root (`l020.json`
+ registry row 20 at `4deeb50`), so `EXPECTED_LEVEL_COUNT` moved **19 → 20** in the same
batch, and the three specs that pin the *ladder* grew with it — 127 → **132 tests in 8
files** (120 desktop + 12 mobile), the tail line of `npx playwright test --list`:
`24 + 32 + 39 + 6 + 8 + 4 + 7 + 12 = 132`. The rows below are that tool's own per-file
counts, read off its output. The whole suite ran green under **zero retries** on the
frozen bytes of this branch (`PS_E2E_PORT=5244 npx playwright test --retries=0`) —
**132 passed / 0 failed / 0 flaky** in **666 s = 11.1 m**, i.e. **inside the 19-row
envelope band** (597.4 s = 10.0 m and 705.3 s = 11.8 m, the two QA-011 rounds) even
though the census grew and the tail is heavier: slow-row sums, in the QA-005g shape,
are refusal 246.8 s, playthrough 168.0 s, latch-door 133.4 s, transient 35.2 s, mobile
34.9 s, controls 24.9 s, portal 14.4 s, input-replay 4.8 s (Σ 662.4 s).

**Three green rounds, and which one is the frozen-bytes evidence.** Round 1 was taken
*before* this batch's own comment insertions, which moved the chain row
`playthrough.spec.ts:156 → :163`; rounds 2 and 3 ran after, on the shipped spec bytes
(`PS_E2E_PORT=5244 npx playwright test --retries=0`, `EXIT=0` each):
**132 passed / 0 failed in 660 s = 11.0 m (round 2) and 636 s = 10.6 m (round 3)**. The
four ladder-growing rows across the three rounds, largest-first:

| row | round 1 | round 2 | round 3 | envelope |
|---|---|---|---|---|
| unlock chain `playthrough.spec.ts:163` | **57.1 s** | 55.3 s | 52.8 s | 360 s (15.9 % worst) |
| L20 refusal (`refusal.spec.ts:48`) | **28.1 s** | 28.1 s | 26.6 s | `refusalRouteEnvelopeMs(20)` = 223 s (12.6 % worst) |
| L20 par walk (`playthrough.spec.ts:79`) | **10.8 s** | 10.2 s | 9.7 s | 90 s (12.0 % worst) |
| L20 latch-door (`latch-door.spec.ts:134`) | 11.6 s | 11.6 s | **12.3 s** | 90 s (13.7 % worst) |
| …L19 latch-door, for the ordering claim | 13.3 s | 12.3 s | 12.9 s | — |

Three green rounds differing by ≤ 4 s on every pinned row, with **L20 < L19 on the latch
row in all three**, is why the numbers below are quoted as observations rather than as a
best case; the **worst leg of each triple** (bold) is the one used in every envelope
comparison, and both reference tables below are still true on it.

**No budget was re-derived for this migration, and the arithmetic is why.** The rung is
the one the derived `refusalRouteEnvelopeMs(par)` was written for (QA-013), so it was
absorbed with **zero re-migration**: `refusalRouteEnvelopeMs(20) = 223 s` against the
measured **L20 refusal row 28.1 s = 12.6 % of budget** — while the flat `90_000` it
replaced would have read 31 % locally and ≈166 s on QA-013's own conservative cloud
factor, i.e. crossed. The other three ladder-growing rows are unchanged and **none
crossed**: the unlock chain (`playthrough.spec.ts:163`) re-measured at **57.1 / 55.3 / 52.8 s
of its 360 s** across the three rounds (15.9 % worst; QA-011's two 19-row rounds were
51.4 s and 56.3 s, so +1 rung costs +0.8…+5.7 s — the route-length delta), the per-level
playthrough row at **L20 10.8 / 10.2 / 9.7 s of 90 s** (12.0 % worst, the par-20 peak), and
the latch-door row at **L20 11.6 / 11.6 / 12.3 s of 90 s** (13.7 % worst) — which is still
*below* L19 in every round (13.3 / 12.3 / 12.9 s), because the
sealed landing's portal-entered
pocket yields a **shorter** occupancy route (measured presses L19 27 → **L20 21**). The
chain stays a **named WATCH ROW** with its constant *held*, not raised: its two
projection models disagree by 2.5× (suite-level 2.7–3.2× ⇒ 154–183 s ✓; row-class 8× ⇒
457 s ✗), so an envelope derived now would be a choice between projections rather than
a fitted observation — the next cloud round is the crossing observation item 77(d)
requires. No default was touched and no constant was silently widened.

**Update (2026-10-17, QA-017 — GAME-003's art+motion acceptance, 132 → 144).** §1.11
added **twelve** e2e cases (`portal-mount.spec.ts` 10 desktop, `portal-mount.mobile.spec.ts`
2 mobile at the R-L6 pitch) and **22** unit cases, so the `--list` arithmetic is now
`24 + 32 + 39 + 6 + 8 + 4 + 7 + 12 + 10 + 2 = 144 tests in 10 files` (132 desktop + 12
mobile), and `npx vitest run` reads **780 passed | 3 skipped (783)** against QA-014's
`758 | 3` — a **+22 only-up** delta that is exactly the new unit file, with no skip added
and no case removed. The round on the shipped bytes is
`PS_E2E_PORT=5246 npx playwright test --retries=0` → **144 passed / 0 failed / 0 flaky in
678 s = 11.3 m**, `EXIT=0`, inside the same band as the three 132-case rounds (636–666 s).
Slow-row sums in the QA-005g shape: refusal 231.2 s, playthrough 160.2 s, latch-door
128.8 s, portal-mount 39.3 s, transient 34.0 s, mobile 31.9 s, controls 24.1 s, portal
13.4 s, portal-mount.mobile 6.2 s, input-replay 4.5 s (Σ 673.6 s); the heaviest single
rows are the unlock chain **55.4 s of its 360 s** and L20 refusal **26.7 s of
`refusalRouteEnvelopeMs(20)` = 223 s**, both *below* QA-014's worst legs — this round ran
on a quieter machine, which is the only reason its 11.3 m reads as like-for-like.

**The load caveat that belongs on the record.** The first full round of this same 144-case
tree took **22.6 m** with **zero reds**, in a window where the solver lane's `tsx` jobs held
load average at 24–26; every file finished and `test-results/` was empty at every poll, so
the overrun was CPU starvation, **not a regression**. The row that degraded most —
`transient.spec.ts`'s P1 — still printed `verdict=resolvable` at `gridMs 41.6`, i.e. shrunk
headroom, no red. **No budget, ceiling, envelope or constant was touched by QA-017.**

**Update (2026-10-17, QA-019 — GAME-004's star field, 144 → 158).** §1.13 added
**fourteen** e2e cases (`star-field.spec.ts` 12 desktop, `star-field.mobile.spec.ts`
2 mobile) and **23** unit cases, so the `--list` arithmetic is now
`24 + 32 + 39 + 6 + 8 + 4 + 7 + 12 + 10 + 2 + 12 + 2 = 158 tests in 12 files`
(144 desktop + 14 mobile), and `npx vitest run` reads **803 passed | 3 skipped (806)**
against QA-017's `780 | 3` — a **+23 only-up** delta that is exactly the two new unit
files, with no skip added and no case removed.

**What this update does *not* carry: a full-suite round.** QA-019's dispatch asked for
**targeted** runs, and they were taken —
`PS_E2E_PORT=5251 npx playwright test tests/e2e/star-field.spec.ts
tests/e2e/star-field.mobile.spec.ts --retries=0` → **14 passed / 0 failed / 0 flaky in
1.0 m**, plus the two standing gates QA-019 could have disturbed,
`portal-mount.spec.ts + portal-mount.mobile.spec.ts` → **11 passed** alongside the
pre-existing A-8 red described in §1.13 (which is why no 158-case round is quoted here:
it would carry that flake, and reporting a red as a green would be the one thing this
section must never do). The per-file counts in the table below are therefore `--list`
counts, as `--list` is written for, and the **green-run evidence for QA-019 is its 14
rows plus the unit battery**, not a suite round. No slow-row sum, no envelope and no
constant was re-derived: the star field's own rows are sub-second and none of them is a
route-length row, so nothing in the 144-case timing record moves.

**Update (2026-10-17, QA-020 — A-8's phase-invariant trio, 158 → 158 cases, +6 unit).**
§1.14 changed **one** row's *schedule* in each portal-mount file (the A-8 stillness row:
`two frames 2 s apart` → `three frames across one goal-pulse period`) and extended A-11's
existing star-field row with the canvas channel, so the `--list` arithmetic is
**unchanged**: `24 + 32 + 39 + 6 + 8 + 4 + 7 + 12 + 10 + 2 + 12 + 2 = 158 tests in 12 files`
(144 desktop + 14 mobile), and `npx vitest run` reads **809 passed | 3 skipped (812)**
against QA-019's `803 | 3` — a **+6 only-up** delta that is exactly the new
`tests/unit/idle-pulse-schedule.test.ts`, with no skip added, no case removed and no
row deleted. `npx tsc --noEmit` → **0**.

**Update (2026-10-17, R-004c — the 25-row pin migration, 158 → 183).** R-004a registered
the Act II batch 1 (`l021`–`l025`, `50e9ac0` / `178d9d8`), so the dataset pin moved
**20 → 25** and the ladder-derived specs grew with it. The `--list` arithmetic is now
`29 + 42 + 49 + 6 + 8 + 4 + 7 + 12 + 10 + 2 + 12 + 2 = 183 tests in 12 files`
(167 desktop + 16 mobile), against QA-020's 158. The whole growth is the five new rungs, and
it is arithmetic rather than edit count: playthrough 24 → **29** (+5 per-level rows),
refusal 39 → **49** (+5 per-level freeze rows **and** +5 ladder refused-then-entered rows),
latch-door 32 → **42** (+10 = two rows per new latch level). Not one ladder row was added by
hand — the per-level rows derive from the dataset on disk and their routes from the solver.
`npx vitest run` reads **860 passed | 3 skipped (863)** with R-004b's registry row stacked
(this branch alone: **851 | 3 (858)**, whose only four reds are the R-004b registry
dependency — §1.15), and `npx tsc --noEmit` → **0**. Targeted rounds: `playthrough.spec.ts`
**29 passed / 0 failed in 4.3 m**, and its chain row **2 × green** (`--retries=0`) at
**1.6–1.8 m of its 360 s** budget, which is **held**, not raised (§1.15).

**Update (2026-10-17, R-004d — the Act II refusal *classes*, 183 → 189).** The five new
rungs' refusal *surface* is now classified as well as counted: **one** census row (no page —
solver-side) asserting the published `refusedThenEnteredTiles = 17` per rung with
`ordered ≡ unordered` (`T ≡ R ≡ 0`), plus the **class partition of every refused press** and
`refusedAtPortalEnds = 0`; and **five** browser rows driving the cheapest reachable
`phase-wall` and `door-without-switch` (F-L20-2) refusals — each freezing the triple state and
then proving the due move still counts — before driving the off-phase portal press, which is a
**legal single step**, not a refusal. The `--list` arithmetic is therefore
`29 + 42 + 55 + 6 + 8 + 4 + 7 + 12 + 10 + 2 + 12 + 2 = 189 tests in 12 files`
(173 desktop + 16 mobile): **refusal 49 → 55** and nothing else moves. Evidence: the whole
`refusal.spec.ts` **55 passed / 0 failed in 8.5 m** (`--retries=0`, one worker) and
`npx vitest run` **860 passed | 3 skipped (863)** — the base, only-up, zero red — with
`npx tsc --noEmit` → **0**. §1.16 carries the class table, both timing rounds and the
cap-binding watch.

**Update (2026-10-19, R-007c — the 40 → 45 pin migration, 264 → 289).** R-007 registered Act
III's opener (`l041`–`l045`) at the dataset root (`src/levels/README.md` §2i), so
`EXPECTED_LEVEL_COUNT` moved **40 → 45** in the same batch and the four ladder-derived specs grew
with it. The `--list` arithmetic is now
`49 + 95 + 82 + 12 + 12 + 10 + 8 + 7 + 6 + 4 + 2 + 2 = 289 tests in 12 files` (**273 desktop +
16 mobile**), against R-006c's 264. The whole growth is the five new rungs, and it is arithmetic
rather than edit count: playthrough 44 → **49** (+5 per-level rows), refusal 85 → **95** (+5
per-level freeze rows **and** +5 ladder refused-then-entered rows), latch-door 72 → **82** (+10 =
two rows per new latch level). Not one ladder row was added by hand — the per-level rows derive
from the dataset on disk and their routes from the solver. `npx vitest run` reads **1041 passed |
3 skipped (1044)**, 37/37 files, **exit 0** — the **33-row red set of the R-007 handoff (§7f)
heals to zero**, and the total row count is *unchanged* at 1044 because every migrated pin
carries data into an existing row rather than adding one. `npx tsc --noEmit` → **0**;
`npm run levels` → **45/45 level files ok · 0 errors · 218 warnings (0 multi-switch-door) ·
RESULT: PASS**. §1.19 carries the migration table, the chain re-derivation and the independent
pin audit.

**The rounds, and what they are evidence for.** The A-8 pair ran **three consecutive
times on the final bytes** (`PS_E2E_PORT=5249 npx playwright test
tests/e2e/portal-mount.spec.ts tests/e2e/portal-mount.mobile.spec.ts --retries=0` →
**12 passed** each, 47.8 / 48.0 / 48.0 s, no retries) with per-run sample counts
**1704/1457/126**, **1687/1501/429** and **1673/1638/965** on the desk pitch (peaks
1704 / 1687 / 1673 against a floor of 115) and **1982/1110/1502**, **1982/1110/1521**,
**1982/1168/1418** at the mobile pitch (peak 1982, floor 145): the numbers move
run-to-run — one round puts a sample at 7 % of the peak, the phase window where the
*old* single difference is exactly 0 — and the assertion holds in all three. The changed
A-11 row's file ran green alongside (`star-field.spec.ts + star-field.mobile.spec.ts`
→ **14 passed**). **No envelope, budget or constant was re-derived**: both rows are
sub-second, neither is a route-length row, and the trio adds ~1.6 s per round to a suite
whose slow rows are the ladder walks.

| file | cases | project | what it pins |
|---|---:|---|---|
| `playthrough.spec.ts` | 49 | desktop | L1–L45 par route → win dialog (one row per shipped level, from the dataset); the HUD phase chip/glyph flips on **every** legal move; the player's tile read back from the canvas equals the solver's goal tile; the **L1→L45** unlock chain through the dialog's own `Next`; out-of-range `?level` falls back to L1; the end panel **contains** the shipped ladder label `L1–L45` and never a stale `L1–L5` |
| `refusal.spec.ts` | 95 | desktop | the **triple freeze** at every refusal the par route walks through: no move, no flip (phase + glyph + chip label), **no position change** (pixel read-back), no history entry, never a win; plus "an opening refusal costs nothing" for every level that has one (now including L16–L45) — each row's wall-clock budget is the par-derived `refusalRouteEnvelopeMs(ref.par)`, so L21–L45 arrived with their own envelopes (par 22, 23 and 24 read the **240 s cap** — the third, par-24, named at R-005c, §1.17; par 18, 19 and 20 land inside the formula at 202 / 212 / 223 s, and R-006c's batch re-used par 22 and 24 so **no new cap row arrived there**, §1.18; **R-007c's par 26 is a fourth cap-binding row** — uncapped 285 s → cap 240 s, `+45_000 ms` / **+18.75 %**, §1.19) and no test edit; **plus (R-004d, §1.16)** the Act II refusal **classes** — one census row (published `refusedThenEnteredTiles = 17` per rung, `T ≡ R ≡ 0`, the class partition of every refused press, `refusedAtPortalEnds = 0`) and one browser row per new rung freezing a `phase-wall` and a `door-without-switch` refusal (then proving the due move still counts) and driving the off-phase portal press, which is an ordinary step |
| `latch-door.spec.ts` | 82 | desktop | R-D1 a closed door refuses entry like a wall; R-D7 a door closed **under** the player strands them legally; the discriminating pair — *same tile, same phase, same direction, opposite verdict* — for all **forty** latch levels (L6–L45, the dataset's derived contiguous tail — the rule, not a typed list), in-core and through the UI |
| `portal.spec.ts` | 6 | desktop | the **portal column is every level from L11's debut to the tail** (the rule; QA-011 retired the typed `[11…15]` literal); M2 crossing at L11: the par route's teleport leg (one press, **non-adjacent** arrival); a portal is active **only** in phase B — the same press, same latch, other phase, is an ordinary step; the HUD spends exactly one move and exactly one flip across the crossing; a phase-A step onto an end that is active *now* does not re-trigger (clause 6); zero console/page errors over the whole walk |
| `controls.spec.ts` | 8 | desktop | undo is a **real inverse** (counter + phase + tile, unwound in order, `Z` ≡ button); restart is a fresh session, not a rewind, and the level is playable again; `Enter` ≡ `Next`; no control flips the phase on its own (ADR-0008 clause 2) |
| `input-replay.spec.ts` | 4 | desktop | TICKET-QA-005-1 (fixed by R-004b): one press/release cycle in one frame window is exactly one move, **two are exactly two** (the regression pin, no `test.fail()` left), the paced helper isolates the rules from the frame window, and a burst spread across frames is applied once per pair |
| `transient.spec.ts` | 7 | desktop | the resampling channel is live; **P1** the 90 ms refusal arc with a **post-hoc** arbiter (QA-005e) whose trigger step comes from the observer's **execution order** (QA-005f: `frameIndex` + `ranAt`, never stamp arithmetic) — the full pixel claim whenever a beat is observed, or a named `RESOLVE-LIMIT` when the recording's own log proves no step could run inside the arc's window, or a loud `BEAT-REQUIRED-ABSENT` when one did and the beat is missing; **P1b** that limit fabricated with a 140 ms/frame stretcher (where the prediction is exact by construction); **P2** the press beat's occlusion proof (timing inequality + pixel-measured geometry) and the bounded arrival transient |
| `mobile.mobile.spec.ts` | 12 | mobile | 56/72 px bars and the board filling the play area between them; whole-CSS-px square cells above the 40 px floor; ≥ 44×44 buttons with ≥ 8 px gaps; tap = move; distant tap = non-input; swipe ≥ 24 px = move on the dominant axis, with the gesture's **delivery and game-clock span asserted before the HUD read** (QA-005f: the span is the difference of the events' recorded frame indices, and their attribution is asserted); the R-T4 delivery shape pinned on a fabricated coarse grid; R-T6 ring never under touch; R-T5 hint at a 280×600 viewport and the swipe fallback; a touch-only win + dialog `Next`; touch undo |
| `portal-mount.spec.ts` | 10 | desktop | §3.1e/§6.6 **A-1…A-10** read off the running page: the manifest the loader read (the A-06 pair, `unresolvedAssetIds() === []`, the strip's own `hidden`), the **served PNGs'** mapped contrast in both directions and both phases (the swap is load-bearing — the suffix convention measures under 3:1 on every ground), the live-vs-dormant figure census (value channel 1.03:1, ink 384 → 1885), B6's arrival transient on the far end, the **real** press transform on the transition's own clock, the win panel's onset/entrance/first-frame hit test, **three samples across one goal-pulse period** of idle stillness inside the goal's own cell (phase-invariant since QA-020, §1.14), the reduced-motion data flip, and the deny-list negatives |
| `portal-mount.mobile.spec.ts` | 2 | mobile | the same A-2 painted-core read and the same phase-invariant A-8 trio at the Pixel-5 DPR-2 pitch, where the **served raster's** own ink is the only honest reference (`cellCss 51.5`, painted core 68,184,207 vs served 69,186,209) |
| `star-field.spec.ts` | 12 | desktop | §5.5/§6.6 **A-11/A-12** read off the running page: the `.ps-stars` row is absent (and the frozen panel strings carry no star glyph) on every pre-win frame and appears only at the win — **and, since QA-020, the board canvas under the field's own box is scanned mid-level for the mark's own ink (`0` of 56000 px within tolerance, closest pixel 132.88 vs a live goal-cell control of 181 gold px)**; exactly three `data-state` slots, with `earned`/`held`/`empty` drawn as the `(run, best)` matrix dictates including the live-line **extension** case; the painted census per phase on the sub-pixel channel against the analytic knockout; the fill-in's data, computed animation, identical start times and observed 120 ms bound with `Next` hit-tested on frame 1; 2 s idle = 0 px; the reduced-motion `--ps-star-scale-from` data flip; SF-1's DOM-vs-canvas claim — whose canvas half is now measured, not named (QA-020) |
| `star-field.mobile.spec.ts` | 2 | mobile | the same field at the Pixel-5 DPR-2.75 raster — declared **76.00 × 20.00 CSS px** with three 20.00 × 20.00 slots, all three states, idle 0 of 11495 px, a real touch tap on `Next`, and the both-phase census on the 2.75× raster (dot reads 4.91 px because its bbox is measured there) |

**Every expectation is derived from production.** Routes, phases, refused
directions, door states, latch fixtures and portal crossings come from `solve()` /
`forEachParRoute()` / `explore()` / `isLegalMove` / `applyMove` / `doorFixtures()` /
`portalFixtures()` (`helpers/levels.ts`), the geometry from the renderer's own
`computeLayout`, and colours from `theme(phase)` tokens. No route, tile, colour or
pixel count is typed into a spec; a level edit that removes a behaviour fails the run
instead of leaving a stale fixture behind. **QA-017's rows obey the same law on the art
side**: the mount facts come from `PLACEHOLDER_SLOTS` / `PLACEHOLDER_TO_ASSET` /
`portalSlotFor` (`theme/assets.ts`) and from the *served bytes* the page's own loader
fetched, the grounds from `theme(phase)` + `isAltCell` (`grid-mapping.ts`), and the
motion numbers from the transition's own `CSSTransition.currentTime` — never from a
typed hex or a screenshot average. **QA-019's rows obey it too, in the strictest place
this suite has yet applied it**: the star counts are not written down but *forced* (a
reversible detour pair found through `isLegalMove`/`applyMove` pads the par route to
`par + k1`/`+ k2`/above, so the runner's own move counter is the arithmetic), the levels
are *selected* (`pickEndPhase`) rather than named, the storage payload is the module's
own shape (`STAR_STORAGE_KEY`/`STAR_SCHEMA`/`STAR_SLOTS`), and every area/geometry claim
is computed from the shipped `hud-styles.ts` constants (`STAR_OUTER_RATIO`,
`STAR_INNER_RATIO`, `STAR_POINTS`, `STAR_KNOCKOUT_SCALE`, `STAR_DOT_PX`) — the census
channel itself had to be changed to sub-pixel coverage because a nearest-reference count
was measurably phase-dependent (§1.13). The **dataset inventories** are derived
too (`datasetIds` / `doorLevelIds` / `discoveredFileIds` / `inventoryViolation`), with
exactly one hand-typed pin left — `EXPECTED_LEVEL_COUNT` (§1.3). **QA-011 retired the
last hand-typed literal beside it**: `portal.spec.ts:91` used to re-baseline the
*portal* inventory as `[11, 12, 13, 14, 15]`; it now asserts the *rule* the dataset
obeys (`levelsWithPortals()` equals every level id from L11 on), which is what the
frozen literal could not see — a portal-free rung at L16+ — and the latches assert the
same shape of rule (the door levels are the dataset's contiguous tail). So the honest
statement is: **one typed count, zero typed inventories.**

---

## 3. The two defects this suite once pinned — both landed (regression record)

Both were reported to their owners by QA (QA does **not** edit `src/**` to make a
test pass) and both were fixed by **R-004b**; the `test.fail()` annotations were
deleted exactly when the fixes landed — the pins could not rot silently, and the
suite now contains **no `test.fail()` anywhere**. What remains in the two spec files
is the regression record: the ship-shape assertions that fail if the defect returns.

### TICKET-QA-005-1 — keyboard events delivered inside one frame window are replayed

**Reproduce (deterministic).** Dispatch two arrow keydown/keyup pairs inside a
single task (one rendered-frame window) → the game applied **five** moves instead
of two. One pair alone is exactly one move. Verified in `input-replay.spec.ts`
(`Expected: 2, Received: 5`).

**Root cause.** Phaser 3 `KeyboardManager.onKeyDown` pushes the DOM event into
`manager.queue` and then emits `MANAGER_PROCESS` **synchronously**; `KeyboardPlugin.update()`
walks that queue **from index 0 every time**, and the queue is only emptied in
`KeyboardManager.postUpdate` (the game's `POST_RENDER`) — one frame later. Both
existing guards are per-*consecutive*-event: the `code + timeStamp + type`
duplicate check never trips on an alternating down/up sequence, and `repeat = key.isDown`
is already cleared by the preceding keyup when the re-walk reaches the keydown.

**Impact.** Two keys (or a key repeat and a second key) landing inside one frame could
apply extra moves. It is also what made this suite's own L8/L5 playthrough walk flake
before `pressDirection` paced it to one press per frame — the flake was *not* a rule
bug.

**Fix (owner: Gameplay Engineer, landed at the call site).** `createKeyActionHandler`
(`src/game/input/key-handler.ts`) holds a `WeakSet<KeyboardEvent>` and consumes the
same event object at most once.

**Regression.** `input-replay.spec.ts` — the two-pairs test is now an
**ordinary passing assertion** (`toBe(2)`), surrounded by three neighbours that must
stay green: one pair = one move; the paced helper; the same burst one frame apart.
The defect cannot come back without turning the file red.

### TICKET-QA-005-2 — the end panel said the prototype ended at L5

`hud.ts` built the last level's dialog body as `L1–L5 cleared · …` — true when the
playable slice was five levels, false once the registry shipped eleven. **Fixed
(R-004b)**: the panel now reads the ladder range from the registry's own list
(`ladderLabelOf`), so it names what actually shipped. **Regression**: the last-level
test asserts `dialogBody` does **not** contain `L1–L5` *and* **contains**
`` `L1–L${EXPECTED_LEVEL_COUNT}` `` (QA-005c MINOR-2), so the cross-module chain —
registry → `ladderLabelOf` → panel copy — is closed end-to-end, and the derivation
from the single pin means the assertion tracks the dataset instead of a stale string.

---

## 4. The transient-frame CONDITIONAL (UA Entry-2) — answered

### The question

The game has exactly two sub-frame-rate events, both defined in the frozen §6.1/§6.2
table: the **§6.5 refusal arc** (deny nudge + deny ring, **90 ms**) and the
**switch press beat** (`switchPressEmphasis` over the `occupied` row, **140 → 220 ms**).
Two capture channels were known dead for them:

* **CDP `Page.captureScreenshot`** — measured at a **~670 ms round trip, independent
  of the clip size**. A 90 ms event cannot be sampled at 1.5 Hz.
* **`canvas.toDataURL()`** — all black: Phaser creates its WebGL context without
  `preserveDrawingBuffer`.

### Verdict, one line

> **Both events are reachable on a real frame grid — `transient.spec.ts` resamples
> them in-page through a test-side `preserveDrawingBuffer`: P1's 90 ms refusal arc is
> measured (109 ms window, centred on the player's cell, settling); P2's press-beat
> *stroke widening* is **physically unobservable by construction** — it is painted
> behind the actor disc for its entire window — and that is proved, not excused.**

### The channel, and why no `src/**` change was needed

`installPixelReadback` (`helpers/game.ts`) runs as an `addInitScript` that wraps
`HTMLCanvasElement.prototype.getContext` and forces `preserveDrawingBuffer: true`
onto the attributes **Phaser itself passes** (`WebGLRenderer` →
`canvas.getContext('webgl', config.contextCreation)`). Test-side only; nothing the
player sees changes. `helpers/capture.ts` then reads the presented frame *in the
page*, inside a `requestAnimationFrame` loop, with `drawImage` + `getImageData`
over a small ROI — **~0.3 ms per frame instead of a 670 ms round trip**.

Only compact per-frame scalars cross the process boundary (raw ROI pixels would be
~3 MB of JSON per capture):

```
{ t, changed, maxDelta, prevChanged, prevMaxDelta, centroid, line }
```

`changed`/`centroid` are measured against the **settled** frame (the last captured
one); `prevChanged` against the **previous** frame. The second one is what turns
"the picture was still before the trigger" into an assertion: a transient by
definition settles into a *different* picture, so the settled-frame diff cannot
answer that question at all.

### The re-runnable protocol (`reportTransient`)

Frozen → moved → stopped, with no knowledge of what the two pictures are:

1. `frozenUntil` — the last frame that is frame-to-frame identical to its predecessor;
2. `onset` — the first frame that differs from its predecessor (the trigger);
3. `settledAt` — the frame the picture stops moving;
4. `gridMs` — the median frame interval, i.e. **the resolution the claim is made at**;
5. `peakPrevChanged` / `peakMaxDelta` — that something actually happened;
6. `centroid` / `line` — *where* it happened.

Measured (QA-005, desktop, DPR 1):

| | P1 — L1, refused `ArrowLeft` | P2 — L8, arrival on the switch cell |
|---|---|---|
| frames in 700 ms | 24 | 25 |
| median frame interval | 16.7 – 31.1 ms (machine-dependent) | 24.9 ms |
| frozen until | 67 ms | 150 ms |
| onset | 105 ms | 186 ms |
| settled at | 214 ms | 329 ms |
| movement window | **109 ms** (documented row: 90 ms) | 143 ms |
| peak frame-to-frame | 2488 px · Δ197 | 4624 px · Δ211 |
| centroid vs ROI centre | (70,72) vs (72,72) → **2 px** | n/a (whole-ROI) |

The P1 test asserts the window against `FLIP_TIMING.deny.dur + 2 × gridMs + 4` — the
documented row plus one frame of quantisation per side. The assertion therefore
*self-calibrates*: a slow machine widens the bound exactly as much as it widens the
measurement, so it can never pass by luck and never fail because a CI box renders at
30 fps.

**QA-005c — the whole protocol is now runner-aware, not just that one bound.** The
cloud run measured the two remaining local constants bankrupt on a 2-core software-GL
runner (`frames > 15` received **6**, and `gridMs < 60` against ~125 ms frames): the
guards failed their own premise rather than catching a defect. Both tests now
**measure the machine's idle frame grid first** (`measureFrameGrid`) and derive from
it — the recorder window is `max(700 ms, 24 × idle)`, the `gridMs` ceiling is
`max(60 ms, 2 × idle)` — with a separate `idle < 335 ms` check, so a "runner" that only
screenshots is still failed. The teeth survive: `frames > 15` is satisfied because the
window spans ≥ ~24 of the *runner's own* frames on any machine, the `gridMs` claim
still means "a rAF grid, not a 670 ms round trip", the beat-coverage band widens by
one *measured* frame, and the pixel claims (peak change, centred centroid, occlusion)
never depended on wall clock at all.

### P2 — the written unreachable verdict, with its proof

The press beat is real, one-shot, and **always** painted under the player:

* **the beat exists only on the tile the player enters.** `registry.ts` applies
  `switchPressEmphasis(occupied)` only when `toggled` — i.e. when this very move
  toggled the switch, which `applyMove` step 3 does on *entry*. Entering the tile
  means occupying it.
* **the timing table already excludes every other moment.** `hop` = 0 → 130 ms,
  `occupied` = 140 → 220 ms for the shipped Variant S, so `emphasis > 0 ⟺ t ∈ (140, 220]`
  and the actor has been drawn *at the tile centre* for the whole emphasis window
  (`transient.spec.ts` asserts `occupied.start ≥ hop.start + hop.dur`).
* **the geometry puts the box inside the body.** The actor is an opaque disc of
  diameter `0.70 × cell`, painted last, above every L4 layer. The switch box is
  `0.40 × cell` a side, so its furthest inked point from the tile centre is
  `0.20√2 × cell + stroke/2 ≈ 0.283 × cell + 1.5 px`, strictly inside `0.35 × cell`
  at every shipped cell size (≥ 82 device px). Verified from **pixels**, not from
  constants: the spec measures the actor's radius off the running canvas and compares
  it with `switchParts(rect, cell, renderScale, emphasis = 1)`.

Confirming pixel evidence: on the occupied switch tile the centre scanline across
the box is **uniform actor body** — no `obj.switch` ink anywhere in the box's
footprint — and the whole-cell diff reports the cell as the actor. A canvas
assertion of "the stroke is 3 px wide during the beat" would be a false promise;
this file says so and proves why.

The suite therefore still pins the beat's *existence and timing* (the arrival
transient on the switch cell: onset → settled within the §6.1 budget, the `occupied`
row sampled at least once) while refusing to claim a stroke-width pixel channel that
cannot exist. The painter-level claim (`switchPressEmphasis(0) = 0`,
`switchPressEmphasis(1) = 1`, `strokeWidth` 2 → 3 CSS px) belongs to unit tests, and
`tests/unit/renderer-switch-portal-painters.test.ts` already owns it — QA-005 did not
add a vitest file, because the ticket requires the vitest baseline (22 / 408 / 3) to
stay byte-for-byte identical.

---

## 5. CI shape — recommendation (`.github/workflows/ci.yml` is not QA's to edit)

The current workflow is: checkout → `npm ci` → `npm run typecheck` → `npx vitest run`
→ `npm run levels` → `npm run build`. Every step is a **program assertion** and none
needs a credential, so the workflow is already the right shape; nothing in it uploads
or prints anything secret-shaped, and nothing must be added that does.

Recommended addition — **one job, not a gate on the unit job**:

```yaml
  e2e:
    runs-on: ubuntu-latest
    needs: verify                     # only after the unit + level gates pass
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "24", cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test   # its own vite on :5198, both projects; zero retries (v2 law)
```

Rationale, in the repo's own priority order:

* **It is a separate job so it cannot block the unit gate.** `needs: verify` keeps
  ordering, and the suite's own isolation means a Playwright regression is reported
  as a browser failure, never as "the tests are broken".
* **Chromium only.** That is what the suite runs on and what the game targets here;
  the touch claims use CDP (`Input.dispatchTouchEvent`) and are chromium-specific by
  construction, which `swipeTouch`'s doc-comment states.
* **`--with-deps`** because the runner has no browser; `--strictPort` on :5198 makes
  a port clash loud rather than a silent reuse — and `reuseExistingServer: false`
  (QA-005c, §1.3) makes it loud on the runner too.
* **`retries` — retired; cloud and local are one zero-retry law (v2).** QA-005
  recommended *no* retries, because a retry hides exactly the timing-dependent class
  of bug this suite exists to expose, and because the two `test.fail()` pins were
  deterministic (they are gone now — both defects landed, §3). The **v1 ruling**
  (project-status items 57/63, the "FLAKY-named rule") ran CI with `--retries=1`,
  and treated a flake that survived its retry as a **named** failure, not noise —
  that is how the QA-005c flake was handled (`refusal.spec.ts:48` and
  `latch-door.spec.ts:122` named, reproduced frame-by-frame, fixed in
  `expectActorAt`, re-pinned by the suite itself). **That flag is retired**
  (2026-10-16, INFRA-001 — merged `8ef18de`): the config already carried hard
  `retries: 0`, and after **seven consecutive green cloud rounds** the measurement
  — not the tally — closed the v1 exit clause, so the CI job now runs bare
  `npx playwright test` and cloud == local. A transient is a named red ticket,
  never a silent FLAKY pardon.
* **No artifacts needed** — `trace: "retain-on-failure"` is already set, so a failing
  run keeps a trace without a separate upload step; add `actions/upload-artifact` only
  if trace debugging becomes routine.

### The measured CI envelope (QA-005c)

The e2e job on the chain tip ran **86 tests in 16.9 min** on the 2-core
software-GL runner (`--retries=1`) against **~3.3 min** locally — a ~4–5× slowdown
that changes what a *wall-clock* budget has to be, while leaving every assertion
intact. Two consequences are now in the suite, and both are budgets, not weakened
claims:

* **Long walks carry a documented per-test budget.** The unlock chain (11 levels,
  11 HUD reads, 10 `Next` clicks) measured 30.9 s against the 30 s default and now
  carries 120 s; the per-level refusal walk carries 90 s (CI measured L3/L4/L9 at
  30.8 s). Neither is an assertion — a hang still fails, just later.
* **Frame-rate-sensitive measurements measure the runner first.** `transient.spec.ts`
  calibrates its recorder window and its `gridMs` ceiling from the machine's own idle
  frame grid (§1.3), so "the recorder really ran" and "this is a rAF grid, not a
  670 ms screenshot" stay meaningful at ~8 fps.

---

## 6. Archived evidence — the RV-006 differential mutation battery

RV-006's discipline is: *a metric is only trustworthy if it can be killed*. A
**mutation battery** was run against the analysis pipeline — 12 semantic mutations of
the shipped solver/analysis code (`M1`–`M12`), each patched in turn, with the full
vitest suite as the oracle. All 12 were **killed** (KILLED = at least one suite test
fails; the mutation is not equivalent to the shipped code).

| # | mutation | failures in the suite | killed by |
|---|---|---:|---|
| M1 | memo key drops the latch | 9 | solver cache/latch tests |
| M2 | off-by-one `remaining` | 43 | route-budget + optimality |
| M3 | budget ignores lookahead | 1 | **`route-budget.test.ts` cost pin only** |
| M4 | silent truncation | 4 | **`route-budget.test.ts` cost pin only** |
| M5 | `B` computed as `bRaw` | 12 | difficulty metrics |
| M6 | `T` computed as `maxDepth` | 11 | difficulty metrics |
| M7 | `ordered` treated as unordered | 6 | ordered-companion |
| M8 | `ordered` reversed direction | 6 | ordered-companion |
| M9 | n-13 check removed | 2 | route-budget |
| M10 | UNSAT guard diluted | 1 | policy negative controls |
| M11 | walk refusal as wait-edge | 15 | latch-gates + dynamism |
| M12 | lookahead refusal as wait-edge | 14 | latch-gates + dynamism |

**12/12 KILLED.**

Two lessons that are load-bearing for anyone extending the suite:

* **NOTE-3 — a costlier answer is not a wrong answer.** M3 and M4 change *how much
  work* the analysis does, not *what it returns*, so only the pins that **read the
  counters** (`route-budget.test.ts`) can see them — one and four failures out of 306
  tests. Delete those pins and two mutations become silent. Any future "is the
  pipeline still honest?" question has to include at least one cost-reading
  assertion, not just correctness assertions.
* **NOTE-4 — relative equivalence needs an absolute anchor.** RV-006's own
  `scripts/rv006-equivalence.ts` compares the shipped pipeline against an exhaustive
  reference *relatively*; under M12 it printed
  `RV006-EQUIV boards=1284 parChecks=3852 failures=0` — a clean bill of health for a
  mutation the suite kills 14 times. A harness that only asks "do these two agree?"
  cannot see a change that moves **both** sides. Pin the absolute number somewhere,
  or the equivalence harness is not evidence.

---

## 7. Non-goals, and how to extend this suite

* **No pixel verdict is ever model-facing.** Every colour comparison is against a
  `theme(phase)` token, every count is a program assertion; the suite contains no
  "looks right" step.
* **No production change to make a test pass.** If a rule looks wrong, the finding is
  a ticket with the reproduce → root cause → fix → regression trail written down
  (`§3`), and a `test.fail()` pin *while the owner works on it* — a pin is deleted
  the moment the fix lands, so the suite currently carries none. QA may not weaken an
  assertion to hide a finding either: a flake is root-caused (QA-005c's `expectActorAt`
  poll), and a slowed runner gets an explicit **wall-clock budget**, never a relaxed
  claim.
* **No reduced-motion emulation.** The transient protocol needs the flip arcs and the
  press beat to be visible; `Playwright`'s `reducedMotion` is deliberately not set, and
  `FLIP_TIMING.reduced` (`total: 60`) is not what these tests measure.
* **Adding a level** needs no test edit *for the behaviour claims*: every par route,
  every refusal, every latch fixture and every portal crossing is recomputed from the
  shipped files. The dataset **inventories** are derived as well since QA-005c
  (`datasetIds` / `doorLevelIds` / `inventoryViolation`), so the only deliberate edit
  an unlock needs is **one number**: `EXPECTED_LEVEL_COUNT` in `helpers/levels.ts`.
  L11 proved why the pin stays: a dataset that re-derived itself would silently turn a
  missing level into a green suite. The alarm is pinned in both directions by
  `tests/unit/level-inventory-derivation.test.ts` (add / remove / renumber a file in a
  scratch copy and the gate fires).
* **A new object class** (a shipped portal, say) belongs in `tests/unit/**` for its
  painter and here only for the rule-level consequence a player can observe. Portals
  ship at **L11** since R-003, and `portal.spec.ts` pins exactly that rule-level
  surface — the crossing, the phase gate, the flip cadence and the error channels —
  while the swirl/echo painting stays in
  `tests/unit/renderer-registry-layers.test.ts` and `renderer-switch-portal-painters.test.ts`.
**Orchestrator full-round census (this machine, quiet, zero retries — appended by the
Orchestrator's mechanical closeout, not by the ticket):** shipped config (`retain-on-failure`):
`qa005e-full-2b.log` **88/0**, `qa005e-quiet-2.log` **88/0**; four other rounds showed ONLY
`ENOENT` artifact-rotation failures (12 failure errors across them, ZERO assertion-class —
grep-verified) on VICTIM-SHUFFLING tests, which the `--trace=off` control pair proved to be
this machine's trace-staging GC (evidence `qa005e-toff1/2.log`: **88/0 ×2 consecutive, 3.0 m**,
40 % faster — the artifact churn was also slowing the suite). Protocol owned by the Orchestrator:
two of those rounds were my OWN concurrency error (the ticket's detached battery overlapped mine
in one `test-results` directory); the preflight process-guard added mid-task is now standing
protocol. The cloud (ubuntu, shipped config, PR #1: 88/0) remains the arbiter — CI verdict
PENDING-CI until this PR runs.

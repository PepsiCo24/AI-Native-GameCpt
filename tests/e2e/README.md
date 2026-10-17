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

**What this ticket does not claim.** (a) The "never during play" clause is asserted on the
**DOM** (no `.ps-stars`, no `data-state`, nothing in `.ps-top`, and the frozen strings
carry no star glyph) — the canvas is not scanned for a star-shaped ink cloud, so a
renderer that *drew* one would not fail these rows; named as a gap. (b) No verdict on how
the field *looks* (Asset Gate + UI/Art authority), and no claim that stars make the game
more fun. (c) No full-suite round was taken for this ticket — the dispatch asked for
targeted runs; the 14 new rows ran green in **1.0 m / 0 retries** (`PS_E2E_PORT=5251
npx playwright test tests/e2e/star-field.spec.ts tests/e2e/star-field.mobile.spec.ts
--retries=0` → `14 passed`).

---

## 2. Inventory — 158 cases in 12 files (measured)

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

| file | cases | project | what it pins |
|---|---:|---|---|
| `playthrough.spec.ts` | 24 | desktop | L1–L20 par route → win dialog (one row per shipped level, from the dataset); the HUD phase chip/glyph flips on **every** legal move; the player's tile read back from the canvas equals the solver's goal tile; the **L1→L20** unlock chain through the dialog's own `Next`; out-of-range `?level` falls back to L1; the end panel **contains** the shipped ladder label `L1–L20` and never a stale `L1–L5` |
| `refusal.spec.ts` | 39 | desktop | the **triple freeze** at every refusal the par route walks through: no move, no flip (phase + glyph + chip label), **no position change** (pixel read-back), no history entry, never a win; plus "an opening refusal costs nothing" for every level that has one (now including L16–L20) — each row's wall-clock budget is the par-derived `refusalRouteEnvelopeMs(ref.par)`, so L20 arrived with its own 223 s envelope and no test edit |
| `latch-door.spec.ts` | 32 | desktop | R-D1 a closed door refuses entry like a wall; R-D7 a door closed **under** the player strands them legally; the discriminating pair — *same tile, same phase, same direction, opposite verdict* — for all **fifteen** latch levels (L6–L20, the dataset's derived contiguous tail — the rule, not a typed list), in-core and through the UI |
| `portal.spec.ts` | 6 | desktop | the **portal column is every level from L11's debut to the tail** (the rule; QA-011 retired the typed `[11…15]` literal); M2 crossing at L11: the par route's teleport leg (one press, **non-adjacent** arrival); a portal is active **only** in phase B — the same press, same latch, other phase, is an ordinary step; the HUD spends exactly one move and exactly one flip across the crossing; a phase-A step onto an end that is active *now* does not re-trigger (clause 6); zero console/page errors over the whole walk |
| `controls.spec.ts` | 8 | desktop | undo is a **real inverse** (counter + phase + tile, unwound in order, `Z` ≡ button); restart is a fresh session, not a rewind, and the level is playable again; `Enter` ≡ `Next`; no control flips the phase on its own (ADR-0008 clause 2) |
| `input-replay.spec.ts` | 4 | desktop | TICKET-QA-005-1 (fixed by R-004b): one press/release cycle in one frame window is exactly one move, **two are exactly two** (the regression pin, no `test.fail()` left), the paced helper isolates the rules from the frame window, and a burst spread across frames is applied once per pair |
| `transient.spec.ts` | 7 | desktop | the resampling channel is live; **P1** the 90 ms refusal arc with a **post-hoc** arbiter (QA-005e) whose trigger step comes from the observer's **execution order** (QA-005f: `frameIndex` + `ranAt`, never stamp arithmetic) — the full pixel claim whenever a beat is observed, or a named `RESOLVE-LIMIT` when the recording's own log proves no step could run inside the arc's window, or a loud `BEAT-REQUIRED-ABSENT` when one did and the beat is missing; **P1b** that limit fabricated with a 140 ms/frame stretcher (where the prediction is exact by construction); **P2** the press beat's occlusion proof (timing inequality + pixel-measured geometry) and the bounded arrival transient |
| `mobile.mobile.spec.ts` | 12 | mobile | 56/72 px bars and the board filling the play area between them; whole-CSS-px square cells above the 40 px floor; ≥ 44×44 buttons with ≥ 8 px gaps; tap = move; distant tap = non-input; swipe ≥ 24 px = move on the dominant axis, with the gesture's **delivery and game-clock span asserted before the HUD read** (QA-005f: the span is the difference of the events' recorded frame indices, and their attribution is asserted); the R-T4 delivery shape pinned on a fabricated coarse grid; R-T6 ring never under touch; R-T5 hint at a 280×600 viewport and the swipe fallback; a touch-only win + dialog `Next`; touch undo |
| `portal-mount.spec.ts` | 10 | desktop | §3.1e/§6.6 **A-1…A-10** read off the running page: the manifest the loader read (the A-06 pair, `unresolvedAssetIds() === []`, the strip's own `hidden`), the **served PNGs'** mapped contrast in both directions and both phases (the swap is load-bearing — the suffix convention measures under 3:1 on every ground), the live-vs-dormant figure census (value channel 1.03:1, ink 384 → 1885), B6's arrival transient on the far end, the **real** press transform on the transition's own clock, the win panel's onset/entrance/first-frame hit test, 2 s idle stillness inside the goal's own cell, the reduced-motion data flip, and the deny-list negatives |
| `portal-mount.mobile.spec.ts` | 2 | mobile | the same A-2 painted-core read and A-8 stillness at the Pixel-5 DPR-2 pitch, where the **served raster's** own ink is the only honest reference (`cellCss 51.5`, painted core 68,184,207 vs served 69,186,209) |
| `star-field.spec.ts` | 12 | desktop | §5.5/§6.6 **A-11/A-12** read off the running page: the `.ps-stars` row is absent (and the frozen panel strings carry no star glyph) on every pre-win frame and appears only at the win; exactly three `data-state` slots, with `earned`/`held`/`empty` drawn as the `(run, best)` matrix dictates including the live-line **extension** case; the painted census per phase on the sub-pixel channel against the analytic knockout; the fill-in's data, computed animation, identical start times and observed 120 ms bound with `Next` hit-tested on frame 1; 2 s idle = 0 px; the reduced-motion `--ps-star-scale-from` data flip; SF-1's DOM-vs-canvas claim |
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

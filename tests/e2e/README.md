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
lottery. The whole suite is ~3.5 minutes.

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
`+1` file → alarm (count), `−1` file → alarm (count), `l011 → l099` at the same count
→ alarm (contiguity). The latch inventory keeps the design rule the old `[6..11]`
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
| `refusal.spec.ts:48` (all params, on loaded machines) | the `cells: []` single-instant probe | the bounded poll above |
| `transient.spec.ts:116` / `:257` (`frames > 15`, `gridMs < 60`) | local-calibrated constants | runner-aware: the idle frame grid is **measured first**, the recorder window is sized from it, and the `gridMs` ceiling is `max(60, 2 × idle)` |
| `mobile.mobile.spec.ts:207` R-T4, `Expected: 1, Received: 0` | gesture commit vs HUD read | cached CDP session + a frame after `touchEnd` + the bounded `expectMoves` poll |

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
| `npx playwright test` | **86 passed · 0 failed, zero retries**, × 3 consecutive runs |
| targeted repeats | `latch-door` L6/L10 10× and `refusal` L3 10× — 10/10 each |
| `npm run build` | ✓ built (chunk-size warning only) |

### 1.4 What QA-005c did **not** do

CI could not be re-run from this lane (no push authority). The cloud-shaped fixes
above are built from the measured CI roster (wall-clock timeouts, the `cells: []`
mechanism, local-calibrated constants, gesture commit) and proved locally; the next
CI run on `develop` is the confirmation, and the orchestrator's item 66 roster is the
baseline to compare against.

---

## 2. Inventory — 86 cases

| file | cases | project | what it pins |
|---|---:|---|---|
| `playthrough.spec.ts` | 15 | desktop | L1–L11 par route → win dialog; the HUD phase chip/glyph flips on **every** legal move; the player's tile read back from the canvas equals the solver's goal tile; the L1→L11 unlock chain through the dialog's own `Next`; out-of-range `?level` falls back to L1; the end panel **contains** the shipped ladder label `L1–L11` |
| `refusal.spec.ts` | 22 | desktop | the **triple freeze** at every refusal the par route walks through: no move, no flip (phase + glyph + chip label), **no position change** (pixel read-back), no history entry, never a win; plus "an opening refusal costs nothing" for every level that has one |
| `latch-door.spec.ts` | 14 | desktop | R-D1 a closed door refuses entry like a wall; R-D7 a door closed **under** the player strands them legally; the discriminating pair — *same tile, same phase, same direction, opposite verdict* — for all six latch levels, in-core and through the UI |
| `portal.spec.ts` | 6 | desktop | M2 crossing at L11: the par route's teleport leg (one press, **non-adjacent** arrival); a portal is active **only** in phase B — the same press, same latch, other phase, is an ordinary step; the HUD spends exactly one move and exactly one flip across the crossing; a phase-A step onto an end that is active *now* does not re-trigger (clause 6); zero console/page errors over the whole walk |
| `controls.spec.ts` | 8 | desktop | undo is a **real inverse** (counter + phase + tile, unwound in order, `Z` ≡ button); restart is a fresh session, not a rewind, and the level is playable again; `Enter` ≡ `Next`; no control flips the phase on its own (ADR-0008 clause 2) |
| `input-replay.spec.ts` | 4 | desktop | TICKET-QA-005-1 (fixed by R-004b): one press/release cycle in one frame window is exactly one move, **two are exactly two** (the regression pin, no `test.fail()` left), the paced helper isolates the rules from the frame window, and a burst spread across frames is applied once per pair |
| `transient.spec.ts` | 6 | desktop | the resampling channel is live; **P1** the 90 ms refusal arc; **P2** the press beat's occlusion proof (timing inequality + pixel-measured geometry) and the bounded arrival transient |
| `mobile.mobile.spec.ts` | 11 | mobile | 56/72 px bars and the board filling the play area between them; whole-CSS-px square cells above the 40 px floor; ≥ 44×44 buttons with ≥ 8 px gaps; tap = move; distant tap = non-input; swipe ≥ 24 px = move on the dominant axis; R-T6 ring never under touch; R-T5 hint at a 280×600 viewport and the swipe fallback; a touch-only win + dialog `Next`; touch undo |

**Every expectation is derived from production.** Routes, phases, refused
directions, door states, latch fixtures and portal crossings come from `solve()` /
`forEachParRoute()` / `explore()` / `isLegalMove` / `applyMove` / `doorFixtures()` /
`portalFixtures()` (`helpers/levels.ts`), the geometry from the renderer's own
`computeLayout`, and colours from `theme(phase)` tokens. No route, tile, colour or
pixel count is typed into a spec; a level edit that removes a behaviour fails the run
instead of leaving a stale fixture behind. The **dataset inventories** are derived
too (`datasetIds` / `doorLevelIds` / `discoveredFileIds` / `inventoryViolation`), with
exactly one hand-typed pin left — `EXPECTED_LEVEL_COUNT` (§1.3).

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
      - run: npx playwright test --retries=1   # its own vite on :5198, both projects
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
* **`retries` — the recommendation was overruled, and this is the record.** QA-005
  recommended *no* retries, because a retry hides exactly the timing-dependent class
  of bug this suite exists to expose, and because the two `test.fail()` pins were
  deterministic (they are gone now — both defects landed, §3). The standing ruling
  (project-status items 57/63, the "FLAKY-named rule") is instead: CI runs
  `--retries=1`, but a flake that survives its retry is treated as a **named
  failure**, not noise — it must be reduced to a named site, root-caused, fixed and
  regression-pinned before the milestone. That is exactly how the QA-005c flake was
  handled: `refusal.spec.ts:48` and `latch-door.spec.ts:122` were named, reproduced
  frame-by-frame, fixed in `expectActorAt`, and re-pinned by the suite itself. A
  retry is therefore tolerated as a *signal*, never as a way to make a run green.
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
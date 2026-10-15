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

---

## 2. Inventory — 75 cases

| file | cases | project | what it pins |
|---|---:|---|---|
| `playthrough.spec.ts` | 14 | desktop | L1–L10 par route → win dialog; the HUD phase chip/glyph flips on **every** legal move; the player's tile read back from the canvas equals the solver's goal tile; the L1→L10 unlock chain through the dialog's own `Next`; out-of-range `?level` falls back to L1; **`test.fail()` pin** for the stale end-panel copy |
| `refusal.spec.ts` | 20 | desktop | the **triple freeze** at every refusal the par route walks through: no move, no flip (phase + glyph + chip label), **no position change** (pixel read-back), no history entry, never a win; plus "an opening refusal costs nothing" for every level that has one |
| `latch-door.spec.ts` | 12 | desktop | R-D1 a closed door refuses entry like a wall; R-D7 a door closed **under** the player strands them legally; the discriminating pair — *same tile, same phase, same direction, opposite verdict* — for all five latch levels, in-core and through the UI |
| `controls.spec.ts` | 8 | desktop | undo is a **real inverse** (counter + phase + tile, unwound in order, `Z` ≡ button); restart is a fresh session, not a rewind, and the level is playable again; `Enter` ≡ `Next`; no control flips the phase on its own (ADR-0008 clause 2) |
| `transient.spec.ts` | 6 | desktop | the resampling channel is live; **P1** the 90 ms refusal arc; **P2** the press beat's occlusion proof (timing inequality + pixel-measured geometry) and the bounded arrival transient |
| `mobile.mobile.spec.ts` | 11 | mobile | 56/72 px bars and the board filling the play area between them; whole-CSS-px square cells above the 40 px floor; ≥ 44×44 buttons with ≥ 8 px gaps; tap = move; distant tap = non-input; swipe ≥ 24 px = move on the dominant axis; R-T6 ring never under touch; R-T5 hint at a 280×600 viewport and the swipe fallback; a touch-only win + dialog `Next`; touch undo |

**Every expectation is derived from production.** Routes, phases, refused
directions, door states and latch fixtures come from `solve()` /
`forEachParRoute()` / `explore()` / `isLegalMove` / `applyMove` / `doorFixtures()`
(`helpers/levels.ts`), the geometry from the renderer's own `computeLayout`, and
colours from `theme(phase)` tokens. No route, tile, colour or pixel count is typed
into a spec; a level edit that removes a behaviour fails the run instead of leaving
a stale fixture behind.

---

## 3. The two known defects this suite pins (micro-tickets, not fixes)

Both are reported to their owners. QA does **not** edit `src/**` to make a test
pass; a `test.fail()` pin asserts the *correct* behaviour, so when the owner lands
the fix the pin starts failing with "expected to fail but passed" and must be
removed. Neither can rot silently.

### TICKET-QA-005-1 — keyboard events delivered inside one frame window are replayed

**Reproduce (deterministic).** Dispatch two arrow keydown/keyup pairs inside a
single task (one rendered-frame window) → the game applies **five** moves instead
of two. One pair alone is exactly one move. Verified in `input-replay.spec.ts`
(`Expected: 2, Received: 5`).

**Root cause.** Phaser 3 `KeyboardManager.onKeyDown` pushes the DOM event into
`manager.queue` and then emits `MANAGER_PROCESS` **synchronously**; `KeyboardPlugin.update()`
walks that queue **from index 0 every time**, and the queue is only emptied in
`KeyboardManager.postUpdate` (the game's `POST_RENDER`) — one frame later. Both
existing guards are per-*consecutive*-event: the `code + timeStamp + type`
duplicate check never trips on an alternating down/up sequence, and `repeat = key.isDown`
is already cleared by the preceding keyup when the re-walk reaches the keydown.

**Impact.** Two keys (or a key repeat and a second key) landing inside one frame can
apply extra moves. It is also what made this suite's own L8/L5 playthrough walk flake
before `pressDirection` paced it to one press per frame — the flake was *not* a rule
bug.

**Fix (owner: Gameplay Engineer, at the call site).** Phaser re-emits the same event
object, so `attachInput`'s handler can dedupe on identity:

```ts
const handled = new WeakSet<KeyboardEvent>();
const onKeyDown = (event: KeyboardEvent): void => {
  if (handled.has(event)) return;
  handled.add(event);
  …
};
```

**Regression.** `input-replay.spec.ts` — the failing pin plus three passing
neighbours (one pair = one move; the paced helper; the same burst one frame apart),
so the pin cannot be "fixed" by breaking the ordinary path.

### TICKET-QA-005-2 — the end panel still says the prototype ends at L5

`hud.ts` builds the last level's dialog body as `L1–L5 cleared · L 10: moves 9`.
That was true when the playable slice was five levels; the registry now ships ten.
Pinned in `playthrough.spec.ts` (`expect(won.dialogBody).not.toContain("L1–L5")`).
Owner: the HUD writer (UI/Art spec authority, Gameplay implementation).

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
      - run: npx playwright test    # its own vite on :5198, both projects
```

Rationale, in the repo's own priority order:

* **It is a separate job so it cannot block the unit gate.** `needs: verify` keeps
  ordering, and the suite's own isolation means a Playwright regression is reported
  as a browser failure, never as "the tests are broken".
* **Chromium only.** That is what the suite runs on and what the game targets here;
  the touch claims use CDP (`Input.dispatchTouchEvent`) and are chromium-specific by
  construction, which `swipeTouch`'s doc-comment states.
* **`--with-deps`** because the runner has no browser; `--strictPort` on :5198 makes
  a port clash loud rather than a silent reuse.
* **Do not add `retries` for CI.** A retry hides exactly the timing-dependent class of
  bug this suite exists to expose. The two `test.fail()` pins fail *deterministically*
  and are counted as expected failures, so they do not colour the CI result.
* **No artifacts needed** — `trace: "retain-on-failure"` is already set, so a failing
  run keeps a trace without a separate upload step; add `actions/upload-artifact` only
  if trace debugging becomes routine.

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
  a ticket and a `test.fail()` pin — with the reproduce → root cause → fix →
  regression trail written down (`§3`).
* **No reduced-motion emulation.** The transient protocol needs the flip arcs and the
  press beat to be visible; `Playwright`'s `reducedMotion` is deliberately not set, and
  `FLIP_TIMING.reduced` (`total: 60`) is not what these tests measure.
* **Adding a level** needs no test edit: the dataset count, every par route, every
  refusal and every latch fixture are recomputed from the shipped files. Adding a
  *door level* outside L6–L10 will fail `latch-door.spec.ts`'s "the latch levels are
  exactly the levels that ship doors" test on purpose — that assertion is the
  dataset's own inventory, and it should be updated deliberately.
* **A new object class** (a shipped portal, say) belongs in `tests/unit/**` for its
  painter and here only for the rule-level consequence a player can observe. Portals
  currently ship in no level, so this suite says nothing about them rather than
  inventing a level to test.
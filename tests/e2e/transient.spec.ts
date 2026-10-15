/**
 * Standing e2e — **the transient-frame capture protocol** (QA-005; the UA
 * Entry-2 CONDITIONAL adjudication).
 *
 * ── The question ─────────────────────────────────────────────────────────────
 * This game has exactly two sub-frame-rate visual events, and both are defined in
 * the frozen §6.1/§6.2 timing table:
 *
 * | transient | row | length |
 * |---|---|---|
 * | §6.5 refusal arc (deny nudge + deny ring) | `deny` | **90 ms** |
 * | §6.2 switch press beat (`switchPressEmphasis`) | `occupied` | **80 ms** (140 → 220) |
 *
 * The obvious capture channels are both dead for them:
 *
 * - **CDP `Page.captureScreenshot`** — a ~670 ms round trip *independent of the
 *   clip size*, so it cannot sample a 90 ms event at all;
 * - **`canvas.toDataURL()` on the WebGL buffer** — all black, because Phaser
 *   creates its context without `preserveDrawingBuffer`.
 *
 * ── The answer: yes, they are reachable — with an in-page resampler ──────────
 * The suite installs `installPixelReadback` (`addInitScript` wrapping
 * `HTMLCanvasElement.prototype.getContext` and forcing `preserveDrawingBuffer` on
 * the attributes Phaser itself passes — **no `src/**` change**), then reads the
 * presented frame *inside the page* in a `requestAnimationFrame` loop, with
 * `drawImage` + `getImageData` over a small region of interest. That is ~0.3 ms
 * per frame instead of a 670 ms round trip, so the 60 Hz frame grid survives.
 *
 * The protocol is **re-runnable and self-checking**: it asserts the frame grid it
 * achieved (median frame interval), that the picture was frozen before the
 * trigger, that it moved, and that it stopped — all frame-to-frame, i.e. on a
 * channel that never needs to know what the two pictures *are*. Raw pixels never
 * leave the page; only compact per-frame scalars do.
 *
 * ── The one thing the channel cannot show, and why that is a proof ───────────
 * The switch press beat is **physically unreachable on the canvas**, and this file
 * proves it rather than hand-waving it:
 *
 * - the emphasis is `sin(πp)` over `occupied` = 140 → 220 ms, so `emphasis > 0`
 *   ⟺ `t ∈ (140, 220]`;
 * - the hop (`hop.start = 0`, `hop.dur = 130`) is already over by then, so for the
 *   whole emphasis window the actor is drawn *at the tile centre*;
 * - the actor is an opaque disc of diameter `0.70 × cell` (L5, above every L4
 *   layer, body painted last), while the switch box is `0.40 × cell` on a side —
 *   its furthest corner from the tile centre is `0.283 × cell` away, plus half the
 *   widest stroke. `0.283 + stroke/cell < 0.35` at every shipped cell size, so the
 *   disc **strictly contains** the box and its 3 px stroke.
 *
 * The beat is therefore a *real* one-shot animation of a graphic that is always
 * behind the player. `switch.spec`-level claims about it belong to the painter's
 * own unit tests; a canvas assertion would be a false promise, so this file makes
 * the stronger statement: the geometry and the timing make the stroke invisible by
 * construction, and the pixels confirm it (the settled scanline across the switch
 * box is uniform actor body).
 *
 * ── QA-005e: the natural arm asserts an implication, not a prediction ────────
 * QA-005d's P1 walked the refusal, *pre-measured* the runner's frame grid, picked
 * the branch that mean interval implied, and then **required** that branch's
 * observation. On a runner whose intervals jitter around the arc's own 90 ms length
 * those are two independent draws from one noisy distribution, and on run
 * `38784574025` they contradicted each other in both directions — attempt 1 picked
 * "no beat can exist" and received `onset 643.4` ms; retry #1 picked "the beat is
 * owed" and received `null`.
 *
 * The claim that survives the jitter is stated *after* the recording, from that
 * recording's own stamps: **if a presented frame fell strictly inside
 * `(startAt, startAt + 90)`, the beat was owed** (so an absent beat is a real
 * failure, named `BEAT-REQUIRED-ABSENT`); **if no frame could, an absent beat is a
 * resolution limit** (`RESOLVE-LIMIT`, with the stamps printed as its
 * justification); and **an observed beat always owes the full pixel shape** —
 * whichever draw the runner produced. The mapping lives in one place,
 * `arcHandling` in `helpers/frame-model.ts`, and every cell of it is unit-proved
 * with synthetic jitter tables in `tests/unit/frame-model.test.ts`.
 *
 * No tooth is traded for this: on a 60 Hz grid short intervals always exist, so an
 * absent beat there still fails loudly; the fabricated coarse pin (P1b) keeps the
 * exact prediction its own construction guarantees; and the observed-beat shape
 * clauses (bounded, centred, settles, under the flip budget) are unchanged and now
 * run on every machine for every observed beat.
 */

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { ARROW_KEY, loadReferenceLevels, levelUrl, refOf } from "./helpers/levels";
import type { LevelRef } from "./helpers/levels";
import {
  boardGeometry,
  canvasColourHealth,
  expectActorAt,
  expectMoves,
  expectNoPageErrors,
  hud,
  installPixelReadback,
  openLevel,
  pressDirection,
  sampleCanvas,
  waitForFrames,
  watchErrors,
} from "./helpers/game";
import type { BoardGeometry } from "./helpers/game";
import {
  measureFrameGrid,
  reportTransient,
  roiAround,
  SCREENSHOT_ROUND_TRIP_MS,
  startRecorder,
  stopRecorder,
} from "./helpers/capture";
import type { CaptureStats, Roi, TransientReport } from "./helpers/capture";
import { arcHandling, arcImplication, arcVerdict, arcWindow, describeIntervalHistogram, intervalsBelow } from "./helpers/frame-model";
import type { ArcHandling, ArcImplication, ArcVerdict, ArcWindow } from "./helpers/frame-model";
import { installFrameStretcher } from "./helpers/frame-stretch";
import {
  eventsOfKind,
  eventsSince,
  installProbe,
  probeMark,
  probeSnapshot,
} from "./helpers/probe";
import { switchParts } from "@/game/renderer/objects/switch";
import { cellRect } from "@/game/renderer/grid-mapping";
import { FLIP_TIMING, FLIP_VARIANT, theme } from "@/game/theme/tokens";
import type { Vec } from "@/core/state/types";
import type { Rgb } from "./helpers/game";

const REFS = loadReferenceLevels();

/** The phase the suite runs without reduced motion — the shipped Variant S table. */
const TIMINGS = FLIP_TIMING[FLIP_VARIANT];

/**
 * Recorder window on a machine whose frame grid is already 60 Hz (`>= 29 ms`).
 * The original QA-005 protocol value: ~24 frames, enough to resolve a 90 ms arc
 * several times over.
 */
const BASE_RECORD_MS = 700;
/**
 * How many of the *runner's own* frames the recorder window must span.
 *
 * QA-005c: the window is sized from the measured grid, so the `> 15 frames` tooth
 * ("the recorder really ran, frame by frame") survives on a CI runner rendering
 * at ~8 fps instead of failing the local 700 ms constant. On local 60 Hz this is
 * below `BASE_RECORD_MS` and changes nothing.
 */
const MIN_RECORD_FRAMES = 24;
/**
 * The original `gridMs < 60` local ceiling — kept as the **floor** of a derived
 * bound. On a runner whose own frames are slower than this, the recorder is
 * judged against that runner's own grid instead; the semantic is "the recorder
 * kept the machine's frame grid", which is what makes the channel a rAF grid and
 * not a 670 ms screenshot round trip.
 */
const GRID_CEILING_MS = 60;

/* ───────── QA-005d/QA-005e: the refusal walk, and its outcomes ─────────────── */

/** The `probeMark` label that windows the observer log around the refused press. */
const P1_TRIGGER_MARK = "qa005d-p1-refusal-trigger";

/**
 * The fabricated per-frame budget of the **coarse-grid proof** (P1b), in ms.
 *
 * Comfortably above `TIMINGS.deny.dur` (90 ms), so the fabricated interval cannot
 * straddle the arc's own length: because the stretcher burns once per frame, *every*
 * interval on that fabric is longer than the arc. There the classification is a
 * **prediction the runner has to obey** — exact by construction, which is why
 * QA-005e keeps it while it removes the same prediction from the natural arm.
 */
const P1_STRETCH_MS = 140;

/** Everything one P1-style refusal walk measured — whichever branch asserts on it. */
interface RefusalWalk {
  /** The arm label carried by every message, attachment and log line. */
  readonly arm: RefusalArm;
  readonly ref: LevelRef;
  readonly geometry: BoardGeometry;
  /** The player's starting tile — where a refusal must leave them. */
  readonly player: Vec;
  /** The captured region of interest, in canvas device px. */
  readonly roi: Roi;
  readonly report: TransientReport;
  readonly stats: readonly CaptureStats[];
  /** The observer's own `requestAnimationFrame` stamps for this walk. */
  readonly probeFrames: readonly number[];
  /**
   * The §6.5 window, read **post hoc** from this recording's own stamps (QA-005e):
   * whether a presented frame could have painted the arc at all.
   */
  readonly arc: ArcWindow;
  /** The frame interval spanning the keydown, in ms — the arc's resolution limit. */
  readonly gapMs: number;
  /**
   * The mean-grid arbiter (QA-005d). Exact for the gap it is handed, but **not**
   * decisive for the natural arm since QA-005e: a jittering runner can produce a
   * short bracket on a coarse mean and vice versa. Kept because the fabricated
   * coarse pin uses it to prove its own fabrication.
   */
  readonly verdict: ArcVerdict;
  /** The recorded intervals shorter than the arc, and all of them — the census. */
  readonly shortIntervals: number;
  readonly intervalCount: number;
  /** `max(GRID_CEILING_MS, 2 × the idle grid)` — the runner-relative ceiling. */
  readonly gridCeiling: number;
}

/** Which machine the arm is measuring — carried into every failure message. */
type RefusalArm = "natural-grid" | "fabricated-coarse";

/**
 * Run the P1 protocol once and return the measurement.
 *
 * ── The model this measures (QA-005d, re-read post hoc by QA-005e) ───────────
 * A refusal is recorded with `denyFeedback(dir, scene.time.now)` **on the DOM
 * keydown** — keyed through Phaser's `KeyboardPlugin`, whose `keydown` emission is
 * synchronous with the DOM event — i.e. between two animation steps, where
 * `scene.time.now` still holds the *previous* frame's stamp (`Tₙ`). `BoardView.update`
 * drops the deny at `time >= startAt + deny.dur`, and it is called with the next
 * step's stamp (`Tₙ₊₁`). So the 90 ms arc is painted **iff a frame stamp falls
 * strictly inside `(Tₙ, Tₙ + 90)`** — equivalently, iff the interval between the two
 * frames that bracket the keydown is shorter than the arc:
 *
 * ```
 * Tₙ₊₁ - Tₙ < 90  →  p < 1  →  nudge sin(πp)·4·renderScale and the `feedback.deny`
 *                             ring tint at alpha 0.5 are painted  →  the recorder sees a beat
 * Tₙ₊₁ - Tₙ ≥ 90  →  the deny is cleared before painting        →  no beat can exist
 * ```
 *
 * This is an exact, source-level claim about `BoardView`/`LevelScene`, and it is
 * what makes the pixel assertion *conditional on the runner*: on a 60 Hz machine
 * the interval is ~17 ms and the beat is owed; on the 2-core software-GL CI
 * runner the interval straddles 90 ms.
 *
 * The walk therefore measures the interval — from the page's own frame stamps and
 * the delivered keydown (`helpers/probe.ts`) — and reports it. QA-005e's change is
 * that the *branch* is no longer chosen from a pre-measured mean: the stamps of
 * **this** recording decide, after the fact, whether a frame could have painted
 * the arc ({@link ArcWindow}), and that fact plus the observed beat is the whole
 * classification ({@link arcImplication}).
 *
 * `gridWindowMs` sizes the frame-grid calibration: the default 600 ms is QA-005c's
 * protocol value for a ~60 Hz machine, and the coarse-grid test passes a longer
 * window because its own frames are ~140 ms wide.
 */
async function refusalWalk(
  page: Page,
  options: { readonly gridWindowMs?: number; readonly arm: RefusalArm },
): Promise<RefusalWalk> {
  const ref = refOf(REFS, 1);
  await installProbe(page);
  await installPixelReadback(page);
  await openLevel(page, levelUrl(1));
  const geometry = await boardGeometry(page, ref.level);

  // The player's own cell — the deny nudge and the deny ring are both anchored
  // to it (R-Z7: player-anchored L5 treatments).
  const player: Vec = { x: ref.level.player[0], y: ref.level.player[1] };
  const roi = roiAround(
    geometry.cellCenterDevice(player.x, player.y),
    geometry.layout.cellSize / 2 + 8,
  );

  // …and the press below is a refusal by the core's own rules, not by the test's
  // belief: `refusedAtStart` is `isLegalMove` run over the shipped level.
  expect(ref.refusedAtStart, "L1 refuses a left press from its start tile").toContain("left");

  // ── calibrate to THIS runner before the trigger ───────────────────────────
  // The bounds below are stated relative to the machine's own frame grid, so a
  // 2-core software-GL CI runner (measured: 6 frames / 700 ms, item 57) is
  // judged on its own terms instead of on a local-machine constant.
  const idle = await measureFrameGrid(page, options.gridWindowMs ?? 600);
  expect(
    idle.gridMs,
    "the machine renders animation frames at all — the channel is a rAF grid, not the ~670 ms screenshot round trip",
  ).toBeLessThan(SCREENSHOT_ROUND_TRIP_MS / 2);
  expect(idle.frames, "the frame-grid calibration itself ran").toBeGreaterThan(3);
  const recordMs = Math.max(BASE_RECORD_MS, Math.round(idle.gridMs * MIN_RECORD_FRAMES));
  const gridCeiling = Math.max(GRID_CEILING_MS, idle.gridMs * 2);

  await startRecorder(page, roi, recordMs);
  await probeMark(page, P1_TRIGGER_MARK);
  await page.keyboard.press(ARROW_KEY.left);
  // The recorder's own window, sized from the measured grid: it is the "still,
  // then moved, then still again" budget, not a sleep.
  await page.waitForTimeout(recordMs);
  const stats = await stopRecorder(page, roi);
  const report = reportTransient(stats);

  // ── the delivery proof: the refused press reached the page ────────────────
  // §6.5 makes the DOM silent about a refusal on purpose, so the *trigger* is
  // pinned from the page's own event log: exactly one keydown, for the refused
  // direction, at a known `performance.now()`.
  const snapshot = await probeSnapshot(page);
  const keydowns = eventsOfKind(eventsSince(snapshot, P1_TRIGGER_MARK), "keydown");
  expect(keydowns.length, "exactly one keydown was delivered for the refused press").toBe(1);
  const trigger = keydowns[0];
  expect(trigger?.code, "the delivered keydown is the refused direction").toBe(ARROW_KEY.left);
  if (trigger === undefined) throw new Error("[e2e] the refused keydown was not recorded");

  // ── and the classification: the window this recording's own stamps license ──
  // Both frames bracketing the keydown must have been recorded — the deny's
  // window opens at the first of them (`scene.time.now` during the keydown) and
  // closes one frame's worth of stamps later. Their absence is "not measured",
  // never "no frame inside", so the walk refuses to classify without them.
  const arc = arcWindow(snapshot.frames, trigger.t, TIMINGS.deny.dur);
  expect(
    arc,
    "both frames bracketing the keydown were recorded — the deny's window opens at the first of them (`scene.time.now` during the keydown) and closes at `startAt + 90`",
  ).not.toBeNull();
  if (arc === null) throw new Error("[e2e] the refused keydown was not bracketed");
  const gapMs = arc.gapMs;

  const walk: RefusalWalk = {
    arm: options.arm,
    ref,
    geometry,
    player,
    roi,
    report,
    stats,
    probeFrames: snapshot.frames,
    arc,
    gapMs,
    verdict: arcVerdict(gapMs, TIMINGS.deny.dur),
    shortIntervals: intervalsBelow(snapshot.frames, TIMINGS.deny.dur),
    intervalCount: Math.max(0, snapshot.frames.length - 1),
    gridCeiling,
  };

  // One evidence line per walk: the CI log carries the *measurement* this test
  // branches on — the runner's grid, the interval spanning the trigger, and the
  // verdict — so a RESOLVE-LIMIT (or a pixel pass) is checkable from the log
  // alone, without the report artefacts.
  console.log(
    `[QA-005d] transient.spec.ts P1 refusal — frames=${String(report.frames)} gridMs=${report.gridMs.toFixed(1)} gapMs=${gapMs.toFixed(1)} denyDurMs=${String(TIMINGS.deny.dur)} verdict=${walk.verdict} onset=${report.onset === null ? "null" : report.onset.toFixed(1)} settled=${report.settledAt === null ? "null" : report.settledAt.toFixed(1)} peakPrevChanged=${String(report.peakPrevChanged)}`,
  );
  // …and the QA-005e line carries the *post-hoc* facts the arm actually branches
  // on: the window's absolute stamps, which of them fell inside, and the interval
  // census. A red can be read from this line without opening the trace.
  console.log(
    `[QA-005e] transient.spec.ts P1 arm=${walk.arm} window=(${arc.startAt.toFixed(1)},${arc.endAt.toFixed(1)}) bracketingGapMs=${gapMs.toFixed(1)} stampsInsideWindow=${String(arc.inside.length)} implication=${arcImplication(arc, report.onset !== null)} handling=${arcHandling(arcImplication(arc, report.onset !== null))} shortIntervals=${String(walk.shortIntervals)}/${String(walk.intervalCount)} histogram=${describeIntervalHistogram(snapshot.frames)}`,
  );

  return walk;
}

/** `[QA-005e] transient.spec.ts P1 (natural-grid)` — the label every red carries. */
function armLabel(walk: RefusalWalk): string {
  return `[QA-005e] transient.spec.ts P1 (${walk.arm}, gridMs=${walk.report.gridMs.toFixed(1)}, onset=${walk.report.onset === null ? "null" : walk.report.onset.toFixed(1)})`;
}

/** The measured justification, in one sentence, for any outcome a red has to explain. */
function windowJustification(walk: RefusalWalk): string {
  const { arc } = walk;
  return (
    `window (${arc.startAt.toFixed(1)}, ${arc.endAt.toFixed(1)}) ms contains ` +
    `${String(arc.inside.length)} recorded frame stamp(s); bracketing gap ${walk.gapMs.toFixed(1)} ms; ` +
    `${String(walk.shortIntervals)}/${String(walk.intervalCount)} recorded intervals were shorter than ${String(TIMINGS.deny.dur)} ms ` +
    `(histogram ${describeIntervalHistogram(walk.probeFrames)})`
  );
}

/** The channel guards both branches share: the recorder really ran, on a real grid. */
function expectRecorderHealthy(walk: RefusalWalk): void {
  // ── the channel was real: a rendered-frame grid, not a few lucky screenshots ──
  // The read-back costs ~0.3 ms/frame, so the recorder's grid IS the runner's
  // grid; the window is sized from the measured grid (above), which keeps the
  // "the recorder really ran" tooth meaningful on any runner. The claim that
  // matters is the *order of magnitude*: the runner's own frames, not the 670 ms
  // CDP screenshot round trip that makes a 90 ms event unreachable.
  expect(walk.report.frames, "the recorder ran long enough to resolve a 90 ms event").toBeGreaterThan(15);
  expect(
    walk.report.gridMs,
    `median frame interval is the runner's own frame grid (<${String(walk.gridCeiling)} ms), not a CDP screenshot round trip`,
  ).toBeLessThan(walk.gridCeiling);
}

/**
 * The **observed-beat** branch: a beat appeared in the player's cell, so the pixel
 * claim is owed and is asserted in full — on every machine, on every run.
 *
 * (QA-005e) This is reached for both observed implication classes. When the
 * recording's own stamps put a frame inside the window the beat is *required*;
 * when they do not, a beat is still an observed transient of the refusal's own
 * cell and owes exactly the same shape clauses. What it is **not** is a licence to
 * assert a predicted absence — that pre-judged prediction is the assertion design
 * QA-005e removed.
 */
function expectArcOnTheGrid(walk: RefusalWalk): void {
  const { report, stats } = walk;
  const label = armLabel(walk);

  // ── the shape: frozen, then moved, then stopped ───────────────────────────
  expect(
    report.onset,
    `${label}: the refusal beat reached the frame grid — ${windowJustification(walk)}`,
  ).not.toBeNull();
  expect(
    report.durationMs,
    `${label}: the beat is short — far below the 220 ms flip budget — ${windowJustification(walk)}`,
  ).not.toBeNull();
  // Bounded by the flip budget **plus frame quantisation**: a coarse grid cannot
  // fake a long beat, and a slow runner is not failed for its own frame width.
  expect(
    report.durationMs ?? 999,
    `${label}: the refusal beat is resolved, not smeared — ${windowJustification(walk)}`,
  ).toBeLessThanOrEqual(TIMINGS.total + 2 * report.gridMs);
  // Self-calibrating: the measured window is the documented 90 ms row plus at most
  // one frame of quantisation on each side, so a coarse grid cannot fake a long beat.
  expect(
    report.durationMs ?? 999,
    `${label}: the measured window is the §6.5 deny row plus frame quantisation`,
  ).toBeLessThanOrEqual(TIMINGS.deny.dur + 2 * report.gridMs + 4);
  expect(
    report.peakPrevChanged,
    `${label}: the beat actually changed pixels — ${windowJustification(walk)}`,
  ).toBeGreaterThan(50);
  expect(
    report.settledAt,
    `${label}: the board returns to a settled picture — ${windowJustification(walk)}`,
  ).not.toBeNull();

  // ── the anchor: the movement is *at the player's tile*, not somewhere else ─
  const moving = stats.filter((frame) => frame.changed > 0 && frame.centroid.x !== 0);
  expect(moving.length, `${label}: at least one frame moved inside the ROI`).toBeGreaterThan(0);
  const centre = { x: walk.roi.w / 2, y: walk.roi.h / 2 };
  for (const frame of moving) {
    expect(
      Math.hypot(frame.centroid.x - centre.x, frame.centroid.y - centre.y),
      `${label}: the refusal transient must stay inside the player's cell (t=${frame.t.toFixed(0)} ms)`,
    ).toBeLessThan(walk.roi.w / 4);
  }
}

/**
 * The DOM half of the triple freeze, for both branches: no move, no flip.
 *
 * §6.5's refusal is deliberately invisible in the HUD — "the world did not flip"
 * is the primary cue — so this is asserted *after* the branch's pixel evidence.
 */
async function expectRefusalState(page: Page, walk: RefusalWalk): Promise<void> {
  const state = await hud(page);
  expect(state.moves, `${armLabel(walk)}: a refusal is not a move`).toBe(0);
  expect(state.phase, `${armLabel(walk)}: a refusal is not a flip`).toBe(walk.ref.level.startPhase);
}

/**
 * The **beat-owed-and-absent** branch (QA-005e) — a real failure, and it must say so
 * in its own words.
 *
 * A presented frame fell strictly inside `(startAt, startAt + 90)`, so
 * `BoardView.paintActor` ran with `this.deny` set at that step and painted the
 * `feedback.deny` ring tint (alpha 0.5) and the nudge. An absent beat therefore
 * cannot be a limit of the machine: the trigger or the recording dropped it. This
 * branch exists so the contradiction fails **loudly, by name, with the stamps** —
 * never as a silent `Received: null` on a prediction whose premise was noise.
 */
function expectBeatRequired(walk: RefusalWalk): void {
  const label = armLabel(walk);
  const justification = windowJustification(walk);
  const body = {
    site: "transient.spec.ts P1",
    arm: walk.arm,
    implication: "beat-required-absent" as ArcImplication,
    handling: arcHandling("beat-required-absent") as ArcHandling,
    reason:
      "a presented frame fell strictly inside the §6.5 deny window, so the beat was owed — an absent beat is a real failure, not a resolution limit",
    denyDurMs: TIMINGS.deny.dur,
    window: {
      startAt: walk.arc.startAt,
      endAt: walk.arc.endAt,
      gapMs: walk.arc.gapMs,
      inside: walk.arc.inside,
      frameInWindow: walk.arc.frameInWindow,
    },
    probeFrames: walk.probeFrames,
    shortIntervals: walk.shortIntervals,
    intervalCount: walk.intervalCount,
    histogram: describeIntervalHistogram(walk.probeFrames),
    recorder: {
      frames: walk.report.frames,
      gridMs: walk.report.gridMs,
      onset: walk.report.onset,
      settledAt: walk.report.settledAt,
      durationMs: walk.report.durationMs,
      peakPrevChanged: walk.report.peakPrevChanged,
    },
  };
  console.log(`[QA-005e] BEAT-REQUIRED-ABSENT ${label}: ${justification}`);
  test.info().annotations.push({
    type: "BEAT-REQUIRED-ABSENT",
    description: `${label}: the recording's own stamps put a frame inside the deny window, so the arc was paintable; the beat is absent. ${justification}`,
  });
  void test.info().attach("qa005e-p1-beat-required-absent.json", {
    contentType: "application/json",
    body: Buffer.from(`${JSON.stringify(body, null, 2)}\n`),
  });
  expect(
    walk.report.onset,
    `${label}: the recording's own stamps put ${String(walk.arc.inside.length)} frame(s) inside the §6.5 deny window ` +
      `(deny window (${walk.arc.startAt.toFixed(1)}, ${walk.arc.endAt.toFixed(1)}) ms, bracketing gap ${walk.gapMs.toFixed(1)} ms < deny.dur ${String(TIMINGS.deny.dur)} ms), ` +
      `so \`BoardView.paintActor\` painted the \`feedback.deny\` ring tint at that step — yet no beat appeared. ` +
      `This is a real failure (the trigger was dropped or the recorder missed the frame), not a resolution limit. ${justification}`,
  ).not.toBeNull();
}

/**
 * The **RESOLVE-LIMIT** branch — what is still owed when no presented frame can
 * hold the arc at all.
 *
 * A limit that is declared is engineering; a limit that is silently dropped is a
 * lie. So when **this recording's own stamps** prove that no frame time fell inside
 * `(startAt, startAt + deny.dur)`, the pixel claim is replaced by an explicitly
 * named outcome plus every deterministic claim the refusal still owes:
 *
 * 1. the justification, asserted in the direction that makes the limit legitimate:
 *    the window contains **no** recorded frame stamp (and the bracketing interval is
 *    at least `deny.dur`), plus the recorder reports **no** onset — so a "no beat"
 *    reading can never be produced by a bug while a frame was available;
 * 2. the refusal itself: no move, no flip (the core's identity contract);
 * 3. the player still on their own tile, **read from the pixels** — so "the
 *    refusal happened" cannot be confused with "the board froze";
 * 4. the read-back channel still alive (real colour, not a black WebGL buffer);
 * 5. a positive control through the *same* channel on the *same* runner, so the
 *    delivered-but-refused press is distinguished from a lost input.
 *
 * `mode` only labels *why* the absence is expected: `justified` (this recording's
 * stamps permit it) for the natural arm, `predicted` for the fabricated coarse pin,
 * whose every interval is longer than the arc by construction, so the prediction is
 * physically exact there.
 */
async function expectResolveLimit(
  page: Page,
  walk: RefusalWalk,
  reason: string,
  mode: "justified" | "predicted",
): Promise<void> {
  const label = armLabel(walk);
  const justification = windowJustification(walk);
  const limit =
    `RESOLVE-LIMIT transient.spec.ts P1 arm=${walk.arm} — ${reason}: no presented frame can fall inside the §6.5 ` +
    `deny window (${walk.arc.startAt.toFixed(1)}, ${walk.arc.endAt.toFixed(1)}) ms, so no pixel evidence can exist ` +
    `on this runner [${mode}]`;
  // Greppable in the CI log, and carried in the report as a named outcome.
  console.log(`[QA-005e] ${limit}`);
  console.log(`[QA-005e] RESOLVE-LIMIT justification: ${justification}`);
  test.info().annotations.push({ type: "RESOLVE-LIMIT", description: `${limit}. ${justification}` });
  await test.info().attach("qa005e-p1-resolve-limit.json", {
    contentType: "application/json",
    body: Buffer.from(
      `${JSON.stringify(
        {
          site: "transient.spec.ts P1",
          arm: walk.arm,
          mode,
          implication: "limit-justified-absent" as ArcImplication,
          handling: arcHandling("limit-justified-absent") as ArcHandling,
          reason,
          denyDurMs: TIMINGS.deny.dur,
          window: {
            startAt: walk.arc.startAt,
            endAt: walk.arc.endAt,
            gapMs: walk.arc.gapMs,
            inside: walk.arc.inside,
            frameInWindow: walk.arc.frameInWindow,
          },
          histogram: describeIntervalHistogram(walk.probeFrames),
          shortIntervals: walk.shortIntervals,
          intervalCount: walk.intervalCount,
          verdict: walk.verdict,
          recorderFrames: walk.report.frames,
          recorderGridMs: walk.report.gridMs,
          onset: walk.report.onset,
        },
        null,
        2,
      )}\n`,
    ),
  });

  // (1) the justification of the limit — post hoc, from this recording's stamps
  expect(
    walk.arc.frameInWindow,
    `${label}: no recorded frame stamp may fall inside the window — ${justification}`,
  ).toBe(false);
  expect(walk.arc.inside.length, `${label}: the in-window stamp count is what licenses the limit`).toBe(0);
  expect(
    walk.gapMs,
    `${label}: ${reason}: every frame step is at least the deny row long — ${justification}`,
  ).toBeGreaterThanOrEqual(TIMINGS.deny.dur);
  expect(
    walk.report.onset,
    `${label}: ${reason}: the recorder must report no beat — \`BoardView.update\` clears the deny at \`time >= startAt + ${String(TIMINGS.deny.dur)}\`, before it can be painted`,
  ).toBeNull();

  // (2) the refusal: no move, no flip
  const state = await hud(page);
  expect(state.moves, `${label}: a refusal is not a move`).toBe(0);
  expect(state.phase, `${label}: a refusal is not a flip`).toBe(walk.ref.level.startPhase);

  // (3) the player is still where they stood — from the pixels
  await expectActorAt(page, walk.geometry, walk.ref.level, walk.player);

  // (4) the channel that reported "no beat" was alive
  const health = await canvasColourHealth(page);
  expect(
    health.distinct,
    `${label}: the canvas read-back has colour — the channel reporting 'no beat' is reading the real board`,
  ).toBeGreaterThan(4);

  // (5) positive control: the same channel commits a legal move on this runner
  expect(
    walk.ref.refusedAtStart,
    `${label}: the positive control's press is legal at move 0 (asked of the core, not assumed)`,
  ).not.toContain("right");
  await pressDirection(page, "right");
  await expectMoves(page, 1);
  expect((await hud(page)).phase, `${label}: the positive control really committed a move and a flip`).toBe("B");
}

/**
 * The arm's whole decision (QA-005e): one total map from the two facts a recording
 * produces — a frame in the window or not, a beat or not — to one of three
 * handlings. `arcHandling` is the single place that mapping lives, and
 * `tests/unit/frame-model.test.ts` proves every cell of it, including the two
 * cloud observations of run `38784574025`.
 */
async function expectRefusalOutcome(
  page: Page,
  walk: RefusalWalk,
  reason: string,
  mode: "justified" | "predicted",
): Promise<void> {
  const implication = arcImplication(walk.arc, walk.report.onset !== null);
  switch (arcHandling(implication)) {
    case "assert-shape":
      expectArcOnTheGrid(walk);
      await expectRefusalState(page, walk);
      return;
    case "resolve-limit":
      await expectResolveLimit(page, walk, reason, mode);
      return;
    case "fail-loudly":
      expectBeatRequired(walk);
      return;
  }
}

test.describe("the resampling channel", () => {
  test("the channel is live: the presented WebGL frame reads back as real colours", async ({
    page,
  }) => {
    await installPixelReadback(page);
    await openLevel(page, levelUrl(1));
    const health = await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      if (canvas === null) throw new Error("no canvas");
      const copy = document.createElement("canvas");
      copy.width = canvas.width;
      copy.height = canvas.height;
      const ctx = copy.getContext("2d", { willReadFrequently: true });
      if (ctx === null) throw new Error("no 2d context");
      ctx.drawImage(canvas, 0, 0);
      const data = ctx.getImageData(0, 0, copy.width, copy.height).data;
      const seen = new Set<string>();
      for (let i = 0; i < data.length; i += 4 * 613) {
        seen.add(`${String(data[i] ?? 0)},${String(data[i + 1] ?? 0)},${String(data[i + 2] ?? 0)}`);
      }
      return { distinct: seen.size };
    });
    // A dead read-back channel is a single flat colour: fail loudly rather than
    // reporting "the transient was not there".
    expect(health.distinct, "the canvas read-back has colour (not the black WebGL trap)").toBeGreaterThan(
      4,
    );
  });
});

test.describe("P1 — the §6.5 refusal arc (90 ms) is reachable on the frame grid", () => {
  test(`a refused move produces a bounded, centred, settling transient shorter than the flip budget`, async ({
    page,
  }) => {
    const walk = await refusalWalk(page, { arm: "natural-grid" });
    expectRecorderHealthy(walk);

    // ── which claim this natural grid owes (QA-005e) ──────────────────────────
    // Not a pre-judged prediction from a pre-measured mean: the arc is painted iff
    // a frame stamp falls strictly inside its 90 ms window, and *this recording's*
    // stamps decide after the fact whether one did. Both observations are legal
    // inputs; each has exactly one handling (`arcHandling`):
    //
    //   frame inside the window + beat observed  → the full pixel shape (assert-shape)
    //   frame inside the window + beat absent    → a real failure, by name (fail-loudly)
    //   no frame inside + beat absent            → the named RESOLVE-LIMIT (resolve-limit)
    //   no frame inside + beat observed          → the same pixel shape, post hoc
    //
    // On a 60 Hz machine the window always holds frames, so an absent beat fails
    // loudly here (the 60 Hz teeth are preserved, not negotiated away). On a
    // cloud runner whose interval jitters around 90 ms, the *stamps* of whichever
    // draw happened decide — the assertion no longer contradicts itself.
    await expectRefusalOutcome(page, walk, "this runner's own frame grid", "justified");
  });

  /**
   * P1b — the `resolve-limit` handling, **fabricated** so it is provable on any
   * machine (QA-005d, re-grounded by QA-005e).
   *
   * Without this test the limit branch is only exercised by a slow runner: on a
   * local 60 Hz machine the frame interval is ~17 ms and a frame always falls
   * inside the arc, so the fallback could rot unnoticed until a 2-core CI runner
   * happened to straddle 90 ms. `installFrameStretcher` burns a fixed per-frame
   * budget, so **every** interval is longer than the arc *by construction* — and
   * there the prediction is physically exact, so an absent beat is REQUIRED rather
   * than merely permitted. (QA-005e keeps that prediction precisely because it does
   * not rest on one noisy natural measurement: it is a property of the fabric.)
   *
   * This is the regression pin for the classification in `helpers/frame-model.ts`
   * (whose arithmetic and implication table are unit-proved in
   * `tests/unit/frame-model.test.ts`), and it is what makes the CI fallback
   * trustworthy: the coarse branch is *known* to run and *known* to hold the
   * refusal, on a fast laptop, on every commit.
   */
  test("a fabricated coarse grid proves the 'unresolvable' branch: no frame can hold a 90 ms arc", async ({
    page,
  }) => {
    // CI-envelope sizing (QA-005d): the fabricated grid makes every animation frame
    // ~150 ms wide *on purpose*, and the walk's protocol is wall clock — a 1.5 s
    // grid calibration, a 24-frame recorder window, the positive control, plus a
    // page round trip that can wait for the current frame's burn. Measured ~18 s
    // locally, which leaves no headroom under the default 30 s on the 2-core
    // software-GL runner (item 57). The budget is wall clock, never an assertion:
    // every claim below is unchanged.
    test.setTimeout(120_000);
    const watch = watchErrors(page);
    await installFrameStretcher(page, P1_STRETCH_MS);

    const walk = await refusalWalk(page, { gridWindowMs: 1_500, arm: "fabricated-coarse" });
    expectRecorderHealthy(walk);

    // The fabrication worked — asserted, not trusted: a stretcher that quietly did
    // nothing would otherwise turn this test into a duplicate of P1.
    expect(
      walk.report.gridMs,
      `the frame stretcher produced a coarse grid: the recorder's own median interval (${walk.report.gridMs.toFixed(1)} ms) is at least the deny row`,
    ).toBeGreaterThanOrEqual(TIMINGS.deny.dur);
    expect(
      walk.verdict,
      `the interval spanning the trigger (${walk.gapMs.toFixed(1)} ms) is a full frame, so the grid cannot place a frame inside the 90 ms arc`,
    ).toBe("unresolvable-at-grid");

    // (QA-005e) The prediction this pin is allowed to make is now measured, not
    // assumed: the recording's own stamps contain no frame inside the window, so
    // "no beat" is physically required on this fabric — at *every* interval, not
    // just the bracketing one (the stretcher burns once per frame).
    expect(
      walk.arc.frameInWindow,
      `the fabricated grid leaves no stamp inside the deny window — ${windowJustification(walk)}`,
    ).toBe(false);
    expect(
      walk.report.onset,
      `[QA-005e] transient.spec.ts P1 (fabricated-coarse): the coarse prediction is exact by construction — no presented frame can paint the 90 ms arc, so an onset here would be a real anomaly. ${windowJustification(walk)}`,
    ).toBeNull();

    await expectRefusalOutcome(page, walk, "the fabricated coarse grid", "predicted");
    expectNoPageErrors(watch, "P1b — the coarse-grid refusal walk");
  });
});

test.describe("P2 — the switch press beat is occluded by construction", () => {
  test("the emphasis window starts after the hop ends, so the actor is on the tile centre throughout", () => {
    // §6.2 rows: emphasis rides `occupied`, the actor rides `hop`.
    expect(TIMINGS.occupied.start, "occupied starts at 140 ms").toBeGreaterThanOrEqual(
      TIMINGS.hop.start + TIMINGS.hop.dur,
    );
    // At the emphasis peak the hop is long over — no motion can uncover the box.
    const peak = TIMINGS.occupied.start + TIMINGS.occupied.dur / 2;
    expect(peak).toBeGreaterThanOrEqual(TIMINGS.hop.start + TIMINGS.hop.dur);
    // And an emphasis is a one-shot: at rest (p = 1) it reads 0 (R-C8).
    expect(TIMINGS.occupied.start + TIMINGS.occupied.dur).toBeLessThanOrEqual(TIMINGS.total);
  });

  test("the actor disc strictly contains the switch box and its widest stroke, measured from pixels", async ({
    page,
  }) => {
    const ref = refOf(REFS, 8);
    const route = ["up", "right", "right", "down", "right"] as const; // onto door d1 at (3,1)
    await installPixelReadback(page);
    await openLevel(page, levelUrl(8));
    const geometry = await boardGeometry(page, ref.level);

    for (const direction of route) await pressDirection(page, direction);
    await waitForFrames(page, 4);
    const state = await hud(page);
    expect(state.phase).toBe("B");

    const tile = { x: 3, y: 1 };
    const centre = geometry.cellCenterDevice(tile.x, tile.y);
    const cell = geometry.layout.cellSize;

    // Measure the actor's radius from the canvas: the contiguous run of actor-body
    // pixels across the cell's centre row (the body is the last-painted layer).
    const points: { x: number; y: number }[] = [];
    for (let dx = -Math.ceil(cell / 2); dx <= Math.ceil(cell / 2); dx += 1) {
      points.push({ x: centre.x + dx, y: centre.y });
    }
    const samples = await sampleCanvas(page, points);
    const body = theme("B").actor.body;
    const bodyRgb: Rgb = [
      Number.parseInt(body.slice(1, 3), 16),
      Number.parseInt(body.slice(3, 5), 16),
      Number.parseInt(body.slice(5, 7), 16),
    ];
    const isBody = (sample: Rgb | undefined): boolean =>
      sample !== undefined &&
      Math.max(
        Math.abs(sample[0] - bodyRgb[0]),
        Math.abs(sample[1] - bodyRgb[1]),
        Math.abs(sample[2] - bodyRgb[2]),
      ) <= 2;
    const matches = samples.map((sample) => isBody(sample));
    let longest = 0;
    let current = 0;
    for (const hit of matches) {
      current = hit ? current + 1 : 0;
      longest = Math.max(longest, current);
    }
    const actorRadius = longest / 2;
    expect(actorRadius, "the actor body was found on its own tile").toBeGreaterThan(cell * 0.3);

    // The production switch geometry, at its widest (emphasis = 1).
    const rect = cellRect(geometry.layout, tile.x, tile.y);
    const parts = switchParts(rect, cell, geometry.renderScale, 1);
    const farCorner = Math.hypot(parts.box.w / 2, parts.box.h / 2) + parts.strokeWidth / 2;

    expect(
      farCorner,
      `the switch box's furthest inked point (${farCorner.toFixed(1)} px) must be inside the actor disc (r=${actorRadius.toFixed(1)} px)`,
    ).toBeLessThan(actorRadius);

    // The pixel cross-check: at rest the scanline across the box is uniform actor
    // body — the switch, in either latch state, is not visible while occupied.
    expect(
      longest / matches.length,
      "the occupied cell's centre row is dominated by the actor body, not by the switch outline",
    ).toBeGreaterThan(0.5);
  });

  test("the arrival transient at the switch tile is bounded and settles", async ({ page }) => {
    const ref = refOf(REFS, 8);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(8));
    const geometry = await boardGeometry(page, ref.level);
    const tile = { x: 2, y: 0 }; // L8's switch s1

    await pressDirection(page, "up");
    await pressDirection(page, "right");
    await waitForFrames(page, 3);
    const before = await hud(page);
    expect(before.moves, "precondition: standing next to the switch").toBe(2);

    // ROI = the switch cell, and only it: the box (40 %) plus a margin, so the
    // scanline's reference pixel is the cell ground rather than the neighbour.
    const roi = roiAround(
      geometry.cellCenterDevice(tile.x, tile.y),
      Math.round((geometry.layout.cellSize * 0.4) / 2) + 8,
    );

    // Calibrate to this runner (QA-005c): window and bounds follow the machine's
    // own frame grid, so a CI software-GL runner is measured on its own terms.
    const idle = await measureFrameGrid(page);
    expect(
      idle.gridMs,
      "the machine renders animation frames at all — the channel is a rAF grid, not the ~670 ms screenshot round trip",
    ).toBeLessThan(SCREENSHOT_ROUND_TRIP_MS / 2);
    expect(idle.frames, "the frame-grid calibration itself ran").toBeGreaterThan(3);
    const recordMs = Math.max(BASE_RECORD_MS, Math.round(idle.gridMs * MIN_RECORD_FRAMES));
    const gridCeiling = Math.max(GRID_CEILING_MS, idle.gridMs * 2);

    await startRecorder(page, roi, recordMs);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(Math.round(recordMs * 0.7));
    const stats = await stopRecorder(page, roi);
    const report = reportTransient(stats);

    expect(report.frames).toBeGreaterThan(15);
    expect(
      report.gridMs,
      `median frame interval is the runner's own frame grid (<${String(gridCeiling)} ms)`,
    ).toBeLessThan(gridCeiling);
    expect(report.onset, "the arrival reached the frame grid").not.toBeNull();
    expect(
      report.durationMs ?? 999,
      "the arrival transient (hop + press beat + cross-fade) is bounded by the §6.1 budget plus frame quantisation",
    ).toBeLessThanOrEqual(TIMINGS.total + 120 + 2 * report.gridMs);
    expect(report.settledAt).not.toBeNull();

    // The beat's own row is inside the window — the emphasis is a live animation
    // even though its graphic is occluded. The ±40 ms band is widened by one
    // frame of the *measured* grid so a coarse runner still puts a sample in it.
    const tolerance = 40 + report.gridMs;
    const beat = stats.filter(
      (frame) =>
        frame.t >= (report.onset ?? 0) + TIMINGS.occupied.start - tolerance &&
        frame.t <= (report.onset ?? 0) + TIMINGS.occupied.start + TIMINGS.occupied.dur + tolerance,
    );
    expect(beat.length, "the occupied row was sampled at least once").toBeGreaterThan(0);

    const after = await hud(page);
    expect(after.moves).toBe(3);
    expect(after.phase).toBe("B");
  });

  test("the switch cell's outline is never readable while the player occupies it", async ({ page }) => {
    const ref = refOf(REFS, 8);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(8));
    const geometry = await boardGeometry(page, ref.level);
    const tile = { x: 2, y: 0 };
    const centre = geometry.cellCenterDevice(tile.x, tile.y);
    const boxHalf = (geometry.layout.cellSize * 0.4) / 2;

    // Settled on the switch tile, phase B.
    for (const direction of ["up", "right", "right"] as const) await pressDirection(page, direction);
    await waitForFrames(page, 4);
    expect((await hud(page)).phase).toBe("B");

    // A diagonal through the box's corners: any point on the box's outline is at
    // most `boxHalf * sqrt(2)` from the tile centre.
    const points = [-1, 0, 1].flatMap((sx) =>
      [-1, 0, 1].map((sy) => ({
        x: centre.x + sx * Math.round(boxHalf),
        y: centre.y + sy * Math.round(boxHalf),
      })),
    );
    const samples = await sampleCanvas(page, points);
    const body = theme("B").actor.body;
    const bodyRgb: Rgb = [
      Number.parseInt(body.slice(1, 3), 16),
      Number.parseInt(body.slice(3, 5), 16),
      Number.parseInt(body.slice(5, 7), 16),
    ];
    const outline = theme("B").obj.switch;
    const outlineRgb: Rgb = [
      Number.parseInt(outline.slice(1, 3), 16),
      Number.parseInt(outline.slice(3, 5), 16),
      Number.parseInt(outline.slice(5, 7), 16),
    ];
    const distance = (a: Rgb, b: Rgb): number =>
      Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));

    for (const [index, sample] of samples.entries()) {
      expect(sample, "every probe returned a pixel").toBeDefined();
      if (sample === undefined) continue;
      expect(
        distance(sample, outlineRgb),
        `probe ${String(index)} lands on the switch box outline, so it must not be the switch token`,
      ).toBeGreaterThan(2);
    }
    // …and at least the centre probe *is* the actor: the cell reads as the player.
    const centreSample = samples[4];
    expect(centreSample).toBeDefined();
    if (centreSample !== undefined) {
      expect(distance(centreSample, bodyRgb), "the tile centre is the actor body").toBeLessThanOrEqual(2);
    }
  });
});
/**
 * §5.5 star field — **the shared acceptance harness** (QA-019).
 *
 * Both browser profiles (`star-field.spec.ts` desktop, `star-field.mobile.spec.ts`
 * Pixel 5) must walk *real* runs to land on the ruling's own (run, best) matrix, so
 * the derivation, the seed and the census live here once and the two files differ
 * only in the pitch they measure and in what they add.
 *
 * ── The runs are forced, never typed ─────────────────────────────────────────
 * A level is won after `2 · d` extra moves: the par route minus its last leg, `d`
 * copies of a **reversible detour pair** found with `isLegalMove` / `applyMove`, then
 * the last leg. The pair returns the player to the same tile **in the same phase**
 * (ADR-0009's checkerboard quantum), so the win is legal, deterministic and the HUD's
 * own move counter is asserted against the arithmetic — a row can never silently walk
 * a different length.
 *
 * ── The seed is the shipped family's own payload ─────────────────────────────
 * `openLevel` clears `localStorage` at navigation, so the stored best is written
 * **after** it and **before** the winning press: exactly the state a player who had
 * already cleared the level is in. Key, schema and slot count come from
 * `src/game/systems/stars.ts` — never a typed string — and the payload carries **no
 * star count** (the rating is derived from the stored moves).
 */

import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

import type { Level } from "@/core/level";
import { applyMove, isLegalMove } from "@/core/rules";
import type { Direction } from "@/core/state/move";
import { DIRECTIONS, move } from "@/core/state/move";
import type { SearchState } from "@/core/state/types";
import { sameVec } from "@/core/state/types";
import {
  STAR_BOX_PX,
  STAR_DOT_PX,
  STAR_INNER_RATIO,
  STAR_KNOCKOUT_SCALE,
  STAR_OUTER_RATIO,
  STAR_POINTS,
} from "@/game/hud/hud-styles";
import { STAR_SCHEMA, STAR_STORAGE_KEY } from "@/game/systems/stars";
import { theme } from "@/game/theme/tokens";

import { hexToRgb } from "./art";
import { hud, installPixelReadback, openLevel, pressRoute, settle } from "./game";
import type { LevelRef } from "./levels";
import { levelUrl, loadReferenceLevels, resolveRoute } from "./levels";
import { channelDistance, fieldCensus } from "./star-pixels";
import type { FieldCensus } from "./star-pixels";

const REFS = loadReferenceLevels();

export const r2 = (value: number): string => value.toFixed(2);

/**
 * A two-move detour that returns to the **same tile in the same phase** — found from
 * the rules, never typed. `applyMove` is the single truth source (AGENTS.md §3), so a
 * rules change that removes the round-trip fails this selector loudly instead of
 * leaving a stale padded route behind.
 */
export function reversiblePair(
  level: Level,
  state: SearchState,
): readonly [Direction, Direction] | null {
  for (const first of DIRECTIONS) {
    if (!isLegalMove(level, state, move(first))) continue;
    const mid = applyMove(level, state, move(first));
    for (const back of DIRECTIONS) {
      if (!isLegalMove(level, mid, move(back))) continue;
      const end = applyMove(level, mid, move(back));
      if (sameVec(end.player, state.player) && end.phase === state.phase) return [first, back];
    }
  }
  return null;
}

/** The padded win: par route − last leg, `detours` round-trips, then the last leg. */
export function paddedRoute(ref: LevelRef, detours: number): readonly Direction[] {
  const head = ref.route.slice(0, -1);
  const pre = resolveRoute(ref.level, head);
  const pair = reversiblePair(ref.level, pre);
  if (pair === null) {
    throw new Error(`[QA-019] L${String(ref.id)} has no reversible detour at its pre-final state`);
  }
  const extra: Direction[] = [];
  for (let index = 0; index < detours; index += 1) extra.push(pair[0], pair[1]);
  return [...head, ...extra, ...ref.route.slice(-1)];
}

/**
 * The cheapest rung whose par route ends in `phase`, carries **no door and no portal**
 * (so the detour is a pure state round-trip) and has a reversible pair at its
 * pre-final state.
 */
export function pickEndPhase(phase: "A" | "B", exclude: readonly number[]): LevelRef {
  const found = REFS.filter(
    (ref) =>
      !exclude.includes(ref.id) &&
      ref.level.doors.length === 0 &&
      ref.level.portals.length === 0 &&
      ref.legs[ref.legs.length - 1]?.phase === phase &&
      reversiblePair(ref.level, resolveRoute(ref.level, ref.route.slice(0, -1))) !== null,
  );
  const first = found[0];
  if (first === undefined) throw new Error(`[QA-019] no ${phase}-ending rung can be padded`);
  return first;
}

/** The cheapest A-ending rung, and (excluding it) the cheapest B-ending rung. */
export const A_REF = pickEndPhase("A", []);
export const B_REF = pickEndPhase("B", [A_REF.id]);

/**
 * `k1 = 2·⌈par/10⌉` — the ruling's slack, restated here so the detour count is chosen
 * on purpose; the unit tier owns the threshold verdict itself.
 */
export function slackK1(par: number): number {
  return 2 * Math.ceil(par / 10);
}

/** The three boundary move counts on `A_REF`, as (run ⇒ expected) rows. */
export const A_LADDER = {
  /** `par + k1` — the 3★ boundary, exact. */
  boundary3: A_REF.par + slackK1(A_REF.par),
  /** `par + k2` — the 2★ boundary, exact. */
  boundary2: A_REF.par + 2 * slackK1(A_REF.par),
  /** `par + k2 + 2` — past the last threshold, so 1★. */
  oneStar: A_REF.par + 2 * slackK1(A_REF.par) + 2,
};

/** Detour pairs needed to land on a move count: `(moves − par) / 2`. */
export function detoursFor(par: number, moves: number): number {
  const extra = moves - par;
  if (extra % 2 !== 0)
    throw new Error(`[QA-019] ${String(moves)} is not reachable from par ${String(par)} by pairs`);
  return extra / 2;
}

/** The three ink/ground references A-11 measures against, from the phase's tokens. */
export function censusTokens(phase: "A" | "B"): {
  plate: ReturnType<typeof hexToRgb>;
  gold: ReturnType<typeof hexToRgb>;
  dot: ReturnType<typeof hexToRgb>;
} {
  const tokens = theme(phase);
  return {
    plate: hexToRgb(tokens.ground.plate),
    gold: hexToRgb(tokens.obj.goal),
    dot: hexToRgb(tokens.text.secondary),
  };
}

/**
 * The declared filled silhouette's own **box share**, from the shipped geometry:
 * `5·R·r·sin(π/5)`, `R = STAR_OUTER_RATIO`, `r = R · STAR_INNER_RATIO` (analytic
 * 0.281). A change to the star's proportions moves this measurement with it.
 */
export function silhouetteShare(): number {
  return (
    5 * STAR_OUTER_RATIO * (STAR_OUTER_RATIO * STAR_INNER_RATIO) * Math.sin(Math.PI / (STAR_POINTS / 2))
  );
}

/** The `empty` slot's dot as a share of the box: `π (d/2)² / box²` (analytic 0.049). */
export function dotShare(): number {
  return (Math.PI * (STAR_DOT_PX / 2) ** 2) / STAR_BOX_PX ** 2;
}

/* ────────────────────────────── the seed ───────────────────────────────── */

/**
 * Seed the stored best, **after `openLevel` and before the winning press**. Returns the
 * exact payload written, which is then used as the byte-for-byte "untouched" witness.
 */
export async function seedBest(page: Page, rows: Readonly<Record<string, number>>): Promise<string> {
  return page.evaluate(
    (input: { key: string; schema: number; rows: [string, number][] }) => {
      const best: Record<string, { moves: number }> = {};
      for (const [id, moves] of input.rows) best[id] = { moves };
      const payload = JSON.stringify({ schema: input.schema, best });
      window.localStorage.setItem(input.key, payload);
      return payload;
    },
    {
      key: STAR_STORAGE_KEY,
      schema: STAR_SCHEMA,
      rows: Object.entries(rows) as [string, number][],
    },
  );
}

/** The bytes on disk right now, for the monotone "untouched" claims. */
export async function storedBytes(page: Page): Promise<string | null> {
  return page.evaluate((key: string) => window.localStorage.getItem(key), STAR_STORAGE_KEY);
}

/** Slots' declared states, in DOM order. */
export async function slotStates(page: Page): Promise<readonly (string | null)[]> {
  return page.locator(".ps-star").evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLElement).dataset["state"] ?? null),
  );
}

/** The live region's text and the panel's two frozen strings. */
export async function panelStrings(page: Page): Promise<{ title: string; body: string; live: string }> {
  const state = await hud(page);
  return { title: state.dialogTitle, body: state.dialogBody, live: state.live };
}

/** `L 01 cleared` + `moves 6` — the N-2 forms, built from the same helpers the HUD uses. */
export function frozenStrings(ref: LevelRef, moves: number): { title: string; body: string } {
  return {
    title: `L ${String(ref.id).padStart(2, "0")} cleared`,
    body: `moves ${String(moves)}`,
  };
}

/** The live transform scale of the earned marks, read **after** the fill-in settled. */
export async function settledEarnedScale(page: Page): Promise<number> {
  return page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('.ps-star[data-state="earned"]'));
    const scales = nodes.map((node) => {
      const transform = getComputedStyle(node).transform;
      return transform === "none" ? 1 : new DOMMatrixReadOnly(transform).a;
    });
    return scales.length === 0 ? Number.NaN : Math.min(...scales);
  });
}

/** How many animations are still running anywhere on the star field (0 once settled). */
export async function runningStarAnimations(page: Page): Promise<number> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll(".ps-star")).reduce(
      (total, node) =>
        total + node.getAnimations().filter((animation) => animation.playState === "running").length,
      0,
    ),
  );
}

/** The live animation record of every earned mark. */
export interface LiveStarAnimation {
  readonly name: string;
  readonly duration: string;
  readonly delay: string;
  readonly currentTime: number;
  readonly startTime: number | null;
  readonly playState: string;
}

/** Read the earned marks' animation records (after settling, with no sleeps). */
export async function starAnimations(page: Page): Promise<readonly LiveStarAnimation[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('.ps-star[data-state="earned"]')).map((node) => {
      const animation = node.getAnimations()[0] as
        | (Animation & { readonly animationName?: string })
        | undefined;
      const style = getComputedStyle(node);
      return {
        name: animation?.animationName ?? style.animationName,
        duration: style.animationDuration,
        delay: style.animationDelay,
        currentTime: Number(animation?.currentTime ?? 0),
        startTime:
          animation?.startTime === null || animation?.startTime === undefined
            ? null
            : Number(animation.startTime),
        playState: animation?.playState ?? "none",
      };
    }),
  );
}

/**
 * One CSS animation's record **on the document timeline** (QA-021).
 *
 * `startTime` and `duration` are the animation's own values on the document
 * timeline — not a wall-clock reading taken from the test — so a difference
 * between two of these records is a **causal relation between two animations**,
 * quantised only by the frame the animation started on. That is what makes
 * {@link animationsOn} the right instrument for "this beat ends inside that beat":
 * a rAF observer can only report *when it noticed* each beat end (one frame late,
 * per beat, on a grid that coarsens under load — the cloud row's failure), while
 * these two numbers compose exactly.
 */
export interface DocumentTimelineAnimation {
  readonly name: string;
  readonly playState: string;
  readonly currentTime: number;
  /** When the animation started on the document timeline, in ms, or `null`. */
  readonly startTime: number | null;
  /** Its own computed duration, in ms (`getComputedTiming().duration`). */
  readonly durationMs: number | null;
  /** The used `animation-duration` longhand, as declared. */
  readonly declaredDuration: string;
}

/** Every animation on `selector`'s first match, read on the document timeline. */
export async function animationsOn(
  page: Page,
  selector: string,
): Promise<readonly DocumentTimelineAnimation[]> {
  return page.evaluate((css: string) => {
    const node = document.querySelector(css);
    if (node === null) return [];
    return node.getAnimations().map((animation) => {
      const timing = (animation.effect as KeyframeEffect | null)?.getComputedTiming();
      const declared = timing?.duration ?? null;
      return {
        name: (animation as Animation & { readonly animationName?: string }).animationName ?? "",
        playState: animation.playState,
        currentTime: Number(animation.currentTime ?? -1),
        startTime: animation.startTime === null ? null : Number(animation.startTime),
        durationMs: typeof declared === "number" ? declared : null,
        declaredDuration: getComputedStyle(node).animationDuration,
      };
    });
  }, selector);
}

/* ────────────────────── the A-11 census, per phase ─────────────────────── */

export interface CensusRow {
  readonly ref: LevelRef;
  readonly bestMoves: number;
  readonly runMoves: number;
  readonly phase: "A" | "B";
}

/**
 * Force the all-three-states panel on `ref` and census it, in the phase the win ends
 * in: seed a better record, walk a 1★ run, then screenshot the row's own pixels.
 */
export async function censusAllThreeStates(page: Page, row: CensusRow): Promise<FieldCensus | null> {
  await installPixelReadback(page);
  await openLevel(page, levelUrl(row.ref.id));
  await seedBest(page, { [String(row.ref.id)]: row.bestMoves });
  await pressRoute(page, paddedRoute(row.ref, detoursFor(row.ref.par, row.runMoves)));
  await expect.poll(async () => (await hud(page)).won, { timeout: 5_000 }).toBe(true);
  await settle(page);
  await settle(page);
  const state = await hud(page);
  expect(state.phase, "the panel renders in the phase the winning flip left").toBe(row.phase);
  expect(await slotStates(page)).toEqual(["earned", "held", "empty"]);
  return fieldCensus(page, censusTokens(row.phase));
}

/**
 * The A-11 pass shape, as one function so every profile and phase is the same
 * measurement.
 *
 * Every threshold is derived from the shipped geometry, not typed:
 * - the filled silhouette's own **box share** is `5·R·r·sin(π/5)` (analytic 0.281);
 * - the hollow share is `held / earned` **of the sub-pixel areas** — the fraction of
 *   that silhouette the 0.8-scaled knock-out *leaves* — which is `1 − 0.8² = 36.0 %`
 *   analytically and is the row's declared `31–41 %` band. It is read from
 *   {@link MarkCensus.coverage} and not from the hard mask: the wall between two points
 *   of a 20 px star is 0.76 px wide, so a nearest-reference count rounds the ring's rim
 *   into noise (measured 0.35 in phase A and 0.26 in phase B, both 0.36 by sub-pixel
 *   area — that phase spread is the proof);
 * - `ratio` is the spec's own `≈ 2.78:1` (the reciprocal of the row above);
 * - the `empty` dot's box share is `π (d/2)² / box²` (analytic 0.049);
 * - the `≥ 3.0:1` floor is R-C3's non-text criterion, measured on the painted plate.
 */
export function expectCensus(census: FieldCensus, label: string): void {
  const silhouette = silhouetteShare();
  const dot = dotShare();
  // eslint-disable-next-line no-console
  console.log(
    `[QA-019] A-11 ${label} plate=${census.plate.join(",")} (token ${census.plateToken.join(",")}) ` +
      `gold=${census.gold?.join(",") ?? "null"} dot=${census.dot?.join(",") ?? "null"} ` +
      `area earned=${r2(census.earned.coverage)} held=${r2(census.held.coverage)} empty=${r2(census.empty.coverage)} ` +
      `(analytic ${r2(silhouette)} / ${r2(silhouette * (1 - STAR_KNOCKOUT_SCALE ** 2))} / ${r2(dot)}) ` +
      `hollow=${r2(census.held.coverage / census.earned.coverage)} ratio=${r2(census.ratio)} ` +
      `maskShares earned=${r2(census.earned.share)} held=${r2(census.held.share)} counts=${String(census.earned.count)}/${String(census.held.count)} ` +
      `dotDia=${census.dotDiameterCss === null ? "null" : r2(census.dotDiameterCss)}px ` +
      `soScale=${r2(census.grid.scale)} ` +
      `contrast gold/plate=${r2(census.goldPlate)} dot/plate=${r2(census.dotPlate)}`,
  );

  // the ground is the plate the spec names, and it is the colour that was painted
  expect(
    channelDistance(census.plate, census.plateToken),
    `${label}: the row sits on ground.plate`,
  ).toBeLessThanOrEqual(4);
  expect(census.gold, `${label}: an earned mark is painted`).not.toBeNull();
  expect(census.dot, `${label}: an empty mark is painted`).not.toBeNull();
  if (census.gold === null || census.dot === null) return;
  expect(channelDistance(census.gold, census.goldToken), `${label}: earned/hollow are obj.goal`).toBeLessThanOrEqual(6);
  expect(channelDistance(census.dot, census.dotToken), `${label}: the dot is text.secondary`).toBeLessThanOrEqual(6);

  // the painted areas: the declared silhouette, the 0.8 knock-out's own wall and the
  // ratio between them — all sub-pixel, so a fractional slot offset cannot flip a
  // measurement to the other side of a threshold.
  expect(
    census.earned.coverage,
    `${label}: the earned mark covers the declared silhouette's own area`,
  ).toBeGreaterThan(silhouette - 0.02);
  expect(census.earned.coverage, `${label}: …and no stray ink beyond it`).toBeLessThan(silhouette + 0.02);
  expect(census.empty.coverage, `${label}: the empty dot covers π(d/2)²/box²`).toBeGreaterThan(dot - 0.015);
  expect(census.empty.coverage, `${label}: …and nothing more`).toBeLessThan(dot + 0.015);
  const hollow = census.held.coverage / census.earned.coverage;
  expect(hollow, `${label}: hollow share inside the declared 31–41 % band`).toBeGreaterThanOrEqual(0.31);
  expect(hollow, `${label}: hollow share inside the declared 31–41 % band`).toBeLessThanOrEqual(0.41);
  expect(census.ratio, `${label}: fill mass ≈ 2.78:1`).toBeGreaterThan(2.4);
  expect(census.ratio, `${label}: fill mass ≈ 2.78:1`).toBeLessThan(3.2);
  expect(census.dotDiameterCss ?? 0, `${label}: the empty dot is 5 CSS px Ø`).toBeGreaterThan(STAR_DOT_PX - 0.6);
  expect(census.dotDiameterCss ?? 99, `${label}: the empty dot is 5 CSS px Ø`).toBeLessThan(STAR_DOT_PX + 0.6);

  // …and the hard nearest-reference mask still sees a figure with a knocked-out middle
  // rather than two unrelated blobs (a coarse sanity check, not an area claim).
  expect(census.earned.share, `${label}: the filled mark is a solid mask`).toBeGreaterThan(0.2);
  expect(census.held.share, `${label}: the hollow mask is strictly smaller`).toBeLessThan(census.earned.share);

  // R-C3's non-text floor, measured on the painted pixels
  expect(census.goldPlate, `${label}: filled/hollow vs ground.plate`).toBeGreaterThanOrEqual(3.0);
  expect(census.dotPlate, `${label}: empty vs ground.plate`).toBeGreaterThanOrEqual(3.0);
}
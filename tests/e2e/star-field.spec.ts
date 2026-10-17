/**
 * QA-019 (desktop profile) — **the post-win star field, acceptance rows A-11 / A-12**
 * (`docs/ui-ux.md` V0.9.7 §5.5 + §6.6, ADR-`design-0005` Ruling A).
 *
 * ── What is measured here, and where the truth comes from ────────────────────
 * GAME-004 shipped one added row on the frozen panel: `starsFor(moves, par)` (pinned
 * in the unit tier by `tests/unit/stars-rating.test.ts`), a win-only monotone store
 * (pinned by `tests/unit/stars-persistence.test.ts`) and **one additive `.ps-stars`
 * row** with three `data-state` slots, an extended live line and a 120 ms fill-in
 * carrying B13. This file is the browser half: what the *running page* presents.
 *
 * Nothing here is typed from a screenshot. The (run, best) pairs are **forced**, not
 * hoped for: the level is won after `2 · d` extra moves (a reversible detour pair at
 * the pre-final state, derived from `applyMove`), which lands the run on the ruling's
 * own boundary row (`moves == par + k1` ⇒ 3★, `moves == par + k2` ⇒ 2★, above ⇒ 1★),
 * and the stored record is seeded into `ps.echoGrid/stars@1` **after** `openLevel`
 * (which clears storage at navigation) and **before** the winning press. The seed
 * method is one `localStorage.setItem` of the family's own payload — the key, the
 * schema number and the slot count all come from the shipped module, never a typed
 * string.
 *
 * ── Why the walk pads instead of editing state ───────────────────────────────
 * A worse-than-best run must be *a real run*. Padding with the detour pair costs two
 * moves per repetition (ADR-0009's checkerboard quantum) and returns the player to
 * the same tile **in the same phase**, so the win it walks is legal, deterministic and
 * identical to a slow human's — and the HUD's own move counter is asserted against
 * the arithmetic, so a row can never silently walk a different length.
 *
 * ── A-11's contrast is measured on painted pixels ────────────────────────────
 * `helpers/star-pixels.ts` screenshots the row (plus the 8 px of the card's own
 * `ground.plate` beside it) and decodes it in the page. The plate reference is that
 * margin and is cross-checked against `theme(phase).ground.plate`; the ink references
 * are `theme(phase).obj.goal` / `text.secondary`. The declaration `≥ 3.0:1` is then
 * computed from **what was painted**, not from the token hexes alone.
 */

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

import { STAR_BOX_PX } from "@/game/hud/hud-styles";
import { STAR_SLOTS } from "@/game/systems/stars";
import { LAYOUT, theme } from "@/game/theme/tokens";

import { hexToRgb } from "./helpers/art";
import { measureFrameGrid } from "./helpers/capture";
import {
  boardGeometry,
  hud,
  installPixelReadback,
  openLevel,
  pressRoute,
  settle,
} from "./helpers/game";
import { levelUrl } from "./helpers/levels";
import {
  A_LADDER,
  A_REF,
  B_REF,
  censusAllThreeStates,
  censusTokens,
  detoursFor,
  expectCensus,
  frozenStrings,
  paddedRoute,
  panelStrings,
  r2,
  runningStarAnimations,
  seedBest,
  settledEarnedScale,
  silhouetteShare,
  slackK1,
  slotStates,
  starAnimations,
  storedBytes,
} from "./helpers/star-field";
import { captureClip, fieldCensus, gridDiff, rowIsThreeSlots } from "./helpers/star-pixels";

/* ──────────────────────────── the frame probe ──────────────────────────── */

interface StarProbeSlot {
  state: string | null;
  scale: number;
  animation: {
    name: string;
    duration: string;
    delay: string;
    currentTime: number;
    startTime: number | null;
    playState: string;
  } | null;
}

interface StarProbe {
  keyAt: number | null;
  unhideAt: number | null;
  panelOpacity: number | null;
  nextHit: string | null;
  nextUnder: string | null;
  nextDisabled: boolean | null;
  nextBox: { x: number; y: number; width: number; height: number } | null;
  viewport: { width: number; height: number } | null;
  slots: StarProbeSlot[];
  starSeenRunning: boolean;
  panelSeenRunning: boolean;
  starSettledAt: number | null;
  panelSettledAt: number | null;
}

/**
 * One in-page instrument for the timing rows. It stamps the winning keydown and then,
 * on the **first** frame the overlay is unhidden, snapshots everything that only
 * exists at that instant: the panel's opacity, the hit test at the Next button's
 * centre, and each `.ps-star`'s `data-state`, transform scale and animation record.
 *
 * It keeps ticking until both the fill-in and the panel entrance have been seen
 * *running* and have then stopped, so "settled" is an observation of the page's own
 * animation clock rather than a sleep.
 */
async function installStarProbe(page: Page): Promise<void> {
  await page.evaluate(() => {
    interface Slot {
      state: string | null;
      scale: number;
      animation: {
        name: string;
        duration: string;
        delay: string;
        currentTime: number;
        startTime: number | null;
        playState: string;
      } | null;
    }
    interface Probe {
      keyAt: number | null;
      unhideAt: number | null;
      panelOpacity: number | null;
      nextHit: string | null;
      nextUnder: string | null;
      nextDisabled: boolean | null;
      nextBox: { x: number; y: number; width: number; height: number } | null;
      viewport: { width: number; height: number } | null;
      slots: Slot[];
      starSeenRunning: boolean;
      panelSeenRunning: boolean;
      starSettledAt: number | null;
      panelSettledAt: number | null;
    }
    const holder = window as unknown as { __psStarProbe?: Probe };
    const probe: Probe = {
      keyAt: null,
      unhideAt: null,
      panelOpacity: null,
      nextHit: null,
      nextUnder: null,
      nextDisabled: null,
      nextBox: null,
      viewport: null,
      slots: [],
      starSeenRunning: false,
      panelSeenRunning: false,
      starSettledAt: null,
      panelSettledAt: null,
    };
    holder.__psStarProbe = probe;
    window.addEventListener(
      "keydown",
      () => {
        probe.keyAt = performance.now();
      },
      true,
    );

    const scaleOf = (node: Element): number => {
      const transform = getComputedStyle(node).transform;
      if (transform === "none") return 1;
      return new DOMMatrixReadOnly(transform).a;
    };
    const animationOf = (node: Element): Slot["animation"] => {
      const animation = node.getAnimations()[0] as
        | (Animation & { readonly animationName?: string })
        | undefined;
      if (animation === undefined) return null;
      const style = getComputedStyle(node);
      return {
        name: animation.animationName ?? "",
        duration: style.animationDuration,
        delay: style.animationDelay,
        currentTime: Number(animation.currentTime ?? 0),
        startTime: animation.startTime === null ? null : Number(animation.startTime),
        playState: animation.playState,
      };
    };
    const isRunning = (node: Element): boolean =>
      node.getAnimations().some((animation) => animation.playState === "running");

    const tick = (): void => {
      const overlay = document.querySelector(".ps-overlay");
      const visible = overlay !== null && !overlay.hasAttribute("hidden");
      const now = performance.now();
      if (visible && probe.unhideAt === null) {
        probe.unhideAt = now;
        const dialog = document.querySelector(".ps-dialog");
        probe.panelOpacity =
          dialog === null ? null : Number.parseFloat(getComputedStyle(dialog).opacity);
        const next = dialog?.querySelector<HTMLElement>(".ps-dialog-actions .ps-btn-primary") ?? null;
        if (next !== null) {
          const box = next.getBoundingClientRect();
          const under = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
          probe.nextHit = under?.closest("button")?.getAttribute("aria-label") ?? null;
          probe.nextUnder = under === null ? null : `${under.tagName}.${(under as HTMLElement).className || "-"}`;
          probe.nextBox = { x: box.x, y: box.y, width: box.width, height: box.height };
          probe.viewport = { width: window.innerWidth, height: window.innerHeight };
          probe.nextDisabled = next instanceof HTMLButtonElement ? next.disabled : null;
        }
        probe.slots = Array.from(document.querySelectorAll(".ps-star")).map((node) => ({
          state: node.getAttribute("data-state"),
          scale: scaleOf(node),
          animation: animationOf(node),
        }));
      }
      if (visible) {
        const earned = Array.from(document.querySelectorAll('.ps-star[data-state="earned"]'));
        if (earned.some(isRunning)) probe.starSeenRunning = true;
        if (probe.starSeenRunning && probe.starSettledAt === null && !earned.some(isRunning)) {
          probe.starSettledAt = now;
        }
        const panel = document.querySelector(".ps-dialog");
        if (panel !== null) {
          if (isRunning(panel)) probe.panelSeenRunning = true;
          if (probe.panelSeenRunning && probe.panelSettledAt === null && !isRunning(panel)) {
            probe.panelSettledAt = now;
          }
        }
      }
      if (probe.starSettledAt !== null && probe.panelSettledAt !== null) return;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

async function readProbe(page: Page): Promise<StarProbe | null> {
  return page.evaluate(
    () => (window as unknown as { __psStarProbe?: StarProbe }).__psStarProbe ?? null,
  );
}

/** The shell's own `--ps-*` data, plus the panel's computed entrance. */
async function starVars(page: Page): Promise<{
  starMs: string;
  starScaleFrom: string;
  panelDuration: string;
} | null> {
  return page.evaluate(() => {
    const shell = document.querySelector(".ps-shell");
    const panel = document.querySelector(".ps-dialog");
    if (shell === null || panel === null) return null;
    const shellStyle = getComputedStyle(shell);
    return {
      starMs: shellStyle.getPropertyValue("--ps-star-ms").trim(),
      starScaleFrom: shellStyle.getPropertyValue("--ps-star-scale-from").trim(),
      panelDuration: getComputedStyle(panel).animationDuration,
    };
  });
}

/* ────────────────── A-11: the field exists only on a win ────────────────── */

test.describe("§5.5 A-11 — the field is post-win only, and the frozen strings do not move", () => {
  test("absent while the board is live, and a win's title/body are character-identical", async ({
    page,
  }) => {
    await openLevel(page, levelUrl(A_REF.id));

    // ── the negative half: NOTHING of the field exists during play (SF-5's "never")
    const live = await page.evaluate(() => ({
      overlayHidden: document.querySelector(".ps-overlay")?.hasAttribute("hidden") ?? false,
      rows: document.querySelectorAll(".ps-stars").length,
      states: document.querySelectorAll(".ps-star[data-state]").length,
      inTopBar: document.querySelectorAll(".ps-top .ps-stars, .ps-top .ps-star").length,
      topBarText: document.querySelector(".ps-top")?.textContent ?? "",
    }));
    expect(live.overlayHidden, "the panel is shut during play").toBe(true);
    expect(live.states, "no slot carries a state before a win").toBe(0);
    expect(live.inTopBar, "the live HUD never carries the field (GD-010 stands)").toBe(0);
    expect(live.topBarText).not.toMatch(/star/i);

    // ── the positive half: the win's own strings, unchanged by the added row
    const moves = A_LADDER.boundary3;
    await pressRoute(page, paddedRoute(A_REF, detoursFor(A_REF.par, moves)));
    await expect.poll(async () => (await hud(page)).won, { timeout: 5_000 }).toBe(true);
    const strings = await panelStrings(page);
    const frozen = frozenStrings(A_REF, moves);
    expect(strings.title).toBe(frozen.title);
    expect(strings.body).toBe(frozen.body);
    expect(`${strings.title} ${strings.body}`).not.toMatch(/star|★|☆/);
    // eslint-disable-next-line no-console
    console.log(
      `[QA-019] A-11 first clear L${String(A_REF.id)} par=${String(A_REF.par)} moves=${String(moves)} ` +
        `title="${strings.title}" body="${strings.body}"`,
    );
  });

  test("the field is one aria-hidden row of three slots, 3 × 20 px + 2 gaps", async ({ page }) => {
    await openLevel(page, levelUrl(A_REF.id));
    const moves = A_LADDER.boundary3;
    await pressRoute(page, paddedRoute(A_REF, detoursFor(A_REF.par, moves)));
    await expect.poll(async () => (await hud(page)).won, { timeout: 5_000 }).toBe(true);
    await settle(page);
    await settle(page);

    const shape = await page.evaluate(() => {
      const row = document.querySelector(".ps-stars");
      return {
        rows: document.querySelectorAll(".ps-stars").length,
        ariaHidden: row?.getAttribute("aria-hidden") ?? null,
        slots: row?.querySelectorAll(":scope > .ps-star").length ?? 0,
        tagged: row?.querySelectorAll(":scope > .ps-star[data-state]").length ?? 0,
      };
    });
    expect(shape).toEqual({ rows: 1, ariaHidden: "true", slots: STAR_SLOTS, tagged: STAR_SLOTS });

    const census = await fieldCensus(page, censusTokens("A"));
    expect(census, "the row has a box").not.toBeNull();
    if (census === null) return;
    expect(
      rowIsThreeSlots(census, STAR_BOX_PX, LAYOUT.controlGap),
      `the row is exactly ${String(3 * STAR_BOX_PX + 2 * LAYOUT.controlGap)} CSS px wide`,
    ).toBe(true);
    expect(await slotStates(page)).toEqual(["earned", "earned", "earned"]);
  });
});

/* ───────────── A-12: the (run, best) matrix, forced by real runs ─────────── */

test.describe("§5.5 SF-3/SF-5 A-12 — earned / held / empty on real runs", () => {
  test("a first clear at the exact 3★ boundary is all filled, and the live line carries no best", async ({
    page,
  }) => {
    await openLevel(page, levelUrl(A_REF.id));
    const moves = A_LADDER.boundary3; // == par + k1, so the ≤ semantics must land on 3★
    await pressRoute(page, paddedRoute(A_REF, detoursFor(A_REF.par, moves)));
    await expect.poll(async () => (await hud(page)).won, { timeout: 5_000 }).toBe(true);

    const strings = await panelStrings(page);
    expect(strings.body, "the run's own move count is the boundary row").toBe(`moves ${String(moves)}`);
    expect(await slotStates(page)).toEqual(["earned", "earned", "earned"]);
    // SF-5: a first clear draws NO hollow mark, and `, best` appears only when the
    // record is ahead of this run — here they are the same run.
    expect(strings.live).toBe(`${strings.title}. ${strings.body}. stars 3 of 3`);
    expect(await storedBytes(page), "the first clear recorded the run").toContain(`"${String(A_REF.id)}"`);
  });

  test("a worse run against a stored 3★ record draws the hollow mark and extends the live line", async ({
    page,
  }) => {
    await openLevel(page, levelUrl(A_REF.id));
    const seeded = await seedBest(page, { [String(A_REF.id)]: A_REF.par });
    const moves = A_LADDER.boundary2; // == par + k2, so the ≤ semantics must land on 2★
    await pressRoute(page, paddedRoute(A_REF, detoursFor(A_REF.par, moves)));
    await expect.poll(async () => (await hud(page)).won, { timeout: 5_000 }).toBe(true);

    const strings = await panelStrings(page);
    expect(strings.body).toBe(`moves ${String(moves)}`);
    expect(await slotStates(page)).toEqual(["earned", "earned", "held"]);
    expect(strings.live).toBe(`${strings.title}. ${strings.body}. stars 2 of 3, best 3 of 3`);
    // Monotone on moves: a worse run is not a write at all, so the bytes are identical.
    expect(await storedBytes(page), "a worse run must not rewrite the record").toBe(seeded);
    // eslint-disable-next-line no-console
    console.log(`[QA-019] A-12 worse run L${String(A_REF.id)}: run 2★ vs stored 3★ → E E held`);
  });

  test("an equal run draws no hollow mark and leaves the stored bytes untouched", async ({ page }) => {
    await openLevel(page, levelUrl(A_REF.id));
    const moves = A_LADDER.boundary2;
    const seeded = await seedBest(page, { [String(A_REF.id)]: moves });
    await pressRoute(page, paddedRoute(A_REF, detoursFor(A_REF.par, moves)));
    await expect.poll(async () => (await hud(page)).won, { timeout: 5_000 }).toBe(true);

    const strings = await panelStrings(page);
    expect(await slotStates(page)).toEqual(["earned", "earned", "empty"]);
    expect(strings.live, "matched record: no `, best` clause").toBe(
      `${strings.title}. ${strings.body}. stars 2 of 3`,
    );
    expect(strings.live).not.toContain(", best");
    expect(await storedBytes(page), "an equal run is not an improvement").toBe(seeded);
  });

  test("run 1★ against a stored 2★ record shows all three states at once", async ({ page }) => {
    await openLevel(page, levelUrl(A_REF.id));
    const seeded = await seedBest(page, { [String(A_REF.id)]: A_LADDER.boundary2 });
    const moves = A_LADDER.oneStar;
    await pressRoute(page, paddedRoute(A_REF, detoursFor(A_REF.par, moves)));
    await expect.poll(async () => (await hud(page)).won, { timeout: 5_000 }).toBe(true);

    const strings = await panelStrings(page);
    expect(strings.body).toBe(`moves ${String(moves)}`);
    expect(await slotStates(page), "earned · held · empty, one mark each").toEqual([
      "earned",
      "held",
      "empty",
    ]);
    expect(strings.live).toBe(`${strings.title}. ${strings.body}. stars 1 of 3, best 2 of 3`);
    expect(await storedBytes(page)).toBe(seeded);
  });
});

/* ───────────── A-11: the painted census, one row per phase ──────────────── */

test.describe("§5.5 SF-4 A-11 — the marks on the painted plate, both phases", () => {
  test("phase A: filled / hollow / dot all bind ≥ 3.0:1 and the knock-out ratio is ≈ 2.78:1", async ({
    page,
  }) => {
    const census = await censusAllThreeStates(page, {
      ref: A_REF,
      bestMoves: A_LADDER.boundary2,
      runMoves: A_LADDER.oneStar,
      phase: "A",
    });
    expect(census).not.toBeNull();
    if (census === null) return;
    expectCensus(census, `phase A (L${String(A_REF.id)})`);
  });

  test("phase B: the same census on a win whose last flip ends in shadow", async ({ page }) => {
    const census = await censusAllThreeStates(page, {
      ref: B_REF,
      bestMoves: B_REF.par + 2 * slackK1(B_REF.par),
      runMoves: B_REF.par + 2 * slackK1(B_REF.par) + 2,
      phase: "B",
    });
    expect(census).not.toBeNull();
    if (census === null) return;
    expectCensus(census, `phase B (L${String(B_REF.id)})`);
    // The star family is the goal's own gold in BOTH phases (R-C10): the same census
    // law, a different token row — the B gold is the loose one at A and the tight one
    // here, so the two rows together bound the field's own palette.
    expect(census.plateToken).toEqual(hexToRgb(theme("B").ground.plate));
  });
});

/* ─────────────── A-12: the fill-in rides B13, Next frame 1 ──────────────── */

test.describe("§6.6 B13 / §5.5 SF-6 A-12 — the field's one motion", () => {
  test("the fill-in is 120 ms from scale 0.86, has no stagger, settles inside the flourish, and Next is live from frame 1", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await openLevel(page, levelUrl(A_REF.id));
    await settle(page);
    const grid = await measureFrameGrid(page);

    await installStarProbe(page);
    const moves = A_LADDER.boundary3;
    await pressRoute(page, paddedRoute(A_REF, detoursFor(A_REF.par, moves)));

    // The probe's own clock, not a sleep: it resolves on the unhide frame and stops
    // itself once both beats have been seen running and then settled.
    await expect
      .poll(async () => (await readProbe(page))?.unhideAt ?? null, {
        timeout: 5_000,
        message: "the win panel never unhid after the winning route",
      })
      .not.toBeNull();
    await expect
      .poll(async () => (await readProbe(page))?.panelSettledAt ?? null, { timeout: 5_000 })
      .not.toBeNull();

    const vars = await starVars(page);
    expect(vars, "the shell carries the field's two data values").not.toBeNull();
    if (vars === null) return;
    expect(vars.starMs, "SF-6: the fill-in window, as data").toBe("120ms");
    expect(vars.starScaleFrom, "SF-6: the pop's start scale, as data").toBe("0.86");
    // Structural half of "inside B13's 380–400 ms flourish": the fill-in is strictly
    // shorter than the entrance it rides, so it can only end inside it.
    expect(Number.parseFloat(vars.starMs)).toBeLessThan(Number.parseFloat(vars.panelDuration) * 1000);

    const settled = await readProbe(page);
    expect(settled).not.toBeNull();
    if (settled === null) return;
    const earned = settled.slots.filter((slot) => slot.state === "earned");
    expect(earned.length, "the boundary run is 3★").toBe(3);
    // The probe is the witness that the fill-in *happened*: it watched the earned
    // marks run and then stop on the page's own animation clock (no sleeps here).
    expect(settled.starSeenRunning, "the fill-in was observed running").toBe(true);
    expect(settled.starSettledAt, "…and observed to finish").not.toBeNull();
    // On the unhide frame the fill-in is at its very start (the `both` fill holds the
    // 0.86 from-state while the animation is still pending), not part-way through.
    for (const slot of earned) {
      expect(slot.animation?.currentTime ?? 99, "the fill-in is at its start on the unhide frame").toBeLessThanOrEqual(2 * grid.gridMs);
    }

    // …and the record read back **after** settling: one 120 ms one-shot per mark.
    const records = await starAnimations(page);
    expect(records.length, "one record per earned mark").toBe(3);
    for (const record of records) {
      expect(record.name, "the earned mark carries the one-shot fill-in").toBe("ps-star-in");
      expect(record.duration).toBe("0.12s");
      expect(record.delay, "delay 0 — the entrance's own instant").toBe("0s");
      expect(record.playState, "finished, not looping").toBe("finished");
      expect(record.currentTime, "…at the end of its 120 ms window").toBeGreaterThanOrEqual(120);
      expect(record.currentTime).toBeLessThanOrEqual(121);
      expect(record.startTime, "started, not waiting to start").not.toBeNull();
    }
    // No per-star stagger: three identical start times on the document timeline.
    const startTimes = new Set(records.map((record) => (record.startTime ?? -1).toFixed(3)));
    expect(startTimes.size, `no stagger — start times ${[...startTimes].join(",")}`).toBe(1);

    // The pop exists on the unhide frame and is gone once settled.
    const firstFrameScale = Math.min(...earned.map((slot) => slot.scale));
    const settledScale = await settledEarnedScale(page);
    expect(firstFrameScale, "the mark enters at < 1 on the unhide frame").toBeLessThan(0.95);
    expect(firstFrameScale, "…and no lower than the declared 0.86 (within a frame)").toBeGreaterThan(0.82);
    expect(settledScale, "…and lands at exactly 1").toBeCloseTo(1, 2);
    expect(await runningStarAnimations(page), "a finished fill-in leaves nothing running").toBe(0);

    // The observed window, banded on *this* machine's frame grid — the same shape the
    // standing B13 row (portal-mount.spec.ts) uses: the exact 120 ms is pinned as data
    // and in the animation record above, while a rAF observer can only see the settle
    // on a later frame. The declared window cannot pass unobserved (it cannot settle
    // before 120 ms), and the observer's own edge adds at most a frame at each end.
    const fillMs = settled.starSettledAt === null || settled.unhideAt === null ? Number.NaN : settled.starSettledAt - settled.unhideAt;
    const panelMs = settled.panelSettledAt === null || settled.unhideAt === null ? Number.NaN : settled.panelSettledAt - settled.unhideAt;
    const delay = settled.keyAt === null || settled.unhideAt === null ? Number.NaN : settled.unhideAt - settled.keyAt;
    // eslint-disable-next-line no-console
    console.log(
      `[QA-019] A-12 timing grid=${r2(grid.gridMs)}ms panelDelay=${r2(delay)}ms fillMs=${r2(fillMs)}ms ` +
        `panelMs=${r2(panelMs)}ms fillExcess=${r2(fillMs - 120)}ms (3 frames = ${r2(3 * grid.gridMs)}ms) ` +
        `firstFrameScale=${r2(firstFrameScale)} settledScale=${r2(settledScale)} ` +
        `keyTimes={${earned.map((slot) => `${slot.animation?.playState ?? "none"}@${r2(slot.animation?.currentTime ?? -1)}`).join("|")}} ` +
        `opacityAtUnhide=${String(settled.panelOpacity)} ` +
        `nextHit=${settled.nextHit ?? "null"} nextUnder=${settled.nextUnder ?? "null"} nextBox=${JSON.stringify(settled.nextBox)} viewport=${JSON.stringify(settled.viewport)} nextDisabled=${String(settled.nextDisabled)} startTimes=${[...startTimes].join(",")}`,
    );
    expect(fillMs, "the fill-in cannot settle before its own 120 ms window ends").toBeGreaterThanOrEqual(120);
    expect(fillMs - 120, "…and no more than three of this machine's frames after it").toBeLessThanOrEqual(3 * grid.gridMs);
    // …and it is done *inside* the panel's own entrance (the structural half — the
    // declared 120 ms is shorter than the declared 160 ms entrance — is asserted above
    // on the computed style), so the field rides B13 rather than outliving it.
    expect(fillMs, "the fill-in ends inside the panel's own entrance").toBeLessThan(panelMs);
    expect(panelMs, "the entrance is its declared 160 ms, within frames").toBeGreaterThanOrEqual(160);
    expect(panelMs, "…and not longer").toBeLessThanOrEqual(160 + 3 * grid.gridMs);

    // B13's law, unchanged by the added row: Next is tappable on the first frame.
    expect(settled.nextHit, "the element under Next's centre is Next, on the unhide frame").toBe("Next");
    expect(settled.nextDisabled, "…and it is live input, not a disabled placeholder").toBe(false);

    const nextBox = await page.getByRole("button", { name: "Next" }).boundingBox();
    expect(nextBox).not.toBeNull();
    if (nextBox === null) return;
    await page.mouse.click(nextBox.x + nextBox.width / 2, nextBox.y + nextBox.height / 2);
    await expect.poll(async () => (await hud(page)).won, { timeout: 5_000 }).toBe(false);
    const advanced = await hud(page);
    expect(advanced.moves, "a raw first-frame click advanced the level").toBe(0);
  });

  test("idle: the field is exactly 0 px over 2 s, and nothing is left running", async ({ page }) => {
    await installPixelReadback(page);
    await openLevel(page, levelUrl(A_REF.id));
    await seedBest(page, { [String(A_REF.id)]: A_LADDER.boundary2 });
    await pressRoute(page, paddedRoute(A_REF, detoursFor(A_REF.par, A_LADDER.oneStar)));
    await expect.poll(async () => (await hud(page)).won, { timeout: 5_000 }).toBe(true);
    await settle(page);
    await settle(page);

    const row = await page.locator(".ps-stars").boundingBox();
    expect(row).not.toBeNull();
    if (row === null) return;
    const before = await captureClip(page, row);
    await page.waitForTimeout(2_000);
    const after = await captureClip(page, row);
    const diff = gridDiff(before, after);
    // eslint-disable-next-line no-console
    console.log(
      `[QA-019] A-12 idle field changed=${String(diff.changed)}/${String(diff.total)} maxDelta=${String(diff.maxDelta)}`,
    );
    expect(diff.changed, "SF-8: no shimmer, twinkle, pulse, breathe or loop — 0 px").toBe(0);
    expect(diff.maxDelta).toBe(0);

    const running = await page.evaluate(() =>
      document.getAnimations().filter((animation) => animation.playState === "running").length,
    );
    expect(running, "a settled panel has no running animation anywhere").toBe(0);
  });
});

/* ──────────────── A-12: reduced motion is a data flip ───────────────────── */

test.describe("§5.5 SF-7 / §6.4 MV-4 A-12 — the reduced form", () => {
  test.use({ reducedMotion: "reduce" });

  test("--ps-star-scale-from flips to 1 (a data flip, not display:none) and the marks stay legible", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await installPixelReadback(page);
    await openLevel(page, levelUrl(A_REF.id));
    await settle(page);

    await installStarProbe(page);
    const moves = A_LADDER.boundary3;
    await pressRoute(page, paddedRoute(A_REF, detoursFor(A_REF.par, moves)));
    await expect
      .poll(async () => (await readProbe(page))?.unhideAt ?? null, { timeout: 5_000 })
      .not.toBeNull();

    const vars = await starVars(page);
    expect(vars).not.toBeNull();
    if (vars === null) return;
    expect(vars.starScaleFrom, "SF-7: one variable goes 0.86 → 1").toBe("1");
    // …and it is a *data flip*: the keyframes are still attached (no second code path
    // in the media query) and the slot is still a 20 px box, not a hidden element.
    const slot = await page.evaluate(() => {
      const node = document.querySelector('.ps-star[data-state="earned"]');
      if (node === null) return null;
      const style = getComputedStyle(node);
      const box = node.getBoundingClientRect();
      return {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        animationName: style.animationName,
        animationDuration: style.animationDuration,
        width: box.width,
        height: box.height,
      };
    });
    expect(slot).not.toBeNull();
    if (slot === null) return;
    expect(slot.display, "the reduced form is NOT display:none — the star is still drawn").not.toBe("none");
    expect(slot.visibility).toBe("visible");
    expect(slot.animationName, "the keyframes are kept; only the variable changes").toBe("ps-star-in");
    expect(slot.animationDuration).toBe("0.12s");
    expect(slot.width).toBe(STAR_BOX_PX);
    expect(slot.height).toBe(STAR_BOX_PX);

    const probe = await readProbe(page);
    expect(probe).not.toBeNull();
    const earned = probe?.slots.filter((entry) => entry.state === "earned") ?? [];
    const scale = Math.min(...earned.map((entry) => entry.scale));
    // eslint-disable-next-line no-console
    console.log(`[QA-019] A-12 reduced scaleAtUnhide=${r2(scale)} slots=${String(earned.length)}`);
    expect(earned.length).toBe(3);
    expect(scale, "no pop: the first frame is already at 1").toBeGreaterThan(0.98);

    // Legibility identical (R-M4): the same census survives with the motion removed.
    await settle(page);
    await settle(page);
    const census = await fieldCensus(page, censusTokens("A"));
    expect(census).not.toBeNull();
    if (census === null) return;
    expect(census.earned.coverage, "the earned mark is still the filled silhouette").toBeGreaterThan(
      silhouetteShare() - 0.02,
    );
    expect(census.goldPlate, "still ≥ 3.0:1 on the plate").toBeGreaterThanOrEqual(3.0);
    expect(await slotStates(page)).toEqual(["earned", "earned", "earned"]);
  });
});

/* ───────────────────── A-11: the field is on the canvas? no ─────────────── */
test.describe("§5.5 SF-1 — the marks are DOM geometry, never canvas ink", () => {
  test("the field is a laid-out DOM box above the canvas, not a draw call into it", async ({ page }) => {
    await openLevel(page, levelUrl(A_REF.id));
    await pressRoute(page, paddedRoute(A_REF, detoursFor(A_REF.par, A_LADDER.boundary3)));
    await expect.poll(async () => (await hud(page)).won, { timeout: 5_000 }).toBe(true);
    await settle(page);
    const geometry = await boardGeometry(page, A_REF.level);
    const row = await page.locator(".ps-stars").boundingBox();
    expect(row).not.toBeNull();
    if (row === null) return;

    // a real laid-out box of the declared geometry — the marks have no canvas copy
    expect(row.width, "3 slots + 2 gaps, in CSS px").toBeCloseTo(3 * STAR_BOX_PX + 2 * LAYOUT.controlGap, 0.5);
    expect(row.height).toBeCloseTo(STAR_BOX_PX, 0.5);
    expect(await page.locator(".ps-stars").isVisible()).toBe(true);

    // …and it is not a descendant of the board's canvas: the field's pixels can only
    // exist because the DOM painted them (which is also the only reason a screenshot
    // of that region can read §5.5's colours at all — `helpers/star-pixels.ts`).
    const dom = await page.evaluate(() => {
      const canvas = document.querySelector("#app canvas, canvas");
      const stars = document.querySelector(".ps-stars");
      return {
        insideCanvas: canvas !== null && stars !== null && canvas.contains(stars),
        starsInsideDialog: stars?.closest(".ps-dialog") !== null,
        canvases: document.querySelectorAll("canvas").length,
      };
    });
    expect(dom.insideCanvas, "the row is not inside the canvas element").toBe(false);
    expect(dom.starsInsideDialog, "…it is the win card's own row").toBe(true);
    expect(dom.canvases).toBe(1);

    // §7.3 reserves the board rect for the **persistent** overlay: the HUD never
    // intersects it. The win card is the documented modal exception — §12's judged
    // frame puts it "centred over the board middle" with the board's rows left visible
    // beside it — so the field's overlap *with the card* is expected, and is asserted
    // as such rather than silently inverted.
    const canvas = geometry.canvas;
    const overlaps =
      row.x < canvas.x + canvas.width &&
      row.x + row.width > canvas.x &&
      row.y < canvas.y + canvas.height &&
      row.y + row.height > canvas.y;
    expect(overlaps, "the win card (and the field in it) is the §12 modal over the board").toBe(true);
    const hudOutside = await page.evaluate(() => {
      const bars = Array.from(document.querySelectorAll(".ps-bar")).map((bar) => bar.getBoundingClientRect());
      const board = document.querySelector("canvas")?.getBoundingClientRect() ?? null;
      if (board === null) return null;
      return bars.every(
        (bar) =>
          bar.bottom <= board.top + 1 || bar.top >= board.bottom - 1 ||
          bar.right <= board.left + 1 || bar.left >= board.right - 1,
      );
    });
    expect(hudOutside, "§7.3: the HUD bars stay outside the board rect, win panel or not").toBe(true);
  });
});
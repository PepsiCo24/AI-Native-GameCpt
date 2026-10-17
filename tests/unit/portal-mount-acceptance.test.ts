/**
 * QA-017 — **GAME-003 art+motion acceptance, the unit tier**
 * (`docs/ui-ux.md` V0.9.6 §3.1e rows A-1/A-3/A-4 + §6.6 rows A-5/A-6/A-8/A-9/A-10).
 *
 * ── What this file is, and what it is not ────────────────────────────────────
 * GAME-003 mounted the signed A-06 portal pair **swapped** (R-PM1: `portal_b`
 * paints A, `portal_a` paints B) and added the §6.6 beats B6/B7/B10/B12/B13 as
 * per-frame scalars. This file is the **draw-call / mapping / data** evidence for
 * the rows that can be decided without pixels:
 *
 * | row | claim | tier here |
 * |---|---|---|
 * | A-1 | mount proof: the swap mapping, the both-ways guard, the mount set, the K-4 supersession | full |
 * | A-3 | the live/dormant state read is **structural** (raster vs vector outline + swirl), never hue | structural half |
 * | A-4 | art box `0.888 × cell`, centre-pivoted, subordinate to rank 3 | arithmetic half |
 * | A-5 | B6: one **full** arrival turn, only on the end that turns live, no new ink | full |
 * | A-6 | B7: the attract is **additive** on the R-C8 envelope with the `1 + 6 % + 2 %` ceiling; B10 has no motion | contract half (gap note below) |
 * | A-8 | idle stillness: `timeMs` is consumed by the **goal alone** | full |
 * | A-9 | reduced motion is a **data flip**: scale 1, turn 0, the state swap survives | full |
 * | A-10 | deny-list negatives: no idle motion on portals/switches/doors, no arcs at rest | full |
 *
 * The **pixel** halves (A-2 mapped contrast over the served PNGs, A-3's
 * desaturated-frame read at the B value-1.0 pair, A-5's rAF transient capture,
 * A-7's real press transform, A-8/A-9 on a live board) live in
 * `tests/e2e/portal-mount.spec.ts`; the served-byte census it mirrors is
 * `docs/assets/evidence-2026-10-17-portal-mount/portal_probe.py`.
 *
 * ── The K-4 supersession (recorded, never deleted) ───────────────────────────
 * §3.1e R-PM5 supersedes §3.3b **Entry-3's K-4 negative** — the probe rows named
 * `l11_dev_channel` / `l5_no_portal_strip` and the flag `portalMentioned: false`.
 * That negative said "the dev strip must not mention a portal"; the mount makes it
 * **false on purpose**, and §3.1e orders the supersession *recorded* rather than
 * the old probe quietly re-pointed. So the negative is replaced here by its
 * positive counterpart: {@link PLACEHOLDER_TO_ASSET} must now carry **both**
 * portal rows (A-06) — which is exactly what a derived table does once the two
 * `resolved: true` rows exist (`theme/assets.ts` R-P5: one placeholder cannot sit
 * in one table and not the other). No old assertion is deleted by this file.
 *
 * ── The two halves this file deliberately does NOT claim ─────────────────────
 * 1. **A-2 / the B value-1.0 arithmetic.** `portal_probe.py`'s numbers (swapped
 *    A **6.50 / 5.53**, B **6.25 / 5.49**; as-named A **2.24 / 1.91**, B
 *    **2.16 / 1.90**; `mute_live` A 1.70:1 / ΔL\* 14.7, B **1.03:1 / ΔL\* 1.0**)
 *    are measured over **delivered bytes** by decoding the PNGs. A node-tier test
 *    cannot decode them without a PNG dependency, so the number is quoted from the
 *    probe (re-run by QA-017: 26/26 gates PASS) and re-measured in-page by the e2e
 *    tier's served-PNG decode. Nothing here invents a colour.
 * 2. **B7/B10's observability.** `GOAL_ATTRACT_MS` / `GOAL_ATTRACT_PEAK` and
 *    `isInGoalNeighbourhood` are **private** in `renderer/board-view.ts:132-136`,
 *    their call sites (`:578-580` the per-state re-read, `:619-624` the `false → true`
 *    firing gate) and the scalar channel (`attractAt` `:335`, `attractValue`
 *    `:755-766`) are private too, with no page hook. The registry contract is pinned
 *    here; the *state rule* (re-arm only after leaving the one-cell ring) is observable
 *    only from pixels, whose noise floor at `+2 %` is the finding filed in
 *    `tests/e2e/README.md` (QA-017 A-6).
 *    Reported, not patched — `src/**` is DO_NOT_TOUCH for this ticket.
 */

import { describe, expect, it } from "vitest";

import type { Level } from "@/core/level";
import { move } from "@/core/state/move";
import { applyMoveToGameState, initialState } from "@/core/state/transitions";
import type { Vec } from "@/core/state/types";
import {
  GOAL_ART_BOX,
  GOAL_ART_FRAMING,
  GOAL_PULSE_AMPLITUDE,
  GOAL_PULSE_MS,
  goalPulseScale,
} from "@/game/renderer/objects/goal";
import {
  PORTAL_ARRIVAL_TURNS,
  PORTAL_ART_BOX,
  PORTAL_ART_FRAMING,
  PORTAL_FOOTPRINT,
  portalArrivalTurn,
} from "@/game/renderer/objects/portal";
import { L4_SLOT, TILE_OBJECTS } from "@/game/renderer/objects/registry";
import type {
  TileObjectArtPort,
  TileObjectSpec,
  TileObjectTransition,
} from "@/game/renderer/objects/registry";
import {
  ART_INTEGRATED,
  assertNoPlaceholders,
  integratedSlots,
  PLACEHOLDER_SLOTS,
  PLACEHOLDER_TO_ASSET,
  portalSlotFor,
  unresolvedAssetIds,
} from "@/game/theme/assets";
import {
  activePlaceholderSlots,
  ART_SOURCES,
  ART_TEXTURE_KEYS,
  assertArtSourcesMatchSlots,
  isArtMounted,
  publishArtMount,
  unmountedResolvedSlots,
} from "@/game/theme/art";
import { theme, toInt } from "@/game/theme/tokens";

import { door, makeLevel, portal as portalDef, switchDef } from "../helpers/fixtures";
import { RecordingGraphics } from "../helpers/graphics-recorder";

/* ────────────────────────────── the art port double ─────────────────────── */

interface DrawnArt {
  readonly key: string;
  readonly cx: number;
  readonly cy: number;
  readonly w: number;
  readonly h: number;
  readonly alpha: number;
  readonly rotation: number;
  readonly instance: string | null;
}

/**
 * A recording {@link TileObjectArtPort} double: `has` answers the **mounted set**
 * (the `theme/art.ts` measurement, not "is there an image object"), `draw` records
 * the placement the painter asked for. Nothing touches Phaser or a canvas.
 */
function artPort(keys: readonly string[]): {
  readonly port: TileObjectArtPort;
  readonly draws: DrawnArt[];
} {
  const mounted = new Set(keys);
  const draws: DrawnArt[] = [];
  return {
    draws,
    port: {
      has: (key) => mounted.has(key),
      draw: (key, cx, cy, w, h, opts) => {
        draws.push({
          key,
          cx,
          cy,
          w,
          h,
          alpha: opts?.alpha ?? 1,
          rotation: opts?.rotation ?? 0,
          instance: opts?.instance ?? null,
        });
      },
    },
  };
}

/** A `Phaser.Textures.TextureManager` double with only `exists` — no pixel source. */
function texturesPresent(keys: readonly string[]): Parameters<typeof publishArtMount>[0] {
  const mounted = new Set(keys);
  return {
    exists: (key: string) => mounted.has(key),
  } as unknown as Parameters<typeof publishArtMount>[0];
}

const CELL = 56;
const RECT = { x: 0, y: 0, w: CELL, h: CELL } as const;

const specOf = (kind: TileObjectSpec["kind"]): TileObjectSpec => {
  const spec = TILE_OBJECTS.find((candidate) => candidate.kind === kind);
  if (spec === undefined) throw new Error(`no registry spec for ${kind}`);
  return spec;
};

/** Paint one tile through the **shipped** registry spec, as `board-view` does. */
function paintSpec(
  spec: TileObjectSpec,
  level: Level,
  tile: Vec,
  gs: ReturnType<typeof initialState>,
  transition: TileObjectTransition,
  extra: {
    readonly timeMs?: number;
    readonly art?: TileObjectArtPort;
    readonly reducedMotion?: boolean;
    readonly goalAttract?: number;
  } = {},
): RecordingGraphics {
  const g = new RecordingGraphics();
  const tokens = theme(gs.phase);
  spec.paint({
    g,
    rect: RECT,
    radius: 8,
    tile,
    cssScale: 1,
    theme: tokens,
    timeMs: extra.timeMs ?? 0,
    level,
    gs,
    transition,
    knockout: toInt(tokens.ground.cell),
    art: extra.art,
    reducedMotion: extra.reducedMotion,
    goalAttract: extra.goalAttract,
  });
  return g;
}

const settled: TileObjectTransition = { prev: null, objectMix: 1, occupied: 1 };

/* ───────────────────────────── A-1 · mount proof ────────────────────────── */

describe("A-1 · mount proof — the SWAP LAW, the both-ways guard, the mount set", () => {
  it("phase A resolves portal_b and phase B resolves portal_a — the suffix convention is a defect (R-PM1)", () => {
    const a = portalSlotFor("A");
    const b = portalSlotFor("B");
    expect(a?.assetName).toBe("portal_b");
    expect(b?.assetName).toBe("portal_a");
    // R-PM1 names the derivation outright: the A-03 spirit pair's `_a`/`_b`
    // convention must NOT be inherited, and a wrong mapping stays silent because the
    // delivered pair's alpha is bit-identical (74 713 px ink census, IoU 1.0000) —
    // it is a colour measurement or nothing.
    expect(a?.assetName).not.toBe("portal_a");
    expect(b?.assetName).not.toBe("portal_b");
    expect(a?.assetId).toBe("A-06");
    expect(b?.assetId).toBe("A-06");
    expect(a?.resolved).toBe(true);
    expect(b?.resolved).toBe(true);
    for (const phase of ["A", "B"] as const) {
      expect(portalSlotFor(phase), `phase ${phase} has a portal slot`).toBeDefined();
    }
  });

  it("the two ART_SOURCES keys and the two resolved rows land together (R-PM5, one seam both ways)", () => {
    expect(ART_TEXTURE_KEYS).toContain("portal_a");
    expect(ART_TEXTURE_KEYS).toContain("portal_b");
    const urlA = ART_SOURCES["portal_a"];
    const urlB = ART_SOURCES["portal_b"];
    expect(typeof urlA).toBe("string");
    expect(typeof urlB).toBe("string");
    expect(urlA).not.toBe(urlB);
    expect(urlA).toMatch(/portal_a/);
    expect(urlB).toMatch(/portal_b/);
    // The boot guard compares the two lists element-wise and in both directions, so
    // a resolved row without a shipped URL (or bytes for an unsigned slot) throws.
    expect(() => assertArtSourcesMatchSlots()).not.toThrow();
    expect(integratedSlots().map((slot) => slot.assetName)).toEqual([...ART_TEXTURE_KEYS]);
    expect(ART_TEXTURE_KEYS).toHaveLength(7); // 5 canvas slots + the A-06 portal pair
  });

  it("K-4 supersession, recorded as its positive: PLACEHOLDER_TO_ASSET carries both portal rows", () => {
    // Entry-3's negative (`portalMentioned: false`) is superseded *deliberately* by
    // the mount; the record is this assertion, never a deletion (R-PM5).
    expect(PLACEHOLDER_TO_ASSET["portal_a"]).toBe("A-06");
    expect(PLACEHOLDER_TO_ASSET["portal_b"]).toBe("A-06");
    // Derivation, not retyping: the entries can only exist because the rows do
    // (`PLACEHOLDER_SLOTS.map`) — R-P5's one-slot-one-table rule.
    expect(
      PLACEHOLDER_SLOTS.filter((slot) => slot.assetId === "A-06").map((slot) => slot.placeholder),
    ).toEqual(["goal", "portal_a", "portal_b"]);
    expect(PLACEHOLDER_TO_ASSET["goal"]).toBe("A-06");
  });

  it("R-P6 stays clean: nothing unresolved, the boot gate does not throw", () => {
    expect(ART_INTEGRATED).toBe(true);
    expect(unresolvedAssetIds()).toEqual([]);
    expect(() => assertNoPlaceholders()).not.toThrow();
  });

  it("with every resolved texture mounted the dev strip has nothing to list (all 7 rows mount)", () => {
    const stillPlaceholders = publishArtMount(texturesPresent([...ART_TEXTURE_KEYS]));
    expect(stillPlaceholders).toEqual([]);
    expect(isArtMounted("portal_a")).toBe(true);
    expect(isArtMounted("portal_b")).toBe(true);
    expect(unmountedResolvedSlots()).toEqual([]);
    expect(activePlaceholderSlots()).toEqual([]);
  });

  it("a degraded boot reports exactly the slots that failed — a 404ing pair is named, not silent", () => {
    publishArtMount(texturesPresent(ART_TEXTURE_KEYS.filter((key) => !key.startsWith("portal_"))));
    expect(isArtMounted("portal_a")).toBe(false);
    expect(isArtMounted("portal_b")).toBe(false);
    expect(unmountedResolvedSlots().map((slot) => slot.placeholder)).toEqual([
      "portal_a",
      "portal_b",
    ]);
    expect(activePlaceholderSlots().map((slot) => slot.placeholder)).toEqual([
      "portal_a",
      "portal_b",
    ]);
    // The other five are unaffected — degradation is per slot, never per board.
    expect(isArtMounted("goal")).toBe(true);
    expect(isArtMounted("echo_spirit_a")).toBe(true);
  });

  it("both ends of one pair share ONE live key, so their pixels are identical by construction", () => {
    // `portalLivePhase` reads the *portal's own* `activePhase` (cell-state.ts:275),
    // and both ends of a pair carry the same def — so a pair cannot paint two
    // different rasters in one phase, whatever tile it is asked about.
    const level = makeLevel({
      player: [0, 1],
      goal: [4, 4],
      portals: [portalDef("p1", [1, 2], [3, 2], "A")],
    });
    const gs = initialState(level); // phase A = p1's activePhase
    const art = artPort(["portal_a", "portal_b"]);
    const spec = specOf("portal");
    for (const tile of [{ x: 1, y: 2 }, { x: 3, y: 2 }] as const) {
      paintSpec(spec, level, tile, gs, settled, { art: art.port });
    }
    expect(art.draws).toHaveLength(2);
    expect(art.draws[0]!.key).toBe("portal_b");
    expect(art.draws[1]!.key).toBe("portal_b");
    // One shared texture, two display objects: the instance key is per end, and the
    // bytes behind both are the same file (R-PM4 — data, never a marker graphic).
    expect(art.draws[0]!.instance).toBe("portal_b@1,2");
    expect(art.draws[1]!.instance).toBe("portal_b@3,2");
  });
});

/* ──────────────────── A-3/A-4 · structural read and the box ─────────────── */

describe("A-3/A-4 · the state read is structural, the box is the measured framing", () => {
  const level = makeLevel({
    player: [0, 1],
    goal: [4, 4],
    portals: [portalDef("p1", [1, 2], [3, 2], "A")],
  });
  const inA = initialState(level); // p1 live
  const inB = applyMoveToGameState(level, inA, move("right")); // p1 dormant
  const end: Vec = { x: 1, y: 2 };
  const spec = specOf("portal");

  it("live: the signed raster IS the figure and the vector draws nothing at all", () => {
    const art = artPort(["portal_a", "portal_b"]);
    const g = paintSpec(spec, level, end, inA, settled, { art: art.port });
    expect(art.draws).toHaveLength(1);
    expect(art.draws[0]!.key).toBe("portal_b"); // R-PM1, from the resolved list
    expect(art.draws[0]!.alpha).toBe(1);
    expect(g.ops).toEqual([]); // dormant half at alpha 0 — absent, never dimmed-through
    expect(g.of("arc")).toEqual([]); // §3.1c's swirl now lives in the bytes
  });

  it("dormant: the §3.1c vector diamond is the figure, swirl absent — readable with zero colour", () => {
    const art = artPort(["portal_a", "portal_b"]);
    const g = paintSpec(spec, level, end, inB, settled, { art: art.port });
    // The raster object still exists (swap in place, R-PM2) but at alpha 0: the
    // figure the player reads is the outline below, and there are no arcs.
    expect(art.draws).toHaveLength(1);
    expect(art.draws[0]!.alpha).toBe(0);
    expect(g.of("arc")).toEqual([]);
    expect(g.of("moveTo")).toHaveLength(1);
    expect(g.of("lineTo")).toHaveLength(3);
    expect(g.of("closePath")).toHaveLength(1);
    expect(g.of("strokePath")).toHaveLength(1);
    expect(g.of("strokePath")[0]!.strokeAlpha).toBe(1);
    expect(g.of("strokePath")[0]!.stroke).toBe(toInt(theme("B").obj.portalEcho));
    // Hollow in both states (R-C2): a portal never fills its cell.
    expect(g.of("fillRect")).toEqual([]);
    expect(g.of("fillCircle")).toEqual([]);
  });

  it("the swap is figure-vs-figure, not hue: mid-flip in both directions draws one op graph", () => {
    // A-3's load-bearing fact is that B's value backup measures 1.03:1 (ΔL* 1.0) on
    // the delivered bytes, so the silhouette + swirl carry the read. Pin the
    // structural half: the op graph does not depend on the phase.
    const midOps = (gs: typeof inA, prev: typeof inA): readonly string[] => {
      const art = artPort(["portal_a", "portal_b"]);
      return paintSpec(spec, level, end, gs, { prev, objectMix: 0.5, occupied: 1 }, { art: art.port })
        .ops;
    };
    const turningLive = midOps(inA, inB); // B → A
    const turningDormant = midOps(inB, inA); // A → B
    // The dormant vector's whole op graph: one closed 4-vertex path, stroked. No
    // arc anywhere — with the raster mounted the swirl lives in the bytes only.
    expect(turningLive).toEqual([
      "beginPath",
      "moveTo",
      "lineTo",
      "lineTo",
      "lineTo",
      "closePath",
      "strokePath",
    ]);
    expect(turningDormant).toEqual(turningLive);
  });

  it("R-PM3: the art box is 0.70 / 0.788 ≈ 0.888 × cell, centre-pivoted, never 0.70", () => {
    expect(PORTAL_ART_FRAMING).toBeCloseTo(0.788, 6);
    expect(PORTAL_ART_BOX).toBeCloseTo(PORTAL_FOOTPRINT / PORTAL_ART_FRAMING, 12);
    expect(PORTAL_ART_BOX).toBeCloseTo(0.888, 3);
    const art = artPort(["portal_b"]);
    for (const cell of [56, 40, 128]) {
      const g = new RecordingGraphics();
      const tokens = theme("A");
      spec.paint({
        g,
        rect: { x: 0, y: 0, w: cell, h: cell },
        radius: 8,
        tile: end,
        cssScale: 1,
        theme: tokens,
        timeMs: 0,
        level,
        gs: inA,
        transition: settled,
        knockout: toInt(tokens.ground.cell),
        art: art.port,
      });
      const drawn = art.draws[art.draws.length - 1]!;
      expect(drawn.w, `cell ${String(cell)}`).toBeCloseTo(cell * PORTAL_ART_BOX, 9);
      expect(drawn.h).toBeCloseTo(drawn.w, 12);
      expect(drawn.cx).toBeCloseTo(cell / 2, 9); // centre-pivoted, both axes
      expect(drawn.cy).toBeCloseTo(cell / 2, 9);
      // A literal 0.70 box would land the *visible* form ≈ 0.55 cell (~21 % under
      // rank 5's ceiling) — the file bakes its own framing band.
      expect(drawn.w).toBeGreaterThan(cell * PORTAL_FOOTPRINT);
    }
    // Rank-3 subordination is a *coverage* fact (~22.5 % of cell² vs a wall's
    // 77.4 %), and the slot order is untouched (§3.1d).
    expect(L4_SLOT.portal).toBeLessThan(L4_SLOT.wall);
    expect(L4_SLOT.portal).toBeLessThan(L4_SLOT.goal);
  });
});

/* ───────────────────── A-5 · B6, the one arrival turn ───────────────────── */

describe("A-5 · B6 — one FULL arrival turn, only on the end that turns live, no new ink", () => {
  const level = makeLevel({
    player: [0, 1],
    goal: [4, 4],
    portals: [portalDef("p1", [1, 2], [3, 2], "A")],
  });
  const inA = initialState(level); // p1 live
  const inB = applyMoveToGameState(level, inA, move("right")); // p1 dormant
  const end: Vec = { x: 1, y: 2 };
  const spec = specOf("portal");

  it("the turn is one full revolution that ends where it began (2π ≡ 0 — no residual rotation)", () => {
    expect(PORTAL_ARRIVAL_TURNS).toBe(1);
    expect(portalArrivalTurn(0)).toBe(0);
    expect(portalArrivalTurn(0.5)).toBeCloseTo(Math.PI, 12);
    expect(portalArrivalTurn(1)).toBeCloseTo(2 * Math.PI, 12);
    expect(Math.cos(portalArrivalTurn(1))).toBeCloseTo(1, 12);
    expect(Math.sin(portalArrivalTurn(1))).toBeCloseTo(0, 12);
    // Monotone, clamped — the `walls` row's own ease drives it.
    expect(portalArrivalTurn(0.25)).toBeLessThan(portalArrivalTurn(0.75));
    expect(portalArrivalTurn(-1)).toBe(0);
    expect(portalArrivalTurn(2)).toBeCloseTo(2 * Math.PI, 12);
    expect(portalArrivalTurn(0.5)).not.toBeCloseTo(2 * Math.PI, 6); // a turn, not a snap
  });

  it("fires on the end that turns live, on the `walls` row, and nowhere else", () => {
    const art = artPort(["portal_b"]);
    const turning = paintSpec(
      spec,
      level,
      end,
      inA,
      { prev: inB, objectMix: 1, occupied: 1, swirlTurn: 1 },
      { art: art.port },
    );
    expect(art.draws).toHaveLength(1);
    expect(art.draws[0]!.rotation).toBeCloseTo(2 * Math.PI, 12);
    expect(turning.of("arc")).toEqual([]); // the turn rides the bytes, never a second swirl

    // A settled board passes progress 0 — no residual spin (B6's own contract).
    const rest = artPort(["portal_b"]);
    paintSpec(spec, level, end, inA, settled, { art: rest.port });
    expect(rest.draws[0]!.rotation).toBe(0);

    // A → B: this end turns *dormant*. No turn anywhere — the swap is alpha only.
    const fading = artPort(["portal_b"]);
    paintSpec(
      spec,
      level,
      end,
      inB,
      { prev: inA, objectMix: 0.5, occupied: 1, swirlTurn: 0.5 },
      { art: fading.port },
    );
    expect(fading.draws).toHaveLength(1);
    expect(fading.draws[0]!.rotation).toBe(0);
    expect(fading.draws[0]!.alpha).toBeCloseTo(0.5, 12); // the state swap still runs
  });

  it("adds no graphic at any end: the crossing frame's ink is the raster + the dormant outline", () => {
    const art = artPort(["portal_a", "portal_b"]);
    const g = paintSpec(
      spec,
      level,
      end,
      inA,
      { prev: inB, objectMix: 0.5, occupied: 1, swirlTurn: 0.5 },
      { art: art.port },
    );
    // Exactly one raster draw and (mid-swap) one vector outline — never a second
    // swirl, never a marker, never a fill (E3-3 / R-M2 / R-PM4).
    expect(art.draws).toHaveLength(1);
    expect(g.of("arc")).toEqual([]);
    expect(g.of("fillCircle")).toEqual([]);
    expect(g.of("fillRect")).toEqual([]);
    expect(g.of("moveTo")).toHaveLength(1);
    expect(g.of("lineTo")).toHaveLength(3);
  });
});

/* ───────────── A-6 · B7's additive attract contract + B10 has no motion ─── */

describe("A-6 · B7's attract is additive with the 8 % ceiling; B10 is a state rule, not motion", () => {
  const level = makeLevel({ player: [0, 1], goal: [4, 4] });
  const gs = initialState(level);
  const goalTile: Vec = { x: 4, y: 4 };
  const spec = specOf("goal");

  const goalBox = (extra: { readonly timeMs?: number; readonly goalAttract?: number }): number => {
    const art = artPort(["goal"]);
    paintSpec(spec, level, goalTile, gs, settled, { art: art.port, ...extra });
    return art.draws[0]!.w;
  };

  it("absent attract == the R-C8 envelope exactly (every other class ignores the channel)", () => {
    for (const timeMs of [0, 300, 600, 1200, 2400]) {
      const envelope = CELL * GOAL_ART_BOX * goalPulseScale(timeMs);
      expect(goalBox({ timeMs, goalAttract: 0 })).toBeCloseTo(envelope, 9);
      expect(goalBox({ timeMs })).toBeCloseTo(envelope, 9);
    }
  });

  it("the attract is ADDITIVE and its hard ceiling is exactly 1 + 6 % + 2 % = 8 %", () => {
    const crest = GOAL_PULSE_MS / 4; // sin(π/2) = 1 — the worst frame the view can build
    expect(goalPulseScale(crest)).toBeCloseTo(1 + GOAL_PULSE_AMPLITUDE, 9);
    const unit = CELL * GOAL_ART_BOX;
    const base = goalBox({ timeMs: crest });
    const attracted = goalBox({ timeMs: crest, goalAttract: 0.02 }); // the declared peak
    expect(attracted / unit).toBeCloseTo(1.08, 6);
    expect(attracted - base).toBeCloseTo(0.02 * unit, 9); // additive, not multiplicative
    for (const attract of [0.005, 0.0125, 0.02]) {
      expect(goalBox({ timeMs: crest, goalAttract: attract }) / unit).toBeCloseTo(
        1 + GOAL_PULSE_AMPLITUDE + attract,
        6,
      );
    }
  });

  it("B10 carries no motion: the attract is a passed-in scalar, so a settled board has none", () => {
    // The state rule ("re-arm only after leaving the one-cell ring") is a *gate* on
    // when a non-zero value is handed over; the painter keeps no attract state, so
    // there is nothing to idle and Undo/Restart pass the same settled frame.
    const rest = goalBox({ timeMs: 0 });
    expect(rest).toBeCloseTo(CELL * GOAL_ART_BOX, 9);
    expect(goalBox({ timeMs: 0, goalAttract: 0 })).toBe(rest);
    // The channel is optional and defaults to 0 — the pre-B7 frame, byte for byte.
    const withoutChannel = new RecordingGraphics();
    const withZero = new RecordingGraphics();
    const tokens = theme(gs.phase);
    const base = {
      rect: RECT,
      radius: 8,
      tile: goalTile,
      cssScale: 1,
      theme: tokens,
      timeMs: 1234,
      level,
      gs,
      transition: settled,
      knockout: toInt(tokens.ground.cell),
    } as const;
    spec.paint({ ...base, g: withoutChannel });
    spec.paint({ ...base, g: withZero, goalAttract: 0 });
    expect(withZero.calls).toEqual(withoutChannel.calls);
    // …and the R-C8 envelope itself is the published 2.4 s / ±6 %, not a new figure.
    expect(GOAL_PULSE_MS).toBe(2400);
    expect(GOAL_PULSE_AMPLITUDE).toBe(0.06);
    expect(GOAL_ART_BOX).toBeCloseTo(0.66 / GOAL_ART_FRAMING, 12);
  });
});

/* ───────────── A-8/A-10 · idle stillness and the deny-list negatives ────── */

describe("A-8/A-10 · nothing idles but the goal; no idle motion on portal/switch/door", () => {
  const level = makeLevel({
    player: [0, 1],
    goal: [4, 4],
    portals: [portalDef("p1", [1, 2], [3, 2], "A")],
    switches: [switchDef("s1", [0, 3], "A", ["d1"])],
    doors: [door("d1", "red", [[2, 4]])],
  });
  const gs = initialState(level);
  const TILES: Readonly<Record<string, Vec>> = {
    portal: { x: 1, y: 2 },
    switch: { x: 0, y: 3 },
    door: { x: 2, y: 4 },
    goal: { x: 4, y: 4 },
  };

  it("`timeMs` is consumed by the goal alone — the same settled board at four clock times", () => {
    const clocks = [0, 600, 1234, 2400];
    const art = artPort(["goal", "portal_a", "portal_b"]);
    for (const kind of ["portal", "switch", "door"] as const) {
      const reference = paintSpec(specOf(kind), level, TILES[kind]!, gs, settled, {
        art: art.port,
      });
      for (const timeMs of clocks) {
        const later = paintSpec(specOf(kind), level, TILES[kind]!, gs, settled, {
          art: art.port,
          timeMs,
        });
        expect(later.calls, `${kind} at timeMs ${String(timeMs)}`).toEqual(reference.calls);
      }
    }
    // The magnet: the goal, and only the goal, moves with the clock (R-C8). In the
    // art branch the scale rides the delivered box, so the observation is the
    // `art.draw` placement — not the draw calls (the centre dot is size-invariant).
    const goalAt = (timeMs: number): DrawnArt => {
      const port = artPort(["goal"]);
      paintSpec(specOf("goal"), level, TILES["goal"]!, gs, settled, { art: port.port, timeMs });
      return port.draws[0]!;
    };
    const goalReference = goalAt(0);
    const goalLater = goalAt(GOAL_PULSE_MS / 4);
    expect(goalLater.w).toBeCloseTo(CELL * GOAL_ART_BOX * 1.06, 9);
    expect(goalLater.w).not.toBeCloseTo(goalReference.w, 6);
  });

  it("no idle swirl and no idle fill: the portal is hollow and arc-free between moves (MV-1)", () => {
    const art = artPort(["portal_a", "portal_b"]);
    for (const [gsNow, what] of [
      [gs, "live"],
      [applyMoveToGameState(level, gs, move("right")), "dormant"],
    ] as const) {
      const g = paintSpec(specOf("portal"), level, TILES["portal"]!, gsNow, settled, {
        art: art.port,
      });
      // With the signed bytes mounted the swirl is baked into the raster, so the
      // only arcs are inside a texture that does not move on an idle board.
      expect(g.of("arc"), `portal ${what} at rest`).toEqual([]);
      expect(g.of("fillCircle"), `portal ${what} at rest`).toEqual([]);
      expect(g.of("fillRect"), `portal ${what} at rest`).toEqual([]);
    }
  });

  it("the switch's one-shot press beat is silent on a settled board (R-C8)", () => {
    const width = (occupied: number): number =>
      paintSpec(specOf("switch"), level, TILES["switch"]!, gs, {
        prev: null,
        objectMix: 1,
        occupied,
      }).of("strokeRoundedRect")[0]!.strokeWidth ?? Number.NaN;
    expect(width(0)).toBe(2);
    expect(width(1)).toBe(2);
    // …and the rest frame is reproducible: no per-paint state, no drift.
    expect(paintSpec(specOf("switch"), level, TILES["switch"]!, gs, settled).calls).toEqual(
      paintSpec(specOf("switch"), level, TILES["switch"]!, gs, settled).calls,
    );
    expect(paintSpec(specOf("door"), level, TILES["door"]!, gs, settled).calls).toEqual(
      paintSpec(specOf("door"), level, TILES["door"]!, gs, settled).calls,
    );
  });
});

/* ───────────────────── A-9 · reduced motion is a data flip ──────────────── */

describe("A-9 · reduced motion = data flip at the value source (MV-4)", () => {
  const level = makeLevel({
    player: [0, 1],
    goal: [4, 4],
    portals: [portalDef("p1", [1, 2], [3, 2], "A")],
  });
  const inA = initialState(level);
  const inB = applyMoveToGameState(level, inA, move("right"));

  it("the goal's pulse is scale 1 — and B7's attract dies with it (§6.4: no object scale)", () => {
    const spec = specOf("goal");
    const goalTile: Vec = { x: 4, y: 4 };
    for (const timeMs of [0, 600, 1234]) {
      const art = artPort(["goal"]);
      paintSpec(spec, level, goalTile, inA, settled, {
        art: art.port,
        timeMs,
        reducedMotion: true,
        goalAttract: 0.02,
      });
      expect(art.draws[0]!.w, `reduced at timeMs ${String(timeMs)}`).toBeCloseTo(
        CELL * GOAL_ART_BOX,
        9,
      );
    }
    const still = artPort(["goal"]);
    const moving = artPort(["goal"]);
    paintSpec(spec, level, goalTile, inA, settled, {
      art: still.port,
      timeMs: 0,
      reducedMotion: true,
    });
    paintSpec(spec, level, goalTile, inA, settled, {
      art: moving.port,
      timeMs: GOAL_PULSE_MS / 4,
      reducedMotion: true,
    });
    expect(still.draws[0]!.w).toBeCloseTo(moving.draws[0]!.w, 12);
  });

  it("the portal's arrival turn is suppressed while the STATE SWAP survives (B6's reduced form)", () => {
    // board-view.ts:964 publishes `swirlTurn = !reduced && flip ? objectMix : 0`, so
    // the registry is handed 0 and `portalArrivalTurn(0)` is the whole suppression.
    const end: Vec = { x: 1, y: 2 };
    const spec = specOf("portal");
    const done = artPort(["portal_b"]);
    paintSpec(spec, level, end, inA, { prev: inB, objectMix: 1, occupied: 1, swirlTurn: 0 }, {
      art: done.port,
    });
    expect(done.draws[0]!.rotation).toBe(0);
    // …and the reread: the swap is carried by alpha on the same container.
    const mid = artPort(["portal_b"]);
    paintSpec(spec, level, end, inA, { prev: inB, objectMix: 0.5, occupied: 1, swirlTurn: 0 }, {
      art: mid.port,
    });
    expect(mid.draws[0]!.rotation).toBe(0);
    expect(mid.draws[0]!.alpha).toBeCloseTo(0.5, 12);
    // The figure is still the live raster at the same box — legibility identical.
    expect(mid.draws[0]!.w).toBeCloseTo(CELL * PORTAL_ART_BOX, 9);
  });
});
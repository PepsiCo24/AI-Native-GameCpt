/**
 * `mixTheme` evidence — `docs/ui-ux.md` §6.2's **`tokens` row** (60–200 ms, eased,
 * global, unstaggered) as a pure function.
 *
 * Why this file exists at all (RV-005 M-1 / mutation M21): before it, the shipped
 * suite could not see the `obj.*` cross-fade. `mixTheme` interpolated `obj.goal` and
 * spread every other `obj.*` member from `to`, so the door, switch and portal
 * painters — which read their colour straight out of this map — **stepped** by ΔL*
 * 15–38 at the flip while the ground they stand on faded. Repairing the lerp left all
 * 251 tests green, which is exactly the evidence gap these assertions close.
 *
 * Three layers, weakest to strongest:
 *
 * 1. **Endpoints** — `t ≤ 0` / `t ≥ 1` return the original maps *by reference*, so a
 *    settled board is bit-identical to `theme(phase)` and a flip can never strand a
 *    near-miss colour.
 * 2. **Per-field mid-progress** — every interpolated member is asserted against the
 *    byte-space blend of its own two endpoints (not "the call happened"), and is
 *    asserted **≠ both endpoints**, which is the M21 killer in its literal form.
 * 3. **Coverage** — the set of members that interpolate is derived from the *shipped
 *    token maps* (`A.obj[k] !== B.obj[k]`), not from a list written here. A future
 *    painter that reads a new per-phase `obj.*` token therefore turns this file red
 *    until that token is either cross-faded or explicitly declared wall-owned (the
 *    one family with its own look mixer). Adding the assertion to a hardcoded list
 *    would have been a restatement of `theme-mix.ts`, not a gate on it.
 *
 * The last case closes the loop at the painter end: it feeds the *mixed* map to the
 * shipped `doorLook` / `switchLook` / `portalLook` and asserts the ink a painter would
 * actually emit sits strictly between the two phase values.
 */

import { describe, expect, it } from "vitest";
import { doorLook } from "@/game/renderer/objects/door";
import { portalLook } from "@/game/renderer/objects/portal";
import { switchLook } from "@/game/renderer/objects/switch";
import { mixTheme } from "@/game/renderer/theme-mix";
import type { Hex, ThemeTokens } from "@/game/theme/tokens";
import { blend, theme, toInt } from "@/game/theme/tokens";

type ObjKey = keyof ThemeTokens["obj"];

const A = theme("A");
const B = theme("B");

/**
 * The `obj` family the wall class owns: read through `WallLook`
 * (`renderer/objects/wall.ts` + `wall-tiles.ts`) and cross-faded on §6.2's
 * **staggered** `walls` row, so the wall's ink rides `objectMix`, not this map.
 * `wallEcho` is in here even though its own ΔL* is only 0.5 — the value step of a
 * ghost is carried by `wallEchoFill` and the edge, both of which are listed.
 */
const WALL_OWNED: readonly ObjKey[] = [
  "wall",
  "wallEcho",
  "wallEchoFill",
  "wallOccupied",
  "wallEdge",
];

/** Every `obj` member whose value differs between the two phases (from the maps). */
const FLIPPING: readonly ObjKey[] = (Object.keys(A.obj) as ObjKey[]).filter(
  (key) => A.obj[key] !== B.obj[key],
);

/** …minus the wall family = the set `mixTheme` must interpolate, derived not typed. */
const MUST_INTERPOLATE: readonly ObjKey[] = FLIPPING.filter((key) => !WALL_OWNED.includes(key));

const PROGRESS = [0.1, 0.25, 0.5, 0.75, 0.9] as const;

describe("mixTheme — §6.2 endpoints (a settled board is bit-identical to theme(phase))", () => {
  it("returns the `from` / `to` maps by reference at t ≤ 0 and t ≥ 1", () => {
    expect(mixTheme(A, B, 0)).toBe(A);
    expect(mixTheme(A, B, 1)).toBe(B);
    // Clamped by the caller today; the function is defensive at both ends anyway.
    expect(mixTheme(A, B, -0.5)).toBe(A);
    expect(mixTheme(A, B, 1.5)).toBe(B);
  });

  it("pins each flipping obj token to its phase's value at both ends", () => {
    for (const key of FLIPPING) {
      expect(mixTheme(A, B, 0).obj[key], `${key} at t=0`).toBe(A.obj[key]);
      expect(mixTheme(A, B, 1).obj[key], `${key} at t=1`).toBe(B.obj[key]);
      // For an A→B flip the caller passes `from = theme(A)`, `to = theme(B)`.
      expect(mixTheme(B, A, 0).obj[key], `${key} at t=0 (B→A)`).toBe(B.obj[key]);
      expect(mixTheme(B, A, 1).obj[key], `${key} at t=1 (B→A)`).toBe(A.obj[key]);
    }
  });
});

describe("mixTheme — §6.2 mid-progress is a real per-field cross-fade, not a step (M-1/M21)", () => {
  it("interpolates every flipping non-wall obj token, field by field", () => {
    // Derived from the token maps, so a new per-phase obj token read by a painter
    // lands in this list automatically and fails until it is interpolated.
    expect([...MUST_INTERPOLATE].sort()).toEqual(
      [
        "doorBlue",
        "doorBlueOccupied",
        "doorRed",
        "doorRedOccupied",
        "goal",
        "portal",
        "portalEcho",
        "switch",
      ].sort(),
    );
  });

  it("blends each interpolated obj token toward `to` at exactly the byte-space rate", () => {
    for (const t of PROGRESS) {
      const mid = mixTheme(A, B, t);
      for (const key of MUST_INTERPOLATE) {
        expect(mid.obj[key], `${key} at t=${String(t)}`).toBe(
          blend(B.obj[key], A.obj[key], t),
        );
      }
    }
  });

  it("makes each interpolated obj token differ from BOTH phase values mid-flip", () => {
    // The literal mutation M21: spreading `...to.obj` leaves every one of these at
    // B's value for the whole 60–200 ms window, so this is the assertion that reds.
    for (const t of PROGRESS) {
      const mid = mixTheme(A, B, t);
      for (const key of MUST_INTERPOLATE) {
        const value: Hex = mid.obj[key];
        expect(value, `${key} at t=${String(t)} still equals the A value`).not.toBe(A.obj[key]);
        expect(value, `${key} at t=${String(t)} still equals the B value`).not.toBe(B.obj[key]);
      }
    }
  });

  it("monotonically walks each interpolated obj token from A to B (no overshoot, no wobble)", () => {
    for (const key of MUST_INTERPOLATE) {
      // Compare on summed channels: monotone in the blend parameter, so a curved or
      // clamped implementation would show up as a repeated or reversed step.
      const sum = (hex: Hex): number => {
        const value = toInt(hex);
        return ((value >> 16) & 0xff) + ((value >> 8) & 0xff) + (value & 0xff);
      };
      const from = sum(A.obj[key]);
      const to = sum(B.obj[key]);
      const sign = Math.sign(to - from);
      let previous = from;
      for (const t of [...PROGRESS, 1] as const) {
        const current = sum(mixTheme(A, B, t).obj[key]);
        // Never past the target…
        expect(sign * (current - to), `${key} at t=${String(t)} overshot`).toBeLessThanOrEqual(0);
        // …and never behind where it already was.
        expect(sign * (current - previous), `${key} at t=${String(t)} went backwards`).toBeGreaterThanOrEqual(0);
        previous = current;
      }
      expect(previous, `${key} does not reach the B value`).toBe(to);
    }
  });

  it("leaves the wall family on `to` on purpose — it owns §6.2's staggered walls row", () => {
    // Documented exclusion, asserted rather than assumed: if a wall token were ever
    // mixed here *as well* as in `WallLook`, the wall interior would fade on two
    // different curves (60–200 global vs 80–200 staggered by distance).
    for (const key of WALL_OWNED) {
      for (const t of PROGRESS) {
        expect(mixTheme(A, B, t).obj[key], `${key} at t=${String(t)}`).toBe(B.obj[key]);
      }
    }
  });
});

describe("mixTheme — the rest of §6.2's tokens row (ground · accent · win)", () => {
  it("cross-fades every ground token, the accent and the win tint", () => {
    const t = 0.5;
    const mid = mixTheme(A, B, t);
    expect(Object.keys(mid.ground).sort()).toEqual(Object.keys(A.ground).sort());
    for (const key of Object.keys(A.ground) as Array<keyof ThemeTokens["ground"]>) {
      expect(mid.ground[key], key).toBe(blend(B.ground[key], A.ground[key], t));
      expect(mid.ground[key], key).not.toBe(B.ground[key]);
    }
    expect(mid.accent).toBe(blend(B.accent, A.accent, t));
    expect(mid.feedback.win).toBe(blend(B.feedback.win, A.feedback.win, t));
    expect(mid.feedback.win).not.toBe(B.feedback.win);
  });

  it("takes decision fields from `to`, never a midpoint (colours lerp, decisions do not)", () => {
    const mid = mixTheme(A, B, 0.5);
    // A boolean / an enum / a string has no meaningful midpoint — the header's rule.
    expect(mid.hud.phaseGlyph).toBe(B.hud.phaseGlyph);
    expect(mid.hud.phaseLabel).toBe(B.hud.phaseLabel);
    expect(mid.actor.ringVisible).toBe(B.actor.ringVisible);
    expect(mid.feedback.winAlpha).toBe(B.feedback.winAlpha);
    expect(mid.hud.panelAlpha).toBe(B.hud.panelAlpha);
    expect(mid.fx.phaseRing).toBe(B.fx.phaseRing);
    // DOM-only families are carried over untouched: the DOM runs its own transition.
    expect(mid.text).toBe(B.text);
    expect(mid.btn).toBe(B.btn);
    expect(mid.hud).toBe(B.hud);
  });
});

describe("the shipped painters read the mixed map (M-1 at the ink, not just the maths)", () => {
  it("door / switch / portal ink sits strictly between the two phase values mid-flip", () => {
    const mid = mixTheme(A, B, 0.5);

    const door = doorLook(mid, "red", 0, 0);
    expect(door.frame).toBe(toInt(blend(B.obj.doorRed, A.obj.doorRed, 0.5)));
    expect(door.frame).not.toBe(toInt(A.obj.doorRed));
    expect(door.frame).not.toBe(toInt(B.obj.doorRed));
    expect(doorLook(mid, "blue", 0, 0).frame).toBe(
      toInt(blend(B.obj.doorBlue, A.obj.doorBlue, 0.5)),
    );
    // The occupied interior is derived from `ground.cell` per phase, so it must be
    // interpolated too — it is the token the R-D7 drop lands on.
    expect(doorLook(mid, "red", 1, 1).body).toBe(
      toInt(blend(B.obj.doorRedOccupied, A.obj.doorRedOccupied, 0.5)),
    );

    const sw = switchLook(mid, "A", 0.5, 0);
    expect(sw.outline).toBe(toInt(blend(B.obj.switch, A.obj.switch, 0.5)));
    expect(sw.outline).not.toBe(toInt(B.obj.switch));

    const portal = portalLook(mid, 0.5);
    // The portal's outline is a lerp of two already-interpolated tokens, so it is
    // strictly inside the union of both phases' endpoints.
    expect(portal.stroke).not.toBe(toInt(A.obj.portal));
    expect(portal.stroke).not.toBe(toInt(B.obj.portal));
    expect(portal.swirl).toBe(toInt(mid.obj.portal));
    expect(portal.swirl).not.toBe(toInt(B.obj.portal));
  });
});
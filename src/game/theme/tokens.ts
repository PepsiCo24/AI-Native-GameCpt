/**
 * Theme tokens — **the only place colours exist** (`docs/ui-ux.md` §5.4 / R-C11).
 *
 * Truth sources: `docs/ui-ux.md` V0.5 §4.3 (token map, measured 2026-10-14),
 * §4.6 (separation contract), §5.4 (skin system), §6.1/§6.2 (flip timing table),
 * §6.2a (Variant S / Variant CL), §6.4 (reduced motion), R-C9 (auto contrast
 * ring — whose input since R-005b is the colour the body is *actually drawn with*,
 * see {@link applyDrawnActorBody}), R-C11 (tokens are the only source of colour),
 * R-C12 (derived tokens are **computed**, never hand-picked per level), R-C13.4
 * (`fx.phaseRing` is chosen at boot), R-D7 + V0.5 D-3 (occupied doors;
 * `fx.phaseRing` re-derived as a minimax).
 *
 * V0.4 → V0.5 delta implemented here: the two `obj.door*Occupied` tokens and the
 * reserved `obj.portalEcho` (zero new hand-tuned values — both are the existing
 * blend formulas), and the `fx.phaseRing` **minimax** over every occupied interior.
 * Door *states* deliberately add no token at all: §3.1b carries open/closed by
 * geometry, so there is nothing here to re-tune when doors ship at L21.
 *
 * Path note (flagged, not silently decided): §5.4 names
 * `src/ui/theme/tokens.ts` as the home of this map. `src/ui/**` belongs to the
 * UI / Art Director (AGENTS.md §4) and this task's dispatch forbids creating
 * files outside `src/game/**`, so the module lives at
 * `src/game/theme/tokens.ts`. The exported shape is exactly §5.4's
 * (`ThemeTokens`, `THEME`, `theme()`, `cssVars()`); moving it later is a rename
 * plus an import update. No hex literal exists anywhere else under `src/game/**`.
 *
 * Renderer rules honoured here:
 * - **No `if (phase === "A")` branch anywhere** — only `theme(phase)` (§5.4, non-
 *   negotiable #3). This file has no runtime import at all, on purpose: it is
 *   executable by plain Node for the derived-token evidence run.
 */

import type { Phase } from "@/core/state/phase";

export type { Phase };

/** A colour token: 6-digit `#RRGGBB`. Alpha is a separate token field. */
export type Hex = string;

/** The phase-glyph axis of R-C1: sun = Phase A (Light / 白昼), crescent = Phase B. */
export type PhaseGlyph = "sun" | "crescent";

export interface ThemeTokens {
  readonly ground: {
    /** Page / letterbox behind the board (§4.3). */
    readonly page: Hex;
    /** Board plate (manifest base colour). */
    readonly plate: Hex;
    /** Empty cell. */
    readonly cell: Hex;
    /** Checker alternate (deliberately subtle). */
    readonly cellAlt: Hex;
    /** Cell separator — structural, R-C4 band 1.6–2.2:1. */
    readonly grid: Hex;
  };
  readonly obj: {
    /** Active wall (solid now) — R-C2 solid side. */
    readonly wall: Hex;
    /** Ghost stroke (other-phase wall, passable now) — R-E1 ≥ 3:1. */
    readonly wallEcho: Hex;
    /** Ghost interior tint — derived 60/40 (§4.3, R-E2a band 1.7–2.6:1). */
    readonly wallEchoFill: Hex;
    /** Wall interior under the player — derived 55/45 (§4.3, R-C13.2). */
    readonly wallOccupied: Hex;
    /** Door interior under the player — same 55/45 rule (§4.3, R-D7). */
    readonly doorRedOccupied: Hex;
    readonly doorBlueOccupied: Hex;
    /**
     * RESERVED (M2 / L36): the inactive portal's muted stroke, derived 80/20
     * (§3.1c). No consumer in this slice — portals appear at L36 — but the token
     * is derived here so the §4.3 formula set is complete in one place.
     */
    readonly portalEcho: Hex;
    /** 2 px edge on the active wall, and always on the occupied wall (R-C13.2). */
    readonly wallEdge: Hex;
    readonly goal: Hex;
    readonly portal: Hex;
    readonly doorRed: Hex;
    readonly doorBlue: Hex;
    readonly switch: Hex;
  };
  readonly actor: {
    /** Echo Spirit body — DEV PLACEHOLDER A-03 `echo_spirit_a/b`. */
    readonly body: Hex;
    /** Auto contrast ring, drawn only when R-C9 demands it. */
    readonly ring: Hex;
    /** R-C9 decision, computed at boot (never per frame, never per-phase branch). */
    readonly ringVisible: boolean;
  };
  readonly text: {
    readonly primary: Hex;
    readonly secondary: Hex;
  };
  /** Focus ring / chip fill / highlight. */
  readonly accent: Hex;
  readonly hud: {
    readonly panel: Hex;
    readonly panelAlpha: number;
    readonly chipFill: Hex;
    readonly chipGlyph: Hex;
    /** Names the phase without colour (R-C1, §7.4). */
    readonly phaseGlyph: PhaseGlyph;
    /** `aria-live` / `aria-label` text (§7.4). */
    readonly phaseLabel: string;
  };
  readonly btn: {
    readonly primaryFrom: Hex;
    readonly primaryTo: Hex;
    readonly primaryLabel: Hex;
    readonly ghostOutline: Hex;
    readonly ghostLabel: Hex;
  };
  readonly feedback: {
    /** Illegal-move nudge tint — the player ring only, §6.5. */
    readonly deny: Hex;
    /** Win flash: a plate-level tint (L7), never a per-cell cover. */
    readonly win: Hex;
    readonly winAlpha: number;
  };
  readonly fx: {
    /** One-shot ring when a flip solidifies the wall under the player — boot-derived (R-C13.4). */
    readonly phaseRing: Hex;
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Colour maths — WCAG 2.1 relative luminance + sRGB byte blend.
 * Exported so the derived-token numbers of §4.3/§4.6 can be re-measured from
 * code rather than trusted from the document.
 * ──────────────────────────────────────────────────────────────────────────── */

export function toInt(hex: Hex): number {
  return parseInt(hex.slice(1), 16);
}

function channels(hex: Hex): readonly [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function byte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function toHex(r: number, g: number, b: number): Hex {
  const part = (v: number): string => byte(v).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** Flat precomputed blend (R-E2a / R-C13.2 derivation rule). No runtime alpha over ground. */
export function blend(base: Hex, over: Hex, baseWeight: number): Hex {
  const [br, bg, bb] = channels(base);
  const [or_, og, ob] = channels(over);
  const w = baseWeight;
  return toHex(br * w + or_ * (1 - w), bg * w + og * (1 - w), bb * w + ob * (1 - w));
}

function channelLuminance(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: Hex): number {
  const [r, g, b] = channels(hex);
  return (
    0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
  );
}

/** WCAG 2.1 SC 1.4.11 contrast ratio. Order-independent, never below 1. */
export function contrastRatio(a: Hex, b: Hex): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/** Channel-wise lerp between two Phaser colour ints (token cross-fade, §6.2). */
export function lerpColorInt(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 0xff;
  const ag = (a >> 8) & 0xff;
  const ab = a & 0xff;
  const br = (b >> 16) & 0xff;
  const bg = (b >> 8) & 0xff;
  const bb = b & 0xff;
  const r = byte(ar + (br - ar) * t);
  const g = byte(ag + (bg - ag) * t);
  const blue = byte(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | blue;
}

/* ────────────────────────────────────────────────────────────────────────────
 * §4.3 base palette (measured 2026-10-14) — the input of the derivation below.
 * ──────────────────────────────────────────────────────────────────────────── */

interface BasePalette {
  readonly ground: ThemeTokens["ground"];
  /** `obj` minus every **derived** member — those are computed by {@link derive}. */
  readonly obj: Omit<ThemeTokens["obj"], DerivedObjKey>;
  readonly actor: Omit<ThemeTokens["actor"], "ringVisible">;
  readonly text: ThemeTokens["text"];
  readonly accent: Hex;
  readonly hud: Omit<ThemeTokens["hud"], "phaseGlyph" | "phaseLabel">;
  readonly btn: ThemeTokens["btn"];
  /**
   * Flat pair only: the win tint's **alpha** is per-phase data and lives in
   * {@link BasePalette.winAlpha}, so this must not re-declare it (a duplicated
   * `winAlpha` is exactly the kind of drift R-C12 exists to prevent).
   */
  readonly feedback: { readonly deny: Hex; readonly win: Hex };
  /** The win tint alpha differs per phase in alpha (§4.3). */
  readonly winAlpha: number;
  readonly phaseGlyph: PhaseGlyph;
  readonly phaseLabel: string;
}

/** The `obj` members that are computed from the base palette, never authored. */
type DerivedObjKey =
  | "wallEchoFill"
  | "wallOccupied"
  | "doorRedOccupied"
  | "doorBlueOccupied"
  | "portalEcho";

const BASE: Record<Phase, BasePalette> = {
  A: {
    ground: {
      page: "#F1E6D2",
      plate: "#F7F1E3",
      cell: "#FFFDF7",
      cellAlt: "#F2EADB",
      grid: "#CDB996",
    },
    obj: {
      wall: "#6E5B3E",
      wallEcho: "#8E7C5D",
      wallEdge: "#4A3D28",
      goal: "#A8752A",
      portal: "#1F6F78",
      doorRed: "#B03A32",
      doorBlue: "#2E62B8",
      switch: "#7A5AA0",
    },
    actor: { body: "#F6DE9E", ring: "#4A3216" },
    text: { primary: "#3A3226", secondary: "#6E6047" },
    accent: "#E9C87A",
    hud: { panel: "#F7F1E3", panelAlpha: 0.88, chipFill: "#E9C87A", chipGlyph: "#6B4E1E" },
    btn: {
      primaryFrom: "#E9C87A",
      primaryTo: "#D8A94E",
      primaryLabel: "#4A3B21",
      ghostOutline: "#6E6047",
      ghostLabel: "#3A3226",
    },
    feedback: { deny: "#B4453A", win: "#E9C87A" },
    winAlpha: 0.18,
    phaseGlyph: "sun",
    phaseLabel: "白昼 / Light",
  },
  B: {
    ground: {
      page: "#141733",
      plate: "#1B1F3B",
      cell: "#22284A",
      cellAlt: "#2A3157",
      grid: "#414A7E",
    },
    obj: {
      wall: "#A795EE",
      wallEcho: "#7C77AE",
      wallEdge: "#C9D6FF",
      goal: "#E9C87A",
      portal: "#7FD8D0",
      doorRed: "#FF8A7A",
      doorBlue: "#8FC4FF",
      switch: "#C79BE8",
    },
    actor: { body: "#EAF0FF", ring: "#5B4E96" },
    text: { primary: "#EAF0FF", secondary: "#A9B2D8" },
    accent: "#7FD8D0",
    hud: { panel: "#1B1F3B", panelAlpha: 0.88, chipFill: "#4A3D7A", chipGlyph: "#C9D6FF" },
    btn: {
      primaryFrom: "#5B4E96",
      primaryTo: "#4A3D7A",
      primaryLabel: "#F2F5FF",
      ghostOutline: "#A9B2D8",
      ghostLabel: "#EAF0FF",
    },
    feedback: { deny: "#FF9C8E", win: "#C9D6FF" },
    winAlpha: 0.16,
    phaseGlyph: "crescent",
    phaseLabel: "夜晚 / Shadow",
  },
};

/**
 * Derive the V0.5 tokens from the base palette (§4.3 derivation rules, R-C12).
 *
 * Blend weights are fixed by the spec and are **not** per-phase or per-level knobs:
 *
 * - `obj.wallEchoFill` = **60 % `obj.wallEcho` + 40 % `ground.cell`** (R-E2a band 1.7–2.6:1).
 * - `obj.wallOccupied` = **55 % `obj.wall` + 45 % `ground.cell`** (R-C13.2 band ≥ 2.0:1).
 * - `obj.doorRedOccupied` / `obj.doorBlueOccupied` = the **same 55/45 rule** applied
 *   to `obj.doorRed` / `obj.doorBlue` (R-D7, V0.5 — doors share wall semantics).
 * - `obj.portalEcho` = **80 % `obj.portal` + 20 % `ground.cell`** (RESERVED, §3.1c;
 *   the 70/30 variant was rejected in the spec because A lands at 2.65:1, below the
 *   3.0 stroke band).
 * - `actor.ringVisible` = `CR(actor.body, ground.cell) < 3` (R-C9, boot-time, one code path),
 *   where `actor.body` is **the colour the body is drawn with**: the token itself
 *   while the vector placeholder draws, or the measured centre pixel of the
 *   delivered A-03 sprite when that is what is on the board
 *   ({@link applyDrawnActorBody}, R-005b / QA-007-F1).
 * - `fx.phaseRing` = **boot-time minimax** `argmax_c min_i CR(c, i)` over candidates
 *   `{actor.ring, accent, text.primary}` × occupied interiors
 *   `{wallOccupied, doorRedOccupied, doorBlueOccupied}` (R-C13.4 as re-derived by
 *   V0.5 / D-3 — the "min" is mandatory, not cosmetic: a candidate is only
 *   acceptable if it clears **every** interior, because the flip can solidify a
 *   wall *or* a closed door under the player).
 *
 * Implementing the rules (instead of copying §4.3's numbers) is what makes a
 * base-token re-tune impossible to ship without recomputing every derived value in
 * the same commit — the R-C12 requirement — and it reproduces the V0.5 measured
 * values exactly for both phases:
 *
 * | derived | A | B |
 * |---|---|---|
 * | `wallEchoFill` | `#BBB09B` | `#585786` |
 * | `wallOccupied` | `#AFA491` | `#6B64A4` |
 * | `doorRedOccupied` | `#D4928B` | `#9C5E64` |
 * | `doorBlueOccupied` | `#8CA8D4` | `#5E7EAE` |
 * | `portalEcho` (RESERVED) | `#4C8B91` | `#6CB5B5` |
 * | `fx.phaseRing` | `#3A3226` (min 4.98:1) | `#EAF0FF` (min 3.63:1) |
 *
 * The V0.4 B `fx.phaseRing` pick (`accent` `#7FD8D0`) is **replaced** here: it
 * measures 2.49:1 against `doorBlueOccupied` B and therefore fails the extended
 * candidate × interior product.
 */
function derive(base: BasePalette): ThemeTokens {
  const { ground, obj, actor } = base;
  const wallEchoFill = blend(obj.wallEcho, ground.cell, 0.6);
  const wallOccupied = blend(obj.wall, ground.cell, 0.55);
  const doorRedOccupied = blend(obj.doorRed, ground.cell, 0.55);
  const doorBlueOccupied = blend(obj.doorBlue, ground.cell, 0.55);
  const portalEcho = blend(obj.portal, ground.cell, 0.8);

  // R-C13.4 / D-3 — minimax over every interior a flip can solidify under the player.
  const ringCandidates: readonly Hex[] = [actor.ring, base.accent, base.text.primary];
  const occupiedInteriors: readonly Hex[] = [wallOccupied, doorRedOccupied, doorBlueOccupied];
  let phaseRing: Hex = ringCandidates[0] as Hex;
  let bestWorst = -Infinity;
  for (const candidate of ringCandidates) {
    let worst = Infinity;
    for (const interior of occupiedInteriors) {
      worst = Math.min(worst, contrastRatio(candidate, interior));
    }
    if (worst > bestWorst) {
      bestWorst = worst;
      phaseRing = candidate;
    }
  }

  return {
    ground,
    obj: {
      ...obj,
      wallEchoFill,
      wallOccupied,
      doorRedOccupied,
      doorBlueOccupied,
      portalEcho,
    },
    actor: { ...actor, ringVisible: ringVisibleFor(actor.body, ground.cell) },
    text: base.text,
    accent: base.accent,
    hud: {
      ...base.hud,
      phaseGlyph: base.phaseGlyph,
      phaseLabel: base.phaseLabel,
    },
    btn: base.btn,
    feedback: {
      deny: base.feedback.deny,
      win: base.feedback.win,
      winAlpha: base.winAlpha,
    },
    fx: { phaseRing },
  };
}

/**
 * R-C9's rule, as one pure function: the identity ring is demanded whenever the
 * colour the player's **body** is drawn with fails the 3:1 band against the
 * ground cell it stands on.
 *
 * One rule, two inputs — never two rules. `derive()` above applies it to
 * `actor.body` (the vector placeholder / dev form), `applyDrawnActorBody()`
 * applies the very same function to the measured centre pixel of the delivered
 * sprite. A second, art-only threshold here is exactly how the two answers drift
 * apart later.
 */
export function ringVisibleFor(drawnBody: Hex, groundCell: Hex): boolean {
  return contrastRatio(drawnBody, groundCell) < 3;
}

/* ────────────────────────────────────────────────────────────────────────────
 * R-C9 against the body that is actually drawn — QA-007-F1 (R-005b)
 *
 * The bug this closes: `ringVisible` was derived from `actor.body`, which is the
 * **vector placeholder's** colour. R-005a then made the *drawn* body something
 * else — the delivered A-03 sprite — so the decision was computed from a colour
 * the player never sees. In Phase B the placeholder measured 12.52:1 (ring off),
 * while the delivered sprite's own centre measures **2.34:1** against the same
 * cell: R-C9 demands the ring, and the board drew none.
 *
 * The fix keeps R-C9's contract intact — *one decision, boot time, no per-frame
 * and no per-phase branch* — by re-deciding once, at mount time, from the
 * measured colour, and by handing the renderer an ordinary `ThemeTokens` record.
 * `ActorLook.ringAlpha` is still `tokens.actor.ringVisible ? 1 : 0`
 * (`objects/actor.ts`): the consumption site is a pure boolean read, unchanged.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Per-phase R-C9 override — **installed only when the drawn body changes the
 * verdict**, and empty in every other case (no art mounted, or the same verdict).
 * An empty map means "the token derivation", i.e. exactly the board that shipped
 * before any art was wired.
 */
const drawnBodyOverrides = new Map<Phase, ThemeTokens>();

/**
 * Re-decide R-C9 for `phase` against the colour the board is drawing the body
 * with, and publish the result through {@link theme}.
 *
 * Called once per boot by `theme/art.ts` right after the loader's outcome is
 * published (see `publishArtMount`) — never per frame, never per phase flip, and
 * never from a painter.
 *
 * - `null` — no delivered texture mounted (the R-005a degrade path, offline boot,
 *   or a unit-test double with no pixel source): any override is **removed**, so
 *   `theme(phase)` returns `THEME[phase]` *by identity*. The placeholder path is
 *   byte-for-byte what it was before this function existed.
 * - a colour whose verdict equals the token's: no override is installed, for the
 *   same reason — nothing observable changed, so nothing may change.
 * - a colour that flips the verdict: a copy of the phase record carries the new
 *   boolean; every other token is shared by reference, so this cannot drift into a
 *   palette re-tune (R-C12 stays "recompute, don't hand-pick").
 */
export function applyDrawnActorBody(phase: Phase, drawnBody: Hex | null): void {
  const base = THEME[phase];
  if (drawnBody === null) {
    drawnBodyOverrides.delete(phase);
    return;
  }
  const visible = ringVisibleFor(drawnBody, base.ground.cell);
  if (visible === base.actor.ringVisible) {
    drawnBodyOverrides.delete(phase);
    return;
  }
  drawnBodyOverrides.set(phase, { ...base, actor: { ...base.actor, ringVisible: visible } });
}

/** The single lookup (§5.4). Nothing in `src/game/**` may branch on the phase instead. */
export const THEME: Record<Phase, ThemeTokens> = {
  A: derive(BASE.A),
  B: derive(BASE.B),
};

/**
 * `theme(phase)` — the only way the renderer/UI asks for colours.
 *
 * The override lookup is a `Map` read: with no art mounted it is `undefined` and
 * the *identical* `THEME[phase]` object is returned, so the degrade state cannot
 * differ from the pre-integration board (no copy, no rounding, no allocation).
 */
export function theme(phase: Phase): ThemeTokens {
  return drawnBodyOverrides.get(phase) ?? THEME[phase];
}

/**
 * The same object as CSS custom properties (§5.4, §7.2): the DOM consumes
 * `--ps-*`, Phaser consumes colour ints, both generated from this map.
 */
export function cssVars(phase: Phase): Record<string, string> {
  const t = theme(phase);
  return {
    "--ps-ground-page": t.ground.page,
    "--ps-ground-plate": t.ground.plate,
    "--ps-ground-cell": t.ground.cell,
    "--ps-ground-grid": t.ground.grid,
    "--ps-wall": t.obj.wall,
    "--ps-wall-echo": t.obj.wallEcho,
    "--ps-wall-occupied": t.obj.wallOccupied,
    "--ps-wall-edge": t.obj.wallEdge,
    "--ps-goal": t.obj.goal,
    "--ps-actor-body": t.actor.body,
    "--ps-actor-ring": t.actor.ring,
    "--ps-text-primary": t.text.primary,
    "--ps-text-secondary": t.text.secondary,
    "--ps-accent": t.accent,
    "--ps-hud-panel-alpha": String(t.hud.panelAlpha),
    "--ps-chip-fill": t.hud.chipFill,
    "--ps-chip-ink": t.hud.chipGlyph,
    "--ps-btn-from": t.btn.primaryFrom,
    "--ps-btn-to": t.btn.primaryTo,
    "--ps-btn-label": t.btn.primaryLabel,
    "--ps-btn-ghost-outline": t.btn.ghostOutline,
    "--ps-btn-ghost-label": t.btn.ghostLabel,
    "--ps-deny": t.feedback.deny,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
 * Flip timing — §6.1 budget, §6.2 sequence, §6.2a variants, §6.4 reduced motion.
 *
 * One timing **table**, three rows: choosing a variant changes data, never
 * branches (§6.2a). Variant S is the shipped default; Variant CL is the
 * pre-specified causality-locked fallback (switch it only on the measured
 * Stage-2 trigger, recorded by the Playtest Analyst).
 * ──────────────────────────────────────────────────────────────────────────── */

export interface FlipTimings {
  /** Player hop. `dur: 0` = instant (reduced motion). */
  readonly hop: { readonly start: number; readonly dur: number; readonly arc: number; readonly squash: number };
  /** `ground.*` / `plate` / HUD token cross-fade. */
  readonly tokens: { readonly start: number; readonly dur: number };
  /** Wall state swap (R-E6): fill rule + tokens + footprint + edge + notch. */
  readonly walls: { readonly start: number; readonly dur: number; readonly stagger: number };
  /** Background cross-dissolve (placeholder: page ground). */
  readonly background: { readonly start: number; readonly dur: number };
  /** Occupied resolution: cross-fade to `obj.wallOccupied` (R-C13.2). */
  readonly occupied: { readonly start: number; readonly dur: number };
  /** One-shot phase ring (R-C13.4). `start + dur` must stay ≤ `total`. */
  readonly ring: {
    readonly start: number;
    readonly dur: number;
    readonly scaleFrom: number;
    readonly scaleTo: number;
    readonly strokeWidth: number;
  };
  /** Phase chip swap (DOM). */
  readonly chip: { readonly start: number; readonly dur: number };
  /** Win flash: plate tint only (L7). */
  readonly winTint: { readonly dur: number };
  /** Illegal-move nudge — §6.5. Applied to the **player**, never to the wall. */
  readonly deny: { readonly nudge: number; readonly dur: number; readonly ringAlpha: number };
  /** Hard cap of the whole sequence (§6.1). */
  readonly total: number;
}

/** `nudge` is in CSS px; the renderer scales it by the device-pixel ratio cap. */
export const FLIP_TIMING: Record<"S" | "CL" | "reduced", FlipTimings> = {
  S: {
    hop: { start: 0, dur: 130, arc: 0.12, squash: 0.06 },
    tokens: { start: 60, dur: 140 },
    walls: { start: 80, dur: 120, stagger: 15 },
    background: { start: 100, dur: 120 },
    occupied: { start: 140, dur: 80 },
    // 40 + 180 = 220 = §6.1's budget cap. §6.2's table puts the occupied
    // resolution at 140–220 while R-C13.4 fixes the ring at 180 ms; starting at
    // 40 is the only reading in which both numbers hold (the ring is one-shot
    // event feedback fired at flip resolution, not a third transition).
    ring: { start: 40, dur: 180, scaleFrom: 0.7, scaleTo: 1.0, strokeWidth: 2 },
    chip: { start: 140, dur: 80 },
    winTint: { dur: 180 },
    deny: { nudge: 4, dur: 90, ringAlpha: 0.5 },
    total: 220,
  },
  CL: {
    hop: { start: 0, dur: 130, arc: 0.12, squash: 0.06 },
    tokens: { start: 130, dur: 120 },
    // 140 + 95 + 15 (stagger) = 250 = §6.1's hard cap, so the stagger stays
    // inside the budget instead of pushing the swap past it.
    walls: { start: 140, dur: 95, stagger: 15 },
    background: { start: 150, dur: 100 },
    occupied: { start: 170, dur: 80 },
    // 70 + 180 = 250 = the hard cap (same arithmetic as Variant S).
    ring: { start: 70, dur: 180, scaleFrom: 0.7, scaleTo: 1.0, strokeWidth: 2 },
    chip: { start: 180, dur: 70 },
    winTint: { dur: 180 },
    deny: { nudge: 4, dur: 90, ringAlpha: 0.5 },
    total: 250,
  },
  reduced: {
    hop: { start: 0, dur: 0, arc: 0, squash: 0 },
    tokens: { start: 0, dur: 60 },
    walls: { start: 0, dur: 60, stagger: 0 },
    background: { start: 0, dur: 0 },
    occupied: { start: 0, dur: 60 },
    ring: { start: 0, dur: 60, scaleFrom: 0.9, scaleTo: 1.0, strokeWidth: 2 },
    chip: { start: 0, dur: 60 },
    winTint: { dur: 0 },
    deny: { nudge: 4, dur: 90, ringAlpha: 0.5 },
    total: 60,
  },
};

/** §6.2a default. Switching to `"CL"` is a one-line data change, not a code path. */
export const FLIP_VARIANT: "S" | "CL" = "S";

export function flipTimings(reducedMotion: boolean): FlipTimings {
  return reducedMotion ? FLIP_TIMING.reduced : FLIP_TIMING[FLIP_VARIANT];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Fixed frame budget & touch geometry (§2.2, R-L2, R-L5, R-T1, R-T4, §7.3).
 * All values are **CSS px**; the renderer scales them by the DPR cap (R-L6).
 * ──────────────────────────────────────────────────────────────────────────── */

export const LAYOUT = {
  /** Board side margin, §2.2. */
  margin: 16,
  /** R-L5: the board never grows past this, even on a desktop display. */
  maxBoard: 640,
  /** Top HUD bar height (§2.2). */
  topBar: 56,
  /** Bottom action bar height (§2.2). */
  bottomBar: 72,
  /** R-L6: `devicePixelRatio` cap for the render scale. */
  maxRenderScale: 2,
  /** R-L1: hard target; below this the swipe hint of R-T5 appears. */
  minCellTarget: 44,
  /** R-T4: swipe travel threshold / max duration. */
  swipeMinTravel: 24,
  swipeMaxMs: 500,
  /** R-T1/R-T2: minimum control size and gap. */
  minControl: 44,
  controlGap: 8,
} as const;

/* ────────────────────────────────────────────────────────────────────────────
 * HUD feature flags — spec conflicts that must not be resolved silently.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * `par` in the HUD is a **documented conflict**, so it is a flag, not a decision.
 *
 * - `docs/ui-ux.md` §5.3 "Par display — V0.3 decision (M-5b, resolves a doc
 *   conflict)": *plain move count only, no par anywhere in the HUD or the win
 *   dialog* until the Game Designer signs par off for display. It also fixes the
 *   exact format to use **if** that sign-off happens: `moves 4 / par 6`,
 *   `text.secondary`, tabular numerals, no colour change, never framed as a
 *   fail/over-par state.
 * - `docs/level-design.md` §1 describes `par` as a displayed "perfect clear"
 *   target, and the RENDER-001 dispatch requires it in the HUD.
 *
 * Shipping behaviour therefore follows the locked UI spec (`false`) and the
 * pre-agreed format is implemented behind this one flag, so the Game Designer's
 * sign-off is a one-line change with no layout work and no code path to test.
 * `boolean` (not `as const`) on purpose: the flag must stay a runtime branch.
 */
export const HUD_FLAGS: { readonly showPar: boolean } = {
  showPar: false,
};

/** R-L3: derived gutter and corner radius — never hard-coded per cell size. */
export function cellGutter(cellSize: number): number {
  return Math.max(2, Math.round(cellSize * 0.06));
}

export function cellRadius(cellSize: number): number {
  return Math.round(cellSize * 0.14);
}
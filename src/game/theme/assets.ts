/**
 * Asset slots — the renderer/art contract of `docs/ui-ux.md` §9 and §11.
 *
 * AGENTS.md §8 / §9: **no agent generates final art.** This module therefore names
 * **no file path and no URL** — it is the *declaration* half of the contract: one
 * row per manifest slot, the Asset ID that identifies it, the manifest export name
 * the delivered image registers under, and whether that delivery has shipped. The
 * *machinery* half (the shipped URL, the Phaser preload, "did it actually mount")
 * is `theme/art.ts`.
 *
 * Purpose of this module (R-P2 / R-P5): every placeholder carries its **manifest
 * Asset ID** at one place, so integration is *swapping a texture key*, never a
 * refactor. `PLACEHOLDER_TO_ASSET` maps each placeholder to exactly one Asset ID;
 * `PLACEHOLDER_SLOTS` additionally records the manifest export name, which is the
 * texture key the delivered image is registered under.
 *
 * ── Two different questions, deliberately two different mechanisms ───────────
 * - **`resolved`** (this file) is a *declaration*: has the delivered art for this
 *   slot been accepted by the Asset Gate and shipped? It changes only when the
 *   human gate signs a delivery. {@link unresolvedAssetIds} — and therefore R-P6 —
 *   reads it.
 * - **"did it mount"** (`theme/art.ts`, runtime) is a *measurement*: a declared-
 *   resolved texture whose file 404s at runtime (or whose request is blocked) is
 *   not drawn, the vector placeholder is, and R-P2/R-P3 must stay honest about
 *   that. A static flag cannot answer it, and a runtime answer cannot arm R-P6.
 *
 * R-P6 (`assertNoPlaceholders` throwing in a release build) is implemented but
 * gated by {@link ART_INTEGRATED}: while any slot is unresolved the production gate
 * would fail and make the build unplayable, which is the opposite of what R-P6
 * exists for. Flipping `ART_INTEGRATED` to `true` is the documented integration
 * switch (§11 "re-run §3.3 QA, then flip").
 */

/** One drawn placeholder and the manifest row it stands in for. */
export interface PlaceholderSlot {
  /** The key the renderer paints today (a DEV PLACEHOLDER). */
  readonly placeholder: string;
  /** `docs/assets/asset-manifest.md` Asset ID — the only stable reference. */
  readonly assetId: string;
  /** Manifest export name = texture key (§11, R-P5). */
  readonly assetName: string;
  /** Usage, for the dev badge and for the integration checklist. */
  readonly usage: string;
  /**
   * `true` once the delivered art for this slot has been accepted and shipped
   * (an Asset-Gate act, recorded in `docs/assets/art-acceptance-*.md`), `false`
   * while the slot is still a placeholder. {@link unresolvedAssetIds} is derived
   * from this field alone — see the header for why it is not derived from whether
   * the file happened to load.
   */
  readonly resolved: boolean;
}

export const PLACEHOLDER_SLOTS: readonly PlaceholderSlot[] = [
  {
    placeholder: "echo_spirit_a",
    assetId: "A-03",
    assetName: "echo_spirit_a",
    usage: "Echo Spirit, Phase A (L5 actor) — the delivered form, vector disc + R-C9 ring while unmounted",
    resolved: true,
  },
  {
    placeholder: "echo_spirit_b",
    assetId: "A-03",
    assetName: "echo_spirit_b",
    usage: "Echo Spirit, Phase B (L5 actor) — the delivered form, same disc while unmounted",
    resolved: true,
  },
  {
    placeholder: "bg_phase_a",
    assetId: "A-04",
    assetName: "bg_phase_a_1920x1080",
    usage: "Phase A background (L1) — the delivered plate, flat `ground.page` while unmounted",
    resolved: true,
  },
  {
    placeholder: "bg_phase_b",
    assetId: "A-05",
    assetName: "bg_phase_b_1920x1080",
    usage: "Phase B background (L1) — the delivered plate, flat `ground.page` while unmounted",
    resolved: true,
  },
  {
    placeholder: "goal",
    assetId: "A-06",
    assetName: "goal",
    usage: "Goal (L4 object) — the delivered annulus, ring + centre dot while unmounted",
    resolved: true,
  },
  {
    placeholder: "ui_kit",
    assetId: "A-07",
    assetName: "ui_kit",
    usage: "HUD buttons / chips / panels (L8 DOM) — CSS-only per §9.1; disposition is R-005b",
    resolved: false,
  },
];

/** R-P5: one lookup table, placeholder → manifest Asset ID. */
export const PLACEHOLDER_TO_ASSET: Readonly<Record<string, string>> = Object.fromEntries(
  PLACEHOLDER_SLOTS.map((slot) => [slot.placeholder, slot.assetId]),
);

/** Future texture key for a placeholder (what integration swaps in). */
export function assetNameOf(placeholder: string): string | undefined {
  return PLACEHOLDER_SLOTS.find((slot) => slot.placeholder === placeholder)?.assetName;
}

/**
 * R-P2 tag: every placeholder construction site carries this comment form.
 *
 * After integration the tag stays, because the construction site is **still
 * there**: the vector drawing is now the *fallback* a resolved slot degrades to
 * when its texture does not mount (see `theme/art.ts`). R-P2's claim is about what
 * a reader finds at the drawing site, not about which branch runs at runtime.
 */
export function placeholderTag(placeholder: string): string {
  const slot = PLACEHOLDER_SLOTS.find((entry) => entry.placeholder === placeholder);
  const id = slot?.assetId ?? "??";
  return `DEV PLACEHOLDER — ${id} ${placeholder}`;
}

/**
 * Every Asset ID whose delivered art has not shipped — R-P6's input.
 *
 * After R-005a (2026-10-16) this is exactly `["A-07"]`: the five canvas slots
 * (A-03 pair, A-04/A-05 pair, A-06 goal) are integrated, and A-07 `ui_kit` stays
 * open until the R-005b ruling on its L8/DOM disposition.
 */
export function unresolvedAssetIds(): string[] {
  return [...new Set(unresolvedSlots().map((slot) => slot.assetId))];
}

/** The slots still standing in for art, in declaration order (the *declared* set). */
export function unresolvedSlots(): readonly PlaceholderSlot[] {
  return PLACEHOLDER_SLOTS.filter((slot) => !slot.resolved);
}

/** The slots whose delivered art has shipped, in declaration order. */
export function integratedSlots(): readonly PlaceholderSlot[] {
  return PLACEHOLDER_SLOTS.filter((slot) => slot.resolved);
}

/**
 * R-P6 — the production gate. Called once at boot.
 *
 * `throw` is required by the spec, so it throws — but only when art is expected
 * to be integrated ({@link ART_INTEGRATED}). Until GATE A delivers, a release
 * build must still run: the vertical slice is the Stage-2 measurement instrument
 * and a boot throw would delete the evidence instead of protecting it.
 *
 * @throws Error listing every unresolved Asset ID, when the gate is armed.
 */
export function assertNoPlaceholders(): void {
  if (!ART_INTEGRATED) return;
  const unresolved = unresolvedAssetIds();
  if (unresolved.length > 0) {
    throw new Error(
      `Placeholder art in a release build (ui-ux.md R-P6): unresolved Asset IDs ${unresolved.join(", ")}`,
    );
  }
}

/**
 * Integration switch (ui-ux.md §11). Flipping it to `true` without a resolved
 * every slot is a build failure — and that is exactly the point of R-P6.
 *
 * **`false` as of 2026-10-16 (R-005a), on purpose.** The Asset Gate signed the
 * revision round (docs/assets/art-acceptance-2026-10-16.md) and the five canvas
 * slots are integrated, but {@link unresolvedAssetIds} still returns `["A-07"]`
 * (`ui_kit`, whose L8/DOM disposition waits on the UA spec ruling = R-005b), so
 * arming R-P6 here would make `assertNoPlaceholders()` throw at boot — i.e. it
 * would ship the *deletion* of the playable build instead of its protection.
 * Flipping this to `true` belongs to R-005b, when that list is empty.
 */
export const ART_INTEGRATED = false;
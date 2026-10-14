/**
 * Asset slots — the renderer/art contract of `docs/ui-ux.md` §9 and §11.
 *
 * AGENTS.md §8 / §9: **no agent generates final art.** Nothing here loads, names
 * or assumes a file path under `docs/assets/**` or `assets/**` — the manifest is
 * still `REQUESTED` (GATE A), so every drawn element is a **DEV PLACEHOLDER**
 * made of code (vector, flat token colours, no images, no emoji).
 *
 * Purpose of this module (R-P2 / R-P5): every placeholder carries its **manifest
 * Asset ID** at one place, so integration is *swapping a texture key*, never a
 * refactor. `PLACEHOLDER_TO_ASSET` maps each placeholder to exactly one Asset ID;
 * `PLACEHOLDER_SLOTS` additionally records the manifest export name, which is the
 * texture key the delivered image will be registered under.
 *
 * R-P6 (`assertNoPlaceholders` throwing in a release build) is implemented but
 * gated by {@link ART_INTEGRATED}: with no delivered image the production gate
 * would fail vacuously and make the Stage-2 build unplayable, which is the
 * opposite of what R-P6 exists for. Flipping `ART_INTEGRATED` to `true` is the
 * documented integration switch (§11 "re-run §3.3 QA, then flip").
 */

/** One drawn placeholder and the manifest row it stands in for. */
export interface PlaceholderSlot {
  /** The key the renderer paints today (a DEV PLACEHOLDER). */
  readonly placeholder: string;
  /** `docs/assets/asset-manifest.md` Asset ID — the only stable reference. */
  readonly assetId: string;
  /** Manifest export name = future texture key (§11, R-P5). */
  readonly assetName: string;
  /** Usage, for the dev badge and for the integration checklist. */
  readonly usage: string;
}

export const PLACEHOLDER_SLOTS: readonly PlaceholderSlot[] = [
  {
    placeholder: "echo_spirit_a",
    assetId: "A-03",
    assetName: "echo_spirit_a",
    usage: "Echo Spirit, Phase A (L5 actor) — currently a flat `actor.body` disc + R-C9 ring",
  },
  {
    placeholder: "echo_spirit_b",
    assetId: "A-03",
    assetName: "echo_spirit_b",
    usage: "Echo Spirit, Phase B (L5 actor) — same disc, `actor.body` token",
  },
  {
    placeholder: "bg_phase_a",
    assetId: "A-04",
    assetName: "bg_phase_a_1920x1080",
    usage: "Phase A background (L1) — currently the flat `ground.page` colour",
  },
  {
    placeholder: "bg_phase_b",
    assetId: "A-05",
    assetName: "bg_phase_b_1920x1080",
    usage: "Phase B background (L1) — currently the flat `ground.page` colour",
  },
  {
    placeholder: "goal",
    assetId: "A-06",
    assetName: "goal",
    usage: "Goal (L4 object) — currently a hollow ring + centre dot (R-C1 silhouette)",
  },
  {
    placeholder: "ui_kit",
    assetId: "A-07",
    assetName: "ui_kit",
    usage: "HUD buttons / chips / panels (L8 DOM) — currently CSS-only per §9.1",
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

/** R-P2 tag: every placeholder construction site carries this comment form. */
export function placeholderTag(placeholder: string): string {
  const slot = PLACEHOLDER_SLOTS.find((entry) => entry.placeholder === placeholder);
  const id = slot?.assetId ?? "??";
  return `DEV PLACEHOLDER — ${id} ${placeholder}`;
}

/**
 * Every Asset ID that is still a placeholder. With the current GATE A status
 * that is all of them; after integration it must be empty.
 */
export function unresolvedAssetIds(): string[] {
  return [...new Set(PLACEHOLDER_SLOTS.map((slot) => slot.assetId))];
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
 * Integration switch (ui-ux.md §11). `false` while the manifest is `REQUESTED`.
 * Setting this to `true` without swapping the textures is a build failure — and
 * that is exactly the point of R-P6.
 */
export const ART_INTEGRATED = false;
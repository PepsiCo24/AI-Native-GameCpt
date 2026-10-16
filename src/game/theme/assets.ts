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
 * ── One slot left this table (A-07 `ui_kit`, 2026-10-16) ─────────────────────
 * "A slot in this table" means "a drawn thing that stands in for art". A-07 was
 * ruled **CSS-by-design FINAL** (UA-0013, `docs/ui-ux.md` V0.9.4 §9.1 + §11; the
 * manifest's A-07 row, `docs/assets/asset-manifest.md` V0.5.4): the HUD ships its
 * token CSS, and the delivered, signed sheet is a **reference kit** — style canon,
 * never a DOM skin and never a runtime dependency. Its row is therefore **removed**
 * rather than flipped to `resolved: true`, which is deliberately *not* the
 * integration path: `resolved` says "the delivered file is the thing being drawn",
 * and for A-07 the drawn thing is CSS, not the sheet. This is the K-4 portal-shape
 * precedent (`ui-ux.md` V0.8: no placeholder slot, no `PLACEHOLDER_TO_ASSET`
 * entry, no runtime consumer) applied to a sheet that *was* accepted. Consequence
 * chain, by construction: A-07 leaves {@link unresolvedAssetIds}, the R-P3 dev
 * strip loses its item (it lists the slot table), and R-P6's gate then covers
 * exactly the canvas set A-03 / A-04 / A-05 / A-06.
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
 * R-P6 (`assertNoPlaceholders` throwing in a release build) is implemented and
 * **armed** by {@link ART_INTEGRATED}: a slot declared unresolved fails the boot
 * loudly instead of shipping placeholder art behind a playable board. The switch
 * was held `false` only while a slot was still open (the documented §11 sequence
 * is "re-run §3.3 QA, then flip"); that condition is now met and it is `true`.
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
];

/**
 * R-P5: one lookup table, placeholder → manifest Asset ID.
 *
 * **A-07 `ui_kit` is absent on purpose (retired 2026-10-16, R-005b).** It *had* an
 * entry (`ui_kit` → `A-07`) until UA-0013 ruled the slot CSS-by-design FINAL
 * (`docs/ui-ux.md` V0.9.4 §9.1 + §11; manifest `docs/assets/asset-manifest.md`
 * V0.5.4: A-07 → DELIVERED, integrated as a **reference kit**). The sheet is never
 * loaded at runtime, so there is no texture key to map and no runtime consumer to
 * rename from a placeholder: the row left the table, exactly as the K-4 portal
 * ruling left `portal_a/b` out (no slot, no entry, R-P5-consistent). A future
 * Stage-4+ adoption of a sheet export re-enters through the §11 gate with a spec
 * row first, never by re-adding a line here.
 */
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
 * **Empty since 2026-10-16 (R-005b).** R-005a integrated the five canvas slots
 * (A-03 pair, A-04/A-05 plates, A-06 goal); UA-0013 then retired the sixth row —
 * A-07 `ui_kit`, CSS-by-design FINAL, see the header. Routing A-07 out of this
 * table rather than flipping it to `resolved: true` is what makes emptiness the
 * *declared* answer: this list is derived from `resolved`, never from whether a
 * file happened to load.
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
 * R-P6 — the production gate. Called once at boot (`src/main.ts`).
 *
 * `throw` is required by the spec, so it throws — whenever a slot is declared
 * unresolved while {@link ART_INTEGRATED} is armed. The earlier leniency ("until
 * GATE A delivers, a release build must still run") existed for one reason only:
 * a boot throw while the vertical slice was *still* the Stage-2 measurement
 * instrument would have deleted evidence instead of protecting it. That reason is
 * gone — every drawn slot is integrated — so the gate is live and stays live: the
 * next `resolved: false` row added here, or the next delivery rolled back to
 * placeholder, fails the build at boot rather than shipping silently.
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
 * Integration switch (ui-ux.md §11). Flipping it to `true` while any slot is
 * unresolved is a build failure — and that is exactly the point of R-P6.
 *
 * **`true` as of 2026-10-16 (R-005b, first live round).** Three conditions hold,
 * each one a separate act by someone other than this module:
 *
 * 1. the Asset Gate **signed the revision round** (`docs/assets/art-acceptance-
 *    2026-10-16.md`, human-signed "签 R-005"), and R-005a wired the five canvas
 *    slots (A-03 pair, A-04/A-05 plates, A-06 goal) as texture-key swaps;
 * 2. A-07 `ui_kit` was ruled CSS-by-design FINAL by UA-0013 (`ui-ux.md` V0.9.4
 *    §9.1) and its row retired from `PLACEHOLDER_SLOTS` above — so
 *    {@link unresolvedAssetIds} returns **`[]`**, measured, not assumed;
 * 3. both boot guards pass on this tree: this gate (no unresolved slot) and
 *    `theme/art.ts`'s `assertArtSourcesMatchSlots()` (the five shipped URLs are
 *    exactly the five `resolved: true` rows, both directions).
 *
 * This is the switch's *armed* state, not a one-shot: any future slot added here
 * without its delivered file — or any delivery reverted to placeholder — throws
 * at boot, which is R-P6 working rather than a reason to flip it back.
 */
export const ART_INTEGRATED = true;
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
 * It is also the **one** place a phase is paired with the file that draws its
 * actor ({@link actorSlotFor}): that pairing is manifest data, and since R-C9's
 * ring decision is measured from the colour of whichever body is drawn
 * (`theme/tokens.ts` `applyDrawnActorBody`), the pairing is a *rule input* rather
 * than a cosmetic lookup. The same is true, one class over, of the portal pair
 * ({@link portalSlotFor}): its phase mapping is a **measured** colour pairing
 * (§3.1e R-PM1), not a suffix convention — see that function for the trap.
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

import type { Phase } from "@/core/state/phase";

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
    // §3.1e R-PM5 — A-06's **portal half**, mounted by GAME-003. Not a placeholder
    // row in spirit (`docs/ui-ux.md` §9.1: the live figure is *signed raster*, the
    // dormant figure is vector-by-design), but it MUST be a resolved row here: the
    // `assertArtSourcesMatchSlots()` both-ways guard reads `integratedSlots()`, so a
    // key in `ART_SOURCES` with no resolved row is "shipped but not resolved" — the
    // mount and the declaration have to land together (architecture §9.1 rule 3).
    placeholder: "portal_a",
    assetId: "A-06",
    assetName: "portal_a",
    usage:
      "Portal, Phase B (M2 — mounted SWAPPED per §3.1e R-PM1; dormant figure is the §3.1c vector outline)",
    resolved: true,
  },
  {
    placeholder: "portal_b",
    assetId: "A-06",
    assetName: "portal_b",
    usage:
      "Portal, Phase A (M2 — mounted SWAPPED per §3.1e R-PM1; dormant figure is the §3.1c vector outline)",
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
 * ruling once left `portal_a/b` out (no slot, no entry, R-P5-consistent). A future
 * Stage-4+ adoption of a sheet export re-enters through the §11 gate with a spec
 * row first, never by re-adding a line here.
 *
 * **The K-4 portal ruling is superseded (GAME-003, `docs/ui-ux.md` V0.9.6 §3.1e).**
 * `portal_a` / `portal_b` are now **resolved rows** in {@link PLACEHOLDER_SLOTS},
 * because the signed A-06 portal pair is mounted (R-PM5: the two `ART_SOURCES`
 * entries and the two resolved rows land in one commit). This table is derived from
 * those rows, so it gained the two entries by construction — the "`PLACEHOLDER_TO_ASSET`
 * is unchanged" phrasing in §3.1e's R-PM5 note is an internal contradiction of R-P5
 * (a slot may not exist in one table without the other) and is reported, not
 * obeyed. The dev strip's old K-4 negative (`portalMentioned: false`) is superseded
 * *deliberately* by the mount, and the §3.3b Entry-6 record states that supersession
 * (QA-017 re-points the probe; the old probe is never deleted).
 */
export const PLACEHOLDER_TO_ASSET: Readonly<Record<string, string>> = Object.fromEntries(
  PLACEHOLDER_SLOTS.map((slot) => [slot.placeholder, slot.assetId]),
);

/**
 * The Asset ID of the actor's delivered form — the one slot whose colour is also
 * a *rule input* (R-C9 reads the drawn body; see `theme/tokens.ts`
 * `applyDrawnActorBody` and `theme/art.ts` `publishArtMount`).
 */
const ACTOR_ASSET_ID = "A-03";

/**
 * The manifest row that draws the actor in `phase`.
 *
 * A-03 is **one** Asset ID with **two** forms, so the phase picks a *row*, not an
 * ID: the pair is found by the row's own manifest name suffix (`echo_spirit_a` /
 * `echo_spirit_b`) and never by a second table. This is deliberately the same
 * pairing QA-007's in-page probe derives from the same fields
 * (`tests/e2e/helpers/game.ts` `decodeSpiritCentre`), so the production
 * measurement and the probe cannot disagree about *which file* they are reading —
 * neither retypes a texture key, so a manifest rename moves both.
 *
 * `undefined` rather than a throw when the row is absent: a manifest without an
 * actor slot must degrade to the token derivation, not break boot.
 */
export function actorSlotFor(phase: Phase): PlaceholderSlot | undefined {
  const suffix = `_${phase.toLowerCase()}`;
  return PLACEHOLDER_SLOTS.find(
    (slot) => slot.assetId === ACTOR_ASSET_ID && slot.assetName.endsWith(suffix),
  );
}

/**
 * The Asset ID of the portal's delivered pair — A-06's **portal half**.
 *
 * A-06 is one Asset ID with two halves: the goal annulus (its own `goal` row) and
 * this portal pair. Reading the ID through a constant (rather than the literal in
 * {@link portalSlotFor}) keeps the pairing a manifest fact, exactly like
 * {@link ACTOR_ASSET_ID} does for the spirit pair.
 */
const PORTAL_ASSET_ID = "A-06";

/**
 * §3.1e R-PM1 — **the phase mapping is measured, not suffixed.**
 *
 * Phase A mounts `portal_b`; Phase B mounts `portal_a`. This is deliberately the
 * **opposite** of the A-03 spirit pair's `_a` / `_b` convention, so deriving the key
 * from the phase letter (the spirit convention) is a **defect, not a style choice**
 * (`docs/ui-ux.md` §3.1e R-PM1 names that derivation a defect outright).
 *
 * ── Why no other cue can be inherited: the pair's alpha is bit-identical ─────
 * Probe `pair` (`art-acceptance-2026-10-16.md` R-T06): both delivered files carry the
 * **same 74 713 px ink census and the same α-bbox** — only 77 543 px differ in RGB,
 * and R-T06's silhouette IoU is **1.0000**. Silhouette and geometry are therefore
 * *shared*: the phase pairing is a colour measurement or nothing, and the wrong
 * mapping still *looks* right (it is bit-identical in alpha) while failing R-C3.
 *
 * ── The measurement, both directions (R-C3 ≥ 3:1) ────────────────────────────
 * As-named (`portal_a` on A = **2.24:1** / **1.91** vs `cellAlt`; `portal_b` on B =
 * **2.16:1** / **1.90**) fails on both grounds. Swapped = **6.50 / 5.53** on the A
 * ground and **6.25 / 5.49** on the B ground. Those numbers are quoted here because
 * the next reader's instinct is the suffix convention and the failure mode is silent.
 */
const PORTAL_SLOT_BY_PHASE: Readonly<Record<Phase, string>> = {
  A: "portal_b",
  B: "portal_a",
};

/**
 * The manifest row that draws the portal in `phase` — §3.1e R-PM1's **measured**
 * mapping, the portal's counterpart to {@link actorSlotFor}.
 *
 * The live figure's phase is the portal's own `activePhase`
 * (`renderer/cell-state.ts` `portalLivePhase`), so this resolver's input is a
 * *portal* phase, not a board phase — the two coincide exactly when the end is live
 * (`portalAt`). `undefined` rather than a throw when the row is absent: a manifest
 * without the portal slot must degrade to the §3.1c vector figure, not break boot
 * (the same rule `actorSlotFor` follows).
 */
export function portalSlotFor(phase: Phase): PlaceholderSlot | undefined {
  const placeholder = PORTAL_SLOT_BY_PHASE[phase];
  return PLACEHOLDER_SLOTS.find(
    (slot) => slot.assetId === PORTAL_ASSET_ID && slot.placeholder === placeholder,
  );
}

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
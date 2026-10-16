/**
 * Delivered-art registry — the **runtime half** of the §11 integration contract.
 *
 * `theme/assets.ts` declares *which* manifest slot each drawn element stands in
 * for and whether that delivery has shipped; this module knows *where the file is*,
 * puts it into Phaser's texture manager, and answers one runtime question the
 * declaration cannot: **did it actually mount?**
 *
 * ── The integration rule, made mechanical ────────────────────────────────────
 * §9.2 R-P5 / §11: *integration is swapping a texture key, never a refactor.* So
 * the seam is exactly two lines per slot: an entry in {@link ART_SOURCES} (key =
 * the manifest export name from `assetNameOf`, value = the built URL) and a
 * `resolved: true` in `theme/assets.ts`. Painters ask
 * {@link isArtMounted}("their" key) and draw the texture when it answers `true`,
 * otherwise their unchanged vector placeholder. No painter names a file path, no
 * painter knows a URL, and no painter imports Phaser.
 *
 * ── Why `?url` imports, and not `public/` ────────────────────────────────────
 * `docs/ui-ux.md` §11 expects the delivered PNGs *in the game*; `vite.config.ts`
 * builds with `base: "./"` so the same `dist` works from the GitHub Pages subpath,
 * a repo root or a preview server. A `?url` import is the minimal honest
 * mechanism for that: Vite copies exactly the referenced bytes into
 * `dist/assets/<name>-<hash>.png` and hands back the URL it emitted, so the
 * build **cannot** forget a file it uses and **cannot** ship one it does not
 * (no second copy under `public/`, no plugin, no path invented by hand — see
 * `docs/iteration-log.md` for the measured dist list). `?url` is used explicitly
 * rather than a bare `.png` import so the intent is "a URL, never inlined as a
 * data URI" even if `assetsInlineLimit` is ever raised.
 *
 * ── Degradation is a branch, not an exception ────────────────────────────────
 * Nothing here throws when art is missing. A blocked request, a 404 or an
 * offline boot leaves the texture unmounted; {@link publishArtMount} then reports
 * the slot as still-a-placeholder, the painter draws the vector fallback, and
 * R-P2/R-P3 stay honest (the dev badge names the slot again). Boot is therefore
 * never art-dependent: art decides *what the board is drawn with*, never
 * *whether the board is drawn*.
 */

/// <reference types="vite/client" />

import type Phaser from "phaser";

import { assetNameOf, integratedSlots, unresolvedSlots } from "@/game/theme/assets";
import type { PlaceholderSlot } from "@/game/theme/assets";

import bgPhaseAUrl from "../../../assets/art/background/bg_phase_a_1920x1080.png?url";
import bgPhaseBUrl from "../../../assets/art/background/bg_phase_b_1920x1080.png?url";
import echoSpiritAUrl from "../../../assets/art/character/echo_spirit_a.png?url";
import echoSpiritBUrl from "../../../assets/art/character/echo_spirit_b.png?url";
import goalUrl from "../../../assets/art/props/goal.png?url";

/**
 * Manifest export name (§11/R-P5) → the URL this build emitted for the file.
 *
 * **The five ASSET-GATE-approved canvas slots and nothing else.** `portal_a/b`
 * are out by ruling — portals are vector-by-design (`ui-ux.md` V0.8 §3.1c/§9.1)
 * and the raster pair is optional Stage-5 polish; `ui_kit` is DOM/CSS per §9.1
 * (R-005b); logo/cover are not renderer slots at all. Listing a file here is what
 * *ships* it, so listing one the renderer never draws would be both a lie and
 * dead weight in the bundle.
 */
export const ART_SOURCES: Readonly<Record<string, string>> = Object.freeze({
  echo_spirit_a: echoSpiritAUrl,
  echo_spirit_b: echoSpiritBUrl,
  bg_phase_a_1920x1080: bgPhaseAUrl,
  bg_phase_b_1920x1080: bgPhaseBUrl,
  goal: goalUrl,
});

/** Every texture key this build can mount, in declaration order. */
export const ART_TEXTURE_KEYS: readonly string[] = Object.freeze(Object.keys(ART_SOURCES));

/**
 * The texture key of one slot, resolved from R-P5's single table — so a call site
 * never retypes a manifest name. Throws on an unknown placeholder: that is a
 * static mistake, and a silent `undefined` key would surface as "art never loads".
 */
export function slotKey(placeholder: string): string {
  const key = assetNameOf(placeholder);
  if (key === undefined) {
    throw new Error(
      `theme/assets.ts R-P5: "${placeholder}" is not a manifest slot, so it has no texture key`,
    );
  }
  return key;
}

/**
 * Boot guard: the next-way table and the declaration must agree **both ways**.
 *
 * `resolved: true` with no source is "we shipped it" while shipping nothing (the
 * painter falls back forever and nobody notices); a source with no resolved slot
 * is dead bytes in every bundle, or — worse — art loaded for a slot the gate has
 * not signed. Neither is visible in a screenshot, so it is checked as a rule.
 *
 * @throws Error naming both directions of the mismatch.
 */
export function assertArtSourcesMatchSlots(): void {
  const declared = new Set(integratedSlots().map((slot) => slot.assetName));
  const shipped = new Set(ART_TEXTURE_KEYS);
  const missing = [...declared].filter((key) => !shipped.has(key));
  const extra = [...shipped].filter((key) => !declared.has(key));
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      "theme/art.ts: ART_SOURCES and the resolved slots of theme/assets.ts disagree — " +
        `resolved but not shipped: [${missing.join(", ")}]; shipped but not resolved: [${extra.join(", ")}]`,
    );
  }
}

/**
 * Queue every delivered texture the scene has not mounted yet. Called from
 * `LevelScene.preload()`; a no-op on a second level, because the manager keeps
 * the texture and re-queuing a live key is a Phaser warning, not a reload.
 */
export function queueDeliveredArt(scene: Phaser.Scene): void {
  for (const [key, url] of Object.entries(ART_SOURCES)) {
    if (scene.textures.exists(key)) continue;
    scene.load.image(key, url);
  }
}

/**
 * What the loader actually delivered, in one Set — the module's whole state.
 *
 * Empty until {@link publishArtMount} runs, and emptiness means "nothing is
 * mounted", i.e. the *placeholder* answer. That is the safe default: a UI that
 * renders before the loader finishes must not claim art it has not seen.
 */
let mounted: ReadonlySet<string> = new Set<string>();

/**
 * Read the loader's outcome out of the texture manager and publish it.
 *
 * Called once from `LevelScene.create()`, i.e. after `preload()` has resolved —
 * so a texture that is absent here is absent for good (Phaser creates a texture
 * only for a file that arrived). Returns the slots the HUD must still label as
 * placeholders, which is the honest dev-badge input (R-P2/R-P3).
 */
export function publishArtMount(
  textures: Phaser.Textures.TextureManager,
): readonly PlaceholderSlot[] {
  mounted = new Set(ART_TEXTURE_KEYS.filter((key) => textures.exists(key)));
  return activePlaceholderSlots();
}

/** `true` when the delivered texture for this key is mounted and can be drawn. */
export function isArtMounted(textureKey: string): boolean {
  return mounted.has(textureKey);
}

/**
 * Declared-resolved slots whose texture did **not** mount — the degraded state.
 * Non-empty only when a shipped file failed (404 / blocked / offline).
 */
export function unmountedResolvedSlots(): readonly PlaceholderSlot[] {
  return integratedSlots().filter((slot) => !mounted.has(slot.assetName));
}

/**
 * Every slot a placeholder is *actually* being drawn for right now: unresolved by
 * declaration, plus resolved-but-unmounted. This is the one set the R-P3 dev
 * labels may claim, and `unresolvedSlots()` (the declaration) is what R-P6 reads.
 */
export function activePlaceholderSlots(): readonly PlaceholderSlot[] {
  return [...unresolvedSlots(), ...unmountedResolvedSlots()];
}
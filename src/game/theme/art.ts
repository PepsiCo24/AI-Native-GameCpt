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
 * ── The second job this module took on: R-C9's true input ────────────────────
 * The delivered files are not tokens, so one question stopped being answerable
 * from the token map: **how much contrast does the drawn body actually have
 * against the cell it stands on?** R-C9's auto-contrast ring (the identity ring on
 * the 0.82 × cell path) is that measurement's consequence, and with a sprite on
 * the board the measurement's subject is the sprite. So `publishArtMount` also
 * measures — once, at boot, from the texture the loader already received — and
 * hands the colour to `theme/tokens.ts`'s `applyDrawnActorBody`, which re-decides
 * R-C9 for that phase. The renderer keeps reading a plain boolean
 * (`tokens.actor.ringVisible`); no painter decodes a pixel. See
 * {@link measuredCentreColour} and the QA-007-F1 note in `theme/tokens.ts`.
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

import { actorSlotFor, assetNameOf, integratedSlots, unresolvedSlots } from "@/game/theme/assets";
import type { PlaceholderSlot } from "@/game/theme/assets";
import { applyDrawnActorBody } from "@/game/theme/tokens";
import type { Hex, Phase } from "@/game/theme/tokens";

import bgPhaseAUrl from "../../../assets/art/background/bg_phase_a_1920x1080.png?url";
import bgPhaseBUrl from "../../../assets/art/background/bg_phase_b_1920x1080.png?url";
import echoSpiritAUrl from "../../../assets/art/character/echo_spirit_a.png?url";
import echoSpiritBUrl from "../../../assets/art/character/echo_spirit_b.png?url";
import goalUrl from "../../../assets/art/props/goal.png?url";
import portalAUrl from "../../../assets/art/props/portal_a.png?url";
import portalBUrl from "../../../assets/art/props/portal_b.png?url";

/**
 * Manifest export name (§11/R-P5) → the URL this build emitted for the file.
 *
 * **The seven ASSET-GATE-approved canvas slots and nothing else** (five since
 * R-005a, plus the A-06 portal pair mounted by GAME-003, §3.1e R-PM5). `ui_kit` was
 * ruled CSS-by-design FINAL by UA-0013 (2026-10-16, `ui-ux.md` V0.9.4 §9.1/§11 +
 * manifest V0.5.4: A-07 DELIVERED as a **reference kit**, never loaded at runtime)
 * and its row left `theme/assets.ts`; logo/cover are not renderer slots at all.
 * Listing a file here is what *ships* it, so listing one the renderer never draws
 * would be both a lie and dead weight in the bundle.
 *
 * The order is `integratedSlots()`' own declaration order, because
 * {@link assertArtSourcesMatchSlots} compares the two lists **element-wise**: the
 * two portal rows therefore sit after `goal`, where `theme/assets.ts` declares them.
 */
export const ART_SOURCES: Readonly<Record<string, string>> = Object.freeze({
  echo_spirit_a: echoSpiritAUrl,
  echo_spirit_b: echoSpiritBUrl,
  bg_phase_a_1920x1080: bgPhaseAUrl,
  bg_phase_b_1920x1080: bgPhaseBUrl,
  goal: goalUrl,
  portal_a: portalAUrl,
  portal_b: portalBUrl,
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

/* ────────────────────────────────────────────────────────────────────────────
 * R-C9's true input: the colour of the body that was drawn
 *
 * The delivered files are not tokens, so no token lookup can answer R-C9 (the
 * auto-contrast ring, `docs/ui-ux.md` R-C9) once a sprite is what the player sees:
 * the ring's visibility is a contrast measurement of the **drawn body** against
 * the ground cell. `theme/tokens.ts` derives it from its placeholder token;
 * `applyDrawnActorBody` re-decides it from the measurement below, and this module
 * is where the measurement lives because this module is the one that knows *what
 * mounted*.
 *
 * **One decode, in one place.** The centre pixel is read from the texture this
 * Phaser scene already loaded (`Texture.getSourceImage()` — the same bytes the
 * loader received, never a second fetch and never a re-decode per frame), and it is
 * read exactly the way QA-007's in-page pixel probe reads it: `getImageData` on the
 * file's own centre, i.e. the one pixel `paintActor` puts on the actor's cell
 * centre. Nothing in `src/game/renderer/**` decodes pixels, and no hex literal
 * enters the source: the number comes from the file that shipped.
 *
 * The value is a raw RGB sample, not an alpha composite: the delivered spirit pair
 * composites at alpha ≈ 253/255, so the difference against the ground is under 1 %
 * — well inside the 3:1 band's granularity, and identical to what the probe reads.
 * ──────────────────────────────────────────────────────────────────────────── */

/** The phases whose actor body is a delivered slot — the measurement's scope. */
const ACTOR_PHASES: readonly Phase[] = ["A", "B"];

/** texture key → the measured centre colour of the mounted file. */
let measuredCentres: ReadonlyMap<string, Hex> = new Map<string, Hex>();

/**
 * The measured centre pixel of a mounted texture, or `null` when that file is not
 * mounted or its pixels could not be read (a headless double with no canvas, a
 * tainted canvas, a 404). `null` always means "fall back to the token derivation".
 */
export function measuredCentreColour(textureKey: string): Hex | null {
  return measuredCentres.get(textureKey) ?? null;
}

/** `#rrggbb` from three byte samples — the token format, so one rule function fits both inputs. */
function hexOf(r: number, g: number, b: number): Hex {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Read one mounted texture's centre pixel, or `null` when it cannot be read.
 *
 * Deliberately silent: a texture whose pixels are unavailable is not an error, it
 * is the *absent measurement* that leaves R-C9 on its token derivation (this
 * module's standing degrade rule — nothing here throws, because art decides what
 * the board is drawn with, never whether the board is drawn).
 */
function decodeCentreColour(textures: Phaser.Textures.TextureManager, key: string): Hex | null {
  // Unit-test doubles (and any non-Phaser host) expose `exists` only. No pixel
  // source ⇒ no measurement ⇒ placeholder path, byte-for-byte.
  const manager = textures as Partial<Phaser.Textures.TextureManager>;
  if (typeof manager.get !== "function") return null;
  if (typeof document === "undefined") return null;

  try {
    const source = manager.get(key).getSourceImage() as unknown;
    if (source === null || typeof source !== "object") return null;
    const box = source as { readonly width?: unknown; readonly height?: unknown };
    const width = typeof box.width === "number" ? box.width : 0;
    const height = typeof box.height === "number" ? box.height : 0;
    if (width < 1 || height < 1) return null;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx === null) return null;
    // The centre pixel only: one 1×1 draw of the source's centre, so the sample is
    // exactly the pixel `paintActor` lands on the cell centre (no full-size copy).
    ctx.drawImage(
      source as CanvasImageSource,
      Math.floor(width / 2),
      Math.floor(height / 2),
      1,
      1,
      0,
      0,
      1,
      1,
    );
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return hexOf(data[0] ?? 0, data[1] ?? 0, data[2] ?? 0);
  } catch {
    return null;
  }
}

/**
 * Re-decide R-C9 for both phases from what this boot measured — the join between
 * "what mounted" (here) and "what R-C9 says about the drawn body"
 * (`theme/tokens.ts`).
 *
 * A phase whose slot is missing, unmounted or unreadable is passed `null`, which
 * *removes* any override: the token derivation, i.e. exactly the pre-integration
 * board. So a partial delivery degrades per phase, not per board.
 */
function rederiveActorRing(textures: Phaser.Textures.TextureManager): void {
  const centres = new Map<string, Hex>();
  for (const key of mounted) {
    const centre = decodeCentreColour(textures, key);
    if (centre !== null) centres.set(key, centre);
  }
  measuredCentres = centres;

  for (const phase of ACTOR_PHASES) {
    const slot = actorSlotFor(phase);
    applyDrawnActorBody(
      phase,
      slot === undefined ? null : (centres.get(slot.assetName) ?? null),
    );
  }
}

/**
 * Read the loader's outcome out of the texture manager and publish it.
 *
 * Called once from `LevelScene.create()`, i.e. after `preload()` has resolved —
 * so a texture that is absent here is absent for good (Phaser creates a texture
 * only for a file that arrived). Returns the slots the HUD must still label as
 * placeholders, which is the honest dev-badge input (R-P2/R-P3).
 *
 * Publishing the mount is also the one moment R-C9 can be decided correctly
 * ({@link rederiveActorRing}): the body's colour is not known until the loader has
 * spoken, and it must be decided once, at boot, never per frame (R-C9). Doing both
 * here means a later call site cannot publish a mount and forget the rule.
 */
export function publishArtMount(
  textures: Phaser.Textures.TextureManager,
): readonly PlaceholderSlot[] {
  mounted = new Set(ART_TEXTURE_KEYS.filter((key) => textures.exists(key)));
  rederiveActorRing(textures);
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
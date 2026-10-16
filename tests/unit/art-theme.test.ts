/**
 * `src/game/theme/art.ts` + `src/game/theme/assets.ts` — the delivered-art seam.
 *
 * This is the one module pair where "the art is in the game" is decided, and until
 * QA-007 it had **no unit coverage at all**: the only evidence was a pixel probe in
 * the e2e suite, which is exactly the layer that cannot see the difference between
 * "the texture failed to mount" and "the painter never asked for it".
 *
 * The four claims asserted here are the ones a screenshot cannot falsify:
 *
 * 1. **The two-way boot guard.** `ART_SOURCES` (what the bundle ships) and the
 *    `resolved: true` rows (what the Asset Gate signed) must agree in *both*
 *    directions — a `resolved` slot with no source is "we shipped it" while
 *    shipping nothing; a source with no resolved slot is dead bytes, or art
 *    loaded for a slot the gate has not signed.
 * 2. **The mount measurement, and its degrade.** `publishArtMount` reads the
 *    loader's outcome out of the texture manager; a partially-failed delivery must
 *    name *exactly* the slots that fell back, because that list is what R-P3's dev
 *    badge prints and what R-P2's honesty claim rests on.
 * 3. **The queue.** `queueDeliveredArt` queues each shipped key once and never
 *    re-queues a live texture (a Phaser warning, and a reload on a second level).
 * 4. **The placeholder census is derived.** The unresolved set, its Asset IDs and
 *    the active-placeholder union are read off `PLACEHOLDER_SLOTS`, never typed
 *    out here — so flipping `resolved` for a future delivery moves these tests
 *    with it instead of making them lie.
 *
 * Module state (`mounted`) is deliberately module-level in `art.ts`, so every case
 * that mutates it runs on a freshly imported module instance
 * (`vi.resetModules()` + dynamic `import`), and the mismatch cases mock only
 * `@/game/theme/assets` — never `art.ts` itself, which stays the thing under test.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import type Phaser from "phaser";
import {
  ART_SOURCES,
  ART_TEXTURE_KEYS,
  assertArtSourcesMatchSlots,
  activePlaceholderSlots,
  isArtMounted,
  publishArtMount,
  queueDeliveredArt,
  slotKey,
  unmountedResolvedSlots,
} from "@/game/theme/art";
import {
  integratedSlots,
  PLACEHOLDER_SLOTS,
  unresolvedAssetIds,
  unresolvedSlots,
} from "@/game/theme/assets";
import type { PlaceholderSlot } from "@/game/theme/assets";

/* ─────────────────────────── fakes for the Phaser seam ─────────────────────── */

/** A `TextureManager` that only answers `exists` — the one method the seam uses. */
function texturesWith(keys: readonly string[]): Phaser.Textures.TextureManager {
  const live = new Set(keys);
  return { exists: (key: string) => live.has(key) } as unknown as Phaser.Textures.TextureManager;
}

/** A `Scene` that records `load.image(key, url)` calls. */
function recordingScene(live: readonly string[] = []): {
  readonly scene: Phaser.Scene;
  readonly queued: [string, string][];
} {
  const existing = new Set(live);
  const queued: [string, string][] = [];
  const scene = {
    textures: { exists: (key: string) => existing.has(key) },
    load: {
      image: (key: string, url: string) => {
        queued.push([key, url]);
        existing.add(key);
      },
    },
  } as unknown as Phaser.Scene;
  return { scene, queued };
}

/** Every asset ID the manifest declares, deduped — the derived census, not a literal. */
function declaredAssetIds(): string[] {
  return [...new Set(PLACEHOLDER_SLOTS.map((slot) => slot.assetId))];
}

afterEach(() => {
  vi.doUnmock("@/game/theme/assets");
  vi.resetModules();
});

/* ────────────────────────── 1. the two-way boot guard ─────────────────────── */

describe("assertArtSourcesMatchSlots — ART_SOURCES ↔ resolved slots, both ways", () => {
  it("holds on the shipped manifest: every resolved slot is shipped and nothing else is", () => {
    // The declaration (what the gate signed) and the sources (what `?url` put in
    // the bundle) are derived from each other here, never from a hand-typed list.
    const declared = integratedSlots().map((slot) => slot.assetName);
    expect(ART_TEXTURE_KEYS).toEqual(declared);
    expect(() => {
      assertArtSourcesMatchSlots();
    }).not.toThrow();
  });

  it("names the slots when a resolved slot has no shipped source", async () => {
    vi.resetModules();
    const ghost: PlaceholderSlot = {
      placeholder: "ghost",
      assetId: "A-99",
      assetName: "ghost_slot",
      usage: "test fixture",
      resolved: true,
    };
    vi.doMock("@/game/theme/assets", async () => {
      const actual = await vi.importActual<typeof import("@/game/theme/assets")>(
        "@/game/theme/assets",
      );
      return {
        ...actual,
        integratedSlots: () => [ghost],
        unresolvedSlots: () => actual.PLACEHOLDER_SLOTS.filter((slot) => !slot.resolved),
      };
    });
    const art = await import("@/game/theme/art");
    expect(() => {
      art.assertArtSourcesMatchSlots();
    }).toThrow(/resolved but not shipped: \[ghost_slot\]/);
    // The shipped set is untouched by the mock, so the other direction names every
    // key the bundle still carries.
    expect(() => {
      art.assertArtSourcesMatchSlots();
    }).toThrow(new RegExp(`shipped but not resolved: \\[${[...ART_TEXTURE_KEYS].join(", ")}\\]`));
  });

  it("names the slots when a shipped source has no resolved slot", async () => {
    vi.resetModules();
    // Realistic shape: the two A-03 spirits stay resolved, the three remaining
    // sources keep being bundled after their `resolved` flags were withdrawn — the
    // "dead bytes in every bundle, art loaded for a slot the gate has not signed"
    // case. `missing` is empty here, so only `extra` may fire.
    vi.doMock("@/game/theme/assets", async () => {
      const actual = await vi.importActual<typeof import("@/game/theme/assets")>(
        "@/game/theme/assets",
      );
      const stillResolved = actual
        .integratedSlots()
        .filter((slot) => slot.assetName.startsWith("echo_spirit"));
      return {
        ...actual,
        integratedSlots: () => stillResolved,
        unresolvedSlots: () => actual.PLACEHOLDER_SLOTS.filter((slot) => !slot.resolved),
      };
    });
    const art = await import("@/game/theme/art");
    const expectedExtra = [...ART_TEXTURE_KEYS].filter(
      (key) => !key.startsWith("echo_spirit"),
    );
    expect(expectedExtra.length).toBeGreaterThan(0);
    expect(() => {
      art.assertArtSourcesMatchSlots();
    }).toThrow(new RegExp(`shipped but not resolved: \\[${expectedExtra.join(", ")}\\]`));
    expect(() => {
      art.assertArtSourcesMatchSlots();
    }).toThrow(/resolved but not shipped: \[\]/);
  });

  it("slotKey resolves a manifest placeholder to the shipped key and rejects anything else", () => {
    for (const slot of PLACEHOLDER_SLOTS) {
      expect(slotKey(slot.placeholder), slot.placeholder).toBe(slot.assetName);
    }
    expect(() => slotKey("not_a_slot")).toThrow(/is not a manifest slot/);
  });

  it("ships a non-empty URL per key — a `?url` import that resolved to nothing would break the loader", () => {
    for (const [key, url] of Object.entries(ART_SOURCES)) {
      expect(typeof url, key).toBe("string");
      expect(url.length, key).toBeGreaterThan(0);
    }
    expect(ART_TEXTURE_KEYS).toEqual(Object.keys(ART_SOURCES));
  });
});

/* ─────────────────── 2. the mount measurement and its degrade ─────────────── */

describe("publishArtMount — what the loader actually delivered", () => {
  it("mounts every key the texture manager has, and reports no placeholder for them", () => {
    const returned = publishArtMount(texturesWith(ART_TEXTURE_KEYS));
    for (const key of ART_TEXTURE_KEYS) expect(isArtMounted(key), key).toBe(true);
    expect(unmountedResolvedSlots()).toEqual([]);
    // The dev badge may still name the *declared* placeholders — the union is the
    // honest input, and here it reduces to exactly the unresolved declaration.
    expect(returned).toEqual(unresolvedSlots());
    expect(returned.map((slot) => slot.assetId)).toEqual(unresolvedAssetIds());
  });

  it("degrades wholesale: with nothing mounted, every resolved slot falls back", () => {
    const returned = publishArtMount(texturesWith([]));
    // The returned list *is* the active-placeholder set — that identity is what
    // makes the dev badge's input trustworthy rather than a second computation.
    expect(activePlaceholderSlots()).toEqual(returned);
    for (const key of ART_TEXTURE_KEYS) expect(isArtMounted(key), key).toBe(false);
    // Exactly the resolved rows are named as unmounted — one per declared delivery,
    // so the badge cannot under-report a failed file.
    expect(unmountedResolvedSlots()).toEqual(integratedSlots());
    // And the active set is the whole manifest: unresolved ∪ resolved-but-unmounted.
    expect(new Set(returned.map((slot) => slot.placeholder))).toEqual(
      new Set(PLACEHOLDER_SLOTS.map((slot) => slot.placeholder)),
    );
    expect(new Set(returned.map((slot) => slot.assetId))).toEqual(new Set(declaredAssetIds()));
  });

  it("degrades per slot: only the file that failed is reported, and only it is unmounted", () => {
    const failed = integratedSlots()[1];
    expect(failed).toBeDefined();
    if (failed === undefined) return;
    const present = ART_TEXTURE_KEYS.filter((key) => key !== failed.assetName);
    publishArtMount(texturesWith(present));
    expect(isArtMounted(failed.assetName), failed.assetName).toBe(false);
    for (const key of present) expect(isArtMounted(key), key).toBe(true);
    expect(unmountedResolvedSlots()).toEqual([failed]);
  });

  it("starts from the safe default: before any publish, art is not mounted", async () => {
    vi.resetModules();
    const art = await import("@/game/theme/art");
    for (const key of art.ART_TEXTURE_KEYS) {
      expect(art.isArtMounted(key), key).toBe(false);
    }
    // A UI that renders before the loader resolves must claim no delivered art —
    // so the active set is the whole manifest.
    expect(new Set(art.activePlaceholderSlots().map((slot) => slot.placeholder))).toEqual(
      new Set(PLACEHOLDER_SLOTS.map((slot) => slot.placeholder)),
    );
  });
});

/* ────────────────────────────── 3. the queue ──────────────────────────────── */

describe("queueDeliveredArt — one queue per shipped key, never a re-queue", () => {
  it("queues every shipped key with its own URL, in declaration order", () => {
    const { scene, queued } = recordingScene();
    queueDeliveredArt(scene);
    expect(queued.map(([key]) => key)).toEqual([...ART_TEXTURE_KEYS]);
    for (const [key, url] of queued) expect(url, key).toBe(ART_SOURCES[key]);
  });

  it("skips keys the manager already holds — the second level's preload is a no-op", () => {
    const { scene, queued } = recordingScene(ART_TEXTURE_KEYS);
    queueDeliveredArt(scene);
    expect(queued).toEqual([]);
  });

  it("queues only the missing half on a partial manager", () => {
    const missing = ART_TEXTURE_KEYS.filter((key) => key !== ART_TEXTURE_KEYS[0]);
    const { scene, queued } = recordingScene(missing);
    queueDeliveredArt(scene);
    expect(queued.map(([key]) => key)).toEqual([ART_TEXTURE_KEYS[0]]);
  });
});

/* ──────────────────────── 4. the placeholder census is derived ────────────── */

describe("the placeholder census is read off PLACEHOLDER_SLOTS, never typed here", () => {
  it("unresolvedAssetIds is exactly the deduped Asset IDs of the unresolved rows", () => {
    const derived = [
      ...new Set(PLACEHOLDER_SLOTS.filter((slot) => !slot.resolved).map((slot) => slot.assetId)),
    ];
    expect(unresolvedAssetIds()).toEqual(derived);
  });

  it("no unresolved slot's key is shipped, and no unresolved Asset ID has a source", () => {
    const shipped = new Set(ART_TEXTURE_KEYS);
    for (const slot of unresolvedSlots()) {
      expect(shipped.has(slot.assetName), `${slot.assetId} ${slot.placeholder}`).toBe(false);
    }
  });

  it("every Asset ID of the manifest is reachable from the two halves, with no row lost", () => {
    const union = new Set(
      [...integratedSlots(), ...unresolvedSlots()].map((slot) => slot.assetId),
    );
    expect([...union].sort()).toEqual(declaredAssetIds().sort());
  });

  it("placeholder names are unique — a duplicated row would silently shadow a texture key", () => {
    const names = PLACEHOLDER_SLOTS.map((slot) => slot.placeholder);
    expect(new Set(names).size).toBe(names.length);
    const keys = PLACEHOLDER_SLOTS.map((slot) => slot.assetName);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
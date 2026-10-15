/**
 * Tile-object registry + layer-stack evidence.
 *
 * Two claims are gated here:
 *
 * 1. **Registry completeness** — every tile class in `docs/ui-ux.md` §3.1d's
 *    precedence table (`L4_ORDER`, minus the wall, which R-E6/R-E8 gives a
 *    stateful in-place renderer instead of a spec entry) has a painter, the painter
 *    claims exactly the tiles the level data declares, and it actually draws on
 *    them. The gate is exercised on synthetic mutations too, so a missing painter
 *    cannot pass as "the list happens to be non-empty" (§7 evidence rule: a
 *    vacuous gate is worse than none).
 * 2. **Layer arithmetic** — §3.1d's intra-L4 order and §5.2's cross-layer stack as
 *    the boot guards see them, including the regression this whole line of work
 *    exists to prevent: the goal must draw **below** the wall/door blockers.
 *
 * Nothing here imports `board-view.ts`/`level-scene.ts`: those hold runtime Phaser
 * objects, and the point of `renderer/layers.ts` being a pure module is that the
 * boot guard is a *rule a test can call*.
 */

import { describe, expect, it } from "vitest";
import type { Level } from "@/core/level";
import type { Phase } from "@/core/state/phase";
import { initialState } from "@/core/state/transitions";
import type { Vec } from "@/core/state/types";
import { doorTilesOf, portalTilesOf, switchTilesOf } from "@/game/renderer/cell-state";
import {
  assertLayerOrder,
  assertLayerStack,
  L4_DEPTH_BASE,
  l4Depth,
  LAYER_DEPTH,
  LAYER_ORDER,
  LAYER_STACK,
} from "@/game/renderer/layers";
import type { ObservedLayer } from "@/game/renderer/layers";
import { L4_ORDER, L4_SLOT, TILE_OBJECTS } from "@/game/renderer/objects/registry";
import type { TileObjectKind, TileObjectSpec } from "@/game/renderer/objects/registry";
import { theme, toInt } from "@/game/theme/tokens";
import { loadLevels } from "@/game/levels/level-registry";
import { makeLevel, portal } from "../helpers/fixtures";
import { RecordingGraphics } from "../helpers/graphics-recorder";

/** The tile classes §3.1d's table gives an L4 slot — the wall has no spec entry (R-E6). */
const EXPECTED_KINDS: readonly TileObjectKind[] = L4_ORDER.filter(
  (cls): cls is TileObjectKind => cls !== "wall",
);

const key = (tile: Vec): string => `${String(tile.x)},${String(tile.y)}`;

function paintedTiles(level: Level): ReadonlyMap<string, TileObjectKind[]> {
  const out = new Map<string, TileObjectKind[]>();
  for (const spec of TILE_OBJECTS) {
    for (const tile of spec.tilesOf(level)) {
      const k = key(tile);
      out.set(k, [...(out.get(k) ?? []), spec.kind]);
    }
  }
  return out;
}

/** The gate: which §3.1d classes have no painter at all. */
export function missingPainters(specs: readonly TileObjectSpec[]): string[] {
  const present = new Set(specs.map((spec) => spec.kind));
  return EXPECTED_KINDS.filter((kind) => !present.has(kind));
}

/** The gate: which level tiles no painter claims (a silently unpainted object). */
export function unclaimedObjectTiles(
  specs: readonly TileObjectSpec[],
  level: Level,
): string[] {
  const claimed = new Set<string>();
  for (const spec of specs) {
    for (const tile of spec.tilesOf(level)) claimed.add(key(tile));
  }
  const declared = [
    ...level.doors.flatMap((door) => door.tiles),
    ...level.switches.map((sw) => sw.tile),
    ...level.portals.flatMap((p) => p.pair),
    level.goal,
  ];
  return declared
    .map(([x, y]) => `${String(x)},${String(y)}`)
    .filter((tile) => !claimed.has(tile));
}

describe("tile-object registry — §3.1d completeness", () => {
  it("every class in the precedence table has exactly one spec", () => {
    expect(missingPainters(TILE_OBJECTS)).toEqual([]);
    expect(new Set(TILE_OBJECTS.map((spec) => spec.kind)).size).toBe(TILE_OBJECTS.length);
    expect(TILE_OBJECTS).toHaveLength(EXPECTED_KINDS.length);
  });

  it("each spec declares its own §3.1d slot (the depth carrier, R-Z1)", () => {
    for (const spec of TILE_OBJECTS) {
      expect(spec.layer, spec.kind).toBe(L4_SLOT[spec.kind]);
    }
  });

  it("the completeness gate is non-vacuous: dropping any painter turns it red", () => {
    // The negative control the dispatch asks for — one mutation per class.
    for (const kind of EXPECTED_KINDS) {
      const without = TILE_OBJECTS.filter((spec) => spec.kind !== kind);
      expect(missingPainters(without)).toEqual([kind]);
    }
  });

  it("an unpainted portal turns the *tile* gate red as well (not just the class list)", () => {
    const level = makeLevel({
      portals: [portal("p1", [1, 1], [3, 3], "A")],
      doors: [],
    });
    expect(unclaimedObjectTiles(TILE_OBJECTS, level)).toEqual([]);
    const withoutPortals = TILE_OBJECTS.filter((spec) => spec.kind !== "portal");
    expect(unclaimedObjectTiles(withoutPortals, level)).toEqual(["1,1", "3,3"]);
  });

  it("claims exactly the tiles the level data declares on every shipped level", () => {
    const { levels, rejected } = loadLevels();
    expect(rejected).toEqual([]);
    for (const level of levels) {
      expect(unclaimedObjectTiles(TILE_OBJECTS, level), `level ${String(level.id)}`).toEqual([]);
    }
  });

  it("attributes each tile to the right class on l009 (2 doors + 2 switches)", () => {
    const { levels } = loadLevels();
    const level = levels.find((candidate) => candidate.id === 9)!;
    const claimed = paintedTiles(level);
    expect(claimed.get("2,2")).toEqual(["door"]);
    expect(claimed.get("4,1")).toEqual(["door"]);
    expect(claimed.get("0,1")).toEqual(["switch"]);
    expect(claimed.get("3,1")).toEqual(["switch"]);
    expect(claimed.get("4,0")).toEqual(["goal"]);
    // Door tile order is level-data declaration order (R-Z4's tie-break).
    const doorSpec = TILE_OBJECTS.find((spec) => spec.kind === "door")!;
    expect(doorSpec.tilesOf(level)).toEqual(doorTilesOf(level).map((entry) => entry.tile));
    const switchSpec = TILE_OBJECTS.find((spec) => spec.kind === "switch")!;
    expect(switchSpec.tilesOf(level)).toEqual(
      switchTilesOf(level).map((entry) => entry.tile),
    );
  });

  it("is a pure projection of the level: memoised per level, computed once, not per frame", () => {
    // This replaces the V0.7 test that asserted `tilesOf(level, gsA) === tilesOf(level, gsB)`
    // — i.e. that a parameter which was never read had no effect. With the dead `gs` gone
    // from the signature, the property worth pinning is what the memo actually delivers:
    // one frozen array per level (`paintTileObjects` asks once per spec per *frame*),
    // identical by reference on every later call, and not shared between levels.
    const { levels } = loadLevels();
    for (const spec of TILE_OBJECTS) {
      for (const level of levels) {
        const first = spec.tilesOf(level);
        const where = `${spec.kind} on level ${String(level.id)}`;
        expect(spec.tilesOf(level), where).toBe(first);
        expect(Object.isFrozen(first), where).toBe(true);
      }
      // Keyed by the level object: two levels never share one cache entry.
      expect(spec.tilesOf(levels[0]!), spec.kind).not.toBe(spec.tilesOf(levels[1]!));
    }
  });

  it("follows §9.1's placeholder discipline: the goal alone carries an Asset ID", () => {
    // Door (all three states), switch and every occupied treatment are
    // vector-by-design, so a placeholder id on them would claim art the manifest
    // never requested.
    for (const spec of TILE_OBJECTS) {
      if (spec.kind === "goal") expect(spec.placeholder).toBe("goal");
      else expect(spec.placeholder, spec.kind).toBeUndefined();
    }
  });

  it("actually draws on every tile it claims — a spec is not a painter until it paints", () => {
    const { levels } = loadLevels();
    for (const level of levels) {
      const gs = initialState(level);
      for (const spec of TILE_OBJECTS) {
        for (const tile of spec.tilesOf(level)) {
          const g = new RecordingGraphics();
          const tokens = theme(gs.phase);
          spec.paint({
            g,
            rect: { x: 0, y: 0, w: 56, h: 56 },
            radius: 8,
            tile,
            cssScale: 1,
            theme: tokens,
            timeMs: 0,
            level,
            gs,
            transition: { prev: null, objectMix: 1, occupied: 1 },
            knockout: toInt(tokens.ground.cell),
          });
          expect(g.calls.length, `${spec.kind} at ${key(tile)}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("paints statelessly: settling a flip (mix 1, prev set) equals the settled board", () => {
    const { levels } = loadLevels();
    const level = levels.find((candidate) => candidate.id === 7)!;
    const gs = initialState(level);
    const other = { ...gs, phase: "B" as Phase };
    const draw = (prev: typeof gs | null, mix: number, occupied: number): unknown => {
      const spec = TILE_OBJECTS.find((candidate) => candidate.kind === "door")!;
      const g = new RecordingGraphics();
      const tokens = theme(gs.phase);
      spec.paint({
        g,
        rect: { x: 0, y: 0, w: 56, h: 56 },
        radius: 8,
        tile: { x: 1, y: 1 },
        cssScale: 1,
        theme: tokens,
        timeMs: 0,
        level,
        gs,
        transition: { prev, objectMix: mix, occupied },
        knockout: toInt(tokens.ground.cell),
      });
      return g.calls;
    };
    // `mix(from, to, 1) === to` — the property the whole transition contract rests on.
    expect(draw(other, 1, 1)).toEqual(draw(null, 1, 1));
  });
});

/* ──────────────────────────────────────────────────────────────────────────────
 * §5.2 / §3.1d layer arithmetic — the boot guards, as pure rules
 * ────────────────────────────────────────────────────────────────────────────── */

describe("layer stack — §3.1d order and §5.2 depths", () => {
  it("carries §5.2's depths exactly (0 · 5 · 20 · 40 · 50 · 60 · 70)", () => {
    expect(LAYER_DEPTH.pageGround).toBe(0);
    expect(LAYER_DEPTH.backgroundImage).toBe(5);
    expect(LAYER_DEPTH.boardPlate).toBe(20);
    expect(LAYER_DEPTH.cellPlate).toBe(20);
    expect(LAYER_DEPTH.objects).toBe(40);
    expect(LAYER_DEPTH.actor).toBe(50);
    expect(LAYER_DEPTH.cellFeedback).toBe(60);
    expect(LAYER_DEPTH.plateTint).toBe(70);
    expect(L4_DEPTH_BASE).toBe(LAYER_DEPTH.objects);
  });

  it("is strictly ascending as a table, and L2/L3 share one container on purpose", () => {
    expect(LAYER_STACK.map((group) => group.depth)).toEqual([0, 5, 20, 40, 50, 60, 70]);
    expect(LAYER_ORDER).toEqual([
      "pageGround",
      "backgroundImage",
      "boardPlate",
      "cellPlate",
      "objects",
      "actor",
      "cellFeedback",
      "plateTint",
    ]);
    const shared = LAYER_STACK.find((group) => group.depth === 20)!;
    expect([...shared.layers]).toEqual(["boardPlate", "cellPlate"]);
  });

  it("assertLayerStack accepts the depths board-view.ts actually creates", () => {
    const observed: readonly ObservedLayer[] = [
      { name: "pageGround", depth: 0 },
      { name: "boardPlate", depth: 20 },
      { name: "cellPlate", depth: 20 },
      { name: "objects", depth: 40 },
      { name: "actor", depth: 50 },
      { name: "cellFeedback", depth: 60 },
      { name: "plateTint", depth: 70 },
    ];
    expect(() => { assertLayerStack(observed); }).not.toThrow();
    // The reserved background layer is absent until A-04/A-05 land, and that is
    // legal: the guard checks what exists, never what is merely reserved. When the
    // art does land it slots in at depth 5, between the page and the plate.
    expect(() => {
      assertLayerStack([
        observed[0]!,
        { name: "backgroundImage", depth: 5 },
        ...observed.slice(1),
      ]);
    }).not.toThrow();
  });

  it("assertLayerStack fails loudly on a wrong depth, a descending order or a bad table", () => {
    expect(() => {
      assertLayerStack([{ name: "objects", depth: 41 }]);
    }).toThrow(/§5\.2/);
    expect(() => {
      assertLayerStack([
        { name: "actor", depth: 50 },
        { name: "objects", depth: 40 },
      ]);
    }).toThrow(/§5\.2/);
    expect(() => {
      assertLayerStack([
        { name: "objects", depth: 40 },
        { name: "boardPlate", depth: 20 },
      ]);
    }).toThrow(/§5\.2/);
  });

  it("orders L4 exactly as §3.1d: portal < switch < goal < wall < door, all inside the sandwich", () => {
    const depths = L4_ORDER.map((cls) => l4Depth(L4_SLOT[cls]));
    expect(depths).toEqual([41, 42, 43, 44, 45]);
    for (let i = 1; i < depths.length; i += 1) {
      expect(depths[i]!).toBeGreaterThan(depths[i - 1]!);
    }
    // R-C13.1 + §5.2: above the plate, below the actor.
    expect(depths[0]!).toBeGreaterThan(LAYER_DEPTH.boardPlate);
    expect(depths[depths.length - 1]!).toBeLessThan(LAYER_DEPTH.actor);
    // The regression this ordering exists to prevent: the goal draws BELOW the
    // blockers, not at `objects + 1` (the pre-V0.7 shipped placement).
    expect(l4Depth(L4_SLOT.goal)).toBeLessThan(l4Depth(L4_SLOT.wall));
    expect(l4Depth(L4_SLOT.goal)).toBeLessThan(l4Depth(L4_SLOT.door));
  });

  it("assertLayerOrder accepts the real registry slots and rejects an inverted stack", () => {
    const containers = TILE_OBJECTS.map((spec) => ({
      slot: spec.layer,
      depth: l4Depth(spec.layer),
    }));
    containers.push({ slot: L4_SLOT.wall, depth: l4Depth(L4_SLOT.wall) });
    expect(() => { assertLayerOrder(containers, LAYER_DEPTH.actor); }).not.toThrow();

    // A container one slot off its depth is caught…
    expect(() => {
      assertLayerOrder([{ slot: L4_SLOT.door, depth: l4Depth(L4_SLOT.wall) }], 50);
    }).toThrow(/§3\.1d/);
    // …and so is an actor drawn at (or below) the top L4 slot (R-C13.1).
    expect(() => {
      assertLayerOrder([{ slot: L4_SLOT.door, depth: l4Depth(L4_SLOT.door) }], l4Depth(L4_SLOT.door));
    }).toThrow(/R-C13\.1/);
    expect(() => {
      assertLayerOrder([], l4Depth(L4_SLOT.door));
    }).toThrow(/R-C13\.1/);
  });
});

/* ──────────────────────────────────────────────────────────────────────────────
 * Cross-check: the registry's object lists are projections of cell-state.ts,
 * which is itself a projection of core's resolved state.
 * ────────────────────────────────────────────────────────────────────────────── */

describe("registry ↔ cell-state ↔ core", () => {
  it("door / switch / portal tile lists come from the level, in declaration order", () => {
    const level = makeLevel({
      doors: [
        { id: "d1", color: "red", tiles: [[2, 1]] },
        { id: "d2", color: "blue", tiles: [[3, 1], [3, 2]] },
      ],
      switches: [{ id: "s1", tile: [1, 1], activePhase: "A", targets: ["d1"] }],
      portals: [portal("p1", [0, 1], [4, 4], "B")],
    });
    expect(doorTilesOf(level).map((entry) => key(entry.tile))).toEqual(["2,1", "3,1", "3,2"]);
    expect(switchTilesOf(level).map((entry) => key(entry.tile))).toEqual(["1,1"]);
    expect(portalTilesOf(level).map((entry) => key(entry.tile))).toEqual(["0,1", "4,4"]);
    const claimed = paintedTiles(level);
    expect(claimed.get("2,1")).toEqual(["door"]);
    expect(claimed.get("1,1")).toEqual(["switch"]);
    expect(claimed.get("4,4")).toEqual(["portal"]);
    expect(claimed.get("4,0")).toEqual(["goal"]);
  });
});
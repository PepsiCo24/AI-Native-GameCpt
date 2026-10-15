/**
 * L4 layer arithmetic — **the one place a within-L4 z answer is computed**
 * (`docs/ui-ux.md` §3.1d, R-Z1; `docs/ui-ux.md` §5.2 for the cross-layer stack).
 *
 * Pure TypeScript on purpose: no Phaser, no canvas, no state. It only turns the
 * registry's §3.1d slot table into depths and checks that the result is the
 * spec's one total order. `board-view.ts` is the only production caller; the
 * module exists so the boot guard is a *rule* a test can call, not a comparison
 * buried in a 700-line renderer.
 *
 * **Why this is not a cosmetic z-constant.** §3.1d fixes one total order per cell,
 * bottom → top: `portal < switch < goal < wall < door` — **blockers above the
 * goal**. Before this module, `board-view.ts` carried `goalGfx = DEPTH.objects + 1`
 * by hand, i.e. the goal one step *above* the walls: harmless while goal ∩ wall is
 * impossible on legal data (ADR-0008 rule 7, validator hard error) but the inverse
 * of §3.1d slots 2–4, and it would mis-stack the first door ∩ goal cell (a door
 * painted into the wall container would land **under** the goal). Deriving the
 * depth from the slot table means the picture order cannot drift from the spec
 * without the boot guard firing.
 *
 * Two claims are asserted, and only two (this is the exact scope of the V0.6
 * warning about the old assertion):
 * 1. **§3.1d** — the intra-L4 order. Checked over the whole table, never as a
 *    hardcoded pair, so an inverted goal-above-wall placement cannot be cemented
 *    here again.
 * 2. **R-C13.1** — the actor draws above **every** L4 layer, including slots that
 *    have no painter yet. R-C13.1 says nothing about goal-vs-wall; that pair is
 *    §3.1d's business.
 *
 * **V0.7 addition — the cross-layer stack (§5.2) as data.** {@link LAYER_STACK} is
 * §5.2's `L0…L7` table (name + depth + which layers share one container), and
 * {@link assertLayerStack} checks a *real* depth list against it at boot. This is
 * what pins `L4_DEPTH_BASE` between the plate and the actor as a rule instead of a
 * comment: §5.2's own numbers (0 / 5 / 20 / 40 / 50 / 60 / 70) only have to be
 * wrong **once** — for a class, not a level — for a door to land under the goal or
 * a wall over the player, and no screenshot review reliably catches a 1-slot error
 * on the only tile where two graphics overlap (§3.1d's whole reason for existing).
 */

import { L4_ORDER, L4_SLOT } from "@/game/renderer/objects/registry";
import type { L4Slot } from "@/game/renderer/objects/registry";

/** L4's bottom depth in the §5.2 stack (plate `20` < L4 < actor `50`). */
export const L4_DEPTH_BASE = 40;

/** The container depth of one §3.1d slot. The slot rank **is** the offset. */
export function l4Depth(slot: L4Slot): number {
  return L4_DEPTH_BASE + slot;
}

/* ────────────────────────────────────────────────────────────────────────────
 * §5.2's cross-layer stack — L0…L7, bottom → top, as data.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * The fixed §5.2 layer names. `L8 DOM overlay` is deliberately absent: the HUD is
 * DOM (`src/game/hud/**`) and has no canvas depth at all, which is the §7.1 split.
 */
export type CanvasLayerName =
  | "pageGround"
  | "backgroundImage"
  | "boardPlate"
  | "cellPlate"
  | "objects"
  | "actor"
  | "cellFeedback"
  | "plateTint";

/** One §5.2 depth and the layers drawn at it (`cells` share the plate's container). */
export interface LayerGroup {
  readonly depth: number;
  readonly layers: readonly CanvasLayerName[];
}

/**
 * §5.2 verbatim, with the one documented grouping the shipped renderer uses:
 * `L2 boardPlate` and `L3 cellPlate + grid` are painted by **one** Graphics object
 * (`board-view.paintGround` fills the plate rect first, then the grid surface, then
 * the cell plates), so they share depth `20` and their order is paint order inside
 * that container. Every other layer owns a distinct container, and the depths are
 * strictly ascending — asserted below, at boot, on the real objects.
 */
export const LAYER_STACK = [
  { depth: 0, layers: ["pageGround"] },
  { depth: 5, layers: ["backgroundImage"] },
  { depth: 20, layers: ["boardPlate", "cellPlate"] },
  { depth: L4_DEPTH_BASE, layers: ["objects"] },
  { depth: 50, layers: ["actor"] },
  { depth: 60, layers: ["cellFeedback"] },
  { depth: 70, layers: ["plateTint"] },
] as const satisfies readonly LayerGroup[];

/** §5.2's layer names in stack order, derived from {@link LAYER_STACK} (one table). */
export const LAYER_ORDER: readonly CanvasLayerName[] = LAYER_STACK.flatMap(
  (group) => group.layers,
);

/** The depth of every §5.2 layer, derived from {@link LAYER_STACK} (never re-typed). */
export const LAYER_DEPTH: Readonly<Record<CanvasLayerName, number>> = Object.freeze(
  Object.fromEntries(
    LAYER_STACK.flatMap((group) => group.layers.map((name) => [name, group.depth] as const)),
  ),
) as Readonly<Record<CanvasLayerName, number>>;

/** A depth the renderer actually used, as the §5.2 guard sees it. */
export interface ObservedLayer {
  readonly name: CanvasLayerName;
  readonly depth: number;
}

/**
 * §5.2 rows whose depth is a **group base**, not a single created object.
 *
 * `objects` is the L4 group: its containers are created at `L4_DEPTH_BASE + slot`
 * (§3.1d, `assertLayerOrder`'s job), so *no object ever sits at exactly 40*. Reporting
 * the constant `40` for this row — which is what V0.7 did — made check 2 of
 * {@link assertLayerStack} unconditionally true for it, i.e. the `objects` row could
 * not fail. The row now reports the real bottom container depth and is checked as a
 * **range** instead: `(base, next layer's base)` — passing the base itself, or any
 * depth at/below it, is refused.
 */
export const LAYER_GROUP_BASE: ReadonlySet<CanvasLayerName> = new Set<CanvasLayerName>([
  "objects",
]);

/**
 * §5.2 boot guard. Called by `board-view.ts` with the depths it just created, so a
 * mis-numbered container fails loudly at boot instead of shipping a picture that
 * contradicts the spec's one fixed stack.
 *
 * Checks, in order:
 * 1. {@link LAYER_STACK} is strictly ascending (the table itself is consistent, so
 *    a data edit cannot quietly collapse two layers onto one depth);
 * 2. every observed layer's depth **equals** the table's value for that name — except
 *    the {@link LAYER_GROUP_BASE} rows, whose real object sits at `base + slot` inside
 *    the group and which are therefore checked as the open range
 *    `(base, next layer's base)`. Passing the base itself is refused: it is a group
 *    marker, not an object, and allowing it is what made this row unfalsifiable;
 * 3. the observed layers appear in §5.2 order and never go *down* (equal depths are
 *    legal only for the `boardPlate`/`cellPlate` pair, which shares a container);
 * 4. `objects` sits strictly above `boardPlate` and strictly below `actor` — the
 *    one relation R-C13.1 and §3.1d both depend on.
 *
 * @throws Error naming the layer and the two numbers when any check fails.
 */
export function assertLayerStack(observed: readonly ObservedLayer[]): void {
  let previousDepth = -Infinity;
  for (const group of LAYER_STACK) {
    if (!(group.depth > previousDepth)) {
      throw new Error(
        `docs/ui-ux.md §5.2: the layer stack must ascend bottom → top; ` +
          `${group.layers.join("/")} sits at ${String(group.depth)}, which is not above ${String(previousDepth)}`,
      );
    }
    previousDepth = group.depth;
  }

  if (!(LAYER_DEPTH.boardPlate < LAYER_DEPTH.objects && LAYER_DEPTH.objects < LAYER_DEPTH.actor)) {
    throw new Error(
      "docs/ui-ux.md §5.2/R-C13.1: L4 objects must draw above the board plate and below the actor " +
        `(plate ${String(LAYER_DEPTH.boardPlate)}, objects ${String(LAYER_DEPTH.objects)}, actor ${String(LAYER_DEPTH.actor)})`,
    );
  }

  let lastOrder = -1;
  let lastObservedDepth = -Infinity;
  for (const layer of observed) {
    const expected = LAYER_DEPTH[layer.name];
    if (LAYER_GROUP_BASE.has(layer.name)) {
      // The real object for a group-base row sits one or more slots **above** the base
      // and must stay strictly below the next named layer. Strict at both ends on
      // purpose: the base itself is not an object, so passing `LAYER_DEPTH.objects`
      // (the constant V0.7 passed, making this row unfalsifiable) now throws.
      const nextName = LAYER_ORDER[LAYER_ORDER.indexOf(layer.name) + 1];
      const ceiling = nextName === undefined ? Number.POSITIVE_INFINITY : LAYER_DEPTH[nextName];
      if (!(layer.depth > expected && layer.depth < ceiling)) {
        throw new Error(
          `docs/ui-ux.md §5.2: layer "${layer.name}" is a group base at ${String(expected)} — ` +
            `its real objects sit strictly above the base and below the next layer, so an ` +
            `observed depth for it must lie in (${String(expected)}, ${String(ceiling)}), ` +
            `found ${String(layer.depth)}`,
        );
      }
    } else if (layer.depth !== expected) {
      throw new Error(
        `docs/ui-ux.md §5.2: layer "${layer.name}" must draw at depth ${String(expected)}, ` +
          `found ${String(layer.depth)}`,
      );
    }
    const order = LAYER_ORDER.indexOf(layer.name);
    if (order < lastOrder) {
      throw new Error(
        `docs/ui-ux.md §5.2: layers were created out of stack order — "${layer.name}" came after ` +
          `a layer that belongs above it (${LAYER_ORDER.join(" < ")})`,
      );
    }
    if (layer.depth < lastObservedDepth) {
      throw new Error(
        `docs/ui-ux.md §5.2: observed depth went down at layer "${layer.name}" ` +
          `(${String(layer.depth)} after ${String(lastObservedDepth)})`,
      );
    }
    lastOrder = order;
    lastObservedDepth = layer.depth;
  }
}

/** An L4 container as the guard sees it: which §3.1d slot, drawn at which depth. */
export interface L4Depth {
  readonly slot: number;
  readonly depth: number;
}

/**
 * §3.1d + R-C13.1 boot guard.
 *
 * @param containers every L4 container that exists, with its slot and the depth
 *   it was actually given.
 * @param actor the actor layer's depth.
 * @throws Error when the picture order would contradict §3.1d or R-C13.1.
 */
export function assertLayerOrder(containers: readonly L4Depth[], actor: number): void {
  const slots = L4_ORDER.map((cls) => L4_SLOT[cls]);
  const ascending = slots.every(
    (slot, index) => index === 0 || slot > (slots[index - 1] ?? slot),
  );
  if (!ascending) {
    throw new Error(
      `docs/ui-ux.md §3.1d: L4 must stack bottom → top as ${L4_ORDER.join(" < ")} — ` +
        `L4_SLOT is not ascending in that order (${slots.join(", ")})`,
    );
  }

  for (const slot of slots) {
    if (!(actor > L4_DEPTH_BASE + slot)) {
      throw new Error(
        "docs/ui-ux.md R-C13.1: the actor (L5) must draw above every L4 layer — " +
          "no wall or door treatment may draw over any part of the player",
      );
    }
  }

  // §5.2 — the other half of the sandwich: L4 must stay above the L2/L3 plate, or
  // the order holds while the stack is still in the wrong place.
  if (!(L4_DEPTH_BASE > LAYER_DEPTH.boardPlate)) {
    throw new Error(
      `docs/ui-ux.md §5.2: L4 must draw above the board plate/cell layers — ` +
        `L4 base ${String(L4_DEPTH_BASE)} is not above ${String(LAYER_DEPTH.boardPlate)}`,
    );
  }

  for (const container of containers) {
    if (container.depth !== L4_DEPTH_BASE + container.slot) {
      throw new Error(
        `docs/ui-ux.md §3.1d: an L4 container must draw at its slot depth ` +
          `(${String(L4_DEPTH_BASE + container.slot)} for slot ${String(container.slot)}), ` +
          `found ${String(container.depth)}`,
      );
    }
  }
}
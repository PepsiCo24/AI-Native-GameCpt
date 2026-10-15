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
 */

import { L4_ORDER, L4_SLOT } from "@/game/renderer/objects/registry";
import type { L4Slot } from "@/game/renderer/objects/registry";

/** L4's bottom depth in the §5.2 stack (plate `20` < L4 < actor `50`). */
export const L4_DEPTH_BASE = 40;

/** The container depth of one §3.1d slot. The slot rank **is** the offset. */
export function l4Depth(slot: L4Slot): number {
  return L4_DEPTH_BASE + slot;
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
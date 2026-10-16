/**
 * **Latch-pair audit** — the measurement behind `tests/e2e/latch-door.spec.ts`'s
 * "discriminating pair" row (LV-009-B handoff, QA).
 *
 * The spec's second test per door level asserts a *pair* of reachable states: the
 * state one move before a closed-door **occupancy** and the state a closed-door
 * entry is **refused** in must be the same tile in the same phase, arriving in the
 * same direction, differing only in the latch (`latch-door.spec.ts:102`). It gets
 * those two states from `cheapestDoorFixtures()` — the cheapest of each kind,
 * picked independently — so a board where the two cheapest fixtures do *not*
 * co-locate turns the row RED even though the pair exists.
 *
 * This script answers the only question that matters for triage: **does the board
 * ship the pair, or not?** Two independent arms:
 *
 * 1. **fixture bookkeeping** — `doorFixtures()` from the spec's own helper: every
 *    (occupancy, refusal) pair that co-locates;
 * 2. **the rules alone** — over the reachable set, every `(tile, phase, direction)`
 *    where two states at the same tile in the same phase read opposite verdicts
 *    from `isLegalMove` because a door's latch differs.
 *
 * A board with pairs on either arm is a *selection* problem (QA's helper); a board
 * with none on both arms has no such pair at all (a design/data question, and the
 * spec's universal claim over door levels would be falsified by the data).
 *
 * ```bash
 * node_modules/.bin/tsx scripts/latch-pair-audit.ts
 * ```
 *
 * Reads the shipped `src/levels/*.json` through the e2e helper's own loader, so it
 * audits the *dataset*, not the playable registry.
 */
import process from "node:process";

import { isLegalMove } from "@/core/rules";
import { doorAt } from "@/core/rules/solid";
import { explore } from "@/core/solver/bfs";
import type { Direction } from "@/core/state/move";
import { DIRECTIONS, move, step } from "@/core/state/move";
import type { SearchState, Vec } from "@/core/state/types";
import { sameVec } from "@/core/state/types";
import {
  cheapestDoorFixtures,
  doorFixtures,
  doorLevelIds,
  loadReferenceLevels,
  resolveRoute,
} from "../tests/e2e/helpers/levels";

const REFS = loadReferenceLevels();
const DOOR_IDS = doorLevelIds(REFS);

function fmt(v: Vec): string {
  return `(${String(v.x)},${String(v.y)})`;
}

/** Every co-located (occupancy, refusal) pair the spec's fixture search produced. */
interface Pair {
  readonly occupancyDepth: number;
  readonly refusalDepth: number;
  readonly tile: Vec;
  readonly phase: string;
  readonly direction: Direction;
  readonly doorId: string;
}

const RED: string[] = [];

for (const id of DOOR_IDS) {
  const ref = REFS.find((r) => r.id === id);
  if (ref === undefined) continue;
  const { level } = ref;

  const all = doorFixtures(ref);
  const { occupancy, refusedEntry } = cheapestDoorFixtures(ref);

  // ── what the spec actually drives: the two cheapest fixtures, independently
  const latched =
    occupancy === null
      ? null
      : resolveRoute(level, occupancy.route.slice(0, -1));
  const unlatched =
    refusedEntry === null ? null : resolveRoute(level, refusedEntry.route);
  const arrival: Direction | null =
    occupancy === null
      ? null
      : (occupancy.route[occupancy.route.length - 1] ?? null);
  const cheapestCoLocates =
    latched !== null &&
    unlatched !== null &&
    sameVec(latched.player, unlatched.player) &&
    latched.phase === unlatched.phase &&
    arrival !== null &&
    arrival === (refusedEntry?.direction ?? null);

  // ── arm 1: fixture bookkeeping
  const pairs: Pair[] = [];
  for (const o of all) {
    if (o.kind !== "closed-door-occupancy") continue;
    const oDir = o.route[o.route.length - 1] ?? null;
    if (oDir === null) continue;
    const before = resolveRoute(level, o.route.slice(0, -1));
    for (const r of all) {
      if (r.kind !== "closed-door-entry-refused") continue;
      if (r.direction === null || r.direction !== oDir) continue;
      const u = resolveRoute(level, r.route);
      if (!sameVec(before.player, u.player) || before.phase !== u.phase)
        continue;
      if (before.doorsOpen[r.doorId] === u.doorsOpen[r.doorId]) continue;
      pairs.push({
        occupancyDepth: o.depth,
        refusalDepth: r.depth,
        tile: before.player,
        phase: before.phase,
        direction: oDir,
        doorId: r.doorId,
      });
    }
  }

  // ── arm 2: the rules alone, over the reachable set
  const nodes: readonly SearchState[] = explore(level).nodes;
  const byTilePhase = new Map<string, SearchState[]>();
  for (const s of nodes) {
    const key = `${String(s.player.x)},${String(s.player.y)},${s.phase}`;
    const bucket = byTilePhase.get(key);
    if (bucket === undefined) byTilePhase.set(key, [s]);
    else bucket.push(s);
  }
  const rulePairs: string[] = [];
  for (const bucket of byTilePhase.values()) {
    if (bucket.length < 2) continue;
    for (const a of bucket) {
      for (const b of bucket) {
        if (a === b) continue;
        for (const direction of DIRECTIONS) {
          const door = doorAt(level, step(a.player, direction));
          if (door === undefined) continue;
          if (
            (a.doorsOpen[door.id] === true) ===
            (b.doorsOpen[door.id] === true)
          )
            continue;
          const aLegal = isLegalMove(level, a, move(direction));
          const bLegal = isLegalMove(level, b, move(direction));
          if (aLegal === bLegal) continue;
          rulePairs.push(
            `${fmt(a.player)}${a.phase} ${direction} door ${door.id}: ` +
              `open ⇒ ${String(aLegal)}, closed ⇒ ${String(bLegal)}`,
          );
        }
      }
    }
  }

  const cheapest =
    pairs.length === 0
      ? null
      : pairs.reduce((m, p) => (p.occupancyDepth < m.occupancyDepth ? p : m));

  console.log(
    [
      `L${String(id)}`,
      `  cheapest occupancy: depth ${String(occupancy?.depth ?? -1)} · pre-arrival ${latched === null ? "—" : `${fmt(latched.player)}${latched.phase}`} · arriving ${String(arrival ?? "—")}`,
      `  cheapest refusal:   depth ${String(refusedEntry?.depth ?? -1)} · at ${unlatched === null ? "—" : `${fmt(unlatched.player)}${unlatched.phase}`} · refused ${String(refusedEntry?.direction ?? "—")}`,
      `  the spec's welded equality on the CHEAPEST pair: ${cheapestCoLocates ? "HOLDS" : "FAILS"}`,
      `  arm 1 · co-located pairs (fixture bookkeeping): ${String(pairs.length)}${cheapest === null ? "" : ` · cheapest occupancy depth ${String(cheapest.occupancyDepth)} at ${fmt(cheapest.tile)}${cheapest.phase} ${cheapest.direction} door ${cheapest.doorId}`}`,
      `  arm 2 · co-located pairs (rules alone, ${String(nodes.length)} reachable states): ${String(rulePairs.length)}${rulePairs.length === 0 ? "" : ` · e.g. ${rulePairs.slice(0, 2).join(" | ")}`}`,
    ].join("\n"),
  );

  if (!cheapestCoLocates) {
    RED.push(
      `L${String(id)}: RED, and the pair exists — arm 1 ${String(pairs.length)}, arm 2 ${String(rulePairs.length)}`,
    );
  }
}

console.log(
  RED.length === 0
    ? "\nEvery door level's cheapest pair co-locates: the spec's welded equality holds on the whole dataset."
    : `\n${RED.join("\n")}\n(⇒ fixture SELECTION, not a board gap: pick the refusal fixture that pairs with the cheapest occupancy.)`,
);

process.exit(0);

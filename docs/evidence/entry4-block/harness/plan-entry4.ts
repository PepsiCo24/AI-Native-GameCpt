/**
 * UA-0011 — Entry-4 capture PLAN (L12–L15 block, ADR-design-0003 §8 item 6).
 *
 * RUN-ONLY tooling: lives in the approved temp scratch, edits nothing in the repo.
 * Routes are ENUMERATED FROM THE SOLVER via the standing e2e helper
 * (tests/e2e/helpers/levels.ts — loadReferenceLevels: validateLevel + solve +
 * forEachParRoute + applyMove legs). No move is hand-guessed anywhere: this script
 * emits the shot plan the capture driver consumes.
 *
 * Run: cd <worktree> && npx tsx --tsconfig tsconfig.json <this file> > plan-entry4.json
 */
import { execSync } from "node:child_process";

import { loadReferenceLevels, refOf } from "/Users/Admin/.local/share/opencode/worktree/f9a5d9/ua-0011-capture/tests/e2e/helpers/levels";
import { step } from "@/core/state/move";
import type { Vec } from "@/core/state/types";

const WT = "/Users/Admin/.local/share/opencode/worktree/f9a5d9/ua-0011-capture";
const IDS = [12, 13, 14, 15] as const;

const refs = loadReferenceLevels(`${WT}/src/levels/`);
const tree = execSync("git rev-parse HEAD", { cwd: WT }).toString().trim();

type ShotKind = "initial" | "seam" | "crossing" | "latch" | "postlatch" | "win";
interface Shot {
  name: string;
  atLeg: number; // 0 = before any move
  kind: ShotKind;
  pairDiff: boolean; // probe near-vs-far end deep-ink identity on this shot
  entryResidual: boolean; // diff the entered end against its initial-frame mask
}

const pad = (id: number): string => `l${String(id).padStart(3, "0")}`;

const out = {
  generatedFrom: "solver via tests/e2e/helpers/levels.ts (loadReferenceLevels)",
  tree,
  levels: IDS.map((id) => {
    const ref = refOf(refs, id);
    const level = ref.level;
    const legs = ref.legs.map((leg, i) => {
      const prevPlayer: Vec = i === 0 ? { x: level.player[0], y: level.player[1] } : ref.legs[i - 1]!.player;
      const expected = step(prevPlayer, leg.direction);
      const teleport = expected.x !== leg.player.x || expected.y !== leg.player.y;
      const prevPhase = i === 0 ? level.startPhase : ref.legs[i - 1]!.phase;
      return {
        n: leg.moveCount,
        dir: leg.direction,
        key: leg.key,
        player: [leg.player.x, leg.player.y] as [number, number],
        phase: leg.phase,
        prevPhase,
        teleport,
        onSwitchTile: level.switches.some((sw) => sw.tile[0] === leg.player.x && sw.tile[1] === leg.player.y),
        switchPressed: level.switches.some(
          (sw) => sw.tile[0] === leg.player.x && sw.tile[1] === leg.player.y && sw.activePhase === prevPhase,
        ),
        onDoorTile: level.doors.some((d) => d.tiles.some((t) => t[0] === leg.player.x && t[1] === leg.player.y)),
        doorsOpen: leg.state.doorsOpen,
      };
    });

    // teleport leg facts (entry end = the tile the press clicked; exit end = arrival)
    const tIdx = legs.findIndex((l) => l.teleport);
    if (tIdx < 0) throw new Error(`L${String(id)}: no teleport leg on the par route — plan invalid`);
    const tLeg = legs[tIdx]!;
    const prevOfTeleport: Vec =
      tIdx === 0
        ? { x: level.player[0]!, y: level.player[1]! }
        : { x: legs[tIdx - 1]!.player[0]!, y: legs[tIdx - 1]!.player[1]! };
    const clicked = step(prevOfTeleport, tLeg.dir);
    const entryEnd: [number, number] = [clicked.x, clicked.y];
    const portal = level.portals[0]!;
    const entryIsFirst = portal.pair[0]![0] === clicked.x && portal.pair[0]![1] === clicked.y;
    const nearEnd: [number, number] = entryIsFirst ? [...portal.pair[0]!] : [...portal.pair[1]!];
    const farEnd: [number, number] = entryIsFirst ? [...portal.pair[1]!] : [...portal.pair[0]!];

    // latch leg = the switch-press leg (ADR trace `*`); door leg = `+`
    const latchIdx = legs.findIndex((l) => l.switchPressed);
    if (latchIdx < 0) throw new Error(`L${String(id)}: no switch-press leg (G2) — plan invalid`);
    const doorLegIdx = legs.findIndex((l) => l.onDoorTile);

    // sealed channel column: every tile of column x is a wall in one of the two phases
    let channel: null | {
      column: number;
      perPhase: Record<string, { solid: [number, number][]; ghost: [number, number][] }>;
    } = null;
    for (let x = 0; x < level.width; x += 1) {
      const all: [number, number][] = [];
      for (let y = 0; y < level.height; y += 1) all.push([x, y]);
      const walled = all.every((t) =>
        [...level.phaseAWalls, ...level.phaseBWalls].some((w) => w[0] === t[0] && w[1] === t[1]),
      );
      if (!walled) continue;
      const side = (walls: readonly (readonly [number, number])[]) => ({
        solid: all.filter((t) => walls.some((w) => w[0] === t[0] && w[1] === t[1])),
        ghost: all.filter((t) => !walls.some((w) => w[0] === t[0] && w[1] === t[1])),
      });
      channel = { column: x, perPhase: { A: side(level.phaseAWalls), B: side(level.phaseBWalls) } };
    }

    const seamLeg = tIdx === 0 ? latchIdx + 1 : tIdx; // settled state BEFORE the teleport press (L12: the latch frame doubles as seam)
    const shots: Shot[] = [];
    const push = (atLeg: number, kind: ShotKind, extra: Partial<Shot> = {}): void => {
      if (shots.some((s) => s.atLeg === atLeg && s.kind !== "initial")) {
        // merge flags onto the existing shot (L12 seam == latch)
        const existing = shots.find((s) => s.atLeg === atLeg)!;
        Object.assign(existing, extra, { kind: existing.kind === "crossing" ? existing.kind : kind });
        if (kind === "seam") existing.name = `${pad(id)}_m${String(atLeg)}_seam_latch`;
        return;
      }
      shots.push({
        name: kind === "initial" ? `${pad(id)}_initial` : kind === "win" ? `${pad(id)}_win` : `${pad(id)}_m${String(atLeg)}_${kind}`,
        atLeg,
        kind,
        pairDiff: false,
        entryResidual: false,
        ...extra,
      });
    };
    push(0, "initial", { pairDiff: true });
    push(seamLeg, "seam", { pairDiff: true });
    if (latchIdx + 1 !== seamLeg) push(latchIdx + 1, "latch");
    // post-latch: the frame AFTER the press leg — the latch dot is visible after
    // departure (the player body occludes the switch box while standing, QA-005 P2),
    // and the door shows its post-press state (open-at-A on L15 / embedded-at-B on L12–L14).
    if (latchIdx + 2 <= legs.length - 1) push(latchIdx + 2, "postlatch");
    push(tIdx + 1, "crossing", { entryResidual: true });
    push(legs.length, "win");
    shots.sort((a, b) => a.atLeg - b.atLeg);

    const mobileShots: Shot[] = [
      { name: `mobile_390_${pad(id)}_initial`, atLeg: 0, kind: "initial", pairDiff: true, entryResidual: false },
      { name: `mobile_390_${pad(id)}_m${String(tIdx + 1)}_crossing`, atLeg: tIdx + 1, kind: "crossing", pairDiff: false, entryResidual: true },
    ];
    if (id === 15) {
      // the block's only activePhase-B channel: the B-phase seam frame at the mobile class
      mobileShots.splice(1, 0, {
        name: `mobile_390_${pad(id)}_m${String(seamLeg)}_seam`,
        atLeg: seamLeg,
        kind: "seam",
        pairDiff: true,
        entryResidual: false,
      });
    }

    return {
      id,
      width: level.width,
      height: level.height,
      par: ref.par,
      startPhase: level.startPhase,
      route: legs.map((l) => ({ up: "U", down: "D", left: "L", right: "R" })[l.dir]).join(""),
      legs,
      facts: {
        teleportLeg: tIdx + 1,
        latchLeg: latchIdx + 1,
        doorLeg: doorLegIdx + 1,
        seamLeg,
        entryEnd,
        exitEnd: [tLeg.player[0], tLeg.player[1]] as [number, number],
      },
      portal: { pair: portal.pair, activePhase: portal.activePhase, nearEnd, farEnd },
      door: level.doors[0]!,
      switch: level.switches[0]!,
      goal: level.goal,
      channel,
      probeTiles: {
        portalNear: nearEnd,
        portalFar: farEnd,
        door: level.doors[0]!.tiles[0]!,
        switch: level.switches[0]!.tile,
        goal: level.goal,
        channel: channel ? [...channel.perPhase.A!.solid, ...channel.perPhase.A!.ghost] : [],
      },
      shots: { desktop: shots, mobile: mobileShots },
    };
  }),
};

console.log(JSON.stringify(out, null, 2));

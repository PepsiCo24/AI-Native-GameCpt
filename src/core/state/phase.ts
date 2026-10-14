/**
 * Phase — the two-phase world model.
 *
 * Truth sources: AGENTS.md §2, `docs/game-design.md` §3 / §3.1,
 * ADR-0002 (flip is bound to movement), ADR-0008 (Option B, GATE C).
 *
 * Pure TypeScript: `src/core/**` must never import Phaser (AGENTS.md §3).
 */

/** A = Light / 白昼, B = Shadow / 夜晚. */
export type Phase = "A" | "B";

/** Canonical phase order — fixed, so hashing and validation stay deterministic. */
export const PHASES = ["A", "B"] as const satisfies readonly Phase[];

export function isPhase(value: unknown): value is Phase {
  return value === "A" || value === "B";
}

/**
 * The phase after one more legal move.
 *
 * The phase is a *deterministic function of the move count*: it is `startPhase`
 * flipped `moveCount` times (ADR-0008 clause 8, `docs/level-design.md` §0).
 * Every legal move flips exactly once and an illegal move never flips
 * (ADR-0002, ADR-0008 clause 1–2) — so the flip is applied only after a legal
 * move has been validated (see `applyMove` step 4).
 */
export function flipPhase(phase: Phase): Phase {
  return phase === "A" ? "B" : "A";
}
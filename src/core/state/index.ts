/**
 * Public surface of the pure state model (`src/core/state/**`).
 *
 * Pure TypeScript — never import Phaser from here (AGENTS.md §3).
 * The level schema (`src/core/level/**`) is owned by Level AI + Solver; this
 * module only *consumes* its types.
 */

export * from "./phase";
export * from "./move";
export * from "./types";
export * from "./hash";
export * from "./transitions";
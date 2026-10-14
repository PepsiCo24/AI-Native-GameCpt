/**
 * Public surface of the pure rules engine (`src/core/rules/**`).
 *
 * `applyMove` here is the **only** movement implementation in the project —
 * Gameplay and the Solver both call it (AGENTS.md §3,
 * ADR-architecture-0001 decision 1).
 *
 * Pure TypeScript — never import Phaser from here (AGENTS.md §3).
 */

export * from "./solid";
export * from "./applyMove";
# ADR-0001 — Adopt "Phase Shift" as the core mechanic

- **Status:** Accepted
- **Date:** 2026-10-14
- **Deciders:** Product Lead + Game Designer (Agent 1), Orchestrator (Agent 0)

## Context

The competition (Oakever / 乐信圣文 "AI Native 休闲游戏创作大赛") requires a browser H5 puzzle with ≥50 levels, progressive difficulty, near-zero-text entry, and a genuine AI-driven iteration process. 2026's puzzle market is crowded: Arrow Escape, Sort, Screw, Block, Pixel Flow and Gravity variants each have multiple top-download products and rapid clone waves.

## Decision

Build **Phase Shift / 双相棋盘**: a 2D grid puzzle where the world flips between Phase A (Light) and Phase B (Shadow) with every legal move, and each phase has a different map.

## Consequences

- (+) Familiar grid + single tap/swipe entry; unfamiliar consequence model ⇒ differentiation without a learning wall.
- (+) One rule expression generates many mechanics (phase walls, doors, portals, switches) ⇒ cheap 50-level scalability.
- (+) Small, serializable state ⇒ BFS/A* solvability + difficulty automation (AI-native pipeline).
- (−) Requires disciplined readability across two visual worlds.
- (−) Level design must avoid degenerate "memory test" levels.

## Rejected alternatives

- **Gravity Relay / Gravity Stack** — lands in a dense Gravity sub-genre (Gravity Grid, Gravity Block Fall, Block Drift, etc.).
- **Chain Escape** — strong but reads as "another Arrow puzzle". Kept as reserve competitor concept.
- **Re-skin of a hot category** — high clone risk, low memorability.
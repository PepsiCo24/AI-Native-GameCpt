# ADR-0008 — Phase solidity blocks entry only; standing inside a wall is legal (Option B, GATE C)

- **Status:** Accepted — **human-approved core-rule change at GATE C**; locked in `docs/game-design.md` V0.4 §3.1; **Stage 2 playtest verification is a mandatory gate** before full level-set production

> [!IMPORTANT]
> **Correction banner (2026-10-14, GATE D / ADR-0009 — human decision).** The **checkerboard invariant** — a 4-connected grid is bipartite, every legal move flips the phase, and a refusal consumes no move, so the phase in which a tile can be *entered* is fixed by the tile alone (a detour adds 2 moves, never 1) — **proves clause 8 of this ADR false**, three times independently (GAME-001 analytic + 200-board sweep; LV-001R 4,000-level scan; Orchestrator BFS over the shipped `applyMove`). Withdrawn as measured-false:
> - **Decision, clause 8:** "Phase genuinely rewires feasible routes from L1 onward … M0 is no longer a static maze" — **false for M0-only content, and for M1 doors without switches.** M0 walls are permanent obstacles (parity-mismatched) or permanent decoration (parity-matched); "refused first, entered later" is unconstructible. **OQ-1 was NOT resolved by Option B.**
> - **Consequences, first (+) bullet:** "OQ-1 resolved mechanically … the first Aha is produced by M0 itself" — withdrawn with clause 8.
> - **Alternatives, Option A rationale:** the premise that Option B delivers the route dynamism Option A lacks is withdrawn; under the invariant, A and B never differed on M0 routing.
>
> **What stands — rules 1–7, unchanged:** entry-only legality in the current phase; flip bound to every legal move; standing inside a wall is legal (never crushed / pushed / moved); exit by the same entry rule; doors share wall semantics; portals trigger on entry once; phase-independent win with a dual-phase-safe goal. Option B's *delivered* value is the **embedded / phantom-walk beat** and the single rule path — not route dynamism.
> **Resolution:** GATE D chose **D3 — mechanics forward, core rule unchanged** (ADR-0009): M3 promoted to CORE, M1+M3 taught as one unit from L6, M2 portals from L11 under the opposite-colour law; Aha #1 re-defined as the latch beat. The Stage-2 hypotheses (a) and (c) in Consequences below are superseded by ADR-0009 Decision 8; hypothesis (b) stands. Current truth source: `docs/decisions/0009-checkerboard-invariant-mechanics-forward.md` + `docs/game-design.md` V0.5 + `docs/level-design.md` V0.4.

- **Date:** 2026-10-14
- **Deciders:** **Human (final authority, GATE C)**; proposal and consequence analysis prepared by Game Designer (Agent 1); Orchestrator sign-off at merge; Playtest Analyst confirmation pending Stage 2
- **Supersedes:** ADR-0006 (partially — the post-flip standing-check legality condition, and with it the union-property consequence)
- **Revises:** ADR-0007 (wall-echo semantics; the rendering contract itself is unchanged)

## Context

ADR-0006 locked a two-condition legality rule: a move is legal only if (1) the destination is not solid in the current phase **and** (2) after the move resolves and the phase flips, the tile the player would stand on is not a wall in the new phase. A direct consequence was the **union property**: a tile that is a wall in *either* phase is *never* a legal destination. That kept one rule path and full determinism — but it also produced **OQ-1** (`docs/level-design.md` §0): M0-only content (L1–L20, 40% of the game) was mechanically a **static maze**. The flip swapped wall skins and fired refusals, but changed **no legal move** until M1 doors arrived at L21. The game's hook and the first Aha (L3–L5) sit exactly in that static region.

OQ-1 was escalated to the user at **GATE C** with a concrete alternative on the table: *walls block entry only in their solid phase and never crush the player — restoring parity-dependent routing.* On **2026-10-14 the human chose Option B** (entry-only phase solidity). This is a core-rule change under AGENTS.md §2 and is therefore recorded in this ADR.

Rule-change record (required format):

- **Original Hypothesis (V0.2–V0.3, ADR-0006):** any move whose resolution would leave the player standing on a phase wall is illegal; the union property is accepted as the price of determinism; genuine route dynamism is delegated to M1–M3.
- **Problem:** with the union property, M0-only levels are a static maze with animated skins; the first Aha can only be *perceptual* ("different walls are visible"), never *mechanical* ("different routes exist"); the game risks feeling flat exactly where it must hook (OQ-1).
- **Change (V0.4):** legality is judged **only at entry, only against the current phase**; the post-flip standing check is deleted; standing inside a flipped-in wall is legal; the player is never crushed, pushed, or relocated; exiting an embedded tile uses the same entry rule.
- **Evidence:** GATE C human decision (2026-10-14); case analysis (parity-dependent-entry corollary, clause 8 below); the OQ-1 record in `docs/level-design.md` §0. Empirical playtest evidence: **pending Stage 2 — this ADR ships with a mandatory verification gate** (`docs/playtest-log.md`).
- **Result:** rule locked in `docs/game-design.md` V0.4 §3.1; teaching ladder rebuilt around parity routing in `docs/level-design.md` §2–§3; **OQ-1 RESOLVED**.

## Decision

The locked core rule is replaced by the following eight clauses:

1. **Legality at entry, current phase only.** A move is legal iff the destination is in bounds **and** non-solid in the **current** phase (a current-phase wall or a door closed in the current phase blocks entry; anything else passes). An illegal move is refused atomically: **no movement, no phase flip, state identical.**
2. **Flip stays bound to movement.** After a legal move fully resolves, the phase flips automatically (A→B / B→A). There is **no manual switch button** — the protected core innovation is unchanged.
3. **Standing inside a wall is legal.** If the post-flip phase makes the player's tile solid, the player simply stands inside the wall: **never crushed, never pushed, never randomly moved.**
4. **Exit from an embedded tile uses the same entry rule.** A player standing on a solid tile may move to any adjacent tile that is non-solid in the then-current phase — and only there. You can step out of a wall into the open; you cannot step from one solid tile into another currently-solid tile.
5. **Doors share the wall semantics.** Entry is judged by current-phase solidity only; a flip never retroactively judges the occupant of a door tile either.
6. **Portals trigger on entry only.** Entering a portal tile while its `activePhase` is current teleports the player **once**; no chaining; standing on a portal never re-triggers it.
7. **Win condition.** Standing on the goal at the end of a fully-resolved legal move wins the level, **regardless of phase**. The goal tile must be a non-wall in **both** phases — hard-enforced by level validation, so the goal is enterable on both parities and a win never happens from inside a wall.
8. **Key corollary — parity-dependent entry.** A Phase-B wall is enterable exactly during Phase-A steps (and vice versa), so enterability depends on the **parity of the move count**. Phase genuinely rewires feasible routes from **L1** onward. **OQ-1 is resolved: M0 is no longer a static maze.**

## Consequences

- (+) **OQ-1 resolved mechanically, not cosmetically.** Parity-dependent entry makes every M0 wall a real gate that opens and closes with the move count; the first Aha (L3–L5) is now produced by **M0 itself** (`docs/level-design.md` §2–§3). L1–L20 stops being a static maze.
- (+) **One rule path preserved.** ADR-0006's reason for rejecting wall suppression still holds: under Option B the wall never ceases to exist and never yields — the rule simply never re-judges the tile the player already occupies. Legality has exactly one evaluation point (entry, current phase). Player model, renderer and Solver still share one truth (ADR-0002, ADR-0004).
- (+) **Determinism preserved.** No crush, no push, no relocation; illegal ⇒ identity. The player is moved only by their own legal moves; the phase after `n` moves is fully determined.
- (+) **M1–M3 keep distinct jobs.** Doors = authored colored multi-tile gates; portals = phase-gated edges that fold space; switches = remote toggles — now layered on a living M0 instead of a static one. The "one rule, many expressions" library is strengthened, not disturbed.
- (+) **Refusal-as-tutorial survives.** Illegal moves still refuse atomically with no flip (clause 1); the L3 lesson ("a current-phase wall says no") is intact.
- (−) **Partially supersedes ADR-0006.** The third element of its ruling — the post-flip standing check (Decision condition 2), from which the union property followed — is deleted. The entry-solidity condition (Decision condition 1) and the atomic refusal (no movement, no flip) **stand unchanged**; ADR-0006's rejections of suppression, crush, push and pass-through remain in force; its union-property consequence is withdrawn.
- (−) **Revises ADR-0007's wall-echo semantics.** An other-phase wall is no longer a "permanent obstacle with phase-skinned visibility"; it is a **currently-passable phantom that will be solid on the other parity** — and symmetrically, an active wall is solid now and passable later. The echo *rendering* contract (same-class silhouette, strict subordination, contrast ≥ 3:1, never intercepts input) is unchanged, but it becomes even more load-bearing: the echo now carries *timing* information ("enterable NOW, solid after your next move"). The UI spec's echo wording may need a pass (follow-up for UI / Art Director); no redesign expected.
- (−) **New state class: the embedded player.** The renderer must show the player standing inside a wall readably; the Solver must treat embedded positions as ordinary nodes (exits = adjacent tiles non-solid in the current phase); the no-unrecoverable-state invariant now covers them — a reachable non-goal state with zero legal exits is a dead state and the candidate level is rejected (`docs/level-design.md` §4).
- (−) **Full Solver re-verification required.** Every existing and generated level, plus the difficulty metric `D`, must be re-proven under the new rule before Stage 4 generation (ADR-0004 pipeline). All pre-ADR-0008 solver results are void.
- (−) **Mandatory Stage 2 playtest verification.** Hypotheses to test: (a) players discover "enter the echo / parity opens walls" within L3–L5 without text; (b) embedded states read as "safe — walk out", not as a bug; (c) parity planning reads as depth, not chaos or a memory test (assumption A2, `docs/game-design.md` §13). If Stage 2 data contradicts (a)–(c), re-escalate to the human with the playtest evidence; **do not silently revert.**

## Alternatives considered

- **Option A — keep ADR-0006 unchanged (union property stands; dynamism waits for M1 at L21).** REJECTED BY THE HUMAN AT GATE C: M0-only L1–L20 stays a static maze; the first Aha remains perceptual; the flatness risk of OQ-1 lands exactly on the levels that must hook the player.
- **Option C — hybrid rules** (e.g. entry-only solidity for walls but a standing check for doors; or a one-"grace-step" allowance to leave a flipped-in wall; or entry-only only in teaching levels). REJECTED: every hybrid re-creates **two rule paths for the same object class** — the precise failure mode ADR-0006 was written to eliminate — and each exception is tutorial debt plus a Solver/player divergence risk. One rule, one evaluation point: entry, current phase.
- **Wall suppression (V0.1).** Remains REJECTED (ADR-0006): Option B is not suppression — the flipped-in wall is fully real and blocks entry while its phase is active; occupancy is simply never re-judged.
- **Crush / push / slide on flip-in.** Remains REJECTED (ADR-0006, AGENTS.md §2): punishment spikes and non-determinism are excluded by design.

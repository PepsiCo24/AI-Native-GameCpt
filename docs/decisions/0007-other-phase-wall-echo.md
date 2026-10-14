# ADR-0007 — Other-phase walls rendered during play as a low-emphasis "wall echo"

- **Status:** Accepted — resolves review blocker B-1 (RV-001); locked for prototype together with the UA-002 UI contract
- **Date:** 2026-10-14
- **Deciders:** Game Designer (Agent 1) + UI / UX / Art Director (Agent 5, owns the visual contract); Orchestrator sign-off at merge

## Context

ADR-0006 locked the illegal-move rule, with the **union property** as a direct consequence: a tile that is a wall in *either* phase is *never* a legal destination. But the UI spec V0.1 rendered phase-inactive objects as **absent** (`docs/ui-ux.md` V0.1 §3.1: "never render 'ghost walls'"). Combined, a Phase-B wall on an otherwise empty-looking Phase-A board is an **invisible, permanent obstacle**: the player taps a tile that looks empty, the move is refused with no movement and no flip, and the refusal reads as an **input failure** — the single worst comprehension outcome for a game whose tutorial IS its refusals (`docs/level-design.md` §2–§3, L3/L4). The L4 teaching row already depended on "other-phase ghost visibility"; RV-001 flagged the contradiction between the docs as blocker B-1.

Scope note: this is a **presentation-layer decision only**. It does **not** change the core rule, the illegal-move rule, legality, flip timing, or determinism — the echo is derived render state over the same single `GameState` truth (ADR-0002, ADR-0004, architecture-0001 unaffected). No AGENTS.md §2 core-rule change procedure is triggered.

## Decision

During play, walls belonging to the **other (inactive) phase ARE rendered** on the board as a distinct, low-emphasis-but-visible **"wall echo"**:

- **Same class silhouette** as an active wall (shape channel preserved, ui-ux R-C1) but strictly subordinate in the visual hierarchy — e.g. outline/reduced-fill treatment; the exact token and rendering are owned by `docs/ui-ux.md`.
- **Contrast ≥ 3:1** against the cell ground (WCAG 2.1 SC 1.4.11, per `docs/ui-ux.md` R-C3) — an echo must be findable at a glance, never "invisible unless you squint".
- **Information, not affordance:** echoes never animate on idle (R-C8's single attention magnet stays the goal), never intercept input, and swap to full solid treatment at the flip.
- The binding UI contract (tokens, exact treatment, QA additions) is being added in parallel under task **UA-002** to `docs/ui-ux.md` §3.1, superseding the V0.1 "absent, not dimmed" line.

## Consequences

- (+) **Every refusal has a visible cause.** The echo shows *why* a tap will be refused before the player taps; "every refusal is information" (`docs/level-design.md` §4) becomes literally true.
- (+) L4's lesson ("the wall I see and the wall that stops me can live in different worlds") gains its load-bearing visual channel (`docs/level-design.md` §2).
- (+) Cross-phase planning becomes a **reading task instead of a memory test** — directly de-risks assumption A2 (`docs/game-design.md` §13).
- (+) Core rule untouched: Solver, gameplay and renderer still share one truth source; nothing about `applyMove` changes.
- (−) Board can carry up to 2× wall graphics; clutter risk on dense boards — mitigated by strict subordination in the hierarchy and by the ui-ux §3.3 wall/path parse test (≥ 90%).
- (−) Does **not** resolve OQ-1: M0-only levels remain mechanically static under ADR-0006 (the echo improves *felt* change and refusal comprehension only). OQ-1 stays escalated to the user at GATE C (`docs/level-design.md` §0).

## Alternatives considered

- **Keep other-phase walls invisible (ui-ux V0.1)** — REJECTED: refusal on an empty-looking tile reads as input failure; breaks refusal-as-tutorial (L3) and the L4 reveal; turns M0 into a memory test.
- **Show the cause only at the moment of refusal (flash the blocking wall)** — REJECTED: reactive, not predictive; the player still cannot plan, and a flash after the fact reads as scolding.
- **Echoes only in teaching levels L1–L10** — REJECTED: two visual languages for one object class; the readability model must be uniform or it is noise.
- **Render other-phase walls at full strength** — REJECTED: destroys the active/inactive hierarchy; players could no longer tell which walls are solid *now* (greyscale and 1-second tests would fail).

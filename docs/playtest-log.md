# Playtest Log

> Owners: **QA Engineer** and **Playtest Analyst**
> Version: V0.2 · Date: 2026-10-14 · V0.2 = RV-001 finding **M-4** reconciliation: the V0.1-era case list ("no-cover rule", "player never covered by a newly appearing wall", "wall appears/disappears on flip") described the **superseded** wall-suppression rule and is replaced by the locked V0.2/V0.3 cases below (ADR-0006, ADR-0007, `architecture.md` §6.1–6.2).

---

## 1. Metrics tracked (per session / per level)

| Metric | Definition | Why it matters |
|---|---|---|
| Understand Time | seconds before first intentional move | is entry cost near zero? |
| First Win Time | seconds to first level completion | is the loop satisfying fast? |
| Mistake Rate | wrong moves per level | is difficulty honest? |
| Retry Rate | re-attempts after a failed/stuck state | is failure motivating or punishing? |
| Hint Dependence | hints requested per level | does the design explain itself? |
| Aha Point | level index where player audibly/verbally "gets it" | is the innovation landing? |
| Continue Intent | does the player seek the next level unprompted? | the core quality bar |

## 2. The single most important question

> **After Level 5 is completed, does the player actively want to continue?**

More valuable than "rate this game 1–10." In the prototype, **do not show a "Next" prompt** — observe whether the player looks for Level 6 themselves.

## 3. Test matrix

| Type | Scope | Tool |
|---|---|---|
| Unit | rules, phase flip, collision, illegal-move identity | Vitest |
| Solver | known solvable/unsolvable fixtures | Vitest |
| Integration | loader + schema + solver | Vitest |
| E2E | load → move → win → next, restart, undo | Playwright |
| Mobile | viewport, touch targets, legibility | Playwright + manual |
| Gameplay | human sessions, L1–L10 focus | manual + telemetry |

## 4. Bug record format

```
Reproduce → Root Cause → Fix → Regression Test
```

## 5. Critical cases to cover (locked V0.2/V0.3 rules — QA Engineer mandate)

Derived from ADR-0006, ADR-architecture-0001 and `architecture.md` §6.1–6.2 (V0.3 wording). These are the cases the rule tests must pin before any level ships.

- Phase switch correctness: every **legal** move flips A↔B exactly once; phase after *n* moves is fully determined.
- **Illegal move = IDENTICAL state.** A refused move produces **no movement, no phase flip, and `moveCount` unchanged** — `applyMove` returns a state deep-equal to the input (implementations may even return the same reference). This supersedes the V0.1 "wall suppression / never covered" rule.
- **Legality property test:** `isLegalMove(level, s, m) ⟺ applyMove(level, s, m) ≢ s`, pinned over generated states so the pre-check and the rule function can never diverge (`architecture.md` §6.2).
- **Step-6 revert discards every side effect.** If the post-flip check would leave the player standing on a wall **or a closed door** in the new phase, the whole move is reverted — the step-3 switch toggles, portal teleport and door resolution of the candidate state are **discarded**, and the flip is **not consumed**. Callers must never observe a half-applied transition.
- Out-of-bounds and blocked destinations (wall / closed door active in the current phase) — each refused, identically.
- Portal in/out: triggers **only on the entering move** in its active phase; no portal-to-portal chaining within one move; standing on a portal after a flip never teleports.
- Door open/closed per phase: `doorsOpen` recomputed **absolutely** at step 5 from `(color, phase, switchesOn)` — never carried over incrementally; an open door may not close onto the player at the flip (step-6 rule).
- Wall activity across a flip is a **state swap, not add/remove** — no wall sprite is created or destroyed by the flip (supersedes the V0.1 phrase "wall appears/disappears"; `ui-ux.md` R-E6).
- Win condition checked at step 7 only: standing on the goal after a fully-resolved legal move wins, **regardless of phase**.
- Restart and Undo.
- Unsolvable state handling.
- Abnormal / malformed Level JSON (schema validator rejects; never auto-repaired).
- Touch behavior (tap + swipe as one verb).
- Mobile layout (authored grids ≤ 7×7; the flagged 320 px / 7×7 = 41.1 px case per `ui-ux.md` R-T5).
- **A refused move must be visually explained** (ADR-0007): other-phase walls render as the low-emphasis-but-visible **wall echo** (`ui-ux.md` §3.1a, contrast ≥ 3:1), so every refusal has a cause the player can see *before* tapping. A refusal that reads as broken input is a bug, not a polish item — test it on real screenshots at Stage 2.

## 6. Sessions

| # | Date | Build | Participants | Levels | Notes |
|---|---|---|---|---|---|
| — | — | — | — | — | awaiting Stage 2 prototype |

## 7. Findings

_(empty — populated after Stage 3 playtest)_

## 8. AI analysis of playtest

For each finding, record: raw data → AI diagnosis → parameter change → solver revalidation → retest. This is part of the required AI-collaboration evidence chain.
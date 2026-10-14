# Playtest Log

> Owners: **Agent 6 — QA/Playtest** and **Agent 7 — Game Feel / Playtest Analyst**
> Version: V0.1 · Date: 2026-10-14

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
| Unit | rules, phase flip, collision, no-cover rule | Vitest |
| Solver | known solvable/unsolvable fixtures | Vitest |
| Integration | loader + schema + solver | Vitest |
| E2E | load → move → win → next, restart, undo | Playwright |
| Mobile | viewport, touch targets, legibility | Playwright + manual |
| Gameplay | human sessions, L1–L10 focus | manual + telemetry |

## 4. Bug record format

```
Reproduce → Root Cause → Fix → Regression Test
```

## 5. Critical cases to cover (from Agent 6 mandate)

- Phase switch correctness.
- Edge/corner movement.
- Wall appears / disappears on flip.
- Player is **never** covered by a newly appearing wall.
- Portal in/out.
- Door open/closed per phase.
- Restart and Undo.
- Unsolvable state handling.
- Abnormal / malformed Level JSON.
- Touch behavior (tap + swipe).
- Mobile layout.

## 6. Sessions

| # | Date | Build | Participants | Levels | Notes |
|---|---|---|---|---|---|
| — | — | — | — | — | awaiting Stage 2 prototype |

## 7. Findings

_(empty — populated after Stage 3 playtest)_

## 8. AI analysis of playtest

For each finding, record: raw data → AI diagnosis → parameter change → solver revalidation → retest. This is part of the required AI-collaboration evidence chain.
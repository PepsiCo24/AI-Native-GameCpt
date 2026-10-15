# ADR-design-0002 — The L11+ block ruling: the ordered-reader promotion trigger was tested and did not fire

- **Status:** Recorded — Game Designer ruling (task GD-010); Orchestrator sign-off at merge to `develop`
- **Date:** 2026-10-15
- **Deciders:** Agent 1 (Game Designer), on measured evidence produced by Level AI + Solver (LV-008) and the Orchestrator's clause-by-clause acceptance record (`docs/project-status.md` item 52, merge `aaab35d`). **No core-rule change occurs in this note** (the locked rule, AGENTS.md §2, is untouched); no gate, threshold, or metric definition changes; the code legs live in `@/core/solver` (LV's lane) and are cited, never edited, here.
- **References:** ADR-architecture-0002 Appendix A3 (the split) + its Corrigendum item 2 (trigger consumed ahead of schedule for gate (iii)); `docs/ai-native-pipeline.md` §8.5 (the unordered legs; LV-007B/007C/008 changelog) and §8.8 (the LV-008 record); `docs/level-design.md` §3 gate (iii) (the design-side gate text, GD-008/GD-010); `src/levels/README.md` §0b (L11 raw row); `docs/level-difficulty.md` §5.2 (L11 measured row).

## Context

The refusal-dynamism story runs on **two readers of the same board**:

- the canonical **unordered** `refusedThenEnteredTiles` — a tile counts if some reachable state refuses entry on it and another accepts it, in whatever order those states were discovered (the board-level *dynamism carrier*: proof that entry legality depends on history, not parity);
- the **ordered** companion `refusedBeforeEnteredTiles` — the *same tile* refused strictly before it is entered **on one real play trace** (the player-witnessable *Aha beat*).

ADR-architecture-0002 (Appendix A2/A3) split their jobs on purpose: **gate (iii)** — the Aha-beat condition of `docs/level-design.md` §3, whose own sentence is ordered ("refused *first*, entered *later*") — moved to the ordered form at GD-008, and LV-007C landed the code half (`policy.ts` gates `refusedBeforeEnteredTiles ≥ 1`, merge `9dd92ce`, with the trapped-refusal flip control live: canonical 1 / ordered 0 ⇒ rejected). Everything else — §8.5's pre-L11 acceptance law, `lesson-latch-dynamism`, gate (ii)'s refusal half — deliberately kept reading the **unordered** form (A3: the legs are not re-stitched; a trapped refusal still proves history-dependence and must never read as "static").

The companion carried a **promotion trigger** beyond gate (iii) (ADR-architecture-0002; §8.5): it MUST land as gate (iii) before the first L11+ portal candidate is accepted — consumed at LV-007C — and SHOULD be promoted further **wherever a candidate first diverges** (teleport edges make trapped refusals likelier). The first L11+ portal candidate existed as of LV-008: `l011.json`, the M2 debut.

## Test (the trigger, run once, on the first eligible candidate)

LV-008 ran both readers over `l011.json` at acceptance: **both report the identical tile list `[5,0]`** (`src/levels/README.md` §0b; `docs/ai-native-pipeline.md` §8.8; `docs/level-difficulty.md` §5.2). Divergence = 0. The promotion trigger's "a candidate first diverges" condition **did not fire**.

## Ruling (the A3 narrow reading stands, dated, not to be re-litigated by vibes)

1. **No leg moves.** `lesson-latch-dynamism`, gate (ii)'s refusal half, and §8.5's pre-L11 acceptance law keep reading the **unordered** `refusedThenEnteredTiles`; gate (iii) alone reads the ordered `refusedBeforeEnteredTiles`. ADR-architecture-0002 Appendix A3 stands **unchanged** — this note records the trigger's *tested outcome*, it does not re-open the split.
2. **The reason is semantic, not accidental.** The unordered legs answer "does entry legality depend on *history*?" — a trapped refusal answers yes even when no single trace witnesses the beat, which is exactly the dynamism claim's whole content. The ordered leg answers "can a *player* witness refused-first-entered-later?" — the Aha's claim. Both questions are design questions; they have different honest answers on the same board, and the split records that.
3. **Measured, not argued.** On all shipped content (L1–L11) the readers agree everywhere (L6–L10: 1/1/1/2/1 both forms; L11: `[5,0]` both forms), so no verdict has ever moved between the forms. The wild divergence class is real and pinned — 46/2000 seeded latch boards (2.3 %, `tests/solver/ordered-companion.test.ts` §5, per ADR-architecture-0003 Ruling 1) — and it is *why* the split exists, not a reason to collapse it.

## Re-opener (pre-specified — the only currency is a measured divergent candidate)

This ruling is re-opened by exactly one event: **a future L12+ candidate whose two readers diverge** (unordered fires, ordered does not — a trapped-refusal pocket on a real candidate). Then §8.5's own promotion path fires — the companion SHOULD be promoted where the candidate first diverges — and the change is Architect/LV-owned (metric gates live in `@/core/solver`), taken against the design question this note pins in advance: *does the level's documented lesson promise a player-witnessable ordered beat?* If yes, the ordered form is the honest gate for that row; if the level claims only dynamism, a trapped refusal remains real evidence and the unordered form must keep firing. Absent that measured divergence, any proposal to re-stitch the legs is out of order.

## Record format (per AGENTS.md §2, adapted — the outcome is "no change")

- **Original Hypothesis (ADR-architecture-0002, LV-007B era):** portal boards make trapped refusals likelier, so the first L11+ candidate may force the ordered reader's promotion beyond gate (iii).
- **Test:** LV-008, first L11+ portal candidate `l011.json`, both readers run at acceptance.
- **Evidence:** identical tile lists `[5,0]` on both readers (three independent records: `src/levels/README.md` §0b, pipeline §8.8, `docs/level-difficulty.md` §5.2); Orchestrator acceptance, `docs/project-status.md` item 52 (merge `aaab35d`).
- **Result:** trigger **did not fire**; the A3 narrow reading stands unchanged and is dated here so it is not re-litigated without new measurement; re-opener pre-specified above.

## Consequences

- (+) Future agents have a single citable, dated record: the split is a *measured* status quo with a named re-opener, not a default nobody checked.
- (+) The promotion trigger is now fully consumed for gate (iii) (LV-007C) and *tested* for the block (LV-008) — no dangling "will portals break this?" question remains open in design space.
- (→) No file outside `docs/level-design.md` §3 (dated pointer) and this note changes; `docs/ai-native-pipeline.md` §8.5 remains LV's file, deliberately untouched by GD.

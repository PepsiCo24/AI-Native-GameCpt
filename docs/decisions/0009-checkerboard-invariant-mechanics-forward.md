# ADR-0009 — Checkerboard invariant: M0-only content is provably static; GATE D chooses "mechanics forward" (D3), core rule unchanged

- **Status:** Accepted — **human-approved at GATE D** (2026-10-14). **Withdraws ADR-0008 clause 8** (and its echoes in that ADR's Consequences and Alternatives) as measured-false; **ADR-0008 rules 1–7 stand unchanged**. Rebuilds the mechanic schedule and teaching ladder: `docs/game-design.md` **V0.5**, `docs/level-design.md` **V0.4**. Stage 2 playtest obligations are re-based (Decision 8).
- **Date:** 2026-10-14
- **Deciders:** **Human (final authority, GATE D)**; theorem proved independently three times (Gameplay Engineer GAME-001; Level AI + Solver LV-001R; Orchestrator BFS harness over the shipped `applyMove`); record authored by Game Designer (Agent 1); Playtest Analyst confirmation due at the Stage 2 gate.
- **Supersedes:** ADR-0008 **clause 8 only** — the parity-routing corollary and its "OQ-1 resolved" claim. ADR-0008 rules 1–7 (entry-only legality; flip bound to movement; standing inside a wall is legal; exit by the entry rule; doors share wall semantics; portals trigger on entry once; phase-independent win with a dual-phase-safe goal) are **untouched**.
- **Revises:** `docs/game-design.md` §1 / §3.1 / §5 / §8 / §9 / §13 (V0.5); `docs/level-design.md` §0–§3 / §5 / §6 (V0.4). A dated correction banner is appended to ADR-0008; its body is not rewritten.

## Context

GATE C chose Option B specifically to obtain mechanical route dynamism inside M0 (ADR-0008 clause 8: "Phase genuinely rewires feasible routes from L1 onward… M0 is no longer a static maze"). Before level production, that claim was **proved false — three times independently, with no shared code**.

**The checkerboard invariant (theorem, not opinion).** A 4-connected grid is bipartite; every legal move flips the phase and changes `x+y` parity; an illegal move changes nothing — **no movement, no flip**, so a refusal never consumes a move. Therefore every path from `player` to a tile `c` has the same length parity, and the phase that is current when the player **enters** `c` is a function of `c` alone. With `startPhase = A` (verified form, `src/levels/README.md` §3):

- arrival at `c` always happens on a move `n ≡ d(c) (mod 2)`, where `d` is the Manhattan distance from `player`; a detour adds 2 moves, never 1;
- a `phaseAWalls` tile is enterable **iff `d(c)` is even**; a `phaseBWalls` tile **iff `d(c)` is odd**;
- a parity-**mismatched** phase wall is a **permanent obstacle** (behaviourally identical to a wall listed in both phases);
- a parity-**matched** phase wall is **permanently passable decoration**;
- **"refused first, entered later" is unconstructible in M0** — the exact beat ADR-0008's Aha chain and the L4/L5 lessons required.

Evidence base (program results only; no LLM opinion — AGENTS.md §7):

1. **GAME-001** — analytic proof + 200-board / 3,782-state sweep: **0** tiles reachable in both phases.
2. **LV-001R** — independent proof + 4,000 random levels × 4 mechanic mixes: M0 walls → **0** dynamism; **M1 doors alone → 0**; M3 switch + door → 231/500; M2 portal → 233/500.
3. **Orchestrator** — own BFS harness driving the shipped `applyMove` (out of repo): 400 random M0 boards → **0** dual-phase tiles, **0** invariant violations.
4. **GATE D decision scan** (200 boards per mix, BFS over the shipped rules): M1 doors alone → 9/200 decision-bearing (**anomalous residue — handed to SOLVER-001 for qualification; treated as suspicious until then**); **M1+M3 latch → 74/200** real decisions (0 dual-phase tiles — the *latch*, not parity, carries them: "the switch I stepped on changed how that door answers"); **M2 portals → 80/200** (81/200 dual-phase tiles); **same-colour portal pairs → 0/200**.

New authoring law discovered during verification (Orchestrator TEST 2, 0/15 vs 15/15): **a portal breaks the position→phase function only if its two ends sit on opposite checkerboard colours.** A teleport changes position without consuming a move; same-colour ends preserve arrival parity and leave the board static.

What Option B **did** deliver — and we keep, honestly labelled: a readable, teachable beat that did not exist under ADR-0006 — *walk into a phantom echo → it solidifies under me → I walk out* (already shipped, accidentally, in L4/L5). This is M0's teaching value. It is **not** routing dynamism and must never be sold as such again.

At **GATE D (2026-10-14) the human chose D3 — mechanics forward**: the core rule is not touched; the mechanic schedule is rebuilt so that real, phase/memory-driven decisions arrive in the first level block.

Rule-change record (required format — applied to the *claim* being corrected; **no core-rule change occurs in this ADR**):

- **Original Hypothesis (ADR-0008 clause 8):** parity-dependent entry makes every M0 wall a real gate opened and closed by the move count; OQ-1 resolved mechanically from L1 onward.
- **Problem:** the checkerboard invariant proves arrival parity is route-independent; M0 (and M1 without switches) produce a **static legal-move graph**. The hypothesis is false; Option B did not resolve OQ-1.
- **Change (GATE D, D3):** keep ADR-0008 rules 1–7 verbatim; withdraw clause 8; promote **M3 to CORE**; ship **M1+M3 as one teaching unit from L6**; bring **M2 portals to L11** under the opposite-colour law; re-define Aha #1 as the **latch** beat and Aha #2 as the **opposite-colour portal** beat; keep the **phantom walk** as M0's honest L4–L5 lesson.
- **Evidence:** the four program results above; BFS-verified shortest solutions for the five shipped prototype levels (4/5/6/6/6 — all five remain valid and now carry honest lesson labels).
- **Result:** this ADR; correction banner on ADR-0008; `game-design.md` V0.5; `level-design.md` V0.4; the 9/200 M1-alone anomaly is handed to SOLVER-001.

## Decision

1. **The checkerboard invariant is design law.** Every level lesson, Aha chain, and difficulty claim must be consistent with it: the entry phase of a tile is fixed by the tile; M0 walls are permanent geometry or decoration, never timing gates; "refused first, entered later" requires latch state (M1+M3) or an opposite-colour portal (M2). This law is Solver-checkable on every candidate level.
2. **ADR-0008 clause 8 is withdrawn** (correction banner appended there). OQ-1 was **not** resolved by Option B; it is resolved here, by schedule, not by rule.
3. **The core rule is unchanged (D3).** No wait action, no manual switch, illegal move = identity, the player is never crushed / pushed / moved. Any future core-rule change still requires Game Designer + Playtest Analyst + Orchestrator agreement and a new ADR (AGENTS.md §2).
4. **M3 is promoted from OPTIONAL to CORE. M1 never ships alone.** Doors without switches are measured static (their openness is a function of the phase alone); the **latch** — *the switch I stepped on keeps the door changed after I walk away* — is the first mechanic that produces real, memory-driven decisions (74/200). Door + switch is **one teaching unit (L6–L10)**.
5. **M2 follows immediately (L11), under the opposite-colour authoring law:** both portal ends must sit on opposite checkerboard colours (`x1+y1` and `x2+y2` of different parity). Same-colour pairs are measured inert (0/200) and must be **rejected by the validator** (handoff: Level AI + Solver adds the rule; the law and the level-side constraints are pinned in `docs/level-design.md` §1).
6. **The Ahas are re-defined.** **Aha #1 (L6–L8) = the latch:** "我踩过的东西，改变了我脚下的世界。" **Aha #2 (L11–L13) = the opposite-colour portal:** "同一个格子，因为我从哪边来而应答不同。" The parity-gate Aha ("a side step flips parity and the refusing wall becomes my route") is **unconstructible** and is removed from all docs.
7. **The phantom walk is M0's honest teaching value (L4–L5):** enter a passable echo → it solidifies under you → walk out, unharmed. It is taught explicitly and is never again claimed as route dynamism.
8. **Stage 2 playtest hypotheses are re-based** (supersede items (a) and (c) of ADR-0008's mandatory verification; item (b) stands unchanged): **(a′)** players read the latch — step on the switch, the door changes and *stays* changed — without text by L8; **(b)** embedded states read as "safe — walk out", not as a bug (now load-bearing earlier, at L4–L5); **(c′)** portal travel reads as "space folded", not as disorientation; **(d′)** the M0-only opening (L1–L5) retains players to L6 without a mechanical Aha. If data contradicts these, re-escalate to the human with the evidence; **do not silently revert.**

## Consequences

- (+) **Real decisions arrive in the first level block (L6)** instead of L21/L26; the game's hook no longer rests on a falsified claim.
- (+) **Zero engine churn.** ADR-0008 rules 1–7 are untouched, so the shipped core code, the validator, and the five prototype levels all stand; only the lesson *labels* on L3–L5 change (pars 4/5/6/6/6 already BFS-verified). No re-verification debt is created by this ADR beyond the already-standing SOLVER-001 gate.
- (+) **Each mechanic now has a measured, distinct job:** M0 = permanent geometry + the phantom-walk safety lesson; M1+M3 = latch decisions; M2 = parity-breaking space fold. "One rule, many expressions" survives — the expressions are now honest.
- (+) **The five shipped teaching levels already implement the new L1–L5** (per the `src/levels/README.md` traces): L3 = permanent refusal, L4 = offered phantom walk, L5 = forced phantom walk. No re-authoring of the prototype is required.
- (−) **Honest cost: M0 alone remains a static maze.** L1–L5 carry literacy, refusal, and the phantom walk — there is **no mechanical Aha before L6**. The hook burden shifts to cadence (small boards, par ≤ 6, instant restart, fast level turnover) and to L6 arriving quickly. If Stage 2 shows L1–L5 bleeding players (hypothesis d′), re-escalate with data; never silently re-tighten the rule.
- (−) **M3 is promoted on scan evidence, not yet on playtest evidence.** Accepted because the alternative (M1 alone) is *measured* static — but the L6 difficulty dip (`docs/level-design.md` §6) is mandatory, and the latch Aha passes the same playtest gate as every Aha (hypothesis a′).
- (−) **The 9/200 M1-alone anomaly** must be qualified by SOLVER-001 before any door-only content is ever authored. Current stance: the plan contains **no M1-only levels**, so this is hygiene, not a blocker.
- (−) **Doc debt outside this ADR's ownership:** submission and iteration docs that still cite the withdrawn clause-8 claim (or the earlier union property) must be corrected in the next Docs + GitHub pass — same treatment as the earlier union-property cleanup.

## Alternatives considered

- **Keep ADR-0008's claims and ship the parity ladder as written.** REJECTED — falsified by proof and by four independent scans; it would ship a tutorial whose stated beats cannot occur, and the first playtest would pay for it.
- **Change the core rule instead** (a legal "wait"/self-flip, crush-on-flip, or a manual switch). REJECTED BY THE HUMAN AT GATE D — D3 explicitly means "the rule, one word unchanged". The protected core (one move ⇒ one flip; illegal = identity; never crushed) is working and was never the problem.
- **Accept static M0 and let the first real decision wait for L21+ (the pre-GATE-C plan).** REJECTED — that is OQ-1's original flatness risk, unmitigated, landing exactly on the levels that must hook. D3 exists precisely to pull decisions into the first block.
- **Portals first, doors later (M2 before M1+M3).** REJECTED — the latch is the gentler cognitive step (a visible cause-effect link on one board) and needs no teleport legibility from the renderer on day one; portals then land on players who already own `move → flip → latch`, and their parity-breaking reads as a *second* revelation instead of a confusion source. Ordering remains Solver-verifiable either way; revisit only on playtest evidence.

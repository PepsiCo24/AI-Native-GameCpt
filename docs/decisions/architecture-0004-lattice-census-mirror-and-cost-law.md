# ADR-architecture-0004 — Far-region lattice orbit law; first-column-dead law; census reporting defect; census-cost ruling (sizes may be predicted, accepts may not)

- **Status:** Accepted — Architect ruling (task ARCH-001 / AR-007); Orchestrator sign-off at merge to `develop`
- **Date:** 2026-10-17
- **Deciders:** Agent 2 (Technical Architect). Answers the F-L20-3 hand-over recorded in `docs/project-status.md` item 116 (RV-011) and transcribed in `scripts/author-l20-p10.transcript.md` §6a(i).
- **References:** `scripts/author-l20.ts:208–217` (regions) · `:226–235` (`COLUMN`) · `:268–305` (`sealedPocket`) · `:308–323` (`boundaryOf`) · `:326–345` (`pocketCandidates`) · `:797–826` (`pocketLeaks`) · `:893–941` (`stagePockets`, print gate at `:925–932`) · `scripts/author-l20-p10.transcript.md` §3b/§4/§6a (`a897d27`, on `develop`) · `scripts/author-l20.transcript.md` §4 (the ≤8 census, LV-011) · `docs/ai-native-pipeline.md` §8.16 (the G census, `column-leak` refusals) · `docs/level-design.md` §6.2.3 · `docs/architecture.md` §15 (the ruling text), §13 (YAGNI).
- **Changes no rule, no code, no level.** Docs-only. No core/state/schema/level/`par`/`B`/`D_exec`/gate change. The instrument follow-ups are the level lane's tickets (§15.6); this ADR only rules what may be believed and reused.

## Context

The ≤10 stage-P census measured 724 203 655 candidates over 18 landing slices. In `scripts/author-l20-p10.transcript.md` §6a(i) the level lane recorded that the `x=4` and `x=6` slices enumerate to **identical `tested` counts on all six rows** (3 187 161 · 18 777 072 · 45 252 927 · 40 224 824 · 21 124 206 · 2 833 032) while the parity verdicts between them are **total and opposite** (`x=4`: 0 single-phase boundary, 0 leak-free; `x=6`: its whole `tested` count as single-phase, 15 113 leak-free). The mechanism was explicitly **not** asserted, and was handed to the architect as a question. Two things therefore needed a ruling: *what is this symmetry* and *may a census spend less because of it*.

Three facts frame the answer. (i) The enumerated pocket space is drawn **only** from `FAR_TILES`, the far region `Γ_F = [CX+1, W−1] × [0, H−1]` — a rectangle, whose grid automorphism group is `D2 = {id, σ_x : x ↦ CX + W − x, σ_y : y ↦ H − 1 − y}`. (ii) The accept screen `pocketLeaks` evaluates **in-bounds neighbours**, so it notices the phase-indexed sealed column to the left of `Γ_F` but not the board edge to its right — the environment is not mirrored even though the enumeration space is. (iii) The census's own reporting chain has a print gate that suppresses both printing and counter accumulation.

## Ruling 1 — the `tested` identity is a **law**: enumeration size is a `D2`-orbit invariant of `Γ_F`; `tested = N(parity) × K(orbit)`

Both reflections are automorphisms of `Γ_F` **and of the boundary operator** (`boundaryOf` drops `x ≤ CX`, which `σ_x` maps onto `x ≥ W`; both are excluded), so the number of growth-sequence candidates `K(landing)` is constant on each `D2` orbit. The near-end factor is not: only the parity-opposite near ends loop (`:904–906`), so `N(even (x+y)) = 9`, `N(odd) = 8` (`LEFT_TILES` holds 9 of each parity; `(0,0)` is even and excluded). Hence `tested` is invariant under the **parity-preserving** half `σ_x` and changes by the `9↔8` factor under `σ_y`.

**Evidence (all committed digits, two independent derivations).**
- Every one of the 18 ≤10 rows factorises exactly: outer columns `{4,6}` `K = 354 129 / 2 347 134 / 5 028 103` for row classes `{0,5} / {1,4} / {2,3}`; centre column `x=5` `K = 1 338 255 / 8 262 157 / 17 541 071`; multiplied by `N` per landing this reproduces all 18 counts with no residue.
- The parity-flipping half `σ_y` is visible in the same table as equal per-near `K` with unequal totals — `4,2` 45 252 927 = 9 × 5 028 103 vs `4,3` 40 224 824 = 8 × 5 028 103; `5,2` 140 328 568 = 8 × 17 541 071 vs `5,3` 157 869 639 = 9 × 17 541 071.
- Twelve exact equalities over rows spanning 10⁷ are not chance; the law is derived, not fitted.

**Consequence.** The transcript's "mirrored-column identity" was the parity-preserving half of the orbit law. Rejected naming: it is not a coincidence, not a census bug in the enumeration, and not a "vertical midline only" accident.

## Ruling 2 — the RESULTS are not symmetric, and that is structural: **LAW — the first far column is dead in every frame**

The mirror is an automorphism of the *enumeration graph* only. `pocketLeaks` (`:797–826`) iterates every in-bounds neighbour of a pocket tile: to the left of `Γ_F` stands the sealed column `x = CX` (walkable in exactly one phase, its solid phase derived from the start-space anchor, `COLUMN` `:226–235`), while the mirror direction at `x = W−1` is the board edge and is skipped. The door cannot compensate: `boundaryOf` excludes `x ≤ CX`, so the column is never a door tile.

**Proof (one line per step).** For a landing `(CX+1, y)` the admissible near ends satisfy `parity(near) = parity(CX+y)`; the column tile `(CX, y)` is solid in phase `A` iff `(CX+y)` is odd, which is exactly `entryPhase(near)`; the far frame stands at the landing in `arrivalPhase = flip(nearPhase)`. So the column tile is **never** solid in the landing's own stand phase, the landing's left neighbour is a free leak, and no door covers it. ⇒ **no pocket grown from a first-column landing can ever be leak-free, for any `CX`, `W`, `H` and any pocket size.** The L20 frame's `x=4 → 0` is therefore a law, not a measurement; the G batch's `column-leak` refusals (`docs/ai-native-pipeline.md` §8.16) are the same law in the `--cx=2` frame.

Rejected: "`x=4` and `x=6` are the same device with different results" (they are different devices: one is column-adjacent, one is edge-adjacent).

## Ruling 3 — FINDING: the `single-phase boundary` counter is a tautology whose totals are gate-suppressed (reporting defect, level lane's ticket)

- `sealedPocket` (`:268–305`) rejects a pocket iff some boundary tile is adjacent to pocket tiles of **both** BFS-distance parities. On a bipartite grid every neighbour of a boundary tile has one `(x+y)` parity, and for a connected pocket `dist(t) mod 2 ≡ parity(t) ⊕ parity(landing)`; the test can never fire. Corroborated by measurement: `single-phase == tested` on all twelve class-bearing landings at ≤10 and per near end at ≤8 (`5,0` 36 829 / 36 829, `6,0` 11 608 / 11 608). The screen screens nothing.
- `single`/`sealed` accumulate **inside** `if (hereSealed > 0)` (`:925–932`), so a `(landing, near)` with no leak-free pocket loses its single-phase mass silently. At ≤10 that is exactly the `x=4` group: `724 203 655 − 592 804 433 = 131 399 222` equals its `tested` sum digit for digit; at ≤8, `16 431 095 − 13 163 780 = 3 267 315`. The published `x=4 → 0 single-phase` is a **suppressed counter**; the ≤8 statement that this arithmetic "licenses the `x=4` reading" is a tautology (a sum over printed lines equals the counter by construction).
- **Blast radius: zero on accepts.** Leak-free totals are unaffected (the first column loses nothing by Ruling 2, and every class-bearing near had ≥1 leak-free), so `2 788`, `17 476` and the size histogram stand. Only the `single-phase` column and the missing `x=4` near lines are wrong; that column's true value is `tested`.
- Corrigendum style precedent: the 46/2000 disposition (`architecture.md` §8.1 依据 (iii) / ADR-architecture-0003 Ruling 1) — the wrong number is *labelled* wrong in place, never silently replaced.

## Ruling 4 — census-cost ruling: **exploit-with-proof for sizes, never for accepts**

1. **Allowed.** Within one frame (fixed `CX`, `W`, `H`, `--pocketsize`), enumeration size may be predicted from an orbit mate, with the orbit map exhibited as an automorphism of `Γ_F` **and** of the boundary operator for the parameters in force. Bound: at most **one walked landing per `D2` orbit**; every other figure is `N(its own parity) × K(orbit mate)`, `N` recomputed per landing.
2. **Equivariance condition for inheriting RESULTS (per gate, never by default).** Verdicts of a gate `g` may be inherited under an orbit map `σ` **iff** `g(σ(P)) = g(P)` holds for every enumerated `P` in that frame — established by proof or by an exhaustive orbit-pair walk at the smallest cap that exhibits `g`. `g_leak` fails (0 vs 15 113 measured in one frame; cause Ruling 2). `g_single` holds but carries no information (Ruling 3).
3. **Forbidden.** Emitting or inheriting leak-free acceptance for an unwalked landing — one exception: the **first far column**, where leak-free ≡ 0 is a law (Ruling 2) and must be labelled a law, never a measurement. No inheritance across frames, pocket caps or instruments (the distinct-set enumerator re-baselines; ≤8-vs-≤10 is not a mirror relation). Predicted figures are labelled **PREDICTED**; `NOT MEASURED` never becomes zero by prediction.
4. **Alternatives rejected.** *Observe-only* — spends nothing on a proven 3×-per-column economy that exists precisely for the multi-pocket `G` censuses. *Forbidden entirely* — the size economy is proof-carrying and cheap. *Auto-orbit / symmetry-engine tooling* — `docs/architecture.md` §13 (YAGNI): the orbit map is three lines of arithmetic; the burden is the proof, not the machinery.

## Consequences / follow-ups

- **`docs/architecture.md` §15 is the normative text**; this ADR is its decision record.
- **Level AI + Solver** (owner of `scripts/**` + transcripts): fix or retire the print gate and publish the corrigendum on the two `single-phase` totals; run the falsifiable probe (one full orbit pair `(4,y)`/`(6,y)` at `--pocketsize=4` with the gate removed — expect all six `x=4` leak-free sets **empty** against the `x=6` members, i.e. equivariance fails exactly as Ruling 2 proves — and `single-phase(4,y) == tested(4,y)`); retro-test the ≤8 prediction `9·11 608 + 8·11 608 + 8·63 000 + 9·63 000 + 17·v = 3 267 315` ⇒ `v = K(6,2)|≤8 = 117 587` per near (two ≤8 slices settle it; any other integer refutes Ruling 1).
- **QA** (optional): a pure-graph `D2` automorphism pin on `Γ_F` for the parameters in force, so a frame change cannot silently invalidate a predicted figure.
- **Nothing else moves:** no core rule, no `GameState`, no schema, no level, no `par`/`B`/`D_exec`, no registered ceiling, no gate.
# `src/levels/` — level data set (M0 ladder L1–L5 + M1+M3 unit L6–L10 + M2 debut L11 + M2 block L12–L15 + L16+ latch block L16–L20 = five rungs + **Act II batch 1 L21–L25** = five rungs + **Act II batches 2 + 3 L26–L35** = ten rungs + **Act II batch 4 L36–L40** = five rungs + **Act III batch 1 (GD-012's opener) L41–L45** = five rungs · **45 files** · shelf: EMPTY)

> Owner: **Level AI + Solver** (AGENTS.md §4). Design intent: **Game Designer** (`docs/level-design.md` §1–§3, §7).
> Status: **schema-validated AND solver-proven** — `scripts/solve-levels.ts --audit` reports `45/45 level file(s) PASS`, `par` == the solver's `shortestSolution` on 45/45, 0 dead states, 0 unrecoverable states, and the level policy (`@/core/solver/policy`) reports 0 violations on 45/45 (`npm run levels` → `45/45 level files ok · 0 errors · 218 warnings (0 multi-switch-door) · 11/11 negative cases`).
> Metrics: the `docs/level-difficulty.md` §2 model is **measured** for every shipped level (`B` effective, `T`, `R`, `D` — §5.2 there, definitions in §2a; the mirror now reads **45** records); the route walk and the ordered latch companion are printed by the solver CLI (§0b).
> Board cap: **≤ 7 × 7** (`docs/ui-ux.md` R-L2). L1–L5 are **M0 only**; L6–L10 add **M1 doors + M3 switches**; **L11 adds M2 portals** (`dualPhaseTiles > 0` for the first time — the only board in the set whose position→phase link is broken); **L12–L15 are the M2 block** (`docs/decisions/design-0003-l1215-block-law.md`): par ramps 4/6/8/10 and the walking world is deleted from L13 up; **L16–L19 are the L16+ latch block** (R-003c, `docs/ai-native-pipeline.md` §8.13): the goal-gated full seal at 7 × 6, par ramps 12/14/16/18, and the block **stops** at 18 because that is the measured ceiling of *that* device; **L20 is the sealed landing** (R-003d, §2e-5): par 20, the first rung **above** that ceiling, bought by a new mechanism rather than a wider number; **L21–L25 are Act II batch 1** (R-004a, §2f — `docs/level-design.md` §7.2–§7.7 + ADR-`design-0005`): the **multi-pocket** device at 7 × 6, par 17/18/20/21/23, the act's **opening** rung deliberately **below** Act I's peak and its **peak** the rung that discharges §7.3's across-act clause; **L26–L35 are Act II batches 2 + 3** (R-005a, §2g — `docs/level-design.md` §7.3.1): the same multi-pocket grammar on two further skeletons, par 17/18/20/21/23 (batch 2, the batch that still discharges §7.3's across-act clause) then 19/22/22/24/24 (batch 3, the act's **new registered tail** — it raises the act maximum to L35's `D_exec` 28.339426 and consumes **0.734775** of the act's headroom, §7.9); **L36–L40 are Act II batch 4** (R-006a, §2h — `docs/level-design.md` §7.4 stage G on the batch's own derived P2-exact ladder): the act's **closing** batch, batch 3's 4-pocket / 5-door / forced 5-press device on §7.4's **second frame** `7 × 7` at `CX = 1`, par 18/20/22/24/24 — with §7.3.2's act-close obligation **already discharged at L35 by R-005a**, this registration adds no peak clause and registers a **reading** instead: the act's maximum moves to L40's `D_exec` 28.455319, `+0.115893` over the R-005a tail it supersedes (§2h, §7.3/§7.9); **L41–L45 are Act III batch 1** (R-007, §2i — `docs/level-design.md` §7.10, GD-012's opener, **ADOPTED + USER-APPROVED 2026-10-19**): the set's **first act boundary**, the same 4-pocket / 5-door / forced 5-press device class as batch 4 on the same proven frame `7 × 7` at `CX = 1`, on §7.10.2's **derived** opener ladder, par 20/22/24/26/26 (the `par 28` top **reserved** for §7.3.2's `L51–L60` carrier) — with §7.10.5's YAGNI executed literally (`ΔM = 0`: Act III introduces **no** mechanic unit, so §6's dip law does not fire and no new painter seam is implied), the act **opens at the opener rule's floor** `par 20`, and its **peak** L45 `30.455319` is what §7.3's across-act clause rides on: **+2.000000** over Act II's registered tail, **+5.725907** over Act I's registered peak, with **2.607181** of derived-exact headroom under Act III's ceiling `33.0625`.
> **The shelf is EMPTY again — the ten Act II rungs of batches 2 + 3 graduated to the root at R-005a:** `l026.json`–`l035.json` are registered, byte-identical to the shelf bytes (`sha256` **and** git blobs unchanged on both sides, `git mv` rename 100 %), and the dataset is **35 files**. Batches 2 (`l026`–`l030`) and 3 (`l031`–`l035`) carry their own registered ladder table (`ACT_II_B2_B3_LADDER` in `@/core/solver/policy`) and their own per-member gates (`act2-registered-rung`, `act2-exec-band`, `act2-b-band`, `act2-exec-identity`, `act2-coverage`, `act2-act-peak`) — they do **not** touch the L16–L20 block law: `BLOCK_L1619_IDS` is still `[16 … 20]`, `block-l1619-tail-ceiling` still judges **L20 at par 20 / `D_exec` 24.729412**, and L20 was **not re-stamped** (§7d) — and they re-stamp **no** R-004a-era row: the five L21–L25 rows survive unchanged (§2g, §7d). R-005a *does* move the **act tail** (R-004a's standard was batch-1's peak; the registered tail is now the whole-act maximum at L35 — `ACT_II_R005A_REGISTERED_TAIL_EXEC` 28.339426, §7.3/§7.9) and *does* add the seam clause with its two pre-published relief labels (§2g). The *consumer* pins (`src/game/levels/level-registry.ts`, `tests/e2e/helpers/levels.ts`'s `EXPECTED_LEVEL_COUNT`) follow GAME's registry row / R-005c (§7d), and the cut stays frozen **L1–L15** at `14.969697` — now measured on **35** files with basis ids `[1 … 15]`.
> **The R-004a record, unchanged:** batch **1** (`l021`–`l025`) was registered by R-004a (§2f) with its own `ACT_II_B1_LADDER` and the six `act2-*` gates above; the act opened **below** Act I's peak and discharged §7.3's across-act clause on **its** maximum (L25 `27.604651`, advantage `+2.875239`) — the constant R-005a's tail clause lifts off (§2g).
> **The shelf is EMPTY again, and the dataset is 40 files — the five Act II batch-4 rungs graduated to the root at R-006a:** `l036.json`–`l040.json` (LV-017's proven candidates) are registered, **byte-identical to the shelf bytes on both hashes** — `sha256` **and** git blobs unchanged on both sides, `git mv` rename 100 %, 5 files / 0 insertions / 0 deletions — so once again the registration is a byte-copy and never a re-authoring, exactly as R-003c / R-003d / R-004a / R-005a did it. Root blob == `e30bbaccf:src/levels/candidates` blob **5/5**: `adff8c1e50db…` / `c0eb8660…` / `76dcc3e0…` / `241d669d…` / `e6f7359d3679…`, with `sha256` `5b23e8ee…` / `cd4c8edb…` / `a65ab804…` / `e5f9e8be…` / `701e46ee…` the same bytes before and after the move (§2h). The five rows are in `docs/level-difficulty.md` §5.2 and in the regenerated `docs/level-difficulty.report.json` (**40** records, byte-stable on a second `--report` run). The tail law moved the **R-003d way — re-derived, never re-stamped**: the pre-registration standard is kept as its own alias-typed datum (`ACT_II_PRE_R006A_REGISTERED_TAIL_EXEC` = R-005a's `28.339426` at L35) and the post tail (`ACT_II_R006A_REGISTERED_TAIL_EXEC` = `28.455319` at L40) is the maximum over the widened `ACT_II_REGISTERED_IDS` (`21 … 40`); §7.3.2's act-close obligation stays **discharged at L35** and is **not re-run**, so no `act-close` refusal branch was invented. The five new rungs prove under the **reused** `act2-*` gate family (no new `POLICY_VIOLATION_CODES`, no graft onto `BLOCK_L1619_IDS`), and the act-scale clause set is asserted as a **16-set** the three attests **partition** between them (6 + 5 + 5 = 16, 0 unclaimed). The cut stays frozen **L1–L15** at `14.969697`, now measured on **40** files with basis ids `[1 … 15]`. The *consumer* pins (`tests/e2e/helpers/levels.ts`'s `EXPECTED_LEVEL_COUNT`, the `PINS` tables, the shelf booking) still read **35** and are **RED by design** — dossiers with `file:line` in §7e, re-booked by **R-006c**; the registry row is **R-006b** (GAME's lane).
> **The shelf is EMPTY again, the dataset is 45 files, and the FIRST ACT BOUNDARY moved the tail — the five Act III batch-1 rungs graduated to the root at R-007:** `l041.json`–`l045.json` (LV-018's proven candidates) are registered, **byte-identical to the shelf bytes on both hashes** — `sha256` **and** git blobs unchanged on both sides, `git mv` rename 100 %, 5 files / 0 insertions / 0 deletions — so once again the registration is a byte-copy and never a re-authoring, exactly as R-003c / R-003d / R-004a / R-005a / R-006a did it. Root blob == `82dd808:src/levels/candidates` blob **5/5**: `a07f7846…` / `d130315e…` / `ae18e42b…` / `a4da9d38…` / `a4d8860a…`, with `sha256` `e3fe42fb…` / `6d631d5b…` / `c749fca3…` / `eb6cdf6b…` / `e72d5446…` the same bytes before and after the move (§2i). The five rows are in `docs/level-difficulty.md` §5.2 and in the regenerated `docs/level-difficulty.report.json` (**45** records, `sha256 f81c67e6…`, byte-stable on a second `--report` run). **The tail law left Act II's basis — the R-003d rule read across an act boundary for the first time**: the pre-registration standard (`ACT_III_PRE_R007_REGISTERED_TAIL_EXEC` = `28.455319` at L40) is **alias-typed** to R-006a's constants, and Act III's tail (`ACT_III_REGISTERED_TAIL_EXEC` = `30.455319` at L45) is the maximum over its **own** ladder, so the move is the measured **+2.000000** and neither end can be edited alone. §7.3.2's `act-close` obligation belongs to `L51–L60` and is **neither discharged nor re-fired** here, so no `act-close` refusal branch was invented. The five new rungs prove under the **reused** `act2-*` per-member family (no new `POLICY_VIOLATION_CODES`, no graft onto `BLOCK_L1619_IDS`), and the act-scale clause set is asserted as a **22-set** the four attests **partition** between them (6 + 5 + 5 + 6 = 22 claimed / 22 distinct / **0 unclaimed**). The cut stays frozen **L1–L15** at `14.969697`, now measured on **45** files with basis ids `[1 … 15]`. The *consumer* pins (`tests/e2e/helpers/levels.ts`'s `EXPECTED_LEVEL_COUNT`, the `PINS` tables) still read **40** and are **RED by design** — dossiers with `file:line` in §7f, re-booked by **R-007c**; the registry row is **GAME**'s, and the walk-class envelope constant (`tests/e2e/playthrough.spec.ts:373`'s `1_397_000`) is **QA**'s (§7f item 10).
>
> The `par` values below started as manual hypotheses (§2) and are now **solver-verified**; the hand derivations are kept because they explain *why* each number is the floor.

## 0. What is in here

| File | id | grid | walls (A / B) | doors / switches | `par` (solver-verified) | documented lesson |
|---|---|---|---|---|---|---|
| `l001.json` | 1 | 5 × 3 | — / — | — / — | 4 | literacy: tap → move, the world flashes |
| `l002.json` | 2 | 4 × 4 | — / — | — / — | 5 | literacy: the flip happens because I moved |
| `l003.json` | 3 | 5 × 3 | `(3,1)` / — | — / — | 6 | first refusal: a permanent (parity-dead) wall |
| `l004.json` | 4 | 5 × 4 | `(3,1)` / `(2,0)` | — / — | 6 | phantom walk **offered** (3 of 6 shortest routes embed) |
| `l005.json` | 5 | 5 × 4 | `(3,1)`, `(4,0)` / `(4,2)` | — / — | 6 | phantom walk **forced** (3 of 3 shortest routes embed) |
| `l006.json` | 6 | 5 × 3 | — / — | `d1` blue `(3,1)` / `s1` `(1,1)` A → `d1` | 4 | **M1+M3 debut**: the latch on the natural path (block-opening dip) |
| `l007.json` | 7 | 3 × 3 | `(2,0)`, `(2,2)` / — | `d1` blue `(1,1)` / `s1` `(0,0)` A → `d1` | 4 | the detour: I leave the line to change the world |
| `l008.json` | 8 | 5 × 4 | `(4,0)`, `(4,2)` / — | `d1` blue `(3,1)` / `s1` `(2,0)` A → `d1` | 6 | **Aha #1**: the door that refused the greedy line opens |
| `l009.json` | 9 | 5 × 5 | `(2,1)`, `(2,3)`, `(3,0)` / `(2,0)`, `(2,4)` | `d1` red `(2,2)`, `d2` blue `(4,1)` / `s1` `(0,1)` A → `d1`, `s2` `(3,1)` B → `d2` | 8 | two doors + two switches: `s2` sits **behind** `d1` (ordered plan) |
| `l010.json` | 10 | 6 × 4 | `(1,2)` / `(5,0)`, `(5,2)` | `d1` red `(4,1)` / `s1` `(2,3)` B → `d1` | 9 | gate check: permanent M0 geometry + phantom walk + latch, planned together |
| `l011.json` | 11 | 7 × 3 | — / — | `d1` blue `(5,0)` / `s1` `(1,1)` A → `d1` · `p1` `(2,1) ⇄ (4,0)` **activePhase B** | 4 | **M2 debut**: the portal — a channel only alive in one phase; it is on the only par route, and the walking world needs 7 (below OFFERED) |
| `l012.json` | 12 | 7 × 3 | `(1,0)`, `(2,1)` / — | `d1` blue `(5,2)` / `s1` `(4,2)` B → `d1` · `p1` `(0,2) ⇄ (3,2)` **activePhase A** | 4 | **the dip's second beat**: the walking world still solves (7) so the channel is a *shortcut*, and the latch grades par by 2 |
| `l013.json` | 13 | 6 × 4 | `(4,1)`, `(4,3)` / `(4,0)`, `(4,2)` | `d1` blue `(5,1)` / `s1` `(5,2)` B → `d1` · `p1` `(0,1) ⇄ (5,3)` **activePhase A** | 6 | the sealed line: walk-only is **UNSATISFIABLE** — the channel is the only door |
| `l014.json` | 14 | 7 × 4 | `(5,0)`, `(5,2)` / `(5,1)`, `(5,3)` | `d1` blue `(6,2)` / `s1` `(6,1)` B → `d1` · `p1` `(0,1) ⇄ (6,0)` **activePhase A** | 8 | the same law on a longer board: mandatory channel + mandatory latch |
| `l015.json` | 15 | 7 × 5 | `(3,0)`, `(3,2)`, `(3,4)` / `(3,1)`, `(3,3)` | `d1` blue `(5,3)` / `s1` `(5,1)` A → `d1` · `p1` `(0,0) ⇄ (5,0)` **activePhase B** | 10 | **block end**: full coverage (35/35), `D_exec = 14.97 > 13.64` (the frozen §6 clause) |
| `l016.json` | 16 | 7 × 6 | `(4,1)`, `(4,3)`, `(4,5)` / `(4,0)`, `(4,2)`, `(4,4)` | `d1` blue `(6,0)`, `d2` blue `(5,1)` / `s1` `(5,0)` B → `d1`, `s2` `(6,1)` B → `d2` · `p1` `(3,3) ⇄ (6,5)` **activePhase B** | 12 | **the goal-gated latch** (rung 1): both approaches to the goal are doors, so the all-OFF world is **UNSATISFIABLE** |
| `l017.json` | 17 | 7 × 6 | `(4,1)`, `(4,3)`, `(4,5)` / `(4,0)`, `(4,2)`, `(4,4)` | `d1` blue `(6,4)`, `d2` blue `(5,5)` / `s1` `(6,0)` A → `d1`, `s2` `(5,0)` B → `d2` · `p1` `(3,3) ⇄ (5,2)` **activePhase B** | 14 | the latch costs a **real detour**: two plans, the same length |
| `l018.json` | 18 | 7 × 6 | `(3,1)`, `(3,3)`, `(3,5)` / `(3,0)`, `(3,2)`, `(3,4)` | `d1`,`d2`,`d3` blue `(6,0)`, `(5,1)`, `(6,2)` (every neighbour of the goal) / `s1` `(6,3)` B → `d1`, `s2` `(6,5)` B → `d2`, `s3` `(5,0)` B → `d3` · `p1` `(2,5) ⇄ (4,4)` **activePhase A** | 16 | escalation by **shape**: the seal widens 2 → 3 doors |
| `l019.json` | 19 | 7 × 6 | `(3,0)`, `(3,2)`, `(3,4)` / `(3,1)`, `(3,3)`, `(3,5)` | `d1`–`d4` blue `(5,3)`, `(4,4)`, `(6,4)`, `(5,5)` (**all four** neighbours of an interior goal) / `s1`–`s4` `(6,5)`, `(6,3)`, `(4,5)`, `(5,0)` all B · `p1` `(2,5) ⇄ (4,0)` **activePhase A** | 18 | **block end and the ceiling**: arity 3 → 4; the ladder stops here — `par 18` is the device's measured ceiling |
| `l020.json` | 20 | 7 × 6 | `(3,0)`, `(3,2)`, `(3,4)` / `(3,1)`, `(3,3)`, `(3,5)` | `d1` red `(4,1)`, `(5,0)`, `(5,2)`, `(6,3)` (the pocket's single exit) / `d2`–`d5` blue `(4,4)`, `(5,3)`, `(5,5)`, `(6,4)` (the goal's four neighbours) on `s2` `(4,5)`/B, `s3` `(6,5)`/B, `s4` `(4,0)`/A, `s5` `(4,3)`/B · `s1` `(6,0)`/A → `d1` (**inside** the pocket) · `p1` `(2,5) ⇄ (5,1)` **activePhase A** | 20 | **sealed landing** (R-003d, ADR-`design-0004`): the portal hands the player a new start inside a walk-sealed pocket, so the shortest plan is the ordered `land → press s1 → cross d1 → press a seal switch` |
| `l021.json` | 21 | 7 × 6 | `(2,1)`, `(2,3)`, `(2,5)` / `(2,0)`, `(2,2)`, `(2,4)` | three doors, each driven from **inside** the room it seals: `d1` blue `(3,5)`, `(4,4)`, `(5,3)`, `(6,4)` on `s1` `(4,5)`/B · `d2` blue `(4,0)`, `(5,1)`, `(6,2)` on `s2` `(6,3)`/B · `d3` red `(3,2)`, `(4,1)`, `(4,3)`, `(5,2)` (the **goal's** room) on `s3` `(6,0)`/A · `p1` `(0,5) ⇄ (5,5)` **activePhase A** | 17 | **Act II batch 1, the act's OPENING rung**: the portal lands in a sealed pocket, and the goal sits in a *second* sealed room, so the shortest plan is the forced `s1 → d1 → s2 → d2 → s3 → d3` chain |
| `l022.json` | 22 | 7 × 6 | `(2,1)`, `(2,3)`, `(2,5)` / `(2,0)`, `(2,2)`, `(2,4)` | `d1` red `(4,5)`, `(5,4)`, `(6,3)` on `s1` `(6,5)`/B · `d2` red `(3,0)`, `(4,1)`, `(5,2)`, `(6,1)` on `s2` `(3,1)`/A · `d3` blue `(3,3)`, `(4,2)`, `(4,4)`, `(5,3)` on `s3` `(4,0)`/A · `p1` `(1,0) ⇄ (5,5)` **activePhase A** | 18 | batch rung 2: the same three-room device on the other skeleton, one press longer |
| `l023.json` | 23 | 7 × 6 | `(2,1)`, `(2,3)`, `(2,5)` / `(2,0)`, `(2,2)`, `(2,4)` | `d1` red `(4,5)`, `(5,4)`, `(6,3)` on `s1` `(5,5)`/A · `d2` red `(3,0)`, `(4,1)`, `(5,2)`, `(6,1)` on `s2` `(6,2)`/A · `d3` blue `(3,3)`, `(4,2)`, `(4,4)`, `(5,3)` on `s3` `(4,0)`/A · `p1` `(0,5) ⇄ (6,4)` **activePhase A** | 20 | batch rung 3: `Δpar` +2 — the first two-step rung of the act |
| `l024.json` | 24 | 7 × 6 | `(2,1)`, `(2,3)`, `(2,5)` / `(2,0)`, `(2,2)`, `(2,4)` | `d1` blue `(3,5)`, `(4,4)`, `(5,3)`, `(6,4)` on `s1` `(4,5)`/B · `d2` blue `(4,0)`, `(5,1)`, `(6,2)` on `s2` `(3,1)`/A · `d3` red `(3,2)`, `(4,1)`, `(4,3)`, `(5,2)` on `s3` `(5,0)`/B · `p1` `(1,5) ⇄ (5,4)` **activePhase B** | 21 | batch rung 4: the batch's **width** peak — 90 shortest routes, every one of them executing the forced order |
| `l025.json` | 25 | 7 × 6 | `(2,1)`, `(2,3)`, `(2,5)` / `(2,0)`, `(2,2)`, `(2,4)` | `d1` blue `(3,5)`, `(4,4)`, `(5,3)`, `(6,4)` on `s1` `(6,5)`/B · `d2` blue `(4,0)`, `(5,1)`, `(6,2)` on `s2` `(3,1)`/A · `d3` red `(3,2)`, `(4,1)`, `(4,3)`, `(5,2)` on `s3` `(5,0)`/B · `p1` `(1,5) ⇄ (4,5)` **activePhase B** | 23 | **the act's PEAK**: the rung that discharges §7.3's across-act clause for the whole act — the obligation rides on the maximum, never on every member |
| `l026.json` | 26 | 7 × 6 | `(2,1)`, `(2,3)`, `(2,5)` / `(2,0)`, `(2,2)`, `(2,4)` | **four** doors: `d1` red `(4,5)`, `(5,4)`, `(6,3)` on `s1` `(6,5)`/B · `d2` blue `(3,3)`, `(4,2)`, `(4,4)`, `(5,3)` on `s2` `(3,4)`/B · `d3` blue `(5,1)`, `(6,0)`, `(6,2)` on `s3` `(4,3)`/B · `d4` red `(3,0)`, `(4,1)`, `(5,0)` on `s4` `(6,1)`/B · `p1` `(1,0) ⇄ (5,5)` **activePhase A** | 17 | **Act II batch 2, rung 1 — the labelled SEAM rung**: it lands **−6.044410 below** L25 (§7.3.1 instance 2, relief named at registration, never a silent dip) and opens the four-door device on the `(2,*)` skeleton |
| `l027.json` | 27 | 7 × 6 | `(2,1)`, `(2,3)`, `(2,5)` / `(2,0)`, `(2,2)`, `(2,4)` | `d1` red `(4,5)`, `(5,4)`, `(6,3)` on `s1` `(6,4)`/A · `d2` blue `(3,3)`, `(4,2)`, `(4,4)`, `(5,3)` on `s2` `(3,4)`/B · `d3` red `(3,0)`, `(4,1)`, `(5,0)` on `s3` `(4,3)`/B · `d4` blue `(5,1)`, `(6,0)`, `(6,2)` on `s4` `(4,0)`/A · `p1` `(1,0) ⇄ (5,5)` **activePhase A** | 18 | batch rung 2: the same four-door device, par +1 — all-OFF **UNSATISFIABLE**, so as in batch 1 the latch carries *existence* |
| `l028.json` | 28 | 7 × 6 | `(2,1)`, `(2,3)`, `(2,5)` / `(2,0)`, `(2,2)`, `(2,4)` | `d1` red `(4,5)`, `(5,4)`, `(6,3)` on `s1` `(6,5)`/B · `d2` blue `(3,3)`, `(4,2)`, `(4,4)`, `(5,3)` on `s2` `(3,4)`/B · `d3` red `(3,0)`, `(4,1)`, `(5,0)` on `s3` `(4,3)`/B · `d4` blue `(5,1)`, `(6,0)`, `(6,2)` on `s4` `(4,0)`/A · `p1` `(0,5) ⇄ (5,5)` **activePhase A** | 20 | batch rung 3: `Δpar` +2 — the batch's two-step rung |
| `l029.json` | 29 | 7 × 6 | `(2,1)`, `(2,3)`, `(2,5)` / `(2,0)`, `(2,2)`, `(2,4)` | `d1` blue `(4,0)`, `(5,1)`, `(6,2)` on `s1` `(6,0)`/A · `d2` red `(3,2)`, `(4,1)`, `(4,3)`, `(5,2)` on `s2` `(3,1)`/A · `d3` blue `(3,5)`, `(4,4)`, `(5,5)` on `s3` `(4,2)`/A · `d4` red `(5,4)`, `(6,3)`, `(6,5)` on `s4` `(4,5)`/B · `p1` `(1,5) ⇄ (5,0)` **activePhase B** | 21 | batch rung 4: the batch's **route-width** rung — 72 shortest routes, every one of them executing the forced order |
| `l030.json` | 30 | 7 × 6 | `(2,1)`, `(2,3)`, `(2,5)` / `(2,0)`, `(2,2)`, `(2,4)` | `d1` blue `(4,0)`, `(5,1)`, `(6,2)` on `s1` `(6,1)`/B · `d2` red `(3,2)`, `(4,1)`, `(4,3)`, `(5,2)` on `s2` `(3,3)`/A · `d3` blue `(3,5)`, `(4,4)`, `(5,5)` on `s3` `(4,2)`/A · `d4` red `(5,4)`, `(6,3)`, `(6,5)` on `s4` `(4,5)`/B · `p1` `(0,5) ⇄ (6,0)` **activePhase A** | 23 | **the batch-2 peak** (`D_exec` 27.566265) — the rung §7.3's across-act clause rode on while batch 3 was still a shelf candidate |
| `l031.json` | 31 | 7 × 6 | `(1,0)`, `(1,2)`, `(1,4)` / `(1,1)`, `(1,3)`, `(1,5)` | **five** doors on a **new skeleton**: `d1` blue `(4,0)`, `(5,1)`, `(6,2)` on `s1` `(6,0)`/A · `d2` red `(2,1)`, `(3,0)`, `(3,2)`, `(4,1)` on `s2` `(5,2)`/B · `d3` blue `(3,3)`, `(4,2)`, `(4,4)`, `(5,3)` on `s3` `(3,1)`/A · `d4` blue `(5,5)`, `(6,4)` on `s4` `(4,3)`/B · `d5` red `(2,5)`, `(3,4)`, `(4,5)` on `s5` `(6,5)`/B · `p1` `(0,2) ⇄ (5,0)` **activePhase B** | 19 | **Act II batch 3, rung 1 — the second labelled SEAM rung**: a new skeleton (`x = 1` walls, arity 5) that lands **−4.362098** below L30 (§7.3.1 instance 3, band `[19.75, 29.0625]` printed `[19.75, 29.06]`) |
| `l032.json` | 32 | 7 × 6 | `(1,0)`, `(1,2)`, `(1,4)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` blue `(4,0)`, `(5,1)`, `(6,2)` on `s1` `(5,0)`/B · `d2` blue `(3,3)`, `(4,2)`, `(4,4)`, `(5,3)` on `s2` `(6,3)`/B · `d3` red `(2,1)`, `(3,0)`, `(3,2)`, `(4,1)` on `s3` `(4,3)`/B · `d4` red `(2,5)`, `(3,4)`, `(4,5)` on `s4` `(3,1)`/A · `d5` blue `(5,5)`, `(6,4)` on `s5` `(3,5)`/A · `p1` `(0,5) ⇄ (6,0)` **activePhase A** | 22 | batch rung 2: the five-door device on the `(1,*)` skeleton, `Δpar` +2 — the batch's **narrowest** route set (6 shortest routes) |
| `l033.json` | 33 | 7 × 6 | `(1,0)`, `(1,2)`, `(1,4)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` blue `(4,0)`, `(5,1)`, `(6,2)` on `s1` `(6,1)`/B · `d2` blue `(2,2)`, `(3,1)`, `(3,3)`, `(4,2)` on `s2` `(3,0)`/B · `d3` red `(4,3)`, `(5,2)`, `(5,4)`, `(6,3)` on `s3` `(3,2)`/B · `d4` red `(2,5)`, `(3,4)`, `(4,5)` on `s4` `(5,3)`/A · `d5` blue `(5,5)`, `(6,4)` on `s5` `(3,5)`/A · `p1` `(0,5) ⇄ (6,0)` **activePhase A** | 22 | batch rung 3: the **shallow tooth** of the sawtooth — a 3-wide step that rises in band by only **+0.019191** (par flat, so the rise is all branching) |
| `l034.json` | 34 | 7 × 6 | `(1,0)`, `(1,2)`, `(1,4)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` blue `(4,0)`, `(5,1)`, `(6,2)` on `s1` `(6,1)`/B · `d2` red `(4,3)`, `(5,2)`, `(5,4)`, `(6,3)` on `s2` `(3,0)`/B · `d3` blue `(5,5)`, `(6,4)` on `s3` `(5,3)`/A · `d4` red `(2,5)`, `(3,4)`, `(4,5)` on `s4` `(6,5)`/B · `d5` blue `(2,2)`, `(3,1)`, `(3,3)`, `(4,2)` on `s5` `(3,5)`/A · `p1` `(0,5) ⇄ (6,0)` **activePhase A** | 24 | batch rung 4: `Δpar` +2 and the batch's **deepest** rung (`maxDepth` 42) — the last step before the act tail |
| `l035.json` | 35 | 7 × 6 | `(1,0)`, `(1,2)`, `(1,4)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` blue `(4,0)`, `(5,1)`, `(6,2)` on `s1` `(5,0)`/B · `d2` red `(4,3)`, `(5,2)`, `(5,4)`, `(6,3)` on `s2` `(4,1)`/B · `d3` red `(2,5)`, `(3,4)`, `(4,5)` on `s3` `(5,3)`/A · `d4` blue `(5,5)`, `(6,4)` on `s4` `(3,5)`/A · `d5` blue `(2,2)`, `(3,1)`, `(3,3)`, `(4,2)` on `s5` `(6,5)`/B · `p1` `(0,4) ⇄ (6,1)` **activePhase B** | 24 | **the act's NEW REGISTERED TAIL**: `D_exec` **28.339426** at par 24 (160 shortest routes) — it lifts the act maximum off L30 by the measured **+0.734775** and leaves **0.723074** headroom to the derived-exact ceiling 29.0625 (§7.9) |
| `l036.json` | 36 | 7 × 7 | `(1,0)`, `(1,2)`, `(1,4)`, `(1,6)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` blue `(2,0)`, `(3,1)`, `(4,2)`, `(5,1)`, `(6,0)` on `s1` `(3,0)`/B · `d2` red `(5,2)`, `(6,1)`, `(6,3)` on `s2` `(5,3)`/A · `d3` blue `(5,5)`, `(6,4)`, `(6,6)` on `s3` `(6,2)`/A · `d4` red `(3,6)`, `(4,5)`, `(5,6)` on `s4` `(6,5)`/B · `d5` blue `(2,4)`, `(3,3)`, `(3,5)`, `(4,4)` on `s5` `(4,6)`/A · `p1` `(0,1) ⇄ (4,0)` **activePhase A** | 18 | **Act II batch 4, rung 1 — the FOURTH §7.3.1 instance (third `batch-seam`)**: the closing batch opens **−6.038144 below** L35 on §7.4's **second, unused frame** (`7×7`, `CX = 1`), with a **derived** (P2-exact) ladder so its opening rung is par 18 where L35 sat at the act ceiling (§2h) |
| `l037.json` | 37 | 7 × 7 | `(1,0)`, `(1,2)`, `(1,4)`, `(1,6)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` red `(3,0)`, `(4,1)`, `(5,2)`, `(6,1)` on `s1` `(5,0)`/B · `d2` blue `(2,2)`, `(3,1)`, `(3,3)`, `(4,2)` on `s2` `(2,1)`/B · `d3` blue `(5,3)`, `(6,2)`, `(6,4)` on `s3` `(3,2)`/B · `d4` red `(3,4)`, `(4,3)`, `(4,5)`, `(5,4)` on `s4` `(6,3)`/B · `d5` blue `(2,6)`, `(3,5)`, `(4,6)` on `s5` `(4,4)`/A · `p1` `(0,1) ⇄ (4,0)` **activePhase A** | 20 | batch rung 2: the batch's clean unit step — `Δpar` +2 buys `ΔD_exec` **+1.950892** on the same five-door / forced 5-press device |
| `l038.json` | 38 | 7 × 7 | `(1,0)`, `(1,2)`, `(1,4)`, `(1,6)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` red `(3,0)`, `(4,1)`, `(5,2)`, `(6,1)` on `s1` `(5,1)`/A · `d2` blue `(2,2)`, `(3,1)`, `(3,3)`, `(4,2)` on `s2` `(2,1)`/B · `d3` red `(2,5)`, `(3,4)`, `(3,6)`, `(4,5)` on `s3` `(3,2)`/B · `d4` red `(5,4)`, `(6,3)`, `(6,5)` on `s4` `(3,5)`/A · `d5` blue `(4,6)`, `(5,5)`, `(6,6)` on `s5` `(6,4)`/A · `p1` `(0,1) ⇄ (4,0)` **activePhase A** | 22 | batch rung 3: `Δpar` +2 buys **+1.947826**, and its **48** shortest routes **all** execute the shared 5-press order (`B` exactly 1.4000 here) |
| `l039.json` | 39 | 7 × 7 | `(1,0)`, `(1,2)`, `(1,4)`, `(1,6)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` blue `(2,0)`, `(3,1)`, `(4,2)`, `(5,1)`, `(6,0)` on `s1` `(4,1)`/B · `d2` red `(5,2)`, `(6,1)`, `(6,3)` on `s2` `(3,2)`/B · `d3` blue `(2,4)`, `(3,3)`, `(3,5)`, `(4,4)` on `s3` `(6,2)`/A · `d4` red `(3,6)`, `(4,5)`, `(5,6)` on `s4` `(3,4)`/B · `d5` blue `(5,5)`, `(6,4)`, `(6,6)` on `s5` `(4,6)`/A · `p1` `(0,6) ⇄ (3,0)` **activePhase B** | 24 | batch rung 4: the par-24 rung that supplies that par's registered **MINIMUM** `28.185897` — it sits **0.153529 below** the R-005a tail, so the act maximum did not move in the batch's interior, only at its closing rung (162/162 press-then-cross) |
| `l040.json` | 40 | 7 × 7 | `(1,0)`, `(1,2)`, `(1,4)`, `(1,6)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` blue `(2,0)`, `(3,1)`, `(4,2)`, `(5,1)`, `(6,0)` on `s1` `(4,0)`/A · `d2` red `(5,2)`, `(6,1)`, `(6,3)` on `s2` `(2,1)`/B · `d3` blue `(2,6)`, `(3,5)`, `(4,6)` on `s3` `(6,2)`/A · `d4` red `(5,6)`, `(6,5)` on `s4` `(3,6)`/B · `d5` blue `(4,4)`, `(5,3)`, `(5,5)`, `(6,4)` on `s5` `(6,6)`/A · `p1` `(0,2) ⇄ (3,0)` **activePhase B** | 24 | **the act's REGISTERED TAIL after R-006a**: the within-par **maximum** `D_exec` **28.455319** at par 24 — **+0.115893** over the R-005a tail it supersedes, **+3.725907** over Act I's registered peak, **0.607181** of derived-exact headroom under the ceiling 29.0625 (§7.9). §7.3.2's act-close stays **discharged at L35**; this batch registers a *reading*, not a new peak (§2h) |
| `l041.json` | 41 | 7 × 7 | `(1,0)`, `(1,2)`, `(1,4)`, `(1,6)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` red `(3,0)`, `(4,1)`, `(5,2)`, `(6,1)` on `s1` `(5,0)`/B · `d2` blue `(2,2)`, `(3,1)`, `(3,3)`, `(4,2)` on `s2` `(2,1)`/B · `d3` red `(2,5)`, `(3,4)`, `(3,6)`, `(4,5)` on `s3` `(3,2)`/B · `d4` blue `(4,6)`, `(5,5)`, `(6,6)` on `s4` `(3,5)`/A · `d5` blue `(5,3)`, `(6,2)`, `(6,4)` on `s5` `(5,6)`/B · `p1` `(0,1)` ⇄ `(4,0)` **activePhase A** | 20 | **Act III batch 1, rung 1 — the FIRST ACT BOUNDARY, and the rung §7.3.1 instance 5's `act-open` relief names** (§2i): GD-012's opener enters at the opener rule's **floor** `par 20`, **−4.197990** under Act II's registered tail — a value **filled in against the published bound *before* the bytes existed** (BOUND `b28ed97` → fill-in `db78a13` → bytes `568c136`, 34 min 7 s apart); the same 4-pocket / 5-door / forced 5-press chain as batch 4 runs on the proven `7×7`@`CX = 1` frame, with `ΔM = 0` — Act III adds **no** mechanic unit (§7.10.5) |
| `l042.json` | 42 | 7 × 7 | `(1,0)`, `(1,2)`, `(1,4)`, `(1,6)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` red `(3,0)`, `(4,1)`, `(5,2)`, `(6,1)` on `s1` `(5,0)`/B · `d2` blue `(2,2)`, `(3,1)`, `(3,3)`, `(4,2)` on `s2` `(2,1)`/B · `d3` blue `(5,3)`, `(6,2)`, `(6,4)` on `s3` `(3,2)`/B · `d4` red `(2,5)`, `(3,4)`, `(3,6)`, `(4,5)` on `s4` `(6,3)`/B · `d5` blue `(4,6)`, `(5,5)`, `(6,6)` on `s5` `(3,5)`/A · `p1` `(0,1)` ⇄ `(4,0)` **activePhase A** | 22 | batch rung 2: O1/O2's clean unit step — `Δpar` +2 buys **+1.981444** on the same device, and this is the batch's **widest** route set (**336** shortest routes, every one of them press-then-cross); §7.3.1 owes **no** interior label, because §7.3.1 names **seams**, not steps |
| `l043.json` | 43 | 7 × 7 | `(1,0)`, `(1,2)`, `(1,4)`, `(1,6)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` blue `(2,0)`, `(3,1)`, `(4,2)`, `(5,1)`, `(6,0)` on `s1` `(4,0)`/A · `d2` red `(5,2)`, `(6,1)`, `(6,3)` on `s2` `(2,1)`/B · `d3` blue `(4,4)`, `(5,3)`, `(5,5)`, `(6,4)` on `s3` `(6,2)`/A · `d4` red `(2,3)`, `(3,2)`, `(3,4)`, `(4,3)` on `s4` `(5,4)`/B · `d5` blue `(2,6)`, `(3,5)`, `(4,6)` on `s5` `(3,3)`/A · `p1` `(0,6)` ⇄ `(3,0)` **activePhase B** | 24 | batch rung 3: `Δpar` +2 buys **+1.975043**, and the batch's **narrowest** route set (**27** shortest routes, tied with L44); it is the only Act III rung whose `D_exec` `28.213816` sits **below** Act II's registered tail (`−0.241503`) — printed, never smoothed |
| `l044.json` | 44 | 7 × 7 | `(1,0)`, `(1,2)`, `(1,4)`, `(1,6)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` blue `(2,0)`, `(3,1)`, `(4,2)`, `(5,1)`, `(6,0)` on `s1` `(4,0)`/A · `d2` red `(5,2)`, `(6,1)`, `(6,3)` on `s2` `(2,1)`/B · `d3` blue `(5,5)`, `(6,4)`, `(6,6)` on `s3` `(6,2)`/A · `d4` red `(2,3)`, `(3,2)`, `(3,4)`, `(4,3)` on `s4` `(6,5)`/B · `d5` blue `(2,6)`, `(3,5)`, `(4,6)` on `s5` `(3,3)`/A · `p1` `(0,6)` ⇄ `(3,0)` **activePhase B** | 26 | batch rung 4: the act's **new axis** (`par 26`, carried by no earlier rung) and the first Act III rung **above** Act II's registered tail (`+1.769897`), with the batch's deepest search (`maxDepth` **47**); the step reads `Δpar` +2 / `ΔD_exec` **+2.011400** |
| `l045.json` | 45 | 7 × 7 | `(1,0)`, `(1,2)`, `(1,4)`, `(1,6)` / `(1,1)`, `(1,3)`, `(1,5)` | `d1` blue `(2,0)`, `(3,1)`, `(4,2)`, `(5,1)`, `(6,0)` on `s1` `(4,0)`/A · `d2` red `(5,2)`, `(6,1)`, `(6,3)` on `s2` `(2,1)`/B · `d3` blue `(2,6)`, `(3,5)`, `(4,6)` on `s3` `(6,2)`/A · `d4` red `(5,6)`, `(6,5)` on `s4` `(3,6)`/B · `d5` blue `(4,4)`, `(5,3)`, `(5,5)`, `(6,4)` on `s5` `(6,6)`/A · `p1` `(0,4)` ⇄ `(3,0)` **activePhase B** | 26 | **the act's REGISTERED TAIL after R-007, and the rung §7.3's across-act clause rides on**: the within-par **maximum** `D_exec` **30.455319** at par 26 — **+2.000000** over Act II's registered tail, **+5.725907** over Act I's registered peak, **2.607181** of derived-exact headroom under Act III's ceiling `33.0625` (§7.9). §7.3.2's `act-close` carrier is `L51–L60`, so this opener **owes no peak** and registers a *reading*, not a new obligation (§2i) |

**The shelf is EMPTY — every proven rung has graduated to the root.** `candidates/l020.json` became `l020.json` at R-003d and `candidates/l021.json`…`l025.json` became `l021.json`…`l025.json` at R-004a and `candidates/l026.json`…`l035.json` became `l026.json`…`l035.json` at R-005a and `candidates/l036.json`…`l040.json` became `l036.json`…`l040.json` at **R-006a** and `candidates/l041.json`…`l045.json` became `l041.json`…`l045.json` at **R-007**, each by `git mv` with the blob and `sha256` unchanged on both sides, so there is no longer any row that sits *beside* the table: `src/levels/candidates/` holds its `README.md` and nothing else. The shelf's own prose (which candidate each rung came from, which interview refused it, and where each booking literal stood) is kept in `src/levels/candidates/README.md` and in the registration sections §2e-5 (L20), §2f (L21–L25), §2g (L26–L35), §2h (L36–L40) and §2i (L41–L45). The shelf is **UNBOOKED**: this ticket names **no** next batch, and the successor name `l046.json` is absent from the root *and* from the shelf **by reading both directories**, so the emptiness is a measurement rather than an expectation.

### 0b. Measured solver facts (2026-10-15, LV-006 · obligations re-pinned by LV-007A)

`node_modules/.bin/tsx scripts/solve-levels.ts` prints these per run; `docs/level-difficulty.md` §5.1 holds the full table. (The rows are the LV-006 record for the L6–L11 unit — §0b intentionally stops there; **L12–L45 are not appended** because §2d/§2e/§2e-5/§2f/§2g/§2h/§2i carry their measured read-out on the registered bytes and `docs/level-difficulty.md` §5.2 their model rows.)

| id | shortest | reachable states | `refusedThenEnteredTiles` | `dualPhaseTiles` | `parRoutes` / `embedRoutes` | switch required | Aha gates |
|---|---|---|---|---|---|---|---|
| 6 | 4 | 29 | 1 `[3,1]` | 0 | 1 / 1 | **no** (dip: un-switched world solves in 6 — documented `switchRequired: "exempt"`) | — |
| 7 | 4 | 12 | 1 `[1,1]` | 0 | 2 / 2 | yes (**obligation**) | — |
| 8 | 6 | 34 | 1 `[3,1]` | 0 | 6 / 6 | yes (**obligation**) | (i)(ii)(iii) PASS · (iv) UNSATISFIABLE before L11 · (v)(vi) PASS (§4) |
| 9 | 8 | 58 | 2 `[2,2] [4,1]` | 0 | 2 / 2 | yes (**obligation**) | — |
| 10 | 9 | 42 | 1 `[4,1]` | 0 | 36 / 36 | yes (**obligation**) | — |
| 11 | 4 | 82 | 1 `[5,0]` | **21** | 1 / 1 | **no** (`"exempt"` row: the walking world solves in 7, so the portal is the shortcut and the latch is on the route — but not demanded) | portal suite, 8/8 PASS (§2c) |
| 12 | 4 | 78 | 3 `[1,0] [2,1] [5,2]` | **19** | 1 / 1 | **no** (`"exempt"` block row: G1 grades par, +2 in the all-OFF world — the latch buys speed, the channel carries existence) | block suite, 4/4 PASS (§2d) |
| 13 | 6 | 79 | 5 `[4,0] [4,1] [4,2] [4,3] [5,1]` | **16** | 3 / 3 | **no** (`"exempt"`; G1 = +2) | block suite, 4/4 PASS (§2d) |
| 14 | 8 | 95 | 5 `[5,0] [5,1] [5,2] [5,3] [6,2]` | **20** | 10 / 10 | **no** (`"exempt"`; G1 = +2) | block suite, 4/4 PASS (§2d) |
| 15 | 10 | 99 | 6 `[3,0] [3,1] [3,2] [3,3] [3,4] [5,3]` | **15** | 15 / 15 | **no** (`"exempt"`; G1 = +2) | block suite, 4/4 PASS (§2d) |

- **The `switch required` column is an obligation, not a note** (LV-007A, OQ4 ruling): `@/core/solver/policy` reads it from the lesson row (`DOCUMENTED_LESSONS[].switchRequired`) and rejects a level documented as a load-bearing latch whose goal is still reachable with every switch OFF — code `lesson-switch-required`. **L6 and L11–L15 are the only levels exempt** (explicit `"exempt"` rows backed by the §6 dip / §2c / §2d below, with the measured `allOffGoalReachable = true` on all of them); the **L16–L19 seal block is the first latch block that ships `"required"`** (§2e), because its all-OFF subgraph contains no goal state at all (`allOffGoalReachable = false`, `allOffShortestSolution = null` on 4/4), and the check never reads a level id, so relabelling L6's board as L7 is rejected while the shipped `l006.json` stays clean. For the block the exemption is *named in the law* (ADR-design-0003 §5): its substitute teeth are G1 (`all-OFF` is exactly 2 moves slower, 4/4 measured), G2 (every par route presses the switch and crosses the door it drives) and G3 (the refusal is orderable) — par-grade teeth, never existence. **The seal block (L16–L20), all fifteen Act II rungs (L21–L40) and Act III batch 1's five rungs (L41–L45) are the blocks that ship `"required"`** — their all-OFF worlds are **UNSATISFIABLE** (no goal state at all: seal rungs 4/4 + the sealed landing, and the act's fifteen rungs **and Act III batch 1's five rungs**, `allOffGoalReachable = false` on **20/20**, with the subgraph measured at 16/258 · 15/250 · 15/250 · 16/258 · 15/250 (batch 1) · 15/498 ×5 (batch 2) · 9/720 · 9/740 · 9/766 · 9/772 · 9/766 (batch 3) · **11/936 · 11/920 · 11/920 · 11/936 · 11/940 (batch 4)** · **11/921 · 11/913 · 11/912 · 11/928 · 11/940 (Act III batch 1, L41–L45)** states) — so on those rungs the latch carries **existence**, and the exemption's named substitute teeth (G1/G2/G3) are not what is holding the column up.

- **L11 satisfies the one gate that was unsatisfiable before it.** `dualPhaseTiles = 21` — every one of the board's 21 tiles is enterable in both phases, because the opposite-colour pair `(2,1) ⇄ (4,0)` makes a teleport the only displacement source that does not consume a move (`refusedThenEnteredTiles = 1` too: the door tile `(5,0)` answers differently because of history). The `dual-phase-tiles` gate, reported as `UNSATISFIABLE` on `l008` since LV-007A, is now **PASS** with a measured proof — and it is the *first* level for which that gate could be satisfied (LV-009-B's block continues the column at 19/16/20/15 tiles, and R-003c's seal rungs at 24/24/18/18), so the L11 scheduling of M2 is no longer a plan but a measurement (§2c, §2d, §2e, ADR-0009).

- **Four more lines per level since LV-007B/007C** (§0b's table intentionally stays the LV-006 facts; these are the new program outputs):
  - `routeWalk=<dfs> + <lookahead> work units (budget=…) prunedChildren=…` — the cost of enumerating *every* shortest route, on the walk's **own** budget key (`maxRouteVisits`, default 2 000 000). Before LV-007B item 1 the walk read the *exploration* cap (`maxStates`), so raising the state limit silently changed route enumeration; an overrun now raises instead of silently truncating the route set. See `docs/ai-native-pipeline.md` §8.7.
  - `refusedBeforeEnteredTiles=… tiles=[…]` — the **ordered** companion of the `refusedThenEnteredTiles` column above (same tile refused strictly before it is accepted, on one real path). It is the reader of **gate (iii)** since **LV-007C** (the code half of GD-008's re-wording of `docs/level-design.md` §3 (iii): the Aha's own sentence is ordered — "refused *first*, entered *later*"), where a trapped refusal — `refusedThenEnteredTiles > 0` but `refusedBeforeEnteredTiles = 0`, a beat no player can witness — is now rejected by name (`gate-refused-then-entered`, control: `tests/solver/policy-negative-controls.test.ts`). The `lesson-latch-dynamism` check and the pre-L11 acceptance law still read the *unordered* canonical metric (ADR-architecture-0002 decision 4 / Appendix A3; `docs/ai-native-pipeline.md` §8.5) — the two legs of the split are deliberately **not** re-stitched. On L6–L10 both forms report the same tile lists, so the switch moves no verdict on this set.
  - `difficulty D=… = 1·L + 3·B + 4·T + 2·R + 5·M` + `difficultyDiagnostics …` + `difficultyExec Dexec=… = D − 5·M = 1·L + 3·B + 4·T + 2·R` — the `docs/level-difficulty.md` §2 model with its **provisional** weights (printed next to the number on purpose) and its **execution axis** (§2b, ADR-design-0001 — the axis `docs/level-design.md` §6's dip law lives on), printed in both forms so the identity is checked by the reader. Inside `docs/level-design.md` §4 the `4·T` and `2·R` terms are provably 0 on every shipped level, so `Dexec = L + 3·B` there.

- **Validation is proven** for all forty-five: `npm run levels` (`node_modules/.bin/tsx scripts/validate-levels.ts`) → `45/45 level files ok · 0 errors · 218 warnings (0 multi-switch-door)`, exit code 0 (negative self-tests **11/11** rejected by name, plus the warning probes). The warning count is derived, not typed: 40 boards read `183`, and the five new boards add **+35** — **7 per board** (`l041`–`l045` each read `warnings=7` on `walls=7`: every phase wall of the `7×7` frame is a checkerboard-parity-dead wall, i.e. the `phaseAWalls[i] … can never be entered on any move count` warning — **legal geometry, not a defect**, exactly as the L3–L5 rungs already read it; `0` of the 218 are `multi-switch-door`) — quoted as a delta rather than smoothed.
- **Solvability, `par` and the level policy are proven** for all forty-five: `node_modules/.bin/tsx scripts/solve-levels.ts --audit` → `45/45 level file(s) PASS · par verified from the solver on 45/45`, `RESULT: PASS` (plus one ESCALATION — `l008`'s `dual-phase-tiles`, §4/§2c; refusals are reported, never repaired).
- The hand derivations in §2 (L1–L5, written before the solver existed), §2b (L6–L10), §2c (L11) and §2d (L12–L15) are kept as the *reason* each `par` is the floor. Where a hand derivation and the solver disagreed, the level file was re-authored — never the number.
- Supplementary, *informal* evidence (kept deliberately **out of the repo**): the original throwaway BFS that first agreed with all five L1–L5 `par` values (4 / 5 / 6 / 6 / 6). It has been superseded by `scripts/solve-levels.ts`, which is the deliverable and the evidence.

## 1. Running the gate

```bash
node_modules/.bin/tsx scripts/validate-levels.ts      # schema/rule gate + 10 negative self-tests
node_modules/.bin/tsx scripts/solve-levels.ts         # BFS: solvable, par, dead states, metrics, policy, gates
node_modules/.bin/tsx scripts/author-lv006-candidates.ts   # L6-L10 families: accept/reject + negative probes
node_modules/.bin/tsx scripts/author-l11-candidates.ts     # L11 (M2 debut) family: accept/reject + negative probes
node_modules/.bin/tsx scripts/author-l20.ts --stage=p --pocketsize=8      # LV-011 stage P: pocket class census
node_modules/.bin/tsx scripts/author-l20.ts --stage=sl --pocketsize=8     # LV-011 stage SL: sealed-landing lattice (add --write to land the accept)
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l020.json --rung=20   # the rung-≥20 gate chain (g1–g5) + controls
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=21,22,23,24,25 --dir=src/levels   # R-004a: the REGISTERED act batch re-proven from the root
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30,31,32,33,34,35 --dir=src/levels   # R-005a: batches 2+3 re-proven from the root (10/10 ACCEPT, 13/13 controls per rung)
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=36,37,38,39,40 --dir=src/levels   # R-006a: batch 4 re-proven from the root (5/5 ACCEPT, 13/13 controls per rung)
node_modules/.bin/tsx scripts/prove-candidate.ts --family=g --ladder=36,37,38,39,40 --dir=src/levels --peak=28.7589095   # R-006a falsification: exit 1 — exactly one FAIL on exactly L40 (act-peak), §2h/§7e
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels   # R-007: Act III batch 1 re-proven from the ROOT (5/5 ACCEPT, 13/13 controls per rung, 65/65 named)
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels --peak=31.7589095   # R-007 falsification: exit 1 — `GATES: REJECT — act-peak`, exactly one FAIL on exactly L45, 4/5 ACCEPT, §2i/§7f
node_modules/.bin/tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels/candidates   # the empty-shelf probe: exit 1 (the shelf holds no level file at all)
node_modules/.bin/tsx scripts/attest-r004a-act2.ts    # R-004a: byte identity + ladder + the §7.3 tail law + its control battery (exit 0)
node_modules/.bin/tsx scripts/attest-r005a-reg35.ts   # R-005a: byte identity + both ladders + the act tail/seam law + its control battery (exit 0)
node_modules/.bin/tsx scripts/attest-r006a-reg40.ts   # R-006a: byte identity (5/5 vs e30bbaccf) + the batch-4 ladder + the act-tail 16-clause set + its control battery (exit 0)
node_modules/.bin/tsx scripts/attest-r007-reg45.ts    # R-007: byte identity (5/5 vs 82dd808) + the Act III ladder + the act-boundary tail law + the 22-clause partition + its control battery (exit 0)
node_modules/.bin/tsx scripts/attest-lv010-block.ts   # R-003c/R-003d: the L16–L20 block re-attestation (exit 0; census reads 45 files)
node_modules/.bin/tsx scripts/validate-levels.ts <other-levels-dir>   # or LEVELS_DIR=…
```

`tsx` is a dev dependency of this workspace (`package.json`), so both gates run without a build step. `scripts/validate-levels.ts` additionally documents that it can run under Node's native type stripping. Exit code is **non-zero** if any level fails, if a negative self-test is wrongly accepted, or if two level files share an `id`. Failing levels are **rejected, never auto-repaired** (ADR-0004). `scripts/solve-levels.ts` also exits non-zero on a policy violation (`@/core/solver/policy` — the inventory is `POLICY_VIOLATION_CODES`, with one negative control per code in `tests/solver/policy-negative-controls.test.ts`: disabling any one check turns the suite RED), on a `par` mismatch, on a dead/unrecoverable state, or on a FAILing named gate; a gate that is *unsatisfiable as written* (only `dual-phase-tiles`, before L11 — pinned as the single legitimate escalation channel) is printed under ESCALATIONS (§4) instead of being counted as a pass.

The policy layer checks both content laws and the ladder's documented lessons, including the **`switchRequired` obligation on L7–L10** (`lesson-switch-required`), the **§3 Aha construction bullets** as named gates (v) `single-door-one-switch-funnel` and (vi) `aha-par-cap`, and — since **LV-008** — the **M2 debut suite** for `l011` (`portal-pair-single-opposite-colour`, `portal-crossing-on-every-par-route`, `portal-par-cap`, `portal-teaching-grade-below-offered`, `portal-seam-law-execution-axis`, on top of the reused `dual-phase-tiles`, the shared `shortest-solution-presses-switch-and-crosses-door` and the ordered `refused-then-entered`); `docs/ai-native-pipeline.md` §8.3–§8.5 and §8.8 are the record. Because **M1 never ships alone**, the mirror is enforced here too: a `switches[]` entry with an empty `targets` list is rejected as `switch-without-targets` (LV-007B n-13). Such a switch really *does* toggle — `applyMove` flips `switchesOn` regardless of targets — so the firing check cannot see it; what is wrong is that no door reads it. The frozen validator only **warns** about that shape, and a warning is not a gate (`src/core/level/**` is the schema layer and was deliberately not touched).

## 2. Per-level manual derivation (hypothesis, for SOLVER-001 to falsify)

Rules used below (ADR-0008, Option B): a move is legal iff the destination is in bounds and non-solid **in the current phase at entry**; an illegal move changes nothing (no movement, **no flip**); after a legal move the phase flips; the goal is won on arrival regardless of phase.

Two derived facts I use throughout (proved in §3):

- **F1 — arrival parity.** With `startPhase = "A"`, move *n* is played in phase **A if n is odd, B if n is even**.
- **F2 — enterability is route-independent.** Arrival at tile `c` always happens on a move number `n ≡ d(c) (mod 2)`, where `d(c)` is the Manhattan distance from `player`. Therefore a `phaseAWalls` tile is enterable **iff `d` is even**, a `phaseBWalls` tile **iff `d` is odd** — and a tile can never be "refused first, then entered later".

### L1 — `l001.json` · tap → move, the world flashes (5 × 3, no walls)

| step | tile entered | phase during the move | after the move |
|---|---|---|---|
| 1 | `(1,1)` | A | B |
| 2 | `(2,1)` | B | A |
| 3 | `(3,1)` | A | B |
| 4 | `(4,1)` **goal** | B | A → win |

- Enterable windows: every tile is non-wall in both phases, so every tile is enterable on every parity. The goal is enterable on both parities by design (ADR-0008 rule 7).
- `par = 4` = `d(goal)`; the row is the only 4-move route, so 4 is the floor.
- **If a tile here were made solid in BOTH phases:** `(1,1)`, `(2,1)` or `(3,1)` each cut the only 4-route, and the goal stays reachable via row 0/2 at **6** moves, so `par` would become 6 (verified by brute force: all three single-tile dual variants give exactly 6). The level would stop being "the flip is harmless", which is the point of L1 — a dual wall must not be added here.

### L2 — `l002.json` · "the flip happens because *I* moved" (4 × 4, no walls)

| step | tile entered | phase during the move | after the move |
|---|---|---|---|
| 1 | `(1,0)` | A | B |
| 2 | `(2,0)` | B | A |
| 3 | `(3,0)` | A | B |
| 4 | `(3,1)` | B | A |
| 5 | `(3,2)` **goal** | A | B → win |

- `par = 5` = `d(goal)`; the board is open, so the player has many 5-move routes and the world alternates in lockstep with their taps.
- **If a tile here were made solid in BOTH phases:** a single dual tile never changes this `par` — e.g. `(3,1)` dual still leaves the 5-move route `(1,0)→(2,0)→(2,1)→(2,2)→(3,2)`. Brute force over all 14 non-endpoint tiles confirms it: **no** single dual tile changes `par = 5`. That is exactly why L2 must stay empty: a dual wall here would silently teach "walls", not "causality".

### L3 — `l003.json` · the first "no": a **current-phase** wall refuses the tap (5 × 3, `phaseAWalls = [(3,1)]`)

`d(3,1) = 3` (odd). By F2 a `phaseAWalls` tile needs an **even** arrival, so `(3,1)` is **never enterable** — it is a permanent obstacle that only *looks* like a parity gate.

| step | tile entered / attempted | phase during the move | outcome |
|---|---|---|---|
| 1 | `(1,1)` | A | legal → phase B |
| 2 | `(2,1)` | B | legal → phase A |
| 3 | `(3,1)` **attempted** | A | **REFUSED** — `(3,1)` is solid in A: no movement, **no flip**, still phase A |
| 3′ | `(2,0)` (the detour) | A | legal → phase B |
| 4 | `(3,0)` | B | legal → phase A |
| 5 | `(4,0)` | A | legal → phase B |
| 6 | `(4,1)` **goal** | B | legal → win |

- Enterable windows: `(3,1)` — **never** (see above). Its *ghost* state (phase B) is visible but unreachable: any arrival there is an odd move, i.e. a phase-A move.
- `par = 6`: the 4-move straight line is cut, and the only other routes go through row 0 or row 2 (both 6).
- **If `(3,1)` were made solid in BOTH phases: nothing changes at all** — the level is byte-for-byte equivalent in behaviour, because a parity-mismatched phase wall already is a dual wall. This is the load-bearing observation of §3.

### L4 — `l004.json` · the other face of a wall: a tile that is solid in phase B is *passable while it is A* (5 × 4, `phaseAWalls = [(3,1)]`, `phaseBWalls = [(2,0)]`)

`d(3,1) = 3` → never enterable (as in L3). `d(2,0) = 3` (odd) → a `phaseBWalls` tile needs an **odd** arrival, so `(2,0)` **is** enterable — on odd moves, while the current phase is A, where it renders as a passable echo.

| step | tile entered / attempted | phase during the move | outcome |
|---|---|---|---|
| 1 | `(1,1)` | A | legal → phase B |
| 2 | `(2,1)` | B | legal → phase A |
| 3 | `(3,1)` **attempted** | A | **REFUSED** — solid in A; no movement, no flip |
| 3′ | `(2,0)` (row 0 detour) | A | legal — the tile is **solid in B only**, so it is *passable now*; after the flip to B the player stands **inside** a solid tile (legal and safe, ADR-0008 rule 3) |
| 4 | `(3,0)` | B | legal → phase A |
| 5 | `(4,0)` | A | legal → phase B |
| 6 | `(4,1)` **goal** | B | legal → win |

The alternative 6-move detour `(0,2)→(1,2)→(2,2)→(3,2)→(4,2)→(4,1)` avoids `(2,0)` entirely, so the ghost crossing is offered, not forced.

- Enterable windows: `(3,1)` — never. `(2,0)` — odd moves (3, 5, 7 …) while phase A is current; in this level the first reachable entry is move 3.
- `par = 6`: 4 moves is impossible (the straight line is cut at `(3,1)`, and every 4-move route *is* the straight line); 6 is achieved.
- **If `(2,0)` were made solid in BOTH phases:** the row-0 corridor is severed at `(2,0)` — the "walk through a wall" beat disappears — but the row-2 route still solves in 6, so `par` is unchanged and the level stays solvable. The *teaching* content of L4 is what is lost, not the solution.
- **If `(3,1)` were made solid in BOTH phases:** no change (as in L3).
- ⚠ **Blocked intent (see §4):** `docs/level-design.md` §2 asks this tile to be "the wall that said no, gone after I move". Under ADR-0008 that is unreachable — L4 as specified has no legal implementation in M0.

### L5 — `l005.json` · the goal line is reached only **through** a wall that is a ghost right now (5 × 4, `phaseAWalls = [(3,1), (4,0)]`, `phaseBWalls = [(4,2)]`)

`d(3,1) = 3`, `d(4,0) = 5`, `d(4,2) = 5` — all odd. `(3,1)` and `(4,0)` are `phaseAWalls` (need even arrivals) → **never enterable**. `(4,2)` is `phaseBWalls` (needs odd arrivals) → **enterable on odd moves**, i.e. while phase A is current, where it renders as an echo.

| step | tile entered / attempted | phase during the move | outcome |
|---|---|---|---|
| 1 | `(1,1)` | A | legal → phase B |
| 2 | `(2,1)` | B | legal → phase A |
| 3 | `(3,1)` **attempted** | A | **REFUSED** — solid in A; no movement, no flip (the greedy straight line dies here, one tile before the goal column) |
| 3′ | `(2,2)` (the side step) | A | legal → phase B |
| 4 | `(3,2)` | B | legal → phase A |
| 5 | `(4,2)` | A | legal — solid in **B** only, so it is passable *now*; after the flip the player stands inside it (embedded, legal) |
| 6 | `(4,1)` **goal** | B | legal → win |

- Enterable windows: `(3,1)`, `(4,0)` — never. `(4,2)` — odd moves (3, 5, 7 …); earliest reachable entry is move 5.
- The goal's neighbours are `(3,1)`, `(4,0)` and `(4,2)` only; the first two are never enterable, so **every** solution must enter through the echo `(4,2)`.
- `par = 6`: 4 is impossible (the straight line is refused at `(3,1)`, and the goal cannot be reached from `(3,1)` or `(4,0)` in any case); 6 is achieved.
- **If `(4,2)` were made solid in BOTH phases: the level becomes UNSOLVABLE** — all three goal approaches are then permanently solid. This is the clearest evidence in the set that a parity-matched wall is load-bearing content, not decoration.
- **If `(3,1)` or `(4,0)` were made solid in BOTH phases:** no change (both are already permanently solid).
- ⚠ **Blocked intent (see §4):** the design asks for "a side step changes the parity, and the wall that refused me becomes my route". The side step here changes **nothing about `(3,1)`** — it routes around it and lets the player walk through a *different* wall, `(4,2)`.

## 2b. L6–L10 — the doors + switches unit (M1 + M3), solver-verified

Facts used below (proved in §3): **F1** (move *n* is played in phase A if *n* is odd) and **F2** (arrival at tile `c` is always a move `n ≡ d(c) (mod 2)`), plus the corollary **F3** derived in §3: *a switch's `activePhase` must equal the fixed entry phase of its own tile, otherwise the switch can never fire* (the policy `switch-never-fires` rejects it).

Door openness (`src/core/rules/solid.ts`, frozen): a **blue** door is closed in phase A and open in B; a **red** door is the inverse; a switch that is ON inverts its targets. So the *only* way a door tile can be entered is: base-open in the phase present during that move, or latched open by a switch that is currently ON.

### L6 — `l006.json` · the latch on the natural path (5 × 3, `par` 4)

`d(3,1) = 3` (odd) → the blue door `d1` at `(3,1)` is entered on odd moves, i.e. **in phase A, where blue is closed**. `d(1,1) = 1` (odd) → the switch `s1` at `(1,1)` is entered in phase A too, so `activePhase: "A"` is exactly the phase that is current when it is stepped on (F3).

| step | tile entered | phase during the move | outcome |
|---|---|---|---|
| 1 | `(1,1)` `s1` | A | legal, `s1` → **ON**; after the flip, phase B |
| 2 | `(2,1)` | B | legal → phase A |
| 3 | `(3,1)` `d1` | A | blue is closed in A, but `s1` ON **inverts** it → **open**, legal → phase B |
| 4 | `(4,1)` **goal** | B | legal → win |

- `par = 4` = `d(goal)`: the only 4-move route is the straight row, and that route passes `s1` at move 1, so **the shortest solution necessarily latches**. Solver: `shortestSolution = 4`, `parRoutes = 1`.
- The latch is **not required**: the un-switched world still solves in 6 via row 0 or row 2 (`switchRequired = false`). This is deliberate — §6 of `docs/level-design.md` wants the new-mechanic block to open with a **dip**, and `refusedThenEnteredTiles = 1` (`(3,1)`) still proves the latch is load-bearing content, not decoration.
- The level is also the first place where a **door closes under the player**: after move 3 the player stands on `d1` while phase B is current, where the blue door is open with `s1` ON → not solid; after the *next* flip it would be solid. The solver's `embedRoutes = 1` records exactly that (see §3's note on door-tile embedding).

### L7 — `l007.json` · the detour (3 × 3, `par` 4)

`(2,0)` and `(2,2)` have `d = 3` (odd) and are `phaseAWalls` → by F2 they need an *even* arrival, so both are **permanently solid**: the goal `(2,1)` (d = 2, entered on even moves) has exactly one non-wall neighbour, the door.

| step | tile entered / attempted | phase | outcome |
|---|---|---|---|
| 1 | `(1,1)` `d1` **attempted** from the start | A | blue closed in A, `s1` OFF → **REFUSED**: no movement, no flip, still at `(0,1)` phase A |
| 1′ | `(0,0)` `s1` (the detour) | A | legal, `s1` → **ON** → phase B |
| 2 | `(0,1)` | B | legal → phase A |
| 3 | `(1,1)` `d1` | A | latching open (as in L6) → legal → phase B |
| 4 | `(2,1)` **goal** | B | legal → win |

- The greedy line is refused **at the door itself**, and the switch is one step off that line: the detour costs exactly the two moves the refusal demands, so `par = 4` is simultaneously the floor and the "go out of your way" beat. Solver: `shortestSolution = 4`, `parRoutes = 2` (both shortest routes embed, `embedForced = true`).
- `switchRequired = true`: without `s1`, the door stays closed in A and the goal has no other non-solid neighbour.

### L8 — `l008.json` · Aha #1, the door that refused the greedy line (5 × 4, `par` 6)

`(4,0)` and `(4,2)` have `d = 5` (odd) and are `phaseAWalls` → **permanently solid** (F2). The goal `(4,1)` (d = 4, entered on even moves) therefore has exactly one non-solid neighbour: the blue door `(3,1)` (d = 3, entered on odd moves, in phase A where blue is closed). `s1` sits at `(2,0)` (d = 3, entered in phase A → `activePhase: "A"`, per F3) — **one tile off the straight row**, past the halfway point.

| step | tile entered / attempted | phase | outcome |
|---|---|---|---|
| 1 | `(1,1)` | A | legal → phase B |
| 2 | `(2,1)` | B | legal → phase A |
| 3 | `(3,1)` `d1` **attempted** | A | blue closed in A, `s1` OFF → **REFUSED** (the greedy line dies here) |
| 3′ | `(2,1)` is where the player stands; the fix is the side step `U` | — | — |
| 3″ | `(2,0)` `s1` | A | legal, `s1` → **ON** → phase B |
| 4 | `(2,1)` | B | legal → phase A |
| 5 | `(3,1)` `d1` | A | latching open → legal → phase B |
| 6 | `(4,1)` **goal** | B | legal → win |

- `par = 6`; **all six** shortest routes press `s1` at move 3 and cross `d1` at move 5 (solver gate (ii): `press-then-cross-door = 6/6`, and the crossed tile `(3,1)` is in `refusedThenEnteredTiles`). `switchRequired = true` (gate (i): the all-OFF subgraph holds 16 of the 34 reachable states and the goal is unreachable inside it).
- The switch is one tile off the line, the detour costs +2 moves, and the refusal happens *at the door* — the shape `docs/level-design.md` §2/§3 asks for. The fourth named condition, `dualPhaseTiles ≥ 1`, is unsatisfiable before L11: see §4.

### L9 — `l009.json` · two doors + two switches, ordered (5 × 5, `par` 8)

The column `x = 2` is a sealed wall except for one tile: `(2,0)`/`(2,4)` are `phaseBWalls` on even-`d` tiles and `(2,1)`/`(2,3)` are `phaseAWalls` on odd-`d` tiles → **all four permanently solid** (F2), leaving only `(2,2)` — the **red** door `d1` (d = 2, entered on even moves, in phase B where red is closed). So everything at `x ≥ 3` is behind `d1`, and the switch for the second door lives there:

| step | tile entered | phase | outcome |
|---|---|---|---|
| 1 | `(0,1)` `s1` | A | legal, `s1` → **ON** (`d1` now open in B) → phase B |
| 2 | `(0,2)` | B | legal → phase A |
| 3 | `(1,2)` | A | legal → phase B |
| 4 | `(2,2)` `d1` | B | red closed in B, `s1` ON → **open** → legal; phase A now, so the door is closed *under* the player (`d1` ∈ `refusedThenEnteredTiles`) |
| 5 | `(3,2)` | A | legal → phase B |
| 6 | `(3,1)` `s2` | B | legal, `s2` → **ON** (`activePhase: "B"` = the fixed entry phase of `(3,1)`, d = 4) → phase A |
| 7 | `(4,1)` `d2` | A | blue closed in A, `s2` ON → **open** → legal → phase B |
| 8 | `(4,0)` **goal** | B | legal → win |

- The **order is forced by geometry**: `s2` is behind `d1`, and `d1` only opens with `s1`; `(3,0)` is a permanent A-wall and `(4,0)`'s only other neighbour is `d2`, so the goal cannot be reached without both presses. Solver: `shortestSolution = 8`, `parRoutes = 2`, `refusedThenEnteredTiles = 2`, `switchRequired = true`, 0 dead states.
- This is the dispatch's "two doors / two switches interaction"; it is **not** the lesson `docs/level-design.md` §2 originally wrote for L9 (see §4).

### L10 — `l010.json` · mastery: M0 geometry + phantom walk + latch (6 × 4, `par` 9)

- `(5,0)` and `(5,2)` are `phaseBWalls` on even-`d` tiles (d = 6) → **permanently solid**, so the goal `(5,1)` is reachable only through the **red** door `(4,1)` (d = 4, entered on even moves in phase B, where red is closed).
- `s1` sits at `(2,3)` (d = 4, entered in phase B → `activePhase: "B"`): a real detour down to row 3 and back.
- `(1,2)` is a `phaseAWalls` tile on an even-`d` tile (d = 2). Recall the §2 L4/L5 construction: an odd-`d` tile + the *other* phase's wall is the passable echo. Here it is an **A-wall on an even-`d` tile**, entered on an even move while phase B is current → passable, and *after* the flip the player is standing inside a phase-A-solid tile (embedded, legal, ADR-0008 clause 3). So the route recombines "walk through a wall" with "the flip is my step".

| step | tile entered | phase | outcome |
|---|---|---|---|
| 1 | `(1,1)` | A | legal → phase B |
| 2 | `(1,2)` — the echo | B | legal (solid in A only) → phase A, player now **embedded** in an A-wall |
| 3 | `(2,2)` | A | legal — stepping *out* of the embedded tile needs no rule (`(2,2)` is non-solid in A) → phase B |
| 4 | `(2,3)` `s1` | B | legal, `s1` → **ON** → phase A |
| 5 | `(3,3)` | A | legal → phase B |
| 6 | `(4,3)` | B | legal → phase A |
| 7 | `(4,2)` | A | legal → phase B |
| 8 | `(4,1)` `d1` | B | red closed in B, `s1` ON → **open** → legal → phase A |
| 9 | `(5,1)` **goal** | A | legal → win |

- `par = 9`; `switchRequired = true`; every one of the **36** shortest routes ends embedded (`parRoutes = 36 / embedRoutes = 36`), 0 dead states. The board is deliberately loose (36 equivalent routes, `forced-move ratio` 0.10) — its job is to confirm the player owns *move → flip → latch* together, not to add a new trick (`docs/level-design.md` §2 L10).

### Where L6–L10 came from (reproducible)

The five files are the **accepted output of a committed, seeded generator** (`scripts/author-lv006-candidates.ts`, `SEED = 20261015`), which enumerates the recorded template families, runs schema → rules → BFS → policy on each candidate, takes `par` **from the solver**, and prints every rejection. Re-running it re-derives all five files (`shipped=MATCH`) and fails loudly if any of its three negative probes (inert switch, Aha board without the goal funnel, door with no switch) is wrongly rejected. Full record: `docs/ai-native-pipeline.md` §8.

## 2c. L11 — the M2 (portal) debut, solver-verified

`l011.json` is the first board in the set that carries a **portal**, i.e. the first on which the phase is no longer a function of the tile (§3/§4 said M0 walls and M1 doors cannot break that link; only M2 and M3 can). Its acceptance contract was **pre-registered** before any candidate existed (`docs/level-design.md` §6 V0.6 / ADR-design-0001, `docs/level-difficulty.md` §3.3–§3.4), and every clause below is a program read-out — `tests/solver/l11-portal-gates.test.ts` pins them, `tests/solver/policy-negative-controls.test.ts` gives each named gate a board that fails by that name.

**The board.** 7 × 3, wall-free, `startPhase A`, player `(0,1)`, goal `(6,0)`; `d1` blue on `(5,0)`; `s1` on `(1,1)` with `activePhase A` → `d1`; `p1` = `(2,1) ⇄ (4,0)` with `activePhase B`; `par = 4` (solver: shortest = 4, `parMatch = true`). The skeleton is the L6 template's (`docs/level-difficulty.md` §3.4 asks a mechanic debut to be short and single-concept): the only obstruction is a *rule* object, so the portal's effect cannot be masked by geometry, and the board carries **0 validator warnings**.

**The par route is the portal (measured, unique).** `parRoutes = 1` — there is exactly one 4-move route, and `right-right-right-right` crosses the channel:

| step | clicked | entered | phase at entry | outcome |
|---|---|---|---|---|
| 1 | `(1,1)` | `(1,1)` `s1` | A | legal, `s1` → **ON**, `d1` opens → phase B |
| 2 | `(2,1)` | `(2,1)` 🔵 pair end, **active in B** | B | legal **and teleports** to `(4,0)` → phase A |
| 3 | `(5,0)` | `(5,0)` `d1` | A | blue closed in A… but `s1` is ON → **open** → legal → phase B |
| 4 | `(6,0)` | `(6,0)` **goal** | B | legal → win |

- The teleport is the *only* displacement in the game that does not cost a move, so it is what makes step 3 land on `(5,0)` **in phase A** — where the blue door is open. Without it the door tile is entered in B (closed) and the board is not 4 moves; the walking world needs **7** (measured with a second BFS on `{…l011, portals: []}`). The portal is therefore a **shortcut worth 3 moves, not decoration** — and `portal-crossing-on-every-par-route` proves it can never be bypassed on a shortest route.
- `refusedThenEnteredTiles = 1` tile `[5,0]`: `(5,0)` is clicked-and-refused when the door is closed in B (off-route wandering) and entered when it is open in A (step 3). Both readers agree here (`refusedBeforeEnteredTiles = 1`, same tile), so the LV-007C ordered reader changes no verdict on this board — it is the carrier, not the novelty.
- **Below OFFERED** (`docs/level-difficulty.md` §3.4): the portal is *rewarded in par* and *not demanded*, which is why this row is `switchRequired: "exempt"` (the L6 precedent, recorded on the lesson row rather than special-cased by id). Gate (i) `no-solution-with-switches-off` is deliberately **not** in L11's gate family: on a channel-bearing board a walking route and a teleporting route stand in different phase relations to the same door tile, so an all-OFF refusal is no longer one well-defined fact — the latch's role is measured by gate (ii) instead.

**The eight named gates (all PASS).** `dual-phase-tiles` (21 tiles, gate (iv) satisfied for the first time) · `shortest-solution-presses-switch-and-crosses-door` (**the same implementation** Aha #1 uses — extracted, not copied: `routes=1; press-then-cross-door=1`) · `refused-then-entered` (the ordered reader) · `portal-pair-single-opposite-colour` (one pair, x+y parities 3/4, one `activePhase = B`) · `portal-crossing-on-every-par-route` · `portal-par-cap` (`par ≤ 4`, authored **and** measured) · `portal-teaching-grade-below-offered` · `portal-seam-law-execution-axis`.

**The pre-registered seam law, measured.** `D_exec = 8.573171` (`D = 28.573171` − 5·M(4) = 1·L(4) + 3·B(1.5244)) — comfortably under the pre-registered bound **13.64**, which is nothing but the *published 2-dp form* of the shipped `l010` measurement (13.642857, pinned in `tests/solver/difficulty.test.ts` §2c), so the law is strictly harder than "beat L10". Stated honestly: on the **total** axis `D` only falls 0.0697 (28.6429 → 28.5732), because the mechanic count term rises by +5 exactly where the block changes mechanic; the seam is real on the **execution** axis (`D_exec` 13.6429 → 8.5732, **−5.07**), which is the axis ADR-design-0001 writes the law on. `M = 4` (M1+M3+M2) is the `ΔM = +1` the design section asked for, and `B` falls 1.5476 → 1.5244 (a smaller state space: 82 reachable states, `D_exec`'s only other live term).

**The two things L11 did *not* get, by design.** No `portalRequired` flag and no "lesson-portal-required" code: the debut's whole point is that the portal is *not* demanded, so such a check would be unreachable — and an unreachable check violates the one-negative-control-per-code law that `tests/solver/policy-negative-controls.test.ts` enforces at compile time. And no wall: adding parity-dead walls to raise `D_exec` was probed (`phaseBWalls [[5,2],[6,1]]` and several `phaseAWalls` variants) and measured to produce `deadStates = 0` and **no `D_exec` movement at all** — the honest reason the seam-law negative control is the boundary board (the shipped `l010` re-labelled `id: 11`, `D_exec = 13.642857 ≥ 13.64`) rather than a surgical one.

### Where L11 came from (reproducible)

Also the accepted output of a committed, seeded generator: `scripts/author-l11-candidates.ts` (`SEED = 20261015`) enumerates the recorded M2-debut family — the wall-free 7 × 3 skeleton × switch tile × door tile × door colour × pair × channel phase, **54 candidates**, plus a seeded pair-placement axis — runs schema → rules → BFS → `par` from the solver → the whole `portal-aha-2` suite on each, and prints every rejection.

- **1/54 accepted, and it is the shipped file** (`shipped=MATCH`): the design space of this debut is genuinely narrow (49 rejects fail gate (ii) — the channel must sit *exactly* on the only route while the door must still be closed in its entry phase — and 4 fail the `par ≤ 4` cap). That is the finding, not a failure of the sweep: the shipped board was *found and filtered to*, not fitted to a target.
- Both negative probes are rejected **by name**: a **same-colour** pair (`(6,2) ⇄ (0,2)`, both `(x + y)` even → inert M2, hard-**error** in `validateLevel`, not a warning) and a **bypassable** portal (the channel re-declared in the phase the par route never stands in → `gate-portal-crossing-on-every-par-route`). Full record: `docs/ai-native-pipeline.md` §8.8.

## 2d. L12–L15 — the M2 block, solver-verified (ADR-design-0003)

The block's law is `docs/decisions/design-0003-l1215-block-law.md`; the four boards are
the four candidates the LV-009-A dossier carried, **byte-copied** into the dataset after
STEP 0 re-derived every constant of that ADR from the candidates *as an isolated dataset*
(`scripts/attest-lv009-block.ts`, transcript committed at `e8a456d`). Each board's `par`
below is the program solver's `shortestSolution`, and the whole ramp is one legal
sentence: **4 / 6 / 8 / 10 = the P1 floor + the 2-move step, ending exactly on the
ceiling** (`BLOCK_L1215_PAR_FLOOR/STEP_MIN/CEILING` in `@/core/solver/policy`).

- **L12 — `l012.json` · 7 × 3 · `par` 4 · the dip's second beat.** The channel
  `(0,2) ⇄ (3,2)` sits **one step from the player's tile**: the opening move enters an
  active end (phase A) and *arrives on the far side* of the board in phase B, which is
  exactly where the latch `s1 (4,2)` is current — so the route reads **teleport → press →
  cross the door → goal** in 4 moves, with the door `d1 (5,2)` open only on that order.
  The walking world still finishes in **7** (Manhattan 7, no wall in the way), so the
  channel is a *shortcut*, and the board keeps the L11 grade ("below OFFERED") while
  dropping `D_exec` to **8.23 < 8.573171** (L11's measured value) — the two-beat dip §§4/6.1.2
  of the ADR, carried by effective branching (1.5244 → 1.4103) with par flat at the floor.
- **L13 — `l013.json` · 6 × 4 · `par` 6 · the sealed line.** Column `x = 4` alternates its
  wall phase per row (`(4,1)/(4,3)` in A, `(4,0)/(4,2)` in B), so the walking world cannot
  cross it while keeping the phase the door and the switch need: **walk-only is
  UNSATISFIABLE** (measured, and the reason the ADR's `BLOCK_L1215_PORTAL_LOAD` grades
  this board `"mandatory"`). The route must reach the channel end `(0,1)` on the parity
  that makes it active, teleport to `(5,3)`, press `s1 (5,2)` in phase B and cross
  `d1 (5,1)` — 6 moves, with the extra two over L12 being the detour to the far end.
- **L14 — `l014.json` · 7 × 4 · `par` 8 · the same law on a longer board.** The line
  `x = 5` is sealed in the same alternating way and the channel `(0,1) ⇄ (6,0)` is the
  only crossing; the latch `s1 (6,1)` sits between the channel's arrival end and the door
  `d1 (6,2)`, so the order is forced by geometry again. The board is what makes the ramp
  *arithmetic* rather than *longer*: `B` 1.6329 → 1.6526 with the same mechanic set.
- **L15 — `l015.json` · 7 × 5 · `par` 10 · the block end.** **Every tile of the 7 × 5 grid
  is visited** (coverage 35/35 — §6.1.1's `l015TemplateFamily` note, and the reason the
  board size was chosen *from* the route rather than padded to it), the line `x = 3` is
  sealed across all five rows, and the frozen §6 clause is met with room to spare:
  **`D_exec = 14.969697 > 13.64`** (and above L10's measured 13.642857 itself).

**What the block does *not* claim.** Gate (i) `no-solution-with-switches-off` is
deliberately **absent** from these four boards' suite (ADR §5): in the all-OFF world the
goal is still reachable on **4/4** (that is the documented G1 grade — the latch prices the
route, the sealed channel carries existence). The substitute teeth are par-grade and
measured: **G1** `allOffShortest − par = 2` on 4/4 (a *restricted* all-OFF walk, so the
number is a distance in the world it is read from), **G2** every par route presses the
switch *and* crosses the door it drives, and **G3** the refusal is *orderable*
(`refusedBeforeEntered == refusedThenEntered`, 3/5/5/6 tiles). G1 cannot fail alone —
if gate (ii) passes, no all-OFF route can be as short as par, which is why the G1 negative
control in `tests/solver/policy-negative-controls.test.ts` §2d fails with gate (ii) and
the coupling is asserted there as an implication over every board in the suite.

**Where L12–L15 came from.** The LV-009-A search (Kimi K3 for design reasoning, the
program Solver for every verdict) proposed candidate families; every accepted member was
filtered by the ADR's own constants — par floor/step/ceiling, coverage, latch grade,
portal load, the dip ceiling and the tail budget — during the *search*, not after it
(`docs/ai-native-pipeline.md` §8.10 records the pipeline and the rejection ledger). The
STEP 0 transcript is the load-bearing evidence: it re-derived `par`, `D_exec`, `T`, `R`,
dead states, coverage, the all-OFF advantage, the portal-free verdict, `dualPhaseTiles`
and the ordered/unordered refusal counts **from the candidate files alone**, and every
number matched the ADR before a single dataset byte moved.

## 2e. L16–L19 — the goal-gated seal block, **registered** (R-003c)

The four rungs are in the dataset root (`l016.json` … `l019.json`). They were authored on the
proposal shelf `src/levels/candidates/` and **moved into the root by R-003c** — the §2d
precedent: registration is a byte-copy, never a re-authoring. Byte identity is proven, not
claimed: for each id, `git hash-object src/levels/lNNN.json` equals
`git rev-parse 3cc6df2:src/levels/candidates/lNNN.json` (the LV-010 commit), and the four
`sha256` content hashes in the metrics sidecar are the hashes of those same bytes.
`scripts/attest-lv010-block.ts` re-runs that check on every invocation and FAILS (never
silently skips) if git cannot answer.

**Why a shelf existed at all.** `src/levels/candidates/` was a *subdirectory of
`src/levels/`, deliberately outside the dataset*, because the three readers that own the
shipped-set census all read the root **non-recursively**: `tests/solver/difficulty.test.ts`
derives `SHIPPED_IDS` from `readdirSync(src/levels).filter(/^l\d+\.json$/)` and asserts
`Object.keys(PINS).sort() === SHIPPED_IDS`; `tests/solver/metrics-sidecar.test.ts` asserts
`REPORT.levels.length === 15` plus file-list equality; `src/game/levels/level-registry.ts`
uses **explicit imports**, not `import.meta.glob`. A candidate in the root therefore breaks
those pins and needs a registry row before the game can show it — which is exactly what
R-003c does *on purpose*, and why the two cross-lane rows are handed off rather than edited
here (see §7: `src/game/**` and `tests/**` are outside the Level AI + Solver lane).

**Registration = the bytes plus the law.** Each rung carries a lesson row and a named gate
family (`BLOCK_L1619_*` constants + `blockL1619Gates` in `@/core/solver/policy`), all four
rows ship `switchRequired: "required"`, and each of the six new gate codes has **one negative
control** — in `scripts/attest-lv010-block.ts`, because `tests/**` is not this dispatch's lane
(so `tests/solver/policy-negative-controls.test.ts`'s `Record<PolicyViolationCode, …>` is
deliberately left RED; QA's pin-migration ticket owns the move). All four are measured
identical facts: the all-OFF subgraph contains **no goal state**
(`allOffGoalReachable = false`, `allOffShortestSolution = null`), so here the latch carries
**existence**, strictly stronger than the L12–L15 block's 2-move advantage. The six controls
are listed at the end of this section.

### The rung law the block is judged against

Derived, never chosen (`scripts/attest-lv010-block.ts` re-measures every constant from the live
L1–L15 bytes on every run and compares it against the constants `@/core/solver/policy` imports
into `blockL1619Gates` — nothing below is transcribed by hand):

| constant | value | source |
|---|---|---|
| `par(L15)` | 10 | `l015.json` — the block's base (`BLOCK_L1619_PAR_BASE`) |
| the rung's par | `par(L15) + 2·(id − 15)` ∈ `{12, 14, 16, 18}` | §6.1.1 **P2** (non-seam block ⇒ `Δpar ≥ 2`), matched **exactly** — not merely `≥` |
| the escalation cut | `D_exec > 14.969697` | max `D_exec` over **L1–L15** (`a19a347` transcript), re-derived by the attest script. The basis **excludes the block's own ids** (`BLOCK_L1619_IDS`), so a registered rung can never raise the filter it is judged by |
| the `B` band | `[1.2500, 1.6875]` | §6.1.1 P2 / §5.2, re-measured over L1–L15 each run |
| the device ceiling | par **18**, `D_exec` **22.885157** | the L19 census below — enforced as `block-l1619-tail-ceiling` |

Pipeline for each rung: `scripts/author-l16-candidates.ts` (propose: schema → rules → BFS →
derived gates → census, seeded, `par` stamped by the solver) → `--write` lands the bytes →
`scripts/prove-candidate.ts <file>` **re-reads those bytes** and re-proves them plus six
negative controls → `scripts/attest-lv010-block.ts` re-derives the whole law from the
**registered root set** and runs one negative control per gate.

### Registered rungs (proven on the landed bytes)

| rung | board | `par` | `D_exec` | `B` | region | latch (all-OFF) | shortest routes | refusals | coverage |
|---|---|---|---|---|---|---|---|---|---|
| L16 `l016.json` | 7 × 6, sealed column `x = 4`, portal `(3,3)↔(6,5)`/B, goal `(5,0)`, doors `(6,0)`+`(5,1)` blue, switches `(5,0)`/B + `(6,1)`/B | 12 | 17.100000 | 1.7000 | `deadStates 0`, `noUnrecoverableOk`, `T ≡ R ≡ 0` | **UNSATISFIABLE** (`null`) | 20/20 press-then-cross | 8 tiles | 42/42 |
| L17 `l017.json` | 7 × 6, sealed column `x = 4`, portal `(3,3)↔(5,2)`/B, goal `(6,5)`, doors `(6,4)`+`(5,5)` blue, switches `(6,0)`/A + `(5,0)`/B | 14 | 19.027027 | 1.6757 | `deadStates 0`, `noUnrecoverableOk`, `T ≡ R ≡ 0` | **UNSATISFIABLE** (`null`) | 60/60 press-then-cross | 8 tiles | 42/42 |
| L18 `l018.json` | 7 × 6, sealed column `x = 3`, portal `(2,5)↔(4,4)`/A, goal `(6,1)`, **three** blue doors `(6,0)`+`(5,1)`+`(6,2)` (every neighbour of the goal), switches `(6,3)`/B + `(6,5)`/B + `(5,0)`/B | 16 | 20.907923 | 1.6360 | `deadStates 0`, `noUnrecoverableOk`, `T ≡ R ≡ 0` | **UNSATISFIABLE** (`null`) | 189/189 press-then-cross | 9 tiles | 42/42 |
| L19 `l019.json` | 7 × 6, sealed column `x = 3`, portal `(2,5)↔(4,0)`/A, goal `(5,4)` — **interior**, `x = 5` is the middle column — **four** blue doors `(5,3)`+`(4,4)`+`(6,4)`+`(5,5)` (every neighbour, all four), switches `(6,5)`/B + `(6,3)`/B + `(4,5)`/B + `(5,0)`/B | 18 | 22.885157 | 1.6284 | `deadStates 0`, `noUnrecoverableOk`, `T ≡ R ≡ 0` | **UNSATISFIABLE** (`null`) | 231/231 press-then-cross | 10 tiles | 42/42 |

All are in the §4 acceptance region and all carry `D_exec = par + 3·B` exactly (the identity
that makes the escalation check mean `par + 3·B`, not something else).

**L16's taught beat** — *the latch is the door's only approach*: both of the goal's neighbours
are doors, so the goal is sealed until a switch has been pressed at all; the all-OFF world is
**unsatisfiable**, not merely slower.

**L17's taught beat** — *the same lesson with a real detour and two valid plans*: the goal
`(6,5)` is again sealed by both of its neighbours (doors `(6,4)` and `(5,5)`), but the two
switches now sit **two tiles off the landing column** (`(6,0)` and `(5,0)`), so neither press
is free: `par` grows from the bare 10 to 14, i.e. `Δpar = 4`, and the two plans
(land → up column 6 → `s1` → back down to `(6,4)`; or land → up column 5 → `s2` → down to
`(5,5)`) are **the same length**, which is what makes the second plan discoverable rather than
punished.

**L18's taught beat** — *the seal widens: every way in is a door.* The goal `(6,1)` has
**three** neighbours and all three are doors, so there is no free approach left at all and the
all-OFF world is again unsatisfiable — but now the player has to find one of **three** switches
(`(6,3)`, `(6,5)`, `(5,0)`, all phase B), none of which sits on the landing column of the portal
`(4,4)`. `par` grows from the bare 12 to 16 (`Δpar = 4`, two presses at +2 each) and the
escalation over L17 comes from the **shape** (door count 2 → 3, goal moved inward) rather than
from lengthening a walk: the door count is the goal's own geometry, not an axis the author
dials. `tests/solver/l16-l20-candidates.test.ts` pinned all three rungs' obligations while they were
candidates, walking the shelf directory rather than a typed list; R-003c moved the bytes out of
that directory, so the suite is **RED until QA re-points it at the root** (§7 handoff) and the
post-registration obligations are carried by `scripts/attest-lv010-block.ts` in the meantime.

**L19's taught beat** — *the seal closes all four sides: the goal is in the middle of the room.*
L18's three-door seal still left the goal **against an edge**, so three of its four sides were
walls/door and the shape was "one edge, three doors". In `l019.json` the goal `(5,4)` is the
**interior** tile of the far region (`x = 5` of `4…6`, `y = 4` of `0…5`) and therefore has
**four** neighbours — and all four are doors (`(5,3)`, `(4,4)`, `(6,4)`, `(5,5)`), so there is no
edge to lean on and four switches to find instead of three. The arity is still the goal's own
geometry rather than a dial the author turns: on `7×6` a full seal is 2 (corner), 3 (edge) or 4
(interior), and the ladder now walks that sequence 2 → 2 → 3 → 4. The escalation over L18 is
measured, not asserted: `D_exec` rises `20.907923 → 22.885157` while `B` stays **in band**
(1.6284) and `par` steps `16 → 18`.

### The family census behind the L19 rung (measure, never tune-to-pass)

`--stage=f` measures what each geometry family can carry *before* a lattice is run, so the shape
step is picked from numbers. On `7×6` with the sealed-column grammar (`--stage=f --w=7 --h=6
--id=19 --cxs=2,3,4 --seal=2-4`), 14 310 bare boards scanned, every family full-coverage:

| cx | seal arity | scanned | clean | bare `par` max | on-rung (`bare ∈ {18,16,14}`) |
|---|---|---|---|---|---|
| 2 | 2 | 1012 | 506 | 14 | 2 |
| 2 | 3 | 3036 | 1518 | 13 | 0 |
| 2 | 4 | 2024 | 1012 | 12 | 0 |
| 3 | 2 | 1156 | 578 | 14 | 2 |
| 3 | 3 | 2890 | 1445 | 13 | 0 |
| 3 | 4 | 1156 | 578 | 12 | 0 |
| 4 | 2 | 1012 | 506 | 14 | 2 |
| 4 | 3 | 2024 | 1012 | 13 | 0 |

Two measured consequences. (1) **The bare route reaches 14 and no further on `7×6`**, and only at
arity 2 — a corner goal. Arity 3 caps at 13 and arity 4 at 12, so a par-18 rung cannot come from
the bare route at all on this grid; it must come from the press detour. (2) The arity-2 row is
**L16/L17's shape already**: a par-18 board built there would be the same seal with a longer walk,
which is exactly the escalation §6 has to avoid. So the shape step taken is arity 3 → **arity 4**.

The arity-4 family on `7×6` is small and was therefore enumerated **completely**, not sampled:
`--stage=d --w=7 --h=6 --cx=3 --id=19 --seal=4-4 --drop=8 --geo=17 --geos=1 --swcap=30000` judged
all 17 160 switch 4-tuples of its single clean geometry and measured

```
measured par census of the judged space: 12:10230 14:6450 16:446 18:34
census: 26 accept(s) of 17160 goal-gated candidate(s)
rung pin: par === 18 on 26 of 26 accept(s); over-rung accepts = 0
```

— i.e. the family's reachable `par` is `{12, 14, 16, 18}` and **18 is its ceiling**, with 26 boards
clearing every gate at exactly the rung value. The rung pin (`par === l15Par + 2·(id − 15)`
exactly, not merely `≥`) is printed by the generator and asserted in the suite, so an accept that
is longer than its rung is *named and dropped* rather than silently shipped as the rung.

### L20 and the goal-gated full-seal device: **exhausted at par 18** (measured)

No par-20 rung was written **inside this device**, and nothing was fabricated to reach one. What the census
*measured* is below; the honest reading is that the device L16–L19 are built from cannot reach
`par 20` without repeating a shape the ladder has already taught, so a par-20 rung needed a
**different mechanism** — which arrived at LV-011 and has its own subsection at the end of §2e
(the **sealed landing**, ADR-`design-0004`). R-003c registered the four rungs that **exist**; it did
not invent a fifth.

**The device, stated as what it is.** Each of L16–L19 is a **full seal**: every neighbour of the
goal is a door, each door is targeted by exactly one switch, and the all-OFF world is
unsatisfiable. In that device the *shortest* plan opens exactly **one** door, because each seal
tile is directly adjacent to the free far region — so

    par = min over doors i of ( d(start → s_i) + 1 + d(s_i → goal) )

and the rung's escalation can only come from where the cheapest switch sits. Measured, not
argued: on `l019.json` and `l018.json` every **single-door** board (that door plus only its own
switch, every other door deleted) is solvable at `shortest = 12` — the bare route — while the
all-OFF world is unsatisfiable. **One press always suffices.**

**Par ceilings, enumerated (not sampled) on `7×6` with the sealed-column grammar.**

| grid / cx | seal arity | geometry | tuples judged | measured `par` census | ceiling |
|---|---|---|---|---|---|
| 7×6 / 3 | 2 | `2,5↔4,0`/A goal `6,5` (bare 14) | 210 (complete) | `14:201 16:9` | **16** |
| 7×6 / 3 | 2 | `2,5↔6,0`/A goal `4,5` (bare 14) | 210 (complete) | `14:201 16:9` | **16** |
| 7×6 / 3 | 3 | `2,5↔4,0`/A goal `6,3` (bare 12) | 2 184 (complete) | `12:1584 14:452 16:139 18:9` | **18** |
| 7×6 / 3 | 3 | `2,5↔4,4`/A goal `5,0` (bare 12) | 2 184 (complete) | `12:1224 14:910 16:50` | **16** |
| 7×6 / 3 | 4 | `2,5↔4,0`/A goal `5,4` (bare 12) — **L19's board** | 17 160 (complete) | `12:10230 14:6450 16:446 18:34` | **18** |

So on `7×6` the whole device has a measured ceiling of **18** — which is exactly L19. `par 20` is
not reachable there at any arity, and the rung-20 window (`bare ∈ {20,18,16,14,12}`) admits only
bare 12 and bare 14 on this grid, so those rows are the whole search space the window can reach.

**And `7×7` is not a shape step.** The taller grid does reach `par 22` (arity 4, cx 3, geometry
`2,5↔6,0`/A goal `5,4`, 43 680 tuples complete: `12:21840 14:18018 16:2457 18:1197 20:108 22:60`),
but its seal is **byte-identical in shape to L19's** — goal `(5,4)`, doors `(5,3) (4,4) (6,4) (5,5)`
— at the **same bare par 12**. The extra 2 moves are press-detour length on the seal the ladder
already taught at L19: a re-ran longer walk, which §6 forbids as a rung's escalation.

**What par 20 needs (recorded for the next lane, not assumed).** A device in which **two presses
are mandatory**, i.e. one where no single door admits the player to the goal. The two candidate
constructions both need a *new* lattice stage, because neither is expressible as "the doors are
the goal's neighbours":

1. **Gauntlet / two doors in series.** Every approach to the goal's ring is itself behind a
   door, so entering needs a seal door *and* a corridor door. Needs ≥ 6 doors on a 7×6 arity-3
   ring; must be checked against `coverage` (42/42) because *walls* cannot be used to remove an
   approach — a far-region phase wall makes its tile unstandable and the coverage gate fails,
   which is why every blocker in this device has to be an openable door.
2. **Sealed landing (two lattices).** The portal landing sits in its own pocket whose exit is a
   door, so the player must land, press, leave, and press again — an *ordered* two-step chain
   (`docs/level-design.md` §5's "2-step lookahead", which L16–L19 have still not delivered).

Both were identified from these measurements. **The sealed landing was then built** — adopted by
GD-007 / ADR-`design-0004`, implemented as its own lattice stage, censused, and proven; see the
subsection below. **The gauntlet is REJECTED** by that same ruling (it needs ≥ 6 doors on a 7×6
arity-3 ring, and walls cannot remove an approach), so there is no gauntlet stage, no gauntlet gate
and nothing to reject later. Neither construction is claimed by L16–L19.

### L20 *is* authored — the **sealed landing**, as a proven candidate (LV-011)

`src/levels/candidates/l020.json` — **`par 20` · `D_exec` 24.729412 · `B` 1.5765**, on the bytes:

| gate | measurement |
|---|---|
| `par-stamped` · `par-rung-exact` | file `par 20` = solver `shortestSolution 20` = the rung (exact, not a floor) |
| `region` · `validator` · `well-formed` | `deadStates 0` · `noUnrecoverableOk` · `T ≡ R ≡ 0` · `errors 0` · one-switch-per-door · 5 doors / 5 switches |
| `escalation` · `rung-plus-block-escalation` | `24.729412 > 14.969697` (the L1–L15 cut) **and** `> 22.885157` (the registered L16–L19 stop) **and** `B ∈ [1.2500, 1.6875]` |
| `latch-grade` · `g4-switch-required` | all-OFF world **UNSATISFIABLE** (`allOffShortestSolution = null`) — the latch carries existence |
| `latch-route` · `g3-ordered-two-press` | 252 shortest routes; **252/252** execute `land → press(s1) → cross the pocket door → press a seal switch` |
| `coverage` · `refused-beat` | `42/42` positions; 14 refusal tiles |
| `g1-pocket-on-foot` | landing `(5,1)` **behind the portal, not on foot**; pocket `[5,1 6,0 6,1 6,2]`; on-foot-reachable pocket tiles **0**; pre-press moves leaving the pocket **0** (the one return through the landing to the near end `(2,5)` is named: the landing *is* a portal end — a cycle, never an escape) |
| `g2-pocket-exit-door` | boundary `[4,1 5,0 5,2 6,3]` covered by **exactly one** door object (`d1`); free leaks **0**; phase walls on the boundary **0** (a wall there would make its tile unstandable and fail `coverage`) |
| `g5-identity-broken` | 4 seal tiles, **4 not adjacent** to the all-OFF free region; the census identity's value (the pocket-device-removed world) solves at **16 < par 20** while every par route presses **2** switches |

**15/15 gates ACCEPT** and **11/11 negative controls caught by their named gate** on the landed
bytes (`scripts/prove-candidate.ts … --rung=20`, transcript `scripts/author-l20.transcript.md`).
The proof is independent of the search: the prover **derives the pocket from the file**, and that
independence is what exposed two false refusals in the authoring instrument (a walk-in test where the
portal fires on *entry*, and an escape flood that counted moves made after leaving the pocket) — both
recorded and corrected in `docs/ai-native-pipeline.md` §8.14 (F-L20-1).

**The census behind it (accepts found, not conjured).** `scripts/author-l20.ts` (stage **P** pocket
class census · stage **SL** lattice · stage **V** re-verify) judged **269 484** tuples at pockets
≤ 5 (**238** devices) and **284 784** at ≤ 8 (**2 788** devices) and found the **same 640 accepts**,
with the *whole* rejection histogram being `par-not-rung` — i.e. the rung pin is the only filter that
fires, and `par-20 candidates refused by a gate: 0`. `D_exec` over the accepts runs
`24.729412 … 24.790588` and `B` `1.5765 … 1.6485`, so the **selection is derived**: exact rung par →
minimal `D_exec` → enumeration order. Two honesty notes: the par-census histogram has a **hole at 20**
on purpose (par-20 boards are *judged*, not tabulated, so `19:1056 21:192 22:96` is the ceiling
evidence), and **accept counts are enumeration-tuple counts, not distinct-board counts** (one pocket
set can be reached by several insertion orders).

**Where the device space is proven, and where it is not.** Stage P's ≤ 8 class is **complete**
(`16 431 095` tile-sets tested · `13 163 780` single-phase boundary · **2 788** leak-free, sizes
`3:34 · 4:204 · 6:510 · 7:2040` — no size-5, no size-8 member), but `--pocketsize=10` measures **more**
leak-free pockets on the same landings (`5,1` 12 → 40 per near end, `6,0` 12 → 40, `5,0` 3 → 13), so
**class completeness is OPEN at ≥ 9** (F-L20-3) — a named slice, not a completeness theorem and not a
ceiling claim. The per-landing ceilings *are* measured where claimed: a filtered pass on `(6,2)`
reaches `par 18` and a 200 000-tuple `--cap` pass on `(6,5)` reaches `par 19`, while the full census
shows `21:192 22:96` elsewhere.

**What has NOT happened.** `l020.json` is a **candidate on the shelf**: no root file, no registry row,
no `EXPECTED_LEVEL_COUNT` change, no sidecar record, and **no change to the registered
`block-l1619-tail-ceiling`** — the registered ceiling is still par 18 / `D_exec` 22.885157, because a
proven candidate does not widen a registered stop. All of that is a registration ticket
(`docs/ai-native-pipeline.md` §8.14 names the cross-lane items).

### Named findings, recorded not smoothed

- **F-L16-1 (inert second latch).** In `l016.json` the switch `s1` sits on `(5,0)`, which *is*
  the goal tile, and `allOffShortestSolution = null` proves the goal tile is unreachable while
  all switches are off — so `d1` (`(6,0)`) can only ever be opened from a state in which the
  level is already won. `s1`/`d1` is therefore **decorative**: it fires
  (`every-switch-fires = true`) but it can never change a route, and the shipped policy audit
  reports `violations = 0`. Measured from two program read-outs (the `null` all-OFF walk and
  the tile identity in the file), not from inspection. The gate chain's `latch-route` reader
  needs only *some* switch to be pressed-then-crossed, so it does not name this case — the
  finding is recorded here for the reviewer and for the block's own ledger rather than repaired
  silently in a committed artifact. **R-003c registered the board as measured:** a registration
  is a byte-copy and cannot repair anything, which is exactly why `switchRequired` on L16–L19 is
  read from the *device* (all-OFF has no goal) instead of from this one pair's slack. `l017.json`
  does not have it (both its switches sit off the goal).
- **F-L16-2 (`B` excursion).** `l016.json` measures `B = 1.7000`, above the shipped band top
  `1.6875`. §6.1.1's self-correcting guard says an out-of-band `B` must be **named and the ramp
  re-checked on `D_exec` directly**, which it is: `D_exec = 17.100000 > 14.969697`. The
  excursion is named, not widened — `l017.json` was thereafter selected on `B` in-band
  (`1.6757`) and `D_exec` above its predecessor, to avoid compounding it.
- **F-L16-3 (wrong-name expectations).** The first pass of the negative-control table named the
  clause each mutation *should* trip; three of six measurements disagreed. The expectations were
  corrected **to the measured names**, and `expect` is now a *list* of clauses any of which may
  legitimately name the refusal (a mutation aimed at a late gate can be caught by a stronger,
  earlier reader). A mutation that is accepted still fails the battery, so widening the list
  cannot make it vacuous.

### One negative control per gate (R-003c)

Each of the six gate codes the block introduced has exactly **one** control, run by
`scripts/attest-lv010-block.ts` (committed transcript: `scripts/attest-lv010-block.transcript.md`)
— 6/6 **CAUGHT**, each refused *by the gate it targets*, with the full refusing set printed so a
control caught for the wrong reason is visible. The controls are mutations of the **registered**
boards, never of shipped bytes:

| gate code | control (mutation) | coupling |
|---|---|---|
| `block-l1619-rung` | `l016`'s board with `par` re-stamped 12 → 14 (the file's claim disagrees with the ladder) | surgical: nothing else moves |
| `block-l1619-grid-coverage` | `l016` with `(1,5)` sealed in **both** phases — it leaves the reachable graph, 41 of 42 tiles visited | surgical: the **only** gate that fails; the board stays rule-legal (`validateLevel` ok) and `par` stays 12 |
| `block-l1619-device-existence` | `l016` with `d1` + `s1` dropped — the seal loses a door, so the goal **is** reachable all-OFF (`allOffShortest = 14`) | named: `lesson-switch-required` and gate (ii) also fire (three readers of one fact) |
| `block-l1619-escalation-cut` | the shipped `l015` board wearing id 16 — its `D_exec` is the cut itself (14.969697) | named: the rung gate fires too (par 10 ≠ 12) |
| `block-l1619-b-band` | `l016` relabelled as rung 17 — `B = 1.7000` is out of band and only rung 16 is a named excursion | named: the rung gate fires too |
| `block-l1619-tail-ceiling` | the shipped `l018` board wearing id 19 — an interior member in the terminal slot (`par 16` / `D_exec` 20.907923) | named: the rung gate fires too |

The clause each mutation *should* trip was corrected **to the measured name** in three of six
cases (F-L16-3 below), and a caught control's detail is a *list* of clauses: a mutation aimed at
a late gate can legitimately be caught by a stronger, earlier reader. A mutation that is
**accepted outright** still fails the battery, so the wide list cannot make a control vacuous.

### Where L16–L19 came from (reproducible)

```
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=a --cx=4          # geometry census
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=d --cx=3 --id=18 --geos=45 --write
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l018.json --rung=18   # at authoring time; the script now re-reads whichever path it is given
node_modules/.bin/tsx scripts/attest-lv010-block.ts                               # R-003c: law + bytes on the registered root set
node_modules/.bin/vitest run tests/solver/l16-l20-candidates.test.ts              # RED until QA re-points it at the root (§7)
```

L19 added `--stage=f` (the family census) and the grid/arity/window arguments:

```
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=f --w=7 --h=6 --id=19 --cxs=2,3,4 --seal=2-4
node_modules/.bin/tsx scripts/author-l16-candidates.ts --stage=d --w=7 --h=6 --cx=3 --id=19 \
    --seal=4-4 --drop=8 --geo=17 --geos=1 --swcap=30000 --write
node_modules/.bin/tsx scripts/prove-candidate.ts src/levels/candidates/l019.json --rung=19   # authoring-time path; the file now lives at src/levels/l019.json
```

`--w`/`--h` default to the shipped `7×6`, `--seal` to `2-3`, `--drop` to `4` and `--geo` to `0`, so
every L16–L18 command line above still reproduces byte-for-byte; `--geo`/`--geos` publish which
slice of the geometry list a run consumed, because a census that hides the rows it read is not a
census. `--drop` is the enumeration bound on `par − bare` (the press detour): the inherited value
encoded "each press costs 2 moves", which L17/L18 measured at 4 for a single press, so it is an
argument with the census printing what each setting yields rather than a law assumed to hold.

Stage D's lattice is a **full seal** enumeration: the doors are *every* neighbour of the goal
(a corner goal forces two, a goal against one edge forces three, an interior goal four) and only
the switch n-tuples are enumerated — capped per geometry (`--swcap`, default 1500, printed)
because the n-tuple count grows factorially. The cap is sampling, not a hidden filter: every
landed candidate was proved from its bytes afterwards, and a mutation battery of six controls
fails loudly if any of the obligations went slack. L19's own run set the cap above the family's
whole 4-tuple space, so its census is exhaustive rather than sampled.

`scripts/author-l16-candidates.ts` is rung-parameterised (`--id`, default 16) and the geometry
lattice carries a §6.1.4 clone guard: a spawn/goal/portal triple already present in the shipped
set or among the landed candidates is skipped outright, so a new rung can never be the previous
board with more moves. The script's *name* is historical — it authors whichever rung `--id` asks
for, which is why the L17 commit did not rename it (the L16 commit body cites the path).

**Metrics sidecar.** `docs/level-difficulty.report.json` is regenerated by
`node_modules/.bin/tsx scripts/solve-levels.ts --report` (the `--report` pattern: the report is a
read-out of the shipped bytes, never typed) and now carries **19** records, the four new ones with
their `sha256` content hashes of the registered bytes. `par` and `D_exec` quoted anywhere in this
file come from that solver read-out; the candidate-era notes are never the source.

### 2e-5 · L20 — the sealed landing, **REGISTERED** (R-003d)

| | |
|---|---|
| file | `l020.json` (was `candidates/l020.json`; `git mv`; blob `78acaed0921202eebf8bd3e8eba86d4e4d92be54` on both sides) |
| grid / walls | 7 × 6 · phase A `(3,0) (3,2) (3,4)` / phase B `(3,1) (3,3) (3,5)` — the same sealed `x = 3` column as §2e |
| device | `p1` `(2,5) ⇄ (5,1)` **activePhase A**; the landing `(5,1)` sits in a pocket `[5,1 6,0 6,1 6,2]` whose **only** exit is `d1` (red, 4 tiles `(4,1) (5,0) (5,2) (6,3)`) driven by `s1` `(6,0)`/A **inside** the pocket; the goal `(5,4)` is sealed by `d2`–`d5` (blue `(4,4) (5,3) (5,5) (6,4)`) on `s2` `(4,5)`/B, `s3` `(6,5)`/B, `s4` `(4,0)`/A, `s5` `(4,3)`/B |
| measured (ROOT bytes) | **`par 20`** (exact: `par(L15) + 2·5`) · `D_exec` **24.729412** · `B` **1.5765** (in band) · `T ≡ R ≡ 0` · `M` 4 · coverage **42/42** · `refusedBeforeEnteredTiles` 14 · all-OFF **UNSATISFIABLE** |
| the mechanism | the portal does not shorten the walk, it **changes the start**: the shortest plan is ORDERED — `land → press s1 → cross d1 → press a seal switch`; 252/252 par routes execute it, and **252/252 re-land through the landing portal** (the `leave` beat — P-1 readout) |
| why it is rung 5 | `24.729412 > 22.885157`: the first rung **above** the door-count full-seal device's census ceiling, because the **device** changed instead of the number being widened |

The root re-measure, the law delta, the negative controls and the P-1 answer live in `docs/ai-native-pipeline.md` §8.15; `block-l1619-tail-ceiling` now compares against **par 20 / `D_exec` 24.729412**.

### 2f. L21–L25 — Act II batch 1, **REGISTERED** (R-004a)

The five rungs the LV-012 `G` lattice produced (`docs/level-design.md` §7.2–§7.7, ADR-`design-0005`) were moved from the shelf to the dataset root exactly as L16–L20 were at R-003c/R-003d: `git mv`, **no content edit during the move**, blob identity proven (and `sha256` re-measured), and the root re-measured **before** any law edit, so the law was fitted to the boards and never the reverse.

| | |
|---|---|
| files | `l021.json` … `l025.json` (were `candidates/l021.json` …; `git mv`, rename 100 %) |
| byte identity | root blob == `551fd43:src/levels/candidates` blob **5/5**: `18d05965…` · `e8fcabd5…` · `a2331baf…` · `cb23369c…` · `6e4b10d1…` (sha256 `78df6c27…` · `de0b579b…` · `f435f8f5…` · `524aadbc…` · `afd6bc0e…`) |
| device | the **multi-pocket** class (§7.4 stage G): one portal pair, its far end a **walk-sealed pocket** whose only exit is a door driven from **inside** it, plus a **second** sealed room holding the goal and driven from elsewhere — so every shortest plan runs the forced `press(s_i) → cross(door(s_i))` chain in one shared order |
| measured (ROOT bytes) | **par 17 / 18 / 20 / 21 / 23** (solver-stamped, `parMatch` 5/5) · **`D_exec` 21.581395 / 22.584000 / 24.620000 / 25.604651 / 27.604651** · **`B` 1.5271 / 1.5280 / 1.5400 / 1.5349 / 1.5349** (in band 5/5) · `T ≡ R ≡ 0` ×5 · `M` 4 ×5 · coverage **42/42 ×5** · `refusedBeforeEnteredTiles` **17 ×5** · `parRoutes` / press-then-cross **12/12 · 16/16 · 20/20 · 90/90 · 72/72** · all-OFF **UNSATISFIABLE ×5** |
| the ladder | strictly rising on the execution axis with **no dip** (`Δ` +1.002605 / +2.036000 / +0.984651 / +2.000000). Reported **unfiltered**: `Δpar ≥ 2` holds on only **2 of 4** steps (`17 + 2·4 = 25 > 23`) — a measured consequence of the 7-wide par window, never re-selected away |
| §7.3 across-act clause | **discharged by the act's maximum**: L25 `27.604651` > Act I's registered peak (L20 `24.729412`) by **+2.875239**, and the registered gap is the measured gap. Headroom to the derived-exact Act II ceiling `29.0625` (printed `29.06`; §7.9 — **LV-016** aligned the stored constant with its formula) is **1.457849** — the earlier print `1.455349` was that same headroom read against the *rounded* form, and it survives only where a transcript carries it |
| the act's opening | L21 sits **−3.148017 below** L20. §7.3 calls that a **plateau relaxation at a `ΔM = 0` boundary**, honestly labelled — **never presented as a dip** (the batch introduces no mechanic: `M = 4` on every rung of both acts, which is what separates it from §6's dip). The published clause binds the **named rung's registered value and the band, never the direction** |
| the tail law | **did not move.** `BLOCK_L1619_IDS` is still `[16 … 20]`, `block-l1619-tail-ceiling` still judges **L20 at par 20 / `D_exec` 24.729412**, L20 was **not re-stamped**, and the five new rungs are **not** grafted onto the block: they prove under their own `act2-*` gates |
| the cut | still **frozen L1–L15 at `14.969697`**, now measured on **25** files with basis ids `[1 … 15]` — the L16–L20 block *and* the registered Act II batch are excluded from their own filter |

**The registered ladder row set** (`ACT_II_B1_LADDER`, re-measured from the **root** bytes by `prove-candidate`'s ladder mode, not read back from this table — the table is the human mirror of that stdout):

| rung | `par` | `D_exec` | `Δpar` (step / §7.2's `≥ 2` law) | `ΔD_exec` (step rise) | `ΔD_exec` vs Act I's peak `24.729412` |
|---|---|---|---|---|---|
| L21 `l021.json` | 17 | 21.581395 | — (act open) | — | **−3.148017** — the act opens **below** the peak: a plateau relaxation at a `ΔM = 0` boundary, never a dip |
| L22 `l022.json` | 18 | 22.584000 | +1 (**< 2**) | +1.002605 | −2.145412 |
| L23 `l023.json` | 20 | 24.620000 | +2 (**≥ 2**) | +2.036000 | −0.109412 |
| L24 `l024.json` | 21 | 25.604651 | +1 (**< 2**) | +0.984651 | +0.875239 |
| L25 `l025.json` | 23 | 27.604651 | +2 (**≥ 2**) | +2.000000 | **+2.875239** — the act's peak, the rung §7.3's across-act clause rides on |

`ΔD_exec` is **strictly positive on 4/4 steps** (the "ramp within the block, no dip" clause) while `Δpar ≥ 2` holds on only **2 of 4** — both printed by the instrument on the same run, so the pleasant column cannot be quoted without the honest one.

**The law the registration had to satisfy lives in `@/core/solver/policy`** (`LAW_PRECISION`, `ACT_II_PAR_FLOOR`, `ACT_II_PAR_CEILING`, `ACT_II_PAR_BAND`, `ACT_II_B_BAND`, `ACT_II_EXEC_BAND`, `ACT_II_B1_LADDER`, `ACT_I_REGISTERED_PEAK_*`, `ACT_II_B1_PEAK_*`, `ACT_II_B1_PRE_R004A_REGISTERED_TAIL_EXEC`, `ACT_II_B1_OPEN_RELIEF_*`, `ActTailClause`, `actScaleLawReading`, `actScaleTailGuards`, `act2Batch1Gates`), and it is written the R-003d way — with the **anti-tautology guards named as pre/post-registration constants**, so a future edit that silently relabels or restamps the record **FAILs** instead of quietly re-basing the law. Both bands are **derived-exact and inclusive at both ends** (§7.9 / ADR-design-0007): `ACT_II_EXEC_BAND` is computed from `[par_floor + 3·B_lo, par_ceiling + 3·B_hi]` = `[19.75, 29.0625]`, so `[19.75, 29.06]` is now **printed display text only** — **LV-016** retired the rounded literal the law module used to store (and the second one in `scripts/author-l21.ts`), with no verdict changing on any registered or shelf rung.

- **Six dataset-level tail clauses** (`act-tail-act-i-peak-pin`, `act-tail-act-ii-peak-pin`, `act-tail-peak-advantage`, `act-tail-pre-r004a-standard`, `act-tail-l20-not-restamped`, `act-tail-l21-open-relief`), each with **exactly one** control refused **by name**: relabel Act I's basis, restamp the batch peak, collapse the rise to equality, restamp the pre-registration standard, graft L21–L25 onto the block's tail, or drop the act-open rung out of its band.
- **The mirror-image tautology is refused too.** A validator that demanded a cross-act **monotone rise** (`L21 > L20`) would have **refused a registered rung** — so the relief clause is satisfied by the registered relief *and* by an in-band value **in either direction** (both probed live: an in-band *rise* on the opening rung PASSes; the registered relief carried on the **wrong rung** FAILs by name; an out-of-band value FAILs by name). The clause names the act-open member; it never infers the row from the number.
- **Six per-member gates + the shared reader** (`act2-registered-rung`, `act2-exec-band`, `act2-b-band`, `act2-exec-identity`, `act2-coverage`, `act2-act-peak`, plus the unchanged `shortest-solution-presses-switch-and-crosses-door`), one control each, **7/7 caught on the registered bytes**, and **0** act2 violations on the registered set (`21:[] 22:[] 23:[] 24:[] 25:[]`).
- `act-peak` is a **per-member gate on the peak rung only** — demanding the across-act clause of every member would demand 20 padded rungs the gates forbid.

**The evidence run is one command per claim.** `npx tsx scripts/attest-r004a-act2.ts` re-derives everything from the root bytes (byte identity · the registered ladder · the six clauses re-measured · the control battery) and, in its last section, **executes** `scripts/prove-candidate.ts` in ladder mode over the registered files, so the `CUT` line and the `LADDER RESULT` printed there are that instrument's own stdout rather than a quote copied into this file. Transcript: `scripts/attest-r004a-act2.transcript.md` (exit 0, `RESULT: REGISTERED-MATCH`); the block-law transcript `scripts/attest-lv010-block.transcript.md` was regenerated on this tree and differs from the committed R-003d bytes in **exactly two lines** — the worktree path, and the census line (`root 25 files = 15 basis + 5 rungs + 5 Act II batch-1 rungs`) — which is the L20-was-not-touched proof.

### 2g. L26–L35 — Act II batches 2 + 3, **REGISTERED** (R-005a)

The ten rungs the LV-013 / LV-014 `G` lattices produced (`docs/level-design.md` §7.3.1) were moved
from the shelf to the dataset root by the R-003c / R-003d / R-004a register-verbatim precedent:
`git mv`, **no content edit during the move**, blob identity proven (and the sidecar `sha256`
re-measured), and the root re-measured **before** any law edit, so the law was fitted to the boards
and never the reverse.

| | |
|---|---|
| files | `l026.json` … `l035.json` (were `candidates/l026.json` …; `git mv`, rename 100 %, 10 files / 0 insertions) |
| byte identity | root blob == `36ffe0b:src/levels/candidates` blob **10/10**: `00127e95…` · `0aacf6ae…` · `96d26e80…` · `f91a0ffb…` · `b003f01f…` · `02ed0599…` · `c9878551…` · `a722f1c5…` · `fb3671db…` · `0d562c7c…` (sidecar content `sha256` `2dac5f24…` · `5aca24e7…` · `b2d722c4…` · `3cf31ddd…` · `148b707f…` · `1fa77cfc…` · `831ef9d3…` · `81b400a5…` · `9d7f1404…` · `f039a6f4…`) |
| device | the **multi-pocket** class, unchanged from batch 1 (§7.4 stage G): one portal pair whose far end is a **walk-sealed pocket** exited only through a door driven from **inside** it, plus sealed rooms holding the goal — so every shortest plan runs the forced `press(s_i) → cross(door(s_i))` chain in one shared order. Batches 2/3 differ from batch 1 in **depth**, not in kind: batch 2 forces **4** presses (batch 1's 3), batch 3 **5** |
| skeletons | batch 2 keeps the `x = 2` alternating wall column (walls A `(2,1)`, `(2,3)`, `(2,5)` / B `(2,0)`, `(2,2)`, `(2,4)`); batch 3 opens a **new** skeleton at `x = 1` (A `(1,0)`, `(1,2)`, `(1,4)` / B `(1,1)`, `(1,3)`, `(1,5)`) with **five** doors and five switches |
| measured (ROOT bytes) | **par 17 / 18 / 20 / 21 / 23** (batch 2) then **19 / 22 / 22 / 24 / 24** (batch 3) — solver-stamped, `parMatch` 10/10 · `D_exec` **21.560241 / 22.560241 / 24.548193 / 25.548193 / 27.566265 / 23.204167 / 26.050000 / 26.069191 / 28.126943 / 28.339426** · `B` **1.5201 / 1.5201 / 1.5161 / 1.5161 / 1.5221 / 1.4014 / 1.3500 / 1.3564 / 1.3756 / 1.4465** (in band 10/10) · `T ≡ R ≡ 0` ×10 · `M` 4 ×10 · coverage **42/42 ×10** · `refusedBeforeEnteredTiles` **19 ×5** (batch 2) / **22 ×5** (batch 3) · `dualPhaseTiles` 12/12/12/12/12 then 6 ×5 · all-OFF **UNSATISFIABLE ×10** |
| the cut | still **frozen L1–L15 at `14.969697`**, now measured on **35** files with basis ids `[1 … 15]` — the L16–L20 block *and* both Act II batches are excluded from their own filter |

**The registered ladder row set** (`ACT_II_B2_B3_LADDER`, re-measured from the **root** bytes by
`prove-candidate`'s ladder mode — the table is the human mirror of that stdout):

| rung | `par` | `D_exec` | `Δpar` (step) | `ΔD_exec` (step) | note |
|---|---|---|---|---|---|
| L26 `l026.json` | 17 | 21.560241 | — (batch open) | — | the **labelled seam** — `−6.044410` below L25 (§7.3.1 instance 2) |
| L27 `l027.json` | 18 | 22.560241 | +1 | +1.000000 | |
| L28 `l028.json` | 20 | 24.548193 | +2 | +1.987952 | |
| L29 `l029.json` | 21 | 25.548193 | +1 | +1.000000 | |
| L30 `l030.json` | 23 | 27.566265 | +2 | +2.018072 | the batch-2 peak (the rung §7.3's across-act clause rode on while batch 3 was a shelf candidate) |
| L31 `l031.json` | 19 | 23.204167 | — (batch open, **new skeleton**) | −4.362098 | the **second labelled seam** (§7.3.1 instance 3) |
| L32 `l032.json` | 22 | 26.050000 | +3 | +2.845833 | the batch's narrowest route set (6 shortest routes) |
| L33 `l033.json` | 22 | 26.069191 | +0 | +0.019191 | the **shallow tooth** of the sawtooth |
| L34 `l034.json` | 24 | 28.126943 | +2 | +2.057752 | |
| L35 `l035.json` | 24 | 28.339426 | +0 | +0.212483 | the **act's registered tail** |

`ΔD_exec` is **strictly positive on 9/9** adjacent steps and every registered step keeps `D_exec`
inside the act band; `Δpar ≥ 2` holds on only **4 of 8** steps — both columns are printed by the
instrument on the same run, so the pleasant column cannot be quoted without the honest one.

**Sawtooth, lawful by §7.3 with labels (both directions stated, direction never asserted).** The
act's adjacent steps contain **12 rises and 2 drops**: the drops are exactly the two **named,
pre-published §7.3.1 reliefs** and no other adjacent step falls. The five R-005a clauses therefore
assert the *registered values* of the named rungs and band membership — **never monotonicity**, and
never a sign test on the seam. The instrument prints this as a NOTE rather than probing it live:
a "rise variant" probe would mean re-implementing the clause's own comparison against a spec the
law does not publish, so the direction claim is carried by the clause's detail string and by the
labels quoted verbatim — never by a probe that could not fail. What *is* measured is that **every**
adjacent drop is a named instance (an unnamed relief, an out-of-band seam and an omitted rung all
FAIL by name in the instrument).

**The act tail moved, by the R-003d rule (re-derived, never re-stamped).**

| constant | value | meaning |
|---|---|---|
| `ACT_II_PRE_R005A_REGISTERED_TAIL_EXEC` | 27.604651 at L25 | the registered tail **as it stood** before this ticket — batch 1's peak (R-004a's record) |
| `ACT_II_R005A_REGISTERED_TAIL_EXEC` | 28.339426 at L35 | the registered tail **after** this ticket — re-derived as the maximum over the whole registered act (`ACT_II_REGISTERED_IDS`, 21–35) |
| `ACT_II_R005A_TAIL_ADVANTAGE` | 0.734775 | the measured rise between them |
| `ACT_II_REGISTERED_PEAK_ADVANTAGE_VS_ACT_I` | 3.610014 | §7.3's across-act clause, now read over the **whole** registered act (28.339426 − 24.729412); batch 1's own identity (2.875239) is kept alive in clause 2 |
| `ACT_II_R005A_TAIL_HEADROOM_TO_EXEC_CEILING` | 0.723074 | `29.0625 − 28.339426`, derived-exact (§7.9); the printed operand `29.06` would give `0.720574`, which is why the rounding is retired |

**Eleven clauses, split by owner, partition asserted.** R-004a's six are unchanged
(`ACT_TAIL_R004A_CLAUSE_IDS`); R-005a adds five (`ACT_TAIL_R005A_CLAUSE_IDS`:
`act-tail-r005a-registered-rows`, `-tail-pin`, `-pre-standard`, `-exec-headroom`, `-seam-reliefs`),
each with exactly one control refused **by name** in `scripts/attest-r005a-reg35.ts`. A coverage
reading asserts the two lists **partition** the reported set, so a twelfth clause added later has to
be given a home rather than silently left without a control.

**Six per-member gates, reused not re-derived.** The ten rungs are judged by the same `act2-*`
family R-004a opened (`act2-registered-rung`, `act2-exec-band`, `act2-b-band`, `act2-exec-identity`,
`act2-coverage`, `act2-act-peak`, plus the unchanged
`shortest-solution-presses-switch-and-crosses-door`) — the act's device and gate set did not change,
so no new code was invented; **6/6 R-005a controls are CAUGHT by name** and the registered set
reports **0** act2 violations.

**What R-005a did *not* do.** It re-stamped **no** R-004a-era row (the five L21–L25 rows survive
byte-identical and are re-measured as such in the attest script), it did **not** graft any Act II id
onto `BLOCK_L1619_IDS` (still `[16 … 20]`, `block-l1619-tail-ceiling` still judges **L20 at par 20 /
`D_exec` 24.729412`**), and it did **not** widen the cut.

**Named gate-family gap (measured, booked, not papered over).** `auditLevel` dispatches a rung's
per-member gate family from its **documented lesson row**. **R-005a2 added the ten rows**
(`l026`–`l035` in `DOCUMENTED_LESSONS`: `switchRequired: "required"` measured on the all-OFF world,
`obligation: null`) — so the ten rungs are documented — but they still carry **no registered per-rung
gate family**: the act's only per-rung reader (`act2Batch1Gates`) keys its rung on `ACT_II_B1_IDS`
and reads `ACT_II_B1_LADDER`, so a dispatched value would either mis-key these boards (a FAIL on
registered bytes — batch 1's ladder ends at par 23 while `l026` is par 17) or graft an Act II rung
onto another block's law. Their proof is therefore still the family-gate ladder run
(`prove-candidate --family=g`), not a per-id dispatch, and this is asserted as a printed reading in
`scripts/attest-r005a-reg35.ts` (`audit gate counts across the ten rungs: [0]` — the script
**reddens** the day a `act-2-batch-2/3` **family** lands, so the gap cannot outlive its remedy; its
detail line naming *that* event is itself corrected here, and the transcript refreshed with a note).
Booked for R-005b/c: design + QA owe one control per new code plus the family-keyed dispatch behind
those two obligations.

**The evidence run is one command per claim.** `npx tsx scripts/attest-r005a-reg35.ts` re-derives
everything from the root bytes (byte identity · both registered ladders · the eleven clauses
re-measured · the partition · the six R-005a controls · the sawtooth with both drops named · the
derived Δ and the verbatim label anchors · the §7.9 headroom arithmetic) and, in its second section,
**executes** `scripts/prove-candidate.ts` in ladder mode over the ten registered files, so the
`LADDER RESULT` line quoted here is that instrument's own stdout rather than a quote copied into
this file. Transcript: `scripts/attest-r005a-reg35.transcript.md` (exit 0, `RESULT: REGISTERED-MATCH`).

### 2h. L36–L40 — Act II batch 4 (the act's **closing** batch), **REGISTERED** (R-006a)

The five rungs LV-017 authored and proved (`docs/level-design.md` §7.4 stage G, on the batch-4 rule
published in that ticket's step 0) were moved from the shelf to the dataset root by the same
register-verbatim precedent as every registration before it: `git mv`, **no content edit during the
move**, blob identity proven *and* the file `sha256` re-measured, and the root re-measured **before**
any law edit, so once again the law was fitted to the boards and never the reverse.

| | |
|---|---|
| files | `l036.json` … `l040.json` (were `candidates/l036.json` …; `git mv`, rename 100 %, 5 files / 0 insertions / 0 deletions) |
| byte identity | root blob == `e30bbaccf:src/levels/candidates` blob **5/5**: `adff8c1e…` · `c0eb8660…` · `76dcc3e0…` · `241d669d…` · `e6f7359d…` — and the file `sha256` was **the same bytes before and after the move** (`5b23e8ee…` · `cd4c8edb…` · `a65ab804…` · `e5f9e8be…` · `701e46ee…`). The shelf `src/levels/candidates/` now holds **no level file at all** |
| device | **batch 3's device class, unchanged** — the 4-pocket / 5-door / **forced 5-press** chain (`p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4 < p4 < d5`), one portal pair whose far end is a walk-sealed landing. What changes is the **frame**: this batch reads §7.4's **second, unused** frame `7 × 7` at `CX = 1` (batch 3 read `7 × 6`), and the portal pair here is `(0,1) ↔ (4,0)` at phase A. §6 does not fire: `ΔM = 0` — no mechanic is introduced |
| skeleton | batch 3's skeleton, carried onto the taller frame: the `x = 1` alternating wall column (A `(1,0)`, `(1,2)`, `(1,4)`, `(1,6)` / B `(1,1)`, `(1,3)`, `(1,5)`) with five doors and five switches |
| measured (ROOT bytes) | **par 18 / 20 / 22 / 24 / 24** — solver-stamped, `parMatch` 5/5 · `D_exec` **22.301282 / 24.252174 / 26.200000 / 28.185897 / 28.455319** · `B` **1.4338 / 1.4174 / 1.4000 / 1.3953 / 1.4851** (in band 5/5) · `T ≡ R ≡ 0` ×5 · `M` 4 ×5 · coverage **49/49 ×5** · `dualPhaseTiles` **7 ×5** · `refusedBeforeEnteredTiles` **25 / 25 / 25 / 25 / 24** · every `par` route press-then-cross (**36/36 · 72/72 · 48/48 · 162/162 · 30/30**) · all-OFF **UNSATISFIABLE ×5** (`11/936 · 11/920 · 11/920 · 11/936 · 11/940` reachable states keep every switch OFF, and no goal state among them) |
| the cut | still **frozen L1–L15 at `14.969697`**, now measured on **40** files with basis ids `[1 … 15]` — the L16–L20 block *and* all four Act II batches are excluded from their own filter |

**The registered ladder row set** (`ACT_II_B4_LADDER`, re-measured from the **root** bytes — the
table is the human mirror of that stdout):

| rung | `par` | `D_exec` | `B` | `Δpar` (step) | `ΔD_exec` (step) | note |
|---|---|---|---|---|---|---|
| L36 `l036.json` | 18 | 22.301282 | 1.4338 | — (batch open) | — | the **labelled seam** — `−6.038144` below L35 (§7.3.1 instance 4) |
| L37 `l037.json` | 20 | 24.252174 | 1.4174 | +2 | +1.950892 | |
| L38 `l038.json` | 22 | 26.200000 | 1.4000 | +2 | +1.947826 | |
| L39 `l039.json` | 24 | 28.185897 | 1.3953 | +2 | +1.985897 | the batch's widest route set (162 shortest routes) |
| L40 `l040.json` | 24 | 28.455319 | 1.4851 | +0 | +0.269422 | the **act's registered tail** — the within-par **maximum**, so §7.3.2's peak rides as late as the family permits |

`ΔD_exec` is **strictly positive on 4/4** adjacent steps and every registered step keeps `D_exec`
inside the act band; `Δpar ≥ 2` holds on only **3 of 4** — both columns are printed by the instrument
on the same run, so the pleasant column cannot be quoted without the honest one. The fourth step is
`24 → 24`, which P2's window cannot cover once a five-member ladder is derived off a band that
supports four pars: the ladder is **derived, not re-picked to look smooth**, and the same instrument
prints it that way.

**Nothing was re-stamped, and the growth is the only thing that moved.** `concat`ing batch 4 onto
the act widens `ACT_II_REGISTERED_IDS` to `[21 … 40]`; R-005a's basis survives as its own constant
(`ACT_II_R005A_ERA_IDS`, ids 21–35), because a clause that *records what a registration did* must
not follow the dataset while a clause that *states a property of the act* must. Measured on the
landed bytes: of the 482 shipped lines that are the documented-lesson table plus every R-004a /
R-005a constant declaration plus every registered ladder row 21–35, this registration touches
**zero**.

| constant | value | meaning |
|---|---|---|
| `ACT_II_PRE_R006A_REGISTERED_TAIL_LEVEL_ID` / `_EXEC` | 35 / 28.339426 | the registered tail **as it stood** before this ticket — **alias-typed** to R-005a's constants, so the standard cannot drift from the tail the previous registration left |
| `ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID` / `_EXEC` | 40 / 28.455319 | the registered tail **after** this ticket — re-derived as the maximum over the whole registered act (`ACT_II_REGISTERED_IDS`, 21–40) |
| `ACT_II_R006A_TAIL_ADVANTAGE` | 0.115893 | the measured rise between them |
| `ACT_II_R006A_REGISTERED_PEAK_ADVANTAGE_VS_ACT_I` | 3.725907 | §7.3's across-act clause, read over the **whole** registered act (28.455319 − 24.729412); batch 1's own identity (2.875239) stays in clause 2 and R-005a's act-level record (3.610014) stays pinned in clause 14 |
| `ACT_II_R006A_TAIL_HEADROOM_TO_EXEC_CEILING` | 0.607181 | `29.0625 − 28.455319`, derived-exact (§7.9); the printed operand `29.06` would give `0.604681`, which is why the rounding is retired |

**The act's maximum moved at the last rung, and the clause that says so is a *reading*.** R-005a
discharged §7.3.2's act-close obligation at L35, so this registration owes **no** peak and re-runs no
obligation — a refusal branch invented now would be a gate built to be passed. The registerable fact
is that the act's registered maximum is now **L40 / 28.455319**: `+0.115893` over the R-005a tail it
supersedes, `+3.725907` over Act I's registered peak, `+0.850668` over the registered batch-1 peak,
with **0.607181** of derived-exact headroom to `ACT_II_EXEC_BAND[1] = 29.0625`. Note that L39
(`28.185897`) sits **below** the R-005a tail by `−0.153529`: the maximum did not move at the batch's
opening or its interior rungs, it moved at its **closing** rung, which is the within-par maximum of
its par. §7.3.1's **fourth** instance is that seam, registered verbatim with its provenance — the
label was published in rule commit `b9dac54` **before** the census (`da0e3ac`) and before the bytes,
which is the only thing that makes a relief registrable at all.

**Sixteen clauses, split by owner, partition asserted.** R-004a's six are unchanged
(`ACT_TAIL_R004A_CLAUSE_IDS`); R-005a's five are unchanged in *value and verdict*
(`ACT_TAIL_R005A_CLAUSE_IDS`, now reading the frozen era basis); R-006a adds five
(`ACT_TAIL_R006A_CLAUSE_IDS`: `act-tail-r006a-registered-rows`, `-tail-pin`, `-pre-standard`,
`-exec-headroom`, `-seam-reliefs`). A coverage reading asserts the three lists **partition** the
reported set — measured **6 + 5 + 5 = 16 = the report, 0 unclaimed** — so a seventeenth clause added
later has to be given a home rather than silently left without a control. Exactly **one** shipped
clause's pin expression moved (R-004a's live across-act clause, `act-tail-peak-advantage`), for the
reason R-005a had already moved it once: a clause about the act's maximum that kept reading the
previous registration's tail would publish a **stale act maximum**, which is the failure it exists
to catch. No shipped clause's *value* moved and no R-004a / R-005a constant was re-typed.

**The seam clause's tight margins are printed, not smoothed.** The derived `ΔD_exec` of instance 4
differs from the published `−6.038144` by `4.6381e-7`, and the L35 end by `4.1253e-7`, against
`LAW_PRECISION = 5e-7`. Both are inside it and both are determined by bytes frozen at a `sha256` the
sidecar re-verifies, so the pass is a measurement rather than a coin flip — the same class as R-005a's
shipped instance 3, whose L31 end sat at 0.67 of the tolerance. The reading prints both numbers on
every run.

**Six per-member gates, reused not re-derived.** These five rungs are judged by the same `act2-*`
family R-004a opened (`act2-registered-rung`, `act2-exec-band`, `act2-b-band`, `act2-exec-identity`,
`act2-coverage`, `act2-act-peak`, plus the unchanged
`shortest-solution-presses-switch-and-crosses-door`) — the act's device and gate set did not change,
so no new code was invented, and the registered set reports **0** act2 violations.

**Named gate-family gap (measured, booked, not papered over — and now with a second, harder reason).**
`auditLevel` dispatches a rung's per-member gate family from its **documented lesson row**. These five
rungs now have their rows (`l036`–`l040`, `switchRequired: "required"` measured on the all-OFF world,
`obligation: null`), but they carry **no registered per-rung gate family**, for the same structural
reason batches 2–3 do not: `act2Batch1Gates` keys its rung on `ACT_II_B1_IDS` and reads
`ACT_II_B1_LADDER`, so a dispatched value would either mis-key these boards (batch 1's ladder ends at
par 23 while `l036` is par 18 — a FAIL on registered bytes) or graft an Act II rung onto another
block's law. A **second, measurable** blocker exists beyond the missing reader: the QA-owned pin
`tests/solver/l16-l20-candidates.test.ts:285` asserts that the **last shipped row's** obligation is
`null`, so writing `act-2-batch-4` onto L40 would redden a green test rather than reveal a fault. The
honest value until the family-keyed dispatch exists is therefore `null` **with the gap named in the
rows themselves**; the remedy (a `LADDER`-keyed reader behind the `act-2-batch-4` obligation, plus
QA's one-control-per-code table and the re-pin) stays booked, and this registration does not fabricate
an obligation to make a gate look discharged.

**Two instrument findings stand beside the accepts, as LV-017 published them before their fixes.**
F-L36-1 (the generator's cut floor had been raised by the registered Act II rungs, so a `par ≥ 24`
ladder was silently reachable — fixed to read the frozen L1–L15 basis, with the divergence printed on
every run) and F-L36-2 (a census line claimed coverage it did not measure — label repaired with the
blast radius re-measured rather than asserted). Both are recorded in `docs/ai-native-pipeline.md`
§8.24 and in `scripts/author-l36-l40.transcript.md` / `scripts/prove-candidate-l3640.transcript.md`;
neither was smoothed, and the bytes they describe are the bytes registered here.

**What R-006a did *not* do.** It re-stamped **no** earlier row (the fifteen L21–L35 rows and every
R-004a / R-005a clause survive byte-identical and are re-measured as such), it did **not** graft any
Act II id onto `BLOCK_L1619_IDS` (still `[16 … 20]`, `block-l1619-tail-ceiling` still judges **L20 at
par 20 / `D_exec` 24.729412`**), it did **not** widen the cut, and it did **not** touch `tests/**`
(`EXPECTED_LEVEL_COUNT` and every count-derived pin still read 35 and are RED until QA re-books them —
R-006c) or the registry (R-006b).

**Re-verification, on demand, without trusting this file.** `npx tsx scripts/validate-levels.ts`
(40/40, 0 errors) and `npx tsx scripts/solve-levels.ts --audit src/levels` (40/40 PASS, `par`
verified 40/40) re-derive the measured rows; the act-scale clauses are re-derived by
`measureActScaleReading` / `actScaleTailGuards` on any set of levels, and this registration's
attest instrument is named in §7e.

### 2i. L41–L45 — Act III batch 1 (GD-012's opener: the first **ACT BOUNDARY** in the set), **REGISTERED** (R-007)

The five rungs LV-018 authored and proved (`docs/level-design.md` §7.10, **ADOPTED + USER-APPROVED
2026-10-19**; `docs/ai-native-pipeline.md` §8.26) were moved from the shelf to the dataset root by the
same register-verbatim precedent as every registration before it: `git mv`, **no content edit during the
move**, blob identity proven *and* the file `sha256` re-measured, and the root re-measured **before**
any law edit, so once again the law was fitted to the boards and never the reverse.

| | |
|---|---|
| files | `l041.json` … `l045.json` (were `candidates/l041.json` …; `git mv`, rename 100 %, 5 files / 0 insertions / 0 deletions) |
| byte identity | root blob == `82dd808:src/levels/candidates` blob **5/5**: `a07f7846…` · `d130315e…` · `ae18e42b…` · `a4da9d38…` · `a4d8860a…` — and the file `sha256` was **the same bytes before and after the move** (`e3fe42fb…` · `6d631d5b…` · `c749fca3…` · `eb6cdf6b…` · `e72d5446…`). The shelf `src/levels/candidates/` now holds **no level file at all** — re-read as evidence, because a copy would have left them there |
| successor | **`l046.json` is absent from the root *and* from the shelf by reading both directories**, and the shelf is **UNBOOKED**: this ticket names no next batch anywhere |
| device | **batch 4's device class, unchanged** — the 4-pocket / 5-door / **forced 5-press** chain (`p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4 < p4 < d5`), one portal pair whose far end is a walk-sealed landing. §7.10.5's YAGNI executed literally: **zero** new mechanics, `ΔM = 0`, so §6's dip law does **not** fire and no new painter seam is implied. The **`H` (both-pair)** composition and the **XOR door** stay an explicit **NON-CLAIM** handed forward by name (§8.26) |
| skeleton | the `x = 1` alternating wall column (A `(1,0)`, `(1,2)`, `(1,4)`, `(1,6)` / B `(1,1)`, `(1,3)`, `(1,5)`) with five doors and five switches — batches 3–4's skeleton on the same proven frame `7 × 7` at `CX = 1`, re-drawn per rung (the per-rung door sets are in the table in §0) |
| measured (ROOT bytes) | **par 20 / 22 / 24 / 26 / 26** — solver-stamped, `parMatch` 5/5 · `D_exec` **24.257329 / 26.238773 / 28.213816 / 30.225216 / 30.455319** · `B` **1.4191 / 1.4129 / 1.4046 / 1.4084 / 1.4851** (in band 5/5) · `T ≡ R ≡ 0` ×5 · `M` 4 ×5 · coverage **49/49 ×5** (the whole `7×7` frame) · `dualPhaseTiles` **7 ×5** · `refusedBeforeEnteredTiles` **25 / 25 / 26 / 25 / 24** · every `par` route press-then-cross (**48/48 · 336/336 · 27/27 · 27/27 · 30/30**) · all-OFF **UNSATISFIABLE ×5** (`11/921 · 11/913 · 11/912 · 11/928 · 11/940` reachable states keep every switch OFF, and no goal state among them) |
| the cut | still **frozen L1–L15 at `14.969697`**, now measured on **45** files with basis ids `[1 … 15]` — the L16–L20 block, all four Act II batches *and* Act III batch 1 are excluded from their own filter |

**The registered ladder row set** (`ACT_III_B1_LADDER`, re-measured from the **root** bytes — the
table is the human mirror of that stdout):

| rung | `par` | `D_exec` | `B` | `Δpar` (step) | `ΔD_exec` (step) | note |
|---|---|---|---|---|---|---|
| L41 `l041.json` | 20 | 24.257329 | 1.4191 | — (act open) | — | the **labelled `act-open` seam** — `−4.197990` below L40 (§7.3.1 instance 5) |
| L42 `l042.json` | 22 | 26.238773 | 1.4129 | +2 | +1.981444 | the batch's widest route set (336 shortest routes) |
| L43 `l043.json` | 24 | 28.213816 | 1.4046 | +2 | +1.975043 | the batch's narrowest route set (27); the only rung **below** the Act II comparator (`−0.241503`) |
| L44 `l044.json` | 26 | 30.225216 | 1.4084 | +2 | +2.011400 | the act's **new axis** (`par 26`) and its deepest search (`maxDepth` 47) |
| L45 `l045.json` | 26 | 30.455319 | 1.4851 | +0 | +0.230104 | the **act's registered tail** — the within-par **maximum**, so §7.3's clause rides as late as the family permits |

`ΔD_exec` is **strictly positive on 4/4** adjacent steps and every registered step keeps `D_exec`
inside the act band; `Δpar ≥ 2` holds on only **3 of 4** (the last step is `26 → 26` — O2's repeated
truncated top, and §7.10.2's `par 28` is **reserved**, ABSENT rather than substituted). Both columns are
printed by the instrument on the same run, so the pleasant column cannot be quoted without the honest one.

| constant | value | meaning |
|---|---|---|
| `ACT_III_EXEC_BAND` | `[23.7500, 33.0625]` | `20 + 3·1.2500` … `28 + 3·1.6875`, read from the module as **derived-exact** (the printed `[23.75, 33.06]` is a display rounding, §7.9) |
| `ACT_III_PRE_R007_REGISTERED_TAIL_LEVEL_ID` / `_EXEC` | 40 / 28.455319 | the registered tail **as it stood** before this ticket — **alias-typed** to R-006a's constants, so the standard cannot drift from the tail the previous registration left |
| `ACT_III_REGISTERED_TAIL_LEVEL_ID` / `_EXEC` | 45 / 30.455319 | the registered tail **after** this ticket — **re-derived** as the maximum over Act III's own ladder (`ACT_III_B1_LADDER`) |
| `ACT_III_TAIL_ADVANTAGE` | 2.000000 | the measured rise between them (`30.455319 − 28.455319`) |
| `ACT_III_REGISTERED_PEAK_ADVANTAGE_VS_ACT_II` | 2.000000 | §7.3's across-act clause, read over Act III's registered maximum; Act II's own record (`3.725907`) stays its own datum and is **not** re-stamped |
| `ACT_III_TAIL_HEADROOM_TO_EXEC_CEILING` | 2.607181 | `33.0625 − 30.455319`, **derived-exact**; the printed operand `33.06` would give `2.604681` |

**The first act boundary is a re-derived identity, not a restamp — and that required the law to leave
Act II's basis.** Act II's tail keeps its own constants and Act III's tail is the maximum over *its*
ladder, so the move is the measured `+2.000000` and a single edit to either end fails. The *same*
number appears twice (as `ACT_III_TAIL_ADVANTAGE` and as
`ACT_III_REGISTERED_PEAK_ADVANTAGE_VS_ACT_II`) for a **structural** reason the instrument states out
loud — the pre-R-007 standard **is** Act II's tail and Act III's maximum **is** its own tail — so the
identity is proven **separable** from a restatement by a **dedicated standard-injection control**: moving
the standard fails exactly the clause that reads it and nothing else. The forty previously registered
rows and their `sha256`s are **byte-identical**; **no earlier rung is re-stamped**.

**Twenty-two clauses, split by owner, partition asserted.** R-004a's six (`ACT_TAIL_R004A_CLAUSE_IDS`),
R-005a's five (`ACT_TAIL_R005A_CLAUSE_IDS`), R-006a's five (`ACT_TAIL_R006A_CLAUSE_IDS`) and R-007's six
(`ACT_TAIL_R007_CLAUSE_IDS`) are read as **22 claimed / 22 distinct / 0 unclaimed** by **all four**
instruments, so a twenty-third clause added later has to be given a home rather than silently left
without a control. **Both directions of the act boundary are probed live**: moving the historical era
basis fails exactly the historical clauses and leaves Act III's green; moving the live Act III reading
fails exactly Act III's value clauses and leaves the historical ones green.

**Opening a third act exposed a stale reading, and it was measured rather than argued.** Act I's basis is
the *complement* of the registered later acts, so with five Act III rungs in the root it had begun
absorbing **Act III's** tail instead of Act I's own registered maximum. The basis now excludes **both**
`ACT_II_REGISTERED_IDS` and `ACT_III_B1_IDS` (`measureActScaleReading`); after the fix **all three older
attests exit 0 with 0 DIVERGENT** and Act I reads its registered maximum `24.729412` at L20 again. The
same class of finding forced **one disclosed instrument change**: `measureCut()`'s basis now carries
`ACT_III_B1_IDS`, because with the five rungs inside the prover's own census the first Act III ladder run
after the move **FAILED `escalation D_exec=24.257329 > CUT 30.455319` ×5** — the generator's cut floor had
silently become Act III's own tail, which is the **F-L36-1** shape one act later.

**Six per-member gates, reused not re-derived, and one named gap.** These five rungs are judged by the
same `act2-*` family R-004a opened (`act2-registered-rung`, `act2-exec-band`, `act2-b-band`,
`act2-exec-identity`, `act2-coverage`, `act2-act-peak`, plus the unchanged
`shortest-solution-presses-switch-and-crosses-door`) — the device and the gate set did not change, so no
new code was invented and the registered set reports **0** act2 violations. But as with batches 2–4, these
rungs carry **no registered per-rung gate family**: `auditLevel` dispatches that family from the lesson
row, and every `act-2-batch-*` obligation keys on an Act II id list *and* its ladder, so dispatching one
here would mis-key these boards (batch 1's ladder ends at par 23 while `l041` is par 20) or graft an Act II
rung onto another act's law. The honest value is therefore `obligation: null` **with the remedy named in
the row itself**: an `act-3-batch-1` obligation behind an `ACT_III_B1_LADDER`-keyed reader, plus one
control per new code. Until it lands, the rungs' proof is the `--act=3 --family=g --ladder=41…45` run
(5/5 ACCEPT, 65/65 named controls) and `scripts/attest-r007-reg45.ts` keeps asserting the gap's existence
(`[0]` families) so the gap cannot outlive its remedy in silence. Each row's `switchRequired` is
**measured** (`"required"`: the all-OFF world is UNSATISFIABLE ×5), never inherited.

**Two instrument findings ride this registration, each disclosed rather than smoothed.** **`F-L41-4`**
(its own commit): the ladder/peak detail lines named *Act I's peak* and *the Act II ceiling* while
printing the previous act's registered maximum and Act III's ceiling — the labels are now **act-aware**
and the claim "no verdict moved" is *measured*: the Act II 20-rung run is **byte-identical** before/after
(`diff` **0 lines**), the Act III run differs in **7 changed line pairs with 0 numeric differences**
(`diff` 28 lines), `LADDER RESULT: PASS (5/5 …, 65/65)` on both sides, and the probe still returns
**exit 1** on exactly **L45** with **4/5 ACCEPT**. **`F-R007-1`**: an R-006a clone-guard detail line
printed a **live** total under an era label (*ids 1–40 ⇒ 41* on a 45-file tree) — found by re-diffing a
transcript body against a live re-run, not by reading the label; it now prints the live set's metes beside
the pinned `31` / `36` era readings. **`F-R007-2`** (folded into the cut-change commit, not split off,
because the cut change is what invalidated the label): the **same class, one line lower** — `measureCut()`'s
own printed exclusion clause still named **Act II's** id list after the function had been extended to
exclude **Act III's** opener too, so the string under-reported the reading it was printing (and this
ticket's §2i cut row, written from the code, already claimed all three groups). The clause is now
**derived from both constants** rather than re-typing one, so the next act boundary cannot leave it
behind; no number moved, and no transcript byte moved either — the four attest instruments stop their
match at `basis ids […]` (`cutLine.replace(/ \(the L16.*$/, "")` and the `D_exec max … basis ids […]`
regex), which is *checked*, not assumed: all four attests still exit 0 with the same MATCH counts after
the change. **The same class lived one level up, in the instruments' own fixed sentences**: the three
older attesters printed `the L16–L20 block and the registered Act II batches are excluded from the cut's
own filter` — a *typed* sentence, so the cut's filter outgrew it identically. R-007's own (fourth)
instrument says `Act II/III` from birth; the three older ones now name the whole set, each carrying a
`refreshed:` note **(iii)** recording the one moved line, and each body was **re-diffed against a
stdout-only live run** (byte-identical, `diff` **0 lines**) with unchanged exit codes and unchanged MATCH
counts (**81 / 125 / 91 / 99**). All three findings are recorded in `docs/ai-native-pipeline.md` §8.27.

**§7.3.1's instance 5 — cited verbatim, and it is the register's first fill-in-before-existence.**
`` `act-open` L40→L41 · `ΔD_exec = −4.197990` · bound `[−4.705319, −1.392819]` `` (`Δpar −4`,
`3·ΔB −0.197971`; the admissible `par 20` half is `[−4.705319, −3.392819]`), with its **provenance
git-dated at every step**: BOUND `b28ed97` (2026-10-19 **19:08:32** +0800) → fill-in `db78a13`
(**19:22:17** +0800) → bytes `568c136` (**19:56:24** +0800) — i.e. the value **precedes the board's
existence by 34 min 7 s**, proven by asking git for `l041.json` at each commit rather than by a claim.
This ticket publishes **no new label** (GD-012b had already numbered it instance 5); the kind union
widens to `"batch-seam" | "act-open"` and `ACT_SEAM_RELIEFS_ALL` becomes instances **2–5** (both
disclosed; instance 1 stays R-004a's own clause), and the label discharges **no clause** — its felt half
stays a labelled Playtest hypothesis (§7.3.3, `NOT TESTABLE, n = 0`).

**What R-007 did *not* do.** It re-stamped **no** earlier row (the forty previous rows and every
R-004a / R-005a / R-006a clause survive byte-identical and are re-measured as such), it did **not** graft
any Act III id onto `BLOCK_L1619_IDS` (still `[16 … 20]`, `block-l1619-tail-ceiling` still judges **L20 at
par 20 / `D_exec` 24.729412`**), it did **not** widen the cut, it did **not** touch `tests/**`
(`EXPECTED_LEVEL_COUNT` and every count-derived pin still read 40 and are RED until QA re-books them —
**R-007c**) or the registry (GAME's lane), and it left the walk-class envelope constant
(`tests/e2e/playthrough.spec.ts:373`'s `1_397_000`) **byte-untouched** while reporting its crossing
(§7f item 10). §7.3.2's `act-close` obligation for Act III is carried by `L51–L60` and was **not** fired,
so no `act-close` refusal branch exists for this opener.

**Re-verification, on demand, without trusting this file.** `npx tsx scripts/validate-levels.ts`
(45/45, 0 errors) and `npx tsx scripts/solve-levels.ts --audit src/levels` (45/45 PASS, `par` verified
45/45) re-derive the measured rows; the act-scale clauses are re-derived by `measureActScaleReading` /
`actScaleTailGuards` on any set of levels, and this registration's attest instrument is named in §7f.

## 3. The parity structure, and why M0-only content is a *static* maze

Both facts used above are short proofs, not opinions.

**F1.** `startPhase = "A"`, and every legal move flips. After `n` legal moves the phase is `A` if `n` is even, `B` if `n` is odd. Move *n* is played in the phase of the state after `n−1` moves → **A for odd n, B for even n**.

**F2.** Each legal move changes the player's position by one step, so its `x + y` parity flips every move: after `L` moves, `L ≡ (x + y) − (x₀ + y₀) ≡ d(x, y) (mod 2)`. So **arrival at tile `c` is always an `n` with `n ≡ d(c) (mod 2)` — no route can change that**, because a detour adds 2 moves, never 1. Combining with F1: the phase present when the player arrives at `c` is a function of `c` alone. Hence

- a `phaseAWalls` tile is enterable **iff `d(c)` is even**;
- a `phaseBWalls` tile is enterable **iff `d(c)` is odd**;
- a parity-mismatched phase wall is **permanently impassable** → behaviourally identical to a wall listed in *both* phases (the warning in `validateLevel`);
- no tile inside a level can ever be *refused first and entered later* — **the flip never "opens" a tile for you; your own route cannot re-time your arrival.**

Empirical backing (throwaway probes kept out of the repo, 4000 random levels each, ADR-0008 rules): M0-only walls → 0 levels with a tile reachable in both phases, 0 tiles refused-then-entered, 0 phase-formula violations. The same holds for **M1 doors without switches** (door solidity is then a function of the phase alone). Dynamism appears only when the phase stops being a function of the tile: **M3 switches** (231/500 random skeletons produced refused-then-entered door tiles) and **M2 portals** (233/500 broke the position→phase function, because a teleport changes position without consuming an extra move).

### F3 — a switch must sit on a tile whose entry phase is its `activePhase`

F2 says the phase present when the player arrives at tile `c` depends only on `c`. `applyMove` fires a switch only when `switch.activePhase` equals the current phase, so on a portal-free board:

- a switch whose `activePhase` **equals** `entryPhase(c)` fires every time it is stepped on (it is a real latch);
- a switch whose `activePhase` **differs** from `entryPhase(c)` can **never** fire — it is dead data (the same "permanently equivalent" class as a parity-mismatched wall, §2 L3).

This is now enforced by the level policy (`@/core/solver/policy`, code `switch-never-fires`), measured over the whole reachable graph rather than argued from parity (so it stays correct if portals ever arrive). All five unit levels satisfy it: L6 `(1,1)` A, L7 `(0,0)` A, L8 `(2,0)` A, L9 `(0,1)` A + `(3,1)` B, L10 `(2,3)` B.

### Note — "embedded" has two constructions, and the metric does not distinguish them

`embedMetrics` (`@/core/solver/bfs`) asks the shipped `solidAt` whether an arrival left the player inside a **current-phase-solid** tile. That is true for both:

1. the **wall echo** of L4/L5 (an odd-`d` tile carrying the *other* phase's wall, entered while it is an echo, §2 L4);
2. a **door tile** on an M1+M3 level: the player enters it while it is latched open, the flip happens, and the door is closed in the new phase (`src/game/renderer` draws that as a closed door for one frame — the player is safe and embedded, ADR-0008 clause 3). On L6–L10 this is the usual case: `embedRoutes` = `parRoutes` on all five.

The LV-004 metric is correct for both (its definition is `solidAt`, `docs/architecture.md` §8 — not "wall") but it must not be *read* as "a wall echo happened": L10 carries both constructions, and a future portal level could embed a third way. The policy's lesson obligations are per level and name the intended construction (`phantom-walk-forced` for `l005`, `latch-dynamism` for L6–L10).

**Consequence for the pipeline:** the claim in `ADR-0008` clause 8 that parity-dependent entry "genuinely rewires feasible routes from L1 onward" and resolves OQ-1 does **not** hold for M0-only content. M0 walls are real gates *perceptually* (a wall is solid while its phase is current) but the legal-move graph they produce is **static**: which tiles are enterable is fixed at authoring time by the distance parity from `player`.

## 4. Blocked design intents (escalation needed — do not silently "fix")

| Where | Spec | Status |
|---|---|---|
| `docs/level-design.md` §2 L4 | "the solid wall becomes a passable echo … the route crosses the very tile that refused earlier" | **UNREACHABLE in M0** by F2. `l004.json` ships a substitute beat (a *different* tile that is solid in the other phase is crossed while it is an echo) and is flagged, not presented as the specified lesson. |
| `docs/level-design.md` §2–§3 L5 (Aha #1) | "greedy straight line refused at the last jump; a visible side step changes the parity; the refusing wall itself becomes the route" | **UNREACHABLE in M0** by F2. `l005.json` keeps the refusal + side-step + `par ≤ 6` shape and makes the goal reachable *only* through an echo tile, but the refusing tile `(3,1)` is still never enterable. The ladder's stated Aha is not delivered. |
| `docs/level-design.md` §1 example | `par: 6` for `player [0,1] / goal [4,1] / phaseAWalls [[2,0]] / phaseBWalls [[3,1]]` | **inconsistent with its own prose**: the prose (and F1/F2) give `R,R,R,R` = **4** moves (the echo `(3,1)` is entered on move 3, a phase-A step). `par` must be re-derived by SOLVER-001. The example also contains `(2,0)`, which is `d = 3` (odd) in a `phaseAWalls` list → never enterable decoration. |
| `docs/level-design.md` §2 L9 | "switches listen only in their `activePhase`; arriving on the wrong phase does nothing" — a **timing** lesson ("which step do I press on?") | **UNCONSTRUCTIBLE pre-L11**, by F2/F3: arrival at a fixed tile happens in exactly one phase, so there is no such thing as "arriving on the wrong phase" on a portal-free board. A switch is either **always** current on its tile (a working latch) or **never** current (dead data, now rejected by the policy as `switch-never-fires`). `l009.json` therefore ships the *constructible* interaction the dispatch asked for — two doors, two switches, the second switch behind the first door, so the **order** of the presses is forced by geometry (§2b) — and this row records the deviation rather than pretending the timing lesson exists. |
| Dispatch LV-006 criterion 4 (Aha #1 gate (iv)) | "`dualPhaseTiles ≥ 1` on L8" | **UNSATISFIABLE on any portal-free board** (ADR-0009 decision 1, checkerboard invariant: a switch never relocates the player, so `dualPhaseTiles ≡ 0`; already pinned by `tests/solver/dynamism-metrics.test.ts`). Gate (iv) is implemented and reported by `scripts/solve-levels.ts` as `UNSATISFIABLE` with its proof, and `dualPhaseTiles === 0` is pinned as the proven value. The gate is not dropped, not softened, and no portal is smuggled in — ADR-0009 schedules M2 at L11. Escalated in `docs/ai-native-pipeline.md` §8.5. **Corrected law (Orchestrator adjudication, recorded in §8.5):** pre-L11 acceptance is carried by the *measured latch* — `refusedThenEnteredTiles ≥ 1` (ADR-0009 decision 4) — and gate (iv) is the L11+ acceptance criterion, so `l008.json` passes (i)(ii)(iii) with printed proofs. Since LV-007A the `UNSATISFIABLE` verdict also needs **both** facts (portal-free **and** a measured 0): a portal-bearing board measuring 0 is a loud FAIL, and `dual-phase-tiles` is pinned as the only gate allowed to escalate. |

Cheapest mechanical fixes for the design team to consider (**none of them mine to decide** — ADR-0008 is human-approved core rule; M1/M2 scope belongs to the Game Designer):

1. Bring a **portal pair (M2)** into the early teaching block — a teleport is the only mechanic in the locked rule set that decouples the phase from the step parity, and it needs no rule change.
2. Or bring **M1 doors + M3 switch** forward (doors *alone* stay static, so M3 must ship with them).
3. Or add a legal, no-move flip (a "wait"/self-flip action) — this **is** a core-rule change and needs the Game Designer + Playtest Analyst + Orchestrator route and a new ADR.

## 5. Validator self-tests (negative cases)

`scripts/validate-levels.ts` carries 10 negative cases and requires each to be rejected **by an error message that names the invariant** (`ok === false`, message matched, input object unchanged → no auto-repair): goal-is-wall (both phases), out-of-bounds, duplicate coordinate, spawn-inside-wall, dangling door reference, portal degenerate pair, portal end on its own `activePhase` wall, unknown field (strict schema), missing `par`, grid over the R-L2 cap (8 × 8 without Orchestrator approval). Current status: **10/10 rejected by name**; the suite also proves the *non-zero exit* path (a deliberately broken copy of `l003.json` in a temp dir → `RESULT: FAIL`, exit code 1).

## 6. Interface contract (frozen — GAME-001 imports from `@/core/level`)

Exported by `src/core/level/index.ts`: `Coord`, `DoorDef`, `SwitchDef`, `PortalDef`, `Level`, `LevelSchema`, `validateLevel`, plus `Phase`, `LevelInput`, `LevelSchemaOutput`, the sub-schemas and the small helpers `coordKey` / `sameCoord` / `formatCoord`. Coordinate representation: **`Coord` tuples `[x, y]` in JSON and in this module**; the runtime state layer uses `Vec = { x, y }`; conversion happens **once**, in the loader / `initialState`. The level layer is a single module on purpose (see its header comment): the frozen `tsconfig.json` has no `allowImportingTsExtensions`, and Node's type stripping needs explicit `.ts` specifiers, so a single-file module with only `zod` as an external import satisfies the compiler *and* a no-build `node scripts/…` run.

## 7. Next handoff

- **Level AI + Solver — R-007: Act III batch 1 (L41–L045) is registered; the dataset is 45 files, the shelf is UNBOOKED, and the FIRST act boundary moved the tail (this handoff).** The five LV-018 candidates are in the root **byte-identically** (§2i): `git mv`, rename 100 %, `sha256` **and** git blobs unchanged on both sides (5 files / 0 insertions / 0 deletions), and **no content edit during the move**. The law was fitted to the boards and never the reverse — the root re-measure ran **before** the first law edit: `par` **20 / 22 / 24 / 26 / 26** (`parMatch` 5/5); `D_exec` **24.257329 / 26.238773 / 28.213816 / 30.225216 / 30.455319**; `B` **1.4191 / 1.4129 / 1.4046 / 1.4084 / 1.4851** (in Act III's derived band `[23.7500, 33.0625]` 5/5); `T ≡ R ≡ 0` ×5; `M` 4 ×5; coverage **49/49 ×5** (the whole `7×7` frame); `dualPhaseTiles` **7 ×5**; `refusedBeforeEnteredTiles` **25 / 25 / 26 / 25 / 24**; every `par` route press-then-cross (**48/48 · 336/336 · 27/27 · 27/27 · 30/30**); all-OFF **UNSATISFIABLE ×5** (subgraph `11/921 · 11/913 · 11/912 · 11/928 · 11/940`). Evidence per claim, all exit 0: `npm run levels` → `45/45 level files ok · 0 errors · 218 warnings (0 multi-switch-door) · 11/11 negative cases`, **RESULT: PASS** (the 40-file base read `183`, so the delta is **+35 = 7 per board**, `l041`–`l045` each reading `warnings=7` on `walls=7`, the phase-parity-dead-wall warning; `0 multi-switch-door`); `tsx scripts/solve-levels.ts --audit src/levels` → `45/45 level file(s) PASS`, `par verified from the solver on 45/45`, **RESULT: PASS** (the one standing escalation is still `l008`'s `dual-phase-tiles`); `tsx scripts/solve-levels.ts --report` regenerated `docs/level-difficulty.report.json` to **45 records** (`sha256 f81c67e6…`), stable (a second run is byte-identical, `cmp` clean); `tsx scripts/prove-candidate.ts --act=3 --family=g --ladder=41,42,43,44,45 --dir=src/levels` → exit 0, **LADDER RESULT: PASS (5/5 rung(s) ACCEPT, controls named: 65/65 across the 5 rung(s))**, `13/13 controls caught by their named gate` on every rung, root CUT `D_exec max = 14.969697 · par(L15) = 10 · 45 shipped files · basis ids [1 … 15]`; the **falsification probe** `--peak=31.7589095` (the **derived** midpoint between the shipped peak and the band's ceiling, `(30.455319 + 33.0625)/2`) → **exit 1**, `GATES: REJECT — act-peak` with **exactly one FAIL on exactly one rung** (L45) and `LADDER RESULT: FAIL (4/5 rung(s) ACCEPT, controls named: 65/65)`; the **empty-shelf probe** (`--dir=src/levels/candidates`) → **exit 1**; `tsx scripts/attest-r007-reg45.ts` → exit 0, `RESULT: REGISTERED-MATCH` (**99** MATCH), transcript `scripts/attest-r007-reg45.transcript.md`; `tsx scripts/attest-r006a-reg40.ts` / `-r005a-reg35.ts` / `-r004a-act2.ts` → exit 0 each, `REGISTERED-MATCH` (**91 / 125 / 81** MATCH, `0 DIVERGENT`) — the three older transcripts **refreshed, not relaxed**, each with a `refreshed:` header naming what moved; `tsx scripts/attest-lv010-block.ts` → exit 0, its census now reading `root 45 files = 15 basis + 5 rungs + 20 Act II rungs + 5 Act III rungs`. **Four instruments, 396 MATCH lines, 0 DIVERGENT.**
- **Level AI + Solver — the tail law left Act II's basis: the first ACT BOUNDARY, re-derived at both ends (§2i, §7f).** `ACT_III_REGISTERED_TAIL_EXEC` is the maximum over Act III's own registered ladder (`45 / 30.455319`); the pre-ticket standard stays named and **alias-typed** to R-006a's constants (`40 / 28.455319`), so the move is the measured **+2.000000** and cannot be re-stamped into self-confirmation. §7.3.2's `act-close` obligation for Act III belongs to `L51–L60` and was **NOT re-fired** — there is deliberately no `act-close` refusal branch for this opener. The identical `+2.000000` appearing twice is **structural** (the standard *is* Act II's tail; the maximum *is* Act III's tail) and its separability is proven by the **standard-injection control**. The act-scale clause set is now a **22-set that four instruments PARTITION** (6 + 5 + 5 + 6 = **22 claimed / 22 distinct / 0 unclaimed**), with **both boundary directions probed live**. And the opening of a third act exposed a **stale Act I reading** (the basis is the complement of the registered later acts, so it had begun absorbing Act III's tail): the basis now excludes **both** `ACT_II_REGISTERED_IDS` and `ACT_III_B1_IDS`, after which all three older attests exit 0 with **0 DIVERGENT** and Act I reads `24.729412` at L20 again.
- **QA — the pins this registration breaks are enumerated in §7f (R-007c's lane, handed over not edited here).** `tests/**` is off-lane. With the five new files in the root, the sidecar at **45** records and the shelf **emptied**, the suite is **RED by count**: `EXPECTED_LEVEL_COUNT` and the derived pin tables still read **40**, and every red row is a count-, dataset-, `PINS`- or booking-derived pin (**no production behaviour, no board defect**). One row the move was *expected* to heal **is green**: `tests/solver/l16-l20-candidates.test.ts:236`'s shelf-booking set-equality now reads `expected [] to deeply equal []`. §7f lists every remaining row with its `file:line` and the **measured** new expectation.
- **QA — the walk-class envelope is CROSSED and it is a STOP-AND-REPORT, booked by name to R-007c (§7f item 10).** `par(41…45) = 118` moves take the `tests/e2e/playthrough.spec.ts` chain **587 → 705** (**+20.1022 %**), so the row's own published form gives `ceil(1.5 × 4.40 × (211.602 × 705/587)) × 1000 = **1_678_000 ms**` — **1.2011×** the live `test.setTimeout(1_397_000)` at `:373`, and still **1.1288×** after discounting R-006a's known 5.99 % forecast model error. The constant is left **byte-untouched** and this ticket books a **fresh named cloud measurement** to **R-007c**; the two pre-registered faces recomputed at 45 rungs (`2_250_000` same-family, `3_728_000` ×100/45) are published in §7f so the next round is not an improvisation. **Wall clock only** — `setTimeout` is a harness budget and no assertion in that spec moves.
- **GAME — the registry row for L41–L045 is the one edit left before the batch is playable, and it is outside this lane.** `src/game/levels/level-registry.ts` ships L1–L40; R-007 adds no entry there (`src/game/**` is not the Level AI + Solver lane). The unlock is the R-004a/R-005a/R-006a precedent five more times: five `import l0NN from "@/levels/l0NN.json"` lines, five `LEVEL_SOURCES` rows (`l041.json`…`l045.json`), and the docstring range moved. No new painter seam is implied — the boards' objects (five doors, five switches, one portal pair, the pocket) are all ones the renderer already draws for L31–L40, and §7.10.5's YAGNI kept `ΔM = 0`.
- **GD + Architect — the `H` (both-pair) composition and the XOR door this batch books forward by name.** §8.26 recorded them as an explicit **NON-CLAIM**: the opener batch is the proven 4-pocket / 5-door / 5-press device with **no** new mechanic, and Act III's later batches (`L46–L60`) — including the `par 28` top §7.10.2 **reserved** for §7.3.2's `act-close` carrier — are design work this lane has not been given. Named, not taken.
- **Level AI + Solver — R-006a: Act II batch 4 (L36–L040) is registered; the dataset is 40 files (this handoff).** The five LV-017 candidates are in the root **byte-identically** (§2h): `git mv`, rename 100 %, `sha256` **and** git blobs unchanged on both sides (5 files / 0 insertions / 0 deletions), and **no content edit during the move**. The law was fitted to the boards and never the reverse — the root re-measure ran **before** the first law edit: `par` **18 / 20 / 22 / 24 / 24** (`parMatch` 5/5); `D_exec` **22.301282 / 24.252174 / 26.200000 / 28.185897 / 28.455319**; `B` **1.4338 / 1.4174 / 1.4000 / 1.3953 / 1.4851** (in band 5/5); `T ≡ R ≡ 0` ×5; `M` 4 ×5; coverage **49/49 ×5** (the whole `7×7` frame); `dualPhaseTiles` **7 ×5**; `refusedBeforeEnteredTiles` **25 / 25 / 25 / 25 / 24**; every `par` route press-then-cross (**36/36 · 72/72 · 48/48 · 162/162 · 30/30**); all-OFF **UNSATISFIABLE ×5** (subgraph `11/936 · 11/920 · 11/920 · 11/936 · 11/940`). Evidence per claim, all exit 0: `npm run levels` → `40/40 level files ok · 0 errors · 183 warnings (0 multi-switch-door) · 11/11 negative cases`, **RESULT: PASS** (the 35-file base read `148` warnings, so the delta is **+35** — **7 per board**, `l036`–`l040` each reading `warnings=7` on `walls=7`, the phase-parity-dead-wall warning; `0 multi-switch-door`); `tsx scripts/solve-levels.ts --audit src/levels` → `40/40 level file(s) PASS`, `par verified from the solver on 40/40`, **RESULT: PASS** (the one standing escalation is still `l008`'s `dual-phase-tiles`); `tsx scripts/solve-levels.ts --report` regenerated `docs/level-difficulty.report.json` to **40 records**, stable (a second run is byte-identical, `cmp` clean); `tsx scripts/prove-candidate.ts --family=g --ladder=36,37,38,39,40 --dir=src/levels` → exit 0, **LADDER RESULT: PASS (5/5 rung(s) ACCEPT, controls named: 65/65 across the 5 rung(s))**, `13/13 controls caught by their named gate` on every rung, root CUT `D_exec max = 14.969697 · par(L15) = 10 · 40 shipped files · basis ids [1 … 15]`; the **falsification probe** `--peak=28.7589095` (the act's derived-exact midpoint between the shipped tail and the ceiling, §7e) → **exit 1**, `GATES: REJECT — act-peak` with **exactly one FAIL on exactly one rung**: `FAIL act-peak D_exec=28.455319 vs Act I's measured peak 28.758910 (delta -0.303590)` on **L40**, `LADDER RESULT: FAIL (4/5 rung(s) ACCEPT, controls named: 65/65 across the 5 rung(s))`; `tsx scripts/attest-r006a-reg40.ts` → exit 0, `RESULT: REGISTERED-MATCH`, transcript `scripts/attest-r006a-reg40.transcript.md`; `tsx scripts/attest-r005a-reg35.ts` → exit 0, `REGISTERED-MATCH` (refreshed transcript: its ladder stays scoped to the R-005a-era ids and its control set is unchanged at **120** MATCH lines); `tsx scripts/attest-r004a-act2.ts` → exit 0, `REGISTERED-MATCH` (also refreshed — its act-level rows now read the live act and the frozen R-005a era separately); `tsx scripts/attest-lv010-block.ts` → exit 0, its census now reading `root 40 files = 15 basis + 5 rungs + 20 Act II rungs`; `tsx scripts/attest-lv009-block.ts` → exit 0 (**10** MATCH) and `tsx scripts/attest-lv010-cut.ts` → exit 0 (**16** MATCH, the cut still `14.969697` with basis `[1 … 15]`) round out the battery — **six instruments, 385 MATCH lines, 0 DIVERGENT**. **Both older instruments were refreshed rather than relaxed**, and each carries a `refreshed:` header naming exactly what moved (§7e).
- **Level AI + Solver — the act-tail law moved the R-003d way, and §7.3.2's act-close was NOT re-fired (§2h, §7e).** `ACT_II_R006A_REGISTERED_TAIL_EXEC` is the re-derived maximum over the widened `ACT_II_REGISTERED_IDS` (21–40) — `28.455319` at L40 — and the pre-ticket standard stays named and **alias-typed** (`ACT_II_PRE_R006A_REGISTERED_TAIL_LEVEL_ID`/`_EXEC` = R-005a's `35` / `28.339426`), so the move is the measured `+0.115893` and cannot be re-stamped into self-confirmation. §7.3.2's act-close obligation was **discharged at L35 by R-005a** and this registration **runs no peak clause** — there is deliberately **no `act-close` refusal branch** for batch 4 (a clause created now would be a gate built to be passed); what is registerable is the **reading** that the act's maximum is now L40's `28.455319`, `+3.725907` over Act I's registered peak, with `0.607181` of **derived-exact** headroom to `ACT_II_EXEC_BAND[1] = 29.0625` (a printed `29.06` operand would say `0.604681`, §7.9). The measured `ΔD_exec` of §7.3.1's instance-4 seam differs from the published `−6.038144` by `4.6381e-7` and the L35 end by `4.1253e-7`, against `LAW_PRECISION = 5e-7` — **inside it, and printed on every run**. The act-scale clause set is now a **16-set that three instruments PARTITION** (`ACT_TAIL_R004A_CLAUSE_IDS` 6 + `ACT_TAIL_R005A_CLAUSE_IDS` 5 + `ACT_TAIL_R006A_CLAUSE_IDS` 5 = 16 claimed / 16 distinct / **0 unclaimed**); **exactly one** shipped clause's pin expression moved (R-004a's live `act-tail-peak-advantage`, re-pointed at the live act — the *only* clause pin that moved, and no R-004a / R-005a constant *value* moved), and the historical-record clauses (8–10) read a **frozen era basis** (`ACT_II_R005A_ERA_IDS`, ids 21–35) so a clause that *records what a registration did* cannot follow the dataset while a clause that *states a property of the act* must.
- **Game Designer / Game Designer's register, checked against this lane's docs.** §7.3.1's instance numbering is **4 = `L35 → L36`, `ΔD_exec = −6.038144`, band `[19.75, 29.0625]`**, provenance rule commit `b9dac54` (git-dated before the census `da0e3ac` and before the bytes) — quoted verbatim in the `l036` lesson row and in §2h/§7e. The **fifth** instance is the future **`L40 → L41`** act-open, which does not exist yet; no document in this lane numbers it, and nothing here pre-registers it.
- **GAME — the registry row for L36–L040 is the one edit left before the batch is playable, and it is outside this lane (R-006b).** `src/game/levels/level-registry.ts` ships L1–L35; R-006a adds no entry there (`src/game/**` is not the Level AI + Solver lane). The unlock is the R-004a/R-005a precedent five more times: five `import l0NN from "@/levels/l0NN.json"` lines, five `LEVEL_SOURCES` rows (`l036.json`…`l040.json`), and the docstring range moved. No new painter seam is implied — the boards' objects (five doors, five switches, one portal pair, the pocket) are all ones the renderer already draws for L31–L35.
- **QA — the pins this registration breaks are enumerated in §7e (R-006c's lane, handed over not edited here).** `tests/**` is off-lane. With the five new files in the root, the sidecar at **40** records and the shelf **emptied**, `npx vitest run` is **RED by count**: `EXPECTED_LEVEL_COUNT` and the derived pin tables still read **35**, and the shelf-booking literal still names the five files that have graduated. Measured at this tip: **9 failed files / 28 passed (37); 34 failed / 957 passed / 3 skipped (994)**, every red row a count-, dataset-, `PINS`- or booking-derived pin (**no production behaviour, no board defect**). §7e lists each row with its `file:line` and the **measured** new expectation.
- **Level AI + Solver — R-005a: Act II batches 2 + 3 (L26–L035) are registered; the dataset is 35 files (this handoff).** The ten LV-013/LV-014 candidates are in the root **byte-identically** (§2g): `git mv`, rename 100 %, `sha256` **and** git blobs unchanged on both sides, and **no content edit during the move**. The law was fitted to the boards and never the reverse — the root re-measure ran **before** the first law edit: `par` **17 / 18 / 20 / 21 / 23** (batch 2) and **19 / 22 / 22 / 24 / 24** (batch 3), `parMatch` 10/10; `D_exec` **21.560241 / 22.560241 / 24.548193 / 25.548193 / 27.566265 / 23.204167 / 26.050000 / 26.069191 / 28.126943 / 28.339426**; `B` **1.5201 / 1.5201 / 1.5161 / 1.5161 / 1.5221 / 1.4014 / 1.3500 / 1.3564 / 1.3756 / 1.4465** (in band 10/10); `T ≡ R ≡ 0` ×10; `M` 4 ×10; coverage 42/42 ×10; all-OFF **UNSATISFIABLE ×10** (subgraph 15/498 ×5 then 9/720 · 9/740 · 9/766 · 9/772 · 9/766). Evidence per claim, all exit 0: `npm run levels` → `35/35 level files ok · 0 errors · 148 warnings (0 multi-switch-door) · 11/11 negative cases`, **RESULT: PASS**; `tsx scripts/solve-levels.ts --audit` → `35/35 level file(s) PASS`, `par verified from the solver on 35/35`, **RESULT: PASS** (the one standing escalation is still `l008`'s `dual-phase-tiles`); `tsx scripts/solve-levels.ts --report` regenerated `docs/level-difficulty.report.json` to **35 records**, stable (a second run is byte-identical); `tsx scripts/prove-candidate.ts --family=g --ladder=26,27,28,29,30,31,32,33,34,35 --dir=src/levels` → exit 0, **LADDER RESULT: PASS (10/10 rung(s) ACCEPT, controls named: 130/130 across the 10 rung(s))**, `13/13 controls caught by their named gate` on every rung, root CUT `D_exec max = 14.969697 · par(L15) = 10 · 35 shipped files · basis ids [1 … 15]`; `tsx scripts/attest-r005a-reg35.ts` → exit 0, `RESULT: REGISTERED-MATCH`, transcript `scripts/attest-r005a-reg35.transcript.md`; `tsx scripts/attest-r004a-act2.ts` → exit 0, `REGISTERED-MATCH` (its old freezer regex that pinned the pre-fix `5/5 ACCEPT` summary string was relaxed to the post-fix print); `tsx scripts/attest-lv010-block.ts` → exit 0, its census now reading `root 35 files = 15 basis + 5 rungs + 15 Act II rungs`.
- **Level AI + Solver — the act-tail law moved by the R-003d rule, and the seam instances are registered with their published labels (§2g).** `ACT_II_R005A_REGISTERED_TAIL_EXEC` is the re-derived maximum over the **whole** registered act (28.339426 at L35, `ACT_II_REGISTERED_IDS` 21–35); the pre-ticket standard stays named (`ACT_II_PRE_R005A_REGISTERED_TAIL_EXEC` 27.604651 at L25) so the move is the measured `+0.734775`, and §7.3's across-act clause now reads `+3.610014` over the whole act (batch 1's own `+2.875239` is kept alive in clause 2). Headroom to the derived-exact `D_exec` ceiling is `0.723074` (`29.0625 − 28.339426`, §7.9 — the printed operand `29.06` would give `0.720574`). The two §7.3.1 reliefs are carried verbatim as `ACT_II_B2_SEAM_RELIEF` / `ACT_II_B3_SEAM_RELIEF` (`L25→L26 ΔD_exec −6.044410`, band printed `[19.75, 29.06]`; `L30→L31 ΔD_exec −4.362098`, band `[19.75, 29.0625]` printed `[19.75, 29.06]`), with named guards `ACT_TAIL_R004A_CLAUSE_IDS` / `ACT_TAIL_R005A_CLAUSE_IDS` partitioning the eleven clauses. **The direction is never a term**: 12 rises and 2 drops, both drops named, and the instrument prints the no-sign-test NOTE instead of probing a variant that could not fail.
- **GAME — the registry row for L26–L035 is the one edit left before the two batches are playable, and it is outside this lane.** `src/game/levels/level-registry.ts` ships L1–L25; R-005a adds no entry there (`src/game/**` is not the Level AI + Solver lane). The unlock is the R-004a precedent ten more times: ten `import l0NN from "@/levels/l0NN.json"` lines, ten `LEVEL_SOURCES` rows (`l026.json`…`l035.json`), and the docstring range `L1–L25` → `L1–L35`. No new painter seam is implied — the boards' objects (doors, switches, one portal pair, the pocket) are all ones the renderer already draws for L21–L25.
- **QA / game-designer — the named gate-family gap (booked, not papered over, §2g).** `auditLevel` dispatches a rung's per-member gate family from its **documented lesson row**; **R-005a2 landed the ten rows** (`l026`–`l035`, `switchRequired: "required"` measured, `obligation: null` — the row half of this gap is closed), so ids 26–35 are documented but still carry **no registered per-rung gate family** and prove via the family-gate ladder run instead of a per-id dispatch. `scripts/attest-r005a-reg35.ts` asserts this as a printed reading (`[0]` families) and **reddens** the day a `act-2-batch-2/3` **family** lands. R-005b/c owe that family (the two obligations behind a `ACT_II_B2_B3_LADDER`-keyed reader) and QA the one-control-per-code table.
- **QA — the pins this registration breaks are enumerated in §7d (handed over, not edited here).** `tests/**` is off-lane. With the ten new files in the root and the sidecar regenerated, `npx vitest run` is **RED by count**: the dataset moved **25 → 35** while `EXPECTED_LEVEL_COUNT` and the derived pin tables still read 25. §7d lists each row with its `file:line` and the **measured** new expectation (from `docs/level-difficulty.report.json` records 26–35).

- **Level AI + Solver — R-004a: Act II batch 1 (L21–L025) is registered; the dataset is 25 files (this handoff).** The five LV-012 candidates are in the root **byte-identically** (§2f): `git mv`, rename 100 %, `sha256` **and** git blobs unchanged on both sides, and **no content edit during the move**. The law was fitted to the boards and never the reverse — the root re-measure ran **before** the first law edit: `par` **17 / 18 / 20 / 21 / 23** (`parMatch` 5/5), `D_exec` **21.581395 / 22.584 / 24.62 / 25.604651 / 27.604651**, `B` **1.5271 / 1.5280 / 1.5400 / 1.5349 / 1.5349** (in band 5/5), `T ≡ R ≡ 0` ×5, `M` 4 ×5, coverage 42/42 ×5, `refusedThenEnteredTiles` **17 ×5**, all-OFF **UNSATISFIABLE ×5** (all-OFF subgraph 16/258 · 15/250 · 15/250 · 16/258 · 15/250), par-route press-then-cross 12/12 · 16/16 · 20/20 · 90/90 · 72/72. Evidence per claim: `npm run levels` → `25/25 level files ok · 0 errors · 88 warnings (0 multi-switch-door) · 11/11 negative cases`, **RESULT: PASS**; `tsx scripts/solve-levels.ts --audit` → `25/25 PASS` with `parMatch` 25/25, **RESULT: PASS** (the one standing escalation is still `l008`'s `dual-phase-tiles`); `tsx scripts/solve-levels.ts --report` regenerated `docs/level-difficulty.report.json` to **25 records**, stable (a second run is byte-identical), **RESULT: PASS**; `tsx scripts/prove-candidate.ts --family=g --ladder=21,22,23,24,25 --dir=src/levels` → exit 0, **LADDER RESULT: PASS (5/5 ACCEPT, 13/13 controls caught on every rung)**, `act-peak` DISCHARGED, headroom 1.455349 (`--family=g` is **required** — without it the same ladder fails the block's `par-step`/`par-rung-exact` gates); `tsx scripts/attest-r004a-act2.ts` → exit 0, `RESULT: REGISTERED-MATCH`, transcript `scripts/attest-r004a-act2.transcript.md`; `tsx scripts/attest-lv010-block.ts` → exit 0, and its regenerated transcript differs from the committed R-003d bytes in **exactly two lines** — the worktree path and the census line `root 25 files = 15 basis + 5 rungs + 5 Act II batch-1 rungs` — which is the **L20-was-not-touched proof**. `tsc --noEmit` is **production-clean**; the only red is the `tests/**` `Record<PolicyViolationCode, …>` pin (§7c). **The cut did not move:** `measureCut()` still prints `CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 · 25 shipped files · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]`, i.e. the frozen L1–L15 value re-derived on the bigger root with the L16–L20 block *and* the registered Act II batch excluded from their own filter.
- **Level AI + Solver — the act-tail law is in `@/core/solver/policy`, with anti-tautology guards in the R-003d style (§2f).** Six **dataset-level** tail clauses (`act-tail-act-i-peak-pin`, `act-tail-act-ii-peak-pin`, `act-tail-peak-advantage`, `act-tail-pre-r004a-standard`, `act-tail-l20-not-restamped`, `act-tail-l21-open-relief`) plus six **per-member** gates and the shared route reader, each with exactly one control **refused by name** (`docs/level-difficulty.md` §3.3/§3.5). Two directions of the tautology trap are refused *in the clause itself*: a future edit that silently **relabels** Act I's basis or **restamps** the batch peak FAILs, and a validator that demanded a cross-act **monotone rise** would have refused a registered rung — §7 calls the L21 opening a *plateau relaxation at a `ΔM = 0` boundary*, never a dip, and the clause satisfies it from the registered rung's own value **in either direction** (both probed live in the attest script). `act-peak` is a gate on the **peak rung only**; `BLOCK_L1619_IDS` is still `[16 … 20]` and `block-l1619-tail-ceiling` still judges **L20 at par 20 / 24.729412**.
- **GAME — the registry row for L21–L025 is the one edit left before the batch is playable, and it is outside this lane.** `src/game/levels/level-registry.ts` ships L1–L20 (GAME-002); R-004a adds no entry there (`src/game/**` is not the Level AI + Solver lane). The unlock is the R-003b/GAME-002 precedent five more times: five `import l0NN from "@/levels/l0NN.json"` lines, five `LEVEL_SOURCES` rows (`l021.json`…`l025.json`), and the docstring range `L1–L20` → `L1–L25`. No new painter seam is implied — the boards' objects (doors, switches, portals, the sealed line, the pocket) are all ones the renderer already draws for L16–L20.
- **QA — the pins this registration breaks are enumerated in §7c (handed over, not edited here).** `tests/**` is off-lane. With the new files in the root and the sidecar regenerated, `npx vitest run` reports **10 failed files / 27 passed (37); 41 failed / 814 passed / 3 skipped (858)** — every red row a count-, dataset- or PINS-derived pin, none a production behaviour, and none a board defect. §7c lists each row with its `file:line` and the **measured** new expectation.

- **Level AI + Solver — R-003c: the L16–L19 registration is done; the dataset is 19 files (this handoff).** The four rungs are in the root, byte-identical to the LV-010 candidates (§2e). `npm run levels` → `19/19 level files ok · 0 errors · 52 warnings`; `tsx scripts/solve-levels.ts` → `19/19 PASS · RESULT: PASS` (the one standing escalation is still `l008`'s `dual-phase-tiles`); `tsx scripts/attest-lv010-block.ts` → exit 0 (bytes vs `3cc6df2`, law basis, every booked number, all gates per rung, the ladder, 6/6 controls). `par` / `D_exec` re-read from the **registered bytes** — not from candidate notes — are `12 / 17.100000`, `14 / 19.027027`, `16 / 20.907923`, `18 / 22.885157`: the same numbers LV-010 booked, which is the parity claim this ticket existed to re-prove.
- **GAME-001 — the registry row for L16–L19 is the one edit left before they are playable, and it is outside this lane.** `src/game/levels/level-registry.ts` imports `l001`–`l015` and documents "L1–L15"; R-003c adds no entry there (`src/game/**` is not the Level AI + Solver lane). The unlock is the R-003b precedent four more times: four `import l0NN from "@/levels/l0NN.json"` lines, four `LEVEL_SOURCES` rows (`l016.json`…`l019.json`), and the docstring range `L1–L15` → `L1–L19`. The boards' objects (doors, switches, portals, the sealed line) are ones the renderer already draws in the L12–L15 block, so no new painter seam is implied by the **shape** — but the UA capture-entry round ADR-design-0003 §8 item 6 asks for is still tracked separately (LV-009-B handoff #2, `docs/ui-ux.md`).
- **QA — the pin migration this registration forces (named, not done here; `tests/**` is QA's lane).** R-003c moves the dataset from 15 to 19 files while the pins still read 15, so the following rows are **RED by construction**. Measured with `npx vitest run` on this tree: **33 files → 9 failed / 24 passed; 38 failed rows / 648 passed / 3 skipped**, and every red row is a count- or dataset-derived pin (no production behaviour). The `tsc` red is one line. Full list, file:line:
  - **`tests/e2e/helpers/levels.ts:76`** — `EXPECTED_LEVEL_COUNT = 15` → `19`; its docstring's "same fifteen" prose moves with it. This is the single independent hand-typed pin and every consumer below reads it.
  - **`tests/unit/level-inventory-derivation.test.ts:88`** (the shipped dataset is the pinned count) and its three mutation probes **`:116`** (ADD), **`:137`** (REMOVE), **`:152`** (RENUMBER) — all four compare against `EXPECTED_LEVEL_COUNT`.
  - **`tests/solver/difficulty.test.ts:183`** (`PINS` vs `SHIPPED_IDS`), **`:193`** (four rows: l016–l019 §2 breakdown, `PINS[id]` undefined), **`:342`** (the published 2-dp `D_exec` list must append `17.10 / 19.03 / 20.91 / 22.89`), **`:511`** (`lookaheadDepth` saturation loop hits the same undefined pins).
  - **`tests/solver/metrics-sidecar.test.ts:209`** (`one record per shipped level`, 15 → 19), **`:385`** (pin table parsed as 15 rows), **`:394`** (every report row vs `PINS`), **`:406`** (published `D_exec` 2-dp column) — against the regenerated 19-record sidecar.
  - **`tests/solver/route-budget.test.ts:573`** (pin table covers the dataset), **`:577`** (four rows: l016–l019), **`:611`** (aggregate lengths `10/10/15/15`), and — the one row that is **not** just a count — **`:152`** (exhaustive-vs-pruned equality: l017/l018/l019 raise `RouteEnumerationError` under the default `PAR_ROUTE_VISIT_CAP = 2_000_000`). Measured unpruned demand: **l016 1,363,684 · l017 17,779,004 · l018 98,736,430 · l019 > 5 × 10⁸** work units, against the pruned walk every shipped tool uses (**l019 2162 dfs + 7386 lookahead**). QA's fix is an explicit larger `maxRouteVisits` for that case, or dropping the exhaustive leg above L16 — **no level byte is implicated**; the `n-11` prune is what makes these boards enumerable at all.
  - **`tests/solver/ordered-companion.test.ts:236`** (four rows: l016–l019) and **`:248`** (the coincidence count) — same `PINS` gap.
  - **`tests/solver/multi-switch-door-warning.test.ts:319`** (`reads the shipped dataset (15 boards)`) — and the literal `0/15 … on all 15` in the next row's title/body.
  - **`tests/solver/l11-portal-gates.test.ts:190`** — the dataset-derived `dualPhaseTiles > 0` list is pinned `[11, 12, 13, 14, 15]`; it is now `[11 … 19]`.
  - **`tests/solver/policy-negative-controls.test.ts:552`** (`tsc` — `Record<PolicyViolationCode, …>` missing the six `gate-block-l1619-*` keys), **`:602`** (inventory vs control table cover the same codes), **`:611`** (six rows: one per new gate code). The controls themselves are already written and green in **`scripts/attest-lv010-block.ts`** (6/6 CAUGHT) — QA's move is to lift that table into the Record, not to re-derive it.
  - **`tests/solver/l16-l20-candidates.test.ts:43` / `:221`** — it walks `src/levels/candidates/` (now empty, `README.md` only) and throws at import (`readLevel` receives `undefined`), so the file reports **0 tests**. Re-point it at the root **or** retire it in favour of `scripts/attest-lv010-block.ts`, which already covers all six new gate codes.
  - **`tests/e2e/portal.spec.ts` / `tests/e2e/playthrough.spec.ts`** (outside the vitest run) — dataset-derived lists and the L1→L15 unlock walk move to 19 once the registry row and the count pin follow.
  - `src/levels/candidates/README.md` is created so that the empty-shelf red reads as *graduated*, not as a lost dataset.
- **Game Designer / Orchestrator — the L20 mechanism gap is recorded, not papered over (§2e).** No par-20 rung exists because the goal-gated full-seal device measures a ceiling of par 18 / `D_exec` 22.885157 on `7×6` at every seal arity (exhaustive censuses, not samples); `7×7` reaches par 22 only by re-running L19's exact seal shape longer, which §6 forbids as a rung's escalation. A par-20 rung needs a **new lattice stage** in one of two named constructions — a *gauntlet* (every approach to the goal's ring itself behind a door, ≥ 6 doors on a 7×6 arity-3 ring) or a *sealed landing* (the portal lands in a pocket whose exit is a door, forcing an ordered two-press chain, the "2-step lookahead" §5 has still not delivered). Neither is built; R-003c registered the rungs that exist and claimed no fifth.
- **GAME-001 / UI-ART-001 — L6–L10 must not enter the playable registry yet.** Per the LV-006 task contract the five new files stay out of `src/game/levels/level-registry.ts` until the Game Designer sequences them (L6–L10 were authored to `docs/level-design.md` V0.4 §2/§6; the §2b derivations above are the parts the solver proved). The renderer today implements no `door` or `switch` object (`src/game/renderer/objects/registry.ts`), so the block is not playable as authored — registering it now would ship a board whose latch is invisible.
- **Game Designer / Orchestrator:** §4 — the two blocked intents (L9's timing lesson, L8's gate (iv)) need a design decision, not an agent workaround: either re-word the ladder for the pre-L11 phase, or re-schedule M2/M3 (ADR-0009 puts portals at L11).
- **Level AI + Solver — where the metric work stands (LV-007C):** LV-004 embed plumbing; LV-007B's `B` effective / `T` / `R` / `D` (`docs/level-difficulty.md` §5.2); then LV-007C — item 1: the ordered companion **is** gated now, by Aha gate (iii) alone (`refusedBeforeEnteredTiles`; the `lesson-latch-dynamism` check and the pre-L11 acceptance law stay **unordered** by ruling, ADR-architecture-0002 A3 — the two legs are not re-stitched, §8.5 of the pipeline doc); item 2: `D_exec = D − w5·M` printed per level (`difficultyExec`); item 3: `docs/level-difficulty.md` **§3 re-keyed** to the V0.6 execution-axis law — the L5→L6 question is **closed** by ADR-design-0001, not open: the seam is measured **−1.47 on `D_exec`** against **+8.53 on `D`**, and `docs/level-design.md` §6 V0.6 no longer asks for a −2…−3 `D` drop. The one follow-up left is not mine to decide: the **weights** are still the provisional V0.1 hypothesis and need playtest regression (`docs/level-difficulty.md` §2/§4).
- **Level AI + Solver — where the metric work stands (LV-009-B, this handoff):** the L12–L15 block is **in the dataset and proven** (§2d above): `15/15 ok · 0 errors · 28 warnings` on the validator gate, `15/15 PASS` on the solver gate, `par == shortestSolution` 15/15, 0 dead / 0 unrecoverable on the whole set, and the four block rows carry a lesson row and a named gate family (`BLOCK_L1215_*` constants + `blockL1215Gates` in `@/core/solver/policy`, one negative control per gate in `tests/solver/policy-negative-controls.test.ts` §2d). `D_exec` for the block: **8.230769 / 10.898734 / 12.957895 / 14.969697** — the first member below L11's measured 8.573171 (the dip's second beat), the last above the frozen 13.64 block-end floor by 1.329697. The dataset count pin moved 11 → 15 in `tests/e2e/helpers/levels.ts` (the one authorized cross-lane byte).
- **R-003 / UI-ART / GAME-001 — the registry is the one thing left between L12–L15 and play (LV-009-B).** `src/game/levels/level-registry.ts` still imports `l001`–`l011` only, so `?level=12..15` does not resolve to the block; ADR-design-0003 §8 item 6 additionally requires the **UA capture-entry round** (the doors × portals painter seam, the sealed line reading as a wall column, the portal ends reading as a pair) before the four boards are registered as playable. Not this role's edit: named handoff, recorded as `OPEN_QUESTIONS` in the task's return contract.
- **QA — two e2e rows the block moves, both outside this lane (LV-009-B, measured).** (1) `tests/e2e/portal.spec.ts:82` pins the literal `[PORTAL_LEVEL_ID]` against a **dataset-derived** list that is now `[11,12,13,14,15]` — stale by design, since ADR-design-0003 makes portals mandatory on L13–L15 and a shortcut on L12; the pin needs QA's pen, not a data change. (2) `tests/e2e/latch-door.spec.ts:102` is RED on L12 alone ("both fixtures stand on the same tile": expected `(5,1)`, received `(4,2)`) and it is **fixture selection, not a board gap** — `scripts/latch-pair-audit.ts` measures L12 shipping **2** co-located discriminating pairs under the spec's own fixture bookkeeping and **12** under `isLegalMove` alone over its 78 reachable states, while L6–L11 and L13–L15 all read HOLDS. `cheapestDoorFixtures()` picks the cheapest occupancy and the cheapest refusal *independently*; on L12 both are depth 4, and node order lands the refusal at `(5,1)A down` instead of the state that pairs with the depth-3 occupancy at `(4,2)A right`. The spec's docstring ("two reachable states on the same tile in the same phase whose only difference is whether the switch was pressed") describes a search the helper does not implement; no level file is implicated. Measured context: one managed full e2e run reads **107 tests / 8 files → 20 failed · 87 passed**, 19 of the 20 naming the registry gap, and a temporary, uncommitted, reverted registry probe lifts the four UI-walk specs to **74 passed · 2 failed** — so the four boards are winnable through the real UI, L1 → L15 unlock chain included (`docs/ai-native-pipeline.md` §8.10 item 6).
- **Then:** the LLM candidate pipeline (`docs/ai-native-pipeline.md` §8) can consume `validateLevel` + `@/core/solver/policy` unchanged for the next block — schema → rules → BFS → metrics → policy → accept/reject, with rejection (never repair) at every gate.
- **Level AI + Solver — where the metric work stands (LV-008, this handoff):** L11 is authored, proven and shipped in the dataset, and the **last pre-registered law is now measured, not pending** — `D_exec(L11) = 8.573171 < 13.64` ⇔ `D(L11) = 28.573171 < 33.64`, `par = 4`, exactly one opposite-colour pair, no bypass on any par route, below OFFERED (`docs/level-difficulty.md` §3.3/§3.4, §2c above, `tests/solver/l11-portal-gates.test.ts`). The ordered/unordered **block ruling** of ADR-architecture-0002 A3 lands here too: both readers report `[5,0]`, so gate (iii) is carried by the ordered form and no L1–L10 verdict moves.
- **R-003 / UI-ART / GAME-001 — the registry is still frozen, and that is now the *only* thing between L11 and play.** `src/game/levels/level-registry.ts` hardcodes `l001`–`l010` and `tests/unit/renderer-level-unlock.test.ts` asserts exactly that set, so **L11 must not be registered by this role** (AGENTS.md §4). Two conditions gate the unlock, and the first is satisfied by this task: (a) the board is proven playable-by-the-rules (done — and the portal is the *only* object L11 needs that L6–L10 do not), and (b) the §3.3b portal visual evidence (`docs/ui-ux.md` Entry 3, bound to R-003) — a board whose channel is invisible teaches nothing, so registering L11 before the portal painter ships would ship a lie. **Registry-unlock reminder for R-003: the L11 file is ready; the painter and the registry edit are not mine to make.**
- **Game Designer / Playtest Analyst — the open design question this task sharpens:** L11's seam is −5.07 on `D_exec` and only −0.07 on `D`, so a reader using `D` alone will report "no dip at the M2 debut" while the execution axis reports a large one. The weights are still the provisional V0.1 hypothesis (`docs/level-difficulty.md` §2/§4); if the ladder's curve rule is to be read on `D`, the `w5·M` term needs the playtest regression that §4 already asks for — this task deliberately did not re-tune it.
- **Orchestrator / registration lane — the L20 candidate is proven and unregistered (LV-011, this handoff).** `src/levels/candidates/l020.json` measures `par 20` · `D_exec` 24.729412 · `B` 1.5765 with **15/15 gates ACCEPT** and **11/11** negative controls caught by name (`docs/ai-native-pipeline.md` §8.14, transcript `scripts/author-l20.transcript.md`); the nine `l020.json (rung 20)` obligations of `tests/solver/l16-l20-candidates.test.ts` also PASS. Registering it is a **separate ticket with its own cross-lane bytes**: the root move (byte-copy + blob-hash identity, the R-003c precedent), the registry row (`src/game/levels/level-registry.ts`), the count pin (`tests/e2e/helpers/levels.ts:76`), the metrics-sidecar regeneration, the eight derived pin tables in §7 above, and — a decision, not a copy — whether the registered `block-l1619-tail-ceiling` should move: **it must not move just because a candidate exists**, and the ladder's strict-`D_exec`-rise obligation would be the gate that judges a future registration.
- **QA-011 — three suite rows the shelf moves, all reported and none edited here (LV-011).** With `l020.json` on the shelf, `tests/solver/l16-l20-candidates.test.ts` stops crashing (it used to die on `readLevel(dir, undefined)` against an **empty** shelf) and runs 17 tests: **14 pass, 3 red** — (i) *"re-derives the cut and the first rung"* (the fixture's `shipped` must be 15, the registered dataset is 19 — base-red at `b597f64`); (ii) *"rises strictly along the block"* (the shelf holds exactly one candidate, so there is no predecessor to compare — shelf composition, not a board); (iii) *"refuses a board with its latch removed (a bare door is a violation, not a puzzle)"* — the control asserts the naked board (`switches: []`) is still **solvable**, which a **sealed landing** falsifies **by construction** (the all-OFF world is UNSATISFIABLE — that is `g4`, the adopted law). The expectation encodes an L16–L19 property, not a general one; reported with its mechanism as **F-L20-2** in `docs/ai-native-pipeline.md` §8.14. `tests/**` is QA's lane and was not touched.

## 7b. R-003d — the pins this registration breaks, VERBATIM (handed to QA-014)

`tests/**` is off-lane (QA-014 owns the migration). The list below is the run's own output (`node_modules/.bin/vitest run`, read-only, on the registered tree), 50 failing row(s); full log `/tmp/vitest-r003d.txt`.

**Predicted before the run, and all fired:** `tests/solver/l16-l20-candidates.test.ts:132` (the shelf set-equality vs the booked `["l020.json"]` — the shelf is now booked-**empty**), `:154` (`rootMax` 19 -> 20), `:168`/`:170` (the L20-is-absent clause, `existsSync(l020)`, `documentedLesson(20)).toBeNull()`), `tests/solver/policy-negative-controls.test.ts:1336` (`BLOCK_L1619_INTERIOR_MEMBER_AS_LAST.id` 19 vs `BLOCK_L1619_IDS.at(-1)` 20) and `:1331`/`:1332` (its two pinned ceiling literals), `tests/solver/route-budget.test.ts:675` + `tests/solver/difficulty.test.ts` + `metrics-sidecar.test.ts` (hand pins vs `SHIPPED_IDS` / `EXPECTED_LEVEL_COUNT`), `tests/e2e/helpers/levels.ts:87` (`EXPECTED_LEVEL_COUNT = 19` -> 20, the single hand-typed number every consumer reads).

**Verbatim red rows:**

- `the registry is the shipped dataset (the sweep below is over real content) 5ms`
- `the shipped dataset is the pinned count, and every id agrees with its file name 131ms`
- `ADD: one more level file is caught by the pinned count 87ms`
- `REMOVE: one fewer level file is caught by the pinned count 41ms`
- `RENUMBER: a mis-numbered level is caught by the ladder even at the pinned count 71ms`
- `lists the whole authored slice, in order 9ms`
- `accepts every file: ids 1..N, nothing rejected, nothing dropped (N = the discovered dataset) 1ms`
- `one record per shipped level, in file order, with no extras 3ms`
- `L20 — every published cell equals the report 2ms`
- `the pin table was really parsed (one row per shipped level, no silent empty match) 1ms`
- `every report row matches `tests/solver/difficulty.test.ts` PINS 0ms`
- `the published `D_exec` column is the pinned 2-dp list — L11 = 8.57 included 0ms`
- `l020 — measured ordered list (equal to the unordered one, ADR-0002's coincidence) 11ms`
- `the pin table covers the dataset 11ms`
- `l020 — §2 breakdown 31ms`
- `the pre-registered L11 threshold is the shipped L10 value, reproduced by the program 24ms`
- ``lookaheadDepth` (the other reading of `T`) saturates at `L − 1` — it is not the missing lever 1ms`
- `gate-block-l1619-tail-ceiling — a board is rejected by that exact code 15ms`
- `B12 — the terminal ceiling is an equality, so an interior member wearing the last rung's id fires 13ms`
- `the shelf holds only the booked pre-registration candidates, all above the census ceiling 5ms`
- `L20 is the documented ABSENT rung: the ladder's tail is the dataset's tail, and nothing claims to be above it 0ms`
- `reads the shipped dataset (20 boards, the pinned count) 4ms`
- `the pin table covers the dataset (no shipped level is unpinned) 3ms`
- `l020 — every printed metric equals its pre-n-11 value 22ms`
- `the CLI's aggregate lines still hold (10 static, 10 latched, 0 dead, 0 unrecoverable) 0ms`
- `tests/solver/difficulty.test.ts > LV-007B · item 3 — the shipped dataset's difficulty table, measured > the pin table covers the dataset`
- `tests/solver/difficulty.test.ts > LV-007B · item 3 — the shipped dataset's difficulty table, measured > l020 — §2 breakdown`
- `tests/solver/difficulty.test.ts > LV-007C · item 2 — `D_exec` is a derived reading of the published terms, not a second metric > the pre-registered L11 threshold is the shipped L10 value, reproduced by the program`
- `tests/solver/difficulty.test.ts > LV-007B · item 3 — the L5→L6 seam: measured, and not the dip §3 asks for > `lookaheadDepth` (the other reading of `T`) saturates at `L − 1` — it is not the missing lever`
- `tests/solver/l16-l20-candidates.test.ts > L16–L19 block — derived obligations, re-measured per run > the shelf holds only the booked pre-registration candidates, all above the census ceiling`
- `tests/solver/l16-l20-candidates.test.ts > L16–L19 block — derived obligations, re-measured per run > L20 is the documented ABSENT rung: the ladder's tail is the dataset's tail, and nothing claims to be above it`
- `tests/solver/metrics-sidecar.test.ts > LV-007E · R3 §1 — the records: the accepted set, complete and self-consistent > one record per shipped level, in file order, with no extras`
- `tests/solver/metrics-sidecar.test.ts > LV-007E · R3 — `docs/level-difficulty.md` §5.2 is a declared mirror of the report > L20 — every published cell equals the report`
- `tests/solver/metrics-sidecar.test.ts > LV-007E · R3 — the report agrees with the hand-typed pins (a builder bug cannot agree with itself) > the pin table was really parsed (one row per shipped level, no silent empty match)`
- `tests/solver/metrics-sidecar.test.ts > LV-007E · R3 — the report agrees with the hand-typed pins (a builder bug cannot agree with itself) > every report row matches `tests/solver/difficulty.test.ts` PINS`
- `tests/solver/metrics-sidecar.test.ts > LV-007E · R3 — the report agrees with the hand-typed pins (a builder bug cannot agree with itself) > the published `D_exec` column is the pinned 2-dp list — L11 = 8.57 included`
- `tests/solver/multi-switch-door-warning.test.ts > head state — no shipped board carries multi-switch-door > reads the shipped dataset (20 boards, the pinned count)`
- `tests/solver/ordered-companion.test.ts > LV-007B · item 2 — the shipped latch levels are orderable latches > l020 — measured ordered list (equal to the unordered one, ADR-0002's coincidence)`
- `tests/solver/policy-negative-controls.test.ts > LV-007A · m-2 — every policy code has a negative control that fails when the check is disabled > gate-block-l1619-tail-ceiling — a board is rejected by that exact code`
- `tests/solver/policy-negative-controls.test.ts > LV-009-B — the L12–L15 block's gates have teeth, and the four shipped members keep them all > B12 — the terminal ceiling is an equality, so an interior member wearing the last rung's id fires`
- `tests/solver/route-budget.test.ts > LV-007B · n-11 — the shipped L1–L10 numbers are unchanged (LV-008 appends L11 to the same table) > the pin table covers the dataset (no shipped level is unpinned)`
- `tests/solver/route-budget.test.ts > LV-007B · n-11 — the shipped L1–L10 numbers are unchanged (LV-008 appends L11 to the same table) > l020 — every printed metric equals its pre-n-11 value`
- `tests/solver/route-budget.test.ts > LV-007B · n-11 — the shipped L1–L10 numbers are unchanged (LV-008 appends L11 to the same table) > the CLI's aggregate lines still hold (10 static, 10 latched, 0 dead, 0 unrecoverable)`
- `tests/unit/level-inventory-derivation.test.ts > the dataset inventories are derived — the one pin does the alarming > the shipped dataset is the pinned count, and every id agrees with its file name`
- `tests/unit/level-inventory-derivation.test.ts > mutation probe — the alarm fires when the dataset moves (both directions) > ADD: one more level file is caught by the pinned count`
- `tests/unit/level-inventory-derivation.test.ts > mutation probe — the alarm fires when the dataset moves (both directions) > REMOVE: one fewer level file is caught by the pinned count`
- `tests/unit/level-inventory-derivation.test.ts > mutation probe — the alarm fires when the dataset moves (both directions) > RENUMBER: a mis-numbered level is caught by the ladder even at the pinned count`
- `tests/unit/player-embedded-home.test.ts > isPlayerEmbedded — core owns it via solidAt (R-004) > the registry is the shipped dataset (the sweep below is over real content)`
- `tests/unit/renderer-level-unlock.test.ts > level registry — L6–L19 are unlocked > lists the whole authored slice, in order`
- `tests/unit/renderer-level-unlock.test.ts > level registry — L6–L19 are unlocked > accepts every file: ids 1..N, nothing rejected, nothing dropped (N = the discovered dataset)`

## 7c. R-004a — the pins this registration breaks, VERBATIM (handed to R-004c)

`tests/**` is off-lane (**R-004c** owns the migration). The list below is the run's own output
(`node_modules/.bin/vitest run`, read-only, on the registered tree):
**10 failed files / 27 passed (37); 41 failed / 814 passed / 3 skipped (858)**, plus one `tsc` red.
Full log `/tmp/ps-r004a-vitest3.txt` (a second run on the same tree reproduces the identical red set). **Every red row is a count-, dataset- or `PINS`-derived pin** —
the dataset moved **20 → 25** while the pins still read 20 and the derived tables still carry 20 rows.
No red row names a board, a rule or a solver behaviour: the five new rungs are clean on every program
reader (`npm run levels` 25/25 · `solve-levels --audit` 25/25 · `attest-r004a-act2` exit 0), and the
five §5.2 mirror rows are **already green** (§2f). Per-file:line groups below; each carries the
**measured** new expectation, taken from `docs/level-difficulty.report.json` records 21–25 (the
regenerated sidecar, which is the law) or from the failing row's own printed payload.

**0. The single lever — re-take this first, it moves six rows by itself.**
`tests/e2e/helpers/levels.ts:76` — **`EXPECTED_LEVEL_COUNT = 20 → 25`** (and the docstring's
"the same twenty" / `L1→L20` prose, incl. its `R-003b`/`R-003c`/GAME-002 registration sentence,
which gains R-004a). It is the one deliberately hand-typed dataset pin; §1 of that file is the
argument for keeping it typed.

**1. `tests/solver/difficulty.test.ts` — 8 red (`PINS` is short five rows).**
`:144` the table · `:212` *the pin table covers the dataset* (`Object.keys(PINS)` 20 vs `SHIPPED_IDS` 25)
· `:222` *l021–l025 §2 breakdown* ×5 (`PINS[id]` undefined → `TypeError`) · `:371` *the pre-registered
L11 threshold…* (the published `D_exec` 2-dp list) · `:551` *`lookaheadDepth` … saturates at `L − 1`*.
Add (exact values behind the rounded pins in parentheses):

| id | `L` | `B` | `T` | `R` | `M` | `D` | `dexec` | `bRaw` | `forced` | `lookahead` | `states` |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 21 | 17 | 1.5271 (1.5271317829457365) | 0 | 0 | 4 | 41.581395 | 21.581395 | 2.88 (2.883720930232558) | 0.05 (0.046511627906976744) | 16 | 258 |
| 22 | 18 | 1.5280 (1.528) | 0 | 0 | 4 | 42.584 | 22.584 | 2.86 (2.856) | 0.04 | 17 | 250 |
| 23 | 20 | 1.5400 (1.54) | 0 | 0 | 4 | 44.62 | 24.62 | 2.86 (2.856) | 0.04 | 19 | 250 |
| 24 | 21 | 1.5349 (1.5348837209302326) | 0 | 0 | 4 | 45.604651 | 25.604651 | 2.88 (2.883720930232558) | 0.05 (0.046511627906976744) | 20 | 258 |
| 25 | 23 | 1.5349 (1.5348837209302326) | 0 | 0 | 4 | 47.604651 | 27.604651 | 2.88 (2.883720930232558) | 0.05 (0.046511627906976744) | 22 | 258 |

`:371`'s list appends **`"21.58", "22.58", "24.62", "25.60", "27.60"`** after R-003d's `"24.73"`.
`lookahead ≡ L − 1` holds on all five (16/17/19/20/22), so `:551` needs no re-wording.

**2. `tests/solver/route-budget.test.ts` — 7 red (`PINS` is short five rows).**
`:613` the table · `:701` *the pin table covers the dataset* · `:705` *l021–l025 every printed metric
equals its pre-n-11 value* ×5 (the failure is `expected { shortest: 17, reachable: 258, …(13) } to
deeply equal **undefined**` — `project(id)` is right, the pin is missing) · `:744` *the CLI's aggregate
lines still hold* (`TypeError: Cannot read properties of undefined (reading 'dualPhaseTiles')`).
Add, in dataset order:

| id | shortest | reachable | positions | maxDepth | dualPhaseTiles | refusedThenEntered | parRoutes / embedRoutes | embedForced | allOffGoalReachable / ReachableStates | cost `{visits, lookaheadVisits, prunedChildren}` |
|---|---|---|---|---|---|---|---|---|---|---|
| 21 | 17 | 258 | 42 | 27 | 12 | 17 | 12 / 12 | true | false / 16 | `{55, 1013, 86}` |
| 22 | 18 | 250 | 42 | 31 | 12 | 17 | 16 / 16 | true | false / 15 | `{124, 1296, 239}` |
| 23 | 20 | 250 | 42 | 33 | 12 | 17 | 20 / 20 | true | false / 15 | `{148, 1328, 263}` |
| 24 | 21 | 258 | 42 | 34 | 12 | 17 | 90 / 90 | true | false / 16 | `{549, 2495, 952}` |
| 25 | 23 | 258 | 42 | 38 | 12 | 17 | 72 / 72 | true | false / 16 | `{471, 2379, 826}` |

`deadStates 0` and `unrecoverableStates 0` on 5/5; the refused tile lists are the records' own
(`l021`/`l024`/`l025` share one 17-tile list, `l022`/`l023` another — see §4 below).
**`:744` needs no re-wording:** its five derived columns stay true off the new rows alone
(`dualPhaseTiles === 0` is still exactly `id < 11`; `refusedThenEnteredTiles > 0`, `allOffGoalReachable
!== null` still exactly `id ≥ 6`; `deadStates ≡ 0` and `unrecoverableStates ≡ 0` over all 25).

**3. `tests/solver/metrics-sidecar.test.ts` — 4 red.**
`:217` *one record per shipped level, in file order, with no extras* · `:396` *the pin table was really
parsed* (`HAND_PINS.size` 20 vs the pin) · `:405` *every report row matches `tests/solver/difficulty.test.ts` PINS*
· `:417` *the published `D_exec` column is the pinned 2-dp list*. All four fall with **§0 + §1**: the
report is already correct (`docs/level-difficulty.report.json` = **25** records, regenerated and
stable). The §5.2 mirror rows (`:359`, `:370` ×5) are **green** — R-004a wrote the five rows into
`docs/level-difficulty.md` §5.2, cell-for-cell against the report.

**4. `tests/solver/ordered-companion.test.ts` — 5 red.**
`:327` `ORDERED_PINS` · `:236` *l021–l025 measured ordered list* ×5 (`expected {…} to deeply equal
undefined`). Add the five pairs; `ordered ≡ unordered` on 5/5 (ADR-0002's coincidence, unmoved):
- **`l021`, `l024`, `l025`** — `["2,0","2,1","2,2","2,3","2,4","2,5","3,2","3,5","4,0","4,1","4,3","4,4","5,1","5,2","5,3","6,2","6,4"]`
- **`l022`, `l023`** — `["2,0","2,1","2,2","2,3","2,4","2,5","3,0","3,3","4,1","4,2","4,4","4,5","5,2","5,3","5,4","6,1","6,3"]`

**5. `tests/solver/l16-l20-candidates.test.ts` — 2 red.**
`:178` *the shelf holds only the booked pre-registration candidates (l021–l025, LV-012 batch 1) …* —
`BOOKED_CANDIDATE_IDS_IN_SHELF` (`:159`) is still `["l021.json" … "l025.json"]`, but the shelf is
**EMPTY again**: the booking becomes `[]` (and the row's title drops the parenthetical; the row's
second half — every shelf rung strictly above the root max — becomes vacuous-but-live, exactly as
`docs/ai-native-pipeline.md` §8.16 already documents for the empty-shelf case).
`:204` *L20 is the registered TERMINAL rung …* — `expected 20 to be 25`: `BLOCK_L1619_IDS.at(-1)` is
**20** and the dataset max is now **25**. This row must be **re-worded, never re-stamped** — §7.7
item 4 forbids re-stamping L20, and the block's tail is the **block's** tail, not the dataset's. The
honest shape is the derivation the file already computes (`BLOCK_IDS` from
`documentedLesson(id)?.obligation === "block-l1619"`, which still yields `[16 … 20]`): assert
`BLOCK_IDS.at(-1) === 20` **and** `maxShipped === EXPECTED_LEVEL_COUNT === 25` as two facts, with the
absence clause re-pointed at the new max (as written for the 25-file dataset: `l026.json` absent ·
`documentedLesson(26)` null · no shipped id > 25 — **all three are superseded**: R-005a registered
`l026`–`l035` and R-005a2 gave id 26 its row, so the re-wording must target the **35-file** max
instead, which is R-005c's to write). `:188` (`rootMax === EXPECTED_LEVEL_COUNT`) goes green
with §0.

**6. `tests/solver/policy-negative-controls.test.ts` — 7 red + 1 `tsc`.**
`:665` (`tsc`): `Record<PolicyViolationCode, …>` does not list the six `gate-act2-*` keys.
`:722` *the inventory and the control table cover exactly the same codes* (`expected […29] to deeply
equal […35]`). `:731` ×6: *gate-act2-registered-rung / -exec-band / -b-band / -exec-identity /
-coverage / -act-peak — a board is rejected by that exact code*. The controls are **already written
and proven 7/7**, re-measured on every invocation of `scripts/attest-r004a-act2.ts` (and printed as
`7/7 caught, 0 act2 violations on the registered set`), so R-004c's move is to **lift that table into
the `Record`**, not to re-derive it — plus the unchanged shared reader
`shortest-solution-presses-switch-and-crosses-door`.

**7. The remaining count-derived rows — §0 alone (plus the GAME registry row for the last three).**
- `tests/solver/multi-switch-door-warning.test.ts:324` — *reads the shipped dataset (25 boards, the
  pinned count)*; the title already derives the count (`readdirSync`), only the pin lags.
- `tests/unit/level-inventory-derivation.test.ts:88` (the pinned count) and its three mutation probes
  `:116` (ADD) / `:137` (REMOVE) / `:152` (RENUMBER).
- `tests/unit/player-embedded-home.test.ts:102` — *the registry is the shipped dataset*: reads
  `LEVEL_SOURCES` **and** `EXPECTED_LEVEL_COUNT`, so it needs §0 **and** the §7 GAME registry row.
- `tests/unit/renderer-level-unlock.test.ts:87` (*lists the whole authored slice, in order*) and `:96`
  (*accepts every file: ids 1..N …*) — both compare the registry's rows against `discoveredFileIds()`,
  so they need the **registry row** (GAME) and then go green with §0.

**Outside the vitest run (R-004c, once the registry row lands):** the dataset-derived lists and the
`L1→L25` unlock walk in `tests/e2e/portal.spec.ts`, `tests/e2e/playthrough.spec.ts` and
`tests/e2e/latch-door.spec.ts` — the same three rows the L16–L20 registration moved (`docs/ai-native-pipeline.md`
§8.16).

## 7d. R-005a — the pins this registration breaks, VERBATIM (handed to R-005c)

`tests/**` is off-lane (**R-005c** owns the migration). The list below is the run's own output
(`node_modules/.bin/vitest run`, read-only, on the registered tree at `dfd8f48` + the law/sidecar
edits): **10 failed files / 27 passed (37); 50 failed / 891 passed / 3 skipped (944)**, `tsc --noEmit`
**0**. Full log `/tmp/ps-r005a-vitest.txt`; re-taken at the ticket's tip (post-law, post-sidecar,
post-docs) as `/tmp/ps-r005a-vitest-tip.txt` and once more on the final tree as
`/tmp/ps-r005a-vitest-final.txt` — **three runs, identical tally and identical 24 `file:line` red
set**, so the docs/law edits moved no verdict. The dataset moved **25 → 35** — the same
move R-004a made
**20 → 25**, and the red tally moved with it (**41 → 50** rows). **Nine of the ten red files are
count-, dataset- or `PINS`-derived**; the tenth is the *named gate-family gap* (§7 below) and is **not
a pin at all**. **R-005a2 (the lesson-row micro ticket) closed exactly that tenth one**, re-measured on
the same tree: **9 failed files / 28 passed (37); 49 failed / 892 passed / 3 skipped (944)** — the two
runs' FAIL sets diff by **exactly one line**, the latch-gates row, and `tests/solver/latch-gates.test.ts:210`
is green **off the ten new rows alone** (`tests/**` untouched). Every other row below still reads exactly
as written here — R-005c re-books the tally. No red row names a board, a rule or a solver behaviour: the ten new rungs are clean on
every program reader (`npm run levels` 35/35 · `solve-levels --audit` 35/35, `par` verified 35/35 ·
`attest-r005a-reg35` exit 0 · the family-g `--ladder=26…35` run **10/10 ACCEPT, 130/130 controls**),
and the ten §5.2 mirror rows are **already green** (§2g). Per-file:line groups below; each carries the
**measured** new expectation, taken from `docs/level-difficulty.report.json` records 26–35 (the
regenerated sidecar, which is the law) or from the failing row's own printed payload.

**0. The single lever — re-take this first, it moves nine rows by itself.**
`tests/e2e/helpers/levels.ts:111` — **`EXPECTED_LEVEL_COUNT = 25 → 35`**, and the docstring at `:30`
("the dataset's **25**-level ladder") with it. It is the one deliberately hand-typed dataset pin
(§1 of that file is the argument for keeping it typed), so every consumer below reads it.

**1. `tests/solver/difficulty.test.ts` — 13 red (`PINS` is short ten rows).**
`:230` *the pin table covers the dataset* (`expected [ Array(25) ] to deeply equal [ Array(35) ]`) ·
`:240` *l026–l035 §2 breakdown* ×10 (`TypeError: Cannot read properties of undefined (reading 'L')` —
`PINS[id]` undefined) · `:389` *the pre-registered L11 threshold…* (the published `D_exec` 2-dp list) ·
`:580` *`lookaheadDepth` … saturates at `L − 1`* (`…(reading 'lookahead')`). Add, in dataset order, in
the **existing one-line shape** (the cross-file parser in `metrics-sidecar.test.ts:141` matches
`^\s*(\d+): \{ L: …, B: …, T: …, R: …, M: …, D: …, dexec: …,` — a reformatted multi-line row would
parse as *nothing*, which is what `:395`'s size tooth exists to catch):

| id | `L` | `B` | `T` | `R` | `M` | `D` | `dexec` | `bRaw` | `forced` | `lookahead` | `states` |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 26 | 17 | 1.5201 (1.5200803212851406) | 0 | 0 | 4 | 41.560241 | 21.560241 | 2.84 | 0.04 | 16 | 498 |
| 27 | 18 | 1.5201 (1.5200803212851406) | 0 | 0 | 4 | 42.560241 | 22.560241 | 2.84 | 0.04 | 17 | 498 |
| 28 | 20 | 1.5161 (1.5160642570281124) | 0 | 0 | 4 | 44.548193 | 24.548193 | 2.84 | 0.04 | 19 | 498 |
| 29 | 21 | 1.5161 (1.5160642570281124) | 0 | 0 | 4 | 45.548193 | 25.548193 | 2.84 | 0.04 | 20 | 498 |
| 30 | 23 | 1.5221 (1.5220883534136547) | 0 | 0 | 4 | 47.566265 | 27.566265 | 2.84 | 0.04 | 22 | 498 |
| 31 | 19 | 1.4014 (1.4013888888888888) | 0 | 0 | 4 | 43.204167 | 23.204167 | 2.52 | 0.16 | 18 | 720 |
| 32 | 22 | 1.3500 (1.35) | 0 | 0 | 4 | 46.05 | 26.05 | 2.53 | 0.16 | 21 | 740 |
| 33 | 22 | 1.3564 (1.3563968668407311) | 0 | 0 | 4 | 46.069191 | 26.069191 | 2.56 | 0.14 | 21 | 766 |
| 34 | 24 | 1.3756 (1.3756476683937824) | 0 | 0 | 4 | 48.126943 | 28.126943 | 2.55 | 0.14 | 23 | 772 |
| 35 | 24 | 1.4465 (1.4464751958224542) | 0 | 0 | 4 | 48.339426 | 28.339426 | 2.56 | 0.14 | 23 | 766 |

`bRaw` / `forced` are pinned at 2 dp: batch 2 is **2.8433734939759034 / 0.04417670682730924 ×5**;
batch 3 is **2.522222222222222 / 0.15833333333333333 · 2.5297297297297296 / 0.15675675675675677 ·
2.558746736292428 / 0.13838120104438642 · 2.5492227979274613 / 0.14248704663212436 ·
2.558746736292428 / 0.13838120104438642**. `:389`'s list appends, after R-004a's `"27.60"`, the ten
values the run's own diff printed:
**`"21.56", "22.56", "24.55", "25.55", "27.57", "23.20", "26.05", "26.07", "28.13", "28.34"`**.
`lookahead ≡ L − 1` holds on all ten (16/17/19/20/22/18/21/21/23/23), so `:580` needs no re-wording —
only the rows.

**2. `tests/solver/route-budget.test.ts` — 12 red (`PINS` is short ten rows).**
`:715` *the pin table covers the dataset* · `:719` *l026–l035 every printed metric equals its pre-n-11
value* ×10 (`expected { shortest: 17, reachable: 498, …(13) } to deeply equal **undefined**` — the
projection is right, the pin is missing) · `:758` *the CLI's aggregate lines still hold* (`TypeError:
Cannot read properties of undefined (reading 'dualPhaseTiles')`). Add, in dataset order:

| id | shortest | reachable | positions | maxDepth | dualPhaseTiles | refusedThenEntered | parRoutes / embedRoutes | embedForced | allOffGoalReachable / ReachableStates | cost `{visits, lookaheadVisits, prunedChildren}` |
|---|---|---|---|---|---|---|---|---|---|---|
| 26 | 17 | 498 | 42 | 33 | 12 | 19 | 60 / 60 | true | false / 15 | `{242, 2114, 331}` |
| 27 | 18 | 498 | 42 | 35 | 12 | 19 | 24 / 24 | true | false / 15 | `{132, 1681, 223}` |
| 28 | 20 | 498 | 42 | 35 | 12 | 19 | 12 / 12 | true | false / 15 | `{70, 1537, 119}` |
| 29 | 21 | 498 | 42 | 36 | 12 | 19 | 72 / 72 | true | false / 15 | `{411, 2469, 694}` |
| 30 | 23 | 498 | 42 | 42 | 12 | 19 | 12 / 12 | true | false / 15 | `{73, 1763, 130}` |
| 31 | 19 | 720 | 42 | 33 | 6 | 22 | 30 / 30 | true | false / 9 | `{211, 2303, 313}` |
| 32 | 22 | 740 | 42 | 39 | 6 | 22 | 6 / 6 | true | false / 9 | `{76, 1827, 161}` |
| 33 | 22 | 766 | 42 | 38 | 6 | 22 | 30 / 30 | true | false / 9 | `{214, 2515, 373}` |
| 34 | 24 | 772 | 42 | 42 | 6 | 22 | 12 / 12 | true | false / 9 | `{136, 1784, 245}` |
| 35 | 24 | 766 | 42 | 36 | 6 | 22 | 160 / 160 | true | false / 9 | `{609, 4086, 1033}` |

`deadStates 0` and `unrecoverableStates 0` on 10/10. The refused tile lists are the records' own, in
**four** groups: **`l026`/`l027`/`l028`** share one 19-tile list
(`2,0…2,5`, `3,0`, `3,3`, `4,1`, `4,2`, `4,4`, `4,5`, `5,0`, `5,1`, `5,3`, `5,4`, `6,0`, `6,2`, `6,3`);
**`l029`/`l030`** a second 19-tile list (`2,0…2,5`, `3,2`, `3,5`, `4,0`, `4,1`, `4,3`, `4,4`, `5,1`,
`5,2`, `5,4`, `5,5`, `6,2`, `6,3`, `6,5`); **`l031`/`l032`** a 22-tile list (`1,0…1,5`, `2,1`, `2,5`,
`3,0`, `3,2`, `3,3`, `3,4`, `4,0`, `4,1`, `4,2`, `4,4`, `4,5`, `5,1`, `5,3`, `5,5`, `6,2`, `6,4`); and
**`l033`/`l034`/`l035`** a second 22-tile list (`1,0…1,5`, `2,2`, `2,5`, `3,1`, `3,3`, `3,4`, `4,0`,
`4,2`, `4,3`, `4,5`, `5,1`, `5,2`, `5,4`, `5,5`, `6,2`, `6,3`, `6,4`). **`:758`'s derived columns need
no re-wording** (each is a rule over the discovered ids: `dualPhaseTiles === 0` is still exactly
`id < 11`; `refusedThenEnteredTiles > 0` and `allOffGoalReachable !== null` are still exactly `id ≥ 6`;
`deadStates ≡ 0` and `unrecoverableStates ≡ 0` over all 35) — **but it hides one second-order pin**, see
§8.

**3. `tests/solver/metrics-sidecar.test.ts` — 4 red.**
`:217` *one record per shipped level, in file order, with no extras* · `:396` *the pin table was really
parsed* (`:395` `HAND_PINS.size` 25 vs the pin, then the key list vs `REPORT.levels.map(id)`) · `:405`
*every report row matches `tests/solver/difficulty.test.ts` PINS* (`l26: expected undefined to be
defined` — it parses **§1's table out of that file**, so it cannot go green before §1 lands) · `:417`
*the published `D_exec` column is the pinned 2-dp list*. All four fall with **§0 + §1**: the report is
already correct (`docs/level-difficulty.report.json` = **35** records, regenerated and stable). The
§5.2 mirror rows (`:359`, `:370` ×35) are **green** — R-005a wrote the ten rows into
`docs/level-difficulty.md` §5.2, cell-for-cell against the report (`B` to 4 dp, `D`/`D_exec` to 2 dp).

**4. `tests/solver/ordered-companion.test.ts` — 10 red, one `PINS` group.**
`ORDERED_PINS` (`:327`) · `:236` *l026–l035 measured ordered list* ×10 (`expected {…} to deeply equal
undefined`). Each pin is `{ unordered, ordered }`; **`ordered ≡ unordered` on 10/10** (re-measured off
the registered bytes, not inferred), so add the two lists as one pair per group:
**`l026`/`l027`/`l028`**, **`l029`/`l030`**, **`l031`/`l032`**, **`l033`/`l034`/`l035`** — the four tile
lists are the ones tabulated in §2 above. The two neighbouring rows stay **green** and are quoted so
they are not "fixed": `:252`'s `latched` set (`refusedThenEnteredTiles > 0`) is still exactly
`SHIPPED_IDS.filter((id) => id >= 6)`, and `:277` re-asserts the ordered/unordered equality over the
whole dataset on every run.

**5. `tests/solver/l16-l20-candidates.test.ts` — 2 red, and one of them is a re-word, not a re-stamp.**
`:199` *the shelf holds only the booked pre-registration candidates (l026–l035, LV-014 batch 2 + LV-015
batch 3) …* — `BOOKED_CANDIDATE_IDS_IN_SHELF` (`:175`) still lists the ten ids, but the shelf is
**EMPTY again** (`expected [] to deeply equal [ 'l026.json', 'l027.json', …(8) ]`): the booking becomes
**`[]`** and the row's title drops the parenthetical; its second half — every shelf rung strictly above
the root max — becomes vacuous-but-live, exactly as `docs/ai-native-pipeline.md` §8.16 documents for
the empty-shelf case. `:239` *two tails, two facts: the block's tail stays rung 20 while the dataset's
tail is the pinned 25 — never a re-stamp* — `expected 35 to be 25`: the row **computes** the honest
shape already, so R-005c's move is to land the numbers it derives, **not** to re-stamp L20:
`BLOCK_IDS.at(-1) === 20` **and** `maxShipped === EXPECTED_LEVEL_COUNT === 35` as two facts, with
`:240`'s `ACT_II_B1_IDS.at(-1)` re-pointed at the act's *registered* tail
(`ACT_II_REGISTERED_IDS.at(-1) === 35`) and the absence clause re-pointed at the new max
(`l036.json` absent from `src/levels/` · `documentedLesson(36)` null · no shipped id > 35 — all three
already true). `:209` (`rootMax === EXPECTED_LEVEL_COUNT`) goes green with §0.

**6. The remaining count-derived rows — §0 alone, except the last three.**
- `tests/solver/multi-switch-door-warning.test.ts:324` — *reads the shipped dataset (35 boards, the
  pinned count)*: `expected [ 'l001.json', …(33) ] to have a length of 25 but got 35`; the title already
  derives the count (`readdirSync`), only the pin lags.
- `tests/unit/level-inventory-derivation.test.ts:88` — `"the discovered dataset has 35 levels, the
  pinned registry ships 25"` — and its three mutation probes `:116` (ADD) / `:137` (REMOVE, `expected 34
  to be 24`) / `:152` (RENUMBER, `expected 35 to be 25`). All four read `EXPECTED_LEVEL_COUNT`.
- `tests/unit/player-embedded-home.test.ts:102` — *the registry is the shipped dataset*: reads
  `LEVEL_SOURCES` **and** `EXPECTED_LEVEL_COUNT`, so it needs §0 **and** the §7 GAME registry row.
- `tests/unit/renderer-level-unlock.test.ts:87` (*lists the whole authored slice, in order*) and `:96`
  (*accepts every file: ids 1..N …*) — both compare the registry's rows against `discoveredFileIds()`,
  so they need the **registry row** (GAME) and then go green with §0.

**7. CLEARED at R-005a2 — the one red row that was NOT a pin (the named gate-family gap, §2g); it is
QA + design, not a number.**
`tests/solver/latch-gates.test.ts:210` — *every shipped level in `src/levels` has a documented-lesson
row (the table cannot drift)*: `l026 has no documented-lesson row: expected null not to be null`. That
row was a **truthful alarm**, and **R-005a2 (Level AI + Solver) fixed it by adding the ten rows**
themselves: `l026`–`l035` in `DOCUMENTED_LESSONS`, one 128-line insertion, **no other `policy.ts`
change**, `tests/**` untouched — each row `switchRequired: "required"` (measured: the all-OFF world is
UNSATISFIABLE on 10/10, `allOffGoalReachable = false`) with `par` / `D_exec` / `B` read from sidecar
records 26–35, the two §7.3.1 relief labels quoted verbatim at the seam rungs (`l026` instance 2,
`l031` instance 3), and `obligation: null` because no **family** can be dispatched yet (see below).
Measured: **50 → 49 failed rows, 10 → 9 failed files**, the FAIL sets differing by that one line.
What is **not** closed — and **R-005c must not "fix" it by inventing a family**: the ten rungs still
carry **no registered per-rung gate family** (`act2Batch1Gates` keys on `ACT_II_B1_IDS` / reads
`ACT_II_B1_LADDER`, so a dispatched value would mis-key these boards or graft an Act II rung onto
another block's law), and their proof remains the `--family=g --ladder=26…35` run (10/10 ACCEPT, 13/13
named controls per rung). The remedy is the booked design + QA work: the `act-2-batch-2` /
`act-2-batch-3` obligations behind a `ACT_II_B2_B3_LADDER`-keyed reader **plus one control per new
code** in the `policy-negative-controls` `Record`, while `scripts/attest-r005a-reg35.ts` keeps
asserting the gap's *existence* (`[0]` families) so it cannot outlive its remedy silently.

**8. The latent second-order pin (`:758` hides it, so it is easy to miss).**
`tests/solver/route-budget.test.ts:779` — the *list* form of the parity-breaking column,
`dualPhaseTiles > 0` mapped to values, is pinned to **15 entries**
(`[21, 19, 16, 20, 15, 24, 24, 18, 18, 18, 12, 12, 12, 12, 12]`). It never executed in this run
because the same test threw at `:758` first. Once §2's rows land it becomes **red on its own**, and the
honest value is the ten rungs appended in dataset order — `12 ×5` (batch 2, the 3-pocket device's pair
reach on 7 × 6) then `6 ×5` (batch 3's `CX = 1` frame). Independently, `:223`'s equality leg needs no
edit: on the registered bytes **all ten new rungs are in the over-cap class** (measured: the exhaustive
walk raises `RouteEnumerationError` with `visits = cap + 1 = 2_000_001`, `levelId` = the rung), so they
assert the cap refusal and are **not** silently skipped, while the equality class still ends at L16.

**9. Outside the vitest run (R-005c, once the registry row lands) — plus a CHAIN-ENVELOPE PRE-ALERT.**
The dataset-derived lists and the unlock walk in `tests/e2e/portal.spec.ts`,
`tests/e2e/playthrough.spec.ts` and `tests/e2e/latch-door.spec.ts` move the same way they did for
R-003c/R-004a (`docs/ai-native-pipeline.md` §8.16). The **new** item is `playthrough.spec.ts`'s chain
row: `test.setTimeout(639_000)` (`:284`) is the QA-024 envelope, derived cloud-anchored from the
**25-level** chain (`cloudFullChainS = 360 × 96.715 / 81.783 = 425.7 s`; `ceil(1.5 × 425.7) = 639 s`),
with `856_000 ms` pre-registered as its same-family remedy. **Re-priced on the 35-level chain, both
numbers are crossed before the first 35-level walk:**

```
moves  par(1…25) = 269   ·   par(26…35) = 17+18+20+21+23+19+22+22+24+24 = 210   ⇒  479 moves  (+78.1 %)
local time, measured rates (QA-024 walk: 81.783 s / 225 moves to L23, 96.715 s / 269 to L25)
        early-rate face   479 × 0.3635 s = 174.1 s
        tail-rate face    479 × 0.3394 s = 162.6 s
used form (work-weighted, cloud-anchored):  cloud ≈ 162.6…174.1 × 4.40 = 715…766 s
                                           envelope = ceil(1.5 × 715…766) = 1_073_000…1_149_000 ms
same-family face (the 856 s remedy):       ceil(1.5 × 5.9 × 162.6…174.1) = 1_439_000…1_541_000 ms
optimistic flat-level face (quoted, not used — QA-024's own discount):
                                           (360 / 23) × 35 = 547.8 s  ⇒ ceil(1.5 × 547.8) = 822_000 ms
```

So the **live** `639_000` ms constant is crossed by **1.68–1.80×** on the used form and by **1.29×** on
the *optimistic* face, and the pre-registered **`856_000` ms remedy is itself crossed** (1.25–1.34× on
the used form, 1.68–1.80× on the same-family face). **R-005c therefore owes a NEW named envelope
re-derivation from a fresh cloud datum — the booked number may not simply be re-used**, and per QA-024's
own doctrine the derivation must come from cloud datums (a throttled-local green is necessary, never
sufficient). This is **wall clock only**: `setTimeout` is a harness budget, and no assertion in that
spec moves.

## 7e. R-006a — the pins this registration breaks, VERBATIM (handed to R-006c)

`tests/**` is off-lane for this ticket (**R-006c** owns the migration, the way R-005c rode R-005a).
The list below is the run's own output (`node_modules/.bin/vitest run`, read-only, on the registered
tree at `647845d` **plus** the step-5 doc edits): **9 failed files / 28 passed (37); 34 failed / 957
passed / 3 skipped (994)**, Duration 41.74 s, `npx tsc --noEmit` **0**. Log `/tmp/ps-vitest-pre.txt`
(pre-docs) → `/tmp/ps-vitest-tip.txt` (post-docs) → `/tmp/ps-vitest-final.txt` (final tree): **three
runs, identical tally and an identical 34-row `file:line` set**, so the documentation edits moved no
verdict. The dataset moved **35 → 40** — the same move R-004a made **20 → 25** and R-005a **25 → 35**.
The R-005a-era tally (`§7d`: 10 files / 49 rows) is **not comparable**: the intervening tickets
(R-005b's registry row, R-005c/R-005c-b's pins and shelf probes, QA-026/QA-027) re-booked part of it,
and this list is what *this* tip actually prints. **No red row names a board, a rule or a solver
behaviour**: the five new rungs are clean on every program reader (`npm run levels` 40/40 · `0 errors`
· `solve-levels --audit` 40/40 with `par` verified 40/40 · `attest-r006a-reg40` exit 0 · the family-g
`--ladder=36…40` run **5/5 ACCEPT, 65/65 controls**), and the five §5.2 mirror rows are **already
green** (§2h). Per-`file:line` groups below; each carries the **measured** new expectation, taken from
`docs/level-difficulty.report.json` records 36–40 (the regenerated sidecar, which is the law) or from
the failing row's own printed payload. The `file:line` for each row is the **`it(` declaration line**
(the convention §7d used); the run's own `❯ file:LINE:COL` assertion sites sit 1–9 lines below and are
quoted where the payload matters.

**0. The two levers — re-take these first, they move most of the rows by themselves.**
`tests/e2e/helpers/levels.ts:116` — **`EXPECTED_LEVEL_COUNT = 35 → 40`**, and the docstring at `:30`
("the dataset's **35**-level ladder") with it; it is the one deliberately hand-typed dataset pin (§1 of
that file is the argument for keeping it typed), so every consumer below reads it. Its line number has
**moved from `§7d`'s `:111` to `:116`** — measured on this tip, not remembered (the intervening
tickets' prose above it grew). And
`tests/solver/l16-l20-candidates.test.ts:207`–`:213` — **`BOOKED_CANDIDATE_IDS_IN_SHELF` — the booking
literal still names the five files that have graduated** (`"l036.json" … "l040.json"`), so
`:215`'s set-equality row is red by name; **R-006c re-books it to `[]`**. The successor claim around
`:285`–`:306` (the root-scoped absence clause) is **already green**: `l041.json` is absent from the
root *and* from the shelf (measured by reading both directories, not assumed), and
`documentedLesson(40)?.obligation === null` now asserts on **L40** instead of L35.

**1. `tests/solver/difficulty.test.ts` — 8 red (`PINS` is short five rows).**
`:260` *the pin table covers the dataset* (`expected [ Array(35) ] to deeply equal [ Array(40) ]`) ·
`:266` it.each(SHIPPED_CASES) *l036–l040 §2 breakdown* ×5 (`TypeError: Cannot read properties of
undefined (reading 'L')` — `PINS[id]` undefined) · `:403` *the pre-registered L11 threshold…* (the
published `D_exec` 2-dp list) · `:622` *`lookaheadDepth` … saturates at `L − 1`*
(`…(reading 'lookahead')`). Add, in dataset order, in the **existing one-line shape** (the cross-file
parser in `metrics-sidecar.test.ts` matches `^\s*(\d+): \{ L: …, B: …, T: …, R: …, M: …, D: …,
dexec: …,` — a reformatted multi-line row would parse as *nothing*, which is that file's size tooth's
whole job):

| id | `L` | `B` | `T` | `R` | `M` | `D` | `dexec` | `bRaw` | `forced` | `lookahead` | `states` |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 36 | 18 | 1.4338 (1.4337606837606838) | 0 | 0 | 4 | 42.301282 | 22.301282 | 2.68 (2.675213675213675) | 0.14 (0.14316239316239315) | 17 | 936 |
| 37 | 20 | 1.4174 (1.4173913043478261) | 0 | 0 | 4 | 44.252174 | 24.252174 | 2.60 (2.6) | 0.13 (0.1282608695652174) | 19 | 920 |
| 38 | 22 | 1.4000 (1.4) | 0 | 0 | 4 | 46.20 | 26.20 | 2.62 (2.621739130434783) | 0.14 (0.14347826086956522) | 21 | 920 |
| 39 | 24 | 1.3953 (1.3952991452991452) | 0 | 0 | 4 | 48.185897 | 28.185897 | 2.68 (2.675213675213675) | 0.14 (0.14316239316239315) | 23 | 936 |
| 40 | 24 | 1.4851 (1.4851063829787234) | 0 | 0 | 4 | 48.455319 | 28.455319 | 2.73 (2.7319148936170214) | 0.14 (0.14042553191489363) | 23 | 940 |

`:403`'s list appends, after R-005a's `"28.34"`, the five values the run's own diff printed:
**`"22.30", "24.25", "26.20", "28.19", "28.46"`**. `lookahead ≡ L − 1` holds on all five
(17/19/21/23/23), so `:622` needs no re-wording — only the rows.

**2. `tests/solver/route-budget.test.ts` — 7 red (`PINS` is short five rows).**
`:741` *the pin table covers the dataset* (`expected [ Array(35) ] to deeply equal [ Array(40) ]`) ·
`:745` it.each(SHIPPED_CASES) *l036–l040 every printed metric equals its pre-n-11 value* ×5, whose own
payloads are the measured route budgets — `l036` `expected { shortest: 18, reachable: 936, …(13) } to
deeply equal undefined` · `l037` `{ shortest: 20, reachable: 920 }` · `l038` `{ shortest: 22,
reachable: 920 }` · `l039` `{ shortest: 24, reachable: 936 }` · `l040` `{ shortest: 24, reachable: 940 }`
· `:771` *the CLI's aggregate lines still hold* (`TypeError: … (reading 'dualPhaseTiles')`).
The five rows come straight from the sidecar records (`parRoutes` **36 / 72 / 48 / 162 / 30**,
`reachableStates` **936 / 920 / 920 / 936 / 940**, `par` **18 / 20 / 22 / 24 / 24**).

**3. `tests/solver/metrics-sidecar.test.ts` — 4 red.**
`:208` *one record per shipped level, in file order, with no extras* (`expected 40 to be 35`) ·
`:391` *the pin table was really parsed* (`expected [ Array(35) ] to deeply equal [ Array(40) ]`) ·
`:401` *every report row matches `tests/solver/difficulty.test.ts` PINS* (`l36: expected undefined to
be defined`) · `:414` *the published `D_exec` column is the pinned 2-dp list* (the same list, gaining
`"22.30", "24.25", "26.20", "28.19", "28.46"`). This file is the reason §1's table must be appended as
**one-line rows**: its cross-file parser reads `difficulty.test.ts`'s text.

**4. `tests/solver/ordered-companion.test.ts` — 5 red.**
`:229`–`:230` it.each(SHIPPED_CASES) *l036–l040 measured ordered list* ×5
(`expected { …(2) } to deeply equal undefined` — `ORDERED_PINS[id]` undefined at `:236`). The payload
is the **deliberate coincidence**: for each new rung the measured `ordered` list **equals** the
`unordered` one (verify against the sidecar's `refusedThenEnteredTileList` /
`refusedBeforeEnteredTileList`, which are byte-equal for all five — 25 tiles on l036–l039, **24** on
l040), exactly as ADR-0002's coincidence predicts for these boards.

**5. `tests/unit/level-inventory-derivation.test.ts` — 4 red.**
`:74` *the shipped dataset is the pinned count…* (`the discovered dataset has 40 levels,…`) ·
`:112` *ADD: one more level file is caught* (`a pristine clone must not alarm` — the scratch clone is
cut to the pinned **34** and no longer differs) · `:132` *REMOVE: one fewer…* (`expected 39 to be
34`) · `:141` *RENUMBER:…* (`expected 40 to be 35`). All four read `EXPECTED_LEVEL_COUNT`; the `:112`
row is the **non-vacuity tooth** and moves with the pin rather than around it.

**6. `tests/solver/l16-l20-candidates.test.ts` — 2 red.**
`:215` *the shelf holds only the booked pre-registration candidates…* (`expected [] to deeply equal [
'l036.json', 'l037.json', …(3) ]` — the shelf is EMPTY and the booking is not) · `:245` *two tails, two
facts…* (`expected 40 to be 35`). **This is the R-006c re-booking, and it is two edits, not one**:
`:207`'s literal → `[]`, and `:290`'s prose (which says the root "still stops at the pinned 35") →
40.

**7. `tests/unit/renderer-level-unlock.test.ts` — 2 red.**
`:81` *lists the whole authored slice, in order* (`expected [ 'l001.json', …(33) ] to deeply equal [
'l001.json', …(38) ]` — 35 vs 40 registry sources) · `:92` *accepts every file: ids 1..N…* (`[ Array(35) ]
to deeply equal [ Array(40) ]`). **Registry-side** — these two go green with **R-006b** (GAME's lane),
not with the pin table.

**8. `tests/solver/multi-switch-door-warning.test.ts` — 1 red.**
`:320` *reads the shipped dataset (40 boards, the pinned count)* (`expected [ 'l001.json', 'l002.json',
…(38) ] to have a length of 35 but got 40`). The title **interpolates** the shipped length, so the
red text already reads `(40 boards, the pinned count)` while the assertion still holds 35.

**9. `tests/unit/player-embedded-home.test.ts` — 1 red.**
`:92` *the registry is the shipped dataset…* (`expected 40 to be 35`). Count-derived; the sweep body is
already general over the dataset.

**10. Chain pre-alert — the 40-rung walk forecast CROSSES the live envelope (reported, not re-derived here).**
The neighbouring `tests/**` row's watchdog constant is `test.setTimeout(1_213_000)` at
`tests/e2e/playthrough.spec.ts:353`, derived by QA-023/QA-024 as
`envelopeMs = ceil(1.5 × 4.40 × localTotal)` with `localTotal = 183.718 s` (the **worse** of two plain
runs of the 35-rung walk, 479 moves) and `4.40 ×` = the **booked cloud datum**. **The published form
reproduces exactly on this tip** (`4.40 × 183.718 = 808.359 s` → `ceil(1_212.539) × 1000` =
**1_213_000 ms**), so the form is verified before it is reused. **The dataset is now 40 files**, so the
walk this row drives is longer, and the forecast is:

| input | value | source |
|---|---|---|
| `par(1…25)` | **269** | measured on the root bytes |
| `par(26…35)` | **210** | §7d's published sum, re-measured |
| `par(36…40)` | **108** | 18+20+22+24+24, measured on the five new bytes |
| moves(35) → moves(40) | **479 → 587** | **+108 = +22.5470 %** |
| `localTotal(40)` | **225.1408 s** | `183.718 × 587 / 479` (work-weighted, the row's own form) |
| `cloudFullChainS(40)` | **990.6197 s** | `4.40 × 225.1408` |
| `envelopeMs(40)` | **1_486_000 ms** | `ceil(1.5 × 990.6197) × 1000` |

**1_486_000 / 1_213_000 = 1.2251× — the forecast crosses the live constant.** The rung-count face
crosses too, independently: `ceil(1.5 × 4.40 × 183.718 × 40/35) = ceil(1_385.76) = **1_386_000 ms**`.
**STOP-AND-REPORT.** What this ticket may **not** do is re-derive the constant: `tests/**` is off-lane,
and §7d's own pre-ruling says a crossed envelope needs a **fresh named cloud datum**, not a re-run of
the same three inputs. **R-006a therefore leaves `1_213_000` byte-untouched and reports the crossing as
the hand-off's first item.** The two pre-registered bounds, recomputed at 40 rungs from the same three
published inputs so the next crossing is not an improvisation: (1) **same-family face**
`ceil(1.5 × 5.9 × 225.1408) = **1_993_000 ms**`; (2) **×100/40 work face** (ADR-design-0005's 100-level
formulation) `ceil(1.5 × 4.40 × 225.1408 × 100/40) = ceil(3_714.824) = **3_715_000 ms**`. Wall clock
only: `setTimeout` is a harness budget and no assertion in that spec moves.

---

## 7f. R-007 — the pins this registration breaks, VERBATIM (handed to R-007c)

`tests/**` is off-lane for this ticket (**R-007c** owns the migration, the way R-006c rode R-006a).
The list below is the run's own output (`node_modules/.bin/vitest run`, read-only, on this tip —
the five `git mv`-registered rungs, the regenerated **45**-record sidecar, and the doc edits):
**9 failed files / 28 passed (37);
34 failed / 1 002 passed / 3 skipped (1 039)**, Duration **53.96 s**, start **20:49:29**; log
`/tmp/r007-vitest-fresh.txt`, and **re-measured at the final tip `0387c60` with a second run: the
tally and the 34-row red set are identical, Duration 51.81 s** (`/tmp/r007-vitest-final.txt`,
`comm`-diff of the two red-name sets **0 lines**). The dataset moved **40 → 45** — the same move R-004a made
**20 → 25**, R-005a **25 → 35** and R-006a **35 → 40** — and the *file* count did not move
(9 failed files at R-006a too), so this is the identical instrument reporting a longer dataset,
not a new failure class. **No red row names a board, a rule or a solver behaviour**: the five new
rungs are clean on every program reader (`npm run levels` 45/45 · `0 errors` · `solve-levels
--audit src/levels` 45/45 with `par` verified 45/45 · `attest-r007-reg45` exit 0 with 396 MATCH
rows and **0** DIVERGENT · the family-g `--act=3 --ladder=41…45 --dir=src/levels` run **5/5
ACCEPT, 65/65 controls** · the same ladder with `--peak=31.7589095` **exit 1 on exactly L45**),
and every one of the five §5.2 mirror rows is **already green** (§2i) — the six rows the doc move
*healed* are named below.

**Evidence that this is a documentation move and not a verdict move.** The comparable pre-docs run
at **20:31** (`/private/var/folders/…/opencode/r007-vitest-tip.txt`) read **40 failed / 996 passed
/ 3 skipped (1 039)**, 51.53 s — and the `comm`-diff of the two red-name sets is **6 healed, 0 new**:
`the table has one row per record — no row invented, none dropped` plus the five
`L41 … L45 — every published cell equals the report` rows, i.e. exactly the `docs/level-difficulty.md`
§5.2 rows this ticket inserted (read back through `metrics-sidecar.test.ts`'s cross-file parser).
No *production* reader moved its verdict between the two runs, and no row appeared that the 20:31 run
did not already have: `vitest` is a **symptom** here, and the symptom changed only where the
documentation changed.

Per-`file:line` groups below; each carries the **measured** new expectation, taken from
`docs/level-difficulty.report.json` records 41–45 (the regenerated sidecar, which is the law) or from
the failing row's own printed payload. The `file:line` for each row is the **`it(` declaration line**
(the convention §7d/§7e used); the run's own `❯ file:LINE:COL` assertion sites sit 1–16 lines below
and are quoted where the payload matters.

**0. The two levers — re-take these first, they move most of the rows by themselves.**
`tests/e2e/helpers/levels.ts:129` — **`EXPECTED_LEVEL_COUNT = 40 → 45`**, and the docstring at
`:30` ("the dataset's **40**-level ladder — R-002 tree → …") with it, which must also gain the
**R-007** link in its own arrow chain (`… → **R-006a's Act II batch 4** … → **R-007's Act III
batch 1, the act opener** (`l041`–`l045`, the same byte-parity `git mv` off the LV-018 shelf;
`src/levels/README.md` §2i + the sidecar's **45** records)`). It is the one deliberately hand-typed
dataset pin (§1 of that file is the argument for keeping it typed), so every consumer below reads
it; its line number has **not** moved from R-006c's `:129` — measured on this tip, not remembered.
The prose at `:193` (the pin "stays" clause) is **count-free** and needs nothing. And
`tests/solver/l16-l20-candidates.test.ts:223` — **`BOOKED_CANDIDATE_IDS_IN_SHELF` is already `[]`**,
so `:236`'s set-equality row reads `expected [] to deeply equal []` and is **GREEN**: the shelf is
empty *and* unbooked, which is R-006c's own emptiness case and exactly what §2i re-measured by
reading both directories. **No edit is needed there** — the lever R-006c added is already taken.

**0b. The second-order tooth in the same file — the lever *makes* two rows red unless they are re-pointed.**
`tests/solver/l16-l20-candidates.test.ts:284` (`expect(EXPECTED_LEVEL_COUNT).toBe(ACT_II_REGISTERED_IDS.at(-1))`)
and `:285` (`… .toBe(ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID)`) read **GREEN today for the wrong
reason**: they pass only because the pin still says `40` = Act II's registered tail. With the pin at
**45** they fail — and *both* the naive fix (`expect(EXPECTED_LEVEL_COUNT).toBe(45)`) and the
"re-stamp the act constant" fix are forbidden by §7.3.2. The act-boundary-correct reading is the
**live** tail constant this ticket published: `ACT_III_REGISTERED_TAIL_LEVEL_ID` (= `45`, alias-free)
beside the frozen `ACT_II_R006A_REGISTERED_TAIL_LEVEL_ID` (= `40`) and the frozen
`ACT_II_R005A_REGISTERED_TAIL_LEVEL_ID` (= `35`), with the comment naming the **act boundary** as the
reason the two no longer coincide. The row's **title** at `:255` ("…while the dataset's tail is the
pinned **40**") and the comment block above `:277`–`:283` must be re-worded in the same pass. This is
the one place where a mouth-breather fix (bump the pin, keep the constant) would trade two reds for
two reds *and* silently re-stamp Act II's tail — so R-007c should take `:284`/`:285` **with** `:129`,
not after it.

**1. `tests/solver/difficulty.test.ts` — 8 red (`PINS` is short five rows).**
`:287` *the pin table covers the dataset* (`expected [ Array(40) ] to deeply equal [ Array(45) ]` at
`:288`) · `:293` it.each(SHIPPED_CASES) *l041–l045 §2 breakdown* ×5 (`TypeError: Cannot read
properties of undefined (reading 'L')` at `:298` — `PINS[id]` undefined) · `:430` *the pre-registered
L11 threshold is the shipped L10 value, reproduced by the program* (the published `D_exec` 2-dp list
at `:447`: `…(42)` received vs `…(37)` expected) · `:661` *`lookaheadDepth` … saturates at `L − 1`
— it is not the missing lever* (`TypeError: … (reading 'lookahead')` at `:668`, whose `for` loop
runs over the whole of `SHIPPED_IDS`). Add, in dataset order, in the **existing one-line shape** (the
cross-file parser in `metrics-sidecar.test.ts` matches `^\s*(\d+): \{ L: …, B: …, T: …, R: …, M: …,
D: …, dexec: …,` — a reformatted multi-line row would parse as *nothing*, which is that file's size
tooth's whole job):

| id | `L` | `B` | `T` | `R` | `M` | `D` | `dexec` | `bRaw` | `forced` | `lookahead` | `states` |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 41 | 20 | 1.4191 (1.4191096634093376) | 0 | 0 | 4 | 44.257329 | 24.257329 | 2.60 (2.6015200868621062) | 0.15 (0.1498371335504886) | 19 | 921 |
| 42 | 22 | 1.4129 (1.4129244249726178) | 0 | 0 | 4 | 46.238773 | 26.238773 | 2.61 (2.606790799561884) | 0.15 (0.14895947426067907) | 21 | 913 |
| 43 | 24 | 1.4046 (1.4046052631578947) | 0 | 0 | 4 | 48.213816 | 28.213816 | 2.62 (2.6228070175438596) | 0.15 (0.14692982456140352) | 23 | 912 |
| 44 | 26 | 1.4084 (1.4084051724137931) | 0 | 0 | 4 | 50.225216 | 30.225216 | 2.65 (2.648706896551724) | 0.14 (0.14439655172413793) | 25 | 928 |
| 45 | 26 | 1.4851 (1.4851063829787234) | 0 | 0 | 4 | 50.455319 | 30.455319 | 2.73 (2.7319148936170214) | 0.14 (0.14042553191489363) | 25 | 940 |

`:447`'s list appends, after R-006a's `"28.46"`, the five values the run's own diff printed:
**`"24.26", "26.24", "28.21", "30.23", "30.46"`** (the sidecar's own 2-dp column, not a re-rounding —
§7.9's derived-exact rule is why the row carries the full floats too). `lookahead ≡ L − 1` holds on
all five (19/21/23/25/25), so `:661` needs no re-wording — only the rows. `T ≡ R ≡ 0` and `M = 4`
on all five, so the fifth term carries no new reading.

**2. `tests/solver/route-budget.test.ts` — 7 red (`PINS` is short five rows; 53 726 ms — the
heaviest file in the run).**
`:760` *the pin table covers the dataset (no shipped level is unpinned)* (`[ Array(40) ]` vs
`[ Array(45) ]` at `:761`) · `:764` it.each(SHIPPED_CASES) *l041–l045 every printed metric equals its
pre-n-11 value* ×5, whose own payloads are the measured projections —
`l041` `expected { shortest: 20, reachable: 921, …(13) } to deeply equal undefined` ·
`l042` `{ shortest: 22, reachable: 913 }` · `l043` `{ shortest: 24, reachable: 912 }` ·
`l044` `{ shortest: 26, reachable: 928 }` · `l045` `{ shortest: 26, reachable: 940 }` ·
`:790` *the CLI's aggregate lines still hold* (`TypeError: … (reading 'dualPhaseTiles')` at
`:804`, because the derived columns walk every shipped id). The five rows come straight from the
sidecar records and the run's own printed objects — `par` **20 / 22 / 24 / 26 / 26**,
`reachableStates` **921 / 913 / 912 / 928 / 940**, `distinctPositions` **49** ×5,
`maxDepth` **40 / 42 / 46 / 47 / 46**, `dualPhaseTiles` **7** ×5,
`refusedThenEnteredTiles` **25 / 25 / 26 / 25 / 24** (`refusedBeforeEnteredTiles` byte-equal on
all five, and the two tile **lists** identical, which is why group 4's payload is the coincidence
and not a difference), `deadStates` **0** ×5, `unrecoverableStates` **0** ×5,
`parRoutes` = `embedRoutes` **48 / 336 / 27 / 27 / 30** with `embedForced: true` ×5,
`allOffGoalReachable: false` ×5 with `allOffReachableStates` **11** ×5, and the audit cost triple
`{ visits, lookaheadVisits, prunedChildren }` = **{222, 2 891, 345} / {1 338, 6 313, 2 145} /
{198, 2 485, 439} / {201, 3 063, 441} / {198, 3 881, 337}** — exactly as the failing rows print them
(quoted verbatim in this run's log, lines 1 131–1 456).

**3. `tests/solver/metrics-sidecar.test.ts` — 4 red.**
`:208` *one record per shipped level, in file order, with no extras* (`expected 45 to be 40` at
`:217`) · `:391` *the pin table was really parsed (one row per shipped level, no silent empty match)*
(`[ Array(40) ]` vs `[ Array(45) ]` at `:396`; the row at `:395` reads
`expect(HAND_PINS.size).toBe(EXPECTED_LEVEL_COUNT)` and moves with group 0's lever) · `:401` *every
report row matches `tests/solver/difficulty.test.ts` PINS* (`l41: expected undefined to be defined`
at `:405` — it walks the **report**, so it is red until group 1's rows land, in report order) ·
`:414` *the published `D_exec` column is the pinned 2-dp list — L11 = 8.57 included* (the same
`…(42)` vs `…(37)` diff at `:417`). This file is the reason group 1's table must be appended as
**one-line rows**: its cross-file parser reads `difficulty.test.ts`'s text. **Already green here,
and worth recording as such**: `:340` (*the pair list is exactly the seams §5.2 has a read-out for*),
`:353`, `:358` (*the table has one row per record*) and `:365` it.each (*every published cell
equals the report*, the five healed rows) — the §5.2 mirror was completed **before** this dossier
was written, so R-007c's remaining work in this file is the pin table and the two lists, not the
documentation.

**4. `tests/solver/ordered-companion.test.ts` — 5 red.**
`:229`–`:230` it.each(SHIPPED_CASES) *l041–l045 measured ordered list* ×5
(`expected { …(2) } to deeply equal undefined` — `ORDERED_PINS[id]` undefined at `:236`), appended to
the table whose last row is `40: {` at `:503` and whose keys are typed
`Readonly<Record<…>>`. The payload is the **deliberate coincidence**: for each new rung the measured
`ordered` list **equals** the `unordered` one (verified against the sidecar's
`refusedThenEnteredTileList` / `refusedBeforeEnteredTileList`, byte-equal for all five — **25 / 25 /
26 / 25 / 24** tiles, and tile-for-tile identical), exactly as ADR-0002's coincidence predicts for
these boards; the run prints the received list in full for each rung. The *class* rows
(`:210`, `:240`, `:271`) are **already green**: the refinement law holds on all 45, no gate verdict
moves, and `l008`'s named-gate table is untouched.

**5. `tests/unit/level-inventory-derivation.test.ts` — 4 red.**
`:74` *the shipped dataset is the pinned count…*
(`the shipped dataset must be exactly the pinned L1…LN ladder: expected 'the discovered dataset has
45 levels, the pinned registry ships 40' to be null` at `:88`) · `:112` *ADD: one more level file is
caught by the pinned count* (`a pristine clone must not alarm` — the scratch clone now inherits the
same `45 vs 40` verdict, so the **non-vacuity tooth itself fires first**, at `:116`) · `:132` *REMOVE:
one fewer…* (`expected 44 to be 39` at `:137`) · `:141` *RENUMBER:…* (`expected 45 to be 40` at
`:152`). All four read `EXPECTED_LEVEL_COUNT`. **This group is the argument for the lever being taken
first and alone**: three of its four rows are *mutation probes* whose whole job is to prove the
alarm is non-vacuous, so they cannot be reasoned about until the alarm is re-based — after the pin
moves they read `45 / 46 / 45 / 45` and the probes keep their teeth (the `:112` row is the one that
must be checked **before** the pin moves, since it is the row that proves the "pristine clone" is
pristine).

**6. `tests/solver/l16-l20-candidates.test.ts` — 2 red** (plus group **0b**'s two rows that this
lever *creates*).
`:225` *the shelf holds only the booked pre-registration candidates, every rung derived strictly
above the registered root max* (`expected 45 to be 40` at `:246` — the row at `:246` compares the
**derived** root max against the pin) · `:255` *two tails, two facts…* (`expected 45 to be 40` at
`:276`, the same shape against `maxShipped`). Note what is **not** red here any more:
`:236`'s `expected [] to deeply equal []` is green (group 0), and the per-rung block rows
(`:339`–`:382`, `:409`–`:426`) walk `BLOCK_IDS`, which is Act I's block and therefore unchanged —
a useful negative control that this file's other teeth did not move.

**7. `tests/unit/renderer-level-unlock.test.ts` — 2 red.**
`:81` *lists the whole authored slice, in order* (`[ 'l001.json', 'l002.json', …(38) ]` vs
`…(43)` at `:87` — the registry's own file list against the fs scan) · `:92` *accepts every file:
ids 1..N…* (`[ Array(40) ]` vs `[ Array(45) ]` at `:96`). **Registry-side** — these two go green with
**R-007b** (GAME's lane: the five `LEVEL_SOURCES` rows), not with the pin table alone; the same
split R-006b/R-006c followed.

**8. `tests/solver/multi-switch-door-warning.test.ts` — 1 red.**
`:320` *reads the shipped dataset (**45** boards, the pinned count)* (`expected [ 'l001.json',
'l002.json', …(43) ] to have a length of 40 but got 45` at `:324`). The title **interpolates** the
shipped length, so the red text already reads `(45 boards, the pinned count)` while the assertion
still holds 40 — a one-line row, and §2i's warning delta (**218 = 183 + 35**, `0`
multi-switch-door) is what the row's siblings re-check and already pass.

**9. `tests/unit/player-embedded-home.test.ts` — 1 red.**
`:92` *the registry is the shipped dataset…* (`expected 45 to be 40` at `:102`). Count-derived; the
sweep body is already general over the dataset, so the pin move is the whole edit.

**10. Chain pre-alert — the 45-rung walk forecast CROSSES the live envelope (reported, not re-derived here).**
The neighbouring `tests/**` row's watchdog constant is `test.setTimeout(1_397_000)` at
`tests/e2e/playthrough.spec.ts:373`, derived by the QA-0xx envelope round as
`envelopeMs = ceil(1.5 × 4.40 × localTotal)` with `localTotal = 211.602 s` (the **worse** of two plain
runs of the **40**-rung walk, 587 moves) and `4.40 ×` = the **booked cloud datum**; its own comment
block (`:315`–`:363`) publishes the two pre-registered faces this dossier recomputes below.
**The published form reproduces exactly on this tip** (`4.40 × 211.602 = 931.0488 s` →
`ceil(1_396.5732) × 1000` = **1_397_000 ms**), so the form is verified before it is reused.
**The dataset is now 45 files**, so the walk this row drives is longer, and the forecast is:

| input | value | source |
|---|---|---|
| `par(1…25)` | **269** | §7d's published sum, re-measured |
| `par(26…35)` | **210** | §7d's published sum, re-measured |
| `par(36…40)` | **108** | §7e's published sum (18+20+22+24+24) |
| `par(41…45)` | **118** | 20+22+24+26+26, **measured on the five new bytes** |
| moves(40) → moves(45) | **587 → 705** | **+118 = +20.1022 %** |
| `localTotal(45)` | **254.1387 s** | `211.602 × 705 / 587` (work-weighted, the row's own form) |
| `cloudFullChainS(45)` | **1118.2103 s** | `4.40 × 254.1387` |
| `envelopeMs(45)` | **1_678_000 ms** | `ceil(1.5 × 1118.2103) × 1000` |

**1_678_000 / 1_397_000 = 1.2011× — the forecast crosses the live constant.** The crossing survives
the known forecast model error, measured on this very row pair: R-006a's forecast for the 40-rung row
was **1_486_000 ms** and QA's measurement landed at **1_397_000**, i.e. **5.99 % below** the forecast
(`1_397_000 / 1_486_000 = 0.94011`; the same ratio on the work input as `211.602 / 225.1408`).
Applying that factor to the new forecast: `ceil(1.5 × 4.40 × (254.1387 × 0.94011)) × 1000` =
`ceil(1_576.82) = ` **1_577_000 ms**, still **1.1288×** the live constant. The rung-count face crosses
too, independently: `ceil(1.5 × 4.40 × 211.602 × 45/40) = ceil(1_571.14) = ` **1_572_000 ms**
(**1.1253×**). **STOP-AND-REPORT.** What this ticket may **not** do is re-derive the constant:
`tests/**` is off-lane, `1_397_000` is **QA's** number, and §7d's own pre-ruling says a crossed
envelope needs a **fresh named cloud datum**, not a re-run of the same three inputs.
**R-007 therefore leaves `1_397_000` byte-untouched and books the fresh measurement by name to
R-007c** — the walk-class chain now prices **705** moves where the constant was derived on **587**,
and the *shape* of the row (one number, `ceil(1.5 × rate × local)` with a booked rate) is unchanged,
so the next round is a measurement, not a redesign. The two pre-registered faces, recomputed at
**45** rungs from the same three published inputs so the next crossing is not an improvisation:
(1) **same-family face** (the row's own remedy, `5.9 ×` local)
`ceil(1.5 × 5.9 × 254.1387) = ceil(2_249.13) = ` **2_250_000 ms**; (2) **×100/45 work face**
(ADR-design-0005's 100-level formulation)
`ceil(1.5 × 4.40 × 254.1387 × 100/45) = ceil(3_727.37) = ` **3_728_000 ms**. Both are published as
*inputs*, never as edits: R-007c re-measures and picks. **Wall clock only** — `setTimeout` is a
harness budget, no assertion in that spec moves, and the same spec's per-level rows (`:109`'s
`90_000`) are untouched by this registration (§2i's `par` ceiling is still L45's 26).
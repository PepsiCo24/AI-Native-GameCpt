# ADR-architecture-0003 — Divergence-rate single source; solver-report sidecar; `graphics2d` probe co-location; `isPlayerEmbedded` & multi-switch-flag layer homes

- **Status:** Accepted — Architect ruling (task AR-0006); Orchestrator sign-off at merge to `develop`
- **Date:** 2026-10-15
- **Deciders:** Agent 2 (Technical Architect). Ruling 1 closes RV-006 MINOR-1 / its OQ1 (project-status item 40); Ruling 2 closes R-002b OQ4 (item 34); Ruling 3 closes LV-007B OQ5 / RV-006 OQ3 (items 35/40); Ruling 4 closes RV-005 n-6 (item 31); Ruling 5 closes LV-007C OQ4 (item 39).
- **References:** `tests/solver/ordered-companion.test.ts` §5; ADR-architecture-0002 (evidence 3, decision (c)); `src/game/renderer/objects/graphics2d.ts`; `src/game/renderer/cell-state.ts:120`; `src/game/systems/session.ts:31`; `src/core/rules/solid.ts:155` (`solidAt`); `src/core/solver/bfs.ts:811`; `src/core/solver/difficulty.ts` (`DifficultyBreakdown`); `docs/level-design.md` §1 (multi-switch sentences); `src/core/level/index.ts:499` (the validator warning family); project-status items 31/34/35/39/40.
- **Changes no rule, no code, no level.** Rulings 1–3 are canonicality/persistence rulings over artefacts that exist; Rulings 4–5 are layer-home rulings executed by named follow-up tickets. This ADR is written ruling-by-ruling across the AR-0006 commit series.

## Ruling 1 — the unordered/ordered divergence rate has exactly one citable number: the test-pinned **46/2000 (2.3 %)**; 18/2000 (0.9 %) is demoted to a labeled historical measurement

### Context

Three figures circulate for the same quantity (boards where `refusedThenEnteredTiles > 0` but `refusedBeforeEnteredTiles = 0` — unordered-only divergence, the trapped-refusal class):

1. **46/2000 (2.3 %)** — the in-repo sweep pinned by `tests/solver/ordered-companion.test.ts` §5 (line 519: `expect(SWEEP.divergence).toBe(46)`): seeds 1–2000 through the **committed** `randomLatch` generator (`makeRng`, `tests/helpers/search.ts:149`), with the structure honestly recorded — 44/46 explained by the self-closing latch (door tile = switch tile), 2 unexplained (seeds 187, 1228). Cited live by `docs/ai-native-pipeline.md` §8.5 ("on 2000 seeded single-door-single-switch boards 46 diverge…").
2. **0.9 %-class** — changelog phrasing (`docs/ai-native-pipeline.md` V0.6 changelog; `docs/level-design.md` V0.6 changelog) derived from figure 3.
3. **18/2000 (≈ 0.9 %)** — ADR-architecture-0002 evidence 3, decision (c), consequences, Appendix A1; echoed live in `docs/level-design.md` §3 (iii) and `docs/decisions/0009` Context-item-5 closure line. Source: the AR-0005b-era **out-of-repo** mulberry32 harness measured at `b65e465`.

### Facts (verified on `4d9dde9`)

- The 46/2000 sweep is re-runnable by anyone today: `node_modules/.bin/vitest run tests/solver/ordered-companion.test.ts`. Its generator, seed mapping and board population are committed and pinned (the test fails if any count moves).
- The 18/2000 harness was **never committed**. Its generator — board distribution, whether door-tile = switch-tile overlap boards were admitted (the pinned sweep admits them: 119/2000, and they explain 44 of the 46 divergences), its seed mapping — is unrecoverable. The number cannot be re-run, cannot be audited, and cannot be diffed against the pinned sweep.
- This is the **second** corrigendum of this exact class: the 9/200 M1-alone residue (project-status, "The 9/200 residue — CLOSED") was root-caused to a fabricated initial state inside the same kind of out-of-repo harness. Twice burned.

### 裁决 (ruling)

**Option (b) adopted; option (a) rejected.** No harness import. Importing the old generator would add a second board generator whose only purpose is reproducing a superseded number — pure maintenance surface with zero decision value (§13, YAGNI), and the in-repo sweep already measures the divergent class with a stricter, committed, test-pinned generator.

**Citation law (normative):**

- Any **live** (non-changelog) citation of the unordered/ordered divergence rate reads: **"46/2000 (2.3 %) seeded one-door-one-switch boards diverge unordered-only — 44 explained by the self-closing latch (door tile = switch tile), 2 unexplained (seeds 187, 1228) — pinned by `tests/solver/ordered-companion.test.ts` §5"**.
- The 18/2000 / 0.9 % figure may appear **only** with the historical label: *"historical AR-0005b-era measurement from an out-of-repo mulberry32 harness at `b65e465`; generator never committed, not reproducible; superseded by the pinned in-repo 46/2000 scan (different generators, different board populations — the numbers do not contradict; the pinned one governs)"*.
- Dated **changelog** rows keep their historical numbers untouched; the label obligation applies when the line is edited for another reason, and to all live text now.

**Studio rule (precedent, now twice enforced):** a measurement that cannot be re-run from the repo is not evidence; it is an anecdote with digits. Every cited number must resolve to a committed generator.

### LV-007D micro-ticket — exact execution wording (doc edits owned by LV / GD; ruling by Architect)

- **LV — `docs/ai-native-pipeline.md`:** the live §8.5 divergence sentence (currently "…on 2000 seeded single-door-single-switch boards 46 diverge (44 of them because the door tile *is* the switch tile)") gains the pin citation and the unexplained residue: *"…46 diverge (44 of them because the door tile* is *the switch tile; 2 unexplained — seeds 187, 1228), pinned by `tests/solver/ordered-companion.test.ts` §5"*. The V0.6 changelog's "0.9 %-class" is dated history — leave it.
- **GD — `docs/level-design.md` §3 (iii) live text:** replace "(18/2000 random latch boards fire unordered but never ordered — a beat no player can witness)" with the pinned citation: "(46/2000 seeded latch boards fire unordered but never ordered — 2.3 %, pinned by `tests/solver/ordered-companion.test.ts` §5 — a beat no player can witness)". The V0.6 changelog's "0.9 % trapped-refusal class" is dated history — leave it.
- **GD — `docs/decisions/0009` Context-item-5 closure line:** this is live closure text, not a changelog; append the label: "(18/2000 — historical out-of-repo figure; the pinned in-repo number is 46/2000, ADR-architecture-0003 Ruling 1)".
- Architect-owned files carry their own corrigenda in this sweep: `docs/architecture.md` §8.1 依据 (iii) annotation and the ADR-architecture-0002 corrigendum section (both landed with AR-0006).

**Countersign:** requested from LV on execution, per item 40's "Architect+LV countersign" — the execution is wording-only; no number is re-derived.

## Ruling 2 — `graphics2d.ts` keeps the interface and its compile-time probe **co-located** (terminal; no split, no engineer ticket)

**Question (R-002b OQ4):** `src/game/renderer/objects/graphics2d.ts` is documented as the painters' narrow *type* seam, yet it physically carries a runtime value — the compatibility probe `export const PHASER_GRAPHICS_IS_GRAPHICS2D: Phaser.GameObjects.Graphics extends Graphics2D ? true : never = true` (graphics2d.ts:73-75). Keep type + probe in one module, or split the probe into a `types-probe.ts`?

**Facts (verified on `4d9dde9`):**

- Every consumer imports the interface as a **type** — 9 import sites (`wall-tiles.ts`, `objects/{goal,door,switch,wall,registry,portal,glyph}.ts`, `tests/helpers/graphics-recorder.ts`), all `import type`.
- `tsconfig.json:16` sets `verbatimModuleSyntax: true`, so type-only imports are erased statically: **the module never enters any import graph at runtime, and the probe's shipped footprint is zero.** The "pure interface module" property holds at the consumption boundary, which is the only place it matters.
- The probe is a *value* on purpose, and the file header documents the proof: the earlier type-alias version was shown vacuous by making the interface unsatisfiable and watching `tsc --noEmit` exit 0; R-002b (m-1) re-proved the value probe fails `tsc` in **both** directions. The probe is exported only so `noUnusedLocals` cannot delete the evidence; nothing imports it.
- The probe has exactly one referent — the `Graphics2D` interface in the same file. Co-location is the guard's visibility: any edit to the interface shows the probe in the same diff and fails `tsc` naming the seam (graphics2d.ts:19-25), instead of failing somewhere inside a painter.

**裁决 (one-line terminal ruling):** the module stays as-is — interface and its compile-time proof of fit are one seam artifact; splitting them adds a one-const module, buys zero decoupling, and separates the guard from the guarded, which is how guards rot (§13: no measured problem, no move).

**Rejected:** `types-probe.ts` split (churn; the purity it buys is aesthetic — erased at the boundary anyway). **No engineer ticket is issued.** If a future change ever value-imports the module, the probe rides the bundle as an exported `true` — harmless, and still not a reason to split.

## Ruling 3 — accepted-set metrics persist as a **generated sidecar report** with a freshness pin; the level schema stays untouched

**Question (LV-007B OQ5 / RV-006 OQ3):** the acceptance metrics — `B T R M` / `D` / `Dexec` and the solver fields — are today **recomputed** on every `scripts/solve-levels.ts` run and pinned by tests, but never land on disk as an artifact. Submission material and frozen pre-registrations (GD-008's `D_exec(L11) < 13.64`, project-status item 36) need a per-level difficulty table that can be *shown*, not re-derived by hand. Three options: (a) keep recompute-only; (b) add metric fields to the level files (schema change); (c) a committed sidecar report.

### 裁决 (ruling): **(c), minimal surface — one flag, one file, one pin.**

1. **Emit:** `scripts/solve-levels.ts --report` writes **`docs/level-difficulty.report.json`** — one record per shipped level carrying only what `analyse` (`SolveResult`) and `analyseDifficulty` (`DifficultyBreakdown`) already compute: `id`, `solvable`, `shortestSolution`, `par` (read back from the level file, as a cross-check), `reachableStates`, `deadStates`, `dualPhaseTiles`, `refusedThenEnteredTiles`, `refusedBeforeEnteredTiles`, `L B T R M`, `D`, `Dexec` — plus a header with the weight vector (`DIFFICULTY_WEIGHTS`) so the table is self-describing. **No git SHA inside the payload** — the freshness pin compares the whole file, and a SHA would break it on every unrelated commit. No new metric is invented for the report.
2. **Pin (the "whoever drifts goes red" mechanism, same discipline as §9.1):** a `tests/solver/**` freshness test recomputes the report from `src/levels/*.json` in memory and asserts deep-equality with the committed file. Any level edit, weight change or solver change without a regeneration goes red at commit time.
3. **Ownership (ruled here, ratified at merge):** the file is machine-written by LV's script and pinned by LV's test, so it is assigned to Level AI + Solver as an extension of its `docs/level-difficulty.md` ownership — hand-edits forbidden; Docs + GitHub's `docs/**` catch-all explicitly excludes generated artifacts with a named generator. DG *consumes* it for submission tables.

### Rejected options

- **(a) Recompute-only — rejected on evidence drift, twice burned.** Every prose-copied number is a future MINOR: the divergence-rate drift (Ruling 1 above) and the `docs/level-difficulty.md` §3 stale rows withdrawn at LV-007C are the two prior incidents of exactly this class. A competition submission needs an artifact a judge can diff against a one-command re-run; "run the script yourself" is reproducibility for *us*, not evidence for *them*.
- **(b) Level-file fields — rejected.** Derived measurements in the authoring source of truth: the schema cannot enforce freshness, the change ripples through the zod schema / fixtures / all ten level files, and it invites hand-tuned numbers (`AGENTS.md` §7 culture). `par` stays the **single deliberate exception** — gameplay displays it (§5). Nothing else derived earns a schema field.

### Follow-up ticket (LV queue — code; LV owns `scripts/**`, `src/levels/**`, `tests/solver/**`)

`LV-007E` (name assigned here): `scripts/solve-levels.ts --report` + committed `docs/level-difficulty.report.json` + the freshness pin in `tests/solver/`. Acceptance: the pin goes red when any shipped level's `Dexec` changes without regeneration; the file renders the GD-008 frozen anchors exactly (L10 `Dexec` = 13.64…, the L11 pre-registration threshold). Docs-do-not-run-ahead-of-code note: `docs/architecture.md` §8/§12 name this artifact as **specified, not yet implemented** until the ticket lands.

## Ruling 4 — `isPlayerEmbedded` is **rule semantics, so its home is `src/core/rules`**; the renderer keeps the flag-injection seam (closes RV-005 n-6)

**Finding (RV-005 n-6, item 31; verified on `4d9dde9`):** `isPlayerEmbedded` is defined in the **renderer** (`src/game/renderer/cell-state.ts:120`) and imported by the **gameplay** layer (`src/game/systems/session.ts:31,111`) — a `systems → renderer` edge, the reverse of the §4 direction. It is also a second implementation of a predicate core already owns: the solver's arrival record computes the identical concept as `solidAt(level, after.phase, after.doorsOpen, after.player)` (`src/core/solver/bfs.ts:811`), while the renderer re-derives it as `isWallSolidAt(...) || isClosedDoorAt(...)` (equal to `solidAt` on every in-bounds tile — the player position is always in-bounds — but a parallel truth all the same). And `cell-state.ts`'s own header declares the module "appearance only, never legality" — a law this export breaks: the predicate answers a GameState question with rule meaning (the §6.1 / ADR-0008-clause-3 embedded state), consumed by gameplay (`session.playerEmbedded`).

**裁决 (ruling):**

- **Core owns the predicate.** "Does the player stand inside a tile solid in the current phase?" is a pure function of `(level, phase, doorsOpen, playerPosition)` over core data — the same solidity truth as `solidAt`, under a name that documents ADR-0008 clause 3 at call sites. One truth source: implemented **via** `solidAt`, never beside it.
- **Renderer owns only the mapping from that verdict to paint.** The correct seam already exists: `wallRenderState(level, gs, tile, playerEmbedded: boolean)` (cell-state.ts:96) takes the flag as an **input**. Nothing in the renderer needs to own the question.
- **Gameplay imports it from core.** The `systems → renderer` edge disappears; `systems → core` is the legal direction.
- **What the renderer may keep:** tile-classification for painting (`wallRenderState`, door/portal paint states) and `isPlayerAt` (view-side comparison, no rule meaning).

**Engineering micro-ticket (R queue; Gameplay Engineer owns `src/core/rules/**` + `src/game/**`; I touch no `src/**`):**

1. Add to `src/core/rules/solid.ts`: an exported `isPlayerEmbedded(level: Level, gs: GameState): boolean` (GameState-shaped so the migration is mechanical) implemented as `solidAt(level, gs.phase, gs.levelState.doorsOpen, gs.playerPosition)`, with a doc line naming ADR-0008 clause 3. (`GameState` is already imported from `@/core/state/types` in that module's family — no new dependency.)
2. `src/game/systems/session.ts:31,111`: import from `@/core/rules/solid`; delete the renderer import.
3. `src/game/renderer/board-view.ts:352,380,419`: same repoint.
4. `src/game/renderer/cell-state.ts`: delete the `isPlayerEmbedded` export (its doc paragraphs move with the predicate, minus the paint-duty clauses which stay); `wallRenderState` unchanged.
5. Tests: `tests/unit/renderer-registry-layers.test.ts:33,437,457` repoint the import to core (rides in the same commit per the R-002b tests pattern; QA notified in the return contract).
6. Acceptance: `tsc` 0; vitest green; `grep -rn 'from "@/game/renderer' src/game/systems/` is empty; `cell-state.ts` no longer exports the predicate.

## Ruling 5 — the multi-switch-target flag lives at the **validator-warning** layer; no policy code until GD quantifies the L36+ allowance (closes LV-007C OQ4)

**Finding (item 39; verified on `4d9dde9`):** `docs/level-design.md` §1 carries the law twice — the `switches` row ("each door is targeted by at most one switch in L6–L35 … flagged in review (validator warning recommended)") and the validation-invariants sentence ("door targeted by more than one switch ⇒ review flag (warning; hard rejection above the L36+ allowance is Solver-side policy)") — and **nothing implements it**: the validator's warning family (`src/core/level/index.ts:399–505`) has no such entry, and the `POLICY_VIOLATION_CODES` inventory (13 codes, `policy.ts:576`) has no such code.

**裁决 (ruling) — the layer follows the verdict strength:**

- **Home = validator warning** (`src/core/level/index.ts`, the existing `warnings.push` family). The property is statically and locally decidable from level JSON alone — count the switches whose `targets` list a given door id; `> 1` flags. No search is needed, so no solver artifact may be its gate (a hard acceptance edge that needs no search would make acceptance depend on a search run for nothing — the same arrow argument policy.ts's header uses, in reverse).
- **No policy code today (YAGNI).** `POLICY_VIOLATION_CODES` names **rejections** the acceptance law consumes, one negative control per code (pipeline §8.3). Through L35 the multi-switch shape is *legal but flagged* — there is no rejection to name, hence no code and no control. When GD writes the L36+ allowance as an actual number (or a lesson row claiming an XOR construction), the policy code lands **in that same ticket, with its control** — spec-first, the n-13 precedent (`switch-without-targets` warns in the validator *and* rejects in policy, one layer per verdict strength).

**Follow-up tickets:**

- **LV (code):** validator warning — for each door id targeted by ≥ 2 switches, `warnings.push` naming the door, the count, the switch ids, and the doc anchor (`docs/level-design.md` §1, L6–L35 authoring rule). Tests (LV/QA per house pattern): a 2-switches→1-door fixture warns; 1→1 silent; 2 switches targeting 2 distinct doors silent; distinct from the inert-switch warning (a 2→1 board has no empty `targets`).
- **GD (wording — optional):** the law already exists at level-design §1; GD confirms the warning string's anchor or adjusts the allowance phrasing. No ADR needed.

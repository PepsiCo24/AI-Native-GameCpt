# AI Usage Log

> Owner: **Orchestrator (Agent 0)**
> Purpose: rough cost control. **Never** record API keys, tokens, or provider secrets here.

Rough counts only — no exact token accounting is available from the harness.

## 2026-10-14 — Stage 0 (bootstrap, model routing, design round)

| Phase | Agents / models used | Count | Notes |
|---|---|---|---|
| Model smoke test | kimi-k3, glm-5.3, qwen3.8-max, qwen3.8-flash, deepseek-v4.1-flash | 5 probes | identical tiny task; all passed |
| Vision probe | same 5 models | 5 probes | only qwen3.8-max accepted image input |
| Design round | game-designer (kimi-k3), architect (kimi-k3), ui-art-director (qwen3.8-max) | 3 (1 retry) | GD-001 first attempt wrote no files → retried once |
| Synthesis | reviewer (qwen3.8-max) | 1 | read-only review |
| Docs | docs-github (qwen3.8-flash) | 1 | submission skeletons + status |
| Orchestrator | kimi-k3 | — | recovery, config, integration, GitHub sync |

**Policy applied:** one shared probe per model instead of per-task model shopping; strong models reserved for design/review, fast/cheap models reserved for docs and bulk work.

## 2026-10-14 — Stage 0 review + GATE C docs + Stage 2 code kickoff

| Phase | Agents / models used | Count | Notes |
|---|---|---|---|
| GATE C docs | game-designer (kimi-k3), architect (kimi-k3), ui-art-director (qwen3.8-max) | 3 | Option B propagated to V0.4 |
| Review | reviewer (qwen3.8-max) | 1 | RV-002: 2 BLOCKER / 5 HIGH / 10 MEDIUM / 6 LOW + a verified-pass list |
| Docs sync | docs-github (qwen3.8-flash) | 1 | ITER-0005 + submission correction |
| Core code | gameplay-engineer (deepseek-v4.1-flash) | 1 | GAME-001: 775 lines, 69 self-checks, respected the `@/core/level` seam |
| Level code | level-solver (deepseek-v4.1-flash) | 4 dispatches | **LV-001 empty, LV-002 empty**; LV-001R delivered; LV-002A/B pending |
| Playtest | playtest-analyst (qwen3.8-max) | 1 | PA-002 instrumenting the ADR-0008 gate |
| QA | qa-engineer (deepseek-v4.1-flash) | 1 | QA-001 in flight |

### Agent reliability finding — the failure variable is dispatch size, not model

`level-solver` ran on the **same** `deepseek-v4.1-flash` in all four dispatches. The two empty
(zero-file) returns were both **4–5-part mixed tasks**; the one full delivery (LV-001R) was a
**single-deliverable** task carrying a per-file `ls` evidence requirement — and that one also
produced the parity proof. Same role, same model, opposite outcome.

**Routing rule adopted:** one deliverable per dispatch, with an explicit "paste the real command
output" clause and an ownership list naming the files the agent must not create. Multi-part
dispatches to the same role are treated as likely to fail. This is a **process** change, not a
model change — no re-routing of `CODING_MODEL` is justified on this evidence.

**Corollary:** no agent report is accepted without a disk check (`find` / `ls` / `tsc`). Three
sessions now show prose and files diverging.

### Where the program overrode both agents

GAME-001 and LV-001R proved the checkerboard invariant independently; RV-002 proved it exhaustively
(880,640 configs, 0 counterexamples). But they then **contradicted each other** on what makes a level
dynamic — RV-002 argued switches are static, LV-001R measured 231/500 dynamic boards. Settled by
measuring what the player actually experiences (`refusedThenEnteredTiles`) against the **shipped**
`applyMove`: M0 walls 0/200, doors alone ~0 (a 9/200 residue still unexplained and assigned to
LV-002B), **switch+door 74/200**, **opposite-colour portal 80/200 with dual-phase tiles**,
same-colour portal 0/200. Cost: three throwaway harnesses outside the repo. Value: GATE D was decided
on that table rather than on which agent sounded more confident. Two of the three harnesses were
**wrong on their first run** (Manhattan distance used as solution length; a same-parity portal pair
"proving" portals do not work) — both errors were caught by re-deriving, not by an agent agreeing with me.

**Postscript, and the sharpest lesson of the round:** that table itself was wrong. LV-002B's exhaustive
door sweep plus my own re-run showed the `9/200` cell was **my harness's defect** — it hand-built
`{ doorsOpen: {} }` instead of calling `initialState(level)`, so the first click of every red-door board
was refused by a state the game cannot reach, which is precisely the "refused then entered" signature I
was claiming to measure. Re-measured on the program of record: doors alone **0/370**, latch **142/369**,
opposite-colour portals **200/203** (I had *understated* them, because invalid boards diluted the rate).
The GATE D decision survived, but the human chose D3 on a table containing a fabricated cell, and I sent
that table into three documents before catching it. **A harness that drives the real engine is not enough
if it fabricates the engine's initial state — `initialState()` is part of the truth source, same as
`applyMove`.** Metrics must run on states the game can actually reach.

## 2026-10-14 — Stage 2: RENDER-001 returned zero files (and the cause is **not fully established**)

| Task | Role / model | Outcome |
|---|---|---|
| RENDER-001 (playable L1–L5 slice) | gameplay-engineer (`deepseek-v4.1-flash`) | **Zero files on disk.** Cause unresolved: lost-or-never-written. |

The return contract quoted `wc -l` for `src/main.ts` (582 lines) and `src/tokens.ts` (467), an 11-row
`file:line` self-check table, and a `npm run build` of **1,518 kB**. What the tree actually holds:
`src/main.ts` **16 lines, birth-time 18:30 — i.e. never rewritten at all**, no `src/tokens.ts`, and
`src/game/` whose birth-time is 20:04, created later by the **re-dispatched** task. The current bundle
rebuilds to **840 bytes with zero `Phaser` occurrences**.

**The part I cannot explain, recorded rather than smoothed over:** my own verification run at ~20:01 —
executed *before* anything was committed — printed a real Vite result of
`dist/assets/index-CF7fELGJ.js 1,518.09 kB`. Content-hash file names are deterministic, and the
placeholder source hash-rebuilds today as a *different*, 840-byte artifact. So at that instant something
importable from the entry really was ~1.5 MB of Phaser, yet `src/main.ts` shows no write since 18:30.
Either the work existed in a state that was then reverted without touching `main.ts`'s timestamps (which
no git command of mine does — `git status` stayed clean for `src/`, and my only operations were
branch/merge), or that build output did not come from this tree. **I will not convert an unresolved
mechanism into a moral accusation against a model.**

What is *not* in dispute, and is all the rule needs:

1. **The deliverable was not on disk.** No amount of quoted output substitutes for `find src -type f`.
2. **My own numbers were not trustworthy either.** I ran the build and read its stdout, and the tree
   afterwards contradicted it. Verification must therefore be **the tree plus a re-run at commit time**,
   not a memory of an earlier command.
3. Rules tightened: **one file group per dispatch** (splitting by deliverable count was insufficient —
   RENDER-001 was one deliverable with 11 enumerated sub-requirements), the **acceptance command named in
   the dispatch** ("`find src/game -type f` must be non-empty"), and the report required to open with the
   raw evidence block instead of prose. **`STATUS: BLOCKED` / "not done" is cheap and accepted**; inventing
   artifacts of work that never happened is the only unforgivable answer — and if it happens again with the
   same role and model, that becomes a routing signal rather than a process one.
4. Same model, same role, opposite outcome across four tasks (GAME-001 delivered 775 lines; LV-001R,
   LV-002A, LV-002B all delivered in full, LV-002B even while correcting me). Variance is in task shape and
   in whether anyone checks — which is why the check is now mechanical and mine.
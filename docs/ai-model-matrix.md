# AI Model Matrix — Phase Shift: Echo Grid

> Owner: **Orchestrator (Agent 0)** — routing policy. **Maintained by the Docs + GitHub lane** (AGENTS.md §11:
> "matrix sync is the Docs lane's next pass"; project-status item 81 assigns that pass to the docs lane).
> Date: 2026-10-14 · Provider: `learnings_campus` (OpenAI-compatible endpoint) · **route ruling 2026-10-16 · sync passes 2026-10-17 (DOC-007, ledger items 106–122) and 2026-10-20 (DOCS-T8, ledger items 123–161 — no re-routing event; two new lane-death forms recorded)**.
> Method: actual API behaviour, never name-based assumptions.

---

## 1. Test method (low cost, ~10 tiny probes)

Each candidate model ran an **identical probe** as an isolated child session:

1. Text reasoning — one sentence on why binding a phase flip to every move adds planning depth.
2. TypeScript coding — return a compact `clamp(n,min,max):number` as a string.
3. Structured output — return one strict JSON object, no markdown fences.
4. Tool calling — call the **write** tool (create a file) and the **shell** tool (`node -e "console.log('tool-ok'+(1+1))"`), then report the stdout.
5. Vision — read a generated 64×64 PNG (four colour quadrants R/G/B/Y + white centre square) and report the colours.

Probes wrote only to the approved temp dir (`…/T/opencode/`), never to the repo.

## 2. Results

| Model | Text reasoning | TS coding | Strict JSON | Tool calling | Vision | Notes |
|---|---|---|---|---|---|---|
| **kimi-k3** | PASS | PASS | PASS | PASS (write+shell) | **FAIL** (text-only) | Clear, well-structured reasoning; strong design/architecture prose. |
| **glm-5.3** | PASS | PASS | PASS | PASS | **FAIL** (text-only) | Precise code; concise explanations. |
| **qwen3.8-max** | PASS | PASS | PASS | PASS | **PASS** — read `TL=red, TR=green, BL=blue, BR=yellow`, centre `white square` | Only vision-capable model. 1,000,000-token context. Best review candidate. |
| **qwen3.8-flash** | PASS | PASS | PASS | PASS | **FAIL** (text-only) | Fast, correct, cheap. Good for bulk generation. |
| **deepseek-v4.1-flash** | PASS | PASS | PASS | PASS | **FAIL** (text-only) | Fast, correct, idiomatic TS. Good default coding model. |

All five returned **schema-conformant JSON with no fences** and correct `clamp` implementations, and all five successfully wrote a file and returned shell stdout `tool-ok2`. **No timeouts occurred.**

> **Status of this table:** it is the **2026-10-14 capability record** and is kept as history — it is what the *capability classes* below were derived from. It is **not** the current harness route; see §3 (standing route ruling).

### Latency
All probes completed in a single turn. The harness exposes no per-request millisecond timing hook, so latency is recorded **qualitatively**: every model finished without a retry; no model was materially slow enough to affect routing. This is *not* a benchmark — re-test if a model starts failing real tasks.

### Vision (decisive)
The provider config declares `image` input **only** for `qwen3.8-max`; the probe independently confirmed that the other four models **reject image input**. `qwen3.8-max` described the image correctly, so it is the sole `VISION_MODEL`.

## 3. Standing route ruling (2026-10-16, user standing order — supersedes the harness default)

**The ruling (standing, quoted from AGENTS.md §11):** the default route for **every** role is
**`opencode/deepseek-v4.1-flash-free`**; tickets that genuinely need vision **override per dispatch with an explicitly named model** — *the free route is text-only*.

**Verified on disk, not assumed** (project-status item 81, 2026-10-16): `opencode.json`'s top-level `model` is the free route with `agents: {}` empty, **and all ten** `.opencode/agents/*.md` frontmatter blocks carry `mode:` + `model: opencode/deepseek-v4.1-flash-free` (`reviewer.md` additionally keeps its edit-deny permission block).
**Re-verified in this sync pass (2026-10-17):** 10/10 frontmatter `model:` lines and `opencode.json` still read the free route.

**Why the ruling exists — the ledger's own casualties:** request-**cost-ceiling deaths** on the premium routes (RV-008's full audit, UA-0014 ×3, QA-004's batch of five). The ruling is the cost fix, and it has a second-order effect the studio now plans around:

> **The free route rate-limits by CONCURRENCY — measured twice within the hour.** QA-005h was mid-flight and producing when **RV-009** and then **QA-005i** were dispatched beside it; **both died instantly on `Rate limit exceeded`**, and in both cases the **newcomer** died while the incumbent kept working. **Law: serialize absolutely — one subagent at a time** (not "≤ 2"). A ticket that dies this way is **re-dispatched onto its own session/worktree after the incumbent returns**, never batched with it.

**Two further lane-death forms were catalogued after this law (ledger items 123–161), and neither is a rate-limit event:**
- **Provider DNS death, mid-stream** — **R-006a** was killed by a provider DNS resolution failure (`ENOTFOUND`, host elided) *after* committing steps 1–4 of the registration train and with two READMEs mid-edit, so its state was **read from disk** and it was **resumed** on its own session (the R-005a precedent), never re-run from scratch and never re-dispatched beside a live lane.
- **Silent pre-work death** — **DOCS-T7** returned neither branch, worktree nor commit; the lane's *absence* was the disk-verified fact, and it was re-dispatched as **DOCS-T7b**. (Contrast the earlier RENDER-001 race, where a live writer was misread as a failure: verify absence, then re-dispatch.)

Both reinforce the same rule the §4 honesty box derives from: **a lane's completion is disk evidence, and a death is an ordering/recovery event — never a verdict on a route.**

**Open reconciliation item, recorded and not resolved by assumption:** the Orchestrator's lane ledger from the train-5 era onward repeatedly reads `LANES IN FLIGHT (cap 2)` (items 143…161), which sits beside this section's measured "one subagent at a time" law without an explicit reconciliation in the record. This pass records the tension rather than smoothing it; it is the Orchestrator's call, not the docs lane's.

**What this means for the table below:** a model **name** is a *capability class*; a **route** is a *per-dispatch property*. The working reality is **free route by default (saturated), with a documented per-dispatch premium override where the dispatch's task contract says so** — `learnings_campus/deepseek-v4.1-flash`, the route this DOC-007 pass itself carried.

| Role (capability class required) | Class measured 2026-10-14 (§2) | Route actually used since 2026-10-16 | Notes |
|---|---|---|---|
| **REASONING_MODEL** | `kimi-k3` | free route default; **premium override per dispatch** | Game Designer, Architect — text prose work |
| **CODING_MODEL** | `deepseek-v4.1-flash` | free route default; **premium override per dispatch** | Gameplay Engineer, Level Solver, QA — rules/solver/tests/game code |
| **FAST_MODEL** | `qwen3.8-flash` | free route | Docs + GitHub, bulk level candidates — the class remains assignment-eligible, but **no dispatch has been recorded on it since the ruling**; the free route carries this work |
| **REVIEW_MODEL** | `qwen3.8-max` | free route | Reviewer, Playtest Analyst — read-only review needs no pixels (bytes are read *through tools*, not eyes) |
| **VISION_MODEL** | `qwen3.8-max` | **must be a named per-dispatch override** | UI/UX/Art Director for art-byte reads and screen judging — **the free route rejects image input** |

Agent → model mapping lives in `.opencode/agents/*.md` frontmatter (currently the **free route for all ten agents**, per the ruling above).

## 4. Dispatch reality — what tickets actually ran on (ledger items 81–**161**)

**Route ledger since item 89 (the freeze-era handoff), re-read through item 161 at V0.10:** **no re-routing event was recorded.** The item-81 ruling stands unchanged; what changed afterwards is only (a) per-dispatch overrides and (b) their consequences — including the text-only honesty box below.

| Work class | Route reality | Evidence |
|---|---|---|
| Docs / design / architecture / level tooling / QA test work (all text) | **free route** pinned for all ten agents; a premium override appears only where the dispatch contract names one (e.g. DOC-007) | item 81 disk verification (10/10 frontmatter + `opencode.json`), re-verified in this pass |
| **Art-byte reads** (PNG eye-reads — the UA-0013/UA-0014 class) | **vision override mandatory**; the default route cannot see a file | item 81 names this class explicitly as the overriding case |
| **Screen-image judging** (screenshot verdicts) | **vision override mandatory**; a text-only route cannot read the image, so the **DOM text above the image is the machine evidence** | P11 production probe, ledger item **90(e)**: *"A text-only route cannot read the image, so the DOM text above is the machine evidence"* |
| Any lane whose dispatch names a model | that model, by contract | AGENTS.md §11 + the task contract's own `ROUTE` line |
| **DOCS-T8** (this pass — submission-material refresh, all text) | **premium override per dispatch**: `learnings_campus/deepseek-v4.1-flash`, named in the dispatch contract | this dispatch's own `ROUTE` line; same class as DOC-007 |

### Text-only honesty box — earned by UA-002 (item 108c), the round that mounted the portal pair

The seat's route had **no eyes** that run, so every claim was made with an instrument it could actually run: a **PIL measurement** (`portal_probe.py` reading the served PNGs, **26/26 gates**, committed). **No PNG was eye-read** — not by the agent, not by the reviewer. Three rules follow, and they bind every art ticket:

1. **No agent may claim an eye-read it did not perform.** An art verdict names its **instrument**: a pixel probe with its gates, or a named vision model. "It looks right" is not an instrument.
2. **Pixel measurement answers "does it match the spec", not "does it read well to a human".** Readability and feel stay a **live-lane + human-screen** gate (for GAME-003 the final eye-gate is explicitly the live lane and the user's screen).
3. **Roles that need vision when the ticket is a verdict on pixels:** **UI/Art Director** (first, always) · **Playtest Analyst** (only when the ticket is "judge this screen/capture") · **Reviewer** (only when the evidence is an image) · any lane whose dispatch names a vision model. Docs / Game Designer / Architect / Level / text-QA work **does not**.

**Open housekeeping item, recorded here and not fixed here (not this lane's file):** `.opencode/agents/ui-art-director.md`'s description still says *vision-capable* while its pinned route is the **text-only** free route. The fix is an Orchestrator edit to `.opencode/agents/**`; until then, **any art-byte ticket must carry an explicit model override in its dispatch**.

## 5. Cost policy

- Routine coding, tests, docs formatting, bulk candidate generation → **FAST/CODING** classes, which in the current harness means **the free route** (§3).
- Design, architecture, hard debugging, major review, playtest diagnosis → **REASONING/REVIEW** classes; escalate with a documented override when the ticket needs it.
- Never send one question to five strong models. Screen candidates with the fast model first, then escalate.
- **Default to the free route; make the override explicit.** A premium override is written into the dispatch contract **when it is used**, so cost stays attributable per ticket rather than by guessing later.
- **A rate-limit death is an ordering event, not a model verdict.** Serialize dispatches (§3) and re-dispatch the casualty on its own session after the incumbent returns.
- Rough usage is tracked in `docs/ai-usage-log.md` (no keys, no provider secrets).

## 6. Invariants

- **Solvability is always judged by the program Solver, never by any model** — including the vision model.
- A model **name** is configuration, not architecture; a **route** is per-dispatch configuration. Either may change without touching the codebase.
- **Any claim about image content names its instrument** (§4 honesty box). A pixel probe is a measurement of the file; it is never a report on how the frame reads to a player.
- `docs/ai-native-pipeline.md` §5 delegates routing to this file as the single source of truth; where that file's older role→model rows still print a class name, **this matrix is the current route**.
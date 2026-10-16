# Trusted-input browser frames — `dyn-merged/`

> Owner: **Docs + GitHub** (DG-004a). These frames were captured by the **Orchestrator**, not by me; this README records their provenance and internalizes a citation that used to point out-of-repo. Every claim below is checkable against `capture-log.json` committed in this directory or `docs/project-status.md` (items 38, 48–50).

## What this directory is

15 PNG frames + 1 machine-readable capture log, taken from the **merged develop tree** and used as the trusted-input pixel regression behind the `dyn-merged/` citations in `README.md` and `docs/submission/**`. Until DG-004a (2026-10-15) those citations resolved only inside the Orchestrator's local smoke directory — in a public repo a cited artefact must be verifiable, so the artefacts now live here. Nothing in the docs was reworded to make the citation true; the artefacts moved to meet it.

## Capture provenance (recorded as the Orchestrator reported it)

| Field | Fact |
|---|---|
| Capture date | **2026-10-15** |
| Tree / lineage | **merged develop** at the `5cabdd2` / `b96f3f8` lineage (DG-003 docs merge → QA-005 e2e + CI-gate merge) — the state whose battery the Orchestrator re-ran personally (tsc 0 · vitest 22 files / 408 passed / 3 skipped · build ✓ · `docs/project-status.md` items 49–50) |
| Tool | **Real-browser chromium CDP screenshots** (DevTools Protocol against a local production-equivalent build) — *not* Playwright screenshots |
| Input channel | **Trusted keyboard input** driven by the Orchestrator (arrows/WASD key events the game itself handles). This is the *trusted-input* channel, deliberately distinct from QA-005's permanent **Playwright e2e channel** (`tests/e2e/**`, CI-required): two independent ways of walking the same rules |
| Build served | A local build **equivalent to** the public GitHub Pages build (`https://pepsico24.github.io/AI-Native-GameCpt/`, live since release merge `3601935`, `docs/project-status.md` item 48). These frames are **frames of the local build**, not screenshots of the public URL — the claim is the same tree class, not the same process |
| Page errors | `capture-log.json` carries a single **terminal** entry `"pageErrors": []` for the session — zero page errors across the capture. It is not a per-frame field; the docs' shorthand "15 frames, `pageErrors: []`" refers to this session-level fact |

## What `capture-log.json` actually contains

A flat JSON array of two record types, in chronological order:

- **HUD-state records**: `{ "where": <human label>, "h": { "lvl", "moves", "phase", "won" } }` — the on-screen chip read at that moment (phase strings are the shipped Chinese: 白昼 / 夜晚).
- **Shot records**: `{ "shot": <filename without extension>, "bytes": <file size> }`.

The log names **12 desktop shots**; all 12 `bytes` values match the committed PNGs exactly (verified 2026-10-15 — see the integrity table). The **three `mobile_390_*` PNGs are in this directory but have no shot records in this log** — they were captured in the same Orchestrator session/directory; their review verdict is `docs/ui-ux.md` §3.3b Entry 2 (390 px mobile door vocabulary PASS). Recorded as-is rather than retro-logged.

## Per-frame meaning (what each frame is cited to prove)

### L8 — the Aha #1 (latch) arc, including the refusal freeze

| Frame | Log's `where` label | HUD read | What it proves |
|---|---|---|---|
| `l8_day_initial.png` | "L8 fresh" | lvl 08 · moves 0 · 白昼 · won=false | L8 opening state before the arc — the board that will refuse, the switch and the door as shipped |
| `l8_refusal_arc.png` | "L8 after 3rd R (refusal?)" | lvl 08 · moves **2** · 白昼 · won=false | **ADR-0008 clause 1 in delivered pixels**: the previous log line reads moves 2 ("L8 after 2R") and the third R did **not** advance moves nor flip phase — illegal move = no movement **and** no flip. The log's own label hedges ("refusal?") because it is the pre-frame read; the moves-frozen-at-2 pairing is what makes it the refusal evidence |
| `l8_press_beat_on_switch.png` | "L8 on s1 (press beat)" | lvl 08 · moves 3 · 夜晚 · won=false | The press beat: player standing **on switch s1** — the moment the latch changes state |
| `l8_on_open_door.png` | "L8 after U,R,D" | lvl 08 · moves 5 · 夜晚 · won=false | Player walking **through the latched-open door that earlier refused them** — the Aha #1 beat ("我踩过的东西，改变了我脚下的世界") rendered, not described |
| `l8_end_state.png` | "L8 after 2R" | lvl 08 · moves 6 · 白昼 · **won=true** | L8's **par-6 win** state reached via the door |
| `l8_maybe_victory.png` | "L8 try goal" | lvl 08 · moves 6 · 白昼 · won=true | The victory presentation at goal-touch; the capture name hedges ("maybe") because it was taken before the dialog settled — the HUD already reads `won=true` |

### L6 — the latch-unit debut arc (block open, par-4 dip win)

| Frame | Log's `where` label | HUD read | What it proves |
|---|---|---|---|
| `l6_day_initial.png` | "L6 fresh" | lvl 06 · moves 0 · 白昼 · won=false | L6 opening state — first level of the door+switch teaching unit |
| `l6_night_after_press.png` | "L6 after R" | lvl 06 · moves 1 · **夜晚** · won=false | Move **flips the phase** (白昼→夜晚) — flip-bound-to-move visible at the unit's first press |
| `l6_mid.png` | "L6 after RRR" | lvl 06 · moves 3 · 夜晚 · won=false | Mid-route occupancy — latched-door state carried while the player walks on |
| `l6_victory.png` | "L6 after RRRR" | lvl 06 · moves 4 · 白昼 · **won=true** | L6 **par-4 win** — the published `D_exec` valley (the dip level) completed in real pixels |

### L10 — block-end route evidence

| Frame | Log's `where` label | HUD read | What it proves |
|---|---|---|---|
| `l10_day_initial.png` | "L10 fresh" | lvl 10 · moves 0 · 白昼 · won=false | The hardest shipped board (par 9) opening correctly |
| `l10_mid.png` | "L10 after D,D,R" | lvl 10 · moves 3 · 夜晚 · won=false | Mid-route at the block end — legal moves counting and flipping in lockstep (3 moves, phase 夜晚) |

### Mobile trio — 390 px readability

| Frame | Dimensions | What it proves |
|---|---|---|
| `mobile_390_l8.png` | 780 × 1688 | L8 at the 390 CSS-px mobile class — board + HUD readable, §2.3 maxDim law holding |
| `mobile_390_l9.png` | 780 × 1688 | L9 at 390 px class — door vocabulary still legible |
| `mobile_390_l10.png` | 780 × 1688 | L10 at 390 px class — largest shipped decision density still readable |

(780 × 1688 device px is the 390 CSS-px viewport class at 2× scale, as `file` reports; the review verdict and the mobile door-vocabulary pass criteria live in `docs/ui-ux.md` §3.3b Entry 2.)

## Standing note — these were the last frames *before* the transient verdict

These frames capture settled states. The transient-frame physics (the refusal nudge arc and the press-beat frame window) got its **terminal verdict afterwards** in the permanent e2e channel: `tests/e2e/transient.spec.ts` measured the refusal arc as P1-measurable (109 ms window inside the 220 ms budget, peak 2488 px, actor centroid 2 px off ROI centre) and found the press-beat P2 **occluded by construction** (actor disc 0.70 cell strictly contains the 0.40 cell switch footprint) — no production change wanted or needed while occupied. Full ruling: `docs/project-status.md` item 50.

## Integrity table (verified 2026-10-15, `shasum -a 256` / `cat | wc -c`)

16 artefacts, 820,065 bytes total, byte-identical to the Orchestrator's originals (16/16 hashes matched source files before commit).

| File | Bytes | sha256 |
|---|---:|---|
| `capture-log.json` | 2,529 | `26d88b6639f883a4ba3e35f9ca8614203b1c95c7845179af54049dd026f0b655` |
| `l6_day_initial.png` | 46,436 | `4c11709dfcf169c218940f4ffe91b7c5828a364a44aee5a59d066cfac1231172` |
| `l6_mid.png` | 41,063 | `a22312eec982a98b2a114402826f2fe3b47f78b35669fa9fc2a5dbd14435af7f` |
| `l6_night_after_press.png` | 40,028 | `4ddfb48a6cbbb42bace5afbf1caa07a26a1e96634cb114cc5b7a047e6dee4e84` |
| `l6_victory.png` | 86,613 | `2bd34c150e0c1c0397f5da39346a46b76827feb4119dc22c391e63146c60a168` |
| `l8_day_initial.png` | 50,753 | `7b301976485273059bf040b43dddb3ae23b7aa910efc8c321c1874b74ade624e` |
| `l8_end_state.png` | 91,703 | `fc9918950b992900e85373f56a267a8783afa7a32fdfef47f2470afbc999c1e9` |
| `l8_maybe_victory.png` | 90,784 | `566a1c4398c56092113b7b0962865888f0259536f222a4b089b366a493e57377` |
| `l8_on_open_door.png` | 46,097 | `b784c90051d5541ed034fc7b3e614181d5df0fc59aa38e63557441f4611252c5` |
| `l8_press_beat_on_switch.png` | 46,032 | `82a3b894c63c8151f4d42a4168d920d5b293b6134f186a24f5621712b83c36c7` |
| `l8_refusal_arc.png` | 49,523 | `76c593cb1f5f52b7163f5504f221b0e89eab63dbea8dbb7cb6041b613feba651` |
| `l10_day_initial.png` | 49,515 | `7ba435aac04ede3a9c461d2e7c6fbcf61cbdf2c894018b1e431af9a55af0dc29` |
| `l10_mid.png` | 45,226 | `6bde0e794ebd9a07d15caf5bc70cfe46bcbe866b57ca44caa02dfc2c078551d9` |
| `mobile_390_l8.png` | 42,428 | `3039d3c6f5112ede716accccd936fe6356aa8d7353a9e0eeca524ff42df59de4` |
| `mobile_390_l9.png` | 49,556 | `5a042e31816ae3a6c435541b94326f3bb2a6b3a19a1df43644d99794749c9df6` |
| `mobile_390_l10.png` | 41,779 | `b5a31ead29f353aebfe836652cfcb3b1e2bb2cd7d69c0cb4ec2f71d41745b40b` |

## Limits of this evidence (stated before anyone has to)

- Trusted-input frames prove **the rules render** — phase flip, refusal freeze, latch arc, par wins, mobile layout — on the merged tree. They prove **nothing about players**: no cohort has run (`docs/playtest-log.md`), and no frame here is quoted as playtest evidence anywhere.
- Captured on a local build of the merged **develop** lineage; the public Pages build (`main` at `3601935`) is an earlier tree — the frames are *not* images of the live URL.
  *Scope note (DG-004d continuity): "`main` at `3601935`" was the serving state on the capture day; `main` is now `5b058ff` with fifteen levels. These frames remain a local build of the develop lineage and prove nothing about players — the zero-cohort line above still holds.*
- The frames postdate the transient-observability verdict context: where a state is occluded by construction (press-beat P2), no frame in this set can show it, and none claims to.

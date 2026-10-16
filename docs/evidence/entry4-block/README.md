# L12–L15 block browser frames — `entry4-block/`

> Owner: **UI / UX / Art Director** (task UA-0011, 2026-10-16). These frames were captured by this office on the
> worktree `agent/ui-art/ua-0011-capture` and judged by the same office (vision authority) in
> `docs/ui-ux.md` §3.3b **Entry 4 — VERDICT RECORD (five of five clauses PASS)**. This README records their
> provenance so every claim in that verdict is checkable inside the repo (AGENTS.md §7). Nothing was reworded
> to make a citation true.

## What this directory is

**33 PNGs + 4 machine-readable capture logs + the run-only harness that produced them = the complete Entry-4
evidence set** behind the L12–L15 block's first pixels: the capture-entry round pre-registered by
`docs/decisions/design-0003-l1215-block-law.md` **§8 item 6** ("the door × portal painter seam … the sealed
line must read as a wall column and the portal ends must read as a pair", legibility within the Entry-3
JUDGED facts). Per level: a board-readable initial frame, the mid-route **seam** frame where a door and a
portal coexist, the **crossing** frame where the walk passes the sealed channel by teleport, the **latch**
and **post-latch** frames (the G2 witnessable beat: switch pressed, door crossed, latch dot after departure),
the par win frame, and a 390 px mobile set. L15 additionally carries the `?placeholders=1` dev-channel probe.

The four boards (`src/levels/l012..l015.json`, pars 4/6/8/10) ship playable since R-003b (`3cd643e`); the
routes walked here are the **solver's** par routes, enumerated through the standing e2e helper — never
hand-typed (see "Route provenance" below).

## Capture provenance

| Field | Fact |
|---|---|
| Capture date | **2026-10-16** (10:30–10:35 local) |
| Tree | **`3cd643e`** (full `3cd643ead96fc01de59e1a22cc0254c1eae8f259`), branch `agent/ui-art/ua-0011-capture`; every capture log's terminal record carries this SHA |
| Server | `node_modules/.bin/vite --port 5223 --strictPort` run from the worktree — byte-identical to the `webServer` command `playwright.config.ts` builds for `PS_E2E_PORT=5223` (this lane's port; QA-006 owns 5222). Started before capture, **killed after**; `curl` readiness 200 on `/?level=12` |
| Input channel | **Playwright trusted keyboard input** (`page.keyboard.press`, one press per ≥90 ms — the same channel class as `docs/evidence/entry3-portal/` and `docs/evidence/dyn-merged/`; never dispatched synthetic events) |
| Driver | `harness/capture-entry4.cjs` — a parameterised descendant of the Orchestrator's Entry-3 driver (`capture-entry3-desktop.cjs` / `-mobile.cjs` pattern): settled statics (450 ms + 2 rAF), `preserveDrawingBuffer` init-script for the in-page pixel probes, per-shot HUD reads, session-terminal `pageErrors` record |
| Route provenance | `harness/plan-entry4.ts` → `harness/plan-entry4.json`: routes, teleport/latch/door legs and every probe target come from `tests/e2e/helpers/levels.ts` (`loadReferenceLevels`: `validateLevel` + `solve` + `forEachParRoute` + `applyMove`), run with `npx tsx --tsconfig tsconfig.json`. The driver consumes the plan JSON only — **no move is hand-typed in the driver, and `tests/**` was never edited** (QA-006 was live in that tree) |
| Viewports | desktop **1000 × 620 CSS, DPR 2** (canvas 2000 × 984 device); mobile **390 × 844 CSS, cssScale 2** (canvas 780 × 1432 device) — the Entry-3 capture classes |
| Browser | **Chromium 156.0.8078.4** (Playwright 1.64.1), logged in every capture log's terminal record |
| Page errors | **`pageErrors: []` in all four logs** (session-terminal field covering both viewports + the dev probe — same scope note as `docs/evidence/entry3-portal/README.md`) |
| Machine discipline | Preflight at tooling time: `pgrep -f "playwright test"` showed TWO foreign sessions — the whitelisted QA-006 full-suite run (`PS_E2E_PORT=5222`, isolated `--output`) and one short session from a **different repo lineage** (`/Users/Admin/VibeCoding/GameCpt2/.worktrees/ui`, own spec list, own ports). Preflight immediately before capture: **zero** foreign playwright processes; port 5223 free (`lsof` empty). Captures are short settled-static runs on an isolated port + isolated output dir (`…/T/opencode/ua0011-out`); no timing-critical assertion depends on frame-grid contention. Both preflight states are recorded here rather than smoothed |

## PLACEHOLDER art state — read this before quoting any frame

Every frame carries **DEV PLACEHOLDER art** (R-P7): the `DEV PLACEHOLDER ART — NOT FINAL` badge is visible in
the top bar of all 33 frames, and the `?placeholders=1` strip (`l015_dev_channel.png`) lists exactly
`A-03 echo_spirit_a / A-03 echo_spirit_b / A-04 bg_phase_a_1920x1080 / A-05 bg_phase_b_1920x1080 /
A-06 goal / A-07 ui_kit` with **no portal entry** (`portalMentioned: false` in the log — the K-4 negative
re-verified at the block tail). Revision art for the requested slots is **in the human lane, delivery
pending** (`docs/assets/asset-manifest.md` still REQUESTED; `ART_INTEGRATED = false`). **The Entry-4 verdicts
therefore judge LAYOUT and READABILITY of the program-drawn mechanics** (walls/ghosts/doors/switches/portals
are vector-by-design token art; actor/goal/backgrounds are the placeholder constructions above) **and the
current placeholder sprites — not the pending final art.** No art was requested by this round (ASSET GATE
untouched); §3.3 re-runs after any A-0x integration, as always.

## Per-frame meaning (HUD reads from the logs' own headers; clause pointers from the Entry-4 verdict)

### L12 — the consolidation beat (7 × 3, par 4, route D,R,R,R; `portalFree` true — no sealed channel by design)

| Frame | HUD | One-line meaning |
|---|---|---|
| `l012_initial` | moves 0 · 白昼 | A static: **active** teal pair `(0,2)`+`(3,2)` with swirl, closed blue door `(5,2)`, switch `(4,2)` sun glyph, two scattered A-walls — the re-pricing portal, no channel |
| `l012_m1_crossing` | moves 1 · 夜晚 | Teleport settled: disc on the far end `(3,2)`, entry end `(0,2)` **muted, 0 actor-residual px** — folded-space read; door base-open at B |
| `l012_m2_seam` | moves 2 · 白昼 | **The seam**: active pair + player on the pressed switch + **latched-open** blue door (frame + 4 stubs + medallion) in one row — door × portal as two grammars, two tiles apart |
| `l012_m3_postlatch` | moves 3 · 夜晚 | R-D7 embedded door at `(5,2)` (closed under the player after the flip) + latch state carried; muted pair identical at both ends |
| `l012_win` | moves 4 · 白昼 · won | Par-4 win; per-level dialog `L 12 cleared` + Next |
| `mobile_390_l012_initial` / `…_m1_crossing` | A / B | The same two reads at the measured **51 CSS px** pitch |

### L13 — the first mandatory-portal board (6 × 4, par 6, route U,L,L,U,U,U; sealed channel x = 4)

| Frame | HUD | One-line meaning |
|---|---|---|
| `l013_initial` | moves 0 · 白昼 | A static: active pair `(0,1)`+`(5,3)`, **sealed column x=4** = 2 dark filled A-walls `(4,1)/(4,3)` + 2 tinted ghosts `(4,0)/(4,2)` carrying the **crescent phase-notch** ("solid at night"), closed blue door `(5,1)` |
| `l013_m2_seam` | moves 2 · 白昼 | Player at `(1,1)` beside the live near end; door + switch + channel + pair in one frame — the pre-teleport seam |
| `l013_m3_crossing` | moves 3 · 夜晚 | **The walk proves the channel opens**: disc on the far end `(5,3)` past the column; column at B = 2 filled violet + 2 sun-notched ghosts; entry end muted, 0 actor-residual px |
| `l013_m4_latch` | moves 4 · 白昼 | Player on the pressed switch; door **latched open at A** (stubs + medallion over empty passage) — G2's "switch buys speed" beat |
| `l013_m5_postlatch` | moves 5 · 夜晚 | R-D7 embedded door at `(5,1)`; **latch dot ON after departure** at `(5,2)`; muted pair identical |
| `l013_win` | moves 6 · 白昼 · won | Par-6 win; dialog `L 13 cleared` + Next |
| `mobile_390_l013_initial` / `…_m3_crossing` | A / B | Same reads at the measured **59.5 CSS px** pitch (6-longest board — first board measured between the 51 and 65 judged classes) |

### L14 — same skeleton family, one row taller (7 × 4, par 8, route U,U,L,L,L,D,D,D; sealed channel x = 5)

| Frame | HUD | One-line meaning |
|---|---|---|
| `l014_initial` | moves 0 · 白昼 | A static: active pair `(0,1)`+`(6,0)` straddling the column, sealed x=5 (2 filled + 2 crescent-notched ghosts), closed blue door `(6,2)` |
| `l014_m4_seam` | moves 4 · 白昼 | Player at `(1,1)` beside the live near end; far end top-right past the column; closed door + switch + channel — the seam |
| `l014_m5_crossing` | moves 5 · 夜晚 | Disc on the far end `(6,0)` past the column (B: 2 filled + 2 sun-notched ghosts); entry muted, 0 actor-residual px |
| `l014_m6_latch` | moves 6 · 白昼 | Player on the pressed switch; latched-open door below at `(6,2)` |
| `l014_m7_postlatch` | moves 7 · 夜晚 | R-D7 embedded door at `(6,2)`; latch dot after departure |
| `l014_win` | moves 8 · 白昼 · won | Par-8 win; dialog `L 14 cleared` + Next |
| `mobile_390_l014_initial` / `…_m5_crossing` | A / B | Same reads at **51 CSS px** |

### L15 — block end; the only B-phase channel (7 × 5, par 10, route U×4,L,L,D×4; sealed channel x = 3, three-wall)

| Frame | HUD | One-line meaning |
|---|---|---|
| `l015_initial` | moves 0 · 白昼 | A static: **muted** pair `(0,0)`+`(5,0)` on row 0 with the three-wall seal between them (3 filled + 2 crescent-notched ghosts) — the pairing across the barrier IS the "channel has a door" read; closed blue door `(5,3)`, sun switch `(5,1)` |
| `l015_m5_seam` | moves 5 · 夜晚 | **The B-phase seam**: player at `(1,0)` beside the now-**active** pair (full teal + swirl on navy), inverted column (2 filled + 3 sun-notched ghosts), base-open door — the block's only B-channel frame |
| `l015_m6_crossing` | moves 6 · 白昼 | Disc on the far end `(5,0)` past the column; **same-phase residual 0/8281 px** (A-vs-A like-for-like, the Entry-3 metric class); entry end muted and clean |
| `l015_m7_latch` | moves 7 · 夜晚 | Player on the pressed switch (sun, activePhase A); door closed-at-B under the latch inversion |
| `l015_m8_postlatch` | moves 8 · 白昼 | Latched-open door at `(5,3)` below the departed player; latch dot ON at `(5,1)` |
| `l015_win` | moves 10 · 白昼 · won | Par-10 win on the registry top: end panel **`L1–L15 cleared · L 15: moves 10`** — the N-2 frozen shape, self-updated to the 15-level ladder, signed in the Entry-4 verdict |
| `l015_dev_channel` | moves 0 · 白昼 | `?placeholders=1` probe: badge visible, strip = A-03×2/A-04/A-05/A-06/A-07, **no portal entry** (K-4 negative at the block tail) |
| `mobile_390_l015_initial` / `…_m5_seam` / `…_m6_crossing` | A / B / A | The largest board ever shipped at the smallest pitch ever judged (**51 CSS px on 7 × 5**): muted + active pair, swirl discrete, notchless ghosts (sub-56 px rule) still hollow-tinted |

## Measurement methods (stated so anyone can recompute)

- **Pitch / geometry (the frame record governs, item-60 discipline):** in-page plate-edge derivation (Entry-3
  `capture-log-mobile-pitch.json` pass-2 class): scan the presented canvas for the plate extent against the
  page-bg corner colour; `cellSize = floor(span / longestSide)`. Cross-checked against the production
  `computeLayout` at the *observed* canvas dims by `harness/crosscheck-pitch.ts`: **8/8 MATCH** (desktop
  920/131 = 65.5 CSS for 7-longest, 920/153 = 76.5 for 6-longest; mobile 716/102 = 51 CSS, 716/119 = 59.5).
- **Tile ink coverage:** per tile, the modal colour of the inset interior (15 % inset) is that tile's ground;
  `inkPct` = share of pixels ≥ 24 max-channel distance from it, `deepInkPct` ≥ 48. On filled wall tiles the
  modal colour *is* the wall token (ink 0 % = full coverage); on ghosts it is `wallEchoFill` (`#BFB4A0` A /
  `#585786` B — the §4.6 published tints) with ~5 % outline ink; on open doors it is the checker ground with
  ~26 % frame+stub ink vs ~43–45 % closed. These are state signatures, quoted per shot in the logs.
- **Pair identity (`pairDiff`):** ground-normalised deep-ink masks of the two portal ends compared
  position-wise (Entry-3 "deep-ink end mismatches" class). **0 mismatches on every flagged frame**
  (8281 px desktop 7-longest inset, 11449 px L13 desktop, 5184/6889 px mobile).
- **Entry residual:** two metrics, honestly separated in the logs. Where the crossing frame sits in the
  *other* phase (L12–L14), a mask delta would confound the portal's legitimate active↔muted change, so the
  valid metric is `actorResidual`: the actor colour sampled from the landed tile's centre, counted inside the
  entry tile — **0 px on every crossing, desktop and mobile** (sanity: 3900–8833 px on the landed tile).
  Where the crossing frame is in the *same* phase (L15, A-vs-A), the like-for-like mask delta is valid and
  reads **0/8281 desktop, 0/5184 mobile** — the Entry-3 0-px residual class reproduced.
- **Walk honesty:** every shot record carries `legMatch` (HUD `moves`/`phase`/`lvl` vs the solver leg) —
  **true on all 33 shots**; wins at exactly par 4/6/8/10.

## Limits of this evidence (stated before anyone has to point at them)

- Settled statics only: no in-page rAF transit extraction this round — the crossing *arc* class (one
  continuous folded-space hop, R-Z7, ≤ 220 ms) was proven at the portal debut in Entry-3
  (`docs/evidence/entry3-portal/`, E3-3) and its timing authority remains `tests/e2e/transient.spec.ts`;
  Entry-4's crossing clauses judge the settled before/after states, which is what §8 item 6 named.
- These frames prove **the block renders and reads**; they prove **nothing about players** — no cohort has
  run, and nothing here is or substitutes for playtest data (`docs/playtest-log.md` freeze `df353a0` untouched).
- Local build of the worktree, not the public URL (`main` still ships the earlier release); the L12–L15
  boards are live in these frames only.
- The 59.5 CSS px mobile class (L13, 6-longest) is measured here for the first time — between the two
  previously judged classes (51 and 65); nothing regressed against either, recorded so the next round does
  not re-derive it.
- Ghost phase-notches are absent below the §3.1a 56 px threshold, so the 51 px mobile ghosts carry tint +
  stroke only — by design, not a defect; the column still reads as a wall column at that class (judged).

## Integrity table (verified at commit, `shasum -a 256`)

37 evidence artefacts, **1,793,282 bytes** total (33 PNG + 4 logs). The four `harness/` files are the
verbatim run tooling (plan generator, plan JSON, driver, pitch cross-check) committed for reproducibility;
they carry absolute worktree paths as a lineage fact of this run.

| File | Bytes | sha256 |
|---|---:|---|
| `capture-log-l012.json` | 11,354 | `a3618ae45e2c3767acf3598699a807cceab8ca06f161880bebc5f87e0f44f3dd` |
| `capture-log-l013.json` | 18,547 | `e788b15247362ae81dd005a1fd2a2a02c34168901b17a6ff41fd3572e8b9f24a` |
| `capture-log-l014.json` | 18,498 | `3fc27c27106cbb1b9928af6c0bb2d20c14e33a62ed0cfe8e0726f2bf64926089` |
| `capture-log-l015.json` | 22,640 | `ee483e40c133ffdec808fb2ba57d7c97a2255fe5164e74ccb7fdf34fa91d9453` |
| `l012_initial.png` | 48,007 | `d9425d2c61ce57e176c8d25fd98f2189cc511f5729c88935049079bce056118b` |
| `l012_m1_crossing.png` | 41,478 | `cbca6afbdcdc41ad4839a5fce9a2c563d7bd1945cf76e40369fbac373654b028` |
| `l012_m2_seam.png` | 46,173 | `90e504de9f54fe4b3a0c58ca1de04bd11b786ed99fc08563c1d3a91218c794cf` |
| `l012_m3_postlatch.png` | 42,223 | `75c8d789095ddb608640f22df8b3b89d035acdd64f5a1b127ee8267349bae9af` |
| `l012_win.png` | 87,724 | `7a68f519667fa5b907d06c4ad3751f861516587a5811627d8b6c9f215622ef42` |
| `l013_initial.png` | 54,176 | `c869dcea3276e65a2181777d570412546d62bc30bae13cfb49be7d523965031c` |
| `l013_m2_seam.png` | 53,007 | `987230ddde786a065a9bbb13c2c4484219d3d97aafb39eca27441342cbaef460` |
| `l013_m3_crossing.png` | 47,878 | `c83c6806c81e3354ecdf77cdd4ae5eb76d9bc98899388a0a38de3a593ad6a7cb` |
| `l013_m4_latch.png` | 51,840 | `68f35e4460224e07a8b60eef4ff1689a2aa9ec5e67142c970a3d560df9db7453` |
| `l013_m5_postlatch.png` | 47,614 | `5f66bce5d90a84e04f003b14276af847268b17ee4d40bbb089d781bfb120d56a` |
| `l013_win.png` | 93,527 | `dd653379b4d607da1d18865bf049c958f2db794d7df8defb8534e0b0b6c64640` |
| `l014_initial.png` | 51,092 | `deee987b9275b2dbb9c559cbd49a6c6bbc79f6ab41db624040d9a67f40268cf5` |
| `l014_m4_seam.png` | 49,943 | `be4b704c0796fa74af253c4d24ae9a2d9d3458c40e65979de6a0a8184f9978b5` |
| `l014_m5_crossing.png` | 45,116 | `d54f1c26f557b2d25b4bda945b33cd329e2c7a7e44b3c579b23e08d477debc91` |
| `l014_m6_latch.png` | 49,828 | `8892674de11da59cd79648de323966f5fe154267e1ca02abf02537e198f1c1d7` |
| `l014_m7_postlatch.png` | 45,008 | `2fefdf504ddffe15d59701422118c81c7a9fdee0f827b8c1d3fd614be2aa8e1d` |
| `l014_win.png` | 90,650 | `85dbb0f06a374e1915a9a6c7e0821da29d09f5e0f1cf8eb642fb078f950b28fa` |
| `l015_dev_channel.png` | 68,214 | `57abb609620e2db11a9369de2ab32aad082c777eb11092056e4e5a3955af3817` |
| `l015_initial.png` | 52,607 | `944ef70b6b969291edffb4fa70cf657d22f61258d526cb1ae583759637ae49a9` |
| `l015_m5_seam.png` | 50,979 | `829896789300e93ea95d2584e1cc6cf13e132df2b31ef5d080a1d0f023ef6e45` |
| `l015_m6_crossing.png` | 50,800 | `7f3577cd6a12c2f16721746c004962c69b4e8c95b534fc0c4210d4aed1812476` |
| `l015_m7_latch.png` | 49,765 | `fb60db14660fdd4b2e3c71329f282e55eda40162f1658851612570adb7fa5d2e` |
| `l015_m8_postlatch.png` | 51,477 | `51fee05d7663f859c5bff70c05fb0a65a5cf61b04026349ccdb34922b99f5495` |
| `l015_win.png` | 92,457 | `451ef38d9fb900835ee4dec497da447b8d47429ba2682aa179c8ac1ca2946f7c` |
| `mobile_390_l012_initial.png` | 39,220 | `fea480f02bd075f94c4657eb3c6fab91d19c7f0899f378d4c771f1e6992ff62b` |
| `mobile_390_l012_m1_crossing.png` | 34,424 | `99d0d5725c1c2ec3db2c30e3e50b873fe67ce9ff31233564c02fb020785920fe` |
| `mobile_390_l013_initial.png` | 45,364 | `24c303c9a1ba6c40599082a1a38a2b868e5b565ca3ff6377d9f73325b1da5f01` |
| `mobile_390_l013_m3_crossing.png` | 40,359 | `fda194ebfb4235dc0c5cac28e11f53622d8a1a7d897a2858d06909651bcf21bf` |
| `mobile_390_l014_initial.png` | 41,296 | `06163557be5d45470b812be57ac5833275e3b0ea6c98b07ee233838526f291ed` |
| `mobile_390_l014_m5_crossing.png` | 36,329 | `8febba7cd5b43fc5be36487e50430a24b9e916df41813562a8ce5359be6427ef` |
| `mobile_390_l015_initial.png` | 42,161 | `c3efff48d1e8f05c1f847c6217f9510e8cba31aec76340c8f3eca2a81d8f5e9d` |
| `mobile_390_l015_m5_seam.png` | 40,287 | `253a6a213efa1b2f116ba8a8c247b9f5954caa67db410090c5b56b20ace0cae8` |
| `mobile_390_l015_m6_crossing.png` | 41,220 | `30e99a760cb0e6e8619fb42324599e1c0c38bfcffc1c17aa908269330a01f588` |

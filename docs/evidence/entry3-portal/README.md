# Portal-debut browser frames — `entry3-portal/`

> Owner: **Docs + GitHub** (DG-004b import). These frames were captured by the **Orchestrator** and judged by the **UI / Art Director** (task UA-0010) — this README records their provenance and makes in-repo the pointer that `docs/ui-ux.md` §3.3b Entry 3 named as its planned destination. Every claim below is checkable against the three capture logs committed in this directory, or against the docs cited by path. Nothing was reworded to make a citation true; the artefacts moved to meet it (AGENTS.md §7).

## What this directory is

**21 PNGs + 3 machine-readable capture logs = the complete Entry-3 evidence set** behind the portal's first pixels in this game: the L11 board (M2 debut, opposite-colour pair) on desktop and at the 390 px mobile class — phase A/B statics, the par trace move by move, an **11-frame in-page rAF transit extraction around the crossing press**, the embedded-door state, the win panel showing the N-2 frozen end-panel instance character-for-character, two `?placeholders=1` dev-channel negative probes, and the mobile-pitch measurement record with its full method history. UA-0010 judged **six of six clauses (E3-1…E3-6) PASS** on exactly these files; the verdict record is `docs/ui-ux.md` §3.3b (Entry 3 — VERDICT RECORD).

Before this import the artefacts lived only in the Orchestrator's temporary smoke directory (one lineage mention, deliberately kept here: `orch-smoke-2026-10-15/entry3/`). In a public repo a cited artefact must be verifiable inside it — so they live here now, byte-identical (integrity table below).

## Capture provenance (recorded as the Orchestrator reported it)

| Field | Fact |
|---|---|
| Capture date | **2026-10-15** |
| Tree | **`88ea653`** (full `88ea653444b6c51506d9f01d3eeaef1fe1aca31b` — the develop merge of LV-007E + R5-VAL). Both session logs carry this full SHA in their terminal records |
| Input channel | **Playwright trusted keyboard input** — real key events the game itself handles, per the standing measurement caveat in `docs/project-status.md` ("any future input evidence must come from CDP/Playwright events, never from dispatched synthetic events") |
| Transit channel | **In-page `preserveDrawingBuffer` rAF PNG extraction** around the crossing press. The desktop log's "R2 transit extraction" header records the pass (`"in-page rAF PNGs, press at t=0 offset ~637ms"`) and logs `"frames": 19` for the extraction pass; the committed transit set is the **11 named shots** with `tMs` 29.4 → 372.4 — the same 11 the verdict cites for E3-3 |
| Viewports | Desktop **1000 × 620 CSS, DPR 2**; mobile **390 × 844 CSS, cssScale 2** — both stated in the respective log's terminal record |
| Page errors | Both session logs end with `"pageErrors": []` — a **session-terminal** field, not a per-frame one (same scope note as `docs/evidence/dyn-merged/README.md`) |
| Board under review | `src/levels/l011.json` — 7 × 3; player `(0,1)`; goal `(6,0)`; blue door d1 `(5,0)`; switch s1 `(1,1)` `activePhase` A targeting d1; portal pair p1 `(2,1) ↔ (4,0)` `activePhase` B; **par 4** (LV-008 acceptance `aaab35d`; metrics in `docs/level-difficulty.md` §5.2 / sidecar `docs/level-difficulty.report.json` — cited, not restated here) |

## Verdict authority — and one SHA honesty note

`docs/ui-ux.md` §3.3b **Entry 3 — VERDICT RECORD · UA-0010 · status JUDGED — overall PASS (six of six clauses)** (spec commit `35b3df3`, merge `bc332a0`). Every verdict row names the frame(s) it rests on; the pixel facts (pair-identity 0 deep-ink mismatches, 0-px entry residual at both viewports, single-disc constant-bbox arc settled t = 202.7 ms ≤ 220 ms with 0 ms added lock, greyscale door-vs-portal mass 57.8 % vs ~13.5 %, N-2 instance signed) are reproducible against this directory. **Recorded as found, not smoothed:** `docs/project-status.md` item 67 names this merge `618c76f`, but no object of that hash resolves in this repository — the resolvable merge is `bc332a0`, and this README plus `docs/iteration-log.md` ITER-0015 cite only repo-resolvable SHAs (AGENTS §7: GitHub ⇒ commit SHA). The UA lane may keep the temp-directory path in the verdict record's history line as written — this import is what makes **both** paths resolve.

## What the three logs actually contain

- **`capture-log-desktop.json`** — shot records with HUD headers (`lvl` / `moves` / `phase` / `won`, phase strings the shipped Chinese 白昼 / 夜晚), the 11 transit shots with `tMs`, and three non-shot records: the transit-extraction header, a **win-panel `innerText` sample** whose body contains `L1–L11 cleared · L 11: moves 4` verbatim (the UA-0009 N-2 frozen character contract, rendered live), and the two dev-channel probe records with `stripText` / `badgeVisible` / `portalMentioned` fields. Terminal `pageErrors: []`.
- **`capture-log-mobile.json`** — the **pass-1 pitch record, kept exactly as it failed**: a fixed threshold missed the soft checker deltas → 0 samples → `cssPitchDevice2: 0` and an `"OUT-OF-BAND — FLAG"` band, with the record's own `SUPERSEDED` field naming the defect and pointing at the governing record. The honesty rails stay **in the committed artefact** — not erased, not re-summarised; the UA-0010 verdict rules on the final measured number and cites this history as method transparency only. Plus the three mobile shot records and terminal `pageErrors: []`.
- **`capture-log-mobile-pitch.json`** — the governing pitch record, one entry, `method_history` in order: pass-1 defect → the misread correction (the 96-device-px spacing is the **plate width**, not the pitch) → pass-2 plate-edge derivation (grid x-extent 33..747 device px → 714 = 7 × 102 exactly) → `computeLayout` formula cross-check (7 × 3 board at 780 × 1432 renderScale 2 → `cellSize = 102`). `measured`: **102 device / 51 CSS px**, both phases checked. `band`: 51 CSS is **inside the ruled 51–56 px band at its floor**, equal to the `docs/ui-ux.md` §2.3 margin-inclusive row (51.1); the 390/7 ≈ 55.7 convention overstates because the margin applies. **E3-2 was judged at this measured number, per the item-60 pitch-governance ruling.**

## Per-frame meaning (HUD reads from the logs' own headers; clause pointers from the verdict record)

### Desktop — the par trace R,R,R,R, move by move (`?level=11`)

| Frame | Log header | One-line meaning |
|---|---|---|
| `l11_day_initial.png` | moves 0 · 白昼 | Phase-A static: both pair ends `(2,1)` and `(4,0)` show the **muted diamond outline, no swirl** — a dormant mechanism on a passable tile (E3-1 A-side, E3-5) |
| `l11_night_on_switch.png` | moves 1 · 夜晚 | R1 steps onto switch s1 `(1,1)` at A and the world is B: the pair at **full portal with swirl**, and the first door+portal cool-on-cool board ever rendered (E3-1 B-side, E3-4, E3-5) |
| `l11_R2_transit_01…03.png` | t 29.4 / 67.7 / 102.2 ms | The disc arcing from `(1,1)` toward the exit, ≈49 device px **above** the entry-diamond centre (near, not through); 02–03 pass over the live diamond (E3-3 arc, E3-5 trigger-at-entry note) |
| `l11_R2_transit_04…05.png` | t 136.3 / 169.3 ms | Disc descending/landed **inside the global B→A flip cross-fade** — the frames' mid-blend histograms are the §6.2 flip row, not an added effect; the diamonds themselves cross-fade teal→muted in place (E3-1 in-place-flip note, E3-3 landing window) |
| `l11_R2_transit_06…11.png` | t 202.7 → 372.4 ms | Pinned at the exit `(4,0)` — settled from frame 06 onward, no re-trigger while standing (ADR-0008 clause 6 unviolated in every frame); settled-by-t is inside the 220 ms budget with 0 ms added lock (E3-3) |
| `l11_R2_crossing_settled.png` | moves 2 · 白昼 | Post-portal settled frame: the disc on the exit end, and **zero residual at the entry tile** — ground-normalised diff vs day-1 `(2,1)` measured 0/11025 px by the verdict (E3-3 residual, E3-5) |
| `l11_R3_embedded_door.png` | moves 3 · 夜晚 | R3 enters `(5,0)` through the **latched-open** blue door at A; the flip closes it under the player — the legal R-D7 embedded-door state on the same tile both latch readers name. The missing phase ring here was pre-named in the checklist as expected-not-failure (one-shot living inside the flip budget) |
| `l11_R4_win_panel.png` | moves 4 · 白昼 · won | R4 reaches the goal `(6,0)`: win panel open, body reading exactly **`L1–L11 cleared · L 11: moves 4`** — the N-2 frozen instance, signed on-board by the verdict; the `innerText` sample sits in the log beside this shot |
| `l11_dev_channel.png` | moves 0 · 白昼 | `?placeholders=1` probe at L11: R-P7 badge visible (`badgeVisible: true`) **and** the placeholder strip text carries A-03…A-07 with **no portal entry** — the R-P5 negative for a vector-by-design portal (K-4), badge and strip in one frame |
| `l5_no_portal_strip.png` | L05 · moves 0 · 白昼 | Second R-P5 negative probe at a pre-portal level (`portalMentioned: false`, identical strip text); its filled-square wall ink also serves as the verdict's not-a-wall contrast for the hollow-diamond read (E3-1) |

### Mobile — 390 × 844 CSS, cssScale 2 (the measured **51 CSS px** class)

| Frame | Log header | One-line meaning |
|---|---|---|
| `mobile_390_l11_day_initial.png` | moves 0 · 白昼 | Mobile A static at the smallest pitch this game has ever had captured: muted outline, checker ground visible through it (E3-2, E3-6) |
| `mobile_390_l11_night.png` | moves 1 · 夜晚 | Mobile B static: 2 CSS px outline crisp at 4–5 device px stroke runs, swirl as two discrete arcs (no AA blob), door + portal co-present (E3-2, E3-4, E3-6) |
| `mobile_390_l11_crossing_settled.png` | moves 2 · 白昼 | Mobile post-crossing settled: exit hold, entry residual 0 px (verdict measures 0/7921 at this class), switch dot still latched after departure — the latch survives the teleport read (E3-3, E3-6) |

## Double use — one session, two lanes

Per the Orchestrator's item-60 ruling, a single capture session serves both lanes: **the mobile trio also satisfies the playtest runbook §2 item-4 cohort-V statics** (noted once in the verdict record). The playtest instrument itself stays untouched (freeze `df353a0`) — these are pixels, not sessions; **no human cohort has run** and nothing here is, or substitutes for, playtest data.

## Integrity table (verified 2026-10-15 at import, `shasum -a 256`)

**24 artefacts, 1,191,944 bytes total.** All 24 hashes verified identical to the source files before commit (24/24); all 21 shot-record `bytes` values inside the two session logs equal the committed PNG sizes exactly (21/21, re-checked against this directory).

| File | Bytes | sha256 |
|---|---:|---|
| `capture-log-desktop.json` | 2,953 | `a5021e3dce098a446d209dfb8b84d7073e2ba83a3ce0d5a35851f873ff8b957d` |
| `capture-log-mobile-pitch.json` | 1,193 | `de2e9a1d750ca9f689e22a4f0271b5414d9f0ad7d9dc3172506550f5dd9055ed` |
| `capture-log-mobile.json` | 1,129 | `9a75be3c53a9b05012f0d93102540bd0007e7446963a6e06524eda7045e0c26d` |
| `l11_R2_crossing_settled.png` | 42,103 | `b0c10a2a0a6416add2dc7e894f531ddeda172e39d4a01f86048c5f43282133ff` |
| `l11_R2_transit_01.png` | 62,114 | `da09aed905de6dfdacaa409464298764c0025869ae73107be2504fe94609d0ba` |
| `l11_R2_transit_02.png` | 61,994 | `839496637b9df66f161c7b9de826c9ade07c52b5b88cc8602b3f8ea80af71d2b` |
| `l11_R2_transit_03.png` | 66,184 | `3fd09c4703b5ee4a214cad10db5d27a599a3e42136b334263683fb2e4309857f` |
| `l11_R2_transit_04.png` | 66,674 | `5744f29c3414e721c6cdcb5b452eb7b0470c994d5101cbf1479bf8ee128f2b0d` |
| `l11_R2_transit_05.png` | 63,965 | `539eefc6d0c57fb61deb4721779883a22391be8e3c5a9a331d672a8447586206` |
| `l11_R2_transit_06.png` | 64,286 | `ebf41ede6d5ae400f6581bcff199931e368925b909bab34be1b1aa12c0b8bcf8` |
| `l11_R2_transit_07.png` | 63,162 | `6657b3f0ba0a28ce4d5fe2aafde51cc456c32ddd72bb6494a8a224e2fd2c9807` |
| `l11_R2_transit_08.png` | 62,156 | `00a1c10c4be3a05444654cf83b7165407709ee90e40d78c0faf2216098d79346` |
| `l11_R2_transit_09.png` | 62,302 | `4b2371ed0a46aced598e524e1e655404fa0f5ea578fa63ddebeae3917ea5b02b` |
| `l11_R2_transit_10.png` | 62,276 | `6a37d054ae7d5fc39dad85729abc047112a55545d5cc0aa324a550731cfe4644` |
| `l11_R2_transit_11.png` | 62,408 | `433651ad0c88614a6088e1465f1c6c072794918899fb89bb6b2e01d24e029c3e` |
| `l11_R3_embedded_door.png` | 40,896 | `b9568fc1ac01f6a5acc1eff778aa7075ac1593e0644fc35edfe3c9904ca4d761` |
| `l11_R4_win_panel.png` | 90,890 | `600eaab6afa26ecb79567971de6a5e8c5af1d5532040f6bae37c6686b7b58865` |
| `l11_day_initial.png` | 43,884 | `30106c614f230f5aabb55345e395253975bc92ba22a05ba79a3e545686477134` |
| `l11_dev_channel.png` | 59,942 | `ed4a441cfc3cd768f6a6d767705f524d3cb235fbb1fbe0c91de1258881f99f7f` |
| `l11_night_on_switch.png` | 39,995 | `1bcfaedd581a509892dd97b12a11595241a34f184cbc814a2b992a1cdd105c2b` |
| `l5_no_portal_strip.png` | 64,430 | `b648f11f8e1e088c3aae1db2e302e587845e38fe155a0f9280a30655ba714b50` |
| `mobile_390_l11_crossing_settled.png` | 36,330 | `930d2a06fa5e2c2c46db5e4fe55bbd3ae1366bf7b4b71cdde7e6d584e5c0d9f3` |
| `mobile_390_l11_day_initial.png` | 37,214 | `e1ade8cefeb6d9937949949aecdb015b530cc906665ff8e02ce75ca694ab5eaa` |
| `mobile_390_l11_night.png` | 33,464 | `a5a54532670d2d5e456cd7191224dd76724c6eed9fbcbd9e204b15509046faa5` |

## Limits of this evidence (stated before anyone has to point at them)

- The frames + the Entry-3 verdict prove the **portal's spec renders** at debut — legibility at both viewports, the folded-space read, class-vs-class separation, panel text — on develop tree `88ea653`. They prove **nothing about players**: Stage-2 hypothesis **(c′)** ("portals read as space folding, not disorientation") stays human-gated and **zero cohort sessions have run**. A six/six spec PASS is an instrument reading, not a fun verdict.
- Captured on a **local build of develop** — these are **not** images of the public URL: `main` is still release `3601935` (the 10-level Pages build). The L11 board visible in these frames is not in the live build until the milestone `main` merge publishes it.
- The transit set is a ≈34 ms rAF sample grid, not a high-speed camera: the verdict's timing claims are stated against those samples (the hop's visual landing falls between the 136.3 ms and 169.3 ms shots) and the timing authority for the §6.2 row remains `tests/e2e/transient.spec.ts` (QA-005).
- The pass-1 pitch defect in `capture-log-mobile.json` is a **real channel failure** committed as history: it is why the item-60 ruling makes the frame record's final measured number the governing one, and why the method history matters. Kept visible; not laundered.

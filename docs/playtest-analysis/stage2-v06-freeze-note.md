# Stage 2 — V0.6 FREEZE NOTE (re-freeze event RF-1 provenance)

> Owner: **Playtest Analyst** · PA-006 · 2026-10-15
> Method precedent: the Orchestrator's `stage2-freeze-note` over the frozen pixel-evidence frames
> (`docs/project-status.md` item 46①: sha256 over every frame + an append-only rule, thresholds frozen
> before the first tester). This note applies the same discipline to the **instrument files** instead of
> frames. Status of the round this freeze governs: **PRE-REGISTERED · NOT RUN · n = 0** — no participant,
> no recording, no result exists; nothing below is data.

## 1. What is frozen, and as of which commit

**V0.6 of the Stage-2 playtest instrument is FROZEN as of this commit** (branch
`agent/playtest/pa-006-stage2-refreeze`, base `b96f3f8`; the commit sha of this file's first commit is
the freeze id — recorded in the return contract and in `docs/iteration-log.md` at merge). Frozen scope:

| Instrument file | Role in the freeze |
|---|---|
| `docs/playtest-log.md` (V0.6) | Normative instrument: §1–§10 frozen V0.5 record (unedited, T6 respected) + **§11 = the V0.6 re-freeze on the shipped ladder L1–L10** |
| `docs/playtest-analysis/stage2-v06-cohort-runbook.md` (V0.1) | The user's operating manual for cohort v2 (recruiting, setup, session script, Table B2/C2 addenda, thresholds at a glance, privacy) |
| `docs/playtest-analysis/stage2-adr0008-gated-protocol-notes.md` | Frozen coding manual (C1–C9, R1–R6, G1–G5, M14/M15 windows, inter-rater rule) — hashed as-is; V0.6 changes nothing in it |
| `docs/playtest-analysis/stage2-field-sheet.md` | Frozen field sheet — hashed as-is; its PAGE 4 build facts (`41d5a4b`, L1–L5) are **superseded for cohort v2 by the round BUT row** (runbook §2.3), rows R1–R12 apply unchanged per level to L10 |
| `docs/playtest-analysis/stage2-raw-data-sheets.md` | Frozen canonical Tables A–F — hashed as-is; Table B2 (L7–L10 continuation) lives in the runbook and adds no field that Table B lacks |
| `docs/playtest-analysis/stage2-v06-manifest.sha256` | The sha256 manifest over the five files above (this note is **excluded from its own manifest** — a file cannot contain its own hash; its integrity is the commit itself) |

Manifest sha256 (computed at freeze): **`4c47d7b46adf9cf1286e4e1d7a9337716e5bf3d142c5b2e89f7bc9732f930c41`**
Verify with, from the worktree/repo root:

```bash
shasum -a 256 -c docs/playtest-analysis/stage2-v06-manifest.sha256   # expect 5 × "OK"
shasum -a 256 docs/playtest-analysis/stage2-v06-manifest.sha256      # expect the manifest hash above
```

## 2. Why a *re*-freeze (RF-1) and not an edit

The V0.5 freeze (§9.1 BUT = `41d5a4b`) predates the L6–L10 unlock (`c6af636`) and the public Pages
release (`3601935`): run as frozen, it would test a five-level prototype that no longer exists, and its
(a′) `NOT TESTABLE` pre-fill is now false as a build property (the release condition — L6–L10 shipped +
Solver-proved, 10/10 PASS — is **met**). Because **n = 0** (no session ever ran), superseding it voids no
datum and moves no threshold against any observation. Full grounds: `playtest-log.md` §11.0. §9's text is
untouched; V0.6 layers §11 over it and cites it verbatim wherever a row carries over.

## 3. The freeze contract (binding)

1. **Any edit to any file in §1's table before cohort-v2 session 1 = a new re-freeze event** (RF-2, …):
   version bump + dated grounds in §11.0's style + a **fresh manifest** + a fresh note. Silent edits are
   protocol violations.
2. **After session 1, the instrument is frozen absolutely** (T6 semantics carried): no threshold, probe
   string, level index, coding rule or administration pin may change mid-round; corrections go to Table F
   and apply to the next round only.
3. The round's **BUT row is appended** at round start (runbook §2) — filling in a build id is not an edit.
4. **Pre-registration provenance:** every threshold in §11/runbook §6 was written before any human touched
   the round build — the L11 acceptance-law discipline (`level-design.md` §6: frozen before any candidate
   existed) applied to the playtest instrument. Provisional analyst-set numbers (PD-3's +20 s, PD-4's
   margins, D-5's 60 s) are labelled as such at their point of use and may be re-calibrated **only** via a
   future re-freeze with data, never post hoc inside a round.
5. **Standing disclosure:** "Zero cohort sessions have been run to date: n = 0" (`playtest-log.md` §11.9)
   remains TRUE — and must be re-verified, never assumed, at every citation — until session 1's Table A
   exists. The cohort itself is the user's recruitment lane (`project-status.md` item 47 G4 USER-BLOCKED);
   this freeze delivers the agent-executable half of G4: frozen instrument + runbook + honest disclosure.
6. **(c′) is deferred, not dropped:** cohort v2's Table F carries the fixed string
   `NOT TESTABLE ON THIS BUILD — DEFERRED TO COHORT v3` with the §11.7 re-activation condition (accepted
   `l011.json` + R-003 unlock + Entry-3 frames). A deferral without grounds and a re-activation condition
   would be a silent drop — §9.10.4 forbids it.

## 4. Hash ledger (per file, at freeze)

```
a1a1e5963d954a33dfb65f990db08831cc5b65ec7d2dabc6e25e9cf19dfe6e31  docs/playtest-log.md
c8bdf0bd2310c233830fe5dcc2d037692c1ddfbfe75bcc539392a5e841772b42  docs/playtest-analysis/stage2-adr0008-gated-protocol-notes.md
ed75b29e4d5230dd3f5dbdda65feb5251daea08fcabeb404dac1a77bc503b49f  docs/playtest-analysis/stage2-field-sheet.md
e021539a2cd25055911af2636f44479ec860045a297aa51727849dffebe14bfc  docs/playtest-analysis/stage2-raw-data-sheets.md
8a1a6f32716d7df1044ce64578f4787b656830d84e6bb8adbe739a572ec1b9af  docs/playtest-analysis/stage2-v06-cohort-runbook.md
```

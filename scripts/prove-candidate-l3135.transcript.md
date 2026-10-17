# LV-015 — the proving side of Act II batch 3 (`l031`…`l035`, shelf candidates)

Companion to `scripts/author-l3135.transcript.md`. Every number here is read from the **landed
bytes** (`src/levels/candidates/l031.json`…`l035.json`) through `@/core/solver/*` + `@/core/rules`
by `scripts/prove-candidate.ts`; nothing is quoted from the authoring script, and nothing in this
file can write a level. The authoring dossier's table is re-measured here, not trusted.

**Order of artifacts (law before bytes, finding before fix).** `3f460b6` selection rule + device →
`6f3b25b` census + §7.3.1 relief label → `b35cdc8` the five bytes → **this file (§0, commit D): the
three findings, published BEFORE any tool change** → commit E: the minimal corrigenda → commit F:
the re-run. Each step is checkable in `git log -p`; none can be back-dated.

---

## §0 · THE FINDINGS (published before the fix — commit D)

The first proving run of the batch did **not** pass, and it failed for three reasons that are all
about the **instrument**, none about a level:

```
  rung 31 · GATES: ACCEPT · controls 12/13 · RESULT: FAIL
  rung 32 · GATES: ACCEPT · controls 13/13 · RESULT: PASS
  rung 33 · GATES: ACCEPT · controls 13/13 · RESULT: PASS
  rung 34 · GATES: REJECT — act2-par-band · RESULT: FAIL
  rung 35 · GATES: REJECT — act2-par-band · RESULT: FAIL
LADDER RESULT: FAIL (3/5 rung(s) ACCEPT, every control caught on every rung)
```

Raw log: `/private/var/folders/8q/vcsvjc5x679d629rzrj8d57w0000gp/T/lv015-prove-ladder.log`
(command: `npx tsx scripts/prove-candidate.ts --family=g --ladder=31,32,33,34,35 --dir=src/levels/candidates`).

### F-L31-1 · `act2-par-band` read the band's own ceiling as out-of-band — the false refusal

```
  FAIL act2-par-band    par=24 strictly inside Act II's band (16, 24) (§7.2; …)
```

`scripts/prove-candidate.ts:239` tests `stamped > ACT2_PAR_BAND[0] && stamped < ACT2_PAR_BAND[1]` —
**strict at both ends** — while the constant it imports is inclusive and the law says the ceiling is
admissible. The disagreement is not a matter of taste; it is four citations against one:

| # | Implementation / law | Form | par 16 | par 24 |
|---|---|---|---|---|
| 1 | `src/core/solver/policy.ts:1293` `ACT_II_PAR_BAND = [16, 24]` | constant | — | — |
| 2 | `src/core/solver/policy.ts:1704–1705` `inParBand` | **inclusive** `>=` `<=` | in | in |
| 3 | `scripts/author-l21.ts:1211, :1532, :1863, :2550` (this batch's own census + selection filter) | **inclusive** `>=` `<=` | in | in |
| 4 | `docs/level-design.md:545` — Act I's band is written **`4–20`** in the *same* table and its ceiling **`par 20` is a registered level (L20)** | prose | — | — |
| 5 | `docs/level-design.md:805–810` §7.8 item 2 — *"At least one batch-3 rung at **`par 24`**, Act II's own band ceiling"* | prose | — | **mandated** |
| 6 | `docs/level-design.md:811–812` §7.8 item 3 — *"`par 24` is **in-band** but unmeasured"* | prose | — | **in-band** |
| — | `scripts/prove-candidate.ts:239` | **strict** `>` `<` | out | **out** |

The arithmetic settles it, because the act's derived `D_exec` ceiling is *defined by* par 24 being
admissible. The receipt (this file's own instrument reading the live constant):

```
ACT_II_PAR_BAND = [16, 24]  · ACT_II_EXEC_BAND = [19.75, 29.06]
derived lower  = 16 + 3·1.2500 = 19.75
derived ceiling = 24 + 3·1.6875 = 29.0625      ← published (2 dp) as ACT_II_EXEC_BAND[1] = 29.06
ceiling if par 24 were inadmissible = 23 + 3·1.6875 = 28.0625   ← NOT the published band
par · prove-candidate act2-par-band (strict) · policy.inParBand / author-l21 (inclusive)
  15  ·  FAIL  ·  FAIL
  16  ·  FAIL  ·  PASS
  17  ·  PASS  ·  PASS
  23  ·  PASS  ·  PASS
  24  ·  FAIL  ·  PASS
  25  ·  FAIL  ·  FAIL
```

So under the strict form the Act II `D_exec` band's published top (`29.06`) would be **unreachable**,
§7.8 item 2's window `[27.7500, 29.0625]` could not be entered at its top, and §7.8's own mandate
would be unbuildable — the law contradicts itself. It does not: **the strict form is the outlier.**
Its label already says "strictly inside" and its sibling one line below (`act2-exec-band`, `:246`)
uses `>=`/`<=` on the same pair of constants — the same gate block is inclusive for the derived band
and strict for the par band it is derived from.

**Why nobody saw it.** `git log -S` dates the strict comparison to **`849b6d4` (LV-012,
2026-10-17T14:36:02+08:00)**, ~7.5 hours **before** GD-010 (`ef643f7`,
2026-10-17T22:06:13+08:00) published §7.8's par-24 obligation; `849b6d4` is an ancestor of the
develop tip, so the gate has been live ever since. Every Act II rung judged through it so far sits
**strictly inside** the band — `ACT_II_B1_LADDER` pars `17 / 18 / 20 / 21 / 23` and the shelf
`l026`–`l030` at the same pars — so the endpoint comparison had **never been exercised** when the
law that depends on it was written. Batch 3 is the first rung set to stand on the ceiling (§7.8 item
2 is exactly what asked it to).

**Blast radius, measured not argued (§1):** the two endpoint pars are `16` and `24`; **no
registered** Act II rung is either, so no registered verdict can move. Reproduced in §1 by running
the pre-fix and post-fix prover over the registered ladder `L21–L25` and the shelf `l026–l030`.

**The proposed minimal diff (unmade at commit D):** the comparison becomes the law's own inclusive
form, and the label stops claiming "strictly inside" — no constant, threshold, band, endpoint or
gate list moves (`[16, 24]` is untouched; only the comparison operator and its prose change).

**Revert path / escalation.** If Game Designer or Architect rules the band **open** at its ends,
this fix is reverted by one line, in which case batch 3's `L34`/`L35` stay REJECTED and Act II can
close only through §7.8 item 3's published fallback — `par 23` at `27.746988` (+0.142337), the
**§7.3.3 C path with its own ADR** — which is the Game Designer's decision, not this lane's. That is
the whole reason this finding is published rather than absorbed.

### F-L31-2 · the ladder summary asserted a control result it had not computed

```
LADDER RESULT: FAIL (3/5 rung(s) ACCEPT, every control caught on every rung)
```

The rung-level line is honest (`controls: 12/13 caught by their named gate`), but the ladder-level
phrase **"every control caught on every rung" is a string literal** (`scripts/prove-candidate.ts:1301`):
it prints even when a control MISSED on every rung. AGENTS.md §7 forbids a claim without evidence —
a summary that asserts an unmeasured fact is exactly the "looks fine" failure mode, one layer down
(inside the very tool that exists to prevent it). **Proposed minimal diff (unmade at commit D):**
print the *measured* control tally (`controls named on every rung: N/M`) instead of the literal.

### F-L31-3 · the `g3` control is shape-dependent, not level-dependent (MISSED on L31 only)

```
L31:  MISSED  g3 control — the goal's seal door "d5" dropped (the chain loses a press) →
      par-stamped+act2-par-band+act2-exec-band+validator+g2-room-exit-door+g6-room-structure
      [expected a refusal naming one of: …; gate g3-ordered-chain named: false]
L32–L35:  CAUGHT  … +g3-ordered-chain  [gate g3-ordered-chain named: true]
```

**The measurement, first:** the mutated board is **REFUSED on 5/5 rungs**, and names
`par-stamped` + `validator` + `g2-room-exit-door` + `g6-room-structure` on 5/5. The mutation keeps
its teeth. What is shape-dependent is the *specific* name the control asks for:

- the device has one switch per door, so dropping the goal's seal door `d5` **orphans its switch** —
  the mutated board is structurally invalid (`validator` fires) — and it also unseals the goal's
  room (`g6`, `g2` fire);
- on `l031` the four remaining presses `s1>s2>s3>s4` are still **forced and strictly ordered**, so
  `g3-ordered-chain`'s clauses (one shared order, `≥ 3` distinct presses, staged-world forcing) are
  **legitimately satisfied** — the gate *should* pass. The control's premise ("the chain loses a
  press ⇒ the chain gate fires") is true only where the remaining order collapses; on the 5-press
  sealed chain the order is implied by the room-seal topology (`g2`/`g6`), so a single-object
  mutation **cannot** break the order without first destroying reachability. On the other four rungs
  the same mutation happens to collapse the order as well, and `g3` fires.
- `g3` is nevertheless **named on 5/5 rungs** — on `l031` by three other controls (`g1`, `g4`, `g5`
  all list `g3-ordered-chain`), measured in this same log — so §7.5 item 4's per-gate coverage is not
  reduced by anything done here.

**House rule this is handled by, verbatim:** F-L16-3 established that a control whose expectation
disagrees with the measurement is **corrected to the measured names** ("`expect` is now a clause
*list*; a mutation that is ACCEPTED still fails the battery"), and **F-L20-4** did exactly this in
the previous batch — *"the inherited 'both switches retargeted' control **MISSED** … so per F-L16-3
it was **renamed to its measured meaning** and its `expect` corrected to the measured names"*
(`docs/ai-native-pipeline.md` §8.14). **Proposed minimal diff (unmade at commit D):** the control is
renamed to its measured meaning (`g3/g6 control — the goal's seal door dropped: the chain loses its
last press *and the goal's room is no longer sealed*`) and its `mustFire` moves from
`g3-ordered-chain` to **`g6-room-structure`**, which is measured on **5/5** rungs of this device.
The mutation still has to be refused **and still has to name a specific gate** — the change does not
relax the battery, it points it at a name the device can actually produce on every shape.

**Revert path / escalation.** If the ruling prefers a `g3`-dedicated control for every shape, the
device needs a shape where a *valid* single-object mutation collapses the order (a redundant switch,
i.e. a device whose chain is not fully forced) — a **design** question, handed over, not decided
here. Nothing about `l031` is repaired by this: the level's own `g3-ordered-chain` gate is measured
`ok` on the landed bytes (§2).

---

## §1 · Zero blast radius of the corrigenda (pre-fix vs post-fix, registered + shelf)

The corrigenda of commit *E* touch a prover that had already judged three registered things —
Act II batch 1 (`L21`–`L25`, root), Act II batch 2 (`l026`–`l030`, shelf) and every earlier block.
So they were A/B'd, not argued: the **pre-fix prover was extracted from `HEAD` before the edit**
(`git show HEAD:scripts/prove-candidate.ts > scripts/.prove-prefix.tmp.ts`, removed again after the
receipt — it is not in the tree and was never committed) and both versions ran the **same** ladders
with the full gate + 13-control battery per rung.

```
A (pre-fix)  root  L21–L25 : 5/5 ACCEPT · 13/13 controls each · 65 CAUGHT / 0 MISSED · LADDER RESULT: PASS
B (post-fix) root  L21–L25 : 5/5 ACCEPT · 13/13 controls each · 65 CAUGHT / 0 MISSED · LADDER RESULT: PASS
A (pre-fix)  shelf L26–L30 : 5/5 ACCEPT · 13/13 controls each · 65 CAUGHT / 0 MISSED · LADDER RESULT: PASS
B (post-fix) shelf L26–L30 : 5/5 ACCEPT · 13/13 controls each · 65 CAUGHT / 0 MISSED · LADDER RESULT: PASS
```

**Status-surface diff (`GATES:` / `RESULT:` / `controls:` counts / per-rung gate `ok|FAIL` + gate id /
per-control `CAUGHT|MISSED`), pre-fix vs post-fix — one line, and only one, on each set:**

```
< LADDER RESULT: PASS (5/5 rung(s) ACCEPT, every control caught on every rung)      ← the F-L31-2 literal
> LADDER RESULT: PASS (5/5 rung(s) ACCEPT, controls named: 65/65 across the 5 rung(s))   ← computed
```

Nothing else moved, on either set. The honest residue, named rather than smoothed: where a
**mutated** board's own solver-stamped `par` lands exactly on a band endpoint (`16` or `24`), the
name `act2-par-band` leaves that mutation's refusal list — the gate is no longer a false refuser
there — while the mutation stays **CAUGHT** by its other named gates. **No control changed
`CAUGHT`/`MISSED` status on either ladder** (65/0 both sides, measured). The registered verdicts —
which is what R-003c's "a registered block must not raise the filter it judges by" protects — are
byte-identical.

## §2 · The corrigenda as landed (commit *E*, and the second half found by this receipt)

1. **F-L31-1** — `act2-par-band`'s comparison becomes the law's inclusive form, its label stops
   claiming "strictly inside" and names what it implements (§7.2 `par 16–24`, §7.8 item 2's
   "Act II's own band ceiling", and the arithmetic `29.06 = 24 + 3·1.6875`). No constant, endpoint,
   threshold or gate list moved.
2. **F-L31-2** — the ladder summary's literal is replaced by a measured tally. Its own
   `--measure-controls` receipt immediately caught the *second* half of the same finding: in the
   EXPECTATION pass nothing is asserted, so a `caught` counter reads `0` and the new line printed
   `controls named: 0/65 … "MISSES … are not hidden"` — a fresh uncomputed claim, in the fix for an
   uncomputed claim. Corrected the same way: the measure pass now prints
   `controls MEASURED, not asserted (F-L16-3 expectation pass): 65 across the 5 rung(s)`.
3. **F-L31-3** — the goal-seal-drop control is renamed to its measured meaning and `mustFire` moves
   `g3-ordered-chain` → `g6-room-structure` (measured 5/5 on this device), per F-L16-3 / F-L20-4.

Post-fix `npx tsc --noEmit`: **clean**.

## §3 · The batch, proved from the landed bytes (post-fix)

Command: `npx tsx scripts/prove-candidate.ts --family=g --ladder=31,32,33,34,35 --dir=src/levels/candidates`

```
L31 · par 19 · 23.204167 · 1.4014 · 42/42 · Δpar —    · rise —            · delta -1.525245
L32 · par 22 · 26.050000 · 1.3500 · 42/42 · Δpar ≥2(3) · rise OK 2.845833 · delta  1.320588
L33 · par 22 · 26.069191 · 1.3564 · 42/42 · Δpar <2(0) · rise OK 0.019191 · delta  1.339779
L34 · par 24 · 28.126943 · 1.3756 · 42/42 · Δpar ≥2(2) · rise OK 2.057752 · delta  3.397531
L35 · par 24 · 28.339426 · 1.4465 · 42/42 · Δpar <2(0) · rise OK 0.212483 · delta  3.610014
batch peak: L35 at 28.339426 · Act I measured peak 24.729412 · §7.3 act-peak DISCHARGED · headroom to the ceiling 29.06: 0.720574
GATES: ACCEPT ×5 · controls 13/13 ×5 · RESULT: PASS ×5 · LADDER RESULT: PASS (5/5 rung(s) ACCEPT, controls named: 65/65)
```

Per-rung surface, every rung: **20 gates, 20 `ok`, 0 `FAIL`** — `par-stamped` (file par = solver par)
· `region` `deadStates=0 T=0 R=0` · `escalation` above the CUT `14.969697` · `act2-par-band` ·
`act2-exec-band` · `act2-b-band` · `act-peak` · `latch-grade` **all-OFF world
UNSATISFIABLE** (`allOffShortest=null`) · `latch-route` press-then-cross on every par route
(30/6/30/12/160) · `refused-beat` · `coverage` **42/42** · `validator` `ok=true errors=0
policyViolations=0` · `well-formed` 5 doors / 5 switches · **g0** 1 opposite-parity portal pair ·
**g1** landing room portal-only (on-foot tiles 0, pre-press exits 0) · **g2** 5 walk-sealed rooms
derived from the bytes, 0 leaks / 0 phase-wall boundaries (F-L19-2) · **g6** landing room carries the
switch for *its own* door, the goal's room switch-free · **g3** one shared press order on every route,
5 distinct presses, staged-world forcing FALSE on all four drops · **g4** all-OFF unreachable ·
**g5** census identity broken (`22 < par 24`, etc.).

`g5` is worth reading beside the authoring side: the census identity's *value* is below `par` on all
five rungs, which is the §6.2.3 item 4 break, measured — not asserted.

## §4 · Falsifications (the checks were asked to fail, and did)

- **Peak probe, padded:** `--peak=28.5` (a peak no board carries) → **exactly one gate fails**:
  `FAIL act-peak  D_exec=28.339426 vs Act I's measured peak 28.500000 (delta -0.160574)` — and it
  fails on **`L35` only**, the rung the ladder's measured maximum sits on
  (`4/5 rung(s) ACCEPT`, `LADDER RESULT: FAIL`, exit 1). The `act-close`/`act-peak` clause is
  therefore falsifiable at the right rung, and is *not* satisfied by the clause's own neighbours.
- **Control battery, 13/13 by NAME:** `--measure-controls` → 65 mutations measured (13 × 5), **35
  lines carry `gate … named: true`** (7 g-controls × 5 rungs), **0 mutations ACCEPTED**. Every
  mutation of every rung is refused by a gate that can be named.
- **The act-close reading is a measurement, not a promise:** the batch's maximum is `28.339426` on the
  landed bytes vs the registered `27.604651` → **Δ `+0.734775` STRICTLY ABOVE**, carried by the
  batch's last rung (the tail also rises: `+0.212483`), inside the §7.8 item 2 window
  `[27.7500, 29.0625]` with `+0.589426` of margin over its floor. `par 24` rows: `1.3756` and `1.4465`
  `B` — inside the measured band.
- **Anti-mirror:** `0` rungs share a par with the registered batch-1 ladder; the par multiset is
  `[19, 22, 22, 24, 24]` with `par 16` **absent and never substituted** (printed with its reason).

## §5 · The rest of the acceptance battery

| check | result |
|---|---|
| `npx tsc --noEmit` | **clean** (exit 0) |
| `npx tsx scripts/solve-levels.ts --audit src/levels/candidates` | **`10/10 level file(s) PASS · par verified from the solver on 10/10 · refusals are reported, never repaired`** (l026–l035) |
| `npm run levels` (root) | **`25/25 level files ok · 0 errors · 88 warnings · 11/11 negative cases`** — **UNCHANGED**, RESULT: PASS |
| sidecar `docs/level-difficulty.report.json` | **25 records**, untouched (`git diff` empty vs the branch's base `ef643f7`) |
| root level files (`src/levels/l*.json`) | **`git diff` empty vs `ef643f7`** — no root byte moved; `EXPECTED_LEVEL_COUNT` / registry / PINS untouched |
| clone guard (§6.1.4, seal-inclusive key) | **26 distinct keys** held by the existing 25 root + 5 shelf files (the census prints one witness file per key); the ladder's 5 rungs are distinct from all of them and from each other — **0 collisions**, `0 refused by the clone guard` of the 498 accepts |
| `npx vitest run` | **1 failed / 36 passed files · 1 failed / 859 passed / 3 skipped tests** |

**The one red, named and owned by another lane.** `tests/solver/l16-l20-candidates.test.ts:174:19` —
`AssertionError: expected [ 'l026.json', 'l027.json', …(10) ] to deeply equal []` — the shelf-booking
literal on **this branch** is still `[]` (`:161`). It is **QA-025's re-book**, already merged on
`develop` as `9be894d` *after* this branch was cut from `ef643f7`; batch 3 adds five more shelf files,
so merging this batch needs that booking extended to `l026`–`l035`. `tests/**` is QA's file (AGENTS §4)
— **reported, not edited** — and no other test in the suite is red.

## §6 · What stays open, deliberately

1. **F-L31-1 is escalated, not decided.** If Game Designer or Architect rules §7.2's band **open** at
   its ends, revert the one-line comparison and batch 3's `L34`/`L35` are REJECTED: the act then
   closes only through §7.8 item 3's published `par 23` reach `27.746988` (+0.142337) — the §7.3.3
   **C path with its own ADR**. That is the Game Designer's call; the batch's bytes do not change
   either way, and nothing is registered.
2. **F-L31-3 is a design question.** A `g3`-dedicated control that fires on *every* shape needs a
   device with a redundant switch (a chain that is not fully forced); on the fully-forced 5-press
   sealed chain the order is implied by the seal topology. Handed over with the measurement, not
   patched into a looser battery.
3. **`--pocketsize ≥ 11` stays deferred** (`≤ 10` closed by measurement; `≥ 11` unmeasured) — no
   ceiling wording in either direction, exactly as dispatched.
4. **`par 16`** produced no accept in this family's prefix and was never substituted; the batch
   supports `[19, 22, 24]` and repeats `22` and `24` as the published consequence.
5. **The five files are UNREGISTERED shelf candidates.** Registry, `EXPECTED_LEVEL_COUNT`, PINS,
   sidecar and the star thresholds are untouched; §7.8 item 6 hands the batch to QA for the §7.6
   stratum assignment before registry, and the act-close claim above is a *shelf* measurement.
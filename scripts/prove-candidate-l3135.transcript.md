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
# ADR-architecture-0006 — the XOR multi-switch door: representation on the shipped predicate, no second derivation, the `G2-X` reader contract (corrected), and the registered-instance constant form

> Owner: **Agent 2 — Technical Architect** · Task **ARCH-006** · Date **2026-10-20**
> Status: **(i) ACCEPTED · (ii) ACCEPTED · (iii) CAPABILITY ACCEPTED, PUBLISHED TEXT REFUSED — corrected form below is normative · (iv) ACCEPTED (remedy shape approved as a text spec)**
> Answers **GD-014** (`docs/decisions/design-0010-xor-device-ruling-and-par28-release.md`;
> `docs/level-design.md` §7.10.8–§7.10.10) under the ARCH-006 dispatch. **Normative restatement for
> implementers and for the level lane: `docs/architecture.md` §17** (this ADR is its full record). **This ADR is a rider to
> ADR-design-0010: nothing in it is rewritten, and the two corrections below are *corrigenda to the
> encoding form of published law*, routed back to the Game Designer, never silently tool-patched.**
> Scope: **docs only.** No byte of `src/**`, `scripts/**` or `tests/**` is touched (`git numstat` 0 —
> quoted in the Read-only proof section). Every assertion GD-014 made to the Architect is checked
> **against disk, by measurement**, in the Evidence table; three of them are cited one index off and
> are corrected with the measured bytes beside them.

---

## 1. What I was asked to sign, and what I found

GD-014 handed the Architect four items. I verified each one from disk and by **executing the shipped
core**, not by reading a claim. Measurements below are from three throwaway probes that imported
`src/core/**` and `scripts/room-derivation.ts` read-only (no repo file written; probes live outside
the worktree).

**Headline: three of the four items are sound as published. The fourth (the `G2-X` contract) has a
sound *capability* and an unsatisfiable *literal text*: two of its three sub-clauses are false on
100 % of measured evidence, because the door base strictly alternates with the phase and every legal
move flips the phase.** That is a corrigendum obligation on the design text (and on the level lane's
encoding), not a hole in the device — and it is exactly the class of defect this ADR exists to stop
before a census is run behind it.

---

## 2. Ruling (i) — REPRESENTATION: `targets` multiplicity on the shipped predicate — **ACCEPTED**

**Claim checked.** XOR door semantics = **≥ 2 switches listing the same door id in `targets`**, over
the **shipped** `doorIsOpen`, with **no schema change, no validator change, no core predicate change**,
and `[multi-switch-door]` staying a warning class.

**Disk.** `src/core/rules/solid.ts:93–106` (`doorIsOpen`, read verbatim): `open = baseDoorOpen(door.color, phase)`,
then for each switch in `level.switches`: skip unless `switchesOn[sw.id] === true`, skip unless
`sw.targets.includes(door.id)`, `open = !open`. The loop is **per switch object**, and the membership
test is a boolean ⇒ the composition is `base ⊕ (#ON switches whose targets list d mod 2)` — the XOR
device, already shipped, **quoted never re-derived**. `baseDoorOpen` (`solid.ts:73–75`) is
`red ⇒ open in A`, `blue ⇒ open in B`. The schema is `targets: z.array(z.string().min(1))`
(`src/core/level/index.ts:176`) — it already admits a second switch listing the same id. The validator
emits a **warning**, never an error: `src/core/level/index.ts:622`, and there is **no**
`POLICY_VIOLATION_CODES` entry for the shape (ADR-architecture-0003 R5 home, unchanged).

**Measured.** My 7×3 XOR board (`blue` door at `(4,1)`; `s1` `(1,1)`/phase A and `s2` `(3,1)`/phase A,
both `targets: ["d1"]`): `validateLevel` → `errors=0`, `warnings=1`, code `multi-switch-door`. The
solver reaches the goal at par 6 and the route presses **both** switches. ⇒ **no change of any kind is
owed.** The warning class is the correct and only home.

**Boundary clarification I am adding as law (because "multiplicity" is ambiguous and the ambiguity is
load-bearing).** The parity carrier is the count of **distinct switches** whose `targets` list the
door. **Duplicate ids inside one switch's `targets` are inert:** `sw.targets.includes(door.id)` is a
boolean test (`solid.ts:102`), so `["d1","d1","d1"]` behaves exactly like `["d1"]`. Measured: the two
boards' six-move walks are **identical** (`1:false 2:true 3:false 3:false 3:false 3:false`), and the
validator emits `errors=0` **and zero warnings** for the duplicate form (it counts distinct switch ids:
`alreadyCounted`, `src/core/level/index.ts:607`). **Ruling: duplicate entries stay legal and inert. No
schema tightening** — a `.refine`/uniqueness clause would be a schema change for zero capability, would
risk rejecting shipped bytes, and would let an author believe a one-switch board is an XOR board. An
XOR board is **≥ 2 switches**, full stop. `docs/level-design.md` §7.10.8 C1 already says "≥ 2 switches
listing its id", so this is a clarification of the *consequence*, not a new rule.

## 3. Ruling (ii) — NO SECOND DERIVATION: the covering derivation is targets-blind — **ACCEPTED**

**Claim checked.** `g6`'s covering list (`scripts/room-derivation.ts:69–116`) never reads
`switches[].targets` ⇒ the covering list is invariant under any `targets` mutation ⇒ GD's invariance
claim holds, and no second derivation is owed.

**Disk, strongest form.** `grep -n "targets" scripts/room-derivation.ts` → **no match in the whole
file** (132 lines). The function reads `phaseAWalls` / `phaseBWalls` / `doors[].tiles` / in-bounds
connectivity only, and `switchIds` is built from `sw.tile` alone (`:109`). `doorsCoveringTwoRooms`
(`:124–132`) is a fold over the derived `doorIds`. A door tile is a blocker in **every** phase and
**every** switch state (`blocked`, `:73`), so no switch write can move a region boundary.

**Measured, on the shipped bytes, as a mutation experiment.** For **all 50 shipped levels** (45 of them
carrying ≥ 1 switch) I mutated `switches[0].targets` (injected a dangling id **and** duplicated every
existing id) and compared both the derived `doorIds` list per room and the `doorsCoveringTwoRooms`
output. **Lists that moved: 0 / 50.** ⇒ the invariance claim is not an argument from the docstring; it
is a measured property of the shipped generator input, and the one-line belt GD suggested (mutate
`targets`, assert the covering list does not move) is cheap, real and — as measured — free.

**Consequence.** No second derivation; §6.2.3 clause 3 is structural (untouched by XOR); clause 4 is
measured on the shared `applyMove` state graph, where the XOR truth table already lives. Accepted
unchanged.

## 4. Ruling (iii) — `G2-X`: capability ACCEPTED (zero `src/**` change), published text REFUSED with two measured corrigenda

### 4.1 The capability is real, is `scripts/**`-only, and the records already carry the state — **ACCEPTED**

**Claim checked.** The two membership readers (`scripts/author-l21.ts:1968–1991`, membership test at
`:1987`; `scripts/prove-candidate.ts:279–297`, membership test at `:293`) are unsound under XOR; and
`G2-X` needs **no new core surface** because the route records already carry the toggled state and the
resolved door map.

**Disk.** Both readers build `targetsBySwitch` and credit a press when a later arrival stands on a door
tile **whose id is in the pressed switch's `targets`** — `targets.includes(doorId)`
(`author-l21.ts:1987`, `prove-candidate.ts:293`, verified byte-for-byte). Neither reads any door
openness. **Both cited ranges are substantially exact** (I measured the blocks starting at
`author-l21.ts:1964` and `prove-candidate.ts:275`; the quoted test lines `:1987` / `:293` are exact).

**The record shape — the item's refusal condition, checked first.** `ArrivalRecord`
(`src/core/solver/bfs.ts:647–660`) is
`{ state: SearchState; direction: Direction; embedded: boolean; toggledOn: readonly string[]; toggledOff: readonly string[] }`,
and `SearchState` (`src/core/state/types.ts:58–63`) is `{ player, phase, doorsOpen, switchesOn }`.
Measured on a real record from `forEachParRoute`: `record fields: state,direction,embedded,toggledOn,toggledOff`
· `state fields: player,phase,doorsOpen,switchesOn`. So **`doorsOpen`, the toggled ids and the move
`direction` are already on the records** ⇒ the capability requires **no new core surface** and no new
search. ⇒ **the item's refusal condition does NOT fire.** Blast radius `scripts/**` only. **No AGENTS §2
triad** (device/reader law, not the phase loop).

**Unsoundness, demonstrated.** On the 7×3 board the reader credits `{"i":1,"id":"s1","cross":4}` —
"route pressed `s1` at move 1 and later crossed `d1` at move 4" — while **at arrival 1 the door is
closed** (`doorsOpen[d1]=false`, measured) and the crossing at move 4 happens only because `s2` pressed
later. The membership form is satisfied by a press that did the opposite of opening the door. (In this
board the credited press *is* load-bearing — verified by the counterfactual below — which is precisely
why membership is unsound **as a witness**: it passes for both kinds of press and cannot tell them
apart.)

**Correction to the field path (design text, one level off).** §7.10.8.2 C2 clause 2 and clause 3 write
`route[i].state.levelState.doorsOpen[d]`. **`ArrivalRecord.state` is a `SearchState`, not a `GameState`:
there is no `levelState` on it** (`levelState` exists only on `GameState`, `src/core/state/types.ts:107`,
read by the renderer at `src/game/renderer/cell-state.ts:171`). The corrected path is
**`route[i].state.doorsOpen[d]`**.

### 4.2 C2 clauses 2 and 3 as literally written are UNSATISFIABLE — **REFUSED**, with the corrected form normative

**Quoted bytes, as published** (`docs/level-design.md` §7.10.8.2 C2):

> 2. the door's **resolved openness CHANGES at that arrival** — `route[i].state.levelState.doorsOpen[d]`
> differs from `route[i−1]`'s — an **effective** press, not a parity-neutral one — **and it changes to
> `true`** (the door opens), **and**
> 3. the door is **open at every crossing entry** — `route[j].state.levelState.doorsOpen[d] === true`.

**Why clause 2 cannot hold — a structural theorem of the shipped rules, then measured.** A door's
openness is `base(color, phase) ⊕ (parity of ON targeting switches)`. `baseDoorOpen` **strictly
alternates with the phase** (`solid.ts:73–75`, measured: `base(red) A=true B=false`, `base(blue) A=false B=true`),
**every legal move flips the phase** (`applyMove` step 4, `src/core/rules/applyMove.ts:154–155`), and
**at most one switch toggles per move** (`switchAt` returns a single switch, `solid.ts:220–226`; and a
portal's landing tile triggers nothing, `applyMove.ts:136–151`). Therefore, across any arrival:
*parity-flip and base-flip cancel* ⇒ **the resolved openness of the door the toggled switch targets
never changes**, and every other door's always does.

**Measured, over every shipped level's par routes** (45 door-bearing boards, **4 025 par routes**):
arrivals that toggle a switch: **17 732** — of those, the toggled switch's **own** target door changed
openness: **0**; arrivals that toggle nothing: **70 048** — changed: **70 048 / 70 048**. So
`route[i].state.doorsOpen[d] !== route[i−1].state.doorsOpen[d]` **at a clause-1 arrival is false on
100 % of the shipped evidence**, and true exactly when the arrival toggles *nothing*. Encoding C2 as
published would make every legitimate XOR witness FAIL and would guarantee a first-census
`divergence = 100 %` — the instrument would report the class as absent while the device is present.

**Why clause 3 cannot hold either — off by one index.** Legality is judged on the **pre-move** state, and
openness is **recomputed after the flip** (`applyMove` step 1 vs step 5). A player who legally steps onto
a door tile therefore stands there with the door **closed** in the new phase (the entry-only/embedded
state, ADR-0008 clauses 1–3). Measured over the same shipped routes: **30 847** door-tile crossings —
`route[j].state.doorsOpen[d] === true` at the crossing arrival: **0 / 30 847**;
`route[j−1].state.doorsOpen[d] === true` (the entry state): **30 847 / 30 847**. The literal clause 3 is
false at every crossing in the shipped set.

### 4.3 The corrected `G2-X` contract — NORMATIVE (this is what LV-020 may encode)

For **every** par route, for **every** door `d` that **≥ 2** switches target and that the route crosses
(its tile is entered at index `j`):

1. **the crossing was switch-enabled, not colour-enabled** — `route[j−1].state.doorsOpen[d] === true`
   (the entry state; a landed par route already guarantees it, so read it on the counterfactual replay
   below, where it is not a tautology) — and
2. **an effective press exists before it** — there is an index `i < j` whose
   `toggledOn ∪ toggledOff` names a switch `s` with `d ∈ s.targets` for which the **counterfactual
   holds**: take the state at `i`, restore `switchesOn[s]` to its pre-arrival value, recompute
   `doorsOpen` with the exported **`resolveDoorsOpen`** (`solid.ts:113`), replay moves `i+1 … j` with
   the shipped **`applyMove`** using the records' own `direction` values, and require the crossing at
   `j` to **fail**. If it still crosses, that press is not load-bearing for that crossing and the
   reader must not claim it.

Both legs use **only exported core functions and the records' own data**: **zero** new core surface,
zero second derivation of the rules (the replay *is* `applyMove`), no new search (the move sequence is
given). Cost is O(par) per witness. The parity reading at the crossing (`doorsOpen[d]` vs
`baseDoorOpen(d.color, route[j−1].state.phase)`) is **printed beside** the verdict and never decides it
— GD-008's shape, both readings printed, no verdict silently moved. **Worked example (3-step walk, the
one this ADR owes).** Board: `7×3`, player `(0,1)`, goal `(6,1)`, `startPhase A`, `doors: [{d1, blue, [[4,1]]}]`,
`switches: [s1 (1,1) A → ["d1"], s2 (3,1) A → ["d1"]]`, `par 6`; route = `right ×6`:

| step | tile | phase | toggled | `doorsOpen[d1]` | changed vs prev | clause-2-literal | base(blue, phase) |
|---|---|---|---|---|---|---|---|
| 0 | (0,1) | A | — | **false** | — | — | false |
| 1 | (1,1) | B | `ON:s1` | **false** | **no** | **FAILS** | true |
| 2 | (2,1) | A | — | **true** | yes | passes | false |
| 3 | (3,1) | B | `ON:s2` | **true** | **no** | **FAILS** | true |
| 4 | (4,1) ← door tile | A | — | **false** | yes | passes | false |

Step 1 is the whole finding in one line: the player pressed a switch that targets `d1`, the door did
**not** change — yet without that press the crossing at step 4 is **impossible** (counterfactual replay
measured: with `s1`'s press suppressed the move into `(4,1)` is rejected and the player stays at
`(3,1)`). Clause 2 as published would have called this interference-free press "parity-neutral" and
failed it.

**The negative control GD asked for now has a measured recipe** (membership-pass / `G2-X`-fail): this
very board — membership credits `s1` at step 1 and the crossing at step 4, while the corrected leg 1
reads the door **closed** at step 1 and the counterfactual at step 1 is only decisive *for the step-4
crossing*; a control board pressing the door shut (flip the door to `red` and press the second switch
before the crossing) yields membership-pass / corrected-fail. LV-020 names it from its own measurement
(§8.12 F-L16-3: expectations corrected to measured names, never widened).

### 4.4 STOP-AND-ROUTE — restated, and it now fires **to GD**

GD-014 ruled: *"divergence = 0 on an XOR class is a STOP-AND-ROUTE to GD, because it would mean the
census selected XOR-free boards wearing an XOR flag."* **I keep that rule and it stays the Architect's
standing ruling** — a divergence figure is only meaningful for the **corrected** reader, and the
threshold is a *design* question (which class the act meant to ship), never a reason to patch a tool
until it agrees. **What I add:** under the **literal** text the first census *must* read
`divergence = 100 %` (0 / 17 732 measured), so a 100 % reading is **not** evidence that the class is
missing — it is an instrument defect, and the remedy is the corrigendum **before** the census, not a
threshold changed after it. Per the LV-019 `F-L46-1` precedent (a pre-registered test is not allowed to
fire on a broken instrument), `G2-X` encodes **first**, then the census runs, then the divergence is
printed.

**Governing rule, for any future census, in one sentence: if a census finds `divergence = 0` on an XOR
class, the STOP-AND-ROUTE fires to the Game Designer — never to tool-patching, never to a widened
gate, never to a re-labelled class.**

## 5. Ruling (iv) — CONSTANT HYGIENE, `F-GD014-1` — **ACCEPTED; remedy shape approved as a text spec**

**Claim checked.** Instance 6's comparator is alias-typed to `ACT_III_REGISTERED_TAIL_*`; the published
form is "registered instances pin their published **values**, aliases only for pre-ticket **standards**";
the remedy is one line in `policy.ts`.

**Disk.** Instance 6: `ACT_III_B2_SEAM_RELIEF_PREVIOUS_LEVEL_ID = ACT_III_REGISTERED_TAIL_LEVEL_ID`
(`policy.ts:2515`) and `ACT_III_B2_SEAM_RELIEF_PREVIOUS_EXEC = ACT_III_REGISTERED_TAIL_EXEC`
(`policy.ts:2518`), with `ACT_III_B2_SEAM_RELIEF_EXEC = 26.242489` (`:2550`) and
`_DELTA = EXEC − PREVIOUS_EXEC` (`:2551–2552`). The referents are **literals today** —
`ACT_III_REGISTERED_TAIL_LEVEL_ID = 45` (`:2312`), `ACT_III_REGISTERED_TAIL_EXEC = 30.455319`
(`:2315`) — so the alias is correct today and reads `−4.212830` (verified: `26.242489 − 30.455319 = −4.21283`,
and the published `0.038298 = 30.455319 − 30.417021` also reproduces). **How R-008 typed the two
classes** is visible in the same file: the pre-ticket **standard** is an **alias**
(`ACT_III_PRE_R008_REGISTERED_TAIL_LEVEL_ID/_EXEC = ACT_III_REGISTERED_TAIL_*`, `:2584/:2587`) while the
registered **values** are **literals** (`:2312/:2315`, `:2619/:2620`, `ACT_III_B2_LADDER` declared `:2605`, rows `:2606–2610`).
**GD's FORM is confirmed by the shipped typing.** ⇒ instance 6's `_PREVIOUS_EXEC` is a *registered
instance's published left side* reached through the **standard's** channel — the wrong channel. Once the
released `par 28` class lands, the act maximum moves off `L45` by construction (`≥ 31.7500 > 30.455319`),
`ACT_III_REGISTERED_TAIL_*` is re-pinned by that registration, and instance 6's **published** `−4.212830`
is silently restamped by a constant.

**Ruling — the exact remedy shape LV-020 may apply (text spec, not code; `src/core/solver/**` is the
lane's, with this sign-off):** three one-line edits in `src/core/solver/policy.ts`, plus one assertion:

1. **Pin the left side at registration.** Add
   `export const ACT_III_B2_SEAM_RELIEF_PREVIOUS_EXEC_AT_REGISTRATION = 30.455319;`
   — a **literal**, documented as *instance 6's comparator as published at registration (`L45`,
   `ACT_III_REGISTERED_TAIL_EXEC` at that moment, `docs/level-design.md` §7.3.1 instance 6)* — and the
   level id likewise as a literal `45`. **The moving alias must no longer feed the published pair.**
2. **Derive the published pair from the pinned literal, not from the alias.**
   `ACT_III_B2_SEAM_RELIEF_DELTA = ACT_III_B2_SEAM_RELIEF_EXEC − ACT_III_B2_SEAM_RELIEF_PREVIOUS_EXEC_AT_REGISTRATION`
   ⇒ the published `−4.212830` becomes **unmovable by any later registration**.
3. **Make drift loud, on the frozen pair only.** Replace the deleted alias with an assertion — in the
   file's existing idiom, `const near = (a, b) => Math.abs(a - b) < LAW_PRECISION` (`policy.ts:3140`) —
   of the form *"instance 6's published delta equals the published pair"*: assert
   `near(ACT_III_B2_SEAM_RELIEF_EXEC − ACT_III_B2_SEAM_RELIEF_PREVIOUS_EXEC_AT_REGISTRATION, ACT_III_B2_SEAM_RELIEF_DELTA_AT_REGISTRATION)`
   with a message naming `F-GD014-1`. **Do NOT assert against the live `ACT_III_REGISTERED_TAIL_EXEC`** —
   the tail moving is lawful and expected (GD's own release), so such an assertion would be a false alarm
   at the first `par 28` registration. The fact that the tail has moved off `L45` is **printed as a
   reading** beside the clause, never raised as a violation (the R-009-era treatment).

**Two second-instance findings of the same class, disclosed (routed to LV-020 as the same one-line text
obligation — not a new mechanism, not a new law):**

- **`ACT_III_PRE_R008_REGISTERED_TAIL_*` (`policy.ts:2584/:2587`) is an alias to a *moving* referent.**
  `ACT_III_REGISTERED_TAIL_EXEC` is defined over the **growing** act id set (`ACT_III_REGISTERED_IDS`,
  `policy.ts:2573–2576`) — which is precisely why it will move. So the shipped **pre-ticket standard**
  shares `F-GD014-1`'s hazard: at that registration it silently becomes the **new** tail rather than the
  standard "as it stood before R-008". **Law I am adding here:** an alias is admissible only when its
  referent is **frozen by construction** (a literal, or a measurement over a **closed, already-registered**
  id set — e.g. a batch peak, `ACT_III_B2_BATCH_PEAK_EXEC = 30.417021`, `policy.ts:2619/:2620`, which is
  why instance 7's comparator may keep an alias form); it is **not** admissible for a value defined over a
  set that still grows. The ticket that moves the act tail **re-pins the pre-ticket standard to the
  literal it published** — one line, same form as (1) above.
- **`ACT_III_B2_TAIL_ZERO_MOVE` (`policy.ts:2631–2632`) is self-cancelling by construction**
  (`= ACT_III_REGISTERED_TAIL_EXEC − ACT_III_PRE_R008_REGISTERED_TAIL_EXEC`, both sides the same
  constant) ⇒ it reads `0.000000` for **any** value of the tail. It is a **label**, not a measurement, and
  **must never be cited as evidence that the act maximum did not move**; the measurement that can move is
  the live `actIIIWidened` reading (`policy.ts:3503–3505`; the value it compares is assigned at `:4232`).

## 6. Boundary statement (AGENTS §3) — unchanged, and provably untouched

```
Renderer (Phaser)  →  Gameplay  →  Core Logic (pure TS)  ←  Solver
```

- **Unharmed.** The XOR device is a **state** rule that was already shipped inside `doorIsOpen`; this ADR
  adds **no** module, **no** dependency, **no** field and **no** predicate, and `G2-X` is a **reader in
  `scripts/**` over `SearchState` records that core already produces** — the Solver side consumes Core
  through the same `applyMove` as Gameplay (one truth source), and nothing here reaches Phaser. The
  corrected `G2-X` replay calls **`applyMove`** and **`resolveDoorsOpen`** — reusing the truth source is
  the point, not a convenience.
- **No AGENTS §2 triad.** The locked core loop (two phases, move-flips-phase, illegal move = no move and
  no flip, no crush/push/random, deterministic) is **not touched**: an XOR door changes a **state**, never
  a position. A door closing behind the player is the already-shipped embedded/entry-only class
  (ADR-0008 clauses 1–3), and the trap class is already refused by the shipped `deadStates 0` /
  `T ≡ R ≡ 0` invariant, unchanged.
- **Dependency direction preserved:** `Renderer → Gameplay → Core ← Solver`; `Solver → Phaser` remains
  forbidden and is enforced by the §12.1 import-boundary gate.

## 7. Evidence (my own reads; every number is a measurement, not a recollection)

| # | Evidence (file:line / command) | What it settles |
|---|---|---|
| 1 | `src/core/rules/solid.ts:93–106` — `doorIsOpen`, read verbatim: per-switch loop, `switchesOn[sw.id] !== true` skip, `sw.targets.includes(door.id)` skip, `open = !open` | (i) the XOR composition **is** the shipped predicate; nothing to add |
| 2 | `src/core/rules/solid.ts:73–75` — `baseDoorOpen`; measured `base(red) A=true B=false`, `base(blue) A=false B=true` | (i) + §4.2: the base **strictly alternates** with the phase |
| 3 | `src/core/rules/applyMove.ts:114–119` (step 1 identity on illegal, legality on the **pre-move** state) and `:154–162` (step 4 flip, step 5 absolute `resolveDoorsOpen`) | §4.2 clause 3: legality reads the entry state; openness is recomputed **after** the flip |
| 4 | `src/core/rules/solid.ts:220–226` — `switchAt` returns **one** switch; `applyMove.ts` step 3 (portal landing triggers nothing) | §4.2: at most **one** toggle per move ⇒ the parity/base cancellation is exact |
| 5 | `src/core/level/index.ts:176` (`targets: z.array(z.string().min(1))`), `:607` (`alreadyCounted` per-switch dedupe), `:622` (the `[multi-switch-door]` warning text), `:292` (`LevelWarningCodeSchema`) | (i) no schema/validator change owed; **duplicate ids are inert**; the warning stays a warning (ADR-architecture-0003 R5) |
| 6 | Measured: `validateLevel` on the 7×3 XOR board → `errors=0 warnings=1 codes=["multi-switch-door"]`; on the duplicate-targets board → `errors=0 warnings=[]`; walks identical | (i) end-to-end, not inferred |
| 7 | `scripts/room-derivation.ts` — `grep -n "targets"` → **no match** (file, 132 lines); `derivedWalkSealedRooms` at `:69`, blocked-tile rule at `:73`, `switchIds` from `sw.tile` at `:109`, `doorsCoveringTwoRooms` at `:124` | (ii) the covering derivation is **targets-blind** |
| 8 | Measured: all **50** shipped levels, `targets` mutated (dangling id + duplicated ids) → derived `doorIds` per room and the `doorsCoveringTwoRooms` output **moved in 0 / 50** | (ii) invariance is **measured**, not argued |
| 9 | `scripts/author-l21.ts:1964/:1987` and `scripts/prove-candidate.ts:275/:293` — `targetsBySwitch` + `targets.includes(doorId)`, **no openness read** | (iii) both readers are membership-only ⇒ unsound under XOR |
| 10 | `src/core/solver/bfs.ts:647–660` — `ArrivalRecord { state, direction, embedded, toggledOn, toggledOff }`; `src/core/state/types.ts:58–63` — `SearchState { player, phase, doorsOpen, switchesOn }`; measured record keys `state,direction,embedded,toggledOn,toggledOff` / `player,phase,doorsOpen,switchesOn` | (iii) **the records already carry the state** ⇒ the item's refusal condition does **not** fire; `direction` even carries the moves for the replay |
| 11 | `src/core/state/types.ts:107` (`levelState` on `GameState`) vs `:58–63` (`SearchState` has **no** `levelState`); `src/game/renderer/cell-state.ts:171` reads `gs.levelState.doorsOpen` | (iii) `route[i].state.levelState.doorsOpen[d]` is a **wrong path**; correct: `route[i].state.doorsOpen[d]` |
| 12 | Measured over **4 025** par routes on 45 door-bearing shipped boards: toggling arrivals **17 732**, toggled switch's own door changed **0**; non-toggling arrivals **70 048**, changed **70 048** | §4.2 clause 2 is **unsatisfiable** (0 / 17 732) |
| 13 | Measured over the same routes: door-tile crossings **30 847** — `doorsOpen[d]` true at the crossing **arrival**: **0**; at the crossing **entry state**: **30 847** | §4.2 clause 3 is off by one index |
| 14 | Measured (counterfactual replay on the 7×3 board): with `s1`'s press suppressed at step 1 and `doorsOpen` recomputed by `resolveDoorsOpen`, replaying `right,right,right` under `applyMove` ends at `(3,1)` — the step-4 crossing **fails** | §4.3 leg 2 is executable with exported core functions only, and it is decisive |
| 15 | `src/core/rules/solid.ts:113` — `resolveDoorsOpen` is **exported**; `src/core/solver/bfs.ts:650` — `direction` on the record | §4.3 needs **no** new core surface |
| 16 | `policy.ts:2312/:2315` (registered values **literal**), `:2515/:2518` (instance 6 **aliased** to them), `:2550` + `:2551–2552` (published `26.242489` / derived delta), `:2584/:2587` (pre-ticket standard **aliased**), `:2619/:2620` (batch peak **literal**), `:2573–2576` (the **growing** registered id set), `:2605` declared + rows `:2606–2610` (`ACT_III_B2_LADDER` rows literal), `:2631–2632` (self-cancelling zero-move), `:3140` (`near`), `:3503–3505` (the live widened reading, assigned at `:4232`) | (iv) GD's FORM is the shipped typing; the remedy shape is exact; two second instances of the class disclosed |
| 17 | Arithmetic recomputed: `26.242489 − 30.455319 = −4.21283` ✓; `30.455319 − 30.417021 = 0.038298` ✓ | the published numbers reproduce from the constants, read not retyped |

**What is *not* evidence here.** The probes are my own instruments, not accepted deliverable code — they
live outside the worktree and are quoted as **measurements**; the **accepted** instruments remain the
level lane's (`scripts/**`, `tests/solver/**`). No claim about the XOR device's **feel** or its teaching
power is made or implied: comprehension is `docs/level-design.md` §7.10.8.3's labelled hypothesis
(`NOT TESTABLE, n = 0`), and `D_exec` carries no comprehension term. **Nothing in this ADR is a licence to
change a gate, a threshold, a band, a `par`, a level byte, or a registered row** — three of four items
were verified sound as published, and the fourth's correction makes the reader *stricter and cheaper to
falsify*, never looser.

## 8. Read-only proof

`git diff --cached --numstat` against this worktree's base commit (`0664a49`, the
`git rev-parse develop` taken at dispatch): exactly two paths — `docs/architecture.md` and this ADR.
`src/**` **0 files**, `scripts/**` **0 files**, `tests/**` **0 files**. (The `develop` ref has moved on
since dispatch — other lanes' commits, e.g. item 166 / `fa92d92` — so the base commit, not the moving
ref, is the correct comparison.) The probes
that produced every measured row were written to a temporary directory **outside** the repository and were
never staged; `git add -A` was never run (paths were added explicitly).

## 9. Consequences

- **Level AI + Solver (LV-020 and successors) is cleared to encode exactly this:** the two `G2-X`
  readers (`scripts/author-l21.ts`, `scripts/prove-candidate.ts`) test, for **every** par route and every
  door with **≥ 2** targeting switches, the **corrected** two-leg witness — entry state
  `route[j−1].state.doorsOpen[d] === true`, **plus** the counterfactual replay (`resolveDoorsOpen` +
  `applyMove` from the state at `i` with the press suppressed, using the records' own `direction`) — and
  print the membership-vs-corrected divergence beside the parity reading. **Nothing else.** No schema
  field, no validator rule, no core predicate, no policy code, no new search, no new dependency. The
  negative control (membership-pass / corrected-fail) is named from the lane's own measured refusal.
- **Game Designer:** two corrigenda are owed to `docs/level-design.md` §7.10.8.2 C2 — the field path
  (`state.doorsOpen`, not `state.levelState.doorsOpen`) and clauses 2/3 (the "resolves-changed-at-arrival"
  test is unsatisfiable; the crossing index is the **entry** state, and the effective-press witness is the
  counterfactual). GD owns that text; the Architect does not edit it.
- **Both the STOP-AND-ROUTE threshold and the register's constant form stand as ruled above.**

---

## 10. Erratum (2026-10-20) — **ARCH-006b**: the line-cite re-pin (**values and verdicts unchanged**)

The design lane's independent re-verification of this ADR (GD-014b, `docs/project-status.md` item 168) came
out **concordant on every value and verdict** and caught **drifted pointers**. A pointer that lands on an
`ACT_III_B2_LADDER` **row** while claiming a **peak constant** is exactly how an alias gets mis-read a
registration later, so the *whole* cite surface of this review is re-pinned below — the design lane's four
finds **and** this lane's own audit of the pointers it originated — every row **measured against disk at
this ticket's base** (`develop` `816e8af`), never remembered. **No value, threshold, verdict, ruling or
normative sentence moves:** the adjudication record of §1–§9 stands exactly as published, and the
front-matter blockquote's count of GD-014's own off-by-one cites (`:11–13`) is a statement about *that*
dispatch and is left verbatim.

| # | pointer as published (**wrong**) | corrected (**measured**) | what the old pointer actually landed on |
|---|---|---|---|
| 1 | `policy.ts:2546` — `ACT_III_B2_SEAM_RELIEF_EXEC` (§5 `:232`; Evidence 16) | **`:2550`** | a doc-comment line of the fill-in block |
| 2 | `policy.ts:2547–2548` — `_DELTA` (§5 `:233`; Evidence 16) | **`:2551–2552`** | the tail of the same doc-comment |
| 3 | `policy.ts:2606/:2607` — `ACT_III_B2_BATCH_PEAK_*` (§5 `:239`/`:275`; Evidence 16; `docs/architecture.md` §17.4) | **`:2619/:2620`** | **`ACT_III_B2_LADDER` rows `L46`/`L47`** — the mis-read this erratum exists to stop |
| 4 | `policy.ts:2611–2617` — `ACT_III_B2_LADDER` rows (§5 `:239`; Evidence 16) | **declared `:2605`, rows `:2606–2610`** | the array's closing `];` and the peak constant's doc-comment |
| 5 | `policy.ts:2572–2576` — `ACT_III_REGISTERED_IDS` (§5 `:271`; Evidence 16; `docs/architecture.md` §17.4) | **`:2573–2576`** | the preceding one-line doc-comment (`:2572`) |
| 6 | `src/core/level/index.ts:601` — `alreadyCounted` (§2 `:60`; Evidence 5; `docs/architecture.md` §17.1) | **`:607`** | the counting-rule comment block (`:593–604`), which does not contain the identifier |
| 7 | `scripts/room-derivation.ts:110` — `switchIds` from `sw.tile` (§3 `:74`; Evidence 7) | **`:109`** | `hasGoal` (`:110`) — the **next** field of the same object literal |
| 8 | `policy.ts:3504–3505` — "the live `actIIIWidened` reading" (§5 `:283`; `docs/architecture.md` §17.4) | **`:3503–3505`** (guard incl. its `const`; the value is assigned at `:4232`) | the two compared operands without the binding that names the guard |

Items 1–5 are GD-014b's four finds (its (a)–(d); 1 + 2 are one find read as two pointers). Items 6–8 are
**this lane's own** audit: the same class, in the same file, one ticket later — **cite-as-label drift**, in
which the line number is real and the *name* written in front of it belongs to a neighbouring construct.
**Every verdict is unaffected, because each claim is true of the corrected line and false of the old one:**
`switchIds` **is** built from `sw.tile` alone at `:109`; the validator **does** count distinct switch ids
through `alreadyCounted` at `:607`; `30.417021` **is** the batch peak, read at `:2619/:2620`; the ladder's
rows **are** `:2606–2610`; the registered id set **is** `:2573–2576`; `26.242489` **is** `:2550`.

**Re-verified in the same sitting and left unchanged** (the rest of the cite surface): `src/core/rules/solid.ts`
`:93–106` (`doorIsOpen`), `:73–75` (`baseDoorOpen`), `:102` (`includes` is a boolean), `:113`
(`resolveDoorsOpen` **exported**), `:220–226` (`switchAt` returns one switch); `src/core/rules/applyMove.ts`
`:114–119` (step 1 identity on illegal; legality on the pre-move state), `:136–151` (a portal's landing tile
triggers nothing), `:154–155` (step 4 flip), `:154–162` (step 5 absolute `resolveDoorsOpen`);
`src/core/level/index.ts` `:176`, `:292`, `:622`; `scripts/room-derivation.ts` (**no `targets` match in 132
lines**), `:69–116`, `:73`, `:124–132`; `scripts/author-l21.ts` `:1964`, `:1968–1991` (inside the
press-then-cross reader), `:1987`; `scripts/prove-candidate.ts` `:275`, `:279–297` (inside the same reader),
`:293`; `src/core/solver/bfs.ts` `:647–660`, `:650`; `src/core/state/types.ts` `:58–63`, `:107`;
`src/game/renderer/cell-state.ts` `:171`; `src/core/solver/policy.ts` `:2312`, `:2315`, `:2515`, `:2518`,
`:2584`, `:2587`, `:2631–2632`, `:3140` (`near`, exact). **§4.2 / §4.3 / §4.4 carry no re-pin at all: not
one line of the refused-literal quotation, of the corrected contract or of the STOP-AND-ROUTE text changed,
and their cites (`solid.ts:73–75`, `applyMove.ts:154–155` / `:136–151`, `solid.ts:220–226`, `solid.ts:113`,
`types.ts:107`) are exact as written.**

**One residue outside this pen, named and not edited.** The same `policy.ts:2572–2576` pointer was copied
into the **design lane's** files (`docs/level-design.md:1767` and `:1822`, from §17.4's text, and the
`docs/architecture.md` V1.0 change-log row). Single-writer forbids the Architect from editing either; the
corrected pointer is `:2573–2576` whenever their owners next open those files, and `docs/architecture.md`
carries its own V1.1 row for §17.

**Read-only proof for this ticket.** `git diff --cached --numstat` against the base: exactly **two** paths —
this ADR and `docs/architecture.md`; `src/**` **0**, `scripts/**` **0**, `tests/**` **0**. Every line number
above was read from disk at the base commit; `git add -A` was not run.
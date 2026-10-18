/**
 * `scripts/author-l21.ts` — LV-012: the **G lattice** (Act II batch 1, L21–L25) —
 * *multi-pocket* sealed landings with an **ordered multi-press chain**.
 *
 * Law it implements, quoted not paraphrased:
 * - `docs/level-design.md` §7.2 (GD-009 / ADR-design-0005): Act II =
 *   "**Portal orchestration**: multi-pocket sealed landings (2–4 pockets), ordered
 *   multi-switch chains, portal-repriced latches; the walk-only world deleted from
 *   the outset", par band **16–24**, `D_exec` band **[19.75, 29.0625]** (printed
 *   `[19.75, 29.06]`; §7.9's notation law — derived-exact is the value), batch size 5.
 * - §7.4: stage **G** = "multi-pocket: pocket count 1–4 × portal pairs 1–2 × door
 *   arity 2–5 × landing position, on 7×6 → 7×7". This pass enumerates **7×6 first**
 *   (the dispatch's order) with **one** portal pair, per §6.2.3 item 1.
 * - §6.2.3 (the sealed-landing lattice, VERBATIM obligations):
 *   1. exactly one opposite-colour portal pair (ADR-0009; same-colour is a validator
 *      hard error);
 *   2. the landing pocket is **not on-foot reachable** in the needed phase
 *      (the portal-free world never enters it — the sealed column at `x = CX` makes
 *      the whole far region portal-only);
 *   3. **every blocker is an openable door** — no phase wall may form an exit
 *      (F-L19-2: a far-region phase wall makes its tile unstandable and the 42/42
 *      coverage gate fails);
 *   4. an ordered **≥ 2-press** plan: the second switch reachable only *after* the
 *      first door opens (here: a **3-press** chain `s1 → d1 → s2 → d2 → sg → d3`);
 *   5. `T ≡ R ≡ 0` and P4 coverage 42/42 (the pockets are through-stations);
 *   6. `switchRequired` read as a **measurement**, never an assertion.
 * - §7.4 **clone guard**: "the reusable unit is the plan shape, never the board" —
 *   the stricter seal-inclusive geometry key is censused (never re-stamping L19/L20).
 * - §7.7 item 4: **do not re-stamp L20**; a new skeleton under the same plan shape.
 *
 * ── THE DEVICE THIS FILE BUILDS (the named plan shape, written before the search) ─
 *
 * ```
 *   P  the landing pocket   — walk-sealed: the portal is its only entrance
 *                             exit  = door  d1  (one door object, whole boundary)
 *                             press = s1 ∈ P        (drives d1)
 *   F  the free far region  — entered only by crossing d1
 *                             press = s2 ∈ F        (drives d2)  ← reachable only
 *                                                                  after d1 opens
 *   Q  the second pocket    — walk-sealed room in F: every neighbour is a d2 tile,
 *                             so d2 is both its entrance and its exit
 *                             press = sg ∈ Q        (drives d3)
 *   G  the goal             — every in-region neighbour is a d3 tile (one door
 *                             object), so the goal is entered only through d3
 * ```
 *
 * The forced order is a property of the board, never of advice: `s2` lies outside
 * `P` (hence after `d1`), `sg` lies inside `Q` (hence after `d2`), and `d3` is the
 * goal's only entrance (hence after `sg`). Nothing else can open `d1`, `d2` or `d3`
 * (one switch per door, §1's L6–L35 authoring rule).
 *
 * ── LV-014 · THE CHAINED SUB-LATTICE (`--pockets=3`, Act II batch 2 = L26–L30) ──
 *
 * The batch-2 rungs are the **same plan shape, one pocket deeper**: §7.2 asks Act II
 * for "multi-pocket sealed landings (2–4 pockets), ordered multi-switch chains", and
 * §7.4's stage `G` publishes the lattice axis `pocket count 1–4`; batch 1 discharged
 * the 2-pocket member, so this pass enumerates the **3-pocket** member — a
 * **4-press** chain at the same `par` band (variety, never depth: §7.3 grants the
 * interior of an act's band as FREE, and the batch-1 peak 27.604651 already discharged
 * the across-act `act-peak` clause; this batch carries **no rising-`D_exec`
 * obligation**, and its selection rule is published as such).
 *
 * **§6.2.3, quoted verbatim, is the lattice law this device must satisfy** — the
 * blind-spot it closes: the batch is *not* free to invent a bigger device, only to
 * enumerate the published axis (`pocket count 1–4`). The seven clauses, read against
 * the 4-press chained sub-lattice:
 *
 *   1. *"Exactly one opposite-colour portal pair (ADR-0009 law; same-colour is a
 *      validator hard error), both ends visible from the start — the pair is part of
 *      the plan, never decoration."* — one pair, `landing → near`, on the activation
 *      set (`g0-portal-pair` re-derives it per file).
 *   2. *"The landing end resolves into a pocket that is not on-foot reachable in the
 *      needed phase without the portal"* — `P`'s boundary is `d1`, so `P` is
 *      walk-sealed; the walking-only subgraph cannot enter it at the plan's phase
 *      (`g1-landing-pocket` / `g2-room-structure`).
 *   3. *"The pocket's only exit is a door (M1). No phase wall may form the exit —
 *      F-L19-2 doctrine … every blocker in this device MUST be an openable door."* —
 *      every room boundary in this lattice is a **door object and nothing else**; the
 *      generator never places a phase wall, and `coverage = width × height` (clause 6)
 *      is what makes a wall-formed exit fail loudly instead of quietly.
 *   4. *"The ordered plan shape: at least one shortest route executes ≥ 2 presses in a
 *      fixed order, the second switch reachable only after the first door opens. This
 *      breaks the census identity by construction (≥ 1 seal tile that is not adjacent
 *      to the free far region)."* — discharged **one door deeper**: every par route
 *      executes **4** presses in the fixed order `p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4`
 *      (`g3-ordered-multi-press` requires `minPresses ≥ number of presses`, i.e. the
 *      whole chain on every shortest route), and `g5-identity-broken` re-measures the
 *      census identity's *value*, not its shape.
 *   5. *"par(L20) = 20 exactly — the rung, l15Par(10) + 2·(20 − 15)."* — the **L20
 *      rung law**, and it stays L20's own: no batch-2 id is 20, nothing here
 *      re-registers the block's tail, and the clause is satisfied by the shipped
 *      board (this batch cites it, it does not inherit it).
 *   6. *"T ≡ R ≡ 0 and P4 coverage: distinctPositions == width × height == 42/42. The
 *      pocket is a through-station, never a dead pocket."* — asserted per accept (the
 *      census prints `coverage=42/42` and the identity `D_exec = par + 3·B` on every
 *      row it keeps).
 *   7. *"switchRequired = "required" is expected but not decreed — it is a measurement
 *      obligation on the candidate (L16–L19 measured all-OFF unsatisfiable 4/4)."* —
 *      measured per candidate as the **all-OFF world**: the prover's `UNSATISFIABLE`
 *      reading, taken from the shipped Solver, never asserted by this generator.
 *
 * **Batch 2's selection rule, published before the run** — §7.2's variety axis held
 * fixed so that the chain length is the batch's only variable:
 *
 * 1. **Par mirror.** Rung *i*'s par is `ACT_II_B1_LADDER[i].par`, **read from the
 *    registered law constant** (17 / 18 / 20 / 21 / 23) and never typed here. Each
 *    batch-2 rung therefore has a **batch-1 comparator at the same par**, and the
 *    equal-par `ΔD_exec` printed beside the ladder measures the *chain cost* rather
 *    than a confound of par. A different par set would move two variables at once and
 *    leave the batch's own thesis ("longer chains at equal par") unreadable.
 * 2. **Within a par:** the accept with the **minimal `D_exec`**, then enumeration order
 *    — batch 1's own within-par tie-break, kept unchanged so the two batches' rows are
 *    comparable. (No "cheapest board" shortcut: the par set is fixed first, and the
 *    minimum is taken *inside* a par, never across pars.)
 * 3. **Membership:** every rung strictly inside the act's par band (17…23), inside
 *    `D_exec` [19.75, 29.0625] (printed [19.75, 29.06]; §7.9) and the measured `B` band — re-checked per file by
 *    `validateLevel` + `auditLevel`, never granted by the selector.
 * 4. **The §6.1.4 clone clause** as a *filter*: no rung may key a shipped board or a
 *    landed candidate, and the five rungs carry five distinct seal-inclusive keys.
 * 5. **No rising-`D_exec` obligation** (§7.3 interior freedom). The mirrored pars are
 *    ascending and each par's in-band `D_exec` window is disjoint from the next, so
 *    the selected ladder rises anyway — printed as an **observation**, never as a
 *    clause, and the tool re-runs identically with the clause off.
 * 6. **Peak rung, and no promotion.** The ladder's last rung is its peak; it must clear
 *    Act I's measured peak **24.729412** (§7.3's across-act clause, the prover's
 *    `act-peak` gate). The selection makes **no ceiling claim in either direction** and
 *    **promotes nothing**: at par 23 the minimal-`D_exec` rule lands at 27.560241,
 *    *below* the registered Act II peak `ACT_II_B1_REGISTERED_PEAK_EXEC` = 27.604651,
 *    so a registration train is not asked to move a registered maximum on the strength
 *    of a shelf file. The census rows **above** that constant (the class reaches
 *    27.746988) are published as **measurements** — they are what a deliberate peak
 *    promotion would be argued from, and they are left unselected on purpose.
 *
 * ```
 *   P   landing pocket   exit  = door  d1 (the whole boundary)   press p0 ∈ P
 *   F   free band        press = p1 ∈ F   → drives d2 (R2's door)   [reachable once d1 opens]
 *   R2  second pocket    exit/entrance = d2 (the whole boundary)    press p2 ∈ R2 → drives d3
 *   R3  third pocket     exit/entrance = d3 (the whole boundary)    press p3 ∈ R3 → drives d4
 *   G   the goal         every walk-neighbour is a d4 tile
 * ```
 *
 * The forced order `p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4` is again a property of
 * the board: `p1` is only reachable once `d1` opens, `p2` sits **inside** `R2`
 * (whose only entrance is `d2`), `p3` sits inside `R3` (only entrance `d3`), and `d4`
 * is the goal's only entrance.
 *
 * **Published lattice restrictions (shape filters, counted, never accepts).** Written
 * down before the run; each carries a printed counter and the run reports them beside
 * the accepts:
 *
 * 1. *the third room sits at least one step behind the second* — no tile of `R3` is
 *    adjacent to a tile of `R2`. The counter is printed (`rooms adjacent: N`): the
 *    value is **0 by the seal law**, not by taste — `R2`'s boundary is exactly `d2`
 *    (that is what walk-sealed means), so any tile adjacent to `R2` from outside is
 *    a `d2` tile and is excluded from `R3`'s pool before `R3` is even drawn. A
 *    non-zero reading would mean the seal law is broken, and the run says so.
 *    (The draft of this paragraph published the *opposite* filter — "at least one
 *    `d3` tile adjacent to an `R2` tile" — which the same law makes **unsatisfiable**;
 *    the counter is what caught it, before any board was written.)
 * 2. *the chain has a bounded enumeration*: `--paircap` caps the (`R2`,`R3`) pairs
 *    tried per device and `--budget` caps the tuples judged in the whole run, so a
 *    census is a **prefix** by construction, and the run prints both counters beside
 *    every count it quotes. The **completed run** reads them at their widest: *devices
 *    walked 440/440 · 40-pair cap hit on **0** device(s) · global budget 8000 **not
 *    reached*** — so for this class the accept count is **exact** (396 of 2640 judged
 *    over 264 distinct (`R2`,`R3`) pairs) and the refusal census is complete, not a
 *    floor. What the counters still *do not* buy: the class is the enumerated one
 *    (7 × 6, `--cx=2`, `--pocketsize=4`, `--qmax=4`, the shape filters above); nothing
 *    outside it is claimed, in either direction, and a re-run with a wider axis would
 *    have to print its own counters. The band is a **filter, not a truncation**: every
 *    judged tuple is accounted for (the par census prints the out-of-band members too,
 *    e.g. the 1178 `par-out-of-band` refusals).
 *
 * ── LV-015 · THE 4-POCKET SUB-LATTICE (`--pockets=4`, Act II batch 3 = L31–L35) ──
 *
 * Law this pass implements, quoted not paraphrased:
 *
 * - `docs/level-design.md` **§7.8 item 4** (the **anti-mirror clause**, GD-010 /
 *   `docs/decisions/design-0006-act-close-peak-and-relief-label-form.md`): *"Batch 3 must
 *   not mirror batch 1's ladder again, and must not copy batch 2's device. The mirror was a
 *   one-off measurement instrument … repeating it converts a measurement into a formula and
 *   yields a third indistinct rung set. Batch 3 publishes its own par set inside 16–24 (the
 *   census's own pool supports 19 and 22, neither yet used) and a device distinct in the
 *   stricter §6.1.4 seal-inclusive key. The named open axes available to it: the 4-pocket
 *   member (§7.4's pocket count 1–4; LV-014 states it unenumerated, no completeness claim)
 *   and the deferred `--pocketsize ≥ 11` probe."* This pass enumerates the **first** named
 *   axis — the **4-pocket** member (`P → R2 → R3 → R4` plus the goal's own seal = **5 doors
 *   / 5 presses**) — and leaves the second **deferred**: `--pocketsize ≥ 11` stays
 *   **unmeasured**, with no ceiling wording in either direction (item 114's law).
 * - **§7.8 item 1** + **§7.3.2** (the **`act-close` clause**): *"Act II's registered maximum
 *   must be carried by batch 3 or 4 and must strictly exceed `27.604651`."* The constants
 *   are **read, never typed**: `ACT_II_B1_REGISTERED_PEAK_EXEC` = 27.604651,
 *   `ACT_I_REGISTERED_PEAK_EXEC` = 24.729412, `ACT_II_B1_LADDER` pars 17/18/20/21/23.
 * - **§7.8 item 2** (the **derived route — no new number**): at `par 24`,
 *   `D_exec = par + 3·B` (§7.5 item 1's measured theorem `T ≡ R ≡ 0`) with `B` inside the
 *   measured band `[1.2500, 1.6875]` forces `D_exec ∈ [27.7500, 29.0625]`, i.e. **≥
 *   +0.145349** over the registered peak, the window's top *being* Act II's derived ceiling.
 *   Both numbers are citations; this file invents no threshold.
 * - **§7.8 item 3** (the **named census obligation**): LV-014's accept pool by par
 *   *"tops at `par 23`, so `par 24` is in-band but unmeasured in the `G` lattice"*. The
 *   published fallback, if `par 24` yields no accept, is the par-23 class reach
 *   **`27.746988`** (`+0.142337` over the registered peak) — which must pass §7.5 in full
 *   and travels the **§7.3.3 C path with its own ADR**, because it re-keys the registered
 *   maximum. That is a **Game Designer decision this tool may not take**, and it is never a
 *   silent par substitution.
 * - **§7.8 item 5** (**label before the bytes**): if batch 3's opening rung sits below L30
 *   (`27.566265`), that seam is a `ΔM = 0` interior relaxation and takes a **§7.3.1-form
 *   relief label published before the batch is authored**.
 * - **§7.2 / §7.4 / §7.5**: Act II's band (`par` 16–24, `D_exec` [19.75, 29.0625], printed
 *   [19.75, 29.06], batch = 5);
 *   stage `G` = *"multi-pocket: pocket count 1–4 × portal pairs 1–2 × door arity 2–5 ×
 *   landing position, on 7×6 → 7×7"*; and the per-batch proof obligations, unchanged.
 * - **§6.2.3**, the sealed-landing lattice law, read against a **5-door** device: exactly one
 *   opposite-colour portal pair; the landing pocket not on-foot reachable in the needed
 *   phase; **every** blocker an *openable door* (never a phase wall — F-L19-2); a forced
 *   ordered chain one press per door; `T ≡ R ≡ 0` and coverage `42/42`; `switchRequired`
 *   **measured**, never decreed. `par(L20) = 20` is cited, not inherited (no batch-3 id is 20).
 *
 * THE DEVICE (the named plan shape, written before the search):
 *
 * ```
 *   P   landing pocket   exit d1 (its whole boundary)        press s1 ∈ P
 *   F   free band        press s2 ∈ F  → drives d2            [reachable once d1 opens]
 *   R2  second pocket    exit/entrance = d2 (whole boundary)  press s3 ∈ R2 → drives d3
 *   R3  third pocket     exit/entrance = d3 (whole boundary)  press s4 ∈ R3 → drives d4
 *   R4  fourth pocket    exit/entrance = d4 (whole boundary)  press s5 ∈ R4 → drives d5
 *   G   the goal         every walk-neighbour is a d5 tile
 * ```
 *
 * The forced order `p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4 < p4 < d5` is a property of the
 * board — each press lies **inside** the room whose predecessor door seals it, and `d5` is
 * the goal's only entrance — and it is re-measured on **every** par route (`g3` requires
 * `minPresses ≥ presses` and `chain = n/n`), never on one witness. Relative to batch 2 the
 * device is one room deeper (4 presses → **5**) on the same `7 × 6` frame at `CX = 2`: the
 * §7.4 axis, not a re-parameterisation of batch 2's board, and each rung's §6.1.4 key is
 * censused against **all 30 existing files** (25 root + 5 shelf) and against its siblings.
 *
 * BATCH 3'S SELECTION RULE — **published here before any census or any byte**:
 *
 * 1. **Own par set (anti-mirror, §7.8 item 4).** `UNUSED := ([16, 24] ∩ ℤ) \ {par of each
 *    `ACT_II_B1_LADDER` row}` — read from the law constant, never typed — ⇒ **{16, 19, 22,
 *    24}**. Batch 1/2's pars (17/18/20/21/23) are excluded **by construction**; no batch-3
 *    rung may carry one.
 * 2. **Five rungs over that set (§7.2 batch size 5).** Only four in-band pars are unused, so
 *    **exactly one par repeats**: `CLOSE := max{p ∈ UNUSED : the census's accept pool at p
 *    is non-empty}`, used at the batch's **last two** rungs. §7.3.2 asks the act's maximum
 *    to be carried by the closing batch, so the tail ends on the batch's own band-ceiling
 *    par. (If a par's pool is empty, that par is simply absent from the ladder — the
 *    remaining members keep their own pars and `CLOSE` is chosen from what the pool
 *    supports; pars are never substituted from batch 1/2's set.)
 * 3. **Order:** ascending par; the two `CLOSE` rungs ordered by ascending `D_exec`.
 * 4. **Within-par tie-break:** minimal `D_exec`, then enumeration order (batch 1's and batch
 *    2's rule), with **one published departure** — the batch's **last** rung takes the
 *    within-par **maximum** `D_exec`, so that the act's maximum is carried by the batch's
 *    *last rung* rather than its interior (§7.3.2 read as a selection rule). Every departure
 *    is printed beside the ladder.
 * 5. **Bands and gates are filters, never preferences** (§7.5 item 1): `par ∈ [16, 24]`,
 *    `D_exec ∈ [19.75, 29.0625]` (printed `[19.75, 29.06]`), `B ∈ [1.2500, 1.6875]`, `T ≡ R ≡ 0`, coverage `42/42`,
 *    `switchRequired` measured as the all-OFF world, the `g0`–`g6` family gates by name.
 * 6. **§6.1.4 clone filter:** each rung's seal-inclusive key must be free of the 30 existing
 *    keys **and** of its siblings'; collisions are counted and printed, never hidden.
 * 7. **`act-close` refusal (no padding, no substitution):** if the batch's **measured
 *    maximum** is `≤ ACT_II_B1_REGISTERED_PEAK_EXEC` (27.604651) — i.e. the 4-pocket class
 *    cannot reach `par 24`, or the pool cannot carry it — the batch is **not written**. The
 *    census is reported as a **named act limitation** with the class ceiling beside it
 *    (§7.3.2's escape hatch) and the fallback is briefed to the Game Designer as the
 *    **C path** (§7.8 item 3). A padded par or a borrowed par is not a remedy.
 * 8. **Relief label (§7.8 item 5):** the `L30 → L31` seam is labelled in **§7.3.1's form**
 *    in the census dossier, **before `--write` runs**; if L31's `D_exec ≥ 27.566265` there is
 *    no relief and the label is recorded as **not fired**.
 *
 * The census commands, also published before the run (they are what the dossier quotes):
 *
 * ```
 *   STEP 1 — the par-24 obligation (§7.8 item 3), both fenced families:
 *     npx tsx scripts/author-l21.ts --stage=g --batch=2 --pockets=3 --cx=2 --pocketsize=4 \
 *       --qmax=4 --paircap=40 --budget=8000 --cap=400 --parmin=24 --parmax=24
 *     npx tsx scripts/author-l21.ts --stage=g --batch=3 --pockets=4 --cx=2 --pocketsize=4 \
 *       --qmax=4 --paircap=40 --budget=8000 --cap=400 --parmin=24 --parmax=24
 *   STEP 2 — the batch's own pool (full act band, the 4-pocket family):
 *     npx tsx scripts/author-l21.ts --stage=g --batch=3 --pockets=4 --cx=2 --pocketsize=4 \
 *       --qmax=4 --paircap=40 --budget=8000 --cap=400 --parmin=16 --parmax=24
 * ```
 *
 * Enumeration **sizes** may be orbit-predicted in the dossier and are then labelled
 * PREDICTED; no measured result ever inherits from a prediction, and a capped run reports
 * its `--paircap` / `--budget` counters as a **prefix**, never as a completed class
 * (`docs/architecture.md` §15.5).
 *
 * ── LV-017 · THE CLOSING BATCH (`--batch=4`, Act II finale = L36–L40) ─────────────
 *
 * Law this pass implements, quoted not paraphrased:
 *
 * - **§7.2** fixes Act II's family as *"**Portal orchestration**: multi-pocket sealed landings
 *   (**2–4 pockets**), ordered multi-switch chains, portal-repriced latches; the walk-only world
 *   deleted from the outset"*, with par band **16–24** and the derived `D_exec` band
 *   **`[19.75, 29.0625]`** (printed `[19.75, 29.06]`; §7.9's notation law — the derived-exact
 *   value is the value, the printed form is display text and is never a comparison operand).
 * - **§7.4** publishes stage `G`'s lattice axes for Act II — *"multi-pocket: **pocket count 1–4**
 *   × **portal pairs 1–2** × **door arity 2–5** × **landing position**, on **7×6 → 7×7**"* — and
 *   names this batch's feed: *"Act II batches 3–4"*.
 * - **§7.8** is the handoff this batch answers. **Item 4** (anti-mirror): *"Batch 3 must **not**
 *   mirror batch 1's ladder again, and must not copy batch 2's device. … repeating it converts a
 *   measurement into a formula and yields a **third indistinct rung set**."* — the clause is
 *   about the **ladder**, and this batch derives its own (rule 2 below) rather than mirroring a
 *   third time. **Item 1** + **§7.3.2** (`act-close`): *"An act's registered maximum `D_exec`
 *   must be carried by its **last two batches**"* — for Act II that is **L31–L40**, and R-005a
 *   registered the carrier at **L35 = 28.339426 > 27.604651** (`ACT_II_R005A_REGISTERED_TAIL_EXEC`,
 *   read from the law module, never typed), i.e. **the obligation is already DISCHARGED** and this
 *   batch **owes no peak**. **Item 5**: a seam below the shelf's tail takes a **§7.3.1-form
 *   label published before `--write`**. **Item 6**: report the refusal census with the accepts,
 *   hand the batch to QA for the §7.6 stratum before registry, report the act's measured maximum.
 * - **§6.2.3**, the sealed-landing lattice law, VERBATIM obligations, read against a **5-door**
 *   device: (1) *"Exactly one opposite-colour portal pair … both ends visible from the start"*;
 *   (2) *"The landing end resolves into a pocket that is **not on-foot reachable** in the needed
 *   phase without the portal"*; (3) *"The pocket's only exit is a door (M1). **No phase wall may
 *   form the exit** — F-L19-2 … every blocker in this device MUST be an **openable door**"*;
 *   (4) *"at least one shortest route executes **≥ 2 presses in a fixed order**, the second switch
 *   reachable only after the first door opens"*; (5) `par(L20) = 20` is **cited, not inherited**
 *   (no batch-4 id is 20); (6) *"`T ≡ R ≡ 0` and P4 coverage: the pocket is a **through-station**,
 *   never a dead pocket"*; (7) *"`switchRequired = "required"` is **expected but not decreed** — it
 *   is a **measurement** obligation on the candidate"*. `T ≡ R ≡ 0`, determinism, entry-only
 *   solidity and never-crushed (ADR-0008 rules 1–7) are unchanged and are gates, not prose.
 *
 * ── WHAT THIS BATCH IS, AND WHY THE ACT CLOSES HERE (the finale proposal) ─────────
 *
 * Act II's catalogue names exactly **one** sealed-landing family — *multi-pocket sealed landings
 * (2–4 pockets)* — and batches 1, 2 and 3 built it at pocket counts **2, 3, 4**: the **4-pocket
 * member is the family's ceiling** (§7.2's own range, §7.4's `pocket count 1–4` top, and the
 * deepest ordered chain the act's vocabulary admits — `5 doors / 5 presses`,
 * `p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4 < p4 < d5`). A **5-pocket** device is therefore
 * **refused by §7.2's published family text, not by authoring weakness** — and it is **not
 * censused**: a census of a device the act's own family forbids is an invitation to a family
 * change, which is a Game Designer decision (ADR + §7.2 edit) that no level ticket may take.
 *
 * The finale's character is taken on the axes that are still open **and published**:
 *
 * 1. **The frame axis** (§7.4: *"on 7×6 → 7×7"*). Every Act II batch so far sits on **7×6**:
 *    batch 1/2 at `CX = 2`, batch 3 at `CX = 1`. **7×7 is the axis's second member and has never
 *    been used by any Act II rung**, and at the only `7×7` frame LV-015 measured for this device
 *    (`CX = 2`) the class is **EMPTY** — 0 judged of 0, with the frame's measured room capacity
 *    beside it (`--stage=roomcap`: 6 / 4 / 4 / 6 disjoint rooms; F-L31-1, `§8.20`). So the finale's
 *    claim is a **census question**, never a wish: *does 7×7 at `CX = 1` admit the 4-pocket device
 *    at all, and inside the act's par band?*
 * 2. **The par axis**: the act's **band-ceiling `par 24`** (§7.8 item 2) carried by the **closing
 *    rung**, with the batch's own **P2-exact** ladder (rule 2) — a property no Act II batch has.
 *
 * Stated as a sentence, the act's close reads: **it closes on the act's deepest lawful ordered
 * chain, on the act's largest lawful board (49 tiles), at the act's own band-ceiling par.**
 * Whether that close **also** carries the act's `D_exec` maximum is a **measurement reported
 * either way** — `D_exec = par + 3·B` (§7.5 item 1's measured theorem) and the deeper families
 * measure a **lower** `B` centre (batch 3: `1.3500 … 1.4465`), so a finale that does not exceed
 * `28.339426` is an honest, likely outcome: it is then reported as a **named act-shape finding**
 * (`act-close` already discharged at L35, inside the last two batches), **never** repaired by
 * padding a par or re-banding a rung.
 *
 * ── THE DEVICE (the named plan shape, written before the search) ──────────────────
 *
 * ```
 *   P   landing pocket   exit d1 (its whole boundary)         press s1 ∈ P
 *   F   free band        press s2 ∈ F  → drives d2             [reachable once d1 opens]
 *   R2  second pocket    exit/entrance = d2 (whole boundary)   press s3 ∈ R2 → drives d3
 *   R3  third pocket     exit/entrance = d3 (whole boundary)   press s4 ∈ R3 → drives d4
 *   R4  fourth pocket    exit/entrance = d4 (whole boundary)   press s5 ∈ R4 → drives d5
 *   G   the goal         every walk-neighbour is a d5 tile
 * ```
 *
 * Identity with batch 3's **device class** is stated rather than implied: the class is §7.2's
 * family ceiling and batch 3 already proved it on 7×6 — what this batch changes is the **frame**
 * (§7.4's second member), the **par derivation** (P2-exact, rule 2) and the rungs themselves.
 * The rungs are still censused against the §6.1.4 **seal-inclusive key** of **every registered
 * file**, so no rung may re-stamp a shipped board (the guard is a filter, and its collisions are
 * printed, never hidden).
 *
 * ── BATCH 4'S SELECTION RULE — published here before any census or any byte ──────
 *
 * 1. **Frame and device.** §7.4's `7×7` (the axis's second member) at `CX = 1`, the **4-pocket /
 *    5-door / 5-press** member (§7.2's family ceiling). The `--pocketsize=4`, `--qmax=4`,
 *    `--paircap` / `--budget` / `--cap` bounds of the earlier passes are kept unchanged so the
 *    class stays comparable; every counter is printed beside every count.
 * 2. **The par ladder is DERIVED, and it is the P2-exact one.** §7.2's batch size is **5** and
 *    §7.2/§7.9 give the par band's integer endpoints as `[ACT_II_PAR_FLOOR, ACT_II_PAR_CEILING] =
 *    [16, 24]` (inclusive). §6.1.1's **P2** is the only published clause that makes an in-block
 *    rise a *guarantee* rather than a measurement: `Δpar ≥ 2`, because `3·B`'s measured spread is
 *    `1.3125 < 2`. A five-member ladder whose every step is exactly P2's minimum spans
 *    `4 × 2 = 8 = 24 − 16` — the band's own width — so it must **be** the band's two endpoints with
 *    every step 2: **`[16, 18, 20, 22, 24]`**, and this is **UNIQUE** (any five members with all
 *    steps `≥ 2` inside the band have span `≥ 8`, hence use both endpoints and leave no room for a
 *    step above 2; a member outside the band is refused by the band gate, §7.5 item 1). Adopted as
 *    **derived** (the §6.1.1 uniqueness style — `4, 6, 8, 10` was adopted the same way), never
 *    approved by taste. This closes §7.8 item 4's anti-mirror clause **by construction**: the batch
 *    does not mirror a registered ladder, it recomputes one from the band and P2.
 * 3. **Pool filter (batch 3's clause, kept).** A par with an **empty** accept pool is **ABSENT**
 *    from the ladder and is **never substituted**; the remaining rungs are filled by repeating the
 *    ladder's **own highest supported par, descending** — the act's ceiling first, because §7.3.2
 *    asks the act's maximum to be carried **late**. Every repeat prints its reason.
 * 4. **Ordering and tie-break.** Ascending par; within a par, minimal `D_exec` then enumeration
 *    order (batch 1/2/3's rule), with the same **published departure**: the batch's **last rung
 *    takes the within-par maximum `D_exec`** so the act's maximum is carried by the closing rung
 *    (§7.3.2 read as a selection rule). Every departure is printed beside the ladder.
 * 5. **Bands and gates are filters, never preferences** (§7.5 item 1): `par ∈ [16, 24]`,
 *    `D_exec ∈ [19.75, 29.0625]` **derived-exact** (§7.9 — compared against the law module's
 *    constants, never against a printed form), `B ∈ [1.2500, 1.6875]`, `T ≡ R ≡ 0`, coverage
 *    `49/49` on the 7×7 frame, `switchRequired` **measured** as the all-OFF world, and the `g0`–`g6`
 *    family gates by name.
 * 6. **§6.1.4 clone filter.** Each rung's seal-inclusive key must be free of **every registered
 *    key** and of its four siblings'; the census prints the distinct-key count and every collision
 *    (there is no silent filter). The five rungs must carry five distinct keys.
 * 7. **No fabricated `act-close` branch.** §7.3.2's obligation is already satisfied inside the last
 *    two batches (L35), so this ticket adds **no** refusal clause — a clause here would be a gate
 *    invented to be passed. The measured maximum is **printed as a reading** (vs the registered
 *    tail, vs batch 1's peak, vs Act I's peak) and reported per batch (§7.8 item 6).
 * 8. **Empty-pool honesty (published fallback, in order).** If the 7×7 frame yields **no** in-band
 *    accept at all, the batch is **not** padded: the census is reported as a named **act
 *    limitation**, and the *only* published fallback is to re-run the **same derived ladder and
 *    device on the only other frame this device has ever been non-empty on** (`CX = 1`, `7×6` —
 *    batch 3's frame), with every key re-checked against the registered set; if that too is empty,
 *    nothing is written and the Game Designer is briefed. A borrowed par, a re-banded act or a
 *    copied ladder is not a remedy.
 * 9. **Relief label before bytes.** L36's `D_exec` will sit below the registered tail
 *    `ACT_II_R005A_REGISTERED_TAIL_EXEC` (28.339426) on any plausible ladder, so §7.8 item 5 fires:
 *    the `L35 → L36` seam takes a **§7.3.1-form** label published in the census dossier **before
 *    `--write`**, with `Δpar` / `3·ΔB` / `ΔD_exec` decomposed so it cannot be read as a designed dip.
 * 10. **Deferred, with its scope stated.** The `--pocketsize ≥ 11` probe stays **DEFERRED**:
 *    `≤ 10` was closed by measurement (`scripts/author-l20-p10.transcript.md` §10), **`≥ 11` remains
 *    unmeasured**, and **no ceiling wording is published in either direction** (item 114's law).
 *
 * The census commands, also published before the run (they are what the dossier quotes):
 *
 * ```
 *   STEP 1 — the frame's capacity and the par-24 obligation at the NEW frame:
 *     a) npx tsx scripts/author-l21.ts --stage=roomcap --cx=1 --h=7 --maxsize=4
 *     b) npx tsx scripts/author-l21.ts --stage=g --batch=4 --pockets=4 --cx=1 --h=7 \
 *          --pocketsize=4 --qmax=4 --paircap=40 --budget=8000 --cap=400 --parmin=24 --parmax=24
 *   STEP 2 — the batch's own pool over the full act band, on its own frame:
 *     c) npx tsx scripts/author-l21.ts --stage=g --batch=4 --pockets=4 --cx=1 --h=7 \
 *          --pocketsize=4 --qmax=4 --paircap=40 --budget=20000 --cap=400 --parmin=16 --parmax=24
 *   STEP 3 — the selection (dry run, then --write):
 *     d) npx tsx scripts/author-l21.ts --stage=s --batch=4 --parmin=16 --parmax=24 \
 *          --accepts=<c's dump>
 *     e) npx tsx scripts/author-l21.ts --stage=s --batch=4 --parmin=16 --parmax=24 --write \
 *          --accepts=<c's dump>
 * ```
 *
 * ── AMENDMENT — FINDING F-L36-1, published BEFORE the fix byte and before any board byte ──
 *
 * The commands above were run, and their readings **contradict the rule published above them**:
 * batch 4's census returned accepts at **`par 24` only** (STEP 1b `185` accepts of `8000` judged;
 * STEP 2 `234` of `20000`), i.e. the derived P2-exact ladder `[16, 18, 20, 22, 24]` is reported
 * with **four empty pools** and rule 3 pads it to `[24, 24, 24, 24, 24]` — while rule 9 (written
 * before the run) *predicts* that `L36` sits **below** `28.339426` and that §7.8 item 5 therefore
 * fires. A rule that predicts a low opening rung and a census that can only produce the ceiling
 * cannot both be describing the same instrument. It is the **instrument** that is wrong, and the
 * fault is named here rather than absorbed into the batch.
 *
 * 1. **What is wrong.** `measureCut()` (this file) excludes `BLOCK_L1619_IDS` and
 *    **`ACT_II_B1_IDS` only**, so with `L26`–`L35` in the root the cut basis became
 *    `[1…15, 26…35]` and `cut.floor` became **28.339426** (= `L35`). The header line prints that
 *    number as *"D_exec max over the L1–L15 basis"* while the same line prints the basis ids —
 *    **the label and the measurement disagree on screen**, which is why the fault was findable
 *    without reading the code.
 * 2. **Why it is a defect and not a rule.** The cut is defined as *the world the candidate climbs
 *    out of*, frozen at `L1–L15 = 14.969697`; §7.3's own escalation for an act is the `act-peak`
 *    clause, **never the cut**. `scripts/prove-candidate.ts`'s `measureCut()` already excludes
 *    **`ACT_II_REGISTERED_IDS`** and carries an R-005a doc note describing *exactly this failure*:
 *    *"the cut basis read 28.339426 and EVERY new rung was refused by `escalation D_exec > CUT
 *    28.339426`"*. So **R-005a applied the fix to the prover and not to the generator** — one
 *    instrument, two call sites, one of them left behind. (Third occurrence of one mechanism: the
 *    R-003c/R-003d lesson, then the R-004a lesson, now R-005a's.)
 * 3. **The measured consequence, which is what makes it batch-fatal rather than cosmetic.** The
 *    `escalation` gate is `dexec > ctx.cut.floor`, so pre-fix it silently means
 *    *"`D_exec` > the registered Act II tail `28.339426`"*. With §7.5 item 1's measured collapse
 *    `D_exec = par + 3·B` and `B ≤ 1.6875`, the gate forces `par > 28.339426 − 3·1.6875 =
 *    23.276374`, i.e. **`par ≥ 24`** — the census's accept pool is truncated to the band ceiling
 *    **by filter**, and nothing about the `7×7` frame is being measured at all:
 *    - **`7×7`, band `16–24`, batch-4 ids** → `234` accepts of `20000` judged, **all `par 24`**;
 *      refusals `par-out-of-band 9989 · unsolvable 6643 · escalation 1857 ·
 *      escalation+g5-identity-broken 1232 · g5-identity-broken 45`.
 *    - **`7×6`, band `16–24`, batch-4 ids** (the identical command that produced batch 3) →
 *      **`0 accept(s)` of `20000` judged**, `in-band candidates refused by a gate: 1218`, every
 *      listed one `[escalation]`, and the histogram's `escalation: 498`.
 *    - **That `498` is the receipt.** Batch 3's LV-015 record for the *identical* command with
 *      only the batch id changed (`--batch=3`) is **`498 accepts` of `20000` judged**. The same 498
 *      boards, accepted at `L31`'s ids and refused at `L36`'s ids, by the cut floor alone — a
 *      one-to-one A/B, not an argument.
 * 4. **The counter-reading, and why it loses.** One could call the truncation *correct* on the
 *    ground that a shelf rung must sit above the registered root max. It is not: that relation is
 *    an **id** relation, and the machine pin says so — `tests/solver/l16-l20-candidates.test.ts`
 *    asserts `expect(id, "…sits at or below the registered root max…").toBeGreaterThan(rootMax)`
 *    over the shelf's **file names**, and its sibling row compares `maxShipped` to the *pinned
 *    count*. Batch 3's own lawfully registered `L31` sits at `23.204167`, **below** the
 *    then-registered root max `27.604651` — so no rule, pin or precedent makes a shelf rung's
 *    `D_exec` exceed the registered max. A `D_exec` floor at the act tail would be a **new
 *    obligation invented by an instrument accident**, and inventing one here is exactly the class
 *    of fault `--pocketsize ≥ 11`'s ceiling wording (item 114) forbids.
 * 5. **The fix, in the next commit, is one line and it is not a tuning.** `measureCut()` excludes
 *    `ACT_II_REGISTERED_IDS` — the same named law constant `prove-candidate.ts` reads — restoring
 *    the floor to `14.969697` and making the generator and the prover judge against the **same**
 *    cut. **Revert path:** restoring `ACT_II_B1_IDS` restores `28.339426` and re-truncates the pool
 *    to `par 24`; both directions are re-measured, never remembered.
 * 6. **What is published, and in what order.** This finding is a docstring-only commit, so
 *    *"the fault was written down before the line that fixes it moved"* is checkable in
 *    `git log -p`; the fix commit follows, then the post-fix census, then the dossier and the
 *    §7.3.1 relief label of rule 9, and **only then** the bytes. Every pre-fix reading quoted
 *    above is kept in the dossier **beside** its post-fix counterpart: a batch that reports only
 *    the census taken after the instrument was repaired is reporting the half it likes.
 * 7. **What the finder must not do.** The finding does **not** license a rule change: rule 2's
 *    P2-exact derivation, rule 3's empty-pool clause, rule 4's closing-rung maximum and rule 9's
 *    relief are unchanged, and no par, band, gate or registered number is touched. If the post-fix
 *    census still supports only the ceiling par, that stands as the act's measured shape — and the
 *    section 7.8 item 2 obligation it would leave is a Game Designer question, not a solver's.
 *
 * Stages:
 *
 *   0.  **preflight law** — the parity/judging-phase rule re-derived from the shipped
 *       boards (never quoted).
 *   0b. **clone-guard census** — §6.1.4 over the stricter seal-inclusive key
 *       `player|goal|portal-pair|door-tiles`.
 *   0c. **frame census** (`--stage=frame`) — the far-frame phase law
 *       `stand(t) = arrivalPhase ⊕ parity-distance` **measured** against a BFS of the
 *       bare board (no doors, no switches), so the construction's phase arithmetic is
 *       a readable measurement rather than an assumption.
 *   p.  **pocket census** (`--stage=p`) — every leak-free room up to `--pocketsize`
 *       on the activation set (the same measurement stage SL's P inventory uses).
 *   g.  **G lattice** (`--stage=g`, default) — device × `s1` × `Q` × `s2` × goal ×
 *       `sg`, each tuple re-derived and judged; the par band is the **filter**
 *       (probe first, gates only on in-band boards), and accepts are dumped with
 *       their measurements for the selection stage.
 *   s.  **selection** (`--stage=s --accepts=…`) — picks the five rungs L21–L25 from
 *       the accept dump by a **derived, published rule**: pars strictly inside the
 *       act band, `D_exec` strictly rising along the batch, and the par-step rule
 *       maximised (see {@link selectBatch}).
 *   v.  **verify** (`--stage=v`) — re-read the written artifacts and re-run the whole
 *       chain + negative controls on the bytes.
 *
 * Solvability is never asserted here: `par` comes from the BFS solver, every gate
 * number from the shipped readers, and a candidate that fails is **dropped with its
 * measurement** (ADR-0004 — no repair path, no tuning loop).
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import type { Coord, DoorDef, Level, Phase, SwitchDef } from "@/core/level";
import { LevelSchema, coordKey, validateLevel } from "@/core/level";
import type { ReachableGraph } from "@/core/solver/bfs";
import { analyse, explore, forEachParRoute, goalReachableWithAllSwitchesOff } from "@/core/solver/bfs";
import { applyMove, isLegalMove, solidAt } from "@/core/rules";
import { DIRECTIONS, move } from "@/core/state/move";
import { hashState } from "@/core/state/hash";
import { initialState } from "@/core/state";
import type { SearchState } from "@/core/state/types";
import { analyseDifficulty } from "@/core/solver/difficulty";
import {
  ACT_II_B1_IDS,
  ACT_II_B1_LADDER,
  ACT_II_B1_REGISTERED_PEAK_EXEC,
  ACT_II_B2_B3_LADDER,
  ACT_II_EXEC_BAND,
  ACT_II_PAR_BAND,
  ACT_II_PAR_CEILING,
  ACT_II_PAR_FLOOR,
  ACT_II_R005A_REGISTERED_TAIL_EXEC,
  ACT_II_REGISTERED_IDS,
  ACT_I_REGISTERED_PEAK_EXEC,
  BLOCK_L1619_B_BAND,
  BLOCK_L1619_IDS,
  BLOCK_L1619_PAR_BASE,
  BLOCK_L1619_TAIL_EXEC_CEILING,
  allOffShortestSolution,
  auditLevel,
  firingSwitches,
} from "@/core/solver/policy";

const LEVELS_DIR = fileURLToPath(new URL("../src/levels/", import.meta.url));
const OUT_DIR = fileURLToPath(new URL("../src/levels/candidates/", import.meta.url));
const WRITE = process.argv.includes("--write");
const argOf = (name: string): string | null => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit === undefined ? null : hit.slice(name.length + 3);
};
const STAGE = argOf("stage") ?? "g";
/**
 * The **batch** this command authors. 1 = Act II batch 1 (L21–L25, registered at R-004a);
 * 2 = **Act II batch 2 (L26–L30, this ticket)**. It fixes (a) which ids the selection
 * writes, and (b) the draft id handed to the validator/`auditLevel` — with L21–L25 now
 * *registered*, a draft carrying id 21 is judged by `act2Batch1Gates()` (the registered
 * rung ladder) and every candidate of a *new* batch is refused by an artefact of the id
 * alone. Measured, not assumed: the 2-pocket census at id 21 returns **0 accepts of 9570
 * judged** with `validator` firing on `gate-act2-registered-rung / -exec-band / -b-band`,
 * and the same census at the batch-2 id returns the LV-012 accept class (§ the pass's own
 * transcript).
 */
const BATCH = Number(argOf("batch") ?? "1");
/**
 * `--pockets=2` = batch 1's device (P + Q + goal seal, 3 presses); `3` = the chained sub-lattice
 * (P + R2 + R3 + goal seal, 4 presses); `4` = the family ceiling (P + R2 + R3 + R4 + goal seal,
 * 5 presses) — **batches 3 and 4 share this device class**, and what separates them is the
 * **frame** (§7.4's `7×6 → 7×7`; batch 4 takes the second member) and the **par derivation**
 * (batch 4's own P2-exact ladder, header rule 2).
 */
const POCKETS = Number(argOf("pockets") ?? "2");
const ACCEPTS =
  argOf("accepts") ??
  `/private/var/folders/8q/vcsvjc5x679d629rzrj8d57w0000gp/T/lv012-b${String(BATCH)}-accepts.json`;

const W = Number(argOf("w") ?? "7");
const H = Number(argOf("h") ?? "6");
const CX = Number(argOf("cx") ?? "3");
const POCKET_MAX = Number(argOf("pocketsize") ?? "4");
const QMAX = Number(argOf("qmax") ?? "4");
const CAP = Number(argOf("cap") ?? "400");
/**
 * The batch-2 census bounds (see the header's published restrictions). `PAIR_CAP` is the
 * (`R2`,`R3`) room pairs tried per device; `BUDGET` is the whole run's judged-tuple ceiling.
 * Both are printed with their hit counters, so a truncated census can never be read as a
 * completed class.
 */
const PAIR_CAP = Number(argOf("paircap") ?? "60");
const BUDGET = Number(argOf("budget") ?? "3000");
/** The Act II par band, strictly inside (§7.2 band 16–24; the dispatch's obligation). */
const PAR_MIN = Number(argOf("parmin") ?? "17");
/**
 * The batch's first rung id and its rung count. Batch 1 = L21–L25 (registered, R-004a);
 * batch 2 = **L26–L30** (this ticket, shelf candidates only — registration is a later
 * train, so nothing here widens a registered ceiling).
 */
const BATCH_FIRST_ID = BATCH === 4 ? 36 : BATCH === 3 ? 31 : BATCH === 2 ? 26 : 21;
const RUNG_COUNT = 5;
const PAR_MAX = Number(argOf("parmax") ?? "23");
/** The Act II `D_exec` band (§7.2, derived from the measured `B` band).
 *
 * **Read from the law module, never re-typed (LV-016 / §7.9).** This line used to be the
 * literal `[19.75, 29.06]` — §7.2's *printed rounding* of the derived-exact
 * `[19.75, 29.0625]`. That is the defect §7.9 names: a printed band value used as a
 * comparison operand leaves the `(29.06, 29.0625]` sliver inadmissible, i.e. §7.8 item 2's
 * own `par 24` mandate unbuildable at its top. The census/selection filters below (`>=`/`<=`
 * at 1216/2554) now compare against the derived-exact constant by construction.
 */
const ACT2_EXEC_BAND: readonly [number, number] = ACT_II_EXEC_BAND;

const at = (px: number, py: number): Coord => [px, py];
const x = (c: Coord): number => c[0];
const y = (c: Coord): number => c[1];
const parity = (c: Coord): number => (x(c) + y(c)) % 2;
const flip = (p: Phase): Phase => (p === "A" ? "B" : "A");
const adjacent = (a: Coord, b: Coord): boolean =>
  Math.abs(x(a) - x(b)) + Math.abs(y(a) - y(b)) === 1;
const PLAYER = at(0, 0);
const START_PHASE: Phase = "A";

// ─────────────────────────────────────────────────────────────────────────────
// 0. Preflight + the measured basis (never typed)
// ─────────────────────────────────────────────────────────────────────────────

function shipped(): { file: string; level: Level }[] {
  return readdirSync(LEVELS_DIR)
    .filter((n) => /^l\d+\.json$/.test(n))
    .sort()
    .map((file) => ({
      file,
      level: LevelSchema.parse(JSON.parse(readFileSync(join(LEVELS_DIR, file), "utf8"))) as Level,
    }));
}

/** The parity law the whole construction rests on, re-derived from the shipped boards. */
function preflightLaw(): { boards: number; states: number; moves: number; bimodal: number } {
  let states = 0;
  let moves = 0;
  let bimodal = 0;
  const boards = shipped();
  for (const { level } of boards) {
    const graph = explore(level);
    states += graph.nodes.length;
    const phases = new Map<string, Set<Phase>>();
    for (const s of graph.nodes) {
      for (const d of DIRECTIONS) {
        if (!isLegalMove(level, s, move(d))) continue;
        moves += 1;
        const n = applyMove(level, s, move(d));
        const key = coordKey([n.player.x, n.player.y] as Coord);
        const set = phases.get(key) ?? new Set<Phase>();
        set.add(s.phase);
        phases.set(key, set);
      }
    }
    if (level.portals.length === 0) {
      for (const [, set] of phases) if (set.size > 1) bimodal += 1;
    }
  }
  return { boards: boards.length, states, moves, bimodal };
}

/**
 * The two ceilings the batch is judged against, **re-measured from the root bytes on
 * every run**:
 * - `cut` = `max D_exec` over the L1–L15 basis (the registered L16–L20 ladder **and**
 *   the registered Act II batch-1 rungs excluded, exactly as `scripts/prove-candidate.ts`'s
 *   `measureCut()` reads it: a registered block must not raise the filter judged against
 *   it — the R-003d lesson, then the R-004a lesson one registration later);
 * - `actI` = Act I's **measured maximum** `D_exec` over ids 1–20 — the number
 *   `docs/level-design.md` §7.3's `act-peak` clause compares against (24.729412 at
 *   R-003d, re-derived here rather than typed).
 *
 * LV-014 instrument fix, named rather than silent: before this pass the exclusion list
 * carried only `BLOCK_L1619_IDS`, so with L21–L25 registered (R-004a) the authoring tool
 * measured the cut as **27.604651** — batch 1's own peak — and refused every in-band
 * candidate below it by `escalation`. That is the identical instrument artefact R-004a
 * fixed on the proving side, and the fix is the same one: exclude the registered act
 * batch from the basis (the act's own escalation is §7.3's `act-peak`, never the cut).
 */
function measureCut(): {
  floor: number;
  actI: number;
  l15Par: number;
  basis: readonly number[];
  bBand: readonly [number, number];
  /**
   * **F-L36-1's receipt, printed on every run.** The floor the *pre-fix* exclusion list
   * produced — the registered L16–L20 ladder **and** only Act II batch 1 excluded, so the
   * registered batches 2 + 3 fall into the basis. Kept as a printed reading rather than a
   * comment because the two numbers must never be able to agree silently: they are equal
   * exactly when no Act II rung above batch 1 is registered, and a future registration
   * that forgets this instrument again makes the pair diverge **on screen**.
   */
  staleFloor: number;
} {
  let floor = Number.NEGATIVE_INFINITY;
  let actI = Number.NEGATIVE_INFINITY;
  let l15Par = 0;
  let bMin = Number.POSITIVE_INFINITY;
  let bMax = Number.NEGATIVE_INFINITY;
  let staleFloor = Number.NEGATIVE_INFINITY;
  const basis: number[] = [];
  for (const { level } of shipped()) {
    if (level.id <= 20) {
      const d = analyseDifficulty(level, explore(level));
      if (d.Dexec !== null && d.Dexec > actI) actI = d.Dexec;
    }
    if (BLOCK_L1619_IDS.includes(level.id)) continue;
    const d = analyseDifficulty(level, explore(level));
    // the pre-F-L36-1 basis: everything that is not the block and not batch 1
    if (!ACT_II_B1_IDS.includes(level.id) && d.Dexec !== null && d.Dexec > staleFloor) {
      staleFloor = d.Dexec;
    }
    /**
     * **F-L36-1 (fixed).** This line used to exclude `ACT_II_B1_IDS` alone. R-005a then
     * registered L26–L35, so the basis silently became `[1…15, 26…35]`, `floor` became
     * L35's own `28.339426`, and the `escalation` gate below — `dexec > ctx.cut.floor` —
     * became *"`D_exec` > the registered Act II tail"*: with `D_exec = par + 3·B` and
     * `B ≤ 1.6875` that forces `par ≥ 24` and truncates the accept pool to the band
     * ceiling **by filter**. It is the third occurrence of one mechanism (R-003c/R-003d,
     * then R-004a, now R-005a) and R-005a had already applied the fix on the proving side:
     * `scripts/prove-candidate.ts`'s `measureCut()` reads the law's own
     * `ACT_II_REGISTERED_IDS` and carries a note describing this exact failure. The
     * generator reads the same constant now, the floor is back to the frozen L1–L15 basis,
     * and the two instruments judge against the **same** cut. Revert path: swapping this
     * back to `ACT_II_B1_IDS` restores `28.339426` and re-truncates the census — both
     * directions were re-measured, never remembered (see the header's FINDING block).
     */
    if (ACT_II_REGISTERED_IDS.includes(level.id)) continue;
    basis.push(level.id);
    if (d.Dexec !== null && d.Dexec > floor) floor = d.Dexec;
    if (d.B < bMin) bMin = d.B;
    if (d.B > bMax) bMax = d.B;
    if (level.id === 15) l15Par = level.par;
  }
  return { floor, actI, l15Par, basis, bBand: [bMin, bMax], staleFloor };
}

// ─────────────────────────────────────────────────────────────────────────────
// 0b. The clone guard — §6.1.4, read over the seal geometry too
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The stricter seal-inclusive geometry key (`scripts/author-l20.ts`, §6.1.4): a board
 * that re-stamps L19's or L20's geometry on a fresh player/goal/portal triple is
 * exactly the construction the law refuses ("never clone a shipped board, never
 * re-stamp L20"), and this census is what catches it. Door tiles are included, so the
 * rooms count.
 */
function cloneKeyOf(level: Level): string {
  const p = level.portals[0];
  const doors = level.doors.flatMap((d) => d.tiles.map(coordKey)).sort().join("+");
  return [
    coordKey(level.player),
    coordKey(level.goal),
    p === undefined ? "-" : coordKey(p.pair[0]),
    p === undefined ? "-" : coordKey(p.pair[1]),
    doors,
  ].join("|");
}

/**
 * The shelf's candidate files. `forSelection` drops **the batch under construction** — every
 * candidate whose id is ≥ `BATCH_FIRST_ID` (26 for batch 2, 21 for batch 1). The guard's law
 * is "never clone a shipped board or a *previously landed* candidate"; the batch's own five
 * files are this command's OUTPUT, so reading them back would make the tool refuse the ladder it
 * just wrote and the run non-reproducible from its own record. A later batch (L31–L35) still
 * guards against L26–L30, because by then ids 26–30 are below its own `BATCH_FIRST_ID`.
 */
function candidateFiles(forSelection = false): string[] {
  return readdirSync(OUT_DIR)
    .filter((n) => /^l\d+\.json$/.test(n))
    .filter((n) => !forSelection || Number(/^l(\d+)\.json$/.exec(n)?.[1] ?? "0") < BATCH_FIRST_ID)
    .sort();
}

function cloneGuardCensus(forSelection = false): Map<string, string> {
  const used = new Map<string, string>();
  for (const { file, level } of shipped()) used.set(cloneKeyOf(level), file);
  for (const file of candidateFiles(forSelection)) {
    const level = LevelSchema.parse(JSON.parse(readFileSync(join(OUT_DIR, file), "utf8"))) as Level;
    used.set(cloneKeyOf(level), `candidates/${file}`);
  }
  return used;
}

// ─────────────────────────────────────────────────────────────────────────────
// The grid: the frame the device lives in (7 × 6, sealed column at x = CX)
// ─────────────────────────────────────────────────────────────────────────────

const LEFT_TILES: readonly Coord[] = (() => {
  const out: Coord[] = [];
  for (let py = 0; py < H; py += 1) for (let px = 0; px < CX; px += 1) out.push(at(px, py));
  return out;
})();
const FAR_TILES: readonly Coord[] = (() => {
  const out: Coord[] = [];
  for (let py = 0; py < H; py += 1) for (let px = CX + 1; px < W; px += 1) out.push(at(px, py));
  return out;
})();

/**
 * The sealed column at `x = CX`, split by the inherited derivation: a tile entered
 * from the start region always happens in `entryPhase(T)`, so a wall in its own entry
 * phase is parity-dead from that side (an ordinary permanent wall, ADR-0009) — while
 * the far region reaches the same tile from the other side, where the portal has
 * shifted the parity frame, which is what keeps coverage at 42/42.
 */
const COLUMN = (() => {
  const a: Coord[] = [];
  const b: Coord[] = [];
  for (let py = 0; py < H; py += 1) {
    const d = Math.abs(CX - x(PLAYER)) + Math.abs(py - y(PLAYER));
    const entry: Phase = d % 2 === 1 ? START_PHASE : flip(START_PHASE);
    (entry === "A" ? a : b).push(at(CX, py));
  }
  return { a, b };
})();

/** `entryPhase(near)` — the phase a first entry into a left-region tile always happens in. */
const nearEntryPhase = (near: Coord): Phase => (parity(near) === 1 ? START_PHASE : flip(START_PHASE));
/** The phase the player is IN after the teleport (`applyMove` flips after the teleport). */
/** The phase the player is IN after the teleport (`applyMove` flips after the teleport). */
const _arrivalPhaseOf = (near: Coord): Phase => flip(nearEntryPhase(near));
void _arrivalPhaseOf;

/**
 * The far region's phase law, derived from the grid's bipartiteness: every move flips
 * the phase, so `stand(t) = arrivalPhase ⊕ (moves from the landing mod 2)`, and on a
 * bipartite grid that parity is `(x+y)` parity — path-independent. Hence
 * `stand(t) = arrivalPhase` iff `parity(t) === parity(landing)`, else its flip.
 *
 * A **proposal**: `--stage=frame` measures it against a BFS of the bare board, and
 * every gate re-reads the real rules.
 */
const standPhase = (landing: Coord, arrivalPhase: Phase, t: Coord): Phase =>
  parity(t) === parity(landing) ? arrivalPhase : flip(arrivalPhase);
const farEntryPhase = (landing: Coord, arrivalPhase: Phase, t: Coord): Phase =>
  flip(standPhase(landing, arrivalPhase, t));

const _doorOpenIn = (color: DoorDef["color"], p: Phase): boolean =>
  color === "red" ? p === "A" : p === "B";
void _doorOpenIn;
/** The colour whose base is CLOSED in phase `p` — a door that refuses `p`. */
const closedIn = (p: Phase): DoorDef["color"] => (p === "A" ? "blue" : "red");

/** Every legal move out of a state, as successor states (the shipped rule decides). */
function successors(level: Level, s: SearchState): SearchState[] {
  const out: SearchState[] = [];
  for (const d of DIRECTIONS) {
    if (!isLegalMove(level, s, move(d))) continue;
    out.push(applyMove(level, s, move(d)));
  }
  return out;
}

const allOff = (level: Level, s: SearchState): boolean =>
  level.switches.every((sw) => s.switchesOn[sw.id] !== true);

/** In-bounds neighbours of `t` inside the walkable far region (`x > CX`). */
function walkNeighbours(t: Coord): Coord[] {
  const out: Coord[] = [];
  for (const d of DIRECTIONS) {
    const n = at(
      x(t) + (d === "left" ? -1 : d === "right" ? 1 : 0),
      y(t) + (d === "up" ? -1 : d === "down" ? 1 : 0),
    );
    if (x(n) < 0 || y(n) < 0 || x(n) >= W || y(n) >= H) continue;
    if (x(n) <= CX) continue;
    out.push(n);
  }
  return out.sort((a, b) => coordKey(a).localeCompare(coordKey(b)));
}

/** In-bounds neighbours of `t` (grid-wide; used only for data-side geometry). */
function gridNeighbours(t: Coord): Coord[] {
  const out: Coord[] = [];
  for (const d of DIRECTIONS) {
    const n = at(
      x(t) + (d === "left" ? -1 : d === "right" ? 1 : 0),
      y(t) + (d === "up" ? -1 : d === "down" ? 1 : 0),
    );
    if (x(n) < 0 || y(n) < 0 || x(n) >= W || y(n) >= H) continue;
    out.push(n);
  }
  return out.sort((a, b) => coordKey(a).localeCompare(coordKey(b)));
}

// ─────────────────────────────────────────────────────────────────────────────
// Rooms — what a walk-sealed room IS, measured (never argued)
// ─────────────────────────────────────────────────────────────────────────────

interface Room {
  /** The room's tiles (the interior — the door tiles are the boundary, not the room). */
  readonly tiles: readonly Coord[];
  /** Every in-region neighbour outside the room: each is an exit, and each must be a door tile. */
  readonly boundary: readonly Coord[];
  /**
   * The single phase in which every boundary tile is *entered* from the room (the
   * room's own stand phase). A single-colour door can only refuse in one phase, so a
   * two-phase boundary leaks, and the leak is a free exit that would make the press
   * non-mandatory (`scripts/author-l20.ts` `sealedPocket`).
   */
  readonly entryPhase: Phase;
}

/**
 * Measure a tile set as a room: connected, non-empty boundary (every neighbour in the
 * region is an exit), and a **single-phase boundary** — every boundary tile's adjacent
 * room tiles share one parity, i.e. one phase.
 */
const ROOM_FAIL = new Map<string, number>();
const roomFail = (reason: string): null => {
  ROOM_FAIL.set(reason, (ROOM_FAIL.get(reason) ?? 0) + 1);
  return null;
};

function roomFrom(
  tiles: readonly Coord[],
  arrivalPhase: Phase,
  landing: Coord,
): Room | null {
  if (tiles.length === 0) return roomFail("empty");
  const inside = new Set(tiles.map(coordKey));
  // connectivity (a room is a connected set: the flood from its first tile must reach it all)
  const seen = new Set<string>([coordKey(tiles[0] as Coord)]);
  const q: Coord[] = [tiles[0] as Coord];
  for (let i = 0; i < q.length; i += 1) {
    const t = q[i] as Coord;
    for (const f of tiles) {
      if (seen.has(coordKey(f)) || !adjacent(t, f)) continue;
      seen.add(coordKey(f));
      q.push(f);
    }
  }
  if (seen.size !== tiles.length) return roomFail("disconnected");
  const boundaryMap = new Map<string, Coord>();
  for (const t of tiles) {
    const here = standPhase(landing, arrivalPhase, t);
    for (const d of DIRECTIONS) {
      const n = at(
        x(t) + (d === "left" ? -1 : d === "right" ? 1 : 0),
        y(t) + (d === "up" ? -1 : d === "down" ? 1 : 0),
      );
      if (x(n) < 0 || y(n) < 0 || x(n) >= W || y(n) >= H) continue;
      if (inside.has(coordKey(n))) continue;
      if (x(n) < CX) return roomFail("left-region-neighbour"); // the left region is not the far frame's business
      if (x(n) === CX) {
        // The column can hold no door (door ∩ wall is a hard error, LV-005), so the tile is
        // an exit iff it is *passable* in the phase the step would happen in (`here`). A wall
        // solid in `here` is not an exit (the same rule `scripts/author-l20.ts` `pocketLeaks`
        // applies); a passable column echo IS — the player steps onto it, flips, and walks off
        // into the region — so the room is not sealable and is rejected here.
        const wallPhase: Phase = COLUMN.a.some((c2) => coordKey(c2) === coordKey(n)) ? "A" : "B";
        if (wallPhase === here) continue;
        return roomFail("column-leak");
      }
      boundaryMap.set(coordKey(n), n);
    }
  }
  const boundary = [...boundaryMap.values()].sort((a, b) => coordKey(a).localeCompare(coordKey(b)));
  if (boundary.length === 0) return roomFail("no-boundary");
  const phases = new Set<Phase>();
  for (const b of boundary) {
    const inner = tiles.filter((t) => adjacent(t, b));
    const parities = new Set(inner.map(parity));
    if (parities.size !== 1) return roomFail("two-phase-boundary"); // one door cannot seal it
    phases.add(standPhase(landing, arrivalPhase, inner[0] as Coord));
  }
  if (phases.size !== 1) return roomFail("mixed-entry-phase");
  return { tiles: [...tiles].sort((a, b) => coordKey(a).localeCompare(coordKey(b))), boundary, entryPhase: [...phases][0] as Phase };
}

/** Every connected tile set of size 2..`maxSize` drawn from `pool` (enumeration order = sorted pool). */
function roomCandidates(pool: readonly Coord[], maxSize: number): Coord[][] {
  const out: Coord[][] = [];
  const grow = (tiles: Coord[]): void => {
    if (tiles.length >= 2) out.push([...tiles]);
    if (tiles.length >= maxSize) return;
    for (const p of pool) {
      if (tiles.some((t) => coordKey(t) === coordKey(p))) continue;
      if (!tiles.some((t) => adjacent(t, p))) continue;
      if (tiles.some((t) => coordKey(t).localeCompare(coordKey(p)) >= 0)) continue; // canonical order
      tiles.push(p);
      grow(tiles);
      tiles.pop();
    }
  };
  for (let i = 0; i < pool.length; i += 1) grow([pool[i] as Coord]);
  return out;
}

/**
 * The **chain-room** candidates of a pool: every single tile, then every connected set
 * of size 2..`maxSize` (LV-014). The singleton member is not decoration — a one-tile
 * room is a legal walk-sealed room (its boundary is its walk-neighbourhood, all of it
 * one door object, and a singleton's boundary is *always* single-phase because every
 * neighbour of a tile has the opposite parity to it), and the shipped device already
 * uses one: the goal's own seal is a singleton room. The batch-2 census was run twice,
 * and the difference is a named finding rather than a silent widening: with singletons
 * excluded the 3-pocket class reads 0 sealed `R3` of 8712 candidates; including them is
 * what lets the class exist at all (see the pass's transcript).
 */
function chainRoomCandidates(pool: readonly Coord[], maxSize: number): Coord[][] {
  const out: Coord[][] = pool.map((t) => [t]);
  out.push(...roomCandidates(pool, maxSize));
  return out;
}

/** Every connected tile set of size 2..`maxSize` **containing `anchor`** (the landing-pocket enumeration). */
function anchoredRooms(anchor: Coord, pool: readonly Coord[], maxSize: number): Coord[][] {
  const out: Coord[][] = [];
  const grow = (tiles: Coord[]): void => {
    if (tiles.length >= 2) out.push([...tiles]);
    if (tiles.length >= maxSize) return;
    for (const p of pool) {
      if (coordKey(p) === coordKey(anchor)) continue;
      if (tiles.some((t) => coordKey(t) === coordKey(p))) continue;
      if (!tiles.some((t) => adjacent(t, p))) continue;
      tiles.push(p);
      grow(tiles);
      tiles.pop();
    }
  };
  grow([anchor]);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// 0c. The frame census — the phase law, MEASURED against the real rules
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the bare board of a device (the portal + the sealed column, **no doors, no
 * switches**), BFS it from the start, and compare the measured phase at every far tile
 * with the derived law `stand(t) = arrivalPhase ⊕ parity-distance`. A disagreement is a
 * finding about the derivation — printed, never smoothed.
 */
function frameCensus(): void {
  const rows: string[] = [];
  let checked = 0;
  let agree = 0;
  for (const landing of FAR_TILES) {
    for (const near of LEFT_TILES) {
      if (coordKey(near) === coordKey(PLAYER)) continue;
      if (parity(near) === parity(landing)) continue;
      const nearPhase = nearEntryPhase(near);
      const arrivalPhase = flip(nearPhase);
      const bare: Level = {
        id: 21,
        width: W,
        height: H,
        startPhase: START_PHASE,
        player: PLAYER,
        goal: landing,
        phaseAWalls: COLUMN.a,
        phaseBWalls: COLUMN.b,
        doors: [],
        switches: [],
        portals: [{ id: "p1", pair: [near, landing], activePhase: nearPhase }],
        par: 1,
      };
      const graph = explore(bare);
      // the phase measured at each far tile (all-off world: no switches exist)
      const measured = new Map<string, Phase>();
      for (const s of graph.nodes) {
        const key = `${String(s.player.x)},${String(s.player.y)}`;
        if (!measured.has(key)) measured.set(key, s.phase);
      }
      // the far frame only exists after the teleport: read the tiles whose phase the
      // arrival state's flood reaches
      const start = graph.nodes.find(
        (s) => s.player.x === x(landing) && s.player.y === y(landing),
      );
      if (start === undefined) continue;
      const seen = new Set<string>([hashState(start)]);
      const q: SearchState[] = [start];
      const reached = new Map<string, Phase>([[`${String(start.player.x)},${String(start.player.y)}`, start.phase]]);
      for (let i = 0; i < q.length; i += 1) {
        const s = q[i] as SearchState;
        for (const n of successors(bare, s)) {
          const h = hashState(n);
          const key = `${String(n.player.x)},${String(n.player.y)}`;
          if (!reached.has(key) && x([n.player.x, n.player.y] as Coord) > CX) reached.set(key, n.phase);
          if (seen.has(h)) continue;
          seen.add(h);
          q.push(n);
        }
      }
      for (const [key, phase] of reached) {
        const [px, py] = key.split(",").map(Number);
        const t = at(px as number, py as number);
        const derived = standPhase(landing, arrivalPhase, t);
        checked += 1;
        if (derived === phase) agree += 1;
        else rows.push(`MISMATCH landing ${coordKey(landing)} near ${coordKey(near)} tile ${coordKey(t)} measured ${phase} derived ${derived}`);
      }
      void measured;
    }
  }
  console.log(
    `\nframe census (the derived far-frame phase law vs a BFS of the bare board): ` +
      `${String(agree)}/${String(checked)} far-tile (phase, once-reached) readings agree with ` +
      `stand(t) = arrivalPhase ⊕ parity-distance · ${String(rows.length)} mismatch(es)`,
  );
  for (const r of rows.slice(0, 20)) console.log(`  ${r}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// The device + the gate chain
// ─────────────────────────────────────────────────────────────────────────────

interface Gate {
  readonly id: string;
  readonly ok: boolean;
  readonly detail: string;
}

interface Device {
  readonly landing: Coord;
  readonly near: Coord;
  readonly nearPhase: Phase;
  readonly arrivalPhase: Phase;
  /** The landing pocket P — walk-sealed by the column, its exit door d1 covers the boundary. */
  readonly pocket: Room;
}

/** The leak-free landing pockets — the class stage SL draws from, re-derived here. */
function devices(onlyLanding: string | null): Device[] {
  const out: Device[] = [];
  for (const landing of FAR_TILES) {
    if (onlyLanding !== null && coordKey(landing) !== onlyLanding) continue;
    const pool = FAR_TILES.filter((t) => coordKey(t) !== coordKey(landing));
    for (const near of LEFT_TILES) {
      if (coordKey(near) === coordKey(PLAYER)) continue;
      if (parity(near) === parity(landing)) continue; // ADR-0009 decision 5: opposite parity only
      const nearPhase = nearEntryPhase(near);
      const arrivalPhase = flip(nearPhase);
      for (const tiles of anchoredRooms(landing, pool, POCKET_MAX)) {
        const room = roomFrom(tiles, arrivalPhase, landing);
        if (room !== null) out.push({ landing, near, nearPhase, arrivalPhase, pocket: room });
      }
    }
  }
  return out;
}

interface Context {
  readonly cut: { floor: number; actI: number; l15Par: number };
  readonly device: Device;
  /**
   * The plan's rooms, in execution order: `[P, R2]` (2-pocket, batch 1) or `[P, R2, R3]`
   * (3-pocket, batch 2). `rooms[0]` is the landing pocket.
   */
  readonly rooms: readonly Room[];
  /**
   * The plan's doors, in execution order: one per room's boundary (`d1…dk`), then the
   * goal's own seal. `doors.length === rooms.length + 1`.
   */
  readonly doors: readonly DoorDef[];
  /**
   * The plan's presses, in execution order — one per door: `[∈P, ∈F, ∈R2(, ∈R3)]`. The
   * first sits in the landing pocket, the second in the free band, and each later press
   * sits **inside the room the previous door opened**.
   */
  readonly presses: readonly SwitchDef[];
  /** The goal's own sealed room (a singleton: every walk-neighbour is a `doors.at(-1)` tile). */
  readonly goalRoom: Room;
}

/** One step of the ordered plan: a walk-sealed room, the door sealing it, and the press that drives that door. */
interface ChainStep {
  readonly room: Room;
  readonly door: DoorDef;
  readonly press: SwitchDef;
}

/** The plan as steps, for printing: `chainSteps[i].press` opens `chainSteps[i].door`. */
function chainStepsOf(ctx: Context): ChainStep[] {
  return ctx.doors.map((door, i) => ({
    room: ctx.rooms[i] ?? ctx.goalRoom,
    door,
    press: ctx.presses[i] as SwitchDef,
  }));
}

/**
 * Milestones of the ordered chain: for every door, `press k` then `cross k`, in order —
 * `press0 < cross0 < press1 < cross1 < …` (batch 1: 6 milestones over 3 doors; batch 2:
 * 8 milestones over 4). A plain `string` rather than a template-literal union because the
 * index count is the plan's (`ctx.doors.length`), and the labels are only ever produced by
 * {@link chainOfRoute}.
 */
type Milestone = string;

/**
 * The **ordered multi-press chain** reader: on one par route, record the first arrival
 * of each milestone and require the strictly increasing order
 * `press0 < cross0 < press1 < cross1 < …` (§6.2.3 item 4 read literally — "the second
 * switch reachable **only after** the first door opens" — extended to one press per door).
 * It is a *witness* statement: the order must hold on **every** shortest route, not on one.
 */
function chainOfRoute(
  route: readonly { state: SearchState; toggledOn: readonly string[] }[],
  ctx: Context,
): {
  order: Milestone[];
  ok: boolean;
  presses: string[];
} {
  const doorIndexByTile = new Map<string, number>();
  ctx.doors.forEach((door, index) => {
    for (const t of door.tiles) doorIndexByTile.set(coordKey(t), index);
  });
  const pressIndexById = new Map<string, number>();
  ctx.presses.forEach((s, index) => pressIndexById.set(s.id, index));
  const first = new Map<Milestone, number>();
  const presses: string[] = [];
  for (let i = 0; i < route.length; i += 1) {
    const rec = route[i];
    if (rec === undefined) continue;
    const tile = coordKey([rec.state.player.x, rec.state.player.y] as Coord);
    const crossed = doorIndexByTile.get(tile);
    if (crossed !== undefined && !first.has(`cross${String(crossed)}`)) first.set(`cross${String(crossed)}`, i);
    for (const id of rec.toggledOn) {
      if (!presses.includes(id)) presses.push(id);
      const pressed = pressIndexById.get(id);
      if (pressed !== undefined && !first.has(`press${String(pressed)}`)) first.set(`press${String(pressed)}`, i);
    }
  }
  const order: Milestone[] = [];
  for (let k = 0; k < ctx.doors.length; k += 1) order.push(`press${String(k)}`, `cross${String(k)}`);
  let last = -1;
  let ok = true;
  for (const m of order) {
    const idx = first.get(m);
    if (idx === undefined || idx <= last) {
      ok = false;
      break;
    }
    last = idx;
  }
  return { order, ok, presses };
}

/**
 * The G-lattice gate chain: the shared ladder readers (`scripts/author-l20.ts`'s
 * `ladderGates`, re-used shape for shape but read against **Act II's** laws — par band
 * and `D_exec` band instead of the exact rung pin) plus the device gates **g1–g6**.
 * Every gate prints the number it read.
 */
function gatesOf(level: Level, graph: ReachableGraph, ctx: Context): readonly Gate[] {
  const result = analyse(level, graph);
  const diff = analyseDifficulty(level, graph);
  const par = result.shortestSolution ?? level.par;
  const allOffShortest = allOffShortestSolution(level, graph);
  const audit = auditLevel(level, graph);
  const fired = firingSwitches(level, graph);
  const verdict = validateLevel(level);
  const doorByTile = new Map<string, string>();
  for (const door of level.doors) for (const tile of door.tiles) doorByTile.set(coordKey(tile), door.id);
  const targetsBySwitch = new Map<string, readonly string[]>();
  for (const sw of level.switches) targetsBySwitch.set(sw.id, sw.targets);

  // press-then-cross census (the §6.1.3 G2 shape): every par route presses a switch and
  // later crosses a door that switch targets.
  let routes = 0;
  let pressThenCross = 0;
  let chainOk = 0;
  let minPresses = Number.POSITIVE_INFINITY;
  const pressHistogram = new Map<number, number>();
  if (result.shortestSolution !== null) {
    forEachParRoute(level, result.shortestSolution, (route) => {
      routes += 1;
      let crossed = false;
      for (let i = 0; i < route.length && !crossed; i += 1) {
        const arrival = route[i];
        if (arrival === undefined || arrival.toggledOn.length === 0) continue;
        for (const id of arrival.toggledOn) {
          const targets = targetsBySwitch.get(id) ?? [];
          for (let j = i + 1; j < route.length; j += 1) {
            const later = route[j];
            if (later === undefined) continue;
            const doorId = doorByTile.get(coordKey([later.state.player.x, later.state.player.y] as Coord));
            if (doorId !== undefined && targets.includes(doorId)) crossed = true;
          }
        }
      }
      if (crossed) pressThenCross += 1;
      const chain = chainOfRoute(route, ctx);
      if (chain.ok) chainOk += 1;
      minPresses = Math.min(minPresses, chain.presses.length);
      pressHistogram.set(chain.presses.length, (pressHistogram.get(chain.presses.length) ?? 0) + 1);
    });
  }

  const oneSwitchPerDoor = level.doors.every(
    (d) => level.switches.filter((s) => s.targets.includes(d.id)).length === 1,
  );
  const everySwitchFires = level.switches.every((s) => fired.has(s.id));
  const dexec = diff.Dexec;

  // ── g1 — the landing pocket is not on-foot reachable, and sealed pre-press ───
  const pocketKeys = new Set(ctx.device.pocket.tiles.map(coordKey));
  const foot = (() => {
    const walk = explore({ ...level, portals: [] } as Level);
    return new Set(walk.nodes.map((s) => coordKey([s.player.x, s.player.y] as Coord)));
  })();
  const footInPocket = [...pocketKeys].filter((k) => foot.has(k)).length;
  const arrival = (() => {
    for (const s of graph.nodes) {
      if (!allOff(level, s)) continue;
      if (s.phase !== level.portals[0]?.activePhase) continue;
      for (const d of DIRECTIONS) {
        if (!isLegalMove(level, s, move(d))) continue;
        const clicked = at(
          s.player.x + (d === "left" ? -1 : d === "right" ? 1 : 0),
          s.player.y + (d === "up" ? -1 : d === "down" ? 1 : 0),
        );
        if (coordKey(clicked) !== coordKey(ctx.device.near)) continue;
        const n = applyMove(level, s, move(d));
        if (coordKey([n.player.x, n.player.y] as Coord) === coordKey(ctx.device.landing)) return n;
      }
    }
    return null;
  })();
  let escapes = 0;
  let returns = 0;
  if (arrival !== null) {
    const seen = new Set<string>([hashState(arrival)]);
    const q: SearchState[] = [arrival];
    for (let i = 0; i < q.length; i += 1) {
      const s = q[i] as SearchState;
      for (const n of successors(level, s)) {
        if (!allOff(level, n)) continue;
        const key = coordKey([n.player.x, n.player.y] as Coord);
        if (!pocketKeys.has(key)) {
          if (key === coordKey(ctx.device.near)) returns += 1;
          else escapes += 1;
          continue;
        }
        const h = hashState(n);
        if (seen.has(h)) continue;
        seen.add(h);
        q.push(n);
      }
    }
  }

  // ── g2 — EVERY room's boundary is covered by exactly one door object ────────
  const doorIdByTile = new Map<string, string>();
  for (const d of level.doors) for (const t of d.tiles) doorIdByTile.set(coordKey(t), d.id);
  const wallSet = new Set([...level.phaseAWalls, ...level.phaseBWalls].map(coordKey));
  const allRooms: readonly Room[] = [...ctx.rooms, ctx.goalRoom];
  const roomReport = allRooms.map((room, i) => {
    const ids = [...new Set(room.boundary.map((t) => doorIdByTile.get(coordKey(t))).filter((id): id is string => id !== undefined))].sort();
    const free = room.boundary.filter((t) => !doorIdByTile.has(coordKey(t)) && !wallSet.has(coordKey(t)));
    const walls = room.boundary.filter((t) => wallSet.has(coordKey(t)));
    return `room${String(i + 1)} [${room.tiles.map(coordKey).join(" ")}] boundary [${room.boundary.map(coordKey).join(" ")}] doorIds [${ids.join(" ")}] freeLeaks ${String(free.length)}[${free.map(coordKey).join(" ")}] phaseWalls ${String(walls.length)}[${walls.map(coordKey).join(" ")}]`;
  });
  const g2Ok = allRooms.every((room) => {
    const ids = [...new Set(room.boundary.map((t) => doorIdByTile.get(coordKey(t))).filter((id): id is string => id !== undefined))];
    const free = room.boundary.filter((t) => !doorIdByTile.has(coordKey(t)));
    return ids.length === 1 && free.length === 0;
  });

  // ── g5 — the census identity is broken ─────────────────────────────────────
  const freePositions = new Set<string>();
  {
    const start = graph.nodes[0] as SearchState;
    const seen = new Set<string>([hashState(start)]);
    const q: SearchState[] = [start];
    for (let i = 0; i < q.length; i += 1) {
      const s = q[i] as SearchState;
      if (!allOff(level, s)) continue;
      freePositions.add(coordKey([s.player.x, s.player.y] as Coord));
      for (const n of successors(level, s)) {
        if (!allOff(level, n)) continue;
        const h = hashState(n);
        if (seen.has(h)) continue;
        seen.add(h);
        q.push(n);
      }
    }
  }
  const sealTiles = ctx.doors.at(-1)?.tiles ?? [];
  const notAdjacent = sealTiles.filter(
    (t) => !gridNeighbours(t).some((n) => freePositions.has(coordKey(n))),
  );
  const landingDoorId = ctx.doors[0]?.id ?? "d1";
  const landingPressId = ctx.presses[0]?.id ?? "s1";
  const deviceFree: Level = {
    ...level,
    doors: level.doors.filter((d) => d.id !== landingDoorId),
    switches: level.switches.filter((s) => s.id !== landingPressId),
  };
  let identityValue: number | null = null;
  try {
    identityValue = analyse(deviceFree, explore(deviceFree)).shortestSolution;
  } catch {
    identityValue = null;
  }

  // ── g6 — multi-pocket: the far region splits into ≥ 2 door-sealed rooms ────
  const components = (() => {
    const blocked = new Set<string>([...wallSet, ...doorIdByTile.keys()]);
    const seen = new Set<string>();
    const comps: { tiles: Coord[]; doorIds: string[] }[] = [];
    for (const t of FAR_TILES) {
      const k = coordKey(t);
      if (blocked.has(k) || seen.has(k)) continue;
      const comp: Coord[] = [t];
      seen.add(k);
      for (let i = 0; i < comp.length; i += 1) {
        const c = comp[i] as Coord;
        for (const n of walkNeighbours(c)) {
          const nk = coordKey(n);
          if (blocked.has(nk) || seen.has(nk)) continue;
          seen.add(nk);
          comp.push(n);
        }
      }
      const boundaryOfComp = new Set<string>();
      for (const c of comp)
        for (const n of walkNeighbours(c)) {
          const nk = coordKey(n);
          if (blocked.has(nk)) {
            const id = doorIdByTile.get(nk);
            if (id !== undefined) boundaryOfComp.add(id);
          }
        }
      comps.push({ tiles: comp, doorIds: [...boundaryOfComp].sort() });
    }
    return comps;
  })();
  const singleDoorRooms = components.filter((c) => c.doorIds.length === 1);
  /** The goal's own component: it must be sealed by the chain's last door (the goal's seal). */
  const goalComponent = components.find((c) => c.tiles.some((t) => coordKey(t) === coordKey(level.goal)));
  const goalSealedByLastDoor =
    goalComponent !== undefined &&
    goalComponent.doorIds.length === 1 &&
    goalComponent.doorIds[0] === ctx.doors.at(-1)?.id;

  const gates: Gate[] = [
    {
      id: "region",
      ok: result.deadStates === 0 && result.noUnrecoverableOk && diff.T === 0 && diff.R === 0,
      detail: `deadStates=${String(result.deadStates)} noUnrecoverableOk=${String(result.noUnrecoverableOk)} T=${String(diff.T)} R=${String(diff.R)}`,
    },
    {
      id: "par-band",
      ok: par >= PAR_MIN && par <= PAR_MAX && level.par === par,
      detail: `par=${String(level.par)} (solver ${String(result.shortestSolution)}) ∈ [${String(PAR_MIN)}, ${String(PAR_MAX)}] — strictly inside Act II's published 16–24 (§7.2, §7.7 item 3)`,
    },
    {
      id: "act2-exec-band",
      ok: dexec !== null && dexec >= ACT2_EXEC_BAND[0] && dexec <= ACT2_EXEC_BAND[1],
      detail: `D_exec=${dexec === null ? "n/a" : dexec.toFixed(6)} ∈ [${ACT2_EXEC_BAND[0].toFixed(2)}, ${ACT2_EXEC_BAND[1].toFixed(2)}] (§7.2's derived band = [par+3·1.2500, par+3·1.6875] over the par band)`,
    },
    {
      id: "b-band",
      ok: diff.B >= BLOCK_L1619_B_BAND[0] && diff.B <= BLOCK_L1619_B_BAND[1],
      detail: `B=${diff.B.toFixed(4)} ∈ [${BLOCK_L1619_B_BAND[0].toFixed(4)}, ${BLOCK_L1619_B_BAND[1].toFixed(4)}] (the measured band, re-derived from L1–L15; an excursion is named, never smoothed)`,
    },
    {
      id: "escalation",
      ok: dexec !== null && dexec > ctx.cut.floor,
      detail:
        `D_exec=${dexec === null ? "n/a" : dexec.toFixed(6)} > CUT ${ctx.cut.floor.toFixed(6)} ` +
        `(the FROZEN L1–L15 basis, F-L36-1; Act I's measured peak is ${ctx.cut.actI.toFixed(6)}) — the act's own ` +
        `escalation is §7.3's act-peak, never this cut`,
    },
    // NOTE — the exact-rung ladder (`par = l15Par + 2·(id − 15)`, §6.1.1 P2 / the L16–L19
    // rung pin) is **deliberately NOT applied** inside an act: §7.2 makes Act II par band
    // 16–24 a *plateau* and §7.3 grants interior freedom ("a member of an act sits anywhere
    // inside the act's `D_exec` band, in any order"), while the batch-level obligations are
    // judged by the selection stage on the assembled batch. Applying the rung formula here
    // would refuse every par-17…21 member of the band by arithmetic — measured: 174
    // candidates refused by `par-step` alone.
    // LV-014: the batch-level rising-`D_exec` obligation of batch 1 is **NOT** re-applied
    // here or in the batch-2 selection — §7.3 grants the act interior in any order, and the
    // across-act `act-peak` clause was discharged by batch 1 (27.604651 > 24.729412). Inside
    // the band the only per-rung obligations are the bands themselves plus the device gates.
    {
      id: "latch-grade",
      ok: level.switches.length > 0 && level.doors.length > 0 && (allOffShortest === null || allOffShortest - par >= 1),
      detail: `allOffShortest=${allOffShortest === null ? "null (all-OFF UNSATISFIABLE)" : String(allOffShortest)} par=${String(par)} (§6.1.3 G1: the latch must be worth ≥ 1 move, or carry existence)`,
    },
    {
      id: "latch-route",
      ok: routes > 0 && pressThenCross === routes,
      detail: `par routes=${String(routes)}; press-then-cross on ${String(pressThenCross)} (G2 — every par route presses a switch and then crosses a door it targets)`,
    },
    {
      id: "refused-beat",
      ok: result.refusedBeforeEnteredTiles >= 1,
      detail: `refusedBeforeEnteredTiles=${String(result.refusedBeforeEnteredTiles)} [${result.refusedBeforeEnteredTileList.join(" ")}] unordered=${String(result.refusedThenEnteredTiles)}`,
    },
    {
      id: "coverage",
      ok: result.distinctPositions === level.width * level.height,
      detail: `distinctPositions=${String(result.distinctPositions)}/${String(level.width * level.height)} (P4)`,
    },
    {
      id: "validator",
      ok: verdict.ok && audit.violations.length === 0 && oneSwitchPerDoor && everySwitchFires,
      detail: `ok=${String(verdict.ok)} errors=${String(verdict.errors.length)} warnings=${String(verdict.warnings.length)} violations=${String(audit.violations.length)}[${audit.violations.map((v) => v.code).join(" ")}] one-switch-per-door=${String(oneSwitchPerDoor)} every-switch-fires=${String(everySwitchFires)}`,
    },
    {
      id: "well-formed",
      ok: level.doors.every((d) => d.tiles.length >= 1) && level.switches.every((s) => s.targets.length >= 1),
      detail: `doors=${String(level.doors.length)} switches=${String(level.switches.length)}`,
    },
    {
      id: "g1-pocket-on-foot",
      ok: arrival !== null && footInPocket === 0 && escapes === 0,
      detail:
        `landing ${coordKey(ctx.device.landing)} (portal-only: the sealed column makes the far region unreachable on foot); ` +
        `pocket [${ctx.device.pocket.tiles.map(coordKey).join(" ")}] on-foot-reachable tiles=${String(footInPocket)} (required 0); ` +
        `arrival=${arrival === null ? "NOT FOUND" : `phase ${arrival.phase}`}; pre-press moves leaving the pocket into the far region=${String(escapes)} (required 0); ` +
        `moves back through the landing to the near end ${coordKey(ctx.device.near)}=${String(returns)} (named, not an escape: the landing IS a portal end)`,
    },
    {
      id: "g2-room-exits-are-doors",
      ok: g2Ok,
      detail: `${roomReport.join(" · ")} — §6.2.3 item 3 (F-L19-2: every blocker an openable door, no phase-wall exit)`,
    },
    {
      id: "g3-ordered-multi-press",
      ok: routes > 0 && chainOk === routes && minPresses >= ctx.presses.length,
      detail:
        `par=${String(par)} · ${String(routes)} shortest route(s); distinct switches pressed per route: min=${Number.isFinite(minPresses) ? String(minPresses) : "n/a"} ` +
        `(required ≥ ${String(ctx.presses.length)} = one press per door — LV-014: the clause was "≥ 2" while the device carried three presses; it is ` +
        `now read off the plan itself. Semantics-preserving on the accept class, measured: the same gate already required \`chainOk === routes\`, ` +
        `and \`chainOk\` needs every \`press_k < cross_k\` milestone on the route, so no accepted board ever had minPresses < presses.length); ` +
        `histogram ${[...pressHistogram.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${String(k)}:${String(v)}`).join(" ")}; ` +
        `routes executing the strict chain ` +
        `${chainStepsOf(ctx).map((s) => `press(${s.press.id}) < cross(${s.door.id})`).join(" < ")} = ${String(chainOk)}/${String(routes)}`,
    },
    {
      id: "g4-switch-required",
      ok: allOffShortest === null && !goalReachableWithAllSwitchesOff(level, graph),
      detail:
        `allOffShortest=${allOffShortest === null ? "null (all-OFF world UNSATISFIABLE)" : String(allOffShortest)} ` +
        `allOffGoalReachable=${String(goalReachableWithAllSwitchesOff(level, graph))} — the landing pocket's exit and the goal's only entrance are both doors whose base is closed in the needed phase`,
    },
    {
      id: "g5-identity-broken",
      ok: notAdjacent.length >= 1 && identityValue !== null && identityValue < par && minPresses >= 2,
      detail:
        `the census identity par = min_i(d(start→s_i)+1+d(s_i→goal)) holds only while every seal tile is adjacent to the free far region ` +
        `(ai-native-pipeline §8.12 V1.5). Measured: ${String(sealTiles.length)} seal tile(s), ${String(notAdjacent.length)} NOT adjacent ` +
        `[${notAdjacent.map(coordKey).join(" ")}] (free region ${String(freePositions.size)} position(s)); ` +
        `the identity's VALUE — the world with the landing pocket's device removed — solves at ${identityValue === null ? "n/a" : String(identityValue)} < par ${String(par)}, ` +
        `while every par route presses ${Number.isFinite(minPresses) ? String(minPresses) : "?"} switch(es) through the chain (g3)`,
    },
    {
      id: "g6-multi-pocket",
      ok:
        components.length >= ctx.rooms.length + 1 &&
        singleDoorRooms.length >= ctx.rooms.length + 1 &&
        goalSealedByLastDoor,
      detail:
        `far region split by walls+door tiles: ${String(components.length)} free component(s) ` +
        `${components.map((c, i) => `#${String(i + 1)}(size ${String(c.tiles.length)}, doorIds [${c.doorIds.join(" ")}])`).join(" ")}; ` +
        `components sealed by exactly one door object: ${String(singleDoorRooms.length)} ` +
        `(${singleDoorRooms.map((c) => `[${c.tiles.map(coordKey).join(" ")}]←${c.doorIds[0] ?? "-"}`).join(" ")}) — ` +
        `required ≥ ${String(ctx.rooms.length + 1)} = the plan's ${String(ctx.rooms.length)} sealed room(s) + the goal's own seal, which is the ` +
        `multi-pocket class of §7.2/§7.4 stage G (batch 1's 2-pocket member read ≥ 3 components); ` +
        `the goal's component is sealed by the chain's LAST door (${ctx.doors.at(-1)?.id ?? "-"}): ${String(goalSealedByLastDoor)}`,
    },
  ];
  void result;
  return gates;
}

interface Outcome {
  readonly accepted: boolean;
  readonly reason: string;
  readonly par?: number;
  readonly dexec?: number;
  readonly b?: number;
  readonly coverage?: string;
  readonly gates?: readonly Gate[];
  readonly routes?: number;
  readonly pressThenCross?: number;
}

function probePar(draft: Omit<Level, "par">): { reason: string; par: number } {
  const parsed = LevelSchema.safeParse({ ...draft, par: 1 });
  if (!parsed.success) return { reason: "schema", par: -1 };
  if (!validateLevel(parsed.data).ok) return { reason: "rules", par: -1 };
  const level = parsed.data as Level;
  let graph: ReachableGraph;
  try {
    graph = explore(level);
  } catch {
    return { reason: "explosion", par: -1 };
  }
  const result = analyse(level, graph);
  if (!result.solvable || result.shortestSolution === null) return { reason: "unsolvable", par: -1 };
  return { reason: "ok", par: result.shortestSolution };
}

function judge(draft: Omit<Level, "par">, ctx: Context): { outcome: Outcome; level: Level | null } {
  const parsed = LevelSchema.safeParse({ ...draft, par: 1 });
  if (!parsed.success) return { outcome: { accepted: false, reason: "schema" }, level: null };
  const shape = validateLevel(parsed.data);
  if (!shape.ok) return { outcome: { accepted: false, reason: "rules" }, level: null };
  const level = parsed.data as Level;
  let graph: ReachableGraph;
  try {
    graph = explore(level);
  } catch {
    return { outcome: { accepted: false, reason: "explosion" }, level: null };
  }
  const result = analyse(level, graph);
  if (!result.solvable || result.shortestSolution === null)
    return { outcome: { accepted: false, reason: "unsolvable" }, level: null };
  const proven: Level = { ...level, par: result.shortestSolution };
  const gates = gatesOf(proven, graph, ctx);
  const failed = gates.filter((g) => !g.ok);
  const diff = analyseDifficulty(proven, graph);
  let routes = 0;
  let pressThenCross = 0;
  forEachParRoute(proven, proven.par, (route) => {
    routes += 1;
    const chain = chainOfRoute(route, ctx);
    if (chain.ok) pressThenCross += 1;
  });
  return {
    outcome: {
      accepted: failed.length === 0,
      reason: failed.length === 0 ? "ACCEPT" : failed.map((g) => g.id).join("+"),
      par: result.shortestSolution,
      dexec: diff.Dexec ?? Number.NaN,
      b: diff.B,
      coverage: `${String(result.distinctPositions)}/${String(level.width * level.height)}`,
      gates,
      routes,
      pressThenCross,
    },
    level: failed.length === 0 ? proven : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// G. The lattice
// ─────────────────────────────────────────────────────────────────────────────

/** One accept, as dumped for the selection stage (the level plus its measurements). */
interface Accept {
  readonly par: number;
  readonly dexec: number;
  readonly b: number;
  readonly coverage: string;
  readonly routes: number;
  readonly pressThenCross: number;
  readonly note: string;
  readonly level: Level;
}

function stageLattice(cut: { floor: number; actI: number; l15Par: number }, onlyLanding: string | null): Accept[] {
  const devs = devices(onlyLanding);
  console.log(
    `\nstage G multi-pocket lattice: ${String(devs.length)} leak-free landing device(s) ` +
      `(landing × near × pocket ≤ ${String(POCKET_MAX)}${onlyLanding === null ? "" : `, filtered to landing ${onlyLanding}`}) · ` +
      `second pocket ≤ ${String(QMAX)} · cap ${String(CAP)} tuple(s) per device · par band [${String(PAR_MIN)}, ${String(PAR_MAX)}] · ` +
      `D_exec band [${ACT2_EXEC_BAND[0].toFixed(2)}, ${ACT2_EXEC_BAND[1].toFixed(2)}]`,
  );
  const histogram = new Map<string, number>();
  const parHist = new Map<number, number>();
  const accepts: Accept[] = [];
  const skip = { noRoom2: 0, noGoal: 0, noS2: 0, noSg: 0, room2SealFail: 0, room2BoundaryFail: 0 };
  void skip;
  const misses: { reason: string; note: string; par: number; dexec: number; b: number; failing?: readonly Gate[] }[] = [];
  let total = 0;
  const t0 = Date.now();
  for (const dev of devs) {
    const d1: DoorDef = { id: "d1", color: closedIn(dev.pocket.entryPhase), tiles: dev.pocket.boundary };
    const k1 = new Set([...dev.pocket.tiles, ...dev.pocket.boundary].map(coordKey));
    const qPool = FAR_TILES.filter((t) => !k1.has(coordKey(t)));
    if (qPool.length < 2) skip.noRoom2 += 1;
    const s1Tiles = dev.pocket.tiles.filter((t) => coordKey(t) !== coordKey(dev.landing));
    for (const room2Tiles of roomCandidates(qPool, QMAX)) {
      // the second room must be sealed: every neighbour of it is one of its own door tiles
      const room2 = roomFrom(room2Tiles, dev.arrivalPhase, dev.landing);
      if (room2 === null) {
        skip.room2SealFail += 1;
        continue;
      }
      if (room2.boundary.some((b) => !qPool.some((t) => coordKey(t) === coordKey(b)))) {
        skip.room2BoundaryFail += 1;
        continue;
      }
      const d2: DoorDef = { id: "d2", color: closedIn(room2.entryPhase), tiles: room2.boundary };
      const used2 = new Set([...k1, ...room2.tiles.map(coordKey), ...room2.boundary.map(coordKey)]);
      const freePool = qPool.filter((t) => !used2.has(coordKey(t)));
      const goalPool = freePool.filter(
        (g) =>
          x(g) >= CX + 2 && // no column neighbour: else the goal is enterable from the corridor, which can hold no door
          walkNeighbours(g).length > 0 &&
          walkNeighbours(g).every((n) => freePool.some((t) => coordKey(t) === coordKey(n))),
      );
      const sgTiles = room2.tiles;
      const s2Tiles = freePool.filter((t) => !goalPool.some((g) => coordKey(g) === coordKey(t)));
      if (goalPool.length === 0) skip.noGoal += 1;
      if (s2Tiles.length === 0) skip.noS2 += 1;
      if (sgTiles.length === 0) skip.noSg += 1;
      if (goalPool.length === 0 || s2Tiles.length === 0 || sgTiles.length === 0) continue;
      let tried = 0;
      for (const s1Tile of s1Tiles) {
        const s1: SwitchDef = {
          id: "s1",
          tile: s1Tile,
          activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s1Tile),
          targets: ["d1"],
        };
        for (const s2Tile of s2Tiles) {
          const s2: SwitchDef = {
            id: "s2",
            tile: s2Tile,
            activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s2Tile),
            targets: ["d2"],
          };
          for (const sgTile of sgTiles) {
            const sg: SwitchDef = {
              id: "s3",
              tile: sgTile,
              activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, sgTile),
              targets: ["d3"],
            };
            for (const goal of goalPool) {
              if (tried >= CAP) break;
              tried += 1;
              total += 1;
              const sealTiles = walkNeighbours(goal);
              const d3: DoorDef = {
                id: "d3",
                color: closedIn(standPhase(dev.landing, dev.arrivalPhase, goal)),
                tiles: sealTiles,
              };
              const draft = {
                id: BATCH_FIRST_ID,
                width: W,
                height: H,
                startPhase: START_PHASE,
                player: PLAYER,
                goal,
                phaseAWalls: COLUMN.a,
                phaseBWalls: COLUMN.b,
                doors: [d1, d2, d3],
                switches: [s1, s2, sg],
                portals: [{ id: "p1", pair: [dev.near, dev.landing] as const, activePhase: dev.nearPhase }],
              };
              const ctx: Context = {
                cut,
                device: dev,
                rooms: [dev.pocket, room2],
                doors: [d1, d2, d3],
                presses: [s1, s2, sg],
                goalRoom: {
                  tiles: [goal],
                  boundary: sealTiles,
                  entryPhase: standPhase(dev.landing, dev.arrivalPhase, goal),
                },
              };
              const note =
                `landing=${coordKey(dev.landing)} near=${coordKey(dev.near)}/${dev.nearPhase} ` +
                `P=[${dev.pocket.tiles.map(coordKey).join(" ")}] d1=[${dev.pocket.boundary.map(coordKey).join(" ")}]/${d1.color} ` +
                `s1=${coordKey(s1Tile)}/${s1.activePhase} ` +
                `Q=[${room2.tiles.map(coordKey).join(" ")}] d2=[${room2.boundary.map(coordKey).join(" ")}]/${d2.color} s2=${coordKey(s2Tile)}/${s2.activePhase} ` +
                `goal=${coordKey(goal)} d3=[${sealTiles.map(coordKey).join(" ")}]/${d3.color} sg=${coordKey(sgTile)}/${sg.activePhase}`;
              // the par band is the FILTER (the probe), the gates run on in-band boards only
              const probe = probePar(draft);
              if (probe.par < PAR_MIN || probe.par > PAR_MAX) {
                const reason = probe.reason === "ok" ? "par-out-of-band" : probe.reason;
                histogram.set(reason, (histogram.get(reason) ?? 0) + 1);
                if (probe.par > 0) parHist.set(probe.par, (parHist.get(probe.par) ?? 0) + 1);
                continue;
              }
              const { outcome, level } = judge(draft, ctx);
              if (!outcome.accepted || level === null) {
                histogram.set(outcome.reason, (histogram.get(outcome.reason) ?? 0) + 1);
                if (outcome.par !== undefined)
                  misses.push({
                    reason: outcome.reason,
                    note,
                    par: outcome.par,
                    dexec: outcome.dexec ?? Number.NaN,
                    b: outcome.b ?? Number.NaN,
                    failing: (outcome.gates ?? []).filter((g) => !g.ok),
                  });
                continue;
              }
              accepts.push({
                par: outcome.par as number,
                dexec: outcome.dexec ?? Number.NaN,
                b: outcome.b ?? Number.NaN,
                coverage: outcome.coverage ?? "?",
                routes: outcome.routes ?? 0,
                pressThenCross: outcome.pressThenCross ?? 0,
                note,
                level,
              });
              if (accepts.length <= 40)
                console.log(
                  `  ACCEPT par=${String(outcome.par)} D_exec=${(outcome.dexec ?? 0).toFixed(6)} B=${(outcome.b ?? 0).toFixed(4)} ` +
                    `coverage=${String(outcome.coverage)} routes=${String(outcome.routes)} chain=${String(outcome.pressThenCross)}/${String(outcome.routes)}\n          ${note}`,
                );
            }
            if (tried >= CAP) break;
          }
          if (tried >= CAP) break;
        }
        if (tried >= CAP) break;
      }
    }
  }
  console.log(
    `\ncensus: ${String(accepts.length)} accept(s) of ${String(total)} judged candidate(s) in ${((Date.now() - t0) / 1000).toFixed(1)} s`,
  );
  console.log(
    `upstream skips: room2 sets not sealable ${String(skip.room2SealFail)} · room2 boundary outside the free pool ${String(skip.room2BoundaryFail)} · ` +
      `devices with < 2 free tiles ${String(skip.noRoom2)} · no goal candidate ${String(skip.noGoal)} · no s2 tile ${String(skip.noS2)} · no sg tile ${String(skip.noSg)}`,
  );
  if (ROOM_FAIL.size > 0)
    console.log(`room rejections: ${[...ROOM_FAIL.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}`);
  console.log("rejection histogram:");
  for (const [k, v] of [...histogram.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${String(v)}`);
  console.log(
    `par census over every judged candidate: ` +
      `${[...parHist.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${String(k)}:${String(v)}`).join(" ")}`,
  );
  console.log("accepts by par:");
  const byPar = new Map<number, Accept[]>();
  for (const a of accepts) {
    const list = byPar.get(a.par) ?? [];
    list.push(a);
    byPar.set(a.par, list);
  }
  for (const [p, list] of [...byPar.entries()].sort((a, b) => a[0] - b[0])) {
    const lo = Math.min(...list.map((a) => a.dexec));
    const hi = Math.max(...list.map((a) => a.dexec));
    console.log(
      `  par ${String(p)}: ${String(list.length)} accept(s), D_exec ${lo.toFixed(6)} … ${hi.toFixed(6)} ` +
        `(B ${Math.min(...list.map((a) => a.b)).toFixed(4)} … ${Math.max(...list.map((a) => a.b)).toFixed(4)})`,
    );
  }
  const atBand = misses.filter((m) => m.par >= PAR_MIN && m.par <= PAR_MAX);
  console.log(`in-band candidates refused by a gate: ${String(atBand.length)}`);
  for (const m of atBand.sort((a, b) => b.dexec - a.dexec).slice(0, 6)) {
    console.log(`  par=${String(m.par)} D_exec=${m.dexec.toFixed(6)} B=${m.b.toFixed(4)} [${m.reason}]\n    ${m.note}`);
    for (const g of m.failing ?? []) console.log(`      ${g.id}: ${g.detail}`);
  }
  writeFileSync(ACCEPTS, `${JSON.stringify(accepts)}\n`);
  console.log(`wrote ${String(accepts.length)} accept(s) to ${ACCEPTS}`);
  return accepts;
}

/**
 * **Stage `G`, the chained sub-lattice** (`--pockets=3`, Act II batch 2 = L26–L30).
 *
 * The same frame, device pool, band and gates as {@link stageLattice}, one pocket deeper:
 * `P → R2 → R3` plus the goal's own seal, i.e. **4 doors and 4 presses** in the forced
 * order `p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4` (the header's plan figure). The plan is
 * forced by construction, and the construction is checked: `p1 ∈ F` is reachable only
 * after `d1` opens, `p2 ∈ R2` only after `d2`, `p3 ∈ R3` only after `d3`, and `d4` is the
 * goal's only entrance — so `g3`'s staged-world measurement has something to falsify on
 * every rung rather than a reading to trust.
 *
 * What the run prints, and what it may never hide:
 *
 * - the **accept count is a floor** (`--paircap` / `--budget` truncate the enumeration;
 *   both counters are printed), and the refusal census is complete *within the prefix*;
 * - the **par census over every judged tuple** (not only the in-band ones) — a 4-press
 *   chain in a 7 × 6 frame is longer than a 3-press one, so "the class sits above the
 *   band" is a real possible outcome and the histogram is how it is read;
 * - the shape-filter counters of the header's published restrictions, including the
 *   `R3`-adjacent-to-`R2` counter that the seal law forces to 0.
 */
function stageLattice3(cut: { floor: number; actI: number; l15Par: number }, onlyLanding: string | null): Accept[] {
  const devs = devices(onlyLanding);
  console.log(
    `\nstage G chained sub-lattice (3-pocket, ${String(POCKETS)} pockets): ${String(devs.length)} leak-free landing device(s) ` +
      `(landing × near × pocket ≤ ${String(POCKET_MAX)}${onlyLanding === null ? "" : `, filtered to landing ${onlyLanding}`}) · ` +
      `R2, R3 ≤ ${String(QMAX)} tile(s) · ${String(PAIR_CAP)} (R2,R3) pair(s)/device cap · ${String(CAP)} tuple(s)/group cap · ` +
      `${String(BUDGET)} judged tuple(s) budget · par band [${String(PAR_MIN)}, ${String(PAR_MAX)}] · ` +
      `D_exec band [${ACT2_EXEC_BAND[0].toFixed(2)}, ${ACT2_EXEC_BAND[1].toFixed(2)}]`,
  );
  const histogram = new Map<string, number>();
  const parHist = new Map<number, number>();
  const accepts: Accept[] = [];
  const skip = {
    devicesShort: 0,
    room2Unsealable: 0,
    room2BoundaryOutside: 0,
    pairsShort: 0,
    room3Unsealable: 0,
    room3BoundaryOutside: 0,
    roomsAdjacent: 0,
    noGoal: 0,
    s2OnSeal: 0,
  };
  const misses: { reason: string; note: string; par: number; dexec: number; b: number; failing?: readonly Gate[] }[] = [];
  const room2Fail = new Map<string, number>();
  const room3Fail = new Map<string, number>();
  const firstChanged = (before: ReadonlyMap<string, number>): string => {
    for (const [k, v] of ROOM_FAIL) if ((before.get(k) ?? 0) !== v) return k;
    return "unknown";
  };
  let room2Sealed = 0;
  let room3Sealed = 0;
  let dumpLeft = Number(argOf("dump") ?? "0");
  let maxPPool = 0;
  let maxFPoolOverGoal = 0;
  let total = 0;
  let pairs = 0;
  let pairCapHits = 0;
  let budgetHit = false;
  let devicesDone = 0;
  const t0 = Date.now();
  for (const dev of devs) {
    if (total >= BUDGET) break;
    devicesDone += 1;
    const d1: DoorDef = { id: "d1", color: closedIn(dev.pocket.entryPhase), tiles: dev.pocket.boundary };
    const k1 = new Set([...dev.pocket.tiles, ...dev.pocket.boundary].map(coordKey));
    const qPool = FAR_TILES.filter((t) => !k1.has(coordKey(t)));
    const s1Tiles = dev.pocket.tiles.filter((t) => coordKey(t) !== coordKey(dev.landing));
    if (qPool.length < 4) {
      skip.devicesShort += 1;
      continue;
    }
    let pairsThisDev = 0;
    for (const room2Tiles of chainRoomCandidates(qPool, QMAX)) {
      if (total >= BUDGET) break;
      if (pairsThisDev >= PAIR_CAP) {
        pairCapHits += 1;
        break;
      }
      const before2 = new Map(ROOM_FAIL);
      const room2 = roomFrom(room2Tiles, dev.arrivalPhase, dev.landing);
      if (room2 === null) {
        const r = firstChanged(before2);
        room2Fail.set(r, (room2Fail.get(r) ?? 0) + 1);
        skip.room2Unsealable += 1;
        continue;
      }
      room2Sealed += 1;
      if (room2.boundary.some((b) => !qPool.some((t) => coordKey(t) === coordKey(b)))) {
        skip.room2BoundaryOutside += 1;
        continue;
      }
      const d2: DoorDef = { id: "d2", color: closedIn(room2.entryPhase), tiles: room2.boundary };
      const k2 = new Set([...k1, ...room2.tiles.map(coordKey), ...room2.boundary.map(coordKey)]);
      const pPool = FAR_TILES.filter((t) => !k2.has(coordKey(t)));
      const room2Keys = new Set(room2.tiles.map(coordKey));
      if (pPool.length > maxPPool) maxPPool = pPool.length;
      if (pPool.length < 4) {
        skip.pairsShort += 1;
        continue;
      }
      let dumped = 0;
      for (const room3Tiles of chainRoomCandidates(pPool, QMAX)) {
        if (total >= BUDGET) break;
        const before3 = new Map(ROOM_FAIL);
        const room3 = roomFrom(room3Tiles, dev.arrivalPhase, dev.landing);
        if (room3 === null) {
          const r = firstChanged(before3);
          room3Fail.set(r, (room3Fail.get(r) ?? 0) + 1);
          skip.room3Unsealable += 1;
          if (dumpLeft > 0 && dumped < 10) {
            dumped += 1;
            dumpLeft -= 1;
            console.log(
              `  DUMP R3 candidate [${room3Tiles.map(coordKey).join(" ")}] REJECTED ${r} · P=[${dev.pocket.tiles.map(coordKey).join(" ")}] d1=[${dev.pocket.boundary.map(coordKey).join(" ")}] ` +
                `R2=[${room2.tiles.map(coordKey).join(" ")}] d2=[${room2.boundary.map(coordKey).join(" ")}] pPool(${String(pPool.length)})=[${pPool.map(coordKey).join(" ")}]`,
            );
          }
          continue;
        }
        room3Sealed += 1;
        if (dumpLeft > 0) {
          dumpLeft -= 1;
          const fPoolSize = FAR_TILES.filter(
            (t) => !k2.has(coordKey(t)) && !room3.tiles.some((r) => coordKey(r) === coordKey(t)) && !room3.boundary.some((b) => coordKey(b) === coordKey(t)),
          ).length;
          if (fPoolSize > maxFPoolOverGoal) maxFPoolOverGoal = fPoolSize;
          console.log(
            `  DUMP R3 sealed [${room3Tiles.map(coordKey).join(" ")}] boundary=[${room3.boundary.map(coordKey).join(" ")}]/${room3.entryPhase} · ` +
              `P=[${dev.pocket.tiles.map(coordKey).join(" ")}] R2=[${room2.tiles.map(coordKey).join(" ")}] pPool=[${pPool.map(coordKey).join(" ")}] free-after=${String(fPoolSize)}`,
          );
        }
        if (room3.boundary.some((b) => !pPool.some((t) => coordKey(t) === coordKey(b)))) {
          skip.room3BoundaryOutside += 1;
          continue;
        }
        // the published shape restriction #1 — counted, and 0 by the seal law (d2 covers
        // every neighbour of R2, so no R3 tile can touch R2: a non-zero reading means the
        // seal law broke, and the run must say so rather than quietly narrow)
        if (room3.tiles.some((t) => gridNeighbours(t).some((n) => room2Keys.has(coordKey(n))))) {
          skip.roomsAdjacent += 1;
          continue;
        }
        const d3: DoorDef = { id: "d3", color: closedIn(room3.entryPhase), tiles: room3.boundary };
        const k3 = new Set([...k2, ...room3.tiles.map(coordKey), ...room3.boundary.map(coordKey)]);
        const fPool = FAR_TILES.filter((t) => !k3.has(coordKey(t)));
        const goalPool = fPool.filter(
          (g) =>
            x(g) >= CX + 2 && // no column neighbour: else the goal is enterable from the corridor, which can hold no door
            walkNeighbours(g).length > 0 &&
            walkNeighbours(g).every((n) => fPool.some((t) => coordKey(t) === coordKey(n))),
        );
        if (goalPool.length === 0) {
          skip.noGoal += 1;
          continue;
        }
        pairsThisDev += 1;
        pairs += 1;
        const s3Tiles = room2.tiles;
        const s4Tiles = room3.tiles;
        const s2Tiles = fPool;
        let tried = 0;
        for (const s1Tile of s1Tiles) {
          if (tried >= CAP || total >= BUDGET) break;
          const s1: SwitchDef = {
            id: "s1",
            tile: s1Tile,
            activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s1Tile),
            targets: ["d1"],
          };
          for (const s2Tile of s2Tiles) {
            if (tried >= CAP || total >= BUDGET) break;
            const s2: SwitchDef = {
              id: "s2",
              tile: s2Tile,
              activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s2Tile),
              targets: ["d2"],
            };
            for (const s3Tile of s3Tiles) {
              if (tried >= CAP || total >= BUDGET) break;
              const s3: SwitchDef = {
                id: "s3",
                tile: s3Tile,
                activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s3Tile),
                targets: ["d3"],
              };
              for (const s4Tile of s4Tiles) {
                if (tried >= CAP || total >= BUDGET) break;
                const s4: SwitchDef = {
                  id: "s4",
                  tile: s4Tile,
                  activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s4Tile),
                  targets: ["d4"],
                };
                for (const goal of goalPool) {
                  if (tried >= CAP || total >= BUDGET) break;
                  const sealTiles = walkNeighbours(goal);
                  if (
                    sealTiles.some((t) => coordKey(t) === coordKey(s2Tile)) ||
                    coordKey(goal) === coordKey(s2Tile)
                  ) {
                    skip.s2OnSeal += 1;
                    continue;
                  }
                  tried += 1;
                  total += 1;
                  const d4: DoorDef = {
                    id: "d4",
                    color: closedIn(standPhase(dev.landing, dev.arrivalPhase, goal)),
                    tiles: sealTiles,
                  };
                  const draft = {
                    id: BATCH_FIRST_ID,
                    width: W,
                    height: H,
                    startPhase: START_PHASE,
                    player: PLAYER,
                    goal,
                    phaseAWalls: COLUMN.a,
                    phaseBWalls: COLUMN.b,
                    doors: [d1, d2, d3, d4],
                    switches: [s1, s2, s3, s4],
                    portals: [{ id: "p1", pair: [dev.near, dev.landing] as const, activePhase: dev.nearPhase }],
                  };
                  const ctx: Context = {
                    cut,
                    device: dev,
                    rooms: [dev.pocket, room2, room3],
                    doors: [d1, d2, d3, d4],
                    presses: [s1, s2, s3, s4],
                    goalRoom: {
                      tiles: [goal],
                      boundary: sealTiles,
                      entryPhase: standPhase(dev.landing, dev.arrivalPhase, goal),
                    },
                  };
                  const note =
                    `landing=${coordKey(dev.landing)} near=${coordKey(dev.near)}/${dev.nearPhase} ` +
                    `P=[${dev.pocket.tiles.map(coordKey).join(" ")}] d1=[${dev.pocket.boundary.map(coordKey).join(" ")}]/${d1.color} ` +
                    `s1=${coordKey(s1Tile)}/${s1.activePhase} ` +
                    `R2=[${room2.tiles.map(coordKey).join(" ")}] d2=[${room2.boundary.map(coordKey).join(" ")}]/${d2.color} s2=${coordKey(s2Tile)}/${s2.activePhase} ` +
                    `R3=[${room3.tiles.map(coordKey).join(" ")}] d3=[${room3.boundary.map(coordKey).join(" ")}]/${d3.color} s3=${coordKey(s3Tile)}/${s3.activePhase} ` +
                    `s4=${coordKey(s4Tile)}/${s4.activePhase} goal=${coordKey(goal)} d4=[${sealTiles.map(coordKey).join(" ")}]/${d4.color}`;
                  // the par band is the FILTER (the probe), the gates run on in-band boards only
                  const probe = probePar(draft);
                  if (probe.par < PAR_MIN || probe.par > PAR_MAX) {
                    const reason = probe.reason === "ok" ? "par-out-of-band" : probe.reason;
                    histogram.set(reason, (histogram.get(reason) ?? 0) + 1);
                    if (probe.par > 0) parHist.set(probe.par, (parHist.get(probe.par) ?? 0) + 1);
                    continue;
                  }
                  const { outcome, level } = judge(draft, ctx);
                  if (!outcome.accepted || level === null) {
                    histogram.set(outcome.reason, (histogram.get(outcome.reason) ?? 0) + 1);
                    if (outcome.par !== undefined)
                      misses.push({
                        reason: outcome.reason,
                        note,
                        par: outcome.par,
                        dexec: outcome.dexec ?? Number.NaN,
                        b: outcome.b ?? Number.NaN,
                        failing: (outcome.gates ?? []).filter((g) => !g.ok),
                      });
                    continue;
                  }
                  accepts.push({
                    par: outcome.par as number,
                    dexec: outcome.dexec ?? Number.NaN,
                    b: outcome.b ?? Number.NaN,
                    coverage: outcome.coverage ?? "?",
                    routes: outcome.routes ?? 0,
                    pressThenCross: outcome.pressThenCross ?? 0,
                    note,
                    level,
                  });
                  if (accepts.length <= 40)
                    console.log(
                      `  ACCEPT par=${String(outcome.par)} D_exec=${(outcome.dexec ?? 0).toFixed(6)} B=${(outcome.b ?? 0).toFixed(4)} ` +
                        `coverage=${String(outcome.coverage)} routes=${String(outcome.routes)} chain=${String(outcome.pressThenCross)}/${String(outcome.routes)}\n          ${note}`,
                    );
                }
              }
            }
          }
        }
      }
      if (total >= BUDGET) {
        budgetHit = true;
        break;
      }
    }
  }
  if (total >= BUDGET) budgetHit = true;
  console.log(
    `\ncensus: ${String(accepts.length)} accept(s) of ${String(total)} judged candidate(s) over ${String(pairs)} (R2,R3) pair(s) ` +
      `in ${((Date.now() - t0) / 1000).toFixed(1)} s · devices walked ${String(devicesDone)}/${String(devs.length)} · ` +
      `${String(PAIR_CAP)}-pair cap hit on ${String(pairCapHits)} device(s) · global budget ${String(BUDGET)} ${budgetHit ? "HIT (the run is a deterministic PREFIX: the accept count is a floor, the refusal census is complete only within the prefix)" : "not reached (every device was walked to its own pair cap)"}`,
  );
  console.log(
    `upstream skips: R2 sets not sealable ${String(skip.room2Unsealable)} ${[...room2Fail.entries()].map(([k, v]) => `(${k} ${String(v)})`).join(" ")} · ` +
      `R2 boundary outside the pool ${String(skip.room2BoundaryOutside)} · ${String(room2Sealed)} sealed R2 set(s) · ` +
      `devices with < 4 free tiles for R2 ${String(skip.devicesShort)} · (R2,R3) pairs with < 4 free tiles for R3 ${String(skip.pairsShort)} · ` +
      `R3 sets not sealable ${String(skip.room3Unsealable)} ${[...room3Fail.entries()].map(([k, v]) => `(${k} ${String(v)})`).join(" ")} · ` +
      `R3 boundary outside the pool ${String(skip.room3BoundaryOutside)} · ${String(room3Sealed)} sealed R3 set(s) · ` +
      `PAIRS REFUSED BY SHAPE FILTER #1 (an R3 tile adjacent to an R2 tile) ${String(skip.roomsAdjacent)} (0 expected by the seal law) · ` +
      `no goal candidate ${String(skip.noGoal)} · s2 tile on the goal's seal or the goal itself ${String(skip.s2OnSeal)}`,
  );
  console.log(
    `tile accounting: largest R3 pool seen ${String(maxPPool)} tile(s) (the pPool after P+d1+R2+d2 are removed) · largest free pool seen after a sealed R3 ${String(maxFPoolOverGoal)} tile(s) ` +
      `(that pool must still hold the goal + its whole seal (≥ 2) + the s2 tile, and the R3 pool must hold R3 ∪ d3)`,
  );
  if (ROOM_FAIL.size > 0)
    console.log(`room rejections: ${[...ROOM_FAIL.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}`);
  console.log("rejection histogram:");
  for (const [k, v] of [...histogram.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${String(v)}`);
  console.log(
    `par census over every judged candidate (in band and out): ` +
      `${[...parHist.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${String(k)}:${String(v)}`).join(" ")}`,
  );
  console.log("accepts by par:");
  const byPar = new Map<number, Accept[]>();
  for (const a of accepts) {
    const list = byPar.get(a.par) ?? [];
    list.push(a);
    byPar.set(a.par, list);
  }
  for (const [p, list] of [...byPar.entries()].sort((a, b) => a[0] - b[0])) {
    const lo = Math.min(...list.map((a) => a.dexec));
    const hi = Math.max(...list.map((a) => a.dexec));
    console.log(
      `  par ${String(p)}: ${String(list.length)} accept(s), D_exec ${lo.toFixed(6)} … ${hi.toFixed(6)} ` +
        `(B ${Math.min(...list.map((a) => a.b)).toFixed(4)} … ${Math.max(...list.map((a) => a.b)).toFixed(4)})`,
    );
  }
  const atBand = misses.filter((m) => m.par >= PAR_MIN && m.par <= PAR_MAX);
  console.log(`in-band candidates refused by a gate: ${String(atBand.length)}`);
  for (const m of atBand.sort((a, b) => b.dexec - a.dexec).slice(0, 6)) {
    console.log(`  par=${String(m.par)} D_exec=${m.dexec.toFixed(6)} B=${m.b.toFixed(4)} [${m.reason}]\n    ${m.note}`);
    for (const g of m.failing ?? []) console.log(`      ${g.id}: ${g.detail}`);
  }
  writeFileSync(ACCEPTS, `${JSON.stringify(accepts)}\n`);
  console.log(`wrote ${String(accepts.length)} accept(s) to ${ACCEPTS}`);
  return accepts;
}

/**
 * **Stage `G`, the 4-pocket sub-lattice** (`--pockets=4`, Act II batch 3 = L31–L35).
 *
 * §7.8 item 4's **first named open axis** — §7.4's `pocket count 1–4`, the member LV-014
 * left *unenumerated with no completeness claim*. The same frame (`7 × 6`, `--cx=2`), the
 * same device pool, band and gate chain as {@link stageLattice3}, **one room deeper**:
 * `P → R2 → R3 → R4` plus the goal's own seal, i.e. **5 doors and 5 presses** in the forced
 * order `p0 < d1 < p1 < d2 < p2 < d3 < p3 < d4 < p4 < d5` (the header's plan figure). The
 * plan is forced by construction — each press lies inside the room the previous door seals,
 * and `d5` is the goal's only entrance — and the construction is checked by the same
 * readers (`g3` requires the whole chain on **every** par route, `g1`/`g2`/`g6` re-derive
 * the seal geometry from the bytes).
 *
 * What the run prints, and what it may never hide (unchanged discipline, batch 2's):
 *
 * - the **accept count is a floor** if `--paircap` / `--budget` truncate (both counters are
 *   printed), and the refusal census is complete *within the prefix*;
 * - the **par census over every judged tuple**, in band and out — the band is a filter, not
 *   a truncation, and this run exists to measure whether `par 24` (§7.8 item 3) is
 *   reachable in this family;
 * - the **shape-filter counters** of the published restrictions: no `R3` tile adjacent to an
 *   `R2` tile (batch 2's filter #1, 0 by the seal law) and no `R4` tile adjacent to an `R2`
 *   or `R3` tile (filter #2, the same argument one level down: every neighbour of a sealed
 *   room from outside is one of its own door tiles, and door tiles are excluded from the next
 *   pool before it is drawn). A non-zero reading would mean the seal law is broken, and the
 *   run says so rather than quietly narrowing.
 *
 * No ceiling claim in either direction: this is the enumerated class (one portal pair,
 * `--pocketsize`/`--qmax` bounds, this frame), and nothing outside it is claimed.
 */
function stageLattice4(cut: { floor: number; actI: number; l15Par: number }, onlyLanding: string | null): Accept[] {
  const devs = devices(onlyLanding);
  console.log(
    `\nstage G 4-pocket sub-lattice (4-pocket, ${String(POCKETS)} pockets): ${String(devs.length)} leak-free landing device(s) ` +
      `(landing × near × pocket ≤ ${String(POCKET_MAX)}${onlyLanding === null ? "" : `, filtered to landing ${onlyLanding}`}) · ` +
      `R2, R3, R4 ≤ ${String(QMAX)} tile(s) · ${String(PAIR_CAP)} (R2,R3,R4) group(s)/device cap · ${String(CAP)} tuple(s)/group cap · ` +
      `${String(BUDGET)} judged tuple(s) budget · par band [${String(PAR_MIN)}, ${String(PAR_MAX)}] · ` +
      `D_exec band [${ACT2_EXEC_BAND[0].toFixed(2)}, ${ACT2_EXEC_BAND[1].toFixed(2)}]`,
  );
  const histogram = new Map<string, number>();
  const parHist = new Map<number, number>();
  const accepts: Accept[] = [];
  const skip = {
    devicesShort: 0,
    room2Unsealable: 0,
    room2BoundaryOutside: 0,
    pairsShort: 0,
    room3Unsealable: 0,
    room3BoundaryOutside: 0,
    rooms23Adjacent: 0,
    triplesShort: 0,
    room4Unsealable: 0,
    room4BoundaryOutside: 0,
    rooms34Adjacent: 0,
    noGoal: 0,
    s2OnSeal: 0,
  };
  const misses: { reason: string; note: string; par: number; dexec: number; b: number; failing?: readonly Gate[] }[] = [];
  const room2Fail = new Map<string, number>();
  const room3Fail = new Map<string, number>();
  const room4Fail = new Map<string, number>();
  const firstChanged = (before: ReadonlyMap<string, number>): string => {
    for (const [k, v] of ROOM_FAIL) if ((before.get(k) ?? 0) !== v) return k;
    return "unknown";
  };
  let room2Sealed = 0;
  let room3Sealed = 0;
  let room4Sealed = 0;
  let maxR3Pool = 0;
  let maxR4Pool = 0;
  let maxFPoolOverGoal = 0;
  let total = 0;
  let groups = 0;
  let groupCapHits = 0;
  let budgetHit = false;
  let devicesDone = 0;
  const t0 = Date.now();
  for (const dev of devs) {
    if (total >= BUDGET) break;
    devicesDone += 1;
    const d1: DoorDef = { id: "d1", color: closedIn(dev.pocket.entryPhase), tiles: dev.pocket.boundary };
    const k1 = new Set([...dev.pocket.tiles, ...dev.pocket.boundary].map(coordKey));
    const qPool = FAR_TILES.filter((t) => !k1.has(coordKey(t)));
    const s1Tiles = dev.pocket.tiles.filter((t) => coordKey(t) !== coordKey(dev.landing));
    if (qPool.length < 4) {
      skip.devicesShort += 1;
      continue;
    }
    let groupsThisDev = 0;
    for (const room2Tiles of chainRoomCandidates(qPool, QMAX)) {
      if (total >= BUDGET) break;
      if (groupsThisDev >= PAIR_CAP) {
        groupCapHits += 1;
        break;
      }
      const before2 = new Map(ROOM_FAIL);
      const room2 = roomFrom(room2Tiles, dev.arrivalPhase, dev.landing);
      if (room2 === null) {
        const r = firstChanged(before2);
        room2Fail.set(r, (room2Fail.get(r) ?? 0) + 1);
        skip.room2Unsealable += 1;
        continue;
      }
      room2Sealed += 1;
      if (room2.boundary.some((b) => !qPool.some((t) => coordKey(t) === coordKey(b)))) {
        skip.room2BoundaryOutside += 1;
        continue;
      }
      const d2: DoorDef = { id: "d2", color: closedIn(room2.entryPhase), tiles: room2.boundary };
      const k2 = new Set([...k1, ...room2.tiles.map(coordKey), ...room2.boundary.map(coordKey)]);
      const pPool = FAR_TILES.filter((t) => !k2.has(coordKey(t)));
      const room2Keys = new Set(room2.tiles.map(coordKey));
      if (pPool.length > maxR3Pool) maxR3Pool = pPool.length;
      if (pPool.length < 4) {
        skip.pairsShort += 1;
        continue;
      }
      for (const room3Tiles of chainRoomCandidates(pPool, QMAX)) {
        if (total >= BUDGET) break;
        const before3 = new Map(ROOM_FAIL);
        const room3 = roomFrom(room3Tiles, dev.arrivalPhase, dev.landing);
        if (room3 === null) {
          const r = firstChanged(before3);
          room3Fail.set(r, (room3Fail.get(r) ?? 0) + 1);
          skip.room3Unsealable += 1;
          continue;
        }
        room3Sealed += 1;
        if (room3.boundary.some((b) => !pPool.some((t) => coordKey(t) === coordKey(b)))) {
          skip.room3BoundaryOutside += 1;
          continue;
        }
        // published shape restriction #1 (batch 2's, kept): no R3 tile adjacent to an R2 tile
        if (room3.tiles.some((t) => gridNeighbours(t).some((n) => room2Keys.has(coordKey(n))))) {
          skip.rooms23Adjacent += 1;
          continue;
        }
        const d3: DoorDef = { id: "d3", color: closedIn(room3.entryPhase), tiles: room3.boundary };
        const k3 = new Set([...k2, ...room3.tiles.map(coordKey), ...room3.boundary.map(coordKey)]);
        const r4Pool = FAR_TILES.filter((t) => !k3.has(coordKey(t)));
        const room23Keys = new Set([...room2Keys, ...room3.tiles.map(coordKey)]);
        if (r4Pool.length > maxR4Pool) maxR4Pool = r4Pool.length;
        if (r4Pool.length < 4) {
          skip.triplesShort += 1;
          continue;
        }
        for (const room4Tiles of chainRoomCandidates(r4Pool, QMAX)) {
          if (total >= BUDGET) break;
          const before4 = new Map(ROOM_FAIL);
          const room4 = roomFrom(room4Tiles, dev.arrivalPhase, dev.landing);
          if (room4 === null) {
            const r = firstChanged(before4);
            room4Fail.set(r, (room4Fail.get(r) ?? 0) + 1);
            skip.room4Unsealable += 1;
            continue;
          }
          room4Sealed += 1;
          if (room4.boundary.some((b) => !r4Pool.some((t) => coordKey(t) === coordKey(b)))) {
            skip.room4BoundaryOutside += 1;
            continue;
          }
          // published shape restriction #2: no R4 tile adjacent to an R2 or R3 tile
          if (room4.tiles.some((t) => gridNeighbours(t).some((n) => room23Keys.has(coordKey(n))))) {
            skip.rooms34Adjacent += 1;
            continue;
          }
          const d4: DoorDef = { id: "d4", color: closedIn(room4.entryPhase), tiles: room4.boundary };
          const k4 = new Set([...k3, ...room4.tiles.map(coordKey), ...room4.boundary.map(coordKey)]);
          const fPool = FAR_TILES.filter((t) => !k4.has(coordKey(t)));
          const goalPool = fPool.filter(
            (g) =>
              x(g) >= CX + 2 && // no column neighbour: else the goal is enterable from the corridor, which can hold no door
              walkNeighbours(g).length > 0 &&
              walkNeighbours(g).every((n) => fPool.some((t) => coordKey(t) === coordKey(n))),
          );
          if (goalPool.length === 0) {
            skip.noGoal += 1;
            continue;
          }
          if (fPool.length > maxFPoolOverGoal) maxFPoolOverGoal = fPool.length;
          groupsThisDev += 1;
          groups += 1;
          const s2Tiles = fPool;
          const s3Tiles = room2.tiles;
          const s4Tiles = room3.tiles;
          const s5Tiles = room4.tiles;
          let tried = 0;
          for (const s1Tile of s1Tiles) {
            if (tried >= CAP || total >= BUDGET) break;
            const s1: SwitchDef = {
              id: "s1",
              tile: s1Tile,
              activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s1Tile),
              targets: ["d1"],
            };
            for (const s2Tile of s2Tiles) {
              if (tried >= CAP || total >= BUDGET) break;
              const s2: SwitchDef = {
                id: "s2",
                tile: s2Tile,
                activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s2Tile),
                targets: ["d2"],
              };
              for (const s3Tile of s3Tiles) {
                if (tried >= CAP || total >= BUDGET) break;
                const s3: SwitchDef = {
                  id: "s3",
                  tile: s3Tile,
                  activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s3Tile),
                  targets: ["d3"],
                };
                for (const s4Tile of s4Tiles) {
                  if (tried >= CAP || total >= BUDGET) break;
                  const s4: SwitchDef = {
                    id: "s4",
                    tile: s4Tile,
                    activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s4Tile),
                    targets: ["d4"],
                  };
                  for (const s5Tile of s5Tiles) {
                    if (tried >= CAP || total >= BUDGET) break;
                    const s5: SwitchDef = {
                      id: "s5",
                      tile: s5Tile,
                      activePhase: farEntryPhase(dev.landing, dev.arrivalPhase, s5Tile),
                      targets: ["d5"],
                    };
                    for (const goal of goalPool) {
                      if (tried >= CAP || total >= BUDGET) break;
                      const sealTiles = walkNeighbours(goal);
                      if (
                        sealTiles.some((t) => coordKey(t) === coordKey(s2Tile)) ||
                        coordKey(goal) === coordKey(s2Tile)
                      ) {
                        skip.s2OnSeal += 1;
                        continue;
                      }
                      tried += 1;
                      total += 1;
                      const d5: DoorDef = {
                        id: "d5",
                        color: closedIn(standPhase(dev.landing, dev.arrivalPhase, goal)),
                        tiles: sealTiles,
                      };
                      const draft = {
                        id: BATCH_FIRST_ID,
                        width: W,
                        height: H,
                        startPhase: START_PHASE,
                        player: PLAYER,
                        goal,
                        phaseAWalls: COLUMN.a,
                        phaseBWalls: COLUMN.b,
                        doors: [d1, d2, d3, d4, d5],
                        switches: [s1, s2, s3, s4, s5],
                        portals: [{ id: "p1", pair: [dev.near, dev.landing] as const, activePhase: dev.nearPhase }],
                      };
                      const ctx: Context = {
                        cut,
                        device: dev,
                        rooms: [dev.pocket, room2, room3, room4],
                        doors: [d1, d2, d3, d4, d5],
                        presses: [s1, s2, s3, s4, s5],
                        goalRoom: {
                          tiles: [goal],
                          boundary: sealTiles,
                          entryPhase: standPhase(dev.landing, dev.arrivalPhase, goal),
                        },
                      };
                      const note =
                        `landing=${coordKey(dev.landing)} near=${coordKey(dev.near)}/${dev.nearPhase} ` +
                        `P=[${dev.pocket.tiles.map(coordKey).join(" ")}] d1=[${dev.pocket.boundary.map(coordKey).join(" ")}]/${d1.color} ` +
                        `s1=${coordKey(s1Tile)}/${s1.activePhase} ` +
                        `R2=[${room2.tiles.map(coordKey).join(" ")}] d2=[${room2.boundary.map(coordKey).join(" ")}]/${d2.color} s2=${coordKey(s2Tile)}/${s2.activePhase} ` +
                        `R3=[${room3.tiles.map(coordKey).join(" ")}] d3=[${room3.boundary.map(coordKey).join(" ")}]/${d3.color} s3=${coordKey(s3Tile)}/${s3.activePhase} ` +
                        `R4=[${room4.tiles.map(coordKey).join(" ")}] d4=[${room4.boundary.map(coordKey).join(" ")}]/${d4.color} s4=${coordKey(s4Tile)}/${s4.activePhase} ` +
                        `s5=${coordKey(s5Tile)}/${s5.activePhase} goal=${coordKey(goal)} d5=[${sealTiles.map(coordKey).join(" ")}]/${d5.color}`;
                      // the par band is the FILTER (the probe), the gates run on in-band boards only
                      const probe = probePar(draft);
                      if (probe.par < PAR_MIN || probe.par > PAR_MAX) {
                        const reason = probe.reason === "ok" ? "par-out-of-band" : probe.reason;
                        histogram.set(reason, (histogram.get(reason) ?? 0) + 1);
                        if (probe.par > 0) parHist.set(probe.par, (parHist.get(probe.par) ?? 0) + 1);
                        continue;
                      }
                      const { outcome, level } = judge(draft, ctx);
                      if (!outcome.accepted || level === null) {
                        histogram.set(outcome.reason, (histogram.get(outcome.reason) ?? 0) + 1);
                        if (outcome.par !== undefined)
                          misses.push({
                            reason: outcome.reason,
                            note,
                            par: outcome.par,
                            dexec: outcome.dexec ?? Number.NaN,
                            b: outcome.b ?? Number.NaN,
                            failing: (outcome.gates ?? []).filter((g) => !g.ok),
                          });
                        continue;
                      }
                      accepts.push({
                        par: outcome.par as number,
                        dexec: outcome.dexec ?? Number.NaN,
                        b: outcome.b ?? Number.NaN,
                        coverage: outcome.coverage ?? "?",
                        routes: outcome.routes ?? 0,
                        pressThenCross: outcome.pressThenCross ?? 0,
                        note,
                        level,
                      });
                      if (accepts.length <= 40)
                        console.log(
                          `  ACCEPT par=${String(outcome.par)} D_exec=${(outcome.dexec ?? 0).toFixed(6)} B=${(outcome.b ?? 0).toFixed(4)} ` +
                            `coverage=${String(outcome.coverage)} routes=${String(outcome.routes)} chain=${String(outcome.pressThenCross)}/${String(outcome.routes)}\n          ${note}`,
                        );
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (total >= BUDGET) {
        budgetHit = true;
        break;
      }
    }
  }
  if (total >= BUDGET) budgetHit = true;
  console.log(
    `\ncensus: ${String(accepts.length)} accept(s) of ${String(total)} judged candidate(s) over ${String(groups)} (R2,R3,R4) group(s) ` +
      `in ${((Date.now() - t0) / 1000).toFixed(1)} s · devices walked ${String(devicesDone)}/${String(devs.length)} · ` +
      `${String(PAIR_CAP)}-group cap hit on ${String(groupCapHits)} device(s) · global budget ${String(BUDGET)} ${budgetHit ? "HIT (the run is a deterministic PREFIX: the accept count is a floor, the refusal census is complete only within the prefix)" : "not reached (every device was walked to its own group cap)"}`,
  );
  console.log(
    `upstream skips: R2 sets not sealable ${String(skip.room2Unsealable)} ${[...room2Fail.entries()].map(([k, v]) => `(${k} ${String(v)})`).join(" ")} · ` +
      `R2 boundary outside the pool ${String(skip.room2BoundaryOutside)} · ${String(room2Sealed)} sealed R2 set(s) · ` +
      `devices with < 4 free tiles for R2 ${String(skip.devicesShort)} · (R2,R3) pairs with < 4 free tiles for R3 ${String(skip.pairsShort)} · ` +
      `R3 sets not sealable ${String(skip.room3Unsealable)} ${[...room3Fail.entries()].map(([k, v]) => `(${k} ${String(v)})`).join(" ")} · ` +
      `R3 boundary outside the pool ${String(skip.room3BoundaryOutside)} · ${String(room3Sealed)} sealed R3 set(s) · ` +
      `SHAPE FILTER #1 (an R3 tile adjacent to an R2 tile) ${String(skip.rooms23Adjacent)} (0 expected by the seal law) · ` +
      `(R2,R3,R4) groups with < 4 free tiles for R4 ${String(skip.triplesShort)} · ` +
      `R4 sets not sealable ${String(skip.room4Unsealable)} ${[...room4Fail.entries()].map(([k, v]) => `(${k} ${String(v)})`).join(" ")} · ` +
      `R4 boundary outside the pool ${String(skip.room4BoundaryOutside)} · ${String(room4Sealed)} sealed R4 set(s) · ` +
      `SHAPE FILTER #2 (an R4 tile adjacent to an R2 or R3 tile) ${String(skip.rooms34Adjacent)} (0 expected by the seal law) · ` +
      `no goal candidate ${String(skip.noGoal)} · s2 tile on the goal's seal or the goal itself ${String(skip.s2OnSeal)}`,
  );
  console.log(
    `tile accounting: largest R3 pool seen ${String(maxR3Pool)} tile(s) · largest R4 pool seen ${String(maxR4Pool)} tile(s) · ` +
      `largest free pool seen after a sealed R4 ${String(maxFPoolOverGoal)} tile(s) (that pool must hold the goal + its whole seal (≥ 2) + the s2 tile)`,
  );
  if (ROOM_FAIL.size > 0)
    console.log(`room rejections: ${[...ROOM_FAIL.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}`);
  console.log("rejection histogram:");
  for (const [k, v] of [...histogram.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${String(v)}`);
  console.log(
    `par census over every judged candidate (in band and out): ` +
      `${[...parHist.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${String(k)}:${String(v)}`).join(" ")}`,
  );
  console.log("accepts by par:");
  const byPar = new Map<number, Accept[]>();
  for (const a of accepts) {
    const list = byPar.get(a.par) ?? [];
    list.push(a);
    byPar.set(a.par, list);
  }
  for (const [p, list] of [...byPar.entries()].sort((a, b) => a[0] - b[0])) {
    const lo = Math.min(...list.map((a) => a.dexec));
    const hi = Math.max(...list.map((a) => a.dexec));
    console.log(
      `  par ${String(p)}: ${String(list.length)} accept(s), D_exec ${lo.toFixed(6)} … ${hi.toFixed(6)} ` +
        `(B ${Math.min(...list.map((a) => a.b)).toFixed(4)} … ${Math.max(...list.map((a) => a.b)).toFixed(4)})`,
    );
  }
  const atBand = misses.filter((m) => m.par >= PAR_MIN && m.par <= PAR_MAX);
  console.log(`in-band candidates refused by a gate: ${String(atBand.length)}`);
  for (const m of atBand.sort((a, b) => b.dexec - a.dexec).slice(0, 6)) {
    console.log(`  par=${String(m.par)} D_exec=${m.dexec.toFixed(6)} B=${m.b.toFixed(4)} [${m.reason}]\n    ${m.note}`);
    for (const g of m.failing ?? []) console.log(`      ${g.id}: ${g.detail}`);
  }
  writeFileSync(ACCEPTS, `${JSON.stringify(accepts)}\n`);
  console.log(`wrote ${String(accepts.length)} accept(s) to ${ACCEPTS}`);
  return accepts;
}

// ─────────────────────────────────────────────────────────────────────────────
// 0d. The frame's ROOM CAPACITY — how many walk-sealed rooms a frame can host
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **The capacity census** (`--stage=roomcap`): how many mutually disjoint
 * walk-sealed rooms a frame can hold at all, and why so few.
 *
 * The question it answers is the one the 3-pocket census raised: the chained
 * sub-lattice needs **three** walk-sealed rooms (`P`, `R2`, `R3`) *plus* the goal's
 * own seal, so if the frame's maximum number of pairwise disjoint sealed rooms is 2,
 * the class is empty by arithmetic and not by a search that gave up.
 *
 * Sealability is `roomFrom`'s measurement and it has a derivable shape: every tile of
 * a sealed room that has a neighbour outside the room is *entered from the room* in
 * the phase `standPhase(t)`, and `standPhase` depends only on `parity(t)` — so **every
 * outward-facing tile of a sealed room must have the same `(x+y)` parity**, and the
 * other parity's tiles must be strictly interior. That is why the frame's sealed rooms
 * are corner/edge shapes (a tile with an out-of-bounds or phase-walled neighbour needs
 * fewer companions), and why a room of two adjacent tiles can almost never seal: both
 * of them face outward, and neighbours of a tile alternate parity by construction.
 *
 * Reported per **(landing parity, arrival phase)** class — the four classes a device
 * can be in; a single board lives in exactly one — with the size histogram, the maximum
 * pairwise-disjoint count (tiles ∪ door tiles disjoint, so two rooms may not share a
 * door tile) and the search's own completion flag, so a truncated search can never be
 * read as an exact capacity.
 */
function stageRoomCap(): void {
  const MAX = Number(argOf("maxsize") ?? "4");
  const classes: { label: string; landing: Coord; arrivalPhase: Phase }[] = [];
  for (const parityClass of [0, 1]) {
    const landing = FAR_TILES.find((t) => parity(t) === parityClass) as Coord;
    for (const arrivalPhase of ["A", "B"] as Phase[]) {
      classes.push({ label: `parity(${String(parityClass)}) arrival ${arrivalPhase}`, landing, arrivalPhase });
    }
  }
  console.log(
    `\nroom-capacity census at ${String(W)}×${String(H)}, CX=${String(CX)} (${String(FAR_TILES.length)} far tile(s)) · ` +
      `connected tile sets of size 1..${String(MAX)} · sealability = roomFrom (single-phase boundary, no column leak, connected)`,
  );
  for (const cls of classes) {
    const rooms: { tiles: Coord[]; boundary: Coord[] }[] = [];
    const sizeHist = new Map<number, number>();
    for (let size = 1; size <= MAX; size += 1) {
      const gen: Coord[][] = [];
      if (size === 1) for (const t of FAR_TILES) gen.push([t]);
      else {
        const prev = size === 2 ? roomCandidates(FAR_TILES, 2) : roomCandidates(FAR_TILES, size);
        for (const set of prev) if (set.length === size) gen.push(set);
      }
      for (const set of gen) {
        const room = roomFrom(set, cls.arrivalPhase, cls.landing);
        if (room === null) continue;
        rooms.push({ tiles: [...room.tiles], boundary: [...room.boundary] });
        sizeHist.set(size, (sizeHist.get(size) ?? 0) + 1);
      }
    }
    // the disjointness search: rooms may not share a tile with another room's tiles or door tiles
    const keys = rooms.map((r) => new Set([...r.tiles, ...r.boundary].map(coordKey)));
    const compatible = (i: number, j: number): boolean => {
      for (const k of keys[i] as Set<string>) if ((keys[j] as Set<string>).has(k)) return false;
      return true;
    };
    let best: number[] = [];
    let nodes = 0;
    const NODE_CAP = 4_000_000;
    let complete = true;
    const search = (start: number, chosen: number[]): void => {
      if (nodes > NODE_CAP) {
        complete = false;
        return;
      }
      nodes += 1;
      if (chosen.length > best.length) best = [...chosen];
      for (let i = start; i < rooms.length; i += 1) {
        if (!complete) return;
        if (chosen.some((c) => !compatible(c, i))) continue;
        chosen.push(i);
        search(i + 1, chosen);
        chosen.pop();
      }
    };
    search(0, []);
    const witness = best.map((i) => `[${(rooms[i] as { tiles: Coord[] }).tiles.map(coordKey).join(" ")}]←[${(rooms[i] as { boundary: Coord[] }).boundary.map(coordKey).join(" ")}]`);
    const multi = rooms.filter((r) => r.tiles.length >= 2).length;
    console.log(
      `\nclass ${cls.label} (landing representative ${coordKey(cls.landing)}): ${String(rooms.length)} sealed room(s) ` +
        `[${[...sizeHist.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `size ${String(k)}:${String(v)}`).join(" · ")}] of which ` +
        `${String(multi)} are multi-tile (size ≥ 2 — a walk-sealed room the chain needs)`,
    );
    console.log(
      `  maximum pairwise-disjoint set (tiles ∪ door tiles): ${String(best.length)} room(s)` +
        `${complete ? "" : ` — SEARCH TRUNCATED at ${String(NODE_CAP)} nodes, so this is a lower bound, not the capacity`}`,
    );
    for (const w of witness) console.log(`    ${w}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// S. Selection — the five rungs, by a derived (not tasted) rule
// ─────────────────────────────────────────────────────────────────────────────

/**
 * **The selection rule, published before it runs.**
 *
 * 1. Rungs are `L21 … L25` (batch 1) or `L26 … L30` (batch 2, `--batch=2`) in that
 *    order; every member must have `par` strictly inside Act II's 16–24 band (17…23)
 *    and `D_exec` inside `[19.75, 29.0625]` (printed `[19.75, 29.06]`); `B` inside the measured band.
 * 2. **`D_exec` must strictly rise along the batch** — batch 1 only. §7.3's act law
 *    calls the plateau an act-open property and the batch proved the rise; **LV-014
 *    amends this clause for batch 2 by design, and the amendment is published before
 *    the run**: §7.3 grants an act's interior in *any* order ("a member of an act sits
 *    anywhere inside the act's `D_exec` band, in any order (variety)"), the across-act
 *    `act-peak` clause was discharged by batch 1 (27.604651 > 24.729412) and rides on
 *    an act's *measured maximum*, never on every interior member. A second batch
 *    inside the same act therefore carries **no rising-`D_exec` obligation**, and
 *    imposing one would re-apply batch 1's ladder law to a different set — the tool
 *    prints each rung's `ΔD_exec` beside the ladder so the interior's shape is visible
 *    whether or not the clause is in force.
 * 3. Among the admissible five-rung ladders, prefer the one that maximises the number
 *    of `Δpar ≥ 2` steps (§6.1.1 P2), then the one whose **minimal** per-rung `D_exec`
 *    is largest (so the selection is not merely the cheapest board at each par), then
 *    the lowest total `D_exec` spread (fewer ties to break by enumeration order).
 * 3b. **`--batch=2` does not search a par set at all — it mirrors batch 1's**, read
 *    from `ACT_II_B1_LADDER` (17 / 18 / 20 / 21 / 23, the law's constant, never typed):
 *    clause 3 above is a *search* over admissible par combos, and it exists because
 *    batch 1 had no comparator. Batch 2 does — batch 1 is registered — and the batch's
 *    published thesis is "the same plan shape one pocket deeper", so its par set is
 *    **fixed by the mirror** and the only rule left inside it is the within-par
 *    tie-break (minimal `D_exec`, then enumeration order). The search collapses to one
 *    combo; the equal-par `ΔD_exec` against each rung's batch-1 comparator is printed
 *    beside the ladder, and every rung's chain length (`chain = presses = 4`) is
 *    printed with it, so "longer chain at equal par" is a measurement, not a claim.
 * 4. **Clause added by LV-012 before anything was written** — §6.1.4 / `src/levels/README.md`
 *    §2e-4: *"a spawn/goal/portal triple already present in the shipped set or among the
 *    landed candidates is skipped outright, so a new rung can never be the previous board
 *    with more moves."* Read here over the **stricter seal-inclusive** key (spawn · goal ·
 *    portal pair · every door tile), so the constraint bites on doors too: no rung may key
 *    an existing board, and the five rungs must carry **five distinct** keys. Amended
 *    before the write, and the first rule draft was measured to violate it (two rungs at
 *    `landing 5,5 / near 0,5` with identical portals and doors — a clone-and-perturb of the
 *    same skeleton, exactly what §6.1.4 names), which is why the clause is a *filter* and
 *    not a preference.
 *
 * The par-step preference is a *preference*, not a gate, and that is itself a measured
 * finding: five rungs inside a 7-wide par window cannot all step by 2 — `17 + 2·4 = 25 >
 * 23`, so at most two steps can be 2 (spread ≤ 6 over four steps). The violated step is
 * reported beside the ladder, never hidden.
 */
/**
 * **Batch 3's own par multiset** — the published rule (header, selection rule 1–3), executed
 * as a *derivation*, never a search:
 *
 * 1. `UNUSED := [ACT_II_PAR_BAND] \ {par of every ACT_II_B1_LADDER row}` — read from the
 *    law constants, so batch 1/2's 17/18/20/21/23 can never appear here.
 * 2. Restrict `UNUSED` to the pars **this census's accept pool actually supports**; a par
 *    with an empty pool is **absent**, and it is never substituted from batch 1's set (the
 *    anti-mirror clause forbids exactly that substitution).
 * 3. The batch is five rungs (§7.2), so the supported set is padded to five by repeating the
 *    **highest** supported pars in descending order — the act's ceiling first, because
 *    §7.3.2 asks Act II's maximum to be carried by the closing batch. Every repeat is
 *    printed with its reason; nothing is silent.
 */
function batch3ParMultiset(byPar: ReadonlyMap<number, readonly Accept[]>): number[] {
  const used = new Set(ACT_II_B1_LADDER.map((r) => r.par));
  const unused: number[] = [];
  for (let p = ACT_II_PAR_BAND[0]; p <= ACT_II_PAR_BAND[1]; p += 1) if (!used.has(p)) unused.push(p);
  const supported = unused.filter((p) => (byPar.get(p) ?? []).length > 0);
  const absent = unused.filter((p) => !supported.includes(p));
  console.log(
    `selection: batch 3 OWN par set (anti-mirror, §7.8 item 4) — in-band pars batch 1's registered ladder does not use: ` +
      `[${unused.join(", ")}] (derived: Act II band ${String(ACT_II_PAR_BAND[0])}..${String(ACT_II_PAR_BAND[1])} minus ` +
      `ACT_II_B1_LADDER=[${ACT_II_B1_LADDER.map((r) => String(r.par)).join(", ")}]) · supported by this census's pool: ` +
      `[${supported.join(", ")}]${absent.length > 0 ? ` · ABSENT (empty pool, never substituted): [${absent.join(", ")}]` : ""}`,
  );
  if (supported.length === 0) return [];
  const out = [...supported];
  const pool = [...supported].sort((a, b) => b - a);
  let i = 0;
  while (out.length < RUNG_COUNT) {
    const p = pool[i % pool.length] as number;
    out.push(p);
    console.log(
      `selection: repeat #${String(out.length - supported.length)} — par ${String(p)} used again (the supported set holds ` +
        `${String(supported.length)} of the ${String(RUNG_COUNT)} rungs §7.2 asks for; repeats run down from the act's ceiling, §7.3.2)`,
    );
    i += 1;
  }
  // header rule 3: ascending par, so the ladder rises to its ceiling; within a repeated par the
  // ladder construction orders the two rungs by ascending D_exec (rule 3/4).
  return out.sort((a, b) => a - b);
}

/**
 * **Batch 4's own par ladder** — the published rule (header, rules 1–4), executed as a
 * **derivation**, never a search:
 *
 * 1. `DERIVED := [ACT_II_PAR_CEILING − 2·k for k = 0 … RUNG_COUNT − 1]`, kept where it is
 *    `≥ ACT_II_PAR_FLOOR` — **read from the law module's band endpoints, never typed**. With
 *    `[16, 24]` and 5 rungs this is `[16, 18, 20, 22, 24]`, the **unique** five-member ladder
 *    whose every step is exactly §6.1.1's P2 minimum `Δpar = 2`: `4 × 2 = 8` is the band's own
 *    width, so the ladder must use both endpoints and no step can exceed 2. The span check is
 *    printed beside it — if a future band edit broke the identity, the printed deviation says so
 *    (anchored at the ceiling, truncated at the floor) instead of a silently different ladder.
 * 2. Restricted to the pars **this census's accept pool actually supports**; a par with an empty
 *    pool is **ABSENT** and is never substituted (batch 3's clause, kept).
 * 3. Padded to five rungs (§7.2) by repeating the ladder's **own highest supported pars,
 *    descending** — the act's ceiling first, because §7.3.2 asks the act's maximum to be carried
 *    late. Every repeat prints its reason.
 */
function batch4ParMultiset(byPar: ReadonlyMap<number, readonly Accept[]>): number[] {
  const derived: number[] = [];
  for (let k = 0; k < RUNG_COUNT; k += 1) {
    const p = ACT_II_PAR_CEILING - 2 * k;
    if (p >= ACT_II_PAR_FLOOR) derived.push(p);
  }
  derived.sort((a, b) => a - b);
  const bandWidth = ACT_II_PAR_CEILING - ACT_II_PAR_FLOOR;
  const span = (RUNG_COUNT - 1) * 2;
  console.log(
    `selection: batch 4 P2-exact ladder (header rule 2) — anchored at the act's ceiling ${String(ACT_II_PAR_CEILING)} and stepping down ` +
      `by §6.1.1's P2 minimum 2: [${derived.join(", ")}] (derived from Act II's band endpoints ` +
      `[${String(ACT_II_PAR_FLOOR)}, ${String(ACT_II_PAR_CEILING)}] read from the law module; ` +
      `${String(RUNG_COUNT)} rungs × step 2 spans ${String(span)}, the band's own width ${String(bandWidth)} — ` +
      `${span === bandWidth ? "the derivation is UNIQUE and every step is exactly 2" : "the ladder does NOT span the band: printed as a deviation, anchored at the ceiling and truncated at the floor, never smoothed"})`,
  );
  const supported = derived.filter((p) => (byPar.get(p) ?? []).length > 0);
  const absent = derived.filter((p) => !supported.includes(p));
  if (absent.length > 0)
    console.log(
      `selection: ABSENT (empty pool, never substituted): [${absent.join(", ")}] — a par the census does not support is dropped, ` +
        `and no registered ladder's par is borrowed to fill it (§7.8 item 4)`,
    );
  if (supported.length === 0) return [];
  const out = [...supported];
  const pool = [...supported].sort((a, b) => b - a);
  let i = 0;
  while (out.length < RUNG_COUNT) {
    const p = pool[i % pool.length] as number;
    out.push(p);
    console.log(
      `selection: repeat #${String(out.length - supported.length)} — par ${String(p)} used again (the P2-exact ladder supports ` +
        `${String(supported.length)} of the ${String(RUNG_COUNT)} rungs §7.2 asks for; repeats run down from the act's ceiling, §7.3.2)`,
    );
    i += 1;
  }
  return out.sort((a, b) => a - b);
}

function selectBatch(accepts: readonly Accept[]): { level: Level; accept: Accept }[] {
  const requireRise = BATCH === 1;
  /**
   * Batch 2's published **par mirror** (header, selection rule 1): the par set is not
   * searched, it is the registered batch-1 ladder's pars, read from the law constant.
   */
  const mirror = BATCH === 2 ? ACT_II_B1_LADDER.map((r) => r.par) : null;
  const takenKeys = new Set(cloneGuardCensus(true).keys());
  const inBand = accepts.filter(
    (a) =>
      a.par >= PAR_MIN &&
      a.par <= PAR_MAX &&
      a.dexec >= ACT2_EXEC_BAND[0] &&
      a.dexec <= ACT2_EXEC_BAND[1] &&
      a.b >= BLOCK_L1619_B_BAND[0] &&
      a.b <= BLOCK_L1619_B_BAND[1] &&
      Number.isFinite(a.dexec),
  );
  const usable = inBand.filter((a) => !takenKeys.has(cloneKeyOf(a.level)));
  console.log(
    `\nselection filter: ${String(inBand.length)} accept(s) inside the bands · ` +
      `${String(inBand.length - usable.length)} refused by the §6.1.4 clone guard (key already taken by a shipped board) · ` +
      `${String(usable.length)} usable · ${String(takenKeys.size)} key(s) already taken`,
  );
  const byPar = new Map<number, Accept[]>();
  for (const a of usable) {
    const list = byPar.get(a.par) ?? [];
    list.push(a);
    byPar.set(a.par, list);
  }
  for (const list of byPar.values()) list.sort((p, q) => p.dexec - q.dexec);
  const pars = [...byPar.keys()].sort((a, b) => a - b);
  const combos: number[][] = [];
  const pick = (start: number, acc: number[]): void => {
    if (acc.length === 5) {
      combos.push([...acc]);
      return;
    }
    for (let i = start; i < pars.length; i += 1) {
      acc.push(pars[i] as number);
      pick(i + 1, acc);
      acc.pop();
    }
  };
  if (mirror === null && BATCH !== 3 && BATCH !== 4) {
    pick(0, []);
  } else if (mirror !== null) {
    // The published mirror: exactly ONE combo, and it is the law's par list — never a search.
    const absent = mirror.filter((p) => !byPar.has(p));
    if (absent.length > 0) {
      console.log(
        `selection: the published par mirror [${mirror.join(", ")}] has no admissible accept at par ` +
          `${absent.join(", ")} — report the census, never fabricate a rung (no par substitution: ` +
          `substituting a par would move the comparator the batch exists to compare against)`,
      );
      return [];
    }
    console.log(
      `selection: par mirror ACTIVE (batch 2's published rule) — pars [${mirror.join(", ")}] read from ` +
        `ACT_II_B1_LADDER (registered batch 1, ids ${ACT_II_B1_IDS.join("–")}); the par set is mirrored, not searched, ` +
        `and the only rule inside it is the within-par tie-break (minimal D_exec, then enumeration order)`,
    );
    combos.push(mirror);
  } else if (BATCH === 4) {
    // Batch 4's own P2-exact ladder (published rule 2): derived, then executed as ONE combo.
    const own = batch4ParMultiset(byPar);
    if (own.length !== RUNG_COUNT) {
      console.log(
        `selection: batch 4's derived ladder is [${own.join(", ")}] — the census supports no usable par at all on this frame, so no rung ` +
          `is fabricated and NO par is borrowed from a registered ladder (published rule 8). The census is reported as a NAMED ACT ` +
          `LIMITATION and the only published fallback is re-running the same device + ladder on the other frame this device has been ` +
          `non-empty on (CX = 1, 7×6) — this tool does not silently switch frames.`,
      );
      return [];
    }
    console.log(
      `selection: batch 4 par multiset [${own.join(", ")}] · ascending par, the closing-par rungs ordered by ascending D_exec; the ` +
        `batch's LAST rung takes the within-par MAXIMUM D_exec (published departure, header rule 4, so the act's maximum is carried as ` +
        `late as the family permits); the ladder is DERIVED from the band endpoints + P2, never mirrored (§7.8 item 4)`,
    );
    combos.push(own);
  } else {
    // Batch 3's OWN par set (published rule 1–3): derived, then executed as ONE combo.
    const own = batch3ParMultiset(byPar);
    if (own.length !== RUNG_COUNT) {
      console.log(
        `selection: batch 3's own par set is [${own.join(", ")}] — the census supports no usable par at all, so no rung is ` +
          `fabricated and NO par is substituted from batch 1's set (§7.8 item 4's anti-mirror clause). The census is reported ` +
          `as a NAMED ACT LIMITATION and the §7.8 item 3 fallback (the par-23 class reach 27.746988, C path with its own ADR) ` +
          `is briefed to the Game Designer — this tool does not decide it.`,
      );
      return [];
    }
    console.log(
      `selection: batch 3 par multiset [${own.join(", ")}] · ascending par, the two closing-par rungs ordered by ascending ` +
        `D_exec; the batch's LAST rung takes the within-par MAXIMUM D_exec (published departure, header rule 4, so §7.3.2's ` +
        `act-close maximum lands on the batch's own last rung); no equal-par comparator exists by construction (anti-mirror)`,
    );
    combos.push(own);
  }
  interface Ladder {
    levels: { level: Level; accept: Accept }[];
    score: [number, number, number];
    pars: number[];
    keySkips: string[];
  }
  let best: Ladder | null = null;
  let comboCloneBlocked = 0;
  let comboNoRise = 0;
  for (const combo of combos) {
    // greedy minimal-D_exec ladder inside this par combo, distinct keys — strictly rising
    // for batch 1 (its published clause 2), free otherwise (batch 2's published amendment)
    let prev = Number.NEGATIVE_INFINITY;
    const chosen: { level: Level; accept: Accept }[] = [];
    const usedKeys = new Set<string>();
    /** `--batch=2` only: rows a par's pool offered *below* the one taken, and why they were skipped. */
    const keySkips: string[] = [];
    let ok = true;
    for (let rungIndex = 0; rungIndex < combo.length; rungIndex += 1) {
      const p = combo[rungIndex] as number;
      const all = byPar.get(p) ?? [];
      const pool = requireRise ? all.filter((a) => a.dexec > prev) : all;
      /**
       * Batch 3's and batch 4's published tie-break **departure** (header rule 4): the batch's
       * LAST rung takes the within-par **maximum** `D_exec` (every other rung keeps batch 1/2's
       * minimal-`D_exec` rule), so §7.3.2's maximum is carried by the batch's last rung rather
       * than by its interior. Printed per rung, never silent.
       */
      const takeMax = (BATCH === 3 || BATCH === 4) && rungIndex === combo.length - 1;
      const ordered = takeMax ? [...pool].reverse() : pool;
      let candidate: Accept | undefined;
      let skippedByKey = 0;
      for (const a of ordered) {
        if (usedKeys.has(cloneKeyOf(a.level))) {
          skippedByKey += 1;
          continue;
        }
        candidate = a;
        break;
      }
      if (candidate !== undefined && skippedByKey > 0) {
        keySkips.push(
          `par ${String(p)}: ${String(skippedByKey)} ${takeMax ? "higher" : "lower"}-D_exec row(s) refused by the rung-key-wide ` +
            `distinct clause (the rung already keyed the batch) → took ${candidate.dexec.toFixed(6)}`,
        );
      }
      if (candidate !== undefined && takeMax) {
        keySkips.push(
          `par ${String(p)} (L${String(BATCH_FIRST_ID + rungIndex)}): the closing rung took the within-par MAXIMUM D_exec ` +
            `${candidate.dexec.toFixed(6)} (published departure, header rule 4 — §7.3.2 asks the act's maximum to be carried ` +
            `late); the par's minimum is ${(pool[0] as Accept).dexec.toFixed(6)}`,
        );
      }
      if (candidate === undefined) {
        ok = false;
        if (pool.length > 0) comboCloneBlocked += 1;
        else comboNoRise += 1;
        break;
      }
      chosen.push({ level: candidate.level, accept: candidate });
      usedKeys.add(cloneKeyOf(candidate.level));
      prev = candidate.dexec;
    }
    if (!ok) continue;
    const steps2 = combo
      .map((p, i) => (i === 0 ? null : p - (combo[i - 1] ?? 0)))
      .filter((d): d is number => d !== null && d >= 2).length;
    const first = chosen[0];
    const last = chosen[chosen.length - 1];
    if (first === undefined || last === undefined) continue;
    const minExec = Math.min(...chosen.map((c) => c.accept.dexec));
    const spread = last.accept.dexec - first.accept.dexec;
    const score: [number, number, number] = [steps2, minExec, -spread];
    const incumbent: Ladder | null = best;
    if (
      incumbent === null ||
      score[0] > incumbent.score[0] ||
      (score[0] === incumbent.score[0] && score[1] > incumbent.score[1]) ||
      (score[0] === incumbent.score[0] && score[1] === incumbent.score[1] && score[2] > incumbent.score[2])
    )
      best = { levels: chosen, score, pars: combo, keySkips };
  }
  if (best === null) {
    console.log("selection: NO admissible ladder in the accept set — report the census, never fabricate a rung");
    return [];
  }
  console.log(
    `\nselection: ${String(combos.length)} par combo(s) tried · rising-D_exec clause ${requireRise ? `IN FORCE (batch ${String(BATCH)}'s published rule)` : `NOT in force (batch ${String(BATCH)}'s published amendment: §7.3 interior freedom; the across-act clause rode on batch 1's peak)`} · ` +
      `${String(comboNoRise)} dropped by it · ${String(comboCloneBlocked)} dropped by the clone clause (a par's whole in-band pool keyed on already-used geometry)`,
  );
  console.log(
    `selection: pars [${best.pars.join(", ")}] · Δpar≥2 steps ${String(best.score[0])}/4 · ` +
      `min D_exec ${best.score[1].toFixed(6)} · spread ${(-best.score[2]).toFixed(6)}`,
  );
  const batchKeys = new Set(best.levels.map((c) => cloneKeyOf(c.level)));
  console.log(
    `clone census on the ladder: ${String(batchKeys.size)} distinct §6.1.4 key(s) over ${String(best.levels.length)} rung(s) · ` +
      `${String(best.levels.filter((c) => takenKeys.has(cloneKeyOf(c.level))).length)} key(s) colliding with a shipped board`,
  );
  for (let i = 0; i < best.levels.length; i += 1) {
    const c = best.levels[i] as { level: Level; accept: Accept };
    const prev = i === 0 ? null : (best.levels[i - 1] as { level: Level; accept: Accept }).accept;
    const dExecDelta = prev === null ? "n/a" : (c.accept.dexec - prev.dexec).toFixed(6);
    const parDelta = prev === null ? "n/a" : String(c.accept.par - prev.par);
    console.log(
      `  L${String(BATCH_FIRST_ID + i)} par=${String(c.accept.par)} D_exec=${c.accept.dexec.toFixed(6)} B=${c.accept.b.toFixed(4)} ` +
        `coverage=${c.accept.coverage} chain=${String(c.accept.pressThenCross)}/${String(c.accept.routes)} ` +
        `Δpar=${parDelta} ΔD_exec=${dExecDelta}\n` +
        `    key=${cloneKeyOf(c.level)}\n    ${c.accept.note}`,
    );
  }
  if (mirror !== null) {
    // The batch's own measurement, printed as such: at EQUAL par, what does the extra door cost?
    if (best.keySkips.length > 0) {
      console.log(
        "\nmirror note — where the within-par minimum was *not* taken (the rung-key distinct clause is a filter, so the\n" +
          "  selected rung is the par's minimal D_exec among rows whose key is still free; each skip is printed, never silent):",
      );
      for (const s of best.keySkips) console.log(`  ${s}`);
    }
    console.log("\nmirror comparison (equal par, chain 4 vs batch 1's 3 presses — a measurement, never a claim):");
    for (let i = 0; i < best.levels.length; i += 1) {
      const c = best.levels[i] as { level: Level; accept: Accept };
      const ref = ACT_II_B1_LADDER.find((r) => r.par === c.accept.par);
      if (ref === undefined) continue;
      console.log(
        `  par ${String(c.accept.par)}: L${String(ref.id)} ${ref.dexec.toFixed(6)} (3 presses) → ` +
          `L${String(BATCH_FIRST_ID + i)} ${c.accept.dexec.toFixed(6)} (4 presses, chain ` +
          `${String(c.accept.pressThenCross)}/${String(c.accept.routes)} routes) · ΔD_exec ` +
          `${(c.accept.dexec - ref.dexec).toFixed(6)} · ΔB ${(c.accept.b - ref.b).toFixed(4)}`,
      );
    }
    const peak = best.levels[best.levels.length - 1] as { level: Level; accept: Accept };
    console.log(
      `  peak rung L${String(BATCH_FIRST_ID + best.levels.length - 1)} D_exec ${peak.accept.dexec.toFixed(6)} vs Act I's measured peak ` +
        `${ACT_I_REGISTERED_PEAK_EXEC.toFixed(6)} (Δ ${(peak.accept.dexec - ACT_I_REGISTERED_PEAK_EXEC).toFixed(6)}, §7.3 act-peak) and vs the registered ` +
        `Act II peak ${ACT_II_B1_REGISTERED_PEAK_EXEC.toFixed(6)} (Δ ${(peak.accept.dexec - ACT_II_B1_REGISTERED_PEAK_EXEC).toFixed(6)}) — ` +
        `a shelf file moves neither constant; the census rows ABOVE ${ACT_II_B1_REGISTERED_PEAK_EXEC.toFixed(6)} are reported in the dossier as measurements, not selected`,
    );
  }
  if (BATCH === 3) {
    if (best.keySkips.length > 0) {
      console.log(
        "\nbatch-3 note — every departure from batch 1/2's within-par tie-break, printed (a filter is never silent):",
      );
      for (const s of best.keySkips) console.log(`  ${s}`);
    }
    const peak = best.levels[best.levels.length - 1] as { level: Level; accept: Accept };
    const maxRung = best.levels.reduce(
      (acc, c) => (c.accept.dexec > acc.accept.dexec ? c : acc),
      best.levels[0] as { level: Level; accept: Accept },
    );
    console.log(
      `\nact-close reading (§7.3.2 / §7.8 items 1–2) — batch 3's measured MAXIMUM is L${String(BATCH_FIRST_ID + best.levels.indexOf(maxRung))} ` +
        `at D_exec ${maxRung.accept.dexec.toFixed(6)} (par ${String(maxRung.accept.par)}): vs the registered Act II peak ` +
        `${ACT_II_B1_REGISTERED_PEAK_EXEC.toFixed(6)} → Δ ${(maxRung.accept.dexec - ACT_II_B1_REGISTERED_PEAK_EXEC).toFixed(6)} ` +
        `${maxRung.accept.dexec > ACT_II_B1_REGISTERED_PEAK_EXEC ? "STRICTLY ABOVE — the clause is DISCHARGED by measurement" : "NOT above — the clause FAILS and the batch must not be written"}; ` +
        `vs Act I's measured peak ${ACT_I_REGISTERED_PEAK_EXEC.toFixed(6)} → Δ ${(maxRung.accept.dexec - ACT_I_REGISTERED_PEAK_EXEC).toFixed(6)} (act-peak, §7.3)`,
    );
    console.log(
      `  last rung L${String(BATCH_FIRST_ID + best.levels.length - 1)} par=${String(peak.accept.par)} D_exec=${peak.accept.dexec.toFixed(6)} ` +
        `(the pre-published rule put the batch's maximum on the closing rung: ${peak.accept.dexec === maxRung.accept.dexec ? "holding" : "NOT holding — the pool's other rows carry it, printed as a measurement"})`,
    );
    const l30 = 27.566265;
    const l31 = best.levels[0] as { level: Level; accept: Accept };
    console.log(
      `  §7.8 item 5 relief check: L31 D_exec ${l31.accept.dexec.toFixed(6)} vs shelf L30 ${l30.toFixed(6)} → Δ ` +
        `${(l31.accept.dexec - l30).toFixed(6)} ${l31.accept.dexec < l30 ? "(BELOW — the §7.3.1 label must be published in the dossier BEFORE --write)" : "(at or above — no relief seam exists, the label is recorded as not fired)"}`,
    );
    const equalPar = best.levels.filter((c) => ACT_II_B1_LADDER.some((r) => r.par === c.accept.par));
    console.log(
      `  anti-mirror check: ${equalPar.length === 0 ? "0 rungs share a par with the registered batch-1 ladder — the batch carries its OWN par set (§7.8 item 4), so no equal-par comparator exists on purpose" : `${String(equalPar.length)} rung(s) DO share a batch-1 par — the anti-mirror clause is violated`}`,
    );
  }
  if (BATCH === 4) {
    // Published rule 9: batch 4 has NO act-close refusal branch. §7.3.2's obligation was
    // discharged inside batches 2–3 (L35 = 28.339426), so this batch prints its measured
    // maximum as a READING against the three registered data — it neither re-carries the
    // clause nor invents a second one to fail.
    if (best.keySkips.length > 0) {
      console.log(
        "\nbatch-4 note — every departure from batch 1/2's within-par tie-break, printed (a filter is never silent):",
      );
      for (const s of best.keySkips) console.log(`  ${s}`);
    }
    const last = best.levels[best.levels.length - 1] as { level: Level; accept: Accept };
    const maxRung = best.levels.reduce(
      (acc, c) => (c.accept.dexec > acc.accept.dexec ? c : acc),
      best.levels[0] as { level: Level; accept: Accept },
    );
    console.log(
      `\nact-close READING (§7.3.2, obligation already discharged at L35 — no refusal branch on this batch) — batch 4's measured MAXIMUM is ` +
        `L${String(BATCH_FIRST_ID + best.levels.indexOf(maxRung))} at D_exec ${maxRung.accept.dexec.toFixed(6)} (par ${String(maxRung.accept.par)}, ` +
        `B ${maxRung.accept.b.toFixed(4)}, chain ${String(maxRung.accept.pressThenCross)}/${String(maxRung.accept.routes)}): ` +
        `vs the registered Act II tail ${ACT_II_R005A_REGISTERED_TAIL_EXEC.toFixed(6)} (L35) → Δ ${(maxRung.accept.dexec - ACT_II_R005A_REGISTERED_TAIL_EXEC).toFixed(6)}; ` +
        `vs the registered batch-1 peak ${ACT_II_B1_REGISTERED_PEAK_EXEC.toFixed(6)} → Δ ${(maxRung.accept.dexec - ACT_II_B1_REGISTERED_PEAK_EXEC).toFixed(6)}; ` +
        `vs Act I's measured peak ${ACT_I_REGISTERED_PEAK_EXEC.toFixed(6)} → Δ ${(maxRung.accept.dexec - ACT_I_REGISTERED_PEAK_EXEC).toFixed(6)}`,
    );
    console.log(
      `  reading, not a clause: this batch does NOT carry §7.3.2's obligation (L35 holds it) and the tool has no act-close REFUSAL branch here. ` +
        `${maxRung.accept.dexec < ACT_II_R005A_REGISTERED_TAIL_EXEC ? "The act's registered maximum therefore stays at L35 — a deep family on a larger frame measures a LOWER B, which is the shape finding this batch reports rather than pads" : "the batch's maximum meets or exceeds the registered tail — also reported as a reading, since a shelf file moves no constant"}`,
    );
    console.log(
      `  last rung L${String(BATCH_FIRST_ID + best.levels.length - 1)} par=${String(last.accept.par)} D_exec=${last.accept.dexec.toFixed(6)} ` +
        `(the pre-published rule put the batch's maximum on the closing rung: ${last.accept.dexec === maxRung.accept.dexec ? "HOLDING" : "NOT holding — the pool's other rows carry it, printed as a measurement, never re-picked"})`,
    );
    // §7.8 item 5 relief seam: L36 sits under the same-family registered tail L35.
    const l35 = ACT_II_R005A_REGISTERED_TAIL_EXEC;
    const l36 = best.levels[0] as { level: Level; accept: Accept };
    const dPar = l36.accept.par - 24; // L35's registered par, the act's ceiling
    console.log(
      `  §7.8 item 5 relief check (L35 → L36 seam): L36 D_exec ${l36.accept.dexec.toFixed(6)} · par ${String(l36.accept.par)} · B ${l36.accept.b.toFixed(4)} vs ` +
        `shelf L35 ${l35.toFixed(6)} · par 24 · B 1.4465 → Δpar ${dPar >= 0 ? "+" : ""}${String(dPar)}, ΔB ${(l36.accept.b - 1.4465).toFixed(4)}, ` +
        `ΔD_exec ${(l36.accept.dexec - l35).toFixed(6)} ${l36.accept.dexec < l35 ? "(BELOW — §7.8 item 5 fires and the §7.3.1-form label with this decomposition must be published in the dossier BEFORE --write)" : "(at or above — the seam does not fire; recorded as not fired)"}`,
    );
    // §7.8 item 4, in spirit: the batch's par SET, vs every registered Act II par.
    const registered = new Set<number>([...ACT_II_B1_LADDER, ...ACT_II_B2_B3_LADDER].map((r) => r.par));
    const shared = [...new Set(best.levels.map((c) => c.accept.par))].filter((p) => registered.has(p));
    console.log(
      `  anti-mirror check (§7.8 item 4, in spirit — a THIRD mirror is forbidden): registered Act II pars ` +
        `= {${[...registered].sort((a, b) => a - b).join(", ")}} (batch 1 ∪ batches 2–3, read from the law module). This batch's par multiset is ` +
        `[${best.levels.map((c) => String(c.accept.par)).join(", ")}] ⇒ ${String(shared.length)} of its distinct par(s) coincide with a registered one` +
        `${shared.length === 0 ? " — the batch carries its own pars and borrows none" : ` (${shared.join(", ")}) — a coincidence of the band's finite integer range, printed so it is never implied away; no par was chosen to avoid or to match a registered rung`}. ` +
        `The multiset is DERIVED (anchored at the ceiling, stepped by P2's minimum, header rule 2), never mirrored from any registered ladder.`,
    );
  }
  return best.levels;
}

function stageSelect(): void {
  const accepts = JSON.parse(readFileSync(ACCEPTS, "utf8")) as Accept[];
  console.log(`read ${String(accepts.length)} accept(s) from ${ACCEPTS}`);
  const chosen = selectBatch(accepts);
  if (chosen.length === 0) return;
  if (BATCH === 3) {
    // published rule 7: the act-close clause is a REFUSAL, never a padding prompt.
    const peak = Math.max(...chosen.map((c) => c.accept.dexec));
    if (peak <= ACT_II_B1_REGISTERED_PEAK_EXEC) {
      console.log(
        `\nSTOP — act-close (§7.3.2 / §7.8 item 1): the batch's measured maximum ${peak.toFixed(6)} does NOT strictly exceed the ` +
          `registered Act II peak ${ACT_II_B1_REGISTERED_PEAK_EXEC.toFixed(6)}. Nothing is written: the census is reported as a ` +
          `NAMED ACT LIMITATION and the §7.8 item 3 fallback (the published par-23 class reach 27.746988, C path with its own ADR) ` +
          `is briefed to the Game Designer. A padded par or a substituted par is not a remedy.`,
      );
      return;
    }
  }
  if (!WRITE) {
    console.log(`(dry run — pass --write to land the ${String(RUNG_COUNT)} candidates)`);
    return;
  }
  mkdirSync(OUT_DIR, { recursive: true });
  for (let i = 0; i < chosen.length; i += 1) {
    const level: Level = { ...(chosen[i] as { level: Level }).level, id: BATCH_FIRST_ID + i };
    const lastId = BATCH_FIRST_ID + RUNG_COUNT - 1;
    if (level.id < BATCH_FIRST_ID || level.id > lastId) {
      console.log(
        `REFUSED to write l${String(level.id)}: batch ${String(BATCH)}'s ids are L${String(BATCH_FIRST_ID)}–L${String(lastId)} only ` +
          `(nothing outside its own slot is touched)`,
      );
      continue;
    }
    const file = join(OUT_DIR, `l${String(level.id).padStart(3, "0")}.json`);
    writeFileSync(file, `${JSON.stringify(level, null, 2)}\n`);
    console.log(`wrote ${file} (par ${String(level.par)})`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// run
// ─────────────────────────────────────────────────────────────────────────────

const cut = measureCut();
console.log(
  `author-l21 (G lattice, Act II batch ${String(BATCH)}${
    BATCH === 4
      ? " — the family-ceiling 4-pocket sub-lattice on §7.4's second frame (7×7, CX=1), L36–L40"
      : BATCH === 3
        ? " — the 4-pocket sub-lattice, L31–L35"
        : BATCH === 2
          ? " — the 3-pocket chained sub-lattice, L26–L30"
          : " — L21–L25"
  }) — ` +
    `CUT re-measured from the shipped set: D_exec max over the L1–L15 basis = ${cut.floor.toFixed(6)} · ` +
    `Act I measured peak (ids 1–20) = ${cut.actI.toFixed(6)} · par(L15) = ${String(cut.l15Par)} · ` +
    `B band [${cut.bBand[0].toFixed(4)}, ${cut.bBand[1].toFixed(4)}] · basis ids [${cut.basis.join(", ")}]`,
);
/**
 * **F-L36-1's receipt.** Printed unconditionally, so the pre-fix and post-fix floors are both
 * on screen every run and can never agree silently: they coincide only when no Act II rung above
 * batch 1 is registered, and any future registration that forgets this instrument makes the pair
 * diverge where a reader can see it. `--pocketsize ≥ 11`'s ceiling-wording law (item 114) has a
 * sibling here: a number that is *reported* may not be permitted to become a *filter* unnoticed.
 */
console.log(
  cut.floor === cut.staleFloor
    ? `CUT divergence receipt (F-L36-1): the FROZEN L1–L15 floor ${cut.floor.toFixed(6)} equals the pre-fix floor ` +
        `${cut.staleFloor.toFixed(6)} — the two bases coincide, which is expected while no Act II rung above batch 1 is registered`
    : `CUT divergence receipt (F-L36-1): FROZEN L1–L15 floor ${cut.floor.toFixed(6)} vs the pre-fix basis's ` +
        `${cut.staleFloor.toFixed(6)} (Δ ${(cut.staleFloor - cut.floor).toFixed(6)}) — the pre-fix list let the registered Act II ` +
        `rungs raise the floor and silently turned the escalation gate into "D_exec > the registered act tail"; the generator now ` +
        `reads ACT_II_REGISTERED_IDS, the same law constant the prover's own measureCut() reads`,
);
const law = preflightLaw();
console.log(
  `preflight parity law: ${String(law.boards)} board(s), ${String(law.states)} state(s), ${String(law.moves)} legal move(s), ` +
    `${String(law.bimodal)} bimodal (tile,phase) pair(s) on the portal-free board(s) — 0 expected (ADR-0009 decision 1)`,
);
const guard = cloneGuardCensus();
console.log(`clone guard (§6.1.4, seal-inclusive key): ${String(guard.size)} geometry key(s) taken [${[...guard.values()].join(", ")}]`);

if (STAGE === "frame") frameCensus();
else if (STAGE === "roomcap") stageRoomCap();
else if (STAGE === "g") {
  if (POCKETS >= 4) stageLattice4(cut, argOf("only"));
  else if (POCKETS >= 3) stageLattice3(cut, argOf("only"));
  else stageLattice(cut, argOf("only"));
} else if (STAGE === "s") stageSelect();
else console.log(`unknown stage "${STAGE}" — use frame | g | s`);

void BLOCK_L1619_PAR_BASE;
void BLOCK_L1619_TAIL_EXEC_CEILING;
void initialState;
void solidAt;
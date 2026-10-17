# LV-014 — the authoring side of Act II batch 2 (`l026`…`l030`, **shelf candidates**, unregistered)

The tool is `scripts/author-l21.ts` (batch-1 record: `scripts/author-l21.transcript.md`; batch-1
proof: `scripts/prove-candidate-l2125.transcript.md`). This file is the **proposal and census
record** for the second batch. The proving side is `scripts/prove-candidate-l2630.transcript.md`,
and nothing here may be read as a proof: every `par`, `D_exec`, `B` and gate below is printed by
the shipped solver path (`@/core/solver/*`, `@/core/rules`), and the proof file re-measures them
from the landed bytes.

```
npx tsx scripts/author-l21.ts --stage=g --batch=2 --pockets=3 --cx=2 --qmax=4 --pocketsize=4 \
    --paircap=40 --budget=8000 --cap=400                      # the 3-pocket census (exit 0, 17.6 s)
npx tsx scripts/author-l21.ts --stage=s --batch=2 --accepts=<accepts.json>        # selection (dry run)
npx tsx scripts/author-l21.ts --stage=s --batch=2 --write --accepts=<accepts.json>  # land the five
npx tsx scripts/author-l21.ts --stage=g --batch=2 --pockets=2 --cx=2 --pocketsize=4 --qmax=4 --cap=200
                                                              # the batch-1 path, for semantics preservation
```

## 1. The law the device must satisfy, quoted (§6.2.3) — why the batch is not "a bigger device"

§6.2.3 is the lattice law for a sealed landing board, and it is quoted **verbatim** in the tool's
header so the batch can only enumerate §7.4's published axis (`pocket count 1–4`), never invent a
device. Read against the 4-press chained sub-lattice: one opposite-colour portal pair (`g0`); the
landing room not on-foot reachable in the needed phase (`g1`); **every** blocker an *openable door*,
never a phase wall (F-L19-2 — which is why `coverage` is the loud failure and not a silent one);
≥ 2 presses in a fixed order with the second switch reachable only after the first door opens
(`g3`, here **4**); `par(L20) = 20` exactly — the **L20 rung law**, cited and not inherited (no
batch-2 id is 20); `T ≡ R ≡ 0` and coverage `42/42` (`g5`, `coverage`); and `switchRequired`
"expected but not decreed", measured as the all-OFF world (`g4`, `latch-grade`).

## 2. Two instrument failures, caught by their own counters — before any board was written

Both are recorded because the *counter* is what refused them, and because a silently-fixed filter
would have made the class unreadable.

1. **A published shape filter that the seal law makes unsatisfiable.** The first draft published
   *"at least one `d3` tile adjacent to an `R2` tile"*. `R2`'s boundary **is** `d2` (that is what
   walk-sealed means), so every tile adjacent to `R2` from outside is a `d2` tile and is removed
   from `R3`'s pool before `R3` is drawn. The filter is published **inverted** ("no `R3` tile
   adjacent to an `R2` tile") with its counter printed, and the completed run reads
   **`PAIRS REFUSED BY SHAPE FILTER #1 … 0 (0 expected by the seal law)`** — 0 **by law**, which is
   the point: a non-zero reading would mean the seal law is broken.
2. **A "2-tile-minimum `R3`" reading that was empty for an instrument reason.** With `R3` limited to
   connected sets of size ≥ 2, the `CX = 2` enumeration returned **0 sealed `R3` of 8712 candidates
   over 374 sealed `R2` sets** (column-leak 7458, mixed-entry-phase 1254). The cause is
   `roomCandidates` excluding **singletons**: a 1-tile walk-sealed room is legal (its boundary is
   always single-phase) and the shipped device already uses one — the **goal's own seal**. The new
   `chainRoomCandidates` admits singletons, and the class becomes non-empty (54 accepts of 200
   judged, 67 (`R2`,`R3`) pairs, in 2.3 s at that cap). The "empty class" was an **instrument
   artifact, named as such**, never a property of the lattice.

The frame is measured, not assumed: at `H = 7` the pushes leave the par band, and at `CX = 3` the
census returns **0 judged** candidates, so the batch runs at `7 × 6`, `--cx=2`.

## 3. The completed census (the class, exactly)

```
stage G chained sub-lattice (3-pocket, 3 pockets): 440 leak-free landing device(s)
  (landing × near × pocket ≤ 4) · R2, R3 ≤ 4 tile(s) · 40 (R2,R3) pair(s)/device cap ·
  400 tuple(s)/group cap · 8000 judged tuple(s) budget · par band [17, 23] · D_exec band [19.75, 29.06]

census: 396 accept(s) of 2640 judged candidate(s) over 264 (R2,R3) pair(s) in 16.9 s ·
  devices walked 440/440 · 40-pair cap hit on 0 device(s) · global budget 8000 not reached
  (every device was walked to its own pair cap)
```

`devices walked 440/440`, **0** pair-cap hits and a budget that was **not reached** is what makes
`396` an **exact** count for this class — and it still buys **no ceiling in either direction**,
because the class is the enumerated one (7 × 6 · `--cx=2` · `--pocketsize=4` · `--qmax=4` · the two
shape filters). The band is a **filter, not a truncation**: the par census prints every judged
tuple, in band and out.

```
upstream skips: R2 sets not sealable 50116 (column-leak 28930) (mixed-entry-phase 21186) ·
  R2 boundary outside the pool 1848 · 4862 sealed R2 set(s) · devices with < 4 free tiles for R2 0 ·
  (R2,R3) pairs with < 4 free tiles for R3 0 · R3 sets not sealable 153208 (column-leak 114180)
  (mixed-entry-phase 39028) · R3 boundary outside the pool 15158 · 20174 sealed R3 set(s) ·
  PAIRS REFUSED BY SHAPE FILTER #1 (an R3 tile adjacent to an R2 tile) 0 (0 expected by the seal law) ·
  no goal candidate 4752 · s2 tile on the goal's seal or the goal itself 2288
tile accounting: largest R3 pool seen 15 tile(s) · largest free pool seen after a sealed R3 0 tile(s)
room rejections: column-leak: 148291 · mixed-entry-phase: 67771
rejection histogram:
  par-out-of-band: 1178
  g5-identity-broken: 538
  unsolvable: 528
par census over every judged candidate (in band and out): 13:8 14:24 15:40 16:52 24:202 25:164
  26:122 27:83 28:59 29:37 30:19 31:17 32:23 33:35 34:45 35:51 36:53 37:47 38:37 39:26 40:16 41:9
  42:5 43:3 44:1
accepts by par:
  par 17: 24 accept(s), D_exec 21.560241 … 21.704819 (B 1.5201 … 1.5683)
  par 18: 28 accept(s), D_exec 22.560241 … 22.704819 (B 1.5201 … 1.5683)
  par 19: 36 accept(s), D_exec 23.554217 … 23.722892 (B 1.5181 … 1.5743)
  par 20: 38 accept(s), D_exec 24.548193 … 24.722892 (B 1.5161 … 1.5743)
  par 21: 70 accept(s), D_exec 25.548193 … 25.722892 (B 1.5161 … 1.5743)
  par 22: 94 accept(s), D_exec 26.560241 … 26.746988 (B 1.5201 … 1.5823)
  par 23: 106 accept(s), D_exec 27.560241 … 27.746988 (B 1.5201 … 1.5823)
in-band candidates refused by a gate: 538
```

Two measurements worth carrying forward, and neither is a claim:

- **The class reaches `D_exec` 27.746988 at par 23** — *above* the registered Act II peak
  (`27.604651`). It is published here as data a deliberate peak promotion could be argued from, and
  it is deliberately **unselected**: a shelf file moves no registered constant.
- **The refusals are named, not aggregated away.** `g5-identity-broken` (538) is the gate that
  matters on this device — it re-measures the *value* of the census identity, not its shape. Its
  detail on a refused par-23 row is the shape of the measurement:

  ```
  g5-identity-broken: … Measured: 4 seal tile(s), 4 NOT adjacent [3,2 4,1 4,3 5,2]
    (free region 14 position(s)); the identity's VALUE — the world with the landing pocket's
    device removed — solves at 23 < par 23, while every par route presses 4 switch(es)
    through the chain (g3)
  ```

## 4. Semantics preservation — the accept class of batch 1 did not narrow

Extending the tool touches the gates the *accept* class is judged by, so the batch-1 path was
re-measured after every edit:

```
npx tsx scripts/author-l21.ts --stage=g --batch=2 --pockets=2 --cx=2 --pocketsize=4 --qmax=4 --cap=200
→ 2208 accepts / 9570 judged
```

identical to the pre-edit run in **every** published aggregate: the rejection histogram
(`unsolvable` 4004 · `g5-identity-broken` 1864 · `par-out-of-band` 1494), the upstream skips
(`47608 / 132 / 0 / 132 / 0 / 0`) and the par census. **Zero narrowing.**

The one generalization that needed an argument rather than a re-run is `g3-ordered-multi-press`,
whose `minPresses >= 2` became `minPresses >= ctx.presses.length`: that is the *same* requirement on
a 3-press device and the strict one on a 4-press device, and it is measured on the accept class
(`chain = n/n` on every accept — the whole chain on **every** shortest route), so it cannot refuse a
batch-1 accept.

## 5. The singleton room is not a trap — the rule, and the machine route

The accepted boards carry 1-tile walk-sealed rooms (`R2 = [4,3]`, `R3 = [6,1]` on `l026`), which
invites the reading "the player is sealed in and dead". The shipped rule answers it in
`src/core/rules/applyMove.ts`:

- **step 3** — `switchAt(level, s.phase, player)` is evaluated with the **entry** phase and the
  **post-move** position, so a press inside a room fires on the very move that enters it;
- **step 5** — `resolveDoorsOpen(level, phase, switchesOn)` recomputes **every** door absolutely
  from `(color, phase, switchesOn)`, so the toggle lands on the *flipped* phase's openness.

`l026`'s shortest route, printed by a throwaway dump (not committed — it only calls `explore` /
`analyse` / `movePath` / `applyMove`, all shipped readers):

```
   1 "right" 0,0 → 1,0 [- · entry-door n/a] phase A→B          ← the portal teleports to the landing
   2 "right" 5,5 → 6,5 [- +press s1 · entry-door n/a] phase B→A
   3 "left"  6,5 → 5,5 [- · entry-door n/a] phase A→B          ← the portal returns to the near end
   4 "down"  1,0 → 1,1 [- · entry-door n/a] phase B→A
   5 "up"    1,1 → 1,0 [- · entry-door n/a] phase A→B
   6 "left"  5,5 → 4,5 [d1 · entry-door d1@B=open] phase B→A
   7 "left"  4,5 → 3,5 [- · entry-door n/a] phase A→B
   8 "up"    3,5 → 3,4 [- +press s2 · entry-door n/a] phase B→A
   9 "up"    3,4 → 3,3 [d2 · entry-door d2@A=open] phase A→B   ← crosses R2's ring where s2 opened it
  10 "right" 3,3 → 4,3 [- +press s3 · entry-door n/a] phase B→A ← inside the singleton, at its phase
  11 "up"    4,3 → 4,2 [d2 · entry-door d2@A=open] phase A→B   ← leaves the same ring, still open in A
  12 "right" 4,2 → 5,2 [- · entry-door n/a] phase B→A
  13 "up"    5,2 → 5,1 [d3 · entry-door d3@A=open] phase A→B
  14 "right" 5,1 → 6,1 [- +press s4 · entry-door n/a] phase B→A
  15 "up"    6,1 → 6,0 [d3 · entry-door d3@A=open] phase A→B
  16 "left"  6,0 → 5,0 [d4 · entry-door d4@B=open] phase B→A
  17 "left"  5,0 → 4,0 [- · entry-door n/a] phase A→B         ← goal (phase-independent)
end   pos 4,0 phase B · s1=ON s2=ON s3=ON s4=ON · goal true
outward from the end state (phase B): 4,-1:blocked 4,1:LEGAL 3,0:LEGAL 5,0:LEGAL
```

Read mechanically: the ring is crossed at the phase where an **earlier** press left it open; the
in-room press fires at its own `activePhase` on the entering move and toggles the **next** room's
seal; the ring is crossed again on the next move, at the phase it is open in. Nothing re-judges the
tile the player stands on (ADR-0008 clause 3 — no crush, no retro-flip check), so the "trap"
reading comes from reading a door's **base colour** instead of `doorIsOpen`'s per-ON-switch
inversion. The general question is answered by the Solver, not by prose — on **5/5**:
`noUnrecoverableOk = true`, `unrecoverableStates = 0`, `deadStates = 0`.

## 6. Selection — the rule was published before the run

Batch 1 *searched* a par set. Batch 2 has a **registered comparator**, so its par set is **mirrored**
from the law constant (`ACT_II_B1_LADDER[i].par` = 17 / 18 / 20 / 21 / 23, never typed), and the only
rule inside it is batch 1's own within-par tie-break (minimal `D_exec`, then enumeration order).
That makes "longer chain at equal par" a measurement instead of an intent:

```
selection filter: 396 accept(s) inside the bands · 0 refused by the §6.1.4 clone guard ·
  396 usable · 21 key(s) already taken
selection: par mirror ACTIVE (batch 2's published rule) — pars [17, 18, 20, 21, 23] read from
  ACT_II_B1_LADDER (registered batch 1, ids 21–22–23–24–25)
selection: 1 par combo(s) tried · rising-D_exec clause NOT in force (batch 2's published amendment:
  §7.3 interior freedom; the across-act clause rode on batch 1's peak)
selection: pars [17, 18, 20, 21, 23] · Δpar≥2 steps 2/4 · min D_exec 21.560241 · spread 6.006024
clone census on the ladder: 5 distinct §6.1.4 key(s) over 5 rung(s) · 0 key(s) colliding with a shipped board
  L26 par=17 D_exec=21.560241 B=1.5201 coverage=42/42 chain=60/60 Δpar=n/a ΔD_exec=n/a
    key=0,0|4,0|1,0|5,5|3,0+3,3+4,1+4,2+4,4+4,5+5,0+5,1+5,3+5,4+6,0+6,2+6,3
    landing=5,5 near=1,0/A P=[5,5 6,4 6,5] d1=[4,5 5,4 6,3]/red s1=6,5/B R2=[4,3] d2=[3,3 4,2 4,4 5,3]/blue s2=3,4/B R3=[6,1] d3=[5,1 6,0 6,2]/blue s3=4,3/B s4=6,1/B goal=4,0 d4=[3,0 4,1 5,0]/red
  L27 par=18 D_exec=22.560241 B=1.5201 coverage=42/42 chain=24/24 Δpar=1 ΔD_exec=1.000000
  L28 par=20 D_exec=24.548193 B=1.5161 coverage=42/42 chain=12/12 Δpar=2 ΔD_exec=1.987952
  L29 par=21 D_exec=25.548193 B=1.5161 coverage=42/42 chain=72/72 Δpar=1 ΔD_exec=1.000000
  L30 par=23 D_exec=27.566265 B=1.5221 coverage=42/42 chain=12/12 Δpar=2 ΔD_exec=2.018072

mirror note — where the within-par minimum was *not* taken (the rung-key distinct clause is a filter,
  so the selected rung is the par's minimal D_exec among rows whose key is still free; each skip is
  printed, never silent):
  par 23: 1 lower-D_exec row(s) refused by the rung-key-wide distinct clause (the rung already keyed the batch) → took 27.566265

mirror comparison (equal par, chain 4 vs batch 1's 3 presses — a measurement, never a claim):
  par 17: L21 21.581395 (3 presses) → L26 21.560241 (4 presses, chain 60/60 routes) · ΔD_exec -0.021154 · ΔB -0.0070
  par 18: L22 22.584000 (3 presses) → L27 22.560241 (4 presses, chain 24/24 routes) · ΔD_exec -0.023759 · ΔB -0.0079
  par 20: L23 24.620000 (3 presses) → L28 24.548193 (4 presses, chain 12/12 routes) · ΔD_exec -0.071807 · ΔB -0.0239
  par 21: L24 25.604651 (3 presses) → L29 25.548193 (4 presses, chain 72/72 routes) · ΔD_exec -0.056458 · ΔB -0.0188
  par 23: L25 27.604651 (3 presses) → L30 27.566265 (4 presses, chain 12/12 routes) · ΔD_exec -0.038386 · ΔB -0.0128
  peak rung L30 D_exec 27.566265 vs Act I's measured peak 24.729412 (Δ 2.836853, §7.3 act-peak) and vs
  the registered Act II peak 27.604651 (Δ -0.038386) — a shelf file moves neither constant
```

**The batch's thesis, as a number:** at equal par, **one extra door in the ordered chain costs under
0.072 `D_exec`** (and ≤ 0.0239 `B`) — the chain got longer, the act's difficulty axis did not move.
The peak rung clears Act I's peak and does **not** touch the registered Act II peak, so the batch
asks no registration train to move a registered maximum; the census rows that *would* exceed it
(§3) are published as measurements and left unselected.

## 7. What was written

`--write` landed five files, each `par`-stamped by the solver (`analyse`), ids assigned in ladder
order (`BATCH_FIRST_ID + i`), nothing auto-repaired (ADR-0004):

| file | `sha256` | par | `D_exec` | `B` | chain | all-OFF |
|---|---|---|---|---|---|---|
| `l026.json` | `0166f697…` | 17 | 21.560241 | 1.5201 | 60/60 | UNSATISFIABLE |
| `l027.json` | `13c29e99…` | 18 | 22.560241 | 1.5201 | 24/24 | UNSATISFIABLE |
| `l028.json` | `f82ec936…` | 20 | 24.548193 | 1.5161 | 12/12 | UNSATISFIABLE |
| `l029.json` | `1fb03d09…` | 21 | 25.548193 | 1.5161 | 72/72 | UNSATISFIABLE |
| `l030.json` | `896bdd24…` | 23 | 27.566265 | 1.5221 | 12/12 | UNSATISFIABLE |

Every number above is re-measured from those bytes in
`scripts/prove-candidate-l2630.transcript.md`; the five files are **unregistered**, so no shipped-set
census, registry, `EXPECTED_LEVEL_COUNT` or sidecar sees them.
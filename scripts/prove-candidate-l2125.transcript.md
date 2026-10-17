# LV-012 — the proving side of Act II batch 1 (`l021`…`l025`)

The authoring side is `scripts/author-l21.ts` (its record: `scripts/author-l21.transcript.md`).
This file is the **proof**: every number below is a re-measurement of the **bytes on disk** by
`@/core/solver/*` and `@/core/rules` — the same readers the shipped twenty are judged by. Nothing
here is quoted from the authoring tool, and nothing here can write a level.

```
npx tsx scripts/prove-candidate.ts --ladder=21,22,23,24,25 --family=g                      # the assertion pass (exit 0)
npx tsx scripts/prove-candidate.ts --ladder=21,22,23,24,25 --family=g --measure-controls  # the EXPECTATION pass (exit 0)
npx tsx scripts/prove-candidate.ts --ladder=21,22,23,24,25 --family=g --peak=28.5         # the act-peak falsification (exit 1)
```

Measured exit codes: assertion pass **0** · expectation pass **0** · falsification **1**.

## 1. What `--family=g` adds to the prover (the instrument, not the outcome)

`--family=sl` is §6.2.6's single-pocket sealed landing (L20). `--family=g` is Act II's
**multi-pocket** class (§7.2 / §7.4 stage G) and it is an **argument**, never inferred from a
result. Seven gates are read off the bytes, and the device they judge is **re-derived from the
board**:

1. **`g0-portal-pair`** — exactly **one** portal pair (§6.2.3 item 1), its two ends of **opposite
   parity** (ADR-0009's opposite-colour law sets the two frames apart), and the teleport measured
   landing on the derived landing end.
2. **walk-sealed rooms** — maximal connected tile-sets that are neither a phase wall nor a door
   tile, whose **entire** boundary is covered by **exactly one door object**, with **no phase-wall
   boundary tile** (F-L19-2) and **no free leak**. The class needs ≥ 2 of them (§7.4 stage G).
3. **`g1-pocket-on-foot`** — the landing room is not reachable on the **portal-free** board (§6.2.3
   item 2), **no** sealed room's tile is, and the pre-press flood from the arrival state has **0**
   edges leaving the landing room (edges back onto the near end are *named*, not counted: the
   landing is a portal end per ADR-0009, so stepping back is a priced cycle).
4. **`g2-room-exit-door`** — every room's boundary is one whole door object, 0 walls, 0 leaks. Room
   geometry is **re-measured against the level as it stands** (`measureRoom`): the injected view of
   the control battery carries the unmutated board's cached boundary, so a gate that trusted it
   would pass on a mutated door. This is why the `g2` control is *named by `g2`* below.
5. **`g6-room-structure`** — ≥ 2 rooms, **distinct** covering doors, the landing room carrying the
   switch that opens **its own** door, and the goal's room **switch-free** with its door driven from
   elsewhere.
6. **`g3-ordered-chain`** — the press order is read off the solver's par routes (all routes must
   share **one** order, ≥ 3 presses), the strict `press(s_i) < cross(door(s_i)) < press(s_{i+1})`
   milestone order must hold on **every** route, and then the chain is **FORCED** by staged worlds:
   removing the first *k* switches must leave the (*k*+1)-th switch's tile **and the goal**
   unreachable — §6.2.3 item 4 as a measurement, not a reading.
7. **`g4-switch-required`** and **`g5-identity-broken`** — unchanged in meaning from §6.2.6, read in
   the multi-pocket shape (the "device" whose removal un-breaks the census identity is the landing
   room's door **plus its switch(es)**).

The five Act-`I`-ladder gates (`region`, `escalation`, `latch-grade`, `latch-route`, `refused-beat`,
`coverage`, `validator`, `well-formed`) are unchanged. `par-step` — §6.1.1 P2's **exact rung pin
`par ≥ l15Par + 2·(id − 15)`** — is **replaced inside Act II's band** by `act2-par-band`,
`act2-exec-band`, `act2-b-band` and `act-peak`: pinning `par = l15Par + 2·(id−15)` would demand
`par ≥ 22` at L21 and `par ≥ 30` at L25, which is outside Act II's 16–24 band **and** above its
`D_exec` ceiling. That replacement is the ticket's own published finding, and its size is measured
(authoring side): **174 candidates were refused by `par-step` alone** in the calibration lattice.

## 2. Pass 1 — the EXPECTATION pass (measured first, never guessed)

F-L16-3 / F-L20-4 order: the controls run **before** their `expect` lists are written, and the
printed reason **is** the measurement. `--measure-controls` asserts nothing; it prints what each
mutation was refused by, and whether its own gate was named.

```
prove-candidate — CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 · 20 shipped files · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] (the L16–L19 ladder is excluded from its own filter — see measureCut)
family g (Act II multi-pocket — §7.2 / §7.4 stage G) · Act I's measured peak the batch must clear: 24.729412 · ladder peak rung L25
ladder mode: proving L21 → L22 → L23 → L24 → L25 from src/levels/candidates/

──────────────────────────────────────────────────────────────────────────────
candidate /Users/Admin/.local/share/opencode/worktree/f9a5d9/lv-012-act2/src/levels/candidates/l021.json · rung 21

par=17 D_exec=21.581395 B=1.5271 (CUT 14.969697, delta 6.611698; delta vs Act I peak -3.148017)
derived multi-pocket device (from the landed bytes, never from the authoring script): landing 5,5 (behind the portal) · near 0,5 · 3 walk-sealed room(s): d2[5,0 6,0 6,1] · d3[4,2](goal) · d1[4,5 5,4 5,5 6,5](landing)
  ok   par-stamped      file par=17 · solver par=17 (par is stamped, §8)
  ok   region           deadStates=0 noUnrecoverableOk=true T=0 R=0
  ok   escalation       D_exec=21.581395 > CUT 14.969697
  ok   act2-par-band    par=17 strictly inside Act II's band (16, 24) (§7.2; the exact-rung ladder of §6.1.1 P2 is NOT the law inside the act band — it is measured below as the named finding it is)
  ok   act2-exec-band   D_exec=21.581395 ∈ [19.75, 29.06] (§7.2's derived Act II band; derived from the measured B band through D_exec = par + 3·B — no new maths)
  ok   act2-b-band      B=1.5271 ∈ [1.2500, 1.6875] (the measured band; F-L16-2 excursion would have to be named)
  ok   act-peak         D_exec=21.581395 vs Act I's measured peak 24.729412 (delta -3.148017) — §7.3 puts the across-act obligation on the act's measured PEAK, never on every interior member: ladder peak rung = L25
  ok   latch-grade      allOffShortest=null (all-OFF world UNSATISFIABLE) par=17 advantage=n/a
  ok   latch-route      par routes=12; press-then-cross on 12 (G2)
  ok   refused-beat     refusedBeforeEnteredTiles=17 [2,0 2,1 2,2 2,3 2,4 2,5 3,2 3,5 4,0 4,1 4,3 4,4 5,1 5,2 5,3 6,2 6,4]
  ok   coverage         distinctPositions=42/42
  ok   validator        ok=true errors=0 warnings=6 policyViolations=0[] one-switch-per-door=true every-switch-fires=true
  ok   well-formed      doors=3 switches=3
  ok   g0-portal-pair   portal(s)=1 (required exactly 1 — §6.2.3 item 1); pair 0,5–5,5 parities 1 / 0 (opposite required, ADR-0009's opposite-colour law sets the frames apart); landing end 5,5 (the end not on foot), near end 0,5; the teleport fires on entry and is measured landing there: arrival=phase B
  ok   g1-pocket-on-foot landing room [4,5 5,4 5,5 6,5] (door d1): on-foot-reachable (portal-free board) room tiles=0 (required 0 — §6.2.3 item 2); on-foot-reachable tiles over ALL 3 sealed room(s)=0 (required 0: the device is portal-only in every room); pre-press edges leaving the room=0 (required 0); edges back onto the near end 0,5=2 (named: the landing is a portal end, so stepping back is a priced cycle, never an exit — ADR-0009)
  ok   g2-room-exit-door 3 walk-sealed room(s) derived from the bytes [d2:5,0+6,0+6,1 · d3:4,2 · d1:4,5+5,4+5,5+6,5]; rooms whose boundary is not exactly one door object, or carries a phase wall (F-L19-2), or an open leak=0 (required 0)
  ok   g6-room-structure rooms=3 (required ≥ 2 — §6.2.3's device carries a landing channel and the goal's own seal); covering doors distinct=true [d2 d3 d1]; landing room carries the switch that opens ITS OWN door=true (switch(es) in the landing room [s1] targeting [d1]); the goal's room is switch-free and its door is driven from elsewhere=true (goal room [4,2] door [d3] switch(es) [])
  ok   g3-ordered-chain par=17 · 12 shortest route(s); press order(s) [s1>s2>s3] (one shared order required; chain s1>s2>s3); distinct switches per route: min=3 (required ≥ 3); routes executing press→cross in the strict order with the landing room's switch first: 12/12; FORCING by staged worlds: drop{s1} ⇒ switch s2 tile reachable=false goal reachable=false · drop{s1,s2} ⇒ switch s3 tile reachable=false goal reachable=false — every staged world must read FALSE for both (§6.2.3 item 4, ordered and forced, not merely present)
  ok   g4-switch-required allOffShortest=null (all-OFF world UNSATISFIABLE) allOffGoalReachable=false par=17 — with every switch OFF the landing room's door refuses its only exit, so the whole far region beyond it is unreachable: the latch carries existence
  ok   g5-identity-broken par = min_i(d(start→s_i) + 1 + d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5); it holds only while every seal tile is directly adjacent to the free far region. Measured: 7 seal tile(s) outside the landing room, 7 NOT adjacent to the all-OFF free region [4,0 5,1 6,2 3,2 4,1 4,3 5,2] (free region 15 position(s)); the identity's VALUE — the world with the landing device (door d1 + its switch[es]) removed — solves at 15 < par 17: its one-press arithmetic no longer computes this board

GATES: ACCEPT

negative controls on the landed bytes:
  MEASURED latch removed (switches dropped) → unsolvable
  MEASURED every switch muted (latch fully decorative) → unsolvable
  MEASURED goal sealed in both phases → unsolvable
  MEASURED portal pair dropped (parity frame broken) → unsolvable
  MEASURED every switch retargeted to the first door → unsolvable
  MEASURED par mis-stamped (file par falls by 1) → par-stamped
  MEASURED g0 control — a second portal pair added (§6.2.3 item 1: exactly one) → par-stamped+escalation+act2-par-band+act2-exec-band+latch-grade+latch-route+validator+g0-portal-pair+g3-ordered-chain+g4-switch-required+g5-identity-broken  [gate g0-portal-pair named: true]
  MEASURED g1 control — the landing room's door "d1" dropped (the room is no longer portal-only) → par-stamped+act2-par-band+validator+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g1-pocket-on-foot named: true]
  MEASURED g2 control — one landing-room boundary tile dropped from door "d1" (a free leak) → region+act2-exec-band+g2-room-exit-door  [gate g2-room-exit-door named: true]
  MEASURED g6 control — the landing device removed (door + switch): the multi-pocket derivation collapses → par-stamped+act2-par-band+g6-room-structure  [gate g6-room-structure named: true]
  MEASURED g3 control — the goal's seal door "d3" dropped (the chain loses a press) → par-stamped+escalation+act2-par-band+act2-exec-band+validator+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g3-ordered-chain named: true]
  MEASURED g4 control — every door and switch dropped (existence stops needing any press) → par-stamped+escalation+act2-par-band+act2-exec-band+act2-b-band+latch-grade+latch-route+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g4-switch-required+g5-identity-broken  [gate g4-switch-required named: true]
  MEASURED g5 control — the landing-device-removed world (the census identity holds again) → par-stamped+act2-par-band+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g5-identity-broken named: true]
controls: 13 measured (no assertion — this is the EXPECTATION pass, F-L16-3 order)

RESULT: PASS

──────────────────────────────────────────────────────────────────────────────
candidate /Users/Admin/.local/share/opencode/worktree/f9a5d9/lv-012-act2/src/levels/candidates/l022.json · rung 22

par=18 D_exec=22.584000 B=1.5280 (CUT 14.969697, delta 7.614303; delta vs Act I peak -2.145412)
derived multi-pocket device (from the landed bytes, never from the authoring script): landing 5,5 (behind the portal) · near 1,0 · 3 walk-sealed room(s): d2[4,0 5,0 5,1 6,0] · d3[4,3](goal) · d1[5,5 6,4 6,5](landing)
  ok   par-stamped      file par=18 · solver par=18 (par is stamped, §8)
  ok   region           deadStates=0 noUnrecoverableOk=true T=0 R=0
  ok   escalation       D_exec=22.584000 > CUT 14.969697
  ok   act2-par-band    par=18 strictly inside Act II's band (16, 24) (§7.2; the exact-rung ladder of §6.1.1 P2 is NOT the law inside the act band — it is measured below as the named finding it is)
  ok   act2-exec-band   D_exec=22.584000 ∈ [19.75, 29.06] (§7.2's derived Act II band; derived from the measured B band through D_exec = par + 3·B — no new maths)
  ok   act2-b-band      B=1.5280 ∈ [1.2500, 1.6875] (the measured band; F-L16-2 excursion would have to be named)
  ok   act-peak         D_exec=22.584000 vs Act I's measured peak 24.729412 (delta -2.145412) — §7.3 puts the across-act obligation on the act's measured PEAK, never on every interior member: ladder peak rung = L25
  ok   latch-grade      allOffShortest=null (all-OFF world UNSATISFIABLE) par=18 advantage=n/a
  ok   latch-route      par routes=16; press-then-cross on 16 (G2)
  ok   refused-beat     refusedBeforeEnteredTiles=17 [2,0 2,1 2,2 2,3 2,4 2,5 3,0 3,3 4,1 4,2 4,4 4,5 5,2 5,3 5,4 6,1 6,3]
  ok   coverage         distinctPositions=42/42
  ok   validator        ok=true errors=0 warnings=6 policyViolations=0[] one-switch-per-door=true every-switch-fires=true
  ok   well-formed      doors=3 switches=3
  ok   g0-portal-pair   portal(s)=1 (required exactly 1 — §6.2.3 item 1); pair 1,0–5,5 parities 1 / 0 (opposite required, ADR-0009's opposite-colour law sets the frames apart); landing end 5,5 (the end not on foot), near end 1,0; the teleport fires on entry and is measured landing there: arrival=phase B
  ok   g1-pocket-on-foot landing room [5,5 6,4 6,5] (door d1): on-foot-reachable (portal-free board) room tiles=0 (required 0 — §6.2.3 item 2); on-foot-reachable tiles over ALL 3 sealed room(s)=0 (required 0: the device is portal-only in every room); pre-press edges leaving the room=0 (required 0); edges back onto the near end 1,0=0 (named: the landing is a portal end, so stepping back is a priced cycle, never an exit — ADR-0009)
  ok   g2-room-exit-door 3 walk-sealed room(s) derived from the bytes [d2:4,0+5,0+5,1+6,0 · d3:4,3 · d1:5,5+6,4+6,5]; rooms whose boundary is not exactly one door object, or carries a phase wall (F-L19-2), or an open leak=0 (required 0)
  ok   g6-room-structure rooms=3 (required ≥ 2 — §6.2.3's device carries a landing channel and the goal's own seal); covering doors distinct=true [d2 d3 d1]; landing room carries the switch that opens ITS OWN door=true (switch(es) in the landing room [s1] targeting [d1]); the goal's room is switch-free and its door is driven from elsewhere=true (goal room [4,3] door [d3] switch(es) [])
  ok   g3-ordered-chain par=18 · 16 shortest route(s); press order(s) [s1>s2>s3] (one shared order required; chain s1>s2>s3); distinct switches per route: min=3 (required ≥ 3); routes executing press→cross in the strict order with the landing room's switch first: 16/16; FORCING by staged worlds: drop{s1} ⇒ switch s2 tile reachable=false goal reachable=false · drop{s1,s2} ⇒ switch s3 tile reachable=false goal reachable=false — every staged world must read FALSE for both (§6.2.3 item 4, ordered and forced, not merely present)
  ok   g4-switch-required allOffShortest=null (all-OFF world UNSATISFIABLE) allOffGoalReachable=false par=18 — with every switch OFF the landing room's door refuses its only exit, so the whole far region beyond it is unreachable: the latch carries existence
  ok   g5-identity-broken par = min_i(d(start→s_i) + 1 + d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5); it holds only while every seal tile is directly adjacent to the free far region. Measured: 8 seal tile(s) outside the landing room, 8 NOT adjacent to the all-OFF free region [3,0 4,1 5,2 6,1 3,3 4,2 4,4 5,3] (free region 12 position(s)); the identity's VALUE — the world with the landing device (door d1 + its switch[es]) removed — solves at 14 < par 18: its one-press arithmetic no longer computes this board

GATES: ACCEPT

negative controls on the landed bytes:
  MEASURED latch removed (switches dropped) → unsolvable
  MEASURED every switch muted (latch fully decorative) → unsolvable
  MEASURED goal sealed in both phases → unsolvable
  MEASURED portal pair dropped (parity frame broken) → unsolvable
  MEASURED every switch retargeted to the first door → unsolvable
  MEASURED par mis-stamped (file par falls by 1) → par-stamped
  MEASURED g0 control — a second portal pair added (§6.2.3 item 1: exactly one) → validator+g0-portal-pair  [gate g0-portal-pair named: true]
  MEASURED g1 control — the landing room's door "d1" dropped (the room is no longer portal-only) → par-stamped+act2-par-band+act2-exec-band+validator+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g1-pocket-on-foot named: true]
  MEASURED g2 control — one landing-room boundary tile dropped from door "d1" (a free leak) → par-stamped+act2-par-band+act2-exec-band+g1-pocket-on-foot+g2-room-exit-door+g3-ordered-chain+g5-identity-broken  [gate g2-room-exit-door named: true]
  MEASURED g6 control — the landing device removed (door + switch): the multi-pocket derivation collapses → par-stamped+act2-par-band+act2-exec-band+g6-room-structure  [gate g6-room-structure named: true]
  MEASURED g3 control — the goal's seal door "d3" dropped (the chain loses a press) → par-stamped+escalation+act2-par-band+act2-exec-band+validator+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g3-ordered-chain named: true]
  MEASURED g4 control — every door and switch dropped (existence stops needing any press) → par-stamped+escalation+act2-par-band+act2-exec-band+act2-b-band+latch-grade+latch-route+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g4-switch-required+g5-identity-broken  [gate g4-switch-required named: true]
  MEASURED g5 control — the landing-device-removed world (the census identity holds again) → par-stamped+act2-par-band+act2-exec-band+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g5-identity-broken named: true]
controls: 13 measured (no assertion — this is the EXPECTATION pass, F-L16-3 order)

RESULT: PASS

──────────────────────────────────────────────────────────────────────────────
candidate /Users/Admin/.local/share/opencode/worktree/f9a5d9/lv-012-act2/src/levels/candidates/l023.json · rung 23

par=20 D_exec=24.620000 B=1.5400 (CUT 14.969697, delta 9.650303; delta vs Act I peak -0.109412)
derived multi-pocket device (from the landed bytes, never from the authoring script): landing 6,4 (behind the portal) · near 0,5 · 3 walk-sealed room(s): d2[4,0 5,0 5,1 6,0] · d3[4,3](goal) · d1[5,5 6,4 6,5](landing)
  ok   par-stamped      file par=20 · solver par=20 (par is stamped, §8)
  ok   region           deadStates=0 noUnrecoverableOk=true T=0 R=0
  ok   escalation       D_exec=24.620000 > CUT 14.969697
  ok   act2-par-band    par=20 strictly inside Act II's band (16, 24) (§7.2; the exact-rung ladder of §6.1.1 P2 is NOT the law inside the act band — it is measured below as the named finding it is)
  ok   act2-exec-band   D_exec=24.620000 ∈ [19.75, 29.06] (§7.2's derived Act II band; derived from the measured B band through D_exec = par + 3·B — no new maths)
  ok   act2-b-band      B=1.5400 ∈ [1.2500, 1.6875] (the measured band; F-L16-2 excursion would have to be named)
  ok   act-peak         D_exec=24.620000 vs Act I's measured peak 24.729412 (delta -0.109412) — §7.3 puts the across-act obligation on the act's measured PEAK, never on every interior member: ladder peak rung = L25
  ok   latch-grade      allOffShortest=null (all-OFF world UNSATISFIABLE) par=20 advantage=n/a
  ok   latch-route      par routes=20; press-then-cross on 20 (G2)
  ok   refused-beat     refusedBeforeEnteredTiles=17 [2,0 2,1 2,2 2,3 2,4 2,5 3,0 3,3 4,1 4,2 4,4 4,5 5,2 5,3 5,4 6,1 6,3]
  ok   coverage         distinctPositions=42/42
  ok   validator        ok=true errors=0 warnings=6 policyViolations=0[] one-switch-per-door=true every-switch-fires=true
  ok   well-formed      doors=3 switches=3
  ok   g0-portal-pair   portal(s)=1 (required exactly 1 — §6.2.3 item 1); pair 0,5–6,4 parities 1 / 0 (opposite required, ADR-0009's opposite-colour law sets the frames apart); landing end 6,4 (the end not on foot), near end 0,5; the teleport fires on entry and is measured landing there: arrival=phase B
  ok   g1-pocket-on-foot landing room [5,5 6,4 6,5] (door d1): on-foot-reachable (portal-free board) room tiles=0 (required 0 — §6.2.3 item 2); on-foot-reachable tiles over ALL 3 sealed room(s)=0 (required 0: the device is portal-only in every room); pre-press edges leaving the room=0 (required 0); edges back onto the near end 0,5=1 (named: the landing is a portal end, so stepping back is a priced cycle, never an exit — ADR-0009)
  ok   g2-room-exit-door 3 walk-sealed room(s) derived from the bytes [d2:4,0+5,0+5,1+6,0 · d3:4,3 · d1:5,5+6,4+6,5]; rooms whose boundary is not exactly one door object, or carries a phase wall (F-L19-2), or an open leak=0 (required 0)
  ok   g6-room-structure rooms=3 (required ≥ 2 — §6.2.3's device carries a landing channel and the goal's own seal); covering doors distinct=true [d2 d3 d1]; landing room carries the switch that opens ITS OWN door=true (switch(es) in the landing room [s1] targeting [d1]); the goal's room is switch-free and its door is driven from elsewhere=true (goal room [4,3] door [d3] switch(es) [])
  ok   g3-ordered-chain par=20 · 20 shortest route(s); press order(s) [s1>s2>s3] (one shared order required; chain s1>s2>s3); distinct switches per route: min=3 (required ≥ 3); routes executing press→cross in the strict order with the landing room's switch first: 20/20; FORCING by staged worlds: drop{s1} ⇒ switch s2 tile reachable=false goal reachable=false · drop{s1,s2} ⇒ switch s3 tile reachable=false goal reachable=false — every staged world must read FALSE for both (§6.2.3 item 4, ordered and forced, not merely present)
  ok   g4-switch-required allOffShortest=null (all-OFF world UNSATISFIABLE) allOffGoalReachable=false par=20 — with every switch OFF the landing room's door refuses its only exit, so the whole far region beyond it is unreachable: the latch carries existence
  ok   g5-identity-broken par = min_i(d(start→s_i) + 1 + d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5); it holds only while every seal tile is directly adjacent to the free far region. Measured: 8 seal tile(s) outside the landing room, 8 NOT adjacent to the all-OFF free region [3,0 4,1 5,2 6,1 3,3 4,2 4,4 5,3] (free region 14 position(s)); the identity's VALUE — the world with the landing device (door d1 + its switch[es]) removed — solves at 14 < par 20: its one-press arithmetic no longer computes this board

GATES: ACCEPT

negative controls on the landed bytes:
  MEASURED latch removed (switches dropped) → unsolvable
  MEASURED every switch muted (latch fully decorative) → unsolvable
  MEASURED goal sealed in both phases → unsolvable
  MEASURED portal pair dropped (parity frame broken) → unsolvable
  MEASURED every switch retargeted to the first door → unsolvable
  MEASURED par mis-stamped (file par falls by 1) → par-stamped
  MEASURED g0 control — a second portal pair added (§6.2.3 item 1: exactly one) → par-stamped+escalation+act2-par-band+act2-exec-band+latch-grade+latch-route+validator+g0-portal-pair+g3-ordered-chain+g4-switch-required+g5-identity-broken  [gate g0-portal-pair named: true]
  MEASURED g1 control — the landing room's door "d1" dropped (the room is no longer portal-only) → par-stamped+act2-par-band+act2-exec-band+validator+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g1-pocket-on-foot named: true]
  MEASURED g2 control — one landing-room boundary tile dropped from door "d1" (a free leak) → region+act2-exec-band+g2-room-exit-door  [gate g2-room-exit-door named: true]
  MEASURED g6 control — the landing device removed (door + switch): the multi-pocket derivation collapses → par-stamped+act2-par-band+act2-exec-band+g6-room-structure  [gate g6-room-structure named: true]
  MEASURED g3 control — the goal's seal door "d3" dropped (the chain loses a press) → par-stamped+escalation+act2-par-band+act2-exec-band+validator+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g3-ordered-chain named: true]
  MEASURED g4 control — every door and switch dropped (existence stops needing any press) → par-stamped+escalation+act2-par-band+act2-exec-band+act2-b-band+latch-grade+latch-route+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g4-switch-required+g5-identity-broken  [gate g4-switch-required named: true]
  MEASURED g5 control — the landing-device-removed world (the census identity holds again) → par-stamped+act2-par-band+act2-exec-band+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g5-identity-broken named: true]
controls: 13 measured (no assertion — this is the EXPECTATION pass, F-L16-3 order)

RESULT: PASS

──────────────────────────────────────────────────────────────────────────────
candidate /Users/Admin/.local/share/opencode/worktree/f9a5d9/lv-012-act2/src/levels/candidates/l024.json · rung 24

par=21 D_exec=25.604651 B=1.5349 (CUT 14.969697, delta 10.634954; delta vs Act I peak 0.875239)
derived multi-pocket device (from the landed bytes, never from the authoring script): landing 5,4 (behind the portal) · near 1,5 · 3 walk-sealed room(s): d2[5,0 6,0 6,1] · d3[4,2](goal) · d1[4,5 5,4 5,5 6,5](landing)
  ok   par-stamped      file par=21 · solver par=21 (par is stamped, §8)
  ok   region           deadStates=0 noUnrecoverableOk=true T=0 R=0
  ok   escalation       D_exec=25.604651 > CUT 14.969697
  ok   act2-par-band    par=21 strictly inside Act II's band (16, 24) (§7.2; the exact-rung ladder of §6.1.1 P2 is NOT the law inside the act band — it is measured below as the named finding it is)
  ok   act2-exec-band   D_exec=25.604651 ∈ [19.75, 29.06] (§7.2's derived Act II band; derived from the measured B band through D_exec = par + 3·B — no new maths)
  ok   act2-b-band      B=1.5349 ∈ [1.2500, 1.6875] (the measured band; F-L16-2 excursion would have to be named)
  ok   act-peak         D_exec=25.604651 vs Act I's measured peak 24.729412 (delta 0.875239) — §7.3 puts the across-act obligation on the act's measured PEAK, never on every interior member: ladder peak rung = L25
  ok   latch-grade      allOffShortest=null (all-OFF world UNSATISFIABLE) par=21 advantage=n/a
  ok   latch-route      par routes=90; press-then-cross on 90 (G2)
  ok   refused-beat     refusedBeforeEnteredTiles=17 [2,0 2,1 2,2 2,3 2,4 2,5 3,2 3,5 4,0 4,1 4,3 4,4 5,1 5,2 5,3 6,2 6,4]
  ok   coverage         distinctPositions=42/42
  ok   validator        ok=true errors=0 warnings=6 policyViolations=0[] one-switch-per-door=true every-switch-fires=true
  ok   well-formed      doors=3 switches=3
  ok   g0-portal-pair   portal(s)=1 (required exactly 1 — §6.2.3 item 1); pair 1,5–5,4 parities 0 / 1 (opposite required, ADR-0009's opposite-colour law sets the frames apart); landing end 5,4 (the end not on foot), near end 1,5; the teleport fires on entry and is measured landing there: arrival=phase A
  ok   g1-pocket-on-foot landing room [4,5 5,4 5,5 6,5] (door d1): on-foot-reachable (portal-free board) room tiles=0 (required 0 — §6.2.3 item 2); on-foot-reachable tiles over ALL 3 sealed room(s)=0 (required 0: the device is portal-only in every room); pre-press edges leaving the room=0 (required 0); edges back onto the near end 1,5=1 (named: the landing is a portal end, so stepping back is a priced cycle, never an exit — ADR-0009)
  ok   g2-room-exit-door 3 walk-sealed room(s) derived from the bytes [d2:5,0+6,0+6,1 · d3:4,2 · d1:4,5+5,4+5,5+6,5]; rooms whose boundary is not exactly one door object, or carries a phase wall (F-L19-2), or an open leak=0 (required 0)
  ok   g6-room-structure rooms=3 (required ≥ 2 — §6.2.3's device carries a landing channel and the goal's own seal); covering doors distinct=true [d2 d3 d1]; landing room carries the switch that opens ITS OWN door=true (switch(es) in the landing room [s1] targeting [d1]); the goal's room is switch-free and its door is driven from elsewhere=true (goal room [4,2] door [d3] switch(es) [])
  ok   g3-ordered-chain par=21 · 90 shortest route(s); press order(s) [s1>s2>s3] (one shared order required; chain s1>s2>s3); distinct switches per route: min=3 (required ≥ 3); routes executing press→cross in the strict order with the landing room's switch first: 90/90; FORCING by staged worlds: drop{s1} ⇒ switch s2 tile reachable=false goal reachable=false · drop{s1,s2} ⇒ switch s3 tile reachable=false goal reachable=false — every staged world must read FALSE for both (§6.2.3 item 4, ordered and forced, not merely present)
  ok   g4-switch-required allOffShortest=null (all-OFF world UNSATISFIABLE) allOffGoalReachable=false par=21 — with every switch OFF the landing room's door refuses its only exit, so the whole far region beyond it is unreachable: the latch carries existence
  ok   g5-identity-broken par = min_i(d(start→s_i) + 1 + d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5); it holds only while every seal tile is directly adjacent to the free far region. Measured: 7 seal tile(s) outside the landing room, 7 NOT adjacent to the all-OFF free region [4,0 5,1 6,2 3,2 4,1 4,3 5,2] (free region 15 position(s)); the identity's VALUE — the world with the landing device (door d1 + its switch[es]) removed — solves at 19 < par 21: its one-press arithmetic no longer computes this board

GATES: ACCEPT

negative controls on the landed bytes:
  MEASURED latch removed (switches dropped) → unsolvable
  MEASURED every switch muted (latch fully decorative) → unsolvable
  MEASURED goal sealed in both phases → unsolvable
  MEASURED portal pair dropped (parity frame broken) → unsolvable
  MEASURED every switch retargeted to the first door → unsolvable
  MEASURED par mis-stamped (file par falls by 1) → par-stamped
  MEASURED g0 control — a second portal pair added (§6.2.3 item 1: exactly one) → par-stamped+escalation+act2-par-band+act2-exec-band+latch-grade+latch-route+validator+g0-portal-pair+g3-ordered-chain+g4-switch-required+g5-identity-broken  [gate g0-portal-pair named: true]
  MEASURED g1 control — the landing room's door "d1" dropped (the room is no longer portal-only) → par-stamped+validator+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g1-pocket-on-foot named: true]
  MEASURED g2 control — one landing-room boundary tile dropped from door "d1" (a free leak) → g2-room-exit-door+g3-ordered-chain  [gate g2-room-exit-door named: true]
  MEASURED g6 control — the landing device removed (door + switch): the multi-pocket derivation collapses → par-stamped+g6-room-structure  [gate g6-room-structure named: true]
  MEASURED g3 control — the goal's seal door "d3" dropped (the chain loses a press) → par-stamped+act2-par-band+act2-exec-band+validator+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g3-ordered-chain named: true]
  MEASURED g4 control — every door and switch dropped (existence stops needing any press) → par-stamped+escalation+act2-par-band+act2-exec-band+latch-grade+latch-route+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g4-switch-required+g5-identity-broken  [gate g4-switch-required named: true]
  MEASURED g5 control — the landing-device-removed world (the census identity holds again) → par-stamped+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g5-identity-broken named: true]
controls: 13 measured (no assertion — this is the EXPECTATION pass, F-L16-3 order)

RESULT: PASS

──────────────────────────────────────────────────────────────────────────────
candidate /Users/Admin/.local/share/opencode/worktree/f9a5d9/lv-012-act2/src/levels/candidates/l025.json · rung 25

par=23 D_exec=27.604651 B=1.5349 (CUT 14.969697, delta 12.634954; delta vs Act I peak 2.875239)
derived multi-pocket device (from the landed bytes, never from the authoring script): landing 4,5 (behind the portal) · near 1,5 · 3 walk-sealed room(s): d2[5,0 6,0 6,1] · d3[4,2](goal) · d1[4,5 5,4 5,5 6,5](landing)
  ok   par-stamped      file par=23 · solver par=23 (par is stamped, §8)
  ok   region           deadStates=0 noUnrecoverableOk=true T=0 R=0
  ok   escalation       D_exec=27.604651 > CUT 14.969697
  ok   act2-par-band    par=23 strictly inside Act II's band (16, 24) (§7.2; the exact-rung ladder of §6.1.1 P2 is NOT the law inside the act band — it is measured below as the named finding it is)
  ok   act2-exec-band   D_exec=27.604651 ∈ [19.75, 29.06] (§7.2's derived Act II band; derived from the measured B band through D_exec = par + 3·B — no new maths)
  ok   act2-b-band      B=1.5349 ∈ [1.2500, 1.6875] (the measured band; F-L16-2 excursion would have to be named)
  ok   act-peak         D_exec=27.604651 vs Act I's measured peak 24.729412 (delta 2.875239) — §7.3 puts the across-act obligation on the act's measured PEAK, never on every interior member: ladder peak rung = L25
  ok   latch-grade      allOffShortest=null (all-OFF world UNSATISFIABLE) par=23 advantage=n/a
  ok   latch-route      par routes=72; press-then-cross on 72 (G2)
  ok   refused-beat     refusedBeforeEnteredTiles=17 [2,0 2,1 2,2 2,3 2,4 2,5 3,2 3,5 4,0 4,1 4,3 4,4 5,1 5,2 5,3 6,2 6,4]
  ok   coverage         distinctPositions=42/42
  ok   validator        ok=true errors=0 warnings=6 policyViolations=0[] one-switch-per-door=true every-switch-fires=true
  ok   well-formed      doors=3 switches=3
  ok   g0-portal-pair   portal(s)=1 (required exactly 1 — §6.2.3 item 1); pair 1,5–4,5 parities 0 / 1 (opposite required, ADR-0009's opposite-colour law sets the frames apart); landing end 4,5 (the end not on foot), near end 1,5; the teleport fires on entry and is measured landing there: arrival=phase A
  ok   g1-pocket-on-foot landing room [4,5 5,4 5,5 6,5] (door d1): on-foot-reachable (portal-free board) room tiles=0 (required 0 — §6.2.3 item 2); on-foot-reachable tiles over ALL 3 sealed room(s)=0 (required 0: the device is portal-only in every room); pre-press edges leaving the room=0 (required 0); edges back onto the near end 1,5=1 (named: the landing is a portal end, so stepping back is a priced cycle, never an exit — ADR-0009)
  ok   g2-room-exit-door 3 walk-sealed room(s) derived from the bytes [d2:5,0+6,0+6,1 · d3:4,2 · d1:4,5+5,4+5,5+6,5]; rooms whose boundary is not exactly one door object, or carries a phase wall (F-L19-2), or an open leak=0 (required 0)
  ok   g6-room-structure rooms=3 (required ≥ 2 — §6.2.3's device carries a landing channel and the goal's own seal); covering doors distinct=true [d2 d3 d1]; landing room carries the switch that opens ITS OWN door=true (switch(es) in the landing room [s1] targeting [d1]); the goal's room is switch-free and its door is driven from elsewhere=true (goal room [4,2] door [d3] switch(es) [])
  ok   g3-ordered-chain par=23 · 72 shortest route(s); press order(s) [s1>s2>s3] (one shared order required; chain s1>s2>s3); distinct switches per route: min=3 (required ≥ 3); routes executing press→cross in the strict order with the landing room's switch first: 72/72; FORCING by staged worlds: drop{s1} ⇒ switch s2 tile reachable=false goal reachable=false · drop{s1,s2} ⇒ switch s3 tile reachable=false goal reachable=false — every staged world must read FALSE for both (§6.2.3 item 4, ordered and forced, not merely present)
  ok   g4-switch-required allOffShortest=null (all-OFF world UNSATISFIABLE) allOffGoalReachable=false par=23 — with every switch OFF the landing room's door refuses its only exit, so the whole far region beyond it is unreachable: the latch carries existence
  ok   g5-identity-broken par = min_i(d(start→s_i) + 1 + d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5); it holds only while every seal tile is directly adjacent to the free far region. Measured: 7 seal tile(s) outside the landing room, 7 NOT adjacent to the all-OFF free region [4,0 5,1 6,2 3,2 4,1 4,3 5,2] (free region 15 position(s)); the identity's VALUE — the world with the landing device (door d1 + its switch[es]) removed — solves at 19 < par 23: its one-press arithmetic no longer computes this board

GATES: ACCEPT

negative controls on the landed bytes:
  MEASURED latch removed (switches dropped) → unsolvable
  MEASURED every switch muted (latch fully decorative) → unsolvable
  MEASURED goal sealed in both phases → unsolvable
  MEASURED portal pair dropped (parity frame broken) → unsolvable
  MEASURED every switch retargeted to the first door → unsolvable
  MEASURED par mis-stamped (file par falls by 1) → par-stamped
  MEASURED g0 control — a second portal pair added (§6.2.3 item 1: exactly one) → par-stamped+escalation+act2-par-band+act2-exec-band+act-peak+latch-grade+latch-route+validator+g0-portal-pair+g3-ordered-chain+g4-switch-required+g5-identity-broken  [gate g0-portal-pair named: true]
  MEASURED g1 control — the landing room's door "d1" dropped (the room is no longer portal-only) → par-stamped+act-peak+validator+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g1-pocket-on-foot named: true]
  MEASURED g2 control — one landing-room boundary tile dropped from door "d1" (a free leak) → par-stamped+act-peak+g1-pocket-on-foot+g2-room-exit-door+g3-ordered-chain+g5-identity-broken  [gate g2-room-exit-door named: true]
  MEASURED g6 control — the landing device removed (door + switch): the multi-pocket derivation collapses → par-stamped+act-peak+g6-room-structure  [gate g6-room-structure named: true]
  MEASURED g3 control — the goal's seal door "d3" dropped (the chain loses a press) → par-stamped+act2-par-band+act2-exec-band+act-peak+validator+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g3-ordered-chain named: true]
  MEASURED g4 control — every door and switch dropped (existence stops needing any press) → par-stamped+escalation+act2-par-band+act2-exec-band+act-peak+latch-grade+latch-route+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g4-switch-required+g5-identity-broken  [gate g4-switch-required named: true]
  MEASURED g5 control — the landing-device-removed world (the census identity holds again) → par-stamped+act-peak+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [gate g5-identity-broken named: true]
controls: 13 measured (no assertion — this is the EXPECTATION pass, F-L16-3 order)

RESULT: PASS

══════════════════════════════════════════════════════════════════════════════
LADDER TABLE — L21, L22, L23, L24, L25 (§7.2 band, §7.3 rise, §7.7 handoff)
rung · par · D_exec · B · coverage · prev-step Δpar · strictly-rising D_exec · Δ vs Act I peak 24.729412
L21 · par 17 · 21.581395 · 1.5271 · 42/42 · Δpar — · rise — · delta -3.148017
L22 · par 18 · 22.584000 · 1.5280 · 42/42 · Δpar <2 (1) · rise OK (1.002605) · delta -2.145412
L23 · par 20 · 24.620000 · 1.5400 · 42/42 · Δpar ≥2 (2) · rise OK (2.036000) · delta -0.109412
L24 · par 21 · 25.604651 · 1.5349 · 42/42 · Δpar <2 (1) · rise OK (0.984651) · delta 0.875239
L25 · par 23 · 27.604651 · 1.5349 · 42/42 · Δpar ≥2 (2) · rise OK (2.000000) · delta 2.875239
batch peak: L25 at 27.604651 · Act I measured peak 24.729412 · §7.3 act-peak clause DISCHARGED · headroom to the Act II ceiling 29.06: 1.455349
LADDER RESULT: PASS (5/5 rung(s) ACCEPT, every control caught on every rung)
```

## 3. Pass 2 — the assertion pass: gates and controls, per rung

`expect` is a **union of the measured firings across the five rungs** (a mutation aimed at a late
gate may legitimately be refused by a stronger, earlier reader — F-L20-4), and every family-`g`
control **additionally** asserts that its **own** gate was named (`mustFire`). A battery whose gates
were never named would be vacuous; a mutation that is *accepted* fails the battery regardless of how
wide the list is.

```
prove-candidate — CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 · 20 shipped files · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] (the L16–L19 ladder is excluded from its own filter — see measureCut)
family g (Act II multi-pocket — §7.2 / §7.4 stage G) · Act I's measured peak the batch must clear: 24.729412 · ladder peak rung L25
ladder mode: proving L21 → L22 → L23 → L24 → L25 from src/levels/candidates/

──────────────────────────────────────────────────────────────────────────────
candidate /Users/Admin/.local/share/opencode/worktree/f9a5d9/lv-012-act2/src/levels/candidates/l021.json · rung 21

par=17 D_exec=21.581395 B=1.5271 (CUT 14.969697, delta 6.611698; delta vs Act I peak -3.148017)
derived multi-pocket device (from the landed bytes, never from the authoring script): landing 5,5 (behind the portal) · near 0,5 · 3 walk-sealed room(s): d2[5,0 6,0 6,1] · d3[4,2](goal) · d1[4,5 5,4 5,5 6,5](landing)
  ok   par-stamped      file par=17 · solver par=17 (par is stamped, §8)
  ok   region           deadStates=0 noUnrecoverableOk=true T=0 R=0
  ok   escalation       D_exec=21.581395 > CUT 14.969697
  ok   act2-par-band    par=17 strictly inside Act II's band (16, 24) (§7.2; the exact-rung ladder of §6.1.1 P2 is NOT the law inside the act band — it is measured below as the named finding it is)
  ok   act2-exec-band   D_exec=21.581395 ∈ [19.75, 29.06] (§7.2's derived Act II band; derived from the measured B band through D_exec = par + 3·B — no new maths)
  ok   act2-b-band      B=1.5271 ∈ [1.2500, 1.6875] (the measured band; F-L16-2 excursion would have to be named)
  ok   act-peak         D_exec=21.581395 vs Act I's measured peak 24.729412 (delta -3.148017) — §7.3 puts the across-act obligation on the act's measured PEAK, never on every interior member: ladder peak rung = L25
  ok   latch-grade      allOffShortest=null (all-OFF world UNSATISFIABLE) par=17 advantage=n/a
  ok   latch-route      par routes=12; press-then-cross on 12 (G2)
  ok   refused-beat     refusedBeforeEnteredTiles=17 [2,0 2,1 2,2 2,3 2,4 2,5 3,2 3,5 4,0 4,1 4,3 4,4 5,1 5,2 5,3 6,2 6,4]
  ok   coverage         distinctPositions=42/42
  ok   validator        ok=true errors=0 warnings=6 policyViolations=0[] one-switch-per-door=true every-switch-fires=true
  ok   well-formed      doors=3 switches=3
  ok   g0-portal-pair   portal(s)=1 (required exactly 1 — §6.2.3 item 1); pair 0,5–5,5 parities 1 / 0 (opposite required, ADR-0009's opposite-colour law sets the frames apart); landing end 5,5 (the end not on foot), near end 0,5; the teleport fires on entry and is measured landing there: arrival=phase B
  ok   g1-pocket-on-foot landing room [4,5 5,4 5,5 6,5] (door d1): on-foot-reachable (portal-free board) room tiles=0 (required 0 — §6.2.3 item 2); on-foot-reachable tiles over ALL 3 sealed room(s)=0 (required 0: the device is portal-only in every room); pre-press edges leaving the room=0 (required 0); edges back onto the near end 0,5=2 (named: the landing is a portal end, so stepping back is a priced cycle, never an exit — ADR-0009)
  ok   g2-room-exit-door 3 walk-sealed room(s) derived from the bytes [d2:5,0+6,0+6,1 · d3:4,2 · d1:4,5+5,4+5,5+6,5]; rooms whose boundary is not exactly one door object, or carries a phase wall (F-L19-2), or an open leak=0 (required 0)
  ok   g6-room-structure rooms=3 (required ≥ 2 — §6.2.3's device carries a landing channel and the goal's own seal); covering doors distinct=true [d2 d3 d1]; landing room carries the switch that opens ITS OWN door=true (switch(es) in the landing room [s1] targeting [d1]); the goal's room is switch-free and its door is driven from elsewhere=true (goal room [4,2] door [d3] switch(es) [])
  ok   g3-ordered-chain par=17 · 12 shortest route(s); press order(s) [s1>s2>s3] (one shared order required; chain s1>s2>s3); distinct switches per route: min=3 (required ≥ 3); routes executing press→cross in the strict order with the landing room's switch first: 12/12; FORCING by staged worlds: drop{s1} ⇒ switch s2 tile reachable=false goal reachable=false · drop{s1,s2} ⇒ switch s3 tile reachable=false goal reachable=false — every staged world must read FALSE for both (§6.2.3 item 4, ordered and forced, not merely present)
  ok   g4-switch-required allOffShortest=null (all-OFF world UNSATISFIABLE) allOffGoalReachable=false par=17 — with every switch OFF the landing room's door refuses its only exit, so the whole far region beyond it is unreachable: the latch carries existence
  ok   g5-identity-broken par = min_i(d(start→s_i) + 1 + d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5); it holds only while every seal tile is directly adjacent to the free far region. Measured: 7 seal tile(s) outside the landing room, 7 NOT adjacent to the all-OFF free region [4,0 5,1 6,2 3,2 4,1 4,3 5,2] (free region 15 position(s)); the identity's VALUE — the world with the landing device (door d1 + its switch[es]) removed — solves at 15 < par 17: its one-press arithmetic no longer computes this board

GATES: ACCEPT

negative controls on the landed bytes:
  CAUGHT  latch removed (switches dropped) → unsolvable  (expected a refusal naming one of: unsolvable)
  CAUGHT  every switch muted (latch fully decorative) → unsolvable  (expected a refusal naming one of: validator, unsolvable)
  CAUGHT  goal sealed in both phases → unsolvable  (expected a refusal naming one of: rules, unsolvable)
  CAUGHT  portal pair dropped (parity frame broken) → unsolvable  (expected a refusal naming one of: unsolvable, g0-portal-pair)
  CAUGHT  every switch retargeted to the first door → unsolvable  (expected a refusal naming one of: unsolvable, validator, latch-route, coverage)
  CAUGHT  par mis-stamped (file par falls by 1) → par-stamped  (expected a refusal naming one of: par-stamped)
  CAUGHT  g0 control — a second portal pair added (§6.2.3 item 1: exactly one) → par-stamped+escalation+act2-par-band+act2-exec-band+latch-grade+latch-route+validator+g0-portal-pair+g3-ordered-chain+g4-switch-required+g5-identity-broken  [expected a refusal naming one of: g0-portal-pair, validator, par-stamped, escalation, act2-par-band, act2-exec-band, act-peak, latch-grade, latch-route, g3-ordered-chain, g4-switch-required, g5-identity-broken; gate g0-portal-pair named: true]
  CAUGHT  g1 control — the landing room's door "d1" dropped (the room is no longer portal-only) → par-stamped+act2-par-band+validator+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, g5-identity-broken, validator, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g1-pocket-on-foot named: true]
  CAUGHT  g2 control — one landing-room boundary tile dropped from door "d1" (a free leak) → region+act2-exec-band+g2-room-exit-door  [expected a refusal naming one of: g2-room-exit-door, region, g1-pocket-on-foot, g3-ordered-chain, g5-identity-broken, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g2-room-exit-door named: true]
  CAUGHT  g6 control — the landing device removed (door + switch): the multi-pocket derivation collapses → par-stamped+act2-par-band+g6-room-structure  [expected a refusal naming one of: g6-room-structure, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g6-room-structure named: true]
  CAUGHT  g3 control — the goal's seal door "d3" dropped (the chain loses a press) → par-stamped+escalation+act2-par-band+act2-exec-band+validator+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g3-ordered-chain, g2-room-exit-door, g6-room-structure, g5-identity-broken, validator, par-stamped, escalation, act2-par-band, act2-exec-band, act-peak; gate g3-ordered-chain named: true]
  CAUGHT  g4 control — every door and switch dropped (existence stops needing any press) → par-stamped+escalation+act2-par-band+act2-exec-band+act2-b-band+latch-grade+latch-route+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g4-switch-required+g5-identity-broken  [expected a refusal naming one of: g4-switch-required, g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, latch-grade, latch-route, par-stamped, escalation, act2-par-band, act2-exec-band, act2-b-band, act-peak; gate g4-switch-required named: true]
  CAUGHT  g5 control — the landing-device-removed world (the census identity holds again) → par-stamped+act2-par-band+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g5-identity-broken, g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g5-identity-broken named: true]
controls: 13/13 caught by their named gate

RESULT: PASS

──────────────────────────────────────────────────────────────────────────────
candidate /Users/Admin/.local/share/opencode/worktree/f9a5d9/lv-012-act2/src/levels/candidates/l022.json · rung 22

par=18 D_exec=22.584000 B=1.5280 (CUT 14.969697, delta 7.614303; delta vs Act I peak -2.145412)
derived multi-pocket device (from the landed bytes, never from the authoring script): landing 5,5 (behind the portal) · near 1,0 · 3 walk-sealed room(s): d2[4,0 5,0 5,1 6,0] · d3[4,3](goal) · d1[5,5 6,4 6,5](landing)
  ok   par-stamped      file par=18 · solver par=18 (par is stamped, §8)
  ok   region           deadStates=0 noUnrecoverableOk=true T=0 R=0
  ok   escalation       D_exec=22.584000 > CUT 14.969697
  ok   act2-par-band    par=18 strictly inside Act II's band (16, 24) (§7.2; the exact-rung ladder of §6.1.1 P2 is NOT the law inside the act band — it is measured below as the named finding it is)
  ok   act2-exec-band   D_exec=22.584000 ∈ [19.75, 29.06] (§7.2's derived Act II band; derived from the measured B band through D_exec = par + 3·B — no new maths)
  ok   act2-b-band      B=1.5280 ∈ [1.2500, 1.6875] (the measured band; F-L16-2 excursion would have to be named)
  ok   act-peak         D_exec=22.584000 vs Act I's measured peak 24.729412 (delta -2.145412) — §7.3 puts the across-act obligation on the act's measured PEAK, never on every interior member: ladder peak rung = L25
  ok   latch-grade      allOffShortest=null (all-OFF world UNSATISFIABLE) par=18 advantage=n/a
  ok   latch-route      par routes=16; press-then-cross on 16 (G2)
  ok   refused-beat     refusedBeforeEnteredTiles=17 [2,0 2,1 2,2 2,3 2,4 2,5 3,0 3,3 4,1 4,2 4,4 4,5 5,2 5,3 5,4 6,1 6,3]
  ok   coverage         distinctPositions=42/42
  ok   validator        ok=true errors=0 warnings=6 policyViolations=0[] one-switch-per-door=true every-switch-fires=true
  ok   well-formed      doors=3 switches=3
  ok   g0-portal-pair   portal(s)=1 (required exactly 1 — §6.2.3 item 1); pair 1,0–5,5 parities 1 / 0 (opposite required, ADR-0009's opposite-colour law sets the frames apart); landing end 5,5 (the end not on foot), near end 1,0; the teleport fires on entry and is measured landing there: arrival=phase B
  ok   g1-pocket-on-foot landing room [5,5 6,4 6,5] (door d1): on-foot-reachable (portal-free board) room tiles=0 (required 0 — §6.2.3 item 2); on-foot-reachable tiles over ALL 3 sealed room(s)=0 (required 0: the device is portal-only in every room); pre-press edges leaving the room=0 (required 0); edges back onto the near end 1,0=0 (named: the landing is a portal end, so stepping back is a priced cycle, never an exit — ADR-0009)
  ok   g2-room-exit-door 3 walk-sealed room(s) derived from the bytes [d2:4,0+5,0+5,1+6,0 · d3:4,3 · d1:5,5+6,4+6,5]; rooms whose boundary is not exactly one door object, or carries a phase wall (F-L19-2), or an open leak=0 (required 0)
  ok   g6-room-structure rooms=3 (required ≥ 2 — §6.2.3's device carries a landing channel and the goal's own seal); covering doors distinct=true [d2 d3 d1]; landing room carries the switch that opens ITS OWN door=true (switch(es) in the landing room [s1] targeting [d1]); the goal's room is switch-free and its door is driven from elsewhere=true (goal room [4,3] door [d3] switch(es) [])
  ok   g3-ordered-chain par=18 · 16 shortest route(s); press order(s) [s1>s2>s3] (one shared order required; chain s1>s2>s3); distinct switches per route: min=3 (required ≥ 3); routes executing press→cross in the strict order with the landing room's switch first: 16/16; FORCING by staged worlds: drop{s1} ⇒ switch s2 tile reachable=false goal reachable=false · drop{s1,s2} ⇒ switch s3 tile reachable=false goal reachable=false — every staged world must read FALSE for both (§6.2.3 item 4, ordered and forced, not merely present)
  ok   g4-switch-required allOffShortest=null (all-OFF world UNSATISFIABLE) allOffGoalReachable=false par=18 — with every switch OFF the landing room's door refuses its only exit, so the whole far region beyond it is unreachable: the latch carries existence
  ok   g5-identity-broken par = min_i(d(start→s_i) + 1 + d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5); it holds only while every seal tile is directly adjacent to the free far region. Measured: 8 seal tile(s) outside the landing room, 8 NOT adjacent to the all-OFF free region [3,0 4,1 5,2 6,1 3,3 4,2 4,4 5,3] (free region 12 position(s)); the identity's VALUE — the world with the landing device (door d1 + its switch[es]) removed — solves at 14 < par 18: its one-press arithmetic no longer computes this board

GATES: ACCEPT

negative controls on the landed bytes:
  CAUGHT  latch removed (switches dropped) → unsolvable  (expected a refusal naming one of: unsolvable)
  CAUGHT  every switch muted (latch fully decorative) → unsolvable  (expected a refusal naming one of: validator, unsolvable)
  CAUGHT  goal sealed in both phases → unsolvable  (expected a refusal naming one of: rules, unsolvable)
  CAUGHT  portal pair dropped (parity frame broken) → unsolvable  (expected a refusal naming one of: unsolvable, g0-portal-pair)
  CAUGHT  every switch retargeted to the first door → unsolvable  (expected a refusal naming one of: unsolvable, validator, latch-route, coverage)
  CAUGHT  par mis-stamped (file par falls by 1) → par-stamped  (expected a refusal naming one of: par-stamped)
  CAUGHT  g0 control — a second portal pair added (§6.2.3 item 1: exactly one) → validator+g0-portal-pair  [expected a refusal naming one of: g0-portal-pair, validator, par-stamped, escalation, act2-par-band, act2-exec-band, act-peak, latch-grade, latch-route, g3-ordered-chain, g4-switch-required, g5-identity-broken; gate g0-portal-pair named: true]
  CAUGHT  g1 control — the landing room's door "d1" dropped (the room is no longer portal-only) → par-stamped+act2-par-band+act2-exec-band+validator+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, g5-identity-broken, validator, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g1-pocket-on-foot named: true]
  CAUGHT  g2 control — one landing-room boundary tile dropped from door "d1" (a free leak) → par-stamped+act2-par-band+act2-exec-band+g1-pocket-on-foot+g2-room-exit-door+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g2-room-exit-door, region, g1-pocket-on-foot, g3-ordered-chain, g5-identity-broken, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g2-room-exit-door named: true]
  CAUGHT  g6 control — the landing device removed (door + switch): the multi-pocket derivation collapses → par-stamped+act2-par-band+act2-exec-band+g6-room-structure  [expected a refusal naming one of: g6-room-structure, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g6-room-structure named: true]
  CAUGHT  g3 control — the goal's seal door "d3" dropped (the chain loses a press) → par-stamped+escalation+act2-par-band+act2-exec-band+validator+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g3-ordered-chain, g2-room-exit-door, g6-room-structure, g5-identity-broken, validator, par-stamped, escalation, act2-par-band, act2-exec-band, act-peak; gate g3-ordered-chain named: true]
  CAUGHT  g4 control — every door and switch dropped (existence stops needing any press) → par-stamped+escalation+act2-par-band+act2-exec-band+act2-b-band+latch-grade+latch-route+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g4-switch-required+g5-identity-broken  [expected a refusal naming one of: g4-switch-required, g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, latch-grade, latch-route, par-stamped, escalation, act2-par-band, act2-exec-band, act2-b-band, act-peak; gate g4-switch-required named: true]
  CAUGHT  g5 control — the landing-device-removed world (the census identity holds again) → par-stamped+act2-par-band+act2-exec-band+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g5-identity-broken, g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g5-identity-broken named: true]
controls: 13/13 caught by their named gate

RESULT: PASS

──────────────────────────────────────────────────────────────────────────────
candidate /Users/Admin/.local/share/opencode/worktree/f9a5d9/lv-012-act2/src/levels/candidates/l023.json · rung 23

par=20 D_exec=24.620000 B=1.5400 (CUT 14.969697, delta 9.650303; delta vs Act I peak -0.109412)
derived multi-pocket device (from the landed bytes, never from the authoring script): landing 6,4 (behind the portal) · near 0,5 · 3 walk-sealed room(s): d2[4,0 5,0 5,1 6,0] · d3[4,3](goal) · d1[5,5 6,4 6,5](landing)
  ok   par-stamped      file par=20 · solver par=20 (par is stamped, §8)
  ok   region           deadStates=0 noUnrecoverableOk=true T=0 R=0
  ok   escalation       D_exec=24.620000 > CUT 14.969697
  ok   act2-par-band    par=20 strictly inside Act II's band (16, 24) (§7.2; the exact-rung ladder of §6.1.1 P2 is NOT the law inside the act band — it is measured below as the named finding it is)
  ok   act2-exec-band   D_exec=24.620000 ∈ [19.75, 29.06] (§7.2's derived Act II band; derived from the measured B band through D_exec = par + 3·B — no new maths)
  ok   act2-b-band      B=1.5400 ∈ [1.2500, 1.6875] (the measured band; F-L16-2 excursion would have to be named)
  ok   act-peak         D_exec=24.620000 vs Act I's measured peak 24.729412 (delta -0.109412) — §7.3 puts the across-act obligation on the act's measured PEAK, never on every interior member: ladder peak rung = L25
  ok   latch-grade      allOffShortest=null (all-OFF world UNSATISFIABLE) par=20 advantage=n/a
  ok   latch-route      par routes=20; press-then-cross on 20 (G2)
  ok   refused-beat     refusedBeforeEnteredTiles=17 [2,0 2,1 2,2 2,3 2,4 2,5 3,0 3,3 4,1 4,2 4,4 4,5 5,2 5,3 5,4 6,1 6,3]
  ok   coverage         distinctPositions=42/42
  ok   validator        ok=true errors=0 warnings=6 policyViolations=0[] one-switch-per-door=true every-switch-fires=true
  ok   well-formed      doors=3 switches=3
  ok   g0-portal-pair   portal(s)=1 (required exactly 1 — §6.2.3 item 1); pair 0,5–6,4 parities 1 / 0 (opposite required, ADR-0009's opposite-colour law sets the frames apart); landing end 6,4 (the end not on foot), near end 0,5; the teleport fires on entry and is measured landing there: arrival=phase B
  ok   g1-pocket-on-foot landing room [5,5 6,4 6,5] (door d1): on-foot-reachable (portal-free board) room tiles=0 (required 0 — §6.2.3 item 2); on-foot-reachable tiles over ALL 3 sealed room(s)=0 (required 0: the device is portal-only in every room); pre-press edges leaving the room=0 (required 0); edges back onto the near end 0,5=1 (named: the landing is a portal end, so stepping back is a priced cycle, never an exit — ADR-0009)
  ok   g2-room-exit-door 3 walk-sealed room(s) derived from the bytes [d2:4,0+5,0+5,1+6,0 · d3:4,3 · d1:5,5+6,4+6,5]; rooms whose boundary is not exactly one door object, or carries a phase wall (F-L19-2), or an open leak=0 (required 0)
  ok   g6-room-structure rooms=3 (required ≥ 2 — §6.2.3's device carries a landing channel and the goal's own seal); covering doors distinct=true [d2 d3 d1]; landing room carries the switch that opens ITS OWN door=true (switch(es) in the landing room [s1] targeting [d1]); the goal's room is switch-free and its door is driven from elsewhere=true (goal room [4,3] door [d3] switch(es) [])
  ok   g3-ordered-chain par=20 · 20 shortest route(s); press order(s) [s1>s2>s3] (one shared order required; chain s1>s2>s3); distinct switches per route: min=3 (required ≥ 3); routes executing press→cross in the strict order with the landing room's switch first: 20/20; FORCING by staged worlds: drop{s1} ⇒ switch s2 tile reachable=false goal reachable=false · drop{s1,s2} ⇒ switch s3 tile reachable=false goal reachable=false — every staged world must read FALSE for both (§6.2.3 item 4, ordered and forced, not merely present)
  ok   g4-switch-required allOffShortest=null (all-OFF world UNSATISFIABLE) allOffGoalReachable=false par=20 — with every switch OFF the landing room's door refuses its only exit, so the whole far region beyond it is unreachable: the latch carries existence
  ok   g5-identity-broken par = min_i(d(start→s_i) + 1 + d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5); it holds only while every seal tile is directly adjacent to the free far region. Measured: 8 seal tile(s) outside the landing room, 8 NOT adjacent to the all-OFF free region [3,0 4,1 5,2 6,1 3,3 4,2 4,4 5,3] (free region 14 position(s)); the identity's VALUE — the world with the landing device (door d1 + its switch[es]) removed — solves at 14 < par 20: its one-press arithmetic no longer computes this board

GATES: ACCEPT

negative controls on the landed bytes:
  CAUGHT  latch removed (switches dropped) → unsolvable  (expected a refusal naming one of: unsolvable)
  CAUGHT  every switch muted (latch fully decorative) → unsolvable  (expected a refusal naming one of: validator, unsolvable)
  CAUGHT  goal sealed in both phases → unsolvable  (expected a refusal naming one of: rules, unsolvable)
  CAUGHT  portal pair dropped (parity frame broken) → unsolvable  (expected a refusal naming one of: unsolvable, g0-portal-pair)
  CAUGHT  every switch retargeted to the first door → unsolvable  (expected a refusal naming one of: unsolvable, validator, latch-route, coverage)
  CAUGHT  par mis-stamped (file par falls by 1) → par-stamped  (expected a refusal naming one of: par-stamped)
  CAUGHT  g0 control — a second portal pair added (§6.2.3 item 1: exactly one) → par-stamped+escalation+act2-par-band+act2-exec-band+latch-grade+latch-route+validator+g0-portal-pair+g3-ordered-chain+g4-switch-required+g5-identity-broken  [expected a refusal naming one of: g0-portal-pair, validator, par-stamped, escalation, act2-par-band, act2-exec-band, act-peak, latch-grade, latch-route, g3-ordered-chain, g4-switch-required, g5-identity-broken; gate g0-portal-pair named: true]
  CAUGHT  g1 control — the landing room's door "d1" dropped (the room is no longer portal-only) → par-stamped+act2-par-band+act2-exec-band+validator+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, g5-identity-broken, validator, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g1-pocket-on-foot named: true]
  CAUGHT  g2 control — one landing-room boundary tile dropped from door "d1" (a free leak) → region+act2-exec-band+g2-room-exit-door  [expected a refusal naming one of: g2-room-exit-door, region, g1-pocket-on-foot, g3-ordered-chain, g5-identity-broken, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g2-room-exit-door named: true]
  CAUGHT  g6 control — the landing device removed (door + switch): the multi-pocket derivation collapses → par-stamped+act2-par-band+act2-exec-band+g6-room-structure  [expected a refusal naming one of: g6-room-structure, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g6-room-structure named: true]
  CAUGHT  g3 control — the goal's seal door "d3" dropped (the chain loses a press) → par-stamped+escalation+act2-par-band+act2-exec-band+validator+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g3-ordered-chain, g2-room-exit-door, g6-room-structure, g5-identity-broken, validator, par-stamped, escalation, act2-par-band, act2-exec-band, act-peak; gate g3-ordered-chain named: true]
  CAUGHT  g4 control — every door and switch dropped (existence stops needing any press) → par-stamped+escalation+act2-par-band+act2-exec-band+act2-b-band+latch-grade+latch-route+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g4-switch-required+g5-identity-broken  [expected a refusal naming one of: g4-switch-required, g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, latch-grade, latch-route, par-stamped, escalation, act2-par-band, act2-exec-band, act2-b-band, act-peak; gate g4-switch-required named: true]
  CAUGHT  g5 control — the landing-device-removed world (the census identity holds again) → par-stamped+act2-par-band+act2-exec-band+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g5-identity-broken, g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g5-identity-broken named: true]
controls: 13/13 caught by their named gate

RESULT: PASS

──────────────────────────────────────────────────────────────────────────────
candidate /Users/Admin/.local/share/opencode/worktree/f9a5d9/lv-012-act2/src/levels/candidates/l024.json · rung 24

par=21 D_exec=25.604651 B=1.5349 (CUT 14.969697, delta 10.634954; delta vs Act I peak 0.875239)
derived multi-pocket device (from the landed bytes, never from the authoring script): landing 5,4 (behind the portal) · near 1,5 · 3 walk-sealed room(s): d2[5,0 6,0 6,1] · d3[4,2](goal) · d1[4,5 5,4 5,5 6,5](landing)
  ok   par-stamped      file par=21 · solver par=21 (par is stamped, §8)
  ok   region           deadStates=0 noUnrecoverableOk=true T=0 R=0
  ok   escalation       D_exec=25.604651 > CUT 14.969697
  ok   act2-par-band    par=21 strictly inside Act II's band (16, 24) (§7.2; the exact-rung ladder of §6.1.1 P2 is NOT the law inside the act band — it is measured below as the named finding it is)
  ok   act2-exec-band   D_exec=25.604651 ∈ [19.75, 29.06] (§7.2's derived Act II band; derived from the measured B band through D_exec = par + 3·B — no new maths)
  ok   act2-b-band      B=1.5349 ∈ [1.2500, 1.6875] (the measured band; F-L16-2 excursion would have to be named)
  ok   act-peak         D_exec=25.604651 vs Act I's measured peak 24.729412 (delta 0.875239) — §7.3 puts the across-act obligation on the act's measured PEAK, never on every interior member: ladder peak rung = L25
  ok   latch-grade      allOffShortest=null (all-OFF world UNSATISFIABLE) par=21 advantage=n/a
  ok   latch-route      par routes=90; press-then-cross on 90 (G2)
  ok   refused-beat     refusedBeforeEnteredTiles=17 [2,0 2,1 2,2 2,3 2,4 2,5 3,2 3,5 4,0 4,1 4,3 4,4 5,1 5,2 5,3 6,2 6,4]
  ok   coverage         distinctPositions=42/42
  ok   validator        ok=true errors=0 warnings=6 policyViolations=0[] one-switch-per-door=true every-switch-fires=true
  ok   well-formed      doors=3 switches=3
  ok   g0-portal-pair   portal(s)=1 (required exactly 1 — §6.2.3 item 1); pair 1,5–5,4 parities 0 / 1 (opposite required, ADR-0009's opposite-colour law sets the frames apart); landing end 5,4 (the end not on foot), near end 1,5; the teleport fires on entry and is measured landing there: arrival=phase A
  ok   g1-pocket-on-foot landing room [4,5 5,4 5,5 6,5] (door d1): on-foot-reachable (portal-free board) room tiles=0 (required 0 — §6.2.3 item 2); on-foot-reachable tiles over ALL 3 sealed room(s)=0 (required 0: the device is portal-only in every room); pre-press edges leaving the room=0 (required 0); edges back onto the near end 1,5=1 (named: the landing is a portal end, so stepping back is a priced cycle, never an exit — ADR-0009)
  ok   g2-room-exit-door 3 walk-sealed room(s) derived from the bytes [d2:5,0+6,0+6,1 · d3:4,2 · d1:4,5+5,4+5,5+6,5]; rooms whose boundary is not exactly one door object, or carries a phase wall (F-L19-2), or an open leak=0 (required 0)
  ok   g6-room-structure rooms=3 (required ≥ 2 — §6.2.3's device carries a landing channel and the goal's own seal); covering doors distinct=true [d2 d3 d1]; landing room carries the switch that opens ITS OWN door=true (switch(es) in the landing room [s1] targeting [d1]); the goal's room is switch-free and its door is driven from elsewhere=true (goal room [4,2] door [d3] switch(es) [])
  ok   g3-ordered-chain par=21 · 90 shortest route(s); press order(s) [s1>s2>s3] (one shared order required; chain s1>s2>s3); distinct switches per route: min=3 (required ≥ 3); routes executing press→cross in the strict order with the landing room's switch first: 90/90; FORCING by staged worlds: drop{s1} ⇒ switch s2 tile reachable=false goal reachable=false · drop{s1,s2} ⇒ switch s3 tile reachable=false goal reachable=false — every staged world must read FALSE for both (§6.2.3 item 4, ordered and forced, not merely present)
  ok   g4-switch-required allOffShortest=null (all-OFF world UNSATISFIABLE) allOffGoalReachable=false par=21 — with every switch OFF the landing room's door refuses its only exit, so the whole far region beyond it is unreachable: the latch carries existence
  ok   g5-identity-broken par = min_i(d(start→s_i) + 1 + d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5); it holds only while every seal tile is directly adjacent to the free far region. Measured: 7 seal tile(s) outside the landing room, 7 NOT adjacent to the all-OFF free region [4,0 5,1 6,2 3,2 4,1 4,3 5,2] (free region 15 position(s)); the identity's VALUE — the world with the landing device (door d1 + its switch[es]) removed — solves at 19 < par 21: its one-press arithmetic no longer computes this board

GATES: ACCEPT

negative controls on the landed bytes:
  CAUGHT  latch removed (switches dropped) → unsolvable  (expected a refusal naming one of: unsolvable)
  CAUGHT  every switch muted (latch fully decorative) → unsolvable  (expected a refusal naming one of: validator, unsolvable)
  CAUGHT  goal sealed in both phases → unsolvable  (expected a refusal naming one of: rules, unsolvable)
  CAUGHT  portal pair dropped (parity frame broken) → unsolvable  (expected a refusal naming one of: unsolvable, g0-portal-pair)
  CAUGHT  every switch retargeted to the first door → unsolvable  (expected a refusal naming one of: unsolvable, validator, latch-route, coverage)
  CAUGHT  par mis-stamped (file par falls by 1) → par-stamped  (expected a refusal naming one of: par-stamped)
  CAUGHT  g0 control — a second portal pair added (§6.2.3 item 1: exactly one) → par-stamped+escalation+act2-par-band+act2-exec-band+latch-grade+latch-route+validator+g0-portal-pair+g3-ordered-chain+g4-switch-required+g5-identity-broken  [expected a refusal naming one of: g0-portal-pair, validator, par-stamped, escalation, act2-par-band, act2-exec-band, act-peak, latch-grade, latch-route, g3-ordered-chain, g4-switch-required, g5-identity-broken; gate g0-portal-pair named: true]
  CAUGHT  g1 control — the landing room's door "d1" dropped (the room is no longer portal-only) → par-stamped+validator+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, g5-identity-broken, validator, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g1-pocket-on-foot named: true]
  CAUGHT  g2 control — one landing-room boundary tile dropped from door "d1" (a free leak) → g2-room-exit-door+g3-ordered-chain  [expected a refusal naming one of: g2-room-exit-door, region, g1-pocket-on-foot, g3-ordered-chain, g5-identity-broken, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g2-room-exit-door named: true]
  CAUGHT  g6 control — the landing device removed (door + switch): the multi-pocket derivation collapses → par-stamped+g6-room-structure  [expected a refusal naming one of: g6-room-structure, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g6-room-structure named: true]
  CAUGHT  g3 control — the goal's seal door "d3" dropped (the chain loses a press) → par-stamped+act2-par-band+act2-exec-band+validator+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g3-ordered-chain, g2-room-exit-door, g6-room-structure, g5-identity-broken, validator, par-stamped, escalation, act2-par-band, act2-exec-band, act-peak; gate g3-ordered-chain named: true]
  CAUGHT  g4 control — every door and switch dropped (existence stops needing any press) → par-stamped+escalation+act2-par-band+act2-exec-band+latch-grade+latch-route+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g4-switch-required+g5-identity-broken  [expected a refusal naming one of: g4-switch-required, g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, latch-grade, latch-route, par-stamped, escalation, act2-par-band, act2-exec-band, act2-b-band, act-peak; gate g4-switch-required named: true]
  CAUGHT  g5 control — the landing-device-removed world (the census identity holds again) → par-stamped+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g5-identity-broken, g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g5-identity-broken named: true]
controls: 13/13 caught by their named gate

RESULT: PASS

──────────────────────────────────────────────────────────────────────────────
candidate /Users/Admin/.local/share/opencode/worktree/f9a5d9/lv-012-act2/src/levels/candidates/l025.json · rung 25

par=23 D_exec=27.604651 B=1.5349 (CUT 14.969697, delta 12.634954; delta vs Act I peak 2.875239)
derived multi-pocket device (from the landed bytes, never from the authoring script): landing 4,5 (behind the portal) · near 1,5 · 3 walk-sealed room(s): d2[5,0 6,0 6,1] · d3[4,2](goal) · d1[4,5 5,4 5,5 6,5](landing)
  ok   par-stamped      file par=23 · solver par=23 (par is stamped, §8)
  ok   region           deadStates=0 noUnrecoverableOk=true T=0 R=0
  ok   escalation       D_exec=27.604651 > CUT 14.969697
  ok   act2-par-band    par=23 strictly inside Act II's band (16, 24) (§7.2; the exact-rung ladder of §6.1.1 P2 is NOT the law inside the act band — it is measured below as the named finding it is)
  ok   act2-exec-band   D_exec=27.604651 ∈ [19.75, 29.06] (§7.2's derived Act II band; derived from the measured B band through D_exec = par + 3·B — no new maths)
  ok   act2-b-band      B=1.5349 ∈ [1.2500, 1.6875] (the measured band; F-L16-2 excursion would have to be named)
  ok   act-peak         D_exec=27.604651 vs Act I's measured peak 24.729412 (delta 2.875239) — §7.3 puts the across-act obligation on the act's measured PEAK, never on every interior member: ladder peak rung = L25
  ok   latch-grade      allOffShortest=null (all-OFF world UNSATISFIABLE) par=23 advantage=n/a
  ok   latch-route      par routes=72; press-then-cross on 72 (G2)
  ok   refused-beat     refusedBeforeEnteredTiles=17 [2,0 2,1 2,2 2,3 2,4 2,5 3,2 3,5 4,0 4,1 4,3 4,4 5,1 5,2 5,3 6,2 6,4]
  ok   coverage         distinctPositions=42/42
  ok   validator        ok=true errors=0 warnings=6 policyViolations=0[] one-switch-per-door=true every-switch-fires=true
  ok   well-formed      doors=3 switches=3
  ok   g0-portal-pair   portal(s)=1 (required exactly 1 — §6.2.3 item 1); pair 1,5–4,5 parities 0 / 1 (opposite required, ADR-0009's opposite-colour law sets the frames apart); landing end 4,5 (the end not on foot), near end 1,5; the teleport fires on entry and is measured landing there: arrival=phase A
  ok   g1-pocket-on-foot landing room [4,5 5,4 5,5 6,5] (door d1): on-foot-reachable (portal-free board) room tiles=0 (required 0 — §6.2.3 item 2); on-foot-reachable tiles over ALL 3 sealed room(s)=0 (required 0: the device is portal-only in every room); pre-press edges leaving the room=0 (required 0); edges back onto the near end 1,5=1 (named: the landing is a portal end, so stepping back is a priced cycle, never an exit — ADR-0009)
  ok   g2-room-exit-door 3 walk-sealed room(s) derived from the bytes [d2:5,0+6,0+6,1 · d3:4,2 · d1:4,5+5,4+5,5+6,5]; rooms whose boundary is not exactly one door object, or carries a phase wall (F-L19-2), or an open leak=0 (required 0)
  ok   g6-room-structure rooms=3 (required ≥ 2 — §6.2.3's device carries a landing channel and the goal's own seal); covering doors distinct=true [d2 d3 d1]; landing room carries the switch that opens ITS OWN door=true (switch(es) in the landing room [s1] targeting [d1]); the goal's room is switch-free and its door is driven from elsewhere=true (goal room [4,2] door [d3] switch(es) [])
  ok   g3-ordered-chain par=23 · 72 shortest route(s); press order(s) [s1>s2>s3] (one shared order required; chain s1>s2>s3); distinct switches per route: min=3 (required ≥ 3); routes executing press→cross in the strict order with the landing room's switch first: 72/72; FORCING by staged worlds: drop{s1} ⇒ switch s2 tile reachable=false goal reachable=false · drop{s1,s2} ⇒ switch s3 tile reachable=false goal reachable=false — every staged world must read FALSE for both (§6.2.3 item 4, ordered and forced, not merely present)
  ok   g4-switch-required allOffShortest=null (all-OFF world UNSATISFIABLE) allOffGoalReachable=false par=23 — with every switch OFF the landing room's door refuses its only exit, so the whole far region beyond it is unreachable: the latch carries existence
  ok   g5-identity-broken par = min_i(d(start→s_i) + 1 + d(s_i→goal)) is the census identity (ai-native-pipeline §8.12 V1.5); it holds only while every seal tile is directly adjacent to the free far region. Measured: 7 seal tile(s) outside the landing room, 7 NOT adjacent to the all-OFF free region [4,0 5,1 6,2 3,2 4,1 4,3 5,2] (free region 15 position(s)); the identity's VALUE — the world with the landing device (door d1 + its switch[es]) removed — solves at 19 < par 23: its one-press arithmetic no longer computes this board

GATES: ACCEPT

negative controls on the landed bytes:
  CAUGHT  latch removed (switches dropped) → unsolvable  (expected a refusal naming one of: unsolvable)
  CAUGHT  every switch muted (latch fully decorative) → unsolvable  (expected a refusal naming one of: validator, unsolvable)
  CAUGHT  goal sealed in both phases → unsolvable  (expected a refusal naming one of: rules, unsolvable)
  CAUGHT  portal pair dropped (parity frame broken) → unsolvable  (expected a refusal naming one of: unsolvable, g0-portal-pair)
  CAUGHT  every switch retargeted to the first door → unsolvable  (expected a refusal naming one of: unsolvable, validator, latch-route, coverage)
  CAUGHT  par mis-stamped (file par falls by 1) → par-stamped  (expected a refusal naming one of: par-stamped)
  CAUGHT  g0 control — a second portal pair added (§6.2.3 item 1: exactly one) → par-stamped+escalation+act2-par-band+act2-exec-band+act-peak+latch-grade+latch-route+validator+g0-portal-pair+g3-ordered-chain+g4-switch-required+g5-identity-broken  [expected a refusal naming one of: g0-portal-pair, validator, par-stamped, escalation, act2-par-band, act2-exec-band, act-peak, latch-grade, latch-route, g3-ordered-chain, g4-switch-required, g5-identity-broken; gate g0-portal-pair named: true]
  CAUGHT  g1 control — the landing room's door "d1" dropped (the room is no longer portal-only) → par-stamped+act-peak+validator+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, g5-identity-broken, validator, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g1-pocket-on-foot named: true]
  CAUGHT  g2 control — one landing-room boundary tile dropped from door "d1" (a free leak) → par-stamped+act-peak+g1-pocket-on-foot+g2-room-exit-door+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g2-room-exit-door, region, g1-pocket-on-foot, g3-ordered-chain, g5-identity-broken, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g2-room-exit-door named: true]
  CAUGHT  g6 control — the landing device removed (door + switch): the multi-pocket derivation collapses → par-stamped+act-peak+g6-room-structure  [expected a refusal naming one of: g6-room-structure, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g6-room-structure named: true]
  CAUGHT  g3 control — the goal's seal door "d3" dropped (the chain loses a press) → par-stamped+act2-par-band+act2-exec-band+act-peak+validator+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g3-ordered-chain, g2-room-exit-door, g6-room-structure, g5-identity-broken, validator, par-stamped, escalation, act2-par-band, act2-exec-band, act-peak; gate g3-ordered-chain named: true]
  CAUGHT  g4 control — every door and switch dropped (existence stops needing any press) → par-stamped+escalation+act2-par-band+act2-exec-band+act-peak+latch-grade+latch-route+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g4-switch-required+g5-identity-broken  [expected a refusal naming one of: g4-switch-required, g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, latch-grade, latch-route, par-stamped, escalation, act2-par-band, act2-exec-band, act2-b-band, act-peak; gate g4-switch-required named: true]
  CAUGHT  g5 control — the landing-device-removed world (the census identity holds again) → par-stamped+act-peak+g1-pocket-on-foot+g2-room-exit-door+g6-room-structure+g3-ordered-chain+g5-identity-broken  [expected a refusal naming one of: g5-identity-broken, g1-pocket-on-foot, g2-room-exit-door, g6-room-structure, g3-ordered-chain, par-stamped, act2-par-band, act2-exec-band, act-peak; gate g5-identity-broken named: true]
controls: 13/13 caught by their named gate

RESULT: PASS

══════════════════════════════════════════════════════════════════════════════
LADDER TABLE — L21, L22, L23, L24, L25 (§7.2 band, §7.3 rise, §7.7 handoff)
rung · par · D_exec · B · coverage · prev-step Δpar · strictly-rising D_exec · Δ vs Act I peak 24.729412
L21 · par 17 · 21.581395 · 1.5271 · 42/42 · Δpar — · rise — · delta -3.148017
L22 · par 18 · 22.584000 · 1.5280 · 42/42 · Δpar <2 (1) · rise OK (1.002605) · delta -2.145412
L23 · par 20 · 24.620000 · 1.5400 · 42/42 · Δpar ≥2 (2) · rise OK (2.036000) · delta -0.109412
L24 · par 21 · 25.604651 · 1.5349 · 42/42 · Δpar <2 (1) · rise OK (0.984651) · delta 0.875239
L25 · par 23 · 27.604651 · 1.5349 · 42/42 · Δpar ≥2 (2) · rise OK (2.000000) · delta 2.875239
batch peak: L25 at 27.604651 · Act I measured peak 24.729412 · §7.3 act-peak clause DISCHARGED · headroom to the Act II ceiling 29.06: 1.455349
LADDER RESULT: PASS (5/5 rung(s) ACCEPT, every control caught on every rung)
```

## 4. The Act II band/peak falsification (`--peak=28.5`)

The band gates have no board mutation to drive them, so they are falsified at the **batch** level
instead: raising the Act I peak the batch must clear to `28.5` — above the batch's own maximum —
must make **exactly one** rung (`L25`, the act's peak) fail, and only on `act-peak`. Measured
difference between the assertion pass and the falsifying run (`diff`), key lines:

```
RESULT: PASS
RESULT: PASS
RESULT: PASS
RESULT: PASS
  FAIL act-peak         D_exec=27.604651 vs Act I's measured peak 28.500000 (delta -0.895349) — §7.3 puts the across-act obligation on the act's measured PEAK, never on every interior member: ladder peak rung = L25
GATES: REJECT — act-peak
RESULT: FAIL
batch peak: L25 at 27.604651 · Act I measured peak 28.500000 · §7.3 act-peak clause NOT DISCHARGED · headroom to the Act II ceiling 29.06: 1.455349
LADDER RESULT: FAIL (4/5 rung(s) ACCEPT, every control caught on every rung)
```

Nothing else moved: same 5 rungs, same `par`/`D_exec`/`B`/coverage/chain, same 13/13 controls on
every rung, and the **exit code is 1** where the assertion pass exits 0.

## 5. Acceptance on this tree (measured; report-only-up)

See `docs/ai-native-pipeline.md` §8.16 for the full battery; the numbers are: `tsc --noEmit`
production clean · `npm run levels` **20/20 ok · 0 errors · 58 warnings · 11/11 probes** · solver
`solve-levels.ts src/levels/candidates --audit` **5/5 PASS**, `parMatch=true` on 5/5 · `vitest` at
the develop tip (shelf empty) **33 files / 0 failed · 758 passed · 3 skipped**, with the five
candidates on the shelf **1 failed file / 1 failed test** — `tests/solver/l16-l20-candidates.test.ts:163`,
the QA-011 **booked-shelf pin** (`expect(shelf).toEqual([])`) — and **no previously-passing test
failing**.

## 6. Reproducing this record

```
git checkout agent/level/lv-012-act2-batch1
npx tsx scripts/prove-candidate.ts --ladder=21,22,23,24,25 --family=g --measure-controls   # §2
npx tsx scripts/prove-candidate.ts --ladder=21,22,23,24,25 --family=g                     # §3
npx tsx scripts/prove-candidate.ts --ladder=21,22,23,24,25 --family=g --peak=28.5          # §4
npm run levels && npx tsx scripts/solve-levels.ts src/levels/candidates --audit            # §5
```

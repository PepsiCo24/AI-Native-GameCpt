R-004a STEP 0 — Act II batch-1 registration + the §7.3 act-scale tail law: re-attestation transcript
task:    R-004a (register the PROVEN L21–L25 shelf into src/levels/) · LEVEL AI + SOLVER lane
law:     docs/level-design.md §7.3 ("act n's measured maximum D_exec strictly exceeds act n−1's measured maximum";
         the act may open BELOW the previous act's peak — "a plateau relaxation at a ΔM = 0 boundary, honestly
         labelled — it is never presented as a dip") · §7.5 items 1–3 · §7.7 items 3–4 (do not re-stamp L20) ·
         docs/decisions/design-0005-move-depth-stars-and-100-level-acts.md · src/core/solver/policy.ts (the law)
source:  branch agent/level/r-004a-registration — src/levels/l021.json … l025.json (the registered root set)
origin:  551fd43:src/levels/candidates (the shelf the five files were moved FROM, byte-for-byte)
run:     npx tsx scripts/attest-r004a-act2.ts            # exit 0 · RESULT: REGISTERED-MATCH
note:    the transcript also EXECUTES scripts/prove-candidate.ts in ladder mode over the registered bytes ([6/6]),
         so the cut and the ladder in the last rows are that instrument's own stdout, not a quote from here.

attest-r004a-act2 — Act II batch 1 registration + the §7.3 act-scale tail law
levels dir: /Users/Admin/VibeCoding/GameCpt/.worktrees/r-004a-reg/src/levels/
origin(s):  L21–L25 551fd43:src/levels/candidates (the shelf the bytes were copied from)

[1/6] byte identity — the registered root files are byte-copies, not edits
  MATCH  l021.json blob identity — root 18d05965c81afa972e74e07918c5cd3ba801742d == 551fd43:src/levels/candidates 18d05965c81afa972e74e07918c5cd3ba801742d (sha256 78df6c27733f…)
  MATCH  l022.json blob identity — root e8fcabd5a0a6ef25eb7345281626a11292ceb5a9 == 551fd43:src/levels/candidates e8fcabd5a0a6ef25eb7345281626a11292ceb5a9 (sha256 de0b579bec18…)
  MATCH  l023.json blob identity — root a2331baf00271991c8206619a521dcb7cefa54e9 == 551fd43:src/levels/candidates a2331baf00271991c8206619a521dcb7cefa54e9 (sha256 f435f8f55aec…)
  MATCH  l024.json blob identity — root cb23369c633a71131f385f3d0f28b7acec0485db == 551fd43:src/levels/candidates cb23369c633a71131f385f3d0f28b7acec0485db (sha256 524aadbcb429…)
  MATCH  l025.json blob identity — root 6e4b10d10b6be889bd35e0bc04293a107fb9dd51 == 551fd43:src/levels/candidates 6e4b10d10b6be889bd35e0bc04293a107fb9dd51 (sha256 afd6bc0e0d2e…)

[2/6] the registered ladder — re-measured from the ROOT bytes, never read from a note
  l021.json (rung 21)
  MATCH  l021.json par — solver 17 · file 17 · registered 17
  MATCH  l021.json D_exec — measured 21.581395 · registered 21.581395
  MATCH  l021.json B — measured 1.5271 · registered 1.5271
  MATCH  l021.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B
  MATCH  l021.json coverage — distinctPositions=42 of 42 · registered 42
  MATCH  l021.json all-OFF world is UNSATISFIABLE (switchRequired measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 16/258 states
  MATCH  l021.json press-then-cross on every par route — parRoutes=12 press-then-cross=12 (shared reader, G2)
  MATCH  l021.json gates all PASS, violations empty — 6/6 gates PASS · codes []
  l022.json (rung 22)
  MATCH  l022.json par — solver 18 · file 18 · registered 18
  MATCH  l022.json D_exec — measured 22.584000 · registered 22.584000
  MATCH  l022.json B — measured 1.5280 · registered 1.5280
  MATCH  l022.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B
  MATCH  l022.json coverage — distinctPositions=42 of 42 · registered 42
  MATCH  l022.json all-OFF world is UNSATISFIABLE (switchRequired measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 15/250 states
  MATCH  l022.json press-then-cross on every par route — parRoutes=16 press-then-cross=16 (shared reader, G2)
  MATCH  l022.json gates all PASS, violations empty — 6/6 gates PASS · codes []
  l023.json (rung 23)
  MATCH  l023.json par — solver 20 · file 20 · registered 20
  MATCH  l023.json D_exec — measured 24.620000 · registered 24.620000
  MATCH  l023.json B — measured 1.5400 · registered 1.5400
  MATCH  l023.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B
  MATCH  l023.json coverage — distinctPositions=42 of 42 · registered 42
  MATCH  l023.json all-OFF world is UNSATISFIABLE (switchRequired measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 15/250 states
  MATCH  l023.json press-then-cross on every par route — parRoutes=20 press-then-cross=20 (shared reader, G2)
  MATCH  l023.json gates all PASS, violations empty — 6/6 gates PASS · codes []
  l024.json (rung 24)
  MATCH  l024.json par — solver 21 · file 21 · registered 21
  MATCH  l024.json D_exec — measured 25.604651 · registered 25.604651
  MATCH  l024.json B — measured 1.5349 · registered 1.5349
  MATCH  l024.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B
  MATCH  l024.json coverage — distinctPositions=42 of 42 · registered 42
  MATCH  l024.json all-OFF world is UNSATISFIABLE (switchRequired measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 16/258 states
  MATCH  l024.json press-then-cross on every par route — parRoutes=90 press-then-cross=90 (shared reader, G2)
  MATCH  l024.json gates all PASS, violations empty — 6/6 gates PASS · codes []
  l025.json (rung 25)
  MATCH  l025.json par — solver 23 · file 23 · registered 23
  MATCH  l025.json D_exec — measured 27.604651 · registered 27.604651
  MATCH  l025.json B — measured 1.5349 · registered 1.5349
  MATCH  l025.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B
  MATCH  l025.json coverage — distinctPositions=42 of 42 · registered 42
  MATCH  l025.json all-OFF world is UNSATISFIABLE (switchRequired measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 16/258 states
  MATCH  l025.json press-then-cross on every par route — parRoutes=72 press-then-cross=72 (shared reader, G2)
  MATCH  l025.json gates all PASS, violations empty — 7/7 gates PASS · codes []

[3/6] §7.3 act-scale tail law — the act peaks, measured on the root bytes
  measured: Act I peak 24.729412 (L20) · Act II peak 27.604651 (L25) · batch peak 27.604651 · act-open L21 21.581395
  MATCH  act-tail-act-i-peak-pin — §7.3 — Act I's registered peak, re-derived from the registered L1–L20 bytes (never read from a constant that the same edit moved)
           measured Act I max D_exec=24.729412 at L20; constant 24.729412 at L20. ANTI-TAUTOLOGY: a relabel that moves this constant to the Act II value (or counts an Act II board into Act I's basis) disagrees with the re-derived measurement and FAILs here — the number has to be re-measured, not restamped.
  MATCH  act-tail-act-ii-peak-pin — §7.5 item 2 — Act II batch 1's measured peak is the registered 27.604651 at L25
           measured batch peak D_exec=27.604651 at L25; registered 27.604651 at L25. The batch's own record is immutable: a restamp of L25's bytes or of the constant moves this line and is refused.
  MATCH  act-tail-peak-advantage — §7.3 — act n's measured maximum strictly exceeds act n−1's, and the registered gap is the measured gap (the derived identity)
           measured: Act II 27.604651 − Act I 24.729412 = 2.875239; registered: 27.604651 − 24.729412 = 2.875239; pinned advantage 2.875239. The clause is an inequality (strictly exceeds) AND a derived equality, which is what keeps it from being satisfied by editing one of the two constants.
  MATCH  act-tail-pre-r004a-standard — R-004a — the pre-registration standard is the registered tail as it stood before this ticket (24.729412, L20), and the batch peak strictly exceeds it
           pre-R004a standard 24.729412 (constant 24.729412) vs Act I's registered peak 24.729412 (they must stay the same number: the tail before this ticket *was* Act I's peak); batch peak 27.604651. This is the R-003d pattern ("BLOCK_L1619_PRE_R003D_TAIL_EXEC"): the standard is kept as its own datum so the re-registration above cannot silently self-confirm.
  MATCH  act-tail-l20-not-restamped — the L16–L20 block law is untouched: the terminal rung is still L20 at its registered par/D_exec, and L21–L25 are NOT grafted onto BLOCK_L1619_IDS
           tail ids [16, 17, 18, 19, 20] vs BLOCK_L1619_IDS [16, 17, 18, 19, 20]; tail par 20 vs 20; tail D_exec 24.729412 vs 24.729412 and vs Act I's registered peak 24.729412; grafted act-II ids []. §7.7 item 4 — "do not re-stamp L20": the registered tail ceiling is a statement about the *sealed landing's* rung, so the five new rungs must prove under their own gates, and a law that moved the block's tail to rung 25 would silently retire the gate L20 is judged by (the clone-guard lesson).
  MATCH  act-tail-l21-open-relief — §7.3 interior freedom — the act may open BELOW Act I's peak: “That is a plateau relaxation at a ΔM = 0 boundary, honestly labelled — it is never presented as a dip” (the act-open member carries the registered relief, inside the act band; the DIRECTION is not part of the law)
           L21 D_exec=21.581395; registered relief 21.581395 (constant 21.581395); relief vs Act I's peak 24.729412 = -3.148017 (MEASURED, not required — the status binds the named rung's registered value and the band, nothing else); act band [19.75, 29.06] ⇒ in band = true. The relief is a ΔM = 0 boundary (the batch introduces no mechanic; M is 4 on every rung), which is what distinguishes it from §6's dip. REFUSED HERE: a reader that demands a cross-act monotone rise (L21 > L20) — that is the mirror-image tautology, and this clause is satisfied by the registered relief *and* by any in-band value in either direction, while an out-of-band member (or a value on the wrong rung) still FAILs by name.
  MATCH  §7.3 — every registered tail clause holds on the registered bytes — 6/6 clauses PASS
  MATCH  §7.3 — the monotone-rise hypothesis is FALSIFIED by the registered relief (interior freedom) — L21 21.581395 < Act I peak 24.729412 (relief -3.148017) and the clause PASSes: a validator demanding a cross-act rise would have refused a registered rung

[4/6] anti-tautology controls — one per tail clause, refused BY NAME
  CAUGHT  act-tail-act-i-peak-pin
          mutation: RELABEL: Act I's basis is given the Act II peak rung (L25 at 27.604651) — the constant and the measurement disagree
          coupling: named: the advantage clause moves with it, because the two ends are the same relabel
          measured: FAIL clauses [act-tail-act-i-peak-pin act-tail-peak-advantage]
  CAUGHT  act-tail-act-ii-peak-pin
          mutation: RESTAMP: the batch peak is re-measured as Act I's value (24.729412 at L25) — the registered record is not reproduced
          coupling: named: the peak no longer clears Act I, so act-tail-peak-advantage fires too (a restamp cannot be a small edit)
          measured: FAIL clauses [act-tail-act-ii-peak-pin act-tail-pre-r004a-standard]
  CAUGHT  act-tail-peak-advantage
          mutation: COLLAPSED RISE: both acts read 27.604651 — the clause is 'strictly exceeds', so equality is not a pass
          coupling: named: the measurement−registration identity fails as well, which is the point of testing both halves
          measured: FAIL clauses [act-tail-act-i-peak-pin act-tail-peak-advantage]
  CAUGHT  act-tail-pre-r004a-standard
          mutation: RESTAMPED STANDARD: the pre-R004a standard is overwritten with the post-registration peak (27.604651) — the re-registration would confirm itself
          coupling: named: the standard must still equal Act I's registered peak, so this control is two clauses in one line
          measured: FAIL clauses [act-tail-pre-r004a-standard]
  CAUGHT  act-tail-l20-not-restamped
          mutation: GRAFT: the block's tail is moved to rung 25 (ids 16–20 + 25, par 25, D_exec 27.604651) — L20 would stop being the rung the registered tail ceiling judges
          coupling: named: the grafted act-II id is named in the detail, so the control cannot pass on a different reason
          measured: FAIL clauses [act-tail-l20-not-restamped]
  CAUGHT  act-tail-l21-open-relief
          mutation: OUT-OF-BAND RELIEF: the act opens at 31.000000 — interior freedom is freedom *inside the band*, never an excuse to drop a rung out of it
          coupling: named: the relief clause is the only one that reads the act-open member, so nothing else can carry the refusal
          measured: FAIL clauses [act-tail-l21-open-relief]
  MATCH  every tail clause has exactly one control — 6/6 caught · clauses covered 6/6
  MATCH  the registered reading is the discrimination side (all six clauses PASS on it) — registered 6/6 PASS · controls 6
  MATCH  the relief clause is not a disguised dip demand (an in-band rise PASSes too) — act-open 25.000000 registered as the relief (in band, ABOVE Act I peak 24.729412) ⇒ act-tail-l21-open-relief PASS — only the named rung's value and the band bind, never the direction
  MATCH  the relief is NAMED, not inferred from the value (the registered relief on the wrong rung FAILs) — L22 carrying 21.581395 ⇒ act-tail-l21-open-relief FAIL — the clause names the act-open member, so an unnamed rung cannot borrow the relief

[5/6] per-member gate controls — one per new gate code, on the registered bytes or the law's table
  CAUGHT  gate-act2-registered-rung
          mutation: -registered-rung: the registered l021 bytes wearing id 22 (par 17 against the registered 18)
          coupling: named: the relabel moves the rung expectation, so this is the rung gate's own refusal
          measured: FAIL gates [act2-registered-rung act2-exec-band act2-b-band]
  CAUGHT  gate-act2-exec-band
          mutation: -exec-band: the LAW table is restamped (L23's registered D_exec moved to 30) while the bytes stay registered
          coupling: named: the band is [19.75, 29.06], so a restamped row leaves the band by three units — the silent-restamp direction this dispatch's guard exists for
          measured: FAIL gates [act2-exec-band]
  CAUGHT  gate-act2-b-band
          mutation: -b-band: the goal-gated seal's l016 board (B = 1.7000, F-L16-2's NAMED excursion) wearing an Act II id, where no excursion is registered
          coupling: named: the rung gate fires too (par 12 ≠ 23), and the excursion register is act-scoped on purpose
          measured: FAIL gates [act2-registered-rung act2-exec-band act2-b-band]
  CAUGHT  gate-act2-exec-identity
          mutation: -exec-identity: the R-003c B10 construction on l021 (a phase-B portal landing in an A-walled pocket ⇒ T > 0), so D_exec = par + 3·B stops holding
          coupling: named: T > 0 also lifts D_exec, which is why the identity is checked as an identity and not as a bound
          measured: FAIL gates [act2-exec-band act2-b-band act2-exec-identity]
  CAUGHT  gate-act2-coverage
          mutation: -coverage: the registered l021 bytes on 7 × 7 with the added row sealed in both phases (42 of 49 positions reachable)
          coupling: named: the grid is part of the registered lattice key, so the row check fires in the same breath
          measured: FAIL gates [act2-coverage]
  CAUGHT  gate-act2-act-peak
          mutation: -act-peak: the interior member l024 (par 21 / D_exec 25.604651) wearing the batch's peak id 25
          coupling: named: an interior rung in the peak's slot cannot claim the registered peak — the clause is an equality AND a strict rise
          measured: FAIL gates [act2-registered-rung act2-exec-band act2-act-peak]
  CAUGHT  gate-shortest-solution-presses-switch-and-crosses-door
          mutation: -latch-route (shared reader): l021 with the pocket switch's targets emptied, so no par route presses-then-crosses
          coupling: named: the switch-without-targets policy fires at the same layer, and the shared G2 reader must not be re-implemented for Act II
          measured: FAIL gates [act2-exec-band act2-b-band act2-exec-identity shortest-solution-presses-switch-and-crosses-door act2-coverage]
  MATCH  one control per new member gate, plus the shared reader, all caught — 7/7 caught
  MATCH  discrimination: the registered bytes fire no act2 gate — FAIL gates on the registered set: 21:[] 22:[] 23:[] 24:[] 25:[]

[6/6] the L16–L20 block law is untouched — L20 keeps the tail it was registered with
  MATCH  L20 is still the registered tail rung, at its registered par/D_exec — par 20 · measured D_exec 24.729412 · Act I registered peak 24.729412
  MATCH  the five new rungs are not grafted onto the block law (they prove under their own gates) — act-tail-l20-not-restamped PASS on the live constants; batch ids [21, 22, 23, 24, 25] ∉ BLOCK_L1619_IDS
  MATCH  the pre-R004a standard is the tail as it stood before this ticket — standard 24.729412 = Act I peak 24.729412; batch peak − Act I peak = 2.875239 = pinned 2.875239
  MATCH  the freezer holds: the cut is still L1–L15, and the ladder still proves at the root — scripts/prove-candidate.ts --family=g --ladder=21,22,23,24,25 --dir=src/levels on this tree: exit 0 · CUT D_exec max = 14.969697 · par(L15) = 10 · 25 shipped files · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] · LADDER 5/5 ACCEPT — the L16–L20 block and the registered Act II batch are excluded from the cut's own filter and prove under their own laws
  CONTROL  freezer clause non-vacuity — the reader moves on a relabeled basis (yes) and the instrument refuses an empty ladder dir (exit 1, required ≠ 0)
  MATCH  the freezer clause can fail (both halves probed) — live basis 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 vs the relabeled basis 16, 17, 18, 19, 20 — the reader distinguishes them; a ladder pointed at the now-EMPTY shelf (src/levels/candidates) exits 1 — the instrument's exit code is a live input

RESULT: REGISTERED-MATCH — the five rungs are byte-identical to the shelf they were copied from (551fd43:src/levels/candidates), every
booked number (par / D_exec / B / T / R / coverage / all-OFF / press-then-cross) is reproduced by the program solver
on the registered bytes, the registered ladder is 17 / 18 / 20 / 21 / 23 rising strictly on the execution axis,
§7.3's act-peak clause is discharged by the batch maximum (27.604651 > Act I's 24.729412, 2.875239) under all six
tail clauses, and 7/7 member controls are refused by name with the L16–L20 block un-restamped.

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
refreshed:
         R-005a re-ran this attester after registering L26–L35 and refreshed the body: the act-level reading it
         prints now spans the whole registered act (L21–L35 → tail 28.339426 at L35), the reported tail-clause set
         is 11 (R-004a's six controlled HERE, R-005a's five controlled by scripts/attest-r005a-reg35.ts, with the
         partition asserted as a reading), and the freezer's ladder line reads 35 shipped files. R-004a's own six
         clauses, the five batch-1 rungs' numbers, the pre-R004a standard and the L20 un-restamp are unchanged.
refreshed:
         R-006a re-ran this attester after registering L36–L40 and refreshed the body, because the act it reads
         grew: the printed act-level line now measures Act II peak 28.455319 (L40), the clause
         `act-tail-peak-advantage` re-points its PIN at the live act (registered 28.455319 − Act I 24.729412 =
         3.725907, over ids 21–40) while R-005a's 3.610014 is kept as its own frozen-basis datum, R-005a's three
         historical-record clauses now read the FROZEN basis `actIIAtR005a` ([21..35]) and say so, the L20
         un-restamp line checks 20 registered Act II ids, the reported tail-clause set is 16 (R-004a 6 controlled
         HERE, R-005a 5 in scripts/attest-r005a-reg35.ts, R-006a 5 in scripts/attest-r006a-reg40.ts — asserted as a
         PARTITION by all three instruments), and the freezer's ladder line reads 40 shipped files. THIS IS THE
         ONLY R-004a/R-005a CLAUSE PIN THIS TICKET MOVED; no R-004a/R-005a constant VALUE moved, R-004a's own six
         clauses, the five batch-1 rungs' numbers and the pre-R004a standard are unchanged.
refreshed:
         R-007 re-ran this attester after registering Act III's opener (L41–L45) and refreshed the body. Two things
         moved in the shared law and nothing else: (i) the reported tail-clause set is now TWENTY-TWO
         (6 + 5 + 5 + 6 — the fourth instrument is scripts/attest-r007-reg45.ts), so the partition row is asserted
         against the four-instrument union (22 claimed / 22 distinct / 0 unclaimed); (ii) Act I's basis is the
         COMPLEMENT of the registered later ACTS, and R-007 opened a third act, so that complement now excludes
         ACT_III_B1_IDS as well — the Act I reading below is again the registered Act I maximum 24.729412 at L20
         instead of absorbing the newly registered act's tail, which is exactly the stale-reading failure the
         clause's own detail names. Nothing about this ticket's own registration moved: no R-004a / R-005a / R-006a
         constant VALUE moved, this instrument's own six clauses are unchanged, the reported rows are unchanged,
         and the freezer's ladder line reads whatever the prover's own census reads (it is an agreement reading,
         never a typed count). The discrimination row's NAME is now count-agnostic ("every reported clause")
         because the count it used to print was the era's.
         (iii) this instrument's freezer row printed a FIXED sentence naming the exclusion set, and the cut's own
         filter had outgrown it — it now names the whole set ("every registered act batch …"), the F-R007-2 class in
         this instrument's own words. One line moved in the body below; no assertion moved, and the MATCH count is
         unchanged.
extra:
attest-r004a-act2 — Act II batch 1 registration + the §7.3 act-scale tail law
levels dir: /Users/Admin/VibeCoding/GameCpt/.worktrees/r-007-reg45/src/levels/
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
  measured: Act I peak 24.729412 (L20) · Act II peak 28.455319 (L40) · batch-1 peak 27.604651 · act-open L21 21.581395
  MATCH  act-tail-act-i-peak-pin — §7.3 — Act I's registered peak, re-derived from the registered L1–L20 bytes (never read from a constant that the same edit moved)
           measured Act I max D_exec=24.729412 at L20; constant 24.729412 at L20. ANTI-TAUTOLOGY: a relabel that moves this constant to the Act II value (or counts an Act II board into Act I's basis) disagrees with the re-derived measurement and FAILs here — the number has to be re-measured, not restamped.
  MATCH  act-tail-act-ii-peak-pin — §7.5 item 2 — Act II batch 1's measured peak is the registered 27.604651 at L25, and its own gap to Act I is the registered 2.875239
           measured batch peak D_exec=27.604651 at L25; registered 27.604651 at L25; measured gap to Act I 2.875239 and registered gap 2.875239 vs pinned 2.875239. The batch's own record is immutable: a restamp of L25's bytes or of the constant moves this line and is refused. R-005a kept this clause on BATCH 1's ids on purpose — the act-level reading moved to act-tail-peak-advantage and act-tail-r005a-tail-pin, so the batch record and the act record can never be swapped for one another.
  MATCH  act-tail-peak-advantage — §7.3 — Act II's measured act-level maximum strictly exceeds Act I's, and the registered gap is the measured gap (read over the whole registered act, ids 21–40: registered 28.455319 at L40 − Act I 24.729412 = 3.725907)
           measured: Act II 28.455319 − Act I 24.729412 = 3.725907; registered: 28.455319 − 24.729412 = 3.725907; pinned advantage 3.725907. The clause is an inequality (strictly exceeds) AND a derived equality, which is what keeps it from being satisfied by editing one of the two constants. R-004a read this over BATCH 1's ids because batch 1 was the whole act, and R-005a re-pointed it at the whole act; after R-006a the act ends at L40, so a batch-1-only or L35-only reading here would publish a stale act maximum (the very failure this clause exists to catch) — batch 1's own identity is pinned by the clause above and R-005a's act-level record by act-tail-r006a-pre-standard. THIS PIN EXPRESSION IS THE ONLY R-004a/R-005a CLAUSE PIN R-006a MOVES, and it moved for exactly the reason R-005a moved it: the previous act-level advantage record (3.610014) is not re-stamped but re-derived from R-005a's frozen basis, so the three act-level readings cannot be swapped.
  MATCH  act-tail-pre-r004a-standard — R-004a — the pre-registration standard is the registered tail as it stood before this ticket (24.729412, L20), and the batch peak strictly exceeds it
           pre-R004a standard 24.729412 (constant 24.729412) vs Act I's registered peak 24.729412 (they must stay the same number: the tail before this ticket *was* Act I's peak); batch peak 27.604651. This is the R-003d pattern ("BLOCK_L1619_PRE_R003D_TAIL_EXEC"): the standard is kept as its own datum so the re-registration above cannot silently self-confirm.
  MATCH  act-tail-l20-not-restamped — the L16–L20 block law is untouched: the terminal rung is still L20 at its registered par/D_exec, and no registered Act II id (21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40) is grafted onto BLOCK_L1619_IDS
           tail ids [16, 17, 18, 19, 20] vs BLOCK_L1619_IDS [16, 17, 18, 19, 20]; tail par 20 vs 20; tail D_exec 24.729412 vs 24.729412 and vs Act I's registered peak 24.729412; grafted act-II ids [] (checked against all 20 registered Act II ids, not only batch 1's five). §7.7 item 4 — "do not re-stamp L20": the registered tail ceiling is a statement about the *sealed landing's* rung, so the new rungs must prove under their own gates, and a law that moved the block's tail to rung 25 (or 35) would silently retire the gate L20 is judged by (the clone-guard lesson).
  MATCH  act-tail-l21-open-relief — §7.3 interior freedom — the act may open BELOW Act I's peak: “That is a plateau relaxation at a ΔM = 0 boundary, honestly labelled — it is never presented as a dip” (the act-open member carries the registered relief, inside the act band; the DIRECTION is not part of the law)
           L21 D_exec=21.581395; registered relief 21.581395 (constant 21.581395); relief vs Act I's peak 24.729412 = -3.148017 (MEASURED, not required — the status binds the named rung's registered value and the band, nothing else); act band [19.75, 29.06] ⇒ in band = true. The relief is a ΔM = 0 boundary (the batch introduces no mechanic; M is 4 on every rung), which is what distinguishes it from §6's dip. REFUSED HERE: a reader that demands a cross-act monotone rise (L21 > L20) — that is the mirror-image tautology, and this clause is satisfied by the registered relief *and* by any in-band value in either direction, while an out-of-band member (or a value on the wrong rung) still FAILs by name.
  MATCH  act-tail-r005a-registered-rows — R-005a — the ten newly registered rungs reproduce their REGISTERED row tables (batches 2 + 3: par / D_exec / B / grid / coverage), so no registered rung can be re-stamped silently
           rows read off the root bytes vs ACT_II_B2_B3_LADDER: L26 17/21.560241/1.5201 (registered 17/21.560241/1.5201) · L27 18/22.560241/1.5201 (registered 18/22.560241/1.5201) · L28 20/24.548193/1.5161 (registered 20/24.548193/1.5161) · L29 21/25.548193/1.5161 (registered 21/25.548193/1.5161) · L30 23/27.566265/1.5221 (registered 23/27.566265/1.5221) · L31 19/23.204167/1.4014 (registered 19/23.204167/1.4014) · L32 22/26.050000/1.3500 (registered 22/26.050000/1.3500) · L33 22/26.069191/1.3564 (registered 22/26.069191/1.3564) · L34 24/28.126943/1.3756 (registered 24/28.126943/1.3756) · L35 24/28.339426/1.4465 (registered 24/28.339426/1.4465). ANTI-TAUTOLOGY: a restamp of any single rung moves that rung's measured D_exec away from its registered row and fails here, by name [none]; the table itself is injectable so the reading cannot be confirmed by the same constant it is compared with. The act's MAXIMUM is pinned separately (act-tail-r005a-tail-pin) — this clause is why the ten rungs below the tail are covered at all, which a max-only reading never could.
  MATCH  act-tail-r005a-tail-pin — R-005a — Act II's registered tail after that ticket is the re-derived maximum over the registered act AS IT STOOD AT R-005a (L21–L35): 28.339426 at L35
           measured era max D_exec=28.339426 at L35 (in band = true); registered 28.339426 at L35. ANTI-TAUTOLOGY: the constant cannot be moved alone — it is compared with a re-derived measurement over the FROZEN era basis ACT_II_R005A_ERA_IDS [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], so a relabel onto another rung (or a basis that drops a registered rung) disagrees and FAILs. §7.9's band is the derived-exact [19.75, 29.0625] (printed [19.75, 29.06]); the operator reads the derived value. R-006a froze the BASIS rather than the number: this clause is a record of R-005a's move, and the live act-level readings are act-tail-peak-advantage, act-tail-r006a-tail-pin and act-tail-r006a-exec-headroom — a record whose basis grew with the dataset would not be a record.
  MATCH  act-tail-r005a-pre-standard — R-005a — the pre-registration standard is the registered tail as it stood before that ticket (27.604651 at L25, batch 1's record), and the R-005a tail strictly exceeds it by the measured 0.734775
           pre-R005a standard 27.604651 (constant 27.604651) vs batch 1's registered record 27.604651 at L25 (they must stay the same number: the tail before that ticket *was* batch 1's peak); measured era post tail 28.339426; derived rise 0.734775 vs pinned 0.734775. This is the R-003d pattern a second time ("BLOCK_L1619_PRE_R003D_TAIL_EXEC" → "ACT_II_B1_PRE_R004A_REGISTERED_TAIL_EXEC" → here): the standard is kept as its own datum, so a re-registration that restamps the standard it is judged against leaves the rise identity unsatisfied and FAILs loudly. Read on the frozen era basis, so R-006a's later move cannot restate this record: the three rise records (batch 1's, R-005a's, R-006a's) are three data, not one mutated number.
  MATCH  act-tail-r005a-exec-headroom — R-005a / §7.9 — the act's registered tail AS OF R-005a keeps DERIVED-EXACT headroom to the act's D_exec ceiling: 29.0625 − 28.339426 = 0.723074 (no rounded operand survives)
           ceiling read 29.0625 (the derived-exact ACT_II_EXEC_BAND[1] = 24 + 3·1.6875 = 29.0625; printed 29.06 is display text, never an operand); measured era tail 28.339426; derived headroom 0.723074 vs pinned 0.723074. ANTI-TAUTOLOGY, both single-edit directions: narrow the band and the derived headroom falls below the pin; restamp the tail upward and it falls the other way — either edit FAILs here without touching the other constant. §7.8 item 2's remaining headroom is the act's own, and the last 0.0025 of it is exactly the sliver §7.9's derived-exact law exists to keep buildable. Read on the frozen era basis: R-005a's 0.723074 is the headroom as of R-005a, and R-006a's live headroom is its own constant (act-tail-r006a-exec-headroom) — the two are separate records rather than one mutated number.
  MATCH  act-tail-r005a-seam-reliefs — R-005a / §7.3.1 — the two PRE-PUBLISHED seam reliefs are registered as published: instance 2 `batch-seam` L25→L26 ΔD_exec=-6.044410 · instance 3 `batch-seam` L30→L31 ΔD_exec=-4.362098 (band DERIVED-EXACT [19.75, 29.0625], printed [19.75, 29.06]; direction NOT part of the clause)
           instance 2 L25→L26: measured 27.604651→21.560241 · registered 27.604651→21.560241 · derived Δ -6.044410 vs published -6.044410 · ok=true | instance 3 L30→L31: measured 27.566265→23.204167 · registered 27.566265→23.204167 · derived Δ -4.362098 vs published -4.362098 · ok=true. Both sides must sit inside the act band (derived-exact) and the derived Δ must equal the published ΔD_exec. THE DIRECTION IS NOT PART OF THE STATUS, deliberately and in both directions: a validator that demanded CROSS-BATCH MONOTONY would have refused both registered seams (L25→L26 −6.044410, L30→L31 −4.362098 — the registered sawtooth), and a law that demanded a DROP would refuse an in-band rise at a seam. What binds is the registered value, the derived delta and the band; that a relief exists at all is §7.3 interior freedom, and its label is the only thing that makes it registrable (§7.3.1). Labels, verbatim, as registered: "RELIEF LABEL — `batch-seam` seam L25→L26 · `ΔD_exec = −6.044410` · band `[19.75, 29.06]`. Interi…" / "RELIEF LABEL — `batch-seam` seam L30→L31 · `ΔD_exec = −4.362098` · band `[19.75, 29.0625]` (prin…" — the band inside each label is the PRINTED form the §7.3.1 text published, while this clause's comparison reads the derived-exact constant (§7.9).
  MATCH  act-tail-r006a-registered-rows — R-006a — the five newly registered rungs reproduce their REGISTERED row tables (batch 4: par / D_exec / B / grid / coverage), so no registered rung of the closing batch can be re-stamped silently
           rows read off the root bytes vs ACT_II_B4_LADDER: L36 18/22.301282/1.4338 (registered 18/22.301282/1.4338) · L37 20/24.252174/1.4174 (registered 20/24.252174/1.4174) · L38 22/26.200000/1.4000 (registered 22/26.200000/1.4000) · L39 24/28.185897/1.3953 (registered 24/28.185897/1.3953) · L40 24/28.455319/1.4851 (registered 24/28.455319/1.4851). ANTI-TAUTOLOGY: a restamp of any single rung moves that rung's measured D_exec away from its registered row and fails here, by name [none]; the table itself is injectable so the reading cannot be confirmed by the same constant it is compared with. The act's MAXIMUM is pinned separately (act-tail-r006a-tail-pin) — this clause is why the four rungs below the tail are covered at all, which a max-only reading never could. §7.4's frame is part of the registered row (7×7 at CX = 1, measured NON-EMPTY by LV-017 after LV-015 measured 7×7 at CX = 2 EMPTY), so a rung silently moved onto the other frame is a restamp like any other.
  MATCH  act-tail-r006a-tail-pin — R-006a — Act II's registered tail after this ticket is the re-derived maximum over the whole LIVE registered act (L21–L40): 28.455319 at L40
           measured act max D_exec=28.455319 at L40 (in band = true); registered 28.455319 at L40. ANTI-TAUTOLOGY: the constant cannot be moved alone — it is compared with a re-derived measurement over ACT_II_REGISTERED_IDS [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40], so a relabel onto another rung (or a basis that drops a registered rung) disagrees and FAILs. §7.9's band is the derived-exact [19.75, 29.0625] (printed [19.75, 29.06]); the operator reads the derived value. §7.3.2 — the act's maximum is carried by its LAST TWO batches: it did not move at L36–L39 (the closing batch's four interior rungs all sit below the R-005a tail, L39 28.185897 by −0.153529) and moved at the batch's final rung, which is the within-par maximum of its par (28.455319 vs 28.185897).
  MATCH  act-tail-r006a-pre-standard — R-006a — the pre-registration standard is the registered tail as it stood before this ticket (28.339426 at L35, ALIAS-TYPED to R-005a's tail constant), and the live tail strictly exceeds it by the measured 0.115893
           pre-R006a standard 28.339426 (constant 28.339426, alias of R-005a's 28.339426 at L35 — compile-time, so the two cannot drift); measured live tail 28.455319; derived rise 0.115893 vs pinned 0.115893. R-005a's OWN act-level record re-derives: 28.339426 − 24.729412 = 3.610014 vs pinned 3.610014 — so the previous registration's datum is neither orphaned nor restamped, which is what stops the three act-level readings (batch 1's, R-005a's, R-006a's) being swapped for one another. This is the R-003d pattern a third time ("BLOCK_L1619_PRE_R003D_TAIL_EXEC" → "ACT_II_B1_PRE_R004A_REGISTERED_TAIL_EXEC" → "ACT_II_PRE_R005A_REGISTERED_TAIL_EXEC" → here): emptying the move — restamping the standard to the post value — leaves the rise identity unsatisfied and FAILs loudly, and a control that injects a moved standard is refused by name.
  MATCH  act-tail-r006a-exec-headroom — R-006a / §7.9 — the act's registered tail keeps DERIVED-EXACT headroom to the act's D_exec ceiling: 29.0625 − 28.455319 = 0.607181 (no rounded operand survives)
           ceiling read 29.0625 (the derived-exact ACT_II_EXEC_BAND[1] = 24 + 3·1.6875 = 29.0625; printed 29.06 is display text, never an operand); measured live tail 28.455319; derived headroom 0.607181 vs pinned 0.607181. ANTI-TAUTOLOGY, both single-edit directions: narrow the band and the derived headroom falls below the pin; restamp the tail upward and it falls the other way — either edit FAILs here without touching the other constant. The act closed at 0.115893 of its 0.723074 R-005a headroom, leaving 0.607181: the remaining margin is the act's own and is still positive, which is the structural condition R-005a's clause could only assert about its own tail.
  MATCH  act-tail-r006a-seam-reliefs — R-006a / §7.3.1 — the fourth PRE-PUBLISHED seam relief is registered as published: instance 4 `batch-seam` L35→L36 ΔD_exec=-6.038144 (band DERIVED-EXACT [19.75, 29.0625], printed [19.75, 29.06]; direction NOT part of the clause)
           instance 4 L35→L36: measured 28.339426→22.301282 · registered 28.339426→22.301282 · derived Δ -6.038144 vs published -6.038144 · ok=true. THE TIGHT MARGINS ARE PRINTED AS MEASURED READINGS, not smoothed: the derived Δ differs from the published −6.038144 by 4.6381e-7 and the L35 end by 4.1253e-7 against LAW_PRECISION 5.0e-7 — both inside it, both determined by bytes frozen at a sha256 the sidecar re-verifies, so the pass is a measurement rather than a coin flip (the same class as R-005a's shipped instance 3, whose L31 end sat at 0.67 of the tolerance). Both sides sit inside the act band (derived-exact) and the derived Δ equals the published ΔD_exec. THE DIRECTION IS NOT PART OF THE STATUS, again in both directions: this is the dossier's single DROP (L35→L36 −6.038144) while every interior seam of the act's other batches and of this batch RISES, so a validator demanding cross-batch monotony would have refused the registered seam and a law demanding a drop would refuse the interior rungs. What binds is the registered value, the derived delta and the band. PROVENANCE, which is what makes it registrable at all: the label was published in the rule commit BEFORE the census and before the bytes (see ACT_II_R006A_SEAM_RELIEF). Label, verbatim, as registered: "RELIEF LABEL — `batch-seam` seam L35→L36 · `ΔD_exec = −6.038144` · band `[19.75, 29.0625]` (prin…"
  MATCH  act-tail-r007-registered-rows — R-007 / §7.10.2 — Act III's five opener rungs reproduce their registered row table (par 20/22/24/26/26, D_exec 24.257329 … 30.455319, grid 7×7, coverage 49) at the law's precision
           The "never re-stamp a registered rung" duty applied at the act boundary: a restamp of ANY single one of the five FAILs here and is named (measured-restamped rows: none). Rows read: L41 par=20 · L42 par=22 · L43 par=24 · L44 par=26 · L45 par=26. ANTI-TAUTOLOGY: the clause compares the MEASURED rows (root bytes) against BOTH the registered table (injectable) and the pinned constant set, so editing the table alone or the bytes alone FAILs. §7.10.2's multiset is 20/22/24/26/26 and the measured rungs are exactly it: the withheld `par 28` is ABSENT and was never substituted (O2/O5), and O3's reservation margin re-derives as 0.6875.
  MATCH  act-tail-r007-tail-pin — R-007 / §7.3.2 — Act III's registered maximum, re-derived over its registered ids (41–45), is 30.455319 at L45 (carrier obligation L51–L60, so this is a READING, not a discharge)
           measured Act III max D_exec=30.455319 at L45; registered 30.455319 at L45; inside the act's derived band [23.7500, 33.0625] (printed [23.75, 33.06]; §7.9). ANTI-TAUTOLOGY: a relabel onto another rung, or a basis that drops a registered rung, disagrees with the re-derived reading and FAILs here. §7.3.2's `act-close` for Act III is carried by L51–L60 and is NOT re-fired by this opener — the same posture R-006a took inside Act II after R-005a discharged it, so this clause reads a value rather than asserting an obligation.
  MATCH  act-tail-r007-peak-advantage — R-007 / §7.3 — the ACT BOUNDARY: Act III's measured act maximum strictly exceeds the PREVIOUS act's registered tail, and the registered gap is the measured gap (registered 30.455319 − 28.455319 = 2.000000)
           measured Act III max 30.455319 (L45) − Act II's registered tail 28.455319 (L40) = 2.000000; registered 30.455319 − 28.455319 = 2.000000 vs pinned 2.000000. ANTI-TAUTOLOGY, both directions: restamp Act III's tail upward and the measured (or the registered) gap stops reproducing the pin; relabel it onto a rung that is not Act III's maximum and the re-derived side moves instead. THE COMPARATOR IS ALIAS-TYPED: `ACT_III_PRE_R007_REGISTERED_TAIL_*` IS `ACT_II_R006A_REGISTERED_TAIL_*`, so a later edit to Act II's tail moves this standard with it rather than silently freezing a value this clause would then be judged against. §7.3's interior freedom still holds on the act's FIRST rung: L41 lands -4.197990 BELOW the previous act's tail, which is the labelled, registered plateau relaxation (clause 22) — the across-act rise is carried by the act's maximum, never by every member.
  MATCH  act-tail-r007-pre-standard — R-007 / §7.3.2 — the R-003d shape ACROSS AN ACT BOUNDARY: the frozen pre-registration standard is the previous act's registered tail (28.455319 at L40), and Act III's tail strictly exceeds it by the measured 2.000000
           standard read 28.455319 at L40; Act III tail 30.455319; derived gap 2.000000 vs pinned 2.000000. ANTI-TAUTOLOGY, and it is the whole point of keeping the standard: emptying the move — restamping the standard to the post value — leaves the rise identity unsatisfied and FAILs loudly, and a control that injects a moved standard is refused by name. The standard is ALIAS-TYPED to Act II's R-006a tail constant, so "the standard is the tail the previous registration left" is a compile-time fact rather than a comment; Act II's own across-act record 3.725907 and batch 1's 2.875239 stay pinned elsewhere and are not restated here.
  MATCH  act-tail-r007-exec-headroom — R-007 / §7.9 — Act III's registered tail keeps DERIVED-EXACT headroom to ITS OWN act ceiling: 33.0625 − 30.455319 = 2.607181 (no rounded operand survives; the printed [23.75, 33.06] would say 2.604681)
           ceiling read 33.0625 (the derived-exact ACT_III_EXEC_BAND[1] = 28 + 3·1.6875 = 33.0625); measured Act III tail 30.455319; derived headroom 2.607181 vs pinned 2.607181. ANTI-TAUTOLOGY, both single-edit directions: narrow Act III's band and the derived headroom falls below the pin; restamp the tail upward and it falls the other way — either edit FAILs here without touching the other constant. The Act II headroom clauses keep reading THEIR ceiling (29.0625) through a separate field, so this clause cannot satisfy them and they cannot satisfy it: a band swap is a FAIL, not a shared number. O3's guarantee survives the registration as a measured fact: the opener tops out at 31.0625 while any `par 28` tail rung bottoms at 31.7500 — margin 0.6875 — so `act-close` stays satisfiable on L51–L60 by construction.
  MATCH  act-tail-r007-seam-reliefs — R-007 / §7.3.1 — the fifth PRE-PUBLISHED relief, and the register's first `act-open` species: instance 5 `act-open` L40→L41 ΔD_exec=-4.197990 (bound [-4.705319, -1.392819], band DERIVED-EXACT [23.75, 33.0625]; direction NOT part of the clause)
           instance 5 (act-open) L40→L41: measured 28.455319→24.257329 · registered 28.455319→24.257329 · derived Δ -4.197990 vs published -4.197990 · publish-before-bytes bound [-4.705319, -1.392819] · admissible first-rung par 20 · ok=true. THE TIGHT MARGINS ARE PRINTED AS MEASURED READINGS, not smoothed: the derived Δ differs from the published −4.197990 by 1.5871e-7 and the L40 end by 1.4894e-7 against LAW_PRECISION 5.0e-7 — both inside it. The stored constant is the 6-decimal display form and the measured double is 24.25732899022801 / −4.19799015793… (F-L41-1: readers compare with `near`, never with `===`). THE BOUND IS CHECKED AS A BOUND, not as prose: the registered delta must land inside §7.10.4's published union AND the union is split by O5's admissible first rungs (par 20 ⇒ [-4.705319, -3.392819] · par 22 ⇒ [-2.705319, -1.392819]), so a fill-in that sits in the union but in neither admissible half is OUTSIDE the label — the clause prints the half it matched by name. THE DIRECTION IS NOT PART OF THE STATUS: this seam DROPS (it is the act boundary), while the four interior rungs of Act III's opener RISE (+1.981444, +1.975043, +2.011400, +0.230104; the last step is par-flat, so its rise is all branching), so a validator demanding monotony would have refused the registered seam and a law demanding a drop would refuse the interior rungs. PROVENANCE, which is what makes it registrable: the BOUND was published at `b28ed97` before any census or byte, the VALUE was filled in at `db78a13` BEFORE l041.json existed, and the bytes landed at `568c136` — the register's first fill-in-before-existence (see ACT_III_B1_OPEN_RELIEF). Label, verbatim, as registered: "RELIEF LABEL — `act-open` seam L40→L41 · `ΔD_exec ∈ [−4.705319, −1.392819]` (exact value filled …"
  MATCH  §7.3 — every registered tail clause holds on the registered bytes — 22/22 clauses PASS
  MATCH  §7.3 — the monotone-rise hypothesis is FALSIFIED by the registered relief (interior freedom) — L21 21.581395 < Act I peak 24.729412 (relief -3.148017) and the clause PASSes: a validator demanding a cross-act rise would have refused a registered rung

[4/6] anti-tautology controls — one per tail clause, refused BY NAME
  CAUGHT  act-tail-act-i-peak-pin
          mutation: RELABEL: Act I's basis is given the Act II peak rung (L25 at 27.604651) — the constant and the measurement disagree
          coupling: named: the advantage clause moves with it, because the two ends are the same relabel
          measured: FAIL clauses [act-tail-act-i-peak-pin act-tail-act-ii-peak-pin act-tail-peak-advantage]
  CAUGHT  act-tail-act-ii-peak-pin
          mutation: RESTAMP: the batch peak is re-measured as Act I's value (24.729412 at L25) — the registered record is not reproduced
          coupling: named: the peak no longer clears Act I, so act-tail-peak-advantage fires too (a restamp cannot be a small edit)
          measured: FAIL clauses [act-tail-act-ii-peak-pin act-tail-pre-r004a-standard]
  CAUGHT  act-tail-peak-advantage
          mutation: COLLAPSED RISE: both acts read 27.604651 — the clause is 'strictly exceeds', so equality is not a pass
          coupling: named: the measurement−registration identity fails as well, which is the point of testing both halves
          measured: FAIL clauses [act-tail-act-i-peak-pin act-tail-act-ii-peak-pin act-tail-peak-advantage]
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
  MATCH  every R-004a tail clause has exactly one control, and the control set is R-004a's own six — 6/6 caught · clauses covered 6/6 (R-004a's six; R-005a's five are act-tail-r005a-registered-rows, act-tail-r005a-tail-pin, act-tail-r005a-pre-standard, act-tail-r005a-exec-headroom, act-tail-r005a-seam-reliefs and are controlled by scripts/attest-r005a-reg35.ts; R-006a's five are act-tail-r006a-registered-rows, act-tail-r006a-tail-pin, act-tail-r006a-pre-standard, act-tail-r006a-exec-headroom, act-tail-r006a-seam-reliefs and are controlled by scripts/attest-r006a-reg40.ts; R-007's six are act-tail-r007-registered-rows, act-tail-r007-tail-pin, act-tail-r007-peak-advantage, act-tail-r007-pre-standard, act-tail-r007-exec-headroom, act-tail-r007-seam-reliefs and are controlled by scripts/attest-r007-reg45.ts — named here so the split of ownership is a reading, not a convention)
  MATCH  the registered reading is the discrimination side (every reported clause PASSes on it) — registered 22/22 PASS · R-004a controls 6 · R-005a (5) + R-006a (5) + R-007 (6) clauses reported here but controlled in their own instruments
  MATCH  the four instruments' clause sets PARTITION the reported set (a future clause must be given a home) — reported 22 · R-004a 6 + R-005a 5 + R-006a 5 + R-007 6 = 22 claimed · 22 distinct · 0 unclaimed (a twenty-third clause with no instrument reddens this row)
  MATCH  the relief clause is not a disguised dip demand (an in-band rise PASSes too) — act-open 25.000000 registered as the relief (in band, ABOVE Act I peak 24.729412) ⇒ act-tail-l21-open-relief PASS — only the named rung's value and the band bind, never the direction
  MATCH  the relief is NAMED, not inferred from the value (the registered relief on the wrong rung FAILs) — L22 carrying 21.581395 ⇒ act-tail-l21-open-relief FAIL — the clause names the act-open member, so an unnamed rung cannot borrow the relief

[5/6] per-member gate controls — one per new gate code, on the registered bytes or the law's table
  CAUGHT  gate-act2-registered-rung
          mutation: -registered-rung: the registered l021 bytes wearing id 22 (par 17 against the registered 18)
          coupling: named: the relabel moves the rung expectation, so this is the rung gate's own refusal
          measured: FAIL gates [act2-registered-rung act2-exec-band act2-b-band]
  CAUGHT  gate-act2-exec-band
          mutation: -exec-band: the LAW table is restamped (L23's registered D_exec moved to 30) while the bytes stay registered
          coupling: named: the band is [19.75, 29.0625] (printed [19.75, 29.06]; §7.9 — derived-exact is the value), so a restamped row leaves the band by three units — the silent-restamp direction this dispatch's guard exists for
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
  MATCH  the new rungs are not grafted onto the block law (they prove under their own gates) — act-tail-l20-not-restamped PASS on the live constants; registered Act II ids [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40] ∉ BLOCK_L1619_IDS (L16–L20)
  MATCH  the pre-R004a standard is the tail as it stood before this ticket — standard 24.729412 = Act I peak 24.729412; batch peak − Act I peak = 2.875239 = pinned 2.875239
  MATCH  the freezer holds: the cut is still L1–L15, and the ladder still proves at the root — scripts/prove-candidate.ts --family=g --ladder=21,22,23,24,25 --dir=src/levels on this tree: exit 0 · CUT D_exec max = 14.969697 · par(L15) = 10 · 45 shipped files · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] · LADDER 5/5 ACCEPT, controls named 65/65 — the L16–L20 block and every registered act batch (Act II + Act III batch 1 at R-007) are excluded from the cut's own filter and prove under their own laws
  CONTROL  freezer clause non-vacuity — the reader moves on a relabeled basis (yes) and the instrument refuses an empty ladder dir (exit 1, required ≠ 0)
  MATCH  the freezer clause can fail (both halves probed) — live basis 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 vs the relabeled basis 16, 17, 18, 19, 20 — the reader distinguishes them; a ladder pointed at the now-EMPTY shelf (src/levels/candidates) exits 1 — the instrument's exit code is a live input

RESULT: REGISTERED-MATCH — the five R-004a rungs are byte-identical to the shelf they were copied from (551fd43:src/levels/candidates), every
booked number (par / D_exec / B / T / R / coverage / all-OFF / press-then-cross) is reproduced by the program solver
on the registered bytes, the registered ladder is 17 / 18 / 20 / 21 / 23 rising strictly on the execution axis,
§7.3's act-peak clause reads the act's measured maximum (28.455319 > Act I's 24.729412, read over 21–40 after R-006a; the value R-005a carried, 28.339426, is the frozen era basis its own three clauses read) under all 22
tail clauses (R-004a's six controlled HERE, R-005a's five by scripts/attest-r005a-reg35.ts, R-006a's five by scripts/attest-r006a-reg40.ts, R-007's six by scripts/attest-r007-reg45.ts), and 7/7 member controls are refused by name with the L16–L20 block un-restamped.

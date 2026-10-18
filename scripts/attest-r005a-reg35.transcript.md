R-005a STEP 0 — Act II batches 2+3 registration + the §7.3 act-scale tail/seam law: re-attestation transcript
task:    R-005a (register the PROVEN L26–L35 shelf into src/levels/) · LEVEL AI + SOLVER lane
law:     docs/level-design.md §7.3 ("act n's measured maximum D_exec strictly exceeds act n−1's measured maximum") ·
         §7.3.1 (the two pre-published batch-seam relief labels, quoted VERBATIM) · §7.3.3 (the felt reading is a
         Playtest hypothesis, NOT TESTABLE at n = 0) · §7.9 (bands derived-exact; the printed 29.06 is display only) ·
         §7.7 items 3–4 (do not re-stamp L20, do not re-stamp the R-004a-era rows) ·
         docs/decisions/design-0006-act-close-peak-and-relief-label-form.md ·
         docs/decisions/design-0007-band-endpoint-law-and-c-path-standing.md · src/core/solver/policy.ts (the law)
source:  branch agent/level/r-005a-reg35 — src/levels/l026.json … l035.json (the registered root set)
origin:  36ffe0b:src/levels/candidates (the shelf the ten files were moved FROM, byte-for-byte)
run:     npx tsx scripts/attest-r005a-reg35.ts           # exit 0 · RESULT: REGISTERED-MATCH
note:    the transcript also EXECUTES scripts/prove-candidate.ts in ladder mode over the registered bytes ([2/6]),
         so the CUT line and the LADDER RESULT in that section are that instrument's own stdout, not a quote from here.

attest-r005a-reg35 — Act II batches 2 + 3 registration (L26–L35) + the moved §7.3 tail law
levels dir: /Users/Admin/VibeCoding/GameCpt/.worktrees/r-005a-reg35/src/levels/
origin:     L26–L35 36ffe0b:src/levels/candidates (the shelf the bytes were moved from)

[1/6] byte identity — the registered root files are byte-copies, not edits
  MATCH  l026.json blob identity — root 00127e956081bdd33b91943cd75a7638c398fd95 == 36ffe0b:src/levels/candidates 00127e956081bdd33b91943cd75a7638c398fd95 (sha256 0166f697ed69…)
  MATCH  l027.json blob identity — root 0aacf6ae35372b92f68b701fcd240e3fc07c3e4a == 36ffe0b:src/levels/candidates 0aacf6ae35372b92f68b701fcd240e3fc07c3e4a (sha256 13c29e99e385…)
  MATCH  l028.json blob identity — root 96d26e80c5a1038746dce58cba8f5809f54b203e == 36ffe0b:src/levels/candidates 96d26e80c5a1038746dce58cba8f5809f54b203e (sha256 f82ec936a908…)
  MATCH  l029.json blob identity — root f91a0ffb12ea9387a0700e3c10ddd8755779adb4 == 36ffe0b:src/levels/candidates f91a0ffb12ea9387a0700e3c10ddd8755779adb4 (sha256 1fb03d097b1e…)
  MATCH  l030.json blob identity — root b003f01f24eaf1b905c7d5964739a9b279989301 == 36ffe0b:src/levels/candidates b003f01f24eaf1b905c7d5964739a9b279989301 (sha256 896bdd24debd…)
  MATCH  l031.json blob identity — root 02ed0599accde4d0ba4e7d8ea941a4b16e3b372e == 36ffe0b:src/levels/candidates 02ed0599accde4d0ba4e7d8ea941a4b16e3b372e (sha256 1b30c185df58…)
  MATCH  l032.json blob identity — root c9878551ff77d0c1e2248c0fb281de62ef26129e == 36ffe0b:src/levels/candidates c9878551ff77d0c1e2248c0fb281de62ef26129e (sha256 00fedd90028f…)
  MATCH  l033.json blob identity — root a722f1c5b99f2b4b7580bff56c4b252fe1ec06be == 36ffe0b:src/levels/candidates a722f1c5b99f2b4b7580bff56c4b252fe1ec06be (sha256 77d6f7fa5bd2…)
  MATCH  l034.json blob identity — root fb3671db70c5d4f0408ac6cecdbf4dfdf8e20915 == 36ffe0b:src/levels/candidates fb3671db70c5d4f0408ac6cecdbf4dfdf8e20915 (sha256 e8289968cd5c…)
  MATCH  l035.json blob identity — root 0d562c7cd1805d85415fd618f8b03935ca87be98 == 36ffe0b:src/levels/candidates 0d562c7cd1805d85415fd618f8b03935ca87be98 (sha256 eb798ca4999c…)
  MATCH  the shelf is EMPTY of level files (R-005a MOVED the ten rungs; a copy would have left them) — src/levels/candidates holds 0 level file(s) (README only)

[2/6] the registered rows — re-measured from the ROOT bytes, never read from a note
  l026.json (rung 26)
  MATCH  l026.json par — solver 17 · file 17 · registered 17
  MATCH  l026.json D_exec — measured 21.560241 · registered 21.560241
  MATCH  l026.json B — measured 1.5201 · registered 1.5201
  MATCH  l026.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B (§5.2's theorem, re-quoted at the root)
  MATCH  l026.json grid + coverage — 7 × 6 · distinctPositions=42 of 42 · registered 7 × 6 / 42
  MATCH  l026.json all-OFF world is UNSATISFIABLE (measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 15/498 states
  MATCH  l026.json audit violations empty — 0 violation(s) · per-rung gate families reported by the audit: 0
  l027.json (rung 27)
  MATCH  l027.json par — solver 18 · file 18 · registered 18
  MATCH  l027.json D_exec — measured 22.560241 · registered 22.560241
  MATCH  l027.json B — measured 1.5201 · registered 1.5201
  MATCH  l027.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B (§5.2's theorem, re-quoted at the root)
  MATCH  l027.json grid + coverage — 7 × 6 · distinctPositions=42 of 42 · registered 7 × 6 / 42
  MATCH  l027.json all-OFF world is UNSATISFIABLE (measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 15/498 states
  MATCH  l027.json audit violations empty — 0 violation(s) · per-rung gate families reported by the audit: 0
  l028.json (rung 28)
  MATCH  l028.json par — solver 20 · file 20 · registered 20
  MATCH  l028.json D_exec — measured 24.548193 · registered 24.548193
  MATCH  l028.json B — measured 1.5161 · registered 1.5161
  MATCH  l028.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B (§5.2's theorem, re-quoted at the root)
  MATCH  l028.json grid + coverage — 7 × 6 · distinctPositions=42 of 42 · registered 7 × 6 / 42
  MATCH  l028.json all-OFF world is UNSATISFIABLE (measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 15/498 states
  MATCH  l028.json audit violations empty — 0 violation(s) · per-rung gate families reported by the audit: 0
  l029.json (rung 29)
  MATCH  l029.json par — solver 21 · file 21 · registered 21
  MATCH  l029.json D_exec — measured 25.548193 · registered 25.548193
  MATCH  l029.json B — measured 1.5161 · registered 1.5161
  MATCH  l029.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B (§5.2's theorem, re-quoted at the root)
  MATCH  l029.json grid + coverage — 7 × 6 · distinctPositions=42 of 42 · registered 7 × 6 / 42
  MATCH  l029.json all-OFF world is UNSATISFIABLE (measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 15/498 states
  MATCH  l029.json audit violations empty — 0 violation(s) · per-rung gate families reported by the audit: 0
  l030.json (rung 30)
  MATCH  l030.json par — solver 23 · file 23 · registered 23
  MATCH  l030.json D_exec — measured 27.566265 · registered 27.566265
  MATCH  l030.json B — measured 1.5221 · registered 1.5221
  MATCH  l030.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B (§5.2's theorem, re-quoted at the root)
  MATCH  l030.json grid + coverage — 7 × 6 · distinctPositions=42 of 42 · registered 7 × 6 / 42
  MATCH  l030.json all-OFF world is UNSATISFIABLE (measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 15/498 states
  MATCH  l030.json audit violations empty — 0 violation(s) · per-rung gate families reported by the audit: 0
  l031.json (rung 31)
  MATCH  l031.json par — solver 19 · file 19 · registered 19
  MATCH  l031.json D_exec — measured 23.204167 · registered 23.204167
  MATCH  l031.json B — measured 1.4014 · registered 1.4014
  MATCH  l031.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B (§5.2's theorem, re-quoted at the root)
  MATCH  l031.json grid + coverage — 7 × 6 · distinctPositions=42 of 42 · registered 7 × 6 / 42
  MATCH  l031.json all-OFF world is UNSATISFIABLE (measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 9/720 states
  MATCH  l031.json audit violations empty — 0 violation(s) · per-rung gate families reported by the audit: 0
  l032.json (rung 32)
  MATCH  l032.json par — solver 22 · file 22 · registered 22
  MATCH  l032.json D_exec — measured 26.050000 · registered 26.050000
  MATCH  l032.json B — measured 1.3500 · registered 1.3500
  MATCH  l032.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B (§5.2's theorem, re-quoted at the root)
  MATCH  l032.json grid + coverage — 7 × 6 · distinctPositions=42 of 42 · registered 7 × 6 / 42
  MATCH  l032.json all-OFF world is UNSATISFIABLE (measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 9/740 states
  MATCH  l032.json audit violations empty — 0 violation(s) · per-rung gate families reported by the audit: 0
  l033.json (rung 33)
  MATCH  l033.json par — solver 22 · file 22 · registered 22
  MATCH  l033.json D_exec — measured 26.069191 · registered 26.069191
  MATCH  l033.json B — measured 1.3564 · registered 1.3564
  MATCH  l033.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B (§5.2's theorem, re-quoted at the root)
  MATCH  l033.json grid + coverage — 7 × 6 · distinctPositions=42 of 42 · registered 7 × 6 / 42
  MATCH  l033.json all-OFF world is UNSATISFIABLE (measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 9/766 states
  MATCH  l033.json audit violations empty — 0 violation(s) · per-rung gate families reported by the audit: 0
  l034.json (rung 34)
  MATCH  l034.json par — solver 24 · file 24 · registered 24
  MATCH  l034.json D_exec — measured 28.126943 · registered 28.126943
  MATCH  l034.json B — measured 1.3756 · registered 1.3756
  MATCH  l034.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B (§5.2's theorem, re-quoted at the root)
  MATCH  l034.json grid + coverage — 7 × 6 · distinctPositions=42 of 42 · registered 7 × 6 / 42
  MATCH  l034.json all-OFF world is UNSATISFIABLE (measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 9/772 states
  MATCH  l034.json audit violations empty — 0 violation(s) · per-rung gate families reported by the audit: 0
  l035.json (rung 35)
  MATCH  l035.json par — solver 24 · file 24 · registered 24
  MATCH  l035.json D_exec — measured 28.339426 · registered 28.339426
  MATCH  l035.json B — measured 1.4465 · registered 1.4465
  MATCH  l035.json T ≡ R ≡ 0 — T=0 R=0.000000 ⇒ D_exec = par + 3·B (§5.2's theorem, re-quoted at the root)
  MATCH  l035.json grid + coverage — 7 × 6 · distinctPositions=42 of 42 · registered 7 × 6 / 42
  MATCH  l035.json all-OFF world is UNSATISFIABLE (measured) — allOffShortest=null · allOffGoalReachable=false · subgraph 9/766 states
  MATCH  l035.json audit violations empty — 0 violation(s) · per-rung gate families reported by the audit: 0
  MATCH  the registered-bytes audit carries no per-rung gate family for L26–L35 yet (booked gap, NOT a silent pass) — audit gate counts across the ten rungs: [0] — the proof of these rungs in this artifact is the family-gate run below; a future `act-2-batch-2/3` lesson row must also extend this instrument (the event that reddens this row)
  MATCH  the ten rows reproduce their registered table (all of it, rung by rung) — 10/10 rungs re-measured against ACT_II_B2_B3_LADDER

  family-gate proof at the ROOT (scripts/prove-candidate.ts --family=g --ladder=26…35 --dir=src/levels):
    prove-candidate — CUT re-measured from the shipped set: D_exec max = 14.969697 · par(L15) = 10 · 35 shipped files · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    per-rung: 13/13 13/13 13/13 13/13 13/13 13/13 13/13 13/13 13/13 13/13 · rung verdicts PASS PASS PASS PASS PASS PASS PASS PASS PASS PASS
    LADDER RESULT: 10/10 rung(s) ACCEPT, controls named 130/130 across the 10 rung(s)
  MATCH  the ten rungs prove at the ROOT under their own family gates, controls named per rung — exit 0 · 10 rung(s) reporting controls · 10/10 at 13/13 · LADDER PASS 10/10 · controls named 130/130
  MATCH  the freezer holds at 35 shipped files (the cut is still the L1–L15 basis) — CUT D_exec max = 14.969697 · par(L15) = 10 · 35 shipped files · basis ids [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] — the L16–L20 block and all fifteen registered Act II rungs are excluded from the cut's own filter
  MATCH  the section can fail (both halves probed live) — the reader distinguishes the live basis from a relabeled one ([16, 17, 18, 19, 20]); and a ladder pointed at the now-EMPTY shelf exits 1 (≠ 0) — so neither the reader nor the prover's exit code is an assumption

[3/6] §7.3 act-scale tail law — the act peaks and the ten new rows, measured on the root bytes
  measured: Act I peak 24.729412 (L20) · Act II peak 28.339426 (L35, read over ids 21–35) · batch-1 record 27.604651 (L25) · act-open L21 21.581395
  ten new rows read off the bytes: L26 17/21.560241/1.5201 · L27 18/22.560241/1.5201 · L28 20/24.548193/1.5161 · L29 21/25.548193/1.5161 · L30 23/27.566265/1.5221 · L31 19/23.204167/1.4014 · L32 22/26.050000/1.3500 · L33 22/26.069191/1.3564 · L34 24/28.126943/1.3756 · L35 24/28.339426/1.4465
  MATCH  act-tail-act-i-peak-pin — §7.3 — Act I's registered peak, re-derived from the registered L1–L20 bytes (never read from a constant that the same edit moved)
           measured Act I max D_exec=24.729412 at L20; constant 24.729412 at L20. ANTI-TAUTOLOGY: a relabel that moves this constant to the Act II value (or counts an Act II board into Act I's basis) disagrees with the re-derived measurement and FAILs here — the number has to be re-measured, not restamped.
  MATCH  act-tail-act-ii-peak-pin — §7.5 item 2 — Act II batch 1's measured peak is the registered 27.604651 at L25, and its own gap to Act I is the registered 2.875239
           measured batch peak D_exec=27.604651 at L25; registered 27.604651 at L25; measured gap to Act I 2.875239 and registered gap 2.875239 vs pinned 2.875239. The batch's own record is immutable: a restamp of L25's bytes or of the constant moves this line and is refused. R-005a kept this clause on BATCH 1's ids on purpose — the act-level reading moved to act-tail-peak-advantage and act-tail-r005a-tail-pin, so the batch record and the act record can never be swapped for one another.
  MATCH  act-tail-peak-advantage — §7.3 — Act II's measured act-level maximum strictly exceeds Act I's, and the registered gap is the measured gap (read over the whole registered act, ids 21–35: registered 28.339426 at L35 − Act I 24.729412 = 3.610014)
           measured: Act II 28.339426 − Act I 24.729412 = 3.610014; registered: 28.339426 − 24.729412 = 3.610014; pinned advantage 3.610014. The clause is an inequality (strictly exceeds) AND a derived equality, which is what keeps it from being satisfied by editing one of the two constants. R-004a read this over BATCH 1's ids because batch 1 was the whole act; after R-005a the act ends at L35, so a batch-1-only reading here would publish a stale act maximum (the very failure this clause exists to catch) — batch 1's own identity is pinned by the clause above.
  MATCH  act-tail-pre-r004a-standard — R-004a — the pre-registration standard is the registered tail as it stood before this ticket (24.729412, L20), and the batch peak strictly exceeds it
           pre-R004a standard 24.729412 (constant 24.729412) vs Act I's registered peak 24.729412 (they must stay the same number: the tail before this ticket *was* Act I's peak); batch peak 27.604651. This is the R-003d pattern ("BLOCK_L1619_PRE_R003D_TAIL_EXEC"): the standard is kept as its own datum so the re-registration above cannot silently self-confirm.
  MATCH  act-tail-l20-not-restamped — the L16–L20 block law is untouched: the terminal rung is still L20 at its registered par/D_exec, and no registered Act II id (21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35) is grafted onto BLOCK_L1619_IDS
           tail ids [16, 17, 18, 19, 20] vs BLOCK_L1619_IDS [16, 17, 18, 19, 20]; tail par 20 vs 20; tail D_exec 24.729412 vs 24.729412 and vs Act I's registered peak 24.729412; grafted act-II ids [] (checked against all 15 registered Act II ids, not only batch 1's five). §7.7 item 4 — "do not re-stamp L20": the registered tail ceiling is a statement about the *sealed landing's* rung, so the new rungs must prove under their own gates, and a law that moved the block's tail to rung 25 (or 35) would silently retire the gate L20 is judged by (the clone-guard lesson).
  MATCH  act-tail-l21-open-relief — §7.3 interior freedom — the act may open BELOW Act I's peak: “That is a plateau relaxation at a ΔM = 0 boundary, honestly labelled — it is never presented as a dip” (the act-open member carries the registered relief, inside the act band; the DIRECTION is not part of the law)
           L21 D_exec=21.581395; registered relief 21.581395 (constant 21.581395); relief vs Act I's peak 24.729412 = -3.148017 (MEASURED, not required — the status binds the named rung's registered value and the band, nothing else); act band [19.75, 29.06] ⇒ in band = true. The relief is a ΔM = 0 boundary (the batch introduces no mechanic; M is 4 on every rung), which is what distinguishes it from §6's dip. REFUSED HERE: a reader that demands a cross-act monotone rise (L21 > L20) — that is the mirror-image tautology, and this clause is satisfied by the registered relief *and* by any in-band value in either direction, while an out-of-band member (or a value on the wrong rung) still FAILs by name.
  MATCH  act-tail-r005a-registered-rows — R-005a — the ten newly registered rungs reproduce their REGISTERED row tables (batches 2 + 3: par / D_exec / B / grid / coverage), so no registered rung can be re-stamped silently
           rows read off the root bytes vs ACT_II_B2_B3_LADDER: L26 17/21.560241/1.5201 (registered 17/21.560241/1.5201) · L27 18/22.560241/1.5201 (registered 18/22.560241/1.5201) · L28 20/24.548193/1.5161 (registered 20/24.548193/1.5161) · L29 21/25.548193/1.5161 (registered 21/25.548193/1.5161) · L30 23/27.566265/1.5221 (registered 23/27.566265/1.5221) · L31 19/23.204167/1.4014 (registered 19/23.204167/1.4014) · L32 22/26.050000/1.3500 (registered 22/26.050000/1.3500) · L33 22/26.069191/1.3564 (registered 22/26.069191/1.3564) · L34 24/28.126943/1.3756 (registered 24/28.126943/1.3756) · L35 24/28.339426/1.4465 (registered 24/28.339426/1.4465). ANTI-TAUTOLOGY: a restamp of any single rung moves that rung's measured D_exec away from its registered row and fails here, by name [none]; the table itself is injectable so the reading cannot be confirmed by the same constant it is compared with. The act's MAXIMUM is pinned separately (act-tail-r005a-tail-pin) — this clause is why the ten rungs below the tail are covered at all, which a max-only reading never could.
  MATCH  act-tail-r005a-tail-pin — R-005a — Act II's registered tail after this ticket is the re-derived maximum over the whole registered act (L21–L35): 28.339426 at L35
           measured act max D_exec=28.339426 at L35 (in band = true); registered 28.339426 at L35. ANTI-TAUTOLOGY: the constant cannot be moved alone — it is compared with a re-derived measurement over ACT_II_REGISTERED_IDS [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35], so a relabel onto another rung (or a basis that drops a registered rung) disagrees and FAILs. §7.9's band is the derived-exact [19.75, 29.0625] (printed [19.75, 29.06]); the operator reads the derived value.
  MATCH  act-tail-r005a-pre-standard — R-005a — the pre-registration standard is the registered tail as it stood before this ticket (27.604651 at L25, batch 1's record), and the post tail strictly exceeds it by the measured 0.734775
           pre-R005a standard 27.604651 (constant 27.604651) vs batch 1's registered record 27.604651 at L25 (they must stay the same number: the tail before this ticket *was* batch 1's peak); measured post tail 28.339426; derived rise 0.734775 vs pinned 0.734775. This is the R-003d pattern a second time ("BLOCK_L1619_PRE_R003D_TAIL_EXEC" → "ACT_II_B1_PRE_R004A_REGISTERED_TAIL_EXEC" → here): the standard is kept as its own datum, so a re-registration that restamps the standard it is judged against leaves the rise identity unsatisfied and FAILs loudly.
  MATCH  act-tail-r005a-exec-headroom — R-005a / §7.9 — the act's registered tail keeps DERIVED-EXACT headroom to the act's D_exec ceiling: 29.0625 − 28.339426 = 0.723074 (no rounded operand survives)
           ceiling read 29.0625 (the derived-exact ACT_II_EXEC_BAND[1] = 24 + 3·1.6875 = 29.0625; printed 29.06 is display text, never an operand); measured tail 28.339426; derived headroom 0.723074 vs pinned 0.723074. ANTI-TAUTOLOGY, both single-edit directions: narrow the band and the derived headroom falls below the pin; restamp the tail upward and it falls the other way — either edit FAILs here without touching the other constant. §7.8 item 2's remaining headroom is the act's own, and the last 0.0025 of it is exactly the sliver §7.9's derived-exact law exists to keep buildable.
  MATCH  act-tail-r005a-seam-reliefs — R-005a / §7.3.1 — the two PRE-PUBLISHED seam reliefs are registered as published: instance 2 `batch-seam` L25→L26 ΔD_exec=-6.044410 · instance 3 `batch-seam` L30→L31 ΔD_exec=-4.362098 (band DERIVED-EXACT [19.75, 29.0625], printed [19.75, 29.06]; direction NOT part of the clause)
           instance 2 L25→L26: measured 27.604651→21.560241 · registered 27.604651→21.560241 · derived Δ -6.044410 vs published -6.044410 · ok=true | instance 3 L30→L31: measured 27.566265→23.204167 · registered 27.566265→23.204167 · derived Δ -4.362098 vs published -4.362098 · ok=true. Both sides must sit inside the act band (derived-exact) and the derived Δ must equal the published ΔD_exec. THE DIRECTION IS NOT PART OF THE STATUS, deliberately and in both directions: a validator that demanded CROSS-BATCH MONOTONY would have refused both registered seams (L25→L26 −6.044410, L30→L31 −4.362098 — the registered sawtooth), and a law that demanded a DROP would refuse an in-band rise at a seam. What binds is the registered value, the derived delta and the band; that a relief exists at all is §7.3 interior freedom, and its label is the only thing that makes it registrable (§7.3.1). Labels, verbatim, as registered: "RELIEF LABEL — `batch-seam` seam L25→L26 · `ΔD_exec = −6.044410` · band `[19.75, 29.06]`. Interi…" / "RELIEF LABEL — `batch-seam` seam L30→L31 · `ΔD_exec = −4.362098` · band `[19.75, 29.0625]` (prin…" — the band inside each label is the PRINTED form the §7.3.1 text published, while this clause's comparison reads the derived-exact constant (§7.9).
  MATCH  §7.3 — every reported tail clause holds on the registered bytes — 11/11 clauses PASS
  MATCH  the clause split partitions the reported set, and this instrument owns R-005a's five — reported 11 = R-004a 6 (controlled by scripts/attest-r004a-act2.ts) + R-005a 5 [act-tail-r005a-registered-rows, act-tail-r005a-tail-pin, act-tail-r005a-pre-standard, act-tail-r005a-exec-headroom, act-tail-r005a-seam-reliefs] (controlled here)

[4/6] anti-tautology controls — one per R-005a clause, refused BY NAME
  CAUGHT  act-tail-r005a-registered-rows
          mutation: RESTAMP (table side): the law's own row for L28 is moved to D_exec 30 while the bytes stay registered — the table is injectable, so the reading cannot be confirmed by the constant it is compared with
          coupling: named: only the row clause reads the table's D_exec, so nothing else can carry the refusal
          measured: FAIL clauses [act-tail-r005a-registered-rows]
  CAUGHT  act-tail-r005a-registered-rows
          mutation: RESTAMP (measurement side): the L33 row read off the bytes is moved to D_exec 30 — the registered row set names the restamped rung
          coupling: named: the clause reports the restamped rung by name ([L33]), which is the 'never re-stamp a registered rung' duty per row
          measured: FAIL clauses [act-tail-r005a-registered-rows]
  CAUGHT  act-tail-r005a-tail-pin
          mutation: RELABEL: the act's registered tail is moved onto L34 while keeping L35's value — the constant and the rung it belongs to disagree
          coupling: named: the tail value is unchanged, so the neighbouring clauses stay green and the refusal is this clause's own
          measured: FAIL clauses [act-tail-r005a-tail-pin]
  CAUGHT  act-tail-r005a-pre-standard
          mutation: RESTAMPED STANDARD: the pre-R005a standard is overwritten with the post-registration tail (28.339426) — the re-registration would confirm itself
          coupling: named: the standard must still be the tail as it stood before this ticket (27.604651 at L25), so this is the R-003d shape a second time
          measured: FAIL clauses [act-tail-r005a-pre-standard]
  CAUGHT  act-tail-r005a-exec-headroom
          mutation: NARROWED CEILING: the D_exec ceiling is taken as the band FLOOR (19.75) — a silently narrowed band has to move the derived headroom
          coupling: named: the ceiling operand is not the derived-exact band end, so the clause refuses twice over (narrowed operand, negative headroom)
          measured: FAIL clauses [act-tail-r005a-exec-headroom]
  CAUGHT  act-tail-r005a-seam-reliefs
          mutation: RESTAMPED SEAM: the L30→L31 relief is re-measured as 24.000000 — the derived Δ no longer equals the published ΔD_exec
          coupling: named: the seam clause is the only reader of the two §7.3.1 instances
          measured: FAIL clauses [act-tail-r005a-seam-reliefs]
  MATCH  every R-005a clause has at least one control, all caught, and no R-004a clause is claimed here — 6/6 caught · R-005a clauses covered 5/5 (R-004a's six are controlled in scripts/attest-r004a-act2.ts — the split is asserted there as a partition)
  MATCH  discrimination: the registered reading PASSes all eleven clauses while every control FAILs one — 11/11 clauses PASS on the registered bytes · 6/6 controls refused by name

[5/6] the §7.3.1 seams — both directions probed, and every adjacent drop accounted for
  registered adjacent steps inside the act: L21→L22 +1.002605 · L22→L23 +2.036000 · L23→L24 +0.984651 · L24→L25 +2.000000 · L25→L26 -6.044410 · L26→L27 +1.000000 · L27→L28 +1.987952 · L28→L29 +1.000000 · L29→L30 +2.018072 · L30→L31 -4.362098 · L31→L32 +2.845833 · L32→L33 +0.019191 · L33→L34 +2.057752 · L34→L35 +0.212483
  MATCH  §7.3.1 — the sawtooth is the registered reading, and the clause PASSes it (a monotony validator would have refused two registered rungs) — drops 2 (both named [25→26, 30→31]) · rises 12 (none labelled, none owed: §7.3 interior freedom) · clause act-tail-r005a-seam-reliefs on the registered reading = PASS
  MATCH  §7.3.1 — no UNNAMED relief hides in the bytes (every adjacent drop is a named instance) — drops: L25→L26 -6.044410 · L30→L31 -4.362098 · the law's instances: L25→L26 -6.044410 · L30→L31 -4.362098 — the seam clause judges only the pairs the law names, so this measurement is what closes the 'unnamed relief' hole
  MATCH  the unnamed-relief reader can fail (a fabricated third drop is named as unnamed) — fabricated drops at unnamed pairs: [L32→L33 -6.050000] (required exactly L32→L33)
  MATCH  §7.3.1 / §7.9 — an out-of-band seam FAILs (interior freedom is freedom INSIDE the band) — registered reading PASS; L26 moved to 30.5625 (derived-exact band top 29.0625) with a self-consistent published Δ ⇒ seam clause FAIL
  MATCH  a measurement that omits a registered rung FAILs the seam clause (the instance is required, not optional) — reading built from the 34 shipped files without L31: clause FAIL — instance 2 L25→L26: measured 27.604651→21.560241 · registered 27.604651→21.560241 · derived Δ -6.044410 vs published -6.044410 · ok=true | instance 3 …
  NOTE     the seam status binds the published Δ by equality and the derived Δ by arithmetic — no sign test exists in either direction;
           a rise seam published with a positive Δ would satisfy the same terms. Not probed live (that would mean re-implementing the clause here);
           the two registered instances are drops and [6/6] reads their labels verbatim, which is what §7.3.1 makes registrable.

[6/6] the §7.3.1 labels and the moved constants — derived from the registered bytes, quoted verbatim
  MATCH  §7.3.1 instance 2 — derived ΔD_exec = −6.044410 (L25 27.604651 → L26 21.560241) equals the published Δ, and the label quotes it — derived -6.044410 · published -6.044410 · measured L25 27.604651 → L26 21.560241
  MATCH  §7.3.1 instance 3 — derived ΔD_exec = −4.362098 (L30 27.566265 → L31 23.204167) equals the published Δ, and the label quotes it — derived -4.362098 · published -4.362098 · measured L30 27.566265 → L31 23.204167
  MATCH  §7.9 — the labels carry the band in the form each was published in (printed in instance 2; derived-exact + printed in parentheses in instance 3) — instance 2 quotes `[19.75, 29.06]` (and not the derived-exact `[19.75, 29.0625]`); instance 3 quotes `[19.75, 29.0625]` with the printed form in parentheses. The clause's comparison operand is the derived-exact constant; printed forms are display text.
  MATCH  §7.3.1 — both labels carry their attribution and refuse to claim an ease the instrument cannot see — instance 2: "d verbatim for R-005a at the law file's request; the band is the printed form GD-010 published.)" · instance 3: "D-011 RULING C, blessed verbatim for R-005a/registration with the notation-only band amendment.)"
  MATCH  §7.9 — the tail's headroom is DERIVED-EXACT: 29.0625 − 28.339426 = 0.723074, and the printed operand would not reproduce it — derived 0.723074 = pinned 0.723074; the printed operand (29.06) would give 0.720574 — a 0.002500 difference, i.e. the sliver §7.9 keeps buildable
  MATCH  the moved tail: pre-R005a standard 27.604651 (L25) → post tail 28.339426 (L35), rise 0.734775; across acts 28.339426 − 24.729412 = 3.610014 — standard 27.604651 at L25 · tail 28.339426 at L35 · rise 0.734775 · advantage vs Act I 3.610014 (three derived identities, none typed twice)
  MATCH  the five R-004a-era rungs are un-restamped (their registered rows still reproduce on the bytes) — 5 rows re-measured · mismatches [] · pars 17 / 18 / 20 / 21 / 23

RESULT: REGISTERED-MATCH — the ten R-005a rungs are byte-identical to the shelf they were moved from (36ffe0b:src/levels/candidates),
every registered row (par / D_exec / B / grid / coverage) is reproduced by the program solver on the ROOT bytes,
the ten rungs prove at the root under their own family gates (13/13 named controls per rung, 10 rungs),
the act's registered tail moved with a re-derived identity (27.604651 → 28.339426, +0.734775) and 0.723074 of DERIVED-EXACT headroom,
all 11 §7.3 tail clauses PASS (this instrument controls R-005a's 5 of them, by name), and both §7.3.1 seam labels are cited verbatim with their published ΔD_exec.

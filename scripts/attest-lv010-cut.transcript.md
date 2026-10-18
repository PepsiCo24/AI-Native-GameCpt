LV-010 STEP 0 — the CUT re-attestation transcript
task:    LV-010 (author + prove the next ladder segment L16–L20 as UNREGISTERED candidates)
law:     docs/level-design.md §3.3/§3.4/§6.1.1 (the cut + the L16 par-admissibility bounds, published
         before any L16 candidate exists) · docs/level-difficulty.md §2/§2b/§3.5/§5.2 (the execution axis,
         the measured weights and the 6-dp per-level rows) · ADR-design-0003 §5/§6.1.3 (G1–G3, binding on
         every L12+ combo level) · ADR-0009 (the closed mechanic vocabulary) · ADR-0004 (reject, never repair)
source:  src/levels/l001.json … l015.json at 6cd0693 (the 15-level dataset as it ships)
scratch: /var/folders/8q/vcsvjc5x679d629rzrj8d57w0000gp/T/opencode/lv010-cut/levels
         (outside the repository: the set is judged as an ISOLATED dataset, and every solver read below
          uses that directory — never the repo path)

Why this attester attests the CUT and not a board: LV-009-B's STEP 0 could re-derive an ADR's constants
from candidates a design dossier had already produced. An AUTHORING ticket has no boards yet, so what is
attested here is (1) the escalation floor `D_exec(L16) > D_exec(L15) = 14.969697` and the par-admissibility
bounds §6.1.1 publishes for the L16 author, and (2) the analyzer tooling every candidate gate will be read
from — proved live on the isolated set BEFORE it is pointed at a new board.

Zero hand-typed numbers: every MEASUREMENT below comes from the program solver running on the byte-copies;
every PUBLISHED value is typed once in the harness's LAW table with its citation and is asked to still
hold; `DIFFICULTY_WEIGHTS`, `BLOCK_L1215_*` and `PORTAL_DEBUT_EXEC_BUDGET` are IMPORTED from
`@/core/solver/*`, never transcribed. A single divergence exits non-zero (STOP_AND_ROUTE).

refreshed:
  R-005a re-ran this attester on the 35-file dataset and refreshed the body below, because the chore this ticket
  carries moved two of its rows: the isolated-set `B` band is now read "modulo the ONE named F-L16-2 excursion
  (`L16` at 1.7000) — never widened, never smoothed" (the F-L16-2 waiver, probed in BOTH directions), and the
  per-file census grew 15 → 35 byte-copies (every registration since LV-010 appended to the root; those rounds
  left this body un-refreshed). The committed pre-R-005a body was the **LV-010-era capture and had gone FALSE**:
  it claimed `MATCH … measured [1.2500, 1.6875]`, while the instrument as shipped at base `dfd8f48` DIVERGED —
  `measured [1.2500, 1.7000] vs law [1.25, 1.6875]`, `RESULT: STOP_AND_ROUTE`, **exit 1** (re-measured at base,
  not remembered). No published number moved: the cut (14.969697), the two par-admissibility bounds and every
  analyzer constant are the same values, and the exit code moved **1 → 0** because a *lawful, named* excursion is
  no longer counted as a divergence — the waiver is a register with a name in it, not a widened band.

invocation:
  node_modules/.bin/tsx scripts/attest-lv010-cut.ts     # exit code 0
  node_modules/.bin/tsc --noEmit                        # 0 errors

output (verbatim):
LV-010 STEP 0 — the CUT re-attestation (authoring law for L16+)
node v24.20.0
source  : /Users/Admin/VibeCoding/GameCpt/.worktrees/r-005a-reg35/src/levels
scratch : /var/folders/8q/vcsvjc5x679d629rzrj8d57w0000gp/T/opencode/lv010-cut/levels  (OUTSIDE the repository — the set is judged alone)

byte-identity of the isolated byte-copies (source sha256 vs copy sha256):
  l001.json  17b7dda275d01a9e4ff566a9b06f65c95bb0789115acc8d01f06bad1b6920cf4  17b7dda275d01a9e4ff566a9b06f65c95bb0789115acc8d01f06bad1b6920cf4  IDENTICAL
  l002.json  33b0fc175f08928ae950fb15f8dc0d1da11fdc37128baa4932232280ffae6a5a  33b0fc175f08928ae950fb15f8dc0d1da11fdc37128baa4932232280ffae6a5a  IDENTICAL
  l003.json  c4eb51ce7768867c0cf882e12cfa3403d5366da2bed83640c6c9139ed87edd7c  c4eb51ce7768867c0cf882e12cfa3403d5366da2bed83640c6c9139ed87edd7c  IDENTICAL
  l004.json  a8b5666118d5d7f12aac0fa7609825cdbbc2301da4ba42404a1ca3a079d2e4a5  a8b5666118d5d7f12aac0fa7609825cdbbc2301da4ba42404a1ca3a079d2e4a5  IDENTICAL
  l005.json  8a83657ad49015109016117d653954531fb6ea0e131b06074d4fca459deefe32  8a83657ad49015109016117d653954531fb6ea0e131b06074d4fca459deefe32  IDENTICAL
  l006.json  83b83728ae8ed02f913fe60a4b2f4e6508747745eb6bab17c2af0134e6b7227d  83b83728ae8ed02f913fe60a4b2f4e6508747745eb6bab17c2af0134e6b7227d  IDENTICAL
  l007.json  f1a750d922fa9447b4ea99a975e92310ae75599f8af4a8fd7b491fa8a940e397  f1a750d922fa9447b4ea99a975e92310ae75599f8af4a8fd7b491fa8a940e397  IDENTICAL
  l008.json  0b0d7bc96fbc39bbfa117d0cb2d675b8f8371f9d23fa4727f872a758a36680a3  0b0d7bc96fbc39bbfa117d0cb2d675b8f8371f9d23fa4727f872a758a36680a3  IDENTICAL
  l009.json  7e1c639f54d7ae95824926c5479d26fc601b42acd6a1057f50540b5382b082d4  7e1c639f54d7ae95824926c5479d26fc601b42acd6a1057f50540b5382b082d4  IDENTICAL
  l010.json  0cfdd19eeecf3f4c92f45c5f6e730c7a795b067e817d04a482f211d2e63cc9f1  0cfdd19eeecf3f4c92f45c5f6e730c7a795b067e817d04a482f211d2e63cc9f1  IDENTICAL
  l011.json  717a9743d44041e7b26c01d5bb9eba3d5e699fc290a23e085113e6a54db8f762  717a9743d44041e7b26c01d5bb9eba3d5e699fc290a23e085113e6a54db8f762  IDENTICAL
  l012.json  dcad44c3baa63054def0d25c3685fbe214653eaabc44d7dd399a111035df5db9  dcad44c3baa63054def0d25c3685fbe214653eaabc44d7dd399a111035df5db9  IDENTICAL
  l013.json  93a985f5c43e13e9eb4de6370a0c58eb29938209ad6c361284b23b05f2607b8a  93a985f5c43e13e9eb4de6370a0c58eb29938209ad6c361284b23b05f2607b8a  IDENTICAL
  l014.json  aa07203601a73c4ca7ab46e49684172840f0d6ce33b939c67cf31ca9e9b49781  aa07203601a73c4ca7ab46e49684172840f0d6ce33b939c67cf31ca9e9b49781  IDENTICAL
  l015.json  1ed3fae10d2131ad6846a96727d75d3571d075b811013d36d862fb1c822d04e3  1ed3fae10d2131ad6846a96727d75d3571d075b811013d36d862fb1c822d04e3  IDENTICAL
  l016.json  8caac76ae9be422c98d53cbf346b102e239fed5e5cba734759eb1d7dfd7d4ad1  8caac76ae9be422c98d53cbf346b102e239fed5e5cba734759eb1d7dfd7d4ad1  IDENTICAL
  l017.json  c162912430da902550176ff9f6edd11d5f7825767cf9aa364960376d659a37b6  c162912430da902550176ff9f6edd11d5f7825767cf9aa364960376d659a37b6  IDENTICAL
  l018.json  2537da2925dc37adb2b899c9f54bac925a06d366baad17bbccc76608611e2fed  2537da2925dc37adb2b899c9f54bac925a06d366baad17bbccc76608611e2fed  IDENTICAL
  l019.json  8691357c23de21005f65d0517fbae04c6505d444207d059473d2085d685f6d73  8691357c23de21005f65d0517fbae04c6505d444207d059473d2085d685f6d73  IDENTICAL
  l020.json  68bda4692cb0eb825e3039eec3a71a307a5f72b759cf4e69abc60689f14eb4b1  68bda4692cb0eb825e3039eec3a71a307a5f72b759cf4e69abc60689f14eb4b1  IDENTICAL
  l021.json  78df6c27733f336fc4b714e498fa976692c658a6988c8398d21a94474ce8d968  78df6c27733f336fc4b714e498fa976692c658a6988c8398d21a94474ce8d968  IDENTICAL
  l022.json  de0b579bec18ddd401fb112f25717d7fd136a67d40f1ecb816fae35675c9f67f  de0b579bec18ddd401fb112f25717d7fd136a67d40f1ecb816fae35675c9f67f  IDENTICAL
  l023.json  f435f8f55aec16115b08b62b12964767f41e3dc37eaf90abb39ba65de25233c3  f435f8f55aec16115b08b62b12964767f41e3dc37eaf90abb39ba65de25233c3  IDENTICAL
  l024.json  524aadbcb429846b8a972fbb5a8ab973174e08b902c942b5038a36a7d8cbaca3  524aadbcb429846b8a972fbb5a8ab973174e08b902c942b5038a36a7d8cbaca3  IDENTICAL
  l025.json  afd6bc0e0d2e32fcb692d96f65422cbabfcd78b384d62a4b9d626492cf0d46e9  afd6bc0e0d2e32fcb692d96f65422cbabfcd78b384d62a4b9d626492cf0d46e9  IDENTICAL
  l026.json  0166f697ed691f8cdb5b7dcca298a38af6879b781d741cd8cebb41e218f56653  0166f697ed691f8cdb5b7dcca298a38af6879b781d741cd8cebb41e218f56653  IDENTICAL
  l027.json  13c29e99e385103a595a788385db07b3f5f5ad4c7a238cc7a1fbf4d2c995afe6  13c29e99e385103a595a788385db07b3f5f5ad4c7a238cc7a1fbf4d2c995afe6  IDENTICAL
  l028.json  f82ec936a90875bdd3469daf46e5fef6f06840a26f8f7c8fc784f37a366df35a  f82ec936a90875bdd3469daf46e5fef6f06840a26f8f7c8fc784f37a366df35a  IDENTICAL
  l029.json  1fb03d097b1eccf2db3735fb5eafce423616f52c0f262d964dfcb40b9b3d6bae  1fb03d097b1eccf2db3735fb5eafce423616f52c0f262d964dfcb40b9b3d6bae  IDENTICAL
  l030.json  896bdd24debd103b2cdd4553f38ed7027edd245365df5f108276701dadc28481  896bdd24debd103b2cdd4553f38ed7027edd245365df5f108276701dadc28481  IDENTICAL
  l031.json  1b30c185df58aac5e4e265c228327bb10e0f703fd332b3c883816e32fea4e190  1b30c185df58aac5e4e265c228327bb10e0f703fd332b3c883816e32fea4e190  IDENTICAL
  l032.json  00fedd90028f769d1955b02661baaeca473e0fb1bd1b96744c06268e426007fb  00fedd90028f769d1955b02661baaeca473e0fb1bd1b96744c06268e426007fb  IDENTICAL
  l033.json  77d6f7fa5bd23c9a31ae9a556b76bdafe7f162ae5d471bc22152c56987dd50e6  77d6f7fa5bd23c9a31ae9a556b76bdafe7f162ae5d471bc22152c56987dd50e6  IDENTICAL
  l034.json  e8289968cd5c1992ddc4692172154b2967e78ded1116b3c23244bae7582de72b  e8289968cd5c1992ddc4692172154b2967e78ded1116b3c23244bae7582de72b  IDENTICAL
  l035.json  eb798ca4999c8d2b5502778682f152dd9869931b813863428993dc7e9e4eeae6  eb798ca4999c8d2b5502778682f152dd9869931b813863428993dc7e9e4eeae6  IDENTICAL
  35 file(s) copied; every solver read below uses this directory.

l001.json  id=1  board=5x3  par=4 shortest=4
  D_exec=9.000000 (D=14.000000 L=4 B=1.666667 T=0 R=0 M=1)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=15/15 dualPhaseTiles=0 refusedBeforeEntered=0
  latch: allOffGoalReachable=null allOffShortest=4 allOffShortest-par=0
  validator=ok policyViolations=0 blockGates=7 allPass=false

l002.json  id=2  board=4x4  par=5 shortest=5
  D_exec=10.062500 (D=15.062500 L=5 B=1.687500 T=0 R=0 M=1)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=16/16 dualPhaseTiles=0 refusedBeforeEntered=0
  latch: allOffGoalReachable=null allOffShortest=5 allOffShortest-par=0
  validator=ok policyViolations=0 blockGates=7 allPass=false

l003.json  id=3  board=5x3  par=6 shortest=6
  D_exec=10.285714 (D=15.285714 L=6 B=1.428571 T=0 R=0 M=1)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=14/15 dualPhaseTiles=0 refusedBeforeEntered=0
  latch: allOffGoalReachable=null allOffShortest=6 allOffShortest-par=0
  validator=ok policyViolations=0 blockGates=7 allPass=false

l004.json  id=4  board=5x4  par=6 shortest=6
  D_exec=10.578947 (D=15.578947 L=6 B=1.526316 T=0 R=0 M=1)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=19/20 dualPhaseTiles=0 refusedBeforeEntered=0
  latch: allOffGoalReachable=null allOffShortest=6 allOffShortest-par=0
  validator=ok policyViolations=0 blockGates=7 allPass=false

l005.json  id=5  board=5x4  par=6 shortest=6
  D_exec=10.333333 (D=15.333333 L=6 B=1.444444 T=0 R=0 M=1)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=18/20 dualPhaseTiles=0 refusedBeforeEntered=0
  latch: allOffGoalReachable=null allOffShortest=6 allOffShortest-par=0
  validator=ok policyViolations=0 blockGates=7 allPass=false

l006.json  id=6  board=5x3  par=4 shortest=4
  D_exec=8.862069 (D=23.862069 L=4 B=1.620690 T=0 R=0 M=3)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=15/15 dualPhaseTiles=0 refusedBeforeEntered=1
  latch: allOffGoalReachable=true allOffShortest=6 allOffShortest-par=2
  validator=ok policyViolations=0 blockGates=7 allPass=false

l007.json  id=7  board=3x3  par=4 shortest=4
  D_exec=7.750000 (D=22.750000 L=4 B=1.250000 T=0 R=0 M=3)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=7/9 dualPhaseTiles=0 refusedBeforeEntered=1
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l008.json  id=8  board=5x4  par=6 shortest=6
  D_exec=10.500000 (D=25.500000 L=6 B=1.500000 T=0 R=0 M=3)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=18/20 dualPhaseTiles=0 refusedBeforeEntered=1
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l009.json  id=9  board=5x5  par=8 shortest=8
  D_exec=12.137931 (D=27.137931 L=8 B=1.379310 T=0 R=0 M=3)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=20/25 dualPhaseTiles=0 refusedBeforeEntered=2
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l010.json  id=10  board=6x4  par=9 shortest=9
  D_exec=13.642857 (D=28.642857 L=9 B=1.547619 T=0 R=0 M=3)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=22/24 dualPhaseTiles=0 refusedBeforeEntered=1
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l011.json  id=11  board=7x3  par=4 shortest=4
  D_exec=8.573171 (D=28.573171 L=4 B=1.524390 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=21/21 dualPhaseTiles=21 refusedBeforeEntered=1
  latch: allOffGoalReachable=true allOffShortest=7 allOffShortest-par=3
  validator=ok policyViolations=0 blockGates=7 allPass=false

l012.json  id=12  board=7x3  par=4 shortest=4
  D_exec=8.230769 (D=28.230769 L=4 B=1.410256 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=21/21 dualPhaseTiles=19 refusedBeforeEntered=3
  latch: allOffGoalReachable=true allOffShortest=6 allOffShortest-par=2
  validator=ok policyViolations=0 blockGates=8 allPass=true

l013.json  id=13  board=6x4  par=6 shortest=6
  D_exec=10.898734 (D=30.898734 L=6 B=1.632911 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=24/24 dualPhaseTiles=16 refusedBeforeEntered=5
  latch: allOffGoalReachable=true allOffShortest=8 allOffShortest-par=2
  validator=ok policyViolations=0 blockGates=7 allPass=true

l014.json  id=14  board=7x4  par=8 shortest=8
  D_exec=12.957895 (D=32.957895 L=8 B=1.652632 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=28/28 dualPhaseTiles=20 refusedBeforeEntered=5
  latch: allOffGoalReachable=true allOffShortest=10 allOffShortest-par=2
  validator=ok policyViolations=0 blockGates=7 allPass=true

l015.json  id=15  board=7x5  par=10 shortest=10
  D_exec=14.969697 (D=34.969697 L=10 B=1.656566 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=35/35 dualPhaseTiles=15 refusedBeforeEntered=6
  latch: allOffGoalReachable=true allOffShortest=12 allOffShortest-par=2
  validator=ok policyViolations=0 blockGates=8 allPass=true

l016.json  id=16  board=7x6  par=12 shortest=12
  D_exec=17.100000 (D=37.100000 L=12 B=1.700000 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=24 refusedBeforeEntered=8
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l017.json  id=17  board=7x6  par=14 shortest=14
  D_exec=19.027027 (D=39.027027 L=14 B=1.675676 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=24 refusedBeforeEntered=8
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l018.json  id=18  board=7x6  par=16 shortest=16
  D_exec=20.907923 (D=40.907923 L=16 B=1.635974 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=18 refusedBeforeEntered=9
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l019.json  id=19  board=7x6  par=18 shortest=18
  D_exec=22.885157 (D=42.885157 L=18 B=1.628386 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=18 refusedBeforeEntered=10
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l020.json  id=20  board=7x6  par=20 shortest=20
  D_exec=24.729412 (D=44.729412 L=20 B=1.576471 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=18 refusedBeforeEntered=14
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l021.json  id=21  board=7x6  par=17 shortest=17
  D_exec=21.581395 (D=41.581395 L=17 B=1.527132 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=12 refusedBeforeEntered=17
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l022.json  id=22  board=7x6  par=18 shortest=18
  D_exec=22.584000 (D=42.584000 L=18 B=1.528000 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=12 refusedBeforeEntered=17
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l023.json  id=23  board=7x6  par=20 shortest=20
  D_exec=24.620000 (D=44.620000 L=20 B=1.540000 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=12 refusedBeforeEntered=17
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l024.json  id=24  board=7x6  par=21 shortest=21
  D_exec=25.604651 (D=45.604651 L=21 B=1.534884 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=12 refusedBeforeEntered=17
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l025.json  id=25  board=7x6  par=23 shortest=23
  D_exec=27.604651 (D=47.604651 L=23 B=1.534884 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=12 refusedBeforeEntered=17
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l026.json  id=26  board=7x6  par=17 shortest=17
  D_exec=21.560241 (D=41.560241 L=17 B=1.520080 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=12 refusedBeforeEntered=19
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l027.json  id=27  board=7x6  par=18 shortest=18
  D_exec=22.560241 (D=42.560241 L=18 B=1.520080 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=12 refusedBeforeEntered=19
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l028.json  id=28  board=7x6  par=20 shortest=20
  D_exec=24.548193 (D=44.548193 L=20 B=1.516064 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=12 refusedBeforeEntered=19
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l029.json  id=29  board=7x6  par=21 shortest=21
  D_exec=25.548193 (D=45.548193 L=21 B=1.516064 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=12 refusedBeforeEntered=19
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l030.json  id=30  board=7x6  par=23 shortest=23
  D_exec=27.566265 (D=47.566265 L=23 B=1.522088 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=12 refusedBeforeEntered=19
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l031.json  id=31  board=7x6  par=19 shortest=19
  D_exec=23.204167 (D=43.204167 L=19 B=1.401389 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=6 refusedBeforeEntered=22
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l032.json  id=32  board=7x6  par=22 shortest=22
  D_exec=26.050000 (D=46.050000 L=22 B=1.350000 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=6 refusedBeforeEntered=22
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l033.json  id=33  board=7x6  par=22 shortest=22
  D_exec=26.069191 (D=46.069191 L=22 B=1.356397 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=6 refusedBeforeEntered=22
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l034.json  id=34  board=7x6  par=24 shortest=24
  D_exec=28.126943 (D=48.126943 L=24 B=1.375648 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=6 refusedBeforeEntered=22
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

l035.json  id=35  board=7x6  par=24 shortest=24
  D_exec=28.339426 (D=48.339426 L=24 B=1.446475 T=0 R=0 M=4)
  §4 region: deadStates=0 noUnrecoverableOk=true coverage=42/42 dualPhaseTiles=6 refusedBeforeEntered=22
  latch: allOffGoalReachable=false allOffShortest=null allOffShortest-par=n/a
  validator=ok policyViolations=0 blockGates=7 allPass=false

vocabulary: the frozen schema's own field set = [doors, goal, height, id, par, phaseAWalls, phaseBWalls, player, portals, startPhase, switches, width]
  unknown fields across 35 file(s): 0 (schema is a strictObject, so any new mechanic field is already a hard REJECT)

— analyzer tooling on the isolated set (the readers every candidate gate reuses) —
  prose discrepancy recorded: the LV-009-B commit message reads "9/7 gates"; the program's per-member inventory is 8/7/7/8 (7 shared + dip on the first + tail on the last).
  L12: 8/8 PASS — block-par-ramp:PASS block-coverage:PASS block-latch-par-grade:PASS block-portal-load:PASS dual-phase-tiles:PASS shortest-solution-presses-switch-and-crosses-door:PASS refused-then-entered:PASS block-dip-ceiling:PASS
  L13: 7/7 PASS — block-par-ramp:PASS block-coverage:PASS block-latch-par-grade:PASS block-portal-load:PASS dual-phase-tiles:PASS shortest-solution-presses-switch-and-crosses-door:PASS refused-then-entered:PASS
  L14: 7/7 PASS — block-par-ramp:PASS block-coverage:PASS block-latch-par-grade:PASS block-portal-load:PASS dual-phase-tiles:PASS shortest-solution-presses-switch-and-crosses-door:PASS refused-then-entered:PASS
  L15: 8/8 PASS — block-par-ramp:PASS block-coverage:PASS block-latch-par-grade:PASS block-portal-load:PASS dual-phase-tiles:PASS shortest-solution-presses-switch-and-crosses-door:PASS refused-then-entered:PASS block-tail-exec-budget:PASS
  ordered vs unordered refusal reader: identical on 4/4 of L12-L15

— the CUT and the admissibility of a par rung (§6.1.1 "Forward consequence, already forced") —
  floor = max D_exec over the prior set = 14.969697 (L15, re-derived above)
  measured B band ⇒ 3·B ∈ [3.7500, 5.1000], spread 1.3500
  par 9: min D_exec 12.750000 · max D_exec 14.100000 ⇒ INADMISSIBLE for every B in band
  par 10: min D_exec 13.750000 · max D_exec 15.100000 ⇒ admissible only if B > 1.656566
  par 11: min D_exec 14.750000 · max D_exec 16.100000 ⇒ admissible only if B > 1.323232
  par 12: min D_exec 15.750000 · max D_exec 17.100000 ⇒ admissible for ANY B in band
  published thresholds reproduced: par 10 needs B > 1.656566, par 11 needs B > 1.323232

— §4 acceptance region over the isolated set (the region a candidate must live in) —
  35/35 boards: deadStates 0 AND noUnrecoverableOk
  T ≡ 0 on 35/35 · R ≡ 0 on 35/35 (§5.2's theorem: inside §4, D_exec = L + 3·B and w3/w4 are inert)

— the F-L16-2 waiver, probed in BOTH directions (a waiver that cannot fail is not evidence) —
  CONTROL  a second, unnamed excursion (L99 at 1.7200) ⇒ B-band clause ok=false (required false; the excursion set then reads {L16 1.7000, L99 1.7200} — one id is not the register)
  CONTROL  the named rung widened (L16 at 1.7500) ⇒ B-band clause ok=false (required false — the register names a value, not a permission)
  CONTROL  without L16: the remaining 34 board(s) reproduce the band exactly as [1.2500, 1.6875] (required [1.2500, 1.6875]) — the band itself is re-derived, never widened

— law checks —
  MATCH      CUT L15 D_exec = 14.969697 (§6.1.1) — 14.969697 vs law 14.969697
  MATCH      L15 par 10 (§5.2) — 10 vs law 10
  MATCH      L15 latch advantage 2 (ADR-design-0003 §5 / G1) — 2 vs law 2
  MATCH      L11 D_exec = 8.573171 (§5.2, the previous dip ceiling) — 8.573171 vs law 8.573171
  MATCH      L10 D_exec = 13.642857 (§5.2, the L6-block peak) — 13.642857 vs law 13.642857
  MATCH      B band [1.25, 1.6875] (§6.1.1 P2) is reproduced by the isolated set, modulo the ONE named F-L16-2 excursion (L16 at 1.7000) — never widened, never smoothed — measured [1.2500, 1.7000] vs law [1.25, 1.6875]; excursion set {L16 1.7000} (named register: L16 1.7000); below the floor []; the remaining 34 board(s) reproduce the band as [1.2500, 1.6875]
  MATCH      weights are §2 V0.1 (imported live, not transcribed) — {"L":1,"B":3,"T":4,"R":2,"M":5} vs law {"L":1,"B":3,"T":4,"R":2,"M":5}
  MATCH      the floor is the maximum D_exec over the whole prior set (no prior level sits above it) — max over L1-L15 = 14.969697 vs L15 14.969697
  MATCH      the block law is not re-purposed: BLOCK_L1215_IDS covers exactly L12-L15 — BLOCK_L1215_IDS=[12, 13, 14, 15]
  MATCH      blockL1215Gates live: L12-L15 carry 8/7/7/8 gates (7 shared readers + the dip clause first + the tail clause last), all PASS (§8.10 item 3) — measured 8/7/7/8 · derived 8/7/7/8 · allPass=true
  MATCH      the ordered/unordered refusal readers agree on L12-L15 (ADR-design-0002: the promotion trigger stays unfired) — 4/4 identical tile lists
  MATCH      par 9 cannot clear the cut for any measured B (§6.1.1 necessary bound) — par 9 max D_exec 14.100000 <= 14.969697
  MATCH      par 12 clears the cut for any measured B (§6.1.1 sufficient bound) — par 12 min D_exec 15.750000 > 14.969697
  MATCH      the two published L16 par thresholds are reproduced by the program arithmetic — B > 1.656566 (par 10) · B > 1.323232 (par 11)
  MATCH      the F-L16-2 waiver is non-vacuous and not a widening (both directions probed live) — live ok=true · second unnamed excursion ok=false · named-rung widened ok=false · without L16 reproduced=true as [1.2500, 1.6875]

RESULT: LAW-MATCH — the cut (D_exec > 14.969697), the par-admissibility bounds and every analyzer constant are reproduced by the program solver on the isolated byte-copies.
The law is re-attested; authoring of the L16+ candidates may proceed, against these numbers and no others.

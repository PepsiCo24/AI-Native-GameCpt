LV-009-B STEP 0 — law re-attestation transcript
task:    LV-009-B (integrate the solver-proven L12–L15 block)
law:     docs/decisions/design-0003-l1215-block-law.md (merged 999b21e, countersigned) §3/§4/§5/§6/§8
source:  branch agent/level/lv-009-doctrine-block tip b631cda — candidates/l012.json … candidates/l015.json
scratch: /private/var/folders/8q/vcsvjc5x679d629rzrj8d57w0000gp/T/opencode/lv009b-attest/levels (OUTSIDE the repository: the four boards attested as an ISOLATED dataset)

byte-identity of the copied candidates (git blob sha256 == on-disk sha256):
  l012.json  dcad44c3baa63054def0d25c3685fbe214653eaabc44d7dd399a111035df5db9  dcad44c3baa63054def0d25c3685fbe214653eaabc44d7dd399a111035df5db9  IDENTICAL
  l013.json  93a985f5c43e13e9eb4de6370a0c58eb29938209ad6c361284b23b05f2607b8a  93a985f5c43e13e9eb4de6370a0c58eb29938209ad6c361284b23b05f2607b8a  IDENTICAL
  l014.json  aa07203601a73c4ca7ab46e49684172840f0d6ce33b939c67cf31ca9e9b49781  aa07203601a73c4ca7ab46e49684172840f0d6ce33b939c67cf31ca9e9b49781  IDENTICAL
  l015.json  1ed3fae10d2131ad6846a96727d75d3571d075b811013d36d862fb1c822d04e3  1ed3fae10d2131ad6846a96727d75d3571d075b811013d36d862fb1c822d04e3  IDENTICAL

invocation:
  node_modules/.bin/tsx scripts/attest-lv009-block.ts /private/var/folders/8q/vcsvjc5x679d629rzrj8d57w0000gp/T/opencode/lv009b-attest/levels
  (exit code 0; the harness imports PORTAL_DEBUT_EXEC_BUDGET from @/core/solver/policy and re-audits the
   shipped src/levels/l011.json live — no ADR number is transcribed by hand)

output:
LV-009-B STEP 0 — law re-attestation (ADR-design-0003 §8)
node v24.20.0 · levels dir: /private/var/folders/8q/vcsvjc5x679d629rzrj8d57w0000gp/T/opencode/lv009b-attest/levels
published bound imported live: PORTAL_DEBUT_EXEC_BUDGET = 13.64 (@/core/solver/policy)
L11 re-audit (src/levels/l011.json): par=4 solvable=true Dexec=8.573171 dualPhaseTiles=21 refusedBeforeEnteredTiles=1
dip ceiling: shipped L11 D_exec = 8.573171 (ADR-design-0003 §4 publishes 8.573171)

l012.json  id=12  board=7x3  startPhase=A
  solvable=true par=4 shortestSolution=4 parMatch=true
  D_exec=8.230769 (D=28.230769, L=4, B=1.410256, M=4)
  T=0 R=0 deadStates=0 noUnrecoverableOk=true
  coverage distinctPositions=21 of 21 (P4 holds)
  portalFree solvable=true shortest=7 (walk-only world SATISFIABLE)
  latch allOffGoalReachable=true allOffShortest=6 allOffShortest-par=2 (G1)
  dualPhaseTiles=19 refusedThenEnteredTiles=3 refusedBeforeEnteredTiles=3
  parRoutes=1 embedRoutes=1 embedForced=true validator=ok solverPolicyViolations=0
  LAW (ADR-design-0003): MATCH

l013.json  id=13  board=6x4  startPhase=A
  solvable=true par=6 shortestSolution=6 parMatch=true
  D_exec=10.898734 (D=30.898734, L=6, B=1.632911, M=4)
  T=0 R=0 deadStates=0 noUnrecoverableOk=true
  coverage distinctPositions=24 of 24 (P4 holds)
  portalFree solvable=false shortest=null (walk-only world UNSATISFIABLE)
  latch allOffGoalReachable=true allOffShortest=8 allOffShortest-par=2 (G1)
  dualPhaseTiles=16 refusedThenEnteredTiles=5 refusedBeforeEnteredTiles=5
  parRoutes=3 embedRoutes=3 embedForced=true validator=ok solverPolicyViolations=0
  LAW (ADR-design-0003): MATCH

l014.json  id=14  board=7x4  startPhase=A
  solvable=true par=8 shortestSolution=8 parMatch=true
  D_exec=12.957895 (D=32.957895, L=8, B=1.652632, M=4)
  T=0 R=0 deadStates=0 noUnrecoverableOk=true
  coverage distinctPositions=28 of 28 (P4 holds)
  portalFree solvable=false shortest=null (walk-only world UNSATISFIABLE)
  latch allOffGoalReachable=true allOffShortest=10 allOffShortest-par=2 (G1)
  dualPhaseTiles=20 refusedThenEnteredTiles=5 refusedBeforeEnteredTiles=5
  parRoutes=10 embedRoutes=10 embedForced=true validator=ok solverPolicyViolations=0
  LAW (ADR-design-0003): MATCH

l015.json  id=15  board=7x5  startPhase=A
  solvable=true par=10 shortestSolution=10 parMatch=true
  D_exec=14.969697 (D=34.969697, L=10, B=1.656566, M=4)
  T=0 R=0 deadStates=0 noUnrecoverableOk=true
  coverage distinctPositions=35 of 35 (P4 holds)
  portalFree solvable=false shortest=null (walk-only world UNSATISFIABLE)
  latch allOffGoalReachable=true allOffShortest=12 allOffShortest-par=2 (G1)
  dualPhaseTiles=15 refusedThenEnteredTiles=6 refusedBeforeEnteredTiles=6
  parRoutes=15 embedRoutes=15 embedForced=true validator=ok solverPolicyViolations=0
  LAW (ADR-design-0003): MATCH

— block clauses (the set, not one board) —
  MATCH      C3 strictly increasing from L12 — 12:8.230769 < 13:10.898734 < 14:12.957895 < 15:14.969697
  MATCH      C4 two-beat dip: D_exec(L12) < D_exec(L11) — 8.230769 vs live L11 8.573171
  MATCH      C5 block-end clause: D_exec(L15) > 13.64 and > 13.642857 (L10's measured peak) — 14.969697 vs bound 13.64 / 13.642857
  MATCH      C9 STOP-and-route guard: ordered refusal reader == unordered on 4/4 — 12:true 13:true 14:true 15:true
  MATCH      P2/P3 the ramp is the unique admissible shape (4 + 2·3 = 10 = ceiling) — 12:par 4 / 13:par 6 / 14:par 8 / 15:par 10

RESULT: LAW-MATCH — every ADR-design-0003 §3–§6 constant reproduced by the program solver.
The law is re-attested on the isolated dataset; integration may proceed.

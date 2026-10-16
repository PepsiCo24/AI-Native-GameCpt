audit-block-l1620-controls — the L16-L20 block law, control by control
  CAUGHT  [C1] -rung at 20 (the registered bytes with par mis-stamped 19)
            fired: [gate-block-l1619-rung]  (required one of: gate-block-l1619-rung)
  CAUGHT  [C2] -tail-ceiling (the interior member l018 wearing rung 20)
            fired: [gate-block-l1619-rung gate-block-l1619-tail-ceiling]  (required one of: gate-block-l1619-tail-ceiling, gate-block-l1619-rung)
  CAUGHT  [C3] -b-band with l016-as-20 (F-L16-2's B=1.7000 under an unnamed rung)
            fired: [gate-block-l1619-b-band gate-block-l1619-rung gate-block-l1619-tail-ceiling]  (required one of: gate-block-l1619-b-band, gate-block-l1619-rung)
  CAUGHT  [C4] -grid-coverage (registered bytes on 7 x 7, the added row sealed in both phases)
            fired: [gate-block-l1619-grid-coverage]  (required one of: gate-block-l1619-grid-coverage)
  CAUGHT  [C5] -device-existence (the goal's seal doors and their switches dropped, AND one wall removed from the sealed x=3 column at EACH phase (l020's far region is portal-only, so existence cannot break any other way); d1+s1 stay, so the latch lesson still stands)
            fired: [gate-block-l1619-device-existence gate-block-l1619-escalation-cut gate-block-l1619-rung gate-block-l1619-tail-ceiling gate-shortest-solution-presses-switch-and-crosses-door lesson-switch-required]  (required one of: gate-block-l1619-device-existence)
  CAUGHT  [C6] -escalation-cut (R-003c B10's construction on l016: a phase-B portal whose landing is an A-walled dead pocket -> T=21, R=0.016129, the par + 3.B identity breaks)
            fired: [gate-block-l1619-escalation-cut]  (required one of: gate-block-l1619-escalation-cut)
  discrimination side: l020 fires [] — the law ACCEPTs the registered bytes
controls: 6/6 caught by name
RESULT: CONTROLS-OK

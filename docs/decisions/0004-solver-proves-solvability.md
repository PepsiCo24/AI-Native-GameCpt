# ADR-0004 — Solvability is proven by the program Solver, not the LLM

- **Status:** Accepted
- **Date:** 2026-10-14
- **Deciders:** Agent 4 (Level AI + Solver), Orchestrator

## Context

LLMs can generate plausible-looking level JSON, but cannot be trusted to certify that a level is solvable or fairly difficult.

## Decision

- LLM **generates candidates only**.
- **Schema + rules + Solver (BFS, then A\*)** are the sole authority on validity and solvability.
- Invalid/unsolvable candidates are **rejected**, never auto-repaired into the official set.

## Consequences

- Every accepted level carries machine-verified metrics (`solvable`, `shortestSolution`, branching, dead-end ratio, difficulty score).
- The AI-collaboration chain is provable: generate → validate → solve → score → select → playtest → re-tune.
- Rejected candidates are archived as evidence, not discarded silently.
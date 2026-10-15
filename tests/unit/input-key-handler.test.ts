/**
 * TICKET-QA-005-1 — **one DOM `keydown` event object ⇒ at most one action**.
 *
 * QA-005 pinned the production defect as a `test.fail()`: two press/release pairs
 * dispatched inside one rendered-frame window applied **five** moves on L2. The fix
 * landed in `src/game/input/key-handler.ts` (`createKeyActionHandler`), and the e2e
 * pin is un-pinned in the same commit series. This file drives the same sequence
 * **step by step, without a browser**, so the rule is measured directly instead of
 * only through a 3.5-minute Playwright run.
 *
 * ── The harness is a model of Phaser's delivery, and it is falsifiable ───────
 *
 * `phaserReprocessedBurst` below reproduces the two Phaser 3 behaviours QA-005
 * root-caused in `node_modules/phaser/src/input/keyboard/`:
 *
 * 1. `KeyboardManager.onKeyDown`/`onKeyUp` push the DOM event into `manager.queue`
 *    and then emit `MANAGER_PROCESS` **synchronously** — so every DOM key event
 *    triggers a full pass;
 * 2. `KeyboardPlugin.update()` walks `queue` **from index 0** on every pass, with
 *    only a *consecutive*-duplicate bailout (`code === prevCode && timeStamp ===
 *    prevTime && type === prevType`) — so an alternating down/up burst re-delivers
 *    the earlier `keydown` objects. The queue is emptied only in `postUpdate`, one
 *    rendered frame later, which is the `frame()` boundary in the harness.
 *
 * The harness is **not** trusted on its own: the first test runs the *defective*
 * handler (a verbatim copy of the pre-fix `onKeyDown` body, no identity dedupe)
 * through it and requires the QA-measured `R`,`L` burst to produce **2 rights + 3
 * lefts = 5 actions**. If the harness ever stops modelling the defect, that control
 * goes red instead of the suite going quietly vacuous.
 *
 * Every assertion is about **actions dispatched** (`host.move` / `host.intent`
 * calls), never about board move counts: translating a press into a `MOVE` is this
 * layer's whole job, and whether that `MOVE` is legal or refused is core's
 * (`applyMoveToGameState`). One press ⇒ one `move()` call, always.
 */

import { describe, expect, it } from "vitest";

import type { Level } from "@/core/level";
import type { Direction } from "@/core/state/move";
import { createKeyActionHandler } from "@/game/input/key-handler";
import type { InputIntent, KeyActionHost, KeyEventLike } from "@/game/input/key-handler";
import { loadPlayableLevels } from "@/game/levels/level-registry";
import { GameSession } from "@/game/systems/session";

/* ────────────────────────────────────────────────────────────────────────────
 * Harness
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * A DOM key event **as the rule sees it**: it satisfies `KeyEventLike` directly, so
 * one delivered press is one object identity (exactly what the real DOM gives
 * Phaser, and exactly what the fix dedupes on). `preventDefault` is counted, not
 * acted on.
 */
interface DomKeyEvent extends KeyEventLike {
  readonly type: "keydown" | "keyup";
  readonly timeStamp: number;
  prevented: number;
}

let clock = 0;
function domKey(code: string, type: "keydown" | "keyup"): DomKeyEvent {
  clock += 1;
  const event: DomKeyEvent = {
    code,
    type,
    timeStamp: clock,
    prevented: 0,
    preventDefault(): void {
      event.prevented += 1;
    },
  };
  return event;
}

/**
 * The pre-fix handler body (no identity dedupe, no intent branch) — the control
 * that proves the harness can still see the defect.
 */
function defectiveHandler(
  host: KeyActionHost,
  keyMap: Readonly<Record<string, Direction>>,
): (event: DomKeyEvent) => void {
  return (event: DomKeyEvent): void => {
    const dir = keyMap[event.code];
    if (dir === undefined) return;
    event.prevented += 1;
    host.move(dir);
  };
}

/**
 * Deliver a burst the way Phaser does: each DOM event triggers a full re-walk of
 * the queue from index 0, and the queue survives until the next rendered frame.
 */
function phaserReprocessedBurst(
  events: readonly DomKeyEvent[],
  deliver: (event: DomKeyEvent) => void,
): void {
  const queue: DomKeyEvent[] = [];
  let prevCode: string | null = null;
  let prevTime: number | null = null;
  let prevType: string | null = null;

  for (const event of events) {
    queue.push(event);
    // `KeyboardPlugin.update()` — full walk of the queue on every MANAGER_PROCESS.
    for (const queued of queue) {
      if (
        queued.code === prevCode &&
        queued.timeStamp === prevTime &&
        queued.type === prevType
      ) {
        continue; // the plugin's per-consecutive duplicate bailout
      }
      prevCode = queued.code;
      prevTime = queued.timeStamp;
      prevType = queued.type;
      if (queued.type === "keydown") deliver(queued); // the `keydown` channel
    }
  }
  // `KeyboardManager.postUpdate` — the queue is emptied once per rendered frame.
  queue.length = 0;
}

/** The burst QA-005 dispatched on L2: `R` then `L`, both pairs inside one task. */
function burst(...codes: readonly string[]): readonly DomKeyEvent[] {
  const events: DomKeyEvent[] = [];
  for (const code of codes) {
    events.push(domKey(code, "keydown"), domKey(code, "keyup"));
  }
  return events;
}

const KEY_MOVE: Readonly<Record<string, Direction>> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
};

interface Recorder extends KeyActionHost {
  readonly actions: string[];
}

function recorder(): Recorder {
  const actions: string[] = [];
  return {
    actions,
    move: (dir: Direction) => actions.push(`move:${dir}`),
    intent: (action: InputIntent) => actions.push(`intent:${action}`),
  };
}

/** Run a burst through the shipped handler and return the dispatched actions. */
function shipped(...codes: readonly string[]): { actions: string[]; prevented: number } {
  const host = recorder();
  const handler = createKeyActionHandler(host);
  const events = burst(...codes);
  phaserReprocessedBurst(events, (event) => handler(event));
  return { actions: host.actions, prevented: events.reduce((n, e) => n + e.prevented, 0) };
}

/* ────────────────────────────────────────────────────────────────────────────
 * The control — the harness reproduces QA-005's measurement
 * ──────────────────────────────────────────────────────────────────────────── */

describe("the Phaser re-delivery harness is not vacuous (QA-005's measured defect)", () => {
  it("a naive per-event handler replays the burst: `R`,`L` dispatches 5 actions", () => {
    const host = recorder();
    const naive = defectiveHandler(host, KEY_MOVE);
    phaserReprocessedBurst(burst("ArrowRight", "ArrowLeft"), naive);
    // QA-005's e2e measured exactly this on L2 (`Expected: 2, Received: 5`).
    expect(host.actions).toEqual([
      "move:right",
      "move:right",
      "move:left",
      "move:right",
      "move:left",
    ]);
  });

  it("re-delivers the SAME event object (identity, not a copy) — the premise of the fix", () => {
    const seen: DomKeyEvent[] = [];
    phaserReprocessedBurst(burst("ArrowRight", "ArrowLeft"), (event) => seen.push(event));
    expect(seen.length).toBeGreaterThan(2);
    // The first `keydown` object arrives more than once; identity dedupe can see it.
    const first = seen[0];
    expect(seen.filter((event) => event === first).length).toBeGreaterThan(1);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * The shipped rule
 * ──────────────────────────────────────────────────────────────────────────── */

describe("one delivered press ⇒ exactly one action (TICKET-QA-005-1)", () => {
  it("`R`,`L` inside one frame window dispatches exactly two moves, in order", () => {
    const { actions, prevented } = shipped("ArrowRight", "ArrowLeft");
    expect(actions).toEqual(["move:right", "move:left"]);
    expect(prevented, "one preventDefault per acted press, never per re-delivery").toBe(2);
  });

  it("one pair alone is exactly one move (the ordinary path is untouched)", () => {
    expect(shipped("ArrowRight").actions).toEqual(["move:right"]);
  });

  it("the QA-005 burst matrix dispatches one action per DOM keydown", () => {
    // The e2e's observed counts were clamped by legality (the 4th `R` is out of
    // bounds on L2); here the contract is the un-clamped one: N presses ⇒ N calls.
    const matrix: readonly (readonly string[])[] = [
      ["ArrowRight"],
      ["ArrowRight", "ArrowRight"],
      ["ArrowRight", "ArrowLeft"],
      ["ArrowRight", "ArrowLeft", "ArrowRight", "ArrowLeft"],
    ];
    const expected: readonly (readonly string[])[] = [
      ["move:right"],
      ["move:right", "move:right"],
      ["move:right", "move:left"],
      ["move:right", "move:left", "move:right", "move:left"],
    ];
    matrix.forEach((codes, index) => {
      expect(shipped(...codes).actions, `${String(codes.length)} presses`).toEqual(
        expected[index],
      );
    });
  });

  it("dedupes by identity, not by key code: two distinct events of one key both act", () => {
    // A real key release + re-press (or an OS key repeat) is a NEW object each time.
    expect(shipped("ArrowRight", "ArrowRight").actions).toEqual([
      "move:right",
      "move:right",
    ]);
  });

  it("the same event object delivered three times acts once", () => {
    const host = recorder();
    const handler = createKeyActionHandler(host);
    const event = domKey("ArrowUp", "keydown");
    handler(event);
    handler(event);
    handler(event);
    expect(host.actions).toEqual(["move:up"]);
    expect(event.prevented).toBe(1);
  });

  it("a burst split across two frames still dispatches one action per press", () => {
    const host = recorder();
    const handler = createKeyActionHandler(host);
    const first = burst("ArrowRight");
    phaserReprocessedBurst(first, (event) => handler(event));
    const second = burst("ArrowLeft");
    phaserReprocessedBurst(second, (event) => handler(event));
    expect(host.actions).toEqual(["move:right", "move:left"]);
  });

  it("the intent keys are deduped the same way (Z / R / Enter)", () => {
    const host = recorder();
    const handler = createKeyActionHandler(host);
    phaserReprocessedBurst(burst("KeyZ", "Enter"), (event) => handler(event));
    expect(host.actions).toEqual(["intent:undo", "intent:next"]);
  });

  it("a key maps to exactly one action: `move` OR `intent`, never both", () => {
    const host = recorder();
    const handler = createKeyActionHandler(host);
    phaserReprocessedBurst(
      burst("ArrowDown", "KeyR", "KeyW", "KeyS", "KeyA", "KeyD", "ArrowLeft", "ArrowUp"),
      (event) => handler(event),
    );
    expect(host.actions).toEqual([
      "move:down",
      "intent:restart",
      "move:up",
      "move:down",
      "move:left",
      "move:right",
      "move:left",
      "move:up",
    ]);
  });

  it("an unmapped key is not an action and is not cancelled", () => {
    const host = recorder();
    const handler = createKeyActionHandler(host);
    const events = burst("KeyQ", "Space");
    phaserReprocessedBurst(events, (event) => handler(event));
    expect(host.actions).toEqual([]);
    expect(events.map((event) => event.prevented)).toEqual([0, 0, 0, 0]);
  });

  it("repeat deliveries of an unmapped key stay no-ops as well", () => {
    const host = recorder();
    const handler = createKeyActionHandler(host);
    const event = domKey("F5", "keydown");
    handler(event);
    handler(event);
    expect(host.actions).toEqual([]);
    expect(event.prevented).toBe(0);
  });
});

/* ────────────────────────────────────────────────────────────────────────────
 * The composed claim: the QA-005 burst against a real level + the real session
 * ──────────────────────────────────────────────────────────────────────────── */

describe("the burst on the shipped L2 board (QA-005's own reproduction)", () => {
  const l2 = loadPlayableLevels()[1] as Level;

  /** Wire a handler to a session the way `LevelScene` wires `attachInput`. */
  function wired(handler: (host: KeyActionHost) => (event: KeyEventLike) => void, session: GameSession): (event: DomKeyEvent) => void {
    const inner = handler({
      move: (dir: Direction) => {
        session.move(dir);
      },
      intent: () => undefined,
    });
    return (event: DomKeyEvent) => {
      inner(event);
    };
  }

  it("two presses inside one frame window cost exactly two moves and two flips", () => {
    const session = new GameSession([l2]);
    const handler = wired(createKeyActionHandler, session);
    phaserReprocessedBurst(burst("ArrowRight", "ArrowLeft"), handler);
    // The e2e's own numbers (`input-replay.spec.ts`): 2 moves, phase back to start.
    expect(session.moveCount).toBe(2);
    expect(session.phase).toBe(l2.startPhase);
  });

  it("the same burst on the defective wiring spends more (the defect, end to end)", () => {
    const session = new GameSession([l2]);
    const naive = defectiveHandler(
      {
        move: (dir: Direction) => {
          session.move(dir);
        },
        intent: () => undefined,
      },
      KEY_MOVE,
    );
    phaserReprocessedBurst(burst("ArrowRight", "ArrowLeft"), naive);
    // Exactly QA-005's browser measurement (`input-replay.spec.ts` header: the
    // `R`,`L` row is `4 events → 2 expected → 5 observed`). This node harness
    // reproducing the browser's number is what makes it evidence for the harness
    // rather than a story about it. A deliberate L2 re-authoring may move it.
    expect(session.moveCount, "the defective wiring spends five moves on L2").toBe(5);
  });
});
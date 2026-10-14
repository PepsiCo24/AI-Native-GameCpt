/**
 * Application intents — the three non-`MOVE` actions the UI can dispatch.
 *
 * `docs/ui-ux.md` §7.2: "DOM dispatches *intents* (`undo()`, `restart()`,
 * `next()`); it never mutates state. One truth source stays in core."
 *
 * There is exactly **one** logical gameplay action, `MOVE(direction)`
 * (`AGENTS.md` §2) — and these three are not gameplay actions at all: they are
 * bookkeeping over core's own history (`undo`), core's own `initialState`
 * (`restart`) and the prototype's level cursor (`next`). None of them decides a
 * rule, so none of them may live in the renderer or the DOM: the DOM button, the
 * keyboard shortcut and the win dialog all call the same closure created in the
 * composition root (`src/main.ts`), which is the only place that owns the
 * session's lifecycle.
 *
 * Declaring the shape here (instead of importing it from the HUD module) keeps
 * the canvas side free of any DOM module reference — a type-only import today
 * would still couple the two halves of `docs/ui-ux.md` §7.1.
 */

/** `undo` / `restart` / `next` — names match `InputIntent` in `input/input-map.ts`. */
export interface AppIntents {
  /** Restore core's last snapshot (`GameSession.undo`). No-op when not undoable. */
  readonly undo: () => void;
  /** One tap, no dialog, no penalty (`docs/ui-ux.md` R-T2). */
  readonly restart: () => void;
  /** Advance the level cursor; ignored unless the level is actually won. */
  readonly next: () => void;
}
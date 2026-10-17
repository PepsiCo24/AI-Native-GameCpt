/**
 * HUD — the DOM half of `docs/ui-ux.md` §7 (V0.5).
 *
 * Owns: level label, move counter, phase chip, Undo / Restart, the win dialog,
 * the §5.5 post-win star field, the R-T5 swipe hint, the R-P3 dev placeholder
 * labels, the §7.4 `aria-live` region. Owns **no** board state and **no** colour
 * of its own.
 *
 * Three contracts bind this file:
 *
 * 1. **§7.2 — it never reads `GameState` per frame and never imports Phaser.**
 *    It subscribes to the **same** typed event bus as the renderer
 *    (`GameSession.events`) and keeps one derived boolean (`undoable`) from the
 *    payloads it receives. It dispatches *intents* (undo / restart / next) and
 *    never mutates state.
 * 2. **§7.3 — it can never intersect the board rect.** Bars and the dev strip are
 *    real boxes in the flex column (`56 px` top, `72 px` bottom, play area
 *    `flex: 1`), not a floating overlay; the only fixed overlay is the win dialog,
 *    whose root is `pointer-events: none` while the dialog card re-enables it.
 * 3. **§5.4 / R-C11 — every colour is a token.** All colour reaches the DOM as
 *    `--ps-*` custom properties written from `cssVars(phase)`; a phase change is
 *    one `data-phase` attribute plus CSS transitions, never per-element styling.
 *    Layout sizes and flip timings are injected as `--ps-*` numbers from
 *    `LAYOUT` / `flipTimings` so no number is duplicated in CSS.
 *
 * `par` is **not** printed by default: `docs/ui-ux.md` §5.3 (M-5b) locks "plain
 * move count only, no par anywhere in the HUD" until the Game Designer signs it
 * off, while the RENDER-001 dispatch asks for it. The spec's own pre-agreed format
 * (`moves 4 / par 6`) is implemented behind `HUD_FLAGS.showPar`, so the sign-off
 * is a one-line data change — see `theme/tokens.ts`.
 */

import type { Level } from "@/core/level";
import type { Phase } from "@/core/state/phase";
import { hasQueryFlag, IS_PROD } from "@/game/env";
import { FONT_STACK, injectHudStyles } from "@/game/hud/hud-styles";
import type { AppIntents } from "@/game/systems/app-intents";
import type { GameSession } from "@/game/systems/session";
import { unresolvedSlots } from "@/game/theme/assets";
import type { PlaceholderSlot } from "@/game/theme/assets";
import type { StarCount } from "@/game/systems/stars";
import { recordWinStars, STAR_SLOTS } from "@/game/systems/stars";
import { cssVars, flipTimings, HUD_FLAGS, LAYOUT, theme } from "@/game/theme/tokens";

/** R-P3's badge copy — one string, so the label cannot drift from its spec line. */
const DEV_BADGE_TEXT = "DEV PLACEHOLDER ART — NOT FINAL";

/* ────────────────────────────────────────────────────────────────────────────
 * §6.6 DOM beats (GAME-003) — B12's press + B13's panel entrance, as data.
 *
 * These numbers are not rows of `flipTimings` (they are DOM-only beats, §6.6's
 * table), so they live with their one consumer and reach the stylesheet as `--ps-*`
 * variables: a data flip, never a branch (R-M4). The *reduced* forms are the
 * variables `--ps-press-scale` (1) and `--ps-panel-offset` (0px), set by
 * {@link Hud.setReducedMotion}.
 * ──────────────────────────────────────────────────────────────────────────── */

/** B12 — press in / out durations (§6.6: 90 ms in, 140 ms out). */
const PRESS_IN_MS = 90;
const PRESS_OUT_MS = 140;
/** B12 — the visual press scale; the scale *dies* under reduced motion. */
const PRESS_SCALE = 0.97;
/** B13 — the win panel entrance duration; it starts at `flipTimings.total`. */
const PANEL_MS = 160;
/** B13 — the fixed entrance offset; 0 under reduced motion leaves the alpha fade. */
const PANEL_OFFSET_PX = 8;
/** §5.5 SF-6 — the star fill-in's window: ≤ 120 ms, delay 0 (the entrance's instant). */
const STAR_FILL_MS = 120;
/** §5.5 SF-6/SF-7 — the fill-in's pop, `0.86 → 1.00`; under reduced motion it is **1**. */
const STAR_SCALE_FROM = 0.86;

/**
 * §5.5 SF-3 — one mark per slot, as one pure position rule.
 *
 * `earned` = this run earned it · `held` = the stored best holds it, this run did not ·
 * `empty` = nobody has it. Because the field renders from the **post-write** best
 * (`max(previous, this run)`), `held` can only ever mean "this run's shortfall against
 * the record" — a new best, a first clear and a corrupt/absent store all draw zero
 * hollow marks, so the field can never claim a record the storage does not hold.
 */
export function starStateAt(
  position: number,
  run: StarCount,
  best: StarCount,
): "earned" | "held" | "empty" {
  if (position <= run) return "earned";
  if (position <= best) return "held";
  return "empty";
}

/** The three actions the DOM can dispatch, plus two flow queries. */
export interface HudHooks extends AppIntents {
  /** `false` on the last prototype level ⇒ the dialog shows the end panel. */
  readonly hasNextLevel: () => boolean;
  /**
   * The shipped ladder's own range (`L1–L11`), derived from the level registry by
   * the composition root — never a literal in this file. The end panel names what
   * the player actually cleared (TICKET-QA-005-2: the copy said `L1–L5` long after
   * the registry had grown past five levels).
   */
  readonly shippedLadder: () => string;
}

export interface HudConfig {
  readonly container: HTMLElement;
  readonly session: GameSession;
  readonly hooks: HudHooks;
  readonly reducedMotion: boolean;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(className: string, label: string, ariaLabel?: string): HTMLButtonElement {
  const node = el("button", className, label);
  node.type = "button";
  node.setAttribute("aria-label", ariaLabel ?? label);
  return node;
}

/** `L 03` — tabular numerals (§5.3). */
function levelLabelOf(level: Level): string {
  return `L ${String(level.id).padStart(2, "0")}`;
}

/**
 * `moves 4` — and, only behind {@link HUD_FLAGS.showPar}, the §5.3 pre-agreed
 * `moves 4 / par 6`. Never a `4/9` fraction, never a colour change, never an
 * over-par state (`level-design.md` §1: par is not a fail condition).
 */
function movesLabelOf(moveCount: number, par: number): string {
  return HUD_FLAGS.showPar ? `moves ${String(moveCount)} / par ${String(par)}` : `moves ${String(moveCount)}`;
}

export class Hud {
  /** The Phaser canvas parent — the middle flex box of the shell. */
  readonly playArea: HTMLDivElement;

  private readonly session: GameSession;
  private readonly hooks: HudHooks;

  private readonly shell: HTMLDivElement;
  private readonly levelLabel: HTMLSpanElement;
  private readonly movesLabel: HTMLSpanElement;
  private readonly chip: HTMLDivElement;
  private readonly glyph: HTMLSpanElement;
  private readonly chipText: HTMLSpanElement;
  private readonly live: HTMLDivElement;
  private readonly hint: HTMLDivElement;
  private readonly undoButton: HTMLButtonElement;
  private readonly restartButton: HTMLButtonElement;
  private readonly overlay: HTMLDivElement;
  private readonly dialogTitle: HTMLHeadingElement;
  private readonly dialogBody: HTMLParagraphElement;
  /** §5.5 — the star field: one node, three fixed slots, `aria-hidden`. */
  private readonly starRow: HTMLDivElement;
  private readonly starSlots: readonly HTMLSpanElement[];
  private readonly dialogActions: HTMLDivElement;
  private readonly nextButton: HTMLButtonElement;
  private readonly replayButton: HTMLButtonElement;
  /** R-P3 — `null` in a production build (no dev labels exist there at all). */
  private readonly devBadge: HTMLDivElement | null;
  /** R-P3 `?placeholders=1` — `null` unless a dev build was opened with the flag. */
  private readonly devStrip: HTMLDivElement | null;

  private readonly unsubscribes: (() => void)[] = [];
  private winTimer: number | null = null;
  private swipeHintShown = false;
  /** §6.4 — kept so the win panel waits for the flip the *current* setting runs. */
  private reducedMotion: boolean;

  constructor(config: HudConfig) {
    this.session = config.session;
    this.hooks = config.hooks;
    this.reducedMotion = config.reducedMotion;

    injectHudStyles(document);

    // ── shell: fixed column, bars are layout boxes, play area takes the rest ──
    this.shell = el("div", "ps-shell");
    const topBar = el("header", "ps-bar ps-top");
    this.playArea = el("div", "ps-play");
    const bottomBar = el("footer", "ps-bar ps-bottom");

    this.levelLabel = el("span", "ps-level", levelLabelOf(config.session.level));
    this.movesLabel = el("span", "ps-moves", movesLabelOf(0, config.session.level.par));

    this.chip = el("div", "ps-chip");
    this.chip.setAttribute("role", "img");
    this.glyph = el("span", "ps-glyph");
    this.chipText = el("span", "ps-sr", "");
    this.chip.append(this.glyph, this.chipText);

    this.live = el("div", "ps-sr");
    this.live.setAttribute("role", "status");
    this.live.setAttribute("aria-live", "polite");

    topBar.append(
      el("span", "ps-spacer"),
      this.levelLabel,
      this.movesLabel,
      el("span", "ps-spacer"),
      this.chip,
      // §7.4 live region: visually hidden, still the announced channel for phase
      // and win. It lives in the top bar so no element is ever over the board.
      this.live,
    );

    // R-P3 — dev-only honesty labels; a production build renders none of this.
    // Both describe what is **actually being drawn**: the declared unresolved
    // slots at construction, then whatever `setPlaceholderSlots()` publishes once
    // the loader has resolved (a degraded mount puts its slot back on the list).
    this.devBadge = IS_PROD ? null : el("div", "ps-devbadge", DEV_BADGE_TEXT);
    if (this.devBadge !== null) topBar.append(this.devBadge);

    this.hint = el("div", "ps-hint");
    this.hint.hidden = true;
    this.hint.textContent = "Swipe to move — cells are small";

    this.undoButton = button("ps-btn ps-btn-ghost", "Undo");
    this.undoButton.disabled = true;
    this.undoButton.addEventListener("click", () => this.hooks.undo());
    this.restartButton = button("ps-btn ps-btn-ghost", "Restart");
    this.restartButton.addEventListener("click", () => this.hooks.restart());
    const actions = el("div", "ps-actions");
    actions.append(this.undoButton, this.restartButton);
    bottomBar.append(this.hint, el("span", "ps-spacer"), actions);

    // ── win dialog (§1: the prototype's only dialog) ──
    this.overlay = el("div", "ps-overlay");
    this.overlay.hidden = true;
    const dialog = el("div", "ps-dialog");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "ps-dialog-title");
    this.dialogTitle = el("h2", "ps-dialog-title");
    this.dialogTitle.id = "ps-dialog-title";
    this.dialogBody = el("p", "ps-dialog-body");
    // §5.5 — ONE added grid row between the body and the actions. Program-drawn
    // geometry only (no raster, no text glyph — SF-1), three slots always (SF-2), and
    // `aria-hidden`: the panel's live-region line is the announced channel (SF-5), so a
    // second announcement is never made for the same fact.
    this.starRow = el("div", "ps-stars");
    this.starRow.setAttribute("aria-hidden", "true");
    this.starSlots = Array.from({ length: STAR_SLOTS }, () => el("span", "ps-star"));
    this.starRow.append(...this.starSlots);
    this.nextButton = button("ps-btn ps-btn-primary", "Next");
    this.nextButton.addEventListener("click", () => this.hooks.next());
    this.replayButton = button("ps-btn ps-btn-ghost", "Replay");
    this.replayButton.addEventListener("click", () => this.hooks.restart());
    this.dialogActions = el("div", "ps-dialog-actions");
    this.dialogActions.append(this.nextButton, this.replayButton);
    // One implementation for both panel instances (§5.5: the per-level dialog and the
    // prototype-end panel are the same dialog with one copy difference).
    dialog.append(this.dialogTitle, this.dialogBody, this.starRow, this.dialogActions);
    this.overlay.append(dialog);

    this.shell.append(topBar);

    // R-P3 `?placeholders=1` — the Asset-ID list. Its rows are the slots a
    // placeholder is being drawn for (never "every slot the manifest ever had"),
    // so the strip shrinks as integration lands and grows again if a delivered
    // file fails to mount.
    this.devStrip = !IS_PROD && hasQueryFlag("placeholders") ? el("div", "ps-devstrip") : null;
    if (this.devStrip !== null) this.shell.append(this.devStrip);

    this.shell.append(this.playArea, bottomBar, this.overlay);

    // The declaration is the honest starting point — the loader has not resolved
    // yet (`LevelScene.create()` calls this again with the measured answer).
    this.setPlaceholderSlots(unresolvedSlots());

    // Token hand-off (§5.4): numbers first, then the phase colours.
    this.applyStaticVars();
    this.setReducedMotion(config.reducedMotion);
    this.applyPhase(config.session.phase, { announce: false });

    config.container.append(this.shell);
    this.subscribe();
  }

  /* ── public surface ─────────────────────────────────────────────────────── */

  /**
   * R-P2/R-P3 honesty — publish which slots are **being drawn as placeholders**.
   *
   * The input is a measurement, not a status: `theme/art.ts` derives it from what
   * the loader actually mounted (declared-unresolved ∪ failed-to-mount), so with
   * every canvas slot integrated and A-07 retired (UA-0013) the list is **empty in
   * the art-mounted state** — both labels hide — while a delivered file that fails
   * to load puts its own Asset ID back on the list: the degraded boot still says
   * "placeholder art", which is the whole point of R-P3.
   *
   * In a production build both labels are absent and this is a no-op.
   */
  setPlaceholderSlots(slots: readonly PlaceholderSlot[]): void {
    if (this.devBadge !== null) this.devBadge.hidden = slots.length === 0;
    if (this.devStrip === null) return;
    this.devStrip.replaceChildren(
      ...slots.map((slot) => {
        const item = el("span", "ps-devstrip-item", `${slot.assetId} ${slot.assetName}`);
        item.title = slot.usage;
        return item;
      }),
    );
    this.devStrip.hidden = slots.length === 0;
  }

  /**
   * R-T5: the one-time swipe hint for sub-44 px cells. Called by the renderer's
   * layout callback (`BoardView.onLayout` → scene → composition root), because
   * only the board knows the current cell size in CSS px.
   */
  setCellSizeCss(cellSizeCss: number): void {
    if (this.swipeHintShown || cellSizeCss >= LAYOUT.minCellTarget) return;
    this.swipeHintShown = true;
    this.hint.hidden = false;
  }

  /** §6.4 — reduced motion also removes the DOM transitions. */
  setReducedMotion(reducedMotion: boolean): void {
    this.reducedMotion = reducedMotion;
    const timings = flipTimings(reducedMotion);
    this.shell.style.setProperty("--ps-flip-tokens-ms", `${String(timings.tokens.dur)}ms`);
    this.shell.style.setProperty("--ps-flip-tokens-delay-ms", `${String(timings.tokens.start)}ms`);
    this.shell.style.setProperty("--ps-flip-chip-ms", `${String(timings.chip.dur)}ms`);
    this.shell.style.setProperty("--ps-flip-chip-delay-ms", `${String(timings.chip.start)}ms`);
    // §6.6 MV-4 — the reduced forms of B12/B13 as **data**: the press scale dies
    // (1) and the panel offset dies (0px) while the panel's alpha fade survives.
    this.shell.style.setProperty("--ps-press-scale", reducedMotion ? "1" : String(PRESS_SCALE));
    this.shell.style.setProperty(
      "--ps-panel-offset",
      reducedMotion ? "0px" : `${String(PANEL_OFFSET_PX)}px`,
    );
    // §5.5 SF-7 — the star fill-in is a **data flip**, not a branch: the keyframes keep
    // running and read `scale(1)` from start to end, so the only appearance channel left
    // is the panel's own kept alpha fade. Legibility is identical with motion removed.
    this.shell.style.setProperty(
      "--ps-star-scale-from",
      reducedMotion ? "1" : String(STAR_SCALE_FROM),
    );
  }

  destroy(): void {
    for (const off of this.unsubscribes) off();
    this.unsubscribes.length = 0;
    if (this.winTimer !== null) {
      window.clearTimeout(this.winTimer);
      this.winTimer = null;
    }
    this.shell.remove();
  }

  /* ── tokens ─────────────────────────────────────────────────────────────── */

  private applyStaticVars(): void {
    const style = this.shell.style;
    style.setProperty("--ps-font-stack", FONT_STACK);
    style.setProperty("--ps-top-bar", `${String(LAYOUT.topBar)}px`);
    style.setProperty("--ps-bottom-bar", `${String(LAYOUT.bottomBar)}px`);
    style.setProperty("--ps-gap", `${String(LAYOUT.controlGap)}px`);
    style.setProperty("--ps-pad", `${String(LAYOUT.margin)}px`);
    style.setProperty("--ps-control", `${String(LAYOUT.minControl)}px`);
    style.setProperty("--ps-control-gap", `${String(LAYOUT.controlGap)}px`);
    // §6.6 B12/B13 — the DOM beats' own numbers (see the constants above).
    style.setProperty("--ps-press-in-ms", `${String(PRESS_IN_MS)}ms`);
    style.setProperty("--ps-press-out-ms", `${String(PRESS_OUT_MS)}ms`);
    style.setProperty("--ps-panel-ms", `${String(PANEL_MS)}ms`);
    // §5.5 SF-6 — the fill-in's window, as data (the reduced form is the scale flip).
    style.setProperty("--ps-star-ms", `${String(STAR_FILL_MS)}ms`);
  }

  /** One attribute + the token map: the whole §5.4 flip on the DOM side. */
  private applyPhase(phase: Phase, options: { readonly announce: boolean }): void {
    this.shell.dataset["phase"] = phase;
    for (const [name, value] of Object.entries(cssVars(phase))) {
      this.shell.style.setProperty(name, value);
    }

    // R-C1: the glyph is the non-colour channel; the label names the phase for
    // assistive tech (the chip itself is visually icon-only, §7.4).
    const tokens = theme(phase);
    this.glyph.dataset["glyph"] = tokens.hud.phaseGlyph;
    this.chip.setAttribute("aria-label", tokens.hud.phaseLabel);
    this.chipText.textContent = tokens.hud.phaseLabel;
    if (options.announce) this.live.textContent = tokens.hud.phaseLabel;
  }

  private renderCounters(level: Level, moveCount: number, won: boolean): void {
    this.levelLabel.textContent = levelLabelOf(level);
    this.movesLabel.textContent = movesLabelOf(moveCount, level.par);
    // Undo is core's own rule (`GameSession.canUndo`), restated here only from the
    // payloads the bus already delivered: a won level cannot be undone, and there is
    // nothing to undo before the first legal move. No GameState is read (§7.2).
    this.undoButton.disabled = won || moveCount === 0;
  }

  /* ── events (§7.2: the same bus as the renderer) ────────────────────────── */

  private subscribe(): void {
    const events = this.session.events;
    this.unsubscribes.push(
      events.on("move", ({ level, moveCount }) => {
        this.renderCounters(level, moveCount, false);
      }),
      events.on("phaseChanged", ({ to }) => {
        this.applyPhase(to, { announce: true });
      }),
      events.on("refused", () => {
        // §6.5: the DOM says nothing. "The world did not flip" is the cue, and the
        // board already shows the cause at full emphasis; no text, no shake, no sting.
      }),
      events.on("undo", ({ level, moveCount, phase }) => {
        this.applyPhase(phase, { announce: true });
        this.renderCounters(level, moveCount, false);
        this.hideDialog();
      }),
      events.on("restart", ({ level }) => {
        this.applyPhase(level.startPhase, { announce: true });
        this.renderCounters(level, 0, false);
        this.hideDialog();
      }),
      events.on("levelStarted", ({ level }) => {
        this.applyPhase(level.startPhase, { announce: true });
        this.renderCounters(level, 0, false);
        this.hideDialog();
      }),
      events.on("levelAdvanced", ({ finished }) => {
        this.hideDialog();
        if (finished) this.live.textContent = "原型结束 / Prototype over";
      }),
      events.on("levelWon", ({ level, moveCount }) => {
        this.renderCounters(level, moveCount, true);
        this.scheduleWinPanel(level, moveCount);
      }),
    );
  }

  /**
   * §6.2: "Win check fires **after** the flip resolves." The renderer flashes the
   * plate tint at `flipTimings.total`; the dialog waits the same amount, so the
   * player always sees the board they solved before a panel appears over it.
   */
  private scheduleWinPanel(level: Level, moveCount: number): void {
    if (this.winTimer !== null) window.clearTimeout(this.winTimer);
    const delay = flipTimings(this.reducedMotion).total;
    this.winTimer = window.setTimeout(() => {
      this.winTimer = null;
      this.showWinPanel(level, moveCount);
    }, delay);
  }

  private showWinPanel(level: Level, moveCount: number): void {
    const hasNext = this.hooks.hasNextLevel();
    const moves = movesLabelOf(moveCount, level.par);

    // §5.5 SF-5 — the field renders from the **post-write** stored best, and this call
    // is the write. It is the only write site in the repository, and it sits in the
    // win-only path (`levelWon` → this method), so Undo, Restart and level entry cannot
    // touch the key family: those paths call `hideDialog`, which stores nothing. The
    // monotone rule itself lives with the data (`systems/stars.ts`).
    const stars = recordWinStars(level.id, moveCount, level.par);
    this.renderStars(stars.run, stars.best);

    // End of the playable slice reuses the same dialog with different copy — §0.5
    // forbids adding a screen, and §1's inventory is 1 screen + 1 dialog. The
    // ladder range is read from the registry's own list, so the panel cannot claim
    // a shorter prototype than the one that ships (TICKET-QA-005-2).
    const title = hasNext ? `${levelLabelOf(level)} cleared` : "原型结束 / Prototype over";
    const body = hasNext
      ? moves
      : `${this.hooks.shippedLadder()} cleared · ${levelLabelOf(level)}: ${moves}`;
    this.dialogTitle.textContent = title;
    this.dialogBody.textContent = body;
    this.nextButton.hidden = !hasNext;

    this.overlay.hidden = false;
    // §5.5 SF-5 a11y parity without a second announcement: the field is `aria-hidden`,
    // and the panel's existing live line is **extended, not replaced** — `, best {B} of
    // 3` only when the record is ahead of this run, so the worse-run case is announced
    // too and the visual best is never silent for an AT player.
    this.live.textContent =
      `${title}. ${body}. stars ${String(stars.run)} of 3` +
      (stars.best > stars.run ? `, best ${String(stars.best)} of 3` : "");
    // Focus the primary control: keyboard players must not have to hunt for it.
    (hasNext ? this.nextButton : this.replayButton).focus();
  }

  /**
   * §5.5 SF-3 — paint the three states, one mark per slot, **before** the overlay
   * unhides (the fill-in starts on that frame, so a stale state would be a visible
   * contradiction for one beat).
   */
  private renderStars(run: StarCount, best: StarCount): void {
    this.starSlots.forEach((slot, index) => {
      slot.dataset["state"] = starStateAt(index + 1, run, best);
    });
  }

  private hideDialog(): void {
    if (this.winTimer !== null) {
      window.clearTimeout(this.winTimer);
      this.winTimer = null;
    }
    if (this.overlay.hidden) return;
    this.overlay.hidden = true;
    // Do not leave focus inside a hidden dialog.
    if (this.overlay.contains(document.activeElement)) this.restartButton.focus();
  }
}
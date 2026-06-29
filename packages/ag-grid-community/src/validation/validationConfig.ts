import type { ErrorId } from './errorMessages/errorText';
import { _configureDiagnostics } from './logging';

/** Which captured diagnostics the dev validation overlay surfaces. */
export type DevOverlayMode = 'all' | 'errors' | false;

/**
 * Development-time configuration for the {@link ValidationModule}. Configuration is global, not
 * per-grid: the most recent `enableDevValidations`/`ValidationModule.with` call wins and applies to
 * every grid on the page.
 */
export interface DevValidationOptions {
    /**
     * Turns matching diagnostics into thrown errors instead of console messages, so problems fail fast
     * and loudly rather than scrolling past unnoticed. This gives you a tight feedback loop for
     * automated workflows — e.g. e2e runs or AI-assisted development — where a hard failure is surfaced
     * and acted on immediately.
     *
     * The threshold is inclusive, from least to most severe:
     * - `'error'` — throws on errors only
     * - `'warning'` — throws on warnings and errors
     * - `'deprecation'` — throws on deprecations, warnings and errors
     *
     * Defaults to `false` (never throws).
     *
     * Caveat: a diagnostic raised while a grid is still initialising throws part-way through its setup,
     * leaving that grid partially built and unusable. Use this with harnesses that recreate the grid on
     * failure — not to carry on with the same instance after a throw — and never in production.
     */
    throwOn?: 'error' | 'warning' | 'deprecation' | false;
    /**
     * Renders captured diagnostics in a development overlay over the grid. `'all'` shows errors,
     * warnings and deprecations; `'errors'` shows only errors; `false` shows nothing. Default `'all'`.
     */
    overlay?: DevOverlayMode;
    /**
     * Error ids to ignore — for diagnostics you have reviewed and accepted. A suppressed id is kept out
     * of the overlay and is never thrown by {@link throwOn}, but is still logged to the console once.
     * Defaults to none.
     */
    suppress?: ErrorId[];
}

const DEV_VALIDATION_DEFAULTS: Required<DevValidationOptions> = {
    throwOn: false,
    overlay: 'all',
    suppress: [],
};

// Read per grid by ErrorOverlayService. Kept here (not in logging.ts) because the logging hot path
// only needs capture/throwOn; the overlay mode is consumed solely by the dev overlay bean. Global and
// last-write-wins, mirroring throwOn.
let overlayMode: DevOverlayMode = DEV_VALIDATION_DEFAULTS.overlay;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getDevOverlayMode(): DevOverlayMode {
    return overlayMode;
}

/**
 * Resolves the supplied options against the defaults and pushes the resulting diagnostic configuration
 * into the logging layer. Each call fully replaces the previous configuration — options left out reset
 * to their defaults, so registering without options does not inherit an earlier `throwOn`/`overlay`.
 * Always enables capture, since reaching here means the ValidationModule is active.
 */
export function _applyDevValidationConfig(options?: DevValidationOptions): void {
    _configureDiagnostics({
        capture: true,
        throwOn: options?.throwOn ?? DEV_VALIDATION_DEFAULTS.throwOn,
        suppress: options?.suppress ?? DEV_VALIDATION_DEFAULTS.suppress,
    });
    overlayMode = options?.overlay ?? DEV_VALIDATION_DEFAULTS.overlay;
}

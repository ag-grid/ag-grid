import type { ErrorId } from './errorMessages/errorText';
import { _configureDiagnostics } from './logging';

/**
 * Development-time configuration for the {@link ValidationModule}. Configuration is global, not
 * per-grid: the most recent `enableDevValidations`/`ValidationModule.with` call wins and applies to
 * every grid on the page.
 */
export interface DevValidationOptions {
    /**
     * Makes matching diagnostics throw synchronously after logging, so e2e/agent test runs fail
     * loudly. Inclusive threshold: `'error'` throws on errors only; `'warning'` on warnings and
     * errors; `'deprecation'` on deprecations, warnings and errors. Default `false`.
     *
     * A diagnostic raised during grid initialisation throws out of bean wiring, leaving the grid
     * partially constructed and unusable — intended for test harnesses that recreate the grid on
     * failure, not for reuse after a throw. Not for production builds.
     */
    throwOn?: 'error' | 'warning' | 'deprecation' | false;
    /**
     * Error ids to ignore, for diagnostics the developer has reviewed and accepted. Suppressed ids are
     * kept out of the overlay and are never thrown by {@link throwOn}; they are still logged once to the
     * console. Default none.
     */
    suppress?: ErrorId[];
}

const DEV_VALIDATION_DEFAULTS: Required<DevValidationOptions> = {
    throwOn: false,
    suppress: [],
};

/**
 * Resolves the supplied options against the defaults and pushes the resulting diagnostic configuration
 * into the logging layer. Each call fully replaces the previous configuration — options left out reset
 * to their defaults, so registering without options does not inherit an earlier `throwOn`. Always
 * enables capture, since reaching here means the ValidationModule is active.
 */
export function _applyDevValidationConfig(options?: DevValidationOptions): void {
    _configureDiagnostics({
        capture: true,
        throwOn: options?.throwOn ?? DEV_VALIDATION_DEFAULTS.throwOn,
        suppress: options?.suppress ?? DEV_VALIDATION_DEFAULTS.suppress,
    });
}

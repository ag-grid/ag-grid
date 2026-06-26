import { _configureDiagnostics } from './logging';

/**
 * Development-time configuration for the {@link ValidationModule}. Optional fields are added as the
 * features that consume them land; in this phase only `throwOn` is wired.
 */
export interface DevValidationOptions {
    /**
     * Makes matching diagnostics throw synchronously after logging, so e2e/agent test runs fail
     * loudly. Inclusive threshold: `'error'` throws on errors only; `'warning'` on warnings and
     * errors; `'deprecation'` on deprecations, warnings and errors. Default `false`.
     */
    throwOn?: 'error' | 'warning' | 'deprecation' | false;
}

const config: Required<DevValidationOptions> = {
    throwOn: false,
};

/**
 * Stores the supplied options and pushes the resulting diagnostic configuration into the logging
 * layer. Always enables capture, since reaching here means the ValidationModule is active.
 */
export function _applyDevValidationConfig(options?: DevValidationOptions): void {
    if (options?.throwOn !== undefined) {
        config.throwOn = options.throwOn;
    }
    _configureDiagnostics({ capture: true, throwOn: config.throwOn });
}

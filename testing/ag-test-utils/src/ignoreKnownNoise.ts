// The known-harmless thing a grid under test writes to the console on almost every file. Filtered at its
// own source and forwarding everything else untouched, so a real error is never swallowed.

/**
 * The filter currently on `console.error`, compared by identity rather than by a marker property:
 * `vi.spyOn` copies the spied function's own properties onto the spy, so a spy installed over the filter
 * would carry the marker and we would skip re-wrapping — letting the licence box through to that spy.
 */
let installedFilter: typeof console.error | undefined;

/** Drops the AG Grid Enterprise licence box. Re-callable: a test's `spyOn`/`mockRestore` displaces the filter. */
export function ignoreConsoleLicenseKeyError(): void {
    if (console.error === installedFilter) {
        return;
    }

    const wrapped = console.error;
    const consoleErrorImpl = (...args: unknown[]): void => {
        if (
            args.length === 1 &&
            typeof args[0] === 'string' &&
            args[0].startsWith('*') &&
            args[0].endsWith('*') &&
            args[0].length === 124
        ) {
            return; // AG Grid license box line
        }
        wrapped.apply(console, args);
    };
    installedFilter = consoleErrorImpl;
    console.error = consoleErrorImpl;
}

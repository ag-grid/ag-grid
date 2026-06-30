/** Tags the patched `console.error` so we re-install (not double-wrap) — `mockRestore` in other tests can wipe it. */
const LICENSE_FILTER_TAG = '__agIgnoresLicenseKeyError';

export function ignoreConsoleLicenseKeyError() {
    const current = console.error as { [LICENSE_FILTER_TAG]?: boolean };
    if (current[LICENSE_FILTER_TAG]) {
        return; // filter already installed on the current console.error
    }

    // Re-wrap whatever console.error is now (a prior `spyOn(...).mockRestore()` may have removed our patch).
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
    (consoleErrorImpl as { [LICENSE_FILTER_TAG]?: boolean })[LICENSE_FILTER_TAG] = true;
    console.error = consoleErrorImpl;
}

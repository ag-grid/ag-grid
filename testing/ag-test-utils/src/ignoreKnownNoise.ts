// The known-harmless thing a grid under test writes to the console on almost every file. Filtered at its
// own source and forwarding everything else untouched, so a real error is never swallowed.

/** By identity, not a marker (`vi.spyOn` copies it onto a spy); all of them, as a spy's restore puts back an older
 *  filter that must not be wrapped again. */
const filters = new WeakSet<typeof console.error>();

/** Drops the AG Grid Enterprise licence box. Re-callable: a test's `spyOn`/`mockRestore` displaces the filter. */
export function ignoreConsoleLicenseKeyError(): void {
    if (filters.has(console.error)) {
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
    filters.add(consoleErrorImpl);
    console.error = consoleErrorImpl;
}

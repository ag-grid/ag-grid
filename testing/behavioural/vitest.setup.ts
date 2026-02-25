import * as jestDomMatchers from '@testing-library/jest-dom/matchers';
import { afterAll, expect, vitest } from 'vitest';

// Register all jest-dom matchers, then override toHaveValue with our custom version below.
expect.extend(jestDomMatchers);

// Shim for code that references `jest` — redirect to vitest.
(globalThis as Record<string, unknown>).jest = vitest;

// Ensure stack traces are long enough to be useful.
if (Error.stackTraceLimit < 40) {
    Error.stackTraceLimit = 40;
}

// --- GridRows snapshot update mode -------------------------------------------
//
// When UPDATE_GRID_ROWS_SNAPSHOTS is set, GridRows.check() records mismatches
// instead of failing. After each test suite, the recorded mismatches are used
// to rewrite the source files via TypeScript AST-based replacement.
//
// Usage:
//   UPDATE_GRID_ROWS_SNAPSHOTS=1 ./behave.sh        # update all
//   UPDATE_GRID_ROWS_SNAPSHOTS=dry ./behave.sh       # dry-run, show what would change
//   ./behave.sh --update-grid-rows                    # convenience alias

{
    const envVal = process.env.UPDATE_GRID_ROWS_SNAPSHOTS;
    if (envVal) {
        const mode = envVal === 'dry' ? 'dry' : 'update';
        (globalThis as any).__gridRowsSnapshotUpdateMode = mode;
        (globalThis as any).__gridRowsSnapshotUpdates = [];

        afterAll(async () => {
            const { processSnapshotUpdates } = await import('./src/test-utils/gridRows/snapshot-updater');
            await processSnapshotUpdates(expect.getState().testPath ?? undefined);
        });
    }
}

// --- Custom toHaveValue matcher ---------------------------------------------
//
// The standard @testing-library/jest-dom `toHaveValue` doesn't handle:
//   - checkbox/radio — throws instead of comparing `.checked`
//   - number/range   — compares `.value` (string) instead of `.valueAsNumber`
//   - date inputs    — compares `.value` (string) instead of `.valueAsDate`

type MatcherThis = ReturnType<typeof expect.getState>;
type MatcherResult = { pass: boolean; actual?: unknown; expected?: unknown; message: () => string };

// jest-dom types expose toHaveValue only as an augmented interface method (returns void),
// but at runtime it is a raw matcher function — cast it accordingly.
type RawMatcherFn = (this: MatcherThis, element: HTMLElement, expected?: unknown) => MatcherResult;
const jestDomToHaveValue = jestDomMatchers.toHaveValue as unknown as RawMatcherFn;

function customToHaveValue(this: MatcherThis, received: HTMLElement, expected: unknown): MatcherResult {
    const tag = received?.tagName?.toLowerCase();
    const type = (received as HTMLInputElement)?.type;
    const notHint = this.isNot ? 'not ' : '';

    if (tag === 'input') {
        const input = received as HTMLInputElement;

        if (type === 'checkbox' || type === 'radio') {
            const actual = input.checked;
            const pass = actual === expected;
            return {
                pass,
                actual,
                expected,
                message: () =>
                    `Expected ${tag}[type=${type}] .checked ${notHint}to be ${String(expected)}, got ${String(actual)}`,
            };
        }

        if (type === 'number' || type === 'range') {
            const actual = input.valueAsNumber;
            const exp = typeof expected === 'string' ? parseFloat(expected) : (expected as number | null | undefined);
            const pass = exp == null ? isNaN(actual) : isNaN(exp as number) ? isNaN(actual) : actual === exp;
            return {
                pass,
                actual,
                expected: exp,
                message: () =>
                    `Expected ${tag}[type=${type}] .valueAsNumber ${notHint}to be ${String(exp)}, got ${String(actual)}`,
            };
        }

        if (type === 'date' || type === 'datetime-local' || type === 'time') {
            const actual = input.valueAsDate;
            const exp = expected instanceof Date ? expected : expected != null ? new Date(expected as string) : null;
            const pass = actual?.getTime() === exp?.getTime();
            return {
                pass,
                actual: actual?.toISOString() ?? null,
                expected: exp?.toISOString() ?? null,
                message: () =>
                    `Expected ${tag}[type=${type}] .valueAsDate ${notHint}to be ${String(exp)}, got ${String(actual)}`,
            };
        }
    }

    // Fall through to the standard jest-dom matcher for text inputs, selects, textareas, etc.
    return jestDomToHaveValue.call(this, received, expected);
}

expect.extend({ toHaveValue: customToHaveValue });

// Some test files do `import '@testing-library/jest-dom'` which calls expect.extend() as a
// side-effect and would overwrite customToHaveValue.  Patch extend() so our version always wins.
const _extend = expect.extend.bind(expect);
expect.extend = (matchers) => {
    _extend(matchers);
    if ('toHaveValue' in matchers) {
        _extend({ toHaveValue: customToHaveValue });
    }
};

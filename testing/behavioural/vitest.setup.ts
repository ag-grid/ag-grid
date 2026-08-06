import * as jestDomMatchers from '@testing-library/jest-dom/matchers';
import { afterAll, beforeEach, expect, vitest } from 'vitest';

// Imported from the specific module, not the test-utils barrel: the barrel transitively imports
// `ag-grid-community` at runtime, which would defeat the lazy `ag`-import guard below. This module is
// type-only besides the constant, so it pulls in nothing at runtime.
import { ALL_SEVERITIES } from './src/test-utils/dev-validations';
import { ignoreConsoleLicenseKeyError } from './src/test-utils/ignoreConsoleLicenseKeyError';

// Register all jest-dom matchers globally.
expect.extend(jestDomMatchers);

// Dogfood the dev-validation throw mode: a misconfigured grid under test (a deprecation, warning or
// error diagnostic) fails the test loudly instead of scrolling past in the console. Re-asserted each
// test because the throw config is global, last-write-wins module state. A test that deliberately
// exercises a diagnostic opts out with a local `enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [id] })`.
//
// `ag-grid-community` is imported lazily (not at module top level) so this setup file does not pull the
// grid in before a test file's own pre-`ag`-import ordering guards have run (e.g. style-injection).
beforeEach(async () => {
    const { enableDevValidations } = await import('ag-grid-community');
    enableDevValidations({ throwOn: ALL_SEVERITIES });
    ignoreConsoleLicenseKeyError();
});

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
    // `process` is absent in browser mode (BENCH_BROWSER); snapshot updating is node-only anyway.
    const envVal = typeof process !== 'undefined' ? process.env.UPDATE_GRID_ROWS_SNAPSHOTS : undefined;
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

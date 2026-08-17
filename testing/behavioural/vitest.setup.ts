import * as jestDomMatchers from '@testing-library/jest-dom/matchers';
// `ALL_SEVERITIES` comes from the specific module, not the test-utils barrel: the barrel transitively
// imports `ag-grid-community` at runtime, which would defeat the lazy `ag`-import guard below.
import { ALL_SEVERITIES } from 'ag-test-utils/dev-validations';
import { ignoreConsoleLicenseKeyError } from 'ag-test-utils/ignoreKnownNoise';
import { polyfillDomGlobals } from 'ag-test-utils/polyfills/domGlobals';
import { afterAll, beforeEach, expect, vitest } from 'vitest';

// Output-volume controls (--no-diff, --stack-trace-len, DEBUG_PRINT_LIMIT) shared with every unit project.
import '../shared/vitest/output.setup';

// Register all jest-dom matchers globally.
expect.extend(jestDomMatchers);

polyfillDomGlobals();

// A misconfigured grid under test fails loudly rather than scrolling past in the console. Re-asserted each
// test because the throw config is global, last-write-wins module state; a test exercising a diagnostic
// opts out with its own `enableDevValidations({ suppress: [id] })`. Imported lazily so this file does not
// pull the grid in before a test's own pre-`ag`-import ordering guards have run.
beforeEach(async () => {
    const { enableDevValidations } = await import('ag-grid-community');
    enableDevValidations({ throwOn: ALL_SEVERITIES });
    ignoreConsoleLicenseKeyError();
});

// Shim for code that references `jest` — redirect to vitest.
(globalThis as Record<string, unknown>).jest = vitest;

// Under UPDATE_GRID_ROWS_SNAPSHOTS (`./behave.sh --update-grid-rows[=dry]`), GridRows.check() records
// mismatches instead of failing and the suite rewrites its own sources from them afterwards.

{
    // `process` is absent in browser mode (BENCH_BROWSER); snapshot updating is node-only anyway.
    const envVal = typeof process !== 'undefined' ? process.env.UPDATE_GRID_ROWS_SNAPSHOTS : undefined;
    if (envVal) {
        const mode = envVal === 'dry' ? 'dry' : 'update';
        (globalThis as any).__gridRowsSnapshotUpdateMode = mode;
        (globalThis as any).__gridRowsSnapshotUpdates = [];

        afterAll(async () => {
            const { processSnapshotUpdates } = await import('ag-test-utils/gridRows/snapshot-updater');
            await processSnapshotUpdates(expect.getState().testPath ?? undefined);
        });
    }
}

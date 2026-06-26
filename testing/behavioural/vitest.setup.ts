import * as jestDomMatchers from '@testing-library/jest-dom/matchers';
import { afterAll, expect, vitest } from 'vitest';

// Register all jest-dom matchers globally.
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

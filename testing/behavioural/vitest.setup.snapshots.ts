// GridRows snapshot update mode, added to `setupFiles` only when UPDATE_GRID_ROWS_SNAPSHOTS is set:
//
//   UPDATE_GRID_ROWS_SNAPSHOTS=1 ./behave.sh        # update all
//   UPDATE_GRID_ROWS_SNAPSHOTS=dry ./behave.sh      # dry-run, show what would change
//   ./behave.sh --update-grid-rows                  # convenience alias
//
// GridRows.check() records mismatches instead of failing, and the recorded ones rewrite the source files
// through a TypeScript AST replacement afterwards.
import { afterAll, expect } from 'vitest';

const mode = process.env.UPDATE_GRID_ROWS_SNAPSHOTS === 'dry' ? 'dry' : 'update';
(globalThis as any).__gridRowsSnapshotUpdateMode = mode;
(globalThis as any).__gridRowsSnapshotUpdates = [];

afterAll(async () => {
    const { processSnapshotUpdates } = await import('ag-test-utils/gridRows/snapshot-updater');
    await processSnapshotUpdates(expect.getState().testPath ?? undefined);
});

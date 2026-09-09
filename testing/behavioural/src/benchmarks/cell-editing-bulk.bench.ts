import { clipboardUtils } from 'ag-test-utils/polyfills/clipboard';
import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, EventApiModule, TextEditorModule } from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, ClipboardModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchDefaults } from './bench-utils';

const modules = [
    ClientSideRowModelModule,
    EventApiModule,
    TextEditorModule,
    ClipboardModule,
    CellSelectionModule,
    BatchEditModule,
];

const COLS = 10;
const GRID_ROWS = 300;
// Pre-staged edits (for the "already pending" bench) live below the pasted rows so they never overlap.
const PRELOAD_START_ROW = 100;
const PRELOAD_ROWS = 200;

const colIds: string[] = [];
const columnDefs: ColDef[] = [];
for (let c = 0; c < COLS; ++c) {
    const colId = `c${c}`;
    colIds.push(colId);
    columnDefs.push({ colId, field: colId, editable: true });
}

const gridOptions: GridOptions = {
    columnDefs,
    cellSelection: true,
    getRowId: ({ data }) => data.id,
};

const buildRowData = (): Record<string, string>[] => {
    const rows = new Array<Record<string, string>>(GRID_ROWS);
    for (let r = 0; r < GRID_ROWS; ++r) {
        const row: Record<string, string> = { id: `r${r}` };
        for (let c = 0; c < COLS; ++c) {
            row[colIds[c]] = `init${r}_${c}`;
        }
        rows[r] = row;
    }
    return rows;
};

// A tab/newline block of `rows`×COLS values, tagged so consecutive pastes differ (no no-op skips).
const buildBlock = (rows: number, tag: string): string => {
    const lines = new Array<string>(rows);
    for (let r = 0; r < rows; ++r) {
        const cells = new Array<string>(COLS);
        for (let c = 0; c < COLS; ++c) {
            cells[c] = `${tag}${r}_${c}`;
        }
        lines[r] = cells.join('\t');
    }
    return lines.join('\n');
};

// Local, dependency-free pasteEnd wait: the shared waitForEvent pulls in node-only test utils that
// aren't available in the real-browser bench environment.
const waitPasteEnd = (api: GridApi): Promise<void> =>
    new Promise((resolve) => {
        const listener = () => {
            api.removeEventListener('pasteEnd', listener);
            resolve();
        };
        api.addEventListener('pasteEnd', listener);
    });

const pasteBlock = async (api: GridApi, block: string, startRow: number): Promise<void> => {
    clipboardUtils.setText(block);
    api.setFocusedCell(startRow, colIds[0]);
    const done = waitPasteEnd(api);
    api.pasteFromClipboard();
    await done;
    // Flush the deferred (rAF) render so each iteration captures its own paste + render synchronously,
    // instead of leaking it into the next iteration as an outlier spike.
    api.flushAllAnimationFrames();
};

let gridSeq = 0;

suite(`cell editing — batch paste (${GRID_ROWS} rows × ${COLS} cols)`, () => {
    // `preloadRows > 0` pre-stages preloadRows×COLS pending edits before measuring, exercising the
    // session-degradation case (on `latest`, per-cell cost scales with total pending edits).
    const benchPaste = (name: string, blockRows: number, batch: boolean, preloadRows = 0): void => {
        const id = `EP${++gridSeq}`;
        const gridsManager = new BenchGridsManager({ modules });
        const blockA = buildBlock(blockRows, 'A');
        const blockB = buildBlock(blockRows, 'B');
        const preload = preloadRows > 0 ? buildBlock(preloadRows, 'P') : null;
        let api!: GridApi;
        let toggle = false;

        bench(
            name,
            async () => {
                toggle = !toggle;
                await pasteBlock(api, toggle ? blockA : blockB, 0);
            },
            {
                ...benchDefaults({ noiseFactor: 2 }),
                setup: async () => {
                    await gridsManager.reset();
                    clipboardUtils.init();
                    api = gridsManager.createGrid(id, { ...gridOptions, rowData: buildRowData() });
                    if (batch) {
                        api.startBatchEdit();
                    }
                    if (preload) {
                        await pasteBlock(api, preload, PRELOAD_START_ROW);
                    }
                    toggle = false;
                },
            }
        );
    };

    // Single paste, empty session — 20×10 vs 80×10 (4× cells) reads the per-paste scaling.
    benchPaste('batch paste 200 cells', 20, true);
    benchPaste('batch paste 800 cells', 80, true);

    // Same 200-cell paste, but 2000 edits are already staged — the session-degradation case.
    benchPaste('batch paste 200 cells (2000 already pending)', 20, true, PRELOAD_ROWS);

    // Non-batch paste writes straight to row data (no pending session): a baseline control.
    benchPaste('paste 800 cells (non-batch control)', 80, false);
});

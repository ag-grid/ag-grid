// Cell-range-selection benchmark: the cost of one range change over a full viewport of cells.
//
// A range change dispatches `cellSelectionChanged` and every rendered cell refreshes its own range
// classes and borders, so one measured iteration is the work behind one frame of a mouse drag — the
// number to read against the ~16ms frame budget.
//
// Column virtualisation is suppressed and rowHeight is small, so the fixed 100vh viewport holds as
// many cells as possible: the wide drag users notice.
import { suite } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

import { BenchGridsManager, benchAlternating } from './bench-utils';

const modules = [ClientSideRowModelModule, CellSelectionModule];

const COL_COUNT = 40;
const ROW_COUNT = 500;

interface Row {
    [key: string]: string;
}

const buildCols = (): ColDef[] => {
    const cols: ColDef[] = [];
    for (let i = 0; i < COL_COUNT; ++i) {
        cols.push({ colId: `c${i}`, field: `c${i}`, width: 100 });
    }
    return cols;
};

const buildData = (): Row[] => {
    const rows: Row[] = [];
    for (let r = 0; r < ROW_COUNT; ++r) {
        const row: Row = {};
        for (let c = 0; c < COL_COUNT; ++c) {
            row[`c${c}`] = `r${r}c${c}`;
        }
        rows.push(row);
    }
    return rows;
};

const gridOptions: GridOptions = {
    columnDefs: buildCols(),
    rowHeight: 20,
    suppressColumnVirtualisation: true,
    cellSelection: { handle: { mode: 'range' } },
};

const data = buildData();

/** Replace the selection with a single range spanning `colSpan` columns down to `rowEnd`. */
const selectRange = (api: GridApi, colSpan: number, rowEnd: number): void => {
    api.clearCellSelection();
    api.addCellRange({
        rowStartIndex: 0,
        rowEndIndex: rowEnd,
        columnStart: 'c0',
        columnEnd: `c${colSpan - 1}`,
    });
};

/** Replace the selection with `count` adjacent single-column ranges, each `rowEnd` rows tall. */
const selectManyRanges = (api: GridApi, count: number, rowEnd: number): void => {
    api.clearCellSelection();
    for (let i = 0; i < count; ++i) {
        api.addCellRange({
            rowStartIndex: 0,
            rowEndIndex: rowEnd,
            columnStart: `c${i}`,
            columnEnd: `c${i}`,
        });
    }
};

// One range, wide: the common drag. Alternating between a 40-column and a 39-column span is the
// shape of a drag frame that crosses a column boundary — the selection changes by one column and
// every rendered cell is re-tested.
suite('cell range selection: extend wide range', () => {
    const gridsManager = new BenchGridsManager({ modules });
    benchAlternating(
        gridsManager,
        `${COL_COUNT} cols x ${ROW_COUNT} rows`,
        gridOptions,
        data,
        (api) => selectRange(api, COL_COUNT, ROW_COUNT - 1),
        (api) => selectRange(api, COL_COUNT - 1, ROW_COUNT - 1),
        2
    );
});

// One range, narrow: isolates the fixed per-cell overhead (border/chart-range/CSS work) from the
// column-list scan, so a membership-cost change shows up as a gap between this and the wide suite.
suite('cell range selection: extend narrow range', () => {
    const gridsManager = new BenchGridsManager({ modules });
    benchAlternating(
        gridsManager,
        `2 cols x ${ROW_COUNT} rows`,
        gridOptions,
        data,
        (api) => selectRange(api, 2, ROW_COUNT - 1),
        (api) => selectRange(api, 2, ROW_COUNT - 2),
        2
    );
});

// Rebuilding a multi-range selection: clearing and re-adding 20 ranges is 21 dispatches, so this
// case measures the cost of restoring a saved multi-range selection, NOT a single drag frame.
suite('cell range selection: rebuild many ranges', () => {
    const gridsManager = new BenchGridsManager({ modules });
    benchAlternating(
        gridsManager,
        `20 ranges x ${ROW_COUNT} rows (21 dispatches)`,
        gridOptions,
        data,
        (api) => selectManyRanges(api, 20, ROW_COUNT - 1),
        (api) => selectManyRanges(api, 20, ROW_COUNT - 2),
        2
    );
});

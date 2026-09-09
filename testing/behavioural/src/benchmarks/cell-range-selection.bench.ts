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

const selectRange = (api: GridApi, colSpan: number, rowEnd: number): void => {
    api.clearCellSelection();
    api.addCellRange({
        rowStartIndex: 0,
        rowEndIndex: rowEnd,
        columnStart: 'c0',
        columnEnd: `c${colSpan - 1}`,
    });
};

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

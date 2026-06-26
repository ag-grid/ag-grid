/**
 * Narrow pivot transaction-update benchmark. Three suites with identical data and transaction sizes:
 *   - pivot ON, no row totals
 *   - pivot ON + pivotRowTotals: 'before'
 *   - pivot OFF (control)
 *
 * Run with: ./benches.sh "pivot-transaction"
 */
import { suite } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { buildValueEdits } from './bench-data';
import { BenchGridsManager, SimplePRNG, benchAlternating } from './bench-utils';

const ROW_COUNT = 2_000;
const VALUE_COL_COUNT = 30; // 10x scale-up — directly hits PivotStage hot path
const PIVOT_VALUES = 8; // 2x — pivot result cols = 240 (20x scale)
const UPDATE_FRACTION = 0.05;
const PIVOT_MAX_GENERATED_COLUMNS = 500;

interface Row {
    id: string;
    group1: string;
    year: string;
    [key: string]: string | number;
}

function buildData(count: number, seed = 0xc1d2e3f4): Row[] {
    const prng = new SimplePRNG(seed);
    const g1 = ['Dept A', 'Dept B', 'Dept C', 'Dept D', 'Dept E'];
    const years = Array.from({ length: PIVOT_VALUES }, (_, i) => `pv${String(i).padStart(3, '0')}`);
    const rows = new Array<Row>(count);
    for (let i = 0; i < count; ++i) {
        const row: Row = { id: `r${i}`, group1: prng.pick(g1)!, year: prng.pick(years)! };
        for (let v = 0; v < VALUE_COL_COUNT; ++v) {
            row[`v${v}`] = prng.nextFloat(1, 1000);
        }
        rows[i] = row;
    }
    return rows;
}

const modules = [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule, PivotModule];
const gridsManager = new BenchGridsManager({ modules });

const data = buildData(ROW_COUNT);
const edits = buildValueEdits(data, VALUE_COL_COUNT, UPDATE_FRACTION, 0xa5b6c7d8);
const updateCount = Math.floor(ROW_COUNT * UPDATE_FRACTION);

const applyForward = (api: GridApi) => api.applyTransaction({ update: edits.forward });
const applyReverse = (api: GridApi) => api.applyTransaction({ update: edits.reverse });

const valueCols = (visible: boolean) =>
    Array.from({ length: VALUE_COL_COUNT }, (_, v) => ({
        field: `v${v}`,
        ...(visible ? {} : { aggFunc: 'sum', hide: true }),
    }));

const pivotColumnDefs: ColDef[] = [
    { field: 'group1', rowGroup: true, hide: true },
    { field: 'year', pivot: true, hide: true },
    ...valueCols(false),
];

const flatColumnDefs: ColDef[] = [{ field: 'group1' }, { field: 'year' }, ...valueCols(true)];

const pivotOptions: GridOptions = {
    columnDefs: pivotColumnDefs,
    pivotMode: true,
    pivotMaxGeneratedColumns: PIVOT_MAX_GENERATED_COLUMNS,
    autoGroupColumnDef: { headerName: 'Group' },
    groupDefaultExpanded: -1,
    suppressAggFuncInHeader: true,
    getRowId: ({ data: row }: { data: { id: string } }) => row.id,
};

const flatOptions: GridOptions = {
    columnDefs: flatColumnDefs,
    getRowId: ({ data: row }: { data: { id: string } }) => row.id,
};

const pivotRowTotalsOptions: GridOptions = { ...pivotOptions, pivotRowTotals: 'before' };

suite(
    `pivot ON — ${ROW_COUNT} rows, ${VALUE_COL_COUNT * PIVOT_VALUES} result cols, ${updateCount} updated rows`,
    () => {
        benchAlternating(gridsManager, 'transaction update', pivotOptions, data, applyForward, applyReverse, 0.6);
    }
);

suite(`pivot ON + pivotRowTotals — ${ROW_COUNT} rows, ${updateCount} updated rows`, () => {
    benchAlternating(
        gridsManager,
        'transaction update (pivotRowTotals: before)',
        pivotRowTotalsOptions,
        data,
        applyForward,
        applyReverse,
        0.5
    );
});

suite(`pivot OFF — ${ROW_COUNT} rows, ${updateCount} updated rows`, () => {
    benchAlternating(gridsManager, 'transaction update', flatOptions, data, applyForward, applyReverse, 2);
});

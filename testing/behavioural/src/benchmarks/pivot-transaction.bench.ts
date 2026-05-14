/**
 * Narrow pivot transaction-update benchmark.
 *
 * Three suites with identical data shape and transaction sizes:
 *   - pivot ON, no row totals
 *   - pivot ON + pivotRowTotals: 'before'
 *   - pivot OFF (control)
 *
 * Run with: ./benches.sh "pivot-transaction"
 */
import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { SimplePRNG, TestGridsManager } from '../test-utils';

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

function buildData(count: number, prng = new SimplePRNG(0xc1d2e3f4)): Row[] {
    const g1 = ['Dept A', 'Dept B', 'Dept C', 'Dept D', 'Dept E'];
    const years = Array.from({ length: PIVOT_VALUES }, (_, i) => `pv${String(i).padStart(3, '0')}`);
    const rows: Row[] = [];
    for (let i = 0; i < count; ++i) {
        const row: Row = {
            id: `r${i}`,
            group1: prng.pick(g1)!,
            year: prng.pick(years)!,
        };
        for (let v = 0; v < VALUE_COL_COUNT; ++v) {
            row[`v${v}`] = prng.nextFloat(1, 1000);
        }
        rows.push(row);
    }
    return rows;
}

function buildEdits(rows: Row[], prng = new SimplePRNG(0xa5b6c7d8)) {
    const forward: Row[] = [];
    const reverse: Row[] = [];
    const changeCount = Math.floor(rows.length * UPDATE_FRACTION);
    const indices = new Set<number>();
    while (indices.size < changeCount) {
        indices.add(prng.nextInt(0, rows.length - 1));
    }
    for (const idx of indices) {
        const original = rows[idx];
        const modified = { ...original };
        for (let v = 0; v < VALUE_COL_COUNT; ++v) {
            modified[`v${v}`] = (modified[`v${v}`] as number) * prng.nextFloat(0.5, 1.5);
        }
        forward.push(modified);
        reverse.push(original);
    }
    return { forward, reverse };
}

const data = buildData(ROW_COUNT);
const edits = buildEdits(data);
const updateCount = Math.floor(ROW_COUNT * UPDATE_FRACTION);

const modules = [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule, PivotModule];

const pivotColumnDefs: ColDef[] = [
    { field: 'group1', rowGroup: true, hide: true },
    { field: 'year', pivot: true, hide: true },
    ...Array.from({ length: VALUE_COL_COUNT }, (_, v) => ({ field: `v${v}`, aggFunc: 'sum', hide: true })),
];

const flatColumnDefs: ColDef[] = [
    { field: 'group1' },
    { field: 'year' },
    ...Array.from({ length: VALUE_COL_COUNT }, (_, v) => ({ field: `v${v}` })),
];

const pivotOptions: GridOptions = {
    columnDefs: pivotColumnDefs,
    pivotMode: true,
    pivotMaxGeneratedColumns: PIVOT_MAX_GENERATED_COLUMNS,
    autoGroupColumnDef: { headerName: 'Group' },
    groupDefaultExpanded: -1,
    suppressAggFuncInHeader: true,
    getRowId: ({ data }: { data: { id: string } }) => data.id,
};

const flatOptions: GridOptions = {
    columnDefs: flatColumnDefs,
    getRowId: ({ data }: { data: { id: string } }) => data.id,
};

const pivotRowTotalsOptions: GridOptions = {
    ...pivotOptions,
    pivotRowTotals: 'before',
};

const benchAlternating = (
    name: string,
    initOptions: GridOptions,
    forwardFn: (api: GridApi) => void,
    reverseFn: (api: GridApi) => void,
    initialData: Row[],
    idPrefix: string
) => {
    let counter = 0;
    const id = `${idPrefix}${++counter}`;
    const gridsManager = new TestGridsManager({ benchmark: true, modules });
    let api!: GridApi;
    let forward = true;

    bench(
        name,
        () => {
            if (forward) {
                forwardFn(api);
            } else {
                reverseFn(api);
            }
            forward = !forward;
        },
        {
            throws: true,
            setup: () => {
                gridsManager.reset();
                api = gridsManager.createGrid(id, { ...initOptions, rowData: initialData });
                forward = true;
            },
        }
    );
};

suite(
    `pivot ON — ${ROW_COUNT} rows, ${VALUE_COL_COUNT * PIVOT_VALUES} result cols, ${updateCount} updated rows`,
    () => {
        benchAlternating(
            'transaction update',
            pivotOptions,
            (api) => api.applyTransaction({ update: edits.forward }),
            (api) => api.applyTransaction({ update: edits.reverse }),
            data,
            'PIV'
        );
    }
);

suite(`pivot ON + pivotRowTotals — ${ROW_COUNT} rows, ${updateCount} updated rows`, () => {
    benchAlternating(
        'transaction update (pivotRowTotals: before)',
        pivotRowTotalsOptions,
        (api) => api.applyTransaction({ update: edits.forward }),
        (api) => api.applyTransaction({ update: edits.reverse }),
        data,
        'PIVRT'
    );
});

suite(`pivot OFF — ${ROW_COUNT} rows, ${updateCount} updated rows`, () => {
    benchAlternating(
        'transaction update',
        flatOptions,
        (api) => api.applyTransaction({ update: edits.forward }),
        (api) => api.applyTransaction({ update: edits.reverse }),
        data,
        'FLAT'
    );
});

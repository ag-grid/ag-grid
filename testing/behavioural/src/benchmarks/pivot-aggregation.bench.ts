/**
 * Pivot aggregation benchmark — pivot aggregation performance with real grid instances. Each bench
 * alternates two data sets (A/B), so every iteration does real work (the immutable path always
 * detects a change). Suites: baseline (12 result cols), pivotComparator overhead, and
 * high-cardinality (999 result cols, near the 1000-col limit).
 *
 * Run with: ./benches.sh "pivot-aggregation"
 */
import { suite } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { buildValueEdits, buildValuePartialUpdate } from './bench-data';
import { BenchGridsManager, SimplePRNG, benchAlternating } from './bench-utils';

const ROW_COUNT = 10_000;
const VALUE_COL_COUNT = 3;
const PIVOT_VALUES = 4; // years: 2020–2023
const UPDATE_FRACTION = 0.05;

interface PivotRow {
    id: string;
    group1: string;
    group2: string;
    year: string;
    [key: string]: string | number;
}

function buildPivotData(count: number, seed = 0xb4d5e6f7): PivotRow[] {
    const prng = new SimplePRNG(seed);
    const g1 = ['Dept A', 'Dept B', 'Dept C', 'Dept D', 'Dept E'];
    const g2 = ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'];
    const years = ['2020', '2021', '2022', '2023'];
    const rows = new Array<PivotRow>(count);
    for (let i = 0; i < count; ++i) {
        const row: PivotRow = { id: `p${i}`, group1: prng.pick(g1)!, group2: prng.pick(g2)!, year: prng.pick(years)! };
        for (let v = 0; v < VALUE_COL_COUNT; ++v) {
            row[`v${v}`] = prng.nextFloat(1, 1000);
        }
        rows[i] = row;
    }
    return rows;
}

function pivotColumnDefs(withComparator: boolean): ColDef[] {
    const yearCol: ColDef = { field: 'year', pivot: true, hide: true };
    if (withComparator) {
        yearCol.pivotComparator = (a, b) => a.localeCompare(b);
    }
    const defs: ColDef[] = [
        { field: 'group1', rowGroup: true, hide: true },
        { field: 'group2', rowGroup: true, hide: true },
        yearCol,
    ];
    for (let v = 0; v < VALUE_COL_COUNT; ++v) {
        defs.push({ field: `v${v}`, aggFunc: 'sum', hide: true });
    }
    return defs;
}

// High-cardinality: 333 unique pivot values × 3 value cols = 999 result cols. Transactions only touch
// value cols, so unique pivot values never change — computePivotOrder runs every iteration but never
// rebuilds, isolating its detection overhead at scale.
const HIGH_CARDINALITY_PIVOT_VALUES = 333;

interface HighCardinalityRow {
    id: string;
    group1: string;
    pivot: string;
    [key: string]: string | number;
}

function buildHighCardinalityData(count: number, seed = 0xe7f8a9b0): HighCardinalityRow[] {
    const prng = new SimplePRNG(seed);
    const g1 = ['Dept A', 'Dept B', 'Dept C', 'Dept D', 'Dept E'];
    const pivotValues = Array.from(
        { length: HIGH_CARDINALITY_PIVOT_VALUES },
        (_, i) => `pv${String(i).padStart(3, '0')}`
    );
    const rows = new Array<HighCardinalityRow>(count);
    for (let i = 0; i < count; ++i) {
        const row: HighCardinalityRow = { id: `h${i}`, group1: prng.pick(g1)!, pivot: prng.pick(pivotValues)! };
        for (let v = 0; v < VALUE_COL_COUNT; ++v) {
            row[`v${v}`] = prng.nextFloat(1, 1000);
        }
        rows[i] = row;
    }
    return rows;
}

function highCardinalityColumnDefs(withComparator: boolean): ColDef[] {
    const pivotCol: ColDef = { field: 'pivot', pivot: true, hide: true };
    if (withComparator) {
        pivotCol.pivotComparator = (a: string, b: string) => a.localeCompare(b);
    }
    const defs: ColDef[] = [{ field: 'group1', rowGroup: true, hide: true }, pivotCol];
    for (let v = 0; v < VALUE_COL_COUNT; ++v) {
        defs.push({ field: `v${v}`, aggFunc: 'sum', hide: true });
    }
    return defs;
}

const modules = [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule, PivotModule];
const gridsManager = new BenchGridsManager({ modules });

const dataA = buildPivotData(ROW_COUNT);
const immutableB = buildValuePartialUpdate(dataA, VALUE_COL_COUNT, UPDATE_FRACTION, 0x3c4d5e6f);
const edits = buildValueEdits(dataA, VALUE_COL_COUNT, UPDATE_FRACTION, 0xd6f7a8b9);

const highCardinalityData = buildHighCardinalityData(ROW_COUNT);
const highCardinalityEdits = buildValueEdits(highCardinalityData, VALUE_COL_COUNT, UPDATE_FRACTION, 0xf8a9b0c1);

const resultCols = VALUE_COL_COUNT * PIVOT_VALUES;
const highCardinalityResultCols = HIGH_CARDINALITY_PIVOT_VALUES * VALUE_COL_COUNT;
const updateCount = Math.floor(ROW_COUNT * UPDATE_FRACTION);

const baseGridOptions: GridOptions = {
    pivotMode: true,
    autoGroupColumnDef: { headerName: 'Group' },
    groupDefaultExpanded: -1,
    suppressAggFuncInHeader: true,
    getRowId: ({ data }: { data: { id: string } }) => data.id,
};

const clearReload = (api: GridApi) => {
    api.setGridOption('rowData', []);
    api.setGridOption('rowData', dataA);
};

// Baseline and pivotComparator suites share structure: a full refresh (cold), immutable and
// transaction updates. The comparator variant adds a pivotComparator + strict order so
// computePivotOrder runs on every pipeline execution.
for (const withComparator of [false, true] as const) {
    const gridOptions: GridOptions = {
        ...baseGridOptions,
        columnDefs: pivotColumnDefs(withComparator),
        ...(withComparator ? { enableStrictPivotColumnOrder: true } : {}),
    };
    const descSuffix = `${ROW_COUNT} rows, ${resultCols} result cols, ${updateCount} updated rows`;
    const desc = withComparator
        ? `pivot aggregation with pivotComparator — ${descSuffix}`
        : `pivot aggregation — ${descSuffix}`;

    suite(desc, () => {
        benchAlternating(gridsManager, 'full refresh', gridOptions, [], clearReload, clearReload, 4);
        benchAlternating(
            gridsManager,
            `immutable update (${updateCount} rows)`,
            gridOptions,
            dataA,
            (api) => api.setGridOption('rowData', immutableB),
            (api) => api.setGridOption('rowData', dataA)
        );
        benchAlternating(
            gridsManager,
            `transaction update (${updateCount} rows)`,
            gridOptions,
            dataA,
            (api) => api.applyTransaction({ update: edits.forward }),
            (api) => api.applyTransaction({ update: edits.reverse })
        );
    });
}

for (const withComparator of [false, true] as const) {
    const gridOptions: GridOptions = {
        ...baseGridOptions,
        columnDefs: highCardinalityColumnDefs(withComparator),
        enableStrictPivotColumnOrder: true,
        pivotMaxGeneratedColumns: 1000,
    };
    const label = withComparator ? 'with pivotComparator' : 'no comparator (baseline)';

    suite(
        `high-cardinality pivot ${label} — ${ROW_COUNT} rows, ${highCardinalityResultCols} result cols, ${updateCount} updated rows`,
        () => {
            benchAlternating(
                gridsManager,
                `transaction update (${updateCount} rows)`,
                gridOptions,
                highCardinalityData,
                (api) => api.applyTransaction({ update: highCardinalityEdits.forward }),
                (api) => api.applyTransaction({ update: highCardinalityEdits.reverse })
            );
        }
    );
}

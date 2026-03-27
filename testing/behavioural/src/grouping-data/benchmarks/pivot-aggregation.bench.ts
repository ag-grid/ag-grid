/**
 * Pivot aggregation benchmark — measures pivot aggregation performance with real grid instances.
 *
 * Every iteration does real work by alternating between two distinct data sets (A/B),
 * ensuring the immutable-data path always detects changes and triggers a full pipeline run.
 *
 * Uses the same 2-level group structure (5 x 6 = 30 groups) as the grouping benchmark.
 * 3 value columns x 4 pivot values = 12 result columns.
 *
 * Run with:
 *   npx vitest bench --root testing/behavioural "pivot-aggregation.bench"
 */
import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { SimplePRNG, TestGridsManager } from '../../test-utils';

// ── Constants ────────────────────────────────────────────────────────────────

const ROW_COUNT = 10_000;
const VALUE_COL_COUNT = 3;
const PIVOT_VALUES = 4; // years: 2020–2023
const UPDATE_FRACTION = 0.05; // 5% of rows changed per update

// ── Data generation ─────────────────────────────────────────────────────────

interface PivotRow {
    id: string;
    group1: string;
    group2: string;
    year: string;
    [key: string]: string | number;
}

function buildPivotData(count: number, prng = new SimplePRNG(0xb4d5e6f7)): PivotRow[] {
    const g1 = ['Dept A', 'Dept B', 'Dept C', 'Dept D', 'Dept E'];
    const g2 = ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'];
    const years = ['2020', '2021', '2022', '2023'];
    const rows: PivotRow[] = [];
    for (let i = 0; i < count; ++i) {
        const row: PivotRow = {
            id: `p${i}`,
            group1: prng.pick(g1)!,
            group2: prng.pick(g2)!,
            year: prng.pick(years)!,
        };
        for (let v = 0; v < VALUE_COL_COUNT; ++v) {
            row[`v${v}`] = prng.nextFloat(1, 1000);
        }
        rows.push(row);
    }
    return rows;
}

/** Creates a partial update: UPDATE_FRACTION of rows get new value columns. */
function buildPartialUpdate(rows: PivotRow[], prng = new SimplePRNG(0xc5e6f7a8)): PivotRow[] {
    const updated = rows.slice();
    const changeCount = Math.floor(rows.length * UPDATE_FRACTION);
    const indices = new Set<number>();
    while (indices.size < changeCount) {
        indices.add(prng.nextInt(0, updated.length - 1));
    }
    for (const idx of indices) {
        const row = { ...updated[idx] };
        for (let v = 0; v < VALUE_COL_COUNT; ++v) {
            row[`v${v}`] = prng.nextFloat(1, 1000);
        }
        updated[idx] = row;
    }
    return updated;
}

/** Creates transaction edit arrays: forward (modified) and reverse (original). */
function buildEdits(rows: PivotRow[], prng = new SimplePRNG(0xd6f7a8b9)) {
    const forward: PivotRow[] = [];
    const reverse: PivotRow[] = [];
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

function buildPivotColumnDefs(): ColDef[] {
    const defs: ColDef[] = [
        { field: 'group1', rowGroup: true, hide: true },
        { field: 'group2', rowGroup: true, hide: true },
        { field: 'year', pivot: true, hide: true },
    ];
    for (let v = 0; v < VALUE_COL_COUNT; ++v) {
        defs.push({ field: `v${v}`, aggFunc: 'sum', hide: true });
    }
    return defs;
}

function buildPivotColumnDefsWithComparator(): ColDef[] {
    const defs: ColDef[] = [
        { field: 'group1', rowGroup: true, hide: true },
        { field: 'group2', rowGroup: true, hide: true },
        { field: 'year', pivot: true, hide: true, pivotComparator: (a, b) => a.localeCompare(b) },
    ];
    for (let v = 0; v < VALUE_COL_COUNT; ++v) {
        defs.push({ field: `v${v}`, aggFunc: 'sum', hide: true });
    }
    return defs;
}

// ── High-cardinality pivot data ───────────────────────────────────────────────
// 333 unique pivot values × 3 value columns = 999 result cols — near a 1000-col limit.
// Exercises computePivotOrder with 333 keys per pipeline run (worst-case overhead).

const HIGH_CARDINALITY_PIVOT_VALUES = 333;

interface HighCardinalityRow {
    id: string;
    group1: string;
    pivot: string;
    [key: string]: string | number;
}

function buildHighCardinalityData(count: number, prng = new SimplePRNG(0xe7f8a9b0)): HighCardinalityRow[] {
    const g1 = ['Dept A', 'Dept B', 'Dept C', 'Dept D', 'Dept E'];
    const pivotValues = Array.from(
        { length: HIGH_CARDINALITY_PIVOT_VALUES },
        (_, i) => `pv${String(i).padStart(3, '0')}`
    );
    const rows: HighCardinalityRow[] = [];
    for (let i = 0; i < count; ++i) {
        const row: HighCardinalityRow = {
            id: `h${i}`,
            group1: prng.pick(g1)!,
            pivot: prng.pick(pivotValues)!,
        };
        for (let v = 0; v < VALUE_COL_COUNT; ++v) {
            row[`v${v}`] = prng.nextFloat(1, 1000);
        }
        rows.push(row);
    }
    return rows;
}

function buildHighCardinalityEdits(rows: HighCardinalityRow[], prng = new SimplePRNG(0xf8a9b0c1)) {
    const forward: HighCardinalityRow[] = [];
    const reverse: HighCardinalityRow[] = [];
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

function buildHighCardinalityColumnDefs(withComparator: boolean): ColDef[] {
    const defs: ColDef[] = [
        { field: 'group1', rowGroup: true, hide: true },
        {
            field: 'pivot',
            pivot: true,
            hide: true,
            ...(withComparator ? { pivotComparator: (a: string, b: string) => a.localeCompare(b) } : {}),
        },
    ];
    for (let v = 0; v < VALUE_COL_COUNT; ++v) {
        defs.push({ field: `v${v}`, aggFunc: 'sum', hide: true });
    }
    return defs;
}

const highCardinalityData = buildHighCardinalityData(ROW_COUNT);
const highCardinalityEdits = buildHighCardinalityEdits(highCardinalityData);
const highCardinalityResultCols = HIGH_CARDINALITY_PIVOT_VALUES * VALUE_COL_COUNT;

// ── Pre-built data ───────────────────────────────────────────────────────────

const dataA = buildPivotData(ROW_COUNT);

// Immutable: alternating A → B → A → B ensures real changes every iteration
const immutableA = dataA;
const immutableB = buildPartialUpdate(dataA, new SimplePRNG(0x3c4d5e6f));

// Transaction edits: forward then reverse
const edits = buildEdits(dataA);

// ── Benchmarks ───────────────────────────────────────────────────────────────

const modules = [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule, PivotModule];
const resultCols = VALUE_COL_COUNT * PIVOT_VALUES;
const updateCount = Math.floor(ROW_COUNT * UPDATE_FRACTION);

const gridOptions: GridOptions = {
    columnDefs: buildPivotColumnDefs(),
    pivotMode: true,
    autoGroupColumnDef: { headerName: 'Group' },
    groupDefaultExpanded: -1,
    suppressAggFuncInHeader: true,
    getRowId: ({ data }: { data: { id: string } }) => data.id,
};

const desc = `pivot aggregation — ${ROW_COUNT} rows, ${resultCols} result cols, ${updateCount} updated rows`;

suite(desc, () => {
    let gridId = 0;

    const benchMode = (name: string, fn: (api: GridApi) => void, initialData: PivotRow[]) => {
        const id = `P${++gridId}`;
        const gridsManager = new TestGridsManager({ benchmark: true, modules });
        let api!: GridApi;

        bench(name, () => fn(api), {
            throws: true,
            setup: () => {
                gridsManager.reset();
                api = gridsManager.createGrid(id, { ...gridOptions, rowData: initialData });
            },
        });
    };

    // Full refresh: clear then reload
    benchMode(
        'full refresh',
        (api) => {
            api.setGridOption('rowData', []);
            api.setGridOption('rowData', dataA);
        },
        []
    );

    // Immutable update: 5% of rows changed, alternating A → B → A → B
    benchMode(
        `immutable update (${updateCount} rows)`,
        (api) => {
            api.setGridOption('rowData', immutableB);
            api.setGridOption('rowData', immutableA);
        },
        immutableA
    );

    // Transaction update: same 5% forward then reverse
    benchMode(
        `transaction update (${updateCount} rows)`,
        (api) => {
            api.applyTransaction({ update: edits.forward });
            api.applyTransaction({ update: edits.reverse });
        },
        dataA
    );
});

// ── pivotComparator overhead ─────────────────────────────────────────────────
// Measures the cost of computePivotOrder running on every pipeline execution
// when enableStrictPivotColumnOrder=true and a pivotComparator is present.
// Compare transaction update timings against the baseline suite above.

const gridOptionsWithComparator: GridOptions = {
    columnDefs: buildPivotColumnDefsWithComparator(),
    pivotMode: true,
    autoGroupColumnDef: { headerName: 'Group' },
    groupDefaultExpanded: -1,
    suppressAggFuncInHeader: true,
    enableStrictPivotColumnOrder: true,
    getRowId: ({ data }: { data: { id: string } }) => data.id,
};

const descComparator = `pivot aggregation with pivotComparator — ${ROW_COUNT} rows, ${resultCols} result cols, ${updateCount} updated rows`;

suite(descComparator, () => {
    let gridId = 0;

    const benchMode = (name: string, fn: (api: GridApi) => void, initialData: PivotRow[]) => {
        const id = `PC${++gridId}`;
        const gridsManager = new TestGridsManager({ benchmark: true, modules });
        let api!: GridApi;

        bench(name, () => fn(api), {
            throws: true,
            setup: () => {
                gridsManager.reset();
                api = gridsManager.createGrid(id, { ...gridOptionsWithComparator, rowData: initialData });
            },
        });
    };

    // Full refresh: cold path — pivot col defs rebuilt regardless, comparator overhead is minimal
    benchMode(
        'full refresh',
        (api) => {
            api.setGridOption('rowData', []);
            api.setGridOption('rowData', dataA);
        },
        []
    );

    // Immutable update: computePivotOrder runs on each iteration to detect comparator output changes
    benchMode(
        `immutable update (${updateCount} rows)`,
        (api) => {
            api.setGridOption('rowData', immutableB);
            api.setGridOption('rowData', immutableA);
        },
        immutableA
    );

    // Transaction update: hot path — computePivotOrder traverses uniqueValues on every transaction
    benchMode(
        `transaction update (${updateCount} rows)`,
        (api) => {
            api.applyTransaction({ update: edits.forward });
            api.applyTransaction({ update: edits.reverse });
        },
        dataA
    );
});

// ── High-cardinality pivot: baseline vs pivotComparator ───────────────────────
// 333 unique pivot values × 3 value cols = 999 result cols (near a 1000-col limit).
// Transactions only update value columns, so unique pivot values never change —
// computePivotOrder runs on every iteration but never triggers a rebuild.
// This isolates the detection overhead at scale.

for (const withComparator of [false, true] as const) {
    const hcOptions: GridOptions = {
        columnDefs: buildHighCardinalityColumnDefs(withComparator),
        pivotMode: true,
        autoGroupColumnDef: { headerName: 'Group' },
        groupDefaultExpanded: -1,
        suppressAggFuncInHeader: true,
        enableStrictPivotColumnOrder: true,
        pivotMaxGeneratedColumns: 1000,
        getRowId: ({ data }: { data: { id: string } }) => data.id,
    };

    const label = withComparator ? 'with pivotComparator' : 'no comparator (baseline)';
    const hcDesc = `high-cardinality pivot ${label} — ${ROW_COUNT} rows, ${highCardinalityResultCols} result cols, ${updateCount} updated rows`;

    suite(hcDesc, () => {
        let gridId = 0;
        const benchMode = (name: string, fn: (api: GridApi) => void, initialData: HighCardinalityRow[]) => {
            const id = `HC${withComparator ? 'C' : 'B'}${++gridId}`;
            const gridsManager = new TestGridsManager({ benchmark: true, modules });
            let api!: GridApi;
            bench(name, () => fn(api), {
                throws: true,
                setup: () => {
                    gridsManager.reset();
                    api = gridsManager.createGrid(id, { ...hcOptions, rowData: initialData });
                },
            });
        };

        benchMode(
            `transaction update (${updateCount} rows)`,
            (api) => {
                api.applyTransaction({ update: highCardinalityEdits.forward });
                api.applyTransaction({ update: highCardinalityEdits.reverse });
            },
            highCardinalityData
        );
    });
}

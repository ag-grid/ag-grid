/**
 * Grouping aggregation benchmark — measures aggregation performance with real grid instances.
 *
 * Every iteration does real work by alternating between two distinct data sets (A/B),
 * ensuring the immutable-data path always detects changes and triggers a full pipeline run.
 *
 * Uses 50 value columns with 3-level grouping (5 x 6 x 4 = 120 groups) to ensure
 * aggregation cost dominates pipeline overhead.
 *
 * Run with:
 *   npx vitest bench --root testing/behavioural "grouping-aggregation.bench"
 */
import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { SimplePRNG, TestGridsManager } from '../../test-utils';

// ── Constants ────────────────────────────────────────────────────────────────

const ROW_COUNT = 5_000;
const VALUE_COL_COUNT = 50;
const UPDATE_FRACTION = 0.05; // 5% of rows changed per update
const CHANGED_COL_COUNT = 5; // columns changed in "partial col" benchmarks

// Bench tuning: more warmup + longer measurement = more samples, less noise
const BENCH_TIME = 3000; // ms to measure (default 1000)
const BENCH_WARMUP_ITERATIONS = 10; // warmup iterations (default 5)

// ── Data generation ─────────────────────────────────────────────────────────

interface AggRow {
    id: string;
    group1: string;
    group2: string;
    group3: string;
    [key: string]: string | number;
}

function buildAggData(count: number, valueCols: number, prng = new SimplePRNG(0xa7c3d1e5)): AggRow[] {
    const g1 = ['Dept A', 'Dept B', 'Dept C', 'Dept D', 'Dept E'];
    const g2 = ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'];
    const g3 = ['Region W', 'Region X', 'Region Y', 'Region Z'];
    const rows: AggRow[] = [];
    for (let i = 0; i < count; ++i) {
        const row: AggRow = {
            id: i.toString(),
            group1: prng.pick(g1)!,
            group2: prng.pick(g2)!,
            group3: prng.pick(g3)!,
        };
        for (let v = 0; v < valueCols; ++v) {
            row[`v${v}`] = prng.nextFloat(1, 1000);
        }
        rows.push(row);
    }
    return rows;
}

/** Creates a partial update: UPDATE_FRACTION of rows get new values in `colCount` columns. */
function buildPartialUpdate(rows: AggRow[], colCount: number, prng = new SimplePRNG(0x2a3b4c5d)): AggRow[] {
    const updated = rows.slice();
    const changeCount = Math.floor(rows.length * UPDATE_FRACTION);
    const indices = new Set<number>();
    while (indices.size < changeCount) {
        indices.add(prng.nextInt(0, updated.length - 1));
    }
    for (const idx of indices) {
        const row = { ...updated[idx] };
        for (let v = 0; v < colCount; ++v) {
            row[`v${v}`] = prng.nextFloat(1, 1000);
        }
        updated[idx] = row;
    }
    return updated;
}

/** Creates transaction edit arrays: forward (modified) and reverse (original). */
function buildEdits(rows: AggRow[], colCount: number, prng = new SimplePRNG(0x5e6f7a8b)) {
    const forward: AggRow[] = [];
    const reverse: AggRow[] = [];
    const changeCount = Math.floor(rows.length * UPDATE_FRACTION);
    const indices = new Set<number>();
    while (indices.size < changeCount) {
        indices.add(prng.nextInt(0, rows.length - 1));
    }
    for (const idx of indices) {
        const original = rows[idx];
        const modified = { ...original };
        for (let v = 0; v < colCount; ++v) {
            modified[`v${v}`] = (modified[`v${v}`] as number) * prng.nextFloat(0.5, 1.5);
        }
        forward.push(modified);
        reverse.push(original);
    }
    return { forward, reverse };
}

function buildAggColumnDefs(): ColDef[] {
    const defs: ColDef[] = [
        { field: 'group1', rowGroup: true, hide: true },
        { field: 'group2', rowGroup: true, hide: true },
        { field: 'group3', rowGroup: true, hide: true },
    ];
    for (let v = 0; v < VALUE_COL_COUNT; ++v) {
        defs.push({ field: `v${v}`, aggFunc: 'sum' });
    }
    return defs;
}

// ── Pre-built data ───────────────────────────────────────────────────────────

const dataA = buildAggData(ROW_COUNT, VALUE_COL_COUNT);

// Immutable data: all columns changed
const immAllA = dataA;
const immAllB = buildPartialUpdate(dataA, VALUE_COL_COUNT, new SimplePRNG(0x3c4d5e6f));

// Immutable data: only CHANGED_COL_COUNT columns changed
const immPartialA = dataA;
const immPartialB = buildPartialUpdate(dataA, CHANGED_COL_COUNT, new SimplePRNG(0x4d5e6f70));

// Transaction edits: all columns changed
const editsAll = buildEdits(dataA, VALUE_COL_COUNT);

// Transaction edits: only CHANGED_COL_COUNT columns changed
const editsPartial = buildEdits(dataA, CHANGED_COL_COUNT, new SimplePRNG(0x6f7a8b9c));

// ── Scenario definitions ─────────────────────────────────────────────────────

const modules = [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule];

const commonGridOptions: GridOptions = {
    columnDefs: buildAggColumnDefs(),
    autoGroupColumnDef: { headerName: 'Group' },
    groupDefaultExpanded: -1,
    suppressAggFuncInHeader: true,
    getRowId: ({ data }: { data: { id: string } }) => data.id,
};

function makeGridOptions(aggregateOnlyChangedColumns: boolean): GridOptions {
    return { ...commonGridOptions, aggregateOnlyChangedColumns };
}

// ── Benchmarks ───────────────────────────────────────────────────────────────
// Each bench iteration performs TWO operations (a round-trip) so that every call
// does real work and the measurements are comparable across benchmarks.

const updateCount = Math.floor(ROW_COUNT * UPDATE_FRACTION);
const desc = `grouping aggregation — ${ROW_COUNT} rows, ${VALUE_COL_COUNT} value cols, ${updateCount} updated rows`;

suite(desc, () => {
    let gridId = 0;

    // Helper to create a bench for a given mode
    const benchMode = (name: string, cellsPath: boolean, fn: (api: GridApi) => void, initialData: AggRow[]) => {
        const id = `G${++gridId}`;
        const gridsManager = new TestGridsManager({ benchmark: true, modules });
        let api!: GridApi;

        bench(name, () => fn(api), {
            throws: true,
            time: BENCH_TIME,
            warmupIterations: BENCH_WARMUP_ITERATIONS,
            setup: () => {
                gridsManager.reset();
                api = gridsManager.createGrid(id, { ...makeGridOptions(cellsPath), rowData: initialData });
            },
        });
    };

    // Full refresh: clear then reload
    for (const cellsPath of [false, true]) {
        const tag = cellsPath ? 'CellsPath' : 'RowsPath';
        benchMode(
            `full refresh — ${tag}`,
            cellsPath,
            (api) => {
                api.setGridOption('rowData', []);
                api.setGridOption('rowData', dataA);
            },
            []
        );
    }

    // Immutable update: all value columns changed
    for (const cellsPath of [false, true]) {
        const tag = cellsPath ? 'CellsPath' : 'RowsPath';
        benchMode(
            `immutable (all ${VALUE_COL_COUNT} cols) — ${tag}`,
            cellsPath,
            (api) => {
                api.setGridOption('rowData', immAllB);
                api.setGridOption('rowData', immAllA);
            },
            immAllA
        );
    }

    // Immutable update: only CHANGED_COL_COUNT columns changed
    for (const cellsPath of [false, true]) {
        const tag = cellsPath ? 'CellsPath' : 'RowsPath';
        benchMode(
            `immutable (${CHANGED_COL_COUNT}/${VALUE_COL_COUNT} cols) — ${tag}`,
            cellsPath,
            (api) => {
                api.setGridOption('rowData', immPartialB);
                api.setGridOption('rowData', immPartialA);
            },
            immPartialA
        );
    }

    // Transaction update: all value columns changed
    for (const cellsPath of [false, true]) {
        const tag = cellsPath ? 'CellsPath' : 'RowsPath';
        benchMode(
            `transaction (all ${VALUE_COL_COUNT} cols) — ${tag}`,
            cellsPath,
            (api) => {
                api.applyTransaction({ update: editsAll.forward });
                api.applyTransaction({ update: editsAll.reverse });
            },
            dataA
        );
    }

    // Transaction update: only CHANGED_COL_COUNT columns changed
    for (const cellsPath of [false, true]) {
        const tag = cellsPath ? 'CellsPath' : 'RowsPath';
        benchMode(
            `transaction (${CHANGED_COL_COUNT}/${VALUE_COL_COUNT} cols) — ${tag}`,
            cellsPath,
            (api) => {
                api.applyTransaction({ update: editsPartial.forward });
                api.applyTransaction({ update: editsPartial.reverse });
            },
            dataA
        );
    }
});

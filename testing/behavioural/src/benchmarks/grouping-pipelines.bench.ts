// Row-grouping pipeline benchmarks, one suite per concern: plain grouping, grouping + sorting,
// grouping + aggregation (50 value cols), grouping + filtering. Merged from the former grouping /
// grouping-sorting / grouping-aggregation / grouping-filtering files. The plain/sorting/filtering
// suites share bench-data's grouped builders; the aggregation suite uses wide value-column rows.
import { bench, suite } from 'vitest';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, TextFilterModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import type { GroupedRow } from './bench-data';
import {
    GROUP_LABELS,
    buildGroupedCellUpdate,
    buildGroupedData,
    buildGroupedStructuralUpdate,
    buildValueEdits,
    buildValuePartialUpdate,
} from './bench-data';
import { BenchGridsManager, SimplePRNG, benchAlternating, benchDefaults } from './bench-utils';

const groupingModules = [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule];

// ── Plain grouping (3 levels, value + count agg) ─────────────────────────────────────────────────

suite('grouping — plain (3 levels, 20k rows)', () => {
    const gridsManager = new BenchGridsManager({ modules: groupingModules });
    let api!: GridApi<GroupedRow>;

    const rowData = buildGroupedData(20_000);
    const updatedRowData = buildGroupedStructuralUpdate(rowData);

    const options = benchDefaults({
        noiseFactor: 2,
        setup: () => {
            api ??= gridsManager.createGrid('grouping-plain', {
                columnDefs: [
                    { field: 'group1', rowGroup: true, hide: true },
                    { field: 'group2', rowGroup: true, hide: true },
                    { field: 'group3', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum' },
                    { field: 'count', aggFunc: 'count' },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowData: [],
                groupDefaultExpanded: -1,
                suppressAggFuncInHeader: true,
                getRowId: ({ data }) => data.id,
            });
        },
        teardown: async () => {
            api = undefined!;
            await gridsManager.reset();
        },
    }); // noisy suite (~5% rme @1×)

    bench(
        `grouping from scratch ${rowData.length} rows`,
        () => {
            api.setGridOption('rowData', []);
            api.setGridOption('rowData', rowData);
        },
        options
    );

    let updateForward = true;
    bench(
        `update grouping rowData ${updatedRowData.length} rows`,
        () => {
            api.setGridOption('rowData', updateForward ? updatedRowData : rowData);
            updateForward = !updateForward;
        },
        options
    );
});

// ── Grouping + sorting (5 levels, all sorted) ────────────────────────────────────────────────────

suite('grouping — sorting (5 levels, 15k rows)', () => {
    const gridsManager = new BenchGridsManager({ modules: groupingModules });
    let api!: GridApi<GroupedRow>;

    const rowData = buildGroupedData(15_000);
    const updatedRowData = buildGroupedStructuralUpdate(rowData);

    const options = benchDefaults({
        noiseFactor: 3,
        setup: () => {
            api ??= gridsManager.createGrid('grouping-sorting', {
                columnDefs: [
                    { field: 'group1', rowGroup: true, sort: 'asc' },
                    { field: 'group2', rowGroup: true, sort: 'asc' },
                    { field: 'group3', rowGroup: true, sort: 'asc' },
                    { field: 'group4', rowGroup: true, sort: 'asc' },
                    { field: 'group5', rowGroup: true, sort: 'asc' },
                    { field: 'value', aggFunc: 'sum' },
                    { field: 'count', aggFunc: 'count' },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowData: [],
                groupDefaultExpanded: -1,
                suppressAggFuncInHeader: true,
                getRowId: ({ data }) => data.id,
            });
        },
        teardown: async () => {
            api = undefined!;
            await gridsManager.reset();
        },
    }); // noisy suite (~3% rme @1×)

    bench(
        `sorting from scratch ${rowData.length} rows (5 sorts)`,
        () => {
            api.setGridOption('rowData', []);
            api.setGridOption('rowData', rowData);
        },
        options
    );

    let updateForward = true;
    bench(
        `update sorting rowData ${updatedRowData.length} rows (5 sorts)`,
        () => {
            api.setGridOption('rowData', updateForward ? updatedRowData : rowData);
            updateForward = !updateForward;
        },
        options
    );
});

// ── Grouping + aggregation (3 levels, 50 value cols) ─────────────────────────────────────────────
// Wide value-column rows so aggregation cost dominates pipeline overhead. Each bench alternates
// forward/reverse so every iteration does real work (the immutable path always detects a change).

const AGG_ROW_COUNT = 5_000;
const AGG_VALUE_COLS = 50;
const AGG_CHANGED_COLS = 5;
const AGG_UPDATE_FRACTION = 0.05;

interface AggRow {
    id: string;
    group1: string;
    group2: string;
    group3: string;
    [key: string]: string | number;
}

function buildAggData(count: number, valueCols: number, seed = 0xa7c3d1e5): AggRow[] {
    const prng = new SimplePRNG(seed);
    const rows = new Array<AggRow>(count);
    for (let i = 0; i < count; ++i) {
        const row: AggRow = {
            id: i.toString(),
            group1: prng.pick(GROUP_LABELS[0])!,
            group2: prng.pick(GROUP_LABELS[1])!,
            group3: prng.pick(GROUP_LABELS[2])!,
        };
        for (let v = 0; v < valueCols; ++v) {
            row[`v${v}`] = prng.nextFloat(1, 1000);
        }
        rows[i] = row;
    }
    return rows;
}

function aggColumnDefs(): ColDef[] {
    const defs: ColDef[] = [
        { field: 'group1', rowGroup: true, hide: true },
        { field: 'group2', rowGroup: true, hide: true },
        { field: 'group3', rowGroup: true, hide: true },
    ];
    for (let v = 0; v < AGG_VALUE_COLS; ++v) {
        defs.push({ field: `v${v}`, aggFunc: 'sum' });
    }
    return defs;
}

function aggGridOptions(aggregateOnlyChangedColumns: boolean): GridOptions {
    return {
        columnDefs: aggColumnDefs(),
        autoGroupColumnDef: { headerName: 'Group' },
        groupDefaultExpanded: -1,
        suppressAggFuncInHeader: true,
        aggregateOnlyChangedColumns,
        getRowId: ({ data }: { data: { id: string } }) => data.id,
    };
}

const aggDataA = buildAggData(AGG_ROW_COUNT, AGG_VALUE_COLS);
const aggImmAllB = buildValuePartialUpdate(aggDataA, AGG_VALUE_COLS, AGG_UPDATE_FRACTION, 0x3c4d5e6f);
const aggImmPartialB = buildValuePartialUpdate(aggDataA, AGG_CHANGED_COLS, AGG_UPDATE_FRACTION, 0x4d5e6f70);
const aggEditsAll = buildValueEdits(aggDataA, AGG_VALUE_COLS, AGG_UPDATE_FRACTION, 0x5e6f7a8b);
const aggEditsPartial = buildValueEdits(aggDataA, AGG_CHANGED_COLS, AGG_UPDATE_FRACTION, 0x6f7a8b9c);
const aggUpdateCount = Math.floor(AGG_ROW_COUNT * AGG_UPDATE_FRACTION);

suite(`grouping — aggregation (${AGG_ROW_COUNT} rows, ${AGG_VALUE_COLS} value cols, ${aggUpdateCount} updated)`, () => {
    const gridsManager = new BenchGridsManager({ modules: groupingModules });

    // RowsPath (false) vs CellsPath (true) = aggregateOnlyChangedColumns off/on — two distinct code paths.
    for (const cellsPath of [false, true]) {
        const tag = cellsPath ? 'CellsPath' : 'RowsPath';
        const gridOptions = aggGridOptions(cellsPath);

        benchAlternating(
            gridsManager,
            `full refresh — ${tag}`,
            gridOptions,
            [],
            (refreshApi) => {
                refreshApi.setGridOption('rowData', []);
                refreshApi.setGridOption('rowData', aggDataA);
            },
            (refreshApi) => {
                refreshApi.setGridOption('rowData', []);
                refreshApi.setGridOption('rowData', aggDataA);
            },
            4 // inherently noisy (~7% rme even at 4×) — full pivot/agg rebuild per iteration
        );

        benchAlternating(
            gridsManager,
            `immutable (all ${AGG_VALUE_COLS} cols) — ${tag}`,
            gridOptions,
            aggDataA,
            (immApi) => immApi.setGridOption('rowData', aggImmAllB),
            (immApi) => immApi.setGridOption('rowData', aggDataA)
        );

        benchAlternating(
            gridsManager,
            `immutable (${AGG_CHANGED_COLS}/${AGG_VALUE_COLS} cols) — ${tag}`,
            gridOptions,
            aggDataA,
            (immApi) => immApi.setGridOption('rowData', aggImmPartialB),
            (immApi) => immApi.setGridOption('rowData', aggDataA)
        );

        benchAlternating(
            gridsManager,
            `transaction (all ${AGG_VALUE_COLS} cols) — ${tag}`,
            gridOptions,
            aggDataA,
            (txnApi) => txnApi.applyTransaction({ update: aggEditsAll.forward }),
            (txnApi) => txnApi.applyTransaction({ update: aggEditsAll.reverse })
        );

        benchAlternating(
            gridsManager,
            `transaction (${AGG_CHANGED_COLS}/${AGG_VALUE_COLS} cols) — ${tag}`,
            gridOptions,
            aggDataA,
            (txnApi) => txnApi.applyTransaction({ update: aggEditsPartial.forward }),
            (txnApi) => txnApi.applyTransaction({ update: aggEditsPartial.reverse })
        );
    }
});

// ── Grouping + filtering (3 levels, text filter) ─────────────────────────────────────────────────

suite('grouping — filtering (3 levels, 12k rows)', () => {
    const gridsManager = new BenchGridsManager({
        modules: [...groupingModules, TextFilterModule],
    });
    let api!: GridApi<GroupedRow>;

    const rowData = buildGroupedData(12_000);
    const updatedRowData = buildGroupedCellUpdate(rowData);

    const options = benchDefaults({
        noiseFactor: 4,
        setup: () => {
            api ??= gridsManager.createGrid('grouping-filter', {
                columnDefs: [
                    { field: 'group1', rowGroup: true, hide: true },
                    { field: 'group2', rowGroup: true, hide: true },
                    { field: 'group3', rowGroup: true, hide: true },
                    { field: 'name', filter: 'agTextColumnFilter' },
                    { field: 'value', aggFunc: 'sum' },
                ],
                autoGroupColumnDef: { headerName: 'Group' },
                rowData,
                groupDefaultExpanded: -1,
                suppressAggFuncInHeader: true,
                getRowId: ({ data }) => data.id,
            });
        },
        teardown: async () => {
            api = undefined!;
            await gridsManager.reset();
        },
    }); // noisy suite (~3.7% rme @1×)

    const filterAAA = { name: { filterType: 'text', type: 'contains', filter: 'aaa' } };
    let filterOn = false;
    bench(
        `toggle text filter on/off ${rowData.length} rows (3-level grouping)`,
        () => {
            filterOn = !filterOn;
            api.setFilterModel(filterOn ? filterAAA : null);
        },
        options
    );

    const filterBB = { name: { filterType: 'text', type: 'contains', filter: 'bb' } };
    let useUpdated = false;
    bench(
        `immutable data update with active filter ${rowData.length} rows (3-level grouping)`,
        () => {
            if (!useUpdated) {
                api.setFilterModel(filterBB);
            }
            useUpdated = !useUpdated;
            api.setGridOption('rowData', useUpdated ? updatedRowData : rowData);
        },
        options
    );
});

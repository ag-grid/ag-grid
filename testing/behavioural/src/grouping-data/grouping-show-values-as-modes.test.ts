import type { GridApi, IRowNode, ShowValuesAsModeDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ExternalFilterModule } from 'ag-grid-community';
import { RowGroupingModule, ShowValuesAsModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

function leaf(api: GridApi, id: string): IRowNode {
    const node = api.getRowNode(id);
    if (!node) {
        throw new Error(`Leaf '${id}' not found`);
    }
    return node;
}

/** Raw transformed value (no formatter) for a cell. */
function transformed(api: GridApi, id: string, colKey: string): any {
    return api.getCellValue({ rowNode: leaf(api, id), colKey, transformValues: true });
}

describe('showValuesAs built-in modes', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ShowValuesAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('percentOfParentRowTotal — relative to the row-axis parent group', async () => {
        const api = gridsManager.createGrid('parent-row-total', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 },
            ],
        });
        // leaves relative to their group A (total 40): 30/40, 10/40
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.75);
        expect(transformed(api, '2', 'amount')).toBeCloseTo(0.25);

        await new GridColumns(api, 'percentOfParentRowTotal').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfParentRowTotal
        `);
        await new GridRows(api, 'percentOfParentRowTotal').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"75.00%"
            │ └── LEAF id:2 country:"A" amount:"25.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);
    });

    test('the edit/data sources read the raw value while the display source transforms; a change re-aggregates', async () => {
        const api = gridsManager.createGrid('sva-edit-raw', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            // Own row data (not the shared `rowData`): this test mutates a row via setDataValue.
            rowData: [
                { id: '1', country: 'A', amount: 10 },
                { id: '2', country: 'B', amount: 30 },
                { id: '3', country: 'C', amount: 60 }, // grand total 100
            ],
        });

        const node1 = leaf(api, '1');
        // Display path → the percentage; edit + data paths → the raw value (what an editor sees and commits).
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', transformValues: true })).toBeCloseTo(0.1);
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'edit' })).toBe(10);
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'data' })).toBe(10);

        // Commit a new raw value → the grand total moves to 180 and the displayed percentages re-aggregate.
        node1.setDataValue('amount', 90);
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'edit' })).toBe(90);
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', transformValues: true })).toBeCloseTo(90 / 180);
        expect(transformed(api, '3', 'amount')).toBeCloseTo(60 / 180);
    });

    test('applyColumnState restoring a total mode promotes a non-aggregated column so its denominator exists', async () => {
        const api = gridsManager.createGrid('sva-state-promote', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount' }, // numeric, NO aggFunc, NO showValuesAs
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 }, // grand 100
            ],
        });

        expect(api.getColumn('amount')!.isValueActive()).toBe(false);

        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfGrandTotal' }] });

        // Promoted to a value column (default sum) so the grand-total denominator exists and percentages resolve.
        expect(api.getColumn('amount')!.isValueActive()).toBe(true);
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.3);
        await new GridRows(api, 'state restore promotes total mode').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"30.00%"
            │ └── LEAF id:2 country:"A" amount:"10.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"60.00%"
        `);
    });

    test('after a runtime mode-to-mode switch, a data update still refreshes the column to the new mode', async () => {
        const api = gridsManager.createGrid('sva-mode-switch-then-update', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 10 },
                { id: '2', country: 'B', amount: 30 }, // grand 40
            ],
        });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(10 / 40);

        // Switch from one active mode to another (no active↔inactive transition).
        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfColumnTotal' }] });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(10 / 40);

        // A data update triggers the model-update refresh sweep, which targets active-mode columns via the cache.
        api.applyTransaction({ update: [{ id: '1', country: 'A', amount: 70 }] }); // grand 100
        expect(transformed(api, '1', 'amount')).toBeCloseTo(70 / 100);
        expect(transformed(api, '2', 'amount')).toBeCloseTo(30 / 100);
    });

    // Reviewer finding (mode switch leaves stale applicability memo): switching to a mode with DIFFERENT
    // applicability recomputes dormancy — applyActive rebuilds the memo, so it is never stale across an
    // active-to-active switch. A flat grid: percentOfGrandTotal applies; the parent-hierarchy mode is dormant.
    test('switching to a mode with different applicability recomputes dormancy (no stale applicability memo)', async () => {
        const api = gridsManager.createGrid('sva-applicability-switch', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 10 },
                { id: '2', country: 'B', amount: 30 }, // grand 40
            ],
        });
        // Applicable in a flat grid → the percentage.
        expect(transformed(api, '1', 'amount')).toBeCloseTo(10 / 40);
        // Switch to a parent-hierarchy mode: NOT applicable in a flat grid → dormant → the raw value is shown.
        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfParentRowTotal' }] });
        expect(transformed(api, '1', 'amount')).toBe(10);
        // Switch back → applicable again → the percentage (memo recomputed both ways).
        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfGrandTotal' }] });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(10 / 40);
    });

    test('a total mode applied via column state on a flat grid computes the grand total without re-sorting', async () => {
        const api = gridsManager.createGrid('sva-state-flat-reagg', {
            columnDefs: [
                { field: 'country', sort: 'desc' },
                { field: 'amount', aggFunc: 'sum' }, // value column, no mode yet
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 }, // grand total 100; country desc → B(id 2) before A(id 1)
            ],
        });
        expect(transformed(api, '1', 'amount')).toBe(25); // no mode → raw
        const order = () => [api.getDisplayedRowAtIndex(0)!.data.id, api.getDisplayedRowAtIndex(1)!.data.id];
        expect(order()).toEqual(['2', '1']);

        // The first active total mode flips on root aggregation (computed only at aggregation time), so the apply
        // must recompute aggregates for the grand total — via the change-detection re-agg, never re-sorting.
        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfGrandTotal' }] });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.25);
        expect(transformed(api, '2', 'amount')).toBeCloseTo(0.75);
        expect(order()).toEqual(['2', '1']); // sort preserved — applying the mode did not re-sort
    });

    test('a column inheriting showValuesAsDef from defaultColDef keeps its precision after a columnDefs update', async () => {
        const api = gridsManager.createGrid('sva-defaultcoldef-precision', {
            defaultColDef: { showValuesAsDef: { precision: 1 } }, // config (precision) inherited grid-wide
            columnDefs: [
                { field: 'country', headerName: 'Country' },
                { field: 'amount', aggFunc: 'sum' }, // no per-column showValuesAsDef and no colDef.showValuesAs
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });
        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfGrandTotal' }] });
        const formatted = () =>
            api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', useFormatter: true, transformValues: true });
        expect(formatted()).toBe('25.0%'); // 1 decimal, from defaultColDef precision

        // An unrelated columnDefs update (only the country header changes), keeping defaultColDef.
        api.setGridOption('columnDefs', [
            { field: 'country', headerName: 'Nation' },
            { field: 'amount', aggFunc: 'sum' },
        ]);
        // The inherited config and the state-applied mode both survive — still 1 decimal, not reverted to default 2.
        expect(formatted()).toBe('25.0%');
    });

    test('defaultColDef showValuesAsDef:null can be re-enabled per column with showValuesAsDef', async () => {
        const api = gridsManager.createGrid('sva-defaultcoldef-null-reenable', {
            defaultColDef: { showValuesAsDef: null }, // feature disabled grid-wide
            columnDefs: [
                { field: 'country' },
                // Opts back in: the per-column showValuesAsDef overrides the defaultColDef null (merge replaces it).
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValuesAsDef: { precision: 1 },
                    showValuesAs: 'percentOfGrandTotal',
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });
        expect(
            api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', useFormatter: true, transformValues: true })
        ).toBe('25.0%');
    });

    test('applying an unknown mode resolves to no active mode — the column stays enabled, value raw', async () => {
        const api = gridsManager.createGrid('sva-unknown-mode', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 }, // grand total 100
            ],
        });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.25);

        // An unknown mode is not selectable, so it resolves to no active mode (raw value shown), not an error.
        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'noSuchMode' }] });
        expect(api.getColumnState().find((s) => s.colId === 'amount')?.showValuesAs ?? null).toBeNull();
        expect(transformed(api, '1', 'amount')).toBe(25);
        // The column is still eligible for the feature — a valid mode can be applied again.
        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfGrandTotal' }] });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.25);
    });

    test('ready:false leaves the value raw and runs the formatter with notApplicable; ready:true transforms', async () => {
        const notReadyNotApplicable: boolean[] = [];
        const notReady: ShowValuesAsModeDef = {
            ready: () => false,
            transform: (p) => (p.rawValue as number) * 2,
            formatter: (p) => {
                notReadyNotApplicable.push(p.notApplicable);
                return p.notApplicable ? '#N/A' : `x2:${p.value}`;
            },
        };
        const ready: ShowValuesAsModeDef = {
            ready: () => true,
            transform: (p) => (p.rawValue as number) * 2,
            formatter: (p) => (p.notApplicable ? '#N/A' : `x2:${p.value}`),
        };
        const api = gridsManager.createGrid('sva-ready-gate', {
            columnDefs: [
                { field: 'a', aggFunc: 'sum', showValuesAs: 'dbl', showValuesAsDef: { modes: { dbl: notReady } } },
                { field: 'b', aggFunc: 'sum', showValuesAs: 'dbl', showValuesAsDef: { modes: { dbl: ready } } },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', a: 5, b: 5 },
                { id: '2', a: 7, b: 7 },
            ],
        });

        // ready:false → transform does not run, value stays raw; ready:true → transform doubles it.
        expect(transformed(api, '1', 'a')).toBe(5);
        expect(transformed(api, '1', 'b')).toBe(10);
        // The not-ready formatter is invoked with notApplicable=true (so the built-in formatters show #N/A).
        expect(notReadyNotApplicable.length).toBeGreaterThan(0);
        expect(notReadyNotApplicable.every((v) => v === true)).toBe(true);

        // The root is not a displayed row here (no grand-total row) and no mode reads a root total, so the pipeline
        // leaves it un-aggregated — its phantom cell doubles an undefined raw value (`x2:NaN`). The visible leaves
        // are what matter.
        await new GridRows(api, 'ready gate').check(`
            ROOT id:ROOT_NODE_ID a:"#N/A" b:"x2:NaN"
            ├── LEAF id:1 a:"#N/A" b:"x2:10"
            └── LEAF id:2 a:"#N/A" b:"x2:14"
        `);
    });
});

describe('showValuesAs bigint support', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ShowValuesAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('percentOfGrandTotal on a bigint column yields a numeric fraction', async () => {
        const api = gridsManager.createGrid('bigint-pct', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', cellDataType: 'bigint', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25n },
                { id: '2', country: 'B', amount: 75n },
            ],
        });
        const value = transformed(api, '1', 'amount');
        expect(typeof value).toBe('number');
        expect(value).toBeCloseTo(0.25); // 25 / 100

        await new GridColumns(api, 'bigint percentOfGrandTotal').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfGrandTotal
        `);
        await new GridRows(api, 'bigint percentOfGrandTotal').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);
    });
});

describe('showValuesAs interaction with filtering', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ExternalFilterModule, RowGroupingModule, ShowValuesAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Mirrors Excel: by default a filter recalculates the base, so % of parent is relative to the VISIBLE
    // total and the shown rows sum to 100%. `suppressAggFilteredOnly` keeps the all-rows base (Excel's
    // "Include Filtered Items in Totals").
    test('% of parent row total uses the filtered (visible) total by default', async () => {
        let filterOutId2 = false;
        const api = gridsManager.createGrid('sva-filter-default', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' },
            ],
            groupDefaultExpanded: -1,
            isExternalFilterPresent: () => filterOutId2,
            doesExternalFilterPass: (node) => node.data?.id !== '2',
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 },
            ],
        });
        // Group A total 40: 30/40 and 10/40.
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.75);
        expect(transformed(api, '2', 'amount')).toBeCloseTo(0.25);

        await new GridColumns(api, 'filter default parent total').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfParentRowTotal
        `);
        await new GridRows(api, 'filter default before filter').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"75.00%"
            │ └── LEAF id:2 country:"A" amount:"25.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);

        // Filter out id2 → group A total recalculates to 30 (visible only) → id1 is now 100% of its parent.
        filterOutId2 = true;
        api.onFilterChanged();
        expect(transformed(api, '1', 'amount')).toBeCloseTo(1);

        // The filter recalculates the base and repaints the surviving showValuesAs cells to match.
        await new GridRows(api, 'filter default after filter out id2').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"33.33%"
            │ └── LEAF id:1 country:"A" amount:"100.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"66.67%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);
    });

    test('suppressAggFilteredOnly keeps the all-rows base for % of parent row total (Excel "include filtered items")', async () => {
        let filterOutId2 = false;
        const api = gridsManager.createGrid('sva-filter-suppress', {
            suppressAggFilteredOnly: true,
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' },
            ],
            groupDefaultExpanded: -1,
            isExternalFilterPresent: () => filterOutId2,
            doesExternalFilterPass: (node) => node.data?.id !== '2',
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 },
            ],
        });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.75);

        await new GridColumns(api, 'suppressAggFilteredOnly').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfParentRowTotal
        `);
        await new GridRows(api, 'suppress before filter').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"75.00%"
            │ └── LEAF id:2 country:"A" amount:"25.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);

        // Filter out id2 → base stays 40 (all rows) → id1 is still 30/40 = 0.75, not 1.
        filterOutId2 = true;
        api.onFilterChanged();
        expect(transformed(api, '1', 'amount')).toBeCloseTo(0.75);

        await new GridRows(api, 'suppress after filter out id2').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ └── LEAF id:1 country:"A" amount:"75.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);
    });

    test('percentOfGrandTotal denominator follows the filter, honouring suppressAggFilteredOnly', async () => {
        // Default: the grand total recalculates to the visible rows, so the shown rows renormalise to 100%.
        const filtered = gridsManager.createGrid('sva-grand-filtered', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            isExternalFilterPresent: () => true,
            doesExternalFilterPass: (node) => node.data?.id !== '2',
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'B', amount: 10 }, // filtered out
                { id: '3', country: 'C', amount: 60 },
            ],
        });
        // Grand total = visible only (30 + 60 = 90).
        expect(transformed(filtered, '1', 'amount')).toBeCloseTo(30 / 90);
        expect(transformed(filtered, '3', 'amount')).toBeCloseTo(60 / 90);

        // suppressAggFilteredOnly: the grand total keeps the all-rows base (100), so the percentages don't renormalise.
        const allRows = gridsManager.createGrid('sva-grand-allrows', {
            suppressAggFilteredOnly: true,
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            isExternalFilterPresent: () => true,
            doesExternalFilterPass: (node) => node.data?.id !== '2',
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'B', amount: 10 }, // filtered out
                { id: '3', country: 'C', amount: 60 },
            ],
        });
        // Grand total = all rows (30 + 10 + 60 = 100).
        expect(transformed(allRows, '1', 'amount')).toBeCloseTo(0.3);
        expect(transformed(allRows, '3', 'amount')).toBeCloseTo(0.6);
    });
});

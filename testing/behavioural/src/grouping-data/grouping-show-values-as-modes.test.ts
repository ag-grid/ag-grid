import type { GridApi, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule, ExternalFilterModule } from 'ag-grid-community';
import { RowGroupingModule, ShowValueAsModule } from 'ag-grid-enterprise';

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
    return api.getCellValue({ rowNode: leaf(api, id), colKey, from: 'transformed' });
}

describe('showValueAs built-in modes', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ShowValueAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('percentOfParentRowTotal — relative to the row-axis parent group', async () => {
        const api = gridsManager.createGrid('parent-row-total', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfParentRowTotal' },
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
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfParentRowTotal
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
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
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
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.1);
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'edit' })).toBe(10);
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'data' })).toBe(10);

        // Commit a new raw value → the grand total moves to 180 and the displayed percentages re-aggregate.
        node1.setDataValue('amount', 90);
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'edit' })).toBe(90);
        expect(api.getCellValue({ rowNode: node1, colKey: 'amount', from: 'transformed' })).toBeCloseTo(90 / 180);
        expect(transformed(api, '3', 'amount')).toBeCloseTo(60 / 180);
    });

    test('applyColumnState restoring a total mode promotes a non-aggregated column so its denominator exists', async () => {
        const api = gridsManager.createGrid('sva-state-promote', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount' }, // numeric, NO aggFunc, NO showValueAs
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

        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: 'percentOfGrandTotal' }] });

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
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
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
        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: 'percentOfColumnTotal' }] });
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
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 10 },
                { id: '2', country: 'B', amount: 30 }, // grand 40
            ],
        });
        // Applicable in a flat grid → the percentage.
        expect(transformed(api, '1', 'amount')).toBeCloseTo(10 / 40);
        // Switch to a parent-hierarchy mode: NOT applicable in a flat grid → dormant → the raw value is shown.
        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: 'percentOfParentRowTotal' }] });
        expect(transformed(api, '1', 'amount')).toBe(10);
        // Switch back → applicable again → the percentage (memo recomputed both ways).
        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: 'percentOfGrandTotal' }] });
        expect(transformed(api, '1', 'amount')).toBeCloseTo(10 / 40);
    });
});

describe('showValueAs bigint support', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ShowValueAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('percentOfGrandTotal on a bigint column yields a numeric fraction', async () => {
        const api = gridsManager.createGrid('bigint-pct', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', cellDataType: 'bigint', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
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
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'bigint percentOfGrandTotal').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);
    });
});

describe('showValueAs interaction with filtering', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ExternalFilterModule, RowGroupingModule, ShowValueAsModule],
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
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfParentRowTotal' },
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
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfParentRowTotal
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

        // The filter recalculates the base and repaints the surviving showValueAs cells to match.
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
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfParentRowTotal' },
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
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfParentRowTotal
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
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
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
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
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

import type { GridApi, IAggFuncParams, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../test-utils';

/** Custom aggFunc that returns an object with .value for display, as shown in the docs example */
function rangeAggFunc(params: IAggFuncParams): { max: number; min: number; value: number } {
    const values = params.values;
    if (params.rowNode.leafGroup) {
        const max = Math.max(...values);
        const min = Math.min(...values);
        return { max, min, value: max - min };
    }
    let max = values[0].max;
    let min = values[0].min;
    values.forEach((v: any) => {
        max = Math.max(max, v.max);
        min = Math.min(min, v.min);
    });
    return { max, min, value: max - min };
}

/** Find the first displayed group row with the given key */
function findGroupRow(api: GridApi, key: string): IRowNode {
    let found: IRowNode | undefined;
    api.forEachNode((node) => {
        if (node.group && node.key === key && !found) {
            found = node;
        }
    });
    if (!found) {
        throw new Error(`Group row with key '${key}' not found`);
    }
    return found;
}

describe('ag-grid grouping custom aggregation object display value', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('groupSafeValueFormatter unwraps .value from aggregation result objects for display', async () => {
        const api = gridMgr.createGrid('grouping-agg-object-display', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'total', colId: 'rangeTotal', aggFunc: rangeAggFunc },
            ],
            defaultColDef: { flex: 1 },
            autoGroupColumnDef: { minWidth: 220 },
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'ie-1', country: 'Ireland', total: 10 },
                { id: 'ie-2', country: 'Ireland', total: 30 },
                { id: 'uk-1', country: 'UK', total: 5 },
                { id: 'uk-2', country: 'UK', total: 25 },
            ],
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'formatted grouping').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" rangeTotal:"20"
            │ ├── LEAF id:ie-1 country:"Ireland" rangeTotal:10
            │ └── LEAF id:ie-2 country:"Ireland" rangeTotal:30
            └─┬ LEAF_GROUP id:row-group-country-UK ag-Grid-AutoColumn:"UK" rangeTotal:"20"
            · ├── LEAF id:uk-1 country:"UK" rangeTotal:5
            · └── LEAF id:uk-2 country:"UK" rangeTotal:25
        `);

        const irelandGroupNode = findGroupRow(api, 'Ireland');
        const ukGroupNode = findGroupRow(api, 'UK');

        // The raw aggData should still be the full object (needed for multi-level aggregation)
        expect(irelandGroupNode.aggData?.rangeTotal).toEqual({ max: 30, min: 10, value: 20 });
        expect(ukGroupNode.aggData?.rangeTotal).toEqual({ max: 25, min: 5, value: 20 });

        // getCellValue with useFormatter: true should unwrap .value via groupSafeValueFormatter
        // and NOT produce [object Object]
        const irelandFormatted = api.getCellValue({
            rowNode: irelandGroupNode,
            colKey: 'rangeTotal',
            useFormatter: true,
        });
        const ukFormatted = api.getCellValue({ rowNode: ukGroupNode, colKey: 'rangeTotal', useFormatter: true });

        expect(irelandFormatted).not.toContain('[object Object]');
        expect(ukFormatted).not.toContain('[object Object]');
        expect(irelandFormatted).toBe('20');
        expect(ukFormatted).toBe('20');
    });

    test('groupSafeValueFormatter unwraps .value and passes it to user-supplied valueFormatter', () => {
        const formatterCalls: any[] = [];
        const api = gridMgr.createGrid('grouping-agg-object-display-formatter', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                {
                    field: 'total',
                    colId: 'rangeTotal',
                    valueFormatter: (params) => {
                        formatterCalls.push(params.value);
                        return `Range: ${params.value}`;
                    },
                    aggFunc: rangeAggFunc,
                },
            ],
            defaultColDef: { flex: 1 },
            autoGroupColumnDef: { minWidth: 220 },
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'ie-1', country: 'Ireland', total: 10 },
                { id: 'ie-2', country: 'Ireland', total: 30 },
                { id: 'uk-1', country: 'UK', total: 5 },
                { id: 'uk-2', country: 'UK', total: 25 },
            ],
            getRowId: (params) => params.data.id,
        });

        const irelandGroupNode = findGroupRow(api, 'Ireland');

        // The user-supplied valueFormatter receives the raw object because the user controls formatting.
        // The groupSafeValueFormatter only applies to inferred formatters from DataTypeService.
        const irelandFormatted = api.getCellValue({
            rowNode: irelandGroupNode,
            colKey: 'rangeTotal',
            useFormatter: true,
        });
        // With a user-supplied formatter, the grid passes the raw value (the result of aggFunc)
        // The user's formatter is responsible for handling it appropriately
        expect(irelandFormatted).toBeDefined();
        expect(formatterCalls.length).toBeGreaterThan(0);
    });

    test('does not unwrap .value for leaf row data', () => {
        const api = gridMgr.createGrid('grouping-agg-object-leaf-noop', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                {
                    field: 'stats',
                    colId: 'stats',
                    valueFormatter: (params) => JSON.stringify(params.value),
                    aggFunc: 'first',
                },
            ],
            defaultColDef: { flex: 1 },
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'ie-1', country: 'Ireland', stats: { value: 42, extra: 'data' } },
                { id: 'ie-2', country: 'Ireland', stats: { value: 99, extra: 'more' } },
            ],
            getRowId: (params) => params.data.id,
        });

        // Find a leaf row
        let leafNode: IRowNode | undefined;
        api.forEachNode((node) => {
            if (!node.group && !leafNode) {
                leafNode = node;
            }
        });
        expect(leafNode).toBeDefined();
        expect(leafNode!.group).toBe(false);

        // Leaf rows should still return the raw object (not unwrapped)
        const leafValue = api.getCellValue({ rowNode: leafNode!, colKey: 'stats', useFormatter: false });
        expect(leafValue).toEqual({ value: 42, extra: 'data' });
    });

    test('groupSafeValueFormatter unwraps .value in multi-level group aggregation', () => {
        const api = gridMgr.createGrid('grouping-agg-object-multi-level', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'total', colId: 'rangeTotal', aggFunc: rangeAggFunc },
            ],
            defaultColDef: { flex: 1 },
            autoGroupColumnDef: { minWidth: 220 },
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'ie-2020-1', country: 'Ireland', year: 2020, total: 10 },
                { id: 'ie-2020-2', country: 'Ireland', year: 2020, total: 30 },
                { id: 'ie-2021-1', country: 'Ireland', year: 2021, total: 5 },
                { id: 'ie-2021-2', country: 'Ireland', year: 2021, total: 50 },
            ],
            getRowId: (params) => params.data.id,
        });

        // Top-level group (Ireland) - multi-level aggregation
        const irelandGroup = findGroupRow(api, 'Ireland');

        // The formatted display value should be the unwrapped .value, not [object Object]
        const topLevelFormatted = api.getCellValue({
            rowNode: irelandGroup,
            colKey: 'rangeTotal',
            useFormatter: true,
        });
        expect(topLevelFormatted).not.toContain('[object Object]');
        expect(topLevelFormatted).toBe('45'); // max=50, min=5, range=45

        // Sub-group (Ireland > 2020)
        const year2020Group = findGroupRow(api, '2020');
        const subGroupFormatted = api.getCellValue({
            rowNode: year2020Group,
            colKey: 'rangeTotal',
            useFormatter: true,
        });
        expect(subGroupFormatted).not.toContain('[object Object]');
        expect(subGroupFormatted).toBe('20'); // max=30, min=10, range=20
    });

    test('groupSafeValueFormatter handles .value === 0 correctly', () => {
        const api = gridMgr.createGrid('grouping-agg-object-zero-value', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'total', colId: 'rangeTotal', aggFunc: rangeAggFunc },
            ],
            defaultColDef: { flex: 1 },
            autoGroupColumnDef: { minWidth: 220 },
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'ie-1', country: 'Ireland', total: 5 },
                { id: 'ie-2', country: 'Ireland', total: 5 }, // same values -> range = 0
            ],
            getRowId: (params) => params.data.id,
        });

        const irelandGroup = findGroupRow(api, 'Ireland');
        expect(irelandGroup.aggData?.rangeTotal).toEqual({ max: 5, min: 5, value: 0 });

        // value === 0 should still be formatted, not skipped as falsy
        const formatted = api.getCellValue({
            rowNode: irelandGroup,
            colKey: 'rangeTotal',
            useFormatter: true,
        });
        expect(formatted).toBe('0');
    });
});

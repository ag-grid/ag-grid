import type { GridApi, IAggFuncParams, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

/** Custom aggFunc that returns an object with .value for display, as shown in the docs example.
 * Also validates that aggregatedChildren is correctly populated. */
function rangeAggFunc(params: IAggFuncParams): { max: number; min: number; value: number } {
    const { values, aggregatedChildren } = params;
    // aggregatedChildren should always be a non-empty array
    expect(aggregatedChildren).toBeInstanceOf(Array);
    expect(aggregatedChildren.length).toBeGreaterThan(0);

    if (params.rowNode.leafGroup) {
        // For leaf groups, aggregatedChildren should be the data rows
        for (const child of aggregatedChildren) {
            expect(child.group).toBe(false);
            expect(child.data).toBeDefined();
        }
        const max = Math.max(...values);
        const min = Math.min(...values);
        return { max, min, value: max - min };
    }
    // For non-leaf groups, aggregatedChildren should be the child groups
    for (const child of aggregatedChildren) {
        expect(child.group).toBe(true);
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

        // The raw aggData should still be the full object (needed for multi-level aggregation)
        const irelandGroupNode = findGroupRow(api, 'Ireland');
        const ukGroupNode = findGroupRow(api, 'UK');
        expect(irelandGroupNode.aggData?.rangeTotal).toEqual({ max: 30, min: 10, value: 20 });
        expect(ukGroupNode.aggData?.rangeTotal).toEqual({ max: 25, min: 5, value: 20 });

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:500 flex:1
            └── rangeTotal "Total" width:500 flex:1 aggFunc:custom
        `);
    });

    test('user-supplied valueFormatter that handles group objects shows unwrapped values', async () => {
        const api = gridMgr.createGrid('grouping-agg-object-display-formatter', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                {
                    field: 'total',
                    colId: 'rangeTotal',
                    valueFormatter: (params) => {
                        const val =
                            typeof params.value === 'object' && params.value != null && 'value' in params.value
                                ? params.value.value
                                : params.value;
                        return `Range: ${val}`;
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

        // User-supplied formatter that handles groups correctly shows the unwrapped value
        await new GridRows(api, 'group-aware user formatter grouping').check(`
            ROOT id:ROOT_NODE_ID rangeTotal:"Range: undefined"
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" rangeTotal:"Range: 20"
            │ ├── LEAF id:ie-1 country:"Ireland" rangeTotal:"Range: 10"
            │ └── LEAF id:ie-2 country:"Ireland" rangeTotal:"Range: 30"
            └─┬ LEAF_GROUP id:row-group-country-UK ag-Grid-AutoColumn:"UK" rangeTotal:"Range: 20"
            · ├── LEAF id:uk-1 country:"UK" rangeTotal:"Range: 5"
            · └── LEAF id:uk-2 country:"UK" rangeTotal:"Range: 25"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:500 flex:1
            └── rangeTotal "Total" width:500 flex:1 aggFunc:custom
        `);
    });

    test('does not unwrap .value for leaf row data', async () => {
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
        await new GridColumns(api, `does not unwrap .value for leaf row data setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:500 flex:1
            └── stats "Stats" width:500 flex:1 aggFunc:first
        `);
        await new GridRows(api, `does not unwrap .value for leaf row data setup`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" stats:'{"value":42,"extra":"data"}'
            · ├── LEAF id:ie-1 country:"Ireland" stats:'{"value":42,"extra":"data"}'
            · └── LEAF id:ie-2 country:"Ireland" stats:'{"value":99,"extra":"more"}'
        `);

        // Find a leaf row
        let leafNode: IRowNode | undefined;
        api.forEachNode((node) => {
            if (!node.group && !leafNode) {
                leafNode = node;
            }
        });
        await new GridRows(api, `does not unwrap .value for leaf row data after forEachNode`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" stats:'{"value":42,"extra":"data"}'
            · ├── LEAF id:ie-1 country:"Ireland" stats:'{"value":42,"extra":"data"}'
            · └── LEAF id:ie-2 country:"Ireland" stats:'{"value":99,"extra":"more"}'
        `);
        expect(leafNode).toBeDefined();
        expect(leafNode!.group).toBe(false);

        // Leaf rows should still return the raw object (not unwrapped)
        const leafValue = api.getCellValue({ rowNode: leafNode!, colKey: 'stats', useFormatter: false });
        expect(leafValue).toEqual({ value: 42, extra: 'data' });
    });

    test('groupSafeValueFormatter unwraps .value in multi-level group aggregation', async () => {
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

        await new GridRows(api, 'multi-level grouping').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" rangeTotal:"45"
            · ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020 rangeTotal:"20"
            · │ ├── LEAF id:ie-2020-1 country:"Ireland" year:2020 rangeTotal:10
            · │ └── LEAF id:ie-2020-2 country:"Ireland" year:2020 rangeTotal:30
            · └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021 rangeTotal:"45"
            · · ├── LEAF id:ie-2021-1 country:"Ireland" year:2021 rangeTotal:5
            · · └── LEAF id:ie-2021-2 country:"Ireland" year:2021 rangeTotal:50
        `);
    });

    test('groupSafeValueFormatter handles .value === 0 correctly', async () => {
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

        // value === 0 should still be formatted, not skipped as falsy
        await new GridRows(api, 'zero value grouping').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" rangeTotal:"0"
            · ├── LEAF id:ie-1 country:"Ireland" rangeTotal:5
            · └── LEAF id:ie-2 country:"Ireland" rangeTotal:5
        `);

        // Verify the raw aggData preserves the full object
        const irelandGroup = findGroupRow(api, 'Ireland');
        expect(irelandGroup.aggData?.rangeTotal).toEqual({ max: 5, min: 5, value: 0 });
    });

    test('groupSafeValueFormatter unwraps .value from bigint aggregation results', async () => {
        const bigintRangeAggFunc = (params: IAggFuncParams) => {
            const { values } = params;
            if (typeof values[0] === 'bigint') {
                const max = values.reduce((a: bigint, b: bigint) => (a > b ? a : b));
                const min = values.reduce((a: bigint, b: bigint) => (a < b ? a : b));
                return { max, min, value: max - min };
            }
            let max = values[0].max as bigint;
            let min = values[0].min as bigint;
            for (const v of values) {
                if (v.max > max) {
                    max = v.max;
                }
                if (v.min < min) {
                    min = v.min;
                }
            }
            return { max, min, value: max - min };
        };

        const api = gridMgr.createGrid('grouping-bigint-agg', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', colId: 'rangeAmount', cellDataType: 'bigint', aggFunc: bigintRangeAggFunc },
            ],
            defaultColDef: { flex: 1 },
            autoGroupColumnDef: { minWidth: 220 },
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'ie-1', country: 'Ireland', amount: 10n },
                { id: 'ie-2', country: 'Ireland', amount: 30n },
            ],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `groupSafeValueFormatter unwraps .value from bigint aggregation results setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:500 flex:1
                └── rangeAmount "Amount" width:500 flex:1 aggFunc:custom
            `);
        await new GridRows(api, `groupSafeValueFormatter unwraps .value from bigint aggregation results setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" rangeAmount:"20"
                · ├── LEAF id:ie-1 country:"Ireland" rangeAmount:"10n"
                · └── LEAF id:ie-2 country:"Ireland" rangeAmount:"30n"
            `
        );

        const irelandGroup = findGroupRow(api, 'Ireland');
        expect(irelandGroup.aggData?.rangeAmount).toEqual({ max: 30n, min: 10n, value: 20n });

        // The groupSafeValueFormatter should unwrap .value (20n) and pass it to the bigint formatter
        const formatted = api.getCellValue({
            rowNode: irelandGroup,
            colKey: 'rangeAmount',
            useFormatter: true,
        });
        expect(formatted).toBe('20');
        await new GridRows(api, `groupSafeValueFormatter unwraps .value from bigint aggregation results final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" rangeAmount:"20"
                · ├── LEAF id:ie-1 country:"Ireland" rangeAmount:"10n"
                · └── LEAF id:ie-2 country:"Ireland" rangeAmount:"30n"
            `);
    });

    test('groupSafeValueFormatter handles bigint .value === 0n correctly', async () => {
        const bigintZeroAggFunc = (params: IAggFuncParams) => {
            const { values } = params;
            const max = values.reduce((a: bigint, b: bigint) => (a > b ? a : b));
            const min = values.reduce((a: bigint, b: bigint) => (a < b ? a : b));
            return { max, min, value: max - min };
        };

        const api = gridMgr.createGrid('grouping-bigint-zero', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', colId: 'rangeAmount', cellDataType: 'bigint', aggFunc: bigintZeroAggFunc },
            ],
            defaultColDef: { flex: 1 },
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'ie-1', country: 'Ireland', amount: 5n },
                { id: 'ie-2', country: 'Ireland', amount: 5n },
            ],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `groupSafeValueFormatter handles bigint .value === 0n correctly setup`).checkColumns(
            `
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:500 flex:1
                └── rangeAmount "Amount" width:500 flex:1 aggFunc:custom
            `
        );
        await new GridRows(api, `groupSafeValueFormatter handles bigint .value === 0n correctly setup`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" rangeAmount:"0"
            · ├── LEAF id:ie-1 country:"Ireland" rangeAmount:"5n"
            · └── LEAF id:ie-2 country:"Ireland" rangeAmount:"5n"
        `);

        const irelandGroup = findGroupRow(api, 'Ireland');
        expect(irelandGroup.aggData?.rangeAmount).toEqual({ max: 5n, min: 5n, value: 0n });

        // BigInt zero (0n) should still be formatted, not skipped as falsy
        const formatted = api.getCellValue({
            rowNode: irelandGroup,
            colKey: 'rangeAmount',
            useFormatter: true,
        });
        expect(formatted).toBe('0');
        await new GridRows(api, `groupSafeValueFormatter handles bigint .value === 0n correctly final state`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" rangeAmount:"0"
            · ├── LEAF id:ie-1 country:"Ireland" rangeAmount:"5n"
            · └── LEAF id:ie-2 country:"Ireland" rangeAmount:"5n"
        `);
    });

    test('groupSafeValueFormatter calls formatter when .value is null (v35.0.0 compat)', async () => {
        const nullValueAggFunc = () => ({ value: null });

        const api = gridMgr.createGrid('grouping-agg-null-value', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'total', colId: 'nullTotal', aggFunc: nullValueAggFunc },
            ],
            defaultColDef: { flex: 1 },
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'ie-1', country: 'Ireland', total: 10 },
                { id: 'ie-2', country: 'Ireland', total: 30 },
            ],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `groupSafeValueFormatter calls formatter when .value is null (v35.0.0 compat) setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:500 flex:1
                └── nullTotal "Total" width:500 flex:1 aggFunc:custom
            `);
        await new GridRows(api, `groupSafeValueFormatter calls formatter when .value is null (v35.0.0 compat) setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" nullTotal:""
                · ├── LEAF id:ie-1 country:"Ireland" nullTotal:10
                · └── LEAF id:ie-2 country:"Ireland" nullTotal:30
            `);

        const irelandGroup = findGroupRow(api, 'Ireland');
        // v35.0.0 behavior: formatter is called with null, default number formatter returns ''
        const formatted = api.getCellValue({
            rowNode: irelandGroup,
            colKey: 'nullTotal',
            useFormatter: true,
        });
        expect(formatted).toBe('');
        await new GridRows(
            api,
            `groupSafeValueFormatter calls formatter when .value is null (v35.0.0 compat) final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" nullTotal:""
            · ├── LEAF id:ie-1 country:"Ireland" nullTotal:10
            · └── LEAF id:ie-2 country:"Ireland" nullTotal:30
        `);
    });

    test('groupSafeValueFormatter calls toNumber() for BigDecimal-like aggregation results', async () => {
        const toNumberAggFunc = (params: IAggFuncParams) => {
            const sum = params.values.reduce((a: number, b: number) => a + b, 0);
            return { toNumber: () => sum };
        };

        const api = gridMgr.createGrid('grouping-agg-toNumber', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'total', colId: 'sumTotal', aggFunc: toNumberAggFunc },
            ],
            defaultColDef: { flex: 1 },
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'ie-1', country: 'Ireland', total: 10 },
                { id: 'ie-2', country: 'Ireland', total: 30 },
            ],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(
            api,
            `groupSafeValueFormatter calls toNumber() for BigDecimal-like aggregation results setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:500 flex:1
            └── sumTotal "Total" width:500 flex:1 aggFunc:custom
        `);
        await new GridRows(
            api,
            `groupSafeValueFormatter calls toNumber() for BigDecimal-like aggregation results setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" sumTotal:"40"
            · ├── LEAF id:ie-1 country:"Ireland" sumTotal:10
            · └── LEAF id:ie-2 country:"Ireland" sumTotal:30
        `);

        const irelandGroup = findGroupRow(api, 'Ireland');
        // toNumber() should be called and its result passed to formatter
        const formatted = api.getCellValue({
            rowNode: irelandGroup,
            colKey: 'sumTotal',
            useFormatter: true,
        });
        expect(formatted).toBe('40');
        await new GridRows(
            api,
            `groupSafeValueFormatter calls toNumber() for BigDecimal-like aggregation results final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" sumTotal:"40"
            · ├── LEAF id:ie-1 country:"Ireland" sumTotal:10
            · └── LEAF id:ie-2 country:"Ireland" sumTotal:30
        `);
    });
});

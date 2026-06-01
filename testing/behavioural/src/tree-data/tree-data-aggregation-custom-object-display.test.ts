import type { GridApi, IAggFuncParams, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

/** Custom aggFunc that returns an object with .value for display.
 * Uses typeof check instead of leafGroup since filler nodes in tree data don't have leafGroup set.
 * Also validates that aggregatedChildren is correctly populated. */
function rangeAggFunc(params: IAggFuncParams): { max: number; min: number; value: number } {
    const { values, aggregatedChildren } = params;
    // aggregatedChildren should always be a non-empty array
    expect(aggregatedChildren).toBeInstanceOf(Array);
    expect(aggregatedChildren.length).toBeGreaterThan(0);

    if (typeof values[0] === 'number') {
        // Leaf-level aggregation: aggregatedChildren should be data rows
        for (const child of aggregatedChildren) {
            expect(child.data).toBeDefined();
        }
        const max = Math.max(...values);
        const min = Math.min(...values);
        return { max, min, value: max - min };
    }
    // Non-leaf aggregation: aggregatedChildren should be group/filler nodes
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

describe('ag-grid tree data custom aggregation object display value', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('groupSafeValueFormatter unwraps .value from aggregation result objects for display', async () => {
        const api = gridMgr.createGrid('tree-data-agg-object-display', {
            columnDefs: [{ field: 'total', colId: 'rangeTotal', aggFunc: rangeAggFunc }],
            defaultColDef: { flex: 1 },
            autoGroupColumnDef: { minWidth: 220 },
            groupDefaultExpanded: -1,
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [
                { id: 'ie-1', path: ['Ireland', 'Row1'], total: 10 },
                { id: 'ie-2', path: ['Ireland', 'Row2'], total: 30 },
                { id: 'uk-1', path: ['UK', 'Row1'], total: 5 },
                { id: 'uk-2', path: ['UK', 'Row2'], total: 25 },
            ],
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'formatted tree data').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ Ireland filler id:row-group-0-Ireland ag-Grid-AutoColumn:"Ireland" rangeTotal:"20"
            │ ├── Row1 LEAF id:ie-1 ag-Grid-AutoColumn:"Row1" rangeTotal:10
            │ └── Row2 LEAF id:ie-2 ag-Grid-AutoColumn:"Row2" rangeTotal:30
            └─┬ UK filler id:row-group-0-UK ag-Grid-AutoColumn:"UK" rangeTotal:"20"
            · ├── Row1 LEAF id:uk-1 ag-Grid-AutoColumn:"Row1" rangeTotal:5
            · └── Row2 LEAF id:uk-2 ag-Grid-AutoColumn:"Row2" rangeTotal:25
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
        const api = gridMgr.createGrid('tree-data-agg-object-display-formatter', {
            columnDefs: [
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
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [
                { id: 'ie-1', path: ['Ireland', 'Row1'], total: 10 },
                { id: 'ie-2', path: ['Ireland', 'Row2'], total: 30 },
                { id: 'uk-1', path: ['UK', 'Row1'], total: 5 },
                { id: 'uk-2', path: ['UK', 'Row2'], total: 25 },
            ],
            getRowId: (params) => params.data.id,
        });

        // User-supplied formatter that handles groups correctly shows the unwrapped value
        await new GridRows(api, 'group-aware user formatter tree data').check(`
            ROOT id:ROOT_NODE_ID rangeTotal:"Range: undefined"
            ├─┬ Ireland filler id:row-group-0-Ireland ag-Grid-AutoColumn:"Ireland" rangeTotal:"Range: 20"
            │ ├── Row1 LEAF id:ie-1 ag-Grid-AutoColumn:"Row1" rangeTotal:"Range: 10"
            │ └── Row2 LEAF id:ie-2 ag-Grid-AutoColumn:"Row2" rangeTotal:"Range: 30"
            └─┬ UK filler id:row-group-0-UK ag-Grid-AutoColumn:"UK" rangeTotal:"Range: 20"
            · ├── Row1 LEAF id:uk-1 ag-Grid-AutoColumn:"Row1" rangeTotal:"Range: 5"
            · └── Row2 LEAF id:uk-2 ag-Grid-AutoColumn:"Row2" rangeTotal:"Range: 25"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:500 flex:1
            └── rangeTotal "Total" width:500 flex:1 aggFunc:custom
        `);
    });

    test('does not unwrap .value for leaf row data', async () => {
        const api = gridMgr.createGrid('tree-data-agg-object-leaf-noop', {
            columnDefs: [
                {
                    field: 'stats',
                    colId: 'stats',
                    valueFormatter: (params) => JSON.stringify(params.value),
                    aggFunc: 'first',
                },
            ],
            defaultColDef: { flex: 1 },
            groupDefaultExpanded: -1,
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [
                { id: 'ie-1', path: ['Ireland', 'Row1'], stats: { value: 42, extra: 'data' } },
                { id: 'ie-2', path: ['Ireland', 'Row2'], stats: { value: 99, extra: 'more' } },
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
            └─┬ Ireland filler id:row-group-0-Ireland ag-Grid-AutoColumn:"Ireland" stats:'{"value":42,"extra":"data"}'
            · ├── Row1 LEAF id:ie-1 ag-Grid-AutoColumn:"Row1" stats:'{"value":42,"extra":"data"}'
            · └── Row2 LEAF id:ie-2 ag-Grid-AutoColumn:"Row2" stats:'{"value":99,"extra":"more"}'
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
            └─┬ Ireland filler id:row-group-0-Ireland ag-Grid-AutoColumn:"Ireland" stats:'{"value":42,"extra":"data"}'
            · ├── Row1 LEAF id:ie-1 ag-Grid-AutoColumn:"Row1" stats:'{"value":42,"extra":"data"}'
            · └── Row2 LEAF id:ie-2 ag-Grid-AutoColumn:"Row2" stats:'{"value":99,"extra":"more"}'
        `);
        expect(leafNode).toBeDefined();
        expect(leafNode!.group).toBe(false);

        // Leaf rows should still return the raw object (not unwrapped)
        const leafValue = api.getCellValue({ rowNode: leafNode!, colKey: 'stats', useFormatter: false });
        expect(leafValue).toEqual({ value: 42, extra: 'data' });
    });

    test('groupSafeValueFormatter unwraps .value in multi-level group aggregation', async () => {
        const api = gridMgr.createGrid('tree-data-agg-object-multi-level', {
            columnDefs: [{ field: 'total', colId: 'rangeTotal', aggFunc: rangeAggFunc }],
            defaultColDef: { flex: 1 },
            autoGroupColumnDef: { minWidth: 220 },
            groupDefaultExpanded: -1,
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [
                { id: 'ie-2020-1', path: ['Ireland', '2020', 'Row1'], total: 10 },
                { id: 'ie-2020-2', path: ['Ireland', '2020', 'Row2'], total: 30 },
                { id: 'ie-2021-1', path: ['Ireland', '2021', 'Row1'], total: 5 },
                { id: 'ie-2021-2', path: ['Ireland', '2021', 'Row2'], total: 50 },
            ],
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'multi-level tree data').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Ireland filler id:row-group-0-Ireland ag-Grid-AutoColumn:"Ireland" rangeTotal:"45"
            · ├─┬ 2020 filler id:row-group-0-Ireland-1-2020 ag-Grid-AutoColumn:"2020" rangeTotal:"20"
            · │ ├── Row1 LEAF id:ie-2020-1 ag-Grid-AutoColumn:"Row1" rangeTotal:10
            · │ └── Row2 LEAF id:ie-2020-2 ag-Grid-AutoColumn:"Row2" rangeTotal:30
            · └─┬ 2021 filler id:row-group-0-Ireland-1-2021 ag-Grid-AutoColumn:"2021" rangeTotal:"45"
            · · ├── Row1 LEAF id:ie-2021-1 ag-Grid-AutoColumn:"Row1" rangeTotal:5
            · · └── Row2 LEAF id:ie-2021-2 ag-Grid-AutoColumn:"Row2" rangeTotal:50
        `);
    });

    test('groupSafeValueFormatter handles .value === 0 correctly', async () => {
        const api = gridMgr.createGrid('tree-data-agg-object-zero-value', {
            columnDefs: [{ field: 'total', colId: 'rangeTotal', aggFunc: rangeAggFunc }],
            defaultColDef: { flex: 1 },
            autoGroupColumnDef: { minWidth: 220 },
            groupDefaultExpanded: -1,
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [
                { id: 'ie-1', path: ['Ireland', 'Row1'], total: 5 },
                { id: 'ie-2', path: ['Ireland', 'Row2'], total: 5 }, // same values -> range = 0
            ],
            getRowId: (params) => params.data.id,
        });

        // value === 0 should still be formatted, not skipped as falsy
        await new GridRows(api, 'zero value tree data').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Ireland filler id:row-group-0-Ireland ag-Grid-AutoColumn:"Ireland" rangeTotal:"0"
            · ├── Row1 LEAF id:ie-1 ag-Grid-AutoColumn:"Row1" rangeTotal:5
            · └── Row2 LEAF id:ie-2 ag-Grid-AutoColumn:"Row2" rangeTotal:5
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

        const api = gridMgr.createGrid('tree-data-bigint-agg', {
            columnDefs: [
                { field: 'amount', colId: 'rangeAmount', cellDataType: 'bigint', aggFunc: bigintRangeAggFunc },
            ],
            defaultColDef: { flex: 1 },
            autoGroupColumnDef: { minWidth: 220 },
            groupDefaultExpanded: -1,
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [
                { id: 'ie-1', path: ['Ireland', 'Row1'], amount: 10n },
                { id: 'ie-2', path: ['Ireland', 'Row2'], amount: 30n },
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
                └─┬ Ireland filler id:row-group-0-Ireland ag-Grid-AutoColumn:"Ireland" rangeAmount:"20"
                · ├── Row1 LEAF id:ie-1 ag-Grid-AutoColumn:"Row1" rangeAmount:"10n"
                · └── Row2 LEAF id:ie-2 ag-Grid-AutoColumn:"Row2" rangeAmount:"30n"
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
                └─┬ Ireland filler id:row-group-0-Ireland ag-Grid-AutoColumn:"Ireland" rangeAmount:"20"
                · ├── Row1 LEAF id:ie-1 ag-Grid-AutoColumn:"Row1" rangeAmount:"10n"
                · └── Row2 LEAF id:ie-2 ag-Grid-AutoColumn:"Row2" rangeAmount:"30n"
            `);
    });

    test('groupSafeValueFormatter calls formatter when .value is null (v35.0.0 compat)', async () => {
        const nullValueAggFunc = () => ({ value: null });

        const api = gridMgr.createGrid('tree-data-agg-null-value', {
            columnDefs: [{ field: 'total', colId: 'nullTotal', aggFunc: nullValueAggFunc }],
            defaultColDef: { flex: 1 },
            groupDefaultExpanded: -1,
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [
                { id: 'ie-1', path: ['Ireland', 'Row1'], total: 10 },
                { id: 'ie-2', path: ['Ireland', 'Row2'], total: 30 },
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
                └─┬ Ireland filler id:row-group-0-Ireland ag-Grid-AutoColumn:"Ireland" nullTotal:""
                · ├── Row1 LEAF id:ie-1 ag-Grid-AutoColumn:"Row1" nullTotal:10
                · └── Row2 LEAF id:ie-2 ag-Grid-AutoColumn:"Row2" nullTotal:30
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
            └─┬ Ireland filler id:row-group-0-Ireland ag-Grid-AutoColumn:"Ireland" nullTotal:""
            · ├── Row1 LEAF id:ie-1 ag-Grid-AutoColumn:"Row1" nullTotal:10
            · └── Row2 LEAF id:ie-2 ag-Grid-AutoColumn:"Row2" nullTotal:30
        `);
    });

    test('groupSafeValueFormatter calls toNumber() for BigDecimal-like aggregation results', async () => {
        const toNumberAggFunc = (params: IAggFuncParams) => {
            const sum = params.values.reduce((a: number, b: number) => a + b, 0);
            return { toNumber: () => sum };
        };

        const api = gridMgr.createGrid('tree-data-agg-toNumber', {
            columnDefs: [{ field: 'total', colId: 'sumTotal', aggFunc: toNumberAggFunc }],
            defaultColDef: { flex: 1 },
            groupDefaultExpanded: -1,
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [
                { id: 'ie-1', path: ['Ireland', 'Row1'], total: 10 },
                { id: 'ie-2', path: ['Ireland', 'Row2'], total: 30 },
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
            └─┬ Ireland filler id:row-group-0-Ireland ag-Grid-AutoColumn:"Ireland" sumTotal:"40"
            · ├── Row1 LEAF id:ie-1 ag-Grid-AutoColumn:"Row1" sumTotal:10
            · └── Row2 LEAF id:ie-2 ag-Grid-AutoColumn:"Row2" sumTotal:30
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
            └─┬ Ireland filler id:row-group-0-Ireland ag-Grid-AutoColumn:"Ireland" sumTotal:"40"
            · ├── Row1 LEAF id:ie-1 ag-Grid-AutoColumn:"Row1" sumTotal:10
            · └── Row2 LEAF id:ie-2 ag-Grid-AutoColumn:"Row2" sumTotal:30
        `);
    });
});

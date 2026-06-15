import type { Column, GridApi, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, ShowValueAsModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

interface SaleRow {
    id: string;
    country: string;
    amount: number;
}

function leaf(api: GridApi, id: string): IRowNode {
    const node = api.getRowNode(id);
    if (!node) {
        throw new Error(`Leaf '${id}' not found`);
    }
    return node;
}

function group(api: GridApi, key: string): IRowNode {
    let found: IRowNode | undefined;
    api.forEachNode((node) => {
        if (node.group && node.key === key && !found) {
            found = node;
        }
    });
    if (!found) {
        throw new Error(`Group '${key}' not found`);
    }
    return found;
}

describe('showValueAs transform', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule, ShowValueAsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('percentOfGrandTotal on a flat grid (root auto-ensured)', async () => {
        const api = gridsManager.createGrid('flat-grand-total', {
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'A', amount: 25 },
                { id: '3', country: 'B', amount: 50 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'flat grand total').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'flat grand total').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            ├── LEAF id:2 country:"A" amount:"25.00%"
            └── LEAF id:3 country:"B" amount:"50.00%"
        `);

        // Transformed display value = leaf ÷ grand total (25/100, 50/100).
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.25);
        expect(api.getCellValue({ rowNode: leaf(api, '3'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.5);
        // Formatted as a percentage (Excel default: 2 decimals).
        expect(
            api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', useFormatter: true, from: 'transformed' })
        ).toBe('25.00%');
        expect(
            api.getCellValue({ rowNode: leaf(api, '3'), colKey: 'amount', useFormatter: true, from: 'transformed' })
        ).toBe('50.00%');

        // Raw accessors are unchanged (BC1): 'value'/'data' return the raw amount, not the percentage.
        expect(leaf(api, '1').getDataValue('amount', 'value')).toBe(25);
        expect(leaf(api, '1').getDataValue('amount')).toBe(25);
        // The explicit opt-in accessor returns the transformed value.
        expect(leaf(api, '1').getDataValue('amount', 'transformed')).toBeCloseTo(0.25);
        // The default `from` (and any non-'transformed' from) returns the raw value through the display API.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount' })).toBe(25);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'data' })).toBe(25);
    });

    test('percentOfGrandTotal across group rows and leaves', async () => {
        const api = gridsManager.createGrid('grouped-grand-total', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'grouped grand total').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'grouped grand total').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"30.00%"
            │ └── LEAF id:2 country:"A" amount:"10.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"60.00%"
        `);

        // Group A = 40/100, Group B = 60/100.
        expect(api.getCellValue({ rowNode: group(api, 'A'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.4);
        expect(api.getCellValue({ rowNode: group(api, 'B'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.6);
        // Leaves are a share of the grand total too.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.3);
        // Group aggregate raw value is unchanged.
        expect(group(api, 'A').getDataValue('amount', 'value')).toBe(40);
    });

    test('percentOfParentTotal: relative to the chosen base field — its rows show 100%, descendants are a share of it', async () => {
        const api = gridsManager.createGrid('parent-total', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                // Excel "% of Parent Total": pick a base field (here the country grouping); each country shows
                // 100% and its leaves are a share of their country — not the immediate parent (that is
                // percentOfParentRowTotal).
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: { type: 'percentOfParentTotal', params: { baseField: 'country' } },
                },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'parent total').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfParentTotal
        `);
        await new GridRows(api, 'parent total').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"100.00%"
            │ ├── LEAF id:1 country:"A" amount:"75.00%"
            │ └── LEAF id:2 country:"A" amount:"25.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"100.00%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);

        // The base-field rows (countries) are 100% of themselves.
        expect(api.getCellValue({ rowNode: group(api, 'A'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(1);
        // Leaves are a share of their base-field ancestor: 30/40, 10/40.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.75);
        expect(api.getCellValue({ rowNode: leaf(api, '2'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.25);
    });

    test('parent mode is dormant on a flat grid → shows the raw value', async () => {
        const api = gridsManager.createGrid('parent-dormant', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfParentTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'parent dormant').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfParentTotal
        `);
        await new GridRows(api, 'parent dormant').check(`
            ROOT id:ROOT_NODE_ID amount:100
            ├── LEAF id:1 country:"A" amount:25
            └── LEAF id:2 country:"B" amount:75
        `);

        // No row grouping → percentOfParentTotal is not meaningful → raw value shown, not blank.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBe(25);
        expect(api.getCellValue({ rowNode: leaf(api, '2'), colKey: 'amount', from: 'transformed' })).toBe(75);
    });

    test('a total mode on a non-aggregated numeric column promotes it to a value column (Excel "drag to Values")', async () => {
        const api = gridsManager.createGrid('grand-total-promote', {
            columnDefs: [
                { field: 'country' },
                // No aggFunc, but percentOfGrandTotal needs a total → the column is promoted to a value column.
                { field: 'amount', showValueAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'promote value column').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'promote value column').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);

        // Auto-aggregated with the default sum, so the grand total (100) exists: 25/100, 75/100.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.25);
        expect(api.getCellValue({ rowNode: leaf(api, '2'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.75);
        expect(api.getColumn('amount')!.isValueActive()).toBe(true);
        // Raw value still readable.
        expect(leaf(api, '1').getDataValue('amount', 'value')).toBe(25);
    });

    test('a non-numeric column can opt into showValueAs with a custom transform (no promotion)', async () => {
        const api = gridsManager.createGrid('sva-non-numeric', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'label',
                    showValueAs: 'shout',
                    showValueAsConfig: {
                        modes: {
                            shout: {
                                transform: (p) => String(p.rawValue ?? '').toUpperCase(),
                                transformedDataType: 'text',
                            },
                        },
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', label: 'hi' },
                { id: '2', country: 'B', label: 'bye' },
            ],
        });

        await new GridColumns(api, 'non-numeric custom transform').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── label "Label" width:200 showValueAs:shout
        `);
        await new GridRows(api, 'non-numeric custom transform').check(`
            ROOT id:ROOT_NODE_ID label:""
            ├── LEAF id:1 country:"A" label:"HI"
            └── LEAF id:2 country:"B" label:"BYE"
        `);

        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'label', from: 'transformed' })).toBe('HI');
        // The custom mode does not require aggregation, so a text column is never promoted.
        expect(api.getColumn('label')!.isValueActive()).toBe(false);
    });

    test('applyColumnState promotes a non-aggregated column when it sets a total mode', async () => {
        const api = gridsManager.createGrid('sva-state-promote', {
            columnDefs: [{ field: 'country' }, { field: 'amount' }], // amount: numeric, no aggFunc
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'before promote state').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200
        `);
        await new GridRows(api, 'before promote state').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 country:"A" amount:25
            └── LEAF id:2 country:"B" amount:75
        `);

        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: 'percentOfGrandTotal' }] });

        await new GridColumns(api, 'after promote state').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'after promote state').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);

        expect(api.getColumn('amount')!.isValueActive()).toBe(true);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.25);
    });

    test('mode round-trips through column state and clears via applyColumnState', async () => {
        const api = gridsManager.createGrid('state-round-trip', {
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ] satisfies SaleRow[],
        });
        const amountCell = () =>
            document.querySelector<HTMLElement>('#state-round-trip [row-index="0"] [col-id="amount"]')!;

        await new GridColumns(api, 'round-trip initial').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'round-trip initial').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);
        expect(amountCell()).toHaveTextContent('25.00%');

        // The mode serialises on the column that has it; columns without a mode serialise `null` (never undefined).
        const state = api.getColumnState();
        expect(state.find((s) => s.colId === 'amount')?.showValueAs).toBe('percentOfGrandTotal');
        expect(state.find((s) => s.colId === 'country')?.showValueAs).toBeNull();

        // Clearing via state shows the raw value again.
        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: null }] });
        // GridColumns confirms the mode was dropped (GridRows is omitted: a flat grid with an
        // explicit aggFunc keeps root aggData, which the rows validator flags once showValueAs is gone).
        await new GridColumns(api, 'round-trip cleared').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum
        `);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBe(25);
        expect(amountCell()).toHaveTextContent('25');

        // Restoring the captured state re-applies the transform.
        api.applyColumnState({ state });
        await new GridColumns(api, 'round-trip restored').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'round-trip restored').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.25);
        expect(amountCell()).toHaveTextContent('25.00%');
    });

    test('custom mode registered grid-wide via defaultColDef.showValueAsConfig', async () => {
        const api = gridsManager.createGrid('custom-mode', {
            // Grid-wide modes are registered through defaultColDef (deep-merged into every column).
            defaultColDef: {
                showValueAsConfig: {
                    modes: {
                        // Custom mode using its own `params` (TParams).
                        share: {
                            transform: (p) => (p.params.target ? (p.rawValue as number) / p.params.target : null),
                            params: { target: 100 },
                        },
                    },
                },
            },
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'share' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'grid-wide custom mode').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:share
        `);
        await new GridRows(api, 'grid-wide custom mode').check(`
            ROOT id:ROOT_NODE_ID amount:1
            ├── LEAF id:1 country:"A" amount:0.25
            └── LEAF id:2 country:"B" amount:0.75
        `);

        // Custom mode resolves via the registry and reads its own params (25 / target 100).
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.25);
        // getShowValueAs() returns the active resolved mode (its `type` is the active mode name).
        expect(api.getColumn('amount')?.getShowValueAs()?.type).toBe('share');
        // getShowValueAsConfig() exposes the full resolved config — every available mode, keyed by type.
        const resolvedConfig = api.getColumn('amount')?.getShowValueAsConfig();
        expect(resolvedConfig?.modes['share']?.type).toBe('share');
        expect(resolvedConfig?.modes['percentOfGrandTotal']?.type).toBe('percentOfGrandTotal');
        // A named custom mode round-trips through state.
        expect(api.getColumnState().find((s) => s.colId === 'amount')?.showValueAs).toBe('share');
    });

    test('per-column custom mode via showValueAsConfig.modes', async () => {
        const api = gridsManager.createGrid('per-column-mode', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'half',
                    showValueAsConfig: { modes: { half: { transform: (p) => (p.rawValue as number) / 2 } } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', amount: 25 }],
        });

        await new GridColumns(api, 'per-column custom mode').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:half
        `);
        await new GridRows(api, 'per-column custom mode').check(`
            ROOT id:ROOT_NODE_ID amount:12.5
            └── LEAF id:1 country:"A" amount:12.5
        `);

        // A mode defined in the column's own config resolves and applies.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(12.5);
        // The selected mode name round-trips through state (the modes map stays colDef config).
        expect(api.getColumnState().find((s) => s.colId === 'amount')?.showValueAs).toBe('half');
    });

    test('percentOfRowTotal — a share of the value field across the pivot columns', async () => {
        const api = gridsManager.createGrid('row-total', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', showValueAs: 'percentOfRowTotal' },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'X', year: 2020, gold: 30 },
                { id: '2', country: 'X', year: 2021, gold: 10 },
            ],
        });
        const groupX = group(api, 'X');
        const goldCol = (year: number): Column => {
            const col = api.getPivotResultColumn([String(year)], 'gold');
            if (!col) {
                throw new Error(`pivot column ${year} not found`);
            }
            return col;
        };

        await new GridColumns(api, 'percentOfRowTotal').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2020" GROUP
            │ └── pivot_year_2020_gold "Gold" width:200 showValueAs:percentOfRowTotal columnGroupShow:open
            └─┬ "2021" GROUP
              └── pivot_year_2021_gold "Gold" width:200 showValueAs:percentOfRowTotal columnGroupShow:open
        `);
        await new GridRows(api, 'percentOfRowTotal', {
            forcedColumns: ['ag-Grid-AutoColumn', goldCol(2020).getColId(), goldCol(2021).getColId()],
            printHiddenRows: false,
        }).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_gold:"75.00%" pivot_year_2021_gold:"25.00%"
            └── LEAF_GROUP collapsed id:row-group-country-X ag-Grid-AutoColumn:"X" pivot_year_2020_gold:"75.00%" pivot_year_2021_gold:"25.00%"
        `);

        // Row total across the year columns = 40: 2020 = 30/40, 2021 = 10/40.
        expect(api.getCellValue({ rowNode: groupX, colKey: goldCol(2020), from: 'transformed' })).toBeCloseTo(0.75);
        expect(api.getCellValue({ rowNode: groupX, colKey: goldCol(2021), from: 'transformed' })).toBeCloseTo(0.25);
    });

    test('percentOfRowTotal is dormant (shows the raw value) when not pivoting', async () => {
        const api = gridsManager.createGrid('row-total-dormant', {
            columnDefs: [{ field: 'country' }, { field: 'gold', aggFunc: 'sum', showValueAs: 'percentOfRowTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', gold: 30 }],
        });

        await new GridColumns(api, 'row total dormant').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── gold "Gold" width:200 aggFunc:sum showValueAs:percentOfRowTotal
        `);
        await new GridRows(api, 'row total dormant').check(`
            ROOT id:ROOT_NODE_ID gold:30
            └── LEAF id:1 country:"A" gold:30
        `);

        // No pivot ⇒ no column axis to total across ⇒ dormant, raw value shown.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'gold', from: 'transformed' })).toBe(30);
    });

    test('pivot — percentOfGrandTotal uses the 2-D total, percentOfColumnTotal each column total', async () => {
        const api = gridsManager.createGrid('pivot-grand-vs-column', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
                { field: 'silver', aggFunc: 'sum', showValueAs: 'percentOfColumnTotal' },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'X', year: 2020, gold: 30, silver: 5 },
                { id: '2', country: 'X', year: 2021, gold: 10, silver: 5 },
                { id: '3', country: 'Y', year: 2020, gold: 20, silver: 5 },
                { id: '4', country: 'Y', year: 2021, gold: 40, silver: 5 },
            ],
        });
        const groupX = group(api, 'X');
        const col = (field: string, year: number): Column => {
            const c = api.getPivotResultColumn([String(year)], field);
            if (!c) {
                throw new Error(`pivot column ${field}/${year} not found`);
            }
            return c;
        };

        await new GridColumns(api, 'pivot grand-vs-column').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2020" GROUP
            │ ├── pivot_year_2020_gold "Gold" width:200 showValueAs:percentOfGrandTotal columnGroupShow:open
            │ └── pivot_year_2020_silver "Silver" width:200 showValueAs:percentOfColumnTotal columnGroupShow:open
            └─┬ "2021" GROUP
              ├── pivot_year_2021_gold "Gold" width:200 showValueAs:percentOfGrandTotal columnGroupShow:open
              └── pivot_year_2021_silver "Silver" width:200 showValueAs:percentOfColumnTotal columnGroupShow:open
        `);
        await new GridRows(api, 'pivot grand-vs-column', {
            forcedColumns: ['ag-Grid-AutoColumn', col('gold', 2020).getColId(), col('silver', 2020).getColId(), col('gold', 2021).getColId(), col('silver', 2021).getColId()], // prettier-ignore
            printHiddenRows: false,
        }).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_gold:"50.00%" pivot_year_2020_silver:"100.00%" pivot_year_2021_gold:"50.00%" pivot_year_2021_silver:"100.00%"
            ├── LEAF_GROUP collapsed id:row-group-country-X ag-Grid-AutoColumn:"X" pivot_year_2020_gold:"30.00%" pivot_year_2020_silver:"50.00%" pivot_year_2021_gold:"10.00%" pivot_year_2021_silver:"50.00%"
            └── LEAF_GROUP collapsed id:row-group-country-Y ag-Grid-AutoColumn:"Y" pivot_year_2020_gold:"20.00%" pivot_year_2020_silver:"50.00%" pivot_year_2021_gold:"40.00%" pivot_year_2021_silver:"50.00%"
        `);

        // gold grand total is the 2-D total across all year columns = 100 ⇒ X/2020 gold = 30/100.
        expect(api.getCellValue({ rowNode: groupX, colKey: col('gold', 2020), from: 'transformed' })).toBeCloseTo(0.3);
        // silver column total for 2020 = 5 + 5 = 10 ⇒ X/2020 silver = 5/10 (differs from grand total).
        expect(api.getCellValue({ rowNode: groupX, colKey: col('silver', 2020), from: 'transformed' })).toBeCloseTo(
            0.5
        );
    });

    test('percentOfColumnTotal equals percentOfGrandTotal when not pivoting', async () => {
        const api = gridsManager.createGrid('column-total', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfColumnTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'column total flat').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfColumnTotal
        `);
        await new GridRows(api, 'column total flat').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);

        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.25);
    });

    test('transformed value goes to showValueAsFormatter, never the column valueFormatter', async () => {
        const valueFormatterValues: unknown[] = [];
        const showValueAsFormatterCalls: { value: unknown; rawValue: unknown; type: string }[] = [];
        const api = gridsManager.createGrid('formatter-isolation', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'percentOfGrandTotal',
                    valueFormatter: (p) => {
                        valueFormatterValues.push(p.value);
                        return `$${p.value}`;
                    },
                    showValueAsConfig: {
                        modes: {
                            percentOfGrandTotal: {
                                formatter: (p) => {
                                    showValueAsFormatterCalls.push({
                                        value: p.value,
                                        rawValue: p.rawValue,
                                        type: p.showValueAsType,
                                    });
                                    return `${(p.value as number) * 100}pct`;
                                },
                            },
                        },
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'formatter isolation').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'formatter isolation').check(`
            ROOT id:ROOT_NODE_ID amount:"100pct"
            ├── LEAF id:1 country:"A" amount:"25pct"
            └── LEAF id:2 country:"B" amount:"75pct"
        `);

        const formatted = api.getCellValue({
            rowNode: leaf(api, '1'),
            colKey: 'amount',
            useFormatter: true,
            from: 'transformed',
        });
        expect(formatted).toBe('25pct');
        expect(showValueAsFormatterCalls).toContainEqual({
            value: expect.closeTo(0.25),
            rawValue: 25,
            type: 'percentOfGrandTotal',
        });
        // The column's own valueFormatter never receives the transformed (fractional) value.
        expect(valueFormatterValues).not.toContain(0.25);
    });

    test('showValueAs inherits from defaultColDef', async () => {
        const api = gridsManager.createGrid('default-col-def', {
            defaultColDef: { showValueAs: 'percentOfGrandTotal' },
            columnDefs: [{ field: 'amount', aggFunc: 'sum' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'inherit defaultColDef').checkColumns(`
            CENTER
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'inherit defaultColDef').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 amount:"25.00%"
            └── LEAF id:2 amount:"75.00%"
        `);

        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.25);
    });

    test('a disabled mode renders the raw value', async () => {
        const api = gridsManager.createGrid('disabled-mode', {
            defaultColDef: { showValueAsConfig: { modes: { percentOfGrandTotal: null } } },
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'disabled mode').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum
        `);
        await new GridRows(api, 'disabled mode').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 country:"A" amount:25
            └── LEAF id:2 country:"B" amount:75
        `);

        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBe(25);
    });

    test('pivot — percentOfParentColumnTotal (relative to the parent pivot column group)', async () => {
        const api = gridsManager.createGrid('pivot-parent-column', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'region', pivot: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfParentColumnTotal' },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'X', region: 'EU', year: 2020, amount: 100 },
                { id: '2', country: 'X', region: 'EU', year: 2021, amount: 300 },
                { id: '3', country: 'X', region: 'US', year: 2020, amount: 200 },
                { id: '4', country: 'X', region: 'US', year: 2021, amount: 200 },
            ],
        });

        const groupX = group(api, 'X');
        const leafCol = (region: string, year: number): Column => {
            const col = api.getPivotResultColumn([region, String(year)], 'amount');
            if (!col) {
                throw new Error(`pivot column ${region}/${year} not found`);
            }
            return col;
        };

        await new GridColumns(api, 'percentOfParentColumnTotal').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "EU" GROUP closed
            │ ├─┬ "2020" GROUP hidden
            │ │ └── pivot_region-year_EU-2020_amount "Amount" width:200 showValueAs:percentOfParentColumnTotal columnGroupShow:open hidden
            │ ├─┬ "2021" GROUP hidden
            │ │ └── pivot_region-year_EU-2021_amount "Amount" width:200 showValueAs:percentOfParentColumnTotal columnGroupShow:open hidden
            │ └── pivot_region-year_EU_amount "Amount" width:200 showValueAs:percentOfParentColumnTotal columnGroupShow:closed
            └─┬ "US" GROUP closed
              ├─┬ "2020" GROUP hidden
              │ └── pivot_region-year_US-2020_amount "Amount" width:200 showValueAs:percentOfParentColumnTotal columnGroupShow:open hidden
              ├─┬ "2021" GROUP hidden
              │ └── pivot_region-year_US-2021_amount "Amount" width:200 showValueAs:percentOfParentColumnTotal columnGroupShow:open hidden
              └── pivot_region-year_US_amount "Amount" width:200 showValueAs:percentOfParentColumnTotal columnGroupShow:closed
        `);
        await new GridRows(api, 'percentOfParentColumnTotal', {
            forcedColumns: ['ag-Grid-AutoColumn', leafCol('EU', 2020).getColId(), leafCol('EU', 2021).getColId(), leafCol('US', 2020).getColId(), leafCol('US', 2021).getColId()], // prettier-ignore
            printHiddenRows: false,
        }).check(`
            ROOT id:ROOT_NODE_ID pivot_region-year_EU-2020_amount:"25.00%" pivot_region-year_EU-2021_amount:"75.00%" pivot_region-year_US-2020_amount:"50.00%" pivot_region-year_US-2021_amount:"50.00%"
            └── LEAF_GROUP collapsed id:row-group-country-X ag-Grid-AutoColumn:"X" pivot_region-year_EU-2020_amount:"25.00%" pivot_region-year_EU-2021_amount:"75.00%" pivot_region-year_US-2020_amount:"50.00%" pivot_region-year_US-2021_amount:"50.00%"
        `);

        // Each year cell is relative to its region (parent) column total: EU=400, US=400.
        expect(api.getCellValue({ rowNode: groupX, colKey: leafCol('EU', 2020), from: 'transformed' })).toBeCloseTo(
            0.25
        );
        expect(api.getCellValue({ rowNode: groupX, colKey: leafCol('EU', 2021), from: 'transformed' })).toBeCloseTo(
            0.75
        );
        expect(api.getCellValue({ rowNode: groupX, colKey: leafCol('US', 2020), from: 'transformed' })).toBeCloseTo(
            0.5
        );
    });

    test('pivot — percentOfParentColumnTotal blanks a top-level (single pivot field) column: no parent column', async () => {
        const api = gridsManager.createGrid('pivot-parent-column-depth1', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'region', pivot: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfParentColumnTotal' },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'X', region: 'EU', amount: 100 },
                { id: '2', country: 'X', region: 'US', amount: 300 },
            ],
        });
        const groupX = group(api, 'X');
        const col = (region: string): Column => {
            const c = api.getPivotResultColumn([region], 'amount');
            if (!c) {
                throw new Error(`pivot column ${region} not found`);
            }
            return c;
        };
        // With one pivot field every result column is top-level, so it has no parent column group to be a
        // percentage of — the transform yields null (blank), not Infinity/NaN. (A grand-total `[]`-key column,
        // when one exists, would be used as the parent instead.)
        expect(api.getCellValue({ rowNode: groupX, colKey: col('EU'), from: 'transformed' })).toBeNull();
        expect(api.getCellValue({ rowNode: groupX, colKey: col('US'), from: 'transformed' })).toBeNull();
    });

    test('showValueAsInitial applies the mode at creation and lets the user change it at runtime', async () => {
        const api = gridsManager.createGrid('sva-initial', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValueAsInitial: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });
        // Initial mode applied at creation (from:'transformed' → fraction when a mode is active, raw otherwise).
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.25);

        // The user can clear it at runtime (it is a starting value, not a forced one).
        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: null }] });
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBe(25);

        // ...and switch to a different mode.
        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: 'percentOfGrandTotal' }] });
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.25);
    });

    test('showValueAsInitial is not re-imposed on a later colDef update (initial = create-only)', async () => {
        const api = gridsManager.createGrid('sva-initial-update', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValueAsInitial: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.25);

        // User clears the mode at runtime.
        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: null }] });
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBe(25);

        // An unrelated colDef update must NOT re-impose the create-only initial mode.
        api.setGridOption('columnDefs', [
            { field: 'country' },
            { field: 'amount', aggFunc: 'sum', showValueAsInitial: 'percentOfGrandTotal', headerName: 'Amount $' },
        ]);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBe(25);
    });

    test('an unknown / typo-d mode name shows the raw value and does not throw', async () => {
        const api = gridsManager.createGrid('sva-unknown-mode', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfNothingReal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });
        // No such mode → no active transform (and no grand-total root ensured) → raw values shown, no crash.
        await new GridRows(api, 'unknown mode raw').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 country:"A" amount:25
            └── LEAF id:2 country:"B" amount:75
        `);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBe(25);
    });

    test('column state round-trips a per-selection precision (not just the mode name)', async () => {
        const api = gridsManager.createGrid('state-precision', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: { type: 'percentOfGrandTotal', precision: 1 },
                    showValueAsConfig: { precision: 3 }, // config default differs from the per-selection precision
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });
        // The per-selection precision (1) is captured in state — not collapsed to the bare name or the config default.
        const state = api.getColumnState().find((s) => s.colId === 'amount');
        expect(state?.showValueAs).toEqual({ type: 'percentOfGrandTotal', precision: 1 });

        // Round-trip: clear, then re-apply the captured state → precision 1 survives (25.0%, not 25.000%).
        api.applyColumnState({ state: [{ colId: 'amount', showValueAs: null }] });
        api.applyColumnState({ state: [state!] });
        expect(
            api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', useFormatter: true, from: 'transformed' })
        ).toBe('25.0%');
    });

    test('precision is set per selection, falling back to showValueAsConfig.precision', async () => {
        const api = gridsManager.createGrid('precision', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    // Per-selection precision overrides the config default.
                    showValueAs: { type: 'percentOfGrandTotal', precision: 0 },
                    showValueAsConfig: { precision: 3 },
                },
                {
                    field: 'units',
                    aggFunc: 'sum',
                    // No per-selection precision → the config default applies.
                    showValueAs: 'percentOfGrandTotal',
                    showValueAsConfig: { precision: 3 },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25, units: 1 },
                { id: '2', country: 'B', amount: 75, units: 3 }, // totals: amount 100, units 4
            ],
        });

        await new GridColumns(api, 'precision').checkColumns(`
            CENTER
            ├── country "Country" width:200
            ├── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
            └── units "Units" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'precision').check(`
            ROOT id:ROOT_NODE_ID amount:"100%" units:"100.000%"
            ├── LEAF id:1 country:"A" amount:"25%" units:"25.000%"
            └── LEAF id:2 country:"B" amount:"75%" units:"75.000%"
        `);

        const fmt = (colKey: string) =>
            api.getCellValue({ rowNode: leaf(api, '1'), colKey, useFormatter: true, from: 'transformed' });
        expect(fmt('amount')).toBe('25%'); // selection precision 0
        expect(fmt('units')).toBe('25.000%'); // config precision 3 (1/4)
    });

    test('the transform never mutates aggData', async () => {
        const api = gridsManager.createGrid('no-mutate', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
            ] satisfies SaleRow[],
        });

        await new GridColumns(api, 'no-mutate').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'no-mutate').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            └─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"100.00%"
            · ├── LEAF id:1 country:"A" amount:"75.00%"
            · └── LEAF id:2 country:"A" amount:"25.00%"
        `);

        const groupA = group(api, 'A');
        expect(groupA.aggData.amount).toBe(40);
        // Reading the transformed value must not write back into aggData.
        api.getCellValue({ rowNode: groupA, colKey: 'amount', from: 'transformed' });
        groupA.getDataValue('amount', 'transformed');
        expect(groupA.aggData.amount).toBe(40);
    });

    test('transformed values recompute when row data changes the totals (applyTransaction)', async () => {
        const api = gridsManager.createGrid('sva-data-update', {
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 }, // grand total 100
            ] satisfies SaleRow[],
        });

        await new GridRows(api, 'sva-data-update initial').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);

        // Update a value and add a row — the grand total shifts (100 → 50 + 75 + 100 = 225) and every
        // transformed cell must reflect the new denominator, not the stale one.
        api.applyTransaction({
            update: [{ id: '1', country: 'A', amount: 50 }],
            add: [{ id: '3', country: 'C', amount: 100 }],
        });

        await new GridRows(api, 'sva-data-update after transaction').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"22.22%"
            ├── LEAF id:2 country:"B" amount:"33.33%"
            └── LEAF id:3 country:"C" amount:"44.44%"
        `);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(
            50 / 225
        );
        expect(api.getCellValue({ rowNode: leaf(api, '3'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(
            100 / 225
        );
    });

    test('editing one cell reshares the OTHER rows too (the grand total moved)', async () => {
        const api = gridsManager.createGrid('sva-edit-reshare', {
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 }, // grand total 100
            ] satisfies SaleRow[],
        });

        // Edit leaf 1 (25 → 125): grand total 200 → 1 becomes 62.5%, and 2 — whose data didn't change —
        // must re-share to 37.5% (its denominator moved). The edit path re-aggregates without a full model
        // refresh, so the unchanged row's cell must still update.
        leaf(api, '1').setDataValue('amount', 125);

        await new GridRows(api, 'sva-edit-reshare after edit').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"62.50%"
            └── LEAF id:2 country:"B" amount:"37.50%"
        `);
    });

    test('replacing rowData reshares all transformed cells', async () => {
        const api = gridsManager.createGrid('sva-set-rowdata', {
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ] satisfies SaleRow[],
        });

        await new GridRows(api, 'sva-set-rowdata initial').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);

        // id:2 keeps amount 75 but its share changes (total 100 → 200) — its cell must still refresh.
        api.setGridOption('rowData', [
            { id: '1', country: 'A', amount: 125 },
            { id: '2', country: 'B', amount: 75 },
        ] satisfies SaleRow[]);

        await new GridRows(api, 'sva-set-rowdata after replace').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"62.50%"
            └── LEAF id:2 country:"B" amount:"37.50%"
        `);
    });
});

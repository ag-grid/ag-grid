import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

import type { GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextEditorModule, ValidationModule } from 'ag-grid-community';
import { CalculatedColumnsModule, FormulaModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked, asyncSetTimeout } from '../test-utils';

describe('ag-grid calculated columns', () => {
    const gridRowsOpts = { useFormatter: false } as const;
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CalculatedColumnsModule, NumberFilterModule, TextEditorModule] as Module[],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createGrid(id: string, opts: Partial<GridOptions>) {
        const options: GridOptions = {
            getRowId: (params) => params.data?.id,
            ...opts,
        };
        return gridsManager.createGrid(id, options);
    }

    test('same-row bracket references evaluate and recalculate without enabling row numbers', async () => {
        const rowData = [
            { id: 'r1', revenue: 10, cost: 3, first: 'Ada', last: 'Lovelace' },
            { id: 'r2', revenue: 20, cost: 8, first: 'Grace', last: 'Hopper' },
        ];
        const api = createGrid('calculated-basic', {
            rowData,
            columnDefs: [
                { field: 'revenue', colId: 'revenueCol' },
                { field: 'cost' },
                { field: 'first' },
                { field: 'last' },
                {
                    colId: 'profit',
                    headerName: 'Profit',
                    calculatedExpression: '[revenueCol] - [cost]',
                    cellDataType: 'number',
                },
                {
                    colId: 'profitable',
                    calculatedExpression: 'IF([profit] > 10, "yes", "no")',
                    cellDataType: 'text',
                },
                {
                    colId: 'name',
                    calculatedExpression: '[first] & " " & [last]',
                    cellDataType: 'text',
                },
            ],
        });

        await new GridRows(api, 'initial calculated columns', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenueCol:10 cost:3 first:"Ada" last:"Lovelace" profit:7 profitable:"no" name:"Ada Lovelace"
            └── LEAF id:r2 revenueCol:20 cost:8 first:"Grace" last:"Hopper" profit:12 profitable:"yes" name:"Grace Hopper"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── revenueCol "Revenue" width:200
            ├── cost "Cost" width:200
            ├── first "First" width:200
            ├── last "Last" width:200
            ├── profit "Profit" width:200
            ├── profitable width:200
            └── name width:200
        `);

        api.getRowNode('r1')!.setDataValue('revenueCol', 15);
        await asyncSetTimeout(1);

        await new GridRows(api, 'after setDataValue', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenueCol:15 cost:3 first:"Ada" last:"Lovelace" profit:12 profitable:"yes" name:"Ada Lovelace"
            └── LEAF id:r2 revenueCol:20 cost:8 first:"Grace" last:"Hopper" profit:12 profitable:"yes" name:"Grace Hopper"
        `);

        applyTransactionChecked(api, { update: [{ ...rowData[1], revenue: 30, cost: 9 }] });
        await asyncSetTimeout(1);

        await new GridRows(api, 'after transaction update', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenueCol:15 cost:3 first:"Ada" last:"Lovelace" profit:12 profitable:"yes" name:"Ada Lovelace"
            └── LEAF id:r2 revenueCol:30 cost:9 first:"Grace" last:"Hopper" profit:21 profitable:"yes" name:"Grace Hopper"
        `);

        api.setGridOption('rowData', [
            { id: 'r1', revenue: 40, cost: 25, first: 'Ada', last: 'Lovelace' },
            { id: 'r2', revenue: 30, cost: 9, first: 'Grace', last: 'Hopper' },
        ]);
        await asyncSetTimeout(1);

        await new GridRows(api, 'after rowData update', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenueCol:40 cost:25 first:"Ada" last:"Lovelace" profit:15 profitable:"yes" name:"Ada Lovelace"
            └── LEAF id:r2 revenueCol:30 cost:9 first:"Grace" last:"Hopper" profit:21 profitable:"yes" name:"Grace Hopper"
        `);
    });

    test('sorting, filtering and value formatters use evaluated values', async () => {
        const api = createGrid('calculated-sort-filter', {
            rowData: [
                { id: 'low', revenue: 10, cost: 7 },
                { id: 'mid', revenue: 20, cost: 11 },
                { id: 'high', revenue: 30, cost: 12 },
            ],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                {
                    colId: 'profit',
                    calculatedExpression: '[revenue] - [cost]',
                    cellDataType: 'number',
                    sortable: true,
                    filter: 'agNumberColumnFilter',
                    valueFormatter: (params) => `$${params.value}`,
                },
            ],
        });

        api.setFilterModel({
            profit: {
                filterType: 'number',
                type: 'greaterThan',
                filter: 5,
            },
        });
        api.applyColumnState({
            state: [{ colId: 'profit', sort: 'desc' }],
            defaultState: { sort: null },
        });
        await asyncSetTimeout(1);

        await new GridRows(api, 'filtered and sorted calculated values').check(`
            ROOT id:ROOT_NODE_ID profit:"$undefined"
            ├── LEAF id:high revenue:30 cost:12 profit:"$18"
            └── LEAF id:mid revenue:20 cost:11 profit:"$9"
        `);
    });

    test('grid api adds, updates and removes calculated columns', async () => {
        const api = createGrid('calculated-grid-api', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        api.addCalculatedColumn({
            colId: 'profit',
            headerName: 'Profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        });
        await asyncSetTimeout(1);

        await new GridRows(api, 'added calculated column', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);

        api.updateCalculatedColumn('profit', {
            calculatedExpression: '[revenue] * [cost]',
        });
        await asyncSetTimeout(1);

        await new GridRows(api, 'updated calculated column', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:30
        `);

        api.removeCalculatedColumn('profit');
        await asyncSetTimeout(1);

        await new GridColumns(api, 'removed calculated column').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
    });

    test('grid api refreshes calculated-only formula caches', async () => {
        const rowData = [{ id: 'r1', revenue: 10, cost: 3 }];
        const api = createGrid('calculated-refresh-api', {
            rowData,
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
        });

        const rowNode = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(7);

        rowData[0].revenue = 20;

        expect(api.refreshFormulas()).toBe(true);
        expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(17);
    });

    test('calculated columns are always non-editable', async () => {
        const api = createGrid('calculated-non-editable', {
            defaultColDef: {
                editable: true,
            },
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                {
                    colId: 'profit',
                    calculatedExpression: '[revenue] - [cost]',
                    editable: true,
                    cellEditor: 'agTextCellEditor',
                },
            ],
        });

        const rowNode = api.getRowNode('r1')!;
        const profitColumn = api.getColumn('profit')!;
        expect(profitColumn.isCellEditable(rowNode)).toBe(false);
        expect(profitColumn.isSuppressPaste(rowNode)).toBe(true);

        api.startEditingCell({ rowIndex: 0, colKey: 'profit' });
        expect(api.getEditingCells()).toEqual([]);
        expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(7);
    });

    test('calculated columns do not write through to row data', async () => {
        const rowData = [{ id: 'r1', revenue: 10, cost: 3, profit: 999 }];
        const api = createGrid('calculated-read-only-data', {
            rowData,
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                {
                    colId: 'profit',
                    field: 'profit',
                    calculatedExpression: '[revenue] - [cost]',
                },
            ],
        });

        const rowNode = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(7);
        expect(rowNode.setDataValue('profit', 100, 'data')).toBe(false);
        expect(rowData[0].profit).toBe(999);
        expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(7);
    });

    test('calculated columns add calculated column classes to headers and cells', async () => {
        createGrid('calculated-column-classes', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                {
                    colId: 'profit',
                    calculatedExpression: '[revenue] - [cost]',
                },
            ],
        });
        await asyncSetTimeout(1);

        const gridDiv = document.querySelector('#calculated-column-classes')!;
        expect(gridDiv.querySelector('[col-id="revenue"].ag-header-cell')).not.toHaveClass('ag-calculated-column');
        expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).toHaveClass('ag-calculated-column');
        expect(gridDiv.querySelector('[row-index="0"] [col-id="revenue"]')).not.toHaveClass('ag-calculated-column');
        expect(gridDiv.querySelector('[row-index="0"] [col-id="profit"]')).toHaveClass('ag-calculated-column');
    });

    test('unknown references, invalid syntax and cycles surface formula errors', async () => {
        const api = createGrid('calculated-errors', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'unknown', calculatedExpression: '[missing] + 1' },
                { colId: 'invalid', calculatedExpression: '[revenue] +' },
                { colId: 'cycleA', calculatedExpression: '[cycleB] + 1' },
                { colId: 'cycleB', calculatedExpression: '[cycleA] + 1' },
            ],
        });

        await new GridRows(api, 'calculated errors', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 unknown:"#PARSE!" invalid:"#PARSE!" cycleA:"#CIRCREF!" cycleB:"#CIRCREF!"
        `);
    });

    test('validates CalculatedColumnsModule registration', () => {
        const validationGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, ValidationModule],
        });
        let consoleErrorSpy: MockInstance | undefined;

        try {
            consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            validationGridsManager.createGrid('calculated-validation', {
                rowData: [{ revenue: 10, cost: 3 }],
                columnDefs: [
                    { field: 'revenue' },
                    { field: 'cost' },
                    { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
                ],
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #200'),
                expect.stringContaining('CalculatedColumnsModule'),
                expect.any(String)
            );
        } finally {
            validationGridsManager.reset();
            consoleErrorSpy?.mockRestore();
        }
    });

    test('does not evaluate calculatedExpression with FormulaModule alone', async () => {
        const formulaOnlyGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, FormulaModule, TextEditorModule],
        });

        try {
            const api = formulaOnlyGridsManager.createGrid('calculated-formula-module-only', {
                rowData: [{ revenue: 10, cost: 3, profit: 999 }],
                columnDefs: [
                    { field: 'revenue' },
                    { field: 'cost' },
                    {
                        field: 'profit',
                        calculatedExpression: '[revenue] - [cost]',
                        editable: true,
                        cellDataType: 'text',
                    },
                ],
            });

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const profitColumn = api.getColumn('profit')!;
            expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(999);
            expect(profitColumn.isCellEditable(rowNode)).toBe(true);
            expect(profitColumn.isSuppressPaste(rowNode)).toBe(false);
        } finally {
            formulaOnlyGridsManager.reset();
        }
    });
});

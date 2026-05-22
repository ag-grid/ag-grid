import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

import type { ColDef, ColGroupDef, GridOptions, Module } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    ColumnMenuModule,
    FormulaModule,
    ServerSideRowModelModule,
    ViewportRowModelModule,
} from 'ag-grid-enterprise';

import { createCalculatedColumnReferenceMapper } from '../../../../packages/ag-grid-enterprise/src/calculatedColumns/calculatedColumnReferenceMapper';
import {
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    asyncSetTimeout,
    waitForEvent,
} from '../test-utils';

describe('ag-grid calculated columns', () => {
    const gridRowsOpts = { useFormatter: false } as const;
    let restoreOffsetParent: (() => void) | undefined;
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            InfiniteRowModelModule,
            ServerSideRowModelModule,
            ViewportRowModelModule,
            CalculatedColumnsModule,
            ColumnMenuModule,
            NumberFilterModule,
            TextEditorModule,
            NumberEditorModule,
        ] as Module[],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    function createGrid(id: string, opts: Partial<GridOptions>) {
        const options: GridOptions = {
            getRowId: (params) => params.data?.id,
            ...opts,
        };
        return gridsManager.createGrid(id, options);
    }

    function enableOffsetParentPolyfill(): void {
        if (restoreOffsetParent) {
            return;
        }

        const originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
            configurable: true,
            get(this: HTMLElement) {
                return this.parentElement;
            },
        });

        restoreOffsetParent = () => {
            if (originalOffsetParent) {
                Object.defineProperty(HTMLElement.prototype, 'offsetParent', originalOffsetParent);
            } else {
                delete (HTMLElement.prototype as any).offsetParent;
            }
        };
    }

    function showColumnMenu(api: { showColumnMenu(colKey: string): void }, colKey: string): void {
        enableOffsetParentPolyfill();
        api.showColumnMenu(colKey);
    }

    function clickColumnMenuItem(name: string): void {
        const menuItemText = Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option-text')).find(
            (element) => element.textContent?.trim() === name
        );
        const menuItem = menuItemText?.closest<HTMLElement>('.ag-menu-option');
        expect(menuItem).toBeTruthy();
        menuItem!.click();
    }

    function getCalculatedColumnDialog(): HTMLElement {
        const dialog = document.querySelector<HTMLElement>('.ag-calculated-column-form');
        expect(dialog).toBeTruthy();
        return dialog!;
    }

    function setExpression(expression: string): void {
        const input = getCalculatedColumnDialog().querySelector<HTMLTextAreaElement>('textarea')!;
        input.value = expression;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function clickDialogButton(label: string): void {
        const button = Array.from(getCalculatedColumnDialog().querySelectorAll<HTMLButtonElement>('button')).find(
            (element) => element.textContent?.trim() === label
        );
        expect(button).toBeTruthy();
        button!.click();
    }

    function getSuggestionLabels(): string[] {
        return Array.from(document.querySelectorAll<HTMLElement>('.ag-calculated-column-suggestion')).map(
            (element) => element.textContent ?? ''
        );
    }

    function findColumnDef(columnDefs: (ColDef | ColGroupDef)[], colId: string): ColDef | undefined {
        for (const colDef of columnDefs) {
            if ('children' in colDef && colDef.children) {
                const child = findColumnDef(colDef.children, colId);
                if (child) {
                    return child;
                }
                continue;
            }

            if (colDef.colId === colId || colDef.field === colId) {
                return colDef;
            }
        }

        return undefined;
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
                    calculatedExpression: '[Revenue] - [Cost]',
                    cellDataType: 'number',
                },
                {
                    colId: 'profitable',
                    calculatedExpression: 'IF([Profit] > 10, "yes", "no")',
                    cellDataType: 'text',
                },
                {
                    colId: 'name',
                    calculatedExpression: '[First] & " " & [Last]',
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
                    calculatedExpression: '[Revenue] - [Cost]',
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
            calculatedExpression: '[Revenue] - [Cost]',
            cellDataType: 'number',
        });
        await asyncSetTimeout(1);

        await new GridRows(api, 'added calculated column', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);

        api.updateCalculatedColumn('profit', {
            calculatedExpression: '[Revenue] * [Cost]',
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

    test('grid api updates calculated column cellDataType without keeping stale boolean renderer', async () => {
        const api = createGrid('calculated-grid-api-cell-data-type', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                {
                    colId: 'profitable',
                    calculatedExpression: 'IF([Revenue] > [Cost], "yes", "no")',
                    cellDataType: 'text',
                },
            ],
        });
        await asyncSetTimeout(1);

        api.updateCalculatedColumn('profitable', {
            calculatedExpression: '[Revenue] > [Cost]',
            cellDataType: 'boolean',
        });
        await asyncSetTimeout(1);

        expect(api.getColumn('profitable')!.colDef.cellRenderer).toBe('agCheckboxCellRenderer');

        api.updateCalculatedColumn('profitable', {
            calculatedExpression: 'IF([Revenue] > [Cost], "yes", "no")',
            cellDataType: 'text',
        });
        await asyncSetTimeout(1);

        await new GridRows(api, 'updated calculated column cell data type', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profitable:"yes"
        `);
        expect(api.getColumn('profitable')!.colDef.cellRenderer).toBeUndefined();
    });

    test('grid api refreshes calculated-only formula caches', async () => {
        const rowData = [{ id: 'r1', revenue: 10, cost: 3 }];
        const api = createGrid('calculated-refresh-api', {
            rowData,
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[Revenue] - [Cost]', cellDataType: 'number' },
            ],
        });

        const rowNode = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(7);

        rowData[0].revenue = 20;

        expect(api.refreshFormulas()).toBe(true);
        expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(17);
    });

    test.each([
        {
            name: 'server-side',
            options: (rowData: any[]): Partial<GridOptions> => ({
                rowModelType: 'serverSide',
                serverSideDatasource: {
                    getRows: (params: any) => {
                        params.success({
                            rowData: rowData.slice(params.request.startRow, params.request.endRow),
                            rowCount: rowData.length,
                        });
                    },
                },
            }),
        },
        {
            name: 'infinite',
            options: (rowData: any[]): Partial<GridOptions> => ({
                rowModelType: 'infinite',
                cacheBlockSize: rowData.length,
                datasource: {
                    getRows: (params: any) => {
                        params.successCallback(rowData.slice(params.startRow, params.endRow), rowData.length);
                    },
                },
            }),
        },
        {
            name: 'viewport',
            options: (rowData: any[]): Partial<GridOptions> => {
                let viewportParams: any;
                return {
                    rowModelType: 'viewport',
                    viewportRowModelPageSize: rowData.length,
                    viewportRowModelBufferSize: 0,
                    viewportDatasource: {
                        init: (params: any) => {
                            viewportParams = params;
                            params.setRowCount(rowData.length);
                        },
                        setViewportRange: (firstRow: number, lastRow: number) => {
                            const rows: Record<number, any> = {};
                            for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
                                rows[rowIndex] = rowData[rowIndex];
                            }
                            viewportParams.setRowData(rows);
                        },
                    },
                };
            },
        },
    ])('same-row calculated columns evaluate with the $name row model', async ({ name, options }) => {
        const rowData = [
            { id: 'r1', revenue: 10, cost: 3 },
            { id: 'r2', revenue: 20, cost: 8 },
        ];
        const api = createGrid(`calculated-${name}-row-model`, {
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[Revenue] - [Cost]' },
                {
                    colId: 'doubleProfit',
                    headerName: 'Double Profit',
                    calculatedExpression: '[Profit] * 2',
                    cellDataType: 'number',
                },
            ],
            ...options(rowData),
        });
        await asyncSetTimeout(10);

        const firstRow = api.getDisplayedRowAtIndex(0)!;
        expect(api.getCellValue({ rowNode: firstRow, colKey: 'profit', useFormatter: false })).toBe(7);
        expect(api.getCellValue({ rowNode: firstRow, colKey: 'doubleProfit', useFormatter: false })).toBe(14);

        firstRow.data.revenue = 15;
        expect(api.refreshFormulas()).toBe(true);
        expect(api.getCellValue({ rowNode: firstRow, colKey: 'profit', useFormatter: false })).toBe(12);
        expect(api.getCellValue({ rowNode: firstRow, colKey: 'doubleProfit', useFormatter: false })).toBe(24);
    });

    test('server-side store updates invalidate calculated column caches', async () => {
        let rowData = [{ id: 'r1', revenue: 10, cost: 3 }];
        const api = createGrid('calculated-server-side-cache', {
            rowModelType: 'serverSide',
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[Revenue] - [Cost]' },
            ],
            serverSideDatasource: {
                getRows: (params: any) => {
                    params.success({ rowData, rowCount: rowData.length });
                },
            },
        });
        await asyncSetTimeout(10);

        expect(
            api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'profit', useFormatter: false })
        ).toBe(7);

        rowData = [{ id: 'r1', revenue: 20, cost: 4 }];
        const modelUpdated = waitForEvent('modelUpdated', api);
        api.setGridOption('serverSideDatasource', {
            getRows: (params: any) => {
                params.success({ rowData, rowCount: rowData.length });
            },
        });
        await modelUpdated;
        await asyncSetTimeout(10);

        expect(
            api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'profit', useFormatter: false })
        ).toBe(16);
    });

    test('ROUND function evaluates in calculated columns', async () => {
        const api = createGrid('calculated-round-function', {
            rowData: [{ id: 'r1', revenue: 44000, nextRevenue: 58000 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'nextRevenue' },
                {
                    colId: 'change',
                    calculatedExpression: 'ROUND((([Next Revenue] - [Revenue]) / [Revenue]) * 100, 1)',
                    cellDataType: 'number',
                },
            ],
        });

        await new GridRows(api, 'rounded calculated column', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:44000 nextRevenue:58000 change:31.8
        `);
    });

    test('display reference mapper qualifies duplicate headers and validates display references', () => {
        const createGroup = (name: string, parent: any = null) => ({
            __name: name,
            getGroupId: () => name,
            getOriginalParent: () => parent,
            isPadding: () => false,
        });
        const createColumn = (colId: string, headerName: string, groupNames: string[]) => {
            let parent = null;
            for (let i = groupNames.length - 1; i >= 0; i--) {
                parent = createGroup(groupNames[i], parent);
            }
            return {
                __headerName: headerName,
                getColId: () => colId,
                getOriginalParent: () => parent,
            } as any;
        };
        const beans = {
            colNames: {
                getDisplayNameForColumn: (column: any) => column.__headerName,
                getDisplayNameForProvidedColumnGroup: (_columnGroup: any, providedColumnGroup: any) =>
                    providedColumnGroup.__name,
            },
        } as any;

        const duplicateFullPathMapper = createCalculatedColumnReferenceMapper(
            beans,
            [createColumn('q4-a', 'Q4', ['2025']), createColumn('q4-b', 'Q4', ['2025'])],
            'calculated_1'
        );
        expect(duplicateFullPathMapper.suggestions.map(({ label }) => label)).toEqual([
            '2025 Q4 (q4-a)',
            '2025 Q4 (q4-b)',
        ]);

        const groupedMapper = createCalculatedColumnReferenceMapper(
            beans,
            [createColumn('q4-2025', 'Q4', ['2025']), createColumn('q4-2026', 'Q4', ['2026'])],
            'calculated_1'
        );

        expect(groupedMapper.suggestions.map(({ label }) => label)).toEqual(['2025 Q4', '2026 Q4']);
        expect(groupedMapper.toInternalExpression('[Q4]')).toEqual({
            error: { type: 'ambiguous', reference: 'Q4' },
        });
        expect(groupedMapper.toInternalExpression('[Missing]')).toEqual({
            error: { type: 'unknown', reference: 'Missing' },
        });
        expect(groupedMapper.toInternalExpression('[2025 Q4] - [2026 Q4]')).toEqual({
            expression: '[2025 Q4] - [2026 Q4]',
        });
    });

    test('duplicate full-path suffix is stable across column reorder', () => {
        const createGroup = (name: string, parent: any = null) => ({
            __name: name,
            getGroupId: () => name,
            getOriginalParent: () => parent,
            isPadding: () => false,
        });
        const createColumn = (colId: string, headerName: string, groupNames: string[]) => {
            let parent = null;
            for (let i = groupNames.length - 1; i >= 0; i--) {
                parent = createGroup(groupNames[i], parent);
            }
            return { __headerName: headerName, getColId: () => colId, getOriginalParent: () => parent } as any;
        };
        const beans = {
            colNames: {
                getDisplayNameForColumn: (column: any) => column.__headerName,
                getDisplayNameForProvidedColumnGroup: (_columnGroup: any, providedColumnGroup: any) =>
                    providedColumnGroup.__name,
            },
        } as any;

        const colA = createColumn('q4-a', 'Q4', ['2025']);
        const colB = createColumn('q4-b', 'Q4', ['2025']);

        const forward = createCalculatedColumnReferenceMapper(beans, [colA, colB], 'calculated_1');
        const reversed = createCalculatedColumnReferenceMapper(beans, [colB, colA], 'calculated_1');

        expect(forward.suggestions.map(({ label }) => label)).toEqual(['2025 Q4 (q4-a)', '2025 Q4 (q4-b)']);
        expect(reversed.suggestions.map(({ label }) => label)).toEqual(['2025 Q4 (q4-b)', '2025 Q4 (q4-a)']);
    });

    test('reference suffix escapes special characters in colId', () => {
        const createColumn = (colId: string, headerName: string) =>
            ({ __headerName: headerName, getColId: () => colId, getOriginalParent: () => null }) as any;
        const beans = {
            colNames: {
                getDisplayNameForColumn: (column: any) => column.__headerName,
                getDisplayNameForProvidedColumnGroup: () => null,
            },
        } as any;

        const mapper = createCalculatedColumnReferenceMapper(
            beans,
            [createColumn('weird]name', 'Total'), createColumn('plain', 'Total')],
            'calculated_1'
        );

        const [first, second] = mapper.suggestions.map(({ label }) => label);
        expect(first.includes(']')).toBe(false);
        expect(mapper.toInternalExpression(`[${first}] + [${second}]`)).toEqual({
            expression: `[${first}] + [${second}]`,
        });
    });

    test('dialog displays and stores header references', async () => {
        const revenueColId = 'server-revenue-9d5101c8-4c2a-48e0-9ad2';
        const costColId = 'server-cost-81f3431b-e4aa-4ef8-bef0';
        const api = createGrid('calculated-dialog-references', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue', colId: revenueColId, headerName: 'Revenue' },
                { field: 'cost', colId: costColId, headerName: 'Cost' },
            ],
        });

        showColumnMenu(api, revenueColId);
        await asyncSetTimeout(10);
        clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        clickDialogButton('Columns');
        expect(getSuggestionLabels()).toEqual(expect.arrayContaining(['Revenue', 'Cost']));
        expect(getSuggestionLabels()).not.toEqual(expect.arrayContaining([revenueColId, costColId]));

        setExpression('[Missing]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        expect(getCalculatedColumnDialog().textContent).toContain('Unknown column reference "Missing"');
        expect(api.getColumn('calculated_1')).toBeNull();

        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        const rowNode = api.getRowNode('r1')!;
        const calculatedDef = findColumnDef(api.getColumnDefs()!, 'calculated_1');

        expect(calculatedDef?.calculatedExpression).toBe('[Revenue] - [Cost]');
        expect(api.getCellValue({ rowNode, colKey: 'calculated_1', useFormatter: false })).toBe(7);
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
                    calculatedExpression: '[Revenue] - [Cost]',
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
                    calculatedExpression: '[Revenue] - [Cost]',
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
                    calculatedExpression: '[Revenue] - [Cost]',
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
                { colId: 'invalid', calculatedExpression: '[Revenue] +' },
                { colId: 'cycleA', headerName: 'Cycle A', calculatedExpression: '[Cycle B] + 1' },
                { colId: 'cycleB', headerName: 'Cycle B', calculatedExpression: '[Cycle A] + 1' },
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
                    { colId: 'profit', calculatedExpression: '[Revenue] - [Cost]' },
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

    test('calculated columns survive a getColumnDefs / createGrid roundtrip', async () => {
        const rowData = [
            { id: 'r1', revenue: 10, cost: 3 },
            { id: 'r2', revenue: 20, cost: 8 },
        ];
        const initialColumnDefs = [
            { field: 'revenue' },
            { field: 'cost' },
            { colId: 'profit', calculatedExpression: '[Revenue] - [Cost]', cellDataType: 'number' as const },
        ];
        const firstApi = createGrid('calculated-roundtrip-1', { rowData, columnDefs: initialColumnDefs });

        await new GridRows(firstApi, 'initial', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenue:10 cost:3 profit:7
            └── LEAF id:r2 revenue:20 cost:8 profit:12
        `);

        const persistedColumnDefs = firstApi.getColumnDefs();
        firstApi.destroy();

        const profitDef = persistedColumnDefs?.find(
            (def): def is { colId: string; calculatedExpression?: string } => 'colId' in def && def.colId === 'profit'
        );
        expect(profitDef?.calculatedExpression).toBe('[Revenue] - [Cost]');

        const secondApi = createGrid('calculated-roundtrip-2', { rowData, columnDefs: persistedColumnDefs! });
        await new GridRows(secondApi, 'restored', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenue:10 cost:3 profit:7
            └── LEAF id:r2 revenue:20 cost:8 profit:12
        `);
    });

    test('warns when calculatedExpression is combined with field, valueGetter or valueSetter', () => {
        let consoleWarnSpy: MockInstance | undefined;
        try {
            consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            createGrid('calculated-field-conflict', {
                rowData: [{ revenue: 10, cost: 3 }],
                columnDefs: [
                    { field: 'revenue' },
                    { field: 'cost' },
                    { colId: 'profit', field: 'revenue', calculatedExpression: '[Revenue] - [Cost]' },
                ],
            });

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    'colDef.calculatedExpression is used as the value source and should not be combined with field, valueGetter or valueSetter.'
                )
            );
        } finally {
            consoleWarnSpy?.mockRestore();
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
                        calculatedExpression: '[Revenue] - [Cost]',
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

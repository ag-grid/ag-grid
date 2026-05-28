import { waitFor } from '@testing-library/dom';
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
    ClipboardModule,
    ColumnMenuModule,
    ContextMenuModule,
    FormulaModule,
    RowGroupingModule,
    ServerSideRowModelModule,
    TreeDataModule,
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
            ClipboardModule,
            ColumnMenuModule,
            ContextMenuModule,
            RowGroupingModule,
            TreeDataModule,
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

    async function clickColumnMenuItem(name: string): Promise<void> {
        const menuItem = await waitFor(() => {
            const menuItemText = Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option-text')).find(
                (element) => element.textContent?.trim() === name
            );
            const element = menuItemText?.closest<HTMLElement>('.ag-menu-option');
            expect(element).toBeTruthy();
            return element!;
        });
        menuItem.click();
    }

    function getCalculatedColumnDialog(): HTMLElement {
        const dialog = document.querySelector<HTMLElement>('.ag-calculated-column-form');
        expect(dialog).toBeTruthy();
        return dialog!;
    }

    function setExpression(expression: string): void {
        const input = getExpressionInput();
        input.value = expression;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function clickDialogButton(label: string): void {
        const button = getDialogButton(label);
        button.click();
    }

    function getDialogButton(label: string): HTMLButtonElement {
        const button = Array.from(getCalculatedColumnDialog().querySelectorAll<HTMLButtonElement>('button')).find(
            (element) => element.textContent?.trim() === label
        );
        expect(button).toBeTruthy();
        return button!;
    }

    function getSuggestionLabels(): string[] {
        return Array.from(document.querySelectorAll<HTMLElement>('.ag-calculated-column-suggestion')).map(
            (element) => element.textContent ?? ''
        );
    }

    function getOpenMenuEntries(): string[] {
        return Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option, .ag-menu-separator')).map(
            (element) =>
                element.classList.contains('ag-menu-separator')
                    ? 'separator'
                    : (element.querySelector<HTMLElement>('.ag-menu-option-text')?.textContent?.trim() ?? '')
        );
    }

    function getExpressionInput(): HTMLTextAreaElement {
        return getCalculatedColumnDialog().querySelector<HTMLTextAreaElement>('textarea')!;
    }

    // Polls until the first row has data. `modelUpdated` is unreliable across row models in
    // jsdom (Viewport may fire it before the listener is attached, or never trigger
    // setViewportRange at all); polling on the actual row data is the one signal every row
    // model exposes consistently.
    async function waitForFirstRow(api: { getDisplayedRowAtIndex(index: number): any }): Promise<void> {
        for (let i = 0; i < 50; i++) {
            if (api.getDisplayedRowAtIndex(0)?.data != null) {
                return;
            }
            await asyncSetTimeout(10);
        }
        throw new Error('Timed out waiting for first row to load');
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

    function findGroupDef(columnDefs: (ColDef | ColGroupDef)[], groupId: string): ColGroupDef | undefined {
        for (const colDef of columnDefs) {
            if (!('children' in colDef) || !colDef.children) {
                continue;
            }

            if (colDef.groupId === groupId) {
                return colDef;
            }

            const child = findGroupDef(colDef.children, groupId);
            if (child) {
                return child;
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

    test('grid api calculated column mutations do not mutate provided column definitions', async () => {
        const revenueColDef: ColDef = { field: 'revenue' };
        const costColDef: ColDef = { field: 'cost' };
        const profitColDef: ColDef = {
            colId: 'profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        };
        const columnDefs: ColDef[] = [revenueColDef, costColDef, profitColDef];
        const api = createGrid('calculated-grid-api-no-mutation', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs,
        });

        api.addCalculatedColumn({ colId: 'margin', calculatedExpression: '[profit] / [revenue]' });
        await asyncSetTimeout(1);

        expect(columnDefs).toEqual([revenueColDef, costColDef, profitColDef]);
        expect(columnDefs).toHaveLength(3);
        expect(findColumnDef(api.getColumnDefs()!, 'margin')?.calculatedExpression).toBe('[profit] / [revenue]');

        api.updateCalculatedColumn('profit', { headerName: 'Profit', calculatedExpression: '[revenue] * [cost]' });
        await asyncSetTimeout(1);

        expect(profitColDef).toEqual({
            colId: 'profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        });
        expect(findColumnDef(api.getColumnDefs()!, 'profit')).toEqual(
            expect.objectContaining({
                colId: 'profit',
                headerName: 'Profit',
                calculatedExpression: '[revenue] * [cost]',
            })
        );

        api.removeCalculatedColumn('profit');
        await asyncSetTimeout(1);

        expect(columnDefs).toEqual([revenueColDef, costColDef, profitColDef]);
        expect(findColumnDef(api.getColumnDefs()!, 'profit')).toBeUndefined();
        expect(findColumnDef(api.getColumnDefs()!, 'margin')).toBeTruthy();

        api.setGridOption('columnDefs', columnDefs.slice());
        await asyncSetTimeout(1);

        expect(findColumnDef(api.getColumnDefs()!, 'profit')?.calculatedExpression).toBe('[revenue] - [cost]');
        expect(findColumnDef(api.getColumnDefs()!, 'margin')).toBeUndefined();
    });

    test('grid api updates calculated column cellDataType without keeping stale boolean renderer', async () => {
        const api = createGrid('calculated-grid-api-cell-data-type', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                {
                    colId: 'profitable',
                    calculatedExpression: 'IF([revenue] > [cost], "yes", "no")',
                    cellDataType: 'text',
                },
            ],
        });
        await asyncSetTimeout(1);

        api.updateCalculatedColumn('profitable', {
            calculatedExpression: '[revenue] > [cost]',
            cellDataType: 'boolean',
        });
        await asyncSetTimeout(1);

        expect(api.getColumn('profitable')!.colDef.cellRenderer).toBe('agCheckboxCellRenderer');

        api.updateCalculatedColumn('profitable', {
            calculatedExpression: 'IF([revenue] > [cost], "yes", "no")',
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
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
        });

        const rowNode = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(7);

        rowData[0].revenue = 20;

        expect(api.refreshFormulas()).toBe(true);
        expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(17);
    });

    test('calculated columns evaluate on row group aggregate values', async () => {
        const api = createGrid('calculated-row-groups', {
            rowData: [
                { id: 'r1', region: 'EMEA', revenue: 10, cost: 3 },
                { id: 'r2', region: 'EMEA', revenue: 20, cost: 8 },
                { id: 'r3', region: 'APAC', revenue: 15, cost: 5 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
                { colId: 'doubleProfit', calculatedExpression: '[profit] * 2', cellDataType: 'number' },
            ],
            groupDefaultExpanded: -1,
        });
        await asyncSetTimeout(1);

        let emeaGroup: any;
        let apacGroup: any;
        api.forEachNodeAfterFilterAndSort((node) => {
            if (node.group && node.key === 'EMEA') {
                emeaGroup = node;
            }
            if (node.group && node.key === 'APAC') {
                apacGroup = node;
            }
        });

        expect(emeaGroup.group).toBe(true);
        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'profit', useFormatter: false })).toBe(19);
        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'doubleProfit', useFormatter: false })).toBe(38);
        expect(apacGroup.group).toBe(true);
        expect(api.getCellValue({ rowNode: apacGroup, colKey: 'profit', useFormatter: false })).toBe(10);
        expect(api.getCellValue({ rowNode: apacGroup, colKey: 'doubleProfit', useFormatter: false })).toBe(20);
    });

    test('calculated columns stay blank on row groups without aggregate source values while leaf rows still evaluate', async () => {
        const api = createGrid('calculated-row-groups-no-aggregates', {
            rowData: [
                { id: 'r1', productType: 'A', product: 'Solar panel kit', revenue: 142000, cost: 96000 },
                { id: 'r2', productType: 'A', product: 'Smart thermostat', revenue: 78000, cost: 52000 },
                { id: 'r3', productType: 'B', product: 'Battery pack', revenue: 126000, cost: 101000 },
            ],
            columnDefs: [
                { field: 'productType', rowGroup: true, hide: true },
                { field: 'product' },
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
        });
        await asyncSetTimeout(1);

        const groupA = api.getRowNode('row-group-productType-A')!;
        expect(groupA.group).toBe(true);
        expect(api.getDisplayedRowCount()).toBe(2);
        expect(api.getCellValue({ rowNode: groupA, colKey: 'profit', useFormatter: false })).toBeUndefined();

        groupA.setExpanded(true, undefined, true);
        await asyncSetTimeout(1);

        expect(api.getDisplayedRowCount()).toBe(4);
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit', useFormatter: false })).toBe(46000);
        expect(api.getCellValue({ rowNode: api.getRowNode('r2')!, colKey: 'profit', useFormatter: false })).toBe(26000);
    });

    test('calculated columns evaluate on tree data rows and stay blank on filler groups', async () => {
        const parentApi = createGrid('calculated-tree-data-parent', {
            treeData: true,
            treeDataChildrenField: 'children',
            rowData: [
                {
                    id: 'parent',
                    name: 'Parent',
                    revenue: 100,
                    cost: 40,
                    children: [{ id: 'child', name: 'Child', revenue: 30, cost: 10 }],
                },
            ],
            columnDefs: [
                { field: 'name' },
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
            groupDefaultExpanded: -1,
        });
        await asyncSetTimeout(1);

        expect(
            parentApi.getCellValue({ rowNode: parentApi.getRowNode('parent')!, colKey: 'profit', useFormatter: false })
        ).toBe(60);
        expect(
            parentApi.getCellValue({ rowNode: parentApi.getRowNode('child')!, colKey: 'profit', useFormatter: false })
        ).toBe(20);

        const fillerApi = createGrid('calculated-tree-data-filler', {
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [{ id: 'leaf', path: ['Dept', 'Team', 'Leaf'], revenue: 30, cost: 10 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
            groupDefaultExpanded: -1,
        });
        await asyncSetTimeout(1);

        let fillerGroup: any;
        fillerApi.forEachNode((node) => {
            if (node.group && !node.data && !fillerGroup) {
                fillerGroup = node;
            }
        });

        expect(fillerGroup).toBeTruthy();
        expect(fillerApi.getCellValue({ rowNode: fillerGroup, colKey: 'profit', useFormatter: false })).toBeUndefined();
        expect(
            fillerApi.getCellValue({ rowNode: fillerApi.getRowNode('leaf')!, colKey: 'profit', useFormatter: false })
        ).toBe(20);
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
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] - [cost]' },
                {
                    colId: 'doubleProfit',
                    headerName: 'Double Profit',
                    calculatedExpression: '[profit] * 2',
                    cellDataType: 'number',
                },
            ],
            ...options(rowData),
        });

        await waitForFirstRow(api);

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
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
            ],
            serverSideDatasource: {
                getRows: (params: any) => {
                    params.success({ rowData, rowCount: rowData.length });
                },
            },
        });
        await waitForFirstRow(api);

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
                    calculatedExpression: 'ROUND((([nextRevenue] - [revenue]) / [revenue]) * 100, 1)',
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
            expression: '[q4-2025] - [q4-2026]',
        });
        expect(groupedMapper.toDisplayExpression('[q4-2025] - [q4-2026]')).toBe('[2025 Q4] - [2026 Q4]');
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
            [createColumn('weird/name', 'Total'), createColumn('plain', 'Total')],
            'calculated_1'
        );

        const [first, second] = mapper.suggestions.map(({ label }) => label);
        expect(first.includes(']')).toBe(false);
        expect(mapper.toInternalExpression(`[${first}] + [${second}]`)).toEqual({
            expression: '[weird/name] + [plain]',
        });
    });

    test('dialog displays and stores header references', async () => {
        const revenueColId = 'server-revenue-9d5101c8-4c2a-48e0-9ad2';
        const costColId = 'server-cost-81f3431b-e4aa-4ef8-bef0';
        const created = vi.fn();
        const api = createGrid('calculated-dialog-references', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue', colId: revenueColId, headerName: 'Revenue' },
                { field: 'cost', colId: costColId, headerName: 'Cost' },
            ],
            onCalculatedColumnCreated: created,
        });

        showColumnMenu(api, revenueColId);
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        clickDialogButton('Columns');
        expect(getSuggestionLabels()).toEqual(expect.arrayContaining(['Revenue', 'Cost']));
        expect(getSuggestionLabels()).not.toEqual(expect.arrayContaining([revenueColId, costColId]));

        setExpression('[Missing]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        expect(getExpressionInput()).toHaveClass('invalid');
        expect(getExpressionInput().validationMessage).toContain('Unknown column reference "Missing"');
        expect(api.getColumn('calculated_1')).toBeNull();

        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        const rowNode = api.getRowNode('r1')!;
        const calculatedDef = findColumnDef(api.getColumnDefs()!, 'calculated_1');

        expect(calculatedDef?.calculatedExpression).toBe(`[${revenueColId}] - [${costColId}]`);
        expect(created).toHaveBeenCalledWith(
            expect.objectContaining({
                column: api.getColumn('calculated_1'),
                expression: `[${revenueColId}] - [${costColId}]`,
                source: 'calculatedColumn',
            })
        );
        expect(api.getCellValue({ rowNode, colKey: 'calculated_1', useFormatter: false })).toBe(7);

        showColumnMenu(api, 'calculated_1');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Edit Calculated Column');
        await asyncSetTimeout(1);

        expect(getExpressionInput().value).toBe('[Revenue] - [Cost]');
    });

    test('dialog adds calculated columns inside groups without mutating provided column definitions', async () => {
        const year2025: ColGroupDef = {
            groupId: 'year_2025',
            headerName: '2025',
            children: [
                { field: 'revenue2025', colId: 'revenue_2025', headerName: 'Revenue' },
                { field: 'cost2025', colId: 'cost_2025', headerName: 'Cost' },
            ],
        };
        const year2026: ColGroupDef = {
            groupId: 'year_2026',
            headerName: '2026',
            children: [
                { field: 'revenue2026', colId: 'revenue_2026', headerName: 'Revenue' },
                { field: 'cost2026', colId: 'cost_2026', headerName: 'Cost' },
            ],
        };
        const columnDefs: ColGroupDef[] = [year2025, year2026];
        const api = createGrid('calculated-dialog-group-no-mutation', {
            rowData: [{ id: 'r1', revenue2025: 10, cost2025: 3, revenue2026: 20, cost2026: 8 }],
            columnDefs,
        });

        showColumnMenu(api, 'revenue_2025');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        setExpression('[2025 Revenue] - [2025 Cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        expect(columnDefs).toEqual([year2025, year2026]);
        expect(year2025.children).toHaveLength(2);

        const projectedYear2025 = findGroupDef(api.getColumnDefs()!, 'year_2025');
        expect(
            projectedYear2025?.children.map((colDef) => ('children' in colDef ? colDef.groupId : colDef.colId))
        ).toEqual(['revenue_2025', 'calculated_1', 'cost_2025']);
        expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')?.calculatedExpression).toBe(
            '[revenue_2025] - [cost_2025]'
        );
    });

    test('dispatches calculated column API lifecycle events', async () => {
        const created = vi.fn();
        const changed = vi.fn();
        const removed = vi.fn();
        const api = createGrid('calculated-api-events', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            onCalculatedColumnCreated: created,
            onCalculatedColumnExpressionChanged: changed,
            onCalculatedColumnRemoved: removed,
        });

        api.addCalculatedColumn({ colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(1);
        expect(created).toHaveBeenCalledWith(
            expect.objectContaining({
                column: api.getColumn('profit'),
                expression: '[revenue] - [cost]',
                source: 'api',
            })
        );

        api.updateCalculatedColumn('profit', { headerName: 'Profit' });
        await asyncSetTimeout(1);
        expect(changed).not.toHaveBeenCalled();

        api.updateCalculatedColumn('profit', { calculatedExpression: '[revenue] * [cost]' });
        await asyncSetTimeout(1);
        expect(changed).toHaveBeenCalledWith(
            expect.objectContaining({
                column: api.getColumn('profit'),
                oldExpression: '[revenue] - [cost]',
                expression: '[revenue] * [cost]',
                source: 'api',
            })
        );

        const removedColumn = api.getColumn('profit');
        api.removeCalculatedColumn('profit');
        await asyncSetTimeout(1);
        expect(removed).toHaveBeenCalledWith(
            expect.objectContaining({
                column: removedColumn,
                expression: '[revenue] * [cost]',
                source: 'api',
            })
        );
    });

    test('does not dispatch calculated column lifecycle events for rejected API mutations', async () => {
        const created = vi.fn();
        const changed = vi.fn();
        const api = createGrid('calculated-rejected-api-events', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
            ],
            onCalculatedColumnCreated: created,
            onCalculatedColumnExpressionChanged: changed,
        });
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        try {
            api.addCalculatedColumn({ colId: 'bad', calculatedExpression: '[missing] + 1' });
            api.updateCalculatedColumn('profit', { calculatedExpression: '[missing] + 1' });
            await asyncSetTimeout(1);

            expect(api.getColumn('bad')).toBeNull();
            expect(created).not.toHaveBeenCalled();
            expect(changed).not.toHaveBeenCalled();
            expect(api.getColumn('profit')?.getColDef().calculatedExpression).toBe('[revenue] - [cost]');
        } finally {
            consoleWarnSpy.mockRestore();
        }
    });

    test('dispatches calculated column UI update and remove events', async () => {
        const changed = vi.fn();
        const removed = vi.fn();
        const api = createGrid('calculated-ui-events', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] - [cost]' },
            ],
            onCalculatedColumnExpressionChanged: changed,
            onCalculatedColumnRemoved: removed,
        });

        showColumnMenu(api, 'profit');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Edit Calculated Column');
        await asyncSetTimeout(1);

        setExpression('[Revenue] * [Cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        expect(changed).toHaveBeenCalledWith(
            expect.objectContaining({
                column: api.getColumn('profit'),
                oldExpression: '[revenue] - [cost]',
                expression: '[revenue] * [cost]',
                source: 'calculatedColumn',
            })
        );

        const removedColumn = api.getColumn('profit');
        showColumnMenu(api, 'profit');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Remove Calculated Column');
        await asyncSetTimeout(1);

        expect(removed).toHaveBeenCalledWith(
            expect.objectContaining({
                column: removedColumn,
                expression: '[revenue] * [cost]',
                source: 'calculatedColumn',
            })
        );
    });

    test('dispatches calculated column validation state changes after column references change', async () => {
        const validationStateChanged = vi.fn();
        const api = createGrid('calculated-validation-events', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
            ],
            onCalculatedColumnValidationStateChanged: validationStateChanged,
        });

        await asyncSetTimeout(1);
        expect(validationStateChanged).not.toHaveBeenCalled();

        api.updateGridOptions({
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' }],
        });
        await asyncSetTimeout(1);

        expect(validationStateChanged).toHaveBeenCalledWith(
            expect.objectContaining({
                column: api.getColumn('profit'),
                valid: false,
                reason: 'unknownReference',
            })
        );

        validationStateChanged.mockClear();
        api.updateGridOptions({
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
            ],
        });
        await asyncSetTimeout(1);

        expect(validationStateChanged).toHaveBeenCalledWith(
            expect.objectContaining({
                column: api.getColumn('profit'),
                valid: true,
            })
        );
        expect(validationStateChanged.mock.calls[0][0].reason).toBeUndefined();
    });

    test('does not dispatch validation state changes for initial invalid calculated columns', async () => {
        const validationStateChanged = vi.fn();
        createGrid('calculated-initial-invalid-validation-events', {
            rowData: [{ id: 'r1', revenue: 10 }],
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue] - [missing]' }],
            onCalculatedColumnValidationStateChanged: validationStateChanged,
        });

        await asyncSetTimeout(1);
        expect(validationStateChanged).not.toHaveBeenCalled();
    });

    test('calculated column menu items are grouped by separators', async () => {
        const api = createGrid('calculated-menu-separators', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
            ],
        });

        showColumnMenu(api, 'profit');
        await asyncSetTimeout(10);

        const headerMenuEntries = getOpenMenuEntries();
        const editIndex = headerMenuEntries.indexOf('Edit Calculated Column');
        const addIndex = headerMenuEntries.indexOf('Add Calculated Column');
        expect(headerMenuEntries[editIndex - 1]).toBe('separator');
        expect(headerMenuEntries).toEqual(
            expect.arrayContaining(['Edit Calculated Column', 'Remove Calculated Column', 'Add Calculated Column'])
        );
        expect(headerMenuEntries[addIndex + 1]).toBe('separator');

        api.hidePopupMenu();
        api.showContextMenu({
            rowNode: api.getRowNode('r1'),
            column: api.getColumn('profit'),
            value: 7,
            source: 'api',
        });
        await asyncSetTimeout(10);

        const contextMenuEntries = getOpenMenuEntries();
        const removeIndex = contextMenuEntries.indexOf('Remove Calculated Column');
        expect(contextMenuEntries[removeIndex - 1]).toBe('separator');
        expect(contextMenuEntries[removeIndex + 1]).toBe('separator');
    });

    test('dialog type list contains the default data types only', async () => {
        const api = createGrid('calculated-dialog-types', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        showColumnMenu(api, 'revenue');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        getCalculatedColumnDialog()
            .querySelector<HTMLElement>('.ag-select .ag-picker-field-wrapper')!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await asyncSetTimeout(1);

        const typeOptions = Array.from(document.querySelectorAll<HTMLElement>('.ag-list-item')).map((element) =>
            element.textContent?.trim()
        );
        expect(typeOptions).toEqual(['Text', 'Number', 'Date', 'Boolean']);
    });

    test('dialog validates formula syntax and function names before apply', async () => {
        const api = createGrid('calculated-dialog-validation', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        showColumnMenu(api, 'revenue');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        setExpression('[Revenue] +');
        expect(getExpressionInput()).toHaveClass('invalid');
        expect(getExpressionInput().validationMessage).toContain("Missing operand for '+'");
        expect(getDialogButton('Apply').disabled).toBe(true);

        setExpression('BOGUS([Revenue])');
        expect(getExpressionInput()).toHaveClass('invalid');
        expect(getExpressionInput().validationMessage).toContain('Unsupported operation BOGUS');
        expect(api.getColumn('calculated_1')).toBeNull();

        setExpression('[Revenue] - [Cost]');
        expect(getExpressionInput()).not.toHaveClass('invalid');
        expect(getExpressionInput().validationMessage).toBe('');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        expect(api.getColumn('calculated_1')).toBeTruthy();
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
                { colId: 'cycleA', headerName: 'Cycle A', calculatedExpression: '[cycleB] + 1' },
                { colId: 'cycleB', headerName: 'Cycle B', calculatedExpression: '[cycleA] + 1' },
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

    test('calculated columns survive a getColumnDefs / createGrid roundtrip', async () => {
        const rowData = [
            { id: 'r1', revenue: 10, cost: 3 },
            { id: 'r2', revenue: 20, cost: 8 },
        ];
        const initialColumnDefs = [
            { field: 'revenue' },
            { field: 'cost' },
            { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' as const },
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
        expect(profitDef?.calculatedExpression).toBe('[revenue] - [cost]');

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
                    { colId: 'profit', field: 'revenue', calculatedExpression: '[revenue] - [cost]' },
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

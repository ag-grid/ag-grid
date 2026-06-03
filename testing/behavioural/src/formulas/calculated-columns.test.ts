import { waitFor } from '@testing-library/dom';
import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

import type { ColDef, ColGroupDef, GridOptions, Module } from 'ag-grid-community';
import {
    CellSpanModule,
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    NumberEditorModule,
    NumberFilterModule,
    RowSelectionModule,
    TextEditorModule,
    ValidationModule,
    getGridElement,
} from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    ClipboardModule,
    ColumnMenuModule,
    ContextMenuModule,
    FormulaModule,
    PivotModule,
    RowGroupingModule,
    RowNumbersModule,
    ServerSideRowModelModule,
    TreeDataModule,
    ViewportRowModelModule,
} from 'ag-grid-enterprise';

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
            CellSpanModule,
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
            RowSelectionModule,
            PivotModule,
            RowNumbersModule,
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

    function clickSuggestion(label: string): void {
        const suggestion = Array.from(document.querySelectorAll<HTMLElement>('.ag-calculated-column-suggestion')).find(
            (element) => element.textContent?.trim() === label
        );
        expect(suggestion).toBeTruthy();
        suggestion!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
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

            if ((colDef as ColDef).colId === colId || (colDef as ColDef).field === colId) {
                return colDef as ColDef;
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

    test('static calculated columns inherit spanRows and span by evaluated values', async () => {
        const api = createGrid('calculated-static-span-rows', {
            enableCellSpan: true,
            defaultColDef: {
                spanRows: true,
            },
            rowData: [
                { id: 'r1', athlete: 'A' },
                { id: 'r2', athlete: 'A' },
                { id: 'r3', athlete: 'B' },
            ],
            columnDefs: [{ field: 'athlete' }, { colId: 'athleteCopy', calculatedExpression: '[athlete]' }],
        });
        await new GridRows(api, 'static calculated span rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 athlete:"A" athleteCopy:"A"
            ├── LEAF id:r2 athlete:"A" athleteCopy:"A"
            └── LEAF id:r3 athlete:"B" athleteCopy:"B"
        `);
        await asyncSetTimeout(1);

        const gridEl = getGridElement(api)!;
        const spannedCell = gridEl.querySelector('.ag-spanned-row [col-id="athleteCopy"]');
        const coveredCell = gridEl.querySelector('.ag-center-cols-container [row-index="1"] [col-id="athleteCopy"]');
        const unspannedCell = gridEl.querySelector('[row-index="2"] [col-id="athleteCopy"]');
        expect(spannedCell).not.toBeNull();
        expect(spannedCell!.getAttribute('aria-rowspan')).toBe('2');
        expect(coveredCell).toBeNull();
        expect(unspannedCell).not.toBeNull();
    });

    test('dynamic calculated columns inherit spanRows and span by evaluated values', async () => {
        const api = createGrid('calculated-dynamic-span-rows', {
            enableCellSpan: true,
            defaultColDef: {
                spanRows: true,
            },
            rowData: [
                { id: 'r1', athlete: 'A' },
                { id: 'r2', athlete: 'A' },
                { id: 'r3', athlete: 'B' },
            ],
            columnDefs: [{ field: 'athlete' }],
        });

        api.addCalculatedColumn({ colId: 'athleteCopy', calculatedExpression: '[athlete]' });
        await asyncSetTimeout(1);
        await new GridRows(api, 'dynamic calculated span rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 athlete:"A" athleteCopy:"A"
            ├── LEAF id:r2 athlete:"A" athleteCopy:"A"
            └── LEAF id:r3 athlete:"B" athleteCopy:"B"
        `);

        const gridEl = getGridElement(api)!;
        const spannedCell = gridEl.querySelector('.ag-spanned-row [col-id="athleteCopy"]');
        const coveredCell = gridEl.querySelector('.ag-center-cols-container [row-index="1"] [col-id="athleteCopy"]');
        const unspannedCell = gridEl.querySelector('[row-index="2"] [col-id="athleteCopy"]');
        expect(spannedCell).not.toBeNull();
        expect(spannedCell!.getAttribute('aria-rowspan')).toBe('2');
        expect(coveredCell).toBeNull();
        expect(unspannedCell).not.toBeNull();
    });

    test('calculated columns with equal evaluated values still span all matching rows', async () => {
        const api = createGrid('calculated-constant-span-rows', {
            enableCellSpan: true,
            defaultColDef: {
                spanRows: true,
            },
            rowData: [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }],
            columnDefs: [{ colId: 'constant', calculatedExpression: '"Same"' }],
        });
        await new GridRows(api, 'constant calculated span rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 constant:"Same"
            ├── LEAF id:r2 constant:"Same"
            └── LEAF id:r3 constant:"Same"
        `);
        await asyncSetTimeout(1);

        const gridEl = getGridElement(api)!;
        const spannedCell = gridEl.querySelector('.ag-spanned-row [col-id="constant"]');
        const coveredCell = gridEl.querySelector('.ag-center-cols-container [row-index="2"] [col-id="constant"]');
        expect(spannedCell).not.toBeNull();
        expect(spannedCell!.getAttribute('aria-rowspan')).toBe('3');
        expect(spannedCell!.textContent).toContain('Same');
        expect(coveredCell).toBeNull();
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

        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual(['revenue', 'cost', 'profit']);
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

    test('reset column state removes dynamic calculated columns and restores provided calculated columns', async () => {
        const removed = vi.fn();
        const api = createGrid('calculated-reset-column-state', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] - [cost]' },
            ],
            onCalculatedColumnRemoved: removed,
        });

        api.addCalculatedColumn({ colId: 'margin', calculatedExpression: '[profit] / [revenue]' });
        await asyncSetTimeout(1);

        expect(api.getColumn('margin')).toBeTruthy();
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'revenue',
            'cost',
            'profit',
            'margin',
        ]);
        const columnState = api.getColumnState();

        api.updateCalculatedColumn('profit', {
            headerName: 'Updated Profit',
            calculatedExpression: '[revenue] * [cost]',
        });
        await asyncSetTimeout(1);
        api.removeCalculatedColumn('profit');
        await asyncSetTimeout(1);

        expect(api.getColumn('profit')).toBeNull();
        expect(removed).toHaveBeenCalledTimes(1);

        api.resetColumnState();
        await asyncSetTimeout(1);

        expect(api.getColumn('margin')).toBeNull();
        expect(api.getColumn('profit')).toBeTruthy();
        expect(removed).toHaveBeenCalledTimes(1);
        expect(findColumnDef(api.getColumnDefs()!, 'margin')).toBeUndefined();
        expect(findColumnDef(api.getColumnDefs()!, 'profit')).toEqual(
            expect.objectContaining({
                colId: 'profit',
                headerName: 'Profit',
                calculatedExpression: '[revenue] - [cost]',
            })
        );
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual(['revenue', 'cost', 'profit']);

        expect(api.applyColumnState({ state: columnState, applyOrder: true })).toBe(true);
        await asyncSetTimeout(1);

        expect(api.getColumn('margin')).toBeTruthy();
        expect(findColumnDef(api.getColumnDefs()!, 'margin')?.calculatedExpression).toBe('[profit] / [revenue]');
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'revenue',
            'cost',
            'profit',
            'margin',
        ]);
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

        expect(api.getColumn('profitable')!.getColDef().cellRenderer).toBe('agCheckboxCellRenderer');

        api.updateCalculatedColumn('profitable', {
            calculatedExpression: 'IF([revenue] > [cost], "yes", "no")',
            cellDataType: 'text',
        });
        await asyncSetTimeout(1);

        await new GridRows(api, 'updated calculated column cell data type', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profitable:"yes"
        `);
        expect(api.getColumn('profitable')!.getColDef().cellRenderer).toBeUndefined();
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
        await new GridColumns(api, `grid api refreshes calculated-only formula caches setup`).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200
        `);
        await new GridRows(api, `grid api refreshes calculated-only formula caches setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);

        const rowNode = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(7);

        rowData[0].revenue = 20;

        expect(api.refreshFormulas()).toBe(true);
        expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(17);
        await new GridRows(api, `grid api refreshes calculated-only formula caches final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:20 cost:3 profit:17
        `);
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
        await new GridColumns(api, `calculated columns evaluate on row group aggregate values setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── revenue "Revenue" width:200 aggFunc:sum
            ├── cost "Cost" width:200 aggFunc:sum
            ├── profit width:200
            └── doubleProfit width:200
        `);
        await new GridRows(api, `calculated columns evaluate on row group aggregate values setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-region-EMEA ag-Grid-AutoColumn:"EMEA" revenue:30 cost:11 profit:19 doubleProfit:38
            │ ├── LEAF id:r1 region:"EMEA" revenue:10 cost:3 profit:7 doubleProfit:14
            │ └── LEAF id:r2 region:"EMEA" revenue:20 cost:8 profit:12 doubleProfit:24
            └─┬ LEAF_GROUP id:row-group-region-APAC ag-Grid-AutoColumn:"APAC" revenue:15 cost:5 profit:10 doubleProfit:20
            · └── LEAF id:r3 region:"APAC" revenue:15 cost:5 profit:10 doubleProfit:20
        `);
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
        await new GridRows(api, `calculated columns evaluate on row group aggregate values final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-region-EMEA ag-Grid-AutoColumn:"EMEA" revenue:30 cost:11 profit:19 doubleProfit:38
            │ ├── LEAF id:r1 region:"EMEA" revenue:10 cost:3 profit:7 doubleProfit:14
            │ └── LEAF id:r2 region:"EMEA" revenue:20 cost:8 profit:12 doubleProfit:24
            └─┬ LEAF_GROUP id:row-group-region-APAC ag-Grid-AutoColumn:"APAC" revenue:15 cost:5 profit:10 doubleProfit:20
            · └── LEAF id:r3 region:"APAC" revenue:15 cost:5 profit:10 doubleProfit:20
        `);
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

    test('calculated columns evaluate on group and grand total footer rows', async () => {
        const api = createGrid('calculated-row-group-footers', {
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
            ],
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            grandTotalRow: 'bottom',
        });
        await asyncSetTimeout(1);

        const emeaFooter = api.getRowNode('rowGroupFooter_row-group-region-EMEA')!;
        const apacFooter = api.getRowNode('rowGroupFooter_row-group-region-APAC')!;
        const grandTotal = api.getRowNode('rowGroupFooter_ROOT_NODE_ID')!;

        expect(emeaFooter).toBeTruthy();
        expect(api.getCellValue({ rowNode: emeaFooter, colKey: 'profit', useFormatter: false })).toBe(19);
        expect(apacFooter).toBeTruthy();
        expect(api.getCellValue({ rowNode: apacFooter, colKey: 'profit', useFormatter: false })).toBe(10);
        expect(grandTotal).toBeTruthy();
        expect(api.getCellValue({ rowNode: grandTotal, colKey: 'profit', useFormatter: false })).toBe(29);
    });

    test('calculated columns aggregate across multiple group levels', async () => {
        const api = createGrid('calculated-multi-level-groups', {
            rowData: [
                { id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 },
                { id: 'r2', region: 'EMEA', country: 'DE', revenue: 20, cost: 8 },
                { id: 'r3', region: 'EMEA', country: 'DE', revenue: 5, cost: 1 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
            groupDefaultExpanded: -1,
        });
        await asyncSetTimeout(1);

        const emeaGroup = api.getRowNode('row-group-region-EMEA')!;
        const ukGroup = api.getRowNode('row-group-region-EMEA-country-UK')!;
        const deGroup = api.getRowNode('row-group-region-EMEA-country-DE')!;

        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'profit', useFormatter: false })).toBe(23);
        expect(api.getCellValue({ rowNode: ukGroup, colKey: 'profit', useFormatter: false })).toBe(7);
        expect(api.getCellValue({ rowNode: deGroup, colKey: 'profit', useFormatter: false })).toBe(16);
    });

    test('sorting on a calculated column orders group rows by aggregate result', async () => {
        const api = createGrid('calculated-sort-grouped', {
            rowData: [
                { id: 'r1', region: 'EMEA', revenue: 10, cost: 3 },
                { id: 'r2', region: 'EMEA', revenue: 20, cost: 8 },
                { id: 'r3', region: 'APAC', revenue: 15, cost: 5 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                {
                    colId: 'profit',
                    calculatedExpression: '[revenue] - [cost]',
                    cellDataType: 'number',
                    sortable: true,
                },
            ],
        });
        await asyncSetTimeout(1);

        api.applyColumnState({ state: [{ colId: 'profit', sort: 'asc' }], defaultState: { sort: null } });
        await asyncSetTimeout(1);

        const ascOrder: string[] = [];
        api.forEachNodeAfterFilterAndSort((node) => {
            if (node.group && node.key) {
                ascOrder.push(node.key);
            }
        });
        expect(ascOrder).toEqual(['APAC', 'EMEA']);

        api.applyColumnState({ state: [{ colId: 'profit', sort: 'desc' }], defaultState: { sort: null } });
        await asyncSetTimeout(1);

        const descOrder: string[] = [];
        api.forEachNodeAfterFilterAndSort((node) => {
            if (node.group && node.key) {
                descOrder.push(node.key);
            }
        });
        expect(descOrder).toEqual(['EMEA', 'APAC']);
    });

    test('grid api adds a calculated column while grouped and it evaluates on group rows', async () => {
        const api = createGrid('calculated-api-while-grouped', {
            rowData: [
                { id: 'r1', region: 'EMEA', revenue: 10, cost: 3 },
                { id: 'r2', region: 'EMEA', revenue: 20, cost: 8 },
                { id: 'r3', region: 'APAC', revenue: 15, cost: 5 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
            ],
            groupDefaultExpanded: -1,
        });
        await asyncSetTimeout(1);

        const created = waitForEvent('calculatedColumnCreated', api);
        api.addCalculatedColumn({
            colId: 'profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        });
        await created;
        await asyncSetTimeout(1);

        const emeaGroup = api.getRowNode('row-group-region-EMEA')!;
        const apacGroup = api.getRowNode('row-group-region-APAC')!;
        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'profit', useFormatter: false })).toBe(19);
        expect(api.getCellValue({ rowNode: apacGroup, colKey: 'profit', useFormatter: false })).toBe(10);
    });

    test('calculated columns aggregate on tree data parents with aggregated inputs', async () => {
        const api = createGrid('calculated-tree-data-aggregated', {
            treeData: true,
            getDataPath: (data) => data.path,
            rowData: [
                { id: 'l1', path: ['Dept', 'Team A', 'Leaf 1'], revenue: 30, cost: 10 },
                { id: 'l2', path: ['Dept', 'Team A', 'Leaf 2'], revenue: 20, cost: 5 },
                { id: 'l3', path: ['Dept', 'Team B', 'Leaf 3'], revenue: 40, cost: 25 },
            ],
            columnDefs: [
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
            groupDefaultExpanded: -1,
        });
        await asyncSetTimeout(1);

        let deptGroup: any;
        let teamAGroup: any;
        api.forEachNode((node) => {
            if (node.key === 'Dept') {
                deptGroup = node;
            }
            if (node.key === 'Team A') {
                teamAGroup = node;
            }
        });

        expect(api.getCellValue({ rowNode: teamAGroup, colKey: 'profit', useFormatter: false })).toBe(35);
        expect(api.getCellValue({ rowNode: deptGroup, colKey: 'profit', useFormatter: false })).toBe(50);
        expect(api.getCellValue({ rowNode: api.getRowNode('l3')!, colKey: 'profit', useFormatter: false })).toBe(15);
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
        await new GridColumns(api, `server-side store updates invalidate calculated column caches setup`).checkColumns(
            `
                CENTER
                ├── revenue "Revenue" width:200
                ├── cost "Cost" width:200
                └── profit width:200
            `
        );
        await new GridRows(api, `server-side store updates invalidate calculated column caches setup`).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);
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
        await new GridRows(
            api,
            `server-side store updates invalidate calculated column caches after setGridOption serverSideDatasource`
        ).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);
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
        await new GridColumns(api, `dialog displays and stores header references setup`).checkColumns(`
            CENTER
            ├── server-revenue-9d5101c8-4c2a-48e0-9ad2 "Revenue" width:200
            └── server-cost-81f3431b-e4aa-4ef8-bef0 "Cost" width:200
        `);
        await new GridRows(api, `dialog displays and stores header references setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 server-revenue-9d5101c8-4c2a-48e0-9ad2:10 server-cost-81f3431b-e4aa-4ef8-bef0:3
        `);

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
        await new GridRows(api, `dialog displays and stores header references final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 server-revenue-9d5101c8-4c2a-48e0-9ad2:10 calculated_1:7 server-cost-81f3431b-e4aa-4ef8-bef0:3
        `);
    });

    test('dialog accepts column references in any case', async () => {
        const api = createGrid('calculated-dialog-case-insensitive-references', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        showColumnMenu(api, 'revenue');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        setExpression('[REVENUE] - [cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        const rowNode = api.getRowNode('r1')!;
        expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')?.calculatedExpression).toBe('[revenue] - [cost]');
        expect(api.getCellValue({ rowNode, colKey: 'calculated_1', useFormatter: false })).toBe(7);
    });

    test('dialog operator suggestions replace existing operators near the caret', async () => {
        const api = createGrid('calculated-dialog-operator-replacement', {
            rowData: [{ id: 'r1', age: 23, medals: 8 }],
            columnDefs: [{ field: 'age' }, { field: 'medals' }],
        });

        showColumnMenu(api, 'age');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        const input = getExpressionInput();

        setExpression('[Age] + [Medals]');
        input.setSelectionRange('[Age] +'.length, '[Age] +'.length);
        clickDialogButton('Operators');
        clickSuggestion('*');
        expect(input.value).toBe('[Age] * [Medals]');

        setExpression('[Age] + [Medals]');
        input.setSelectionRange('[Age] + '.length, '[Age] + '.length);
        clickDialogButton('Operators');
        clickSuggestion('/');
        expect(input.value).toBe('[Age] / [Medals]');

        setExpression('[Age] >= [Medals]');
        input.setSelectionRange('[Age] >='.length, '[Age] >='.length);
        clickDialogButton('Operators');
        clickSuggestion('<');
        expect(input.value).toBe('[Age] < [Medals]');

        setExpression('[Age] + [Medals]');
        input.setSelectionRange('[Age] '.length, '[Age] +'.length);
        clickDialogButton('Operators');
        clickSuggestion('-');
        expect(input.value).toBe('[Age] - [Medals]');
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
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'revenue_2025',
            'calculated_1',
            'cost_2025',
            'revenue_2026',
            'cost_2026',
        ]);
        expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')?.calculatedExpression).toBe(
            '[revenue_2025] - [cost_2025]'
        );
    });

    test('dialog inserts calculated columns after generated auto group columns in visible order', async () => {
        const api = createGrid('calculated-dialog-auto-group-order', {
            rowData: [{ id: 'r1', productType: 'A', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'productType', rowGroup: true, hide: true }, { field: 'revenue' }, { field: 'cost' }],
        });

        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'ag-Grid-AutoColumn',
            'revenue',
            'cost',
        ]);

        showColumnMenu(api, 'ag-Grid-AutoColumn');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'ag-Grid-AutoColumn',
            'calculated_1',
            'revenue',
            'cost',
        ]);
        expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')?.calculatedExpression).toBe('[revenue] - [cost]');
    });

    test('dialog inserts calculated columns after the clicked generated auto group column in multiple-columns mode', async () => {
        const api = createGrid('calculated-dialog-multiple-auto-group-order', {
            groupDisplayType: 'multipleColumns',
            rowData: [{ id: 'r1', productType: 'A', country: 'UK', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'productType', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'revenue' },
                { field: 'cost' },
            ],
        });

        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'ag-Grid-AutoColumn-productType',
            'ag-Grid-AutoColumn-country',
            'revenue',
            'cost',
        ]);

        showColumnMenu(api, 'ag-Grid-AutoColumn-productType');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'ag-Grid-AutoColumn-productType',
            'calculated_1',
            'ag-Grid-AutoColumn-country',
            'revenue',
            'cost',
        ]);
        expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')?.calculatedExpression).toBe('[revenue] - [cost]');
    });

    test('dialog-anchored calculated column can be moved away from its anchor and stays moved across refreshes', async () => {
        const api = createGrid('calculated-dialog-anchor-then-move', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3, other: 1 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }, { field: 'other' }],
        });

        showColumnMenu(api, 'revenue');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        // Placed immediately after its anchor on creation.
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'revenue',
            'calculated_1',
            'cost',
            'other',
        ]);

        api.moveColumns(['calculated_1'], 3);
        await asyncSetTimeout(1);

        // A subsequent column refresh must not snap it back to the anchor.
        api.setColumnsVisible(['other'], false);
        await asyncSetTimeout(1);
        api.setColumnsVisible(['other'], true);
        await asyncSetTimeout(1);

        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'revenue',
            'cost',
            'other',
            'calculated_1',
        ]);
    });

    test('dialog columns from different auto group columns each stay under their own anchor', async () => {
        const api = createGrid('calculated-dialog-multiple-anchors', {
            groupDisplayType: 'multipleColumns',
            rowData: [{ id: 'r1', productType: 'A', country: 'UK', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'productType', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'revenue' },
                { field: 'cost' },
            ],
        });

        showColumnMenu(api, 'ag-Grid-AutoColumn-productType');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);
        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        showColumnMenu(api, 'ag-Grid-AutoColumn-country');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);
        setExpression('[Revenue] + [Cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        // Adding the second column must not displace the first from its own anchor.
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'ag-Grid-AutoColumn-productType',
            'calculated_1',
            'ag-Grid-AutoColumn-country',
            'calculated_2',
            'revenue',
            'cost',
        ]);
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
        await new GridColumns(api, `dispatches calculated column API lifecycle events setup`).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
        await new GridRows(api, `dispatches calculated column API lifecycle events setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3
        `);

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
        await new GridRows(api, `dispatches calculated column API lifecycle events final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3
        `);
    });

    test('addCalculatedColumn / updateCalculatedColumn / removeCalculatedColumn dispatch newColumnsLoaded', async () => {
        const newColumnsLoaded = vi.fn();
        const api = createGrid('calc-col-newColumnsLoaded', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            onNewColumnsLoaded: newColumnsLoaded,
        });
        // Initial grid setup dispatches it once; clear so we count subsequent triggers cleanly.
        await asyncSetTimeout(1);
        newColumnsLoaded.mockClear();

        api.addCalculatedColumn({ colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(1);
        expect(newColumnsLoaded).toHaveBeenCalledTimes(1);

        newColumnsLoaded.mockClear();
        api.updateCalculatedColumn('profit', { calculatedExpression: '[revenue] * [cost]' });
        await asyncSetTimeout(1);
        expect(newColumnsLoaded).toHaveBeenCalledTimes(1);

        newColumnsLoaded.mockClear();
        api.removeCalculatedColumn('profit');
        await asyncSetTimeout(1);
        expect(newColumnsLoaded).toHaveBeenCalledTimes(1);
    });

    // Solved by AG-17366 when it is completed
    test.skip('updateCalculatedColumn with an unchanged expression does NOT dispatch newColumnsLoaded', async () => {
        const newColumnsLoaded = vi.fn();
        const api = createGrid('calc-col-noop-update', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            onNewColumnsLoaded: newColumnsLoaded,
        });
        api.addCalculatedColumn({ colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(1);
        newColumnsLoaded.mockClear();

        // Same expression — should be a no-op.
        api.updateCalculatedColumn('profit', { calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(1);
        expect(newColumnsLoaded).not.toHaveBeenCalled();

        // Different expression — should fire.
        api.updateCalculatedColumn('profit', { calculatedExpression: '[revenue] * [cost]' });
        await asyncSetTimeout(1);
        expect(newColumnsLoaded).toHaveBeenCalledTimes(1);
    });

    test('updateCalculatedColumn invalidates the formula service per-cell cache', async () => {
        const api = createGrid('calc-col-formula-cache-invalidation', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'result', calculatedExpression: '[revenue] - [cost]' },
            ],
        });
        await asyncSetTimeout(1);

        const rowNode = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode, colKey: 'result', useFormatter: false })).toBe(7);

        api.updateCalculatedColumn('result', { calculatedExpression: '[revenue] * [cost]' });
        await asyncSetTimeout(1);
        expect(api.getCellValue({ rowNode, colKey: 'result', useFormatter: false })).toBe(30);

        api.updateCalculatedColumn('result', { calculatedExpression: '[revenue] + [cost]' });
        await asyncSetTimeout(1);
        expect(api.getCellValue({ rowNode, colKey: 'result', useFormatter: false })).toBe(13);
    });

    test('updateCalculatedColumn applies column-state changes (width, pinned, hide) to the live column', async () => {
        const api = createGrid('calc-col-state-update', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', width: 100 },
            ],
        });
        await asyncSetTimeout(1);

        const profit = api.getColumn('profit')!;
        expect(profit.getActualWidth()).toBe(100);
        expect(profit.isPinned()).toBe(false);
        expect(profit.isVisible()).toBe(true);

        // Static calc col → `dynamicOverrides` → builder.applyOverride. Must re-sync runtime state
        // from the merged colDef, same as the normal column reuse path.
        api.updateCalculatedColumn('profit', { width: 250, pinned: 'left', hide: true });
        await asyncSetTimeout(1);

        const updatedProfit = api.getColumn('profit')!;
        expect(updatedProfit.getActualWidth()).toBe(250);
        expect(updatedProfit.getPinned()).toBe('left');
        expect(updatedProfit.isVisible()).toBe(false);

        // Dynamic (API-added) calc col → `applyColDefTo` reuse path. Same invariant.
        api.addCalculatedColumn({ colId: 'margin', calculatedExpression: '[revenue] - [cost]', width: 120 });
        await asyncSetTimeout(1);

        const margin = api.getColumn('margin')!;
        expect(margin.getActualWidth()).toBe(120);

        api.updateCalculatedColumn('margin', { width: 260, pinned: 'right' });
        await asyncSetTimeout(1);

        const updatedMargin = api.getColumn('margin')!;
        expect(updatedMargin.getActualWidth()).toBe(260);
        expect(updatedMargin.getPinned()).toBe('right');
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
        await new GridColumns(
            api,
            `does not dispatch calculated column lifecycle events for rejected API mutations setup`
        ).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200
        `);
        await new GridRows(api, `does not dispatch calculated column lifecycle events for rejected API mutations setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 revenue:10 cost:3 profit:7
            `);
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
        await new GridRows(
            api,
            `does not dispatch calculated column lifecycle events for rejected API mutations final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);
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
        await new GridColumns(api, `dispatches calculated column UI update and remove events setup`).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit "Profit" width:200
        `);
        await new GridRows(api, `dispatches calculated column UI update and remove events setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);

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
        await new GridRows(api, `dispatches calculated column UI update and remove events final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3
        `);
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
        await new GridColumns(
            api,
            `dispatches calculated column validation state changes after column references ch setup`
        ).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200
        `);
        await new GridRows(
            api,
            `dispatches calculated column validation state changes after column references ch setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);

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
        await new GridRows(
            api,
            `dispatches calculated column validation state changes after column references ch final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);
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
        await new GridColumns(api, `calculated column menu items are grouped by separators setup`).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200
        `);
        await new GridRows(api, `calculated column menu items are grouped by separators setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);

        showColumnMenu(api, 'profit');

        const headerMenuEntries = await waitFor(() => {
            const entries = getOpenMenuEntries();
            expect(entries).toContain('Edit Calculated Column');
            return entries;
        });
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

        const contextMenuEntries = await waitFor(() => {
            const entries = getOpenMenuEntries();
            expect(entries).toContain('Remove Calculated Column');
            return entries;
        });
        const removeIndex = contextMenuEntries.indexOf('Remove Calculated Column');
        expect(contextMenuEntries[removeIndex - 1]).toBe('separator');
        expect(contextMenuEntries[removeIndex + 1]).toBe('separator');
        await new GridRows(api, `calculated column menu items are grouped by separators final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);
    });

    test('dialog type list contains the default data types only', async () => {
        const api = createGrid('calculated-dialog-types', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });
        await new GridColumns(api, `dialog type list contains the default data types only setup`).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
        await new GridRows(api, `dialog type list contains the default data types only setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3
        `);

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
        await new GridRows(api, `dialog type list contains the default data types only final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3
        `);
    });

    test('dialog type list uses configured data types', async () => {
        const api = createGrid('calculated-dialog-configured-types', {
            calculatedColumns: {
                dataTypes: ['number', 'customStatus', 'missingType', 'boolean'],
            },
            dataTypeDefinitions: {
                customStatus: {
                    baseDataType: 'text',
                    extendsDataType: 'text',
                },
            },
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
        expect(typeOptions).toEqual(['Number', 'Custom Status', 'Missing Type', 'Boolean']);
    });

    test('dialog expression picker config hides picker buttons without disabling inline autocomplete', async () => {
        const api = createGrid('calculated-dialog-helper-lists', {
            calculatedColumns: {
                expressionPickers: ['columns'],
            },
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        showColumnMenu(api, 'revenue');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        const dialog = getCalculatedColumnDialog();
        expect(getDialogButton('Columns')).toBeVisible();
        expect(getDialogButton('Functions')).toHaveClass('ag-hidden');
        expect(getDialogButton('Operators')).toHaveClass('ag-hidden');

        const input = getExpressionInput();
        input.value = '[Rev';
        input.setSelectionRange(input.value.length, input.value.length);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await asyncSetTimeout(1);

        expect(dialog).toBeTruthy();
        expect(getSuggestionLabels()).toEqual(expect.arrayContaining(['Revenue']));
    });

    test.each([
        ['empty array', []],
        ['null', null],
    ] as const)(
        'dialog expression picker config supports hiding all picker buttons with %s',
        async (_label, expressionPickers) => {
            const api = createGrid(`calculated-dialog-helper-lists-${_label.replace(' ', '-')}`, {
                calculatedColumns: {
                    expressionPickers,
                },
                rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
                columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            });

            showColumnMenu(api, 'revenue');
            await asyncSetTimeout(10);
            await clickColumnMenuItem('Add Calculated Column');
            await asyncSetTimeout(1);

            expect(getDialogButton('Columns')).toHaveClass('ag-hidden');
            expect(getDialogButton('Functions')).toHaveClass('ag-hidden');
            expect(getDialogButton('Operators')).toHaveClass('ag-hidden');
        }
    );

    test('dialog validates formula syntax and function names before apply', async () => {
        const api = createGrid('calculated-dialog-validation', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });
        await new GridColumns(api, `dialog validates formula syntax and function names before apply setup`)
            .checkColumns(`
                CENTER
                ├── revenue "Revenue" width:200
                └── cost "Cost" width:200
            `);
        await new GridRows(api, `dialog validates formula syntax and function names before apply setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3
        `);

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

        setExpression('IF([Revenue] > [Cost], "Allowed", "")');
        expect(getExpressionInput()).not.toHaveClass('invalid');
        expect(getExpressionInput().validationMessage).toBe('');

        setExpression('IF([Revenue] > [Cost], "Allowed", )');
        expect(getExpressionInput()).toHaveClass('invalid');
        expect(getExpressionInput().validationMessage).toContain('Misplaced comma');
        expect(api.getColumn('calculated_1')).toBeNull();

        setExpression('[Revenue] - [Cost]');
        expect(getExpressionInput()).not.toHaveClass('invalid');
        expect(getExpressionInput().validationMessage).toBe('');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        expect(api.getColumn('calculated_1')).toBeTruthy();
        await new GridRows(api, `dialog validates formula syntax and function names before apply final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 revenue:10 calculated_1:7 cost:3
            `
        );
    });

    test('calculated columns are always non-editable', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
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

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    'colDef.calculatedExpression columns are read-only and should not be combined with editable.'
                )
            );
        } finally {
            consoleWarnSpy.mockRestore();
        }
    });

    test('calculated columns do not write through to row data', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
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

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    'colDef.calculatedExpression is used as the value source and should not be combined with field, valueGetter or valueSetter.'
                )
            );
        } finally {
            consoleWarnSpy.mockRestore();
        }
    });

    test('calculated columns add calculated column classes and opt-in edit highlighting', async () => {
        const api = createGrid('calculated-column-classes', {
            calculatedColumns: {
                columnHighlighting: true,
            },
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
        expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[row-index="0"] [col-id="profit"]')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );

        showColumnMenu(api, 'profit');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Edit Calculated Column');
        await asyncSetTimeout(1);

        expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[row-index="0"] [col-id="profit"]')).toHaveClass(
            'ag-calculated-column-highlighted'
        );

        clickDialogButton('Cancel');
        await asyncSetTimeout(1);

        expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[row-index="0"] [col-id="profit"]')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );
    });

    test('calculated column edit highlighting is disabled by default', async () => {
        const api = createGrid('calculated-column-highlight-disabled', {
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

        showColumnMenu(api, 'profit');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Edit Calculated Column');
        await asyncSetTimeout(1);

        const gridDiv = document.querySelector('#calculated-column-highlight-disabled')!;
        expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[row-index="0"] [col-id="profit"]')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );
    });

    test('openCalculatedColumnDialog opens the edit dialog for an existing calculated column', async () => {
        const api = createGrid('calculated-column-open-dialog-api', {
            calculatedColumns: {
                columnHighlighting: true,
            },
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                {
                    colId: 'profit',
                    headerName: 'Profit',
                    calculatedExpression: '[revenue] - [cost]',
                },
            ],
        });
        await asyncSetTimeout(1);

        api.openCalculatedColumnDialog('profit');
        await asyncSetTimeout(1);

        const dialog = getCalculatedColumnDialog();
        expect(dialog).toBeTruthy();
        expect(dialog.querySelector('input')!.value).toBe('Profit');
        expect(document.activeElement?.closest('[col-id="profit"].ag-header-cell')).toBeNull();

        const gridDiv = document.querySelector('#calculated-column-open-dialog-api')!;
        expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[row-index="0"] [col-id="profit"]')).toHaveClass(
            'ag-calculated-column-highlighted'
        );

        clickDialogButton('Cancel');
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

            validationGridsManager.createGrid('calculated-option-validation', {
                calculatedColumns: {
                    columnHighlighting: true,
                },
                rowData: [{ revenue: 10 }],
                columnDefs: [{ field: 'revenue' }],
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
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

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

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #200'),
                expect.stringContaining('CalculatedColumnsModule'),
                expect.any(String)
            );
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    'colDef.calculatedExpression is used as the value source and should not be combined with field, valueGetter or valueSetter.'
                )
            );
        } finally {
            formulaOnlyGridsManager.reset();
            consoleWarnSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        }
    });

    // calculatedColumnsService writes back via `updateGridOptions({ columnDefs })` to add /
    // update / remove a calc col. Without preserving the live display order in the colDefs it
    // passes through, runtime reorders (drag-drop / moveColumns / applyColumnState) reset to the
    // original setGridOption order on every calc-col mutation.
    // Solved by AG-17366 when it is completed
    test.skip('adding a calculated column preserves the current display order after moveColumns', async () => {
        const api = createGrid('calculated-cols-preserve-order', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
        });
        await asyncSetTimeout(0);

        // Sanity: original order.
        expect(api.getAllGridColumns()!.map((col) => col.getColId())).toEqual(['a', 'b', 'c']);

        // Reorder via API — drag-drop equivalent — so col `c` is first.
        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);
        expect(api.getAllGridColumns()!.map((col) => col.getColId())).toEqual(['c', 'a', 'b']);

        // Add a calculated column. Its round-trip through `updateGridOptions({ columnDefs })`
        // must not reset the reorder.
        api.addCalculatedColumn({ colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        expect(api.getAllGridColumns()!.map((col) => col.getColId())).toEqual(['c', 'a', 'b', 'sum']);
        expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'sum', useFormatter: false })).toBe(
            6
        );

        await new GridColumns(api, 'reorder + addCalculatedColumn').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├── a "A" width:200
            ├── b "B" width:200
            └── sum width:200
        `);
        await new GridRows(api, 'reorder + addCalculatedColumn rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    // Same invariant with a column group: the group structure must survive the calc-col round-trip
    // and the runtime reorder must be preserved.
    // Solved by AG-17366 when it is completed
    test.skip('addCalculatedColumn preserves group structure and reorder when columns are grouped', async () => {
        const api = createGrid('calc-cols-with-groups', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ groupId: 'G', headerName: 'G', children: [{ field: 'a' }, { field: 'b' }] }, { field: 'c' }],
        });
        await asyncSetTimeout(0);

        // Move `c` before the group → display order [c, a, b]; group G still wraps [a, b].
        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);

        // Add a calculated column at top level (no target column passed).
        api.addCalculatedColumn({ colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        // After the round-trip: `c` stays first, group G still wraps [a, b], sum at the end.
        expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'sum', useFormatter: false })).toBe(
            6
        );
        await new GridColumns(api, 'group + reorder + addCalculatedColumn').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├─┬ "G" GROUP
            │ ├── a "A" width:200
            │ └── b "B" width:200
            └── sum width:200
        `);
        await new GridRows(api, 'group + reorder + addCalculatedColumn rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    // Same order-preservation invariant, but via `applyColumnState({ applyOrder: true })` instead
    // of `moveColumns`. Drives the same `colsList` mutation through a different code path —
    // guards that the lean variant's display-order sort sees the applied order.
    // Solved by AG-17366 when it is completed
    test.skip('addCalculatedColumn preserves order set via applyColumnState({ applyOrder: true })', async () => {
        const api = createGrid('calc-cols-preserve-applyOrder', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
        });
        await asyncSetTimeout(0);

        // Reorder via column state.
        api.applyColumnState({
            state: [{ colId: 'c' }, { colId: 'a' }, { colId: 'b' }],
            applyOrder: true,
        });
        await asyncSetTimeout(0);
        expect(api.getAllGridColumns()!.map((col) => col.getColId())).toEqual(['c', 'a', 'b']);

        api.addCalculatedColumn({ colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        expect(api.getAllGridColumns()!.map((col) => col.getColId())).toEqual(['c', 'a', 'b', 'sum']);
        expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'sum', useFormatter: false })).toBe(
            6
        );
        await new GridColumns(api, 'applyOrder + addCalculatedColumn').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├── a "A" width:200
            ├── b "B" width:200
            └── sum width:200
        `);
        await new GridRows(api, 'applyOrder + addCalculatedColumn rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    // A column with `groupHierarchy` generates synthetic virtual columns alongside the source.
    // Adding a calculated column triggers a `updateGridOptions({ columnDefs })` round-trip through
    // the lean variant, which reads `col.userProvidedColDef ?? col.colDef` — for the virtuals
    // (no user-provided def), this falls back to the synthetic merged def. After the round-trip
    // the hierarchy service must still have a valid set of virtual columns AND the calc col must
    // evaluate.
    // Solved by AG-17366 when it is completed
    test.skip('addCalculatedColumn round-trip preserves groupHierarchy virtual columns', async () => {
        const api = createGrid('calc-cols-with-hierarchy', {
            rowData: [
                { id: 'r1', country: 'USA', date: new Date(2020, 0, 1), amount: 10 },
                { id: 'r2', country: 'UK', date: new Date(2021, 5, 15), amount: 20 },
            ],
            columnDefs: [
                { field: 'country' },
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                { field: 'amount' },
            ],
        });
        await asyncSetTimeout(0);

        // Virtual cols exist before the round-trip.
        const yearVirtualBefore = api.getColumn('ag-Grid-HierarchyColumn-date-year');
        const monthVirtualBefore = api.getColumn('ag-Grid-HierarchyColumn-date-month');
        expect(yearVirtualBefore).not.toBeNull();
        expect(monthVirtualBefore).not.toBeNull();

        // Add a calc col — full updateGridOptions round-trip.
        api.addCalculatedColumn({ colId: 'doubled', calculatedExpression: '[amount] * 2' });
        await asyncSetTimeout(0);

        // Virtuals still present and alive after the round-trip.
        const yearVirtualAfter = api.getColumn('ag-Grid-HierarchyColumn-date-year');
        const monthVirtualAfter = api.getColumn('ag-Grid-HierarchyColumn-date-month');
        expect(yearVirtualAfter).not.toBeNull();
        expect(monthVirtualAfter).not.toBeNull();
        expect((yearVirtualAfter as any)!.isAlive()).toBe(true);
        expect((monthVirtualAfter as any)!.isAlive()).toBe(true);

        // EXACTLY ONE set of hierarchy virtuals must exist. `latest` keeps virtuals in a
        // separate `groupHierarchyColSvc.columns` collection so they never round-trip through
        // `api.getColumnDefs()`. My branch's column-model rewrite merged them into `colDefList`,
        // so without filtering they'd appear in factory output → fed back through
        // `updateGridOptions({ columnDefs })` → `_1`-suffixed duplicates from `getUniqueKey`.
        const hierarchyCols = api
            .getAllGridColumns()!
            .filter((col) => col.getColId().startsWith('ag-Grid-HierarchyColumn-'));
        expect(hierarchyCols.map((c) => c.getColId())).toEqual([
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
        ]);

        // Calc col evaluates.
        expect(
            api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'doubled', useFormatter: false })
        ).toBe(20);
        await new GridColumns(api, 'hierarchy + addCalculatedColumn').checkColumns(`
            CENTER
            ├── country "Country" width:200
            ├── date "Date" width:200
            ├── amount "Amount" width:200
            └── doubled width:200
        `);
        await new GridRows(api, 'hierarchy + addCalculatedColumn rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            ├── LEAF id:r1 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-month:"1" country:"USA" date:"2020-01-01T00:00:00.000Z" amount:10 doubled:20
            └── LEAF id:r2 ag-Grid-HierarchyColumn-date-year:"2021" ag-Grid-HierarchyColumn-date-month:"6" country:"UK" date:"2021-06-14T23:00:00.000Z" amount:20 doubled:40
        `);
    });

    // Bracket references in calculated expressions can name a column by its `field` even when the
    // column carries an explicit `colId` that differs. `calculatedColumnsService` validates such
    // references via `colModel.getCol(ref)` (which falls back to field-name lookup), so the AST
    // parser must use the same lookup or validation accepts a reference that evaluation can't
    // resolve. Locks in parser/validator consistency.
    // Solved by AG-17366 when it is completed
    test.skip('calculated expression bracket-reference resolves a column by field when colId differs', async () => {
        const api = createGrid('calc-bracket-field-ref', {
            rowData: [{ id: 'r1', revenue: 10 }],
            columnDefs: [
                // colId differs from field — bracket ref `[revenue]` must resolve via field.
                { colId: 'rev', field: 'revenue' },
                { colId: 'doubled', calculatedExpression: '[revenue] * 2' },
            ],
        });
        await asyncSetTimeout(0);

        expect(
            api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'doubled', useFormatter: false })
        ).toBe(20);
        await new GridRows(api, 'field-based bracket-ref calc col rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 rev:10 doubled:20
        `);
    });

    // §3.6 expanded coverage: integration of dynamic calc cols with other column-model features.
    // Each test exercises a feature that interacts with `colsList` / `colDefList` or service cols,
    // and asserts the calc col splice cooperates with the existing flow.

    test('addCalculatedColumn after moveColumns with maintainColumnOrder=true preserves reorder', async () => {
        const api = createGrid('calc-maintain-true-move', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            maintainColumnOrder: true,
        });
        await asyncSetTimeout(0);

        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);

        api.addCalculatedColumn({ colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'maintainColumnOrder=true: move + addCalcCol').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├── a "A" width:200
            ├── b "B" width:200
            └── sum width:200
        `);
        await new GridRows(api, 'maintainColumnOrder=true: move + addCalcCol rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    // Solved by AG-17366 when it is completed
    test.skip('addCalculatedColumn after moveColumns with maintainColumnOrder=false preserves reorder', async () => {
        const api = createGrid('calc-maintain-false-move', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            maintainColumnOrder: false,
        });
        await asyncSetTimeout(0);

        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);

        api.addCalculatedColumn({ colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        // Order preservation now comes from the incremental snapshot, not maintainColumnOrder.
        await new GridColumns(api, 'maintainColumnOrder=false: move + addCalcCol').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├── a "A" width:200
            ├── b "B" width:200
            └── sum width:200
        `);
        await new GridRows(api, 'maintainColumnOrder=false: move + addCalcCol rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    test('updateGridOptions({ columnDefs }) with reordered cols + maintainColumnOrder=true keeps reorder', async () => {
        const api = createGrid('calc-maintain-true-update', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            maintainColumnOrder: true,
        });
        await asyncSetTimeout(0);

        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);

        // Re-pass colDefs in DIFFERENT order; maintainColumnOrder=true keeps the runtime reorder.
        api.updateGridOptions({ columnDefs: [{ field: 'b' }, { field: 'a' }, { field: 'c' }] });
        await asyncSetTimeout(0);

        api.addCalculatedColumn({ colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'maintainColumnOrder=true: updateColDefs + addCalcCol').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├── a "A" width:200
            ├── b "B" width:200
            └── sum width:200
        `);
        await new GridRows(api, 'maintainColumnOrder=true: updateColDefs + addCalcCol rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    test('updateGridOptions({ columnDefs }) with reordered cols + maintainColumnOrder=false resets order', async () => {
        const api = createGrid('calc-maintain-false-update', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            maintainColumnOrder: false,
        });
        await asyncSetTimeout(0);

        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);

        // maintainColumnOrder=false: passing new colDefs resets to the colDef order.
        api.updateGridOptions({ columnDefs: [{ field: 'b' }, { field: 'a' }, { field: 'c' }] });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'maintainColumnOrder=false: updateColDefs resets order').checkColumns(`
            CENTER
            ├── b "B" width:200
            ├── a "A" width:200
            └── c "C" width:200
        `);
    });

    test('addCalculatedColumn while rowGroup is active does not affect grouping', async () => {
        const api = createGrid('calc-with-rowGroup', {
            rowData: [
                { id: 'r1', category: 'A', revenue: 10, cost: 3 },
                { id: 'r2', category: 'A', revenue: 20, cost: 5 },
                { id: 'r3', category: 'B', revenue: 15, cost: 4 },
            ],
            columnDefs: [{ field: 'category', rowGroup: true, hide: true }, { field: 'revenue' }, { field: 'cost' }],
            autoGroupColumnDef: { headerName: 'Category' },
        });
        await asyncSetTimeout(0);

        api.addCalculatedColumn({ colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'rowGroup + calc col').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Category" width:200
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200
        `);
        // Expand a group so leaves render and the calc col's per-row evaluation appears.
        // `forceSync=true` skips the async dispatch so the snapshot below sees the expanded
        // state deterministically (without it, a single `asyncSetTimeout(0)` doesn't reliably
        // flush the row-render work and the test flakes between collapsed/expanded states).
        const groupRow = api.getDisplayedRowAtIndex(0)!;
        api.setRowNodeExpanded(groupRow, true, undefined, true);
        await asyncSetTimeout(0);
        await new GridRows(api, 'rowGroup + calc col rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-category-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:r1 category:"A" revenue:10 cost:3 profit:7
            │ └── LEAF id:r2 category:"A" revenue:20 cost:5 profit:15
            └─┬ LEAF_GROUP collapsed id:row-group-category-B ag-Grid-AutoColumn:"B"
            · └── LEAF hidden id:r3 category:"B" revenue:15 cost:4 profit:11
        `);
    });

    // Solved by AG-17366 when it is completed
    test.skip('addCalculatedColumn while pivot is active references primary columns', async () => {
        const api = createGrid('calc-with-pivot', {
            rowData: [
                { id: 'r1', country: 'US', year: 2020, revenue: 10, cost: 3 },
                { id: 'r2', country: 'UK', year: 2020, revenue: 20, cost: 5 },
                { id: 'r3', country: 'US', year: 2021, revenue: 15, cost: 4 },
            ],
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
            ],
            pivotMode: true,
        });
        await asyncSetTimeout(0);

        // A calc col is a primary (non-value) column, so the pivot cross-tab has no cell for it:
        // adding one while pivot is active does NOT add it to the pivot display, and the pivot result
        // is unaffected. It stays a resolvable primary column (and reappears when pivot is off).
        api.addCalculatedColumn({ colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(0);

        expect(api.getColumn('profit')).toBeTruthy();
        await new GridColumns(api, 'pivot + calc col').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2020" GROUP
            │ ├── pivot_year_2020_revenue "Revenue" width:200 columnGroupShow:open
            │ └── pivot_year_2020_cost "Cost" width:200 columnGroupShow:open
            └─┬ "2021" GROUP
              ├── pivot_year_2021_revenue "Revenue" width:200 columnGroupShow:open
              └── pivot_year_2021_cost "Cost" width:200 columnGroupShow:open
        `);
    });

    test('addCalculatedColumn while rowSelection is configured keeps the selection col first', async () => {
        const api = createGrid('calc-with-rowSelection', {
            rowData: [
                { id: 'r1', revenue: 10, cost: 3 },
                { id: 'r2', revenue: 20, cost: 5 },
            ],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            rowSelection: { mode: 'multiRow', checkboxes: true },
        });
        await asyncSetTimeout(0);

        api.addCalculatedColumn({ colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'rowSelection + calc col').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200
        `);
        await new GridRows(api, 'rowSelection + calc col rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenue:10 cost:3 profit:7
            └── LEAF id:r2 revenue:20 cost:5 profit:15
        `);
    });

    test('addCalculatedColumn while rowNumbers is enabled keeps the rowNumbers col first', async () => {
        const api = createGrid('calc-with-rowNumbers', {
            rowData: [
                { id: 'r1', revenue: 10, cost: 3 },
                { id: 'r2', revenue: 20, cost: 5 },
            ],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            rowNumbers: true,
        });
        await asyncSetTimeout(0);

        api.addCalculatedColumn({ colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'rowNumbers + calc col').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200
        `);
        await new GridRows(api, 'rowNumbers + calc col rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" revenue:10 cost:3 profit:7
            └── LEAF id:r2 row-number:"2" revenue:20 cost:5 profit:15
        `);
    });

    // Solved by AG-17366 when it is completed
    test.skip('moveColumns on a previously-added dynamic calc col preserves the move across subsequent adds', async () => {
        const api = createGrid('calc-move-then-add', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
        });
        await asyncSetTimeout(0);

        api.addCalculatedColumn({ colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        // Move sum to position 0 after creation.
        api.moveColumns(['sum'], 0);
        await asyncSetTimeout(0);

        // Add another calc col; sum's runtime position should still be 0.
        api.addCalculatedColumn({ colId: 'avg', calculatedExpression: '([a] + [b] + [c]) / 3' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'moveColumns on calc col + subsequent add').checkColumns(`
            CENTER
            ├── sum width:200
            ├── a "A" width:200
            ├── b "B" width:200
            ├── c "C" width:200
            └── avg width:200
        `);
        await new GridRows(api, 'moveColumns on calc col + subsequent add rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 sum:6 a:1 b:2 c:3 avg:2
        `);
    });
});

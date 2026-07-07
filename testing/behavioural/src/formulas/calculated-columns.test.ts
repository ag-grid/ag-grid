import { waitFor } from '@testing-library/dom';
import type { MockInstance } from 'vitest';
import { vi } from 'vitest';

import type { ColDef, ColGroupDef, GridApi, GridOptions, Module } from 'ag-grid-community';
import {
    CellSpanModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
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
    nextAnimationFrame,
    waitForEvent,
} from '../test-utils';

describe('ag-grid calculated columns', () => {
    const flashCssClass = 'ag-cell-data-changed';
    const gridRowsOpts = { useFormatter: false } as const;
    let restoreOffsetParent: (() => void) | undefined;
    let restoreVirtualListSize: (() => void) | undefined;
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
            HighlightChangesModule,
        ] as Module[],
    });

    beforeEach(() => {
        gridsManager.reset();
        enableVirtualListSizePolyfill();
    });

    afterEach(() => {
        gridsManager.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
        restoreVirtualListSize?.();
        restoreVirtualListSize = undefined;
    });

    function createGrid(id: string, opts: Partial<GridOptions>) {
        const options: GridOptions = {
            getRowId: (params) => params.data?.id,
            calculatedColumns: true,
            ...opts,
        };
        return gridsManager.createGrid(id, options);
    }

    function addCalculatedColumnDef(api: GridApi, colDef: ColDef): void {
        api.setGridOption('columnDefs', [...(api.getColumnDefs() ?? []), colDef]);
    }

    function updateCalculatedColumnDef(api: GridApi, colId: string, colDefUpdate: ColDef): void {
        api.setGridOption('columnDefs', updateColumnDef(api.getColumnDefs() ?? [], colId, colDefUpdate));
    }

    function removeColumnDef(api: GridApi, colId: string): void {
        api.setGridOption('columnDefs', removeColumnDefFromDefs(api.getColumnDefs() ?? [], colId));
    }

    function updateColumnDef(
        columnDefs: (ColDef | ColGroupDef)[],
        colId: string,
        colDefUpdate: ColDef
    ): (ColDef | ColGroupDef)[] {
        return columnDefs.map((colDef) => {
            if ('children' in colDef) {
                return { ...colDef, children: updateColumnDef(colDef.children, colId, colDefUpdate) };
            }

            return (colDef.colId ?? colDef.field) === colId ? { ...colDef, ...colDefUpdate } : colDef;
        });
    }

    function removeColumnDefFromDefs(columnDefs: (ColDef | ColGroupDef)[], colId: string): (ColDef | ColGroupDef)[] {
        const nextColumnDefs: (ColDef | ColGroupDef)[] = [];
        for (let i = 0, len = columnDefs.length; i < len; ++i) {
            const colDef = columnDefs[i];
            if ('children' in colDef) {
                nextColumnDefs.push({ ...colDef, children: removeColumnDefFromDefs(colDef.children, colId) });
            } else if ((colDef.colId ?? colDef.field) !== colId) {
                nextColumnDefs.push(colDef);
            }
        }
        return nextColumnDefs;
    }

    function enableOffsetParentPolyfill(): void {
        if (restoreOffsetParent) {
            return;
        }

        const originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
            configurable: true,
            get(this: HTMLElement) {
                // Keep the theme measurement probes "detached" so AG's environment falls back to default
                // list-item height (jsdom reports offsetWidth 0, which would otherwise zero the row height).
                if (this.closest('.ag-measurement-container')) {
                    return null;
                }
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

    function enableVirtualListSizePolyfill(): void {
        if (restoreVirtualListSize) {
            return;
        }

        const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
        const originalClientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
        const getVirtualListHeight = (element: HTMLElement): number | undefined => {
            if (
                !element.classList.contains('ag-virtual-list-viewport') &&
                !element.classList.contains('ag-virtual-list-container')
            ) {
                return undefined;
            }

            const styleHeight = Number.parseFloat(element.style.height);
            return Number.isFinite(styleHeight) && styleHeight > 0 ? styleHeight : 160;
        };

        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
            configurable: true,
            get(this: HTMLElement) {
                return getVirtualListHeight(this) ?? originalOffsetHeight?.get?.call(this) ?? 0;
            },
        });
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
            configurable: true,
            get(this: HTMLElement) {
                return getVirtualListHeight(this) ?? originalClientHeight?.get?.call(this) ?? 0;
            },
        });

        restoreVirtualListSize = () => {
            if (originalOffsetHeight) {
                Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
            } else {
                delete (HTMLElement.prototype as any).offsetHeight;
            }
            if (originalClientHeight) {
                Object.defineProperty(HTMLElement.prototype, 'clientHeight', originalClientHeight);
            } else {
                delete (HTMLElement.prototype as any).clientHeight;
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

    async function openEditDialogViaMenu(api: { showColumnMenu(colKey: string): void }, colKey: string): Promise<void> {
        showColumnMenu(api, colKey);
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Edit Calculated Column');
        await asyncSetTimeout(1);
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

    async function selectDataType(label: string): Promise<void> {
        getCalculatedColumnDialog()
            .querySelector<HTMLElement>('.ag-select .ag-picker-field-wrapper')!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await asyncSetTimeout(1);
        const option = Array.from(document.querySelectorAll<HTMLElement>('.ag-list-item')).find(
            (element) => element.textContent?.trim() === label
        );
        expect(option).toBeTruthy();
        option!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }

    function getSuggestionLabels(): string[] {
        return Array.from(document.querySelectorAll<HTMLElement>('.ag-autocomplete-row-label')).map(
            (element) => element.textContent?.trim() ?? ''
        );
    }

    // The suggestion list (AgAutocompleteList) selects by hover/keyboard, not by clicking a specific row.
    const OPERATOR_ORDER = ['+', '-', '*', '/', '^', '&', '=', '<>', '>', '>=', '<', '<='];
    async function selectOperatorSuggestion(symbol: string): Promise<void> {
        const input = getExpressionInput();
        const index = OPERATOR_ORDER.indexOf(symbol);
        for (let i = 0; i < index; i++) {
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        }
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await asyncSetTimeout(1);
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
            ├── profit "Profit" width:200 ƒ
            ├── profitable width:200 ƒ
            └── name width:200 ƒ
        `);

        api.getRowNode('r1')!.setDataValue('revenueCol', 15);
        await asyncSetTimeout(1);

        await new GridRows(api, 'after setDataValue', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenueCol:15 cost:3 first:"Ada" last:"Lovelace" profit:12 profitable:"yes" name:"Ada Lovelace"
            └── LEAF id:r2 revenueCol:20 cost:8 first:"Grace" last:"Hopper" profit:12 profitable:"yes" name:"Grace Hopper"
        `);

        api.getRowNode('r1')!.setData({
            id: 'r1',
            revenue: 18,
            cost: 4,
            first: 'Ada',
            last: 'Lovelace',
        });
        await asyncSetTimeout(1);

        await new GridRows(api, 'after setData', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenueCol:18 cost:4 first:"Ada" last:"Lovelace" profit:14 profitable:"yes" name:"Ada Lovelace"
            └── LEAF id:r2 revenueCol:20 cost:8 first:"Grace" last:"Hopper" profit:12 profitable:"yes" name:"Grace Hopper"
        `);

        applyTransactionChecked(api, { update: [{ ...rowData[1], revenue: 30, cost: 9 }] });
        await asyncSetTimeout(1);

        await new GridRows(api, 'after transaction update', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenueCol:18 cost:4 first:"Ada" last:"Lovelace" profit:14 profitable:"yes" name:"Ada Lovelace"
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
            ├── LEAF id:r1 athlete:"A"↧2 athleteCopy:"A"↧2
            ├── LEAF id:r2 athlete:"A"↥ athleteCopy:"A"↥
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

        addCalculatedColumnDef(api, { colId: 'athleteCopy', calculatedExpression: '[athlete]' });
        await asyncSetTimeout(1);
        await new GridRows(api, 'dynamic calculated span rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 athlete:"A"↧2 athleteCopy:"A"↧2
            ├── LEAF id:r2 athlete:"A"↥ athleteCopy:"A"↥
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
            ├── LEAF id:r1 constant:"Same"↧3
            ├── LEAF id:r2 constant:"Same"↥
            └── LEAF id:r3 constant:"Same"↥
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

    test('empty or null calculatedExpression is still a calculated column (renders empty, not a plain blank cell)', async () => {
        const api = createGrid('calculated-empty-expression', {
            columnDefs: [
                { colId: 'calcEmpty', calculatedExpression: '' },
                { colId: 'calcNull', calculatedExpression: null as unknown as string },
                { colId: 'plain' },
            ],
            rowData: [{ id: '0' }],
        });
        const node = api.getRowNode('0')!;

        await new GridRows(api, 'empty/null calculatedExpression', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID calcEmpty:"" calcNull:""
            └── LEAF id:0 calcEmpty:"" calcNull:""
        `);

        expect(api.getCellValue({ rowNode: node, colKey: 'calcEmpty', useFormatter: false })).toBe('');
        expect(api.getCellValue({ rowNode: node, colKey: 'calcNull', useFormatter: false })).toBe('');
        expect(api.getCellValue({ rowNode: node, colKey: 'plain', useFormatter: false })).toBeUndefined();
    });

    test('does not enable calculated columns when calculatedColumns is omitted or false', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const cases: { id: string; calculatedColumns: false | undefined }[] = [
            { id: 'calculated-option-omitted', calculatedColumns: undefined },
            { id: 'calculated-option-false', calculatedColumns: false },
        ];

        try {
            for (let i = 0, len = cases.length; i < len; ++i) {
                const { id, calculatedColumns } = cases[i];
                const api = createGrid(id, {
                    calculatedColumns,
                    rowData: [{ id: 'r1', revenue: 10, cost: 3, profit: 999 }],
                    columnDefs: [
                        { field: 'revenue' },
                        { field: 'cost' },
                        {
                            field: 'profit',
                            calculatedExpression: '[revenue] - [cost]',
                            editable: true,
                        },
                    ],
                });
                const rowNode = api.getDisplayedRowAtIndex(0)!;
                const profitColumn = api.getColumn('profit')!;

                // No `calculated` token: the column is a plain editable field, not a calculated column.
                await new GridColumns(api, id).checkColumns(`
                    CENTER
                    ├── revenue "Revenue" width:200
                    ├── cost "Cost" width:200
                    └── profit "Profit" width:200 editable
                `);
                expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(999);
                expect(profitColumn.isSuppressPaste(rowNode)).toBe(false);
                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    expect.stringContaining('warning #319'),
                    expect.stringContaining(
                        '`colDef.calculatedExpression` requires `gridOptions.calculatedColumns` to be set to true or an options object.'
                    ),
                    expect.any(String)
                );
            }
        } finally {
            consoleWarnSpy.mockRestore();
        }
    });

    test('runtime calculatedColumns toggle enables and disables static calculated columns', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const api = createGrid('calculated-option-runtime-toggle', {
                calculatedColumns: false,
                rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
                columnDefs: [
                    { field: 'revenue' },
                    { field: 'cost' },
                    { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
                ],
            });
            const rowNode = api.getDisplayedRowAtIndex(0)!;

            // calculatedColumns off: no `calculated` token and the expression is not evaluated.
            await new GridColumns(api, 'toggle off (initial)').checkColumns(`
                CENTER
                ├── revenue "Revenue" width:200
                ├── cost "Cost" width:200
                └── profit width:200
            `);
            expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBeUndefined();

            api.setGridOption('calculatedColumns', true);
            await asyncSetTimeout(1);

            // calculatedColumns on: the column becomes calculated and the expression evaluates.
            await new GridColumns(api, 'toggle on').checkColumns(`
                CENTER
                ├── revenue "Revenue" width:200
                ├── cost "Cost" width:200
                └── profit width:200 ƒ
            `);
            expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(7);

            api.setGridOption('calculatedColumns', false);
            await asyncSetTimeout(1);

            // Toggling off again drops the `calculated` token and stops evaluation.
            await new GridColumns(api, 'toggle off (again)').checkColumns(`
                CENTER
                ├── revenue "Revenue" width:200
                ├── cost "Cost" width:200
                └── profit width:200
            `);
            expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBeUndefined();
        } finally {
            consoleWarnSpy.mockRestore();
        }
    });

    test('editing a calculated column expression re-groups its row spans (and dependents)', async () => {
        const api = createGrid('calculated-span-rows-expression-edit', {
            enableCellSpan: true,
            rowData: [
                { id: 'r1', a: 'X', b: 'P' },
                { id: 'r2', a: 'X', b: 'Q' },
                { id: 'r3', a: 'Y', b: 'Q' },
            ],
            columnDefs: [
                { field: 'a' },
                { field: 'b' },
                { colId: 'calc', calculatedExpression: '[a]', spanRows: true },
                { colId: 'dep', calculatedExpression: '[calc]', spanRows: true },
            ],
        });
        await asyncSetTimeout(1);

        await new GridRows(api, 'calc spans by [a]', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 a:"X" b:"P" calc:"X"↧2 dep:"X"↧2
            ├── LEAF id:r2 a:"X" b:"Q" calc:"X"↥ dep:"X"↥
            └── LEAF id:r3 a:"Y" b:"Q" calc:"Y" dep:"Y"
        `);

        updateCalculatedColumnDef(api, 'calc', { calculatedExpression: '[b]' });
        await nextAnimationFrame();
        await nextAnimationFrame();

        await new GridRows(api, 'calc re-spans by [b] after expression edit', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 a:"X" b:"P" calc:"P" dep:"P"
            ├── LEAF id:r2 a:"X" b:"Q" calc:"Q"↧2 dep:"Q"↧2
            └── LEAF id:r3 a:"Y" b:"Q" calc:"Q"↥ dep:"Q"↥
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
        await new GridColumns(api, 'sorting, filtering and value formatters use evaluated values').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200 sort:desc ƒ filter
        `);
    });

    test('grid api adds, updates and removes calculated columns', async () => {
        const api = createGrid('calculated-grid-api', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        addCalculatedColumnDef(api, {
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

        updateCalculatedColumnDef(api, 'profit', {
            calculatedExpression: '[revenue] * [cost]',
        });
        await asyncSetTimeout(1);

        await new GridRows(api, 'updated calculated column', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:30
        `);

        removeColumnDef(api, 'profit');
        await asyncSetTimeout(1);

        await new GridColumns(api, 'removed calculated column').checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
    });

    test('removing the sole calc column of a group destroys the column but keeps the (now-empty) group', async () => {
        const api = createGrid('calc-empty-group', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                {
                    groupId: 'derived',
                    headerName: 'Derived',
                    children: [{ colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' }],
                },
            ] as (ColDef | ColGroupDef)[],
        });
        await asyncSetTimeout(1);

        const profitBefore = api.getColumn('profit');
        expect(api.getProvidedColumnGroup('derived') === null).toBe(false);
        expect(profitBefore === null).toBe(false);

        removeColumnDef(api, 'profit');
        await asyncSetTimeout(1);

        // The removed COLUMN is gone and destroyed, but the user-declared GROUP stays findable (now
        // empty) — it must not be silently dropped. Compare booleans (not objects) so failures print
        // cleanly.
        expect(api.getColumn('profit') === null).toBe(true);
        expect((profitBefore as unknown as { isAlive(): boolean }).isAlive()).toBe(false);
        const derivedAfter = api.getProvidedColumnGroup('derived') as unknown as { children: unknown[] } | null;
        expect(derivedAfter === null).toBe(false);
        expect(derivedAfter!.children.length).toBe(0);

        await new GridColumns(api, 'column removed, empty group kept').checkColumns(`
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

        addCalculatedColumnDef(api, { colId: 'margin', calculatedExpression: '[profit] / [revenue]' });
        await asyncSetTimeout(1);

        expect(columnDefs).toEqual([revenueColDef, costColDef, profitColDef]);
        expect(columnDefs).toHaveLength(3);
        expect(findColumnDef(api.getColumnDefs()!, 'margin')?.calculatedExpression).toBe('[profit] / [revenue]');

        updateCalculatedColumnDef(api, 'profit', { headerName: 'Profit', calculatedExpression: '[revenue] * [cost]' });
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

        removeColumnDef(api, 'profit');
        await asyncSetTimeout(1);

        expect(columnDefs).toEqual([revenueColDef, costColDef, profitColDef]);
        expect(findColumnDef(api.getColumnDefs()!, 'profit')).toBeUndefined();
        expect(findColumnDef(api.getColumnDefs()!, 'margin')).toBeTruthy();

        api.setGridOption('columnDefs', columnDefs.slice());
        await asyncSetTimeout(1);

        expect(findColumnDef(api.getColumnDefs()!, 'profit')?.calculatedExpression).toBe('[revenue] - [cost]');
        expect(findColumnDef(api.getColumnDefs()!, 'margin')).toBeUndefined();
        await new GridColumns(api, 'grid api calculated column mutations do not mutate provided column definitions')
            .checkColumns(`
                CENTER
                ├── revenue "Revenue" width:200
                ├── cost "Cost" width:200
                └── profit width:200 ƒ
            `);
    });

    test('reset column state removes dynamic calculated columns and restores provided calculated columns', async () => {
        const removed = vi.fn();
        const api = createGrid('calculated-reset-column-state', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] - [cost]' },
            ],
            onCalculatedColumnRemoved: removed,
        });

        showColumnMenu(api, 'profit');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);
        setExpression('[Profit] / [Revenue]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        expect(api.getColumn('calculated_1')).toBeTruthy();
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'revenue',
            'cost',
            'profit',
            'calculated_1',
        ]);
        const columnState = api.getColumnState();

        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Revenue] * [Cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        showColumnMenu(api, 'profit');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Remove Calculated Column');
        await asyncSetTimeout(1);

        expect(api.getColumn('profit')).toBeNull();
        expect(removed).toHaveBeenCalledTimes(1);

        api.resetColumnState();
        await asyncSetTimeout(1);

        expect(api.getColumn('calculated_1')).toBeNull();
        expect(api.getColumn('profit')).toBeTruthy();
        expect(removed).toHaveBeenCalledTimes(1);
        expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')).toBeUndefined();
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

        expect(api.getColumn('calculated_1')).toBeTruthy();
        expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')?.calculatedExpression).toBe('[profit] / [revenue]');
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'revenue',
            'cost',
            'profit',
            'calculated_1',
        ]);
        await new GridColumns(
            api,
            'reset column state removes dynamic calculated columns and restores provided calculated columns'
        ).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            ├── profit "Profit" width:200 ƒ
            └── calculated_1 "Untitled" width:200 ƒ
        `);
    });

    test('edit dialog updates calculated column cellDataType without keeping stale boolean renderer', async () => {
        const api = createGrid('calculated-grid-api-cell-data-type', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                {
                    colId: 'profitable',
                    headerName: 'Profitable',
                    calculatedExpression: 'IF([revenue] > [cost], "yes", "no")',
                    cellDataType: 'text',
                },
            ],
        });
        await asyncSetTimeout(1);

        await openEditDialogViaMenu(api, 'profitable');
        setExpression('[revenue] > [cost]');
        await selectDataType('Boolean');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        expect(api.getColumn('profitable')!.getColDef().cellRenderer).toBe('agCheckboxCellRenderer');

        await openEditDialogViaMenu(api, 'profitable');
        setExpression('IF([revenue] > [cost], "yes", "no")');
        await selectDataType('Text');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        await new GridRows(api, 'updated calculated column cell data type', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profitable:"yes"
        `);
        expect(api.getColumn('profitable')!.getColDef().cellRenderer).toBeUndefined();
        await new GridColumns(
            api,
            'grid api updates calculated column cellDataType without keeping stale boolean renderer'
        ).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profitable "Profitable" width:200 ƒ
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
        await new GridColumns(api, `grid api refreshes calculated-only formula caches setup`).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200 ƒ
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

    test('source cells keep change flashing after a calculated column is added', async () => {
        const api = createGrid('calculated-change-flash', {
            defaultColDef: {
                enableCellChangeFlash: true,
            },
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
        });
        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b]' });
        await asyncSetTimeout(600);

        const gridDiv = getGridElement(api)!;
        const sourceCell = gridDiv.querySelector('[row-index="0"] [col-id="a"]')!;
        expect(sourceCell).not.toHaveClass(flashCssClass);

        api.getRowNode('r1')!.setDataValue('a', 10);
        await asyncSetTimeout(0);

        expect(sourceCell).toHaveClass(flashCssClass);
    });

    test('calculated columns stay blank on row group rows; leaf rows evaluate', async () => {
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
        await new GridColumns(api, `calculated columns blank on row group rows setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── revenue "Revenue" width:200 aggFunc:sum
            ├── cost "Cost" width:200 aggFunc:sum
            ├── profit width:200 ƒ
            └── doubleProfit width:200 ƒ
        `);
        // Group rows have no data of their own, so calc cols stay blank; leaf rows evaluate from their data.
        await new GridRows(api, `calculated columns blank on row group rows`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-region-EMEA ag-Grid-AutoColumn:"EMEA" revenue:30 cost:11
            │ ├── LEAF id:r1 region:"EMEA" revenue:10 cost:3 profit:7 doubleProfit:14
            │ └── LEAF id:r2 region:"EMEA" revenue:20 cost:8 profit:12 doubleProfit:24
            └─┬ LEAF_GROUP id:row-group-region-APAC ag-Grid-AutoColumn:"APAC" revenue:15 cost:5
            · └── LEAF id:r3 region:"APAC" revenue:15 cost:5 profit:10 doubleProfit:20
        `);
        await asyncSetTimeout(1);

        const emeaGroup = api.getRowNode('row-group-region-EMEA')!;
        expect(emeaGroup.group).toBe(true);
        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'profit', useFormatter: false })).toBeUndefined();
        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'doubleProfit', useFormatter: false })).toBeUndefined();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit', useFormatter: false })).toBe(7);
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'doubleProfit', useFormatter: false })).toBe(
            14
        );

        // A transaction updates the leaf's own calculated values; the group stays blank.
        applyTransactionChecked(api, { update: [{ id: 'r1', region: 'EMEA', revenue: 100, cost: 3 }] });
        await asyncSetTimeout(1);

        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit', useFormatter: false })).toBe(97);
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'doubleProfit', useFormatter: false })).toBe(
            194
        );
        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'profit', useFormatter: false })).toBeUndefined();
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

    test('calculated columns with an aggFunc aggregate their per-leaf results (aggregate-after)', async () => {
        const api = createGrid('calculated-row-groups-aggfunc', {
            rowData: [
                { id: 'r1', region: 'EMEA', revenue: 10, cost: 3 },
                { id: 'r2', region: 'EMEA', revenue: 20, cost: 8 },
                { id: 'r3', region: 'APAC', revenue: 15, cost: 5 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                // No aggFunc: the group stays blank (it has no data of its own); leaves still evaluate.
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
                // With aggFunc: the per-leaf profit is aggregated on the group (aggregate-after).
                {
                    colId: 'maxProfit',
                    calculatedExpression: '[revenue] - [cost]',
                    aggFunc: 'max',
                    cellDataType: 'number',
                },
            ],
            groupDefaultExpanded: -1,
        });
        await new GridColumns(api, `calculated columns with an aggFunc setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── revenue "Revenue" width:200 aggFunc:sum
            ├── cost "Cost" width:200 aggFunc:sum
            ├── profit width:200 ƒ
            └── maxProfit width:200 aggFunc:max ƒ
        `);
        await new GridRows(api, `calculated columns with an aggFunc`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-region-EMEA ag-Grid-AutoColumn:"EMEA" revenue:30 cost:11 maxProfit:12
            │ ├── LEAF id:r1 region:"EMEA" revenue:10 cost:3 profit:7 maxProfit:7
            │ └── LEAF id:r2 region:"EMEA" revenue:20 cost:8 profit:12 maxProfit:12
            └─┬ LEAF_GROUP id:row-group-region-APAC ag-Grid-AutoColumn:"APAC" revenue:15 cost:5 maxProfit:10
            · └── LEAF id:r3 region:"APAC" revenue:15 cost:5 profit:10 maxProfit:10
        `);

        const emeaGroup = api.getRowNode('row-group-region-EMEA')!;
        // No aggFunc: the group has no data of its own, so profit stays blank.
        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'profit', useFormatter: false })).toBeUndefined();
        // aggregate-after: max of the leaf profits = max(7, 12) = 12.
        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'maxProfit', useFormatter: false })).toBe(12);
        // Leaves evaluate the formula regardless of aggFunc.
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'maxProfit', useFormatter: false })).toBe(7);
        expect(api.getCellValue({ rowNode: api.getRowNode('r2')!, colKey: 'maxProfit', useFormatter: false })).toBe(12);
    });

    test('aggregate-after calculated columns aggregate across nested groups, footers and after transactions', async () => {
        const api = createGrid('calculated-aggfunc-nested', {
            rowData: [
                { id: 'r1', region: 'EMEA', country: 'UK', revenue: 10, cost: 3 },
                { id: 'r2', region: 'EMEA', country: 'UK', revenue: 20, cost: 8 },
                { id: 'r3', region: 'EMEA', country: 'DE', revenue: 15, cost: 5 },
                { id: 'r4', region: 'APAC', country: 'JP', revenue: 30, cost: 12 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                {
                    colId: 'maxProfit',
                    calculatedExpression: '[revenue] - [cost]',
                    aggFunc: 'max',
                    cellDataType: 'number',
                },
            ],
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            grandTotalRow: 'bottom',
        });
        await asyncSetTimeout(1);

        // Leaf profits r1=7, r2=12, r3=10, r4=18. `max` bubbles up the group-total rows at every level
        // (agg-after); the totals are not the agg-first `sum(rev)-sum(cost)` (which would be 29/47).
        await new GridRows(api, `nested aggfunc group totals`, gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID revenue:75 cost:28 maxProfit:18
            ├─┬ filler id:row-group-region-EMEA ag-Grid-AutoColumn:"EMEA"
            │ ├─┬ LEAF_GROUP id:row-group-region-EMEA-country-UK ag-Grid-AutoColumn:"UK"
            │ │ ├── LEAF id:r1 region:"EMEA" country:"UK" revenue:10 cost:3 maxProfit:7
            │ │ ├── LEAF id:r2 region:"EMEA" country:"UK" revenue:20 cost:8 maxProfit:12
            │ │ └─ footer id:rowGroupFooter_row-group-region-EMEA-country-UK ag-Grid-AutoColumn:"UK" revenue:30 cost:11 maxProfit:12
            │ ├─┬ LEAF_GROUP id:row-group-region-EMEA-country-DE ag-Grid-AutoColumn:"DE"
            │ │ ├── LEAF id:r3 region:"EMEA" country:"DE" revenue:15 cost:5 maxProfit:10
            │ │ └─ footer id:rowGroupFooter_row-group-region-EMEA-country-DE ag-Grid-AutoColumn:"DE" revenue:15 cost:5 maxProfit:10
            │ └─ footer id:rowGroupFooter_row-group-region-EMEA ag-Grid-AutoColumn:"EMEA" revenue:45 cost:16 maxProfit:12
            ├─┬ filler id:row-group-region-APAC ag-Grid-AutoColumn:"APAC"
            │ ├─┬ LEAF_GROUP id:row-group-region-APAC-country-JP ag-Grid-AutoColumn:"JP"
            │ │ ├── LEAF id:r4 region:"APAC" country:"JP" revenue:30 cost:12 maxProfit:18
            │ │ └─ footer id:rowGroupFooter_row-group-region-APAC-country-JP ag-Grid-AutoColumn:"JP" revenue:30 cost:12 maxProfit:18
            │ └─ footer id:rowGroupFooter_row-group-region-APAC ag-Grid-AutoColumn:"APAC" revenue:30 cost:12 maxProfit:18
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:null revenue:75 cost:28 maxProfit:18
        `);

        // A transaction that re-aggregates must refresh the agg-after totals at every level:
        // UK profit max becomes 97, which bubbles up to the EMEA and grand totals.
        applyTransactionChecked(api, { update: [{ id: 'r1', region: 'EMEA', country: 'UK', revenue: 100, cost: 3 }] });
        await asyncSetTimeout(1);

        const ukFooter = api.getRowNode('rowGroupFooter_row-group-region-EMEA-country-UK')!;
        const emeaFooter = api.getRowNode('rowGroupFooter_row-group-region-EMEA')!;
        const grandTotal = api.getRowNode('rowGroupFooter_ROOT_NODE_ID')!;
        expect(api.getCellValue({ rowNode: ukFooter, colKey: 'maxProfit', useFormatter: false })).toBe(97);
        expect(api.getCellValue({ rowNode: emeaFooter, colKey: 'maxProfit', useFormatter: false })).toBe(97);
        expect(api.getCellValue({ rowNode: grandTotal, colKey: 'maxProfit', useFormatter: false })).toBe(97);
    });

    test('aggregate-after calculated columns ride the standard pipeline (avg parity with a plain value column)', async () => {
        const api = createGrid('calculated-aggfunc-avg-parity', {
            rowData: [
                { id: 'r1', region: 'EMEA', revenue: 10, cost: 3, profitData: 7 },
                { id: 'r2', region: 'EMEA', revenue: 20, cost: 8, profitData: 12 },
            ],
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'revenue' },
                { field: 'cost' },
                // Plain value column holding the same per-row profit, aggregated with avg.
                { field: 'profitData', aggFunc: 'avg' },
                // Calculated column computing the same profit, aggregated with avg.
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', aggFunc: 'avg', cellDataType: 'number' },
            ],
            groupDefaultExpanded: -1,
        });
        await asyncSetTimeout(1);

        const emeaGroup = api.getRowNode('row-group-region-EMEA')!;
        const calc = api.getCellValue({ rowNode: emeaGroup, colKey: 'profit', useFormatter: false });
        const plain = api.getCellValue({ rowNode: emeaGroup, colKey: 'profitData', useFormatter: false });
        // The calculated column's avg aggregation is identical to a plain value column's, wrapper and all.
        expect(calc).toEqual(plain);
        // The displayed value is the average of the leaf profits: (7 + 12) / 2 = 9.5.
        expect(`${calc}`).toBe('9.5');
    });

    test('a calculated column with an aggFunc matches a valueGetter value column on group rows', async () => {
        const api = createGrid('calculated-aggfunc-valuegetter-parity', {
            rowData: [
                { id: 'r1', country: 'US', gold: 1, silver: 2 },
                { id: 'r2', country: 'US', gold: 3, silver: 4 },
                { id: 'r3', country: 'UK', gold: 5, silver: 6 },
            ],
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
                {
                    colId: 'calc',
                    aggFunc: 'sum',
                    calculatedExpression: '[gold] + [silver]',
                    cellDataType: 'number',
                },
                {
                    colId: 'vg',
                    aggFunc: 'sum',
                    valueGetter: (p) => (p.data ? p.data.gold + p.data.silver : undefined),
                    cellDataType: 'number',
                },
            ],
            groupDefaultExpanded: -1,
        });
        await asyncSetTimeout(1);

        // The calculated column aggregates its per-leaf (gold+silver) exactly like the valueGetter column.
        await new GridRows(api, 'calc aggFunc matches valueGetter', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-US ag-Grid-AutoColumn:"US" gold:4 silver:6 calc:10 vg:10
            │ ├── LEAF id:r1 country:"US" gold:1 silver:2 calc:3 vg:3
            │ └── LEAF id:r2 country:"US" gold:3 silver:4 calc:7 vg:7
            └─┬ LEAF_GROUP id:row-group-country-UK ag-Grid-AutoColumn:"UK" gold:5 silver:6 calc:11 vg:11
            · └── LEAF id:r3 country:"UK" gold:5 silver:6 calc:11 vg:11
        `);
    });

    test('calculated columns evaluate on tree data group rows that carry their own data', async () => {
        const api = createGrid('calculated-tree-data-parent', {
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

        // No aggFunc: the parent group carries its own data, so it evaluates the formula from that data
        // (100 - 40 = 60), exactly as the revenue/cost cells show the parent's own values.
        await new GridRows(api, `tree data group with own data`, gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ parent GROUP id:parent ag-Grid-AutoColumn:"parent" name:"Parent" revenue:100 cost:40 profit:60
            · └── child LEAF id:child ag-Grid-AutoColumn:"child" name:"Child" revenue:30 cost:10 profit:20
        `);
    });

    test('calculated columns stay blank on tree data filler groups that carry no data', async () => {
        const api = createGrid('calculated-tree-data-filler', {
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

        // Filler groups (Dept, Team) carry no data and have no aggData, so they stay blank; the leaf evaluates.
        await new GridRows(api, `tree data filler groups`, gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ Dept filler id:row-group-0-Dept ag-Grid-AutoColumn:"Dept"
            · └─┬ Team filler id:row-group-0-Dept-1-Team ag-Grid-AutoColumn:"Team"
            · · └── Leaf LEAF id:leaf ag-Grid-AutoColumn:"Leaf" revenue:30 cost:10 profit:20
        `);
    });

    test('aggregate-after calculated columns aggregate over tree data descendants', async () => {
        const api = createGrid('calculated-tree-data-aggfunc', {
            treeData: true,
            treeDataChildrenField: 'children',
            rowData: [
                {
                    id: 'parent',
                    name: 'Parent',
                    revenue: 100,
                    cost: 40,
                    children: [
                        { id: 'a', name: 'A', revenue: 30, cost: 10 },
                        { id: 'b', name: 'B', revenue: 50, cost: 15 },
                    ],
                },
            ],
            columnDefs: [
                { field: 'name' },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                {
                    colId: 'maxProfit',
                    calculatedExpression: '[revenue] - [cost]',
                    aggFunc: 'max',
                    cellDataType: 'number',
                },
            ],
            groupDefaultExpanded: -1,
        });
        await asyncSetTimeout(1);

        // With an aggFunc the parent aggregates its descendants (a, b), not its own data: revenue/cost
        // are the children's sums and maxProfit is max(20, 35) = 35 — identical to the plain value columns.
        await new GridRows(api, `tree data aggregate-after`, gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ parent GROUP id:parent ag-Grid-AutoColumn:"parent" name:"Parent" revenue:80 cost:25 maxProfit:35
            · ├── a LEAF id:a ag-Grid-AutoColumn:"a" name:"A" revenue:30 cost:10 maxProfit:20
            · └── b LEAF id:b ag-Grid-AutoColumn:"b" name:"B" revenue:50 cost:15 maxProfit:35
        `);
    });

    test('a calculated column without an aggFunc has no pivot result column and is absent from the pivot display', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const api = createGrid('calculated-pivot-no-aggfunc', {
                pivotMode: true,
                rowData: [
                    { id: 'r1', country: 'US', year: 2020, revenue: 10, cost: 3 },
                    { id: 'r2', country: 'US', year: 2021, revenue: 20, cost: 8 },
                ],
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true },
                    { field: 'revenue', aggFunc: 'sum' },
                    { field: 'cost', aggFunc: 'sum' },
                    { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
                ],
                groupDefaultExpanded: -1,
            });
            await asyncSetTimeout(10);

            // Without an aggFunc the calc column is a non-value primary column, so pivot produces no result
            // column for it — it is absent from the cross-tab, like any other non-value primary column.
            await new GridRows(api, `calc column without aggFunc under pivot`, gridRowsOpts).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_revenue:10 pivot_year_2020_cost:3 pivot_year_2021_revenue:20 pivot_year_2021_cost:8
                └─┬ LEAF_GROUP collapsed id:row-group-country-US ag-Grid-AutoColumn:"US" pivot_year_2020_revenue:10 pivot_year_2020_cost:3 pivot_year_2021_revenue:20 pivot_year_2021_cost:8
                · ├── LEAF hidden id:r1 pivot_year_2020_revenue:10 pivot_year_2020_cost:3 pivot_year_2021_revenue:10 pivot_year_2021_cost:3
                · └── LEAF hidden id:r2 pivot_year_2020_revenue:20 pivot_year_2020_cost:8 pivot_year_2021_revenue:20 pivot_year_2021_cost:8
            `);
            // It is a value-less calc column under pivot, not the blocked-formula case, so no warning fires.
            expect(warnSpy).not.toHaveBeenCalledWith(
                expect.stringContaining('warning #295'),
                expect.stringContaining('Column Pivoting'),
                expect.anything()
            );
        } finally {
            warnSpy.mockRestore();
        }
    });

    test('a calculated column with an aggFunc aggregates under pivot like a valueGetter value column', async () => {
        const api = createGrid('calculated-pivot-aggfunc', {
            pivotMode: true,
            rowData: [
                { id: 'r1', country: 'US', year: 2020, gold: 1, silver: 2 },
                { id: 'r2', country: 'US', year: 2021, gold: 3, silver: 4 },
            ],
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
                { colId: 'calc', aggFunc: 'sum', calculatedExpression: '[gold] + [silver]', cellDataType: 'number' },
                {
                    colId: 'vg',
                    aggFunc: 'sum',
                    valueGetter: (p) => (p.data ? p.data.gold + p.data.silver : undefined),
                    cellDataType: 'number',
                },
            ],
            groupDefaultExpanded: -1,
        });
        await asyncSetTimeout(10);

        // Each pivot result column for the calculated column aggregates its per-leaf (gold+silver),
        // matching the valueGetter column under every year: calc == vg everywhere.
        await new GridRows(api, `calc aggFunc under pivot`, gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_gold:1 pivot_year_2020_silver:2 pivot_year_2020_calc:3 pivot_year_2020_vg:3 pivot_year_2021_gold:3 pivot_year_2021_silver:4 pivot_year_2021_calc:7 pivot_year_2021_vg:7
            └─┬ LEAF_GROUP collapsed id:row-group-country-US ag-Grid-AutoColumn:"US" pivot_year_2020_gold:1 pivot_year_2020_silver:2 pivot_year_2020_calc:3 pivot_year_2020_vg:3 pivot_year_2021_gold:3 pivot_year_2021_silver:4 pivot_year_2021_calc:7 pivot_year_2021_vg:7
            · ├── LEAF hidden id:r1 pivot_year_2020_gold:1 pivot_year_2020_silver:2 pivot_year_2020_calc:3 pivot_year_2020_vg:3 pivot_year_2021_gold:1 pivot_year_2021_silver:2 pivot_year_2021_calc:3 pivot_year_2021_vg:3
            · └── LEAF hidden id:r2 pivot_year_2020_gold:3 pivot_year_2020_silver:4 pivot_year_2020_calc:7 pivot_year_2020_vg:7 pivot_year_2021_gold:3 pivot_year_2021_silver:4 pivot_year_2021_calc:7 pivot_year_2021_vg:7
        `);
    });

    test('calculated columns stay blank on group and grand total footer rows', async () => {
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

        // Footers and the grand total have no data of their own, so a no-aggFunc calc col stays blank.
        expect(emeaFooter).toBeTruthy();
        expect(api.getCellValue({ rowNode: emeaFooter, colKey: 'profit', useFormatter: false })).toBeUndefined();
        expect(apacFooter).toBeTruthy();
        expect(api.getCellValue({ rowNode: apacFooter, colKey: 'profit', useFormatter: false })).toBeUndefined();
        expect(grandTotal).toBeTruthy();
        expect(api.getCellValue({ rowNode: grandTotal, colKey: 'profit', useFormatter: false })).toBeUndefined();
    });

    test('aggregate-after calculated columns read aggData on group and grand-total footer rows', async () => {
        const api = createGrid('calculated-aggfunc-footers', {
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
                    colId: 'maxProfit',
                    calculatedExpression: '[revenue] - [cost]',
                    aggFunc: 'max',
                    cellDataType: 'number',
                },
            ],
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            grandTotalRow: 'bottom',
        });
        await asyncSetTimeout(1);

        // Footers/grand-total are group rows holding aggData, so agg-after reads the aggregated per-leaf
        // max on each (EMEA & grand = 12), not the agg-first sum(rev)-sum(cost).
        await new GridRows(api, 'aggfunc footers', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID revenue:45 cost:16 maxProfit:12
            ├─┬ LEAF_GROUP id:row-group-region-EMEA ag-Grid-AutoColumn:"EMEA"
            │ ├── LEAF id:r1 region:"EMEA" revenue:10 cost:3 maxProfit:7
            │ ├── LEAF id:r2 region:"EMEA" revenue:20 cost:8 maxProfit:12
            │ └─ footer id:rowGroupFooter_row-group-region-EMEA ag-Grid-AutoColumn:"EMEA" revenue:30 cost:11 maxProfit:12
            ├─┬ LEAF_GROUP id:row-group-region-APAC ag-Grid-AutoColumn:"APAC"
            │ ├── LEAF id:r3 region:"APAC" revenue:15 cost:5 maxProfit:10
            │ └─ footer id:rowGroupFooter_row-group-region-APAC ag-Grid-AutoColumn:"APAC" revenue:15 cost:5 maxProfit:10
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:null revenue:45 cost:16 maxProfit:12
        `);
    });

    test('aggregate-after calculated columns read aggData on a flat grid grand-total row', async () => {
        const api = createGrid('calculated-aggfunc-flat-grandtotal', {
            rowData: [
                { id: 'r1', revenue: 10, cost: 3 },
                { id: 'r2', revenue: 20, cost: 8 },
                { id: 'r3', revenue: 15, cost: 5 },
            ],
            columnDefs: [
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                {
                    colId: 'maxProfit',
                    calculatedExpression: '[revenue] - [cost]',
                    aggFunc: 'max',
                    cellDataType: 'number',
                },
            ],
            grandTotalRow: 'bottom',
        });
        await asyncSetTimeout(1);

        // Even with no row grouping the grand-total row is a group row with aggData: agg-after reads
        // max(7,12,10)=12, not the agg-first sum(rev)-sum(cost)=45-16=29.
        await new GridRows(api, 'aggfunc flat grand total', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID revenue:45 cost:16 maxProfit:12
            ├── LEAF id:r1 revenue:10 cost:3 maxProfit:7
            ├── LEAF id:r2 revenue:20 cost:8 maxProfit:12
            ├── LEAF id:r3 revenue:15 cost:5 maxProfit:10
            └─ footer id:rowGroupFooter_ROOT_NODE_ID revenue:45 cost:16 maxProfit:12
        `);
    });

    test('grid api adds a calculated column while grouped and it evaluates on leaf rows', async () => {
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
        addCalculatedColumnDef(api, {
            colId: 'profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        });
        await created;
        await asyncSetTimeout(1);

        const emeaGroup = api.getRowNode('row-group-region-EMEA')!;
        // The group row has no data of its own, so it stays blank; the leaf rows evaluate from their data.
        expect(api.getCellValue({ rowNode: emeaGroup, colKey: 'profit', useFormatter: false })).toBeUndefined();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit', useFormatter: false })).toBe(7);
        expect(api.getCellValue({ rowNode: api.getRowNode('r3')!, colKey: 'profit', useFormatter: false })).toBe(10);
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

    test('live apply typing does not refetch server-side rows', async () => {
        const rowData = [
            { id: 'r1', revenue: 10, cost: 3 },
            { id: 'r2', revenue: 20, cost: 8 },
        ];
        let getRowsCalls = 0;
        const api = createGrid('calculated-live-apply-ssrm', {
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params: any) => {
                    getRowsCalls++;
                    params.success({
                        rowData: rowData.slice(params.request.startRow, params.request.endRow),
                        rowCount: rowData.length,
                    });
                },
            },
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
        });
        await waitForFirstRow(api);
        const callsAfterLoad = getRowsCalls;
        expect(callsAfterLoad).toBeGreaterThan(0);

        await openEditDialogViaMenu(api, 'profit');

        // Each keystroke flushes on an animation frame; wait past each flush.
        setExpression('[revenue] - [cost] + 1');
        await asyncSetTimeout(40);
        setExpression('[revenue] * [cost]');
        await asyncSetTimeout(40);
        setExpression('[revenue] + [cost]');
        await asyncSetTimeout(40);

        const firstRow = api.getDisplayedRowAtIndex(0)!;
        expect(api.getCellValue({ rowNode: firstRow, colKey: 'profit', useFormatter: false })).toBe(13);
        expect(getRowsCalls).toBe(callsAfterLoad);
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
                └── profit width:200 ƒ
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
            calculatedColumns: { applyMode: 'deferred' },
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

    test('clearing the expression shows an empty-expression message, not the formula error', async () => {
        const api = createGrid('calculated-empty-expression', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        showColumnMenu(api, 'revenue');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        // Type a reference, then clear it back to empty (the reported scenario).
        setExpression('[gold]');
        setExpression('');

        const input = getExpressionInput();
        expect(input.validationMessage).toBe('Enter an expression');
        expect(input.validationMessage).not.toContain('begin with');
        expect(input).toHaveClass('invalid');
        expect(getDialogButton('Apply')).toBeDisabled();

        // Applying an empty expression must not create a column.
        clickDialogButton('Apply');
        await asyncSetTimeout(1);
        expect(api.getColumn('calculated_1')).toBeNull();
    });

    test('deferred dialog requires a title before apply', async () => {
        const api = createGrid('calculated-deferred-title-required', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] - [cost]' },
            ],
        });
        await asyncSetTimeout(1);

        await openEditDialogViaMenu(api, 'profit');

        const titleInput = getCalculatedColumnDialog().querySelector('input')!;
        titleInput.value = '';
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));

        expect(titleInput).toHaveClass('invalid');
        expect(titleInput.validationMessage).toBe('Enter a title');
        expect(getDialogButton('Apply')).toBeDisabled();

        // The column keeps its title while the dialog is invalid.
        expect(api.getColumn('profit')!.getColDef().headerName).toBe('Profit');

        titleInput.value = 'Net Profit';
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        expect(titleInput).not.toHaveClass('invalid');
        expect(getDialogButton('Apply')).not.toBeDisabled();

        clickDialogButton('Apply');
        await asyncSetTimeout(1);
        expect(api.getColumn('profit')!.getColDef().headerName).toBe('Net Profit');
    });

    test('dialog column picker renders group path and leaf as fixed-height clickable rows', async () => {
        const api = createGrid('calculated-dialog-column-picker-group-path', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                {
                    groupId: 'money',
                    headerName: 'Money',
                    children: [
                        { field: 'revenue', headerName: 'Revenue' },
                        { field: 'cost', headerName: 'Cost' },
                    ],
                } as ColGroupDef,
            ],
        });

        showColumnMenu(api, 'revenue');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);
        clickDialogButton('Columns');
        await asyncSetTimeout(1);

        const revenueSuggestion = Array.from(
            document.querySelectorAll<HTMLElement>('.ag-calculated-column-suggestion')
        ).find((element) => element.getAttribute('aria-label') === 'Money › Revenue');

        expect(revenueSuggestion).toBeTruthy();
        expect(revenueSuggestion!.querySelector('.ag-calculated-column-suggestion-path')).toBeTruthy();
        expect(revenueSuggestion!.querySelector('.ag-calculated-column-suggestion-parent')?.textContent).toBe('Money');
        expect(revenueSuggestion!.querySelector('.ag-calculated-column-suggestion-separator')?.textContent).toBe('›');
        expect(revenueSuggestion!.querySelector('.ag-calculated-column-suggestion-leaf')?.textContent).toBe('Revenue');
        // Revenue is the first column entry, so it is selected by default; Enter inserts it.
        getExpressionInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(getExpressionInput().value).toBe('[Revenue]');
    });

    test('dialog sizes inline autocomplete to the expression editor width', async () => {
        const api = createGrid('calculated-dialog-inline-picker-width', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        showColumnMenu(api, 'revenue');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        const input = getExpressionInput();
        Object.defineProperty(input, 'offsetWidth', { configurable: true, get: () => 320 });
        input.value = '[Rev';
        input.setSelectionRange(input.value.length, input.value.length);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await asyncSetTimeout(1);

        const popup = document.querySelector<HTMLElement>('.ag-autocomplete-list-popup')!;
        expect(popup.style.width).toBe('320px');
        expect(popup.style.maxWidth).toBe('');
        expect(popup).not.toHaveClass('ag-calculated-column-picker-list');
    });

    test('dialog expression suggestions control the virtual list aria state', async () => {
        const api = createGrid('calculated-dialog-inline-aria', {
            rowData: [{ id: 'r1', revenue: 10, revenueTax: 2, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'revenueTax' }, { field: 'cost' }],
        });

        showColumnMenu(api, 'revenue');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        const input = getExpressionInput();
        expect(input).toHaveAttribute('aria-autocomplete', 'list');
        expect(input).toHaveAttribute('aria-haspopup', 'listbox');
        expect(input).toHaveAttribute('aria-expanded', 'false');

        input.value = '[Revenue';
        input.setSelectionRange(input.value.length, input.value.length);
        input.dispatchEvent(new Event('input', { bubbles: true }));

        const controlledList = await waitFor(() => {
            const controls = input.getAttribute('aria-controls');
            expect(controls).toBeTruthy();
            const list = document.getElementById(controls!);
            expect(list).toBeTruthy();
            return list!;
        });
        const popup = document.querySelector<HTMLElement>('.ag-autocomplete-list-popup')!;

        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(controlledList).toHaveAttribute('role', 'listbox');
        expect(controlledList).not.toBe(popup);

        const firstActiveId = await waitFor(() => {
            const activeId = input.getAttribute('aria-activedescendant');
            expect(activeId).toBeTruthy();
            const activeOption = document.getElementById(activeId!);
            expect(activeOption).toBeTruthy();
            expect(activeOption).toHaveAttribute('role', 'option');
            expect(activeOption).toHaveAttribute('aria-selected', 'true');
            expect(activeOption).toHaveAttribute('aria-posinset', '1');
            expect(activeOption).toHaveAttribute('aria-setsize', '2');
            expect(controlledList).toHaveAttribute('aria-activedescendant', activeId);
            return activeId!;
        });

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

        await waitFor(() => {
            const activeId = input.getAttribute('aria-activedescendant');
            expect(activeId).toBeTruthy();
            expect(activeId).not.toBe(firstActiveId);
            expect(document.getElementById(activeId!)!).toHaveAttribute('aria-posinset', '2');
            expect(controlledList).toHaveAttribute('aria-activedescendant', activeId);
        });

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

        expect(input).toHaveAttribute('aria-expanded', 'false');
        expect(input).not.toHaveAttribute('aria-controls');
        expect(input).not.toHaveAttribute('aria-activedescendant');
    });

    test('dialog sizes helper pickers from the calculated column suggestion width variable', async () => {
        const api = createGrid('calculated-dialog-helper-picker-width', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        showColumnMenu(api, 'revenue');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        const dialog = getCalculatedColumnDialog();
        Object.defineProperty(dialog, 'offsetWidth', { configurable: true, get: () => 140 });
        clickDialogButton('Columns');
        await asyncSetTimeout(1);

        // The picker class carries the `--ag-calculated-column-suggestion-list-width` width rule.
        const popup = document.querySelector<HTMLElement>('.ag-autocomplete-list-popup')!;
        expect(popup).toHaveClass('ag-calculated-column-picker-list');
        expect(popup.style.width).toBe('');
        expect(popup.style.maxWidth).toBe('140px');

        // Typing reuses the same list (same suggestion type); it must switch back to inline sizing.
        const input = getExpressionInput();
        Object.defineProperty(input, 'offsetWidth', { configurable: true, get: () => 320 });
        input.value = '[Rev';
        input.setSelectionRange(input.value.length, input.value.length);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await asyncSetTimeout(1);

        expect(popup).not.toHaveClass('ag-calculated-column-picker-list');
        expect(popup.style.width).toBe('320px');
        expect(popup.style.maxWidth).toBe('');
    });

    test('dialog accepts column references in any case', async () => {
        const api = createGrid('calculated-dialog-case-insensitive-references', {
            calculatedColumns: { applyMode: 'deferred' },
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
            calculatedColumns: { applyMode: 'deferred' },
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
        await selectOperatorSuggestion('*');
        expect(input.value).toBe('[Age] * [Medals]');

        setExpression('[Age] + [Medals]');
        input.setSelectionRange('[Age] + '.length, '[Age] + '.length);
        clickDialogButton('Operators');
        await selectOperatorSuggestion('/');
        expect(input.value).toBe('[Age] / [Medals]');

        setExpression('[Age] >= [Medals]');
        input.setSelectionRange('[Age] >='.length, '[Age] >='.length);
        clickDialogButton('Operators');
        await selectOperatorSuggestion('<');
        expect(input.value).toBe('[Age] < [Medals]');

        setExpression('[Age] + [Medals]');
        input.setSelectionRange('[Age] '.length, '[Age] +'.length);
        clickDialogButton('Operators');
        await selectOperatorSuggestion('-');
        expect(input.value).toBe('[Age] - [Medals]');
    });

    test('dialog picker keeps button focus until suggestion is accepted', async () => {
        const api = createGrid('calculated-dialog-picker-focus', {
            calculatedColumns: { applyMode: 'deferred' },
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

        const operators = getDialogButton('Operators');
        operators.focus();
        operators.click();
        await asyncSetTimeout(1);

        expect(document.activeElement).toBe(operators);
        operators.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        operators.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        operators.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await asyncSetTimeout(1);

        expect(input.value).toBe('[Age] * [Medals]');
        expect(document.activeElement).toBe(input);
        expect(input.selectionStart).toBe('[Age] * '.length);
    });

    test('dialog keeps expression and type pickers mutually exclusive', async () => {
        const api = createGrid('calculated-dialog-single-picker', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', age: 23, medals: 8 }],
            columnDefs: [{ field: 'age' }, { field: 'medals' }],
        });

        showColumnMenu(api, 'age');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        clickDialogButton('Operators');
        await asyncSetTimeout(1);

        expect(document.querySelector('.ag-autocomplete-list-popup')).toBeTruthy();
        expect(document.querySelector('.ag-select-list')).toBeFalsy();

        getCalculatedColumnDialog()
            .querySelector<HTMLElement>('.ag-select .ag-picker-field-wrapper')!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await asyncSetTimeout(1);

        expect(document.querySelector('.ag-autocomplete-list-popup')).toBeFalsy();
        expect(document.querySelector('.ag-select-list')).toBeTruthy();

        clickDialogButton('Operators');
        await asyncSetTimeout(1);

        expect(document.querySelector('.ag-autocomplete-list-popup')).toBeTruthy();
        expect(document.querySelector('.ag-select-list')).toBeFalsy();
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
            calculatedColumns: { applyMode: 'deferred' },
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
        await new GridColumns(
            api,
            'dialog adds calculated columns inside groups without mutating provided column definitions'
        ).checkColumns(`
            CENTER
            ├─┬ "2025" GROUP
            │ ├── revenue_2025 "Revenue" width:200
            │ ├── calculated_1 "Untitled" width:200 ƒ
            │ └── cost_2025 "Cost" width:200
            └─┬ "2026" GROUP
              ├── revenue_2026 "Revenue" width:200
              └── cost_2026 "Cost" width:200
        `);
    });

    test('dialog inserts calculated columns after generated auto group columns in visible order', async () => {
        const api = createGrid('calculated-dialog-auto-group-order', {
            calculatedColumns: { applyMode: 'deferred' },
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
        await new GridColumns(
            api,
            'dialog inserts calculated columns after generated auto group columns in visible order'
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
    });

    test('calc col anchored to the auto-group col returns behind it after a grouping toggle', async () => {
        const api = createGrid('calculated-autogroup-toggle', {
            rowData: [{ id: 'r1', productType: 'A', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'productType', rowGroup: true, hide: true }, { field: 'revenue' }, { field: 'cost' }],
        });
        await new GridColumns(api, 'auto-group toggle - initial').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);

        showColumnMenu(api, 'ag-Grid-AutoColumn');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);
        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        // Wait past the live-apply animation frame so no flush is in flight during the toggles below.
        await asyncSetTimeout(40);
        await new GridColumns(api, 'auto-group toggle - after add').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);

        api.setRowGroupColumns([]);
        await asyncSetTimeout(1);
        await new GridColumns(api, 'auto-group toggle - ungrouped').checkColumns(`
            CENTER
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── productType "Product Type" width:200
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);

        api.setRowGroupColumns(['productType']);
        await asyncSetTimeout(1);
        await new GridColumns(api, 'auto-group toggle - re-grouped').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
    });

    test('calc col anchored to the first of two auto-group cols after a grouping toggle', async () => {
        const api = createGrid('calculated-autogroup-toggle-multi', {
            calculatedColumns: { applyMode: 'deferred' },
            groupDisplayType: 'multipleColumns',
            rowData: [{ id: 'r1', productType: 'A', country: 'UK', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'productType', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'revenue' },
                { field: 'cost' },
            ],
        });
        await new GridColumns(api, 'two auto-group toggle - initial').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-productType "Product Type" width:200
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);

        showColumnMenu(api, 'ag-Grid-AutoColumn-productType');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);
        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);
        await new GridColumns(api, 'two auto-group toggle - after add').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-productType "Product Type" width:200
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);

        api.setRowGroupColumns([]);
        await asyncSetTimeout(1);
        await new GridColumns(api, 'two auto-group toggle - ungrouped').checkColumns(`
            CENTER
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── productType "Product Type" width:200
            ├── country "Country" width:200
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);

        api.setRowGroupColumns(['productType', 'country']);
        await asyncSetTimeout(1);
        await new GridColumns(api, 'two auto-group toggle - re-grouped').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-productType "Product Type" width:200
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
    });

    test('dialog inserts calculated columns after the clicked generated auto group column in multiple-columns mode', async () => {
        const api = createGrid('calculated-dialog-multiple-auto-group-order', {
            calculatedColumns: { applyMode: 'deferred' },
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
        await new GridColumns(
            api,
            'dialog inserts calculated columns after the clicked generated auto group column in multiple-columns mode'
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-productType "Product Type" width:200
            ├── calculated_1 "Untitled" width:200 ƒ
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
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
        // Wait past the live-apply animation frame so no flush is in flight during the moves below.
        await asyncSetTimeout(40);

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
        await new GridColumns(
            api,
            'dialog-anchored calculated column can be moved away from its anchor and stays moved across refreshes'
        ).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            ├── other "Other" width:200
            └── calculated_1 "Untitled" width:200 ƒ
        `);
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
        // Wait past the live-apply animation frame so each add's flush lands before the next step.
        await asyncSetTimeout(40);

        showColumnMenu(api, 'ag-Grid-AutoColumn-country');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);
        setExpression('[Revenue] + [Cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(40);

        // Adding the second column must not displace the first from its own anchor.
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'ag-Grid-AutoColumn-productType',
            'calculated_1',
            'ag-Grid-AutoColumn-country',
            'calculated_2',
            'revenue',
            'cost',
        ]);
        await new GridColumns(api, 'dialog columns from different auto group columns each stay under their own anchor')
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-productType "Product Type" width:200
                ├── calculated_1 "Untitled" width:200 ƒ
                ├── ag-Grid-AutoColumn-country "Country" width:200
                ├── calculated_2 "Untitled" width:200 ƒ
                ├── revenue "Revenue" width:200
                └── cost "Cost" width:200
            `);
    });

    test('dispatches calculated column columnDefs lifecycle events', async () => {
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
        await new GridColumns(api, `dispatches calculated column columnDefs lifecycle events setup`).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
        `);
        await new GridRows(api, `dispatches calculated column columnDefs lifecycle events setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3
        `);

        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(1);
        expect(created).toHaveBeenCalledWith(
            expect.objectContaining({
                column: api.getColumn('profit'),
                expression: '[revenue] - [cost]',
                source: 'api',
            })
        );

        updateCalculatedColumnDef(api, 'profit', { headerName: 'Profit' });
        await asyncSetTimeout(1);
        expect(changed).not.toHaveBeenCalled();

        updateCalculatedColumnDef(api, 'profit', { calculatedExpression: '[revenue] * [cost]' });
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
        removeColumnDef(api, 'profit');
        await asyncSetTimeout(1);
        expect(removed).toHaveBeenCalledWith(
            expect.objectContaining({
                column: removedColumn,
                expression: '[revenue] * [cost]',
                source: 'api',
            })
        );
        await new GridRows(api, `dispatches calculated column columnDefs lifecycle events final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3
        `);
    });

    test('calculated column columnDefs mutations dispatch newColumnsLoaded', async () => {
        const newColumnsLoaded = vi.fn();
        const api = createGrid('calc-col-newColumnsLoaded', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            onNewColumnsLoaded: newColumnsLoaded,
        });
        // Initial grid setup dispatches it once; clear so we count subsequent triggers cleanly.
        await asyncSetTimeout(1);
        newColumnsLoaded.mockClear();

        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(1);
        expect(newColumnsLoaded).toHaveBeenCalledTimes(1);

        newColumnsLoaded.mockClear();
        updateCalculatedColumnDef(api, 'profit', { calculatedExpression: '[revenue] * [cost]' });
        await asyncSetTimeout(1);
        expect(newColumnsLoaded).toHaveBeenCalledTimes(1);

        newColumnsLoaded.mockClear();
        removeColumnDef(api, 'profit');
        await asyncSetTimeout(1);
        expect(newColumnsLoaded).toHaveBeenCalledTimes(1);
    });

    test('removeCalculatedColumn then re-adding the same colId yields a working live column', async () => {
        const api = createGrid('calc-col-readd-same-id', {
            rowData: [
                { id: 'r1', revenue: 10, cost: 3 },
                { id: 'r2', revenue: 20, cost: 8 },
            ],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(1);

        removeColumnDef(api, 'profit');
        await asyncSetTimeout(1);
        expect(api.getColumn('profit')).toBeNull();

        // Re-add the SAME colId. Must NOT resurrect the destroyed AgColumn from the first add.
        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(1);

        expect(api.getColumn('profit')).toBeTruthy();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit', useFormatter: false })).toBe(7);
        expect(api.getCellValue({ rowNode: api.getRowNode('r2')!, colKey: 'profit', useFormatter: false })).toBe(12);

        // It must behave as a live column: sorting through it must work.
        api.applyColumnState({ state: [{ colId: 'profit', sort: 'desc' }] });
        await asyncSetTimeout(1);
        expect(api.getDisplayedRowAtIndex(0)?.data.id).toBe('r2');
        expect(api.getDisplayedRowAtIndex(1)?.data.id).toBe('r1');
        await new GridColumns(api, 'removeCalculatedColumn then re-adding the same colId yields a working live column')
            .checkColumns(`
                CENTER
                ├── revenue "Revenue" width:200
                ├── cost "Cost" width:200
                └── profit width:200 sort:desc ƒ
            `);
    });

    test('calculated column columnDefs updates invalidate the formula service per-cell cache', async () => {
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

        updateCalculatedColumnDef(api, 'result', { calculatedExpression: '[revenue] * [cost]' });
        await asyncSetTimeout(1);
        expect(api.getCellValue({ rowNode, colKey: 'result', useFormatter: false })).toBe(30);

        updateCalculatedColumnDef(api, 'result', { calculatedExpression: '[revenue] + [cost]' });
        await asyncSetTimeout(1);
        expect(api.getCellValue({ rowNode, colKey: 'result', useFormatter: false })).toBe(13);
    });

    test('calculated column columnDefs updates apply column-state changes (width, pinned, hide) to the live column', async () => {
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

        updateCalculatedColumnDef(api, 'profit', { width: 250, pinned: 'left', hide: true });
        await asyncSetTimeout(1);

        const updatedProfit = api.getColumn('profit')!;
        expect(updatedProfit.getActualWidth()).toBe(250);
        expect(updatedProfit.getPinned()).toBe('left');
        expect(updatedProfit.isVisible()).toBe(false);

        addCalculatedColumnDef(api, { colId: 'margin', calculatedExpression: '[revenue] - [cost]', width: 120 });
        await asyncSetTimeout(1);

        const margin = api.getColumn('margin')!;
        expect(margin.getActualWidth()).toBe(120);

        updateCalculatedColumnDef(api, 'margin', { width: 260, pinned: 'right' });
        await asyncSetTimeout(1);

        const updatedMargin = api.getColumn('margin')!;
        expect(updatedMargin.getActualWidth()).toBe(260);
        expect(updatedMargin.getPinned()).toBe('right');
        await new GridColumns(
            api,
            'calculated column columnDefs updates apply column-state changes (width, pinned, hide) to the live column'
        ).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            └── cost "Cost" width:200
            RIGHT
            └── margin width:260 ƒ
        `);
    });

    test('dispatches lifecycle events for invalid calculated column columnDefs mutations', async () => {
        const created = vi.fn();
        const changed = vi.fn();
        const api = createGrid('calculated-invalid-coldef-events', {
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
            `dispatches lifecycle events for invalid calculated column columnDefs mutations setup`
        ).checkColumns(`
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200 ƒ
        `);
        await new GridRows(api, `dispatches lifecycle events for invalid calculated column columnDefs mutations setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 revenue:10 cost:3 profit:7
            `);

        addCalculatedColumnDef(api, { colId: 'bad', calculatedExpression: '[missing] + 1' });
        updateCalculatedColumnDef(api, 'profit', { calculatedExpression: '[missing] + 1' });
        await asyncSetTimeout(1);

        expect(api.getColumn('bad')).toBeTruthy();
        expect(created).toHaveBeenCalledWith(
            expect.objectContaining({
                column: api.getColumn('bad'),
                expression: '[missing] + 1',
                source: 'api',
            })
        );
        expect(changed).toHaveBeenCalledWith(
            expect.objectContaining({
                column: api.getColumn('profit'),
                oldExpression: '[revenue] - [cost]',
                expression: '[missing] + 1',
                source: 'api',
            })
        );
        await new GridRows(
            api,
            `dispatches lifecycle events for invalid calculated column columnDefs mutations final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:"#PARSE!" bad:"#PARSE!"
        `);
    });

    test('dispatches calculated column UI update and remove events', async () => {
        const changed = vi.fn();
        const removed = vi.fn();
        const api = createGrid('calculated-ui-events', {
            calculatedColumns: { applyMode: 'deferred' },
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
            └── profit "Profit" width:200 ƒ
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
            └── profit width:200 ƒ
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
            └── profit width:200 ƒ
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
        const addIndex = headerMenuEntries.indexOf('Add Calculated Column');
        let removeIndex = headerMenuEntries.indexOf('Remove Calculated Column');
        expect(headerMenuEntries[addIndex - 1]).toBe('separator');
        expect(headerMenuEntries).toEqual(
            expect.arrayContaining(['Add Calculated Column', 'Edit Calculated Column', 'Remove Calculated Column'])
        );
        expect(headerMenuEntries[removeIndex + 1]).toBe('separator');

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

        removeIndex = contextMenuEntries.indexOf('Remove Calculated Column');

        expect(contextMenuEntries[removeIndex - 1]).toBe('separator');
        expect(contextMenuEntries[removeIndex + 1]).toBe('separator');
        await new GridRows(api, `calculated column menu items are grouped by separators final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);
    });

    test('dialog type list contains the default data types only', async () => {
        const api = createGrid('calculated-dialog-types', {
            calculatedColumns: { applyMode: 'deferred' },
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

    test('dialog type list uses configured data types and ignores unregistered ones', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = createGrid('calculated-dialog-configured-types', {
            calculatedColumns: {
                // `customStatus` is registered below; `missingType` has no definition and must be ignored.
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
        expect(typeOptions).toEqual(['Number', 'Custom Status', 'Boolean']);
        expect(warn.mock.calls.flat().join(' ')).toContain('missingType');

        warn.mockRestore();
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
                    expressionPickers: expressionPickers as any,
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
            calculatedColumns: { applyMode: 'deferred' },
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

            expect(
                consoleWarnSpy.mock.calls.some((c) =>
                    c
                        .join(' ')
                        .includes(
                            'colDef.calculatedExpression columns are read-only and should not be combined with editable.'
                        )
                )
            ).toBe(true);
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

            expect(
                consoleWarnSpy.mock.calls.some((c) =>
                    c
                        .join(' ')
                        .includes(
                            'colDef.calculatedExpression is used as the value source and should not be combined with field, valueGetter or valueSetter.'
                        )
                )
            ).toBe(true);
        } finally {
            consoleWarnSpy.mockRestore();
        }
    });

    test('calculated columns add calculated column classes and edit highlighting by default', async () => {
        const api = createGrid('calculated-column-classes', {
            calculatedColumns: { applyMode: 'deferred' },
            defaultColDef: {
                filter: 'agNumberColumnFilter',
                floatingFilter: true,
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
        expect(gridDiv.querySelector('[col-id="profit"].ag-floating-filter')).toHaveClass('ag-calculated-column');
        expect(gridDiv.querySelector('[row-index="0"] [col-id="revenue"]')).not.toHaveClass('ag-calculated-column');
        expect(gridDiv.querySelector('[row-index="0"] [col-id="profit"]')).toHaveClass('ag-calculated-column');
        expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[col-id="profit"].ag-floating-filter')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[row-index="0"] [col-id="profit"]')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );

        showColumnMenu(api, 'profit');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Edit Calculated Column');
        await asyncSetTimeout(1);

        expect(document.activeElement?.closest('.ag-dialog')).toBeTruthy();
        expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[col-id="profit"].ag-floating-filter')).toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[row-index="0"] [col-id="profit"]')).toHaveClass(
            'ag-calculated-column-highlighted'
        );

        clickDialogButton('Cancel');
        await asyncSetTimeout(1);

        await waitFor(() => {
            expect(document.activeElement?.closest('[col-id="profit"].ag-header-cell')).toBeTruthy();
        });
        expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[col-id="profit"].ag-floating-filter')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[row-index="0"] [col-id="profit"]')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );
    });

    test('toggling suppressColumnHighlighting while the dialog is open updates the highlight live', async () => {
        const api = createGrid('calculated-column-highlight-toggle', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
            ],
        });
        await asyncSetTimeout(1);

        showColumnMenu(api, 'profit');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Edit Calculated Column');
        await asyncSetTimeout(1);

        const gridDiv = document.querySelector('#calculated-column-highlight-toggle')!;
        const header = () => gridDiv.querySelector('[col-id="profit"].ag-header-cell');
        const cell = () => gridDiv.querySelector('[row-index="0"] [col-id="profit"]');

        // Highlighting is on by default, so an open edit dialog highlights the edited column.
        expect(header()).toHaveClass('ag-calculated-column-highlighted');
        expect(cell()).toHaveClass('ag-calculated-column-highlighted');

        // Suppressing it removes the highlight without closing the dialog.
        api.setGridOption('calculatedColumns', { suppressColumnHighlighting: true });
        await asyncSetTimeout(1);
        expect(header()).not.toHaveClass('ag-calculated-column-highlighted');
        expect(cell()).not.toHaveClass('ag-calculated-column-highlighted');

        api.setGridOption('calculatedColumns', { suppressColumnHighlighting: false });
        await asyncSetTimeout(1);
        expect(header()).toHaveClass('ag-calculated-column-highlighted');
        expect(cell()).toHaveClass('ag-calculated-column-highlighted');
    });

    test('calculated column edit highlighting can be suppressed', async () => {
        const api = createGrid('calculated-column-highlight-disabled', {
            calculatedColumns: {
                suppressColumnHighlighting: true,
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

    test('adding a calculated column does not highlight the new column', async () => {
        const api = createGrid('calculated-column-add-no-highlight', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });
        await asyncSetTimeout(1);

        showColumnMenu(api, 'revenue');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        const gridDiv = document.querySelector('#calculated-column-add-no-highlight')!;
        expect(gridDiv.querySelector('[col-id="calculated_1"].ag-header-cell')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[row-index="0"] [col-id="calculated_1"]')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );
    });

    test('multiple open calculated column dialogs highlight each edited column', async () => {
        const api = createGrid('calculated-column-multi-highlight', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                {
                    colId: 'profit',
                    headerName: 'Profit',
                    calculatedExpression: '[revenue] - [cost]',
                },
                {
                    colId: 'margin',
                    headerName: 'Margin',
                    calculatedExpression: '[profit] / [revenue]',
                },
            ],
        });
        await asyncSetTimeout(1);

        await openEditDialogViaMenu(api, 'profit');
        await openEditDialogViaMenu(api, 'margin');

        const gridDiv = document.querySelector('#calculated-column-multi-highlight')!;
        expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[col-id="margin"].ag-header-cell')).toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[row-index="0"] [col-id="profit"]')).toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[row-index="0"] [col-id="margin"]')).toHaveClass(
            'ag-calculated-column-highlighted'
        );

        const dialogs = Array.from(document.querySelectorAll<HTMLElement>('.ag-calculated-column-form'));
        const profitDialog = dialogs.find((dialog) => dialog.querySelector('input')?.value === 'Profit')!;
        const profitCancel = Array.from(profitDialog.querySelectorAll<HTMLButtonElement>('button')).find(
            (button) => button.textContent?.trim() === 'Cancel'
        )!;
        profitCancel.click();
        await asyncSetTimeout(1);

        expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).not.toHaveClass(
            'ag-calculated-column-highlighted'
        );
        expect(gridDiv.querySelector('[col-id="margin"].ag-header-cell')).toHaveClass(
            'ag-calculated-column-highlighted'
        );

        clickDialogButton('Cancel');
    });

    test('edit menu does not open duplicate dialogs for the same column', async () => {
        const api = createGrid('calculated-column-open-dialog-once', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] - [cost]' },
            ],
        });
        await asyncSetTimeout(1);

        await openEditDialogViaMenu(api, 'profit');
        await openEditDialogViaMenu(api, 'profit');

        expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(1);
        expect(document.querySelector('.ag-menu')).toBeFalsy();

        clickDialogButton('Cancel');
    });

    test('multiple live dialogs can close after using the type picker', async () => {
        const api = createGrid('calculated-column-multi-dialog-live-close', {
            calculatedColumns: true,
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });
        await asyncSetTimeout(1);

        showColumnMenu(api, 'revenue');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);
        showColumnMenu(api, 'cost');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        const dialogs = Array.from(document.querySelectorAll<HTMLElement>('.ag-calculated-column-form'));
        expect(dialogs).toHaveLength(2);

        dialogs[0]
            .querySelector<HTMLElement>('.ag-select .ag-picker-field-wrapper')!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await asyncSetTimeout(1);
        const typeOption = Array.from(document.querySelectorAll<HTMLElement>('.ag-list-item')).find(
            (element) => element.textContent?.trim() === 'Text'
        );
        expect(typeOption).toBeTruthy();
        typeOption!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        let closeButton = document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button');
        expect(closeButton).toBeTruthy();
        closeButton!.click();
        await asyncSetTimeout(1);
        closeButton = document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button');
        expect(closeButton).toBeTruthy();
        closeButton!.click();
        await asyncSetTimeout(1);

        expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(0);
    });

    test('removing a live calculated column closes its open dialog', async () => {
        const api = createGrid('calculated-column-remove-live-open-dialog', {
            calculatedColumns: true,
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });
        await asyncSetTimeout(1);

        showColumnMenu(api, 'revenue');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);

        expect(api.getColumn('calculated_1')).toBeTruthy();
        expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(1);

        showColumnMenu(api, 'calculated_1');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Remove Calculated Column');
        await asyncSetTimeout(1);

        expect(api.getColumn('calculated_1')).toBeNull();
        expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(0);
    });

    test('removing a deferred calculated column closes its open dialog', async () => {
        const api = createGrid('calculated-column-remove-deferred-open-dialog', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] - [cost]' },
            ],
        });
        await asyncSetTimeout(1);

        await openEditDialogViaMenu(api, 'profit');

        expect(api.getColumn('profit')).toBeTruthy();
        expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(1);

        showColumnMenu(api, 'profit');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Remove Calculated Column');
        await asyncSetTimeout(1);

        expect(api.getColumn('profit')).toBeNull();
        expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(0);
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
        let consoleWarnSpy: MockInstance | undefined;
        let consoleErrorSpy: MockInstance | undefined;

        try {
            consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
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
                    suppressColumnHighlighting: true,
                },
                rowData: [{ revenue: 10 }],
                columnDefs: [{ field: 'revenue' }],
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('error #200'),
                expect.stringContaining('CalculatedColumnsModule'),
                expect.any(String)
            );

            const callsBeforeDisabledOption = consoleErrorSpy.mock.calls.length;
            validationGridsManager.createGrid('calculated-option-false-validation', {
                calculatedColumns: false,
                rowData: [{ revenue: 10 }],
                columnDefs: [{ field: 'revenue' }],
            });
            expect(consoleErrorSpy.mock.calls).toHaveLength(callsBeforeDisabledOption);
        } finally {
            validationGridsManager.reset();
            consoleWarnSpy?.mockRestore();
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
        await new GridColumns(secondApi, 'calculated columns survive a getColumnDefs / createGrid roundtrip')
            .checkColumns(`
                CENTER
                ├── revenue "Revenue" width:200
                ├── cost "Cost" width:200
                └── profit width:200 ƒ
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

            expect(
                consoleWarnSpy.mock.calls.some((c) =>
                    c
                        .join(' ')
                        .includes(
                            'colDef.calculatedExpression is used as the value source and should not be combined with field, valueGetter or valueSetter.'
                        )
                )
            ).toBe(true);
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
                expect.stringContaining('warning #319'),
                expect.stringContaining(
                    '`colDef.calculatedExpression` requires `gridOptions.calculatedColumns` to be set to true or an options object.'
                ),
                expect.any(String)
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
    test('adding a calculated column preserves the current display order after moveColumns', async () => {
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
        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
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
            └── sum width:200 ƒ
        `);
        await new GridRows(api, 'reorder + addCalculatedColumn rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    // Same invariant with a column group: the group structure must survive the calc-col round-trip
    // and the runtime reorder must be preserved.
    test('addCalculatedColumn preserves group structure and reorder when columns are grouped', async () => {
        const api = createGrid('calc-cols-with-groups', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ groupId: 'G', headerName: 'G', children: [{ field: 'a' }, { field: 'b' }] }, { field: 'c' }],
        });
        await asyncSetTimeout(0);

        // Move `c` before the group → display order [c, a, b]; group G still wraps [a, b].
        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);

        // Add a calculated column at top level (no target column passed).
        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
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
            └── sum width:200 ƒ
        `);
        await new GridRows(api, 'group + reorder + addCalculatedColumn rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    // Same order-preservation invariant, but via `applyColumnState({ applyOrder: true })` instead
    // of `moveColumns`. Drives the same `colsList` mutation through a different code path —
    // guards that the lean variant's display-order sort sees the applied order.
    test('addCalculatedColumn preserves order set via applyColumnState({ applyOrder: true })', async () => {
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

        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
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
            └── sum width:200 ƒ
        `);
        await new GridRows(api, 'applyOrder + addCalculatedColumn rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    test('addCalculatedColumn round-trip preserves groupHierarchy virtual columns', async () => {
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
        addCalculatedColumnDef(api, { colId: 'doubled', calculatedExpression: '[amount] * 2' });
        await asyncSetTimeout(0);

        // Virtuals still present and alive after the round-trip.
        const yearVirtualAfter = api.getColumn('ag-Grid-HierarchyColumn-date-year');
        const monthVirtualAfter = api.getColumn('ag-Grid-HierarchyColumn-date-month');
        expect(yearVirtualAfter).not.toBeNull();
        expect(monthVirtualAfter).not.toBeNull();
        expect((yearVirtualAfter as any)!.isAlive()).toBe(true);
        expect((monthVirtualAfter as any)!.isAlive()).toBe(true);

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
            └── doubled width:200 ƒ
        `);
        await new GridRows(api, 'hierarchy + addCalculatedColumn rows', {
            ...gridRowsOpts,
            forcedColumns: [
                'ag-Grid-HierarchyColumn-date-year',
                'ag-Grid-HierarchyColumn-date-month',
                'country',
                'amount',
                'doubled',
            ],
        }).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            ├── LEAF id:r1 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-month:"1" country:"USA" amount:10 doubled:20
            └── LEAF id:r2 ag-Grid-HierarchyColumn-date-year:"2021" ag-Grid-HierarchyColumn-date-month:"6" country:"UK" amount:20 doubled:40
        `);
    });

    // Bracket references in calculated expressions can name a column by its `field` even when the
    // column carries an explicit `colId` that differs. `calculatedColumnsService` validates such
    // references via `colModel.getCol(ref)` (which falls back to field-name lookup), so the AST
    // parser must use the same lookup or validation accepts a reference that evaluation can't
    // resolve. Locks in parser/validator consistency.
    test('calculated expression bracket-reference resolves a column by field when colId differs', async () => {
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

        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'maintainColumnOrder=true: move + addCalcCol').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├── a "A" width:200
            ├── b "B" width:200
            └── sum width:200 ƒ
        `);
        await new GridRows(api, 'maintainColumnOrder=true: move + addCalcCol rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 c:3 a:1 b:2 sum:6
        `);
    });

    test('addCalculatedColumn after moveColumns with maintainColumnOrder=false preserves reorder', async () => {
        const api = createGrid('calc-maintain-false-move', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
            maintainColumnOrder: false,
        });
        await asyncSetTimeout(0);

        api.moveColumns(['c'], 0);
        await asyncSetTimeout(0);

        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        // Order preservation now comes from the incremental snapshot, not maintainColumnOrder.
        await new GridColumns(api, 'maintainColumnOrder=false: move + addCalcCol').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├── a "A" width:200
            ├── b "B" width:200
            └── sum width:200 ƒ
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

        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'maintainColumnOrder=true: updateColDefs + addCalcCol').checkColumns(`
            CENTER
            ├── c "C" width:200
            ├── a "A" width:200
            ├── b "B" width:200
            └── sum width:200 ƒ
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

        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'rowGroup + calc col').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Category" width:200
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200 ƒ
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

    test('addCalculatedColumn while pivot is active references primary columns', async () => {
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
        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
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

        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'rowSelection + calc col').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200 ƒ
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

        addCalculatedColumnDef(api, { colId: 'profit', calculatedExpression: '[revenue] - [cost]' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'rowNumbers + calc col').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── revenue "Revenue" width:200
            ├── cost "Cost" width:200
            └── profit width:200 ƒ
        `);
        await new GridRows(api, 'rowNumbers + calc col rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 row-number:"1" revenue:10 cost:3 profit:7
            └── LEAF id:r2 row-number:"2" revenue:20 cost:5 profit:15
        `);
    });

    test('moveColumns on a previously-added dynamic calc col preserves the move across subsequent adds', async () => {
        const api = createGrid('calc-move-then-add', {
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
        });
        await asyncSetTimeout(0);

        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b] + [c]' });
        await asyncSetTimeout(0);

        // Move sum to position 0 after creation.
        api.moveColumns(['sum'], 0);
        await asyncSetTimeout(0);

        // Add another calc col; sum's runtime position should still be 0.
        addCalculatedColumnDef(api, { colId: 'avg', calculatedExpression: '([a] + [b] + [c]) / 3' });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'moveColumns on calc col + subsequent add').checkColumns(`
            CENTER
            ├── sum width:200 ƒ
            ├── a "A" width:200
            ├── b "B" width:200
            ├── c "C" width:200
            └── avg width:200 ƒ
        `);
        await new GridRows(api, 'moveColumns on calc col + subsequent add rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 sum:6 a:1 b:2 c:3 avg:2
        `);
    });
});

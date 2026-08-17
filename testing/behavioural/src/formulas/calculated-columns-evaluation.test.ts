import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    GridColumns,
    GridRows,
    applyTransactionChecked,
    asyncSetTimeout,
    clickMenuOption,
    nextAnimationFrame,
    waitForEvent,
} from 'ag-test-utils';
import { vi } from 'vitest';

import type { ColDef, ColGroupDef } from 'ag-grid-community';
import { enableDevValidations, getGridElement } from 'ag-grid-community';

import {
    addCalculatedColumnDef,
    clickDialogButton,
    createGrid,
    findColumnDef,
    flashCssClass,
    gridRowsOpts,
    openEditDialogViaMenu,
    removeColumnDef,
    selectDataType,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
    updateCalculatedColumnDef,
    waitForFirstRow,
} from './calculatedColumnsHarness';

describe('ag-grid calculated columns', () => {
    setupCalculatedColumnsSuite();

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

        await new GridRows(api, 'after setData', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenueCol:18 cost:4 first:"Ada" last:"Lovelace" profit:14 profitable:"yes" name:"Ada Lovelace"
            └── LEAF id:r2 revenueCol:20 cost:8 first:"Grace" last:"Hopper" profit:12 profitable:"yes" name:"Grace Hopper"
        `);

        applyTransactionChecked(api, { update: [{ ...rowData[1], revenue: 30, cost: 9 }] });

        await new GridRows(api, 'after transaction update', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 revenueCol:18 cost:4 first:"Ada" last:"Lovelace" profit:14 profitable:"yes" name:"Ada Lovelace"
            └── LEAF id:r2 revenueCol:30 cost:9 first:"Grace" last:"Hopper" profit:21 profitable:"yes" name:"Grace Hopper"
        `);

        api.setGridOption('rowData', [
            { id: 'r1', revenue: 40, cost: 25, first: 'Ada', last: 'Lovelace' },
            { id: 'r2', revenue: 30, cost: 9, first: 'Grace', last: 'Hopper' },
        ]);

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

        const gridEl = getGridElement(api)!;
        const spannedCell = await waitFor(() => {
            const cell = gridEl.querySelector('.ag-spanned-row [col-id="athleteCopy"]');
            expect(cell).not.toBeNull();
            expect(cell!.getAttribute('aria-rowspan')).toBe('2');
            return cell!;
        });
        const coveredCell = gridEl.querySelector('.ag-center-cols-container [row-index="1"] [col-id="athleteCopy"]');
        const unspannedCell = gridEl.querySelector('[row-index="2"] [col-id="athleteCopy"]');
        expect(spannedCell).not.toBeNull();
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
        await new GridRows(api, 'dynamic calculated span rows', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r1 athlete:"A"↧2 athleteCopy:"A"↧2
            ├── LEAF id:r2 athlete:"A"↥ athleteCopy:"A"↥
            └── LEAF id:r3 athlete:"B" athleteCopy:"B"
        `);

        const gridEl = getGridElement(api)!;
        const spannedCell = await waitFor(() => {
            const cell = gridEl.querySelector('.ag-spanned-row [col-id="athleteCopy"]');
            expect(cell).not.toBeNull();
            expect(cell!.getAttribute('aria-rowspan')).toBe('2');
            return cell!;
        });
        const coveredCell = gridEl.querySelector('.ag-center-cols-container [row-index="1"] [col-id="athleteCopy"]');
        const unspannedCell = gridEl.querySelector('[row-index="2"] [col-id="athleteCopy"]');
        expect(spannedCell).not.toBeNull();
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

        const gridEl = getGridElement(api)!;
        const spannedCell = await waitFor(() => {
            const cell = gridEl.querySelector('.ag-spanned-row [col-id="constant"]');
            expect(cell).not.toBeNull();
            expect(cell!.getAttribute('aria-rowspan')).toBe('3');
            return cell!;
        });
        const coveredCell = gridEl.querySelector('.ag-center-cols-container [row-index="2"] [col-id="constant"]');
        expect(spannedCell).not.toBeNull();
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
        // Suppress only the diagnostic this test asserts on; any other diagnostic still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
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
            }

            // Once for the pair, not once per case: #319 is warn-once, so the second grid emits nothing and
            // a per-case assertion here would only ever be re-reading the first case's call.
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                expect.stringContaining('warning #319'),
                expect.stringContaining(
                    '`colDef.calculatedExpression` requires `gridOptions.calculatedColumns` to be set to true or an options object.'
                ),
                expect.any(String)
            );
        } finally {
            consoleWarnSpy.mockRestore();
        }
    });

    test('runtime calculatedColumns toggle enables and disables static calculated columns', async () => {
        // Suppress only the diagnostic this test asserts on; any other diagnostic still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
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

            // calculatedColumns on: the column becomes calculated and the expression evaluates.
            await new GridColumns(api, 'toggle on').checkColumns(`
                CENTER
                ├── revenue "Revenue" width:200
                ├── cost "Cost" width:200
                └── profit width:200 ƒ
            `);
            expect(api.getCellValue({ rowNode, colKey: 'profit', useFormatter: false })).toBe(7);

            api.setGridOption('calculatedColumns', false);

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

        await waitFor(() =>
            expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
                'revenue',
                'cost',
                'profit',
            ])
        );
        await new GridRows(api, 'added calculated column', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:7
        `);

        updateCalculatedColumnDef(api, 'profit', {
            calculatedExpression: '[revenue] * [cost]',
        });

        await new GridRows(api, 'updated calculated column', gridRowsOpts).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 cost:3 profit:30
        `);

        removeColumnDef(api, 'profit');

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

        const profitBefore = await waitFor(() => {
            expect(api.getProvidedColumnGroup('derived') === null).toBe(false);
            const column = api.getColumn('profit');
            expect(column === null).toBe(false);
            return column;
        });

        removeColumnDef(api, 'profit');

        // The removed COLUMN is gone and destroyed, but the user-declared GROUP stays findable (now
        // empty) — it must not be silently dropped. Compare booleans (not objects) so failures print
        // cleanly.
        await waitFor(() => expect(api.getColumn('profit') === null).toBe(true));
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

        expect(columnDefs).toEqual([revenueColDef, costColDef, profitColDef]);
        expect(columnDefs).toHaveLength(3);
        await waitFor(() =>
            expect(findColumnDef(api.getColumnDefs()!, 'margin')?.calculatedExpression).toBe('[profit] / [revenue]')
        );

        updateCalculatedColumnDef(api, 'profit', { headerName: 'Profit', calculatedExpression: '[revenue] * [cost]' });

        expect(profitColDef).toEqual({
            colId: 'profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        });
        await waitFor(() =>
            expect(findColumnDef(api.getColumnDefs()!, 'profit')).toEqual(
                expect.objectContaining({
                    colId: 'profit',
                    headerName: 'Profit',
                    calculatedExpression: '[revenue] * [cost]',
                })
            )
        );

        removeColumnDef(api, 'profit');

        expect(columnDefs).toEqual([revenueColDef, costColDef, profitColDef]);
        await waitFor(() => expect(findColumnDef(api.getColumnDefs()!, 'profit')).toBeUndefined());
        expect(findColumnDef(api.getColumnDefs()!, 'margin')).toBeTruthy();

        api.setGridOption('columnDefs', columnDefs.slice());

        await waitFor(() =>
            expect(findColumnDef(api.getColumnDefs()!, 'profit')?.calculatedExpression).toBe('[revenue] - [cost]')
        );
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
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => setExpression('[Profit] / [Revenue]'));
        clickDialogButton('Apply');

        await waitFor(() => expect(api.getColumn('calculated_1')).toBeTruthy());
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'revenue',
            'cost',
            'profit',
            'calculated_1',
        ]);
        const columnState = api.getColumnState();

        await openEditDialogViaMenu(api, 'profit');
        await waitFor(() => setExpression('[Revenue] * [Cost]'));
        clickDialogButton('Apply');

        showColumnMenu(api, 'profit');
        await clickMenuOption('Remove Calculated Column');

        // Poll until the event has arrived, then assert the count synchronously — polling the count
        // itself would resolve as soon as it hit 1, so a duplicate dispatch could never fail this.
        await waitFor(() => {
            expect(api.getColumn('profit')).toBeNull();
            expect(removed).toHaveBeenCalled();
        });
        expect(removed).toHaveBeenCalledTimes(1);

        api.resetColumnState();

        await waitFor(() => expect(api.getColumn('calculated_1')).toBeNull());
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

        await waitFor(() => expect(api.getColumn('calculated_1')).toBeTruthy());
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

        await openEditDialogViaMenu(api, 'profitable');
        await waitFor(() => setExpression('[revenue] > [cost]'));
        await selectDataType('Boolean');
        clickDialogButton('Apply');

        await waitFor(() =>
            expect(api.getColumn('profitable')!.getColDef().cellRenderer).toBe('agCheckboxCellRenderer')
        );

        await openEditDialogViaMenu(api, 'profitable');
        await waitFor(() => setExpression('IF([revenue] > [cost], "yes", "no")'));
        await selectDataType('Text');
        clickDialogButton('Apply');

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
            // The flash duration is a grid option, so it is set rather than out-waited: the baseline below
            // has to see any incidental flash gone, and no positive signal marks a flash ending.
            cellFlashDuration: 20,
            cellFadeDuration: 10,
            rowData: [{ id: 'r1', a: 1, b: 2, c: 3 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
        });
        addCalculatedColumnDef(api, { colId: 'sum', calculatedExpression: '[a] + [b]' });
        // eslint-disable-next-line no-restricted-syntax -- past the flash + fade set above
        await asyncSetTimeout(40);

        const gridDiv = getGridElement(api)!;
        const sourceCell = gridDiv.querySelector('[row-index="0"] [col-id="a"]')!;
        expect(sourceCell).not.toHaveClass(flashCssClass);

        api.getRowNode('r1')!.setDataValue('a', 10);
        await asyncSetTimeout(0);

        expect(sourceCell).toHaveClass(flashCssClass);
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

        // Live apply coalesces keystrokes into one rebuild per animation frame; wait past each flush.
        setExpression('[revenue] - [cost] + 1');
        await nextAnimationFrame();
        setExpression('[revenue] * [cost]');
        await nextAnimationFrame();
        setExpression('[revenue] + [cost]');
        await nextAnimationFrame();

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

        await waitFor(() =>
            expect(
                api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'profit', useFormatter: false })
            ).toBe(16)
        );
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
});

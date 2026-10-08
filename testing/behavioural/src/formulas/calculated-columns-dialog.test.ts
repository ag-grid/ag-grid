import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { GridColumns, GridRows, clickMenuOption } from 'ag-test-utils';
import { vi } from 'vitest';

import type { ColGroupDef } from 'ag-grid-community';

import {
    clickDialogButton,
    createGrid,
    findColumnDef,
    getCalculatedColumnDialog,
    getDialogButton,
    getExpressionInput,
    getSuggestionLabels,
    openEditDialogViaMenu,
    selectDataType,
    selectOperatorSuggestion,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
} from './calculatedColumnsHarness';

describe('ag-grid calculated columns', () => {
    setupCalculatedColumnsSuite();

    test('a new deferred dialog disables Apply until an expression is entered', async () => {
        const api = createGrid('calculated-initial-validation', {
            calculatedColumns: { applyMode: 'deferred' },
            columnDefs: [{ field: 'revenue' }],
            rowData: [{ id: 'r1', revenue: 10 }],
        });
        showColumnMenu(api, 'revenue');
        await clickMenuOption('Add Calculated Column');
        expect(getDialogButton('Apply')).toBeDisabled();
        setExpression('[Revenue]');
        expect(getDialogButton('Apply')).not.toBeDisabled();
        clickDialogButton('Apply');
        expect(api.getColumn('calculated_1')!.getColDef().calculatedExpression).toBe('[revenue]');
    });

    test.each(['live', 'deferred'] as const)(
        'a title-only %s edit preserves disabled data types',
        async (applyMode) => {
            const api = createGrid(`calculated-preserve-type-${applyMode}`, {
                calculatedColumns: { applyMode },
                columnDefs: [
                    { field: 'revenue' },
                    { colId: 'profit', calculatedExpression: '[revenue]', cellDataType: false },
                ],
                rowData: [{ id: 'r1', revenue: 10 }],
            });
            await openEditDialogViaMenu(api, 'profit');
            const title = getCalculatedColumnDialog().querySelector('input')!;
            title.value = 'Net Profit';
            title.dispatchEvent(new Event('input', { bubbles: true }));
            if (applyMode === 'deferred') {
                clickDialogButton('Apply');
            }
            await waitFor(() => expect(api.getColumn('profit')!.getColDef().headerName).toBe('Net Profit'));
            expect(api.getColumn('profit')!.getColDef().cellDataType).toBe(false);
            expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(10);
        }
    );

    test.each(['Revenue [USD]', 'Revenue]', 'Revenue]]'])(
        'header %s round-trips through the dialog',
        async (headerName) => {
            const api = createGrid('calculated-bracket-header', {
                calculatedColumns: { applyMode: 'deferred' },
                columnDefs: [
                    { field: 'revenue', headerName },
                    { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue]' },
                ],
                rowData: [{ id: 'r1', revenue: 10 }],
            });
            await openEditDialogViaMenu(api, 'profit');
            expect(getExpressionInput().validationMessage).toBe('');
            expect(getDialogButton('Apply')).not.toBeDisabled();
            clickDialogButton('Apply');
            expect(document.querySelector('.ag-calculated-column-form')).toBeNull();
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[revenue]');
            await openEditDialogViaMenu(api, 'profit');
            setExpression('');
            clickDialogButton('Columns');
            getDialogButton('Columns').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            expect(getExpressionInput().validationMessage).toBe('');
            clickDialogButton('Apply');
            expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(10);
        }
    );

    test('autocomplete replaces a complete reference when the caret is inside it', async () => {
        const api = createGrid('calculated-autocomplete-middle', {
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue]' }],
            rowData: [{ id: 'r1', revenue: 10 }],
        });
        await openEditDialogViaMenu(api, 'profit');
        const input = getExpressionInput();
        input.setSelectionRange(4, 4);
        input.dispatchEvent(new Event('click', { bubbles: true }));
        expect(input.getAttribute('aria-controls')).toBeTruthy();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(input.value).toBe('[Revenue]');
        setExpression('"[Revenue]"');
        input.setSelectionRange(5, 5);
        input.dispatchEvent(new Event('click', { bubbles: true }));
        expect(input).not.toHaveAttribute('aria-controls');
    });

    test('changing suggestion types preserves the controlling element', async () => {
        const api = createGrid('calculated-suggestion-transition', {
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue]' }],
            rowData: [{ id: 'r1', revenue: 10 }],
        });
        await openEditDialogViaMenu(api, 'profit');
        const input = getExpressionInput();
        for (const expression of ['SU', '[Rev', 'SU']) {
            setExpression(expression);
            const listId = input.getAttribute('aria-controls');
            expect(listId).toBeTruthy();
            expect(document.getElementById(listId!)).toHaveAttribute('role', 'listbox');
        }
        for (const label of ['Columns', 'Functions', 'Operators']) {
            clickDialogButton(label);
            const button = getDialogButton(label);
            expect(button).toHaveAttribute('aria-expanded', 'true');
            expect(document.getElementById(button.getAttribute('aria-controls')!)).toHaveAttribute('role', 'listbox');
            expect(input).not.toHaveAttribute('aria-controls');
        }
    });

    test('duplicate full paths retain their distinguishing suffix in the picker', async () => {
        const api = createGrid('calculated-duplicate-path-labels', {
            columnDefs: [
                {
                    headerName: 'Group',
                    children: [
                        { field: 'a', headerName: 'Total' },
                        { field: 'b', headerName: 'Total' },
                    ],
                },
                { colId: 'profit', calculatedExpression: '[a] + [b]' },
            ],
            rowData: [{ id: 'r1', a: 10, b: 20 }],
        });
        await openEditDialogViaMenu(api, 'profit');
        clickDialogButton('Columns');
        const rows = Array.from(document.querySelectorAll('.ag-calculated-column-suggestion'));
        expect(rows.map((row) => row.textContent?.trim())).toEqual(['Group›Total (a)', 'Group›Total (b)']);
        expect(rows.map((row) => row.getAttribute('aria-label'))).toEqual(['Group › Total (a)', 'Group › Total (b)']);
        getDialogButton('Columns').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(getExpressionInput().value).toContain('[Group Total (a)]');
    });

    test.each(['live', 'deferred'] as const)(
        'reference restrictions apply to the %s dialog, not stored expressions',
        async (applyMode) => {
            const api = createGrid(`calculated-restricted-reference-${applyMode}`, {
                calculatedColumns: {
                    applyMode,
                    isColumnReferenceable: ({ colDef, calculatedColumn }) =>
                        colDef.field !== 'salary' || calculatedColumn?.getColId() === 'bonus',
                },
                columnDefs: [
                    { field: 'salary', colId: 'server-salary', headerName: 'Salary' },
                    { field: 'revenue' },
                    { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue]' },
                    { colId: 'bonus', headerName: 'Bonus', calculatedExpression: '[server-salary] * 0.1' },
                    { colId: 'programmatic', calculatedExpression: '[server-salary]' },
                ],
                rowData: [{ id: 'r1', salary: 100, revenue: 10 }],
            });
            const rowNode = api.getRowNode('r1')!;
            expect(api.getCellValue({ rowNode, colKey: 'programmatic' })).toBe(100);
            await openEditDialogViaMenu(api, 'profit');
            clickDialogButton('Columns');
            expect(getSuggestionLabels()).not.toContain('Salary');
            for (const expression of ['[Salary]', '[SALARY]', '[server-salary]']) {
                setExpression(expression);
                expect(getExpressionInput().validationMessage).toContain('cannot be used');
                expect(getExpressionInput()).toHaveClass('invalid');
                if (applyMode === 'deferred') {
                    expect(getDialogButton('Apply')).toBeDisabled();
                }
            }
            if (applyMode === 'live') {
                await waitFor(() =>
                    expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[server-salary]')
                );
                expect(api.getCellValue({ rowNode, colKey: 'profit' })).toBe('#REF!');
            } else {
                expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[revenue]');
            }
            setExpression('[Revenue] * 2');
            expect(getExpressionInput()).not.toHaveClass('invalid');
            if (applyMode === 'deferred') {
                clickDialogButton('Apply');
            }
            await waitFor(() => expect(api.getCellValue({ rowNode, colKey: 'profit' })).toBe(20));
            api.hidePopupMenu();
            if (applyMode === 'live') {
                document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
            }
            await openEditDialogViaMenu(api, 'bonus');
            clickDialogButton('Columns');
            expect(getSuggestionLabels()).toContain('Salary');
            setExpression('[Salary] * 0.2');
            if (applyMode === 'deferred') {
                clickDialogButton('Apply');
            }
            await waitFor(() => expect(api.getCellValue({ rowNode, colKey: 'bonus' })).toBe(20));
        }
    );

    test('live conversion preserves unresolved escaped references verbatim', async () => {
        const api = createGrid('calculated-live-unknown-reference', {
            calculatedColumns: {
                applyMode: 'live',
                isColumnReferenceable: ({ colDef }) => colDef.field !== 'salary',
            },
            columnDefs: [
                { field: 'salary' },
                { field: 'revenue', headerName: 'Revenue]' },
                { colId: 'profit', calculatedExpression: '[revenue]' },
            ],
            rowData: [{ id: 'r1', salary: 100, revenue: 20 }],
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[salary]] + [revenue]');
        await waitFor(() =>
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[salary]] + [revenue]')
        );
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toMatch(/^#/);
        setExpression('[Missing]]] + [Revenue]]]');
        await waitFor(() =>
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[Missing]]] + [revenue]')
        );
        setExpression('[Revenue]]] * 2');
        await waitFor(() => expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(40));
    });

    test.each(['live', 'deferred'] as const)(
        'the %s dialog checks resolved columns in cell references and ranges',
        async (applyMode) => {
            const api = createGrid('calculated-cell-reference-restrictions', {
                calculatedColumns: { applyMode, isColumnReferenceable: ({ colDef }) => colDef.field !== 'salary' },
                columnDefs: [
                    { field: 'revenue' },
                    { field: 'salary' },
                    { field: 'cost' },
                    {
                        colId: 'profit',
                        headerName: 'Profit',
                        calculatedExpression: '[revenue]',
                        cellDataType: 'number',
                    },
                ],
                rowData: [
                    { id: 'r1', revenue: 20, salary: 100, cost: 3 },
                    { id: 'r2', revenue: 40, salary: 200, cost: 7 },
                ],
            });
            await openEditDialogViaMenu(api, 'profit');
            for (const expression of [
                'B1',
                'b1',
                '=B1',
                '  = B1',
                '$B$1',
                'B$1',
                '$B1',
                'B999',
                'SUM(B1:B2)',
                'SUM(A1:C2)',
                'SUM($C$2:$A$1)',
                'REF(COLUMN("salary"), ROW("r1"))',
                'REF(COLUMN("B", true), ROW(1, true))',
                'SUM(REF(COLUMN("revenue"), ROW("r1"), COLUMN("cost"), ROW("r2")))',
            ]) {
                setExpression(expression);
                expect(getExpressionInput().validationMessage).toContain('Column "Salary" cannot be used');
                if (applyMode === 'deferred') {
                    expect(getDialogButton('Apply')).toBeDisabled();
                }
            }
            document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
            if (applyMode === 'live') {
                expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe(
                    'SUM(REF(COLUMN("revenue"), ROW("r1"), COLUMN("cost"), ROW("r2")))'
                );
                expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe('#REF!');
            } else {
                expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[revenue]');
            }
            await openEditDialogViaMenu(api, 'profit');
            setExpression('"B1 [Salary]"');
            expect(getExpressionInput().validationMessage).toBe('');
            setExpression('[Revenue] + [Cost]');
            expect(getExpressionInput().validationMessage).toBe('');
            if (applyMode === 'deferred') {
                expect(getDialogButton('Apply')).toBeEnabled();
                clickDialogButton('Apply');
            }
            await waitFor(() =>
                expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(23)
            );
        }
    );

    test.each(['live', 'deferred'] as const)(
        'the first %s column rejects restricted A1 references',
        async (applyMode) => {
            const api = createGrid('calculated-first-a1-restriction', {
                calculatedColumns: { applyMode, isColumnReferenceable: ({ colDef }) => colDef.field !== 'salary' },
                columnDefs: [{ field: 'salary' }, { field: 'revenue' }],
                rowData: [{ id: 'r1', salary: 100, revenue: 20 }],
            });
            showColumnMenu(api, 'revenue');
            await clickMenuOption('Add Calculated Column');
            setExpression('A1');
            expect(getExpressionInput().validationMessage).toContain('Column "Salary" cannot be used');
            if (applyMode === 'deferred') {
                expect(getDialogButton('Apply')).toBeDisabled();
            }
        }
    );

    test.each(['live', 'deferred'] as const)(
        'a new %s column callback receives no calculated column',
        async (applyMode) => {
            const referenceable = vi.fn(() => true);
            const api = createGrid('calculated-reference-callback-context', {
                calculatedColumns: { applyMode, isColumnReferenceable: referenceable },
                context: { key: 'context' },
                columnDefs: [{ field: 'revenue' }],
                rowData: [{ id: 'r1', revenue: 10 }],
            });
            showColumnMenu(api, 'revenue');
            await clickMenuOption('Add Calculated Column');
            expect(referenceable).toHaveBeenCalledWith(
                expect.objectContaining({
                    api,
                    context: { key: 'context' },
                    colDef: expect.objectContaining({ field: 'revenue' }),
                    column: api.getColumn('revenue'),
                    calculatedColumn: null,
                })
            );
        }
    );

    test.each(
        (['live', 'deferred'] as const).flatMap((applyMode) =>
            ['[server-salary]', 'A1', 'REF(COLUMN("server-salary"), ROW("r1"))'].map((reference) => ({
                applyMode,
                reference,
            }))
        )
    )('an unchanged restricted $reference survives $applyMode edits', async ({ applyMode, reference }) => {
        const expression = `${reference} * 0.1`;
        const changed = vi.fn();
        const api = createGrid(`calculated-existing-restriction-${applyMode}`, {
            columnDefs: [
                { field: 'salary', colId: 'server-salary', headerName: 'Salary' },
                { field: 'revenue' },
                { colId: 'bonus', headerName: 'Bonus', calculatedExpression: expression, cellDataType: 'number' },
            ],
            rowData: [{ id: 'r1', salary: 100, revenue: 20 }],
            onCalculatedColumnExpressionChanged: changed,
        });
        api.setGridOption('calculatedColumns', {
            applyMode,
            isColumnReferenceable: ({ colDef }) => colDef.field !== 'salary',
        });
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'bonus' })).toBe(10);
        await openEditDialogViaMenu(api, 'bonus');
        const displayExpression = expression.replace('[server-salary]', '[Salary]');
        expect(getExpressionInput().value).toBe(displayExpression);
        expect(getExpressionInput()).not.toHaveClass('invalid');
        if (applyMode === 'deferred') {
            expect(getDialogButton('Apply')).toBeEnabled();
            clickDialogButton('Apply');
            await openEditDialogViaMenu(api, 'bonus');
        }
        const title = getCalculatedColumnDialog().querySelector('input')!;
        title.value = 'Reward';
        title.dispatchEvent(new Event('input', { bubbles: true }));
        await selectDataType('Text');
        if (applyMode === 'deferred') {
            clickDialogButton('Apply');
        }
        await waitFor(() => {
            expect(api.getColumn('bonus')!.getColDef()).toMatchObject({
                headerName: 'Reward',
                cellDataType: 'text',
                calculatedExpression: expression,
            });
        });
        expect(changed).not.toHaveBeenCalled();
        if (applyMode === 'deferred') {
            await openEditDialogViaMenu(api, 'bonus');
        }
        for (const edited of ['[Salary] * 0.2', '[SALARY] * 0.1', `${displayExpression} `]) {
            setExpression(edited);
            expect(getExpressionInput().validationMessage).toContain('cannot be used');
            if (applyMode === 'deferred') {
                expect(getDialogButton('Apply')).toBeDisabled();
            }
        }
        if (applyMode === 'live') {
            await waitFor(() =>
                expect(api.getColumn('bonus')!.getColDef().calculatedExpression).toBe(`${expression} `)
            );
            expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'bonus' })).toBe('#REF!');
        } else {
            expect(api.getColumn('bonus')!.getColDef().calculatedExpression).toBe(expression);
        }
        setExpression(displayExpression);
        expect(getExpressionInput()).not.toHaveClass('invalid');
        setExpression('[Revenue]');
        if (applyMode === 'deferred') {
            clickDialogButton('Apply');
        }
        await waitFor(() => expect(api.getColumn('bonus')!.getColDef().calculatedExpression).toBe('[revenue]'));
    });

    test('reference suggestions use primary columns across pivot modes, independently of visibility', async () => {
        const api = createGrid('calculated-primary-suggestions', {
            calculatedColumns: { isColumnReferenceable: ({ colDef }) => colDef.field !== 'salary' },
            rowSelection: { mode: 'multiRow' },
            getContextMenuItems: () => ['editCalculatedColumn'],
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true },
                { field: 'revenue', aggFunc: 'sum', hide: true },
                { field: 'salary', aggFunc: 'sum' },
                { colId: 'bonus', headerName: 'Bonus', calculatedExpression: '[revenue]', aggFunc: 'sum' },
            ],
            rowData: [{ id: 'r1', country: 'UK', year: 2026, revenue: 10, salary: 20 }],
        });
        for (const pivotMode of [false, true, false]) {
            api.setGridOption('pivotMode', pivotMode);
            if (pivotMode) {
                expect(api.getPivotResultColumns()!.length).toBeGreaterThan(0);
            }
            api.showContextMenu({ column: api.getColumn('bonus'), value: null, source: 'api', x: 0, y: 0 });
            await clickMenuOption('Edit Calculated Column');
            expect(getExpressionInput().value).toBe('[Revenue]');
            clickDialogButton('Columns');
            expect(getSuggestionLabels()).toEqual(['Country', 'Year', 'Revenue']);
            document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
        }
    });

    test('an all-restricted Columns picker shows and announces its empty state', async () => {
        const api = createGrid('calculated-empty-suggestions', {
            calculatedColumns: { isColumnReferenceable: () => false },
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue]' }],
            rowData: [{ id: 'r1', revenue: 10 }],
        });
        await openEditDialogViaMenu(api, 'profit');
        const button = getDialogButton('Columns');
        button.focus();
        clickDialogButton('Columns');
        const list = document.getElementById(button.getAttribute('aria-controls')!)!;
        const message = 'No eligible columns found.';
        const placeholder = document.querySelector<HTMLElement>('.ag-calculated-column-empty-message')!;
        expect(placeholder).toBeVisible();
        expect(placeholder).toHaveTextContent(message);
        await waitFor(() =>
            expect(document.querySelector('.ag-root-wrapper > .ag-aria-description-container')).toHaveTextContent(
                message
            )
        );
        expect(button).toHaveFocus();
        const mouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        placeholder.dispatchEvent(mouseDown);
        expect(mouseDown.defaultPrevented).toBe(true);
        placeholder.click();
        expect(button).toHaveFocus();
        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(list).toHaveAttribute('role', 'listbox');
        expect(list.querySelectorAll('[role="option"]')).toHaveLength(0);
        expect(list).not.toHaveAttribute('aria-activedescendant');
        button.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(getExpressionInput().value).toBe('[Revenue]');
        button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(button).toHaveAttribute('aria-expanded', 'false');
        expect(getCalculatedColumnDialog()).toBeInTheDocument();
        for (const picker of ['Functions', 'Operators']) {
            clickDialogButton(picker);
            expect(document.querySelector('.ag-calculated-column-empty-message')).toBeNull();
            expect(document.querySelectorAll('.ag-autocomplete-list [role="option"]').length).toBeGreaterThan(0);
        }
    });

    test('the Columns picker shows an empty state when there are no other columns', async () => {
        const api = createGrid('calculated-no-source-columns', {
            columnDefs: [{ colId: 'constant', calculatedExpression: '1' }],
            rowData: [{ id: 'r1' }],
        });
        await openEditDialogViaMenu(api, 'constant');
        clickDialogButton('Columns');
        expect(document.querySelector('.ag-calculated-column-empty-message')).toHaveTextContent(
            'No eligible columns found.'
        );
        expect(document.querySelectorAll('.ag-autocomplete-list [role="option"]')).toHaveLength(0);
    });

    test('reopening reads application state without changing duplicate-header references', async () => {
        const context = { allowFirst: true };
        const api = createGrid('calculated-reference-state', {
            context,
            calculatedColumns: {
                isColumnReferenceable: ({ colDef, context }) => colDef.field !== 'first' || context.allowFirst,
            },
            columnDefs: [
                { headerName: '2025', children: [{ field: 'first', headerName: 'Q4', hide: true }] },
                { headerName: '2026', children: [{ field: 'second', headerName: 'Q4' }] },
                { colId: 'profit', calculatedExpression: '[second]' },
            ],
            rowData: [{ id: 'r1', first: 10, second: 20 }],
        });
        await openEditDialogViaMenu(api, 'profit');
        clickDialogButton('Columns');
        expect(getSuggestionLabels()).toEqual(['2025›Q4', '2026›Q4']);
        const reference = getExpressionInput().value;
        context.allowFirst = false;
        expect(getSuggestionLabels()).toEqual(['2025›Q4', '2026›Q4']);
        document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
        await openEditDialogViaMenu(api, 'profit');
        expect(getExpressionInput().value).toBe(reference);
        clickDialogButton('Columns');
        expect(getSuggestionLabels()).toEqual(['2026›Q4']);
        setExpression('[202');
        expect(getSuggestionLabels()).toEqual(['2026›Q4']);
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
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => clickDialogButton('Columns'));

        expect(getSuggestionLabels()).toEqual(expect.arrayContaining(['Revenue', 'Cost']));
        // One `not.arrayContaining` of both ids passes when either one alone leaks, so assert them apart.
        expect(getSuggestionLabels()).not.toContain(revenueColId);
        expect(getSuggestionLabels()).not.toContain(costColId);

        setExpression('[Missing]');
        clickDialogButton('Apply');

        await waitFor(() => expect(getExpressionInput()).toHaveClass('invalid'));
        expect(getExpressionInput().validationMessage).toContain('Unknown column reference "Missing"');
        expect(api.getColumn('calculated_1')).toBeNull();

        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');

        const rowNode = api.getRowNode('r1')!;
        const calculatedDef = await waitFor(() => {
            const def = findColumnDef(api.getColumnDefs()!, 'calculated_1');
            expect(def).toBeTruthy();
            expect(created).toHaveBeenCalledWith(
                expect.objectContaining({
                    column: api.getColumn('calculated_1'),
                    expression: `[${revenueColId}] - [${costColId}]`,
                    source: 'calculatedColumn',
                })
            );
            return def;
        });

        expect(calculatedDef?.calculatedExpression).toBe(`[${revenueColId}] - [${costColId}]`);
        expect(api.getCellValue({ rowNode, colKey: 'calculated_1', useFormatter: false })).toBe(7);

        showColumnMenu(api, 'calculated_1');
        await clickMenuOption('Edit Calculated Column');

        await waitFor(() => expect(getExpressionInput().value).toBe('[Revenue] - [Cost]'));
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
        await clickMenuOption('Add Calculated Column');

        // Type a reference, then clear it back to empty (the reported scenario).
        await waitFor(() => setExpression('[gold]'));
        setExpression('');

        const input = getExpressionInput();
        expect(input.validationMessage).toBe('Enter an expression');
        expect(input.validationMessage).not.toContain('begin with');
        expect(input).toHaveClass('invalid');
        expect(getDialogButton('Apply')).toBeDisabled();

        // Applying an empty expression must not create a column.
        clickDialogButton('Apply');
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
        await waitFor(() => expect(api.getColumn('profit')!.getColDef().headerName).toBe('Net Profit'));
    });

    test('edit dialog shows the edited header name, not the stale colDef name', async () => {
        const api = createGrid('calculated-edit-dialog-uses-edited-name', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] - [cost]' },
            ],
        });

        // Rename the column header (stored as a header-name override, not in colDef.headerName).
        api.applyColumnState({ state: [{ colId: 'profit', headerName: 'Custom Profit' }] });

        await openEditDialogViaMenu(api, 'profit');

        const titleInput = getCalculatedColumnDialog().querySelector('input')!;
        expect(titleInput.value).toBe('Custom Profit');
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
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => clickDialogButton('Columns'));

        const revenueSuggestion = await waitFor(() => {
            const suggestion = Array.from(
                document.querySelectorAll<HTMLElement>('.ag-calculated-column-suggestion')
            ).find((element) => element.getAttribute('aria-label') === 'Money › Revenue');
            expect(suggestion).toBeTruthy();
            return suggestion;
        });

        expect(revenueSuggestion).toBeTruthy();
        expect(revenueSuggestion!.querySelector('.ag-calculated-column-suggestion-path')).toBeTruthy();
        expect(revenueSuggestion!.querySelector('.ag-calculated-column-suggestion-parent')?.textContent).toBe('Money');
        expect(revenueSuggestion!.querySelector('.ag-calculated-column-suggestion-separator')?.textContent).toBe('›');
        expect(revenueSuggestion!.querySelector('.ag-calculated-column-suggestion-leaf')?.textContent).toBe('Revenue');

        // Every row gets the same height and is stacked by index, which is what lets the list hit-test a
        // pointer by dividing its offset - so the two claims stand or fall together.
        const rows = Array.from(document.querySelectorAll<HTMLElement>('.ag-autocomplete-virtual-list-item'));
        expect(rows.length).toBeGreaterThan(1);
        const rowHeight = Number.parseFloat(rows[0].style.height);
        expect(rowHeight).toBeGreaterThan(0);
        expect(rows.map((row) => [row.style.height, row.style.top])).toEqual(
            rows.map((_row, index) => [`${rowHeight}px`, `${rowHeight * index}px`])
        );

        // Revenue is the first column entry, so it is selected by default; Enter inserts it.
        getExpressionInput().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(getExpressionInput().value).toBe('[Revenue]');

        setExpression('');
        clickDialogButton('Columns');
        // Cost is the second entry, so a pointer inside the second row's band activates it, not Revenue.
        const cost = await waitFor(() => {
            const suggestion = Array.from(
                document.querySelectorAll<HTMLElement>('.ag-calculated-column-suggestion')
            ).find((element) => element.getAttribute('aria-label') === 'Money › Cost');
            expect(suggestion).toBeTruthy();
            return suggestion!;
        });
        cost.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientY: rowHeight * 1.5 }));
        cost.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(getExpressionInput().value).toBe('[Cost]');
    });

    test('dialog sizes inline autocomplete to the expression editor width', async () => {
        const api = createGrid('calculated-dialog-inline-picker-width', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        showColumnMenu(api, 'revenue');
        await clickMenuOption('Add Calculated Column');
        const input = await waitFor(() => getExpressionInput());

        Object.defineProperty(input, 'offsetWidth', { configurable: true, get: () => 320 });
        input.value = '[Rev';
        input.setSelectionRange(input.value.length, input.value.length);
        input.dispatchEvent(new Event('input', { bubbles: true }));

        const popup = await waitFor(() => {
            const element = document.querySelector<HTMLElement>('.ag-autocomplete-list-popup');
            expect(element).toBeTruthy();
            return element!;
        });
        expect(popup.style.width).toBe('320px');
        expect(popup.style.maxWidth).toBe('');
        expect(popup).not.toHaveClass('ag-calculated-column-picker-list');
    });

    test('dialog only disables browser autocomplete for the expression editor', async () => {
        const api = createGrid('calculated-dialog-browser-autocomplete', {
            enableInputAutoComplete: true,
            rowData: [{ id: 'r1', revenue: 10 }],
            columnDefs: [{ field: 'revenue' }],
        });

        showColumnMenu(api, 'revenue');
        await clickMenuOption('Add Calculated Column');
        const dialog = await waitFor(() => getCalculatedColumnDialog());
        const titleInput = dialog.querySelector<HTMLInputElement>('input[type="text"]')!;
        const expressionInput = getExpressionInput();

        expect(titleInput).not.toHaveAttribute('autocomplete');
        expect(expressionInput).toHaveAttribute('autocomplete', 'off');
    });

    test('dialog expression suggestions control the virtual list aria state', async () => {
        const api = createGrid('calculated-dialog-inline-aria', {
            rowData: [{ id: 'r1', revenue: 10, revenueTax: 2, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'revenueTax' }, { field: 'cost' }],
        });

        showColumnMenu(api, 'revenue');
        await clickMenuOption('Add Calculated Column');
        const input = await waitFor(() => getExpressionInput());

        expect(input).toHaveAttribute('aria-autocomplete', 'list');
        expect(input).toHaveAttribute('aria-haspopup', 'listbox');
        // role textbox does not support aria-expanded, and textarea cannot take role combobox
        expect(input).not.toHaveAttribute('aria-expanded');

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

        expect(input).not.toHaveAttribute('aria-expanded');
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

        expect(input).not.toHaveAttribute('aria-expanded');
        expect(input).not.toHaveAttribute('aria-controls');
        expect(input).not.toHaveAttribute('aria-activedescendant');
    });

    test('dialog sizes helper pickers from the calculated column suggestion width variable', async () => {
        const api = createGrid('calculated-dialog-helper-picker-width', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        showColumnMenu(api, 'revenue');
        await clickMenuOption('Add Calculated Column');
        const dialog = await waitFor(() => getCalculatedColumnDialog());

        Object.defineProperty(dialog, 'offsetWidth', { configurable: true, get: () => 140 });
        clickDialogButton('Columns');

        // The picker class carries the `--ag-calculated-column-suggestion-list-width` width rule.
        const popup = await waitFor(() => {
            const element = document.querySelector<HTMLElement>('.ag-autocomplete-list-popup');
            expect(element).toBeTruthy();
            return element!;
        });
        expect(popup).toHaveClass('ag-calculated-column-picker-list');
        expect(popup.style.width).toBe('');
        expect(popup.style.maxWidth).toBe('140px');

        // Typing reuses the same list (same suggestion type); it must switch back to inline sizing.
        const input = getExpressionInput();
        Object.defineProperty(input, 'offsetWidth', { configurable: true, get: () => 320 });
        input.value = '[Rev';
        input.setSelectionRange(input.value.length, input.value.length);
        input.dispatchEvent(new Event('input', { bubbles: true }));

        await waitFor(() => expect(popup).not.toHaveClass('ag-calculated-column-picker-list'));
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
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => setExpression('[REVENUE] - [cost]'));
        clickDialogButton('Apply');

        const rowNode = api.getRowNode('r1')!;
        await waitFor(() =>
            expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')?.calculatedExpression).toBe('[revenue] - [cost]')
        );
        expect(api.getCellValue({ rowNode, colKey: 'calculated_1', useFormatter: false })).toBe(7);
    });

    test('dialog operator suggestions replace existing operators near the caret', async () => {
        const api = createGrid('calculated-dialog-operator-replacement', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', age: 23, medals: 8 }],
            columnDefs: [{ field: 'age' }, { field: 'medals' }],
        });

        showColumnMenu(api, 'age');
        await clickMenuOption('Add Calculated Column');
        const input = await waitFor(() => getExpressionInput());

        setExpression('[Age] + [Medals]');
        input.setSelectionRange('[Age] +'.length, '[Age] +'.length);
        clickDialogButton('Operators');
        await selectOperatorSuggestion('*');
        await waitFor(() => expect(input.value).toBe('[Age] * [Medals]'));

        setExpression('[Age] + [Medals]');
        input.setSelectionRange('[Age] + '.length, '[Age] + '.length);
        clickDialogButton('Operators');
        await selectOperatorSuggestion('/');
        await waitFor(() => expect(input.value).toBe('[Age] / [Medals]'));

        setExpression('[Age] >= [Medals]');
        input.setSelectionRange('[Age] >='.length, '[Age] >='.length);
        clickDialogButton('Operators');
        await selectOperatorSuggestion('<');
        await waitFor(() => expect(input.value).toBe('[Age] < [Medals]'));

        setExpression('[Age] + [Medals]');
        input.setSelectionRange('[Age] '.length, '[Age] +'.length);
        clickDialogButton('Operators');
        await selectOperatorSuggestion('-');
        await waitFor(() => expect(input.value).toBe('[Age] - [Medals]'));
    });

    test('dialog picker keeps button focus until suggestion is accepted', async () => {
        const api = createGrid('calculated-dialog-picker-focus', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', age: 23, medals: 8 }],
            columnDefs: [{ field: 'age' }, { field: 'medals' }],
        });

        showColumnMenu(api, 'age');
        await clickMenuOption('Add Calculated Column');
        const input = await waitFor(() => getExpressionInput());

        setExpression('[Age] + [Medals]');
        input.setSelectionRange('[Age] +'.length, '[Age] +'.length);

        const operators = getDialogButton('Operators');
        operators.focus();
        operators.click();

        await waitFor(() => expect(document.activeElement).toBe(operators));
        operators.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        operators.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        operators.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        await waitFor(() => expect(input.value).toBe('[Age] * [Medals]'));
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
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getExpressionInput());

        clickDialogButton('Operators');
        await waitFor(() => {
            expect(document.querySelector('.ag-autocomplete-list-popup')).toBeTruthy();
            expect(document.querySelector('.ag-select-list')).toBeFalsy();
        });

        getCalculatedColumnDialog()
            .querySelector<HTMLElement>('.ag-select .ag-picker-field-wrapper')!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await waitFor(() => {
            expect(document.querySelector('.ag-autocomplete-list-popup')).toBeFalsy();
            expect(document.querySelector('.ag-select-list')).toBeTruthy();
        });

        clickDialogButton('Operators');
        await waitFor(() => {
            expect(document.querySelector('.ag-autocomplete-list-popup')).toBeTruthy();
            expect(document.querySelector('.ag-select-list')).toBeFalsy();
        });
    });
});

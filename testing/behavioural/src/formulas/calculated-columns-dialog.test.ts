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
    selectOperatorSuggestion,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
} from './calculatedColumnsHarness';

describe('ag-grid calculated columns', () => {
    setupCalculatedColumnsSuite();

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

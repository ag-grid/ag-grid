import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, GridColumns, GridRows, clickMenuOption } from 'ag-test-utils';
import { vi } from 'vitest';

import { enableDevValidations } from 'ag-grid-community';

import {
    clickDialogButton,
    createGrid,
    getCalculatedColumnDialog,
    getDialogButton,
    getExpressionInput,
    getOpenMenuEntries,
    getSuggestionLabels,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
} from './calculatedColumnsHarness';

describe('ag-grid calculated columns', () => {
    setupCalculatedColumnsSuite();

    test('calculated column menu omits Edit Column Name even with headerNameEditable', async () => {
        const api = createGrid('calculated-menu-omits-edit-column-name', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            defaultColDef: { headerNameEditable: true },
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] - [cost]' },
            ],
        });

        showColumnMenu(api, 'profit');
        await waitFor(() =>
            expect(getOpenMenuEntries()).toEqual(
                expect.arrayContaining(['Edit Calculated Column', 'Remove Calculated Column'])
            )
        );
        expect(getOpenMenuEntries()).not.toContain('Edit Column Name');
    });

    test('non-calculated column with headerNameEditable still offers Edit Column Name', async () => {
        const api = createGrid('calculated-menu-keeps-edit-column-name', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            defaultColDef: { headerNameEditable: true },
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] - [cost]' },
            ],
        });

        showColumnMenu(api, 'revenue');
        await waitFor(() => expect(getOpenMenuEntries()).toContain('Edit Column Name'));
    });

    test('dynamically created calculated column omits Edit Column Name', async () => {
        const api = createGrid('calculated-menu-dynamic-edit-column-name', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            defaultColDef: { headerNameEditable: true },
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        showColumnMenu(api, 'revenue');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => setExpression('[Revenue] - [Cost]'));
        clickDialogButton('Apply');

        // defaultColDef.headerNameEditable merges onto the modal-generated calc colDef, so the inline
        // rename item is eligible here and its absence proves suppression rather than ineligibility.
        await waitFor(() => expect(api.getColumn('calculated_1')!.getColDef().headerNameEditable).toBe(true));

        showColumnMenu(api, 'calculated_1');
        const entries = await waitFor(() => {
            const result = getOpenMenuEntries();
            expect(result).toEqual(expect.arrayContaining(['Edit Calculated Column', 'Remove Calculated Column']));
            return result;
        });
        expect(entries).not.toContain('Edit Column Name');
    });

    test('explicit mainMenuItems editColumnName is still suppressed on a calculated column', async () => {
        const api = createGrid('calculated-menu-explicit-edit-column-name', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            defaultColDef: { headerNameEditable: true },
            columnDefs: [
                // Same explicit opt-in on a non-calc column: positive control that the token is honoured.
                { field: 'revenue', mainMenuItems: ['editColumnName', { name: 'Sentinel', action: () => {} }] },
                { field: 'cost' },
                {
                    colId: 'profit',
                    headerName: 'Profit',
                    calculatedExpression: '[revenue] - [cost]',
                    // Opting in explicitly must not override the default of hiding the inline rename on
                    // a calculated column — the modal remains the single source of truth for its name.
                    // The custom 'Sentinel' item keeps the menu non-empty so its absence proves suppression.
                    mainMenuItems: ['editColumnName', { name: 'Sentinel', action: () => {} }],
                },
            ],
        });

        showColumnMenu(api, 'profit');
        const profitEntries = await waitFor(() => {
            const result = getOpenMenuEntries();
            expect(result).toContain('Sentinel');
            return result;
        });
        // The menu opened (has the sibling item) but the explicitly-requested rename is gone.
        expect(profitEntries).not.toContain('Edit Column Name');

        // Close the calc-column menu before opening the next — showColumnMenu no-ops while a menu is
        // open, so getOpenMenuEntries would otherwise still read the profit menu.
        api.hidePopupMenu();
        await waitFor(() => expect(document.querySelector('.ag-menu')).toBeFalsy());

        // Positive control: the same explicit opt-in on a non-calc column does surface the item.
        showColumnMenu(api, 'revenue');
        await waitFor(() => expect(getOpenMenuEntries()).toContain('Edit Column Name'));
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
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getCalculatedColumnDialog());

        getCalculatedColumnDialog()
            .querySelector<HTMLElement>('.ag-select .ag-picker-field-wrapper')!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        await waitFor(() => expect(document.querySelectorAll<HTMLElement>('.ag-list-item').length).toBeGreaterThan(0));
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
        // Suppress only the diagnostic this test asserts on; any other diagnostic still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [304] });
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
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getCalculatedColumnDialog());

        getCalculatedColumnDialog()
            .querySelector<HTMLElement>('.ag-select .ag-picker-field-wrapper')!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        await waitFor(() => expect(document.querySelectorAll<HTMLElement>('.ag-list-item').length).toBeGreaterThan(0));
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
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getExpressionInput());

        const dialog = getCalculatedColumnDialog();
        expect(getDialogButton('Columns')).toBeVisible();
        expect(getDialogButton('Functions')).toHaveClass('ag-hidden');
        expect(getDialogButton('Operators')).toHaveClass('ag-hidden');

        const input = getExpressionInput();
        input.value = '[Rev';
        input.setSelectionRange(input.value.length, input.value.length);
        input.dispatchEvent(new Event('input', { bubbles: true }));

        await waitFor(() => expect(getSuggestionLabels()).toEqual(expect.arrayContaining(['Revenue'])));
        expect(dialog).toBeTruthy();
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
            await clickMenuOption('Add Calculated Column');
            await waitFor(() => getExpressionInput());

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
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getExpressionInput());

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
        await waitFor(() => expect(api.getColumn('calculated_1')).toBeTruthy());

        await new GridRows(api, `dialog validates formula syntax and function names before apply final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:r1 revenue:10 calculated_1:7 cost:3
            `
        );
    });
});

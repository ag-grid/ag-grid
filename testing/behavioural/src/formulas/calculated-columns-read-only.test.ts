import { getByRole, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { asyncSetTimeout, clickMenuOption, getVisibleTooltips, waitForTooltips } from 'ag-test-utils';
import { vi } from 'vitest';

import type { ColDef, GridState } from 'ag-grid-community';
import { GridStateModule, LocaleModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';

import {
    clickDialogButton,
    createGrid,
    getCalculatedColumnDialog,
    getExpressionInput,
    getOpenMenuEntries,
    openEditDialogViaMenu,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
    updateCalculatedColumnDef,
} from './calculatedColumnsHarness';

describe('calculated columns - read-only definitions', () => {
    setupCalculatedColumnsSuite();
    beforeEach(() => ModuleRegistry.registerModules([GridStateModule, LocaleModule, ValidationModule]));

    const columnDefs: ColDef[] = [
        { field: 'revenue' },
        { field: 'cost' },
        {
            colId: 'profit',
            headerName: 'Profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
            calculatedColumnReadOnly: true,
        },
    ];
    const rowData = [{ id: 'r1', revenue: 10, cost: 3 }];
    const closeDialog = () => document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();

    test.each(['live', 'deferred'] as const)(
        'shows read-only, event-free definition fields in %s mode',
        async (applyMode) => {
            const onCalculatedEvent = vi.fn();
            const api = createGrid(`read-only-${applyMode}`, {
                calculatedColumns: { applyMode },
                columnDefs,
                rowData,
                onCalculatedColumnCreated: onCalculatedEvent,
                onCalculatedColumnExpressionChanged: onCalculatedEvent,
                onCalculatedColumnRemoved: onCalculatedEvent,
                onCalculatedColumnValidationStateChanged: onCalculatedEvent,
            });
            showColumnMenu(api, 'profit');
            await waitFor(() => expect(getOpenMenuEntries()).toContain('View Calculated Column'));
            expect(getOpenMenuEntries()).not.toContain('Edit Calculated Column');
            expect(getByRole(document.body, 'menuitem', { name: 'Remove Calculated Column' })).toHaveAttribute(
                'aria-disabled',
                'true'
            );
            await clickMenuOption('View Calculated Column');

            expect(getByRole(document.body, 'dialog', { name: 'View Calculated Column' })).toBeTruthy();
            const form = getCalculatedColumnDialog();
            expect(getByRole(form, 'textbox', { name: 'Title' })).toHaveFocus();
            for (const [label, value] of [
                ['Title', 'Profit'],
                ['Expression', '[Revenue] - [Cost]'],
            ]) {
                const input = getByRole(form, 'textbox', { name: label }) as HTMLInputElement | HTMLTextAreaElement;
                expect(input).toHaveValue(value);
                expect(input).toHaveAttribute('readonly');
                expect(input).toBeEnabled();
            }
            const type = getByRole(form, 'combobox', { name: 'Type' });
            expect(type).toHaveAttribute('aria-readonly', 'true');
            expect(type).toHaveTextContent('Number');
            await userEvent.click(type);
            expect(type).toHaveFocus();
            await userEvent.keyboard('{ArrowDown}{Enter}{Space}{Home}{End}');
            expect(type).toHaveAttribute('aria-expanded', 'false');
            expect(document.querySelector('.ag-select-list')).toBeNull();
            expect(type).toHaveTextContent('Number');
            expect(form.querySelector('.ag-calculated-column-expression-tools')).toHaveClass('ag-hidden');
            expect(form.querySelector('.ag-calculated-column-actions')).toHaveClass('ag-hidden');
            expect(getExpressionInput()).not.toHaveAttribute('aria-autocomplete');
            getExpressionInput().dispatchEvent(new MouseEvent('click', { bubbles: true }));
            expect(document.querySelector('.ag-autocomplete-list-popup')).toBeNull();

            closeDialog();
            await asyncSetTimeout(0);
            expect(onCalculatedEvent).not.toHaveBeenCalled();
            expect(api.getState().userColumns).toBeUndefined();
            expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(7);
        }
    );

    test('custom menu tokens use the view label and context-menu removal is disabled', async () => {
        const api = createGrid('read-only-custom-menus', {
            columnDefs,
            rowData,
            getMainMenuItems: () => ['editCalculatedColumn', 'removeCalculatedColumn'],
            localeText: { calculatedColumnView: 'Inspect calculation' },
        });
        showColumnMenu(api, 'profit');
        await clickMenuOption('Inspect calculation');
        expect(getByRole(document.body, 'dialog', { name: 'Inspect calculation' })).toBeTruthy();
        closeDialog();

        api.showContextMenu({
            rowNode: api.getRowNode('r1'),
            column: api.getColumn('profit'),
            value: 7,
            source: 'api',
        });
        const remove = await waitFor(() => getByRole(document.body, 'menuitem', { name: 'Remove Calculated Column' }));
        expect(remove).toHaveAttribute('aria-disabled', 'true');
        remove.click();
        expect(api.getColumn('profit')).not.toBeNull();
    });

    test('a blocked expression explains its #REF! cells in the view dialog', async () => {
        const api = createGrid('read-only-blocked-expression', {
            columnDefs: [
                { field: 'revenue' },
                { field: 'salary' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue]', cellDataType: 'number' },
            ],
            rowData: [{ id: 'r1', revenue: 10, salary: 100 }],
            calculatedColumns: { isColumnReferenceable: ({ colDef }) => colDef.field !== 'salary' },
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Salary] * 2');
        expect(getExpressionInput().validationMessage).toContain('cannot be used');
        closeDialog();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe('#REF!');

        const state = api.getState();
        updateCalculatedColumnDef(api, 'profit', { calculatedColumnReadOnly: true });
        api.setState(state);
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe('#REF!');
        showColumnMenu(api, 'profit');
        await clickMenuOption('View Calculated Column');
        const input = getExpressionInput();
        expect(input).toHaveAttribute('readonly');
        expect(input).toHaveValue('[Salary] * 2');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveClass('invalid');
        expect(input).toHaveAccessibleDescription(/cannot be used/);
        await userEvent.hover(input);
        await waitForTooltips(1);
        expect(getVisibleTooltips()[0]).toHaveTextContent('cannot be used');
    });

    test.each(['live', 'deferred'] as const)(
        'custom validation errors are accessible in a %s view dialog without changing the column',
        async (applyMode) => {
            const messages = ['This expression is not permitted.', 'Choose a different source column.'];
            const onCalculatedEvent = vi.fn();
            const api = createGrid(`read-only-custom-validation-${applyMode}`, {
                columnDefs,
                rowData,
                calculatedColumns: { applyMode, getValidationErrors: () => messages },
                onCalculatedColumnCreated: onCalculatedEvent,
                onCalculatedColumnExpressionChanged: onCalculatedEvent,
                onCalculatedColumnRemoved: onCalculatedEvent,
                onCalculatedColumnValidationStateChanged: onCalculatedEvent,
            });
            showColumnMenu(api, 'profit');
            await clickMenuOption('View Calculated Column');
            const input = getExpressionInput();
            expect(input).toHaveAttribute('readonly');
            expect(input).not.toHaveAttribute('aria-autocomplete');
            expect(input).toHaveAttribute('aria-invalid', 'true');
            expect(input).toHaveAccessibleDescription(messages.join('\n'));
            const description = document.getElementById(input.getAttribute('aria-describedby')!);
            expect(description).toHaveAttribute('aria-live', 'polite');
            closeDialog();
            await asyncSetTimeout(0);
            expect(api.getState().userColumns).toBeUndefined();
            expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(7);
            expect(onCalculatedEvent).not.toHaveBeenCalled();
        }
    );

    test.each(['live', 'deferred'] as const)(
        'adding from a read-only column stays editable in %s mode, including after restore',
        async (applyMode) => {
            const api = createGrid(`read-only-add-${applyMode}`, {
                columnDefs,
                rowData,
                calculatedColumns: { applyMode },
                defaultColDef: { calculatedColumnReadOnly: true },
            });
            showColumnMenu(api, 'profit');
            await clickMenuOption('Add Calculated Column');
            expect(getExpressionInput()).not.toHaveAttribute('readonly');
            setExpression('[Revenue] * 2');
            if (applyMode === 'deferred') {
                clickDialogButton('Apply');
            } else {
                closeDialog();
            }
            expect(api.getColumn('calculated_1')!.getColDef().calculatedColumnReadOnly).toBe(false);
            const initialState: GridState = JSON.parse(JSON.stringify(api.getState()));
            const target = createGrid(`read-only-add-restored-${applyMode}`, {
                columnDefs,
                rowData,
                defaultColDef: { calculatedColumnReadOnly: true },
                initialState,
            });
            await waitFor(() => expect(target.getColumn('calculated_1')).not.toBeNull());
            expect(target.getColumn('calculated_1')!.getColDef().calculatedColumnReadOnly).toBe(false);
            await openEditDialogViaMenu(target, 'calculated_1');
            setExpression('[Revenue] * 3');
            closeDialog();
            expect(target.getCellValue({ rowNode: target.getRowNode('r1')!, colKey: 'calculated_1' })).toBe(30);
        }
    );

    test.each(['live', 'deferred'] as const)(
        'becoming read-only closes a %s edit and discards only uncommitted changes',
        async (applyMode) => {
            const api = createGrid(`read-only-transition-${applyMode}`, {
                columnDefs: columnDefs.map((colDef) => ({ ...colDef, calculatedColumnReadOnly: false })),
                rowData,
                calculatedColumns: { applyMode },
            });
            await openEditDialogViaMenu(api, 'profit');
            if (applyMode === 'live') {
                setExpression('[Revenue] * 2');
                await waitFor(() =>
                    expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[revenue] * 2')
                );
            }
            setExpression('[Revenue] * 3');
            updateCalculatedColumnDef(api, 'profit', { calculatedColumnReadOnly: true });
            expect(document.querySelector('.ag-calculated-column-form')).toBeNull();
            await asyncSetTimeout(0);
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe(
                applyMode === 'live' ? '[revenue] * 2' : '[revenue] - [cost]'
            );

            updateCalculatedColumnDef(api, 'profit', { calculatedColumnReadOnly: false });
            await openEditDialogViaMenu(api, 'profit');
            expect(getExpressionInput()).not.toHaveAttribute('readonly');
            closeDialog();
            showColumnMenu(api, 'profit');
            await clickMenuOption('Remove Calculated Column');
            expect(api.getColumn('profit')).toBeNull();
        }
    );

    test('application updates can change and remove read-only definitions', () => {
        const api = createGrid('read-only-programmatic', { columnDefs, rowData });
        updateCalculatedColumnDef(api, 'profit', { calculatedExpression: '[revenue] * 2', headerName: 'Updated' });
        expect(api.getColumn('profit')!.getColDef().calculatedColumnReadOnly).toBe(true);
        expect(api.getColumn('profit')!.getColDef().headerName).toBe('Updated');
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(20);
        api.setGridOption('columnDefs', columnDefs.slice(0, 2));
        expect(api.getColumn('profit')).toBeNull();
    });

    test('declared columns inherit read-only defaults and respond to default changes', async () => {
        const api = createGrid('read-only-default', {
            columnDefs: columnDefs.map(({ calculatedColumnReadOnly: _readOnly, ...colDef }) => colDef),
            defaultColDef: { calculatedColumnReadOnly: true },
            rowData,
        });
        showColumnMenu(api, 'profit');
        await clickMenuOption('View Calculated Column');
        expect(getByRole(document.body, 'dialog', { name: 'View Calculated Column' })).toBeTruthy();
        expect(getExpressionInput()).toHaveAttribute('readonly');

        api.setGridOption('defaultColDef', { calculatedColumnReadOnly: false });
        expect(document.querySelector('.ag-calculated-column-form')).toBeNull();
        await openEditDialogViaMenu(api, 'profit');
        expect(getExpressionInput()).not.toHaveAttribute('readonly');
    });

    test.each(['initialState', 'setState'] as const)('%s still restores earlier edits and removals', async (via) => {
        const source = createGrid(`read-only-state-source-${via}`, {
            columnDefs: columnDefs.map((colDef) => ({ ...colDef, calculatedColumnReadOnly: false })),
            rowData,
        });
        await openEditDialogViaMenu(source, 'profit');
        setExpression('[Revenue] * 2');
        closeDialog();
        const editedState = source.getState();
        showColumnMenu(source, 'profit');
        await clickMenuOption('Remove Calculated Column');
        const removedState = source.getState();

        for (const [name, state] of [
            ['edited', editedState],
            ['removed', removedState],
        ] as const) {
            const target = createGrid(`read-only-state-${via}-${name}`, {
                columnDefs,
                rowData,
                initialState: via === 'initialState' ? state : undefined,
            });
            if (via === 'setState') {
                target.setState(state);
            }
            if (name === 'removed') {
                await waitFor(() => expect(target.getColumn('profit')).toBeNull());
            } else {
                await waitFor(() =>
                    expect(target.getColumn('profit')!.getColDef().calculatedExpression).toBe('[revenue] * 2')
                );
                expect(target.getColumn('profit')!.getColDef().calculatedColumnReadOnly).toBe(true);
            }
        }
    });
});

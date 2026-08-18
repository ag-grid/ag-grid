import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { ALL_SEVERITIES, clickMenuOption } from 'ag-test-utils';
import { vi } from 'vitest';

import { enableDevValidations } from 'ag-grid-community';

import {
    clickDialogButton,
    createGrid,
    findColumnDef,
    getExpressionInput,
    openEditDialogViaMenu,
    removeColumnDef,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
} from './calculatedColumnsHarness';

describe('ag-grid calculated columns', () => {
    setupCalculatedColumnsSuite();

    test('calculated columns are always non-editable', async () => {
        // Suppress only the diagnostic this test asserts on; any other diagnostic still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [322] });
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
        // Suppress only the diagnostic this test asserts on; any other diagnostic still throws.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [322] });
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

        const gridDiv = document.querySelector('#calculated-column-classes')!;
        await waitFor(() =>
            expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).toHaveClass('ag-calculated-column')
        );
        expect(gridDiv.querySelector('[col-id="revenue"].ag-header-cell')).not.toHaveClass('ag-calculated-column');
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
        await clickMenuOption('Edit Calculated Column');
        await waitFor(() => expect(document.activeElement?.closest('.ag-dialog')).toBeTruthy());

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

        showColumnMenu(api, 'profit');
        await clickMenuOption('Edit Calculated Column');
        await waitFor(() => getExpressionInput());

        const gridDiv = document.querySelector('#calculated-column-highlight-toggle')!;
        const header = () => gridDiv.querySelector('[col-id="profit"].ag-header-cell');
        const cell = () => gridDiv.querySelector('[row-index="0"] [col-id="profit"]');

        // Highlighting is on by default, so an open edit dialog highlights the edited column.
        expect(header()).toHaveClass('ag-calculated-column-highlighted');
        expect(cell()).toHaveClass('ag-calculated-column-highlighted');

        // Suppressing it removes the highlight without closing the dialog.
        api.setGridOption('calculatedColumns', { suppressColumnHighlighting: true });
        await waitFor(() => expect(header()).not.toHaveClass('ag-calculated-column-highlighted'));
        expect(cell()).not.toHaveClass('ag-calculated-column-highlighted');

        api.setGridOption('calculatedColumns', { suppressColumnHighlighting: false });
        await waitFor(() => expect(header()).toHaveClass('ag-calculated-column-highlighted'));
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

        showColumnMenu(api, 'profit');
        await clickMenuOption('Edit Calculated Column');
        await waitFor(() => getExpressionInput());

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

        showColumnMenu(api, 'revenue');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getExpressionInput());

        setExpression('[Revenue] - [Cost]');
        clickDialogButton('Apply');
        await waitFor(() =>
            expect(findColumnDef(api.getColumnDefs()!, 'calculated_1')?.calculatedExpression).toBeTruthy()
        );

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

        await openEditDialogViaMenu(api, 'profit');
        await openEditDialogViaMenu(api, 'margin');

        const gridDiv = document.querySelector('#calculated-column-multi-highlight')!;
        await waitFor(() =>
            expect(gridDiv.querySelector('[col-id="margin"].ag-header-cell')).toHaveClass(
                'ag-calculated-column-highlighted'
            )
        );
        expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).toHaveClass(
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

        await waitFor(() =>
            expect(gridDiv.querySelector('[col-id="profit"].ag-header-cell')).not.toHaveClass(
                'ag-calculated-column-highlighted'
            )
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

        showColumnMenu(api, 'revenue');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getExpressionInput());
        showColumnMenu(api, 'cost');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(2));

        const dialogs = Array.from(document.querySelectorAll<HTMLElement>('.ag-calculated-column-form'));
        expect(dialogs).toHaveLength(2);

        dialogs[0]
            .querySelector<HTMLElement>('.ag-select .ag-picker-field-wrapper')!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await waitFor(() => expect(document.querySelectorAll<HTMLElement>('.ag-list-item').length).toBeGreaterThan(0));
        const typeOption = Array.from(document.querySelectorAll<HTMLElement>('.ag-list-item')).find(
            (element) => element.textContent?.trim() === 'Text'
        );
        expect(typeOption).toBeTruthy();
        typeOption!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        let closeButton = document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button');
        expect(closeButton).toBeTruthy();
        closeButton!.click();
        await waitFor(() => expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(1));
        closeButton = document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button');
        expect(closeButton).toBeTruthy();
        closeButton!.click();
        await waitFor(() => expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(0));
    });

    test('removing a live calculated column closes its open dialog', async () => {
        const api = createGrid('calculated-column-remove-live-open-dialog', {
            calculatedColumns: true,
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
        });

        showColumnMenu(api, 'revenue');
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => expect(api.getColumn('calculated_1')).toBeTruthy());
        expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(1);

        showColumnMenu(api, 'calculated_1');
        await clickMenuOption('Remove Calculated Column');
        await waitFor(() => expect(api.getColumn('calculated_1')).toBeNull());

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

        await openEditDialogViaMenu(api, 'profit');

        expect(api.getColumn('profit')).toBeTruthy();
        expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(1);

        showColumnMenu(api, 'profit');
        await clickMenuOption('Remove Calculated Column');
        await waitFor(() => expect(api.getColumn('profit')).toBeNull());

        expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(0);
    });

    test('dropping a calculated column from columnDefs closes its open dialog', async () => {
        const api = createGrid('calculated-column-coldef-drop-open-dialog', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                { field: 'revenue' },
                { field: 'cost' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] - [cost]' },
            ],
        });

        await openEditDialogViaMenu(api, 'profit');
        expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(1);

        // The developer removing the column destroys it, so the dialog editing it cannot stay open —
        // same contract as removing it through the header menu.
        removeColumnDef(api, 'profit');
        await waitFor(() => expect(api.getColumn('profit')).toBeNull());

        expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(0);
    });
});

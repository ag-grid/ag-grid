import { queryByRole, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { onTestFinished, vi } from 'vitest';

import {
    clickDialogButton,
    createGrid,
    getCalculatedColumnDialog,
    getExpressionInput,
    setExpression,
    setupCalculatedColumnsSuite,
} from './calculatedColumnsHarness';

describe('calculated column dialog APIs', () => {
    setupCalculatedColumnsSuite();

    test.each(['live', 'deferred'] as const)('Add without a source appends in %s mode', async (applyMode) => {
        const onCalculatedColumnCreated = vi.fn();
        const api = createGrid('calculated-api-add', {
            calculatedColumns: { applyMode },
            columnDefs: [{ field: 'revenue' }, { field: 'cost' }],
            rowData: [{ id: 'r1', revenue: 10, cost: 4 }],
            onCalculatedColumnCreated,
        });
        const button = document.createElement('button');
        document.body.appendChild(button);
        onTestFinished(() => button.remove());
        button.focus();

        api.openAddCalculatedColumnDialog();
        expect(getCalculatedColumnDialog()).toBeInTheDocument();
        expect(getCalculatedColumnDialog().closest('.ag-dialog')).toContainElement(
            document.activeElement as HTMLElement
        );
        expect(!!api.getColumn('calculated_1')).toBe(applyMode === 'live');
        if (applyMode === 'live') {
            expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe('');
        }
        setExpression('[Revenue] - [Cost]');
        if (applyMode === 'deferred') {
            clickDialogButton('Apply');
        } else {
            document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
        }

        expect(document.querySelector('.ag-calculated-column-form')).toBeNull();
        expect(api.getAllDisplayedColumns().map((column) => column.getColId())).toEqual([
            'revenue',
            'cost',
            'calculated_1',
        ]);
        expect(api.getColumn('calculated_1')!.getColDef().calculatedExpression).toBe('[revenue] - [cost]');
        await waitFor(() => expect(onCalculatedColumnCreated).toHaveBeenCalledTimes(1));
    });

    test.each(['id', 'column', 'colDef'] as const)('Add accepts a source %s inside a group', (keyType) => {
        const api = createGrid('calculated-api-source', {
            calculatedColumns: { applyMode: 'deferred' },
            columnDefs: [
                {
                    groupId: 'sales',
                    children: [{ field: 'revenue', columnGroupShow: 'open' }, { field: 'cost' }],
                },
            ],
            rowData: [{ id: 'r1', revenue: 10, cost: 4 }],
        });
        api.setColumnGroupOpened('sales', true);
        const column = api.getColumn('revenue')!;
        const keys = { id: 'revenue', column, colDef: column.getColDef() };
        api.openAddCalculatedColumnDialog(keys[keyType]);
        setExpression('[Revenue]');
        clickDialogButton('Apply');

        const added = api.getColumn('calculated_1')!;
        expect(api.getAllDisplayedColumns().map((col) => col.getColId())).toEqual(['revenue', 'calculated_1', 'cost']);
        expect(added.getOriginalParent()!.getGroupId()).toBe('sales');
        expect(added.getColDef().columnGroupShow).toBe('open');
    });

    test('Add accepts an auto group column as its source', () => {
        const api = createGrid('calculated-api-auto-source', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'revenue' }],
            rowData: [{ id: 'r1', country: 'UK', revenue: 10 }],
        });
        api.openAddCalculatedColumnDialog('ag-Grid-AutoColumn');
        expect(api.getAllDisplayedColumns().map((col) => col.getColId())).toEqual([
            'ag-Grid-AutoColumn',
            'calculated_1',
            'revenue',
        ]);
    });

    test.each(['live', 'deferred'] as const)('Edit focuses and reuses the dialog in %s mode', async (applyMode) => {
        const api = createGrid('calculated-api-edit', {
            calculatedColumns: { applyMode },
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue]' }],
            rowData: [{ id: 'r1', revenue: 10 }],
        });
        const button = document.createElement('button');
        document.body.appendChild(button);
        onTestFinished(() => button.remove());
        button.focus();
        api.openCalculatedColumnDialog('profit');
        const dialog = getCalculatedColumnDialog();
        expect(dialog.closest('.ag-dialog')).toContainElement(document.activeElement as HTMLElement);
        button.focus();
        const column = api.getColumn('profit')!;
        api.openCalculatedColumnDialog(column);
        api.openCalculatedColumnDialog(column.getColDef());
        expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(1);
        expect(getCalculatedColumnDialog()).toBe(dialog);
        expect(dialog.closest('.ag-dialog')).toContainElement(document.activeElement as HTMLElement);
        expect(getExpressionInput().value).toBe('[Revenue]');
        setExpression('[Revenue] * 2');
        if (applyMode === 'deferred') {
            clickDialogButton('Apply');
        }
        await waitFor(() => expect(column.getColDef().calculatedExpression).toBe('[revenue] * 2'));
    });

    test('Edit opens read-only columns in view mode, including in pivot mode', () => {
        const api = createGrid('calculated-api-view', {
            pivotMode: true,
            columnDefs: [
                { field: 'revenue' },
                { colId: 'profit', calculatedExpression: '[revenue]', calculatedColumnReadOnly: true },
            ],
        });
        api.openCalculatedColumnDialog('profit');
        expect(getExpressionInput()).toHaveAttribute('readonly');
        expect(getCalculatedColumnDialog().closest('.ag-dialog')).toContainElement(
            document.activeElement as HTMLElement
        );
        expect(queryByRole(getCalculatedColumnDialog(), 'button', { name: 'Apply' })).toBeNull();
    });

    test.each([false, true])('reopening a dialog brings it forward (read-only: %s)', (calculatedColumnReadOnly) => {
        const api = createGrid('calculated-api-dialog-front', {
            columnDefs: [
                { field: 'revenue' },
                { colId: 'profit', calculatedExpression: '[revenue]', calculatedColumnReadOnly },
                { colId: 'margin', calculatedExpression: '[revenue] * 2' },
            ],
        });
        api.openCalculatedColumnDialog('profit');
        const first = getCalculatedColumnDialog().closest('.ag-dialog')!;
        api.openCalculatedColumnDialog('margin');
        const second = Array.from(document.querySelectorAll('.ag-dialog')).find((dialog) => dialog !== first)!;
        expect(second).toContainElement(document.activeElement as HTMLElement);
        expect(Array.from(document.querySelectorAll('.ag-dialog')).at(-1)).toBe(second);

        api.openCalculatedColumnDialog('profit');
        expect(document.querySelectorAll('.ag-dialog')).toHaveLength(2);
        expect(first).toContainElement(document.activeElement as HTMLElement);
        expect(Array.from(document.querySelectorAll('.ag-dialog')).at(-1)).toBe(first);
    });

    test.each(['live', 'deferred'] as const)('repeated Add calls focus separate dialogs in %s mode', (applyMode) => {
        const api = createGrid('calculated-api-multiple-add', {
            calculatedColumns: { applyMode },
            columnDefs: [{ field: 'revenue' }],
        });
        api.openAddCalculatedColumnDialog();
        const first = getCalculatedColumnDialog().closest('.ag-dialog')!;
        api.openAddCalculatedColumnDialog();
        const dialogs = Array.from(document.querySelectorAll('.ag-dialog'));
        expect(dialogs).toHaveLength(2);
        expect(dialogs.find((dialog) => dialog !== first)).toContainElement(document.activeElement as HTMLElement);
        expect(api.getColumns()!.map((column) => column.getColId())).toEqual(
            applyMode === 'live' ? ['revenue', 'calculated_1', 'calculated_2'] : ['revenue']
        );
    });

    test.each([true, false])('invalid keys never open Add or Edit (enabled: %s)', (calculatedColumns) => {
        const api = createGrid('calculated-api-invalid', {
            calculatedColumns,
            columnDefs: [{ field: 'revenue' }],
        });
        api.openCalculatedColumnDialog('missing');
        api.openCalculatedColumnDialog('revenue');
        api.openAddCalculatedColumnDialog('missing');
        if (!calculatedColumns) {
            api.openAddCalculatedColumnDialog();
            api.openAddCalculatedColumnDialog('revenue');
        }
        expect(document.querySelector('.ag-calculated-column-form')).toBeNull();
        expect(api.getColumns()!.map((column) => column.getColId())).toEqual(['revenue']);
    });

    test('Add ignores non-primary source columns', () => {
        const api = createGrid('calculated-api-secondary-source', {
            columnDefs: [{ field: 'revenue' }],
            rowData: [{ id: 'r1', revenue: 10 }],
            rowSelection: { mode: 'multiRow', checkboxes: true },
        });
        const source = api.getColumn('ag-Grid-SelectionColumn')!;
        expect(source.isPrimary()).toBe(false);
        api.openAddCalculatedColumnDialog(source.getColId());
        api.openAddCalculatedColumnDialog(source);
        api.openAddCalculatedColumnDialog(source.getColDef());
        expect(document.querySelector('.ag-calculated-column-form')).toBeNull();
        expect(api.getColumn('calculated_1')).toBeNull();
    });

    test.each([false, true])('closing Edit/View focuses its header (read-only: %s)', (calculatedColumnReadOnly) => {
        const api = createGrid('calculated-api-close-focus', {
            rowData: [{ id: 'r1', revenue: 10 }],
            columnDefs: [
                { field: 'revenue' },
                { colId: 'profit', calculatedExpression: '[revenue]', calculatedColumnReadOnly },
            ],
        });
        api.openCalculatedColumnDialog('profit');
        document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
        expect(document.querySelector('.ag-header-cell[col-id="profit"]')).toHaveFocus();
    });

    test.each(['live', 'deferred'] as const)(
        'closing a created %s column focuses its header, not its source',
        (applyMode) => {
            const api = createGrid('calculated-api-add-close-focus', {
                rowData: [{ id: 'r1', revenue: 10 }],
                calculatedColumns: { applyMode },
                columnDefs: [{ field: 'revenue' }],
            });
            api.openAddCalculatedColumnDialog('revenue');
            if (applyMode === 'deferred') {
                setExpression('[Revenue]');
                clickDialogButton('Apply');
            } else {
                document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
            }
            expect(document.querySelector('.ag-header-cell[col-id="calculated_1"]')).toHaveFocus();
        }
    );

    test('cancelling a deferred Add focuses the source header', () => {
        const api = createGrid('calculated-api-cancel-focus', {
            rowData: [{ id: 'r1', revenue: 10 }],
            calculatedColumns: { applyMode: 'deferred' },
            columnDefs: [{ field: 'revenue' }],
        });
        api.openAddCalculatedColumnDialog('revenue');
        clickDialogButton('Cancel');
        expect(api.getColumn('calculated_1')).toBeNull();
        expect(document.querySelector('.ag-header-cell[col-id="revenue"]')).toHaveFocus();
    });

    test('closing a dialog does not steal focus from another dialog', () => {
        const api = createGrid('calculated-api-close-preserves-focus', {
            columnDefs: [
                { colId: 'profit', calculatedExpression: '1' },
                { colId: 'margin', calculatedExpression: '2' },
            ],
        });
        api.openCalculatedColumnDialog('profit');
        const firstClose = document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!;
        api.openCalculatedColumnDialog('margin');
        const focused = document.activeElement;
        firstClose.click();
        expect(document.activeElement).toBe(focused);
        expect(document.querySelectorAll('.ag-dialog')).toHaveLength(1);
        api.destroy();
        expect(document.querySelector('.ag-dialog')).toBeNull();
    });

    test('Add is unavailable in pivot mode with or without a source', () => {
        const api = createGrid('calculated-api-pivot', {
            pivotMode: true,
            columnDefs: [{ field: 'revenue' }],
        });
        api.openAddCalculatedColumnDialog();
        api.openAddCalculatedColumnDialog('revenue');
        expect(document.querySelector('.ag-calculated-column-form')).toBeNull();
        expect(api.getColumns()!.map((column) => column.getColId())).toEqual(['revenue']);
    });
});

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
        expect(document.activeElement).toBe(button);
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

    test.each(['live', 'deferred'] as const)(
        'Edit reuses the dialog without moving focus in %s mode',
        async (applyMode) => {
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
            const column = api.getColumn('profit')!;
            api.openCalculatedColumnDialog(column);
            api.openCalculatedColumnDialog(column.getColDef());
            expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(1);
            expect(getCalculatedColumnDialog()).toBe(dialog);
            expect(document.activeElement).toBe(button);
            expect(getExpressionInput().value).toBe('[Revenue]');
            setExpression('[Revenue] * 2');
            if (applyMode === 'deferred') {
                clickDialogButton('Apply');
            }
            await waitFor(() => expect(column.getColDef().calculatedExpression).toBe('[revenue] * 2'));
        }
    );

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
        expect(queryByRole(getCalculatedColumnDialog(), 'button', { name: 'Apply' })).toBeNull();
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

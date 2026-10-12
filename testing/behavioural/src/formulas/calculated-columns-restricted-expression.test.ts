import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { clickMenuOption } from 'ag-test-utils';

import type { CalculatedColumnsOptions, ColDef, GridState } from 'ag-grid-community';
import { GridStateModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';

import {
    clickDialogButton,
    createGrid,
    getCalculatedColumnDialog,
    getDialogButton,
    getExpressionInput,
    openEditDialogViaMenu,
    selectDataType,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
    updateCalculatedColumnDef,
} from './calculatedColumnsHarness';

describe('calculated columns - blocked live expressions', () => {
    setupCalculatedColumnsSuite();
    beforeEach(() => ModuleRegistry.registerModules([GridStateModule, ValidationModule]));

    const columnDefs: ColDef[] = [
        { field: 'sales' },
        { field: 'salary', colId: 'server-salary', headerName: 'Salary' },
    ];
    const rowData = [{ id: 'r1', sales: 20, salary: 100 }];
    const calculatedColumns: CalculatedColumnsOptions = {
        isColumnReferenceable: ({ colDef }) => colDef.field !== 'salary',
    };
    const closeDialog = () => document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();

    test.each([
        { expression: '[Salary]', progressively: false },
        { expression: '[Salary]', progressively: true },
        { expression: '[Salary] - 1', progressively: false },
        { expression: '[Salary] - 1', progressively: true },
        { expression: '[Sales] + [Salary] - 1', progressively: false },
        { expression: '[Sales] + [Salary] - 1', progressively: true },
    ])('preserves $expression (progressively: $progressively)', async ({ expression, progressively }) => {
        const api = createGrid('blocked-live-expression', { columnDefs, rowData, calculatedColumns });
        showColumnMenu(api, 'sales');
        await clickMenuOption('Add Calculated Column');
        if (progressively) {
            const partial = expression.slice(0, expression.indexOf('[Salary]') + '[Salary'.length);
            setExpression(partial);
            await waitFor(() =>
                expect(api.getColumn('calculated_1')!.getColDef().calculatedExpression).toBe(
                    partial.replace('[Sales]', '[sales]')
                )
            );
        }
        setExpression(expression);
        expect(getExpressionInput().validationMessage).toContain('cannot be used');
        closeDialog();
        const stored = expression.replace('[Sales]', '[sales]').replace('[Salary]', '[server-salary]');
        expect(api.getColumn('calculated_1')!.getColDef().calculatedExpression).toBe(stored);
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe('#REF!');
        api.refreshFormulas();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe('#REF!');
        await openEditDialogViaMenu(api, 'calculated_1');
        expect(getExpressionInput().value).toBe(expression);
        expect(getExpressionInput().validationMessage).toContain('cannot be used');
        const title = getCalculatedColumnDialog().querySelector('input')!;
        title.value = 'Reward';
        title.dispatchEvent(new Event('input', { bubbles: true }));
        await selectDataType('Number');
        closeDialog();
        expect(api.getColumn('calculated_1')!.getColDef()).toMatchObject({
            headerName: 'Reward',
            cellDataType: 'number',
            calculatedExpression: stored,
        });
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe('#REF!');
        await openEditDialogViaMenu(api, 'calculated_1');
        setExpression('[Sales] - 1');
        expect(getExpressionInput()).not.toHaveClass('invalid');
        closeDialog();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe(19);
    });

    test('blocks dependent calculations without restricting programmatic expressions', async () => {
        const api = createGrid('blocked-dependency', {
            columnDefs: [
                ...columnDefs,
                { colId: 'profit', calculatedExpression: '[sales]' },
                { colId: 'dependent', calculatedExpression: '[profit] * 2' },
                { colId: 'programmatic', calculatedExpression: '[server-salary]' },
            ],
            rowData,
            calculatedColumns,
        });
        const rowNode = api.getRowNode('r1')!;
        expect(api.getCellValue({ rowNode, colKey: 'dependent' })).toBe(40);
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Salary] - 1');
        closeDialog();
        expect(api.getCellValue({ rowNode, colKey: 'dependent' })).toBe('#REF!');
        expect(api.getCellValue({ rowNode, colKey: 'programmatic' })).toBe(100);
        updateCalculatedColumnDef(api, 'profit', { calculatedExpression: '[server-salary] - 2' });
        expect(api.getCellValue({ rowNode, colKey: 'profit' })).toBe(98);
        expect(api.getCellValue({ rowNode, colKey: 'dependent' })).toBe(196);
    });

    test('a blocked live expression cannot be accepted unchanged in deferred mode', async () => {
        const api = createGrid('blocked-deferred-expression', {
            columnDefs: [...columnDefs, { colId: 'profit', headerName: 'Profit', calculatedExpression: '[sales]' }],
            rowData,
            calculatedColumns,
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Salary] - 1');
        closeDialog();
        api.setGridOption('calculatedColumns', { ...calculatedColumns, applyMode: 'deferred' });
        await openEditDialogViaMenu(api, 'profit');
        expect(getExpressionInput().value).toBe('[Salary] - 1');
        expect(getExpressionInput().validationMessage).toBe('');
        clickDialogButton('Apply');
        expect(getExpressionInput().validationMessage).toContain('cannot be used');
        expect(getDialogButton('Apply')).toBeDisabled();
        setExpression('[Sales] - 1');
        expect(getExpressionInput().validationMessage).toBe('');
        expect(getDialogButton('Apply')).toBeEnabled();
        clickDialogButton('Apply');
        expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[sales] - 1');
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(19);
    });

    test('resetting and restoring a dynamic column retains its validation metadata', async () => {
        const api = createGrid('blocked-parked-column', { columnDefs, rowData, calculatedColumns });
        showColumnMenu(api, 'sales');
        await clickMenuOption('Add Calculated Column');
        setExpression('[Salary]');
        closeDialog();
        const savedColumnState = api.getColumnState();
        const savedUserColumns = api.getState().userColumns;
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe('#REF!');

        api.resetColumnState();
        expect(api.getColumn('calculated_1')).toBeNull();
        expect(api.getState().userColumns).toBeUndefined();

        api.applyColumnState({ state: savedColumnState, applyOrder: true });
        expect(api.getState().userColumns).toEqual(savedUserColumns);
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe('#REF!');
        expect(api.getColumn('calculated_1')!.getColDef()).not.toHaveProperty('calculatedExpressionError');
        await openEditDialogViaMenu(api, 'calculated_1');
        expect(getExpressionInput().value).toBe('[Salary]');
        expect(getExpressionInput().validationMessage).toContain('cannot be used');
    });

    test.each(['state', 'definitions'] as const)(
        'restores %s, preserving restrictions only in Grid State',
        async (via) => {
            const source = createGrid('blocked-source', { columnDefs, rowData, calculatedColumns });
            showColumnMenu(source, 'sales');
            await clickMenuOption('Add Calculated Column');
            setExpression('[Sales] + [Salary] - 1');
            closeDialog();
            await waitFor(() => expect(source.getState().userColumns).toBeDefined());
            const initialState: GridState = JSON.parse(JSON.stringify(source.getState()));
            const savedDefs: ColDef[] = JSON.parse(JSON.stringify(source.getColumnDefs()));
            expect(
                initialState.userColumns?.find(({ colId }) => colId === 'calculated_1')?.calculatedExpressionError
            ).toEqual({
                expression: '[sales] + [server-salary] - 1',
                reason: 'restrictedReference',
                reference: 'Salary',
            });
            expect(source.getColumn('calculated_1')!.getColDef()).not.toHaveProperty('calculatedExpressionError');
            expect(savedDefs.find(({ colId }) => colId === 'calculated_1')).not.toHaveProperty(
                'calculatedExpressionError'
            );
            source.destroy();
            const target = createGrid('blocked-target', {
                columnDefs: via === 'state' ? columnDefs : savedDefs,
                initialState: via === 'state' ? initialState : undefined,
                rowData,
                calculatedColumns,
            });
            expect(target.getCellValue({ rowNode: target.getRowNode('r1')!, colKey: 'calculated_1' })).toBe(
                via === 'state' ? '#REF!' : 119
            );
            await openEditDialogViaMenu(target, 'calculated_1');
            expect(getExpressionInput().value).toBe('[Sales] + [Salary] - 1');
            if (via === 'state') {
                expect(getExpressionInput().validationMessage).toContain('cannot be used');
            } else {
                expect(getExpressionInput().validationMessage).toBe('');
            }
            setExpression('[Sales] + 1');
            closeDialog();
            expect(target.getCellValue({ rowNode: target.getRowNode('r1')!, colKey: 'calculated_1' })).toBe(21);
            const correctedState: GridState = JSON.parse(JSON.stringify(target.getState()));
            target.destroy();
            const corrected = createGrid('corrected-target', {
                columnDefs: via === 'state' ? columnDefs : savedDefs,
                initialState: correctedState,
                rowData,
                calculatedColumns,
            });
            expect(corrected.getCellValue({ rowNode: corrected.getRowNode('r1')!, colKey: 'calculated_1' })).toBe(21);
        }
    );
});

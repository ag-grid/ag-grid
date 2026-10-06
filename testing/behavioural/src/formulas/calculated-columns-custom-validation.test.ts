import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { clickMenuOption } from 'ag-test-utils';
import { vi } from 'vitest';

import type { CalculatedColumnValidationParams, ColDef, GridState } from 'ag-grid-community';
import { GridStateModule, ModuleRegistry } from 'ag-grid-community';

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

describe('calculated columns - custom dialog validation', () => {
    setupCalculatedColumnsSuite();
    beforeEach(() => ModuleRegistry.registerModules([GridStateModule]));

    const columnDefs: ColDef[] = [
        { field: 'sales' },
        { field: 'salary', colId: 'server-salary', headerName: 'Salary', hide: true },
        { colId: 'profit', headerName: 'Profit', cellDataType: 'number', calculatedExpression: '[sales]' },
        { colId: 'dependent', calculatedExpression: '[profit] * 2' },
    ];
    const rowData = [{ id: 'r1', sales: 20, salary: 100 }];
    const messages = ['Salary cannot be used in this report.', 'Choose a sales-based expression.'];
    const validate = ({ referencedColumns }: CalculatedColumnValidationParams): string[] | null =>
        referencedColumns.some((column) => column.getColId() === 'server-salary') ? messages : null;
    const closeDialog = () => document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
    const setTitle = (value: string) => {
        const input = getCalculatedColumnDialog().querySelector('input')!;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    };

    test('deferred creation receives the draft and unique direct references, and displays all errors', async () => {
        const getValidationErrors = vi.fn(validate);
        const context = { report: 'sales' };
        const created = vi.fn();
        const api = createGrid('custom-validation-deferred', {
            columnDefs,
            rowData,
            context,
            calculatedColumns: { applyMode: 'deferred', getValidationErrors },
            onCalculatedColumnCreated: created,
        });
        showColumnMenu(api, 'sales');
        await clickMenuOption('Add Calculated Column');
        expect(getValidationErrors).not.toHaveBeenCalled();
        setTitle('Reward');
        await selectDataType('Number');
        setExpression('[Salary] + [Sales] + [Salary]');
        const params = getValidationErrors.mock.lastCall![0];
        expect(params.api).toBe(api);
        expect(params.context).toBe(context);
        expect(params.column).toBeNull();
        expect(params.displayExpression).toBe('[Salary] + [Sales] + [Salary]');
        expect(params.colDef).toMatchObject({
            colId: 'calculated_1',
            headerName: 'Reward',
            cellDataType: 'number',
            calculatedExpression: '[server-salary] + [sales] + [server-salary]',
        });
        expect(params.referencedColumns.map((column) => column.getColId())).toEqual(['server-salary', 'sales']);
        expect(getExpressionInput()).toHaveAttribute('aria-invalid', 'true');
        expect(getExpressionInput().validationMessage).toBe(messages.join('\n'));
        const description = document.getElementById(getExpressionInput().getAttribute('aria-describedby')!);
        expect(description?.textContent).toBe(messages.join('\n'));
        expect(description).toHaveAttribute('aria-live', 'polite');
        expect(getDialogButton('Apply')).toBeDisabled();
        expect(api.getColumn('calculated_1')).toBeNull();
        expect(created).not.toHaveBeenCalled();

        setExpression('[Sales] + 1');
        expect(getExpressionInput()).not.toHaveClass('invalid');
        expect(getExpressionInput()).not.toHaveAttribute('aria-describedby');
        expect(getDialogButton('Apply')).toBeEnabled();
        clickDialogButton('Apply');
        await waitFor(() => expect(created).toHaveBeenCalledTimes(1));
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe(21);
    });

    test.each(['live', 'deferred'] as const)('built-in checks take precedence in %s mode', async (applyMode) => {
        const getValidationErrors = vi.fn(() => null);
        const api = createGrid('custom-validation-built-in', {
            columnDefs,
            rowData,
            calculatedColumns: {
                applyMode,
                getValidationErrors,
                isColumnReferenceable: ({ colDef }) => colDef.field !== 'salary',
            },
        });
        await openEditDialogViaMenu(api, 'profit');
        getValidationErrors.mockClear();
        for (const expression of ['', ' ', '[Missing]', '[Sales] +', 'NOT_A_FUNC([Sales])', '[Salary]']) {
            setExpression(expression);
        }
        expect(getValidationErrors).not.toHaveBeenCalled();
        expect(getExpressionInput().validationMessage).toContain('cannot be used');
        setExpression('"[Salary]" & [Sales]');
        expect(getValidationErrors).toHaveBeenCalledTimes(1);
    });

    test.each(['live', 'deferred'] as const)(
        'validates title, type and current context in %s mode',
        async (applyMode) => {
            const context = { allow: true };
            const getValidationErrors = vi.fn((params: CalculatedColumnValidationParams) => {
                const { colDef, context } = params;
                if (colDef.headerName === 'Forbidden' || colDef.cellDataType === 'text' || !context.allow) {
                    return ['This definition is not permitted.'];
                }
                return [];
            });
            const api = createGrid('custom-validation-fields', {
                columnDefs,
                rowData,
                context,
                calculatedColumns: { applyMode, getValidationErrors },
            });
            await openEditDialogViaMenu(api, 'profit');
            expect(getValidationErrors.mock.lastCall![0].column).toBe(api.getColumn('profit'));
            expect(getExpressionInput()).not.toHaveClass('invalid');
            setTitle('Forbidden');
            expect(getExpressionInput()).toHaveClass('invalid');
            setTitle('Profit');
            expect(getExpressionInput()).not.toHaveClass('invalid');
            await selectDataType('Text');
            expect(getExpressionInput()).toHaveClass('invalid');
            await selectDataType('Number');
            expect(getExpressionInput()).not.toHaveClass('invalid');
            context.allow = false;
            if (applyMode === 'deferred') {
                clickDialogButton('Apply');
                expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[sales]');
            } else {
                setExpression('[Sales] + 1');
            }
            expect(getExpressionInput().validationMessage).toBe('This definition is not permitted.');
        }
    );

    test('live rejection preserves the full expression and blocks dependent cells until corrected', async () => {
        const getValidationErrors = vi.fn(validate);
        const api = createGrid('custom-validation-live', {
            columnDefs,
            rowData,
            calculatedColumns: { getValidationErrors },
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Sales] + [Salary] - 1');
        closeDialog();
        const read = (colKey: string) => api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey });
        expect(read('profit')).toBe('#ERROR!');
        expect(read('dependent')).toBe('#ERROR!');
        expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[sales] + [server-salary] - 1');
        getValidationErrors.mockClear();
        api.refreshFormulas();
        api.applyColumnState({ state: [{ colId: 'profit', sort: 'asc' }] });
        expect(read('profit')).toBe('#ERROR!');
        expect(getValidationErrors).not.toHaveBeenCalled();
        await openEditDialogViaMenu(api, 'profit');
        expect(getExpressionInput().value).toBe('[Sales] + [Salary] - 1');
        expect(getExpressionInput().validationMessage).toBe(messages.join('\n'));
        setExpression('[Sales] + 1');
        closeDialog();
        expect(read('profit')).toBe(21);
        expect(read('dependent')).toBe(42);
    });

    test('live creation receives the new column and retains empty/incomplete input behaviour', async () => {
        const getValidationErrors = vi.fn(validate);
        const api = createGrid('custom-validation-live-create', {
            columnDefs,
            rowData,
            calculatedColumns: { getValidationErrors },
        });
        showColumnMenu(api, 'sales');
        await clickMenuOption('Add Calculated Column');
        expect(getValidationErrors).not.toHaveBeenCalled();
        setExpression('[Salary]');
        expect(getValidationErrors.mock.lastCall![0].column).toBe(api.getColumn('calculated_1'));
        closeDialog();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe('#ERROR!');
        await openEditDialogViaMenu(api, 'calculated_1');
        setExpression('[Sales] +');
        expect(getExpressionInput()).not.toHaveClass('invalid');
        closeDialog();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe('#PARSE!');
        await openEditDialogViaMenu(api, 'calculated_1');
        setExpression('');
        closeDialog();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe('');
    });

    test('programmatic definitions bypass custom validation and clear stale error markers', async () => {
        const getValidationErrors = vi.fn(validate);
        const api = createGrid('custom-validation-programmatic', {
            columnDefs,
            rowData,
            calculatedColumns: { getValidationErrors },
        });
        expect(getValidationErrors).not.toHaveBeenCalled();
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Salary]');
        closeDialog();
        getValidationErrors.mockClear();
        updateCalculatedColumnDef(api, 'profit', { calculatedExpression: '[server-salary] + 1' });
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(101);
        expect(getValidationErrors).not.toHaveBeenCalled();
    });

    test.each(['live', 'deferred'] as const)(
        'opening and closing a rejected draft in %s mode does not change an existing column',
        async (applyMode) => {
            const changed = vi.fn();
            const api = createGrid('custom-validation-open', {
                columnDefs,
                rowData,
                calculatedColumns: { applyMode, getValidationErrors: () => messages },
                onCalculatedColumnExpressionChanged: changed,
            });
            await openEditDialogViaMenu(api, 'profit');
            expect(getExpressionInput().validationMessage).toBe(messages.join('\n'));
            closeDialog();
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[sales]');
            expect(api.getColumn('profit')!.getColDef().calculatedExpressionError).toBeUndefined();
            expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(20);
            expect(changed).not.toHaveBeenCalled();
        }
    );

    test.each(['state', 'definitions'] as const)(
        'restores saved messages through %s without running callbacks',
        async (via) => {
            const source = createGrid('custom-validation-source', {
                columnDefs,
                rowData,
                calculatedColumns: { getValidationErrors: validate },
            });
            await openEditDialogViaMenu(source, 'profit');
            setExpression('[Salary]');
            closeDialog();
            await waitFor(() => expect(source.getState().userColumns).toBeDefined());
            const state: GridState = JSON.parse(JSON.stringify(source.getState()));
            const savedDefs: ColDef[] = JSON.parse(JSON.stringify(source.getColumnDefs()));
            source.destroy();
            const getValidationErrors = vi.fn(validate);
            const target = createGrid('custom-validation-target', {
                columnDefs: via === 'state' ? columnDefs : savedDefs,
                initialState: via === 'state' ? state : undefined,
                rowData,
                calculatedColumns: { getValidationErrors },
            });
            expect(target.getCellValue({ rowNode: target.getRowNode('r1')!, colKey: 'profit' })).toBe('#ERROR!');
            expect(getValidationErrors).not.toHaveBeenCalled();
            target.setGridOption('calculatedColumns', { applyMode: 'deferred' });
            await openEditDialogViaMenu(target, 'profit');
            expect(getExpressionInput().value).toBe('[Salary]');
            expect(getExpressionInput().validationMessage).toBe(messages.join('\n'));
            expect(getDialogButton('Apply')).toBeDisabled();
            setExpression('[Sales] + 1');
            clickDialogButton('Apply');
            expect(target.getCellValue({ rowNode: target.getRowNode('r1')!, colKey: 'profit' })).toBe(21);
        }
    );
});

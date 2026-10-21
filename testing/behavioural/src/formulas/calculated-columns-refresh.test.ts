import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, asyncSetTimeout, clickMenuOption } from 'ag-test-utils';
import { vi } from 'vitest';

import type {
    CalculatedColumnProcessColDefParams,
    CalculatedColumnValidationParams,
    ColDef,
    GridApi,
} from 'ag-grid-community';
import { enableDevValidations } from 'ag-grid-community';

import {
    createGrid,
    getDialogButton,
    getExpressionInput,
    getSuggestionLabels,
    openEditDialogViaMenu,
    selectDataType,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
} from './calculatedColumnsHarness';

describe('calculated columns - refreshCalculatedColumns', () => {
    setupCalculatedColumnsSuite();

    afterEach(() => vi.useRealTimers());

    const columnDefs: ColDef[] = [
        { field: 'sales' },
        { field: 'salary', colId: 'pay', headerName: 'Salary' },
        { colId: 'profit', calculatedExpression: '[pay] * 2', cellDataType: 'number' },
        { colId: 'dependent', calculatedExpression: '[profit] * 2' },
    ];
    const rowData = [{ id: 'r1', sales: 20, salary: 100 }];
    const value = (api: GridApi, colKey = 'profit') => api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey });

    test('revalidates selected columns and refreshes dependent cells without changing definitions', async () => {
        const context = { allowSalary: false };
        const changed = vi.fn();
        const getValidationErrors = vi.fn(({ referencedColumns, context }: CalculatedColumnValidationParams) =>
            !context.allowSalary && referencedColumns.some((column) => column.getColId() === 'pay')
                ? ['Salary cannot be used.']
                : null
        );
        const api = createGrid('refresh-calculated', {
            columnDefs,
            rowData,
            context,
            calculatedColumns: { getValidationErrors },
            onCalculatedColumnChanged: changed,
        });
        const originalDefs = api.getColumnDefs();
        expect(value(api, 'dependent')).toBe(400);

        api.refreshCalculatedColumns({ columns: ['profit', api.getColumn('profit')!, 'sales', 'missing'] });
        expect(getValidationErrors).toHaveBeenCalledTimes(1);
        expect(getValidationErrors.mock.lastCall![0]).toMatchObject({
            column: api.getColumn('profit'),
            sourceColumn: null,
            context,
            displayExpression: '[Salary] * 2',
        });
        expect(value(api)).toBe('#ERROR!');
        expect(value(api, 'dependent')).toBe('#ERROR!');
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
        expect(changed.mock.lastCall![0]).toMatchObject({
            source: 'api',
            expressionValidation: { valid: false, reason: 'customValidation' },
        });
        expect(changed.mock.lastCall![0].changes).toEqual({});

        context.allowSalary = true;
        api.refreshCalculatedColumns({ columns: ['profit'] });
        expect(value(api)).toBe(200);
        expect(value(api, 'dependent')).toBe(400);
        expect(document.querySelector('.ag-row[row-id="r1"] [col-id="dependent"]')?.textContent).toBe('400');
        expect(api.getState().userColumns).toBeUndefined();
        expect(api.getColumnDefs()).toEqual(originalDefs);
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(2));
        expect(changed.mock.lastCall![0].expressionValidation).toEqual({ valid: true });

        api.refreshCalculatedColumns({ columns: ['profit'] });
        await asyncSetTimeout(0);
        expect(changed).toHaveBeenCalledTimes(2);
    });

    test('refreshes all calculated columns, including read-only columns', () => {
        const getValidationErrors = vi.fn(() => ['Not permitted']);
        const api = createGrid('refresh-all-calculated', {
            columnDefs: columnDefs.map((colDef) => ({ ...colDef, calculatedColumnReadOnly: true })),
            rowData,
            calculatedColumns: { getValidationErrors },
        });
        api.refreshCalculatedColumns();
        expect(getValidationErrors).toHaveBeenCalledTimes(2);
        expect(value(api)).toBe('#ERROR!');
        expect(value(api, 'dependent')).toBe('#ERROR!');
        expect(api.getState().userColumns).toHaveLength(2);
    });

    test('explicitly rechecks reference restrictions, including previously grandfathered expressions', () => {
        let allowSalary = false;
        const api = createGrid('refresh-references', {
            columnDefs,
            rowData,
            calculatedColumns: {
                isColumnReferenceable: ({ column, sourceColumn, calculatedColumn }) => {
                    expect(sourceColumn).toBeNull();
                    expect(calculatedColumn).toBe(api.getColumn('profit'));
                    return allowSalary || column.getColId() !== 'pay';
                },
            },
        });
        expect(value(api)).toBe(200);
        api.refreshCalculatedColumns({ columns: ['profit'] });
        expect(value(api)).toBe('#REF!');
        allowSalary = true;
        api.refreshCalculatedColumns({ columns: ['profit'] });
        expect(value(api)).toBe(200);
        expect(api.getState().userColumns).toBeUndefined();
    });

    test.each(['customValidation', 'restrictedReference'] as const)(
        'clears saved %s errors when the rule is removed',
        (reason) => {
            const api = createGrid('refresh-removed-rule', {
                columnDefs,
                rowData,
                initialState: {
                    userColumns: [
                        {
                            colId: 'profit',
                            properties: [],
                            calculatedExpressionError:
                                reason === 'customValidation'
                                    ? { expression: '[pay] * 2', reason, messages: ['Not permitted'] }
                                    : { expression: '[pay] * 2', reason, reference: 'Salary' },
                        },
                    ],
                },
            });
            expect(value(api)).toBe(reason === 'customValidation' ? '#ERROR!' : '#REF!');
            api.refreshCalculatedColumns();
            expect(value(api)).toBe(200);
            expect(api.getState().userColumns).toBeUndefined();
        }
    );

    test('does not validate empty selections or disabled calculated columns', () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
        const getValidationErrors = vi.fn(() => ['Not permitted']);
        const api = createGrid('refresh-disabled', { columnDefs, rowData, calculatedColumns: { getValidationErrors } });
        api.refreshCalculatedColumns({ columns: [] });
        api.refreshCalculatedColumns({ columns: ['sales', 'missing'] });
        expect(getValidationErrors).not.toHaveBeenCalled();
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        api.setGridOption('calculatedColumns', false);
        api.refreshCalculatedColumns();
        expect(getValidationErrors).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    test('uses committed expressions without flushing a pending dialog edit', async () => {
        const getValidationErrors = vi.fn(({ colDef }: CalculatedColumnValidationParams) =>
            colDef.calculatedExpression === '[sales]' ? ['Sales is not permitted'] : null
        );
        const api = createGrid('refresh-pending', {
            columnDefs,
            rowData,
            calculatedColumns: { applyDebounce: 10000, getValidationErrors },
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Sales]');
        getValidationErrors.mockClear();
        api.refreshCalculatedColumns({ columns: ['profit'] });
        expect(getValidationErrors.mock.calls.map(([params]) => params.colDef.calculatedExpression)).toEqual([
            '[pay] * 2',
            '[sales]',
        ]);
        expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[pay] * 2');
        expect(value(api)).toBe(200);
        document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
        expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[sales]');
        expect(value(api)).toBe('#ERROR!');
    });

    test.each(['live', 'deferred'] as const)('refreshes open dialog restrictions in %s mode', async (applyMode) => {
        let allowSalary = false;
        const api = createGrid('refresh-open-restrictions', {
            columnDefs,
            rowData,
            calculatedColumns: {
                applyMode,
                isColumnReferenceable: ({ column }) => allowSalary || column.getColId() !== 'pay',
            },
        });
        api.refreshCalculatedColumns({ columns: ['profit'] });
        expect(value(api)).toBe('#REF!');
        await openEditDialogViaMenu(api, 'profit');
        getDialogButton('Columns').click();
        expect(getSuggestionLabels()).not.toContain('Salary');

        allowSalary = true;
        api.refreshCalculatedColumns({ columns: ['profit'] });
        expect(value(api)).toBe(200);
        expect(getExpressionInput().getAttribute('aria-invalid')).toBe('false');
        getDialogButton('Columns').click();
        expect(getSuggestionLabels()).toContain('Salary');
        await selectDataType('Text');
        if (applyMode === 'deferred') {
            expect(getDialogButton('Apply').disabled).toBe(false);
            getDialogButton('Apply').click();
        } else {
            document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
        }
        expect(value(api)).toBe(200);
        expect(
            api.getState().userColumns?.find(({ colId }) => colId === 'profit')?.calculatedExpressionError
        ).toBeUndefined();
    });

    test.each([false, true])(
        'refreshes deferred Add dialogs with existing calculated columns: %s',
        async (existingColumn) => {
            let allowSalary = true;
            const created = vi.fn();
            const changed = vi.fn();
            const api = createGrid('refresh-deferred-add', {
                columnDefs: columnDefs.slice(0, existingColumn ? 3 : 2),
                rowData,
                calculatedColumns: {
                    applyMode: 'deferred',
                    isColumnReferenceable: ({ column }) => allowSalary || column.getColId() !== 'pay',
                },
                onCalculatedColumnCreated: created,
                onCalculatedColumnChanged: changed,
            });
            showColumnMenu(api, 'sales');
            await clickMenuOption('Add Calculated Column');
            setExpression('[Salary] * 3');
            allowSalary = false;
            api.refreshCalculatedColumns({ columns: [] });
            expect(getDialogButton('Apply').disabled).toBe(false);

            api.refreshCalculatedColumns();
            expect(getDialogButton('Apply').disabled).toBe(true);
            expect(getExpressionInput().getAttribute('aria-invalid')).toBe('true');
            getDialogButton('Columns').click();
            expect(getSuggestionLabels()).not.toContain('Salary');
            getDialogButton('Apply').click();
            expect(api.getColumn('calculated_1')).toBeNull();
            await asyncSetTimeout(0);
            expect(created).not.toHaveBeenCalled();
            expect(changed.mock.calls.some(([event]) => event.column.getColId() === 'calculated_1')).toBe(false);

            allowSalary = true;
            api.refreshCalculatedColumns({ columns: ['profit'] });
            expect(getDialogButton('Apply').disabled).toBe(true);
            api.refreshCalculatedColumns();
            expect(getDialogButton('Apply').disabled).toBe(false);
            expect(getExpressionInput().value).toBe('[Salary] * 3');
            getDialogButton('Columns').click();
            expect(getSuggestionLabels()).toContain('Salary');
            expect(api.getColumn('calculated_1')).toBeNull();
            getDialogButton('Apply').click();
            expect(value(api, 'calculated_1')).toBe(300);
        }
    );

    test('refreshes deferred draft errors without applying the draft', async () => {
        let allowSalary = false;
        const api = createGrid('refresh-deferred-draft', {
            columnDefs: [
                { field: 'sales' },
                { field: 'salary', colId: 'pay' },
                { colId: 'profit', calculatedExpression: '[sales]' },
            ],
            rowData,
            calculatedColumns: {
                applyMode: 'deferred',
                getValidationErrors: ({ referencedColumns }) =>
                    !allowSalary && referencedColumns.some((column) => column.getColId() === 'pay')
                        ? ['Blocked']
                        : null,
            },
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Salary] * 3');
        expect(getDialogButton('Apply').disabled).toBe(true);
        allowSalary = true;
        api.refreshCalculatedColumns({ columns: ['profit'] });
        expect(getDialogButton('Apply').disabled).toBe(false);
        expect(getExpressionInput().getAttribute('aria-invalid')).toBe('false');
        expect(getExpressionInput().value).toBe('[Salary] * 3');
        expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[sales]');
        expect(value(api)).toBe(20);
        getDialogButton('Apply').click();
        expect(value(api)).toBe(300);
    });

    test.each([true, false])(
        'revalidates pending live edits without restarting their deadline (initially allowed: %s)',
        async (initiallyAllowed) => {
            let allowed = initiallyAllowed;
            const changed = vi.fn();
            const api = createGrid('refresh-pending-rule', {
                columnDefs,
                rowData,
                calculatedColumns: { applyDebounce: 400, getValidationErrors: () => (allowed ? null : ['Blocked']) },
                onCalculatedColumnChanged: changed,
            });
            await openEditDialogViaMenu(api, 'profit');
            await asyncSetTimeout(0);
            vi.useFakeTimers();
            setExpression('[Salary] * 3');
            await vi.advanceTimersByTimeAsync(200);
            allowed = !initiallyAllowed;
            api.refreshCalculatedColumns({ columns: ['profit'] });
            expect(getExpressionInput().getAttribute('aria-invalid')).toBe(String(!allowed));
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[pay] * 2');
            await vi.advanceTimersByTimeAsync(199);
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[pay] * 2');
            await vi.advanceTimersByTimeAsync(1);
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[pay] * 3');
            expect(value(api)).toBe(allowed ? 300 : '#ERROR!');
            await vi.advanceTimersByTimeAsync(1);
            expect(changed.mock.lastCall![0].expressionValidation.valid).toBe(allowed);
        }
    );

    test.each([0, 10000])(
        'closing a dialog flushes refreshed validation with applyDebounce %s',
        async (applyDebounce) => {
            let allowed = true;
            const api = createGrid('refresh-pending-close', {
                columnDefs,
                rowData,
                calculatedColumns: { applyDebounce, getValidationErrors: () => (allowed ? null : ['Blocked']) },
            });
            await openEditDialogViaMenu(api, 'profit');
            setExpression('[Salary] * 3');
            allowed = false;
            api.refreshCalculatedColumns({ columns: ['profit'] });
            document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[pay] * 3');
            expect(value(api)).toBe('#ERROR!');
        }
    );

    test('refreshes read-only dialog feedback without scheduling an edit', async () => {
        let allowed = false;
        const changed = vi.fn();
        const api = createGrid('refresh-view-feedback', {
            columnDefs: columnDefs.map((colDef) => ({ ...colDef, calculatedColumnReadOnly: true })),
            rowData,
            calculatedColumns: { getValidationErrors: () => (allowed ? null : ['Blocked']) },
            onCalculatedColumnChanged: changed,
        });
        api.refreshCalculatedColumns({ columns: ['profit'] });
        showColumnMenu(api, 'profit');
        await clickMenuOption('View Calculated Column');
        expect(getExpressionInput().getAttribute('aria-invalid')).toBe('true');
        allowed = true;
        api.refreshCalculatedColumns({ columns: ['profit'] });
        expect(getExpressionInput().getAttribute('aria-invalid')).toBe('false');
        expect(value(api)).toBe(200);
        document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
        await asyncSetTimeout(0);
        expect(changed.mock.calls.every(([event]) => event.source === 'api')).toBe(true);
    });

    test('allows empty committed expressions even when the dialog uses deferred apply', () => {
        const api = createGrid('refresh-empty', {
            columnDefs: [{ colId: 'profit', calculatedExpression: '' }],
            rowData,
            calculatedColumns: { applyMode: 'deferred', getValidationErrors: ({ internalErrors }) => internalErrors },
        });
        api.refreshCalculatedColumns();
        expect(value(api)).toBe('');
        expect(api.getState().userColumns).toBeUndefined();
    });

    test('preserves authored dynamic definitions and exposes refreshed errors to processColDef', () => {
        const processColDef = vi.fn(({ colDef }: CalculatedColumnProcessColDefParams) => ({
            ...colDef,
            headerName: `${colDef.headerName} (processed)`,
            calculatedExpression: `(${colDef.calculatedExpression})`,
        }));
        const api = createGrid('refresh-dynamic', {
            columnDefs: columnDefs.slice(0, 2),
            rowData,
            initialState: {
                userColumns: [
                    {
                        colId: 'profit',
                        created: true,
                        parentGroupId: null,
                        properties: [
                            { property: 'headerName', value: 'Bonus' },
                            { property: 'calculatedExpression', value: '[pay] * 2' },
                        ],
                    },
                ],
            },
            calculatedColumns: { processColDef, getValidationErrors: () => ['Not permitted'] },
        });
        const properties = api.getState().userColumns![0].properties;
        api.refreshCalculatedColumns();
        expect(value(api)).toBe('#ERROR!');
        expect(processColDef.mock.lastCall![0]).toMatchObject({
            expressionValidation: { valid: false, reason: 'customValidation' },
        });
        expect(api.getState().userColumns![0].properties).toEqual(properties);
        expect(api.getColumn('profit')!.getColDef().headerName).toBe('Bonus (processed)');
    });

    test('recalculates values even when validation is unchanged', () => {
        let multiplier = 2;
        const api = createGrid('refresh-values', {
            columnDefs: [
                { colId: 'sales', valueGetter: () => 20 * multiplier },
                { colId: 'profit', calculatedExpression: '[sales] + 1' },
            ],
            rowData,
        });
        expect(value(api)).toBe(41);
        multiplier = 3;
        api.refreshCalculatedColumns();
        expect(value(api)).toBe(61);
    });
});

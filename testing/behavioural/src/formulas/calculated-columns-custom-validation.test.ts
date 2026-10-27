import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { asyncSetTimeout, clickMenuOption } from 'ag-test-utils';
import { vi } from 'vitest';

import type {
    CalculatedColumnValidationErrors,
    CalculatedColumnValidationParams,
    CalculatedColumnsOptions,
    ColDef,
    GridState,
} from 'ag-grid-community';
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
    const validate = ({
        referencedColumns,
    }: CalculatedColumnValidationParams): CalculatedColumnValidationErrors | null =>
        referencedColumns.some((column) => column.getColId() === 'server-salary')
            ? { calculatedExpression: messages }
            : null;
    const closeDialog = () => document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
    const setTitle = (value: string) => {
        const input = getCalculatedColumnDialog().querySelector('input')!;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    };

    test('deferred validation reports each field independently and applies only a valid draft', async () => {
        const getValidationErrors = vi.fn(({ colDef, internalErrors }: CalculatedColumnValidationParams) => ({
            ...internalErrors,
            headerName:
                colDef.headerName === 'Forbidden'
                    ? ['Choose another title.', 'Titles must be reviewable.']
                    : internalErrors?.headerName,
            cellDataType: colDef.cellDataType !== 'number' ? ['Use Number.'] : [],
        }));
        const changed = vi.fn();
        const api = createGrid('custom-validation-form', {
            columnDefs,
            rowData,
            calculatedColumns: { applyMode: 'deferred', getValidationErrors },
            onCalculatedColumnChanged: changed,
        });
        await openEditDialogViaMenu(api, 'profit');
        expect(getValidationErrors).not.toHaveBeenCalled();
        const title = getCalculatedColumnDialog().querySelector('input')!;
        const type = getCalculatedColumnDialog().querySelector('.ag-picker-field-wrapper')!;
        setTitle('Forbidden');
        await selectDataType('Text');
        setExpression('[Unknown]');
        expect(title).toHaveAttribute('aria-invalid', 'true');
        expect(title).toHaveAccessibleDescription('Choose another title.\nTitles must be reviewable.');
        expect(type).toHaveAttribute('aria-invalid', 'true');
        expect(type).toHaveAccessibleDescription('Use Number.');
        expect(getExpressionInput()).toHaveAttribute('aria-invalid', 'true');
        expect(getDialogButton('Apply')).toBeDisabled();

        setTitle('');
        expect(getValidationErrors.mock.lastCall![0].internalErrors?.headerName).toEqual(['Enter a title']);
        expect(title).toHaveAccessibleDescription('Enter a title');
        setTitle('Reward');
        await selectDataType('Number');
        expect(title).toHaveAttribute('aria-invalid', 'false');
        expect(type).not.toHaveAttribute('aria-describedby');
        expect(getDialogButton('Apply')).toBeDisabled();
        setExpression('[Sales] * 2');
        expect(getDialogButton('Apply')).toBeEnabled();
        clickDialogButton('Apply');
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
        expect(api.getColumn('profit')!.getColDef().headerName).toBe('Reward');
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(40);
    });

    test.each([null, {}, { headerName: [], cellDataType: [], calculatedExpression: [] }])(
        'empty field messages reject a title until validation returns %j',
        async (accepted) => {
            let reject = true;
            const api = createGrid('custom-validation-empty-title-message', {
                columnDefs,
                rowData,
                calculatedColumns: {
                    applyMode: 'deferred',
                    getValidationErrors: () => (reject ? { headerName: [''] } : accepted),
                },
            });
            await openEditDialogViaMenu(api, 'profit');
            setTitle('Reward');
            const title = getCalculatedColumnDialog().querySelector('input')!;
            expect(title).toHaveAttribute('aria-invalid', 'true');
            expect(title).not.toHaveAttribute('aria-describedby');
            expect(getDialogButton('Apply')).toBeDisabled();
            reject = false;
            setTitle('Reward 2');
            expect(getDialogButton('Apply')).toBeEnabled();
            clickDialogButton('Apply');
            expect(api.getColumn('profit')!.getColDef().headerName).toBe('Reward 2');
        }
    );

    test('live title and type rejections keep committed values without invalidating the expression', async () => {
        const changed = vi.fn();
        const api = createGrid('custom-validation-live-fields', {
            columnDefs,
            rowData,
            calculatedColumns: {
                getValidationErrors: ({ colDef }) => ({
                    headerName: colDef.headerName === 'Forbidden' ? ['Choose another title.'] : [],
                    cellDataType: colDef.cellDataType === 'text' ? ['Use Number.'] : [],
                }),
            },
            onCalculatedColumnChanged: changed,
        });
        await openEditDialogViaMenu(api, 'profit');
        setTitle('Forbidden');
        await selectDataType('Text');
        setExpression('[Sales] * 2');
        closeDialog();
        expect(api.getColumn('profit')!.getColDef()).toMatchObject({
            headerName: 'Profit',
            cellDataType: 'number',
            calculatedExpression: '[sales] * 2',
        });
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(40);
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'dependent' })).toBe(80);
        await waitFor(() => expect(changed).toHaveBeenCalled());
        expect(changed.mock.lastCall![0]).toMatchObject({ expressionValidation: { valid: true } });
        expect(changed.mock.lastCall![0].changes).toEqual({
            calculatedExpression: { oldValue: '[sales]', newValue: '[sales] * 2' },
        });
        expect(JSON.stringify(api.getState().userColumns)).not.toContain('calculatedExpressionError');

        await openEditDialogViaMenu(api, 'profit');
        expect(getCalculatedColumnDialog().querySelector('input')).toHaveValue('Profit');
        setTitle('Reward');
        closeDialog();
        expect(api.getColumn('profit')!.getColDef().headerName).toBe('Reward');
    });

    test('live validation receives an empty title before the existing title fallback is applied', async () => {
        const getValidationErrors = vi.fn<NonNullable<CalculatedColumnsOptions['getValidationErrors']>>(() => null);
        const api = createGrid('custom-validation-raw-title', {
            columnDefs,
            rowData,
            calculatedColumns: { getValidationErrors },
        });
        await openEditDialogViaMenu(api, 'profit');
        setTitle('Renamed');
        await waitFor(() => expect(api.getColumn('profit')!.getColDef().headerName).toBe('Renamed'));
        setTitle('');
        expect(getValidationErrors.mock.lastCall![0].colDef.headerName).toBe('');
        expect(getCalculatedColumnDialog().querySelector('input')).toHaveValue('');
        closeDialog();
        expect(api.getColumn('profit')!.getColDef().headerName).toBe('Profit');
    });

    test('refresh reports title/type errors in an open dialog without modifying committed properties', async () => {
        let reject = false;
        const changed = vi.fn();
        const api = createGrid('custom-validation-refresh-fields', {
            columnDefs,
            rowData,
            calculatedColumns: {
                getValidationErrors: () =>
                    reject ? { headerName: ['Title rejected.'], cellDataType: ['Type rejected.'] } : null,
            },
            onCalculatedColumnChanged: changed,
        });
        await openEditDialogViaMenu(api, 'profit');
        reject = true;
        api.refreshCalculatedColumns();
        expect(getCalculatedColumnDialog().querySelector('input')).toHaveAccessibleDescription('Title rejected.');
        expect(getCalculatedColumnDialog().querySelector('.ag-picker-field-wrapper')).toHaveAccessibleDescription(
            'Type rejected.'
        );
        closeDialog();
        await asyncSetTimeout(0);
        expect(changed).not.toHaveBeenCalled();
        expect(api.getColumn('profit')!.getColDef()).toMatchObject({ headerName: 'Profit', cellDataType: 'number' });
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(20);
        expect(api.getState().userColumns).toBeUndefined();
    });

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
        expect(params.internalErrors).toBeNull();
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

    test.each(['live', 'deferred'] as const)(
        'supplies the source column only while adding in %s mode',
        async (applyMode) => {
            const getValidationErrors = vi.fn(({ column, sourceColumn, colDef }: CalculatedColumnValidationParams) => {
                const group = (column ?? sourceColumn)?.getParent()?.getGroupId();
                return group === 'sales' && colDef.cellDataType !== 'number'
                    ? { calculatedExpression: ['Sales columns must be Number.'] }
                    : null;
            });
            const api = createGrid('custom-validation-source-column', {
                columnDefs: [
                    {
                        headerName: 'Sales',
                        groupId: 'sales',
                        children: [{ field: 'revenue' }, { field: 'cost' }],
                    },
                    { headerName: 'People', groupId: 'people', children: [{ field: 'salary' }] },
                ],
                rowData: [{ id: 'r1', revenue: 100, cost: 60, salary: 50 }],
                calculatedColumns: { applyMode, getValidationErrors },
            });
            showColumnMenu(api, 'revenue');
            await clickMenuOption('Add Calculated Column');
            setExpression('[Revenue] - [Cost]');
            expect(getValidationErrors.mock.lastCall![0].sourceColumn).toBe(api.getColumn('revenue'));
            expect(getValidationErrors.mock.lastCall![0].column).toBe(
                applyMode === 'live' ? api.getColumn('calculated_1') : null
            );
            expect(getExpressionInput().validationMessage).toBe('Sales columns must be Number.');
            if (applyMode === 'deferred') {
                expect(getDialogButton('Apply')).toBeDisabled();
                expect(api.getColumn('calculated_1')).toBeNull();
            }

            await selectDataType('Number');
            expect(getExpressionInput()).not.toHaveClass('invalid');
            if (applyMode === 'deferred') {
                clickDialogButton('Apply');
                await waitFor(() => expect(document.activeElement?.getAttribute('col-id')).toBe('calculated_1'));
            } else {
                closeDialog();
            }
            expect(getValidationErrors.mock.lastCall![0].sourceColumn).toBe(api.getColumn('revenue'));
            expect(api.getColumn('calculated_1')!.getParent()!.getGroupId()).toBe('sales');
            expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe(40);

            await openEditDialogViaMenu(api, 'calculated_1');
            await selectDataType('Text');
            expect(getValidationErrors.mock.lastCall![0].sourceColumn).toBeNull();
            expect(getValidationErrors.mock.lastCall![0].column).toBe(api.getColumn('calculated_1'));
            expect(getExpressionInput().validationMessage).toBe('Sales columns must be Number.');
        }
    );

    test.each([null, { calculatedExpression: [] }])(
        'empty error messages block deferred Apply until validation returns %j',
        async (validResult) => {
            const api = createGrid('custom-validation-empty-message', {
                columnDefs,
                rowData,
                calculatedColumns: {
                    applyMode: 'deferred',
                    getValidationErrors: ({ referencedColumns }) =>
                        referencedColumns.some((column) => column.getColId() === 'server-salary')
                            ? { calculatedExpression: [''] }
                            : validResult,
                },
            });
            await openEditDialogViaMenu(api, 'profit');
            setExpression('[Salary] * 2');
            expect(getExpressionInput()).toHaveClass('invalid');
            expect(getExpressionInput()).toHaveAttribute('aria-invalid', 'true');
            expect(getExpressionInput()).not.toHaveAttribute('aria-describedby');
            expect(getExpressionInput().validationMessage).toBe('');
            expect(getDialogButton('Apply')).toBeDisabled();
            clickDialogButton('Apply');
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[sales]');

            setExpression('[Sales] * 2');
            expect(getExpressionInput()).not.toHaveClass('invalid');
            expect(getExpressionInput()).toHaveAttribute('aria-invalid', 'false');
            expect(getDialogButton('Apply')).toBeEnabled();
            clickDialogButton('Apply');
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[sales] * 2');
        }
    );

    test.each(['live', 'deferred'] as const)(
        'passes built-in errors to custom validation in %s mode',
        async (applyMode) => {
            const getValidationErrors = vi.fn(({ internalErrors }: CalculatedColumnValidationParams) => internalErrors);
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
                if (applyMode === 'live' && !expression.trim()) {
                    expect(getValidationErrors.mock.lastCall![0].internalErrors).toBeNull();
                    expect(getExpressionInput()).not.toHaveClass('invalid');
                } else {
                    expect(
                        getValidationErrors.mock.lastCall![0].internalErrors?.calculatedExpression?.length
                    ).toBeGreaterThan(0);
                    expect(getExpressionInput()).toHaveClass('invalid');
                }
            }
            expect(getValidationErrors).toHaveBeenCalledTimes(6);
            expect(getExpressionInput().validationMessage).toContain('cannot be used');
            setExpression('"[Salary]" & [Sales]');
            expect(getValidationErrors).toHaveBeenCalledTimes(7);
            expect(getValidationErrors.mock.lastCall![0].internalErrors).toBeNull();
        }
    );

    test.each(['', '   '])('clearing a live expression to %j removes saved validation errors', async (expression) => {
        const getValidationErrors = vi.fn(
            (params: CalculatedColumnValidationParams) => validate(params) ?? params.internalErrors
        );
        const api = createGrid('custom-validation-live-empty', {
            columnDefs,
            rowData,
            calculatedColumns: { getValidationErrors },
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Sales] + [Salary]');
        closeDialog();
        expect(api.getState().userColumns?.find(({ colId }) => colId === 'profit')?.calculatedExpressionError).toEqual({
            expression: '[sales] + [server-salary]',
            reason: 'customValidation',
            messages,
        });

        await openEditDialogViaMenu(api, 'profit');
        setExpression(expression);
        expect(getValidationErrors.mock.lastCall![0].internalErrors).toBeNull();
        expect(getValidationErrors.mock.lastCall![0].referencedColumns).toEqual([]);
        expect(getExpressionInput()).not.toHaveClass('invalid');
        closeDialog();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe('');
        expect(
            api.getState().userColumns?.find(({ colId }) => colId === 'profit')?.calculatedExpressionError
        ).toBeUndefined();

        await openEditDialogViaMenu(api, 'profit');
        expect(getExpressionInput()).not.toHaveClass('invalid');
    });

    test.each(['live', 'deferred'] as const)('custom errors override syntax errors in %s mode', async (applyMode) => {
        const getValidationErrors = vi.fn(validate);
        const api = createGrid('custom-validation-invalid-syntax', {
            columnDefs,
            rowData,
            calculatedColumns: { applyMode, getValidationErrors },
        });
        await openEditDialogViaMenu(api, 'profit');
        getValidationErrors.mockClear();
        setExpression('[Sales][Salary]');
        expect(getValidationErrors).toHaveBeenCalledTimes(1);
        const params = getValidationErrors.mock.lastCall![0];
        expect(params.internalErrors?.calculatedExpression?.length).toBeGreaterThan(0);
        expect(params.colDef.calculatedExpression).toBe('[sales][server-salary]');
        expect(params.referencedColumns.map((column) => column.getColId())).toEqual(['sales', 'server-salary']);
        expect(getExpressionInput().validationMessage).toBe(messages.join('\n'));
        expect(getCalculatedColumnDialog().querySelector('.ag-calculated-column-expression-error')).toBeNull();
        if (applyMode === 'deferred') {
            expect(getDialogButton('Apply')).toBeDisabled();
        } else {
            closeDialog();
            expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe('#ERROR!');
        }
    });

    test.each(['live', 'deferred'] as const)(
        'the callback can accept malformed input in %s mode',
        async (applyMode) => {
            const api = createGrid('custom-validation-accept-invalid', {
                columnDefs,
                rowData,
                calculatedColumns: { applyMode, getValidationErrors: () => null },
            });
            await openEditDialogViaMenu(api, 'profit');
            setExpression('[Sales] +');
            expect(getExpressionInput().validationMessage).toBe('');
            expect(getCalculatedColumnDialog().querySelector('.ag-calculated-column-expression-error')).toBeNull();
            if (applyMode === 'deferred') {
                expect(getDialogButton('Apply')).toBeEnabled();
                clickDialogButton('Apply');
            } else {
                closeDialog();
            }
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[sales] +');
            expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe('#PARSE!');
        }
    );

    test.each(['live', 'deferred'] as const)(
        'a callback cannot bypass reference restrictions in %s mode',
        async (applyMode) => {
            const getValidationErrors = vi.fn(() => null);
            const api = createGrid('custom-validation-restricted-reference', {
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
            setExpression('[Salary]');
            expect(getValidationErrors).toHaveBeenCalledTimes(1);
            expect(getExpressionInput().validationMessage).toContain('cannot be used');
            if (applyMode === 'deferred') {
                expect(getDialogButton('Apply')).toBeDisabled();
            } else {
                closeDialog();
                expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe('#REF!');
            }
        }
    );

    test.each([
        { expression: '"[Salary]" & [Sales] + [Sales] +', expected: ['sales'] },
        { expression: '[Missing] + [Salary] +', expected: ['server-salary'] },
        { expression: '[Sales] + "[Salary]', expected: ['sales'] },
    ])(
        'invalid expression $expression collects only complete, known references outside strings',
        async ({ expression, expected }) => {
            const getValidationErrors = vi.fn((params: CalculatedColumnValidationParams) => params.internalErrors);
            const api = createGrid('custom-validation-incomplete-references', {
                columnDefs,
                rowData,
                calculatedColumns: { applyMode: 'deferred', getValidationErrors },
            });
            await openEditDialogViaMenu(api, 'profit');
            setExpression(expression);
            expect(getValidationErrors).toHaveBeenCalledTimes(1);
            const params = getValidationErrors.mock.lastCall![0];
            expect(params.referencedColumns.map((column) => column.getColId())).toEqual(expected);
        }
    );

    test('a leading equals sign receives custom validation in live mode', async () => {
        const getValidationErrors = vi.fn(validate);
        const api = createGrid('custom-validation-equals-live', {
            columnDefs,
            rowData,
            calculatedColumns: { getValidationErrors },
        });
        await openEditDialogViaMenu(api, 'profit');
        getValidationErrors.mockClear();
        setExpression('=[Salary] + 1');
        expect(getValidationErrors).toHaveBeenCalledTimes(1);
        expect(getExpressionInput().validationMessage).toBe(messages.join('\n'));
        closeDialog();
        expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('=[server-salary] + 1');
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe('#ERROR!');
    });

    test('a leading equals sign validates and applies in deferred mode', async () => {
        const api = createGrid('custom-validation-equals-deferred', {
            columnDefs,
            rowData,
            calculatedColumns: { applyMode: 'deferred', getValidationErrors: validate },
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('=[Sales] + 1');
        expect(getExpressionInput().validationMessage).toBe('');
        expect(getDialogButton('Apply')).toBeEnabled();
        clickDialogButton('Apply');
        expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('=[sales] + 1');
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(21);
    });

    test.each(['live', 'deferred'] as const)(
        'validates title, type and current context in %s mode',
        async (applyMode) => {
            const context = { allow: true };
            const getValidationErrors = vi.fn((params: CalculatedColumnValidationParams) => {
                const { colDef, context } = params;
                if (colDef.headerName === 'Forbidden' || colDef.cellDataType === 'text' || !context.allow) {
                    return { calculatedExpression: ['This definition is not permitted.'] };
                }
                return { calculatedExpression: [] };
            });
            const api = createGrid('custom-validation-fields', {
                columnDefs,
                rowData,
                context,
                calculatedColumns: { applyMode, getValidationErrors },
            });
            await openEditDialogViaMenu(api, 'profit');
            expect(getExpressionInput()).not.toHaveClass('invalid');
            setTitle('Forbidden');
            expect(getValidationErrors.mock.lastCall![0].column).toBe(api.getColumn('profit'));
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
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit', useFormatter: true })).toBe(
            '#ERROR!'
        );
        expect(document.querySelector('.ag-row[row-id="r1"] [col-id="profit"]')?.textContent).toBe('#ERROR!');
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
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit', useFormatter: true })).toBe('21');
    });

    test('live validation changes invalidate values even when the final definition is unchanged', async () => {
        const context = { allow: true };
        const api = createGrid('custom-validation-metadata-only', {
            columnDefs,
            rowData,
            context,
            calculatedColumns: {
                getValidationErrors: ({ context }) => (context.allow ? null : { calculatedExpression: messages }),
            },
        });
        const read = (colKey: string) => api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey });
        const savedDefs = api.getColumnDefs();
        expect(read('dependent')).toBe(40);

        context.allow = false;
        await openEditDialogViaMenu(api, 'profit');
        setTitle('Temporary');
        setTitle('Profit');
        closeDialog();
        expect(api.getColumnDefs()).toEqual(savedDefs);
        expect(read('profit')).toBe('#ERROR!');
        expect(read('dependent')).toBe('#ERROR!');
        expect(api.getState().userColumns?.find(({ colId }) => colId === 'profit')?.calculatedExpressionError).toEqual({
            expression: '[sales]',
            reason: 'customValidation',
            messages,
        });

        context.allow = true;
        await openEditDialogViaMenu(api, 'profit');
        setTitle('Temporary');
        setTitle('Profit');
        closeDialog();
        expect(api.getColumnDefs()).toEqual(savedDefs);
        expect(read('profit')).toBe(20);
        expect(read('dependent')).toBe(40);
        expect(api.getState().userColumns).toBeUndefined();
    });

    test('restoring error-only state changes refreshes cached values without running validation', async () => {
        const getValidationErrors = vi.fn(validate);
        const api = createGrid('custom-validation-state-metadata', {
            columnDefs,
            rowData,
            calculatedColumns: { getValidationErrors },
        });
        const read = () => api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'dependent' });
        const userColumn = { colId: 'profit', properties: [] };
        expect(read()).toBe(40);

        api.setState({
            userColumns: [
                {
                    ...userColumn,
                    calculatedExpressionError: { expression: '[sales]', reason: 'customValidation', messages },
                },
            ],
        });
        expect(read()).toBe('#ERROR!');
        expect(api.getColumn('profit')!.getColDef()).not.toHaveProperty('calculatedExpressionError');

        api.setState({ userColumns: [userColumn] });
        expect(read()).toBe(40);
        expect(api.getState().userColumns?.[0]).not.toHaveProperty('calculatedExpressionError');

        api.setState({
            userColumns: [
                {
                    ...userColumn,
                    calculatedExpressionError: { expression: '[server-salary]', reason: 'customValidation', messages },
                },
            ],
        });
        expect(read()).toBe(40);
        expect(getValidationErrors).not.toHaveBeenCalled();
    });

    test.each([
        { applyMode: 'live', applyDebounce: 0 },
        { applyMode: 'live', applyDebounce: 400 },
        { applyMode: 'deferred', applyDebounce: 0 },
    ] as const)('accepts a saved rejection without editing in $applyMode mode ($applyDebounce ms)', async (options) => {
        const changed = vi.fn();
        const expressionChanged = vi.fn();
        const getValidationErrors = vi.fn(() => null);
        const api = createGrid('custom-validation-reaccepted', {
            columnDefs,
            rowData,
            initialState: {
                userColumns: [
                    {
                        colId: 'profit',
                        properties: [{ property: 'calculatedExpression', value: '[server-salary] * 2' }],
                        calculatedExpressionError: {
                            expression: '[server-salary] * 2',
                            reason: 'customValidation',
                            messages,
                        },
                    },
                ],
            },
            calculatedColumns: { ...options, getValidationErrors },
            onCalculatedColumnChanged: changed,
        });
        api.addEventListener('calculatedColumnExpressionChanged', expressionChanged);
        const read = (colKey: string) => api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey });
        expect(read('profit')).toBe('#ERROR!');
        expect(read('dependent')).toBe('#ERROR!');
        expect(getValidationErrors).not.toHaveBeenCalled();

        await openEditDialogViaMenu(api, 'profit');
        expect(getExpressionInput()).not.toHaveClass('invalid');
        if (options.applyDebounce) {
            expect(api.getState().userColumns?.[0].calculatedExpressionError).toBeDefined();
        }
        if (options.applyMode === 'live') {
            closeDialog();
        } else {
            clickDialogButton('Apply');
        }

        expect(read('profit')).toBe(200);
        expect(read('dependent')).toBe(400);
        expect(document.querySelector('.ag-row[row-id="r1"] [col-id="profit"]')?.textContent).toBe('200');
        expect(document.querySelector('.ag-row[row-id="r1"] [col-id="dependent"]')?.textContent).toBe('400');
        expect(
            api.getState().userColumns?.find(({ colId }) => colId === 'profit')?.calculatedExpressionError
        ).toBeUndefined();
        await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
        expect(changed.mock.lastCall![0]).toMatchObject({
            changes: {},
            expression: '[server-salary] * 2',
            expressionValidation: { valid: true },
            source: 'calculatedColumn',
        });
        expect(changed.mock.lastCall![0].changes).toEqual({});
        expect(expressionChanged).not.toHaveBeenCalled();

        await openEditDialogViaMenu(api, 'profit');
        if (options.applyMode === 'live') {
            closeDialog();
        } else {
            clickDialogButton('Apply');
        }
        await asyncSetTimeout(0);
        expect(changed).toHaveBeenCalledTimes(1);
    });

    test('viewing a saved rejection does not clear it when the application now accepts it', async () => {
        const changed = vi.fn();
        const api = createGrid('custom-validation-read-only-reaccepted', {
            columnDefs: columnDefs.map((colDef) => ({ ...colDef, calculatedColumnReadOnly: true })),
            rowData,
            initialState: {
                userColumns: [
                    {
                        colId: 'profit',
                        properties: [],
                        calculatedExpressionError: { expression: '[sales]', reason: 'customValidation', messages },
                    },
                ],
            },
            calculatedColumns: { getValidationErrors: () => null },
            onCalculatedColumnChanged: changed,
        });
        showColumnMenu(api, 'profit');
        await clickMenuOption('View Calculated Column');
        closeDialog();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe('#ERROR!');
        expect(api.getState().userColumns?.[0].calculatedExpressionError).toBeDefined();
        await asyncSetTimeout(0);
        expect(changed).not.toHaveBeenCalled();
    });

    test('live creation validates empty and incomplete input through the callback', async () => {
        const getValidationErrors = vi.fn(validate);
        const api = createGrid('custom-validation-live-create', {
            columnDefs,
            rowData,
            calculatedColumns: { getValidationErrors },
        });
        showColumnMenu(api, 'sales');
        await clickMenuOption('Add Calculated Column');
        expect(getValidationErrors.mock.lastCall![0].internalErrors).toBeNull();
        setExpression('[Salary]');
        expect(getValidationErrors.mock.lastCall![0].column).toBe(api.getColumn('calculated_1'));
        closeDialog();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe('#ERROR!');
        await openEditDialogViaMenu(api, 'calculated_1');
        getValidationErrors.mockClear();
        setExpression('[Sales] +');
        expect(getValidationErrors).toHaveBeenCalledTimes(1);
        expect(getValidationErrors.mock.lastCall![0].internalErrors?.calculatedExpression?.length).toBeGreaterThan(0);
        expect(getExpressionInput()).not.toHaveClass('invalid');
        closeDialog();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'calculated_1' })).toBe('#PARSE!');
        await openEditDialogViaMenu(api, 'calculated_1');
        setExpression('');
        expect(getExpressionInput()).not.toHaveClass('invalid');
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

    test.each([
        { applyMode: 'live', applyDebounce: 0, readOnly: false },
        { applyMode: 'live', applyDebounce: 400, readOnly: false },
        { applyMode: 'deferred', applyDebounce: 0, readOnly: false },
        { applyMode: 'live', applyDebounce: 0, readOnly: true },
    ] as const)(
        'reconciles a new rejection on opening in $applyMode mode ($applyDebounce ms, readOnly: $readOnly)',
        async ({ applyMode, applyDebounce, readOnly }) => {
            const changed = vi.fn();
            const context = { forbidSales: false };
            const api = createGrid('custom-validation-open', {
                columnDefs: columnDefs.map((colDef) => ({ ...colDef, calculatedColumnReadOnly: readOnly })),
                rowData,
                context,
                calculatedColumns: {
                    applyMode,
                    applyDebounce,
                    getValidationErrors: ({ referencedColumns, context }) =>
                        context.forbidSales && referencedColumns.some((column) => column.getColId() === 'sales')
                            ? { calculatedExpression: messages }
                            : null,
                },
                onCalculatedColumnChanged: changed,
            });
            const read = (colKey: string) => api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey });
            expect(read('profit')).toBe(20);
            expect(read('dependent')).toBe(40);
            context.forbidSales = true;
            showColumnMenu(api, 'profit');
            await clickMenuOption(readOnly ? 'View Calculated Column' : 'Edit Calculated Column');
            expect(getExpressionInput().validationMessage).toBe(applyMode === 'live' ? messages.join('\n') : '');
            if (applyDebounce) {
                expect(api.getState().userColumns).toBeUndefined();
                expect(read('profit')).toBe(20);
            }
            closeDialog();
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[sales]');
            if (applyMode === 'live' && !readOnly) {
                expect(read('profit')).toBe('#ERROR!');
                expect(read('dependent')).toBe('#ERROR!');
                expect(document.querySelector('.ag-row[row-id="r1"] [col-id="profit"]')?.textContent).toBe('#ERROR!');
                expect(api.getState().userColumns?.[0].calculatedExpressionError).toEqual({
                    expression: '[sales]',
                    reason: 'customValidation',
                    messages,
                });
                await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
                expect(changed.mock.lastCall![0]).toMatchObject({
                    expression: '[sales]',
                    expressionValidation: { valid: false, reason: 'customValidation' },
                    source: 'calculatedColumn',
                });
                expect(changed.mock.lastCall![0].changes).toEqual({});

                await openEditDialogViaMenu(api, 'profit');
                closeDialog();
                await asyncSetTimeout(0);
                expect(changed).toHaveBeenCalledTimes(1);
            } else {
                expect(api.getState().userColumns).toBeUndefined();
                expect(read('profit')).toBe(20);
                expect(read('dependent')).toBe(40);
                await asyncSetTimeout(0);
                expect(changed).not.toHaveBeenCalled();
            }
        }
    );

    test.each(['state', 'definitions'] as const)(
        'restores %s without running callbacks, preserving errors only in Grid State',
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
            expect(state.userColumns?.find(({ colId }) => colId === 'profit')?.calculatedExpressionError).toEqual({
                expression: '[server-salary]',
                reason: 'customValidation',
                messages,
            });
            expect(source.getColumn('profit')!.getColDef()).not.toHaveProperty('calculatedExpressionError');
            expect(savedDefs.find(({ colId }) => colId === 'profit')).not.toHaveProperty('calculatedExpressionError');
            source.destroy();
            const getValidationErrors = vi.fn(validate);
            const target = createGrid('custom-validation-target', {
                columnDefs: via === 'state' ? columnDefs : savedDefs,
                initialState: via === 'state' ? state : undefined,
                rowData,
                calculatedColumns: { getValidationErrors },
            });
            expect(target.getCellValue({ rowNode: target.getRowNode('r1')!, colKey: 'profit' })).toBe(
                via === 'state' ? '#ERROR!' : 100
            );
            expect(getValidationErrors).not.toHaveBeenCalled();
            target.setGridOption('calculatedColumns', { applyMode: 'deferred' });
            await openEditDialogViaMenu(target, 'profit');
            expect(getExpressionInput().value).toBe('[Salary]');
            expect(getExpressionInput().validationMessage).toBe('');
            expect(getDialogButton('Apply')).toBeEnabled();
            if (via === 'state') {
                clickDialogButton('Apply');
                expect(getExpressionInput().validationMessage).toBe(messages.join('\n'));
                expect(getDialogButton('Apply')).toBeDisabled();
            }
            setExpression('[Sales] + 1');
            clickDialogButton('Apply');
            expect(target.getCellValue({ rowNode: target.getRowNode('r1')!, colKey: 'profit' })).toBe(21);
        }
    );
});

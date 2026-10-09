import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

import type { CalculatedColumnValidationParams } from 'ag-grid-community';

import {
    clickDialogButton,
    createGrid,
    getCalculatedColumnDialog,
    getDialogButton,
    getExpressionInput,
    openEditDialogViaMenu,
    setExpression,
    setupCalculatedColumnsSuite,
} from './calculatedColumnsHarness';

function getUnderlinedText(): string[] {
    return Array.from(getCalculatedColumnDialog().querySelectorAll('.ag-calculated-column-expression-error')).map(
        (element) => element.textContent ?? ''
    );
}

describe('calculated column expression editor', () => {
    setupCalculatedColumnsSuite();

    const cases = [
        { expression: '[Revenue] - [Cots]', underline: '[Cots]', message: 'Unknown column reference "Cots"' },
        { expression: '[Revenue] +', underline: '+', message: "Missing operand for '+'" },
        { expression: '  = [Revenue] >= ', underline: '>=', message: "Missing operand for '>='" },
        { expression: '[Revenue] + [Cost', underline: '[', message: 'Unexpected character: [' },
        { expression: '[Revenue] & "hello', underline: '"', message: 'Unterminated string' },
        { expression: 'SUM([Revenue]', underline: '(', message: 'Mismatched parentheses' },
        { expression: 'BOGUS([Revenue])', underline: 'BOGUS', message: 'Unsupported operation BOGUS' },
        { expression: 'IF([Revenue], 1, )', underline: ')', message: 'Misplaced comma' },
        { expression: '[Revenue]\n +\n @', underline: '@', message: 'Unexpected character: @' },
        { expression: '"[Cots]" & [Cots]', underline: '[Cots]', message: 'Unknown column reference "Cots"' },
        { expression: ' = ', underline: '=', message: 'Invalid expression' },
    ];

    test.each((['live', 'deferred'] as const).flatMap((applyMode) => cases.map((entry) => ({ ...entry, applyMode }))))(
        '$applyMode displays validation feedback according to apply mode for $expression',
        async ({ applyMode, expression, underline, message }) => {
            const api = createGrid('expression-diagnostics', {
                calculatedColumns: { applyMode },
                columnDefs: [
                    { field: 'revenue', colId: 'server-generated-revenue-id', headerName: 'Revenue' },
                    { field: 'cost' },
                    {
                        colId: 'profit',
                        headerName: 'Profit',
                        calculatedExpression: '[server-generated-revenue-id] - [cost]',
                    },
                ],
                rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            });
            await openEditDialogViaMenu(api, 'profit');
            setExpression(expression);

            const input = getExpressionInput();
            if (applyMode === 'deferred') {
                expect(getUnderlinedText()).toEqual([underline]);
                expect(input.validationMessage).toContain(message);
                expect(input).toHaveAttribute('aria-invalid', 'true');
                expect(document.getElementById(input.getAttribute('aria-describedby')!)?.textContent).toContain(
                    message
                );
            } else {
                expect(getUnderlinedText()).toEqual([]);
                expect(input.validationMessage).toBe('');
                expect(input).not.toHaveClass('invalid');
                expect(input).not.toHaveAttribute('aria-describedby');
            }
            expect(
                getCalculatedColumnDialog().querySelector('.ag-calculated-column-expression-mirror')
            ).toHaveAttribute('aria-hidden', 'true');
            expect(
                getCalculatedColumnDialog().querySelector('.ag-calculated-column-expression-text')?.textContent
            ).toBe(expression);

            if (applyMode === 'live') {
                await waitFor(() =>
                    expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe(
                        expression.replace('[Revenue]', '[server-generated-revenue-id]')
                    )
                );
            } else {
                expect(getDialogButton('Apply')).toBeDisabled();
                expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe(
                    '[server-generated-revenue-id] - [cost]'
                );
            }

            setExpression('[Revenue] - [Cost] + 1');
            expect(getUnderlinedText()).toEqual([]);
            expect(input.validationMessage).toBe('');
            expect(input).not.toHaveAttribute('aria-describedby');
            if (applyMode === 'deferred') {
                expect(getDialogButton('Apply')).toBeEnabled();
                clickDialogButton('Apply');
            }
            await waitFor(() => expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe(8));
        }
    );

    test('escaped headers and strings preserve their text and diagnostic offsets', async () => {
        const api = createGrid('expression-escaped-headers', {
            calculatedColumns: { applyMode: 'deferred' },
            columnDefs: [
                { field: 'revenue', headerName: 'Revenue [USD]' },
                { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue]' },
            ],
            rowData: [{ id: 'r1', revenue: 10 }],
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('SUM([Revenue [USD]]]) + 1');
        expect(getExpressionInput().validationMessage).toBe('');
        const dialog = getCalculatedColumnDialog();
        expect(dialog.querySelector('.ag-calculated-column-token-reference')?.textContent).toBe('[Revenue [USD]]]');
        expect(dialog.querySelector('.ag-calculated-column-token-function')?.textContent).toBe('SUM');
        setExpression('"SUM([Missing]) +" & [Revenue [USD]]] +');
        expect(dialog.querySelector('.ag-calculated-column-token-function')).toBeNull();
        expect(getUnderlinedText()).toEqual(['+']);
    });

    test('custom validation has no invented range and runs once per draft update', async () => {
        const getValidationErrors = vi.fn(() => ['Business rule one.', 'Business rule two.']);
        const api = createGrid('expression-custom-diagnostics', {
            calculatedColumns: { applyMode: 'deferred', getValidationErrors },
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue]' }],
            rowData: [{ id: 'r1', revenue: 10 }],
        });
        await openEditDialogViaMenu(api, 'profit');
        getValidationErrors.mockClear();
        setExpression('[Revenue] * 2');
        expect(getValidationErrors).toHaveBeenCalledTimes(1);
        expect(getUnderlinedText()).toEqual([]);
        expect(getExpressionInput().validationMessage).toBe('Business rule one.\nBusiness rule two.');
        expect(getDialogButton('Apply')).toBeDisabled();
    });

    test('reopening a live draft does not show built-in reference validation', async () => {
        const api = createGrid('expression-live-reopen', {
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue]' }],
            rowData: [{ id: 'r1', revenue: 10 }],
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Cots]');
        await waitFor(() => expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[Cots]'));
        document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
        await openEditDialogViaMenu(api, 'profit');
        expect(getUnderlinedText()).toEqual([]);
        expect(getExpressionInput().validationMessage).toBe('');
    });

    test.each(['typing', 'apply'] as const)(
        'an untouched deferred expression is validated on %s, not on opening',
        async (action) => {
            const getValidationErrors = vi.fn(({ internalErrors }: CalculatedColumnValidationParams) => internalErrors);
            const api = createGrid('expression-deferred-untouched', {
                calculatedColumns: { applyMode: 'deferred', getValidationErrors },
                columnDefs: [
                    { field: 'revenue' },
                    { colId: 'profit', headerName: 'Profit', calculatedExpression: '[revenue] +' },
                ],
                rowData: [{ id: 'r1', revenue: 10 }],
            });
            await openEditDialogViaMenu(api, 'profit');
            expect(getValidationErrors).not.toHaveBeenCalled();
            expect(getExpressionInput().validationMessage).toBe('');
            expect(getExpressionInput()).not.toHaveClass('invalid');
            expect(getUnderlinedText()).toEqual([]);
            expect(
                getCalculatedColumnDialog().querySelector('.ag-calculated-column-token-reference')?.textContent
            ).toBe('[Revenue]');
            expect(getDialogButton('Apply')).toBeEnabled();
            if (action === 'typing') {
                setExpression('[Revenue] -');
            } else {
                clickDialogButton('Apply');
            }
            expect(getValidationErrors).toHaveBeenCalledTimes(1);
            expect(getExpressionInput()).toHaveClass('invalid');
            expect(getDialogButton('Apply')).toBeDisabled();
            expect(getUnderlinedText()).toEqual([action === 'typing' ? '-' : '+']);
        }
    );

    test('live validation can retain built-in diagnostics through internalErrors', async () => {
        const api = createGrid('expression-live-callback-diagnostics', {
            calculatedColumns: { getValidationErrors: ({ internalErrors }) => internalErrors },
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue]' }],
            rowData: [{ id: 'r1', revenue: 10 }],
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Revenue] -');
        expect(getUnderlinedText()).toEqual(['-']);
        expect(getExpressionInput().validationMessage).toContain("Missing operand for '-'");
    });

    test('unchanged restricted references are not diagnosed as errors', async () => {
        const api = createGrid('expression-grandfathered-reference', {
            calculatedColumns: {
                applyMode: 'deferred',
                isColumnReferenceable: ({ colDef }) => colDef.field !== 'salary',
            },
            columnDefs: [
                { field: 'salary' },
                { colId: 'bonus', headerName: 'Bonus', calculatedExpression: '[salary] * 0.1' },
            ],
            rowData: [{ id: 'r1', salary: 100 }],
        });
        await openEditDialogViaMenu(api, 'bonus');
        expect(getUnderlinedText()).toEqual([]);
        expect(getExpressionInput().validationMessage).toBe('');
        expect(getDialogButton('Apply')).toBeEnabled();
        setExpression('[Salary] * 0.2');
        expect(getUnderlinedText()).toEqual(['[Salary]']);
        expect(getExpressionInput().validationMessage).toContain('cannot be used');
    });

    test('registered custom functions are highlighted without being evaluated for diagnostics', async () => {
        const customFunction = vi.fn(() => 42);
        const api = createGrid('expression-custom-function', {
            calculatedColumns: { applyMode: 'deferred' },
            formulaFuncs: { CUSTOM: { func: customFunction } },
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue]' }],
            rowData: [{ id: 'r1', revenue: 10 }],
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('CUSTOM([Revenue])');
        expect(getUnderlinedText()).toEqual([]);
        expect(getExpressionInput().validationMessage).toBe('');
        expect(getCalculatedColumnDialog().querySelector('.ag-calculated-column-token-function')?.textContent).toBe(
            'CUSTOM'
        );
        expect(customFunction).not.toHaveBeenCalled();
    });
});

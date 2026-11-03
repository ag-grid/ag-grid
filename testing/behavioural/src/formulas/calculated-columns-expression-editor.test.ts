import { waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { clickMenuOption } from 'ag-test-utils';
import { vi } from 'vitest';

import type { CalculatedColumnValidationParams } from 'ag-grid-community';
import { GridStateModule, ModuleRegistry } from 'ag-grid-community';

import {
    clickDialogButton,
    createGrid,
    getCalculatedColumnDialog,
    getDialogButton,
    getExpressionInput,
    openEditDialogViaMenu,
    setExpression,
    setupCalculatedColumnsSuite,
    showColumnMenu,
} from './calculatedColumnsHarness';

function getUnderlinedText(): string[] {
    return Array.from(getCalculatedColumnDialog().querySelectorAll('.ag-calculated-column-expression-error')).map(
        (element) => element.textContent ?? ''
    );
}

describe('calculated column expression editor', () => {
    setupCalculatedColumnsSuite();
    beforeEach(() => ModuleRegistry.registerModules([GridStateModule]));

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
        { expression: '[Revenue] + Z1', underline: 'Z1', message: 'Unknown column reference "Z1"' },
        { expression: '  = [Revenue] + $Z$1', underline: '$Z$1', message: 'Unknown column reference "$Z$1"' },
        { expression: 'SUM(A1:Z1)', underline: 'A1:Z1', message: 'Unknown column reference "A1:Z1"' },
        { expression: 'SUM(Z1:A1)', underline: 'Z1:A1', message: 'Unknown column reference "Z1:A1"' },
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
            expect(getUnderlinedText()).toEqual([underline]);
            expect(document.getElementById(input.getAttribute('aria-describedby')!)?.textContent).toContain(message);
            expect(input.validationMessage).toContain(message);
            expect(input).toHaveClass('invalid');
            expect(input).toHaveAttribute('aria-invalid', 'true');
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
            expect(input).not.toHaveClass('invalid');
            expect(input).toHaveAttribute('aria-invalid', 'false');
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
        setExpression('[Revenue [USD]]] + Z1');
        expect(getUnderlinedText()).toEqual(['Z1']);
    });

    test.each(['live', 'deferred'] as const)(
        '%s references retain their diagnostic ranges and restriction rules',
        async (applyMode) => {
            const api = createGrid('expression-reference-ranges', {
                calculatedColumns: { applyMode, isColumnReferenceable: ({ colDef }) => colDef.field !== 'salary' },
                columnDefs: [
                    { field: 'revenue', colId: 'long-revenue-id', headerName: 'Revenue' },
                    { field: 'salary' },
                    { field: 'cost' },
                    { colId: 'profit', calculatedExpression: '[long-revenue-id]' },
                ],
                rowData: [{ id: 'r1', revenue: 10, salary: 100, cost: 3 }],
            });
            await openEditDialogViaMenu(api, 'profit');
            for (const reference of [
                'B1',
                '$B$1',
                'b$1',
                'A1:C1',
                '$C$1:$A$1',
                'REF(COLUMN("salary"), ROW("r1"))',
                'REF(COLUMN("B", true), ROW(1, true))',
                'REF(COLUMN("long-revenue-id"), ROW("r1"), COLUMN("cost"), ROW("r1"))',
            ]) {
                // the display prefix has a different length from its stored colId form
                setExpression(`  = [Revenue] + SUM(${reference})`);
                expect(getUnderlinedText().join('')).toBe(reference);
                expect(getExpressionInput().validationMessage).toContain('Column "Salary" cannot be used');
                if (applyMode === 'deferred') {
                    expect(getDialogButton('Apply')).toBeDisabled();
                }
            }
            for (const expression of [
                '"Z1 B1 REF(COLUMN(1), ROW(1))"',
                'A999',
                'REF(COLUMN("cost"), ROW("not-loaded"))',
            ]) {
                setExpression(expression);
                expect(getUnderlinedText()).toEqual([]);
                expect(getExpressionInput().validationMessage).toBe('');
            }
            if (applyMode === 'live') {
                setExpression('SUM(A1:C1)');
                document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
                await openEditDialogViaMenu(api, 'profit');
                expect(getUnderlinedText().join('')).toBe('A1:C1');
            }
        }
    );

    test.each(['live', 'deferred'] as const)(
        '%s reports unknown literal REF targets and lets custom validation override them',
        async (applyMode) => {
            let accept = false;
            const getValidationErrors = vi.fn(({ internalErrors }: CalculatedColumnValidationParams) =>
                accept ? null : internalErrors
            );
            const api = createGrid('expression-ref-unknown', {
                calculatedColumns: { applyMode, getValidationErrors },
                columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue]' }],
                rowData: [{ id: 'r1', revenue: 10 }],
            });
            await openEditDialogViaMenu(api, 'profit');
            for (const reference of [
                'Z1',
                'REF(COLUMN("missing"), ROW("r1"))',
                'REF(COLUMN("Z", true), ROW(1, true))',
                'REF(COLUMN("revenue"), ROW("r1"), COLUMN("missing"), ROW("r1"))',
            ]) {
                setExpression(`[Revenue] + SUM(${reference})`);
                expect(getUnderlinedText().join('')).toBe(reference);
                expect(getValidationErrors.mock.lastCall![0].internalErrors?.calculatedExpression?.[0]).toContain(
                    'Unknown column reference'
                );
                expect(getExpressionInput()).toHaveAttribute('aria-invalid', 'true');
                if (applyMode === 'deferred') {
                    expect(getDialogButton('Apply')).toBeDisabled();
                }
            }
            accept = true;
            setExpression('[Revenue] + Z1');
            expect(getUnderlinedText()).toEqual([]);
            expect(getExpressionInput().validationMessage).toBe('');
            if (applyMode === 'deferred') {
                expect(getDialogButton('Apply')).toBeEnabled();
                clickDialogButton('Apply');
            } else {
                document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
            }
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[revenue] + Z1');
        }
    );

    test('the first deferred Add dialog validates columns without formula rows or an active A1 map', async () => {
        const api = createGrid('expression-reference-first-add', {
            calculatedColumns: { applyMode: 'deferred' },
            columnDefs: [{ field: 'revenue' }],
            rowData: [],
        });
        showColumnMenu(api, 'revenue');
        await clickMenuOption('Add Calculated Column');
        setExpression('Z1');
        expect(getUnderlinedText()).toEqual(['Z1']);
        expect(getExpressionInput().validationMessage).toContain('Unknown column reference');
        expect(getDialogButton('Apply')).toBeDisabled();
        setExpression('A999');
        expect(getUnderlinedText()).toEqual([]);
        expect(getExpressionInput().validationMessage).toBe('');
        expect(getDialogButton('Apply')).toBeEnabled();
    });

    test('custom validation has no invented range and runs once per draft update', async () => {
        const getValidationErrors = vi.fn(() => ({
            calculatedExpression: ['Business rule one.', 'Business rule two.'],
        }));
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

    test('reopening an invalid live draft shows consistent field and reference feedback', async () => {
        const api = createGrid('expression-live-reopen', {
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue]' }],
            rowData: [{ id: 'r1', revenue: 10 }],
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Cots]');
        await waitFor(() => expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[Cots]'));
        document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
        await openEditDialogViaMenu(api, 'profit');
        expect(getUnderlinedText()).toEqual(['[Cots]']);
        expect(getExpressionInput().validationMessage).toContain('Unknown column reference "Cots"');
        expect(getExpressionInput()).toHaveClass('invalid');
        expect(getExpressionInput()).toHaveAttribute('aria-invalid', 'true');
    });

    test.each([0, 400])(
        'live diagnostics do not change commits or saved rejection state (%s ms debounce)',
        async (applyDebounce) => {
            const changed = vi.fn();
            const api = createGrid('expression-live-diagnostic-state', {
                calculatedColumns: { applyDebounce },
                columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue]' }],
                rowData: [{ id: 'r1', revenue: 10 }],
                onCalculatedColumnChanged: changed,
            });
            await openEditDialogViaMenu(api, 'profit');
            setExpression('[Revenue] +');
            expect(getUnderlinedText()).toEqual(['+']);
            expect(getExpressionInput().validationMessage).toContain("Missing operand for '+'");
            if (applyDebounce) {
                expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[revenue]');
                expect(api.getState().userColumns).toBeUndefined();
                expect(changed).not.toHaveBeenCalled();
            } else {
                await waitFor(() =>
                    expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[revenue] +')
                );
            }
            document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
            expect(api.getColumn('profit')!.getColDef().calculatedExpression).toBe('[revenue] +');
            expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe('#PARSE!');
            expect(api.getState().userColumns?.find(({ colId }) => colId === 'profit')).not.toHaveProperty(
                'calculatedExpressionError'
            );
            await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
            expect(changed.mock.lastCall![0]).toMatchObject({
                expression: '[revenue] +',
                expressionValidation: { valid: false, reason: 'invalidExpression' },
            });
        }
    );

    test.each(['', '   '])('empty live expressions stay valid and have no diagnostic (%j)', async (expression) => {
        const api = createGrid('expression-live-empty-diagnostic', {
            columnDefs: [{ field: 'revenue' }, { colId: 'profit', calculatedExpression: '[revenue]' }],
            rowData: [{ id: 'r1', revenue: 10 }],
        });
        await openEditDialogViaMenu(api, 'profit');
        setExpression('[Revenue] +');
        setExpression(expression);
        expect(getUnderlinedText()).toEqual([]);
        expect(getExpressionInput()).not.toHaveClass('invalid');
        expect(getExpressionInput()).toHaveAttribute('aria-invalid', 'false');
        expect(getExpressionInput().validationMessage).toBe('');
        expect(getExpressionInput()).not.toHaveAttribute('aria-describedby');
        document.querySelector<HTMLElement>('.ag-dialog .ag-panel-title-bar-button')!.click();
        expect(api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit' })).toBe('');
        expect(api.getState().userColumns?.find(({ colId }) => colId === 'profit')).not.toHaveProperty(
            'calculatedExpressionError'
        );
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

    test.each([
        ['[salary]', '[Salary]'],
        ['A1', 'A1'],
        ['REF(COLUMN("salary"), ROW("r1"))', 'REF(COLUMN("salary"), ROW("r1"))'],
    ])('unchanged restricted reference %s is not diagnosed as an error', async (storedReference, displayReference) => {
        const api = createGrid('expression-grandfathered-reference', {
            calculatedColumns: {
                applyMode: 'deferred',
                isColumnReferenceable: ({ colDef }) => colDef.field !== 'salary',
            },
            columnDefs: [
                { field: 'salary' },
                { colId: 'bonus', headerName: 'Bonus', calculatedExpression: `${storedReference} * 0.1` },
            ],
            rowData: [{ id: 'r1', salary: 100 }],
        });
        await openEditDialogViaMenu(api, 'bonus');
        expect(getUnderlinedText()).toEqual([]);
        expect(getExpressionInput().validationMessage).toBe('');
        expect(getDialogButton('Apply')).toBeEnabled();
        clickDialogButton('Apply');
        await openEditDialogViaMenu(api, 'bonus');
        setExpression(`${displayReference} * 0.2`);
        expect(getUnderlinedText().join('')).toBe(displayReference);
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

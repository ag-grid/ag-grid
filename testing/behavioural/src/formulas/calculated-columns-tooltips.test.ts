import '@testing-library/jest-dom/vitest';
import { fakeElementAttribute, getVisibleTooltips } from 'ag-test-utils';

import { TooltipModule } from 'ag-grid-community';

import {
    createGrid,
    getCalculatedColumnDialog,
    getExpressionInput,
    setupCalculatedColumnsSuite,
} from './calculatedColumnsHarness';

describe('calculated column validation tooltips', () => {
    setupCalculatedColumnsSuite();

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    const change = (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const tooltipText = () => getVisibleTooltips().map((tooltip) => tooltip.textContent);

    for (const applyMode of ['live', 'deferred'] as const) {
        test(`shows a Type error after keyboard selection in ${applyMode} mode`, async () => {
            fakeElementAttribute('scrollWidth', 200, '.ag-select .ag-picker-field-display');
            fakeElementAttribute('clientWidth', 100, '.ag-select .ag-picker-field-display');
            const api = createGrid(
                'type-validation-tooltip',
                {
                    calculatedColumns: {
                        applyMode,
                        getValidationErrors: ({ colDef }) =>
                            colDef.cellDataType === 'number' ? { cellDataType: ['Use Text'] } : null,
                    },
                    columnDefs: [
                        { colId: 'profit', headerName: 'Profit', calculatedExpression: '3', cellDataType: 'text' },
                    ],
                    rowData: [{ id: 'r1' }],
                    tooltipTrigger: 'hoverOrFocus',
                    tooltipShowDelay: 100,
                },
                [TooltipModule]
            );
            api.openCalculatedColumnDialog('profit');
            const dialog = getCalculatedColumnDialog();
            const type = dialog.querySelector<HTMLElement>('.ag-picker-field-wrapper')!;
            type.focus();
            vi.useFakeTimers();
            const key = (key: string) =>
                type.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

            key('n');
            key('Enter');
            await vi.advanceTimersByTimeAsync(100);
            expect(type).toHaveFocus();
            expect(tooltipText()).toEqual(['Use Text']);
            type.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 20, clientY: 20 }));
            await vi.advanceTimersByTimeAsync(100);
            expect(tooltipText()).toEqual(['Use Text']);
            key('Escape');
            await vi.advanceTimersByTimeAsync(100);
            expect(tooltipText()).toEqual([]);
            expect(dialog).toBeInTheDocument();

            key('t');
            key('Enter');
            await vi.advanceTimersByTimeAsync(100);
            expect(type).toHaveAttribute('aria-invalid', 'false');
            expect(tooltipText()).toEqual([]);
            dialog.querySelector('input')!.focus();
            type.focus();
            await vi.advanceTimersByTimeAsync(100);
            expect(tooltipText()).toEqual(['Text']);
        });

        test(`preserves initial validation and empty-expression rules in ${applyMode} mode`, async () => {
            const api = createGrid('validation-rules', {
                calculatedColumns: { applyMode },
                columnDefs: [{ colId: 'profit', headerName: 'Profit', calculatedExpression: '(' }],
                rowData: [{ id: 'r1' }],
                tooltipTrigger: 'hoverOrFocus',
                tooltipShowDelay: 100,
            });
            api.openCalculatedColumnDialog('profit');
            const input = getExpressionInput();
            vi.useFakeTimers();
            input.focus();
            await vi.advanceTimersByTimeAsync(100);
            expect(input).toHaveAttribute('aria-invalid', String(applyMode === 'live'));
            expect(getVisibleTooltips()).toHaveLength(applyMode === 'live' ? 1 : 0);

            change(input, '3');
            change(input, '(');
            await vi.advanceTimersByTimeAsync(100);
            expect(input).toHaveAttribute('aria-invalid', 'true');
            expect(getVisibleTooltips()).toHaveLength(1);
            change(input, '');
            await vi.advanceTimersByTimeAsync(100);
            expect(input).toHaveAttribute('aria-invalid', String(applyMode === 'deferred'));
            expect(tooltipText()).toEqual(applyMode === 'deferred' ? ['Enter an expression'] : []);
        });

        test(`custom validation can suppress built-in errors in ${applyMode} mode`, async () => {
            const api = createGrid('suppressed-validation', {
                calculatedColumns: { applyMode, getValidationErrors: () => null },
                columnDefs: [{ colId: 'profit', headerName: 'Profit', calculatedExpression: '3' }],
                rowData: [{ id: 'r1' }],
                tooltipTrigger: 'hoverOrFocus',
                tooltipShowDelay: 100,
            });
            api.openCalculatedColumnDialog('profit');
            const input = getExpressionInput();
            input.focus();
            vi.useFakeTimers();
            change(input, '(');
            await vi.advanceTimersByTimeAsync(100);
            expect(input).toHaveAttribute('aria-invalid', 'false');
            expect(tooltipText()).toEqual([]);
        });

        test.each(['headerName', 'calculatedExpression'] as const)(
            `%s errors update while focused in ${applyMode} mode without reopening dismissed feedback`,
            async (field) => {
                const api = createGrid('validation-tooltip', {
                    calculatedColumns: {
                        applyMode,
                        getValidationErrors: ({ colDef }) => {
                            const value = colDef[field]?.trim();
                            return value === '1' || value === '2' ? { [field]: [`Error ${value}`] } : null;
                        },
                    },
                    columnDefs: [{ colId: 'profit', headerName: 'Profit', calculatedExpression: '3' }],
                    rowData: [{ id: 'r1' }],
                    tooltipTrigger: 'hoverOrFocus',
                    tooltipShowDelay: 200,
                });
                api.openCalculatedColumnDialog('profit');
                const dialog = getCalculatedColumnDialog();
                const title = dialog.querySelector('input')!;
                const expression = getExpressionInput();
                const input = field === 'headerName' ? title : expression;
                const other = field === 'headerName' ? expression : title;
                input.focus();
                vi.useFakeTimers();

                change(input, '1');
                expect(input).toHaveAttribute('aria-invalid', 'true');
                expect(input).toHaveAccessibleDescription(expect.stringContaining('Error 1'));
                await vi.advanceTimersByTimeAsync(199);
                expect(tooltipText()).toEqual([]);
                await vi.advanceTimersByTimeAsync(1);
                expect(tooltipText()).toEqual(['Error 1']);
                const tooltip = getVisibleTooltips()[0];
                change(input, '1 ');
                await vi.advanceTimersByTimeAsync(200);
                expect(getVisibleTooltips()).toEqual([tooltip]);

                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
                expect(tooltipText()).toEqual([]);
                expect(input).toHaveFocus();
                expect(dialog).toBeInTheDocument();
                change(input, '1  ');
                await vi.advanceTimersByTimeAsync(200);
                expect(tooltipText()).toEqual([]);

                change(input, '2');
                await vi.advanceTimersByTimeAsync(200);
                expect(tooltipText()).toEqual(['Error 2']);
                other.focus();
                await vi.advanceTimersByTimeAsync(200);
                expect(tooltipText()).toEqual([]);
                input.focus();
                await vi.advanceTimersByTimeAsync(200);
                expect(tooltipText()).toEqual(['Error 2']);

                change(input, '3');
                expect(input).toHaveAttribute('aria-invalid', 'false');
                expect(tooltipText()).toEqual([]);
                change(input, '1');
                change(input, '3');
                await vi.advanceTimersByTimeAsync(200);
                expect(tooltipText()).toEqual([]);
            }
        );
    }

    test.each(['hover', 'focus'] as const)('respects the %s trigger when an error appears', async (tooltipTrigger) => {
        const api = createGrid('validation-trigger', {
            calculatedColumns: { applyMode: 'deferred' },
            columnDefs: [{ colId: 'profit', headerName: 'Profit', calculatedExpression: '3' }],
            rowData: [{ id: 'r1' }],
            tooltipTrigger,
            tooltipShowDelay: 1000,
        });
        api.openCalculatedColumnDialog('profit');
        const input = getExpressionInput();
        input.focus();
        vi.useFakeTimers();
        change(input, '');
        await vi.advanceTimersByTimeAsync(999);
        expect(tooltipText()).toEqual([]);
        await vi.advanceTimersByTimeAsync(1);
        expect(tooltipText()).toEqual(tooltipTrigger === 'focus' ? ['Enter an expression'] : []);
        if (tooltipTrigger === 'hover') {
            await vi.advanceTimersByTimeAsync(1000);
            expect(tooltipText()).toEqual([]);
            input.dispatchEvent(new MouseEvent('mouseenter'));
            await vi.advanceTimersByTimeAsync(1000);
            expect(tooltipText()).toEqual(['Enter an expression']);
        }
    });

    test('errors on other fields stay hidden until those fields receive focus', async () => {
        const api = createGrid('unfocused-validation', {
            calculatedColumns: {
                applyMode: 'deferred',
                getValidationErrors: ({ colDef }) =>
                    colDef.calculatedExpression === '1'
                        ? { headerName: ['Title error'], cellDataType: ['Type error'] }
                        : null,
            },
            columnDefs: [{ colId: 'profit', headerName: 'Profit', calculatedExpression: '3' }],
            rowData: [{ id: 'r1' }],
            tooltipTrigger: 'hoverOrFocus',
            tooltipShowDelay: 100,
        });
        api.openCalculatedColumnDialog('profit');
        const dialog = getCalculatedColumnDialog();
        const expression = getExpressionInput();
        expression.focus();
        vi.useFakeTimers();
        change(expression, '1');
        await vi.advanceTimersByTimeAsync(100);
        expect(tooltipText()).toEqual([]);
        expect(expression).toHaveFocus();

        dialog.querySelector('input')!.focus();
        await vi.advanceTimersByTimeAsync(100);
        expect(tooltipText()).toEqual(['Title error']);
        dialog.querySelector<HTMLElement>('.ag-picker-field-wrapper')!.focus();
        await vi.advanceTimersByTimeAsync(100);
        expect(tooltipText()).toEqual(['Type error']);
        change(expression, '3');
        expect(tooltipText()).toEqual([]);
    });
});

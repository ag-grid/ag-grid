import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

// AG-18307: typing a number large (or small) enough for JavaScript to print it in scientific notation into an
// agNumberCellEditor with `precision` set. Every row is run once per way of ending the edit. The same matrix lives in
// testing/behavioural/src/cell-editing/cell-editing-number-editor-scientific-blur.test.ts, where the rows happy-dom
// cannot reproduce are commented out; keep the two in step.

const ORIGINAL = 42;

/** One column per editor configuration, so the grid options stay self-contained (`mountGrid` serialises them). */
type EditorColumn = 'minMax' | 'precisionOnly' | 'negativeMin' | 'precision8';

type EndEdit = 'click another cell' | 'Enter' | 'Tab';

interface MatrixRow {
    column: EditorColumn;
    typed: string;
    /** The committed value, or `ORIGINAL` when the edit must be rejected. */
    expected: number;
}

const END_EDITS: EndEdit[] = ['click another cell', 'Enter', 'Tab'];

const MATRIX: MatrixRow[] = [
    // The reported case: out of range (max 100) and in scientific notation once parsed.
    { column: 'minMax', typed: '1234567890123456789012', expected: ORIGINAL },
    // Same root cause without min/max: the full magnitude is kept, not truncated to 1.23.
    { column: 'precisionOnly', typed: '1234567890123456789012', expected: Number('1234567890123456789012') },
    { column: 'negativeMin', typed: '-1234567890123456789012', expected: ORIGINAL },
    // Guards: ordinary decimals are still truncated, and tiny values keep their precision.
    { column: 'minMax', typed: '55.555', expected: 55.55 },
    { column: 'precisionOnly', typed: '12.3456', expected: 12.34 },
    { column: 'precision8', typed: '0.00000015', expected: 1.5e-7 },
];

test.describe('agNumberCellEditor with precision, scientific-notation input', () => {
    for (const { column, typed, expected } of MATRIX) {
        for (const endEdit of END_EDITS) {
            test(`${column}: typing ${typed} then ${endEdit} leaves ${expected}`, async ({ page }) => {
                const { cell } = await mountGrid(page, {
                    options: () => {
                        const numberColumn = (field: string, cellEditorParams: object) => ({
                            field,
                            width: 150,
                            editable: true,
                            cellEditor: 'agNumberCellEditor',
                            cellEditorParams,
                        });
                        const row = (value: number) => ({
                            minMax: value,
                            precisionOnly: value,
                            negativeMin: value,
                            precision8: value,
                        });
                        return {
                            columnDefs: [
                                numberColumn('minMax', { precision: 2, min: 0, max: 100 }),
                                numberColumn('precisionOnly', { precision: 2 }),
                                numberColumn('negativeMin', { precision: 2, min: -100 }),
                                numberColumn('precision8', { precision: 8 }),
                            ],
                            rowData: [row(42), row(1)],
                        };
                    },
                });

                await cell(0, column).dblclick();
                const input = cell(0, column).locator('input');
                await expect(input).toBeFocused();
                await page.keyboard.press('ControlOrMeta+A');
                await page.keyboard.type(typed);

                if (endEdit === 'click another cell') {
                    await cell(1, column).click();
                } else {
                    await page.keyboard.press(endEdit);
                }

                // Tab moves the edit on to the next cell, so only the edited cell is checked.
                await expect(cell(0, column)).not.toHaveClass(/ag-cell-inline-editing/);
                const committed = await page.evaluate(
                    (colId) => (window as any).gridApi.getDisplayedRowAtIndex(0).data[colId],
                    column
                );
                expect(committed).toBe(expected);
            });
        }
    }
});

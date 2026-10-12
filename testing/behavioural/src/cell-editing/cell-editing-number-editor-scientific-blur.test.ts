import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, waitForInput } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberEditorModule, getGridElement } from 'ag-grid-community';

// AG-18307: typing a number large (or small) enough for JavaScript to print it in scientific notation into an
// agNumberCellEditor with `precision` set. This mirrors the real-browser matrix in
// testing/e2e/e2e/number-cell-editor-scientific-notation.spec.ts, which is the source of truth for the expected
// values. Rows where happy-dom does not behave like Chrome are commented out with the reason; keep the two in step.

const ORIGINAL = 42;

const EDITOR_PARAMS = {
    minMax: { precision: 2, min: 0, max: 100 },
    precisionOnly: { precision: 2 },
    negativeMin: { precision: 2, min: -100 },
    precision8: { precision: 8 },
};

type EditorColumn = keyof typeof EDITOR_PARAMS;

type EndEdit = 'click another cell' | 'Enter' | 'Tab';

interface MatrixRow {
    column: EditorColumn;
    typed: string;
    endEdit: EndEdit;
    /** The committed value, or `ORIGINAL` when the edit must be rejected. */
    expected: number;
}

const HUGE = '1234567890123456789012';

const MATRIX: MatrixRow[] = [
    // The reported case: out of range (max 100) and in scientific notation once parsed.
    { column: 'minMax', typed: HUGE, endEdit: 'click another cell', expected: ORIGINAL },
    { column: 'minMax', typed: HUGE, endEdit: 'Enter', expected: ORIGINAL },
    { column: 'minMax', typed: HUGE, endEdit: 'Tab', expected: ORIGINAL },
    // Same root cause without min/max: the full magnitude is kept, not truncated to 1.23.
    { column: 'precisionOnly', typed: HUGE, endEdit: 'click another cell', expected: Number(HUGE) },
    { column: 'precisionOnly', typed: HUGE, endEdit: 'Enter', expected: Number(HUGE) },
    { column: 'precisionOnly', typed: HUGE, endEdit: 'Tab', expected: Number(HUGE) },
    { column: 'negativeMin', typed: `-${HUGE}`, endEdit: 'click another cell', expected: ORIGINAL },
    { column: 'negativeMin', typed: `-${HUGE}`, endEdit: 'Enter', expected: ORIGINAL },
    { column: 'negativeMin', typed: `-${HUGE}`, endEdit: 'Tab', expected: ORIGINAL },
    // Guards: ordinary decimals are still truncated, and tiny values keep their precision.
    { column: 'minMax', typed: '55.555', endEdit: 'click another cell', expected: 55.55 },
    { column: 'minMax', typed: '55.555', endEdit: 'Enter', expected: 55.55 },
    { column: 'minMax', typed: '55.555', endEdit: 'Tab', expected: 55.55 },
    { column: 'precisionOnly', typed: '12.3456', endEdit: 'click another cell', expected: 12.34 },
    { column: 'precisionOnly', typed: '12.3456', endEdit: 'Enter', expected: 12.34 },
    { column: 'precisionOnly', typed: '12.3456', endEdit: 'Tab', expected: 12.34 },
    { column: 'precision8', typed: '0.00000015', endEdit: 'click another cell', expected: 1.5e-7 },
    { column: 'precision8', typed: '0.00000015', endEdit: 'Enter', expected: 1.5e-7 },
    { column: 'precision8', typed: '0.00000015', endEdit: 'Tab', expected: 1.5e-7 },
    // Typed directly in exponent form, which a native number input accepts.
    { column: 'minMax', typed: '1e21', endEdit: 'click another cell', expected: ORIGINAL },
    { column: 'minMax', typed: '1e21', endEdit: 'Enter', expected: ORIGINAL },
    { column: 'minMax', typed: '1e21', endEdit: 'Tab', expected: ORIGINAL },
    { column: 'precisionOnly', typed: '1e21', endEdit: 'click another cell', expected: 1e21 },
    { column: 'precisionOnly', typed: '1e21', endEdit: 'Enter', expected: 1e21 },
    { column: 'precisionOnly', typed: '1e21', endEdit: 'Tab', expected: 1e21 },
    { column: 'precision8', typed: '1.5e-7', endEdit: 'click another cell', expected: 1.5e-7 },
    { column: 'precision8', typed: '1.5e-7', endEdit: 'Enter', expected: 1.5e-7 },
    { column: 'precision8', typed: '1.5e-7', endEdit: 'Tab', expected: 1.5e-7 },
];

describe('agNumberCellEditor with precision, scientific-notation input', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, NumberEditorModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    const cell = (api: GridApi, rowIndex: number, colId: string): HTMLElement =>
        getGridElement(api)!.querySelector<HTMLElement>(`[row-index="${rowIndex}"] [col-id="${colId}"]`)!;

    test.each(MATRIX)(
        '$column: typing $typed then $endEdit leaves $expected',
        async ({ column, typed, endEdit, expected }) => {
            const rowData: Record<string, number>[] = [{ [column]: ORIGINAL }, { [column]: 1 }];
            const api = await gridsManager.createGridAndWait('numberEditorSci', {
                rowData,
                columnDefs: [
                    {
                        field: column,
                        editable: true,
                        cellEditor: 'agNumberCellEditor',
                        cellEditorParams: EDITOR_PARAMS[column],
                    },
                ],
            });
            const user = userEvent.setup();

            await user.dblClick(cell(api, 0, column));
            const input = await waitForInput(getGridElement(api)! as HTMLElement, cell(api, 0, column));
            await user.clear(input);
            await user.type(input, typed);

            if (endEdit === 'click another cell') {
                await user.click(cell(api, 1, column));
            } else {
                await user.keyboard(`{${endEdit}}`);
            }

            expect(cell(api, 0, column).classList.contains('ag-cell-inline-editing')).toBe(false);
            expect(rowData[0][column]).toBe(expected);
        }
    );
});

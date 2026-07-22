import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

// The `total` column sets `cellEditorParams: { validateFormulas: true }`. Rows 2 (`=B2*`) and 5
// (`=BADFUNC(1)`) hold invalid formulas that surface as error values (rendered starting with `#`);
// valid rows compute normally. Editing an invalid formula surfaces the validation state on the cell.
test.agExample(import.meta, () => {
    test.eachFramework(
        'invalid formulas surface as errors and validation surfaces while editing',
        async ({ page, agIdFor }) => {
            await ensureGridReady(page);

            // Valid rows compute price * qty.
            await expect(agIdFor.cell('1', 'total')).toContainText('$ 4.80'); // 1.2 * 4
            await expect(agIdFor.cell('3', 'total')).toContainText('$ 2.40'); // 0.8 * 3

            // Invalid formulas surface as error values (passed through by the value formatter, so they
            // are rendered starting with '#').
            await expect(agIdFor.cell('2', 'total')).toContainText('#'); // =B2*
            await expect(agIdFor.cell('5', 'total')).toContainText('#'); // =BADFUNC(1)

            // Editing an invalid formula surfaces the validation state on the editing cell.
            const cell = agIdFor.cell('1', 'total');
            await cell.dblclick();

            const editable = page.locator('.ag-cell-inline-editing [contenteditable]').first();
            await editable.click();
            await page.keyboard.press('Control+a');
            await page.keyboard.type('=1+');

            await expect(cell).toHaveClass(/ag-cell-editing-error/);

            await page.keyboard.press('Escape');
        }
    );
});

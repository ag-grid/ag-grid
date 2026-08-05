import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

// The `total` column enables `allowFormula` without a custom `cellEditor`, so the grid uses the
// default Formula Cell Editor. Formulas multiply the row's price by its qty via REF/COLUMN/ROW.
test.agExample(import.meta, () => {
    test.eachFramework('formulas evaluate and the formula editor commits a new formula', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        // Initial formulas evaluate: price * qty, formatted as currency.
        await expect(agIdFor.cell('1', 'total')).toContainText('$ 4.80'); // 1.2 * 4
        await expect(agIdFor.cell('2', 'total')).toContainText('$ 3.00'); // 0.5 * 6
        await expect(agIdFor.cell('3', 'total')).toContainText('$ 2.40'); // 0.8 * 3

        const cell = agIdFor.cell('1', 'total');
        await cell.dblclick();

        // The default editor for a formula column is the Formula Cell Editor (a contenteditable field),
        // not a plain input.
        const formulaEditor = page.locator('.ag-cell-inline-editing .ag-formula-input-field');
        await expect(formulaEditor).toBeVisible();

        const editable = page.locator('.ag-cell-inline-editing [contenteditable]').first();
        await editable.click();
        // Select-all is Meta+A on macOS, so Control+A leaves the existing formula in place.
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.type('=3+4');
        await page.keyboard.press('Enter');

        await expect(cell).toContainText('$ 7.00');
    });
});

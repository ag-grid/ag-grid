import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

// The `total` column enables `allowFormula` but provides `cellEditor: 'agTextCellEditor'`, which opts
// the column out of the Formula Cell Editor. Formulas still evaluate, but a plain text editor is used.
test.agExample(import.meta, () => {
    test.eachFramework(
        'formulas evaluate but a plain text editor replaces the formula editor',
        async ({ page, agIdFor }) => {
            await ensureGridReady(page);

            // Formulas still evaluate even though the formula editor is disabled.
            await expect(agIdFor.cell('1', 'total')).toContainText('$ 4.80'); // 1.2 * 4
            await expect(agIdFor.cell('3', 'total')).toContainText('$ 2.40'); // 0.8 * 3

            const cell = agIdFor.cell('1', 'total');
            await cell.dblclick();

            // A standard text input is shown, and the Formula Cell Editor is NOT used.
            await expect(page.locator('.ag-cell-inline-editing input.ag-input-field-input')).toBeVisible();
            await expect(page.locator('.ag-cell-inline-editing .ag-formula-input-field')).toHaveCount(0);
        }
    );
});

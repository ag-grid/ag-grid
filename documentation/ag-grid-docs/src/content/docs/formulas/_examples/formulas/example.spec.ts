import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // subtotal = price * quantity, tax = subtotal * 0.1, total = subtotal + tax.
    test.eachFramework('Formula cells display computed values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Apples: 1.25 * 4 = 5.00, tax 0.50, total 5.50
        await expect(agIdFor.cell('1', 'subtotal').first()).toHaveText('$ 5.00');
        await expect(agIdFor.cell('1', 'tax').first()).toHaveText('$ 0.50');
        await expect(agIdFor.cell('1', 'total').first()).toHaveText('$ 5.50');

        // Oranges: 0.80 * 6 = 4.80, tax 0.48, total 5.28
        await expect(agIdFor.cell('2', 'subtotal').first()).toHaveText('$ 4.80');
        await expect(agIdFor.cell('2', 'tax').first()).toHaveText('$ 0.48');
        await expect(agIdFor.cell('2', 'total').first()).toHaveText('$ 5.28');
    });

    test.eachFramework(
        'Bulk editing keeps the last valid row reference at the grid boundary',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            const firstCell = agIdFor.cell('1', 'subtotal').first();
            await firstCell.click();
            for (let i = 0; i < 3; i++) {
                await page.keyboard.press('Shift+ArrowDown');
            }
            await page.keyboard.press('F2');

            const editable = page.locator('.ag-cell-inline-editing [contenteditable]').first();
            await expect(editable).toBeVisible();
            await page.keyboard.press('ControlOrMeta+A');
            await page.keyboard.type('=B7');
            await page.keyboard.press('Control+Enter');
            await expect(editable).toHaveCount(0);

            for (const [row, formula] of [
                ['1', '=B7'],
                ['2', '=B8'],
                ['3', '=B8'],
                ['4', '=B8'],
            ]) {
                await agIdFor.cell(row, 'subtotal').first().dblclick();
                await expect(editable).toHaveText(formula);
                await page.keyboard.press('Escape');
            }
        }
    );

    // Editing a referenced cell recomputes the dependent formula cells.
    test.eachFramework('Editing quantity recomputes dependent formulas', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        const quantityCell = agIdFor.cell('1', 'quantity').first();
        await quantityCell.dblclick();
        const editor = quantityCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('10');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        // Apples: 1.25 * 10 = 12.50, tax 1.25, total 13.75
        await expect(agIdFor.cell('1', 'subtotal').first()).toHaveText('$ 12.50');
        await expect(agIdFor.cell('1', 'tax').first()).toHaveText('$ 1.25');
        await expect(agIdFor.cell('1', 'total').first()).toHaveText('$ 13.75');
    });
});

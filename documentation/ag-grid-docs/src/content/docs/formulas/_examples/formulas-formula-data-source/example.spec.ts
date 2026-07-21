import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Formulas are stored in an external Map data source; total = price * quantity.
    test.eachFramework('Formulas from the data source display computed totals', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Apples: 1.2 * 5 = 6.00
        await expect(agIdFor.cell('a_01', 'total').first()).toHaveText('$ 6.00');
        // Oranges: 0.8 * 8 = 6.40
        await expect(agIdFor.cell('o_02', 'total').first()).toHaveText('$ 6.40');
        // Bananas: 1.6 * 1 = 1.60
        await expect(agIdFor.cell('b_03', 'total').first()).toHaveText('$ 1.60');
    });

    // Editing a referenced cell invalidates the cached formula and recomputes the total.
    test.eachFramework('Editing price recomputes the data-source formula', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        const priceCell = agIdFor.cell('a_01', 'price').first();
        await priceCell.dblclick();
        const editor = priceCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('2');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        // Apples: 2 * 5 = 10.00
        await expect(agIdFor.cell('a_01', 'price').first()).toHaveText('$ 2.00');
        await expect(agIdFor.cell('a_01', 'total').first()).toHaveText('$ 10.00');
    });
});

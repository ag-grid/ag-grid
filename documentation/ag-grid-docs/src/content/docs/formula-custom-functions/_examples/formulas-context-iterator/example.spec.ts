import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // COUNTEQ($A$1:$B$8, 2) counts how many cells in the gold/silver block equal 2.
    test.eachFramework('COUNTEQ counts matching values in the range', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // gold column has 2 twos, silver column has 6 twos => 8
        await expect(agIdFor.cell('r8', 'c2').first()).toContainText('8');
    });

    // Editing a cell in the range to the criteria value increments the count.
    test.eachFramework('Editing a value into the criteria recomputes COUNTEQ', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        const goldCell = agIdFor.cell('r1', 'c0').first();
        await goldCell.dblclick();
        const editor = goldCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('2');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        // One more cell now equals 2 => 9
        await expect(agIdFor.cell('r8', 'c2').first()).toContainText('9');
    });
});

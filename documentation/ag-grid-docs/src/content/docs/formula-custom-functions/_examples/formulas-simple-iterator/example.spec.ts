import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // CUSTOMSUM iterates every value (including ranges) and returns the sum.
    test.eachFramework('CUSTOMSUM returns the sum of the referenced range', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Row 1: gold 1 + silver 1 = 2
        await expect(agIdFor.cell('1', 'c2').first()).toHaveText('2');
        // Row 5: gold 2 + silver 13 = 15
        await expect(agIdFor.cell('5', 'c2').first()).toHaveText('15');
        // Row 8: SUM(A1:B8) = 17 gold + 34 silver = 51, plus B1 (1) = 52
        await expect(agIdFor.cell('8', 'c2').first()).toHaveText('52');
    });

    // Editing a value in the summed range recomputes the custom-function cell.
    test.eachFramework('Editing a value recomputes CUSTOMSUM', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        const goldCell = agIdFor.cell('1', 'c0').first();
        await goldCell.dblclick();
        const editor = goldCell.locator('input');
        await expect(editor).toBeVisible();
        await editor.fill('10');
        await page.keyboard.press('Enter');
        await expect(editor).toHaveCount(0);

        // Row 1: gold 10 + silver 1 = 11
        await expect(agIdFor.cell('1', 'c2').first()).toHaveText('11');
    });
});

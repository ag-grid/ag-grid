import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

// Each button reports its timing from an idle callback, which a loaded browser can defer for a long
// time - so the assertions here are on what each action does to the grid, not on that reading.
test.agExample(import.meta, () => {
    test.eachFramework('Each button reshapes the grid', async ({ page }) => {
        // Set Data renders ~900 rows across 100 unvirtualised columns, which is more than the
        // default per-test budget allows for on a loaded machine.
        test.slow();
        await ensureGridReady(page);

        const rows = page.locator('.ag-row');
        const viewport = page.locator('.ag-grid-viewport');

        // 100 copies of the 9-row dataset across 10 copies of the 10 columns.
        await page.getByRole('button', { name: 'Set Data' }).click();
        await expect(rows).not.toHaveCount(0);

        await page.getByRole('button', { name: 'Scroll' }).click();
        await expect(viewport).not.toHaveJSProperty('scrollTop', 0);

        await page.getByRole('button', { name: 'Clear Data' }).click();
        await expect(rows).toHaveCount(0);
    });
});

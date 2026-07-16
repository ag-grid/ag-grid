import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('creates range charts via createRangeChart API buttons', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const charts = page.locator('.ag-charts-canvas');

        // No chart exists until an API button is clicked.
        await expect(charts).toHaveCount(0);

        // 'Top 5 Medal Winners' creates the first (linked) range chart in a popup.
        await page.getByRole('button', { name: 'Top 5 Medal Winners' }).click();
        await expect(charts).toHaveCount(1);

        // 'Bronze Medals by Country' creates a second, unlinked range chart.
        await page.getByRole('button', { name: 'Bronze Medals by Country' }).click();
        await expect(charts).toHaveCount(2);

        // Both charts render inside popup chart components.
        await expect(page.locator('.ag-chart')).toHaveCount(2);
    });
});

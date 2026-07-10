import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Refresh Rows re-fetches data; Purge resets rows to loading first', async ({ page }) => {
        await waitForGridContent(page);

        const topVersion = page.locator('.ag-row[row-index="0"] [col-id="version"]').first();
        const serverVersion = page.locator('#version-indicator');

        // Grid rows were fetched at server version 1.
        await expect(topVersion).toContainText('1 - 1 - 1');

        // The fake server bumps its version every 4s, but the grid keeps showing the
        // version it last fetched — the displayed data lags the server.
        await expect(serverVersion).not.toHaveText('1');
        await expect(topVersion).toContainText('1 - 1 - 1');

        // "Refresh Rows" re-fetches the current data, so the version cell catches up.
        await page.getByRole('button', { name: 'Refresh Rows' }).click();
        await expect(topVersion).not.toContainText('1 - 1 - 1');

        // With Purge ticked, refreshing discards the cache first: rows briefly show the
        // loading placeholder before the new data arrives (1s simulated server delay).
        await page.locator('#purge').check();
        await page.getByRole('button', { name: 'Refresh Rows' }).click();
        await expect(page.locator('.ag-row-loading').first()).toBeVisible();

        // The purged rows then reload from the server.
        await expect(topVersion).not.toContainText('1 - 1 - 1');
        await expect(page.locator('.ag-row-loading')).toHaveCount(0);
    });
});

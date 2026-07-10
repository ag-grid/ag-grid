import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('serverSideEnableClientSideSort reorders loaded group rows on the client', async ({ page }) => {
        await waitForGridContent(page);

        const topGroup = () =>
            page.locator('.ag-row[row-index="0"] [col-id="ag-Grid-AutoColumn"] .ag-group-value').first();
        const goldHeader = () => page.locator('.ag-header-cell[col-id="gold"]');

        // Top level is grouped by Country; the server returns United States first.
        await expect(topGroup()).toContainText('United States');

        // Clicking the Gold header sorts the already-loaded group rows on the client (no server
        // reload). Ascending pushes the highest medal-winner (United States) away from the top.
        await goldHeader().click();
        await expect(topGroup()).not.toContainText('United States');

        // Descending brings the highest gold total (United States) back to the top.
        await page.waitForTimeout(400); // avoid the two clicks registering as a double-click
        await goldHeader().click();
        await expect(topGroup()).toContainText('United States');
    });
});

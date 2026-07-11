import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'serverSideSortAllLevels sorts grouped rows server-side and refreshes them',
        async ({ page }) => {
            await waitForGridContent(page);

            const topGroup = () =>
                page.locator('.ag-row[row-index="0"] [col-id="ag-Grid-AutoColumn"] .ag-group-value').first();
            const goldHeader = () => page.locator('.ag-header-cell[col-id="gold"]');

            // Top level is grouped by Country; the server returns United States first.
            await expect(topGroup()).toContainText('United States');

            // With serverSideSortAllLevels the Gold sort is applied server-side to the grouped data
            // and the rows are reloaded. Ascending removes the top medal-winner from the first row.
            await goldHeader().click();
            await expect(topGroup()).not.toContainText('United States');

            // Descending reloads with the highest gold total (United States) at the top.
            await page.waitForTimeout(600); // exceed the OS double-click threshold so the two clicks are separate sorts
            await goldHeader().click();
            await expect(topGroup()).toContainText('United States');
        }
    );
});

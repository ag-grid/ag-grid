import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Clicking a header sorts rows on the server and reloads them re-sorted', async ({ page }) => {
        await waitForGridContent(page);

        const topCountry = () => page.locator('.ag-row[row-index="0"] [col-id="country"]').first();
        const countryHeader = () => page.locator('.ag-header-cell[col-id="country"]');

        // Default (unsorted) order: the server returns rows in their natural order, so the
        // first row is Michael Phelps of the United States.
        await expect(topCountry()).toContainText('United States');

        // Clicking the Country header requests an ascending sort from the server; the block is
        // reloaded re-sorted, so the first row becomes the alphabetically-first country.
        await countryHeader().click();
        await expect(topCountry()).toContainText('Afghanistan');

        // Clicking again requests a descending sort; the first row becomes the last country.
        await page.waitForTimeout(600); // exceed the OS double-click threshold so the two clicks are separate sorts
        await countryHeader().click();
        await expect(topCountry()).toContainText('Zimbabwe');
    });
});

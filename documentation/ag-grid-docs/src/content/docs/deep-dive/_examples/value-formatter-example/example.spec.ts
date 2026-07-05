import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('formats the price column with a currency prefix', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // valueFormatter renders '£' + price.toLocaleString(); first record price is 12,480,000.
        await expect(agIdFor.cell('0', 'mission')).toContainText('CRS SpX-25');
        await expect(agIdFor.cell('0', 'price')).toContainText('£12,480,000');
    });

    test.eachFramework('paginating keeps the price column formatted', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.paginationSummaryPanelButton('next page').click();
        await expect(agIdFor.paginationPanelFirstRowOnPage('101')).toBeVisible();

        // The formatter still prefixes prices with '£' on the new page.
        await expect(agIdFor.cell('100', 'price')).toContainText('£');
    });
});

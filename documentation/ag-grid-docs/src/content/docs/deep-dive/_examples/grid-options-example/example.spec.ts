import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('paginates the fetched data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'mission')).toContainText('CRS SpX-25');

        // 1,375 records from space-mission-data.json, default page size of 100.
        await expect(agIdFor.paginationPanelRecordCount('1,375')).toBeVisible();
        await expect(agIdFor.paginationPanelFirstRowOnPage('1')).toBeVisible();
        await expect(agIdFor.paginationPanelLastRowOnPage('100')).toBeVisible();
    });

    test.eachFramework('advancing to the next page updates the row range', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.paginationSummaryPanelButton('next page').click();

        await expect(agIdFor.paginationPanelFirstRowOnPage('101')).toBeVisible();
        await expect(agIdFor.paginationPanelLastRowOnPage('200')).toBeVisible();
    });
});

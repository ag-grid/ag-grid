import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Displays paginated data with correct page info', async ({ agIdFor, page }) => {
        // First row on page 1
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // Pagination row summary: 1 to 100 of 8,618 (default page size is 100)
        await expect(agIdFor.paginationPanelFirstRowOnPage('1')).toBeVisible();
        await expect(agIdFor.paginationPanelLastRowOnPage('100')).toBeVisible();
        await expect(agIdFor.paginationPanelRecordCount('8,618')).toBeVisible();

        // Pagination page summary: Page 1 of 87
        await expect(agIdFor.paginationSummaryPanelCurrentPage('1')).toBeVisible();
        await expect(agIdFor.paginationSummaryPanelTotalPage('87')).toBeVisible();
    });

    test.eachFramework('Navigates to next page', async ({ agIdFor }) => {
        await agIdFor.paginationSummaryPanelButton('next page').click();

        // Page 2: rows 101-200
        await expect(agIdFor.paginationSummaryPanelCurrentPage('2')).toBeVisible();
        await expect(agIdFor.paginationPanelFirstRowOnPage('101')).toBeVisible();
        await expect(agIdFor.paginationPanelLastRowOnPage('200')).toBeVisible();
    });

    test.eachFramework('Navigates to last page', async ({ agIdFor }) => {
        await agIdFor.paginationSummaryPanelButton('last page').click();

        await expect(agIdFor.paginationSummaryPanelCurrentPage('87')).toBeVisible();
        await expect(agIdFor.paginationPanelFirstRowOnPage('8,601')).toBeVisible();
        await expect(agIdFor.paginationPanelLastRowOnPage('8,618')).toBeVisible();
    });
});

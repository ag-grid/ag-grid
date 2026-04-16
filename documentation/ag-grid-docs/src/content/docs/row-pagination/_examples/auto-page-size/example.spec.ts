import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Auto page size shows data and pagination', async ({ agIdFor }) => {
        // Grid loads with first row visible
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // Page 1 is shown with total record count
        await expect(agIdFor.paginationSummaryPanelCurrentPage('1')).toBeVisible();
        await expect(agIdFor.paginationPanelFirstRowOnPage('1')).toBeVisible();
        await expect(agIdFor.paginationPanelRecordCount('8,618')).toBeVisible();
    });

    test.eachFramework('Can navigate pages', async ({ agIdFor }) => {
        await agIdFor.paginationSummaryPanelButton('next page').click();

        await expect(agIdFor.paginationSummaryPanelCurrentPage('2')).toBeVisible();
    });
});

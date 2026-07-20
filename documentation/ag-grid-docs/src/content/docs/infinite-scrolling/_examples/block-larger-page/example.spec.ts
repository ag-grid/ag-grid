import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('loads the first page from the datasource', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-row[row-index="0"]').locator('[col-id="athlete"]')).toContainText(
            'Michael Phelps'
        );
        await expect(agIdFor.paginationSummaryPanelCurrentPage()).toHaveText('1');
    });

    test.eachFramework('navigating to the next page shows further rows', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.paginationSummaryPanelCurrentPage()).toHaveText('1');

        // The block is larger than the page, so paging forward is served from the cached block.
        await agIdFor.paginationSummaryPanelButton('next page').click();
        await expect(agIdFor.paginationSummaryPanelCurrentPage()).toHaveText('2');
        await expect(page.locator('.ag-center-cols-container .ag-row [col-id="athlete"]').first()).not.toBeEmpty();
    });
});

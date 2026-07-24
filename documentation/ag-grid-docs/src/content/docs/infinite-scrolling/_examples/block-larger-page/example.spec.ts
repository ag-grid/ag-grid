import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('loads the first page from the datasource', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-row[row-index="0"]').locator('[col-id="athlete"]')).toContainText(
            'Michael Phelps'
        );
        await expect(agIdFor.paginationSummaryPanelCurrentPage('1')).toBeVisible();
    });

    test.eachFramework('navigating to the next page shows further rows', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const firstAthlete = page.locator('.ag-grid-scrolling-container .ag-row [col-id="athlete"]').first();
        await expect(firstAthlete).toContainText('Michael Phelps');
        await expect(agIdFor.paginationSummaryPanelCurrentPage('1')).toBeVisible();

        // The block is larger than the page, so paging forward is served from the cached block.
        // Page size is auto (grid-height dependent), so assert the top row is genuinely different
        // second-block data rather than the stale first-page rows.
        await agIdFor.paginationSummaryPanelButton('next page').click();
        await expect(agIdFor.paginationSummaryPanelCurrentPage('2')).toBeVisible();
        await expect(firstAthlete).not.toContainText('Michael Phelps');
        await expect(firstAthlete).not.toBeEmpty();
    });
});

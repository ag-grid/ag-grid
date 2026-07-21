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

    test.eachFramework('navigating to the next page fetches the next block', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.paginationSummaryPanelCurrentPage()).toHaveText('1');

        // Page and block sizes are both the default 100, so page 2 is a fresh block starting at
        // dataset index 100 (Sabine Völker / Germany) — proving new rows were fetched, not stale data.
        await agIdFor.paginationSummaryPanelButton('next page').click();
        await expect(agIdFor.paginationSummaryPanelCurrentPage()).toHaveText('2');
        await expect(page.locator('.ag-row[row-index="100"]').locator('[col-id="athlete"]')).toContainText(
            'Sabine Völker'
        );
        await expect(page.locator('.ag-row[row-index="100"]').locator('[col-id="country"]')).toContainText('Germany');
    });
});

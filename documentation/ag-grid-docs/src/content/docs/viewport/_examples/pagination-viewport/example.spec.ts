import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('loads the first page of the viewport', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-row[row-index="0"]').locator('[col-id="code"]')).toContainText('ECV.L');
        await expect(page.locator('.ag-row[row-index="0"]').locator('[col-id="name"]')).toContainText(
            'Eco City Vehicles plc'
        );
        await expect(agIdFor.paginationSummaryPanelCurrentPage()).toHaveText('1');
    });

    test.eachFramework('navigating to the next page requests the next viewport range', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.paginationSummaryPanelCurrentPage()).toHaveText('1');

        // Paging asks the datasource for a new viewport range, so the top stock is no longer ECV.L.
        await agIdFor.paginationSummaryPanelButton('next page').click();
        await expect(agIdFor.paginationSummaryPanelCurrentPage()).toHaveText('2');

        const firstCode = page.locator('.ag-center-cols-container .ag-row [col-id="code"]').first();
        await expect(firstCode).not.toBeEmpty();
        await expect(firstCode).not.toContainText('ECV.L');
    });
});

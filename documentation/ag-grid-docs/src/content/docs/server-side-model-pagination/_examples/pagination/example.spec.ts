import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('server-side pagination advances pages and swaps the row set', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // `id` value cells (exact match so "1" does not match "21" etc.)
        const idCell = (id: string) => page.locator('.ag-cell[col-id="id"]').filter({ hasText: new RegExp(`^${id}$`) });

        // Page one: paginationPageSize=20 so rows 1..20 of the dataset are shown.
        await expect(agIdFor.paginationSummaryPanelCurrentPage('1')).toBeVisible();
        await expect(agIdFor.paginationPanelFirstRowOnPage('1')).toBeVisible();
        await expect(agIdFor.paginationPanelLastRowOnPage('20')).toBeVisible();
        await expect(idCell('1')).toBeVisible();
        await expect(idCell('21')).toHaveCount(0);

        // Advancing to page two re-requests rows 21..40 from the server.
        await page.getByRole('button', { name: 'Next Page' }).click();

        await expect(agIdFor.paginationSummaryPanelCurrentPage('2')).toBeVisible();
        await expect(agIdFor.paginationPanelFirstRowOnPage('21')).toBeVisible();
        await expect(agIdFor.paginationPanelLastRowOnPage('40')).toBeVisible();
        await expect(idCell('21')).toBeVisible();
        await expect(idCell('1')).toHaveCount(0);
    });
});

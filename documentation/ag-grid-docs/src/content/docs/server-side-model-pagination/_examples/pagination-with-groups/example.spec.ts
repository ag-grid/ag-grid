import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('expanding a top-level group keeps its children on the same page', async ({ page }) => {
        await waitForGridContent(page);

        // Pagination splits by top-level (Country) groups only, so the total page
        // count is fixed by the number of groups regardless of expansion.
        const totalPages = page.locator('.ag-paging-page-summary-panel .ag-paging-number[data-ref="lbTotal"]');
        const currentPage = page.locator('.ag-paging-page-summary-panel input');

        // Wait for the last row to be reached so the count settles to a number (not "more").
        await expect(totalPages).toHaveText(/^\d+$/);
        const totalBefore = (await totalPages.textContent())!.trim();
        await expect(currentPage).toHaveValue('1');

        // Leaf (athlete) cells are empty until a group is expanded.
        const athleteLeaf = page.locator('.ag-cell[col-id="athlete"]').filter({ hasText: /\S/ });
        await expect(athleteLeaf).toHaveCount(0);

        // Expand the first top-level group; its children lazy-load onto the same page.
        await page.locator('.ag-row .ag-group-contracted').first().click();
        await expect(athleteLeaf.first()).toBeVisible();

        // Children appear on the same page: page count and current page are unchanged.
        await expect(totalPages).toHaveText(totalBefore);
        await expect(currentPage).toHaveValue('1');
    });
});

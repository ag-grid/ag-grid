import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

const TOTAL_PAGES_SELECTOR = '.ag-paging-page-summary-panel .ag-paging-number[data-ref="lbTotal"]';

test.agExample(import.meta, () => {
    test.eachFramework(
        'paginateChildRows keeps page size fixed and pushes overflow to more pages',
        async ({ page }) => {
            await waitForGridContent(page);

            // Row summary numbers: [0] first row, [1] last row on page, [2] record count.
            const lastRowOnPage = page.locator('.ag-paging-row-summary-panel-number').nth(1);
            const totalPages = page.locator(TOTAL_PAGES_SELECTOR);

            // Wait for both to settle to numbers (SSRM shows "more" until the last row is known).
            await expect(lastRowOnPage).toHaveText(/^\d+$/);
            await expect(totalPages).toHaveText(/^\d+$/);
            const pageSize = (await lastRowOnPage.textContent())!.trim();
            const totalBefore = Number((await totalPages.textContent())!.trim());

            // Expand the first top-level group; with paginateChildRows the children count
            // toward pagination, so overflow is pushed onto additional pages.
            await page.locator('.ag-row .ag-group-contracted').first().click();

            await page.waitForFunction(
                ([selector, before]) => {
                    const el = document.querySelector(selector as string);
                    const n = Number(el?.textContent?.trim());
                    return Number.isInteger(n) && n > (before as number);
                },
                [TOTAL_PAGES_SELECTOR, totalBefore] as const
            );

            // The per-page row count stays fixed at the page size.
            await expect(lastRowOnPage).toHaveText(pageSize);
        }
    );
});

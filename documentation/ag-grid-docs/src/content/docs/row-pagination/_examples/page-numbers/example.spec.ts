import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders numbered pages with ellipsis truncation', async ({ page, agIdFor }) => {
        // starts on page 10 (paginationGoToPage(9) on first data rendered)
        await expect(page.locator('.ag-paging-page-number-current')).toHaveText('10');
        await expect(agIdFor.paginationPageNumber('1')).toBeVisible();
        await expect(agIdFor.paginationPageNumber('87')).toBeVisible();
        await expect(page.locator('.ag-paging-page-number-ellipsis')).toHaveCount(2);
    });

    test.eachFramework('clicking a page number navigates to that page', async ({ page, agIdFor }) => {
        await agIdFor.paginationPageNumber('11').click();
        await expect(page.locator('.ag-paging-page-number-current')).toHaveText('11');
    });
});

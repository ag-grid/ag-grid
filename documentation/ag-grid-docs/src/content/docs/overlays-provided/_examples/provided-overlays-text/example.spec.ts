import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Provided overlays show customised text per state', async ({ page }) => {
        // loading starts true -> customised loading text
        const loadingOverlay = page.locator('.ag-overlay-loading-center');
        await expect(loadingOverlay).toBeVisible();
        await expect(loadingOverlay).toContainText('Please wait while your data is loading...');

        // turn loading off, then apply a non-matching filter -> customised no-matching-rows text
        await page.getByRole('checkbox').uncheck();
        await page.getByRole('button', { name: 'Set Non Matching Filter' }).click();
        const noMatchingOverlay = page.locator('.ag-overlay-no-matching-rows-center');
        await expect(noMatchingOverlay).toBeVisible();
        await expect(noMatchingOverlay).toContainText('Current Filter Matches No Rows');

        // clear the filter and the row data -> customised no-rows text
        await page.getByRole('button', { name: 'Clear Filter' }).click();
        await page.getByRole('button', { name: 'Clear Row Data' }).click();
        const noRowsOverlay = page.locator('.ag-overlay-no-rows-center');
        await expect(noRowsOverlay).toBeVisible();
        await expect(noRowsOverlay).toContainText('This grid has no data!');
    });
});

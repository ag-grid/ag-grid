import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Provided overlays follow grid state', async ({ page }) => {
        // loading starts true -> loading overlay
        const loadingOverlay = page.locator('.ag-overlay-loading-center');
        await expect(loadingOverlay).toBeVisible();
        await expect(loadingOverlay).toContainText('Loading...');

        // turn loading off then apply a non-matching filter -> no-matching-rows overlay
        await page.getByRole('checkbox').uncheck();
        await page.getByRole('button', { name: 'Set Non Matching Filter' }).click();
        const noMatchingOverlay = page.locator('.ag-overlay-no-matching-rows-center');
        await expect(noMatchingOverlay).toBeVisible();
        await expect(noMatchingOverlay).toContainText('No Matching Rows');

        // clear the filter and row data -> no-rows overlay
        await page.getByRole('button', { name: 'Clear Filter' }).click();
        await page.getByRole('button', { name: 'Clear Row Data' }).click();
        const noRowsOverlay = page.locator('.ag-overlay-no-rows-center');
        await expect(noRowsOverlay).toBeVisible();
        await expect(noRowsOverlay).toContainText('No Rows To Show');
    });
});

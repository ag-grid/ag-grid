import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Selector overrides loading overlay only', async ({ page }) => {
        // selector returns a custom component for the loading overlay
        const customLoadingOverlay = page.locator('.overlay-loading-center');
        await expect(customLoadingOverlay).toBeVisible();
        await expect(customLoadingOverlay).toContainText('Please wait while data is loading...');

        // no-rows falls back to the provided overlay (selector returns undefined)
        await page.getByRole('checkbox').uncheck();
        const noRowsOverlay = page.locator('.ag-overlay-no-rows-center');
        await expect(noRowsOverlay).toBeVisible();
        await expect(noRowsOverlay).toContainText('No Rows To Show');
    });
});

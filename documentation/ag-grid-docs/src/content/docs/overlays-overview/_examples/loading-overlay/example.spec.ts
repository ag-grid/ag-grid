import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Loading overlay shown when loading is true', async ({ page }) => {
        // grid is created with loading: true and no controls -> loading overlay is shown
        const loadingOverlay = page.locator('.ag-overlay-loading-center');
        await expect(loadingOverlay).toBeVisible();
        await expect(loadingOverlay).toContainText('Loading...');
    });
});

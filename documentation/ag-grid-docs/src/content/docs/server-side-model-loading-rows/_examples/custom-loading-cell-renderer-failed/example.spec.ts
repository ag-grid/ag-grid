import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom loading component displays before the request fails', async ({ page }) => {
        await ensureGridReady(page);

        // While the request is in flight the custom loading message is shown.
        const loadingCell = page.locator('.ag-custom-loading-cell');
        await expect(loadingCell.first()).toBeVisible();
        await expect(loadingCell.first()).toContainText('One moment please...');
    });

    test.eachFramework('Loading component switches to a failure message when loading fails', async ({ page }) => {
        await ensureGridReady(page);

        // The datasource fails after the simulated delay; the component then renders its failure state.
        const loadingCell = page.locator('.ag-custom-loading-cell');
        await expect(loadingCell.first()).toContainText('Data failed to load', { timeout: 20000 });
    });
});

import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        await ensureGridReady(page);
        await expect(page.locator('.ag-overlay-error-wrapper')).toBeVisible();
    });
});

import { expect } from '@playwright/test';
import { ensureGridReady, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('shows file input overlay when no row data', async ({ page }) => {
        await ensureGridReady(page);
        await expect(page.locator('.ag-overlay-file-input-center')).toBeVisible();
        await expect(page.locator('.ag-file-input-drop-zone')).toBeVisible();
    });
});

import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Example',
        async ({ page }) => {
            await ensureGridReady(page);
            await expect(page.locator('.ag-overlay-error-wrapper')).toBeVisible();
            // The footer reports the AG package versions the grid is running.
            await expect(page.locator('.ag-overlay-error-versions')).toContainText('AG Grid Community=');
        },
        // The example intentionally registers `sideBar` without its module, surfacing error #200.
        { allowedConsoleMessages: ['error #200'] }
    );
});

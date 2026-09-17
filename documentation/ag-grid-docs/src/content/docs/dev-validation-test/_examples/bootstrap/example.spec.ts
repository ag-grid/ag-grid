import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Example',
        async ({ page }) => {
            // Grid creation aborts, so there is no grid to wait for — assert the standalone panel instead.
            await expect(page.locator('.ag-overlay-error-bootstrap-panel')).toBeVisible();
            // The panel reports the AG package versions, even though grid creation never completed.
            await expect(page.locator('.ag-overlay-error-bootstrap-panel')).toContainText('ag-grid-community=');
        },
        // The example intentionally requests an unregistered row model, surfacing error #200.
        { allowedConsoleMessages: ['error #200'] }
    );
});

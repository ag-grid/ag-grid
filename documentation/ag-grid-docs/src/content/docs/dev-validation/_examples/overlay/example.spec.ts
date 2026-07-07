import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Example',
        async ({ page }) => {
            await ensureGridReady(page);
            await expect(page.locator('.ag-overlay-error-wrapper')).toBeVisible();
        },
        // The example intentionally adds an unrecognised colDef property, surfacing warnings #307 and #310.
        { allowedConsoleMessages: ['warning #307', 'warning #310'] }
    );
});

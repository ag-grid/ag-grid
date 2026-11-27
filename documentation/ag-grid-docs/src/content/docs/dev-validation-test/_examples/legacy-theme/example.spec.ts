import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Example',
        async ({ page }) => {
            await ensureGridReady(page);
            await expect(page.locator('.ag-overlay-error-wrapper')).toBeVisible();
        },
        // The example intentionally registers `sideBar` without its module, surfacing error #200, and uses the
        // deprecated `theme: 'legacy'`, which logs warning #306.
        { allowedConsoleMessages: ['error #200', 'warning #306'] }
    );
});

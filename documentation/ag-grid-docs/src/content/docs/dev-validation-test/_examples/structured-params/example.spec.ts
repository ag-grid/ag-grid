import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Example',
        async ({ page }) => {
            await ensureGridReady(page);
            await expect(page.locator('.ag-overlay-error-wrapper')).toBeVisible();
            // Both diagnostics link to their dedicated error pages: #109's `allSuggestions` param is an
            // array, #101's `agGridDefaults`/`jsComps` params are objects.
            await expect(page.getByRole('link', { name: 'AG Grid #109' })).toBeVisible();
            await expect(page.getByRole('link', { name: 'AG Grid #101' })).toBeVisible();
        },
        // The example intentionally sets an unregistered aggFunc and cellRenderer, surfacing #109 and #101.
        { allowedConsoleMessages: ['warning #109', 'warning #101'] }
    );
});

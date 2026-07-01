import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Example',
        async ({ page }) => {
            await ensureGridReady(page);
            // The first row auto-expands, creating the detail grid. Its invalid-option warning surfaces
            // on the detail grid's overlay and bubbles up to the master grid, where it is labelled as
            // coming from a nested grid.
            await expect(page.locator('.ag-overlay-error-wrapper').first()).toBeVisible();
            await expect(page.locator('.ag-overlay-error-nested-source').first()).toBeVisible();
        },
        // The detail grid intentionally sets an invalid option, surfacing warnings #307 and #310.
        { allowedConsoleMessages: ['warning #307', 'warning #310'] }
    );
});

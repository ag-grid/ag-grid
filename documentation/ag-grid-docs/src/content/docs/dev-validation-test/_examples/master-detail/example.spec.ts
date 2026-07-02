import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Example',
        async ({ page }) => {
            await ensureGridReady(page);
            // The first row auto-expands, creating the detail grid. Its invalid-option warning surfaces
            // on the detail grid's own overlay; diagnostics stay on the grid that emitted them, so the
            // master grid shows no overlay of its own.
            await expect(page.locator('.ag-details-row .ag-overlay-error-wrapper')).toBeVisible();
            await expect(page.locator('.ag-overlay-error-wrapper')).toHaveCount(1);
        },
        // The detail grid intentionally sets an invalid option, surfacing warnings #307 and #310.
        { allowedConsoleMessages: ['warning #307', 'warning #310'] }
    );
});

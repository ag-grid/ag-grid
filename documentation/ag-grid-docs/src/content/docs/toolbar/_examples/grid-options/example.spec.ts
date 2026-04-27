import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Toggling toolbar items adds and removes them at runtime', async ({ page }) => {
        await waitForGridContent(page);

        const findItem = page.locator('.ag-toolbar-find');
        // .ag-toolbar-find and quickFilter both carry .ag-toolbar-input, so select the
        // quickFilter node directly via the absence of .ag-toolbar-find.
        const quickFilterInput = page.locator('.ag-toolbar .ag-toolbar-input:not(.ag-toolbar-find)');
        const toggleFind = page.locator('button', { hasText: 'Toggle Find' });
        const toggleQuickFilter = page.locator('button', { hasText: 'Toggle Quick Filter' });
        const full = page.locator('button', { hasText: 'Full' });

        // Initial state: both find and quick filter are present
        await expect(findItem).toHaveCount(1);
        await expect(quickFilterInput).toHaveCount(1);

        // Toggle removes each item independently
        await toggleFind.click();
        await expect(findItem).toHaveCount(0);
        await expect(quickFilterInput).toHaveCount(1);

        await toggleQuickFilter.click();
        await expect(findItem).toHaveCount(0);
        await expect(quickFilterInput).toHaveCount(0);

        // Toggling brings them back
        await toggleFind.click();
        await expect(findItem).toHaveCount(1);

        // Full restores both
        await full.click();
        await expect(findItem).toHaveCount(1);
        await expect(quickFilterInput).toHaveCount(1);
    });
});

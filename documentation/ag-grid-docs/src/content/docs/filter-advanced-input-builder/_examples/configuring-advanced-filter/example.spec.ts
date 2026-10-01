import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should display advanced filter with builder button suppressed', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Advanced filter input should be visible
        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await expect(filterInput).toBeVisible();

        // Builder button should be suppressed (suppressBuilderButton: true)
        const builderButton = page.locator('.ag-advanced-filter-builder-button');
        await expect(builderButton).not.toBeVisible();
    });

    test.eachFramework('should show clear, apply, and reset buttons', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Custom buttons configured: ['clear', 'apply', 'reset']
        const buttonPanel = page.locator('.ag-advanced-filter-buttons');
        await expect(buttonPanel).toBeVisible();

        await expect(buttonPanel.getByText('Clear')).toBeVisible();
        await expect(buttonPanel.getByText('Apply')).toBeVisible();
        await expect(buttonPanel.getByText('Reset')).toBeVisible();
    });
});

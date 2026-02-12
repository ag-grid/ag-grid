import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // Filter "startsWith ProjectAlpha" applied onGridReady with excludeChildrenWhenTreeDataFiltering: true
        // Wait for grid to render, then for the filter to take effect
        const rows = page.locator('.ag-row');
        await expect(rows.first()).toBeVisible();

        const groupValues = page.locator('.ag-group-value');

        // Wait for filter to take effect - Downloads should NOT be visible after filtering
        await expect(groupValues.filter({ hasText: 'Downloads' })).toHaveCount(0);

        // ProjectAlpha should be visible (matching the filter)
        await expect(groupValues.filter({ hasText: 'ProjectAlpha' }).first()).toBeVisible();

        // Documents and Work should be visible (ancestors of matching ProjectAlpha)
        await expect(groupValues.filter({ hasText: 'Documents' }).first()).toBeVisible();
    });
});

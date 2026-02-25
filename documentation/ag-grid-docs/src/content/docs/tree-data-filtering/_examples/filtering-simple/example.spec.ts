import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // Filter "startsWith ProjectAlpha" is applied onGridReady
        // Only rows matching the filter should be visible
        const groupValues = page.locator('.ag-group-value');

        // ProjectAlpha groups should be visible (matching the filter)
        await expect(groupValues.filter({ hasText: 'ProjectAlpha' }).first()).toBeVisible();

        // Downloads should NOT be visible (filtered out)
        await expect(groupValues.filter({ hasText: 'Downloads' })).toHaveCount(0);
    });
});

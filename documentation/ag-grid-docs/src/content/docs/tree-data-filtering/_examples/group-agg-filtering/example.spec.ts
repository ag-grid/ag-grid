import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // Filter on size column = 5193728 applied onGridReady
        // Documents > Work has aggregated size = 5193728
        const groupValues = page.locator('.ag-group-value');

        // Documents and Work should be visible (matching aggregated filter)
        await expect(groupValues.filter({ hasText: 'Documents' }).first()).toBeVisible();
        await expect(groupValues.filter({ hasText: 'Work' }).first()).toBeVisible();

        // Desktop should NOT be visible (its aggregated size doesn't match)
        await expect(groupValues.filter({ hasText: 'Desktop' })).toHaveCount(0);
    });
});

import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Displays loading rows before client-side row data arrives', async ({ agIdFor, page }) => {
        await expect(page.locator('.ag-row-loading')).toHaveCount(10);
        await expect(page.locator('.ag-skeleton-effect').first()).toBeVisible();
        await expect(page.locator('.ag-overlay-loading-center')).toHaveCount(0);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(page.locator('.ag-row-loading')).toHaveCount(0);
    });
});

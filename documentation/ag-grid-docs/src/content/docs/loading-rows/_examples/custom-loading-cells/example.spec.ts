import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Displays a custom loading component for one column', async ({ agIdFor, page }) => {
        await expect(page.locator('.ag-row-loading')).toHaveCount(10);

        const customLoadingCell = page.locator('.ag-cell[col-id="athlete"] .ag-custom-loading-cell').first();
        await expect(customLoadingCell).toBeVisible();
        await expect(customLoadingCell).toContainText('Loading athletes...');

        await expect(page.locator('.ag-cell[col-id="country"] .ag-skeleton-effect').first()).toBeVisible();

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(page.locator('.ag-custom-loading-cell')).toHaveCount(0);
    });
});

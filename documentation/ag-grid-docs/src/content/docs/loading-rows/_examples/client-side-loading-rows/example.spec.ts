import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Displays skeleton loading rows while loading is enabled', async ({ page }) => {
        await expect(page.locator('.ag-row-loading')).toHaveCount(10);
        await expect(page.locator('.ag-skeleton-effect').first()).toBeVisible();
        await expect(page.locator('.ag-overlay-loading-center')).toHaveCount(0);
    });

    test.eachFramework('Row count input controls the number of loading rows', async ({ page }) => {
        const rowCount = page.locator('#row-count');

        await rowCount.fill('3');
        await rowCount.press('Tab');
        await expect(page.locator('.ag-row-loading')).toHaveCount(3);

        await rowCount.fill('15');
        await rowCount.press('Tab');
        await expect(page.locator('.ag-row-loading')).toHaveCount(15);
    });

    test.eachFramework('Loading toggle switches between skeleton rows and row data', async ({ agIdFor, page }) => {
        const loading = page.locator('#loading-toggle');

        await loading.uncheck();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(page.locator('.ag-row-loading')).toHaveCount(0);

        await loading.check();
        await expect(page.locator('.ag-row-loading')).toHaveCount(10);
    });
});

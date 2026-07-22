import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Loading overlay toggles with the loading option', async ({ agIdFor, page }) => {
        const loadingOverlay = page.locator('.ag-overlay-loading-center');

        // loading starts true, so the loading overlay is shown
        await expect(loadingOverlay).toBeVisible();
        await expect(loadingOverlay).toContainText('Loading...');

        // provide data and turn loading off -> overlay hidden and row rendered
        await page.getByRole('button', { name: 'Set rowData' }).click();
        await page.getByRole('checkbox').uncheck();
        await expect(loadingOverlay).toBeHidden();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // turning loading back on shows the overlay again
        await page.getByRole('checkbox').check();
        await expect(loadingOverlay).toBeVisible();
    });
});

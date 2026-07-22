import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom loading overlay renders custom markup', async ({ agIdFor, page }) => {
        // custom loading overlay set via the legacy loadingOverlayComponent renders its own markup
        const customOverlay = page.locator('.overlay-loading-center');

        // loading starts true -> custom overlay shown with the custom message
        await expect(customOverlay).toBeVisible();
        await expect(customOverlay).toContainText('One moment please...');

        // turning loading off reveals the row data
        await page.getByRole('checkbox').uncheck();
        await expect(customOverlay).toBeHidden();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // turning loading back on shows the custom overlay again
        await page.getByRole('checkbox').check();
        await expect(customOverlay).toBeVisible();
    });
});

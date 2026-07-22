import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Single overlay component renders per overlay type', async ({ page }) => {
        // one custom overlayComponent covers all overlay types, switching text by overlayType
        const customOverlay = page.locator('.overlay-center');

        // loading starts true -> loading message
        await expect(customOverlay).toBeVisible();
        await expect(customOverlay).toContainText('Custom loading message');

        // turning loading off with empty rowData -> no-rows message from the same component
        await page.getByRole('checkbox').uncheck();
        await expect(customOverlay).toBeVisible();
        await expect(customOverlay).toContainText('Custom no rows message');
    });
});

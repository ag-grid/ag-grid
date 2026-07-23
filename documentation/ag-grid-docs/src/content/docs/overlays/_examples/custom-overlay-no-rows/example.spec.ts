import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom no-rows overlay renders custom markup', async ({ agIdFor, page }) => {
        // custom no-rows overlay set via the legacy noRowsOverlayComponent renders its own markup
        const customOverlay = page.locator('.overlay-loading-center');

        // rowData starts empty -> custom overlay shown with the dynamic message
        await expect(customOverlay).toBeVisible();
        await expect(customOverlay).toContainText('No rows found at:');

        // setting row data hides the overlay and renders the row
        await page.getByRole('button', { name: 'Set rowData' }).click();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(customOverlay).toBeHidden();

        // clearing row data shows the custom overlay again
        await page.getByRole('button', { name: 'Clear rowData' }).click();
        await expect(customOverlay).toBeVisible();
    });
});

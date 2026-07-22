import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom active overlay reflects its params', async ({ agIdFor, page }) => {
        const customOverlay = page.locator('.my-custom-overlay');

        // activeOverlay is set from the start with count 1
        await expect(customOverlay).toBeVisible();
        await expect(customOverlay).toContainText('Custom Overlay: 1');

        // incrementing the param refreshes the overlay content
        await page.getByRole('button', { name: 'Increment Param' }).click();
        await expect(customOverlay).toContainText('Custom Overlay: 2');

        // hiding clears the overlay and reveals the rows
        await page.getByRole('button', { name: 'Hide custom overlay' }).click();
        await expect(customOverlay).toBeHidden();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // showing it again brings back the overlay with the current param
        await page.getByRole('button', { name: 'Show custom overlay' }).click();
        await expect(customOverlay).toBeVisible();
        await expect(customOverlay).toContainText('Custom Overlay: 2');
    });
});

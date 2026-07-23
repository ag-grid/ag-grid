import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Active overlay can be switched on demand', async ({ agIdFor, page }) => {
        const noRowsOverlay = page.locator('.ag-overlay-no-rows-center');
        const statusOverlay = page.locator('.status-overlay');

        // grid has rows and no active overlay initially
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(noRowsOverlay).toBeHidden();
        await expect(statusOverlay).toBeHidden();

        // provided no-rows overlay can be shown even though the grid has rows
        await page.getByRole('button', { name: 'activeOverlay = agNoRowsOverlay' }).click();
        await expect(noRowsOverlay).toBeVisible();

        // switch to the custom status overlay registered in the components map
        // (its rendered text differs per framework, so just assert it takes over)
        await page.getByRole('button', { name: 'activeOverlay = CustomOverlay' }).click();
        await expect(statusOverlay).toBeVisible();
        await expect(statusOverlay).toContainText(/ustom/);
        await expect(noRowsOverlay).toBeHidden();

        // hide the active overlay
        await page.getByRole('button', { name: 'Hide activeOverlay' }).click();
        await expect(statusOverlay).toBeHidden();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });
});

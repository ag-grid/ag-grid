import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('No rows overlay toggles with row data', async ({ agIdFor, page }) => {
        const noRowsOverlay = page.locator('.ag-overlay-no-rows-center');

        // rowData starts empty, so the no-rows overlay is shown
        await expect(noRowsOverlay).toBeVisible();
        await expect(noRowsOverlay).toContainText('No Rows To Show');

        // setting row data hides the overlay and renders the row
        await page.getByRole('button', { name: 'Set rowData' }).click();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(noRowsOverlay).toBeHidden();

        // clearing row data shows the overlay again
        await page.getByRole('button', { name: 'Clear rowData' }).click();
        await expect(noRowsOverlay).toBeVisible();
    });
});

import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('clicking a row sets its height to 100px and Reset restores it', async ({ page }) => {
        await waitForGridContent(page);

        // getRowHeight sizes each row via a sine curve (max 80px), so no row is naturally 100px.
        const topRow = page.locator('.ag-row[row-index="0"]').first();
        // Wait for the top row to hold real data before interacting with it.
        await expect(topRow.locator('.ag-cell').first()).toHaveText(/\S/);

        const originalHeight = (await topRow.boundingBox())!.height;
        // Sanity: the natural height is clearly below the 100px click height.
        expect(originalHeight).toBeLessThan(90);

        // onRowClicked sets the clicked node's height to 100px.
        await topRow.locator('.ag-cell').first().click();
        await expect(topRow).toHaveCSS('height', '100px');

        // "Reset Row Heights" recalculates heights from getRowHeight, discarding the
        // manual 100px height set by the click.
        await page.getByRole('button', { name: 'Reset Row Heights' }).click();
        await expect(topRow).not.toHaveCSS('height', '100px');
        const resetHeight = (await topRow.boundingBox())!.height;
        // The manual 100px height is discarded and the row returns to its (sub-90px) getRowHeight value.
        expect(resetHeight).toBeLessThan(90);
    });
});

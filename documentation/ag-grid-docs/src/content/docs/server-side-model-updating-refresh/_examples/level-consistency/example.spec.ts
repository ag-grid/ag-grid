import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('reports inconsistencies while data changes, and none once it stops', async ({ page }) => {
        await waitForGridContent(page);

        // The second block is read after the server deletes a row, so a row is dropped at its boundary.
        await expect(page.locator('#lastInconsistency')).toContainText('Rows dropped at row 10');
        await expect(page.locator('#inconsistencyCount')).not.toHaveText('0');

        await page.locator('#changeData').uncheck();
        await page.getByRole('button', { name: 'Reload' }).click();
        await expect(page.locator('.ag-row-loading').first()).toBeVisible();
        await expect(page.locator('.ag-row-loading')).toHaveCount(0);

        await expect(page.locator('#inconsistencyCount')).toHaveText('0');
        await expect(page.locator('#lastInconsistency')).toHaveText('None');
    });
});

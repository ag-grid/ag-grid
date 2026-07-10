import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Normal columns show the two base groups', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete Details' })).toHaveCount(1);
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Sports Results' })).toHaveCount(1);
        await expect(page.locator('.ag-header-cell[col-id="region1"]')).toHaveCount(0);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('Extra Cols adds columns to the Athlete Details group', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Extra Cols' }).click();

        await expect(page.locator('.ag-header-cell[col-id="region1"]').first()).toBeVisible();
        await expect(page.locator('.ag-header-cell[col-id="region2"]').first()).toBeVisible();
        await expect(page.locator('.ag-header-cell[col-id="distance"]').first()).toBeVisible();

        // Existing grouped columns keep their data.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');

        await page.getByRole('button', { name: 'Normal Cols' }).click();
        await expect(page.locator('.ag-header-cell[col-id="region1"]')).toHaveCount(0);
    });
});

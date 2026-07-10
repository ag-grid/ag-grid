import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid renders the olympic data and export form', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of small-olympic-winners (filtered to rows with a country).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'gold')).toContainText('1');
        await expect(agIdFor.cell('0', 'silver')).toContainText('2');
        await expect(agIdFor.cell('0', 'bronze')).toContainText('3');
        await expect(agIdFor.cell('0', 'total')).toContainText('6');

        // Page-setup form controls exposed by the example, with their default values.
        await expect(page.locator('#pageOrientation')).toHaveValue('Portrait');
        await expect(page.locator('#pageSize')).toHaveValue('Letter');
        await expect(page.locator('#top')).toHaveValue('0.75');
        await expect(page.locator('#left')).toHaveValue('0.7');
        await expect(page.locator('input[type="submit"]')).toBeVisible();
    });

    test.eachFramework('Page setup controls can be reconfigured', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The form drives the pageSetup / margins passed to exportDataAsExcel.
        await page.locator('#pageOrientation').selectOption('Landscape');
        await expect(page.locator('#pageOrientation')).toHaveValue('Landscape');

        await page.locator('#pageSize').selectOption('A3');
        await expect(page.locator('#pageSize')).toHaveValue('A3');

        await page.locator('#top').fill('1');
        await expect(page.locator('#top')).toHaveValue('1');
    });

    test.eachFramework('Sorting by total reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Natalie Coughlin (total 6) is the unique maximum and starts at the top.
        const topTotal = () => page.locator('.ag-row[row-index="0"] [col-id="total"]').first();
        await expect(topTotal()).toContainText('6');

        // Ascending sort pushes the maximum to the bottom, so the top total is now the minimum.
        await agIdFor.headerCell('total').click();
        await expect(topTotal()).not.toContainText('6');

        await page.waitForTimeout(300); // avoid a double-click
        // Descending sort brings the maximum back to the top.
        await agIdFor.headerCell('total').click();
        await expect(topTotal()).toContainText('6');
    });
});

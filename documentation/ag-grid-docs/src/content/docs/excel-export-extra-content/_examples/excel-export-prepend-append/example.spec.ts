import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid shows the olympic data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'total')).toContainText('6');
    });

    test.eachFramework('Prepend and append content checkboxes toggle', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const prepend = page.locator('#prependContent');
        const append = page.locator('#appendContent');

        await expect(prepend).not.toBeChecked();
        await expect(append).not.toBeChecked();

        await prepend.check();
        await append.check();

        await expect(prepend).toBeChecked();
        await expect(append).toBeChecked();
    });

    test.eachFramework('Sorting by total floats the highest medal count to the top', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Natalie Coughlin (total 6) is the unique maximum; the minimum total is 4.
        const topRow = page.locator('.ag-row[row-index="0"]');
        await agIdFor.headerCell('total').click(); // ascending -> min (4) on top
        await expect(topRow).not.toContainText('Natalie Coughlin');
        await page.waitForTimeout(300);
        await agIdFor.headerCell('total').click(); // descending -> max (6) on top
        await expect(topRow).toContainText('Natalie Coughlin');
    });
});

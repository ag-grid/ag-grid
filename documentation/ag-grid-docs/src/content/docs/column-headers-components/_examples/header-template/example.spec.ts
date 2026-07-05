import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom template renders headers and data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The template re-uses the provided header component, so the display names still render.
        await expect(agIdFor.headerCell('athlete')).toContainText('Athlete Name', { useInnerText: true });
        await expect(agIdFor.headerCell('gold')).toContainText('Gold', { useInnerText: true });

        // First data row is Michael Phelps (8 gold, 8 total).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Sorting still works through the custom template', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const goldHeader = agIdFor.headerCell('gold');
        const firstRowGold = page.locator('.ag-row[row-index="0"] [col-id="gold"]').first();

        // First click sorts ascending: the min gold (0) floats to the top.
        await goldHeader.click();
        await expect(firstRowGold).toContainText('0');

        // Pause so the next click is not treated as a double-click, then sort descending.
        await page.waitForTimeout(300);
        await goldHeader.click();
        await expect(firstRowGold).toContainText('8');
    });
});

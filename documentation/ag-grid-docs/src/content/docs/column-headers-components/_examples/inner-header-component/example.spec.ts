import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Inner header component renders name and icon', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The inner header component replaces just the name display, wrapped in .customInnerHeader.
        await expect(agIdFor.headerCell('athlete').locator('.customInnerHeader')).toContainText('Athlete', {
            useInnerText: true,
        });
        // The age column configures an icon in the inner header params.
        await expect(agIdFor.headerCell('age').locator('.customInnerHeader i.fa')).toBeVisible();

        // First data row is Michael Phelps (8 gold, 8 total).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('Sorting still works with an inner header component', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const goldHeader = agIdFor.headerCell('gold');
        const firstRowGold = page.locator('.ag-row[row-index="0"] [col-id="gold"]').first();

        // Clicking the header sorts ascending: the min gold (0) floats to the top.
        await goldHeader.click();
        await expect(firstRowGold).toContainText('0');

        // Pause to avoid a double-click, then sort descending: the unique max gold (8) floats to the top.
        await page.waitForTimeout(300);
        await goldHeader.click();
        await expect(firstRowGold).toContainText('8');
    });
});

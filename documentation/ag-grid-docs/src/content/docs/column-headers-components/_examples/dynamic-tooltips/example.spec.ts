import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom header renders labels and data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The custom header renders the configured headerName in its own label element.
        await expect(agIdFor.headerCell('gold')).toContainText('Gold Medals', { useInnerText: true });
        await expect(agIdFor.headerCell('athlete')).toContainText("Athlete's Full Name", { useInnerText: true });

        // First data row is Michael Phelps (8 gold, 8 total).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('Custom header sort buttons reorder rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const goldHeader = agIdFor.headerCell('gold');
        const firstRowGold = page.locator('.ag-row[row-index="0"] [col-id="gold"]').first();

        // The custom "sort down" button sorts ascending, so the min gold (0) floats to the top.
        await goldHeader.locator('.customSortDownLabel').click();
        await expect(firstRowGold).toContainText('0');

        // The custom "sort up" button sorts descending, so the unique max gold (8) floats to the top.
        await goldHeader.locator('.customSortUpLabel').click();
        await expect(firstRowGold).toContainText('8');
    });
});

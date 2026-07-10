import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid shows the olympic data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // gold/silver/bronze/total columns are hidden on this example.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.headerCell('total')).toHaveCount(0);
    });

    test.eachFramework('Sorting by country reorders rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Australia is alphabetically first amongst the countries present.
        await agIdFor.headerCell('country').click();
        await expect(page.locator('.ag-row[row-index="0"]')).toContainText('Australia');
    });
});

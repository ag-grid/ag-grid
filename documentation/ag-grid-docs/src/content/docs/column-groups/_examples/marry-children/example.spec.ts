import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Both marryChildren groups render with their columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete Details' })).toHaveCount(1);
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Sports Results' })).toHaveCount(1);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('Sorting a column inside a group reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const firstAthlete = page.locator('.ag-row[row-index="0"] [col-id="athlete"]');
        await expect(firstAthlete).toContainText('Michael Phelps');

        // Sort ascending by athlete: an alphabetically-earlier name floats to the top.
        await agIdFor.headerCell('athlete').click();
        await expect(firstAthlete).not.toContainText('Michael Phelps');
    });
});

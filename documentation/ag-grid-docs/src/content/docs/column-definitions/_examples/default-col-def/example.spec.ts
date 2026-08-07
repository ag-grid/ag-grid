import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('defaultColDef applies bold cell style to all columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First data row is Michael Phelps and the defaultColDef bolds every cell.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'athlete')).toHaveCSS('font-weight', '700');
        await expect(agIdFor.cell('0', 'age')).toHaveCSS('font-weight', '700');
    });

    test.eachFramework('Sorting by age reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Assert on whichever row is at the top rather than following the Michael Phelps node:
        // sorting by age ascending moves him far enough down that he is virtualised out of the DOM,
        // and an assertion against a removed element fails on the element rather than the ordering.
        const topAthlete = page.locator('.ag-row[row-index="0"]').locator('[col-id="athlete"]');
        await expect(topAthlete).toHaveText('Michael Phelps'); // age 23
        await agIdFor.headerCell('age').click(); // ascending
        await expect(topAthlete).not.toHaveText('Michael Phelps');
    });
});

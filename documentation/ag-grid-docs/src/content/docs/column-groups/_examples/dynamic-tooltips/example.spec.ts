import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom header group renders and data loads', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const athleteGroup = page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete Details' }).first();
        await expect(athleteGroup.locator('.customHeaderLabel')).toContainText('Athlete Details');

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });

    test.eachFramework('Custom expand button opens the group', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-header-cell[col-id="age"]')).toHaveCount(0);

        const athleteGroup = page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete Details' }).first();
        await athleteGroup.locator('.customExpandButton').click();

        await expect(agIdFor.cell('0', 'age')).toContainText('23');
    });
});

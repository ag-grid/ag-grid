import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom inner header group renders the name and icon', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const athleteGroup = page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete Details' }).first();
        await expect(athleteGroup.locator('.customInnerHeaderGroup')).toContainText('Athlete Details');
        // The 'fa-user' icon is passed through headerGroupComponentParams for the Athlete Details group.
        await expect(athleteGroup.locator('.customInnerHeaderGroup i.fa-user')).toHaveCount(1);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });

    test.eachFramework('The standard expand button still opens the group', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-header-cell[col-id="age"]')).toHaveCount(0);

        const athleteGroup = page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete Details' }).first();
        await athleteGroup.locator('.ag-header-expand-icon-collapsed').first().click();

        await expect(agIdFor.cell('0', 'age')).toContainText('23');
    });
});

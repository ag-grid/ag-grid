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

    test.eachFramework('Group tooltip shows only while the group is collapsed', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const athleteGroup = page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete Details' }).first();
        const tooltip = page.locator('.ag-tooltip:not(.ag-tooltip-hiding)');

        await athleteGroup.locator('.customHeaderLabel').hover();
        await expect(tooltip).toHaveText('Expand the group to show more columns');

        await athleteGroup.locator('.customExpandButton').click();
        await page.mouse.move(0, 0);
        await expect(tooltip).toHaveCount(0);
        await athleteGroup.locator('.customHeaderLabel').hover();
        // The default show delay is 2000ms; wait past it before concluding nothing appeared.
        await page.waitForTimeout(2500);
        await expect(tooltip).toHaveCount(0);
    });
});

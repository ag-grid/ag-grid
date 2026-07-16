import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        // Columns with filters appear in the Filters Tool Panel...
        await expect(agIdFor.filterToolPanelGroup('Athlete')).toBeVisible();
        await expect(agIdFor.filterToolPanelGroup('Age')).toBeVisible();
        await expect(agIdFor.filterToolPanelGroup('Country')).toBeVisible();
        await expect(agIdFor.filterToolPanelGroup('Year')).toBeVisible();
        await expect(agIdFor.filterToolPanelGroup('Date')).toBeVisible();

        // ...while columns with filter: false do not appear.
        await expect(agIdFor.filterToolPanelGroup('Gold')).toHaveCount(0);
        await expect(agIdFor.filterToolPanelGroup('Silver')).toHaveCount(0);
        await expect(agIdFor.filterToolPanelGroup('Bronze')).toHaveCount(0);
        await expect(agIdFor.filterToolPanelGroup('Total')).toHaveCount(0);

        // Initially collapsed - the filter is not shown.
        const athleteGroup = agIdFor.filterToolPanelGroup('Athlete');
        const athleteInput = agIdFor.textFilterInstanceInput({ source: 'filter-toolpanel', colLabel: 'Athlete' });
        await expect(athleteInput).toBeHidden();

        // Clicking the column shows the filter below the column name.
        await athleteGroup.locator('.ag-filter-toolpanel-group-title-bar').first().click();
        await expect(athleteInput).toBeVisible();

        // Applying the filter updates the grid.
        await athleteInput.fill('Michael Phelps');
        await athleteInput.press('Enter');
        await expect(agIdFor.cell('0', 'athlete').first()).toContainText('Michael Phelps');
        // A non-matching filter empties the grid, proving the filter drives the grid.
        await athleteInput.fill('no-such-athlete');
        await athleteInput.press('Enter');
        await expect(agIdFor.overlay()).toContainText('No Matching Rows');
        await athleteInput.fill('');
        await athleteInput.press('Enter');

        // Clicking a second time hides the filter again.
        await athleteGroup.locator('.ag-filter-toolpanel-group-title-bar').first().click();
        await expect(athleteInput).toBeHidden();
    });
});

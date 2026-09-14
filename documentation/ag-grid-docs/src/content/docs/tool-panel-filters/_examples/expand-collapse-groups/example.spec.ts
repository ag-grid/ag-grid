import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        // The collapsed icon is visible when a group is collapsed, hidden when expanded.
        const athleteCollapsed = agIdFor.filterToolPanelGroupCollapsedIcon('Athlete');
        const competitionCollapsed = agIdFor.filterToolPanelGroupCollapsedIcon('Competition');

        // onGridReady calls collapseFilterGroups() so all groups start collapsed.
        await expect(athleteCollapsed).toBeVisible();

        // Expand Athlete & Competition -> both groups expand.
        await page.getByRole('button', { name: 'Expand Athlete & Competition' }).click();
        await expect(athleteCollapsed).toBeHidden();
        await expect(competitionCollapsed).toBeHidden();

        // Collapse Competition -> only Competition collapses.
        await page.getByRole('button', { name: 'Collapse Competition' }).click();
        await expect(competitionCollapsed).toBeVisible();
        await expect(athleteCollapsed).toBeHidden();

        // Collapse All -> Athlete collapses.
        await page.getByRole('button', { name: 'Collapse All' }).click();
        await expect(athleteCollapsed).toBeVisible();

        // Expand All -> groups expand again.
        await page.getByRole('button', { name: 'Expand All' }).click();
        await expect(athleteCollapsed).toBeHidden();
        await expect(competitionCollapsed).toBeHidden();
    });

    test.eachFramework('Expand All leaves Sport alone as it is not a filter group', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        // Sport is a plain top-level column, not a filter group.
        const sportGroup = agIdFor.filterToolPanelGroup('Sport');
        const sportFilterHeader = sportGroup.locator('.ag-filter-toolpanel-instance-header');
        const sportFilterBody = sportGroup.locator('.ag-filter-toolpanel-instance-filter');

        await expect(sportGroup).toBeVisible();
        await expect(sportFilterHeader).toHaveAttribute('aria-expanded', 'false');
        await expect(sportFilterBody).toHaveCount(0);

        // Expand All expands the real filter groups...
        await page.getByRole('button', { name: 'Expand All' }).click();
        await expect(agIdFor.filterToolPanelGroupCollapsedIcon('Athlete')).toBeHidden();
        await expect(agIdFor.filterToolPanelGroupCollapsedIcon('Competition')).toBeHidden();
        await expect(agIdFor.filterToolPanelGroupCollapsedIcon('Medals')).toBeHidden();

        // ...but Sport is unaffected, as it is not a filter group.
        await expect(sportFilterHeader).toHaveAttribute('aria-expanded', 'false');
        await expect(sportFilterBody).toHaveCount(0);
    });
});

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
});

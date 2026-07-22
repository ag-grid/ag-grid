import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'suppressExpandablePivotGroups shows all pivot columns with no expand/collapse controls',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Pivot columns are sport and year. The top-level `sport` group is present but NOT expandable.
            const alpineGroup = agIdFor.headerGroupCell('pivotGroup_sport-year_Alpine Skiing_0');
            await expect(alpineGroup).toBeVisible();
            await expect(alpineGroup).toContainText('Alpine Skiing');
            // No expand/collapse control is shown - both expand icons are hidden.
            await expect(alpineGroup.locator('.ag-header-expand-icon-collapsed')).not.toBeVisible();
            await expect(alpineGroup.locator('.ag-header-expand-icon-expanded')).not.toBeVisible();

            // With no expandable groups, the nested year subgroups are always shown directly.
            await expect(agIdFor.headerGroupCell('pivotGroup_sport-year_Alpine Skiing-2002_0')).toBeVisible();

            // The leaf value column for a specific sport/year is rendered without any interaction.
            await expect(agIdFor.headerCell('pivot_sport-year_Alpine Skiing-2002_gold')).toBeVisible();
        }
    );
});

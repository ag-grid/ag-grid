import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'pivotDefaultExpanded=1 expands the first pivot group level so the nested year groups are shown',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Pivot columns are sport, year, date. The top-level `sport` group is expanded by default.
            const alpineGroup = agIdFor.headerGroupCell('pivotGroup_sport-year-date_Alpine Skiing_0');
            await expect(alpineGroup).toBeVisible();
            await expect(alpineGroup).toContainText('Alpine Skiing');

            // Because it is expanded, its expand icon shows the expanded state (not collapsed).
            await expect(alpineGroup.locator('.ag-header-expand-icon-expanded')).toBeVisible();

            // The second pivot level (year) is revealed as nested groups under the expanded sport group.
            await expect(agIdFor.headerGroupCell('pivotGroup_sport-year-date_Alpine Skiing-2002_0')).toBeVisible();
        }
    );
});

import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'processPivotResultColGroupDef applies the pivot-gold class to every pivot group header cell',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Pivot on `sport`; the leftmost (alphabetical) group is `Alpine Skiing`.
            const alpineGroup = agIdFor.headerGroupCell('pivotGroup_sport_Alpine Skiing_0');
            await expect(alpineGroup).toBeVisible();
            await expect(alpineGroup).toContainText('Alpine Skiing');

            // The callback mutates the group colDef to add headerClass: 'pivot-gold'.
            await expect(alpineGroup).toHaveClass(/pivot-gold/);

            // Single aggregated value column (gold) forms the group's only child column.
            await expect(agIdFor.headerCell('pivot_sport_Alpine Skiing_gold')).toContainText('Gold');

            // The class is applied to all generated pivot groups, not just the first.
            const goldGroups = page.locator('.ag-header-group-cell.pivot-gold');
            await expect(goldGroups.first()).toBeVisible();
            expect(await goldGroups.count()).toBeGreaterThan(1);
        }
    );
});

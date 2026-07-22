import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Pivot mode on: country row-grouped, gold summed, pivoted by sport.
    // Pivot result columns are generated per sport value (id `pivot_sport_<Sport>_gold`).
    // Values calculated from olympic-winners.json: United States gold in
    // Alpine Skiing = 4, Athletics = 69.
    test.eachFramework('Pivoting by sport generates a gold column per sport', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Pivot result columns are grouped by the pivot field (sport): the leaf
        // column is the `sum(Gold)` measure nested under a `Alpine Skiing` header group.
        const alpineGroup = agIdFor.headerGroupCell('pivotGroup_sport_Alpine Skiing_0');
        await expect(alpineGroup).toBeVisible();
        await expect(alpineGroup).toContainText('Alpine Skiing');
        await expect(agIdFor.headerCell('pivot_sport_Alpine Skiing_gold')).toContainText('Gold');

        // Aggregated (summed) gold values per country per sport.
        await expect(agIdFor.cell('row-group-country-United States', 'pivot_sport_Alpine Skiing_gold')).toContainText(
            '4'
        );
        await expect(agIdFor.cell('row-group-country-United States', 'pivot_sport_Athletics_gold')).toContainText('69');
    });
});

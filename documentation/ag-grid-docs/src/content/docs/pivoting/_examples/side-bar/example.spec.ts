import { dragOverTo, ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Country row-grouped, gold summed, pivotMode: true. Sport has enablePivot but is NOT pivoted
    // initially, so pivot mode is on with no pivot active. The user can add Sport to the column
    // labels via the side bar to make a pivot active.
    // Values from olympic-winners.json (United States): total gold = 552; Alpine Skiing = 4, Athletics = 69.

    test.eachFramework('Pivot mode on but no pivot active shows aggregated group totals', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // With no pivot active the grid shows the summed gold total per country group...
        await expect(agIdFor.cell('row-group-country-United States', 'gold')).toContainText('552');
        // ...and no pivot result columns exist yet.
        await expect(agIdFor.headerGroupCell('pivotGroup_sport_Athletics_0')).toHaveCount(0);
    });

    test.eachFramework(
        'Adding Sport to Column Labels via the side bar creates pivot columns',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            // Drag the Sport column into the Column Labels drop area to activate the pivot.
            await dragOverTo(
                agIdFor.columnSelectListItemDragHandle('Sport Column'),
                agIdFor.columnDropArea('toolbar', 'Column Labels')
            );
            await waitForRowAnimations(page);

            // Pivot result columns grouped by sport now appear, with aggregated gold values per country.
            await expect(agIdFor.headerGroupCell('pivotGroup_sport_Alpine Skiing_0')).toBeVisible();
            await expect(
                agIdFor.cell('row-group-country-United States', 'pivot_sport_Alpine Skiing_gold')
            ).toContainText('4');
            await expect(agIdFor.cell('row-group-country-United States', 'pivot_sport_Athletics_gold')).toContainText(
                '69'
            );
        }
    );
});

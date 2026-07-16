import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Country row-grouped, gold summed, pivoted by Sport then Year. pivotPanelShow: 'onlyWhenPivoting'
    // shows the pivot panel because a pivot is active, and the columns tool panel is configured with
    // suppressPivots/suppressPivotMode to hide its pivoting section.
    // Values from olympic-winners.json (United States): Athletics gold total = 69; Athletics 2000 = 16.

    test.eachFramework(
        'Pivot panel is shown while pivoting and the tool panel hides pivot controls',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            // The panel bar is only rendered because a pivot is active (pivotPanelShow: 'onlyWhenPivoting').
            await expect(agIdFor.columnDropArea('toolbar', 'Row Groups')).toBeVisible();

            // Sport and Year are the active pivot (column label) fields.
            const columnLabels = agIdFor.columnDropArea('panel', 'Column Labels');
            await expect(columnLabels).toContainText('Sport');
            await expect(columnLabels).toContainText('Year');

            // The columns tool panel suppresses the pivot mode toggle.
            await expect(agIdFor.pivotModeSelect()).toHaveCount(0);
        }
    );

    test.eachFramework(
        'Pivot result columns are grouped by sport and expand to yearly gold',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            await expect(agIdFor.headerGroupCell('pivotGroup_sport-year_Alpine Skiing_0')).toBeVisible();

            // Each sport group collapses to a summed gold total across all years.
            await expect(
                agIdFor.cell('row-group-country-United States', 'pivot_sport-year_Athletics_gold')
            ).toContainText('69');

            // Expanding the sport group reveals a gold column per year.
            await agIdFor
                .headerGroupCell('pivotGroup_sport-year_Athletics_0')
                .locator('.ag-header-expand-icon-collapsed')
                .click();
            await waitForRowAnimations(page);
            await expect(
                agIdFor.cell('row-group-country-United States', 'pivot_sport-year_Athletics-2000_gold')
            ).toContainText('16');
        }
    );
});

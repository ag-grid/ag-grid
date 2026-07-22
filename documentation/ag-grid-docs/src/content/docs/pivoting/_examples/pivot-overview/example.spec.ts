import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Country row-grouped, gold summed, pivoted by Sport then Year, with the pivot panel always shown.
    // Pivot result columns are grouped by sport; each sport group collapses to a gold total that
    // expands into per-year gold columns.
    // Values from olympic-winners.json (United States): Athletics gold total = 69; Athletics 2000 = 16.

    test.eachFramework('Pivot panel shows the active pivot fields', async ({ agIdFor }) => {
        const columnLabels = agIdFor.columnDropArea('toolbar', 'Column Labels');
        await expect(columnLabels).toContainText('Sport');
        await expect(columnLabels).toContainText('Year');
    });

    test.eachFramework(
        'Pivot result columns are grouped by sport and expand to yearly gold',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            // Columns are grouped by the first pivot field (sport).
            await expect(agIdFor.headerGroupCell('pivotGroup_sport-year_Alpine Skiing_0')).toBeVisible();

            // Each sport group collapses to a summed gold total across all years.
            await expect(
                agIdFor.cell('row-group-country-United States', 'pivot_sport-year_Athletics_gold')
            ).toContainText('69');

            // Expanding the sport group reveals a gold column per year (the second pivot field).
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

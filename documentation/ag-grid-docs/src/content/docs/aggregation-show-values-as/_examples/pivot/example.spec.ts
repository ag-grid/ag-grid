import { expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Each pivot column shows gold as a share of that column total', async ({ agIdFor }) => {
        // Pivot by year, gold shown as percentOfColumnTotal (each year column sums to 100%).
        // United States gold in 2000 = 130 of column total 663 => 19.61%.
        // In 2004 = 118 of 665 => 17.74%.
        await expect(agIdFor.cell('row-group-country-United States', 'pivot_year_2000_gold')).toContainText('19.61%');
        await expect(agIdFor.cell('row-group-country-United States', 'pivot_year_2004_gold')).toContainText('17.74%');
    });

    test.eachFramework('Sorting a pivot gold column floats the largest share to the top', async ({ agIdFor, page }) => {
        // United States has the unique largest gold count in 2000 (130), so it floats to the
        // top when the 2000 gold column is sorted descending. Sorting acts on the underlying
        // aggregate, not the displayed percentage.
        const usGroup = agIdFor.rowNode('row-group-country-United States');

        await agIdFor.headerCell('pivot_year_2000_gold').click(); // ascending
        await waitForRowAnimations(page);
        await expect(usGroup).not.toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('pivot_year_2000_gold').click(); // descending
        await waitForRowAnimations(page);
        await expect(usGroup).toHaveAttribute('row-index', '0');
    });
});

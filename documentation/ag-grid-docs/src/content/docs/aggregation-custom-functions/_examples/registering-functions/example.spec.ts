import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Registered custom range function aggregates the total column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The `range` aggFunc is registered by name and applied to the `total` column.
        // range = max(total) - min(total) across each country's leaf rows.
        // United States: max 8, min 1 => 7. Netherlands: max 4, min 1 => 3.
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States', {
            useInnerText: true,
        });
        await expect(agIdFor.cell('row-group-country-United States', 'total')).toContainText('7');
        await expect(agIdFor.cell('row-group-country-Netherlands', 'total')).toContainText('3');
    });

    test.eachFramework('Group rows can be sorted by the aggregated value', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // United States has the largest range (7) of any country, so sorting the total column
        // descending must bring its group to the top row.
        const usGroup = agIdFor.rowNode('row-group-country-United States');

        // First click sorts ascending: the smallest range (0) sits at the top, US drops away from it.
        await agIdFor.headerCell('total').click();
        await waitForRowAnimations(page);
        await expect(usGroup).not.toHaveAttribute('row-index', '0');

        // Second click sorts descending: US (range 7) becomes the top group row.
        await agIdFor.headerCell('total').click();
        await waitForRowAnimations(page);
        await expect(usGroup).toHaveAttribute('row-index', '0');
    });

    test.eachFramework('Expanding a country group reveals its leaf rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The first leaf row (index 0) is Michael Phelps (United States) with a total of 8; it is
        // hidden until the United States group is expanded.
        await expect(agIdFor.cell('0', 'total')).not.toBeVisible();
        await agIdFor.autoGroupContracted('row-group-country-United States').click();
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });
});

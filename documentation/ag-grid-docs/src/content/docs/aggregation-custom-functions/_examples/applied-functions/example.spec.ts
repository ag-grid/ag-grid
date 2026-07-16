import {
    ensureGridReady,
    expect,
    expectRowIdAtIndex,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Directly applied range function aggregates the total column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The range function is passed directly to the `total` column's aggFunc.
        // range = max(total) - min(total) across each country's leaf rows.
        // United States: max 8, min 1 => 7. Netherlands: max 4, min 1 => 3.
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States', {
            useInnerText: true,
        });
        await expect(agIdFor.cell('row-group-country-United States', 'total')).toContainText('7');
        await expect(agIdFor.cell('row-group-country-Netherlands', 'total')).toContainText('3');
    });

    test.eachFramework('Expanding a country group reveals leaf athletes', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // autoGroupColumnDef.field is `athlete`, so leaf rows show the athlete name in the group
        // column. The first leaf (index 0) is Michael Phelps (United States), total 8, hidden until
        // the United States group is expanded.
        await expect(agIdFor.autoGroupCell('0')).not.toBeVisible();
        await agIdFor.autoGroupContracted('row-group-country-United States').click();
        await expect(agIdFor.autoGroupCell('0')).toContainText('Michael Phelps', { useInnerText: true });
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Group rows can be sorted by the aggregated value', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // United States has the largest range, so an ascending sort of the total column sends its
        // group to the bottom and a descending sort brings it back to the top row.
        await agIdFor.headerCell('total').click();
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, 'row-group-country-United States', { not: true });

        await agIdFor.headerCell('total').click();
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, 'row-group-country-United States');
    });
});

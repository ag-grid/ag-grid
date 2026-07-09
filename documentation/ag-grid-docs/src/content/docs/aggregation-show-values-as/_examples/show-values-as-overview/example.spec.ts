import { expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Raw total sits alongside the same value as % of parent', async ({ agIdFor }) => {
        // Raw sum column vs percentOfParentRowTotal column, grouped by country then year.
        // United States total sum = 38; as a share of the grand total (137) => 27.74%.
        await expect(agIdFor.cell('row-group-country-United States', 'total')).toContainText('38');
        await expect(agIdFor.cell('row-group-country-United States', 'totalPercentOfParent')).toContainText('27.74%');

        // Grand total row (top): raw sum 137. The grand total has no parent, so the
        // percentOfParentRowTotal cell is left blank.
        await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'total').first()).toContainText('137');
        await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'totalPercentOfParent').first()).toHaveText('');
    });

    test.eachFramework(
        'Expanding a country reveals year sub-groups as % of that country',
        async ({ agIdFor, page }) => {
            // United States > 2008 is opened by default (isGroupOpenByDefault).
            // 2008 total sum 10 as a share of the US total (38) => 26.32%.
            const year2008 = agIdFor.cell('row-group-country-United States-year-2008', 'totalPercentOfParent');
            await expect(year2008).toContainText('26.32%');

            // Sorting the raw total column floats the largest country (US, 38) to the top.
            const usGroup = agIdFor.rowNode('row-group-country-United States');
            await agIdFor.headerCell('total').click();
            await waitForRowAnimations(page);
            await expect(usGroup).not.toHaveAttribute('row-index', '1'); // row-index 0 is the top grand total row
            await agIdFor.headerCell('total').click();
            await waitForRowAnimations(page);
            await expect(usGroup).toHaveAttribute('row-index', '1');
        }
    );
});

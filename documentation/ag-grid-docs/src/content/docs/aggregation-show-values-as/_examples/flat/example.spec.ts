import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grand total row shows 100% of the gold column', async ({ agIdFor }) => {
        // On a flat grid each gold value is shown as a share of the column's grand total.
        // The bottom grand total row therefore holds the whole total => 100.00%.
        await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'gold').first()).toContainText('100.00%');
    });

    test.eachFramework('Sorting the gold column floats the largest share to the top', async ({ agIdFor, page }) => {
        const firstRowGold = page.locator('.ag-row[row-index="0"] [col-id="gold"]').first();

        // Ascending: the smallest share (0.00%) is first.
        await agIdFor.headerCell('gold').click();
        await expect(firstRowGold).toContainText('0.00%');

        await page.waitForTimeout(300); // avoid a double-click

        // Descending: the largest single gold value is 8 of 3143 => 0.25%.
        await agIdFor.headerCell('gold').click();
        await expect(firstRowGold).toContainText('0.25%');

        // The grand total denominator is unchanged by sorting.
        await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'gold').first()).toContainText('100.00%');
    });
});

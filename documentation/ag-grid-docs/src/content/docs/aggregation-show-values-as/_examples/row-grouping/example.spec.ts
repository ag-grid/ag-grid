import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Groups show gold as % of parent and total as % of grand total', async ({ agIdFor }) => {
        // gold: percentOfParentRowTotal (denominator = grand gold total 63).
        // United States gold 16 => 25.40%, Australia gold 11 => 17.46%.
        await expect(agIdFor.cell('row-group-country-United States', 'gold')).toContainText('25.40%');
        await expect(agIdFor.cell('row-group-country-Australia', 'gold')).toContainText('17.46%');

        // total: percentOfGrandTotal (denominator = grand total 137).
        // United States total 38 => 27.74%, Australia total 25 => 18.25%.
        await expect(agIdFor.cell('row-group-country-United States', 'total')).toContainText('27.74%');
        await expect(agIdFor.cell('row-group-country-Australia', 'total')).toContainText('18.25%');

        // The bottom grand total row holds the whole total column => 100.00%.
        await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'total').first()).toContainText('100.00%');
    });

    test.eachFramework('Sorting the total column reorders country groups', async ({ agIdFor, page }) => {
        // United States has the unique largest total aggregate (38).
        const usGroup = agIdFor.rowNode('row-group-country-United States');

        await agIdFor.headerCell('total').click(); // ascending
        await expect(usGroup).not.toHaveAttribute('row-index', '0');

        await page.waitForTimeout(300); // avoid a double-click

        await agIdFor.headerCell('total').click(); // descending
        await expect(usGroup).toHaveAttribute('row-index', '0');
    });
});

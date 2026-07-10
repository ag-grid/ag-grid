import { expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

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
        // United States has the unique largest total aggregate (38). Assert on the
        // always-rendered top row (row-index 0) rather than on the US group's own
        // index, which scrolls out of the DOM (virtualised) when sorted to the bottom.
        const topRow = page.locator('.ag-grid-scrolling-container .ag-row[row-index="0"]');
        const usRowId = 'row-group-country-United States';

        // Wait for data to load before sorting so the first click registers.
        await expect(topRow).toHaveAttribute('row-id', usRowId); // initial data order: US first

        await agIdFor.headerCell('total').click(); // ascending → US to the bottom
        await waitForRowAnimations(page);
        await expect(topRow).not.toHaveAttribute('row-id', usRowId);

        await agIdFor.headerCell('total').click(); // descending → US back to the top
        await waitForRowAnimations(page);
        await expect(topRow).toHaveAttribute('row-id', usRowId);
    });
});

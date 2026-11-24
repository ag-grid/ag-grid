import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Group rows show the weighted price per unit', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // North: 4700 revenue / 47 units; South: 7850 / 36; grand total: 12550 / 83
        await expect(agIdFor.cell('row-group-region-North', 'unitPrice')).toContainText('$100.00');
        await expect(agIdFor.cell('row-group-region-South', 'unitPrice')).toContainText('$218.06');
        await expect(agIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'unitPrice')).toContainText('$151.20');
    });

    test.eachFramework('Leaf rows and the header are unchanged', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'unitPrice')).toContainText('$1200.00');
        await expect(agIdFor.headerCell('unitPrice')).toContainText('avg(Unit Price)');
    });

    test.eachFramework('Collapsing a group keeps its weighted price', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.autoGroupExpanded('row-group-region-North').click();

        await expect(agIdFor.cell('0', 'unitPrice')).not.toBeVisible();
        await expect(agIdFor.cell('row-group-region-North', 'unitPrice')).toContainText('$100.00');
    });
});

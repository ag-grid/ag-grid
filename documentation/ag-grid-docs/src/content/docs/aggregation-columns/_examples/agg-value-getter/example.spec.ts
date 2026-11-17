import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    const groupCell = (page: any, name: string, colId: string) =>
        page
            .locator('.ag-row')
            .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
            .first()
            .locator(`[col-id="${colId}"]`);

    test.eachFramework('Group rows show the weighted price per unit', async ({ page }) => {
        // North: 4700 revenue / 47 units; South: 7850 / 36
        await expect(groupCell(page, 'North', 'unitPrice')).toHaveText('$100.00');
        await expect(groupCell(page, 'South', 'unitPrice')).toHaveText('$218.06');
        // grand total: 12550 / 83
        await expect(page.locator('.ag-row-footer [col-id="unitPrice"]').last()).toHaveText('$151.20');
    });

    test.eachFramework('Leaf rows and the header are unchanged', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'unitPrice')).toHaveText('$1200.00');
        await expect(agIdFor.headerCell('unitPrice')).toContainText('avg(Unit Price)');
    });
});

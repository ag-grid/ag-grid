import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Group rows show the gold key and the sum of gold', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: new RegExp(`^${name}$`) }) })
                .first();

        // The group key comes from `gold`, the aggregate from `sum_gold`.
        const gold4 = groupRow('4');
        await expect(gold4.locator('[col-id="ag-Grid-AutoColumn"]')).toContainText('4', { useInnerText: true });
        await expect(gold4.locator('.ag-cell[col-id="gold"]')).toContainText('12');
        await expect(gold4.locator('.ag-cell[col-id="silver"]')).toContainText('2');
        await expect(groupRow('8').locator('.ag-cell[col-id="gold"]')).toContainText('8');

        // Expanding uses the group key, so the group's athletes load.
        await gold4.locator('.ag-group-contracted').first().click();
        await expect(page.locator('.ag-row', { hasText: 'Michael Phelps' }).first()).toBeVisible();
        await expect(page.locator('.ag-row', { hasText: 'Missy Franklin' }).first()).toBeVisible();
    });

    test.eachFramework('Gold is in both Row Groups and Values in the Columns Tool Panel', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expect(agIdFor.columnDropArea('toolbar', 'Row Groups').getByText('Gold')).toBeVisible();
        await expect(agIdFor.columnDropArea('toolbar', 'Values').getByText('sum(Gold)')).toBeVisible();
    });
});

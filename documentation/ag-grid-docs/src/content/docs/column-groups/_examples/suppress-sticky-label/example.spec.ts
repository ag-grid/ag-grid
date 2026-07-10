import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Sports Results is open by default, showing the medal columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // openByDefault: medals ('open') are shown, total ('closed') is hidden.
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.cell('0', 'silver')).toContainText('0');
        await expect(page.locator('.ag-header-cell[col-id="total"]')).toHaveCount(0);

        // The athlete column is pinned to the left.
        await expect(page.locator('.ag-grid-pinned-left-cells .ag-cell[col-id="athlete"]').first()).toContainText(
            'Michael Phelps'
        );
    });

    test.eachFramework('Collapsing the group swaps medals for the total column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const sportsGroup = page.locator('.ag-header-group-cell').filter({ hasText: 'Sports Results' }).first();
        await sportsGroup.locator('.ag-header-expand-icon-expanded').first().click();

        await expect(agIdFor.cell('0', 'total')).toContainText('8');
        await expect(page.locator('.ag-header-cell[col-id="gold"]')).toHaveCount(0);
    });
});

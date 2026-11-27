import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grand total row shows server-aggregated medal totals', async ({ page }) => {
        await waitForGridContent(page);

        // Top level is grouped by Country with server-side aggregated medal totals.
        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();
        await expect(groupRow('United States')).toBeVisible();

        // grandTotalRow: 'bottom' — the fake server aggregates across the entire dataset and
        // returns the grand total via getRows. The footer may be mirrored across pinned/centre
        // containers, so scope to the first matching grand-total row.
        const grandTotalRow = page.locator('[row-id="rowGroupFooter_ROOT_NODE_ID"]').first();
        await expect(grandTotalRow).toBeVisible();
        await expect(grandTotalRow.locator('[col-id="gold"]')).toContainText('3143');
        await expect(grandTotalRow.locator('[col-id="silver"]')).toContainText('3131');
        await expect(grandTotalRow.locator('[col-id="bronze"]')).toContainText('3255');
    });
});

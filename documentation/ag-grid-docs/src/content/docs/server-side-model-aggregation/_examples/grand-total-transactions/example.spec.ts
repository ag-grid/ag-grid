import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grand total row is maintained via server-side transactions', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // Flat SSRM grid — the first data block loads athlete rows (ids are `row-<index>`).
        await expect(agIdFor.cell('row-0', 'athlete')).toContainText('Michael Phelps');

        // The grand total is fetched separately and added back with an `add` transaction after a
        // simulated backend delay, so the footer appears a moment after the first rows. The
        // aggregation covers the entire dataset. The footer is mirrored across containers so
        // scope to the first matching grand-total row.
        const grandTotalRow = page.locator('[row-id="rowGroupFooter_ROOT_NODE_ID"]').first();
        await expect(grandTotalRow).toBeVisible({ timeout: 15000 });
        await expect(grandTotalRow.locator('[col-id="gold"]')).toContainText('3143', { timeout: 15000 });
        await expect(grandTotalRow.locator('[col-id="silver"]')).toContainText('3131');
        await expect(grandTotalRow.locator('[col-id="bronze"]')).toContainText('3255');
    });
});

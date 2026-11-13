import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('groupTotalRow bottom renders a per-group footer with aggregated medals', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();
        await expect(groupRow('United States')).toBeVisible();

        // Expanding a country lazy-loads its Sport subgroups; with groupTotalRow: 'bottom' a footer
        // row is appended after the group's children.
        await groupRow('United States').locator('.ag-group-contracted').first().click();
        // Zimbabwe → Swimming is also open by default, so wait for a US-only sport before scrolling.
        await expect(
            page
                .locator('.ag-row-level-1:not(.ag-row-loading) .ag-group-value')
                .filter({ hasText: /\S/ })
                .filter({ hasNotText: 'Swimming' })
                .first()
        ).toBeVisible();

        const footer = page.locator('.ag-row-footer').filter({ hasText: 'Total United States' }).first();
        const viewport = page.locator('.ag-grid-viewport').first();
        await expect(async () => {
            await viewport.evaluate((el) => {
                el.scrollTop += el.clientHeight;
            });
            await expect(footer).toBeAttached({ timeout: 500 });
        }).toPass({ timeout: 10_000 });

        // The footer shows "Total <group>" and the group's server-aggregated medal totals.
        await expect(footer).toContainText('Total United States');
        await expect(footer.locator('[col-id="gold"]')).toContainText('552');
        await expect(footer.locator('[col-id="silver"]')).toContainText('440');
        await expect(footer.locator('[col-id="bronze"]')).toContainText('320');
    });
});

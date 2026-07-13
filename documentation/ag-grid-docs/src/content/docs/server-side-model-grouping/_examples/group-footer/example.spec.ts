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
        await expect(groupRow('Swimming')).toBeVisible();

        // The footer sits below all 40 US sports — scroll it into the rendered range.
        await page.evaluate(() => {
            const vp = document.querySelector('.ag-body-viewport') as HTMLElement;
            if (vp) {
                vp.scrollTop = 1700;
            }
        });

        // The footer shows "Total <group>" and the group's server-aggregated medal totals.
        const footer = page.locator('.ag-row-footer').filter({ hasText: 'Total United States' }).first();
        await expect(footer).toContainText('Total United States');
        await expect(footer.locator('[col-id="gold"]')).toContainText('552');
        await expect(footer.locator('[col-id="silver"]')).toContainText('440');
        await expect(footer.locator('[col-id="bronze"]')).toContainText('320');
    });
});

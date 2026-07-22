import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const panel = page.locator('.ag-filter-toolpanel');
        const expandedFilters = panel.locator('.ag-filter-toolpanel-instance-header[aria-expanded="true"]');
        const allFilters = panel.locator('.ag-filter-toolpanel-instance-header');
        const totalFilters = await allFilters.count();
        expect(totalFilters).toBeGreaterThan(2);

        // All filters are collapsed by default.
        await expect(expandedFilters).toHaveCount(0);

        // Expand Year & Sport -> exactly two filters expanded.
        await page.getByRole('button', { name: 'Expand Year & Sport' }).click();
        await expect(expandedFilters).toHaveCount(2);

        // Collapse Year -> one filter (Sport) remains expanded.
        await page.getByRole('button', { name: 'Collapse Year' }).click();
        await expect(expandedFilters).toHaveCount(1);

        // Collapse All -> no filters expanded.
        await page.getByRole('button', { name: 'Collapse All' }).click();
        await expect(expandedFilters).toHaveCount(0);

        // Expand All -> every filter expanded.
        await page.getByRole('button', { name: 'Expand All' }).click();
        await expect(expandedFilters).toHaveCount(totalFilters);
    });
});

import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Full-width group row renders group value and child count, no group column cell.
        const usGroup = agIdFor.rowNode('row-group-country-United States').first();
        await expect(usGroup).toHaveClass(/ag-full-width-row/);
        await expect(usGroup).toHaveClass(/ag-row-group-contracted/);
        await expect(usGroup.locator('.ag-group-value')).toContainText('United States');
        await expect(usGroup.locator('.ag-group-child-count')).toContainText('(1109)');

        // No auto group column cell is generated for groupRows display type.
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toHaveCount(0);

        // Expanding the group reveals the nested year group rows.
        await usGroup.locator('.ag-group-contracted').click();
        await expect(usGroup).toHaveClass(/ag-row-group-expanded/);
        await expect(page.locator('[row-id^="row-group-country-United States-year-"]').first()).toBeVisible();

        // Collapsing hides the children again.
        await usGroup.locator('.ag-group-expanded').click();
        await expect(usGroup).toHaveClass(/ag-row-group-contracted/);
    });
});

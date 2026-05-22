import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        const stickyBottom = page.locator('.ag-grid-pinned-bottom-rows');
        const stickyGrandTotal = stickyBottom.locator('[data-testid="ag-row:row-id=rowGroupFooter_ROOT_NODE_ID"]');
        const stickyGroupTotals = stickyBottom.locator('[data-testid^="ag-row:row-id=rowGroupFooter_row-group"]');
        const dropdown = page.locator('#input-property-value');

        // Default: suppressStickyTotalRow is false — both grand total and group totals are sticky
        await expect(stickyGrandTotal.first()).toBeVisible();
        await expect(stickyGroupTotals.first()).toBeVisible();

        // Change to true — neither grand total nor group totals are sticky
        await dropdown.selectOption('true');
        await expect(stickyGrandTotal).toHaveCount(0);
        await expect(stickyGroupTotals).toHaveCount(0);

        // Change to "grand" — grand total NOT sticky, group totals still sticky
        await dropdown.selectOption('grand');
        await expect(stickyGrandTotal).toHaveCount(0);
        await expect(stickyGroupTotals.first()).toBeVisible();

        // Change to "group" — group totals NOT sticky, grand total still sticky
        await dropdown.selectOption('group');
        await expect(stickyGrandTotal.first()).toBeVisible();
        await expect(stickyGroupTotals).toHaveCount(0);

        // Change back to false — both are sticky again
        await dropdown.selectOption('false');
        await expect(stickyGrandTotal.first()).toBeVisible();
        await expect(stickyGroupTotals.first()).toBeVisible();
    });
});

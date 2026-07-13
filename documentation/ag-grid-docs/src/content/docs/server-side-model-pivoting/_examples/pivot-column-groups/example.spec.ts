import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Expandable pivot column groups reveal medal children on open', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Grid is row-grouped by Country (first level) and pivoted into year column groups.
        await expect(groupRow('United States')).toBeVisible();
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: '2000' }).first()).toBeVisible();

        // Collapsed: processPivotResultColDef sets columnGroupShow='open' on non-total columns,
        // so only the aggregated Total child is shown for each year, and no medal children.
        await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'Total' }).first()).toBeVisible();
        await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'Gold' })).toHaveCount(0);
        await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'Silver' })).toHaveCount(0);
        await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'Bronze' })).toHaveCount(0);

        // Expanding the 2000 column group reveals its gold/silver/bronze medal children.
        await page.getByRole('button', { name: 'Expand 2000', exact: true }).click();
        await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'Gold' }).first()).toBeVisible();
        await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'Silver' }).first()).toBeVisible();
        await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'Bronze' }).first()).toBeVisible();

        // Collapsing again hides the medal children.
        await page.getByRole('button', { name: 'Collapse 2000', exact: true }).click();
        await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'Gold' })).toHaveCount(0);
    });
});

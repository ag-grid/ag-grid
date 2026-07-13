import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Header checkbox selects all rows across pages', async ({ page }) => {
        await waitForGridContent(page);

        // Rows are country groups. Wait for the first block to load.
        const groupRows = page.locator('.ag-row[row-id^="group-"]');
        await expect(groupRows.first()).toBeVisible();

        // Nothing is selected initially.
        await expect(page.locator('.ag-row.ag-row-selected')).toHaveCount(0);

        // Click the header select-all checkbox (selectAll: 'all').
        const headerSelectAll = page.locator('.ag-header-select-all .ag-checkbox-input').first();
        await headerSelectAll.click();

        // The header checkbox reports the checked (fully selected) state.
        await expect(page.locator('.ag-header-select-all .ag-checkbox-input-wrapper').first()).toHaveClass(
            /ag-checked/
        );

        // Every visible group row becomes selected.
        const total = await groupRows.count();
        expect(total).toBeGreaterThan(0);
        await expect(page.locator('.ag-row[row-id^="group-"].ag-row-selected')).toHaveCount(total);
    });
});

import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Dynamically added/removed Set Filter values do not receive a data-testid, so locate items by their label text.
    const filterItem = (page: any, label: string) => {
        const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return page
            .locator('.ag-filter-toolpanel .ag-set-filter-list .ag-set-filter-item')
            .filter({ has: page.locator('.ag-checkbox-label', { hasText: new RegExp(`^${escaped}$`) }) });
    };
    const filterItemCheckbox = (page: any, label: string) => filterItem(page, label).locator('input[type="checkbox"]');
    const rows = (page: any) => page.locator('.ag-grid-scrolling-container .ag-row[row-id]');

    test.eachFramework('values that leave the data keep their selected state', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Select Only B' }).click();
        await expect(rows(page)).toHaveCount(1);

        // Apply Data Update 1 -> A,A,D: 'B' and 'C' leave the data but stay listed, muted, and keep their state.
        await page.getByRole('button', { name: 'Apply Data Update 1' }).click();
        await expect(filterItem(page, 'B')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItemCheckbox(page, 'B')).toBeChecked();
        await expect(filterItem(page, 'C')).toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItemCheckbox(page, 'C')).not.toBeChecked();
        await expect(page.locator('.ag-floating-filter input')).toHaveValue('(1) B');
        await expect(rows(page)).toHaveCount(0);

        // Apply Data Update 2 -> 'B' and 'C' return: 'B' rows show again, 'C' stays filtered out.
        await page.getByRole('button', { name: 'Apply Data Update 2' }).click();
        await expect(filterItem(page, 'B')).not.toHaveClass(/ag-set-filter-item-missing/);
        await expect(filterItemCheckbox(page, 'B')).toBeChecked();
        await expect(filterItemCheckbox(page, 'C')).not.toBeChecked();
        await expect(rows(page)).toHaveCount(1);
    });

    test.eachFramework('Clear Preserved Values drops values not in the data', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await filterItemCheckbox(page, 'C').uncheck();
        await page.getByRole('button', { name: 'Apply Data Update 1' }).click();
        await expect(filterItem(page, 'C')).toHaveCount(1);

        await page.getByRole('button', { name: 'Clear Preserved Values' }).click();
        await expect(filterItem(page, 'B')).toHaveCount(0);
        await expect(filterItem(page, 'C')).toHaveCount(0);
        await expect(filterItem(page, 'D')).toHaveCount(1);
    });
});

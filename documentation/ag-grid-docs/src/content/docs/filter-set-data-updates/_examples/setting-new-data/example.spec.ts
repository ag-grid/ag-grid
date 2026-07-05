import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Dynamically added/removed Set Filter values do not receive a data-testid, so locate items by their label text.
    const filterItem = (page: any, label: string) => {
        const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return page
            .locator('.ag-set-filter-list .ag-set-filter-item')
            .filter({ has: page.locator('.ag-checkbox-label', { hasText: new RegExp(`^${escaped}$`) }) });
    };
    const filterItemCheckbox = (page: any, label: string) => filterItem(page, label).locator('input[type="checkbox"]');

    test.eachFramework('setGridOption rowData keeps existing filter selections', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Data is A,A,B,C: filter starts with A, B, C all selected.
        await expect(filterItemCheckbox(page, 'A')).toBeChecked();

        // Deselect 'A'.
        await filterItemCheckbox(page, 'A').uncheck();
        await expect(filterItemCheckbox(page, 'A')).not.toBeChecked();

        // Apply Data Update 1 -> new data A,A,C,D,E via setGridOption('rowData', ...).
        await page.getByRole('button', { name: 'Apply Data Update 1' }).click();

        // 'A' remains deselected after new data is supplied (existing selections are kept).
        await expect(filterItemCheckbox(page, 'A')).not.toBeChecked();
        // 'C' was left selected before the update and stays selected.
        await expect(filterItemCheckbox(page, 'C')).toBeChecked();
        // D and E are new values; as the filter is active they are added unselected.
        await expect(filterItem(page, 'D')).toHaveCount(1);
        await expect(filterItemCheckbox(page, 'D')).not.toBeChecked();
        await expect(filterItemCheckbox(page, 'E')).not.toBeChecked();
    });

    test.eachFramework('A removed value drops from the filter list and returns unselected', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Select only 'B': deselect all, then select B.
        await filterItemCheckbox(page, '(Select All)').uncheck();
        await filterItemCheckbox(page, 'B').check();
        await expect(filterItemCheckbox(page, 'B')).toBeChecked();

        // Apply Data Update 1 -> A,A,C,D,E which contains no 'B'.
        await page.getByRole('button', { name: 'Apply Data Update 1' }).click();

        // 'B' is no longer a filter value, so it is removed from the list.
        await expect(filterItem(page, 'B')).toHaveCount(0);

        // Apply Data Update 2 -> data containing 'B' again.
        await page.getByRole('button', { name: 'Apply Data Update 2' }).click();

        // 'B' returns to the list but remains unselected.
        await expect(filterItem(page, 'B')).toHaveCount(1);
        await expect(filterItemCheckbox(page, 'B')).not.toBeChecked();
    });
});

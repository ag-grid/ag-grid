import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Newly added Set Filter values (e.g. 'AX', 'D') do not receive a data-testid, so locate items by their label text.
    const filterItem = (page: any, label: string) =>
        page
            .locator('.ag-set-filter-list .ag-set-filter-item')
            .filter({ has: page.locator('.ag-checkbox-label', { hasText: new RegExp(`^${label}$`) }) });
    const filterItemCheckbox = (page: any, label: string) => filterItem(page, label).locator('input[type="checkbox"]');

    test.eachFramework('Transactions add new filter values selected while the filter is inactive', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Data is A,A,B,B,C,C: filter starts with A, B, C all selected (inactive).
        await expect(filterItemCheckbox(page, 'A')).toBeChecked();

        // Update First Displayed Row: 'A' -> 'AX' via applyTransaction.
        await page.getByRole('button', { name: 'Update First Displayed Row' }).click();
        await expect(filterItem(page, 'AX')).toHaveCount(1);
        await expect(filterItemCheckbox(page, 'AX')).toBeChecked();

        // Add New 'D' Row via applyTransaction.
        await page.getByRole('button', { name: "Add New 'D' Row" }).click();
        await expect(filterItem(page, 'D')).toHaveCount(1);
        await expect(filterItemCheckbox(page, 'D')).toBeChecked();
    });

    test.eachFramework(
        'Transactions add new filter values unselected and filter them out while active',
        async ({ page, agIdFor }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Deselect 'C' to make the filter active. Rows C (index 4,5) are filtered out.
            await filterItemCheckbox(page, 'C').uncheck();
            await expect(agIdFor.cell('4', 'col1')).not.toBeVisible();

            // Update First Displayed Row: 'A' -> 'AX'. Row id 0 keeps its id after an update transaction.
            await page.getByRole('button', { name: 'Update First Displayed Row' }).click();

            // 'AX' is added but not selected, and transactions re-run filtering so the row is removed.
            await expect(filterItem(page, 'AX')).toHaveCount(1);
            await expect(filterItemCheckbox(page, 'AX')).not.toBeChecked();
            await expect(agIdFor.cell('0', 'col1')).not.toBeVisible();

            // Add New 'D' Row: 'D' added unselected and hence filtered out of the grid.
            await page.getByRole('button', { name: "Add New 'D' Row" }).click();
            await expect(filterItem(page, 'D')).toHaveCount(1);
            await expect(filterItemCheckbox(page, 'D')).not.toBeChecked();
        }
    );
});

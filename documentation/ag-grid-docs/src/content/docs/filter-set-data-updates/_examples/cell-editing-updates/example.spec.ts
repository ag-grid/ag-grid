import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Newly added Set Filter values (e.g. 'X') do not receive a data-testid, so locate items by their label text.
    const filterItem = (page: any, label: string) =>
        page
            .locator('.ag-set-filter-list .ag-set-filter-item')
            .filter({ has: page.locator('.ag-checkbox-label', { hasText: new RegExp(`^${label}$`) }) });
    const filterItemCheckbox = (page: any, label: string) => filterItem(page, label).locator('input[type="checkbox"]');

    test.eachFramework(
        'Editing a cell adds the new value and keeps it selected while the filter is inactive',
        async ({ page, agIdFor }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Data is A,A,B,B,C,C so the Set Filter list starts with A, B and C, all selected (filter inactive).
            await expect(filterItemCheckbox(page, 'A')).toBeChecked();
            await expect(filterItemCheckbox(page, 'B')).toBeChecked();
            await expect(filterItemCheckbox(page, 'C')).toBeChecked();

            // Row index 2 holds a 'B'. Edit it to 'X'.
            await agIdFor.cell('2', 'col1').dblclick();
            const editor = page.locator('.ag-cell-inline-editing input');
            await expect(editor).toBeVisible();
            await editor.fill('X');
            await page.keyboard.press('Enter');

            await expect(agIdFor.cell('2', 'col1')).toContainText('X');

            // 'X' is added to the filter list and, because the filter was inactive, it is selected.
            await expect(filterItem(page, 'X')).toHaveCount(1);
            await expect(filterItemCheckbox(page, 'X')).toBeChecked();

            // Cell editing does not re-run filtering, so the edited row still appears in the grid.
            await expect(agIdFor.cell('2', 'col1')).toBeVisible();
        }
    );

    test.eachFramework(
        'Editing a cell adds the new value unselected while the filter is active',
        async ({ page, agIdFor }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Deselect 'C' to make the filter active.
            await filterItemCheckbox(page, 'C').uncheck();
            await expect(filterItemCheckbox(page, 'C')).not.toBeChecked();

            // Edit a 'B' cell (row index 2) to 'X'.
            await agIdFor.cell('2', 'col1').dblclick();
            const editor = page.locator('.ag-cell-inline-editing input');
            await expect(editor).toBeVisible();
            await editor.fill('X');
            await page.keyboard.press('Enter');

            await expect(agIdFor.cell('2', 'col1')).toContainText('X');

            // 'X' is added to the filter list but, because the filter was active, it is NOT selected.
            await expect(filterItem(page, 'X')).toHaveCount(1);
            await expect(filterItemCheckbox(page, 'X')).not.toBeChecked();
        }
    );
});

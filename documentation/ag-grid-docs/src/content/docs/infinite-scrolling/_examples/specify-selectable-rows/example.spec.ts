import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('a United States row is selectable', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // Row 0 is a United States athlete, so isRowSelectable returns true and a checkbox is shown.
        await expect(dataRow(0).locator('[col-id="country"]')).toContainText('United States');
        await expect(dataRow(0).locator('.ag-selection-checkbox')).toHaveCount(1);

        await dataRow(0).locator('.ag-selection-checkbox').first().click();
        await expect(dataRow(0)).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('a non-United States row is not selectable and hides its checkbox', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const dataRow = (index: number) => page.locator(`.ag-row[row-index="${index}"]`);

        // Row 4 (Aleksey Nemov, Russia) is not selectable; hideDisabledCheckboxes hides its checkbox.
        await expect(dataRow(4).locator('[col-id="country"]')).toContainText('Russia');
        await expect(dataRow(4).locator('.ag-selection-checkbox')).toHaveCount(0);
    });
});

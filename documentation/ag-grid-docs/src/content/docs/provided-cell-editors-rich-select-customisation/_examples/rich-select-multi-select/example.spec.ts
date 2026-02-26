import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'should display header and keep multi-select editor open after clicking options',
        async ({ agIdFor, page }) => {
            // Verify the column header contains the expected text
            const header = agIdFor.headerCell('colors');
            await expect(header).toContainText('Colours');

            // Double-click the first row cell to open the rich select editor
            const cell = agIdFor.cell('0', 'colors');
            await cell.dblclick();

            // Verify the rich select popup list appears
            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // Click the first visible option in the popup (the list opens scrolled to the
            // current selection, so we interact with whatever rows are in the viewport)
            const firstOption = popup.locator('.ag-rich-select-row').first();
            await expect(firstOption).toBeVisible();
            await firstOption.click();

            // Multi-select: popup should remain open after clicking an option
            await expect(popup).toBeVisible();

            // Click the second visible option
            const secondOption = popup.locator('.ag-rich-select-row').nth(1);
            await expect(secondOption).toBeVisible();
            await secondOption.click();

            // Multi-select: popup should still remain open after clicking another option
            await expect(popup).toBeVisible();

            // Press Escape to cancel editing without confirming changes
            await page.keyboard.press('Escape');

            // Verify the popup is no longer visible after pressing Escape
            await expect(popup).not.toBeVisible();
        }
    );

    test.eachFramework('should show selected state for options in multi-select editor', async ({ agIdFor, page }) => {
        // Double-click the first row cell to open the rich select editor
        const cell = agIdFor.cell('0', 'colors');
        await cell.dblclick();

        // Verify the rich select popup list appears
        const popup = page.locator('.ag-rich-select-list').first();
        await expect(popup).toBeVisible();

        // Verify that at least one option has the selected class, reflecting
        // the pre-selected colours from the initial random row data (1-4 colours per row)
        const selectedRows = popup.locator('.ag-rich-select-row-selected');
        const selectedCount = await selectedRows.count();
        expect(selectedCount).toBeGreaterThanOrEqual(1);

        // Press Escape to close the editor
        await page.keyboard.press('Escape');

        // Verify the popup is no longer visible
        await expect(popup).not.toBeVisible();
    });
});

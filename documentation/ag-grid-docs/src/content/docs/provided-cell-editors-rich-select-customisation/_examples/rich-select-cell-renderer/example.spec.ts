import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'should display header, valid cell content, and open editor with options',
        async ({ agIdFor, page }) => {
            // Verify the column header is visible with the expected text
            const header = agIdFor.headerCell('color');
            await expect(header).toContainText('Rich Select Editor');

            // Verify the first cell displays a non-empty colour name
            const cell = agIdFor.cell('0', 'color').first();
            const cellText = await cell.textContent();
            expect(cellText?.trim().length).toBeGreaterThan(0);

            // Double-click the cell to open the rich select editor
            await cell.dblclick();

            // Verify the rich select popup list appears
            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // Verify the popup contains colour options
            const options = popup.locator('.ag-rich-select-row');
            await expect(options.first()).toBeVisible();
        }
    );

    test.eachFramework('should update cell value when selecting a different option', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'color').first();

        // Double-click to open the rich select editor
        await cell.dblclick();

        // Wait for the popup to appear
        const popup = page.locator('.ag-rich-select-list').first();
        await expect(popup).toBeVisible();

        // Click the first visible row in the popup (the list opens scrolled to the current
        // selected value, so we click whatever row is at the top of the viewport)
        const firstRow = popup.locator('.ag-rich-select-row').first();
        await expect(firstRow).toBeVisible();
        const optionText = (await firstRow.innerText()).trim();
        await firstRow.click();

        // Verify the cell value has been updated to the selected colour
        await expect(cell).toContainText(optionText);
    });
});

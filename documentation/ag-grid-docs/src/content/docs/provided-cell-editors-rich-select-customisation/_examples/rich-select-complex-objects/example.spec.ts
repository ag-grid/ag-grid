import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'should display correct initial cell values for both string and complex object columns',
        async ({ agIdFor }) => {
            // Verify the column headers are visible with the expected text
            const stringHeader = agIdFor.headerCell('color');
            await expect(stringHeader).toContainText('Color (Column as String Type)');

            const objectHeader = agIdFor.headerCell('detailedColor');
            await expect(objectHeader).toContainText('Color (Column as Complex Object)');

            // Verify row 0 string column shows the plain name
            const row0Color = agIdFor.cell('0', 'color');
            await expect(row0Color).toContainText('Pink');

            // Verify row 0 complex object column shows the formatted value
            const row0DetailedColor = agIdFor.cell('0', 'detailedColor');
            await expect(row0DetailedColor).toContainText('Pink (#FFC0CB)');

            // Verify row 2 string column shows the plain name
            const row2Color = agIdFor.cell('2', 'color');
            await expect(row2Color).toContainText('Blue');

            // Verify row 2 complex object column shows the formatted value
            const row2DetailedColor = agIdFor.cell('2', 'detailedColor');
            await expect(row2DetailedColor).toContainText('Blue (#0000FF)');
        }
    );

    test.eachFramework('should update cell value when selecting a different option', async ({ agIdFor, page }) => {
        // --- Edit the string column (color) ---

        const colorCell = agIdFor.cell('0', 'color');

        // Double-click to open the rich select editor
        await colorCell.dblclick();

        // Verify the rich select popup list appears
        const popup = page.locator('.ag-rich-select-list').first();
        await expect(popup).toBeVisible();

        // Verify all 4 colour options are displayed
        const options = popup.locator('.ag-rich-select-row');
        await expect(options).toHaveCount(4);

        // Verify the option labels show the formatted name values
        await expect(options.nth(0)).toContainText('Pink');
        await expect(options.nth(1)).toContainText('Purple');
        await expect(options.nth(2)).toContainText('Blue');
        await expect(options.nth(3)).toContainText('Green');

        // Click the "Green" option
        const greenOption = popup.locator('.ag-rich-select-row', { hasText: 'Green' }).first();
        await greenOption.click();

        // Verify the cell value has been updated via parseValue (extracts just the name string)
        await expect(colorCell).toContainText('Green');

        // --- Edit the complex object column (detailedColor) ---

        const detailedColorCell = agIdFor.cell('1', 'detailedColor');

        // Double-click to open the rich select editor
        await detailedColorCell.dblclick();

        // Verify the rich select popup list appears
        const objectPopup = page.locator('.ag-rich-select-list').first();
        await expect(objectPopup).toBeVisible();

        // Verify all 4 colour options are displayed
        const objectOptions = objectPopup.locator('.ag-rich-select-row');
        await expect(objectOptions).toHaveCount(4);

        // Click the "Blue" option
        const blueOption = objectPopup.locator('.ag-rich-select-row', { hasText: 'Blue' }).first();
        await blueOption.click();

        // Verify the cell value has been updated with the valueFormatter applied to the full complex object
        await expect(detailedColorCell).toContainText('Blue (#0000FF)');
    });
});

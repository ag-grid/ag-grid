import { expect, test } from '@utils/grid/test-utils';

const languages = ['English', 'Spanish', 'French', 'Portuguese', '(other)'];

test.agExample(import.meta, () => {
    test.eachFramework(
        'should display header, original-case cell values, and uppercase options in editor',
        async ({ agIdFor, page }) => {
            // Verify the column header is visible with the expected text
            const header = agIdFor.headerCell('language');
            await expect(header).toContainText('Rich Select Editor');

            // Verify the first cell displays a valid language value in original case (not uppercased)
            const cell = agIdFor.cell('0', 'language');
            const cellText = await cell.textContent();
            expect(languages).toContain(cellText);

            // Double-click the cell to open the rich select editor
            await cell.dblclick();

            // Verify the rich select popup list appears
            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // Verify all 5 language options are displayed
            const options = popup.locator('.ag-rich-select-row');
            await expect(options).toHaveCount(5);

            // Verify the formatValue callback displays items in uppercase
            await expect(popup.locator('.ag-rich-select-row', { hasText: 'ENGLISH' }).first()).toBeVisible();
            await expect(popup.locator('.ag-rich-select-row', { hasText: 'SPANISH' }).first()).toBeVisible();
            await expect(popup.locator('.ag-rich-select-row', { hasText: '(OTHER)' }).first()).toBeVisible();
        }
    );

    test.eachFramework(
        'should store original-case value when selecting a formatted uppercase option',
        async ({ agIdFor, page }) => {
            const cell = agIdFor.cell('0', 'language');

            // Double-click to open the rich select editor
            await cell.dblclick();

            // Wait for the popup to appear
            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // Click the "FRENCH" option (displayed in uppercase by formatValue)
            const option = popup.locator('.ag-rich-select-row', { hasText: 'FRENCH' }).first();
            await option.click();

            // Verify the cell stores and displays the original-case value, not the formatted uppercase
            await expect(cell).toContainText('French');
        }
    );
});

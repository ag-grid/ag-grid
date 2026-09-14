import { expect, test } from '@utils/grid/test-utils';

const languages = ['English', 'Spanish', 'French', 'Portuguese', '(other)'];

test.agExample(import.meta, () => {
    test.eachFramework(
        'should display header, valid cell content, and open editor with all options',
        async ({ agIdFor, page }) => {
            // Verify the column header is visible with the expected text
            const header = agIdFor.headerCell('language');
            await expect(header).toContainText('Rich Select Editor');

            // Verify the first cell displays a valid language value
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
        }
    );

    test.eachFramework('should update cell value when selecting a different option', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'language');

        // Read the current cell value
        const originalValue = await cell.textContent();

        // Pick a language that differs from the current value
        const newLanguage = languages.find((lang) => lang !== originalValue)!;

        // Double-click to open the rich select editor
        await cell.dblclick();

        // Wait for the popup to appear
        const popup = page.locator('.ag-rich-select-list').first();
        await expect(popup).toBeVisible();

        // Click the option with the different language
        const option = popup.locator('.ag-rich-select-row', { hasText: newLanguage }).first();
        await option.click();

        // Verify the cell value has been updated to the newly selected language
        await expect(cell).toHaveText(newLanguage);
    });

    test.eachFramework('should not display a typing input when allowTyping is not set', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'language');

        // Double-click to open the rich select editor
        await cell.dblclick();

        const popup = page.locator('.ag-rich-select-list').first();
        await expect(popup).toBeVisible();

        // allowTyping defaults to false, so the editor shows a read-only display area
        // instead of a text input (contrast with the Allow Typing customisation example)
        const editorInput = page.locator('.ag-rich-select-field-input .ag-input-field-input').first();
        await expect(editorInput).not.toBeVisible();

        // The picker display area shows the current value instead
        const display = page.locator('.ag-rich-select-value .ag-picker-field-display').first();
        await expect(display).toBeVisible();

        await page.keyboard.press('Escape');
    });

    test.eachFramework('should cancel editing and keep the original value on Escape', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'language');

        // Read the current value so the assertion does not depend on the random row data
        const originalValue = (await cell.textContent())!.trim();

        // Open the editor and highlight a different option without committing it
        await cell.dblclick();

        const popup = page.locator('.ag-rich-select-list').first();
        await expect(popup).toBeVisible();

        const otherOption = popup.locator('.ag-rich-select-row').filter({ hasNotText: originalValue }).first();
        await otherOption.hover();

        // Escape cancels editing, so the original value is retained
        await page.keyboard.press('Escape');
        await expect(popup).not.toBeVisible();
        await expect(cell).toHaveText(originalValue);
    });
});

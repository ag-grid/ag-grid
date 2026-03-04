import { expect, test } from '@utils/grid/test-utils';

const languages = ['English', 'Spanish', 'French', 'Portuguese', '(other)'];

test.agExample(import.meta, () => {
    test.eachFramework('should load async values and display all options in dropdown', async ({ agIdFor, page }) => {
        // Verify the first cell shows a valid language value
        const cell = agIdFor.cell('0', 'language');
        const cellText = await cell.textContent();
        expect(languages).toContain(cellText);

        // Double-click to open the rich select editor
        await cell.dblclick();

        // Wait for the popup to appear
        const popup = page.locator('.ag-rich-select-list').first();
        await expect(popup).toBeVisible();

        // Wait for async values to load (1s server delay)
        const options = popup.locator('.ag-rich-select-row');
        await expect(options).toHaveCount(5, { timeout: 5000 });

        // Verify all language options are present
        for (const lang of languages) {
            await expect(popup.locator('.ag-rich-select-row', { hasText: lang }).first()).toBeVisible();
        }

        await page.keyboard.press('Escape');
    });

    test.eachFramework(
        'should update cell value when selecting an option from the async dropdown',
        async ({ agIdFor, page }) => {
            const cell = agIdFor.cell('0', 'language');
            const originalValue = await cell.textContent();

            // Pick a different language
            const newLanguage = languages.find((lang) => lang !== originalValue)!;

            // Open the editor
            await cell.dblclick();

            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // Wait for async options to load
            await expect(popup.locator('.ag-rich-select-row')).toHaveCount(5, { timeout: 5000 });

            // Select the new language
            const option = popup.locator('.ag-rich-select-row', { hasText: newLanguage }).first();
            await option.click();

            // Verify the cell value updated
            await expect(cell).toHaveText(newLanguage);
        }
    );
});

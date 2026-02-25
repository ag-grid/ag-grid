import { expect, test } from '@utils/grid/test-utils';

const languages = ['English', 'Spanish', 'French', 'Portuguese', '(other)'];

test.agExample(import.meta, () => {
    test.eachFramework('should open editor with a visible typing input', async ({ agIdFor, page }) => {
        // Verify the first cell shows a valid language value
        const cell = agIdFor.cell('0', 'language');
        const cellText = await cell.textContent();
        expect(languages).toContain(cellText);

        // Double-click to open the rich select editor
        await cell.dblclick();

        // With filterListAsync + allowTyping, the text input is visible immediately
        const editorInput = page.locator('.ag-rich-select-field-input .ag-input-field-input').first();
        await expect(editorInput).toBeVisible();

        await page.keyboard.press('Escape');
    });

    test.eachFramework('should show filtered async results after typing a search term', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'language');

        // Open editor
        await cell.dblclick();

        const editorInput = page.locator('.ag-rich-select-field-input .ag-input-field-input').first();
        await expect(editorInput).toBeVisible();

        // Fill with 'Sp' — only 'Spanish' matches the server-side filter
        await editorInput.fill('Sp');

        // Popup should appear once the async response resolves (debounce 300ms + server 1000ms)
        const popup = page.locator('.ag-rich-select-list').first();
        await expect(popup).toBeVisible({ timeout: 5000 });

        // Only Spanish matches 'Sp'
        await expect(popup.locator('.ag-rich-select-row')).toHaveCount(1, { timeout: 5000 });
        await expect(popup.locator('.ag-rich-select-row', { hasText: 'Spanish' }).first()).toBeVisible();

        await page.keyboard.press('Escape');
    });

    test.eachFramework(
        'should update cell value when selecting from the async-filtered list',
        async ({ agIdFor, page }) => {
            const cell = agIdFor.cell('0', 'language');

            // Open editor
            await cell.dblclick();

            const editorInput = page.locator('.ag-rich-select-field-input .ag-input-field-input').first();
            await expect(editorInput).toBeVisible();

            // Filter to 'English' specifically (exact match, returns only English)
            await editorInput.fill('English');

            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible({ timeout: 5000 });

            // Click the English option
            const option = popup.locator('.ag-rich-select-row', { hasText: 'English' }).first();
            await option.click();

            // Verify the cell updated
            await expect(cell).toHaveText('English');
        }
    );
});

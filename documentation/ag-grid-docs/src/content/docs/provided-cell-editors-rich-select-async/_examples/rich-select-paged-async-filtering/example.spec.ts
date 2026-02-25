import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should open editor with a visible typing input', async ({ agIdFor, page }) => {
        // Verify the first cell shows a language in the expected format
        const cell = agIdFor.cell('0', 'language');
        const cellText = await cell.textContent();
        expect(cellText).toMatch(/^Language \d+$/);

        // Double-click to open the rich select editor
        await cell.dblclick();

        // With filterListAsync + allowTyping, the text input is visible immediately
        const editorInput = page.locator('.ag-rich-select-field-input .ag-input-field-input').first();
        await expect(editorInput).toBeVisible();

        await page.keyboard.press('Escape');
    });

    test.eachFramework('should show filtered paged results after typing a search term', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'language');

        // Open editor
        await cell.dblclick();

        const editorInput = page.locator('.ag-rich-select-field-input .ag-input-field-input').first();
        await expect(editorInput).toBeVisible();

        // Type '5000' — matches 'Language 5000' and 'Language 15000' in the 20,000-item dataset
        await editorInput.fill('5000');

        // Popup appears once the server responds (debounce 300ms + server 300ms)
        const popup = page.locator('.ag-rich-select-list').first();
        await expect(popup).toBeVisible({ timeout: 5000 });

        // 'Language 5000' must be among the filtered results
        await expect(popup.locator('.ag-rich-select-row', { hasText: 'Language 5000' }).first()).toBeVisible({
            timeout: 5000,
        });

        await page.keyboard.press('Escape');
    });

    test.eachFramework(
        'should update cell value when selecting from filtered paged results',
        async ({ agIdFor, page }) => {
            const cell = agIdFor.cell('0', 'language');

            // Open editor
            await cell.dblclick();

            const editorInput = page.locator('.ag-rich-select-field-input .ag-input-field-input').first();
            await expect(editorInput).toBeVisible();

            // Fill with exact text 'Language 5000' — this is the only 20,000-item match
            // ('Language 15000' does not contain 'Language 5000' as a substring)
            await editorInput.fill('Language 5000');

            // Wait for filtered results
            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible({ timeout: 5000 });

            const option = popup.locator('.ag-rich-select-row', { hasText: 'Language 5000' }).first();
            await expect(option).toBeVisible({ timeout: 5000 });
            await option.click();

            // Verify the cell value updated
            await expect(cell).toHaveText('Language 5000');
        }
    );
});

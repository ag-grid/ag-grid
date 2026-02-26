import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'should display both column headers and open editor with typing input for Match column',
        async ({ agIdFor, page }) => {
            // Verify both column headers are visible
            const matchHeader = page.locator('.ag-header-cell', { hasText: 'Allow Typing (Match)' });
            await expect(matchHeader.first()).toBeVisible();

            const matchAnyHeader = page.locator('.ag-header-cell', { hasText: 'Allow Typing (MatchAny)' });
            await expect(matchAnyHeader.first()).toBeVisible();

            // Double-click the first cell in the Match column to open the editor
            const cell = agIdFor.cell('0', 'color').first();
            await cell.dblclick();

            // Verify the rich select popup list appears
            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // Verify the text input is visible inside the editor (proves allowTyping: true)
            const editorInput = page.locator('.ag-rich-select-field-input .ag-input-field-input').first();
            await expect(editorInput).toBeVisible();

            // Close the editor
            await page.keyboard.press('Escape');
        }
    );

    test.eachFramework('should filter list differently based on search type when typing', async ({ agIdFor, page }) => {
        // --- Test Match column (prefix search) ---

        const matchCell = agIdFor.cell('0', 'color').first();
        await matchCell.dblclick();

        const matchPopup = page.locator('.ag-rich-select-list').first();
        await expect(matchPopup).toBeVisible();

        // Type 'Blue' to filter the list by prefix
        const matchEditorInput = page.locator('.ag-rich-select-field-input .ag-input-field-input').first();
        await matchEditorInput.fill('Blue');

        // 'Blue' should appear in the filtered list (starts with 'Blue')
        await expect(matchPopup.locator('.ag-rich-select-row', { hasText: 'Blue' }).first()).toBeVisible();

        // 'AliceBlue' should NOT appear because it does not start with 'Blue' (prefix search)
        await expect(matchPopup.locator('.ag-rich-select-row', { hasText: 'AliceBlue' })).toHaveCount(0);

        // Close the editor
        await page.keyboard.press('Escape');

        // --- Test MatchAny column (substring search) ---

        const matchAnyCell = agIdFor.cell('0', 'color_1').first();
        await matchAnyCell.dblclick();

        const matchAnyPopup = page.locator('.ag-rich-select-list').first();
        await expect(matchAnyPopup).toBeVisible();

        // Type 'Blue' to filter the list by substring
        const matchAnyEditorInput = page.locator('.ag-rich-select-field-input .ag-input-field-input').first();
        await matchAnyEditorInput.fill('Blue');

        // 'AliceBlue' should appear because it contains 'Blue' (substring search)
        await expect(matchAnyPopup.locator('.ag-rich-select-row', { hasText: 'AliceBlue' }).first()).toBeVisible();

        // Close the editor
        await page.keyboard.press('Escape');
    });
});

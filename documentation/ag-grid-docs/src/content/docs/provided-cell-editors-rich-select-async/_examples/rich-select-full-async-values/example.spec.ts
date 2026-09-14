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

    test.eachFramework(
        'should debounce the search and send one request for the typed string',
        async ({ agIdFor, page }) => {
            const logs: string[] = [];
            page.on('console', (m) => logs.push(m.text()));

            const cell = agIdFor.cell('0', 'language');
            await cell.dblclick();

            const editorInput = page.locator('.ag-rich-select-field-input .ag-input-field-input').first();
            await expect(editorInput).toBeVisible();

            // Type three characters well within the 300ms searchDebounceDelay
            await editorInput.pressSequentially('Spa', { delay: 30 });

            // Only one request is made, and it carries the full typed string
            await expect
                .poll(() => logs.filter((line) => line.startsWith('Grid requested')), { timeout: 10000 })
                .toContain('Grid requested `spa` from server.');

            expect(logs.filter((line) => line === 'Grid requested `spa` from server.')).toHaveLength(1);
            expect(logs.filter((line) => line === 'Grid requested `s` from server.')).toHaveLength(0);
            expect(logs.filter((line) => line === 'Grid requested `sp` from server.')).toHaveLength(0);

            await page.keyboard.press('Escape');
        }
    );

    test.eachFramework(
        'should report no hits from the server for a search with no matches',
        async ({ agIdFor, page }) => {
            const logs: string[] = [];
            page.on('console', (m) => logs.push(m.text()));

            const cell = agIdFor.cell('0', 'language');
            await cell.dblclick();

            const editorInput = page.locator('.ag-rich-select-field-input .ag-input-field-input').first();
            await expect(editorInput).toBeVisible();

            // 'zzz' matches none of the languages, so the server responds with 0 hits
            await editorInput.fill('zzz');

            await expect.poll(() => logs, { timeout: 10000 }).toContain('Server response for `zzz`: 0 hits.');

            // No rows are rendered for an empty result set
            await expect(page.locator('.ag-rich-select-row')).toHaveCount(0);

            await page.keyboard.press('Escape');
        }
    );
});

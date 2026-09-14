import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should display all three search mode column headers', async ({ page }) => {
        // Verify all three column headers are visible with the expected text
        const fuzzyHeader = page.locator('.ag-header-cell', { hasText: 'Fuzzy Search' });
        await expect(fuzzyHeader).toBeVisible();

        const matchHeader = page.locator('.ag-header-cell', { hasText: 'Match Search' });
        await expect(matchHeader).toBeVisible();

        const matchAnyHeader = page.locator('.ag-header-cell', { hasText: 'Match Any Search' });
        await expect(matchAnyHeader).toBeVisible();
    });

    test.eachFramework('should open the rich select editor popup with colour options', async ({ agIdFor, page }) => {
        // Get the first cell in the Fuzzy Search column (col-id 'color')
        const cell = agIdFor.cell('0', 'color').first();
        await expect(cell).toBeVisible();

        // Double-click the cell to open the rich select editor
        await cell.dblclick();

        // Verify the rich select popup list appears
        const popup = page.locator('.ag-rich-select-list').first();
        await expect(popup).toBeVisible();

        // Verify the popup contains colour options
        await expect(popup.locator('.ag-rich-select-row').first()).toBeVisible();

        // Close the editor by pressing Escape
        await page.keyboard.press('Escape');

        // Verify the popup is no longer visible
        await expect(popup).not.toBeVisible();
    });

    test.eachFramework(
        'should highlight the closest match when typing in the Fuzzy Search column',
        async ({ agIdFor, page }) => {
            // Fuzzy search (the default) highlights the best match rather than filtering the list
            const cell = agIdFor.cell('0', 'color').first();
            await cell.dblclick();

            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            // 'lum' only occurs in 'Plum' out of the ~145 colour names
            await page.keyboard.type('Plum');

            const highlighted = popup.locator('.ag-rich-select-row-highlighted');
            await expect(highlighted).toHaveText('Plum');

            // filterList is not set, so the other rows are still rendered rather than removed
            expect(await popup.locator('.ag-rich-select-row').count()).toBeGreaterThan(1);

            await page.keyboard.press('Escape');
        }
    );

    test.eachFramework(
        'should match from the start of the value in the Match Search column',
        async ({ agIdFor, page }) => {
            // searchType: 'match' matches values that START WITH the search string, so
            // 'goldenrod' matches 'Goldenrod' but not 'DarkGoldenrod' or 'PaleGoldenrod'
            const cell = agIdFor.cell('0', 'color_1').first();
            await cell.dblclick();

            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            await page.keyboard.type('goldenrod');

            const highlighted = popup.locator('.ag-rich-select-row-highlighted');
            await expect(highlighted).toHaveText('Goldenrod');

            await page.keyboard.press('Escape');
        }
    );

    test.eachFramework(
        'should match anywhere in the value in the Match Any Search column',
        async ({ agIdFor, page }) => {
            // searchType: 'matchAny' matches values CONTAINING the search string, so a
            // mid-string fragment such as 'oldenrod' still finds a match
            const cell = agIdFor.cell('0', 'color_2').first();
            await cell.dblclick();

            const popup = page.locator('.ag-rich-select-list').first();
            await expect(popup).toBeVisible();

            await page.keyboard.type('oldenrod');

            const highlighted = popup.locator('.ag-rich-select-row-highlighted');
            await expect(highlighted).toHaveCount(1);
            expect((await highlighted.innerText()).toLowerCase()).toContain('oldenrod');

            await page.keyboard.press('Escape');
        }
    );
});

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
});

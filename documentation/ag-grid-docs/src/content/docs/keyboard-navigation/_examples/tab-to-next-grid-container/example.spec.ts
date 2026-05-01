import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Columns: rowNum (colId), athlete, age, country, year, date, sport, gold, silver, bronze, total
    // Pagination enabled. tabToNextGridContainer routes last-cell Tab → pagination,
    // and pagination Shift+Tab → last focused cell.
    // HTML has "Input Above" and "Input Below" surrounding the grid.

    test.eachFramework('Tab from input above focuses first column header', async ({ page, agIdFor }) => {
        // Wait for grid data to load so the headers are tab-stops
        await expect(agIdFor.cell('0', 'athlete')).toBeVisible();

        const inputAbove = page.locator('input').first();
        await inputAbove.click();
        await expect(inputAbove).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(agIdFor.headerCell('rowNum')).toBeFocused();
    });

    test.eachFramework('Tab right through column headers', async ({ page, agIdFor }) => {
        await agIdFor.headerCell('rowNum').click();

        await page.keyboard.press('Tab');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(agIdFor.headerCell('age')).toBeFocused();

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.headerCell('rowNum')).toBeFocused();
    });

    test.eachFramework('Tab from last header enters first cell', async ({ page, agIdFor }) => {
        await agIdFor.headerCell('total').click();
        await page.keyboard.press('Tab');
        await expect(page.locator('[row-index="0"] [col-id="rowNum"]')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Tab right through cells in a row', async ({ page, agIdFor }) => {
        await agIdFor.cell('0', 'rowNum').click();

        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'age')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Tab from last cell on page routes to pagination toolbar', async ({ page, agIdFor }) => {
        // Navigate to the bottom-right cell of the current page via the End key
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('End');
        await expect(page.locator('.ag-cell-focus[col-id="total"]')).toBeVisible();

        // Tab from last cell → pagination (tabToNextGridContainer routes gridBody→external to pagination)
        await page.keyboard.press('Tab');
        const isPaginationFocused = await page.evaluate(
            () => document.activeElement?.closest('.ag-paging-panel') != null
        );
        expect(isPaginationFocused).toBe(true);
    });

    test.eachFramework('Shift+Tab from pagination restores last focused cell', async ({ page, agIdFor }) => {
        // Focus a specific cell so lastFocusedCell is set
        const targetCell = agIdFor.cell('2', 'athlete');
        await targetCell.click();
        await expect(targetCell).toHaveClass(/ag-cell-focus/);

        // Shift+Tab from inputBelow lands directly on the pagination toolbar
        // (it is the last focusable element before inputBelow in DOM order)
        const inputBelow = page.locator('input').last();
        await inputBelow.click();
        await page.keyboard.press('Shift+Tab');

        const isPaginationFocused = await page.evaluate(
            () => document.activeElement?.closest('.ag-paging-panel') != null
        );
        expect(isPaginationFocused).toBe(true);

        // Shift+Tab from pagination → restores last focused cell (athlete, row 2)
        await page.keyboard.press('Shift+Tab');
        await expect(targetCell).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Tab from pagination exits grid to next external element', async ({ page, agIdFor }) => {
        // Wait for grid data to load so the pagination toolbar has its enabled buttons.
        // Without this, the test races the async data fetch — when the grid is still empty,
        // all pagination buttons are disabled and Shift+Tab from inputBelow skips past the toolbar.
        await expect(agIdFor.cell('0', 'athlete')).toBeVisible();

        // Land on the last focusable element of the pagination toolbar.
        // Shift+Tab from inputBelow lands on the last button before inputBelow in DOM order
        // (pressing Tab once from any earlier pagination element only moves focus within the toolbar).
        const inputBelow = page.locator('input').last();
        await inputBelow.click();
        await page.keyboard.press('Shift+Tab');

        const isPaginationFocused = await page.evaluate(
            () => document.activeElement?.closest('.ag-paging-panel') != null
        );
        expect(isPaginationFocused).toBe(true);

        // Tab forward from the last pagination element → exits grid (callback returns false → browser default)
        await page.keyboard.press('Tab');
        const isStillInGrid = await page.evaluate(() => document.activeElement?.closest('.ag-root-wrapper') != null);
        expect(isStillInGrid).toBe(false);

        // Focus should have moved to the input below the grid
        await expect(inputBelow).toBeFocused();
    });
});

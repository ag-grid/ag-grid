import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Columns: rowNum (colId), athlete, age, country, year, date, sport, gold, silver, bronze, total
    // Pagination enabled. tabToNextGridContainer routes last-cell Tab → pagination,
    // and pagination Shift+Tab → last focused cell.
    // HTML has "Input Above" and "Input Below" surrounding the grid.

    test.eachFramework('Tab from input above focuses first column header', async ({ page, agIdFor }) => {
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
        await expect(agIdFor.cell('0', 'rowNum')).toHaveClass(/ag-cell-focus/);
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
        // Use Shift+Tab from input below to reach the last cell of the grid page
        await agIdFor.cell('0', 'athlete').click();

        const inputBelow = page.locator('input').last();
        await inputBelow.click();
        await page.keyboard.press('Shift+Tab');
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

        // Navigate to pagination: Shift+Tab from input below → last cell → Tab → pagination
        const inputBelow = page.locator('input').last();
        await inputBelow.click();
        await page.keyboard.press('Shift+Tab'); // → last cell
        await page.keyboard.press('Tab'); // → pagination

        const isPaginationFocused = await page.evaluate(
            () => document.activeElement?.closest('.ag-paging-panel') != null
        );
        expect(isPaginationFocused).toBe(true);

        // Shift+Tab from pagination → restores last focused cell (athlete, row 2)
        await page.keyboard.press('Shift+Tab');
        await expect(targetCell).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Tab from pagination exits grid to next external element', async ({ page, agIdFor }) => {
        // Navigate to pagination
        await agIdFor.cell('0', 'athlete').click();
        const inputBelow = page.locator('input').last();
        await inputBelow.click();
        await page.keyboard.press('Shift+Tab'); // → last cell
        await page.keyboard.press('Tab'); // → pagination

        const isPaginationFocused = await page.evaluate(
            () => document.activeElement?.closest('.ag-paging-panel') != null
        );
        expect(isPaginationFocused).toBe(true);

        // Tab forward from pagination → exits grid (returns false → browser default)
        await page.keyboard.press('Tab');
        const isStillInGrid = await page.evaluate(() => document.activeElement?.closest('.ag-root-wrapper') != null);
        expect(isStillInGrid).toBe(false);

        // Focus should have moved to the input below the grid
        await expect(page.locator('input').last()).toBeFocused();
    });
});

import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // focusGridInnerElement callback remembers the last focused cell or header and restores it
    // when the grid receives focus again (via Tab). Without a prior focus, default behaviour applies.
    //
    // Columns: rowNum (colId), athlete, age, country, year, date, sport, gold, silver, bronze, total
    // HTML has "Input Above" and "Input Below" surrounding the grid.

    test.eachFramework(
        'Tab from input above focuses first header by default (no prior focus)',
        async ({ page, agIdFor }) => {
            // Wait for grid data to load so the headers are tab-stops
            await expect(agIdFor.cell('0', 'athlete')).toBeVisible();

            const inputAbove = page.locator('input').first();
            await inputAbove.click();
            await expect(inputAbove).toBeFocused();

            await page.keyboard.press('Tab');
            await expect(agIdFor.headerCell('rowNum')).toBeFocused();
        }
    );

    test.eachFramework('Tab from input above restores previously focused cell', async ({ page, agIdFor }) => {
        // Focus a specific cell so focusGridInnerElement records it
        const targetCell = agIdFor.cell('3', 'country');
        await targetCell.click();
        await expect(targetCell).toHaveClass(/ag-cell-focus/);

        // Move focus outside the grid
        const inputAbove = page.locator('input').first();
        await inputAbove.click();
        await expect(inputAbove).toBeFocused();

        // Tab back into the grid — focusGridInnerElement restores the last focused cell
        await page.keyboard.press('Tab');
        await expect(targetCell).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Tab from input above restores previously focused header', async ({ page, agIdFor }) => {
        // Focus a header so focusGridInnerElement records it
        await agIdFor.headerCell('country').click();
        await expect(agIdFor.headerCell('country')).toBeFocused();

        // Move focus outside the grid
        const inputAbove = page.locator('input').first();
        await inputAbove.click();
        await expect(inputAbove).toBeFocused();

        // Tab back into grid — focusGridInnerElement restores the last focused header
        await page.keyboard.press('Tab');
        await expect(agIdFor.headerCell('country')).toBeFocused();
    });

    test.eachFramework('Shift+Tab from input below restores previously focused cell', async ({ page, agIdFor }) => {
        // Focus a specific cell
        const targetCell = agIdFor.cell('1', 'athlete');
        await targetCell.click();
        await expect(targetCell).toHaveClass(/ag-cell-focus/);

        // Move focus to input below
        const inputBelow = page.locator('input').last();
        await inputBelow.click();
        await expect(inputBelow).toBeFocused();

        // Shift+Tab back into the grid — focusGridInnerElement restores the last focused cell
        await page.keyboard.press('Shift+Tab');
        await expect(targetCell).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('ArrowUp and ArrowDown navigate cells vertically', async ({ page, agIdFor }) => {
        await agIdFor.cell('0', 'athlete').click();
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('ArrowUp from first row enters column header', async ({ page, agIdFor }) => {
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();
    });

    test.eachFramework('ArrowDown from column header enters first cell', async ({ page, agIdFor }) => {
        await agIdFor.headerCell('athlete').click();
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('ArrowDown');
        // Click sorts the column so use row-index to find the first displayed row rather than row ID '0'
        await expect(page.locator('[row-index="0"] [col-id="athlete"]')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Tab right through column headers', async ({ page, agIdFor }) => {
        await agIdFor.headerCell('rowNum').click();

        await page.keyboard.press('Tab');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(agIdFor.headerCell('age')).toBeFocused();

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();
    });

    test.eachFramework('Tab right through cells', async ({ page, agIdFor }) => {
        await agIdFor.cell('0', 'rowNum').click();

        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'age')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
    });
});

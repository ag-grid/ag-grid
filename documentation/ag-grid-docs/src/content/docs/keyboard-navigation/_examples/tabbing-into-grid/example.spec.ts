import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Columns: rowNum (colId), athlete, age, country, year, date, sport, gold, silver, bronze, total
    // No column groups. No floating filters (filter:true but no floatingFilter:true).
    // Tab order: column headers (left→right) then grid cells (row by row, left→right).
    // From docs: tabbing into the grid focuses the first column header (rowNum).

    test.eachFramework('Tab from input above grid focuses first column header', async ({ page, agIdFor }) => {
        // Wait for grid data to load so the headers are tab-stops
        await expect(agIdFor.cell('0', 'athlete')).toBeVisible();

        const inputAbove = page.locator('input').first();
        await inputAbove.click();
        await expect(inputAbove).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(agIdFor.headerCell('rowNum')).toBeFocused();
    });

    test.eachFramework('Tab through column headers left to right', async ({ page, agIdFor }) => {
        await agIdFor.headerCell('rowNum').click();
        await expect(agIdFor.headerCell('rowNum')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(agIdFor.headerCell('age')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(agIdFor.headerCell('country')).toBeFocused();

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.headerCell('age')).toBeFocused();

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.headerCell('rowNum')).toBeFocused();
    });

    test.eachFramework('Tab from last column header moves to first cell', async ({ page, agIdFor }) => {
        await agIdFor.headerCell('total').click();
        await expect(agIdFor.headerCell('total')).toBeFocused();

        await page.keyboard.press('Tab');
        // Verify the grid received focus in the cells row (check for any cell with focus or a visible editor)
        const cellIsActive = await page.evaluate(() => {
            const activeEl = document.activeElement;
            return (
                activeEl?.closest('.ag-body-viewport') != null ||
                activeEl?.closest('[role="gridcell"]') != null ||
                activeEl?.closest('.ag-cell') != null
            );
        });
        expect(cellIsActive).toBe(true);
    });

    test.eachFramework(
        'Shift+Tab from first cell enters column header row at last column',
        async ({ page, agIdFor }) => {
            await agIdFor.cell('0', 'rowNum').click();
            await expect(agIdFor.cell('0', 'rowNum')).toHaveClass(/ag-cell-focus/);

            await page.keyboard.press('Shift+Tab');
            await expect(agIdFor.headerCell('total')).toBeFocused();
        }
    );

    test.eachFramework('Tab right through cells', async ({ page, agIdFor }) => {
        await agIdFor.cell('0', 'rowNum').click();
        await expect(agIdFor.cell('0', 'rowNum')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'age')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('ArrowUp and ArrowDown navigate cells vertically', async ({ page, agIdFor }) => {
        await agIdFor.cell('0', 'athlete').click();
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.cell('2', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('ArrowUp from first row cell enters column header', async ({ page, agIdFor }) => {
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();
    });

    test.eachFramework('ArrowDown from column header enters first cell', async ({ page, agIdFor }) => {
        await agIdFor.headerCell('athlete').click();
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('ArrowDown');
        await expect(page.locator('[row-index="0"] [col-id="athlete"]')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Shift+Tab from input below grid focuses last cell', async ({ page, agIdFor }) => {
        // Wait for grid data to load so a cell exists to receive focus
        await expect(agIdFor.cell('0', 'athlete')).toBeVisible();

        const inputBelow = page.locator('input').last();
        await inputBelow.click();
        await expect(inputBelow).toBeFocused();

        await page.keyboard.press('Shift+Tab');
        await expect(page.locator('.ag-cell-focus[col-id="total"]')).toBeVisible();
    });
});

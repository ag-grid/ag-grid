import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('ArrowDown moves focus up one row (inverted)', async ({ agIdFor, page }) => {
        await agIdFor.cell('1', 'athlete').click();
        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('ArrowUp moves focus down one row (inverted)', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('multiple ArrowDown inverted steps', async ({ agIdFor, page }) => {
        await agIdFor.cell('3', 'athlete').click();
        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.cell('2', 'athlete')).toHaveClass(/ag-cell-focus/);
        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-cell-focus/);
        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('ArrowDown from row 0 navigates to column header', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();
    });

    test.eachFramework('ArrowDown from column header navigates to group header', async ({ agIdFor, page }) => {
        // Navigate to the column header first via ArrowDown from row 0
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        // ArrowDown again moves up to the group header row
        await page.keyboard.press('ArrowDown');
        const athleteGroupHeader = page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete' }).first();
        await expect(athleteGroupHeader).toBeFocused();
    });

    test.eachFramework('ArrowDown cannot navigate above group header', async ({ agIdFor, page }) => {
        // Navigate to the Athlete group header
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        const athleteGroupHeader = page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete' }).first();
        await expect(athleteGroupHeader).toBeFocused();

        // ArrowDown from group header (topmost row) should stay on the group header
        await page.keyboard.press('ArrowDown');
        await expect(athleteGroupHeader).toBeFocused();
    });

    test.eachFramework('ArrowUp from group header navigates to column header', async ({ agIdFor, page }) => {
        // Navigate to the Athlete group header
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        const athleteGroupHeader = page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete' }).first();
        await expect(athleteGroupHeader).toBeFocused();

        // ArrowUp from group header moves down to the column header row
        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();
    });

    test.eachFramework('ArrowUp from column header returns to grid row 0', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('ArrowUp');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('ArrowRight and ArrowLeft in column headers work normally', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.headerCell('age')).toBeFocused();

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.headerCell('country')).toBeFocused();

        await page.keyboard.press('ArrowLeft');
        await expect(agIdFor.headerCell('age')).toBeFocused();
    });

    test.eachFramework('Tab moves cell focus down (vertical)', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('2', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Shift+Tab moves cell focus up (vertical)', async ({ agIdFor, page }) => {
        await agIdFor.cell('2', 'athlete').click();
        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Shift+Tab from row 0 navigates to column header', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();
    });

    test.eachFramework('Tab from column header navigates to grid row 0', async ({ agIdFor, page }) => {
        // Navigate to the column header via Shift+Tab from row 0
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Shift+Tab from column header navigates to group header', async ({ agIdFor, page }) => {
        // Navigate to the column header via Shift+Tab from row 0
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();

        await page.keyboard.press('Shift+Tab');
        const athleteGroupHeader = page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete' }).first();
        await expect(athleteGroupHeader).toBeFocused();
    });

    test.eachFramework('Tab from group header navigates to column header', async ({ agIdFor, page }) => {
        // Navigate to the Athlete group header via ArrowDown from row 0 twice
        await agIdFor.cell('0', 'athlete').click();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('ArrowDown');
        const athleteGroupHeader = page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete' }).first();
        await expect(athleteGroupHeader).toBeFocused();

        await page.keyboard.press('Tab');
        await expect(agIdFor.headerCell('athlete')).toBeFocused();
    });
});

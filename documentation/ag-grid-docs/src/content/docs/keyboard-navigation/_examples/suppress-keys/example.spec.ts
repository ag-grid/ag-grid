import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Enter on Athlete cell does not start editing (suppressed)', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Enter');

        await expect(agIdFor.cell('0', 'athlete').locator('input')).toHaveCount(0);
    });

    test.eachFramework('Enter on Age cell starts editing (not suppressed)', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'age').click();
        await expect(agIdFor.cell('0', 'age')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('Enter');

        await expect(agIdFor.cell('0', 'age').locator('input')).toBeVisible();

        await page.keyboard.press('Escape');
    });

    test.eachFramework('Arrow keys do not navigate on Athlete cells (suppressed)', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Arrow keys do not navigate on Age cells (suppressed)', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'age').click();
        await expect(agIdFor.cell('0', 'age')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowDown');
        await expect(agIdFor.cell('0', 'age')).toHaveClass(/ag-cell-focus/);

        await page.keyboard.press('ArrowRight');
        await expect(agIdFor.cell('0', 'age')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework(
        'ArrowUp and ArrowDown navigate on Country cells (not suppressed for country)',
        async ({ agIdFor, page }) => {
            await agIdFor.cell('0', 'country').click();
            await expect(agIdFor.cell('0', 'country')).toHaveClass(/ag-cell-focus/);

            await page.keyboard.press('ArrowDown');
            await expect(agIdFor.cell('1', 'country')).toHaveClass(/ag-cell-focus/);

            await page.keyboard.press('ArrowUp');
            await expect(agIdFor.cell('0', 'country')).toHaveClass(/ag-cell-focus/);
        }
    );

    test.eachFramework(
        'ArrowLeft and ArrowRight do not navigate on Country cells (suppressed)',
        async ({ agIdFor, page }) => {
            await agIdFor.cell('0', 'country').click();
            await expect(agIdFor.cell('0', 'country')).toHaveClass(/ag-cell-focus/);

            await page.keyboard.press('ArrowRight');
            await expect(agIdFor.cell('0', 'country')).toHaveClass(/ag-cell-focus/);

            await page.keyboard.press('ArrowLeft');
            await expect(agIdFor.cell('0', 'country')).toHaveClass(/ag-cell-focus/);
        }
    );

    test.eachFramework(
        'ArrowLeft and ArrowRight navigate in non-Country column headers (not suppressed)',
        async ({ agIdFor, page }) => {
            await agIdFor.headerCell('athlete').click();
            await expect(agIdFor.headerCell('athlete')).toBeFocused();

            await page.keyboard.press('ArrowRight');
            await expect(agIdFor.headerCell('age')).toBeFocused();

            await page.keyboard.press('ArrowLeft');
            await expect(agIdFor.headerCell('athlete')).toBeFocused();
        }
    );

    test.eachFramework(
        'ArrowUp and ArrowDown do not navigate in non-Country column headers (suppressed)',
        async ({ agIdFor, page }) => {
            await agIdFor.headerCell('athlete').click();
            await expect(agIdFor.headerCell('athlete')).toBeFocused();

            await page.keyboard.press('ArrowUp');
            await expect(agIdFor.headerCell('athlete')).toBeFocused();

            await page.keyboard.press('ArrowDown');
            await expect(agIdFor.headerCell('athlete')).toBeFocused();
        }
    );

    test.eachFramework(
        'ArrowLeft and ArrowRight do not navigate in Country column header (suppressed)',
        async ({ agIdFor, page }) => {
            await agIdFor.headerCell('country').click();
            await expect(agIdFor.headerCell('country')).toBeFocused();

            await page.keyboard.press('ArrowRight');
            await expect(agIdFor.headerCell('country')).toBeFocused();

            await page.keyboard.press('ArrowLeft');
            await expect(agIdFor.headerCell('country')).toBeFocused();
        }
    );

    test.eachFramework(
        'ArrowDown from Country header navigates to first Country cell (not suppressed)',
        async ({ agIdFor, page }) => {
            await agIdFor.headerCell('country').click();
            await expect(agIdFor.headerCell('country')).toBeFocused();

            await page.keyboard.press('ArrowDown');
            // Click sorts the column so use row-index to find the first displayed row rather than row ID '0'
            await expect(page.locator('[row-index="0"] [col-id="country"]')).toHaveClass(/ag-cell-focus/);
        }
    );
});

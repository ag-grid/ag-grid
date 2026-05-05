import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Tab navigates through cell renderer elements forward', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        // Tab from athlete → country cell receives grid focus
        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'country')).toHaveClass(/ag-cell-focus/);

        // Tab from country cell (no child focused) → button (first focusable child)
        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'country').locator('button')).toBeFocused();

        // Tab from button → input (second focusable child)
        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'country').locator('input')).toBeFocused();

        // Tab from input → link (third / last focusable child)
        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'country').locator('a')).toBeFocused();

        // Tab from link (last child) → AG Grid moves to next cell: (1, athlete)
        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework('Tab into country cell from the left focuses the button first', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click();
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

        // Tab → country cell gets grid focus
        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'country')).toHaveClass(/ag-cell-focus/);

        // Tab again → button is the first focusable child, so it receives focus
        await page.keyboard.press('Tab');
        await expect(agIdFor.cell('0', 'country').locator('button')).toBeFocused();
    });

    test.eachFramework('Shift+Tab navigates backward through cell renderer elements', async ({ agIdFor, page }) => {
        await agIdFor.cell('1', 'athlete').click();
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-cell-focus/);

        // Shift+Tab from (1, athlete): athlete has no focusable children → not suppressed
        // AG Grid moves to previous cell: (0, country) receives grid focus
        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.cell('0', 'country')).toHaveClass(/ag-cell-focus/);

        // Shift+Tab from country cell (no child focused) → last child (link) receives focus
        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.cell('0', 'country').locator('a')).toBeFocused();

        // Shift+Tab from link → input (second focusable child)
        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.cell('0', 'country').locator('input')).toBeFocused();

        // Shift+Tab from input → button (first focusable child)
        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.cell('0', 'country').locator('button')).toBeFocused();

        // Shift+Tab from button (first child) → not suppressed → AG Grid moves to (0, athlete)
        await page.keyboard.press('Shift+Tab');
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
    });

    test.eachFramework(
        'Shift+Tab from first element (button) exits back to previous cell',
        async ({ agIdFor, page }) => {
            // Navigate forward to reach the button inside the country cell renderer
            await agIdFor.cell('0', 'athlete').click();
            await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);

            await page.keyboard.press('Tab'); // → country cell (grid focus)
            await page.keyboard.press('Tab'); // → button (first child)
            await expect(agIdFor.cell('0', 'country').locator('button')).toBeFocused();

            // Shift+Tab from button (first child): NOT suppressed → AG Grid moves to previous cell
            await page.keyboard.press('Shift+Tab');
            await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-focus/);
        }
    );
});

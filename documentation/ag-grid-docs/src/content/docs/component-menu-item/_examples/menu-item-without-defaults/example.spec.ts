import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('custom Filter item replaces the default column filter', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();

        // the custom "Filter" menu item is present
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Filter' })).toBeVisible();

        // focus a menu option so Escape is delivered to the open menu
        await page.locator('.ag-menu-option').first().focus();
        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework(
        'clicking the custom item expands and collapses the inline filter',
        async ({ agIdFor, page }) => {
            await agIdFor.headerCell('athlete').hover();
            await agIdFor.headerCellMenuButton('athlete').click();
            await expect(agIdFor.menu()).toBeVisible();

            const filterOption = page.locator('.ag-menu-option').filter({ hasText: 'Filter' });
            const filterInput = page.locator('.filter-wrapper input').first();

            // the inline filter starts collapsed, showing the "tree-closed" pointer icon
            await expect(filterInput).not.toBeVisible();
            await expect(filterOption.locator('.ag-icon-tree-closed')).toBeVisible();

            // clicking the custom option expands the filter and flips the pointer icon
            await filterOption.click();
            await expect(filterInput).toBeVisible();
            await expect(filterOption.locator('.ag-icon-tree-open')).toBeVisible();

            // clicking again collapses it
            await filterOption.click();
            await expect(filterInput).not.toBeVisible();
            await expect(filterOption.locator('.ag-icon-tree-closed')).toBeVisible();
        }
    );

    test.eachFramework('the built-in Column Filter item is filtered out', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();

        // getMainMenuItems removes 'columnFilter' from defaultItems
        await expect(agIdFor.menuOption('Column Filter')).toHaveCount(0);
        // the other default items are untouched
        await expect(agIdFor.menuOption('Sort Ascending')).toBeVisible();
        await expect(agIdFor.menuOption('Reset Columns')).toBeVisible();
    });

    test.eachFramework('the embedded filter filters the grid rows', async ({ agIdFor, agFramework, page }) => {
        // The generated vanilla variant drops the example's ModuleRegistry.registerModules() call and
        // loads the whole ag-grid-enterprise UMD bundle, so `filter: true` resolves to the enterprise Set
        // Filter rather than the TextFilterModule the example registers. The embedded component then
        // holds a Set Filter, whose only text input is the mini-filter - typing in it searches the value
        // list instead of filtering the grid, so the behaviour this test drives does not exist there.
        test.skip(agFramework === 'vanilla', 'vanilla loads the full enterprise bundle, so athlete gets a Set Filter.');
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();

        await page.locator('.ag-menu-option').filter({ hasText: 'Filter' }).click();

        const filterInput = page.locator('.filter-wrapper input').first();
        await expect(filterInput).toBeVisible();
        await filterInput.fill('Phelps');
        await filterInput.dispatchEvent('input');

        // the embedded component is the real column filter, so the grid filters down to the Phelps rows
        await expect(agIdFor.headerCell('athlete')).toHaveClass(/ag-header-cell-filtered/);
        await expect(page.locator('.ag-row[row-id]')).toHaveCount(3);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });

    test.eachFramework('Enter and Space toggle the custom item like a click', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();

        const filterOption = page.locator('.ag-menu-option').filter({ hasText: 'Filter' });
        const filterInput = page.locator('.filter-wrapper input').first();
        await expect(filterInput).not.toBeVisible();

        // hovering activates the item, which focuses it so keystrokes reach its keydown handler
        await filterOption.hover();
        await page.keyboard.press('Enter');
        await expect(filterInput).toBeVisible();

        await page.keyboard.press(' ');
        await expect(filterInput).not.toBeVisible();
    });

    test.eachFramework('mouseenter marks the custom item active', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();

        const filterOption = page.locator('.ag-menu-option').filter({ hasText: 'Filter' });
        await expect(filterOption).not.toHaveClass(/ag-menu-option-active/);

        await filterOption.hover();
        await expect(filterOption).toHaveClass(/ag-menu-option-active/);
    });
});

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
});

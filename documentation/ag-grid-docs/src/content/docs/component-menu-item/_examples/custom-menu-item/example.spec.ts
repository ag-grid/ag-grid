import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('opening the menu moves keyboard focus into it', async ({ agIdFor, page, agFramework }) => {
        // React does not focus a menu containing custom framework items, breaking keyboard nav — see AG-17785.
        test.fixme(
            agFramework.startsWith('reactFunctionalTs'),
            'AG-17785: React menu with custom items does not receive initial focus'
        );

        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();

        // an open menu should place keyboard focus on one of its items so Escape / arrow keys work
        await page.waitForFunction(() => {
            const menu = document.querySelector('[data-testid="ag-menu"]');
            return !!menu && menu.contains(document.activeElement);
        });
    });

    test.eachFramework('custom menu items appear in the column menu', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();

        // both custom menu items are appended after the default items
        await expect(
            page.locator('.ag-menu-option-text', { hasText: 'Click Alert Button and Close Menu' })
        ).toBeVisible();
        await expect(
            page.locator('.ag-menu-option-text', { hasText: 'Click Alert Button and Keep Menu Open' })
        ).toBeVisible();
        // each custom item renders its Alert button
        await expect(page.locator('.ag-menu-option .alert-button')).toHaveCount(2);

        // focus a menu option so Escape is delivered to the open menu
        await page.locator('.ag-menu-option').first().focus();
        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('suppressCloseOnSelect keeps the menu open, otherwise it closes', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();

        // selecting the "Keep Menu Open" item leaves the menu visible
        const keepOpen = page.locator('.ag-menu-option').filter({ hasText: 'Keep Menu Open' });
        await keepOpen.locator('.alert-button').click();
        await expect(agIdFor.menu()).toBeVisible();

        // selecting the "Close Menu" item closes the menu
        const closeMenu = page.locator('.ag-menu-option').filter({ hasText: 'Close Menu' });
        await closeMenu.locator('.alert-button').click();
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('custom menu items also appear in the context menu', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        await expect(
            page.locator('.ag-menu-option-text', { hasText: 'Click Alert Button and Close Menu' })
        ).toBeVisible();
        await expect(
            page.locator('.ag-menu-option-text', { hasText: 'Click Alert Button and Keep Menu Open' })
        ).toBeVisible();

        // focus a menu option so Escape is delivered to the open menu
        await page.locator('.ag-menu-option').first().focus();
        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });
});

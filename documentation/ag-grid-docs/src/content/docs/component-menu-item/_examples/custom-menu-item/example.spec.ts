import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('opening the menu moves keyboard focus into it', async ({ agIdFor, page }) => {
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

    test.eachFramework('clicking the Alert button logs to the console', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        const logs: string[] = [];
        const handler = (msg: { type: () => string; text: () => string }) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        };
        page.on('console', handler);

        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();

        // use the suppressCloseOnSelect item so the menu stays open while the log is captured
        const keepOpen = page.locator('.ag-menu-option').filter({ hasText: 'Keep Menu Open' });
        await keepOpen.locator('.alert-button').click();

        // the component logs `${name} clicked`
        await expect(() => {
            expect(logs.some((l) => l.includes('Click Alert Button and Keep Menu Open clicked'))).toBe(true);
        }).toPass();
        page.off('console', handler);
    });

    test.eachFramework('configureDefaults enables arrow-key navigation', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();

        // getMainMenuItems appends the two custom components after all the default items, so the
        // keyboard has to reach them to prove configureDefaults() enabled the default behaviour -
        // arrowing through the built-in items alone would pass with the custom ones inert.
        const options = page.locator('.ag-menu-option');
        const count = await options.count();
        const firstCustom = options.nth(count - 2);
        const secondCustom = options.nth(count - 1);
        await expect(firstCustom).toContainText('Click Alert Button and Close Menu');
        await expect(secondCustom).toContainText('Click Alert Button and Keep Menu Open');

        // hovering activates the first custom item (also a configureDefaults behaviour)...
        await firstCustom.hover();
        await expect(firstCustom).toHaveClass(/ag-menu-option-active/);
        await expect(secondCustom).not.toHaveClass(/ag-menu-option-active/);

        // ...and ArrowDown moves the activation onto the second custom item.
        await page.keyboard.press('ArrowDown');
        await expect(secondCustom).toHaveClass(/ag-menu-option-active/);
        await expect(firstCustom).not.toHaveClass(/ag-menu-option-active/);
    });

    test.eachFramework('custom items come after the defaults in the column menu', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();
        await expect(agIdFor.menuOption('Choose Columns')).toBeVisible();

        // getMainMenuItems spreads defaultItems first, then a separator, then the two custom items
        const options = page.locator('.ag-menu-option');
        const count = await options.count();
        expect(count).toBeGreaterThan(2);
        await expect(options.nth(count - 2)).toContainText('Click Alert Button and Close Menu');
        await expect(options.nth(count - 1)).toContainText('Click Alert Button and Keep Menu Open');
    });

    test.eachFramework('custom items come after the defaults in the context menu', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        // getContextMenuItems spreads defaultItems first, then a separator, then the two custom items
        const options = page.locator('.ag-menu-option');
        const count = await options.count();
        expect(count).toBeGreaterThan(2);
        await expect(options.nth(count - 2)).toContainText('Click Alert Button and Close Menu');
        await expect(options.nth(count - 1)).toContainText('Click Alert Button and Keep Menu Open');
    });
});

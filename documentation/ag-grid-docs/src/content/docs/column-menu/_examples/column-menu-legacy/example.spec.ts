import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('athlete shows the legacy tabbed menu', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        const menu = page.locator('.ag-tabs.ag-menu');
        await expect(menu).toBeVisible();
        // legacy menu shows the general, filter and columns tabs
        await expect(menu.locator('.ag-tab')).toHaveCount(3);
        await page.keyboard.press('Escape');
        await expect(menu).toHaveCount(0);
    });

    test.eachFramework('country hides the general tab', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('country').hover();
        await agIdFor.headerCellMenuButton('country').click();
        const menu = page.locator('.ag-tabs.ag-menu');
        await expect(menu).toBeVisible();
        // only filter and columns tabs
        await expect(menu.locator('.ag-tab')).toHaveCount(2);
        await page.keyboard.press('Escape');
    });

    test.eachFramework('sport suppresses the menu entirely', async ({ agIdFor }) => {
        await agIdFor.headerCell('sport').hover();
        await expect(agIdFor.headerCellMenuButton('sport')).toHaveCount(0);
    });
});

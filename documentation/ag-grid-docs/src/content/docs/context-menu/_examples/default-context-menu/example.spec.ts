import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('grid renders the olympic data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('right-click opens the default context menu', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await agIdFor.cell('0', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        // default built-in items are shown
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Copy' }).first()).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Export' }).first()).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });
});

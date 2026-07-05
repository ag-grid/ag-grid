import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('age column appends custom items to the default menu', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'age')).toContainText('23');

        await agIdFor.headerCell('age').hover();
        await agIdFor.headerCellMenuButton('age').click();
        await expect(agIdFor.menu()).toBeVisible();
        // default item still present
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' })).toBeVisible();
        // appended custom items
        await expect(page.locator('.ag-menu-option-text', { hasText: 'A Custom Item' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Custom Sub Menu' })).toBeVisible();
        await page.keyboard.press('Escape');
    });

    test.eachFramework('country column shows only custom items plus resetColumns', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('country').hover();
        await agIdFor.headerCellMenuButton('country').click();
        await expect(agIdFor.menu()).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'A Custom Item' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Another Custom Item' })).toBeVisible();
        // the single built-in item that was included
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Reset Columns' })).toBeVisible();
        // a default item that was NOT included is absent
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Choose Columns' })).toHaveCount(0);
        await page.keyboard.press('Escape');
    });
});

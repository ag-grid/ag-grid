import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('custom context menu items are shown alongside built-in items', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await agIdFor.cell('0', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        // custom items
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Always Disabled' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Country' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Person' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Windows' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Mac' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Checked' })).toBeVisible();
        // built-in item
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Copy' }).first()).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('first custom item reflects the clicked cell value', async ({ agIdFor, page }) => {
        // Michael Phelps' first row is 23 in the age column
        await expect(agIdFor.cell('0', 'age')).toContainText('23');

        await agIdFor.cell('0', 'age').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        // custom item name is built from params.value => "Log 23"
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Log 23' })).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('the Always Disabled item is disabled', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        const disabledItem = page.locator('.ag-menu-option').filter({ hasText: 'Always Disabled' });
        await expect(disabledItem).toHaveClass(/ag-menu-option-disabled/);

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('hovering the Person item opens its sub menu', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        await page.locator('.ag-menu-option').filter({ hasText: 'Person' }).hover();

        // sub menu entries become visible
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Niall' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Alberto' })).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });
});

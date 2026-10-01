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

    test.eachFramework('Country column resolves its menu items asynchronously', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');

        // the country column returns a Promise resolved after a delay, so the items
        // arrive after the right-click - the web-first assertions retry until they do
        await agIdFor.cell('0', 'country').click({ button: 'right' });

        await expect(page.locator('.ag-menu-option-text', { hasText: 'Log United States' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Always Disabled' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Country' })).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('the Country sub menu items render image icons', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        await page.locator('.ag-menu-option').filter({ hasText: 'Country' }).hover();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Ireland' })).toBeVisible();

        // each sub menu entry supplies an <img> flag as its icon
        const ireland = page.locator('.ag-menu-option').filter({ hasText: 'Ireland' });
        await expect(ireland.locator('.ag-menu-option-icon img')).toHaveCount(1);

        await page.keyboard.press('Escape');
    });

    test.eachFramework('the top menu item carries its cssClasses', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await agIdFor.cell('0', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        // cssClasses: ['red', 'bold'] on the first item
        const logItem = page.locator('.ag-menu-option').filter({ hasText: 'Log Michael Phelps' });
        await expect(logItem).toHaveClass(/\bred\b/);
        await expect(logItem).toHaveClass(/\bbold\b/);

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('the Always Disabled item shows its tooltip on hover', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        await page.locator('.ag-menu-option').filter({ hasText: 'Always Disabled' }).hover();

        const tooltip = page.locator('.ag-tooltip:not(.ag-tooltip-hiding)');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Very long tooltip');
    });

    test.eachFramework('a checked item renders a checkmark instead of its icon', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        // checked: true and icon are mutually exclusive - the icon is ignored
        const checkedItem = page.locator('.ag-menu-option').filter({ hasText: 'Checked' });
        await expect(checkedItem).toHaveAttribute('aria-checked', 'true');
        // the MenuItem module maps the 'check' icon name to the 'tick' icon
        await expect(checkedItem.locator('.ag-menu-option-icon .ag-icon-tick')).toBeVisible();
        await expect(checkedItem.locator('.ag-menu-option-icon img')).toHaveCount(0);

        // contrast: the Mac item supplies the same icon and does render it
        const macItem = page.locator('.ag-menu-option').filter({ hasText: 'Mac' });
        await expect(macItem.locator('.ag-menu-option-icon img')).toHaveCount(1);

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('the built-in chartRange item is included', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        await expect(page.locator('.ag-menu-option-text', { hasText: 'Chart Range' })).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });
});

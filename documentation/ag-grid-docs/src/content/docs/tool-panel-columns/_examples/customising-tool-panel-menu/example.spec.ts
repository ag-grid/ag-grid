import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('tool panel menu adds a pin sub-menu and a custom highlight item', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toBeVisible();

        // right-click the Athlete entry in the Columns Tool Panel
        await page.locator('.ag-column-select-column', { hasText: 'Athlete' }).click({ button: 'right' });

        // built-in item is still shown, alongside the customised pin sub-menu and custom item
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Group by Athlete' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Pin Column' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Highlight Column' })).toBeVisible();

        // the custom item highlights the column's cells (applied via cellStyle)
        await expect(agIdFor.cell('0', 'athlete')).not.toHaveAttribute('style', /background-color/);
        await page.locator('.ag-menu-option-text', { hasText: 'Highlight Column' }).click();
        await expect(agIdFor.cell('0', 'athlete')).toHaveAttribute('style', /background-color/);
    });

    test.eachFramework('column header menu keeps its defaults (branches on source)', async ({ agIdFor, page }) => {
        await agIdFor.headerCell('athlete').hover();
        await agIdFor.headerCellMenuButton('athlete').click();
        await expect(agIdFor.menu()).toBeVisible();

        // the tool-panel-only custom item is not added to the column header menu
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Highlight Column' })).toHaveCount(0);
    });
});

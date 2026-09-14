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

        // the Export sub menu offers every registered export module
        await page.locator('.ag-menu-option-text', { hasText: 'Export' }).first().hover();
        for (const exportItem of ['CSV Export', 'Excel Export', 'PDF Export']) {
            await expect(page.locator('.ag-menu-option-text', { hasText: exportItem }).first()).toBeVisible();
        }

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('Copy with Headers and Copy with Group Headers are default items', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        await agIdFor.cell('0', 'athlete').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        await expect(page.locator('.ag-menu-option-text', { hasText: 'Copy with Headers' })).toBeVisible();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Copy with Group Headers' })).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });

    test.eachFramework('Chart Range is offered for a selected cell range', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');

        // cellSelection is enabled, so click + shift-click selects a range of cells
        await agIdFor.cell('0', 'gold').click();
        await agIdFor.cell('2', 'gold').click({ modifiers: ['Shift'] });
        await expect(agIdFor.cell('2', 'gold')).toHaveClass(/ag-cell-range-selected/);

        await agIdFor.cell('1', 'gold').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        // enableCharts=true plus a non-empty range adds the chartRange item
        const chartRange = page.locator('.ag-menu-option-text', { hasText: 'Chart Range' });
        await expect(chartRange).toBeVisible();

        // it is a sub menu of chart types
        await chartRange.hover();
        await expect(page.locator('.ag-menu-option-text', { hasText: 'Column' }).first()).toBeVisible();

        await page.keyboard.press('Escape');
    });
});

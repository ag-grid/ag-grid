import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Remove All Rows empties the grid', async ({ page }) => {
        const athletes = page.locator('.ag-cell[col-id="athlete"]');
        await expect(athletes).toHaveCount(4);

        await page.locator('button', { hasText: 'Remove All Rows' }).click();

        await expect(athletes).toHaveCount(0);
        await expect(page.locator('.ag-overlay-no-rows-center')).toBeVisible();
    });

    test.typescript('Ctrl+V on the empty grid adds the copied rows', async ({ page, agIdFor }) => {
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        await agIdFor.cell('0', 'athlete').click();
        await agIdFor.cell('1', 'athlete').click({ modifiers: ['Shift'] });
        await page.keyboard.press('Control+c');
        await page.locator('button', { hasText: 'Remove All Rows' }).click();

        await page.locator('.ag-grid-viewport').click();
        await page.keyboard.press('Control+v');

        await expect(page.locator('.ag-cell[col-id="athlete"]')).toHaveText(['Michael Phelps', 'Natalie Coughlin']);
        await expect(page.locator('.ag-cell[col-id="sport"]')).toHaveText(['Swimming', 'Swimming']);
    });

    test.typescript('Paste from the context menu of the empty grid adds the copied rows', async ({ page, agIdFor }) => {
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

        await agIdFor.cell('2', 'athlete').click();
        await page.keyboard.press('Control+c');
        await page.locator('button', { hasText: 'Remove All Rows' }).click();

        await page.locator('.ag-grid-viewport').click({ button: 'right' });
        await page.locator('.ag-menu-option', { hasText: 'Paste' }).click();

        await expect(page.locator('.ag-cell[col-id="athlete"]')).toHaveText(['Aleksey Nemov']);
    });
});

import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('grid renders its rows', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'a')).toContainText('1');
        await expect(agIdFor.cell('1', 'a')).toContainText('2');
    });

    test.eachFramework('context menu renders on the document body (popupParent)', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'a').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        // popupParent is set to document.body, so the menu popup escapes the grid's root wrapper
        const insideGrid = await agIdFor.menu().evaluate((el) => !!el.closest('.ag-root-wrapper'));
        expect(insideGrid).toBe(false);

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });
});

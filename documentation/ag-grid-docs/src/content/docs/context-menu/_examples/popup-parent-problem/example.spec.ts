import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('grid renders its rows', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'a')).toContainText('1');
        await expect(agIdFor.cell('1', 'a')).toContainText('2');
    });

    test.eachFramework('context menu renders inside the grid (default popup parent)', async ({ agIdFor, page }) => {
        await agIdFor.cell('0', 'a').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        // with no popupParent set, the menu popup is contained within the grid's root wrapper
        const insideGrid = await agIdFor.menu().evaluate((el) => !!el.closest('.ag-root-wrapper'));
        expect(insideGrid).toBe(true);

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });
});

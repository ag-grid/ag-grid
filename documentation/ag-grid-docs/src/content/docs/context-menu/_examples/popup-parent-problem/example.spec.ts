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

    test.eachFramework('the menu is clipped by the small grid container', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'a')).toContainText('1');

        await agIdFor.cell('0', 'a').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        const menuBox = (await agIdFor.menu().boundingBox())!;
        const gridBox = (await page.locator('.ag-root-wrapper').boundingBox())!;

        // the grid is only 100px tall, so the menu cannot fit inside it
        expect(menuBox.height).toBeGreaterThan(gridBox.height);

        // and because the popup lives inside the grid, it extends outside the
        // grid's bounds - where the grid wrapper's overflow clips it
        const overflowsGrid = menuBox.y < gridBox.y - 1 || menuBox.y + menuBox.height > gridBox.y + gridBox.height + 1;
        expect(overflowsGrid).toBe(true);

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });
});

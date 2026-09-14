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

    test.eachFramework('the menu escapes the small grid and stays fully visible', async ({ agIdFor, page }) => {
        await expect(agIdFor.cell('0', 'a')).toContainText('1');

        await agIdFor.cell('0', 'a').click({ button: 'right' });
        await expect(agIdFor.menu()).toBeVisible();

        const menuBox = (await agIdFor.menu().boundingBox())!;
        const gridBox = (await page.locator('.ag-root-wrapper').boundingBox())!;
        const viewport = page.viewportSize()!;

        // the menu is taller than the 100px grid, so it has to extend past it
        expect(menuBox.height).toBeGreaterThan(gridBox.height);
        expect(menuBox.y + menuBox.height).toBeGreaterThan(gridBox.y + gridBox.height);

        // with popupParent=document.body nothing clips it: it is fully inside the viewport
        expect(menuBox.y).toBeGreaterThanOrEqual(0);
        expect(menuBox.x).toBeGreaterThanOrEqual(0);
        expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(viewport.height);
        expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewport.width);

        await page.keyboard.press('Escape');
        await expect(agIdFor.menu()).toHaveCount(0);
    });
});

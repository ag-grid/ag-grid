/**
 * Issue: with `popupParent` set to an element that has no CSS `position` (static, the default), popups such as the
 * context menu and the column menu open far away from the pointer or the menu button, above the parent.
 *
 * Setup: a 400px spacer, then a plain `<div>` wrapper with no CSS position containing the grid (300px tall). The
 * wrapper is the grid's `popupParent`. Nothing scrolls. The context menu is opened by right-clicking a cell, and the
 * column menu by clicking the header's menu button.
 *
 * Expected: the popup is positioned at the pointer (context menu) or directly under the menu button (column menu), as
 * it is when `popupParent` is unset. The popupParent docs say the parent only needs to exist in the DOM and cover the
 * same area as the grid, or be a parent of the grid, and the context menu docs say it appears when the user right
 * clicks a cell.
 *
 * Actual: the position is computed relative to the static wrapper's offset parent (the body), then clamped to the
 * wrapper's own height, so the menu is placed within roughly the first 100px of the page, hundreds of pixels above
 * the pointer or button.
 *
 * Reported on: not reported; found by an area review of popup positioning with popupParent for AG-18665. Related
 * searches: "popup positioned incorrectly cut off popupParent", "Angular 35.1, context menu, popupParent".
 *
 * Source: found by an area review of Popup positioning with popupParent for AG-18665, related to searches such as
 * "popup positioned incorrectly cut off popupParent" and "Angular 35.1, context menu, popupParent".
 */
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

async function mountGridInStaticPopupParent(page: Page) {
    const mounted = await mountGrid(page, {
        enterprise: true,
        height: 300,
        options: () => ({
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [
                { a: 1, b: 1 },
                { a: 2, b: 2 },
                { a: 3, b: 3 },
            ],
        }),
    });

    await page.evaluate(() => {
        const grid = document.querySelector<HTMLElement>('#myGrid')!;
        const spacer = document.createElement('div');
        spacer.style.height = '400px';
        const wrapper = document.createElement('div');
        wrapper.id = 'popupWrapper';
        grid.before(spacer, wrapper);
        wrapper.append(grid);
        window.gridApi.setGridOption('popupParent', wrapper);
    });
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('#popupWrapper')!).position)).toBe(
        'static'
    );
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    return mounted;
}

test('context menu opens at the pointer when popupParent is a static element', async ({ page }) => {
    const { cell } = await mountGridInStaticPopupParent(page);

    const target = cell(1, 'a');
    await target.click({ button: 'right' });

    const menu = page.locator('#popupWrapper .ag-menu').first();
    await expect(menu).toBeVisible();

    const cellBox = (await target.boundingBox())!;
    const menuBox = (await menu.boundingBox())!;
    const pointerY = cellBox.y + cellBox.height / 2;
    expect(menuBox.y, 'context menu should open at the pointer').toBeGreaterThanOrEqual(pointerY - 10);
    expect(menuBox.y, 'context menu should open at the pointer').toBeLessThanOrEqual(pointerY + 10);
});

test('column menu opens under its button when popupParent is a static element', async ({ page }) => {
    const { headerCell } = await mountGridInStaticPopupParent(page);

    const header = headerCell('a');
    await header.hover();
    const menuButton = header.locator('.ag-header-cell-menu-button');
    await menuButton.click();

    const menu = page.locator('#popupWrapper .ag-menu').first();
    await expect(menu).toBeVisible();

    const buttonBox = (await menuButton.boundingBox())!;
    const menuBox = (await menu.boundingBox())!;
    expect(menuBox.y, 'column menu should open directly under the menu button').toBeGreaterThanOrEqual(
        buttonBox.y + buttonBox.height - 1
    );
    expect(menuBox.y, 'column menu should open directly under the menu button').toBeLessThanOrEqual(
        buttonBox.y + buttonBox.height + 50
    );
});

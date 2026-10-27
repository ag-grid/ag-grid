/**
 * Issue: with `popupParent` set to a scrolled container element, the column menu is positioned away from its header
 * button.
 *
 * Setup: the grid sits inside a `position: relative; overflow: auto` wrapper that is shorter than its content and has
 * been scrolled down so the grid header is visible. The wrapper is the grid's `popupParent`. The header's menu button
 * is clicked to open the column menu.
 *
 * Expected: the popup is anchored to the source element, so the menu opens directly under the menu button (the popupParent
 * docs say popups are not constrained to the grid and are positioned correctly within the parent).
 *
 * Actual: the popup position is computed from the parent's viewport rectangle without accounting for the parent's scroll
 * offset, so the menu is offset by the scroll distance and is no longer under the button.
 *
 * Reported on: AG Grid angular 35.1.0 / 32.3.4, vanilla 35.0.0 / 32.0.0, react 34.3 to 36.0, vue 36.0.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). Coding agents across Angular, Vanilla JS, React and Vue
 * (versions 32 to 36, January to September 2026) made ten searches about popups clipped, cut off or mispositioned when
 * `popupParent` is set, e.g. "popupParent filter popup clipped small grid autoHeight" and "popup positioned
 * incorrectly cut off popupParent".
 */
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test('column menu opens under its button when popupParent is a scrolled container', async ({ page }) => {
    const { headerCell } = await mountGrid(page, {
        enterprise: true,
        height: 300,
        options: () => ({
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [
                { a: 1, b: 1 },
                { a: 2, b: 2 },
            ],
        }),
    });

    await page.evaluate(() => {
        const grid = document.querySelector<HTMLElement>('#myGrid')!;
        const wrapper = document.createElement('div');
        wrapper.id = 'popupWrapper';
        wrapper.style.cssText = 'position:relative;overflow:auto;height:500px;width:900px;';
        grid.before(wrapper);
        const before = document.createElement('div');
        before.style.height = '400px';
        const after = document.createElement('div');
        after.style.height = '400px';
        wrapper.append(before, grid, after);
        wrapper.scrollTop = 300;
        window.gridApi.setGridOption('popupParent', wrapper);
    });
    expect(await page.evaluate(() => document.querySelector('#popupWrapper')!.scrollTop)).toBe(300);

    const header = headerCell('a');
    await header.hover();
    const menuButton = header.locator('.ag-header-cell-menu-button');
    await menuButton.click();

    const menu = page.locator('#popupWrapper .ag-menu').first();
    await expect(menu).toBeVisible();

    const buttonBox = (await menuButton.boundingBox())!;
    const menuBox = (await menu.boundingBox())!;
    expect(menuBox.y, 'menu should open directly under the menu button').toBeGreaterThanOrEqual(
        buttonBox.y + buttonBox.height - 1
    );
    expect(menuBox.y, 'menu should open directly under the menu button').toBeLessThanOrEqual(
        buttonBox.y + buttonBox.height + 50
    );
});

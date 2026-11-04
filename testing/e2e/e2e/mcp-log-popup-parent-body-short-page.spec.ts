/**
 * Issue: with `popupParent` set to `document.body` on a page whose content is shorter than the viewport, popups are
 * pushed to the top of the page instead of opening where they were requested.
 *
 * Setup: a page with no margins and nothing but a 150px high grid, in a 1280x720 viewport, so the page content is
 * 150px high and there is empty viewport space below it. The grid's `popupParent` is `document.body`, as the docs
 * recommend for a small grid. Nothing is scrolled. The context menu is opened by right clicking a cell, and the
 * column menu by clicking the header's menu button.
 *
 * Expected: the docs say that when a grid is small the menu is clipped, "The solution is to set the `popupParent`
 * element [...] Most of the time, you will simply set the popup parent to the document body." (context menu docs,
 * "Popup Parent" section; the column menu docs say the same). So the menu is no longer constrained by the grid and
 * opens at the pointer (context menu) or under the button (column menu), extending into the empty space below the
 * grid.
 *
 * Actual: the popup is clamped to the height of the page content rather than the height of the viewport. The menu is
 * taller than the 150px page, so it is placed at the top of the page, covering the header and the clicked cell,
 * exactly as it would be if it were constrained by the small grid.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of "Popup positioning with popupParent" for AG-18665, related to searches such as
 * "popupParent filter popup clipped small grid autoHeight".
 */
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

async function mountSmallGridWithBodyPopupParent(page: Parameters<typeof mountGrid>[0]) {
    return mountGrid(page, {
        enterprise: true,
        width: 600,
        height: 150,
        options: () => ({
            popupParent: document.body,
            columnDefs: [{ field: 'a' }],
            rowData: [{ a: 1 }],
        }),
    });
}

test('context menu opens at the pointer when popupParent is body on a short page', async ({ page }) => {
    const { cell } = await mountSmallGridWithBodyPopupParent(page);

    const target = cell(0, 'a');
    const targetBox = (await target.boundingBox())!;
    const pointerY = targetBox.y + targetBox.height / 2;
    await target.click({ button: 'right' });

    const menu = page.locator('.ag-menu').first();
    await expect(menu).toBeVisible();
    const menuBox = (await menu.boundingBox())!;

    expect(menuBox.y, 'context menu should open at the pointer, not at the top of the page').toBeGreaterThanOrEqual(
        pointerY - 5
    );
    expect(menuBox.y, 'context menu should open at the pointer, not at the top of the page').toBeLessThanOrEqual(
        pointerY + 5
    );
});

test('column menu opens under its button when popupParent is body on a short page', async ({ page }) => {
    const { headerCell } = await mountSmallGridWithBodyPopupParent(page);

    const header = headerCell('a');
    await header.hover();
    const menuButton = header.locator('.ag-header-cell-menu-button');
    await menuButton.click();

    const menu = page.locator('.ag-menu').first();
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

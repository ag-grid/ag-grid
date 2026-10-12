import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

const SPACER_HEIGHT = 1500;

// The reported page: html and body are height: 100% and the grid sits mid-page, so <html> is one viewport tall
// while the document scrolls past it.
async function mountGridMidPage(page: Page) {
    const mounted = await mountGrid(page, {
        enterprise: true,
        height: 300,
        options: () => ({
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [
                { a: 1, b: 1 },
                { a: 2, b: 2 },
            ],
            popupParent: document.body,
        }),
    });

    await page.evaluate((spacerHeight) => {
        const style = document.createElement('style');
        style.textContent = 'html, body { height: 100%; }';
        document.head.appendChild(style);

        const grid = document.querySelector('#myGrid')!;
        for (const position of ['beforebegin', 'afterend'] as const) {
            const spacer = document.createElement('div');
            spacer.style.height = `${spacerHeight}px`;
            grid.insertAdjacentElement(position, spacer);
        }
    }, SPACER_HEIGHT);

    return mounted;
}

// The column menu is positioned against its header menu button.
async function openColumnMenuWithHeaderAt(page: Page, headerTop: number) {
    const { headerCell } = await mountGridMidPage(page);
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), SPACER_HEIGHT - headerTop);

    const header = headerCell('a');
    await header.hover();
    const menuButton = header.locator('.ag-header-cell-menu-button');
    await menuButton.click();

    const menu = page.locator('.ag-menu').first();
    await expect(menu).toBeVisible();

    return {
        buttonBox: (await menuButton.boundingBox())!,
        menuBox: (await menu.boundingBox())!,
        viewportHeight: page.viewportSize()!.height,
    };
}

test.describe('column menu position when html and body are height: 100%', () => {
    test('opens downwards when the scrolled page has room below the header', async ({ page }) => {
        const { buttonBox, menuBox, viewportHeight } = await openColumnMenuWithHeaderAt(page, 50);

        expect(menuBox.y).toBeGreaterThanOrEqual(buttonBox.y + buttonBox.height);
        expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(viewportHeight);
    });

    test('opens upwards when the header sits near the bottom of the viewport', async ({ page }) => {
        const viewportHeight = page.viewportSize()!.height;
        const { buttonBox, menuBox } = await openColumnMenuWithHeaderAt(page, viewportHeight - 100);

        expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(buttonBox.y);
        expect(menuBox.y).toBeGreaterThanOrEqual(0);
    });
});

import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

type ThemeModeSource = 'none' | 'html' | 'ancestor';

/** Mounts the grid with dark mode set on `<html>`, or on an `.ag-theme-mode` ancestor in the grid's own root node. */
async function mountWithThemeMode(page: Page, source: ThemeModeSource, shadowDom: boolean) {
    const mounted = await mountGrid(page, {
        enterprise: true,
        shadowDom,
        className: source === 'ancestor' ? 'ag-theme-mode' : '',
        options: () => ({
            columnDefs: [{ field: 'country' }, { field: 'year' }],
            rowData: [{ country: 'France', year: 2020 }],
            getContextMenuItems: () => new Promise(() => {}),
        }),
    });
    if (source === 'html') {
        await page.evaluate(() => {
            document.documentElement.dataset.agThemeMode = 'dark';
        });
    } else if (source === 'ancestor') {
        await mounted.grid.evaluate((el: HTMLElement) => {
            el.dataset.agThemeMode = 'dark';
        });
    }
    return mounted;
}

const readStyle = (locator: Locator, property: 'backgroundColor' | 'color') =>
    locator.evaluate((el, property) => getComputedStyle(el)[property], property);

async function readDragImageBackground(page: Page, source: ThemeModeSource, shadowDom = false) {
    const { headerCell } = await mountWithThemeMode(page, source, shadowDom);
    const box = (await headerCell('country').boundingBox())!;
    await page.mouse.move(box.x + 10, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 60, box.y + 80, { steps: 5 });
    const ghost = page.locator('.ag-dnd-ghost');
    await expect(ghost).toBeVisible();
    const background = await readStyle(ghost, 'backgroundColor');
    await page.mouse.up();
    return background;
}

async function readLoadingIconColour(page: Page, source: ThemeModeSource, shadowDom = false) {
    const { cell } = await mountWithThemeMode(page, source, shadowDom);
    await cell(0, 'country').click({ button: 'right' });
    const icon = page.locator('.ag-context-menu-loading-icon .ag-icon');
    await expect(icon).toBeVisible();
    return readStyle(icon, 'color');
}

for (const shadowDom of [false, true]) {
    test.describe(`theme mode from an .ag-theme-mode ancestor, shadowDom=${shadowDom}`, () => {
        test('reaches the column drag image', async ({ page }) => {
            const light = await readDragImageBackground(page, 'none');
            const dark = await readDragImageBackground(page, 'html');
            expect(dark).not.toEqual(light);

            expect(await readDragImageBackground(page, 'ancestor', shadowDom)).toEqual(dark);
        });

        test('reaches the context menu loading icon', async ({ page }) => {
            const light = await readLoadingIconColour(page, 'none');
            const dark = await readLoadingIconColour(page, 'html');
            expect(dark).not.toEqual(light);

            expect(await readLoadingIconColour(page, 'ancestor', shadowDom)).toEqual(dark);
        });
    });
}

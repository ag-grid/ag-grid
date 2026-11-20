import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

declare global {
    interface Window {
        dialogTestRtl: boolean;
    }
}

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

async function rectOf(locator: Locator): Promise<Rect> {
    const { x, y, width, height } = (await locator.boundingBox())!;
    return { x: Math.round(x), y: Math.round(y), width: Math.round(width), height: Math.round(height) };
}

/**
 * A dialog keeps itself where it opened while its content renders, for the first 200ms, so a change of size in that
 * time puts it back there. A person can't start moving or resizing it that soon, so wait that out.
 */
const settle = (page: Page) => page.waitForTimeout(300);

/**
 * Opens the column chooser and starts moving and resizing it from the keyboard. Returns where it was before (`before`)
 * and as the mode started (`start`), taller by the bar of step buttons.
 */
async function startOnColumnChooser(page: Page, enableRtl = false) {
    // setContent preserves window properties, so the options can read the flag in the page
    await page.evaluate((rtl) => (window.dialogTestRtl = rtl), enableRtl);
    const { grid, withApi } = await mountGrid(page, {
        enterprise: true,
        width: 1000,
        height: 600,
        options: () => ({
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData: [{ athlete: 'Michael Phelps', age: 23 }],
            enableRtl: window.dialogTestRtl,
        }),
    });
    await withApi((api) => api.showColumnChooser());
    const dialog = grid.locator('.ag-dialog');
    await settle(page);
    const toggle = dialog.getByRole('button', { name: 'Move and Resize' });
    const before = await rectOf(dialog);
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    return { dialog, toggle, before, start: await rectOf(dialog) };
}

async function press(page: Page, key: string, times: number): Promise<void> {
    for (let i = 0; i < times; i++) {
        await page.keyboard.press(key);
    }
}

test.describe('moving and resizing dialogs without dragging', () => {
    test('arrow keys move the dialog, Shift with them resizes it, Escape puts it back and Enter keeps a change', async ({
        page,
    }) => {
        const { dialog, toggle, before, start } = await startOnColumnChooser(page);

        await press(page, 'ArrowRight', 3);
        await press(page, 'ArrowDown', 2);
        expect(await rectOf(dialog)).toEqual({ ...start, x: start.x + 30, y: start.y + 20 });

        await press(page, 'Shift+ArrowRight', 2);
        await press(page, 'Shift+ArrowDown', 1);
        expect(await rectOf(dialog)).toEqual({
            x: start.x + 30,
            y: start.y + 20,
            width: start.width + 20,
            height: start.height + 10,
        });

        await page.keyboard.press('Escape');
        expect(await rectOf(dialog)).toEqual(before);
        await expect(toggle).toHaveAttribute('aria-pressed', 'false');
        await expect(dialog).toBeVisible();

        await page.keyboard.press('Enter');
        await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('Shift+ArrowRight');
        await page.keyboard.press('Shift+ArrowDown');
        await page.keyboard.press('Enter');
        await expect(toggle).toHaveAttribute('aria-pressed', 'false');
        expect(await rectOf(dialog)).toEqual({
            x: before.x - 10,
            y: before.y,
            width: before.width + 10,
            height: before.height + 10,
        });
    });

    test('the step buttons move and resize the dialog by a click each, keeping focus on Move and Resize', async ({
        page,
    }) => {
        const { dialog, toggle, start } = await startOnColumnChooser(page);

        await dialog.getByRole('button', { name: 'Move Right' }).click();
        await dialog.getByRole('button', { name: 'Wider' }).click();
        await dialog.getByRole('button', { name: 'Taller' }).click();

        expect(await rectOf(dialog)).toEqual({
            x: start.x + 10,
            y: start.y,
            width: start.width + 10,
            height: start.height + 10,
        });
        await expect(toggle).toBeFocused();
        await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    test('the dialog stops at the edge of the grid and at its minimum size, and the step buttons say so', async ({
        page,
    }) => {
        const { dialog } = await startOnColumnChooser(page);
        // the inner left edge of the grid, which the dialog is positioned in
        const gridLeft = await dialog.evaluate((el: HTMLElement) => {
            const parent = el.offsetParent!;
            return Math.round(parent.getBoundingClientRect().left + parent.clientLeft);
        });
        const moveLeft = dialog.getByRole('button', { name: 'Move Left' });
        const narrower = dialog.getByRole('button', { name: 'Narrower' });
        await expect(moveLeft).toHaveAttribute('aria-disabled', 'false');

        await press(page, 'ArrowLeft', 60);
        expect((await rectOf(dialog)).x).toBe(gridLeft);
        await expect(moveLeft).toHaveAttribute('aria-disabled', 'true');
        await expect(dialog.getByRole('button', { name: 'Move Right' })).toHaveAttribute('aria-disabled', 'false');

        await press(page, 'Shift+ArrowLeft', 60);
        const smallest = await rectOf(dialog);
        await page.keyboard.press('Shift+ArrowLeft');
        expect(await rectOf(dialog)).toEqual(smallest);
        await expect(narrower).toHaveAttribute('aria-disabled', 'true');
    });

    test('a dialog that only moves keeps its size, and Escape cancels the move without closing it', async ({
        page,
    }) => {
        const { grid, withApi } = await mountGrid(page, {
            enterprise: true,
            width: 1000,
            height: 600,
            options: () => ({
                columnDefs: [{ field: 'athlete', headerNameEditable: true }, { field: 'age' }],
                rowData: [{ athlete: 'Michael Phelps', age: 23 }],
            }),
        });
        await withApi((api) => api.showColumnMenu('athlete'));
        await page.getByRole('menuitem', { name: 'Edit Column Name' }).click();
        const dialog = grid.locator('.ag-dialog', { has: page.locator('.ag-column-header-edit-popup-editor') });
        await expect(dialog.getByRole('textbox')).toBeFocused();
        await settle(page);
        const toggle = dialog.getByRole('button', { name: 'Move and Resize' });
        const before = await rectOf(dialog);
        await toggle.focus();
        await page.keyboard.press('Enter');
        // it sizes to its content, so it grows by the bar of step buttons while moving
        const start = await rectOf(dialog);
        expect(start).toMatchObject({ x: before.x, y: before.y, width: before.width });

        await press(page, 'Shift+ArrowRight', 2);
        expect(await rectOf(dialog)).toEqual(start);
        await expect(dialog.getByRole('group', { name: 'Position' })).toBeVisible();
        await expect(dialog.getByRole('button', { name: 'Wider' })).toBeHidden();

        await press(page, 'ArrowDown', 2);
        expect(await rectOf(dialog)).toEqual({ ...start, y: start.y + 20 });

        await page.keyboard.press('Escape');
        expect(await rectOf(dialog)).toEqual(before);
        await expect(dialog).toBeVisible();
    });

    test('the dialog grows to fit the bar of step buttons, so its content keeps its size', async ({ page }) => {
        const { dialog, before, start } = await startOnColumnChooser(page);
        const bar = dialog.locator('.ag-dialog-move-resize-bar');
        const content = dialog.locator('.ag-panel-content-wrapper');
        const barBox = await rectOf(bar);
        const contentBox = await rectOf(content);

        expect(contentBox.y).toBeGreaterThanOrEqual(barBox.y + barBox.height);
        expect(start).toEqual({ ...before, height: before.height + barBox.height });

        await page.keyboard.press('Enter');
        await expect(bar).toBeHidden();
        expect(await rectOf(dialog)).toEqual(before);
        expect((await rectOf(content)).height).toBe(contentBox.height);
    });

    test('at the bottom of the grid, the dialog moves up to fit the bar, and back down as the mode ends', async ({
        page,
    }) => {
        const { dialog, toggle } = await startOnColumnChooser(page);
        await page.keyboard.press('Enter');
        // drag it to the bottom of the grid by its title
        const title = await dialog.locator('.ag-panel-title-bar-title').boundingBox();
        await page.mouse.move(title!.x + 10, title!.y + 10);
        await page.mouse.down();
        await page.mouse.move(title!.x + 10, title!.y + 500, { steps: 5 });
        await page.mouse.up();
        const atBottom = await rectOf(dialog);

        await toggle.focus();
        await page.keyboard.press('Enter');
        const barHeight = (await rectOf(dialog.locator('.ag-dialog-move-resize-bar'))).height;
        expect(await rectOf(dialog)).toEqual({
            ...atBottom,
            y: atBottom.y - barHeight,
            height: atBottom.height + barHeight,
        });

        await page.keyboard.press('Enter');
        expect(await rectOf(dialog)).toEqual(atBottom);
    });

    test('right to left: the arrow keys move the dialog the way they point', async ({ page }) => {
        const { dialog, start } = await startOnColumnChooser(page, true);

        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('Shift+ArrowRight');

        expect(await rectOf(dialog)).toEqual({ ...start, x: start.x + 10, width: start.width + 10 });
    });
});

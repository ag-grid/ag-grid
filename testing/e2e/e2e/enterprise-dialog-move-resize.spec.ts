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

/** Opens the column chooser and starts moving and resizing it from the keyboard, returning where it is. */
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
    const start = await rectOf(dialog);
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    // the ghost's outline is over the dialog, and shows once the ghost differs from it
    const ghost = grid.locator('.ag-dialog-ghost-outline');
    return { grid, dialog, toggle, ghost, start };
}

async function press(page: Page, key: string, times: number): Promise<void> {
    for (let i = 0; i < times; i++) {
        await page.keyboard.press(key);
    }
}

test.describe('moving and resizing dialogs without dragging', () => {
    test('starting the mode leaves the dialog as it is, with the bar of step buttons over its content', async ({
        page,
    }) => {
        const { dialog, ghost, start } = await startOnColumnChooser(page);

        expect(await rectOf(dialog)).toEqual(start);
        await expect(ghost).toBeHidden();
        const titleBar = await rectOf(dialog.locator('.ag-panel-title-bar'));
        const bar = await rectOf(dialog.locator('.ag-dialog-move-resize-bar'));
        const content = await rectOf(dialog.locator('.ag-panel-content-wrapper'));
        expect(bar.y).toBe(titleBar.y + titleBar.height);
        expect(content.y).toBe(bar.y);
    });

    test('arrow keys move a ghost of the dialog and Shift with them resizes it, Enter moves the dialog to it', async ({
        page,
    }) => {
        const { dialog, toggle, ghost, start } = await startOnColumnChooser(page);

        await press(page, 'ArrowRight', 3);
        await press(page, 'ArrowDown', 2);
        expect(await rectOf(ghost)).toEqual({ ...start, x: start.x + 30, y: start.y + 20 });
        await press(page, 'Shift+ArrowRight', 2);
        await press(page, 'Shift+ArrowDown', 1);
        const target = { x: start.x + 30, y: start.y + 20, width: start.width + 20, height: start.height + 10 };
        expect(await rectOf(ghost)).toEqual(target);
        expect(await rectOf(dialog)).toEqual(start);

        await page.keyboard.press('Enter');
        await expect(toggle).toHaveAttribute('aria-pressed', 'false');
        await expect(ghost).toHaveCount(0);
        expect(await rectOf(dialog)).toEqual(target);
    });

    test('Escape leaves the dialog where it was, open', async ({ page }) => {
        const { dialog, toggle, ghost, start } = await startOnColumnChooser(page);

        await press(page, 'ArrowLeft', 3);
        await press(page, 'Shift+ArrowUp', 2);
        await expect(ghost).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(toggle).toHaveAttribute('aria-pressed', 'false');
        await expect(ghost).toHaveCount(0);
        await expect(dialog).toBeVisible();
        expect(await rectOf(dialog)).toEqual(start);
    });

    test('the step buttons stay put while the ghost moves, so repeated clicks land, and clicking away applies it', async ({
        page,
    }) => {
        const { grid, dialog, toggle, ghost, start } = await startOnColumnChooser(page);

        for (const [name, times] of [
            ['Move Right', 5],
            ['Wider', 2],
            ['Taller', 3],
        ] as const) {
            const button = await rectOf(dialog.getByRole('button', { name }));
            await page.mouse.move(button.x + button.width / 2, button.y + button.height / 2);
            for (let i = 0; i < times; i++) {
                await page.mouse.down();
                await page.mouse.up();
            }
        }
        const target = { x: start.x + 50, y: start.y, width: start.width + 20, height: start.height + 30 };
        expect(await rectOf(ghost)).toEqual(target);
        expect(await rectOf(dialog)).toEqual(start);
        await expect(toggle).toBeFocused();

        // click away, on the grid
        await grid.locator('.ag-cell').first().click();
        await expect(toggle).toHaveAttribute('aria-pressed', 'false');
        expect(await rectOf(dialog)).toEqual(target);
    });

    test('dragging the dialog in the mode takes the ghost with it, and the mode carries on from there', async ({
        page,
    }) => {
        const { dialog, toggle, ghost } = await startOnColumnChooser(page);
        await press(page, 'ArrowRight', 3);
        await expect(ghost).toBeVisible();

        const title = await rectOf(dialog.locator('.ag-panel-title-bar-title'));
        await page.mouse.move(title.x + 10, title.y + 10);
        await page.mouse.down();
        await page.mouse.move(title.x - 30, title.y + 40, { steps: 5 });
        await expect(ghost).toBeHidden();
        await page.mouse.up();
        const dragged = await rectOf(dialog);
        await expect(ghost).toBeHidden();

        const corner = await rectOf(dialog.locator('.ag-resizer-bottomRight'));
        await page.mouse.move(corner.x + 2, corner.y + 2);
        await page.mouse.down();
        await page.mouse.move(corner.x + 22, corner.y + 12, { steps: 5 });
        await page.mouse.up();
        await expect(toggle).toHaveAttribute('aria-pressed', 'true');
        await expect(toggle).toBeFocused();
        const resized = await rectOf(dialog);
        expect(resized).toMatchObject({ x: dragged.x, y: dragged.y });
        expect(resized.width).toBeGreaterThan(dragged.width);
        expect(resized.height).toBeGreaterThan(dragged.height);
        await expect(ghost).toBeHidden();

        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        expect(await rectOf(dialog)).toEqual({ ...resized, y: resized.y + 10 });
    });

    test('the ghost stops at the edge of the grid and at the minimum size, and the step buttons say so', async ({
        page,
    }) => {
        const { dialog, ghost, start } = await startOnColumnChooser(page);
        // the inner left edge of the grid, which the dialog is positioned in
        const gridLeft = await dialog.evaluate((el: HTMLElement) => {
            const parent = el.offsetParent!;
            return Math.round(parent.getBoundingClientRect().left + parent.clientLeft);
        });
        const moveLeft = dialog.getByRole('button', { name: 'Move Left' });
        const narrower = dialog.getByRole('button', { name: 'Narrower' });
        await expect(moveLeft).toHaveAttribute('aria-disabled', 'false');

        await press(page, 'ArrowLeft', 60);
        expect((await rectOf(ghost)).x).toBe(gridLeft);
        await expect(moveLeft).toHaveAttribute('aria-disabled', 'true');
        await expect(dialog.getByRole('button', { name: 'Move Right' })).toHaveAttribute('aria-disabled', 'false');

        await press(page, 'Shift+ArrowLeft', 60);
        const smallest = await rectOf(ghost);
        await page.keyboard.press('Shift+ArrowLeft');
        expect(await rectOf(ghost)).toEqual(smallest);
        await expect(narrower).toHaveAttribute('aria-disabled', 'true');

        await page.keyboard.press('Enter');
        expect(await rectOf(dialog)).toEqual(smallest);
        expect(smallest.width).toBeLessThan(start.width);
    });

    test('a dialog that only moves offers no resizing, and Escape cancels the move without closing it', async ({
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
        const start = await rectOf(dialog);
        await dialog.getByRole('button', { name: 'Move and Resize' }).focus();
        await page.keyboard.press('Enter');
        const ghost = grid.locator('.ag-dialog-ghost-outline');

        await expect(dialog.getByRole('group', { name: 'Position' })).toBeVisible();
        await expect(dialog.getByRole('button', { name: 'Wider' })).toBeHidden();
        expect(await rectOf(dialog)).toEqual(start);
        await press(page, 'Shift+ArrowRight', 2);
        await expect(ghost).toBeHidden();

        await press(page, 'ArrowDown', 2);
        expect(await rectOf(ghost)).toEqual({ ...start, y: start.y + 20 });

        await page.keyboard.press('Escape');
        await expect(dialog).toBeVisible();
        expect(await rectOf(dialog)).toEqual(start);
    });

    test('right to left: the arrow keys move the ghost the way they point', async ({ page }) => {
        const { ghost, start } = await startOnColumnChooser(page, true);

        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('Shift+ArrowRight');

        expect(await rectOf(ghost)).toEqual({ ...start, x: start.x + 10, width: start.width + 10 });
    });
});

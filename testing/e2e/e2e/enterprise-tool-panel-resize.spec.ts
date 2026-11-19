import type { Locator } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

const panelWidth = (grid: Locator) =>
    grid.locator('.ag-tool-panel-wrapper').evaluate((el) => (el as HTMLElement).offsetWidth);

/** Whether the focused element is the tool panel's resize border. */
const isBorderFocused = (grid: Locator) =>
    grid.page().evaluate(() => document.activeElement?.matches('.ag-tool-panel-horizontal-resize') ?? false);

/** Checks whether the Widen and Narrow buttons are shown, which they are only after a click or tap on the border. */
const expectButtonsShown = (grid: Locator, shown: boolean) =>
    expect(grid.locator('.ag-tool-panel-resize-buttons')).toHaveCSS('visibility', shown ? 'visible' : 'hidden');

test.describe('resizing the tool panel without dragging', () => {
    test('Tab from the grid focuses the border, a separator named after the panel, without showing the buttons', async ({
        page,
    }) => {
        const { grid, cell } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'athlete' }, { field: 'country' }],
                rowData: [{ athlete: 'Michael Phelps', country: 'United States' }],
                sideBar: 'columns',
            }),
        });
        const border = grid.locator('.ag-tool-panel-horizontal-resize');
        await expectButtonsShown(grid, false);

        await cell(0, 'country').click();
        await page.keyboard.press('Tab');

        expect(await isBorderFocused(grid)).toBe(true);
        await expect(border).toHaveAttribute('role', 'separator');
        await expect(border).toHaveAttribute('aria-label', 'Columns');
        await expect(border).toHaveAttribute('aria-valuenow', String(await panelWidth(grid)));
        await expectButtonsShown(grid, false);
    });

    test('arrow keys resize the panel within its limits', async ({ page }) => {
        const { grid } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'athlete' }],
                sideBar: {
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                            minWidth: 200,
                            maxWidth: 350,
                        },
                    ],
                    defaultToolPanel: 'columns',
                },
            }),
        });
        await grid.locator('.ag-tool-panel-horizontal-resize').focus();

        for (let i = 0; i < 20; i++) {
            await page.keyboard.press('ArrowLeft');
        }
        expect(await panelWidth(grid)).toBe(350);

        for (let i = 0; i < 20; i++) {
            await page.keyboard.press('ArrowRight');
        }
        expect(await panelWidth(grid)).toBe(200);
        await expect(grid.locator('.ag-tool-panel-horizontal-resize')).toHaveAttribute('aria-valuenow', '200');
    });

    test('with the side bar on the left, Tab from the panel reaches the border and Right Arrow widens', async ({
        page,
    }) => {
        const { grid } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'athlete' }],
                sideBar: { toolPanels: ['columns'], defaultToolPanel: 'columns', position: 'left' },
            }),
        });
        await grid.locator('.ag-column-select-header-filter-wrapper input').click();

        // the column list takes focus asynchronously, so wait for it before tabbing on, or it takes focus back
        await page.keyboard.press('Tab');
        await expect
            .poll(() => page.evaluate(() => document.activeElement?.className ?? ''))
            .toContain('ag-column-select-virtual-list-item');
        await page.keyboard.press('Tab');
        await expect.poll(() => isBorderFocused(grid)).toBe(true);

        const before = await panelWidth(grid);
        await page.keyboard.press('ArrowRight');
        expect(await panelWidth(grid)).toBe(before + 10);
    });

    test('with enableRtl, Tab from the grid reaches the border and Right Arrow widens', async ({ page }) => {
        const { grid, cell } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'athlete' }],
                rowData: [{ athlete: 'Michael Phelps' }],
                enableRtl: true,
                sideBar: 'columns',
            }),
        });
        await cell(0, 'athlete').click();
        await page.keyboard.press('Tab');
        expect(await isBorderFocused(grid)).toBe(true);

        const before = await panelWidth(grid);
        await page.keyboard.press('ArrowRight');
        expect(await panelWidth(grid)).toBe(before + 10);
    });

    test('clicking the border shows 24px Widen and Narrow buttons that resize the panel', async ({ page }) => {
        const { grid } = await mountGrid(page, {
            enterprise: true,
            options: () => ({ columnDefs: [{ field: 'athlete' }], sideBar: 'columns' }),
        });
        const widen = grid.getByRole('button', { name: 'Widen Panel' });
        const narrow = grid.getByRole('button', { name: 'Narrow Panel' });
        await expectButtonsShown(grid, false);

        await grid.locator('.ag-tool-panel-horizontal-resize').click();
        await expectButtonsShown(grid, true);

        for (const button of [widen, narrow]) {
            const box = (await button.boundingBox())!;
            expect(box.width).toBeGreaterThanOrEqual(24);
            expect(box.height).toBeGreaterThanOrEqual(24);
        }
        const before = await panelWidth(grid);
        await widen.click();
        expect(await panelWidth(grid)).toBe(before + 10);
        await narrow.click();
        await narrow.click();
        expect(await panelWidth(grid)).toBe(before - 10);
        await expectButtonsShown(grid, true);
        expect(await isBorderFocused(grid)).toBe(true);

        // they are not Tab stops: Tab moves on into the panel and hides them
        await page.keyboard.press('Tab');
        await expect
            .poll(() => page.evaluate(() => !!document.activeElement?.closest('.ag-tool-panel-content')))
            .toBe(true);
        await expectButtonsShown(grid, false);
    });

    test('dragging the border still resizes the panel and updates its value', async ({ page }) => {
        const { grid } = await mountGrid(page, {
            enterprise: true,
            options: () => ({ columnDefs: [{ field: 'athlete' }], sideBar: 'columns' }),
        });
        const border = grid.locator('.ag-tool-panel-horizontal-resize');
        const box = (await border.boundingBox())!;
        const before = await panelWidth(grid);

        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x - 80, box.y + box.height / 2, { steps: 10 });
        await page.mouse.up();

        const after = await panelWidth(grid);
        expect(after).toBeGreaterThan(before);
        await expect(border).toHaveAttribute('aria-valuenow', String(after));
        await expectButtonsShown(grid, false);
    });
});

import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import type { MountGridParams } from '../src/mountGrid';
import { mountGrid } from '../src/mountGrid';

// WCAG 1.4.12 text spacing, as a user style sheet applies it
const TEXT_SPACING_CSS =
    '#myGrid * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }';

/** For each visible drop zone hint, the pixels of its text cut off by an element that clips without scrolling. */
function getClippedHintPixels(grid: Locator): Promise<number[]> {
    return grid.evaluate((gridEl) => {
        const hints = [...gridEl.querySelectorAll<HTMLElement>('.ag-column-drop-vertical-empty-message')].filter(
            (hint) => hint.offsetParent
        );
        return hints.map((hint) => {
            const range = document.createRange();
            range.selectNodeContents(hint);
            const lines = [...range.getClientRects()];
            const textTop = Math.min(...lines.map((r) => r.top));
            const textBottom = Math.max(...lines.map((r) => r.bottom));
            let clipped = 0;
            for (let el: HTMLElement | null = hint; el && el !== gridEl; el = el.parentElement) {
                const { overflowX, overflowY } = getComputedStyle(el);
                if (/auto|scroll/.test(overflowY)) {
                    break;
                }
                if (/hidden|clip/.test(overflowX) || /hidden|clip/.test(overflowY)) {
                    const box = el.getBoundingClientRect();
                    clipped = Math.max(clipped, Math.max(0, box.top - textTop) + Math.max(0, textBottom - box.bottom));
                }
            }
            return clipped;
        });
    });
}

async function expectHintsUnclipped(page: Page, params: Omit<MountGridParams, 'options'>, pivotMode = false) {
    const { grid, withApi } = await mountGrid(page, {
        enterprise: true,
        ...params,
        css: TEXT_SPACING_CSS + (params.css ?? ''),
        options: () => ({
            columnDefs: [{ field: 'country', enableRowGroup: true, enableValue: true, enablePivot: true }],
            rowData: [],
            sideBar: 'columns',
        }),
    });
    if (pivotMode) {
        await withApi((api) => api.setGridOption('pivotMode', true));
    }
    await expect(grid.locator('.ag-column-drop-vertical-empty-message:visible')).toHaveCount(pivotMode ? 3 : 2);

    for (const clipped of await getClippedHintPixels(grid)) {
        expect(clipped).toBeLessThan(0.5);
    }
}

test.describe('Columns tool panel drop zone hints with WCAG 1.4.12 text spacing', () => {
    test('are not clipped', async ({ page }) => {
        await expectHintsUnclipped(page, { height: 500 });
    });

    test('are not clipped in a short grid', async ({ page }) => {
        await expectHintsUnclipped(page, { height: 350 });
    });

    test('are not clipped in pivot mode', async ({ page }) => {
        await expectHintsUnclipped(page, { height: 500 }, true);
    });

    test('are not clipped with longer translations', async ({ page }) => {
        const { grid } = await mountGrid(page, {
            enterprise: true,
            height: 500,
            css: TEXT_SPACING_CSS,
            options: () => ({
                columnDefs: [{ field: 'country', enableRowGroup: true, enableValue: true }],
                rowData: [],
                sideBar: 'columns',
                localeText: {
                    rowGroupColumnsEmptyMessage: 'Ziehen Sie hierher, um Zeilengruppen festzulegen',
                    valueColumnsEmptyMessage: 'Hierher ziehen, um zu aggregieren',
                },
            }),
        });
        await expect(grid.locator('.ag-column-drop-vertical-empty-message:visible')).toHaveCount(2);

        for (const clipped of await getClippedHintPixels(grid)) {
            expect(clipped).toBeLessThan(0.5);
        }
    });

    for (const theme of ['quartz', 'balham']) {
        test(`are not clipped with the legacy ${theme} theme`, async ({ page }) => {
            const styles = path.join(__dirname, '../../../packages/ag-grid-community/styles');
            const legacyCss = ['ag-grid.css', `ag-theme-${theme}.css`]
                .map((file) => fs.readFileSync(path.join(styles, file), 'utf8'))
                .join('\n');
            const { grid } = await mountGrid(page, {
                enterprise: true,
                height: 350,
                className: `ag-theme-${theme}`,
                css: TEXT_SPACING_CSS + legacyCss,
                options: () => ({
                    theme: 'legacy',
                    columnDefs: [{ field: 'country', enableRowGroup: true, enableValue: true }],
                    rowData: [],
                    sideBar: 'columns',
                    localeText: { rowGroupColumnsEmptyMessage: 'Ziehen Sie hierher, um Zeilengruppen festzulegen' },
                }),
            });
            await expect(grid.locator('.ag-column-drop-vertical-empty-message:visible')).toHaveCount(2);

            for (const clipped of await getClippedHintPixels(grid)) {
                expect(clipped).toBeLessThan(0.5);
            }
        });
    }
});

test.describe('Columns tool panel column list resizing', () => {
    test('can grow the list but never pushes a drop zone out of the panel', async ({ page }) => {
        const { grid } = await mountGrid(page, {
            enterprise: true,
            height: 500,
            options: () => ({
                columnDefs: [{ field: 'country', enableRowGroup: true, enableValue: true }],
                rowData: [],
                sideBar: 'columns',
            }),
        });
        const panel = grid.locator('.ag-column-panel');
        const columnList = grid.locator('.ag-column-select');
        const resizer = columnList.locator('.ag-resizer-bottom');
        const listHeight = async () => (await columnList.boundingBox())!.height;
        const dragResizer = async (distance: number) => {
            const box = (await resizer.boundingBox())!;
            const x = box.x + box.width / 2;
            const y = box.y + box.height / 2;
            await page.mouse.move(x, y);
            await page.mouse.down();
            await page.mouse.move(x, y + distance, { steps: 20 });
            await page.mouse.up();
        };

        const initialHeight = await listHeight();
        await dragResizer(10);
        expect(await listHeight()).toBeGreaterThan(initialHeight);

        await dragResizer(400);
        expect(await panel.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeLessThanOrEqual(1);
    });
});

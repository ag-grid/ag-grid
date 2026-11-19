import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

declare global {
    interface Window {
        hoverScrollEnsureDomOrder: boolean;
    }
}

const rowUnderPoint = (page: Page, x: number, y: number) =>
    page.evaluate(
        ({ x, y }) => document.elementFromPoint(x, y)?.closest('.ag-row')?.getAttribute('row-index') ?? null,
        { x, y }
    );

const hoveredRowIndexes = (page: Page) =>
    page.evaluate(() => Array.from(document.querySelectorAll('.ag-row-hover'), (row) => row.getAttribute('row-index')));

// Chromium re-hit-tests after a wheel scroll and hides a stuck hover; Firefox and WebKit show it.
for (const ensureDomOrder of [true, false]) {
    test(`wheel scrolling under a still pointer leaves only the row under it hovered (ensureDomOrder ${ensureDomOrder})`, async ({
        page,
    }) => {
        await page.evaluate((value) => {
            window.hoverScrollEnsureDomOrder = value;
        }, ensureDomOrder);
        const { cell } = await mountGrid(page, {
            options: () => ({
                ensureDomOrder: window.hoverScrollEnsureDomOrder,
                rowHeight: 40,
                columnDefs: [{ field: 'name', tooltip: true }, { field: 'amount' }],
                rowData: Array.from({ length: 500 }, (_, i) => ({ name: `Project ${i}`, amount: i * 10 })),
                tooltipShowDelay: 0,
            }),
        });

        const box = (await cell(2, 'name').boundingBox())!;
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.mouse.move(x, y);
        await expect(page.getByRole('tooltip')).toHaveText('Project 2');

        for (let i = 0; i < 20; ++i) {
            await page.mouse.wheel(0, 40);
        }
        await expect
            .poll(() => page.evaluate(() => document.querySelector('.ag-grid-viewport')!.scrollTop))
            .toBeGreaterThan(400);
        await page.evaluate(
            () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
        );

        const rowIndex = await rowUnderPoint(page, x, y);
        await expect.poll(() => hoveredRowIndexes(page)).toEqual([rowIndex]);
        expect(await page.locator('.ag-tooltip').count()).toBeLessThanOrEqual(1);
    });
}

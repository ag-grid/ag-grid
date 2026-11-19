import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

declare global {
    interface Window {
        hoverScrollEnsureDomOrder: boolean;
    }
}

const scrollTop = (page: Page) => page.evaluate(() => document.querySelector('.ag-grid-viewport')!.scrollTop);

/** Sampled in one evaluation, so the row under the pointer and the hovered rows describe the same frame. */
const hoverState = (page: Page, x: number, y: number) =>
    page.evaluate(
        ({ x, y }) => ({
            rowUnderPointer: document.elementFromPoint(x, y)?.closest('.ag-row')?.getAttribute('row-index') ?? null,
            hoveredRows: Array.from(document.querySelectorAll('.ag-row-hover'), (row) => row.getAttribute('row-index')),
            tooltips: Array.from(document.querySelectorAll('.ag-tooltip'), (tooltip) => tooltip.textContent?.trim()),
        }),
        { x, y }
    );

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
        // queued wheel scrolling can still be running: wait until two reads in a row agree
        let previousTop = -1;
        await expect
            .poll(async () => {
                const top = await scrollTop(page);
                const settled = top === previousTop && top > 400;
                previousTop = top;
                return settled;
            })
            .toBe(true);

        await expect(async () => {
            const { rowUnderPointer, hoveredRows, tooltips } = await hoverState(page, x, y);
            expect(hoveredRows).toEqual([rowUnderPointer]);
            // a tooltip may still be showing, but only the one for the cell under the pointer
            expect(tooltips.length).toBeLessThanOrEqual(1);
            expect(tooltips.filter((text) => text !== `Project ${rowUnderPointer}`)).toEqual([]);
        }).toPass({ timeout: 5000 });
    });
}

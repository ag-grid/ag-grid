import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

declare global {
    interface Window {
        scrollTestRtl: boolean;
        intervalsCreated: number;
    }
}

const trackIntervals = (page: Page) =>
    page.evaluate(() => {
        const browserWindow: Window = window;
        const setInterval = browserWindow.setInterval.bind(browserWindow);
        browserWindow.intervalsCreated = 0;
        browserWindow.setInterval = (handler, timeout, ...args) => {
            ++browserWindow.intervalsCreated;
            return setInterval(handler, timeout, ...args);
        };
    });

const intervalsCreated = (page: Page) => page.evaluate(() => window.intervalsCreated);

/** The grid answers a resize in observer callbacks throttled to the next frame, so two frames see it all. */
const afterTwoFrames = (page: Page) =>
    page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );

/** 0 where the browser only overlays its scrollbars, as Firefox does on macOS whatever the page's CSS. */
const nativeScrollbarWidth = (page: Page) =>
    page.evaluate(() => {
        const probe = document.createElement('div');
        probe.style.cssText = 'position: absolute; overflow: scroll; width: 100px; height: 100px';
        document.body.appendChild(probe);
        const width = probe.offsetWidth - probe.clientWidth;
        probe.remove();
        return width;
    });

const positions = (page: Page) =>
    page.evaluate(() => {
        const viewport = document.querySelector('.ag-grid-viewport')!;
        const horizontal = document.querySelector('.ag-body-horizontal-scroll-viewport')!;
        const vertical = document.querySelector('.ag-body-vertical-scroll-viewport')!;
        return {
            left: Math.abs(viewport.scrollLeft),
            top: viewport.scrollTop,
            horizontalDifference: horizontal.scrollLeft - viewport.scrollLeft,
            verticalDifference: vertical.scrollTop - viewport.scrollTop,
        };
    });

for (const overlay of [false, true]) {
    for (const enableRtl of [false, true]) {
        test.describe(`scrollbar synchronisation (overlay=${overlay}, rtl=${enableRtl})`, () => {
            test.beforeEach(async ({ page }) => {
                // setContent preserves window properties and does not run navigation init scripts.
                await page.evaluate((rtl) => (window.scrollTestRtl = rtl), enableRtl);
                if (overlay) {
                    // Apple overlay scrollbars sit hidden at rest, so their position is written while invisible
                    await page.evaluate(() => Object.defineProperty(navigator, 'platform', { value: 'MacIntel' }));
                }
                await mountGrid(page, {
                    width: 700,
                    height: 500,
                    css: overlay
                        ? '* { scrollbar-width: none; } ::-webkit-scrollbar { width: 0; height: 0; }'
                        : '::-webkit-scrollbar { width: 15px; height: 15px; }',
                    options: () => ({
                        enableRtl: window.scrollTestRtl,
                        rowHeight: 40,
                        columnDefs: Array.from({ length: 30 }, (_, i) => ({ field: `c${i}`, width: 200 })),
                        rowData: Array.from({ length: 50 }, (_, r) => ({ c0: `row ${r}` })),
                    }),
                });
                expect(await page.evaluate(() => window.gridApi.getGridOption('enableRtl'))).toBe(enableRtl);
                await expect
                    .poll(() => page.locator('.ag-body-vertical-scroll-viewport').evaluate((el) => el.clientHeight))
                    .toBeGreaterThan(0);
                await expect
                    .poll(() =>
                        page
                            .locator('.ag-body-horizontal-scroll-viewport')
                            .evaluate((el) => el.getBoundingClientRect().height)
                    )
                    .toBeGreaterThan(0);
                if (overlay) {
                    await expect(page.locator('.ag-body-vertical-scroll')).toHaveClass(
                        /ag-apple-scrollbar ag-scrollbar-invisible/
                    );
                } else if (await nativeScrollbarWidth(page)) {
                    await expect(page.locator('.ag-body-vertical-scroll')).not.toHaveClass(/ag-scrollbar-invisible/);
                } else {
                    await expect(page.locator('.ag-body-vertical-scroll')).toHaveClass(/ag-scrollbar-invisible/);
                }
                await trackIntervals(page);
            });

            test('hidden grids do not poll and synchronise the current position when shown again', async ({ page }) => {
                const grid = page.locator('#myGrid');
                for (let cycle = 0; cycle < 2; ++cycle) {
                    await page.evaluate(() => {
                        window.gridApi.ensureIndexVisible(20, 'top');
                        window.gridApi.ensureColumnVisible('c15', 'start');
                    });
                    await expect
                        .poll(() => positions(page))
                        .toMatchObject({
                            top: 800,
                            horizontalDifference: 0,
                            verticalDifference: 0,
                        });

                    await grid.evaluate((el) => (el.style.display = 'none'));
                    await afterTwoFrames(page);
                    expect(await intervalsCreated(page)).toBe(0);

                    await grid.evaluate((el) => (el.style.display = ''));
                    await expect
                        .poll(() => positions(page))
                        .toMatchObject({
                            top: 800,
                            horizontalDifference: 0,
                            verticalDifference: 0,
                        });
                    await page.evaluate(() => {
                        window.gridApi.ensureIndexVisible(30, 'top');
                        window.gridApi.ensureColumnVisible('c20', 'start');
                    });
                    await expect
                        .poll(() => positions(page))
                        .toMatchObject({
                            top: 1200,
                            horizontalDifference: 0,
                            verticalDifference: 0,
                        });
                }
                expect(await intervalsCreated(page)).toBe(0);
            });

            test('updates while invisible use the latest position, without polling', async ({ page }) => {
                const grid = page.locator('#myGrid');
                await grid.evaluate((el) => (el.style.visibility = 'hidden'));
                for (const index of [10, 20, 30]) {
                    await page.evaluate((row) => window.gridApi.ensureIndexVisible(row, 'top'), index);
                    await expect.poll(() => positions(page)).toMatchObject({ top: index * 40 });
                }
                expect(await intervalsCreated(page)).toBe(0);
                await grid.evaluate((el) => (el.style.visibility = ''));
                await expect.poll(() => positions(page)).toMatchObject({ top: 1200, verticalDifference: 0 });
            });
        });
    }
}

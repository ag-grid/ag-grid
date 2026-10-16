import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

declare global {
    interface Window {
        scrollTestRtl: boolean;
        scrollIntervals: { callbacks: number; live: Set<number> };
        scrollTestVerticalEvents: number[];
    }
}

const trackIntervals = (page: Page) =>
    page.evaluate(() => {
        const browserWindow: Window = window;
        const setInterval = browserWindow.setInterval.bind(browserWindow);
        const clearInterval = browserWindow.clearInterval.bind(browserWindow);
        const intervals = (window.scrollIntervals = { callbacks: 0, live: new Set<number>() });
        browserWindow.setInterval = (handler, timeout, ...args) => {
            const callback =
                typeof handler === 'function'
                    ? () => {
                          ++intervals.callbacks;
                          handler.apply(browserWindow, args);
                      }
                    : handler;
            const id = setInterval(callback, timeout);
            intervals.live.add(id);
            return id;
        };
        browserWindow.clearInterval = (id) => {
            if (id != null) {
                intervals.live.delete(id);
            }
            clearInterval(id);
        };
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
    test.describe(`debounced vertical scrollbar (overlay=${overlay})`, () => {
        test.beforeEach(async ({ page }) => {
            await mountGrid(page, {
                width: 700,
                height: 500,
                css: overlay
                    ? '* { scrollbar-width: none; } ::-webkit-scrollbar { width: 0; height: 0; }'
                    : '::-webkit-scrollbar { width: 15px; height: 15px; }',
                options: () => ({
                    debounceVerticalScrollbar: true,
                    rowHeight: 40,
                    columnDefs: Array.from({ length: 10 }, (_, i) => ({ field: `c${i}`, width: 200 })),
                    rowData: Array.from({ length: 100 }, () => ({})),
                    pinnedBottomRowData: [{}],
                }),
            });
            await expect(page.locator('.ag-row-pinned')).toHaveCount(1);
            await page.evaluate(
                () =>
                    new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
            );
        });

        for (const update of ['pinned rows', 'viewport resize', 'row height']) {
            test(`${update} preserves a pending scrollbar drag`, async ({ page }) => {
                await page.evaluate(
                    (change) =>
                        new Promise<void>((resolve) => {
                            const scrollbar = document.querySelector('.ag-body-vertical-scroll-viewport')!;
                            scrollbar.addEventListener(
                                'scroll',
                                () => {
                                    if (change === 'pinned rows') {
                                        window.gridApi.setGridOption('pinnedBottomRowData', [{}, {}]);
                                    } else if (change === 'viewport resize') {
                                        document.querySelector<HTMLElement>('#myGrid')!.style.height = '400px';
                                    } else {
                                        window.gridApi.setGridOption('rowHeight', 50);
                                    }
                                    resolve();
                                },
                                { once: true }
                            );
                            scrollbar.scrollTop = 900;
                        }),
                    update
                );
                await expect.poll(() => positions(page)).toMatchObject({ top: 900, verticalDifference: 0 });
            });
        }

        test('a scrollbar drag is processed after viewport ownership expires', async ({ page }) => {
            await page.evaluate(
                () =>
                    new Promise<void>((resolve) => {
                        const api = window.gridApi;
                        const onScroll = () => {
                            api.removeEventListener('bodyScroll', onScroll);
                            // Input arrives inside the 150 ms ownership window, but its debounce finishes outside it.
                            setTimeout(() => {
                                document.querySelector('.ag-body-vertical-scroll-viewport')!.scrollTop = 900;
                                resolve();
                            }, 90);
                        };
                        api.addEventListener('bodyScroll', onScroll);
                        document.querySelector('.ag-grid-viewport')!.scrollTop = 400;
                    })
            );
            await expect.poll(() => positions(page)).toMatchObject({ top: 900, verticalDifference: 0 });
        });

        test('a height-sync echo does not interrupt a viewport scroll', async ({ page }) => {
            await page.evaluate(
                () =>
                    new Promise<void>((resolve) => {
                        const viewport = document.querySelector('.ag-grid-viewport')!;
                        document.querySelector('.ag-body-vertical-scroll-viewport')!.addEventListener(
                            'scroll',
                            () => {
                                viewport.scrollTop = 600;
                                resolve();
                            },
                            { once: true }
                        );
                        viewport.scrollTop = 300;
                        window.gridApi.setGridOption('pinnedBottomRowData', [{}, {}]);
                    })
            );
            await expect.poll(() => positions(page)).toMatchObject({ top: 600, verticalDifference: 0 });
        });

        test('matching scroll positions still update rows and events', async ({ page }) => {
            await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
            await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
            await page.evaluate(() => {
                window.scrollTestVerticalEvents = [];
                window.gridApi.addEventListener('bodyScroll', ({ direction, top }) => {
                    if (direction === 'vertical') {
                        window.scrollTestVerticalEvents.push(top);
                    }
                });
            });
            const scroll = (selector: string, top: number) =>
                page.locator(selector).evaluate(
                    (el, scrollTop) =>
                        new Promise<void>((resolve) => {
                            el.addEventListener('scroll', () => resolve(), { once: true });
                            el.scrollTop = scrollTop;
                        }),
                    top
                );

            await scroll('.ag-body-vertical-scroll-viewport', 900);
            await page.clock.runFor(120);
            expect(await page.evaluate(() => window.scrollTestVerticalEvents)).toEqual([900]);

            // The viewport debounce finishes inside scrollbar ownership; the matching scrollbar event finishes after it.
            await scroll('.ag-grid-viewport', 2000);
            await page.clock.runFor(50);
            await scroll('.ag-body-vertical-scroll-viewport', 2000);
            await page.clock.runFor(300);

            expect(await page.evaluate(() => window.scrollTestVerticalEvents)).toEqual([900, 2000]);
            await expect(page.locator('.ag-row[row-index="50"] [col-id="c0"]')).toBeInViewport();
            expect(await positions(page)).toMatchObject({ top: 2000, verticalDifference: 0 });
        });

        test('hiding and revealing a debounced grid preserves its position', async ({ page }) => {
            await page.evaluate(
                () =>
                    new Promise<void>((resolve) => {
                        const api = window.gridApi;
                        const onScrollEnd = () => {
                            api.removeEventListener('bodyScrollEnd', onScrollEnd);
                            resolve();
                        };
                        api.addEventListener('bodyScrollEnd', onScrollEnd);
                        api.ensureIndexVisible(20, 'top');
                    })
            );
            const grid = page.locator('#myGrid');
            await grid.evaluate((el) => (el.style.display = 'none'));
            // Observe any scroll events and debounced callbacks caused by hiding the scroll boxes.
            await page.waitForTimeout(250);
            await grid.evaluate((el) => (el.style.display = ''));
            await expect.poll(() => positions(page)).toMatchObject({ top: 800, verticalDifference: 0 });
        });

        test('a pending drag is clamped when the row count shrinks', async ({ page }) => {
            await page.evaluate(
                () =>
                    new Promise<void>((resolve) => {
                        const scrollbar = document.querySelector('.ag-body-vertical-scroll-viewport')!;
                        scrollbar.addEventListener(
                            'scroll',
                            () => {
                                window.gridApi.setGridOption(
                                    'rowData',
                                    Array.from({ length: 20 }, () => ({}))
                                );
                                resolve();
                            },
                            { once: true }
                        );
                        scrollbar.scrollTop = 900;
                    })
            );
            await expect
                .poll(() =>
                    page.locator('.ag-grid-viewport').evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop)
                )
                .toBe(0);
            await expect.poll(() => positions(page)).toMatchObject({ verticalDifference: 0 });
        });
    });
}

for (const overlay of [false, true]) {
    for (const enableRtl of [false, true]) {
        test.describe(`scrollbar synchronisation (overlay=${overlay}, rtl=${enableRtl})`, () => {
            test.beforeEach(async ({ page }) => {
                // setContent preserves window properties and does not run navigation init scripts.
                await page.evaluate((rtl) => (window.scrollTestRtl = rtl), enableRtl);
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
                    await expect(page.locator('.ag-body-vertical-scroll')).toHaveClass(/ag-scrollbar-invisible/);
                } else {
                    await expect(page.locator('.ag-body-vertical-scroll')).not.toHaveClass(/ag-scrollbar-invisible/);
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
                    // Hold hidden long enough for any deferred visibility polling to start ticking.
                    await page.waitForTimeout(250);
                    expect(await page.evaluate(() => window.scrollIntervals.live.size)).toBe(0);
                    const callbacks = await page.evaluate(() => window.scrollIntervals.callbacks);
                    await page.waitForTimeout(150);
                    expect(await page.evaluate(() => window.scrollIntervals.callbacks)).toBe(callbacks);

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
                expect(await page.evaluate(() => window.scrollIntervals.live.size)).toBe(0);
            });

            test('showing the horizontal scrollbar synchronises its latest position after layout', async ({ page }) => {
                const horizontal = page.locator('.ag-body-horizontal-scroll-viewport');
                await page.evaluate(() => window.gridApi.setGridOption('suppressHorizontalScroll', true));
                await expect.poll(() => horizontal.evaluate((el) => el.getBoundingClientRect().height)).toBe(0);
                await page.evaluate(
                    () =>
                        new Promise<void>((resolve) => {
                            const api = window.gridApi;
                            const onScrollEnd = () => {
                                api.removeEventListener('bodyScrollEnd', onScrollEnd);
                                resolve();
                            };
                            api.addEventListener('bodyScrollEnd', onScrollEnd);
                            api.ensureColumnVisible('c10', 'start');
                            api.setGridOption('suppressHorizontalScroll', false);
                            api.ensureColumnVisible('c20', 'start');
                        })
                );
                await expect
                    .poll(() => horizontal.evaluate((el) => el.getBoundingClientRect().height))
                    .toBeGreaterThan(0);
                await expect.poll(() => positions(page)).toMatchObject({ left: 4000, horizontalDifference: 0 });

                await horizontal.evaluate((el) => (el.scrollLeft = window.scrollTestRtl ? -1e6 : 1e6));
                await expect.poll(() => positions(page)).toMatchObject({ horizontalDifference: 0 });
                expect(await horizontal.evaluate((el) => Math.abs(el.scrollLeft))).toBe(
                    await horizontal.evaluate((el) => el.scrollWidth - el.clientWidth)
                );
            });

            test('horizontal scrolling with no vertical overflow does not start polling', async ({ page }) => {
                await page.evaluate(() =>
                    window.gridApi.setGridOption(
                        'rowData',
                        Array.from({ length: 5 }, () => ({}))
                    )
                );
                await expect(page.locator('.ag-body-vertical-scroll')).toHaveClass(/ag-hidden/);
                await page.evaluate(async () => {
                    const viewport = document.querySelector('.ag-grid-viewport')!;
                    const sign = window.scrollTestRtl ? -1 : 1;
                    for (let i = 1; i <= 200; ++i) {
                        viewport.scrollLeft = sign * i * 20;
                        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
                    }
                });
                await expect
                    .poll(() => positions(page))
                    .toEqual({
                        left: 4000,
                        top: 0,
                        horizontalDifference: 0,
                        verticalDifference: 0,
                    });
                expect(await page.evaluate(() => window.scrollIntervals.live.size)).toBe(0);
            });

            test('updates while invisible use the latest position and destruction leaves no polling', async ({
                page,
            }) => {
                const grid = page.locator('#myGrid');
                await grid.evaluate((el) => (el.style.visibility = 'hidden'));
                for (const index of [10, 20, 30]) {
                    await page.evaluate((row) => window.gridApi.ensureIndexVisible(row, 'top'), index);
                    await expect.poll(() => positions(page)).toMatchObject({ top: index * 40 });
                }
                await page.waitForTimeout(250);
                expect(await page.evaluate(() => window.scrollIntervals.live.size)).toBe(0);
                await grid.evaluate((el) => (el.style.visibility = ''));
                await expect.poll(() => positions(page)).toMatchObject({ top: 1200, verticalDifference: 0 });

                await page.evaluate(() => {
                    window.gridApi.setGridOption('suppressHorizontalScroll', true);
                    window.gridApi.setGridOption('suppressHorizontalScroll', false);
                    window.gridApi.destroy();
                });
                await expect(page.locator('.ag-root-wrapper')).toHaveCount(0);
                const callbacks = await page.evaluate(() => window.scrollIntervals.callbacks);
                await page.waitForTimeout(250);
                expect(await page.evaluate(() => window.scrollIntervals.callbacks)).toBe(callbacks);
                expect(await page.evaluate(() => window.scrollIntervals.live.size)).toBe(0);
            });
        });
    }
}

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { GetDetailRowDataParams } from 'ag-grid-community';

import { mountGrid } from '../src/mountGrid';

test.use({ hasTouch: true });
test.skip(({ browserName }) => browserName === 'firefox', 'Firefox scrollbar coverage is deferred.');

declare global {
    interface Window {
        gestureTestOptions: {
            enableRtl: boolean;
            debounceVerticalScrollbar: boolean;
            scrollGestureMode: 'native' | 'axisLocked';
        };
        gestureTarget: HTMLElement;
        gestureCellRef: WeakRef<HTMLElement>;
        detailGestureAutoHeight: boolean;
    }
}

async function mount(page: Page, enableRtl = false, debounceVerticalScrollbar = false, native = false) {
    const options: Window['gestureTestOptions'] = {
        enableRtl,
        debounceVerticalScrollbar,
        scrollGestureMode: native ? 'native' : 'axisLocked',
    };
    await page.evaluate((options) => {
        window.gestureTestOptions = options;
    }, options);
    await mountGrid(page, {
        width: 700,
        height: 500,
        options: () => ({
            ...window.gestureTestOptions,
            rowHeight: 40,
            rowBuffer: 0,
            columnDefs: Array.from({ length: 10 }, (_, i) => ({ field: `c${i}`, width: 200 })),
            rowData: Array.from({ length: 200 }, (_, r) =>
                Object.fromEntries(Array.from({ length: 10 }, (_, c) => [`c${c}`, `r${r} c${c}`]))
            ),
            pinnedTopRowData: [{}],
            pinnedBottomRowData: [{}],
        }),
    });
    await expect(page.locator('.ag-grid-scrolling-rows .ag-row[row-index="0"]')).toBeVisible();
    await page.evaluate(
        () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    );
    expect(await page.evaluate(() => window.gridApi.getGridOption('enableRtl'))).toBe(enableRtl);
}

const positions = (page: Page) =>
    page.evaluate(() => {
        const viewport = document.querySelector('.ag-grid-viewport')!;
        return {
            left: Math.abs(viewport.scrollLeft),
            top: viewport.scrollTop,
            horizontalDifference:
                document.querySelector('.ag-body-horizontal-scroll-viewport')!.scrollLeft - viewport.scrollLeft,
            verticalDifference:
                document.querySelector('.ag-body-vertical-scroll-viewport')!.scrollTop - viewport.scrollTop,
        };
    });

async function pauseClock(page: Page) {
    await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
    await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
}

async function mountChildWindow(page: Page) {
    await page.evaluate(() => {
        const columnDefs = window.gridApi.getGridOption('columnDefs');
        const rowData = window.gridApi.getGridOption('rowData');
        window.gridApi.destroy();
        const iframe = document.createElement('iframe');
        iframe.id = 'child-window';
        iframe.style.cssText = 'width:750px;height:550px;border:0';
        document.body.replaceChildren(iframe);
        const child = iframe.contentWindow!;
        const grid = child.document.createElement('div');
        grid.style.cssText = 'width:700px;height:500px';
        child.document.body.appendChild(grid);
        window.gridApi = (window as any).agGrid.createGrid(grid, {
            columnDefs,
            rowData,
            scrollGestureMode: 'axisLocked',
            themeStyleContainer: child.document.head,
        });
    });
    const child = page.frameLocator('#child-window');
    await expect(child.locator('.ag-row[row-index="0"]')).toBeVisible();
    await expect
        .poll(() =>
            child.locator('.ag-grid-viewport').evaluate((element) => element.scrollHeight - element.clientHeight)
        )
        .toBeGreaterThan(300);
    return child;
}

async function touch(page: Page, type: string, x: number, y: number) {
    return page.evaluate(
        async ({ type, x, y }) => {
            const target = window.gestureTarget;
            // Desktop WebKit has no constructible Touch. These synthetic events exercise layout and lifecycle;
            // the Chromium touch-injection cases below also exercise native gesture delivery.
            const point = { identifier: 1, target, clientX: x, clientY: y };
            const event = Object.assign(new Event(type, { bubbles: true, cancelable: true }), {
                touches: type === 'touchend' || type === 'touchcancel' ? [] : [point],
                changedTouches: [point],
            });
            const viewport = document.querySelector('.ag-grid-viewport')!;
            const { scrollTop, scrollLeft } = viewport;
            let onScroll: () => void;
            const scrolled = new Promise<void>((resolve) => {
                onScroll = resolve;
                viewport.addEventListener('scroll', onScroll, { once: true });
            });
            target.dispatchEvent(event);
            if (viewport.scrollTop !== scrollTop || viewport.scrollLeft !== scrollLeft) {
                await scrolled;
            } else {
                viewport.removeEventListener('scroll', onScroll!);
            }
            return event.defaultPrevented;
        },
        { type, x, y }
    );
}

test('native mode still uses browser wheel scrolling', async ({ page }) => {
    await mount(page, false, false, true);
    await page.locator('.ag-grid-scrolling-rows .ag-cell[col-id="c1"]').first().hover();
    await page.mouse.wheel(0, 100);
    await expect.poll(() => positions(page)).toMatchObject({ top: 100, verticalDifference: 0 });
});

for (const rtl of [false, true]) {
    test.describe(`axis-locked gestures (rtl=${rtl})`, () => {
        test.beforeEach(async ({ page }) => {
            await mount(page, rtl);
        });

        test('runtime mode changes preserve position and restore native diagonal scrolling', async ({ page }) => {
            const viewport = page.locator('.ag-grid-viewport');
            const originalViewport = await viewport.elementHandle();
            const setMode = (mode: 'native' | 'axisLocked') =>
                page.evaluate(async (mode) => {
                    window.gridApi.setGridOption('scrollGestureMode', mode);
                    // Let WebKit commit the listener change before injecting native wheel input.
                    await new Promise<void>((resolve) =>
                        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
                    );
                }, mode);
            await viewport.hover();
            await page.mouse.wheel(rtl ? -120 : 120, 5);
            await expect.poll(() => positions(page)).toMatchObject({ left: 120, top: 0 });

            await setMode('native');
            expect(await positions(page)).toMatchObject({ left: 120, top: 0 });
            await page.mouse.wheel(rtl ? -40 : 40, 120);
            await expect.poll(() => positions(page)).toMatchObject({ left: 160, top: 120 });

            await setMode('axisLocked');
            expect(await positions(page)).toMatchObject({ left: 160, top: 120 });
            await page.mouse.wheel(rtl ? -5 : 5, 120);
            await expect.poll(() => positions(page)).toMatchObject({ left: 160, top: 240 });
            await expect.poll(() => positions(page)).toMatchObject({ horizontalDifference: 0, verticalDifference: 0 });
            expect(await originalViewport!.evaluate((element) => element.isConnected)).toBe(true);
            await originalViewport!.dispose();
        });

        test('native wheel input keeps its axis, then a new gesture can change direction', async ({ page }) => {
            await pauseClock(page);
            await page.locator('.ag-grid-scrolling-rows .ag-cell[col-id="c1"]').first().hover();
            await page.mouse.wheel(rtl ? -5 : 5, 160);
            await expect.poll(() => positions(page)).toMatchObject({ left: 0, top: 160 });
            await page.clock.runFor(32);
            await page.mouse.wheel(rtl ? -80 : 80, 10);
            await expect.poll(() => positions(page)).toMatchObject({ left: 0, top: 170 });
            await page.clock.runFor(250);
            await page.mouse.wheel(rtl ? -220 : 220, 5);
            await expect.poll(() => positions(page)).toMatchObject({ left: 220, top: 170 });
            await page.clock.runFor(200);
            await expect.poll(() => positions(page)).toMatchObject({ horizontalDifference: 0, verticalDifference: 0 });
            await expect(page.locator('.ag-grid-scrolling-rows .ag-row[row-index="0"]')).toHaveCount(0);
            await expect(page.locator('.ag-grid-scrolling-rows .ag-row[row-index="5"] [col-id="c2"]')).toHaveText(
                'r5 c2'
            );

            // API movement is independent of the previous gesture's axis.
            await page.evaluate(
                () =>
                    new Promise<void>((resolve) => {
                        document
                            .querySelector('.ag-grid-viewport')!
                            .addEventListener('scroll', () => resolve(), { once: true });
                        window.gridApi.ensureIndexVisible(100, 'top');
                    })
            );
            await page.clock.runFor(200);
            await expect.poll(() => positions(page)).toMatchObject({ top: 4000, verticalDifference: 0 });
        });

        for (const pinned of ['top', 'bottom']) {
            test(`wheel input over ${pinned} pinned rows uses the viewport axis lock`, async ({ page }) => {
                await pauseClock(page);
                const cell = page.locator(`.ag-grid-pinned-${pinned}-rows .ag-row-pinned [col-id="c1"]`);
                await cell.hover();
                await page.mouse.wheel(rtl ? -5 : 5, 120);
                await expect.poll(() => positions(page)).toMatchObject({ left: 0, top: 120 });
                await page.clock.runFor(250);
                await cell.hover();
                await page.mouse.wheel(rtl ? -120 : 120, 5);
                await expect.poll(() => positions(page)).toMatchObject({ left: 120, top: 120 });
                await page.clock.runFor(200);
                await expect
                    .poll(() => positions(page))
                    .toMatchObject({ horizontalDifference: 0, verticalDifference: 0 });
            });
        }

        test('a stationary pointer can start a vertical gesture after horizontal virtualisation', async ({ page }) => {
            const startingCell = page.locator('.ag-grid-scrolling-rows .ag-cell[col-id="c1"]').first();
            await startingCell.hover();
            await page.mouse.wheel(rtl ? -1000 : 1000, 0);
            await expect.poll(() => positions(page)).toMatchObject({ left: 1000, top: 0 });
            await expect(startingCell).toHaveCount(0);
            // Use real time here: the browser's wheel target latching is independent of the page clock.
            await page.evaluate(() => new Promise<void>((resolve) => setTimeout(resolve, 1000)));
            await page.mouse.wheel(0, 160);
            await expect.poll(() => positions(page)).toMatchObject({ left: 1000, top: 160, verticalDifference: 0 });
        });
    });
}

for (const debounce of [false, true]) {
    test(`touch continues after its target is detached and synchronises momentum (debounce=${debounce})`, async ({
        page,
    }) => {
        await mount(page, false, debounce);
        await pauseClock(page);
        await page.evaluate(() => {
            window.gestureTarget = document.querySelector<HTMLElement>(
                '.ag-grid-scrolling-rows .ag-cell[col-id="c1"]'
            )!;
        });
        await touch(page, 'touchstart', 300, 400);
        await page.clock.runFor(16);
        expect(await touch(page, 'touchmove', 295, 240)).toBe(true);
        // Let the native scroll event's optional 100 ms debounce and rendering frame complete.
        await page.clock.runFor(150);
        await expect.poll(() => page.evaluate(() => window.gestureTarget.isConnected)).toBe(false);
        expect(await touch(page, 'touchmove', 220, 200)).toBe(true);
        await touch(page, 'touchend', 220, 200);
        await page.clock.runFor(100);
        expect((await positions(page)).top).toBeGreaterThan(200);
        expect((await positions(page)).left).toBe(0);
        await page.clock.runFor(3000);
        await expect
            .poll(async () => {
                await page.clock.runFor(200);
                return (await positions(page)).verticalDifference;
            })
            .toBe(0);
        const stopped = await positions(page);
        await page.clock.runFor(500);
        expect(await positions(page)).toEqual(stopped);
    });
}

test('a new outward wheel gesture scrolls the surrounding page', async ({ page }) => {
    await mount(page);
    await page.addStyleTag({ content: 'body { padding-top: 300px; height: 2000px; }' });
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.locator('.ag-grid-scrolling-rows .ag-cell[col-id="c1"]').first().hover();
    await page.mouse.wheel(0, -100);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(300);
    expect((await positions(page)).top).toBe(0);
});

test('an outward touch gesture scrolls the surrounding page', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Native touch injection uses the Chromium DevTools Protocol.');
    await mount(page);
    await page.addStyleTag({ content: 'body { padding-top: 300px; height: 2000px; }' });
    await page.evaluate(() => window.scrollTo(0, 300));
    const session = await page.context().newCDPSession(page);
    const point = (y: number) => [{ x: 350, y, id: 1 }];
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(250) });
    for (const y of [251, 280, 320]) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: point(y) });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(300);
    expect((await positions(page)).top).toBe(0);
    await session.detach();
});

test('a locked wheel gesture continues when nested content moves under the pointer', async ({ page }) => {
    await mount(page);
    await pauseClock(page);
    await page.locator('.ag-grid-scrolling-rows .ag-row[row-index="1"] .ag-cell[col-id="c1"]').evaluate((cell) => {
        const scroller = document.createElement('div');
        scroller.id = 'nested-scroller';
        scroller.style.cssText = 'height: 35px; overflow: auto;';
        scroller.innerHTML = '<div style="height: 500px">Nested content</div>';
        cell.replaceChildren(scroller);
    });
    const startingCell = page.locator('.ag-grid-scrolling-rows .ag-row[row-index="0"] .ag-cell[col-id="c1"]');
    const box = (await startingCell.boundingBox())!;
    const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await page.mouse.move(point.x, point.y);
    await page.mouse.wheel(0, 40);
    await expect.poll(() => positions(page)).toMatchObject({ top: 40, left: 0 });
    await page.clock.runFor(32);
    expect(
        await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest('#nested-scroller'), point)
    ).toBe(true);

    await page.mouse.wheel(60, 10);
    await expect.poll(() => positions(page)).toMatchObject({ top: 50, left: 0 });
    expect(await page.locator('#nested-scroller').evaluate((el) => el.scrollTop)).toBe(0);

    await page.clock.runFor(250);
    await page.mouse.wheel(0, 100);
    await expect.poll(() => page.locator('#nested-scroller').evaluate((el) => el.scrollTop)).toBe(100);
    expect((await positions(page)).top).toBe(50);
});

for (const autoHeight of [false, true]) {
    test(`master gestures pass through a non-scrolling detail grid (autoHeight=${autoHeight})`, async ({ page }) => {
        await page.evaluate((autoHeight) => {
            window.detailGestureAutoHeight = autoHeight;
        }, autoHeight);
        await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [
                    { field: 'name', cellRenderer: 'agGroupCellRenderer' },
                    { field: 'account' },
                    { field: 'calls' },
                    { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" },
                ],
                defaultColDef: { width: 250 },
                masterDetail: true,
                scrollGestureMode: 'axisLocked',
                detailRowAutoHeight: window.detailGestureAutoHeight,
                detailCellRendererParams: {
                    detailGridOptions: {
                        rowSelection: { mode: 'multiRow', headerCheckbox: false },
                        pagination: !window.detailGestureAutoHeight,
                        paginationAutoPageSize: true,
                        columnDefs: [
                            { field: 'callId' },
                            { field: 'direction' },
                            { field: 'number', minWidth: 150 },
                            { field: 'duration', valueFormatter: "x.toLocaleString() + 's'" },
                            { field: 'switchCode', minWidth: 150 },
                        ],
                        defaultColDef: { flex: 1 },
                    },
                    getDetailRowData: (params: GetDetailRowDataParams) =>
                        params.successCallback(params.data.callRecords),
                },
                groupDefaultExpanded: -1,
                rowData: Array.from({ length: 6 }, (_, i) => ({
                    name: `Account ${i}`,
                    account: i,
                    calls: 20,
                    minutes: 60,
                    callRecords: Array.from({ length: 20 }, (_, callId) => ({
                        callId,
                        direction: 'Out',
                        number: '0123456789',
                        duration: 180,
                        switchCode: 'A',
                    })),
                })),
            }),
        });
        const detail = page.locator('.ag-details-grid').first();
        const detailViewport = detail.locator('.ag-grid-viewport');
        const detailCell = detail.locator('.ag-cell[col-id="callId"]').first();
        await expect(detailCell).toBeVisible();
        await expect
            .poll(() =>
                detailViewport.evaluate((el) => ({
                    x: el.scrollWidth > el.clientWidth,
                    y: el.scrollHeight > el.clientHeight,
                }))
            )
            .toEqual({ x: false, y: false });
        await pauseClock(page);

        await detailCell.hover();
        await page.mouse.wheel(60, 120);
        await expect.poll(() => positions(page)).toMatchObject({ top: 120, left: 0 });
        expect(await detailViewport.evaluate((el) => ({ x: el.scrollLeft, y: el.scrollTop }))).toEqual({ x: 0, y: 0 });

        await page.evaluate(() => window.gridApi.ensureIndexVisible(0, 'top'));
        await expect.poll(() => positions(page)).toMatchObject({ top: 0, left: 0 });
        await detailCell.evaluate((el) => {
            window.gestureTarget = el as HTMLElement;
        });
        await touch(page, 'touchstart', 300, 400);
        expect(await touch(page, 'touchmove', 295, 360)).toBe(true);
        expect(await positions(page)).toMatchObject({ top: 40, left: 0 });
        await touch(page, 'touchcancel', 295, 360);

        await page.evaluate(() => window.gridApi.ensureIndexVisible(0, 'top'));
        await expect.poll(() => positions(page)).toMatchObject({ top: 0, left: 0 });
        const masterCell = page.locator('.ag-cell[col-id="name"]').first();
        const box = (await masterCell.boundingBox())!;
        const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        await page.mouse.move(point.x, point.y);
        await page.mouse.wheel(0, 70);
        await expect.poll(() => positions(page)).toMatchObject({ top: 70, left: 0 });
        expect(
            await page.evaluate(({ x, y }) => !!document.elementFromPoint(x, y)?.closest('.ag-details-grid'), point)
        ).toBe(true);
        await page.mouse.wheel(60, 10);
        await expect.poll(() => positions(page)).toMatchObject({ top: 80, left: 0 });

        await page.evaluate((autoHeight) => {
            const detailApi = window.gridApi.getDetailGridInfo('detail_0')!.api!;
            if (autoHeight) {
                detailApi.setGridOption('columnDefs', [{ field: 'callId', width: 1200, flex: 0 }]);
            } else {
                detailApi.setGridOption('pagination', false);
            }
            window.gridApi.ensureIndexVisible(0, 'top');
        }, autoHeight);
        await expect
            .poll(() =>
                detailViewport.evaluate(
                    (el, horizontal) =>
                        horizontal ? el.scrollWidth > el.clientWidth : el.scrollHeight > el.clientHeight,
                    autoHeight
                )
            )
            .toBe(true);
        await page.clock.runFor(250);
        // Hovering a wide cell with Playwright would scroll its ancestors to centre it.
        const detailBox = (await detailCell.boundingBox())!;
        await page.mouse.move(detailBox.x + 10, detailBox.y + detailBox.height / 2);
        expect(await positions(page)).toMatchObject({ top: 0, left: 0 });
        const detailPosition = () =>
            detailViewport.evaluate((el, horizontal) => (horizontal ? el.scrollLeft : el.scrollTop), autoHeight);
        const before = await detailPosition();
        await page.mouse.wheel(autoHeight ? 80 : 0, autoHeight ? 0 : 80);
        await expect.poll(detailPosition).toBe(before + 80);
        expect(await positions(page)).toMatchObject({ top: 0, left: 0 });
    });
}

test('an expired wheel gesture does not retain a virtualised cell', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Explicit garbage collection uses the Chromium DevTools Protocol.');
    await mount(page);
    await pauseClock(page);
    const cell = page.locator('.ag-grid-scrolling-rows .ag-row[row-index="0"] [col-id="c1"]');
    await cell.evaluate(async (element) => {
        window.gestureCellRef = new WeakRef(element as HTMLElement);
        const viewport = document.querySelector('.ag-grid-viewport')!;
        const scrolled = new Promise<void>((resolve) =>
            viewport.addEventListener('scroll', () => resolve(), { once: true })
        );
        element.dispatchEvent(new WheelEvent('wheel', { deltaY: 800, bubbles: true, cancelable: true }));
        await scrolled;
    });
    await page.clock.runFor(1000);
    await expect(cell).toHaveCount(0);
    const session = await page.context().newCDPSession(page);
    await expect
        .poll(async () => {
            await session.send('HeapProfiler.collectGarbage');
            return page.evaluate(() => window.gestureCellRef.deref() === undefined);
        })
        .toBe(true);
    await session.detach();
});

for (const horizontal of [false, true]) {
    test(`touch ${horizontal ? 'horizontal' : 'vertical'} momentum uses the grid's own window`, async ({ page }) => {
        await mount(page);
        await pauseClock(page);
        const child = await mountChildWindow(page);
        const viewport = child.locator('.ag-grid-viewport');
        // Simulate an opener that stops producing frames while the child window remains active.
        await page.evaluate(() => {
            window.requestAnimationFrame = () => 0;
        });
        await viewport.dispatchEvent('touchstart', {
            touches: [{ identifier: 1, clientX: 300, clientY: 300 }],
        });
        await page.clock.runFor(16);
        await viewport.dispatchEvent('touchmove', {
            touches: [{ identifier: 1, clientX: horizontal ? 260 : 295, clientY: horizontal ? 295 : 260 }],
        });
        await viewport.dispatchEvent('touchend', { touches: [] });
        const position = () =>
            viewport.evaluate(
                (element, horizontal) => (horizontal ? element.scrollLeft : element.scrollTop),
                horizontal
            );
        await page.clock.runFor(100);
        expect(await position()).toBeGreaterThan(40);
        await viewport.dispatchEvent('pointerdown');
        const stopped = await position();
        await page.clock.runFor(100);
        expect(await position()).toBe(stopped);
        expect(
            await viewport.evaluate(
                (element, horizontal) => (horizontal ? element.scrollTop : element.scrollLeft),
                horizontal
            )
        ).toBe(0);
    });
}

for (const origin of ['child', 'opener']) {
    for (const content of ['nested scroller', 'input', 'selection handle']) {
        test(`child-window ${content} created in the ${origin} keeps its gestures`, async ({ page }) => {
            await mount(page);
            const child = await mountChildWindow(page);
            const cell = child.locator('.ag-row[row-index="0"] [col-id="c0"]');
            await cell.evaluate(
                (cell, { origin, content }) => {
                    const document = origin === 'child' ? cell.ownerDocument : window.parent.document;
                    const target = document.createElement(content === 'input' ? 'input' : 'div');
                    target.id = 'nested-content';
                    if (content === 'nested scroller') {
                        target.style.cssText = 'height: 35px; overflow: auto;';
                        target.innerHTML = '<div style="height: 500px">Nested content</div>';
                    } else if (content === 'selection handle') {
                        target.className = 'ag-selection-handle';
                    }
                    cell.replaceChildren(target);
                },
                { origin, content }
            );
            const target = child.locator('#nested-content');
            const viewport = child.locator('.ag-grid-viewport');
            if (content === 'nested scroller') {
                await target.hover();
                await page.mouse.wheel(0, 100);
                await expect.poll(() => target.evaluate((element) => element.scrollTop)).toBe(100);
                expect(await viewport.evaluate((element) => element.scrollTop)).toBe(0);
            }
            const prevented = await target.evaluate((target) => {
                const send = (type: string, y: number) => {
                    const point = { identifier: 1, target, clientX: 300, clientY: y };
                    const event = Object.assign(new Event(type, { bubbles: true, cancelable: true }), {
                        touches: type === 'touchcancel' ? [] : [point],
                        changedTouches: [point],
                    });
                    target.dispatchEvent(event);
                    return event.defaultPrevented;
                };
                send('touchstart', 300);
                const prevented = send('touchmove', 260);
                send('touchcancel', 260);
                return prevented;
            });
            expect(prevented).toBe(false);
            expect(await viewport.evaluate((element) => ({ x: element.scrollLeft, y: element.scrollTop }))).toEqual({
                x: 0,
                y: 0,
            });
        });
    }
}

for (const { horizontal, rtl } of [
    { horizontal: false, rtl: false },
    { horizontal: true, rtl: false },
    { horizontal: true, rtl: true },
]) {
    test(`fractional touch movement is retained (horizontal=${horizontal}, rtl=${rtl})`, async ({ page }) => {
        await mount(page, rtl);
        await pauseClock(page);
        await page.evaluate(() => {
            window.gestureTarget = document.querySelector<HTMLElement>('.ag-grid-viewport')!;
        });
        const move = (distance: number) =>
            touch(
                page,
                'touchmove',
                horizontal ? 300 - distance * (rtl ? -1 : 1) : 298,
                horizontal ? 398 : 400 - distance
            );
        const position = async () => {
            const { left, top } = await positions(page);
            return horizontal ? left : top;
        };
        await touch(page, 'touchstart', 300, 400);
        await move(10);
        expect(await position()).toBe(10);
        for (let i = 1; i <= 40; i++) {
            await move(10 + i * 0.25);
        }
        expect(await position()).toBe(20);
        for (let i = 1; i <= 40; i++) {
            await move(20 - i * 0.25);
        }
        expect(await position()).toBe(10);

        // Movement beyond an edge must not accumulate and delay a change of direction.
        await move(-100);
        await move(-120);
        expect(await position()).toBe(0);
        for (let i = 1; i <= 4; i++) {
            await page.clock.runFor(16);
            await move(-120 + i * 0.25);
        }
        expect(await position()).toBe(1);
        // Slow input must not gain momentum from rounding one update up to a whole pixel.
        await touch(page, 'touchend', 300, 400);
        await page.clock.runFor(200);
        await expect
            .poll(() => positions(page))
            .toMatchObject({
                left: horizontal ? 1 : 0,
                top: horizontal ? 0 : 1,
                horizontalDifference: 0,
                verticalDifference: 0,
            });
    });

    for (const input of ['wheel', 'touch']) {
        test(`fractional overscroll does not delay reversal (rtl=${rtl}, horizontal=${horizontal}, input=${input})`, async ({
            page,
        }) => {
            await mount(page, rtl);
            await pauseClock(page);
            await page.evaluate(() => {
                window.gestureTarget = document.querySelector<HTMLElement>('.ag-grid-viewport')!;
            });
            const position = async () => {
                const { left, top } = await positions(page);
                return horizontal ? left : top;
            };
            if (input === 'touch') {
                await touch(page, 'touchstart', 300, 400);
            }
            let previous = 0;
            for (const distance of [10, -0.75, 0.25]) {
                if (input === 'touch') {
                    await touch(
                        page,
                        'touchmove',
                        horizontal ? 300 - distance * (rtl ? -1 : 1) : 300,
                        horizontal ? 400 : 400 - distance
                    );
                } else {
                    await page.locator('.ag-grid-viewport').dispatchEvent('wheel', {
                        deltaX: horizontal ? (distance - previous) * (rtl ? -1 : 1) : 0,
                        deltaY: horizontal ? 0 : distance - previous,
                    });
                }
                previous = distance;
            }
            expect(await position()).toBe(1);
            if (input === 'touch') {
                await touch(page, 'touchcancel', 300, 400);
            }
        });
    }

    test(`fractional touch release keeps momentum (rtl=${rtl}, horizontal=${horizontal})`, async ({ page }) => {
        await mount(page, rtl);
        await pauseClock(page);
        await page.evaluate(() => {
            window.gestureTarget = document.querySelector<HTMLElement>('.ag-grid-viewport')!;
        });
        const position = async () => {
            const { left, top } = await positions(page);
            return horizontal ? left : top;
        };
        const move = async (distance: number) => {
            await page.clock.runFor(16);
            await touch(
                page,
                'touchmove',
                horizontal ? 300 - distance * (rtl ? -1 : 1) : 300,
                horizontal ? 400 : 400 - distance
            );
        };
        for (const steps of [21, 23]) {
            await touch(page, 'touchstart', 300, 400);
            await move(16);
            // End on different rounding phases: the finger speed is the same on every fractional update.
            for (let i = 1; i <= steps; i++) {
                await move(16 + i * 0.75);
            }
            const beforeRelease = await position();
            await touch(page, 'touchend', 300, 400);
            await page.clock.runFor(600);
            expect(await position()).toBeGreaterThan(beforeRelease);
            expect(horizontal ? (await positions(page)).top : (await positions(page)).left).toBe(0);
        }
    });
}

test('fractional trackpad deltas are retained after the axis locks', async ({ page }) => {
    await mount(page);
    await page.evaluate(() => {
        const viewport = document.querySelector('.ag-grid-viewport')!;
        viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: 5, bubbles: true, cancelable: true }));
        for (let i = 0; i < 20; i++) {
            viewport.dispatchEvent(
                new WheelEvent('wheel', { deltaY: 0.25, deltaX: 0.1, bubbles: true, cancelable: true })
            );
        }
    });
    await expect.poll(() => positions(page)).toMatchObject({ top: 10, left: 0, verticalDifference: 0 });
});

for (const horizontal of [false, true]) {
    test(`browser touch input locks the ${horizontal ? 'horizontal' : 'vertical'} axis`, async ({
        page,
        browserName,
    }) => {
        test.skip(browserName !== 'chromium', 'Native touch injection uses the Chromium DevTools Protocol.');
        await mount(page);
        const session = await page.context().newCDPSession(page);
        const point = (x: number, y: number) => [{ x, y, id: 1 }];
        await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: point(350, 400) });
        for (const distance of [1, -1, 0, 3]) {
            await session.send('Input.dispatchTouchEvent', {
                type: 'touchMove',
                touchPoints: point(horizontal ? 350 - distance : 350, horizontal ? 400 : 400 - distance),
            });
        }
        for (let i = 1; i <= 5; i++) {
            await session.send('Input.dispatchTouchEvent', {
                type: 'touchMove',
                touchPoints: point(350 - i * (horizontal ? 40 : 5), 400 - i * (horizontal ? 5 : 40)),
            });
        }
        const position = async () => (horizontal ? (await positions(page)).left : (await positions(page)).top);
        await expect.poll(position).toBe(200);
        for (let i = 1; i <= 40; i++) {
            await session.send('Input.dispatchTouchEvent', {
                type: 'touchMove',
                touchPoints: point(horizontal ? 150 - i * 0.25 : 325, horizontal ? 375 : 200 - i * 0.25),
            });
        }
        await expect.poll(position).toBe(210);
        await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        expect(horizontal ? (await positions(page)).top : (await positions(page)).left).toBe(0);
        await session.detach();
    });
}

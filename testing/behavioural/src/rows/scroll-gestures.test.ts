import { TestGridsManager, nextAnimationFrame, waitForMissingModuleReports } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';

import type { GridOptions, Module } from 'ag-grid-community';
import {
    AllCommunityModule,
    ClientSideRowModelModule,
    PinnedRowModule,
    ScrollApiModule,
    ScrollGestureModule,
    enableDevValidations,
} from 'ag-grid-community';

import { scrollGestureTrackpad } from './fixtures/scrollGestureTrackpad';

describe('scroll gestures', () => {
    const grids = new TestGridsManager({ modules: [ClientSideRowModelModule, PinnedRowModule, ScrollApiModule] });

    beforeEach(() => {
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterEach(() => {
        grids.reset();
        mockGridLayout.useRealOffsetDimensions = false;
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    async function createGrid(options: GridOptions = {}, modules: Module[] = [ScrollGestureModule]) {
        const api = grids.createGrid(
            'gestures',
            {
                scrollGestureMode: 'axisLocked',
                rowHeight: 40,
                columnDefs: Array.from({ length: 10 }, (_, i) => ({ field: `c${i}`, width: 200 })),
                rowData: Array.from({ length: 200 }, () => ({})),
                ...options,
            },
            { modules }
        );
        const root = TestGridsManager.getHTMLElement(api)!;
        root.style.width = '700px';
        root.style.height = '500px';
        await nextAnimationFrame();
        await nextAnimationFrame();
        const viewport = root.querySelector<HTMLElement>('.ag-grid-viewport')!;
        expect(viewport.clientHeight).toBeGreaterThan(0);
        return { api, root, viewport };
    }

    function wheel(target: HTMLElement, deltaX: number, deltaY: number, init: WheelEventInit = {}) {
        const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaX, deltaY, ...init });
        // happy-dom's WheelEvent omits MouseEvent modifier keys.
        Object.defineProperties(event, {
            ctrlKey: { value: init.ctrlKey ?? false },
            metaKey: { value: init.metaKey ?? false },
            shiftKey: { value: init.shiftKey ?? false },
        });
        target.dispatchEvent(event);
        return event;
    }

    function touch(target: HTMLElement, type: string, x: number, y: number, extra: Touch[] = []) {
        const point = new Touch({ identifier: 1, target, clientX: x, clientY: y });
        const event = new TouchEvent(type, {
            bubbles: true,
            cancelable: true,
            touches: type === 'touchend' || type === 'touchcancel' ? [] : [point, ...extra],
            changedTouches: [point],
        });
        target.dispatchEvent(event);
        return event;
    }

    test.each([undefined, 'native'] as const)('native mode (%s) leaves input untouched', async (scrollGestureMode) => {
        const { api, viewport } = await createGrid({ scrollGestureMode });
        expect(api.getGridOption('scrollGestureMode') ?? 'native').toBe('native');
        expect(wheel(viewport, 30, 80).defaultPrevented).toBe(false);
        touch(viewport, 'touchstart', 200, 200);
        expect(touch(viewport, 'touchmove', 150, 100).defaultPrevented).toBe(false);
        expect(viewport.style.touchAction).toBe('');
    });

    test('reports the missing gesture module and retains native scrolling', async () => {
        enableDevValidations({ throwOn: [] });
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { root, viewport } = await createGrid({ pinnedTopRowData: [{}] }, []);
        await waitForMissingModuleReports();

        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('error #200'),
            expect.stringContaining('ScrollGestureModule'),
            expect.any(String)
        );
        expect(wheel(viewport, 30, 80).defaultPrevented).toBe(false);
        touch(viewport, 'touchstart', 200, 200);
        expect(touch(viewport, 'touchmove', 150, 100).defaultPrevented).toBe(false);
        wheel(root.querySelector<HTMLElement>('.ag-row-pinned .ag-cell')!, 0, 40);
        expect(viewport.scrollTop).toBe(40);
    });

    test.each([undefined, 'native'] as const)('native mode (%s) does not require the gesture module', async (mode) => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { viewport } = await createGrid({ scrollGestureMode: mode }, []);
        await waitForMissingModuleReports();

        expect(errorSpy).not.toHaveBeenCalled();
        expect(wheel(viewport, 30, 80).defaultPrevented).toBe(false);
        touch(viewport, 'touchstart', 200, 200);
        expect(touch(viewport, 'touchmove', 150, 100).defaultPrevented).toBe(false);
    });

    test('AllCommunityModule includes axis-locked gestures', async () => {
        const { viewport } = await createGrid({}, [AllCommunityModule]);

        expect(wheel(viewport, 5, 40).defaultPrevented).toBe(true);
        expect(viewport.scrollTop).toBe(40);
        expect(viewport.scrollLeft).toBe(0);
    });

    test('runtime mode changes preserve the grid and start fresh gestures without duplicating handlers', async () => {
        const { api, root, viewport } = await createGrid({ scrollGestureMode: 'native', pinnedTopRowData: [{}] });
        vi.useFakeTimers();
        const pinnedCell = () => root.querySelector<HTMLElement>('.ag-row-pinned .ag-cell')!;

        expect(wheel(viewport, 5, 40).defaultPrevented).toBe(false);
        for (let i = 0; i < 3; i++) {
            const top = viewport.scrollTop;
            const left = viewport.scrollLeft;
            api.setGridOption('scrollGestureMode', 'axisLocked');
            wheel(pinnedCell(), 40, 5);
            api.setGridOption('scrollGestureMode', 'axisLocked');
            wheel(pinnedCell(), 10, 80);
            expect(viewport.scrollLeft).toBe(left + 50);
            expect(viewport.scrollTop).toBe(top);

            api.setGridOption('scrollGestureMode', 'native');
            expect(wheel(viewport, 5, 40).defaultPrevented).toBe(false);
            wheel(pinnedCell(), 0, 40);
            expect(viewport.scrollTop).toBe(top + 40);

            api.setGridOption('scrollGestureMode', 'axisLocked');
            wheel(pinnedCell(), 5, 40);
            expect(viewport.scrollTop).toBe(top + 80);
            expect(viewport.scrollLeft).toBe(left + 50);
            api.setGridOption('scrollGestureMode', undefined);
            expect(wheel(viewport, 5, 40).defaultPrevented).toBe(false);
            expect(api.isDestroyed()).toBe(false);
            expect(root.querySelector('.ag-grid-viewport')).toBe(viewport);
        }
    });

    test('enabling gestures at runtime still requires the module', async () => {
        enableDevValidations({ throwOn: [] });
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const { api, viewport } = await createGrid({ scrollGestureMode: 'native' }, []);
        await waitForMissingModuleReports();
        expect(errorSpy).not.toHaveBeenCalled();

        api.setGridOption('scrollGestureMode', 'axisLocked');
        await waitForMissingModuleReports();
        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('error #200'),
            expect.stringContaining('ScrollGestureModule'),
            expect.any(String)
        );
        expect(wheel(viewport, 5, 40).defaultPrevented).toBe(false);
    });

    test('switching to native cancels an active touch, including after re-enabling gestures', async () => {
        const { api, viewport } = await createGrid();
        vi.useFakeTimers();
        touch(viewport, 'touchstart', 200, 200);
        await vi.advanceTimersByTimeAsync(16);
        touch(viewport, 'touchmove', 195, 160);
        api.setGridOption('scrollGestureMode', 'native');
        expect(touch(viewport, 'touchmove', 190, 120).defaultPrevented).toBe(false);
        api.setGridOption('scrollGestureMode', 'axisLocked');
        expect(touch(viewport, 'touchmove', 185, 80).defaultPrevented).toBe(false);
        touch(viewport, 'touchend', 185, 80);
        await vi.advanceTimersByTimeAsync(300);
        expect(viewport.scrollTop).toBe(40);

        touch(viewport, 'touchstart', 200, 200);
        await vi.advanceTimersByTimeAsync(16);
        expect(touch(viewport, 'touchmove', 160, 195).defaultPrevented).toBe(true);
        expect(viewport.scrollLeft).toBe(40);
        expect(viewport.scrollTop).toBe(40);
        touch(viewport, 'touchcancel', 160, 195);
    });

    test.each([false, true])('switching to native stops touch momentum (horizontal=%s)', async (horizontal) => {
        const { api, viewport } = await createGrid();
        vi.useFakeTimers();
        const position = () => (horizontal ? viewport.scrollLeft : viewport.scrollTop);
        touch(viewport, 'touchstart', 200, 200);
        await vi.advanceTimersByTimeAsync(16);
        touch(viewport, 'touchmove', horizontal ? 160 : 195, horizontal ? 195 : 160);
        touch(viewport, 'touchend', horizontal ? 160 : 195, horizontal ? 195 : 160);
        await vi.advanceTimersByTimeAsync(32);
        expect(position()).toBeGreaterThan(40);

        api.setGridOption('scrollGestureMode', 'native');
        const stopped = position();
        await vi.advanceTimersByTimeAsync(300);
        expect(position()).toBe(stopped);
        api.setGridOption('scrollGestureMode', 'axisLocked');
        await vi.advanceTimersByTimeAsync(300);
        expect(position()).toBe(stopped);
    });

    test('wheel direction stays locked until input stops, then a new gesture can change axis', async () => {
        const { viewport } = await createGrid();
        vi.useFakeTimers();
        expect(wheel(viewport, 5, 40).defaultPrevented).toBe(true);
        wheel(viewport, 80, 10);
        expect(viewport.scrollTop).toBe(50);
        expect(viewport.scrollLeft).toBe(0);

        await vi.advanceTimersByTimeAsync(250);
        wheel(viewport, 40, 2);
        expect(viewport.scrollLeft).toBe(40);
        expect(viewport.scrollTop).toBe(50);
    });

    test('small wheel deltas accumulate without leaking perpendicular movement', async () => {
        const { viewport } = await createGrid();
        vi.useFakeTimers();
        for (let i = 0; i < 10; i++) {
            expect(wheel(viewport, 0.1, 0.5).defaultPrevented).toBe(true);
        }
        expect(viewport.scrollTop).toBe(5);
        expect(viewport.scrollLeft).toBe(0);
    });

    test.each(['horizontal', 'vertical'] as const)(
        'sustained perpendicular input releases a settled %s wheel lock',
        async (axis) => {
            const { viewport } = await createGrid();
            vi.useFakeTimers();
            const horizontal = axis === 'horizontal';
            wheel(viewport, horizontal ? 40 : 2, horizontal ? 2 : 40);
            await vi.advanceTimersByTimeAsync(100);
            for (let i = 0; i < 5; i++) {
                wheel(viewport, horizontal ? 1 : 20, horizontal ? 20 : 1);
                await vi.advanceTimersByTimeAsync(50);
            }
            expect(horizontal ? viewport.scrollTop : viewport.scrollLeft).toBeGreaterThan(0);
            const previousAxisPosition = horizontal ? viewport.scrollLeft : viewport.scrollTop;
            wheel(viewport, horizontal ? 1 : 20, horizontal ? 20 : 1);
            expect(horizontal ? viewport.scrollLeft : viewport.scrollTop).toBe(previousAxisPosition);
        }
    );

    test('near-diagonal wheel input keeps the original axis throughout the gesture', async () => {
        const { viewport } = await createGrid();
        vi.useFakeTimers();
        wheel(viewport, 40, 2);
        for (let i = 0; i < 5; i++) {
            await vi.advanceTimersByTimeAsync(100);
            wheel(viewport, 10, 12);
        }
        expect(viewport.scrollLeft).toBe(90);
        expect(viewport.scrollTop).toBe(0);
    });

    test.each(['horizontal', 'vertical'] as const)(
        'recorded trackpad input releases the %s lock without a full idle gap',
        async (initialAxis) => {
            const { viewport } = await createGrid({
                columnDefs: [{ field: 'a', width: 2000 }],
            });
            vi.useFakeTimers();
            const horizontal = initialAxis === 'horizontal';
            for (const [gap, x, y] of scrollGestureTrackpad) {
                await vi.advanceTimersByTimeAsync(gap);
                wheel(viewport, horizontal ? x : y, horizontal ? y : x);
            }
            expect(horizontal ? viewport.scrollTop : viewport.scrollLeft).toBeGreaterThan(80);
            expect(horizontal ? viewport.scrollLeft : viewport.scrollTop).toBeGreaterThan(400);
        }
    );

    test('moving across cells does not start a new wheel gesture', async () => {
        const { root, viewport } = await createGrid();
        vi.useFakeTimers();
        wheel(root.querySelector<HTMLElement>('.ag-row[row-index="0"] .ag-cell')!, 5, 40);
        wheel(root.querySelector<HTMLElement>('.ag-row[row-index="1"] .ag-cell')!, 80, 10);
        expect(viewport.scrollTop).toBe(50);
        expect(viewport.scrollLeft).toBe(0);
    });

    test('Shift-wheel scrolls horizontally and line/page deltas are normalised', async () => {
        const { viewport } = await createGrid();
        vi.useFakeTimers();
        wheel(viewport, 0, 40, { shiftKey: true });
        expect(viewport.scrollLeft).toBe(40);
        expect(viewport.scrollTop).toBe(0);
        await vi.advanceTimersByTimeAsync(250);
        wheel(viewport, 0, 1, { deltaMode: WheelEvent.DOM_DELTA_LINE });
        const lineScroll = viewport.scrollTop;
        expect(lineScroll).toBeGreaterThan(1);
        await vi.advanceTimersByTimeAsync(250);
        wheel(viewport, 0, 1, { deltaMode: WheelEvent.DOM_DELTA_PAGE });
        expect(viewport.scrollTop).toBe(lineScroll + viewport.clientHeight);
    });

    test('zoom, cancelled input and non-cancellable input are not consumed', async () => {
        const { viewport } = await createGrid();
        expect(wheel(viewport, 5, 40, { ctrlKey: true }).defaultPrevented).toBe(false);
        expect(wheel(viewport, 5, 40, { metaKey: true }).defaultPrevented).toBe(false);
        expect(wheel(viewport, 5, 40, { cancelable: false }).defaultPrevented).toBe(false);
        const cancelled = new WheelEvent('wheel', { deltaY: 40, bubbles: true, cancelable: true });
        cancelled.preventDefault();
        viewport.dispatchEvent(cancelled);
        expect(viewport.scrollTop).toBe(0);
        expect(viewport.scrollLeft).toBe(0);
    });

    test('existing input suppression options take precedence over axis locking', async () => {
        const { viewport } = await createGrid({ suppressTouch: true, suppressPreventDefaultOnMouseWheel: true });
        expect(wheel(viewport, 5, 40).defaultPrevented).toBe(false);
        touch(viewport, 'touchstart', 200, 200);
        expect(touch(viewport, 'touchmove', 195, 160).defaultPrevented).toBe(false);
        expect(viewport.scrollTop).toBe(0);
    });

    test('an outward gesture at the top is left for the page to handle', async () => {
        const { viewport } = await createGrid();
        expect(wheel(viewport, 2, -40).defaultPrevented).toBe(false);
        touch(viewport, 'touchstart', 200, 200);
        expect(touch(viewport, 'touchmove', 198, 240).defaultPrevented).toBe(false);
        expect(viewport.scrollTop).toBe(0);
    });

    test('pinned rows use the same wheel axis lock as the body', async () => {
        const { root, viewport } = await createGrid({ pinnedTopRowData: [{}] });
        wheel(root.querySelector<HTMLElement>('.ag-row-pinned .ag-cell')!, 80, 10);
        expect(viewport.scrollLeft).toBe(80);
        expect(viewport.scrollTop).toBe(0);
    });

    test.each(['horizontal', 'vertical'] as const)(
        'touch %s scrolling keeps its axis through momentum',
        async (axis) => {
            const { viewport } = await createGrid();
            vi.useFakeTimers();
            const horizontal = axis === 'horizontal';
            const position = () => (horizontal ? viewport.scrollLeft : viewport.scrollTop);
            touch(viewport, 'touchstart', 250, 250);
            await vi.advanceTimersByTimeAsync(16);
            expect(touch(viewport, 'touchmove', horizontal ? 210 : 245, horizontal ? 245 : 210).defaultPrevented).toBe(
                true
            );
            await vi.advanceTimersByTimeAsync(16);
            touch(viewport, 'touchmove', horizontal ? 170 : 190, horizontal ? 190 : 170);
            expect(position()).toBe(80);
            touch(viewport, 'touchend', 170, 170);
            await vi.advanceTimersByTimeAsync(100);
            expect(position()).toBeGreaterThan(80);
            expect(horizontal ? viewport.scrollTop : viewport.scrollLeft).toBe(0);

            touch(viewport, 'touchstart', 250, 250);
            const stopped = position();
            await vi.advanceTimersByTimeAsync(300);
            expect(position()).toBe(stopped);
            touch(viewport, 'touchcancel', 250, 250);
        }
    );

    test('multi-touch and touch cancellation stop the gesture without momentum', async () => {
        const { viewport } = await createGrid();
        vi.useFakeTimers();
        touch(viewport, 'touchstart', 200, 200);
        await vi.advanceTimersByTimeAsync(16);
        touch(viewport, 'touchmove', 195, 160);
        touch(viewport, 'touchstart', 195, 160, [
            new Touch({ identifier: 2, target: viewport, clientX: 250, clientY: 200 }),
        ]);
        expect(touch(viewport, 'touchmove', 190, 100).defaultPrevented).toBe(false);
        touch(viewport, 'touchend', 190, 100);
        await vi.advanceTimersByTimeAsync(300);
        expect(viewport.scrollTop).toBe(40);

        touch(viewport, 'touchstart', 200, 200);
        await vi.advanceTimersByTimeAsync(16);
        touch(viewport, 'touchmove', 195, 160);
        touch(viewport, 'touchcancel', 195, 160);
        await vi.advanceTimersByTimeAsync(300);
        expect(viewport.scrollTop).toBe(80);
    });

    test('destruction stops momentum and removes input listeners', async () => {
        const { api, viewport } = await createGrid();
        vi.useFakeTimers();
        touch(viewport, 'touchstart', 200, 200);
        await vi.advanceTimersByTimeAsync(16);
        touch(viewport, 'touchmove', 195, 160);
        touch(viewport, 'touchend', 195, 160);
        api.destroy();
        const top = viewport.scrollTop;
        await vi.advanceTimersByTimeAsync(3000);
        expect(viewport.scrollTop).toBe(top);
        expect(wheel(viewport, 5, 40).defaultPrevented).toBe(false);
    });

    test.each(['pointerdown', 'keydown'])('%s on a scrollbar stops touch momentum', async (type) => {
        const { root, viewport } = await createGrid();
        vi.useFakeTimers();
        touch(viewport, 'touchstart', 200, 200);
        await vi.advanceTimersByTimeAsync(16);
        touch(viewport, 'touchmove', 195, 160);
        touch(viewport, 'touchend', 195, 160);
        await vi.advanceTimersByTimeAsync(32);
        expect(viewport.scrollTop).toBeGreaterThan(40);
        root.querySelector('.ag-body-vertical-scroll-viewport')!.dispatchEvent(new Event(type, { bubbles: true }));
        const stopped = viewport.scrollTop;
        await vi.advanceTimersByTimeAsync(300);
        expect(viewport.scrollTop).toBe(stopped);
    });

    test('holding still before release does not start momentum', async () => {
        const { viewport } = await createGrid();
        vi.useFakeTimers();
        touch(viewport, 'touchstart', 200, 200);
        await vi.advanceTimersByTimeAsync(16);
        touch(viewport, 'touchmove', 195, 160);
        await vi.advanceTimersByTimeAsync(100);
        touch(viewport, 'touchend', 195, 160);
        await vi.advanceTimersByTimeAsync(300);
        expect(viewport.scrollTop).toBe(40);
    });

    test.each([false, true])('holding before a flick does not dilute momentum (resume=%s)', async (resume) => {
        const { viewport } = await createGrid();
        vi.useFakeTimers();
        const momentum: number[] = [];
        for (const hold of [2000, 10000]) {
            touch(viewport, 'touchstart', 300, 400);
            if (resume) {
                await vi.advanceTimersByTimeAsync(16);
                touch(viewport, 'touchmove', 300, 360);
            }
            await vi.advanceTimersByTimeAsync(hold);
            touch(viewport, 'touchmove', 300, resume ? 320 : 360);
            const released = viewport.scrollTop;
            touch(viewport, 'touchend', 300, resume ? 320 : 360);
            await vi.advanceTimersByTimeAsync(32);
            momentum.push(viewport.scrollTop - released);
        }
        expect(momentum[0]).toBeGreaterThan(0);
        expect(momentum[1]).toBeGreaterThan(0);
        expect(Math.abs(momentum[0] - momentum[1])).toBeLessThanOrEqual(1);
        expect(viewport.scrollLeft).toBe(0);
    });

    test.each(['horizontal', 'vertical'] as const)(
        'sub-threshold touch reversals retain scroll ownership on the %s axis',
        async (axis) => {
            const { viewport } = await createGrid();
            const horizontal = axis === 'horizontal';
            const move = (distance: number) =>
                touch(viewport, 'touchmove', horizontal ? 300 - distance : 300, horizontal ? 400 : 400 - distance);
            touch(viewport, 'touchstart', 300, 400);
            for (const distance of [1, -1, 0, 3]) {
                expect(move(distance).defaultPrevented).toBe(true);
                expect(viewport.scrollLeft).toBe(0);
                expect(viewport.scrollTop).toBe(0);
            }
            expect(move(40).defaultPrevented).toBe(true);
            expect(viewport.scrollLeft).toBe(horizontal ? 40 : 0);
            expect(viewport.scrollTop).toBe(horizontal ? 0 : 40);
            touch(viewport, 'touchcancel', 300, 400);
        }
    );

    test.each(['horizontal', 'vertical'] as const)('touch momentum follows a reversal on the %s axis', async (axis) => {
        const { viewport } = await createGrid();
        vi.useFakeTimers();
        const horizontal = axis === 'horizontal';
        const position = () => (horizontal ? viewport.scrollLeft : viewport.scrollTop);
        touch(viewport, 'touchstart', 250, 250);
        await vi.advanceTimersByTimeAsync(16);
        touch(viewport, 'touchmove', horizontal ? 150 : 250, horizontal ? 250 : 150);
        await vi.advanceTimersByTimeAsync(16);
        touch(viewport, 'touchmove', horizontal ? 170 : 250, horizontal ? 250 : 170);
        expect(position()).toBe(80);
        touch(viewport, 'touchend', 170, 170);
        await vi.advanceTimersByTimeAsync(32);
        expect(position()).toBeLessThan(80);
        expect(horizontal ? viewport.scrollTop : viewport.scrollLeft).toBe(0);
    });
});

import { waitFor } from '@testing-library/dom';
import { TestGridsManager, mockGridLayout } from 'ag-test-utils';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

const scrollbarWidth = 15;
const initialRowCount = 11;
const rowData = Array.from({ length: initialRowCount + 1 }, (_, index) => ({
    athlete: `Athlete ${index}`,
    country: `Country ${index}`,
    sport: `Sport ${index}`,
}));

const query = <T extends Element>(selector: string): T => {
    const element = document.querySelector<T>(selector);
    expect(element, `Expected ${selector} to be rendered`).not.toBeNull();
    return element!;
};

const expectScrollbarSizes = async (horizontal: string, vertical: string, phase: string): Promise<void> => {
    await waitFor(() => {
        expect(query<HTMLElement>('.ag-body-horizontal-scroll').style.height, phase).toBe(horizontal);
        expect(query<HTMLElement>('.ag-body-vertical-scroll').style.width, phase).toBe(vertical);
    });
};

describe('Scrollbar visibility', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });
    let originalGridWidth: number;
    let originalGridHeight: number;
    let originalNativeScrollbarWidth: number;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        originalGridHeight = mockGridLayout.gridHeight;
        originalNativeScrollbarWidth = mockGridLayout.nativeScrollbarWidth;
        mockGridLayout.gridWidth = 655;
        // Eleven rows have half a scrollbar of spare height: they fit without the horizontal scrollbar and
        // overflow once it consumes layout space. The two header heights account for the mock viewport and
        // getBodyViewportHeight each removing the header section.
        mockGridLayout.gridHeight =
            mockGridLayout.headerHeight * 2 + mockGridLayout.rowHeight * initialRowCount + scrollbarWidth / 2;
        mockGridLayout.useRealOffsetDimensions = true;
        mockGridLayout.nativeScrollbarWidth = scrollbarWidth;
    });

    afterAll(() => {
        mockGridLayout.gridWidth = originalGridWidth;
        mockGridLayout.gridHeight = originalGridHeight;
        mockGridLayout.useRealOffsetDimensions = false;
        mockGridLayout.nativeScrollbarWidth = originalNativeScrollbarWidth;
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('removes mutually dependent scrollbars after overflowing row data is removed', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'athlete', minWidth: 300 },
                { field: 'country', minWidth: 200 },
                { field: 'sport', minWidth: 150 },
            ],
            defaultColDef: {
                minWidth: 100,
                flex: 1,
            },
            headerHeight: mockGridLayout.headerHeight,
            rowHeight: mockGridLayout.rowHeight,
            rowData: [],
            scrollbarWidth,
        });

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        const horizontalScrollbar = query<HTMLElement>('.ag-body-horizontal-scroll');
        Object.defineProperty(viewport, 'clientHeight', {
            configurable: true,
            get: () =>
                mockGridLayout.gridHeight -
                mockGridLayout.headerHeight -
                (Number.parseFloat(horizontalScrollbar.style.height) || 0),
        });

        api.setGridOption('rowData', rowData.slice(0, initialRowCount));
        await waitFor(() => expect(document.querySelectorAll('.ag-row')).toHaveLength(initialRowCount));
        await expectScrollbarSizes('0px', '0px', 'initial row data');

        api.setGridOption('rowData', rowData);
        await expectScrollbarSizes(`${scrollbarWidth}px`, `${scrollbarWidth}px`, 'overflowing row data');

        api.setGridOption('rowData', rowData.slice(0, initialRowCount));
        await expectScrollbarSizes('0px', '0px', 'restored row data');
    });

    // Overlay scrollbars take no layout space, which is when the fake scrollbars listen for touch.
    describe('touch listeners with overlay scrollbars', () => {
        beforeAll(() => {
            mockGridLayout.nativeScrollbarWidth = 0;
        });

        afterAll(() => {
            mockGridLayout.nativeScrollbarWidth = scrollbarWidth;
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        test('are passive on the fake scrollbars, so touching one never delays a scroll', async () => {
            const addEventListener = vi.spyOn(HTMLElement.prototype, 'addEventListener');
            gridsManager.createGrid('myGrid', { columnDefs: [{ field: 'athlete' }], rowData });

            const scrollbar = query<HTMLElement>('.ag-body-horizontal-scroll');
            const touchListeners = () => {
                const { calls, contexts } = addEventListener.mock;
                return calls
                    .filter(([type], i) => contexts[i] === scrollbar && type.startsWith('touch'))
                    .map(([type, , options]) => [type, options]);
            };

            await waitFor(() =>
                expect(touchListeners()).toEqual([
                    ['touchstart', { passive: true }],
                    ['touchend', { passive: true }],
                ])
            );
        });
    });
});

describe('Horizontal scrollbar while columns slide', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });
    let originalGridWidth: number;
    let originalNativeScrollbarWidth: number;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        originalNativeScrollbarWidth = mockGridLayout.nativeScrollbarWidth;
        mockGridLayout.gridWidth = 600;
        mockGridLayout.useRealOffsetDimensions = true;
        mockGridLayout.nativeScrollbarWidth = scrollbarWidth;
    });

    afterAll(() => {
        mockGridLayout.gridWidth = originalGridWidth;
        mockGridLayout.useRealOffsetDimensions = false;
        mockGridLayout.nativeScrollbarWidth = originalNativeScrollbarWidth;
    });

    afterEach(() => {
        gridsManager.reset();
        vi.useRealTimers();
    });

    // A slide ends at 200ms and the backup scrollbar refresh runs at 500ms: 150ms is mid-slide, 300ms between them.
    const MID_SLIDE_MS = 150;
    const AFTER_SLIDE_MS = 300;
    // Long enough for the scrollbar to show (100ms) on the initial overflowing layout.
    const SETTLED_MS = 400;

    const horizontalScrollbarHeight = () => query<HTMLElement>('.ag-body-horizontal-scroll').style.height;

    const createOverflowingGrid = (suppressColumnMoveAnimation: boolean) =>
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', width: 200 },
                { field: 'b', width: 200 },
                { field: 'c', width: 200 },
                { field: 'd', width: 200 },
            ],
            rowData: [{ a: 1, b: 2, c: 3, d: 4 }],
            scrollbarWidth,
            suppressColumnMoveAnimation,
        });

    test('goes at once when columns leave an overflowing layout without a slide', async () => {
        vi.useFakeTimers();
        const api = createOverflowingGrid(true);
        await vi.advanceTimersByTimeAsync(SETTLED_MS);
        expect(horizontalScrollbarHeight()).toBe(`${scrollbarWidth}px`);

        api.setColumnsVisible(['a', 'b'], false);
        await vi.advanceTimersByTimeAsync(MID_SLIDE_MS);

        expect({
            displayed: api.getAllDisplayedColumns().map((column) => column.getColId()),
            height: horizontalScrollbarHeight(),
        }).toEqual({ displayed: ['c', 'd'], height: '0px' });
    });

    test('stays while columns slide out of an overflowing layout, and goes once the slide ends', async () => {
        vi.useFakeTimers();
        const api = createOverflowingGrid(false);
        await vi.advanceTimersByTimeAsync(SETTLED_MS);
        expect(horizontalScrollbarHeight()).toBe(`${scrollbarWidth}px`);

        api.setColumnsVisible(['a', 'b'], false);
        await vi.advanceTimersByTimeAsync(MID_SLIDE_MS);

        // The two columns left (400px) fit the 600px viewport: the scrollbar is kept for the slide.
        expect({
            displayed: api.getAllDisplayedColumns().map((column) => column.getColId()),
            height: horizontalScrollbarHeight(),
        }).toEqual({ displayed: ['c', 'd'], height: `${scrollbarWidth}px` });

        await vi.advanceTimersByTimeAsync(AFTER_SLIDE_MS - MID_SLIDE_MS);
        expect(horizontalScrollbarHeight()).toBe('0px');
    });
});

describe('Vertical scrollbar and scroll gap while columns slide', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });
    const rowCount = 11;
    const rows = Array.from({ length: rowCount }, (_, index) => ({ a: index, b: index, c: index, d: index, e: index }));
    let originalGridWidth: number;
    let originalGridHeight: number;
    let originalNativeScrollbarWidth: number;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        originalGridHeight = mockGridLayout.gridHeight;
        originalNativeScrollbarWidth = mockGridLayout.nativeScrollbarWidth;
        mockGridLayout.gridWidth = 600;
        // Eleven rows have half a scrollbar of spare height: they overflow once a horizontal scrollbar takes layout space.
        mockGridLayout.gridHeight =
            mockGridLayout.headerHeight * 2 + mockGridLayout.rowHeight * rowCount + scrollbarWidth / 2;
        mockGridLayout.useRealOffsetDimensions = true;
        mockGridLayout.nativeScrollbarWidth = scrollbarWidth;
    });

    afterAll(() => {
        mockGridLayout.gridWidth = originalGridWidth;
        mockGridLayout.gridHeight = originalGridHeight;
        mockGridLayout.useRealOffsetDimensions = false;
        mockGridLayout.nativeScrollbarWidth = originalNativeScrollbarWidth;
    });

    afterEach(() => {
        gridsManager.reset();
        vi.useRealTimers();
    });

    // A scrollbar applies after 100ms and a slide ends at 200ms: 150ms is between them.
    const SCROLLBAR_APPLIED_MS = 150;
    const SLIDE_ENDED_MS = 400;
    const VERTICAL_APPLIED_MS = 50;

    const verticalScrollbarWidth = () => query<HTMLElement>('.ag-body-vertical-scroll').style.width;
    const gridBody = () => query<HTMLElement>('.ag-grid-viewport').parentElement!;
    const hasHorizontalGap = () => !gridBody().classList.contains('ag-body-horizontal-content-no-gap');

    test('keeps both scrollbars while columns slide out, and hides them when the slide ends', async () => {
        vi.useFakeTimers();
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'x', hide: true, width: 200 },
                { field: 'y', hide: true, width: 200 },
                { field: 'z', hide: true, width: 200 },
                { field: 'a', width: 200 },
                { field: 'b', width: 200 },
            ],
            rowData: rows,
            headerHeight: mockGridLayout.headerHeight,
            rowHeight: mockGridLayout.rowHeight,
            scrollbarWidth,
        });
        const viewport = query<HTMLElement>('.ag-grid-viewport');
        const horizontalScrollbar = query<HTMLElement>('.ag-body-horizontal-scroll');
        Object.defineProperty(viewport, 'clientHeight', {
            configurable: true,
            get: () =>
                mockGridLayout.gridHeight -
                mockGridLayout.headerHeight -
                (Number.parseFloat(horizontalScrollbar.style.height) || 0),
        });
        await vi.advanceTimersByTimeAsync(SLIDE_ENDED_MS);
        // Two columns (400px) fit the 600px viewport and the rows fit the height: neither scrollbar shows.
        expect({
            displayed: api.getAllDisplayedColumns().map((column) => column.getColId()),
            horizontal: horizontalScrollbar.style.height,
            vertical: verticalScrollbarWidth(),
        }).toEqual({ displayed: ['a', 'b'], horizontal: '0px', vertical: '0px' });

        api.setColumnsVisible(['x', 'y', 'z'], true);
        await vi.advanceTimersByTimeAsync(VERTICAL_APPLIED_MS);
        await vi.advanceTimersByTimeAsync(SCROLLBAR_APPLIED_MS);

        await vi.advanceTimersByTimeAsync(SLIDE_ENDED_MS);
        api.setColumnsVisible(['x', 'y', 'z'], false);
        await vi.advanceTimersByTimeAsync(SCROLLBAR_APPLIED_MS);

        // The columns sliding out keep both scrollbars until the slide ends.
        expect({ horizontal: horizontalScrollbar.style.height, vertical: verticalScrollbarWidth() }).toEqual({
            horizontal: `${scrollbarWidth}px`,
            vertical: `${scrollbarWidth}px`,
        });
        await vi.advanceTimersByTimeAsync(SLIDE_ENDED_MS);
        expect({ horizontal: horizontalScrollbar.style.height, vertical: verticalScrollbarWidth() }).toEqual({
            horizontal: '0px',
            vertical: '0px',
        });
    });

    test('keeps the gap right of the columns closed while columns slide out, and opens it when the slide ends', async () => {
        vi.useFakeTimers();
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'x', hide: true, width: 200 },
                { field: 'y', hide: true, width: 200 },
                { field: 'a', width: 200 },
                { field: 'b', width: 200 },
            ],
            rowData: rows,
            scrollbarWidth,
        });
        await vi.advanceTimersByTimeAsync(SLIDE_ENDED_MS);
        // Two columns (400px) leave a gap in the 600px viewport.
        expect({ displayed: api.getAllDisplayedColumns().length, gap: hasHorizontalGap() }).toEqual({
            displayed: 2,
            gap: true,
        });

        api.setColumnsVisible(['x', 'y'], true);
        await vi.advanceTimersByTimeAsync(SCROLLBAR_APPLIED_MS);
        await vi.advanceTimersByTimeAsync(SLIDE_ENDED_MS);

        api.setColumnsVisible(['x', 'y'], false);
        await vi.advanceTimersByTimeAsync(SCROLLBAR_APPLIED_MS);

        // Two columns are left (400px) but the gap they open waits for the slide to end.
        expect({ displayed: api.getAllDisplayedColumns().length, gap: hasHorizontalGap() }).toEqual({
            displayed: 2,
            gap: false,
        });
        await vi.advanceTimersByTimeAsync(SLIDE_ENDED_MS);
        expect(hasHorizontalGap()).toBe(true);
    });
});

import { waitFor } from '@testing-library/dom';
import { TestGridsManager, mockGridLayout } from 'ag-test-utils';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';

const scrollbarWidth = 15;
const rowCount = 11;
const rowData = Array.from({ length: rowCount }, (_, index) => ({
    athlete: `Athlete ${index}`,
    country: `Country ${index}`,
    sport: `Sport ${index}`,
}));

const columnDefs = (sportMinWidth: number) => [
    { field: 'athlete', minWidth: 300 },
    { field: 'country', minWidth: 200 },
    { field: 'sport', minWidth: sportMinWidth },
];

// the width the grid gives its own vertical scrollbar when the platform draws overlay
// (zero-width) scrollbars - `INVISIBLE_SCROLLBAR_SIZE` in abstractFakeScrollComp.ts
const INVISIBLE_SCROLLBAR_LANE = 16;

// narrow enough that reserving the scrollbar lane cannot introduce a horizontal scrollbar
const overlayColumnDefs = () => [{ field: 'athlete' }, { field: 'country' }, { field: 'sport' }];

// more rows than the viewport can show, so the vertical scrollbar is displayed
const overflowingRowData = Array.from({ length: rowCount * 4 }, (_, index) => ({
    athlete: `Athlete ${index}`,
    country: `Country ${index}`,
    sport: `Sport ${index}`,
}));

const query = <T extends Element>(selector: string): T => {
    const element = document.querySelector<T>(selector);
    expect(element, `Expected ${selector} to be rendered`).not.toBeNull();
    return element!;
};

describe('Overlay scrollbar visibility', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });
    let originalGridWidth: number;
    let originalGridHeight: number;
    let originalNativeScrollbarWidth: number;
    let originalUseRealOffsetDimensions: boolean;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        originalGridHeight = mockGridLayout.gridHeight;
        originalNativeScrollbarWidth = mockGridLayout.nativeScrollbarWidth;
        originalUseRealOffsetDimensions = mockGridLayout.useRealOffsetDimensions;
        mockGridLayout.gridWidth = 655;
        mockGridLayout.gridHeight =
            mockGridLayout.headerHeight * 2 + mockGridLayout.rowHeight * rowCount + scrollbarWidth / 2;
        mockGridLayout.nativeScrollbarWidth = 0;
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterAll(() => {
        mockGridLayout.gridWidth = originalGridWidth;
        mockGridLayout.gridHeight = originalGridHeight;
        mockGridLayout.nativeScrollbarWidth = originalNativeScrollbarWidth;
        mockGridLayout.useRealOffsetDimensions = originalUseRealOffsetDimensions;
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('does not let a horizontal overlay scrollbar consume viewport layout height', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: columnDefs(150),
            defaultColDef: {
                minWidth: 100,
                flex: 1,
            },
            headerHeight: mockGridLayout.headerHeight,
            rowHeight: mockGridLayout.rowHeight,
            rowData,
            scrollbarWidth,
        });

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        const horizontalScrollbar = query<HTMLElement>('.ag-body-horizontal-scroll');
        const verticalScrollbar = query<HTMLElement>('.ag-body-vertical-scroll');

        await waitFor(() => {
            expect(horizontalScrollbar.classList.contains('ag-scrollbar-invisible')).toBe(true);
            expect(horizontalScrollbar.classList.contains('ag-invisible')).toBe(true);
            expect(verticalScrollbar.classList.contains('ag-scrollbar-invisible')).toBe(true);
            expect(verticalScrollbar.classList.contains('ag-hidden')).toBe(true);
        });
        const viewportHeightWithoutHorizontalScroll = viewport.clientHeight;

        api.setGridOption('columnDefs', columnDefs(160));

        await waitFor(() => {
            expect(horizontalScrollbar.classList.contains('ag-scrollbar-invisible')).toBe(true);
            expect(horizontalScrollbar.classList.contains('ag-invisible')).toBe(false);
            expect(horizontalScrollbar.style.height).toBe(`${scrollbarWidth}px`);
            expect(verticalScrollbar.classList.contains('ag-hidden')).toBe(true);
        });
        expect(viewport.clientHeight).toBe(viewportHeightWithoutHorizontalScroll);
    });

    // AG-18346: with overlay (zero-width) scrollbars the grid still draws its own 16px vertical
    // scrollbar over the content lane, but reserved no width for it - so the right-hand edge of the
    // last column sat underneath the scrollbar and right-aligned cell/header text lost its final
    // characters (`35000` rendered as `3500`).
    test.each([
        { name: 'reserves the overlay vertical scrollbar lane so content is not covered by it', enableRtl: false },
        { name: 'reserves the overlay vertical scrollbar lane in RTL', enableRtl: true },
    ])('$name', async ({ enableRtl }) => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: overlayColumnDefs(),
            defaultColDef: { minWidth: 100, flex: 1 },
            headerHeight: mockGridLayout.headerHeight,
            rowHeight: mockGridLayout.rowHeight,
            rowData: overflowingRowData,
            enableRtl,
        });

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        const verticalScrollbar = query<HTMLElement>('.ag-body-vertical-scroll');

        await waitFor(() => {
            expect(verticalScrollbar.classList.contains('ag-scrollbar-invisible')).toBe(true);
            expect(verticalScrollbar.classList.contains('ag-hidden')).toBe(false);
            expect(verticalScrollbar.style.width).toBe(`${INVISIBLE_SCROLLBAR_LANE}px`);
        });

        // happy-dom fires no ResizeObserver, so the initial flex pass ran before the vertical
        // scrollbar was detected - re-set the columns to force it to run again now that it is showing
        api.setGridOption('columnDefs', overlayColumnDefs());
        await waitFor(() => {
            expect(document.querySelectorAll('.ag-header-cell')).toHaveLength(overlayColumnDefs().length);
        });

        // the lane the fake scrollbar paints over, and which content must therefore stay clear of
        const scrollbarLaneWidth = verticalScrollbar.offsetWidth;
        expect(scrollbarLaneWidth).toBe(INVISIBLE_SCROLLBAR_LANE);

        const contentRightEdge = api.getColumnState().reduce((total, { width }) => total + (width ?? 0), 0);
        expect(contentRightEdge).toBe(viewport.clientWidth - scrollbarLaneWidth);

        // the header lane must line up with the body lane - header text is clipped the same way
        const headerRightEdge = [...document.querySelectorAll<HTMLElement>('.ag-header-cell')].reduce(
            (total, cell) => total + Number.parseFloat(cell.style.width),
            0
        );
        expect(headerRightEdge).toBe(contentRightEdge);
    });
});

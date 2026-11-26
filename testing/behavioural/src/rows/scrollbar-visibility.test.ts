import { waitFor } from '@testing-library/dom';
import { TestGridsManager, mockGridLayout, triggerResizeObservers } from 'ag-test-utils';
import { afterAll, afterEach, beforeAll, describe, expect, onTestFinished, test, vi } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

const scrollbarWidth = 15;
const initialRowCount = 11;
// Past the scrollbar's 100ms debounce and its 500ms re-check.
const SCROLLBARS_SETTLED_MS = 600;
// Past the resize report's frame and the scrollbar's 100ms debounce, before its 500ms re-check.
const RESIZE_REPORTED_MS = 300;
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

    test('shows both scrollbars when a column widened through the API overflows the columns, and removes both when it narrows back', async () => {
        vi.useFakeTimers();
        onTestFinished(() => {
            vi.useRealTimers();
        });
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'athlete', width: 200 },
                { field: 'country', width: 200 },
                { field: 'sport', width: 200 },
            ],
            headerHeight: mockGridLayout.headerHeight,
            rowHeight: mockGridLayout.rowHeight,
            rowData: rowData.slice(0, initialRowCount),
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
        const scrollbars = () => ({
            horizontal: horizontalScrollbar.style.height,
            vertical: query<HTMLElement>('.ag-body-vertical-scroll').style.width,
        });
        await vi.advanceTimersByTimeAsync(SCROLLBARS_SETTLED_MS);
        const initial = scrollbars();

        // 800px of columns in a 655px viewport
        api.setColumnWidths([{ key: 'athlete', newWidth: 400 }]);
        await vi.advanceTimersByTimeAsync(SCROLLBARS_SETTLED_MS);
        const widened = { width: api.getColumn('athlete')!.getActualWidth(), ...scrollbars() };

        api.setColumnWidths([{ key: 'athlete', newWidth: 200 }]);
        await vi.advanceTimersByTimeAsync(SCROLLBARS_SETTLED_MS);
        const narrowed = { width: api.getColumn('athlete')!.getActualWidth(), ...scrollbars() };

        expect({ initial, widened, narrowed }).toEqual({
            initial: { horizontal: '0px', vertical: '0px' },
            widened: { width: 400, horizontal: `${scrollbarWidth}px`, vertical: `${scrollbarWidth}px` },
            narrowed: { width: 200, horizontal: '0px', vertical: '0px' },
        });
    });

    test('shows the vertical scrollbar when the grid shrinks below its rows after a column change, and removes it when the height returns', async () => {
        vi.useFakeTimers();
        const heightBefore = mockGridLayout.gridHeight;
        onTestFinished(() => {
            mockGridLayout.gridHeight = heightBefore;
            vi.useRealTimers();
        });
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'athlete', width: 200 },
                { field: 'country', width: 200 },
                { field: 'sport', width: 200 },
            ],
            headerHeight: mockGridLayout.headerHeight,
            rowHeight: mockGridLayout.rowHeight,
            rowData: rowData.slice(0, initialRowCount),
            scrollbarWidth,
        });
        const verticalWidth = () => query<HTMLElement>('.ag-body-vertical-scroll').style.width;
        await vi.advanceTimersByTimeAsync(SCROLLBARS_SETTLED_MS);

        api.moveColumnByIndex(0, 2);
        await vi.advanceTimersByTimeAsync(SCROLLBARS_SETTLED_MS);
        const afterMove = {
            order: api.getAllDisplayedColumns().map((col) => col.getColId()),
            vertical: verticalWidth(),
        };

        // read before the 500ms re-check, which measures whatever was reported
        mockGridLayout.gridHeight = heightBefore - mockGridLayout.rowHeight * 3;
        triggerResizeObservers();
        await vi.advanceTimersByTimeAsync(RESIZE_REPORTED_MS);
        const shrunk = verticalWidth();

        mockGridLayout.gridHeight = heightBefore;
        triggerResizeObservers();
        await vi.advanceTimersByTimeAsync(RESIZE_REPORTED_MS);
        const restored = verticalWidth();

        expect({ afterMove, shrunk, restored }).toEqual({
            afterMove: { order: ['country', 'sport', 'athlete'], vertical: '0px' },
            shrunk: `${scrollbarWidth}px`,
            restored: '0px',
        });
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

    test('shows when the new column layout overflows, before the slide ends', async () => {
        vi.useFakeTimers();
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', rowGroup: true, hide: true },
                { field: 'b', rowGroup: true, hide: true },
                { field: 'c', width: 150 },
            ],
            rowData: [
                { a: 'x', b: 'p', c: 1 },
                { a: 'y', b: 'q', c: 2 },
            ],
            scrollbarWidth,
        });
        await vi.advanceTimersByTimeAsync(SETTLED_MS);
        // The one default auto group column and the value column fit the 600px viewport.
        expect({ columns: api.getAllDisplayedColumns().length, height: horizontalScrollbarHeight() }).toEqual({
            columns: 2,
            height: '0px',
        });

        api.updateGridOptions({
            autoGroupColumnDef: { headerName: 'X', width: 300 },
            groupDisplayType: 'multipleColumns',
        });
        await vi.advanceTimersByTimeAsync(MID_SLIDE_MS);

        // Two auto group columns of 300px and the value column overflow the viewport.
        expect({ columns: api.getAllDisplayedColumns().length, height: horizontalScrollbarHeight() }).toEqual({
            columns: 3,
            height: `${scrollbarWidth}px`,
        });
    });

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

    test('a row group panel shown above the viewport counts in the scrollbar check of the column change after it', async () => {
        vi.useFakeTimers();
        const rowCount = 5;
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', width: 100 },
                { field: 'b', width: 100 },
            ],
            rowData: Array.from({ length: rowCount }, (_, index) => ({ a: index, b: index })),
            headerHeight: mockGridLayout.headerHeight,
            rowHeight: mockGridLayout.rowHeight,
            scrollbarWidth,
        });
        // the rows fit the viewport with 10px to spare, until the panel above it takes its height
        let panelHeight = 0;
        Object.defineProperty(query<HTMLElement>('.ag-grid-viewport'), 'clientHeight', {
            configurable: true,
            get: () => mockGridLayout.headerHeight + mockGridLayout.rowHeight * rowCount + 10 - panelHeight,
        });
        const verticalScrollbarWidth = () => query<HTMLElement>('.ag-body-vertical-scroll').style.width;
        // past the 500ms re-check, which measures the height above
        await vi.advanceTimersByTimeAsync(SETTLED_MS + AFTER_SLIDE_MS);
        const before = verticalScrollbarWidth();

        panelHeight = 40;
        api.setGridOption('rowGroupPanelShow', 'always');
        api.moveColumnByIndex(0, 1);
        await vi.advanceTimersByTimeAsync(AFTER_SLIDE_MS);

        expect({
            before,
            panelShown: query<HTMLElement>('.ag-column-drop-wrapper .ag-column-drop').classList.contains('ag-hidden'),
            order: api.getAllDisplayedColumns().map((column) => column.getColId()),
            after: verticalScrollbarWidth(),
        }).toEqual({ before: '0px', panelShown: false, order: ['b', 'a'], after: `${scrollbarWidth}px` });
    });
});

describe('Vertical scrollbar when a column update changes the header height', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });
    const rowCount = 5;
    let originalGridWidth: number;
    let originalGridHeight: number;
    let originalNativeScrollbarWidth: number;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        originalGridHeight = mockGridLayout.gridHeight;
        originalNativeScrollbarWidth = mockGridLayout.nativeScrollbarWidth;
        mockGridLayout.gridWidth = 600;
        // The rows fit under one header row with 10px to spare, and overflow under two (the mock viewport and the
        // grid's body height each remove the header section).
        mockGridLayout.gridHeight = mockGridLayout.headerHeight * 2 + mockGridLayout.rowHeight * rowCount + 10;
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

    test('settles within the call when a column group row is added and when it is removed again', async () => {
        vi.useFakeTimers();
        const headerHeight = mockGridLayout.headerHeight;
        const columns = [
            { field: 'a', width: 200 },
            { field: 'b', width: 200 },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: columns,
            rowData: Array.from({ length: rowCount }, (_, index) => ({ a: index, b: index })),
            headerHeight,
            groupHeaderHeight: headerHeight,
            rowHeight: mockGridLayout.rowHeight,
            scrollbarWidth,
        });
        let visibilityChanges = 0;
        api.addGlobalListener((type: string) => {
            if (type === 'scrollVisibilityChanged') {
                ++visibilityChanges;
            }
        });
        const verticalScrollbarWidth = () => query<HTMLElement>('.ag-body-vertical-scroll').style.width;
        const headerRows = () => document.querySelectorAll('.ag-header-row').length;
        // past the 500ms re-check, which measures whatever the layout is by then
        await vi.advanceTimersByTimeAsync(SCROLLBARS_SETTLED_MS);
        const initial = { headerRows: headerRows(), vertical: verticalScrollbarWidth() };
        visibilityChanges = 0;

        api.setGridOption('columnDefs', [{ headerName: 'Group', children: columns }]);
        // the event queue is flushed, no frame has run
        await vi.advanceTimersByTimeAsync(0);
        const groupAdded = { headerRows: headerRows(), visibilityChanges };
        await vi.advanceTimersByTimeAsync(SCROLLBARS_SETTLED_MS);
        const groupAddedSettled = { vertical: verticalScrollbarWidth() };
        visibilityChanges = 0;

        api.setGridOption('columnDefs', columns);
        await vi.advanceTimersByTimeAsync(0);
        const groupRemoved = { headerRows: headerRows(), visibilityChanges };
        await vi.advanceTimersByTimeAsync(SCROLLBARS_SETTLED_MS);
        const groupRemovedSettled = { vertical: verticalScrollbarWidth() };

        expect({ initial, groupAdded, groupAddedSettled, groupRemoved, groupRemovedSettled }).toEqual({
            initial: { headerRows: 1, vertical: '0px' },
            groupAdded: { headerRows: 2, visibilityChanges: 1 },
            groupAddedSettled: { vertical: `${scrollbarWidth}px` },
            groupRemoved: { headerRows: 1, visibilityChanges: 1 },
            groupRemovedSettled: { vertical: '0px' },
        });
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

    test('shows the vertical scrollbar the new layout needs before the slide ends, and keeps it while columns slide out', async () => {
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

        // The rows overflow once the horizontal scrollbar, not yet applied, takes its height.
        expect(verticalScrollbarWidth()).toBe(`${scrollbarWidth}px`);
        await vi.advanceTimersByTimeAsync(SCROLLBAR_APPLIED_MS);

        // Five columns (1000px) overflow the viewport, the horizontal scrollbar takes height and the rows overflow.
        expect({
            displayed: api.getAllDisplayedColumns().map((column) => column.getColId()),
            horizontal: horizontalScrollbar.style.height,
            vertical: verticalScrollbarWidth(),
        }).toEqual({
            displayed: ['x', 'y', 'z', 'a', 'b'],
            horizontal: `${scrollbarWidth}px`,
            vertical: `${scrollbarWidth}px`,
        });

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

    test('closes the gap right of the columns before the slide ends when columns fill the width, and opens it after the slide when columns leave', async () => {
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

        // Four columns (800px) fill the viewport: the gap is gone while the columns still slide.
        expect({ displayed: api.getAllDisplayedColumns().length, gap: hasHorizontalGap() }).toEqual({
            displayed: 4,
            gap: false,
        });
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

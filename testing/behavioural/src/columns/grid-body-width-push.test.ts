import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { afterEach, describe, expect, test } from 'vitest';

import type { AgEvent, ColDef, GridApi, GridSizeChangedEvent } from 'ag-grid-community';
import { CellSpanModule, ClientSideRowModelModule, ColumnApiModule, GridStateModule } from 'ag-grid-community';

const VIEWPORT_WIDTH = mockGridLayout.gridWidth;

const ROW_CONTAINER_SELECTORS = [
    '.ag-grid-scrolling-container',
    '.ag-grid-pinned-top-rows-container',
    '.ag-grid-pinned-bottom-rows-container',
    '.ag-grid-sticky-top-rows-container',
    '.ag-grid-sticky-bottom-rows-container',
];

const query = (selector: string): HTMLElement => {
    const element = document.querySelector<HTMLElement>(selector);
    expect(element, `Expected ${selector} to be rendered`).not.toBeNull();
    return element!;
};

/** Every element the grid body hands a width to, so a consumer that stops being pushed to shows up here. */
const pushedWidths = () => ({
    scrollableArea: query('.ag-grid-scrollable-area').style.width,
    rowContainers: ROW_CONTAINER_SELECTORS.map((selector) => query(selector).style.width),
    headerRows: Array.from(document.querySelectorAll<HTMLElement>('.ag-header-row'), (row) => row.style.width),
    horizontalScrollContainer: query('.ag-body-horizontal-scroll-container').style.width,
});

/** The containers stretch to the viewport when the columns do not fill it; the scrollbar tracks the columns. */
const expected = (containerWidth: number, columnsWidth: number, headerRowCount = 1) => ({
    scrollableArea: `${containerWidth}px`,
    rowContainers: ROW_CONTAINER_SELECTORS.map(() => `${containerWidth}px`),
    headerRows: new Array(headerRowCount).fill(`${containerWidth}px`),
    horizontalScrollContainer: `${columnsWidth}px`,
});

const buildCols = (count: number): ColDef[] => {
    const cols: ColDef[] = [];
    for (let i = 0; i < count; ++i) {
        cols.push({ colId: `c${i}`, field: `c${i}`, width: 100 });
    }
    return cols;
};

/** No public API resizes the grid element, and happy-dom has no ResizeObserver, so the event is the entry
 *  point. The payload is checked against the real event; only `dispatchEvent`'s base type needs the cast. */
const dispatchGridSizeChanged = (api: GridApi, width: number): void => {
    mockGridLayout.gridWidth = width;
    const event: Pick<GridSizeChangedEvent, 'type' | 'clientWidth' | 'clientHeight'> = {
        type: 'gridSizeChanged',
        clientWidth: width,
        clientHeight: mockGridLayout.gridHeight,
    };
    api.dispatchEvent(event as AgEvent);
};

describe('Grid body width push', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, GridStateModule],
    });
    const spanGridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, CellSpanModule],
    });

    afterEach(() => {
        mockGridLayout.gridWidth = VIEWPORT_WIDTH;
        gridsManager.reset();
        spanGridsManager.reset();
    });

    // The fake horizontal scrollbar is handed the content width net of the vertical scrollbar that the
    // end spacer already reserves in the viewport; the row containers are handed the gross width. With
    // no scrollbar the two coincide, so only a grid that has one can tell the arithmetic is there.
    test('takes the vertical scrollbar width off the fake horizontal scrollbar only', async () => {
        gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(15),
            rowData: [{ c0: 1 }],
            alwaysShowVerticalScroll: true,
            scrollbarWidth: 16,
        });
        await asyncSetTimeout(0);

        expect(pushedWidths()).toEqual(expected(1516, 1500));
    });

    test('stretches every container to the viewport when the columns do not fill it', async () => {
        gridsManager.createGrid('myGrid', { columnDefs: buildCols(3), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);

        expect(pushedWidths()).toEqual(expected(VIEWPORT_WIDTH, 300));
    });

    test('sizes every container to the columns once they overflow the viewport', async () => {
        gridsManager.createGrid('myGrid', { columnDefs: buildCols(15), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);

        expect(pushedWidths()).toEqual(expected(1500, 1500));
    });

    // `columnResized` is deliberately not a trigger, because the resize path reports the width change first.
    // Dropping the trigger that does cover it leaves every consumer on the pre-resize width.
    test('a column resize updates every container', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(15), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);
        expect(pushedWidths()).toEqual(expected(1500, 1500));

        api.setColumnWidths([{ key: 'c0', newWidth: 400 }]);
        await asyncSetTimeout(0);

        expect(pushedWidths()).toEqual(expected(1800, 1800));
    });

    test('hiding and showing columns moves every container between the two widths', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(15), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);

        const hidden = buildCols(15)
            .slice(2)
            .map((col) => col.colId!);
        api.setColumnsVisible(hidden, false);
        await asyncSetTimeout(0);
        expect(pushedWidths()).toEqual(expected(VIEWPORT_WIDTH, 200));

        api.setColumnsVisible(hidden, true);
        await asyncSetTimeout(0);
        expect(pushedWidths()).toEqual(expected(1500, 1500));
    });

    test('a viewport resize updates every container', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(3), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);
        expect(pushedWidths()).toEqual(expected(VIEWPORT_WIDTH, 300));

        dispatchGridSizeChanged(api, 1600);
        await asyncSetTimeout(0);
        expect(pushedWidths()).toEqual(expected(1600, 300));

        dispatchGridSizeChanged(api, 200);
        await asyncSetTimeout(0);
        expect(pushedWidths()).toEqual(expected(300, 300));
    });

    // The grid body is constructed before it is laid out, so the first measurement of the viewport is 0.
    // Treating that as a real width reports every pinned column as overflowing and collapses the
    // scrollable area to a single pixel until something forces a re-measure.
    test('a pre-layout measurement is not reused once the grid has a width', async () => {
        const columnDefs = buildCols(15);
        columnDefs[0].pinned = 'left';
        columnDefs[1].pinned = 'left';
        columnDefs[2].pinned = 'left';

        mockGridLayout.gridWidth = 0;
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);

        // A column change, deliberately not a resize: nothing here announces that the width is now known.
        mockGridLayout.gridWidth = VIEWPORT_WIDTH;
        api.moveColumnByIndex(5, 6);
        await asyncSetTimeout(0);

        expect(query('.ag-grid-scrollable-area').style.width).toBe('1500px');
        expect(query('.ag-grid-viewport').classList.contains('ag-pinned-columns-overflow')).toBe(false);
    });

    // Right-to-left reverses how scroll offsets are read and written, but the widths are direction-free,
    // so the same numbers must reach the same elements.
    test('pushes the same widths with enableRtl', async () => {
        gridsManager.createGrid('myGrid', { columnDefs: buildCols(15), rowData: [{ c0: 1 }], enableRtl: true });
        await asyncSetTimeout(0);

        expect(pushedWidths()).toEqual(expected(1500, 1500));
    });

    // Published for application CSS since 36.0.0, and nothing in the grid reads it back, so this is the
    // only thing that would notice it going missing.
    test('sets the pinned row border width variable on every row container', async () => {
        gridsManager.createGrid('myGrid', { columnDefs: buildCols(3), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);

        const values = ROW_CONTAINER_SELECTORS.map((selector) =>
            query(selector).style.getPropertyValue('--ag-pinned-row-border-width')
        );
        expect(values).toEqual(ROW_CONTAINER_SELECTORS.map(() => '1px'));
    });

    // The spanned-cell container sits beside the row container and is sized by the same push, so a width
    // that reaches one but not the other leaves spanned cells clipped.
    test('sizes the spanned cell containers alongside the row containers', async () => {
        spanGridsManager.createGrid('myGrid', {
            columnDefs: buildCols(15),
            rowData: [{ c0: 1 }],
            enableCellSpan: true,
        });
        await asyncSetTimeout(0);

        const spanned = Array.from(
            document.querySelectorAll<HTMLElement>('[class*="-spanned-cells-container"]'),
            (el) => el.style.width
        );
        expect(spanned.length).toBeGreaterThan(0);
        expect(spanned).toEqual(spanned.map(() => '1500px'));
    });

    // The scroll clamp reads the cached viewport width rather than measuring on every scroll event, so a
    // cache that never filled would leave the whole content width scrollable.
    test('clamps a restored scroll position to the columns that overflow the viewport', async () => {
        gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(15),
            rowData: [{ c0: 1 }],
            initialState: { scroll: { left: 5000, top: 0 } },
        });
        await asyncSetTimeout(0);

        expect(query('.ag-grid-viewport').scrollLeft).toBe(1500 - VIEWPORT_WIDTH);
    });

    // An unlaid-out grid measures 0, which is deliberately not cached, so every later check finds the same
    // unknown state. Reporting that as a change re-pushes to every consumer and re-fires the event.
    test('a grid with no layout reports its viewport width once, not on every check', async () => {
        mockGridLayout.gridWidth = 0;
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(15), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);

        let dispatches = 0;
        api.addGlobalListener((eventType) => {
            if (String(eventType) === 'gridViewportWidthChanged') {
                ++dispatches;
            }
        });

        // Two round trips through the viewport check, with the width still unknown throughout.
        api.setGridOption('alwaysShowVerticalScroll', true);
        await asyncSetTimeout(0);
        api.setGridOption('alwaysShowVerticalScroll', false);
        await asyncSetTimeout(0);

        expect(dispatches, 'gridViewportWidthChanged while the grid has no width').toBe(0);
    });

    // Group and floating-filter rows are created with the column set rather than with the grid body, so
    // they are sized from the last pushed width instead of measuring the viewport for themselves.
    test('a header group row created later is sized', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(15), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);
        expect(pushedWidths().headerRows).toEqual(['1500px']);

        api.setGridOption('columnDefs', [{ headerName: 'Group', children: buildCols(15) }]);
        await asyncSetTimeout(0);

        expect(pushedWidths()).toEqual(expected(1500, 1500, 2));
    });
});

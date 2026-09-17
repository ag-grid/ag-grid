import { TestGridsManager, asyncSetTimeout, dispatchGridSizeChanged } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { afterEach, describe, expect, test } from 'vitest';

import type { AgEvent, ColDef } from 'ag-grid-community';
import {
    CellSpanModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    GridStateModule,
    ScrollApiModule,
} from 'ag-grid-community';

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

describe('Grid body width push', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, GridStateModule, ScrollApiModule],
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

    // Both branches of the one `Math.max`: the containers stretch to the viewport while the columns are
    // narrower than it, and follow the columns once they overflow it.
    test('stretches every container to the viewport, then to the columns once they overflow it', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(3), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);
        expect(pushedWidths()).toEqual(expected(VIEWPORT_WIDTH, 300));

        api.setGridOption('columnDefs', buildCols(15));
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

        // The case the dropped `columnResized` trigger actually rests on: width moves between two columns
        // in one section, so `updateBodyWidths` early-returns and no width event is dispatched at all.
        // Every container has to stay on the width it already holds.
        api.setColumnWidths([
            { key: 'c0', newWidth: 200 },
            { key: 'c1', newWidth: 300 },
        ]);
        await asyncSetTimeout(0);

        // Without this the assertion below passes just as well if the resize did nothing at all.
        expect([api.getColumn('c0')?.getActualWidth(), api.getColumn('c1')?.getActualWidth()]).toEqual([200, 300]);
        expect(pushedWidths()).toEqual(expected(1800, 1800));
    });

    // The header row's pinned sections are sized from the column widths, not from the row width the grid
    // body pushes, so a resize that leaves the pushed width alone still has to reach them.
    test('resizes the header pinned sections when the columns change inside an unchanged container', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'p0', field: 'p0', width: 100, pinned: 'left' }, ...buildCols(3)],
            rowData: [{ c0: 1 }],
        });
        await asyncSetTimeout(0);

        const headerSections = () => ({
            pinnedLeft: query('.ag-header-row .ag-grid-pinned-left-cells').style.width,
            scrolling: query('.ag-header-row .ag-grid-scrolling-cells').style.width,
        });
        expect(headerSections()).toEqual({ pinnedLeft: '100px', scrolling: '300px' });

        // 500px of columns is still under the viewport, so the pushed container width does not move and
        // the push early-returns.
        api.setColumnWidths([{ key: 'c0', newWidth: 300 }]);
        await asyncSetTimeout(0);

        expect(query('.ag-grid-scrolling-container').style.width).toBe(`${VIEWPORT_WIDTH}px`);
        expect(headerSections()).toEqual({ pinnedLeft: '100px', scrolling: '500px' });
    });

    // A grid hidden by an ancestor measures 0. That is not a width: taken as one, every pinned column reads
    // as overflowing and the position is discarded. Losing the layout also clears the reported width, so
    // every later push re-measures the same 0 — the guard has to sit on the width, not on one path to it.
    test('keeps the scroll position when the grid loses its layout, and when the columns then change', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'p0', field: 'p0', width: 100, pinned: 'left' }, ...buildCols(15)],
            rowData: [{ c0: 1 }],
        });
        await asyncSetTimeout(0);
        api.ensureColumnVisible('c14');
        await asyncSetTimeout(0);

        const scrollLeft = query('.ag-grid-viewport').scrollLeft;
        expect(scrollLeft, 'the grid must be scrolled before it can lose the position').toBeGreaterThan(0);

        dispatchGridSizeChanged(api, 0);
        await asyncSetTimeout(0);
        expect(query('.ag-grid-viewport').scrollLeft, 'after losing the layout').toBe(scrollLeft);

        api.setColumnWidths([{ key: 'c0', newWidth: 300 }]);
        await asyncSetTimeout(0);
        expect(query('.ag-grid-viewport').scrollLeft, 'after a column change while still hidden').toBe(scrollLeft);
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

    // Published for application CSS, and nothing in the grid reads it back, so this is the only thing that
    // would notice it going missing. `stylesChanged` is its sole refresh path, so that is asserted too.
    test('sets the pinned row border width variable on every row container, and again on stylesChanged', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(3), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);

        const borderWidths = () =>
            ROW_CONTAINER_SELECTORS.map((selector) =>
                query(selector).style.getPropertyValue('--ag-pinned-row-border-width')
            );
        expect(borderWidths()).toEqual(ROW_CONTAINER_SELECTORS.map(() => '1px'));

        // Cleared behind the grid's back, so only a re-push can restore it.
        for (const selector of ROW_CONTAINER_SELECTORS) {
            query(selector).style.removeProperty('--ag-pinned-row-border-width');
        }
        expect(borderWidths()).toEqual(ROW_CONTAINER_SELECTORS.map(() => ''));

        api.dispatchEvent({ type: 'stylesChanged' } as AgEvent);
        await asyncSetTimeout(0);

        expect(borderWidths()).toEqual(ROW_CONTAINER_SELECTORS.map(() => '1px'));
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
        // The count is pinned too: comparing the array against one derived from itself would pass if the
        // spanned containers dropped to one. Three of the five row containers have one.
        expect(spanned).toEqual(['1500px', '1500px', '1500px']);
    });

    // The scrollable range is worked out from the column widths and the viewport width rather than read
    // back as `scrollWidth`, so a viewport width that never arrived leaves the whole content scrollable.
    test('clamps a restored scroll position to the columns that overflow the viewport', async () => {
        gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(15),
            rowData: [{ c0: 1 }],
            initialState: { scroll: { left: 5000, top: 0 } },
        });
        await asyncSetTimeout(0);

        expect(query('.ag-grid-viewport').scrollLeft).toBe(1500 - VIEWPORT_WIDTH);
    });

    // A resize reaches the grid asynchronously, so an api call can land while the last width the grid was
    // told is the pre-resize one. Answering from it scrolls to the wrong place, or nowhere: a column that
    // is off-screen at 200px is comfortably inside a viewport believed to be 1000px wide.
    test('ensureColumnVisible measures a viewport that has resized without reporting it', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(15), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);
        expect(query('.ag-grid-viewport').scrollLeft).toBe(0);

        mockGridLayout.gridWidth = 200;
        api.ensureColumnVisible('c5');

        // c5 spans 500 to 600, so the 200px viewport has to start at 400 to bring its end into view.
        expect(query('.ag-grid-viewport').scrollLeft).toBe(400);
    });

    // The same timing window in the other direction: after a grow, the requested column can already fit in
    // the measured viewport, so no scroll event arrives to refresh the virtual columns. The synchronous
    // refresh inside ensureColumnVisible must therefore use that measurement rather than the last report.
    test('ensureColumnVisible renders a column exposed by an unreported viewport grow', async () => {
        mockGridLayout.gridWidth = 200;
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(15),
            rowData: [{ c0: 1 }],
            suppressColumnVirtualisation: false,
        });
        await asyncSetTimeout(0);

        // Establish the initial 200px virtual window through the public path used by the assertion below.
        dispatchGridSizeChanged(api, 200);
        api.ensureColumnVisible('c0');
        const virtualColumnIds = () => api.getAllDisplayedVirtualColumns().map((col) => col.getColId());
        expect(virtualColumnIds()).not.toContain('c9');

        mockGridLayout.gridWidth = 1000;
        api.ensureColumnVisible('c9');

        // c9 spans 900 to 1000, so it needs no scroll but must be rendered before the API returns.
        expect(query('.ag-grid-viewport').scrollLeft).toBe(0);
        expect(virtualColumnIds()).toContain('c9');
    });

    // Container widths sized from the last reported width are re-pushed when the next report arrives, so
    // they can lag it harmlessly. Discarding the scroll position cannot be taken back that way, so the
    // pinned overflow that discards it is decided on the layout as it is.
    test('does not drop the scroll position for an overflow only the last reported width shows', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(30), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);

        query('.ag-grid-viewport').scrollLeft = 500;
        await asyncSetTimeout(0);

        // Twice the width it last reported, so 10 pinned columns overflow that and not the viewport.
        mockGridLayout.gridWidth = 2 * VIEWPORT_WIDTH;
        api.setColumnsPinned(['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'], 'left');
        await asyncSetTimeout(0);

        // The width, not the position: a container narrower than the viewport is what makes the browser
        // clamp, and jsdom stores `scrollLeft` unclamped, so only the width tells the two apart here.
        expect(query('.ag-grid-scrollable-area').style.width).toBe('3000px');
        expect(query('.ag-grid-viewport').scrollLeft).toBe(500);
    });

    // An unlaid-out grid measures 0, which is deliberately not cached, so every later check finds the same
    // unknown state. Reporting that as a change re-pushes to every consumer and re-fires the event.
    test('a grid with no layout does not report a width it does not have', async () => {
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

        // The control, without which the zero above is equally satisfied by the check never running.
        dispatchGridSizeChanged(api, 800);
        await asyncSetTimeout(0);
        expect(dispatches, 'gridViewportWidthChanged once the grid has a width').toBe(1);
    });

    // The event has no listener inside the grid and is kept only for applications that registered for it,
    // so what they can observe is pinned here. The initial width is adopted inside `createGrid`, before
    // any listener can be attached, so a resize is the first report anyone sees — and a report that
    // repeats the last width is not a change.
    test('reports a resized viewport width, and stays silent when the width repeats', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(3), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);

        // `addGlobalListener`, because the event is excluded from the public event-name union.
        let dispatches = 0;
        api.addGlobalListener((eventType) => {
            if (String(eventType) === 'gridViewportWidthChanged') {
                ++dispatches;
            }
        });

        dispatchGridSizeChanged(api, 600);
        await asyncSetTimeout(0);
        expect(dispatches, 'dispatches after a resize').toBe(1);

        dispatchGridSizeChanged(api, 600);
        await asyncSetTimeout(0);
        expect(dispatches, 'dispatches after a no-op resize').toBe(1);

        dispatchGridSizeChanged(api, 1200);
        await asyncSetTimeout(0);
        expect(dispatches, 'dispatches after a second real resize').toBe(2);
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

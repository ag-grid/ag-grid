import {
    TestGridsManager,
    asyncSetTimeout,
    installMockResizeObserver,
    mockGridLayout,
    nextAnimationFrame,
    polyfillOffsetParent,
    triggerResizeObservers,
} from 'ag-test-utils';
import { afterEach, describe, expect, test } from 'vitest';

import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    PinnedRowModule,
    RowAutoHeightModule,
    ScrollApiModule,
} from 'ag-grid-community';

const buildCols = (count: number): ColDef[] => {
    const cols: ColDef[] = [];
    for (let i = 0; i < count; ++i) {
        cols.push({ colId: `c${i}`, field: `c${i}` });
    }
    return cols;
};

/** These counts are exact, so work queued either side of the window has to be finished before it opens
 *  and before it closes. happy-dom schedules `requestAnimationFrame` on `setImmediate`, which a
 *  `setTimeout(0)` does not reliably drain — under load the frame lands inside the count instead. */
const settle = async (): Promise<void> => {
    await nextAnimationFrame();
    await asyncSetTimeout(0);
};

/** Counts reads of a layout property on one element — each one forces a layout in a browser. */
const countPropertyReads = async (
    el: Element,
    prop: 'clientHeight' | 'scrollLeft',
    act: () => void
): Promise<number> => {
    let owner = Object.getPrototypeOf(el);
    let descriptor = Object.getOwnPropertyDescriptor(owner, prop);
    while (!descriptor && owner) {
        owner = Object.getPrototypeOf(owner);
        descriptor = owner ? Object.getOwnPropertyDescriptor(owner, prop) : undefined;
    }
    expect(descriptor?.get, `${prop} should be readable`).toBeDefined();

    await settle();

    const original = descriptor!;
    let reads = 0;
    Object.defineProperty(owner, prop, {
        ...original,
        get(this: Element) {
            if (this === el) {
                ++reads;
            }
            return original.get!.call(this);
        },
    });

    try {
        act();
        await settle();
    } finally {
        Object.defineProperty(owner, prop, original);
    }
    return reads;
};

/** Counts header-row rebuilds. `getColumnHeadersToRender` has one caller, which runs it once per pinned
 *  section, so the section reads divide by three. */
const countHeaderRebuilds = async (api: GridApi, act: () => void): Promise<number> => {
    await settle();

    const colViewport = (api.getDisplayedRowAtIndex(0) as any).beans.colViewport;
    const original = colViewport.getColumnHeadersToRender;
    let sectionReads = 0;
    colViewport.getColumnHeadersToRender = function (this: unknown, ...args: unknown[]) {
        ++sectionReads;
        return original.apply(this, args);
    };

    try {
        act();
        await settle();
    } finally {
        colViewport.getColumnHeadersToRender = original;
    }
    return sectionReads / 3;
};

/** Counts `getComputedStyle` on the grid viewport — each one forces a style recalculation in a browser.
 *  Matched by class, not identity, so it also counts a grid created inside `act`. */
const countViewportMeasurements = async (act: () => void): Promise<number> => {
    await settle();

    const original = window.getComputedStyle;
    let count = 0;
    window.getComputedStyle = function (this: Window, ...args: Parameters<typeof original>) {
        if ((args[0] as HTMLElement)?.classList?.contains('ag-grid-viewport')) {
            ++count;
        }
        return original.apply(this, args);
    } as typeof original;

    try {
        act();
        await settle();
    } finally {
        window.getComputedStyle = original;
    }
    return count;
};

/** The mock never clamps above 0 (and reads `clientWidth` as 0): emulate the browser on this element. */
const clampScrollLeftLikeABrowser = (viewport: HTMLElement): void => {
    let owner = Object.getPrototypeOf(viewport);
    let descriptor = Object.getOwnPropertyDescriptor(owner, 'scrollLeft');
    while (!descriptor && owner) {
        owner = Object.getPrototypeOf(owner);
        descriptor = owner ? Object.getOwnPropertyDescriptor(owner, 'scrollLeft') : undefined;
    }
    const original = descriptor!;
    Object.defineProperty(viewport, 'scrollLeft', {
        configurable: true,
        get(this: HTMLElement) {
            const max = Math.max(0, this.scrollWidth - this.getBoundingClientRect().width);
            return Math.min(original.get!.call(this), max);
        },
        set(this: HTMLElement, value: number) {
            original.set!.call(this, value);
        },
    });
};

/** happy-dom stores no negative scrollLeft: keep the RTL value on the element, clamped on read. */
const clampRtlScrollLeftLikeABrowser = (viewport: HTMLElement, initial: number): void => {
    let stored = initial;
    Object.defineProperty(viewport, 'scrollLeft', {
        configurable: true,
        get(this: HTMLElement) {
            const min = -Math.max(0, this.scrollWidth - this.getBoundingClientRect().width);
            return Math.max(Math.min(stored, 0), min);
        },
        set(value: number) {
            stored = value;
        },
    });
};

/** Records every value written to an element's scrollLeft. */
const recordScrollLeftWrites = (el: HTMLElement): number[] => {
    const writes: number[] = [];
    Object.defineProperty(el, 'scrollLeft', {
        configurable: true,
        get: () => writes[writes.length - 1] ?? 0,
        set: (value: number) => void writes.push(value),
    });
    return writes;
};

describe('Column refresh layout reads', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, PinnedRowModule, ScrollApiModule],
    });
    afterEach(() => gridsManager.reset());

    // A refresh changes the columns, not the viewport, and everything it sizes is re-pushed when the
    // reported width changes — so no caller has to measure.
    test('a column refresh does not measure the viewport', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(50),
            rowData: [{ c0: 1 }],
        });
        await asyncSetTimeout(0);

        // Each count is only good news if the call it wrapped actually did something, and a column count
        // cannot show that: hiding then showing returns to 50 either way, and a move never changes it.
        const onMove = await countViewportMeasurements(() => api.moveColumnByIndex(0, 10));
        expect(api.getAllDisplayedColumns()[10].getColId()).toBe('c0');

        const onReset = await countViewportMeasurements(() => api.resetColumnState());
        expect(api.getAllDisplayedColumns()[0].getColId()).toBe('c0');

        const ids = api.getAllGridColumns().map((col) => col.getColId());
        const onHide = await countViewportMeasurements(() => api.setColumnsVisible(ids, false));
        expect(api.getAllDisplayedColumns()).toHaveLength(0);

        const onShow = await countViewportMeasurements(() => api.setColumnsVisible(ids, true));
        expect(api.getAllDisplayedColumns()).toHaveLength(50);

        expect({ onMove, onReset, onHide, onShow }).toEqual({ onMove: 0, onReset: 0, onHide: 0, onShow: 0 });
    });

    // A body width change moves every `left`: one extraction serves both the viewport update and the refresh.
    test('a column refresh changing the body width extracts the virtual columns once', async () => {
        // The suite suppresses column virtualisation, which skips the filtering this counts.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(50),
            rowData: [{ c0: 1 }],
            suppressColumnVirtualisation: false,
        });
        await asyncSetTimeout(0);

        // Far outside the viewport, so the renderer never asks where it is and the extraction is the
        // only thing that does.
        const column = api.getColumn('c40');
        expect(column, 'c40 should be a grid column').not.toBeNull();
        expect(api.getAllDisplayedVirtualColumns().map((col) => col.getColId())).not.toContain('c40');

        let leftReads = 0;
        const getLeft = column!.getLeft.bind(column);
        column!.getLeft = () => {
            ++leftReads;
            return getLeft();
        };

        try {
            // Narrows the body, unlike a move, which reorders the same total width and so arms nothing.
            api.setColumnsVisible(['c1'], false);
            await asyncSetTimeout(0);

            // One pass builds the rendered and header sets; every later ask reads the recorded layout version.
            expect(leftReads, 'getLeft calls on one unrendered column').toBe(1);
        } finally {
            column!.getLeft = getLeft;
        }
    });

    test('the rendered columns are those within 200px of the viewport, a column touching that edge included', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(30),
            rowData: [{ c0: 1 }],
            suppressColumnVirtualisation: false,
        });
        await asyncSetTimeout(0);
        const rendered = () => api.getAllDisplayedVirtualColumns().map((col) => col.getColId());
        const scrollTo = async (left: number) => {
            const viewport = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-grid-viewport')!;
            viewport.scrollLeft = left;
            viewport.dispatchEvent(new Event('scroll'));
            await asyncSetTimeout(0);
        };

        // 1000px of viewport and 200px columns: c6 starts on the right edge, 1200px
        expect(rendered()).toEqual(['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6']);
        // c0 ends on the left edge, 200px, and c8 starts on the right one, 1600px
        await scrollTo(400);
        expect(rendered()).toEqual(['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8']);
        // the last of them, c23 ending on the left edge, 4800px
        await scrollTo(5000);
        expect(rendered()).toEqual(['c23', 'c24', 'c25', 'c26', 'c27', 'c28', 'c29']);
    });

    test('a column made autoHeight by a columnDefs update stays rendered wherever the viewport is', async () => {
        const api = gridsManager.createGrid(
            'myGrid',
            { columnDefs: buildCols(30), rowData: [{ c0: 1 }], suppressColumnVirtualisation: false },
            { modules: [RowAutoHeightModule] }
        );
        await asyncSetTimeout(0);
        expect(api.getAllDisplayedVirtualColumns().map((col) => col.getColId())).not.toContain('c25');

        const columnDefs = buildCols(30);
        columnDefs[25] = { colId: 'c25', field: 'c25', autoHeight: true };
        api.setGridOption('columnDefs', columnDefs);
        await asyncSetTimeout(0);

        expect(api.getAllDisplayedVirtualColumns().map((col) => col.getColId())).toContain('c25');
    });

    test('group headers keep every autoHeaderHeight column the rendered columns leave out, across a scroll', async () => {
        const columnDefs: (ColDef | ColGroupDef)[] = buildCols(30);
        for (const index of [28, 25]) {
            columnDefs[index] = {
                groupId: `g${index}`,
                headerName: `g${index}`,
                children: [{ colId: `c${index}`, autoHeaderHeight: true }],
            };
        }
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ c0: 1 }],
            suppressColumnVirtualisation: false,
        });
        await asyncSetTimeout(0);
        const root = TestGridsManager.getHTMLElement(api)!;
        const groupHeaders = () =>
            Array.from(root.querySelectorAll('.ag-header-group-cell'), (el) => el.textContent?.trim()).filter(
                (name) => name === 'g25' || name === 'g28'
            );

        expect(api.getAllDisplayedVirtualColumns().map((col) => col.getColId())).not.toContain('c25');
        expect(groupHeaders()).toEqual(['g25', 'g28']);

        // a scroll that renders the same columns keeps the same header set
        const viewport = root.querySelector<HTMLElement>('.ag-grid-viewport')!;
        viewport.scrollLeft = 10;
        viewport.dispatchEvent(new Event('scroll'));
        await asyncSetTimeout(0);
        expect(groupHeaders()).toEqual(['g25', 'g28']);

        // the last one hidden leaves the others as they were
        api.setColumnsVisible(['c28'], false);
        await asyncSetTimeout(0);
        expect(groupHeaders()).toEqual(['g25']);
    });

    test('an autoHeight column the viewport leaves out stays rendered, so its row height can be measured', async () => {
        const columnDefs = buildCols(30);
        columnDefs[25] = { colId: 'c25', field: 'c25', autoHeight: true };
        const api = gridsManager.createGrid(
            'myGrid',
            { columnDefs, rowData: [{ c0: 1 }], suppressColumnVirtualisation: false },
            { modules: [RowAutoHeightModule] }
        );
        await asyncSetTimeout(0);

        const rendered = api.getAllDisplayedVirtualColumns().map((col) => col.getColId());
        expect(rendered).toContain('c25');
        expect(rendered).not.toContain('c24');

        // a col span sends each row through its own pick of the columns, which keeps it too
        const spanned = buildCols(30);
        spanned[0] = { colId: 'c0', field: 'c0', colSpan: () => 1 };
        spanned[25] = { colId: 'c25', field: 'c25', autoHeight: true };
        api.setGridOption('columnDefs', spanned);
        await asyncSetTimeout(0);
        const root = TestGridsManager.getHTMLElement(api)!;
        expect(root.querySelector('.ag-row .ag-cell[col-id="c25"]')).not.toBeNull();
        expect(root.querySelector('.ag-row .ag-cell[col-id="c24"]')).toBeNull();
    });

    // The fake vertical scrollbar re-reads the viewport height to size its container, and one pinned-row
    // change raises `pinnedRowsChanged`, `pinnedHeightChanged` and `pinnedRowDataChanged`. Exact, not a
    // bound: without the coalescing each of those syncs separately and reads again.
    test('several events reporting one pinned-row change sync the scrollbar height once', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(50),
            rowData: [{ c0: 1 }],
            pinnedTopRowData: [{ c0: 'top' }],
        });
        await asyncSetTimeout(0);

        // The fake scrollbar's own viewport, which only `syncContainerHeight` reads, so this counts syncs
        // rather than every height read the change provokes.
        const fakeScrollViewport = document.querySelector('.ag-body-vertical-scroll-viewport') as HTMLElement;
        expect(fakeScrollViewport, 'fake vertical scroll viewport should be rendered').not.toBeNull();

        const syncs = await countPropertyReads(fakeScrollViewport, 'clientHeight', () =>
            api.setGridOption('pinnedTopRowData', [{ c0: 'a' }, { c0: 'b' }])
        );

        expect(syncs, 'fake vertical scrollbar height syncs').toBe(1);
        expect(api.getPinnedTopRowCount(), 'the pinned-row change this counted must have landed').toBe(2);
    });

    // Narrowing lets a browser clamp `scrollLeft`, seen only by a read after the widths are pushed: one read then.
    test('a column refresh reads the scroll position once after it pushes new widths, and not without them', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(50),
            rowData: [{ c0: 1 }],
        });
        await asyncSetTimeout(0);

        const viewport = document.querySelector('.ag-grid-viewport') as HTMLElement;
        expect(viewport, 'grid viewport should be rendered').not.toBeNull();

        const onMove = await countPropertyReads(viewport, 'scrollLeft', () => api.moveColumnByIndex(0, 10));
        expect(onMove, 'scrollLeft reads on a column move').toBe(0);

        const ids = api.getAllGridColumns().map((col) => col.getColId());
        const onHide = await countPropertyReads(viewport, 'scrollLeft', () => api.setColumnsVisible(ids, false));
        expect(onHide, 'scrollLeft reads on hiding every column').toBe(1);
    });

    // A browser clamps `scrollLeft` once the narrowed widths are pushed, seen only by a read after that push.
    test('narrowing the columns while scrolled to the far right renders the columns around the clamped position', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(30),
            rowData: [{ c0: 1 }],
            suppressColumnVirtualisation: false,
        });
        await asyncSetTimeout(0);

        const viewport = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-grid-viewport')!;
        api.ensureColumnVisible('c29');
        await asyncSetTimeout(0);
        expect(viewport.scrollLeft, 'the far right of 30 columns of 200px').toBe(5000);

        clampScrollLeftLikeABrowser(viewport);
        const rendered = () => api.getAllDisplayedVirtualColumns().map((col) => col.getColId());
        const narrowed = Array.from({ length: 20 }, (_, i) => `c${i + 10}`);

        try {
            // each read straight after the call: no scroll event has been delivered
            api.setColumnWidths(narrowed.map((key) => ({ key, newWidth: 40 })));
            // 2800px of columns and a 1000px viewport clamp to 1800px: 1600px to 3000px, c7 ending on its edge
            expect(viewport.scrollLeft, 'clamped after the widths').toBe(1800);
            expect(rendered()).toEqual(Array.from({ length: 23 }, (_, i) => `c${i + 7}`));

            api.setColumnsVisible(narrowed, false);
            // 2000px of columns clamp to 1000px: 800px to 2200px, c3 ending on its edge
            expect(viewport.scrollLeft, 'clamped after the hide').toBe(1000);
            expect(rendered()).toEqual(['c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9']);
        } finally {
            delete (viewport as { scrollLeft?: number }).scrollLeft;
        }
    });

    test('narrowing the columns while scrolled to the far end in RTL syncs the scrollbar to the clamped position', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(30),
            rowData: [{ c0: 1 }],
            suppressColumnVirtualisation: false,
            enableRtl: true,
        });
        await asyncSetTimeout(0);

        const root = TestGridsManager.getHTMLElement(api)!;
        const viewport = root.querySelector<HTMLElement>('.ag-grid-viewport')!;
        const scrollbar = root.querySelector<HTMLElement>('.ag-body-horizontal-scroll-viewport')!;
        const narrowed = Array.from({ length: 20 }, (_, i) => `c${i + 10}`);
        clampRtlScrollLeftLikeABrowser(viewport, 0);

        try {
            api.ensureColumnVisible('c29');
            await asyncSetTimeout(0);
            expect(viewport.scrollLeft, 'the far end of 30 columns of 200px in RTL').toBe(-5000);

            const scrollbarWrites = recordScrollLeftWrites(scrollbar);
            // each read straight after the call: no scroll event has been delivered
            api.setColumnWidths(narrowed.map((key) => ({ key, newWidth: 40 })));
            // 2800px of columns and a 1000px viewport clamp to -1800px
            expect({
                viewport: viewport.scrollLeft,
                scrollbarWrites,
                rendered: api.getAllDisplayedVirtualColumns().map((col) => col.getColId()),
            }).toEqual({
                viewport: -1800,
                scrollbarWrites: [-1800],
                rendered: Array.from({ length: 23 }, (_, i) => `c${i + 7}`),
            });
        } finally {
            delete (viewport as { scrollLeft?: number }).scrollLeft;
            delete (scrollbar as { scrollLeft?: number }).scrollLeft;
        }
    });

    // What is left is the viewport checks that deliberately measure and report, each resolving one style
    // for both axes. An exact count, so a consumer going back to measuring for itself fails here — and so
    // does the grid stopping measuring at all, which the scrollbar and pinned-overflow rules depend on.
    test('creating a grid measures the viewport an exact number of times', async () => {
        let api: GridApi | undefined;
        const reads = await countViewportMeasurements(() => {
            api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(50), rowData: [{ c0: 1 }] });
        });

        expect(reads, 'getComputedStyle on the grid viewport').toBe(4);
        expect(api!.getAllDisplayedColumns(), 'the grid this counted must have built its columns').toHaveLength(50);
    });

    // A scroll handler already holds the position it just read and clamped, so the consumers it drives
    // should be handed it rather than reading it back out of the DOM.
    test('a horizontal scroll reads the scroll position exactly three times', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(200), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);
        api.ensureColumnVisible('c60');
        await asyncSetTimeout(0);

        const viewport = document.querySelector('.ag-grid-viewport') as HTMLElement;
        expect(viewport, 'grid viewport should be rendered').not.toBeNull();

        const reads = await countPropertyReads(viewport, 'scrollLeft', () => api.ensureColumnVisible('c120'));

        expect(reads, 'grid viewport scrollLeft reads').toBe(3);
        expect(viewport.scrollLeft, 'the scroll this counted must have moved').toBeGreaterThan(0);
    });

    // Pinning changes how much of the viewport the pinned sections claim, and the rule that keeps them
    // narrower than it hides columns to enforce itself. That outcome is kept, so it measures.
    test('a column refresh with pinned columns measures only to keep them inside the viewport', async () => {
        const columnDefs = buildCols(50);
        columnDefs[0].pinned = 'left';
        columnDefs[1].pinned = 'right';

        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);

        const onMove = await countViewportMeasurements(() => api.moveColumnByIndex(5, 10));
        const onPin = await countViewportMeasurements(() => api.setColumnsPinned(['c2', 'c3'], 'left'));

        expect({ onMove, onPin }).toEqual({ onMove: 0, onPin: 1 });
    });

    // The resize observer reports one new size, and every step of that frame (pinned limits, flex, scrollbars)
    // reads it from one measurement rather than measuring for itself.
    test('a viewport resize with pinned columns measures the viewport once per resize callback', async () => {
        const columnDefs = buildCols(50).map((col) => ({ ...col, flex: 1, minWidth: 1 }));
        columnDefs[0].pinned = 'left';
        columnDefs[1].pinned = 'right';

        const originalGridWidth = mockGridLayout.gridWidth;
        // `_isInDOM` tests offsetParent, and the container-resize path returns early without one.
        const restoreOffsetParent = polyfillOffsetParent();
        const uninstallResizeObserver = installMockResizeObserver();
        try {
            const api = gridsManager.createGrid('myGrid', { columnDefs, rowData: [{ c0: 1 }] });
            await asyncSetTimeout(0);
            const columnsWidth = () =>
                api.getAllDisplayedColumns().reduce((total, col) => total + col.getActualWidth(), 0);
            const widthBefore = columnsWidth();
            expect(widthBefore, 'the flex columns fill the 1000px viewport').toBe(1000);

            const reads = await countViewportMeasurements(() => {
                mockGridLayout.gridWidth = 1200;
                triggerResizeObservers();
            });

            expect(columnsWidth(), 'the resize this counted must have been delivered and flexed').toBe(1200);
            // the grid's size change and the viewport's own resize frame, each measuring once
            expect(reads, 'getComputedStyle on the grid viewport').toBe(2);
        } finally {
            mockGridLayout.gridWidth = originalGridWidth;
            uninstallResizeObserver();
            restoreOffsetParent();
        }
    });

    // A flexed width is kept on the column and escapes as `columnResized`, so the flex pass measures
    // rather than reading the last report: a resize that has not been observed yet would otherwise flex
    // every column to the pre-resize viewport. That is one measurement a flex grid cannot avoid.
    test('a column refresh with a flex column measures once, where the same grid without flex measures none', async () => {
        const flexCols = buildCols(20);
        flexCols[0].flex = 1;

        const plain = gridsManager.createGrid('plain', { columnDefs: buildCols(20), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);
        const withoutFlex = await countViewportMeasurements(() => plain.moveColumnByIndex(0, 10));
        gridsManager.reset();

        const flexed = gridsManager.createGrid('flexed', { columnDefs: flexCols, rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);
        const onMove = await countViewportMeasurements(() => flexed.moveColumnByIndex(0, 10));
        const onHide = await countViewportMeasurements(() => flexed.setColumnsVisible(['c5'], false));

        expect({ withoutFlex, onMove, onHide }).toEqual({ withoutFlex: 0, onMove: 1, onHide: 1 });
        expect(flexed.getAllDisplayedColumns(), 'the refresh this counted must have happened').toHaveLength(19);
    });

    // One column change raises `virtualColumnsChanged` and then `displayedColumnsChanged`, and both reach
    // every header row. The second has to find the rendered sections unmoved and return.
    test('a column refresh rebuilds each header row once, not once per event that reports it', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(20), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);

        const onHide = await countHeaderRebuilds(api, () => api.setColumnsVisible(['c5'], false));
        const onMove = await countHeaderRebuilds(api, () => api.moveColumnByIndex(0, 10));

        expect({ onHide, onMove }).toEqual({ onHide: 1, onMove: 1 });
        expect(api.getAllDisplayedColumns(), 'the refresh this counted must have happened').toHaveLength(19);
    });
});

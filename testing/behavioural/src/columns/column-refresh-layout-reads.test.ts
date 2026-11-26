import {
    TestGridsManager,
    asyncSetTimeout,
    mockGridLayout,
    nextAnimationFrame,
    triggerResizeObservers,
} from 'ag-test-utils';
import { afterEach, describe, expect, onTestFinished, test, vi } from 'vitest';

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
        // grid timers re-reading the layout (a slide's end, the scrollbar debounce) stay out of counts on a fake clock
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        onTestFinished(() => {
            vi.useRealTimers();
        });
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(50),
            rowData: [{ c0: 1 }],
        });
        await vi.runAllTimersAsync();

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

    test('header cells sliding in together force one style computation, not one each', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        onTestFinished(() => {
            vi.useRealTimers();
        });
        // columns far outside the viewport render no header cell, and get one sliding in when moved into view
        const moved = ['c40', 'c41', 'c42', 'c43'];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(60),
            rowData: [{ c0: 1 }],
            suppressColumnVirtualisation: false,
        });
        await vi.runAllTimersAsync();
        const root = TestGridsManager.getHTMLElement(api)!;
        const headerCell = (id: string) => root.querySelector<HTMLElement>(`.ag-header-cell[col-id="${id}"]`);
        expect(
            moved.map((id) => headerCell(id)),
            'the columns outside the viewport render no header cell yet'
        ).toEqual(moved.map(() => null));

        const spy = vi.spyOn(window, 'getComputedStyle');
        onTestFinished(() => {
            spy.mockRestore();
        });

        api.moveColumns(moved, 0);
        const placedAtOldLeft = moved.map((id) => headerCell(id)?.style.left);
        spy.mockClear();
        await vi.advanceTimersByTimeAsync(0);

        const headerStyleComputations = () =>
            spy.mock.calls.filter(([el]) => el.classList.contains('ag-header-cell')).length;
        const styleComputations = headerStyleComputations();
        const slidIn = moved.map((id) => headerCell(id)?.style.left);

        // a later slide computes the styles again
        await vi.runAllTimersAsync();
        spy.mockClear();
        api.moveColumns(['c55', 'c56'], 0);
        await vi.advanceTimersByTimeAsync(0);
        const nextSlide = { left: headerCell('c56')?.style.left, styleComputations: headerStyleComputations() };

        // moved into view while that slide still runs: placed and moved in one go, so it computes its own
        spy.mockClear();
        api.moveColumns(['c50'], 0);
        const duringSlide = { left: headerCell('c50')?.style.left, styleComputations: headerStyleComputations() };

        expect({ placedAtOldLeft, slidIn, styleComputations, nextSlide, duringSlide }).toEqual({
            placedAtOldLeft: ['8000px', '8200px', '8400px', '8600px'],
            slidIn: ['0px', '200px', '400px', '600px'],
            styleComputations: 1,
            nextSlide: { left: '200px', styleComputations: 1 },
            duringSlide: { left: '0px', styleComputations: 1 },
        });
    });

    test('turning column move animation off places a header cell that was sliding in at once', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        onTestFinished(() => {
            vi.useRealTimers();
        });
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(60),
            rowData: [{ c0: 1 }],
            suppressColumnVirtualisation: false,
        });
        await vi.runAllTimersAsync();
        const headerLeft = () =>
            TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-header-cell[col-id="c40"]')?.style
                .left;

        api.moveColumns(['c40'], 0);
        const sliding = headerLeft();
        api.setGridOption('suppressColumnMoveAnimation', true);

        expect({ sliding, placed: headerLeft() }).toEqual({ sliding: '8000px', placed: '0px' });
    });

    // One scrollbar check reads the clientHeight of a viewport with no height, as the mocked one here, twice.
    test('the scrollbar check runs only when columns move, once for all the passes of one slide', async () => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        onTestFinished(() => {
            vi.useRealTimers();
        });
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(50),
            rowData: [{ c0: 1 }],
        });
        await vi.runAllTimersAsync();
        const viewport = document.querySelector<HTMLElement>('.ag-grid-viewport')!;
        let owner = Object.getPrototypeOf(viewport);
        while (!Object.getOwnPropertyDescriptor(owner, 'clientHeight')) {
            owner = Object.getPrototypeOf(owner);
        }
        const original = Object.getOwnPropertyDescriptor(owner, 'clientHeight')!;
        let reads = 0;
        Object.defineProperty(owner, 'clientHeight', {
            ...original,
            get(this: Element) {
                if (this === viewport) {
                    ++reads;
                }
                return original.get!.call(this);
            },
        });
        onTestFinished(() => {
            Object.defineProperty(owner, 'clientHeight', original);
        });
        const take = () => {
            const taken = reads;
            reads = 0;
            return taken;
        };

        api.setGridOption(
            'columnDefs',
            buildCols(50).map((col) => ({ ...col, headerName: `H ${col.colId}` }))
        );
        await vi.runAllTimersAsync();
        const renamed = take();

        api.moveColumnByIndex(0, 10);
        api.moveColumnByIndex(1, 11);
        const slideCall = take();
        await vi.advanceTimersByTimeAsync(0);
        const slideNextTurn = take();
        await vi.advanceTimersByTimeAsync(200);
        const slideEnd = take();

        expect({
            header: api.getColumn('c0')!.getColDef().headerName,
            moved: api.getAllDisplayedColumns()[11].getColId(),
            renamed,
            slideCall,
            slideNextTurn,
            slideEnd,
        }).toEqual({ header: 'H c0', moved: 'c2', renamed: 0, slideCall: 0, slideNextTurn: 2, slideEnd: 2 });
    });

    // At the start a narrower layout cannot clamp `scrollLeft`; the clamp test below reads it scrolled.
    test('a column refresh reads no scroll position at the viewport start, a move or a width change alike', async () => {
        // grid timers re-reading the layout (a slide's end, the scrollbar debounce) stay out of counts on a fake clock
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        onTestFinished(() => {
            vi.useRealTimers();
        });
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(50),
            rowData: [{ c0: 1 }],
        });
        await vi.runAllTimersAsync();

        const viewport = document.querySelector<HTMLElement>('.ag-grid-viewport')!;
        expect(viewport, 'grid viewport should be rendered').not.toBeNull();

        const onMove = await countPropertyReads(viewport, 'scrollLeft', () => api.moveColumnByIndex(0, 10));
        expect(onMove, 'scrollLeft reads on a column move').toBe(0);

        const ids = api.getAllGridColumns().map((col) => col.getColId());
        const onHide = await countPropertyReads(viewport, 'scrollLeft', () => api.setColumnsVisible(ids, false));
        expect(onHide, 'scrollLeft reads on hiding every column').toBe(0);
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
            Reflect.deleteProperty(viewport, 'scrollLeft');
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
            Reflect.deleteProperty(viewport, 'scrollLeft');
            Reflect.deleteProperty(scrollbar, 'scrollLeft');
        }
    });

    // exact: one more measuring consumer fails it, and so does a grid that never measures (scrollbar, pinned overflow)
    test('creating a grid measures the viewport an exact number of times', async () => {
        await settle();
        const spy = vi.spyOn(window, 'getComputedStyle');
        const reads = () => spy.mock.calls.filter(([el]) => el.classList.contains('ag-grid-viewport')).length;
        try {
            const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(50), rowData: [{ c0: 1 }] });
            // 4 while created, then one per first resize report that measures (the grid's and the viewport's), each
            // a frame after the DOM change scheduling it: waited for, not timed
            await vi.waitFor(() => expect(reads(), 'getComputedStyle on the grid viewport').toBe(6));
            await settle();

            expect(reads(), 'no measure after the resize reports').toBe(6);
            expect(api.getAllDisplayedColumns(), 'the grid this counted must have built its columns').toHaveLength(50);
        } finally {
            spy.mockRestore();
        }
    });

    test('a grid created after another grid was created under fake timers still measures the viewport on its resize reports', async () => {
        vi.useFakeTimers();
        onTestFinished(() => {
            vi.useRealTimers();
        });
        gridsManager.createGrid('fakeTimersGrid', { columnDefs: buildCols(3), rowData: [{ c0: 1 }] });
        vi.useRealTimers();
        gridsManager.reset();

        const spy = vi.spyOn(window, 'getComputedStyle');
        const reads = () => spy.mock.calls.filter(([el]) => el.classList.contains('ag-grid-viewport')).length;
        try {
            gridsManager.createGrid('myGrid', { columnDefs: buildCols(50), rowData: [{ c0: 1 }] });
            // 4 while created, then one per first resize report that measures
            await vi.waitFor(() => expect(reads(), 'getComputedStyle on the grid viewport').toBe(6));
        } finally {
            spy.mockRestore();
        }
    });

    // A scroll handler already holds the position it just read and clamped, so the consumers it drives
    // should be handed it rather than reading it back out of the DOM.
    test('a horizontal scroll reads the scroll position exactly three times', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(200), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);
        api.ensureColumnVisible('c60');
        await asyncSetTimeout(0);

        const viewport = document.querySelector<HTMLElement>('.ag-grid-viewport')!;
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

    // With nothing left pinned there is no pinned section to keep inside the viewport.
    test('a pin change leaving no column pinned measures no viewport', async () => {
        const pinnedCols = () => {
            const columnDefs = buildCols(50);
            columnDefs[0].pinned = 'left';
            columnDefs[1].pinned = 'right';
            return columnDefs;
        };
        const pinned = (api: GridApi) => ({
            left: api.getDisplayedLeftColumns().map((col) => col.getColId()),
            right: api.getDisplayedRightColumns().map((col) => col.getColId()),
        });

        const byColumns = gridsManager.createGrid('byColumns', { columnDefs: pinnedCols(), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);
        expect(pinned(byColumns), 'the grid starts with one column pinned each side').toEqual({
            left: ['c0'],
            right: ['c1'],
        });
        const onUnpinColumns = await countViewportMeasurements(() => byColumns.setColumnsPinned(['c0', 'c1'], null));
        const afterUnpinColumns = pinned(byColumns);
        gridsManager.reset();

        const byState = gridsManager.createGrid('byState', { columnDefs: pinnedCols(), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);
        const onUnpinState = await countViewportMeasurements(() =>
            byState.applyColumnState({ defaultState: { pinned: null } })
        );

        expect({
            onUnpinColumns,
            onUnpinState,
            afterUnpinColumns,
            afterUnpinState: pinned(byState),
        }).toEqual({
            onUnpinColumns: 0,
            onUnpinState: 0,
            afterUnpinColumns: { left: [], right: [] },
            afterUnpinState: { left: [], right: [] },
        });
    });

    // The resize observer reports one new size, and every step of that frame (pinned limits, flex, scrollbars)
    // reads it from one measurement rather than measuring for itself.
    test('a viewport resize with pinned columns measures the viewport once per resize callback', async () => {
        const columnDefs = buildCols(50).map((col) => ({ ...col, flex: 1, minWidth: 1 }));
        columnDefs[0].pinned = 'left';
        columnDefs[1].pinned = 'right';

        const originalGridWidth = mockGridLayout.gridWidth;
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

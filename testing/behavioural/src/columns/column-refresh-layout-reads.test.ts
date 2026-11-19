import { TestGridsManager } from 'ag-test-utils';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

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

/** These counts are exact, so the file runs on a fake clock: every timer queued before a count is run out
 *  before it opens, however loaded the machine. */
const settle = async (): Promise<void> => {
    await vi.runAllTimersAsync();
};

const ONE_FRAME_MS = 16;

/** A count's two phases: the action and its next frame, then the timers it left, run out. */
interface PhaseCounts {
    firstFrame: number;
    deferred: number;
}

/** Counts reads of a layout property on one element — each one forces a layout in a browser. */
const countPropertyReads = async (
    el: Element,
    prop: 'clientHeight' | 'scrollLeft',
    act: () => void
): Promise<PhaseCounts> => {
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
        await vi.advanceTimersByTimeAsync(ONE_FRAME_MS);
        const firstFrame = reads;
        await settle();
        return { firstFrame, deferred: reads - firstFrame };
    } finally {
        Object.defineProperty(owner, prop, original);
    }
};

/** Counts `getComputedStyle` on the grid viewport — each one forces a style recalculation in a browser.
 *  Matched by class, not identity, so it also counts a grid created inside `act`. */
const countViewportMeasurements = async (act: () => void): Promise<PhaseCounts> => {
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
        await vi.advanceTimersByTimeAsync(ONE_FRAME_MS);
        const firstFrame = count;
        await settle();
        return { firstFrame, deferred: count - firstFrame };
    } finally {
        window.getComputedStyle = original;
    }
};

describe('Column refresh layout reads', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, PinnedRowModule, ScrollApiModule],
    });
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
    });
    afterEach(() => {
        gridsManager.reset();
        vi.useRealTimers();
    });

    // A refresh changes the columns, not the viewport, and everything it sizes is re-pushed when the
    // reported width changes — so no caller has to measure.
    test('a column refresh does not measure the viewport', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(50),
            rowData: [{ c0: 1 }],
        });
        await settle();

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

        // Hiding or showing every column changes the scroll width, which the horizontal scrollbar re-measures later.
        expect({ onMove, onReset, onHide, onShow }).toEqual({
            onMove: { firstFrame: 0, deferred: 0 },
            onReset: { firstFrame: 0, deferred: 0 },
            onHide: { firstFrame: 0, deferred: 1 },
            onShow: { firstFrame: 0, deferred: 1 },
        });
    });

    // A change to the body width moves every column's `left`, so the virtual-column extraction has to run
    // again, asking every centre column where it now is. Each row container asks for that on the same
    // change, and all but the first have nothing left to recompute.
    test('a column refresh extracts the virtual columns once, not once per row container', async () => {
        // The suite suppresses column virtualisation, which skips the filtering this counts.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(50),
            rowData: [{ c0: 1 }],
            suppressColumnVirtualisation: false,
        });
        await settle();

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
            await settle();

            // Two extractions, one per reported change, at one pass each: the rendered and header sets are
            // built together. Each row container asks as well, and is answered from the layout version the
            // extraction recorded rather than extracting again.
            expect(leftReads, 'getLeft calls on one unrendered column').toBe(2);
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
        await settle();
        const rendered = () => api.getAllDisplayedVirtualColumns().map((col) => col.getColId());
        const scrollTo = async (left: number) => {
            const viewport = TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-grid-viewport')!;
            viewport.scrollLeft = left;
            viewport.dispatchEvent(new Event('scroll'));
            await settle();
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
        await settle();
        expect(api.getAllDisplayedVirtualColumns().map((col) => col.getColId())).not.toContain('c25');

        const columnDefs = buildCols(30);
        columnDefs[25] = { colId: 'c25', field: 'c25', autoHeight: true };
        api.setGridOption('columnDefs', columnDefs);
        await settle();

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
        await settle();
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
        await settle();
        expect(groupHeaders()).toEqual(['g25', 'g28']);

        // the last one hidden leaves the others as they were
        api.setColumnsVisible(['c28'], false);
        await settle();
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
        await settle();

        const rendered = api.getAllDisplayedVirtualColumns().map((col) => col.getColId());
        expect(rendered).toContain('c25');
        expect(rendered).not.toContain('c24');

        // a col span sends each row through its own pick of the columns, which keeps it too
        const spanned = buildCols(30);
        spanned[0] = { colId: 'c0', field: 'c0', colSpan: () => 1 };
        spanned[25] = { colId: 'c25', field: 'c25', autoHeight: true };
        api.setGridOption('columnDefs', spanned);
        await settle();
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
        await settle();

        // The fake scrollbar's own viewport, which only `syncContainerHeight` reads, so this counts syncs
        // rather than every height read the change provokes.
        const fakeScrollViewport = document.querySelector('.ag-body-vertical-scroll-viewport') as HTMLElement;
        expect(fakeScrollViewport, 'fake vertical scroll viewport should be rendered').not.toBeNull();

        const syncs = await countPropertyReads(fakeScrollViewport, 'clientHeight', () =>
            api.setGridOption('pinnedTopRowData', [{ c0: 'a' }, { c0: 'b' }])
        );

        expect(syncs, 'fake vertical scrollbar height syncs').toEqual({ firstFrame: 1, deferred: 0 });
        expect(api.getPinnedTopRowCount(), 'the pinned-row change this counted must have landed').toBe(2);
    });

    // A move reports one change and reads once. Hiding reports two and reads twice, and the second read is
    // the point: narrowing the columns lets the browser clamp `scrollLeft`, and the clamp only lands when a
    // read forces layout, so the first read still holds the pre-clamp position. Neither caching the value
    // nor dropping the second read is safe.
    test('a column refresh reads the scroll position once per reported change', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(50),
            rowData: [{ c0: 1 }],
        });
        await settle();

        const viewport = document.querySelector('.ag-grid-viewport') as HTMLElement;
        expect(viewport, 'grid viewport should be rendered').not.toBeNull();

        const onMove = await countPropertyReads(viewport, 'scrollLeft', () => api.moveColumnByIndex(0, 10));
        expect(onMove, 'scrollLeft reads on a column move').toEqual({ firstFrame: 1, deferred: 0 });

        const ids = api.getAllGridColumns().map((col) => col.getColId());
        const onHide = await countPropertyReads(viewport, 'scrollLeft', () => api.setColumnsVisible(ids, false));
        // The later reads are the horizontal scrollbar's, re-measuring the narrowed scroll width.
        expect(onHide, 'scrollLeft reads on hiding every column').toEqual({ firstFrame: 2, deferred: 3 });
    });

    // What is left is the viewport checks that deliberately measure and report, each resolving one style
    // for both axes. An exact count, so a consumer going back to measuring for itself fails here — and so
    // does the grid stopping measuring at all, which the scrollbar and pinned-overflow rules depend on.
    test('creating a grid measures the viewport an exact number of times', async () => {
        let api: GridApi | undefined;
        const reads = await countViewportMeasurements(() => {
            api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(50), rowData: [{ c0: 1 }] });
        });

        expect(reads, 'getComputedStyle on the grid viewport').toEqual({ firstFrame: 4, deferred: 0 });
        expect(api!.getAllDisplayedColumns(), 'the grid this counted must have built its columns').toHaveLength(50);
    });

    // A scroll handler already holds the position it just read and clamped, so the consumers it drives
    // should be handed it rather than reading it back out of the DOM.
    test('a horizontal scroll reads the scroll position exactly three times', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(200), rowData: [{ c0: 1 }] });
        await settle();
        api.ensureColumnVisible('c60');
        await settle();

        const viewport = document.querySelector('.ag-grid-viewport') as HTMLElement;
        expect(viewport, 'grid viewport should be rendered').not.toBeNull();

        const reads = await countPropertyReads(viewport, 'scrollLeft', () => api.ensureColumnVisible('c120'));

        expect(reads, 'grid viewport scrollLeft reads').toEqual({ firstFrame: 3, deferred: 0 });
        expect(viewport.scrollLeft, 'the scroll this counted must have moved').toBeGreaterThan(0);
    });

    // Pinning changes how much of the viewport the pinned sections claim, and the rule that keeps them
    // narrower than it hides columns to enforce itself. That outcome is kept, so it measures.
    test('a column refresh with pinned columns measures only to keep them inside the viewport', async () => {
        const columnDefs = buildCols(50);
        columnDefs[0].pinned = 'left';
        columnDefs[1].pinned = 'right';

        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData: [{ c0: 1 }] });
        await settle();

        const onMove = await countViewportMeasurements(() => api.moveColumnByIndex(5, 10));
        const onPin = await countViewportMeasurements(() => api.setColumnsPinned(['c2', 'c3'], 'left'));

        expect({ onMove, onPin }).toEqual({
            onMove: { firstFrame: 0, deferred: 0 },
            onPin: { firstFrame: 1, deferred: 0 },
        });
    });

    // A flexed width is kept on the column and escapes as `columnResized`, so the flex pass measures
    // rather than reading the last report: a resize that has not been observed yet would otherwise flex
    // every column to the pre-resize viewport. That is one measurement a flex grid cannot avoid.
    test('a column refresh with a flex column measures once, where the same grid without flex measures none', async () => {
        const flexCols = buildCols(20);
        flexCols[0].flex = 1;

        const plain = gridsManager.createGrid('plain', { columnDefs: buildCols(20), rowData: [{ c0: 1 }] });
        await settle();
        const withoutFlex = await countViewportMeasurements(() => plain.moveColumnByIndex(0, 10));
        gridsManager.reset();

        const flexed = gridsManager.createGrid('flexed', { columnDefs: flexCols, rowData: [{ c0: 1 }] });
        await settle();
        const onMove = await countViewportMeasurements(() => flexed.moveColumnByIndex(0, 10));
        const onHide = await countViewportMeasurements(() => flexed.setColumnsVisible(['c5'], false));

        expect({ withoutFlex, onMove, onHide }).toEqual({
            withoutFlex: { firstFrame: 0, deferred: 0 },
            onMove: { firstFrame: 1, deferred: 0 },
            onHide: { firstFrame: 1, deferred: 0 },
        });
        expect(flexed.getAllDisplayedColumns(), 'the refresh this counted must have happened').toHaveLength(19);
    });
});

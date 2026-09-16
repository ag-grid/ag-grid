import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { afterEach, describe, expect, test } from 'vitest';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ScrollApiModule } from 'ag-grid-community';

const buildCols = (count: number): ColDef[] => {
    const cols: ColDef[] = [];
    for (let i = 0; i < count; ++i) {
        cols.push({ colId: `c${i}`, field: `c${i}` });
    }
    return cols;
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
        await asyncSetTimeout(0);
    } finally {
        Object.defineProperty(owner, prop, original);
    }
    return reads;
};

/** Counts `getComputedStyle` on the grid viewport — each one forces a style recalculation in a browser. */
const countViewportMeasurements = async (act: () => void): Promise<number> => {
    const viewport = document.querySelector('.ag-grid-viewport');
    expect(viewport, 'grid viewport should be rendered').not.toBeNull();

    const original = window.getComputedStyle;
    let count = 0;
    window.getComputedStyle = function (this: Window, ...args: Parameters<typeof original>) {
        if (args[0] === viewport) {
            ++count;
        }
        return original.apply(this, args);
    } as typeof original;

    try {
        act();
        await asyncSetTimeout(0);
    } finally {
        window.getComputedStyle = original;
    }
    return count;
};

describe('Column refresh layout reads', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ScrollApiModule],
    });
    afterEach(() => gridsManager.reset());

    // Every row container, header row and the fake horizontal scrollbar ask the grid body for the viewport
    // width on one column refresh. Measuring per caller cost a 6x style-recalculation regression once.
    test('a column refresh measures the viewport at most once', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(50),
            rowData: [{ c0: 1 }],
        });
        await asyncSetTimeout(0);

        const onMove = await countViewportMeasurements(() => api.moveColumnByIndex(0, 10));
        expect(onMove, 'moveColumnByIndex').toBeLessThanOrEqual(1);

        const onReset = await countViewportMeasurements(() => api.resetColumnState());
        expect(onReset, 'resetColumnState').toBeLessThanOrEqual(1);

        const ids = api.getAllGridColumns().map((col) => col.getColId());
        const onHide = await countViewportMeasurements(() => api.setColumnsVisible(ids, false));
        expect(onHide, 'setColumnsVisible hide').toBeLessThanOrEqual(1);

        const onShow = await countViewportMeasurements(() => api.setColumnsVisible(ids, true));
        expect(onShow, 'setColumnsVisible show').toBeLessThanOrEqual(1);

        // A count of zero is only good news if the refreshes it counted actually happened.
        expect(api.getAllDisplayedColumns()).toHaveLength(50);
    });

    // The fake vertical scrollbar re-reads the viewport height to size its container, and several events
    // report one column change, so the syncs have to coalesce rather than run once per reporting event.
    test('a column refresh syncs the fake vertical scrollbar height at most once', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildCols(50),
            rowData: [{ c0: 1 }],
        });
        await asyncSetTimeout(0);

        const viewport = document.querySelector('.ag-grid-viewport') as HTMLElement;
        expect(viewport, 'grid viewport should be rendered').not.toBeNull();

        const reads = await countPropertyReads(viewport, 'clientHeight', () => api.moveColumnByIndex(0, 10));

        // One sync reads the viewport height once; more than that means the syncs stopped coalescing.
        expect(reads, 'grid viewport clientHeight reads').toBeLessThanOrEqual(2);
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
        await asyncSetTimeout(0);

        const viewport = document.querySelector('.ag-grid-viewport') as HTMLElement;
        expect(viewport, 'grid viewport should be rendered').not.toBeNull();

        const onMove = await countPropertyReads(viewport, 'scrollLeft', () => api.moveColumnByIndex(0, 10));
        expect(onMove, 'scrollLeft reads on a column move').toBe(1);

        const ids = api.getAllGridColumns().map((col) => col.getColId());
        const onHide = await countPropertyReads(viewport, 'scrollLeft', () => api.setColumnsVisible(ids, false));
        expect(onHide, 'scrollLeft reads on hiding every column').toBe(2);
    });

    // Building the grid measures the viewport several times over. The width and the height are two axes of
    // one element, so resolving the style once for both keeps this from doubling.
    test('creating a grid measures the viewport a bounded number of times', async () => {
        const viewportStyleReads = { count: 0 };
        const original = window.getComputedStyle;
        window.getComputedStyle = function (this: Window, ...args: Parameters<typeof original>) {
            if ((args[0] as HTMLElement)?.classList?.contains('ag-grid-viewport')) {
                ++viewportStyleReads.count;
            }
            return original.apply(this, args);
        } as typeof original;

        try {
            gridsManager.createGrid('myGrid', { columnDefs: buildCols(50), rowData: [{ c0: 1 }] });
            await asyncSetTimeout(0);
        } finally {
            window.getComputedStyle = original;
        }

        expect(viewportStyleReads.count, 'getComputedStyle on the grid viewport').toBeLessThanOrEqual(4);
    });

    // A scroll handler already holds the position it just read and clamped, so the consumers it drives
    // should be handed it rather than reading it back out of the DOM.
    test('a horizontal scroll reads the scroll position a bounded number of times', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs: buildCols(200), rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);
        api.ensureColumnVisible('c60');
        await asyncSetTimeout(0);

        const viewport = document.querySelector('.ag-grid-viewport') as HTMLElement;
        expect(viewport, 'grid viewport should be rendered').not.toBeNull();

        const reads = await countPropertyReads(viewport, 'scrollLeft', () => api.ensureColumnVisible('c120'));

        expect(reads, 'grid viewport scrollLeft reads').toBeLessThanOrEqual(3);
    });

    // Pinned columns bring the fake horizontal scrollbar's overflow check into the same refresh.
    test('a column refresh with pinned columns measures the viewport at most once', async () => {
        const columnDefs = buildCols(50);
        columnDefs[0].pinned = 'left';
        columnDefs[1].pinned = 'right';

        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData: [{ c0: 1 }] });
        await asyncSetTimeout(0);

        const onMove = await countViewportMeasurements(() => api.moveColumnByIndex(5, 10));
        expect(onMove, 'moveColumnByIndex').toBeLessThanOrEqual(1);

        const onPin = await countViewportMeasurements(() => api.setColumnsPinned(['c2', 'c3'], 'left'));
        expect(onPin, 'setColumnsPinned').toBeLessThanOrEqual(1);
    });
});

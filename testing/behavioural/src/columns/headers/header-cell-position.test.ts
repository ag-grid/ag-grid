import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { installMockResizeObserver, triggerResizeObservers } from 'ag-test-utils/polyfills/mockResizeObserver';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ScrollApiModule,
    TextFilterModule,
    getGridElement,
} from 'ag-grid-community';

/** The `left` and `width` of every header cell of `colId`, one per header row it is drawn in. */
const headerPositions = (api: GridApi, colId: string) => {
    const header = getGridElement(api)!.querySelector('.ag-header')!;
    const position = (cell: HTMLElement | null) => cell && `${cell.style.left}/${cell.style.width}`;
    const groupCell = Array.from(header.querySelectorAll<HTMLElement>('.ag-header-group-cell')).find((cell) =>
        cell.getAttribute('col-id')!.startsWith(colId)
    );
    return {
        group: position(groupCell ?? null),
        column: position(header.querySelector(`.ag-header-row-column .ag-header-cell[col-id="${colId}"]`)),
        filter: position(header.querySelector(`.ag-header-row-filter .ag-header-cell[col-id="${colId}"]`)),
    };
};

describe('header cell positions', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ScrollApiModule, TextFilterModule],
    });

    afterEach(() => {
        gridsManager.reset();
        mockGridLayout.useRealOffsetDimensions = false;
        mockGridLayout.elementHeightOverride = undefined;
    });

    test('group, column and floating filter cells follow a column resize', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { groupId: 'g', children: [{ field: 'a' }, { field: 'b' }] },
                { groupId: 'h', children: [{ field: 'c' }] },
            ],
            defaultColDef: { width: 100, filter: true, floatingFilter: true },
            rowData: [{ a: 'x', b: 'y', c: 'z' }],
        });
        await waitFor(() => expect(headerPositions(api, 'c').filter).toBe('200px/100px'));
        expect(headerPositions(api, 'g').group).toBe('0px/200px');

        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);

        expect(headerPositions(api, 'g').group).toBe('0px/250px');
        expect(headerPositions(api, 'a')).toMatchObject({ column: '0px/150px', filter: '0px/150px' });
        expect(headerPositions(api, 'b')).toMatchObject({ column: '150px/100px', filter: '150px/100px' });
        expect(headerPositions(api, 'h').group).toBe('250px/100px');
        expect(headerPositions(api, 'c')).toMatchObject({ column: '250px/100px', filter: '250px/100px' });

        api.setColumnsVisible(['b'], false);
        expect(headerPositions(api, 'g').group).toBe('0px/150px');
        expect(headerPositions(api, 'h').group).toBe('150px/100px');

        api.setColumnsVisible(['b'], true);
        expect(headerPositions(api, 'g').group).toBe('0px/250px');
        expect(headerPositions(api, 'h').group).toBe('250px/100px');
    });

    test('a group header is hidden while its columns have no width, including one created so', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { groupId: 'g', children: [{ field: 'a', width: 50, minWidth: 0 }] },
                { groupId: 'z', children: [{ field: 'b', width: 0, minWidth: 0 }] },
            ],
            rowData: [{ a: 1, b: 2 }],
        });
        const hidden = (groupId: string) =>
            Array.from(getGridElement(api)!.querySelectorAll('.ag-header-group-cell'))
                .find((cell) => cell.getAttribute('col-id')!.startsWith(groupId))!
                .classList.contains('ag-hidden');
        await waitFor(() => expect(headerPositions(api, 'z').group).not.toBeNull());
        expect([hidden('g'), hidden('z')]).toEqual([false, true]);

        api.setColumnWidths([{ key: 'a', newWidth: 0 }]);
        expect(hidden('g')).toBe(true);

        api.setColumnWidths([
            { key: 'a', newWidth: 50 },
            { key: 'b', newWidth: 50 },
        ]);
        expect([hidden('g'), hidden('z')]).toEqual([false, false]);
    });

    test('header cells move between the print and normal layouts, a right-pinned one anchored to the left in print', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'p', pinned: 'left', width: 100 },
                { field: 'a', width: 120 },
                { field: 'b' },
                { field: 'r', pinned: 'right', width: 100 },
            ],
            rowData: [{ p: 0, a: 1, b: 2, r: 3 }],
        });
        const anchoring = () => {
            const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-header-cell[col-id="r"]')!;
            return `left:${cell.style.left} right:${cell.style.right}`;
        };
        await waitFor(() => expect(headerPositions(api, 'b').column).toBe('120px/200px'));
        expect(anchoring()).toBe('left: right:0px');

        // print layout draws every lane in one container, so a cell sits after the lanes before it
        api.setGridOption('domLayout', 'print');
        await waitFor(() => expect(headerPositions(api, 'b').column).toBe('220px/200px'));
        expect(anchoring()).toBe('left:420px right:');

        api.setGridOption('domLayout', 'normal');
        await waitFor(() => expect(headerPositions(api, 'b').column).toBe('120px/200px'));
        expect(anchoring()).toBe('left: right:0px');
    });

    test('a header drawn by an animated move starts where its column was and moves into place, unless a later move placed it', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: Array.from({ length: 30 }, (_, i) => ({ colId: `c${i}`, width: 100 })),
            rowData: [{}],
            suppressColumnVirtualisation: false,
        });
        await waitFor(() => expect(headerPositions(api, 'c1').column).toBe('100px/100px'));
        expect(headerPositions(api, 'c25').column).toBeNull();

        api.moveColumns(['c25'], 1);
        expect(headerPositions(api, 'c25').column).toBe('2500px/100px');
        api.moveColumns(['c25'], 2);
        expect(headerPositions(api, 'c25').column).toBe('200px/100px');
        // drawn after `c25`, so it moves into place no sooner
        api.moveColumns(['c26'], 4);
        expect(headerPositions(api, 'c26').column).toBe('2600px/100px');
        await waitFor(() => expect(headerPositions(api, 'c26').column).toBe('400px/100px'));
        expect(headerPositions(api, 'c25').column).toBe('200px/100px');
    });

    test('a header drawn as its moved column scrolls into view starts where its column was', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: Array.from({ length: 30 }, (_, i) => ({ colId: `c${i}`, width: 100 })),
            rowData: [{}],
            suppressColumnVirtualisation: false,
        });
        await waitFor(() => expect(headerPositions(api, 'c1').column).toBe('100px/100px'));

        api.moveColumns(['c1'], 25);
        expect(headerPositions(api, 'c1').column).toBeNull();
        api.ensureColumnVisible('c1');

        expect(headerPositions(api, 'c1').column).toBe('100px/100px');
        await waitFor(() => expect(headerPositions(api, 'c1').column).toBe('2500px/100px'));
    });

    test('a header cell takes the pinned edge styles as the edges move', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'p', pinned: 'left' },
                { field: 'a' },
                { field: 'r', pinned: 'right' },
                { field: 's', pinned: 'right' },
            ],
            rowData: [{}],
        });
        const edges = () =>
            Array.from(getGridElement(api)!.querySelectorAll<HTMLElement>('.ag-header-row-column .ag-header-cell'))
                .filter(
                    (cell) =>
                        cell.classList.contains('ag-header-cell-last-left-pinned') ||
                        cell.classList.contains('ag-header-cell-first-right-pinned')
                )
                .map((cell) => cell.getAttribute('col-id'))
                .sort();
        await waitFor(() => expect(edges()).toEqual(['p', 'r']));

        api.setColumnsPinned(['a'], 'left');
        api.setColumnsPinned(['r'], null);

        expect(edges()).toEqual(['a', 's']);
    });

    test('an auto-height header is measured again as its column is resized', async () => {
        // the header text wraps, so the narrower its cell the taller it is
        mockGridLayout.useRealOffsetDimensions = true;
        mockGridLayout.elementHeightOverride = (el) =>
            el.classList.contains('ag-header-cell-comp-wrapper')
                ? 8000 / Number.parseFloat(el.closest<HTMLElement>('.ag-header-cell')!.style.width)
                : undefined;
        const uninstallResizeObserver = installMockResizeObserver();
        try {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 100, autoHeaderHeight: true }],
                rowData: [{}],
            });
            const a = api.getColumn('a')!;
            await waitFor(() => expect(a.getAutoHeaderHeight()).toBe(80));

            api.setColumnWidths([{ key: 'a', newWidth: 200 }]);
            // the wrapper fills its cell, so only the observer watching it hears the new width
            triggerResizeObservers(getGridElement(api)!.querySelector('.ag-header-cell-comp-wrapper')!);

            await waitFor(() => expect(a.getAutoHeaderHeight()).toBe(40));
        } finally {
            uninstallResizeObserver();
        }
    });

    test('an auto-height header still waiting for its content is not measured once auto header height is off', async () => {
        // a framework that has yet to render into the wrapper leaves it empty, so measuring retries a frame later
        const heights: Record<string, number> = { a: 0, b: 0 };
        mockGridLayout.useRealOffsetDimensions = true;
        mockGridLayout.elementHeightOverride = (el) =>
            el.classList.contains('ag-header-cell-comp-wrapper')
                ? heights[el.closest<HTMLElement>('.ag-header-cell')!.getAttribute('col-id')!]
                : undefined;
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', autoHeaderHeight: true },
                { colId: 'b', autoHeaderHeight: true },
            ],
            rowData: [{}],
        });

        api.setGridOption('columnDefs', [
            { colId: 'a', autoHeaderHeight: false },
            { colId: 'b', autoHeaderHeight: true },
        ]);
        heights.a = 80;
        heights.b = 80;

        // b retries on the same frames as a would
        await waitFor(() => expect(api.getColumn('b')!.getAutoHeaderHeight()).toBe(80));
        expect(api.getColumn('a')!.getAutoHeaderHeight()).toBeNull();
    });
});

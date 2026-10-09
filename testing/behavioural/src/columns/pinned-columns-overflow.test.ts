import { DragEventDispatcher, TestGridsManager, asyncSetTimeout, dispatchGridSizeChanged } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';

import type { ColumnPinnedType, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ScrollApiModule } from 'ag-grid-community';

const overflowingColumnDefs = [
    { field: 'a', pinned: 'left' as const, width: 300 },
    { field: 'b', pinned: 'left' as const, width: 300 },
    { field: 'c', pinned: 'right' as const, width: 300 },
    { field: 'd', pinned: 'right' as const, width: 300 },
    { field: 'e', pinned: 'right' as const, width: 300 },
    { field: 'f', pinned: 'left' as const, width: 300 },
    { field: 'g', flex: 1 },
];

const rowData = [{ a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g' }];

const query = <T extends Element>(selector: string): T => {
    const element = document.querySelector<T>(selector);
    expect(element, `Expected ${selector} to be rendered`).not.toBeNull();
    return element!;
};

describe('Pinned columns wider than the viewport', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ScrollApiModule] });
    let originalGridWidth: number;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        mockGridLayout.gridWidth = 600;
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterAll(() => {
        mockGridLayout.gridWidth = originalGridWidth;
        mockGridLayout.useRealOffsetDimensions = false;
    });

    afterEach(() => {
        mockGridLayout.gridWidth = 600;
        gridsManager.reset();
    });

    test('clips mixed pinned sections without creating a horizontal scroll range', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: overflowingColumnDefs,
            rowData,
            processUnpinnedColumns: () => [],
        });

        await asyncSetTimeout(0);

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);
        expect(viewport.scrollLeft).toBe(0);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('600px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).toBe('1px');
        expect(query<HTMLElement>('.ag-root').classList.contains('ag-body-horizontal-content-no-gap')).toBe(true);

        const headerRows = document.querySelectorAll<HTMLElement>('.ag-header-row');
        expect(headerRows.length).toBeGreaterThan(0);
        expect(Array.from(headerRows, (row) => row.style.width)).toEqual(Array.from(headerRows, () => '600px'));

        const firstRow = query<HTMLElement>('.ag-row');
        expect(query<HTMLElement>('.ag-row > .ag-grid-pinned-left-cells').style.width).toBe('900px');
        expect(query<HTMLElement>('.ag-row > .ag-grid-pinned-right-cells').style.width).toBe('900px');
        expect(firstRow.getBoundingClientRect().left).toBe(viewport.getBoundingClientRect().left);

        expect(api.getColumnState().filter((column) => column.pinned === 'left')).toHaveLength(3);
        expect(api.getColumnState().filter((column) => column.pinned === 'right')).toHaveLength(3);

        api.ensureColumnVisible('g');
        expect(viewport.scrollLeft).toBe(0);
    });

    test('restores normal horizontal sizing when the viewport becomes wide enough', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: overflowingColumnDefs,
            rowData,
            processUnpinnedColumns: () => [],
        });

        await asyncSetTimeout(0);

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);

        dispatchGridSizeChanged(api, 2400);

        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(false);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('2400px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).not.toBe('1px');

        dispatchGridSizeChanged(api, 600);

        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('600px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).toBe('1px');
    });

    test('clips overflowing pinned columns in autoHeight layout', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: overflowingColumnDefs,
            rowData,
            domLayout: 'autoHeight',
            processUnpinnedColumns: () => [],
        });

        await asyncSetTimeout(0);

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('600px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).toBe('1px');

        api.ensureColumnVisible('g');
        expect(viewport.scrollLeft).toBe(0);
    });

    // Print lays every column out at once, so the clipping that applies on screen must not.
    test('does not clip overflowing pinned columns in print layout', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: overflowingColumnDefs,
            rowData,
            processUnpinnedColumns: () => [],
        });
        await asyncSetTimeout(0);

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);

        api.setGridOption('domLayout', 'print');
        await asyncSetTimeout(0);
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(false);

        api.setGridOption('domLayout', 'normal');
        await asyncSetTimeout(0);
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);
    });

    test('keeps the normal scroll range while pinned columns fit in the viewport', async () => {
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', pinned: 'left', width: 300 },
                { field: 'b', width: 500 },
                { field: 'c', width: 500 },
            ],
            rowData,
        });

        await asyncSetTimeout(0);

        expect(query<HTMLElement>('.ag-grid-viewport').classList.contains('ag-pinned-columns-overflow')).toBe(false);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('1300px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).toBe('1300px');
    });
});

describe('Resizing pinned columns wider than the viewport', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnApiModule] });
    let originalGridWidth: number;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        mockGridLayout.gridWidth = 600;
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterAll(() => {
        mockGridLayout.gridWidth = originalGridWidth;
        mockGridLayout.useRealOffsetDimensions = false;
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Returning [] from processUnpinnedColumns keeps 5 x 200px columns pinned in a 600px grid.
    const createGrid = async (columnCount: number, pinned: ColumnPinnedType = 'left'): Promise<GridApi> => {
        const fields = ['a', 'b', 'c', 'd', 'e'].slice(0, columnCount);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: fields.map((field) => ({ field, width: 200 })),
            defaultColDef: { pinned, resizable: true },
            rowData: [{ a: 'a', b: 'b', c: 'c', d: 'd', e: 'e' }],
            processUnpinnedColumns: () => [],
        });
        await asyncSetTimeout(0);
        expect(api.getColumnState().every((column) => column.pinned === pinned)).toBe(true);
        return api;
    };

    const width = (api: GridApi, colId: string): number => api.getColumn(colId)!.getActualWidth();

    const dragResizeBy = async (colId: string, dx: number): Promise<void> => {
        const bar = query<HTMLElement>(`.ag-header-cell[col-id="${colId}"] .ag-header-cell-resize`);
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar, 100, 10);
        await dispatcher.movePointer(bar, 100 + dx, 10);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);
    };

    const pressResizeKey = async (colId: string, key: 'ArrowLeft' | 'ArrowRight'): Promise<void> => {
        const headerCell = query<HTMLElement>(`.ag-header-cell[col-id="${colId}"]`);
        headerCell.focus();
        headerCell.dispatchEvent(new KeyboardEvent('keydown', { key, altKey: true, bubbles: true, cancelable: true }));
        headerCell.dispatchEvent(new KeyboardEvent('keyup', { key, altKey: true, bubbles: true, cancelable: true }));
        await asyncSetTimeout(0);
    };

    test('pinned columns that fit the viewport can be shrunk by mouse and keyboard', async () => {
        const api = await createGrid(2);
        expect(query<HTMLElement>('.ag-grid-viewport').classList.contains('ag-pinned-columns-overflow')).toBe(false);

        await dragResizeBy('a', -60);
        expect(width(api, 'a')).toBeLessThan(200);

        await pressResizeKey('b', 'ArrowLeft');
        expect(width(api, 'b')).toBeLessThan(200);
    });

    test('overflowing pinned columns can be shrunk but not grown, by mouse and keyboard', async () => {
        const api = await createGrid(5);
        expect(query<HTMLElement>('.ag-grid-viewport').classList.contains('ag-pinned-columns-overflow')).toBe(true);

        await dragResizeBy('a', 60);
        expect(width(api, 'a')).toBe(200);
        await dragResizeBy('a', -60);
        expect(width(api, 'a')).toBeLessThan(200);

        await pressResizeKey('b', 'ArrowRight');
        expect(width(api, 'b')).toBe(200);
        await pressResizeKey('b', 'ArrowLeft');
        expect(width(api, 'b')).toBeLessThan(200);
    });

    // Right-pinned columns resize in the opposite direction: dragging or pressing right makes them narrower.
    test('overflowing right-pinned columns can be shrunk but not grown, by mouse and keyboard', async () => {
        const api = await createGrid(5, 'right');
        expect(query<HTMLElement>('.ag-grid-viewport').classList.contains('ag-pinned-columns-overflow')).toBe(true);

        await dragResizeBy('a', -60);
        expect(width(api, 'a')).toBe(200);
        await dragResizeBy('a', 60);
        expect(width(api, 'a')).toBeLessThan(200);

        await pressResizeKey('b', 'ArrowLeft');
        expect(width(api, 'b')).toBe(200);
        await pressResizeKey('b', 'ArrowRight');
        expect(width(api, 'b')).toBeLessThan(200);
    });
});

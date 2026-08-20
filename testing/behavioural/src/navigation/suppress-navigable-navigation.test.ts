import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode } from 'ag-grid-community';

import { dispatchKeyDown, getFocusedColId, getFocusedRowIndex } from './navigation-test-utils';

interface RowData {
    a: string;
    b: string;
    c: string;
}

const rowData: RowData[] = [
    { a: 'a0', b: 'b0', c: 'c0' },
    { a: 'a1', b: 'b1', c: 'c1' },
];

describe('suppressNavigable Navigation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('boolean suppressNavigable', () => {
        // columns: a | b (not navigable) | c
        let api: GridApi<RowData>;

        beforeEach(() => {
            const columnDefs: ColDef<RowData>[] = [
                { field: 'a', colId: 'a' },
                { field: 'b', colId: 'b', suppressNavigable: true },
                { field: 'c', colId: 'c' },
            ];
            api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
            } as GridOptions<RowData>);
        });

        test('right arrow skips non-navigable column', () => {
            api.setFocusedCell(0, 'a');
            dispatchKeyDown(KeyCode.RIGHT);
            expect(getFocusedColId(api)).toBe('c');
            expect(getFocusedRowIndex(api)).toBe(0);
        });

        test('left arrow skips non-navigable column', () => {
            api.setFocusedCell(0, 'c');
            dispatchKeyDown(KeyCode.LEFT);
            expect(getFocusedColId(api)).toBe('a');
            expect(getFocusedRowIndex(api)).toBe(0);
        });

        test('ctrl+right skips non-navigable column', () => {
            api.setFocusedCell(0, 'a');
            dispatchKeyDown(KeyCode.RIGHT, { ctrlKey: true });
            expect(getFocusedColId(api)).toBe('c');
        });

        test('ctrl+left skips non-navigable column', () => {
            api.setFocusedCell(0, 'c');
            dispatchKeyDown(KeyCode.LEFT, { ctrlKey: true });
            expect(getFocusedColId(api)).toBe('a');
        });

        test('Tab skips non-navigable column', () => {
            api.setFocusedCell(0, 'a');
            dispatchKeyDown(KeyCode.TAB);
            expect(getFocusedColId(api)).toBe('c');
            expect(getFocusedRowIndex(api)).toBe(0);
        });

        test('Shift+Tab skips non-navigable column', () => {
            api.setFocusedCell(0, 'c');
            dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
            expect(getFocusedColId(api)).toBe('a');
            expect(getFocusedRowIndex(api)).toBe(0);
        });

        test('right arrow at last navigable column stays put', () => {
            api.setFocusedCell(0, 'c');
            dispatchKeyDown(KeyCode.RIGHT);
            expect(getFocusedColId(api)).toBe('c');
            expect(getFocusedRowIndex(api)).toBe(0);
        });

        test('left arrow at first navigable column stays put', () => {
            api.setFocusedCell(0, 'a');
            dispatchKeyDown(KeyCode.LEFT);
            expect(getFocusedColId(api)).toBe('a');
            expect(getFocusedRowIndex(api)).toBe(0);
        });
    });

    describe('function suppressNavigable', () => {
        // column b is non-navigable only on row 0
        let api: GridApi<RowData>;

        beforeEach(() => {
            const columnDefs: ColDef<RowData>[] = [
                { field: 'a', colId: 'a' },
                { field: 'b', colId: 'b', suppressNavigable: (params) => params.data?.a === 'a0' },
                { field: 'c', colId: 'c' },
            ];
            api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
            } as GridOptions<RowData>);
        });

        test('right arrow skips column on the row where it is suppressed', () => {
            api.setFocusedCell(0, 'a');
            dispatchKeyDown(KeyCode.RIGHT);
            expect(getFocusedColId(api)).toBe('c');
            expect(getFocusedRowIndex(api)).toBe(0);
        });

        test('right arrow does not skip column on row where it is not suppressed', () => {
            api.setFocusedCell(1, 'a');
            dispatchKeyDown(KeyCode.RIGHT);
            expect(getFocusedColId(api)).toBe('b');
            expect(getFocusedRowIndex(api)).toBe(1);
        });

        test('down arrow from a non-navigable cell moves to the same column on the next row', () => {
            // column b is non-navigable on row 0 but navigable on row 1
            api.setFocusedCell(0, 'b');
            dispatchKeyDown(KeyCode.DOWN);
            expect(getFocusedColId(api)).toBe('b');
            expect(getFocusedRowIndex(api)).toBe(1);
        });
    });

    describe('backwards tab out with nowhere to go', () => {
        // AG-16759: the backwards tab-out is reached whenever the walk finds no cell at all, which
        // for a row-dependent suppressNavigable happens from a row that is not the first one.
        let api: GridApi<RowData>;

        beforeEach(() => {
            const columnDefs: ColDef<RowData>[] = [
                { field: 'a', colId: 'a', suppressNavigable: (params) => params.data?.a === 'a0' },
            ];
            api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
            } as GridOptions<RowData>);
        });

        test('Shift+Tab from a non-first row moves focus to the header', () => {
            api.setFocusedCell(1, 'a');
            dispatchKeyDown(KeyCode.TAB, { shiftKey: true });

            const active = document.activeElement as HTMLElement | null;
            expect(active?.classList.contains('ag-header-cell')).toBe(true);
            expect(active?.getAttribute('col-id')).toBe('a');
        });
    });

    describe('forwards tab into the grid with a non-navigable first row', () => {
        // AG-16759: tabbing off the last header cell enters the grid at the FIRST row. When that
        // row is entirely non-navigable the entry walk must continue onto later rows - a purely
        // horizontal walk cannot leave the first row, so focus used to be dropped entirely.
        let api: GridApi<RowData>;

        beforeEach(() => {
            const columnDefs: ColDef<RowData>[] = [
                { field: 'a', colId: 'a', suppressNavigable: (params) => params.data?.a === 'a0' },
                { field: 'b', colId: 'b', suppressNavigable: (params) => params.data?.a === 'a0' },
            ];
            api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData,
            } as GridOptions<RowData>);
        });

        test('Tab from the last header cell focuses the first navigable cell of a later row', async () => {
            api.setFocusedHeader('b');
            await asyncSetTimeout(0);

            dispatchKeyDown(KeyCode.TAB);

            expect(getFocusedRowIndex(api)).toBe(1);
            expect(getFocusedColId(api)).toBe('a');
        });
    });
});

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';
import { dispatchKeyDown, getFocusedColId, getFocusedRowIndex } from './navigation-test-utils';

interface RowData {
    a: string;
    b: string;
    c: string;
}

const columnDefs: ColDef<RowData>[] = [
    { field: 'a', colId: 'a' },
    { field: 'b', colId: 'b' },
    { field: 'c', colId: 'c' },
];

const rowData: RowData[] = [
    { a: 'a0', b: 'b0', c: 'c0' },
    { a: 'a1', b: 'b1', c: 'c1' },
    { a: 'a2', b: 'b2', c: 'c2' },
    { a: 'a3', b: 'b3', c: 'c3' },
];

describe('Page Key Navigation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    let api: GridApi<RowData>;

    beforeEach(() => {
        api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
        } as GridOptions<RowData>);
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // mockGridLayout sets rowHeight=42 and viewport ~84px, giving a page size of 2 rows.

    test('Page Down moves focus down by one page', () => {
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.PAGE_DOWN);
        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('Page Up moves focus up by one page', () => {
        api.setFocusedCell(2, 'a');
        dispatchKeyDown(KeyCode.PAGE_UP);
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('Page Down at last row stays on last row', () => {
        api.setFocusedCell(3, 'a');
        dispatchKeyDown(KeyCode.PAGE_DOWN);
        expect(getFocusedRowIndex(api)).toBe(3);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('Page Up at first row stays on first row', () => {
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.PAGE_UP);
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('a');
    });
});

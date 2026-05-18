import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';
import { mockGridLayout } from '../test-utils/polyfills/mockGridLayout';
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
    let originalGridHeight: number;

    beforeAll(() => {
        // Page-nav reads viewport offset dimensions from the grid; jsdom returns 0 by default
        // so the math degenerates. Opt into real mocked dimensions for this file only.
        mockGridLayout.useRealOffsetDimensions = true;
        // Shrink the viewport so the body holds ~2 rows. The mock's 'viewport' case returns
        // `gridHeight - headerHeight`, and production then subtracts the header offset (~49px)
        // again in getBodyViewportHeight. So gridHeight 164 ⇒ offsetHeight 134 ⇒
        // bodyViewport ~85px ⇒ Page Down/Up moves by 2 rows.
        originalGridHeight = mockGridLayout.gridHeight;
        mockGridLayout.gridHeight = 164;
    });

    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
        mockGridLayout.gridHeight = originalGridHeight;
    });

    beforeEach(() => {
        api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
        } as GridOptions<RowData>);
    });

    afterEach(() => {
        gridsManager.reset();
    });

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

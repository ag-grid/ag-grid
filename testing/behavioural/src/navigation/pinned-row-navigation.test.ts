import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode, PinnedRowModule } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';
import { dispatchKeyDown, getFocusedColId, getFocusedRowIndex, getFocusedRowPinned } from './navigation-test-utils';

interface RowData {
    a: string;
    b: string;
}

const columnDefs: ColDef<RowData>[] = [
    { field: 'a', colId: 'a' },
    { field: 'b', colId: 'b' },
];

// Grid layout:
//   pinned top:    row 0 (rowPinned:'top')
//   body rows:     row 0, row 1 (rowPinned: null)
//   pinned bottom: row 0 (rowPinned:'bottom')
const pinnedTopRowData: RowData[] = [{ a: 'tp0', b: 'tp0b' }];
const bodyRowData: RowData[] = [
    { a: 'b0', b: 'b0b' },
    { a: 'b1', b: 'b1b' },
];
const pinnedBottomRowData: RowData[] = [{ a: 'bp0', b: 'bp0b' }];

describe('Pinned Row Navigation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PinnedRowModule],
    });

    let api: GridApi<RowData>;

    beforeEach(() => {
        api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: bodyRowData,
            pinnedTopRowData,
            pinnedBottomRowData,
        } as GridOptions<RowData>);
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('arrow key section transitions', () => {
        test('down arrow from pinned top row moves to first body row', () => {
            api.setFocusedCell(0, 'a', 'top');
            dispatchKeyDown(KeyCode.DOWN);
            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedRowPinned(api)).toBeNull();
            expect(getFocusedColId(api)).toBe('a');
        });

        test('up arrow from first body row moves to last pinned top row', () => {
            api.setFocusedCell(0, 'a');
            dispatchKeyDown(KeyCode.UP);
            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedRowPinned(api)).toBe('top');
            expect(getFocusedColId(api)).toBe('a');
        });

        test('down arrow from last body row moves to first pinned bottom row', () => {
            api.setFocusedCell(1, 'a');
            dispatchKeyDown(KeyCode.DOWN);
            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedRowPinned(api)).toBe('bottom');
            expect(getFocusedColId(api)).toBe('a');
        });

        test('up arrow from first pinned bottom row moves to last body row', () => {
            api.setFocusedCell(0, 'a', 'bottom');
            dispatchKeyDown(KeyCode.UP);
            expect(getFocusedRowIndex(api)).toBe(1);
            expect(getFocusedRowPinned(api)).toBeNull();
            expect(getFocusedColId(api)).toBe('a');
        });

        test('up arrow at pinned top row stays on pinned top row', () => {
            api.setFocusedCell(0, 'a', 'top');
            dispatchKeyDown(KeyCode.UP);
            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedRowPinned(api)).toBe('top');
        });

        test('down arrow at pinned bottom row stays on pinned bottom row', () => {
            api.setFocusedCell(0, 'a', 'bottom');
            dispatchKeyDown(KeyCode.DOWN);
            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedRowPinned(api)).toBe('bottom');
        });
    });

    describe('ctrl+arrow stays within its section', () => {
        test('ctrl+up from body row moves to first body row, not pinned top', () => {
            api.setFocusedCell(1, 'a');
            dispatchKeyDown(KeyCode.UP, { ctrlKey: true });
            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedRowPinned(api)).toBeNull();
        });

        test('ctrl+down from body row moves to last body row, not pinned bottom', () => {
            api.setFocusedCell(0, 'a');
            dispatchKeyDown(KeyCode.DOWN, { ctrlKey: true });
            expect(getFocusedRowIndex(api)).toBe(1);
            expect(getFocusedRowPinned(api)).toBeNull();
        });

        test('ctrl+up from pinned top row stays in pinned top section', () => {
            api.setFocusedCell(0, 'a', 'top');
            dispatchKeyDown(KeyCode.UP, { ctrlKey: true });
            expect(getFocusedRowPinned(api)).toBe('top');
        });

        test('ctrl+down from pinned bottom row stays in pinned bottom section', () => {
            api.setFocusedCell(0, 'a', 'bottom');
            dispatchKeyDown(KeyCode.DOWN, { ctrlKey: true });
            expect(getFocusedRowPinned(api)).toBe('bottom');
        });
    });

    describe('Tab navigation across pinned sections', () => {
        test('Tab from last cell of pinned top row moves to first cell of first body row', () => {
            api.setFocusedCell(0, 'b', 'top');
            dispatchKeyDown(KeyCode.TAB);
            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedRowPinned(api)).toBeNull();
            expect(getFocusedColId(api)).toBe('a');
        });

        test('Shift+Tab from first cell of first body row moves to last cell of pinned top row', () => {
            api.setFocusedCell(0, 'a');
            dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedRowPinned(api)).toBe('top');
            expect(getFocusedColId(api)).toBe('b');
        });

        test('Tab from last cell of last body row moves to first cell of pinned bottom row', () => {
            api.setFocusedCell(1, 'b');
            dispatchKeyDown(KeyCode.TAB);
            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedRowPinned(api)).toBe('bottom');
            expect(getFocusedColId(api)).toBe('a');
        });

        test('Shift+Tab from first cell of pinned bottom row moves to last cell of last body row', () => {
            api.setFocusedCell(0, 'a', 'bottom');
            dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
            expect(getFocusedRowIndex(api)).toBe(1);
            expect(getFocusedRowPinned(api)).toBeNull();
            expect(getFocusedColId(api)).toBe('b');
        });

        test('Tab at last cell of pinned bottom row stays on grid', () => {
            api.setFocusedCell(0, 'b', 'bottom');
            dispatchKeyDown(KeyCode.TAB);
            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedRowPinned(api)).toBe('bottom');
            expect(getFocusedColId(api)).toBe('b');
        });

        test('Shift+Tab at first cell of pinned top row stays on grid', () => {
            api.setFocusedCell(0, 'a', 'top');
            dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedRowPinned(api)).toBe('top');
            expect(getFocusedColId(api)).toBe('a');
        });
    });
});

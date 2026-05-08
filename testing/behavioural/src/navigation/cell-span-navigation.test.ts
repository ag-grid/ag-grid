import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { CellSpanModule, ClientSideRowModelModule, KeyCode } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';
import { dispatchKeyDown, getFocusedColId, getFocusedRowIndex } from './navigation-test-utils';

interface RowData {
    name: string;
    value: number;
}

// Grid layout:
//   Row 0: name='A', value=1  ─┐  'A' spans rows 0-1 on col 'name'
//   Row 1: name='A', value=2  ─┘
//   Row 2: name='B', value=3      (non-spanning)
const columnDefs: ColDef<RowData>[] = [
    { field: 'name', colId: 'name', spanRows: true },
    { field: 'value', colId: 'value' },
];

const rowData: RowData[] = [
    { name: 'A', value: 1 },
    { name: 'A', value: 2 },
    { name: 'B', value: 3 },
];

describe('CellSpan Arrow Key Navigation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSpanModule],
    });

    let api: GridApi<RowData>;

    beforeEach(() => {
        api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            enableCellSpan: true,
        } as GridOptions<RowData>);
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('Arrow Down from span head skips entire span to next item', () => {
        // The span treats rows 0-1 as a single unit. Down from the head (row 0)
        // jumps past the whole span and lands on the first row after it (row 2).
        api.setFocusedCell(0, 'name');
        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('name');
    });

    test('Arrow Down from last span row exits span', () => {
        api.setFocusedCell(1, 'name');
        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('name');
    });

    test('Arrow Up into span from below lands at last row of span', () => {
        api.setFocusedCell(2, 'name');
        dispatchKeyDown(KeyCode.UP);
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('name');
    });

    test('Arrow Up from within span jumps above the entire span', () => {
        // The span is treated as a unit for vertical navigation. Up from any row inside
        // the span tries to go above row 0 (the span head). With no rows above, the grid
        // focuses the header; cell focus remains at row 1.
        api.setFocusedCell(1, 'name');
        dispatchKeyDown(KeyCode.UP);
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('name');
    });

    test('Arrow Down past span then Up re-enters span at last row', () => {
        // Down from span head (row 0) exits the span to row 2.
        // Up from row 2 enters the span at its last row (row 1), not the head.
        api.setFocusedCell(0, 'name');
        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedRowIndex(api)).toBe(2);
        dispatchKeyDown(KeyCode.UP);
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('name');
    });
});

describe('CellSpan Tab Navigation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSpanModule],
    });

    let api: GridApi<RowData>;

    beforeEach(() => {
        api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            enableCellSpan: true,
        } as GridOptions<RowData>);
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('Tab from last column of row 0 enters span at row 1', () => {
        // Tabbing past the last column wraps to the first column of the next row.
        // Row 1, col 'name' is covered by the span so the SpannedCellCtrl is focused
        // with its internal position set to row 1.
        api.setFocusedCell(0, 'value');
        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('name');
    });

    test('Shift+Tab from start of spanned row goes to previous column', () => {
        // The SpannedCellCtrl stores focusedCellPosition=row1 from the previous
        // Tab test setup. Shift+Tab from (1, name) should go to (0, value).
        api.setFocusedCell(1, 'name');
        dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('value');
    });

    test('Tab from within span moves to next column at same row', () => {
        api.setFocusedCell(0, 'name');
        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('value');
    });
});

import type { ColDef, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode, getGridElement } from 'ag-grid-community';

import { dispatchKeyDown, getFocusedColId, getFocusedRowIndex } from '../navigation/navigation-test-utils';
import { TestGridsManager } from '../test-utils';

interface RowData {
    a: string;
    b: string;
}

// Grid layout (row 0 has col 'a' spanning 2 rows visually):
//   Row 0: a spans rows 0-1 visually, b='b0'
//   Row 1: a='a1' (overlapped by span), b='b1'
//   Row 2: a='a2', b='b2'
//
// Note: legacy rowSpan is purely visual — all cells still exist and are navigable.
// suppressRowTransform is required to use rowSpan.

const ROW_HEIGHT = 40;

function makeGrid(gridsManager: TestGridsManager) {
    return gridsManager.createGrid('myGrid', {
        rowHeight: ROW_HEIGHT,
        suppressRowTransform: true,
        columnDefs: [
            {
                field: 'a',
                colId: 'a',
                rowSpan: (params) => (params.node!.rowIndex === 0 ? 2 : 1),
            },
            { field: 'b', colId: 'b' },
        ] as ColDef<RowData>[],
        rowData: [
            { a: 'a0', b: 'b0' },
            { a: 'a1', b: 'b1' },
            { a: 'a2', b: 'b2' },
        ],
    } as GridOptions<RowData>);
}

describe('Legacy rowSpan rendering', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('grid renders without error when rowSpan is configured', () => {
        const api = makeGrid(gridsManager);
        expect(api.getDisplayedRowCount()).toBe(3);
    });

    test('row-spanning cell has correct inline height', () => {
        const api = makeGrid(gridsManager);
        const gridEl = getGridElement(api)!;
        const spanningCell = gridEl.querySelector('[row-index="0"] [col-id="a"]') as HTMLElement | null;
        expect(spanningCell).not.toBeNull();
        // rowSpan=2 → height = ROW_HEIGHT * 2
        expect(spanningCell!.style.height).toBe(`${ROW_HEIGHT * 2}px`);
    });

    test('non-spanning cell on the same row has normal height', () => {
        const api = makeGrid(gridsManager);
        const gridEl = getGridElement(api)!;
        const normalCell = gridEl.querySelector('[row-index="0"] [col-id="b"]') as HTMLElement | null;
        expect(normalCell).not.toBeNull();
        // col 'b' has no rowSpan so no inline height override
        expect(normalCell!.style.height).toBe('');
    });
});

describe('Legacy rowSpan keyboard navigation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('Arrow Down from row-spanning cell visits the next row normally', () => {
        // Legacy rowSpan is visual-only: all cells still exist and navigation is unchanged.
        const api = makeGrid(gridsManager);
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('Arrow Down from covered row moves to next row', () => {
        const api = makeGrid(gridsManager);
        api.setFocusedCell(1, 'a');
        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('Arrow Up from covered row returns to the spanning row', () => {
        const api = makeGrid(gridsManager);
        api.setFocusedCell(1, 'a');
        dispatchKeyDown(KeyCode.UP);
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('Tab navigation is unaffected by rowSpan', () => {
        const api = makeGrid(gridsManager);
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('b');
    });
});

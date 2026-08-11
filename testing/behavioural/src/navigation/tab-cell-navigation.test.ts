import type { CellFocusedEvent, ColDef, GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';
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
];

describe('Tab Cell Navigation', () => {
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

    test('Tab moves focus to next column in same row', () => {
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedColId(api)).toBe('b');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('Tab at last column wraps to first column of next row', () => {
        api.setFocusedCell(0, 'c');
        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('Shift+Tab moves focus to previous column', () => {
        api.setFocusedCell(0, 'b');
        dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
        expect(getFocusedColId(api)).toBe('a');
        expect(getFocusedRowIndex(api)).toBe(0);
    });

    test('Shift+Tab at first column wraps to last column of previous row', () => {
        api.setFocusedCell(1, 'a');
        dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('c');
    });

    test('Tab at last cell of last row does not move focus off grid', () => {
        api.setFocusedCell(2, 'c');
        dispatchKeyDown(KeyCode.TAB);
        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('c');
    });

    test('Shift+Tab at first cell of first row does not move focus off grid', () => {
        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('Tab off last cell of grid does not re-fire cellFocused', async () => {
        const focusedCols: (string | undefined)[] = [];
        api.addEventListener('cellFocused', (e: CellFocusedEvent) => {
            const col = e.column;
            focusedCols.push(typeof col === 'string' ? col : col?.getColId());
        });

        api.setFocusedCell(2, 'c');
        await asyncSetTimeout(0);
        const focusEventsAfterInitialFocus = focusedCols.length;

        dispatchKeyDown(KeyCode.TAB);
        await asyncSetTimeout(0);

        expect(focusedCols.length).toBe(focusEventsAfterInitialFocus);
    });

    test('Tab off last cell whose renderer child holds focus re-anchors focus to the cell', async () => {
        api.setGridOption('columnDefs', [
            { field: 'a', colId: 'a' },
            { field: 'b', colId: 'b' },
            { field: 'c', colId: 'c', cellRenderer: (p: ICellRendererParams) => `<button>${p.value}</button>` },
        ]);
        await asyncSetTimeout(0);

        const focusedCols: (string | undefined)[] = [];
        api.addEventListener('cellFocused', (e: CellFocusedEvent) => {
            const col = e.column;
            focusedCols.push(typeof col === 'string' ? col : col?.getColId());
        });

        api.setFocusedCell(2, 'c');
        await asyncSetTimeout(0);

        const button = Array.from(document.querySelectorAll('button')).find((b) => b.textContent === 'c2');
        if (!button) {
            throw new Error('Expected a focusable button in the last cell');
        }
        button.focus();
        const focusEventsBeforeTab = focusedCols.length;

        dispatchKeyDown(KeyCode.TAB);
        await asyncSetTimeout(0);

        // focus was on the button, not the cell itself, so Tab must pull it back to the cell to
        // anchor native exit rather than moving between the cell's focusable descendants.
        expect(focusedCols.length).toBe(focusEventsBeforeTab + 1);
        expect(focusedCols[focusedCols.length - 1]).toBe('c');
    });
});
